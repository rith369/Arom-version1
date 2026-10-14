import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  MAX_CANCEL_REASON,
  type AppointmentsResponse,
  type UserAppointment,
} from "@/lib/appointments";
import { createClient } from "@/lib/supabase/server";
import { fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM appointments controller: the signed in user's own bookings.
 * Runs as the user, so RLS returns only their appointments. Professionals
 * manage theirs in /pro (pro-controller.ts).
 */

const COLUMNS =
  "id, user_id, starts_at, ends_at, session_type, status, meeting_url, intake_note, cancelled_by, cancel_reason, rescheduled_from, reschedule_reason, share_survey, share_symptom_checks, professional_id, professional:professional_profiles(slug, display_name, display_name_km, title, title_km, photo_url)";

interface ProfessionalRow {
  slug: string;
  display_name: string;
  display_name_km: string | null;
  title: string;
  title_km: string | null;
  photo_url: string | null;
}

interface AppointmentRow {
  id: string;
  user_id: string;
  starts_at: string;
  ends_at: string;
  session_type: UserAppointment["sessionType"];
  status: UserAppointment["status"];
  meeting_url: string | null;
  intake_note: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  rescheduled_from: string | null;
  reschedule_reason: string | null;
  share_survey: boolean;
  share_symptom_checks: boolean;
  professional_id: string;
  professional: ProfessionalRow | ProfessionalRow[] | null;
}

function toAppointment(row: AppointmentRow): UserAppointment {
  const professional = Array.isArray(row.professional) ? row.professional[0] : row.professional;
  return {
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    durationMinutes: Math.round((Date.parse(row.ends_at) - Date.parse(row.starts_at)) / 60_000),
    sessionType: row.session_type,
    status: row.status,
    meetingUrl: row.session_type === "online" ? row.meeting_url : null,
    intakeNote: row.intake_note ?? "",
    cancelledBy:
      row.status !== "cancelled" || !row.cancelled_by
        ? null
        : row.cancelled_by === row.user_id
          ? "you"
          : row.cancelled_by === row.professional_id
            ? "professional"
            : "admin",
    cancelReason: row.cancel_reason ?? "",
    rescheduledFrom: row.rescheduled_from,
    rescheduleReason: row.reschedule_reason ?? "",
    shareSurvey: row.share_survey,
    shareSymptomChecks: row.share_symptom_checks,
    professional: professional
      ? {
          slug: professional.slug,
          name: professional.display_name,
          kmName: professional.display_name_km ?? "",
          title: professional.title,
          kmTitle: professional.title_km ?? "",
          photoUrl: professional.photo_url ?? "",
        }
      : null,
  };
}

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

async function loadAppointments(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(COLUMNS)
    .eq("user_id", userId)
    .order("starts_at", { ascending: false })
    .limit(200)
    .returns<AppointmentRow[]>();
  if (error) return null;
  return (data ?? []).map(toAppointment);
}

/** GET /api/appointments: the caller's own appointments, newest first. */
export async function listMyAppointments() {
  const session = await signedIn();
  if (!session) return unauthorized();

  const appointments = await loadAppointments(session.supabase, session.userId);
  if (!appointments) return fail("server_error", "We could not load your appointments.", 500);
  return json<AppointmentsResponse>({ appointments });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel"), reason: z.string().trim().max(MAX_CANCEL_REASON).default("") }),
  z.object({ action: z.literal("sharing"), shareSurvey: z.boolean(), shareSymptomChecks: z.boolean() }),
]);

/** POST /api/appointments/:id  body `{ action: "cancel", reason? }` or `{ action: "sharing", ... }` */
export async function updateMyAppointment(request: NextRequest, appointmentId: string) {
  const session = await signedIn();
  if (!session) return unauthorized();
  const { supabase, userId } = session;

  const id = z.string().uuid().safeParse(appointmentId);
  const body = actionSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, status, starts_at")
    .eq("id", id.data)
    .eq("user_id", userId)
    .maybeSingle();
  if (!appointment) return fail("invalid_input", "Appointment not found.", 404);

  if (body.data.action === "cancel") {
    if (appointment.status !== "booked" || Date.parse(appointment.starts_at) <= Date.now()) {
      return fail("invalid_input", "Only upcoming sessions can be cancelled.", 400);
    }
    const { error } = await supabase.rpc("cancel_appointment", {
      p_appointment_id: id.data,
      p_reason: body.data.reason || null,
    });
    if (error) return fail("invalid_input", error.message, 400);
  } else {
    // Sharing is the user's own choice, and can be turned off at any time.
    const { error } = await supabase.rpc("set_appointment_sharing", {
      p_appointment_id: id.data,
      p_share_survey: body.data.shareSurvey,
      p_share_symptom_checks: body.data.shareSymptomChecks,
    });
    if (error) return fail("invalid_input", error.message, 400);
  }

  const appointments = await loadAppointments(supabase, userId);
  return json<AppointmentsResponse>({ appointments: appointments ?? [] });
}

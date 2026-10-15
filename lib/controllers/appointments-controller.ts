import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  MAX_CANCEL_REASON,
  MAX_RESCHEDULE_REASON,
  type AppointmentsResponse,
  type MoveTimesResponse,
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
  "id, user_id, starts_at, ends_at, session_type, status, meeting_url, intake_note, cancelled_by, cancel_reason, rescheduled_from, reschedule_reason, rescheduled_by, share_survey, share_symptom_checks, series_id, professional_id, professional:professional_profiles(slug, display_name, display_name_km, title, title_km, photo_url)";

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
  rescheduled_by: string | null;
  share_survey: boolean;
  share_symptom_checks: boolean;
  series_id: string | null;
  professional_id: string;
  professional: ProfessionalRow | ProfessionalRow[] | null;
}

function toAppointment(row: AppointmentRow, changeUntil: Map<string, string>): UserAppointment {
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
    rescheduledBy: !row.rescheduled_from ? null : row.rescheduled_by === row.user_id ? "you" : "professional",
    changeTimeUntil: changeUntil.get(row.id) ?? null,
    shareSurvey: row.share_survey,
    shareSymptomChecks: row.share_symptom_checks,
    seriesId: row.series_id,
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
  const [{ data, error }, deadlines] = await Promise.all([
    supabase
      .from("appointments")
      .select(COLUMNS)
      .eq("user_id", userId)
      .order("starts_at", { ascending: false })
      .limit(200)
      .returns<AppointmentRow[]>(),
    // The professional's schedule is private, so only the deadline comes back.
    supabase.rpc("my_change_time_deadlines"),
  ]);
  if (error) return null;
  const changeUntil = new Map(
    ((deadlines.data ?? []) as { appointment_id: string; change_until: string }[]).map((row) => [
      row.appointment_id,
      row.change_until,
    ]),
  );
  return (data ?? []).map((row) => toAppointment(row, changeUntil));
}

/** GET /api/appointments: the caller's own appointments, newest first. */
export async function listMyAppointments() {
  const session = await signedIn();
  if (!session) return unauthorized();

  const appointments = await loadAppointments(session.supabase, session.userId);
  if (!appointments) return fail("server_error", "We could not load your appointments.", 500);
  return json<AppointmentsResponse>({ appointments });
}

/**
 * GET /api/appointments/:id/open-times: the professional's open times this
 * upcoming session can move to (same session type, minimum notice applied by
 * public_open_slots).
 */
export async function listMoveTimes(appointmentId: string) {
  const session = await signedIn();
  if (!session) return unauthorized();
  const { supabase, userId } = session;

  const id = z.string().uuid().safeParse(appointmentId);
  if (!id.success) return invalidInput();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("status, starts_at, session_type, professional:professional_profiles(slug)")
    .eq("id", id.data)
    .eq("user_id", userId)
    .maybeSingle<{
      status: UserAppointment["status"];
      starts_at: string;
      session_type: UserAppointment["sessionType"];
      professional: { slug: string } | { slug: string }[] | null;
    }>();
  if (!appointment) return fail("invalid_input", "Appointment not found.", 404);
  if (appointment.status !== "booked" || Date.parse(appointment.starts_at) <= Date.now()) {
    return fail("invalid_input", "Only upcoming sessions can be moved.", 400);
  }

  const professional = Array.isArray(appointment.professional) ? appointment.professional[0] : appointment.professional;
  if (!professional) return json<MoveTimesResponse>({ times: [] });

  const { data, error } = await supabase.rpc("public_open_slots", { p_slug: professional.slug });
  if (error) return fail("server_error", "We could not load open times.", 500);

  const times = ((data ?? []) as { id: string; starts_at: string; ends_at: string; session_types: string[] }[])
    .filter((row) => row.session_types.includes(appointment.session_type))
    .map((row) => ({ id: row.id, startsAt: row.starts_at, endsAt: row.ends_at }));
  return json<MoveTimesResponse>({ times });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel"), reason: z.string().trim().max(MAX_CANCEL_REASON).default("") }),
  z.object({ action: z.literal("sharing"), shareSurvey: z.boolean(), shareSymptomChecks: z.boolean() }),
  z.object({
    action: z.literal("reschedule"),
    slotId: z.string().uuid(),
    reason: z.string().trim().max(MAX_RESCHEDULE_REASON).default(""),
  }),
]);

/**
 * POST /api/appointments/:id  body `{ action: "cancel", reason? }`,
 * `{ action: "sharing", ... }` or `{ action: "reschedule", slotId, reason? }`
 */
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
  } else if (body.data.action === "reschedule") {
    if (appointment.status !== "booked" || Date.parse(appointment.starts_at) <= Date.now()) {
      return fail("invalid_input", "Only upcoming sessions can be moved.", 400);
    }
    // client_reschedule_appointment() checks the time is still open, the
    // same professional and session type, and the minimum notice.
    const { error } = await supabase.rpc("client_reschedule_appointment", {
      p_appointment_id: id.data,
      p_slot_id: body.data.slotId,
      p_reason: body.data.reason || null,
    });
    // The database messages are written for users ("This time is no longer available").
    if (error) return fail("invalid_input", error.message, 409);
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

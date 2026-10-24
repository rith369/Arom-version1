import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  MAX_CLINIC_NOTE,
  MAX_DESK_ANSWER,
  MAX_DESK_CANCEL_REASON,
  MAX_DESK_MOVE_REASON,
  type ClinicBookingInfo,
  type ClinicDesk,
  type ClinicSessionType,
  type ClinicTherapist,
  type DeskData,
  type DeskRequest,
  type DeskTherapist,
  type DeskTime,
  type MyClinicRequest,
  type MyClinicRequestsResponse,
} from "@/lib/clinic-booking";
import { uuidSchema } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { databaseError, fail, invalidInput, json, readJson } from "./shared";
import { requireRole } from "./role-controller";

/*
 * AROM clinic bookings (BACKEND-HANDOFF.md section 34). Students book a
 * clinic; the clinic desk answers. Every rule (UP only, one booking per
 * time, desk membership, anonymous names) is checked in the database
 * functions, which run as the caller.
 */

const slugSchema = z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80);
const isoSchema = z.string().datetime({ offset: true });

/** Any signed in, active account. Suspended accounts are refused. */
function signedIn() {
  return requireRole("user", "professional", "admin");
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

interface TherapistRow {
  slug: string;
  display_name: string;
  display_name_km: string | null;
  title: string;
  title_km: string | null;
  bio: string | null;
  bio_km: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  years_experience: number | null;
  gender: ClinicTherapist["gender"];
}

function toTherapist(row: TherapistRow): ClinicTherapist {
  return {
    slug: row.slug,
    name: row.display_name,
    kmName: row.display_name_km ?? "",
    title: row.title,
    kmTitle: row.title_km ?? "",
    about: row.bio ?? "",
    kmAbout: row.bio_km ?? "",
    photoUrl: row.photo_url ?? "",
    specialties: row.specialties ?? [],
    languages: row.languages ?? [],
    yearsExperience: row.years_experience,
    gender: row.gender,
  };
}

/**
 * GET /api/clinics/:slug/booking: the clinic's therapists and upcoming
 * times. Empty for a UP only clinic unless the caller is a UP account.
 */
export async function getClinicBooking(slug: string) {
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return invalidInput();

  const supabase = await createClient();
  const [clinic, therapists, times] = await Promise.all([
    supabase
      .from("clinics")
      .select("session_types, booking_days, booking_times")
      .eq("slug", parsed.data)
      .maybeSingle<{ session_types: ClinicSessionType[]; booking_days: number[]; booking_times: string[] }>(),
    supabase.rpc("clinic_therapists", { p_slug: parsed.data }),
    supabase.rpc("clinic_open_times", { p_slug: parsed.data }),
  ]);
  if (clinic.error || therapists.error || times.error) {
    return fail("server_error", "We could not load this clinic.", 500);
  }
  const timeRows = (times.data ?? []) as { starts_at: string; ends_at: string; is_full: boolean }[];

  return json<ClinicBookingInfo>({
    // A UP only clinic returns no times to anyone else, so Book stays hidden.
    takesBookings:
      !!clinic.data &&
      clinic.data.booking_days.length > 0 &&
      clinic.data.booking_times.length > 0 &&
      timeRows.length > 0,
    sessionTypes: clinic.data?.session_types ?? [],
    therapists: ((therapists.data ?? []) as TherapistRow[]).map(toTherapist),
    times: timeRows.map((row) => ({
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      isFull: row.is_full,
    })),
  });
}

const requestSchema = z.object({
  sessionType: z.enum(["online", "in_person"]),
  therapistGender: z.enum(["female", "male", "any"]),
  times: z.array(isoSchema).min(1).max(12),
  note: z.string().trim().max(MAX_CLINIC_NOTE).default(""),
});

/** POST /api/clinics/:slug/requests */
export async function createClinicRequest(request: NextRequest, slug: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;

  const parsedSlug = slugSchema.safeParse(slug);
  const body = requestSchema.safeParse(await readJson(request));
  if (!parsedSlug.success || !body.success) return invalidInput();

  const { data, error } = await guard.supabase.rpc("request_clinic_booking", {
    p_slug: parsedSlug.data,
    p_session_type: body.data.sessionType,
    p_therapist_gender: body.data.therapistGender,
    p_times: body.data.times,
    p_note: body.data.note || null,
  });
  if (error) return databaseError(error, "We could not send your request. Please try again.");

  return json({ id: data as string }, 201);
}

interface MyRequestRow {
  id: string;
  session_type: MyClinicRequest["sessionType"];
  therapist_gender: MyClinicRequest["therapistGender"];
  times: string[];
  note: string | null;
  status: MyClinicRequest["status"];
  answer_note: string | null;
  created_at: string;
  appointment_id: string | null;
  clinic: { slug: string; name: string; name_km: string | null } | { slug: string; name: string; name_km: string | null }[] | null;
}

/** GET /api/clinic-requests: the caller's own clinic requests, newest first. */
export async function listMyClinicRequests() {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;

  const { data, error } = await guard.supabase
    .from("clinic_booking_requests")
    .select("id, session_type, therapist_gender, times, note, status, answer_note, created_at, appointment_id, clinic:clinics(slug, name, name_km)")
    .eq("user_id", guard.userId)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<MyRequestRow[]>();
  if (error) return fail("server_error", "We could not load your clinic requests.", 500);

  const requests: MyClinicRequest[] = (data ?? []).map((row) => {
    const clinic = Array.isArray(row.clinic) ? row.clinic[0] : row.clinic;
    return {
      id: row.id,
      clinicSlug: clinic?.slug ?? "",
      clinicName: clinic?.name ?? "",
      clinicKmName: clinic?.name_km ?? "",
      sessionType: row.session_type,
      therapistGender: row.therapist_gender,
      times: row.times,
      note: row.note ?? "",
      status: row.status,
      answerNote: row.answer_note ?? "",
      createdAt: row.created_at,
      appointmentId: row.appointment_id,
    };
  });
  return json<MyClinicRequestsResponse>({ requests });
}

/** POST /api/clinic-requests/:id/cancel: only while it is waiting. */
export async function cancelMyClinicRequest(requestId: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(requestId);
  if (!id.success) return invalidInput();

  const { error } = await guard.supabase.rpc("cancel_clinic_request", { p_request_id: id.data });
  if (error) return databaseError(error, "We could not cancel this request. Please try again.");
  return json({ ok: true });
}

// ---------------------------------------------------------------------------
// Clinic desk
// ---------------------------------------------------------------------------

async function myDesks(supabase: Awaited<ReturnType<typeof createClient>>): Promise<ClinicDesk[] | null> {
  const { data, error } = await supabase.rpc("my_clinic_desks");
  if (error) return null;
  return ((data ?? []) as { clinic_slug: string; clinic_name: string; clinic_name_km: string | null }[]).map(
    (row) => ({ slug: row.clinic_slug, name: row.clinic_name, kmName: row.clinic_name_km ?? "" }),
  );
}

/** GET /api/clinic-desk: the clinics the caller answers bookings for (often none). */
export async function listMyDesks() {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;

  const desks = await myDesks(guard.supabase);
  if (!desks) return fail("server_error", "We could not load your clinic desk.", 500);
  return json({ desks });
}

/** GET /api/clinic-desk/:slug: requests, therapists and the time table. */
export async function getDesk(slug: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return invalidInput();

  const desk = (await myDesks(guard.supabase))?.find((item) => item.slug === parsed.data);
  if (!desk) return fail("forbidden", "You do not have access to this clinic desk.", 403);

  const [requests, therapists, schedule] = await Promise.all([
    guard.supabase.rpc("clinic_desk_requests", { p_slug: parsed.data }),
    guard.supabase.rpc("clinic_desk_therapists", { p_slug: parsed.data }),
    guard.supabase.rpc("clinic_desk_schedule", { p_slug: parsed.data }),
  ]);
  if (requests.error || therapists.error || schedule.error) {
    return fail("server_error", "We could not load the clinic desk.", 500);
  }

  return json<DeskData>({
    desk,
    requests: (
      (requests.data ?? []) as {
        id: string;
        reference: string;
        client_name: string;
        session_type: DeskRequest["sessionType"];
        therapist_gender: DeskRequest["therapistGender"];
        times: string[];
        note: string;
        status: DeskRequest["status"];
        answer_note: string;
        created_at: string;
        answered_at: string | null;
        appointment_id: string | null;
        booked_at: string | null;
        therapist_name: string | null;
        appointment_status: DeskRequest["appointmentStatus"];
      }[]
    ).map((row) => ({
      id: row.id,
      reference: row.reference,
      clientName: row.client_name,
      sessionType: row.session_type,
      therapistGender: row.therapist_gender,
      times: row.times,
      note: row.note,
      status: row.status,
      answerNote: row.answer_note,
      createdAt: row.created_at,
      answeredAt: row.answered_at,
      appointmentId: row.appointment_id,
      bookedAt: row.booked_at,
      therapistName: row.therapist_name,
      appointmentStatus: row.appointment_status,
    })),
    therapists: (
      (therapists.data ?? []) as { id: string; display_name: string; title: string; gender: DeskTherapist["gender"] }[]
    ).map((row) => ({ id: row.id, name: row.display_name, title: row.title, gender: row.gender })),
    schedule: (
      (schedule.data ?? []) as {
        starts_at: string;
        ends_at: string;
        state: DeskTime["state"];
        appointment_id: string | null;
        session_type: DeskTime["sessionType"];
        therapist_name: string | null;
        client_name: string | null;
      }[]
    ).map((row) => ({
      startsAt: row.starts_at,
      endsAt: row.ends_at,
      state: row.state,
      appointmentId: row.appointment_id,
      sessionType: row.session_type,
      therapistName: row.therapist_name,
      clientName: row.client_name,
    })),
  });
}

const deskRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("confirm"),
    startsAt: isoSchema,
    therapistId: z.string().uuid(),
    meetingUrl: z.string().trim().max(500).default(""),
  }),
  z.object({ action: z.literal("decline"), note: z.string().trim().max(MAX_DESK_ANSWER).default("") }),
]);

/** POST /api/clinic-desk/:slug/requests/:id  body `{ action: "confirm" | "decline", ... }` */
export async function answerDeskRequest(request: NextRequest, requestId: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(requestId);
  const body = deskRequestSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { error } =
    body.data.action === "confirm"
      ? await guard.supabase.rpc("clinic_desk_confirm", {
          p_request_id: id.data,
          p_starts_at: body.data.startsAt,
          p_therapist_id: body.data.therapistId,
          p_meeting_url: body.data.meetingUrl || null,
        })
      : await guard.supabase.rpc("clinic_desk_decline", {
          p_request_id: id.data,
          p_note: body.data.note || null,
        });
  if (error) return databaseError(error, "That could not be saved. Please try again.");
  return json({ ok: true });
}

const fullSchema = z.object({ startsAt: isoSchema, full: z.boolean() });

/** POST /api/clinic-desk/:slug/times  body `{ startsAt, full }` */
export async function setDeskTimeFull(request: NextRequest, slug: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;

  const parsed = slugSchema.safeParse(slug);
  const body = fullSchema.safeParse(await readJson(request));
  if (!parsed.success || !body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("clinic_desk_set_full", {
    p_slug: parsed.data,
    p_starts_at: body.data.startsAt,
    p_full: body.data.full,
  });
  if (error) return databaseError(error, "That could not be saved. Please try again.");
  return json({ ok: true });
}

const deskBookingSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel"), reason: z.string().trim().min(1).max(MAX_DESK_CANCEL_REASON) }),
  z.object({
    action: z.literal("move"),
    startsAt: isoSchema,
    reason: z.string().trim().min(1).max(MAX_DESK_MOVE_REASON),
  }),
]);

/** POST /api/clinic-desk/:slug/bookings/:id  body `{ action: "cancel" | "move", ... }` */
export async function changeDeskBooking(request: NextRequest, appointmentId: string) {
  const guard = await signedIn();
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(appointmentId);
  const body = deskBookingSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { error } =
    body.data.action === "cancel"
      ? await guard.supabase.rpc("clinic_desk_cancel", { p_appointment_id: id.data, p_reason: body.data.reason })
      : await guard.supabase.rpc("clinic_desk_move", {
          p_appointment_id: id.data,
          p_starts_at: body.data.startsAt,
          p_reason: body.data.reason,
        });
  if (error) return databaseError(error, "That could not be saved. Please try again.");
  return json({ ok: true });
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminClinic {
  id: string;
  slug: string;
  name: string;
}

/** GET /api/admin/clinics: clinics, and which accounts work at a clinic desk. */
export async function listAdminClinics() {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const [clinics, staff] = await Promise.all([
    guard.supabase.from("clinics").select("id, slug, name").not("slug", "is", null).order("name"),
    guard.supabase.from("clinic_staff").select("clinic_id, user_id"),
  ]);
  if (clinics.error || staff.error) return fail("server_error", "We could not load clinics.", 500);

  return json({
    clinics: (clinics.data ?? []) as AdminClinic[],
    staff: ((staff.data ?? []) as { clinic_id: string; user_id: string }[]).map((row) => ({
      clinicId: row.clinic_id,
      userId: row.user_id,
    })),
  });
}

const professionalClinicSchema = z.object({ clinicId: z.string().uuid().nullable() });

/** PATCH /api/admin/professionals/:id/clinic  body `{ clinicId }` (null unlinks) */
export async function setProfessionalClinic(request: NextRequest, professionalId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(professionalId);
  const body = professionalClinicSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("admin_set_professional_clinic", {
    p_professional_id: id.data,
    p_clinic_id: body.data.clinicId,
  });
  if (error) return databaseError(error, "That change could not be saved. Please try again.");
  return json({ ok: true });
}

const clinicStaffSchema = z.object({ clinicId: z.string().uuid(), on: z.boolean() });

/** PATCH /api/admin/users/:id/clinic-desk  body `{ clinicId, on }` */
export async function setClinicStaff(request: NextRequest, userId: string) {
  const guard = await requireRole("admin");
  if (!guard.ok) return guard.response;

  const id = uuidSchema.safeParse(userId);
  const body = clinicStaffSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { error } = await guard.supabase.rpc("admin_set_clinic_staff", {
    p_user_id: id.data,
    p_clinic_id: body.data.clinicId,
    p_on: body.data.on,
  });
  if (error) return databaseError(error, "That change could not be saved. Please try again.");
  return json({ ok: true });
}

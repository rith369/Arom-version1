import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { z } from "zod";
import type { ProBooking, SessionNote } from "@/app/pro/_data/bookings";
import type { SharedByClient } from "@/app/pro/_data/clients";
import {
  LANGUAGE_OPTIONS,
  REVIEWED_FIELDS,
  type PendingChange,
  type ProProfile,
  type ReviewedField,
} from "@/app/pro/_data/profile";
import {
  cambodiaDate,
  checkDay,
  isMeetingUrl,
  openSlots,
  type Schedule,
} from "@/app/pro/_data/schedule";
import { MAX_OFFICE_ADDRESS, MAX_OFFICE_MAP_URL, MAX_OFFICE_NAME, isMapUrl } from "@/lib/office";
import { isValidPrice, type SessionPrice } from "@/lib/pricing";
import { toPrice } from "@/lib/professionals";
import { supabaseUrl } from "@/lib/supabase/env";
import type { SessionSuggestion } from "@/lib/sessions";
import { loadArchivedClients } from "./messages-controller";
import { toSuggestion, type SuggestionRow } from "./sessions-controller";
import { databaseError, fail, invalidInput, json, readJson } from "./shared";
import { SHARED_MOOD_DAYS, cambodiaDay, lastDays, type MoodLevel, type MoodWeekResponse } from "@/lib/mood";
import { requireRole } from "./role-controller";

/*
 * AROM professional area controller (BACKEND-HANDOFF.md section 16).
 * Every handler runs as the signed in professional, so RLS limits each
 * query to their own profile, schedule, bookings and notes.
 */

type Supabase = SupabaseClient;

export interface ProData {
  profile: ProProfile;
  pendingChanges: PendingChange[];
  schedule: Schedule | null;
  bookings: ProBooking[];
  sessionNotes: Record<string, SessionNote>;
  // Private plans written before a session, by booking id.
  prepNotes: Record<string, SessionNote>;
  // One pinned summary per client, by client id.
  summaryNotes: Record<string, SessionNote>;
  listed: boolean;
  // An admin's test profile: only admins can find and book it.
  isTest: boolean;
  // Archived clients: their conversation is closed (section 17).
  archivedClients: string[];
  // Suggestions still waiting for the client to choose (section 19).
  openSuggestions: SessionSuggestion[];
}

const PROFILE_COLUMNS =
  "slug, display_name, display_name_km, title, title_km, bio, bio_km, photo_url, specialties, languages, years_experience, gender, session_types, price_kind, price_usd, price_max_usd, office_name, office_address, office_map_url";

const PHOTO_BUCKET = "professional-photos";

/** Cambodia has no daylight saving, so +07:00 is always right. */
function cambodiaIso(value: string) {
  return `${new Date(Date.parse(value) + 7 * 3_600_000).toISOString().slice(0, 19)}+07:00`;
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

async function loadProfile(supabase: Supabase, userId: string): Promise<ProProfile | null> {
  const [{ data: row }, { data: credential }, { data: link }] = await Promise.all([
    supabase.from("professional_profiles").select(PROFILE_COLUMNS).eq("id", userId).maybeSingle(),
    supabase
      .from("professional_credentials")
      .select("license_number, issuing_body")
      .eq("professional_id", userId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("professional_clinics")
      .select("clinic:clinics(slug, name, name_km)")
      .eq("professional_id", userId)
      .maybeSingle<{ clinic: ClinicLinkRow | ClinicLinkRow[] | null }>(),
  ]);
  if (!row) return null;
  const clinic = Array.isArray(link?.clinic) ? link.clinic[0] : link?.clinic;

  return {
    slug: row.slug,
    displayName: row.display_name,
    kmDisplayName: row.display_name_km ?? "",
    title: row.title,
    kmTitle: row.title_km ?? "",
    bio: row.bio ?? "",
    kmBio: row.bio_km ?? "",
    photoUrl: row.photo_url ?? "",
    specialties: row.specialties ?? [],
    languages: row.languages ?? [],
    sessionTypes: row.session_types ?? [],
    office: {
      name: row.office_name ?? "",
      address: row.office_address ?? "",
      mapUrl: row.office_map_url ?? "",
    },
    price: toPrice(row.price_kind, row.price_usd, row.price_max_usd) ?? null,
    yearsExperience: row.years_experience,
    gender: row.gender === "female" || row.gender === "male" || row.gender === "prefer_not_say" ? row.gender : null,
    licenseNumber: credential?.license_number ?? "",
    issuingBody: credential?.issuing_body ?? "",
    clinic: clinic?.slug ? { slug: clinic.slug, name: clinic.name, kmName: clinic.name_km ?? "" } : null,
  };
}

interface ClinicLinkRow {
  slug: string | null;
  name: string;
  name_km: string | null;
}

async function loadBookings(supabase: Supabase, userId: string, slug: string) {
  // read_my_pro_bookings_safe() returns each booking already shaped, with the
  // client's alias id instead of their account id (anonymous privacy).
  const [appointments, notes, prep, places] = await Promise.all([
    supabase.rpc("read_my_pro_bookings_safe"),
    supabase.from("session_notes").select("appointment_id, content, updated_at").eq("professional_id", userId),
    supabase.from("session_prep_notes").select("appointment_id, content, updated_at").eq("professional_id", userId),
    // Which bookings came through a clinic (section 34). Empty on error.
    supabase.rpc("my_clinic_appointment_places"),
  ]);
  const clinicOf = new Map(
    ((places.data ?? []) as { appointment_id: string; clinic_name: string; address: string | null }[]).map((place) => [
      place.appointment_id,
      { name: place.clinic_name, address: place.address ?? "" },
    ]),
  );
  if (appointments.error || !Array.isArray(appointments.data) || notes.error || prep.error) {
    throw new Error("Could not load professional bookings");
  }

  const bookings: ProBooking[] = (appointments.data as ProBooking[]).map((row) => ({
    ...row,
    professionalId: slug,
    startsAt: cambodiaIso(row.startsAt),
    rescheduledFrom: row.rescheduledFrom ? cambodiaIso(row.rescheduledFrom) : null,
    clinic: clinicOf.get(row.id) ?? null,
  }));

  const sessionNotes: Record<string, SessionNote> = {};
  for (const note of notes.data ?? []) {
    sessionNotes[note.appointment_id] = { text: note.content, updatedAt: note.updated_at };
  }

  const prepNotes: Record<string, SessionNote> = {};
  for (const note of prep.data ?? []) {
    prepNotes[note.appointment_id] = { text: note.content, updatedAt: note.updated_at };
  }

  return { bookings, sessionNotes, prepNotes };
}

/** Turns the weekly hours into concrete open times for the booking window. */
function slotsFor(schedule: Schedule, now: number) {
  // The minimum notice is checked when someone books, so every time in the
  // window is stored here.
  return openSlots(schedule, {
    fromDate: cambodiaDate(now),
    days: schedule.bookingWindowWeeks * 7,
    now: now - schedule.minNoticeHours * 3_600_000,
    booked: [],
  }).map((slot) => ({
    startsAt: `${slot.date}T${slot.start}:00+07:00`,
    // Ranges end by 22:00, so a session always ends on the same day.
    endsAt: `${slot.date}T${slot.end}:00+07:00`,
    sessionTypes: slot.sessionTypes,
  }));
}

async function loadAll(supabase: Supabase, userId: string): Promise<ProData | null> {
  const profile = await loadProfile(supabase, userId);
  if (!profile) return null;

  const [changes, scheduleRow, bookingData, archivedClients, suggestionRows, summaryNotes] = await Promise.all([
    supabase
      .from("professional_profile_changes")
      .select("field, old_value, new_value, created_at")
      .eq("professional_id", userId)
      .eq("status", "pending"),
    supabase.from("professional_schedules").select("schedule").eq("professional_id", userId).maybeSingle(),
    loadBookings(supabase, userId, profile.slug),
    loadArchivedClients(supabase, userId),
    supabase
      .rpc("read_session_suggestions_safe", { p_as: "professional", p_open_only: true, p_limit: 100 })
      .returns<SuggestionRow[]>(),
    loadSummaryNotes(supabase),
  ]);
  if (suggestionRows.error || !Array.isArray(suggestionRows.data)) {
    throw new Error("Could not load session suggestions");
  }

  const schedule = (scheduleRow.data?.schedule as Schedule | undefined) ?? null;

  // Rolls the booking window forward each time the professional opens their area.
  if (schedule) await supabase.rpc("sync_availability_slots", { p_slots: slotsFor(schedule, Date.now()) });

  const [{ data: listed }, { data: flags }] = await Promise.all([
    supabase.rpc("is_listed_professional", { p_id: userId }),
    supabase.from("professional_profiles").select("is_test").eq("id", userId).maybeSingle(),
  ]);

  return {
    profile,
    pendingChanges: (changes.data ?? []).map((row) => ({
      field: row.field as ReviewedField,
      from: row.old_value,
      to: row.new_value,
      requestedAt: row.created_at,
    })),
    schedule,
    ...bookingData,
    listed: listed === true,
    isTest: flags?.is_test === true,
    archivedClients,
    summaryNotes,
    openSuggestions: suggestionRows.data.map((row) => toSuggestion(row, profile.slug, "")),
  };
}

/** GET /api/pro/me: everything the professional area needs, in one call. */
export async function getProData() {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;

  // Admins use the professional area with their own test profile, made on first visit.
  if (guard.role === "admin") await guard.supabase.rpc("ensure_admin_test_profile");

  const data = await loadAll(guard.supabase, guard.userId);
  if (!data) return fail("forbidden", "Your professional profile was not found.", 404);
  return json<ProData>(data);
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const priceSchema: z.ZodType<SessionPrice> = z.union([
  z.object({ kind: z.literal("free") }),
  z.object({ kind: z.literal("fixed"), amount: z.number() }),
  z.object({ kind: z.literal("range"), min: z.number(), max: z.number() }),
]);

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  kmDisplayName: z.string().trim().max(120),
  title: z.string().trim().min(2).max(120),
  kmTitle: z.string().trim().max(120),
  bio: z.string().trim().max(2000),
  kmBio: z.string().trim().max(2000),
  photoUrl: z.string().trim().max(500),
  specialties: z.array(z.string().trim().min(1).max(40)).max(12),
  languages: z.array(z.enum(LANGUAGE_OPTIONS)).max(5),
  sessionTypes: z.array(z.enum(["online", "in_person"])).max(2),
  office: z.object({
    name: z.string().trim().max(MAX_OFFICE_NAME),
    address: z.string().trim().max(MAX_OFFICE_ADDRESS),
    mapUrl: z
      .string()
      .trim()
      .max(MAX_OFFICE_MAP_URL)
      .refine((value) => value === "" || isMapUrl(value)),
  }),
  price: priceSchema.nullable().refine((price) => price === null || isValidPrice(price)),
  yearsExperience: z.number().int().min(0).max(60).nullable(),
  gender: z.enum(["female", "male", "prefer_not_say"]).nullable().default(null),
  licenseNumber: z.string().trim().max(60),
  issuingBody: z.string().trim().max(120),
});

/** PATCH /api/pro/profile: normal fields save at once, reviewed fields wait for an admin. */
export async function saveProProfile(request: NextRequest) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;
  const { supabase, userId } = guard;

  const body = profileSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const next = body.data;

  const current = await loadProfile(supabase, userId);
  if (!current) return fail("forbidden", "Your professional profile was not found.", 404);

  // In person sessions need a place clients can find (decided 15 Oct 2026).
  if (next.sessionTypes.includes("in_person") && !next.office.address) {
    return fail("invalid_input", "Add the address where you see clients to offer in person sessions.", 400);
  }

  // Photos must come from this professional's own folder in AROM storage.
  const ownPhotos = `${supabaseUrl}/storage/v1/object/public/${PHOTO_BUCKET}/${userId}/`;
  if (next.photoUrl && next.photoUrl !== current.photoUrl && !next.photoUrl.startsWith(ownPhotos)) {
    return invalidInput();
  }

  const price = next.price;
  const { error } = await supabase
    .from("professional_profiles")
    .update({
      bio: next.bio || null,
      bio_km: next.kmBio || null,
      photo_url: next.photoUrl || null,
      specialties: [...new Set(next.specialties)],
      languages: [...new Set(next.languages)],
      session_types: [...new Set(next.sessionTypes)],
      // Public and saved at once, no admin review (decided 15 Oct 2026).
      office_name: next.office.name || null,
      office_address: next.office.address || null,
      office_map_url: next.office.mapUrl || null,
      years_experience: next.yearsExperience,
      gender: next.gender,
      price_kind: price?.kind ?? null,
      price_usd: price?.kind === "fixed" ? price.amount : price?.kind === "range" ? price.min : null,
      price_max_usd: price?.kind === "range" ? price.max : null,
    })
    .eq("id", userId);
  if (error) return fail("server_error", "We could not save your profile.", 500);

  // Each reviewed field: a different value waits for review, the live value withdraws the request.
  for (const field of REVIEWED_FIELDS) {
    const live = current[field].trim();
    const wanted = next[field].trim();
    await supabase
      .from("professional_profile_changes")
      .delete()
      .eq("professional_id", userId)
      .eq("field", field)
      .eq("status", "pending");
    if (wanted !== live) {
      const { error: changeError } = await supabase.from("professional_profile_changes").insert({
        professional_id: userId,
        field,
        old_value: live,
        new_value: wanted,
      });
      if (changeError) return fail("server_error", "We could not send your changes for review.", 500);
    }
  }

  const data = await loadAll(supabase, userId);
  return json<ProData | null>(data);
}

/** DELETE /api/pro/profile/changes?field=title: withdraw a waiting change. */
export async function withdrawProfileChange(request: NextRequest) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;

  const field = z.enum(REVIEWED_FIELDS).safeParse(request.nextUrl.searchParams.get("field"));
  if (!field.success) return invalidInput();

  await guard.supabase
    .from("professional_profile_changes")
    .delete()
    .eq("professional_id", guard.userId)
    .eq("field", field.data)
    .eq("status", "pending");

  return json({ ok: true });
}

const PHOTO_TYPES: Record<string, { extension: string; check: (bytes: Uint8Array) => boolean }> = {
  "image/jpeg": { extension: "jpg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { extension: "png", check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  "image/webp": {
    extension: "webp",
    check: (b) => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP",
  },
};

/** POST /api/pro/photo (multipart `photo`): uploads a profile photo and returns its public URL. */
export async function uploadProPhoto(request: NextRequest) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;

  let file: FormDataEntryValue | null = null;
  try {
    file = (await request.formData()).get("photo");
  } catch {
    return invalidInput();
  }
  if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024) return invalidInput();

  const type = PHOTO_TYPES[file.type];
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!type || !type.check(bytes)) return invalidInput();

  const path = `${guard.userId}/${crypto.randomUUID()}.${type.extension}`;
  const { error } = await guard.supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) return fail("server_error", "We could not upload your photo.", 500);

  const { data } = guard.supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return json({ url: data.publicUrl });
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const scheduleSchema = z.object({
  week: z
    .array(
      z.object({
        day: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7)]),
        enabled: z.boolean(),
        ranges: z
          .array(
            z.object({
              id: z.string().max(60),
              start: time,
              end: time,
              sessionTypes: z.array(z.enum(["online", "in_person"])).max(2),
            }),
          )
          .max(8),
      }),
    )
    .length(7),
  sessionMinutes: z.union([z.literal(45), z.literal(60), z.literal(90)]),
  breakMinutes: z.union([z.literal(0), z.literal(10), z.literal(15)]),
  bookingWindowWeeks: z.union([z.literal(2), z.literal(4), z.literal(8)]),
  minNoticeHours: z.union([z.literal(2), z.literal(12), z.literal(24)]),
  timeOff: z
    .array(z.object({ id: z.string().max(60), from: date, to: date, note: z.string().trim().max(200) }))
    .max(50),
  meetingUrl: z.string().trim().max(500),
}) satisfies z.ZodType<Schedule>;

/** PUT /api/pro/schedule: saves weekly hours and refreshes open times. Never cancels bookings. */
export async function saveProSchedule(request: NextRequest) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;
  const { supabase, userId } = guard;

  const body = scheduleSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const schedule = body.data;

  const profile = await loadProfile(supabase, userId);
  if (!profile) return fail("forbidden", "Your professional profile was not found.", 404);

  const problems = schedule.week.flatMap((day) => checkDay(day, schedule.sessionMinutes, profile.sessionTypes));
  if (problems.length > 0) return fail("invalid_input", problems[0].message.en, 400);
  if (schedule.meetingUrl && !isMeetingUrl(schedule.meetingUrl)) {
    return fail("invalid_input", "The meeting link must start with https://", 400);
  }

  const { data: previous } = await supabase
    .from("professional_schedules")
    .select("meeting_url")
    .eq("professional_id", userId)
    .maybeSingle();

  const { error } = await supabase.from("professional_schedules").upsert({
    professional_id: userId,
    schedule,
    meeting_url: schedule.meetingUrl || null,
    min_notice_hours: schedule.minNoticeHours,
  });
  if (error) return fail("server_error", "We could not save your schedule.", 500);

  const { error: syncError } = await supabase.rpc("sync_availability_slots", {
    p_slots: slotsFor(schedule, Date.now()),
  });
  if (syncError) return fail("server_error", "Your hours were saved, but open times could not be updated.", 500);

  // Upcoming online sessions that used the old room (or had none) move to the new one.
  const oldRoom = previous?.meeting_url ?? null;
  const newRoom = schedule.meetingUrl || null;
  if (oldRoom !== newRoom) {
    const { error: meetingRefreshError } = await supabase.rpc("refresh_pro_meeting_links_safe", {
      p_old_url: oldRoom,
      p_new_url: newRoom,
    });
    if (meetingRefreshError) {
      return fail("server_error", "Your schedule was saved, but upcoming meeting links could not be updated.", 500);
    }
  }

  const data = await loadAll(supabase, userId);
  return json<ProData | null>(data);
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

const bookingActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel"), reason: z.string().trim().min(1).max(300) }),
  z.object({ action: z.literal("reschedule"), startsAt: z.string().min(10), reason: z.string().trim().min(1).max(300) }),
  z.object({ action: z.literal("outcome"), status: z.enum(["completed", "no_show"]) }),
  z.object({ action: z.literal("note"), text: z.string().max(5000) }),
  z.object({ action: z.literal("prep"), text: z.string().max(5000) }),
  z.object({ action: z.literal("meeting"), meetingUrl: z.string().trim().max(500) }),
]);

/** POST /api/pro/bookings/:id  body `{ action, ... }` */
export async function updateProBooking(request: NextRequest, appointmentId: string) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;
  const { supabase, userId } = guard;

  const id = z.string().uuid().safeParse(appointmentId);
  const body = bookingActionSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();
  const input = body.data;

  // Professionals no longer read appointment rows directly (anonymous privacy).
  const { data: ownsAppointment, error: ownershipError } = await supabase.rpc("owns_professional_appointment", {
    p_appointment_id: id.data,
  });
  if (ownershipError) return fail("server_error", "Could not check appointment.", 500);
  if (ownsAppointment !== true) return fail("invalid_input", "Appointment not found.", 404);

  let error: { message: string } | null = null;

  if (input.action === "cancel") {
    ({ error } = await supabase.rpc("cancel_appointment", { p_appointment_id: id.data, p_reason: input.reason }));
  } else if (input.action === "reschedule") {
    const { data: slot } = await supabase
      .from("availability_slots")
      .select("id")
      .eq("professional_id", userId)
      .eq("starts_at", new Date(input.startsAt).toISOString())
      .eq("is_booked", false)
      .maybeSingle();
    if (!slot) return fail("invalid_input", "That time is no longer open. Choose another time.", 400);
    ({ error } = await supabase.rpc("reschedule_appointment", {
      p_appointment_id: id.data,
      p_slot_id: slot.id,
      p_reason: input.reason,
    }));
  } else if (input.action === "outcome") {
    ({ error } = await supabase.rpc("update_pro_booking_safe", {
      p_appointment_id: id.data,
      p_action: "outcome",
      p_status: input.status,
    }));
  } else if (input.action === "prep") {
    const text = input.text.trim();
    ({ error } = text
      ? await supabase
          .from("session_prep_notes")
          .upsert({ appointment_id: id.data, professional_id: userId, content: text }, { onConflict: "appointment_id" })
      : await supabase.from("session_prep_notes").delete().eq("appointment_id", id.data));
  } else if (input.action === "note") {
    const text = input.text.trim();
    ({ error } = text
      ? await supabase
          .from("session_notes")
          .upsert({ appointment_id: id.data, professional_id: userId, content: text }, { onConflict: "appointment_id" })
      : await supabase.from("session_notes").delete().eq("appointment_id", id.data));
  } else {
    if (input.meetingUrl && !isMeetingUrl(input.meetingUrl)) {
      return fail("invalid_input", "The meeting link must start with https://", 400);
    }
    ({ error } = await supabase.rpc("update_pro_booking_safe", {
      p_appointment_id: id.data,
      p_action: "meeting",
      p_meeting_url: input.meetingUrl || null,
    }));
  }

  if (error) return databaseError(error, "This booking could not be updated. Please try again.");

  const profile = await loadProfile(supabase, userId);
  const data = await loadBookings(supabase, userId, profile?.slug ?? "");
  return json(data);
}

// ---------------------------------------------------------------------------
// Clients: archive, summary note and what they share
// ---------------------------------------------------------------------------

// Summary notes are keyed by the client's alias id (anonymous privacy).
async function loadSummaryNotes(supabase: Supabase) {
  const { data, error } = await supabase.rpc("my_client_summary_notes_safe");
  if (error) throw new Error("Could not load client summary notes");
  const rows = (data ?? []) as { client_alias_id: string; content: string; updated_at: string }[];
  const notes: Record<string, SessionNote> = {};
  for (const row of rows) notes[row.client_alias_id] = { text: row.content, updatedAt: row.updated_at };
  return notes;
}

const clientActionSchema = z.union([
  z.object({ archived: z.boolean() }),
  z.object({ summaryNote: z.string().max(5000) }),
]);

/**
 * POST /api/pro/clients/:clientId
 * `{ archived }`: archiving closes the conversation for both sides.
 * `{ summaryNote }`: the pinned summary, private to the professional. Empty deletes it.
 */
export async function updateProClient(request: NextRequest, clientId: string) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;
  const { supabase } = guard;

  // clientId is the client's alias id, never their account id.
  const id = z.string().uuid().safeParse(clientId);
  const body = clientActionSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  if ("archived" in body.data) {
    const { error } = await supabase.rpc("set_client_archived_safe", { p_client_id: id.data, p_archived: body.data.archived });
    if (error) return error.code === "PT404" ? fail("invalid_input", "Client not found.", 404) : fail("server_error", "That could not be saved.", 500);
    return json({ archived: body.data.archived });
  }

  // An empty note deletes it.
  const { error } = await supabase.rpc("save_client_summary_note_safe", {
    p_client_alias_id: id.data,
    p_text: body.data.summaryNote.trim(),
  });
  if (error) {
    if (error.code === "PT404") return fail("invalid_input", "Client not found.", 404);
    if (error.code === "22023") return invalidInput();
    return fail("server_error", "That could not be saved.", 500);
  }
  return json({ summaryNotes: await loadSummaryNotes(supabase) });
}

// The last 30 Cambodia days, missed days null. Null when nothing is shared.
function sharedMoodDays(rows: { day: string; mood: MoodLevel }[]): MoodWeekResponse | null {
  if (rows.length === 0) return null;
  const byDay = new Map(rows.map((row) => [row.day, row.mood]));
  return {
    days: lastDays(cambodiaDay(Date.now()), SHARED_MOOD_DAYS).map((day) => ({ day, mood: byDay.get(day) ?? null })),
    checkIns: byDay.size,
  };
}

/**
 * GET /api/pro/clients/:clientId: what the client chose to share, by alias id.
 * The safe functions return data only while the client shares it on a booked
 * or completed session with this professional. Scores only, never the answers.
 */
export async function getSharedByClient(clientId: string) {
  const guard = await requireRole("professional", "admin");
  if (!guard.ok) return guard.response;
  const { supabase } = guard;

  const id = z.string().uuid().safeParse(clientId);
  if (!id.success) return invalidInput();

  const [shared, moods] = await Promise.all([
    supabase.rpc("get_shared_client_data_safe", { p_client_alias_id: id.data }),
    // Moods only, and only while the client shares them with this professional.
    supabase.rpc("shared_mood_checkins_safe", { p_client_alias_id: id.data }),
  ]);
  if (shared.error?.code === "PT404" || moods.error?.code === "PT404") {
    return fail("invalid_input", "Client not found.", 404);
  }
  if (shared.error || !shared.data || moods.error) {
    return fail("server_error", "Could not load shared client data.", 500);
  }

  return json<SharedByClient>({
    ...(shared.data as Omit<SharedByClient, "moods">),
    moods: sharedMoodDays((moods.data ?? []) as { day: string; mood: MoodLevel }[]),
  });
}

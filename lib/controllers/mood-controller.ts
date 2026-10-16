import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  cambodiaDay,
  lastDays,
  moodLevelSchema,
  moodSourceSchema,
  PROGRESS_RANGES,
  RANGE_DAYS,
  shiftDay,
  type MoodLevel,
  type MoodWeekResponse,
  type TodayMoodResponse,
} from "@/lib/mood";
import {
  JOURNAL_MOOD_LEVEL,
  MAX_JOURNAL_ENTRIES,
  MOOD_LEVEL_JOURNAL,
  newJournalEntrySchema,
  type JournalEntryDto,
  type JournalListResponse,
  type JournalQuestionAnswer,
} from "@/lib/journal";
import { MAX_RECENT_ACTIVITIES, logActivitySchema, type ActivitiesResponse, type ActivityItem } from "@/lib/activities";
import { createClient } from "@/lib/supabase/server";
import { fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM mood check in controller (BACKEND-HANDOFF.md section 22). Runs as the
 * signed in person: RLS on mood_checkins returns only their own rows, and the
 * one write goes through save_mood_checkin(). No admin access. Responses carry
 * only the day and the mood, never notes or emotions. Never log a mood.
 */

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

interface MoodRow {
  checked_in_on: string;
  mood: MoodLevel;
}

const saveSchema = z.object({ mood: moodLevelSchema, source: moodSourceSchema.default("home") });

/** POST /api/mood-checkins `{ mood, source? }`: saves or replaces today's mood. */
export async function saveMood(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = saveSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { data, error } = await session.supabase.rpc("save_mood_checkin", {
    p_mood: body.data.mood,
    p_source: body.data.source,
  });
  if (error) {
    if (error.code === "PT403") return unauthorized();
    if (error.code === "22023") return invalidInput();
    return fail("server_error", "Your mood could not be saved.", 500);
  }

  return json<TodayMoodResponse>({ day: String(data), mood: body.data.mood });
}

const rangeSchema = z.enum(PROGRESS_RANGES).default("7d");

/**
 * GET /api/progress?range=7d|30d|90d: one entry per Cambodia day, oldest
 * first, today last, `mood` null on a missed day. Without `range`, 7 days.
 */
export async function getMoodRange(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const range = rangeSchema.safeParse(request.nextUrl.searchParams.get("range") ?? undefined);
  if (!range.success) return invalidInput();

  const days = lastDays(cambodiaDay(Date.now()), RANGE_DAYS[range.data]);
  const { data, error } = await session.supabase
    .from("mood_checkins")
    .select("checked_in_on, mood")
    .eq("user_id", session.userId)
    .gte("checked_in_on", days[0])
    .lte("checked_in_on", days[days.length - 1])
    .returns<MoodRow[]>();
  if (error) return fail("server_error", "Your check ins could not be loaded.", 500);

  const byDay = new Map((data ?? []).map((row) => [row.checked_in_on, row.mood]));
  return json<MoodWeekResponse>({
    days: days.map((day) => ({ day, mood: byDay.get(day) ?? null })),
    checkIns: byDay.size,
  });
}

// ---------------------------------------------------------------------------
// Activities and journal (same section). Never log journal text.
// ---------------------------------------------------------------------------

/** POST /api/activities `{ kind, refId }`: a practice or lesson was finished today. */
export async function logActivity(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = logActivitySchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await session.supabase.rpc("log_activity", { p_kind: body.data.kind, p_ref_id: body.data.refId });
  if (error) return fail("server_error", "That could not be saved.", 500);
  return json({ ok: true });
}

/** GET /api/progress/activities?range=7d|30d|90d: counts and the 20 newest. */
export async function getActivities(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const range = rangeSchema.safeParse(request.nextUrl.searchParams.get("range") ?? undefined);
  if (!range.success) return invalidInput();

  const days = lastDays(cambodiaDay(Date.now()), RANGE_DAYS[range.data]);
  const [from, to] = [days[0], days[days.length - 1]];
  const [done, journal] = await Promise.all([
    session.supabase
      .from("activity_log")
      .select("id, kind, ref_id, done_on")
      .eq("user_id", session.userId)
      .gte("done_on", from)
      .lte("done_on", to)
      .returns<{ id: string; kind: "practice" | "lesson"; ref_id: string; done_on: string }[]>(),
    // Dates only: the words of an entry are never part of Progress.
    session.supabase
      .from("journal_entries")
      .select("id, entry_date")
      .eq("user_id", session.userId)
      .gte("entry_date", from)
      .lte("entry_date", to)
      .returns<{ id: string; entry_date: string }[]>(),
  ]);
  if (done.error || journal.error) return fail("server_error", "Your activities could not be loaded.", 500);

  const items: ActivityItem[] = [
    ...(done.data ?? []).map((row) => ({ id: row.id, kind: row.kind, refId: row.ref_id, day: row.done_on })),
    ...(journal.data ?? []).map((row) => ({ id: row.id, kind: "journal" as const, refId: null, day: row.entry_date })),
  ];
  const counts = { practice: 0, lesson: 0, journal: 0 };
  for (const item of items) counts[item.kind] += 1;
  items.sort((a, b) => b.day.localeCompare(a.day));
  return json<ActivitiesResponse>({ counts, recent: items.slice(0, MAX_RECENT_ACTIVITIES) });
}

interface JournalRow {
  id: string;
  entry_date: string;
  mood: MoodLevel | null;
  emotions: string[];
  content: string;
  questions: JournalQuestionAnswer[] | null;
  additional_notes: string | null;
  created_at: string;
}

const JOURNAL_COLUMNS = "id, entry_date, mood, emotions, content, questions, additional_notes, created_at";

function toJournalEntry(row: JournalRow): JournalEntryDto {
  return {
    id: row.id,
    day: row.entry_date,
    mood: MOOD_LEVEL_JOURNAL[row.mood ?? "okay"],
    emotions: row.emotions ?? [],
    content: row.content,
    questions: Array.isArray(row.questions) ? row.questions : [],
    additionalNotes: row.additional_notes ?? "",
    createdAt: row.created_at,
  };
}

/** GET /api/journal: the signed in person's own entries, newest first. */
export async function listJournal() {
  const session = await signedIn();
  if (!session) return unauthorized();

  const { data, error } = await session.supabase
    .from("journal_entries")
    .select(JOURNAL_COLUMNS)
    .eq("user_id", session.userId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(MAX_JOURNAL_ENTRIES)
    .returns<JournalRow[]>();
  if (error) return fail("server_error", "Your journal could not be loaded.", 500);
  return json<JournalListResponse>({ entries: (data ?? []).map(toJournalEntry) });
}

/** POST /api/journal: saves one entry. RLS checks the owner. */
export async function createJournalEntry(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const body = newJournalEntrySchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const today = cambodiaDay(Date.now());
  const day = body.data.day ?? today;
  // Older entries (moved from this device) may be in the past, never the future.
  if (day > today || day < shiftDay(today, -3650)) return invalidInput();

  const { data, error } = await session.supabase
    .from("journal_entries")
    .insert({
      user_id: session.userId,
      entry_date: day,
      mood: JOURNAL_MOOD_LEVEL[body.data.mood],
      emotions: body.data.emotions,
      content: body.data.content,
      questions: body.data.questions,
      additional_notes: body.data.additionalNotes || null,
      input_method: body.data.inputMethod,
    })
    .select(JOURNAL_COLUMNS)
    .single<JournalRow>();
  if (error || !data) return fail("server_error", "Your entry could not be saved. Please try again.", 500);
  return json<JournalEntryDto>(toJournalEntry(data), 201);
}

/** DELETE /api/journal/:id: deletes one of the person's own entries. */
export async function deleteJournalEntry(entryId: string) {
  const session = await signedIn();
  if (!session) return unauthorized();

  const id = z.string().uuid().safeParse(entryId);
  if (!id.success) return invalidInput();

  const { data, error } = await session.supabase
    .from("journal_entries")
    .delete()
    .eq("id", id.data)
    .eq("user_id", session.userId)
    .select("id");
  if (error) return fail("server_error", "Your entry could not be deleted. Please try again.", 500);
  if (!data || data.length === 0) return fail("invalid_input", "Not found.", 404);
  return json({ ok: true });
}

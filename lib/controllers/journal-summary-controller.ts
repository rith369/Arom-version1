import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { cambodiaDay, MOOD_LABELS, shiftDay, type MoodLevel } from "@/lib/mood";
import { journalText } from "@/lib/journal";
import { GeminiUnavailable, mentionsCrisis, writeJournalSummary, type SummaryEntry } from "@/lib/gemini-journal";
import {
  MAX_SUMMARY_RUNS,
  MIN_SUMMARY_ENTRIES,
  journalSummarySchema,
  summaryLanguageSchema,
  summaryRequestSchema,
  summaryToggleSchema,
  type JournalSummary,
  type JournalSummaryResponse,
} from "@/lib/journal-summary";
import { createClient } from "@/lib/supabase/server";
import { fail, invalidInput, json, readJson, unauthorized } from "./shared";

/*
 * AROM journal week summary (BACKEND-HANDOFF.md section 22). Runs as the
 * signed in person: RLS returns only their own entries and summary row, and
 * every write goes through set_journal_summary_enabled(),
 * claim_journal_summary_run() and save_journal_summary(). No admin or
 * professional access. Never log entries or summaries.
 */

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function signedIn() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

interface SummaryRow {
  enabled: boolean;
  language: string | null;
  entries_key: string | null;
  summary: unknown;
  generated_at: string | null;
  run_day: string | null;
  run_count: number;
}

interface EntryRow {
  id: string;
  entry_date: string;
  mood: MoodLevel | null;
  emotions: string[] | null;
  content: string;
  questions: unknown;
  additional_notes: string | null;
}

async function readRow(supabase: Supabase, userId: string) {
  const { data, error } = await supabase
    .from("journal_ai_summaries")
    .select("enabled, language, entries_key, summary, generated_at, run_day, run_count")
    .eq("user_id", userId)
    .maybeSingle<SummaryRow>();
  return error ? undefined : data;
}

/** The person's own entries of the last 7 Cambodia days, oldest first. */
async function weekEntries(supabase: Supabase, userId: string) {
  const today = cambodiaDay(Date.now());
  const { data, error } = await supabase
    .from("journal_entries")
    .select("id, entry_date, mood, emotions, content, questions, additional_notes")
    .eq("user_id", userId)
    .gte("entry_date", shiftDay(today, -6))
    .lte("entry_date", today)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<EntryRow[]>();
  return error ? undefined : (data ?? []);
}

function entriesKey(rows: EntryRow[], language: string) {
  const ids = rows.map((row) => row.id).sort();
  // v4: mood only entries no longer carry made up text (26 Oct), so older summaries are written again.
  return createHash("sha256").update(`v4:${language}:${ids.join(",")}`).digest("hex");
}

function toSummaryEntry(row: EntryRow): SummaryEntry {
  const questions = Array.isArray(row.questions)
    ? (row.questions as { question?: unknown; answer?: unknown }[])
        .filter((q) => typeof q.question === "string" && typeof q.answer === "string")
        .map((q) => ({ question: q.question as string, answer: q.answer as string }))
    : [];
  return {
    day: row.entry_date,
    mood: MOOD_LABELS[row.mood ?? "okay"].en,
    emotions: row.emotions ?? [],
    // Old made up texts count as no words (mood only).
    content: journalText(row.content),
    questions,
    additionalNotes: row.additional_notes ?? "",
  };
}

function toResponse(row: SummaryRow | null, entries: EntryRow[], language: string): JournalSummaryResponse {
  const today = cambodiaDay(Date.now());
  const used = row?.run_day === today ? row.run_count : 0;
  const summary = row?.enabled ? journalSummarySchema.safeParse(row.summary) : null;
  return {
    enabled: row?.enabled ?? false,
    entryCount: entries.length,
    summary: summary?.success ? summary.data : null,
    fresh: Boolean(summary?.success && row?.entries_key === entriesKey(entries, language)),
    generatedAt: row?.enabled ? row.generated_at : null,
    runsLeft: Math.max(0, MAX_SUMMARY_RUNS - used),
  };
}

async function current(supabase: Supabase, userId: string) {
  const [row, entries] = await Promise.all([readRow(supabase, userId), weekEntries(supabase, userId)]);
  if (row === undefined || entries === undefined) return null;
  return { row, entries };
}

/** GET /api/journal/summary?language=en|km: the saved summary and whether it is up to date. */
export async function getJournalSummary(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();
  const language = summaryLanguageSchema.safeParse(request.nextUrl.searchParams.get("language") ?? "en");
  if (!language.success) return invalidInput();

  const state = await current(session.supabase, session.userId);
  if (!state) return fail("server_error", "Your summary could not be loaded.", 500);
  return json(toResponse(state.row, state.entries, language.data));
}

/** PUT /api/journal/summary `{ enabled, language }`: turns the summary on or off (off deletes it). */
export async function setJournalSummaryEnabled(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();
  const body = summaryToggleSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await session.supabase.rpc("set_journal_summary_enabled", { p_enabled: body.data.enabled });
  if (error) return fail("server_error", "Your choice could not be saved. Please try again.", 500);

  const state = await current(session.supabase, session.userId);
  if (!state) return fail("server_error", "Your summary could not be loaded.", 500);
  return json(toResponse(state.row, state.entries, body.data.language));
}

/** POST /api/journal/summary `{ language }`: writes a new summary when the entries changed. */
export async function createJournalSummary(request: NextRequest) {
  const session = await signedIn();
  if (!session) return unauthorized();
  const body = summaryRequestSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const language = body.data.language;

  const state = await current(session.supabase, session.userId);
  if (!state) return fail("server_error", "Your summary could not be loaded.", 500);
  const { row, entries } = state;
  const before = toResponse(row, entries, language);

  if (!before.enabled) return fail("forbidden", "Turn on the summary first.", 403);
  if (entries.length < MIN_SUMMARY_ENTRIES) return json(before);
  if (before.fresh) return json(before);

  const claimed = await session.supabase.rpc("claim_journal_summary_run");
  if (claimed.error) return fail("server_error", "Your summary could not be written. Please try again.", 500);
  if (claimed.data !== true) return fail("rate_limited", "You can get a new summary again tomorrow.", 429);

  const summaryEntries = entries.map(toSummaryEntry);
  let summary: JournalSummary;
  if (mentionsCrisis(summaryEntries)) {
    // Nothing is sent to Gemini: these entries get the helplines.
    summary = { kind: "support" };
  } else {
    try {
      summary = await writeJournalSummary(summaryEntries, language);
    } catch (error) {
      if (error instanceof GeminiUnavailable) {
        return fail("server_error", "The summary could not be written right now. Please try again later.", 503);
      }
      throw error;
    }
  }

  const key = entriesKey(entries, language);
  const saved = await session.supabase.rpc("save_journal_summary", {
    p_language: language,
    p_entries_key: key,
    p_summary: summary,
  });
  if (saved.error) return fail("server_error", "Your summary could not be saved. Please try again.", 500);

  const after = await readRow(session.supabase, session.userId);
  if (after === undefined) return fail("server_error", "Your summary could not be loaded.", 500);
  return json(toResponse(after, entries, language));
}

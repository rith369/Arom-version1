import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  cambodiaDate,
  openSlots,
  type Schedule,
} from '@/app/pro/_data/schedule';
import {
  MAX_QUICK_REPLIES,
  MAX_QUICK_REPLY,
  MAX_SERIES_SESSIONS,
  MAX_SUGGESTED_TIMES,
  MAX_SUGGESTION_NOTE,
  SUGGEST_DAYS,
  cambodiaIso,
  seriesTimes,
  type QuickRepliesResponse,
  type SessionSuggestion,
  type SuggestionResponse,
} from '@/lib/sessions';
import { createClient } from '@/lib/supabase/server';
import { fail, invalidInput, json, readJson, unauthorized } from './shared';
import { requireRole } from './role-controller';

/*
 * AROM sessions controller (BACKEND-HANDOFF.md section 19): suggested
 * sessions, repeating series and quick replies. Runs as the signed in person.
 * Booking a suggestion is one database transaction (accept_session_suggestion).
 */

export const SUGGESTION_COLUMNS =
  'id, professional_id, client_id, session_type, duration_minutes, times, every_weeks, session_count, note, meeting_url, status, chosen_time, booking_ids, created_at';

export interface SuggestionRow {
  id: string;
  professional_id: string;
  client_id: string;
  session_type: SessionSuggestion['sessionType'];
  duration_minutes: number;
  times: string[];
  every_weeks: number;
  session_count: number;
  note: string;
  meeting_url: string | null;
  status: SessionSuggestion['status'];
  chosen_time: string | null;
  booking_ids: string[];
  created_at: string;
}

export function toSuggestion(
  row: SuggestionRow,
  slug: string,
  clientName: string,
): SessionSuggestion {
  return {
    id: row.id,
    professionalId: slug,
    clientId: row.client_id,
    clientName,
    sessionType: row.session_type,
    durationMinutes: row.duration_minutes,
    times: row.times.map((time) => cambodiaIso(Date.parse(time))).sort(),
    repeat: {
      everyWeeks: row.every_weeks === 2 ? 2 : 1,
      count: row.session_count,
    },
    note: row.note,
    meetingUrl: row.session_type === 'online' ? row.meeting_url : null,
    createdAt: row.created_at,
    status: row.status,
    chosenTime: row.chosen_time
      ? cambodiaIso(Date.parse(row.chosen_time))
      : null,
    bookingIds: row.booking_ids ?? [],
  };
}

function ruleError(error: PostgrestError) {
  if (error.code === 'PT403') return fail('forbidden', error.message, 403);
  if (error.code === 'PT404') return fail('invalid_input', error.message, 404);
  if (error.code === 'PT409') return fail('invalid_input', error.message, 409);
  if (error.code === '22023') return fail('invalid_input', error.message, 400);
  return fail('server_error', 'That could not be saved.', 500);
}

async function ownSlug(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('professional_profiles')
    .select('slug')
    .eq('id', userId)
    .maybeSingle<{ slug: string }>();
  return data?.slug ?? null;
}

// ---------------------------------------------------------------------------
// Professional: suggest and withdraw
// ---------------------------------------------------------------------------

const isoTime = z.string().refine((value) => !Number.isNaN(Date.parse(value)));

const suggestSchema = z.object({
  clientId: z.string().uuid(),
  sessionType: z.enum(['online', 'in_person']),
  times: z.array(isoTime).min(1).max(MAX_SUGGESTED_TIMES),
  repeat: z.object({
    everyWeeks: z.union([z.literal(1), z.literal(2)]),
    count: z.number().int().min(1).max(MAX_SERIES_SESSIONS),
  }),
  note: z.string().trim().max(MAX_SUGGESTION_NOTE),
});

/**
 * POST /api/pro/suggestions: offers 1 to 3 times (optionally a series) in the chat.
 * Repeats the dialog's rule: every session of the series must be an open time
 * of the schedule, of this session type, and free.
 */
export async function suggestSession(request: NextRequest) {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;
  const { supabase, userId } = guard;

  const body = suggestSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();
  const input = body.data;

  const [scheduleRow, booked, slug] = await Promise.all([
    supabase
      .from('professional_schedules')
      .select('schedule')
      .eq('professional_id', userId)
      .maybeSingle(),
    supabase.rpc('my_upcoming_booked_times'),
    ownSlug(supabase, userId),
  ]);
  if (booked.error || !Array.isArray(booked.data)) {
    return fail('server_error', 'Could not check booked session times.', 500);
  }

  const bookedTimes = booked.data as { starts_at: string }[];
  const schedule = scheduleRow.data?.schedule as Schedule | undefined;
  if (!schedule || !slug)
    return fail('invalid_input', 'Set your schedule first.', 400);

  const now = Date.now();
  const lastOffset = (input.repeat.count - 1) * input.repeat.everyWeeks * 7;
  const free = new Set(
    openSlots(schedule, {
      fromDate: cambodiaDate(now),
      days: SUGGEST_DAYS + lastOffset + 1,
      now,
      booked: bookedTimes.map((row) => ({
        startsAt: row.starts_at,
      })),
    })
      .filter((slot) => slot.sessionTypes.includes(input.sessionType))
      .map((slot) => Date.parse(`${slot.date}T${slot.start}:00+07:00`)),
  );
  const fits = input.times.every(
    (time) =>
      Date.parse(time) < now + (SUGGEST_DAYS + 1) * 86_400_000 &&
      seriesTimes(time, input.repeat).every((start) =>
        free.has(Date.parse(start)),
      ),
  );
  if (!fits)
    return fail(
      'invalid_input',
      'One of these times is no longer open. Choose again.',
      409,
    );

  const { data, error } = await supabase
    .rpc('suggest_session_safe', {
      p_client_id: input.clientId,
      p_session_type: input.sessionType,
      p_duration_minutes: schedule.sessionMinutes,
      p_times: input.times.map((time) => new Date(time).toISOString()),
      p_every_weeks: input.repeat.everyWeeks,
      p_session_count: input.repeat.count,
      p_note: input.note,
    })
    .single<SuggestionRow>();
  if (error || !data)
    return error
      ? ruleError(error)
      : fail('server_error', 'That could not be sent.', 500);
  return json<SuggestionResponse>(
    { suggestion: toSuggestion(data, slug, '') },
    201,
  );
}

/** POST /api/pro/suggestions/:id/withdraw */
export async function withdrawSuggestion(suggestionId: string) {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;

  const id = z.string().uuid().safeParse(suggestionId);
  if (!id.success) return invalidInput();

  const [{ data, error }, slug] = await Promise.all([
    guard.supabase
      .rpc('withdraw_session_suggestion_safe', { p_suggestion_id: id.data })
      .single<SuggestionRow>(),
    ownSlug(guard.supabase, guard.userId),
  ]);
  if (error || !data)
    return error
      ? ruleError(error)
      : fail('server_error', 'That could not be saved.', 500);
  return json<SuggestionResponse>({
    suggestion: toSuggestion(data, slug ?? '', ''),
  });
}

// ---------------------------------------------------------------------------
// Client: accept
// ---------------------------------------------------------------------------

const acceptSchema = z.object({ time: isoTime });

/** POST /api/suggestions/:id/accept `{ time }`: books the chosen time and the rest of the series. */
export async function acceptSuggestion(
  request: NextRequest,
  suggestionId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const id = z.string().uuid().safeParse(suggestionId);
  const body = acceptSchema.safeParse(await readJson(request));
  if (!id.success || !body.success) return invalidInput();

  const { data, error } = await supabase
    .rpc('accept_session_suggestion', {
      p_suggestion_id: id.data,
      p_time: new Date(body.data.time).toISOString(),
    })
    .single<SuggestionRow>();
  if (error || !data)
    return error
      ? ruleError(error)
      : fail('server_error', 'That could not be booked.', 500);

  // The client's own view of the professional's slug.
  const { data: pairs } = await supabase.rpc('my_conversations_safe', {
    p_as: 'client',
  });
  const slug =
    ((pairs ?? []) as { professional_id: string; slug: string }[]).find(
      (row) => row.professional_id === data.professional_id,
    )?.slug ?? '';
  return json<SuggestionResponse>({ suggestion: toSuggestion(data, slug, '') });
}

// ---------------------------------------------------------------------------
// Quick replies
// ---------------------------------------------------------------------------

async function loadQuickReplies(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('quick_replies')
    .select('id, body')
    .eq('professional_id', userId)
    .order('position');
  if (error) return null;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    text: row.body as string,
  }));
}

/** GET /api/pro/quick-replies */
export async function getQuickReplies() {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;
  const quickReplies = await loadQuickReplies(guard.supabase, guard.userId);
  if (!quickReplies)
    return fail('server_error', 'We could not load your quick replies.', 500);
  return json<QuickRepliesResponse>({ quickReplies });
}

const quickRepliesSchema = z.object({
  quickReplies: z
    .array(z.object({ text: z.string().trim().min(1).max(MAX_QUICK_REPLY) }))
    .max(MAX_QUICK_REPLIES),
});

/** PUT /api/pro/quick-replies `{ quickReplies: [{ text }] }`: replaces the whole list. */
export async function saveQuickReplies(request: NextRequest) {
  const guard = await requireRole('professional', 'admin');
  if (!guard.ok) return guard.response;

  const body = quickRepliesSchema.safeParse(await readJson(request));
  if (!body.success) return invalidInput();

  const { error } = await guard.supabase.rpc('save_quick_replies', {
    p_bodies: body.data.quickReplies.map((item) => item.text),
  });
  if (error) return ruleError(error);
  const quickReplies = await loadQuickReplies(guard.supabase, guard.userId);
  return json<QuickRepliesResponse>({ quickReplies: quickReplies ?? [] });
}

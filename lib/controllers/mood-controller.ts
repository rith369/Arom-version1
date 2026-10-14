import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  cambodiaDay,
  lastDays,
  moodLevelSchema,
  moodSourceSchema,
  type MoodLevel,
  type MoodWeekResponse,
  type TodayMoodResponse,
} from "@/lib/mood";
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

/** GET /api/progress: the last 7 Cambodia days, with gaps for missed days. */
export async function getMoodWeek() {
  const session = await signedIn();
  if (!session) return unauthorized();

  const days = lastDays(cambodiaDay(Date.now()));
  const { data, error } = await session.supabase
    .from("mood_checkins")
    .select("checked_in_on, mood")
    .eq("user_id", session.userId)
    .gte("checked_in_on", days[0])
    .lte("checked_in_on", days[days.length - 1])
    .returns<MoodRow[]>();
  if (error) return fail("server_error", "Your week could not be loaded.", 500);

  const byDay = new Map((data ?? []).map((row) => [row.checked_in_on, row.mood]));
  return json<MoodWeekResponse>({
    days: days.map((day) => ({ day, mood: byDay.get(day) ?? null })),
    checkIns: byDay.size,
  });
}

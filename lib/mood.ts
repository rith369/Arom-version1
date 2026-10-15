import { z } from "zod";

// Daily mood check in and the Progress week (BACKEND-HANDOFF.md section 22).
// One mood per person per Cambodia day, saved in `mood_checkins`. A mood is
// private health data: it never goes in a URL, browser storage or a log.
// Types and rules shared by the browser and the API.

export const MOOD_LEVELS = ["very_low", "low", "okay", "good", "great"] as const;
export type MoodLevel = (typeof MOOD_LEVELS)[number];

export const moodLevelSchema = z.enum(MOOD_LEVELS);
export const moodSourceSchema = z.enum(["home", "journal", "plan"]);
export type MoodSource = z.infer<typeof moodSourceSchema>;

export const MOOD_LABELS: Record<MoodLevel, { en: string; km: string }> = {
  very_low: { en: "Very Low", km: "ពិបាកខ្លាំង (Very Low)" },
  low: { en: "Low", km: "មិនសូវល្អ (Low)" },
  okay: { en: "Okay", km: "ធម្មតា (Okay)" },
  good: { en: "Good", km: "ស្រួលចិត្ត (Good)" },
  great: { en: "Great", km: "រីករាយ (Great)" },
};

/** 1 (very low) to 5 (great), for drawing the chart. Never shown as a score. */
export function moodStep(mood: MoodLevel) {
  return MOOD_LEVELS.indexOf(mood) + 1;
}

/** POST /api/mood-checkins answer: the Cambodia day it was saved for. */
export type TodayMoodResponse = { day: string; mood: MoodLevel | null };

/** One day of the Progress week. `mood` is null on a day without a check in. */
export type MoodDay = { day: string; mood: MoodLevel | null };

/** GET /api/progress: the last 7 Cambodia days, oldest first, today last. */
export type MoodWeekResponse = { days: MoodDay[]; checkIns: number };

export const PROGRESS_DAYS = 7;

/**
 * Progress ranges. 7 days is connected (GET /api/progress). 30 days and
 * 3 months are sample data in the browser until the backend answers
 * GET /api/progress?range=30d|90d with the same MoodWeekResponse shape
 * (BACKEND-HANDOFF.md section 22).
 */
export const PROGRESS_RANGES = ["7d", "30d", "90d"] as const;
export type ProgressRange = (typeof PROGRESS_RANGES)[number];
export const RANGE_DAYS: Record<ProgressRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

/** How many check ins had each mood. Counts only, never a score. */
export function moodCounts(days: MoodDay[]): Record<MoodLevel, number> {
  const counts = Object.fromEntries(MOOD_LEVELS.map((level) => [level, 0])) as Record<MoodLevel, number>;
  for (const entry of days) if (entry.mood) counts[entry.mood] += 1;
  return counts;
}

// ---------- Dates (Cambodia) ----------

export function cambodiaDay(now: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Phnom_Penh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function shiftDay(day: string, days: number) {
  const next = new Date(`${day}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

/** The last `count` days ending today, oldest first. */
export function lastDays(today: string, count = PROGRESS_DAYS) {
  return Array.from({ length: count }, (_, index) => shiftDay(today, index - (count - 1)));
}

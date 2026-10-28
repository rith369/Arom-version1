import { moodCounts, moodStep, type MoodDay, type MoodLevel } from "@/lib/mood";

// My patterns (BACKEND-HANDOFF.md section 38): plain facts from the person's
// own mood check ins over 3 months. Worked out in the browser, so no endpoint,
// and never shared. Like the Progress insights, it never compares with earlier
// weeks and never judges hard days.

export const PATTERN_MIN_CHECK_INS = 10;

export type Pattern = { kind: "weekday" | "even" | "hard" | "no_hard"; en: string; km: string };

const weekdayName = (weekday: number, locale: string) =>
  // 2026-10-04 is a Sunday, so adding the weekday number gives that day.
  new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2026, 9, 4 + weekday)));

export function moodPatterns(days: MoodDay[]): Pattern[] {
  const checked = days.filter((entry): entry is MoodDay & { mood: MoodLevel } => entry.mood !== null);
  if (checked.length < PATTERN_MIN_CHECK_INS) return [];
  const patterns: Pattern[] = [];

  // Average mood per weekday, from weekdays with at least 2 check ins.
  const byWeekday = new Map<number, number[]>();
  for (const entry of checked) {
    const weekday = new Date(`${entry.day}T00:00:00Z`).getUTCDay();
    byWeekday.set(weekday, [...(byWeekday.get(weekday) ?? []), moodStep(entry.mood)]);
  }
  const averages = [...byWeekday.entries()]
    .filter(([, steps]) => steps.length >= 2)
    .map(([weekday, steps]) => ({ weekday, average: steps.reduce((total, step) => total + step, 0) / steps.length }));
  if (averages.length >= 3) {
    const best = averages.reduce((top, item) => (item.average > top.average ? item : top));
    const hardest = averages.reduce((low, item) => (item.average < low.average ? item : low));
    if (best.average - hardest.average >= 0.75) {
      patterns.push({
        kind: "weekday",
        en: `Your mood tends to be best on ${weekdayName(best.weekday, "en-US")}s and hardest on ${weekdayName(hardest.weekday, "en-US")}s. Plan something small and kind for yourself on ${weekdayName(hardest.weekday, "en-US")}s.`,
        km: `អារម្មណ៍របស់អ្នកច្រើនតែល្អបំផុតនៅថ្ងៃ${weekdayName(best.weekday, "km-KH")} និងពិបាកបំផុតនៅថ្ងៃ${weekdayName(hardest.weekday, "km-KH")}។ សូមគ្រោងធ្វើរឿងតូចមួយដែលល្អសម្រាប់ខ្លួនឯង នៅថ្ងៃ${weekdayName(hardest.weekday, "km-KH")}។`,
      });
    } else {
      patterns.push({
        kind: "even",
        en: "Your mood is about the same on every day of the week. What happens in your day matters more than which day it is.",
        km: "អារម្មណ៍របស់អ្នកប្រហាក់ប្រហែលគ្នារៀងរាល់ថ្ងៃក្នុងសប្តាហ៍។ អ្វីដែលកើតឡើងក្នុងថ្ងៃរបស់អ្នក សំខាន់ជាងថាវាជាថ្ងៃអ្វី។",
      });
    }
  }

  const counts = moodCounts(days);
  const hard = counts.low + counts.very_low;
  patterns.push(
    hard === 0
      ? {
          kind: "no_hard",
          en: `None of your ${checked.length} check ins were Low or Very Low.`,
          km: `គ្មានការកត់ត្រាណាមួយក្នុងចំណោម ${checked.length} ដែលជា មិនសូវល្អ ឬ ពិបាកខ្លាំង ទេ។`,
        }
      : {
          kind: "hard",
          en: `${hard} of your ${checked.length} check ins were Low or Very Low. Hard days are part of life, and you noticed them.`,
          km: `${hard} ក្នុងចំណោមការកត់ត្រា ${checked.length} របស់អ្នក គឺ មិនសូវល្អ ឬ ពិបាកខ្លាំង។ ថ្ងៃលំបាកជាផ្នែកមួយនៃជីវិត ហើយអ្នកបានកត់សម្គាល់ពួកវា។`,
        },
  );

  return patterns;
}

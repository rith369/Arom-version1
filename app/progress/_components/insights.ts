import { MOOD_LABELS, MOOD_LEVELS, moodCounts, type MoodDay, type MoodLevel } from '@/lib/mood';

// Insights tab (BACKEND-HANDOFF.md section 22): plain facts worked out from
// the person's own check ins. Never a score, never better or worse, never a
// comparison with earlier weeks. Worked out in the browser, so no endpoint.

export type InsightKind = 'checkins' | 'common' | 'range' | 'weekday' | 'hard';

export type Insight = { kind: InsightKind; en: string; km: string };

const label = (mood: MoodLevel) => MOOD_LABELS[mood];

const weekdayName = (day: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(new Date(`${day}T00:00:00Z`));

export function moodInsights(days: MoodDay[]): Insight[] {
  const checked = days.filter((entry): entry is MoodDay & { mood: MoodLevel } => entry.mood !== null);
  if (checked.length === 0) return [];
  const insights: Insight[] = [];

  insights.push({
    kind: 'checkins',
    en: `You checked in on ${checked.length} of the last ${days.length} days.`,
    km: `អ្នកបានកត់ត្រាអារម្មណ៍ ${checked.length} ក្នុងចំណោម ${days.length} ថ្ងៃចុងក្រោយ។`,
  });

  // Most common mood; two moods share it at most, more is not a pattern.
  // With one check in there is nothing more to say than what it was.
  const counts = moodCounts(days);
  const most = Math.max(...Object.values(counts));
  const top = MOOD_LEVELS.filter((level) => counts[level] === most);
  if (checked.length === 1) {
    insights.push({
      kind: 'common',
      en: `Your one check in was ${label(checked[0].mood).en}.`,
      km: `ការកត់ត្រាតែមួយរបស់អ្នកគឺ ${label(checked[0].mood).km}។`,
    });
    return insights;
  }
  if (top.length === 1) {
    insights.push({
      kind: 'common',
      en: `Your most common mood was ${label(top[0]).en}, on ${most} ${most === 1 ? 'day' : 'days'}.`,
      km: `អារម្មណ៍ដែលអ្នកជ្រើសញឹកញាប់ជាងគេគឺ ${label(top[0]).km} ចំនួន ${most} ថ្ងៃ។`,
    });
  } else if (top.length === 2 && most > 1) {
    insights.push({
      kind: 'common',
      en: `${label(top[0]).en} and ${label(top[1]).en} were your most common moods, ${most} days each.`,
      km: `${label(top[0]).km} និង ${label(top[1]).km} ជាអារម្មណ៍ដែលអ្នកជ្រើសញឹកញាប់ជាងគេ នីមួយៗ ${most} ថ្ងៃ។`,
    });
  }

  // The span of moods chosen, lowest to highest.
  const levels = checked.map((entry) => MOOD_LEVELS.indexOf(entry.mood));
  const low = MOOD_LEVELS[Math.min(...levels)];
  const high = MOOD_LEVELS[Math.max(...levels)];
  insights.push(
    low === high
      ? { kind: 'range', en: `Every check in was ${label(low).en}.`, km: `ការកត់ត្រាទាំងអស់គឺ ${label(low).km}។` }
      : {
          kind: 'range',
          en: `Your check ins went from ${label(low).en} to ${label(high).en}.`,
          km: `ការកត់ត្រារបស់អ្នកមានចាប់ពី ${label(low).km} ដល់ ${label(high).km}។`,
        },
  );

  // The weekday checked in most, only when there is enough to be a pattern.
  if (days.length > 7 && checked.length >= 8) {
    const byWeekday = new Map<number, { count: number; day: string }>();
    for (const entry of checked) {
      const weekday = new Date(`${entry.day}T00:00:00Z`).getUTCDay();
      const current = byWeekday.get(weekday);
      byWeekday.set(weekday, { count: (current?.count ?? 0) + 1, day: entry.day });
    }
    const sorted = [...byWeekday.values()].sort((a, b) => b.count - a.count);
    if (sorted.length > 1 && sorted[0].count > sorted[1].count) {
      insights.push({
        kind: 'weekday',
        en: `You checked in most on ${weekdayName(sorted[0].day, 'en-US')}s, ${sorted[0].count} times.`,
        km: `អ្នកកត់ត្រាញឹកញាប់ជាងគេនៅថ្ងៃ${weekdayName(sorted[0].day, 'km-KH')} ចំនួន ${sorted[0].count} ដង។`,
      });
    }
  }

  // Hard days are counted, never judged.
  const hard = counts.low + counts.very_low;
  if (hard > 0) {
    insights.push({
      kind: 'hard',
      en: `On ${hard} ${hard === 1 ? 'day' : 'days'} you chose Low or Very Low.`,
      km: `មាន ${hard} ថ្ងៃដែលអ្នកជ្រើស មិនសូវល្អ ឬ ពិបាកខ្លាំង។`,
    });
  }

  return insights;
}

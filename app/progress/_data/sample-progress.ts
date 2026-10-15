import { lastDays, type MoodDay, type MoodLevel, type MoodWeekResponse } from '@/lib/mood';

// SAMPLE DATA for 30 days and 3 months (BACKEND-HANDOFF.md section 22).
// The page labels it "Sample data". Replace with GET /api/progress?range=30d
// or 90d, which returns the same MoodWeekResponse shape as the 7 day view.
// A fixed pattern, so it looks the same on every visit; null = no check in.

const PATTERN: (MoodLevel | null)[] = [
  'okay', 'good', null, 'good', 'low', 'okay', 'great',
  'good', null, 'okay', 'very_low', 'low', 'okay', null,
  'good', 'good', 'great', null, 'okay', 'low', 'good',
];

export function sampleProgress(today: string, count: number): MoodWeekResponse {
  const days: MoodDay[] = lastDays(today, count).map((day, index) => ({
    day,
    mood: PATTERN[index % PATTERN.length],
  }));
  return { days, checkIns: days.filter((entry) => entry.mood).length };
}

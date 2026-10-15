import { ALL_LESSONS } from '../../_components/learn/learn-data';
import { ALL_PRACTICES } from '../../_components/practice/practice-data';
import { lastDays } from '@/lib/mood';

// SAMPLE DATA for the Activities tab (BACKEND-HANDOFF.md section 22). The page
// labels it "Sample data". Replace with GET /api/progress/activities?range=,
// which returns ActivitiesResponse. Practices and lessons are real items from
// the app; a journal entry is only ever a date, never its words.

export type ActivityKind = 'practice' | 'lesson' | 'journal';

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  // The practice or lesson id (ALL_PRACTICES / ALL_LESSONS); null for journal.
  refId: string | null;
  // Cambodia date the activity was done.
  day: string;
};

export type ActivitiesResponse = {
  counts: Record<ActivityKind, number>;
  // Newest first, at most 20.
  recent: ActivityItem[];
};

export function sampleActivities(today: string, count: number): ActivitiesResponse {
  const items: ActivityItem[] = [];
  lastDays(today, count).forEach((day, index) => {
    if (index % 2 === 0) {
      const practice = ALL_PRACTICES[index % ALL_PRACTICES.length];
      items.push({ id: `p-${day}`, kind: 'practice', refId: practice.id, day });
    }
    if (index % 3 === 1) {
      const lesson = ALL_LESSONS[index % ALL_LESSONS.length];
      items.push({ id: `l-${day}`, kind: 'lesson', refId: lesson.id, day });
    }
    if (index % 4 === 3) items.push({ id: `j-${day}`, kind: 'journal', refId: null, day });
  });

  const counts = { practice: 0, lesson: 0, journal: 0 };
  for (const item of items) counts[item.kind] += 1;
  return { counts, recent: items.reverse().slice(0, 20) };
}

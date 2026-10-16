'use client';

import { useMoodRange, type RangeState } from '../../_components/mood/mood-store';
import type { MoodLevel, ProgressRange } from '@/lib/mood';

export type ProgressData = RangeState & {
  today: MoodLevel | null;
  range: ProgressRange;
};

/**
 * The person's own check ins for a range, all real: 7 days with the week the
 * Home page uses, 30 days and 3 months from GET /api/progress?range=.
 */
export function useProgress(range: ProgressRange): ProgressData {
  return { ...useMoodRange(range), range };
}

'use client';

import { useState } from 'react';

import { useMoodStore, type MoodState } from '../../_components/mood/mood-store';
import { RANGE_DAYS, cambodiaDay, type ProgressRange } from '@/lib/mood';
import { sampleProgress } from '../_data/sample-progress';

export type ProgressData = MoodState & {
  range: ProgressRange;
  // True for 30 days and 3 months until the backend serves them.
  sample: boolean;
};

/**
 * The person's own check ins for a range. 7 days comes from /api/progress
 * (real). 30 days and 3 months are sample data, but only once the real week
 * has loaded, so signed out visitors never see made up moods.
 */
export function useProgress(range: ProgressRange): ProgressData {
  const mood = useMoodStore();
  const [today] = useState(() => cambodiaDay(Date.now()));

  if (range === '7d' || mood.status !== 'ready') return { ...mood, range, sample: false };

  const sample = sampleProgress(today, RANGE_DAYS[range]);
  return { ...mood, days: sample.days, checkIns: sample.checkIns, range, sample: true };
}

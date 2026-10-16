'use client';

import { useEffect, useState } from 'react';

import type { ActivitiesResponse } from '@/lib/activities';
import type { ProgressRange } from '@/lib/mood';

export type ActivitiesState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: ActivitiesResponse };

/** Finished practices and lessons, and journal days, from GET /api/progress/activities. */
export function useActivities(range: ProgressRange, enabled: boolean) {
  const [result, setResult] = useState<{ key: string; state: ActivitiesState } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${range}:${attempt}`;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetch(`/api/progress/activities?range=${range}`, { cache: 'no-store' })
      .then(async (response) => {
        const data = response.ok ? ((await response.json().catch(() => null)) as ActivitiesResponse | null) : null;
        if (active) setResult({ key, state: data ? { status: 'ready', data } : { status: 'error' } });
      })
      .catch(() => {
        if (active) setResult({ key, state: { status: 'error' } });
      });
    return () => {
      active = false;
    };
  }, [range, enabled, key]);

  const state: ActivitiesState = result?.key === key ? result.state : { status: 'loading' };
  return { state, retry: () => setAttempt((value) => value + 1) };
}

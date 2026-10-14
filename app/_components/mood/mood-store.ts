// Imported by client components only (it uses React hooks).
import { useEffect, useSyncExternalStore } from 'react';

import type { MoodDay, MoodLevel, MoodWeekResponse, TodayMoodResponse } from '@/lib/mood';

// Today's mood and the Progress week (BACKEND-HANDOFF.md section 22). Types
// and rules are in lib/mood.ts; this store loads them from /api/progress and
// saves through /api/mood-checkins. Moods stay in memory only, never in
// browser storage, because anyone using the same phone could read them.

export * from '@/lib/mood';

export type MoodStatus = 'loading' | 'signed_out' | 'ready' | 'error';

export type MoodState = {
  status: MoodStatus;
  days: MoodDay[];
  checkIns: number;
  // Today's mood, the last of `days`.
  today: MoodLevel | null;
};

const initial: MoodState = { status: 'loading', days: [], checkIns: 0, today: null };
let state: MoodState = initial;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: MoodState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Older versions kept today's mood in localStorage. Remove it once.
function clearOldBrowserMood() {
  try {
    localStorage.removeItem('arom_today_mood');
  } catch {
    // Storage blocked: nothing was saved there either.
  }
}

export function loadMoodWeek() {
  if (loading) return loading;
  loading = (async () => {
    try {
      const response = await fetch('/api/progress', { cache: 'no-store' });
      if (response.status === 401) {
        setState({ ...initial, status: 'signed_out' });
        return;
      }
      const data = (await response.json().catch(() => null)) as MoodWeekResponse | null;
      if (!response.ok || !data) {
        setState({ ...initial, status: 'error' });
        return;
      }
      setState({
        status: 'ready',
        days: data.days,
        checkIns: data.checkIns,
        today: data.days[data.days.length - 1]?.mood ?? null,
      });
    } catch {
      setState({ ...initial, status: 'error' });
    } finally {
      loading = null;
    }
  })();
  return loading;
}

export type SaveMoodResult = { ok: true } | { ok: false; signedOut: boolean };

/** Saves today's mood. The store changes only after the server confirms it. */
export async function saveTodayMood(mood: MoodLevel): Promise<SaveMoodResult> {
  try {
    const response = await fetch('/api/mood-checkins', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, source: 'home' }),
    });
    if (response.status === 401) {
      setState({ ...initial, status: 'signed_out' });
      return { ok: false, signedOut: true };
    }
    const data = (await response.json().catch(() => null)) as TodayMoodResponse | null;
    if (!response.ok || !data) return { ok: false, signedOut: false };

    const hadToday = state.days.some((entry) => entry.day === data.day && entry.mood);
    const days = state.days.some((entry) => entry.day === data.day)
      ? state.days.map((entry) => (entry.day === data.day ? { ...entry, mood } : entry))
      : state.days;
    setState({ ...state, days, today: mood, checkIns: state.checkIns + (hadToday ? 0 : 1) });
    return { ok: true };
  } catch {
    return { ok: false, signedOut: false };
  }
}

/** The mood week, loaded when the first component using it appears. */
export function useMoodStore() {
  const store = useSyncExternalStore(subscribe, () => state, () => initial);
  useEffect(() => {
    clearOldBrowserMood();
    if (state.status === 'loading' || state.status === 'error') void loadMoodWeek();
  }, []);
  return store;
}

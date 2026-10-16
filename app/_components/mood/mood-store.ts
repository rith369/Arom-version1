// Imported by client components only (it uses React hooks).
import { useEffect, useSyncExternalStore } from 'react';

import type { MoodDay, MoodLevel, MoodWeekResponse, ProgressRange, TodayMoodResponse } from '@/lib/mood';

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
  // The longer ranges, loaded the first time a page asks for them.
  ranges: Partial<Record<LongRange, RangeState>>;
};

type LongRange = Exclude<ProgressRange, '7d'>;
export type RangeState = { status: MoodStatus; days: MoodDay[]; checkIns: number };

const emptyRange: RangeState = { status: 'loading', days: [], checkIns: 0 };
const initial: MoodState = { status: 'loading', days: [], checkIns: 0, today: null, ranges: {} };
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
        ...state,
        status: 'ready',
        days: data.days,
        checkIns: data.checkIns,
        today: data.days[data.days.length - 1]?.mood ?? null,
      });
      for (const [range, entry] of Object.entries(state.ranges) as [LongRange, RangeState][]) {
        if (entry.status === 'error') void loadMoodRange(range);
      }
    } catch {
      setState({ ...initial, status: 'error' });
    } finally {
      loading = null;
    }
  })();
  return loading;
}

const rangeLoading: Partial<Record<LongRange, Promise<void>>> = {};

function setRange(range: LongRange, entry: RangeState) {
  setState({ ...state, ranges: { ...state.ranges, [range]: entry } });
}

/** Loads 30 days or 3 months from GET /api/progress?range=. */
export function loadMoodRange(range: LongRange) {
  const running = rangeLoading[range];
  if (running) return running;
  const next = (async () => {
    try {
      const response = await fetch(`/api/progress?range=${range}`, { cache: 'no-store' });
      if (response.status === 401) {
        setRange(range, { ...emptyRange, status: 'signed_out' });
        return;
      }
      const data = (await response.json().catch(() => null)) as MoodWeekResponse | null;
      if (!response.ok || !data) {
        setRange(range, { ...emptyRange, status: 'error' });
        return;
      }
      setRange(range, { status: 'ready', days: data.days, checkIns: data.checkIns });
    } catch {
      setRange(range, { ...emptyRange, status: 'error' });
    } finally {
      delete rangeLoading[range];
    }
  })();
  rangeLoading[range] = next;
  return next;
}

// Today's new mood, written into one list of days.
function withToday(entry: { days: MoodDay[]; checkIns: number }, day: string, mood: MoodLevel) {
  const index = entry.days.findIndex((item) => item.day === day);
  if (index === -1) return entry;
  const hadToday = Boolean(entry.days[index].mood);
  return {
    days: entry.days.map((item, i) => (i === index ? { ...item, mood } : item)),
    checkIns: entry.checkIns + (hadToday ? 0 : 1),
  };
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

    const week = withToday(state, data.day, mood);
    const ranges = Object.fromEntries(
      Object.entries(state.ranges).map(([range, entry]) => [range, { ...entry, ...withToday(entry, data.day, mood) }]),
    );
    setState({ ...state, ...week, today: mood, ranges });
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

/** One range of check ins: 7 days from the week, 30 days and 3 months on demand. */
export function useMoodRange(range: ProgressRange): RangeState & { today: MoodLevel | null } {
  const store = useMoodStore();
  useEffect(() => {
    if (range === '7d') return;
    const entry = state.ranges[range];
    if (!entry || entry.status === 'error') void loadMoodRange(range);
  }, [range]);
  if (range === '7d') return { status: store.status, days: store.days, checkIns: store.checkIns, today: store.today };
  // Signed out shows on the week first; keep the ranges consistent with it.
  if (store.status === 'signed_out') return { ...emptyRange, status: 'signed_out', today: null };
  return { ...(store.ranges[range] ?? emptyRange), today: store.today };
}

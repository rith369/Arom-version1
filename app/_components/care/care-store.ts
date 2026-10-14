// Imported by client components only (it uses React hooks).
import { useEffect, useSyncExternalStore } from 'react';

import {
  doneOn,
  doneOnce,
  type CareCheckIn,
  type CarePlanResponse,
  type CareTask,
  type NewCareTask,
} from '@/lib/care';

// Care tasks a professional gives a client between sessions
// (BACKEND-HANDOFF.md section 18). Types and rules are in lib/care.ts; this
// store loads them from the API: /api/care-plan for the client side and
// /api/pro/care for the professional side.

export * from '@/lib/care';

export type CareSide = 'client' | 'professional';

type SideState = CarePlanResponse & { status: 'loading' | 'ready' | 'error' };

const empty: SideState = { status: 'loading', tasks: [], checkIns: [], sharing: {}, professionals: [] };

type State = Record<CareSide, SideState>;

const initial: State = { client: empty, professional: empty };
let state: State = initial;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const URLS: Record<CareSide, string> = { client: '/api/care-plan', professional: '/api/pro/care' };

export type CareResult = { ok: true } | { ok: false; message: string };

async function call(side: CareSide, url: string, init?: RequestInit): Promise<CareResult> {
  try {
    const response = await fetch(url, { cache: 'no-store', ...init });
    const data = (await response.json().catch(() => null)) as (CarePlanResponse & { error?: { message?: string } }) | null;
    if (!response.ok || !data) {
      if (state[side].status === 'loading') setState({ ...state, [side]: { ...empty, status: 'error' } });
      return { ok: false, message: data?.error?.message ?? 'That could not be saved.' };
    }
    setState({ ...state, [side]: { ...data, status: 'ready' } });
    return { ok: true };
  } catch {
    if (state[side].status === 'loading') setState({ ...state, [side]: { ...empty, status: 'error' } });
    return { ok: false, message: 'Could not reach the server. Check your connection.' };
  }
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export function loadCarePlan(side: CareSide) {
  return call(side, URLS[side]);
}

/** The care data for one side, loaded when the first component using it appears. */
export function useCareStore(side: CareSide) {
  const store = useSyncExternalStore(subscribe, () => state, () => initial);
  useEffect(() => {
    void loadCarePlan(side);
  }, [side]);
  return store[side];
}

// ---------- Professional ----------

/** Gives tasks one by one. Stops at the first one the server refuses. */
export async function addCareTasks(tasks: NewCareTask[]): Promise<CareResult> {
  for (const task of tasks) {
    const result = await call('professional', URLS.professional, jsonInit('POST', task));
    if (!result.ok) return result;
  }
  return { ok: true };
}

export function stopCareTask(id: string) {
  return call('professional', `/api/pro/care/${id}/stop`, { method: 'POST' });
}

// ---------- Client ----------

// The client ticks or unticks a task for a date. Shown at once, then saved.
export async function toggleCheckIn(task: CareTask, date: string): Promise<CareResult> {
  const current = state.client;
  const done = task.repeat.type === 'once' ? doneOnce(task, current.checkIns) : doneOn(task, current.checkIns, date);
  const checkIns: CareCheckIn[] = done
    ? current.checkIns.filter((item) => !(item.taskId === task.id && (task.repeat.type === 'once' || item.date === date)))
    : [...current.checkIns, { taskId: task.id, date, doneAt: new Date().toISOString() }];
  setState({ ...state, client: { ...current, checkIns } });

  const result = await call('client', '/api/care-plan/check-ins', jsonInit('POST', { taskId: task.id, date, done: !done }));
  if (!result.ok) await loadCarePlan('client');
  return result;
}

export async function setProgressSharing(professionalId: string, clientId: string, value: boolean): Promise<CareResult> {
  const current = state.client;
  setState({ ...state, client: { ...current, sharing: { ...current.sharing, [`${professionalId}:${clientId}`]: value } } });
  const result = await call('client', '/api/care-plan/sharing', jsonInit('PUT', { professionalId, share: value }));
  if (!result.ok) await loadCarePlan('client');
  return result;
}

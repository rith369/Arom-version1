// Imported by client components only (it uses React hooks).
import { useSyncExternalStore } from 'react';

import type { SessionSuggestion, SuggestionResponse } from '@/lib/sessions';

// Session suggestions shown in the chat (BACKEND-HANDOFF.md section 19).
// Types and rules are in lib/sessions.ts. Suggestions arrive with each chat
// thread (message-store.ts) and change through the API below.

export * from '@/lib/sessions';

type State = { suggestions: Record<string, SessionSuggestion> };

const initial: State = { suggestions: {} };
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

export function useSessionStore() {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

/** Adds or replaces suggestions loaded from the API. */
export function mergeSuggestions(list: SessionSuggestion[]) {
  if (list.length === 0) return;
  const suggestions = { ...state.suggestions };
  let changed = false;
  for (const item of list) {
    if (JSON.stringify(suggestions[item.id]) === JSON.stringify(item)) continue;
    // The thread does not know the client's name on the client side; keep one we already have.
    suggestions[item.id] = { ...item, clientName: item.clientName || suggestions[item.id]?.clientName || '' };
    changed = true;
  }
  if (changed) setState({ suggestions });
}

type Result<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

async function post<T>(url: string, body?: unknown): Promise<Result<T>> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      ...(body === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
    const data = (await response.json().catch(() => null)) as (T & { error?: { message?: string } }) | null;
    if (!response.ok || !data) return { ok: false, status: response.status, message: data?.error?.message ?? 'That could not be saved.' };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, message: 'Could not reach the server. Check your connection.' };
  }
}

export async function createSuggestion(
  suggestion: Pick<SessionSuggestion, 'clientId' | 'clientName' | 'sessionType' | 'times' | 'repeat' | 'note'>,
): Promise<{ ok: true; suggestion: SessionSuggestion } | { ok: false; message: string }> {
  const { clientName, ...body } = suggestion;
  const result = await post<SuggestionResponse>('/api/pro/suggestions', body);
  if (!result.ok) return result;
  const created = { ...result.data.suggestion, clientName };
  mergeSuggestions([created]);
  return { ok: true, suggestion: created };
}

export async function withdrawSuggestion(id: string) {
  const result = await post<SuggestionResponse>(`/api/pro/suggestions/${id}/withdraw`);
  if (result.ok) mergeSuggestions([result.data.suggestion]);
  return result.ok;
}

// The client books one of the suggested times (and the rest of the series).
export async function acceptSuggestion(id: string, time: string): Promise<'booked' | 'taken' | 'closed' | 'failed'> {
  const result = await post<SuggestionResponse>(`/api/suggestions/${id}/accept`, { time });
  if (result.ok) {
    mergeSuggestions([result.data.suggestion]);
    return 'booked';
  }
  return result.status === 409 ? 'taken' : result.status === 404 ? 'closed' : 'failed';
}

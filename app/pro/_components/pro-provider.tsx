'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { FREE_DURING_TESTING } from '@/lib/pricing';
import type { ProData } from '@/lib/controllers/pro-controller';
import {
  REVIEWED_FIELDS,
  type PendingChange,
  type ProProfile,
  type ReviewedField,
} from '../_data/profile';
import { emptySchedule, hasOpenTimes, type Schedule } from '../_data/schedule';
import type { ProBooking, SessionNote } from '../_data/bookings';
import { useLanguage } from '../../_components/language-provider';

// The signed in professional's own data, from /api/pro/me (BACKEND-HANDOFF.md
// section 16). Profile, schedule, bookings and session notes are saved in the
// database. Prep notes, client summary notes and archived clients are still
// kept in memory only.

export type ActionResult = { ok: true } | { ok: false; message: string };

export type SaveResult =
  | {
      ok: true;
      // Fields that changed on the public profile right away.
      applied: (keyof ProProfile)[];
      // Fields that now wait for an admin.
      pending: ReviewedField[];
      // The saved profile (reviewed fields keep their live value).
      profile: ProProfile;
    }
  | { ok: false; message: string };

type ProState = {
  // What users see (or will see once the profile is complete).
  profile: ProProfile;
  pendingChanges: PendingChange[];
  // True when users can find and book this professional.
  listed: boolean;
  hasSchedule: boolean;
  schedule: Schedule;
  saveSchedule: (next: Schedule) => Promise<ActionResult>;
  bookings: ProBooking[];
  sessionNotes: Record<string, SessionNote>;
  cancelBooking: (id: string, reason: string) => Promise<ActionResult>;
  rescheduleBooking: (id: string, startsAt: string, reason: string) => Promise<ActionResult>;
  setBookingOutcome: (id: string, status: 'completed' | 'no_show') => Promise<ActionResult>;
  saveSessionNote: (id: string, text: string) => Promise<ActionResult>;
  setMeetingLink: (id: string, meetingUrl: string) => Promise<ActionResult>;
  // A private plan written before a session ("things to bring up"). Memory only.
  prepNotes: Record<string, SessionNote>;
  savePrepNote: (id: string, text: string) => void;
  // One pinned summary per client, private to the professional. Memory only.
  summaryNotes: Record<string, SessionNote>;
  saveSummaryNote: (clientId: string, text: string) => void;
  archivedClients: string[];
  setClientArchived: (clientId: string, archived: boolean) => void;
  freeDuringTesting: boolean;
  saveProfile: (next: ProProfile) => Promise<SaveResult>;
  withdrawChange: (field: ReviewedField) => Promise<void>;
  // Changes when fresh data arrives, so editors can reset their drafts.
  version: number;
};

const ProContext = createContext<ProState | null>(null);

const NETWORK_ERROR = 'Could not reach the server. Check your connection.';

async function request<T>(url: string, init?: RequestInit): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const response = await fetch(url, { cache: 'no-store', ...init });
    const data = (await response.json().catch(() => null)) as (T & { error?: { message?: string } }) | null;
    if (!response.ok || data === null) {
      return { ok: false, message: data?.error?.message ?? 'That could not be saved.' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, message: NETWORK_ERROR };
  }
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/** Uploads a photo chosen in the editor (a data URL) and returns its public URL. */
async function uploadPhoto(dataUrl: string): Promise<string | null> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const body = new FormData();
    body.set('photo', new File([blob], 'photo', { type: blob.type }));
    const result = await request<{ url: string }>('/api/pro/photo', { method: 'POST', body });
    return result.ok ? result.data.url : null;
  } catch {
    return null;
  }
}

export function ProProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage();
  const km = language === 'km';
  const [data, setData] = useState<ProData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [version, setVersion] = useState(0);
  const [prepNotes, setPrepNotes] = useState<Record<string, SessionNote>>({});
  const [summaryNotes, setSummaryNotes] = useState<Record<string, SessionNote>>({});
  const [archivedClients, setArchivedClients] = useState<string[]>([]);

  const applyData = useCallback((next: ProData) => {
    setData(next);
    setVersion((value) => value + 1);
  }, []);

  const load = useCallback(async () => {
    const result = await request<ProData>('/api/pro/me');
    if (result.ok) {
      applyData(result.data);
      setLoadError(false);
    } else {
      setLoadError(true);
    }
  }, [applyData]);

  useEffect(() => {
    // Loading from the API on mount is what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center">
        {loadError ? (
          <div role="alert">
            <p className="text-sm text-arom-danger">
              {km ? 'មិនអាចផ្ទុកផ្នែកអ្នកជំនាញបានទេ។' : 'We could not load your professional area.'}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 rounded-full bg-arom px-5 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
              {km ? 'ព្យាយាមម្តងទៀត' : 'Try again'}
            </button>
          </div>
        ) : (
          <p role="status" className="text-sm text-ink-muted">
            {km ? 'កំពុងផ្ទុក...' : 'Loading...'}
          </p>
        )}
      </div>
    );
  }

  const profile = data.profile;
  const schedule = data.schedule ?? emptySchedule;

  async function bookingAction(id: string, body: Record<string, unknown>): Promise<ActionResult> {
    const result = await request<Pick<ProData, 'bookings' | 'sessionNotes'>>(
      `/api/pro/bookings/${id}`,
      jsonInit('POST', body),
    );
    if (!result.ok) return result;
    setData((current) => (current ? { ...current, ...result.data } : current));
    return { ok: true };
  }

  async function saveProfile(next: ProProfile): Promise<SaveResult> {
    let photoUrl = next.photoUrl;
    if (photoUrl.startsWith('data:')) {
      const uploaded = await uploadPhoto(photoUrl);
      if (!uploaded) return { ok: false, message: km ? 'មិនអាចផ្ទុករូបថតបានទេ។' : 'We could not upload your photo.' };
      photoUrl = uploaded;
    }

    const result = await request<ProData>('/api/pro/profile', jsonInit('PATCH', { ...next, photoUrl }));
    if (!result.ok) return result;

    const applied = (Object.keys(next) as (keyof ProProfile)[]).filter(
      (key) =>
        !(REVIEWED_FIELDS as readonly string[]).includes(key) &&
        JSON.stringify(next[key]) !== JSON.stringify(profile[key]),
    );
    const pending = result.data.pendingChanges
      .map((change) => change.field)
      .filter((field) => next[field].trim() !== profile[field].trim());
    applyData(result.data);
    return { ok: true, applied, pending, profile: result.data.profile };
  }

  async function saveSchedule(next: Schedule): Promise<ActionResult> {
    const result = await request<ProData>('/api/pro/schedule', jsonInit('PUT', next));
    if (!result.ok) return result;
    applyData(result.data);
    return { ok: true };
  }

  async function withdrawChange(field: ReviewedField) {
    await request(`/api/pro/profile/changes?field=${field}`, { method: 'DELETE' });
    await load();
  }

  const stamp = () => new Date().toISOString();

  return (
    <ProContext.Provider
      value={{
        profile,
        pendingChanges: data.pendingChanges,
        listed: data.listed,
        hasSchedule: hasOpenTimes(schedule),
        schedule,
        saveSchedule,
        bookings: data.bookings,
        sessionNotes: data.sessionNotes,
        // The reason is shown to the client.
        cancelBooking: (id, reason) => bookingAction(id, { action: 'cancel', reason }),
        rescheduleBooking: (id, startsAt, reason) => bookingAction(id, { action: 'reschedule', startsAt, reason }),
        setBookingOutcome: (id, status) => bookingAction(id, { action: 'outcome', status }),
        saveSessionNote: (id, text) => bookingAction(id, { action: 'note', text }),
        setMeetingLink: (id, meetingUrl) => bookingAction(id, { action: 'meeting', meetingUrl }),
        prepNotes,
        savePrepNote: (id, text) => setPrepNotes((current) => ({ ...current, [id]: { text, updatedAt: stamp() } })),
        summaryNotes,
        saveSummaryNote: (clientId, text) =>
          setSummaryNotes((current) => ({ ...current, [clientId]: { text, updatedAt: stamp() } })),
        archivedClients,
        setClientArchived: (clientId, archived) =>
          setArchivedClients((current) =>
            archived ? [...new Set([...current, clientId])] : current.filter((id) => id !== clientId),
          ),
        freeDuringTesting: FREE_DURING_TESTING,
        saveProfile,
        withdrawChange,
        version,
      }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  const context = useContext(ProContext);
  if (!context) throw new Error('usePro must be used inside ProProvider');
  return context;
}

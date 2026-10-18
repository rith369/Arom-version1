'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
import { withClientLabels, type SharedByClient } from '../_data/clients';
import { useLanguage } from '../../_components/language-provider';

// The signed in professional's own data, from /api/pro/me (BACKEND-HANDOFF.md
// section 16). Everything here is saved in the database.

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
  // An admin's test profile: only admins can find and book it.
  isTest: boolean;
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
  // A private plan written before a session ("things to bring up").
  prepNotes: Record<string, SessionNote>;
  savePrepNote: (id: string, text: string) => Promise<ActionResult>;
  // One pinned summary per client, private to the professional.
  summaryNotes: Record<string, SessionNote>;
  saveSummaryNote: (clientId: string, text: string) => Promise<ActionResult>;
  // Archiving closes the conversation with that client (read only for both).
  archivedClients: string[];
  // Suggested sessions the client has not chosen yet.
  openSuggestions: ProData['openSuggestions'];
  setClientArchived: (clientId: string, archived: boolean) => Promise<ActionResult>;
  freeDuringTesting: boolean;
  saveProfile: (next: ProProfile) => Promise<SaveResult>;
  withdrawChange: (field: ReviewedField) => Promise<void>;
  // Changes when fresh data arrives, so editors can reset their drafts.
  version: number;
};

const ProContext = createContext<ProState | null>(null);

const NETWORK_ERROR = 'Could not reach the server. Check your connection.';

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; message: string; status: number }> {
  try {
    const response = await fetch(url, { cache: 'no-store', ...init });
    const data = (await response.json().catch(() => null)) as (T & { error?: { message?: string } }) | null;
    if (!response.ok || data === null) {
      return { ok: false, message: data?.error?.message ?? 'That could not be saved.', status: response.status };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, message: NETWORK_ERROR, status: 0 };
  }
}

// Why the area could not open: not a professional account (admins can open
// /pro but have no professional profile), no profile row yet, or a failure.
type LoadError = 'not_professional' | 'no_profile' | 'failed';

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
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [version, setVersion] = useState(0);

  const applyData = useCallback((next: ProData) => {
    setData(next);
    setVersion((value) => value + 1);
  }, []);

  const load = useCallback(async () => {
    const result = await request<ProData>('/api/pro/me');
    if (result.ok) {
      applyData(result.data);
      setLoadError(null);
    } else {
      setLoadError(result.status === 403 ? 'not_professional' : result.status === 404 ? 'no_profile' : 'failed');
    }
  }, [applyData]);

  useEffect(() => {
    // Loading from the API on mount is what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // Every pro screen reads client names from here, so anonymous clients get
  // their numbered label everywhere, in the current language.
  const bookings = useMemo(() => (data ? withClientLabels(data.bookings, language) : []), [data, language]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6 text-center">
        {loadError === 'not_professional' || loadError === 'no_profile' ? (
          <div role="alert" className="max-w-md">
            <p className="text-base font-semibold text-ink">
              {loadError === 'not_professional'
                ? km
                  ? 'ផ្នែកនេះសម្រាប់គណនីអ្នកជំនាញ'
                  : 'This area is for professional accounts'
                : km
                  ? 'ប្រវត្តិរូបអ្នកជំនាញរបស់អ្នកមិនទាន់រៀបចំនៅឡើយ'
                  : 'Your professional profile is not set up yet'}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              {loadError === 'not_professional'
                ? km
                  ? 'គណនីនេះមិនមែនជាអ្នកជំនាញទេ ដូច្នេះមិនមានប្រវត្តិរូប កាលវិភាគ ឬការណាត់ជួបទេ។ សូមចូលដោយគណនីអ្នកជំនាញ ឬដាក់ពាក្យក្លាយជាអ្នកជំនាញ។ ប្រសិនបើអ្នកទើបត្រូវបានអនុម័ត សូមចាកចេញ ហើយចូលម្តងទៀត។'
                  : 'This account is not a professional, so it has no profile, schedule or bookings. Log in with a professional account, or apply to become one. If you were just approved, log out and log in again.'
                : km
                  ? 'គណនីរបស់អ្នកជាអ្នកជំនាញ ប៉ុន្តែមិនមានប្រវត្តិរូបទេ។ សូមទាក់ទងក្រុម AROM។'
                  : 'Your account is a professional, but it has no profile yet. Please contact the AROM team.'}
            </p>
            <Link href="/" className="mt-4 inline-block rounded-full bg-arom px-5 py-2 text-sm font-semibold text-white hover:bg-arom-deep">
              {km ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to home'}
            </Link>
          </div>
        ) : loadError === 'failed' ? (
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
    const result = await request<Pick<ProData, 'bookings' | 'sessionNotes' | 'prepNotes'>>(
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

  async function setClientArchived(clientId: string, archived: boolean): Promise<ActionResult> {
    const result = await request<{ archived: boolean }>(`/api/pro/clients/${clientId}`, jsonInit('POST', { archived }));
    if (!result.ok) return result;
    setData((current) =>
      current
        ? {
            ...current,
            archivedClients: archived
              ? [...new Set([...current.archivedClients, clientId])]
              : current.archivedClients.filter((id) => id !== clientId),
          }
        : current,
    );
    return { ok: true };
  }

  async function saveSummaryNote(clientId: string, text: string): Promise<ActionResult> {
    const result = await request<Pick<ProData, 'summaryNotes'>>(`/api/pro/clients/${clientId}`, jsonInit('POST', { summaryNote: text }));
    if (!result.ok) return result;
    setData((current) => (current ? { ...current, summaryNotes: result.data.summaryNotes } : current));
    return { ok: true };
  }

  async function withdrawChange(field: ReviewedField) {
    await request(`/api/pro/profile/changes?field=${field}`, { method: 'DELETE' });
    await load();
  }

  return (
    <ProContext.Provider
      value={{
        profile,
        pendingChanges: data.pendingChanges,
        listed: data.listed,
        isTest: data.isTest,
        hasSchedule: hasOpenTimes(schedule),
        schedule,
        saveSchedule,
        bookings,
        sessionNotes: data.sessionNotes,
        // The reason is shown to the client.
        cancelBooking: (id, reason) => bookingAction(id, { action: 'cancel', reason }),
        rescheduleBooking: (id, startsAt, reason) => bookingAction(id, { action: 'reschedule', startsAt, reason }),
        setBookingOutcome: (id, status) => bookingAction(id, { action: 'outcome', status }),
        saveSessionNote: (id, text) => bookingAction(id, { action: 'note', text }),
        setMeetingLink: (id, meetingUrl) => bookingAction(id, { action: 'meeting', meetingUrl }),
        prepNotes: data.prepNotes,
        savePrepNote: (id, text) => bookingAction(id, { action: 'prep', text }),
        summaryNotes: data.summaryNotes,
        saveSummaryNote,
        archivedClients: data.archivedClients,
        openSuggestions: data.openSuggestions,
        setClientArchived,
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

const NOTHING_SHARED: SharedByClient = { survey: null, symptomChecks: [], moods: null };

/** What one client shares with this professional. Loads only while they share something. */
export function useSharedByClient(clientId: string | undefined, sharing: boolean): SharedByClient {
  const [shared, setShared] = useState<{ clientId: string; data: SharedByClient } | null>(null);
  useEffect(() => {
    if (!clientId || !sharing) return;
    let active = true;
    fetch(`/api/pro/clients/${clientId}`, { cache: 'no-store' })
      .then((response) => (response.ok ? (response.json() as Promise<SharedByClient>) : null))
      .then((data) => {
        if (active && data) setShared({ clientId, data });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [clientId, sharing]);
  return shared && sharing && shared.clientId === clientId ? shared.data : NOTHING_SHARED;
}

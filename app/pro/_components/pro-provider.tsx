'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import { FREE_DURING_TESTING } from '@/lib/pricing';
import {
  REVIEWED_FIELDS,
  establishedProfile,
  newProfile,
  type PendingChange,
  type ProProfile,
  type ReviewedField,
} from '../_data/profile';
import {
  emptySchedule,
  establishedSchedule,
  hasOpenTimes,
  type Schedule,
} from '../_data/schedule';
import {
  sampleBookingsFor,
  type ProBooking,
  type SessionNote,
} from '../_data/bookings';

export type DemoMode = 'established' | 'new';

export type SaveResult = {
  // Fields that changed on the public profile right away.
  applied: (keyof ProProfile)[];
  // Fields that now wait for an admin.
  pending: ReviewedField[];
};

type ProState = {
  demoMode: DemoMode;
  switchDemo: (mode: DemoMode) => void;
  // What users see (or will see once the profile is complete).
  profile: ProProfile;
  pendingChanges: PendingChange[];
  hasSchedule: boolean;
  schedule: Schedule;
  saveSchedule: (next: Schedule) => void;
  bookings: ProBooking[];
  sessionNotes: Record<string, SessionNote>;
  cancelBooking: (id: string, reason: string) => void;
  rescheduleBooking: (id: string, startsAt: string, reason: string) => void;
  setBookingOutcome: (id: string, status: 'completed' | 'no_show') => void;
  saveSessionNote: (id: string, text: string) => void;
  // One pinned summary per client, private to the professional.
  summaryNotes: Record<string, SessionNote>;
  saveSummaryNote: (clientId: string, text: string) => void;
  archivedClients: string[];
  setClientArchived: (clientId: string, archived: boolean) => void;
  freeDuringTesting: boolean;
  saveProfile: (next: ProProfile) => SaveResult;
  withdrawChange: (field: ReviewedField) => void;
};

const ProContext = createContext<ProState | null>(null);

const isReviewed = (key: keyof ProProfile): key is ReviewedField =>
  (REVIEWED_FIELDS as readonly string[]).includes(key);

export function ProProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoMode] = useState<DemoMode>('established');
  const [profile, setProfile] = useState<ProProfile>(() => structuredClone(establishedProfile));
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [schedule, setSchedule] = useState<Schedule>(() => structuredClone(establishedSchedule));
  const [bookings, setBookings] = useState<ProBooking[]>(() => sampleBookingsFor(establishedProfile.slug));
  const [sessionNotes, setSessionNotes] = useState<Record<string, SessionNote>>({});
  const [summaryNotes, setSummaryNotes] = useState<Record<string, SessionNote>>({});
  const [archivedClients, setArchivedClients] = useState<string[]>([]);

  function updateBooking(id: string, change: Partial<ProBooking>) {
    setBookings((current) => current.map((item) => (item.id === id ? { ...item, ...change } : item)));
  }

  function switchDemo(mode: DemoMode) {
    setDemoMode(mode);
    setProfile(structuredClone(mode === 'established' ? establishedProfile : newProfile));
    setPendingChanges([]);
    setSchedule(structuredClone(mode === 'established' ? establishedSchedule : emptySchedule));
    setBookings(mode === 'established' ? sampleBookingsFor(establishedProfile.slug) : []);
    setSessionNotes({});
    setSummaryNotes({});
    setArchivedClients([]);
  }

  function saveProfile(next: ProProfile): SaveResult {
    const applied: (keyof ProProfile)[] = [];
    const pending: ReviewedField[] = [];
    const updated = { ...profile };
    let changes = [...pendingChanges];
    const requestedAt = new Date().toISOString();

    for (const key of Object.keys(next) as (keyof ProProfile)[]) {
      if (JSON.stringify(next[key]) === JSON.stringify(profile[key])) {
        // Back to the live value: drop any waiting change for it.
        if (isReviewed(key)) changes = changes.filter((change) => change.field !== key);
        continue;
      }

      if (isReviewed(key)) {
        const to = String(next[key]).trim();
        changes = [
          ...changes.filter((change) => change.field !== key),
          { field: key, from: String(profile[key]), to, requestedAt },
        ];
        pending.push(key);
      } else {
        (updated as Record<keyof ProProfile, unknown>)[key] = next[key];
        applied.push(key);
      }
    }

    setProfile(updated);
    setPendingChanges(changes);
    return { applied, pending };
  }

  function withdrawChange(field: ReviewedField) {
    setPendingChanges((current) => current.filter((change) => change.field !== field));
  }

  return (
    <ProContext.Provider
      value={{
        demoMode,
        switchDemo,
        profile,
        pendingChanges,
        hasSchedule: hasOpenTimes(schedule),
        schedule,
        saveSchedule: (next: Schedule) => setSchedule(structuredClone(next)),
        bookings,
        sessionNotes,
        // The client is told by the backend; the reason is shown to them.
        cancelBooking: (id, reason) =>
          updateBooking(id, { status: 'cancelled', cancelledBy: 'professional', cancelReason: reason }),
        rescheduleBooking: (id, startsAt, reason) => {
          const booking = bookings.find((item) => item.id === id);
          updateBooking(id, {
            startsAt,
            rescheduledFrom: booking?.rescheduledFrom ?? booking?.startsAt ?? null,
            rescheduleReason: reason,
          });
        },
        setBookingOutcome: (id, status) => updateBooking(id, { status }),
        saveSessionNote: (id, text) =>
          setSessionNotes((current) => ({ ...current, [id]: { text, updatedAt: new Date().toISOString() } })),
        summaryNotes,
        saveSummaryNote: (clientId, text) =>
          setSummaryNotes((current) => ({ ...current, [clientId]: { text, updatedAt: new Date().toISOString() } })),
        archivedClients,
        setClientArchived: (clientId, archived) =>
          setArchivedClients((current) =>
            archived ? [...new Set([...current, clientId])] : current.filter((id) => id !== clientId),
          ),
        freeDuringTesting: FREE_DURING_TESTING,
        saveProfile,
        withdrawChange,
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

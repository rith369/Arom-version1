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

  function switchDemo(mode: DemoMode) {
    setDemoMode(mode);
    setProfile(structuredClone(mode === 'established' ? establishedProfile : newProfile));
    setPendingChanges([]);
    setSchedule(structuredClone(mode === 'established' ? establishedSchedule : emptySchedule));
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

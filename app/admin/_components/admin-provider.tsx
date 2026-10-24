'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  initialProfessionals,
  type AccountStatus,
  type Professional,
} from '../_data/professionals';

import {
  initialUsers,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from '../_data/users';

import type { ContentBody, ContentRecord } from '../_data/content';
import {
  initialPodcasts,
  type AdminPodcast,
  type PodcastStatus,
} from '../_data/podcasts';
import type { AdminBooking } from '../_data/bookings';
import {
  initialGroupActivities,
  type AdminGroup,
  type AdminGroupActivity,
  type AdminGroupMessage,
  type CommunityReport,
} from '../_data/community';
import type { AdminJournalPrompt } from '../_data/journal-prompts';

import {
  initialSettings,
  type AdminSettings,
} from '../_data/settings';
import type { CrisisHelpline } from '../../_components/support-contacts';
import type { Announcement } from '../../_components/announcements';
import { FREE_DURING_TESTING } from '@/lib/pricing';
import { useAuth } from '../../_components/auth-provider';

import type { AdminContentReport, ReportStatus } from '../_data/reports';



type AdminState = {
  // Sample professionals still used by the pages that run on demo data
  // (podcasts). The Professionals page uses
  // professionalRecords, which comes from the database.
  professionals: Professional[];
  professionalRecords: Professional[];
  professionalsLoad: LoadStatus;
  reloadProfessionals: () => void;
  reviewApplication: (
    id: string,
    decision: ReviewDecision,
    note: string,
  ) => Promise<ActionResult>;
  reviewProfileChanges: (
    id: string,
    decision: ReviewDecision,
    note: string,
  ) => Promise<ActionResult>;
  setProfessionalAccess: (
    id: string,
    status: AccountStatus,
    note: string,
  ) => Promise<ActionResult>;
  setUpStudentsOnly: (id: string, on: boolean) => Promise<ActionResult>;

  // Sample accounts still used by the demo Bookings page. The Users page
  // uses userRecords, which comes from the database.
  users: AdminUser[];
  userRecords: AdminUser[];
  usersLoad: LoadStatus;
  // The signed in admin, from the session.
  currentUserId: string | null;
  reloadUsers: () => void;
  setUserStatus: (userId: string, status: UserStatus, reason: string) => Promise<ActionResult>;
  setUserRole: (
    userId: string,
    role: UserRole,
    promotion?: ProfessionalPromotion,
  ) => Promise<ActionResult>;

  // From the database, falling back to the code version of items no admin has changed yet.
  contentRecords: ContentRecord[];
  contentLoad: LoadStatus;
  currentAdminName: string;
  saveContentDraft: (
    id: string,
    body: ContentBody,
    expectedUpdatedAt: string | null,
  ) => Promise<ContentActionResult>;
  publishContent: (
    id: string,
    expectedUpdatedAt: string | null,
  ) => Promise<ContentActionResult>;
  discardContentDraft: (id: string) => Promise<ContentActionResult>;
  setContentHidden: (id: string, hidden: boolean) => Promise<ContentActionResult>;
  restoreContentVersion: (id: string, version: number) => Promise<ContentActionResult>;
  deleteContent: (id: string) => Promise<ContentActionResult>;

  // From the database, never with the reporter.
  reports: AdminContentReport[];
  reportsLoad: LoadStatus;
  // Closes every open report on one item, e.g. "lesson:learn-about-stress".
  resolveReports: (itemId: string, status: Exclude<ReportStatus, 'open'>) => Promise<ActionResult>;

  podcasts: AdminPodcast[];
  savePodcast: (record: AdminPodcast) => void;
  setPodcastStatus: (id: string, status: PodcastStatus) => void;

  // From the database, without the client (admins never see who booked).
  bookings: AdminBooking[];
  bookingsLoad: LoadStatus;
  cancelBooking: (id: string, reason: string) => Promise<ActionResult>;
  // From the database. Every change is audit logged.
  groups: AdminGroup[];
  groupsLoad: LoadStatus;
  saveGroup: (record: AdminGroup, isNew: boolean) => Promise<ActionResult>;
  shutDownGroup: (id: string, reason: string) => Promise<ActionResult>;
  reopenGroup: (id: string) => Promise<ActionResult>;
  // Admins may read a chat for safety. Each opening writes an audit log entry.
  openGroupChat: (groupId: string) => Promise<{ ok: true; messages: AdminGroupMessage[] } | { ok: false; message: string }>;

  groupActivities: AdminGroupActivity[];
  saveGroupActivity: (record: AdminGroupActivity) => void;

  communityReports: CommunityReport[];
  communityReportsLoad: LoadStatus;
  resolveCommunityReport: (id: string, status: 'dismissed' | 'removed') => Promise<ActionResult>;
  journalPrompts: AdminJournalPrompt[];
  journalPromptsLoad: LoadStatus;
  saveJournalPrompt: (record: AdminJournalPrompt) => Promise<ActionResult>;

  // The AROM support contact, from the database.
  settings: AdminSettings;
  settingsLoad: LoadStatus;
  saveSettings: (record: AdminSettings) => Promise<ActionResult>;

  crisisHelplines: CrisisHelpline[];
  crisisHelplinesLoad: LoadStatus;
  saveCrisisHelplines: (list: CrisisHelpline[]) => Promise<ActionResult>;

  freeDuringTesting: boolean;
  setFreeDuringTesting: (value: boolean) => void;

  announcements: Announcement[];
  announcementsLoad: LoadStatus;
  publishAnnouncement: (
    draft: Pick<Announcement, 'kmText' | 'enText' | 'tone' | 'link' | 'endsAt'>,
  ) => Promise<ActionResult>;
  endAnnouncement: (id: string) => Promise<ActionResult>;

};

export type ReviewDecision = 'approve' | 'reject';
export type LoadStatus = 'loading' | 'ready' | 'error';
export type ActionResult = { ok: true } | { ok: false; message: string };

/** Sends a JSON request and turns any failure into a message for the admin. */
async function sendAdminRequest(url: string, method: 'POST' | 'PATCH', body: unknown): Promise<ActionResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.ok) return { ok: true };
    const data = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    return { ok: false, message: data?.error?.message ?? 'That change could not be saved.' };
  } catch {
    return { ok: false, message: 'Could not reach the server. Check your connection.' };
  }
}

// `stale` means another admin saved after this editor loaded the item, so
// nothing was overwritten. `shape` means the content failed the checks.
// `error` carries a message (not allowed, network, server).
export type ContentActionResult =
  | { ok: true; updatedAt: string | null }
  | { ok: false; code: 'stale' | 'shape' }
  | { ok: false; code: 'error'; message: string };

// License details an admin records when promoting someone they already know.
export type ProfessionalPromotion = {
  title: string;
  licenseNumber: string;
  issuingBody: string;
  note: string;
};

const AdminContext = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  // Sample professionals for the demo pages (podcasts).
  const [professionals] = useState<Professional[]>(initialProfessionals);

  // Demo accounts for the sample Bookings page only.
  const [users] = useState<AdminUser[]>(initialUsers);

  const [contentRecords, setContentRecords] = useState<ContentRecord[]>([]);
  const [contentLoad, setContentLoad] = useState<LoadStatus>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/content', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { records: ContentRecord[] };
        if (!active) return;
        setContentRecords(data.records);
        setContentLoad('ready');
      })
      .catch(() => {
        if (active) setContentLoad('error');
      });
    return () => {
      active = false;
    };
  }, []);



  const [professionalRecords, setProfessionalRecords] = useState<Professional[]>([]);
  const [professionalsLoad, setProfessionalsLoad] = useState<LoadStatus>('loading');

  const reloadProfessionals = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/professionals', { cache: 'no-store' });
      if (!response.ok) throw new Error('load failed');
      const data = (await response.json()) as { professionals: Professional[] };
      setProfessionalRecords(data.professionals);
      setProfessionalsLoad('ready');
    } catch {
      setProfessionalsLoad('error');
    }
  }, []);

  useEffect(() => {
    // Loading from an external API on mount is what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reloadProfessionals();
  }, [reloadProfessionals]);

  async function reviewApplication(
    id: string,
    decision: ReviewDecision,
    note: string,
  ): Promise<ActionResult> {
    const applicationId = professionalRecords.find((item) => item.id === id)?.applicationId;
    if (!applicationId) return { ok: false, message: 'Application not found. Refresh the page.' };

    const result = await sendAdminRequest(
      `/api/admin/applications/${applicationId}/review`,
      'POST',
      { approve: decision === 'approve', note: note || undefined },
    );
    if (result.ok) await reloadProfessionals();
    return result;
  }

  // Approves or declines every waiting change of one professional at once.
  async function reviewProfileChanges(
    id: string,
    decision: ReviewDecision,
    note: string,
  ): Promise<ActionResult> {
    const result = await sendAdminRequest(`/api/admin/professionals/${id}/changes/review`, 'POST', {
      approve: decision === 'approve',
      note: note || undefined,
    });
    if (result.ok) await reloadProfessionals();
    return result;
  }

  async function setProfessionalAccess(
    id: string,
    status: AccountStatus,
    note: string,
  ): Promise<ActionResult> {
    const result = await sendAdminRequest(`/api/admin/users/${id}/status`, 'PATCH', {
      status,
      reason: note || undefined,
    });
    if (result.ok) await reloadProfessionals();
    return result;
  }

  async function setUpStudentsOnly(id: string, on: boolean): Promise<ActionResult> {
    const result = await sendAdminRequest(`/api/admin/professionals/${id}/up-students`, 'PATCH', { on });
    if (result.ok) await reloadProfessionals();
    return result;
  }

  const [userRecords, setUserRecords] = useState<AdminUser[]>([]);
  const [usersLoad, setUsersLoad] = useState<LoadStatus>('loading');

  const reloadUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      if (!response.ok) throw new Error('load failed');
      const data = (await response.json()) as { users: AdminUser[] };
      setUserRecords(data.users);
      setUsersLoad('ready');
    } catch {
      setUsersLoad('error');
    }
  }, []);

  useEffect(() => {
    // Loading from an external API on mount is what this effect is for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reloadUsers();
  }, [reloadUsers]);

  async function setUserStatus(userId: string, status: UserStatus, reason: string): Promise<ActionResult> {
    const result = await sendAdminRequest(`/api/admin/users/${userId}/status`, 'PATCH', {
      status,
      reason: reason || undefined,
    });
    if (result.ok) await Promise.all([reloadUsers(), reloadProfessionals()]);
    return result;
  }

  async function setUserRole(
    userId: string,
    role: UserRole,
    promotion?: ProfessionalPromotion,
  ): Promise<ActionResult> {
    const result = await sendAdminRequest(`/api/admin/users/${userId}/role`, 'PATCH', {
      role,
      promotion,
    });
    if (result.ok) await Promise.all([reloadUsers(), reloadProfessionals()]);
    return result;
  }

  const { user: signedIn } = useAuth();
  const currentUserId = signedIn?.id ?? null;
  const currentAdminName = signedIn?.fullName || 'Admin';

  // Every content change goes to the server, which answers with the fresh list.
  async function contentAction(payload: Record<string, unknown>): Promise<ContentActionResult> {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: 'stale' | 'shape';
        updatedAt?: string | null;
        records?: ContentRecord[];
        error?: { message?: string };
      } | null;
      if (data?.code === 'stale' || data?.code === 'shape') return { ok: false, code: data.code };
      if (!response.ok || !data?.ok || !data.records) {
        return { ok: false, code: 'error', message: data?.error?.message ?? 'That could not be saved.' };
      }
      setContentRecords(data.records);
      return { ok: true, updatedAt: data.updatedAt ?? null };
    } catch {
      return { ok: false, code: 'error', message: 'Could not reach the server. Check your connection.' };
    }
  }

  function saveContentDraft(id: string, body: ContentBody, expectedUpdatedAt: string | null) {
    return contentAction({ action: 'save', id, body, expectedUpdatedAt });
  }

  // Publishes exactly the saved draft as the next version, then removes the draft.
  function publishContent(id: string, expectedUpdatedAt: string | null) {
    return contentAction({ action: 'publish', id, expectedUpdatedAt });
  }

  function discardContentDraft(id: string) {
    return contentAction({ action: 'discard', id });
  }

  // Hiding keeps every version. Showing again puts the newest version live.
  function setContentHidden(id: string, hidden: boolean) {
    return contentAction({ action: 'hidden', id, hidden });
  }

  // Copies an old version into the draft. Nothing changes for users until it is published.
  function restoreContentVersion(id: string, version: number) {
    return contentAction({ action: 'restore', id, version });
  }

  // Only items that were never published can be deleted. Published ones are hidden instead.
  function deleteContent(id: string) {
    return contentAction({ action: 'delete', id });
  }

  const [reports, setReports] = useState<AdminContentReport[]>([]);
  const [reportsLoad, setReportsLoad] = useState<LoadStatus>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/content-reports', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { reports: AdminContentReport[] };
        if (!active) return;
        setReports(data.reports);
        setReportsLoad('ready');
      })
      .catch(() => {
        if (active) setReportsLoad('error');
      });
    return () => {
      active = false;
    };
  }, []);

  async function resolveReports(itemId: string, status: Exclude<ReportStatus, 'open'>): Promise<ActionResult> {
    try {
      const response = await fetch('/api/admin/content-reports/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status }),
      });
      const data = (await response.json().catch(() => null)) as {
        reports?: AdminContentReport[];
        error?: { message?: string };
      } | null;
      if (!response.ok || !data?.reports) {
        return { ok: false, message: data?.error?.message ?? 'The reports could not be closed.' };
      }
      setReports(data.reports);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Could not reach the server. Check your connection.' };
    }
  }

  const [podcasts, setPodcasts] = useState<AdminPodcast[]>(initialPodcasts);

  function savePodcast(record: AdminPodcast) {
    setPodcasts((current) =>
      current.some((item) => item.id === record.id)
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record],
    );
  }

  function setPodcastStatus(id: string, status: PodcastStatus) {
    setPodcasts((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingsLoad, setBookingsLoad] = useState<LoadStatus>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/bookings', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { bookings: AdminBooking[] };
        if (!active) return;
        setBookings(data.bookings);
        setBookingsLoad('ready');
      })
      .catch(() => {
        if (active) setBookingsLoad('error');
      });
    return () => {
      active = false;
    };
  }, []);

  // Emergency cancel. The list only changes once the database has saved it.
  async function cancelBooking(id: string, reason: string): Promise<ActionResult> {
    try {
      const response = await fetch(`/api/admin/bookings/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = (await response.json().catch(() => null)) as {
        bookings?: AdminBooking[];
        error?: { message?: string };
      } | null;
      if (!response.ok || !data?.bookings) {
        return { ok: false, message: data?.error?.message ?? 'The booking could not be cancelled.' };
      }
      setBookings(data.bookings);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Could not reach the server. Check your connection.' };
    }
  }

  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [groupsLoad, setGroupsLoad] = useState<LoadStatus>('loading');
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [communityReportsLoad, setCommunityReportsLoad] = useState<LoadStatus>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/community/groups', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { groups: AdminGroup[] };
        if (!active) return;
        setGroups(data.groups);
        setGroupsLoad('ready');
      })
      .catch(() => {
        if (active) setGroupsLoad('error');
      });
    fetch('/api/admin/community/reports', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { reports: CommunityReport[] };
        if (!active) return;
        setCommunityReports(data.reports);
        setCommunityReportsLoad('ready');
      })
      .catch(() => {
        if (active) setCommunityReportsLoad('error');
      });
    return () => {
      active = false;
    };
  }, []);

  // Sends one community action and takes the fresh list from the answer.
  async function sendCommunity<K extends 'groups' | 'reports'>(
    url: string,
    key: K,
    body: unknown,
  ): Promise<ActionResult> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as {
        groups?: AdminGroup[];
        reports?: CommunityReport[];
        error?: { message?: string };
      } | null;
      const list = data?.[key];
      if (!response.ok || !list) {
        return { ok: false, message: data?.error?.message ?? 'That change could not be saved.' };
      }
      if (key === 'groups') setGroups(list as AdminGroup[]);
      else setCommunityReports(list as CommunityReport[]);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Could not reach the server. Check your connection.' };
    }
  }

  function saveGroup(record: AdminGroup, isNew: boolean) {
    return sendCommunity('/api/admin/community/groups', 'groups', { group: record, isNew });
  }

  function shutDownGroup(id: string, reason: string) {
    return sendCommunity(`/api/admin/community/groups/${id}/close`, 'groups', { reason: reason.trim() });
  }

  function reopenGroup(id: string) {
    return sendCommunity(`/api/admin/community/groups/${id}/reopen`, 'groups', {});
  }

  async function resolveCommunityReport(id: string, status: 'dismissed' | 'removed'): Promise<ActionResult> {
    const result = await sendCommunity(`/api/admin/community/reports/${id}/resolve`, 'reports', { status });
    // Removing a whole group closes it, so refresh the groups too.
    if (result.ok && status === 'removed') {
      fetch('/api/admin/community/groups', { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { groups: AdminGroup[] } | null) => {
          if (data) setGroups(data.groups);
        })
        .catch(() => {});
    }
    return result;
  }

  async function openGroupChat(groupId: string) {
    try {
      const response = await fetch(`/api/admin/community/groups/${groupId}/messages`, { cache: 'no-store' });
      const data = (await response.json().catch(() => null)) as {
        messages?: AdminGroupMessage[];
        error?: { message?: string };
      } | null;
      if (!response.ok || !data?.messages) {
        return { ok: false as const, message: data?.error?.message ?? 'This chat could not be opened.' };
      }
      return { ok: true as const, messages: data.messages };
    } catch {
      return { ok: false as const, message: 'Could not reach the server. Check your connection.' };
    }
  }

  // Group activities are not connected yet (sample data, section 23).
  const [groupActivities, setGroupActivities] = useState<AdminGroupActivity[]>(
    initialGroupActivities,
  );

  function saveGroupActivity(record: AdminGroupActivity) {
    setGroupActivities((current) =>
      current.some((item) => item.id === record.id)
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record],
    );
  }

  const [journalPrompts, setJournalPrompts] = useState<AdminJournalPrompt[]>([]);
  const [journalPromptsLoad, setJournalPromptsLoad] = useState<LoadStatus>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/journal-prompts', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { prompts: AdminJournalPrompt[] };
        if (!active) return;
        setJournalPrompts(data.prompts);
        setJournalPromptsLoad('ready');
      })
      .catch(() => {
        if (active) setJournalPromptsLoad('error');
      });
    return () => {
      active = false;
    };
  }, []);

  // Adds or updates one prompt (activating and deactivating too). The screen
  // only changes once the database has saved it.
  async function saveJournalPrompt(record: AdminJournalPrompt): Promise<ActionResult> {
    try {
      const response = await fetch('/api/admin/journal-prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: record }),
      });
      const data = (await response.json().catch(() => null)) as {
        prompts?: AdminJournalPrompt[];
        error?: { message?: string };
      } | null;
      if (!response.ok || !data?.prompts) {
        return { ok: false, message: data?.error?.message ?? 'The prompt could not be saved.' };
      }
      setJournalPrompts(data.prompts);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Could not reach the server. Check your connection.' };
    }
  }
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [settingsLoad, setSettingsLoad] = useState<LoadStatus>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/support-contact', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { supportContact: AdminSettings };
        if (!active) return;
        setSettings(data.supportContact);
        setSettingsLoad('ready');
      })
      .catch(() => {
        if (active) setSettingsLoad('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const [crisisHelplines, setCrisisHelplines] = useState<CrisisHelpline[]>([]);
  const [crisisHelplinesLoad, setCrisisHelplinesLoad] = useState<LoadStatus>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/crisis-resources', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { helplines: CrisisHelpline[] };
        if (!active) return;
        setCrisisHelplines(data.helplines);
        setCrisisHelplinesLoad('ready');
      })
      .catch(() => {
        if (active) setCrisisHelplinesLoad('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const [freeDuringTesting, setFreeDuringTesting] = useState(FREE_DURING_TESTING);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoad, setAnnouncementsLoad] = useState<LoadStatus>('loading');

  useEffect(() => {
    let active = true;
    fetch('/api/admin/announcements', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('load failed');
        const data = (await response.json()) as { announcements: Announcement[] };
        if (!active) return;
        setAnnouncements(data.announcements);
        setAnnouncementsLoad('ready');
      })
      .catch(() => {
        if (active) setAnnouncementsLoad('error');
      });
    return () => {
      active = false;
    };
  }, []);

  // Publish and End change the list only once the database has saved them.
  async function sendAnnouncement(url: string, body?: unknown): Promise<ActionResult> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const data = (await response.json().catch(() => null)) as {
        announcements?: Announcement[];
        error?: { message?: string };
      } | null;
      if (!response.ok || !data?.announcements) {
        return { ok: false, message: data?.error?.message ?? 'That could not be saved.' };
      }
      setAnnouncements(data.announcements);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Could not reach the server. Check your connection.' };
    }
  }

  function publishAnnouncement(
    draft: Pick<Announcement, 'kmText' | 'enText' | 'tone' | 'link' | 'endsAt'>,
  ) {
    return sendAnnouncement('/api/admin/announcements', draft);
  }

  function endAnnouncement(id: string) {
    return sendAnnouncement(`/api/admin/announcements/${id}/end`);
  }

  // Saves the whole list in this order. The database checks every row and
  // saves nothing if one is invalid, so the screen only changes on success.
  async function saveCrisisHelplines(list: CrisisHelpline[]): Promise<ActionResult> {
    try {
      const response = await fetch('/api/admin/crisis-resources', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helplines: list }),
      });
      const data = (await response.json().catch(() => null)) as {
        helplines?: CrisisHelpline[];
        error?: { message?: string };
      } | null;
      if (!response.ok || !data?.helplines) {
        return { ok: false, message: data?.error?.message ?? 'Helplines could not be saved.' };
      }
      setCrisisHelplines(data.helplines);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Could not reach the server. Check your connection.' };
    }
  }

  async function saveSettings(record: AdminSettings): Promise<ActionResult> {
    try {
      const response = await fetch('/api/admin/support-contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportContact: record }),
      });
      const data = (await response.json().catch(() => null)) as {
        supportContact?: AdminSettings;
        error?: { message?: string };
      } | null;
      if (!response.ok || !data?.supportContact) {
        return { ok: false, message: data?.error?.message ?? 'The support contact could not be saved.' };
      }
      setSettings(data.supportContact);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Could not reach the server. Check your connection.' };
    }
  }


  return (
    <AdminContext.Provider
      value={{
        professionals,
        professionalRecords,
        professionalsLoad,
        reloadProfessionals,
        reviewApplication,
        reviewProfileChanges,
        setProfessionalAccess,
        setUpStudentsOnly,
        users,
        userRecords,
        usersLoad,
        currentUserId,
        reloadUsers,
        setUserStatus,
        setUserRole,
        contentRecords,
        contentLoad,
        currentAdminName,
        saveContentDraft,
        publishContent,
        discardContentDraft,
        setContentHidden,
        restoreContentVersion,
        deleteContent,
        reports,
        reportsLoad,
        resolveReports,
        podcasts,
        savePodcast,
        setPodcastStatus,
        bookings,
        bookingsLoad,
        cancelBooking,
        groups,
        groupsLoad,
        saveGroup,
        shutDownGroup,
        reopenGroup,
        openGroupChat,
        groupActivities,
        saveGroupActivity,
        communityReports,
        communityReportsLoad,
        resolveCommunityReport,
        journalPrompts,
        journalPromptsLoad,
        saveJournalPrompt,
        settings,
        settingsLoad,
        saveSettings,
        crisisHelplines,
        crisisHelplinesLoad,
        saveCrisisHelplines,
        freeDuringTesting,
        setFreeDuringTesting,
        announcements,
        announcementsLoad,
        publishAnnouncement,
        endAnnouncement,
      }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin must be used inside AdminProvider');
  }

  return context;
}

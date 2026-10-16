'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
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

import {
  initialContentRecords,
  type ContentBody,
  type ContentRecord,
} from '../_data/content';
import {
  initialPodcasts,
  type AdminPodcast,
  type PodcastStatus,
} from '../_data/podcasts';
import { initialBookings, type AdminBooking } from '../_data/bookings';
import {
  initialGroups,
  initialGroupActivities,
  initialCommunityReports,
  reportReasonLabels,
  toAdminGroup,
  type AdminGroup,
  type AdminGroupActivity,
  type CommunityReport,
} from '../_data/community';
import {
  closeGroup,
  getCommunitySnapshot,
  getServerCommunitySnapshot,
  removeMember,
  removeMessage,
  reopenGroup as reopenStoredGroup,
  saveCreatedGroup,
  subscribeCommunityStore,
} from '../../community/community-store';
import {
  DEFAULT_GROUP_RULES,
  DEFAULT_GROUP_RULES_KM,
  type ChatMessage,
} from '../../community/community-data';
import type { AdminJournalPrompt } from '../_data/journal-prompts';

import {
  initialSettings,
  type AdminSettings,
} from '../_data/settings';
import type { CrisisHelpline } from '../../_components/support-contacts';
import {
  ANNOUNCEMENTS,
  type Announcement,
} from '../../_components/announcements';
import { FREE_DURING_TESTING } from '@/lib/pricing';
import { useAuth } from '../../_components/auth-provider';

import {
  initialReports,
  type AdminContentReport,
  type ReportStatus,
} from '../_data/reports';



type AdminState = {
  // Sample professionals still used by the pages that run on demo data
  // (bookings, community, podcasts). The Professionals page uses
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

  contentRecords: ContentRecord[];
  currentAdminName: string;
  saveContentDraft: (
    id: string,
    body: ContentBody,
    expectedUpdatedAt: string | null,
  ) => ContentActionResult;
  publishContent: (
    id: string,
    expectedUpdatedAt: string | null,
  ) => ContentActionResult;
  discardContentDraft: (id: string) => void;
  setContentHidden: (id: string, hidden: boolean) => void;
  restoreContentVersion: (id: string, version: number) => string;
  deleteContent: (id: string) => void;

  reports: AdminContentReport[];
  // Closes every open report on one item, e.g. "lesson:learn-about-stress".
  resolveReports: (itemId: string, status: Exclude<ReportStatus, 'open'>) => void;

  podcasts: AdminPodcast[];
  savePodcast: (record: AdminPodcast) => void;
  setPodcastStatus: (id: string, status: PodcastStatus) => void;

  bookings: AdminBooking[];
  saveBooking: (record: AdminBooking) => void;
  groups: AdminGroup[];
  saveGroup: (record: AdminGroup) => void;
  shutDownGroup: (id: string, reason: string) => void;
  reopenGroup: (id: string) => void;
  // Every message in every group. Admins may read chats for safety; the
  // backend writes an audit log entry each time a chat is opened.
  communityMessages: ChatMessage[];
  // Message ids an admin removed. View chat still shows them, marked Removed.
  removedMessageIds: string[];

  groupActivities: AdminGroupActivity[];
  saveGroupActivity: (record: AdminGroupActivity) => void;

  communityReports: CommunityReport[];
  resolveCommunityReport: (id: string, status: 'dismissed' | 'removed') => void;
  journalPrompts: AdminJournalPrompt[];
  journalPromptsLoad: LoadStatus;
  saveJournalPrompt: (record: AdminJournalPrompt) => Promise<ActionResult>;

  settings: AdminSettings;
  saveSettings: (record: AdminSettings) => void;

  crisisHelplines: CrisisHelpline[];
  crisisHelplinesLoad: LoadStatus;
  saveCrisisHelplines: (list: CrisisHelpline[]) => Promise<ActionResult>;

  freeDuringTesting: boolean;
  setFreeDuringTesting: (value: boolean) => void;

  announcements: Announcement[];
  publishAnnouncement: (
    draft: Pick<Announcement, 'kmText' | 'enText' | 'tone' | 'link' | 'endsAt'>,
  ) => void;
  endAnnouncement: (id: string) => void;

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

// Mirrors the hint codes the backend will return. `stale` means another admin
// saved after this editor loaded the item, so nothing was overwritten.
export type ContentActionResult =
  | { ok: true; updatedAt: string }
  | { ok: false; code: 'stale' | 'shape' };

// License details an admin records when promoting someone they already know.
export type ProfessionalPromotion = {
  title: string;
  licenseNumber: string;
  issuingBody: string;
  note: string;
};

const AdminContext = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  // Sample professionals for the demo pages (bookings, community, podcasts).
  const [professionals] = useState<Professional[]>(initialProfessionals);

  // Demo accounts for the sample Bookings page only.
  const [users] = useState<AdminUser[]>(initialUsers);

  const [contentRecords, setContentRecords] = useState<ContentRecord[]>(
    initialContentRecords,
  );



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

  function updateContentRecord(
    id: string,
    update: (record: ContentRecord) => ContentRecord,
  ) {
    setContentRecords((current) =>
      current.map((item) => (item.id === id ? update(item) : item)),
    );
  }

  function saveContentDraft(
    id: string,
    body: ContentBody,
    expectedUpdatedAt: string | null,
  ): ContentActionResult {
    const record = contentRecords.find((item) => item.id === id);

    if (!record) return { ok: false, code: 'shape' };
    if ((record.draft?.updatedAt ?? null) !== expectedUpdatedAt) {
      return { ok: false, code: 'stale' };
    }

    const updatedAt = new Date().toISOString();

    updateContentRecord(id, (item) => ({
      ...item,
      draft: {
        body: structuredClone(body),
        baseVersion: item.versions.at(-1)?.version ?? null,
        updatedAt,
        updatedBy: currentAdminName,
      },
    }));

    return { ok: true, updatedAt };
  }

  // Publishes exactly the saved draft as the next version, then removes the draft.
  function publishContent(
    id: string,
    expectedUpdatedAt: string | null,
  ): ContentActionResult {
    const record = contentRecords.find((item) => item.id === id);

    if (!record?.draft) return { ok: false, code: 'shape' };
    if (record.draft.updatedAt !== expectedUpdatedAt) {
      return { ok: false, code: 'stale' };
    }

    const publishedAt = new Date().toISOString();
    const version = (record.versions.at(-1)?.version ?? 0) + 1;

    updateContentRecord(id, (item) => ({
      ...item,
      liveVersion: version,
      versions: [
        ...item.versions,
        {
          version,
          body: item.draft!.body,
          publishedAt,
          publishedBy: currentAdminName,
        },
      ],
      draft: null,
    }));

    return { ok: true, updatedAt: publishedAt };
  }

  function discardContentDraft(id: string) {
    updateContentRecord(id, (item) => ({ ...item, draft: null }));
  }

  // Hiding keeps every version. Showing again puts the newest version live.
  function setContentHidden(id: string, hidden: boolean) {
    updateContentRecord(id, (item) => ({
      ...item,
      liveVersion: hidden ? null : (item.versions.at(-1)?.version ?? null),
    }));
  }

  // Copies an old version into the draft. Nothing changes for users until it is published.
  function restoreContentVersion(id: string, version: number) {
    const updatedAt = new Date().toISOString();

    updateContentRecord(id, (item) => {
      const source = item.versions.find((entry) => entry.version === version);

      if (!source) return item;

      return {
        ...item,
        draft: {
          body: structuredClone(source.body),
          baseVersion: item.versions.at(-1)?.version ?? null,
          updatedAt,
          updatedBy: currentAdminName,
        },
      };
    });

    return updatedAt;
  }

  const [reports, setReports] = useState<AdminContentReport[]>(initialReports);

  function resolveReports(itemId: string, status: Exclude<ReportStatus, 'open'>) {
    const resolvedAt = new Date().toISOString();

    setReports((current) =>
      current.map((item) =>
        item.status === 'open' &&
        `${item.target.type}:${item.target.sourceId}` === itemId
          ? { ...item, status, resolvedAt, resolvedBy: currentAdminName }
          : item,
      ),
    );
  }

  // Only items that were never published can be deleted. Published ones are hidden instead.
  function deleteContent(id: string) {
    setContentRecords((current) =>
      current.filter((item) => item.id !== id || item.versions.length > 0),
    );
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

  const [bookings, setBookings] = useState<AdminBooking[]>(initialBookings);

  function saveBooking(record: AdminBooking) {
    setBookings((current) =>
      current.map((item) => (item.id === record.id ? record : item)),
    );
  }

  const [groupEdits, setGroupEdits] = useState<AdminGroup[]>(initialGroups);
  const [reportDecisions, setReportDecisions] = useState<
    Partial<Record<string, 'dismissed' | 'removed'>>
  >({});

  // Groups, closures, reports and messages made on /community in this browser.
  const communityStore = useSyncExternalStore(
    subscribeCommunityStore,
    getCommunitySnapshot,
    getServerCommunitySnapshot,
  );

  const groups = useMemo(() => {
    const closures = new Map(
      communityStore.closures.map((item) => [item.groupId, item.reason]),
    );
    const created = communityStore.createdGroups
      .filter((group) => !groupEdits.some((item) => item.id === group.id))
      .map(toAdminGroup);

    return [...groupEdits, ...created].map((group) => ({
      ...group,
      status: closures.has(group.id) ? ('closed' as const) : ('active' as const),
      closedReason: closures.get(group.id),
    }));
  }, [communityStore, groupEdits]);

  const communityMessages = communityStore.messages;
  const removedMessageIds = useMemo(
    () => communityStore.removedMessages.map((item) => item.messageId),
    [communityStore],
  );

  const [groupActivities, setGroupActivities] = useState<AdminGroupActivity[]>(
    initialGroupActivities,
  );

  const communityReports = useMemo((): CommunityReport[] => {
    const sent: CommunityReport[] = communityStore.reports.map((report) => {
      const target = report.target;
      const message =
        'messageId' in target && target.messageId
          ? communityStore.messages.find((item) => item.id === target.messageId)
          : undefined;
      const group = groups.find((item) => item.id === target.groupId);

      return {
        id: report.id,
        groupId: target.groupId,
        targetKind: target.kind,
        targetLabel:
          target.kind === 'member'
            ? target.memberLabel
            : target.kind === 'group'
              ? (group?.name ?? 'Group')
              : target.kind === 'image'
                ? 'Image'
                : 'Message',
        messageId: message?.id,
        messagePreview:
          target.kind === 'image'
            ? `Image: ${message?.attachment?.name ?? 'removed'}`
            : (message?.text ?? ''),
        reason: reportReasonLabels[report.reason],
        note: report.note,
        createdAt: report.createdAt,
        status: 'pending',
      };
    });

    // A removal is saved in the store, so it survives a reload.
    const isRemoved = (report: CommunityReport) =>
      report.targetKind === 'member'
        ? communityStore.removedMembers.some(
            (item) =>
              item.groupId === report.groupId &&
              item.memberLabel === report.targetLabel,
          )
        : Boolean(report.messageId) &&
          communityStore.removedMessages.some(
            (item) => item.messageId === report.messageId,
          );

    return [...initialCommunityReports, ...sent].map((report) => ({
      ...report,
      status:
        reportDecisions[report.id] ??
        (isRemoved(report) ? 'removed' : report.status),
    }));
  }, [communityStore, groups, reportDecisions]);

  function saveGroup(record: AdminGroup) {
    const isNew = !groups.some((item) => item.id === record.id);

    setGroupEdits((current) =>
      current.some((item) => item.id === record.id)
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record],
    );

    // New groups made here also show on /community in this browser.
    if (isNew) {
      const mentor = professionals.find((item) => item.id === record.mentorId);
      const usesDefaultRules =
        record.rules.length === 0 ||
        record.rules.join('\n') === DEFAULT_GROUP_RULES.join('\n');

      saveCreatedGroup({
        id: record.id,
        name: record.name,
        nameKm: record.kmName || record.name,
        about: record.about,
        aboutKm: record.kmAbout || record.about,
        membersCount: record.membersCount,
        maxMembers: record.maxMembers,
        iconType: 'stress',
        isAnonymous: record.isAnonymous,
        expectations: [],
        expectationsKm: [],
        rules: usesDefaultRules ? DEFAULT_GROUP_RULES : record.rules,
        rulesKm: usesDefaultRules ? DEFAULT_GROUP_RULES_KM : record.rules,
        mentor: mentor
          ? {
              name: mentor.name,
              nameKm: mentor.kmName || mentor.name,
              role: mentor.role,
              roleKm: mentor.kmRole || mentor.role,
              experience: mentor.experience,
              experienceKm: mentor.experience,
              avatarUrl: mentor.image || undefined,
              badge: 'Group Mentor',
              badgeKm: 'អ្នកណែនាំក្រុម',
            }
          : undefined,
        isJoined: false,
        status: 'active',
        createdBy: 'admin',
      });
    }
  }

  function shutDownGroup(id: string, reason: string) {
    closeGroup(id, reason.trim());
  }

  function reopenGroup(id: string) {
    reopenStoredGroup(id);
  }

  function saveGroupActivity(record: AdminGroupActivity) {
    setGroupActivities((current) =>
      current.some((item) => item.id === record.id)
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record],
    );
  }

  function resolveCommunityReport(id: string, status: 'dismissed' | 'removed') {
    const report = communityReports.find((item) => item.id === id);
    if (!report || report.status !== 'pending') return;

    // Removing a message or image hides it for every member. Removing a
    // person takes them out of that group; their past messages stay.
    if (status === 'removed') {
      if (report.targetKind === 'member') {
        removeMember(report.groupId, report.targetLabel);
      } else if (report.messageId) {
        removeMessage(report.messageId);
      }
    }

    setReportDecisions((current) => ({ ...current, [id]: status }));
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

  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    ANNOUNCEMENTS.map((item) => ({ ...item })),
  );

  function publishAnnouncement(
    draft: Pick<Announcement, 'kmText' | 'enText' | 'tone' | 'link' | 'endsAt'>,
  ) {
    setAnnouncements((current) => [
      {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy: currentAdminName,
        endedAt: null,
      },
      ...current,
    ]);
  }

  function endAnnouncement(id: string) {
    const endedAt = new Date().toISOString();
    setAnnouncements((current) =>
      current.map((item) => (item.id === id && !item.endedAt ? { ...item, endedAt } : item)),
    );
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

  function saveSettings(record: AdminSettings) {
    setSettings(record);
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
        users,
        userRecords,
        usersLoad,
        currentUserId,
        reloadUsers,
        setUserStatus,
        setUserRole,
        contentRecords,
        currentAdminName,
        saveContentDraft,
        publishContent,
        discardContentDraft,
        setContentHidden,
        restoreContentVersion,
        deleteContent,
        reports,
        resolveReports,
        podcasts,
        savePodcast,
        setPodcastStatus,
        bookings,
        saveBooking,
        groups,
        saveGroup,
        shutDownGroup,
        reopenGroup,
        communityMessages,
        removedMessageIds,
        groupActivities,
        saveGroupActivity,
        communityReports,
        resolveCommunityReport,
        journalPrompts,
        journalPromptsLoad,
        saveJournalPrompt,
        settings,
        saveSettings,
        crisisHelplines,
        crisisHelplinesLoad,
        saveCrisisHelplines,
        freeDuringTesting,
        setFreeDuringTesting,
        announcements,
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

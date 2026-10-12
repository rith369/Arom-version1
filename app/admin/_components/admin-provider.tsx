'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import {
  initialProfessionals,
  type AccountStatus,
  type Professional,
} from '../_data/professionals';

import {
  currentAdminId,
  initialUsers,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from '../_data/users';

import {
  emptyBody,
  initialContentRecords,
  type ContentBody,
  type ContentRecord,
  type ContentType,
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
  type AdminGroup,
  type AdminGroupActivity,
  type CommunityReport,
} from '../_data/community';
import {
  initialJournalPrompts,
  type AdminJournalPrompt,
} from '../_data/journal-prompts';

import { initialSettings, type AdminSettings } from '../_data/settings';

import {
  initialReports,
  type AdminContentReport,
  type ReportStatus,
} from '../_data/reports';



type AdminState = {
  professionals: Professional[];
  reviewApplication: (
    id: string,
    decision: ReviewDecision,
    note: string,
  ) => void;
  reviewProfileChanges: (
    id: string,
    decision: ReviewDecision,
    note: string,
  ) => void;
  setProfessionalAccess: (
    id: string,
    status: AccountStatus,
    note: string,
  ) => void;

  users: AdminUser[];
  setUserStatus: (userId: string, status: UserStatus) => void;
  setUserRole: (
    userId: string,
    role: UserRole,
    promotion?: ProfessionalPromotion,
  ) => void;

  contentRecords: ContentRecord[];
  currentAdminName: string;
  createContent: (type: ContentType) => ContentRecord;
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

  groupActivities: AdminGroupActivity[];
  saveGroupActivity: (record: AdminGroupActivity) => void;

  communityReports: CommunityReport[];
  resolveCommunityReport: (id: string, status: 'dismissed' | 'removed') => void;
  journalPrompts: AdminJournalPrompt[];
  saveJournalPrompt: (record: AdminJournalPrompt) => void;
  setJournalPromptActive: (id: string, isActive: boolean) => void;

  settings: AdminSettings;
  saveSettings: (record: AdminSettings) => void;

};

export type ReviewDecision = 'approve' | 'reject';

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
  const [professionals, setProfessionals] =
    useState<Professional[]>(initialProfessionals);

  const [users, setUsers] = useState<AdminUser[]>(initialUsers);

  const [contentRecords, setContentRecords] = useState<ContentRecord[]>(
    initialContentRecords,
  );

  function updateProfessional(
    id: string,
    update: (record: Professional) => Professional,
  ) {
    setProfessionals((current) =>
      current.map((item) => (item.id === id ? update(item) : item)),
    );
  }

  function reviewApplication(
    id: string,
    decision: ReviewDecision,
    note: string,
  ) {
    updateProfessional(id, (item) => ({
      ...item,
      verificationStatus: decision === 'approve' ? 'verified' : 'rejected',
      reviewNote: note,
    }));
  }

  function reviewProfileChanges(
    id: string,
    decision: ReviewDecision,
    note: string,
  ) {
    updateProfessional(id, (item) => {
      if (decision === 'reject') {
        return { ...item, pendingChanges: [], reviewNote: note };
      }

      const approved = { ...item, pendingChanges: [], reviewNote: note };

      for (const change of item.pendingChanges) {
        if (change.field === 'licenseNumber' || change.field === 'issuingBody') {
          approved.credential = {
            ...approved.credential,
            [change.field]: change.to,
          };
        } else {
          approved[change.field] = change.to;
        }
      }

      return approved;
    });
  }

  function setProfessionalAccess(
    id: string,
    status: AccountStatus,
    note: string,
  ) {
    updateProfessional(id, (item) => ({
      ...item,
      accountStatus: status,
      reviewNote: note,
    }));
  }

  function setUserStatus(userId: string, status: UserStatus) {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, status } : user)),
    );
  }

  function setUserRole(
    userId: string,
    role: UserRole,
    promotion?: ProfessionalPromotion,
  ) {
    const user = users.find((item) => item.id === userId);

    if (!user || user.role === role) return;

    setUsers((current) =>
      current.map((item) => (item.id === userId ? { ...item, role } : item)),
    );

    if (role === 'professional' && promotion) {
      const today = new Date().toISOString().slice(0, 10);
      const promoted = {
        role: promotion.title,
        verificationStatus: 'verified',
        accountStatus: 'active',
        credential: {
          licenseNumber: promotion.licenseNumber,
          issuingBody: promotion.issuingBody,
          documentName: '',
          submittedAt: today,
        },
        pendingChanges: [],
        reviewNote: promotion.note,
        source: 'admin',
      } satisfies Partial<Professional>;

      setProfessionals((current) =>
        current.some((item) => item.id === userId)
          ? current.map((item) =>
              item.id === userId ? { ...item, ...promoted } : item,
            )
          : [
              ...current,
              {
                id: userId,
                name: user.fullName,
                kmName: '',
                kmRole: '',
                specialties: [],
                languages: [user.preferredLanguage === 'km' ? 'Khmer' : 'English'],
                experience: '',
                about: '',
                kmAbout: '',
                image: '',
                session: 'Online',
                phone: '',
                telegram: '',
                joinedAt: today,
                ...promoted,
              },
            ],
      );
    }

    // Matches set_user_role(): a former professional leaves the public directory.
    if (user.role === 'professional') {
      updateProfessional(userId, (item) => ({
        ...item,
        verificationStatus: 'rejected',
        reviewNote: 'Professional role removed by an admin.',
      }));
    }
  }

  const currentAdminName =
    users.find((user) => user.id === currentAdminId)?.fullName ?? 'Admin';

  function updateContentRecord(
    id: string,
    update: (record: ContentRecord) => ContentRecord,
  ) {
    setContentRecords((current) =>
      current.map((item) => (item.id === id ? update(item) : item)),
    );
  }

  function createContent(type: ContentType) {
    const sourceId = crypto.randomUUID();
    const record: ContentRecord = {
      id: `${type}:${sourceId}`,
      sourceId,
      type,
      liveVersion: null,
      versions: [],
      draft: {
        body: emptyBody(type, sourceId),
        baseVersion: null,
        updatedAt: new Date().toISOString(),
        updatedBy: currentAdminName,
      },
    };

    setContentRecords((current) => [...current, record]);

    return record;
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

  const [groups, setGroups] = useState<AdminGroup[]>(initialGroups);

  const [groupActivities, setGroupActivities] = useState<AdminGroupActivity[]>(
    initialGroupActivities,
  );

  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(
    initialCommunityReports,
  );

  function saveGroup(record: AdminGroup) {
    setGroups((current) =>
      current.some((item) => item.id === record.id)
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record],
    );
  }

  function saveGroupActivity(record: AdminGroupActivity) {
    setGroupActivities((current) =>
      current.some((item) => item.id === record.id)
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record],
    );
  }

  function resolveCommunityReport(id: string, status: 'dismissed' | 'removed') {
    setCommunityReports((current) =>
      current.map((item) =>
        item.id === id && item.status === 'pending'
          ? { ...item, status }
          : item,
      ),
    );
  }
  const [journalPrompts, setJournalPrompts] = useState<AdminJournalPrompt[]>(
    initialJournalPrompts,
  );

  function saveJournalPrompt(record: AdminJournalPrompt) {
    setJournalPrompts((current) =>
      current.some((item) => item.id === record.id)
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record],
    );
  }

  function setJournalPromptActive(id: string, isActive: boolean) {
    setJournalPrompts((current) =>
      current.map((item) => (item.id === id ? { ...item, isActive } : item)),
    );
  }
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);

  function saveSettings(record: AdminSettings) {
    setSettings(record);
  }


  return (
    <AdminContext.Provider
      value={{
        professionals,
        reviewApplication,
        reviewProfileChanges,
        setProfessionalAccess,
        users,
        setUserStatus,
        setUserRole,
        contentRecords,
        currentAdminName,
        createContent,
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
        groupActivities,
        saveGroupActivity,
        communityReports,
        resolveCommunityReport,
        journalPrompts,
        saveJournalPrompt,
        setJournalPromptActive,
        settings,
        saveSettings,
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

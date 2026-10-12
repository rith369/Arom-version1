'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

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
  initialContent,
  type AdminContent,
  type ContentStatus,
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
  initialLessonDetails,
  type AdminLessonDetails,
} from '../_data/lesson-details';
import { initialTipDetails, type AdminTipDetails } from '../_data/tip-details';

import {
  initialPracticeDetails,
  type AdminPracticeDetails,
} from '../_data/practice-details';

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

  content: AdminContent[];
  saveContent: (record: AdminContent) => void;
  setContentStatus: (contentId: string, status: ContentStatus) => void;

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

  lessonDetails: AdminLessonDetails[];
  saveLessonDetails: (record: AdminLessonDetails) => void;

  tipDetails: AdminTipDetails[];
  saveTipDetails: (record: AdminTipDetails) => void;

  practiceDetails: AdminPracticeDetails[];
  savePracticeDetails: (record: AdminPracticeDetails) => void;
};

export type ReviewDecision = 'approve' | 'reject';

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

  const [content, setContent] = useState<AdminContent[]>(initialContent);

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

  function saveContent(record: AdminContent) {
    setContent((current) => {
      const exists = current.some((item) => item.id === record.id);

      return exists
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record];
    });
  }

  function setContentStatus(contentId: string, status: ContentStatus) {
    setContent((current) =>
      current.map((item) =>
        item.id === contentId ? { ...item, status } : item,
      ),
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

  const [lessonDetails, setLessonDetails] =
    useState<AdminLessonDetails[]>(initialLessonDetails);

  function saveLessonDetails(record: AdminLessonDetails) {
    setLessonDetails((current) =>
      current.some((item) => item.sourceId === record.sourceId)
        ? current.map((item) =>
            item.sourceId === record.sourceId ? record : item,
          )
        : [...current, record],
    );
  }
  const [tipDetails, setTipDetails] =
    useState<AdminTipDetails[]>(initialTipDetails);

  function saveTipDetails(record: AdminTipDetails) {
    setTipDetails((current) =>
      current.some((item) => item.sourceId === record.sourceId)
        ? current.map((item) =>
            item.sourceId === record.sourceId ? record : item,
          )
        : [...current, record],
    );
  }
  const [practiceDetails, setPracticeDetails] = useState<
    AdminPracticeDetails[]
  >(initialPracticeDetails);

  function savePracticeDetails(record: AdminPracticeDetails) {
    setPracticeDetails((current) =>
      current.some((item) => item.sourceId === record.sourceId)
        ? current.map((item) =>
            item.sourceId === record.sourceId ? record : item,
          )
        : [...current, record],
    );
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
        content,
        saveContent,
        setContentStatus,
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
        lessonDetails,
        saveLessonDetails,
        tipDetails,
        saveTipDetails,
        practiceDetails,
        savePracticeDetails,
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

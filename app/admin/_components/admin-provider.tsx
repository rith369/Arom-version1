'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import {
  initialProfessionals,
  type Professional,
} from '../_data/professionals';

import { initialUsers, type AdminUser, type UserStatus } from '../_data/users';

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
  save: (record: Professional) => void;

  users: AdminUser[];
  setUserStatus: (userId: string, status: UserStatus) => void;

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

const AdminContext = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [professionals, setProfessionals] =
    useState<Professional[]>(initialProfessionals);

  const [users, setUsers] = useState<AdminUser[]>(initialUsers);

  const [content, setContent] = useState<AdminContent[]>(initialContent);

  function save(record: Professional) {
    setProfessionals((current) => {
      const exists = current.some((item) => item.id === record.id);

      return exists
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record];
    });
  }

  function setUserStatus(userId: string, status: UserStatus) {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, status } : user)),
    );
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
        save,
        users,
        setUserStatus,
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

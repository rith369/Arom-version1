import {
  INITIAL_GROUPS,
  INITIAL_ACTIVITIES,
} from '../../community/community-data';

export type AdminGroup = {
  id: string;
  name: string;
  kmName: string;
  about: string;
  kmAbout: string;
  maxMembers: number;
  membersCount: number;
  isAnonymous: boolean;
  mentorId: string;
  rules: string[];
  status: 'active' | 'archived';
};

export type AdminGroupActivity = {
  id: string;
  groupId: string;
  title: string;
  kmTitle: string;
  dateLabel: string;
  status: 'scheduled' | 'cancelled';
};

export type CommunityReport = {
  id: string;
  groupId: string;
  messagePreview: string;
  reason: string;
  status: 'pending' | 'dismissed' | 'removed';
};

export const initialGroups: AdminGroup[] = INITIAL_GROUPS.map((group) => ({
  id: group.id,
  name: group.name,
  kmName: group.nameKm,
  about: group.about,
  kmAbout: group.aboutKm,
  maxMembers: group.maxMembers,
  membersCount: group.membersCount,
  isAnonymous: group.isAnonymous,
  // Assign a professional explicitly in the admin demo.
  mentorId: '',
  rules: [...(group.rules ?? [])],
  status: 'active',
}));

export const initialGroupActivities: AdminGroupActivity[] =
  INITIAL_ACTIVITIES.map((activity) => ({
    id: activity.id,
    groupId: activity.groupId,
    title: activity.title,
    kmTitle: activity.titleKm,
    dateLabel: activity.dateStr,
    status: 'scheduled',
  }));

// Fictional reports, separate from real community messages.
export const initialCommunityReports: CommunityReport[] = initialGroups
  .slice(0, 2)
  .map((group, index) => ({
    id: `demo-report-${index + 1}`,
    groupId: group.id,
    messagePreview:
      index === 0
        ? 'Demo message containing an unwanted promotional link.'
        : 'Demo message containing a personal insult.',
    reason: index === 0 ? 'Spam' : 'Harassment',
    status: 'pending',
  }));

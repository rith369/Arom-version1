import {
  INITIAL_GROUPS,
  INITIAL_ACTIVITIES,
  type CommunityReportReason,
  type SupportGroup,
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
  // Closed by an admin: members can read the history but nobody can send.
  status: 'active' | 'closed';
  closedReason?: string;
  createdBy: 'admin' | 'professional';
  // Display name of the professional or admin who created the group.
  creatorName: string;
};

export type AdminGroupActivity = {
  id: string;
  groupId: string;
  title: string;
  kmTitle: string;
  dateLabel: string;
  status: 'scheduled' | 'cancelled';
};

// One message as an admin sees it in View chat (GET /api/admin/community/groups/:id/messages).
export type AdminGroupMessage = {
  id: string;
  content: string;
  createdAt: string;
  displayName: string;
  isMentor: boolean;
  isHidden: boolean;
};

export type CommunityReportKind = 'member' | 'message' | 'image' | 'group';

export type CommunityReport = {
  id: string;
  groupId: string;
  targetKind: CommunityReportKind;
  // Who or what was reported, for example "Anonymous 02". Never the reporter.
  targetLabel: string;
  messageId?: string;
  messagePreview: string;
  reason: string;
  note: string;
  createdAt: string;
  status: 'pending' | 'dismissed' | 'removed';
};

export const reportReasonLabels: Record<CommunityReportReason, string> = {
  harassment: 'Bullying or insults',
  spam: 'Spam or selling',
  harmful: 'Harmful advice',
  inappropriate_image: 'Inappropriate image',
  safety_concern: 'Someone may be in danger',
  other: 'Other',
};

export function toAdminGroup(group: SupportGroup): AdminGroup {
  return {
    id: group.id,
    name: group.name,
    kmName: group.nameKm,
    about: group.about,
    kmAbout: group.aboutKm,
    maxMembers: group.maxMembers,
    membersCount: group.membersCount,
    isAnonymous: group.isAnonymous,
    mentorId: '',
    rules: [...(group.rules ?? [])],
    status: group.status === 'closed' ? 'closed' : 'active',
    createdBy: group.createdBy ?? 'admin',
    creatorName: group.createdBy ? (group.mentor?.name ?? '') : 'AROM team',
  };
}

// Assign a professional explicitly in the admin demo (mentorId starts empty).
export const initialGroups: AdminGroup[] = INITIAL_GROUPS.map(toAdminGroup);

export const initialGroupActivities: AdminGroupActivity[] =
  INITIAL_ACTIVITIES.map((activity) => ({
    id: activity.id,
    groupId: activity.groupId,
    title: activity.title,
    kmTitle: activity.titleKm,
    dateLabel: activity.dateStr,
    status: 'scheduled',
  }));

// Fictional reports. Reports sent from /community in this browser are added
// on top of these by the admin provider.
export const initialCommunityReports: CommunityReport[] = [
  {
    id: 'demo-report-1',
    groupId: 'stress-burnout',
    targetKind: 'message',
    targetLabel: 'Message',
    messagePreview: 'Demo message containing an unwanted promotional link.',
    reason: 'Spam or selling',
    note: '',
    createdAt: '2026-10-12T08:20:00Z',
    status: 'pending',
  },
  {
    id: 'demo-report-2',
    groupId: 'depression-support',
    targetKind: 'member',
    targetLabel: 'Anonymous 02',
    messagePreview: 'Demo message containing a personal insult.',
    reason: 'Bullying or insults',
    note: 'This person keeps replying with insults.',
    createdAt: '2026-10-12T10:05:00Z',
    status: 'pending',
  },
  {
    id: 'demo-report-3',
    groupId: 'stress-burnout',
    targetKind: 'image',
    targetLabel: 'Image',
    messagePreview: 'Demo image: screenshot-of-ad.png',
    reason: 'Inappropriate image',
    note: '',
    createdAt: '2026-10-13T02:40:00Z',
    status: 'pending',
  },
  {
    id: 'demo-report-4',
    groupId: 'anxiety-circle',
    targetKind: 'group',
    targetLabel: 'Anxiety Circle',
    messagePreview: '',
    reason: 'Harmful advice',
    note: 'The group keeps telling people to stop their medicine.',
    createdAt: '2026-10-13T04:15:00Z',
    status: 'pending',
  },
];

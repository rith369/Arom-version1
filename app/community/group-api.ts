import { useEffect, useState } from 'react';
import type { UserRole } from '@/lib/auth';
import type { GroupsStatus, SupportGroup } from './community-data';

// One group from GET /api/community/groups.
export type ApiGroup = {
  id: string;
  name: string;
  nameKm: string | null;
  concern: string;
  description: string | null;
  descriptionKm: string | null;
  maxMembers: number;
  membersCount: number;
  // True for groups the person joined, and for the groups they lead (mentor).
  isJoined: boolean;
  status: 'active' | 'closed';
};

export function isGroupId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function toSupportGroup(group: ApiGroup): SupportGroup {
  return {
    id: group.id,
    name: group.name,
    nameKm: group.nameKm || group.name,
    about: group.description || '',
    aboutKm: group.descriptionKm || group.description || '',
    iconType: (['academic', 'stress', 'anxiety', 'depression'].includes(group.concern)
      ? group.concern
      : 'stress') as SupportGroup['iconType'],
    membersCount: group.membersCount,
    maxMembers: group.maxMembers,
    isAnonymous: true,
    expectations: [],
    expectationsKm: [],
    isJoined: group.isJoined,
    status: group.status,
    createdBy: 'professional',
  };
}

/** Group chats live in Messages: the professional area for professionals and admins. */
export function groupChatHref(role: UserRole | undefined, groupId: string) {
  return role === 'professional' || role === 'admin' ? `/pro/messages/groups/${groupId}` : `/messages/groups/${groupId}`;
}

export type CreateGroupResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * POST /api/community/groups. Only a verified professional can create a group
 * (RLS on support_groups); they become its mentor. Used by /community and
 * /pro/groups.
 */
export async function createSupportGroup(group: SupportGroup): Promise<CreateGroupResult> {
  if (group.createdBy !== 'professional') {
    return { ok: false, error: 'A verified professional account is required to create a group.' };
  }

  try {
    const response = await fetch('/api/community/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: group.name,
        nameKm: group.nameKm,
        concern: group.iconType,
        description: group.about,
        descriptionKm: group.aboutKm,
        maxMembers: group.maxMembers,
      }),
    });

    if (!response.ok) {
      const result: { error?: string } = await response.json();
      return { ok: false, error: result.error || 'Could not create group.' };
    }

    const result: { group: { id: string } } = await response.json();
    return { ok: true, id: result.group.id };
  } catch {
    return { ok: false, error: 'Could not create group.' };
  }
}

// The newest message of a group, for the Messages list.
export type GroupLastMessage = {
  text: string;
  createdAt: string;
  mine: boolean;
  senderName: string;
  removed: boolean;
  // text, voice, image (photo) or file (PDF).
  kind: string;
};

export type MyGroup = SupportGroup & { last: GroupLastMessage | null; unread: number };

// The private chats refresh at the same pace (message-store.ts).
const LIST_REFRESH_MS = 30_000;

/**
 * The groups this person joined or leads, each with its newest message and
 * unread count, from GET /api/community/chats (one call). Refreshes every 30
 * seconds while the page is on screen. markRead() clears a badge at once when
 * a chat is opened; the server is told by GroupChat.
 */
export function useMyGroups() {
  const [status, setStatus] = useState<GroupsStatus>('loading');
  const [groups, setGroups] = useState<MyGroup[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch('/api/community/chats', { cache: 'no-store' });
        if (!response.ok) {
          if (active) setStatus(response.status === 401 ? 'signed_out' : 'failed');
          return;
        }
        const result: { chats: (ApiGroup & { last: GroupLastMessage | null; unread: number })[] } = await response.json();
        if (!active) return;
        setGroups(result.chats.map((chat) => ({ ...toSupportGroup(chat), last: chat.last, unread: chat.unread })));
        setStatus('ready');
      } catch {
        if (active) setStatus('failed');
      }
    }

    void load();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, LIST_REFRESH_MS);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  function markRead(groupId: string) {
    setGroups((current) => current.map((group) => (group.id === groupId && group.unread ? { ...group, unread: 0 } : group)));
  }

  return { status, groups, markRead };
}

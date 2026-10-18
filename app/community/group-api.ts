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
};

export type MyGroup = SupportGroup & { last: GroupLastMessage | null };

type ApiGroupMessage = {
  content: string;
  created_at: string;
  display_name: string;
  is_own: boolean;
  is_removed?: boolean;
};

/**
 * The groups this person joined or leads, each with its newest message, for
 * the Messages list. There is no group unread count yet (that needs a backend
 * table, step 2 of the Messages redesign), so it reads each joined group's
 * latest messages.
 */
export function useMyGroups() {
  const [status, setStatus] = useState<GroupsStatus>('loading');
  const [groups, setGroups] = useState<MyGroup[]>([]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch('/api/community/groups', { cache: 'no-store' });
        if (!response.ok) {
          if (active) setStatus(response.status === 401 ? 'signed_out' : 'failed');
          return;
        }
        const result: { groups: ApiGroup[] } = await response.json();
        const joined = result.groups.filter((group) => group.isJoined).map(toSupportGroup);

        const withLast = await Promise.all(
          joined.map(async (group): Promise<MyGroup> => {
            try {
              const messages = await fetch(`/api/community/groups/${group.id}/messages`, { cache: 'no-store' });
              if (!messages.ok) return { ...group, last: null };
              const body: { messages: ApiGroupMessage[] } = await messages.json();
              const newest = body.messages.at(-1);
              return {
                ...group,
                last: newest
                  ? {
                      text: newest.content,
                      createdAt: newest.created_at,
                      mine: newest.is_own,
                      senderName: newest.display_name,
                      removed: newest.is_removed === true,
                    }
                  : null,
              };
            } catch {
              return { ...group, last: null };
            }
          }),
        );

        if (!active) return;
        setGroups(withLast);
        setStatus('ready');
      } catch {
        if (active) setStatus('failed');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { status, groups };
}

import type { SupportGroup } from './community-data';

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

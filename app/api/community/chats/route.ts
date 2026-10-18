import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const noStore = { 'Cache-Control': 'private, no-store' };

type ChatRow = {
  id: string;
  name: string;
  name_km: string | null;
  concern: string;
  description: string | null;
  description_km: string | null;
  max_members: number;
  members_count: number;
  is_active: boolean;
  last_content: string | null;
  last_at: string | null;
  last_display_name: string | null;
  last_is_own: boolean | null;
  last_is_removed: boolean;
  last_kind: string | null;
  unread: number;
};

/**
 * GET /api/community/chats: the groups the signed in person joined or leads,
 * each with its newest message and unread count, for the Messages list
 * (my_group_chats). One call instead of one per group.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Please sign in' }, { status: 401, headers: noStore });
  }

  const { data, error } = await supabase.rpc('my_group_chats');
  if (error) {
    console.error('Could not load group chats:', { code: error.code, message: error.message });
    return NextResponse.json({ error: 'Could not load your groups' }, { status: 500, headers: noStore });
  }

  const chats = ((data ?? []) as ChatRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    nameKm: row.name_km,
    concern: row.concern,
    description: row.description,
    descriptionKm: row.description_km,
    maxMembers: row.max_members,
    membersCount: row.members_count,
    isJoined: true,
    status: row.is_active ? 'active' : 'closed',
    last: row.last_at
      ? {
          text: row.last_content ?? '',
          createdAt: row.last_at,
          mine: row.last_is_own === true,
          senderName: row.last_display_name ?? '',
          removed: row.last_is_removed,
          kind: row.last_kind ?? 'text',
        }
      : null,
    unread: row.unread,
  }));

  return NextResponse.json({ chats }, { headers: noStore });
}

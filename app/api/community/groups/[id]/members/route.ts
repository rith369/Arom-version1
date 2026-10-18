import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const noStore = { 'Cache-Control': 'private, no-store' };

/**
 * GET /api/community/groups/:id/members: the mentor and members of a group,
 * for its members, mentor and admins (read_group_members). Names follow each
 * client's "Hide my identity" choice; no account ids are returned.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid group ID' }, { status: 400, headers: noStore });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Please sign in' }, { status: 401, headers: noStore });
  }

  const { data, error } = await supabase.rpc('read_group_members', { p_group_id: id });

  if (error) {
    console.error('Could not read group members:', { code: error.code, message: error.message });
    return NextResponse.json(
      { error: 'Could not load the members of this group' },
      { status: error.code === 'PT403' ? 403 : 500, headers: noStore },
    );
  }

  return NextResponse.json({ members: data ?? [] }, { headers: noStore });
}

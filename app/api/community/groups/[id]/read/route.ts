import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const noStore = { 'Cache-Control': 'private, no-store' };

/** POST /api/community/groups/:id/read: the group chat was opened (mark_group_read). */
export async function POST(_request: Request, context: RouteContext) {
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

  const { error } = await supabase.rpc('mark_group_read', { p_group_id: id });
  if (error) {
    return NextResponse.json(
      { error: 'Could not mark this group as read' },
      { status: error.code === 'PT403' ? 403 : 500, headers: noStore },
    );
  }

  return NextResponse.json({ ok: true }, { headers: noStore });
}

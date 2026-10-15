import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const noStore = { 'Cache-Control': 'private, no-store' };

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return NextResponse.json(
      { error: 'Invalid group ID' },
      { status: 400, headers: noStore },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Please sign in' },
      { status: 401, headers: noStore },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'user') {
    return NextResponse.json(
      { error: 'Only users can join support groups' },
      { status: 403, headers: noStore },
    );
  }

  const { data: memberNumber, error } = await supabase.rpc(
    'join_support_group',
    { p_group_id: id },
  );

  if (error) {
    console.error('Could not join support group:', error);
    return NextResponse.json(
      { error: 'Could not join this group. It may be closed or full.' },
      { status: 409, headers: noStore },
    );
  }

  return NextResponse.json(
    { joined: true, memberNumber },
    { headers: noStore },
  );
}

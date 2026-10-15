import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const noStore = { 'Cache-Control': 'private, no-store' };

export async function GET(_request: Request, context: RouteContext) {
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

  const { data, error } = await supabase.rpc('read_community_messages', {
    p_group_id: id,
  });

  if (error) {
    console.error('Could not read community messages:', error);
    return NextResponse.json(
      { error: 'Could not read messages for this group' },
      { status: error.code === 'P0001' ? 403 : 500, headers: noStore },
    );
  }

  return NextResponse.json({ messages: data ?? [] }, { headers: noStore });
}
export async function POST(request: Request, context: RouteContext) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: noStore },
    );
  }

  const content =
    body && typeof body === 'object' && 'content' in body ? body.content : null;

  if (
    typeof content !== 'string' ||
    !content.trim() ||
    content.trim().length > 2000
  ) {
    return NextResponse.json(
      { error: 'Message must be between 1 and 2000 characters' },
      { status: 400, headers: noStore },
    );
  }

  const { data, error } = await supabase
    .from('community_messages')
    .insert({
      group_id: id,
      author_id: user.id,
      content: content.trim(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Could not send community message:', error);
    return NextResponse.json(
      { error: 'Could not send message' },
      { status: error.code === '42501' ? 403 : 500, headers: noStore },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201, headers: noStore });
}

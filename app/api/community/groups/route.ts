import { z } from 'zod';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const noStore = { 'Cache-Control': 'private, no-store' };

export async function GET() {
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

  const { data: groups, error: groupsError } = await supabase
    .from('support_groups')
    .select(
      'id, mentor_id, name, name_km, concern, description, description_km, max_members',
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (groupsError) {
    console.error('Could not load community groups:', groupsError);
    return NextResponse.json(
      { error: 'Could not load groups' },
      { status: 500, headers: noStore },
    );
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)
    .is('left_at', null);

  if (membershipError) {
    console.error('Could not load group memberships:', membershipError);
    return NextResponse.json(
      { error: 'Could not load groups' },
      { status: 500, headers: noStore },
    );
  }

  const joinedIds = new Set((memberships ?? []).map((item) => item.group_id));

  const groupsWithCounts = await Promise.all(
    (groups ?? []).map(async (group) => {
      const { data: count, error } = await supabase.rpc(
        'get_group_member_count',
        { p_group_id: group.id },
      );

      if (error) {
        console.error('Could not load group member count:', error);
        throw error;
      }

      return {
        id: group.id,
        name: group.name,
        nameKm: group.name_km,
        concern: group.concern,
        description: group.description,
        descriptionKm: group.description_km,
        maxMembers: group.max_members,
        membersCount: count,
        isJoined: joinedIds.has(group.id) || group.mentor_id === user.id,
      };
    }),
  );

  return NextResponse.json({ groups: groupsWithCounts }, { headers: noStore });
}

const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  nameKm: z.string().trim().max(120).optional(),
  concern: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  descriptionKm: z.string().trim().max(1000).optional(),
  maxMembers: z.number().int().min(2).max(10),
});

// Post function

export async function POST(request: Request) {
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

  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the group details. Maximum 10 members.' },
      { status: 400, headers: noStore },
    );
  }

  const values = parsed.data;
  const { data, error } = await supabase
    .from('support_groups')
    .insert({
      mentor_id: user.id,
      name: values.name,
      name_km: values.nameKm || null,
      concern: values.concern,
      description: values.description || null,
      description_km: values.descriptionKm || null,
      max_members: values.maxMembers,
    })
    .select('id, name')
    .single();

  if (error) {
    console.error('Could not create support group:', error);
    return NextResponse.json(
      {
        error:
          'Could not create group. A verified professional account is required.',
      },
      { status: error.code === '42501' ? 403 : 500, headers: noStore },
    );
  }

  return NextResponse.json(
    { group: { id: data.id, name: data.name } },
    { status: 201, headers: noStore },
  );
}

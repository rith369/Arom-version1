-- AROM: community moderation (BACKEND-HANDOFF.md section 23).
--
--   1. Shut down and reopen a group (admin only, audit logged). Members of a
--      closed group can still read it; nobody can send, join or find it.
--   2. Reports from members on a person, message, image or group: 5 a day
--      each. The reporter is kept only for that limit and never reaches the
--      admin screens. The reported person is linked through their message,
--      so admins can act without ever seeing who they are.
--   3. Admins resolve a report: dismiss, or remove (hide the message or
--      image for everyone, take the person out of the group for good, or
--      shut the group down). Audit logged.
--   4. Admins list every group and create or edit groups (the mentor must
--      be a verified professional). Audit logged.
--   5. Members see "removed" in place of a hidden message.

-- ===========================================================================
-- 1. Columns
-- ===========================================================================
alter table public.support_groups
  add column closed_reason text check (closed_reason is null or char_length(closed_reason) <= 500),
  add column closed_at timestamptz,
  add column closed_by uuid references public.profiles (id) on delete set null,
  add column created_by_admin boolean not null default false;

alter table public.group_members
  add column removed_at timestamptz,
  add column removed_by uuid references public.profiles (id) on delete set null;

alter table public.community_messages
  add column hidden_at timestamptz,
  add column hidden_by uuid references public.profiles (id) on delete set null;

-- Members still find a group they are in after it is shut down, to read it.
-- Browse shows only active groups (policy from 20261008000500).
create policy "Members read their closed groups"
  on public.support_groups for select to authenticated
  using (public.is_group_member(id));

-- Nobody sends to a closed group.
drop policy if exists "Group members and mentors send messages" on public.community_messages;
create policy "Group members and mentors send messages"
  on public.community_messages for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and is_hidden = false
    and (public.is_group_member(group_id) or public.is_group_mentor(group_id))
    and exists (select 1 from public.support_groups g where g.id = group_id and g.is_active)
  );

-- Same as 20261008000500, plus: a person an admin removed cannot join again.
create or replace function public.join_support_group(p_group_id uuid)
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_group public.support_groups%rowtype;
  v_count integer;
  v_number smallint;
begin
  if v_user is null then
    raise exception 'Please sign in to join a group';
  end if;

  -- Lock the group row so two people cannot take the last seat together.
  select * into v_group
  from public.support_groups
  where id = p_group_id and is_active
  for update;

  if not found then
    raise exception 'This group is not available';
  end if;
  if v_group.mentor_id = v_user then
    raise exception 'You already lead this group as its mentor';
  end if;
  if exists (
    select 1 from public.group_members
    where group_id = p_group_id and user_id = v_user and removed_at is not null
  ) then
    raise exception 'This group is not available';
  end if;

  select member_number into v_number
  from public.group_members
  where group_id = p_group_id and user_id = v_user and left_at is null;
  if found then
    return v_number;
  end if;

  select count(*) into v_count
  from public.group_members
  where group_id = p_group_id and left_at is null;
  if v_count >= v_group.max_members then
    raise exception 'This group is currently full';
  end if;

  select min(n)::smallint into v_number
  from generate_series(1, v_group.max_members) as n
  where n not in (
    select member_number from public.group_members
    where group_id = p_group_id and left_at is null
  );

  insert into public.group_members (group_id, user_id, member_number)
  values (p_group_id, v_user, v_number);

  delete from public.group_waitlist where group_id = p_group_id and user_id = v_user;

  return v_number;
end;
$$;

-- ===========================================================================
-- 5. Members see a removed message as removed (its text is not sent)
-- ===========================================================================
drop function public.read_community_messages(uuid);

create function public.read_community_messages(p_group_id uuid)
returns table (
  id uuid,
  content text,
  created_at timestamptz,
  display_name text,
  is_own boolean,
  is_mentor boolean,
  is_removed boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in to read messages';
  end if;

  if not (public.is_group_member(p_group_id) or public.is_group_mentor(p_group_id)) then
    raise exception 'You cannot read this group';
  end if;

  return query
    select
      m.id,
      case when m.is_hidden then '' else m.content end,
      m.created_at,
      case
        when p.role = 'user' and p.hide_identity then
          case
            when m.author_id = (select auth.uid()) then 'Anonymous (You)'
            else 'Anonymous'
          end
        else coalesce(nullif(p.full_name, ''), 'Member')
      end as display_name,
      m.author_id = (select auth.uid()) as is_own,
      m.author_id = g.mentor_id as is_mentor,
      m.is_hidden
    from public.community_messages as m
    join public.profiles as p on p.id = m.author_id
    join public.support_groups as g on g.id = m.group_id
    where m.group_id = p_group_id
    order by m.created_at asc
    limit 100;
end;
$$;

revoke execute on function public.read_community_messages(uuid) from public, anon;
grant execute on function public.read_community_messages(uuid) to authenticated;

-- ===========================================================================
-- 2. Reports from members
-- ===========================================================================
create table public.community_reports (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.support_groups (id) on delete cascade,
  target_kind text not null check (target_kind in ('member', 'message', 'image', 'group')),
  message_id uuid references public.community_messages (id) on delete set null,
  -- The label members saw, for example "Anonymous". Never a real name.
  member_label text not null default '' check (char_length(member_label) <= 80),
  -- Who was reported, worked out from their message. Never shown to admins.
  member_user_id uuid references public.profiles (id) on delete set null,
  reason text not null check (reason in ('harassment', 'spam', 'harmful', 'inappropriate_image', 'safety_concern', 'other')),
  note text not null default '' check (char_length(note) <= 300),
  -- Kept only for the 5 a day limit. Never shown to admins.
  reporter_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'dismissed', 'removed')),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null
);

create index community_reports_pending_idx on public.community_reports (created_at desc) where status = 'pending';
create index community_reports_reporter_idx on public.community_reports (reporter_id, created_at desc);

alter table public.community_reports enable row level security;
revoke all on public.community_reports from anon, authenticated;

create or replace function public.submit_community_report(
  p_group_id uuid,
  p_target_kind text,
  p_message_id uuid,
  p_member_label text,
  p_reason text,
  p_note text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_author uuid;
begin
  if v_user is null then
    raise exception 'Please log in to send a report.' using errcode = 'PT403';
  end if;
  if not (public.is_group_member(p_group_id) or public.is_group_mentor(p_group_id)) then
    raise exception 'You can only report in groups you are in.';
  end if;
  if p_target_kind in ('message', 'image') and p_message_id is null then
    raise exception 'Choose the message to report.';
  end if;

  if p_message_id is not null then
    select m.author_id into v_author
    from public.community_messages m
    where m.id = p_message_id and m.group_id = p_group_id;
    if not found then
      raise exception 'That message is not in this group.';
    end if;
    if v_author = v_user then
      raise exception 'You cannot report your own message.';
    end if;
  end if;

  if (
    select count(*) from public.community_reports r
    where r.reporter_id = v_user and r.created_at > now() - interval '1 day'
  ) >= 5 then
    return 'daily_limit';
  end if;

  insert into public.community_reports
    (group_id, target_kind, message_id, member_label, member_user_id, reason, note, reporter_id)
  values (
    p_group_id,
    p_target_kind,
    p_message_id,
    left(trim(coalesce(p_member_label, '')), 80),
    case when p_target_kind = 'member' then v_author end,
    p_reason,
    trim(coalesce(p_note, '')),
    v_user
  );
  return 'sent';
end;
$$;

revoke execute on function public.submit_community_report(uuid, text, uuid, text, text, text) from public, anon;
grant execute on function public.submit_community_report(uuid, text, uuid, text, text, text) to authenticated;

-- ===========================================================================
-- Admin: groups
-- ===========================================================================
create or replace function public.admin_list_groups()
returns table (
  id uuid,
  name text,
  name_km text,
  concern text,
  description text,
  description_km text,
  max_members smallint,
  members_count integer,
  is_active boolean,
  closed_reason text,
  mentor_id uuid,
  mentor_name text,
  created_by_admin boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can see every group';
  end if;

  return query
    select g.id, g.name, g.name_km, g.concern, g.description, g.description_km, g.max_members,
           (select count(*)::integer from public.group_members gm where gm.group_id = g.id and gm.left_at is null),
           g.is_active, g.closed_reason, g.mentor_id, p.display_name, g.created_by_admin, g.created_at
    from public.support_groups g
    join public.professional_profiles p on p.id = g.mentor_id
    order by g.created_at desc;
end;
$$;

create or replace function public.admin_set_group_closed(p_group_id uuid, p_closed boolean, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_reason text := trim(coalesce(p_reason, ''));
begin
  if not public.is_admin() then
    raise exception 'Only an admin can shut a group down';
  end if;
  if p_closed and (char_length(v_reason) = 0 or char_length(v_reason) > 500) then
    raise exception 'Write a reason of up to 500 characters';
  end if;

  update public.support_groups
  set is_active = not p_closed,
      closed_reason = case when p_closed then v_reason end,
      closed_at = case when p_closed then now() end,
      closed_by = case when p_closed then v_admin end
  where id = p_group_id and is_active = p_closed;
  if not found then
    raise exception 'This group is already %', case when p_closed then 'closed' else 'open' end;
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (v_admin, case when p_closed then 'close_group' else 'reopen_group' end, 'support_groups', p_group_id,
          case when p_closed then jsonb_build_object('reason', v_reason) else '{}'::jsonb end);
end;
$$;

-- Creates a group (p_id null) or edits one. The mentor must be a verified professional.
create or replace function public.admin_save_group(
  p_id uuid,
  p_name text,
  p_name_km text,
  p_description text,
  p_description_km text,
  p_max_members smallint,
  p_mentor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can save a group';
  end if;
  if char_length(trim(coalesce(p_name, ''))) = 0 then
    raise exception 'Write the group name';
  end if;
  if not exists (
    select 1 from public.professional_profiles pp
    join public.profiles pr on pr.id = pp.id
    where pp.id = p_mentor_id and pp.verification_status = 'verified' and pr.account_status = 'active'
  ) then
    raise exception 'Choose a verified professional as the mentor';
  end if;
  if p_id is not null and p_max_members < (
    select count(*) from public.group_members gm where gm.group_id = p_id and gm.left_at is null
  ) then
    raise exception 'The group already has more members than that';
  end if;

  if p_id is null then
    insert into public.support_groups (mentor_id, name, name_km, concern, description, description_km, max_members, created_by_admin)
    values (p_mentor_id, trim(p_name), nullif(trim(coalesce(p_name_km, '')), ''), 'stress',
            nullif(trim(coalesce(p_description, '')), ''), nullif(trim(coalesce(p_description_km, '')), ''), p_max_members, true)
    returning id into v_id;
  else
    update public.support_groups
    set mentor_id = p_mentor_id,
        name = trim(p_name),
        name_km = nullif(trim(coalesce(p_name_km, '')), ''),
        description = nullif(trim(coalesce(p_description, '')), ''),
        description_km = nullif(trim(coalesce(p_description_km, '')), ''),
        max_members = p_max_members
    where id = p_id
    returning id into v_id;
    if v_id is null then
      raise exception 'Group not found';
    end if;
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (v_admin, case when p_id is null then 'create_group' else 'edit_group' end, 'support_groups', v_id,
          jsonb_build_object('name', trim(p_name)));
  return v_id;
end;
$$;

-- ===========================================================================
-- Admin: reports
-- ===========================================================================
create or replace function public.admin_list_community_reports()
returns table (
  id uuid,
  group_id uuid,
  target_kind text,
  message_id uuid,
  member_label text,
  message_preview text,
  reason text,
  note text,
  created_at timestamptz,
  status text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can see reports';
  end if;

  return query
    select r.id, r.group_id, r.target_kind, r.message_id, r.member_label,
           left(coalesce(m.content, ''), 300), r.reason, r.note, r.created_at, r.status
    from public.community_reports r
    left join public.community_messages m on m.id = r.message_id
    where r.status = 'pending' or r.created_at > now() - interval '180 days'
    order by r.created_at desc
    limit 1000;
end;
$$;

create or replace function public.admin_resolve_community_report(p_report_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_report public.community_reports%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can resolve reports';
  end if;
  if p_status not in ('dismissed', 'removed') then
    raise exception 'Choose dismiss or remove';
  end if;

  select * into v_report from public.community_reports where id = p_report_id for update;
  if not found then
    raise exception 'Report not found';
  end if;
  if v_report.status <> 'pending' then
    raise exception 'This report is already closed';
  end if;

  if p_status = 'removed' then
    if v_report.target_kind in ('message', 'image') and v_report.message_id is not null then
      update public.community_messages
      set is_hidden = true, hidden_at = now(), hidden_by = v_admin
      where id = v_report.message_id and not is_hidden;
    elsif v_report.target_kind = 'member' and v_report.member_user_id is not null then
      update public.group_members
      set left_at = coalesce(left_at, now()), removed_at = now(), removed_by = v_admin
      where group_id = v_report.group_id and user_id = v_report.member_user_id and removed_at is null;
    elsif v_report.target_kind = 'group' then
      update public.support_groups
      set is_active = false, closed_reason = 'Closed after a report', closed_at = now(), closed_by = v_admin
      where id = v_report.group_id and is_active;
    end if;
  end if;

  update public.community_reports
  set status = p_status, resolved_at = now(), resolved_by = v_admin
  where id = p_report_id;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (v_admin, 'resolve_community_report', 'community_reports', p_report_id,
          jsonb_build_object('status', p_status, 'kind', v_report.target_kind));
end;
$$;

revoke execute on function public.admin_list_groups() from public, anon;
grant execute on function public.admin_list_groups() to authenticated;
revoke execute on function public.admin_set_group_closed(uuid, boolean, text) from public, anon;
grant execute on function public.admin_set_group_closed(uuid, boolean, text) to authenticated;
revoke execute on function public.admin_save_group(uuid, text, text, text, text, smallint, uuid) from public, anon;
grant execute on function public.admin_save_group(uuid, text, text, text, text, smallint, uuid) to authenticated;
revoke execute on function public.admin_list_community_reports() from public, anon;
grant execute on function public.admin_list_community_reports() to authenticated;
revoke execute on function public.admin_resolve_community_report(uuid, text) from public, anon;
grant execute on function public.admin_resolve_community_report(uuid, text) to authenticated;

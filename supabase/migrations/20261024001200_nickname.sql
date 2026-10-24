-- AROM: a nickname for people who hide their identity (BACKEND-HANDOFF.md
-- section 29).
--
-- Decided by Rith (24 Oct 2026):
--   * Hiding your identity stays on by default. A user who hides it can set
--     a nickname ("Name your therapist sees"). Empty means "Anonymous", as
--     before.
--   * The nickname shows wherever "Anonymous" showed: to professionals
--     (bookings, clients, messages), to the clinic desk, and in support groups.
--   * Professionals keep the per professional code after it ("Mony #1625"),
--     added by the app from the client's alias. The bookings data now says
--     whether the client is hidden (clientHidden) so the app knows when.
--   * Nicknames are 2 to 30 characters with no links, emails, long numbers,
--     "#", "@" or brackets, and cannot contain "arom", "admin" or "moderator",
--     so nobody can pass on contact details, fake a code or pretend to be staff.
--
--   1. profiles.nickname
--   2. shown_name(): the one rule for the name others see
--   3. Every function that showed "Anonymous" now uses it

-- 1. The nickname ------------------------------------------------------------------

alter table public.profiles
  add column if not exists nickname text;

alter table public.profiles
  add constraint profiles_nickname_check check (
    nickname is null
    or (
      nickname = btrim(nickname)
      and char_length(nickname) between 2 and 30
      and nickname !~ '[[:cntrl:]#@<>]'
      and nickname !~* '(https?://|www\.|\.com|\.kh|t\.me)'
      and nickname !~ '[0-9]{5,}'
      and lower(nickname) !~ '(arom|admin|moderator)'
    )
  );

-- 2. The name others see -----------------------------------------------------------

-- A user who hides their identity shows as their nickname, or "Anonymous".
-- Everyone else shows by their name, or p_fallback.
create or replace function public.shown_name(
  p_role public.user_role,
  p_hide_identity boolean,
  p_full_name text,
  p_nickname text,
  p_fallback text
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_role = 'user' and coalesce(p_hide_identity, true)
      then coalesce(nullif(btrim(p_nickname), ''), 'Anonymous')
    else coalesce(nullif(btrim(p_full_name), ''), p_fallback)
  end;
$$;

-- 3. Functions that showed "Anonymous" --------------------------------------------

-- Clinic desk (section 34).
create or replace function public.desk_client_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Client')
  from public.profiles p
  where p.id = p_user_id;
$$;

create or replace function public.my_booking_client_aliases()
returns table (appointment_id uuid, client_alias_id uuid, client_display_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.id,
    alias.alias_id,
    public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Client')
  from public.appointments as a
  join public.professional_client_aliases as alias
    on alias.professional_id = a.professional_id
   and alias.user_id = a.user_id
  join public.profiles as p on p.id = a.user_id
  where a.professional_id = (select auth.uid());
$$;

create or replace function public.my_message_client_names()
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.alias_id,
    public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Client')
  from public.professional_client_aliases as a
  join public.profiles as p on p.id = a.user_id
  where a.professional_id = (select auth.uid());
$$;

-- The professional's bookings: same as before, with the shared name rule and
-- clientHidden (the app adds the code "#1625" when it is true).
create or replace function public.read_my_pro_bookings_safe()
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if exists (
    select 1
    from public.appointments as a
    left join public.professional_client_aliases as alias
      on alias.professional_id = a.professional_id
     and alias.user_id = a.user_id
    where a.professional_id = (select auth.uid())
      and alias.alias_id is null
  ) then
    raise exception 'A booking is missing its client alias.'
      using errcode = 'PT409';
  end if;

  return query
    select jsonb_build_object(
      'id', a.id,
      'professionalId', pp.slug,
      'clientId', alias.alias_id,
      'clientName', public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Client'),
      'clientHidden', p.role = 'user' and coalesce(p.hide_identity, true),
      'clientLanguage', case
        when p.language::text = 'en' then 'en'
        else 'km'
      end,
      'startsAt', a.starts_at,
      'durationMinutes',
        round(extract(epoch from (a.ends_at - a.starts_at)) / 60)::integer,
      'sessionType', a.session_type,
      'status', a.status,
      -- Written by the client for this professional, so shown even when
      -- the client hides their identity.
      'intakeNote', coalesce(a.intake_note, ''),
      'intakeAnswers', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'question', jsonb_build_object(
              'en', ia.question_snapshot,
              'km', ia.question_snapshot
            ),
            'answer', case
              when jsonb_typeof(ia.answer) = 'string'
                then ia.answer #>> '{}'
              else ia.answer::text
            end
          )
          order by ia.created_at, ia.id
        )
        from public.intake_answers as ia
        where ia.appointment_id = a.id
      ), '[]'::jsonb),
      'cancelledBy', case
        when a.status <> 'cancelled' or a.cancelled_by is null
          then null::text
        when a.cancelled_by = a.user_id then 'client'
        when a.cancelled_by = a.professional_id then 'professional'
        else 'admin'
      end,
      'cancelReason', coalesce(a.cancel_reason, ''),
      'rescheduledFrom', a.rescheduled_from,
      'rescheduleReason', coalesce(a.reschedule_reason, ''),
      'rescheduledBy', case
        when a.rescheduled_from is null then null::text
        when a.rescheduled_by = a.user_id then 'client'
        else 'professional'
      end,
      'shareSurvey', a.share_survey,
      'shareSymptomChecks', a.share_symptom_checks,
      'shareMoodTrend', a.share_mood_trend,
      'meetingUrl', case
        when a.session_type = 'online' then a.meeting_url
        else null::text
      end,
      'seriesId', a.series_id
    )
    from public.appointments as a
    join public.professional_client_aliases as alias
      on alias.professional_id = a.professional_id
     and alias.user_id = a.user_id
    join public.profiles as p on p.id = a.user_id
    join public.professional_profiles as pp
      on pp.id = a.professional_id
    where a.professional_id = (select auth.uid())
    order by a.starts_at desc, a.id desc
    limit 500;
end;
$$;

-- Support groups (section 23): the chat list, messages, members and the
-- admin's safety read. Hidden members show their nickname or "Anonymous".
create or replace function public.my_group_chats()
returns table (
  id uuid, name text, name_km text, concern text, description text, description_km text,
  max_members smallint, members_count integer, is_active boolean, last_content text,
  last_at timestamptz, last_display_name text, last_is_own boolean, last_is_removed boolean,
  last_kind text, unread integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'Please sign in' using errcode = 'PT401';
  end if;

  return query
    with mine as (
      select s.group_id, min(s.since) as since
      from (
        select gm.group_id, gm.joined_at as since
        from public.group_members as gm
        where gm.user_id = v_me and gm.left_at is null
        union all
        select g.id, g.created_at
        from public.support_groups as g
        where g.mentor_id = v_me
      ) as s
      group by s.group_id
    )
    select
      g.id,
      g.name,
      g.name_km,
      g.concern,
      g.description,
      g.description_km,
      g.max_members,
      (select count(*)::integer from public.group_members as c
        where c.group_id = g.id and c.left_at is null),
      g.is_active,
      case when lm.is_hidden then '' else lm.content end,
      lm.created_at,
      case
        when lm.id is null then null::text
        when lp.role = 'user' and coalesce(lp.hide_identity, true) then
          public.shown_name(lp.role, lp.hide_identity, lp.full_name, lp.nickname, 'Member')
            || case when lm.author_id = v_me then ' (You)' else '' end
        else coalesce(nullif(lp.full_name, ''), 'Member')
      end,
      lm.author_id = v_me,
      coalesce(lm.is_hidden, false),
      lm.kind,
      (select count(*)::integer from public.community_messages as u
        where u.group_id = g.id
          and u.author_id <> v_me
          and not u.is_hidden
          and u.created_at > greatest(m.since, coalesce(r.last_read_at, m.since)))
    from mine as m
    join public.support_groups as g on g.id = m.group_id
    left join public.group_reads as r on r.group_id = g.id and r.user_id = v_me
    left join lateral (
      select cm.id, cm.content, cm.created_at, cm.author_id, cm.is_hidden, cm.kind
      from public.community_messages as cm
      where cm.group_id = g.id
      order by cm.created_at desc, cm.id desc
      limit 1
    ) as lm on true
    left join public.profiles as lp on lp.id = lm.author_id
    order by lm.created_at desc nulls last, g.name;
end;
$$;

create or replace function public.read_community_messages(p_group_id uuid)
returns table (
  id uuid, content text, created_at timestamptz, display_name text, is_own boolean,
  is_mentor boolean, is_removed boolean, kind text, attachment_name text,
  attachment_type text, attachment_size integer, duration_seconds integer
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
          public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Member')
            || case when m.author_id = (select auth.uid()) then ' (You)' else '' end
        else coalesce(nullif(p.full_name, ''), 'Member')
      end,
      m.author_id = (select auth.uid()),
      m.author_id = g.mentor_id,
      m.is_hidden,
      m.kind,
      case when m.is_hidden then null else m.attachment_name end,
      case when m.is_hidden then null else m.attachment_type end,
      case when m.is_hidden then null else m.attachment_size end,
      m.duration_seconds::integer
    from (
      select cm.*
      from public.community_messages as cm
      where cm.group_id = p_group_id
      order by cm.created_at desc, cm.id desc
      limit 100
    ) as m
    join public.profiles as p on p.id = m.author_id
    join public.support_groups as g on g.id = m.group_id
    order by m.created_at asc, m.id asc;
end;
$$;

create or replace function public.read_group_members(p_group_id uuid)
returns table (
  member_key uuid, display_name text, display_name_km text, is_mentor boolean, is_you boolean,
  mentor_title text, mentor_title_km text, mentor_years integer, photo_url text, joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'Sign in to see group members' using errcode = 'PT401';
  end if;

  if not (
    coalesce(public.is_group_member(p_group_id), false)
    or coalesce(public.is_group_mentor(p_group_id), false)
    or coalesce(public.is_admin(), false)
  ) then
    raise exception 'You cannot see the members of this group' using errcode = 'PT403';
  end if;

  return query
    -- The mentor first.
    select
      g.id,
      coalesce(nullif(btrim(pp.display_name), ''), 'Group mentor'),
      coalesce(nullif(btrim(pp.display_name_km), ''), nullif(btrim(pp.display_name), ''), 'អ្នកណែនាំក្រុម'),
      true,
      g.mentor_id = v_me,
      pp.title,
      coalesce(nullif(btrim(pp.title_km), ''), pp.title),
      pp.years_experience::integer,
      pp.photo_url,
      g.created_at
    from public.support_groups as g
    left join public.professional_profiles as pp on pp.id = g.mentor_id
    where g.id = p_group_id
      and g.mentor_id is not null

    union all

    -- Then the members, oldest first.
    select
      gm.id,
      public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Member'),
      case
        when p.role = 'user' and coalesce(p.hide_identity, true)
          then coalesce(nullif(btrim(p.nickname), ''), 'អនាមិក')
        else coalesce(nullif(btrim(p.full_name), ''), 'សមាជិក')
      end,
      false,
      gm.user_id = v_me,
      null::text,
      null::text,
      null::integer,
      null::text,
      gm.joined_at
    from public.group_members as gm
    join public.profiles as p on p.id = gm.user_id
    join public.support_groups as g on g.id = gm.group_id
    where gm.group_id = p_group_id
      and gm.left_at is null
      and gm.removed_at is null
      and gm.user_id is distinct from g.mentor_id
    order by 4 desc, 10 asc;
end;
$$;

create or replace function public.admin_read_community_messages(p_group_id uuid, p_reason text default null)
returns table (
  id uuid, content text, created_at timestamptz, display_name text, is_mentor boolean, is_hidden boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can open this chat';
  end if;
  if not exists (select 1 from public.support_groups g where g.id = p_group_id) then
    raise exception 'Group not found';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    (select auth.uid()),
    'read_group_chat',
    'support_groups',
    p_group_id,
    jsonb_build_object('reason', left(coalesce(trim(p_reason), ''), 300))
  );

  return query
    select
      m.id,
      case
        when m.kind = 'image' then '[Photo] ' || coalesce(m.attachment_name, '')
        when m.kind = 'file' then '[PDF] ' || coalesce(m.attachment_name, '')
        when m.kind = 'voice' then '[Voice message]'
        else m.content
      end,
      m.created_at,
      case
        when p.role = 'user' and p.hide_identity
          then public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Member')
        else coalesce(nullif(p.full_name, ''), 'Member')
      end,
      m.author_id = g.mentor_id,
      m.is_hidden
    from public.community_messages as m
    join public.profiles as p on p.id = m.author_id
    join public.support_groups as g on g.id = m.group_id
    where m.group_id = p_group_id
    order by m.created_at asc
    limit 200;
end;
$$;

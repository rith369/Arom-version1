-- AROM: unread counts and one list call for group chats in Messages
-- (step 2 of the Messages redesign, 19 Oct 2026).
--
-- 1. group_reads: when each person last opened each group chat. Only these
--    functions touch it; nobody can see when other members read.
-- 2. mark_group_read(group): called when the chat is opened and while it is
--    open. Only for a member or the mentor of the group.
-- 3. my_group_chats(): the groups the caller joined or leads, each with its
--    newest message and how many messages from others arrived since the
--    caller last read it. One call instead of one per group. The sender name
--    follows the same rule as read_community_messages(): a client with
--    hide_identity on is "Anonymous". Messages hidden by the AROM team show
--    no text and are not counted as unread.
--
-- Unread starts from when the person joined (or created the group), so a new
-- member is not shown the whole history as unread.

begin;

create table public.group_reads (
  group_id uuid not null references public.support_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.group_reads enable row level security;
-- No policies: browsers never read or write it directly.
revoke all on table public.group_reads from public, anon, authenticated;

create index group_reads_user_idx on public.group_reads (user_id);

create or replace function public.mark_group_read(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'Please sign in' using errcode = 'PT401';
  end if;

  if not (
    coalesce(public.is_group_member(p_group_id), false)
    or coalesce(public.is_group_mentor(p_group_id), false)
  ) then
    raise exception 'You are not in this group' using errcode = 'PT403';
  end if;

  insert into public.group_reads (group_id, user_id, last_read_at)
  values (p_group_id, v_me, now())
  on conflict (group_id, user_id) do update set last_read_at = excluded.last_read_at;
end;
$$;

revoke execute on function public.mark_group_read(uuid) from public, anon;
grant execute on function public.mark_group_read(uuid) to authenticated;

create or replace function public.my_group_chats()
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
  last_content text,
  last_at timestamptz,
  last_display_name text,
  last_is_own boolean,
  last_is_removed boolean,
  unread integer
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
      -- Groups the caller is in or leads (one row each, even when the mentor
      -- also has a member row), and since when unread should count.
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
          case when lm.author_id = v_me then 'Anonymous (You)' else 'Anonymous' end
        else coalesce(nullif(lp.full_name, ''), 'Member')
      end,
      lm.author_id = v_me,
      coalesce(lm.is_hidden, false),
      (select count(*)::integer from public.community_messages as u
        where u.group_id = g.id
          and u.author_id <> v_me
          and not u.is_hidden
          and u.created_at > greatest(m.since, coalesce(r.last_read_at, m.since)))
    from mine as m
    join public.support_groups as g on g.id = m.group_id
    left join public.group_reads as r on r.group_id = g.id and r.user_id = v_me
    left join lateral (
      select cm.id, cm.content, cm.created_at, cm.author_id, cm.is_hidden
      from public.community_messages as cm
      where cm.group_id = g.id
      order by cm.created_at desc, cm.id desc
      limit 1
    ) as lm on true
    left join public.profiles as lp on lp.id = lm.author_id
    order by lm.created_at desc nulls last, g.name;
end;
$$;

revoke execute on function public.my_group_chats() from public, anon;
grant execute on function public.my_group_chats() to authenticated;

notify pgrst, 'reload schema';

commit;

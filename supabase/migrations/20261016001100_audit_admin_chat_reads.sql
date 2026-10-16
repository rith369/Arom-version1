-- AROM: admins read community chats only through an audited door
-- (AGENTS.md section 9, BACKEND-HANDOFF.md section 23).
--
--   1. read_community_messages() is for members and the mentor only. Its
--      admin branch is removed, so no admin read can skip the log.
--   2. admin_read_community_messages(group, reason) is the admin door. It
--      writes one admin_audit_log row each time a chat is opened, then
--      returns the messages with the same names members see (Anonymous
--      stays Anonymous) and hidden messages marked.
-- Message text is never written to the log.

create or replace function public.read_community_messages(p_group_id uuid)
returns table (
  id uuid,
  content text,
  created_at timestamptz,
  display_name text,
  is_own boolean,
  is_mentor boolean
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
      m.content,
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
      m.author_id = g.mentor_id as is_mentor
    from public.community_messages as m
    join public.profiles as p on p.id = m.author_id
    join public.support_groups as g on g.id = m.group_id
    where m.group_id = p_group_id
      and (not m.is_hidden or m.author_id = (select auth.uid()))
    order by m.created_at asc
    limit 100;
end;
$$;

create or replace function public.admin_read_community_messages(p_group_id uuid, p_reason text default null)
returns table (
  id uuid,
  content text,
  created_at timestamptz,
  display_name text,
  is_mentor boolean,
  is_hidden boolean
)
language plpgsql
volatile
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
      m.content,
      m.created_at,
      case
        when p.role = 'user' and p.hide_identity then 'Anonymous'
        else coalesce(nullif(p.full_name, ''), 'Member')
      end as display_name,
      m.author_id = g.mentor_id as is_mentor,
      m.is_hidden
    from public.community_messages as m
    join public.profiles as p on p.id = m.author_id
    join public.support_groups as g on g.id = m.group_id
    where m.group_id = p_group_id
    order by m.created_at asc
    limit 200;
end;
$$;

revoke execute on function public.admin_read_community_messages(uuid, text) from public, anon;
grant execute on function public.admin_read_community_messages(uuid, text) to authenticated;

-- 3. Raw rows: only the author reads their own. Admins go through the
--    audited function above, never straight to the table.
drop policy if exists "Authors and admins read raw messages" on public.community_messages;
create policy "Authors read own raw messages"
  on public.community_messages for select to authenticated
  using (author_id = (select auth.uid()));

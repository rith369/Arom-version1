-- AROM: photos, PDF files and voice in every chat (19 Oct 2026).
--
-- Private chats (client and professional) already had text and voice; they
-- now also take photos (JPG, PNG, WebP) and PDF files. Support group chats
-- had text only; they now take voice, photos and PDF files too. Decided by
-- Rith: group voice is allowed with a warning that a voice can identify
-- someone, and group photos can be reported and hidden by the AROM team.
--
-- Same pattern as voice notes:
--   * files go to private buckets, in folders named after the chat and the
--     sender: <conversation or group id>/<sender id>/<uuid>.<ext>
--   * nobody gets a public or signed link; the server streams a file only
--     after checking the caller is in that chat (and, for groups, that the
--     message was not hidden by the AROM team; admins may still open it)
--   * the server checks the file type from its first bytes
--
-- Also fixes read_community_messages(), which returned the oldest 100
-- messages instead of the newest 100.

begin;

-- ---------------------------------------------------------------------------
-- 1. Private chats
-- ---------------------------------------------------------------------------

alter table public.messages
  add column attachment_path text,
  add column attachment_name text,
  add column attachment_type text,
  add column attachment_size integer;

alter table public.messages drop constraint messages_kind_check;
alter table public.messages
  add constraint messages_kind_check
  check (kind = any (array['text', 'voice', 'suggestion', 'image', 'file']));

alter table public.messages drop constraint messages_content_check;
alter table public.messages
  add constraint messages_content_check check (
    (kind = 'text' and body is not null and audio_path is null and duration_seconds is null
      and suggestion_id is null and attachment_path is null)
    or (kind = 'voice' and body is null and audio_path is not null and duration_seconds is not null
      and suggestion_id is null and attachment_path is null)
    or (kind = 'suggestion' and body is null and audio_path is null and duration_seconds is null
      and suggestion_id is not null and attachment_path is null)
    or (kind in ('image', 'file') and body is null and audio_path is null and duration_seconds is null
      and suggestion_id is null and attachment_path is not null and attachment_name is not null
      and attachment_type is not null)
  );

alter table public.messages
  add constraint messages_attachment_check check (
    attachment_path is null
    or (
      attachment_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
      and attachment_size between 1 and 5242880
      and char_length(attachment_name) between 1 and 120
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-attachments', 'message-attachments', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Uploads use the same rule as voice: your own folder, in an open
-- conversation you may write in. Nobody reads the bucket directly; the
-- server streams files after a membership check.
create policy "Conversation members upload attachments"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'message-attachments'
    and public.can_upload_voice(name)
  );

-- Mirrors send_message(): open_conversation() enforces "only after a booked
-- session" and "closed conversations are read only".
create or replace function public.send_attachment(
  p_other uuid,
  p_as text,
  p_kind text,
  p_path text,
  p_name text,
  p_type text,
  p_size integer
)
returns public.messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_conversation uuid;
  v_row public.messages;
begin
  v_conversation := public.open_conversation(p_other, p_as);

  if p_kind = 'image' then
    if p_type not in ('image/jpeg', 'image/png', 'image/webp') then
      raise exception 'Photos can be JPG, PNG or WebP.' using errcode = '22023';
    end if;
  elsif p_kind = 'file' then
    if p_type <> 'application/pdf' then
      raise exception 'Files can be PDF.' using errcode = '22023';
    end if;
  else
    raise exception 'Unknown message kind.' using errcode = '22023';
  end if;

  if p_size is null or p_size not between 1 and 5242880 then
    raise exception 'A file can be up to 5 MB.' using errcode = '22023';
  end if;
  if p_name is null or char_length(btrim(p_name)) = 0 or char_length(p_name) > 120 then
    raise exception 'The file needs a name.' using errcode = '22023';
  end if;

  if p_path is null
    or p_path !~ ('^' || v_conversation::text || '/' || v_me::text || '/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$')
    or not exists (
      select 1 from storage.objects o
      where o.bucket_id = 'message-attachments' and o.name = p_path
    )
  then
    raise exception 'The file was not uploaded.' using errcode = '22023';
  end if;

  insert into public.messages
    (conversation_id, sender_id, kind, attachment_path, attachment_name, attachment_type, attachment_size)
  values (v_conversation, v_me, p_kind, p_path, btrim(p_name), p_type, p_size)
  returning * into v_row;

  return v_row;
end;
$$;

-- Only the safe wrapper below may call it.
revoke execute on function public.send_attachment(uuid, text, text, text, text, text, integer)
  from public, anon, authenticated;

create or replace function public.send_attachment_safe(
  p_other uuid,
  p_as text,
  p_kind text,
  p_path text,
  p_name text,
  p_type text,
  p_size integer
)
returns public.messages
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.send_attachment(
    public.resolve_message_recipient(p_other, p_as),
    p_as, p_kind, p_path, p_name, p_type, p_size
  );
end;
$$;

revoke execute on function public.send_attachment_safe(uuid, text, text, text, text, text, integer)
  from public, anon;
grant execute on function public.send_attachment_safe(uuid, text, text, text, text, text, integer)
  to authenticated;

-- Same as 20261017001900_read_private_messages_safe.sql, plus the file
-- name, type and size (never the storage path).
drop function public.read_private_messages_safe(uuid, integer);

create function public.read_private_messages_safe(
  p_conversation_id uuid,
  p_limit integer default 300
)
returns table (
  id uuid,
  sender_id uuid,
  kind text,
  body text,
  duration_seconds integer,
  suggestion_id uuid,
  created_at timestamptz,
  read_at timestamptz,
  attachment_name text,
  attachment_type text,
  attachment_size integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Please log in to continue.' using errcode = 'PT401';
  end if;

  if not coalesce(public.is_conversation_member(p_conversation_id), false) then
    raise exception 'Conversation not found.' using errcode = 'PT404';
  end if;

  return query
    select
      m.id,
      case when m.sender_id = (select auth.uid()) then m.sender_id else null::uuid end,
      m.kind,
      m.body,
      m.duration_seconds::integer,
      m.suggestion_id,
      m.created_at,
      m.read_at,
      m.attachment_name,
      m.attachment_type,
      m.attachment_size
    from public.messages as m
    where m.conversation_id = p_conversation_id
    order by m.created_at desc, m.id desc
    limit least(greatest(coalesce(p_limit, 300), 1), 300);
end;
$$;

revoke execute on function public.read_private_messages_safe(uuid, integer) from public, anon;
grant execute on function public.read_private_messages_safe(uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Support group chats
-- ---------------------------------------------------------------------------

alter table public.community_messages
  add column kind text not null default 'text',
  add column attachment_path text,
  add column attachment_name text,
  add column attachment_type text,
  add column attachment_size integer,
  add column duration_seconds smallint;

alter table public.community_messages drop constraint community_messages_content_check;
alter table public.community_messages
  add constraint community_messages_content_check check (
    char_length(content) <= 2000
    and (
      (kind = 'text' and char_length(content) >= 1 and attachment_path is null and duration_seconds is null)
      or (kind = 'voice' and attachment_path is not null and duration_seconds between 1 and 120
        and attachment_type in ('audio/webm', 'audio/ogg', 'audio/mp4'))
      or (kind = 'image' and attachment_path is not null and duration_seconds is null
        and attachment_type in ('image/jpeg', 'image/png', 'image/webp'))
      or (kind = 'file' and attachment_path is not null and duration_seconds is null
        and attachment_type = 'application/pdf')
    )
    and (attachment_path is null or attachment_size between 1 and 5242880)
    and (attachment_name is null or char_length(attachment_name) between 1 and 120)
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-media', 'community-media', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'audio/webm', 'audio/ogg', 'audio/mp4']
)
on conflict (id) do nothing;

-- <group id>/<sender id>/<uuid>.<ext>, by a member or the mentor of an
-- active group, into their own folder.
create or replace function public.can_upload_community_media(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_group uuid;
begin
  if p_name !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|pdf|webm|ogg|m4a)$' then
    return false;
  end if;
  v_group := split_part(p_name, '/', 1)::uuid;
  return split_part(p_name, '/', 2) = (select auth.uid())::text
    and (coalesce(public.is_group_member(v_group), false) or coalesce(public.is_group_mentor(v_group), false))
    and exists (select 1 from public.support_groups g where g.id = v_group and g.is_active);
end;
$$;

revoke execute on function public.can_upload_community_media(text) from public, anon;
grant execute on function public.can_upload_community_media(text) to authenticated;

create policy "Group members upload media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'community-media'
    and public.can_upload_community_media(name)
  );

-- The message may only point at a file the sender uploaded into this group.
create or replace function public.community_media_uploaded(p_group_id uuid, p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select split_part(p_path, '/', 1) = p_group_id::text
    and split_part(p_path, '/', 2) = (select auth.uid())::text
    and exists (
      select 1 from storage.objects o
      where o.bucket_id = 'community-media' and o.name = p_path
    );
$$;

revoke execute on function public.community_media_uploaded(uuid, text) from public, anon;
grant execute on function public.community_media_uploaded(uuid, text) to authenticated;

drop policy "Group members and mentors send messages" on public.community_messages;
create policy "Group members and mentors send messages"
  on public.community_messages
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and is_hidden = false
    and (public.is_group_member(group_id) or public.is_group_mentor(group_id))
    and exists (select 1 from public.support_groups g where g.id = community_messages.group_id and g.is_active)
    and (attachment_path is null or public.community_media_uploaded(group_id, attachment_path))
  );

-- Where a group message's file is, for the server to stream it. Members and
-- the mentor while the message is not hidden; admins always (moderation).
create or replace function public.community_media_path(p_message_id uuid)
returns table (attachment_path text, attachment_type text, attachment_name text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_group uuid;
  v_hidden boolean;
begin
  if (select auth.uid()) is null then
    raise exception 'Please sign in' using errcode = 'PT401';
  end if;

  select m.group_id, m.is_hidden into v_group, v_hidden
  from public.community_messages as m
  where m.id = p_message_id and m.attachment_path is not null;

  if v_group is null then
    raise exception 'Not found' using errcode = 'PT404';
  end if;

  if not (
    coalesce(public.is_admin(), false)
    or (
      not v_hidden
      and (coalesce(public.is_group_member(v_group), false) or coalesce(public.is_group_mentor(v_group), false))
    )
  ) then
    raise exception 'Not found' using errcode = 'PT404';
  end if;

  return query
    select m.attachment_path, m.attachment_type, m.attachment_name
    from public.community_messages as m
    where m.id = p_message_id;
end;
$$;

revoke execute on function public.community_media_path(uuid) from public, anon;
grant execute on function public.community_media_path(uuid) to authenticated;

-- Same rules as before (20261017000500), plus the kind and file details
-- (never the storage path), and now the newest 100 messages, oldest first.
drop function public.read_community_messages(uuid);

create function public.read_community_messages(p_group_id uuid)
returns table (
  id uuid,
  content text,
  created_at timestamptz,
  display_name text,
  is_own boolean,
  is_mentor boolean,
  is_removed boolean,
  kind text,
  attachment_name text,
  attachment_type text,
  attachment_size integer,
  duration_seconds integer
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
          case when m.author_id = (select auth.uid()) then 'Anonymous (You)' else 'Anonymous' end
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

revoke execute on function public.read_community_messages(uuid) from public, anon;
grant execute on function public.read_community_messages(uuid) to authenticated;

-- The admin chat view keeps its shape; a photo, file or voice message reads
-- as a short label so the safety team sees that something was sent.
-- (Opening the file itself in the admin page is a follow up.)
create or replace function public.admin_read_community_messages(p_group_id uuid, p_reason text default null)
returns table (id uuid, content text, created_at timestamptz, display_name text, is_mentor boolean, is_hidden boolean)
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
        when p.role = 'user' and p.hide_identity then 'Anonymous'
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

-- my_group_chats() (20261019000100) plus the newest message's kind, so the
-- Messages list can say "Photo", "PDF" or "Voice message".
drop function public.my_group_chats();

create function public.my_group_chats()
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
  last_kind text,
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

revoke execute on function public.my_group_chats() from public, anon;
grant execute on function public.my_group_chats() to authenticated;

notify pgrst, 'reload schema';

commit;

-- AROM: chat between a clinic desk and a student (BACKEND-HANDOFF.md section 35).
--
-- Decided by Rith (24 Oct 2026):
--   * One chat per student per clinic. The student sees it as the clinic
--     ("UP Wellness Clinic"), never the desk person's name. Every desk
--     account of that clinic shares the same chats.
--   * It exists once the student has sent a booking request to the clinic.
--     Either side can write first after that.
--   * Text, voice messages, photos and PDF files, like the therapist chat.
--   * It closes 30 days after the student's last request or clinic session
--     (a waiting request keeps it open). Messages are kept, read only.
--   * Students stay anonymous to the desk (profiles.hide_identity, the same
--     rule as section 34). The desk never sees therapist chats and the
--     therapist never sees desk chats. Admins have no access.
--   * No notifications yet.
--
--   1. clinic_conversations, created for every student with a request
--   2. clinic_messages
--   3. Rules: is the chat open, may the caller open a message's file
--   4. Student functions
--   5. Desk functions
--
-- Files: the app server uploads voice and attachments to the existing private
-- buckets under `clinic/<conversation id>/` with the server key, only after
-- the functions below allow it, and streams them back after the same check.

-- 1. Conversations -----------------------------------------------------------

create table public.clinic_conversations (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (clinic_id, user_id)
);

create index clinic_conversations_user_idx on public.clinic_conversations (user_id);

-- No policies: only the functions below read or change chats.
alter table public.clinic_conversations enable row level security;

-- Every request opens (or keeps) the student's chat with that clinic.
create or replace function public.ensure_clinic_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.clinic_conversations (clinic_id, user_id)
  values (new.clinic_id, new.user_id)
  on conflict (clinic_id, user_id) do nothing;
  return new;
end;
$$;

create trigger clinic_booking_requests_ensure_conversation
  after insert on public.clinic_booking_requests
  for each row execute function public.ensure_clinic_conversation();

-- Requests sent before this migration.
insert into public.clinic_conversations (clinic_id, user_id)
select distinct clinic_id, user_id from public.clinic_booking_requests
on conflict (clinic_id, user_id) do nothing;

-- 2. Messages ------------------------------------------------------------------

create table public.clinic_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.clinic_conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  -- True when a desk account wrote it. The student never learns which one.
  from_clinic boolean not null,
  kind text not null check (kind in ('text', 'voice', 'image', 'file')),
  body text check (char_length(body) <= 2000),
  audio_path text,
  duration_seconds smallint check (duration_seconds between 1 and 120),
  attachment_path text,
  attachment_name text check (char_length(attachment_name) <= 120),
  attachment_type text,
  attachment_size integer check (attachment_size between 1 and 5242880),
  created_at timestamptz not null default now(),
  -- When the other side read it.
  read_at timestamptz,
  check (
    (kind = 'text' and char_length(trim(coalesce(body, ''))) > 0)
    or (kind = 'voice' and audio_path is not null and duration_seconds is not null)
    or (kind in ('image', 'file') and attachment_path is not null and attachment_name is not null)
  )
);

create index clinic_messages_conversation_idx on public.clinic_messages (conversation_id, created_at desc);

alter table public.clinic_messages enable row level security;

create trigger clinic_messages_block_suspended
  before insert on public.clinic_messages
  for each row execute function public.block_suspended_account();

-- 3. Rules ------------------------------------------------------------------------

-- Open while the student has a waiting request, or a request or clinic
-- session in the last 30 days (an upcoming session counts until 30 days
-- after it).
create or replace function public.clinic_chat_open(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.clinic_conversations c
    where c.id = p_conversation_id
      and (
        exists (
          select 1 from public.clinic_booking_requests r
          where r.clinic_id = c.clinic_id
            and r.user_id = c.user_id
            and (r.status = 'waiting' or r.created_at > now() - interval '30 days')
        )
        or exists (
          select 1 from public.appointments a
          where a.clinic_id = c.clinic_id
            and a.user_id = c.user_id
            and a.ends_at > now() - interval '30 days'
        )
      )
  );
$$;

revoke execute on function public.clinic_chat_open(uuid) from public, anon, authenticated;

-- The caller's side in a chat: 'client' (the student), 'clinic' (a desk
-- account of that clinic) or null.
create or replace function public.clinic_chat_side(p_conversation_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when c.user_id = (select auth.uid()) then 'client'
    when public.is_clinic_staff(c.clinic_id) then 'clinic'
  end
  from public.clinic_conversations c
  where c.id = p_conversation_id;
$$;

revoke execute on function public.clinic_chat_side(uuid) from public, anon, authenticated;

-- May the caller open this message's voice or file? (Used by the app server
-- before it streams the file.)
create or replace function public.can_open_clinic_message(p_message_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.clinic_messages m
    where m.id = p_message_id
      and public.clinic_chat_side(m.conversation_id) is not null
  );
$$;

revoke execute on function public.can_open_clinic_message(uuid) from public, anon;
grant execute on function public.can_open_clinic_message(uuid) to authenticated;

-- Shared by both sides: write one message after the checks.
create or replace function public.write_clinic_message(
  p_conversation_id uuid,
  p_from_clinic boolean,
  p_kind text,
  p_body text,
  p_audio_path text,
  p_duration_seconds integer,
  p_attachment_path text,
  p_attachment_name text,
  p_attachment_type text,
  p_attachment_size integer
)
returns public.clinic_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.clinic_messages;
  v_body text := nullif(trim(p_body), '');
begin
  if not public.clinic_chat_open(p_conversation_id) then
    raise exception 'This chat is closed.' using errcode = 'PT409';
  end if;
  if p_kind not in ('text', 'voice', 'image', 'file') then
    raise exception 'Unknown message kind.' using errcode = '22023';
  end if;
  if p_kind = 'text' and (v_body is null or char_length(v_body) > 2000) then
    raise exception 'Write a message of up to 2000 characters.' using errcode = '22023';
  end if;
  -- Files live under this chat's own folder only.
  if p_kind = 'voice' and (p_audio_path is null or p_audio_path not like 'clinic/' || p_conversation_id::text || '/%') then
    raise exception 'Voice message not found.' using errcode = '22023';
  end if;
  if p_kind in ('image', 'file')
     and (p_attachment_path is null or p_attachment_path not like 'clinic/' || p_conversation_id::text || '/%') then
    raise exception 'File not found.' using errcode = '22023';
  end if;

  insert into public.clinic_messages (
    conversation_id, sender_id, from_clinic, kind, body, audio_path, duration_seconds,
    attachment_path, attachment_name, attachment_type, attachment_size
  )
  values (
    p_conversation_id,
    (select auth.uid()),
    p_from_clinic,
    p_kind,
    case when p_kind = 'text' then v_body end,
    case when p_kind = 'voice' then p_audio_path end,
    case when p_kind = 'voice' then p_duration_seconds end,
    case when p_kind in ('image', 'file') then p_attachment_path end,
    case when p_kind in ('image', 'file') then p_attachment_name end,
    case when p_kind in ('image', 'file') then p_attachment_type end,
    case when p_kind in ('image', 'file') then p_attachment_size end
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.write_clinic_message(uuid, boolean, text, text, text, integer, text, text, text, integer)
  from public, anon, authenticated;

-- 4. Student functions ---------------------------------------------------------------

-- The student's clinic chats, newest first.
create or replace function public.my_clinic_chats()
returns table (
  clinic_slug text,
  clinic_name text,
  clinic_name_km text,
  can_write boolean,
  last_kind text,
  last_from_clinic boolean,
  last_body text,
  last_at timestamptz,
  unread integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    cl.slug,
    cl.name,
    cl.name_km,
    public.clinic_chat_open(c.id),
    lm.kind,
    lm.from_clinic,
    lm.body,
    lm.created_at,
    (
      select count(*)::integer from public.clinic_messages m
      where m.conversation_id = c.id and m.from_clinic and m.read_at is null
    )
  from public.clinic_conversations c
  join public.clinics cl on cl.id = c.clinic_id
  left join lateral (
    select m.kind, m.from_clinic, m.body, m.created_at
    from public.clinic_messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) lm on true
  where c.user_id = (select auth.uid())
  order by coalesce(lm.created_at, c.created_at) desc;
$$;

revoke execute on function public.my_clinic_chats() from public, anon;
grant execute on function public.my_clinic_chats() to authenticated;

-- The student's own conversation with a clinic, or null.
create or replace function public.my_clinic_conversation(p_slug text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id
  from public.clinic_conversations c
  join public.clinics cl on cl.id = c.clinic_id
  where cl.slug = p_slug and c.user_id = (select auth.uid());
$$;

revoke execute on function public.my_clinic_conversation(text) from public, anon, authenticated;

create or replace function public.read_my_clinic_chat(p_slug text, p_limit integer default 300)
returns table (
  id uuid,
  from_clinic boolean,
  kind text,
  body text,
  duration_seconds smallint,
  attachment_name text,
  attachment_type text,
  attachment_size integer,
  created_at timestamptz,
  read_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_conversation uuid := public.my_clinic_conversation(p_slug);
begin
  if v_conversation is null then
    raise exception 'Chat not found.' using errcode = 'PT404';
  end if;
  return query
    select m.id, m.from_clinic, m.kind, m.body, m.duration_seconds,
           m.attachment_name, m.attachment_type, m.attachment_size, m.created_at, m.read_at
    from public.clinic_messages m
    where m.conversation_id = v_conversation
    order by m.created_at desc
    limit least(greatest(coalesce(p_limit, 300), 1), 500);
end;
$$;

revoke execute on function public.read_my_clinic_chat(text, integer) from public, anon;
grant execute on function public.read_my_clinic_chat(text, integer) to authenticated;

-- Checks the student may write now and returns the chat id (the app server
-- uses it as the folder for a voice message or file).
create or replace function public.open_my_clinic_chat(p_slug text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_conversation uuid := public.my_clinic_conversation(p_slug);
begin
  if v_conversation is null then
    raise exception 'Chat not found.' using errcode = 'PT404';
  end if;
  if not public.clinic_chat_open(v_conversation) then
    raise exception 'This chat is closed.' using errcode = 'PT409';
  end if;
  return v_conversation;
end;
$$;

revoke execute on function public.open_my_clinic_chat(text) from public, anon;
grant execute on function public.open_my_clinic_chat(text) to authenticated;

create or replace function public.send_my_clinic_message(
  p_slug text,
  p_kind text,
  p_body text default null,
  p_audio_path text default null,
  p_duration_seconds integer default null,
  p_attachment_path text default null,
  p_attachment_name text default null,
  p_attachment_type text default null,
  p_attachment_size integer default null
)
returns table (
  id uuid,
  from_clinic boolean,
  kind text,
  body text,
  duration_seconds smallint,
  attachment_name text,
  attachment_type text,
  attachment_size integer,
  created_at timestamptz,
  read_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation uuid := public.my_clinic_conversation(p_slug);
  v_row public.clinic_messages;
begin
  if v_conversation is null then
    raise exception 'Chat not found.' using errcode = 'PT404';
  end if;
  v_row := public.write_clinic_message(
    v_conversation, false, p_kind, p_body, p_audio_path, p_duration_seconds,
    p_attachment_path, p_attachment_name, p_attachment_type, p_attachment_size
  );
  return query select v_row.id, v_row.from_clinic, v_row.kind, v_row.body, v_row.duration_seconds,
    v_row.attachment_name, v_row.attachment_type, v_row.attachment_size, v_row.created_at, v_row.read_at;
end;
$$;

revoke execute on function public.send_my_clinic_message(text, text, text, text, integer, text, text, text, integer)
  from public, anon;
grant execute on function public.send_my_clinic_message(text, text, text, text, integer, text, text, text, integer)
  to authenticated;

create or replace function public.mark_my_clinic_chat_read(p_slug text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation uuid := public.my_clinic_conversation(p_slug);
  v_count integer;
begin
  if v_conversation is null then
    return 0;
  end if;
  update public.clinic_messages
  set read_at = now()
  where conversation_id = v_conversation and from_clinic and read_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.mark_my_clinic_chat_read(text) from public, anon;
grant execute on function public.mark_my_clinic_chat_read(text) to authenticated;

-- 5. Desk functions --------------------------------------------------------------------

-- Every student chat of the clinic, newest activity first. Students show by
-- their desk name (usually "Anonymous") and a short code.
create or replace function public.clinic_desk_chats(p_slug text)
returns table (
  conversation_id uuid,
  reference text,
  client_name text,
  can_write boolean,
  request_ids uuid[],
  last_kind text,
  last_from_clinic boolean,
  last_body text,
  last_at timestamptz,
  unread integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_clinic public.clinics := public.desk_clinic(p_slug);
begin
  return query
    select
      c.id,
      upper(substr(replace(c.id::text, '-', ''), 1, 6)),
      public.desk_client_name(c.user_id),
      public.clinic_chat_open(c.id),
      coalesce((
        select array_agg(r.id order by r.created_at desc)
        from public.clinic_booking_requests r
        where r.clinic_id = c.clinic_id and r.user_id = c.user_id
      ), '{}'::uuid[]),
      lm.kind,
      lm.from_clinic,
      lm.body,
      lm.created_at,
      (
        select count(*)::integer from public.clinic_messages m
        where m.conversation_id = c.id and not m.from_clinic and m.read_at is null
      )
    from public.clinic_conversations c
    left join lateral (
      select m.kind, m.from_clinic, m.body, m.created_at
      from public.clinic_messages m
      where m.conversation_id = c.id
      order by m.created_at desc
      limit 1
    ) lm on true
    where c.clinic_id = v_clinic.id
    order by coalesce(lm.created_at, c.created_at) desc
    limit 500;
end;
$$;

revoke execute on function public.clinic_desk_chats(text) from public, anon;
grant execute on function public.clinic_desk_chats(text) to authenticated;

-- The chat, if the caller works at its clinic's desk.
create or replace function public.desk_conversation(p_conversation_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.clinic_chat_side(p_conversation_id) is distinct from 'clinic' then
    raise exception 'Chat not found.' using errcode = 'PT404';
  end if;
  return p_conversation_id;
end;
$$;

revoke execute on function public.desk_conversation(uuid) from public, anon, authenticated;

create or replace function public.read_clinic_desk_chat(p_conversation_id uuid, p_limit integer default 300)
returns table (
  id uuid,
  from_clinic boolean,
  kind text,
  body text,
  duration_seconds smallint,
  attachment_name text,
  attachment_type text,
  attachment_size integer,
  created_at timestamptz,
  read_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_conversation uuid := public.desk_conversation(p_conversation_id);
begin
  return query
    select m.id, m.from_clinic, m.kind, m.body, m.duration_seconds,
           m.attachment_name, m.attachment_type, m.attachment_size, m.created_at, m.read_at
    from public.clinic_messages m
    where m.conversation_id = v_conversation
    order by m.created_at desc
    limit least(greatest(coalesce(p_limit, 300), 1), 500);
end;
$$;

revoke execute on function public.read_clinic_desk_chat(uuid, integer) from public, anon;
grant execute on function public.read_clinic_desk_chat(uuid, integer) to authenticated;

create or replace function public.open_clinic_desk_chat(p_conversation_id uuid)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_conversation uuid := public.desk_conversation(p_conversation_id);
begin
  if not public.clinic_chat_open(v_conversation) then
    raise exception 'This chat is closed.' using errcode = 'PT409';
  end if;
  return v_conversation;
end;
$$;

revoke execute on function public.open_clinic_desk_chat(uuid) from public, anon;
grant execute on function public.open_clinic_desk_chat(uuid) to authenticated;

create or replace function public.send_clinic_desk_message(
  p_conversation_id uuid,
  p_kind text,
  p_body text default null,
  p_audio_path text default null,
  p_duration_seconds integer default null,
  p_attachment_path text default null,
  p_attachment_name text default null,
  p_attachment_type text default null,
  p_attachment_size integer default null
)
returns table (
  id uuid,
  from_clinic boolean,
  kind text,
  body text,
  duration_seconds smallint,
  attachment_name text,
  attachment_type text,
  attachment_size integer,
  created_at timestamptz,
  read_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation uuid := public.desk_conversation(p_conversation_id);
  v_row public.clinic_messages;
begin
  v_row := public.write_clinic_message(
    v_conversation, true, p_kind, p_body, p_audio_path, p_duration_seconds,
    p_attachment_path, p_attachment_name, p_attachment_type, p_attachment_size
  );
  return query select v_row.id, v_row.from_clinic, v_row.kind, v_row.body, v_row.duration_seconds,
    v_row.attachment_name, v_row.attachment_type, v_row.attachment_size, v_row.created_at, v_row.read_at;
end;
$$;

revoke execute on function public.send_clinic_desk_message(uuid, text, text, text, integer, text, text, text, integer)
  from public, anon;
grant execute on function public.send_clinic_desk_message(uuid, text, text, text, integer, text, text, text, integer)
  to authenticated;

create or replace function public.mark_clinic_desk_chat_read(p_conversation_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation uuid := public.desk_conversation(p_conversation_id);
  v_count integer;
begin
  update public.clinic_messages
  set read_at = now()
  where conversation_id = v_conversation and not from_clinic and read_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.mark_clinic_desk_chat_read(uuid) from public, anon;
grant execute on function public.mark_clinic_desk_chat_read(uuid) to authenticated;

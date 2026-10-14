-- AROM: private messages between a client and a professional
-- (BACKEND-HANDOFF.md section 17).
--
--   1. professional_profiles.reply_time: the reply time clients see.
--   2. conversations and messages. Only the two people in a conversation can
--      read it. There is no admin read policy (only community group chats are
--      admin readable, AGENTS.md section 9). Nothing is written directly:
--      every change goes through the security definer functions below.
--   3. Voice messages in the private "message-voice" bucket at
--      <conversation_id>/<sender_id>/<uuid>.<ext>, served with short lived
--      signed URLs.
--   4. Archiving a client closes the conversation (read only for both sides).
--
-- Writing needs a booked or completed appointment between the two people.
-- Message text and audio are never logged.

-- ===========================================================================
-- 1. Reply time
-- ===========================================================================
alter table public.professional_profiles
  add column reply_time text not null default 'one_day'
    check (reply_time in ('few_hours', 'one_day', 'two_days'));

-- ===========================================================================
-- 2. Tables
-- ===========================================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Set when the professional archives the client. Messages are kept.
  closed_at timestamptz,
  unique (professional_id, client_id),
  check (professional_id <> client_id)
);

create index conversations_client_idx on public.conversations (client_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('text', 'voice')),
  body text check (char_length(body) between 1 and 2000),
  audio_path text unique,
  duration_seconds smallint check (duration_seconds between 1 and 120),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (
    (kind = 'text' and body is not null and audio_path is null and duration_seconds is null)
    or (kind = 'voice' and body is null and audio_path is not null and duration_seconds is not null)
  )
);

create index messages_conversation_idx on public.messages (conversation_id, created_at desc);
create index messages_unread_idx on public.messages (conversation_id) where read_at is null;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create trigger conversations_block_suspended
  before insert on public.conversations
  for each row execute function public.block_suspended_account();

create trigger messages_block_suspended
  before insert on public.messages
  for each row execute function public.block_suspended_account();

-- ===========================================================================
-- 3. Rules
-- ===========================================================================

-- True when the caller is one of the two people in the conversation.
create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = p_conversation_id
      and (select auth.uid()) in (c.professional_id, c.client_id)
  );
$$;

revoke execute on function public.is_conversation_member(uuid) from public, anon;
grant execute on function public.is_conversation_member(uuid) to authenticated;

create policy "Members read their conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) in (professional_id, client_id));

create policy "Members read their messages"
  on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));

-- No insert, update or delete policies: see the functions below.

-- Writing is allowed only while the client has a booked or completed
-- appointment with the professional, and the professional's account is active.
create or replace function public.can_message(p_professional_id uuid, p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.appointments a
    where a.professional_id = p_professional_id
      and a.user_id = p_client_id
      and a.status in ('booked', 'completed')
  )
  and exists (
    select 1 from public.profiles p
    where p.id = p_professional_id and p.account_status = 'active'
  );
$$;

revoke execute on function public.can_message(uuid, uuid) from public, anon, authenticated;

-- Finds or creates the caller's conversation with the other person and
-- returns its id. p_as says which side the caller is on.
-- Errors: PT403 not allowed to write, PT409 the conversation is closed.
create or replace function public.open_conversation(p_other uuid, p_as text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_professional uuid;
  v_client uuid;
  v_id uuid;
  v_closed timestamptz;
begin
  if v_me is null then
    raise exception 'Please log in to continue.' using errcode = 'PT401';
  end if;

  if p_as = 'client' then
    v_professional := p_other;
    v_client := v_me;
  elsif p_as = 'professional' then
    v_professional := v_me;
    v_client := p_other;
  else
    raise exception 'Unknown side.' using errcode = '22023';
  end if;

  if not public.can_message(v_professional, v_client) then
    raise exception 'Messages are open only after a booked session.' using errcode = 'PT403';
  end if;

  insert into public.conversations (professional_id, client_id)
  values (v_professional, v_client)
  on conflict (professional_id, client_id) do nothing;

  select c.id, c.closed_at into v_id, v_closed
  from public.conversations c
  where c.professional_id = v_professional and c.client_id = v_client;

  if v_closed is not null then
    raise exception 'This conversation is closed.' using errcode = 'PT409';
  end if;

  return v_id;
end;
$$;

revoke execute on function public.open_conversation(uuid, text) from public, anon;
grant execute on function public.open_conversation(uuid, text) to authenticated;

-- Sends one message. Voice files must already be uploaded to the caller's
-- own folder of this conversation.
create or replace function public.send_message(
  p_other uuid,
  p_as text,
  p_kind text,
  p_body text default null,
  p_audio_path text default null,
  p_duration_seconds integer default null
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

  if p_kind = 'text' then
    if p_body is null or char_length(btrim(p_body)) = 0 or char_length(p_body) > 2000 then
      raise exception 'A message is 1 to 2000 characters.' using errcode = '22023';
    end if;
    insert into public.messages (conversation_id, sender_id, kind, body)
    values (v_conversation, v_me, 'text', p_body)
    returning * into v_row;
  elsif p_kind = 'voice' then
    if p_duration_seconds is null or p_duration_seconds not between 1 and 120 then
      raise exception 'A voice message is 1 to 120 seconds.' using errcode = '22023';
    end if;
    if p_audio_path is null
      or p_audio_path !~ ('^' || v_conversation::text || '/' || v_me::text || '/[0-9a-f-]{36}\.(webm|ogg|m4a)$')
      or not exists (
        select 1 from storage.objects o
        where o.bucket_id = 'message-voice' and o.name = p_audio_path
      )
    then
      raise exception 'The voice message was not uploaded.' using errcode = '22023';
    end if;
    insert into public.messages (conversation_id, sender_id, kind, audio_path, duration_seconds)
    values (v_conversation, v_me, 'voice', p_audio_path, p_duration_seconds)
    returning * into v_row;
  else
    raise exception 'Unknown message kind.' using errcode = '22023';
  end if;

  return v_row;
end;
$$;

revoke execute on function public.send_message(uuid, text, text, text, text, integer) from public, anon;
grant execute on function public.send_message(uuid, text, text, text, text, integer) to authenticated;

-- Marks the other person's messages as read. Returns how many changed.
create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if not public.is_conversation_member(p_conversation_id) then
    raise exception 'Conversation not found.' using errcode = 'PT404';
  end if;

  update public.messages m
  set read_at = now()
  where m.conversation_id = p_conversation_id
    and m.sender_id <> (select auth.uid())
    and m.read_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute on function public.mark_conversation_read(uuid) from public, anon;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- The professional archives a client (closes the conversation) or brings
-- them back. Works for anyone who ever booked with the professional.
create or replace function public.set_client_archived(p_client_id uuid, p_archived boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null or not exists (
    select 1 from public.appointments a
    where a.professional_id = v_me and a.user_id = p_client_id
  ) then
    raise exception 'Client not found.' using errcode = 'PT404';
  end if;

  insert into public.conversations (professional_id, client_id, closed_at)
  values (v_me, p_client_id, case when p_archived then now() end)
  on conflict (professional_id, client_id)
  do update set closed_at = case
    when p_archived then coalesce(public.conversations.closed_at, now())
  end;
end;
$$;

revoke execute on function public.set_client_archived(uuid, boolean) from public, anon;
grant execute on function public.set_client_archived(uuid, boolean) to authenticated;

-- The caller's conversation list for one side: everyone they have booked
-- with (or been booked by) plus any existing conversation, with the last
-- message and the unread count. Names and photos are only returned for the
-- professional side of the row, which the client already sees when booking.
create or replace function public.my_conversations(p_as text)
returns table (
  conversation_id uuid,
  professional_id uuid,
  slug text,
  display_name text,
  display_name_km text,
  photo_url text,
  reply_time text,
  client_id uuid,
  closed boolean,
  can_write boolean,
  last_kind text,
  last_mine boolean,
  last_body text,
  last_at timestamptz,
  unread integer
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (select (select auth.uid()) as id),
  pairs as (
    select a.professional_id, a.user_id as client_id
    from public.appointments a, me
    where (p_as = 'client' and a.user_id = me.id and a.status in ('booked', 'completed'))
       or (p_as = 'professional' and a.professional_id = me.id)
    union
    select c.professional_id, c.client_id
    from public.conversations c, me
    where (p_as = 'client' and c.client_id = me.id)
       or (p_as = 'professional' and c.professional_id = me.id)
  )
  select
    c.id,
    pp.id,
    pp.slug,
    pp.display_name,
    pp.display_name_km,
    pp.photo_url,
    pp.reply_time,
    pairs.client_id,
    c.closed_at is not null,
    c.closed_at is null and public.can_message(pairs.professional_id, pairs.client_id),
    last.kind,
    last.sender_id = (select id from me),
    last.body,
    last.created_at,
    coalesce((
      select count(*)::integer from public.messages m
      where m.conversation_id = c.id
        and m.read_at is null
        and m.sender_id <> (select id from me)
    ), 0)
  from pairs
  join public.professional_profiles pp on pp.id = pairs.professional_id
  left join public.conversations c
    on c.professional_id = pairs.professional_id and c.client_id = pairs.client_id
  left join lateral (
    select m.kind, m.sender_id, m.body, m.created_at
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) last on true
  where p_as in ('client', 'professional');
$$;

revoke execute on function public.my_conversations(text) from public, anon;
grant execute on function public.my_conversations(text) to authenticated;

-- ===========================================================================
-- 4. Voice files: private bucket, only the two members can read.
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('message-voice', 'message-voice', false, 5242880, array['audio/webm', 'audio/ogg', 'audio/mp4'])
on conflict (id) do nothing;

-- The conversation id of a voice file path, or null when the path is not
-- <conversation_id>/<sender_id>/<file>.
create or replace function public.voice_conversation_id(p_name text)
returns uuid
language sql
immutable
set search_path = ''
as $$
  select case
    when p_name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f-]{36}/[^/]+$'
    then split_part(p_name, '/', 1)::uuid
  end;
$$;

-- Upload only into the caller's own folder of an open conversation they can write in.
create or replace function public.can_upload_voice(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select split_part(p_name, '/', 2) = (select auth.uid())::text
    and exists (
      select 1 from public.conversations c
      where c.id = public.voice_conversation_id(p_name)
        and (select auth.uid()) in (c.professional_id, c.client_id)
        and c.closed_at is null
        and public.can_message(c.professional_id, c.client_id)
    );
$$;

revoke execute on function public.can_upload_voice(text) from public, anon;
grant execute on function public.can_upload_voice(text) to authenticated;

create policy "Conversation members read voice messages"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'message-voice'
    and public.is_conversation_member(public.voice_conversation_id(name))
  );

create policy "Conversation members upload voice messages"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'message-voice'
    and public.can_upload_voice(name)
  );

-- Only an upload that never became a message can be removed (a failed send).
create policy "Senders remove unsent voice files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'message-voice'
    and split_part(name, '/', 2) = (select auth.uid())::text
    and not exists (select 1 from public.messages m where m.audio_path = name)
  );

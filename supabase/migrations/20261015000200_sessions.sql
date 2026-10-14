-- AROM: suggested sessions, repeating series and quick replies
-- (BACKEND-HANDOFF.md section 19).
--
--   1. appointments.series_id: shared by every session of a repeating series.
--   2. Open times never overlap a booked session. A series can reach past the
--      booking window, so its later sessions have no open time yet. When the
--      window rolls forward, the trigger here marks the new open time as
--      taken, and cancelling or moving a session frees it again.
--   3. session_suggestions: a professional offers 1 to 3 times (optionally a
--      repeating series) in the chat. The client accepts one, and every
--      session of the series is booked in one transaction, or none is.
--   4. messages.kind 'suggestion' with messages.suggestion_id.
--   5. quick_replies: a professional's saved replies, private to them.
--
-- Run after 20261014000700_messages.sql.

-- ===========================================================================
-- 1. Series
-- ===========================================================================
alter table public.appointments add column series_id uuid;

create index appointments_series_idx on public.appointments (series_id) where series_id is not null;

-- Replaces the version from file 20261014000400: also locks series_id.
create or replace function public.guard_appointment_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.status is distinct from old.status
       and (old.status <> 'booked' or new.status not in ('completed', 'no_show')) then
      raise exception 'Use cancel_appointment to cancel a booking';
    end if;
    -- Completed or no show only after the session has ended.
    if new.status is distinct from old.status and old.ends_at > now() then
      raise exception 'You can record the outcome after the session ends';
    end if;
    new.user_id := old.user_id;
    new.professional_id := old.professional_id;
    new.slot_id := old.slot_id;
    new.clinic_id := old.clinic_id;
    new.session_type := old.session_type;
    new.starts_at := old.starts_at;
    new.ends_at := old.ends_at;
    new.intake_note := old.intake_note;
    new.cancelled_at := old.cancelled_at;
    new.cancelled_by := old.cancelled_by;
    new.cancel_reason := old.cancel_reason;
    new.share_survey := old.share_survey;
    new.share_symptom_checks := old.share_symptom_checks;
    new.shared_at := old.shared_at;
    new.rescheduled_from := old.rescheduled_from;
    new.reschedule_reason := old.reschedule_reason;
    new.series_id := old.series_id;
  end if;
  return new;
end;
$$;

-- ===========================================================================
-- 2. Open times never overlap a booked session
-- ===========================================================================

-- True when the professional has a booked session overlapping the time.
create or replace function public.professional_busy(p_professional_id uuid, p_starts_at timestamptz, p_ends_at timestamptz)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.appointments a
    where a.professional_id = p_professional_id
      and a.status = 'booked'
      and a.starts_at < p_ends_at
      and p_starts_at < a.ends_at
  );
$$;

revoke execute on function public.professional_busy(uuid, timestamptz, timestamptz) from public, anon, authenticated;

-- A new or changed open time is taken if it overlaps a booked session.
create or replace function public.mark_busy_slot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not new.is_booked and public.professional_busy(new.professional_id, new.starts_at, new.ends_at) then
    new.is_booked := true;
  end if;
  return new;
end;
$$;

revoke execute on function public.mark_busy_slot() from public, anon, authenticated;

create trigger availability_slots_mark_busy
  before insert or update on public.availability_slots
  for each row execute function public.mark_busy_slot();

-- After a session is booked, cancelled or moved, the open times around its
-- old and new time match the booked sessions again.
create or replace function public.refresh_slots_for_appointment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.availability_slots s
  set is_booked = public.professional_busy(s.professional_id, s.starts_at, s.ends_at)
  where s.professional_id = new.professional_id
    and (
      (s.starts_at < new.ends_at and new.starts_at < s.ends_at)
      or (tg_op = 'UPDATE' and s.starts_at < old.ends_at and old.starts_at < s.ends_at)
    );
  return null;
end;
$$;

revoke execute on function public.refresh_slots_for_appointment() from public, anon, authenticated;

create trigger appointments_refresh_slots
  after insert or update of status, starts_at, ends_at on public.appointments
  for each row execute function public.refresh_slots_for_appointment();

-- ===========================================================================
-- 3. Suggestions
-- ===========================================================================
create table public.session_suggestions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  session_type public.session_type not null,
  duration_minutes smallint not null check (duration_minutes between 15 and 180),
  times timestamptz[] not null check (cardinality(times) between 1 and 3),
  every_weeks smallint not null default 1 check (every_weeks in (1, 2)),
  session_count smallint not null default 1 check (session_count between 1 and 8),
  note text not null default '' check (char_length(note) <= 300),
  meeting_url text,
  status text not null default 'open' check (status in ('open', 'booked', 'withdrawn')),
  chosen_time timestamptz,
  booking_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (professional_id <> client_id),
  check ((status = 'booked') = (chosen_time is not null))
);

create index session_suggestions_pair_idx on public.session_suggestions (professional_id, client_id);
create index session_suggestions_client_idx on public.session_suggestions (client_id);

create trigger session_suggestions_set_updated_at
  before update on public.session_suggestions
  for each row execute function public.set_updated_at();

create trigger session_suggestions_block_suspended
  before insert on public.session_suggestions
  for each row execute function public.block_suspended_account();

alter table public.session_suggestions enable row level security;

-- Only the client and the professional. No admin read, no direct writes.
create policy "Client and professional read suggestions"
  on public.session_suggestions for select to authenticated
  using ((select auth.uid()) in (client_id, professional_id));

-- ===========================================================================
-- 4. Suggestion messages
-- ===========================================================================
alter table public.messages drop constraint messages_kind_check;
alter table public.messages drop constraint messages_check;
alter table public.messages
  add column suggestion_id uuid references public.session_suggestions (id) on delete cascade;
alter table public.messages
  add constraint messages_kind_check check (kind in ('text', 'voice', 'suggestion')),
  add constraint messages_content_check check (
    (kind = 'text' and body is not null and audio_path is null and duration_seconds is null and suggestion_id is null)
    or (kind = 'voice' and body is null and audio_path is not null and duration_seconds is not null and suggestion_id is null)
    or (kind = 'suggestion' and body is null and audio_path is null and duration_seconds is null and suggestion_id is not null)
  );

-- The professional offers times. Each start must be in the future; the API
-- checks them against the professional's schedule first. The suggestion is
-- sent as a chat message, so the conversation must be open.
create or replace function public.suggest_session(
  p_client_id uuid,
  p_session_type public.session_type,
  p_duration_minutes integer,
  p_times timestamptz[],
  p_every_weeks integer,
  p_session_count integer,
  p_note text
)
returns public.session_suggestions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_conversation uuid;
  v_room text;
  v_types public.session_type[];
  v_row public.session_suggestions;
begin
  -- Checks the booked or completed session and that the chat is not closed.
  v_conversation := public.open_conversation(p_client_id, 'professional');

  select pp.session_types into v_types from public.professional_profiles pp where pp.id = v_me;
  if not (p_session_type = any (coalesce(v_types, '{}'))) then
    raise exception 'You do not offer this session type.' using errcode = '22023';
  end if;

  if p_times is null
    or cardinality(p_times) not between 1 and 3
    or (select count(distinct t) from unnest(p_times) t) <> cardinality(p_times)
    or exists (select 1 from unnest(p_times) t where t <= now())
  then
    raise exception 'Choose 1 to 3 different times in the future.' using errcode = '22023';
  end if;

  select ps.meeting_url into v_room from public.professional_schedules ps where ps.professional_id = v_me;

  insert into public.session_suggestions (
    professional_id, client_id, session_type, duration_minutes, times, every_weeks, session_count, note, meeting_url
  )
  values (
    v_me, p_client_id, p_session_type, p_duration_minutes,
    (select array_agg(t order by t) from unnest(p_times) t),
    p_every_weeks, p_session_count, btrim(coalesce(p_note, '')),
    case when p_session_type = 'online' then nullif(v_room, '') end
  )
  returning * into v_row;

  insert into public.messages (conversation_id, sender_id, kind, suggestion_id)
  values (v_conversation, v_me, 'suggestion', v_row.id);

  return v_row;
exception
  when check_violation then
    raise exception 'Please check the suggestion details.' using errcode = '22023';
end;
$$;

revoke execute on function public.suggest_session(uuid, public.session_type, integer, timestamptz[], integer, integer, text) from public, anon;
grant execute on function public.suggest_session(uuid, public.session_type, integer, timestamptz[], integer, integer, text) to authenticated;

create or replace function public.withdraw_session_suggestion(p_suggestion_id uuid)
returns public.session_suggestions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.session_suggestions;
begin
  update public.session_suggestions s
  set status = 'withdrawn'
  where s.id = p_suggestion_id
    and s.professional_id = (select auth.uid())
    and s.status = 'open'
  returning * into v_row;
  if not found then
    raise exception 'This suggestion is no longer open.' using errcode = 'PT404';
  end if;
  return v_row;
end;
$$;

revoke execute on function public.withdraw_session_suggestion(uuid) from public, anon;
grant execute on function public.withdraw_session_suggestion(uuid) to authenticated;

-- The client books one of the suggested times, and with it every session of
-- the series. All or nothing. Errors: PT404 not open, PT409 a time is taken.
create or replace function public.accept_session_suggestion(p_suggestion_id uuid, p_time timestamptz)
returns public.session_suggestions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_row public.session_suggestions;
  v_start timestamptz;
  v_end timestamptz;
  v_slot public.availability_slots;
  v_id uuid;
  v_ids uuid[] := '{}';
begin
  select * into v_row
  from public.session_suggestions s
  where s.id = p_suggestion_id and s.client_id = v_me
  for update;

  if not found or v_row.status <> 'open' or not (p_time = any (v_row.times)) then
    raise exception 'This suggestion is no longer open.' using errcode = 'PT404';
  end if;

  -- The professional must still be active and the chat not closed.
  perform public.open_conversation(v_row.professional_id, 'client');

  for i in 0 .. v_row.session_count - 1 loop
    v_start := p_time + make_interval(days => i * v_row.every_weeks * 7);
    v_end := v_start + make_interval(mins => v_row.duration_minutes);

    if v_start <= now() then
      raise exception 'That time has passed.' using errcode = 'PT409';
    end if;

    if public.professional_busy(v_row.professional_id, v_start, v_end) or exists (
      select 1 from public.appointments a
      where a.user_id = v_me and a.status = 'booked' and a.starts_at < v_end and v_start < a.ends_at
    ) then
      raise exception 'That time was just taken.' using errcode = 'PT409';
    end if;

    select * into v_slot
    from public.availability_slots s
    where s.professional_id = v_row.professional_id and s.starts_at = v_start
    for update;
    if found and v_slot.is_booked then
      raise exception 'That time was just taken.' using errcode = 'PT409';
    end if;

    insert into public.appointments (
      user_id, professional_id, slot_id, session_type, starts_at, ends_at, meeting_url, series_id
    )
    values (
      v_me,
      v_row.professional_id,
      v_slot.id,
      v_row.session_type,
      v_start,
      v_end,
      case when v_row.session_type = 'online' then v_row.meeting_url end,
      case when v_row.session_count > 1 then v_row.id end
    )
    returning id into v_id;

    v_ids := v_ids || v_id;
    v_slot := null;
  end loop;

  update public.session_suggestions s
  set status = 'booked', chosen_time = p_time, booking_ids = v_ids
  where s.id = p_suggestion_id
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.accept_session_suggestion(uuid, timestamptz) from public, anon;
grant execute on function public.accept_session_suggestion(uuid, timestamptz) to authenticated;

-- my_conversations() now also returns suggestions as the last message.
-- (Its body is unchanged; last_kind can be 'suggestion'.)

-- ===========================================================================
-- 5. Quick replies
-- ===========================================================================
create table public.quick_replies (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  position smallint not null check (position between 0 and 19),
  created_at timestamptz not null default now(),
  unique (professional_id, position)
);

alter table public.quick_replies enable row level security;

create policy "Professionals read own quick replies"
  on public.quick_replies for select to authenticated
  using (professional_id = (select auth.uid()));

-- Replaces the caller's whole list (at most 20).
create or replace function public.save_quick_replies(p_bodies text[])
returns setof public.quick_replies
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null or not exists (select 1 from public.professional_profiles where id = v_me) then
    raise exception 'Only a professional has quick replies.' using errcode = 'PT403';
  end if;
  if coalesce(cardinality(p_bodies), 0) > 20 then
    raise exception 'You can save up to 20 quick replies.' using errcode = '22023';
  end if;

  delete from public.quick_replies where professional_id = v_me;

  insert into public.quick_replies (professional_id, body, position)
  select v_me, btrim(b.body), (b.ord - 1)::smallint
  from unnest(coalesce(p_bodies, '{}')) with ordinality as b(body, ord);

  return query select * from public.quick_replies where professional_id = v_me order by position;
exception
  when check_violation then
    raise exception 'A quick reply is 1 to 500 characters.' using errcode = '22023';
end;
$$;

revoke execute on function public.save_quick_replies(text[]) from public, anon;
grant execute on function public.save_quick_replies(text[]) to authenticated;

-- Limits on login attempts, and a cap on bookings. (Security audit 5 Nov 2026,
-- findings M8 and M5.)
--
-- rate_limits holds hashed keys and counts only, never emails or addresses.
-- Only the server can use it, through the secret key: if browsers could call it,
-- anyone could lock another person out.
--
-- book_appointment is the live definition with only the two checks added. Sessions
-- a professional proposes (series) do not count towards the 5 upcoming sessions,
-- because they are agreed between the two people.

begin;

create table public.rate_limits (
  key text primary key check (char_length(key) <= 64),
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0
);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from public, anon, authenticated;

-- Counts one attempt. True while the key is within its limit.
create or replace function public.rate_limit_hit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempts integer;
begin
  insert into public.rate_limits as r (key, window_started_at, attempts)
  values (p_key, now(), 1)
  on conflict (key) do update
  set attempts = case
        when r.window_started_at < now() - make_interval(secs => p_window_seconds) then 1
        else r.attempts + 1
      end,
      window_started_at = case
        when r.window_started_at < now() - make_interval(secs => p_window_seconds) then now()
        else r.window_started_at
      end
  returning attempts into v_attempts;

  -- Old keys are not needed. A few go each time, so the table stays small.
  delete from public.rate_limits
  where key in (
    select old.key from public.rate_limits as old
    where old.window_started_at < now() - interval '1 day'
    limit 100
  );

  return v_attempts <= p_max;
end;
$$;

-- A successful login clears that account's count.
create or replace function public.rate_limit_clear(p_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.rate_limits where key = p_key;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.rate_limit_clear(text) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
grant execute on function public.rate_limit_clear(text) to service_role;

CREATE OR REPLACE FUNCTION public.book_appointment(p_slot_id uuid, p_session_type session_type, p_intake_note text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user uuid := (select auth.uid());
  v_slot public.availability_slots%rowtype;
  v_notice smallint;
  v_room text;
  v_appointment_id uuid;
begin
  if v_user is null then
    raise exception 'Please sign in to book an appointment';
  end if;

  -- One account cannot fill the professionals' calendars.
  if (
    select count(*) from public.appointments a
    where a.user_id = v_user
      and a.status = 'booked'
      and a.ends_at > now()
      and a.series_id is null
  ) >= 5 then
    raise exception 'You already have 5 upcoming sessions. Please attend or cancel one before booking another';
  end if;
  -- Booking and cancelling over and over would block times too.
  if (
    select count(*) from public.appointments a
    where a.user_id = v_user
      and a.series_id is null
      and a.created_at > now() - interval '1 day'
  ) >= 10 then
    raise exception 'You have made many bookings today. Please try again tomorrow';
  end if;

  select * into v_slot
  from public.availability_slots
  where id = p_slot_id
  for update;

  if not found or v_slot.is_booked then
    raise exception 'This time is no longer available';
  end if;
  if v_slot.professional_id = v_user then
    raise exception 'You cannot book your own schedule';
  end if;
  if not public.is_listed_professional(v_slot.professional_id) then
    raise exception 'This professional is not available for booking';
  end if;
  if not (p_session_type = any (v_slot.session_types)) then
    raise exception 'This session type is not offered at this time';
  end if;

  select min_notice_hours, meeting_url into v_notice, v_room
  from public.professional_schedules
  where professional_id = v_slot.professional_id;

  if v_slot.starts_at <= now() + make_interval(hours => coalesce(v_notice, 24)) then
    raise exception 'This time is too soon to book. Please choose a later time';
  end if;

  insert into public.appointments (
    user_id, professional_id, slot_id, session_type, starts_at, ends_at, intake_note, meeting_url
  )
  values (
    v_user,
    v_slot.professional_id,
    v_slot.id,
    p_session_type,
    v_slot.starts_at,
    v_slot.ends_at,
    nullif(trim(p_intake_note), ''),
    case when p_session_type = 'online' then v_room end
  )
  returning id into v_appointment_id;

  update public.availability_slots set is_booked = true where id = v_slot.id;

  return v_appointment_id;
end;
$function$;

commit;

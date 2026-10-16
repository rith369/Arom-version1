-- AROM: a client changes the time of their own session
-- (BACKEND-HANDOFF.md section 23).
--
--   1. appointments.rescheduled_by: who last moved the session, so the client
--      sees "You moved this session" or "Your professional moved this
--      session", and the professional sees "The client moved this session".
--   2. client_reschedule_appointment(): the client moves their own upcoming
--      session to another open time with the same professional and the same
--      session type, in one transaction. The same checks as booking apply:
--      the time is still open, the professional is listed, and the minimum
--      notice. The session itself can only be moved while it is still more
--      than the professional's minimum notice away (cancelling stays open
--      until it starts). The appointments_refresh_slots trigger (file
--      20261015000200_sessions.sql) frees the old open time and takes the
--      new one.
--      my_change_time_deadlines() tells the client until when each of their
--      own upcoming sessions can be moved, without exposing the schedule.
--   3. reschedule_appointment() (the professional's version) also records
--      rescheduled_by. Otherwise the same as file 20261014000400.
--   4. guard_appointment_update() also locks rescheduled_by. Otherwise the
--      same as file 20261015000200.
--
-- Run after 20261015000200_sessions.sql.
--
-- Numbered 20261015001500 to leave 20261015000800 to 20261015001400 free in
-- case the clashing 20261015000100 to 0700 community files are renumbered.

-- ===========================================================================
-- 1. Who moved the session
-- ===========================================================================
alter table public.appointments
  add column rescheduled_by uuid references public.profiles (id) on delete set null;

-- ===========================================================================
-- 2. The client moves their own session
-- ===========================================================================
create or replace function public.client_reschedule_appointment(
  p_appointment_id uuid,
  p_slot_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_appointment public.appointments%rowtype;
  v_slot public.availability_slots%rowtype;
  v_notice smallint;
  v_reason text := nullif(trim(p_reason), '');
begin
  if v_me is null then
    raise exception 'Please sign in to change your session';
  end if;
  if char_length(v_reason) > 300 then
    raise exception 'Write a reason of up to 300 characters';
  end if;

  -- Only the client's own session.
  select * into v_appointment
  from public.appointments
  where id = p_appointment_id and user_id = v_me
  for update;

  if not found then
    raise exception 'Appointment not found';
  end if;
  if v_appointment.status <> 'booked' or v_appointment.starts_at <= now() then
    raise exception 'Only upcoming sessions can be moved';
  end if;

  select min_notice_hours into v_notice
  from public.professional_schedules
  where professional_id = v_appointment.professional_id;

  -- Not inside the professional's minimum notice: they may have prepared.
  if v_appointment.starts_at <= now() + make_interval(hours => coalesce(v_notice, 24)) then
    raise exception 'It is too close to your session to change the time. You can still cancel it, or message your professional';
  end if;

  -- Only an open time of the same professional.
  select * into v_slot
  from public.availability_slots
  where id = p_slot_id and professional_id = v_appointment.professional_id
  for update;

  if not found or v_slot.is_booked then
    raise exception 'This time is no longer available';
  end if;
  if not public.is_listed_professional(v_slot.professional_id) then
    raise exception 'This professional is not available for booking';
  end if;
  if not (v_appointment.session_type = any (v_slot.session_types)) then
    raise exception 'This time does not offer your session type';
  end if;
  if v_slot.starts_at <= now() + make_interval(hours => coalesce(v_notice, 24)) then
    raise exception 'This time is too soon to book. Please choose a later time';
  end if;

  -- The meeting link stays the same.
  update public.appointments
  set slot_id = v_slot.id,
      starts_at = v_slot.starts_at,
      ends_at = v_slot.ends_at,
      rescheduled_from = coalesce(v_appointment.rescheduled_from, v_appointment.starts_at),
      reschedule_reason = v_reason,
      rescheduled_by = v_me
  where id = p_appointment_id;
end;
$$;

revoke execute on function public.client_reschedule_appointment(uuid, uuid, text) from public, anon;
grant execute on function public.client_reschedule_appointment(uuid, uuid, text) to authenticated;

-- Until when the caller can move each of their own upcoming sessions. Only
-- the deadline leaves the function, never the professional's schedule.
create or replace function public.my_change_time_deadlines()
returns table (appointment_id uuid, change_until timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select a.id, a.starts_at - make_interval(hours => coalesce(ps.min_notice_hours, 24))
  from public.appointments a
  left join public.professional_schedules ps on ps.professional_id = a.professional_id
  where a.user_id = (select auth.uid())
    and a.status = 'booked'
    and a.starts_at > now();
$$;

revoke execute on function public.my_change_time_deadlines() from public, anon;
grant execute on function public.my_change_time_deadlines() to authenticated;

-- ===========================================================================
-- 3. The professional's version also records who moved it
-- ===========================================================================
create or replace function public.reschedule_appointment(
  p_appointment_id uuid,
  p_slot_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_appointment public.appointments%rowtype;
  v_slot public.availability_slots%rowtype;
  v_reason text := nullif(trim(p_reason), '');
begin
  if v_reason is null or char_length(v_reason) > 300 then
    raise exception 'Write a reason of up to 300 characters. The client will see it';
  end if;

  select * into v_appointment
  from public.appointments
  where id = p_appointment_id and professional_id = v_me
  for update;

  if not found then
    raise exception 'Appointment not found';
  end if;
  if v_appointment.status <> 'booked' or v_appointment.starts_at <= now() then
    raise exception 'Only upcoming sessions can be moved';
  end if;

  select * into v_slot
  from public.availability_slots
  where id = p_slot_id and professional_id = v_me
  for update;

  if not found or v_slot.is_booked or v_slot.starts_at <= now() then
    raise exception 'That time is no longer open';
  end if;
  if not (v_appointment.session_type = any (v_slot.session_types)) then
    raise exception 'That time does not offer this session type';
  end if;

  update public.appointments
  set slot_id = v_slot.id,
      starts_at = v_slot.starts_at,
      ends_at = v_slot.ends_at,
      rescheduled_from = coalesce(v_appointment.rescheduled_from, v_appointment.starts_at),
      reschedule_reason = v_reason,
      rescheduled_by = v_me
  where id = p_appointment_id;

  update public.availability_slots set is_booked = true where id = v_slot.id;
  if v_appointment.slot_id is not null then
    update public.availability_slots set is_booked = false where id = v_appointment.slot_id;
  end if;
end;
$$;

revoke execute on function public.reschedule_appointment(uuid, uuid, text) from public, anon;
grant execute on function public.reschedule_appointment(uuid, uuid, text) to authenticated;

-- ===========================================================================
-- 4. Direct updates cannot change who moved it
-- ===========================================================================
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
    new.rescheduled_by := old.rescheduled_by;
    new.series_id := old.series_id;
  end if;
  return new;
end;
$$;

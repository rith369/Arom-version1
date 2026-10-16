-- AROM: the backend for issue #13 (BACKEND-HANDOFF.md section 22).
--
--   1. activity_log: each finished practice and lesson, one row per item per
--      Cambodia day. Owner reads; written only through log_activity().
--   2. journal_entries: the day defaults to Cambodia time. The app now saves
--      the journal here (owner only RLS from 20261008000200), not in the
--      browser.
--   3. appointments.share_mood_trend: the client may share their mood check
--      ins with that professional. Off by default, set only through
--      set_appointment_sharing(), locked against direct updates.
--      shared_mood_checkins() gives the professional (day, mood) for the last
--      30 days, only while the switch is on. Moods only, never the journal.
--      No admin read.
--
-- A suspended account can still write its own journal and log practices:
-- suspension stops harm to others, and these are private to the person.
--
-- Needs 20261015001500_client_reschedule.sql first (guard_appointment_update
-- keeps its rescheduled_by line). Never log journal text or moods.

-- ===========================================================================
-- 1. Finished practices and lessons
-- ===========================================================================
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('practice', 'lesson')),
  ref_id text not null check (char_length(ref_id) between 1 and 100),
  done_on date not null default public.cambodia_today(),
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref_id, done_on)
);

create index activity_log_user_day_idx on public.activity_log (user_id, done_on desc);

alter table public.activity_log enable row level security;
revoke all on public.activity_log from anon, authenticated;
grant select on public.activity_log to authenticated;

create policy "Owner reads own activity"
  on public.activity_log for select to authenticated
  using (user_id = (select auth.uid()));

-- The API checks that ref_id is a real practice or lesson (they live in code).
create or replace function public.log_activity(p_kind text, p_ref_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Please log in to continue.' using errcode = 'PT403';
  end if;
  if p_kind is null or p_kind not in ('practice', 'lesson') then
    raise exception 'Unknown activity.' using errcode = '22023';
  end if;

  insert into public.activity_log (user_id, kind, ref_id)
  values (v_user, p_kind, p_ref_id)
  on conflict (user_id, kind, ref_id, done_on) do nothing;
end;
$$;

revoke execute on function public.log_activity(text, text) from public, anon;
grant execute on function public.log_activity(text, text) to authenticated;

-- ===========================================================================
-- 2. Journal day in Cambodia time
-- ===========================================================================
alter table public.journal_entries
  alter column entry_date set default public.cambodia_today();

-- ===========================================================================
-- 3. Share mood check ins with a professional
-- ===========================================================================
alter table public.appointments
  add column share_mood_trend boolean not null default false;

drop function public.set_appointment_sharing(uuid, boolean, boolean);

create function public.set_appointment_sharing(
  p_appointment_id uuid,
  p_share_survey boolean,
  p_share_symptom_checks boolean,
  p_share_mood_trend boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.appointments
  set share_survey = p_share_survey,
      share_symptom_checks = p_share_symptom_checks,
      share_mood_trend = p_share_mood_trend,
      shared_at = case when p_share_survey or p_share_symptom_checks or p_share_mood_trend then now() end
  where id = p_appointment_id
    and user_id = (select auth.uid());

  if not found then
    raise exception 'Appointment not found';
  end if;
end;
$$;

revoke execute on function public.set_appointment_sharing(uuid, boolean, boolean, boolean) from public, anon;
grant execute on function public.set_appointment_sharing(uuid, boolean, boolean, boolean) to authenticated;

-- Same as 20261015001500, plus share_mood_trend.
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
    new.share_mood_trend := old.share_mood_trend;
    new.shared_at := old.shared_at;
    new.rescheduled_from := old.rescheduled_from;
    new.reschedule_reason := old.reschedule_reason;
    new.rescheduled_by := old.rescheduled_by;
    new.series_id := old.series_id;
  end if;
  return new;
end;
$$;

-- The professional reads a client's moods only while that client shares
-- them on a booked or completed session with them. Turning it off stops it
-- at once, because nothing is copied.
create or replace function public.shared_mood_checkins(p_client_id uuid)
returns table (day date, mood public.mood_level)
language sql
stable
security definer
set search_path = ''
as $$
  select m.checked_in_on, m.mood
  from public.mood_checkins m
  where m.user_id = p_client_id
    and m.checked_in_on > public.cambodia_today() - 30
    and exists (
      select 1 from public.appointments a
      where a.user_id = p_client_id
        and a.professional_id = (select auth.uid())
        and a.status in ('booked', 'completed')
        and a.share_mood_trend
    )
  order by m.checked_in_on;
$$;

revoke execute on function public.shared_mood_checkins(uuid) from public, anon;
grant execute on function public.shared_mood_checkins(uuid) to authenticated;

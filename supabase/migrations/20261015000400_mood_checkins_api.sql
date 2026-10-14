-- AROM: daily mood check in from Home, and the Progress week
-- (BACKEND-HANDOFF.md section 22).
--
--   1. One mood per person per day. The day is Cambodia time, not UTC, so a
--      06:00 check in in Phnom Penh counts for that day.
--   2. save_mood_checkin(): the only write path the app uses. Tapping
--      another mood the same day replaces the first one.
--
-- RLS on mood_checkins (owner only, migration 20261008000200) stays as it
-- is. No admin read. Moods are never logged.

-- Same definition as in 20261015000100_care_plans.sql, repeated so this file
-- also runs on its own. Either file may run first.
create or replace function public.cambodia_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Asia/Phnom_Penh')::date;
$$;

-- ===========================================================================
-- 1. One row per person per day
-- ===========================================================================
alter table public.mood_checkins
  alter column checked_in_on set default public.cambodia_today();

-- Keep the latest row of each day before adding the unique index.
delete from public.mood_checkins m
using public.mood_checkins newer
where newer.user_id = m.user_id
  and newer.checked_in_on = m.checked_in_on
  and (newer.created_at, newer.id) > (m.created_at, m.id);

create unique index mood_checkins_one_per_day
  on public.mood_checkins (user_id, checked_in_on);

-- ===========================================================================
-- 2. Save today's mood
-- ===========================================================================
create or replace function public.save_mood_checkin(p_mood public.mood_level, p_source text)
returns date
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_today date := public.cambodia_today();
begin
  if v_user is null then
    raise exception 'Please log in to continue.' using errcode = 'PT403';
  end if;

  if p_source is null or p_source not in ('home', 'journal', 'plan') then
    raise exception 'Unknown source.' using errcode = '22023';
  end if;

  insert into public.mood_checkins (user_id, mood, source, checked_in_on)
  values (v_user, p_mood, p_source, v_today)
  on conflict (user_id, checked_in_on) do update
    set mood = excluded.mood,
        source = excluded.source,
        created_at = now();

  return v_today;
end;
$$;

revoke execute on function public.save_mood_checkin(public.mood_level, text) from public, anon;
grant execute on function public.save_mood_checkin(public.mood_level, text) to authenticated;

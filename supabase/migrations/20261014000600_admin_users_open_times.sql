-- AROM: admin Users page and nightly open times.
-- See BACKEND-HANDOFF.md section 5 (users) and section 16 (schedule).
--
--   1. set_user_role(): admins can make admins and promote professionals
--      they know (with license details), with the guards decided in
--      section 5. Replaces the 2 argument version from file 9.
--   2. admin_list_users(): the Users list with email and activity counts.
--      Counts only, never journal, mood, detection or session content.
--   3. refresh_all_open_times(): fills every professional's booking window
--      each night, so open times do not depend on them opening /pro.

-- ===========================================================================
-- 1. Roles
-- ===========================================================================
drop function if exists public.set_user_role(uuid, public.user_role);

create or replace function public.set_user_role(
  p_user_id uuid,
  p_role public.user_role,
  p_title text default null,
  p_license_number text default null,
  p_issuing_body text default null,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_current public.user_role;
  v_name text;
  v_base text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change roles';
  end if;
  if p_user_id = v_me then
    raise exception 'You cannot change your own role';
  end if;

  select role, full_name into v_current, v_name
  from public.profiles where id = p_user_id
  for update;

  if v_current is null then
    raise exception 'Account not found';
  end if;
  if v_current = p_role then
    return;
  end if;

  -- Never remove the last active admin.
  if v_current = 'admin' and not exists (
    select 1 from public.profiles
    where role = 'admin' and account_status = 'active' and id <> p_user_id
  ) then
    raise exception 'AROM needs at least one admin. Make someone else an admin first';
  end if;

  if p_role = 'professional' and not exists (
    select 1 from public.professional_profiles where id = p_user_id and not is_test
  ) then
    -- Promoted directly by an admin: the same result as an approved application.
    if coalesce(trim(p_title), '') = '' or coalesce(trim(p_license_number), '') = ''
       or coalesce(trim(p_issuing_body), '') = '' then
      raise exception 'Add their title, license number and issuing body';
    end if;

    v_base := trim(both '-' from regexp_replace(lower(coalesce(v_name, '')), '[^a-z0-9]+', '-', 'g'));
    if v_base = '' then
      v_base := 'therapist';
    end if;

    -- An admin's test profile is replaced by a real one.
    delete from public.professional_profiles where id = p_user_id and is_test;

    insert into public.professional_profiles (
      id, slug, display_name, title, verification_status, verified_at
    )
    values (
      p_user_id,
      v_base || '-' || substr(md5(p_user_id::text), 1, 6),
      coalesce(nullif(trim(v_name), ''), 'Professional'),
      trim(p_title),
      'verified',
      now()
    );

    insert into public.professional_credentials (
      professional_id, license_number, issuing_body, reviewed_by, reviewed_at, review_note
    )
    values (p_user_id, trim(p_license_number), trim(p_issuing_body), v_me, now(), nullif(trim(p_note), ''));
  end if;

  update public.profiles set role = p_role where id = p_user_id;

  -- A professional profile is listed only while the role is professional.
  update public.professional_profiles
  set verification_status = (case when p_role = 'professional' then 'verified' else 'rejected' end)::public.verification_status,
      verified_at = case when p_role = 'professional' then now() else verified_at end
  where id = p_user_id and not is_test;

  -- profiles_audit already logs the role change. A direct promotion also
  -- records that an admin promoted them, and the admin's note.
  if p_role = 'professional' and p_license_number is not null then
    insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
    values (
      v_me,
      'promote_professional',
      'profiles',
      p_user_id,
      jsonb_build_object('license_number', trim(p_license_number), 'note', nullif(trim(p_note), ''))
    );
  end if;
end;
$$;

revoke execute on function public.set_user_role(uuid, public.user_role, text, text, text, text) from public, anon;
grant execute on function public.set_user_role(uuid, public.user_role, text, text, text, text) to authenticated;

-- ===========================================================================
-- 2. Users list for admins. Email comes from auth.users, so this runs as a
-- security definer function that only admins may call.
-- ===========================================================================
create or replace function public.admin_list_users()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.user_role,
  account_status public.account_status,
  language public.app_language,
  created_at timestamptz,
  last_seen_at timestamptz,
  days_active_30 integer,
  check_in_count integer,
  booking_count integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can list accounts';
  end if;

  return query
  select
    p.id,
    p.full_name,
    u.email::text,
    p.role,
    p.account_status,
    p.language,
    p.created_at,
    u.last_sign_in_at,
    (
      select count(distinct day)::integer from (
        select m.checked_in_on as day from public.mood_checkins m
        where m.user_id = p.id and m.checked_in_on > current_date - 30
        union
        select j.entry_date from public.journal_entries j
        where j.user_id = p.id and j.entry_date > current_date - 30
        union
        select s.created_at::date from public.symptom_checks s
        where s.user_id = p.id and s.created_at > now() - interval '30 days'
      ) days
    ),
    (select count(*)::integer from public.mood_checkins m where m.user_id = p.id),
    (select count(*)::integer from public.appointments a where a.user_id = p.id)
  from public.profiles p
  left join auth.users u on u.id = p.id
  order by p.created_at desc
  limit 2000;
end;
$$;

revoke execute on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- ===========================================================================
-- 3. Nightly open times. Mirrors openSlots() in app/pro/_data/schedule.ts:
-- each enabled range is cut into sessions plus breaks, for the booking
-- window, minus time off. Only adds missing times; saving the schedule in
-- /pro still replaces them exactly.
-- ===========================================================================
create or replace function public.refresh_all_open_times()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_today date := (now() at time zone 'Asia/Phnom_Penh')::date;
  v_session integer;
  v_break integer;
  v_days integer;
  v_day date;
  v_range jsonb;
  v_start integer;
  v_end integer;
  v_added integer := 0;
  v_count integer;
begin
  for v_row in
    select ps.professional_id, ps.schedule
    from public.professional_schedules ps
    join public.profiles p on p.id = ps.professional_id
    where p.account_status = 'active'
  loop
    v_session := coalesce((v_row.schedule ->> 'sessionMinutes')::integer, 60);
    v_break := coalesce((v_row.schedule ->> 'breakMinutes')::integer, 0);
    v_days := coalesce((v_row.schedule ->> 'bookingWindowWeeks')::integer, 4) * 7;
    if v_session < 15 then
      continue;
    end if;

    for i in 0 .. v_days - 1 loop
      v_day := v_today + i;

      -- Time off, inclusive.
      if exists (
        select 1 from jsonb_array_elements(coalesce(v_row.schedule -> 'timeOff', '[]'::jsonb)) off
        where (off ->> 'from')::date <= v_day
          and v_day <= coalesce(nullif(off ->> 'to', ''), off ->> 'from')::date
      ) then
        continue;
      end if;

      for v_range in
        select r
        from jsonb_array_elements(coalesce(v_row.schedule -> 'week', '[]'::jsonb)) d,
             jsonb_array_elements(coalesce(d -> 'ranges', '[]'::jsonb)) r
        where (d ->> 'day')::integer = extract(isodow from v_day)::integer
          and (d ->> 'enabled')::boolean
          and jsonb_array_length(coalesce(r -> 'sessionTypes', '[]'::jsonb)) > 0
      loop
        v_start := split_part(v_range ->> 'start', ':', 1)::integer * 60 + split_part(v_range ->> 'start', ':', 2)::integer;
        v_end := split_part(v_range ->> 'end', ':', 1)::integer * 60 + split_part(v_range ->> 'end', ':', 2)::integer;

        while v_start + v_session <= v_end loop
          insert into public.availability_slots (professional_id, session_types, starts_at, ends_at)
          select
            v_row.professional_id,
            array(select jsonb_array_elements_text(v_range -> 'sessionTypes'))::public.session_type[],
            (v_day + make_interval(mins => v_start)) at time zone 'Asia/Phnom_Penh',
            (v_day + make_interval(mins => v_start + v_session)) at time zone 'Asia/Phnom_Penh'
          where (v_day + make_interval(mins => v_start)) at time zone 'Asia/Phnom_Penh' > now()
          on conflict (professional_id, starts_at) do nothing;

          get diagnostics v_count = row_count;
          v_added := v_added + v_count;
          v_start := v_start + v_session + v_break;
        end loop;
      end loop;
    end loop;
  end loop;

  return v_added;
end;
$$;

-- Only the nightly job (and the database owner) runs this.
revoke execute on function public.refresh_all_open_times() from public, anon, authenticated;

-- Run every night at 00:05 Cambodia time (17:05 UTC). pg_cron is available
-- on Supabase; elsewhere this step is skipped.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('arom-refresh-open-times', '5 17 * * *', 'select public.refresh_all_open_times()');
  end if;
end;
$$;

-- AROM: admins can use the professional area with their own test profile.
-- A test profile works like any professional profile (profile, schedule,
-- open times, bookings), but only admins can find and book it, so real
-- users never see a test therapist. See BACKEND-HANDOFF.md section 16.

alter table public.professional_profiles
  add column is_test boolean not null default false;

-- Replaces the version from file 20261014000400: also locks is_test.
create or replace function public.guard_professional_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.verification_status := 'pending';
      new.verified_at := null;
      new.rating := null;
      new.review_count := 0;
      new.is_test := false;
    else
      new.verification_status := old.verification_status;
      new.verified_at := old.verified_at;
      new.rating := old.rating;
      new.review_count := old.review_count;
      new.slug := old.slug;
      new.display_name := old.display_name;
      new.display_name_km := old.display_name_km;
      new.title := old.title;
      new.title_km := old.title_km;
      new.is_test := old.is_test;
    end if;
  end if;
  return new;
end;
$$;

-- Creates the signed in admin's test profile if it does not exist yet.
create or replace function public.ensure_admin_test_profile()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if not public.is_admin() then
    raise exception 'Only an admin can have a test profile';
  end if;

  insert into public.professional_profiles (
    id, slug, display_name, title, verification_status, verified_at, is_test
  )
  select
    v_me,
    'arom-test-' || substr(md5(v_me::text), 1, 6),
    coalesce(nullif(trim(p.full_name), ''), 'AROM Admin'),
    'Test profile',
    'verified',
    now(),
    true
  from public.profiles p
  where p.id = v_me
  on conflict (id) do nothing;
end;
$$;

revoke execute on function public.ensure_admin_test_profile() from public, anon;
grant execute on function public.ensure_admin_test_profile() to authenticated;

-- Replaces the version from file 20261014000400: admins count as
-- professionals for their own test profile, and test profiles are listed
-- only when the person asking is an admin.
create or replace function public.is_listed_professional(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.professional_profiles pp
    join public.profiles p on p.id = pp.id
    where pp.id = p_id
      and (p.role = 'professional' or (p.role = 'admin' and pp.is_test))
      and (not pp.is_test or public.is_admin())
      and p.account_status = 'active'
      and pp.verification_status = 'verified'
      and coalesce(pp.photo_url, '') <> ''
      and char_length(trim(coalesce(pp.bio, ''))) >= 80
      and char_length(trim(coalesce(pp.bio_km, ''))) >= 40
      and cardinality(pp.specialties) > 0
      and cardinality(pp.languages) > 0
      and cardinality(pp.session_types) > 0
      and pp.price_kind is not null
      and exists (
        select 1 from public.availability_slots s
        where s.professional_id = pp.id and not s.is_booked and s.starts_at > now()
      )
  );
$$;

-- Replaces the version from file 20261014000400: admins may open times for their test profile.
create or replace function public.sync_availability_slots(p_slots jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_count integer;
begin
  if public.current_user_role() not in ('professional', 'admin')
     or not exists (select 1 from public.professional_profiles where id = v_me) then
    raise exception 'Only a professional can open times';
  end if;
  if jsonb_typeof(p_slots) <> 'array' or jsonb_array_length(p_slots) > 3000 then
    raise exception 'Too many open times';
  end if;

  if exists (
    select 1 from jsonb_array_elements(p_slots) as item
    where (item ->> 'endsAt')::timestamptz <= (item ->> 'startsAt')::timestamptz
       or jsonb_array_length(item -> 'sessionTypes') = 0
  ) then
    raise exception 'Each open time needs an end after its start and a session type';
  end if;

  delete from public.availability_slots s
  where s.professional_id = v_me
    and not s.is_booked
    and s.starts_at > now()
    and not exists (
      select 1 from jsonb_array_elements(p_slots) as item
      where (item ->> 'startsAt')::timestamptz = s.starts_at
    );

  insert into public.availability_slots (professional_id, session_types, starts_at, ends_at)
  select
    v_me,
    array(select jsonb_array_elements_text(item -> 'sessionTypes'))::public.session_type[],
    (item ->> 'startsAt')::timestamptz,
    (item ->> 'endsAt')::timestamptz
  from jsonb_array_elements(p_slots) as item
  where (item ->> 'startsAt')::timestamptz > now()
  on conflict (professional_id, starts_at) do update
    set ends_at = excluded.ends_at, session_types = excluded.session_types
    where not public.availability_slots.is_booked;

  select count(*) into v_count
  from public.availability_slots
  where professional_id = v_me and not is_booked and starts_at > now();

  return v_count;
end;
$$;

-- Admins manage their own schedule, profile changes and photo like a professional.
drop policy "Professionals manage own schedule" on public.professional_schedules;
create policy "Professionals manage own schedule"
  on public.professional_schedules for all to authenticated
  using (professional_id = (select auth.uid()))
  with check (
    professional_id = (select auth.uid())
    and public.current_user_role() in ('professional', 'admin')
  );

drop policy "Professionals request profile changes" on public.professional_profile_changes;
create policy "Professionals request profile changes"
  on public.professional_profile_changes for insert to authenticated
  with check (
    professional_id = (select auth.uid())
    and public.current_user_role() in ('professional', 'admin')
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

drop policy "Professionals upload own photo" on storage.objects;
create policy "Professionals upload own photo"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_role() in ('professional', 'admin')
  );

-- AROM: real professional profiles, public directory, schedules and booking.
-- See BACKEND-HANDOFF.md sections 6 and 16.
--
--   1. Profile: prices, reviewed fields locked, pending profile changes.
--   2. Photos: public "professional-photos" bucket.
--   3. Schedule: private weekly hours and meeting room per professional,
--      turned into availability_slots by sync_availability_slots().
--   4. Directory: only "listed" professionals are shown to users.
--   5. Booking: book, reschedule, client names for the professional.

-- ===========================================================================
-- 1. Profile
-- ===========================================================================
alter table public.professional_profiles
  add column price_kind text check (price_kind in ('free', 'fixed', 'range')),
  add column price_max_usd numeric(8, 2) check (price_max_usd >= 0);

alter table public.professional_profiles
  add constraint professional_profiles_price_check check (
    price_kind is null
    or price_kind = 'free'
    or (price_kind = 'fixed' and price_usd between 1 and 500)
    or (price_kind = 'range' and price_usd between 1 and 500
        and price_max_usd between 1 and 500 and price_usd < price_max_usd)
  ) not valid;

-- Replaces the version from file 3. Professionals cannot change their name,
-- title or slug directly: those go through professional_profile_changes and
-- an admin. Admins and database functions are not limited.
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
    end if;
  end if;
  return new;
end;
$$;

-- Changes to reviewed fields wait here until an admin approves them.
create table public.professional_profile_changes (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  field text not null check (field in (
    'displayName', 'kmDisplayName', 'title', 'kmTitle', 'licenseNumber', 'issuingBody'
  )),
  old_value text not null default '' check (char_length(old_value) <= 120),
  new_value text not null check (char_length(new_value) <= 120),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text check (char_length(review_note) <= 1000),
  created_at timestamptz not null default now()
);

create unique index professional_profile_changes_pending_uidx
  on public.professional_profile_changes (professional_id, field)
  where status = 'pending';

alter table public.professional_profile_changes enable row level security;

create policy "Professionals read own profile changes"
  on public.professional_profile_changes for select to authenticated
  using (professional_id = (select auth.uid()));

create policy "Professionals request profile changes"
  on public.professional_profile_changes for insert to authenticated
  with check (
    professional_id = (select auth.uid())
    and public.current_user_role() = 'professional'
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

create policy "Professionals withdraw pending changes"
  on public.professional_profile_changes for delete to authenticated
  using (professional_id = (select auth.uid()) and status = 'pending');

create policy "Admins read profile changes"
  on public.professional_profile_changes for select to authenticated
  using (public.is_admin());

-- Approves or declines every pending change of one professional at once.
create or replace function public.review_profile_changes(
  p_professional_id uuid,
  p_approve boolean,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_change public.professional_profile_changes%rowtype;
  v_credential uuid;
  v_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can review profile changes';
  end if;
  if not p_approve and coalesce(trim(p_note), '') = '' then
    raise exception 'Write a reason so the professional knows what to fix';
  end if;

  for v_change in
    select * from public.professional_profile_changes
    where professional_id = p_professional_id and status = 'pending'
    for update
  loop
    v_count := v_count + 1;

    if p_approve then
      if v_change.field in ('licenseNumber', 'issuingBody') then
        select id into v_credential
        from public.professional_credentials
        where professional_id = p_professional_id
        order by submitted_at desc
        limit 1;

        if v_credential is null then
          insert into public.professional_credentials (professional_id, license_number, issuing_body, reviewed_by, reviewed_at)
          values (
            p_professional_id,
            case when v_change.field = 'licenseNumber' then v_change.new_value else '' end,
            case when v_change.field = 'issuingBody' then v_change.new_value end,
            (select auth.uid()), now()
          )
          returning id into v_credential;
        elsif v_change.field = 'licenseNumber' then
          update public.professional_credentials set license_number = v_change.new_value where id = v_credential;
        else
          update public.professional_credentials set issuing_body = v_change.new_value where id = v_credential;
        end if;
      else
        update public.professional_profiles
        set display_name = case when v_change.field = 'displayName' then v_change.new_value else display_name end,
            display_name_km = case when v_change.field = 'kmDisplayName' then nullif(v_change.new_value, '') else display_name_km end,
            title = case when v_change.field = 'title' then v_change.new_value else title end,
            title_km = case when v_change.field = 'kmTitle' then nullif(v_change.new_value, '') else title_km end
        where id = p_professional_id;
      end if;
    end if;

    update public.professional_profile_changes
    set status = case when p_approve then 'approved' else 'rejected' end,
        reviewed_by = (select auth.uid()),
        reviewed_at = now(),
        review_note = p_note
    where id = v_change.id;
  end loop;

  if v_count = 0 then
    raise exception 'There are no changes waiting for review';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    (select auth.uid()),
    case when p_approve then 'approve_profile_changes' else 'reject_profile_changes' end,
    'professional_profiles',
    p_professional_id,
    jsonb_build_object('changes', v_count, 'note', p_note)
  );
end;
$$;

revoke execute on function public.review_profile_changes(uuid, boolean, text) from public, anon;
grant execute on function public.review_profile_changes(uuid, boolean, text) to authenticated;

-- ===========================================================================
-- 2. Photos: public bucket, each professional writes only their own folder.
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('professional-photos', 'professional-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Professionals upload own photo"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_role() = 'professional'
  );

create policy "Professionals delete own photo"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'professional-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ===========================================================================
-- 3. Schedule. Private: the meeting room link is only for booked clients.
-- ===========================================================================
create table public.professional_schedules (
  professional_id uuid primary key references public.professional_profiles (id) on delete cascade,
  -- the Schedule type from app/pro/_data/schedule.ts
  schedule jsonb not null,
  meeting_url text check (meeting_url ~ '^https://'),
  min_notice_hours smallint not null default 24 check (min_notice_hours between 0 and 168),
  updated_at timestamptz not null default now()
);

create trigger professional_schedules_set_updated_at
  before update on public.professional_schedules
  for each row execute function public.set_updated_at();

alter table public.professional_schedules enable row level security;

create policy "Professionals manage own schedule"
  on public.professional_schedules for all to authenticated
  using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()) and public.current_user_role() = 'professional');

-- In person sessions no longer need a clinic row: a professional may see
-- clients at their own practice. Drop that check from file 3.
do $$
declare
  v_name text;
begin
  for v_name in
    select conname from pg_constraint
    where conrelid = 'public.availability_slots'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%clinic_id%'
  loop
    execute format('alter table public.availability_slots drop constraint %I', v_name);
  end loop;
end;
$$;

-- Replaces the caller's future open times with the given list.
-- p_slots: [{ "startsAt": "...", "endsAt": "...", "sessionTypes": ["online"] }]
-- Booked times are never touched.
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
  if public.current_user_role() <> 'professional'
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

revoke execute on function public.sync_availability_slots(jsonb) from public, anon;
grant execute on function public.sync_availability_slots(jsonb) to authenticated;

-- ===========================================================================
-- 4. Directory. A professional is listed when they are verified, their
-- account is active and their profile is complete (photo, both bios, at
-- least one specialty, language and session type, a price choice, and at
-- least one open time).
-- ===========================================================================
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
      and p.role = 'professional'
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

grant execute on function public.is_listed_professional(uuid) to anon, authenticated;

-- Public fields only. Never credentials, contacts, schedule or meeting link.
create or replace function public.list_public_professionals(p_slug text default null)
returns table (
  slug text,
  display_name text,
  display_name_km text,
  title text,
  title_km text,
  bio text,
  bio_km text,
  photo_url text,
  specialties text[],
  languages text[],
  years_experience smallint,
  session_types public.session_type[],
  price_kind text,
  price_usd numeric,
  price_max_usd numeric,
  next_open_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    pp.slug, pp.display_name, pp.display_name_km, pp.title, pp.title_km,
    pp.bio, pp.bio_km, pp.photo_url, pp.specialties, pp.languages,
    pp.years_experience, pp.session_types, pp.price_kind, pp.price_usd, pp.price_max_usd,
    (
      select min(s.starts_at) from public.availability_slots s
      left join public.professional_schedules ps on ps.professional_id = s.professional_id
      where s.professional_id = pp.id and not s.is_booked
        and s.starts_at > now() + make_interval(hours => coalesce(ps.min_notice_hours, 24))
    )
  from public.professional_profiles pp
  where public.is_listed_professional(pp.id)
    and (p_slug is null or pp.slug = p_slug)
  order by pp.verified_at nulls last, pp.display_name;
$$;

grant execute on function public.list_public_professionals(text) to anon, authenticated;

-- Open times a user can book, after the professional's minimum notice.
create or replace function public.public_open_slots(p_slug text)
returns table (id uuid, starts_at timestamptz, ends_at timestamptz, session_types public.session_type[])
language sql
stable
security definer
set search_path = ''
as $$
  select s.id, s.starts_at, s.ends_at, s.session_types
  from public.professional_profiles pp
  join public.availability_slots s on s.professional_id = pp.id
  left join public.professional_schedules ps on ps.professional_id = pp.id
  where pp.slug = p_slug
    and public.is_listed_professional(pp.id)
    and not s.is_booked
    and s.starts_at > now() + make_interval(hours => coalesce(ps.min_notice_hours, 24))
  order by s.starts_at
  limit 500;
$$;

grant execute on function public.public_open_slots(text) to anon, authenticated;

-- ===========================================================================
-- 5. Booking
-- ===========================================================================
alter table public.appointments
  add column rescheduled_from timestamptz,
  add column reschedule_reason text check (char_length(reschedule_reason) <= 300);

-- Replaces the version from file 6: also protects the reschedule fields.
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
  end if;
  return new;
end;
$$;

-- Replaces the version from file 3: only listed professionals, the minimum
-- notice is respected, and online sessions get the professional's room link.
create or replace function public.book_appointment(
  p_slot_id uuid,
  p_session_type public.session_type,
  p_intake_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

-- The professional moves a booked session to another of their open times.
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
      reschedule_reason = v_reason
  where id = p_appointment_id;

  update public.availability_slots set is_booked = true where id = v_slot.id;
  if v_appointment.slot_id is not null then
    update public.availability_slots set is_booked = false where id = v_appointment.slot_id;
  end if;
end;
$$;

revoke execute on function public.reschedule_appointment(uuid, uuid, text) from public, anon;
grant execute on function public.reschedule_appointment(uuid, uuid, text) to authenticated;

-- Names of the caller's own clients. A professional never reads other
-- columns of their clients' accounts (no email, no phone).
create or replace function public.my_client_names()
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.full_name
  from public.profiles p
  where exists (
    select 1 from public.appointments a
    where a.user_id = p.id and a.professional_id = (select auth.uid())
  );
$$;

revoke execute on function public.my_client_names() from public, anon;
grant execute on function public.my_client_names() to authenticated;

-- One private note per session, so it can be saved again and again.
create unique index if not exists session_notes_appointment_uidx
  on public.session_notes (appointment_id);

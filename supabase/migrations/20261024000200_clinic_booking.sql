-- AROM: clinic bookings, starting with the UP Wellness Clinic
-- (BACKEND-HANDOFF.md section 34).
--
-- Decided by Rith with UP (24 Oct 2026):
--   * Students book the clinic, not a therapist. They pick online or in
--     person, a therapist preference (female, male or no preference), one
--     day and one or more of the clinic's times, and an optional note.
--   * A clinic desk account (a normal user account an admin marks as desk
--     staff, for example the UP receptionist) answers: it picks one of those
--     times and the therapist, or says the times do not work.
--   * Confirming creates a normal appointment with that therapist. Chat,
--     tasks, notes, sharing and Join then work as for any booking.
--   * One room: one booking per time. A confirmed booking makes that time
--     full. The desk can also mark a time full by hand (Google Form bookings).
--   * UP clinic: Thursday and Friday, 08:30, 09:30, 10:30, 13:30, 14:30 and
--     15:30 (one hour each), up to 3 weeks ahead, online and in person.
--   * Clinic therapists are normal professional accounts that an admin links
--     to a clinic. They are not listed on the Professional page and cannot be
--     booked directly. Their profile shows inside the clinic.
--   * A UP only clinic, its therapists and its times are for confirmed UP
--     accounts only (is_up_student(), migration 20261024000100).
--   * Students stay anonymous to the desk, by the same rule as for
--     professionals (profiles.hide_identity).
--
--   1. clinics: slug, UP only and booking settings, UP Wellness Clinic row
--   2. professional_clinics: one clinic per therapist, admin links only
--   3. clinic_staff: desk accounts
--   4. clinic_closed_times: times the desk marked full
--   5. clinic_booking_requests: the student's request and the answer
--   6. Read functions: clinic times, therapists, places of my bookings
--   7. Student functions: request, cancel a waiting request
--   8. Desk functions: requests, therapists, schedule, confirm, decline,
--      mark full or open, cancel or move a confirmed booking
--   9. Admin functions: link a therapist, make a desk account
--  10. Rules on existing objects: not listed, in person address, no
--      suggestions for clinic therapists

-- 1. Clinics ------------------------------------------------------------------

alter table public.clinics
  add column if not exists slug text,
  add column if not exists up_students_only boolean not null default false,
  -- ISO weekdays, 1 Monday to 7 Sunday.
  add column if not exists booking_days smallint[] not null default '{}',
  -- Start times in Cambodia time, 'HH:MM'.
  add column if not exists booking_times text[] not null default '{}',
  add column if not exists session_minutes smallint not null default 60,
  add column if not exists booking_weeks smallint not null default 3,
  add column if not exists min_notice_hours smallint not null default 12,
  add column if not exists session_types public.session_type[] not null default '{online,in_person}';

alter table public.clinics
  add constraint clinics_slug_key unique (slug),
  add constraint clinics_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add constraint clinics_booking_days_check check (booking_days <@ '{1,2,3,4,5,6,7}'::smallint[]),
  add constraint clinics_booking_times_check
    check (array_to_string(booking_times, ',') ~ '^([01][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9])?(,([01][0-9]:[0-5][0-9]|2[0-3]:[0-5][0-9]))*$'),
  add constraint clinics_session_minutes_check check (session_minutes between 15 and 240),
  add constraint clinics_booking_weeks_check check (booking_weeks between 1 and 12),
  add constraint clinics_min_notice_check check (min_notice_hours between 0 and 168),
  add constraint clinics_session_types_check check (cardinality(session_types) > 0);

-- SAMPLE address: replace with the real UP clinic address before launch.
insert into public.clinics (
  slug, name, name_km, kind, address, address_km, city, up_students_only,
  booking_days, booking_times, session_minutes, booking_weeks, session_types
)
values (
  'up-wellness-clinic',
  'UP Wellness Clinic',
  'គ្លីនិកសុខុមាលភាព UP',
  'clinic',
  'University of Puthisastra campus, Phnom Penh',
  'បរិវេណសាកលវិទ្យាល័យពុទ្ធិសាស្ត្រ រាជធានីភ្នំពេញ',
  'Phnom Penh',
  true,
  '{4,5}',
  '{08:30,09:30,10:30,13:30,14:30,15:30}',
  60,
  3,
  '{online,in_person}'
)
on conflict (slug) do nothing;

-- 2. Therapist links: one clinic each, set by admins only ----------------------

create unique index if not exists professional_clinics_one_clinic_idx
  on public.professional_clinics (professional_id);

drop policy if exists "Professionals link own clinics" on public.professional_clinics;
drop policy if exists "Professionals unlink own clinics" on public.professional_clinics;

-- 3. Desk accounts ---------------------------------------------------------------

create table public.clinic_staff (
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (clinic_id, user_id)
);

create index clinic_staff_user_idx on public.clinic_staff (user_id);

alter table public.clinic_staff enable row level security;

create policy "Desk staff read own membership"
  on public.clinic_staff for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create or replace function public.is_clinic_staff(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.clinic_staff s
    join public.profiles p on p.id = s.user_id
    where s.clinic_id = p_clinic_id
      and s.user_id = (select auth.uid())
      and p.account_status = 'active'
  );
$$;

revoke execute on function public.is_clinic_staff(uuid) from public, anon;
grant execute on function public.is_clinic_staff(uuid) to authenticated;

-- 4. Times the desk marked full ----------------------------------------------------

create table public.clinic_closed_times (
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  starts_at timestamptz not null,
  closed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (clinic_id, starts_at)
);

alter table public.clinic_closed_times enable row level security;

create policy "Desk staff read closed times"
  on public.clinic_closed_times for select to authenticated
  using (public.is_clinic_staff(clinic_id) or public.is_admin());

-- 5. Booking requests ------------------------------------------------------------------

create table public.clinic_booking_requests (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_type public.session_type not null,
  therapist_gender text not null default 'any'
    check (therapist_gender in ('female', 'male', 'any')),
  times timestamptz[] not null check (cardinality(times) between 1 and 12),
  note text check (char_length(note) <= 1000),
  status text not null default 'waiting'
    check (status in ('waiting', 'confirmed', 'declined', 'cancelled')),
  appointment_id uuid references public.appointments (id) on delete set null,
  answer_note text check (char_length(answer_note) <= 500),
  answered_by uuid references public.profiles (id) on delete set null,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clinic_booking_requests_clinic_idx
  on public.clinic_booking_requests (clinic_id, status, created_at desc);
create index clinic_booking_requests_user_idx
  on public.clinic_booking_requests (user_id, created_at desc);
-- One waiting request per student per clinic.
create unique index clinic_booking_requests_one_waiting_idx
  on public.clinic_booking_requests (clinic_id, user_id) where status = 'waiting';

create trigger clinic_booking_requests_set_updated_at
  before update on public.clinic_booking_requests
  for each row execute function public.set_updated_at();

create trigger clinic_booking_requests_block_suspended
  before insert on public.clinic_booking_requests
  for each row execute function public.block_suspended_account();

alter table public.clinic_booking_requests enable row level security;

-- Students read their own requests. Every change goes through the functions
-- below. Desk staff read requests through clinic_desk_requests(), which never
-- returns a hidden name. Admins get no access: requests are private.
create policy "Clients read own clinic requests"
  on public.clinic_booking_requests for select to authenticated
  using (user_id = (select auth.uid()));

-- 6. Read functions -------------------------------------------------------------------------

-- May the caller see this clinic (and so its therapists and times)?
create or replace function public.can_see_clinic(p_clinic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.clinics c
    where c.id = p_clinic_id
      and c.is_active
      and (
        not c.up_students_only
        or public.is_up_student()
        or public.is_admin()
        or public.is_clinic_staff(c.id)
        or exists (
          select 1 from public.professional_clinics pc
          where pc.clinic_id = c.id and pc.professional_id = (select auth.uid())
        )
      )
  );
$$;

revoke execute on function public.can_see_clinic(uuid) from public;
grant execute on function public.can_see_clinic(uuid) to anon, authenticated;

-- Every bookable time of a clinic from today until its booking window ends.
create or replace function public.clinic_time_grid(p_clinic_id uuid)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (d::date + t::time) at time zone 'Asia/Phnom_Penh',
    (d::date + t::time) at time zone 'Asia/Phnom_Penh' + make_interval(mins => c.session_minutes)
  from public.clinics c
  cross join lateral generate_series(
    (now() at time zone 'Asia/Phnom_Penh')::date::timestamp,
    ((now() at time zone 'Asia/Phnom_Penh')::date + c.booking_weeks * 7)::timestamp,
    interval '1 day'
  ) as d
  cross join lateral unnest(c.booking_times) as t
  where c.id = p_clinic_id
    and extract(isodow from d)::smallint = any (c.booking_days)
  order by 1;
$$;

revoke execute on function public.clinic_time_grid(uuid) from public, anon, authenticated;

-- Is this clinic time taken: marked full, or a booked session overlaps it?
create or replace function public.clinic_time_taken(
  p_clinic_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_except_appointment uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.clinic_closed_times ct
    where ct.clinic_id = p_clinic_id and ct.starts_at = p_starts_at
  )
  or exists (
    select 1 from public.appointments a
    where a.clinic_id = p_clinic_id
      and a.status = 'booked'
      and a.starts_at < p_ends_at
      and p_starts_at < a.ends_at
      and a.id is distinct from p_except_appointment
  );
$$;

revoke execute on function public.clinic_time_taken(uuid, timestamptz, timestamptz, uuid)
  from public, anon, authenticated;

-- For students: the clinic's upcoming times, with full ones marked.
create or replace function public.clinic_open_times(p_slug text)
returns table (starts_at timestamptz, ends_at timestamptz, is_full boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select g.starts_at, g.ends_at, public.clinic_time_taken(c.id, g.starts_at, g.ends_at)
  from public.clinics c
  cross join lateral public.clinic_time_grid(c.id) g
  where c.slug = p_slug
    and public.can_see_clinic(c.id)
    and g.starts_at > now() + make_interval(hours => c.min_notice_hours)
  order by g.starts_at;
$$;

revoke execute on function public.clinic_open_times(text) from public;
grant execute on function public.clinic_open_times(text) to anon, authenticated;

-- For students: the clinic's therapists, public profile fields only. Shown
-- once verified, active, with a photo and an about text.
create or replace function public.clinic_therapists(p_slug text)
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
  gender text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    pp.slug, pp.display_name, pp.display_name_km, pp.title, pp.title_km,
    pp.bio, pp.bio_km, pp.photo_url, pp.specialties, pp.languages,
    pp.years_experience::smallint, pp.gender
  from public.clinics c
  join public.professional_clinics pc on pc.clinic_id = c.id
  join public.professional_profiles pp on pp.id = pc.professional_id
  join public.profiles p on p.id = pp.id
  where c.slug = p_slug
    and public.can_see_clinic(c.id)
    and p.role = 'professional'
    and p.account_status = 'active'
    and pp.verification_status = 'verified'
    and not pp.is_test
    and coalesce(pp.photo_url, '') <> ''
    and char_length(trim(coalesce(pp.bio, ''))) >= 40
  order by pp.display_name;
$$;

revoke execute on function public.clinic_therapists(text) from public;
grant execute on function public.clinic_therapists(text) to anon, authenticated;

-- Which clinic a booking of mine belongs to, as the client or the therapist.
create or replace function public.my_clinic_appointment_places()
returns table (
  appointment_id uuid,
  clinic_slug text,
  clinic_name text,
  clinic_name_km text,
  address text,
  address_km text
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.id, c.slug, c.name, c.name_km, c.address, c.address_km
  from public.appointments a
  join public.clinics c on c.id = a.clinic_id
  where (select auth.uid()) in (a.user_id, a.professional_id);
$$;

revoke execute on function public.my_clinic_appointment_places() from public, anon;
grant execute on function public.my_clinic_appointment_places() to authenticated;

-- The clinic desks the caller works at.
create or replace function public.my_clinic_desks()
returns table (clinic_slug text, clinic_name text, clinic_name_km text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.slug, c.name, c.name_km
  from public.clinic_staff s
  join public.clinics c on c.id = s.clinic_id
  join public.profiles p on p.id = s.user_id
  where s.user_id = (select auth.uid()) and p.account_status = 'active' and c.is_active
  order by c.name;
$$;

revoke execute on function public.my_clinic_desks() from public, anon;
grant execute on function public.my_clinic_desks() to authenticated;

-- 7. Student functions --------------------------------------------------------------------

create or replace function public.request_clinic_booking(
  p_slug text,
  p_session_type public.session_type,
  p_therapist_gender text,
  p_times timestamptz[],
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_clinic public.clinics%rowtype;
  v_note text := nullif(trim(p_note), '');
  v_times timestamptz[];
  v_time timestamptz;
  v_id uuid;
begin
  if v_me is null then
    raise exception 'Please log in to continue.';
  end if;
  if not exists (select 1 from public.profiles where id = v_me and role = 'user') then
    raise exception 'Only AROM users can book a clinic session.';
  end if;

  select * into v_clinic from public.clinics where slug = p_slug;
  if not found or not public.can_see_clinic(v_clinic.id) then
    raise exception 'Clinic not found.';
  end if;
  if cardinality(v_clinic.booking_days) = 0 or cardinality(v_clinic.booking_times) = 0 then
    raise exception 'This clinic does not take bookings in AROM yet.';
  end if;
  if not (p_session_type = any (v_clinic.session_types)) then
    raise exception 'This clinic does not offer this kind of session.';
  end if;

  if p_therapist_gender is null or p_therapist_gender not in ('female', 'male', 'any') then
    raise exception 'Please choose a therapist preference.';
  end if;
  if p_therapist_gender <> 'any' and not exists (
    select 1 from public.clinic_therapists(p_slug) t where t.gender = p_therapist_gender
  ) then
    raise exception 'This clinic has no therapist of that preference right now.';
  end if;

  if char_length(v_note) > 1000 then
    raise exception 'Please keep your note under 1000 characters.';
  end if;

  select array_agg(distinct t order by t) into v_times from unnest(p_times) t;
  if v_times is null or cardinality(v_times) = 0 then
    raise exception 'Please choose at least one time.';
  end if;
  if cardinality(v_times) > cardinality(v_clinic.booking_times) then
    raise exception 'Please choose times on one day only.';
  end if;
  if (select count(distinct (t at time zone 'Asia/Phnom_Penh')::date) from unnest(v_times) t) > 1 then
    raise exception 'Please choose times on one day only.';
  end if;

  foreach v_time in array v_times loop
    if not exists (
      select 1 from public.clinic_open_times(p_slug) o
      where o.starts_at = v_time and not o.is_full
    ) then
      raise exception 'One of the times you chose is full or no longer open. Please choose again.';
    end if;
  end loop;

  if exists (
    select 1 from public.clinic_booking_requests
    where clinic_id = v_clinic.id and user_id = v_me and status = 'waiting'
  ) then
    raise exception 'You already have a request waiting for this clinic. Cancel it first to send a new one.';
  end if;

  insert into public.clinic_booking_requests (
    clinic_id, user_id, session_type, therapist_gender, times, note
  )
  values (v_clinic.id, v_me, p_session_type, p_therapist_gender, v_times, v_note)
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.request_clinic_booking(text, public.session_type, text, timestamptz[], text)
  from public, anon;
grant execute on function public.request_clinic_booking(text, public.session_type, text, timestamptz[], text)
  to authenticated;

create or replace function public.cancel_clinic_request(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.clinic_booking_requests
  set status = 'cancelled'
  where id = p_request_id
    and user_id = (select auth.uid())
    and status = 'waiting';
  if not found then
    raise exception 'This request can no longer be cancelled.';
  end if;
end;
$$;

revoke execute on function public.cancel_clinic_request(uuid) from public, anon;
grant execute on function public.cancel_clinic_request(uuid) to authenticated;

-- 8. Desk functions ------------------------------------------------------------------------

-- The clinic of a slug, if the caller works at its desk.
create or replace function public.desk_clinic(p_slug text)
returns public.clinics
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_clinic public.clinics%rowtype;
begin
  select * into v_clinic from public.clinics where slug = p_slug;
  if not found or not public.is_clinic_staff(v_clinic.id) then
    raise exception 'Only this clinic''s desk can do this.';
  end if;
  return v_clinic;
end;
$$;

revoke execute on function public.desk_clinic(text) from public, anon, authenticated;

-- The name the desk sees: hidden names stay "Anonymous".
create or replace function public.desk_client_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p.role = 'user' and coalesce(p.hide_identity, true) then 'Anonymous'
    else coalesce(nullif(btrim(p.full_name), ''), 'Client')
  end
  from public.profiles p
  where p.id = p_user_id;
$$;

revoke execute on function public.desk_client_name(uuid) from public, anon, authenticated;

create or replace function public.clinic_desk_requests(p_slug text)
returns table (
  id uuid,
  reference text,
  client_name text,
  session_type public.session_type,
  therapist_gender text,
  times timestamptz[],
  note text,
  status text,
  answer_note text,
  created_at timestamptz,
  answered_at timestamptz,
  appointment_id uuid,
  booked_at timestamptz,
  therapist_name text,
  appointment_status public.appointment_status
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
      r.id,
      upper(substr(replace(r.id::text, '-', ''), 1, 6)),
      public.desk_client_name(r.user_id),
      r.session_type,
      r.therapist_gender,
      r.times,
      coalesce(r.note, ''),
      r.status,
      coalesce(r.answer_note, ''),
      r.created_at,
      r.answered_at,
      a.id,
      a.starts_at,
      pp.display_name,
      a.status
    from public.clinic_booking_requests r
    left join public.appointments a on a.id = r.appointment_id
    left join public.professional_profiles pp on pp.id = a.professional_id
    where r.clinic_id = v_clinic.id
      and (r.status = 'waiting' or r.created_at > now() - interval '90 days')
    order by (r.status = 'waiting') desc, r.created_at desc
    limit 300;
end;
$$;

revoke execute on function public.clinic_desk_requests(text) from public, anon;
grant execute on function public.clinic_desk_requests(text) to authenticated;

-- Therapists the desk can assign, including those without a photo yet.
create or replace function public.clinic_desk_therapists(p_slug text)
returns table (id uuid, display_name text, title text, gender text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_clinic public.clinics := public.desk_clinic(p_slug);
begin
  return query
    select pp.id, pp.display_name, pp.title, pp.gender
    from public.professional_clinics pc
    join public.professional_profiles pp on pp.id = pc.professional_id
    join public.profiles p on p.id = pp.id
    where pc.clinic_id = v_clinic.id
      and p.role = 'professional'
      and p.account_status = 'active'
      and pp.verification_status = 'verified'
    order by pp.display_name;
end;
$$;

revoke execute on function public.clinic_desk_therapists(text) from public, anon;
grant execute on function public.clinic_desk_therapists(text) to authenticated;

-- Every time from today to the end of the booking window: open, marked full
-- by the desk, or booked (with the therapist and the client's desk name).
create or replace function public.clinic_desk_schedule(p_slug text)
returns table (
  starts_at timestamptz,
  ends_at timestamptz,
  state text,
  appointment_id uuid,
  session_type public.session_type,
  therapist_name text,
  client_name text
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
      g.starts_at,
      g.ends_at,
      case
        when a.id is not null then 'booked'
        when ct.starts_at is not null then 'closed'
        else 'open'
      end,
      a.id,
      a.session_type,
      pp.display_name,
      case when a.id is not null then public.desk_client_name(a.user_id) end
    from public.clinic_time_grid(v_clinic.id) g
    left join public.clinic_closed_times ct
      on ct.clinic_id = v_clinic.id and ct.starts_at = g.starts_at
    left join lateral (
      select x.id, x.session_type, x.user_id, x.professional_id
      from public.appointments x
      where x.clinic_id = v_clinic.id
        and x.status = 'booked'
        and x.starts_at < g.ends_at
        and g.starts_at < x.ends_at
      order by x.starts_at
      limit 1
    ) a on true
    left join public.professional_profiles pp on pp.id = a.professional_id
    order by g.starts_at;
end;
$$;

revoke execute on function public.clinic_desk_schedule(text) from public, anon;
grant execute on function public.clinic_desk_schedule(text) to authenticated;

create or replace function public.clinic_desk_confirm(
  p_request_id uuid,
  p_starts_at timestamptz,
  p_therapist_id uuid,
  p_meeting_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_request public.clinic_booking_requests%rowtype;
  v_clinic public.clinics%rowtype;
  v_ends_at timestamptz;
  v_url text := nullif(btrim(p_meeting_url), '');
  v_id uuid;
begin
  select * into v_request
  from public.clinic_booking_requests
  where id = p_request_id
  for update;
  if not found then
    raise exception 'Request not found.';
  end if;

  select * into v_clinic from public.clinics where id = v_request.clinic_id;
  if not public.is_clinic_staff(v_clinic.id) then
    raise exception 'Only this clinic''s desk can do this.';
  end if;
  if v_request.status <> 'waiting' then
    raise exception 'This request has already been answered or cancelled.';
  end if;
  if p_starts_at is null or not (p_starts_at = any (v_request.times)) then
    raise exception 'Please choose one of the times the student picked.';
  end if;
  if p_starts_at <= now() then
    raise exception 'That time has passed. Choose another time or say the times do not work.';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_clinic.session_minutes);

  -- Lock the clinic row so two confirmations cannot take the same time.
  perform 1 from public.clinics where id = v_clinic.id for update;
  if public.clinic_time_taken(v_clinic.id, p_starts_at, v_ends_at) then
    raise exception 'That time is already full.';
  end if;

  if not exists (
    select 1
    from public.professional_clinics pc
    join public.professional_profiles pp on pp.id = pc.professional_id
    join public.profiles p on p.id = pp.id
    where pc.clinic_id = v_clinic.id
      and pc.professional_id = p_therapist_id
      and p.role = 'professional'
      and p.account_status = 'active'
      and pp.verification_status = 'verified'
  ) then
    raise exception 'Please choose a therapist of this clinic.';
  end if;
  if public.professional_busy(p_therapist_id, p_starts_at, v_ends_at) then
    raise exception 'This therapist already has a session at that time.';
  end if;
  if exists (
    select 1 from public.appointments a
    where a.user_id = v_request.user_id
      and a.status = 'booked'
      and a.starts_at < v_ends_at
      and p_starts_at < a.ends_at
  ) then
    raise exception 'The student already has another session at that time.';
  end if;

  if v_request.session_type = 'online' and v_url is not null
     and (char_length(v_url) > 500 or v_url !~ '^https://[^[:space:]]+$') then
    raise exception 'Enter a valid HTTPS meeting link, or leave it empty.';
  end if;

  insert into public.appointments (
    user_id, professional_id, clinic_id, session_type, starts_at, ends_at, intake_note, meeting_url
  )
  values (
    v_request.user_id,
    p_therapist_id,
    v_clinic.id,
    v_request.session_type,
    p_starts_at,
    v_ends_at,
    v_request.note,
    case when v_request.session_type = 'online' then v_url end
  )
  returning id into v_id;

  update public.clinic_booking_requests
  set status = 'confirmed',
      appointment_id = v_id,
      answered_by = v_me,
      answered_at = now()
  where id = p_request_id;

  return v_id;
end;
$$;

revoke execute on function public.clinic_desk_confirm(uuid, timestamptz, uuid, text) from public, anon;
grant execute on function public.clinic_desk_confirm(uuid, timestamptz, uuid, text) to authenticated;

create or replace function public.clinic_desk_decline(p_request_id uuid, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.clinic_booking_requests%rowtype;
  v_note text := nullif(trim(p_note), '');
begin
  select * into v_request
  from public.clinic_booking_requests
  where id = p_request_id
  for update;
  if not found or not public.is_clinic_staff(v_request.clinic_id) then
    raise exception 'Request not found.';
  end if;
  if v_request.status <> 'waiting' then
    raise exception 'This request has already been answered or cancelled.';
  end if;
  if char_length(v_note) > 500 then
    raise exception 'Please keep the message under 500 characters.';
  end if;

  update public.clinic_booking_requests
  set status = 'declined',
      answer_note = v_note,
      answered_by = (select auth.uid()),
      answered_at = now()
  where id = p_request_id;
end;
$$;

revoke execute on function public.clinic_desk_decline(uuid, text) from public, anon;
grant execute on function public.clinic_desk_decline(uuid, text) to authenticated;

-- Mark a time full (for example booked on the Google Form) or open it again.
create or replace function public.clinic_desk_set_full(p_slug text, p_starts_at timestamptz, p_full boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clinic public.clinics := public.desk_clinic(p_slug);
begin
  if p_full is null then
    raise exception 'Please choose full or open.';
  end if;
  if not exists (select 1 from public.clinic_time_grid(v_clinic.id) g where g.starts_at = p_starts_at) then
    raise exception 'That is not one of the clinic''s times.';
  end if;

  if p_full then
    insert into public.clinic_closed_times (clinic_id, starts_at, closed_by)
    values (v_clinic.id, p_starts_at, (select auth.uid()))
    on conflict (clinic_id, starts_at) do nothing;
  else
    delete from public.clinic_closed_times
    where clinic_id = v_clinic.id and starts_at = p_starts_at;
  end if;
end;
$$;

revoke execute on function public.clinic_desk_set_full(text, timestamptz, boolean) from public, anon;
grant execute on function public.clinic_desk_set_full(text, timestamptz, boolean) to authenticated;

create or replace function public.clinic_desk_cancel(p_appointment_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_appointment public.appointments%rowtype;
  v_reason text := nullif(trim(p_reason), '');
begin
  select * into v_appointment
  from public.appointments
  where id = p_appointment_id
  for update;
  if not found or v_appointment.clinic_id is null or not public.is_clinic_staff(v_appointment.clinic_id) then
    raise exception 'Appointment not found.';
  end if;
  if v_appointment.status <> 'booked' then
    raise exception 'Only upcoming sessions can be cancelled.';
  end if;
  if v_reason is null or char_length(v_reason) > 500 then
    raise exception 'Write a reason of up to 500 characters. The student will see it.';
  end if;

  update public.appointments
  set status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = (select auth.uid()),
      cancel_reason = v_reason
  where id = p_appointment_id;
end;
$$;

revoke execute on function public.clinic_desk_cancel(uuid, text) from public, anon;
grant execute on function public.clinic_desk_cancel(uuid, text) to authenticated;

create or replace function public.clinic_desk_move(p_appointment_id uuid, p_starts_at timestamptz, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_appointment public.appointments%rowtype;
  v_clinic public.clinics%rowtype;
  v_ends_at timestamptz;
  v_reason text := nullif(trim(p_reason), '');
begin
  select * into v_appointment
  from public.appointments
  where id = p_appointment_id
  for update;
  if not found or v_appointment.clinic_id is null or not public.is_clinic_staff(v_appointment.clinic_id) then
    raise exception 'Appointment not found.';
  end if;
  if v_appointment.status <> 'booked' or v_appointment.starts_at <= now() then
    raise exception 'Only upcoming sessions can be moved.';
  end if;
  if v_reason is null or char_length(v_reason) > 300 then
    raise exception 'Write a reason of up to 300 characters. The student will see it.';
  end if;

  select * into v_clinic from public.clinics where id = v_appointment.clinic_id for update;
  if p_starts_at is null or p_starts_at <= now()
     or not exists (select 1 from public.clinic_time_grid(v_clinic.id) g where g.starts_at = p_starts_at) then
    raise exception 'Please choose one of the clinic''s upcoming times.';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_clinic.session_minutes);
  if public.clinic_time_taken(v_clinic.id, p_starts_at, v_ends_at, p_appointment_id) then
    raise exception 'That time is already full.';
  end if;
  if exists (
    select 1 from public.appointments a
    where a.id <> p_appointment_id
      and a.status = 'booked'
      and (a.professional_id = v_appointment.professional_id or a.user_id = v_appointment.user_id)
      and a.starts_at < v_ends_at
      and p_starts_at < a.ends_at
  ) then
    raise exception 'The therapist or the student already has a session at that time.';
  end if;

  update public.appointments
  set starts_at = p_starts_at,
      ends_at = v_ends_at,
      rescheduled_from = coalesce(v_appointment.rescheduled_from, v_appointment.starts_at),
      reschedule_reason = v_reason,
      rescheduled_by = (select auth.uid())
  where id = p_appointment_id;
end;
$$;

revoke execute on function public.clinic_desk_move(uuid, timestamptz, text) from public, anon;
grant execute on function public.clinic_desk_move(uuid, timestamptz, text) to authenticated;

-- 9. Admin functions -------------------------------------------------------------------------

-- Link a therapist to a clinic, or unlink with null.
create or replace function public.admin_set_professional_clinic(p_professional_id uuid, p_clinic_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_from uuid;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change this.';
  end if;
  if not exists (select 1 from public.professional_profiles where id = p_professional_id) then
    raise exception 'Professional not found.';
  end if;
  if p_clinic_id is not null and not exists (select 1 from public.clinics where id = p_clinic_id) then
    raise exception 'Clinic not found.';
  end if;

  select clinic_id into v_from from public.professional_clinics where professional_id = p_professional_id;
  if v_from is not distinct from p_clinic_id then
    return;
  end if;

  delete from public.professional_clinics where professional_id = p_professional_id;
  if p_clinic_id is not null then
    insert into public.professional_clinics (professional_id, clinic_id)
    values (p_professional_id, p_clinic_id);
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    (select auth.uid()), 'set_professional_clinic', 'professional_profiles', p_professional_id,
    jsonb_build_object(
      'from', (select name from public.clinics where id = v_from),
      'to', (select name from public.clinics where id = p_clinic_id)
    )
  );
end;
$$;

revoke execute on function public.admin_set_professional_clinic(uuid, uuid) from public, anon;
grant execute on function public.admin_set_professional_clinic(uuid, uuid) to authenticated;

-- Make an account a clinic desk account, or remove it.
create or replace function public.admin_set_clinic_staff(p_user_id uuid, p_clinic_id uuid, p_on boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change this.';
  end if;
  if p_on is null then
    raise exception 'Please choose on or off.';
  end if;
  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Account not found.';
  end if;
  if not exists (select 1 from public.clinics where id = p_clinic_id) then
    raise exception 'Clinic not found.';
  end if;

  if p_on then
    insert into public.clinic_staff (clinic_id, user_id)
    values (p_clinic_id, p_user_id)
    on conflict do nothing;
  else
    delete from public.clinic_staff where clinic_id = p_clinic_id and user_id = p_user_id;
  end if;
  if not found then
    return;
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    (select auth.uid()), 'set_clinic_staff', 'profiles', p_user_id,
    jsonb_build_object('clinic', (select name from public.clinics where id = p_clinic_id), 'to', p_on)
  );
end;
$$;

revoke execute on function public.admin_set_clinic_staff(uuid, uuid, boolean) from public, anon;
grant execute on function public.admin_set_clinic_staff(uuid, uuid, boolean) to authenticated;

-- 10. Rules on existing objects -----------------------------------------------------------

-- Listed: same as 20261024000100, plus clinic therapists are never listed on
-- the Professional page and never booked directly. The clinic books them.
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
      and (
        not pp.up_students_only
        or pp.id = (select auth.uid())
        or public.is_admin()
        or public.is_up_student()
      )
      and not exists (
        select 1 from public.professional_clinics pc where pc.professional_id = pp.id
      )
  );
$$;

-- In person: a clinic booking needs the clinic's address, any other booking
-- the professional's own address (as before).
create or replace function public.require_office_for_in_person()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.session_type = 'in_person'
     and (tg_op = 'INSERT' or new.session_type is distinct from old.session_type) then
    if new.clinic_id is not null then
      if not exists (
        select 1 from public.clinics c
        where c.id = new.clinic_id
          and char_length(trim(coalesce(c.address, ''))) > 0
      ) then
        raise exception 'This clinic has not added its address yet. Please choose online';
      end if;
    elsif not exists (
      select 1 from public.professional_profiles pp
      where pp.id = new.professional_id
        and char_length(trim(coalesce(pp.office_address, ''))) > 0
    ) then
      raise exception 'This professional has not added an address for in person sessions yet. Please choose online, or another professional';
    end if;
  end if;
  return new;
end;
$$;

-- Clinic therapists do not suggest sessions: the clinic books every session
-- in its one room.
create or replace function public.block_clinic_suggestions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.professional_clinics pc where pc.professional_id = new.professional_id
  ) then
    raise exception 'Clinic therapists cannot suggest sessions. The student books through the clinic.';
  end if;
  return new;
end;
$$;

create trigger session_suggestions_block_clinic
  before insert on public.session_suggestions
  for each row execute function public.block_clinic_suggestions();

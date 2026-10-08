-- AROM 3 of 6: clinics, therapist profiles, schedules, bookings, podcasts.
-- Covers Find Clinic & Hospital, Schedule Management and Booking History.

create type public.session_type as enum ('online', 'in_person');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.appointment_status as enum ('booked', 'completed', 'cancelled', 'no_show');

-- ---------------------------------------------------------------------------
-- clinics: clinics and hospitals shown on the list and map. Admin managed.
-- ---------------------------------------------------------------------------
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_km text,
  kind text not null default 'clinic' check (kind in ('clinic', 'hospital')),
  address text,
  address_km text,
  city text,
  latitude numeric(9, 6) check (latitude between -90 and 90),
  longitude numeric(9, 6) check (longitude between -180 and 180),
  phone text,
  website text,
  -- { "mon": "08:00-17:00", "sun": null }
  opening_hours jsonb not null default '{}'::jsonb,
  services text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clinics_set_updated_at
  before update on public.clinics
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- professional_profiles: public therapist profile. Also used for mentors,
-- because every mentor is a professional.
-- ---------------------------------------------------------------------------
create table public.professional_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  display_name text not null,
  display_name_km text,
  title text not null,
  title_km text,
  bio text,
  bio_km text,
  photo_url text,
  specialties text[] not null default '{}',
  languages text[] not null default '{}',
  gender text check (gender in ('female', 'male', 'other', 'prefer_not_say')),
  years_experience smallint check (years_experience >= 0),
  session_types public.session_type[] not null default '{}',
  price_usd numeric(8, 2) check (price_usd >= 0),
  rating numeric(2, 1) check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  verification_status public.verification_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger professional_profiles_set_updated_at
  before update on public.professional_profiles
  for each row execute function public.set_updated_at();

-- Only admins can verify a therapist or change rating numbers.
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
    end if;
  end if;
  return new;
end;
$$;

create trigger professional_profiles_guard
  before insert or update on public.professional_profiles
  for each row execute function public.guard_professional_profile();

create or replace function public.is_verified_professional()
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
    where pp.id = (select auth.uid())
      and p.role = 'professional'
      and pp.verification_status = 'verified'
  );
$$;

-- ---------------------------------------------------------------------------
-- professional_credentials: license details for admin verification.
-- Kept apart from the public profile so it is never shown to seekers.
-- ---------------------------------------------------------------------------
create table public.professional_credentials (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  license_number text not null,
  issuing_body text,
  -- path inside a private storage bucket, never a public URL
  document_path text,
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text
);

create index professional_credentials_professional_idx
  on public.professional_credentials (professional_id);

-- ---------------------------------------------------------------------------
-- professional_clinics: which therapist works at which clinic or hospital.
-- ---------------------------------------------------------------------------
create table public.professional_clinics (
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  clinic_id uuid not null references public.clinics (id) on delete cascade,
  primary key (professional_id, clinic_id)
);

create index professional_clinics_clinic_idx on public.professional_clinics (clinic_id);

-- ---------------------------------------------------------------------------
-- availability_slots: Schedule Management. Each row is one bookable time.
-- ---------------------------------------------------------------------------
create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  -- where the therapist is at this time, required for in person sessions
  clinic_id uuid references public.clinics (id) on delete set null,
  session_types public.session_type[] not null default '{online}',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (cardinality(session_types) > 0),
  check (not ('in_person' = any (session_types)) or clinic_id is not null),
  unique (professional_id, starts_at)
);

create index availability_slots_open_idx
  on public.availability_slots (professional_id, starts_at)
  where not is_booked;

-- ---------------------------------------------------------------------------
-- appointments: bookings and Booking History. Created only through
-- book_appointment() so a time can never be double booked.
-- ---------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  slot_id uuid references public.availability_slots (id) on delete set null,
  clinic_id uuid references public.clinics (id) on delete set null,
  session_type public.session_type not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'booked',
  intake_note text check (char_length(intake_note) <= 2000),
  meeting_url text,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles (id) on delete set null,
  cancel_reason text check (char_length(cancel_reason) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create unique index appointments_active_slot_uidx
  on public.appointments (slot_id)
  where status = 'booked';

create index appointments_user_idx on public.appointments (user_id, starts_at desc);
create index appointments_professional_idx on public.appointments (professional_id, starts_at desc);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

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
  if v_slot.starts_at <= now() then
    raise exception 'This time has already passed';
  end if;
  if not (p_session_type = any (v_slot.session_types)) then
    raise exception 'This session type is not offered at this time';
  end if;
  if v_slot.professional_id = v_user then
    raise exception 'You cannot book your own schedule';
  end if;
  if not exists (
    select 1 from public.professional_profiles
    where id = v_slot.professional_id and verification_status = 'verified'
  ) then
    raise exception 'This therapist is not available for booking';
  end if;

  insert into public.appointments (
    user_id, professional_id, slot_id, clinic_id, session_type, starts_at, ends_at, intake_note
  )
  values (
    v_user,
    v_slot.professional_id,
    v_slot.id,
    case when p_session_type = 'in_person' then v_slot.clinic_id end,
    p_session_type,
    v_slot.starts_at,
    v_slot.ends_at,
    p_intake_note
  )
  returning id into v_appointment_id;

  update public.availability_slots set is_booked = true where id = v_slot.id;

  return v_appointment_id;
end;
$$;

create or replace function public.cancel_appointment(
  p_appointment_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_appointment public.appointments%rowtype;
begin
  select * into v_appointment
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found or v_user is null or v_user not in (v_appointment.user_id, v_appointment.professional_id) then
    raise exception 'Appointment not found';
  end if;
  if v_appointment.status <> 'booked' then
    raise exception 'Only upcoming appointments can be cancelled';
  end if;

  update public.appointments
  set status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = v_user,
      cancel_reason = p_reason
  where id = p_appointment_id;

  if v_appointment.slot_id is not null then
    update public.availability_slots set is_booked = false where id = v_appointment.slot_id;
  end if;
end;
$$;

revoke execute on function public.book_appointment(uuid, public.session_type, text) from public, anon;
revoke execute on function public.cancel_appointment(uuid, text) from public, anon;
grant execute on function public.book_appointment(uuid, public.session_type, text) to authenticated;
grant execute on function public.cancel_appointment(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- podcasts: Therapist Podcast episodes.
-- ---------------------------------------------------------------------------
create table public.podcasts (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  slug text not null unique,
  title text not null,
  title_km text,
  subtitle text,
  subtitle_km text,
  description text,
  description_km text,
  topic text,
  topic_km text,
  media_url text,
  duration_seconds integer check (duration_seconds > 0),
  -- [{ "timestamp": "02:10", "seconds": 130, "title": "...", "kmTitle": "..." }]
  chapters jsonb not null default '[]'::jsonb,
  takeaways jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index podcasts_professional_idx on public.podcasts (professional_id);

create trigger podcasts_set_updated_at
  before update on public.podcasts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.clinics enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.professional_credentials enable row level security;
alter table public.professional_clinics enable row level security;
alter table public.availability_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.podcasts enable row level security;

-- clinics: public directory, admin managed
create policy "Anyone reads active clinics"
  on public.clinics for select to anon, authenticated
  using (is_active);

create policy "Admins manage clinics"
  on public.clinics for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- professional_profiles: verified profiles are public
create policy "Anyone reads verified professionals"
  on public.professional_profiles for select to anon, authenticated
  using (verification_status = 'verified');

create policy "Professionals read own profile"
  on public.professional_profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Admins read all professionals"
  on public.professional_profiles for select to authenticated
  using (public.is_admin());

create policy "Professionals create own profile"
  on public.professional_profiles for insert to authenticated
  with check (id = (select auth.uid()) and public.current_user_role() = 'professional');

create policy "Professionals update own profile"
  on public.professional_profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Admins manage professionals"
  on public.professional_profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- professional_credentials: owner and admins only
create policy "Professionals read own credentials"
  on public.professional_credentials for select to authenticated
  using (professional_id = (select auth.uid()));

create policy "Professionals submit own credentials"
  on public.professional_credentials for insert to authenticated
  with check (professional_id = (select auth.uid()) and reviewed_by is null and reviewed_at is null);

create policy "Admins manage credentials"
  on public.professional_credentials for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- professional_clinics
create policy "Anyone reads therapist clinic links"
  on public.professional_clinics for select to anon, authenticated
  using (true);

create policy "Professionals link own clinics"
  on public.professional_clinics for insert to authenticated
  with check (professional_id = (select auth.uid()) or public.is_admin());

create policy "Professionals unlink own clinics"
  on public.professional_clinics for delete to authenticated
  using (professional_id = (select auth.uid()) or public.is_admin());

-- availability_slots: signed in users browse, professionals manage their own
create policy "Signed in users read slots"
  on public.availability_slots for select to authenticated
  using (true);

create policy "Professionals add own slots"
  on public.availability_slots for insert to authenticated
  with check (professional_id = (select auth.uid()) and not is_booked);

create policy "Professionals update own slots"
  on public.availability_slots for update to authenticated
  using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

create policy "Professionals delete own open slots"
  on public.availability_slots for delete to authenticated
  using (professional_id = (select auth.uid()) and not is_booked);

-- appointments: only the client, that therapist, and admins
create policy "Clients read own appointments"
  on public.appointments for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Professionals read their appointments"
  on public.appointments for select to authenticated
  using (professional_id = (select auth.uid()));

create policy "Admins read all appointments"
  on public.appointments for select to authenticated
  using (public.is_admin());

create policy "Professionals update their appointments"
  on public.appointments for update to authenticated
  using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

-- podcasts
create policy "Anyone reads published podcasts"
  on public.podcasts for select to anon, authenticated
  using (is_published);

create policy "Professionals read own podcasts"
  on public.podcasts for select to authenticated
  using (professional_id = (select auth.uid()));

create policy "Verified professionals add podcasts"
  on public.podcasts for insert to authenticated
  with check (professional_id = (select auth.uid()) and public.is_verified_professional());

create policy "Professionals update own podcasts"
  on public.podcasts for update to authenticated
  using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

create policy "Professionals delete own podcasts"
  on public.podcasts for delete to authenticated
  using (professional_id = (select auth.uid()) or public.is_admin());

-- A therapist can see the name of a client who booked with them,
-- unless that client chose Anonymous Mode.
create policy "Professionals read their clients' profiles"
  on public.profiles for select to authenticated
  using (
    privacy_mode = 'private'
    and exists (
      select 1 from public.appointments a
      where a.user_id = profiles.id
        and a.professional_id = (select auth.uid())
    )
  );

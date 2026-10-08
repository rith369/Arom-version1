-- AROM 1 of 6: roles, profiles and shared helpers.
-- Run the migration files in filename order on a fresh AROM project.

create type public.user_role as enum ('user', 'professional', 'admin');
create type public.app_language as enum ('en', 'km');
create type public.privacy_mode as enum ('private', 'anonymous');

-- Keeps updated_at current on every table that has one.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per account. Email stays in auth.users only.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  role public.user_role not null default 'user',
  language public.app_language not null default 'en',
  privacy_mode public.privacy_mode not null default 'private',
  city text check (char_length(city) <= 120),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'One row per account. Role decides access: user (seeker), professional (therapist and group mentor), admin.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Role helpers. security definer so policies can check roles without
-- recursing into the profiles policies.
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Create a profile automatically on sign up (email or Google).
-- Role is always 'user' here. Only an admin can promote an account.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_language text := new.raw_user_meta_data ->> 'language';
begin
  insert into public.profiles (id, full_name, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case when v_language in ('en', 'km') then v_language::public.app_language else 'en' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stops signed in users from changing their own role (privilege escalation).
-- Runs as the caller (no security definer) so current_user is the API role.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('authenticated', 'anon')
     and not public.is_admin() then
    raise exception 'Only an admin can change account roles';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using (public.is_admin());

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Admins update any profile"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

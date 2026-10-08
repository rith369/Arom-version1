-- AROM auth foundation: user_role enum, profiles table, signup trigger, RLS.
-- Run once in the Supabase SQL editor (or with `supabase db push`).

-- 1. Role enum -------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('user', 'professional', 'admin');
  end if;
end
$$;

-- 2. Profiles ----------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text check (char_length(full_name) between 2 and 60),
  role        public.user_role not null default 'user',
  locale      text not null default 'en' check (locale in ('en', 'km')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 3. Admin helper (security definer so policies can call it without recursion)
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

-- 4. Create a profile for every new auth user. Role is always 'user';
--    client metadata can never pick a role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    nullif(left(trim(new.raw_user_meta_data ->> 'full_name'), 60), ''),
    'user'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Block privilege escalation: only admins may change a role or an id.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id <> old.id then
    raise exception 'profile id cannot change';
  end if;
  -- auth.uid() is null for the dashboard SQL editor and the service role.
  if new.role <> old.role
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'only admins can change roles';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- 6. RLS policies. No insert or delete policy: the trigger inserts,
--    and deletes cascade from auth.users.
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id or public.is_admin())
  with check ((select auth.uid()) = id or public.is_admin());

-- Promote a user manually (run as the dashboard owner, not from the app):
--   update public.profiles set role = 'admin' where id = '<uuid>';

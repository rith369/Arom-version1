-- AROM: the professional's private notes, and a narrower view of clients
-- (BACKEND-HANDOFF.md section 16).
--
--   1. session_prep_notes: a private plan written before one session.
--   2. client_summary_notes: one pinned summary per client.
--      Both are readable and writable only by the professional who wrote
--      them. No admin read, no client read.
--   3. Professionals no longer read their clients' profile rows. The old
--      policy exposed every column (email language, privacy settings and
--      more). Names come from my_client_names(), which now also respects
--      Anonymous Mode, as the old policy did, and returns the app language.

-- ===========================================================================
-- 1. Prep notes
-- ===========================================================================
create table public.session_prep_notes (
  appointment_id uuid primary key references public.appointments (id) on delete cascade,
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index session_prep_notes_professional_idx on public.session_prep_notes (professional_id);

create trigger session_prep_notes_set_updated_at
  before update on public.session_prep_notes
  for each row execute function public.set_updated_at();

alter table public.session_prep_notes enable row level security;

create policy "Professionals read own prep notes"
  on public.session_prep_notes for select to authenticated
  using (professional_id = (select auth.uid()));

create policy "Professionals write prep notes for own sessions"
  on public.session_prep_notes for insert to authenticated
  with check (
    professional_id = (select auth.uid())
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_id and a.professional_id = (select auth.uid())
    )
  );

create policy "Professionals edit own prep notes"
  on public.session_prep_notes for update to authenticated
  using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

create policy "Professionals delete own prep notes"
  on public.session_prep_notes for delete to authenticated
  using (professional_id = (select auth.uid()));

-- ===========================================================================
-- 2. Client summary notes
-- ===========================================================================
create table public.client_summary_notes (
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (professional_id, client_id)
);

create trigger client_summary_notes_set_updated_at
  before update on public.client_summary_notes
  for each row execute function public.set_updated_at();

alter table public.client_summary_notes enable row level security;

create policy "Professionals read own summary notes"
  on public.client_summary_notes for select to authenticated
  using (professional_id = (select auth.uid()));

-- Only for someone who booked with them.
create policy "Professionals write summary notes for own clients"
  on public.client_summary_notes for insert to authenticated
  with check (
    professional_id = (select auth.uid())
    and exists (
      select 1 from public.appointments a
      where a.user_id = client_id and a.professional_id = (select auth.uid())
    )
  );

create policy "Professionals edit own summary notes"
  on public.client_summary_notes for update to authenticated
  using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

create policy "Professionals delete own summary notes"
  on public.client_summary_notes for delete to authenticated
  using (professional_id = (select auth.uid()));

-- The session or client of an existing note cannot be changed.
create or replace function public.guard_summary_note_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.professional_id := old.professional_id;
  new.client_id := old.client_id;
  return new;
end;
$$;

create trigger client_summary_notes_guard_update
  before update on public.client_summary_notes
  for each row execute function public.guard_summary_note_update();

create or replace function public.guard_prep_note_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.professional_id := old.professional_id;
  new.appointment_id := old.appointment_id;
  return new;
end;
$$;

create trigger session_prep_notes_guard_update
  before update on public.session_prep_notes
  for each row execute function public.guard_prep_note_update();

-- ===========================================================================
-- 3. Narrower view of clients
-- ===========================================================================
drop policy "Professionals read their clients' profiles" on public.profiles;

-- Replaces the version from file 20261014000400: Anonymous Mode hides the
-- name, and the app language is returned so the client file can show it.
drop function public.my_client_names();

create function public.my_client_names()
returns table (id uuid, full_name text, language text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, case when p.privacy_mode = 'private' then p.full_name end, p.language::text
  from public.profiles p
  where exists (
    select 1 from public.appointments a
    where a.user_id = p.id and a.professional_id = (select auth.uid())
  );
$$;

revoke execute on function public.my_client_names() from public, anon;
grant execute on function public.my_client_names() to authenticated;

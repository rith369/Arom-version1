-- AROM: client names for professionals.
--
-- Keeps the shape from 20261015000300_pro_private_notes.sql: (id, full_name,
-- language). pro-controller.ts and messages-controller.ts read `language`, and
-- Postgres cannot change a function's return type with create or replace.
--
-- Professionals follow the client's Anonymous Mode (profiles.privacy_mode),
-- not hide_identity. hide_identity is the Community setting (default on) and
-- would hide every client from their own professional.
create or replace function public.my_client_names()
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

-- APPLY THIS LAST, only after BOTH admins have set up their authenticator app.
-- Applying it earlier locks them out of admin work. (Security audit 5 Nov 2026, finding H1.)
--
-- Admin rights now need a session confirmed with a second factor (aal2), so a
-- stolen password alone cannot use them, even through direct database calls.
-- To undo in an emergency, re-run the is_admin() and is_active_staff()
-- definitions from 20261105000100_active_account_checks.sql.

begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and account_status = 'active'
  )
  and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2';
$$;

-- An admin's test profile also needs the second factor.
create or replace function public.is_active_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.role = 'professional'
  )
  or public.is_admin();
$$;

commit;

-- AROM 9: role in the JWT and safe role changes.
--
-- 1. custom_access_token_hook adds `user_role` and `account_status` claims to
--    every access token, so the app can guard pages without a database query.
--    The database (RLS, is_admin) stays the source of truth.
--    After running this file, enable it in the dashboard:
--    Authentication > Hooks > Customize Access Token (JWT) Claims hook >
--    Postgres function public.custom_access_token_hook.
-- 2. guard_profile_role now also blocks granting `admin` through the API.
--    Admin is only ever assigned by hand in the SQL editor.
-- 3. set_user_role lets an admin demote a professional or restore a user.

-- ---------------------------------------------------------------------------
-- 1. Access token hook
-- ---------------------------------------------------------------------------
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_claims jsonb := coalesce(event -> 'claims', '{}'::jsonb);
  v_role public.user_role;
  v_status public.account_status;
begin
  select role, account_status into v_role, v_status
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  v_claims := jsonb_set(v_claims, '{user_role}', to_jsonb(coalesce(v_role, 'user'::public.user_role)));
  v_claims := jsonb_set(v_claims, '{account_status}', to_jsonb(coalesce(v_status, 'active'::public.account_status)));

  return jsonb_set(event, '{claims}', v_claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;

-- The hook runs as supabase_auth_admin, which RLS would otherwise block.
grant select (id, role, account_status) on public.profiles to supabase_auth_admin;

drop policy if exists "Auth service reads roles for tokens" on public.profiles;
create policy "Auth service reads roles for tokens"
  on public.profiles for select to supabase_auth_admin
  using (true);

-- ---------------------------------------------------------------------------
-- 2. Guard: nobody can grant admin through the API, not even another admin.
--    Replaces the version from file 6.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if (
         new.role is distinct from old.role
         or new.account_status is distinct from old.account_status
         or new.suspended_at is distinct from old.suspended_at
         or new.suspended_reason is distinct from old.suspended_reason
       )
       and not public.is_admin() then
      raise exception 'Only an admin can change account roles or status';
    end if;

    if new.role is distinct from old.role
       and (new.role = 'admin' or old.role = 'admin') then
      raise exception 'Admin accounts are managed in the Supabase dashboard only';
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. set_user_role: admin only, user <-> professional only.
--    Promotion normally goes through review_professional_application, which
--    also creates the verified professional profile. This function covers
--    demotion (for example a license that lapsed) and restoring a profile.
-- ---------------------------------------------------------------------------
create or replace function public.set_user_role(
  p_user_id uuid,
  p_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current public.user_role;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change roles';
  end if;

  if p_role = 'admin' then
    raise exception 'Admin accounts are managed in the Supabase dashboard only';
  end if;

  if p_user_id = (select auth.uid()) then
    raise exception 'You cannot change your own role';
  end if;

  select role into v_current from public.profiles where id = p_user_id for update;
  if v_current is null then
    raise exception 'Account not found';
  end if;
  if v_current = 'admin' then
    raise exception 'Admin accounts are managed in the Supabase dashboard only';
  end if;
  if v_current = p_role then
    return;
  end if;

  if p_role = 'professional' and not exists (
    select 1 from public.professional_profiles where id = p_user_id
  ) then
    raise exception 'Approve a therapist application first, so the professional profile exists';
  end if;

  update public.profiles set role = p_role where id = p_user_id;

  -- A demoted therapist disappears from the public directory.
  update public.professional_profiles
  set verification_status = case when p_role = 'professional' then 'verified' else 'rejected' end,
      verified_at = case when p_role = 'professional' then now() else verified_at end
  where id = p_user_id;
  -- profiles_audit and professional_profiles_audit (file 6) log both changes.
end;
$$;

revoke execute on function public.set_user_role(uuid, public.user_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;

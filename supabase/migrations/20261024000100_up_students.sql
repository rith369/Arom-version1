-- AROM: free professionals for University of Puthisastra (UP) students
-- (BACKEND-HANDOFF.md section 33).
--
-- Decided by Rith (24 Oct 2026):
--   * A UP student is someone with a confirmed `name.student@puthisastra.edu.kh`
--     address: their confirmed login email, or the email of a Google account
--     they linked to AROM (UP mail runs on Google Workspace). Staff addresses
--     (no `.student`) do not count.
--   * Admins mark a professional "UP students only". Only admins can change
--     it, never the professional. Every change is written to admin_audit_log.
--   * A UP only professional is listed, bookable and reschedulable for UP
--     students only. Everyone else does not see them in the directory.
--   * Nothing new is stored about the student. The check reads auth.users and
--     auth.identities each time, so unlinking the UP account removes access.
--
--   1. professional_profiles.up_students_only (default false).
--   2. is_up_student(): the caller only, no user id argument, so nobody can
--      ask about someone else.
--   3. guard_professional_profile(): professionals cannot change the flag.
--   4. is_listed_professional(): UP only professionals are listed for UP
--      students, admins and the professional themself. The directory, the
--      public profile, open times, booking, client reschedule and reviews all
--      go through this check already.
--   5. admin_set_up_students_only(): admin only, writes the audit log.
--
-- Note: the existing "Anyone reads verified professionals" policy still lets
-- the raw API read a UP only professional's public profile fields. That is
-- the same public profile as before; booking is what is protected.

-- 1. The flag ------------------------------------------------------------

alter table public.professional_profiles
  add column if not exists up_students_only boolean not null default false;

-- 2. Is the caller a UP student? ------------------------------------------

create or replace function public.is_up_student()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = (select auth.uid())
      and u.email_confirmed_at is not null
      and lower(u.email) ~ '^[^@[:space:]]+\.student@puthisastra\.edu\.kh$'
  )
  or exists (
    select 1
    from auth.identities i
    where i.user_id = (select auth.uid())
      and i.provider = 'google'
      and coalesce(i.identity_data ->> 'email_verified', 'true') <> 'false'
      and lower(i.identity_data ->> 'email') ~ '^[^@[:space:]]+\.student@puthisastra\.edu\.kh$'
  );
$$;

revoke execute on function public.is_up_student() from public, anon;
grant execute on function public.is_up_student() to authenticated;

-- 3. Professionals cannot change the flag themselves ----------------------

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
      new.up_students_only := false;
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
      new.up_students_only := old.up_students_only;
    end if;
  end if;
  return new;
end;
$$;

-- 4. Listed: same as 20261014000500, plus the UP only rule -----------------

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
  );
$$;

-- 5. Admins turn UP only on or off ------------------------------------------

create or replace function public.admin_set_up_students_only(p_professional_id uuid, p_on boolean)
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

  update public.professional_profiles
  set up_students_only = p_on
  where id = p_professional_id
    and up_students_only is distinct from p_on;

  if not found then
    if not exists (select 1 from public.professional_profiles where id = p_professional_id) then
      raise exception 'Professional not found.';
    end if;
    return;
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values ((select auth.uid()), 'set_up_students_only', 'professional_profiles', p_professional_id,
          jsonb_build_object('to', p_on));
end;
$$;

revoke execute on function public.admin_set_up_students_only(uuid, boolean) from public, anon;
grant execute on function public.admin_set_up_students_only(uuid, boolean) to authenticated;

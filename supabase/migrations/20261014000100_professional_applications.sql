-- AROM: "Become a professional" connected to the backend.
-- Adds the applicant's private phone and Telegram, the original license file
-- name, server side limits, a private contact table for approved
-- professionals, and the private "licenses" storage bucket.
-- See BACKEND-HANDOFF.md section 8.

-- ---------------------------------------------------------------------------
-- professional_applications: new columns and the same limits as the form.
-- Checks are "not valid" so rows created before this file are not rejected.
-- ---------------------------------------------------------------------------
alter table public.professional_applications
  add column phone text,
  add column telegram text,
  add column document_name text check (char_length(document_name) <= 200);

alter table public.professional_applications
  add constraint professional_applications_phone_check
    check (phone ~ '^(\+?855|0)[1-9][0-9]{7,8}$') not valid,
  -- empty, the same number as phone, or a Telegram username
  add constraint professional_applications_telegram_check
    check (telegram = '' or telegram = phone or telegram ~ '^@?[A-Za-z0-9_]{5,32}$') not valid,
  add constraint professional_applications_license_check
    check (char_length(license_number) between 3 and 60) not valid,
  add constraint professional_applications_issuing_body_check
    check (char_length(issuing_body) <= 120) not valid,
  add constraint professional_applications_specialties_check
    check (cardinality(specialties) between 1 and 20) not valid,
  add constraint professional_applications_languages_check
    check (cardinality(languages) between 1 and 5) not valid,
  add constraint professional_applications_years_check
    check (years_experience <= 60) not valid;

-- Only an active seeker may apply. Suspended accounts are already stopped by
-- the professional_applications_block_suspended trigger.
drop policy "Users apply as a therapist" on public.professional_applications;

create policy "Users apply as a therapist"
  on public.professional_applications for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and public.current_user_role() = 'user'
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

-- ---------------------------------------------------------------------------
-- professional_contacts: private phone and Telegram of an approved
-- professional. Never part of professional_profiles or any public view.
-- ---------------------------------------------------------------------------
create table public.professional_contacts (
  professional_id uuid primary key references public.professional_profiles (id) on delete cascade,
  phone text,
  telegram text,
  updated_at timestamptz not null default now()
);

create trigger professional_contacts_set_updated_at
  before update on public.professional_contacts
  for each row execute function public.set_updated_at();

alter table public.professional_contacts enable row level security;

create policy "Professionals read own contact"
  on public.professional_contacts for select to authenticated
  using (professional_id = (select auth.uid()));

create policy "Admins manage professional contacts"
  on public.professional_contacts for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Replaces the version from file 6: approval now also copies the private
-- phone and Telegram into professional_contacts.
-- ---------------------------------------------------------------------------
create or replace function public.review_professional_application(
  p_application_id uuid,
  p_approve boolean,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app public.professional_applications%rowtype;
  v_base text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can review applications';
  end if;

  select * into v_app
  from public.professional_applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'Application not found';
  end if;
  if v_app.status <> 'pending' then
    raise exception 'This application was already reviewed';
  end if;
  if not p_approve and coalesce(trim(p_note), '') = '' then
    raise exception 'Write a reason so the applicant knows what to fix';
  end if;

  update public.professional_applications
  set status = case when p_approve then 'approved' else 'rejected' end::public.application_status,
      reviewed_by = (select auth.uid()),
      reviewed_at = now(),
      review_note = p_note
  where id = p_application_id;

  if p_approve then
    -- Never demotes an admin.
    update public.profiles set role = 'professional'
    where id = v_app.user_id and role = 'user';

    v_base := trim(both '-' from regexp_replace(lower(v_app.full_name), '[^a-z0-9]+', '-', 'g'));
    if v_base = '' then
      v_base := 'therapist';
    end if;

    insert into public.professional_profiles (
      id, slug, display_name, title, specialties, languages, years_experience,
      verification_status, verified_at
    )
    values (
      v_app.user_id,
      v_base || '-' || substr(md5(v_app.user_id::text), 1, 6),
      v_app.full_name,
      v_app.title,
      v_app.specialties,
      v_app.languages,
      v_app.years_experience,
      'verified',
      now()
    )
    on conflict (id) do update
      set verification_status = 'verified', verified_at = now();

    insert into public.professional_credentials (
      professional_id, license_number, issuing_body, document_path, reviewed_by, reviewed_at
    )
    values (
      v_app.user_id, v_app.license_number, v_app.issuing_body, v_app.document_path,
      (select auth.uid()), now()
    );

    insert into public.professional_contacts (professional_id, phone, telegram)
    values (v_app.user_id, v_app.phone, v_app.telegram)
    on conflict (professional_id) do update
      set phone = excluded.phone, telegram = excluded.telegram;
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    (select auth.uid()),
    case when p_approve then 'approve_application' else 'reject_application' end,
    'professional_applications',
    p_application_id,
    jsonb_build_object('applicant', v_app.user_id, 'note', p_note)
  );
end;
$$;

revoke execute on function public.review_professional_application(uuid, boolean, text) from public, anon;
grant execute on function public.review_professional_application(uuid, boolean, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: private "licenses" bucket. Files live at <user_id>/<uuid>.<ext>.
-- The owner can upload into their own folder, admins can read. Nobody else
-- can read, and nobody can change or delete a file through the API, so the
-- evidence an admin reviewed stays as it was.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'licenses',
  'licenses',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

create policy "Applicants upload own license"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'licenses'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Admins read licenses"
  on storage.objects for select to authenticated
  using (bucket_id = 'licenses' and public.is_admin());

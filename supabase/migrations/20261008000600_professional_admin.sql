-- AROM 6 of 8: professional and admin tools.
-- Therapist applications, intake questions, sharing results with a therapist,
-- private session notes, crisis hotlines, account suspension, admin audit log
-- and privacy safe platform stats.

create type public.account_status as enum ('active', 'suspended');
create type public.application_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- Account suspension
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column account_status public.account_status not null default 'active',
  add column suspended_at timestamptz,
  add column suspended_reason text check (char_length(suspended_reason) <= 500);

-- Replaces the version from file 1: now also protects suspension fields.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (
       new.role is distinct from old.role
       or new.account_status is distinct from old.account_status
       or new.suspended_at is distinct from old.suspended_at
       or new.suspended_reason is distinct from old.suspended_reason
     )
     and current_user in ('authenticated', 'anon')
     and not public.is_admin() then
    raise exception 'Only an admin can change account roles or status';
  end if;
  return new;
end;
$$;

-- A suspended account can still read and delete its own private data,
-- but cannot book, join groups, post or publish.
create or replace function public.block_suspended_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and account_status = 'suspended'
  ) then
    raise exception 'This account is suspended. Please contact AROM support.';
  end if;
  return new;
end;
$$;

revoke execute on function public.block_suspended_account() from public, anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'appointments',
    'availability_slots',
    'group_members',
    'group_discussions',
    'discussion_replies',
    'group_checkins',
    'support_groups',
    'podcasts'
  ] loop
    execute format(
      'create trigger %I before insert on public.%I for each row execute function public.block_suspended_account()',
      t || '_block_suspended', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- admin_audit_log: append only record of admin decisions.
-- Rows are written by triggers and functions, never by the app directly.
-- ---------------------------------------------------------------------------
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  -- null when the change was made from the Supabase dashboard
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_table text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
create index admin_audit_log_target_idx on public.admin_audit_log (target_table, target_id);

create or replace function public.audit_admin_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
begin
  if tg_table_name = 'profiles' then
    if new.role is distinct from old.role then
      insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
      values (v_admin, 'change_role', 'profiles', new.id,
              jsonb_build_object('from', old.role, 'to', new.role));
    end if;
    if new.account_status is distinct from old.account_status then
      insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
      values (v_admin, 'change_account_status', 'profiles', new.id,
              jsonb_build_object('from', old.account_status, 'to', new.account_status,
                                 'reason', new.suspended_reason));
    end if;
  elsif tg_table_name = 'professional_profiles' then
    if new.verification_status is distinct from old.verification_status then
      insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
      values (v_admin, 'change_verification', 'professional_profiles', new.id,
              jsonb_build_object('from', old.verification_status, 'to', new.verification_status));
    end if;
  elsif tg_table_name = 'safety_flags' then
    if new.status is distinct from old.status then
      insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
      values (v_admin, 'change_flag_status', 'safety_flags', new.id,
              jsonb_build_object('from', old.status, 'to', new.status));
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function public.audit_admin_change() from public, anon, authenticated;

create trigger profiles_audit
  after update on public.profiles
  for each row execute function public.audit_admin_change();

create trigger professional_profiles_audit
  after update on public.professional_profiles
  for each row execute function public.audit_admin_change();

create trigger safety_flags_audit
  after update on public.safety_flags
  for each row execute function public.audit_admin_change();

-- ---------------------------------------------------------------------------
-- professional_applications: "Apply as a therapist". An admin approves it,
-- which turns the account into a verified professional in one step.
-- ---------------------------------------------------------------------------
create table public.professional_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null check (char_length(full_name) <= 120),
  title text not null check (char_length(title) <= 120),
  license_number text not null,
  issuing_body text,
  -- path inside a private storage bucket, never a public URL
  document_path text,
  specialties text[] not null default '{}',
  languages text[] not null default '{}',
  years_experience smallint check (years_experience >= 0),
  motivation text check (char_length(motivation) <= 2000),
  status public.application_status not null default 'pending',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text check (char_length(review_note) <= 1000),
  created_at timestamptz not null default now()
);

create unique index professional_applications_one_pending_uidx
  on public.professional_applications (user_id)
  where status = 'pending';

create index professional_applications_status_idx
  on public.professional_applications (status, created_at);

create trigger professional_applications_block_suspended
  before insert on public.professional_applications
  for each row execute function public.block_suspended_account();

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
-- Sharing results with a therapist. Off by default, the client turns it on
-- per appointment and can turn it off at any time.
-- ---------------------------------------------------------------------------
alter table public.appointments
  add column share_survey boolean not null default false,
  add column share_symptom_checks boolean not null default false,
  add column shared_at timestamptz;

-- Therapists may only mark a booking completed or no show and add a
-- meeting link. Everything else on the booking stays as the client made it.
create or replace function public.guard_appointment_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    if new.status is distinct from old.status
       and (old.status <> 'booked' or new.status not in ('completed', 'no_show')) then
      raise exception 'Use cancel_appointment to cancel a booking';
    end if;
    new.user_id := old.user_id;
    new.professional_id := old.professional_id;
    new.slot_id := old.slot_id;
    new.clinic_id := old.clinic_id;
    new.session_type := old.session_type;
    new.starts_at := old.starts_at;
    new.ends_at := old.ends_at;
    new.intake_note := old.intake_note;
    new.cancelled_at := old.cancelled_at;
    new.cancelled_by := old.cancelled_by;
    new.cancel_reason := old.cancel_reason;
    new.share_survey := old.share_survey;
    new.share_symptom_checks := old.share_symptom_checks;
    new.shared_at := old.shared_at;
  end if;
  return new;
end;
$$;

create trigger appointments_guard_update
  before update on public.appointments
  for each row execute function public.guard_appointment_update();

create or replace function public.set_appointment_sharing(
  p_appointment_id uuid,
  p_share_survey boolean,
  p_share_symptom_checks boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.appointments
  set share_survey = p_share_survey,
      share_symptom_checks = p_share_symptom_checks,
      shared_at = case when p_share_survey or p_share_symptom_checks then now() end
  where id = p_appointment_id
    and user_id = (select auth.uid());

  if not found then
    raise exception 'Appointment not found';
  end if;
end;
$$;

revoke execute on function public.set_appointment_sharing(uuid, boolean, boolean) from public, anon;
grant execute on function public.set_appointment_sharing(uuid, boolean, boolean) to authenticated;

create or replace function public.client_shares_with_me(p_client_id uuid, p_kind text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.appointments a
    where a.user_id = p_client_id
      and a.professional_id = (select auth.uid())
      and a.status in ('booked', 'completed')
      and case p_kind
            when 'survey' then a.share_survey
            when 'symptoms' then a.share_symptom_checks
            else false
          end
  );
$$;

create policy "Therapists read shared surveys"
  on public.onboarding_surveys for select to authenticated
  using (public.client_shares_with_me(user_id, 'survey'));

create policy "Therapists read shared insights"
  on public.mental_health_insights for select to authenticated
  using (public.client_shares_with_me(user_id, 'survey'));

create policy "Therapists read shared symptom checks"
  on public.symptom_checks for select to authenticated
  using (public.client_shares_with_me(user_id, 'symptoms'));

-- ---------------------------------------------------------------------------
-- Intake questionnaire. professional_id null means an AROM default question
-- managed by admins. Therapists can add their own.
-- ---------------------------------------------------------------------------
create table public.intake_questions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.professional_profiles (id) on delete cascade,
  question text not null check (char_length(question) <= 500),
  question_km text,
  answer_type text not null default 'text'
    check (answer_type in ('text', 'single_choice', 'multi_choice', 'scale')),
  -- [{ "value": "yes", "label": "Yes", "labelKm": "បាទ/ចាស (Yes)" }]
  options jsonb not null default '[]'::jsonb,
  sort_order smallint not null default 0,
  is_required boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index intake_questions_professional_idx
  on public.intake_questions (professional_id, sort_order);

create trigger intake_questions_set_updated_at
  before update on public.intake_questions
  for each row execute function public.set_updated_at();

create table public.intake_answers (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  question_id uuid references public.intake_questions (id) on delete set null,
  -- the wording the client saw, kept even if the question is edited later
  question_snapshot text not null,
  answer jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (appointment_id, question_id)
);

create trigger intake_answers_set_updated_at
  before update on public.intake_answers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- session_notes: private to the therapist who wrote them.
-- Clients and admins cannot read them.
-- ---------------------------------------------------------------------------
create table public.session_notes (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  content text not null check (char_length(content) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index session_notes_appointment_idx on public.session_notes (appointment_id);
create index session_notes_professional_idx on public.session_notes (professional_id);

create trigger session_notes_set_updated_at
  before update on public.session_notes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- crisis_resources: emergency hotlines shown in the app. Admin managed.
-- Enter only numbers that have been checked with the provider.
-- ---------------------------------------------------------------------------
create table public.crisis_resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_km text,
  description text,
  description_km text,
  phone text,
  sms text,
  website text,
  available_hours text,
  available_hours_km text,
  country_code text not null default 'KH' check (country_code ~ '^[A-Z]{2}$'),
  sort_order smallint not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (phone is not null or sms is not null or website is not null)
);

create trigger crisis_resources_set_updated_at
  before update on public.crisis_resources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- admin_stats(): counts only. Never returns names, journals or answers.
-- ---------------------------------------------------------------------------
create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can view platform stats';
  end if;

  return jsonb_build_object(
    'users_total', (select count(*) from public.profiles),
    'users_by_role', (
      select coalesce(jsonb_object_agg(role, c), '{}'::jsonb)
      from (select role, count(*) as c from public.profiles group by role) s
    ),
    'new_users_7d', (
      select count(*) from public.profiles where created_at > now() - interval '7 days'
    ),
    'suspended_accounts', (
      select count(*) from public.profiles where account_status = 'suspended'
    ),
    'pending_applications', (
      select count(*) from public.professional_applications where status = 'pending'
    ),
    'verified_professionals', (
      select count(*) from public.professional_profiles where verification_status = 'verified'
    ),
    'appointments_by_status', (
      select coalesce(jsonb_object_agg(status, c), '{}'::jsonb)
      from (select status, count(*) as c from public.appointments group by status) s
    ),
    'upcoming_appointments', (
      select count(*) from public.appointments where status = 'booked' and starts_at > now()
    ),
    'active_groups', (select count(*) from public.support_groups where is_active),
    'open_safety_flags', (
      select count(*) from public.safety_flags where status in ('open', 'reviewing')
    ),
    'journal_entries_7d', (
      select count(*) from public.journal_entries where created_at > now() - interval '7 days'
    ),
    'symptom_checks_7d', (
      select count(*) from public.symptom_checks where created_at > now() - interval '7 days'
    )
  );
end;
$$;

revoke execute on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.admin_audit_log enable row level security;
alter table public.professional_applications enable row level security;
alter table public.intake_questions enable row level security;
alter table public.intake_answers enable row level security;
alter table public.session_notes enable row level security;
alter table public.crisis_resources enable row level security;

-- admin_audit_log: read only for admins, no one writes directly
create policy "Admins read audit log"
  on public.admin_audit_log for select to authenticated
  using (public.is_admin());

-- professional_applications
create policy "Applicants read own applications"
  on public.professional_applications for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Admins read all applications"
  on public.professional_applications for select to authenticated
  using (public.is_admin());

create policy "Users apply as a therapist"
  on public.professional_applications for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );

create policy "Applicants withdraw pending applications"
  on public.professional_applications for delete to authenticated
  using (user_id = (select auth.uid()) and status = 'pending');

-- intake_questions
create policy "Signed in users read active intake questions"
  on public.intake_questions for select to authenticated
  using (is_active or professional_id = (select auth.uid()) or public.is_admin());

create policy "Professionals and admins add intake questions"
  on public.intake_questions for insert to authenticated
  with check (
    (professional_id = (select auth.uid()) and public.current_user_role() = 'professional')
    or (professional_id is null and public.is_admin())
  );

create policy "Professionals and admins edit intake questions"
  on public.intake_questions for update to authenticated
  using (
    professional_id = (select auth.uid())
    or (professional_id is null and public.is_admin())
  )
  with check (
    professional_id = (select auth.uid())
    or (professional_id is null and public.is_admin())
  );

create policy "Professionals and admins delete intake questions"
  on public.intake_questions for delete to authenticated
  using (
    professional_id = (select auth.uid())
    or (professional_id is null and public.is_admin())
  );

-- intake_answers: the client writes them, the client and that therapist read them
create policy "Client and therapist read intake answers"
  on public.intake_answers for select to authenticated
  using (
    exists (
      select 1 from public.appointments a
      where a.id = appointment_id
        and (a.user_id = (select auth.uid()) or a.professional_id = (select auth.uid()))
    )
  );

create policy "Client answers intake for own booking"
  on public.intake_answers for insert to authenticated
  with check (
    exists (
      select 1 from public.appointments a
      where a.id = appointment_id
        and a.user_id = (select auth.uid())
        and a.status = 'booked'
    )
  );

create policy "Client edits intake before the session"
  on public.intake_answers for update to authenticated
  using (
    exists (
      select 1 from public.appointments a
      where a.id = appointment_id
        and a.user_id = (select auth.uid())
        and a.status = 'booked'
    )
  )
  with check (
    exists (
      select 1 from public.appointments a
      where a.id = appointment_id
        and a.user_id = (select auth.uid())
        and a.status = 'booked'
    )
  );

create policy "Client deletes own intake answers"
  on public.intake_answers for delete to authenticated
  using (
    exists (
      select 1 from public.appointments a
      where a.id = appointment_id and a.user_id = (select auth.uid())
    )
  );

-- session_notes: the writing therapist only
create policy "Therapists read own session notes"
  on public.session_notes for select to authenticated
  using (professional_id = (select auth.uid()));

create policy "Therapists write notes for own sessions"
  on public.session_notes for insert to authenticated
  with check (
    professional_id = (select auth.uid())
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_id and a.professional_id = (select auth.uid())
    )
  );

create policy "Therapists edit own session notes"
  on public.session_notes for update to authenticated
  using (professional_id = (select auth.uid()))
  with check (professional_id = (select auth.uid()));

create policy "Therapists delete own session notes"
  on public.session_notes for delete to authenticated
  using (professional_id = (select auth.uid()));

-- crisis_resources: everyone can see them, even before signing in
create policy "Anyone reads active crisis resources"
  on public.crisis_resources for select to anon, authenticated
  using (is_active);

create policy "Admins manage crisis resources"
  on public.crisis_resources for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

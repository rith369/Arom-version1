-- AROM: clinic booking request details, matching UP's Google Form
-- (BACKEND-HANDOFF.md section 34).
--
-- Decided by Rith (24 Oct 2026), after reading the UP and EMDRAC booking form:
--   * "What would you like help with?" is required (it was an optional note).
--   * New, required: age, sex (male, female, non-binary) and preferred
--     language (Khmer, English). Name and Telegram are NOT asked: students
--     stay anonymous and the desk chats inside AROM (section 35).
--   * The desk sees these on the request. When it confirms, the therapist
--     sees them under "Before the session" (intake_answers) with the summary
--     as the intake note.
--   * The UP clinic is run by EMDR Association Cambodia: renamed
--     "UP Counseling (EMDRAC)". Its slug stays up-wellness-clinic.
--
--   1. clinic_booking_requests: age, sex, preferred_language
--   2. request_clinic_booking(): new required fields (replaces the old one)
--   3. clinic_desk_requests(): returns them
--   4. clinic_desk_confirm(): copies them to the therapist's intake answers
--   5. The clinic's name

-- 1. Columns (null only for requests sent before this migration) ---------------

alter table public.clinic_booking_requests
  add column if not exists age smallint check (age between 13 and 100),
  add column if not exists sex text check (sex in ('male', 'female', 'non_binary')),
  add column if not exists preferred_language text check (preferred_language in ('khmer', 'english'));

-- 2. Sending a request ------------------------------------------------------------

drop function if exists public.request_clinic_booking(text, public.session_type, text, timestamptz[], text);

create or replace function public.request_clinic_booking(
  p_slug text,
  p_session_type public.session_type,
  p_therapist_gender text,
  p_preferred_language text,
  p_age integer,
  p_sex text,
  p_times timestamptz[],
  p_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_clinic public.clinics%rowtype;
  v_note text := nullif(trim(p_note), '');
  v_times timestamptz[];
  v_time timestamptz;
  v_id uuid;
begin
  if v_me is null then
    raise exception 'Please log in to continue.';
  end if;
  if not exists (select 1 from public.profiles where id = v_me and role = 'user') then
    raise exception 'Only AROM users can book a clinic session.';
  end if;

  select * into v_clinic from public.clinics where slug = p_slug;
  if not found or not public.can_see_clinic(v_clinic.id) then
    raise exception 'Clinic not found.';
  end if;
  if cardinality(v_clinic.booking_days) = 0 or cardinality(v_clinic.booking_times) = 0 then
    raise exception 'This clinic does not take bookings in AROM yet.';
  end if;
  if not (p_session_type = any (v_clinic.session_types)) then
    raise exception 'This clinic does not offer this kind of session.';
  end if;

  if p_therapist_gender is null or p_therapist_gender not in ('female', 'male', 'any') then
    raise exception 'Please choose a therapist preference.';
  end if;
  if p_therapist_gender <> 'any' and not exists (
    select 1 from public.clinic_therapists(p_slug) t where t.gender = p_therapist_gender
  ) then
    raise exception 'This clinic has no therapist of that preference right now.';
  end if;

  if p_preferred_language is null or p_preferred_language not in ('khmer', 'english') then
    raise exception 'Please choose your preferred language.';
  end if;
  if p_age is null or p_age < 13 or p_age > 100 then
    raise exception 'Please enter your age.';
  end if;
  if p_sex is null or p_sex not in ('male', 'female', 'non_binary') then
    raise exception 'Please choose your sex.';
  end if;
  if v_note is null then
    raise exception 'Please tell the clinic what you would like help with.';
  end if;
  if char_length(v_note) > 1000 then
    raise exception 'Please keep it under 1000 characters.';
  end if;

  select array_agg(distinct t order by t) into v_times from unnest(p_times) t;
  if v_times is null or cardinality(v_times) = 0 then
    raise exception 'Please choose at least one time.';
  end if;
  if cardinality(v_times) > cardinality(v_clinic.booking_times) then
    raise exception 'Please choose times on one day only.';
  end if;
  if (select count(distinct (t at time zone 'Asia/Phnom_Penh')::date) from unnest(v_times) t) > 1 then
    raise exception 'Please choose times on one day only.';
  end if;

  foreach v_time in array v_times loop
    if not exists (
      select 1 from public.clinic_open_times(p_slug) o
      where o.starts_at = v_time and not o.is_full
    ) then
      raise exception 'One of the times you chose is full or no longer open. Please choose again.';
    end if;
  end loop;

  if exists (
    select 1 from public.clinic_booking_requests
    where clinic_id = v_clinic.id and user_id = v_me and status = 'waiting'
  ) then
    raise exception 'You already have a request waiting for this clinic. Cancel it first to send a new one.';
  end if;

  insert into public.clinic_booking_requests (
    clinic_id, user_id, session_type, therapist_gender, preferred_language, age, sex, times, note
  )
  values (
    v_clinic.id, v_me, p_session_type, p_therapist_gender, p_preferred_language, p_age, p_sex, v_times, v_note
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.request_clinic_booking(text, public.session_type, text, text, integer, text, timestamptz[], text)
  from public, anon;
grant execute on function public.request_clinic_booking(text, public.session_type, text, text, integer, text, timestamptz[], text)
  to authenticated;

-- 3. What the desk sees (adds age, sex and language) ---------------------------------

drop function if exists public.clinic_desk_requests(text);

create or replace function public.clinic_desk_requests(p_slug text)
returns table (
  id uuid,
  reference text,
  client_name text,
  session_type public.session_type,
  therapist_gender text,
  preferred_language text,
  age smallint,
  sex text,
  times timestamptz[],
  note text,
  status text,
  answer_note text,
  created_at timestamptz,
  answered_at timestamptz,
  appointment_id uuid,
  booked_at timestamptz,
  therapist_name text,
  appointment_status public.appointment_status
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_clinic public.clinics := public.desk_clinic(p_slug);
begin
  return query
    select
      r.id,
      upper(substr(replace(r.id::text, '-', ''), 1, 6)),
      public.desk_client_name(r.user_id),
      r.session_type,
      r.therapist_gender,
      r.preferred_language,
      r.age,
      r.sex,
      r.times,
      coalesce(r.note, ''),
      r.status,
      coalesce(r.answer_note, ''),
      r.created_at,
      r.answered_at,
      a.id,
      a.starts_at,
      pp.display_name,
      a.status
    from public.clinic_booking_requests r
    left join public.appointments a on a.id = r.appointment_id
    left join public.professional_profiles pp on pp.id = a.professional_id
    where r.clinic_id = v_clinic.id
      and (r.status = 'waiting' or r.created_at > now() - interval '90 days')
    order by (r.status = 'waiting') desc, r.created_at desc
    limit 300;
end;
$$;

revoke execute on function public.clinic_desk_requests(text) from public, anon;
grant execute on function public.clinic_desk_requests(text) to authenticated;

-- 4. Confirming: same as 20261024000200, plus the therapist's intake answers -------

create or replace function public.clinic_desk_confirm(
  p_request_id uuid,
  p_starts_at timestamptz,
  p_therapist_id uuid,
  p_meeting_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_request public.clinic_booking_requests%rowtype;
  v_clinic public.clinics%rowtype;
  v_ends_at timestamptz;
  v_url text := nullif(btrim(p_meeting_url), '');
  v_id uuid;
begin
  select * into v_request
  from public.clinic_booking_requests
  where id = p_request_id
  for update;
  if not found then
    raise exception 'Request not found.';
  end if;

  select * into v_clinic from public.clinics where id = v_request.clinic_id;
  if not public.is_clinic_staff(v_clinic.id) then
    raise exception 'Only this clinic''s desk can do this.';
  end if;
  if v_request.status <> 'waiting' then
    raise exception 'This request has already been answered or cancelled.';
  end if;
  if p_starts_at is null or not (p_starts_at = any (v_request.times)) then
    raise exception 'Please choose one of the times the student picked.';
  end if;
  if p_starts_at <= now() then
    raise exception 'That time has passed. Choose another time or say the times do not work.';
  end if;

  v_ends_at := p_starts_at + make_interval(mins => v_clinic.session_minutes);

  -- Lock the clinic row so two confirmations cannot take the same time.
  perform 1 from public.clinics where id = v_clinic.id for update;
  if public.clinic_time_taken(v_clinic.id, p_starts_at, v_ends_at) then
    raise exception 'That time is already full.';
  end if;

  if not exists (
    select 1
    from public.professional_clinics pc
    join public.professional_profiles pp on pp.id = pc.professional_id
    join public.profiles p on p.id = pp.id
    where pc.clinic_id = v_clinic.id
      and pc.professional_id = p_therapist_id
      and p.role = 'professional'
      and p.account_status = 'active'
      and pp.verification_status = 'verified'
  ) then
    raise exception 'Please choose a therapist of this clinic.';
  end if;
  if public.professional_busy(p_therapist_id, p_starts_at, v_ends_at) then
    raise exception 'This therapist already has a session at that time.';
  end if;
  if exists (
    select 1 from public.appointments a
    where a.user_id = v_request.user_id
      and a.status = 'booked'
      and a.starts_at < v_ends_at
      and p_starts_at < a.ends_at
  ) then
    raise exception 'The student already has another session at that time.';
  end if;

  if v_request.session_type = 'online' and v_url is not null
     and (char_length(v_url) > 500 or v_url !~ '^https://[^[:space:]]+$') then
    raise exception 'Enter a valid HTTPS meeting link, or leave it empty.';
  end if;

  insert into public.appointments (
    user_id, professional_id, clinic_id, session_type, starts_at, ends_at, intake_note, meeting_url
  )
  values (
    v_request.user_id,
    p_therapist_id,
    v_clinic.id,
    v_request.session_type,
    p_starts_at,
    v_ends_at,
    v_request.note,
    case when v_request.session_type = 'online' then v_url end
  )
  returning id into v_id;

  -- What the student told the clinic, for the therapist's "Before the session".
  -- The therapist's view sorts answers by created_at, so each gets its own moment.
  insert into public.intake_answers (appointment_id, question_snapshot, answer, created_at, updated_at)
  select
    v_id,
    q.question,
    to_jsonb(q.answer),
    now() + make_interval(secs => q.position / 1000.0),
    now() + make_interval(secs => q.position / 1000.0)
  from (
    values
      (1, 'អាយុ (Age)', v_request.age::text),
      (2, 'ភេទ (Sex)', case v_request.sex
        when 'male' then 'Male'
        when 'female' then 'Female'
        when 'non_binary' then 'Non-binary'
      end),
      (3, 'ភាសាដែលចង់ប្រើ (Preferred language)', case v_request.preferred_language
        when 'khmer' then 'Khmer'
        when 'english' then 'English'
      end),
      (4, 'អ្នកព្យាបាលដែលចង់បាន (Therapist preference)', case v_request.therapist_gender
        when 'female' then 'Female'
        when 'male' then 'Male'
        else 'No preference'
      end)
  ) as q(position, question, answer)
  where q.answer is not null;

  update public.clinic_booking_requests
  set status = 'confirmed',
      appointment_id = v_id,
      answered_by = v_me,
      answered_at = now()
  where id = p_request_id;

  return v_id;
end;
$$;

-- 5. The clinic's name ------------------------------------------------------------

update public.clinics
set name = 'UP Counseling (EMDRAC)',
    name_km = 'ការប្រឹក្សា UP (EMDRAC)'
where slug = 'up-wellness-clinic';

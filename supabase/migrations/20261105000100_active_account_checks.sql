-- Removed or suspended people lose access in the database, not only in the app.
-- (Security audit 5 Nov 2026, finding H2.)
--
-- Why: anyone signed in can call Supabase directly with their own token, which
-- skips requireRole() in the API. Before this file a suspended admin still
-- passed is_admin(), and a suspended or demoted therapist could still read
-- client intake notes, session notes, messages and shared data.
--
-- Every function below is the live definition with only the new check added.
-- Clients keep reading their own records, even while suspended.

begin;

-- 1. Two small checks the rest of this file uses.

-- A signed in account that is not suspended.
create or replace function public.is_active_account()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.account_status = 'active'
  );
$$;

-- A professional or admin (admins can have a test profile) who is not suspended.
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
      and p.role in ('professional', 'admin')
  );
$$;

revoke all on function public.is_active_account() from public, anon;
revoke all on function public.is_active_staff() from public, anon;
grant execute on function public.is_active_account() to authenticated;
grant execute on function public.is_active_staff() to authenticated;

-- 2. Role checks used by policies and functions.

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and account_status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_verified_professional()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.professional_profiles pp
    join public.profiles p on p.id = pp.id
    where pp.id = (select auth.uid())
      and p.role = 'professional'
      and p.account_status = 'active'
      and pp.verification_status = 'verified'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id
      and user_id = (select auth.uid())
      and left_at is null
      and public.is_active_account()
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_group_mentor(p_group_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.support_groups
    where id = p_group_id and mentor_id = (select auth.uid())
      and public.is_active_staff()
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conversation_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.conversations c
    where c.id = p_conversation_id
      and (
        (select auth.uid()) = c.client_id
        or ((select auth.uid()) = c.professional_id and public.is_active_staff())
      )
  );
$function$;

CREATE OR REPLACE FUNCTION public.client_shares_with_me(p_client_id uuid, p_kind text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.appointments a
    where a.user_id = p_client_id
      and a.professional_id = (select auth.uid())
      and a.status in ('booked', 'completed')
      and public.is_active_staff()
      and case p_kind
            when 'survey' then a.share_survey
            when 'symptoms' then a.share_symptom_checks
            else false
          end
  );
$function$;

CREATE OR REPLACE FUNCTION public.owns_professional_appointment(p_appointment_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.appointments as a
    where a.id = p_appointment_id
      and a.professional_id = (select auth.uid())
      and public.is_active_staff()
  );
$function$;

CREATE OR REPLACE FUNCTION public.can_read_care_check_ins(p_task_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.care_tasks t
    where t.id = p_task_id
      and (
        t.client_id = (select auth.uid())
        or (
          t.professional_id = (select auth.uid())
          and public.is_active_staff()
          and exists (
            select 1 from public.care_sharing s
            where s.professional_id = t.professional_id
              and s.client_id = t.client_id
              and s.share_progress
          )
        )
      )
  );
$function$;

-- 3. The one place that turns a client alias into a real client. Every *_safe
-- function for professionals goes through it, so this covers them all.

CREATE OR REPLACE FUNCTION public.resolve_message_recipient(p_other uuid, p_as text)
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
  v_client uuid;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if p_as = 'client' then
    -- Clients already address professionals by their public profile ID.
    return p_other;
  elsif p_as = 'professional' then
    if not public.is_active_staff() then
      raise exception 'This professional account is not active.' using errcode = 'PT403';
    end if;
    select a.user_id into v_client
    from public.professional_client_aliases as a
    where a.professional_id = v_me
      and a.alias_id = p_other;

    if v_client is null then
      raise exception 'Conversation not found.'
        using errcode = 'PT404';
    end if;

    return v_client;
  end if;

  raise exception 'Unknown side.' using errcode = '22023';
end;
$function$;

-- 4. Therapist functions that read or change client records directly.

CREATE OR REPLACE FUNCTION public.read_my_pro_bookings_safe()
 RETURNS SETOF jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if (select auth.uid()) is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if not public.is_active_staff() then
    raise exception 'This professional account is not active.' using errcode = 'PT403';
  end if;
  if exists (
    select 1
    from public.appointments as a
    left join public.professional_client_aliases as alias
      on alias.professional_id = a.professional_id
     and alias.user_id = a.user_id
    where a.professional_id = (select auth.uid())
      and alias.alias_id is null
  ) then
    raise exception 'A booking is missing its client alias.'
      using errcode = 'PT409';
  end if;

  return query
    select jsonb_build_object(
      'id', a.id,
      'professionalId', pp.slug,
      'clientId', alias.alias_id,
      'clientName', public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Client'),
      'clientHidden', p.role = 'user' and coalesce(p.hide_identity, true),
      'clientLanguage', case
        when p.language::text = 'en' then 'en'
        else 'km'
      end,
      'startsAt', a.starts_at,
      'durationMinutes',
        round(extract(epoch from (a.ends_at - a.starts_at)) / 60)::integer,
      'sessionType', a.session_type,
      'status', a.status,
      -- Written by the client for this professional, so shown even when
      -- the client hides their identity.
      'intakeNote', coalesce(a.intake_note, ''),
      'intakeAnswers', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'question', jsonb_build_object(
              'en', ia.question_snapshot,
              'km', ia.question_snapshot
            ),
            'answer', case
              when jsonb_typeof(ia.answer) = 'string'
                then ia.answer #>> '{}'
              else ia.answer::text
            end
          )
          order by ia.created_at, ia.id
        )
        from public.intake_answers as ia
        where ia.appointment_id = a.id
      ), '[]'::jsonb),
      'cancelledBy', case
        when a.status <> 'cancelled' or a.cancelled_by is null
          then null::text
        when a.cancelled_by = a.user_id then 'client'
        when a.cancelled_by = a.professional_id then 'professional'
        else 'admin'
      end,
      'cancelReason', coalesce(a.cancel_reason, ''),
      'rescheduledFrom', a.rescheduled_from,
      'rescheduleReason', coalesce(a.reschedule_reason, ''),
      'rescheduledBy', case
        when a.rescheduled_from is null then null::text
        when a.rescheduled_by = a.user_id then 'client'
        else 'professional'
      end,
      'shareSurvey', a.share_survey,
      'shareSymptomChecks', a.share_symptom_checks,
      'shareMoodTrend', a.share_mood_trend,
      'meetingUrl', case
        when a.session_type = 'online' then a.meeting_url
        else null::text
      end,
      'seriesId', a.series_id
    )
    from public.appointments as a
    join public.professional_client_aliases as alias
      on alias.professional_id = a.professional_id
     and alias.user_id = a.user_id
    join public.profiles as p on p.id = a.user_id
    join public.professional_profiles as pp
      on pp.id = a.professional_id
    where a.professional_id = (select auth.uid())
    order by a.starts_at desc, a.id desc
    limit 500;
end;
$function$;

CREATE OR REPLACE FUNCTION public.read_pro_care_plan_safe()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
  v_slug text;
  v_result jsonb;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if not public.is_active_staff() then
    raise exception 'This professional account is not active.' using errcode = 'PT403';
  end if;
  select pp.slug into v_slug
  from public.professional_profiles as pp
  where pp.id = v_me;

  if not found then
    raise exception 'Professional profile not found.'
      using errcode = 'PT404';
  end if;

  with selected_tasks as (
    select t.*
    from public.care_tasks as t
    where t.professional_id = v_me
    order by t.created_at desc, t.id desc
    limit 1000
  )
  select jsonb_build_object(
    'slug', v_slug,

    'tasks', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'professional_id', t.professional_id,
          'client_id', a.alias_id,
          'appointment_id', t.appointment_id,
          'kind', t.kind,
          'mindguide_type', t.mindguide_type,
          'mindguide_item_id', t.mindguide_item_id,
          'title', t.title,
          'note', t.note,
          'repeat_days', t.repeat_days,
          'start_date', t.start_date,
          'end_date', t.end_date,
          'reminder_time', t.reminder_time,
          'created_at', t.created_at,
          'stopped_at', t.stopped_at
        )
        order by t.created_at desc, t.id desc
      )
      from selected_tasks as t
      join public.professional_client_aliases as a
        on a.professional_id = t.professional_id
       and a.user_id = t.client_id
    ), '[]'::jsonb),

    'checkIns', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'taskId', ci.task_id,
          'date', ci.check_date,
          'doneAt', ci.done_at
        )
        order by ci.check_date, ci.task_id
      )
      from public.care_check_ins as ci
      join selected_tasks as t on t.id = ci.task_id
      where public.can_read_care_check_ins(ci.task_id)
    ), '[]'::jsonb),

    'sharing', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'client_id', a.alias_id,
          'share_progress', s.share_progress
        )
        order by a.alias_id
      )
      from public.care_sharing as s
      join public.professional_client_aliases as a
        on a.professional_id = s.professional_id
       and a.user_id = s.client_id
      where s.professional_id = v_me
    ), '[]'::jsonb)
  )
  into v_result;

  return v_result;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_pro_booking_safe(p_appointment_id uuid, p_action text, p_status text DEFAULT NULL::text, p_meeting_url text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
  v_url text;
  v_count integer;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if not public.is_active_staff() then
    raise exception 'This professional account is not active.' using errcode = 'PT403';
  end if;
  if p_action = 'outcome' then
    if p_status = 'completed' then
      update public.appointments
      set status = 'completed'
      where id = p_appointment_id
        and professional_id = v_me;

    elsif p_status = 'no_show' then
      update public.appointments
      set status = 'no_show'
      where id = p_appointment_id
        and professional_id = v_me;

    else
      raise exception 'Invalid session outcome.'
        using errcode = '22023';
    end if;

    get diagnostics v_count = row_count;

  elsif p_action = 'meeting' then
    v_url := nullif(btrim(p_meeting_url), '');

    if v_url is not null and (
      char_length(v_url) > 500
      or v_url !~ '^https://[^[:space:]]+$'
    ) then
      raise exception 'Enter a valid HTTPS meeting link.'
        using errcode = '22023';
    end if;

    update public.appointments
    set meeting_url = v_url
    where id = p_appointment_id
      and professional_id = v_me;

    get diagnostics v_count = row_count;

  else
    raise exception 'Unknown booking action.'
      using errcode = '22023';
  end if;

  if v_count = 0 then
    raise exception 'Appointment not found.'
      using errcode = 'PT404';
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_pro_meeting_links_safe(p_old_url text, p_new_url text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
  v_new_url text := nullif(btrim(p_new_url), '');
  v_count integer;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if not public.is_active_staff() then
    raise exception 'This professional account is not active.' using errcode = 'PT403';
  end if;
  if v_new_url is not null and (
    char_length(v_new_url) > 500
    or v_new_url !~ '^https://[^[:space:]]+$'
  ) then
    raise exception 'Enter a valid HTTPS meeting link.'
      using errcode = '22023';
  end if;

  update public.appointments as a
  set meeting_url = v_new_url
  where a.professional_id = v_me
    and a.session_type = 'online'
    and a.status = 'booked'
    and a.starts_at > now()
    and (
      a.meeting_url is null
      or a.meeting_url = p_old_url
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$function$;

CREATE OR REPLACE FUNCTION public.reschedule_appointment(p_appointment_id uuid, p_slot_id uuid, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
  v_appointment public.appointments%rowtype;
  v_slot public.availability_slots%rowtype;
  v_reason text := nullif(trim(p_reason), '');
begin
  if not public.is_active_staff() then
    raise exception 'This professional account is not active.' using errcode = 'PT403';
  end if;
  if v_reason is null or char_length(v_reason) > 300 then
    raise exception 'Write a reason of up to 300 characters. The client will see it';
  end if;

  select * into v_appointment
  from public.appointments
  where id = p_appointment_id and professional_id = v_me
  for update;

  if not found then
    raise exception 'Appointment not found';
  end if;
  if v_appointment.status <> 'booked' or v_appointment.starts_at <= now() then
    raise exception 'Only upcoming sessions can be moved';
  end if;

  select * into v_slot
  from public.availability_slots
  where id = p_slot_id and professional_id = v_me
  for update;

  if not found or v_slot.is_booked or v_slot.starts_at <= now() then
    raise exception 'That time is no longer open';
  end if;
  if not (v_appointment.session_type = any (v_slot.session_types)) then
    raise exception 'That time does not offer this session type';
  end if;

  update public.appointments
  set slot_id = v_slot.id,
      starts_at = v_slot.starts_at,
      ends_at = v_slot.ends_at,
      rescheduled_from = coalesce(v_appointment.rescheduled_from, v_appointment.starts_at),
      reschedule_reason = v_reason,
      rescheduled_by = v_me
  where id = p_appointment_id;

  update public.availability_slots set is_booked = true where id = v_slot.id;
  if v_appointment.slot_id is not null then
    update public.availability_slots set is_booked = false where id = v_appointment.slot_id;
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.stop_care_task(p_task_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if not public.is_active_staff() then
    raise exception 'This professional account is not active.' using errcode = 'PT403';
  end if;
  update public.care_tasks t
  set stopped_at = coalesce(t.stopped_at, now())
  where t.id = p_task_id and t.professional_id = (select auth.uid());
  if not found then
    raise exception 'Task not found.' using errcode = 'PT404';
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.withdraw_session_suggestion(p_suggestion_id uuid)
 RETURNS session_suggestions
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_row public.session_suggestions;
begin
  if not public.is_active_staff() then
    raise exception 'This professional account is not active.' using errcode = 'PT403';
  end if;
  update public.session_suggestions s
  set status = 'withdrawn'
  where s.id = p_suggestion_id
    and s.professional_id = (select auth.uid())
    and s.status = 'open'
  returning * into v_row;
  if not found then
    raise exception 'This suggestion is no longer open.' using errcode = 'PT404';
  end if;
  return v_row;
end;
$function$;

CREATE OR REPLACE FUNCTION public.read_session_suggestions_safe(p_as text, p_ids uuid[] DEFAULT NULL::uuid[], p_open_only boolean DEFAULT false, p_limit integer DEFAULT 100)
 RETURNS SETOF session_suggestions
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
  v_row public.session_suggestions;
  v_alias uuid;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if p_as is null or p_as not in ('client', 'professional') then
    raise exception 'Unknown side.'
      using errcode = '22023';
  end if;

  if p_as = 'professional' and not public.is_active_staff() then
    raise exception 'This professional account is not active.' using errcode = 'PT403';
  end if;

  for v_row in
    select s.*
    from public.session_suggestions as s
    where (
      (p_as = 'client' and s.client_id = v_me)
      or
      (p_as = 'professional' and s.professional_id = v_me)
    )
      and (p_ids is null or s.id = any(p_ids))
      and (not coalesce(p_open_only, false) or s.status = 'open')
    order by s.created_at desc, s.id desc
    limit least(greatest(coalesce(p_limit, 100), 1), 300)
  loop
    if p_as = 'professional' then
      select a.alias_id into v_alias
      from public.professional_client_aliases as a
      where a.professional_id = v_me
        and a.user_id = v_row.client_id;

      if v_alias is null then
        raise exception 'Client alias not found.'
          using errcode = 'PT404';
      end if;

      v_row.client_id := v_alias;
    end if;

    return next v_row;
  end loop;

  return;
end;
$function$;

CREATE OR REPLACE FUNCTION public.shared_mood_checkins(p_client_id uuid)
 RETURNS TABLE(day date, mood mood_level)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select m.checked_in_on, m.mood
  from public.mood_checkins m
  where m.user_id = p_client_id
    and m.checked_in_on > public.cambodia_today() - 30
    and public.is_active_staff()
    and exists (
      select 1 from public.appointments a
      where a.user_id = p_client_id
        and a.professional_id = (select auth.uid())
        and a.status in ('booked', 'completed')
        and a.share_mood_trend
    )
  order by m.checked_in_on;
$function$;

CREATE OR REPLACE FUNCTION public.my_booking_client_aliases()
 RETURNS TABLE(appointment_id uuid, client_alias_id uuid, client_display_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select
    a.id,
    alias.alias_id,
    public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Client')
  from public.appointments as a
  join public.professional_client_aliases as alias
    on alias.professional_id = a.professional_id
   and alias.user_id = a.user_id
  join public.profiles as p on p.id = a.user_id
  where a.professional_id = (select auth.uid())
    and public.is_active_staff();
$function$;

CREATE OR REPLACE FUNCTION public.my_message_client_names()
 RETURNS TABLE(id uuid, full_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select
    a.alias_id,
    public.shown_name(p.role, p.hide_identity, p.full_name, p.nickname, 'Client')
  from public.professional_client_aliases as a
  join public.profiles as p on p.id = a.user_id
  where a.professional_id = (select auth.uid())
    and public.is_active_staff();
$function$;

CREATE OR REPLACE FUNCTION public.my_client_summary_notes_safe()
 RETURNS TABLE(client_alias_id uuid, content text, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select
    a.alias_id,
    n.content,
    n.updated_at
  from public.client_summary_notes as n
  join public.professional_client_aliases as a
    on a.professional_id = n.professional_id
   and a.user_id = n.client_id
  where n.professional_id = (select auth.uid())
    and public.is_active_staff();
$function$;

CREATE OR REPLACE FUNCTION public.my_archived_client_aliases()
 RETURNS TABLE(client_alias_id uuid)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select a.alias_id
  from public.conversations as c
  join public.professional_client_aliases as a
    on a.professional_id = c.professional_id
   and a.user_id = c.client_id
  where c.professional_id = (select auth.uid())
    and c.closed_at is not null
    and public.is_active_staff();
$function$;

CREATE OR REPLACE FUNCTION public.open_conversation(p_other uuid, p_as text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
  v_professional uuid;
  v_client uuid;
  v_id uuid;
  v_closed timestamptz;
begin
  if v_me is null then
    raise exception 'Please log in to continue.' using errcode = 'PT401';
  end if;

  if p_as = 'client' then
    v_professional := p_other;
    v_client := v_me;
  elsif p_as = 'professional' then
    if not public.is_active_staff() then
      raise exception 'This professional account is not active.' using errcode = 'PT403';
    end if;
    v_professional := v_me;
    v_client := p_other;
  else
    raise exception 'Unknown side.' using errcode = '22023';
  end if;

  if not public.can_message(v_professional, v_client) then
    raise exception 'Messages are open only after a booked session.' using errcode = 'PT403';
  end if;

  insert into public.conversations (professional_id, client_id)
  values (v_professional, v_client)
  on conflict (professional_id, client_id) do nothing;

  select c.id, c.closed_at into v_id, v_closed
  from public.conversations c
  where c.professional_id = v_professional and c.client_id = v_client;

  if v_closed is not null then
    raise exception 'This conversation is closed.' using errcode = 'PT409';
  end if;

  return v_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_client_archived(p_client_id uuid, p_archived boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null or not public.is_active_staff() or not exists (
    select 1 from public.appointments a
    where a.professional_id = v_me and a.user_id = p_client_id
  ) then
    raise exception 'Client not found.' using errcode = 'PT404';
  end if;

  insert into public.conversations (professional_id, client_id, closed_at)
  values (v_me, p_client_id, case when p_archived then now() end)
  on conflict (professional_id, client_id)
  do update set closed_at = case
    when p_archived then coalesce(public.conversations.closed_at, now())
  end;
end;
$function$;

-- 5. A suspended person cannot see their group chats list.

CREATE OR REPLACE FUNCTION public.my_group_chats()
 RETURNS TABLE(id uuid, name text, name_km text, concern text, description text, description_km text, max_members smallint, members_count integer, is_active boolean, last_content text, last_at timestamp with time zone, last_display_name text, last_is_own boolean, last_is_removed boolean, last_kind text, unread integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'Please sign in' using errcode = 'PT401';
  end if;

  if not public.is_active_account() then
    raise exception 'This account is suspended. Please contact AROM support.';
  end if;

  return query
    with mine as (
      select s.group_id, min(s.since) as since
      from (
        select gm.group_id, gm.joined_at as since
        from public.group_members as gm
        where gm.user_id = v_me and gm.left_at is null
        union all
        select g.id, g.created_at
        from public.support_groups as g
        where g.mentor_id = v_me
      ) as s
      group by s.group_id
    )
    select
      g.id,
      g.name,
      g.name_km,
      g.concern,
      g.description,
      g.description_km,
      g.max_members,
      (select count(*)::integer from public.group_members as c
        where c.group_id = g.id and c.left_at is null),
      g.is_active,
      case when lm.is_hidden then '' else lm.content end,
      lm.created_at,
      case
        when lm.id is null then null::text
        when lp.role = 'user' and coalesce(lp.hide_identity, true) then
          public.shown_name(lp.role, lp.hide_identity, lp.full_name, lp.nickname, 'Member')
            || case when lm.author_id = v_me then ' (You)' else '' end
        else coalesce(nullif(lp.full_name, ''), 'Member')
      end,
      lm.author_id = v_me,
      coalesce(lm.is_hidden, false),
      lm.kind,
      (select count(*)::integer from public.community_messages as u
        where u.group_id = g.id
          and u.author_id <> v_me
          and not u.is_hidden
          and u.created_at > greatest(m.since, coalesce(r.last_read_at, m.since)))
    from mine as m
    join public.support_groups as g on g.id = m.group_id
    left join public.group_reads as r on r.group_id = g.id and r.user_id = v_me
    left join lateral (
      select cm.id, cm.content, cm.created_at, cm.author_id, cm.is_hidden, cm.kind
      from public.community_messages as cm
      where cm.group_id = g.id
      order by cm.created_at desc, cm.id desc
      limit 1
    ) as lm on true
    left join public.profiles as lp on lp.id = lm.author_id
    order by lm.created_at desc nulls last, g.name;
end;
$function$;

-- 6. Session notes are read and written straight from the tables.

drop policy "Therapists read own session notes" on public.session_notes;
create policy "Therapists read own session notes"
  on public.session_notes for select to authenticated
  using (professional_id = (select auth.uid()) and public.is_active_staff());

drop policy "Therapists write notes for own sessions" on public.session_notes;
create policy "Therapists write notes for own sessions"
  on public.session_notes for insert to authenticated
  with check (professional_id = (select auth.uid()) and public.owns_professional_appointment(appointment_id));

drop policy "Therapists edit own session notes" on public.session_notes;
create policy "Therapists edit own session notes"
  on public.session_notes for update to authenticated
  using (professional_id = (select auth.uid()) and public.is_active_staff())
  with check (professional_id = (select auth.uid()) and public.is_active_staff());

drop policy "Therapists delete own session notes" on public.session_notes;
create policy "Therapists delete own session notes"
  on public.session_notes for delete to authenticated
  using (professional_id = (select auth.uid()) and public.is_active_staff());

drop policy "Professionals read own prep notes" on public.session_prep_notes;
create policy "Professionals read own prep notes"
  on public.session_prep_notes for select to authenticated
  using (professional_id = (select auth.uid()) and public.is_active_staff());

drop policy "Professionals write prep notes for own sessions" on public.session_prep_notes;
create policy "Professionals write prep notes for own sessions"
  on public.session_prep_notes for insert to authenticated
  with check (professional_id = (select auth.uid()) and public.owns_professional_appointment(appointment_id));

drop policy "Professionals edit own prep notes" on public.session_prep_notes;
create policy "Professionals edit own prep notes"
  on public.session_prep_notes for update to authenticated
  using (professional_id = (select auth.uid()) and public.is_active_staff())
  with check (professional_id = (select auth.uid()) and public.is_active_staff());

drop policy "Professionals delete own prep notes" on public.session_prep_notes;
create policy "Professionals delete own prep notes"
  on public.session_prep_notes for delete to authenticated
  using (professional_id = (select auth.uid()) and public.is_active_staff());

-- 7. Group messages were the one chat table without the suspended account check.

create trigger community_messages_block_suspended
  before insert on public.community_messages
  for each row execute function public.block_suspended_account();

commit;

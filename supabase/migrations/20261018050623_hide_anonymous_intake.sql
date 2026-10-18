begin;

create or replace function public.read_my_pro_bookings_safe()
returns setof jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
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
      'clientName', case
        when p.role = 'user' and coalesce(p.hide_identity, true)
          then 'Anonymous'
        else coalesce(nullif(btrim(p.full_name), ''), 'Client')
      end,
      'clientLanguage', case
        when p.language::text = 'en' then 'en'
        else 'km'
      end,
      'startsAt', a.starts_at,
      'durationMinutes',
        round(extract(epoch from (a.ends_at - a.starts_at)) / 60)::integer,
      'sessionType', a.session_type,
      'status', a.status,
      'intakeNote', case
  when p.role = 'user' and coalesce(p.hide_identity, true)
    then ''
  else coalesce(a.intake_note, '')
end,
      'intakeAnswers', case
  when p.role = 'user' and coalesce(p.hide_identity, true)
    then '[]'::jsonb
  else coalesce((
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
  ), '[]'::jsonb)
end,
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
      'shareSurvey', a.share_survey,
      'shareSymptomChecks', a.share_symptom_checks,
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
$$;

revoke execute on function public.read_my_pro_bookings_safe()
  from public, anon;

grant execute on function public.read_my_pro_bookings_safe()
  to authenticated;

notify pgrst, 'reload schema';

commit;
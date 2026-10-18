begin;

create or replace function public.set_appointment_sharing_safe(
  p_appointment_id uuid,
  p_share_survey boolean,
  p_share_symptom_checks boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_share_mood_trend boolean;
begin
  if p_share_survey is null or p_share_symptom_checks is null then
    raise exception 'Sharing choices are required.'
      using errcode = '22023';
  end if;

  select a.share_mood_trend
  into v_share_mood_trend
  from public.appointments as a
  where a.id = p_appointment_id
    and a.user_id = (select auth.uid())
  for update;

  if not found then
    raise exception 'Appointment not found.'
      using errcode = 'PT404';
  end if;

  perform public.set_appointment_sharing(
    p_appointment_id,
    p_share_survey,
    p_share_symptom_checks,
    v_share_mood_trend
  );
end;
$$;

revoke execute
  on function public.set_appointment_sharing_safe(uuid, boolean, boolean)
  from public, anon;

grant execute
  on function public.set_appointment_sharing_safe(uuid, boolean, boolean)
  to authenticated;

notify pgrst, 'reload schema';

commit;
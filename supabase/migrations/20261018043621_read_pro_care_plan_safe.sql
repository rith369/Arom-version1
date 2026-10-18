begin;

-- Cover older care records that might not have an alias yet.
insert into public.professional_client_aliases (
  professional_id,
  user_id
)
select professional_id, client_id
from public.care_tasks
union
select professional_id, client_id
from public.care_sharing
on conflict (professional_id, user_id) do nothing;

create or replace function public.read_pro_care_plan_safe()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_slug text;
  v_result jsonb;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
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
$$;

revoke execute on function public.read_pro_care_plan_safe()
  from public, anon;

grant execute on function public.read_pro_care_plan_safe()
  to authenticated;

notify pgrst, 'reload schema';

commit;
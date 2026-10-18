begin;

create or replace function public.give_care_task_safe(
  p_client_id uuid,
  p_appointment_id uuid,
  p_kind text,
  p_mindguide_type text,
  p_mindguide_item_id text,
  p_title text,
  p_note text,
  p_repeat_days smallint[],
  p_end_date date,
  p_reminder_time time without time zone
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client uuid;
begin
  v_client := public.resolve_message_recipient(
    p_client_id,
    'professional'
  );

  -- Preserve the original ownership, booking, and archive checks.
  -- Discard its raw task response.
  perform public.give_care_task(
    v_client,
    p_appointment_id,
    p_kind,
    p_mindguide_type,
    p_mindguide_item_id,
    p_title,
    p_note,
    p_repeat_days,
    p_end_date,
    p_reminder_time
  );
end;
$$;

revoke execute on function public.give_care_task_safe(
  uuid, uuid, text, text, text,
  text, text, smallint[], date, time without time zone
) from public, anon;

grant execute on function public.give_care_task_safe(
  uuid, uuid, text, text, text,
  text, text, smallint[], date, time without time zone
) to authenticated;

notify pgrst, 'reload schema';

commit;
begin;

create or replace function public.update_pro_booking_safe(
  p_appointment_id uuid,
  p_action text,
  p_status text default null,
  p_meeting_url text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_url text;
  v_count integer;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
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
$$;

revoke execute on function public.update_pro_booking_safe(
  uuid, text, text, text
) from public, anon;

grant execute on function public.update_pro_booking_safe(
  uuid, text, text, text
) to authenticated;

notify pgrst, 'reload schema';

commit;
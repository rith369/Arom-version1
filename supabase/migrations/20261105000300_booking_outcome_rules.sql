-- A cancelled booking cannot be turned back into a completed one.
-- (Security audit 5 Nov 2026, finding M1.)
--
-- Why: this function skipped the appointment guard, because it runs with its
-- own rights. A therapist could mark a cancelled booking completed, which gave
-- back the client's shared data and reopened messaging.
--
-- An outcome now needs a booked session that has ended. The Bookings screen
-- only offers the outcome buttons in that case, so nobody using it sees a change.

begin;

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
    if p_status is null or p_status not in ('completed', 'no_show') then
      raise exception 'Invalid session outcome.'
        using errcode = '22023';
    end if;

    update public.appointments
    set status = p_status::public.appointment_status
    where id = p_appointment_id
      and professional_id = v_me
      and status = 'booked'
      and ends_at <= now();

    get diagnostics v_count = row_count;

    if v_count = 0 and exists (
      select 1 from public.appointments
      where id = p_appointment_id and professional_id = v_me
    ) then
      raise exception 'You can save an outcome only for a booked session that has ended.';
    end if;

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

commit;

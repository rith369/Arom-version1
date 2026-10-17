-- AROM: admin Bookings page and chart (BACKEND-HANDOFF.md section 12).
--
--   1. admin_list_bookings(from): bookings that start or were made since
--      `from`, for the chart and the table. Never the client: no user id,
--      no name, no intake note, no meeting link. A cancel reason is returned
--      only when an admin wrote it, because a client's or professional's
--      reason can be personal.
--   2. admin_cancel_booking(id, reason): emergency cancel of an upcoming
--      booked session, for example when a professional is suspended. Frees
--      the open time and writes the audit log.

create or replace function public.admin_list_bookings(p_from date)
returns table (
  id uuid,
  professional_slug text,
  professional_name text,
  professional_name_km text,
  starts_at timestamptz,
  ends_at timestamptz,
  session_type public.session_type,
  status public.appointment_status,
  created_at timestamptz,
  cancelled_by_role text,
  admin_cancel_reason text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can see bookings';
  end if;

  return query
    select
      a.id,
      p.slug,
      p.display_name,
      p.display_name_km,
      a.starts_at,
      a.ends_at,
      a.session_type,
      a.status,
      a.created_at,
      case
        when a.cancelled_by is null then null
        when a.cancelled_by = a.user_id then 'user'
        when a.cancelled_by = a.professional_id then 'professional'
        else 'admin'
      end,
      case
        when a.cancelled_by is not null
          and a.cancelled_by not in (a.user_id, a.professional_id)
        then a.cancel_reason
      end
    from public.appointments a
    join public.professional_profiles p on p.id = a.professional_id
    where a.starts_at >= p_from::timestamptz - interval '7 hours'
       or a.created_at >= p_from::timestamptz - interval '7 hours'
    order by a.starts_at
    limit 5000;
end;
$$;

revoke execute on function public.admin_list_bookings(date) from public, anon;
grant execute on function public.admin_list_bookings(date) to authenticated;

create or replace function public.admin_cancel_booking(p_appointment_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_reason text := trim(coalesce(p_reason, ''));
  v_appointment public.appointments%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can cancel a booking';
  end if;
  if char_length(v_reason) = 0 or char_length(v_reason) > 500 then
    raise exception 'Write a reason of up to 500 characters';
  end if;

  select * into v_appointment
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception 'Booking not found';
  end if;
  if v_appointment.status <> 'booked' or v_appointment.starts_at <= now() then
    raise exception 'Only upcoming sessions can be cancelled';
  end if;

  update public.appointments
  set status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = v_admin,
      cancel_reason = v_reason
  where id = p_appointment_id;

  if v_appointment.slot_id is not null then
    update public.availability_slots set is_booked = false where id = v_appointment.slot_id;
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (v_admin, 'cancel_booking', 'appointments', p_appointment_id, jsonb_build_object('reason', v_reason));
end;
$$;

revoke execute on function public.admin_cancel_booking(uuid, text) from public, anon;
grant execute on function public.admin_cancel_booking(uuid, text) to authenticated;

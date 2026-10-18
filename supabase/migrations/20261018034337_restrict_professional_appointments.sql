begin;

create or replace function public.owns_professional_appointment(
  p_appointment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.appointments as a
    where a.id = p_appointment_id
      and a.professional_id = (select auth.uid())
  );
$$;

revoke execute
  on function public.owns_professional_appointment(uuid)
  from public, anon;

grant execute
  on function public.owns_professional_appointment(uuid)
  to authenticated;

-- Preserve session-note creation using the protected ownership check.
alter policy "Therapists write notes for own sessions"
  on public.session_notes
  with check (
    professional_id = (select auth.uid())
    and public.owns_professional_appointment(appointment_id)
  );

-- Preserve preparation-note creation too.
alter policy "Professionals write prep notes for own sessions"
  on public.session_prep_notes
  with check (
    professional_id = (select auth.uid())
    and public.owns_professional_appointment(appointment_id)
  );

-- Professional reads and updates now use protected functions.
drop policy "Professionals read their appointments"
  on public.appointments;

drop policy "Professionals update their appointments"
  on public.appointments;

-- This unused function returns real client account IDs.
revoke execute on function public.my_client_names()
  from public, anon, authenticated;

notify pgrst, 'reload schema';

commit;
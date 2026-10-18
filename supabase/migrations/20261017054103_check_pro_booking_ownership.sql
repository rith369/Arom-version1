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

notify pgrst, 'reload schema';

commit;
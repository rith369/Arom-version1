create or replace function public.my_booking_client_aliases()
returns table (
  appointment_id uuid,
  client_alias_id uuid,
  client_display_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.id as appointment_id,
    alias.alias_id as client_alias_id,
    case
      when p.hide_identity then 'Anonymous'
      else coalesce(nullif(p.full_name, ''), 'Client')
    end as client_display_name
  from public.appointments as a
  join public.professional_client_aliases as alias
    on alias.professional_id = a.professional_id
   and alias.user_id = a.user_id
  join public.profiles as p
    on p.id = a.user_id
  where a.professional_id = (select auth.uid());
$$;

revoke execute on function public.my_booking_client_aliases()
  from public, anon;

grant execute on function public.my_booking_client_aliases()
  to authenticated;
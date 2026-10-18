begin;

-- Preserve anonymity previously enabled through the older field.
update public.profiles
set hide_identity = true
where role = 'user'
  and privacy_mode = 'anonymous'
  and hide_identity is distinct from true;

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
    a.id,
    alias.alias_id,
    case
      when p.role = 'user'
        and coalesce(p.hide_identity, true)
        then 'Anonymous'
      else coalesce(nullif(btrim(p.full_name), ''), 'Client')
    end
  from public.appointments as a
  join public.professional_client_aliases as alias
    on alias.professional_id = a.professional_id
   and alias.user_id = a.user_id
  join public.profiles as p on p.id = a.user_id
  where a.professional_id = (select auth.uid());
$$;

create or replace function public.my_client_names()
returns table (
  id uuid,
  full_name text,
  language text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    case
      when p.role = 'user'
        and coalesce(p.hide_identity, true)
        then null::text
      else p.full_name
    end,
    p.language::text
  from public.profiles as p
  where exists (
    select 1
    from public.appointments as a
    where a.user_id = p.id
      and a.professional_id = (select auth.uid())
  );
$$;

revoke execute on function public.my_booking_client_aliases()
  from public, anon;

grant execute on function public.my_booking_client_aliases()
  to authenticated;

revoke execute on function public.my_client_names()
  from public, anon;

grant execute on function public.my_client_names()
  to authenticated;

notify pgrst, 'reload schema';

commit;
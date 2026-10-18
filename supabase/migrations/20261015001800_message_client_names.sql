begin;

create or replace function public.my_message_client_names()
returns table (
  id uuid,
  full_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.alias_id,
    case
      when p.role = 'user'
        and coalesce(p.hide_identity, true)
        then 'Anonymous'
      else coalesce(nullif(btrim(p.full_name), ''), 'Client')
    end
  from public.professional_client_aliases as a
  join public.profiles as p on p.id = a.user_id
  where a.professional_id = (select auth.uid());
$$;

revoke execute on function public.my_message_client_names()
  from public, anon;

grant execute on function public.my_message_client_names()
  to authenticated;

commit;
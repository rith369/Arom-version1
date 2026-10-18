create or replace function public.my_client_names()
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    case
      when p.hide_identity then 'Anonymous'
      else coalesce(nullif(p.full_name, ''), 'Client')
    end as full_name
  from public.profiles as p
  where exists (
    select 1
    from public.appointments as a
    where a.user_id = p.id
      and a.professional_id = (select auth.uid())
  );
$$;
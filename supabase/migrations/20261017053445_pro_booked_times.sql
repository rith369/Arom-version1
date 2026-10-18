begin;

create or replace function public.my_upcoming_booked_times()
returns table (
  starts_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.starts_at
  from public.appointments as a
  where a.professional_id = (select auth.uid())
    and a.status = 'booked'
    and a.ends_at >= now()
  order by a.starts_at;
$$;

revoke execute on function public.my_upcoming_booked_times()
  from public, anon;

grant execute on function public.my_upcoming_booked_times()
  to authenticated;

notify pgrst, 'reload schema';

commit;
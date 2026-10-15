create table public.professional_client_aliases (
  professional_id uuid not null
    references public.professional_profiles (id) on delete cascade,
  user_id uuid not null
    references public.profiles (id) on delete cascade,
  alias_id uuid not null default gen_random_uuid() unique,
  primary key (professional_id, user_id)
);

-- No client or professional can query this identity mapping directly.
alter table public.professional_client_aliases enable row level security;
revoke all on public.professional_client_aliases from anon, authenticated;

-- Give existing bookings a stable alias.
insert into public.professional_client_aliases (professional_id, user_id)
select distinct professional_id, user_id
from public.appointments
on conflict (professional_id, user_id) do nothing;

-- Give future bookings an alias automatically.
create or replace function public.ensure_professional_client_alias()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.professional_client_aliases (professional_id, user_id)
  values (new.professional_id, new.user_id)
  on conflict (professional_id, user_id) do nothing;

  return new;
end;
$$;

create trigger appointments_ensure_client_alias
  after insert on public.appointments
  for each row execute function public.ensure_professional_client_alias();

revoke execute on function public.ensure_professional_client_alias()
  from public, anon, authenticated;
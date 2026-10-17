-- AROM: the AROM support contact shown in Get help now (BACKEND-HANDOFF.md
-- section 13). One row. Everyone reads it, signed out visitors included;
-- only admins change it, through save_support_contact(), audit logged.
-- It is for app questions, not emergencies: helplines are crisis_resources.

create table public.support_contact (
  id boolean primary key default true check (id),
  email text not null default '' check (email = '' or (char_length(email) <= 254 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')),
  phone text not null default '' check (phone = '' or regexp_replace(phone, '[\s().-]', '', 'g') ~ '^\+?\d{3,15}$'),
  hours text not null default '' check (char_length(hours) <= 200),
  hours_km text not null default '' check (char_length(hours_km) <= 250),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

insert into public.support_contact (id) values (true);

alter table public.support_contact enable row level security;
revoke all on public.support_contact from anon, authenticated;
grant select on public.support_contact to anon, authenticated;

create policy "Anyone reads the support contact"
  on public.support_contact for select to anon, authenticated
  using (true);

create or replace function public.save_support_contact(
  p_email text,
  p_phone text,
  p_hours text,
  p_hours_km text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change the support contact';
  end if;

  update public.support_contact
  set email = trim(coalesce(p_email, '')),
      phone = trim(coalesce(p_phone, '')),
      hours = trim(coalesce(p_hours, '')),
      hours_km = trim(coalesce(p_hours_km, '')),
      updated_at = now(),
      updated_by = v_admin
  where id;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    v_admin,
    'save_support_contact',
    'support_contact',
    null,
    jsonb_build_object('email', trim(coalesce(p_email, '')), 'phone', trim(coalesce(p_phone, '')))
  );
end;
$$;

revoke execute on function public.save_support_contact(text, text, text, text) from public, anon;
grant execute on function public.save_support_contact(text, text, text, text) to authenticated;

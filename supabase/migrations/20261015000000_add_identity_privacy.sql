alter table public.profiles
add column if not exists hide_identity boolean not null default true;
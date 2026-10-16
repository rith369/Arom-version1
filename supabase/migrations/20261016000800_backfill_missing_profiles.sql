-- AROM: every account has a profile.
--
-- Accounts created while the sign up trigger was missing have no row in
-- profiles. They can sign in, but every write that points at profiles fails,
-- for example booking ("appointments_user_id_fkey").
--
--   1. Create the missing profiles, the same way handle_new_user() does
--      (role user, name and language from the sign up details).
--   2. Make sure the sign up trigger exists, so it cannot happen again.
-- Safe to run more than once.

insert into public.profiles (id, full_name, language)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  case when u.raw_user_meta_data ->> 'language' in ('en', 'km')
    then (u.raw_user_meta_data ->> 'language')::public.app_language
    else 'en'
  end
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

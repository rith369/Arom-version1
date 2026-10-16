-- Private profile details and photos, visible only to the account holder.
alter table public.profiles
  add column pronouns text check (pronouns is null or char_length(pronouns) <= 60),
  add column about_me text check (about_me is null or char_length(about_me) <= 280),
  add column avatar_path text,
  add constraint profiles_avatar_path_owner_check check (
    avatar_path is null
    or split_part(avatar_path, '/', 1) = id::text
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-profile-photos',
  'user-profile-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Users upload own profile photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users read own profile photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'user-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users delete own profile photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'user-profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

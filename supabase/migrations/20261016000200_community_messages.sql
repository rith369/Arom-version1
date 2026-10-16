create table public.community_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.support_groups (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index community_messages_group_time_idx
  on public.community_messages (group_id, created_at desc);

alter table public.community_messages enable row level security;

revoke all on public.community_messages from anon;
grant select, insert on public.community_messages to authenticated;

-- Raw rows contain author_id. Only the author and admin can read them.
create policy "Authors and admins read raw messages"
  on public.community_messages for select to authenticated
  using (author_id = (select auth.uid()) or public.is_admin());

create policy "Group members and mentors send messages"
  on public.community_messages for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and is_hidden = false
    and (
      public.is_group_member(group_id)
      or public.is_group_mentor(group_id)
    )
  );
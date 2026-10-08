-- AROM 5 of 6: small support groups (max 10 members, 1 mentor).
-- Mentors are verified professionals. Seekers cannot create groups.
-- Members appear to each other only as "Member 03", never by name.

create type public.flag_status as enum ('open', 'reviewing', 'resolved');

-- ---------------------------------------------------------------------------
-- support_groups
-- ---------------------------------------------------------------------------
create table public.support_groups (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.professional_profiles (id) on delete restrict,
  name text not null check (char_length(name) <= 120),
  name_km text,
  concern text not null,
  description text,
  description_km text,
  max_members smallint not null default 10 check (max_members between 2 and 10),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index support_groups_mentor_idx on public.support_groups (mentor_id);
create index support_groups_concern_idx on public.support_groups (concern) where is_active;

create trigger support_groups_set_updated_at
  before update on public.support_groups
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- group_members: who is in which group. Joined and left only through
-- join_support_group() and leave_support_group().
-- ---------------------------------------------------------------------------
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.support_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  member_number smallint not null check (member_number between 1 and 10),
  joined_at timestamptz not null default now(),
  left_at timestamptz
);

create unique index group_members_active_user_uidx
  on public.group_members (group_id, user_id)
  where left_at is null;

create unique index group_members_active_number_uidx
  on public.group_members (group_id, member_number)
  where left_at is null;

create index group_members_user_idx on public.group_members (user_id) where left_at is null;

create table public.group_waitlist (
  group_id uuid not null references public.support_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index group_waitlist_user_idx on public.group_waitlist (user_id);

-- ---------------------------------------------------------------------------
-- Group helpers (security definer so policies do not recurse).
-- ---------------------------------------------------------------------------
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id
      and user_id = (select auth.uid())
      and left_at is null
  );
$$;

create or replace function public.is_group_mentor(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.support_groups
    where id = p_group_id and mentor_id = (select auth.uid())
  );
$$;

-- Lets anyone see "8 / 10 members" without seeing who the members are.
create or replace function public.get_group_member_count(p_group_id uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.group_members
  where group_id = p_group_id and left_at is null;
$$;

create or replace function public.join_support_group(p_group_id uuid)
returns smallint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_group public.support_groups%rowtype;
  v_count integer;
  v_number smallint;
begin
  if v_user is null then
    raise exception 'Please sign in to join a group';
  end if;

  -- Lock the group row so two people cannot take the last seat together.
  select * into v_group
  from public.support_groups
  where id = p_group_id and is_active
  for update;

  if not found then
    raise exception 'This group is not available';
  end if;
  if v_group.mentor_id = v_user then
    raise exception 'You already lead this group as its mentor';
  end if;

  select member_number into v_number
  from public.group_members
  where group_id = p_group_id and user_id = v_user and left_at is null;
  if found then
    return v_number;
  end if;

  select count(*) into v_count
  from public.group_members
  where group_id = p_group_id and left_at is null;
  if v_count >= v_group.max_members then
    raise exception 'This group is currently full';
  end if;

  select min(n)::smallint into v_number
  from generate_series(1, v_group.max_members) as n
  where n not in (
    select member_number from public.group_members
    where group_id = p_group_id and left_at is null
  );

  insert into public.group_members (group_id, user_id, member_number)
  values (p_group_id, v_user, v_number);

  delete from public.group_waitlist where group_id = p_group_id and user_id = v_user;

  return v_number;
end;
$$;

create or replace function public.leave_support_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.group_members
  set left_at = now()
  where group_id = p_group_id
    and user_id = (select auth.uid())
    and left_at is null;
end;
$$;

revoke execute on function public.join_support_group(uuid) from public, anon;
revoke execute on function public.leave_support_group(uuid) from public, anon;
revoke execute on function public.get_group_member_count(uuid) from public, anon;
grant execute on function public.join_support_group(uuid) to authenticated;
grant execute on function public.leave_support_group(uuid) to authenticated;
grant execute on function public.get_group_member_count(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- group_discussions: the mentor's daily question or guided activity.
-- ---------------------------------------------------------------------------
create table public.group_discussions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.support_groups (id) on delete cascade,
  mentor_id uuid not null references public.professional_profiles (id) on delete cascade,
  kind text not null default 'discussion' check (kind in ('discussion', 'activity')),
  prompt text not null check (char_length(prompt) <= 1000),
  prompt_km text,
  discussion_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index group_discussions_group_idx
  on public.group_discussions (group_id, discussion_date desc);

-- ---------------------------------------------------------------------------
-- discussion_replies: the label fields are filled by a trigger, so the
-- app shows "Member 03" or the mentor's name in English or Khmer.
-- ---------------------------------------------------------------------------
create table public.discussion_replies (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.group_discussions (id) on delete cascade,
  group_id uuid not null references public.support_groups (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  is_mentor boolean not null default false,
  author_member_number smallint,
  author_mentor_name text,
  content text not null check (char_length(content) between 1 and 2000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index discussion_replies_discussion_idx
  on public.discussion_replies (discussion_id, created_at);
create index discussion_replies_group_idx on public.discussion_replies (group_id);

create or replace function public.prepare_discussion_reply()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.group_id := (
    select group_id from public.group_discussions where id = new.discussion_id
  );
  new.author_id := coalesce((select auth.uid()), new.author_id);
  new.is_hidden := false;

  if exists (
    select 1 from public.support_groups
    where id = new.group_id and mentor_id = new.author_id
  ) then
    new.is_mentor := true;
    new.author_member_number := null;
    new.author_mentor_name := (
      select display_name from public.professional_profiles where id = new.author_id
    );
  else
    new.is_mentor := false;
    new.author_mentor_name := null;
    new.author_member_number := (
      select member_number from public.group_members
      where group_id = new.group_id and user_id = new.author_id and left_at is null
    );
  end if;

  return new;
end;
$$;

create trigger discussion_replies_prepare
  before insert on public.discussion_replies
  for each row execute function public.prepare_discussion_reply();

revoke execute on function public.prepare_discussion_reply() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- group_checkins: "How are you feeling today?" inside a group.
-- Visible to the member and their mentor only.
-- ---------------------------------------------------------------------------
create table public.group_checkins (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.support_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  mood text not null check (mood in ('difficult', 'okay', 'better', 'good')),
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create index group_checkins_group_idx on public.group_checkins (group_id, created_at desc);
create index group_checkins_user_idx on public.group_checkins (user_id);

-- ---------------------------------------------------------------------------
-- safety_flags: a mentor or member raises a concern for an admin to follow up.
-- ---------------------------------------------------------------------------
create table public.safety_flags (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.support_groups (id) on delete set null,
  subject_user_id uuid references public.profiles (id) on delete set null,
  reported_by uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (
    reason in ('self_harm_risk', 'harmful_content', 'harassment', 'other')
  ),
  details text check (char_length(details) <= 2000),
  status public.flag_status not null default 'open',
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index safety_flags_status_idx on public.safety_flags (status, created_at desc);
create index safety_flags_reporter_idx on public.safety_flags (reported_by);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.support_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_waitlist enable row level security;
alter table public.group_discussions enable row level security;
alter table public.discussion_replies enable row level security;
alter table public.group_checkins enable row level security;
alter table public.safety_flags enable row level security;

-- support_groups
create policy "Signed in users read active groups"
  on public.support_groups for select to authenticated
  using (is_active or mentor_id = (select auth.uid()) or public.is_admin());

create policy "Verified professionals create groups"
  on public.support_groups for insert to authenticated
  with check (mentor_id = (select auth.uid()) and public.is_verified_professional());

create policy "Mentors update own groups"
  on public.support_groups for update to authenticated
  using (mentor_id = (select auth.uid()) or public.is_admin())
  with check (mentor_id = (select auth.uid()) or public.is_admin());

create policy "Mentors delete own groups"
  on public.support_groups for delete to authenticated
  using (mentor_id = (select auth.uid()) or public.is_admin());

-- group_members: you see your own membership, mentors see their group
create policy "Members read own memberships"
  on public.group_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Mentors read their group members"
  on public.group_members for select to authenticated
  using (public.is_group_mentor(group_id) or public.is_admin());

-- group_waitlist
create policy "Users read own waitlist spots"
  on public.group_waitlist for select to authenticated
  using (user_id = (select auth.uid()) or public.is_group_mentor(group_id));

create policy "Users join a waitlist"
  on public.group_waitlist for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users leave a waitlist"
  on public.group_waitlist for delete to authenticated
  using (user_id = (select auth.uid()));

-- group_discussions
create policy "Members read group discussions"
  on public.group_discussions for select to authenticated
  using (public.is_group_member(group_id) or public.is_group_mentor(group_id) or public.is_admin());

create policy "Mentors post discussions"
  on public.group_discussions for insert to authenticated
  with check (mentor_id = (select auth.uid()) and public.is_group_mentor(group_id));

create policy "Mentors edit discussions"
  on public.group_discussions for update to authenticated
  using (public.is_group_mentor(group_id))
  with check (mentor_id = (select auth.uid()) and public.is_group_mentor(group_id));

create policy "Mentors delete discussions"
  on public.group_discussions for delete to authenticated
  using (public.is_group_mentor(group_id) or public.is_admin());

-- discussion_replies
create policy "Members read visible replies"
  on public.discussion_replies for select to authenticated
  using (
    (public.is_group_member(group_id) and not is_hidden)
    or author_id = (select auth.uid())
    or public.is_group_mentor(group_id)
    or public.is_admin()
  );

create policy "Members and mentors reply"
  on public.discussion_replies for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (public.is_group_member(group_id) or public.is_group_mentor(group_id))
  );

create policy "Mentors hide replies"
  on public.discussion_replies for update to authenticated
  using (public.is_group_mentor(group_id) or public.is_admin())
  with check (public.is_group_mentor(group_id) or public.is_admin());

create policy "Authors and mentors delete replies"
  on public.discussion_replies for delete to authenticated
  using (
    author_id = (select auth.uid())
    or public.is_group_mentor(group_id)
    or public.is_admin()
  );

-- group_checkins
create policy "Members read own check-ins"
  on public.group_checkins for select to authenticated
  using (user_id = (select auth.uid()) or public.is_group_mentor(group_id));

create policy "Members add check-ins"
  on public.group_checkins for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_group_member(group_id));

create policy "Members delete own check-ins"
  on public.group_checkins for delete to authenticated
  using (user_id = (select auth.uid()));

-- safety_flags
create policy "Users raise a safety flag"
  on public.safety_flags for insert to authenticated
  with check (reported_by = (select auth.uid()) and status = 'open');

create policy "Reporters and admins read flags"
  on public.safety_flags for select to authenticated
  using (reported_by = (select auth.uid()) or public.is_admin());

create policy "Admins manage flags"
  on public.safety_flags for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

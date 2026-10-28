-- Understand yourself, "My self map". BACKEND-HANDOFF.md section 38.
--
-- Rith decided (28 Oct 2026): for new and existing users, and the person may
-- share their self map with a professional they have booked. Self knowledge,
-- never a diagnosis. Admins have no access.
--
-- self_map_parts: one row per person and part ("values" or "coping"). Saving
-- again keeps the answers before it in previous_answers, so the app can show
-- what changed. The API checks the answer shape (lib/self-map.ts); the table
-- only checks the part, the JSON type and the size.
--
-- self_map_shares: one row per person and professional they share with. A
-- share can be made only with a professional the person has a booked or
-- completed session with, and can be removed at any time. The professional
-- reads the whole self map (both parts) while the share exists.
--
-- Nobody reads or writes either table directly. Everything goes through the
-- security definer functions below.

begin;

create table public.self_map_parts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  part text not null check (part in ('values', 'coping')),
  answers jsonb not null check (jsonb_typeof(answers) in ('object', 'array') and pg_column_size(answers) < 4000),
  previous_answers jsonb check (previous_answers is null or pg_column_size(previous_answers) < 4000),
  previous_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, part)
);

create table public.self_map_shares (
  client_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (client_id, professional_id),
  check (client_id <> professional_id)
);

alter table public.self_map_parts enable row level security;
alter table public.self_map_shares enable row level security;
-- No policies on purpose: no direct reads or writes for anyone.
revoke all on table public.self_map_parts from public, anon, authenticated;
revoke all on table public.self_map_shares from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- The person: read, save and delete their own parts.
-- ---------------------------------------------------------------------------
create or replace function public.my_self_map()
returns table (
  part text,
  answers jsonb,
  previous_answers jsonb,
  previous_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.part, s.answers, s.previous_answers, s.previous_at, s.updated_at
  from public.self_map_parts as s
  where s.user_id = (select auth.uid());
$$;

create or replace function public.save_self_map_part(p_part text, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'Please log in to continue.' using errcode = 'PT401';
  end if;

  if p_part not in ('values', 'coping')
    or p_answers is null
    or (p_part = 'values' and jsonb_typeof(p_answers) <> 'object')
    or (p_part = 'coping' and (jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> 28))
  then
    raise exception 'Please answer the questions again.' using errcode = '22023';
  end if;

  insert into public.self_map_parts as s (user_id, part, answers)
  values (v_me, p_part, p_answers)
  on conflict (user_id, part)
  do update set
    previous_answers = s.answers,
    previous_at = s.updated_at,
    answers = excluded.answers,
    updated_at = now();
end;
$$;

-- Deletes the part, including the answers before it.
create or replace function public.delete_self_map_part(p_part text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'Please log in to continue.' using errcode = 'PT401';
  end if;

  delete from public.self_map_parts as s
  where s.user_id = v_me
    and s.part = p_part;
end;
$$;

-- ---------------------------------------------------------------------------
-- The person: who can see it. One row per professional with a booked or
-- completed session, or an existing share.
-- ---------------------------------------------------------------------------
create or replace function public.my_self_map_shares()
returns table (
  professional_slug text,
  display_name text,
  display_name_km text,
  photo_url text,
  shared boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with mine as (
    select distinct a.professional_id
    from public.appointments as a
    where a.user_id = (select auth.uid())
      and a.professional_id is not null
      and a.status in ('booked', 'completed')
    union
    select sh.professional_id
    from public.self_map_shares as sh
    where sh.client_id = (select auth.uid())
  )
  select
    p.slug,
    p.display_name,
    p.display_name_km,
    p.photo_url,
    exists (
      select 1
      from public.self_map_shares as sh
      where sh.client_id = (select auth.uid())
        and sh.professional_id = p.id
    )
  from mine
  join public.professional_profiles as p on p.id = mine.professional_id
  where p.id <> (select auth.uid())
  order by p.display_name;
$$;

create or replace function public.set_self_map_share(p_professional_slug text, p_share boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_professional uuid;
begin
  if v_me is null then
    raise exception 'Please log in to continue.' using errcode = 'PT401';
  end if;

  select p.id into v_professional
  from public.professional_profiles as p
  where p.slug = p_professional_slug;

  if v_professional is null then
    raise exception 'Not found.' using errcode = 'PT404';
  end if;

  if not coalesce(p_share, false) then
    delete from public.self_map_shares as sh
    where sh.client_id = v_me
      and sh.professional_id = v_professional;
    return;
  end if;

  if v_professional = v_me
    or not exists (
      select 1
      from public.appointments as a
      where a.user_id = v_me
        and a.professional_id = v_professional
        and a.status in ('booked', 'completed')
    )
  then
    raise exception 'You can share with a professional you have booked.' using errcode = 'PT403';
  end if;

  insert into public.self_map_shares (client_id, professional_id)
  values (v_me, v_professional)
  on conflict (client_id, professional_id) do nothing;
end;
$$;

-- ---------------------------------------------------------------------------
-- Professional: read one client's self map, by the client alias the
-- professional sees (section 29). Null when the client does not share it.
-- ---------------------------------------------------------------------------
create or replace function public.pro_client_self_map_safe(p_client_alias_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_client uuid;
begin
  v_client := public.resolve_message_recipient(p_client_alias_id, 'professional');

  if not exists (
    select 1
    from public.self_map_shares as sh
    where sh.client_id = v_client
      and sh.professional_id = (select auth.uid())
  ) then
    return null;
  end if;

  return coalesce(
    (
      select jsonb_object_agg(s.part, jsonb_build_object('answers', s.answers, 'updatedAt', s.updated_at))
      from public.self_map_parts as s
      where s.user_id = v_client
    ),
    '{}'::jsonb
  );
end;
$$;

revoke execute on function public.my_self_map() from public, anon;
revoke execute on function public.save_self_map_part(text, jsonb) from public, anon;
revoke execute on function public.delete_self_map_part(text) from public, anon;
revoke execute on function public.my_self_map_shares() from public, anon;
revoke execute on function public.set_self_map_share(text, boolean) from public, anon;
revoke execute on function public.pro_client_self_map_safe(uuid) from public, anon;

grant execute on function public.my_self_map() to authenticated;
grant execute on function public.save_self_map_part(text, jsonb) to authenticated;
grant execute on function public.delete_self_map_part(text) to authenticated;
grant execute on function public.my_self_map_shares() to authenticated;
grant execute on function public.set_self_map_share(text, boolean) to authenticated;
grant execute on function public.pro_client_self_map_safe(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;

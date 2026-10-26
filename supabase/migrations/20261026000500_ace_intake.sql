-- ACE (Adverse Childhood Experiences) as part of the therapist intake.
-- BACKEND-HANDOFF.md section 37.
--
-- Rith decided (26 Oct 2026): ACE is never a self check. A professional turns
-- it on for their clients; a client with an upcoming session with that
-- professional may answer the 10 yes or no questions (each can be skipped),
-- and only that professional reads the answers. Admins have no access.
-- Khmer wording: EMDR Association Cambodia (with permission).
--
-- One row per client and professional: ACE asks about the past, so the
-- answers do not change between sessions. The client can change them before
-- a session and delete them at any time.
--
-- Nobody reads or writes the table directly. Everything goes through the
-- security definer functions below.

begin;

alter table public.professional_profiles
  add column if not exists ask_ace boolean not null default false;

create table public.ace_intakes (
  client_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  -- 10 answers in question order: true yes, false no, null skipped.
  answers boolean[] not null check (cardinality(answers) = 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (client_id, professional_id),
  check (client_id <> professional_id)
);

alter table public.ace_intakes enable row level security;
-- No policies on purpose: no direct reads or writes for anyone.
revoke all on table public.ace_intakes from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Professional: turn the questions on or off, and read the setting.
-- ---------------------------------------------------------------------------
create or replace function public.set_ask_ace(p_ask boolean)
returns boolean
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

  update public.professional_profiles
  set ask_ace = coalesce(p_ask, false)
  where id = v_me;

  if not found then
    raise exception 'Only professionals can change this.' using errcode = 'PT403';
  end if;

  return coalesce(p_ask, false);
end;
$$;

create or replace function public.my_ask_ace()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.ask_ace from public.professional_profiles as p where p.id = (select auth.uid())),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Client: what to show on My appointments. One row per professional the
-- client has an upcoming booked session with, or has answered for before.
-- ---------------------------------------------------------------------------
create or replace function public.my_ace_intakes()
returns table (
  professional_slug text,
  asks boolean,
  can_answer boolean,
  answers boolean[],
  updated_at timestamptz
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
      and a.status = 'booked'
      and a.starts_at > now()
    union
    select ai.professional_id
    from public.ace_intakes as ai
    where ai.client_id = (select auth.uid())
  )
  select
    p.slug,
    p.ask_ace,
    p.ask_ace and exists (
      select 1
      from public.appointments as a
      where a.user_id = (select auth.uid())
        and a.professional_id = p.id
        and a.status = 'booked'
        and a.starts_at > now()
    ),
    ai.answers,
    ai.updated_at
  from mine
  join public.professional_profiles as p on p.id = mine.professional_id
  left join public.ace_intakes as ai
    on ai.client_id = (select auth.uid())
   and ai.professional_id = p.id
  where p.ask_ace or ai.client_id is not null;
$$;

-- Save or change the answers. Only before an upcoming booked session with a
-- professional who asks ACE.
create or replace function public.save_ace_intake(p_professional_slug text, p_answers boolean[])
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

  if p_answers is null or cardinality(p_answers) <> 10 then
    raise exception 'Please answer the questions again.' using errcode = '22023';
  end if;

  select p.id into v_professional
  from public.professional_profiles as p
  where p.slug = p_professional_slug
    and p.ask_ace;

  if v_professional is null
    or not exists (
      select 1
      from public.appointments as a
      where a.user_id = v_me
        and a.professional_id = v_professional
        and a.status = 'booked'
        and a.starts_at > now()
    )
  then
    raise exception 'You can answer these before an upcoming session with this professional.'
      using errcode = 'PT403';
  end if;

  insert into public.ace_intakes as ai (client_id, professional_id, answers)
  values (v_me, v_professional, p_answers)
  on conflict (client_id, professional_id)
  do update set answers = excluded.answers, updated_at = now();
end;
$$;

-- The client can delete their answers at any time.
create or replace function public.delete_ace_intake(p_professional_slug text)
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

  delete from public.ace_intakes as ai
  using public.professional_profiles as p
  where p.slug = p_professional_slug
    and ai.professional_id = p.id
    and ai.client_id = v_me;
end;
$$;

-- ---------------------------------------------------------------------------
-- Professional: read one client's answers, by the client alias the
-- professional sees (section 29). Null when the client has not answered.
-- ---------------------------------------------------------------------------
create or replace function public.pro_client_ace_safe(p_client_alias_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_client uuid;
  v_result jsonb;
begin
  v_client := public.resolve_message_recipient(p_client_alias_id, 'professional');

  select jsonb_build_object(
    'answers', to_jsonb(ai.answers),
    'updatedAt', ai.updated_at
  )
  into v_result
  from public.ace_intakes as ai
  where ai.client_id = v_client
    and ai.professional_id = (select auth.uid());

  return v_result;
end;
$$;

revoke execute on function public.set_ask_ace(boolean) from public, anon;
revoke execute on function public.my_ask_ace() from public, anon;
revoke execute on function public.my_ace_intakes() from public, anon;
revoke execute on function public.save_ace_intake(text, boolean[]) from public, anon;
revoke execute on function public.delete_ace_intake(text) from public, anon;
revoke execute on function public.pro_client_ace_safe(uuid) from public, anon;

grant execute on function public.set_ask_ace(boolean) to authenticated;
grant execute on function public.my_ask_ace() to authenticated;
grant execute on function public.my_ace_intakes() to authenticated;
grant execute on function public.save_ace_intake(text, boolean[]) to authenticated;
grant execute on function public.delete_ace_intake(text) to authenticated;
grant execute on function public.pro_client_ace_safe(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;

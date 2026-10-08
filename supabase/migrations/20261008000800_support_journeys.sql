-- AROM 8 of 8: support path rules and the safety flag on symptom checks.
--
-- Rules (agreed with the team):
--   none          -> nothing changes
--   low or medium -> self help first, day by day, for 14 days
--                    after 14 days the user retakes the check:
--                    same or higher -> recommend a professional (plus self help)
--                    lower          -> keep going with self help for 14 more days
--                    none           -> journey marked improved
--   high          -> professional and self help at the same time, right away
--
-- Safety rule: if any answer suggests self harm, the app sets
-- safety_concern = true and shows crisis hotlines immediately, whatever the level.

alter table public.symptom_checks
  add column safety_concern boolean not null default false;

comment on column public.symptom_checks.safety_concern is
  'True when an answer suggests possible self harm. The app must show crisis_resources immediately.';

create type public.support_journey_status as enum ('active', 'improved');

-- ---------------------------------------------------------------------------
-- support_journeys: one active journey per user per concern. Written only by
-- the trigger below, read by the owner (and by a therapist the user shares
-- symptom checks with).
-- ---------------------------------------------------------------------------
create table public.support_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  concern public.symptom_check_type not null,
  start_check_id uuid references public.symptom_checks (id) on delete set null,
  start_level public.symptom_level not null,
  latest_check_id uuid references public.symptom_checks (id) on delete set null,
  latest_level public.symptom_level not null,
  path public.support_path not null,
  -- the day the app asks the user to retake the symptom check
  review_due_on date not null,
  professional_recommended_at timestamptz,
  status public.support_journey_status not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index support_journeys_one_active_uidx
  on public.support_journeys (user_id, concern)
  where status = 'active';

create index support_journeys_review_idx
  on public.support_journeys (user_id, review_due_on)
  where status = 'active';

create trigger support_journeys_set_updated_at
  before update on public.support_journeys
  for each row execute function public.set_updated_at();

create or replace function public.symptom_level_rank(p_level public.symptom_level)
returns smallint
language sql
immutable
set search_path = ''
as $$
  select case p_level::text
    when 'none' then 0
    when 'low' then 1
    when 'medium' then 2
    when 'high' then 3
  end::smallint;
$$;

-- Runs after every new symptom check and applies the rules above.
create or replace function public.apply_support_path()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Phnom_Penh')::date;
  v_rank smallint := public.symptom_level_rank(new.level);
  v_journey public.support_journeys%rowtype;
  v_path public.support_path;
begin
  select * into v_journey
  from public.support_journeys
  where user_id = new.user_id and concern = new.check_type and status = 'active'
  for update;

  if not found then
    if v_rank = 0 then
      v_path := null;
    else
      v_path := case when v_rank = 3 then 'self_help_and_professional' else 'self_help' end;
      insert into public.support_journeys (
        user_id, concern, start_check_id, start_level, latest_check_id, latest_level,
        path, review_due_on, professional_recommended_at
      )
      values (
        new.user_id, new.check_type, new.id, new.level, new.id, new.level,
        v_path, v_today + 14, case when v_rank = 3 then now() end
      );
    end if;

  elsif v_rank = 3 then
    -- Serious at any point: professional and self help together.
    v_path := 'self_help_and_professional';
    update public.support_journeys
    set latest_check_id = new.id,
        latest_level = new.level,
        path = v_path,
        professional_recommended_at = coalesce(professional_recommended_at, now())
    where id = v_journey.id;

  elsif v_today >= v_journey.review_due_on then
    -- The 14 day review.
    if v_rank = 0 then
      v_path := null;
      update public.support_journeys
      set latest_check_id = new.id,
          latest_level = new.level,
          status = 'improved',
          ended_at = now()
      where id = v_journey.id;
    elsif v_rank >= public.symptom_level_rank(v_journey.start_level) then
      -- Same or higher after 14 days: recommend a professional.
      v_path := 'self_help_and_professional';
      update public.support_journeys
      set latest_check_id = new.id,
          latest_level = new.level,
          path = v_path,
          professional_recommended_at = coalesce(professional_recommended_at, now()),
          review_due_on = v_today + 14
      where id = v_journey.id;
    else
      -- Better but not gone: another 14 days from the new level.
      v_path := v_journey.path;
      update public.support_journeys
      set start_check_id = new.id,
          start_level = new.level,
          latest_check_id = new.id,
          latest_level = new.level,
          review_due_on = v_today + 14
      where id = v_journey.id;
    end if;

  else
    -- Before the review date: record progress only.
    v_path := v_journey.path;
    update public.support_journeys
    set latest_check_id = new.id,
        latest_level = new.level
    where id = v_journey.id;
  end if;

  update public.symptom_checks
  set recommended_path = v_path
  where id = new.id;

  return null;
end;
$$;

revoke execute on function public.apply_support_path() from public, anon, authenticated;

create trigger symptom_checks_apply_support_path
  after insert on public.symptom_checks
  for each row execute function public.apply_support_path();

-- ---------------------------------------------------------------------------
-- RLS: read only for the owner. No one writes journeys directly.
-- ---------------------------------------------------------------------------
alter table public.support_journeys enable row level security;

create policy "Owner reads own journeys"
  on public.support_journeys for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Therapists read shared journeys"
  on public.support_journeys for select to authenticated
  using (public.client_shares_with_me(user_id, 'symptoms'));

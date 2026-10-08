-- AROM 2 of 6: onboarding survey, initial insight, mood, journal, symptom checks.
-- All tables here are private to their owner. Therapists and admins cannot read them.

create type public.mood_level as enum ('very_low', 'low', 'okay', 'good', 'great');
create type public.symptom_level as enum ('low', 'medium', 'high');
create type public.symptom_check_type as enum (
  'general', 'depression', 'anxiety', 'stress', 'sleep', 'burnout'
);
create type public.support_path as enum (
  'self_help', 'self_help_and_professional', 'professional'
);

-- ---------------------------------------------------------------------------
-- onboarding_surveys: answers from the "Getting to know you" flow.
-- A user can retake it, so there can be more than one row per user.
-- ---------------------------------------------------------------------------
create table public.onboarding_surveys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  feelings text[] not null default '{}',
  frequency text check (
    frequency in ('almost_every_day', 'several_days_week', 'sometimes', 'rarely')
  ),
  impact smallint check (impact between 1 and 5),
  challenges text[] not null default '{}',
  challenge_other text check (char_length(challenge_other) <= 300),
  prior_support text check (
    prior_support in ('first_time', 'friend_family', 'counselor_therapist', 'doctor', 'prefer_not_say')
  ),
  goals text[] not null default '{}',
  support_types text[] not null default '{}',
  session_preference text check (
    session_preference in ('chat', 'voice', 'video', 'in_person', 'not_sure')
  ),
  created_at timestamptz not null default now()
);

create index onboarding_surveys_user_idx
  on public.onboarding_surveys (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- mental_health_insights: "Here's what we noticed". An initial indication,
-- never a diagnosis.
-- ---------------------------------------------------------------------------
create table public.mental_health_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  survey_id uuid references public.onboarding_surveys (id) on delete set null,
  -- [{ "key": "anxiety", "level": "medium", "signals": ["frequent_worry"] }]
  concerns jsonb not null default '[]'::jsonb,
  main_concern text,
  recommended_path public.support_path,
  created_at timestamptz not null default now()
);

create index mental_health_insights_user_idx
  on public.mental_health_insights (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- mood_checkins: quick daily mood from Home, Journal or the plan.
-- ---------------------------------------------------------------------------
create table public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mood public.mood_level not null,
  emotions text[] not null default '{}',
  note text check (char_length(note) <= 1000),
  source text not null default 'home' check (source in ('home', 'journal', 'plan')),
  checked_in_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index mood_checkins_user_idx
  on public.mood_checkins (user_id, checked_in_on desc);

-- ---------------------------------------------------------------------------
-- journal_entries: the most sensitive table in AROM.
-- ---------------------------------------------------------------------------
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null default current_date,
  mood public.mood_level,
  emotions text[] not null default '{}',
  content text not null default '' check (char_length(content) <= 20000),
  -- [{ "id": "q1", "question": "...", "kmQuestion": "...", "answer": "..." }]
  questions jsonb not null default '[]'::jsonb,
  additional_notes text check (char_length(additional_notes) <= 5000),
  input_method text not null default 'text' check (input_method in ('text', 'voice')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.journal_entries is
  'Private reflections. Only the owner can read them, not therapists or admins. Voice audio is never stored, only the text the user reviewed.';

create index journal_entries_user_idx
  on public.journal_entries (user_id, entry_date desc);

create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- symptom_checks: General or Specific Symptom Check results. Also powers
-- Detection History.
-- ---------------------------------------------------------------------------
create table public.symptom_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  check_type public.symptom_check_type not null,
  -- [{ "questionId": "anx_1", "value": 3 }]
  answers jsonb not null default '[]'::jsonb,
  score smallint check (score >= 0),
  max_score smallint check (max_score > 0),
  level public.symptom_level not null,
  recommended_path public.support_path,
  created_at timestamptz not null default now()
);

create index symptom_checks_user_idx
  on public.symptom_checks (user_id, check_type, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: owner only, for every table in this file.
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'onboarding_surveys',
    'mental_health_insights',
    'mood_checkins',
    'journal_entries',
    'symptom_checks'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Owner reads own rows" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "Owner inserts own rows" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "Owner updates own rows" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "Owner deletes own rows" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end;
$$;

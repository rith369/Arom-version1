-- AROM 4 of 8: MindGuide activity (saved, viewed, completed) and Today's Plan.
-- Lesson, practice, tip and podcast content stays in the code for now.
-- content_id matches the ids used in learn-data.ts, practice-data.ts, tips-data.ts.

create type public.content_type as enum ('lesson', 'practice', 'tip', 'guide', 'podcast');
create type public.plan_item_source as enum (
  'arom', 'mindguide', 'learn', 'practice', 'guide', 'tip', 'custom', 'appointment'
);
create type public.plan_schedule_type as enum ('specific_time', 'period', 'anytime');
create type public.day_period as enum ('morning', 'afternoon', 'evening');
create type public.plan_item_status as enum ('pending', 'completed', 'skipped');

-- ---------------------------------------------------------------------------
-- user_content_activity: one row per user per content item.
-- ---------------------------------------------------------------------------
create table public.user_content_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_type public.content_type not null,
  content_id text not null,
  is_saved boolean not null default false,
  saved_at timestamptz,
  last_viewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

create index user_content_activity_saved_idx
  on public.user_content_activity (user_id, saved_at desc)
  where is_saved;

create trigger user_content_activity_set_updated_at
  before update on public.user_content_activity
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- plan_items: Today's Plan. Mixes ARom suggestions, MindGuide items,
-- the user's own activities and therapist appointments.
-- ---------------------------------------------------------------------------
create table public.plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_date date not null default current_date,
  source public.plan_item_source not null,
  content_type public.content_type,
  content_id text,
  appointment_id uuid references public.appointments (id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  title_km text,
  subtitle text,
  subtitle_km text,
  href text,
  icon text,
  schedule_type public.plan_schedule_type not null default 'anytime',
  day_period public.day_period,
  scheduled_time time,
  duration_minutes smallint check (duration_minutes between 1 and 600),
  reminder_minutes smallint check (reminder_minutes in (10, 30, 60)),
  status public.plan_item_status not null default 'pending',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (schedule_type <> 'specific_time' or scheduled_time is not null),
  check (schedule_type <> 'period' or day_period is not null),
  check (source <> 'appointment' or appointment_id is not null)
);

create index plan_items_user_date_idx on public.plan_items (user_id, plan_date);

-- The same MindGuide item cannot be added twice to the same day.
create unique index plan_items_unique_content_uidx
  on public.plan_items (user_id, plan_date, content_type, content_id)
  where content_id is not null;

create trigger plan_items_set_updated_at
  before update on public.plan_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: owner only
-- ---------------------------------------------------------------------------
alter table public.user_content_activity enable row level security;
alter table public.plan_items enable row level security;

create policy "Owner reads own rows"
  on public.user_content_activity for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Owner inserts own rows"
  on public.user_content_activity for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Owner updates own rows"
  on public.user_content_activity for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Owner deletes own rows"
  on public.user_content_activity for delete to authenticated
  using (user_id = (select auth.uid()));

-- A plan item may only point at the user's own appointment.
create policy "Owner reads own plan"
  on public.plan_items for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Owner adds to own plan"
  on public.plan_items for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      appointment_id is null
      or exists (
        select 1 from public.appointments a
        where a.id = appointment_id and a.user_id = (select auth.uid())
      )
    )
  );

create policy "Owner updates own plan"
  on public.plan_items for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      appointment_id is null
      or exists (
        select 1 from public.appointments a
        where a.id = appointment_id and a.user_id = (select auth.uid())
      )
    )
  );

create policy "Owner removes from own plan"
  on public.plan_items for delete to authenticated
  using (user_id = (select auth.uid()));

-- AROM: Your Plan For Today as a personal to do list (BACKEND-HANDOFF.md section 27).
-- People add their own tasks (suggestions, their own words, MindGuide items),
-- choose how often each repeats, and tick them off each day. Every day starts
-- fresh: a check belongs to one Cambodia date, and nothing piles up as overdue.
-- Private to the person: no professional or admin access. The older
-- plan_items table (one item per date) is not used by this feature.

create table public.plan_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Stable key so a MindGuide item is only added once ("lesson-3",
  -- "tip-try-now-2", "suggest:water", "custom:<uuid>", "starter:lesson").
  item_key text not null check (char_length(item_key) between 1 and 100),
  source text not null check (source in ('custom', 'suggestion', 'starter', 'learn', 'practice', 'mindguide', 'guide', 'tip')),
  title text not null check (char_length(trim(title)) between 1 and 120),
  title_km text check (char_length(title_km) <= 160),
  subtitle text check (char_length(subtitle) <= 200),
  subtitle_km text check (char_length(subtitle_km) <= 260),
  -- Pages inside AROM only ("//other.site" is refused).
  href text check (href ~ '^/([A-Za-z0-9_?=&#.-][A-Za-z0-9/_?=&#.-]*)?$' and char_length(href) <= 200),
  icon text check (icon ~ '^[a-z0-9_-]{1,60}$'),
  repeat text not null default 'daily' check (repeat in ('daily', 'weekdays', 'once')),
  -- 0 Sunday to 6 Saturday (Cambodia time), only for repeat = 'weekdays'.
  weekdays smallint[],
  once_day date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_key),
  constraint plan_tasks_weekdays_check check (
    (repeat = 'weekdays') = (weekdays is not null)
    and (weekdays is null or (cardinality(weekdays) between 1 and 7 and weekdays <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]))
  ),
  constraint plan_tasks_once_check check ((repeat = 'once') = (once_day is not null))
);

create index plan_tasks_user_order on public.plan_tasks (user_id, sort_order);

comment on table public.plan_tasks is
  'Personal to do list on Home. Only the owner can read or change it.';

-- One row per task per Cambodia date it was done.
create table public.plan_task_checks (
  task_id uuid not null references public.plan_tasks (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (task_id, day)
);

create index plan_task_checks_user_day on public.plan_task_checks (user_id, day);

-- Whether the starter tasks were already given, so deleting them all does
-- not bring them back.
create table public.plan_starts (
  user_id uuid primary key default auth.uid() references public.profiles (id) on delete cascade,
  started_at timestamptz not null default now()
);

alter table public.plan_tasks enable row level security;
alter table public.plan_task_checks enable row level security;
alter table public.plan_starts enable row level security;

grant select, insert, update, delete on public.plan_tasks to authenticated;
grant select, insert, delete on public.plan_task_checks to authenticated;
grant select, insert on public.plan_starts to authenticated;

create policy "Owner reads own plan tasks" on public.plan_tasks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Owner adds own plan tasks" on public.plan_tasks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Owner changes own plan tasks" on public.plan_tasks
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Owner deletes own plan tasks" on public.plan_tasks
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Owner reads own plan checks" on public.plan_task_checks
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Owner checks own plan tasks" on public.plan_task_checks
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.plan_tasks t where t.id = task_id and t.user_id = (select auth.uid()))
  );
create policy "Owner unchecks own plan tasks" on public.plan_task_checks
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Owner reads own plan start" on public.plan_starts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Owner records own plan start" on public.plan_starts
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Keeps a list short enough to be kind, and stops runaway inserts.
create or replace function public.limit_plan_tasks()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.plan_tasks where user_id = new.user_id) >= 30 then
    raise exception 'You can have up to 30 tasks. Remove one first.';
  end if;
  return new;
end;
$$;

create trigger plan_tasks_limit
  before insert on public.plan_tasks
  for each row execute function public.limit_plan_tasks();

create or replace function public.touch_plan_task()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger plan_tasks_touch
  before update on public.plan_tasks
  for each row execute function public.touch_plan_task();

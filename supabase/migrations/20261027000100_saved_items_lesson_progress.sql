-- AROM: saved items and lesson progress in the person's account
-- (BACKEND-HANDOFF.md section 30). Until now both lived in the browser, so
-- they were lost on a new phone and anyone using the same phone could see
-- them. Private to the person: no professional or admin access.

-- Lessons, tips, practice and podcasts the person bookmarked.
create table public.saved_items (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('lesson', 'tip', 'practice', 'podcast')),
  -- MindGuide ids such as "learn-about-stress" (content still lives in the code).
  item_id text not null check (item_id ~ '^[A-Za-z0-9_-]{1,100}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

create index saved_items_user_created on public.saved_items (user_id, created_at);

comment on table public.saved_items is
  'MindGuide items a person saved. Only the owner can read or change them.';

-- How far the person got in each lesson.
create table public.lesson_progress (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  lesson_id text not null check (lesson_id ~ '^[A-Za-z0-9_-]{1,100}$'),
  completed_sections smallint not null check (completed_sections between 0 and 100),
  total_sections smallint not null check (total_sections between 1 and 100),
  is_complete boolean not null default false,
  last_visited_section smallint not null check (last_visited_section between 1 and 100),
  -- The option the person picked in the quiz and the reflection question.
  quiz_answer text check (char_length(quiz_answer) <= 200),
  reflection_answer text check (char_length(reflection_answer) <= 300),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

comment on table public.lesson_progress is
  'Lesson progress and answers. Only the owner can read or change it.';

alter table public.saved_items enable row level security;
alter table public.lesson_progress enable row level security;

grant select, insert, delete on public.saved_items to authenticated;
grant select, insert, update on public.lesson_progress to authenticated;

create policy "Owner reads own saved items" on public.saved_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Owner saves items" on public.saved_items
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Owner removes saved items" on public.saved_items
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "Owner reads own lesson progress" on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Owner adds own lesson progress" on public.lesson_progress
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Owner changes own lesson progress" on public.lesson_progress
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Stops runaway inserts. Far more than anyone saves by hand.
create or replace function public.limit_saved_items()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.saved_items where user_id = new.user_id) >= 500 then
    raise exception 'You can save up to 500 items. Remove one first.';
  end if;
  return new;
end;
$$;

create trigger saved_items_limit
  before insert on public.saved_items
  for each row execute function public.limit_saved_items();

create or replace function public.touch_lesson_progress()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger lesson_progress_touch
  before update on public.lesson_progress
  for each row execute function public.touch_lesson_progress();

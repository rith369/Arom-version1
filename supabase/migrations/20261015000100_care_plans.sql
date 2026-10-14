-- AROM: care plans, tasks a professional gives a client between sessions
-- (BACKEND-HANDOFF.md section 18).
--
--   1. care_tasks: given by a professional to a client who has a booked or
--      completed session with them, and is not archived.
--   2. care_check_ins: the client ticks a task on a Cambodia date.
--   3. care_sharing: the client chooses to share their ticks with one
--      professional. Off by default. Turning it off hides past ticks too,
--      because the RLS policy checks it on every read.
--
-- Only the client and that professional can read a task. No admin read.
-- Every write goes through the security definer functions below.
-- MindGuide items live in the code, so the API checks that a chosen item is
-- published before calling give_care_task().
-- Task titles, notes and check ins are never logged.

-- ===========================================================================
-- 1. Tables
-- ===========================================================================
create table public.care_tasks (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  -- The session it was given after, when there was one.
  appointment_id uuid references public.appointments (id) on delete set null,
  kind text not null check (kind in ('mindguide', 'mission', 'goal', 'reminder')),
  mindguide_type text check (mindguide_type in ('lesson', 'tip', 'practice')),
  mindguide_item_id text check (char_length(mindguide_item_id) between 1 and 100),
  title text not null default '' check (char_length(title) <= 120),
  note text not null default '' check (char_length(note) <= 300),
  -- Null: once. Otherwise the ISO weekdays it repeats on (1 is Monday).
  repeat_days smallint[] check (
    repeat_days is null
    or (cardinality(repeat_days) between 1 and 7 and repeat_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[])
  ),
  start_date date not null,
  -- For a goal: "reach by".
  end_date date,
  -- Cambodia time. Read by the Telegram bot, the app sends nothing.
  reminder_time time,
  created_at timestamptz not null default now(),
  stopped_at timestamptz,
  check (professional_id <> client_id),
  check ((kind = 'mindguide') = (mindguide_type is not null and mindguide_item_id is not null)),
  check (kind = 'mindguide' or char_length(btrim(title)) >= 1),
  check (kind <> 'goal' or (repeat_days is null and end_date is not null and reminder_time is null)),
  check (end_date is null or end_date >= start_date)
);

create index care_tasks_client_idx on public.care_tasks (client_id, created_at desc);
create index care_tasks_professional_idx on public.care_tasks (professional_id, client_id);

create table public.care_check_ins (
  task_id uuid not null references public.care_tasks (id) on delete cascade,
  check_date date not null,
  done_at timestamptz not null default now(),
  primary key (task_id, check_date)
);

create table public.care_sharing (
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  share_progress boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (professional_id, client_id)
);

alter table public.care_tasks enable row level security;
alter table public.care_check_ins enable row level security;
alter table public.care_sharing enable row level security;

create trigger care_tasks_block_suspended
  before insert on public.care_tasks
  for each row execute function public.block_suspended_account();

create trigger care_check_ins_block_suspended
  before insert on public.care_check_ins
  for each row execute function public.block_suspended_account();

-- ===========================================================================
-- 2. Read rules
-- ===========================================================================

-- Today in Cambodia (no daylight saving).
create or replace function public.cambodia_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Asia/Phnom_Penh')::date;
$$;

-- True when the caller may see the ticks of this task: always for the
-- client, for the professional only while the client shares progress.
create or replace function public.can_read_care_check_ins(p_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.care_tasks t
    where t.id = p_task_id
      and (
        t.client_id = (select auth.uid())
        or (
          t.professional_id = (select auth.uid())
          and exists (
            select 1 from public.care_sharing s
            where s.professional_id = t.professional_id
              and s.client_id = t.client_id
              and s.share_progress
          )
        )
      )
  );
$$;

revoke execute on function public.can_read_care_check_ins(uuid) from public, anon;
grant execute on function public.can_read_care_check_ins(uuid) to authenticated;

create policy "Client and professional read care tasks"
  on public.care_tasks for select to authenticated
  using ((select auth.uid()) in (client_id, professional_id));

create policy "Client, or professional while shared, reads check ins"
  on public.care_check_ins for select to authenticated
  using (public.can_read_care_check_ins(task_id));

create policy "Client and professional read sharing"
  on public.care_sharing for select to authenticated
  using ((select auth.uid()) in (client_id, professional_id));

-- No insert, update or delete policies: see the functions below.

-- ===========================================================================
-- 3. Write rules
-- ===========================================================================

-- A professional gives one task. Errors: PT403 not their client (no booked or
-- completed session, or archived), 22023 bad input.
create or replace function public.give_care_task(
  p_client_id uuid,
  p_appointment_id uuid,
  p_kind text,
  p_mindguide_type text,
  p_mindguide_item_id text,
  p_title text,
  p_note text,
  p_repeat_days smallint[],
  p_end_date date,
  p_reminder_time time
)
returns public.care_tasks
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_today date := public.cambodia_today();
  v_row public.care_tasks;
begin
  if v_me is null or not exists (
    select 1 from public.appointments a
    where a.professional_id = v_me
      and a.user_id = p_client_id
      and a.status in ('booked', 'completed')
  ) then
    raise exception 'You can give care tasks to your own clients only.' using errcode = 'PT403';
  end if;

  if exists (
    select 1 from public.conversations c
    where c.professional_id = v_me and c.client_id = p_client_id and c.closed_at is not null
  ) then
    raise exception 'This client is archived.' using errcode = 'PT403';
  end if;

  if p_appointment_id is not null and not exists (
    select 1 from public.appointments a
    where a.id = p_appointment_id and a.professional_id = v_me and a.user_id = p_client_id
  ) then
    raise exception 'That session is not with this client.' using errcode = '22023';
  end if;

  if p_end_date is not null and p_end_date < v_today then
    raise exception 'The end date cannot be before today.' using errcode = '22023';
  end if;

  if (
    select count(*) from public.care_tasks t
    where t.professional_id = v_me
      and t.client_id = p_client_id
      and t.stopped_at is null
      and (t.end_date is null or t.end_date >= v_today)
  ) >= 30 then
    raise exception 'A client can have at most 30 active tasks from you.' using errcode = '22023';
  end if;

  insert into public.care_tasks (
    professional_id, client_id, appointment_id, kind, mindguide_type, mindguide_item_id,
    title, note, repeat_days, start_date, end_date, reminder_time
  )
  values (
    v_me, p_client_id, p_appointment_id, p_kind,
    case when p_kind = 'mindguide' then p_mindguide_type end,
    case when p_kind = 'mindguide' then p_mindguide_item_id end,
    case when p_kind = 'mindguide' then '' else btrim(coalesce(p_title, '')) end,
    btrim(coalesce(p_note, '')),
    case when p_kind = 'goal' then null else p_repeat_days end,
    v_today,
    p_end_date,
    case when p_kind = 'goal' then null else p_reminder_time end
  )
  returning * into v_row;

  return v_row;
exception
  when check_violation then
    raise exception 'Please check the task details.' using errcode = '22023';
end;
$$;

revoke execute on function public.give_care_task(uuid, uuid, text, text, text, text, text, smallint[], date, time) from public, anon;
grant execute on function public.give_care_task(uuid, uuid, text, text, text, text, text, smallint[], date, time) to authenticated;

-- The professional stops a task. It stays in the client's past tasks.
create or replace function public.stop_care_task(p_task_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.care_tasks t
  set stopped_at = coalesce(t.stopped_at, now())
  where t.id = p_task_id and t.professional_id = (select auth.uid());
  if not found then
    raise exception 'Task not found.' using errcode = 'PT404';
  end if;
end;
$$;

revoke execute on function public.stop_care_task(uuid) from public, anon;
grant execute on function public.stop_care_task(uuid) to authenticated;

-- True when the task is due on the date (see isDueToday in care-store.ts).
create or replace function public.care_task_due_on(p_task public.care_tasks, p_date date)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_date >= p_task.start_date
    and (p_task.end_date is null or p_date <= p_task.end_date)
    and (p_task.stopped_at is null or p_date <= (p_task.stopped_at at time zone 'Asia/Phnom_Penh')::date)
    and (p_task.repeat_days is null or extract(isodow from p_date)::smallint = any (p_task.repeat_days));
$$;

-- The client ticks or unticks a task. Only today or yesterday (Cambodia),
-- never in the future, and only on a day the task is due. A one time task
-- or goal has at most one tick.
create or replace function public.set_care_check_in(p_task_id uuid, p_date date, p_done boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_task public.care_tasks;
  v_today date := public.cambodia_today();
begin
  select * into v_task
  from public.care_tasks t
  where t.id = p_task_id and t.client_id = (select auth.uid());
  if not found then
    raise exception 'Task not found.' using errcode = 'PT404';
  end if;

  if p_date > v_today or p_date < v_today - 1 then
    raise exception 'You can only tick today.' using errcode = '22023';
  end if;

  if not p_done then
    delete from public.care_check_ins c
    where c.task_id = p_task_id
      and (v_task.repeat_days is null or c.check_date = p_date);
    return;
  end if;

  if not public.care_task_due_on(v_task, p_date) then
    raise exception 'This task is not due on that day.' using errcode = '22023';
  end if;

  if v_task.repeat_days is null and exists (select 1 from public.care_check_ins c where c.task_id = p_task_id) then
    return;
  end if;

  insert into public.care_check_ins (task_id, check_date)
  values (p_task_id, p_date)
  on conflict (task_id, check_date) do nothing;
end;
$$;

revoke execute on function public.set_care_check_in(uuid, date, boolean) from public, anon;
grant execute on function public.set_care_check_in(uuid, date, boolean) to authenticated;

-- The client shares (or stops sharing) their ticks with one professional.
create or replace function public.set_care_sharing(p_professional_id uuid, p_share boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null or not exists (
    select 1 from public.care_tasks t
    where t.professional_id = p_professional_id and t.client_id = v_me
  ) then
    raise exception 'Professional not found.' using errcode = 'PT404';
  end if;

  insert into public.care_sharing (professional_id, client_id, share_progress)
  values (p_professional_id, v_me, p_share)
  on conflict (professional_id, client_id)
  do update set share_progress = excluded.share_progress, updated_at = now();
end;
$$;

revoke execute on function public.set_care_sharing(uuid, boolean) from public, anon;
grant execute on function public.set_care_sharing(uuid, boolean) to authenticated;

-- Public fields of the professionals who gave the caller a task, so the
-- care plan can show their name and photo even if they are no longer listed.
create or replace function public.my_care_professionals()
returns table (id uuid, slug text, display_name text, display_name_km text, photo_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select pp.id, pp.slug, pp.display_name, pp.display_name_km, pp.photo_url
  from public.professional_profiles pp
  where exists (
    select 1 from public.care_tasks t
    where t.professional_id = pp.id and t.client_id = (select auth.uid())
  );
$$;

revoke execute on function public.my_care_professionals() from public, anon;
grant execute on function public.my_care_professionals() to authenticated;

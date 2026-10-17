-- AROM: crash tracking (BACKEND-HANDOFF.md section 14).
--
--   * report_crash(): anyone may send one, signed out visitors included. A
--     report carries only the error, the page path and the build: never
--     journal text, answers, names or ids. The account id is stored only to
--     count how many different people were affected, and is never returned.
--   * Limits so nobody can flood the table: 20 an hour per device key or
--     account, 500 an hour in total. Extra reports are dropped silently.
--     The device key is a hash the API makes from the address and the day.
--   * Rows older than 30 days are deleted.
--   * admin_crash_groups(days): admins only, grouped by kind, message and page.

create table public.crash_reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('render', 'app')),
  message text not null check (char_length(message) between 1 and 300),
  route text not null default '' check (char_length(route) <= 200),
  release text not null default '' check (char_length(release) <= 20),
  digest text check (digest is null or char_length(digest) <= 100),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  reporter_id uuid references public.profiles (id) on delete set null,
  client_key text not null default '' check (char_length(client_key) <= 64)
);

create index crash_reports_received_idx on public.crash_reports (received_at desc);
create index crash_reports_client_idx on public.crash_reports (client_key, received_at desc);

alter table public.crash_reports enable row level security;
revoke all on public.crash_reports from anon, authenticated;

create or replace function public.report_crash(
  p_kind text,
  p_message text,
  p_route text,
  p_release text,
  p_digest text,
  p_occurred_at timestamptz,
  p_client_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_key text := left(coalesce(p_client_key, ''), 64);
begin
  if (select count(*) from public.crash_reports where received_at > now() - interval '1 hour') >= 500 then
    return;
  end if;
  if v_key <> '' and (
    select count(*) from public.crash_reports
    where client_key = v_key and received_at > now() - interval '1 hour'
  ) >= 20 then
    return;
  end if;
  if v_user is not null and (
    select count(*) from public.crash_reports
    where reporter_id = v_user and received_at > now() - interval '1 hour'
  ) >= 20 then
    return;
  end if;

  insert into public.crash_reports (kind, message, route, release, digest, occurred_at, reporter_id, client_key)
  values (
    p_kind,
    left(p_message, 300),
    left(coalesce(p_route, ''), 200),
    left(coalesce(p_release, ''), 20),
    nullif(left(coalesce(p_digest, ''), 100), ''),
    -- A clock far off on the device should not hide a crash.
    case when p_occurred_at between now() - interval '1 day' and now() + interval '5 minutes' then p_occurred_at else now() end,
    v_user,
    v_key
  );

  -- Keep 30 days.
  delete from public.crash_reports
  where id in (
    select id from public.crash_reports
    where received_at < now() - interval '30 days'
    limit 200
  );
end;
$$;

create or replace function public.admin_crash_groups(p_days integer)
returns table (
  id text,
  kind text,
  message text,
  route text,
  count integer,
  people integer,
  last_seen_at timestamptz,
  release text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can see crashes';
  end if;
  if p_days not between 1 and 30 then
    raise exception 'Choose between 1 and 30 days';
  end if;

  return query
    select
      md5(c.kind || '|' || c.message || '|' || c.route),
      c.kind,
      c.message,
      c.route,
      count(*)::integer,
      count(distinct c.reporter_id)::integer,
      max(c.received_at),
      (array_agg(c.release order by c.received_at desc))[1]
    from public.crash_reports c
    where c.received_at > now() - make_interval(days => p_days)
    group by c.kind, c.message, c.route
    order by count(*) desc, max(c.received_at) desc
    limit 50;
end;
$$;

revoke execute on function public.report_crash(text, text, text, text, text, timestamptz, text) from public;
grant execute on function public.report_crash(text, text, text, text, text, timestamptz, text) to anon, authenticated;
revoke execute on function public.admin_crash_groups(integer) from public, anon;
grant execute on function public.admin_crash_groups(integer) to authenticated;

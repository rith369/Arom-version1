-- Security warnings on the Admin dashboard (security audit 5 Nov 2026, finding
-- M11; BACKEND-HANDOFF.md section 47).
--
--   1. security_events records only that a login limit was reached, which
--      limit, and when. Never an email, an address or the hashed key, so it
--      cannot say who or where. Kept 90 days.
--   2. rate_limit_hit is the live definition with one addition: it writes an
--      event the moment a key goes over its limit (once per lock, not per try).
--      Keys now start with the rule name, for example "passwordPerAccount:...".
--   3. admin_security_warnings() gives admins the counts the dashboard shows.
--
-- Nothing here logs who looked at what: that was left out on purpose (6 Nov 2026).

begin;

create table public.security_events (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (char_length(kind) between 1 and 30),
  created_at timestamptz not null default now()
);

create index security_events_created_idx on public.security_events (created_at desc);

alter table public.security_events enable row level security;
revoke all on table public.security_events from public, anon, authenticated;

create or replace function public.rate_limit_hit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempts integer;
begin
  insert into public.rate_limits as r (key, window_started_at, attempts)
  values (p_key, now(), 1)
  on conflict (key) do update
  set attempts = case
        when r.window_started_at < now() - make_interval(secs => p_window_seconds) then 1
        else r.attempts + 1
      end,
      window_started_at = case
        when r.window_started_at < now() - make_interval(secs => p_window_seconds) then now()
        else r.window_started_at
      end
  returning attempts into v_attempts;

  -- The first try over the limit is the moment of the lock. Only the rule name is kept.
  if v_attempts = p_max + 1 then
    insert into public.security_events (kind)
    values (case when position(':' in p_key) > 1 then left(split_part(p_key, ':', 1), 30) else 'unknown' end);
  end if;

  -- Old keys are not needed. A few go each time, so the table stays small.
  delete from public.rate_limits
  where key in (
    select old.key from public.rate_limits as old
    where old.window_started_at < now() - interval '1 day'
    limit 100
  );
  delete from public.security_events
  where id in (
    select old.id from public.security_events as old
    where old.created_at < now() - interval '90 days'
    limit 100
  );

  return v_attempts <= p_max;
end;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

create or replace function public.admin_security_warnings()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only admins can see security warnings' using errcode = '42501';
  end if;

  select jsonb_build_object(
    -- Anyone made an admin in the last 7 days, including from the Supabase dashboard.
    'newAdmins', coalesce((
      select jsonb_agg(jsonb_build_object(
               'name', coalesce(nullif(p.full_name, ''), u.email, 'Unknown'),
               'at', l.created_at,
               'fromDashboard', l.admin_id is null)
             order by l.created_at desc)
      from public.admin_audit_log as l
      join public.profiles as p on p.id = l.target_id
      left join auth.users as u on u.id = l.target_id
      where l.action = 'change_role'
        and l.details ->> 'to' = 'admin'
        and l.created_at > now() - interval '7 days'
    ), '[]'::jsonb),
    -- Active admins with no authenticator app: they cannot use admin pages until they add one.
    'adminsWithoutCode', coalesce((
      select jsonb_agg(coalesce(nullif(p.full_name, ''), u.email, 'Unknown') order by p.created_at)
      from public.profiles as p
      left join auth.users as u on u.id = p.id
      where p.role = 'admin'
        and p.account_status = 'active'
        and not exists (
          select 1 from auth.mfa_factors as f
          where f.user_id = p.id and f.status::text = 'verified'
        )
    ), '[]'::jsonb),
    'lockouts', jsonb_build_object(
      'passwords', (select count(*) from public.security_events as e
                    where e.created_at > now() - interval '1 day'
                      and e.kind in ('passwordPerAccount', 'passwordCheckPerUser')),
      'codes', (select count(*) from public.security_events as e
                where e.created_at > now() - interval '1 day' and e.kind = 'codePerAccount'),
      'networks', (select count(*) from public.security_events as e
                   where e.created_at > now() - interval '1 day' and e.kind like '%PerAddress')
    ),
    'crashes', jsonb_build_object(
      'last24h', (select count(*) from public.crash_reports as c
                  where c.received_at > now() - interval '1 day' and c.release <> 'csp'),
      'previous7d', (select count(*) from public.crash_reports as c
                     where c.received_at between now() - interval '8 days' and now() - interval '1 day'
                       and c.release <> 'csp')
    ),
    'csp', jsonb_build_object(
      'last7d', (select count(*) from public.crash_reports as c
                 where c.received_at > now() - interval '7 days' and c.release = 'csp')
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_security_warnings() from public, anon;
grant execute on function public.admin_security_warnings() to authenticated;

commit;

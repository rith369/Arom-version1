-- Low risk fixes from the security audit of 5 Nov 2026 (L1, L3, L5, L6, L7;
-- BACKEND-HANDOFF.md section 48).
--
--   1. L1: therapists no longer read mental_health_insights or support_journeys
--      directly. Those rows carry the client's real id, which the alias system
--      hides. The app only reads them as their owner, and therapists see shared
--      information through get_shared_client_data_safe().
--   2. L3: crash reports are saved only by AROM's server. It works out the
--      limit key itself, so nobody can flood the reports with made up keys.
--   3. L5: deleting a journal entry from the last 10 days clears the AI week
--      summary, so text based on it does not stay. The person can make a new one.
--   4. L6: four old functions that take raw ids can no longer be called from the
--      browser. Their newer _safe versions call them and keep working.
--   5. L7: test therapist profiles are no longer public.
--   6. Fix to 20261106000100: the lockout warnings now match the rule names the
--      app really uses ('password', 'password-check', 'code', 'login-address' ...).

begin;

-- 1. L1
drop policy if exists "Therapists read shared insights" on public.mental_health_insights;
drop policy if exists "Therapists read shared journeys" on public.support_journeys;

-- 2. L3
drop function if exists public.report_crash(text, text, text, text, text, timestamptz, text);

create or replace function public.report_crash(
  p_kind text,
  p_message text,
  p_route text,
  p_release text,
  p_digest text,
  p_occurred_at timestamptz,
  p_client_key text,
  p_reporter_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := p_reporter_id;
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
  -- An account deleted a moment ago must not stop the report.
  if v_user is not null and not exists (select 1 from public.profiles where id = v_user) then
    v_user := null;
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

revoke all on function public.report_crash(text, text, text, text, text, timestamptz, text, uuid) from public, anon, authenticated;
grant execute on function public.report_crash(text, text, text, text, text, timestamptz, text, uuid) to service_role;

-- 3. L5
create or replace function public.clear_journal_summary_after_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- The summary covers the last 7 days. Older entries were never part of it.
  if old.entry_date < current_date - 10 then
    return old;
  end if;
  -- During an account deletion the summary is being deleted too.
  if not exists (select 1 from public.profiles where id = old.user_id) then
    return old;
  end if;

  update public.journal_ai_summaries
  set summary = null, entries_key = null, generated_at = null, updated_at = now()
  where user_id = old.user_id and summary is not null;
  return old;
end;
$$;

revoke all on function public.clear_journal_summary_after_delete() from public, anon, authenticated;

drop trigger if exists journal_entries_clear_summary on public.journal_entries;
create trigger journal_entries_clear_summary
  after delete on public.journal_entries
  for each row execute function public.clear_journal_summary_after_delete();

-- 4. L6
revoke execute on function public.send_message(uuid, text, text, text, text, integer) from public, anon, authenticated;
revoke execute on function public.open_conversation(uuid, text) from public, anon, authenticated;
revoke execute on function public.shared_mood_checkins(uuid) from public, anon, authenticated;
revoke execute on function public.set_client_archived(uuid, boolean) from public, anon, authenticated;

-- 5. L7
drop policy if exists "Anyone reads verified professionals" on public.professional_profiles;
create policy "Anyone reads verified professionals"
  on public.professional_profiles for select to anon, authenticated
  using (verification_status = 'verified' and not is_test);

-- 6. Lockout warnings use the real rule names (lib/controllers/*: overLimit).
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
                      and e.kind in ('password', 'password-check')),
      'codes', (select count(*) from public.security_events as e
                where e.created_at > now() - interval '1 day' and e.kind = 'code'),
      'networks', (select count(*) from public.security_events as e
                   where e.created_at > now() - interval '1 day' and e.kind like '%-address')
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


commit;

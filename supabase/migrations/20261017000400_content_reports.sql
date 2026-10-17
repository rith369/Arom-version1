-- AROM: "Report a problem" on MindGuide content and the admin Reports page
-- (BACKEND-HANDOFF.md section 10).
--
--   * A report points at an item (and a section or step), never a copy of
--     the content. The note is optional and the form asks for no personal
--     details.
--   * submit_content_report(): signed in people only, 5 a day each. The
--     reporter id is kept only for that limit and is never returned to admins
--     (admins read through admin_list_content_reports()).
--   * resolve_content_reports(): an admin closes every open report on one
--     item as fixed or not a problem, audit logged.
-- MindGuide items live in code, so the API checks that the item exists.

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('lesson', 'tip', 'practice')),
  source_id text not null check (char_length(source_id) between 1 and 100),
  part_id text check (part_id is null or char_length(part_id) between 1 and 60),
  reason text not null check (reason in ('wrong_info', 'harmful', 'broken', 'other')),
  note text not null default '' check (char_length(note) <= 500),
  reporter_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'fixed', 'not_a_problem')),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles (id) on delete set null
);

create index content_reports_item_idx on public.content_reports (target_type, source_id) where status = 'open';
create index content_reports_reporter_idx on public.content_reports (reporter_id, created_at desc);

-- No direct access: everything goes through the functions below.
alter table public.content_reports enable row level security;
revoke all on public.content_reports from anon, authenticated;

create or replace function public.submit_content_report(
  p_target_type text,
  p_source_id text,
  p_part_id text,
  p_reason text,
  p_note text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Please log in to send a report.' using errcode = 'PT403';
  end if;

  if (
    select count(*) from public.content_reports r
    where r.reporter_id = v_user and r.created_at > now() - interval '1 day'
  ) >= 5 then
    return 'daily_limit';
  end if;

  insert into public.content_reports (target_type, source_id, part_id, reason, note, reporter_id)
  values (p_target_type, p_source_id, nullif(trim(coalesce(p_part_id, '')), ''), p_reason, trim(coalesce(p_note, '')), v_user);
  return 'sent';
end;
$$;

create or replace function public.admin_list_content_reports()
returns table (
  id uuid,
  target_type text,
  source_id text,
  part_id text,
  reason text,
  note text,
  created_at timestamptz,
  status text,
  resolved_at timestamptz,
  resolved_by_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can see reports';
  end if;

  return query
    select r.id, r.target_type, r.source_id, r.part_id, r.reason, r.note, r.created_at, r.status, r.resolved_at,
           case when r.resolved_by is null then null else coalesce(p.full_name, 'Admin') end
    from public.content_reports r
    left join public.profiles p on p.id = r.resolved_by
    where r.status = 'open' or r.created_at > now() - interval '180 days'
    order by r.created_at desc
    limit 1000;
end;
$$;

create or replace function public.resolve_content_reports(p_target_type text, p_source_id text, p_status text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can close reports';
  end if;
  if p_status not in ('fixed', 'not_a_problem') then
    raise exception 'Choose fixed or not a problem';
  end if;

  update public.content_reports
  set status = p_status, resolved_at = now(), resolved_by = v_admin
  where target_type = p_target_type and source_id = p_source_id and status = 'open';
  get diagnostics v_count = row_count;

  if v_count = 0 then
    raise exception 'There are no open reports on this item';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (v_admin, 'resolve_content_reports', 'content_reports', null,
          jsonb_build_object('item', p_target_type || ':' || p_source_id, 'status', p_status, 'count', v_count));
  return v_count;
end;
$$;

revoke execute on function public.submit_content_report(text, text, text, text, text) from public, anon;
grant execute on function public.submit_content_report(text, text, text, text, text) to authenticated;
revoke execute on function public.admin_list_content_reports() from public, anon;
grant execute on function public.admin_list_content_reports() to authenticated;
revoke execute on function public.resolve_content_reports(text, text, text) from public, anon;
grant execute on function public.resolve_content_reports(text, text, text) to authenticated;

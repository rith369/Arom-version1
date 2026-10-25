-- AROM: a written summary of the person's journal week (BACKEND-HANDOFF.md
-- section 22).
--
-- Decided by Rith (26 Oct 2026):
--   * Off until the person turns it on. Turning it on sends their last 7 days
--     of journal entries to Google Gemini (paid plan: not used to train AI,
--     kept by Google up to 55 days only to check for misuse). The app says so
--     before they turn it on.
--   * The summary is written on the server only (GEMINI_API_KEY never reaches
--     the browser) and saved here so it is not written again for every visit.
--   * At most 5 summaries a person a Cambodia day, so the cost stays small.
--   * Only the owner reads their row. Never professionals, never admins.
--     Writes go only through the functions below.
--   * Turning it off deletes the saved summary.
--
-- Never log journal text or summaries.

create table public.journal_ai_summaries (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  enabled boolean not null default false,
  enabled_at timestamptz,
  language text check (language in ('en', 'km')),
  -- Which entries the summary was written from (a hash of their ids).
  entries_key text check (char_length(entries_key) <= 128),
  summary jsonb check (summary is null or (jsonb_typeof(summary) = 'object' and pg_column_size(summary) <= 16000)),
  generated_at timestamptz,
  run_day date,
  run_count integer not null default 0 check (run_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.journal_ai_summaries enable row level security;

create policy "Owner reads own journal summary"
  on public.journal_ai_summaries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.journal_ai_summaries from anon, authenticated;
grant select on table public.journal_ai_summaries to authenticated;

-- Turn the summary on or off. Off deletes the saved summary.
create or replace function public.set_journal_summary_enabled(p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Please log in to continue.';
  end if;

  insert into public.journal_ai_summaries (user_id, enabled, enabled_at)
  values (v_user, p_enabled, case when p_enabled then now() end)
  on conflict (user_id) do update
  set enabled = excluded.enabled,
      enabled_at = excluded.enabled_at,
      language = case when excluded.enabled then public.journal_ai_summaries.language end,
      entries_key = case when excluded.enabled then public.journal_ai_summaries.entries_key end,
      summary = case when excluded.enabled then public.journal_ai_summaries.summary end,
      generated_at = case when excluded.enabled then public.journal_ai_summaries.generated_at end,
      updated_at = now();
end;
$$;

-- Uses one of today's 5 summaries. False when it is off or none are left.
create or replace function public.claim_journal_summary_run()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_today date := public.cambodia_today();
  v_ok boolean;
begin
  if v_user is null then
    return false;
  end if;

  update public.journal_ai_summaries
  set run_count = case when run_day = v_today then run_count + 1 else 1 end,
      run_day = v_today,
      updated_at = now()
  where user_id = v_user
    and enabled
    and (run_day is distinct from v_today or run_count < 5)
  returning true into v_ok;

  return coalesce(v_ok, false);
end;
$$;

-- Saves the summary the server wrote. Only while it is on.
create or replace function public.save_journal_summary(
  p_language text,
  p_entries_key text,
  p_summary jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_language not in ('en', 'km') or jsonb_typeof(p_summary) <> 'object' then
    raise exception 'Please check the details you entered.';
  end if;

  update public.journal_ai_summaries
  set language = p_language,
      entries_key = p_entries_key,
      summary = p_summary,
      generated_at = now(),
      updated_at = now()
  where user_id = (select auth.uid())
    and enabled;
end;
$$;

revoke all on function public.set_journal_summary_enabled(boolean) from public, anon;
revoke all on function public.claim_journal_summary_run() from public, anon;
revoke all on function public.save_journal_summary(text, text, jsonb) from public, anon;
grant execute on function public.set_journal_summary_enabled(boolean) to authenticated;
grant execute on function public.claim_journal_summary_run() to authenticated;
grant execute on function public.save_journal_summary(text, text, jsonb) to authenticated;

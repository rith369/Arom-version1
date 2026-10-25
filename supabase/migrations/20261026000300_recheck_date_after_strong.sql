-- Symptom check: a Strong recheck on or after the review day now sets the
-- next review 14 days later (BACKEND-HANDOFF.md section 35).
--
-- Before, a `high` result always took the "serious at any point" branch,
-- even at the 14 day review, and that branch never moved review_due_on. The
-- journey then stayed due with an old date, so "Time to check again" never
-- went away. Only that branch changes; the rest is the function from
-- 20261008000800_support_journeys.sql, unchanged. The trigger itself stays.

create or replace function public.apply_support_path()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'Asia/Phnom_Penh')::date;
  v_rank smallint := public.symptom_level_rank(new.level);
  v_journey public.support_journeys%rowtype;
  v_path public.support_path;
begin
  select * into v_journey
  from public.support_journeys
  where user_id = new.user_id and concern = new.check_type and status = 'active'
  for update;

  if not found then
    if v_rank = 0 then
      v_path := null;
    else
      v_path := case when v_rank = 3 then 'self_help_and_professional' else 'self_help' end;
      insert into public.support_journeys (
        user_id, concern, start_check_id, start_level, latest_check_id, latest_level,
        path, review_due_on, professional_recommended_at
      )
      values (
        new.user_id, new.check_type, new.id, new.level, new.id, new.level,
        v_path, v_today + 14, case when v_rank = 3 then now() end
      );
    end if;

  elsif v_rank = 3 then
    -- Serious at any point: professional and self help together. At or after
    -- the review day this check is the review, so the next one is in 14 days.
    v_path := 'self_help_and_professional';
    update public.support_journeys
    set latest_check_id = new.id,
        latest_level = new.level,
        path = v_path,
        professional_recommended_at = coalesce(professional_recommended_at, now()),
        review_due_on = case when v_today >= v_journey.review_due_on then v_today + 14 else review_due_on end
    where id = v_journey.id;

  elsif v_today >= v_journey.review_due_on then
    -- The 14 day review.
    if v_rank = 0 then
      v_path := null;
      update public.support_journeys
      set latest_check_id = new.id,
          latest_level = new.level,
          status = 'improved',
          ended_at = now()
      where id = v_journey.id;
    elsif v_rank >= public.symptom_level_rank(v_journey.start_level) then
      -- Same or higher after 14 days: recommend a professional.
      v_path := 'self_help_and_professional';
      update public.support_journeys
      set latest_check_id = new.id,
          latest_level = new.level,
          path = v_path,
          professional_recommended_at = coalesce(professional_recommended_at, now()),
          review_due_on = v_today + 14
      where id = v_journey.id;
    else
      -- Better but not gone: another 14 days from the new level.
      v_path := v_journey.path;
      update public.support_journeys
      set start_check_id = new.id,
          start_level = new.level,
          latest_check_id = new.id,
          latest_level = new.level,
          review_due_on = v_today + 14
      where id = v_journey.id;
    end if;

  else
    -- Before the review date: record progress only.
    v_path := v_journey.path;
    update public.support_journeys
    set latest_check_id = new.id,
        latest_level = new.level
    where id = v_journey.id;
  end if;

  update public.symptom_checks
  set recommended_path = v_path
  where id = new.id;

  return null;
end;
$$;

-- create or replace keeps the old grants; keep it callable by the trigger only.
revoke execute on function public.apply_support_path() from public, anon, authenticated;

-- Repair any journey already stuck this way: next review 14 days after its
-- Strong recheck. None were stuck on 26 Oct 2026; this is only a safety net.
update public.support_journeys j
set review_due_on = (c.created_at at time zone 'Asia/Phnom_Penh')::date + 14
from public.symptom_checks c
where c.id = j.latest_check_id
  and j.status = 'active'
  and j.latest_level = 'high'
  and (c.created_at at time zone 'Asia/Phnom_Penh')::date >= j.review_due_on;

-- What a client shared stops being visible 90 days after their last session with
-- that professional. (Security audit 5 Nov 2026, finding M2.)
--
-- Why: sharing never ended, so a therapist seen once long ago could keep seeing
-- new results, unless the client remembered to turn sharing off. A new session
-- starts it again, if sharing is on for that session. Clients can still turn it
-- off at any time.
--
-- Each function is the live definition with only the new check added.
-- To change the period, change sharing_cutoff() only.

begin;

create or replace function public.sharing_cutoff()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select now() - interval '90 days';
$$;

revoke all on function public.sharing_cutoff() from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.client_shares_with_me(p_client_id uuid, p_kind text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.appointments a
    where a.user_id = p_client_id
      and a.professional_id = (select auth.uid())
      and a.status in ('booked', 'completed')
      and a.ends_at > public.sharing_cutoff()
      and public.is_active_staff()
      and case p_kind
            when 'survey' then a.share_survey
            when 'symptoms' then a.share_symptom_checks
            else false
          end
  );
$function$;

CREATE OR REPLACE FUNCTION public.shared_mood_checkins(p_client_id uuid)
 RETURNS TABLE(day date, mood mood_level)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select m.checked_in_on, m.mood
  from public.mood_checkins m
  where m.user_id = p_client_id
    and m.checked_in_on > public.cambodia_today() - 30
    and public.is_active_staff()
    and exists (
      select 1 from public.appointments a
      where a.user_id = p_client_id
        and a.professional_id = (select auth.uid())
        and a.status in ('booked', 'completed')
        and a.ends_at > public.sharing_cutoff()
        and a.share_mood_trend
    )
  order by m.checked_in_on;
$function$;

CREATE OR REPLACE FUNCTION public.can_read_care_check_ins(p_task_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select exists (
    select 1 from public.care_tasks t
    where t.id = p_task_id
      and (
        t.client_id = (select auth.uid())
        or (
          t.professional_id = (select auth.uid())
          and public.is_active_staff()
          and exists (
            select 1 from public.care_sharing s
            where s.professional_id = t.professional_id
              and s.client_id = t.client_id
              and s.share_progress
          )
          and exists (
            select 1 from public.appointments a
            where a.user_id = t.client_id
              and a.professional_id = t.professional_id
              and a.status in ('booked', 'completed')
              and a.ends_at > public.sharing_cutoff()
          )
        )
      )
  );
$function$;

CREATE OR REPLACE FUNCTION public.pro_client_ace_safe(p_client_alias_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_client uuid;
  v_result jsonb;
begin
  v_client := public.resolve_message_recipient(p_client_alias_id, 'professional');

  select jsonb_build_object(
    'answers', to_jsonb(ai.answers),
    'updatedAt', ai.updated_at
  )
  into v_result
  from public.ace_intakes as ai
  where ai.client_id = v_client
    and ai.professional_id = (select auth.uid())
    and exists (
      select 1 from public.appointments a
      where a.user_id = v_client
        and a.professional_id = (select auth.uid())
        and a.status in ('booked', 'completed')
        and a.ends_at > public.sharing_cutoff()
    );

  return v_result;
end;
$function$;

CREATE OR REPLACE FUNCTION public.pro_client_self_map_safe(p_client_alias_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_client uuid;
begin
  v_client := public.resolve_message_recipient(p_client_alias_id, 'professional');

  if not exists (
    select 1
    from public.self_map_shares as sh
    where sh.client_id = v_client
      and sh.professional_id = (select auth.uid())
  ) or not exists (
    select 1 from public.appointments a
    where a.user_id = v_client
      and a.professional_id = (select auth.uid())
      and a.status in ('booked', 'completed')
      and a.ends_at > public.sharing_cutoff()
  ) then
    return null;
  end if;

  return coalesce(
    (
      select jsonb_object_agg(s.part, jsonb_build_object('answers', s.answers, 'updatedAt', s.updated_at))
      from public.self_map_parts as s
      where s.user_id = v_client
    ),
    '{}'::jsonb
  );
end;
$function$;

commit;

begin;

create or replace function public.get_shared_client_data_safe(
  p_client_alias_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_client uuid;
  v_survey jsonb := null;
  v_checks jsonb := '[]'::jsonb;
begin
  v_client := public.resolve_message_recipient(
    p_client_alias_id,
    'professional'
  );

  -- Preserve the existing survey-sharing permission.
  if coalesce(
    public.client_shares_with_me(v_client, 'survey'),
    false
  ) then
    select jsonb_build_object(
      'feelings', coalesce(to_jsonb(s.feelings), '[]'::jsonb),
      'frequency', coalesce(to_jsonb(s.frequency), '"sometimes"'::jsonb),
      'impact', coalesce(to_jsonb(s.impact), '0'::jsonb),
      'challenges', coalesce(to_jsonb(s.challenges), '[]'::jsonb),
      'priorSupport',
        coalesce(to_jsonb(s.prior_support), '"prefer_not_say"'::jsonb),
      'goals', coalesce(to_jsonb(s.goals), '[]'::jsonb),
      'createdAt', s.created_at
    )
    into v_survey
    from public.onboarding_surveys as s
    where s.user_id = v_client
    order by s.created_at desc
    limit 1;
  end if;

  -- Preserve the separate symptom-sharing permission.
  if coalesce(
    public.client_shares_with_me(v_client, 'symptoms'),
    false
  ) then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'type', c.check_type,
          'score', coalesce(c.score, 0),
          'maxScore', coalesce(c.max_score, 0),
          'level', c.level,
          'createdAt', c.created_at
        )
        order by c.created_at desc
      ),
      '[]'::jsonb
    )
    into v_checks
    from (
      select
        sc.check_type,
        sc.score,
        sc.max_score,
        sc.level,
        sc.created_at
      from public.symptom_checks as sc
      where sc.user_id = v_client
      order by sc.created_at desc
      limit 20
    ) as c;
  end if;

  return jsonb_build_object(
    'survey', v_survey,
    'symptomChecks', v_checks
  );
end;
$$;

revoke execute
  on function public.get_shared_client_data_safe(uuid)
  from public, anon;

grant execute
  on function public.get_shared_client_data_safe(uuid)
  to authenticated;

commit;
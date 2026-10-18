begin;

create or replace function public.suggest_session_safe(
  p_client_id uuid,
  p_session_type public.session_type,
  p_duration_minutes integer,
  p_times timestamptz[],
  p_every_weeks integer,
  p_session_count integer,
  p_note text
)
returns public.session_suggestions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_client uuid;
  v_row public.session_suggestions;
begin
  v_client := public.resolve_message_recipient(
    p_client_id,
    'professional'
  );

  -- The original function checks messaging and session rules.
  v_row := public.suggest_session(
    v_client,
    p_session_type,
    p_duration_minutes,
    p_times,
    p_every_weeks,
    p_session_count,
    p_note
  );

  -- Change only the returned value. Storage keeps the real ID.
  v_row.client_id := p_client_id;

  return v_row;
end;
$$;

revoke execute on function public.suggest_session_safe(
  uuid, public.session_type, integer, timestamptz[],
  integer, integer, text
) from public, anon;

grant execute on function public.suggest_session_safe(
  uuid, public.session_type, integer, timestamptz[],
  integer, integer, text
) to authenticated;

create or replace function public.withdraw_session_suggestion_safe(
  p_suggestion_id uuid
)
returns public.session_suggestions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.session_suggestions;
  v_alias uuid;
begin
  -- The original function checks ownership and open status.
  v_row := public.withdraw_session_suggestion(p_suggestion_id);

  select a.alias_id into v_alias
  from public.professional_client_aliases as a
  where a.professional_id = (select auth.uid())
    and a.professional_id = v_row.professional_id
    and a.user_id = v_row.client_id;

  if v_alias is null then
    raise exception 'Client alias not found.'
      using errcode = 'PT404';
  end if;

  v_row.client_id := v_alias;

  return v_row;
end;
$$;

revoke execute
  on function public.withdraw_session_suggestion_safe(uuid)
  from public, anon;

grant execute
  on function public.withdraw_session_suggestion_safe(uuid)
  to authenticated;

commit;
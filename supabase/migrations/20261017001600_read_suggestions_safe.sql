begin;

create or replace function public.read_session_suggestions_safe(
  p_as text,
  p_ids uuid[] default null,
  p_open_only boolean default false,
  p_limit integer default 100
)
returns setof public.session_suggestions
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_row public.session_suggestions;
  v_alias uuid;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if p_as is null or p_as not in ('client', 'professional') then
    raise exception 'Unknown side.'
      using errcode = '22023';
  end if;

  for v_row in
    select s.*
    from public.session_suggestions as s
    where (
      (p_as = 'client' and s.client_id = v_me)
      or
      (p_as = 'professional' and s.professional_id = v_me)
    )
      and (p_ids is null or s.id = any(p_ids))
      and (not coalesce(p_open_only, false) or s.status = 'open')
    order by s.created_at desc, s.id desc
    limit least(greatest(coalesce(p_limit, 100), 1), 300)
  loop
    if p_as = 'professional' then
      select a.alias_id into v_alias
      from public.professional_client_aliases as a
      where a.professional_id = v_me
        and a.user_id = v_row.client_id;

      if v_alias is null then
        raise exception 'Client alias not found.'
          using errcode = 'PT404';
      end if;

      v_row.client_id := v_alias;
    end if;

    return next v_row;
  end loop;

  return;
end;
$$;

revoke execute on function public.read_session_suggestions_safe(
  text, uuid[], boolean, integer
) from public, anon;

grant execute on function public.read_session_suggestions_safe(
  text, uuid[], boolean, integer
) to authenticated;

commit;
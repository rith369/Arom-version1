begin;

create or replace function public.refresh_pro_meeting_links_safe(
  p_old_url text,
  p_new_url text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_new_url text := nullif(btrim(p_new_url), '');
  v_count integer;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if v_new_url is not null and (
    char_length(v_new_url) > 500
    or v_new_url !~ '^https://[^[:space:]]+$'
  ) then
    raise exception 'Enter a valid HTTPS meeting link.'
      using errcode = '22023';
  end if;

  update public.appointments as a
  set meeting_url = v_new_url
  where a.professional_id = v_me
    and a.session_type = 'online'
    and a.status = 'booked'
    and a.starts_at > now()
    and (
      a.meeting_url is null
      or a.meeting_url = p_old_url
    );

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke execute
  on function public.refresh_pro_meeting_links_safe(text, text)
  from public, anon;

grant execute
  on function public.refresh_pro_meeting_links_safe(text, text)
  to authenticated;

notify pgrst, 'reload schema';

commit;
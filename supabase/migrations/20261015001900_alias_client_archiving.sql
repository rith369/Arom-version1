begin;

create or replace function public.my_archived_client_aliases()
returns table (
  client_alias_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.alias_id
  from public.conversations as c
  join public.professional_client_aliases as a
    on a.professional_id = c.professional_id
   and a.user_id = c.client_id
  where c.professional_id = (select auth.uid())
    and c.closed_at is not null;
$$;

revoke execute on function public.my_archived_client_aliases()
  from public, anon;

grant execute on function public.my_archived_client_aliases()
  to authenticated;

create or replace function public.set_client_archived_safe(
  p_client_id uuid,
  p_archived boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_archived is null then
    raise exception 'Archive status is required.'
      using errcode = '22023';
  end if;

  perform public.set_client_archived(
    public.resolve_message_recipient(p_client_id, 'professional'),
    p_archived
  );
end;
$$;

revoke execute
  on function public.set_client_archived_safe(uuid, boolean)
  from public, anon;

grant execute
  on function public.set_client_archived_safe(uuid, boolean)
  to authenticated;

commit;
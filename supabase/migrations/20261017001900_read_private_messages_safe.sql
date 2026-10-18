begin;

create or replace function public.read_private_messages_safe(
  p_conversation_id uuid,
  p_limit integer default 300
)
returns table (
  id uuid,
  sender_id uuid,
  kind text,
  body text,
  duration_seconds integer,
  suggestion_id uuid,
  created_at timestamptz,
  read_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if not coalesce(
    public.is_conversation_member(p_conversation_id),
    false
  ) then
    raise exception 'Conversation not found.'
      using errcode = 'PT404';
  end if;

  return query
    select
      m.id,
      case
        when m.sender_id = (select auth.uid())
          then m.sender_id
        else null::uuid
      end,
      m.kind,
      m.body,
      m.duration_seconds::integer,
      m.suggestion_id,
      m.created_at,
      m.read_at
    from public.messages as m
    where m.conversation_id = p_conversation_id
    order by m.created_at desc, m.id desc
    limit least(greatest(coalesce(p_limit, 300), 1), 300);
end;
$$;

revoke execute
  on function public.read_private_messages_safe(uuid, integer)
  from public, anon;

grant execute
  on function public.read_private_messages_safe(uuid, integer)
  to authenticated;

commit;
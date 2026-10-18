begin;

-- Resolve an alias internally, only for the signed-in professional.
create or replace function public.resolve_message_recipient(
  p_other uuid,
  p_as text
)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_client uuid;
begin
  if v_me is null then
    raise exception 'Please log in to continue.'
      using errcode = 'PT401';
  end if;

  if p_as = 'client' then
    -- Clients already address professionals by their public profile ID.
    return p_other;
  elsif p_as = 'professional' then
    select a.user_id into v_client
    from public.professional_client_aliases as a
    where a.professional_id = v_me
      and a.alias_id = p_other;

    if v_client is null then
      raise exception 'Conversation not found.'
        using errcode = 'PT404';
    end if;

    return v_client;
  end if;

  raise exception 'Unknown side.' using errcode = '22023';
end;
$$;

-- This helper must never expose its result directly to clients.
revoke execute
  on function public.resolve_message_recipient(uuid, text)
  from public, anon, authenticated;

create or replace function public.open_conversation_safe(
  p_other uuid,
  p_as text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.open_conversation(
    public.resolve_message_recipient(p_other, p_as),
    p_as
  );
end;
$$;

revoke execute
  on function public.open_conversation_safe(uuid, text)
  from public, anon;

grant execute
  on function public.open_conversation_safe(uuid, text)
  to authenticated;

create or replace function public.send_message_safe(
  p_other uuid,
  p_as text,
  p_kind text,
  p_body text default null,
  p_audio_path text default null,
  p_duration_seconds integer default null
)
returns public.messages
language plpgsql
security definer
set search_path = ''
as $$
begin
  return public.send_message(
    public.resolve_message_recipient(p_other, p_as),
    p_as,
    p_kind,
    p_body,
    p_audio_path,
    p_duration_seconds
  );
end;
$$;

revoke execute
  on function public.send_message_safe(
    uuid, text, text, text, text, integer
  )
  from public, anon;

grant execute
  on function public.send_message_safe(
    uuid, text, text, text, text, integer
  )
  to authenticated;

commit;
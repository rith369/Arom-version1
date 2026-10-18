begin;

-- Return notes keyed by alias, never by real account ID.
create or replace function public.my_client_summary_notes_safe()
returns table (
  client_alias_id uuid,
  content text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    a.alias_id,
    n.content,
    n.updated_at
  from public.client_summary_notes as n
  join public.professional_client_aliases as a
    on a.professional_id = n.professional_id
   and a.user_id = n.client_id
  where n.professional_id = (select auth.uid());
$$;

revoke execute on function public.my_client_summary_notes_safe()
  from public, anon;

grant execute on function public.my_client_summary_notes_safe()
  to authenticated;

-- Resolve the alias internally before saving or deleting a note.
create or replace function public.save_client_summary_note_safe(
  p_client_alias_id uuid,
  p_text text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_client uuid;
  v_text text;
begin
  v_client := public.resolve_message_recipient(
    p_client_alias_id,
    'professional'
  );

  if p_text is null or char_length(p_text) > 5000 then
    raise exception 'A summary note must be 5000 characters or fewer.'
      using errcode = '22023';
  end if;

  v_text := btrim(p_text);

  if v_text = '' then
    delete from public.client_summary_notes as n
    where n.professional_id = v_me
      and n.client_id = v_client;

    return;
  end if;

  -- Existing notes can be edited. A new note requires a booking.
  if not exists (
    select 1
    from public.client_summary_notes as n
    where n.professional_id = v_me
      and n.client_id = v_client
  ) and not exists (
    select 1
    from public.appointments as a
    where a.professional_id = v_me
      and a.user_id = v_client
  ) then
    raise exception 'Client not found.'
      using errcode = 'PT404';
  end if;

  insert into public.client_summary_notes (
    professional_id,
    client_id,
    content,
    updated_at
  )
  values (
    v_me,
    v_client,
    v_text,
    now()
  )
  on conflict (professional_id, client_id)
  do update set
    content = excluded.content,
    updated_at = excluded.updated_at;
end;
$$;

revoke execute
  on function public.save_client_summary_note_safe(uuid, text)
  from public, anon;

grant execute
  on function public.save_client_summary_note_safe(uuid, text)
  to authenticated;

commit;
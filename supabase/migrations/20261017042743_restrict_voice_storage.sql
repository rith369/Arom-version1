begin;

create or replace function public.can_delete_unsent_voice(
  p_name text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and split_part(p_name, '/', 2) = (select auth.uid())::text
    and public.is_conversation_member(
      public.voice_conversation_id(p_name)
    )
    and not exists (
      select 1
      from public.messages as m
      where m.audio_path = p_name
    );
$$;

revoke execute on function public.can_delete_unsent_voice(text)
  from public, anon;

grant execute on function public.can_delete_unsent_voice(text)
  to authenticated;

drop policy "Conversation members read voice messages"
  on storage.objects;

create policy "Senders read own voice files"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'message-voice'
    and split_part(name, '/', 2) = (select auth.uid())::text
    and public.is_conversation_member(
      public.voice_conversation_id(name)
    )
  );

drop policy "Senders remove unsent voice files"
  on storage.objects;

create policy "Senders remove unsent voice files"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'message-voice'
    and public.can_delete_unsent_voice(name)
  );

commit;
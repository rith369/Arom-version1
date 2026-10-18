begin;

-- Ensure the earlier voice-delete protection is installed first.
do $$
begin
  if to_regprocedure(
    'public.can_delete_unsent_voice(text)'
  ) is null or not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Senders remove unsent voice files'
      and qual ilike '%can_delete_unsent_voice%'
  ) then
    raise exception
      'Apply 20261017042743_restrict_voice_storage.sql first.';
  end if;
end;
$$;

-- Application reads now go through the protected RPCs.
revoke select on table
  public.conversations,
  public.messages
from public, anon, authenticated;

drop policy if exists "Members read their conversations"
  on public.conversations;

drop policy if exists "Members read their messages"
  on public.messages;

commit;
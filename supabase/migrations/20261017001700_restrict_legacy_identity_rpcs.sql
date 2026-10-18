begin;

revoke execute
  on function public.my_conversations(text)
  from public, anon, authenticated;

revoke execute
  on function public.suggest_session(
    uuid,
    public.session_type,
    integer,
    timestamptz[],
    integer,
    integer,
    text
  )
  from public, anon, authenticated;

revoke execute
  on function public.withdraw_session_suggestion(uuid)
  from public, anon, authenticated;

commit;
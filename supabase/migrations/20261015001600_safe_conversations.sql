-- Cover any existing conversation that does not have an appointment row.
-- Give every new conversation a stable private alias.
create or replace function public.ensure_conversation_client_alias()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.professional_client_aliases (
    professional_id,
    user_id
  )
  values (
    new.professional_id,
    new.client_id
  )
  on conflict (professional_id, user_id) do nothing;

  return new;
end;
$$;

revoke execute
  on function public.ensure_conversation_client_alias()
  from public, anon, authenticated;

create trigger conversations_ensure_client_alias
  after insert on public.conversations
  for each row
  execute function public.ensure_conversation_client_alias();

-- Cover existing conversations too.
insert into public.professional_client_aliases (
  professional_id,
  user_id
)
select distinct professional_id, client_id
from public.conversations
on conflict (professional_id, user_id) do nothing;

create or replace function public.my_conversations_safe(p_as text)
returns table (
  conversation_id uuid,
  professional_id uuid,
  slug text,
  display_name text,
  display_name_km text,
  photo_url text,
  reply_time text,
  client_id uuid,
  closed boolean,
  can_write boolean,
  last_kind text,
  last_mine boolean,
  last_body text,
  last_at timestamptz,
  unread integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.conversation_id,
    c.professional_id,
    c.slug,
    c.display_name,
    c.display_name_km,
    c.photo_url,
    c.reply_time,
    case
      when p_as = 'professional' then alias.alias_id
      else c.client_id
    end as client_id,
    c.closed,
    c.can_write,
    c.last_kind,
    c.last_mine,
    c.last_body,
    c.last_at,
    c.unread
  from public.my_conversations(p_as) as c
  left join public.professional_client_aliases as alias
    on alias.professional_id = c.professional_id
   and alias.user_id = c.client_id
  where p_as <> 'professional'
     or alias.alias_id is not null;
$$;

revoke execute on function public.my_conversations_safe(text)
  from public, anon;

grant execute on function public.my_conversations_safe(text)
  to authenticated;
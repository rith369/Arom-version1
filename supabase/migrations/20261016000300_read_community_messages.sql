create or replace function public.read_community_messages(p_group_id uuid)
returns table (
  id uuid,
  content text,
  created_at timestamptz,
  display_name text,
  is_own boolean,
  is_mentor boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Sign in to read messages';
  end if;

  if not (
    public.is_group_member(p_group_id)
    or public.is_group_mentor(p_group_id)
    or public.is_admin()
  ) then
    raise exception 'You cannot read this group';
  end if;

  return query
    select
      m.id,
      m.content,
      m.created_at,
      case
        when p.role = 'user' and p.hide_identity then
          case
            when m.author_id = (select auth.uid()) then 'Anonymous (You)'
            else 'Anonymous'
          end
        else coalesce(nullif(p.full_name, ''), 'Member')
      end as display_name,
      m.author_id = (select auth.uid()) as is_own,
      m.author_id = g.mentor_id as is_mentor
    from public.community_messages as m
    join public.profiles as p on p.id = m.author_id
    join public.support_groups as g on g.id = m.group_id
    where m.group_id = p_group_id
      and (not m.is_hidden or m.author_id = (select auth.uid()) or public.is_admin())
    order by m.created_at asc
    limit 100;
end;
$$;

revoke execute on function public.read_community_messages(uuid)
  from public, anon;

grant execute on function public.read_community_messages(uuid)
  to authenticated;
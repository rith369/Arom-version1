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
    coalesce(public.is_group_member(p_group_id), false)
    or coalesce(public.is_group_mentor(p_group_id), false)
    or coalesce(public.is_admin(), false)
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
        from (
      select cm.*
      from public.community_messages as cm
      where cm.group_id = p_group_id
        and (
          not cm.is_hidden
          or cm.author_id = (select auth.uid())
          or public.is_admin()
        )
      order by cm.created_at desc, cm.id desc
      limit 100
    ) as m
    join public.profiles as p on p.id = m.author_id
    join public.support_groups as g on g.id = m.group_id
    order by m.created_at asc, m.id asc;
end;
$$;

revoke execute on function public.read_community_messages(uuid)
  from public, anon;

grant execute on function public.read_community_messages(uuid)
  to authenticated;
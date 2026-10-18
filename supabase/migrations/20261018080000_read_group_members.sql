-- AROM: the Members tab of a support group.
--
-- read_group_members(group) returns the mentor and the current members of one
-- group, only to someone who may read its chat (a member, its mentor or an
-- admin). Names follow the same rule as read_community_messages(): a client
-- with hide_identity on shows as "Anonymous"; everyone else by name. The
-- mentor shows with their professional display name, title, years of
-- experience and photo, so members know who leads the group.
--
-- It never returns account ids, emails or profile details. member_key is the
-- membership row id (group_members.id), or the group id for the mentor, only
-- used by the page to tell rows apart.
--
-- Members who left or were removed are not listed.

begin;

create or replace function public.read_group_members(p_group_id uuid)
returns table (
  member_key uuid,
  display_name text,
  display_name_km text,
  is_mentor boolean,
  is_you boolean,
  mentor_title text,
  mentor_title_km text,
  mentor_years integer,
  photo_url text,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'Sign in to see group members' using errcode = 'PT401';
  end if;

  if not (
    coalesce(public.is_group_member(p_group_id), false)
    or coalesce(public.is_group_mentor(p_group_id), false)
    or coalesce(public.is_admin(), false)
  ) then
    raise exception 'You cannot see the members of this group' using errcode = 'PT403';
  end if;

  return query
    -- The mentor first.
    select
      g.id,
      coalesce(nullif(btrim(pp.display_name), ''), 'Group mentor'),
      coalesce(nullif(btrim(pp.display_name_km), ''), nullif(btrim(pp.display_name), ''), 'អ្នកណែនាំក្រុម'),
      true,
      g.mentor_id = v_me,
      pp.title,
      coalesce(nullif(btrim(pp.title_km), ''), pp.title),
      pp.years_experience::integer,
      pp.photo_url,
      g.created_at
    from public.support_groups as g
    left join public.professional_profiles as pp on pp.id = g.mentor_id
    where g.id = p_group_id
      and g.mentor_id is not null

    union all

    -- Then the members, oldest first.
    select
      gm.id,
      case
        when p.role = 'user' and coalesce(p.hide_identity, true) then 'Anonymous'
        else coalesce(nullif(btrim(p.full_name), ''), 'Member')
      end,
      case
        when p.role = 'user' and coalesce(p.hide_identity, true) then 'អនាមិក'
        else coalesce(nullif(btrim(p.full_name), ''), 'សមាជិក')
      end,
      false,
      gm.user_id = v_me,
      null::text,
      null::text,
      null::integer,
      null::text,
      gm.joined_at
    from public.group_members as gm
    join public.profiles as p on p.id = gm.user_id
    join public.support_groups as g on g.id = gm.group_id
    where gm.group_id = p_group_id
      and gm.left_at is null
      and gm.removed_at is null
      and gm.user_id is distinct from g.mentor_id
    order by 4 desc, 10 asc;
end;
$$;

revoke execute on function public.read_group_members(uuid) from public, anon;
grant execute on function public.read_group_members(uuid) to authenticated;

notify pgrst, 'reload schema';

commit;

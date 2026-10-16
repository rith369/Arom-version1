-- Mentors can still get a member count through get_group_member_count().
-- They must not receive the membership rows containing user_id.
drop policy if exists "Mentors read their group members"
  on public.group_members;

drop policy if exists "Users read own waitlist spots"
  on public.group_waitlist;

create policy "Users read own waitlist spots"
  on public.group_waitlist for select to authenticated
  using (user_id = (select auth.uid()));

-- The raw reply row contains author_id. A safe Community API will
-- provide messages to group members and mentors without that field.
drop policy if exists "Members read visible replies"
  on public.discussion_replies;

create policy "Authors and admins read raw replies"
  on public.discussion_replies for select to authenticated
  using (author_id = (select auth.uid()) or public.is_admin());

-- Raw check-in rows contain user_id.
drop policy if exists "Members read own check-ins"
  on public.group_checkins;

create policy "Members and admins read raw check-ins"
  on public.group_checkins for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());
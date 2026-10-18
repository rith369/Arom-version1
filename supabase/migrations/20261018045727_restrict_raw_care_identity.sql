begin;

-- Clients may read their own task rows.
-- Professionals use read_pro_care_plan_safe().
drop policy "Client and professional read care tasks"
  on public.care_tasks;

create policy "Clients read own care tasks"
  on public.care_tasks
  for select
  to authenticated
  using (client_id = (select auth.uid()));

-- Clients may read their own sharing settings.
drop policy "Client and professional read sharing"
  on public.care_sharing;

create policy "Clients read own care sharing"
  on public.care_sharing
  for select
  to authenticated
  using (client_id = (select auth.uid()));

-- The original function returns a task containing the real client ID.
-- Only its protected wrapper should call it.
revoke execute on function public.give_care_task(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  smallint[],
  date,
  time without time zone
) from public, anon, authenticated;

notify pgrst, 'reload schema';

commit;
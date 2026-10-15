drop policy if exists "Reporters and admins read flags"
  on public.safety_flags;

create policy "Admins read raw safety flags"
  on public.safety_flags for select to authenticated
  using (public.is_admin());
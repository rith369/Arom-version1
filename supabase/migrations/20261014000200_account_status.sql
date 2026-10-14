-- AROM: suspend and restore accounts from the admin area.
-- Used by the admin Professionals page (suspend or reinstate a professional)
-- and later by the Users page. See BACKEND-HANDOFF.md sections 5 and 6.
--
-- The audit_admin_change trigger on profiles already writes
-- 'change_account_status' with the reason, so this function does not log twice.

create or replace function public.set_account_status(
  p_user_id uuid,
  p_status public.account_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reason text := nullif(trim(p_reason), '');
begin
  if not public.is_admin() then
    raise exception 'Only an admin can suspend or restore accounts';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'You cannot change the status of your own account';
  end if;
  if p_status = 'suspended' and v_reason is null then
    raise exception 'Write a reason for the suspension';
  end if;
  if char_length(v_reason) > 500 then
    raise exception 'Keep the reason under 500 characters';
  end if;

  update public.profiles
  set account_status = p_status,
      suspended_at = case when p_status = 'suspended' then now() end,
      suspended_reason = case when p_status = 'suspended' then v_reason end
  where id = p_user_id;

  if not found then
    raise exception 'Account not found';
  end if;

  -- A reinstatement note is kept in the audit log, since suspended_reason is cleared.
  if p_status = 'active' and v_reason is not null then
    insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
    values ((select auth.uid()), 'reinstate_note', 'profiles', p_user_id,
            jsonb_build_object('note', v_reason));
  end if;
end;
$$;

revoke execute on function public.set_account_status(uuid, public.account_status, text) from public, anon;
grant execute on function public.set_account_status(uuid, public.account_status, text) to authenticated;

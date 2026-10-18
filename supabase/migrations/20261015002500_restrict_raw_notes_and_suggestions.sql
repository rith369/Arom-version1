begin;

-- Notes are now accessed through the protected alias RPCs.
revoke all on table public.client_summary_notes
  from public, anon, authenticated;

drop policy "Professionals delete own summary notes"
  on public.client_summary_notes;

drop policy "Professionals edit own summary notes"
  on public.client_summary_notes;

drop policy "Professionals read own summary notes"
  on public.client_summary_notes;

drop policy "Professionals write summary notes for own clients"
  on public.client_summary_notes;

-- Professionals use the alias RPC.
-- Clients can still read suggestions addressed to themselves.
drop policy "Client and professional read suggestions"
  on public.session_suggestions;

create policy "Clients read own suggestions"
  on public.session_suggestions
  for select
  to authenticated
  using (client_id = (select auth.uid()));

commit;
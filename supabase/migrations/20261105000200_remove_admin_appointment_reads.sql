-- Admins no longer read whole booking records. (Security audit 5 Nov 2026, finding H4.)
--
-- Why: this policy let any admin login fetch every column of every booking,
-- including the client's id and their private intake note, and nothing was
-- logged. AGENTS.md section 9 says admin reading must not extend to bookings.
--
-- The admin Bookings page and overview keep working: admin_list_bookings() and
-- admin_stats() run with their own rights and return only limited columns.

begin;

drop policy "Admins read all appointments" on public.appointments;

commit;

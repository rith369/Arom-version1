-- Symptom check: three more check types (BACKEND-HANDOFF.md section 35).
--   wellbeing  : WHO-5 Well-Being Index, saved as 0 to 100 (higher is better)
--   loneliness : UCLA 3 item Loneliness Scale, saved as 3 to 9
--   trauma     : PCL-5 (public domain, US National Center for PTSD), 0 to 80
--
-- Only adds enum values. symptom_checks, support_journeys, their RLS and
-- apply_support_path() work for any check type, so nothing else changes.
-- Kept in its own file because Postgres cannot use a new enum value in the
-- same transaction that adds it.

alter type public.symptom_check_type add value if not exists 'wellbeing';
alter type public.symptom_check_type add value if not exists 'loneliness';
alter type public.symptom_check_type add value if not exists 'trauma';

-- Symptom check: two more check types (BACKEND-HANDOFF.md section 35).
--   wellbeing  : WHO-5 Well-Being Index, saved as 0 to 100 (higher is better)
--   loneliness : UCLA 3 item Loneliness Scale, saved as 3 to 9
--
-- Only adds enum values. symptom_checks, support_journeys, their RLS and
-- apply_support_path() work for any check type, so nothing else changes.
-- Kept in its own file because Postgres cannot use a new enum value in the
-- same transaction that adds it.

alter type public.symptom_check_type add value if not exists 'wellbeing';
alter type public.symptom_check_type add value if not exists 'loneliness';

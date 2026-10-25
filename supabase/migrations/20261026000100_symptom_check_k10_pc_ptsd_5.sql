-- Symptom check: two more check types (BACKEND-HANDOFF.md section 35).
--   distress      : K-10 Kessler Psychological Distress Scale, saved as 10 to 50
--   trauma_screen : PC-PTSD-5 (public domain, US National Center for PTSD), 0 to 5
--
-- Only adds enum values. symptom_checks, support_journeys, their RLS and
-- apply_support_path() work for any check type, so nothing else changes.
-- Kept in its own file because Postgres cannot use a new enum value in the
-- same transaction that adds it.

alter type public.symptom_check_type add value if not exists 'distress';
alter type public.symptom_check_type add value if not exists 'trauma_screen';

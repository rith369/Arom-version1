-- Symptom check: two more check types for stress (BACKEND-HANDOFF.md section 35).
--   work_burnout  : Copenhagen Burnout Inventory, work related burnout, saved as 0 to 100
--   body_symptoms : PHQ-15 body symptoms, saved as 0 to 30
--
-- Only adds enum values. symptom_checks, support_journeys, their RLS and
-- apply_support_path() work for any check type, so nothing else changes.
-- Kept in its own file because Postgres cannot use a new enum value in the
-- same transaction that adds it.

alter type public.symptom_check_type add value if not exists 'work_burnout';
alter type public.symptom_check_type add value if not exists 'body_symptoms';

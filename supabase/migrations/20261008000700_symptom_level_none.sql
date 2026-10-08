-- AROM 7 of 8: allow a symptom check result of "none".
-- Kept in its own file because Postgres cannot use a new enum value
-- in the same transaction that adds it.

alter type public.symptom_level add value if not exists 'none' before 'low';

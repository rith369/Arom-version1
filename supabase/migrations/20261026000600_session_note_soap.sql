-- Session notes: longer notes and an optional SOAP format (section 16).
--
-- A note is either free text (content) or SOAP: what the client said
-- (subjective), what the professional observed (objective), their assessment,
-- and the plan. The whole note can be up to 20,000 characters (it was 10,000
-- in the database and 5,000 in the app). Existing notes stay free text.
-- Row level security is unchanged: only the professional who wrote a note
-- reads it. No function reads this table.

begin;

alter table public.session_notes drop constraint if exists session_notes_content_check;

alter table public.session_notes
  add column format text not null default 'free' check (format in ('free', 'soap')),
  add column subjective text not null default '',
  add column objective text not null default '',
  add column assessment text not null default '',
  add column plan text not null default '';

alter table public.session_notes
  add constraint session_notes_length_check check (
    char_length(content) + char_length(subjective) + char_length(objective)
      + char_length(assessment) + char_length(plan) <= 20000
  );

commit;

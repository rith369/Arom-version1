-- Logged out visitors lose rights they never needed. (Security audit 5 Nov 2026,
-- finding M9.)
--
-- Why: anon could be granted reads and writes on most tables, and only row rules
-- (RLS) stopped it. This adds a second lock, so one wrong policy or a table with
-- RLS turned off cannot expose private data to strangers.
--
-- Logged out visitors keep reading the 8 tables with a public policy. Functions
-- they use, such as public_open_slots, run with their own rights and still work.
-- Signed in people are not affected.

begin;

do $$
declare
  v_table text;
  v_public constant text[] := array[
    'announcements',
    'clinics',
    'crisis_resources',
    'journal_prompts',
    'podcasts',
    'professional_clinics',
    'professional_profiles',
    'support_contact'
  ];
begin
  for v_table in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format('revoke all on table public.%I from anon', v_table);
    if v_table = any (v_public) then
      execute format('grant select on table public.%I to anon', v_table);
    end if;
  end loop;
end;
$$;

-- Tables made from now on start with no rights for logged out visitors. A new
-- public table needs its own grant select to anon, next to its policy.
alter default privileges for role postgres in schema public revoke all on tables from anon;

commit;

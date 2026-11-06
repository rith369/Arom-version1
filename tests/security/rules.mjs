// Rules every table and function must follow, checked on the whole schema so a
// new migration cannot quietly break them. Runs in a throwaway database.
import { build, finish } from './harness.mjs';

const db = await build();
const rows = async (sql) => (await db.query(sql)).rows;
const names = (list) => list.map((r) => r.name).sort().join(', ') || 'none';
const results = [];
const t = (group, name, got, want) => results.push({ group, name, got, want, pass: got === want });

// Privileged functions a logged out visitor may call. Each one must work, or
// safely return nothing, without a login. A new function open to visitors
// fails this test: revoke it from anon, or add it here if it is meant to be public.
const ANON_ALLOWED = [
  'can_see_clinic',
  'client_shares_with_me',
  'clinic_open_times',
  'clinic_therapists',
  'current_user_role',
  'is_admin',
  'is_group_member',
  'is_group_mentor',
  'is_listed_professional',
  'is_verified_professional',
  'list_public_professionals',
  'public_open_slots',
  'public_professional_reviews',
  'public_review_summaries',
];

const T = 'Tables';
t(T, 'every table has row level security on', names(await rows(`
  select c.relname name from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity`)), 'none');
t(T, 'no views (they skip row level security)', names(await rows(`
  select c.relname name from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('v', 'm')`)), 'none');
t(T, 'no write policy that lets everyone through', names(await rows(`
  select tablename || ' / ' || policyname name from pg_policies
  where schemaname = 'public' and cmd <> 'SELECT'
    and (coalesce(qual, '') = 'true' or coalesce(with_check, '') = 'true')`)), 'none');

const F = 'Functions';
t(F, 'every privileged function fixes its search_path', names(await rows(`
  select p.proname name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prosecdef
    and not exists (select 1 from unnest(coalesce(p.proconfig, '{}')) c where c like 'search_path=%')`)), 'none');
const openToAnon = await rows(`
  select distinct p.proname name from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prosecdef and p.prorettype <> 'trigger'::regtype
    and has_function_privilege('anon', p.oid, 'EXECUTE')`);
t(F, 'logged out visitors can call only the known privileged functions',
  names(openToAnon.filter((r) => !ANON_ALLOWED.includes(r.name))), 'none');
t(F, 'admin functions are closed to logged out visitors', names(openToAnon.filter((r) => r.name.startsWith('admin_'))), 'none');

finish('rules', results);

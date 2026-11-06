// Fake users in a throwaway in-memory database. Never touches Supabase.
import { build, finish } from './harness.mjs';

const db = await build();
const ID = {
  admin: '00000000-0000-4000-8000-000000000001',
  pro: '00000000-0000-4000-8000-000000000003',
  pro2: '00000000-0000-4000-8000-000000000004',
  recent: '00000000-0000-4000-8000-00000000000a',
  old: '00000000-0000-4000-8000-00000000000b',
  rebooked: '00000000-0000-4000-8000-00000000000c',
  off: '00000000-0000-4000-8000-00000000000d',
  staleBooked: '00000000-0000-4000-8000-00000000000e',
};
const ago = (d) => `now()-interval '${d} days'`;
const appt = (user, pro, end, status, flags = 'true,true,true') =>
  `('${user}','${pro}','online',${end}-interval '1 hour',${end},'${status}',${flags})`;

await db.exec(`
insert into auth.users (id,email) select v, v||'@x.test' from unnest(array['${Object.values(ID).join("','")}']::uuid[]) v;
update public.profiles set role='admin' where id='${ID.admin}';
update public.profiles set role='professional' where id in ('${ID.pro}','${ID.pro2}');
insert into public.professional_profiles (id,slug,display_name,title,verification_status,ask_ace) values ('${ID.pro}','pro','Pro','T','verified',true),('${ID.pro2}','pro2','Pro2','T','verified',true);
insert into public.appointments (user_id,professional_id,session_type,starts_at,ends_at,status,share_survey,share_symptom_checks,share_mood_trend) values
 ${appt(ID.recent, ID.pro, ago(80), 'completed')},
 ${appt(ID.old, ID.pro, ago(100), 'completed')},
 ${appt(ID.rebooked, ID.pro, ago(100), 'completed')},
 ${appt(ID.rebooked, ID.pro, "now()+interval '5 days'", 'booked')},
 ${appt(ID.off, ID.pro, ago(10), 'completed', 'false,false,false')},
 ${appt(ID.staleBooked, ID.pro, ago(120), 'booked')};
insert into public.onboarding_surveys (user_id) select unnest(array['${ID.recent}','${ID.old}','${ID.rebooked}']::uuid[]);
insert into public.mood_checkins (user_id,mood,checked_in_on) select u,(enum_range(null::public.mood_level))[1],current_date from unnest(array['${ID.recent}','${ID.old}','${ID.rebooked}','${ID.staleBooked}']::uuid[]) u;
insert into public.self_map_parts (user_id,part,answers) select u,'values','{}' from unnest(array['${ID.recent}','${ID.old}']::uuid[]) u;
insert into public.self_map_shares (client_id,professional_id) select u,'${ID.pro}' from unnest(array['${ID.recent}','${ID.old}']::uuid[]) u;
insert into public.ace_intakes (client_id,professional_id,answers) select u,'${ID.pro}',array_fill(false,array[10]) from unnest(array['${ID.recent}','${ID.old}']::uuid[]) u;
insert into public.care_tasks (id,professional_id,client_id,kind,title,start_date,repeat_days) select v::uuid,'${ID.pro}',u,'reminder','t',current_date,'{1}'::smallint[] from (values ('70000000-0000-4000-8000-000000000001','${ID.recent}'::uuid),('70000000-0000-4000-8000-000000000002','${ID.old}'::uuid)) x(v,u);
insert into public.care_sharing (professional_id,client_id,share_progress) select '${ID.pro}',unnest(array['${ID.recent}','${ID.old}']::uuid[]),true;
insert into public.mental_health_insights (user_id) select unnest(array['${ID.recent}','${ID.old}']::uuid[]);
`).catch((e) => { console.log('SEED', e.message); throw e; });

const alias = async (client) => (await db.query(`select alias_id from public.professional_client_aliases where professional_id=$1 and user_id=$2`, [ID.pro, client])).rows[0].alias_id;
const results = [];
const t = (name, got, want) => results.push({ name, got: String(got), want: String(want), pass: String(got) === String(want) });
async function as(role, id, sql, params = []) {
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claims',$1,true)`, [id ? JSON.stringify({ sub: id, role, aal: 'aal2' }) : '{}']);
    await db.exec(`set local role ${role}`);
    const r = await db.query(sql, params);
    return { rows: r.rows };
  } catch (e) {
    return { error: e.message };
  } finally {
    await db.exec('rollback');
  }
}
const val = (r) => (r.error ? 'ERROR' : Object.values(r.rows[0] ?? {})[0]);
const pro = (sql, params) => as('authenticated', ID.pro, sql, params);
const shares = async (client, kind = 'survey') => val(await pro(`select public.client_shares_with_me($1,'${kind}')`, [client]));
const moods = async (client) => (await pro(`select 1 from public.shared_mood_checkins($1)`, [client])).rows?.length ?? 'ERROR';
const data = async (client) => { const r = await pro(`select public.get_shared_client_data_safe($1) d`, [await alias(client)]); return r.rows?.[0]?.d?.survey ? 'visible' : 'hidden'; };

t('session 80 days ago: still shared', await shares(ID.recent), true);
t('session 100 days ago: sharing ended', await shares(ID.old), false);
t('symptoms also end at 100 days', await shares(ID.old, 'symptoms'), false);
t('new booking starts it again', await shares(ID.rebooked), true);
t('client turned sharing off: stays off', await shares(ID.off), false);
t('old booking with no outcome also ends', await shares(ID.staleBooked), false);
t('survey visible at 80 days', await data(ID.recent), 'visible');
t('survey hidden at 100 days', await data(ID.old), 'hidden');
t('mood visible at 80 days', await moods(ID.recent), 1);
t('mood hidden at 100 days', await moods(ID.old), 0);
t('mood visible after a new booking', await moods(ID.rebooked), 1);
t('mood hidden on an old booking with no outcome', await moods(ID.staleBooked), 0);
t('direct table read at 80 days', (await pro(`select 1 from public.mental_health_insights where user_id=$1`, [ID.recent])).rows?.length, 1);
t('direct table read at 100 days', (await pro(`select 1 from public.mental_health_insights where user_id=$1`, [ID.old])).rows?.length, 0);
const map = async (c) => val(await pro(`select public.pro_client_self_map_safe($1) is not null`, [await alias(c)]));
t('self map visible at 80 days', await map(ID.recent), true);
t('self map hidden at 100 days', await map(ID.old), false);
const ace = async (c) => val(await pro(`select public.pro_client_ace_safe($1) is not null`, [await alias(c)]));
t('ACE answers visible at 80 days', await ace(ID.recent), true);
t('ACE answers hidden at 100 days', await ace(ID.old), false);
const care = async (n) => val(await pro(`select public.can_read_care_check_ins('70000000-0000-4000-8000-00000000000${n}')`));
t('care progress visible at 80 days', await care(1), true);
t('care progress hidden at 100 days', await care(2), false);
t('client still reads own care progress', val(await as('authenticated', ID.old, `select public.can_read_care_check_ins('70000000-0000-4000-8000-000000000002')`)), true);
t('client still reads own survey', (await as('authenticated', ID.old, `select 1 from public.onboarding_surveys`)).rows?.length, 1);
t('another therapist never sees it', val(await as('authenticated', ID.pro2, `select public.client_shares_with_me($1,'survey')`, [ID.recent])), false);

const anon = (sql) => as('anon', null, sql);
const PUBLIC = ['announcements', 'clinics', 'crisis_resources', 'journal_prompts', 'podcasts', 'professional_clinics', 'professional_profiles', 'support_contact'];
const tables = (await db.query(`select c.relname t from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'`)).rows.map((r) => r.t);
let readable = [], writable = [];
for (const table of tables) {
  const r = await db.query(`select has_table_privilege('anon',$1::regclass,'SELECT') s, has_table_privilege('anon',$1::regclass,'INSERT,UPDATE,DELETE') w`, [`public.${table}`]);
  if (r.rows[0].s) readable.push(table);
  if (r.rows[0].w) writable.push(table);
}
t('anon reads only the 8 public tables', readable.sort().join(','), [...PUBLIC].sort().join(','));
t('anon writes nothing', writable.join(',') || 'none', 'none');
t('anon cannot read journals', val(await anon(`select count(*) from public.journal_entries`)), 'ERROR');
t('anon cannot read appointments', val(await anon(`select count(*) from public.appointments`)), 'ERROR');
t('anon can read public therapists', val(await anon(`select count(*)::int from public.professional_profiles`)), 2);
t('anon public functions still work', (await anon(`select 1 from public.public_review_summaries()`)).error ?? 'ok', 'ok');
t('anon public list still works', (await anon(`select 1 from public.list_public_professionals()`)).error ?? 'ok', 'ok');
t('anon crash report still works', (await anon(`select public.report_crash('app','m','/','1',null,now(),'k')`)).error ?? 'ok', 'ok');
t('signed in person keeps own rights', (await as('authenticated', ID.recent, `insert into public.journal_entries (user_id,entry_date,content) values ('${ID.recent}',current_date,'x') returning 1`)).rows?.length, 1);
await db.exec(`create table public.brand_new_table (id int)`);
t('new tables start with no anon rights', (await db.query(`select has_table_privilege('anon','public.brand_new_table','SELECT') s`)).rows[0].s, false);

finish('consent', results);

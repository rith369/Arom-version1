// Low risk fixes from the audit (BACKEND-HANDOFF.md section 48).
// Fake users in a throwaway in-memory database. Never touches Supabase.
import { build, finish } from './harness.mjs';

const db = await build();
const ID = {
  admin: '00000000-0000-4000-8000-000000000001',
  pro: '00000000-0000-4000-8000-000000000003',
  testPro: '00000000-0000-4000-8000-000000000004',
  client: '00000000-0000-4000-8000-00000000000a',
  other: '00000000-0000-4000-8000-00000000000b',
};

await db.exec(`
insert into auth.users (id,email) select v, v||'@x.test' from unnest(array['${Object.values(ID).join("','")}']::uuid[]) v;
update public.profiles set role='admin' where id='${ID.admin}';
update public.profiles set role='professional' where id in ('${ID.pro}','${ID.testPro}');
insert into public.professional_profiles (id,slug,display_name,title,verification_status,is_test) values
 ('${ID.pro}','pro','Pro','T','verified',false),('${ID.testPro}','test-pro','Test','T','verified',true);
insert into public.appointments (user_id,professional_id,session_type,starts_at,ends_at,status,share_survey,share_symptom_checks,share_mood_trend)
 values ('${ID.client}','${ID.pro}','online',now()-interval '2 days',now()-interval '2 days'+interval '1 hour','completed',true,true,true);
`);

const results = [];
const t = (name, got, want) => results.push({ name, got: String(got), want: String(want), pass: String(got) === String(want) });
async function as(role, id, sql, params = []) {
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claims',$1,true)`, [id ? JSON.stringify({ sub: id, role, aal: 'aal2' }) : '{}']);
    await db.exec(`set local role ${role}`);
    const r = await db.query(sql, params);
    await db.exec('commit');
    return { rows: r.rows };
  } catch (e) {
    await db.exec('rollback');
    return { error: e.message };
  }
}
const count = (r) => (r.error ? 'ERROR' : r.rows.length);
const outcome = (r) => (r.error ? 'ERROR' : 'ok');

// L7: test profiles.
t('logged out visitor cannot see a test profile', count(await as('anon', null, `select 1 from public.professional_profiles where id=$1`, [ID.testPro])), 0);
t('member cannot see a test profile', count(await as('authenticated', ID.client, `select 1 from public.professional_profiles where id=$1`, [ID.testPro])), 0);
t('real verified profiles are still public', count(await as('anon', null, `select 1 from public.professional_profiles where id=$1`, [ID.pro])), 1);
t('the test profile owner still sees it', count(await as('authenticated', ID.testPro, `select 1 from public.professional_profiles where id=$1`, [ID.testPro])), 1);
t('admins still see test profiles', count(await as('authenticated', ID.admin, `select 1 from public.professional_profiles where id=$1`, [ID.testPro])), 1);

// L1: no direct reads with the client's real id.
t('therapist cannot read support journeys directly', count(await as('authenticated', ID.pro, `select 1 from public.support_journeys where user_id=$1`, [ID.client])), 0);
const policies = (await db.query(`select tablename||' / '||policyname p from pg_policies where schemaname='public' and tablename in ('mental_health_insights','support_journeys') and qual like '%client_shares_with_me%'`)).rows;
t('no policy shares these tables by real id', policies.map((r) => r.p).join(', ') || 'none', 'none');

// L6: old functions that take raw ids.
for (const [name, sql] of [
  ['send_message', `select public.send_message('${ID.pro}','client','text','hi',null,null)`],
  ['open_conversation', `select public.open_conversation('${ID.pro}','client')`],
  ['shared_mood_checkins', `select * from public.shared_mood_checkins('${ID.client}')`],
  ['set_client_archived', `select public.set_client_archived('${ID.client}',true)`],
]) {
  const r = await as('authenticated', name === 'send_message' || name === 'open_conversation' ? ID.client : ID.pro, sql);
  t(`old ${name} cannot be called from the browser`, /permission denied/.test(r.error ?? '') ? 'refused' : outcome(r), 'refused');
}
t('the newer chat function still works', outcome(await as('authenticated', ID.client, `select public.open_conversation_safe('${ID.pro}','client')`)), 'ok');

// L3: crash reports only through the server.
t('member cannot save crash reports directly', outcome(await as('authenticated', ID.client, `select public.report_crash('app','m','/','1',null,now(),'k',null)`)), 'ERROR');
t('the server can save crash reports', outcome(await as('service_role', null, `select public.report_crash('app','m','/','1',null,now(),'k','${ID.client}')`)), 'ok');
t('the server report keeps the account for counting', (await db.query(`select count(*)::int c from public.crash_reports where reporter_id=$1`, [ID.client])).rows[0].c, 1);
t('a report for a deleted account is still saved', outcome(await as('service_role', null, `select public.report_crash('app','m2','/','1',null,now(),'k2','00000000-0000-4000-8000-0000000000ff')`)), 'ok');

// L5: the AI week summary goes when an entry it used is deleted.
async function withSummary(entryDate) {
  await db.exec(`delete from public.journal_entries where user_id='${ID.client}'`);
  await db.exec(`insert into public.journal_ai_summaries (user_id,enabled,summary,entries_key,generated_at,run_count) values ('${ID.client}',true,'{"a":1}','k',now(),2)
    on conflict (user_id) do update set summary='{"a":1}', entries_key='k', generated_at=now(), run_count=2`);
  await db.exec(`insert into public.journal_entries (user_id,entry_date,content) values ('${ID.client}','${entryDate}','private')`);
  await as('authenticated', ID.client, `delete from public.journal_entries where user_id=$1`, [ID.client]);
  return (await db.query(`select summary is null cleared, enabled, run_count from public.journal_ai_summaries where user_id=$1`, [ID.client])).rows[0];
}
const today = new Date().toISOString().slice(0, 10);
const recent = await withSummary(today);
t('deleting a recent entry clears the summary', recent.cleared, true);
t('the summary stays turned on', recent.enabled, true);
t('the daily limit is not reset', recent.run_count, 2);
t('deleting an entry from months ago keeps the summary', (await withSummary('2026-01-01')).cleared, false);
const before = (await db.query(`select count(*)::int c from public.journal_ai_summaries`)).rows[0].c;
await db.exec(`insert into public.journal_entries (user_id,entry_date,content) values ('${ID.client}','${today}','x')`);
let deleted = 'ok';
try { await db.query(`delete from auth.users where id=$1`, [ID.client]); } catch (e) { deleted = e.message; }
t('deleting the account still works', deleted, 'ok');
t('the account summary is gone with it', (await db.query(`select count(*)::int c from public.journal_ai_summaries`)).rows[0].c, before - 1);

finish('fixes', results);

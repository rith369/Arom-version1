// Security warnings on the Admin dashboard (BACKEND-HANDOFF.md section 47).
// Fake users in a throwaway in-memory database. Never touches Supabase.
import { build, finish } from './harness.mjs';

const db = await build();
const ID = {
  admin: '00000000-0000-4000-8000-000000000001',
  newAdmin: '00000000-0000-4000-8000-000000000002',
  noCode: '00000000-0000-4000-8000-000000000003',
  user: '00000000-0000-4000-8000-00000000000a',
};

await db.exec(`
insert into auth.users (id,email) values ('${ID.admin}','admin@x.test'),('${ID.newAdmin}','new@x.test'),('${ID.noCode}','nocode@x.test'),('${ID.user}','u@x.test');
update public.profiles set role='admin' where id='${ID.admin}';
insert into auth.mfa_factors (user_id) values ('${ID.admin}'),('${ID.newAdmin}');
insert into auth.mfa_factors (user_id,status) values ('${ID.noCode}','unverified');
`);

const results = [];
const t = (name, got, want) => results.push({ name, got: String(got), want: String(want), pass: String(got) === String(want) });
async function as(role, id, sql, params = [], aal = 'aal2') {
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claims',$1,true)`, [id ? JSON.stringify({ sub: id, role, aal }) : '{}']);
    await db.exec(`set local role ${role}`);
    const r = await db.query(sql, params);
    await db.exec('commit');
    return { rows: r.rows };
  } catch (e) {
    await db.exec('rollback');
    return { error: e.message };
  }
}
const warnings = async (id = ID.admin, aal = 'aal2') => {
  const r = await as('authenticated', id, `select public.admin_security_warnings() w`, [], aal);
  return r.error ? 'ERROR' : r.rows[0].w;
};
const hit = (key, max = 2) => as('service_role', null, `select public.rate_limit_hit($1,$2,900)`, [key, max]);
const events = async () => (await db.query(`select kind from public.security_events order by created_at`)).rows.map((r) => r.kind).join(',') || 'none';

// Who can see the warnings.
t('member cannot see warnings', await warnings(ID.user), 'ERROR');
t('admin without the 6 digit code cannot see warnings', await warnings(ID.admin, 'aal1'), 'ERROR');
t('logged out visitor cannot see warnings', (await as('anon', null, `select public.admin_security_warnings()`)).error ? 'ERROR' : 'ok', 'ERROR');
t('member cannot read lock events', (await as('authenticated', ID.user, `select count(*) from public.security_events`)).error ? 'ERROR' : 'ok', 'ERROR');
t('member cannot add lock events', (await as('authenticated', ID.user, `insert into public.security_events (kind) values ('x')`)).error ? 'ERROR' : 'ok', 'ERROR');
t('admin sees warnings', typeof (await warnings()), 'object');

// New admins and admins without an authenticator app.
await db.exec(`update public.profiles set role='admin' where id in ('${ID.newAdmin}','${ID.noCode}')`);
let w = await warnings();
t('everyone made admin this week is listed', w.newAdmins.length, 3);
t('a change from the Supabase dashboard is marked', w.newAdmins.every((a) => a.fromDashboard), true);
t('admin with an unfinished app setup is listed as without a code', w.adminsWithoutCode.join(','), 'nocode@x.test');
await db.exec(`update public.admin_audit_log set created_at=now()-interval '8 days' where action='change_role'`);
t('admins made over 7 days ago are not listed', (await warnings()).newAdmins.length, 0);
await db.exec(`update public.profiles set account_status='suspended' where id='${ID.noCode}'`);
t('suspended admins are not listed as without a code', (await warnings()).adminsWithoutCode.length, 0);

// Lock events: once per lock, only the rule name, never the key.
await hit('password:aaaa');
await hit('password:aaaa');
t('no event while within the limit', await events(), 'none');
await hit('password:aaaa');
await hit('password:aaaa');
await hit('password:aaaa');
t('one event per lock, not per try', await events(), 'password');
const stored = (await db.query(`select to_jsonb(e)::text j from public.security_events e`)).rows.map((r) => r.j).join();
t('the hashed key is never stored', stored.includes('aaaa'), false);
await hit('code:bbbb', 0);
await hit('login-address:cccc', 0);
await hit('signup-address:dddd', 0);
await hit('oldstylekeywithnocolon', 0);
w = await warnings();
t('password locks counted', w.lockouts.passwords, 1);
t('code locks counted', w.lockouts.codes, 1);
t('network locks counted', w.lockouts.networks, 2);
t('old style keys are counted as unknown', (await events()).split(',').includes('unknown'), true);
await db.exec(`update public.security_events set created_at=now()-interval '2 days'`);
t('locks over a day old are not counted', (await warnings()).lockouts.passwords, 0);
await db.exec(`update public.security_events set created_at=now()-interval '91 days'`);
await hit('another:eeee');
t('events over 90 days old are deleted', (await db.query(`select count(*)::int c from public.security_events`)).rows[0].c, 0);
t('login limits still allow and refuse as before', [(await hit('fresh:1', 1)).rows[0].rate_limit_hit, (await hit('fresh:1', 1)).rows[0].rate_limit_hit].join(), 'true,false');

// Crashes and content policy reports.
await db.exec(`
insert into public.crash_reports (kind,message,occurred_at,release) select 'app','x',now(),'1' from generate_series(1,12);
insert into public.crash_reports (kind,message,occurred_at,release,received_at) select 'app','x',now(),'1',now()-interval '3 days' from generate_series(1,7);
insert into public.crash_reports (kind,message,occurred_at,release) select 'app','CSP would block img-src: x.test',now(),'csp' from generate_series(1,4);
`);
w = await warnings();
t('crashes in the last day, without CSP reports', w.crashes.last24h, 12);
t('crashes the week before', w.crashes.previous7d, 7);
t('CSP reports this week', w.csp.last7d, 4);

finish('warnings', results);

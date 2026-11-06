// Fake users in a throwaway in-memory database. Never touches Supabase.
import { build, finish } from './harness.mjs';

const db = await build();
const ID = {
  client: '00000000-0000-4000-8000-00000000000a',
  busy: '00000000-0000-4000-8000-00000000000b',
  pro: '00000000-0000-4000-8000-000000000003',
};
const SLOTS = 14;
const slot = (i) => `50000000-0000-4000-8000-${String(i).padStart(12, '0')}`;

await db.exec(`
insert into auth.users (id,email) values ('${ID.client}','c@x.test'),('${ID.busy}','b@x.test'),('${ID.pro}','p@x.test');
update public.profiles set role='professional' where id='${ID.pro}';
insert into public.professional_profiles (id,slug,display_name,title,verification_status,photo_url,bio,bio_km,specialties,languages,session_types,price_kind)
 values ('${ID.pro}','pro','Pro','T','verified','https://x.test/p.png','${'b'.repeat(90)}','${'k'.repeat(50)}','{a}','{en}','{online}','free');
insert into public.availability_slots (id,professional_id,session_types,starts_at,ends_at)
 select ('50000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'${ID.pro}','{online}',now()+make_interval(days=>5+i),now()+make_interval(days=>5+i,hours=>1) from generate_series(1,${SLOTS}) i;
`);

const results = [];
const t = (name, got, want) => results.push({ name, got: String(got), want: String(want), pass: String(got) === String(want) });
async function as(role, id, sql, params = []) {
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claims',$1,true)`, [id ? JSON.stringify({ sub: id, role }) : '{}']);
    await db.exec(`set local role ${role}`);
    const r = await db.query(sql, params);
    await db.exec('commit');
    return { rows: r.rows };
  } catch (e) {
    await db.exec('rollback');
    return { error: e.message };
  }
}
const val = (r) => (r.error ? 'ERROR' : Object.values(r.rows[0] ?? {})[0]);

const hit = (key, max = 3, secs = 900) => as('service_role', null, `select public.rate_limit_hit($1,$2,$3)`, [key, max, secs]);

t('browser user cannot count attempts', val(await as('authenticated', ID.client, `select public.rate_limit_hit('x',1,60)`)), 'ERROR');
t('anonymous cannot count attempts', val(await as('anon', null, `select public.rate_limit_hit('x',1,60)`)), 'ERROR');
t('browser user cannot clear a count', val(await as('authenticated', ID.client, `select public.rate_limit_clear('x')`)), 'ERROR');
t('browser user cannot read counts', val(await as('authenticated', ID.client, `select count(*) from public.rate_limits`)), 'ERROR');
t('anonymous cannot read counts', val(await as('anon', null, `select count(*) from public.rate_limits`)), 'ERROR');

t('attempt 1 allowed', val(await hit('k')), true);
t('attempt 2 allowed', val(await hit('k')), true);
t('attempt 3 allowed', val(await hit('k')), true);
t('attempt 4 refused', val(await hit('k')), false);
t('another key is unaffected', val(await hit('other')), true);
await as('service_role', null, `select public.rate_limit_clear('k')`);
t('allowed again after a successful login', val(await hit('k')), true);
await db.query(`update public.rate_limits set attempts=99, window_started_at=now()-interval '16 minutes' where key='k'`);
t('allowed again after the window passes', val(await hit('k')), true);
t('count restarted after the window', (await db.query(`select attempts from public.rate_limits where key='k'`)).rows[0].attempts, 1);
await db.query(`insert into public.rate_limits (key,window_started_at,attempts) values ('old',now()-interval '2 days',1)`);
await hit('another');
t('old keys are cleaned up', (await db.query(`select count(*)::int c from public.rate_limits where key='old'`)).rows[0].c, 0);

const book = (who, i) => as('authenticated', who, `select public.book_appointment($1,'online')`, [slot(i)]);
for (let i = 1; i <= 5; i++) t(`booking ${i} allowed`, (await book(ID.client, i)).error ?? 'ok', 'ok');
const sixth = await book(ID.client, 6);
t('6th upcoming booking refused', /already have 5/.test(sixth.error ?? ''), true);
t('other people can still book', (await book(ID.busy, 7)).error ?? 'ok', 'ok');

await db.query(`update public.appointments set status='cancelled' where user_id=$1 and slot_id=$2`, [ID.client, slot(1)]);
await db.query(`update public.availability_slots set is_booked=false where id=$1`, [slot(1)]);
t('allowed again after cancelling one', (await book(ID.client, 8)).error ?? 'ok', 'ok');

await db.query(`update public.appointments set status='cancelled' where user_id=$1`, [ID.client]);
await db.query(`insert into public.appointments (user_id,professional_id,session_type,starts_at,ends_at,status,created_at) select $1,$2,'online',now()-interval '40 days'-make_interval(hours=>i),now()-interval '40 days'-make_interval(hours=>i)+interval '30 minutes','cancelled',now() from generate_series(1,5) i`, [ID.client, ID.pro]);
const churn = await book(ID.client, 9);
t('10 bookings a day is the limit', /many bookings today/.test(churn.error ?? ''), true);

await db.query(`update public.appointments set created_at=now()-interval '2 days' where user_id=$1`, [ID.client]);
const series = '60000000-0000-4000-8000-000000000001';
await db.query(`insert into public.session_suggestions (id,professional_id,client_id,session_type,duration_minutes,times,every_weeks,session_count) values ($1,$2,$3,'online',60,array[now()+interval '40 days'],1,1)`, [series, ID.pro, ID.client]).catch(() => {});
await db.query(`insert into public.appointments (user_id,professional_id,session_type,starts_at,ends_at,series_id) select $1,$2,'online',now()+make_interval(days=>60+i),now()+make_interval(days=>60+i,hours=>1),$3 from generate_series(1,6) i`, [ID.client, ID.pro, series]);
t('agreed series sessions do not count', (await book(ID.client, 10)).error ?? 'ok', 'ok');

finish('limits', results);

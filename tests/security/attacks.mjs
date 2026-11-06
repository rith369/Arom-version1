// Fake users in a throwaway in-memory database. Never touches Supabase.
import { build, finish } from './harness.mjs';

const db = await build();

const ID = {
  admin: '00000000-0000-4000-8000-000000000001',
  adminOut: '00000000-0000-4000-8000-000000000002',
  pro: '00000000-0000-4000-8000-000000000003',
  proOut: '00000000-0000-4000-8000-000000000004',
  proDemoted: '00000000-0000-4000-8000-000000000005',
  a: '00000000-0000-4000-8000-00000000000a',
  b: '00000000-0000-4000-8000-00000000000b',
  out: '00000000-0000-4000-8000-00000000000c',
};
const CONV = '30000000-0000-4000-8000-000000000001';
const GROUP = '10000000-0000-4000-8000-000000000001';
const A = (n) => `20000000-0000-4000-8000-00000000000${n}`;

await db.exec(`
insert into auth.users (id,email) values
 ('${ID.admin}','admin@x.test'),('${ID.adminOut}','adminout@x.test'),('${ID.pro}','pro@x.test'),
 ('${ID.proOut}','proout@x.test'),('${ID.proDemoted}','demoted@x.test'),('${ID.a}','a@x.test'),
 ('${ID.b}','b@x.test'),('${ID.out}','out@x.test');
update public.profiles set role='admin' where id in ('${ID.admin}','${ID.adminOut}');
update public.profiles set role='professional' where id in ('${ID.pro}','${ID.proOut}');
insert into public.professional_profiles (id,slug,display_name,title,verification_status) values
 ('${ID.pro}','pro','Pro','T','verified'),('${ID.proOut}','pro-out','ProOut','T','verified'),
 ('${ID.proDemoted}','pro-demoted','Dem','T','verified'),('${ID.admin}','admin-test','AdminTest','T','verified');
insert into public.appointments (id,user_id,professional_id,session_type,starts_at,ends_at,status,intake_note,share_survey,share_symptom_checks,share_mood_trend,cancelled_at) values
 ('${A(1)}','${ID.a}','${ID.pro}','online',now()-interval '2 day',now()-interval '2 day'+interval '1 hour','booked','A private intake',true,true,true,null),
 ('${A(2)}','${ID.a}','${ID.pro}','online',now()+interval '5 day',now()+interval '5 day'+interval '1 hour','booked','Future',false,false,false,null),
 ('${A(3)}','${ID.b}','${ID.pro}','online',now()-interval '2 day',now()-interval '2 day'+interval '1 hour','cancelled','B cancelled',true,true,true,now()),
 ('${A(4)}','${ID.a}','${ID.proOut}','online',now()-interval '3 day',now()-interval '3 day'+interval '1 hour','completed','Note for suspended',true,true,true,null),
 ('${A(5)}','${ID.a}','${ID.proDemoted}','online',now()-interval '3 day',now()-interval '3 day'+interval '1 hour','completed','Note for demoted',true,true,true,null),
 ('${A(6)}','${ID.b}','${ID.admin}','online',now()-interval '3 day',now()-interval '3 day'+interval '1 hour','completed','Test',false,false,false,null);
insert into public.session_notes (appointment_id,professional_id,content) values
 ('${A(1)}','${ID.pro}','pro note'),('${A(4)}','${ID.proOut}','suspended note'),('${A(5)}','${ID.proDemoted}','demoted note');
insert into public.journal_entries (user_id,entry_date,content) values ('${ID.a}',current_date,'A secret'),('${ID.b}',current_date,'B secret');
insert into public.mood_checkins (user_id,mood,checked_in_on) select '${ID.b}',(enum_range(null::public.mood_level))[1],current_date;
insert into public.support_groups (id,mentor_id,name,concern,description,max_members,is_active) select '${GROUP}','${ID.proDemoted}','G','general','D',10,true;
insert into public.group_members (group_id,user_id,member_number) values ('${GROUP}','${ID.a}',1),('${GROUP}','${ID.out}',2);
insert into public.conversations (id,professional_id,client_id) values ('${CONV}','${ID.proOut}','${ID.a}'); insert into public.messages (conversation_id,sender_id,kind,body) values ('${CONV}','${ID.a}','text','private message'); insert into public.journal_entries (user_id,entry_date,content) values ('${ID.out}',current_date,'Suspended person journal'); insert into public.mood_checkins (user_id,mood,checked_in_on) select '${ID.a}',(enum_range(null::public.mood_level))[1],current_date; insert into public.onboarding_surveys (user_id) values ('${ID.a}');
update public.profiles set account_status='suspended',suspended_at=now(),suspended_reason='t' where id in ('${ID.adminOut}','${ID.proOut}','${ID.out}');
update public.profiles set role='user' where id='${ID.proDemoted}';
`);

const claims = (id, aal = 'aal1') => JSON.stringify({ sub: id, role: 'authenticated', aal });
const results = [];

// Each check runs as that user and is always rolled back.
async function as(id, sql, params = [], aal = 'aal1', role = 'authenticated') {
  await db.exec('begin');
  try {
    await db.query(`select set_config('request.jwt.claims',$1,true)`, [id ? claims(id, aal) : '{}']);
    await db.exec(`set local role ${role}`);
    const r = await db.query(sql, params);
    return { rows: r.rows, affected: r.affectedRows };
  } catch (e) {
    return { error: e.message };
  } finally {
    await db.exec('rollback');
  }
}
const rowsOf = (r) => (r.error ? 'ERROR' : `${r.rows.length} rows`);
const changed = (r) => (r.error ? 'ERROR' : `${r.affected} changed`);
const val = (r) => (r.error ? 'ERROR' : JSON.stringify(Object.values(r.rows[0] ?? {})[0]));
function t(group, name, got, want) {
  results.push({ group, name, got: String(got), want, pass: String(got) === want });
}

const G = 'Two users';
t(G, 'A reads B journal', val(await as(ID.a, `select count(*)::int c from public.journal_entries where user_id=$1`, [ID.b])), '0');
t(G, 'A reads own journal', val(await as(ID.a, `select count(*)::int c from public.journal_entries where user_id=$1`, [ID.a])), '1');
t(G, 'A changes B journal', changed(await as(ID.a, `update public.journal_entries set content='x' where user_id=$1`, [ID.b])), '0 changed');
t(G, 'A deletes B journal', changed(await as(ID.a, `delete from public.journal_entries where user_id=$1`, [ID.b])), '0 changed');
t(G, 'A changes B mood', changed(await as(ID.a, `update public.mood_checkins set checked_in_on=current_date where user_id=$1`, [ID.b])), '0 changed');
t(G, 'A reads B symptom checks', rowsOf(await as(ID.a, `select 1 from public.symptom_checks where user_id=$1`, [ID.b])), '0 rows');
t(G, 'A makes self admin', rowsOf(await as(ID.a, `update public.profiles set role='admin' where id=$1 returning 1`, [ID.a])), 'ERROR');
t(G, 'A reads audit log', rowsOf(await as(ID.a, `select 1 from public.admin_audit_log`)), '0 rows');
t(G, 'A reads session notes', rowsOf(await as(ID.a, `select 1 from public.session_notes`)), '0 rows');
t(G, 'Anonymous reads journals', rowsOf(await as(null, `select 1 from public.journal_entries`, [], 'aal1', 'anon')), 'ERROR');
t(G, 'Admin reads journals', rowsOf(await as(ID.admin, `select 1 from public.journal_entries`, [], 'aal2')), '0 rows');
t(G, 'Therapist reads journals', rowsOf(await as(ID.pro, `select 1 from public.journal_entries`)), '0 rows');

const H2 = 'H2 removed staff';
t(H2, 'Suspended admin passes is_admin', val(await as(ID.adminOut, `select public.is_admin()`, [], 'aal2')), 'false');
t(H2, 'Suspended admin lists all users', rowsOf(await as(ID.adminOut, `select 1 from public.admin_list_users()`, [], 'aal2')), 'ERROR');
t(H2, 'Suspended therapist reads bookings', rowsOf(await as(ID.proOut, `select 1 from public.read_my_pro_bookings_safe()`)), 'ERROR');
t(H2, 'Suspended therapist reads session notes', rowsOf(await as(ID.proOut, `select 1 from public.session_notes`)), '0 rows');
t(H2, 'Suspended therapist reads shared mood', rowsOf(await as(ID.proOut, `select 1 from public.shared_mood_checkins($1)`, [ID.a])), '0 rows');
const aliasOut = (await db.query(`select alias_id from public.professional_client_aliases where professional_id=$1 and user_id=$2`, [ID.proOut, ID.a])).rows[0].alias_id;
t(H2, 'Suspended therapist opens shared client data', val(await as(ID.proOut, `select public.get_shared_client_data_safe($1)`, [aliasOut])), 'ERROR');
t(H2, 'Suspended therapist reads private messages', rowsOf(await as(ID.proOut, `select 1 from public.read_private_messages_safe($1)`, [CONV])), 'ERROR');
t(H2, 'Suspended therapist is conversation member', val(await as(ID.proOut, `select public.is_conversation_member($1)`, [CONV])), 'false');
t(H2, 'Demoted therapist reads bookings', rowsOf(await as(ID.proDemoted, `select 1 from public.read_my_pro_bookings_safe()`)), 'ERROR');
t(H2, 'Demoted therapist reads session notes', rowsOf(await as(ID.proDemoted, `select 1 from public.session_notes`)), '0 rows');
t(H2, 'Demoted mentor passes is_group_mentor', val(await as(ID.proDemoted, `select public.is_group_mentor($1)`, [GROUP])), 'false');
t(H2, 'Suspended member posts in group', rowsOf(await as(ID.out, `insert into public.community_messages (group_id,author_id,content) values ($1,$2,'hi') returning 1`, [GROUP, ID.out])), 'ERROR');

const OK = 'Still works';
t(OK, 'Active therapist reads bookings', rowsOf(await as(ID.pro, `select 1 from public.read_my_pro_bookings_safe()`)), '3 rows');
t(OK, 'Active therapist reads own notes', rowsOf(await as(ID.pro, `select 1 from public.session_notes`)), '1 rows');
t(OK, 'Active therapist edits own note', changed(await as(ID.pro, `update public.session_notes set content='y' where appointment_id=$1`, [A(1)])), '1 changed');
t(OK, 'Active therapist sees shared data', val(await as(ID.pro, `select public.client_shares_with_me($1,'survey')`, [ID.a])), 'true');
t(OK, 'Active admin lists users', rowsOf(await as(ID.admin, `select 1 from public.admin_list_users()`, [], 'aal2')), '8 rows');
t(OK, 'Active admin lists bookings', rowsOf(await as(ID.admin, `select 1 from public.admin_list_bookings('2000-01-01')`, [], 'aal2')), '6 rows');
t(OK, 'Admin test profile reads its bookings', rowsOf(await as(ID.admin, `select 1 from public.read_my_pro_bookings_safe()`, [], 'aal2')), '1 rows');
t(OK, 'Client reads own appointments', rowsOf(await as(ID.a, `select 1 from public.appointments`)), '4 rows');
t(OK, 'Active member posts in group', rowsOf(await as(ID.a, `insert into public.community_messages (group_id,author_id,content) values ($1,$2,'hi') returning 1`, [GROUP, ID.a])), '1 rows');
t(OK, 'Suspended client still reads own journal', rowsOf(await as(ID.out, `select 1 from public.journal_entries`)), '1 rows');
t(OK, 'Client still reads own messages', rowsOf(await as(ID.a, `select 1 from public.read_private_messages_safe($1)`, [CONV])), '1 rows');

const H4 = 'H4 admin bookings';
t(H4, 'Admin reads intake notes directly', rowsOf(await as(ID.admin, `select intake_note from public.appointments where user_id<>$1`, [ID.admin], 'aal2')), '0 rows');

const M1 = 'M1 outcomes';
t(M1, 'Therapist flips cancelled to completed', val(await as(ID.pro, `select public.update_pro_booking_safe($1,'outcome','completed')`, [A(3)])), 'ERROR');
t(M1, 'Therapist completes a future session', val(await as(ID.pro, `select public.update_pro_booking_safe($1,'outcome','completed')`, [A(2)])), 'ERROR');
t(M1, 'Therapist records an ended session', val(await as(ID.pro, `select public.update_pro_booking_safe($1,'outcome','completed')`, [A(1)])), '""');
t(M1, 'Therapist records a no show', val(await as(ID.pro, `select public.update_pro_booking_safe($1,'outcome','no_show')`, [A(1)])), '""');
t(M1, 'Therapist saves a meeting link', val(await as(ID.pro, `select public.update_pro_booking_safe($1,'meeting',null,'https://meet.example/x')`, [A(2)])), '""');

{
  const H1 = 'H1 admin MFA';
  t(H1, 'Password only admin passes is_admin', val(await as(ID.admin, `select public.is_admin()`)), 'false');
  t(H1, 'Password only admin lists users', rowsOf(await as(ID.admin, `select 1 from public.admin_list_users()`)), 'ERROR');
  t(H1, 'Password only admin reads test bookings', rowsOf(await as(ID.admin, `select 1 from public.read_my_pro_bookings_safe()`)), 'ERROR');
  t(H1, 'Admin with code passes is_admin', val(await as(ID.admin, `select public.is_admin()`, [], 'aal2')), 'true');
  t(H1, 'Therapist with password only still works', rowsOf(await as(ID.pro, `select 1 from public.read_my_pro_bookings_safe()`)), '3 rows');
  t(H1, 'Suspended admin with code', val(await as(ID.adminOut, `select public.is_admin()`, [], 'aal2')), 'false');
}

finish('attacks', results);

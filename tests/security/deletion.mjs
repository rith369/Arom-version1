// Deletes fake accounts in a throwaway in-memory database. Never touches Supabase.
import { build, finish } from './harness.mjs';

const db = await build();
const ID = {
  client: '00000000-0000-4000-8000-00000000000a',
  other: '00000000-0000-4000-8000-00000000000b',
  pro: '00000000-0000-4000-8000-000000000003',
  mentorOnly: '00000000-0000-4000-8000-000000000004',
};
const GROUP = '10000000-0000-4000-8000-000000000001';
const A = (n) => `20000000-0000-4000-8000-00000000000${n}`;
const CONV = '30000000-0000-4000-8000-000000000001';
const CONV2 = '30000000-0000-4000-8000-000000000002';

await db.exec(`
insert into auth.users (id,email) values ('${ID.client}','c@x.test'),('${ID.other}','o@x.test'),('${ID.pro}','p@x.test'),('${ID.mentorOnly}','m@x.test');
update public.profiles set role='professional' where id in ('${ID.pro}','${ID.mentorOnly}');
insert into public.professional_profiles (id,slug,display_name,title,verification_status) values ('${ID.pro}','pro','Pro','T','verified'),('${ID.mentorOnly}','men','Men','T','verified');
insert into public.appointments (id,user_id,professional_id,session_type,starts_at,ends_at,status,intake_note,share_survey) values
 ('${A(1)}','${ID.client}','${ID.pro}','online',now()-interval '2 day',now()-interval '2 day'+interval '1 hour','completed','client private',true),
 ('${A(2)}','${ID.other}','${ID.pro}','online',now()-interval '2 day',now()-interval '2 day'+interval '1 hour','completed','other private',true);
insert into public.session_notes (appointment_id,professional_id,content) values ('${A(1)}','${ID.pro}','note on client'),('${A(2)}','${ID.pro}','note on other');
insert into public.session_prep_notes (appointment_id,professional_id,content) values ('${A(1)}','${ID.pro}','prep on client');
insert into public.client_summary_notes (professional_id,client_id,content) values ('${ID.pro}','${ID.client}','summary on client'),('${ID.pro}','${ID.other}','summary on other');
insert into public.intake_answers (appointment_id,question_snapshot,answer) values ('${A(1)}','q','"a"'),('${A(2)}','q','"b"');
insert into public.journal_entries (user_id,entry_date,content) values ('${ID.client}',current_date,'client'),('${ID.other}',current_date,'other');
insert into public.mood_checkins (user_id,mood,checked_in_on) select u,(enum_range(null::public.mood_level))[1],current_date from unnest(array['${ID.client}','${ID.other}']::uuid[]) u;
insert into public.onboarding_surveys (user_id) values ('${ID.client}');
insert into public.conversations (id,professional_id,client_id) values ('${CONV}','${ID.pro}','${ID.client}'),('${CONV2}','${ID.pro}','${ID.other}');
insert into public.messages (conversation_id,sender_id,kind,body) values ('${CONV}','${ID.client}','text','from client'),('${CONV}','${ID.pro}','text','to client'),('${CONV2}','${ID.other}','text','from other');
insert into public.support_groups (id,mentor_id,name,concern,description,max_members,is_active) values ('${GROUP}','${ID.mentorOnly}','G','general','D',10,true);
insert into public.group_members (group_id,user_id,member_number) values ('${GROUP}','${ID.client}',1),('${GROUP}','${ID.other}',2);
insert into public.community_messages (id,group_id,author_id,content) values ('40000000-0000-4000-8000-000000000001','${GROUP}','${ID.client}','client in group'),('40000000-0000-4000-8000-000000000002','${GROUP}','${ID.other}','other in group');
insert into public.community_reports (group_id,target_kind,message_id,reason,note,reporter_id,member_label) values ('${GROUP}','message','40000000-0000-4000-8000-000000000001','harassment','note about message','${ID.other}','');
insert into public.professional_reviews (professional_id,user_id,rating) values ('${ID.pro}','${ID.client}',5),('${ID.pro}','${ID.other}',4);
`);

const n = async (sql, p = []) => (await db.query(sql, p)).rows[0].c;
const results = [];
const t = (name, got, want) => results.push({ name, got: String(got), want: String(want), pass: String(got) === String(want) });

// What a user's cascade leaves behind: every uuid column in every public table.
const columns = (await db.query(`
  select c.table_name t, c.column_name col from information_schema.columns c
  join information_schema.tables x on x.table_schema=c.table_schema and x.table_name=c.table_name and x.table_type='BASE TABLE'
  where c.table_schema='public' and c.data_type='uuid'`)).rows;
async function leftovers(id) {
  const found = [];
  for (const { t: table, col } of columns) {
    const c = await n(`select count(*)::int c from public."${table}" where "${col}"=$1`, [id]);
    if (c > 0) found.push(`${table}.${col}=${c}`);
  }
  return found;
}

const before = await leftovers(ID.client);
t('client has data before', before.length > 5, true);
await db.query(`delete from auth.users where id=$1`, [ID.client]);
const after = await leftovers(ID.client);
t('nothing points at the deleted client', after.join(', ') || 'none', 'none');
t('client journal gone', await n(`select count(*)::int c from public.journal_entries where content='client'`), 0);
t('therapist session note on client gone', await n(`select count(*)::int c from public.session_notes where content='note on client'`), 0);
t('therapist prep note on client gone', await n(`select count(*)::int c from public.session_prep_notes`), 0);
t('therapist summary note on client gone', await n(`select count(*)::int c from public.client_summary_notes where content='summary on client'`), 0);
t('both sides of the chat gone', await n(`select count(*)::int c from public.messages where conversation_id=$1`, [CONV]), 0);
t('client group message gone', await n(`select count(*)::int c from public.community_messages where content='client in group'`), 0);
t('report on that message stays, unlinked', await n(`select count(*)::int c from public.community_reports where message_id is null and note='note about message'`), 1);

t('other person journal kept', await n(`select count(*)::int c from public.journal_entries where content='other'`), 1);
t('other person booking kept', await n(`select count(*)::int c from public.appointments where id=$1`, [A(2)]), 1);
t('other person note kept', await n(`select count(*)::int c from public.session_notes where content='note on other'`), 1);
t('other person summary note kept', await n(`select count(*)::int c from public.client_summary_notes where content='summary on other'`), 1);
t('other person chat kept', await n(`select count(*)::int c from public.messages where conversation_id=$1`, [CONV2]), 1);
t('other person group message kept', await n(`select count(*)::int c from public.community_messages where content='other in group'`), 1);
t('other person review kept', await n(`select count(*)::int c from public.professional_reviews`), 1);
t('therapist account kept', await n(`select count(*)::int c from public.professional_profiles where id=$1`, [ID.pro]), 1);

// The reasons the app refuses to delete professionals and mentors.
let mentorBlocked = false;
try { await db.query(`delete from auth.users where id=$1`, [ID.mentorOnly]); } catch { mentorBlocked = true; }
t('database refuses to delete a mentor', mentorBlocked, true);
await db.query(`delete from auth.users where id=$1`, [ID.pro]);
t('deleting a therapist would wipe clients bookings (why the app refuses)', await n(`select count(*)::int c from public.appointments where id=$1`, [A(2)]), 0);

finish('deletion', results);

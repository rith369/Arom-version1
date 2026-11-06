// A throwaway Postgres database in memory, built from every migration in
// supabase/migrations. It never connects to Supabase, so tests can attack it
// with fake users. Supabase's own schemas (auth, storage, cron) are small stubs.
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import path from 'node:path';

const MIGRATIONS = path.resolve(import.meta.dirname, '../../supabase/migrations');

const STUB = `
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; create role supabase_auth_admin nologin;
create schema auth; create schema storage; create schema cron; create schema extensions;
grant usage on schema public to anon, authenticated, service_role, supabase_auth_admin;
grant usage on schema auth, storage to anon, authenticated, service_role, supabase_auth_admin;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, email_confirmed_at timestamptz default now(), raw_user_meta_data jsonb default '{}', last_sign_in_at timestamptz, created_at timestamptz default now(), banned_until timestamptz);
create table auth.mfa_factors (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade, factor_type text default 'totp', status text default 'verified');
create table auth.identities (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users on delete cascade, provider text, identity_data jsonb);
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),'')::jsonb,'{}'::jsonb) $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
grant execute on function auth.jwt(), auth.uid() to public;
create table storage.buckets (id text primary key, name text, public boolean default false, file_size_limit bigint, allowed_mime_types text[], created_at timestamptz default now(), updated_at timestamptz default now(), owner uuid);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets, name text, owner uuid, metadata jsonb, created_at timestamptz default now());
alter table storage.objects enable row level security;
grant all on storage.objects to anon, authenticated, service_role; grant select on storage.buckets to anon, authenticated;
create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name,'/'))[1:array_length(string_to_array(name,'/'),1)-1] $$;
create function cron.schedule(a text, b text, c text) returns bigint language sql as $$ select 1::bigint $$;
create function cron.unschedule(a text) returns boolean language sql as $$ select true $$;
`;

export async function build() {
  const db = new PGlite();
  await db.exec(STUB);
  const files = fs.readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs
      .readFileSync(path.join(MIGRATIONS, file), 'utf8')
      .replace(/create extension if not exists pg_cron[^;]*;/gi, '');
    try {
      await db.exec(sql);
    } catch (e) {
      console.log(`FAILED to apply ${file}: ${e.message}`);
      throw e;
    }
  }
  return db;
}

/** Prints every result and makes the process fail if any check failed. */
export function finish(name, results) {
  let bad = 0;
  let group = '';
  for (const r of results) {
    if (r.group && r.group !== group) {
      group = r.group;
      console.log(`\n== ${group}`);
    }
    if (!r.pass) bad++;
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}: ${r.got}${r.pass ? '' : ` (wanted ${r.want})`}`);
  }
  console.log(`\n[${name}] ${results.length - bad}/${results.length} passed`);
  if (bad > 0) process.exitCode = 1;
}

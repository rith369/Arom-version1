-- AROM: MindGuide content drafts, versions and publishing (BACKEND-HANDOFF.md
-- section 9). Admins only. Lessons, tips and practices were written in code
-- first: the API brings an item into these tables, with its code version as
-- the starting point, the first time an admin changes it
-- (admin_init_content_item). From then on the database is the record.
--
--   * A published version is never changed. Publishing writes version N+1
--     from the saved draft and removes the draft.
--   * No overwrite: save and publish send the draft time the editor loaded.
--     If it differs, nothing changes and the error code is PT409.
--     Times are kept to the millisecond so they match the browser's.
--   * The API runs the full publish check (checkForPublish) before publish.
--   * Users still read lessons, tips and practices from the code until the
--     user screens are connected (section 9, "Still frontend only").

create table public.content_items (
  kind text not null check (kind in ('lesson', 'tip', 'practice')),
  key text not null check (char_length(key) between 1 and 100),
  live_version integer,
  created_at timestamptz not null default now(),
  -- Set when a never published item is deleted, so its code version does not come back.
  deleted_at timestamptz,
  primary key (kind, key)
);

create table public.content_versions (
  kind text not null,
  key text not null,
  version integer not null check (version >= 1),
  body jsonb not null,
  published_at timestamptz not null,
  -- Null for the first version written in code by the AROM team.
  published_by uuid references public.profiles (id) on delete set null,
  primary key (kind, key, version),
  foreign key (kind, key) references public.content_items (kind, key) on delete cascade
);

create table public.content_drafts (
  kind text not null,
  key text not null,
  body jsonb not null,
  base_version integer,
  updated_at timestamptz not null,
  updated_by uuid references public.profiles (id) on delete set null,
  primary key (kind, key),
  foreign key (kind, key) references public.content_items (kind, key) on delete cascade
);

alter table public.content_items enable row level security;
alter table public.content_versions enable row level security;
alter table public.content_drafts enable row level security;
revoke all on public.content_items, public.content_versions, public.content_drafts from anon, authenticated;
grant select on public.content_items, public.content_versions, public.content_drafts to authenticated;

create policy "Admins read content items" on public.content_items for select to authenticated using (public.is_admin());
create policy "Admins read content versions" on public.content_versions for select to authenticated using (public.is_admin());
create policy "Admins read content drafts" on public.content_drafts for select to authenticated using (public.is_admin());

create or replace function public.content_now()
returns timestamptz
language sql
stable
set search_path = ''
as $$ select date_trunc('milliseconds', now()) $$;

-- Brings a code item into the tables once. Does nothing if it is already there.
create or replace function public.admin_init_content_item(p_kind text, p_key text, p_seed_body jsonb, p_seed_live boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_seed_at constant timestamptz := '2026-10-01T02:00:00Z';
begin
  if not public.is_admin() then
    raise exception 'Only an admin can edit content';
  end if;
  if exists (select 1 from public.content_items where kind = p_kind and key = p_key) then
    return;
  end if;
  if p_seed_body ->> 'type' is distinct from p_kind then
    raise exception 'The content does not match its type' using errcode = '22023';
  end if;

  insert into public.content_items (kind, key, live_version)
  values (p_kind, p_key, case when p_seed_live then 1 end);

  if p_seed_live then
    insert into public.content_versions (kind, key, version, body, published_at)
    values (p_kind, p_key, 1, p_seed_body, v_seed_at);
  else
    insert into public.content_drafts (kind, key, body, base_version, updated_at)
    values (p_kind, p_key, p_seed_body, null, v_seed_at);
  end if;
end;
$$;

-- Locks the item and refuses a stale editor. Returns the newest version (0 when none).
create or replace function public.content_lock(p_kind text, p_key text, p_expected timestamptz, p_check boolean)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current timestamptz;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can edit content';
  end if;
  perform 1 from public.content_items where kind = p_kind and key = p_key and deleted_at is null for update;
  if not found then
    raise exception 'Content not found';
  end if;
  if p_check then
    select updated_at into v_current from public.content_drafts where kind = p_kind and key = p_key;
    if v_current is distinct from p_expected then
      raise exception 'stale' using errcode = 'PT409';
    end if;
  end if;
  return coalesce((select max(version) from public.content_versions where kind = p_kind and key = p_key), 0);
end;
$$;

create or replace function public.save_content_draft(p_kind text, p_key text, p_body jsonb, p_expected timestamptz)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_latest integer;
  v_at timestamptz := public.content_now();
begin
  v_latest := public.content_lock(p_kind, p_key, p_expected, true);
  if p_body ->> 'type' is distinct from p_kind then
    raise exception 'The content does not match its type' using errcode = '22023';
  end if;

  insert into public.content_drafts (kind, key, body, base_version, updated_at, updated_by)
  values (p_kind, p_key, p_body, nullif(v_latest, 0), v_at, (select auth.uid()))
  on conflict (kind, key) do update
    set body = excluded.body, base_version = excluded.base_version,
        updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  return v_at;
end;
$$;

create or replace function public.publish_content(p_kind text, p_key text, p_expected timestamptz)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_latest integer;
  v_body jsonb;
  v_at timestamptz := public.content_now();
begin
  if p_expected is null then
    raise exception 'stale' using errcode = 'PT409';
  end if;
  v_latest := public.content_lock(p_kind, p_key, p_expected, true);

  select body into v_body from public.content_drafts where kind = p_kind and key = p_key;

  insert into public.content_versions (kind, key, version, body, published_at, published_by)
  values (p_kind, p_key, v_latest + 1, v_body, v_at, (select auth.uid()));
  update public.content_items set live_version = v_latest + 1 where kind = p_kind and key = p_key;
  delete from public.content_drafts where kind = p_kind and key = p_key;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values ((select auth.uid()), 'publish_content', 'content_items', null,
          jsonb_build_object('item', p_kind || ':' || p_key, 'version', v_latest + 1));
  return v_at;
end;
$$;

create or replace function public.discard_content_draft(p_kind text, p_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.content_lock(p_kind, p_key, null, false);
  if not exists (select 1 from public.content_versions where kind = p_kind and key = p_key) then
    raise exception 'This item was never published. Delete it instead.';
  end if;
  delete from public.content_drafts where kind = p_kind and key = p_key;
end;
$$;

create or replace function public.delete_content(p_kind text, p_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.content_lock(p_kind, p_key, null, false);
  if exists (select 1 from public.content_versions where kind = p_kind and key = p_key) then
    raise exception 'Published items cannot be deleted. Hide it instead.';
  end if;
  delete from public.content_drafts where kind = p_kind and key = p_key;
  update public.content_items set deleted_at = now() where kind = p_kind and key = p_key;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values ((select auth.uid()), 'delete_content', 'content_items', null, jsonb_build_object('item', p_kind || ':' || p_key));
end;
$$;

create or replace function public.set_content_hidden(p_kind text, p_key text, p_hidden boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_latest integer;
begin
  v_latest := public.content_lock(p_kind, p_key, null, false);
  if v_latest = 0 then
    raise exception 'This item has no published version yet';
  end if;
  update public.content_items
  set live_version = case when p_hidden then null else v_latest end
  where kind = p_kind and key = p_key;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values ((select auth.uid()), case when p_hidden then 'hide_content' else 'show_content' end, 'content_items', null,
          jsonb_build_object('item', p_kind || ':' || p_key));
end;
$$;

create or replace function public.restore_content_version(p_kind text, p_key text, p_version integer)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_latest integer;
  v_body jsonb;
  v_at timestamptz := public.content_now();
begin
  v_latest := public.content_lock(p_kind, p_key, null, false);
  select body into v_body from public.content_versions where kind = p_kind and key = p_key and version = p_version;
  if not found then
    raise exception 'Version not found';
  end if;

  insert into public.content_drafts (kind, key, body, base_version, updated_at, updated_by)
  values (p_kind, p_key, v_body, v_latest, v_at, (select auth.uid()))
  on conflict (kind, key) do update
    set body = excluded.body, base_version = excluded.base_version,
        updated_at = excluded.updated_at, updated_by = excluded.updated_by;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values ((select auth.uid()), 'restore_content', 'content_items', null,
          jsonb_build_object('item', p_kind || ':' || p_key, 'version', p_version));
  return v_at;
end;
$$;

revoke execute on function public.content_lock(text, text, timestamptz, boolean) from public, anon, authenticated;
revoke execute on function public.content_now() from public, anon;
grant execute on function public.content_now() to authenticated;
revoke execute on function public.admin_init_content_item(text, text, jsonb, boolean) from public, anon;
grant execute on function public.admin_init_content_item(text, text, jsonb, boolean) to authenticated;
revoke execute on function public.save_content_draft(text, text, jsonb, timestamptz) from public, anon;
grant execute on function public.save_content_draft(text, text, jsonb, timestamptz) to authenticated;
revoke execute on function public.publish_content(text, text, timestamptz) from public, anon;
grant execute on function public.publish_content(text, text, timestamptz) to authenticated;
revoke execute on function public.discard_content_draft(text, text) from public, anon;
grant execute on function public.discard_content_draft(text, text) to authenticated;
revoke execute on function public.delete_content(text, text) from public, anon;
grant execute on function public.delete_content(text, text) to authenticated;
revoke execute on function public.set_content_hidden(text, text, boolean) from public, anon;
grant execute on function public.set_content_hidden(text, text, boolean) to authenticated;
revoke execute on function public.restore_content_version(text, text, integer) from public, anon;
grant execute on function public.restore_content_version(text, text, integer) to authenticated;

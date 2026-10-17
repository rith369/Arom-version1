-- AROM: announcements at the top of every user page (BACKEND-HANDOFF.md
-- section 15). Everyone reads the ones that are running, signed out
-- visitors included; admins read all. Only admins publish and end them,
-- through publish_announcement() and end_announcement(), audit logged.

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  text_km text not null check (char_length(text_km) between 1 and 300),
  text_en text not null default '' check (char_length(text_en) <= 300),
  tone text not null default 'info' check (tone in ('info', 'good', 'important')),
  -- A page inside AROM only, never another website.
  link text not null default '' check (link = '' or link ~ '^/(?!/)[A-Za-z0-9._~/-]*$'),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  ends_at timestamptz,
  ended_at timestamptz,
  ended_by uuid references public.profiles (id) on delete set null
);

create index announcements_running_idx on public.announcements (created_at desc) where ended_at is null;

alter table public.announcements enable row level security;
revoke all on public.announcements from anon, authenticated;
grant select on public.announcements to anon, authenticated;

create policy "Anyone reads running announcements"
  on public.announcements for select to anon, authenticated
  using (ended_at is null and (ends_at is null or ends_at > now()));

create policy "Admins read all announcements"
  on public.announcements for select to authenticated
  using (public.is_admin());

create or replace function public.publish_announcement(
  p_text_km text,
  p_text_en text,
  p_tone text,
  p_link text,
  p_ends_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can publish an announcement';
  end if;
  if p_ends_at is not null and p_ends_at <= now() then
    raise exception 'The end time must be in the future';
  end if;

  insert into public.announcements (text_km, text_en, tone, link, created_by, ends_at)
  values (trim(p_text_km), trim(coalesce(p_text_en, '')), p_tone, trim(coalesce(p_link, '')), v_admin, p_ends_at)
  returning id into v_id;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (v_admin, 'publish_announcement', 'announcements', v_id,
          jsonb_build_object('text', left(trim(p_text_km), 120), 'tone', p_tone));
  return v_id;
end;
$$;

create or replace function public.end_announcement(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
begin
  if not public.is_admin() then
    raise exception 'Only an admin can end an announcement';
  end if;

  update public.announcements
  set ended_at = now(), ended_by = v_admin
  where id = p_id and ended_at is null;
  if not found then
    raise exception 'This announcement has already ended';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (v_admin, 'end_announcement', 'announcements', p_id, '{}'::jsonb);
end;
$$;

revoke execute on function public.publish_announcement(text, text, text, text, timestamptz) from public, anon;
grant execute on function public.publish_announcement(text, text, text, text, timestamptz) to authenticated;
revoke execute on function public.end_announcement(uuid) from public, anon;
grant execute on function public.end_announcement(uuid) to authenticated;

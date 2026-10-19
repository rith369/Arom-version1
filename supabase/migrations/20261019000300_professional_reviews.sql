-- AROM: clients review their professional (BACKEND-HANDOFF.md section 30).
--
-- Decided by Rith (19 Oct 2026):
--   * Only a user with a completed session with that professional can
--     review. Cancelled and "did not come" sessions do not count.
--   * One review per professional per user: 1 to 5 stars and an optional
--     comment. The user can edit or delete it at any time.
--   * A review shows at once. Admins can hide one (with a reason) and show
--     it again; both are written to admin_audit_log.
--   * The professional can write one public reply per review.
--   * Reviews are anonymous for everyone: the public, the professional and
--     admins never see who wrote a review. Only the writer reads their own
--     row (RLS). Seeing a therapist is private, so no name is shown.
--
--   1. professional_reviews table, RLS: the writer reads their own row only.
--      Every write goes through the functions below.
--   2. User: save_my_review(), delete_my_review().
--   3. Public: public_professional_reviews(), public_review_summaries().
--   4. Professional: my_professional_reviews(), reply_to_review().
--   5. Admin: admin_list_reviews(), admin_set_review_hidden().
--
-- The old professional_profiles.rating and review_count columns stay unused:
-- the numbers are counted from visible reviews when they are read.
--
-- Run after 20261019000200_chat_attachments.sql. Nothing else depends on it.

-- ===========================================================================
-- 1. The table
-- ===========================================================================
create table public.professional_reviews (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professional_profiles (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text check (char_length(comment) <= 1000),
  reply text check (char_length(reply) <= 1000),
  replied_at timestamptz,
  hidden_at timestamptz,
  hidden_by uuid references public.profiles (id) on delete set null,
  hidden_reason text check (char_length(hidden_reason) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_id, user_id)
);

create index professional_reviews_professional_idx
  on public.professional_reviews (professional_id, created_at desc);

create trigger professional_reviews_set_updated_at
  before update on public.professional_reviews
  for each row execute function public.set_updated_at();

alter table public.professional_reviews enable row level security;

-- The writer reads their own review (with any reply and hidden note).
-- No insert, update or delete policy: the functions below do the writing.
create policy "Users read their own reviews"
  on public.professional_reviews
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ===========================================================================
-- 2. User: write, edit and delete their own review
-- ===========================================================================
create or replace function public.save_my_review(p_slug text, p_rating integer, p_comment text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_professional uuid;
  v_comment text := nullif(trim(coalesce(p_comment, '')), '');
  v_id uuid;
begin
  if v_user is null then
    raise exception 'Please log in to continue.';
  end if;
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'Please choose 1 to 5 stars.';
  end if;
  if char_length(v_comment) > 1000 then
    raise exception 'Please keep your review under 1000 characters.';
  end if;

  select pp.id into v_professional
  from public.professional_profiles pp
  where pp.slug = p_slug;
  if v_professional is null or v_professional = v_user then
    raise exception 'Professional not found.';
  end if;

  if not exists (
    select 1 from public.appointments a
    where a.user_id = v_user
      and a.professional_id = v_professional
      and a.status = 'completed'
  ) then
    raise exception 'You can review a professional after a completed session with them.';
  end if;

  -- One review per professional: a second save edits it. A hidden review
  -- stays hidden after an edit, so editing cannot undo a moderation choice.
  insert into public.professional_reviews (professional_id, user_id, rating, comment)
  values (v_professional, v_user, p_rating, v_comment)
  on conflict (professional_id, user_id)
  do update set rating = excluded.rating, comment = excluded.comment
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.delete_my_review(p_slug text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Please log in to continue.';
  end if;

  delete from public.professional_reviews r
  using public.professional_profiles pp
  where pp.id = r.professional_id
    and pp.slug = p_slug
    and r.user_id = v_user;
end;
$$;

revoke execute on function public.save_my_review(text, integer, text) from public, anon;
grant execute on function public.save_my_review(text, integer, text) to authenticated;
revoke execute on function public.delete_my_review(text) from public, anon;
grant execute on function public.delete_my_review(text) to authenticated;

-- ===========================================================================
-- 3. Public: visible reviews of a listed professional, never the writer
-- ===========================================================================
create or replace function public.public_professional_reviews(p_slug text)
returns table (
  id uuid,
  rating smallint,
  comment text,
  reply text,
  replied_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.rating, r.comment, r.reply, r.replied_at, r.created_at, r.updated_at
  from public.professional_reviews r
  join public.professional_profiles pp on pp.id = r.professional_id
  where pp.slug = p_slug
    and r.hidden_at is null
    and public.is_listed_professional(pp.id)
  order by r.created_at desc
  limit 50;
$$;

-- Average and count of visible reviews, per listed professional (or one).
create or replace function public.public_review_summaries(p_slug text default null)
returns table (slug text, average_rating numeric, review_count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select pp.slug, round(avg(r.rating)::numeric, 1), count(*)::integer
  from public.professional_reviews r
  join public.professional_profiles pp on pp.id = r.professional_id
  where r.hidden_at is null
    and (p_slug is null or pp.slug = p_slug)
    and public.is_listed_professional(pp.id)
  group by pp.slug;
$$;

grant execute on function public.public_professional_reviews(text) to anon, authenticated;
grant execute on function public.public_review_summaries(text) to anon, authenticated;

-- ===========================================================================
-- 4. Professional: read their reviews and reply
-- ===========================================================================
create or replace function public.my_professional_reviews()
returns table (
  id uuid,
  rating smallint,
  comment text,
  reply text,
  replied_at timestamptz,
  hidden boolean,
  hidden_reason text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.rating, r.comment, r.reply, r.replied_at,
         r.hidden_at is not null, r.hidden_reason, r.created_at, r.updated_at
  from public.professional_reviews r
  where r.professional_id = (select auth.uid())
  order by r.created_at desc
  limit 200;
$$;

-- An empty reply removes it.
create or replace function public.reply_to_review(p_review_id uuid, p_reply text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reply text := nullif(trim(coalesce(p_reply, '')), '');
begin
  if char_length(v_reply) > 1000 then
    raise exception 'Please keep your reply under 1000 characters.';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'professional' and p.account_status = 'active'
  ) then
    raise exception 'Only an active professional can reply.';
  end if;

  update public.professional_reviews r
  set reply = v_reply,
      replied_at = case when v_reply is null then null else now() end
  where r.id = p_review_id
    and r.professional_id = (select auth.uid());

  if not found then
    raise exception 'Review not found.';
  end if;
end;
$$;

revoke execute on function public.my_professional_reviews() from public, anon;
grant execute on function public.my_professional_reviews() to authenticated;
revoke execute on function public.reply_to_review(uuid, text) from public, anon;
grant execute on function public.reply_to_review(uuid, text) to authenticated;

-- ===========================================================================
-- 5. Admin: see every review (never the writer), hide or show one
-- ===========================================================================
create or replace function public.admin_list_reviews()
returns table (
  id uuid,
  professional_slug text,
  professional_name text,
  rating smallint,
  comment text,
  reply text,
  replied_at timestamptz,
  hidden_at timestamptz,
  hidden_reason text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only an admin can see all reviews.';
  end if;

  return query
    select r.id, pp.slug, pp.display_name, r.rating, r.comment, r.reply, r.replied_at,
           r.hidden_at, r.hidden_reason, r.created_at, r.updated_at
    from public.professional_reviews r
    join public.professional_profiles pp on pp.id = r.professional_id
    order by r.created_at desc
    limit 500;
end;
$$;

create or replace function public.admin_set_review_hidden(p_review_id uuid, p_hidden boolean, p_reason text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
  v_professional text;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can hide a review.';
  end if;
  if p_hidden and v_reason is null then
    raise exception 'Please give a reason for hiding this review.';
  end if;
  if char_length(v_reason) > 300 then
    raise exception 'Please keep the reason under 300 characters.';
  end if;

  update public.professional_reviews r
  set hidden_at = case when p_hidden then now() else null end,
      hidden_by = case when p_hidden then v_admin else null end,
      hidden_reason = case when p_hidden then v_reason else null end
  where r.id = p_review_id;

  if not found then
    raise exception 'Review not found.';
  end if;

  select pp.display_name into v_professional
  from public.professional_reviews r
  join public.professional_profiles pp on pp.id = r.professional_id
  where r.id = p_review_id;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    v_admin,
    case when p_hidden then 'hide_review' else 'show_review' end,
    'professional_reviews',
    p_review_id,
    jsonb_build_object('professional', v_professional, 'reason', coalesce(v_reason, ''))
  );
end;
$$;

revoke execute on function public.admin_list_reviews() from public, anon;
grant execute on function public.admin_list_reviews() to authenticated;
revoke execute on function public.admin_set_review_hidden(uuid, boolean, text) from public, anon;
grant execute on function public.admin_set_review_hidden(uuid, boolean, text) to authenticated;

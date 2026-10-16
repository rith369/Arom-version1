-- AROM: where in person sessions happen (BACKEND-HANDOFF.md section 24).
--
-- Decided by Rith (15 Oct 2026):
--   * The professional types their own place (name, address, optional map
--     link) in My profile. The admin managed public.clinics table stays
--     unused for now.
--   * Everyone can see it on the public profile.
--   * No admin review: it saves at once, like the bio.
--   * An address is required to offer in person sessions.
--
--   1. professional_profiles.office_name, office_address, office_map_url.
--   2. list_public_professionals() also returns the place. Otherwise the same
--      as file 20261014000400 (checked against the live database first). The
--      return type changes, so the function is dropped and created again.
--   3. A trigger refuses a new in person booking while the professional has
--      no address. It covers book_appointment(), accept_session_suggestion()
--      and any later path, without changing them. Bookings that already
--      exist are not touched.
--
-- Run after 20261015000200_sessions.sql. Independent of
-- 20261015001500_client_reschedule.sql.

-- ===========================================================================
-- 1. The place
-- ===========================================================================
alter table public.professional_profiles
  add column office_name text check (char_length(office_name) <= 120),
  add column office_address text check (char_length(office_address) <= 300),
  add column office_map_url text check (
    char_length(office_map_url) <= 500 and office_map_url ~ '^https://'
  );

-- ===========================================================================
-- 2. The public profile includes the place
-- ===========================================================================
drop function public.list_public_professionals(text);

create function public.list_public_professionals(p_slug text default null)
returns table (
  slug text,
  display_name text,
  display_name_km text,
  title text,
  title_km text,
  bio text,
  bio_km text,
  photo_url text,
  specialties text[],
  languages text[],
  years_experience smallint,
  session_types public.session_type[],
  price_kind text,
  price_usd numeric,
  price_max_usd numeric,
  next_open_at timestamptz,
  office_name text,
  office_address text,
  office_map_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    pp.slug, pp.display_name, pp.display_name_km, pp.title, pp.title_km,
    pp.bio, pp.bio_km, pp.photo_url, pp.specialties, pp.languages,
    pp.years_experience, pp.session_types, pp.price_kind, pp.price_usd, pp.price_max_usd,
    (
      select min(s.starts_at) from public.availability_slots s
      left join public.professional_schedules ps on ps.professional_id = s.professional_id
      where s.professional_id = pp.id and not s.is_booked
        and s.starts_at > now() + make_interval(hours => coalesce(ps.min_notice_hours, 24))
    ),
    pp.office_name, pp.office_address, pp.office_map_url
  from public.professional_profiles pp
  where public.is_listed_professional(pp.id)
    and (p_slug is null or pp.slug = p_slug)
  order by pp.verified_at nulls last, pp.display_name;
$$;

grant execute on function public.list_public_professionals(text) to anon, authenticated;

-- ===========================================================================
-- 3. No in person booking without an address
-- ===========================================================================
create or replace function public.require_office_for_in_person()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.session_type = 'in_person'
     and (tg_op = 'INSERT' or new.session_type is distinct from old.session_type)
     and not exists (
       select 1 from public.professional_profiles pp
       where pp.id = new.professional_id
         and char_length(trim(coalesce(pp.office_address, ''))) > 0
     ) then
    raise exception 'This professional has not added an address for in person sessions yet. Please choose online, or another professional';
  end if;
  return new;
end;
$$;

revoke execute on function public.require_office_for_in_person() from public, anon, authenticated;

create trigger appointments_require_office
  before insert or update of session_type on public.appointments
  for each row execute function public.require_office_for_in_person();

-- AROM: crisis helplines managed from admin Settings.
-- The admin page saves the whole ordered list at once through
-- save_crisis_resources(), which checks every row, keeps the order the admin
-- chose and writes one audit log entry. See BACKEND-HANDOFF.md section 13.

-- Same rules as the admin form. "not valid" keeps any older rows loadable.
alter table public.crisis_resources
  add constraint crisis_resources_name_check
    check (char_length(trim(name)) between 1 and 120) not valid,
  add constraint crisis_resources_name_km_check
    check (char_length(trim(name_km)) between 1 and 120) not valid,
  add constraint crisis_resources_phone_or_website_check
    check (phone is not null or website is not null) not valid,
  add constraint crisis_resources_phone_format_check
    check (regexp_replace(phone, '[[:space:]().-]', '', 'g') ~ '^\+?[0-9]{3,15}$') not valid,
  add constraint crisis_resources_sms_format_check
    check (regexp_replace(sms, '[[:space:]().-]', '', 'g') ~ '^\+?[0-9]{3,15}$') not valid,
  add constraint crisis_resources_website_check
    check (website ~ '^https://') not valid;

create or replace function public.save_crisis_resources(p_items jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids uuid[];
  v_removed jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change crisis helplines';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 50 then
    raise exception 'Send a list of up to 50 helplines';
  end if;

  select coalesce(array_agg((item ->> 'id')::uuid), '{}')
  into v_ids
  from jsonb_array_elements(p_items) as item;

  if (select count(distinct id) from unnest(v_ids) as id) <> cardinality(v_ids) then
    raise exception 'Each helpline must have its own id';
  end if;

  -- Keep the names of removed helplines in the audit log.
  select coalesce(jsonb_agg(jsonb_build_object('name', name, 'phone', phone)), '[]'::jsonb)
  into v_removed
  from public.crisis_resources
  where country_code = 'KH' and id <> all (v_ids);

  delete from public.crisis_resources
  where country_code = 'KH' and id <> all (v_ids);

  -- The table checks reject a missing Khmer name, a bad number or a website
  -- that is not https, so nothing is saved unless every row is valid.
  insert into public.crisis_resources (
    id, name, name_km, description, description_km, phone, sms, website,
    available_hours, available_hours_km, is_active, sort_order, country_code
  )
  select
    (item ->> 'id')::uuid,
    trim(item ->> 'name'),
    trim(item ->> 'kmName'),
    nullif(trim(item ->> 'description'), ''),
    nullif(trim(item ->> 'kmDescription'), ''),
    nullif(trim(item ->> 'phone'), ''),
    nullif(trim(item ->> 'sms'), ''),
    nullif(trim(item ->> 'website'), ''),
    nullif(trim(item ->> 'hours'), ''),
    nullif(trim(item ->> 'kmHours'), ''),
    coalesce((item ->> 'isActive')::boolean, true),
    (position - 1)::smallint,
    'KH'
  from jsonb_array_elements(p_items) with ordinality as list (item, position)
  on conflict (id) do update set
    name = excluded.name,
    name_km = excluded.name_km,
    description = excluded.description,
    description_km = excluded.description_km,
    phone = excluded.phone,
    sms = excluded.sms,
    website = excluded.website,
    available_hours = excluded.available_hours,
    available_hours_km = excluded.available_hours_km,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    (select auth.uid()),
    'save_crisis_resources',
    'crisis_resources',
    null,
    jsonb_build_object(
      'total', jsonb_array_length(p_items),
      'active', (select count(*) from jsonb_array_elements(p_items) as item
                 where coalesce((item ->> 'isActive')::boolean, true)),
      'removed', v_removed
    )
  );
end;
$$;

revoke execute on function public.save_crisis_resources(jsonb) from public, anon;
grant execute on function public.save_crisis_resources(jsonb) to authenticated;

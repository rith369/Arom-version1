-- AROM: journal prompts managed from /admin/journal-prompts.
-- Active prompts are the guided questions users see on "Write about today"
-- (/detection/journal), in the admin's display order. They are not private
-- content, so anyone may read the active ones. Only admins change them,
-- through save_journal_prompt(), which checks the order, limits active
-- prompts and writes one audit log entry. See BACKEND-HANDOFF.md section 26.

create table public.journal_prompts (
  id uuid primary key default gen_random_uuid(),
  -- 300 matches the question limits a saved journal entry accepts (lib/journal.ts).
  question text not null check (char_length(trim(question)) between 1 and 300),
  question_km text not null check (char_length(trim(question_km)) between 1 and 300),
  placeholder text not null default '' check (char_length(placeholder) <= 400),
  placeholder_km text not null default '' check (char_length(placeholder_km) <= 500),
  sort_order integer not null unique check (sort_order > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.journal_prompts is
  'Guided questions on the journal page. Admins manage them; users see the active ones.';

alter table public.journal_prompts enable row level security;

grant select on public.journal_prompts to anon, authenticated;

create policy "Anyone reads active journal prompts"
  on public.journal_prompts for select
  to anon, authenticated
  using (is_active);

create policy "Admins read all journal prompts"
  on public.journal_prompts for select
  to authenticated
  using ((select public.is_admin()));

-- No insert, update or delete policies: writes only go through the function below.

create or replace function public.save_journal_prompt(p_item jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := (p_item ->> 'id')::uuid;
  v_order integer := (p_item ->> 'order')::integer;
  v_active boolean := coalesce((p_item ->> 'isActive')::boolean, true);
  v_old public.journal_prompts;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can change journal prompts';
  end if;

  select * into v_old from public.journal_prompts where id = v_id for update;

  if exists (
    select 1 from public.journal_prompts where sort_order = v_order and id <> v_id
  ) then
    raise exception 'That display order is already used. Choose another number.';
  end if;

  -- A saved journal entry holds up to 20 questions, and users can add their own.
  if v_active and (
    select count(*) from public.journal_prompts where is_active and id <> v_id
  ) >= 10 then
    raise exception 'Up to 10 prompts can be active at once. Make another prompt inactive first.';
  end if;

  insert into public.journal_prompts (
    id, question, question_km, placeholder, placeholder_km, sort_order, is_active, updated_by
  )
  values (
    v_id,
    trim(p_item ->> 'question'),
    trim(p_item ->> 'kmQuestion'),
    coalesce(trim(p_item ->> 'placeholder'), ''),
    coalesce(trim(p_item ->> 'kmPlaceholder'), ''),
    v_order,
    v_active,
    (select auth.uid())
  )
  on conflict (id) do update set
    question = excluded.question,
    question_km = excluded.question_km,
    placeholder = excluded.placeholder,
    placeholder_km = excluded.placeholder_km,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now(),
    updated_by = excluded.updated_by;

  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (
    (select auth.uid()),
    'save_journal_prompt',
    'journal_prompts',
    v_id,
    jsonb_build_object(
      'question', trim(p_item ->> 'question'),
      'created', v_old.id is null,
      'from_active', v_old.is_active,
      'to_active', v_active
    )
  );
end;
$$;

revoke execute on function public.save_journal_prompt(jsonb) from public, anon;
grant execute on function public.save_journal_prompt(jsonb) to authenticated;

-- The two questions the journal page showed before, plus one ready to switch on.
insert into public.journal_prompts (question, question_km, placeholder, placeholder_km, sort_order, is_active)
values
  (
    'What made you happy today?',
    'អ្វីដែលធ្វើឱ្យអ្នកសប្បាយចិត្តថ្ងៃនេះ (Positive Moments)',
    'e.g. A friend smiled at me, had good lunch',
    'ឧ. មិត្តភក្តិញញឹមដាក់ ឬបានញ៉ាំអាហារឆ្ងាញ់',
    1,
    true
  ),
  (
    'What was challenging or difficult?',
    'អ្វីដែលជាឧបសគ្គ ឬពិបាកចិត្ត (Challenges)',
    'e.g. Study pressure, unexpected delays',
    'ឧ. សម្ពាធរៀនសូត្រ ឬការងារដែលត្រូវប្រគល់បន្ទាន់',
    2,
    true
  ),
  (
    'What are you grateful for today?',
    'អ្វីដែលអ្នកដឹងគុណថ្ងៃនេះ (Gratitude)',
    'Write about something you appreciated today.',
    'សរសេរអំពីអ្វីដែលអ្នកពេញចិត្តថ្ងៃនេះ។',
    3,
    false
  );

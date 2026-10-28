-- Understand yourself: a third self map part, "personality". BACKEND-HANDOFF.md section 38.
--
-- Rith decided (28 Oct 2026): a Big Five personality part (Mini IPIP, 20
-- public domain questions) with a "closest 4 letter style" for fun. It is
-- never called MBTI, which is a trademark with licensed questions.
--
-- Answers: an array of 20 numbers, 0 to 4. Only the allowed parts and the
-- save function change; the tables, sharing and the professional's read
-- function already handle any part.

begin;

alter table public.self_map_parts drop constraint self_map_parts_part_check;
alter table public.self_map_parts
  add constraint self_map_parts_part_check check (part in ('values', 'coping', 'personality'));

create or replace function public.save_self_map_part(p_part text, p_answers jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'Please log in to continue.' using errcode = 'PT401';
  end if;

  if p_part not in ('values', 'coping', 'personality')
    or p_answers is null
    or (p_part = 'values' and jsonb_typeof(p_answers) <> 'object')
    or (p_part = 'coping' and (jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> 28))
    or (p_part = 'personality' and (jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) <> 20))
  then
    raise exception 'Please answer the questions again.' using errcode = '22023';
  end if;

  insert into public.self_map_parts as s (user_id, part, answers)
  values (v_me, p_part, p_answers)
  on conflict (user_id, part)
  do update set
    previous_answers = s.answers,
    previous_at = s.updated_at,
    answers = excluded.answers,
    updated_at = now();
end;
$$;

revoke execute on function public.save_self_map_part(text, jsonb) from public, anon;
grant execute on function public.save_self_map_part(text, jsonb) to authenticated;

notify pgrst, 'reload schema';

commit;

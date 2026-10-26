-- A professional can give a 2 week program (MindGuide, section 36) as a care
-- task. It is stored like a lesson, tip or practice: mindguide_type 'program'
-- and mindguide_item_id the program id ('stress' or 'anxiety'). The API only
-- accepts published items (isPublishedMindGuide in lib/care.ts). No other
-- table or function changes.

begin;

alter table public.care_tasks drop constraint care_tasks_mindguide_type_check;

alter table public.care_tasks
  add constraint care_tasks_mindguide_type_check
  check (mindguide_type in ('lesson', 'tip', 'practice', 'program'));

commit;

begin;

-- Shared professional reads use get_shared_client_data_safe().
drop policy "Therapists read shared surveys"
  on public.onboarding_surveys;

drop policy "Therapists read shared symptom checks"
  on public.symptom_checks;

-- Professional booking reads use read_my_pro_bookings_safe().
drop policy "Client and therapist read intake answers"
  on public.intake_answers;

create policy "Clients read own intake answers"
  on public.intake_answers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.appointments as a
      where a.id = intake_answers.appointment_id
        and a.user_id = (select auth.uid())
    )
  );

-- Professional progress reads use read_pro_care_plan_safe(),
-- which explicitly checks the existing sharing permission.
drop policy "Client, or professional while shared, reads check ins"
  on public.care_check_ins;

create policy "Clients read own care check ins"
  on public.care_check_ins
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.care_tasks as t
      where t.id = care_check_ins.task_id
        and t.client_id = (select auth.uid())
    )
  );

notify pgrst, 'reload schema';

commit;
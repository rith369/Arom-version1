# AROM: What To Do If Data Leaks

For the AROM team (Rith, Sokheng, Hok Chheng). Read it once now, so it is familiar on a bad day.

AROM holds journals, moods, screening answers, therapy bookings and messages. A leak can hurt real people, so speed matters more than being perfect. **If you are unsure whether something is a leak, treat it as one** until you know it is not.

This file is public, like the rest of the repository. Never write keys, passwords or people's details here or in a GitHub issue. Talk in private, by phone or a private chat.

## Signs to watch for

- The Admin dashboard shows a warning: someone made an admin that nobody expected, an admin with no authenticator app, many accounts locked, or a jump in crashes (`BACKEND-HANDOFF.md` section 47).
- A user says they saw someone else's journal, booking, message or name.
- A key, password or `.env` file appears in a commit, a screenshot or a chat.
- Supabase or Vercel emails about unusual activity, or GitHub warns about a leaked secret.
- Data you know is private shows up somewhere it should not be.

## Step 1: Tell the team (first 15 minutes)

1. Call or message Rith and the others privately. One person leads and keeps notes from now on.
2. Write down the time, what was seen, and who saw it. Keep screenshots.
3. Do not delete anything yet. Logs and rows are the evidence.

## Step 2: Save the evidence (first hour)

Logs disappear quickly on the free plans, so do this first.

1. **Vercel:** open the project, then Logs. Runtime logs are kept only a short time on Hobby. Download or screenshot anything around the time of the problem.
2. **Supabase:** open Logs (Auth, API and Postgres). The free plan keeps about a day. Save what matters.
3. **Database:** in the Supabase SQL Editor, read (never change) the `admin_audit_log` table for recent admin actions, and `security_events` for recent lockouts.

## Step 3: Stop it (first hour)

Do the ones that fit. Each step is safe to do even if it turns out not to be needed.

- **A person's account is being misused:** Admin, Users, suspend the account. This also signs them out everywhere.
- **An admin or therapist account is misused:** suspend it the same way. If it is your own, change your password and remove and add your authenticator app again at `/mfa`.
- **A key leaked** (Supabase secret key, Gemini key, or any other):
  1. Make a new key: Supabase, Project Settings, API Keys. For Gemini, Google AI Studio, API keys.
  2. Put the new key in Vercel, Settings, Environment Variables, then redeploy production.
  3. Delete the old key. A key in a public commit is leaked forever, even after the commit is removed.
- **Everyone should be signed out** (for example the login system itself was affected): rotate the JWT signing key in Supabase (Project Settings, JWT Keys). Every person has to log in again. Then check that login still works on the live site.
- **A bug in AROM shows private data:** turn the feature off or roll back. In Vercel, Deployments, pick the last good production deployment and choose "Promote" (or "Instant Rollback"). Then fix it in a pull request, with a check in `tests/security/` that would have caught it.

## Step 4: Work out what happened (first 2 days)

Answer these in the notes:

1. What data was exposed: which tables, which kinds (journals, bookings, messages, names, emails)?
2. Whose data: how many people, and which accounts? Make a private list, never in GitHub.
3. Who could see it, and for how long?
4. How did it happen, and is it fully stopped?

## Step 5: Tell the people affected (within 3 days of knowing)

The Privacy Policy promises: "If a data breach affects you, we will tell you as soon as we reasonably can." Aim for **within 72 hours** of confirming it.

- Email each person affected from arom.mental@gmail.com. Use plain words. Say what happened, what data, what we did, and what they can do.
- If therapists' clients are affected, tell those therapists too.
- If University of Puthisastra students or staff are affected, tell the UP clinic.
- Ask a lawyer whether Cambodian law requires telling a government office, and whether it changes anything else here.

A starting point for the email (send it in Khmer and English; a Khmer speaker must check the Khmer first):

> **English.** We are writing to tell you about a problem with AROM. On [date], [what happened, in one sentence]. This may have exposed your [kind of data]. We have [what we did, for example closed the gap and changed our keys]. You can [what they can do, for example change your password]. We are very sorry. If you have questions, reply to this email.
>
> **Khmer (draft, needs review).** យើងសូមជម្រាបអំពីបញ្ហាមួយនៅក្នុង AROM។ នៅថ្ងៃទី [កាលបរិច្ឆេទ] [អ្វីដែលបានកើតឡើង]។ ព័ត៌មាន [ប្រភេទព័ត៌មាន] របស់អ្នកប្រហែលជាត្រូវបានគេមើលឃើញ។ យើងបាន [អ្វីដែលយើងបានធ្វើ]។ អ្នកអាច [អ្វីដែលពួកគេអាចធ្វើ]។ យើងសូមអភ័យទោសយ៉ាងខ្លាំង។ ប្រសិនបើអ្នកមានសំណួរ សូមឆ្លើយតបមកអ៊ីមែលនេះ។

If the leak puts someone at risk (for example a journal about self harm), also check that they know the crisis helplines in the app.

## Step 6: Learn from it (within 2 weeks)

1. Write a short entry in `report.md`: what happened, what changed, what to re-test. Leave out people's names.
2. Add a check to `tests/security/` so the same mistake fails automatically next time.
3. Update this plan if a step was wrong or missing.

## Good to know now

- **There are no backups** on the Supabase free plan. Deleted or changed data cannot be brought back. Do not run "fix up" SQL during an incident without a second person checking it.
- **Previews use the real database.** Do not test an attack on a preview link.
- **Where things are:** Admin, Audit log (admin actions). Admin dashboard (warnings, crash reports). Supabase Logs. Vercel Logs. `BACKEND-HANDOFF.md` sections 39 to 47 (security decisions).

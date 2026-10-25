# AROM: Change Report

## 26 Oct 2026: Journal Never Writes Words for You, a Gentle Door on Very Low Days, Three New Feelings

Commit `3911091`. No migration.

**Why.** When a student picked a mood and saved without writing, the journal saved a made up text in their name, for example "Had a good, productive day today! Things went smoothly" or "I accomplished my goals". That text then appeared in their history and the AI summary read it as if they wrote it, so summaries could describe things that never happened. A journal must only hold the person's own words. We also wanted a quiet way to reach help on very low days, and feelings that point to self esteem and relationships for the suggestions.

**What changed for users:**
- **Mood only entries:** saving with no words now saves just the mood and feelings. History and the entry details say "Mood only, nothing written". Older entries that held the made up text now show the same.
- **Honest summaries:** the AI is told these entries have no words and must not guess what happened. Summaries are written once more so the old made up text is left out.
- **A gentle door on Very Low:** picking Very Low shows "If today feels too heavy, you can talk to someone." with Talk to a professional and See helplines. It is not an alarm and does not stop the entry.
- **Three new feelings:** Worried (ខ្វល់ខ្វាយ), Insecure (មិនជឿជាក់លើខ្លួនឯង) and Hurt (ឈឺចាប់ក្នុងចិត្ត). They lead to anxiety, self esteem and relationships suggestions.

**What changed for the team:**
- `lib/journal.ts`: `content` may be empty; `journalText()` turns the old made up texts into "" (used by the page and the summary).
- `app/detection/journal/page.tsx`: removed `getStarterReflectionForMood`; mood only label; Very Low help line; new feelings and icons.
- `lib/wellbeing-topics.ts`: Worried, Insecure, Hurt mapped to topics. `lib/gemini-journal.ts`: mood only rule. Summary key moved to `v4`.

**What to re-test:**
1. Pick a mood, write nothing, save: the saved screen and history say "Mood only, nothing written".
2. An older entry saved without words (for example "Had a good, productive day today!") now shows as mood only.
3. With the summary on, check it does not mention events from mood only entries.
4. Pick Very Low: the gentle line shows; Talk to a professional opens the directory; See helplines opens the helplines; you can still save.
5. Pick Worried, Insecure or Hurt and save: Suggested for you shows anxiety, self esteem or relationships content.
6. Check the Khmer words for the three new feelings with a Khmer speaker.

## 26 Oct 2026: A Strong 2 Week Recheck Now Sets the Next Recheck Date

Commit `e1e4e73`. Migration `20261026000300_recheck_date_after_strong.sql` (applied 26 Oct, merged in PR #36): replaces the `apply_support_path()` trigger function, one branch changed.

**Why.** When a person's 2 week recheck came back with Strong signs, the database kept the old recheck date. The app then thought the check was still due forever, and the person was never asked to check again 2 weeks later. The Home card already hid the stuck reminder; this fixes the cause, so people with the hardest results keep getting their 2 week check ins.

**What changed for users:**
- **Next check after a Strong recheck:** a Strong result on or after the recheck day now sets the next recheck 14 days later, so Home reminds them again in 2 weeks.
- **Nothing else changes:** a Strong result before the recheck day still keeps the existing date. Book a professional is still offered with every Strong result.

**What changed for the team:**
- New migration with the same `apply_support_path()` as `20261008000800`, except the "serious at any point" branch also moves `review_due_on` when the review day has come. It also repairs journeys already stuck (none on 26 Oct 2026).
- `BACKEND-HANDOFF.md` section 35 updated.

**What to re-test:**
1. The migration is applied (26 Oct).
2. With a test account, take a check with Some signs, then set that journey's `review_due_on` to today in Supabase.
3. Take the same check again and answer for a Strong result.
4. In Supabase, the journey's `review_due_on` is now 14 days from today, and Home shows no reminder card.
5. Take a Strong check before the recheck day: `review_due_on` does not change.

## 26 Oct 2026: Home Reminds You When Your 2 Week Symptom Check Is Due

Commit `9820e77`. No migration. Frontend only.

**Why.** After a symptom check with some signs, the result says AROM will ask the person to check again in 2 weeks. But the reminder only showed on the Symptom check page, so anyone who did not open that page never saw it. Home is where people come every day, so the reminder now shows there.

**What changed for users:**
- **Home card on the day:** from the review day, Home shows "Time for your 2 week check in" with **Check now**, which opens the Symptom check page. It goes away once they take the check again.
- **Private on Home:** the card never says which check it is (for example trauma or low mood), because other people can see a phone's Home screen. The Symptom check page shows which check is due.
- **Clearer result sentence:** "On 9 November, we will remind you on Home to check again." (and in Khmer).
- **Fixed a stuck reminder:** after a Strong result on the review day, "Time to check again" no longer stays on screen forever.

**What changed for the team:**
- New `app/components/check-in-due-card.tsx` (`useCheckInDue`, `CheckInDueCard`), shown in `app/components/arom-main-view.tsx` under the next session card.
- New `dueJourneys()` in `lib/symptom-checks.ts`, used by Home and the Symptom check page. A journey is due when the review day has come and no check of that concern was taken since.
- `BACKEND-HANDOFF.md` section 35: the Home reminder, and a trigger gap in `apply_support_path()` that still needs a backend fix (a Strong recheck does not move `review_due_on`).

**What to re-test:**
1. With an account that has no checks due, Home shows no reminder card.
2. Take a check with Some or Clear signs: the result says "On <date>, we will remind you on Home to check again."
3. To see the card without waiting 2 weeks, set that journey's `review_due_on` to today in Supabase (test account only), then open Home: the card shows, in English and Khmer, without naming the check.
4. Tap Check now: the Symptom check page shows "Time to check again" for that check.
5. Take the check again: the card is gone from Home and the page, also when the new result is Strong.
6. Signed out, Home shows no card.

## 26 Oct 2026: Journal Suggests Lessons, Tips, Practices and Professionals for Your Week

Commit `4bf6103`. No migration.

**Why.** After seeing their week, a student should be able to do something about it straight away. If they felt stressed, AROM now points to real stress content and to professionals who help with stress, without them having to search MindGuide or the directory.

**What changed for users:**
- **"Suggested for you" card** under Your week: for the week's topic (for example Stress), one lesson, one tip and one practice. Tap one to open it.
- **Add to Home:** each suggestion has an Add to Home button that puts it on Your Plan For Today on Home. Tap again to remove it.
- **Talk to a professional:** up to 2 professionals who help with that topic (UP professionals and free ones first), and See all professionals. On an ordinary week it is the last row. On a hard week (3 or more days marked Not Good or Very difficult) it comes first, with warmer words.
- **How the topic is found:** from the feelings picked in the last 7 days (Stressed, Anxious, Tired, Sad, Lonely, Overwhelmed, Angry). When the written summary is on, Gemini also names the topic from what was written, so a student who writes about exams without ticking Stressed still gets stress suggestions. With two topics, the student can switch between them.
- **No card when it does not fit:** a calm, happy week shows no suggestions, and when the summary shows the helplines, suggestions are hidden.

**What changed for the team:**
- New `lib/wellbeing-topics.ts`: the fixed topic list, content ids and specialties for each, feelings mapping and `weekTopics()`.
- New `app/_components/journal/journal-suggestions.tsx` (loaded after the page, since lesson data is large).
- New `GET /api/professionals` (public directory, slimmed) and `ProfessionalCard` type in `lib/therapists.ts`.
- Gemini summary now returns `topics` (up to 2, checked against the list). The summary key moved to `v3`, so summaries are written once more to get topics.
- `BACKEND-HANDOFF.md` section 22 updated.

**What to re-test:**
1. Write an entry with the feeling Stressed, open Past Reflections: Suggested for you shows a stress lesson, tip and practice.
2. Tap Add to Home on one, go Home: it is in Your Plan For Today. Back on the journal it shows On Home; tapping it again removes it.
3. Pick Stressed and Tired on different entries: two topic chips show and switch the suggestions.
4. Mark 3 days as Not Good or Very difficult: Talk to a professional moves to the top with the hard week text.
5. With a UP account, UP professionals show first.
6. A week with only Happy, Calm or Proud shows no suggestions card.
7. Switch to Khmer and check the card reads well.

## 26 Oct 2026: Journal Summary No Longer Shows the Crisis Message by Mistake

Commit `fbb8c82`. No migration.

**Why.** A student with only happy entries got "What you wrote this week sounds really heavy" and the helplines instead of a summary. The word check that runs before anything goes to Gemini looked for parts of words, so everyday phrases like "spend my", "attend my", "recommend my", "weekend my" (they contain "end my") and "this homework is killing me" counted as a crisis. Nothing was sent to Gemini, so no summary was written.

**What changed for users:**
- **Real summaries for normal entries:** only whole crisis phrases count now (for example "want to die", "kill myself", "end my life", "cut myself", and the Khmer phrases). Everyday words no longer trigger the crisis message.
- **Gemini's own check is narrower:** it flags only when someone writes about suicide, wanting to die, hurting themselves or someone else, abuse or danger. Sadness, stress, tiredness or a hard day get a normal summary.
- **Written again:** summaries saved before this fix are written again the next time the journal opens.

**What changed for the team:**
- `lib/gemini-journal.ts`: `CRISIS_WORDS` use whole word matches; prompt rule 6 is narrower.
- `lib/controllers/journal-summary-controller.ts`: the entries key starts with `v2`, so old summaries count as out of date.

**What to re-test:**
1. With happy entries such as "I spend my evening with friends", open Past Reflections: a real summary shows.
2. Write a test entry with "I want to die": the support message and helplines still show.
3. In Khmer, a test entry with "ខ្ញុំចង់ស្លាប់" still shows the support message.

## 26 Oct 2026: Real Journal Summary Written by Gemini (Off Until You Turn It On)

Commit `9a5120d`, merged in PR #35. Migration `20261026000200_journal_ai_summary.sql` applied 26 Oct 2026 (renamed from `20261026000100`, which PR #34 also used; nothing to run again). Needs `GEMINI_API_KEY` (paid plan) in Vercel and `.env.local`.

**Why.** Students asked for a summary that actually reads their week. The journal is the most private data in AROM, so the summary is off until the person turns it on, they are told exactly where their entries go, and the AI is held to strict rules: only what they wrote, no diagnosis, no better or worse, and the helplines instead of a summary when something heavy comes up.

**What changed for users:**
- **Turn on summary:** under "Your week" on the journal, a box explains that the last 7 days of entries are sent to Google Gemini, that Google does not train on them and keeps them up to 55 days only to check for misuse, and that professionals and admins never see them. Nothing is sent until the person taps Turn on summary.
- **The summary:** a short paragraph about the week, the main theme, up to 3 things noticed and one small thing to try, in English or Khmer, written only from their own entries. A line says it is written by AI, can be wrong and is not a diagnosis.
- **Updates by itself:** after a new entry, the summary is written again when the journal opens (at most 5 times a day). It needs at least 3 entries in 7 days.
- **Support instead of a summary:** if an entry mentions suicide, self harm, harming others or abuse, the card shows gentle words, Talk to a professional and the helplines.
- **Turn off summary** at any time; the saved summary is deleted.

**What changed for the team:**
- New table `journal_ai_summaries` (owner read only, writes only through `set_journal_summary_enabled`, `claim_journal_summary_run`, `save_journal_summary`).
- New `GET|POST|PUT /api/journal/summary`, `lib/journal-summary.ts`, `lib/gemini-journal.ts` (server only), `lib/controllers/journal-summary-controller.ts`, `app/_components/journal/journal-written-summary.tsx`.
- Env: `GEMINI_API_KEY` (required), `GEMINI_MODEL` (optional, default `gemini-3.5-flash`). Only the HTTP status is ever logged.
- `BACKEND-HANDOFF.md` section 22 has the full rules.

**What to re-test:**
1. Run the migration, add `GEMINI_API_KEY`, restart `npm run dev`.
2. Open `/detection/journal`, Past Reflections: the summary box explains where entries go and shows Turn on summary.
3. With fewer than 3 entries in 7 days, turn it on: it asks for more entries.
4. Write 3 entries: the summary appears in English; switch to Khmer and check it is written in Khmer.
5. Check it mentions only what you wrote, with no dates or percentages that were not in your entries.
6. Write a test entry with "I want to die": the card shows the support message and helplines, not a summary.
7. Turn off summary: the box goes back to Turn on, and turning it on again writes a fresh one.
8. As a second account, check you cannot see the first account's summary.

## 26 Oct 2026: Two New Symptom Checks in English and Khmer (General Distress and Trauma Short Check)

Commit `d419c23`. Migration `20261026000100_symptom_check_k10_pc_ptsd_5.sql` adds the check types `distress` and `trauma_screen` (applied 26 Oct). Merged in PR #34.

**Why.** Until now only Low mood and Anxiety could be used in Khmer, because the other checks had no Khmer from a professional. A therapist gave Rith EMDR Association Cambodia's Khmer form, and EMDR agreed AROM can use it. From that form we added the two checks that are new to AROM: K-10 (general distress) and PC-PTSD-5 (a short trauma screen). Khmer readers can now check for general distress and for trauma signs. PHQ-2 and GAD-2 on the same form are short versions of checks we already have, so they were not added. ACE (childhood experiences) asks very sensitive questions, so it will not be a self check. It is planned for the therapist intake when booking.

**What changed for users:**
- **General distress check:** 10 questions about the last 30 days, then the safety question that Low mood and Anxiety also ask. The result shows Few, Some, Clear or Strong signs (scores 10 to 15, 16 to 21, 22 to 29, 30 to 50).
- **Trauma short check:** 5 yes or no questions about the past month. An intro first explains which kinds of experience it is for and that nothing needs to be described. 3 or more "yes" shows Strong signs and suggests a professional. Get help now shows with every result.
- **Both work in Khmer:** they show while the app is in Khmer. The Khmer answer labels include EMDR's day counts, for example "ពេលខ្លះ (៦ ដល់ ១៥ថ្ងៃ)".
- **Credit:** one line at the bottom of How it works says the Khmer for these two checks is from EMDR Association Cambodia. The app does not call this Khmer "tested".
- **Professionals:** when a client shares checks for a booking, they show as "General distress (K-10)" and "Trauma short check (PC-PTSD-5)".

**What changed for the team:**
- `lib/symptom-checks.ts`: new `distress` (K-10) and `trauma_screen` (PC-PTSD-5) questionnaires with bands and comments on the source.
- `app/detection/symptoms/page.tsx`: icons and topics for both. The "One more question, about your safety" line now shows for any check with the unscored safety question. Credit line added to How it works.
- `app/pro/_data/clients.ts`: labels for the client file.
- `BACKEND-HANDOFF.md` section 35: decisions, bands, data shape and the migration.
- The Khmer was typed from the form's page images. The therapist must proofread every line before launch.

**What to re-test:**
1. Run the migration, then open `/detection/symptoms` in English: General distress and Trauma (short check) are in the list.
2. Switch to Khmer: Low mood, Anxiety, General distress and the Trauma short check show, plus the note that more checks are in English.
3. Do General distress choosing "None of the time" for every answer and "Not at all" for safety: Few signs, score 10 of 50.
4. Do it again choosing "Some of the time" for everything: score 30 of 50, Strong signs, Book a professional is offered.
5. Answer the safety question with anything other than "Not at all": Get help now shows before the result.
6. Do the Trauma short check with 2 "yes": Some signs. With 3 "yes": Strong signs. Get help now shows both times.
7. Open How it works: the EMDR Association Cambodia line is at the bottom, in English and in Khmer.
8. As a professional, open a client who shares checks: the new checks show with their names.

## 26 Oct 2026: Journal Shows Your Real Week Instead of a Made Up Summary

Commit `1155e78`. No migration. Frontend only.

**Why.** The "AI Journal Summary" on the journal page did not read anything the person wrote. It showed one of two fixed texts with invented claims ("quick recovery on Sep 8", "top 10% of self care", "healthy resilience"), the same for everyone. On a mental health app, telling a student who had a hard week that they look resilient is misleading. Until the real summary is built, the card shows only true numbers from the person's own entries.

**What changed for users:**
- **"Your week" card:** on the journal's Past Reflections, the card now shows how many entries were written on how many days in the last 7 days, how many times each mood was picked (with the mood sprouts), and the 3 feelings picked most.
- **No made up text:** the fake paragraph, the Regenerate button and the "detailed breakdown" with invented highlights are gone.
- **Honest empty state:** with no entries in the last 7 days, the card says so.
- **Coming soon line:** a note says a written summary of the week is coming.

**What changed for the team:**
- New `app/_components/journal/journal-week-summary.tsx`, counted in the browser from the entries the page already loads. No new endpoint, nothing sent anywhere.
- `app/detection/journal/page.tsx`: removed `generateAiJournalSummary`, its fake data and state.
- `BACKEND-HANDOFF.md` section 22 notes the change and the planned Gemini summary.

**What to re-test:**
1. Sign in, open `/detection/journal`, go to Past Reflections: the "Your week" card shows the right number of entries and days.
2. Check the mood counts and the top feelings match your entries from the last 7 days (older entries are not counted).
3. With an account that has no entries in the last 7 days, the card shows the empty message.
4. Switch to Khmer and check the card reads well.

## 26 Oct 2026: Clinic Page Asks for Location With a Clear Popup

Commit `503bc72`. No migration. Frontend only.

**Why.** Many students did not notice the small "Use my location to see distances" link, so they never saw how far each clinic is or which one is closest. A popup when the page opens tells them, in plain words, what the location is for. We show our own popup first and the browser's question only after "Allow", because a cold browser question gets blocked often, and once blocked the browser never asks again.

**What changed for users:**
- **Popup on first open:** opening Find Clinic & Hospital shows "See clinics near you?" with **Allow location** and **Not now**. Allow brings up the browser's location question; then distances show and the closest clinics come first (the UP clinic stays on top).
- **Not asked again and again:** Not now (or tapping outside) hides the popup until the app is opened again. If location was already allowed, there is no popup and distances show straight away. If it was blocked, there is no popup either, and the page explains how to allow it in the browser settings.
- **Bigger location button:** the "Use my location to see distances" link is now a clear button under the map.
- **Privacy unchanged:** the location stays on the device and is never sent or saved.

**What changed for the team:**
- `app/_components/clinics/use-user-location.ts`: returns `shouldAsk` (browser not asked yet, and not skipped this visit) and exports `skipLocationAsk()` (sessionStorage key `arom:clinic-location-skipped`).
- `app/_components/clinics/clinic-home-view.tsx`: shows the popup with `useConfirm`.
- `app/_components/confirm-dialog.tsx`: optional `icon` on the confirm window (default stays the alert circle).

**What to re-test:**
1. In a browser that has never been asked (or after resetting the site's location permission), open `/clinic-hospital`: the popup shows once, in English and in Khmer.
2. Tap Allow location, accept the browser question: distances show, UP stays first, samples go nearest first.
3. Reset the permission, open again, tap Not now: the popup closes and does not come back when you leave and return to the page. Close and reopen the app: it shows again.
4. Block location in the browser, open the page: no popup, and the "Location is blocked" hint shows next to the button.
5. With location already allowed, open the page: no popup, distances show straight away.

## 25 Oct 2026: Clinics on the Phone Bar, UP Clinic Always First

Commit `69ab07c`. No migration. Frontend only.

**Why.** UP students and staff need to find the UP clinic fast. On the clinic list the UP clinic could drop below a sample clinic that happened to be closer, and on phone the clinic page was hidden in the menu. Putting the UP clinic first and the page on the bottom bar makes the real help easy to see.

**What changed for users:**
- **UP clinic always on top:** on Find Clinic & Hospital, UP Counseling (EMDRAC) is always the first card, under every filter. The sample clinics follow it, closest first when the person shared their location, otherwise in the usual order.
- **Clinics on the phone bar:** the bottom bar on phone now shows **Clinics** (គ្លីនិក) where **Professional** used to be. Professional is still in the menu.
- **Menu order:** in the sidebar, Find Clinic & Hospital now comes before Professional.

**What changed for the team:**
- `app/_components/clinics/clinic-list-view.tsx`: one sort for every filter, `upStudentsOnly` clinics first, then distance.
- `app/_components/app-navigation.tsx`: bottom bar item `ClinicHospital` replaces `Professional`; bottom bar items can set a short English text (`en`).
- `app/_components/navigation-config.ts`: Find Clinic & Hospital moved to the top of the Professional section.

**What to re-test:**
1. Sign in with a UP account, open `/clinic-hospital` and check UP Counseling is the first card on All, Nearby and Clinic.
2. Tap "Use my location to see distances" and check UP stays first and the sample clinics go from nearest to farthest.
3. On a phone width, check the bottom bar shows Clinics (in English and Khmer), it opens `/clinic-hospital` and it is highlighted there.
4. Check Professional is still reachable from the menu, and the bottom bar shows no item highlighted on `/professional`.
5. On desktop, check the sidebar shows Find Clinic & Hospital above Professional.

## 24 Oct 2026: Find Clinic & Hospital Gets a Real Map and the Real UP Clinic

Commit `f06ba18`, merged in PR #33 (`5183612`). Migration `20261024001300_clinic_page_details.sql` applied 24 Oct. New packages: `leaflet`, `react-leaflet`, `@types/leaflet` (run `npm install` after pulling).

**Why.** The page was a picture of a map with made up pins and distances, and every clinic was static. Now that UP Counseling (EMDRAC) is real, it should show its real place, phone and hours, and the made up clinics must not look real: people could call numbers that belong to someone else or travel to an address that is not a clinic.

**What changed for users:**
- **A real map (OpenStreetMap)** of Phnom Penh with a pin for each clinic. Drag and zoom like any map. Tapping a pin shows the clinic with **View details** and **Directions**, which opens Google Maps.
- **UP Counseling (EMDRAC) shows its real details:** #55, Street 180, Phnom Penh; phone 089 968 678 (EMDR Association Cambodia); Thursday and Friday, 8:30 AM to 4:30 PM; the campus photo; Get Direction opens the Google Maps place.
- **Real distances:** "Use my location to see distances" (or tapping Nearby) asks for the location once; then each clinic shows how far it is and Nearby sorts closest first. The location stays on the device and is never saved.
- **The three other clinics are labelled "Sample"**, with a note that they are not real, grey pins, and no Call or Directions buttons.

**What changed for the team:**
- **Database (PR):** page fields on `clinics` (`about`, `tags`, `hours_text`, `image_url`, `maps_url`, `service_details`, with Khmer versions) and the UP row filled in.
- **App:** `GET /api/clinics`, `use-clinics.ts`, `use-user-location.ts`, `clinic-map.tsx` (Leaflet, browser only); `clinic-data.ts` keeps only `SAMPLE_CLINICS` with coordinates and a distance helper. The open clinic now follows `?clinic=` in the address.
- **Handoff:** `BACKEND-HANDOFF.md` section 32.

**What to re-test:**
1. Run the migration in the Supabase SQL Editor, merge, and run `npm install` locally.
2. As a UP student, open Find Clinic & Hospital: a real map, a green pin on Street 180 for UP Counseling (EMDRAC), grey pins for the samples.
3. Tap the UP pin: View details and Directions (Google Maps opens at the University of Puthisastra).
4. Tap "Use my location" and allow it: distances appear and Nearby sorts closest first. Deny it: a short note, no distances.
5. Open a sample clinic: "Sample" label and note, no Call or Directions.
6. The UP clinic detail shows the address, hours, phone 089 968 678 and the campus photo; Book a session still works.
7. As a normal user: the UP clinic and its pin are not shown.

## 24 Oct 2026: A Nickname Instead of "Anonymous"

Commit `2567483`, merged in PR #32 (`e752c95`). Migration `20261024001200_nickname.sql` applied 24 Oct.

**Why.** Students who hide their identity all showed as "Anonymous #1625", which was hard for therapists and the clinic desk to tell apart and felt cold. Telling students to type a fake name instead would expose everyone who signs up with Google under their real name, so hiding stays the default and a nickname is optional.

**What changed for users:**
- **Profile, Identity privacy:** while "hide my identity" is on, a new field "Name your therapist sees (optional)". The note under the switch says how others see you.
- **UP clinic booking form:** the same optional field, "Name the clinic and therapist see", saved to the profile when the request is sent.
- **Therapists** see "Mony #1625" instead of "Anonymous #1625" (the code stays, so two "Mony" never mix up). **The clinic desk** sees "Mony" with its request code. **Support groups** show "Mony" instead of "Anonymous".
- Empty nickname: nothing changes, still "Anonymous". Showing your real name: unchanged.
- Nicknames cannot contain links, emails, phone numbers, "#" or "@", or words like AROM or admin.

**What changed for the team:**
- **Database (PR):** `profiles.nickname` with a safety check, `shown_name()` used by the 8 functions that showed "Anonymous", and `clientHidden` in the professional's bookings.
- **App:** `lib/nickname.ts` (the same rules), `nickname-setting.tsx`, `profileUpdateSchema.nickname`, `AuthUser.nickname`, `anonymousLabel()` keeps the code after a nickname.
- **Handoff:** `BACKEND-HANDOFF.md` section 29.

**What to re-test:**
1. Run the migration in the Supabase SQL Editor.
2. As a user with "hide my identity" on, set the nickname "Mony" in Profile and save. The note says others see you as "Mony". Try "AROM Team" or "t.me/mony": a clear message, nothing saved.
3. As that user's therapist: clients, bookings and messages show "Mony #1625" (same number as before).
4. As the clinic desk: that student's request and chat show "Mony".
5. In a support group: that user's messages and the member list show "Mony", and "Mony (You)" for themself.
6. Clear the nickname: everything shows "Anonymous" again.
7. Book the UP clinic with a new nickname in the form: Profile shows it afterwards.

## 24 Oct 2026: Clinic Therapists No Longer See My Schedule

Commit `bd37149`. No migration. Frontend only.

**Why.** A clinic therapist's sessions come from the clinic's own times and are assigned by the clinic desk, and they are not on the Professional page. Their My schedule page still said "The times people can book a session with you", which was not true and confusing.

**What changed for users (clinic therapists only):**
- **"My schedule" is hidden** from their `/pro` menu. Opening the old link shows a short note: "You work at UP Counseling (EMDRAC). The clinic desk books your sessions from the clinic's times, so you do not need a schedule. For an online session, add the meeting link in My bookings."
- **Home** drops the "How full your week is" tile (it was based on the schedule).
- **My bookings**, when empty, says "The clinic desk assigns sessions to you."
- Normal therapists see no change.

**What changed for the team:**
- `pro-shell.tsx`, `schedule-editor-page.tsx`, `pro-dashboard.tsx` and `bookings-view.tsx` check `profile.clinic`. The profile checklist already skipped schedule and price for clinic therapists.

**What to re-test:**
1. Log in as a therapist linked to UP Counseling (EMDRAC). The `/pro` menu has no My schedule; Home has 3 tiles.
2. Open `/pro/schedule` directly: the note shows with a link to My bookings.
3. Log in as a normal therapist: My schedule and the 4th tile are still there.

## 24 Oct 2026: UP Clinic Booking Asks What UP's Form Asks, Renamed UP Counseling (EMDRAC)

Commit `e4208b6`, merged in PR #31 (`f04bb23`). Migration `20261024001100_clinic_request_details.sql` applied 24 Oct.

**Why.** UP and EMDR Association Cambodia (EMDRAC) book through a Google Form that asks age, sex, preferred language and a summary of the problem. The AROM booking should give the clinic the same information, so both ways of booking work the same for them. Name and Telegram number are left out on purpose: students stay anonymous and the desk chats in AROM.

**What changed for users:**
- **Booking at the UP clinic asks:** preferred language (Khmer or English), age, sex (Male, Female or Non-binary), and "What would you like help with?", which is now required. A line says the clinic desk and the therapist see this, and that we do not ask for a name or phone number.
- **The clinic desk** sees age, sex and language on each request.
- **The therapist** sees age, sex, preferred language and therapist preference under "Before the session", and the student's summary as their note.
- **The clinic is renamed "UP Counseling (EMDRAC)"** (Khmer: ការប្រឹក្សា UP (EMDRAC)), and its description says the therapists are from EMDR Association Cambodia.

**What changed for the team:**
- **Database (PR):** `clinic_booking_requests.age`, `sex`, `preferred_language`; `request_clinic_booking()` replaced with the new required fields; `clinic_desk_requests()` returns them; `clinic_desk_confirm()` adds them to `intake_answers`. The clinic row is renamed.
- **Handoff:** `BACKEND-HANDOFF.md` section 34.

**What to re-test:**
1. Run the migration in the Supabase SQL Editor.
2. As a UP student, open UP Counseling (EMDRAC) and tap Book a session. Try to send without language, age, sex or the help text: each shows a clear message.
3. Fill everything in and send. The desk's request shows "Age 21 · Female · Prefers Khmer" and the help text.
4. Confirm it with a therapist. In the therapist's `/pro/bookings`, "Before the session" lists Age, Sex, Preferred language and Therapist preference, with the help text above.
5. Find Clinic & Hospital and the sidebar show the new name.

## 24 Oct 2026: Clinic Desk Page Uses the Normal Phone Header

Commit `5ce1aaf`. No migration. Frontend only.

**Why.** On phones the clinic desk page started with a back arrow to Profile, unlike the other main pages. It is now a main page in the sidebar, so it should look like one.

**What changed for users:**
- **On phones the clinic desk page has the normal AROM header:** the logo, the menu button and the profile picture, like Home and Messages. The back arrow is gone. Laptops are unchanged (the sidebar is always there).

**What changed for the team:**
- `clinic-desk-view.tsx` uses `TopHeader` instead of its own back link.

**What to re-test:**
1. On a phone (or a narrow window), open the clinic desk as the desk account. The top shows the AROM logo, the menu button and your picture.
2. The menu button opens the menu with Clinic desk at the top.

## 24 Oct 2026: Clinic Desk Messages in the Sidebar

Commit `5420c14`. No migration. Frontend only.

**Why.** The desk's chats with students were only a tab inside the desk page, so new messages were easy to miss. The desk asked for Messages next to Booking requests in the sidebar.

**What changed for users:**
- **The Clinic desk section in the sidebar (and phone menu) now has two items:** Booking requests and Messages ("Chats with students"). Messages shows the number of unread student messages, checked every 30 seconds, and opens the desk straight on its Messages tab.
- The item for the open tab stays highlighted.

**What changed for the team:**
- `clinic-desk-nav.tsx` has both items and reads unread counts with `useDeskChats`. `/clinic-desk?tab=messages` opens the Messages tab (`initialTab` on `ClinicDeskView`). New navigation label `ClinicDeskMessages`.

**What to re-test:**
1. Log in as the desk account. The sidebar shows Booking requests and Messages under Clinic desk.
2. Send a message as a student. Within 30 seconds the desk's Messages item shows 1.
3. Tap Messages: the desk opens on the Messages tab and Messages is highlighted. Tap Booking requests: it opens New requests.
4. On a phone, the menu shows the same two items.

## 24 Oct 2026: Clinic Desk Chat with Students

Commits `1749c84` to `b8776cc`, merged in PR #30 (`596ad9e`). Migration `20261024000900_clinic_chat.sql` applied 24 Oct.

**Why.** The UP clinic desk needs to reach students about practical things, like a changed room, a sick therapist or a missing meeting link, and students need to ask the clinic simple questions. Until now the desk could only confirm or decline a request.

**What changed for users:**
- **Students:** once they send a booking request, a chat with "UP Wellness Clinic" appears in Messages (labelled "Clinic"). They can send text, voice messages, photos and PDF files. My appointments has "Message the clinic" on clinic requests and clinic sessions.
- **Clinic desk:** a new Messages tab (with unread counts) lists every student who sent a request, as "Anonymous" with a short code. Each request card has a Message button that opens that student's chat. The desk writes as the clinic, never by name.
- **The chat closes 30 days after the student's last request or clinic session.** Messages stay readable; a new request opens it again.
- Therapist chats are unchanged and stay private from the desk.

**What changed for the team:**
- **Database (PR):** `clinic_conversations` (created by a trigger with the first request) and `clinic_messages`, RLS on with no policies, every read and write through functions that check the student or desk membership and the 30 day rule. Admins have no access.
- **Files:** uploaded and streamed by the server into the existing private buckets under `clinic/<chat id>/`, only after the checks (`/api/clinic-chat-files/:messageId`).
- **Shared chat view:** `ChatThread` was split into `ChatThreadView` (the screen) and a small wrapper, so therapist and clinic chats share the same recorder, picker and bubbles.
- **Handoff:** `BACKEND-HANDOFF.md` section 35.

**What to re-test:**
1. Run the migration in the Supabase SQL Editor.
2. As a UP student with a clinic request: Messages shows "UP Wellness Clinic" with a "Clinic" label. Send a text, a voice message, a photo and a PDF.
3. As the desk: the Messages tab shows an unread count and the chat as "Anonymous #CODE". Open it, play the voice message, open the photo and PDF, and reply with each kind.
4. On the student's side the replies appear as the clinic (no desk name), and "Seen" shows on their own last message once the desk opened it.
5. On the desk, a request card's Message button opens that student's chat.
6. As the therapist: `/pro/messages` shows only their own therapist chats, never the clinic chat.
7. As a normal user with no clinic request: no clinic chat in Messages, and `/api/clinic-chat/up-wellness-clinic` returns "Chat not found".
8. My appointments: "Message the clinic" opens the clinic chat.

## 24 Oct 2026: Wellbeing, Loneliness and Trauma Checks Added to Symptom Check (English Only for Now)

Commits `abe3fbe` and `a4feeca`, merged in PR #29. Migration `20261024000300_symptom_check_types.sql` applied 24 Oct.

**Why.** Rith asked for more checks than low mood and anxiety. Wellbeing (WHO-5) and loneliness (UCLA-3) are free, short and common. For trauma, the HTQ needs permission, so we use the PCL-5, which the US National Center for PTSD says is "in the public domain and not copyrighted". These need three new check types in the database. Like stress and burnout, there is no Khmer version tested in Cambodia, so they show only in English until a professional gives us the Khmer. Sleep is still not built, because every standard sleep questionnaire needs permission for app use.

**What changed for users:**
- **Wellbeing check:** 5 positive questions about the last 2 weeks (WHO-5). The score is 0 to 100 and higher is better, which the result says. A Clear signs or Strong signs result offers "Take the Low mood check", as WHO-5 guidance suggests.
- **Loneliness check:** 3 questions about feeling alone (UCLA-3).
- **Trauma check:** 20 questions about how a very stressful experience still affects you (PCL-5). A short note before the first question says to keep that experience in mind, that there is no need to describe it, and that you can stop at any time. Every trauma result shows Get help now, not only strong ones.
- **English only:** in Khmer these three are hidden, like stress and burnout.

**What changed for the team:**
- **Migration** adds `wellbeing`, `loneliness` and `trauma` to `symptom_check_type`. Nothing else in the database changes.
- `lib/symptom-checks.ts`: three new questionnaires; new `intro` and `alwaysShowHelp` fields; `higherIsBetter` used for WHO-5.
- `app/pro/_data/clients.ts`: client file labels "Wellbeing (higher score is better)", "Loneliness" and "Trauma (PCL-5)".
- `BACKEND-HANDOFF.md` section 35: scoring table with all seven checks, and where sleep stands.
- **Professional review:** the PCL-5 split at 15 (Clear signs) is AROM's own; 31 or more (Strong signs) follows the National Center for PTSD.

**What to re-test:**
1. In English, open `/detection/symptoms`. Seven checks show.
2. Take Wellbeing with "More than half of the time" on all. Score 60 of 100, Few signs, "Higher is better".
3. Take Wellbeing with "Some of the time" on all. Score 20, Strong signs, with "Take the Low mood check". Tapping it starts the Low mood check.
4. Take Loneliness with "Some of the time" on all. Score 6 of 9, Clear signs, with a recheck date in 14 days.
5. Open Trauma. The note about keeping one experience in mind shows above question 1 only.
6. Take Trauma with "Not at all" on all. Score 0, Few signs, and Get help now still shows.
7. Take Trauma with "A little bit" on all. Score 20 of 80, Clear signs.
8. Switch to Khmer. Only Low mood and Anxiety show.
9. As a professional with a client who shares symptom checks, the new checks show with their labels.

## 24 Oct 2026: Clinic Desk at the Top of the Sidebar

Commit `c437ef3`. No migration. Frontend only.

**Why.** Answering booking requests is the clinic desk person's main job, but the desk page was only reachable from a card on the Profile page, so a new desk account could not find it.

**What changed for users:**
- **Desk accounts see a "Clinic desk" section first in the sidebar** (and in the phone menu) with "Booking requests" and the clinic's name. It opens `/clinic-desk`. Everyone else sees no change.

**What changed for the team:**
- `app/_components/clinic-desk/clinic-desk-nav.tsx` (the section) and `use-clinic-desks.ts` (asks `GET /api/clinic-desk` once per session and remembers it). The Profile card uses the same hook. New navigation label `ClinicDesk`.

**What to re-test:**
1. Log in as the desk account (Brach Nha). The sidebar starts with "Clinic desk, Booking requests, UP Wellness Clinic"; it opens the desk and stays highlighted there.
2. On a phone, open the menu: the same section is at the top.
3. Log in as a normal user: no Clinic desk section.

## 24 Oct 2026: UP Clinic Desk and Therapists See the UP Clinic Without a UP Email

Commit `ecb84c4`. No migration (uses `can_see_clinic()` from `20261024000200`).

**Why.** The UP clinic only showed in Find Clinic & Hospital for accounts with a UP email. A desk account or a therapist linked to the clinic often has a Gmail account, so they could not open their own clinic page. The database already allowed them; the page did not ask it.

**What changed for users:**
- **Desk accounts and UP therapists see the UP Wellness Clinic** in Find Clinic & Hospital, with its Therapists tab, even without a UP email.
- **"Book a session" shows for user accounts only.** Therapists can look at the clinic page but do not see a booking button they could not use.

**What changed for the team:**
- New `GET /api/clinics/access` returns the UP only clinic slugs the caller may see (`can_see_clinic()`), used by `use-clinic-access.ts` in the clinic list and detail.
- `visibleClinics(upStudent, allowed)` in `clinic-data.ts` takes those slugs.

**What to re-test:**
1. Log in as the desk account (Gmail, Clinic desk on). Find Clinic & Hospital shows UP Wellness Clinic.
2. Log in as a therapist linked to UP Wellness Clinic (Gmail). The clinic shows, with the Therapists tab, and no "Book a session".
3. Log in as a normal Gmail user who is not UP. The UP clinic is still hidden.

## 24 Oct 2026: Stress and Burnout Checks Added to Symptom Check (English Only for Now)

Commit `4cdcf4a`. No migration: `stress` and `burnout` were already in the database.

**Why.** Rith wants more than two checks. Stress and burnout are common for students and workers. Their questionnaires are free to use, but there is no Khmer version tested in Cambodia yet, so Rith decided they show only in English until a professional gives us the Khmer.

**What changed for users:**
- **Stress check:** 10 questions about the last month (PSS-10, Cohen 1983).
- **Burnout check:** 6 questions about feeling worn out (Copenhagen Burnout Inventory, personal burnout, Kristensen 2005).
- **English only:** in Khmer, Symptom check still shows Low mood and Anxiety, with a note that more checks are in English while their Khmer is reviewed.
- **Results, rechecks and history** work the same way as the first two checks. Stress and burnout use three levels: Few signs, Clear signs and Strong signs.
- **Wording:** a few lines no longer say "the last 2 weeks", because the stress check asks about the last month.

**What changed for the team:**
- `lib/symptom-checks.ts`: each questionnaire now has its own prompt, answer options with points, reversed items, `total()` and `level()`, plus `khmerReady`. The answer sent is the option index. `textFor()` falls back to English when there is no Khmer.
- `lib/controllers/symptom-controller.ts`: uses `SYMPTOM_CHECK_TYPES` instead of a fixed list.
- `app/detection/symptoms/page.tsx`: icons per check, options and prompt from the questionnaire, Khmer filter.
- `BACKEND-HANDOFF.md` section 35: new scoring table and gaps. Wellbeing and loneliness come next in a pull request (they need a migration).

**What to re-test:**
1. In English, open `/detection/symptoms`. Four checks show: Low mood, Anxiety, Stress, Burnout.
2. Take Stress, answering "Never" to everything. Score 16 of 40, Clear signs (4 questions are positive, so "Never" counts high on those).
3. Take Stress with "Very often" on questions 4, 5, 7 and 8 and "Never" on the rest. Score 0, Few signs.
4. Take Burnout with "Sometimes" on all. Score 50 of 100, Clear signs, with a recheck date in 14 days.
5. Switch to Khmer. Only Low mood and Anxiety show, with the note about more checks in English.
6. Low mood and Anxiety still score as before (all "Several days" on Low mood with question 9 "Not at all" gives 8 of 27, Some signs).

## 24 Oct 2026: Symptom Check Explanation Made General for Future Checks

Commit `b710e6f`. No migration. Frontend only.

**Why.** The "How it works" sheet named PHQ-9, GAD-7, low mood and anxiety, and showed their score ranges. AROM will add more checks later (for example stress, sleep and burnout), each with its own questionnaire and score ranges, so the explanation now fits every check.

**What changed for users:**
- **General wording:** the sheet now talks about "early signs about your mental health" and "a mental health condition", not specific conditions or questionnaire names.
- **No point ranges on the sign levels:** each level keeps its meaning and next step. The sheet says each check has its own score ranges.
- **Result note:** now says "Only a professional can diagnose." instead of naming depression or anxiety.

**What changed for the team:**
- `app/detection/symptoms/page.tsx`: `LEVEL_GUIDE` no longer has `points`; `toKhmerDigits` removed. New checks need no change to this sheet.

**What to re-test:**
1. Open `/detection/symptoms` and tap "How it works". No questionnaire names or condition names appear, and the four sign levels show without points.
2. Finish a check. The note under the result says "Only a professional can diagnose."
3. Switch to Khmer and open the sheet again. All text is Khmer.

## 24 Oct 2026: Symptom Check Explains How It Works and What the Signs Mean

Commit `4df9648`. No migration. Frontend only.

**Why.** Users saw labels like "Few signs" and "Clear signs" with no explanation, and could think the app was telling them they have anxiety or depression. The check is early symptom detection only. A diagnosis can only come from a professional, such as a therapist, psychologist or doctor.

**What changed for users:**
- **"How it works" button** at the top of the Symptom check page, **"What do the signs mean?"** next to Past checks, and **"What does this mean?"** on every result. All three open the same sheet.
- **The sheet explains:** that this is early symptom detection, not a diagnosis, and only a professional can diagnose; how points are counted (0 to 3 per answer); what each level means with its points (Few signs 0 to 4, Some signs 5 to 9, Clear signs 10 to 14, Strong signs 15 or more) and what to do next; the safety question; and who can see results.
- **Clearer wording:** the top of the page and the note under each result now say "This is early symptom detection, not a diagnosis. Only a professional can diagnose depression or anxiety."

**What changed for the team:**
- `app/detection/symptoms/page.tsx`: new `ExplainButton`, `HowItWorksSheet` and `LEVEL_GUIDE`. No data or API change.
- The Khmer in the sheet is new UI text and needs the same Khmer review as the result messages.

**What to re-test:**
1. Open `/detection/symptoms`. Tap "How it works". The sheet opens with the four levels and their points.
2. Close it with the X, "Got it", tapping outside, or the Escape key. The page does not scroll behind the sheet while it is open.
3. With past checks, tap "What do the signs mean?" next to Past checks. The same sheet opens.
4. Finish a check and tap "What does this mean?" on the result. The same sheet opens.
5. Switch to Khmer and open the sheet. All text is Khmer, and point values show Khmer digits.
6. On a phone width, the sheet comes up from the bottom and scrolls inside.

## 24 Oct 2026: Book the UP Wellness Clinic, Clinic Desk for UP, Clinic Therapists

Commits `2be32a7` to `5bf0a10`, merged in PR #28 (`3d815fa`). Migration `20261024000200_clinic_booking.sql` applied 24 Oct.

**Why.** UP asked for its free counseling to be booked through the UP clinic, not by picking a therapist on the Professional page. Students say when they can come and whether they prefer a female or male therapist; the clinic, which has one room, decides who sees them and when. Some students still book on UP's Google Form, so the clinic needs a way to block those times in AROM too.

**What changed for users:**
- **Book a session at the UP clinic:** UP students and staff open UP Wellness Clinic in Find Clinic & Hospital, tap "Book a session", choose online or in person, a therapist preference, a Thursday or Friday up to 3 weeks ahead, and every time that works. Full times are greyed out.
- **Therapists tab:** the clinic shows its therapists (photo, about, languages) with an All, Female, Male filter, to explore only. The clinic chooses the therapist.
- **Clinic requests in My appointments:** "Waiting for the clinic" until it is answered, with Cancel request; "These times did not work" with the clinic's message and "Choose other times". A confirmed request becomes a normal appointment with the therapist, the clinic name and address, chat, Join and sharing.
- **Clinic desk (`/clinic-desk`):** the UP desk account sees new requests (students stay anonymous), picks a time and a therapist and confirms, or says the times do not work. Its time table marks times full for Google Form bookings, opens them again, and moves or cancels sessions.
- **Clinic therapists in `/pro`:** a Gender field in My profile; Home says "You work at UP Wellness Clinic" and only asks for a photo and bio; clinic bookings say they came through the clinic; Reschedule and Suggest a session are hidden for them.
- **UP therapists are no longer on the Professional page.** They are only in the clinic.

**What changed for the team:**
- **Admin:** a professional's dialog has "Clinic: No clinic / UP Wellness Clinic" (replaces the UP only switch, which can still be turned off where it is on). Users have a "Clinic desk" switch per clinic and a "Clinic desk" label. Both changes go to the audit log.
- **Database (PR):** booking settings on the existing `clinics` table, admin only `professional_clinics`, new `clinic_staff`, `clinic_closed_times` and `clinic_booking_requests` with RLS, and student, desk and admin functions. Clinic therapists are never listed or directly bookable, in person clinic bookings use the clinic address, and clinic therapists cannot send suggestions.
- **Handoff:** `BACKEND-HANDOFF.md` section 34, including known gaps.

**What to re-test:**
1. Run the migration in the Supabase SQL Editor.
2. Admin: promote each UP therapist (for counselors without a license, write "UP staff counselor" and "University of Puthisastra"), then in `/admin/professionals` set Clinic to UP Wellness Clinic. They disappear from `/professional`.
3. As a UP therapist in `/pro`: add a photo, an English bio of 80 characters and your gender. Home says you work at UP Wellness Clinic.
4. Admin: in `/admin/users`, turn on "Clinic desk" for the UP desk account. Its Profile shows a "Clinic desk" card.
5. As a UP student: open UP Wellness Clinic, see the Therapists tab and filter, tap "Book a session", pick a Thursday and two times, send. My appointments shows "Waiting for the clinic".
6. As a normal (non UP) user: the UP clinic is not in the list and `/api/clinics/up-wellness-clinic/booking` returns no therapists or times.
7. As the desk: `/clinic-desk` shows the request as "Anonymous". In Time table, mark one of the student's times full; in New requests that time shows Full. Confirm the other time with a therapist.
8. The student sees the confirmed session with the therapist and the clinic; the therapist sees it in `/pro/bookings` with "Booked through the clinic" and no Reschedule; both can chat.
9. The desk moves it to another open time and then cancels it with a reason; the student and therapist see "The clinic moved" and "The clinic cancelled".
10. Send another request and answer "These times do not work" with a message; the student sees it with "Choose other times".

## 24 Oct 2026: Symptom Check Opens, PHQ-9 Low Mood and GAD-7 Anxiety in English and Khmer

Commit `717f5dd`. No migration: it uses the `symptom_checks` table, `support_journeys` and the 14 day trigger that were already in the database.

**Why.** Symptom Detection in Track your mind said "Coming Soon". People now get a private early warning: a short, well known check that helps them notice signs of low mood or anxiety early and points them to the right support. It is not a diagnosis. We use PHQ-9 and GAD-7 because they are free and were tested in Khmer in Cambodia (Steinman et al. 2025, PLOS Mental Health), so the Khmer questions are the study's own wording.

**What changed for users:**
- **Symptom Detection is ready:** the card in Track your mind opens `/detection/symptoms` instead of a Coming Soon message.
- **Two checks:** Low mood (9 questions) and Anxiety (7 questions plus one safety question), one question per screen with a progress bar, in English or Khmer.
- **Safety first:** if someone says they have had thoughts of hurting themselves or being better off dead, Get help now (crisis helplines) shows straight away, before the result.
- **A calm result:** Few signs, Some signs, Clear signs or Strong signs, a kind message, the score, and next steps (practice, MindGuide, journal, or book a professional).
- **14 day rechecks:** after a Some signs or Clear signs result, the page shows the date to check again, and "Time to check again" when it is due. If signs stay the same or get worse after 2 weeks, or are strong at any point, it suggests a professional.
- **Past checks:** the 10 newest results with their date and level, plus a gentle note when the last check looks harder than the one before.
- **Private:** only the person sees results. Professionals see them only if the person shares them for a booking, and never see the answers.

**What changed for the team:**
- **New shared file** `lib/symptom-checks.ts`: questions (English and validated Khmer), answer options, bands, scoring and types. The server scores every check again.
- **New API** `GET|POST /api/symptom-checks` (`lib/controllers/symptom-controller.ts`), owner only through RLS. Answers are stored but never returned.
- **New page** `app/detection/symptoms/page.tsx`; `detection-modal.tsx` links to it.
- **BACKEND-HANDOFF.md section 35** has the decisions, scoring table, data shape and known gaps (stress, sleep, burnout and trauma checks not built; no Home reminder yet).
- **Needs a professional's review** of the Khmer and the result messages before a public launch. Review document: "AROM Symptom Check: Questionnaire Plan for Review".

**What to re-test:**
1. Log in, open Track your mind, tap Symptom Detection. It opens the Symptom check page.
2. Take Low mood, answering "Not at all" to everything. The result says Few signs, score 0 of 27, and no recheck date.
3. Take Low mood with "Several days" on questions 1 to 8 and "Not at all" on 9. The result says Some signs, score 8, with a recheck date 14 days from today.
4. Take Anxiety and answer the last (safety) question with anything but "Not at all". Get help now shows first, then "See my result" opens the result.
5. Take Anxiety with "Nearly every day" on all 7 questions. The result says Strong signs, 21 of 21, with Book a professional at the top.
6. Back on the Symptom check page, Past checks lists every check, newest first.
7. Switch to Khmer and walk through one check. Questions, answers and buttons are in Khmer.
8. As a professional with a client who shares symptom checks, open that client's file. The new checks show with type, level and date only.
9. Log out and open `/detection/symptoms`. It asks you to log in.

## 24 Oct 2026: Free UP Professionals and UP Clinic for University of Puthisastra Students and Staff

Commit `81c7722` and `eed07b6`, merged in PR #27 (`c7e8f7c`). Migration `20261024000100_up_students.sql` applied 24 Oct. Supabase setting needed: turn on Manual linking.

**Why.** University of Puthisastra (UP) offers free counseling to its students and staff. Only they should see those free professionals and the UP clinic, so normal users keep seeing AROM exactly as before. AROM now checks for a confirmed UP address: any email ending in `@puthisastra.edu.kh`, so both students (`name.student@puthisastra.edu.kh`) and staff (`name@puthisastra.edu.kh`). UP mail runs on Google, so Google itself proves the person owns the address.

**What changed for users:**
- **UP students and staff log in as usual:** anyone who logs in with their UP Google account is recognised right away.
- **Gmail users can verify later:** Profile has a new "UP Student or Staff" card. It opens `/profile/up-student`, where "Verify with my UP Google account" links their UP Google account to their AROM account. Their login stays the same.
- **Free UP professionals for UP only:** professionals an admin marks "UP students and staff only" appear in the directory with a "For UP students and staff" badge, for UP accounts only. Everyone else does not see them and cannot book them.
- **UP clinic for UP only:** a UP clinic shows in Find Clinic & Hospital for UP accounts only, with the same badge. It is sample data for now.

**What changed for the team:**
- **Admin switch:** each verified professional's dialog on `/admin/professionals` has a "UP students and staff only" switch, and the list shows a "UP only" label. Changes appear in the audit log.
- **Database (PR):** new `professional_profiles.up_students_only`, `is_up_student()` (caller only, counts students and staff), `admin_set_up_students_only()`, and `is_listed_professional()` now applies the UP rule. That one check already covers the directory, profile page, open times, booking, change of time and reviews.
- **Signed in user:** `upStudent` and `upEmail` added to the user returned by the auth endpoints. Rule in `lib/up-student.ts`. "UP student" in code names means student or staff.
- **Handoff:** `BACKEND-HANDOFF.md` section 33, including known gaps.

**What to re-test:**
1. Supabase: Authentication, Sign In / Providers, turn on **Manual linking**. Run the migration in the SQL Editor.
2. Log in with a Gmail account. Profile shows "UP Student or Staff: Verify your UP email for free support".
3. Open it, tap "Verify with my UP Google account" and pick a `.student@puthisastra.edu.kh` account. You come back to "Verified UP account" with that address.
4. Repeat with a staff account (`name@puthisastra.edu.kh`). It is verified too.
5. Try with a personal Google account. The page says it is not a UP address.
6. As admin, open a live professional on `/admin/professionals` and turn on "UP students and staff only". The row shows "UP only" and the audit log has the change.
7. As the UP account, `/professional` shows that professional with "For UP students and staff", and you can book.
8. As a normal user (not UP), that professional is missing from `/professional`, and opening their link shows not found.
9. `/clinic-hospital`: the UP clinic shows for the UP account only. Opening `?clinic=up-wellness-clinic` as a normal user shows the list instead.

## 21 Oct 2026: Added "I'm Overthinking Right Now" Tip with Visual Cards Deck

Commit `6b3d585`. No migration. Frontend only.

**Why.** Repetitive thinking loops and acute cognitive rumination can leave seekers feeling mentally exhausted and paralyzed. Grounded in evidence-based guidance from the World Health Organization (WHO) and NHS Every Mind Matters CBT self-help techniques, this new 2-minute practical tip gives seekers immediate, accessible tools to pause repetitive cycles, differentiate objective facts from anxious predictions, and ground themselves in the present moment without feeling overwhelmed.

**What changed for users:**
- **New live tip on home and directory:** "I'm Overthinking Right Now" (`im-overthinking-right-now`, 3 practical steps, 2 min read) is now available in the Anxiety category.
- **Three-step clinical grounding:**
  1. *Pause and release physical tension:* Drops physical tension and cues safety with an integrated 4-7-8 breathing button.
  2. *Separate facts from fears:* Uses CBT cognitive appraisal questions to distinguish known realities from imagined catastrophes.
  3. *Return to the present moment:* Anchors attention through 3-item sensory grounding, hydration, and AROM Journal notes.
- **Interactive micro-action capsules:** Includes supportive clinical guidance hints, gentle Lightbulb emblems, and direct tactile action prompts.
- **Visual Card Deck and Grid View:** Includes custom visual cards with dedicated clinical emblems (`Clock` Conscious Pause, `Compass` Fact vs Fear, `Activity` Present Grounding) and seamless toggle between Story Deck and Grid View.
- **Instant bilingual translation:** Seamless one-tap toggling between English (`EN`) and Khmer (`ខ្មែរ`) across overview, deck, and summary screens.

**What changed for the team:**
- Added `TIP_OVERTHINKING_NOW` to `app/_components/tips/tips-data.ts` and registered it in `ALL_TIPS` with clinical APA, WHO, and NHS source citations.
- Added visual styling configurations and clinical hints in `app/_components/tips/tip-card-deck-view.tsx`.
- Verified TypeScript and ESLint with 0 errors.

**What to re-test:**
1. Open `/tips` and confirm "I'm Overthinking Right Now" appears under the Anxiety filter and All Tips list.
2. Tap into the tip and verify the overview displays the 3 steps, duration (2 min), and WHO/NHS citations.
3. Tap "Start Reading Tips" to confirm the 3-card visual deck renders with Amber, Indigo, and Emerald accents.
4. On Card 1, test the embedded 4-7-8 breathing trigger.
5. On Card 2, review the Fact vs Fear reflection prompt.
6. On Card 3, test adding the grounding action to your Home Screen Plan.
7. Advance to the summary screen and confirm all 3 takeaways display correctly before completing.


## 21 Oct 2026: Visual Cards Deck Conversion for All Tips

Commit `PENDING`. No migration. Frontend only.

**Why.** When reading mental health tips, long vertical walls of text can create cognitive fatigue for users who are already feeling overwhelmed or anxious. Following positive testing of the interactive visual card prototype, all available tips in AROM are now fully converted into bite-sized, interactive visual card decks. Each tip features clinical icons, segmented progress bars, and dedicated micro-action cards so seekers can absorb and practice coping strategies step by step without feeling overloaded.

**What to re-test:**
1. Open `/tips` and verify all available tips appear with active chevron arrows.
2. Tap into tips and verify bilingual language toggling (`EN` / `ខ្មែរ`).
3. Tap "Start Reading Tips" on each tip and verify the visual cards deck opens with customized clinical emblems, color palettes, and micro-action capsules.
4. In the card deck, test advancing with "Next Tip" or the Right Arrow key, tapping "Add to Plan", and toggling between Story Deck and Grid View.
5. Verify the celebration summary screen renders correctly at the end of each deck with the proper count of takeaways and tried steps.

## 19 Oct 2026: Password Strength Bar on Sign Up

Commit `PENDING`. No migration.

**Why.** Under the sign up password, five rules with crosses were always on screen. It looked busy and a little alarming before anyone had typed.

**What changed for users:**
- **One calm bar:** while typing, a five step bar fills in with Weak, Fair, Good or Strong next to it. Nothing shows before the first letter.
- **One line when something is missing:** if Create Account is pressed with a password that is not strong enough, a single line says the next thing to add, for example "An uppercase letter (A to Z)".
- **Same rules as before:** at least 8 characters, a lowercase and an uppercase letter, a number and a special character. Strong means all five, which is exactly what sign up accepts. Screen readers hear the strength.

**What changed for the team:**
- New `app/_components/auth/password-strength.tsx` (`PasswordStrengthMeter`, `getPasswordStrength`), adapted from the suggested component: it uses the existing AROM password field, AROM colours and `PASSWORD_RULES` from `lib/auth.ts`, and respects reduced motion. The old `PasswordChecklist` is removed.
- The Lightswind `password-strength-indicator` was not used: it is a paid Pro component.

**What to re-test:**
1. Open `/signup` and type in the password field. Check the bar appears and moves from Weak to Strong as you add a capital, a number and a symbol.
2. Type `abcdefgh` and press Create Account. Check one line says "An uppercase letter (A to Z)".
3. Turn on Reduce motion on your device and check the bar changes without sliding.

## 19 Oct 2026: Log In and Sign Up With Google

Commit `PENDING`. No migration. **Supabase and Google Cloud settings needed** (below).

**Why.** The Google button on the login page only said "coming soon", and the sign up page had no Google option. Many people in Cambodia use a Gmail account on their phone, so signing in with it removes a password and a confirmation email.

**What changed for users:**
- **No Apple button:** the login page showed an Apple button that only said "coming soon". It is removed until Apple sign in exists; Google now spans the full width.
- **Google on both pages:** Log in and Sign up both have a Google button. The first time, it creates the AROM account; after that it logs in. On Sign up it says that continuing with Google means agreeing to the Terms of Service and Privacy Policy. It opens Google, then brings people back signed in, to the page they came from, or to their start page (Home, `/pro` for professionals, `/admin` for admins).
- **New Google accounts** get a profile like any sign up: the name from Google, the role Member, English as the language.
- **If Google does not finish** (cancelled or refused), the login page says "Google sign in did not finish. Please try again." If Google is not available, it asks people to log in with their email.

**What changed for the team:**
- New `app/_components/auth/google-sign-in.tsx` (`useGoogleSignIn`, `GoogleButton`), used by `login-form.tsx` and `signup-form.tsx`. It calls `signInWithOAuth({ provider: 'google' })` with the PKCE flow and returns to `/auth/confirm?provider=google&next=...`.
- `app/signup/page.tsx` wraps the form in `<Suspense>`, like the login page, because the Google button reads `?next=` (`useSearchParams`). Without it `npm run build` failed on `/signup`.
- `confirmEmail` in `auth-controller.ts` handles `provider=google`: exchanges the code, picks the start page by role when there is no `next`, and sends failures to `/login?error=google`.
- Suspended accounts are handled as with email login: they can sign in, but the database and role checks refuse every action.

**Settings (one time):**
1. Google Cloud, Clients, Web application: JavaScript origins `https://arom-version1.vercel.app` and `http://localhost:3000`; redirect URI `https://miaczhhhvbnlqwijpmru.supabase.co/auth/v1/callback`. Consent screen scopes `email`, `profile`, `openid` only.
2. Supabase, Authentication, Sign In / Providers, Google: on, with the Client ID and secret. Skip nonce checks off, Allow users without an email off.
3. Supabase, Authentication, URL Configuration, Redirect URLs: `https://arom-version1.vercel.app/auth/confirm**`, `https://arom-version1-*.vercel.app/auth/confirm**` and `http://localhost:3000/auth/confirm**` (the `**` lets the `?provider=google&next=...` part through).

**What to re-test:**
1. On `/login`, press Google, choose an account, and check you land on Home signed in, with your Google name in the profile menu.
2. Open `/appointments` signed out, log in with Google, and check you come back to `/appointments`.
3. Press Google, then cancel on the Google screen. Check the login page shows the "did not finish" message.
4. Sign in with Google using a Gmail address that already has a confirmed email account. Check it is the same account (same bookings).
5. On `/signup`, press Google with an account that has never used AROM. Check a new account is made and you land on Home.
6. Repeat step 1 on the live site.

## 19 Oct 2026: New Lesson, Stress vs. Anxiety: What's the Difference?

Commit `753581e` and `b8f150e`. No migration. Content and frontend only.

**Why.** Seekers frequently confuse situational stress with internal anxiety, often grouping both under the vague Cambodian label "គិតច្រើន" (overthinking). This confusion leads people to misdiagnose their suffering, either blaming themselves for lacking willpower when facing chronic anxiety or attempting to meditate away realistic external hardship. "Stress vs. Anxiety: What's the Difference?" (`stress-vs-anxiety-difference`) provides an 8-minute evidence-based psychoeducational guide adapted from NIMH, APA, Harvard Health Publishing, WHO, and UNICEF Cambodia. It equips seekers with clear tools to identify external stressors vs internal threat loops, understand why both trigger the same fight-or-flight body alarms, apply targeted environmental problem-solving for stress, use cognitive reframing and present-moment grounding for anxiety, practice a dual-action 1-minute calming breath, and access confidential therapy on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "Stress vs. Anxiety: What's the Difference? (ភាពតានតឹង និងការថប់បារម្ភ៖ តើខុសគ្នាយ៉ាងដូចម្តេច?)" under the Stress category or directly via `/mindguide/learn?open=stress-vs-anxiety-difference`.
- **Dedicated 3D Category Artwork:** Replaced repeated generic orange star icons and broken image placeholders with custom, meaningful 3D claymorphic category illustrations across all 8 wellness topics:
  - **Relationships:** Caring hands cradling a warm glowing heart (`category-relationships.png`).
  - **Emotions:** Layered concentric heart with pastel emotional ripples (`category-emotions.png`).
  - **Burnout:** Energy battery recharging with a fresh botanical sprout (`category-burnout.png`).
  - **Anxiety:** Soothing ocean wave with calm breathing swirl (`category-anxiety.png`).
  - **Stress:** Flourishing botanical green sprout (`category-stress.png`).
  - **Sleep:** Luminous crescent moon resting on a soft twilight cloud (`category-sleep.png`).
  - **Basics:** Open learning book with glowing mind and lotus leaf (`category-basics.png`).
  - **Self-esteem:** Radiant blooming lotus flower on warm golden amber squircle (`category-self-esteem.png`).
- **Zero Broken Images:** Fixed missing image reference for "Why Have I Lost Interest in Things I Used to Love?" (`/mindguide/category-emotions.png`), eliminating the broken placeholder.
- **Enhanced Thumbnail Presentation:** Card thumbnails now scale with subtle interactive feedback (`group-hover:scale-105`) with balanced framing inside the rounded container.
- **11 Comprehensive Bilingual Sections:** Covers daily confusion between stress and anxiety, the biological fight-or-flight highway (adrenaline, cortisol, and body alarms), Cambodian cultural context (unraveling "គិតច្រើន" and reducing stigma), an interactive diagnostic scenario quiz, the 3-question Origin Test (cause, duration, focus), targeted environmental tools for stress (action, boundaries, recovery sprints), targeted psychological tools for anxiety (cognitive reframing, 3-2-1 grounding, accepting uncertainty), a personal state check-in reflection, clinical boundaries (when stress becomes burnout and anxiety becomes a disorder), the 1-minute dual-action reset breath, and navigating both paths on AROM.
- **Tip Alert Box:** Section 11 highlights a key clinical insight: "Treat stress with problem-solving action and restorative rest. Treat anxiety with cognitive reframing, present-moment grounding, and self-compassion."
- **Direct AROM tool integration:** Section 10 triggers the "1-Minute Calming Breath" (`actionType: "exercise"`), and Section 11 provides direct action buttons for "Open AROM Journal" (`actionType: "tips"`) and "Talk to a Professional" (`actionType: "professional"`).

**What changed for the team:**
- **Category Icon System:** Added 8 transparent 512x512 high-resolution PNG assets in `public/mindguide/` (`category-*.png`) with automated fallback via `CATEGORY_THUMBNAILS` and `getCategoryThumbnail(category)` in `learn-data.ts`.
- **All 19 Lessons Synchronized:** Updated `image:` references in `learn-data.ts` to their respective category artwork.
- **Fallback Compatibility:** Preserved `public/mindguide/emotions.png` copy as an alias to avoid 404s for any lingering bookmarks.
- **`learn-data.ts`:** Exported `REFERENCES_STRESS_VS_ANXIETY` with 5 peer-reviewed citations (NIMH, APA, Harvard Health, WHO, UNICEF Cambodia) and `LESSON_STRESS_VS_ANXIETY`, prepending it to `ALL_LESSONS` under category `"Stress"`.
- **Hero Image:** Added `public/mindguide/stress-vs-anxiety-hero.jpg` depicting a cozy, grounding scene of a person holding a warm mug of tea over an open study journal with tabs and a soft blanket.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy. Zero sparkle icons.

**What to re-test:**
1. Open `/mindguide/learn` and verify "All Lessons" displays distinctive 3D category artwork for Relationships, Emotions, Burnout, Stress, Anxiety, Sleep, Basics, and Self-esteem.
2. Verify "Why Have I Lost Interest in Things I Used to Love?" displays the glowing concentric heart icon instead of a broken image.
3. Verify "Stress vs. Anxiety: What's the Difference?" card appears under the "Stress" filter with the "Essential" badge.
4. Open `/mindguide/learn?open=stress-vs-anxiety-difference` and verify hero image, outcomes, and 11 sections render smoothly.
5. Test Section 4 quiz: verify correct feedback when selecting option B and bilingual explanations.
6. Test Section 8 personal state check-in interactive choice and feedback.
7. Test Section 10 coping exercise button: launches 1-Minute Calming Breath session.
8. Test Section 11 tip alert box and action buttons: "Open AROM Journal" and "Talk to a Professional".
9. Switch language to Khmer and verify all Kantumruy Pro translations.

## 19 Oct 2026: New Lesson, How to Deal With Academic Pressure

Commit `8fe077e`. No migration. Content and frontend only.

**Why.** Academic testing, high-stakes milestone examinations like the Grade 12 Bac II in Cambodia, family sacrifices, and competitive social ranking induce chronic cognitive fatigue, panic-induced memory freeze, digestive distress, and severe guilt among youth. "How to Deal With Academic Pressure" (`how-to-deal-with-academic-pressure`) strengthens the Stress category in MindGuide Learn with an 8-minute evidence-based psychoeducational guide adapted from APA, Harvard Graduate School of Education, WHO, UNICEF Cambodia, and NHS inform. It equips students and youth with practical tools to differentiate healthy motivation from toxic pressure, uncouple human self-worth from report cards, manage parental expectations and family comparisons using respectful communication scripts, implement brain-friendly study methods (Pomodoro sprints, active recall, non-negotiable sleep), regulate nervous system panic through 1-minute somatic breathwork, and access confidential therapy on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "How to Deal With Academic Pressure (របៀបដោះស្រាយសម្ពាធការសិក្សា)" under the Stress category or directly via `/mindguide/learn?open=how-to-deal-with-academic-pressure`.
- **11 Comprehensive Bilingual Sections:** Covers the weight of expectations (when studying becomes suffocating), the mind and body toll (cortisol shutting down the prefrontal cortex), Cambodian cultural context (parental sacrifices, extra tutoring classes, Bac II exam stress, and relatives' comparisons), an interactive quiz on brain-friendly studying vs exhaustion habits, uncoupling self-worth from GPA, sustainable study strategies (Pomodoro sprints and active retrieval), respectful family boundary scripts, personal academic pressure check-in reflection, recognizing when academic dread becomes a crisis, the anti-panic 1-minute grounding breath, and building an academic support village on AROM.
- **Tip Alert Box:** Section 11 features a clinical truth reminder: "A student's physical and mental health is infinitely more valuable than any grade, ranking, or academic trophy. Never sacrifice your sanity for a scorecard."
- **Direct AROM tool integration:** Section 10 triggers the "1-Minute Calming Breath" (`actionType: "exercise"`), and Section 11 provides direct action buttons for "Open AROM Journal" (`actionType: "tips"`) and "Talk to a Professional" (`actionType: "professional"`).

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_ACADEMIC_PRESSURE` with 5 peer-reviewed citations (APA, Harvard GSE, WHO, UNICEF Cambodia, NHS inform) and `LESSON_ACADEMIC_PRESSURE`, prepending it to `ALL_LESSONS` under category `"Stress"`.
- **Hero Image:** Added `public/mindguide/academic-pressure-hero.jpg` depicting a young Cambodian student taking a peaceful, mindful breath at a wooden study desk with textbooks, tea, and warm sunlight streaming through a lattice window.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "How to Deal With Academic Pressure" card appears under the "Stress" filter with the "Essential" badge.
2. Open `/mindguide/learn?open=how-to-deal-with-academic-pressure` and verify hero image, outcomes, and 11 sections render smoothly.
3. Test Section 4 quiz: verify correct feedback when selecting option B and bilingual explanations.
4. Test Section 8 academic pressure self-check interactive choice and feedback.
5. Test Section 10 coping exercise button: launches 1-Minute Calming Breath session.
6. Test Section 11 tip alert box and action buttons: "Open AROM Journal" and "Talk to a Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 19 Oct 2026: Professional Mobile Top Bar Holds Language and Account

Commit `297d740`. No migration.

**Why.** After the hamburger menu was added, the language switch and the account button (KP) still sat on their own row below the top bar, taking space and looking disconnected. On a phone they belong on the same row as the logo.

**What changed for users:**

- **One top row on phones:** hamburger, logo, then the language switch and account button on the right.
- **Smaller buttons:** the language switch and account button are more compact on phones so they fit next to the logo. The account button shows the initials and a small arrow.
- **Desktop unchanged:** large screens keep the row at the top right of the page.

**What changed for the team:**

- **`compact` prop** added to `LanguageSwitcher` (`language-provider.tsx`) and `AccountMenu` (`account-menu.tsx`). The default look is unchanged everywhere else.
- **`pro-shell.tsx`:** the controls render inside the mobile header and the old row is desktop only.

**What to re-test:**

1. Open `/pro` at phone width (360 and 390). The hamburger, logo, EN/ខ្មែរ and account button all fit on one row.
2. Switch language, and open the account menu and check the dropdown stays on screen.
3. Check desktop width still shows the language switch and account button at the top right.

## 19 Oct 2026: Professional Area Mobile Hamburger Menu

Commit `841fd2b`. No migration.

**Why.** On a phone the professional area showed its menu as a row of tabs that you had to swipe sideways, and most pages (My schedule, Bookings, Clients, and so on) were cut off and hard to find. A hamburger button that opens the sidebar is the familiar pattern and shows every page at once.

**What changed for users:**

- **Hamburger button on phones:** a top bar with a menu button and the AROM logo replaces the sideways tab row.
- **Sidebar slides in:** tapping the button opens the full menu from the left over a dimmed background. Tapping a page, the dimmed area, the close button, or pressing Escape closes it.
- **Desktop unchanged:** large screens still show the fixed sidebar.

**What changed for the team:**

- **`app/pro/_components/pro-shell.tsx`:** one shared menu is used by the desktop sidebar and the mobile drawer. The drawer locks page scroll while open.

**What to re-test:**

1. Open `/pro` at phone width. You should see the hamburger and logo, no sideways tabs.
2. Tap the hamburger, confirm all 9 links show, then tap one and confirm it opens and the menu closes.
3. Reopen the menu and close it with the X, the dimmed area, and Escape.
4. Switch to Khmer and check the labels. Check desktop width still shows the fixed sidebar.

## 19 Oct 2026: Admin Sidebar Links No Longer Overlap

Commit `bcadb25`. No migration.

**Why.** The admin sidebar now has 11 menu items. The "Professional area" and "View website" links were pinned to the bottom of the screen, so on shorter screens they sat on top of the last menu items (Audit log, Users) and could not be read or clicked.

**What changed for users:**

- **No more overlap:** the two bottom links now sit below the menu instead of on top of it.
- **Scrolls on short screens:** if the window is too short for everything, the sidebar scrolls.
- **Care card hides on short screens:** the "Care starts here" card only shows on tall screens, to save room.

**What changed for the team:**

- **`app/admin/_components/admin-shell.tsx`:** the sidebar is a flex column; the bottom links use `mt-auto` instead of absolute positioning.

**What to re-test:**

1. Open `/admin` on a laptop sized window and check that Audit log and Users are fully visible.
2. Shrink the window height and confirm the sidebar scrolls and the bottom links never cover the menu.

## 19 Oct 2026: Remove Mock Notifications & Wellbeing Settings Card

Commit `4039564`. No migration.

**Why.** The "Notifications & Wellbeing" card in user settings displayed mock toggle switches for morning mood check-ins, evening breathwork reminders, and calming audio or haptics that were not backed by real push notifications or device alarms. Removing these mock toggles prevents user confusion and keeps settings focused purely on real, functioning preferences (language, privacy, and support).

**What changed for users:**

- **Cleaner settings screen:** removed the non-functional "Notifications & Wellbeing" section from user profile settings (`/profile/settings`).
- **No mock toggles:** eliminated switches that did not trigger real push notifications.

**What changed for the team:**

- **Cleaned `app/_components/profile-settings.tsx`:** removed unused mock state (`morningReminder`, `eveningReflection`, `soundEffects`) and unused icon imports (`Bell`, `Moon`, `Volume2`).

**What to re-test:**

1. Open `/profile/settings` or tap Settings from the user avatar menu.
2. Confirm the page renders cleanly with language selection, privacy settings, and crisis support, without the mock notifications card.

## 19 Oct 2026: Find Clinic and Hospital Feature from Figma

Commit `4039564`. No migration.

**Why.** Rith requested the static implementation of the "Find Clinic & Hospital" screen and "Clinic Details" screen based on the official Figma designs (`node-id=487-784` and `node-id=487-799`). This enables seekers to easily discover verified mental health clinics, counseling centers, and psychiatric hospitals across Phnom Penh with real-time interactive search, categorization, map previews, and instant directions or calling.

**What changed for users:**

- **Find Clinic & Hospital directory:** accessible directly from the sidebar navigation or via `/clinic-hospital`.
- **Real-time search and filtering:** search by clinic name, address, or treatment type, with clean filter pills for All, Nearby, Clinic, and Hospital.
- **Interactive map preview:** shows city roads and precise location pins for clinics with hover and click interactions.
- **Faithful Figma clinic cards:** Riverside Mental Wellness Center, Harmony Care Hospital, and Mind & Life Clinic, showing distances, addresses, and specialties.
- **Complete Clinic Details view:** clicking "View details" transitions into the full detail view featuring hero photography, 4.8 star ratings, operating status, tabbed overviews, services, seeker reviews, and direct "Get Direction" and "Call" action buttons.
- **Bilingual support:** complete English and Khmer text rendering with smooth responsive layout for mobile and desktop screens.

**What changed for the team:**

- **Created `app/_components/clinics/`:** contains `clinic-data.ts`, `clinic-list-view.tsx`, `clinic-detail-view.tsx`, and `clinic-home-view.tsx`.
- **Created route `/clinic-hospital`:** clean Next.js App Router page with SEO metadata.
- **Activated navigation item:** `clinic-hospital` in `navigation-config.ts` is now live with `href: "/clinic-hospital"`.
- **Documented handoff:** added section 32 in `BACKEND-HANDOFF.md` for future database integration.

**What to re-test:**

1. Navigate to `/clinic-hospital` or tap "Find Clinic & Hospital" in the sidebar navigation.
2. Verify the search bar filters results instantly (for example typing "harmony" shows Harmony Care Hospital).
3. Test filter chips (Nearby, Counseling, Hospital, More).
4. Hover and tap on the map pins to see clinic tooltips.
5. Tap "View details" on Riverside Mental Wellness Center: verify the hero banner, address, rating, and status.
6. Switch between "Overviews", "Services", and "Reviews" tabs.
7. Tap the back arrow: verify smooth return to the clinic list.
8. Switch language between English and Khmer using the header language toggle.

## 19 Oct 2026: Home Shows Your Plan Right After You Log In

Commit `2f764bf`. No migration.

**Why.** Rith logged in on a phone and Home greeted them by name, but the plan card still said "Log in to make your own plan" until they refreshed. The plan (and mood) data is kept in memory once it loads. If someone opened Home before logging in, the app remembered "signed out", and logging in moved them back to Home without reloading, so the old answer stayed.

**What changed for users:**

- **After logging in, Home shows your own plan, mood and care plan straight away.** No refresh needed.
- Same after signing up and after confirming your email.

**What changed for the team:**

- **`login-form.tsx`, `signup-form.tsx`, `confirm-email-form.tsx`** now finish with a full page load (`window.location.replace`) and no longer use `router.replace` plus `router.refresh`. That clears every in-memory store at once (plan, mood, care plan, activities). Without it, each store would have to watch for login changes on its own.
- Logging out was already a full page load (a form post), so nothing from one account can stay in memory for the next.
- Google sign in already ends in a full page load through `/auth/callback`.

**What to re-test:**

1. Log out. Open Home: the plan card says "Log in to make your own plan".
2. Tap it and log in with email and password. Home opens with your own plan (no login button) and your mood week. Do not refresh.
3. Log in as an admin and as a professional: you land in `/admin` and `/pro` as before.
4. Open a protected page while logged out (for example `/profile`), log in: you land back on that page.
5. Sign up a new account and confirm the email: Home opens signed in, with your plan.

## 19 Oct 2026: Install Popup Replaces the Home Banner

Commit `e3c4623`. No migration.

**Why.** Rith wanted the install invitation to be a popup in the middle of the screen when Home opens, with Home dimmed behind it, so people notice it and focus on it. The banner under the greeting was easy to scroll past.

**What changed for users:**

- **A popup opens over Home** about a second after the page appears. It shows the AROM icon, "Add AROM to your home screen", "Open AROM in one tap, like any other app", and **Install AROM** and **Not now**. Home stays visible, dimmed and softly blurred, behind it. English and Khmer.
- **Install AROM** opens the real install dialog on Android, Chrome and Edge. On iPhone and other phone browsers, the popup shows the steps and a **Got it** button.
- **Not now, the X, the Escape key or a tap outside** close it and hide it on that device for 7 days. If someone closes the browser's own install dialog without installing, it also waits 7 days.
- **It never shows once AROM is installed**, and not on computers whose browser cannot install (Firefox, Safari). The Install card in Settings is still there.
- **The banner under the greeting is gone.**

**What changed for the team:**

- **New** `app/_components/install-app/install-popup.tsx`, replacing `install-banner.tsx`. It uses the browser's own `<dialog>` (`showModal()`), so focus stays in the popup, Escape works and the page behind cannot be clicked. It fades in with CSS, so if the animation does not run it still appears.
- **`install-store.ts`**: "Not now" is now a 7 day snooze (`arom_install_popup_snoozed_until_v1`). The old banner key is no longer read, so people who dismissed the banner will see the popup once.
- No backend changes.

**What to re-test:**

1. On a computer in Chrome or Edge (AROM not installed), open Home. After about a second the popup appears in the middle and Home is dimmed behind it.
2. Tap Install AROM: the browser's install dialog opens. Install, open AROM from the app: no popup.
3. In a normal tab, tap Not now: the popup closes and does not come back after a reload. Repeat with the X, Escape and a tap outside.
4. On an iPhone in Safari, open Home, tap Install AROM: the three steps show with Got it.
5. On Android Chrome, check the popup and the install dialog.
6. In Firefox on a computer: no popup.
7. Switch to Khmer and check the popup and the steps.

## 19 Oct 2026: Install Banner on the Home Page

Commit `faa77eb`. No migration.

**Why.** After the install feature went live, Rith expected a popup asking to install, and none appeared. Chrome and Edge never pop up an install dialog on their own: they only show a small icon in the address bar, which is easy to miss. A banner on Home makes the invitation visible.

**What changed for users:**

- **New banner under the greeting on Home:** "Add AROM to your home screen. Open it in one tap." with **Install** and **Not now** (and a close button). English and Khmer.
- **Install** opens the real install dialog on Android, Chrome and Edge. On iPhone it shows the steps (Share, Add to Home Screen, Add). On other phone browsers it shows the browser menu steps.
- **Not now** hides it on that device for good. The Install card in Settings is still there.
- **It never shows once AROM is installed.** On computers whose browser cannot install (Firefox, Safari), the banner does not show.

**What changed for the team:**

- **New** `app/_components/install-app/install-banner.tsx`, placed in `app/components/arom-main-view.tsx`.
- **New** `install-steps.tsx`: the steps list now shared by the banner and the Settings card.
- **`install-store.ts`**: remembers "Not now" in the browser (`arom_install_banner_dismissed_v1`), and starts listening for the browser's install signal as soon as the script loads, so it is not missed.
- No backend changes.

**What to re-test:**

1. On a computer in Chrome or Edge (AROM not installed), open Home: the banner is under the greeting. Tap Install: the browser's install dialog opens.
2. Open AROM from the installed app: no banner on Home.
3. In a normal browser tab, tap Not now: the banner goes away and stays away after a reload. Settings still has the Install card.
4. On an iPhone in Safari, tap Install on the banner: the three steps show.
5. In Firefox on a computer: no banner on Home.
6. Switch to Khmer and check the banner and steps.

## 19 Oct 2026: Install AROM to the Home Screen

Commit `9668e12`. No migration.

**Why.** Rith wanted people to be able to "download" AROM so it sits on their home screen and opens in one tap, like a normal app. AROM is now an installable web app (PWA), so no App Store or Play Store is needed, and every update we push reaches users straight away.

**What changed for users:**

- **AROM can be installed.** On Android and on Chrome or Edge on a computer, the browser offers "Install AROM". On iPhone and iPad, people use Share, then Add to Home Screen.
- **It opens like an app.** It has its own AROM icon (the leaf and heart mark) and the name "AROM", and it opens full screen with no browser bar, in AROM green.
- **New "Install AROM" card in Settings**, under Saved. On Android and Chrome or Edge it opens the real install dialog. On iPhone it shows the three steps (Share, Add to Home Screen, Add). In other browsers it shows the menu steps. The card hides itself once AROM is installed. English and Khmer.
- **Still needs internet.** Nothing is saved for offline use, on purpose, because AROM holds private wellbeing data.

**What changed for the team:**

- **New** `app/manifest.ts` (name, colours, full screen, icons). Next.js serves it at `/manifest.webmanifest`.
- **New icons:** `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (extra padding for Android's round icons) and `app/apple-icon.png` (iPhone). They are cropped from the image inside `public/brand/arom-mark.svg`, which is small (132 px), so they look a little soft. A large PNG or SVG of the mark from the designer would make them sharp: just replace these four files at the same sizes.
- **New** `app/_components/install-app/`: `install-store.ts` (catches the browser's install event and works out the device), `install-listener.tsx` (mounted in the root layout, because the browser sends that event only once when the page loads) and `install-app-card.tsx`.
- **`app/layout.tsx`** now sets the theme colour and the iPhone home screen title.
- **No service worker** and no backend changes. `BACKEND-HANDOFF.md` is not affected.

**What to re-test:**

1. Deploy, then open the site on an Android phone in Chrome. Open Settings: the Install AROM card is under Saved. Tap Install, accept, and check the AROM icon is on the home screen.
2. Open AROM from that icon: it opens full screen with no address bar. Open Settings: the Install card is gone.
3. On an iPhone in Safari, open Settings, tap the Install card: the three steps show. Follow them, check the icon and the name "AROM", and open it from the home screen.
4. On a computer in Chrome or Edge, check the install icon in the address bar and the Install button in Settings.
5. In Firefox on a computer, tap the card: the menu steps show.
6. Switch to Khmer and check the card and the steps.

## 19 Oct 2026: Clients Review Their Professional

Commit `e8f7a21`. Branch `rith/professional-reviews`, PR #24. Migration `20261019000300_professional_reviews.sql`, applied by Rith in Supabase on 19 Oct 2026.

**Why.** Rith wanted clients to be able to review a professional after a session. Reviews help people choose the right professional, and give professionals honest feedback. Because seeing a therapist is private, nobody can see who wrote a review: not the public, not the professional, not admins.

**What changed for users:**

- **Write a review after a completed session.** On My appointments, the latest completed session with each professional has a "Write a review" box: 1 to 5 stars and an optional comment. Cancelled and missed sessions cannot be reviewed.
- **One review per professional.** Saving again edits it. Edit and Delete are on the same card, with the professional's reply under it.
- **Your name is never shown.** Reviews appear as "AROM client" with the month only. The form says so before you post.
- **Stars on profiles.** The public profile shows the average and count under the name, and a Reviews section with the newest 5 (then "Show all") and any replies. Directory cards show the stars too.
- **Hidden reviews.** If the AROM team hides a review, the writer sees that it was hidden and why.

**What changed for the team:**

- **Professionals: new Reviews page (`/pro/reviews`)** with the average, a count per star, every review (hidden ones marked) and a public Reply, Edit or Remove reply on each.
- **Admins: new Reviews page (`/admin/reviews`, English only)** with Shown and Hidden tabs, search, Hide (reason required) and Show again. Both are written to the audit log.
- **Backend:** table `professional_reviews` with RLS (writer reads own rows only, every write through a function), functions for users, the public, professionals and admins, and endpoints `/api/reviews`, `/api/pro/reviews`, `/api/admin/reviews`. The old `rating` and `review_count` columns on `professional_profiles` are not used; numbers are counted from visible reviews.
- **SQL tested** on PGlite (Postgres in Node) with 41 checks: who can review, RLS, public list and counts, replies, hide and show, audit log, no writer in any response.
- **`BACKEND-HANDOFF.md` section 31** has the rules, table, functions and endpoints.

**What to re-test:**

1. As a professional, mark a past session as completed in My bookings.
2. As that client, open My appointments. The completed session shows "Write a review". Pick 4 stars, write a comment, post it.
3. Open the professional's public profile: 4.0, "1 review", the comment as "AROM client" with the month. The directory card shows the stars.
4. Edit the review to 5 stars. The profile updates and there is still one review.
5. As a client with only a cancelled or missed session, check there is no review box.
6. As the professional, open Reviews in the menu: the review is there without a name. Reply, edit the reply, remove it. The reply shows on the public profile.
7. As an admin, open Reviews, hide it with a reason. It leaves the profile and the stars. The client and the professional see "hidden" with the reason. The audit log shows "Hid a review". Show it again.
8. Delete the review as the client. It leaves the profile.
9. Switch to Khmer and check My appointments, the profile and `/pro/reviews`.

## 19 Oct 2026: One Saved Page in Settings

Commit `8bc3d06`. No migration.

**Why.** Rith wanted a Saved button in Settings so people can find everything they kept in one place: lessons, tips, practice and podcasts. Before, each part had its own hidden Saved screen, and podcasts could not be saved at all.

**What changed for users:**

- **New "Saved" card in Settings** (under the profile summary) opens the Saved page.
- **Saved page (`/profile/saved`)** has four tabs: Lessons, Tips, Practice and Podcasts, each with a count. Newest saved comes first. Tap a row to open it, or tap the filled bookmark to remove it. An empty tab explains how to save and links to that part of the app.
- **Podcasts can be saved.** The heart in the podcast player now keeps the episode, and it shows up under Podcasts in Saved. The heart stays filled when you come back.
- **Lessons you bookmark now appear** in the Saved page (the old Learn Saved screen did not show them).

**What changed for the team:**

- **New** `app/_components/saved/saved-store.ts` (one small store for the four lists), `saved-view.tsx` and `app/profile/saved/page.tsx`.
- **Still in the browser only.** Lessons, tips and practice keep the keys they already used. Podcasts use `arom_saved_podcasts_v1`.
- **`BACKEND-HANDOFF.md` section 30** describes the `saved_items` table, RLS (own rows only, admins never read it) and endpoints the backend should add.
- **Not changed:** the old Saved screens inside Learn, Tips and Practice. The Learn one still reads sample data. See section 30, gap 4.

**What to re-test:**

1. Log in, open Settings: the Saved card is under the profile summary. Tap it.
2. Open a lesson, tap its bookmark, return to Saved: the lesson is under Lessons. Do the same for a tip and a practice.
3. Open a podcast, press play, tap the heart, close the player, open Saved, then Podcasts: the episode is there. Open the player again: the heart is filled.
4. Remove an item with the bookmark: it disappears and the tab count goes down.
5. Open an item from Saved: the correct lesson, tip, practice or episode opens.
6. Switch to Khmer and check the card, the tabs and the empty states.
7. Log out and open `/profile/saved`: you are sent to the login page.

## 19 Oct 2026: Podcast Pages Redesigned From Figma

Commit `b2c37ad`. No migration.

**Why.** Rith shared the Figma for the listener podcast screens. The old pages were a plain list and an inline player. Podcasts are not connected to a backend yet, so this is built on sample episodes to show the real look and flow.

**What changed for users:**

- **Podcast list (`/podcasts`)** has the headphones illustration, a search box, topic chips (All, Mental Health, Anxiety, Sleep, Stress, Relationships) and cards with a topic icon, title, length and topic. The first three are under "Recommended for You", the rest under "More episodes". Searching or picking a chip shows one "Results" list, or a short message when nothing matches.
- **Episode page (`/podcasts/<id>`)** shows the episode picture with a big play button, title, length, and About and Chapters tabs. About has the description and "What you'll learn" with green ticks. A "Play Episode" button opens the player. The guest card and the "For learning only" note stay at the bottom.
- **New full screen player (`/podcasts/<id>/play`)** has close and heart buttons, the episode picture, a progress bar you can tap, speed (1x, 1.25x, 1.5x, 2x), back and forward 15 seconds, and play and pause. Sleep timer (5 to 45 minutes) and Chapter (jump to a part) open a small sheet. Download works once an episode has audio.
- **Five new sample episodes** from the design (Coping with stress at school, Building your self confidence, Understanding anxiety, Better sleep step by step, A mindful moment), in English and Khmer.
- **Preview mode:** episodes without audio run a silent demo clock so the player can be tried, with a note that real audio is coming soon.

**What changed for the team:**

- **New route** `app/podcasts/[id]/play/page.tsx`. `podcast-player.tsx` is now the full screen player; the old inline player is gone.
- **Illustrations** `public/podcasts/header.png` and `episode-art.png`, downloaded from Figma.
- **Admin Podcasts tab** reads the same sample list, so it now shows eight episodes.
- **`BACKEND-HANDOFF.md` section 11** lists the new screens and the new gaps (favourites, recommendations, offline download).
- **Khmer for the five new episodes needs a review** by a native speaker.

**What to re-test:**

1. Open `/podcasts`: header picture, search, chips and the two sections look like the design.
2. Type "sleep" in search, then clear it and tap the Anxiety chip. Results update, and "All" brings everything back.
3. Open an episode, switch between About and Chapters, then tap the big play button.
4. In the player: play, drag the bar, tap 1x to change speed, tap back and forward, open Sleep timer and pick 5 minutes, open Chapter and jump to a part, tap the heart, tap Download.
5. Press the X to return to the episode page.
6. Switch to Khmer and check the three screens.
7. Open `/podcasts/does-not-exist`: a not found page shows.

## 19 Oct 2026: Recommended for You Looks Like Popular Groups

Commit `262c9e6`. No migration.

**Why.** Rith wanted "Recommended for you" right below the topic tiles, exactly like "Popular groups", only with its own title.

**What changed for users:**

- **"Recommended for you" sits below the topic tiles** and uses the same cards as Popular groups: topic picture, name, description, tags, members, Join (or Full) and "See all". Up to three groups.
- **Popular groups follows below it**, without repeating the recommended groups.

**What changed for the team:**

- **`community-home-view.tsx`:** one `GroupListSection` component draws both lists, so they stay identical; the recommended list shows up to three groups.

**What to re-test:**

1. Open Community: Recommended for you comes right after the topic tiles and looks the same as Popular groups.
2. Tap Join on a recommended group: its details and rules open.
3. Tap See all in either section: the full list opens.

## 19 Oct 2026: Community Home Gets Recommended for You and Always On Search

Commit `3dd17ed`. No migration.

**Why.** Rith wanted the Community home closer to the shared design: no plain link rows at the bottom, a search button that is always there, and a "Recommended for you" section ready for the matching feature planned later.

**What changed for users:**

- **"Recommended for you"** (up to two groups, before Popular groups): groups with the same topic as one you are in, otherwise groups with the most free places. Each card has the topic, members, a short description and "View group", which opens the details and rules.
- **Search is always there** next to the title (except for visitors who are not logged in). It opens the group list with the cursor in the search box.
- **Removed** the "Explore All Support Groups" and "Community Guidelines & Options" rows at the bottom. The banner's "Find your group", "See all" and the topic tiles open the full list; the guidelines still show in each group's details and in every group chat.
- **Popular groups** no longer repeat the recommended ones.

**What changed for the team:**

- **`community-home-view.tsx`:** `recommended` (simple rule, marked to be replaced by matching), `onOpenSearch`, quick links removed, `onOpenMenu` removed.
- **`all-groups-view.tsx`:** `focusSearch` puts the cursor in the search box.
- **`page.tsx`:** `searchFocus` state; the old menu view is no longer linked from the home.

**What to re-test:**

1. Open Community: Recommended for you shows up to two groups you are not in; Popular groups shows others.
2. Tap the search button: the list opens with the cursor in the search box; type a group name.
3. The bottom of the page no longer has the two link rows.
4. Join a group, come back: a group with the same topic is recommended first.

## 19 Oct 2026: Community Home Redesigned to Find a Group

Commit `de8494f`. No migration.

**Why.** Rith shared a design for Community as the place to find a group: a welcoming banner, topics to choose from and popular groups to join. Since chats moved to Messages, Community's job is discovery.

**What changed for users:**

- **A welcoming banner:** "Real people. Shared journeys." with a "Find your group" button, over a warm photo of friends seen from behind at sunset (no faces).
- **"Find your community":** eight topic tiles (Anxiety, Stress, Depression, Sleep, Burnout, Study, Self growth, General support), each with how many groups it has. Tapping one opens the group list filtered to that topic; the list has topic chips to switch.
- **"Popular groups":** the groups with the most members, with a short description, tags, members and a Join button. Join opens the group's details and rules first (including that the AROM safety team can read the chat), then you confirm. Full groups say "Full".
- **"Your groups":** groups you are in, with "Open chat" (opens in Messages).
- **Search** button next to the title, and the honest anonymous banner stays.
- **Professionals can pick any of the eight topics** when creating a group.
- In AROM's light green style, matching the rest of the app.

**What changed for the team:**

- **New `app/community/group-topics.tsx`:** the eight topics (English, Khmer, icon, colours), `topicOf()`, `TopicBadge`.
- **`community-home-view.tsx`:** rebuilt; takes all groups and works out "Your groups", tile counts and "Popular groups".
- **`all-groups-view.tsx`:** topic chips and `initialTopic`; topic icons. **`create-group-view.tsx`:** eight topics. **`group-api.ts`:** unknown topics count as General support.
- **Banner photo:** `public/images/community/friends-sunset.jpg`, "Anonymous friends standing together at sunset in mountains" by Helena Lopes on Pexels (Pexels licence: free to use, no attribution required; credited anyway). Cropped to the upper part so a bottle in the corner does not show.
- No database change: the topic is free text in `support_groups.concern`.
- Khmer text should be checked by a Khmer speaker.

**What to re-test:**

1. Open Community: the banner, topic tiles with counts and Popular groups show; on a phone the tiles are two per row.
2. Tap a topic tile: the list opens filtered to it; switch topics with the chips.
3. Tap Join on a popular group: its details and rules open; join from there; it moves to Your groups.
4. Tap Open chat on one of your groups: it opens in Messages.
5. As a professional, Create a group: the topic list has eight options; the new group counts on its tile.
6. Log out: the banner shows with "Log in to join a support group".

## 19 Oct 2026: Open Chats Fill the Phone Screen

Commit `da7500a`. No migration.

**Why.** On phones an open chat sat inside the page, under the top bar and title and above the bottom menu, so the messages had little room. Telegram opens a chat full screen.

**What changed for users:**

- **On phones and tablets, tapping a chat (private or group) opens it full screen.** The top bar, the page title and the bottom menu are hidden while the chat is open; the back arrow returns to the list.
- **Laptops are unchanged:** the list on the left and the chat on the right.
- **The same for professionals** in their Messages.

**What changed for the team:**

- **`user-messages.tsx` and `pro/_components/messages-view.tsx`:** when a chat is selected, the chat box is `fixed inset-0` with `h-[100dvh]` and safe area padding below the `lg` breakpoint, and the normal two column box from `lg` up. The chat column uses `h-full` instead of `h-[75vh]`.
- Popups opened from a chat still show on top (the suggest session sheet is drawn after the chat; reports use the native dialog).

**What to re-test:**

1. On a phone, open Messages and tap a professional chat: it fills the screen, with no top bar or bottom menu; type, send voice and a photo.
2. Tap the back arrow: the list returns with the top bar and bottom menu.
3. Open a group chat: also full screen; Members tab and the composer work.
4. As a professional on a phone, open a client chat and press "Suggest a session": the sheet shows on top.
5. On a laptop, Messages looks the same as before.

## 19 Oct 2026: A Photo That Cannot Load Shows a Calm Card

Commit `4ecd7cc`. No migration.

**Why.** On a computer without `SUPABASE_SECRET_KEY` in `.env.local`, a sent photo showed as a broken image with its file name, and opening it showed the browser's "HTTP ERROR 500" page. The live site has the key, so it worked there.

**What changed for users:**

- **A photo that cannot load** (in a private or group chat) shows a small card, "Photo could not be opened", instead of a broken image.
- **Opening a file that cannot be served** returns a short error instead of a crash page.

**What changed for the team:**

- **`messages-controller.ts`:** `openVoice` and `openAttachment` answer 503 "Files cannot be opened right now" when the server only storage client cannot start (missing `SUPABASE_SECRET_KEY`), instead of throwing.
- **`/api/community/messages/:id/media`:** the same.
- **`chat-thread.tsx` and `group-hub-view.tsx`:** photos fall back to the card when they fail to load (`GroupPhoto` in the group chat).
- **Local setup:** add `SUPABASE_SECRET_KEY` to `.env.local` (from Supabase, API Keys, the secret key) and restart `npm run dev` to open photos, PDFs and voice locally.

**What to re-test:**

1. Without the key locally: a photo shows "Photo could not be opened" and opening it gives a short error, not a crash page.
2. With the key in `.env.local` and the dev server restarted: photos show and open; voice plays.
3. On the live site: photos, PDFs and voice still work.

## 19 Oct 2026: Photos, PDF Files and Voice in Every Chat

Commit `97e5a5c`. Migration `20261019000200_chat_attachments.sql` must be run in the Supabase SQL Editor.

**Why.** Private chats had text and voice; group chats had text only, with a paperclip that said "not available yet". Every chat should work the same way.

**What changed for users:**

- **Private chats** (client and professional) can now send photos (JPG, PNG, WebP) and PDF files, as well as text and voice.
- **Group chats** can now send voice messages, photos and PDF files, as well as text.
- **Up to 5 MB per file.** A clear message says when a file is the wrong type or too big, before anything uploads.
- **First voice message in a group:** a short warning says "Your voice can identify you", because other members may recognise a voice even when someone is Anonymous. After "I understand", it does not show again on that device.
- **Photos open full size and PDFs open in the browser** when tapped. A photo in a group can be reported with "Report image" and hidden by the AROM team.
- **Group chats now show the newest 100 messages** (before, the oldest 100).

**What changed for the team:**

- **Migration:** columns for kind and file details on `messages` and `community_messages`; private buckets `message-attachments` and `community-media`; `send_attachment_safe()`, `can_upload_community_media()`, `community_media_uploaded()`, `community_media_path()`; `read_private_messages_safe()`, `read_community_messages()` and `my_group_chats()` return the new fields (never the storage path); `admin_read_community_messages()` labels media messages.
- **Server:** private photos and PDFs go through the existing `POST` with a form (`kind=attachment`); new `GET /api/attachments/:messageId`. Group voice, photos and PDFs go through `POST /api/community/groups/:id/messages` with a form; new `GET /api/community/messages/:messageId/media`. Files are streamed only after a membership check; the type is read from the file's first bytes.
- **Screens:** `chat-thread.tsx` (paperclip, preview, photo and PDF bubbles), `group-hub-view.tsx` (microphone with the warning, recording and preview, real file picking, voice playback), `group-chat.tsx` (sending and showing media), new `use-voice-recorder.ts` (same microphone settings as private chats), list previews say "Photo", "PDF" or "Voice message".
- **Follow up:** the admin chat view shows "[Photo] name" style labels; opening the file there needs the admin page to link the media route (Sokheng).
- Khmer text should be checked by a Khmer speaker.

**What to re-test:**

1. Run the migration in Supabase.
2. Private chat: send a photo and a PDF as client and as professional; both open on tap for the other person. Try a Word file or a 10 MB photo: a clear message, nothing sent.
3. Group chat: send a photo, a PDF and text; another member sees them.
4. Group voice: the first time, the warning shows; after "I understand", record, preview and send; another member plays it. Next time no warning.
5. Report a photo in a group as another member; as admin, remove it: members no longer see it.
6. Messages list previews say "Photo", "PDF" or "Voice message".

## 19 Oct 2026: Messages Has the Top Bar on Phones

Commit `b61db5e`. No migration.

**Why.** Now that Messages is in the phone menu, it should look like the other main pages. It had no top bar, so there was no ☰ menu or profile button on the page.

**What changed for users:**

- **On phones and tablets, Messages shows the same top bar as Home and Community:** the AROM logo, the ☰ menu and the profile button. Laptops are unchanged (the sidebar has them).

**What changed for the team:**

- **`user-messages.tsx`:** the page shell adds `TopHeader` above the content (hidden on large screens by `TopHeader` itself).

**What to re-test:**

1. On a phone, open Messages: the logo, ☰ and profile button show at the top.
2. Tap ☰: the menu opens, with Community in it. Tap the profile button: the profile menu opens.
3. On a laptop, Messages looks the same as before.

## 19 Oct 2026: Messages in the Phone Menu Instead of Community

Commit `1bb58f8`. No migration.

**Why.** On phones, people open their chats every day but only look for a new support group now and then. Since Messages now holds the group chats too, it deserves the bottom menu spot.

**What changed for users:**

- **The phone bottom menu shows Messages** (Home, MindGuide, Detection, Professional, Messages). Community is still in the ☰ menu.
- **"Find a group" button at the top of Messages** opens Community, so finding a group is one tap from your chats.

**What changed for the team:**

- **`app-navigation.tsx`:** the fifth bottom menu item is now Messages (`/messages`, MessageCircle icon). The Messages page already marks it as active.
- **`user-messages.tsx`:** the "Find a group" link next to the title.

**What to re-test:**

1. On a phone (or a narrow window), the bottom menu ends with Messages; tap it and it opens Messages, highlighted.
2. Tap "Find a group": Community opens.
3. Open ☰: Community is still listed.

## 19 Oct 2026: Group Chats Get Unread Badges and Update by Themselves

Commit `fd6c02f`. Migration `20261019000100_group_reads.sql` must be run in the Supabase SQL Editor.

**Why.** After group chats moved into Messages, they still lacked what the private chats have: no unread badge, no new messages without reopening the chat, and the list asked the server once per group.

**What changed for users:**

- **Unread badges on groups:** a group shows how many new messages from others arrived since you last opened it, in bold with a green number, and the badge clears when you open it. Only messages after you joined count.
- **Group chats update by themselves:** the open group checks for new messages every 10 seconds and the Messages list every 30 seconds, while the page is on screen, the same as private chats. The chat does not jump to the bottom while you read older messages.
- **Faster Messages list:** one request for all your groups instead of one per group.

**What changed for the team:**

- **Migration:** table `group_reads` (RLS on, no policies, only functions use it), `mark_group_read(group)` (members and mentor only), `my_group_chats()` (groups with newest message and unread count). Nobody can see when other members read.
- **New routes:** `GET /api/community/chats`, `POST /api/community/groups/:id/read`.
- **`group-api.ts`:** `useMyGroups()` uses the one call, refreshes every 30 seconds, `markRead()` clears a badge at once.
- **`group-chat.tsx`:** refreshes every 10 seconds, marks the group read after each load, keeps the list unchanged when nothing changed.
- **`chat-list.tsx`:** group rows use the real unread count.
- Not instant (no Realtime), on purpose: Realtime would need members to read the message table directly.

**What to re-test:**

1. Run the migration in Supabase.
2. As member A, open Messages. As member B (another browser), send a message in the shared group.
3. Within 30 seconds, A's list shows the group in bold with a badge and the new message.
4. A opens the group: the message is there and the badge clears; refresh: it stays cleared.
5. With the group open on both, B sends again: it appears for A within about 10 seconds.
6. Scroll up in a long chat and wait: the view does not jump to the bottom.

## 19 Oct 2026: Close the "Not for Emergencies" Bar in Chat

Commit `eb181ec`. No migration.

**Why.** The yellow "Messages are not for emergencies" bar sat at the top of every private chat, every time. It looked like an error in a screen that should feel calm, and people who are fine do not need to be reminded on every visit. People in a bad moment still need to know where help is, so the bar stays for first time readers.

**What changed for users:**

- **Close button on the bar:** a small ✕ at the right end. Tap it and the bar is gone from every private chat, and it does not come back.
- **First time only:** someone who has never closed it still sees it, with the Get help now link.
- **Get help now is still in Profile and Settings** for anyone who wants it later.

**What changed for the team:**

- **Saved in this browser only**, under `arom_messages_emergency_notice_closed`, not in the account. A new browser or device shows the bar once again. No backend needed.
- **`user-messages.tsx`:** the bar now has the close button. If the browser blocks storage, the bar hides until the page reloads.
- **`BACKEND-HANDOFF.md` section on messages** updated: the chat no longer "always links" to Get help now.

**What to re-test:**

1. Open Messages, then a private chat: the yellow bar shows with a ✕.
2. Tap ✕: the bar disappears. Open another private chat and reload: it stays gone.
3. Clear the site data (or use a private window): the bar shows again.
4. Switch to Khmer: the text and the ✕ label read in Khmer.
5. Phone width: the text wraps and the ✕ stays in the corner.

## 19 Oct 2026: Messages Holds Every Chat, Community Is for Finding Groups

Commit `b245c00`. No migration.

**Why.** People in Cambodia live in Telegram, where every chat (people and groups) sits in one list. AROM had private chats in Messages and group chats hidden inside Community. Now Messages is the one place to chat, and Community is the place to find a group.

**What changed for users:**

- **One chat list in Messages, newest first:** private chats with your professional and the support groups you joined, together. Each row has a label: a lock and "Private" for professional chats (admins cannot read them), "Group" for support groups (the AROM safety team can read them).
- **Group chats open in Messages,** on the right on a computer and full screen on a phone. The chat, members and guidelines are the same as before.
- **Community is for finding groups:** browse, recommended, group details, join, and create (professionals). After joining or creating, the chat opens in Messages. Tapping a group you are already in opens it in Messages.
- **Professionals get the same:** their Messages lists client chats and the groups they lead. "Open chat" on Support groups opens it there.
- **Group rows show the newest message,** but no unread count yet (step 2).

**What changed for the team:**

- **New:** `app/_components/messages/chat-list.tsx` (`ChatRow`, `mergeChatRows()`, `ChatListRow`), `app/community/components/group-chat.tsx` (`GroupChat`: loads messages and members, sends), routes `app/messages/groups/[groupId]` and `app/pro/messages/groups/[groupId]`.
- **`app/community/group-api.ts`:** `toSupportGroup()`, `isGroupId()`, `groupChatHref()`, `useMyGroups()`.
- **`user-messages.tsx` and `pro/_components/messages-view.tsx`:** the merged list and the group chat pane. The pro search finds clients and groups.
- **`group-hub-view.tsx`:** `layout="pane"` so it fits the Messages layout.
- **`app/community/page.tsx`:** no chat any more (find, join, create); the group chat and member loading moved to `GroupChat`. One old lint error left with it.
- **Step 2 needs backend:** group unread counts and a single "my groups with newest message" call (see `BACKEND-HANDOFF.md` section 23).
- Khmer text should be checked by a Khmer speaker.

**What to re-test:**

1. As a client in a group with a booked professional, open Messages: both chats show, newest first, labelled Private and Group.
2. Open the group: the chat opens on the right (computer) or full screen (phone); send a message.
3. Open the professional chat: it still works, with voice notes.
4. On Community, open a group you are in: it opens in Messages. Join a new group: "Go to group" opens it in Messages.
5. As a professional, open Messages: client chats and your groups show; search finds both. Open a group from Support groups: it opens in Messages.

## 18 Oct 2026: Translate Button on Mindguide Lesson and Practice Screens

Commit `6b58982`. No migration.

**Why.** The English and Khmer switch only lived in Profile settings. A person reading a lesson who found it easier in the other language had to leave the lesson, open Profile, change the language and find their way back. Many seekers read Khmer first, so switching has to be one tap where they are reading.

**What changed for users:**

- **Translate button in the header:** the lesson overview, the lesson reader and the practice overview each have a small button with a language icon. It shows the language you will get ("ខ្មែរ" while reading English, "EN" while reading Khmer). One tap switches the whole app and the choice is remembered.
- **Phone layout:** in the lesson reader the category name is hidden on small screens to make room for the button.

**What changed for the team:**

- **New `LanguageQuickToggle`** in `language-provider.tsx`, reusable anywhere. It uses the same language setting as Profile settings and the games.
- Added to `lesson-detail-view.tsx`, `lesson-screen.tsx` and `practice-detail-view.tsx`. Tips, saved lists and the Mindguide hubs do not have it yet.

**What to re-test:**

1. Open a lesson from Learn. Tap the button in the top bar: the title, description and takeaways switch language.
2. Tap Start Learning. The reader header has the button too; switch mid lesson and the section text follows.
3. Open a practice. Same button, same result.
4. Reload the page: the chosen language stays.
5. On a phone width, the header does not overflow.

## 18 Oct 2026: Group Members Tab and an Honest Anonymous Banner

Commit `dccaf24`. Migration `20261018080000_read_group_members.sql` must be run in the Supabase SQL Editor.

**Why.** In a support group, the Members tab was empty for real groups: it never showed who leads the group or who else is in it. And the Community home always said "You are anonymous here", even for people who had turned "Hide my identity" off and whose name was showing in the chat. Someone could share something believing they were anonymous when they were not.

**What changed for users:**

- **Members tab shows the group:** the mentor at the top (name, title, years of experience, photo), then every member as "Anonymous" or their name, following each person's "Hide my identity" switch, the same as the chat. Your own row says "(You)" and has no report button.
- **Empty group:** "Nobody has joined yet. New members will show here."
- **The banner tells the truth:** with the switch on, "You are anonymous here. Other members see you as Anonymous." With it off, "Your name is shown in groups" with a link to Profile settings. Professionals read that their name is shown so members know who leads the group.
- **Flipping the switch updates the banner straight away**, without reloading.

**What changed for the team:**

- **Migration:** `read_group_members(group)`, security definer, only for the group's members, mentor and admins. Never returns account ids; members who left or were removed are not listed.
- **New route:** `GET /api/community/groups/:id/members`.
- **`app/community/page.tsx`:** loads members and the mentor when a group chat opens (separately from messages).
- **`group-hub-view.tsx`:** empty message, no report button on your own row. **`community-data.ts`:** `GroupMember.isYou`.
- **`community-home-view.tsx`:** the banner follows the switch. **`profile-settings.tsx`:** refreshes the session after saving the switch.
- **Removed members (checked 19 Oct):** they cannot read or send. Removing a member sets `left_at` together with `removed_at`, which `is_group_member()` checks, and rejoining is refused. An earlier note here said otherwise; it was wrong.
- Khmer text should be checked by a Khmer speaker.

**What to re-test:**

1. Run the migration in Supabase.
2. Open a group you joined, then the Members tab: the mentor card and the members show.
3. As a client with "Hide my identity" on, you show as "Anonymous (You)"; turn it off and reopen: your name shows with "(You)".
4. On Community home, the banner matches the switch, and changes right after flipping it in Profile settings.
5. As a professional, the banner says your name is shown.

## 18 Oct 2026: Professionals Create Support Groups From Their Own Area

Commit `408cbba`. No migration.

**Why.** Verified professionals were already allowed to create support groups, but the professional area had no way to reach it. A therapist had to leave `/pro`, open the user Community page and find the button, so in practice only admins created groups.

**What changed for users:**

- **"Support groups" in the professional menu:** a new page lists the groups the professional leads or joined, with members and whether the group is closed.
- **Create a group without leaving the pro area:** the same form as Community. After creating, the group appears in the list.
- **"Open chat"** goes straight into that group's chat on the Community page.
- **Links to a group work:** `/community?group=<id>` opens that group (the chat if you are in it, otherwise its details and Join).

**What changed for the team:**

- **New:** `app/pro/groups/page.tsx`, `app/pro/_components/groups-view.tsx`, and `app/community/group-api.ts` (`createSupportGroup()`, now used by both `/community` and `/pro/groups`).
- **`pro-shell.tsx`:** the "Support groups" menu item (HeartHandshake icon).
- **`app/community/page.tsx`:** uses the shared create helper and opens `?group=<id>` after the groups load.
- No backend change: `GET /api/community/groups` already marks the mentor's groups as joined, and RLS lets verified professionals create groups. An unverified professional gets the existing error message.
- Khmer text on the new page should be checked by a Khmer speaker.

**What to re-test:**

1. Log in as a verified professional and open `/pro`: "Support groups" is in the menu.
2. Open it: your groups are listed (or "You do not lead a group yet").
3. Press "Create a group", fill the form and create: the group appears in the list.
4. Press "Open chat": the group chat opens on Community; send a message.
5. As a client, open Community: the new group is under Recommended for you.

## 18 Oct 2026: Group Chat Shows Its Messages

Commit `9d24272`. No migration.

**Why.** After the send fix, messages were saved (the database had them) but the group chat stayed empty. Before loading messages, `app/community/page.tsx` checks that the group id looks like a real id. That check (since commit `54c34f5`, 15 Oct) expected four parts, but a real id has five (`8-4-4-4-12`), so real groups never matched and the messages were never loaded.

**What changed for users:**

- **Group chats show their messages** again, including the ones sent earlier today, and new messages appear right after sending.

**What changed for the team:**

- **`app/community/page.tsx`:** the id check in the message loading effect now uses the same five part pattern as the rest of the file. All other id checks in the project were already correct.

**What to re-test:**

1. Open a support group you joined: earlier messages show.
2. Send a message: it appears in the chat.
3. As another member, open the same group: the message shows, as Anonymous or with the sender's name depending on their "Hide my identity" choice.

## 18 Oct 2026: Group Chat Messages Send Again

Commit `7789840`. No migration.

**Why.** Sending a message in a support group did nothing, and the dev screen showed "1 Issue". In `handleSendMessage` (since commit `54c34f5`, 15 Oct) the message was added to the screen using `newMsg` before `newMsg` was created at the end of the function. JavaScript stops with an error when a variable is used before it exists, so the function stopped before the message reached the server.

**What changed for users:**

- **Messages send again** in support groups, and the chat reloads with the new message.
- The name shown with a message comes from the server, following the member's "Hide my identity" choice, as before.

**What changed for the team:**

- **`app/community/page.tsx`:** `handleSendMessage` now only sends to `POST /api/community/groups/:id/messages`. The browser only copy of messages (used by the removed sample groups) and the extra `/api/profile` request that only fed it are gone.
- The one existing lint error in this file (setState in an effect) is unchanged.

**What to re-test:**

1. Open a support group you joined and send a message: it appears in the chat.
2. Refresh the page: the message is still there.
3. With "Hide my identity" on, the message shows as Anonymous to other members; with it off, your name shows.
4. Try to attach an image: "Attachments are not available in real groups yet." shows.

## 18 Oct 2026: Community Shows Only Real Support Groups

Commit `3fe8b69`. No migration.

**Why.** The Community page mixed four sample groups (Stress & Burnout, Depression, Academic Stress, Anxiety Circle, with made up mentors and messages) with the real groups from the database. Everyone was shown as already in "Stress & Burnout Support", and "Recommended for you" was always the sample Academic Stress group. A person could join a sample group and share something personal, then wait for a reply that never comes. For a mental health app that is not safe.

**What changed for users:**

- **Only real groups:** My support Group, Recommended for you and Explore all groups show only groups professionals or admins created.
- **No groups yet:** users see "No support groups yet. Professionals are setting them up. Please check back soon." Professionals see "Start the first one with Create a group above."
- **Not logged in:** visitors see "Log in to join a support group" with a Log in button, because groups are for AROM members only.
- **My support Group** appears only once the user really joined a group. **Recommended for you** is an open real group they have not joined.
- **If loading fails,** a short message says so instead of showing sample groups.

**What changed for the team:**

- **`app/community/page.tsx`:** starts with no groups, messages, members or activities; removed the code that merged the sample groups and browser saved copies; tracks a `GroupsStatus` (loading, ready, signed out, failed); group screens open only for a group that exists.
- **`community-home-view.tsx`:** the empty, loading, signed out and failed states; the group cards only show when there is a real group.
- **`community-data.ts`:** the samples stay in the file (the admin Community page still uses them for activities) but the user page does not show them.
- Khmer text for the new messages should be checked by a Khmer speaker.

**What to re-test:**

1. Log out and open Community: "Log in to join a support group" shows, and no sample groups.
2. Log in as a user when no group exists: "No support groups yet" shows.
3. As a professional, create a group: it opens; back on Community it is under My support Group.
4. As another user, open Community: the new group is under Recommended for you; join it and send a message.
5. Explore all support groups lists only real groups.

## 18 Oct 2026: Community Page Shows Again

Commit `878172e`. No migration.

**Why.** The Community page was blank, on the live site too. Since commit `54c34f5` (15 Oct) the join function in `app/community/page.tsx` was written twice, one copy inside the other, so all the code after it, including the part that draws the page, ended up inside that function. The page drew nothing. The same edit also left the group chat error message inside the create group function, where it was never shown. Typecheck and build did not catch it, because a page that returns nothing is still valid code.

**What changed for users:**

- **Community opens again:** your support group, recommended groups and the group list show.
- **Group chat errors are shown:** for example "Could not load messages" or "Attachments are not available in real groups yet" now appear above the chat instead of failing silently.

**What changed for the team:**

- **`app/community/page.tsx`:** removed the extra `function handleJoinGroup` wrapper and its closing bracket, moved the code back to its normal indentation (most of the diff is indentation), and moved the `messageError` message into the group chat view. No logic changed.
- The two existing lint errors in this file (setState in an effect, lines 68 and 181) are unchanged.

**What to re-test:**

1. Open Community: the page shows your group and recommended groups.
2. Open a group, join it, and send a message.
3. Create a group as a professional: it opens the group chat.
4. In a real group, try to attach an image: the red message "Attachments are not available in real groups yet." shows above the chat.

## 18 Oct 2026: Anonymous Clients Get a Number

Commit `98ca4cb`. No migration.

**Why.** Since the anonymous privacy work, every client with "Hide my identity" on shows as "Anonymous" to their therapist. A therapist with two anonymous clients saw "Anonymous" twice in bookings, messages and the client list, and could write a note or give a care task to the wrong person.

**What changed for users:**

- **Therapists see "Anonymous #4821"** (Khmer "អនាមិក #4821") instead of just "Anonymous", on every pro screen: My bookings, the week calendar, Prepare, My clients, the client file, Messages, Home, care plan and suggest session windows.
- **The same client always has the same number**, and the number is different for each therapist, so it cannot be used to recognise someone across therapists.
- **Searching "4821" in My clients finds that client.**
- **Clients see no change.**

**What changed for the team:**

- **`app/pro/_data/clients.ts`:** `anonymousLabel()` makes the number from the client's alias id (FNV-1a hash, 1000 to 9999); `withClientLabels()` renames anonymous bookings.
- **`pro-provider.tsx`:** applies the labels once to the bookings every pro screen reads, and again when the language changes.
- **`clients-view.tsx`:** the avatar letter skips the number ("A", not "A#").
- Frontend only. The server still returns "Anonymous". `BACKEND-HANDOFF.md` section 29 follow up marked done.

**What to re-test:**

1. As a therapist with two anonymous clients, open My clients: each shows a different "Anonymous #" number with the avatar "A".
2. Open My bookings, Messages and a client file: the same client has the same number everywhere.
3. Refresh the page: the numbers stay the same.
4. Switch to Khmer: the label reads "អនាមិក #" with the same number.
5. Type the number in the My clients search: that client is found.

## 18 Oct 2026: Sample Quick Replies Are Back

Commit `7be1816`. No migration.

**Why.** Quick replies used to show 5 example replies to every professional. When quick replies were connected to the database on 15 Oct, each professional got their own saved list and the examples went away, so a new professional only saw "No quick replies yet." and had no idea what to write.

**What changed for users:**

- **Examples while the list is empty:** a professional with no saved quick replies sees the 5 examples (thank you, running late, session link, see you on, and one in Khmer). Tapping one puts it in the message box with the client's name, link or next session filled in.
- **One tap to keep them:** "Add these to my quick replies" saves all 5 to the professional's own list, where Edit lets them change or delete each one.
- **Nothing changes for professionals who already saved replies.**

**What changed for the team:**

- **`message-store.ts`:** `SAMPLE_QUICK_REPLIES`, and `useQuickReplies()` returns null while loading so the examples do not flash before saved replies arrive.
- **`chat-thread.tsx`:** the examples and the add button in the Quick replies panel. Saving uses the existing `PUT /api/pro/quick-replies`. Frontend only.

**What to re-test:**

1. As a professional with no quick replies, open a chat and the Quick replies panel: the 5 examples show.
2. Tap one: it fills the message box with the client's name.
3. Press "Add these to my quick replies": the examples become your own list; Edit can delete one.
4. Delete them all: the examples show again.

## 18 Oct 2026: Therapists See the Note From Anonymous Clients

Commit `ff32d64`. Migration `20261018070000_show_intake_for_anonymous.sql` must be run in the Supabase SQL Editor (after `20261018060000_merge_privacy_with_main.sql`, already applied).

**Why.** When booking, a client can write a "Note for Therapist" and answer intake questions. Since the anonymous privacy work, the therapist got an empty note and no answers whenever the client had "Hide my identity" on, which is the default. So most clients wrote a note their therapist never saw. Anonymous mode should hide who the client is, not what they chose to tell their therapist.

**What changed for users:**

- **Therapists see the note and intake answers of every client** on My bookings, the Prepare view and the client file, including clients shown as "Anonymous".
- **Anonymous clients stay anonymous:** their name still shows as "Anonymous" and their account stays hidden.

**What changed for the team:**

- **New migration:** redefines `read_my_pro_bookings_safe()` without the `hide_identity` check on `intakeNote` and `intakeAnswers`. Otherwise the same as the merge version. No code change.
- **Handoff:** `BACKEND-HANDOFF.md` section 29 updated with this rule, and the migrations applied today marked as applied.

**What to re-test:**

1. Run the migration in Supabase.
2. As a client with "Hide my identity" on, book a session and write a note.
3. As the therapist, open My bookings: the client shows as "Anonymous" and the note is shown.
4. Open the Prepare view and the client file: the note is shown there too.

## 18 Oct 2026: Voice Messages Send Again and Keep Quiet Words

Commit `5f88298`. Branch `merge/anonymous-privacy` (PR #19). No migration.

**Why.** While testing PR #19, a professional could send text to an anonymous client but not a voice message: it said "You can send messages after a booked session." The voice path still called the old `send_message` with the client's alias, so the database found no booking. Separately, quiet words disappeared from recordings, because the browser's call settings (noise suppression and echo cancellation) treated soft speech as noise.

**What changed for users:**

- **Voice messages send again** to clients the professional has booked with, including anonymous clients.
- **Quiet words stay in the recording:** soft speech is kept and evened out instead of cut to silence. Recordings are also clearer.

**What changed for the team:**

- **`messages-controller.ts`:** the voice path calls `send_message_safe`, the same as text.
- **`chat-thread.tsx`:** the microphone is opened with `noiseSuppression` and `echoCancellation` off and `autoGainControl` on, and recorded at 96 kbps (about 1.4 MB for 2 minutes, under the 5 MB limit).

**What to re-test:**

1. As a professional, send a voice message to an anonymous client with a booking. It sends.
2. As the client, play it.
3. Record a sentence with one word said softly. Play it back: the soft word is heard.
4. Record the full 2 minutes. It sends without a size error.

## 18 Oct 2026: Anonymous Privacy Merged With Main

Commit `b166f74`. Branch `merge/anonymous-privacy`. Migrations to run in Supabase, in this order: `20261017001100_message_client_names.sql`, `20261017001200_alias_client_archiving.sql`, `20261018060000_merge_privacy_with_main.sql`. The rest of the privacy SQL was already applied by hand; do not rerun it. Needs `SUPABASE_SECRET_KEY` on Vercel.

**Why.** Sokheng built anonymous privacy for professionals on a branch that started from main on 15 Oct and was 159 commits behind, so it could not merge (11 conflicts). Most of its SQL was already applied to the shared database, which blocked messages, therapist bookings, care plans and shared client data for the code on main. This merge brings the privacy work in without losing anything from main.

**What changed for users:**

- **Therapist area works again once the migrations run:** bookings, booking actions, messages, voice notes, client files, summary notes, suggestions and care plans use the new safe functions the live database expects.
- **Nothing from main is lost:** client time changes ("rescheduled by"), the in person address, mood trend sharing, profile office fields and every other feature on main stay as they were.
- **Therapists see client aliases:** clients with "Hide my identity" on show as "Anonymous" to their therapist (Sokheng's rule, still to be confirmed by the team).

**What changed for the team:**

- **Main is the reference:** `appointments-controller.ts` is unchanged from main. Sokheng's privacy changes were added by hand to main's `pro-controller.ts`, in main's formatting.
- **Migrations:** Hok Chheng's `20261016*` names kept; Sokheng's second renames dropped. His new files `20261015001600` to `20261015002600` are now `20261017000900` to `20261017001900`, because one number was already used by `in_person_address` and they need the alias table from `20261016000600`.
- **New merge migration:** `20261018060000_merge_privacy_with_main.sql` adds `rescheduledBy` and `shareMoodTrend` to `read_my_pro_bookings_safe()` and adds `shared_mood_checkins_safe(alias)`.
- **Handoff:** `BACKEND-HANDOFF.md` section 29 explains the privacy rules, the safe functions, voice playback, migrations and the open decision about `hide_identity`.
- **Docs:** Sokheng's report entry is kept below. His formatter changes to `report.md` and `BACKEND-HANDOFF.md` were left out.

**What to re-test:**

1. Run the three migrations above, then add `SUPABASE_SECRET_KEY` on Vercel.
2. As a therapist, open My bookings: the list loads, a moved session says who moved it, and mood trend sharing shows.
3. Mark a session completed, change its meeting link, write a prep note and a session note.
4. Open Messages: conversations load with client names or "Anonymous"; send text and voice; the client can play the voice note.
5. Open a client file: save and clear a summary note, archive and unarchive, view shared survey, symptom checks and mood trend.
6. Suggest a session time and withdraw it; as the client, accept one.
7. Give a care task; as the client, tick it with progress sharing on and off.
8. As a client, change sharing choices on My appointments, including mood trend, and change a session time.
9. Turn "Hide my identity" off and on and refresh the therapist's bookings.

## 18 Oct 2026: Anonymous Identity Protection Across Professional Features

Commits `6be0ede` and `b5f32f0`. Branch `feature/anonymous-privacy`, merged with main in the entry above. Integration and migration validation are still in progress.

**Why.** The profile switch saved `hide_identity`, but some database functions checked the older `privacy_mode` field. Professional responses and raw database reads could also expose real client account IDs.

**What changed for users:**

- Anonymous users appear as "Anonymous" in professional bookings and messages. Switching anonymity off restores name visibility after refresh.
- Professionals use stable client aliases instead of real client account IDs.
- Anonymous users' intake notes and answers are excluded from professional booking responses. Saved intake data is retained.
- Survey, symptom, and care-progress sharing remain separate choices.
- Voice playback goes through the authenticated API instead of redirecting to storage URLs containing sender account IDs.

**What changed for the team:**

- Updated appointments, messages, professional, sessions, and care controllers.
- Added protected database functions for alias-based reads and actions.
- Restricted professional access to raw appointments, messages, conversations, notes, suggestions, care records, and shared-health rows.
- Restricted several original RPCs that returned real client IDs.
- Renumbered anonymity migrations to avoid collisions with the care-plan, sessions, private-notes, and mood migrations.
- Added `lib/supabase/private-storage.ts`. It requires `SUPABASE_SECRET_KEY` in the server environment. Never commit its value or expose it through `NEXT_PUBLIC_` variables.
- `hide_identity` is the active privacy setting. A migration preserves older anonymous choices before replacing the relevant `privacy_mode` checks.

**Validation reported during development:**

- TypeScript and the production build passed.
- Anonymity on/off changed the professional's displayed name correctly.
- Text and voice messaging worked for the conversation participants.
- An unrelated professional received "Conversation not found" for another professional's conversation.
- Voice access isolation and signed-out authentication checks were reported working.
- Care-task creation, client visibility, and progress-sharing on/off worked before the final raw-access restrictions.
- Git whitespace checks passed. `.env.local` is ignored and untracked.

**Still to verify before merge:**

1. Replay the complete migration sequence on a separate empty test database. Manual SQL success does not establish reproducibility.
2. Reconcile migration history for the shared database; changes were applied through SQL Editor.
3. Repeat care-progress and survey/symptom-sharing tests after the final policy restrictions.
4. Test intake visibility with saved test answers; there were no intake-answer rows during the initial review.
5. Complete remaining database function, view, and policy checks. Do not treat the build as proof of full privacy.
6. Confirm deployment secrets and test the deployed application.

**Limits.** Anonymous Mode controls application identity fields and access. It cannot remove identifying information users voluntarily send in message text, recordings, meeting calls, or other free text.

## 18 Oct 2026: Plan Tasks No Longer Say "Try now"

Commit `555bfc1`. No migration. Frontend only.

**Why.** Tasks added from Tips to Your Plan For Today always started with "Try now:" (Khmer "សាកល្បង៖"), for example "Try now: Cut what you control". The label repeated on every tip task and made the plan harder to scan, so it is removed and the task shows only its name.

**What changed for users:**
- **Cleaner task names:** The home page plan now shows "Cut what you control" instead of "Try now: Cut what you control", in English and Khmer.
- **Old tasks are cleaned too:** Tasks saved before this change still have the label in the database, but it is hidden when the plan loads, so nobody needs to re-add them.

**What changed for the team:**
- **`lib/plan.ts`:** The `starter:try-now` starter title no longer has the label.
- **`tips-plan.ts`:** Tip tasks are saved with the step title only.
- **`daily-plan-store.ts`:** `withoutTryNow` strips "Try now:", "សាកល្បង៖" and "សាកល្បង (Try now)៖" from task titles on load. If a person edits that task, the clean title is what gets saved.

**What to re-test:**
1. Logged out, open the home page and check the plan shows "Cut what you control" with no "Try now".
2. Logged in with an account that already has the starter task, check the label is gone.
3. Open `/mindguide/tips`, add a step to the plan, and check the new task shows only the step title.
4. Switch to Khmer and check the same tasks show no "សាកល្បង៖".

## 18 Oct 2026: New Lesson, How to Deal With Loneliness

Commit `96d9aa8`. No migration. Content and frontend only.

**Why.** Rapid urban migration, living in small rented rooms, social media comparison, and emotional isolation cause pervasive loneliness among young people in Cambodia. Loneliness is frequently stigmatized or suffered in silence, leading to chronic physical inflammation, sleep disturbances, social anxiety, and depression. "How to Deal With Loneliness" (`how-to-deal-with-loneliness`) provides an 8-minute evidence-based psychoeducational guide adapted from WHO (Commission on Social Connection), APA, Harvard Health Publishing, NHS Every Mind Matters, and UNICEF Cambodia. It equips seekers with practical tools to understand loneliness as a natural biological alarm rather than a character defect, differentiate painful isolation from nourishing solitude, navigate Cambodian urban migration realities, deactivate the lonely brain's social threat hypervigilance loop, construct a 3-tier low-stakes connection ladder, befriend oneself through restorative rituals, soothe somatic isolation through self-compassion breathwork, and connect with confidential therapy on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "How to Deal With Loneliness (របៀបដោះស្រាយភាពឯកោ)" under the Relationships category or directly via `/mindguide/learn?open=how-to-deal-with-loneliness`.
- **11 Comprehensive Bilingual Sections:** Covers the loneliness paradox (feeling alone in a crowded room), loneliness vs solitude (restorative aloneness), Cambodian context on rural-to-urban migration and social media highlight reels, an interactive quiz on relationship quality vs quantity, the brain's social threat hypervigilance loop, building the low-stakes connection ladder (micro-connections, shared spaces, rekindling sparks), nourishing solitude and befriending oneself, a personal loneliness check-in reflection, physical health impacts and when to seek psychotherapy, somatic self-compassion breathwork, and finding connection on AROM.
- **Tip Alert Box:** Section 11 features a comforting reminder: "Needing human connection is not a weakness; it is the most fundamental sign that you are human. Be patient with your journey toward belonging."
- **Direct AROM tool integration:** Section 10 triggers the "1-Minute Calming Breath" (`actionType: "exercise"`), and Section 11 provides direct action buttons for "Open AROM Journal" (`actionType: "tips"`) and "Talk to a Professional" (`actionType: "professional"`).

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_LONELINESS` with 5 peer-reviewed citations (WHO, APA, Harvard Health, NHS Every Mind Matters, UNICEF Cambodia) and `LESSON_LONELINESS`, prepending it to `ALL_LESSONS` under category `"Relationships"`.
- **Hero Image:** Added `public/mindguide/loneliness-hero.jpg` depicting a young Cambodian person standing peacefully on a rooftop balcony in Phnom Penh at sunset with tea and a flowering jasmine plant.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "How to Deal With Loneliness" card appears under the "Relationships" filter with the "Popular" badge.
2. Open `/mindguide/learn?open=how-to-deal-with-loneliness` and verify hero image, outcomes, and 11 sections render smoothly.
3. Test Section 4 quiz: verify correct feedback when selecting option B and bilingual explanations.
4. Test Section 8 loneliness self-check interactive choice and feedback.
5. Test Section 10 coping exercise button: launches 1-Minute Calming Breath session.
6. Test Section 11 tip alert box and action buttons: "Open AROM Journal" and "Talk to a Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, How to Support a Friend Who Is Struggling

Commit `688062d`. No migration. Content and frontend only.

**Why.** When peers face overwhelming grief, academic failure, family stress, or emotional depression, friends desperately want to help but often resort to unhelpful advice, toxic positivity, or dismissive phrases like "don't overthink" (កុំគិតច្រើន), or conversely fall into compassion fatigue and helper burnout. "How to Support a Friend Who Is Struggling" (`how-to-support-a-struggling-friend`) provides an 8-minute evidence-based psychoeducational guide adapted from WHO (Psychological First Aid), Mental Health Foundation, APA, UNICEF Cambodia, and TPO Cambodia. It equips seekers with practical tools to hold safe non-judgmental space, apply the Look-Listen-Link framework, validate emotions without giving unsolicited lectures, dismantle Cambodian cultural stigmas and fear of losing face, set loving boundaries as a friend rather than an unlicensed therapist, recognize acute crisis warning signs where safety overrides confidentiality, practice co-regulation breathwork, and guide friends gently to professional care on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "How to Support a Friend Who Is Struggling (របៀបជួយគាំទ្រមិត្តភក្តិដែលកំពុងជួបការលំបាក)" under the Relationships category or directly via `/mindguide/learn?open=how-to-support-a-struggling-friend`.
- **11 Comprehensive Bilingual Sections:** Covers the urge to fix vs the gift of presence, Psychological First Aid (Look, Listen, Link), Cambodian cultural context (moving beyond "don't overthink" and fear of losing face), an interactive quiz on supportive validation vs accidental invalidation, active validation scripts and words to avoid, the golden helper boundary (friend vs therapist), how to gently encourage professional care without being pushy, a helper self-check reflection on personal capacity, recognizing acute crisis signals and safety escalation, shared co-regulation with the 1-minute calming breath, and connecting support circles on AROM.
- **Tip Alert Box:** Section 11 features a grounding reminder: "Loving a struggling friend does not mean saving them alone. Your role is to walk beside them with warmth and hold their hand as you connect them to professional support."
- **Direct AROM tool integration:** Section 10 triggers the "1-Minute Calming Breath" (`actionType: "exercise"`), and Section 11 provides direct action buttons for "Open AROM Journal" (`actionType: "tips"`) and "Talk to a Professional" (`actionType: "professional"`).

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_SUPPORT_FRIEND` with 5 peer-reviewed citations (WHO, Mental Health Foundation, APA, UNICEF Cambodia, TPO Cambodia) and `LESSON_SUPPORT_FRIEND`, prepending it to `ALL_LESSONS` under category `"Relationships"`.
- **Hero Image:** Added `public/mindguide/support-friend-hero.jpg` depicting two young Southeast Asian friends sitting on a wooden bench in a Phnom Penh courtyard garden with warm tea, listening with empathy and trust.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "How to Support a Friend Who Is Struggling" card appears under the "Relationships" filter with the "Essential" badge.
2. Open `/mindguide/learn?open=how-to-support-a-struggling-friend` and verify hero image, outcomes, and 11 sections render smoothly.
3. Test Section 4 quiz: verify correct feedback when selecting option B and bilingual explanations.
4. Test Section 8 helper self-reflection interactive choice and feedback.
5. Test Section 10 coping exercise button: launches 1-Minute Calming Breath session.
6. Test Section 11 tip alert box and action buttons: "Open AROM Journal" and "Talk to a Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, Why Have I Lost Interest in Things I Used to Love?

Commit `316848f`. No migration. Content and frontend only.

**Why.** When people experience chronic emotional strain, prolonged stress, or depressive episodes, they often lose interest and pleasure in their favorite activities (anhedonia). In Cambodia, this emotional numbness is frequently misunderstood by family and peers as "laziness" (ខ្ជិល) or "overthinking" (គិតច្រើន), producing severe internal shame and self-isolation. "Why Have I Lost Interest in Things I Used to Love?" (`why-lost-interest-motivation`) provides an 8-minute evidence-based psychoeducational guide adapted from NIMH, WHO, Harvard Health Publishing, NHS inform, and UNICEF Cambodia. It equips seekers with clear explanations of anhedonia and dopamine down-regulation, tools to distinguish temporary burnout from clinical depression and natural life evolution, insights to deconstruct the Cambodian "laziness" stigma, behavioral activation strategies (such as the 5-Minute Low-Pressure Rule), somatic 1-minute calming breathwork, and safe pathways to connect with confidential therapists and private journaling on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "Why Have I Lost Interest in Things I Used to Love? (ហេតុអ្វីខ្ញុំបាត់បង់ចំណាប់អារម្មណ៍លើអ្វីដែលធ្លាប់ចូលចិត្ត?)" under the Emotions category or directly via `/mindguide/learn?open=why-lost-interest-motivation`.
- **11 Comprehensive Bilingual Sections:** Covers the sudden loss of joy, clinical anhedonia and dopamine biology, distinguishing burnout vs depression vs natural personal growth, an interactive quiz on motivation myths (debunking waiting for passion), Cambodian cultural context on the "laziness" stigma, the motivation trap and behavioral activation, the 5-Minute Low-Pressure Rule and micro-dosing pleasure, a personal motivation check-in reflection, when to seek clinical support, somatic 1-minute calming breathwork, and continuing the healing journey on AROM.
- **Tip Alert Box:** Section 11 features a compassionate reminder: "When a flower does not bloom, you do not blame the flower. You adjust the environment, the soil, and the sunlight. Give yourself patience while your inner soil recovers."
- **Direct AROM tool integration:** Section 10 triggers the "1-Minute Calming Breath" (`actionType: "exercise"`), and Section 11 provides direct action buttons for "Open AROM Journal" (`actionType: "tips"`) and "Talk to a Professional" (`actionType: "professional"`).

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_LOST_INTEREST` with 5 peer-reviewed citations (NIMH, WHO, Harvard Health, NHS inform, UNICEF Cambodia) and `LESSON_LOST_INTEREST`, prepending it to `ALL_LESSONS` under category `"Emotions"`.
- **Hero Image:** Added `public/mindguide/lost-interest-hero.jpg` depicting a young Cambodian person sitting peacefully beside an open window in Phnom Penh with a guitar, sketchbook, and warm tea.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "Why Have I Lost Interest in Things I Used to Love?" card appears under the "Emotions" filter with the "Popular" badge.
2. Open `/mindguide/learn?open=why-lost-interest-motivation` and verify hero image, outcomes, and 11 sections render smoothly.
3. Test Section 4 quiz: verify correct feedback when selecting option B and bilingual explanations.
4. Test Section 8 self-reflection interactive choice and feedback.
5. Test Section 10 coping exercise button: launches 1-Minute Calming Breath session.
6. Test Section 11 tip alert box and action buttons: "Open AROM Journal" and "Talk to a Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, How to Balance Study, Work, and Life

Commit `d8d6a1c`. No migration. Content and frontend only.

**Why.** Competing demands from dual-shift university classes, daytime employment, family obligations, and societal pressures in Cambodia frequently cause cognitive overload, chronic exhaustion, boundary erosion, and systemic burnout. "How to Balance Study, Work, and Life" (`how-to-balance-study-work-life`) activates the Burnout category in MindGuide Learn with an 8-minute evidence-based psychoeducational guide adapted from WHO, APA, Harvard Health Publishing, NHS Every Mind Matters, and UNICEF Cambodia. It equips seekers with realistic, sustainable strategies to replace the unrealistic 50/50 balance myth with dynamic equilibrium, recognize early somatic and emotional burnout signals, manage their 4 core life batteries (physical, mental, emotional, meaning), set assertive boundaries without guilt, apply the Eisenhower priority matrix and "Good Enough" standard, practice micro-rest reset routines, soothe transition stress with the 1-Minute Calming Breath, and access confidential therapy on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "How to Balance Study, Work, and Life (របៀបបង្កើតតុល្យភាពរវាងការសិក្សា ការងារ និងជីវិតផ្ទាល់ខ្លួន)" under the Burnout category or directly via `/mindguide/learn?open=how-to-balance-study-work-life`.
- **11 Comprehensive Bilingual Sections:** Covers why perfect balance is a myth, early warning signs of overload and clinical burnout (WHO ICD-11), Cambodian cultural context (dual shifts, family honor, rest guilt), interactive quiz on sustainable productivity, energy management across 4 life batteries (Harvard Health), boundary setting scripts for work and university, the priority matrix and "Good Enough" standard, personal energy leak audit reflection, micro-rest and evening shutdown rituals, somatic 1-minute transition breath, and ongoing support on AROM.
- **Tip Alert Box:** Section 11 features a restorative reminder that rest is an essential biological requirement to sustain life and loved ones, not a reward earned after complete exhaustion.
- **Direct AROM tool integration:** Section 10 links to "1-Minute Calming Breath" (`actionType: "exercise"`), and Section 11 provides direct action buttons for "Open AROM Journal" (`actionType: "tips"`) and "Talk to a Professional" (`actionType: "professional"`).

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_BALANCE_LIFE` with 5 peer-reviewed citations (WHO, APA, Harvard Health, NHS Every Mind Matters, UNICEF Cambodia) and `LESSON_BALANCE_STUDY_WORK_LIFE`, prepending it to `ALL_LESSONS` under category `"Burnout"`.
- **Hero Image:** Added `public/mindguide/balance-study-work-hero.jpg` depicting a young Cambodian student and professional at a clean morning desk with study notes, a schedule laptop, warm tea, and sunlight.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "How to Balance Study, Work, and Life" card appears under the "Burnout" filter with the "Essential" badge.
2. Open `/mindguide/learn?open=how-to-balance-study-work-life` and verify hero image, outcomes, and 11 sections render smoothly.
3. Test Section 4 quiz: verify correct feedback when selecting option B and bilingual explanations.
4. Test Section 8 self-reflection interactive choice and feedback.
5. Test Section 10 coping exercise button: launches 1-Minute Calming Breath session.
6. Test Section 11 tip alert box and action buttons: "Open AROM Journal" and "Talk to a Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, How to Handle Fear of Failure

Commit `b821fc1`. No migration. Content and frontend only.

**Why.** Perfectionism, fear of making mistakes, and tying personal self-worth to flawless outcomes cause task paralysis, severe procrastination, imposter syndrome, and chronic burnout. "How to Handle Fear of Failure" (`how-to-handle-fear-of-failure`) unlocks the Self-esteem category with an 8-minute evidence-based psychoeducational guide adapted from the APA, Harvard Health, NHS inform, and UNICEF Cambodia. It equips seekers with practical tools to distinguish healthy striving from toxic perfectionism, navigate Cambodian filial expectations, embrace a growth mindset where mistakes are treated as learning data, apply the "Good Enough" standard, practice intentional micro-courage experiments, soothe somatic shame, and access confidential therapy on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "How to Handle Fear of Failure (របៀបដោះស្រាយការភ័យខ្លាចការបរាជ័យ)" under the Self-esteem category or directly via `/mindguide/learn?open=how-to-handle-fear-of-failure`.
- **11 Comprehensive Bilingual Sections:** Covers what fear of failure is (atychiphobia), roots of perfectionism and Cambodian family honor, the costs of avoidance (procrastination, paralysis, imposter syndrome), growth mindset with an interactive quiz on receiving criticism, practicing self-compassion via the Best Friend Rule, the "Good Enough" standard, micro-risk courage experiments, somatic grounding when shame strikes (hand-on-heart and breathwork), when to seek clinical CBT/ACT therapy, a 5-prompt reflection activity for AROM Journal, and next steps connecting to AROM.
- **Tip Alert Boxes:** Section 8 introduces somatic calming for shame waves with the 1-Minute Calming Breath, and Section 9 details private matching with certified youth counselors and clinical psychologists on AROM.
- **Direct AROM tool integration:** Section 11 provides direct action buttons for "1-Minute Calming Breath" and "Match Me With A Professional".

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_FEAR_OF_FAILURE` with 4 peer-reviewed citations (APA, Harvard Health, NHS inform, UNICEF Cambodia) and `LESSON_FEAR_OF_FAILURE`, appending it to `ALL_LESSONS` under category `"Self-esteem"`.
- **Hero Image:** Added `public/mindguide/fear-of-failure-hero.jpg` depicting a young person smiling with compassionate self-acceptance while writing in a journal beside a sunny garden window.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "How to Handle Fear of Failure" card appears under "Self-esteem" filter.
2. Open `/mindguide/learn?open=how-to-handle-fear-of-failure` and verify hero image, outcomes, and 11 sections render smoothly.
3. Test Section 4 quiz: verify correct feedback when selecting option 2 and explanations in both English and Khmer.
4. Test Section 8 and Section 9 tip alert boxes.
5. Test Section 10 self-reflection interactive choice and journal prompts.
6. Test Section 11 action buttons: "1-Minute Calming Breath" and "Match Me With A Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, How to Handle Anxiety Before an Exam

Commit `6fe3367`. No migration. Content and frontend only.

**Why.** Academic testing, parental expectations, and milestone evaluations such as the Grade 12 Bac II national examination in Cambodia trigger acute stress, blank minds, and sleep deprivation. "How to Handle Anxiety Before an Exam" (`how-to-handle-anxiety-before-an-exam`) provides an 8-minute evidence-based psychoeducational guide adapted from WHO, NHS, NIMH, and UNICEF Cambodia. It equips seekers with practical tools to calm physical panic through diaphragmatic breathwork, build structured 25-minute study sprints, reframe catastrophic predictions, avoid all-night cramming, execute a 5-step in-exam reset when minds freeze, stop toxic peer comparisons, and access confidential student counseling on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "How to Handle Anxiety Before an Exam (របៀបដោះស្រាយការថប់បារម្ភមុនពេលប្រឡង)" under the Anxiety category or directly via `/mindguide/learn?open=how-to-handle-anxiety-before-an-exam`.
- **11 Comprehensive Bilingual Sections:** Covers why exam anxiety occurs with Cambodian Bac II context, recognizing signs across mind and body, somatic diaphragmatic breathing, structured study planning with an interactive quiz on active recall vs cramming, cognitive reframing of catastrophic fears, body and sleep care debunking all-nighters, exam day routines (night before and morning of), the 5-step in-exam mind blank reset, separating self-worth from grades, personal reflection for AROM Journal, and next steps connecting to AROM.
- **Tip Alert Box:** Section 3 highlights using AROM's 1-Minute Calming Breath before walking into examination halls.
- **Direct AROM tool integration:** Section 11 provides direct action buttons for "1-Minute Calming Breath" and "Match Me With A Professional".

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_EXAM_ANXIETY` with 4 peer-reviewed citations (WHO, NHS, NIMH, UNICEF Cambodia) and `LESSON_EXAM_ANXIETY`, appending it to `ALL_LESSONS`.
- **Hero Image:** Added `public/mindguide/exam-anxiety-hero.jpg` depicting a serene, organized study desk with morning sunlight, textbooks, notes, and warm tea.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "How to Handle Anxiety Before an Exam" card appears under "Anxiety" filter.
2. Open `/mindguide/learn?open=how-to-handle-anxiety-before-an-exam` and verify hero image, outcomes, and 11 sections render smoothly.
3. Test Section 4 quiz: verify correct feedback when selecting option 2 and explanations in both English and Khmer.
4. Test Section 3 tip alert box.
5. Test Section 10 self-reflection interactive choice and journal prompts.
6. Test Section 11 action buttons: "1-Minute Calming Breath" and "Match Me With A Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, How to Handle Social Anxiety

Commit `87645f7`. No migration. Content and frontend only.

**Why.** Social anxiety, fear of negative evaluation, and the urge to avoid public or group settings frequently prevent seekers from pursuing education, career milestones, and authentic friendships. "How to Handle Social Anxiety" (`how-to-handle-social-anxiety`) provides an 8-minute evidence-based psychoeducational guide adapted from NIMH, NHS, NHS inform, and UNICEF Cambodia. It equips seekers with clear tools to recognize the anxiety avoidance loop, challenge cognitive catastrophizing, design a gradual exposure ladder, soothe physical fight-or-flight sensations with breathwork, debrief interactions without harsh post-event rumination, and access confidential professional therapy on AROM.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "How to Handle Social Anxiety (របៀបដោះស្រាយការថប់បារម្ភក្នុងសង្គម)" under the Anxiety category or directly via `/mindguide/learn?open=how-to-handle-social-anxiety`.
- **11 Comprehensive Bilingual Sections:** Covers what social anxiety is vs shyness, mind and body symptoms, the social anxiety cycle with an interactive quiz on avoidance, the 3-question cognitive restructuring method, gradual exposure ladder design, shifting attention outward, somatic breathing and 3-2-1 grounding, halting post-event rumination, when to seek clinical CBT care, a 6-prompt personal practice reflection for AROM Journal, and next steps connecting to AROM.
- **Tip Alert Boxes:** Section 7 provides an AROM 1-Minute Breath tip before entering social settings, and Section 9 details matching with confidential CBT-trained therapists on AROM.
- **Direct AROM tool integration:** Section 11 provides direct action buttons for "1-Minute Calming Breath" and "Match Me With A Professional".

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_SOCIAL_ANXIETY` with 4 peer-reviewed citations (NIMH, NHS, NHS inform, UNICEF Cambodia) and `LESSON_SOCIAL_ANXIETY`, appending it to `ALL_LESSONS`.
- **Hero Image:** Added `public/mindguide/social-anxiety-hero.jpg` depicting a young person calmly breathing in a sunlit university library cafe.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "How to Handle Social Anxiety" card appears under "Anxiety" filter.
2. Open `/mindguide/learn?open=how-to-handle-social-anxiety` and verify hero image, outcomes, and 11 sections render smoothly.
3. Test Section 3 quiz: verify correct feedback when selecting option 2 and explanations in both English and Khmer.
4. Test Section 7 tip alert box and Section 9 professional care alert box.
5. Test Section 10 self-reflection interactive choice and journal prompts.
6. Test Section 11 action buttons: "1-Minute Calming Breath" and "Match Me With A Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, How to Talk About Your Feelings

Commit `9416865`. No migration. Content and frontend only.

**Why.** Stigmas, cultural reluctance, and fear of being judged often push seekers in Cambodia to hide vulnerable emotions behind "I am fine." "How to Talk About Your Feelings" (`talk-about-feelings`) provides an 8-minute evidence-based psychoeducational guide adapted from NHS Every Mind Matters, UNICEF Cambodia, and CDC. It equips seekers with practical tools to identify tangled emotions, structure non-blaming "I feel" statements, clarify needed support upfront, navigate Cambodian family dynamics with gentle shared moments, practice reflection in AROM Journal, and connect with confidential licensed therapists.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "How to Talk About Your Feelings (របៀបនិយាយអំពីអារម្មណ៍របស់អ្នក)" under the Emotions category or directly via `/mindguide/learn?open=talk-about-feelings`.
- **10 Comprehensive Bilingual Sections:** Covers why talking matters, a 3-step check-in before speaking, choosing an emotionally safe person, opening phrases and the "I feel" method with an interactive quiz, clarifying support needs (listening vs advice vs reassurance), managing tears and somatic tightness, navigating Cambodian family expectations and filial respect, handling dismissive reactions without self-blame, a 4-step reflection framework for AROM Journal, and next steps connecting to AROM.
- **Tip Alert Box:** Section 6 introduces an AROM Voice Journal tip encouraging seekers who feel too nervous to speak to record their reflections privately first.
- **Direct AROM tool integration:** Section 10 provides direct action buttons for "1-Minute Calming Breath" and "Match Me With A Professional" for private therapy sessions.

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_TALK_ABOUT_FEELINGS` with 4 peer-reviewed citations (NHS Every Mind Matters, UNICEF Cambodia, CDC) and `LESSON_TALK_ABOUT_FEELINGS`, appending it to `ALL_LESSONS`.
- **Hero Image:** Added `public/mindguide/talk-about-feelings-hero.jpg` depicting a gentle, supportive conversation between friends in a sunlit courtyard.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "How to Talk About Your Feelings" card appears under "Emotions" filter.
2. Open `/mindguide/learn?open=talk-about-feelings` and verify hero image, outcomes, and 10 sections render smoothly.
3. Test Section 4 quiz: verify correct feedback when selecting option 2 and explanations in both English and Khmer.
4. Test Section 6 tip alert box highlighting AROM Voice Journal.
5. Test Section 9 self-reflection interactive choice and journal prompts.
6. Test Section 10 action buttons: "1-Minute Calming Breath" and "Match Me With A Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, Sadness vs. Depression

Commit `9f4fd84`. No migration. Content and frontend only.

**Why.** Everyday sadness and clinical depression are frequently conflated, causing people to either minimize severe distress or panic over normal grief and disappointment. "Sadness vs. Depression" (`sadness-vs-depression`) provides an 8-minute evidence-based psychoeducational guide adapted from WHO, NIMH, and UNICEF Cambodia. It equips seekers with clear criteria to distinguish temporary emotional sorrow from clinical depressive episodes, recognizes subtle signs like emotional numbness and exhaustion, offers guidance on supporting loved ones without toxic positivity, and seamlessly connects to AROM's private Journal, calming exercises, and verified confidential therapists.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "Sadness vs. Depression (ភាពក្រៀមក្រំ និងជំងឺបាក់ទឹកចិត្ត)" under the Emotions category or directly via `/mindguide/learn?open=sadness-vs-depression`.
- **9 Comprehensive Bilingual Sections:** Covers what sadness is, clinical depression definition and causes, key differences table and interactive quiz, signs of depression across emotional and daily functioning domains, why the distinction matters for treatment, when to seek clinical help (two-week benchmark), how to support friends without dismissive positivity, a 6-prompt self-reflection for AROM Journal, and next steps connecting to AROM.
- **Safety Alert Boxes:** Section 4 includes an emergency safety alert guiding anyone with self-harm thoughts to access immediate crisis hotlines via Profile `Get help now`, and Section 6 highlights confidential private therapist booking in AROM.
- **Direct AROM tool integration:** Section 9 features quick actions to practice the "1-Minute Calming Breath" and "Match Me With A Professional" for private therapy sessions.

**What changed for the team:**
- **`learn-data.ts`:** Exported `REFERENCES_SADNESS_VS_DEPRESSION` with 4 peer-reviewed citations (WHO, NIMH, UNICEF Cambodia) and `LESSON_SADNESS_VS_DEPRESSION`, appending it to `ALL_LESSONS`.
- **Hero Image:** Added `public/mindguide/sadness-vs-depression-hero.jpg` with warm morning sunlight, a journal, and a cup of tea.
- **Strict Anti-AI Compliance:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy.

**What to re-test:**
1. Open `/mindguide/learn` and verify "Sadness vs. Depression" card appears under "Emotions" filter.
2. Open `/mindguide/learn?open=sadness-vs-depression` and verify hero image, outcomes, and 9 sections render smoothly.
3. Test Section 3 quiz: verify correct feedback when selecting option 2 and explanations in both English and Khmer.
4. Test Section 4 emergency notice box and Section 6 tip alert box.
5. Test Section 8 self-reflection interactive choice and journal prompts.
6. Test Section 9 action buttons: "1-Minute Calming Breath" and "Match Me With A Professional".
7. Switch language to Khmer and verify all Kantumruy Pro translations.

## 18 Oct 2026: New Lesson, Build Healthy Relationships

Commit `95e8c13`. No migration. Content and frontend only.

**Why.** Interpersonal connections with family, friends, partners, and colleagues deeply shape emotional wellbeing and resilience. Seekers frequently experience tension balancing family expectations, managing conflict, or asserting personal boundaries. "Build Healthy Relationships" (`build-healthy-relationships`) provides a comprehensive 7-minute guide adapted from Healthdirect Australia, NHS, UNICEF Cambodia, ACOG, and NIH, connecting directly to AROM Community support circles, private Journaling, and verified relationship therapists.

**What changed for users:**
- **New Lesson available in MindGuide Learn:** Seekers can access "Build Healthy Relationships (ការកសាងទំនាក់ទំនងប្រកបដោយសុខភាពល្អ)" under the new Relationships category filter or via `/mindguide/learn?open=build-healthy-relationships`.
- **9 Engaging Sections:** Covers the 6 foundational qualities of healthy connection, "I" statements in communication with an interactive quiz, boundary setting without guilt, constructive disagreement resolution, recognizing warning signs of control or emotional manipulation, navigating Cambodian family expectations and filial gratitude, personal self-advocacy, self-reflection on a relationship, and practical next steps.
- **Safety Alert:** Section 5 includes an emergency safety reminder encouraging seekers facing threats or violence to prioritize physical safety and access immediate crisis hotlines via AROM Profile.
- **Direct AROM tool integration:** Section 9 connects seekers directly to AROM Community support groups (`/community`), private voice and text journaling (`/detection/journal`), and matching with verified therapists and counselors (`/professional`).

**What changed for the team:**
- **`learn-data.ts`:** Added `"Relationships"` to `TopicCategory` and `TOPIC_CATEGORIES`. Exported `REFERENCES_RELATIONSHIPS` with 5 clinical citations and `LESSON_BUILD_HEALTHY_RELATIONSHIPS`, adding it to `ALL_LESSONS`.
- **Hero Image:** Added `public/mindguide/build-healthy-relationships-hero.jpg` displaying a warm, authentic conversation in a natural setting.
- **Anti-AI Copywriting:** Zero em dashes, en dashes, or loose hyphens.

**What to re-test:**
1. Open `/mindguide/learn` and verify "Relationships (ទំនាក់ទំនង)" appears as a category pill.
2. Verify "Build Healthy Relationships" card renders with its hero image and 9 sections.
3. Click through sections 1 to 9: test the Section 2 "I" statement quiz, Section 5 emergency warning box, and Section 8 reflection.
4. In Section 9, test the "1-Minute Calming Breath" and "Match Me With A Professional" action buttons.
5. Switch language to Khmer and verify all Kantumruy Pro translations, quiz options, and reflections.

## 17 Oct 2026: Unlock Calming Racing Thoughts Tip Guide

Commit `21b50bb`. No migration. Content and frontend only.

**Why.** When anxiety spikes or the brain refuses to rest, intrusive looping thoughts overwhelm mental bandwidth. The "Calming Racing Thoughts" (`calming-racing-thoughts`) tip guide was previously locked under "Coming Soon". It is now fully active with 5 evidence-based cognitive and somatic steps adapted from the Anxiety and Depression Association of America (ADAA) and American Psychological Association (APA), connecting directly to AROM's private Journal, guided 4-7-8 Breathing, and professional support.

**What changed for users:**
- **Calming Racing Thoughts is now unlocked:** Seekers can access the 4-minute guide "Calming Racing Thoughts (ការបន្ធូរបន្ថយគំនិតរវើរវាយ)" directly from the MindGuide Tips screen (`/mindguide/tips`).
- **5 Grounding Steps:** Covers naming the mental loop, expressive cognitive offloading in AROM Journal, 5-4-3-2-1 sensory grounding in the physical room, 4-7-8 vagal nerve reset breathing, and scheduling a dedicated 15-minute worry window.
- **Direct AROM tool integration:** Step 2 prompts seekers to unload looping worries into the private AROM Journal, and Step 4 features a one-tap action button to launch 4-7-8 Breathing in AROM.
- **Intrusive Anxiety Support callout:** Connects seekers experiencing debilitating anxiety spirals directly to AROM's verified psychologists and therapists.

**What changed for the team:**
- **`tips-data.ts`:** Exported `TIP_CALMING_RACING_THOUGHTS` and marked `isAvailable: true` in `ALL_TIPS` with complete bilingual steps, tryNow actions, breathing triggers, and clinical citations.
- **Anti-AI Copywriting:** Zero em dashes, en dashes, or loose hyphens.

**What to re-test:**
1. Open `/mindguide/tips` and verify "Calming Racing Thoughts (ការបន្ធូរបន្ថយគំនិតរវើរវាយ)" is unlocked and selectable.
2. Open the tip detail screen and verify the hero image, 5-step checklist, and citation.
3. Tap "Start Reading Tips" and test Step 2 (AROM Journal externalization), Step 3 (sensory grounding), and Step 4 (Start 4-7-8 Breathing action button).
4. Complete the guide and verify XP award and dynamic completion text.
5. Bookmark the tip and verify it renders in the "Saved Tips" screen.

## 17 Oct 2026: Unlock Sleep Hygiene Essentials Tip Guide

Commit `10c2b77`. No migration. Content and frontend only.

**Why.** Sleep difficulties and nighttime racing thoughts are among the most common reasons seekers turn to AROM. The "Sleep Hygiene Essentials" (`sleep-hygiene-essentials`) tip guide was previously locked under "Coming Soon". It is now fully active with 5 evidence-based steps adapted from the American Academy of Sleep Medicine (AASM) and National Sleep Foundation, connecting directly to AROM's private Journal, guided 4-7-8 Breathing, and professional support.

**What changed for users:**
- **Sleep Hygiene Essentials is now unlocked:** Seekers can access the 3-minute guide "Sleep Hygiene Essentials (មូលដ្ឋានគ្រឹះនៃដំណេកលក់ស្រួល)" from the MindGuide Tips screen (`/mindguide/tips`).
- **5 Actionable Steps:** Covers consistent wake times, bedtime brain dump in AROM Journal, 4-7-8 slow breathing, a 60-minute digital sunset, and sleep sanctuary cooling and darkness.
- **Direct AROM tool integration:** Step 2 prompts seekers to unload bedtime clutter into the private AROM Journal, and Step 3 includes a direct action button to launch 4-7-8 Breathing inside AROM.
- **Chronic Insomnia Support callout:** Connects seekers experiencing persistent sleeplessness directly to AROM's verified psychologists and therapists.
- **Dynamic step count and completion:** Updated tip detail header and completion cards to dynamically display the correct step counts and titles for any completed tip.
- **Dynamic Saved Tips view:** The Saved Tips screen now displays any bookmarked tip rather than only the stress guide.

**What changed for the team:**
- **`tips-data.ts`:** Exported `TIP_SLEEP_HYGIENE` and marked `isAvailable: true` in `ALL_TIPS` with complete bilingual steps, tryNow actions, breathing triggers, and clinical citations.
- **`tip-detail-view.tsx` and `tip-complete-view.tsx`:** Made step counts and completion summaries dynamic across all tip formats.
- **`saved-tips-view.tsx`:** Updated to dynamically render all bookmarked items from `ALL_TIPS` and optimized state initialization without effect-based cascading renders.
- **Anti-AI Copywriting:** Zero em dashes, en dashes, or loose hyphens.

**What to re-test:**
1. Open `/mindguide/tips` and verify "Sleep Hygiene Essentials (មូលដ្ឋានគ្រឹះនៃដំណេកលក់ស្រួល)" appears as available (no lock badge).
2. Click the card to open detail view; verify step count shows 5 practical steps (គន្លឹះទាំង ៥).
3. Click "Start Reading Tips" to enter interactive view: test step 2 (AROM Journal mention), step 3 (Start 4-7-8 Breathing button), and add-to-plan buttons.
4. Complete the guide and verify the completion screen displays the dynamic title and xp badge.
5. Bookmark the tip and verify it renders in the "Saved Tips" screen.

## 17 Oct 2026: Connect Section 4 of Better Sleep to AROM Private Journaling

Commit `1e878b0`. No migration. Content and frontend only.

**Why.** When people lie down to sleep, racing worries and unaddressed tasks keep their minds hyper-alert. Instead of only recommending paper, Section 4 now directly connects to AROM's private Journal feature. Seekers can safely release their thoughts through typing or voice recording before bed, knowing their entries are 100% confidential and secure.

**What changed for users:**
- **Evening Brain Dump connects to AROM Journal:** Section 4 highlights using AROM's private Journal to unload bedtime worries, tomorrow's tasks, and emotional reflections.
- **New calm tip box:** Adds a green "Good to know" note explaining how voice recording or typing in AROM clears bedtime anxiety and prepares the mind for deep sleep.
- **Updated key points:** Emphasizes that transferring racing thoughts into the private journal allows the brain to release them and rest.

**What changed for the team:**
- **`learn-data.ts`:** Enhanced Section 4 in `LESSON_BETTER_SLEEP` with bilingual AROM Journal guidance, alertBox, and updated key points.
- **Anti-AI Copywriting:** Zero em dashes, en dashes, or loose hyphens.

**What to re-test:**
1. Open `/mindguide/learn?open=better-sleep` and navigate to Section 4.
2. In English, verify Section 4 refers to "The Evening Brain Dump in AROM Journal" and displays the green tip box about bedtime journaling.
3. Switch to Khmer and verify natural translation, Kantumruy Pro font, and tip box rendering.

## 17 Oct 2026: New Lesson, Better Sleep

Commit `44d7cb8`. No migration. Content and frontend only.

**Why.** Better Sleep was previously a locked "Coming Soon" card in Learn. Sleep debt severely worsens emotional regulation, anxiety, and depression. This lesson provides practical, evidence-based guidance on sleep hygiene, circadian rhythm, managing late-night racing thoughts, and connecting to AROM evening wind-down tools and confidential therapy for chronic insomnia.

**What changed for users:**
- **Better Sleep is unlocked and live in Learn,** 6 min, Beginner, in English and Khmer, with a serene bedroom and window light photo at the top.
- **Categorized under Sleep,** accessible directly from the Sleep filter in Learn without locks.
- **Nine comprehensive sections:** Why sleep matters for mind and body, body clock and sleep drive, common daily sleep disruptors (screens, late caffeine, room climate), managing late-night racing thoughts (evening brain dump and the 20-minute rule), building an evening wind-down routine, an interactive sleep quiz, a personal sleep check in reflection, when chronic insomnia needs professional support on AROM, and closing coping steps.
- **Calm tip boxes:** Calm green "Good to know" notes on morning light anchoring circadian rhythms and when chronic insomnia warrants professional care.
- **Interactive elements:** Section 6 quiz testing the 20-minute stimulus control rule, and Section 7 personal reflection identifying one realistic sleep habit to improve.
- **Four verified health references:** Citations from CDC, NIH, Sleep Foundation, and NHS Every Mind Matters.
- **Actionable closing buttons:** Direct links to Box breathing, Match Me With A Professional, and suicide prevention notice.

**What changed for the team:**
- **`learn-data.ts`:** Replaced placeholder with full `REFERENCES_BETTER_SLEEP` and `LESSON_BETTER_SLEEP` (`isAvailable: true`, removed Coming Soon badge).
- **Anti-AI Copywriting & Formatting:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy. "Wellbeing" and "self care" used throughout.
- **New hero image:** `public/mindguide/better-sleep-hero.jpg`, photo by Suhwa Lee on Unsplash (free Unsplash License), cropped to 2:1.
- **Clinical & translation disclaimer:** Content needs review by a mental health professional, and the Khmer translation should be reviewed by a native speaker.

**What to re-test:**
1. Open Learn at `/mindguide/learn` and verify Better Sleep appears under Sleep without a lock or Coming Soon badge.
2. Read all nine sections in English.
3. In section 6, answer the quiz question and verify the explanation note.
4. In section 7, answer the reflection question and check the gentle feedback note.
5. In section 9, test the Box breathing and Match Me With A Professional buttons, and verify the suicide prevention notice.
6. Open the references accordion and check all 4 external links.
7. Switch to Khmer and verify typography, numerals (៦ នាទី), and complete translation.

## 17 Oct 2026: Connect Section 7 of Know When to Seek Help to AROM Private Booking

Commit `5194692`. No migration. Content and frontend only.

**Why.** Section 7 of Know When to Seek Help previously only cited general Cambodian hospitals and organizations. Users in Cambodia face significant social stigma and fear of gossip when seeking mental health care. Connecting this section directly to AROM highlights how seekers can browse verified therapists, filter by language (Khmer and English), book appointments in 100% digital privacy from their phone without anyone knowing, and access 24/7 crisis hotlines.

**What changed for users:**
- **Section 7 connects directly to AROM:** Titled "Getting Support in Cambodia and on AROM", it explains how seekers can discover verified psychologists, counselors, and partner clinics in Cambodia.
- **Private booking spotlight:** Emphasizes that booking through AROM is 100% confidential. Seekers never have to sit in public waiting rooms where acquaintances might see them, and no friends, family, or employers can ever see their bookings.
- **New calm tip box:** Features a green "Good to know" note reinforcing AROM's clinical grade privacy guarantee.
- **Interactive Match Me button:** Adds direct action shortcuts right inside Section 7, allowing users to immediately tap Match Me With A Professional to open the therapist directory.

**What changed for the team:**
- **`learn-data.ts`:** Updated Section 7 in `LESSON_KNOW_WHEN_TO_SEEK_HELP` with bilingual AROM feature guidance, tip alertBox, action shortcuts, and enhanced key points.
- **Anti-AI Copywriting:** Zero em dashes, en dashes, or loose hyphens.

**What to re-test:**
1. Open `/mindguide/learn?open=know-when-to-seek-help` and navigate to Section 7.
2. In English, verify the title reads "Getting Support in Cambodia and on AROM", the paragraphs explain AROM's private booking, the green tip box appears, and the Match Me button is clickable.
3. Switch to Khmer and verify the Khmer translation, formatting, and buttons render cleanly.

## 17 Oct 2026: New Lesson, Know When to Seek Help

Commit `82bebd6`. No migration. Content and frontend only.

**Why.** Seekers often wonder whether their difficulties are normal, how long they should wait before asking for help, and who they can turn to. This lesson provides clear, compassionate guidance on recognizing emotional and physical signs that need support, overcoming cultural hesitation and stigma in Cambodia, supporting friends in distress, and responding immediately to mental health emergencies.

**What changed for users:**
- **Know When to Seek Help is live in Learn,** 6 min, Beginner, in English and Khmer, with a serene monsoon rain on glass photo at the top.
- **Categorized under Basics,** accessible directly from the Basics filter in Learn alongside What Is Mental Health?.
- **Nine structured sections:** Identifying emotional distress, when to seek help vs wait and see, choosing someone to talk to (with sample starter phrases), overcoming shame and stigma in Cambodia, how to support a friend with care, critical emergency crisis signs, finding support services in Cambodia, an interactive personal check in reflection, and closing coping steps.
- **Emergency alert box:** Section 6 displays a red medical warning highlighting immediate safety steps for crisis or thoughts of self harm.
- **Calm tip box:** Section 2 features a calm green "Good to know" note reassuring users that they never have to reach a breaking point before seeking help.
- **Interactive reflection:** Section 8 presents an interactive check in to explore where support is needed most, alongside 6 personal journal reflection prompts.
- **Four verified health references:** Citations from NIMH (Caring for Your Mental Health, My Mental Health: Do I Need Help?), UNICEF Cambodia, and WHO.
- **Actionable closing buttons:** Direct links to Box breathing, Match Me With A Professional, and suicide prevention notice.

**What changed for the team:**
- **`learn-data.ts`:** Added `REFERENCES_SEEK_HELP` and `LESSON_KNOW_WHEN_TO_SEEK_HELP` to `ALL_LESSONS`.
- **Anti-AI Copywriting & Formatting:** Zero em dashes, en dashes, or loose hyphens across all English and Khmer copy. "Wellbeing" and "self care" used throughout.
- **New hero image:** `public/mindguide/know-when-to-seek-help-hero.jpg`, photo by Max Bender on Unsplash (free Unsplash License), cropped to 2:1.
- **Clinical & translation disclaimer:** Content needs review by a mental health professional, and the Khmer translation should be reviewed by a native speaker.

**What to re-test:**
1. Open Learn at `/mindguide/learn` and verify Know When to Seek Help appears under Basics without a lock.
2. Read all nine sections in English.
3. Verify section 2 shows the green "Good to know" tip box and section 6 shows the red emergency safety warning.
4. Answer the reflection question in section 8 and verify the feedback note appears.
5. In section 9, check the Box breathing and Match Me With A Professional buttons, and verify the suicide prevention notice.
6. Open the references accordion and confirm all 4 external links work.
7. Switch to Khmer and verify typography, numerals (៦ នាទី), and complete translation.

## 17 Oct 2026: New Lesson, Understand Yourself

Commit `ae4d761`. No migration. Content and frontend only.

**Why.** Following What Is Mental Health?, seekers need practical guidance to recognize their emotions, examine automatic thoughts, discover their personal values, and identify personal needs. This new lesson brings structured self awareness practices with Cambodian youth context, safe person communication, and clinical care pathways.

**What changed for users:**
- **Understand Yourself is live in Learn,** 7 min, Beginner, in English and Khmer, with a reflective journal photo at the top.
- **Categorized under Emotions,** accessible directly from the Emotions filter in Learn without locks.
- **Nine comprehensive sections:** What self awareness means, getting to know emotions, understanding and questioning thoughts, what influences mood and personal patterns, discovering needs and values, an interactive reaction check in reflection, navigating self reflection difficulties and stigma in Cambodia, a guided 6 question self reflection journaling prompt, and coping quick actions.
- **Calm tip box:** Section 2 features a calm green "Good to know" note guiding a 3 step mood check in.
- **Two interactive reflection sections:** Section 6 lets users explore their natural response to stress, and Section 8 helps them select which journaling prompt to explore first.
- **Four verified health references:** Authoritative sources from UNICEF Adolescent Mental Health Hub, UNICEF Cambodia, and WHO Self Care.
- **Actionable closing section:** Quick links to Box breathing, Match Me With A Professional, and suicide prevention hotline guidance.

**What changed for the team:**
- **`learn-data.ts`:** Added `REFERENCES_UNDERSTAND_YOURSELF` and `LESSON_UNDERSTAND_YOURSELF` to `ALL_LESSONS`, removing the coming soon placeholder.
- **Anti-AI Copywriting & Formatting:** All em dashes, en dashes and loose hyphens removed in accordance with AROM standards. "Wellbeing" and "self care" used throughout.
- **New hero image:** `public/mindguide/understand-yourself-hero.jpg`, photo by Aaron Burden on Unsplash (free Unsplash License), cropped to 2:1.
- **Clinical & translation disclaimer:** Content needs review by a mental health professional, and the Khmer translation should be reviewed by a native speaker.

**What to re-test:**
1. Open Learn at `/mindguide/learn` and verify Understand Yourself appears under the Emotions category without a lock.
2. Open the lesson and read all nine sections in English.
3. Check section 2 shows the calm green "Good to know" tip box.
4. Answer the reflection question in section 6 and confirm the feedback note appears.
5. In section 8, verify the 6 self reflection journal prompts and select a focus question.
6. In section 9, test the Box breathing and Match Me With A Professional buttons, and verify the suicide prevention notice.
7. Expand the references accordion and check all 4 external links.
8. Switch to Khmer and verify typography, numerals (៧ នាទី), and complete translation.

## 17 Oct 2026: New Lesson, What Is Mental Health?

Commit `e4f046e`. No migration. Content and frontend only.

**Why.** Learn had no starting point for people new to the topic. This lesson, written by the team, explains what mental health is, why it matters for everyone, and small ways to look after it, with Cambodian family life in mind.

**What changed for users:**
- **What Is Mental Health? is the first lesson in Learn,** 5 min, Beginner, in English and Khmer, with a rice field photo at the top.
- **A new Basics filter** in Learn, next to Stress and Anxiety.
- **Nine sections:** what mental health is, why it matters, whether sad or worried feelings are normal, what affects mental health, five ways to take care of it, three check in questions (one per section), and a closing section with next steps and Get help now.
- **Three references** (WHO Mental health, UNICEF Cambodia, WHO Self care), cited only where the page says the same thing.
- **Tip boxes look calm now.** A lesson note marked as a tip shows in green as "Good to know". Before, every note showed as a red "Important Health Warning".

**What changed for the team:**
- **`learn-data.ts`:** new `Basics` category, `REFERENCES_MENTAL_HEALTH` and `LESSON_WHAT_IS_MENTAL_HEALTH`, first in `ALL_LESSONS`.
- **Edits to the supplied text:** dashes and hyphens removed (the AROM style), "well-being" written as "wellbeing", the three reflection questions split into sections 6 to 8 because a section holds one question, and the closing links changed to things that exist (Stress and Anxiety lessons, breathing, Match Me). The tip "How to Handle an Overwhelming Day" and the podcast do not exist yet. A Get help now line was added to the closing section.
- **New image** `public/mindguide/what-is-mental-health-hero.jpg`, photo by Mufid Majnun on Unsplash (free Unsplash License), cropped.
- **`lesson-screen.tsx`:** `alertBox.type` now decides the look: `tip` is green, `emergency` is red.
- **Needs review:** a native Khmer speaker should read the Khmer translation.

**What to re-test:**
1. Open Learn and check What Is Mental Health? is first, with no lock, and the Basics filter shows only it.
2. Read all nine sections in English. Answer the three check in questions and check each shows its note.
3. Check section 3 shows a green "Good to know" box, and Understanding Anxiety section 2 still shows the red warning.
4. Switch to Khmer and read the sections again.
5. Open the references and check there are three and each link opens.

## 17 Oct 2026: No More Fake Lesson Progress, and the Two Dev Warnings Fixed

Commit `572e2ef`. No migration. Frontend only.

**Why.** `npm run dev` showed "2 Issues" on every page. One was a hydration error: the server built the Learn page without saved progress, but the browser added a made up "3 of 5" for Learn About Stress, so the two versions did not match and React rebuilt the page. That same made up value meant every new user saw "Continue Learning, 3 of 5" and every lesson showed as bookmarked before they had opened anything. The other warning came from an old script in the page head that cleared a dark mode setting removed in September.

**What changed for users:**
- **New users start at zero.** Learn no longer shows a Continue Learning card until you finish a section, and the lesson button says Start Learning.
- **Bookmarks start empty.** A lesson shows as bookmarked only after you bookmark it.
- **No flicker on Learn pages.** Saved progress and bookmarks appear once the page loads, without React rebuilding the page.
- **"3 of 5 sections completed"** in English (it said "lessons", but it counts sections).

**What changed for the team:**
- **New `app/_components/learn/use-lesson-storage.ts`:** `useLessonProgress` and `useLessonBookmarked` read localStorage through `useSyncExternalStore`, so the server and the first browser render agree.
- **`learn-data.ts`:** removed the fake Stress progress and the default bookmark; added `EMPTY_LESSON_PROGRESS`; `toggleLessonBookmark` fires `arom_bookmarks_updated` so open screens update.
- **Learn home, lesson overview and lesson complete** use the new hooks.
- **`app/layout.tsx`:** removed the old dark mode cleanup script.

**What to re-test:**
1. In a private window, open Learn. Check there is no Continue Learning card and no "Issues" badge in dev.
2. Open Learn About Stress and check the button says Start Learning and the bookmark is empty.
3. Finish two sections, go back, and check the button says Continue Learning (Section 3) and Learn shows "2 of 5 sections completed".
4. Bookmark a lesson, reload, and check it stays bookmarked. Remove it and check it clears.
5. Switch to Khmer and repeat step 1.

## 17 Oct 2026: New Lesson, Understanding Anxiety

Commit `3ca5418`. No migration. Content and frontend only.

**Why.** MindGuide had one finished lesson (Learn About Stress). Understanding Anxiety was a locked "Coming Soon" card with nothing inside. Anxiety is the most common mental health condition in the world, so it is the most useful next lesson. Content is now written in code, not in the admin MindGuide editor, because user screens read the code.

**What changed for users:**
- **Understanding Anxiety is open** in Learn, with a new photo at the top, 7 min, Beginner, in English and Khmer.
- **Five sections:** what anxiety is, what it can feel like (including panic attacks and a chest pain emergency warning), a quiz on calming a panic attack, a check in question, and what helps (slow breathing, the 5 4 3 2 1 grounding method, daily habits, when to get support, and Get help now).
- **Eight references** from WHO, NIMH, NHS and University of Rochester Medical Center, each checked online.
- **A lesson in the Saved list opens that lesson.** Before, tapping any saved lesson opened Learn About Stress. The Saved list itself is still sample data, so bookmarking a lesson does not add it there yet.
- **Reference counts are correct for each lesson.** The headings said "[1] to [6]" for every lesson. The health warning title and the Match Me button no longer show a Stress only citation number.

**What changed for the team:**
- **`learn-data.ts`:** new `REFERENCES_ANXIETY` and `LESSON_UNDERSTANDING_ANXIETY`, in the same shape as the Stress lesson.
- **New image** `public/mindguide/understanding-anxiety-hero.jpg`, photo by Jared Rice on Unsplash (free Unsplash License), cropped to the hero shape.
- **Needs review:** a professional on the team should read the content, and a native Khmer speaker should read the Khmer.
- **Admin MindGuide editor:** the lesson now appears there as live version 1, but publishing from the editor still does not change what users see.

**What to re-test:**
1. Open Learn and check Understanding Anxiety has no lock and opens.
2. Read all five sections in English, answer the quiz and the check in, then finish the lesson.
3. Switch to Khmer and read the sections again.
4. Open the references and check there are eight and each link opens.
5. Open Saved, tap Learn About Stress, and check it still opens.
6. Open Learn About Stress and check it still says [1] to [6] and works as before.

## 17 Oct 2026: Demo Data Notice Only Where Data Is Still Sample

Commit `ef99384`. No migration. Frontend only.

**Why.** After the backend for seven admin features was merged, the admin still showed "Demo data on this page. Changes reset when you refresh." on Bookings, Reports, Settings, MindGuide and Community. Those pages now save to the database, so the notice told admins their work would be lost when it was not. The list of real pages in the admin shell had not been updated.

**What changed for users:**
- **Nothing on user screens.** This only changes the admin area.

**What changed for the team:**
- **The page wide notice is gone.** The admin shell no longer keeps a list of real data pages.
- **The notice now sits on the two parts still on sample data:** the Podcasts tab in MindGuide and the Activities tab in Community, through a new `DemoDataNotice` component in `app/admin/_components/demo-data-notice.tsx`.

**What to re-test:**
1. Open Admin Bookings, Reports, Settings, Community (Groups and Reports tabs), MindGuide and a lesson in the MindGuide editor. Check no demo notice shows.
2. Open MindGuide, Podcasts tab, and Community, Activities tab. Check the notice "Demo data in this section. Changes reset when you refresh." shows.

## 17 Oct 2026: Seven Admin Features Now Use the Database

Commit `c43e8dc`. Seven migrations must be run in Supabase, in order: `20261017000100_admin_bookings.sql`, `20261017000200_support_contact.sql`, `20261017000300_announcements.sql`, `20261017000400_content_reports.sql`, `20261017000500_community_moderation.sql`, `20261017000600_crash_reports.sql`, `20261017000700_mindguide_content.sql`. Each was run on a test database (PGlite with Supabase stand ins) with 120 checks, all passing.

**Why.** Seven parts of AROM still ran on sample data or saved only in one browser: the admin bookings chart, the support contact, announcements, Report a problem, crash tracking, community moderation and the MindGuide editor. Admins saw made up records, and what users sent never reached the team.

**What changed for users:**
- **Announcements** that admins publish now show at the top of every page, for everyone, until they end.
- **Get help now** shows the AROM support email, phone and hours once an admin sets them.
- **Report a problem** on lessons, tips and practices now reaches the AROM team. Signed out visitors are asked to log in. Five reports a day each.
- **Community:** reports on a person, message, image or group reach the team. A message the team removes shows as removed to everyone. A person the team removes cannot rejoin that group. A closed group stays readable for its members, but nobody can post, join or find it.
- **Error screens** now say "The AROM team has been told", because crashes are sent. Only the error, the page path and the app version are sent: never anything a person wrote.
- **Bookings:** when the AROM team cancels a session in an emergency, the client and the professional see "The AROM team cancelled this session" with the reason.

**What changed for the team:**
- **Admin Bookings** lists real bookings and the chart counts them, but never shows who booked (the client column says Private). Emergency cancel frees the time and is audit logged. The sample bookings are deleted.
- **Admin Settings:** the support contact and announcements are saved in the database and audit logged.
- **Admin Reports** lists real reports without the reporter and closes them per item, audit logged.
- **Admin Community** lists real groups; create, edit (verified mentor required, 2 to 10 members), shut down, reopen, and resolve reports all save in the database and are audit logged. View chat uses the audited endpoint. The group form no longer offers per group rules or an anonymous switch, which nothing stored. Group activities are still sample data.
- **Admin Overview crash card** reads the last 7 days from the database.
- **MindGuide editor** saves drafts, publishes versions, hides, restores and deletes in the database, with the no overwrite check and the same publish rules on the server. Items stay as written in code until an admin first changes them. User screens still read lessons, tips and practices from the code.
- **New controllers:** `announcements-controller.ts`, `reports-controller.ts`, `community-admin-controller.ts`, `crash-controller.ts`, `content-controller.ts`; bookings in `admin-controller.ts`, support contact in `crisis-controller.ts`. The audit log page describes every new action.
- **BACKEND-HANDOFF.md:** status board and sections 9, 10, 12, 13, 14, 15 and 23 updated.

**What to re-test:**
1. Run the seven migrations in order.
2. Admin, Bookings: check real bookings show, the client shows as Private, and Emergency cancel needs a reason. Then sign in as that client and check "The AROM team cancelled this session" with the reason.
3. Admin, Settings: save a support email and phone, then open Profile as a user and check Get help now shows them.
4. Publish an announcement with a link such as /mindguide, check the banner on Home while signed out, then End it and reload.
5. As a user, report a problem on a lesson section. As an admin, check it under Reports without the reporter, then close it as Fixed.
6. Community: as a member, report a message. As an admin, open Reports, remove it, and check members see it as removed. Shut the group down and check members cannot post. Reopen it.
7. Admin, Community: create a group with a verified mentor, then edit its name and check `/community`.
8. Open the browser console on any page and run `fetch('/api/crash-reports',{method:'POST',body:JSON.stringify({kind:'render',message:'Test crash',route:'/',release:'local',digest:null,occurredAt:new Date().toISOString()})})`, then check the Overview crash card.
9. MindGuide editor: save a draft, open the same item in a second tab, save there, and check the first tab says another admin saved it. Publish, hide, show again and restore an old version. Check each appears in the Audit log.

## 17 Oct 2026: Password Checklist on Sign Up

Commit `3f72399`. No migration. Frontend only, the password rules did not change.

**Why.** A new password must have 8 characters, a lowercase letter, an uppercase letter, a number and a special character, but the sign up form only showed one rule at a time, after the person got it wrong. People had to guess the next rule by failing again. Rith asked for every rule to show at once, with a check when it is met and a cross when it is not.

**What changed for users:**
- **All five rules show under Password** from the start: at least 8 characters, a lowercase letter, an uppercase letter, a number and a special character.
- **Each rule ticks as you type:** a green check when it is met, a grey cross when it is not yet.
- **After leaving the field or pressing Create Account,** any rule still missing turns red and the field is outlined in red, so it is clear what is left.
- Screen readers hear each rule with "done" or "not yet".

**What changed for the team:**
- `lib/auth.ts`: new `PASSWORD_RULES` (label and test for each rule) and `MAX_PASSWORD_LENGTH`. `signupSchema` checks the password with these same rules, so the form, the checklist and the server can never disagree.
- `auth-input.tsx`: new optional `hint` (shown under the field and linked with `aria-describedby`) and `invalid` (red outline without an error line).
- `signup-form.tsx`: new `PasswordChecklist`. The only error line left under Password is the 72 character limit.

**What to re-test:**
1. Open Sign up: all five rules show with grey crosses.
2. Type `abc`: only "A lowercase letter" turns into a green check.
3. Type `Abcdefg1!`: all five are green checks.
4. Type `1222sd`, click into Confirm password: the field turns red and the missing rules (8 characters, uppercase, special character) turn red.
5. Create an account with a password that meets every rule: sign up works as before.

## 17 Oct 2026: Spin to Choose Who Goes Next in Truth or Dare

Commit `8e4ed3f`. No migration. Frontend only.

**Why.** Rith wanted Truth or dare to feel more fun with a spin, like spin the bottle. A bottle was avoided because "spin the bottle" is known as a kissing game, which does not fit a mental health app for students; a big green leaf with the AROM sprout keeps it cute and on brand.

**What changed for users:**
- **Every turn starts with a spin:** a round board with a colored slice and a name chip for each player, a big green leaf as the pointer and the cheering sprout in the middle. Press Spin, the leaf turns about five times and slows down (small vibrations on phones), then lands.
- **The picked name pops in yellow,** "Dara's turn!" shows at the top, and a moment later Dara chooses Truth or Dare. The card, Pass and Switch work as before. Done goes back to the spin.
- **Fair spin:** everyone is picked once before anyone goes twice, and never the same person twice in a row.
- **Reduce motion:** no long spin; the leaf moves straight to the person.
- How to play explains the spin and that it is fair.

**What changed for the team:**
- New `app/play-cards/_components/spin-wheel.tsx`: `SpinWheel`, `spinTarget()` (lands inside the picked player's slice after five turns) and `fairPick()`.
- `truth-or-dare-view.tsx`: each turn has phases spin, spinning, landed, choose, then the card; the game keeps the leaf angle and who is left this round.

**What to re-test:**
1. Start Truth or dare with 4 players, press Spin: the leaf spins and lands on a name, which pops in yellow.
2. Spin 8 times: in the first 4 and the next 4, everyone is picked once, and nobody twice in a row.
3. Choose Truth or Dare, press Done: you are back at the spin.
4. Turn on Reduce motion: the leaf goes straight to the person.

## 17 Oct 2026: Simpler Players Card on the Game Hub

Commit `3aef62d`. No migration. Frontend only.

**Why.** The "Games 3" and "Winners: None, all of us" boxes looked crowded on phones and added little.

**What changed for users:**
- **The players card on Play with friends** now shows only the "One phone" badge, the big player count and the names.

**What changed for the team:**
- `app/play-cards/_components/hub-view.tsx`: the two stat boxes are removed.

**What to re-test:**
1. Open Play with friends on a phone and a laptop: no Games or Winners boxes, and the player list still works.

## 17 Oct 2026: Home Right Column Starts Level with the Plan Card

Commit `20da7d8`. No migration. Frontend only.

**Why.** Rith wanted the quote to stay at the top of the right column on laptops, but lower, so it lines up with the top of the green plan card instead of the top of the sprout picture. The previous change had moved the quote under the plan, which was not what he meant.

**What changed for users:**
- **Laptops:** the right column (quote, then mood check in, then Your Progress) starts level with the top of Your Plan For Today. The sprout picture sits above the plan only.
- **Phones:** no change (picture, plan, quote, mood check in, progress).

**What changed for the team:**
- `daily-plan-card.tsx`: the sprout picture is now its own `PlanBanner` (with `tuck`); `DailyPlanCard` no longer takes `tuckBanner`.
- `arom-main-view.tsx`: on laptops the picture has its own grid row, so the plan and the right column share the next row.

**What to re-test:**
1. On a laptop, the top of the quote card lines up with the top of the green plan card, at different window widths.
2. On a phone, the order is the same as before.

## 17 Oct 2026: Better Home Layout on Laptops, and a Tidier Plan

Commit `5d66001`. No migration. Frontend only.

**Why.** On laptops the right side of Home ended after the mood check in, leaving empty space, while Your Progress sat alone at the bottom. Rith also spotted a duplicate "Try now: Cut what you control" in the plan and some lines starting in lowercase.

**What changed for users:**
- **Laptops:** the left column has Your Plan For Today with the day's quote under it; the right column has the mood check in with Your Progress under it. Both columns end at about the same height.
- **Phones:** no change in order (plan, quote, mood check in, progress).
- **No duplicate ready made tasks:** if the same ready made task appears twice (for example a starter and an older saved "Try now" with the same words), the copy is removed when the plan loads. Older saved items are no longer moved in if the same task is already there. Tasks people typed themselves are never removed.
- **Plan lines start with a capital letter,** also for older saved items ("Drop or delay one thing...").

**What changed for the team:**
- `arom-main-view.tsx`: new two column layout. `progress-dashboard.tsx`: smaller top margin.
- `daily-plan-store.ts`: `removeDuplicateTasks()` runs once after the plan loads (non custom tasks with the same words), and the browser move skips matching titles. `daily-plan-card.tsx`: `firstUpper()` on titles and subtitles.

**What to re-test:**
1. On a laptop, open Home: quote under the plan, Your Progress under the mood check in.
2. On a phone, the order is the same as before.
3. In an account that had two "Try now: Cut what you control", reload Home: only one remains.

## 17 Oct 2026: No Extra Profile Circle on Laptops

Commit `e47ed13`. No migration. Frontend only.

**Why.** On laptops the top of each page showed a lone profile circle. It is there on phones, where the top bar holds the AROM logo, menu and profile, but on laptops the sidebar already has all three, including the account menu at the bottom.

**What changed for users:**
- **Laptops:** the top header (and its profile circle) is gone, so pages start with their title.
- **Phones and tablets:** no change. The logo, menu button and profile circle are still at the top.

**What changed for the team:**
- `app/components/top-header.tsx`: the whole header is `lg:hidden`. It is used by Home, Progress, Journal, Community and the Play with friends pages.

**What to re-test:**
1. On a laptop, open Home, Progress, Journal and Play with friends: no profile circle at the top, and the sidebar account menu still opens Profile and Settings.
2. On a phone, the top header looks the same as before.

## 17 Oct 2026: Game Pages Use AROM's Usual Background

Commit `8f668bb`. No migration. Frontend only.

**Why.** Next to the white sidebar, the cream background made the game hub look like a different app. Pure white would have flattened the white cards, so the pages now use AROM's usual very light mint gray, like Home and Progress.

**What changed for users:**
- **The game hub and the Truth or dare and Guess the animal setup pages** use the same light background as the rest of AROM. The bold cards, borders and colors stay.
- **Full screen games and end screens keep the warm cream,** since there is no sidebar there.
- **The sidebar item is now "Play with friends"** (លេងជាមួយមិត្តភក្តិ), the same as the page title.

**What changed for the team:**
- `hub-view.tsx`, `truth-or-dare-view.tsx`, `guess-animal-view.tsx`: pages with the sidebar use `bg-canvas`; `BOLD.page` (cream) is for full screen views. `navigation-config.ts`: new item title.

**What to re-test:**
1. Open Play with friends on a computer: the page background matches Home and the sidebar looks part of the same app.
2. Start a game: the game screen is still cream.

## 17 Oct 2026: Info Buttons on the Game Setup Questions

Commit `e04f559`. No migration. Frontend only.

**Why.** Rith found "Time for each turn" and "How many times around the table?" unclear. Hover tooltips do not work on phones, so each question now has a small (i) button that works by tap or click.

**What changed for users:**
- **Guess the animal:** (i) next to "Time for each turn" explains it is how long each player has before passing the phone, doing as many animals as they can. (i) next to "How many times around the table?" explains 1× and 2×, with the real number of turns for your group.
- **Truth or dare:** (i) next to "How many turns?" explains one turn is one truth or dare for one person.
- Tap again, tap anywhere else or press Escape to close. In Khmer too.

**What changed for the team:**
- `bold-parts.tsx`: new `HeadingWithInfo` (button with `aria-expanded`, closes on outside tap and Escape), used in `guess-animal-view.tsx` and `truth-or-dare-view.tsx`.

**What to re-test:**
1. On a phone, open Guess the animal and tap each (i): the explanation opens, and closes when you tap elsewhere.
2. Do the same on Truth or dare, in English and Khmer.

## 17 Oct 2026: Play with Friends Becomes a Game Hub with Three Games

Commit `bad6957`. No migration. Frontend only, nothing is saved.

**Why.** Rith wanted Play Cards with Friends to offer more ways to play, in a bold, fun look like a reference design: Mental health cards, Truth or dare, and Guess the animal. Lighter games make it easy for friends to start, and laughter is good for stress too.

**What changed for users:**
- **`/play-cards` is now a game hub** in a bold style (thick outlines, hard shadows, bright colors): add who is playing once, see "3 players", "Games 3", "Winners: None, all of us", and pick a game from three big tiles.
- **Mental health cards** moved to `/play-cards/mental-health` and work as before, with an "All games" link and the shared players.
- **Truth or dare (new):** choose Chill or Silly and 10, 20 or 30 turns, agree to kind house rules (keep it kind, pass any time, safe dares only), then each player picks Truth or Dare. Pass gives another one, Switch changes truth to dare or back. 48 cards, all safe: no private questions, no danger, no touching, nothing posted online.
- **Guess the animal (new):** choose 45, 60 or 90 seconds and how many times around the table. "Only you look!", then an animal (40, several from Cambodia) and a countdown; act, make the sound or give clues; Got it or Skip. "Time's up!" shows that turn's count; the end shows "You guessed N animals together", no winners.
- Each game has How to play, the English / Khmer switch, "Plan the next hangout" and Play again.

**What changed for the team:**
- **Shared players:** `app/play-cards/layout.tsx` with `players-provider.tsx` (memory only).
- **New:** `hub-view.tsx`, `truth-or-dare-view.tsx`, `guess-animal-view.tsx`, `bold.ts`, `bold-parts.tsx`, `bold-end-screen.tsx`, `guide-sheet.tsx`, `_data/truth-or-dare.ts`, `_data/animals.ts`, and pages under `mental-health/`, `truth-or-dare/`, `guess-animal/`. `rules-sheet.tsx` takes a game's own rules.
- **Docs:** `BACKEND-HANDOFF.md` section 28 describes the hub. Still no backend needed.
- **Before launch:** a Khmer speaker should read the new Truth or dare and animal names (drafted by Claude).

**What to re-test:**
1. Open Play with friends, add 2 friends, check the three tiles.
2. Truth or dare: Chill, 10 turns, agree, pick Truth, press Switch, press Pass, press Done until the end.
3. Guess the animal: 45 seconds, press I'm ready, Got it twice, Skip once, wait for Time's up, go to the next player, finish.
4. Mental health cards: still plays as before, and All games returns to the hub with the same players.
5. Open a game page directly without friends: it asks you to add players first.
6. Switch to Khmer on the hub and in each game.

## 17 Oct 2026: A Better Picture on the Play Cards Banner

Commit `fb5bf48`. No migration. Frontend only.

**Why.** Rith felt the right side of the Play Cards banner could look better. The cards were small and stuck to the top, the middle card blended into the green, the side cards were cut off and unclear, and the sprout covered the cards at an odd spot.

**What changed for users:**
- **A fan of three real looking cards:** a Warm up and a Care card face (their colors, icon and a few text lines) and, in the middle, the same AROM card back as in the game, with a white border so it stands out from the green.
- **The sprout presents the cards** from the front, with a soft glow.
- **The cards float very gently.** They stay still when Reduce motion is on.
- **Fits every screen:** beside the title on phones (the text never sits under the cards), centered and larger on wider screens, with a little more room in the banner.

**What changed for the team:**
- `app/play-cards/_components/setup-screen.tsx`: new `HeroFan` and `HeroFaceCard`; the title and text are 56% wide on phones.

**What to re-test:**
1. Open Play Cards on a phone, in English and Khmer: the title and text are not covered by the cards.
2. Open it on a computer: the fan sits inside the banner and does not touch its edges.

## 17 Oct 2026: Ten More Play Cards

Commit `f8db203`. No migration. Frontend only.

**Why.** Rith sent 11 questions for Play Cards with Friends. One ("What song is your #1 mood booster?") was already in the deck as "What song always makes you feel better?", so it was not added twice. The other 10 are new.

**What changed for users:**
- **Warm up (6 new):** a time you would not want to be anywhere else, the best advice you have received, what makes you cringe, when you feel most energetic, where you find joy, your last "movie moment".
- **Getting real (2 new):** what you do when you need to feel most like yourself, whether students should get mental health days.
- **Care (2 new):** your #1 supporter, your favorite thing about yourself.
- The deck now has 71 cards: 26 Warm up, 23 Getting real, 22 Care. All have Khmer.

**What changed for the team:**
- `app/play-cards/_data/cards.ts`: cards `warm-21` to `warm-26`, `real-22`, `real-23`, `care-21`, `care-22`. `BACKEND-HANDOFF.md` section 28 says 71 cards.
- The Khmer was drafted by Claude and should be read by a Khmer speaker with the rest.

**What to re-test:**
1. On the setup screen, the deck tiles show 26, 23 and 22 cards.
2. Play a few rounds of each level and check the new cards read well in English and Khmer.

## 17 Oct 2026: New Play Card About Healing Social Media Pages

Commit `8225eb4`. No migration. Frontend only.

**Why.** Rith added a question about the social media pages people turn to on a bad day, a natural, low pressure way to talk about what helps.

**What changed for users:**
- **New Getting real card:** "Is there a page on social media (Instagram, Facebook, TikTok, etc.) that you go to on a bad day that gives you life? What about that page feels healing for you?", with Khmer. The deck now has 61 cards (21 in Getting real).
- **Long cards use slightly smaller words** so they always fit on the card, in both languages.

**What changed for the team:**
- `app/play-cards/_data/cards.ts`: card `real-21`. `game-screen.tsx`: text over 110 characters uses a smaller size. `BACKEND-HANDOFF.md` section 28 says 61 cards.

**What to re-test:**
1. Play the Getting real deck until this card appears (or Pass until it does): the whole question fits, in English and Khmer.

## 17 Oct 2026: Swipe the Cards Like Flashcards

Commit `4ce7cc7`. No migration. Frontend only.

**Why.** Rith wanted the cards to work like flashcards: swipe instead of hunting for buttons while the phone is being passed around.

**What changed for users:**
- **Once a card is flipped, swipe right for Done** (the phone goes to the next person) **and left for Pass** (the same person gets a different card).
- **While you drag,** the card tilts and a green "Done" or orange "Pass" label fades in, so you see what letting go will do. A short swipe springs back.
- The card flies off in the direction you chose. Lighter card still sinks down.
- A small hint under the card says "Swipe left to pass, right when done". The buttons are still there.
- **On a computer,** the right arrow key is Done and the left arrow key is Pass (not while a window is open).
- How to play mentions swiping.

**What changed for the team:**
- `game-screen.tsx`: the card uses Motion `drag="x"` with a 110px or 600px/s threshold, tilt and labels from the drag position; exits are now `next` (right), `pass` (left) and `lighter` (down).
- `play-cards-view.tsx`: Lighter card uses the `lighter` exit. `how-to-play-sheet.tsx`: swipe wording.

**What to re-test:**
1. Flip a card and swipe right: the next person's turn starts.
2. Flip a card and swipe left: the same person gets a new card.
3. Drag a little and let go: the card springs back.
4. Scroll the page up and down on a phone while touching the card: scrolling still works.
5. On a computer, press the left and right arrow keys on a flipped card.

## 17 Oct 2026: Play Cards Gets How to Play and a Language Switch

Commit `b457217`. No migration. Frontend only.

**Why.** Rith asked for a round button that explains how to play, and for a way to switch between Khmer and English during a game, because friends at the same table may read different languages.

**What changed for users:**
- **A round "?" button** in the game's top bar, and a **How to play** button on the setup screen, open a short guide: the 3 steps, what each button does (Pass, Lighter card, Need support, Close), the 4 card types and the 3 levels.
- **An EN / ខ្មែរ switch** in the game's top bar and on the setup screen. Switching keeps the same card and turn, only the words change. The chosen language is dark green.
- The small level icon in the top bar was replaced by these two buttons; the level still shows on each card.

**What changed for the team:**
- New `how-to-play-sheet.tsx` and `language-toggle.tsx` in `app/play-cards/_components/`. The switch uses the app's language setting, so the rest of AROM follows the choice.

**What to re-test:**
1. On the setup screen, press How to play, read it, press Got it.
2. In a game, press the round ? button: the guide opens over the game and closing it returns to the same card.
3. In a game, tap ខ្មែរ then EN: the card, names and buttons switch language and the game continues.

## 17 Oct 2026: Play Cards Explains Pass and Lighter Card

Commit `1b19312`. No migration. Frontend only.

**Why.** Rith did not know what Pass and Lighter card do. A hover tooltip would not help on phones, where most people play, so the explanation now sits inside each button.

**What changed for users:**
- **Pass** now says "Get a different card" underneath. **Lighter card** says "An easier question". Both in Khmer too.
- **On a computer,** pointing at either button shows a fuller tooltip ("Skip this card and get another one. No reason needed." and "Swap to an easier card from the level before, when this one feels too heavy.").

**What changed for the team:**
- `app/play-cards/_components/game-screen.tsx`: two line buttons with a `title` tooltip.

**What to re-test:**
1. Play a Getting real card: both buttons show their short explanation.
2. On a computer, point at each button and read the tooltip.

## 17 Oct 2026: Play Cards with Friends

Commit `3911b31`. No migration. Frontend only, nothing is saved.

**Why.** Many people, especially young people, find it hard to start talking about feelings. A gentle card game played with friends on one phone gives them an easy way in. The sidebar has listed "Play Cards with Friends" as coming soon; now it is real.

**What changed for users:**
- **New page `/play-cards`** (log in needed), in the sidebar under Community.
- **Set up:** add friends' names (2 to 8 players), choose a deck (Journey: start light, get real, end with care; or one level) and a length (9, 15 or 21 cards, about 10 to 25 minutes).
- **House rules** before starting: what is shared stays here, listen don't fix, pass any time.
- **Play:** each card flips over with a 3D turn. Whose turn it is shows at the top. Pass gives you another card with no reason needed. Lighter card swaps to an easier level. Deeper cards have "Need support?".
- **60 cards** in English and Khmer: questions, breathing together (a guided 3 breath circle with the sprout), kind words, and everyone together cards. Each level has its own colors: warm sunrise, AROM green, soft blossom.
- **The end:** falling leaves, "You did it together", a prompt to share what you learned about each other, a private journal note, "Plan the next hangout" (adds it to today's plan), play again or a new game.
- **Private:** names and answers are never saved or sent anywhere.

**What changed for the team:**
- **Files:** `app/play-cards/` (page, `_data/cards.ts`, `_components/`). `/play-cards` added to `PROTECTED_PREFIXES` in `lib/supabase/proxy.ts`; the sidebar item has its link and is no longer "coming soon".
- **Handoff:** `BACKEND-HANDOFF.md` section 28 lists later work (admin decks, play count, online rooms).
- **Before launch:** an AROM professional should check the Getting real and Care cards. A Khmer speaker should read all Khmer card text.

**What to re-test:**
1. Log in, open Play Cards with Friends from the sidebar.
2. Add 3 friends, choose Journey and Medium, press Start playing, agree to the rules.
3. Flip a card, press Pass, then Lighter card on a Getting real card, then Done.
4. Play a breathing card: press Start breathing and follow the circle.
5. Finish the game, press Plan the next hangout, and check it appears on Home.
6. Switch to Khmer and play a few cards.
7. Turn on Reduce motion: cards still work, nothing floats or falls.

## 17 Oct 2026: The Mood Sprouts Come Alive

Commit `77423a5`. No migration. Frontend only.

**Why.** Small, calm movement makes Home feel alive and friendly. Rith chose to animate the mood check in and the kind reply now, and the big banner sprout later, once the designer can export it in separate pieces (background, sprout alone, sprout with eyes closed).

**What changed for users:**
- **Mood check in:** the sprout you pick does a small hop, then gently sways while it stays chosen.
- **Kind reply:** its sprout slowly "breathes" (grows a little and back, about every 4 seconds).
- **Nothing moves for people who turn off motion** in their phone or computer settings.

**What changed for the team:**
- `mood-selector.tsx`: `SPROUT_MOTION` variants (hop once, then a slow sway) on the chosen sprout.
- `mood-response.tsx`: a slow scale loop on the reply sprout.
- Both use Motion with `useReducedMotion`, transforms only, no new images.

**What to re-test:**
1. Pick a mood on Home: the sprout hops, then sways slowly. Pick another: the first stops, the new one hops.
2. The reply sprout breathes slowly.
3. Turn on Reduce motion (phone accessibility settings) and reload: nothing moves.

## 16 Oct 2026: Next Session on Home Only When It Is Close

Commit `94ddfbf`. No migration. Frontend only.

**Why.** Rith found the "Your next session" card too much for a session 9 days away: it took space above the plan every day and was larger than it needed to be.

**What changed for users:**
- **The card shows only for a session today, tomorrow or in 2 days.** Sessions further away are still in My appointments.
- **The card is smaller:** one row with the details on the left and See details on the right. Join appears there once the meeting room opens.

**What changed for the team:**
- `next-session-card.tsx`: `SHOW_DAYS_BEFORE = 2` (Cambodia dates) and the compact layout; `JoinButton` uses the small size, which hides the "opens before" note.
- `appointment-helpers.ts`: new `daysUntil()`, also used by `howSoon()`.

**What to re-test:**
1. With a session 9 days away: Home shows no session card.
2. With a session tomorrow: the small card shows "Tomorrow, 09:00".
3. With an online session today: Join appears shortly before the start.

## 16 Oct 2026: The Chosen Voice Language Is Easy to See

Commit `9a09962`. No migration. Frontend only.

**Why.** On the journal page, the Voice switch (Khmer or English) showed the chosen language as white on a white background, so people could not tell which one was on.

**What changed for users:**
- **The chosen language is dark green with white text,** the other stays plain.

**What changed for the team:**
- `app/detection/journal/page.tsx`: new selected style, and both buttons report `aria-pressed` for screen readers.

**What to re-test:**
1. Open Write about today and tap Khmer, then English under Guided Reflection Questions: the one you tapped turns dark green.

## 16 Oct 2026: Plan Ticks Work Every Time, and the Bar Fills From the Left

Commit `821d1f1`. No migration. Frontend only.

**Why.** Rith found that ticking a task sometimes did not work, and that the progress bar lit the segment where the done task sat (ticking the last task lit the last segment) instead of filling from the left.

**What changed for users:**
- **Easier to tap:** the check circle still looks the same, but its tap area is 44px, so a thumb no longer lands on the row by mistake.
- **Fast taps are safe:** tapping quickly several times always ends on your last tap, also after a reload.
- **The Mood check in circle works:** it takes you to the mood picker, because that row ticks when you choose a mood.
- **Finished lessons and practices can be unticked:** finishing one ticks its task as a normal tick, which you can undo.
- **The bar fills from the left:** 2 done lights the first 2 segments, whichever tasks they are.

**What changed for the team:**
- `daily-plan-store.ts`: `setPlanTaskDone` sends one save at a time per task, in tap order.
- `daily-plan-card.tsx`: `CheckCircle` has a 44px target (and a link for the mood row); automatic ticks are saved once per visit through `setPlanTaskDone`; the bar uses the done count.

**What to re-test:**
1. Tap each circle on a phone: every tap ticks or unticks.
2. Tap one circle 5 times fast, wait, reload: it shows what the last tap showed.
3. Tap the Mood check in circle: the page moves to the mood picker.
4. Tick the last task only: the first bar segment turns green.
5. Finish a lesson that is in your plan, come back: it is ticked, and you can untick it.

## 16 Oct 2026: Your Plan For Today Becomes Your Own To Do List

Commits `c4b6fcd` and `00aaa9e`. Merged in PR #17. Migration `20261016001300_plan_tasks.sql` applied to Supabase on 16 Oct 2026 (by Rith).

**Why.** Rith wanted the plan on Home to be a to do list people set up themselves, for things like drinking more water or going to bed on time, plus MindGuide items. Until now the plan was mostly fixed rows, and anything added was kept only in the browser, so it was lost on another phone and anyone on the same phone could see it.

**What changed for users:**
- **Add your own tasks:** type anything, or tap an idea (drink water, sleep before 11 pm, walk 10 minutes, no phone before bed, breakfast, message a friend, stretch, gratitude, morning sun), or add a MindGuide lesson or practice.
- **Choose how often:** every day, some days (pick the days), or today only.
- **Done looks done:** tap the circle and the task gets a line through it and a green check. Tap again to undo. Every day starts fresh, nothing piles up as overdue.
- **Edit, reorder and delete** tasks in My tasks (pencil "Edit" on the card).
- **The plan is saved to your account,** private to you, and follows you to any phone. Items an older version kept in this browser are moved in once.
- **New people start with 4 tasks** (a lesson, a meditation, a try now step, drinking water) they can delete. The mood check in and tasks from your professional still appear automatically.
- **Signed out:** the card shows the starter tasks and "Log in to make your own plan".

**What changed for the team:**
- **New tables** `plan_tasks`, `plan_task_checks`, `plan_starts` with owner only RLS, a 30 task limit and internal links only. **New API** under `/api/plan`. Full details in `BACKEND-HANDOFF.md` section 27.
- **`daily-plan-store.ts`** now keeps the plan in memory and saves through the API. MindGuide screens still call `getCustomPlanItems`, `isItemInDailyPlan` and `toggleCustomPlanItem`, so they did not change. Adding while signed out goes to log in.
- **Tips "Try now"** add to plan moved to `app/_components/tips/tips-plan.ts`, because `tips-data.ts` is also imported by server code.
- **The old Curate window is replaced** by `plan-editor-dialog.tsx`. Its MindGuide list moved to `plan-mindguide-items.ts`. Explore Community is no longer a fixed row.

**What to re-test:**
1. Run migration `20261016001300_plan_tasks.sql` in Supabase.
2. Log in as a new user and open Home: the 4 starter tasks show, with the mood check in on top.
3. Tick a task: a line goes through it and the check turns green. Reload: it stays ticked. Untick it.
4. Add your own task with Some days (only Monday) and check it only shows on Mondays. Add one with Today only.
5. Tap two ideas, then open My tasks: move one up, rename one, delete one (it asks first).
6. In MindGuide, Add to plan on a lesson: it shows on Home. Finish that lesson: it ticks itself.
7. In a Tip, add a Try now step to the plan: it shows on Home with a capital letter.
8. Log in as another user: none of the first user's tasks show.
9. Signed out: the card shows the starter tasks and Log in to make your own plan.

## 16 Oct 2026: Home Answers Your Mood, Shows Your Next Session, and Only Counts Real Progress

Commit `52c9f1f`. No migration. Frontend only, using APIs that already exist.

**Why.** Home showed "2/5 done" to everyone, even signed out, because two plan rows were marked done in the code. A check in only said "Saved", so it felt like a form. People with a session booked had to open My appointments to find it. Small text issues made the page feel unfinished.

**What changed for users:**
- **Your Plan For Today counts only real things.** Mood check in is ticked once you have checked in today ("You checked in: Good"). Otherwise it says "Tap how you feel below" and jumps to the mood check in. MindGuide Lesson and Guided Meditation are ticked when you finished a lesson or a practice today. Explore Community is a suggestion and no longer counts toward the total.
- **Home answers your check in** with the sprout for your mood and a short kind line. Great and Good offer the journal, Okay and Low offer a breathing practice (Low also offers a professional), and Very Low offers "Get help now" (the crisis helplines) and "Talk to a professional". It never judges or diagnoses.
- **Your next session shows under the greeting** when you have one: who, when ("Today, 15:00"), online or in person, the address for in person sessions, a Join button once it opens, and See details.
- **Cleanups:** the greeting now says "Take a small moment for yourself today." instead of repeating the mood question; the quote changes every day (8 gentle lines in English and Khmer); the heart that did nothing is gone; "Drop or delay one thing this week." starts with a capital; the gap above the sprout is smaller.

**What changed for the team:**
- **New:** `app/components/mood-response.tsx` (the replies and their links), `app/components/next-session-card.tsx` (`useNextSession()` reads `GET /api/appointments`, the user's own sessions only).
- **Plan ticks:** `daily-plan-card.tsx` uses `useMoodStore()` for today's check in and `useActivities("7d")` (`GET /api/progress/activities`) for lessons and practices done today. Nothing is done by default.
- **Daily quote:** `quote-card.tsx` picks by the Cambodia date in the browser (`useSyncExternalStore`), so the server and browser never disagree.
- **Khmer copy** for the replies, the greeting line and the quotes was drafted by Claude. Please have a Khmer speaker read it.

**What to re-test:**
1. Signed out: Home shows "0/4 done" and no ticks.
2. Signed in, before checking in: the Mood check in row says "Tap how you feel below" and jumps down to the moods.
3. Pick each mood: check the reply, the sprout and the links change, and the plan row turns into "You checked in: ...".
4. Pick Very Low: check "Get help now" opens the helplines in Profile.
5. Finish a lesson and a practice, come back to Home: both rows are ticked.
6. With a booked session: the card shows under the greeting with the right day and time. For online, Join turns on shortly before the start. For in person, the address shows.
7. Switch to Khmer and read the replies, greeting and quote.

## 16 Oct 2026: The Mood Sprouts Everywhere There Are Five Moods

Commit `f566e77`. No migration. Frontend only.

**Why.** Rith asked for the five AROM sprouts from the new Home design to be used wherever the app shows the five moods, so a mood looks the same on every page.

**What changed for users:**
- **Journal (Write about today):** the mood buttons show the sprouts, and each saved entry, today's entry and the entry window show the sprout for its mood.
- **The journal uses the same mood names as Home:** "Low" and "Very Low" instead of "Not Good" and "Very difficult" (Khmer: មិនសូវល្អ (Low), ពិបាកខ្លាំង (Very Low)). Only the words on screen changed. Saved entries keep their stored value, so nothing old breaks.
- **Progress:** today's check in buttons and the faces down the side of the mood chart are sprouts.
- **Not changed:** the mood calendar keeps its colored squares, because a sprout in each tiny day box would be too small to see.

**What changed for the team:**
- **One shared component:** `app/_components/mood/mood-sprout.tsx` (`<MoodSprout mood className="h-7 w-auto" />`). The images and their sizes are `MOOD_SPROUTS` in `mood-visuals.ts`. `MOOD_ICONS` is removed because nothing uses it anymore.
- **Files:** `mood-selector.tsx` (Home), `today-check-in.tsx` and `progress-charts.tsx` (Progress), `app/detection/journal/page.tsx` (journal options now come from `JOURNAL_MOODS` and `JOURNAL_MOOD_LEVEL`, names from `MOOD_LABELS`).

**What to re-test:**
1. Open the journal, pick each mood and save an entry. Check the sprout shows on the button, on today's entry and in History.
2. Open an older entry saved as "Not Good" and check it now says "Low" with the Low sprout.
3. Logged in, open Progress. Check today's check in buttons and the chart faces are sprouts, and tapping a mood still saves.
4. Switch to Khmer and check the journal mood buttons wrap neatly.

## 16 Oct 2026: Home Page Redesign with the AROM Sprout

Commit `e45f398`. No migration. Frontend only.

**Why.** The new Figma Homescreen gives AROM a friendly character, a small leaf sprout, so the app feels warm and less clinical for people who are nervous about mental health. The home page already had the same sections with real data behind them, so this change is visual: the data and buttons work as before.

**What changed for users:**
- **The sprout peeks over Your Plan For Today,** among plants, a sun and a heart. The plan title is bigger and the progress bars are thicker.
- **The mood check in shows a sprout for each mood** (rain cloud for Very Low up to cheering for Great) instead of small round icons. The chosen mood gets a soft green frame.
- **Your Progress stays below the mood check in,** now with a green title like the other sections. Its subtitle says "Your moods over the last 7 days" instead of repeating the quote above it.
- **Text fixes:** "Share with each other", "Understanding Anxiety (5 min)", "Relax and breathe (3 min)".
- **Khmer fits:** the plan's "2/5 រួចរាល់" no longer splits across two lines, and the mood question no longer runs into the Journal link.

**What changed for the team:**
- **New images in `public/home/`:** `plan-banner.webp` (57 KB) and five `mood-*.webp` files (10 to 14 KB each), cut from the Figma pictures and converted from about 4 MB of PNG. They load through `next/image`; the banner uses `preload` (Next.js 16 replaced `priority` with `preload`).
- **The Figma banner has "Your Plan For Today", "1/5 done" and the bars painted into the picture.** Only the plants and sprout above the bar are used, so the real title, count and bars stay live and switch to Khmer.
- **Files:** `daily-plan-card.tsx` (banner, header, bars, text), `mood-selector.tsx` (sprouts instead of `MOOD_ICONS`), `progress-dashboard.tsx` (title and subtitle). `MOOD_ICONS` is still used elsewhere.
- **Kept on purpose:** the app's own bottom menu labels (Professional, Community) and tagline, which were already correct.

**What to re-test:**
1. Open Home on a phone. Check the sprout sits right on top of the plan card and the page does not scroll sideways.
2. Tap each mood and check the green frame moves and "Saved" shows.
3. Switch to Khmer and check the plan header, the mood question and the mood labels read well.
4. Open Home on a computer and check the plan card with the sprout in the left column.
5. Check Your Progress still opens the Progress page from See all.

## 16 Oct 2026: Journal Prompts Saved for Real and Shown in the Journal

Commit `d855a3e`. Migration `20261016001200_journal_prompts.sql` applied to Supabase on 16 Oct 2026 (by Rith).

**Why.** The admin Journal prompts page ran on sample data: anything an admin added or switched off was lost on refresh, and the journal page never read it anyway. Its two guided questions were written into the code. Now the AROM team can choose the reflection questions users see without a code change.

**What changed for users:**
- **The guided questions on Write about today come from the admin list,** in the admin's order. Today they are the same two questions as before, so nothing looks different until an admin changes them.
- **Questions you have started answering are never swapped out** while you write. If the list cannot load, the journal shows its usual two questions.

**What changed for the team:**
- **Admin Journal prompts page is real:** add, edit, activate and deactivate save to the database and stay after a refresh. Errors from the server show in the form. The demo banner is gone on this page.
- **Rules:** up to 10 active prompts, each display number used once, questions up to 300 characters (the Khmer field limit went from 400 to 300 to match journal entries). Every change is in the Audit log.
- **New:** table `journal_prompts` with RLS (anyone reads active, admins read all, no write policies), function `save_journal_prompt()`, `GET /api/journal-prompts`, `GET|PUT /api/admin/journal-prompts`, `lib/controllers/journal-prompts-controller.ts`. The shared type is `JournalPrompt` in `lib/journal.ts`. The sample prompts in `app/admin/_data/journal-prompts.ts` are removed.
- **Docs:** `BACKEND-HANDOFF.md` section 26. The status board rows for Change time and in person address now say Connected.

**What to re-test:**
1. Run migration `20261016001200_journal_prompts.sql` in Supabase.
2. As an admin, open Journal prompts. Check the three starting prompts load and the demo banner is gone.
3. Add a prompt, refresh, and check it is still there. Try a display number that is already used and check the error.
4. Deactivate "What was challenging or difficult?", then open Write about today as a user and check only the happy question shows. Activate it again.
5. Activate the gratitude prompt and check the journal shows three questions in order.
6. Open the Audit log and check the prompt changes are listed.
7. As a normal user, call `PUT /api/admin/journal-prompts` and check it is refused.

## 16 Oct 2026: Progress, Activities, Journal and Mood Sharing All Use Real Data (Issue #13)

Commit `ca5da86`. Migrations `20261016001000_progress_journal_sharing.sql` and `20261016001100_audit_admin_chat_reads.sql` must be run in Supabase, after `20261015001500_client_reschedule.sql` and `20261015001600_in_person_address.sql` (from PR #11).

**Why.** Issue #13 listed four Progress parts that still ran on sample data or were switched off. The journal was the most serious: people's private reflections were kept only in the browser, where anyone using the same phone could read them, and new visitors saw five made up entries. Admins could also read community chats without the audit log entry AGENTS.md requires.

**What changed for users:**
- **30 days and 3 months show your own check ins.** The "Sample data, not yours yet" badge is gone. Missed days stay blank.
- **Activities are real:** finishing a practice or a lesson counts on the Activities tab (once per item per day). Journal entries count by date only, never their words.
- **Your journal is saved to your account,** private to you: not your professional, not admins. No more sample entries. If you are not logged in, Save asks you to log in and keeps what you wrote. Deleting an entry asks first.
- **Entries saved on this device before:** the journal asks once whether to move them into your account, because they might belong to someone else who used the phone. Nothing moves without a yes.
- **Share your moods with your professional:** My appointments has a working "My mood check ins" switch (off by default). It shares only your last 30 days of moods, never your journal, and turning it off stops it at once.
- **Professionals** see that client's real last 30 days in the client file only while the client shares; otherwise "This client has not shared their moods."

**What changed for the team:**
- **API:** `GET /api/progress?range=7d|30d|90d`, `POST /api/activities`, `GET /api/progress/activities?range=`, `GET|POST /api/journal`, `DELETE /api/journal/:id`, and `moods` in `GET /api/pro/clients/:id`. `POST /api/appointments/:id` sharing takes `shareMoodTrend`.
- **Migration 1000:** `activity_log` with `log_activity()`; `journal_entries.entry_date` defaults to Cambodia today; `appointments.share_mood_trend`, a 4 argument `set_appointment_sharing()`, `guard_appointment_update()` locking it, and `shared_mood_checkins()`.
- **Migration 1100:** admins read a group chat only through `admin_read_community_messages()` (`GET /api/admin/community/groups/:id/messages?reason=`), which writes `read_group_chat` to the audit log every time. The member function and the raw table no longer let admins in.
- **Shared code:** `lib/activities.ts`, `lib/journal.ts`; `mood-store.ts` loads the longer ranges; `use-activities.ts`; `shared-moods.tsx` replaces the example chart. `app/progress/_data/` is deleted.
- **Merge:** PR #11 merged into `hokchheng`. `BACKEND-HANDOFF.md` sections are now 23 Community, 24 Client changes the time, 25 Address for in person sessions. The client reschedule error now uses `databaseError()`.

**What to re-test:**
1. Run the four migrations in order: `20261015001500`, `20261015001600`, `20261016001000`, `20261016001100`.
2. Check in on Home, then open Progress and switch to 30 days and 3 months. Check today shows and no sample badge appears.
3. Finish a practice and a lesson, then open Mood & Activity Details, Activities. Check both count.
4. Write a journal entry, reload, and check it is still there. Delete it and check the confirm window.
5. On a browser that has old journal entries saved, open the journal and check the Move window. Press Not now and check nothing moved.
6. In My appointments, turn on My mood check ins. As that professional, open the client file and check the 30 day chart. Turn it off and reload: the chart is replaced by "This client has not shared their moods."
7. As an admin, call `GET /api/admin/community/groups/<id>/messages?reason=check` and check the Audit log shows "Opened a support group chat".
8. Signed out: Progress shows Log in, and the journal Save asks you to log in.

## 16 Oct 2026: Team Docs Brought Up to Date

Commit `20b40ed`. No migration. Docs only.

**Why.** The docs had fallen behind the code. Nineteen report entries had no commit, the handoff status board still said applied migrations were waiting, two sections shared the number 14, finished backend gaps were still listed as open, and README and ADMIN.md described an early mock version of the app.

**What changed for users:**
- **Nothing on screen.** This change only touches documentation.

**What changed for the team:**
- **report.md:** every `Commit PENDING` now names the commit that added the entry.
- **BACKEND-HANDOFF.md status board:** migrations `20261014000100` and `20261015000400` marked applied; new row for Edit Profile (migrations `20261016000800` and `20261016000900`); Community marked partly connected.
- **Community is now section 23** (it shared 14 with Crash tracking), moved after section 22, with what is connected, what is still browser only, and the open gap that admin chat reads are not audited yet.
- **Finished gaps closed** in sections 5, 6 and 8 (make admin, promote with license, suspend, license signed link, pending profile changes). Section 21 now says the Messages "Next session" strip uses real appointments.
- **README.md** describes AROM, how to run it, the checks, migrations and where things are. **ADMIN.md** lists each admin page and whether its data is real.

**What to re-test:**
1. Open `BACKEND-HANDOFF.md` and check that sections run from 1 to 23 with no repeated number.
2. Check that `report.md` has no `PENDING` left except this entry.

## 16 Oct 2026: Private Profile Editing

Commit `4588151`. Migration `20261016000900_profile_editor_fields.sql` adds private profile details and a private photo bucket. Apply it in Supabase before saving these fields.

**Why.** The profile card had two separate edit controls, and the pencil could only change the name. A single Edit Profile flow gives members one place to update the details that belong to their account.

**What changed for users:**
- **One profile editor:** Edit Profile opens a compact mobile sheet or desktop dialog for a photo, display name, pronouns, and About you. The account email remains visible.
- **Less empty space:** the sheet sizes to its content and scrolls the fields when the screen is short, with the save actions kept at the bottom.
- **Private photos:** uploaded profile photos are served only to the signed in account holder.

**What changed for the team:**
- **Profile API:** saves the name, pronouns, and About you fields together, and validates photo type and size before upload.
- **Private storage:** adds owner only policies for profile photo upload, read, and deletion. The admin user list does not receive profile photos.
- **Bilingual form:** new controls support English and Khmer.
- **Backend handoff:** documents that user photos remain private and are not part of admin user records.

**What to re-test:**
1. Apply the migration in Supabase.
2. Open Profile & Settings and select Edit Profile. Check that the sheet has no large blank area under its actions on a phone sized screen.
3. Change the name, photo, pronouns, and About you, save, then reload the page. Check that each value is retained.
4. Upload a file larger than 5 MB or a non image file. Check that the form explains what to choose.
5. Sign in as another account and confirm its photo endpoint cannot return the first account's image.
6. Switch the app to Khmer and check the editor labels and buttons.

## 16 Oct 2026: Booking Works for Every Account, and No More Database Errors on Screen

Commit `4588151`. Migration `20261016000800_backfill_missing_profiles.sql` must be run in Supabase. It is safe to run more than once.

**Why.** Booking a session on the live site showed `insert or update on table "appointments" violates foreign key constraint "appointments_user_id_fkey"`. The account had signed in fine but had no row in `profiles`, which happens to accounts created while the sign up trigger was missing. Every booking needs that row. The page also showed the raw database message, which means nothing to a user and reveals how the database is built.

**What changed for users:**
- **Booking works again** for accounts that were missing a profile. They get one with the role Member, their sign up name and language.
- **Friendly errors only:** when something goes wrong while booking, cancelling, changing sharing, updating a booking, reviewing professionals or saving helplines, people see a plain message such as "We could not book this time. Please try again in a moment." Messages written for people, such as "This time is no longer available", still show as before.

**What changed for the team:**
- **Migration:** creates the missing profiles the same way `handle_new_user()` does, and recreates the `on_auth_user_created` trigger so new accounts always get one.
- **`databaseError(error, fallback)`** in `lib/controllers/shared.ts`: shows messages our SQL functions raise for people (code `P0001`) and hides everything else behind `fallback`. Use it instead of `fail(..., error.message, ...)`.
- **Used in** the booking, appointments, pro bookings, crisis helpline and admin professionals controllers.

**What to re-test:**
1. In Supabase, run this to see accounts without a profile (it should list the account that failed): `select u.id, u.email from auth.users u left join public.profiles p on p.id = u.id where p.id is null;`
2. Run the migration, then run step 1 again. Check that it returns no rows.
3. On the live site, book a session with the same account. Check that it goes through.
4. Try to book a time someone just took. Check that you see "This time is no longer available".

## 16 Oct 2026: Saved Schedules Stop Saying "Unsaved", and AROM's Own Confirm Window

Commit `5629343`. No migration.

**Why.** After a professional saved their schedule, the page said "Schedule saved" and "Unsaved changes" at the same time, and asked them to confirm when leaving. The database stores the schedule in a format that reorders its fields, so the page compared the same schedule as two different ones. Confirmations also used the browser's plain grey pop up, which looks out of place in a calm wellness app and gives no clear safe choice.

**What changed for users:**
- **Saving the schedule settles the page:** after "Schedule saved", the Unsaved changes label goes away, Save and Undo are disabled again, and leaving does not ask.
- **AROM's own confirm window:** leaving a page with unsaved changes, stopping a care task, deleting a podcast episode and restoring an older content version now open an AROM window instead of the browser's pop up. On phones it slides up from the bottom with large buttons; on desktop it is a small centered window.
- **The safe choice comes first:** Stay or Cancel has focus when the window opens, and Escape or a tap outside picks it. Deleting and stopping use a red button.
- **Closing the tab or reloading** with unsaved changes still shows the browser's own warning, because pages are not allowed to replace that one.

**What changed for the team:**
- **`useConfirm()`** in `app/_components/confirm-dialog.tsx`: `const { confirm, dialog } = useConfirm()`, render `dialog` once, then `if (await confirm({ title, message, confirmLabel, cancelLabel, tone })) ...`. Do not use `window.confirm` or `window.alert` anymore.
- **`useUnsavedChangesGuard(isDirty, km)`** in `app/_components/unsaved-changes-guard.tsx` replaces the three copies of the leave warning (schedule, profile, admin content editor). Render the element it returns.
- **`SheetDialog`** moved from `app/pro/_components/` to `app/_components/` so the user and admin areas can use it.
- **Schedule comparison** ignores field order (`canonical()` in `schedule-editor.tsx`).

**What to re-test:**
1. In `/pro/schedule`, change a time and press Save schedule. Check that "Unsaved changes" disappears and Save is disabled.
2. Change a time again, then click My bookings in the menu. Check that the AROM window asks "Leave without saving?". Press Stay and check nothing changes; press Leave and check My bookings opens.
3. Repeat step 2 in My profile and in the admin content editor.
4. In a client file, press Stop on a care task. Check the window, then Cancel and Stop task.
5. In My podcasts, delete an episode through the window.
6. On a phone sized window, check the window slides up from the bottom and Escape or a tap outside closes it.
7. Switch to Khmer and check the window text.

## 16 Oct 2026: Community Privacy Migrations Renumbered, Client Names Kept for Professionals

Commit `5629343`. Migrations renamed, not new. Run the 8 files `20261016000000` to `20261016000700` in Supabase, in order. Until `20261016000000` runs, the app cannot read `profiles.hide_identity`, so it loads every account as a plain user with no profile (admins and professionals lose their areas).

**Why.** The community privacy work (commit `54c34f5`) added 8 migrations numbered `20261015000000` to `000700`. Four of those numbers were already used by care plans, sessions, private notes and mood check ins, and two files shared `20261015000400`. The run order was unclear, and the Supabase CLI needs unique numbers. One file would also have failed: it changed what `my_client_names()` returns. If it had run, it would have removed the client's language from the professional area. Two files also hid every client from their own professional, because Hide my identity is on by default.

**What changed for users:**
- **Professionals still see their clients' names**, unless the client uses Anonymous Mode, as before. Hide my identity applies to Community only, as the original commit intended.
- **Messages and client files keep the client's language** for professionals.

**What changed for the team:**
- **Renamed:** `20261015000000` to `000700` (the community files) are now `20261016000000` to `000700`, in the same order. Care plans, sessions, notes and mood keep their `20261015` numbers.
- **`20261016000500_private_client_names.sql`:** now keeps the `(id, full_name, language)` shape and the `privacy_mode` rule from `20261015000300`. On a database where that already ran, it changes nothing.
- **`20261016000700_professional_booking_aliases.sql`:** uses `privacy_mode` instead of `hide_identity`.
- **Rule for later:** a professional facing name follows `privacy_mode`; a Community name follows `hide_identity`.

**What to re-test:**
1. Run `20261016000000` to `20261016000700` in order. Check that each succeeds.
2. Sign in as an admin and as a professional. Check that the admin area and `/pro` open. Then sign in as a user and check that Hide my identity can be switched.
3. Sign in as a professional with a booked client in Private mode. Check that `/pro/clients` and Messages show the client's real name.
4. Switch that client to Anonymous Mode. Check that the professional no longer sees the name.
5. In Community, post with Hide my identity on. Check that others see "Anonymous".

## 15 Oct 2026: Address for In Person Sessions

Commit `6e3cafd`. Migration `20261015001600_in_person_address.sql` **not yet applied**: Hok Chheng reviews and runs it in Supabase, then merges the pull request. Run after `20261015000200_sessions.sql`.

**Why.** Professionals could offer in person sessions, and 56 in person times were open, but nowhere said where to go. A client could book and arrive nowhere. Rith decided: professionals type their own place, everyone can see it, no admin review, and an address is required to offer in person.

**What changed for professionals:**
- **Where you see clients in person** in My profile, under How you meet clients: place name (optional), address and a Google Maps link (optional). It saves at once.
- **In person needs an address:** saving In person without one shows an error, and Home shows "Users cannot book in person until you add the address where you see clients" with a link.

**What changed for users:**
- **Public profile** shows "Where to meet in person" with the address and Open in Maps.
- **Booking** shows the address under the In person choice, and the review and confirmation show the place.
- **My appointments** shows the place and Open in Maps on in person sessions, and Add to calendar puts the address in the calendar event.
- **No address, no in person:** professionals without an address offer online only until they add one.

**What changed for the team:**
- **New columns** `professional_profiles.office_name`, `office_address`, `office_map_url`; `list_public_professionals()` returns them; trigger `appointments_require_office` refuses new in person bookings without an address.
- **New** `lib/office.ts` and `app/_components/office-card.tsx`.
- **Tested** the migration on a local Postgres (PGlite) with 18 checks. See BACKEND-HANDOFF.md section 24.

**What to re-test (after running the migration):**
1. As a professional with In person on, open My profile, clear the address and try to save: confirm the error.
2. Add a place name, address and map link, save, refresh, and confirm they stayed.
3. Open your public profile and confirm "Where to meet in person" and that Open in Maps opens the right place.
4. As a user, book In person and confirm the address shows on the choice, the review and the confirmation.
5. Open My appointments and confirm the place and Open in Maps on the session; tap Add to calendar and check the event location.
6. As a professional with In person but no address, confirm Home shows the reminder and users only see Online.

## 15 Oct 2026: Clients Can Change the Time of Their Session

Commit `4322eda`. Migration `20261015001500_client_reschedule.sql` **not yet applied**: Hok Chheng reviews and runs it in Supabase, then merges the pull request. Run after `20261015000200_sessions.sql`.

**Why.** A client who could not make their session could only cancel and book again, and in between someone else could take the time they wanted. Professionals could already move sessions; clients now can too, safely in one step.

**What changed for users:**
- **Change time** on an upcoming session opens the same date and time picker as booking, with the professional's open times for the same session type.
- **One step and safe:** the session moves and the old time opens for someone else at once. If someone just took the new time, the page says so and loads fresh times.
- **Up to the professional's notice:** a session can be moved until the professional's minimum notice before it (for example 24 hours), and the panel says until when. After that the card says it is too close to change the time, and the client can still cancel or message the professional.
- **Optional reason** the professional sees.
- **Clear wording:** the card says "You moved this session from ..." or "Your professional moved this session from ...".

**What changed for professionals:**
- **My bookings shows "The client moved this session from ..."** with the client's reason.

**What changed for the team:**
- **New database functions** `client_reschedule_appointment()` and `my_change_time_deadlines()` (the deadline only, the schedule stays private), and column `appointments.rescheduled_by`. `reschedule_appointment()` and `guard_appointment_update()` are replaced with the same bodies plus `rescheduled_by` (checked against the live database first).
- **New endpoint** `GET /api/appointments/:id/open-times` and a `reschedule` action on `POST /api/appointments/:id`.
- **`TimeStep`** from the booking page is exported and reused.
- **Tested** the migration on a local Postgres (PGlite) with 30 checks. See BACKEND-HANDOFF.md section 23.

**What to re-test (after running the migration):**
1. As a client with an upcoming session, tap Change time, pick another time, add a reason and confirm.
2. Confirm the card shows the new time and "You moved this session from ...".
3. Open the professional's My bookings and confirm the new time and "The client moved this session from ..." with the reason.
4. Confirm the old time shows again on the professional's booking page and the new one does not.
5. Open the same session in two browsers, move both to the same time, and confirm the second gets "This time is no longer available".
6. With a session less than the professional's minimum notice away, confirm Change time is hidden, the "too close" note shows, and Cancel still works.
7. Switch to Khmer and check every new label.

## 16 Oct 2026: Home Shows a Small Progress Glance

Commit `0aedecc`. No migration.

**Why.** Home had its own 7 day chart, the same as the new Progress Dashboard, which made Home longer and meant two charts to keep in step. Rith chose to keep a small glance on Home that opens the dashboard, and to remove the breathing link there (the dashboard's support card offers breathing on hard days).

**What changed for users:**
- **Your Progress on Home** is one small card: 7 dots in the color of each day's mood (an empty dot for a missed day), "You checked in 6 of 7 days", and Open Progress Dashboard. The whole card opens the dashboard.
- **No check ins yet:** "Start your week today" points to the mood check in above.
- **Removed:** the "Try a short breathing practice" link under Your Progress.

**What changed for the team:**
- **`app/components/progress-dashboard.tsx`** rewritten as the glance; the chart now lives only in `app/progress/`.

**What to re-test:**
1. Signed in, open Home and compare the dots with your check ins; tap the card and confirm it opens Progress Dashboard.
2. With no check ins, confirm "Start your week today" scrolls to the mood check in.
3. Signed out, confirm the Log in prompt.
4. Check a phone width and Khmer.

## 16 Oct 2026: Mood Calendar for 30 Days and 3 Months

Commit `9a62c2e`. No migration.

**Why.** For 30 days and 3 months, Mood Statistics showed 30 or 90 thin bars, which are hard to read, especially on a phone. A calendar lets people see their own month at a glance and spot patterns, such as hard Mondays.

**What changed for users:**
- **Mood Statistics for 30 days and 3 months** shows month calendars. Each day is colored by its mood, a missed day stays grey, and tapping a day shows its mood. A color key sits underneath.
- **7 days** keeps the bars. On a computer, two months sit side by side.

**What changed for the team:**
- **New** `app/progress/_components/mood-calendar.tsx` (weeks start on Monday). Used in `mood-details-view.tsx` for the longer ranges. Still sample data until `GET /api/progress?range=` exists.

**What to re-test:**
1. Open Mood & Activity Details, switch to 30 days and 3 months, and confirm the calendars and the Sample data label.
2. Tap a few days and confirm the mood under the calendar.
3. Check a phone width and Khmer.

## 16 Oct 2026: Progress Shows Which Dates It Covers

Commit `30225ab`. No migration.

**Why.** "7 days" or "30 days" did not say exactly which days were shown, so people could not match a chart to their own memory of those days.

**What changed for users:**
- **A small line under every range switch** on the Progress pages, for example "Oct 9 to Oct 15", in English and Khmer.

**What changed for the team:**
- **New** `RangeDates` in `app/progress/_components/progress-parts.tsx`, used by the dashboard, Mood, Insights and Activities.

**What to re-test:**
1. On each Progress tab, switch ranges and confirm the dates change and end today.
2. Switch to Khmer.

## 16 Oct 2026: Mood Distribution Shows Counts for Few Check Ins

Commit `584b082`. No migration.

**Why.** With only a few check ins, a percentage sounds bigger than it is: one Great day out of two showed as "Great 50%".

**What changed for users:**
- **Below 10 check ins,** the Mood Distribution list shows "1 of 2" instead of a percentage. From 10 check ins on it shows percentages as before.

**What changed for the team:**
- **`MoodDonut`** in `app/progress/_components/progress-charts.tsx`, `FEW_CHECK_INS = 10`.

**What to re-test:**
1. With a few check ins, open Mood & Activity Details and confirm "1 of 2" style counts; switch to 30 days (sample) and confirm percentages.
2. Switch to Khmer.

## 16 Oct 2026: Gentle Support Card After Hard Days

Commit `0fc2626`. No migration.

**Why.** On a mental health app, the progress page is a moment where AROM can actually help. When someone has several hard days in a row, it should offer support, calmly and without judging. Rith chose the rule and the wording.

**What changed for users:**
- **A calm card on the Progress Dashboard** when 3 or more of the last 7 check ins are Low or Very Low: "Some of your recent days were hard. You don't have to handle it alone."
- **Three ways to get support:** Breathing practice, Talk to a professional, Get help now.
- **"Not now"** hides it for this visit. It only uses real check ins, never sample data.

**What changed for the team:**
- **New** `app/progress/_components/support-card.tsx` with `needsSupport()` and `SUPPORT_MIN_HARD_DAYS = 3`. Rule recorded in BACKEND-HANDOFF.md section 22. No backend.

**What to re-test:**
1. Check in Low or Very Low on 3 different days (or use a test account), open Progress Dashboard and confirm the card.
2. With only 2 hard days, confirm there is no card.
3. Tap each button, and Not now.
4. Switch to Khmer.

## 16 Oct 2026: Check In Right on the Progress Dashboard

Commit `414b5d1`. No migration.

**Why.** Today's Check in sent people back to Home to pick a mood. Every extra step means fewer check ins.

**What changed for users:**
- **The 5 mood faces are inside Today's Check in.** A tap saves today's mood, the charts above update straight away, and "Saved" shows once the server confirms. Tapping another mood changes it.
- **Same rules as Home:** nothing is preselected, and errors offer Try again.

**What changed for the team:**
- **New** `app/progress/_components/today-check-in.tsx`, using `saveTodayMood()` from the mood store (the same save as Home).

**What to re-test:**
1. Signed in, open Progress Dashboard, tap a mood, confirm "Saved" and that today's point on the chart updates.
2. Tap another mood and confirm it changes; refresh and confirm it stayed.
3. Check a phone width and Khmer.

## 15 Oct 2026: Share Mood Check Ins With a Professional (Coming Soon)

Commit `6d8457b`. No migration.

**Why.** A professional who can see a client's recent moods can prepare better sessions. Rith decided the rules: off by default, moods only, never the journal, and the client can turn it off at any time. The screens are built now; Hok Chheng makes it real.

**What changed for users:**
- **My appointments:** a third sharing option "My mood check ins", shown off and disabled with "Coming soon. Nothing is shared yet. Moods only, never your journal."

**What changed for professionals:**
- **Client file:** a "Mood check ins" card, Coming soon, explaining what will show, with a dimmed example chart labeled "An example, not this client".

**What changed for the team:**
- **New** `app/pro/_components/shared-mood-preview.tsx`; the sharing option in `user-appointments.tsx`. BACKEND-HANDOFF.md section 22 lists the column, the function and the privacy rules.
- **Bar charts** on longer ranges now label dates weekly, so labels never run into each other in narrow cards.

**What to re-test:**
1. On My appointments, open a session's sharing and confirm "My mood check ins" is off, cannot be ticked, and says Coming soon.
2. As a professional, open a client file and confirm the Mood check ins card says Coming soon and "An example, not this client".
3. Switch to Khmer.

## 15 Oct 2026: Activities Tab on Sample Data

Commit `b4af4d2`. No migration.

**Why.** The Activities tab said Coming soon. Rith wants it built now on sample data so Hok Chheng can make it real.

**What changed for users:**
- **Activities tab** shows practices done, lessons read and journal entries for 7 days, 30 days or 3 months, a Recent list, and buttons to Find a practice or Read a lesson.
- **Clearly sample:** the "Sample data, not yours yet" label shows for every range, and signed out visitors see the log in card instead.
- **Private:** journal entries show only the date, never what was written.

**What changed for the team:**
- **New** `app/progress/_components/activities-panel.tsx` and `app/progress/_data/sample-activities.ts` (the `ActivitiesResponse` shape). BACKEND-HANDOFF.md section 22 lists what Hok Chheng needs to save and the endpoint.

**What to re-test:**
1. Signed in, open Mood & Activity Details, Activities, and switch ranges.
2. Confirm the Sample data label, and that no journal text appears.
3. Tap Find a practice and Read a lesson.
4. Switch to Khmer.

## 15 Oct 2026: Insights Tab With Facts From Check Ins

Commit `3f8e3e6`. No migration.

**Why.** The Insights tab said Coming soon. Simple facts about one's own check ins help people notice patterns, as long as the app never judges the mood.

**What changed for users:**
- **Insights tab** in Mood & Activity Details lists facts for 7 days, 30 days or 3 months: how many days you checked in, your most common mood, the span of your moods, the weekday you check in most (longer ranges, only when one clearly leads), and how many days were Low or Very Low.
- **Honest:** a note says "These are only facts from your check ins. AROM never scores or judges your mood." 30 days and 3 months show the Sample data label.

**What changed for the team:**
- **New** `app/progress/_components/insights.ts` (the rules) and `insights-panel.tsx`. Worked out in the browser, so no new endpoint. BACKEND-HANDOFF.md section 22 notes the check in time a later insight would need.

**What to re-test:**
1. Signed in, open Mood & Activity Details, Insights, and compare the facts with your 7 day chart.
2. Switch to 30 days and 3 months and confirm the Sample data label.
3. With one check in, confirm it says "Your one check in was ...".
4. Switch to Khmer.

## 15 Oct 2026: Write About Today From Progress

Commit `913ecc6`. No migration.

**Why.** After checking in, people may want to write about their day. The Progress Dashboard had no way to get to the journal.

**What changed for users:**
- **"Write about today"** under Today's Check in opens the journal, which starts from today's mood.

**What changed for the team:**
- **Only** `app/progress/_components/progress-dashboard-view.tsx`. The journal is still saved in the browser only (BACKEND-HANDOFF.md section 22, Still open); the link keeps working when it moves to the server.

**What to re-test:**
1. Signed in, open Progress Dashboard, tap Write about today and confirm the journal opens with today's mood.

## 15 Oct 2026: AROM Top Bar on the Progress Pages

Commit `61d3249`. No migration.

**Why.** Home, Community and Journal start with the AROM top bar (logo, "A calmer mind, a brighter you", menu and profile button), but the Progress pages did not, so on a phone there was no menu button at the top. Rith asked for the same top bar.

**What changed for users:**
- **Progress Dashboard and Mood & Activity Details** now start with the AROM top bar on phones, and the profile button on computers, the same as Home.

**What changed for the team:**
- **`ProgressShell`** (`app/progress/_components/progress-parts.tsx`) renders the shared `TopHeader`.

**What to re-test:**
1. On a phone width, open both Progress pages and confirm the logo, menu button and profile button, and that the menu opens.
2. On a computer, confirm only the profile button shows at the top right, like Home.

## 15 Oct 2026: Progress Pages Use the Normal Page Header

Commit `0069a7c`. No migration.

**Why.** The Progress pages copied the phone style header from the Figma (back arrow and a centered green title), which looked different from every other page. Rith asked for the normal header.

**What changed for users:**
- **Progress Dashboard:** big left aligned title and a short line under it ("Your mood check ins over time. Only you can see them."), like My appointments. No back arrow, because it is a main page in the menu.
- **Mood & Activity Details:** the same header, with a small "Progress Dashboard" link above the title to go back.

**What changed for the team:**
- **`ProgressShell`** in `app/progress/_components/progress-parts.tsx` takes `subtitle` and an optional `back` link instead of `backHref`.

**What to re-test:**
1. Open both pages on a computer and a phone and compare the header with My appointments.
2. On Mood & Activity Details, tap "Progress Dashboard" and confirm it goes back.
3. Switch to Khmer.

## 15 Oct 2026: Mood Details Easier to Find

Commit `ef50a12`. No migration.

**Why.** The only way from Progress Dashboard to Mood & Activity Details was a small "See details" text in the corner of the Mood Trend card. Rith found it easy to miss, so users would too.

**What changed for users:**
- **See details is a button:** a green outlined pill, larger and easier to tap, in the same place as the Figma.
- **New full width button** at the bottom of the Mood Trend card: "See mood details, Statistics and how your moods are spread".

**What changed for the team:**
- **Only** `app/progress/_components/progress-dashboard-view.tsx`. No data or API change.

**What to re-test:**
1. Signed in, open Progress Dashboard and confirm both buttons open Mood & Activity Details.
2. Check a phone width and Khmer.

## 15 Oct 2026: Progress Dashboard and Mood Details Pages

Commit `9ea69ac`. No migration.

**Why.** The Figma has a Progress Dashboard and a Mood & Activity Details screen, but the app only had a small Your Progress card on Home. People need one calm place to see how their check ins look over time, without the app judging their mood.

**What changed for users:**
- **Progress Dashboard (`/progress`):** a thank you card with the AROM sprout, a 7 days, 30 days and 3 months switch, a Mood Trend line (tap a day to see its mood), and Today's Check in with a Change or Check in button.
- **Mood & Activity Details (`/progress/details`):** Mood Statistics bars in mood colors (tap a bar to see the mood), Mood Distribution donut with the share of each mood, and a short honest note. Activities and Insights say Coming soon.
- **Honest wording:** the pages count check ins ("You checked in 5 of the last 7 days") and never say better or worse, unlike the Figma text.
- **Sample data is labeled:** 30 days and 3 months show "Sample data, not yours yet" until the backend serves them. 7 days is real.
- **Sidebar and Home:** Progress Dashboard in the sidebar and See all on Home open the new page.

**What changed for the team:**
- **New** `app/progress/` (pages, charts, `use-progress.ts`, sample data) and `app/_components/mood/mood-visuals.ts` (mood icons and colors, now also used by the Home check in).
- **`lib/mood.ts`:** `PROGRESS_RANGES`, `RANGE_DAYS`, `moodCounts()`.
- **Mascot** from the Figma saved as `public/progress/mascot.png`, with its sparkle stars removed (AGENTS.md section 7) and resized from 1.4 MB to 195 KB.
- **Backend:** Hok Chheng needs `GET /api/progress?range=30d|90d`; see BACKEND-HANDOFF.md section 22.

**What to re-test:**
1. Signed in, open Progress Dashboard from the sidebar and check the card, the switch and the trend for 7 days against your real check ins.
2. Tap days on the trend and confirm the mood under it.
3. Switch to 30 days and 3 months and confirm the Sample data label.
4. Tap See details, tap bars, check the donut percentages and the Activities and Insights tabs.
5. Tap Change on Today's Check in and confirm it opens the Home check in.
6. Sign out and confirm both pages ask you to log in and show no moods.
7. Check a phone width and Khmer.

## 15 Oct 2026: My Appointments: Message, Add to Calendar, How Soon, Quieter Sharing

Commit `6dd9417`. No migration.

**Why.** After booking, a client had to find the Messages page on their own, had no easy way to remember the session, and had to read a full date to know how soon it was. The sharing box took a third of every card, and ticking a box saved with no sign that it worked, which matters for private health information.

**What changed for users:**
- **Message button** on booked and completed sessions opens the chat with that professional.
- **Add to calendar** on upcoming sessions downloads a calendar file with a reminder 30 minutes before. The title stays neutral ("Appointment with Keo Panharith"), because reminders can show on a locked screen.
- **How soon:** "Today", "Tomorrow" or "In 3 days" next to the date, for sessions less than two weeks away.
- **Sharing folds into one line,** for example "Shared: first survey, symptom check results", with Change to open the boxes.
- **"Saved" appears** after a sharing box is ticked or unticked, and the boxes wait while saving.

**What changed for the team:**
- **New** `app/_components/appointments/appointment-helpers.ts`: `howSoon()` and `downloadCalendarFile()` (an .ics file built in the browser, nothing sent to a server).
- **No API or database change.** The Message button links to `/messages/<professional slug>`, which already lists every professional the client has booked.

**What to re-test:**
1. Open My appointments with an upcoming session and confirm "Tomorrow" or "In N days" shows next to the date.
2. Tap Message and confirm the chat with that professional opens.
3. Tap Add to calendar on a phone and on a computer, and confirm the event has the right time (Cambodia time) and a 30 minute reminder.
4. Tap Change, untick a box, and confirm "Saved" appears and the one line summary updates; reload and confirm it stayed.
5. Switch to Khmer and check every new label.

## 15 Oct 2026: Session Times Show When They End

Commit `af68d08`. No migration.

**Why.** When booking, each time button showed only the start ("9:00 AM"), so a client could not see how long the session was before choosing. After booking, My appointments showed the same session in another format ("09:00 to 10:30"), and in Khmer the word "to" stayed in English.

**What changed for users:**
- **Booking shows the end time:** each time button now shows the start with "to 10:30 AM" underneath, and the review and confirmation steps show "9:00 AM to 10:30 AM".
- **One format everywhere:** My appointments now shows "9:00 AM to 10:30 AM", the same as booking.
- **Khmer reads correctly:** the range reads "9:00 AM ដល់ 10:30 AM" in Khmer.

**What changed for the team:**
- **Shared helpers in `lib/booking.ts`:** `timeLabel()` and `timeRangeLabel()` format Cambodia time for both pages. `BookableTime` now carries `endsAt` and `endLabel` (from `availability_slots.ends_at`, already loaded). No API or database change.

**What to re-test:**
1. Open a professional's booking page, choose a session type and check each time button shows the start and "to" the end time, on a phone width too.
2. Choose a time and confirm the review step and the confirmation show "9:00 AM to 10:30 AM".
3. Open My appointments and confirm the same format.
4. Switch to Khmer and confirm both pages read "ដល់" instead of "to".

## 15 Oct 2026: Point Share Images at the Vercel Domain

Commit `c6f0774`. No migration.

**Why.** The deployed page included Open Graph and Twitter image tags, but those tags pointed to `arom.app`, which did not return the image to the preview crawler. The app is currently shared from `arom-version1.vercel.app`.

**What changed for users:**
- **Image previews can load from the shared domain:** Share image URLs now resolve against `https://arom-version1.vercel.app`.

**What changed for the team:**
- **Metadata base:** Updated the root `metadataBase` value in `app/layout.tsx`. No image assets or page copy changed.

**What to re-test:**
1. Deploy the change to Vercel.
2. Confirm the page HTML points `og:image` and `twitter:image` to `arom-version1.vercel.app`.
3. Refresh the link preview and confirm the image appears when sharing the clean URL.

## 15 Oct 2026: Reworked AROM Share Image

Commit `8ed13f8`. No migration.

**Why.** The previous share image felt generic and did not give AROM’s calm, human wellness experience a distinctive first impression.

**What changed for users:**
- **A more personal preview:** The share image now features a warm, editorial illustration of a Cambodian woman breathing calmly, framed by botanical forms in the AROM palette.
- **Clearer brand and message:** The exact AROM mark and approved English copy sit in a spacious layout with a safe margin for social crops.

**What changed for the team:**
- **Updated image assets:** Replaced `app/opengraph-image.png` and `app/twitter-image.png` with matching 1200 by 630 PNGs. The generation prompt is embedded in both images. The existing metadata base remains in place.

**What to re-test:**
1. Confirm both image files are 1200 by 630 and under 5 MB.
2. Share a deployed page in Facebook and LINE preview tools and confirm the Open Graph image appears without cropping the logo or copy.
3. Share a deployed page on X and confirm the Twitter image appears with the same composition.

## 15 Oct 2026: Honest Home: Real Mood Check In, Real Progress, Greeting by Time of Day

Commit `8ed13f8`. Migration `20261015000400_mood_checkins_api.sql` must be run in Supabase. It runs on its own (it also creates `cambodia_today()`, the same as `20261015000100`).

**Why.** Home showed every person, signed in or not, the same made up week of moods, a "Your mood is improving" headline and a fake streak. The mood check in started with "Good" already chosen, left the page as soon as you tapped, and kept the mood in browser storage where anyone on a shared phone could read it. The greeting said "Good morning" at any hour. In a mental health app these break trust. This is Phase 1 of the AROM Predictability Fix Plan.

**What changed for users:**
- **Mood check in that saves and stays:** nothing is chosen until you pick. A tap saves today's mood and shows "Saved" once the server confirms it, or "Could not save" with Try again. It no longer opens the journal; the "Write reflection in Journal" link does that. "low" now reads "Low".
- **Changing your mind:** tapping another mood the same day replaces the first one. The day follows Cambodia time.
- **Your Progress is real:** it shows your own last 7 days. Days without a check in stay blank. The summary counts check ins ("You checked in 3 times this week") instead of judging. The fake streak, statistics and the full progress window are gone.
- **Clear states:** signed out visitors see "Keep track of your week" with Log in. A new account sees "Your week will show here". A loading or error state shows while the week loads or if it fails.
- **Greeting by time of day:** Good morning, Good afternoon, Good evening, or Hello late at night, in English and Khmer.
- **Journal starts from today's mood:** it reads your check in from the server. The mood is no longer in the page address.

**What changed for the team:**
- **New API:** `POST /api/mood-checkins` and `GET /api/progress`, through `lib/controllers/mood-controller.ts`. Shared types and Cambodia day helpers are in `lib/mood.ts`.
- **New store:** `app/_components/mood/mood-store.ts` holds the week in memory only and removes the old `arom_today_mood` browser key.
- **Migration:** one mood per person per day (unique index), `checked_in_on` defaults to Cambodia today, and a `security definer` function `save_mood_checkin()`.
- **BACKEND-HANDOFF.md:** new section 22 and a status board row.
- **Still open:** journal entries themselves are still saved only in browser storage (`arom_journal_entries`).

**What to re-test:**
1. Run the migration in Supabase.
2. Signed out, open Home. Check that Your Progress shows "Keep track of your week" and that tapping a mood shows "Log in to save your mood".
3. Sign in with a new account. Check that nothing is selected and that Your Progress shows "Your week will show here".
4. Tap "Okay". Check that "Saved" appears, the page stays, and a refresh still shows "Okay". Then tap "Good" and refresh again.
5. Check that Your Progress now shows today with one check in, and the other days blank.
6. In the browser's developer tools, check that `localStorage` has no `arom_today_mood` key.
7. Open the journal from the link. Check that it starts with today's mood and the address has no `?mood=`.
8. Check the greeting at different hours (change the computer clock) in English and Khmer.
9. Turn off the network and tap a mood. Check that "Could not save" and Try again appear.

## 15 Oct 2026: Refined Mobile Journal Styling

Commit `8ed13f8`. No migration.

**Why.** The mobile journal screen needed a calmer, more consistent visual treatment while preserving the familiar check in flow and all of its existing controls.

**What changed for users:**
- **Clearer selections:** Mood and feeling choices use consistent AROM green styling, accessible focus outlines, and calm line icons.
- **Balanced voice languages:** Khmer and English now have equal width in the voice language selector.
- **More comfortable controls:** Journal inputs, voice controls, and key actions have clearer borders, improved text contrast, and larger touch targets.

**What changed for the team:**
- **Journal screen styling:** Refined the existing responsive styles in `app/detection/journal/page.tsx` without changing the section order or interaction flow.

**What to re-test:**
- Open Detection on a phone and confirm the original section order and bottom navigation remain in place.
- Select each mood and feeling, then switch between Khmer and English voice input and confirm both options have equal width.
- Enter text, use the voice controls, and save a journal in English and Khmer.

---

## 15 Oct 2026: Profile Picture Opens an Account Menu

Commit `8ed13f8`. No migration.

**Why.** Tapping the profile picture at the top of a page, or the profile card at the bottom of the sidebar, took signed in people straight to the profile page. Logging out took extra steps, and other apps have taught people to expect a small menu here. The professional and admin areas already had this menu, so the user pages now work the same way.

**What changed for users:**
- **Small menu on the profile picture:** signed in people who tap their picture on Home, MindGuide, the professional directory or any page with the top header now see their name, email and role, with "My profile" and "Log out". The menu is in English and Khmer.
- **Same menu in the sidebar:** the profile card at the bottom of the desktop sidebar opens the same menu, above the card. Its icon is now a small arrow that points up, not a gear.
- **Closes the usual ways:** tapping outside the menu or pressing Escape closes it. The menu fades in gently, or appears without movement when the device asks for reduced motion.
- **Visitors who are not signed in:** nothing changes. The picture still links to the profile page, which shows them how to sign in.

**What changed for the team:**
- **One shared menu:** `app/_components/account-menu.tsx` now has a shared panel. `AccountMenu` (pro and admin) and the new `ProfileMenu` (any avatar or card) both use it. `ProfileMenu` takes `placement="up"` for buttons at the bottom of the screen.
- **Sidebar clips overflow:** the sidebar uses `overflow: hidden`, so the menu that opens upward is exactly as wide as the card.

**What to re-test:**
1. Sign in as a user and open Home. Tap the profile picture at the top right. Check the menu shows "My profile" and "Log out".
2. Tap "My profile" and check that `/profile` opens and the menu closes.
3. Open the menu again and tap "Log out". Check that you are signed out.
4. On a desktop window, click the profile card at the bottom of the sidebar. Check the menu opens above the card and is not cut off.
5. Repeat step 1 on MindGuide and on the professional directory, and on a phone sized window.
6. Switch to Khmer and check the menu text is in Khmer.
7. Sign out and tap the profile picture. Check that it goes straight to `/profile`.

## 15 Oct 2026: Open Graph Social Share Image

Commit `8ed13f8`.

**Why.** Shared links needed a clear, branded preview that reflects AROM’s calming wellness experience and works across social and messaging platforms.

**What changed for users:**
- **Branded link previews:** Open Graph and X previews now use the same AROM share image with the provided logo, headline, supporting text and a calm illustration.

**What changed for the team:**
- **Image metadata:** Added 1200 × 630 PNG assets at `app/opengraph-image.png` and `app/twitter-image.png`, plus `metadataBase` for absolute preview URLs.

**What to re-test:**
- Share a deployed page in a social preview debugger and confirm the Open Graph image resolves at 1200 × 630.
- Share a deployed page on X and confirm the Twitter image resolves.
- Confirm the image files remain under 5 MB.

---

A plain-language log of what changed in the app, written for the team rather than for developers. Newest entries first.

- **This file** = what changed, why, and what you need to know or re-test.
- **AGENTS.md** = the technical context file the AI coding assistant reads. Different audience, much more detail. You do not need to read it.

Each entry lists the commit it landed in, so you can match it to a version of the site.

## 15 Oct 2026: Gentle Motion for Two Windows and the Tick

Commit `8ed13f8`. No migration.

**Why.** The "Give a care task" and "Suggest a session" windows popped in and vanished with no transition, unlike the mobile menu, which slides. Ticking a care task, the client's main action between sessions, gave almost no feedback.

**What changed for users:**
- **Ticking a task** (Your Plan For Today and `/care-plan`): the circle presses in slightly, and the check settles in (160 to 180 ms). Nothing moves when the page loads.
- With "Reduce motion" turned on in the device settings, the check only fades.

**What changed for professionals:**
- **Give a care task and Suggest a session** slide up from the bottom on phones (300 ms) and leave the same way. On larger screens they fade in from slightly smaller (200 ms). The MindGuide browser opened from Give a care task is not affected.

**What changed for the team:**
- New `app/pro/_components/sheet-dialog.tsx` (`SheetDialog`): bottom sheet on phones, modal from `sm`, plays the exit before the window is removed, honours reduced motion. Uses `motion/react`, `--ease-out` and the drawer curve `cubic-bezier(0.32, 0.72, 0, 1)`.
- `TickIcon` in `daily-plan-card.tsx` (all three tick buttons there) and the tick in `user-care-plan.tsx`.

**What to re-test:**
- On a phone width, open Give a care task and Suggest a session, close them with Cancel, the X and after giving a task: each slides down before it disappears;
- Tick and untick a task on the home page and `/care-plan`: the check settles in, and nothing animates on page load;
- Turn on Reduce motion and repeat: fades only.

---

## 15 Oct 2026: Real Private Notes, Real Shared Results, No More Yellow Note in /pro

Commit `ffc6bed`. Migration `20261015000300_pro_private_notes.sql` must be run in Supabase (after the earlier 14 and 15 Oct migrations).

**Why.** The last parts of the professional area that were not saved were the plan written before a session and the pinned summary per client. "Shared by the client" also showed sample results instead of what the client really shared. And professionals could read every column of their clients' profile rows, more than they need.

**What changed for professionals:**
- **Plan for this session** (Prepare page) and **Summary note** (client file) are saved, private to you. If saving fails, you are told.
- **Shared by the client** now shows the client's real latest survey and symptom check scores, only while they share them. Scores and levels only, never their answers.
- **Client language** in the client file is the client's real app language.
- **Clients in Anonymous Mode** show as "Client" instead of their name.
- **The yellow note at the top of `/pro` is gone.** Everything in `/pro` is saved, except My podcasts.

**What changed for the team:**
- New tables `session_prep_notes` and `client_summary_notes` (owner only RLS, no admin read). Dropped the policy "Professionals read their clients' profiles". `my_client_names()` now returns `language` and respects Anonymous Mode.
- `POST /api/pro/bookings/:id` accepts `{ action: "prep", text }`. `/api/pro/clients/:clientId` now has `GET` (shared results) and `POST { summaryNote }` next to `{ archived }` (moved to `pro-controller.ts`). `ProBooking.clientLanguage` added.
- Removed unused demo code: `sampleBookingsFor`, demo profiles and schedule, `DEMO_MEETING_URL`, `SAMPLE_SHARED`.
- **Fix: admin Professionals said "Could not load professionals"** after the care plan migration. `care_sharing` and `client_summary_notes` link professionals to clients with a two column primary key, so the database API found a second path from `professional_profiles` to `profiles` and refused the embedded `profiles(...)`. The query now names the foreign key (`profiles!professional_profiles_id_fkey`). Any new embed between these two tables must do the same.
- Tested on a local Postgres: notes saved, note refused for someone who never booked, client of a note cannot be changed, other professionals, the client and admins see no notes, shared symptom checks visible and unshared survey hidden, profile row no longer readable, Anonymous Mode hides the name.

**What to re-test (after running the migration):**
- Open a booking's Prepare page, write a plan, save, refresh: it stays;
- Open a client file, write a summary note, save, refresh: it stays;
- As the client, turn on sharing of symptom checks for the booking and take a symptom check; as the professional, confirm the score shows in the client file and Prepare page; turn sharing off and confirm it disappears;
- Confirm the yellow note is gone from `/pro`.

---

## 15 Oct 2026: Real Suggested Sessions, Repeating Series and Quick Replies

Commit `ffc6bed`. Migration `20261015000200_sessions.sql` must be run in Supabase (after `20261014000700_messages.sql`).

**Why.** "Suggest a session", repeating series and quick replies only worked in the professional's own browser and were lost on refresh, so clients never saw a suggestion. Booking a series also needs to be safe: either every session is booked or none is.

**What changed for users:**
- **Suggested times arrive in Messages** from your professional. Pick one and tap Book: every session of a repeating series is booked at once. If any of them was just taken, nothing is booked and you are told so.
- **Repeating sessions are marked** "Repeating" in the Next session strip.

**What changed for professionals:**
- **Suggest a session is saved and sent** to the client's chat. Only times open in your schedule and free for the whole series can be sent. You can withdraw it while the client has not chosen.
- **Booked series show in My bookings** as "Session 2 of 4" and so on. Home "Needs your attention" counts suggestions still waiting.
- **Quick replies are saved** to your account. There are no sample replies any more; add your own with Edit.
- **The yellow note** now reads "Not saved yet: podcasts, summary notes and session prep."

**What changed for the team:**
- New table `session_suggestions`, `appointments.series_id`, `messages.kind 'suggestion'` with `suggestion_id`, table `quick_replies`. Functions `suggest_session`, `withdraw_session_suggestion`, `accept_session_suggestion`, `save_quick_replies`.
- **Open times can no longer overlap a booked session:** two triggers keep `availability_slots.is_booked` in line with booked sessions, including sessions booked past the booking window.
- New `lib/sessions.ts`, `lib/controllers/sessions-controller.ts`, routes `/api/pro/suggestions` (+ `/:id/withdraw`), `/api/suggestions/:id/accept`, `/api/pro/quick-replies`. Chat threads return their suggestions.
- Tested on a local Postgres (see BACKEND-HANDOFF.md section 19).

**What to re-test (after running the migration):**
- As a professional with a schedule, open a client's chat, Suggest a session with 2 times, "Every week, 4 sessions";
- As the client, open Messages, confirm the card, pick a time and Book 4 sessions; confirm 4 sessions on `/appointments`;
- As the professional, confirm My bookings shows "Session 1 of 4" and the card shows Booked;
- Suggest again and Withdraw; confirm the client sees it was withdrawn;
- Add a quick reply, refresh, confirm it is still there, then use it in a message.

---

## 15 Oct 2026: Real Care Plans

Commit `ffc6bed`. Migration `20261015000100_care_plans.sql` must be run in Supabase (after `20261014000700_messages.sql`, which it uses for archived clients).

**Why.** Care tasks between sessions were sample data in the browser's memory, always shown as "Sok Dara", and lost on refresh. Professionals need to give real clients small steps between sessions, and clients need to see and tick them, with progress private unless they choose to share it.

**What changed for users:**
- **Your care plan is real.** Tasks from your professional show on `/care-plan` and today's ones in Your Plan For Today on the home page, with their real name and photo.
- **Ticks are saved.** You can tick a task on the days it is due. A one time task or goal is ticked once.
- **Sharing is your choice and is saved.** Off by default. While it is off, your professional cannot see any of your ticks, including old ones.

**What changed for professionals:**
- **Give a task is saved** (MindGuide item, mission, goal or reminder), from the client file or after a session in My bookings. Errors show in the window.
- **Stop a task** moves it to the client's past tasks.
- **Progress** in the client file, Prepare page and Home appears only for clients who share it.
- You cannot give tasks to an archived client, or to someone without a booked or completed session.
- The yellow note now reads "Not saved yet: podcasts, quick replies, session suggestions, summary notes and session prep."

**What changed for the team:**
- New tables `care_tasks`, `care_check_ins`, `care_sharing` with RLS (no admin read), functions `give_care_task`, `stop_care_task`, `set_care_check_in`, `set_care_sharing`, `my_care_professionals`, `can_read_care_check_ins`, `care_task_due_on`, `cambodia_today`.
- New `lib/care.ts` (types and rules shared by the browser and the API), `lib/controllers/care-controller.ts`, routes `/api/care-plan` (+ `/check-ins`, `/sharing`), `/api/pro/care` (+ `/:taskId/stop`). `useCareStore` now takes the side. `demo-client.ts` deleted.
- Tested on a local Postgres (see BACKEND-HANDOFF.md section 18).

**What to re-test (after running the migration):**
- As a professional, open a client with a completed session, give a mission every day and a MindGuide lesson once;
- As that client, confirm both show on `/care-plan` and today's in Your Plan For Today; tick one, refresh, confirm it stays ticked;
- As the professional, confirm you see no progress; as the client, turn sharing on; as the professional, confirm the tick shows; turn sharing off and confirm it disappears;
- Stop a task and confirm it moves to past tasks on both sides;
- Archive the client and confirm Give a task is refused.

---

## 14 Oct 2026: Phone Menu Labels No Longer Overlap

Commit `035807b`. No migration.

**Why.** On narrow phones the bottom menu label "Professional" ran into "Community", so both were hard to read.

**What changed for users:**
- **Bottom menu labels fit** on phones as narrow as 320 pixels. Labels are slightly smaller below 380 pixels. A label that still does not fit (for example a long Khmer word) ends with "..." instead of covering its neighbour.

**What changed for the team:**
- `MobileNavigation` in `app/_components/app-navigation.tsx`: menu items get `min-w-0`, labels truncate, smaller text and side padding below 380 pixels.

**What to re-test:**
- Open any user page at 320 and 375 pixels wide, in English and Khmer, and confirm the five labels do not touch.

---

## 14 Oct 2026: Real Messages Between Clients and Professionals

Commit `67736cf`. Migration `20261014000700_messages.sql` must be run in Supabase (it also creates the private `message-voice` storage bucket).

**Why.** Messages in `/messages` and `/pro/messages` were sample data kept in the browser's memory, so nothing was saved and the user side always showed "Sok Dara". Clients and professionals need a private way to talk between sessions, with text and voice, and only after a real booking.

**What changed for users:**
- **Messages are real and saved.** You see every professional you have a booked or completed session with, with their real name, photo and reply time.
- **Text and voice messages** (up to 2 minutes) are sent to the server and kept. New messages and "Seen" appear within about 10 seconds while the chat is open.
- **Only you and your professional can read them.** Admins cannot. Voice recordings are stored privately and open only through a link that expires after 5 minutes.
- **Next session strip** in a chat now shows your real next booking with that professional, with Join for online sessions.
- **Read only when it should be:** if all your sessions with someone were cancelled, or the professional archived you, the chat shows why and you cannot send.

**What changed for professionals:**
- **Your clients' messages are real,** with unread counts on the list, Home "Needs your attention" and the Prepare page.
- **Reply time you choose is saved** and shown to clients.
- **Archive client is saved.** It closes the chat for both of you (messages are kept). Restore client opens it again.
- Quick replies and "Suggest a session" in the chat still work in this browser only (they are not connected yet).
- **The yellow note at the top of `/pro`** now reads "Not saved yet: care plans, podcasts, quick replies, summary notes and session prep." Messages are no longer listed, and the note stays on the same line as the language switch and account menu.

**What changed for the team:**
- New tables `conversations` and `messages`, column `professional_profiles.reply_time`, private bucket `message-voice`. No admin read policy on any of them.
- Writes only through security definer functions: `open_conversation`, `send_message`, `mark_conversation_read`, `set_client_archived`; list through `my_conversations(side)`. Writing needs a booked or completed appointment and an active professional account; suspended senders are blocked.
- New `lib/messages.ts` (types), `lib/controllers/messages-controller.ts`, routes `/api/messages`, `/api/messages/:slug` (+ `/read`), `/api/pro/messages`, `/api/pro/messages/:clientId` (+ `/read`), `/api/pro/clients/:clientId` (archive), `/api/voice/:messageId`. `GET /api/pro/me` now returns `archivedClients`.
- `message-store.ts` now loads from the API and checks again every 10 seconds (open chat) or 30 seconds (lists). Supabase Realtime can replace this later.
- Voice files are checked by their first bytes (WebM, Ogg or MP4 audio, 5 MB at most) and removed again if sending fails.
- Tested on a local Postgres: cancelled only booking cannot write, both sides write after booking, no direct inserts, read receipts, other users and admins see 0 messages and 0 files, voice folder rules, archive closes and reopens, suspended professional and suspended client refused, signed out visitors refused.

**What to re-test (after running the migration):**
- As a user with a booking, open Messages, send a text and a voice message;
- As that professional, open `/pro/messages`, confirm the unread count, open the chat, reply, and play the voice message;
- Back as the user, confirm the reply arrives and your last message shows "Seen";
- Change the reply time in `/pro/messages` and confirm the user sees the new text;
- Archive the client in their client file, confirm both sides can no longer send, then restore;
- As an admin, confirm there is no way to see these messages.

---

## 14 Oct 2026: Real Users Page, Real Audit Log, Nightly Open Times

Commit `48378f1`. Migration `20261014000600_admin_users_open_times.sql` must be run in Supabase.

**Why.** The admin Users page and the Audit log showed sample data, while real admin actions were already being saved. And professionals' open times only moved forward when they opened their area.

**What changed for admins:**
- **Users page shows every real account** with email, last sign in, and activity as counts only (days active in the last 30 days, check ins, bookings). Your own card is marked, so you cannot change yourself.
- **Make professional** for someone you know records their title, license number and issuing body and makes them a verified professional straight away. They then fill in their own public profile.
- **Make admin** and **remove admin** work, with the confirm box. AROM never lets you remove the last active admin, or change your own role.
- **Suspend asks for a reason,** which goes in the audit log. The text now says what suspension really does: they can still sign in to see or delete their own data, but cannot book, post or publish, and a professional is hidden.
- **Errors show inside the window** if something is refused.
- **Audit log shows the real history:** who did what, to whom, when, with the reason or note. Nobody can edit or delete these lines.

**What changed for professionals and users:**
- **Open times refresh every night** at 00:05 Cambodia time for the whole booking window, even if the professional does not open AROM.

**What changed for the team:**
- New database functions `admin_list_users()`, `refresh_all_open_times()` and a new 6 argument `set_user_role()` (the old 2 argument version is replaced). pg_cron job `arom-refresh-open-times`.
- New `lib/controllers/audit-controller.ts` and `GET /api/admin/audit-log`; `GET /api/admin/users` and `PATCH /api/admin/users/:id/role` rewritten.
- Tested on a local Postgres: emails and counts, promotion with license, own role refused, last active admin protected (including when the other admin is suspended), non admins refused, the nightly job makes the right times and adds nothing the second time.

**What to re-test (after running the migration):**
- Open Users: confirm real accounts, emails and your own card marked;
- Make a test account a professional with license details; confirm it appears on Professionals as live after they complete their profile;
- Suspend it with a reason, then restore it; open Audit log and confirm both lines with the reason;
- In Supabase, Integrations, Cron, confirm the job `arom-refresh-open-times` is listed.

---

## 14 Oct 2026: Sign Up Confirmation That Works on Any Device

Commit `48378f1`. No migration. **Supabase dashboard changes needed** (see the last section).

**Why.** People who opened the confirmation email on their phone saw "Link expired, let's try that again" even though their email was already confirmed. Supabase's default link only finishes signing in on the browser that signed up. Signing up again with an existing account also left people waiting for an email that never came.

**What changed for users:**
- **Confirmed means confirmed.** If the link is opened on another device, AROM says "Your email is confirmed. Log in to continue" instead of "expired".
- **Signed in automatically** when the link is opened where it can finish, and taken home.
- **6 digit code:** the Check your email page has a "Have a code from the email?" box. Typing the code signs you in on that device.
- **Link used or expired page** now leads with "I already confirmed, log in", and offers a new link second.
- **Signing up with an account you already have:** with the right password you are simply logged in. If the account is not confirmed yet, a new link is sent. With a wrong password the answer looks like a normal sign up, so the form cannot be used to find out who has an account.
- **Passwords** are limited to 72 characters (the most Supabase can store).

**What changed for the team:**
- `confirmEmail` in `lib/controllers/auth-controller.ts` handles: success, a code that cannot finish on this device, an already signed in visitor, and real expiry. New `POST /api/auth/verify` checks the 6 digit code.
- `safeNextPath` in `lib/auth.ts` is the one place that checks redirect paths; it also rejects `/\host` and control characters (open redirect protection).

**Supabase dashboard (Authentication):**
1. **Email Templates, Confirm signup:** use a link that works on every device and include the code:
   `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>` and `Or enter this code: {{ .Token }}`
2. **URL Configuration:** Site URL is the Vercel URL, and both the Vercel and `http://localhost:3000` addresses are in Redirect URLs.
3. **Attack Protection:** turn on leaked password protection if the plan allows it.
4. **Email OTP expiration:** 1 hour is a good balance.

**What to re-test:**
- Sign up on a laptop, open the email on a phone: you are signed in on the phone (new template) or told your email is confirmed (old template), never "expired";
- Type the 6 digit code on the laptop and confirm you land on Home signed in;
- Open the same link twice: the second time you go home if signed in, or see "This Link Can't Be Used" with Log in first;
- Sign up again with the same email and right password: you are logged in; with a wrong password: you see Check your email.

---

## 14 Oct 2026: My Appointments for Users

Commit `48378f1`. No migration.

**Why.** A user could book a real session but could not see it anywhere afterwards, cancel it, or find the meeting link. The sidebar "Appointments" item still said Soon.

**What changed for users:**
- **New My appointments page** (`/appointments`, sidebar "Appointments"): upcoming sessions first, then past and cancelled ones, with the professional's photo, date and time in Cambodia time, and online or in person.
- **Join** opens the professional's meeting room from 10 minutes before an online session.
- **Cancel** an upcoming session, with an optional reason the professional sees. The time opens again for others.
- **See changes:** if the professional moved or cancelled a session, the reason shows on the card.
- **Sharing switches** per session: share your first survey or symptom check results with that professional, off by default, and you can turn them off at any time. Journal and mood check ins are never shared.
- **"View Appointment"** after booking now opens this page, and a "Get help now" link stays at the top.

**What changed for the team:**
- **New endpoints** `GET /api/appointments` and `POST /api/appointments/:id` (`cancel` or `sharing`), in `lib/controllers/appointments-controller.ts`. They run as the user, so RLS returns only their own appointments.
- **`JoinButton`** now accepts any session with the fields it needs, not only `ProBooking`.
- **`/appointments`** is added to `PROTECTED_PREFIXES`.

**What to re-test:**
- Book a session as a user, tap View Appointment, and confirm it shows under Upcoming;
- Turn on "My symptom check results", refresh, and confirm it stayed on; turn it off again;
- Cancel it with a reason; confirm it moves to Past and cancelled, and the professional sees the reason in My bookings;
- As the professional, move another session; confirm the user sees the new time and the reason;
- Open the page signed out and confirm it asks you to log in; switch to Khmer.

---

## 14 Oct 2026: Admin Test Profile in the Professional Area

Commit `bbcf651`. Migration `20261014000500_admin_test_profile.sql` must be run in Supabase.

**Why.** Admins open the professional area to test it, but an admin account had no professional profile, so the page failed with "We could not load your professional area."

**What changed for admins:**
- **Opening `/pro` creates your own test profile** the first time. You can fill in the profile, open times, and see bookings, exactly like a professional.
- **Test profiles stay private:** only admins see them in Find a professional and only admins can book them. A note on the professional Home says so.
- **Clear messages** when an account cannot use the area (for example a normal user), instead of a vague error.

**What changed for the team:**
- New column `professional_profiles.is_test` and function `ensure_admin_test_profile()`; `is_listed_professional`, `sync_availability_slots` and three policies now allow admins for their own test profile.
- Tested on a local Postgres: real users and signed out visitors never see the test profile, a normal user cannot create one or book it, a second admin can book it.

**What to re-test (after running the migration):**
- As an admin, open `/pro`; confirm the test profile note and your name;
- Complete the profile and open hours; confirm Find a professional shows you while signed in as admin, and not when signed out or as a normal user;
- Book it from a second admin account and confirm it appears in My bookings.

---

## 14 Oct 2026: Brand Header on Home, Detection, Journal and Community

Commit `b54ad45`. No database changes.

**Why.** The top of these pages showed a level, XP bar, streak and coins that are not real yet. That felt like a game more than a calm wellness space. The header now matches MindGuide and Find a professional: the AROM logo with its tagline, a menu button and the profile picture.

**What changed for users:**
- **New header on mobile:** AROM logo and "A calmer mind, a brighter you" on the left, the menu button and profile picture on the right.
- **Level, XP, streak and coins are gone** from the top of Home, Detection, Journal and Community.
- **On desktop** only the profile picture shows at the top right, because the sidebar already has the logo and menu.

**What changed for the team:**
- **`TopHeader` (`app/components/top-header.tsx`) no longer takes `level`, `currentXp`, `maxXp`, `streak` or `coins`.** It only takes an optional `onOpenSidebar`.

**What to re-test:**
1. On a phone, open Home, Detection, Detection Journal and Community. Check the logo, tagline, menu button and profile picture show in one row.
2. Tap the menu button and check the side menu opens.
3. Tap the profile picture and check it opens your profile.
4. Switch to Khmer and check the tagline is in Khmer.
5. On a laptop, check only the profile picture shows at the top right.

---

## 14 Oct 2026: Real Professionals, Real Schedules, Real Bookings

Commit `ba16e09`. Migration `20261014000400_pro_profile_booking.sql` must be run in Supabase (after `20261014000200` and `20261014000300`).

**Why.** AROM's main job is to let someone find a therapist and book a session. Until now every step was pretend: profiles, open times and bookings vanished on refresh, and the list of professionals was sample data. Now the whole path is real.

**What changed for professionals:**
- **My profile is saved.** Photo, bio in both languages, specialties, languages, session types, price and years of experience save at once. Name, title and license changes wait for an admin, and the public profile keeps the old value until then.
- **My schedule is saved** and turns into real open times for the booking window. Saving never cancels a booked session.
- **My bookings are real:** cancel or move a session with a reason, mark completed or did not come (only after it ends), write a private note, change the meeting link.
- **Home shows "Your profile is live"** only when users can really find you.
- **The demo switch is gone.** A small note says what is still demo (messages, care plans, podcasts, summary notes, session prep).

**What changed for users:**
- **Find a professional** shows only real professionals whose profile is complete and who have open times. Until the first one is ready, it says no professionals are available yet.
- **Booking shows real open times** in Cambodia time, grouped by morning, afternoon and evening, and books instantly. If someone else just took the time, the page says so and offers another time.
- **Ratings are hidden** while a professional has no reviews.

**What changed for admins:**
- **Profile changes to review** now arrive on the Professionals page; approve or decline them together (declining needs a reason).

**What changed for the team:**
- **New endpoints:** `/api/pro/me`, `/api/pro/profile`, `/api/pro/profile/changes`, `/api/pro/photo`, `/api/pro/schedule`, `/api/pro/bookings/:id`, `/api/bookings`, `/api/admin/professionals/:id/changes/review`.
- **New database pieces:** `professional_profile_changes`, `professional_schedules`, `professional-photos` bucket, and functions `review_profile_changes`, `sync_availability_slots`, `is_listed_professional`, `list_public_professionals`, `public_open_slots`, `reschedule_appointment`, `my_client_names`. `book_appointment` and two guard triggers were updated.
- **Tested** every migration and the full flow on a local Postgres (see BACKEND-HANDOFF.md section 16).
- **Known gaps:** open times roll forward only when the professional opens `/pro` (a daily job is better); old photos are not deleted; users have no "My appointments" page yet.

**What to re-test (after running the migration):**
- As a professional: fill in photo, both bios, specialties, languages, session types and price; save; refresh and confirm it stayed;
- Change your name and confirm it shows as waiting; approve it as an admin on Professionals and confirm it changes;
- Open weekday hours in My schedule and save; confirm Home says your profile is live and View profile opens;
- Signed out, open Find a professional and confirm you appear; open your profile;
- As a user, book a time; confirm it appears in the professional's My bookings with the meeting link;
- As the professional, move it with a reason, then cancel it, and confirm the time opens again;
- Try booking a time less than the minimum notice away and confirm it is refused.

---

## 14 Oct 2026: Crisis Helplines Reach Users

Commit `ba16e09`. Migration `20261014000300_crisis_resources.sql` must be run in Supabase.

**Why.** The Overview page warned "No crisis hotlines added yet" (real), but the Settings page that should fix it only saved in the browser, so users in crisis never saw a number. On a mental health app this is the most important thing to get right.

**What changed for users:**
- **"Get help now"** in Profile and Settings now shows the helplines the AROM team adds, with Call, Text and Website buttons. Signed out visitors can see them too. The message to contact local emergency services always stays on top.

**What changed for admins:**
- **Crisis helplines in Settings are saved for real:** add, edit, hide, reorder and delete. The Urgent alert on Overview clears once an active helpline exists.
- **Clear errors** inside the edit window if the server refuses a helpline.
- **Every save is in the audit log,** including the names of removed helplines.

**What changed for the team:**
- **New endpoints** `GET /api/crisis-resources` (public) and `GET`/`PUT /api/admin/crisis-resources`.
- **New database function** `save_crisis_resources()` saves the whole list in one go; the table now has the same checks as the form.
- **Removed** the empty mock list `CRISIS_HELPLINES` and `initialCrisisHelplines`.
- **Still mock:** the AROM support contact (email and phone for app questions).

**What to re-test (after running the migration):**
- In Admin, Settings, add a helpline with a phone number and both names; refresh and confirm it is still there;
- Confirm the Urgent alert on Overview is gone;
- Open Profile as a user, and the page signed out, and confirm the helpline shows under Get help now with a working Call button;
- Hide it and confirm users no longer see it; reorder two and confirm the order on the user page;
- Try a website without https and confirm it is refused.

---

## 14 Oct 2026: Admin Professionals Page Uses Real Data

Commit `ba16e09`. Migration `20261014000200_account_status.sql` must be run in Supabase.

**Why.** The Professionals page showed sample therapists, so admins could not review the real people who apply. Now it shows real applicants and professionals, and every decision is saved.

**What changed for admins:**
- **Real list:** new applicants, live professionals, suspended and rejected, all from the database. The demo banner is gone on this page.
- **Open the license file** from the review window. It opens a private link that works for one minute.
- **Approve and reject** are saved; rejecting needs a reason the applicant sees.
- **Suspend and reinstate** are saved, with a reason for suspending. You cannot suspend yourself. Every change goes to the audit log.
- **Errors show in the window** if something fails, instead of pretending it worked.

**What changed for the team:**
- **New endpoints:** `GET /api/admin/professionals`, `GET /api/admin/applications/:id/license`, `PATCH /api/admin/users/:id/status`.
- **New database function** `set_account_status()`; the Users page can use it too.
- **Provider:** `professionalRecords` holds the real list; the old sample `professionals` stays for the demo pages that still use it.
- **Not built yet:** reviewing profile changes (needs a new table) and a stored `source` column.

**What to re-test (after running the migration):**
- Open Professionals and confirm your real applicant shows as New application;
- Open them, click Open file, and confirm the license opens;
- Approve one and confirm they become Live; reject another with a reason;
- Suspend a live professional with a reason, confirm Suspended, then Reinstate;
- Try suspending without a reason and confirm it is refused.

---

## 14 Oct 2026: Account Menu and a Reason When Rejecting

Commit `59b737a`. No migration.

**Why.** Admins and professionals had no quick way to see who they are signed in as or to log out from their area. And the dashboard Reject button sent no reason, which the database now refuses, so admins saw an error with nowhere to type.

**What changed for admins and professionals:**
- **Account button at the top right** of `/admin` and `/pro`: initials, name and role. It opens a menu with My profile and Log out. English only in the admin area, bilingual in `/pro`.
- **Reject asks for a reason** on the admin Overview. "Confirm reject" stays off until a reason is typed; the applicant sees it.

**What changed for the team:**
- **New** `app/_components/account-menu.tsx`, used in `admin-shell.tsx` and `pro-shell.tsx`.
- **`dashboard.tsx`** sends `note` with a rejection.

**What to re-test:**
- Open `/admin` and `/pro`, open the account menu, use My profile, then Log out;
- On the admin Overview, Reject an application, confirm the button is off until you type, then reject and check the applicant sees the reason;
- Check the menu on a phone width.

---

## 14 Oct 2026: Become a Professional Sends Real Applications

Commit `59b737a`. Migration `20261014000100_professional_applications.sql` must be run in Supabase before this works.

**Why.** The "Become a Professional" page only pretended to send. Nothing reached the AROM team, so no one could actually apply. This is the first step of the professional journey: apply, admin approves, then the professional sets up their profile.

**What changed for users:**
- **Applications are really sent.** The form and the license file go to AROM, and the page shows "We're reviewing your application" after a reload or on another device.
- **One application at a time.** Sending a second one while the first waits shows "You already have an application waiting for review."
- **Clear errors** if sending fails, in English and Khmer.
- **The yellow demo bar is gone.**

**What changed for admins:**
- **Applications list now includes phone, Telegram and the license file name.**
- **Rejecting needs a reason,** so the applicant knows what to fix.

**What changed for the team:**
- **New endpoint** `GET` and `POST /api/professional/application` (`lib/controllers/application-controller.ts`). The server repeats every form rule and checks the file really is a PDF, JPG or PNG.
- **License files** go to a new private `licenses` storage bucket. Only the owner can upload into their own folder, only admins can read, nobody can change or delete.
- **Phone and Telegram** are copied on approval into a new private `professional_contacts` table, never into the public profile.
- **No service role key used.** Everything runs as the signed in user, so RLS applies.

**What to re-test (after running the migration):**
- Sign in as a normal user, open Profile, Become a Professional, fill the form with a PDF license and submit; confirm the pending card shows;
- Reload the page and confirm the pending card is still there;
- In Supabase, confirm the row in `professional_applications` and the file in `licenses/<user id>/`;
- Approve it with `POST /api/admin/applications/<id>/review` and confirm `professional_contacts` has the phone;
- Reject another application with no note and confirm it is refused;
- Switch to Khmer.

---

## 13 Oct 2026: Browse MindGuide When Giving a Care Task

Commit `eacfa97`. No migration. Frontend only.

**Why.** The Give a care task window listed MindGuide items in a short plain list. That works for three items, but MindGuide will grow to many lessons, practices and tips, and professionals need to read an item before giving it.

**What changed for professionals:**
- **"Browse MindGuide" button** in Give a care task (MindGuide type). It opens MindGuide on top of the window, so the half filled form is kept.
- **The same screens users see:** Lessons, Practices and Tips tabs, with search, categories, cards and the full item page.
- **"Choose for <client>"** replaces the user's "Add to plan" buttons in this mode, on the item page and on the list cards. Choosing returns to the form with the item filled in, and a Change link to pick another.
- **Only published items can be chosen;** coming soon items stay locked.
- **Works with Give and add another,** which clears the chosen item for the next task.

**What changed for users:**
- **Nothing.** MindGuide looks and works the same; the choose mode only exists inside the professional area.

**What changed for the team:**
- **New** `app/_components/mindguide-pick.tsx` (choose mode) and `app/pro/_components/mindguide-picker.tsx` (the overlay).
- **MindGuide screens** (learn, practice and tips containers, list and detail views) check choose mode: no app sidebar, "Back to MindGuide" closes the browser, and plan buttons choose instead. Lint shows no new problems in these files.

**What to re-test:**
- In a client file, Give a task, MindGuide, Browse MindGuide; switch between Lessons, Practices and Tips and search;
- Open a lesson, read it, tap Choose for <client>, and confirm the form shows it; use Change to pick a practice instead and confirm How often becomes Every day;
- Use Give and add another and confirm the item is cleared;
- Open the normal user MindGuide and confirm Add to plan still works there;
- Switch to Khmer.

---

## 13 Oct 2026: Give Several Care Tasks in One Go

Commit `eb1eebf`. No migration. Frontend only.

**Why.** After a session a professional often wants to give more than one thing (for example two goals and a practice). Each task closed the window, so they had to reopen it every time.

**What changed for professionals:**
- **New "Give and add another" button** in the Give a care task window. It saves the task, keeps the type, schedule and dates, clears the text, and stays open.
- **A green box lists what was given so far,** for example "2 tasks given to Chan Sreyneang", with each title.
- **Cancel becomes Done** once at least one task was given. "Give task" still saves and closes.
- **Khmer and English.**

**What changed for the team:**
- **Frontend only** in `app/pro/_components/care-plan-card.tsx`; each task is still saved one by one with `addCareTasks`, so the backend shape is unchanged.

**What to re-test:**
- Open a client file, Give a task, choose Goal, write one, click Give and add another; write a second goal and click Give and add another again;
- Confirm the box lists both, then click Done and see both goals in the Care plan card;
- Mix types: give a MindGuide item, then switch to Reminder and give one;
- Try Give and add another with an empty goal and confirm the error;
- From a finished session in My bookings, use Give a care task and repeat the steps;
- Switch to Khmer.

---

## 13 Oct 2026: No Add Button for Lessons, Tips and Practices in Admin MindGuide

Commit `e86bef6`. No migration.

**Why.** Lessons, tips and practices are written by the team with AI; admins only check, correct and publish them. The admin page had Add lesson, Add tip and Add practice buttons that let an admin start an empty item by hand, which goes against that rule.

**What changed for admins:**
- **The Add lesson, Add tip and Add practice buttons are gone.** A line explains that new items arrive as drafts to check, fix and publish.
- **Editing, drafts, publishing and history are unchanged.**
- **Podcasts keep Add podcast,** because admins create podcasts fully.

**What changed for the team:**
- **`createContent` was removed** from `admin-provider.tsx`, and `BACKEND-HANDOFF.md` section 9 now says new items are inserted as drafts by the team (for example with a seed script or migration), not created in the app.

**What to re-test:**
- Open Admin, MindGuide, and check the Lessons, Tips and Practices tabs have no Add button and the new line shows;
- Edit an item, save a draft and publish, as before;
- Open the Podcasts tab and confirm Add podcast is still there.

---

## 13 Oct 2026: Professional Home Becomes a Dashboard Once the Profile Is Live

Commit `67318f3`. No migration yet. Frontend only, on mock data.

**Why.** After a professional finished setting up, Home kept showing a checklist that was all ticked. Now it shows what they need every day: the next session, a few numbers, how busy the last weeks were, and what is waiting for them.

**What changed for professionals:**
- **While the profile is incomplete,** Home still shows the setup checklist (unchanged).
- **Once it is complete,** the checklist becomes a small "Your profile is live" line with View profile, and Home shows:
- **Next session** with Join, Prepare and Message;
- **Four numbers:** sessions this week (compared with last week), next 7 days, active clients, and **how full your week is** (booked out of open slots, with a bar);
- **Sessions per week for the last 8 weeks:** completed or booked, did not come and cancelled, with hover details, a legend and a table view;
- **Needs your attention:** sessions waiting for an outcome, unread messages, suggested times not picked yet, and clients with no care plan, each linking to the right place;
- **Care plans:** how many clients share progress and the share of tasks done in the last 7 days.
- **Khmer and English,** and it stacks on phones.

**What changed for the team:**
- **New files** `app/pro/_components/pro-dashboard.tsx` and `weekly-sessions-chart.tsx`; the chart reuses the admin bookings chart colours, which passed the colour blind check.
- **`BACKEND-HANDOFF.md` section 16** lists how each number is counted. No new tables.

**What to re-test:**
- As Established professional, check the numbers match My bookings (this week, next 7 days) and My clients;
- Hover the chart bars and open View as table;
- Click each Needs your attention item and confirm it opens the right page;
- Mark a session's outcome, then return to Home and confirm the count drops (without refreshing);
- Switch to Newly approved and confirm the checklist shows instead;
- Check on a phone and in Khmer.

---

## 13 Oct 2026: Professional Podcasts Belong Only to the Professional

Commit `e5de030`. No migration. Text and documentation only.

**Why.** Professionals make their own episodes, so the product decision is that only they manage them: no reporting by users and no hiding or deleting by admins. The editor had promised that the AROM team could hide an episode, which was never going to be built.

**What changed for professionals:**
- **The checklist note in the episode editor** now says "Only you can hide or delete your episodes." instead of saying the AROM team can hide them.

**What changed for the team:**
- **`BACKEND-HANDOFF.md`** section 7 and section 20 now say there is no Report a problem on episodes and no admin hide, edit or delete; the planned "admin hide" item is removed.

**What to re-test:**
- Open My podcasts, New episode, and read the note under "Before it goes live" in English and Khmer.

---

## 13 Oct 2026: My Podcasts, Professionals Publish Their Own Episodes

Commit `511db19`. No migration yet. Frontend only, on mock data.

**Why.** Hearing a professional's voice helps people feel safe enough to book, especially for a first session. Each sample professional had one fixed episode in code; now professionals record and manage their own episodes, and they appear on their public profile.

**What changed for professionals:**
- **"My podcasts" is open** in the professional area (it said Soon before): a list of episodes with Draft, On your profile or Hidden, plus Edit, View as a user, Hide from profile, Show again and Delete.
- **New episode editor:** upload an audio file (MP3, M4A or WAV, up to 100 MB and 60 minutes) and listen back, title, short summary, topic, description and quote in English and Khmer, up to 4 key points and up to 10 chapters.
- **"Before it goes live" checklist:** no client stories or identifying details, for learning only, and I own this recording. Publishing needs all three.
- **Episode numbers continue on their own** (for example Episode 13 after Episode 12).
- **Khmer and English.**

**What changed for users:**
- **The profile shows the newest episode** with up to 5 more under it, and the podcast page opens the chosen one.
- **Uploaded episodes play their real audio** in the same player (sample episodes keep the calm demo tone).
- **A professional with no episodes** shows a friendly "No podcast episodes" page instead of an error.

**What changed for the team:**
- **New shared store** `app/_components/podcasts/pro-podcast-store.ts`, seeded from the sample episodes in `lib/therapists.ts`.
- **Podcast player cleanup:** the player no longer calls hooks after an early return (13 lint errors fixed), and the current chapter is calculated instead of copied in an effect.
- **`BACKEND-HANDOFF.md` section 20** lists the table, storage, limits and rules; decision recorded in section 7. Admin hiding of an episode is still to build.

**What to re-test:**
- As admin, open Professional area, My podcasts; create a New episode with a real MP3, play it back, add a key point and a chapter;
- Try Publish without ticking the checklist and confirm the message; tick all three and publish;
- Click View as a user and confirm the new episode plays real audio, chapters jump, and the profile shows it first with Episode 12 below;
- Hide it and confirm the profile goes back to Episode 12; Show again; Delete a draft;
- Switch to Newly approved and confirm the empty state; open a podcast page for a professional with none;
- Switch to Khmer.

---

## 13 Oct 2026: Prepare Before a Session, and a Week Calendar for Bookings

Commit `e85a17d`. No migration yet. Frontend only, on mock data.

**Why.** Before each session a professional had to open the client file, the last booking, the chat and the care plan one by one. Now one page gathers what matters for the next few minutes. Bookings were also only a list, which made it hard to see how full a week is.

**What changed for professionals:**
- **New "Prepare" page for each session** (from the booking window or Home "Today's sessions"): time, type, "Session 5 with you", Join, a private **Plan for this session**, the **last session** with its note, **care plan progress since then** (only if the client shares it), this booking's answers, the summary note, **messages since the last session** (count and unread) and shared symptom checks.
- **Week calendar in My bookings:** switch between List and Week. Monday to Sunday, open hours shaded, time off marked, sessions colored by state (booked, add outcome, completed, did not come), a line for now. Tap a session to open it. Phones show one day at a time with day buttons.
- **Sample notes for Sok Dara** so the Prepare page and client file show something in the demo.
- **Khmer and English.**

**What changed for the team:**
- **New route** `/pro/bookings/<id>` (Prepare) and `?open=<id>` on My bookings.
- **New private note per booking** (`prepNotes`), documented in `BACKEND-HANDOFF.md` section 16 with where each Prepare block reads from.

**What to re-test:**
- On Home, click Prepare on a session (or open a booking and click Prepare); write a plan, save, leave and come back without refreshing;
- Check the last session note, care plan counts and message count match the client file and the chat;
- Turn off "Share my progress" on the user Care plan page and confirm Prepare no longer shows counts;
- Click "Open the booking" and confirm the booking window opens;
- In My bookings switch to Week; move to next and previous weeks and back to This week; click a session;
- On a phone, check the day buttons and that only one day shows;
- Switch to Khmer.

---

## 13 Oct 2026: Join Session Links, After Session Steps, Suggested and Repeating Sessions, Quick Replies

Commit `5b5d618`. No migration yet. Frontend only, on mock data.

**Why.** Online sessions had no way to actually meet, and after a session the professional had to remember several separate steps. Booking the next session meant the client starting from scratch. Now the meeting link travels with the booking, the booking window walks the professional through what to do after a session, and the client books the next session (or a weekly series) with one tap in the chat.

**What changed for users:**
- **"Next session" at the top of the chat** with your professional, with a **Join session** button that opens 10 minutes before the start.
- **Suggested times in Messages:** your professional can send up to 3 times for your next session, sometimes repeating (for example every week, 4 sessions). Tap a time, see all the dates, and book. "No payment during testing" is shown.
- **If a time was just taken,** you are told and nothing is booked.

**What changed for professionals:**
- **Meeting link in My schedule:** your own Google Meet, Zoom or Jitsi room, added to every online session. Changing it moves upcoming sessions to the new room. You can also change the link for one session.
- **Join session** in the booking window, in My bookings rows and on Home, from 10 minutes before the start.
- **"After the session" in the booking window:** step 1 outcome (completed or did not come), then next steps: give a care task, suggest the next session, and write the private note.
- **"Suggest a session"** from the booking window, the client file and the chat: choose online or in person, how it repeats, up to 3 times (only times free for the whole series), and a note. You see when the client books, or you can withdraw it.
- **Repeating series:** each session shows "Session 2 of 4 in a repeating series" and a repeat icon in the list.
- **Quick replies in Messages:** saved replies you can add and delete, with {name}, {link} and {next} filled in for you.
- **Home "Today's sessions"** now links to My bookings (the old "coming next" note is gone).
- **Khmer and English** everywhere.

**What changed for the team:**
- **Bookings moved into a shared store** (`app/_components/sessions/session-store.ts`) used by `/pro` and the user side; `ProBooking` gained `professionalId`, `meetingUrl` and `seriesId`, and `Schedule` gained `meetingUrl`.
- **Chat messages can carry a suggestion** (`kind: 'suggestion'`), and the chat supports quick replies for professionals.
- **`BACKEND-HANDOFF.md` section 19** lists the new tables and the accept function that books a whole series in one transaction; decisions recorded in section 7.
- **Mock only:** everything resets on refresh. Admin Bookings does not show follow ups booked from suggestions yet.

**What to re-test:**
- In My schedule, change the meeting link to something without https and save: confirm the error; then save a valid link and confirm an upcoming online booking uses it;
- Open an online session starting within 10 minutes (or change a sample time) and confirm Join session opens the link in a new tab; earlier it says "Join opens 10 min before";
- Open a past session that needs an outcome; mark Completed and confirm the next steps appear; give a care task from there;
- Suggest the next session with "Every week, 4 sessions" and two times; open the user Messages without refreshing, pick a time, check the dates list, and book;
- Back in My bookings confirm four new sessions marked as a series, and the chat card says Booked;
- Suggest again and Withdraw; confirm the user card says it was withdrawn;
- In the chat, open Quick replies, insert one with {name} and {link}, add a new reply and delete one;
- Switch to Khmer on both sides.

---

## 13 Oct 2026: Care Plan, Tasks From Your Professional in Your Plan For Today

Commit `5637b57`. No migration yet. Frontend only, on mock data.

**Why.** After a session, clients often forget what they agreed to try, and professionals had no way to give practice between sessions or see whether it helped. Now the professional gives small tasks, they appear in the client's daily plan, and the client decides whether their progress is shared.

**What changed for users:**
- **Tasks from your professional in "Your Plan For Today"** on the home page, marked "From Dr. ...". Tick them off like any other item; MindGuide tasks open the right lesson, tip or practice directly.
- **New "Your care plan" page** (`/care-plan`, linked from the home plan) with all tasks from each professional, what is due today, and past tasks.
- **"Share my progress" switch** per professional. When on, they see only which tasks you ticked, never your journal, mood or other answers. You can turn it off at any time.
- **Medicine reminders say "Only take medicine as prescribed by your doctor."**

**What changed for professionals:**
- **New "Care plan" card in each client file** with a "Give a task" window: MindGuide item, mission, goal or reminder, a note to the client, how often (once, every day or some days), an end date and an optional reminder time.
- **Progress dots for the last 7 days** when the client shares progress; otherwise "has not shared their progress. That is their choice."
- **Stop a task** at any time; stopped and ended tasks move to "Past tasks".
- **"Give care tasks" link** in the booking window after a session.
- **Khmer and English** on both sides.

**What changed for the team:**
- **New shared store** `app/_components/care/care-store.ts` used by `/pro`, the home plan and `/care-plan`; `/care-plan` added to the login protected pages in `lib/supabase/proxy.ts`.
- **MindGuide pages accept `?open=<id>`** to open one item directly (learn, tips, practice).
- **The demo user (Sok Dara)** now lives in `app/_components/demo-client.ts`, shared with Messages.
- **Mock store in memory only:** nothing is saved in the browser; it resets on refresh.
- **`BACKEND-HANDOFF.md` section 18** lists the tables, who can read and tick, the sharing rule, and the data the Telegram bot needs for reminders. Decision recorded in section 7.

**What to re-test:**
- As admin, open Professional area, My clients, Sok Dara; confirm the Care plan card shows four tasks and progress dots;
- Give a task of each kind; try saving a mission with no text, a goal with no date, and "Some days" with no day, and confirm the messages;
- Without refreshing, open Home and confirm today's new tasks show "From Dr. Sopheap Chan"; tick one, then return to the client file and confirm the dot for today;
- Open "See your care plan", turn sharing off, and confirm the client file says Sok Dara has not shared progress;
- Stop a task and confirm it leaves the home plan and moves to Past tasks;
- Open a MindGuide task from the plan and confirm the right item opens;
- In My bookings, open an ended session and use "Give care tasks";
- Switch to Khmer on both sides.

---

## 13 Oct 2026: Messages Between Clients and Professionals, With Voice Messages

Commit `59ff819`. No migration yet. Frontend only, on mock data.

**Why.** Clients and professionals had no way to talk between sessions, for example to share how a practice went or ask a quick question. Many people in Cambodia find it easier to speak than type, especially in Khmer, so voice messages are included from the start.

**What changed for users:**
- **New "Messages" in the sidebar** (under Professional). It lists the professionals you have booked with; you cannot message anyone before booking.
- **Chat with text and voice messages:** tap the microphone, record up to 2 minutes, listen back, then send or discard. Enter sends, Shift and Enter adds a new line.
- **"Messages are not for emergencies"** banner in every chat, linking to Get help now.
- **Each professional's reply time** shows at the top, for example "Usually replies within 1 working day", and "Seen" shows when they have read your message.

**What changed for professionals:**
- **New "Messages" inbox in the professional area:** unread first, search by client, last message preview, and the reply time clients see.
- **"Message" on the client file and "Message client" in every booking.**
- **Private:** "Admins cannot read them". Chats with archived clients become read only.
- **Khmer and English** on both sides.

**What changed for the team:**
- **New shared chat** in `app/_components/messages/` used by both sides, routes `/messages` and `/pro/messages`, and `/messages` added to the login protected pages in `lib/supabase/proxy.ts`.
- **Mock store in memory only:** messages are never saved in the browser and reset on refresh. The user side views as Sok Dara.
- **`BACKEND-HANDOFF.md` section 17** lists the tables, voice storage, who can read and write, and that admins have no access. Decisions recorded in section 7 (messages only after booking, meeting links for calls, Telegram reminders built separately).

**What to re-test:**
- As admin, open Professional area, Messages; open Sok Dara and confirm her unread messages become read; send a text and a voice message (allow the microphone);
- Without refreshing, go to Messages in the app sidebar, open Dr. Sopheap Chan, and confirm the new messages are there; reply, then go back to the professional inbox and confirm the unread badge;
- Confirm the emergency banner link opens Get help now in Profile;
- Archive Sok Dara in her client file and confirm the chat becomes read only;
- Record for 2 minutes and confirm it stops by itself; deny the microphone and confirm the friendly message;
- Switch to Khmer on both sides.

---

## 13 Oct 2026: My Clients: One File per Client With a Summary Note, Session Notes and Shared Results

Commit `8a43f31`. No migration yet. Frontend only, on mock data.

**Why.** Therapists think about the person, not the calendar. Before a session they need to find the client quickly, see their history and read what they wrote last time, without rewriting the background every time. AROM's database already lets clients share their survey and symptom checks with their professional, so the file shows those too, only when the client chose to share.

**What changed for professionals:**
- **New "My clients" page:** search by name, filters (upcoming session, new, not seen in 30 days, past clients) with counts, and each client's next session, last session and completed sessions.
- **Client file:** client since, sessions completed, next session and preferred language at the top.
- **Pinned summary note:** one note kept up to date (main concerns, goals, what helps, things to remember). Private.
- **Sessions and notes:** every session with this client, newest first, with that session's private note under it, and a search box to find words in old notes. "Write a note" or "Open" opens the session.
- **Shared by the client:** their symptom checks (type, score, level) and welcome survey, only when they turned sharing on, with "Not a diagnosis". Otherwise it says the client has not shared anything and that this is their choice.
- **Latest intake answers** from their most recent booking.
- **Archive client** when therapy has ended (notes kept), and **Restore**.
- **"Open client file"** link inside every booking in My bookings.
- **Khmer and English.**

**What changed for the team:**
- **New `app/pro/_data/clients.ts`, `clients-view.tsx`, `client-file.tsx`, `/pro/clients` and `/pro/clients/[clientId]`.** The booking window from My bookings is reused in the client file.
- **Demo sharing:** Sok Dara shares both; Heng Rachana shares symptom checks only; others share nothing.
- **`BACKEND-HANDOFF.md` section 16** lists the tables and rules, notes that sharing already exists in the database, and that professional reschedule needs a new function.

**What to re-test:**
- Open My clients; search "dara" and confirm only Sok Dara shows; try each filter;
- Open Sok Dara; write a summary note, save, leave and come back, and confirm it is still there;
- Open a past session from her file, write a note, save, and confirm it appears under that session and can be found with the note search;
- Confirm "Shared by the client" shows her symptom checks and survey; open Heng Rachana and confirm only symptom checks; open Kim Vanna and confirm nothing is shared;
- Archive a client and confirm they move to Past clients; restore them;
- From My bookings, open a booking and use "Open client file";
- Switch to Khmer and check the labels.

---

## 13 Oct 2026: My Bookings for Professionals: Intake Answers, Reschedule, Cancel and Private Notes

Commit `edc8203`. No migration yet. Frontend only, on mock data.

**Why.** We decided only the client and the professional manage a booking, not admins. Professionals now have their own page to prepare for sessions, move or cancel them with a reason the client sees, record how a session went, and keep private notes.

**What changed for professionals:**
- **New "My bookings" page** (no longer "Soon") with **Upcoming** and **Past** tabs, grouped by day, showing time, length, client name, online or in person, and status.
- **Before the session:** each booking shows the client's note and intake answers (what they want help with, whether they have seen a counselor before, what would help).
- **Reschedule:** choose a new open time from your schedule (same session type, booked times left out) and write a reason. The client is told and can cancel if it does not suit them.
- **Cancel:** write a reason the client sees, then confirm.
- **After the session:** "Add outcome" asks whether it was Completed or the client did not come.
- **Private session notes** on every booking, with "Only you can see these. Not admins, not the client." and a last saved time.
- **Home "Today's sessions" and the schedule preview** now use the same bookings, so a cancelled or moved session updates everywhere.
- **Khmer and English.**

**What changed for the team:**
- **New `app/pro/_data/bookings.ts`, `bookings-view.tsx` and `/pro/bookings`.** The provider holds bookings and notes and resets them with the demo switch.
- **Sample bookings** come from the admin samples for Dr. Sopheap Chan, with "pending" shown as "booked" because booking is instant. A few fall on weekends, as if booked before the schedule changed.
- **`BACKEND-HANDOFF.md` section 16** lists every action, rule and the private notes policy for `session_notes`.

**What to re-test:**
- Open My bookings as the established professional; confirm Upcoming and Past counts and day groups;
- Open an upcoming booking; confirm the intake answers; press Reschedule, pick a time, try without a reason, then with one; confirm the session moves and shows "Moved from";
- Cancel another session with a reason and confirm it moves to Past as cancelled, and disappears from Home today if it was today;
- Open a past session marked "Add outcome" and choose Completed;
- Write a private note, save, reopen the booking and confirm it is still there with the saved time;
- Switch the demo to "Newly approved" and confirm the empty states; switch to Khmer.

---

## 13 Oct 2026: My Schedule for Professionals: Weekly Hours, Session Settings and Time Off

Commit `86226bc`. No migration yet. Frontend only, on mock data.

**Why.** Booking at AROM is instant: users book any open time straight away. Professionals needed a way to say when they are free, and a new professional cannot appear to users until they have at least one open time.

**What changed for professionals:**
- **New "My schedule" page** in the professional area (no longer "Soon").
- **Weekly hours:** turn each day on or off and add one or more blocks of time, for example 09:00 to 12:00 and 14:00 to 17:00, each marked online, in person or both. "Copy Monday to Tuesday to Friday" fills a work week in one tap.
- **Session settings:** session length (45, 60 or 90 minutes), break between sessions (none, 10 or 15 minutes), how far ahead people can book (2, 4 or 8 weeks) and minimum notice (2, 12 or 24 hours).
- **Time off:** add days away, such as Pchum Ben or a trip. Sessions already booked are not removed.
- **"What people will see":** the exact open times for the next 7 days, with already booked times left out, updated while editing.
- **Clear problems:** overlapping blocks, blocks shorter than one session, times outside 06:00 to 22:00, or a session type the profile does not offer are marked in red, and Save explains what to fix.
- **Save and Undo,** with a warning before leaving with unsaved changes. Khmer and English.
- **Home checklist:** "Open times in your schedule" now links here and ticks once a day has open hours.

**What changed for the team:**
- **New `app/pro/_data/schedule.ts`** with the rules and `openSlots()`, `schedule-editor.tsx`, and the `/pro/schedule` route. The provider now works out "has open times" from the schedule.
- **`BACKEND-HANDOFF.md` section 16** describes how to store the schedule and keep `availability_slots` filled.
- **Mock today:** the user booking page still shows its own sample times until it reads real open slots.

**What to re-test:**
- Open My schedule as the established professional; confirm weekday hours and the 7 day preview, with weekends closed and booked times missing;
- Change session length to 90 minutes and confirm the preview times change;
- Add a block that overlaps another and one shorter than a session; confirm red messages and that Save refuses;
- Add time off for two days and confirm those days show "No open times";
- Switch the demo to "Newly approved"; confirm a note asks to choose online or in person in My profile first; after choosing it there, open a day here, save, and confirm the Home checklist ticks the schedule step;
- Switch to Khmer and check the day names and labels.

---

## 13 Oct 2026: One Click Into the Professional Area for Admins

Commit `3f7e215`. No migration.

**Why.** Admins can open the professional area to check how it works, but they had to type `/pro` into the address bar. There are no real professional accounts yet, so admins are the main way to see it.

**What changed for users (admins):**
- **"Professional area" under Admin** in the app sidebar and the phone menu, below "Admin panel".
- **"Professional area" link at the bottom of the admin sidebar,** next to "View website".

**What changed for the team:**
- **`navigation-config.ts`:** a second item in the admin only section. **`admin-shell.tsx`:** one added link (English only). Professionals keep their own "Professional area" link.

**What to re-test:**
- Log in as admin, open the app sidebar and the phone menu, and confirm "Professional area" opens `/pro`;
- In the admin panel, confirm the link at the bottom of the sidebar opens `/pro`;
- Log in as a normal user and confirm neither link shows.

---

## 13 Oct 2026: Session Prices Shown to Users (Free, One Price or a Range), No Payment Taken

Commit `c19be78`. No migration.

**Why.** Users want to know what a session would cost before they book, even while AROM is in testing. Prices are now shown for information only: nobody pays, and a note says so.

**What changed for users:**
- **Each professional shows a price:** "Free", "$20 a session" or "$30 to $50 a session". It appears on the professional list cards, under Book Appointment on the profile, and as a Price row on the booking review step.
- **"No payment during testing"** shows under the price on the profile and the booking review.
- **Sample prices:** Dr. Sopheap Chan $20, Dr. Ratanak Pich $30 to $50, Dr. Malika Sok free.

**What changed for professionals:**
- **My profile, Session price:** choose Free, One price or Price range, enter the amounts (1 to 500 USD, the lowest below the highest), and see exactly what users will see.
- **Choosing a price (Free counts) is now a step** before the profile becomes visible.

**What changed for admins:**
- **The Settings switch is now "No payments during testing".** On: users see prices with the no payment note. Off: the note is hidden, meant for when a payment system exists.

**What changed for the team:**
- **New `lib/pricing.ts`** (`SessionPrice`, `formatPrice`, `noPaymentNote`, `isValidPrice`, `FREE_DURING_TESTING`) replaces `app/_components/pricing.ts`. `Therapist` has an optional `price`.
- **`BACKEND-HANDOFF.md` sections 7 and 16** updated with the price rules and storage.

**What to re-test:**
- Open the professionals list and confirm each card shows its price;
- Open a profile and the booking review step and confirm the price and "No payment during testing";
- In `/pro`, My profile, switch between Free, One price and Price range; try 0, 600, or a range where From is above To and confirm Save refuses it;
- Switch the app to Khmer and check the price wording.

---

## 13 Oct 2026: Professional Area With Home and My Profile, and Free During Testing

Commit `82b7e91`. No migration yet. Frontend only, on mock data.

**Why.** Approved professionals had nowhere to manage themselves: admins were not meant to write their profiles, and nothing told a new professional what was missing before users could find them. During testing, sessions with real professionals are free, but nothing told users that either.

**What changed for users:**
- **"Free during testing"** shows under Book Appointment on every professional's profile and on the booking review step.

**What changed for professionals:**
- **They land on `/pro` after logging in,** and a "Professional area" link appears in their sidebar.
- **Home** shows whether users can see their profile, a checklist of what is missing (photo, bios, specialties, languages, how they meet clients, open times), changes waiting for admin review, today's sessions, and a "Free during testing" note.
- **My profile:** upload a photo, edit name and title in both languages, bios in English and Khmer with minimum lengths, years of experience, what they help with, session languages, online or in person, a price saved for later, and license details.
- **Name, title and license changes wait for an admin.** The public profile keeps the current details, and the waiting value shows under the field with a Withdraw link.
- **Preview** shows their real public profile page at phone or desktop size, updated while they type.
- **Save changes and Undo,** with a warning before leaving with unsaved changes.
- **Khmer and English** throughout. My schedule, My bookings and My podcasts show as coming soon.

**What changed for admins:**
- **New switch in Settings: "Sessions are free during testing"** (on). Turning it off is meant for when a payment system exists.

**What changed for the team:**
- **Decisions recorded in `BACKEND-HANDOFF.md` section 7:** instant booking, professionals appear only when their profile is complete, session notes private to the professional, no payments yet.
- **New `app/pro/`** (layout, home, profile, provider, preview) and `app/_components/pricing.ts`. The admin preview frame also draws a professional profile.
- **`BACKEND-HANDOFF.md` section 16** maps every field to `professional_profiles` and `professional_credentials`.
- **Mock today:** a demo switch shows an established or a newly approved professional; nothing is saved after a refresh.

**What to re-test:**
- Log in as a professional and confirm you land on `/pro` and see "Professional area" in the sidebar; log in as a normal user and confirm you do not;
- On Home, switch the demo to "Newly approved" and confirm "Users cannot see your profile yet" with the missing steps, each linking to the right field;
- In My profile, upload a photo, write both bios and choose online; save and confirm the checklist updates on Home;
- Change your English title, save, and confirm it shows "Waiting for review" with Withdraw, and the Preview still shows the old title;
- Open Preview, switch Phone and Desktop, and switch the language at the top;
- Edit something and click Home before saving; confirm the unsaved changes warning;
- Open any professional profile and the booking review step as a user and confirm "Free during testing".

---

## 13 Oct 2026: Dashboard Hotline Warning Links to Settings

Commit `8c58ac2`. No migration.

**Why.** The Overview warns "No crisis hotlines added yet", and helplines are added in Admin, Settings, but there was no way to get from one to the other. The warning and the Settings section do different jobs (a reminder and the place to fix it), so both stay and are now connected.

**What changed for users (admins):**
- **The hotline warning in "Needs attention" is now a link,** and an "Add helplines" link sits next to the Urgent label. Both open Admin, Settings and jump to Crisis helplines.

**What changed for the team:**
- **`dashboard.tsx`:** `AttentionItem` has an optional `href`; the two hotline items use it. Nothing removed. New link text is English only.
- **`settings-view.tsx`:** the Crisis helplines section has `id="crisis-helplines"`.
- **Note:** the warning reads the real database, while Settings is still mock, so adding a helpline in Settings does not clear the warning until the backend is connected.

**What to re-test:**
- Open the Overview with no hotlines in the database and confirm the warning title and "Add helplines" both open Settings at the Crisis helplines section.

---

## 13 Oct 2026: Announcements From Admin Settings, Shown at the Top of Every Page

Commit `45bbbe4`. No migration yet. Frontend only, on mock data.

**Why.** The team had no way to tell everyone something at once, for example a planned pause, a new lesson or an important change. Admins can now post a short message that every user sees until it ends.

**What changed for users:**
- **A slim banner at the top of every page,** guests included, in one of three calm colours: Information, Good news or Important.
- **Khmer and English.** English readers see the English text, or the Khmer when no English was written.
- **An optional "Open" button** that goes to a page inside AROM.
- **A close button.** Closing hides that announcement on this device; a new announcement shows again.

**What changed for admins:**
- **New "Announcements" section at the top of Admin, Settings:** Khmer text (required, 300 characters with a counter), English text (optional), colour, optional link inside the app, and when it ends (1 day, 7 days, 30 days, or when you end it).
- **Live preview** of the banner in Khmer and English before publishing.
- **"All announcements"** lists each one with Showing, "Not showing, a newer one is" or Ended, who published it and when it ends, and an **End now** button.
- **One shows at a time:** the newest that is still running. New admin text is English only.

**What changed for the team:**
- **New `app/_components/announcements.ts`** and `announcement-banner.tsx`, added once in `app/layout.tsx` and hidden on `/admin` and the admin preview frame.
- **Admin:** `announcements-section.tsx` and provider `announcements`, `publishAnnouncement`, `endAnnouncement`.
- **`BACKEND-HANDOFF.md` section 15** lists the data shape, rules and endpoints.
- **Mock today:** what admins publish resets on refresh and does not reach users until the backend is connected.

**What to re-test:**
- In Admin, Settings, type Khmer text and confirm the counter and the Khmer and English previews update;
- Try a link like `https://google.com` or `mindguide` without the slash and confirm it is refused;
- Publish one, then publish another, and confirm the older one says "Not showing, a newer one is";
- Press End now and confirm it shows Ended;
- Confirm Publish stays disabled while the Khmer text is empty.

---

## 13 Oct 2026: Crashes Card Keeps Only "Copy for Developer"

Commit `b11dd9a`. No migration.

**Why.** The team shares bugs on Telegram, so the "Email developer" button on the crashes card was not needed. One button keeps the card simpler.

**What changed for users (admins):**
- **"Email developer" was removed** from "Most frequent crashes, last 7 days". **"Copy for developer"** still copies the top 5 crashes as text to paste into Telegram or GitHub.

**What changed for the team:**
- **`crash-report-card.tsx`** no longer builds an email link. `BACKEND-HANDOFF.md` section 14 updated.

**What to re-test:**
- Open the admin Overview, confirm only "Copy for developer" shows on the crashes card, press it and paste the text into Telegram.

---

## 13 Oct 2026: Crash Tracking, Friendly Error Screen and a Crashes Card on the Admin Overview

Commit `fcc3366`. No migration yet. Admin card is on mock data.

**Why.** When a page broke, people saw the default error page and the team never found out. A crash is an error that broke a screen for someone, and on a wellbeing app a broken screen at the wrong moment matters. The team now has a calm error screen for users and one place to see which crashes happen most, so the developer can fix the worst ones first.

**What changed for users:**
- **A calm error screen** when a page breaks: "Something went wrong on this screen. This is not your fault." with **Try again** and **Go to home**, in Khmer and English.
- **After an app update,** "Try again" reloads the page, which fixes the "failed to fetch module" kind of crash.
- **A simple bilingual fallback** if the whole app fails to load.

**What changed for admins:**
- **New card at the bottom of the Overview:** "Most frequent crashes, last 7 days". Each crash shows the error, how many times it happened, how many different people hit it, when it last happened, the page, and the app version. The ⓘ explains what a crash is.
- **Copy for developer** and **Email developer** build a ready to paste report of the top 5 crashes.

**What changed for the team:**
- **New `app/error.tsx` and `app/global-error.tsx`** using the Next.js 16 `retry` prop, and `app/_components/crash-reporting.ts` that builds a privacy safe report (no query strings, no user content).
- **Hok Chheng's `dashboard.tsx`:** 6 lines added to show the card. Nothing removed.
- **Mock today:** reports are built but not sent, and the card shows sample crashes. `BACKEND-HANDOFF.md` section 14 lists the endpoint, table and optional daily email to the developer.

**What to re-test:**
- Log in as admin, open the Overview and confirm the crashes card is at the bottom with 4 sample crashes, most frequent first;
- Tap the ⓘ and confirm the explanation shows;
- Press Copy for developer and paste somewhere; confirm the text lists each crash with times, people, last seen, page and version;
- Press Email developer and confirm an email draft opens with the same text;
- Ask a developer to break a page on purpose (throw an error in a test page) and confirm the calm error screen shows with Try again and Go to home, in both languages.

---

## 13 Oct 2026: Crisis Helplines in Admin Settings and "Get Help Now" for Users

Commit `0ac7f04`. No migration (uses the existing `crisis_resources` table later).

**Why.** We decided content screens would not carry a crisis card because users can find helplines in Settings, but no helplines existed anywhere in the app, and admins had no page to add them even though the admin dashboard flags "No crisis hotlines added yet" as urgent. On a mental health app, help must always be easy to find. The admin Settings page also held a support contact users never saw, plus two settings that no longer made sense.

**What changed for users:**
- **New "Get help now" section in Profile and Settings.** It always shows a calm message to contact local emergency services if someone is in danger.
- **Crisis helplines added by the team appear there,** each with Call, Text and Website buttons, hours, and names in Khmer and English.
- **"AROM support"** (email and phone for app questions, clearly not for emergencies) appears there once the team fills it in.

**What changed for admins:**
- **New "Crisis helplines" section** at the top of Admin, Settings: add, edit, reorder, hide or delete (two taps). A warning shows while no helpline is visible to users.
- **Stricter checks for helplines:** English and Khmer name, a phone or website, valid number and `https://` website, and a required "I checked this number myself" tick on every save.
- **Support contact** now checks the email and phone and explains where users see it.
- **Removed** "Platform name" and "Admin language". New text on the page is English only.

**What changed for the team:**
- **New `app/_components/support-contacts.ts`** shared by the user section and the admin page. Helpline and support lists start empty; no number was invented.
- **`AdminSettings` is now the support contact only.** Provider has `crisisHelplines` and `saveCrisisHelplines`.
- **`BACKEND-HANDOFF.md` section 13** maps everything to `crisis_resources` and lists the rules to enforce in the database.
- **Mock today:** what admins type resets on refresh and does not reach users until the backend is connected.

**What to re-test:**
- Open Profile and Settings as a user; confirm "Get help now" shows the emergency message and no support block while nothing is set;
- In Admin, Settings, confirm the yellow warning, then add a helpline: try saving without a Khmer name, without phone and website, with "12" as the phone, with an `http://` website, and without the tick; confirm each is refused with a clear message;
- Save a valid helpline, reorder it, hide and show it, then delete it with two taps;
- Enter an invalid support email and confirm it is refused;
- Switch the user app to Khmer and check "Get help now".

---

## 13 Oct 2026: Removing a Reported Message, Image or Person Now Works

Commit `f668534`. No migration. Frontend only, on mock data in the browser.

**Why.** In the Reports tab, "Mark for removal" only changed the report's label. The harmful message or picture stayed in the chat for every member, so an admin could believe it was gone when it was not. On a mental health platform that is a safety gap.

**What changed for users:**
- **A removed message or picture is replaced** with "This message was removed by the AROM team." (in English or Khmer). The report menu is no longer offered on it.
- **A person removed from a group** disappears from that group's Members list. Their past messages stay.

**What changed for users (admins):**
- **The remove button now says what it does:** "Remove message", "Remove image" or "Remove from group", depending on what was reported. Group reports have no remove button; use "Shut down group".
- **The confirm step explains the result**, for example that members will see the removed placeholder, or that the person loses access to the group.
- **View chat marks removed messages** with a "Removed" tag and still shows the original to admins.
- **The report status** reads "Message removed for everyone", "Image removed for everyone" or "Removed from group", and stays that way after a reload.
- The sample reports that are not linked to a real message say so in the confirm step, and only the report closes.

**What changed for the team:**
- **`community-store.ts`** gained `removeMessage` and `removeMember`; removals live in localStorage next to closures.
- **`ChatMessage.removed`** flags a removed message for the user page. Admin provider exposes `removedMessageIds`.
- **`BACKEND-HANDOFF.md` section 14:** the removal endpoints and rules (members never receive removed text or image links), and the remaining gap about admin group edits.

**What to re-test:**
- As a user, report a message and an image in a group, and report a person from the Members tab;
- As an admin, open each report, press the remove button, read the confirm text, and confirm;
- Open View chat and confirm the message shows "Removed" but the original is visible;
- Back on `/community`, confirm the message and image show the removed placeholder, and the person is gone from Members;
- Reload `/admin/community` and confirm those reports still show as removed;
- Dismiss a different report and confirm nothing changes in the chat.

---

## 13 Oct 2026: Community Groups by Professionals, Admin Chat Review and Shut Down, User Reports

Commit `70f03fa`. No migration. Frontend only, on mock data in the browser.

**Why.** Support groups need clear safety rules. Professionals should be able to start groups for the people they help, the AROM team needs to see what happens in a chat and close a group that goes wrong, and members need a simple way to flag a person, an image or a whole group that makes the space feel unsafe.

**What changed for users:**
- **"Create a group" on the Community home** for professionals and admins only. The form takes the name and description in English and Khmer, topic, maximum members (2 to 20), rules (filled with the default rules) and anonymous mode. The group goes live right away with the creator as its mentor.
- **Report from inside a group.** The "..." button on each message offers "Report this person", "Report message" and "Report image" (for pictures). The Members tab has a flag on each member, and the group header has a flag to report the whole group. Users pick a reason, can add a short note, and see "Thank you. The AROM team will review this." There is a limit of 5 reports a day.
- **Members are told the chat can be read.** The group guidelines and the group rules page now say "The AROM safety team can read this chat to keep it safe."
- **Closed groups.** When an admin shuts a group down, members see "This group was closed by the AROM team.", can still read the history, but cannot send. The group disappears from Browse groups and cannot be joined.

**What changed for users (admins):**
- **View chat** on every group card opens the full chat, read only, with pictures and file names. A note says opening a chat is recorded in the audit log.
- **Shut down** replaces Archive. It asks for a reason (only admins see it). Closed groups show a Closed badge, the reason, and a **Reopen** button.
- **Groups made by professionals** appear in the list with "Created by professional: name". Groups an admin adds also appear on `/community`.
- **Reports tab** shows what was reported (Person, Message, Image or Group), the reason, the reporter's note and the time, never who reported. Each report has **View chat** (the reported message is highlighted), and group reports have **Shut down group**.

**What changed for the team:**
- **New `app/community/community-store.ts`** keeps created groups, closures and reports in localStorage so the user page and the admin page see the same demo data in one browser. The backend replaces this file.
- **`AdminGroup.status` is now `'active' | 'closed'`** (no more `archived`) with `closedReason`, `createdBy` and `creatorName`. `CommunityReport` gained `targetKind`, `targetLabel`, `messageId`, `note` and `createdAt`.
- **Privacy rule updated:** admins may read support group chats, with an audit log entry every time and a notice to members. Written in `AGENTS.md` section 9 and `BACKEND-HANDOFF.md` sections 2 and 7.
- **`BACKEND-HANDOFF.md` section 14** lists the data shapes, endpoints, RLS rules and gaps.
- **New admin text is English only,** following the admin rule.

**What to re-test:**
- Log in as a user, open `/community`, and confirm there is no "Create a group" button;
- Open a group, report a message, a person (from a message and from the Members tab), an image and the group; the sixth report in one day shows the limit message;
- Log in as a professional, create a group in English and Khmer, and confirm it opens with you as mentor and shows in Browse groups;
- As an admin at `/admin/community`, confirm the new group shows "Created by professional", View chat shows its messages, and the reports from the user appear without the reporter;
- Shut down a group with a reason, then open `/community` and confirm the closed notice, no message box, no Join, and the group missing from Browse groups; Reopen it and confirm it works again;
- Switch the user pages to Khmer and check the new text, and check the screens at phone width.

---

## 13 Oct 2026: Admins No Longer Confirm or Reschedule Bookings

Commit `0ad951c`. No migration.

**Why.** A therapy booking is an agreement between the user and the professional. Admins could confirm, move and cancel any booking, which could clash with a professional's real schedule, touches private arrangements, and makes it unclear who changed what. Now only the user and the professional manage their own bookings, and admins only step in for emergencies.

**What changed for users (admins):**
- **The booking popup is read only.** "Confirm booking" and the "Reschedule" section are gone.
- **A short note** explains that only the user and the professional confirm, reschedule or cancel.
- **"Emergency cancel"** stays for upcoming pending or confirmed bookings, for example when a professional is suspended. It needs a written reason and a confirm step, and says both people will be told and the audit log records it.
- **Cancelled by an admin** bookings show the reason in the popup.
- **Page subtitle** now says users and professionals manage their own bookings.

**What changed for the team:**
- **`AdminBooking` has optional `cancelledBy` and `cancelReason`.** They match the existing `cancelled_by` and `cancel_reason` columns on `appointments`.
- **Removed** the admin reschedule and confirm logic (and its clash check) from `bookings-view.tsx`. Confirming and rescheduling move to the `/pro` area.
- **New text in the popup is English only,** following the admin rule.
- **`BACKEND-HANDOFF.md`:** new product decision in section 7 and the emergency cancel contract in section 12.

**What to re-test:**
- Open `/admin/bookings`, open an upcoming confirmed booking, and confirm there is no Confirm or Reschedule, only the note and "Emergency cancel";
- Press "Emergency cancel" and submit with no reason; confirm it asks for one;
- Cancel with a reason and confirm the booking shows as cancelled, the chart updates, and reopening it shows "Cancelled by an admin" with the reason;
- Open a past or already cancelled booking and confirm there is no cancel button.

---

## 13 Oct 2026: Bookings Chart on the Admin Bookings Page

Commit `1f3f976`. No migration. Frontend only, on sample bookings.

**Why.** Admins could only see bookings as a long list, which made it hard to tell whether today is busier than yesterday or whether bookings are growing. A day by day chart makes that clear at a glance and helps the team spot busy days and cancellations early.

**What changed for users (admins):**
- **New chart at the top of `/admin/bookings`** with one column per day.
- **Switch between "Sessions per day"** (when sessions happen, split into completed or confirmed, pending and cancelled) **and "New bookings per day"** (when people booked).
- **Ranges:** last 7 days, last 30 days, and next 14 days for upcoming sessions.
- **Quick comparison above the chart:** the total for the range, how many more or fewer than the same number of days before (with a percentage), and the busiest day.
- **Hover a day** to see its exact numbers. **Click a day** (in Sessions per day) to filter the bookings list below to that date.
- **"View as table"** shows the same numbers day by day, with a "Show bookings" link per day.
- **English only,** following the new admin rule.

**What changed for the team:**
- **New `bookings-chart.tsx`** (Recharts columns, 24px wide, rounded tops, 2px gaps between stacked parts). Colours were checked with the dataviz palette validator: green and amber pass the colour blind checks, cancelled uses a quiet gray on purpose, and the legend plus table view carry the values.
- **No grow in animation:** with the custom column shape it could stall at zero height.
- **Sample data:** `app/admin/_data/bookings.ts` now generates about 105 extra demo bookings around 13 Oct 2026, with no double bookings.
- **`BACKEND-HANDOFF.md` section 12** suggests a counts only daily endpoint for Hok Chheng.

**What to re-test:**
- Open `/admin/bookings`; confirm the chart shows 7 columns ending with "Today" and the total, comparison and busiest day above it;
- Hover a column and confirm the tooltip numbers match "View as table";
- Click a column and confirm the list below jumps to that date;
- Switch to "Last 30 days" and "Next 14 days" and confirm the columns and comparison update;
- Switch to "New bookings per day" and confirm "Next 14 days" disappears and clicking a column does nothing;
- Check the page on a phone width and confirm the chart fits without sideways scrolling.

---

## 13 Oct 2026: Rule Added, New Admin Screens Are English Only

Commit `a2c4a9c`. No migration.

**Why.** The admin area is used only by the AROM team, and everyone on the team reads English. Translating every admin label into Khmer takes time and adds code without helping anyone. User facing pages are not affected.

**What changed for users:**
- **Nothing.** Seekers and professionals see the same bilingual app as before.

**What changed for the team:**
- **New rule in `AGENTS.md` section 4:** new admin labels, buttons, headings and messages are English only.
- **Existing Khmer in the admin stays.** Nothing was removed.
- **Khmer content fields stay,** for example "Title (Khmer)" in the MindGuide editor, because users read that content.
- **AI assistants** on every teammate's machine read `AGENTS.md`, so they follow the same rule.

**What to re-test:**
- Nothing to test in the app. Check that the next admin screen built uses English labels only and still has Khmer fields for user facing content.

---

## 13 Oct 2026: "For Learning Only, Not a Diagnosis" Note on Every MindGuide Screen

Commit `52f54f5`. No migration.

**Why.** MindGuide lessons, tips, practices and podcasts teach people about their mental health, but they are not a diagnosis or treatment. Users need to see that clearly, and it protects AROM too. Because it is a safety message, it is written into the app and cannot be deleted by editing content.

**What changed for users:**
- **A short calm note** on the lesson overview, inside every lesson section, the tip overview and steps page, the practice overview and every podcast episode: "For learning only. This is not a diagnosis or treatment. If you are worried about your mental health, talk to a professional."
- **"Talk to a professional"** links to the professional directory.
- **Khmer and English.**

**What changed for the team:**
- **New `EducationalNote`** in `app/_components/educational-note.tsx`, placed in the five MindGuide screens and the podcast episode page.
- **It is fixed app text, not content,** so it also shows in the admin preview and no admin edit can remove it.
- **Decision recorded:** no crisis helpline card on content screens, because helpline information is in Settings. Noted in `BACKEND-HANDOFF.md` section 7.

**What to re-test:**
- Open a lesson overview and step through the lesson; confirm the note shows on the overview and in every section;
- Open a tip overview, its steps page and a practice overview; confirm the note shows;
- Open a podcast episode and confirm the note is at the bottom;
- Tap "talk to a professional" and confirm it opens the professional directory;
- Open a lesson in the admin editor Preview and confirm the note shows there too;
- Switch to Khmer and check the wording.

---

## 13 Oct 2026: MindGuide Podcasts for Users, and Admin Podcasts Separate From Professional Podcasts

Commit `33fe5a2`. No migration yet. Frontend only, on sample episodes.

**Why.** AROM has two kinds of podcasts. Professionals publish their own on their profile so users can hear them before booking. The AROM team also makes general podcasts for MindGuide. Before this change the MindGuide "Podcast" icon went nowhere, and the admin Podcasts tab required every episode to belong to a professional.

**What changed for users:**
- **The MindGuide "Podcast" icon now opens a Podcasts page** (`/podcasts`) listing AROM team episodes with topic, length, guest and date.
- **Episode page** with a calm audio player: play and pause, 15 seconds back and forward, a position slider, speed 1x, 1.25x and 1.5x, and a chapter list that jumps to each part.
- **Key points** under the player, and a guest card that links to the professional's profile when a professional joined the episode.
- **Before audio files are added,** the page says the audio is coming soon and the description, chapters and key points can still be read.
- **Khmer and English** for every label and episode text.

**What changed for admins:**
- **MindGuide, Podcasts tab** now holds the AROM team episodes. "Professional" became an optional **"Guest professional"**, and only verified, active professionals can be picked.
- **A note on the tab** explains that podcasts on professional profiles are managed by the professionals themselves.

**What changed for the team:**
- **New files:** `app/_components/podcasts/` (data, player, views) and routes `app/podcasts/`.
- **`AdminPodcast.professionalId` is now `guestProfessionalId`** and can be empty. Admin podcasts are seeded from the same sample episodes users see.
- **Three sample episodes** were written as placeholders. Replace them with real episodes and audio.
- **`BACKEND-HANDOFF.md` section 11** has the data shape and backend gaps.

**What to re-test:**
- Open MindGuide and tap the Podcast icon; confirm three episodes show, newest first;
- Open "Why stress shows up in your body"; confirm the "audio coming soon" note, chapters, key points and the guest card for Dr. Sopheap Chan with a working profile link;
- In the admin, add a real HTTPS audio URL to an episode and confirm the form accepts it (users will hear it once the backend is connected);
- In the admin Podcasts tab, open an episode and confirm the guest list only shows verified, active professionals and "No guest" is allowed;
- Switch to Khmer on the podcasts list and an episode page.

---

## 13 Oct 2026: Report a Problem on MindGuide Content and an Admin Reports Page

Commit `b8b77d3`. No migration yet. Frontend only, on mock data.

**Why.** Users are the first to notice a wrong fact, a broken button or wording that feels hurtful. On a mental health app the last one matters most. Users now have a calm way to tell the team, and admins have one place to see and fix what was reported, starting with anything upsetting or harmful.

**What changed for users:**
- **Quiet "Report a problem" link** at the end of the lesson overview, inside every lesson section, on the tip overview and steps page, and on the practice overview.
- **Short form:** pick wrong information, upsetting or harmful, something broken, or other, and optionally add a note. The form asks not to write personal or health details and says it goes to the content team, not a counselor.
- **Gentle support line** when "upsetting or harmful" is chosen, with a link to talk to a professional.
- **Limit of 5 reports a day** with a friendly message.
- **Inside a lesson, the report points at that exact section.**

**What changed for admins:**
- **New "Reports" page** in the admin sidebar with a count of open reports.
- **One card per item,** with "upsetting or harmful" items first and outlined in red, then the items with the most reports.
- **Each card shows** the reasons with counts, and every report with its section, date and note. Reporters are never shown.
- **Edit** opens the item in the MindGuide editor and jumps to the reported section. **Fixed** and **Not a problem** close all open reports on that item, recording who closed them and when.
- **Closed tab** shows past reports and how they were closed.
- **The MindGuide sidebar link stays highlighted** while editing an item.

**What changed for the team:**
- **`ReportProblemButton`** in `app/_components/report-problem.tsx` and types plus mock submit in `app/_components/content-reports.ts`.
- **Admin:** `app/admin/_data/reports.ts`, `reports-view.tsx`, `/admin/reports`, provider `reports` and `resolveReports`.
- **Editor accepts `?part=`** to open at a section or step.
- **`BACKEND-HANDOFF.md` section 10** lists the data shape, daily limit and privacy rules.
- **Mock today:** user reports do not reach the admin page yet; the admin page uses sample reports.

**What to re-test:**
- Open a lesson, go to section 2 and press "Report a problem"; confirm the dialog shows "Section 2", needs a reason, and shows the support line for "Upsetting or harmful";
- Send a report and confirm the thank you message; send five more today and confirm the daily limit message;
- Open a tip and a practice and confirm the link is at the bottom; open the admin preview and confirm the link is hidden there;
- As admin open Reports; confirm the stress lesson is first with a red outline and the badge in the sidebar shows the open count;
- Press Edit on the stress lesson and confirm the editor opens at Section 3;
- Press Fixed on the tip card and confirm it moves to the Closed tab with your name;
- Switch to Khmer and check the dialog and the Reports page.

---

## 13 Oct 2026: Live Preview in the MindGuide Editor Using the Real User Screens

Commit `bbeb916`. No migration.

**Why.** Admins fix text, but they also need to see how it will actually look to users before publishing. A preview that copies the design would drift from the real app, so the editor now shows the exact screens users get.

**What changed for users (admins):**
- **Edit and Preview switch** at the top of the MindGuide editor.
- **The preview is the real user screen** (lesson overview and lesson sections, tip overview and steps, practice overview), drawn from the current edits, including unsaved ones, and updated while typing.
- **Phone and Desktop toggle.** Phone shows a real 390px phone layout, not a squeezed desktop page.
- **Language follows the switch at the top,** so admins can check Khmer and English.
- **Start over** returns the preview to the overview screen.
- **Nothing is saved while previewing.** Bookmarks, "add to plan" and lesson progress do nothing in the preview, so admins do not change their own data.
- **Tapping a problem in Checks** switches back to Edit and jumps to the field.
- **A half finished draft cannot break the editor.** If a screen cannot draw it yet, the preview says to fix the problems in Checks.

**What changed for the team:**
- **New page `/content-preview`** that only draws what the editor sends it (same site messages only) and is hidden from search engines. It lives outside `/admin` so the admin sidebar does not wrap it.
- **`preview` prop** on `LessonDetailView`, `LessonScreen`, `TipDetailView`, `TipInteractiveView` and `PracticeDetailView` turns off saving to the browser. Normal use is unchanged.
- **`app/admin/_data/content-preview.ts`** converts an editor body into the objects the user screens take.
- **Known gap:** practice instructions and breathing settings are edited in the admin but the user app does not show them yet, and the preview says so.

**What to re-test:**
- Open a lesson in the editor, switch to Preview and confirm it looks like `/mindguide/learn`; press Start and step through sections;
- Change a section title in Edit, switch to Preview and confirm the new text shows without saving;
- Switch Phone and Desktop and confirm the layout changes like a real phone and a real computer;
- Switch the language at the top and confirm the preview changes language;
- Bookmark or add to plan inside the preview, then check your own Saved and Home plan are unchanged;
- Remove all sections from a draft lesson and confirm the preview shows a calm message instead of an error;
- Tap a Checks problem while in Preview and confirm it jumps to the field in Edit.

---

## 13 Oct 2026: MindGuide Editor With Drafts, Publishing, Version History and Checks

Commit `ab0a85e`. No migration yet. Frontend only, on mock data.

**Why.** Lessons, tips and practices are written and designed by the team with Claude. Admins only need to fix mistakes, but before this change every save went straight to "live" with no history, no review and no way to undo. On a mental health app, a half finished or broken lesson must never reach users, and every live text needs a responsible admin.

**What changed for users (admins):**
- **One Edit button per item** in the MindGuide list, which opens a full editor page instead of three separate popups.
- **Status chips:** Live, Live with a draft, Not published, Hidden. The list also shows the live version number and who changed it last and when.
- **Edits are drafts first.** "Save draft" keeps work without users seeing it. "Undo changes" goes back to the last saved state.
- **Publish with a confirm step** that lists exactly what will change (for example "Title (Khmer)" or "Sections: 1 edited") and the new version number.
- **Checks panel.** Lists problems such as a missing title, a quiz without exactly one correct answer, or a step without instructions. Tapping a problem jumps to that field. Problems block Publish but not Save draft. Missing Khmer text shows as a warning that does not block.
- **Version history** with who published each version and when, and "Restore as draft" on any old version.
- **Hide from users and Discard draft** take two taps. Items that were never published can be deleted.
- **Warning before leaving** the editor with unsaved changes (closing the tab, refreshing or clicking a link).
- **New items** open straight in the editor as a draft.

**What changed for the team:**
- **New data model** in `app/admin/_data/content.ts`: `ContentRecord` with `versions` (never changed once published), one optional `draft`, and `liveVersion` (null means hidden or never published). Seed items that were available start as version 1 by "AROM team"; the rest start as drafts.
- **Sokheng's three editors are now field panels** (`LessonFields`, `TipFields`, `PracticeFields`) plus `ContentMetaFields`. All fields stayed the same; the popup, Save button and validation moved to the editor page. `content-form.tsx` was removed.
- **Publish rules** live in `content-checks.ts`; the change summary in `content-diff.ts`.
- **No overwrite rule:** save and publish pass the draft time the editor loaded and refuse with `stale` if another admin saved in between.
- **Lesson section ids are never reused,** so future "Report a problem" links to a section stay correct.
- **`BACKEND-HANDOFF.md` section 9** describes tables, actions, hint codes and rules for Hok Chheng.
- **Users still see the content from the code files.** Publishing changes the admin view only until the backend is connected.

**What to re-test:**
- Open MindGuide as admin and confirm status chips, version numbers and "Last change" show on Lessons, Tips and Practices;
- Edit a live lesson title, confirm "Unsaved changes", try clicking the MindGuide back link and confirm the warning appears;
- Save draft, confirm the chip becomes "Live, has draft"; press Publish and confirm the dialog lists "Title (English)" and version 2; publish and confirm the chip is "Live" and history shows version 2 by you;
- Clear a section title and confirm Checks shows the problem, tapping it jumps to the field and Publish is disabled;
- Open a practice (no instructions yet) and confirm Checks lists "Add at least one instruction";
- In Version history restore version 1, confirm the fields change back and the item has a draft;
- Hide a live item with two taps, confirm the chip is "Hidden", then show it again;
- Add a new tip, confirm the editor opens, then delete it with two taps and confirm you return to the list;
- Switch to Khmer and check the editor labels, checks and dialogs.

---

## 12 Oct 2026: Admin Panel Link and Admins Land on the Admin Panel After Login

Commit `bceb0cb`. No migration.

**Why.** Admins logged in and landed on the normal user home page with no way to reach the admin area except typing `/admin` by hand. It looked like their admin access was missing.

**What changed for users:**
- **New "Admin" section with an "Admin panel" link** at the top of the sidebar (desktop and the mobile drawer). Only admins see it. Normal users and professionals see no change.
- **Admins go straight to `/admin` after logging in.** Normal users still go to the home page.
- **Coming back to a page still works.** If someone was sent to log in from a specific page (the `?next=` link), they return to that page instead, admins included.

**What changed for the team:**
- **`NavSection` has an optional `roles` list** in `app/_components/navigation-config.ts`, and `sectionsForRole(role)` filters sections. Both `DesktopNavigation` and `MobileSidebarDrawer` use it. Hiding a link is only for convenience: `proxy.ts` and `requireRole` still guard the pages and APIs.
- **`login-form.tsx` reads the role** from the `/api/auth/login` response to pick where to go.
- **If an admin is sent back to home from `/admin`,** their login token has no `user_role` claim. Check that the Customize Access Token hook (`public.custom_access_token_hook`) is turned on in Supabase, then log out and in.

**What to re-test:**
- Log in as an admin and confirm you land on `/admin`;
- Click "View website" in the admin panel, then confirm the sidebar shows the Admin section with "Admin panel", and that it opens `/admin`;
- Open the mobile drawer on a phone size screen as an admin and confirm the same link;
- Log in as a normal user and confirm you land on home and see no Admin section;
- Log out, open `/profile`, log in as admin when asked, and confirm you return to `/profile`.

---

## 12 Oct 2026: Admin Content and Podcasts Merged Into One MindGuide Page

Commit `bceb0cb`. No migration.

**Why.** Lessons, tips, practices and podcasts are all part of MindGuide for users, but admins had to manage them on two separate pages (Content and Podcasts). One page with the same name users see makes the admin area simpler and easier to find things in.

**What changed for users (admins):**
- **One "MindGuide" item in the admin sidebar** replaces "Content" and "Podcasts".
- **Four tabs on one page:** Lessons, Tips, Practices and Podcasts, each with a count. Search, filters and editors work the same as before.
- **The add button matches the tab:** Add lesson, Add tip, Add practice or Add podcast.
- **The tab is kept in the address** (for example `/admin/mindguide?tab=podcast`), so refreshing or sharing the link opens the same tab.
- **Old links still work.** `/admin/content` opens the Lessons tab and `/admin/podcasts` opens the Podcasts tab.

**What changed for the team:**
- **New page** `app/admin/mindguide/page.tsx` and component `app/admin/_components/mindguide-view.tsx`, which owns the header and tabs.
- **`ContentView` now takes `activeType`** and shows one content type. **`PodcastsView`** no longer has its own header. All editors (lesson, tip, practice, podcast) are unchanged.
- **Tab list** lives in `app/admin/_data/mindguide.ts` (`MINDGUIDE_TABS`, `parseMindGuideTab`).
- **`/admin/content` and `/admin/podcasts`** are now redirects.

**What to re-test:**
- Log in as admin and confirm the sidebar shows MindGuide and no longer shows Content or Podcasts;
- Open MindGuide and switch between all four tabs; confirm counts, search, status filters and the add button label change with the tab;
- Edit a lesson, a tip, a practice and a podcast to confirm each editor still opens and saves;
- Open the Podcasts tab, refresh the page and confirm it stays on Podcasts;
- Visit `/admin/content` and `/admin/podcasts` and confirm they land on the right tab;
- Switch to Khmer and check the tab names and page title.

---

## 12 Oct 2026: "Other" Option for Specialties in the Professional Application

Commit `bceb0cb`. No migration.

**Why.** The application form only offered nine fixed specialties. Therapists who work in other areas, such as addiction or postpartum support, had no way to say so.

**What changed for users:**
- **New "Other" chip** at the end of the specialties list. Tapping it opens a text box where they type their own specialties, separated by commas (up to 5).
- **They can mix both.** For example, tick Anxiety and Family, and type "Addiction" under Other. One chip or one typed specialty is enough to submit.
- **Apply again keeps them.** When a rejected applicant applies again, their typed specialties come back in the Other box.

**What changed for the team:**
- **`createApplicationSchema` has two new fields,** `hasOtherSpecialty` and `otherSpecialties`. The schema merges them into one `specialties` list on submit, so the saved data shape did not change.
- **`BACKEND-HANDOFF.md` section 8** notes that specialties can now be free text, so the backend must not treat them as a fixed list.

**What to re-test:**
- Tick only "Other", leave the box empty and submit; confirm "Type your specialty";
- Type six specialties separated by commas; confirm the "up to 5" error;
- Tick Anxiety and type "Addiction, Anxiety" under Other; submit and confirm Anxiety is listed once;
- Use the demo bar to open Rejected, press "Apply again" and confirm "Addiction" is in the Other box and Anxiety and Students chips are ticked;
- Switch to Khmer and check the Other chip, hint and errors.

---

## 12 Oct 2026: Become a Professional Application for Users

Commit `c2ed1c0`. No migration yet. Frontend only, using mock data in `app/profile/become-professional/_data/application.ts`.

**Why.** Licensed therapists who sign up as normal users had no way to ask to become a professional on AROM. They now have a clear form and can see where their application stands. Admins get the details they need to verify a license, including a phone number and Telegram so they can follow up quickly.

**What changed for users:**
- **New "Become a Professional" link in Profile.** Only shown to normal users, not to professionals or admins.
- **Application form** at `/profile/become-professional`: full name, phone number, "Same number on Telegram" (or a Telegram username), professional title, license number, issuing body, license photo or PDF, specialties, session languages, years of experience, an optional note on why they want to join, and a confirmation that the details are true.
- **Clear privacy note.** Phone, Telegram and the license file are visible to the AROM team only and never appear on the public profile.
- **Status page after submitting.** Pending (with the date and a 1 to 3 working days note), Approved (with a "Log out and log in again" button so the new role takes effect), or Rejected (showing the admin's reason and an "Apply again" button that refills the form).
- **Bilingual.** Every label, hint, error message and status is in Khmer and English.

**What changed for admins:**
- **Phone and Telegram in the review panel** on `/admin/professionals`, with a tap to call link and a note that contact details are admin only.

**What changed for the team:**
- **New route** `app/profile/become-professional/` with its page, component and data file. It sits under `/profile`, so the existing login guard covers it.
- **Form uses `react-hook-form` and `zod`** like the login and signup forms. `createApplicationSchema(km)` holds every validation rule with Khmer and English messages.
- **Demo bar** on the page previews each status (Not applied, Pending, Approved, Rejected). Remove it when the backend is connected.
- **`Professional` type now has `phone` and `telegram`.**
- **`BACKEND-HANDOFF.md` section 8** lists the data shape, validation rules, endpoints, new `phone` and `telegram` columns and private license upload that Hok Chheng needs to build.

**What to re-test:**
- Log in as a normal user, open Profile and confirm "Become a Professional" shows; log in as admin and confirm it does not;
- Open `/profile/become-professional` and submit an empty form; confirm each required field shows an error;
- Enter `12345` as the phone and confirm the Cambodian number error; enter `012 345 678` and confirm it passes;
- Untick "Same number on Telegram" and confirm the Telegram field appears;
- Attach a file over 5 MB or a `.docx` and confirm the file error;
- Submit a valid form and confirm the Pending status shows your details;
- Use the demo bar to view Approved and Rejected; on Rejected press "Apply again" and confirm the form is refilled and the reason is shown above it;
- Switch to Khmer and check every label and message;
- Open `/admin/professionals`, review Vanna Keo and confirm phone and Telegram show.

---

## 12 Oct 2026: Admin Users Page With Account Details and Role Changes

Commit `c2ed1c0`. No migration yet. Frontend only, using mock data in `app/admin/_data/users.ts`.

**Why.** Admins need one place to look up an account and change what that person can do. Sometimes the team already knows a therapist personally, so an admin should be able to make them a professional directly instead of waiting for an application. Admins also need a safe way to add or remove other admins.

**What changed for users (admins):**
- **Expandable account cards.** Each account shows name, email, role badge (Admin, Professional), a "You" badge on your own account, and when they were last seen. Tap a card to open the details.
- **Safe details only.** Joined date, last seen, language, status, days active in the last 30 days, check in count and booking count. Counts only, with a note that admins cannot read journals, moods or session notes.
- **Make professional.** For people you know. You must still enter their title, license number and issuing body. They then show on the Professionals page as "Promoted by admin" and fill in their own public profile.
- **Make admin.** A confirm step with a required checkbox ("I understand this person will have full admin access").
- **Remove professional role, remove admin access, suspend and restore.** Each has a confirm step. Removing a professional hides them from the directory.
- **Built in safety.** You cannot change your own role or status, and the last admin cannot be removed.
- **Role and status filters** next to search, and four summary cards: Total accounts, Professionals, Admins, Suspended.

**What changed for the team:**
- **`AdminUser` now has `role`, `lastSeenAt`, `daysActive30`, `checkInCount` and `bookingCount`.** `currentAdminId` stands in for the signed in admin until the backend provides it.
- **New provider action `setUserRole(userId, role, promotion?)`** in `admin-provider.tsx`. Promoting to professional also creates or updates their entry on the Professionals page. `Professional` has a new `source` field (`application` or `admin`).
- **Backend needed (Hok Chheng).** The database currently blocks granting or removing `admin` through the API on purpose. To support Make admin it needs an admin only path with an audit log entry and a "last admin" guard. `PATCH /api/admin/users/:id/role` also needs to accept and save the license number, issuing body and title when promoting to professional. The users list needs last seen and the activity counts.

**What to re-test:**
- Log in as admin and open `/admin/users`; tap a card to open it and tap again to close;
- Open your own card (marked "You") and confirm there are no action buttons;
- Make Sok Dara a professional with a license number; confirm the Professional badge, then find them on `/admin/professionals` marked "Promoted by admin";
- Try Make admin without ticking the checkbox and confirm it will not submit;
- Remove admin access from Neou Sokheng and confirm they become a regular user;
- Suspend and restore an account;
- Filter by role and by status, and switch to Khmer to check every label and dialog.

---

## 12 Oct 2026: Admin Professionals Page Becomes a Review and Moderation Page

Commit `c2ed1c0`. No migration. Frontend only, using mock data in `app/admin/_data/professionals.ts`.

**Why.** Admins were typing and editing therapist profiles by hand. That does not scale, and therapists know their own details best. Professionals will now edit their own profiles, and the admin's job is to check licenses, approve or reject applications, and control who appears in the directory.

**What changed for users (admins):**
- **No more add or edit form.** The admin Professionals page no longer lets admins write profiles.
- **Review queue.** Cards for Needs review, Live in directory, Suspended and Rejected. New applications and profile changes are listed first.
- **Review panel.** Opening a professional shows their license number, issuing body, license document name, profile, and any changes waiting for review (old value crossed out, new value next to it).
- **Clear actions with a confirm step.** Approve or reject an application, approve or decline profile changes, suspend or reinstate. Reject, decline and suspend need a written reason, which the professional will see.
- **Safety rule.** A change to name, title, license number or issuing body waits for admin review. The public profile keeps the old details until then.

**What changed for the team:**
- **New mock data shape.** `Professional` now has `verificationStatus` (`pending`, `verified`, `rejected`) and `accountStatus` (`active`, `suspended`), matching `professional_profiles.verification_status` and `profiles.account_status`. It also has `credential`, `pendingChanges` and `reviewNote`. The old `status` (published, draft, archived) is gone.
- **New provider actions.** `save` was replaced by `reviewApplication`, `reviewProfileChanges` and `setProfessionalAccess` in `admin-provider.tsx`. The backend can swap each one for an API call without touching the page.
- **Backend still needed (Hok Chheng).** A table or column for pending profile changes, a review endpoint for those changes, a suspend and reinstate endpoint, and a signed URL for the private license document.
- **Removed `professional-form.tsx`.** The profile editing form will be rebuilt for professionals under `/pro`.

**What to re-test:**
- Log in as admin and open `/admin/professionals`; confirm the four cards show 3, 3, 1 and 1;
- Open Vanna Keo, approve, and confirm the status becomes Live;
- Open Dara Lim, click Reject with an empty reason, and confirm it asks for a reason;
- Open Dr. Ratanak Pich, approve changes, and confirm the title and license number update;
- Suspend a live professional, then reinstate them;
- Switch to Khmer and confirm all labels, buttons and dialogs read correctly.

---

## 8 Oct 2026: Admin Overview with Live Data, Needs Attention Queue and Sign Up Graph

Commit `e6819e1`. No migration. Uses `admin_stats()` and existing tables. New dependency: `recharts`.

**Why.** The admin overview only counted demo professionals. Admins need to see what needs them first (safety flags, missing crisis hotlines, waiting therapist applications) and how the platform is growing, from real Supabase data, without ever seeing private content.

**What changed for users (admins):**
- **Needs attention queue.** Self harm risk flags come first, then other flags, missing crisis hotline numbers, and waiting therapist applications. Applications can be approved or rejected right in the list, with a confirm step.
- **Real numbers.** Accounts, verified professionals, upcoming sessions and open safety flags come from the database.
- **New accounts line graph.** Daily sign ups for the last 7, 30 or 90 days with a hover tooltip and a "View as table" option.
- **Accounts by role, wellbeing activity and recent admin actions** in a side column. Activity is counts only, with a note that admins cannot read journals, answers or session notes.
- **Clearer layout.** Panels now sit on a slightly darker background with stronger borders, so each box is easy to see. The demo data banner only shows on pages that still use demo data.

**What changed for the team:**
- **`GET /api/admin/overview?days=7|30|90`** in `lib/controllers/admin-controller.ts`. Admin only (uses `requireRole`). Returns counts and queue metadata only; flag details, emails and private content are never selected.
- **`lib/admin-overview.ts`** holds the response types and the Cambodia time day bucketing for the graph.
- **`app/admin/_components/signups-chart.tsx`** is a Recharts line chart (2px line, light wash, crosshair tooltip).
- **New tokens in `app/index.css`:** `arom-warning`, `arom-warning-soft`, `arom-grid`, `arom-line`, `admin-canvas`, `shadow-panel`.

**What to re-test:**
- Log in as admin and open `/admin`; confirm the four numbers match Supabase;
- With no crisis hotlines added, confirm "No crisis hotlines added yet" shows as Urgent;
- Switch the graph between 7d, 30d and 90d and hover a point to see the date and count;
- Open "View as table" and confirm the daily counts;
- Create a test therapist application, approve it from the queue, and confirm the account becomes `professional` and an entry appears under Recent admin actions;
- Log in as a normal user and confirm `/admin` sends you home and `/api/admin/overview` returns 403.

---

## 8 Oct 2026: Removed Quests, Shop, and Friends Coming Soon Items

Commit `fa17d76`. No database migration required.

**Why.** The Main Page section previously contained three placeholder Coming Soon items (Quests, Shop, and Friends). Removing these items streamlines the sidebar navigation, eliminating unused placeholders and focusing users on core features: Home, MindGuide, Detection, and Progress Dashboard.

**What changed for users:**
- **Simplified Main Navigation.** The "Coming Soon" section under Main Page has been removed. Users now see only available, active navigation destinations (Home, MindGuide, Detection, Progress Dashboard) without distracting unreleased placeholders.
- **Unified Mobile Drawer.** The slide-out mobile navigation drawer is updated identically, offering a clean, uncluttered browsing experience.

**What changed for the team:**
- **Updated `NAVIGATION_SECTIONS` in `app/_components/navigation-config.ts`.** Removed `quests`, `shop`, and `friends` from the main section array. Cleaned up unused Lucide icon imports (`Compass`, `ShoppingBag`, `Users`).
- **Refined `NavigationLabel` in `app/_components/app-navigation.tsx`.** Removed obsolete label types `Quests`, `Shop`, and `Friends`.

**What to re-test:**
- Check desktop sidebar to verify the Main Page section contains only Home, MindGuide, Detection, and Progress Dashboard with no Coming Soon section underneath;
- Open mobile sidebar drawer and confirm the same streamlined Main Page section;
- Verify TypeScript checks pass without errors.

---

## 8 Oct 2026: Roles in the Login Token and Admin Role Controls

Commit pending. Migration: run `supabase/migrations/20261008000900_role_claims.sql` after files `0100` to `0800`, then turn on the access token hook (Authentication, Hooks). `0001_profiles_auth.sql` was removed: the team schema in `20261008000100_core_profiles.sql` now owns `profiles`.

**Why.** AROM has three roles: `user`, `professional` and `admin`. Each needs a clear, safe way to be given, and the app needs to know a person's role quickly on every page. Therapists must only be promoted by an admin, and nobody should be able to make themselves an admin through the app.

**What changed for users:**
- **Admin and therapist pages are protected.** Anything under `/admin` is for admins only, and anything under `/pro` is for professionals and admins. Everyone else is sent home, and signed out visitors are sent to log in.
- **Language is remembered from sign up.** Signing up while AROM is in Khmer now saves Khmer to the new account.

**What changed for the team:**
- **How each role is given.** `user`: automatically at sign up. `professional`: only by an admin, by approving an application or with the set role endpoint. `admin`: only by hand in the Supabase SQL editor. The database now blocks granting or removing `admin` through the API, even by another admin.
- **Role in the JWT.** New `custom_access_token_hook` adds `user_role` and `account_status` claims to every access token. `proxy.ts` uses `user_role` to guard pages without a database query. A role change shows up in the token at its next refresh (within about an hour, or right away after logging out and in).
- **Role controller in `lib/controllers/role-controller.ts`.** `requireRole(...)` checks the role in the database (not the token), so APIs react to a role change immediately. Endpoints: `GET /api/admin/users`, `PATCH /api/admin/users/:id/role` (`user` or `professional` only), `GET /api/admin/applications`, `POST /api/admin/applications/:id/review`. All are admin only.
- **New `set_user_role()` database function.** Admin only. Moves an account between `user` and `professional`, hides a demoted therapist from the directory, and is logged in `admin_audit_log` by the existing triggers.
- **Role rules in `lib/roles.ts`.** Shared schemas, types and the `ROLE_ROUTES` page map.
- **Profile code now matches the team schema.** `locale` became `language`, and the profile also returns `accountStatus`.

**What to re-test:**
- Run the cleanup SQL (only if `0001_profiles_auth.sql` was run before), then files `0100` to `0900` in order;
- Turn on the Customize Access Token hook with `public.custom_access_token_hook`;
- Make your account admin in the SQL editor, log out and log back in;
- Open `/api/admin/users` while logged in and confirm you see the account list;
- Log in as a normal user and confirm `/api/admin/users` returns 403 and `/admin` sends you home;
- As admin, try `PATCH /api/admin/users/<id>/role` with `{"role":"admin"}` and confirm it is refused;
- Sign up with AROM set to Khmer and confirm `profiles.language` is `km`.

---

## 8 Oct 2026: Your Real Name and Profile Across AROM

Commit `a67dd1c`. No new migration. The `profiles` table now comes from `20261008000100_core_profiles.sql` (see the entry above).

**Why.** Every screen greeted everyone as "Muoyly" and showed the same avatar, even after real accounts arrived. Now that people sign in with their own accounts, AROM should know who they are: their name in the greeting and sidebar, and a profile page that shows their real details and saves their choices.

**What changed for users:**
- **Your name everywhere.** The home greeting says "Good morning" with your first name, and the sidebar shows your full name. Guests see "Good morning!" and "Guest".
- **Your own avatar.** The shared illustration is replaced by a calm initials avatar (for example "SD"). Guests see a neutral person icon.
- **Real profile details.** The Profile page shows your name, email, role (Member, Professional or Admin) and the year you joined.
- **Edit your name.** Tap the pencil next to your name on Profile, type, and save.
- **Language follows you.** Switching between English and Khmer while signed in is saved to your account and comes back on any device.
- **Switch Account works.** It now signs you out and opens the login page.

**What changed for the team:**
- **`AuthProvider` and `useAuth()` in `app/_components/auth-provider.tsx`.** Wraps the app in `app/layout.tsx`, fetches `/api/auth/me` once, and exposes `user`, `status` (`loading`, `authenticated`, `guest`), `refresh()` and `updateProfile()`. `useFirstName()` helps greetings.
- **`UserAvatar` in `app/_components/user-avatar.tsx`.** Replaces the hardcoded avatar image in 7 places: sidebar, mobile drawer, top header, home, MindGuide, professional directory and profile.
- **Profile API.** `GET /api/profile` and `PATCH /api/profile` (accepts only `fullName` and `locale`; role can never be sent) in `lib/controllers/profile-controller.ts`.
- **Shared controller helpers in `lib/controllers/shared.ts`.** Common JSON responses, error codes and the profile read, used by both controllers.
- **`GET /api/auth/me` now returns `{ user: null }` with 200 for guests** instead of 401, so the browser console stays clean on every page.
- **Still mock data.** Profile stats (day streak, sessions, mindful minutes), journal entries, moods and community messages still live only in the browser and are not tied to an account yet.

**What to re-test:**
- Signed out, open `/` and confirm the greeting says "Good morning!" and the sidebar shows "Guest";
- Log in and confirm the greeting shows your first name and the sidebar shows your full name and initials;
- Open `/profile` and confirm your name, email, "Member" badge and join year are correct;
- Tap the pencil, change your name, save, and confirm it updates in the sidebar right away and in `profiles.full_name` in Supabase;
- Switch to Khmer on Profile, reload the page, and confirm Khmer stays and `profiles.locale` is `km`;
- Tap "Switch Account" and confirm you land on `/login` signed out.

---

## 7 Oct 2026: Real Accounts with Supabase (Register, Log In, Log Out)

Commit `a67dd1c`. The original `0001_profiles_auth.sql` was later replaced by the team schema in `20261008000100_core_profiles.sql`.

**Why.** Login and signup were a demo that only accepted one hardcoded account and stored it in the browser. AROM holds sensitive mental health data, so every seeker, therapist and admin needs a real, private account before journals, mood logs or bookings can be saved. This change connects AROM to Supabase Auth and sets up the role system (user, professional, admin) that later features build on.

**What changed for users:**
- **Create a real account.** The signup form now creates a Supabase account. When email confirmation is on, users go to a new "Check Your Email" page (`/signup/confirm`) with simple steps.
- **Resend or recover the confirmation email.** The confirm page has a resend button with a 60 second wait between sends. If a link is old or broken, users land on the same page with a "Link expired" message and can send a new link.
- **Log in with your own email and password.** The demo account and the "Use demo account" button are gone. Wrong details show a clear, private message that does not reveal whether an email is registered.
- **Private pages need a login.** Profile, Settings and therapist booking now send signed out visitors to the login page, then back to where they were going after login.
- **Log out works.** "Log out" in Profile now ends the session on this device.

**What changed for the team:**
- **New auth controller in `lib/controllers/auth-controller.ts`.** Holds `register`, `login`, `logout`, `me` and `confirmEmail`. It validates input with the shared zod schemas in `lib/auth.ts`, returns stable error codes (`invalid_input`, `invalid_credentials`, `email_not_confirmed`, `rate_limited`, `unauthorized`, `server_error`) and never logs passwords or tokens.
- **Thin endpoints.** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/resend`, `GET /api/auth/me` and `GET /auth/confirm` only call the controller.
- **Confirm page in `app/signup/confirm/page.tsx` and `app/_components/auth/confirm-email-form.tsx`.** Reuses `AuthShell` and `AuthInput`. The signup email reaches the page through `sessionStorage`, never the URL. The resend endpoint answers the same way for any email, so it cannot be used to check who has an account.
- **Supabase clients in `lib/supabase/`.** `server.ts` for Route Handlers and Server Components, `client.ts` for the browser, `proxy.ts` for session refresh. The unused `lib/supabase.ts` was removed. Only the public anon key is used.
- **Root `proxy.ts` (Next 16 replacement for middleware).** Refreshes the session cookie on every page request and guards protected routes.
- **Roles are locked down in the database.** New accounts are always `user`. A trigger blocks anyone except an admin (or the dashboard SQL editor) from changing a role, so users cannot promote themselves.
- **`.env.example` added** with the two public Supabase variables.
- **Not done yet.** The name "Muoyly" is still hardcoded in the header, greeting and profile. Password reset, Google and Apple sign in are still "coming soon".

**What to re-test:**
- Run the migration SQL in Supabase, then confirm `profiles` exists with RLS enabled;
- In Supabase Auth settings, set Site URL to your app URL and add `http://localhost:3000/auth/confirm` to Redirect URLs;
- Sign up at `/signup` with a new email and confirm you land on `/signup/confirm` with your email filled in;
- Tap "Resend Email" and confirm the button counts down from 60 and a second email arrives;
- Open `/auth/confirm?token_hash=abc&type=email` and confirm you see the "Link expired" version of the page;
- Open the email link and confirm you land on `/` signed in, and a `profiles` row exists with role `user`;
- Log out from `/profile`, then open `/profile` again and confirm you are sent to `/login?next=/profile`;
- Log in with a wrong password and confirm the "do not match" message appears;
- Log in correctly and confirm you return to `/profile`;
- While logged in, open `/login` and confirm you are sent to `/`;
- While logged in as a normal user, try to update your own `profiles.role` to `admin` through the Supabase client and confirm it fails with "only admins can change roles".

---

## 8 Oct 2026: Merged Appointments Navigation Item

Commit `7996830`. No database migration required.

**Why.** Previously, the sidebar displayed two separate upcoming navigation items for "Booking History" and "Schedule Management". Consolidating these into a single "Appointments" item simplifies navigation for users and unifies client booking history and therapist schedule management under one cohesive destination.

**What changed for users:**
- **Consolidated Appointments Navigation.** In the Professional section of both the desktop sidebar and mobile navigation drawer, "Booking History" and "Schedule Management" have been merged into a single item titled "ការណាត់ជួប (Appointments)" with a calendar check icon and "Soon" badge.
- **Cleaner Sidebar Interface.** Removing the duplicate upcoming items reduces clutter in the Professional menu while clearly communicating future appointment management features.

**What changed for the team:**
- **Updated `NAVIGATION_SECTIONS` in `app/_components/navigation-config.ts`.** Replaced separate `booking-history` and `schedule` nav items with a unified `appointments` item using `CalendarCheck` icon and `isComingSoon: true`.
- **Refined `NavigationLabel` in `app/_components/app-navigation.tsx`.** Updated type definition to include `Appointments` and removed obsolete separate labels.
- **Unused Icons Cleaned Up.** Removed unused `CalendarClock` icon import in `navigation-config.ts`.

**What to re-test:**
- Check desktop sidebar under "អ្នកជំនាញ (Professional)" to verify "Booking History" and "Schedule Management" are replaced by a single "Appointments" item with the "Soon" badge;
- Toggle language to Khmer to confirm the bilingual label renders as "ការណាត់ជួប" with "ឆាប់ៗ" badge;
- Open the mobile navigation drawer to confirm the same unified "Appointments" item renders properly;
- Verify hover tooltip displays correct bilingual coming soon message.

---

## 8 Oct 2026: Support Path Rules and Safety Flag for Symptom Checks

Commit `af64361`. Database migration: 2 new SQL files, `20261008000700_symptom_level_none.sql` and `20261008000800_support_journeys.sql`. Run them after files `0100` to `0600`, in order, on the AROM project. File `0700` must finish before `0800` starts.

**Why.** The team agreed how AROM should respond to a symptom check result. A user with no symptoms should not be pushed anywhere. A user with low or medium symptoms should try self help first, and only be pointed to a professional if things are not better after two weeks. A user with serious symptoms should get professional help and self help at the same time. Any answer that suggests self harm must show crisis hotlines immediately. Putting these rules in the database means every screen gets the same answer.

**What changed for users:**
- **Nothing visible yet for symptom checks.** Those screens are not built. These rules will drive them.
- **Journal "Grateful" emotion now shows a sunflower (🌻)** instead of the sparkles symbol, following the project rule against AI style sparkle icons.

**What changed for the team:**
- **New "none" symptom level.** Results can now be none, low, medium or high.
- **Automatic support path.** Saving a row in `symptom_checks` sets `recommended_path` by itself: none gives no path, low and medium give `self_help`, high gives `self_help_and_professional`.
- **14 day review.** New table `support_journeys` keeps one active journey per user per concern, with `review_due_on` set 14 days ahead (Cambodia time). At the review, the same or a higher level recommends a professional, a lower level starts another 14 days, and none marks the journey improved. A high result at any time recommends a professional straight away.
- **Safety flag.** New column `symptom_checks.safety_concern`. When the app sets it, it must show `crisis_resources` immediately, whatever the level.
- **Privacy.** Journeys are read only for the owner, and visible to a therapist only when the client shares symptom checks. Nobody writes them directly.
- **Tested locally.** All 8 files ran on a fresh Postgres, and 108 checks passed, including every path rule.
- **App flow guide.** A web guide for developers explains the full user, therapist and admin flows, these rules, what is built today, and where each screen's data goes.

**What to re-test:**
- Run files `0700` and then `0800` in the AROM SQL Editor and confirm both finish without errors;
- Insert a `symptom_checks` row with level `low` for a test user and confirm `recommended_path` becomes `self_help` and a `support_journeys` row appears due in 14 days;
- Insert a row with level `high` and confirm the path is `self_help_and_professional`;
- Insert a row with level `none` for a new user and confirm no journey is created.

---

## 8 Oct 2026: Supabase Database Design for All AROM Data

Commit `442b605`. Database migration: 6 new SQL files in `supabase/migrations/`. They are not applied to any project yet. Run them in filename order in the AROM project (`miaczhhhvbnlqwijpmru`) SQL Editor. Do not run them on the BrachNha project.

**Why.** Every piece of user data in AROM (journal, mood, daily plan, saved lessons, community messages) lives only in the browser today. It disappears when a user clears their browser or switches phones, and bookings are not saved anywhere. This design gives every feature in the UX brief a proper, private home in Supabase, for all three roles (seeker, therapist, admin), so the next step can connect the app to it one feature at a time.

**What changed for users:**
- **Nothing visible yet.** The app still uses browser storage. This entry only prepares the database.

**What changed for the team:**
- **28 tables across 6 areas.** Accounts (`profiles`), onboarding and detection (survey, initial insight, mood check ins, journal, symptom checks), therapists (clinics, therapist profiles, credentials, schedule slots, appointments, podcasts), MindGuide and Today's Plan (saved and completed content, plan items), community (groups, members, waitlist, discussions, replies, group check ins, safety flags), and professional and admin tools (therapist applications, intake questions and answers, session notes, crisis hotlines, admin audit log).
- **Therapist tools.** Apply as a therapist (an admin approves, which verifies the account in one step), custom intake questions, private session notes that only the writing therapist can read, and marking sessions completed or no show.
- **Client controlled sharing.** A client can choose, per booking, to share their survey and insight or their symptom checks with that therapist. It is off by default and can be turned off at any time.
- **Admin tools.** Suspend or restore accounts (a suspended account cannot book, join groups or post, but can still read its own data), crisis hotlines in English and Khmer, an append only audit log of role, verification, suspension and safety decisions, and `admin_stats()`, which returns counts only and never names or journal text.
- **Strict privacy rules (RLS) on every table.** Journal, mood, survey, insight, symptom checks and plan are visible to their owner only. Therapists and admins cannot read journals. A therapist sees only their own bookings, and sees a client's name only if that client is not in Anonymous Mode.
- **Roles stay `user`, `professional`, `admin`.** Mentors are professionals. Only a verified professional can create a support group. Users cannot change their own role, and only an admin can verify a therapist.
- **Safe booking and joining.** `book_appointment()` stops two people from booking the same time. `join_support_group()` enforces the 10 member limit and gives each member a "Member 03" style label instead of their name.
- **Profiles are created automatically** when someone signs up with email or Google.
- **Lesson, practice, tip and podcast content stays in the code** for now. The database only stores which items a user saved, viewed or finished.
- **Not included yet:** "Play Cards with Friends" (not in the brief), therapist reviews, notifications, editing lessons from an admin screen, and the private storage bucket for license documents.
- **Crisis hotline numbers are not filled in.** An admin must enter numbers that have been checked with each provider.
- **Tested locally.** All 6 files ran on a fresh Postgres, and 94 privacy, booking and admin checks passed.

**What to re-test:**
- In the AROM Supabase SQL Editor, run the 6 files in order (`...0100` to `...0600`) and confirm each finishes without errors;
- Sign up a test user and confirm a row appears in `profiles` with role `user`;
- Promote a second account to `professional` in the Table Editor, add its `professional_profiles` row, then set `verification_status` to `verified`;
- Check Database, Advisors in Supabase and confirm no table is listed as missing RLS.

---

## 7 Oct 2026: Innovative Daily Plan Curator and Ambient Floating Corner Pin

Commit `8a2c720`. Introduced an interactive Daily Plan Curator Sheet on the Home Screen alongside ambient floating corner pins on MindGuide cards for zero title compression.

**Why.** Previously, inline buttons crammed inside recommendation cards looked clumsy and truncated titles, while users on the Home screen had no central place to discover and curate their wellness routine. This release delivers a cohesive, Figma-grade system: an interactive Daily Plan Curator sheet directly on the Home Screen, plus quiet, floating corner pins on cards that preserve full typography and spaciousness.

**What changed for users:**
- **Interactive Daily Plan Curator Sheet.** On the Home Screen, users can tap "Curate" in the header or the dashed "+ Add Activities to Your Daily Flow" card to open a full wellness picker sheet.
- **Categorized Curation & Live Metrics.** The Curator sheet organizes activities across Practice, Learn, Stress Guides, and Micro-Tips, displaying total chosen activities and estimated minutes in real time with instant 1-tap toggling.
- **Ambient Floating Corner Pin on Cards.** In MindGuide Daily Recommendations, each card features a discreet floating corner pin. It sits gracefully in the top-right corner without compressing or truncating activity titles.
- **Harmonious Status Feedback.** Tapping the corner pin instantly updates the card state, shows a gentle toast confirmation, and synchronizes live with the Home Screen schedule.

**What changed for the team:**
- **Created `DailyPlanCuratorModal` in `app/components/daily-plan-curator-modal.tsx`.** Built a reusable curation sheet with live store subscription, category filtering, metric counters, and accessible keyboard dismissal.
- **Updated `DailyPlanCard` in `app/components/daily-plan-card.tsx`.** Added the header "Curate" trigger and bottom flow builder card.
- **Refined `MindGuideHome` in `app/_components/mindguide-home.tsx`.** Positioned the floating pin with absolute corner anchoring and generous text padding to prevent any title ellipsis.
- **Verified Build.** Next.js production build cleanly compiled with zero errors across all 27 routes.

**What to re-test:**
- Open Home page (`/`) and tap "Curate" or "+ Add Activities to Your Daily Flow" on the Daily Plan card;
- Verify the Daily Plan Curator sheet opens with categorized tabs and live minutes counter;
- Toggle activities to confirm instant addition and removal;
- Navigate to MindGuide (`/mindguide`) and verify the Daily Recommendations cards display full titles with the floating corner pin;
- Tap the corner pin to verify toast alert and instant toggle without opening the modal;
- Click the card body to confirm it opens the full details modal with the primary plan action.

---

## 7 Oct 2026: Restored Clean Layout on Daily Recommendation Cards

Commit `e3e66a8`. Removed cramped inline buttons from Daily Recommendation cards in MindGuide, restoring spacious text display and clean card interactions.

**Why.** Adding inline buttons directly into the 3-column recommendation card grid caused visual crowding and truncated activity titles into short ellipses. Removing the cramped button restores Figma-level aesthetics, clean card padding, and full readability, while keeping the plan addition feature cleanly accessible inside the activity details modal.

**What changed for users:**
- **Restored Full Title Readability.** Recommendation cards under "For Today" in MindGuide no longer squeeze text. Full titles such as "Interactive Breathing Exercise" and "Managing Daily Stress" display without truncation.
- **Clean Single-Action Cards.** Tapping any recommendation card smoothly opens the activity details modal, providing full breathing room.
- **Dedicated Plan Action in Modal.** Users can still add or remove any activity from their Home Screen Daily Plan using the spacious primary button inside the activity details modal.

**What changed for the team:**
- **Streamlined `MindGuideHome` in `app/_components/mindguide-home.tsx`.** Removed inline button nesting and redundant icon imports, restoring single button card triggers with clean hover transitions.
- **Verified Build.** Clean production build check passed with zero errors across all 27 routes.

**What to re-test:**
- Navigate to MindGuide (`/mindguide`) and view the Daily Recommendations section;
- Verify that titles on all three recommendation cards are fully visible without truncation or clutter;
- Click any card to open the activity modal;
- Test adding and removing the activity to your Home Screen Daily Plan via the modal button;
- Verify the Home screen (`/`) updates accordingly.

---

## 7 Oct 2026: Explicit Small Add to Plan Buttons on Daily Recommendations

Commit `9708f0e`. Added prominent small "+ Add to Plan" and "In Plan" buttons directly on each activity card under Daily Recommendations (For Today) in MindGuide, as well as in the activity modal header.

**Why.** Users exploring Daily Recommendations in MindGuide wanted an immediate, small button on each recommendation card to quickly add or remove activities from their Home Screen plan without ambiguous icons.

**What changed for users:**
- **Explicit Small Button on Recommendation Cards.** Each card under Daily Recommendations (For Today) now features a dedicated small "+ Add to Plan" (or "+ ផែនការ") pill button that toggles to "In Plan" (or "ក្នុងផែនការ") upon selection.
- **Top Header Quick Button in Activity Modal.** The activity details modal now displays a matching small button in the top header next to the category badge for instant toggling.
- **Immediate Visual Status.** Users can instantly see which recommended activities are already in their Home Screen plan and toggle them with a single click.

**What changed for the team:**
- **Refined `MindGuideHome` in `app/_components/mindguide-home.tsx`.** Replaced icon-only controls with labeled, responsive small buttons featuring clear Plus and Check icons and accessible labels.
- **Verified Build.** Clean production build with zero errors across all 27 routes.

**What to re-test:**
- Navigate to MindGuide (`/mindguide`) and view the Daily Recommendations (For Today) section;
- Verify each card shows the small "+ Add to Plan" button;
- Click the button to confirm it updates to "In Plan" with a check icon;
- Open the card modal and verify the small button is also available in the modal header;
- Check the Home page (`/`) to confirm the activity appears in "Your Plan For Today".

---

## 7 Oct 2026: MindGuide Content Curation to Home Daily Plan

Commit `f43a44c`. Added ability for users to customize their Home Screen "Your Plan For Today" directly from MindGuide, Practice Hub, Learn Hub, and Daily Stress guides.

**Why.** Users exploring MindGuide frequently discover specific breathing exercises, mindfulness lessons, or stress management routines that resonate with them. Previously, the Home Screen daily plan was fixed and only allowed adding micro tips. Users can now actively curate their daily wellness plan with any MindGuide activity they like, tailoring their daily routine to their personal emotional needs.

**What changed for users:**
- **Add to Daily Plan from MindGuide Activities.** Under the "For Today" section in MindGuide, users can tap the calendar icon on any activity card or open the details modal to tap "Add to Daily Plan at Home Screen" (បន្ថែមទៅផែនការទំព័រដើម).
- **Personalized Home Screen Daily Plan.** Any activity added from MindGuide instantly appears in "Your Plan For Today" on the Home page with dedicated tags, bilingual descriptions, and interactive completion checkboxes.
- **Support Across Hubs.** Users can add exercises directly from Practice Hub (Interactive Breathing, Mindful Body Scan), lessons from Learn Hub (Learn About Stress), and guides from Managing Daily Stress.
- **Real-Time Progress Tracking.** Marking added MindGuide activities complete updates the daily segment progress bar in real time, celebrating incremental progress.
- **Easy Management.** Users can toggle or remove curated items anytime with immediate feedback toasts.

**What changed for the team:**
- **Created Unified Daily Plan Store in `app/_components/daily-plan-store.ts`.** Centralized storage utility managing custom daily plan items, toggle status, and real-time cross-component event broadcasting.
- **Updated `DailyPlanCard` in `app/components/daily-plan-card.tsx`.** Extended the home screen card to dynamically render user-curated items alongside default baseline checks.
- **Integrated Plan Toggles Across MindGuide Components.** Added calendar buttons and notification toasts in `mindguide-home.tsx`, `managing-daily-stress.tsx`, `practice-detail-view.tsx`, `practice-home-view.tsx`, `lesson-detail-view.tsx`, and `learn-home-view.tsx`.
- **Verified Build.** Next.js production build cleanly compiled with zero errors across all 27 routes.

**What to re-test:**
- Navigate to MindGuide (`/mindguide`) and click the calendar icon on "Interactive Breathing Exercise";
- Verify the feedback toast notification appears and the button toggles to active;
- Open the Home screen (`/`) and verify "Interactive Breathing Exercise" appears in "Your Plan For Today";
- Check off the task to verify progress bar incrementation;
- Test adding items from Practice Hub (`/practice`) and Learn Hub (`/learn`);
- Verify removing an item updates the Home Screen daily plan immediately.

---

## 7 Oct 2026: Desktop Sidebar Width Expansion to 19rem and Zero Text Truncation

Commit `2c8f4d1`. Expanded the desktop sidebar layout grid from 15rem (240px) to 19rem (304px) across all 14 application views, completely eliminating text truncation and balancing desktop screen proportions.

**Why.** The previous 15rem desktop sidebar was overly narrow, causing labels like "Progress Dashboard" and "Find Clinic & Hospital" to truncate with ellipses while leaving excessive empty whitespace on the right side of the screen. Expanding to 19rem gives all navigation items generous breathing room and creates a well-proportioned desktop layout.

**What changed for users:**
- **Zero Text Truncation.** All navigation labels, including "Progress Dashboard", "Find Clinic & Hospital", and "Schedule Management", now render fully and cleanly without any cutoffs or trailing ellipses.
- **Spacious 19rem Desktop Navigation.** Expanded sidebar width by 64px (+27% wider) provides comfortable breathing room for both English and natural Khmer script.
- **Harmonious Desktop Proportions.** Better utilizes available screen real estate on laptops and monitors, balancing the sidebar against a generous `max-w-5xl` main wellness canvas.
- **Unified Across All Sections.** Home, Journal, MindGuide, Professional Directory, Community, Practice, and Settings all maintain the exact same spacious 19rem sidebar layout.

**What changed for the team:**
- **Updated Layout Grids in 14 Page Views.** Replaced `lg:grid-cols-[15rem_minmax(0,1fr)]` with `lg:grid-cols-[19rem_minmax(0,1fr)]` across all desktop layout files.
- **Refined `DesktopNavigation` in `app/_components/app-navigation.tsx`.** Expanded container padding to `px-4.5`, increased island card spacing, and removed restrictive text truncation classes.
- **Verified Build.** Next.js production build completed cleanly with zero warnings or errors across all 27 routes.

**What to re-test:**
- View the home page on laptop screen width and confirm the sidebar is visibly wider;
- Verify "Progress Dashboard" displays completely on one line without trailing dots;
- Verify "Find Clinic & Hospital" displays completely without truncation;
- Navigate to MindGuide, Journal, Professional, Community, and Profile to confirm the sidebar maintains consistent width;
- Verify no em dashes or loose hyphens exist in the UI copy or documentation.

---

## 7 Oct 2026: Removal of Duplicate Level and XP Card from Mobile Drawer

Commit `9886839`. Removed the redundant Level 4, XP bar, and streak badge card from the mobile sidebar drawer to maximize vertical navigation space.

**Why.** The mobile top header already features the gamified Level 4 progress ring, streak counter, coins, and XP bar. Having this card duplicated inside the slide-over sidebar drawer was unnecessary and consumed significant vertical screen space. Removing it lets the navigation sections start immediately at the top of the drawer, making browsing faster and eliminating scrolling.

**What changed for users:**
- **Instant Access to Navigation.** Opening the mobile drawer immediately displays the navigation categories (**Main Page**, **Professional**, **Community**) right below the brand logo without an unnecessary level banner taking up screen height.
- **Clean and Spacious Mobile Experience.** More working features are instantly visible without requiring users to scroll downward.

**What changed for the team:**
- **Cleaned Up `app/_components/mobile-sidebar-drawer.tsx`.** Removed the duplicate progress card markup and purged the unused `Flame` icon import.
- **Verified Build.** Production build succeeded with zero errors across all 27 application routes.

**What to re-test:**
- Tap the green hamburger menu button on phone screen width;
- Confirm the drawer opens with the AROM logo at the top and the **Main Page** section starting immediately;
- Verify that the Level and XP card is gone from the drawer while remaining intact in the top page header;
- Verify no em dashes or loose hyphens exist in the UI copy or documentation.

---

## 7 Oct 2026: Wellness Icon Tiles and Island Navigation Redesign

Commit `3147e75`. Redesigned desktop sidebar and mobile navigation drawer into card-based wellness islands featuring dedicated icon tiles, enlarged 14px high-contrast typography, and active-first tool ordering.

**Why.** Users experienced difficulty scanning navigation on mobile devices due to small 12px text, monochromatic bare icons, and unreleased Coming Soon items placed right between working tools. Upgrading to distinct icon tiles, 14px typography, and active-first grouping makes navigation immediately legible and intuitive to browse.

**What changed for users:**
- **Dedicated Wellness Icon Tiles.** Every active tool now features a rounded tile with crisp mint borders and AROM brand green icons (`#1f6f5b`), turning solid emerald with a white icon when selected.
- **Enlarged 14px High-Contrast Typography.** Item labels are enlarged to 14px (`text-sm font-semibold`) with deep contrast text (`#14221f`), dramatically improving readability for both Khmer (Kantumruy Pro) and English.
- **Active-First Layout with Clean Separation.** Working features (Home, MindGuide, Detection, Progress) are grouped at the top of each category. Unreleased features (Quests, Shop, Friends) are neatly organized below a subtle hairline divider with quiet styling and Soon badges.
- **Card-Based Wellness Island Groups.** Categories (Main Page, Professional, Community) are enclosed in gentle off-white island cards (`bg-[#f8faf9]`) with an emerald dot indicator, making the page structure scannable in seconds.
- **Comfortable 46px Mobile Tap Targets.** Expanded touch areas ensure easy, comfortable tapping on mobile phone screens.

**What changed for the team:**
- **Updated `NAVIGATION_SECTIONS` in `app/_components/navigation-config.ts`.** Reordered Main Page items so working features precede unreleased items.
- **Upgraded `DesktopNavigation` in `app/_components/app-navigation.tsx`.** Implemented card-based island layout with icon tiles and active-first separation.
- **Upgraded `MobileSidebarDrawer` in `app/_components/mobile-sidebar-drawer.tsx`.** Applied matching island containers and icon tiles for seamless mobile responsiveness.
- **Verified Build.** Next.js production build succeeded with zero errors across all 27 routes.

**What to re-test:**
- Open the mobile navigation drawer on phone and confirm the card-based sections render cleanly;
- Verify the active tools (Home, MindGuide, Detection, Progress) appear first with 14px text and rounded icon tiles;
- Verify Coming Soon items appear below the divider line with quiet styling;
- Tap `Detection` and confirm the Track Your Mind dialog opens smoothly;
- Check the desktop sidebar on laptop screens to verify the matching card island layout;
- Verify no em dashes or loose hyphens exist in the UI copy or documentation.

---

## 7 Oct 2026: Reversion to Unified Detection Modal Navigation

Commit `16e4a0a`. Reverted sidebar and mobile drawer navigation to a single Detection item that launches the Track Your Mind modal, asking users to choose between Journal and Symptom Detection.

**Why.** Having separate Journal and Detection Symptoms items in the sidebar caused navigation ambiguity and mismatched active highlights when writing reflections. Reverting to the proven pattern where touching Detection opens the Track Your Mind dialog provides a clean, unified mental model with direct choices for Journal (Ready) and Symptom Detection (Coming Soon).

**What changed for users:**
- **Single Intuitive Detection Item in Navigation.** The sidebar under Main Page now features a single clean entry: `ពិនិត្យអារម្មណ៍ (Detection)` with the activity pulse icon. The duplicate Journal link has been removed.
- **Track Your Mind Choice Modal Restored.** Clicking or tapping `Detection` opens the dialog asking users to choose:
  - **Journal:** Ready to write daily reflections, directly linking to `/detection/journal`.
  - **Symptom Detection:** Clearly marked with a Coming Soon badge.
- **Accurate Active Highlighting in Journal.** While writing in `/detection/journal`, the Detection item in the sidebar remains active, accurately indicating the parent wellness area.
- **Direct Link Support.** Visiting `/detection` renders the platform cleanly and immediately presents the Track Your Mind dialog without flickering or navigation glitches.

**What changed for the team:**
- **Updated `NAVIGATION_SECTIONS` in `app/_components/navigation-config.ts`.** Removed the separate `journal` item and standardized `detection` with `enTitle: "Detection"` and `kmTitle: "ពិនិត្យអារម្មណ៍"`.
- **Enhanced `DetectionProvider` in `app/_components/detection-provider.tsx`.** Added automatic modal opening when visiting `/detection` and clean router redirection to `/` when dismissing the dialog.
- **Streamlined `app/detection/page.tsx`.** Simplified the detection route to render `AromMainView`, allowing the provider modal overlay to handle interaction seamlessly.
- **Updated `MobileSidebarDrawer` Active Logic.** Ensured `pathname.startsWith("/detection")` highlights the Detection item on mobile devices.
- **Verified Build.** Next.js production build check completed successfully across all 27 application routes.

**What to re-test:**
- Click `ពិនិត្យអារម្មណ៍ (Detection)` in the desktop sidebar and verify the Track Your Mind modal opens smoothly;
- Click `Journal` inside the modal and verify it navigates to `/detection/journal`;
- Verify that on `/detection/journal`, the Detection item in the sidebar remains highlighted;
- Open the mobile navigation drawer, tap `Detection`, and verify the drawer closes and the modal opens;
- Tap `Symptom Detection` in the modal and verify the Coming Soon notification appears;
- Verify no em dashes or loose hyphens exist in the UI copy or documentation.

---

## 7 Oct 2026: Resolution of Mixed Dark Sidebar and Complete Single Theme Unification

Commit `16e4a0a`. Complete audit and elimination of residual dark utility classes causing hybrid dark sidebar styling, restoring 100% unified calming light wellness theme.

**Why.** When dark mode was previously enabled, specific components received `dark:*` Tailwind utility classes. When the toggle button was removed, Tailwind CSS v4 fell back to its default `@media (prefers-color-scheme: dark)` system query. On devices with OS dark mode active, the desktop sidebar and header streak pill turned dark while the main page remained white. This created a jarring mixed appearance that needed a thorough audit and permanent resolution.

**What changed for users:**
- **100% Unified Light Wellness Theme.** The desktop sidebar, top gamified header, streak pill, and main content now share a single, harmonious light palette with soft borders (`#dcebe7`), crisp white backgrounds, and AROM emerald accents (`#1f6f5b`).
- **No Inconsistent Dark Panels.** The left sidebar and header streak pill will never switch to dark, regardless of whether the operating system or browser prefers dark mode.
- **Consistent 3-Category Navigation.** Main Page, Professional, and Community sections remain cleanly organized with Coming Soon badges and smooth navigation.

**What changed for the team:**
- **Purged All `dark:*` Utilities across Codebase.** Audited the repository with ripgrep to ensure zero lingering `dark:` prefixes in `DesktopNavigation`, `MobileNavigation`, `MobileSidebarDrawer`, `TopHeader`, `MindGuideHome`, `TherapistDirectory`, and `ProfileSettings`.
- **Automatic Client Storage Reset in `app/layout.tsx`.** Added a defensive initialization snippet in `<head>` to clear any legacy `localStorage['arom-theme']` keys or `.dark` class attributes from the user's browser.
- **Verified Full Production Build.** Successfully validated that all 27 Next.js static and dynamic routes compile cleanly with zero TypeScript or styling warnings.

**What to re-test:**
- Reload the browser at `http://localhost:3000` or `http://localhost:3000/detection`;
- Confirm the left desktop sidebar displays with a pure white background and soft emerald borders;
- Confirm the top header streak pill and XP bar display in clean white and light tones matching the rest of the page;
- Verify on systems with OS Dark Mode enabled that no elements turn dark;
- Confirm all 3 navigation categories (Main Page, Professional, Community) remain intact and functional.

---

## 7 Oct 2026: Dark and Light Mode Theme System and Toggle Buttons

Commit `pending`. Introduction of complete dark and light mode theme architecture with ThemeProvider, ThemeSwitcher, ThemeToggleButton, and ThemeModeSelectCards.

**Why.** Users seeking mental wellness and emotional rest frequently browse in low-light evening environments. Providing an accessible, eye-comforting dark mode with soothing emerald tones reduces visual strain and respects user sensory preferences.

**What changed for users:**
- **Dark and Light Mode Support.** Users can freely toggle between soothing Light Mode and night-comforting Dark Mode across the entire platform.
- **Top Header Quick Toggle.** A clean, responsive Sun/Moon button in the top header allows instant 1-tap switching between modes on both mobile and desktop with animated icon transitions.
- **In-Sidebar Segmented Theme Switcher.** Both the desktop sidebar footer and mobile drawer feature an intuitive segmented pill switcher: `ពន្លឺ (Light)` and `ងងឹត (Dark)`.
- **Profile and Settings Visual Cards.** The Settings and Profile page includes full visual theme cards with descriptive previews for Daytime Focus and Restful Night.
- **Subpage Header Integration.** The Dark and Light toggle button is now readily available on MindGuide and Professional directory mobile headers as well.
- **Sensory-Friendly Emerald Night Palette.** Dark mode uses calming deep emerald tones (`#0d1a16`, `#132620`, `#2bb996`) rather than harsh pitch black, preserving AROM's serene wellness identity.
- **Persistent Preference.** Theme choices automatically persist across sessions via local storage and respect system preferences by default.

**What changed for the team:**
- **Created `app/_components/theme-provider.tsx`.** Context provider managing theme state, HTML `.dark` class, `data-theme`, and local storage synchronization.
- **Created `app/_components/theme-toggle.tsx`.** Exports `ThemeToggleButton` (compact animated icon button), `ThemeSwitcher` (segmented pill slider), and `ThemeModeSelectCards` (visual preview selection cards).
- **Updated `app/index.css`.** Added dark mode CSS tokens, `@custom-variant dark`, and automatic dark surface color rules.
- **Updated `app/layout.tsx`.** Wrapped application body with `ThemeProvider`.
- **Integrated into `TopHeader`, `DesktopNavigation`, `MobileSidebarDrawer`, `ProfileSettings`, `MindGuideHome`, and `TherapistDirectory`.** Placed controls consistently across all key touchpoints.

**What to re-test:**
- Click the Sun/Moon button in the top header and verify the application switches smoothly between light and dark modes;
- Open the desktop sidebar or mobile drawer and test the segmented `ពន្លឺ (Light)` / `ងងឹត (Dark)` toggle;
- Visit `/profile` and test switching themes using the visual theme cards;
- Refresh the page and confirm the selected theme persists from localStorage;
- Check that text contrast remains clear and readable in both modes;
- Verify no em dashes or loose hyphens exist in the UI copy or documentation.

---

## 7 Oct 2026: Three-Category Sidebar Navigation Architecture

Commit `pending`. Restructuring of desktop sidebar and mobile navigation drawer into 3 categorized sections: Main Page, Professional, and Community.

**Why.** Users need a structured, intuitive mental model when navigating AROM. Grouping features into Main Page (daily wellness and personal tools), Professional (therapy and clinical services), and Community (peer support and social activities), while clearly indicating unreleased features with Coming Soon badges, provides clarity without broken links.

**What changed for users:**
- **Three Core Navigation Categories.** The sidebar navigation on both laptop and mobile is now organized into three distinct sections:
  - **ទំព័រចម្បង (Main Page):** Home Page, Quests (Coming Soon), Shop (Coming Soon), Friends (Coming Soon), MindGuide, Journal, Detection Symptoms, and Progress Dashboard.
  - **អ្នកជំនាញ (Professional):** Professional, Find Clinic & Hospital (Coming Soon), Booking History (Coming Soon), and Schedule Management (Coming Soon).
  - **សហគមន៍ (Community):** Community, and Play Cards with Friends (Coming Soon).
- **Graceful "Coming Soon" Indicators.** Planned features show a delicate mint pill badge with disabled cursor and tooltip explaining the feature is arriving soon, preventing dead clicks or broken routes.
- **Direct Section Anchoring.** Clicking Progress Dashboard scrolls directly to the interactive wellness progress card on the page.

**What changed for the team:**
- **Created `app/_components/navigation-config.ts`.** Centralized single source of truth for all 3 navigation sections, metadata, bilingual titles, and coming-soon status.
- **Updated `DesktopNavigation` in `app/_components/app-navigation.tsx`.** Adapted to render the 3 categorized sections with scrollable container and section headings.
- **Updated `MobileSidebarDrawer` in `app/_components/mobile-sidebar-drawer.tsx`.** Synchronized with `navigation-config.ts` so mobile users experience the exact same 3-section navigation.
- **Added anchor ID in `app/components/progress-dashboard.tsx`.** Added `id="progress-dashboard"` for smooth anchor navigation.

**What to re-test:**
- Check sidebar navigation on laptop to verify all 3 categories (Main Page, Professional, Community) render cleanly with section headings;
- Verify active links (Home, MindGuide, Journal, Detection, Progress Dashboard, Professional, Community) navigate correctly;
- Verify Coming Soon items (Quests, Shop, Friends, Find Clinic & Hospital, Booking History, Schedule Management, Play Cards) show the "Soon" badge and do not trigger broken routes;
- Open the mobile sidebar drawer and confirm the same 3 categories appear;
- Ensure no em dashes or loose hyphens exist in the documentation.

---

## 7 Oct 2026: Phone Gamified Header and Mobile Navigation Sidebar Drawer

Commit `pending`. Introduction of phone gamified header HUD matching screenshot design and responsive mobile navigation sidebar drawer.

**Why.** On mobile phones, users need immediate visibility into their personal wellness level and daily streaks, as well as an accessible slide-over sidebar drawer containing all existing navigation destinations. On laptop screens, the sidebar remains automatically open as designed.

**What changed for users:**
- **Gamified Phone Header in AROM Brand Green.** The mobile header now uses AROM's signature forest and mint green palette (`#1f6f5b`) for the circular progress arc, the central level number, the XP progress bar, and the hamburger menu button instead of purple, creating complete visual harmony with the platform.
- **Slide-over Mobile Sidebar Drawer in Native AROM Style.** Tapping the green hamburger button opens an accessible, smooth slide-out drawer matching `DesktopNavigation` directly: ទំព័រដើម (Home), មគ្គុទ្ទេសក៍ចិត្ត (MindGuide), ពិនិត្យអារម្មណ៍ (Detection), អ្នកជំនាញ (Professional), សហគមន៍ (Community), and ប្រវត្តិរូប និងការកំណត់ (Profile & Settings).
- **In-Drawer Progress & Quick Controls.** The drawer includes a serene wellness level overview with green progress indicators, a bilingual language switcher (Khmer and English), and an encouraging mindfulness reminder card matching the desktop sidebar card.
- **Laptop Auto-Open Sidebar Continuity.** On laptop and desktop screens, the desktop sidebar remains automatically open and fixed on the left side of the screen.

**What changed for the team:**
- **Created `app/_components/sidebar-provider.tsx`.** Context provider managing open, close, and toggle states with automatic route change listener and Escape key handling.
- **Created `app/_components/mobile-sidebar-drawer.tsx`.** Accessible drawer component animated with Motion, supporting bilingual labeling and existing navigation routes.
- **Updated `app/components/top-header.tsx`.** Re-architected top header to render the gamified mobile HUD and responsive desktop controls.
- **Updated `app/layout.tsx`.** Wrapped application body with `SidebarProvider` and mounted `MobileSidebarDrawer`.

**What to re-test:**
- Open the application on mobile screen width (e.g. 390px) and verify the Level 4 circular arc, progress bar, 54 / 100 XP, streak pill, coins pill, and purple hamburger menu button match the design;
- Tap the hamburger menu button and verify the sidebar drawer slides in smoothly from the left;
- Verify all navigation links in the drawer work and that tapping backdrop, close button, or pressing Escape closes the drawer;
- Resize to laptop screen width (e.g. 1024px or higher) and verify the desktop sidebar is automatically open and visible on the left;
- Verify no em dashes or loose hyphens exist in the UI copy or documentation.

---

## 7 Oct 2026: Three-Role RBAC System Architecture in AGENTS.md

Commit `95a1406`. Architectural standard defining user, professional (therapist), and administrator access boundaries.

**Why.** AROM serves three distinct groups with very different workflows: everyday seekers who need personal self-care, licensed therapists who manage clients and appointments, and administrators who oversee safety and verified credentials. Explicitly defining these roles in the project guidelines ensures all database schemas and UI permissions enforce strict access control.

**What changed for users:**
- **Dedicated Role Protection.** Seekers receive a clean wellness journey, therapists receive private client management, and administrators ensure clinical safety and therapist verification.

**What changed for the team:**
- **Defined 3 Core Roles in AGENTS.md.** Added `user`, `professional`, and `admin` to Section 1 and created Section 10.
- **Database Architecture Standard.** Mandates an explicit `user_role` enum and strict role-based Row Level Security (RLS) policies in Supabase.

**What to re-test:**
- Check Section 1 and Section 10 in `AGENTS.md` for role specifications;
- Verify no em dashes or loose hyphens exist in the documentation.

---

## 6 Oct 2026: Mandatory Pre-Work Git Sync Rule in AGENTS.md

Commit `d3e1252`. Documentation update establishing team collaboration workflow for multi-developer repository.

**Why.** Two developers actively collaborate on this project. Establishing a strict agent rule to verify git status and pull the latest changes before starting work guarantees that neither teammate's commits are accidentally overwritten, preventing costly merge conflicts.

**What changed for users:**
- **Smooth Team Development.** Features and bug fixes ship reliably without accidental regressions or overwritten updates.

**What changed for the team:**
- **Added Mandatory Git Pull Rule in AGENTS.md.** AI assistants and team members must verify `git status` and run `git pull origin main` prior to editing files or writing new code.

**What to re-test:**
- Check Section 5 in `AGENTS.md` and verify the new `Always Check Git and Pull First` rule is clearly listed;
- Ensure no em dashes or loose hyphens exist in the documentation.

---

## 6 Oct 2026: Supabase SDK Integration and Client Helper

Commit `4898d0c`. Integration of @supabase/supabase-js and @supabase/ssr with local environment configuration.

**Why.** Preparing the platform for real authentication and clinical grade database persistence. Establishing a standardized client helper allows features across the app to communicate with Supabase while strictly keeping credentials safe.

**What changed for users:**
- **Zero Disruption.** Existing pages continue functioning seamlessly while preparing the foundation for real user accounts and private data persistence.

**What changed for the team:**
- **Installed Supabase SDKs.** Added `@supabase/supabase-js` and `@supabase/ssr` to `package.json`.
- **Created `lib/supabase.ts`.** Provides a standard Supabase client singleton reading `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Configured `.env.local`.** Added project credentials locally (ignored by Git to ensure zero credential leakage).
- **Verified Build.** Next.js production build compiled 27 pages cleanly with zero errors.

**What to re-test:**
- Run `npm run build` and ensure Next.js builds successfully;
- Check that `.env.local` is ignored by Git and not tracked;
- Inspect `lib/supabase.ts` for clean environment variable resolution.

---

## 6 Oct 2026: Privacy, Security, and Repository Standards in AGENTS.md

Commit `79344a6`. Documentation update establishing mental health data confidentiality, Row Level Security requirements, and official repository links.

**Why.** AROM is an emotional wellness and mental health application dealing with sensitive personal reflections, vulnerability states, mood tracking, and therapist appointments. Explicitly mandating user privacy, Row Level Security (RLS), and credential hygiene in the core agent guidelines ensures that every AI and developer treats user data with strict clinical grade confidentiality.

**What changed for users:**
- **Guaranteed Privacy Protection.** All future database and API implementations must enforce strict isolation so no user can ever access another user's personal journals, mood records, or appointments.

**What changed for the team:**
- **Added Official Repository Link in AGENTS.md.** Recorded `https://github.com/rith369/Arom-version1` in Section 1.
- **Added Section 9 in AGENTS.md.** Established permanent rules for clinical grade confidentiality, strict Supabase Row Level Security (RLS), environment key segregation, data minimization, and zero unauthorized logging of vulnerable user reflections.

**What to re-test:**
- Open `AGENTS.md` and verify the repository link is present under Section 1;
- Verify that Section 9 contains all 5 privacy and security directives;
- Ensure no em dashes or loose hyphens are present in the documentation text.

---

## 6 Oct 2026: Bilingual Voice to Text (Speech Recognition) on Journal Reflection Page

Commit `fd306fd`. No database step: client-side Web Speech API integration in /detection/journal route.

**Why.** Typing long reflections on mobile or keyboard can feel exhausting when experiencing emotional overwhelm, burnout, or fatigue. Offering a real bilingual voice-to-text feature allows users to speak their thoughts naturally in either Khmer or English, making daily emotional journaling accessible, quick, and effortless.

**What changed for users:**

- **Top-Level Voice Language Selector.** An intuitive switch (`🇰🇭 ភាសាខ្មែរ (Khmer)` and `🇺🇸 English`) positioned directly at the top of the Guided Reflection Questions section, making language selection immediately visible and applicable for both individual questions and additional notes.
- **Natural Khmer Orthography (No Artificial Spaces).** Automatically collapses artificial token spaces emitted by the browser engine between adjacent Khmer words (`ថ្ងៃនេះខ្ញុំមានអារម្មណ៍...` instead of `ថ្ងៃ នេះ ខ្ញុំ មាន...`), producing fluent, continuous Khmer text.
- **Authentic Khmer Punctuation.** Converts Western periods (`.`) placed after Khmer sentences into the proper Khmer punctuation mark Khan (`។`).
- **Bilingual Spacing Preservation.** Smartly preserves standard spaces around English words and numbers when speaking bilingually.
- **Real-Time Speech-to-Text Transcription.** Speaking now streams words directly into the targeted reflection field in real time without stuttering or duplicating sentences.
- **Animated Audio Wave Visualizer.** When recording is active, a vibrant bouncing sound wave animation and pulsing indicator confirm that the microphone is actively listening.
- **Live Recording Duration Timer.** Displays minutes and seconds counter (`00:05`) during recording so users know how long they have been speaking.
- **Clear Microphone Guidance.** If microphone permissions are denied or if the browser lacks Web Speech API support, friendly bilingual alerts guide users on how to enable microphone access or use Google Chrome and Microsoft Edge.
- **Individual Question Voice Input.** Each guided reflection question card supports direct voice-to-text with its own microphone button and live listening timer.

**What changed for the team:**

- **Moved Voice Language Switcher Up.** Repositioned the language toggle to the Guided Reflection header so users do not have to scroll to the bottom before speaking into the top reflection questions.
- **Added `formatSpeechTranscript` Post-Processor.** Automatically formats raw Speech Recognition output to match authentic Khmer continuous orthography without breaking English spacing.
- **Fixed Interim Transcription Accumulation.** Completely resolved interim transcription repetition by tracking final results separately from interim speech tokens.
- **Preserved Existing Draft Text.** Speech transcription smoothly appends to existing text rather than overwriting previous reflections.
- **Strict Anti-AI Typography Compliance.** Copy, labels, and notices follow strict anti-AI punctuation standards with Khmer terms followed by English in parentheses, without em dashes or generic stars.

**What to re-test:**

- Open `http://localhost:3000/detection/journal` in Google Chrome or Microsoft Edge;
- Look at the top of the Guided Reflection Questions section;
- Notice the `ភាសានិយាយ (Voice):` selector with `🇰🇭 ភាសាខ្មែរ (Khmer)` and `🇺🇸 English`;
- Click `🇰🇭 ភាសាខ្មែរ (Khmer)` and click `កត់ត្រាជាសំឡេង (Record with Voice)`;
- Allow microphone permissions when prompted by the browser;
- Speak a sentence in Khmer (for example: "ខ្ញុំមានអារម្មណ៍ធូរស្រាល និងស្ងប់ចិត្តជាងមុន");
- Verify that the Khmer words transcribe into the text box and the animated wave bars bounce;
- Click `បញ្ឈប់ការថតសំឡេង (Stop)` and verify the recording stops cleanly;
- Switch to `🇺🇸 English`, click `Record with voice`, speak in English, and verify English speech transcribes cleanly;
- Click the microphone icon on any individual guided question and verify voice input updates that specific question.

---

## 5 Oct 2026: Gamified Home Page Design Sample in /preview Sandbox

Commit `b518b1e`. No database step: client-side gamified wellness exploration inside /preview route.

**Why.** Gamification can dramatically boost daily mindfulness consistency when done with emotional depth and visual beauty (like Forest and Fabulous). This design introduces game loops, leveling, daily quests, and living visual progression without compromising mental health dignity. The experience is fully contained inside `/preview`, preserving working production code completely intact.

**What changed for users:**

- **Player Status HUD.** Top status bar showing Player Crest (`កម្រិត ៦: Mindful Guardian`), glowing live XP progress bar (`420 / 500 XP`), Flame Streak shield (`🔥 14 Days`), and Crystals (`💎 275`).
- **Living Bonsai Lotus Sanctuary.** A glowing digital Bonsai plant that blooms new lotus flowers and radiates golden spores as users complete daily self-care actions.
- **Carved Daily Quests Board.** 3 interactive daily quest cards with reward pills (+20 XP, +35 XP) and one-click completion: Mood Check-in, 4-7-8 Breathing, and Gratitude Journal.
- **Floating XP Toast Animations.** Completing any quest triggers dynamic floating reward toasts with gem audio-visual cues and smooth level progress increases.
- **Unlockable Mystery Wellness Chest.** When 3/3 daily quests are completed, an ornate golden emerald chest unlocks with a celebratory reward modal awarding a Golden Lotus Seed and +100 XP.
- **Design Switcher.** Seamlessly toggle between `🎮 គំរូហ្គេម (Gamified)` and `🌿 គំរូស្ងប់ស្ងាត់ (Editorial)` at the top bar.

**What changed for the team:**

- **Production safety.** Zero changes to production `app/page.tsx` or production routes.
- **Gamification benchmark.** Provides a working reference implementation of XP calculations, quest completion state, and milestone rewards.

**What to re-test:**

- Open `http://localhost:3000/preview` in your browser;
- Verify that the Gamified Sanctuary Home view loads by default;
- Observe the top HUD: Level 6, XP bar at 420/500, 14-day streak, and 275 gems;
- Observe the living Bonsai tree in the center with 1 bloomed lotus;
- Tap "Start (+35)" on Quest 2 (4-7-8 Breathing): verify the button toggles to "✓ Done", XP increases to 455, gems increase to 280, a second lotus blooms on the tree, and a floating XP toast appears;
- Tap "Write (+20)" on Quest 3 (Gratitude Journal): verify the third lotus blooms and the Mystery Chest triggers an unlock pulse;
- Tap "OPEN CHEST": verify the celebration modal opens awarding the Golden Lotus Seed and +100 bonus XP;
- Tap `🌿 គំរូស្ងប់ស្ងាត់ (Editorial)` to compare with the minimalist calm layout;
- Tap the language toggle `🇰🇭 ខ្មែរ / 🇺🇸 EN` to verify bilingual labels.

---

## 5 Oct 2026: Serene Editorial Home Page Sample Design in /preview Sandbox

Commit `5b18b2c`. No database step: self-contained visual exploration of the Home page in /preview route.

**Why.** Gamified or cartoonish elements can feel out of place for serious mental health and emotional well-being. A mental wellness home page should feel like entering a peaceful sanctuary: uncluttered, grounded, breathable, and deeply comforting. To help the team evaluate a modern, editorial aesthetic inspired by top wellness apps like Calm and Headspace, an interactive Home page redesign sample was created inside `/preview` with zero risk to working production code.

**What changed for users:**

- **Calm, editorial visual identity.** In `/preview`, users can explore a refined Home page design featuring soft organic cream (`#faf9f6`), deep forest green (`#1b4332`), and gentle sage tones.
- **Interactive Mood Check-in Pebbles.** 5 organic glowing pebbles (`ស្ងប់សុខ (Calm)`, `រីករាយ (Joyful)`, `មានលំនឹង (Balanced)`, `ថប់បារម្ភ (Anxious)`, `ហត់នឿយ (Tired)`) with dynamic clinical empathy responses based on the selected emotion.
- **Morning Clarity Reset with Live Breathing Simulator.** A central hero card with an animated breathing circle displaying real-time phases (`Inhale`, `Hold`, `Exhale`), a 4-minute session timer, play/pause controls, and ambient soundscapes (`Rain`, `Forest`, `Bell`).
- **Bento Grid of Daily Practices.** Clean cards for 4-7-8 Breathing with minimalist line art, Sleep Meditation with soft moon icon, and an interactive Daily Reflection Journal prompt with save action.
- **Weekly Emotional Rhythm Wave.** A clean SVG mood wave showing 7-day emotional stability (`76% មានលំនឹងល្អ`) with MindGuide clinical commentary.
- **Screen Switcher in Control Bar.** Instantly switch between `🏠 គំរូទំព័រដើម (Home Sample)` and `👥 សហគមន៍ (Community)` to explore both redesigns.

**What changed for the team:**

- **Production safety.** All changes are confined to `app/preview/page.tsx`, leaving `app/page.tsx` and all production components untouched.
- **Clear aesthetic benchmark.** Provides a high-fidelity visual and interactive reference point for the future evolution of the main home screen.

**What to re-test:**

- Open `http://localhost:3000/preview` in your browser;
- Verify that the new Home Page sample renders by default;
- Tap each of the 5 mood pebbles (`ស្ងប់សុខ`, `រីករាយ`, `មានលំនឹង`, `ថប់បារម្ភ`, `ហត់នឿយ`) and observe the dynamic empathy response text update;
- Tap "ចាប់ផ្តើមហាត់ (Start Session)" on the Morning Clarity Reset card: verify the breathing circle smoothly animates between Inhale, Hold, and Exhale phases;
- Tap soundscape pills ("ទឹកភ្លៀង", "ព្រៃព្រឹក្សា", "កណ្តឹងសតិ") to switch ambient focus;
- In the Daily Reflection prompt, type a short thought and tap "កត់ត្រា (Save)" to see the "✓ បានរក្សាទុក" confirmation badge;
- Verify the Weekly Emotional Rhythm curve renders smoothly;
- Tap the language toggle `🇰🇭 ខ្មែរ / 🇺🇸 EN` to verify bilingual labels across the entire page;
- Tap "👥 សហគមន៍ (Community)" in the top bar to switch to the community view, or click "← ត្រឡប់ទៅកម្មវិធីពិត" to return to production.

---

## 5 Oct 2026: Refined Duolingo Concept (Stepping-Stone Path, Aromi Mascot, Community Kindness Garden)

Commit `e98d505`. No database step: visual and interaction refinement inside isolated /preview sandbox.

**Why.** Copying Duolingo directly (neon lime green, aggressive fire streaks, owl) does not fit AROM's gentle mental wellness identity. Instead, we adapted the core concepts of Duolingo (the winding stepping-stone roadmap, bite-sized daily micro-actions, an empathetic botanical mascot, tactile 3D cards, and positive reinforcement) into AROM's soothing botanical green, cream, and terracotta design system.

**What changed for users:**

- **Winding Stepping-Stones Path (ផ្លូវសតិសហគមន៍).** Instead of a generic card list or a Duolingo clone, users navigate an organic curved S-path with 5 tactile stepping-stone nodes for peer circles and daily calm milestones.
- **Empathetic Mascot "Aromi" (អារម្មណ៍តូច).** Replaced the owl with an adorable, gentle blooming sprout companion who waves and speaks in friendly speech balloons beside active support circles.
- **Soothing Wellness Counters.** Replaced intense flame streaks and gems with gentle Mindfulness Streaks (`🌿 15 ថ្ងៃ`), Kindness Drops (`💧 24 តំណក់`), and Heart Blooms (`🌸 10 ផ្កា`).
- **Interactive Cheer Drop (Node 3).** Tap the sky-blue water droplet stone to send supportive cheer to a peer, awarding +5 Kindness Drops and a celebratory toast notification.
- **Community Kindness Garden.** Transformed Duolingo's competitive league/quest model into a collective wellness garden where peers water the garden together (82% bloomed) with a tactile "💧 ស្រោចទឹក (+5)" action.
- **Serene Tactile 3D Styling.** Chunky pushable buttons and speech bubbles rendered in AROM's deep forest green (`#245242`), sage mint, and warm terracotta instead of neon green.

**What changed for the team:**

- **Authentic brand alignment.** The sandbox now demonstrates how to translate gamification concepts into mental wellness without sacrificing clinical warmth, psychological safety, or brand identity.

**What to re-test:**

- Open `http://localhost:3000/preview` in your browser;
- Verify the winding green journey line connecting the 5 stepping-stone nodes;
- Check Node 1 (Check-in complete with checkmark);
- Observe Node 2: verify Aromi the sprout mascot waving next to the active Stress & Burnout Circle with an "Enter Chat" speech balloon;
- Click on Node 3 ("ផ្ញើតំណក់លើកទឹកចិត្ត ១"): verify the water droplet button animates, drops count increases to 29 💧, and a floating green toast appears;
- Scroll down to "Community Kindness Garden" and tap "💧 ស្រោចទឹក (+5)": verify the bloom bar animates and kindness drops increase;
- Tap "Enter Chat" or the active circle node to test the bubbly chat view with reaction pills (`💧`, `🌱`, `❤️`, `🙏`);
- Tap `🌿 Calm Sanctuary` at the top to toggle between both designs seamlessly.

---

## 5 Oct 2026: Duolingo-Style Gamified Community Design Sample in /preview Sandbox

Commit `186c702`. No database step: client-side visual exploration inside isolated sandbox route.

**Why.** Mental health and emotional peer support can sometimes feel intimidating or clinical. Exploring a playful, encouraging gamification model inspired by Duolingo (streaks, gem rewards, uplifting mascots, daily quests, and cheer leaderboards) offers a fun and low-pressure alternative for community connection. To protect all working production code, this entire interactive design experience was implemented inside the `/preview` sandbox route with a toggle switch, allowing the team and users to compare the Duolingo style side-by-side with the calm sanctuary design without risking any production changes.

**What changed for users:**

- **Duolingo-style wellness community experience.** In `/preview`, users can explore a gamified community interface featuring flame streaks (`🔥 37`), gem tokens (`💎 300`), and compassion hearts (`💖 5`).
- **Interactive wellness mascot and tactile 3D buttons.** Includes a friendly leafy wellness companion SVG, bouncy progress indicators, and Duolingo signature tactile 3D pushable buttons (`START CHAT`).
- **Daily Community Quests.** An interactive quest card where users can complete daily micro-actions (Mood Check-in, Explore Peer Circles, Send 1 Supportive Cheer) and earn gem rewards (+15 💎) with responsive feedback.
- **Weekly Cheers Leaderboard.** Displays community supporters with gold, silver, and bronze ranks along with current peer ranking.
- **Playful group chat stream.** High-contrast bubbly chat bubbles with support reactions (`❤️ លើកទឹកចិត្ត`, `👏 អស្ចារ្យ`, `🌱 រីកចម្រើន`) and real-time message sending that awards +5 gems.
- **Instant style toggle.** Switch between `🦉 Duolingo Style` and `🌿 Calm Sanctuary` with a single tap in the top control bar.

**What changed for the team:**

- **Zero production risk.** Main routes (`app/community/`, `app/page.tsx`, etc.) remain completely untouched.
- **Side-by-side visual evaluation.** Product managers, designers, and developers can test both design paradigms on live desktop and mobile frame viewports in real time.

**What to re-test:**

- Visit `http://localhost:3000/preview` in your browser;
- Verify that the default view loads with `🦉 Duolingo Style` selected;
- Check the top header stats: verify streak flame (`🔥 37`), gem counter (`💎 300`), and heart counter (`💖 5`);
- Under "Daily Community Quests", tap on the quest "ផ្ញើពាក្យលើកទឹកចិត្ត ១ (Send 1 Cheer)": verify the checkmark animates and gem count increases to 315 💎;
- Tap the 3D green button "ចូលជជែកក្នុងក្រុម (START CHAT)" or click "Chat" in the top bar to open the chat stream;
- Type a message in the input box and tap Send: verify the message appears as a green chat bubble and adds +5 gems;
- Tap quick cheer pills (`❤️ លើកទឹកចិត្ត`, `👏 អស្ចារ្យ`, `🌱 រីកចម្រើន`) below messages;
- Tap `🌿 Calm Sanctuary` in the top switcher to instantly switch back to the botanical calm design;
- Tap the language toggle `🇰🇭 ខ្មែរ / 🇺🇸 EN` to verify bilingual labels in both modes;
- Click "← ត្រឡប់ទៅកម្មវិធីពិត" to navigate back to `/community`.

---

## 4 Oct 2026: Isolated Design Sandbox Route (/preview) for Risk-Free Redesign Exploration

Commit `59aca02`. No database step: completely isolated design environment with zero impact on production screens.

**Why.** When exploring new aesthetic directions (such as a calmer, prettier sanctuary design for the Community module), editing production files directly risks breaking working features, component bindings, or stored state. This new `/preview` route provides a self-contained, interactive design sandbox where new visuals, organic card shapes, color palettes, and micro-interactions can be freely tested and reviewed live in the browser without touching any production code.

**What changed for users:**

- **Dedicated design preview playground.** Visiting `/preview` provides a live, interactive environment displaying the proposed calm redesign for AROM Community.
- **Interactive Sanctuary Overview.** Features an organic soft sage arch header, reassuring anonymous security pills, an active circle card with mentor credentials, and botanical upcoming activity cards.
- **Interactive Circle Chat Hub.** Test the proposed peaceful group conversation interface with pinned kindness guidelines, distinct speech bubbles for peers and verified mentors, and a working message input bar.
- **Top Sandbox Control Bar.** Effortlessly toggle between Overview and Chat views, switch between English and Khmer, toggle mobile device frame mode, or return to the live app with a single click.

**What changed for the team:**

- **Zero-risk design iteration.** The team and vibe coders can experiment with CSS, typography, and component structures in `app/preview/page.tsx` without modifying `app/community/`, `app/page.tsx`, or any working features.
- **Client-side interactive sandbox.** Includes self-contained state for joining activity circles and sending test messages in real time.

**What to re-test:**

- Visit `http://localhost:3000/preview` in your browser;
- Click "ទិដ្ឋភាពទូទៅ (Overview)" and "ការសន្ទនាក្រុម (Chat)" in the top control bar to switch views;
- In Overview, tap "ចូលរួម (Join)" on any of the upcoming mindful circles to see the state toggle to "បានចូលរួម ✓";
- Tap "ចូលរង្វង់ (Enter Circle)" on the active support card to seamlessly transition into the Circle Chat;
- In Circle Chat, type a test message in the floating input bar and tap Send: verify your message renders with your avatar and timestamp;
- Tap the language toggle `🇰🇭 ខ្មែរ / 🇺🇸 EN` to verify bilingual labels;
- Click "← ត្រឡប់ទៅកម្មវិធីពិត" to return to the live application.

---

## 3 Oct 2026: Comprehensive Natural Khmer Localization, Anti-AI Typography, and Icon Standards

Commit `6eca0fd`. No database step: state is stored in memory and browser local storage.

**Why.** The initial Khmer translations in the app felt robotic, stiff, and machine-translated. Furthermore, generic 4-pointed star sparkles and loose hyphens made the application feel like a generic AI template. This update rewrote all user-facing copy across every screen into authentic, warm, and clinical Khmer, established strict anti-AI typography rules (natural Khmer first, English in parentheses), and replaced all generic AI icons with calming, clinical wellness symbols.

**What changed for users:**

- **Authentic, natural Khmer across every screen.** Content across Home, Profile Settings, MindGuide, Practice Exercises, Learning Modules, Emotion Detection & Reflection Journal, Therapist Directory & Booking, and Community now reads like it was written by an empathetic Cambodian mental health counselor.
- **Clear bilingual phrasing.** Important terms now show the natural Khmer term first followed by the English equivalent in parentheses, such as `ភាពតានតឹង (Burnout)`, `ការថប់បារម្ភ (Anxiety)`, `ដំណេក (Sleep)`, `ការតាមដានរោគសញ្ញា (Symptom Detection)`, and `អនឡាញ (Online)`.
- **No robotic AI punctuation.** Completely removed em dashes and loose hyphens from titles, descriptions, and labels across the entire interface.
- **Clinical, calming wellness icons.** Replaced all 4-pointed star AI symbols with human-centered wellness icons including `Compass`, `Lightbulb`, `UserCheck`, `CalendarCheck`, `MaskIcon`, and `ShieldCheckIcon`.
- **Complete therapist booking flow in Khmer.** Booking dates now render with natural Khmer weekdays (ច័ន្ទ, អង្គារ, ពុធ) and months, with clear session types (`អនឡាញ (Online)` and `ជួបផ្ទាល់ (In Person)`). Replaced missing fallback dashes with reassuring labels.
- **Authentic community experience.** Support groups now feature Khmer discussion titles, safety guideline checklists, mentor credentials, and active group chat streams in Khmer.

**What changed for the team:**

- **Centralized language getters in `lib/therapists.ts` and `lib/booking.ts`.** All therapist names, roles, bios, and booking time slots now have typed helper functions (`getTherapistName`, `getTherapistRole`, `getSpecialtyLabel`, `getMeetingTypeLabel`, `getPeriodLabel`), making it easy to add new practitioners without touching UI templates.
- **Strict rules added to `AGENTS.md`.** Rule 6 (no em dashes or loose hyphens) and Rule 7 (no sparkles icons) prevent future AI assists from re-introducing robotic copy or generic star icons.
- **Verified zero TypeScript compiler errors.** `npx tsc --noEmit` runs completely clean across all 49 modified files.

**What to re-test:**

- Switch language to Khmer using the top language toggle: verify all navigation, headings, and cards switch to natural Khmer;
- Open `/detection/journal`: check that moods and question chips show natural Khmer with English in parentheses, like `ស្ងប់ចិត្ត (Calm)` and `ភាពតានតឹង (Burnout)`;
- Open `/professional`: check the therapist directory filters, click on Dr. Sopheap Chan, and tap "Book Appointment" to walk through the 3-step booking flow;
- On the booking review screen, verify the sidebar summary shows the therapist details with no missing values or stray dashes;
- Open `/community`: verify group titles show authentic Khmer, enter a group hub, check the guidelines card, and switch between Chat, Activities, and Members tabs;
- Send a chat message or attach a test file in the group hub: verify the message appears with the sender badge and time.

---

## 3 Oct 2026: Guided Question-by-Question Reflections with Voice Input

Commit `2fcd76f`. No database step.

**Why.** The original journal reflection screen only offered a single unstructured text box, which made users feel lost or intimidated when writing about their feelings. Adding guided, question-by-question reflection prompts with voice dictation helps users unpack their emotions gently and easily.

**What changed for users:**

- **Step-by-step guided questions.** Users can reflect on their feelings through structured prompts with the ability to add preset wellness questions.
- **Voice recording support.** Tap the microphone button to dictate journal thoughts directly instead of typing everything by hand.
- **Saved reflection summary.** Upon finishing, users see today's mood breakdown and reflection summary immediately.
- **Reflection history.** Users can review past reflections and review emotional insights over time.

**What changed for the team:**

- Componentized reflection states in `app/detection/journal/page.tsx` with clear steps (Entry form, Saved view, History log).

**What to re-test:**

- Visit `/detection/journal`, select a mood like `ស្ងប់ចិត្ត (Calm)`, answer the prompt questions, and press Save Reflection;
- Test the microphone voice button on prompts and the general note textarea;
- Check the History tab to verify past reflections appear in chronological order.

---

## 3 Oct 2026: Interactive Home Progress Section and Community Header Harmonization

Commit `62a63bf`. No database step.

**Why.** The home screen needed an immediate sense of weekly emotional momentum, while the community screen header needed to feel visually consistent with the rest of the app.

**What changed for users:**

- **Weekly mood timeline.** Users can inspect their emotional progression across the week on the home screen.
- **Consistent header.** The community screen now uses the unified brand header matching the rest of the application.

**What changed for the team:**

- Harmonized header components across features to reduce duplicate layout code.

**What to re-test:**

- Open Home (`/`) and tap different days in the weekly mood progress bar to inspect notes and mood ratings;
- Navigate to `/community` and confirm the top header aligns with the Home and MindGuide screens.

---

## 3 Oct 2026: Figma-Accurate Mood Icons and Clinical Wellness Labels

Commit `57e0a15`. No database step.

**Why.** Raw text emojis and generic AI star badges looked cheap and unpolished in the journal summary card.

**What changed for users:**

- **Custom Figma mood illustrations.** Journal summaries now feature custom illustrations instead of generic phone emojis.
- **Calming clinical labels.** Reassuring wellness terms replace robotic diagnostic language.

**What changed for the team:**

- Integrated Figma icon assets into the mood detection components.

**What to re-test:**

- Complete a journal entry and verify the mood icon rendered on the reflection card matches the Figma design system.

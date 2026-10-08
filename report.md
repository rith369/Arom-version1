# AROM: Change Report

A plain-language log of what changed in the app, written for the team rather than for developers. Newest entries first.

- **This file** = what changed, why, and what you need to know or re-test.
- **AGENTS.md** = the technical context file the AI coding assistant reads. Different audience, much more detail. You do not need to read it.

Each entry lists the commit it landed in, so you can match it to a version of the site.

## 8 Oct 2026: Admin Overview with Live Data, Needs Attention Queue and Sign Up Graph

Commit pending. No migration. Uses `admin_stats()` and existing tables. New dependency: `recharts`.

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

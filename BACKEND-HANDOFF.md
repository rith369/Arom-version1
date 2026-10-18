# AROM: Frontend to Backend Handoff

This file is how frontend work is handed to backend work. The frontend builds each feature with mock data first. This file then says exactly what the backend needs to provide so the mock data can be swapped for real data.

**Readers:** Hok Chheng (backend) and his AI coding assistant. Kept up to date by Rith (frontend).

**AI assistants:** read this whole file before writing backend code for any feature listed here. Treat the "Decided" rules as fixed. If something here conflicts with the code on `main`, ask Rith before changing the frontend.

## 1. How to use this file

1. Check the **Status board** (section 4) for features marked "Waiting for backend".
2. Open that feature's section. It lists the data shape the page expects, each frontend action, and the endpoint and database change it needs.
3. When a feature is connected, change its status to "Connected", note the commit, and delete the mock data it no longer uses.
4. Frontend adds a new section here every time a new page is built on mock data, in the same commit as the page.

## 2. Rules that apply to every feature

These come from `AGENTS.md` sections 9 and 10. They are not optional.

- **Server checks every permission.** Every admin endpoint starts with `requireRole("admin")` from `lib/controllers/role-controller.ts`. Never trust a role sent by the browser.
- **RLS on every table.** Users can only read and change their own rows. Admin access goes through role checked policies or `security definer` functions.
- **No private content in admin responses.** Admins see counts only, never journal text, mood entries, detection answers or session notes. One exception: admins may read support group chats for safety (section 23). Every opening of a chat writes an audit log entry, and members are told in the group guidelines.
- **Audit log** (`admin_audit_log`) for every role change, suspension, approval and rejection.
- **No service role key in browser code.** If a feature needs it (for example reading emails from `auth.users`), it stays in a server handler.
- **Data minimization.** Only return the fields the page actually shows.

## 3. How the mock data is wired (admin area)

```
app/admin/_data/<feature>.ts            types + mock records
        ↓
app/admin/_components/admin-provider.tsx  state + action functions (useAdmin)
        ↓
app/admin/_components/<feature>-view.tsx  the page, reads useAdmin() only
```

To connect a feature, **change the provider only**: load the list from the API instead of `initial<Feature>`, and make each action function call its endpoint, then refresh or update state. Keep the TypeScript types in `_data/*.ts` as the contract. Map database `snake_case` to these `camelCase` fields in the controller, the way `listUsers` already does. The pages should not need to change.

The yellow "Demo data on this page" banner is in `admin-shell.tsx`. Remove it for a page once that page uses real data.

## 4. Status board

| Feature | Frontend | Backend | Section |
|---|---|---|---|
| Admin overview (dashboard) | Done | Connected (`/api/admin/overview`) | none |
| Admin users: list, details, roles, suspend | Done | Connected (`GET /api/admin/users`, `PATCH .../role`, `PATCH .../status`), migration `20261014000600` | 5 |
| Admin professionals: review and moderation | Done | Connected, including profile change review. Stored `source` column still open (derived for now). Migrations `20261014000200`, `20261014000400` | 6 |
| Become a professional (user applies) | Done | Connected (`/api/professional/application`), migration `20261014000100` | 8 |
| Professional area `/pro`: shell, home, my profile with preview, login entry | Done | Connected (`/api/pro/me`, `/api/pro/profile`, `/api/pro/photo`), migration `20261014000400` | 16 |
| Professional schedule (`/pro/schedule`) | Done | Connected (`/api/pro/schedule`, open times in `availability_slots`), migration `20261014000400` | 16 |
| Professional bookings (`/pro/bookings`) | Done | Connected: list, cancel, reschedule, outcome, session notes, meeting link (`/api/pro/bookings/:id`), migration `20261014000400` | 16 |
| Professional clients (`/pro/clients`, client file) | Done | Connected: list from real bookings, archive (closes the conversation), summary notes, real shared survey and symptom checks (`/api/pro/clients/:id`), migration `20261015000300` | 16 |
| Public directory and booking (`/professional`, `/professional/<slug>`, `/professional/<slug>/book`) | Done | Connected: only listed professionals, real open times, instant booking (`/api/bookings`), migration `20261014000400` | 16 |
| Address for in person sessions (My profile, public profile, booking, My appointments) | Done | Connected, migration `20261015001600` | 25 |
| Client changes the time of a session (My appointments, Change time) | Done | Connected, migration `20261015001500` | 24 |
| My appointments for users (`/appointments`) | Done | Connected (`GET /api/appointments`, `POST /api/appointments/:id` with `cancel` or `sharing`). No migration | 21 |
| Messages between client and professional (text and voice): `/pro/messages`, `/messages` | Done | Connected (`/api/messages`, `/api/pro/messages`, `/api/voice/:id`), archive saved (`/api/pro/clients/:id`), migration `20261014000700`. Suggestion messages and quick replies connected in section 19 | 17 |
| Care plan: professional gives tasks, client sees them in Your Plan For Today (`/pro/clients/<id>`, `/care-plan`, home) | Done | Connected (`/api/care-plan`, `/api/pro/care`), migration `20261015000100` | 18 |
| Sessions: meeting links and Join, after session steps, suggest next session, repeating series, quick replies | Done | Connected (`/api/pro/suggestions`, `/api/suggestions/:id/accept`, `/api/pro/quick-replies`), migration `20261015000200` | 19 |
| Prepare view (`/pro/bookings/<id>`) and week calendar in My bookings | Done | Connected, including the prep plan note (`session_prep_notes`), migration `20261015000300` | 16 |
| Professional Home dashboard (once the profile is complete) | Done | Connected (counts from real bookings and schedule). "Listed" comes from the database | 16 |
| Professional podcasts: `/pro/podcasts`, episodes on the public profile and podcast page | Done on mock data | Waiting for backend | 20 |
| Admin MindGuide: lessons, tips and practices with drafts, versions, publish and checks (`/admin/mindguide`, editor at `/admin/mindguide/<type>/<sourceId>`) | Done | Connected for admins (`GET\|POST /api/admin/content`), migration `20261017000700`. User screens still read the code (see section 9) | 9 |
| Report a problem (users) and admin Reports page (`/admin/reports`) | Done | Connected (`POST /api/content-reports`, `GET /api/admin/content-reports`, `POST .../resolve`), migration `20261017000400` | 10 |
| Announcements: admin Settings section, banner at the top of every user page | Done | Connected (`GET /api/announcements/current`, `GET\|POST /api/admin/announcements`, `POST .../:id/end`), migration `20261017000300` | 15 |
| Crash tracking: error screens catch crashes, admin Overview card "Most frequent crashes, last 7 days" | Done | Connected (`POST /api/crash-reports`, `GET /api/admin/crashes?days=7`), migration `20261017000600` | 14 |
| Crisis helplines and support contact: admin Settings, user "Get help now" in Profile and Settings | Done | Connected: helplines (`/api/crisis-resources`, `/api/admin/crisis-resources`, migration `20261014000300`) and support contact (returned with the helplines; `GET\|PUT /api/admin/support-contact`, migration `20261017000200`) | 13 |
| Admin bookings chart and table, emergency cancel (`/admin/bookings`) | Done | Connected (`GET /api/admin/bookings`, `POST /api/admin/bookings/:id/cancel`), migration `20261017000100`. The client is never shown | 12 |
| MindGuide podcasts: user pages `/podcasts` and `/podcasts/<id>`, admin Podcasts tab | Done on mock data | Waiting for backend | 11 |
| Community: professionals and admins create groups, admins read chats and shut groups down, users report a person, image, message or group (`/community`, `/admin/community`) | Done | Partly connected: group list and create, join, chat read and send (`/api/community/groups`, `/:id/join`, `/:id/messages`), migrations `20261016000000` to `20261016000700`. Moderation connected: admin groups list, create, edit, shut down, reopen, member reports, remove message or person (`/api/admin/community/*`, `POST /api/community/reports`), migration `20261017000500`. Group activities still sample data | 23 |
| Mood check in and Your Progress on Home (`/`, journal starts from today's mood) | Done | Connected (`POST /api/mood-checkins`, `GET /api/progress`), migration `20261015000400` | 22 |
| Progress pages (`/progress`, `/progress/details`, from Figma): trend, bars, distribution, today's check in | Done | Connected for every range (`GET /api/progress?range=7d\|30d\|90d`). Insights worked out in the browser from the same real check ins | 22 |
| Progress Activities tab (practices done, lessons read, journal entries) | Done | Connected (`POST /api/activities`, `GET /api/progress/activities?range=`), migration `20261016001000` | 22 |
| Share mood check ins with my professional (My appointments switch, client file card) | Done | Connected (`appointments.share_mood_trend`, `shared_mood_checkins()`, `GET /api/pro/clients/:id` returns `moods`), migration `20261016001000` | 22 |
| Journal (Write about today, `/detection/journal`) | Done | Connected (`GET\|POST /api/journal`, `DELETE /api/journal/:id`, owner only). Entries an older version saved in the browser are moved only if the person agrees, migration `20261016001000` | 22 |
| Edit Profile for users: photo, display name, pronouns, About you (`/profile`) | Done | Connected (`/api/profile`, `/api/profile/photo`, private `user-profile-photos` bucket), migration `20261016000900`. Accounts without a profile row fixed by `20261016000800` | none |
| Admin audit log (`/admin/audit-log`) | Done | Connected (`GET /api/admin/audit-log`). No migration | 5 |
| Journal prompts: admin page `/admin/journal-prompts`, guided questions on Write about today (`/detection/journal`) | Done | Connected (`GET /api/journal-prompts`, `GET\|PUT /api/admin/journal-prompts`), migration `20261016001200` | 26 |
| Your Plan For Today as a to do list: own tasks, ideas, MindGuide items, repeat, tick with a line through (Home) | Done | Connected, PR #17 (`/api/plan`, `/api/plan/tasks`, `/api/plan/tasks/:id`, `/api/plan/tasks/:id/check`, `/api/plan/order`), migration `20261016001300` | 27 |
| Play with friends (`/play-cards`): a game hub with Mental health cards, Truth or dare and Guess the animal, one phone passed around | Done | No backend needed (cards in code, nothing saved). Later: admin managed decks, a play count in Progress, online rooms | 28 |
| Other admin pages | Bookings and Settings are connected (sections 12, 13, 15). Group activities in admin Community still sample data | Not started for group activities | 23 |
| Anonymous identity protection: professionals see client aliases, safe functions for bookings, messages, notes, suggestions, care plans and shared data | No UI change | Connected (Sokheng, merged with main in PR #19, 18 Oct). Intake note fix `20261018070000` still to run | 29 |

## 5. Admin users page

**Connected (14 Oct 2026), migration `20261014000600_admin_users_open_times.sql`:**

- `GET /api/admin/users` calls `admin_list_users()` (admin only, `security definer`): email from `auth.users`, last sign in, and counts only (days active in 30 days from mood check ins, journal dates and symptom checks; check in count; booking count). Returns `currentUserId` from the session, so "you" is real. All accounts are returned (up to 2000) and the page searches in the browser.
- `PATCH /api/admin/users/:id/role` body `{ role, promotion? }` calls the new 6 argument `set_user_role()`: admin only, never your own role, never the last active admin, admins can make admins, and promoting someone without a professional profile needs title, license number and issuing body, which creates a verified profile and credential (an admin's test profile is replaced). Logged as `change_role`, plus `promote_professional` with the license and note.
- `PATCH /api/admin/users/:id/status` (from section 6) suspends with a required reason, or restores.
- **Audit log page** reads `GET /api/admin/audit-log` (`lib/controllers/audit-controller.ts`), which turns each action code into a readable line with who did it, who it was about (names only) and a short detail (role change, reason, note). Rows with no admin were made in the Supabase dashboard.
- The old sample `users` list stays only for the demo Bookings page.
- **Nightly open times:** `refresh_all_open_times()` mirrors `openSlots()` in SQL and adds missing times for every active professional's booking window. pg_cron runs it at 00:05 Cambodia time (`arom-refresh-open-times`). It only adds; saving the schedule in `/pro` still replaces times exactly.
- Still open: server side search for very large numbers of users. `AdminUser.avatarUrl` stays null by design. User profile photos are private and only available to the signed in account holder.

**Files:** `app/admin/_data/users.ts`, `app/admin/_components/users-view.tsx`, actions in `admin-provider.tsx`.

### Data shape the page expects (`AdminUser`)

| Field | Type | Database source | Exists today? |
|---|---|---|---|
| `id` | string (uuid) | `profiles.id` | Yes |
| `fullName` | string | `profiles.full_name` | Yes |
| `email` | string | `auth.users.email` | **No.** `listUsers` does not return it. Needs a server side read (see gaps) |
| `avatarUrl` | string or null | none for the admin user list | **No by design.** User profile photos are stored privately and are not exposed in admin user records |
| `role` | `'user' \| 'professional' \| 'admin'` | `profiles.role` | Yes |
| `status` | `'active' \| 'suspended'` | `profiles.account_status` | Yes (returned as `accountStatus`, rename or map) |
| `preferredLanguage` | `'en' \| 'km'` | `profiles.language` | Column yes, not returned by `listUsers` |
| `createdAt` | ISO string | `profiles.created_at` | Yes |
| `lastSeenAt` | ISO string | `auth.users.last_sign_in_at` or a new `profiles.last_seen_at` | **No** |
| `daysActive30` | number | count of distinct active days in last 30 days | **No** |
| `checkInCount` | number | count of the user's `mood_checkins` rows | **No** |
| `bookingCount` | number | count of `appointments` for the user | **No** |

The signed in admin is mocked as `currentAdminId`. Use the session user id instead (the page hides action buttons on your own card).

### Actions

| Frontend action | Meaning | Endpoint | Exists today? |
|---|---|---|---|
| `setUserRole(id, 'professional', promotion)` | Admin promotes someone they know | `PATCH /api/admin/users/:id/role` | Partly. Must also accept `promotion` (below) |
| `setUserRole(id, 'admin')` | Make admin | `PATCH /api/admin/users/:id/role` | **No.** Database blocks it on purpose |
| `setUserRole(id, 'user')` | Remove professional role or admin access | `PATCH /api/admin/users/:id/role` | Yes for professional. **No** for removing admin |
| `setUserStatus(id, 'suspended' \| 'active')` | Suspend or restore account | suggest `PATCH /api/admin/users/:id/status` body `{ status, reason? }` | **No** endpoint. Columns `account_status`, `suspended_at`, `suspended_reason` already exist |

`promotion` shape (`ProfessionalPromotion` in `admin-provider.tsx`):

```ts
{ title: string; licenseNumber: string; issuingBody: string; note: string }
```

### Backend gaps

Done on 14 Oct 2026 (see Connected above): making admins with all guards, promoting with license details, suspend and restore, email in the list, activity counts. Still open: server side search (`?q=`) once there are more than 2000 accounts.

## 6. Admin professionals page

**Files:** `app/admin/_data/professionals.ts`, `app/admin/_components/professionals-view.tsx`, actions in `admin-provider.tsx`.

**Connected (14 Oct 2026):** `GET /api/admin/professionals` (one merged list), `GET /api/admin/applications/:id/license` (redirects to a 60 second signed link), approve and reject through the existing review endpoint, suspend and reinstate through `PATCH /api/admin/users/:id/status` (`set_account_status()` in migration `20261014000200`: admin only, never yourself, reason required to suspend, audit logged). Controller: `lib/controllers/professionals-controller.ts`. The page reads `professionalRecords` from the provider; the old mock `professionals` list stays only for the demo pages (bookings, community, podcasts) until they are connected. Pending applicants are merged into the list with the user id as `id` and the application id as `applicationId`. `source` is derived for now: `application` when an approved application exists, otherwise `admin`.

**Decided:** professionals edit their own profile. Admins do not write profiles. Admins only approve, reject, suspend, reinstate and review changes to important fields.

### Data shape the page expects (`Professional`)

| Field | Database source | Notes |
|---|---|---|
| `id` | `professional_profiles.id` (same as user id) | For a pending application, see the note below |
| `name`, `kmName` | `display_name`, `display_name_km` | |
| `role`, `kmRole` | `title`, `title_km` | |
| `about`, `kmAbout` | `bio`, `bio_km` | |
| `image` | `photo_url` | |
| `specialties`, `languages` | same names | |
| `session` | `session_types` | `['online']` maps to `'Online'`, `['in_person']` to `'In-person'`, both to `'Both'` |
| `experience` | not in `professional_profiles` | applications have `years_experience`. Add a column or derive it |
| `verificationStatus` | `verification_status` | `pending`, `verified`, `rejected` |
| `accountStatus` | `profiles.account_status` | |
| `credential.licenseNumber`, `issuingBody` | `professional_credentials` | |
| `credential.documentName` | `professional_credentials.document_path` | Show file name only. Open through a short lived signed URL, never a public URL |
| `credential.submittedAt` | `professional_credentials.submitted_at` | |
| `phone`, `telegram` | `professional_applications.phone`, `.telegram` (new) | Private, admins only. Never return them from public directory queries |
| `pendingChanges` | **does not exist** | see gap 1 |
| `reviewNote` | `review_note` | |
| `source` | **does not exist** | `'application'` or `'admin'`. See gap 4 |
| `joinedAt` | `professional_profiles.created_at` | |

**Pending applications:** the page shows new applicants in the same list. They live in `professional_applications`, not `professional_profiles`. Either merge both into one list in the controller (keep the application id so review calls the right endpoint), or return two lists and let the provider merge them. Tell Rith which, so the type can get an `applicationId` field if needed.

### Actions

| Frontend action | Meaning | Endpoint | Exists today? |
|---|---|---|---|
| `reviewApplication(id, 'approve' \| 'reject', note)` | Approve or reject a new applicant. Reject needs a reason | `POST /api/admin/applications/:id/review` body `{ approve, note }` | Yes |
| `reviewProfileChanges(id, 'approve' \| 'reject', note)` | Approve or decline changes to name, title, license number or issuing body | new, for example `POST /api/admin/professionals/:id/changes/review` | **No** |
| `setProfessionalAccess(id, 'suspended' \| 'active', note)` | Suspend (hide from directory, no new bookings) or reinstate | can reuse the suspend endpoint from section 5 | **No** |

### Backend gaps

Done: pending profile changes (`professional_profile_changes`, migration `20261014000400`), directory visibility (`is_listed_professional()`, section 16), and the signed license link. Still open: a stored `source` column on `professional_profiles` (derived today).

## 7. Product decisions already made

Do not change these without asking Rith.

- **Two ways to become a professional:**
  1. The user applies: form, then pending, then admin approves or rejects with a reason. Rejected users can apply again.
  2. An admin promotes someone they know directly from the Users page. License number and issuing body are still required.
- **Nobody is promoted automatically by the system.**
- **Admins can make other admins** from the Users page, with a confirm checkbox, never on themselves, and never removing the last admin.
- **Professionals edit their own profile.** Admins review and moderate only.
- **Admins never see private wellbeing content.** Counts only. Exception: support group chats, see the next rules.
- **Professionals and admins create support groups.** A professional's group goes live right away, with the creator as its mentor. Admins can shut it down later.
- **Admins can read every support group chat** for safety. Each time an admin opens a chat it is written to the audit log, and every group's guidelines say "The AROM safety team can read this chat to keep it safe."
- **Shutting down a group closes it, it is not deleted.** Members keep the group in their list with "This group was closed by the AROM team." and can read the history, but nobody can send or join, and it is hidden from Browse groups. Admins can reopen it. The reason is for admins only.
- **Users can report a person, a message, an image or a whole group.** The admin never sees who reported.
- **AROM has no "Owner" role.** Only `user`, `professional`, `admin`.
- **Educational note is fixed app text.** Every lesson, tip, practice and podcast screen shows "For learning only. This is not a diagnosis or treatment." from `app/_components/educational-note.tsx`. It is not stored as content, so no admin edit can remove it.
- **No crisis helpline card on content screens.** Users find crisis helplines in Profile and Settings under "Get help now" (see section 13). If none are active, a built in message tells users to contact local emergency services. Never invent a number.
- **Care plan tasks come only from the client's own professional, after a booking.** Four kinds: MindGuide item (only published ones), mission, goal and reminder. Reminders about medicine are only for medicine their doctor prescribed; AROM does not prescribe. The client chooses whether the professional sees their progress (off unless they turn it on), and it covers only ticks on those tasks, never journals, mood or detection answers. Reminder messages are sent by the Telegram bot built separately, not by the app.
- **Next sessions are suggested, the client books.** After a session the professional can offer up to 3 times (optionally repeating: every week for 4 or 8 sessions, or every 2 weeks for 4). The client picks one in Messages and it is booked instantly, the whole series at once. The professional never books for the client. A follow up starts with sharing off (survey and symptom checks), because sharing is the client's choice per booking.
- **Online sessions use the professional's own meeting room** (Google Meet, Zoom or Jitsi), set once in My schedule and changeable per session. Join opens 10 minutes before the start for both sides. No built in video.
- **Messages only after a booking.** A user can message a professional only once they have booked with them. Text and voice messages (up to 2 minutes). Admins cannot read these chats (unlike community group chats). Not for emergencies: the user chat always links to Get help now. Archived clients' chats are read only. Calls use a meeting link (Google Meet or Zoom), not built in calls. Automatic reminders are a Telegram bot built separately.
- **Bookings belong to the user and the professional.** Only they confirm, reschedule or cancel. Admins see bookings read only and can only make an emergency cancel with a written reason (see section 12).
- **Instant booking.** A user picking one of a professional's open times is booked straight away (`appointments.status = 'booked'`, as the database already does). Professionals can still cancel or reschedule with a reason. An optional per professional "review new clients first" setting may come later; the frontend "pending" status is reserved for it.
- **A professional appears to users only when their profile is complete:** photo, English bio (80+ characters), Khmer bio, at least one specialty, language and session type, a price choice (Free counts), and at least one open time. Today approval sets `verified` immediately; add the completeness check to the directory query.
- **Session notes are private to the professional who wrote them.** Not admins, not other professionals.
- **No payments yet, but prices are shown.** Each professional chooses Free, one price ("$20 a session") or a range ("$30 to $50 a session"). Users see it on the list, the profile and the booking review, with a "No payment during testing" note while the admin switch "No payments during testing" (Settings) is on. Nobody is charged.
- **Professionals publish their own episodes without admin review,** after confirming three points: no client stories or identifying details, for learning only (not a diagnosis or treatment for any one person), and they own the recording with permission from anyone else in it. Episodes belong to the professional: there is no Report a problem on them and admins cannot hide or delete them. Only the professional hides or deletes their own episodes.
- **Two kinds of podcasts.** MindGuide podcasts are made by admins and shown in MindGuide. Professional podcasts are published by professionals themselves on their own profile so users can listen before booking. They are separate lists.

## 8. Become a professional (user applies)

**Files:** `app/profile/become-professional/page.tsx`, `_components/become-professional.tsx`, `_data/application.ts` (type, zod schema, mock). Entry point: "Become a Professional" link in Profile, shown only when `user.role === 'user'`. The route sits under `/profile`, so `proxy.ts` already requires login.

**Connected (14 Oct 2026).** The page loads the caller's latest application from `GET /api/professional/application` and submits with `POST` (multipart). The demo bar and `previewStatus` are removed. Backend: `lib/controllers/application-controller.ts`, rules in `lib/professional-application.ts`, migration `supabase/migrations/20261014000100_professional_applications.sql`.

### Data shape the page expects (`ProfessionalApplication`)

| Field | Type | Database source | Exists today? |
|---|---|---|---|
| `id` | string (uuid) | `professional_applications.id` | Yes |
| `fullName` | string | `full_name` | Yes |
| `title` | string | `title` | Yes |
| `licenseNumber` | string | `license_number` | Yes |
| `issuingBody` | string | `issuing_body` | Yes |
| `documentName` | string | file name from `document_path` | Column yes, upload flow **No** |
| `specialties` | string[]. Chosen chips plus free text typed under "Other" (up to 5 extra, 40 characters each, duplicates removed) | `specialties` | Yes. Free text values are not from a fixed list, so do not use an enum |
| `languages` | string[] | `languages` | Yes |
| `yearsExperience` | number | `years_experience` | Yes |
| `phone` | string, Cambodian number, spaces removed, for example `012345678` | **new column `phone`** | **No** |
| `telegram` | string. Equals `phone` when the user ticked "Same number on Telegram", otherwise a username or empty | **new column `telegram`** | **No** |
| `motivation` | string | `motivation` | Yes |
| `status` | `'pending' \| 'approved' \| 'rejected'` | `status` | Yes |
| `reviewNote` | string | `review_note` | Yes |
| `createdAt` | ISO string | `created_at` | Yes |

Validation lives in `createApplicationSchema()` in `_data/application.ts`. Repeat the same rules on the server: required fields, phone matches `^(?:\+?855|0)[1-9]\d{7,8}$` after removing spaces, Telegram username `^@?[A-Za-z0-9_]{5,32}$`, at least one specialty with up to 5 "Other" entries of 40 characters each, document PDF, JPG or PNG up to 5 MB, years 0 to 60, motivation up to 2000 characters.

### Actions

| Frontend action | Meaning | Suggested endpoint | Exists today? |
|---|---|---|---|
| load latest application | Show the right status when the page opens | `GET /api/professional/application` (the caller's own latest, or `null`) | **No** |
| `submitApplication(values, documentName)` | Submit or resubmit | `POST /api/professional/application` (multipart, or upload first then JSON with `documentPath`) | **No** |
| "Log out and log in again" | Refresh the role in the token after approval | existing `POST /api/auth/logout` | Yes |

### Backend gaps (all done in migration `20261014000100`)

Done: `phone`, `telegram` and `document_name` columns with the same checks as the form; only role `user` may insert; private `professional_contacts` table filled on approval (owner and admins read); private `licenses` bucket (5 MB, PDF, JPG, PNG; owner uploads into `<user_id>/`, admins read, nobody changes or deletes); rejecting now requires a note; `GET /api/admin/applications` returns `documentName`, `phone`, `telegram`. The row is saved before the file, and removed again if the upload fails. The license opens through `GET /api/admin/applications/:id/license`, a 60 second signed link (section 6).

Original list:

1. **Add `phone` and `telegram` columns** to `professional_applications`, and copy them to the professional's private record when approved (for example `professional_credentials` or a new private contact table). RLS: the applicant and admins only. Never in `professional_profiles` or any public view.
2. **Submit endpoint.** Caller must be `user` role and active. The unique index already blocks a second pending application. A rejected applicant may submit a new one.
3. **License upload** to the private storage bucket. Path per user, for example `licenses/<user_id>/<uuid>.<ext>`. Storage policies: owner can upload, admins can read, nobody else.
4. **Get own application** endpoint returning only the caller's rows.
5. **Admin review** already exists (`POST /api/admin/applications/:id/review`). The admin Professionals page now also shows `phone` and `telegram` in the review panel, so include them in `GET /api/admin/applications`.

## 9. MindGuide content: drafts, versions and publishing

**Files:** `app/admin/_data/content.ts` (types, seed, helpers), `_data/content-checks.ts` (publish rules), `_data/content-diff.ts` (change summary), `_components/content-editor.tsx` (editor page), `content-view.tsx` (list), field panels `content-meta-fields.tsx`, `lesson-editor.tsx` (`LessonFields`), `tip-editor.tsx` (`TipFields`), `practice-editor.tsx` (`PracticeFields`). Actions live in `admin-provider.tsx`.

**Decided:** content is written and designed by the team with Claude and lives in fixed user screens. Admins only correct text in plain fields. No HTML, no styling, no AI button in the app. There is no Add button for lessons, tips or practices: new items are written by the team with AI and inserted as drafts (for example by a seed script or migration), then admins check, fix and publish them. Podcasts are different: admins create them fully, so Podcasts keeps its Add button. A new kind of block (new layout) is developer work in both the user screen and the editor.

### Data shape

One item is a `ContentRecord`:

| Field | Meaning | Suggested database |
|---|---|---|
| `id` | `<type>:<sourceId>` | primary key (`kind`, `key`) of `content_items` |
| `type` | `'lesson' \| 'tip' \| 'practice'` | `kind` |
| `sourceId` | slug or uuid, used in the editor URL | `key` |
| `liveVersion` | number shown to users, or `null` when never published or hidden | `content_items.version` |
| `versions[]` | `{ version, body, publishedAt, publishedBy }`. Never changed once written | `content_versions` (`body jsonb`) |
| `draft` | `{ body, baseVersion, updatedAt, updatedBy }` or `null`. At most one | `content_drafts` (`body jsonb`) |

`body` is `ContentBody`: `{ type, meta, details }`. `meta` is `ContentMeta` (title, kmTitle, description, kmDescription, category, duration, difficulty, image). `details` is `AdminLessonDetails`, `AdminTipDetails` or `AdminPracticeDetails` from the `_data/*-details.ts` files. Keep these TypeScript types as the JSON contract.

Status shown in the list comes from `getPublishState()`: `live`, `liveDraft` (live and has a draft), `notPublished` (no versions), `hidden` (has versions but `liveVersion` is null).

**Ids are never reused.** Lesson section ids are numbers; a new section gets one more than the highest id in any version, the draft or the editor. Tip step and practice instruction ids are uuids. User reports will point at `<type>:<sourceId>#<id>`.

### Actions (all admin only, all through `security definer` functions)

| Frontend action | Meaning | Hint codes |
|---|---|---|
| `saveContentDraft(id, body, expectedUpdatedAt)` | Save the draft. Light check only (unique ids), so half finished work can be saved | `stale`, `shape` |
| `publishContent(id, expectedUpdatedAt)` | Run the full check in the database, write version N+1 from the saved draft, delete the draft, set it live | `stale`, `shape` |
| `discardContentDraft(id)` | Delete the draft. Live version stays | none |
| `deleteContent(id)` | Only for items that were never published | none |
| `setContentHidden(id, hidden)` | Hide: set `liveVersion` to null. Show: set it to the newest version | none |
| `restoreContentVersion(id, version)` | Copy that version into the draft. Returns the new draft `updatedAt` | none |

The return type is `ContentActionResult`: `{ ok: true, updatedAt }` or `{ ok: false, code: 'stale' | 'shape' }`. Also return `not_admin` from the backend; the editor will show it as an error.

**No overwrite rule.** Save and Publish send the draft `updatedAt` the editor loaded (`null` when there was no draft). If the database value differs, refuse with `stale` and change nothing.

**Publish rules.** Publish publishes exactly the saved draft (the editor blocks Publish while there are unsaved changes). Repeat the rules of `checkForPublish()` in the database: errors block publishing, warnings (missing Khmer text) do not. Record `published_by` and `published_at` on every version and `updated_by` on drafts.

**Connected for admins (17 Oct 2026), migration `20261017000700_mindguide_content.sql`:**

- **Tables:** `content_items (kind, key, live_version, deleted_at)`, `content_versions (kind, key, version, body jsonb, published_at, published_by)`, `content_drafts (kind, key, body, base_version, updated_at, updated_by)`. Admin read only (RLS); every write goes through a `security definer` function.
- **Code first:** an item lives only in code (`initialContentRecords`) until an admin first changes it. Then `admin_init_content_item()` copies the code version in (version 1 when it was available, otherwise the draft) and the database is the record. A deleted, never published item keeps a row with `deleted_at`, so the code version does not come back.
- **Functions:** `save_content_draft`, `publish_content`, `discard_content_draft`, `delete_content` (never published only), `set_content_hidden`, `restore_content_version`. Publish, hide, show, restore and delete write `admin_audit_log`.
- **No overwrite:** save and publish compare the draft time the editor loaded; a different time answers `stale` (error code `PT409`) and changes nothing. Times are kept to the millisecond so they match the browser.
- **Publish rules:** the API runs the same `checkForPublish()` the editor shows on exactly the saved draft; an error answers `shape`. The light `checkDraft()` (unique ids) runs on save.
- **API:** `GET /api/admin/content` (records), `POST /api/admin/content { action: save | publish | discard | delete | hidden | restore, id, ... }`. Controller `lib/controllers/content-controller.ts`.

### Still frontend only

The user app still reads lessons, tips and practices from `app/_components/learn/learn-data.ts`, `tips/tips-data.ts` and `practice/practice-data.ts`. Publishing in the admin does not change what users see yet. When connected: download a small manifest of live items once per app open, download a body by (type, key, version) when opened, and cache published versions forever because they never change.

## 10. Report a problem and admin Reports

**Files:** user side `app/_components/report-problem.tsx` (button and dialog), `app/_components/content-reports.ts` (types and mock submit). Admin side `app/admin/_data/reports.ts`, `_components/reports-view.tsx`, route `/admin/reports`, actions `reports` and `resolveReports` in `admin-provider.tsx`.

**Where users see it:** a quiet "Report a problem" link at the end of the lesson overview, inside every lesson section (reports that section), the tip overview, the tip steps page and the practice overview. Hidden in the admin preview.

### Data shape

| Field | Type | Notes |
|---|---|---|
| `target` | `{ type: 'lesson' \| 'tip' \| 'practice', sourceId, partId? }` | A reference only, never a copy of the text. Written as `lesson:learn-about-stress#3` by `reportTargetKey()`. `partId` is a lesson section id (never reused, see section 9) |
| `reason` | `'wrong_info' \| 'harmful' \| 'broken' \| 'other'` | |
| `note` | string, up to 500 characters, optional | The form asks users not to write personal or health details |
| `createdAt` | ISO string | |
| `status` | `'open' \| 'fixed' \| 'not_a_problem'` | |
| `resolvedAt`, `resolvedBy` | set when closed | `resolvedBy` is the admin's name |

### Actions

| Frontend action | Meaning | Suggested backend |
|---|---|---|
| `submitContentReport({ target, reason, note })` | User sends a report. Returns `'sent'` or `'daily_limit'` | `security definer` function that checks the target exists, caps each user at 5 reports per day, and stores the reporter id only for that limit |
| `reports` | Admin list | admin only read. Never return the reporter id to the admin UI |
| `resolveReports(itemId, 'fixed' \| 'not_a_problem')` | Closes every open report on one item | admin only, writes `resolved_by`, `resolved_at`, and an audit log entry |

### Rules

- **Privacy:** no reporter identity in admin screens, no copy of content, no personal mental health data requested.
- **Order on the admin page:** items with any "upsetting or harmful" report first, then most reports, then newest.
- **Edit link** opens `/admin/mindguide/<type>/<sourceId>?part=<partId>` and jumps to that section.
- **Connected (17 Oct 2026), migration `20261017000400_content_reports.sql`:** table `content_reports` with no direct access. `submit_content_report()` (signed in only, 5 a day, the API checks the item exists in code), `admin_list_content_reports()` (open reports and the last 180 days, never the reporter), `resolve_content_reports()` (closes every open report on one item, audit logged). API: `POST /api/content-reports` (signed out visitors are asked to log in), `GET /api/admin/content-reports`, `POST /api/admin/content-reports/resolve { itemId, status }`. Controller `lib/controllers/reports-controller.ts`.

## 11. MindGuide podcasts

**Files:** user side `app/_components/podcasts/podcast-data.ts` (type, sample episodes), `podcast-player.tsx`, `podcasts-views.tsx`, routes `app/podcasts/page.tsx` and `app/podcasts/[id]/page.tsx`. The MindGuide home "Podcast" icon links to `/podcasts`. Admin side `app/admin/_data/podcasts.ts`, Sokheng's `podcasts-view.tsx` (MindGuide page, Podcasts tab).

**Decided:** these are AROM team podcasts made by admins. They are not the professional podcasts in `lib/therapists.ts`, which professionals will manage from `/pro`.

### Data shape (`MindGuidePodcast`)

| Field | Type | Notes |
|---|---|---|
| `id` | slug | used in `/podcasts/<id>` |
| `title`, `kmTitle`, `description`, `kmDescription`, `topic`, `kmTopic` | string | |
| `durationSeconds` | number | the player uses the real file length once loaded |
| `audioUrl` | HTTPS URL or empty | empty shows "audio coming soon" and the admin cannot publish |
| `publishedDate` | `YYYY-MM-DD` | |
| `guestProfessionalId` | professional slug or empty | optional; only verified, active professionals can be picked |
| `takeaways` | `{ en, km }[]` | key points under the player |
| `chapters` | `{ id, seconds, title, kmTitle }[]` | the admin form edits them as `MM:SS` text; convert to seconds |

### Backend gaps

1. **Table and storage** for MindGuide podcasts and their audio files (public bucket is fine for published audio; keep drafts private).
2. **Only published episodes** are returned to users. Admin only writes.
3. **Admin form fields not covered yet:** takeaways. Add them to the form when the backend exists.
4. **Report a problem** is not on podcast pages yet; adding it needs `podcast` as a report target type.

## 12. Admin bookings chart

**Files:** `app/admin/_components/bookings-chart.tsx`, placed at the top of Sokheng's `bookings-view.tsx`. Sample data: `app/admin/_data/bookings.ts` now generates about 105 deterministic demo bookings around 13 Oct 2026 (no double bookings) on top of the original four.

**What it shows:** columns per day, with a switch between:
- **Sessions per day** by session date (`startsAt`), stacked as completed or confirmed, pending, cancelled. Ranges: last 7 days, last 30 days, next 14 days.
- **New bookings per day** by the day the booking was made (`createdAt`). Ranges: last 7 and last 30 days.

It also shows the total for the range, the difference from the same number of days before, and the busiest day. Days use Cambodia time (`Asia/Phnom_Penh`). Clicking a day in "Sessions per day" filters the bookings table below to that date.

### Admin actions on a booking

The booking popup is read only, with one exception:

| Frontend action | Meaning | Suggested backend |
|---|---|---|
| `saveBooking({ ...booking, status: 'cancelled', cancelledBy: 'admin', cancelReason })` | Emergency cancel of an upcoming pending or confirmed booking, for example when a professional is suspended | Admin only `security definer` function. Set `appointments.status = 'cancelled'`, `cancelled_by` (the admin), `cancelled_at`, `cancel_reason` (required, up to 500 characters), free the slot, write `admin_audit_log`, and notify the user and the professional |

Confirming and rescheduling are not admin actions. They belong in the user booking pages and the `/pro` area.

### Backend needs

The chart only needs counts, never names. Suggested endpoint, admin only:

`GET /api/admin/bookings/daily?from=YYYY-MM-DD&to=YYYY-MM-DD` returning

```json
{ "days": [{ "date": "2026-10-13", "going": 3, "pending": 0, "cancelled": 1, "created": 4 }] }
```

- `going` counts `appointments.status` in (`booked`, `completed`); `pending` maps to the frontend "pending" state if the backend adds one, otherwise 0; `cancelled` counts `cancelled` and `no_show`. Tell Rith if the mapping should differ.
- Group by the Cambodia calendar day of `starts_at` for sessions and of `created_at` for `created`.
- Return every day in the range, including zero days, so the comparison with the previous period is easy (the frontend asks for both ranges).

### Connected (17 Oct 2026), migration `20261017000100_admin_bookings.sql`

- **`admin_list_bookings(from)`** returns bookings that start or were made in the last 60 days and the next 14, for the chart and the table: the professional, times, type, status and who cancelled (user, professional or admin). **Never the client:** no user id, name, intake note or meeting link. A cancel reason is returned only when an admin wrote it. The page shows the client as "Private".
- **`admin_cancel_booking(id, reason)`** cancels an upcoming booked session (reason required, up to 500 characters), frees the open time and writes `cancel_booking` to the audit log. The client and the professional see "cancelled by AROM" with the reason in their bookings; no message or email is sent.
- **Status mapping:** `booked` shows as confirmed, `completed` as completed, `cancelled` and `no_show` as cancelled. "Pending" stays empty until a "review new clients first" setting exists.
- **API:** `GET /api/admin/bookings`, `POST /api/admin/bookings/:id/cancel { reason }`. The chart counts in the browser from the same list. The sample bookings are deleted.

## 13. Crisis helplines and AROM support contact

**Files:** shared `app/_components/support-contacts.ts` (types, empty lists, checks), user `app/_components/get-help-section.tsx` (placed in `profile-settings.tsx`), admin `app/admin/_data/settings.ts` and `_components/settings-view.tsx`, provider `crisisHelplines` and `saveCrisisHelplines`.

**Removed from admin Settings:** platform name (AROM is fixed) and admin language (admin is English only). `AdminSettings` is now just the support contact.

### Crisis helpline (`CrisisHelpline`)

Matches the existing `crisis_resources` table: `name`, `kmName` (`name_km`), `description`, `kmDescription`, `phone`, `sms`, `website`, `hours`, `kmHours` (`available_hours`, `available_hours_km`), `isActive` (`is_active`), `sortOrder` (`sort_order`). `country_code` stays `KH`.

Rules the admin form enforces, repeat them in the database:
- English and Khmer name required.
- A phone number or a website is required.
- Phone and SMS: 3 to 15 digits (short codes allowed), spaces and `+` allowed.
- Website must be `https://`.
- Every save needs the admin to confirm they checked the number themselves. Record who changed it in `admin_audit_log`.

Users get only active helplines with a phone or website, ordered by `sortOrder`. Everyone (even signed out) may read active rows; only admins write.

### Support contact (`SupportContact`)

`email`, `phone`, `hours`, `kmHours`. Shown to users as "AROM support" for app questions, not emergencies, only when an email or phone is set. Suggested storage: a single row settings table, admin write, public read.

### Connected (14 Oct 2026)

- `GET /api/crisis-resources` (public, signed out visitors included): active helplines in the admin's order. Used by `get-help-section.tsx`.
- `GET /api/admin/crisis-resources` and `PUT /api/admin/crisis-resources` body `{ helplines }` (the whole list in display order). Controller `lib/controllers/crisis-controller.ts`.
- `save_crisis_resources(jsonb)` (migration `20261014000300`) replaces the list in one transaction: admin only, deletes rows left out, sets `sort_order` from the list order, and writes one `admin_audit_log` entry with the totals and the names of removed helplines. New table checks repeat the form rules (Khmer name, phone or website, 3 to 15 digits, `https://`), so an invalid row saves nothing.
- The "I checked this number myself" confirmation is enforced in the form only; the audit log records who saved.

### Support contact, connected (17 Oct 2026)

Migration `20261017000200_support_contact.sql`: one row table `support_contact (email, phone, hours, hours_km)`, readable by everyone, changed only through `save_support_contact()` (admin only, email and phone checked like the form, audit logged). `GET /api/crisis-resources` now returns `{ helplines, supportContact }`; admins use `GET|PUT /api/admin/support-contact`.

## 14. Crash tracking

**Files:** `app/_components/crash-reporting.ts` (report shape, `reportCrash`), `app/error.tsx` and `app/global-error.tsx` (catch crashes), admin `app/admin/_data/crashes.ts` and `_components/crash-report-card.tsx`, added at the bottom of Hok Chheng's `dashboard.tsx` (6 added lines, nothing removed).

**Definition:** a crash is an error that broke a screen for someone. `app/error.tsx` catches crashes inside pages (`kind: 'render'`); `app/global-error.tsx` catches the rare case where the root layout breaks (`kind: 'app'`).

### Report sent by the browser (`CrashReport`)

| Field | Notes |
|---|---|
| `kind` | `'render'` or `'app'` |
| `message` | error message, cut to 300 characters, query strings removed from any URL |
| `route` | `window.location.pathname` only, never the query string or hash |
| `release` | first 7 characters of `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`, `local` otherwise |
| `digest` | Next.js error digest for server errors, to match server logs |
| `occurredAt` | ISO time |

**Privacy:** no journal text, mood answers, form contents, names or user ids in the report. Do not add them.

### Backend needs

1. **`POST /api/crash-reports`** accepting `CrashReport`, sent with `navigator.sendBeacon`. Allow signed out visitors. Rate limit per IP and per user. Store the reporter id only to count distinct people, never return it.
2. **Table** of crash events with RLS: insert through the endpoint only, read by admins only. Keep 30 days.
3. **`GET /api/admin/crashes?days=7`** returning groups (`CrashGroup`): `id`, `kind`, `message`, `count`, `people` (distinct accounts), `lastSeenAt`, `route`, `release`, sorted by `count`. Group by `kind` + `message` + `route`.
4. **Optional, "send the top ones to the developer":** a daily job that emails or Telegrams the top 5 groups to the developer. Today the admin card has a Copy for developer button that builds the same text by hand.
5. Then replace the body of `reportCrash()` with the send, and change the error screen text to say the team has been told (it does not say so yet, because nothing is sent).

### Connected (17 Oct 2026), migration `20261017000600_crash_reports.sql`

- **`POST /api/crash-reports`** (anyone, sent with `sendBeacon`) calls `report_crash()`. Limits: 20 an hour per device key or account, 500 an hour in total; extra reports are dropped silently. The device key is a SHA 256 hash of the address and the Cambodia day, so it cannot be followed from day to day; the address itself is never stored. The account id is kept only to count people. Rows older than 30 days are deleted.
- **`GET /api/admin/crashes?days=7`** calls `admin_crash_groups(days)`: groups by kind, message and page, sorted by count, with the distinct people and the newest build. Never who they were.
- The error screens now say "The AROM team has been told." The daily message to the developer (gap 4) is not built; the card's Copy for developer still works.

## 15. Announcements

**Files:** shared `app/_components/announcements.ts` (type, empty list, rules), user banner `app/_components/announcement-banner.tsx` (in `app/layout.tsx`, hidden on `/admin` and `/content-preview`), admin `app/admin/_components/announcements-section.tsx` (top of Settings), provider `announcements`, `publishAnnouncement`, `endAnnouncement`.

### Data shape (`Announcement`)

| Field | Notes |
|---|---|
| `id` | uuid |
| `kmText` | required, up to 300 characters |
| `enText` | optional, up to 300; English readers see `kmText` when empty |
| `tone` | `'info' \| 'good' \| 'important'` |
| `link` | optional path inside AROM, must match `^/(?!/)[A-Za-z0-9-._~/]*$` (no outside websites) |
| `createdAt`, `createdBy` | admin name |
| `endsAt` | ISO time, or null for "until an admin ends it" |
| `endedAt` | set by "End now" |

### Rules

- **Only one shows:** the newest one that has not ended (`endedAt` null and `endsAt` null or in the future).
- **Everyone can read the current one,** signed out visitors included. Only admins publish or end. Log both in `admin_audit_log`.
- **Users can close the banner** for that announcement; the closed id is kept in the browser only (`arom-dismissed-announcement`), nothing is sent.

### Backend needs

**Connected (17 Oct 2026), migration `20261017000300_announcements.sql`:** table `announcements`. Everyone reads the running ones (RLS), admins read all. `publish_announcement()` and `end_announcement()` are admin only and audit logged; the table repeats the rules (Khmer text required, links inside AROM only, end time in the future). API: `GET /api/announcements/current` (public, the banner; it never shows who wrote it), `GET|POST /api/admin/announcements`, `POST /api/admin/announcements/:id/end`.

## 16. Professional area (`/pro`)

**Connected (14 Oct 2026), migration `20261014000400_pro_profile_booking.sql`:**

- **Profile:** `GET /api/pro/me` loads everything the area needs (profile, waiting changes, schedule, bookings, session notes, `listed`). `PATCH /api/pro/profile` saves normal fields at once; name, title (both languages), license number and issuing body go to the new `professional_profile_changes` table, and the trigger stops professionals from changing them directly. `DELETE /api/pro/profile/changes?field=` withdraws one. Admins approve or decline all waiting changes with `POST /api/admin/professionals/:id/changes/review` (`review_profile_changes()`, audit logged).
- **Photo:** `POST /api/pro/photo` uploads to the public `professional-photos` bucket at `<user_id>/<uuid>.<ext>` (JPG, PNG, WebP, 5 MB, content checked). The profile only accepts a photo URL from the professional's own folder. Old photos are not deleted yet.
- **Price:** `price_kind` (`free`, `fixed`, `range`), `price_usd`, `price_max_usd` on `professional_profiles`.
- **Schedule:** private table `professional_schedules` (the `Schedule` JSON, `meeting_url`, `min_notice_hours`), owner only. `PUT /api/pro/schedule` repeats the editor checks, saves, and calls `sync_availability_slots()`, which replaces the future open times and never touches booked ones. The window rolls forward each time the professional opens `/pro` (no scheduled job yet). Changing the default room moves upcoming online sessions that used the old room or had none. The clinic requirement for in person slots was dropped.
- **Directory:** `is_listed_professional()` is the single rule (verified, active account, photo, English bio 80+, Khmer bio 40+, specialty, language, session type, price, and an open time). `list_public_professionals(slug?)` and `public_open_slots(slug)` return public fields only, signed out visitors included. Code: `lib/professionals.ts`. Sample profiles in `lib/therapists.ts` still open by URL for the demo features, but are not listed and cannot be booked.
- **Booking:** `POST /api/bookings` calls `book_appointment()`, now limited to listed professionals, with the minimum notice and the professional's room link copied for online sessions.
- **Bookings in `/pro`:** `POST /api/pro/bookings/:id` with `action` `cancel`, `reschedule` (new `reschedule_appointment()`, keeps `rescheduled_from` and `reschedule_reason`), `outcome` (only after the session ends, enforced by the trigger), `note` (one private note per session) or `meeting`. Client names come from `my_client_names()`.
- **Admin test profile (migration `20261014000500`):** admins can open `/pro` for testing. The first visit calls `ensure_admin_test_profile()`, which makes a verified profile with `is_test = true` (slug `arom-test-<6 chars>`). It works like any profile, but `is_listed_professional()` only lists test profiles when the person asking is an admin, so real users and signed out visitors never see or book it. Only admins can change `is_test`. To test booking, use a second admin account.
- **Private notes (migration `20261015000300`):** `session_prep_notes` (one per appointment) and `client_summary_notes` (one per client), up to 5000 characters, readable and writable only by the professional who wrote them (RLS, no admin or client read). Saved with `POST /api/pro/bookings/:id { action: "prep", text }` and `POST /api/pro/clients/:clientId { summaryNote }`; an empty text deletes the note. Returned by `GET /api/pro/me` as `prepNotes` and `summaryNotes`.
- **Shared by the client:** `GET /api/pro/clients/:clientId` returns the latest survey and the last 20 symptom checks (type, score, level, date; never the answers). The existing RLS (`client_shares_with_me`) returns rows only while the client shares them on a booked or completed session. `SAMPLE_SHARED` is gone.
- **Narrower client view:** the policy "Professionals read their clients' profiles" is dropped, so professionals no longer read any column of a client's profile row. `my_client_names()` now returns `id, full_name, language` and hides the name in Anonymous Mode (shown as "Client").
- **Demo code removed:** the sample bookings generator, the demo profiles and schedule, and the yellow "Not saved yet" note at the top of `/pro`. Only professional podcasts (section 20) are still memory only in `/pro`.
- Messages and archived clients (section 17), care plans (section 18), suggestions, series and quick replies (section 19) are connected.
- **Tested** on a local Postgres with stubbed `auth` and `storage` schemas: apply, approve, profile edit, name change review, open times, signed out directory, booking (too soon, double booking), reschedule, early outcome blocked, notes, cancel, suspension hides the profile.

**Files:** `app/pro/layout.tsx`, `app/pro/page.tsx` (home), `app/pro/profile/page.tsx`; components in `app/pro/_components/` (`pro-provider.tsx`, `pro-shell.tsx`, `pro-home.tsx`, `profile-editor.tsx`, `profile-preview.tsx`); data and rules in `app/pro/_data/profile.ts`. Prices and the testing flag in `lib/pricing.ts`; `Therapist.price` in `lib/therapists.ts`. Bilingual (not English only, unlike the admin).

**Entry:** after login, professionals go to `/pro` (`login-form.tsx`), and a "Professional area" sidebar link shows only for the `professional` role. `/pro` is already guarded for professionals and admins by `proxy.ts`.

### Data shape (`ProProfile`)

| Field | Database |
|---|---|
| `slug` | `professional_profiles.slug` |
| `displayName`, `kmDisplayName` | `display_name`, `display_name_km` (reviewed) |
| `title`, `kmTitle` | `title`, `title_km` (reviewed) |
| `bio`, `kmBio` | `bio`, `bio_km` |
| `photoUrl` | `photo_url` (upload to a storage bucket; the mock keeps a data URL) |
| `specialties`, `languages` | same names |
| `sessionTypes` | `session_types` (`online`, `in_person`) |
| `price` | `SessionPrice` from `lib/pricing.ts`: `{ kind: 'free' }`, `{ kind: 'fixed', amount }` or `{ kind: 'range', min, max }` in USD, 1 to 500, min below max. Store as `price_kind` plus `price_usd` and `price_max_usd` (or jsonb). Display only |
| `yearsExperience` | add a column (only in applications today) |
| `licenseNumber`, `issuingBody` | `professional_credentials` (reviewed, never public) |

### Actions

| Frontend action | Meaning | Backend |
|---|---|---|
| `saveProfile(next)` | Non reviewed fields update the profile at once. Changed reviewed fields become pending changes; the public profile keeps the live value | `PATCH /api/pro/profile` for normal fields; reviewed fields go to the pending changes table from section 6 |
| `withdrawChange(field)` | Cancel a waiting change | delete the pending change |
| `profileChecklist()` | What is missing before the profile is visible | same rule in the directory query |

The demo switch ("Established professional" or "Newly approved") and today's sessions (from the admin sample bookings) are mock only. Remove them when connected.

### My bookings (`/pro/bookings`)

**Files:** `app/pro/_data/bookings.ts` (types, sample data), `app/pro/_components/bookings-view.tsx`, provider `bookings`, `sessionNotes`, `cancelBooking`, `rescheduleBooking`, `setBookingOutcome`, `saveSessionNote`. Home "Today's sessions" and the schedule preview read the same bookings.

`ProBooking`: `id`, `professionalId`, `clientName`, `startsAt`, `durationMinutes`, `sessionType` (`online`, `in_person`), `status` (`booked`, `completed`, `cancelled`, `no_show`, as in `appointments`; no pending, booking is instant), `intakeNote` (`appointments.intake_note`), `intakeAnswers` (`intake_answers` with their `intake_questions`), `cancelledBy`, `cancelReason`, `rescheduledFrom`, `rescheduleReason`, `meetingUrl` (`appointments.meeting_url`), `seriesId` (see section 19).

| Frontend action | Rule | Backend |
|---|---|---|
| `cancelBooking(id, reason)` | Upcoming sessions only, reason required (up to 300), shown to the client | `cancel_appointment` already exists; record `cancelled_by` (the professional) and `cancel_reason`, free the slot, notify the client |
| `rescheduleBooking(id, startsAt, reason)` | New time must be an open slot of the same session type, not the current time; reason required | new function: move the appointment to the new slot, free the old one, keep the original time, notify the client, who can cancel |
| `setBookingOutcome(id, 'completed' \| 'no_show')` | Only after the session has ended | update `appointments.status` |
| `saveSessionNote(id, text)` | Up to 5000 characters | `session_notes`: readable and writable only by the professional who owns the appointment. No admin read, no client read |

Clients see their name only to their own professional. The client list shows names, not emails or phone numbers.

### Home dashboard (`/pro`, once the profile is complete)

**Files:** `app/pro/_components/pro-home.tsx`, `pro-dashboard.tsx` (next session, tiles, needs attention, care plans), `weekly-sessions-chart.tsx`. While the profile is incomplete, Home still shows the checklist instead.

Everything is counted from the professional's own data; nothing needs a new table. A backend may want one summary function (`pro_dashboard()`) to avoid loading every booking.

| Block | How it is counted |
|---|---|
| Next session | first `booked` appointment that has not ended, with Join, Prepare and Message |
| Sessions this week | appointments this Monday to Sunday (Cambodia time), not cancelled; compared with last week |
| Next 7 days | `booked` appointments starting in the next 7 days |
| Active clients | clients with any appointment, minus archived |
| How full your week is | sessions this week divided by every slot the weekly hours offer this week (time off removed), capped at 100% |
| Sessions per week, last 8 weeks | per Monday week: completed or booked, did not come, cancelled |
| Needs your attention | sessions waiting for an outcome, unread messages, open suggestions, clients with a completed session but no active care task |
| Care plans | clients who share progress out of active clients; done days out of due days in the last 7 days, only from clients who share |

Not shown on purpose: money (no payments during testing), comparisons with other professionals, and clients' mood or symptom scores.

### Prepare view (`/pro/bookings/<bookingId>`) and week calendar

**Files:** `app/pro/_components/prepare-view.tsx`, route `app/pro/bookings/[bookingId]/page.tsx`, `app/pro/_components/week-calendar.tsx` (List or Week switch in `bookings-view.tsx`). "Prepare" links: the booking window and Home "Today's sessions". `/pro/bookings?open=<id>` opens one booking's window.

**Prepare** is one private page to read before a session. It only reads data that already exists, plus one new note:

| Block | Source |
|---|---|
| Plan for this session (new, private, up to 5000) | provider `prepNotes` / `savePrepNote(bookingId, text)`. Suggested: a `plan` column on `session_notes` (same owner only rules), or its own table with the same RLS |
| Last session (date, outcome, private note) | `appointments` and `session_notes` of this client with this professional |
| Care plan since the last session | `care_tasks` and `care_check_ins` (section 18); check ins only while the client shares progress |
| Answers for this booking | `appointments.intake_note`, `intake_answers` |
| Summary note | the pinned client note (My clients) |
| Messages since the last session | count and unread count from `messages` of that conversation, no message text |
| Shared by the client | symptom checks, only if the client shares them for a booked or completed appointment |

**Week calendar:** Monday to Sunday in Cambodia time, open hours from the schedule shaded, time off shown, sessions placed by start time and length, cancelled sessions hidden, red line for now. Phones show one day at a time. No new data.

**Demo:** the provider starts with a sample summary note and last session note for Sok Dara so these pages are not empty.

### My clients (`/pro/clients` and `/pro/clients/<clientId>`)

**Files:** `app/pro/_data/clients.ts` (`clientsFrom`, `sharingFor`, sample shared data, labels), `app/pro/_components/clients-view.tsx`, `client-file.tsx`, provider `summaryNotes`, `saveSummaryNote`, `archivedClients`, `setClientArchived`. `ProBooking` now has `clientId`, `shareSurvey` and `shareSymptomChecks`.

**Decided:** called "Clients", not "Patients". A professional only ever sees people who booked with them.

| Part | Data | Backend |
|---|---|---|
| Client list | Built from the professional's appointments: name, first session, last session, next session, completed count. Filters: upcoming session, new, not seen in 30 days, past clients | a view or query over `appointments` for `professional_id = auth.uid()` |
| Summary note | One pinned note per client (`summaryNotes[clientId]`), up to 5000 characters | new table, for example `client_summary_notes (professional_id, client_id, text, updated_at)`, readable and writable only by that professional |
| Session notes | Same `session_notes` as My bookings, shown under each session and searchable | as section 16 above |
| Archive | `archivedClients` | a per professional flag (for example `client_relationships.archived_at`); notes are kept |
| Shared by the client | Survey and symptom checks, only when the client turned sharing on for a booked or completed session with this professional | already in the database: `appointments.share_survey`, `share_symptom_checks`, `client_shares_with_me()` and the RLS policies on `onboarding_surveys`, `mental_health_insights`, `symptom_checks` |

**Privacy rules:** no email or phone; never journals, mood logs or detection answers unless shared; notes never readable by admins or clients. Still to decide with Rith: what happens to notes when a client deletes their account (record keeping rules).

**Also found:** `guard_appointment_update()` stops professionals from changing `starts_at`, so "Reschedule" in My bookings needs a new `security definer` function that moves the appointment to another open slot.

### My schedule (`/pro/schedule`)

**Files:** `app/pro/_data/schedule.ts` (types, rules, `openSlots`), `app/pro/_components/schedule-editor.tsx`, provider `schedule` and `saveSchedule`.

`Schedule` = weekly hours (`week`: per weekday, `enabled` and `ranges` of `{ start, end, sessionTypes }` in `HH:MM`, Cambodia time), `sessionMinutes` (45, 60, 90), `breakMinutes` (0, 10, 15), `bookingWindowWeeks` (2, 4, 8), `minNoticeHours` (2, 12, 24), and `timeOff` (`{ from, to, note }` dates, inclusive).

Rules the editor enforces, repeat them on the server:
- Ranges between 06:00 and 22:00, at least one session long, no overlaps on the same day.
- A range's session types must be ones the profile offers.
- Open times = each range cut into `sessionMinutes` steps plus `breakMinutes`, for the booking window, minus time off, minus booked slots, minus anything inside `minNoticeHours`. See `openSlots()`.
- Saving the schedule never cancels sessions already booked.

Backend needs: store the weekly hours, settings and time off (a `professional_schedules` table or jsonb on `professional_profiles`), and keep `availability_slots` filled for the booking window from them (a function run on save and daily). Users book from `availability_slots` (instant booking). "Has open times" is the schedule step of the visibility checklist. The user booking page still shows its own sample days and times until it reads `availability_slots`.


## 17. Messages (client and professional)

**Files:** `app/_components/messages/message-store.ts` (types, in memory mock store, actions), `chat-thread.tsx` (shared chat with voice recorder), `user-messages.tsx` (user side), routes `app/messages/` and `app/messages/[professionalId]`; professional side `app/pro/_components/messages-view.tsx`, routes `app/pro/messages/` and `[clientId]`. Links: sidebar "Messages" (users), `/pro` menu, client file "Message", booking window "Message client". `/messages` is added to `PROTECTED_PREFIXES` in `lib/supabase/proxy.ts`.

### Data shape

| Type | Fields | Suggested table |
|---|---|---|
| `Conversation` | `id` (`<professionalId>:<clientId>`), `professionalId`, `clientId`, names | `conversations (id, professional_id, client_id, created_at, closed_at)`, unique pair |
| `ChatMessage` | `id`, `conversationId`, `sender` (`client`, `professional`), `kind` (`text`, `voice`), `text` (up to 2000), `audioUrl`, `durationSeconds` (up to 120), `createdAt`, `readAt` | `messages`; voice files in a private storage bucket, served with short lived signed URLs |
| Reply time | `few_hours`, `one_day`, `two_days` per professional | a column on `professional_profiles` |

### Rules

- **Who can write:** the client and the professional of a conversation, and only if the client has a booked or completed appointment with that professional. Insert through a `security definer` function that checks this.
- **Who can read:** only those two people. No admin read policy (only community group chats are admin readable, see `AGENTS.md` section 9).
- **Closed:** when the professional archives the client, the conversation is read only (`closed_at`).
- **Read receipts:** `markRead` sets `readAt` on the other person's messages when a chat is opened.
- **Never log message text or audio.** Realtime delivery can use Supabase Realtime on `messages` filtered by conversation.
- **Report or block** for abuse is planned, not built.

**Connected (14 Oct 2026), migration `20261014000700_messages.sql`:**

- **Tables:** `conversations (id, professional_id, client_id, created_at, closed_at)`, unique pair; `messages (id, conversation_id, sender_id, kind text or voice, body, audio_path, duration_seconds, created_at, read_at)`; `professional_profiles.reply_time` (`few_hours`, `one_day`, `two_days`, default `one_day`). RLS: only the two members can select; no insert, update or delete policies, and no admin policy.
- **Functions:** `my_conversations(p_as)` (list for the `client` or `professional` side: everyone with a booking plus existing conversations, last message, unread count, `can_write`), `open_conversation(other, side)`, `send_message(other, side, kind, body, audio_path, duration)`, `mark_conversation_read(conversation)`, `set_client_archived(client, archived)`. Errors use SQLSTATE `PT403` (no booked or completed session, or the professional is suspended), `PT409` (closed), `PT404`.
- **Voice:** private bucket `message-voice`, path `<conversation_id>/<sender_id>/<uuid>.<webm|ogg|m4a>`, 5 MB. Upload only into your own folder of an open conversation you can write in; only members can read; an upload that never became a message can be removed (the API does this when sending fails). The API checks the first bytes of the file. Audio plays through `GET /api/voice/:messageId`, which redirects members to a 5 minute signed URL.
- **API:** client side `GET /api/messages`, `GET|POST /api/messages/:professionalSlug`, `POST .../read`; professional side `GET|PATCH /api/pro/messages` (`PATCH { replyTime }`), `GET|POST /api/pro/messages/:clientId`, `POST .../read`; `POST /api/pro/clients/:clientId { archived }`. `POST` takes JSON `{ kind: "text", text }` or multipart `audio` + `durationSeconds`. `GET /api/pro/me` returns `archivedClients`.
- **Frontend:** `message-store.ts` loads from the API, polls every 10 seconds while a chat is open and every 30 seconds for lists (only while the tab is visible). Hooks `useConversations(side)` and `useThread(conversation, side)`. `DEMO_CLIENT` is no longer used by Messages. The user "Next session" strip reads `GET /api/appointments`.
- **Suggestions and quick replies:** connected in section 19 (`messages.kind = 'suggestion'`, `messages.suggestion_id`, `quick_replies`).
- **Open:** Realtime instead of polling; report or block; what happens to messages and voice files when an account is deleted (rows cascade, files stay in the bucket).
- **Tested** on a local Postgres with stubbed `auth` and `storage`: cancelled only booking cannot write, both sides write after booking, client cannot pose as the professional side, direct inserts refused, read receipts, outsiders and admins see 0 messages and 0 files, voice folder and duplicate rules, archive closes and reopens for both, suspended professional and suspended client refused, anon refused.

## 18. Care plan (tasks between sessions)

**Files:** `app/_components/care/care-store.ts` (types, rules, in memory mock store, actions), `user-care-plan.tsx` and route `app/care-plan/` (user page), `app/components/daily-plan-card.tsx` (home "Your Plan For Today" shows today's tasks), `app/pro/_components/care-plan-card.tsx` (Care plan card and "Give a care task" window in the client file). The booking window in `/pro/bookings` links "Give care tasks" for ended sessions. `/care-plan` is added to `PROTECTED_PREFIXES` in `lib/supabase/proxy.ts`. MindGuide pages accept `?open=<id>` (`/mindguide/learn`, `/mindguide/tips`, `/mindguide/practice`) so a task opens the item directly. To choose a MindGuide item, the professional opens **Browse MindGuide**: the same Learn, Practice and Tips screens users see (`app/pro/_components/mindguide-picker.tsx`), run in a choose mode (`app/_components/mindguide-pick.tsx`) where "Add to plan" becomes "Choose for <client>". Only published items can be chosen, so the backend should return the published MindGuide list to professionals (read only).

### Data shape

| Type | Fields | Suggested table |
|---|---|---|
| `CareTask` | `id`, `professionalId`, `clientId`, `bookingId` (session it was given after, nullable), `kind` (`mindguide`, `mission`, `goal`, `reminder`), `mindguide` (`{ type: lesson, tip or practice, itemId }`, only for kind mindguide), `title` (up to 120, empty for MindGuide), `note` (up to 300), `repeat` (`{ type: 'once' }` or `{ type: 'days', days: 1..7 }`, 1 is Monday), `startDate`, `endDate` (nullable; for a goal it is "reach by"), `reminderTime` (`HH:MM` Cambodia time, nullable, never for goals), `createdAt`, `stoppedAt` | `care_tasks`; `days` as `smallint[]` |
| `CareCheckIn` | `taskId`, `date` (Cambodia date), `doneAt` | `care_check_ins`, unique `(task_id, date)`. A one time task or goal has at most one row |
| Progress sharing | per professional and client, boolean, default off | `care_sharing (professional_id, client_id, share_progress, updated_at)` |

### Rules

- **Who can create or stop a task:** only a professional who has a booked or completed appointment with that client, and not after the client is archived. Insert through a `security definer` function that checks this and that a MindGuide item is published.
- **Who can read tasks:** the client and that professional. No admin read policy.
- **Who can tick:** only the client, only on dates the task is due, never in the future.
- **Who can read check ins:** the client always; the professional only while `share_progress` is on (check it in the RLS policy, not only in the UI). Turning sharing off hides past check ins too.
- **What is due today** (`isDueToday` in `care-store.ts`): active (not stopped, between start and end date); repeating tasks on their weekdays; one time tasks and goals until ticked, and on the day they were ticked.
- **Never log task titles, notes or check ins.**

### Reminders for the Telegram bot (built separately)

The bot needs, for each active task with a `reminderTime`: client id (to find their linked Telegram chat), task title (or the MindGuide item title), `reminderTime`, `repeat`, `startDate`, `endDate`, `stoppedAt`. Send only on due days, skip if already ticked that day, and stop when the task is stopped or ended. The app only stores the time; it sends nothing.

**Connected (15 Oct 2026), migration `20261015000100_care_plans.sql`:**

- **Tables:** `care_tasks` (`repeat_days smallint[]`, null means once; `mindguide_type` and `mindguide_item_id` for MindGuide tasks; `appointment_id` for the session it was given after), `care_check_ins (task_id, check_date, done_at)`, primary key `(task_id, check_date)`, and `care_sharing (professional_id, client_id, share_progress, updated_at)`. RLS: tasks and sharing readable by the client and that professional; check ins by the client, and by the professional only while `share_progress` is on (`can_read_care_check_ins()`), so turning sharing off hides past ticks too. No admin policy, no direct writes.
- **Functions:** `give_care_task(...)` (booked or completed session, client not archived, end date not before today, at most 30 active tasks per client, start date is Cambodia today), `stop_care_task(task)`, `set_care_check_in(task, date, done)` (client only, today or yesterday in Cambodia, only on a due day, one tick for a one time task or goal), `set_care_sharing(professional, share)`, `my_care_professionals()` (name and photo of the professionals who gave the caller tasks). Errors: `PT403`, `PT404`, `22023`.
- **MindGuide items** still live in the code, so the API (`isPublishedMindGuide` in `lib/care.ts`) refuses unpublished items. When section 9 moves content to the database, move this check into `give_care_task()`.
- **API:** client `GET /api/care-plan`, `POST /api/care-plan/check-ins { taskId, date, done }`, `PUT /api/care-plan/sharing { professionalId (slug), share }`; professional `GET|POST /api/pro/care`, `POST /api/pro/care/:taskId/stop`. Each returns the fresh `CarePlanResponse`.
- **Frontend:** types and rules moved to `lib/care.ts` (shared with the API); `care-store.ts` loads per side with `useCareStore('client' | 'professional')`. Ticks and sharing show at once and are saved in the background. `app/_components/demo-client.ts` is deleted (nothing uses it).
- **Telegram bot:** reads `care_tasks.reminder_time`, `repeat_days`, `start_date`, `end_date`, `stopped_at`, and `care_check_ins` to skip days already ticked. It needs its own server side access (not built).
- **Tested** on a local Postgres: give each kind, bad input refused, non client and archived client refused, other professional cannot give, stop or read, client ticks today but not tomorrow or 3 days ago or before the start, one tick for a goal, direct inserts refused, professional sees ticks only while shared and loses them when sharing is turned off, admin sees nothing, anon refused.

## 19. Sessions: meeting links, after the session, suggested and repeating sessions, quick replies

**Files:** `app/_components/sessions/session-store.ts` (shared bookings and suggestions, in memory mock store), `join-button.tsx`, `suggestion-card.tsx` (shown in the chat); `app/pro/_components/suggest-session-dialog.tsx`; changes in `bookings-view.tsx` (meeting link, After the session, series label, Join in rows), `schedule-editor.tsx` (meeting link), `pro-home.tsx` (Join), `client-file.tsx` and `messages-view.tsx` ("Suggest a session"), `app/_components/messages/chat-thread.tsx` (quick replies, suggestion messages), `user-messages.tsx` (Next session strip with Join).

**Bookings are now shared:** `pro-provider.tsx` reads bookings from `session-store.ts` (filtered by `professionalId`) instead of its own state, and the user side reads the same store. Replace the store functions with API calls; the components should not need to change.

### Data shape

| Type | Fields | Suggested table |
|---|---|---|
| `Schedule.meetingUrl` | the professional's default room, `https://` only | a column on `professional_profiles` (or the schedule settings) |
| `ProBooking.meetingUrl` | copied from the default when booked, editable per session | `appointments.meeting_url` (exists) |
| `ProBooking.seriesId` | shared by every session of a repeating series | `appointments.series_id` (nullable) |
| `SessionSuggestion` | `id`, `professionalId`, `clientId`, `sessionType`, `durationMinutes`, `times` (1 to 3 starts), `repeat` (`{ everyWeeks: 1 or 2, count }`), `note` (up to 300), `meetingUrl`, `createdAt`, `status` (`open`, `booked`, `withdrawn`), `chosenTime`, `bookingIds` | `session_suggestions` |
| `ChatMessage.kind = 'suggestion'` + `suggestionId` | the chat message that carries a suggestion | `messages.suggestion_id` (nullable) |
| `QuickReply` | `id`, `text` (up to 500), up to 20 per professional; `{name}`, `{link}`, `{next}` are filled in the browser before sending | `quick_replies (professional_id, text, position)`, readable only by that professional |

### Rules

- **Join:** a session's link is readable only by its client and professional. The Join button opens 10 minutes before the start until the end (`joinState` in `app/pro/_data/schedule.ts`). Changing the default room moves upcoming online sessions that used the old room (or had none).
- **Suggest:** only the client's own professional, only times that are open in their schedule and free for every session of the series, at most 3 times. The client can see the suggestion only in that conversation.
- **Accept** (`acceptSuggestion`): a `security definer` function that, in one transaction, checks the suggestion is open, the time is one of its times and every session of the series is still free, then creates all the appointments with the same `series_id` and marks the suggestion booked. If any time is taken, nothing is booked and the client sees "That time was just taken".
- **Withdraw:** the professional can withdraw an open suggestion.
- **After the session:** outcome first (completed or did not come), then the next steps (care task for completed sessions, suggest the next session), then the private note. Hidden for archived clients.
- **Series:** each session in a series can be cancelled or moved on its own. Cancelling the whole series is not built.

**Connected (15 Oct 2026), migration `20261015000200_sessions.sql`** (run after `20261014000700_messages.sql`):

- **Meeting links, Join and After the session** were already connected in section 16 (`appointments.meeting_url`, the schedule room, outcome and notes).
- **Series:** `appointments.series_id` (the suggestion id), locked by `guard_appointment_update()`. Returned as `ProBooking.seriesId` and `UserAppointment.seriesId`.
- **Open times never overlap a booked session.** A series can reach past the booking window, so later sessions have no open time yet. Trigger `availability_slots_mark_busy` marks a new or changed open time as taken when it overlaps a booked session; trigger `appointments_refresh_slots` recomputes the open times around a session when it is booked, cancelled or moved. This also covers sessions that never had an open time.
- **Suggestions:** table `session_suggestions` (times `timestamptz[]` 1 to 3, `every_weeks` 1 or 2, `session_count` 1 to 8, `duration_minutes`, `note`, `meeting_url` copied from the schedule room for online, `status`, `chosen_time`, `booking_ids`). RLS: client and professional read; no admin read; no direct writes. `suggest_session(...)` (uses `open_conversation`, so the chat must be open and the client must have a booked or completed session; type must be offered; times in the future) also inserts the chat message. `withdraw_session_suggestion(id)`. `accept_session_suggestion(id, time)` books every session of the series in one transaction, linking an open time where one exists; if the professional or the client already has a session overlapping any of them, nothing is booked (`PT409`).
- **The API repeats the dialog's rule** before `suggest_session`: every session of the series must be an open time of the saved schedule, of that type, and free (`openSlots` in `app/pro/_data/schedule.ts`).
- **Quick replies:** table `quick_replies (professional_id, body, position)`, owner read only; `save_quick_replies(text[])` replaces the list (at most 20, 1 to 500 characters). No sample replies are seeded in the database. While a professional has none saved, the chat shows 5 examples (`SAMPLE_QUICK_REPLIES` in `message-store.ts`, frontend only); "Add these to my quick replies" saves them through the same `PUT /api/pro/quick-replies`. No backend change needed.
- **API:** `POST /api/pro/suggestions`, `POST /api/pro/suggestions/:id/withdraw`, `POST /api/suggestions/:id/accept { time }`, `GET|PUT /api/pro/quick-replies`. Chat threads (`GET /api/messages/...`) now return `suggestions` for their suggestion messages. `GET /api/pro/me` returns `openSuggestions` (Home "Needs your attention").
- **Frontend:** types and rules moved to `lib/sessions.ts`; `session-store.ts` keeps the suggestions that arrive with threads and calls the API; the sample bookings in the old store are gone.
- **Still open:** cancelling a whole series at once; Admin Bookings chart still reads its own sample list (section 12).
- **Tested** on a local Postgres: suggest (bad type, past, 4 times, duplicates, 9 sessions, non client refused), the chat message and list preview, accept books 3 weekly sessions with the meeting room and links the open time, accept twice and a time not offered refused, an open time added later inside a series is born taken and freed by cancelling, an overlapping session blocks the whole series (nothing booked), withdraw, series id locked, other users and admins see no suggestions, quick replies limits and owner only access.

## 20. Professional podcasts (`/pro/podcasts`)

**Files:** `app/_components/podcasts/pro-podcast-store.ts` (type, rules, in memory mock store seeded from the sample episodes in `lib/therapists.ts`), `app/pro/_components/podcasts-view.tsx` (list and editor), route `app/pro/podcasts/page.tsx`. User side: `therapist-detail.tsx` shows the newest published episode plus up to 5 more; `therapist-podcast-page-view.tsx` and `app/professional/[slug]/podcast/page.tsx` accept `?episode=<id>` (no 404 when a professional has none); `therapist-podcast-player.tsx` plays the real file when an episode has `audioUrl` and keeps the demo tone for the samples.

### Data shape

`ProEpisode` is `TherapistPodcast` (`lib/therapists.ts`) plus:

| Field | Notes |
|---|---|
| `professionalId` | owner |
| `status` | `draft`, `published`, `hidden` |
| `audioUrl`, `audioName` | file in storage; MP3, M4A, AAC, WAV, OGG or WebM, up to 100 MB and 60 minutes. Duration is read from the file |
| `updatedAt`, `publishedAt` | |
| `episodeNumber`, `kmEpisodeNumber` | given on first publish, continuing the professional's numbering |

Text limits: title 120, short summary 200, topic 60, description 1500, quote 200, key points up to 4 of 160, chapters up to 10 (title 80, start time before the end). Each text has English and Khmer; an empty language is filled from the other on save. Up to 20 episodes per professional.

Suggested table: `professional_episodes` (columns as above, `takeaways` and `chapters` as `jsonb`), audio in a storage bucket where drafts are private to the owner and published files are readable by everyone.

### Rules

- **Who can write:** only the owning professional (approved, role `professional`). Insert and update through RLS on `professional_id = auth.uid()`.
- **Who can read:** published episodes are public; drafts and hidden episodes only the owner.
- **Publish** needs an audio file, a title, a short summary and the three confirmations (store the confirmation time on the row as `confirmed_at`).
- **No admin actions and no reports:** admins cannot hide, edit or delete an episode, and episodes are not a Report a problem target. Do not add an admin policy for updates or deletes.
- The educational note ("For learning only") stays fixed app text on podcast pages.

**Mock today:** episodes live in memory only and reset on refresh; an uploaded file is a temporary browser link, so it plays only in the same tab session.

## 21. Planned next (frontend not built yet)

- **User side, done (14 Oct 2026):** `/appointments` lists the user's own sessions (upcoming, then past and cancelled) with Join for online sessions, the professional's move or cancel reason, cancel with an optional reason (upcoming only, frees the time), and the per booking sharing switches (`set_appointment_sharing()`). Code: `lib/controllers/appointments-controller.ts`, `app/_components/appointments/user-appointments.tsx`. The sidebar "Appointments" item now links there, and "View Appointment" after booking opens it. The Messages "Next session" strip reads the same real appointments (`GET /api/appointments`).
- **Make professional (Way 2):** phone is optional there because the admin already knows the person. Add an optional phone field to `ProfessionalPromotion` when the backend supports it.

## 22. Mood check in and Your Progress (Home)

**Files:** `lib/mood.ts` (types, labels, Cambodia day helpers, shared by the browser and the API), `lib/controllers/mood-controller.ts`, `app/api/mood-checkins/route.ts`, `app/api/progress/route.ts`, `app/_components/mood/mood-store.ts` (loads the week, saves today's mood), `app/components/mood-selector.tsx` (How are you feeling today?), `app/components/progress-dashboard.tsx` (Your Progress), `app/detection/journal/page.tsx` (starts from today's check in).

### Data shape

| Type | Fields | Table |
|---|---|---|
| `MoodLevel` | `very_low`, `low`, `okay`, `good`, `great` (the existing `mood_level` enum) | none |
| `MoodDay` | `day` (Cambodia date), `mood` (`MoodLevel` or null on a day without a check in) | `mood_checkins` |
| `MoodWeekResponse` | `days` (last 7 Cambodia days, oldest first, today last), `checkIns` (days with a check in) | read from `mood_checkins` |

### Rules (decided, do not change)

- **One mood per person per Cambodia day.** Tapping another mood the same day replaces the first. The day comes from `cambodia_today()` on the server, never from the browser.
- **A mood is private health data.** It never goes in a URL, in browser storage or in a log. The old `arom_today_mood` key in `localStorage` is removed on the first visit. The journal reads today's mood from the API, not from `?mood=`.
- **Nothing is preselected.** "Saved" shows only after the server confirms the save. A tap selects and saves; it never leaves the page.
- **No made up data.** Signed out visitors see a card that asks them to log in. A new account sees an empty state. Missed days stay blank in the chart, never zero. The summary counts check ins and never says better or worse.
- **Responses carry only the day and the mood**, never notes or emotions, and are sent with `Cache-Control: private, no-store`.
- **No admin read.** Admin Overview may later show counts only.

**Connected (15 Oct 2026), migration `20261015000400_mood_checkins_api.sql`:**

- **Table:** existing `mood_checkins` (owner only RLS from `20261008000200`). The migration sets `checked_in_on` to default to `cambodia_today()`, keeps only the latest row of each day, and adds the unique index `mood_checkins_one_per_day (user_id, checked_in_on)`.
- **Function:** `save_mood_checkin(p_mood, p_source)`, `security definer`, `search_path = ''`, owner from `auth.uid()`, execute for `authenticated` only. Upserts today's row and returns the Cambodia day. Errors: `PT403` (not signed in), `22023` (unknown source).
- **API:** `POST /api/mood-checkins { mood, source? }` returns `{ day, mood }`; `GET /api/progress` returns `MoodWeekResponse`. Both answer 401 when signed out.
- **Journal (connected 16 Oct 2026):** `GET|POST /api/journal`, `DELETE /api/journal/:id` (`lib/journal.ts`), owner only RLS, never professionals or admins. The journal page no longer shows sample entries. Entries an older version kept in `localStorage` (`arom_journal_entries`) are moved to the account only when the person agrees in a confirm window, because they may belong to someone else who used the device; the key is cleared once they move. Deleting an entry asks first. `entry_date` defaults to Cambodia today.
- **Applied** to Supabase on 16 Oct 2026. Not yet tested signed in on the live site.

### Progress pages `/progress` and `/progress/details` (15 Oct 2026, from Figma)

**Files:** `app/progress/page.tsx`, `app/progress/details/page.tsx`, `app/progress/_components/*` (views, charts, `use-progress.ts`), `use-activities.ts`, `app/_components/mood/mood-visuals.ts` (mood icons and chart colors, shared with the Home check in), `lib/mood.ts` (`PROGRESS_RANGES`, `RANGE_DAYS`, `moodCounts()`). The sidebar "Progress Dashboard" item and Home "See all" link open `/progress`.

**Where each part gets its data (all real since 16 Oct 2026):**

| Part | Data |
|---|---|
| 7 days: Mood Trend, Mood Statistics bars, Mood Distribution, summary card | Real, `GET /api/progress` |
| 30 days and 3 months in Mood Statistics | Month calendars, each day colored by its mood, grey when missed (`mood-calendar.tsx`). Same data as the ranges below |
| Today's Check in card | Real, today from the same response |
| 30 days and 3 months | Real, `GET /api/progress?range=30d\|90d`, loaded the first time the range is chosen and kept in `mood-store.ts` |
| Insights tab | Worked out in the browser from the same check ins (`app/progress/_components/insights.ts`): real for every range. Facts only: check in count, most common mood, the span of moods, the weekday checked in most (30 days or more, only when one weekday clearly leads), and how many days were Low or Very Low. **Backend later:** a "time of day you check in" insight needs the check in time (`created_at` of `mood_checkins`) in the progress response |
| Activities tab | Real, `GET /api/progress/activities?range=` (`lib/activities.ts`). Counts of practices done, lessons read and journal entries, plus a Recent list (practice and lesson names come from `ALL_PRACTICES` and `ALL_LESSONS`; a journal entry is only a date, never its words) |

**Activities, connected (16 Oct 2026):** `activity_log (user_id, kind, ref_id, done_on)`, one row per practice or lesson per Cambodia day, owner reads, written only by `log_activity()`. The practice and lesson completion screens call `POST /api/activities` (`app/_components/activity-log.ts`); the API checks the id is a real item. Journal days come from `journal_entries.entry_date`, never the text.

**Share my mood check ins with my professional (connected 16 Oct 2026).** Rith decided: **off by default, moods only (never the journal, never notes), the client can turn it off at any time.**
- **Client side:** My appointments has a third sharing option "My mood check ins" ("Your last 30 days of moods. Moods only, never your journal."), sent with the `sharing` action as `shareMoodTrend` (`app/_components/appointments/user-appointments.tsx`).
- **Professional side:** the client file shows the "Mood check ins" card with the real last 30 days only while the client shares, otherwise "This client has not shared their moods" (`app/pro/_components/shared-moods.tsx`).
- **Backend:** `appointments.share_mood_trend` (default off), set only through `set_appointment_sharing(appointment, survey, symptoms, moods)` and locked in `guard_appointment_update()`. `shared_mood_checkins(client)` (`security definer`) returns `(day, mood)` for the last 30 Cambodia days, only while that client shares on a booked or completed session with the caller; nothing is copied, so turning it off stops it at once. No admin read.

**Ranges, connected (16 Oct 2026):** `GET /api/progress?range=7d|30d|90d` returns `MoodWeekResponse`, one entry per Cambodia day, oldest first, today last, `mood` null on a missed day. Without `range` it is 7 days. `app/progress/_data/` is deleted.

**Decided with Rith (changes from the Figma, do not undo):**

- **Honest wording only.** No "You're doing great", "Feeling better than last week" or "more positive this week". The cards count check ins ("You checked in 5 of the last 7 days").
- **The app's 5 moods** (Very Low to Great), not the 4 in the Figma (Happy, Calm, Neutral, Sad).
- **One mood per day:** a bar's height is that day's mood, and tapping it shows the mood name. No percentages per day.
- **One range switch:** 7 days, 30 days, 3 months (the Figma's Week, Month, Year is gone).
- **No sparkles:** the mascot (`public/progress/mascot.png`, from the Figma) had its three star shapes removed, as AGENTS.md section 7 requires.
- **Support card (decided 16 Oct 2026):** when 3 or more of the real last 7 check ins are Low or Very Low, the dashboard shows "Some of your recent days were hard. You don't have to handle it alone." with Breathing practice, Talk to a professional and Get help now (`support-card.tsx`, `SUPPORT_MIN_HARD_DAYS`). Never from sample data. "Not now" hides it for that visit only; nothing is saved or sent. No backend needed.

## 23. Community: groups, chat moderation and reports

**Files:** user side `app/community/page.tsx`, `community-data.ts` (types), `community-store.ts` (mock store in localStorage, shared with admin), `components/create-group-view.tsx`, `components/report-dialog.tsx`, `components/group-hub-view.tsx` (report entry points, closed state). Admin side `app/admin/_data/community.ts`, `_components/community-view.tsx` (View chat, Shut down, Reopen, reports), actions in `admin-provider.tsx`.

**Moderation connected (17 Oct 2026), migration `20261017000500_community_moderation.sql`:**

- **Shut down and reopen:** `admin_set_group_closed()` (reason required, admins only see it). A closed group leaves Browse; its members still find and read it (new RLS rule), nobody can send (the insert policy checks it) or join.
- **Reports:** `community_reports` (no direct access). `submit_community_report()`: members and the mentor of that group only, 5 a day, a message or image report must point at a message in that group, nobody reports their own message. A report on a person is linked to them through their message; without a message only the report closes.
- **Resolving:** `admin_resolve_community_report(id, dismissed | removed)`. Remove hides the message or image (members see "removed", the text is not sent to them), takes the person out of the group for good (they cannot rejoin), or shuts a reported group down.
- **Groups:** `admin_list_groups()`, `admin_save_group()` (create or edit; the mentor must be a verified, active professional; capacity 2 to 10 and never below the current members). Every action is audit logged. Per group rules and an "anonymous" switch are not stored: every group uses the standard rules, and members choose Hide my identity in Profile.
- **API:** `GET|POST /api/admin/community/groups`, `POST /api/admin/community/groups/:id/close { reason }`, `POST .../reopen`, `GET /api/admin/community/reports`, `POST /api/admin/community/reports/:id/resolve { status }`, `POST /api/community/reports`. View chat uses the audited `GET /api/admin/community/groups/:id/messages`. Controller `lib/controllers/community-admin-controller.ts`.
- **Still sample:** group activities in the admin Community page, and the demo groups and members that `/community` shows next to the real ones (Rith).

### Data shape

`SupportGroup` (user side) gains:

| Field | Type | Notes |
|---|---|---|
| `status` | `'active' \| 'closed'` | derived from closures |
| `createdBy` | `'admin' \| 'professional'` | new column on groups |

`AdminGroup` gains `status: 'active' | 'closed'` (replaces the old `archived`), `closedReason?`, `createdBy`, `creatorName`.

Removals: `{ messageId, removedAt }` for messages and images, `{ groupId, memberLabel, memberId?, removedAt }` for people. In the mock, people are matched by their display label inside the group; the backend should use the real user id.

A closure: `{ groupId, reason, closedAt }`. Suggested columns on the groups table: `closed_at`, `closed_by`, `closed_reason` (reason is admin only, never returned to members).

A report sent by a user (`StoredCommunityReport`):

| Field | Type | Notes |
|---|---|---|
| `target` | `{ kind: 'member', groupId, memberLabel, memberId?, messageId? }`, `{ kind: 'message' \| 'image', groupId, messageId }` or `{ kind: 'group', groupId }` | A reference, never a copy of the content. A member report from a chat message carries `messageId` so the backend can find the real sender |
| `reason` | `'harassment' \| 'spam' \| 'harmful' \| 'inappropriate_image' \| 'safety_concern' \| 'other'` | Which reasons show depends on `kind` |
| `note` | string, up to 300 characters, optional | The form asks users not to write personal or health details |
| `createdAt` | ISO string | |

The admin list uses `CommunityReport`: `id, groupId, targetKind, targetLabel, messageId?, messagePreview, reason (label), note, createdAt, status ('pending' | 'dismissed' | 'removed')`.

### Actions

| Frontend action | Who | Meaning | Suggested backend |
|---|---|---|---|
| `saveCreatedGroup(group)` from the Community "Create a group" button | `professional`, `admin` | Create a live group; the creator becomes mentor and member | `POST /api/community/groups`. Check the role on the server; set `created_by` and the mentor from the session, never from the body |
| admin `saveGroup` (new record) | `admin` | Admin "Add group" also publishes to users | same endpoint |
| `shutDownGroup(id, reason)` | `admin` | Close the group, reason required | `POST /api/admin/community/groups/:id/close`, audit log entry |
| `reopenGroup(id)` | `admin` | Reopen | `POST /api/admin/community/groups/:id/reopen`, audit log entry |
| `communityMessages` (View chat) | `admin` | Read every message of one group, read only, including images and file names | `GET /api/admin/community/groups/:id/messages`. **Write an audit log entry on every call** (who, which group, when) |
| `submitCommunityReport({ target, reason, note })` | signed in member of that group | Returns `'sent'` or `'daily_limit'` | `security definer` function: checks the target exists and the reporter is a member, 5 reports per user per day, keeps the reporter id only for that limit |
| `resolveCommunityReport(id, 'dismissed')` | `admin` | Close a report, nothing changes in the group | admin only, audit log entry |
| `resolveCommunityReport(id, 'removed')` on a message or image report (`removeMessage`) | `admin` | Hide that message for every member. Members see "This message was removed by the AROM team."; admins still see the original in View chat, marked Removed | `POST /api/admin/community/messages/:id/remove`: set `removed_at`, `removed_by` on the message (keep the row for moderation), audit log entry. Member reads must return the placeholder flag only, never the removed text or image URL |
| `resolveCommunityReport(id, 'removed')` on a person report (`removeMember`) | `admin` | Take that person out of the group. They disappear from the member list; their past messages stay | `POST /api/admin/community/groups/:id/members/:userId/remove`, audit log entry. Resolve the real user from the reported message's sender on the server. They cannot rejoin unless an admin allows it |
| group reports | `admin` | No remove button; use Shut down | none |

### Rules for the backend

- **RLS:** members read and send messages only in groups they joined; nobody can send to a closed group (check it in the insert policy, not only in the UI); only admins read any group's messages, through the audited endpoint.
- **Never return the reporter id** to the admin UI.
- **Anonymous names stay anonymous** in member screens. The server can link a report to the real account for moderation (for example suspending), but the admin UI shows the anonymous label today.
- **Closed groups** are left out of browse and search, and joining one is refused.

**Sample groups removed from the user page (18 Oct 2026):** `/community` shows only real groups from `GET /api/community/groups`. The four sample groups, their messages, members and activities in `community-data.ts` are no longer shown to users, because nobody real answers in them. Signed out visitors see "Log in to join a support group"; with no groups yet, users see "No support groups yet" and professionals are pointed to Create a group. "Recommended for you" is the first open real group the user has not joined. Group activities stay empty until they have a backend. The admin Community page (`app/admin/_data/community.ts`) still uses the sample data for group activities.

**Partly connected (15 and 16 Oct 2026), migrations `20261016000000` to `20261016000700`:**

- **API:** `GET|POST /api/community/groups` (browse and create), `POST /api/community/groups/:id/join`, `GET|POST /api/community/groups/:id/messages` (chat read and send).
- **Tables and functions:** `community_messages` (raw rows readable only by the author and admins), `read_community_messages(group)` returns messages with display names and never the author id. `profiles.hide_identity` (default on) shows a member as "Anonymous" in Community only. Mentors no longer read raw member, waitlist, reply or check in rows. Only admins read raw safety flags.
- **Professionals** saw clients by `privacy_mode` (Anonymous Mode), never by `hide_identity`. Section 29 changes this to `hide_identity`, and that choice is still open for the team (see section 29, Decision needed).

### Backend gaps

1. **Admin chat reads (done 16 Oct 2026, migration `20261016001100`):** admins open a chat only through `GET /api/admin/community/groups/:id/messages?reason=`, which calls `admin_read_community_messages()`. Every open writes `read_group_chat` to `admin_audit_log` (the reason, never message text). Admins can no longer read raw `community_messages` rows or use the member function. The admin Community page still shows its browser data and should switch to this endpoint.
2. **Done (17 Oct 2026):** shut down, reopen, reports, removing a message or person and the admin Community page use the database. Still open: chat images need a private storage bucket readable by members of that group and by admins.
3. Professionals have no "My groups" list yet; it belongs in `/pro`.
4. **Done:** admin edits to a group are saved in the database and show on `/community`.

## 24. Client changes the time of a session (My appointments)

**Status: written, migration `20261015001500_client_reschedule.sql` NOT yet applied to Supabase.** Branch `rith/client-change-time`. Merge only after the migration runs: `GET /api/appointments` and the professional's bookings select the new `rescheduled_by` column and fail without it.

**Files:** `supabase/migrations/20261015001500_client_reschedule.sql`, `lib/controllers/appointments-controller.ts` (`listMoveTimes`, `reschedule` action), `app/api/appointments/[id]/open-times/route.ts`, `app/_components/appointments/change-time-panel.tsx`, `app/_components/therapist-booking.tsx` (`TimeStep` now exported for reuse), `lib/controllers/pro-controller.ts` and `app/pro/_components/bookings-view.tsx` (shows who moved it).

### Data shape

| Type | Fields | Table |
|---|---|---|
| `UserAppointment.rescheduledBy` | `"you"`, `"professional"` or null when never moved | `appointments.rescheduled_by` |
| `UserAppointment.changeTimeUntil` | ISO time: the start minus the professional's minimum notice; null when not upcoming | `my_change_time_deadlines()` |
| `ProBooking.rescheduledBy` | `'client'`, `'professional'` or null | `appointments.rescheduled_by` |
| `MoveTimesResponse` | `times`: `{ id, startsAt, endsAt }[]` | `availability_slots` via `public_open_slots()` |

### Actions

- `GET /api/appointments/:id/open-times`: the professional's open times for the same session type, minimum notice applied. Only the client's own upcoming session.
- `POST /api/appointments/:id { action: "reschedule", slotId, reason? }`: calls `client_reschedule_appointment()`, returns the updated `AppointmentsResponse`. Answers 409 with a user facing message when the time was just taken or is too soon.

### Rules (decided)

- **Same professional, same session type,** any open time outside the minimum notice. The meeting link stays the same.
- **Allowed until the professional's minimum notice before the session** (for example 24 hours before), because the professional may already have prepared. Cancelling stays open until the session starts. Inside the notice the card says "It is too close to your session to change the time. You can still cancel it, or message your professional." The reason is optional (up to 300 characters) and the professional sees it.
- **The deadline comes from `my_change_time_deadlines()`** (`security definer`, the caller's own upcoming sessions only), because clients cannot read `professional_schedules`. Only the deadline leaves the function, never the schedule.
- **One transaction:** the appointment moves and the `appointments_refresh_slots` trigger frees the old open time and takes the new one. If two people pick the same time, the second gets "This time is no longer available".
- **Who moved it is recorded** in `rescheduled_by`. The client sees "You moved this session from ..." or "Your professional moved this session from ...". The professional sees "The client moved this session from ...". `rescheduled_from` keeps the very first time.
- **`reschedule_appointment()` (professional) and `guard_appointment_update()` are replaced** with the same bodies plus `rescheduled_by`. Both matched the live database before this change.
- **Tested** on a local Postgres (PGlite) with the real trigger code: 30 checks for moving, taken times, other people's sessions, other professionals, minimum notice for the new time and for the session itself, the deadlines function, session type, reason length, cancelled sessions, the professional's version, the guard and grants. Not yet tested against Supabase or in the running app.
- **Not built:** a notice to the professional beyond the bookings list (no message or email is sent).


## 25. Address for in person sessions

**Status: written, migration `20261015001600_in_person_address.sql` NOT yet applied to Supabase.** Branch `rith/in-person-address`. Merge only after the migration runs: My profile, the public directory and My appointments select the new columns and fail without them. Section 24 (client change time, PR #11) is a separate branch; whichever merges second may need a small merge in `appointments-controller.ts`, `lib/appointments.ts` and `user-appointments.tsx`.

**Files:** `supabase/migrations/20261015001600_in_person_address.sql`, `lib/office.ts` (type, limits, map link), `app/_components/office-card.tsx`, `app/pro/_components/profile-editor.tsx` (fields under How you meet clients), `app/pro/_components/pro-home.tsx` (reminder), `lib/controllers/pro-controller.ts`, `lib/professionals.ts`, `app/_components/therapist-detail.tsx`, `app/_components/therapist-booking.tsx`, `lib/controllers/appointments-controller.ts`, `app/_components/appointments/*`.

### Data shape (`OfficeLocation`)

| Field | Type | Column |
|---|---|---|
| `name` | string, optional, up to 120 | `professional_profiles.office_name` |
| `address` | string, up to 300, required to offer in person | `professional_profiles.office_address` |
| `mapUrl` | https link, optional, up to 500 | `professional_profiles.office_map_url` |

`ProProfile.office`, `Therapist.office` (only when in person is offered), `AppointmentProfessional.office` (null without an address).

### Rules (decided by Rith, 15 Oct 2026)

- **The professional types their own place** in My profile. The admin managed `clinics` table (0 rows) stays unused.
- **Everyone can see it** on the public profile, the booking page and My appointments.
- **No admin review.** It saves at once, like the bio (not in `REVIEWED_FIELDS`).
- **An address is required to offer in person.** My profile refuses to save In person without one (`PATCH /api/pro/profile` answers 400 too). Without an address, the public profile and booking page offer online only, and the trigger `appointments_require_office` refuses any new in person booking (`book_appointment()`, `accept_session_suggestion()` and later paths). Bookings that already exist are not touched.
- **Map link:** the professional's own https link, or a Google Maps search for the place name and address when there is none. Any other link is ignored.
- **`list_public_professionals()`** returns `office_name`, `office_address`, `office_map_url`. It is dropped and created again (the return type changes) with the same body as file `20261014000400`, which matched the live database.
- **Tested** on a local Postgres (PGlite) with the real `is_listed_professional()`: 18 checks for the public list, booking with and without an address, blank addresses, length and https limits, existing bookings and grants. Not yet tested against Supabase or in the running app.
- **Today:** 56 in person open times exist without an address. After the migration their professionals see a reminder on Home, and users can only book them online until an address is added.

## 26. Journal prompts (admin page and journal questions)

**Connected (16 Oct 2026), PR #16, migration `20261016001200_journal_prompts.sql` applied to Supabase.**

**Files:** `lib/journal.ts` (`JournalPrompt`, `journalPromptSchema`), `lib/controllers/journal-prompts-controller.ts`, `app/api/journal-prompts/route.ts`, `app/api/admin/journal-prompts/route.ts`, `app/admin/_components/journal-prompts-view.tsx`, actions in `admin-provider.tsx`, journal page `app/detection/journal/page.tsx`.

### Data shape (`JournalPrompt`, also `AdminJournalPrompt`)

| Field | Type | Database source |
|---|---|---|
| `id` | string (uuid) | `journal_prompts.id` |
| `question` | string, 1 to 300 | `journal_prompts.question` |
| `kmQuestion` | string, 1 to 300 | `journal_prompts.question_km` |
| `placeholder` | string, up to 400 | `journal_prompts.placeholder` |
| `kmPlaceholder` | string, up to 500 | `journal_prompts.placeholder_km` |
| `order` | whole number, 1 or more, unique | `journal_prompts.sort_order` |
| `isActive` | boolean | `journal_prompts.is_active` |

### Endpoints

| Endpoint | Who | What |
|---|---|---|
| `GET /api/journal-prompts` | Anyone | Active prompts in display order, `{ prompts }` |
| `GET /api/admin/journal-prompts` | Admin | Every prompt, inactive ones too |
| `PUT /api/admin/journal-prompts` body `{ prompt }` | Admin | Adds or updates one prompt (activate and deactivate too) through `save_journal_prompt()`, returns the full list |

### Rules

- **Active prompts are the journal's guided questions,** in the admin's order. They replace the two questions that were written into the page. If the list cannot be loaded, the page keeps those two. Questions a person has started answering are never replaced. The "add a question" presets on the journal page stay in the page code.
- **Up to 10 active prompts,** because a saved journal entry holds up to 20 questions and people can add their own. The 300 character limit on questions matches what a journal entry accepts.
- **Display order is unique.** The admin form checks it, and the database refuses a used number with a message the admin sees.
- **No delete.** Admins make a prompt inactive instead. Old journal entries keep their own copy of the question text, so editing a prompt never changes past entries.
- **RLS:** anyone reads active prompts, admins read all. There are no write policies. Writes only go through `save_journal_prompt()` (`security definer`, admin only), which logs `save_journal_prompt` to `admin_audit_log`. The Audit log page shows it as Added, Edited, Activated or Deactivated journal prompt.
- **Starting data:** the migration adds the two questions the journal showed before (active) and the gratitude question (inactive).
- **Tested** on a local Postgres (PGlite): seed rows, add, edit, deactivate, used order refused, an 11th active prompt refused, non admin refused, audit log rows, RLS on. Applied to Supabase and checked there: 3 prompts (2 active), RLS on, 2 policies, signed out visitors cannot call the save function. Not yet clicked through in the running app.

## 27. Your Plan For Today as a to do list (Home)

**Connected (16 Oct 2026), PR #17, migration `20261016001300_plan_tasks.sql` applied to Supabase by Rith.**

**Files:** `lib/plan.ts` (types, rules, ideas, starter tasks), `lib/controllers/plan-controller.ts`, routes under `app/api/plan/`, `app/_components/daily-plan-store.ts` (in memory store, no browser storage), `app/components/daily-plan-card.tsx` (Home card), `app/components/plan-editor-dialog.tsx` (Add and My tasks window), `app/components/plan-task-icon.tsx`, `app/components/plan-mindguide-items.ts`, `app/_components/tips/tips-plan.ts` (Tips "Try now" add to plan).

### Data shape (`PlanTask`)

| Field | Type | Database source |
|---|---|---|
| `id` | uuid | `plan_tasks.id` |
| `itemKey` | string | `plan_tasks.item_key`, unique per person ("lesson-3", "tip-try-now-2", "suggest:water", "custom:<uuid>", "starter:lesson") |
| `source` | custom, suggestion, starter, learn, practice, mindguide, guide, tip | `plan_tasks.source` |
| `title`, `titleKm`, `subtitle`, `subtitleKm` | strings | same columns |
| `href` | AROM page or null | `plan_tasks.href` (must start with one `/`) |
| `icon` | icon key or null | `plan_tasks.icon` |
| `repeat` | daily, weekdays, once | `plan_tasks.repeat` |
| `weekdays` | 0 Sunday to 6 Saturday | `plan_tasks.weekdays` |
| `onceDay` | Cambodia date | `plan_tasks.once_day` |
| `doneToday` | boolean | a `plan_task_checks` row for today's Cambodia date |

### Endpoints (signed in person only, their own rows)

| Endpoint | What |
|---|---|
| `GET /api/plan` | All tasks with `doneToday`. The first call ever adds the starter tasks (recorded in `plan_starts`, so deleting them all is final). "Today only" tasks from earlier days are deleted. |
| `POST /api/plan/tasks` | Adds a task at the end. 409 if the item key is already in the plan. |
| `PATCH /api/plan/tasks/:id` | Renames it or changes how often it repeats. |
| `DELETE /api/plan/tasks/:id` | Deletes it and its checks. |
| `PUT /api/plan/tasks/:id/check` `{ done }` | Ticks or unticks it for today. |
| `PUT /api/plan/order` `{ ids }` | Saves a new order. |

### Rules (decided by Rith, 16 Oct 2026)

- **Every day starts fresh.** A check belongs to one Cambodia date. Nothing carries over as overdue and nothing counts missed days.
- **Done looks done:** a line through the words and a green check. Tap again to undo.
- **The mood check in and tasks from the person's professional stay in the list automatically** (from real data). Lessons and practices finished today tick their tasks by themselves (`activity_log`).
- **Starter tasks** (MindGuide lesson, guided meditation, try now, drink water) are ordinary tasks the person can delete.
- **Up to 30 tasks** (trigger `plan_tasks_limit`). Titles up to 120 characters.
- **Private:** RLS lets only the owner read or change tasks and checks. No professional or admin access. Never log task text.
- **Old browser data:** items an older version kept in `localStorage` are moved into the account once, then removed from the browser.
- The older `plan_items` table (one item per date) is not used by this feature.
- **Tested** on a local Postgres (PGlite): adding, links (`//other.site` refused), the weekdays rule, duplicate keys, the 30 task limit, checks cascading on delete, and that a second person cannot see, tick, edit or delete the first person's tasks or add tasks in their name. Applied to Supabase and checked there: the three tables with RLS on, 9 policies, the limit and update triggers. Not yet clicked through in the running app with real tasks.

## 28. Play with friends (game hub)

**Done (17 Oct 2026). No backend needed.**

**Files:** `app/play-cards/layout.tsx` (shared players), `app/play-cards/page.tsx` (hub), `mental-health/`, `truth-or-dare/`, `guess-animal/` pages, `app/play-cards/_data/` (`cards.ts` 71 mental health cards, `truth-or-dare.ts` 48 truths and dares, `animals.ts` 40 animals, all in English and Khmer), `app/play-cards/_components/` (hub, the three games, bold style in `bold.ts` and `bold-parts.tsx`). Sidebar entry in `app/_components/navigation-config.ts`; `/play-cards` and everything under it is in `PROTECTED_PREFIXES` (login required).

### How it works

- **Hub (`/play-cards`):** the host adds friends once (2 to 8 players, in memory only) and picks a game. Bold look chosen by Rith: thick outlines, hard shadows, bright colors.
- **Mental health cards (`/play-cards/mental-health`):** the original game. Deck (Journey or one level: Warm up, Getting real, Care) and length, house rules, flip the card, swipe right for Done and left for Pass, Lighter card, "Need support?" on deeper cards, breathing cards, end screen.
- **Truth or dare (`/play-cards/truth-or-dare`):** Chill or Silly, 10 to 30 turns. Each turn the player picks Truth or Dare; Pass gives another of the same kind, Switch changes the kind. Truths are light, dares are silly but safe: nothing dangerous, no touching, nothing embarrassing, nothing posted online.
- **Guess the animal (`/play-cards/guess-animal`):** 45, 60 or 90 seconds per turn, 1 to 3 times around the table. Only the player looks; they act, make sounds or give clues; Got it or Skip; a friendly total at the end, no winners.
- Every game has How to play, an English / Khmer switch, and "Plan the next hangout" at the end (adds a today only task, section 27).

### Rules (decided by Rith, 17 Oct 2026)

- **Nothing is saved.** Names and answers stay in the page's memory and are gone when the game ends. No cards, names or answers are sent to the server.
- **No points and no winners.**
- **"Getting real" and "Care" cards must be checked by an AROM professional before launch.** The cards are drafts by Claude.

### Later (not built)

1. Admins manage decks in English and Khmer (like journal prompts, section 26).
2. A "played a card game" count in Progress activities (needs a new `activity_log` kind).
3. Online rooms: friends join on their own phones with a code (needs realtime).

## 29. Anonymous identity protection

**Status:** written by Sokheng on `feature/anonymous-privacy`, merged with main through PR #19 (18 Oct 2026) and live. This section replaces older descriptions in sections 16 to 19 wherever they mention real client ids, direct professional table reads, `my_client_names()` or signed voice links.

### Identity rules

- The user privacy switch ("Hide my identity" in Profile settings) reads and writes `profiles.hide_identity`.
- `hide_identity = true` shows the client as "Anonymous" in the professional booking and client screens.
- `privacy_mode` is an older field. A migration copied older anonymous choices into `hide_identity`; the name functions now use `hide_identity`.
- Client ids that professionals see are aliases, one per professional and client pair, never `profiles.id`. The mapping lives in `professional_client_aliases`, which browsers cannot read.
- Turning anonymity off does not change the alias.
- Professionals see the booking note ("Note for Therapist") and intake answers of every client, anonymous or not, because the client writes them for that professional. Anonymous mode hides who the client is, not what they tell their therapist (Rith, 18 Oct 2026, `20261018070000_show_intake_for_anonymous.sql`). Before that file, anonymous clients' notes and answers came back empty.
- Anonymity gives admins no extra access to private messages, session notes, journals or other wellbeing content.
- Clients can still identify themselves in message text, voice, calls or other free text. Anonymous Mode does not hide that.

### Decision needed

`hide_identity` is on by default, so with this rule most clients show as "Anonymous" to their own professional unless they turn the switch off. Section 23 previously followed `privacy_mode` for professionals (only Community used `hide_identity`). Rith chose to merge with Sokheng's rule because it is what the live database already does. Rith, Sokheng and Hok Chheng should confirm it together.

### Protected functions

HTTP routes stay the same. The controllers call functions that check the signed in account and resolve aliases inside the database.

| Area | Functions used by the controllers |
|---|---|
| Professional bookings | `read_my_pro_bookings_safe`, `owns_professional_appointment`, `update_pro_booking_safe` |
| Schedule and open times | `my_upcoming_booked_times`, `refresh_pro_meeting_links_safe` |
| Conversations and messages | `my_conversations_safe`, `read_private_messages_safe`, `open_conversation_safe`, `send_message_safe` |
| Client names and archive | `my_message_client_names`, `my_archived_client_aliases`, `set_client_archived_safe` |
| Summary notes | `my_client_summary_notes_safe`, `save_client_summary_note_safe` |
| Shared survey and symptom checks | `get_shared_client_data_safe` |
| Shared mood trend | `shared_mood_checkins_safe` (added in the merge) |
| Suggestions | `suggest_session_safe`, `withdraw_session_suggestion_safe`, `read_session_suggestions_safe` |
| Care plans | `read_pro_care_plan_safe`, `give_care_task_safe` |
| Appointment sharing (client) | `set_appointment_sharing` with four choices, as on main. Sokheng's three choice `set_appointment_sharing_safe` stays in the database but the merged code does not use it |

Several original functions remain for internal use, with direct execution revoked. Do not restore their grants or switch the controllers back to them.

### Table access

- Professionals no longer read raw appointments, conversations, messages, summary notes, suggestions, care tasks, sharing rows or shared health data.
- Clients keep reading their own appointments, care tasks, check ins, surveys, symptom checks and moods.
- Survey, symptom check and mood trend sharing stay separate from Anonymous Mode.
- Care progress reaches the professional only while progress sharing is on. Turning it off hides earlier check ins too.
- Session note and prep note policies use `owns_professional_appointment()`.

### Voice playback

`GET /api/voice/:messageId` now sends the audio through the server instead of redirecting to a signed storage link. It signs the caller in, reads the message with the server only client (`lib/supabase/private-storage.ts`), checks conversation membership as the caller, and only then returns the audio. Voice storage reads are limited to the sender's own files; recipients use the API.

**Needs `SUPABASE_SECRET_KEY`** in `.env.local` and on Vercel. Never commit it or prefix it with `NEXT_PUBLIC_`.

### Migrations

- Hok Chheng's `20261016000000` to `20261016000700` names are kept. Sokheng's second renames of those files were dropped in the merge.
- Sokheng's new files that were numbered `20261015001600` to `20261015002600` are now `20261017000900` to `20261017001900`, same order. They need `professional_client_aliases` (from `20261016000600`), and `20261015001600` was already used by `in_person_address`.
- `20261018060000_merge_privacy_with_main.sql` (new in the merge): adds `rescheduledBy` and `shareMoodTrend` to `read_my_pro_bookings_safe()`, and adds `shared_mood_checkins_safe(alias)`.
- `20261018070000_show_intake_for_anonymous.sql`: `read_my_pro_bookings_safe()` returns the intake note and answers for anonymous clients too. Run after the merge file.
- **Applied 18 Oct** by Rith in the SQL Editor: `20261017001100`, `20261017001200` and the merge migration. Everything else in this section was applied by hand earlier. The project has no migration history, so do not rerun every file on it.
- **Not applied yet:** `20261018070000_show_intake_for_anonymous.sql` (PR for the intake fix). Until it runs, anonymous clients' booking notes and intake answers stay hidden from their professional.

### Still open

- The community chat returns the oldest 100 messages instead of the newest 100 (`read_community_messages`, latest in `20261017000500`). Sokheng fixed this in an older file that later migrations replace, so the fix needs a new migration based on the latest version.
- `shared_mood_checkins(client id)` still accepts a real client id. Nothing in the merged code calls it directly; revoke it once the alias version is live.
- **Telling anonymous clients apart: done 18 Oct.** Pro screens show anonymous clients as "Anonymous #4821" (Khmer "អនាមិក #4821"), a 4 digit number made from the alias id in `anonymousLabel()` (`app/pro/_data/clients.ts`). Applied once in `pro-provider.tsx`, so every pro screen uses it. Frontend only; the server still returns "Anonymous". Two anonymous clients of one professional can rarely share a number (about 1 in 2,000 with 3 of them).
- `messages-controller.ts`, `sessions-controller.ts` and `care-controller.ts` keep Sokheng's single quote formatting.
- Test with a professional and a client account after the three migrations run: bookings list and actions, messages and voice, client file (summary note, archive, shared data, mood trend), suggestions, care plan.

## Template for a new feature section

```md
## N. <Feature name>

**Files:** <data file>, <view file>, <provider actions>

### Data shape the page expects
| Field | Type | Database source | Exists today? |

### Actions
| Frontend action | Meaning | Endpoint | Exists today? |

### Backend gaps
1. ...
```

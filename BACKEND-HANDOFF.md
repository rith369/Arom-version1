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
- **No private content in admin responses.** Admins see counts only, never journal text, mood entries, detection answers or session notes. One exception: admins may read support group chats for safety (section 14). Every opening of a chat writes an audit log entry, and members are told in the group guidelines.
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
| Admin users: list, details, roles, suspend | Done on mock data | Waiting for backend | 5 |
| Admin professionals: review and moderation | Done on mock data | Waiting for backend | 6 |
| Become a professional (user applies) | Done on mock data | Waiting for backend | 8 |
| Professional area `/pro`: shell, home, my profile with preview, login entry | Done on mock data | Waiting for backend | 16 |
| Professional schedule (`/pro/schedule`) | Done on mock data | Waiting for backend | 16 |
| Professional bookings (`/pro/bookings`) | Done on mock data | Waiting for backend | 16 |
| Professional podcasts (`/pro`) | Not built yet | Not started | 17 |
| Admin MindGuide: lessons, tips and practices with drafts, versions, publish and checks (`/admin/mindguide`, editor at `/admin/mindguide/<type>/<sourceId>`) | Done on mock data | Waiting for backend | 9 |
| Report a problem (users) and admin Reports page (`/admin/reports`) | Done on mock data | Waiting for backend | 10 |
| Announcements: admin Settings section, banner at the top of every user page | Done on mock data | Waiting for backend | 15 |
| Crash tracking: error screens catch crashes, admin Overview card "Most frequent crashes, last 7 days" | Done on mock data | Waiting for backend | 14 |
| Crisis helplines and support contact: admin Settings, user "Get help now" in Profile and Settings | Done on mock data | Waiting for backend | 13 |
| Admin bookings chart: sessions per day and new bookings per day (`/admin/bookings`) | Done on mock data | Waiting for backend | 12 |
| MindGuide podcasts: user pages `/podcasts` and `/podcasts/<id>`, admin Podcasts tab | Done on mock data | Waiting for backend | 11 |
| Community: professionals and admins create groups, admins read chats and shut groups down, users report a person, image, message or group (`/community`, `/admin/community`) | Done on mock data | Waiting for backend | 14 |
| Other admin pages (bookings, journal prompts, settings, audit log) | Built by Sokheng on mock data | Not started | not written yet |

## 5. Admin users page

**Files:** `app/admin/_data/users.ts`, `app/admin/_components/users-view.tsx`, actions in `admin-provider.tsx`.

### Data shape the page expects (`AdminUser`)

| Field | Type | Database source | Exists today? |
|---|---|---|---|
| `id` | string (uuid) | `profiles.id` | Yes |
| `fullName` | string | `profiles.full_name` | Yes |
| `email` | string | `auth.users.email` | **No.** `listUsers` does not return it. Needs a server side read (see gaps) |
| `avatarUrl` | string or null | no column yet | **No.** Return `null` for now, the page shows initials |
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

1. **Make admin (decided: yes, allow it).** Today `set_user_role()` refuses to grant or remove `admin`. Change it so an admin can, with these guards:
   - caller must be admin (checked in the database function, not only the API);
   - an admin cannot change their own role;
   - the last remaining admin cannot be removed;
   - every change writes to `admin_audit_log`.
2. **Promote with license details.** When an admin makes someone a professional directly, save `title`, `licenseNumber` and `issuingBody` into `professional_credentials` and create the `professional_profiles` row as `verified`, the same result as approving an application. Store the note in the audit log. Record that it came from an admin (see `source` in section 6).
3. **Suspend and restore endpoint.** Set `account_status`, `suspended_at`, `suspended_reason`. Same guards: not yourself, audit log.
4. **Email in the users list.** Email lives in `auth.users`. Read it in a server handler or a `security definer` function that only admins can call. Never expose it through a public view.
5. **Last seen and activity counts.** Return counts only. No content.
6. **Search.** The page searches by name and email. Either return all users (small scale) or add `?q=` to `GET /api/admin/users`.

## 6. Admin professionals page

**Files:** `app/admin/_data/professionals.ts`, `app/admin/_components/professionals-view.tsx`, actions in `admin-provider.tsx`.

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

1. **Pending profile changes (decided rule).** When a professional changes `display_name`, `title`, `license_number` or `issuing_body`, the change must wait for admin review, and the public profile keeps the old value until approved. Other fields (bio, photo, prices, schedule) go live right away. Suggested table `professional_profile_changes (id, professional_id, field, old_value, new_value, status, reviewed_by, reviewed_at, review_note, created_at)` with RLS: the professional can insert and read their own, only admins can review.
2. **Directory visibility after approval (open question).** Today approval sets `verified` and the profile is live immediately, even with an empty bio and photo. Proposal: only list professionals who are verified, active, and have completed their profile. Confirm with Rith.
3. **Signed URL for license documents** from the private storage bucket, admin only, short expiry.
4. **`source` column** on `professional_profiles` (`application` or `admin`) so admins can see how someone joined.

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
- **Bookings belong to the user and the professional.** Only they confirm, reschedule or cancel. Admins see bookings read only and can only make an emergency cancel with a written reason (see section 12).
- **Instant booking.** A user picking one of a professional's open times is booked straight away (`appointments.status = 'booked'`, as the database already does). Professionals can still cancel or reschedule with a reason. An optional per professional "review new clients first" setting may come later; the frontend "pending" status is reserved for it.
- **A professional appears to users only when their profile is complete:** photo, English bio (80+ characters), Khmer bio, at least one specialty, language and session type, a price choice (Free counts), and at least one open time. Today approval sets `verified` immediately; add the completeness check to the directory query.
- **Session notes are private to the professional who wrote them.** Not admins, not other professionals.
- **No payments yet, but prices are shown.** Each professional chooses Free, one price ("$20 a session") or a range ("$30 to $50 a session"). Users see it on the list, the profile and the booking review, with a "No payment during testing" note while the admin switch "No payments during testing" (Settings) is on. Nobody is charged.
- **Two kinds of podcasts.** MindGuide podcasts are made by admins and shown in MindGuide. Professional podcasts are published by professionals themselves on their own profile so users can listen before booking. They are separate lists.

## 8. Become a professional (user applies)

**Files:** `app/profile/become-professional/page.tsx`, `_components/become-professional.tsx`, `_data/application.ts` (type, zod schema, mock). Entry point: "Become a Professional" link in Profile, shown only when `user.role === 'user'`. The route sits under `/profile`, so `proxy.ts` already requires login.

The page keeps its state in React only and has a yellow demo bar to preview each status (Not applied, Pending, Approved, Rejected). Remove the demo bar and `previewStatus` when connected.

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

### Backend gaps

1. **Add `phone` and `telegram` columns** to `professional_applications`, and copy them to the professional's private record when approved (for example `professional_credentials` or a new private contact table). RLS: the applicant and admins only. Never in `professional_profiles` or any public view.
2. **Submit endpoint.** Caller must be `user` role and active. The unique index already blocks a second pending application. A rejected applicant may submit a new one.
3. **License upload** to the private storage bucket. Path per user, for example `licenses/<user_id>/<uuid>.<ext>`. Storage policies: owner can upload, admins can read, nobody else.
4. **Get own application** endpoint returning only the caller's rows.
5. **Admin review** already exists (`POST /api/admin/applications/:id/review`). The admin Professionals page now also shows `phone` and `telegram` in the review panel, so include them in `GET /api/admin/applications`.

## 9. MindGuide content: drafts, versions and publishing

**Files:** `app/admin/_data/content.ts` (types, seed, helpers), `_data/content-checks.ts` (publish rules), `_data/content-diff.ts` (change summary), `_components/content-editor.tsx` (editor page), `content-view.tsx` (list), field panels `content-meta-fields.tsx`, `lesson-editor.tsx` (`LessonFields`), `tip-editor.tsx` (`TipFields`), `practice-editor.tsx` (`PracticeFields`). Actions live in `admin-provider.tsx`.

**Decided:** content is written and designed by the team with Claude and lives in fixed user screens. Admins only correct text in plain fields. No HTML, no styling, no AI button in the app. A new kind of block (new layout) is developer work in both the user screen and the editor.

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
| `createContent(type)` | New item with an empty draft, then open the editor | none |
| `saveContentDraft(id, body, expectedUpdatedAt)` | Save the draft. Light check only (unique ids), so half finished work can be saved | `stale`, `shape` |
| `publishContent(id, expectedUpdatedAt)` | Run the full check in the database, write version N+1 from the saved draft, delete the draft, set it live | `stale`, `shape` |
| `discardContentDraft(id)` | Delete the draft. Live version stays | none |
| `deleteContent(id)` | Only for items that were never published | none |
| `setContentHidden(id, hidden)` | Hide: set `liveVersion` to null. Show: set it to the newest version | none |
| `restoreContentVersion(id, version)` | Copy that version into the draft. Returns the new draft `updatedAt` | none |

The return type is `ContentActionResult`: `{ ok: true, updatedAt }` or `{ ok: false, code: 'stale' | 'shape' }`. Also return `not_admin` from the backend; the editor will show it as an error.

**No overwrite rule.** Save and Publish send the draft `updatedAt` the editor loaded (`null` when there was no draft). If the database value differs, refuse with `stale` and change nothing.

**Publish rules.** Publish publishes exactly the saved draft (the editor blocks Publish while there are unsaved changes). Repeat the rules of `checkForPublish()` in the database: errors block publishing, warnings (missing Khmer text) do not. Record `published_by` and `published_at` on every version and `updated_by` on drafts.

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
- **Mock today:** the user side only counts reports in the browser to show the daily limit message. Nothing reaches the admin page yet; the admin page uses its own mock reports.

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

### Still mock

The user page reads the empty lists in `support-contacts.ts`, so admin edits do not reach users until this is connected. The admin dashboard "No crisis hotlines added yet" warning already reads `crisis_resources`.

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

`GET /api/announcements/current` (public, returns one or none) and admin only `GET /api/admin/announcements`, `POST /api/admin/announcements`, `POST /api/admin/announcements/:id/end`. Until then the user banner reads the empty list and admin edits are mock.

## 16. Professional area (`/pro`)

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

`ProBooking`: `id`, `clientName`, `startsAt`, `durationMinutes`, `sessionType` (`online`, `in_person`), `status` (`booked`, `completed`, `cancelled`, `no_show`, as in `appointments`; no pending, booking is instant), `intakeNote` (`appointments.intake_note`), `intakeAnswers` (`intake_answers` with their `intake_questions`), `cancelledBy`, `cancelReason`, `rescheduledFrom`, `rescheduleReason`.

| Frontend action | Rule | Backend |
|---|---|---|
| `cancelBooking(id, reason)` | Upcoming sessions only, reason required (up to 300), shown to the client | `cancel_appointment` already exists; record `cancelled_by` (the professional) and `cancel_reason`, free the slot, notify the client |
| `rescheduleBooking(id, startsAt, reason)` | New time must be an open slot of the same session type, not the current time; reason required | new function: move the appointment to the new slot, free the old one, keep the original time, notify the client, who can cancel |
| `setBookingOutcome(id, 'completed' \| 'no_show')` | Only after the session has ended | update `appointments.status` |
| `saveSessionNote(id, text)` | Up to 5000 characters | `session_notes`: readable and writable only by the professional who owns the appointment. No admin read, no client read |

Clients see their name only to their own professional. The client list shows names, not emails or phone numbers.

### My schedule (`/pro/schedule`)

**Files:** `app/pro/_data/schedule.ts` (types, rules, `openSlots`), `app/pro/_components/schedule-editor.tsx`, provider `schedule` and `saveSchedule`.

`Schedule` = weekly hours (`week`: per weekday, `enabled` and `ranges` of `{ start, end, sessionTypes }` in `HH:MM`, Cambodia time), `sessionMinutes` (45, 60, 90), `breakMinutes` (0, 10, 15), `bookingWindowWeeks` (2, 4, 8), `minNoticeHours` (2, 12, 24), and `timeOff` (`{ from, to, note }` dates, inclusive).

Rules the editor enforces, repeat them on the server:
- Ranges between 06:00 and 22:00, at least one session long, no overlaps on the same day.
- A range's session types must be ones the profile offers.
- Open times = each range cut into `sessionMinutes` steps plus `breakMinutes`, for the booking window, minus time off, minus booked slots, minus anything inside `minNoticeHours`. See `openSlots()`.
- Saving the schedule never cancels sessions already booked.

Backend needs: store the weekly hours, settings and time off (a `professional_schedules` table or jsonb on `professional_profiles`), and keep `availability_slots` filled for the booking window from them (a function run on save and daily). Users book from `availability_slots` (instant booking). "Has open times" is the schedule step of the visibility checklist. The user booking page still shows its own sample days and times until it reads `availability_slots`.


## 17. Planned next (frontend not built yet)

- **`/pro` next steps:** My podcasts (their own episodes on their profile).
- **Make professional (Way 2):** phone is optional there because the admin already knows the person. Add an optional phone field to `ProfessionalPromotion` when the backend supports it.

## 14. Community: groups, chat moderation and reports

**Files:** user side `app/community/page.tsx`, `community-data.ts` (types), `community-store.ts` (mock store in localStorage, shared with admin), `components/create-group-view.tsx`, `components/report-dialog.tsx`, `components/group-hub-view.tsx` (report entry points, closed state). Admin side `app/admin/_data/community.ts`, `_components/community-view.tsx` (View chat, Shut down, Reopen, reports), actions in `admin-provider.tsx`.

**Mock today:** `community-store.ts` keeps created groups, closures and reports in this browser's localStorage, and both `/community` and the admin provider read it with `useSyncExternalStore`. So in one browser a professional can create a group, the admin sees it, shuts it down, and `/community` shows it closed. Replace every function in `community-store.ts` with API calls; the components should not need to change. Admin edits to an existing group still stay in admin state only.

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

### Backend gaps

1. Groups, members, messages and attachments tables do not exist yet. Chat images need a private storage bucket readable by members of that group and by admins.
2. Professionals have no "My groups" list yet; it belongs in `/pro`.
3. Admin edits to an existing group (name, description, rules) do not reach `/community` in the mock. With one database this goes away; no frontend change is needed.

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

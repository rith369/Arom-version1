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
- **No private content in admin responses.** Admins see counts only, never journal text, mood entries, detection answers or session notes.
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
| Professional edits own profile (`/pro`) | Not built yet | Not started | 13 |
| Admin MindGuide: lessons, tips and practices with drafts, versions, publish and checks (`/admin/mindguide`, editor at `/admin/mindguide/<type>/<sourceId>`) | Done on mock data | Waiting for backend | 9 |
| Report a problem (users) and admin Reports page (`/admin/reports`) | Done on mock data | Waiting for backend | 10 |
| Admin bookings chart: sessions per day and new bookings per day (`/admin/bookings`) | Done on mock data | Waiting for backend | 12 |
| MindGuide podcasts: user pages `/podcasts` and `/podcasts/<id>`, admin Podcasts tab | Done on mock data | Waiting for backend | 11 |
| Other admin pages (bookings, community, journal prompts, settings, audit log) | Built by Sokheng on mock data | Not started | not written yet |

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
- **Admins never see private wellbeing content.** Counts only.
- **AROM has no "Owner" role.** Only `user`, `professional`, `admin`.
- **Educational note is fixed app text.** Every lesson, tip, practice and podcast screen shows "For learning only. This is not a diagnosis or treatment." from `app/_components/educational-note.tsx`. It is not stored as content, so no admin edit can remove it.
- **No crisis helpline card on content screens.** Users find helpline information in Settings.
- **Bookings belong to the user and the professional.** Only they confirm, reschedule or cancel. Admins see bookings read only and can only make an emergency cancel with a written reason (see section 12).
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

## 13. Planned next (frontend not built yet)

- **Professional profile editor under `/pro`.** Uses the pending changes rule in section 6.
- **Make professional (Way 2):** phone is optional there because the admin already knows the person. Add an optional phone field to `ProfessionalPromotion` when the backend supports it.

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

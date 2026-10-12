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
| Professional edits own profile (`/pro`) | Not built yet | Not started | 9 |
| Admin MindGuide: lessons, tips, practices and podcasts in one page (`/admin/mindguide?tab=lesson\|tip\|practice\|podcast`). Old `/admin/content` and `/admin/podcasts` redirect here | Built by Sokheng on mock data, merged into one page by Rith | Not started | not written yet |
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

## 9. Planned next (frontend not built yet)

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

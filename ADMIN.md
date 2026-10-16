# AROM admin area

The admin area (`/admin`) is for the AROM team only. New text there is English only; keep the Khmer that already exists, and keep Khmer input fields for content users read.

## Access

`/admin` is protected in `lib/supabase/proxy.ts`, and every admin API starts with `requireRole("admin")` (`lib/controllers/role-controller.ts`). The database checks the role again in every admin function and RLS policy. Admins never see private content: no journals, moods, detection answers or session notes. The one exception is community group chats, which admins may read for safety, with an audit log entry each time (BACKEND-HANDOFF.md section 23).

## Pages

| Page | Path | Data |
|---|---|---|
| Overview | `/admin` | Real (`/api/admin/overview`). The crash card is still sample data |
| Professionals: applications, profile change review, suspend and reinstate | `/admin/professionals` | Real |
| Users: roles, make admin, promote to professional, suspend | `/admin/users` | Real |
| Audit log | `/admin/audit-log` | Real |
| Settings: crisis helplines | `/admin/settings` | Real. Support contact and announcements are still sample data |
| MindGuide content: drafts, versions, publish | `/admin/mindguide` | Sample data |
| Podcasts | `/admin/podcasts` | Sample data |
| Reports | `/admin/reports` | Sample data |
| Community: view chat, shut down, reopen | `/admin/community` | Browser only (`community-store.ts`) |
| Bookings chart | `/admin/bookings` | Sample data |
| Journal prompts | `/admin/journal-prompts` | Sample data |

The status board in `BACKEND-HANDOFF.md` (section 4) is the source of truth for what is connected.

## Code map

- `app/admin/layout.tsx`: shell and provider.
- `app/admin/_components/admin-provider.tsx`: loads real data from the API and holds the actions for each page. Pages read `useAdmin()` only.
- `app/admin/_components/<feature>-view.tsx`: one file per page.
- `app/admin/_data/*.ts`: types (the contract with the API) and the sample data still used by pages that are not connected.
- `lib/controllers/admin-controller.ts`, `professionals-controller.ts`, `audit-controller.ts`, `crisis-controller.ts`: the server side.

## Checks

```sh
npx eslint app/admin
npx tsc --noEmit
npm run build
```

# ARom admin frontend

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:3000/admin for the overview or http://localhost:3000/admin/professionals for profiles.

## Included

- Responsive admin shell using the existing ARom theme and language provider.
- Overview counts based on shared mock professional records.
- Professionals: review queue for applications and profile changes, approve, reject, suspend and reinstate. Admins no longer create or edit profiles.
- Users: expandable account cards with safe details, role changes (professional, admin) and suspend or restore.
- English and Khmer profile fields and interface labels.
- Native modal dialog with Escape dismissal, focus containment, and form validation.

## Code map

- `app/admin/layout.tsx`: shared shell and mock state provider.
- `app/admin/_data/professionals.ts`: typed records, adapted from existing public fixtures.
- `app/admin/_data/users.ts`: typed user records with roles and activity counts.
- `app/admin/_components/admin-provider.tsx`: temporary state and review, role and status actions.
- `app/admin/_components/professionals-view.tsx`: review and moderation.
- `app/admin/_components/users-view.tsx`: accounts, roles and status.
- `app/admin/_components/dashboard.tsx`: overview.

Changes persist while navigating within the admin layout and reset on a full refresh. They do not update the public directory. New profiles use an avatar fallback; image upload is future work. Publication status is a demo content state and does not imply credential verification. Only overview and professionals are implemented in this first milestone.

## Backend handoff

See `BACKEND-HANDOFF.md` for the data shapes, endpoints and backend gaps of every admin page. `/admin` is now protected by `proxy.ts` and admin APIs use `requireRole("admin")`.

## Checks

```sh
npx eslint app/admin
npx next typegen
npx tsc --noEmit
npm run build
```

Production build, admin ESLint, and TypeScript checks passed on 2026-10-07. Automated browser verification could not run because Chromium was unavailable and its download failed. Use the checklist in report.md for browser QA.

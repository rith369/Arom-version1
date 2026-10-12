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
- Search, status filters, creation, editing, archiving, and restoring as draft.
- English and Khmer profile fields and interface labels.
- Native modal dialog with Escape dismissal, focus containment, and form validation.

## Code map

- `app/admin/layout.tsx`: shared shell and mock state provider.
- `app/admin/_data/professionals.ts`: typed records, adapted from existing public fixtures.
- `app/admin/_components/admin-provider.tsx`: temporary state and save operation.
- `app/admin/_components/professional-form.tsx`: profile form.
- `app/admin/_components/professionals-view.tsx`: directory management.
- `app/admin/_components/dashboard.tsx`: overview.

Changes persist while navigating within the admin layout and reset on a full refresh. They do not update the public directory. New profiles use an avatar fallback; image upload is future work. Publication status is a demo content state and does not imply credential verification. Only overview and professionals are implemented in this first milestone.

## Backend handoff

These demo pages have no authentication or role enforcement. Protect admin access before connecting real data. Replace mock provider reads/writes with authenticated Supabase operations. Validate data and permissions on the server and with RLS. Keep privileged keys out of browser code. Preserve the professional UI types through an explicit database mapping.

## Checks

```sh
npx eslint app/admin
npx next typegen
npx tsc --noEmit
npm run build
```

Production build, admin ESLint, and TypeScript checks passed on 2026-10-07. Automated browser verification could not run because Chromium was unavailable and its download failed. Use the checklist in report.md for browser QA.

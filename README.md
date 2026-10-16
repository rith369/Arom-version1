# AROM (អារម្មណ៍)

AROM is a bilingual (English and Khmer) mental health and emotional wellness web app. People check in with their mood, learn and practise with MindGuide, join community support groups, and book sessions with verified professionals.

There are three roles: **user** (seeker), **professional** (therapist and group mentor) and **admin** (the AROM team).

## Stack

- Next.js 16 (App Router, React 19), TypeScript
- Supabase (Postgres with Row Level Security, Auth, Storage)
- Tailwind CSS v4, Motion, lucide-react, react-hook-form and zod
- Fonts: Inter (Latin) and Kantumruy Pro (Khmer)
- Hosted on Vercel

## Run locally

1. Install: `npm ci`
2. Create `.env` with the Supabase project URL and anon key:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Start: `npm run dev`, then open http://localhost:3000

The service role key is never needed by the app and must never be added to it.

## Checks

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

## Database

Migrations live in `supabase/migrations/` and run in file name order. Each file says what it changes at the top. Run a new file once in the Supabase SQL editor, and note it in `report.md`. Every table has RLS; private content (journals, moods, detection answers, session notes) is readable only by its owner.

## Where things are

| Path | What |
|---|---|
| `app/<feature>/page.tsx` | User pages |
| `app/pro/` | Professional area |
| `app/admin/` | Admin area (English only) |
| `app/api/**` | Route handlers. Thin: they call `lib/controllers/*.ts` |
| `lib/` | Shared types and rules used by the browser and the API |
| `app/_components/` | Shared components and providers |

## Team docs

- `AGENTS.md`: coding rules, copy style (no dashes, no sparkles icons), privacy and roles. Read first.
- `BACKEND-HANDOFF.md`: every feature, its data shape and endpoints, and whether it is connected or still on mock data.
- `report.md`: change log, newest first, with the commit, migrations and what to re-test.
- `ADMIN.md`: the admin area.

# Mihni.work

Mihni is a professional work marketplace built around real work, verified identity, work portfolios, and professional reputation. This repository is the Phase 1 foundation: Arabic-first product pages, Supabase authentication, and an editable professional profile. Marketplace workflows are not implemented yet.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Storage

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the Supabase project URL, anon key, and service-role key.
3. Apply the SQL files in `supabase/migrations` in timestamp order using the Supabase CLI or SQL editor.
4. Start the app with `npm run dev`.

The service-role key is used only by trusted server routes. Never expose it in a `NEXT_PUBLIC_*` variable or browser code.

## Useful scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run lint` — lint source
- `npm test` — unit tests
- `npm run test:e2e` — browser end-to-end tests

## Phase 1 routes

- `/` — Mihni landing page
- `/login`, `/signup`, `/forgot-password`, `/update-password` — Supabase Auth flows
- `/dashboard`, `/profile` — authenticated account and profile foundation
- `/discover`, `/opportunities` — coming-soon placeholders

## Database

Supabase migrations live in `supabase/migrations`. The first migration establishes professional profiles, row-level security, constrained account types, and narrowly scoped profile update grants.

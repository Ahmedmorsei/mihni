# Contributing

Keep changes focused and consistent with the current Mihni phase. Avoid adding marketplace workflows before they are planned.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and configure the Supabase values.
3. Apply migrations from `supabase/migrations` in timestamp order.
4. Run `npm run lint`, `npm test`, and `npm run build` when the local environment allows it.

Use TypeScript and the existing Tailwind and Supabase patterns. Update setup or migration documentation when needed.

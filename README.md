# Spasht Finance Tracker

Internal job-costing + team payout tool for spasht.dev. See `AGENTS.md` in the repo root
for the full implementation plan (data model, permissions, phases).

## Setup

1. Copy env vars:

   ```bash
   cp .env.example .env
   ```

2. Get a Neon Postgres connection string (`npx create-db` for a free instant one, or from
   [neon.tech](https://neon.tech)) and set it as `DATABASE_URL` in `.env`.

3. Generate a real auth secret and set it as `AUTH_SECRET` in `.env`:

   ```bash
   npx auth secret
   ```

4. Apply the schema and seed sample data (admin + 2 members + categories):

   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

   Seeded logins (change these passwords before using this anywhere but locally):
   - `admin@spasht.dev` / `changeme123` (ADMIN)
   - `rahul@spasht.dev` / `changeme123` (MEMBER, dev)
   - `priya@spasht.dev` / `changeme123` (MEMBER, marketing)

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

## Stack notes (Next.js 16 / Prisma 7 — this is not the Next.js/Prisma you know)

- **Route protection** lives in `src/proxy.ts`, not `middleware.ts` — Next.js 16 renamed the
  convention to `proxy.ts`. It wraps NextAuth's `auth()` and defers to the `authorized`
  callback in `src/auth.config.ts`.
- **Prisma Client** is generated to `src/generated/prisma` (custom output, not
  `node_modules/@prisma/client`) using the `prisma-client` generator. Prisma 7 dropped
  `datasource.url` from `schema.prisma` — the connection string for `PrismaClient` is passed
  via a driver adapter (`@prisma/adapter-neon`) in `src/lib/db.ts`, and separately via
  `prisma.config.ts` for the Migrate CLI.
- **Auth** is NextAuth v5 (Auth.js) with a Credentials provider (bcrypt-hashed passwords) and
  the Prisma adapter, session strategy `jwt` (required for Credentials). Config is split
  across `src/auth.config.ts` (edge-safe, used by `proxy.ts`) and `src/auth.ts` (full config
  with the provider + Prisma).
- **Styling** uses Tailwind CSS v4's CSS-first config — design tokens (colors, radii, font
  sizes) live in `@theme` in `src/app/globals.css`, not `tailwind.config.ts`.

## What's built so far (Phase 1 — Foundation)

- Auth (credentials login, JWT sessions, route protection via proxy)
- Full Prisma schema (User, Client, Deal, DealAssignment, Payment, Payout, CostItem,
  Category, AuditLog)
- Seed script for a starting admin + team + categories

Not yet built: deal/client/team CRUD, dashboards, payouts, audit log UI — see the phase
breakdown in `AGENTS.md`.

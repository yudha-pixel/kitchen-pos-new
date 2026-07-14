# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start Next.js frontend (port 3000) + Express API (port 3001) concurrently
npm run api:dev      # Start only the API with hot reload (tsx watch server/index.ts)
npm run build        # Build the Next.js frontend
npm run lint         # ESLint
npx tsc --noEmit     # Type-check

npm run db:migrate   # prisma migrate dev
npm run db:seed      # Seed default admin/admin user + sample data
npm run db:generate  # Regenerate Prisma client (also runs on postinstall)
npm run db:studio    # Prisma Studio
```

No test suite exists yet. Requires a local PostgreSQL with a `kitchen_pos` database; config lives in `.env` (`DATABASE_URL`, `JWT_SECRET`, `PORT=3001`, `API_HOST=0.0.0.0`) and `.env.local` (`NEXT_PUBLIC_API_URL`). Default login is `admin` / `admin`. New App Router routes may require a dev-server restart to be detected.

## Architecture

Offline-first restaurant POS designed for LAN use (multiple tablets sharing one database). UI text is in Indonesian (e.g. "meja" = table, "kasir" = cashier, "dapur" = kitchen).

Two processes run side by side from one repo:

1. **Next.js 16 App Router frontend** (`app/` for routes, `src/` for everything else) — React 19, TypeScript 5, Tailwind CSS v4, PWA via `next-pwa` (disabled in development).
2. **Express API** (`server/index.ts`, bound to `0.0.0.0:3001` for LAN access) — routes in `server/routes/` (auth, products, orders, print), JWT auth middleware in `server/middleware/auth.ts`, singleton Prisma client in `server/lib/prisma.ts`. Prisma schema and migrations are in `prisma/`; the seed script is `server/prisma/seed.ts`.

### Data flow and offline sync

- `src/lib/api.ts` is the typed API client — all frontend HTTP calls go through it (never fetch directly).
- `src/lib/db.ts` defines the Dexie.js/IndexedDB schema used as an offline cache.
- Hooks (`src/hooks/useProducts.ts`, `useOrders.ts`) read cache-first from IndexedDB, then refresh from the API.
- Writes that fail due to network errors fall back to IndexedDB with a sync queue; `src/hooks/useSyncManager.ts` pushes queued records to PostgreSQL when connectivity returns. All records use client-generated UUIDs so sync is idempotent.

### State and auth

- Cart/payment/split-bill/table-merge logic lives in the Zustand store `src/store/useCartStore.ts`.
- Auth is local JWT + bcrypt with `admin` and `cashier` roles; token/user lifecycle is in `src/context/AuthContext.tsx`. Pages check auth and redirect to `/login`.

### Frontend layout

- `app/` holds only route pages (`/login`, `/pos`, `/pos/meja`, `/kitchen`); feature components live in `src/features/pos/components/`, shared layout (Header, Sidebar) in `src/components/layout/`.
- The Sidebar renders different menus depending on whether the URL is under `/admin` (back-office) or `/pos` (cashier).

## Reference docs

- `HANDOVER.md` — session-by-session status, known issues, and next steps; update it when finishing significant work.
- `knowledge/` — domain knowledge base and phased roadmap (POS workflows, inventory, reporting, staff/CRM, Odoo comparison).

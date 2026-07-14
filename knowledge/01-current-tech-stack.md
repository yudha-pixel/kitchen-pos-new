# Current Technology Stack — Deep Dive

This document captures the current technology choices in the Kitchen POS project and explains the architectural patterns that make them work together.

## 1. Frontend Layer

### Next.js 16 (App Router) + React 19
- The application uses the Next.js App Router, file-based routing under `app/`, and React Server/Client Components.
- `app/login/page.tsx` and `app/pos/page.tsx` are client pages because they depend on browser APIs (localStorage, IndexedDB, network status, router).
- Server Components could later be used for static landing pages, marketing content, or server-rendered reports.

### TypeScript 5
- All business entities are typed in `src/types/database.types.ts`.
- The API client in `src/lib/api.ts` is written in TypeScript and returns typed or casted responses.
- Strict null checks and explicit casts from `unknown` API payloads are used to avoid `any` leakage.

### Tailwind CSS v4 + shadcn/ui-style utilities
- Tailwind provides utility-first styling.
- The project currently uses hand-written Tailwind classes; shadcn/ui or Radix primitives can be layered in for dialogs, forms, and tables.

### State Management
- **Zustand**: `useCartStore.ts` manages cart items, table number, payment method, totals, split groups, and the authenticated cashier.
- **React Context**: `AuthContext.tsx` holds the logged-in user, token lifecycle, and login/logout methods.
- **Dexie.js / IndexedDB**: `db.ts` is the local offline cache and sync queue.

## 2. Offline-First Architecture

The single most important design decision is that the app writes to the browser's IndexedDB first and syncs to PostgreSQL when online.

### Why IndexedDB first?
- Cashiers can continue taking orders during internet outages or LAN disruptions.
- The UI never waits on a network round-trip.
- Every mutation can be captured in the `sync_queue` table and retried later.

### Sync pattern
1. UI dispatches an action.
2. The store writes to IndexedDB and optionally enqueues a `sync_queue` record.
3. `useSyncManager.ts` listens for online/offline events and pending transaction counts.
4. When online, queued records are sent to the Express API in the order they were created.
5. The API uses Prisma upserts with idempotent UUID keys (`skipDuplicates`, `ON CONFLICT`) to avoid duplicate inserts.
6. On success, the local record status is updated to `synced`.

### Conflict handling
- Client-generated UUIDs remove the need for server-side autoincrement IDs.
- The backend treats creates as upserts, so re-sending the same order after a network hiccup is safe.
- For product edits, last-write-wins based on server timestamp is the default policy.

## 3. Backend Layer

### Express.js API (`server/index.ts`)
- Routes are modularized under `server/routes/`.
- Middleware:
  - CORS for cross-origin requests from the Next.js frontend.
  - `express.json()` with a 10 MB body limit for image uploads.
  - JWT auth middleware protects order, item, void-log, and admin-only endpoints.
- The API is bound to `0.0.0.0` (`API_HOST`) so LAN devices (tablets, phones, other tills) can reach it by the server's IP.

### Prisma ORM (`prisma/schema.prisma`)
- PostgreSQL is the authoritative data store.
- Models: `Profile`, `Category`, `Product`, `Modifier`, `Order`, `OrderItem`, `OrderVoidLog`, `SyncQueue`.
- UUID primary keys are generated on the client before upsert, which is critical for offline-first idempotency.
- `modifiers_applied` is stored as JSONB so arrays of add-ons do not require a separate table.

### Authentication
- Local JWT-based auth; no external identity provider.
- `bcrypt` hashes passwords.
- `JWT_SECRET` signs tokens with a 7-day expiry.
- Middleware decodes the token and attaches `req.user` for downstream authorization.

## 4. Network and Deployment Topology

```
Browser/Tablet (Next.js PWA on port 3000)
         |
         | HTTP (LAN)
         v
Express API (port 3001, bound to 0.0.0.0)
         |
         | Prisma
         v
Local PostgreSQL (port 5432)
```

- `NEXT_PUBLIC_API_URL` tells the browser where the API lives.
- For LAN access from other devices, set `NEXT_PUBLIC_API_URL=http://192.168.X.Y:3001` in `.env.local` before building.
- IndexedDB lives in the browser, so each device has its own offline cache and sync queue.

## 5. Strengths of the Current Stack

- **Fast UI**: Next.js + Tailwind + Zustand gives a responsive single-page feel.
- **Offline resilience**: Dexie.js ensures orders can be taken without connectivity.
- **Type safety**: TypeScript and Prisma reduce runtime errors.
- **LAN ready**: Express bound to `0.0.0.0` supports multi-device POS setups.
- **No vendor lock-in**: All components are open source and self-hosted.

## 6. Growth Points

- **PWA installability**: `manifest.json` and service worker can be added for installable tablets/kiosks.
- **Real-time sync**: WebSockets or Server-Sent Events can be added so multiple POS stations see live order updates.
- **State normalization**: Zustand store could be split into smaller slices as features grow.
- **File storage**: Product images currently rely on `image_url`; a local MinIO/S3-compatible store would remove external dependencies.
- **Testing**: Unit tests (Vitest/Jest) and E2E tests (Playwright) are not yet implemented.

# Kitchen POS - Handover Document

## Session Summary

**Previous session**: Completed migration from Supabase to local PostgreSQL + Express + Prisma backend, added local JWT authentication, verified database and API, and created knowledge base for full restaurant POS roadmap.

**Current session (2026-07-15, UI design system overhaul)**:
- New token-driven design system in `app/globals.css` (Tailwind v4 `@theme`): semantic colors (primary/surface/ink/success/warning/danger/info + soft variants), removed the global `!important` force-black-text block that was fighting the dark KDS screen, body now uses Geist instead of Arial, `touch-action: manipulation`, `:focus-visible` rings, `prefers-reduced-motion` guard, `.tnum` tabular-numbers utility; `[data-theme="kds"]` scope remaps tokens for the dark kitchen display
- New UI kit in `src/components/ui/`: `Button` (variants + 44px touch targets + loading), `Badge`, `Modal` (focus trap, Escape, scrim), `ConfirmDialog`, `PromptDialog`, `Toast`/`ToastProvider` (aria-live, auto-dismiss, mounted in `app/layout.tsx`), `Skeleton`/`ProductCardSkeleton`, `EmptyState`, `Spinner`; shared formatters in `src/lib/format.ts` (`formatRupiah` id-ID, `formatTime`, `formatElapsed`)
- All `alert()`/`confirm()`/`prompt()` replaced with toasts and dialogs across CartPanel, modals, BackButton (grep returns zero matches in `src/` + `app/`)
- Header: light surface theme, removed dead hardcoded "Meja 1–8" chip row, aria-labels on icon buttons; Sidebar: light theme, `aria-current` active states, real icons in collapsed mode, proper toggle `<button>`
- POS page: dev-tools bar now development-only, compact sync strip (success/warning tones, pending badge, sync errors as toast), skeleton grid while loading, retry button on error, product refetch instead of `window.location.reload()`, mobile cart FAB now opens a working bottom sheet with item-count badge, debug console.log spam removed
- KDS (`app/kitchen/page.tsx`): `data-theme="kds"` dark tokens, urgency timers per knowledge/02 (green <10 min, amber 10–20, red >20; constants `URGENCY_WARN_MIN`/`URGENCY_LATE_MIN`), 30s re-render tick, larger item text for distance reading, per-order loading state on Proses/Selesai, toast on fetch/update failure, "Diperbarui HH:MM" indicator
- Tables page: knowledge-based 4-status model (Tersedia/Terisi/Reservasi/Kotor) with icon+label (not color-only), status changed via picker modal instead of blind click-cycling (still mock data — API wiring is future backend work)
- Login: labeled inputs with autocomplete, password show/hide toggle, inline error near field, loading button
- Verified: `tsc --noEmit` clean, `next build` passes; `npm run lint` still has pre-existing errors (mostly `no-explicit-any` in db.ts/stores/types and `<img>` warnings) that predate this session

**Previous session (2026-07-15, Phase 0 backend hardening)**:
- Order lifecycle formalized: `pending → preparing → ready → served → completed` (+`cancelled`), default status now `pending`, forward-only transitions validated in `PATCH /orders/:id/status`; POS creates paid orders as `pending` so they appear on the KDS
- New `GET /orders/active` endpoint (pending+preparing orders with items+product+category in one query); kitchen page rewritten to use it (no more N+1, no more "Unknown" items)
- Zod validation on all write endpoints (`server/lib/validation.ts`), central error middleware mapping Zod→400 and Prisma P2025→404/P2002→409, JWT_SECRET fail-fast, configurable CORS (`CORS_ORIGIN` env), `requireRole('admin')` on printer writes, auth on order reads
- Full catalog CRUD: categories, modifier groups, modifiers; product create/update now supports sku/description/modifier_group_ids; product DELETE is a soft delete via new `is_active` flag
- Offline sync fixed: local orders now carry a separate `sync_status` field (Dexie v2 migration) so lifecycle status no longer doubles as the sync flag; `useSyncManager` drains `db.sync_queue` (replays order creates, status updates, void logs with retry/backoff, max 5 retries); offline void logs are queued
- Bug fixes: `POST /orders` upsert now updates amounts on re-sync (without clobbering kitchen status), `routeCategoryToPrinter` undefined-variable bug in `api.ts`, invalid Prisma include in `print.ts`, merge-table now targets all open statuses
- Pagination (`limit`/`offset`) on `GET /orders` (default 100) and `GET /products` (default 500)
- Schema migration `20260714195655_phase0_foundation`: status default, `is_active`, dropped unused server-side `sync_queue` table
- Verified: `tsc --noEmit` clean, `next build` passes, migrate+seed clean, API smoke tests pass (lifecycle transitions, 409 on invalid/terminal transitions, 404 on missing order, 400 Zod errors, 403 for cashier on printer writes, soft-delete filtering, merge-table)
- Note: smoke tests left a `kasir1`/`kasir1` cashier user and one inactive "Produk Uji" product in the DB

**Previous session (2026-07-15)**:
- Added blue theme styling to UI components (Header, Sidebar, CartPanel)
- Thickened borders (border-2) across layout components for better visibility
- Added back button functionality to Sidebar header
- Created table management page at `app/pos/meja/page.tsx` with table status management
- Updated sidebar navigation structure with dynamic menus for admin vs POS areas
- Added relevant icons to menu items in Sidebar
- Updated sidebar link from `/tables` to `/pos/meja` for table management

## Current Architecture

- **Frontend**: Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4.
- **State**: Zustand (`useCartStore.ts`), React Context (`AuthContext.tsx`).
- **Offline cache**: Dexie.js / IndexedDB (`src/lib/db.ts`).
- **Backend**: Express API (`server/index.ts`) bound to `0.0.0.0` on port 3001.
- **ORM**: Prisma with PostgreSQL (`prisma/schema.prisma`).
- **Auth**: Local JWT with bcrypt; roles `admin` and `cashier`.
- **API client**: `src/lib/api.ts` calls the local Express API.
- **Sync**: `src/hooks/useSyncManager.ts` pushes IndexedDB sync queue to PostgreSQL.

## What Was Completed

### UI Theme and Styling Updates
- **Header component** (`src/components/layout/Header.tsx`):
  - Changed background to blue theme (`bg-blue-600`)
  - Updated text and icon colors to white
  - Thickened bottom border to `border-2`

- **Sidebar component** (`src/components/layout/Sidebar.tsx`):
  - Added blue theme to header area (`bg-blue-600`)
  - Thickened all borders to `border-2`
  - Updated border colors to `border-blue-400` for better visibility
  - Added back button with `ArrowLeft` icon in header
  - Implemented dynamic navigation menus based on URL path:
    - `/admin` routes: Shows Back-Office Admin menu
    - `/pos` routes: Shows POS (Kasir) menu
  - Added relevant icons to all menu items (ShoppingCart, ChefHat, Settings, Table, Users, Clock)
  - Updated "Manajemen Meja" link from `/tables` to `/pos/meja`

- **CartPanel component** (`src/features/pos/components/CartPanel.tsx`):
  - Thickened borders to `border-2`
  - Adjusted cart item border color for better visibility

### Table Management Page
- **Created** `app/pos/meja/page.tsx`:
  - Mock data for 12 tables with id, number, capacity, and status
  - Three status types: Available (green), Occupied (red), Reserved (yellow)
  - Responsive grid layout (2-3-4 columns based on screen size)
  - Click-to-change status functionality (cycles through statuses)
  - Visual legend for status colors
  - Instructions panel for user guidance
  - Integrated with Header and Sidebar components
  - Authentication check (redirects to login if not authenticated)

### Navigation Structure
- **Sidebar dynamic menus**:
  - **Back-Office Admin** (when URL contains `/admin`):
    - Dashboard & Laporan
    - Inventory & Pengadaan
    - Finance & Expense
    - Pelanggan & CRM
    - HR/Absensi/Payroll
    - Pengaturan Sistem
  - **POS (Kasir)** (when URL contains `/pos` or not `/admin`):
    - POS (Kasir)
    - KDS (Dapur)
    - Manajemen Meja
    - Data Pelanggan
    - Buka/Tutup Shift

### Supabase removal
- Removed `@supabase/supabase-js` and `src/lib/supabaseClient.ts`.
- Removed all Supabase environment variables and documentation references.
- Replaced all frontend Supabase calls with calls to the local API in `src/lib/api.ts`.

### Backend (Express + Prisma + PostgreSQL)
- `server/index.ts`: Express entry point, CORS, JSON body parsing, error handling.
- `server/routes/auth.ts`: `/auth/login`, `/auth/register`, `/auth/me`.
- `server/routes/products.ts`: categories, products, modifiers CRUD.
- `server/routes/orders.ts`: orders, order items, void logs, table merge, status update.
- `server/middleware/auth.ts`: JWT verification and role guards.
- `server/lib/prisma.ts`: singleton Prisma client.
- `prisma/schema.prisma`: models for Profile, Category, Product, Modifier, Order, OrderItem, OrderVoidLog, SyncQueue.
- `server/prisma/seed.ts`: seeds a default `admin/admin` user plus sample categories, products, and modifiers.

### Frontend
- `src/context/AuthContext.tsx`: login, logout, token lifecycle, user state.
- `app/login/page.tsx`: login page; redirects to `/pos` on success.
- `app/pos/page.tsx`: protected route; redirects unauthenticated users to `/login`.
- `src/lib/api.ts`: typed API client for auth, products, orders, modifiers, void logs, table merge.
- `src/store/useCartStore.ts`: uses authenticated `cashierId`, falls back to IndexedDB on network errors.
- `src/hooks/useProducts.ts`, `useOrders.ts`: cache-first reads from IndexedDB, then API.
- `src/features/pos/components/ProductCard.tsx`: uses local API `updateProduct` instead of Supabase.

### Environment
- `.env` contains `DATABASE_URL`, `JWT_SECRET`, `PORT=3001`, `API_HOST=0.0.0.0`.
- `.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:3001`.
- Use the server's LAN IP in `NEXT_PUBLIC_API_URL` for multi-device access.

### Documentation
- `README.md`: rewritten for the local PostgreSQL stack.
- `DEPLOYMENT.md`: local deployment guide.
- `knowledge/` folder created with seven reference files:
  1. `01-current-tech-stack.md`
  2. `02-pos-domain-and-kitchen-workflows.md`
  3. `03-inventory-procurement-and-ocr.md`
  4. `04-reporting-financials-shifts.md`
  5. `05-staff-crm-communications.md`
  6. `06-security-backup-testing-training.md`
  7. `07-odoo-alternative-and-roadmap.md`

## Verified Commands

```bash
# Type-check
npx tsc --noEmit

# Build frontend
npm run build

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start both frontend and API
npm run dev
```

## Verified API Endpoints

Tested with the API running on `http://localhost:3001`:

- `GET /health` -> `{ status: 'ok' }`
- `POST /auth/login` -> `{ token, user }` for `admin/admin`
- `GET /auth/me` -> current user
- `GET /products` -> list of products
- `GET /categories` -> list of categories
- `POST /orders` -> creates order + items in PostgreSQL

The auth routes are mounted under `/auth` to match the frontend API client.

## Known Lint Items

`npm run lint` still reports some pre-existing issues in legacy files. These were not introduced by the migration and do not block `npm run build` or `npx tsc --noEmit`:

- `Unexpected any` warnings in `src/lib/db.ts`, `src/store/useOfflineStore.ts`, `src/types/database.types.ts`.
- React Hook dependency warnings in `useProducts.ts` and `useSyncManager.ts`.
- Unused variable warnings in `useCartStore.ts`.

These should be cleaned up when the related modules are refactored.

## Outstanding Issues (To Address in Next Session)

### Sidebar Back Button Not Functioning
**Status**: CRITICAL - Back button in Sidebar header not responding to clicks

**Current Implementation**:
- File: `src/components/layout/Sidebar.tsx` (lines 37-46)
- Element: `<div>` with `onClick={() => router.push('/pos')}`
- Has `cursor-pointer` class and hover effects
- `useRouter` is properly imported and declared

**Troubleshooting Attempts Made**:
1. Changed from `router.back()` to `router.push('/pos')` for reliable navigation
2. Added event prevention (`e.preventDefault()`, `e.stopPropagation()`)
3. Added z-index (`relative z-50`)
4. Changed from `<button>` to `<div>` element
5. Added console.log debugging (no response in console)
6. Added `type="button"` to button element

**Current State**:
- Button shows hover effects visually
- No console output when clicked
- No navigation occurs
- May be blocked by CSS overlay or event listener conflict

**Required Investigation**:
1. Check if there's a CSS overlay blocking clicks
2. Verify if parent elements have event handlers that are blocking propagation
3. Test with simpler element structure
4. Check browser console for any JavaScript errors
5. Consider moving back button to a different location if header is problematic

### Sidebar Toggle Button Issues
**Status**: NEEDS TESTING - Expand/minimize functionality may have similar issues

**Current Implementation**:
- File: `src/components/layout/Sidebar.tsx` (lines 49-61)
- Element: `<button>` with `onClick={() => setIsOpen(!isOpen)}`
- Added debugging with console.log
- Added event prevention

**Testing Required**:
- Verify if toggle button responds to clicks
- Check console for "Toggle button clicked" output
- Test if sidebar actually expands/minimizes when clicked

### Table Management Page
**Status**: CREATED - Needs testing and potential integration

**Current Implementation**:
- File: `app/pos/meja/page.tsx`
- Created with full functionality
- Integrated with Header and Sidebar
- Authentication check implemented

**Testing Required**:
- Verify page loads correctly at `/pos/meja`
- Test table status clicking functionality
- Verify responsive grid layout
- Check if navigation from sidebar works correctly
- Test back button functionality from this page

### ProductCard UI Layout Problem (Carried Over)
**Status**: DEFERRED - Layout issues with empty/broken images

The `src/features/pos/components/ProductCard.tsx` component has a layout issue when products have no image or when images fail to load:
- Products without images render as a large black box covering most of the card
- Product name and price are pushed to the bottom, making the UI look broken
- The image area has no height constraint (aspect ratio not enforced)

**Required fixes**:
1. Replace `bg-black` with `bg-gray-100` or `bg-slate-100` for empty image containers
2. Add a clean placeholder (icon or product initials) in the center of empty image areas
3. Constrain image height with `h-32` or `h-40` + `w-full` + `object-cover`
4. Ensure consistent padding in the text area (`p-4`)
5. Use flexbox to align price and modifier badge horizontally (`flex justify-between items-center`)

## Important Files for the Next Session

| File | Purpose |
| --- | --- |
| `src/components/layout/Sidebar.tsx` | **CRITICAL**: Back button and toggle button not functioning - needs debugging |
| `app/pos/meja/page.tsx` | **NEW**: Table management page - needs testing and integration |
| `src/components/layout/Header.tsx` | Blue theme styling - verify styling consistency |
| `src/features/pos/components/CartPanel.tsx` | Border thickening - verify styling consistency |
| `server/index.ts` | Express API entry and route mounts |
| `server/routes/orders.ts` | Order, item, void-log, merge routes |
| `server/routes/auth.ts` | Login, register, me |
| `server/routes/products.ts` | Products, categories, modifiers |
| `server/middleware/auth.ts` | JWT middleware |
| `prisma/schema.prisma` | Database schema |
| `src/lib/api.ts` | Frontend API client |
| `src/store/useCartStore.ts` | Cart, payment, merge, void logic |
| `src/context/AuthContext.tsx` | Auth state |
| `app/login/page.tsx` | Login page |
| `app/pos/page.tsx` | Protected POS page |
| `src/hooks/useSyncManager.ts` | Offline-to-online sync |
| `src/features/pos/components/ProductCard.tsx` | **DEFERRED**: Layout issues with empty/broken images |
| `server/prisma/seed.ts` | Product image URLs updated to picsum.photos |
| `knowledge/07-odoo-alternative-and-roadmap.md` | Phased roadmap against the full requirements |

## Recommended Next Steps

**Priority 1: Fix Critical UI Issues**
1. **Debug Sidebar button functionality** - Investigate why back button and toggle button are not responding to clicks
   - Check for CSS overlays blocking clicks
   - Verify event listener conflicts
   - Test with simpler element structure
   - Consider alternative button placement if header is problematic

2. **Test Table Management Page** - Verify the newly created table management functionality
   - Test page loading at `/pos/meja`
   - Verify table status clicking works
   - Check responsive grid layout
   - Test navigation from sidebar

**Priority 2: Continue Core POS Development**
Pick one lane based on business priority:

1. **Core POS hardening**
   - Fix remaining lint errors.
   - Add unit and E2E tests.
   - Add local image storage for products.
   - Improve error handling and user feedback.

2. **Table, waiter, and kitchen**
   - ✅ Table management page created (needs testing)
   - Add floor plan with table status visualization
   - Add KDS (Kitchen Display System) screen
   - Add KOT printing and multi-printer config
   - Add course fire/hold

3. **Inventory and procurement**
   - Add ingredients, recipes/BOM, and stock movements.
   - Add vendors and purchase orders.
   - Add vendor bill OCR scanning.
   - Add low-stock alerts.

4. **Reporting and operations**
   - Add sales, inventory, and financial reports.
   - Add open/close shift with cash reconciliation.
   - Add expense management.
   - Add management dashboard.

5. **Staff and communication**
   - Add employee records, attendance, scheduling, and payroll.
   - Add customer CRM and loyalty.
   - Add email and WhatsApp integrations.

6. **Odoo evaluation**
   - Review `knowledge/07-odoo-alternative-and-roadmap.md`.
   - Decide whether to stay on the custom stack, migrate to Odoo, or use a hybrid model.

## How to Resume

1. Start the PostgreSQL service.
2. Run `npm run dev` from the project root.
3. Open `http://localhost:3000`.
4. Log in with `admin` / `admin`.

**Important Note**: The dev server may need to be restarted to detect new routes (like `/pos/meja`). If the table management page doesn't load, stop the server (Ctrl+C) and run `npm run dev` again.

If the database was not yet created:

```bash
npm run db:migrate
npm run db:seed
```

## Session-Specific Notes

### UI Theme Changes
- Blue theme (`bg-blue-600`) applied to Header and Sidebar header areas
- All borders thickened to `border-2` for better visibility
- Border colors updated to `border-blue-400` for visual consistency

### Navigation Updates
- Sidebar now shows dynamic menus based on URL path (`/admin` vs `/pos`)
- All menu items have relevant icons for better UX
- "Manajemen Meja" link updated to `/pos/meja`

### New Features
- Table management page created at `app/pos/meja/page.tsx`
- Mock data for 12 tables with status management
- Click-to-change status functionality (Available → Occupied → Reserved)
- Responsive grid layout with visual status indicators

### Receipt Printing Updates (Latest Session)
- **ReceiptModal.tsx**: Changed from `window.open` method to iframe isolation method for printing
  - Creates hidden iframe to isolate receipt content from dashboard
  - Injects all stylesheets from main document
  - Forces single-page print with specific CSS rules
  - Cleans up iframe after printing

- **Receipt.tsx**: Updated with iframe isolation method and navigation improvements
  - Added `useRouter` import from `next/navigation`
  - Changed `handlePrint` from DOM manipulation to iframe isolation method
  - Changed button layout from horizontal to vertical (`flex flex-col gap-2`)
  - Added "Kembali ke Dashboard" button with `router.back()` for state-preserving navigation
  - Removed conditional "Tutup" button
  - Button layout now full-width with `max-w-[400px] mx-auto`

### Known Issues
- **CRITICAL**: Sidebar back button and toggle button not responding to clicks
  - Multiple troubleshooting attempts made without success
  - May require investigation of CSS overlays or event listener conflicts
  - Consider alternative button placement if header area is problematic

## Notes

- The default admin user is `admin` / `admin`.
- The API is bound to `0.0.0.0` so other LAN devices can reach it by the host IP.
- Offline orders are stored in the browser's IndexedDB and synced when the API is reachable.
- Every order uses client-generated UUIDs for idempotent sync.
- New routes in Next.js App Router may require dev server restart to be detected.

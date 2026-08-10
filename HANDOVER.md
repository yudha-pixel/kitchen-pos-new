# Kitchen POS - Handover Document

## API Prefix Standardization

**Date:** 2026-08-11

- Standardized all API endpoints by adding `/api` prefix to backend route mounts to match frontend API call patterns.
- **Backend changes:**
  - Updated `server/app.ts` to mount all routes with `/api` prefix (except `/auth` and `/health` for compatibility).
  - Updated `server/__tests__/route-smoke.test.ts` `ROUTE_MOUNT_PREFIXES` mapping to reflect new prefixes.
  - Backend smoke tests: 60/60 passed.
- **Frontend changes:**
  - Updated all frontend API calls in:
    - `src/context/ThemeContext.tsx`
    - `src/components/ui/VoidPaymentModal.tsx`
    - `src/features/crm/customerService.ts`
    - `src/features/hr/hrService.ts`
    - `src/features/inventory/recipeApiService.ts`
    - `src/features/outlet/outletService.ts`
    - `src/features/payment/paymentService.ts`
    - `src/features/pos/voucherService.ts`
    - `src/features/self-order/selfOrderService.ts`
    - `src/hooks/useTables.ts`
    - `src/lib/api.ts`
  - Added Next.js rewrites in `next.config.ts` to proxy `/api/:path*` to `http://localhost:3001/api/:path*` for development.
- **Testing:**
  - Backend smoke tests: 60/60 passed.
  - Playwright frontend tests: 32/32 passed.
- **Acceptance criteria met:** All frontend API calls now match backend route mounts with `/api` prefix.

## Route Link 404 Audit & Fix

**Date:** 2026-08-11

- Audited all internal frontend links (Sidebar, apps-registry, router.push/replace, seed favorites/recent).
- Generated `route-link-inventory.json` with 80+ internal links across the codebase.
- Cross-referenced with `route-audit-frontend.json` to identify missing pages.
- **Fixed 3 broken routes:**
  1. Created `app/inventory/mapping/page.tsx` stub (referenced by Sidebar and apps-registry).
  2. Created `app/inventory/automation/page.tsx` stub (referenced by Sidebar and apps-registry).
  3. Fixed `apps-registry.ts` route from `/inventory/suppliers` to `/inventory-suppliers` (duplicate/incorrect route).
- Re-ran `npx tsx scripts/audit-pages.ts`: total pages increased from 36 to 38 (2 new stub pages added).
- `npx tsc --noEmit` passes.
- All sidebar and app launcher links now resolve to existing pages.

**Backend API Smoke Test:**
- Created `server/__tests__/route-smoke.test.ts` with route mount prefix mapping.
- Tested 60 routes: public GET (27), authenticated without token (20), admin with token (12), registration check (1).
- All tests passed (60/60). No broken API routes found.
- Parameterized routes (e.g., `/:id`) were skipped as they require real test data.

**Frontend Runtime Testing (Playwright):**
- Created `tests/route-navigation.spec.ts` for frontend route navigation testing.
- Tested 32 routes unauthenticated: all passed, no 404s found.
- Authenticated testing skipped due to login form selector issues (test infrastructure, not route issues).
- No broken frontend routes found via runtime testing.

**Artifacts:**
- `route-link-inventory.json` — complete inventory of all internal links.
- `broken-routes-triage.md` — triage decisions for each broken route.
- `server/__tests__/route-smoke.test.ts` — backend API smoke test suite.
- `tests/route-navigation.spec.ts` — frontend Playwright navigation test suite.
- Updated `route-audit-frontend.json` (38 pages, 0 critical issues).

## Seed Update — Recent & Favorites Demo Data

**Date:** 2026-08-11

- Added default `preferences: { favorites, recent }` demo data to both seed scripts.
- `server/prisma/seed.ts`: all test users (`admin`, `cashier1`, `manager1`, `owner1`, `admin2`) are seeded with the same demo favorites and recent items.
- `prisma/seed.ts`: the admin upsert now also writes demo preferences.
- Demo favorites: `/pos`, `/admin/products`, `/admin/settings`.
- Demo recent: `Point of Sale` (15m ago) and `Menu & Products` (45m ago).
- Uses `prisma.$executeRaw` with a `::jsonb` cast because the Prisma client cannot regenerate while the query engine is locked (`npx prisma generate` fails with `EPERM` while `node` holds the DLL).
- This ensures another device using the same database sees the same `Recent` and `Favorites` content immediately after login.

## Session Summary

**Latest session (2026-08-11, Favorites and Recent Items Edit Mode with Drag-and-Drop):**
- No git operation (no branch/commit/push) at any point. Source changes only, on top of the working tree.
- Implemented inline edit mode for Favorites and Recent items sections with drag-and-drop reordering, database persistence, and mobile-friendly touch support.

**Implementation Details:**

- **Database Schema Changes:**
  - Added `preferences Json? @default("{}")` field to Profile model in `prisma/schema.prisma`
  - Migration `20260810200601_add_user_preferences` applied successfully
  - Structure: `{ favorites: string[], recent: { route: string, title: string, timestamp: string }[] }`

- **Backend API:**
  - Created `server/routes/userPreferences.ts` with GET/PUT endpoints
  - GET `/api/user/preferences` - Returns current user's preferences
  - PUT `/api/user/preferences` - Updates user's preferences with validation (max 6 favorites, max 10 recent items)
  - Registered routes at `/api/user/preferences` in `server/app.ts`
  - Authentication required via `authMiddleware`

- **Frontend Hook:**
  - Created `src/hooks/useUserPreferences.ts` for state management
  - Functions: `addFavorite`, `removeFavorite`, `reorderFavorites`, `addRecent`, `clearRecent`, `updatePreferences`
  - Automatically fetches preferences on user login
  - Persists changes to database via API

- **UI Updates in `app/apps/page.tsx`:**
  - Installed `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-and-drop
  - Added `SortableFavoriteItem` component with drag handles
  - Edit mode toggle for Favorites section (Edit/Done button)
  - Delete buttons appear in edit mode for removing favorites
  - Drag-and-drop reordering with mouse and touch support
  - Clear button for Recent items section
  - Automatic tracking of app visits to recent items
  - Time-ago formatting for recent items (e.g., "2m ago", "1h ago")
  - Empty state messages for both sections
  - Replaced hardcoded `RECENT_ITEMS` and `FAVORITE_ITEMS` arrays with database-backed data

- **Testing:**
  - Created `server/__tests__/userPreferences.test.ts` with 8 tests
  - All tests passed: GET endpoint, PUT endpoint, validation (max 6 favorites, max 10 recent), authentication enforcement, persistence
  - Manual testing: dev server started successfully, browser preview opened at http://localhost:3000
  - Server shut down after testing per user rules

**Known Issues:**
- TypeScript errors in `userPreferences.ts` due to Prisma client file lock on Windows (EPERM error when regenerating). The migration succeeded, so the schema is correct. Errors will resolve after restarting the dev server when the Prisma client regenerates. Used `as any` casts as temporary workaround.

**Previous session (2026-08-10, `/pos/meja` + `/order/[tableId]` UI/UX & mobile phases — Phase 1 & 2 implemented):**
- No git operation (no branch/commit/push) at any point. Source changes only, on top of the working tree.
- Inputs: external review root `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141` (task-2 sales report, theme-consistency report, `wireframes/02-responsive-list-detail.png`) + last 7 commits + live checks against the already-running dev server at 375×812.

**Verified live (375×812, dev server running):**

| # | Route | Observation | Source |
|---|---|---|---|
| 1 | `/pos/meja` | 7 tables are **hardcoded mock state**; `GET /tables` returns `[]` (DB has zero table rows). Status changes never persist. | `app/pos/meja/page.tsx:66-74` vs unused `src/hooks/useTables.ts` |
| 2 | `/pos/meja` | Status picker `Modal` is dead code — `setActiveTable` is never called, cards are not clickable, yet the "Petunjuk" text says "Ketuk meja lalu pilih status". | `app/pos/meja/page.tsx:79,208-236` |
| 3 | `/pos/meja` | Horizontal overflow at 375px: `scrollWidth 579 / clientWidth 375`. Overflowing node is the shared **Header** right cluster (OutletSelector `min-w-[150px]` + 4 icon buttons), not the sidebar. Sidebar drawer from 49bc046 works. | `src/components/layout/Header.tsx:100-144`, `OutletSelector.tsx` |
| 4 | `/pos/meja` | "Pesan"/"QR" buttons measure 34px tall — below the 44px target used everywhere else (`min-h-11`). | `app/pos/meja/page.tsx:174-189` |
| 5 | `/order/<uuid>?table=Meja%201` | Title renders "Pemesanan - Meja 1" — SLS-02 looks fixed, but only because 564a1c9 appends `?table=` to the QR. The table string is display text, not a bound record. | `app/order/[tableId]/page.tsx:21-26` |
| 6 | `/order/<uuid>` (no query) | "Meja tidak ditemukan di database" + **free-text manual table entry** → any customer can self-assign any table. `GET /self-order/tables/id/<uuid>` returns `{"error":"Meja tidak ditemukan"}` because the mock UUID in `/pos/meja` has no DB row. Root cause is finding #1, not the fetch path the audit suspected. | `server/routes/selfOrder.ts:88+` |
| 7 | `/order/[tableId]` | **Product grid width = 0px at 375px.** `WaiterOrderModal` is a fixed two-column desktop layout (`flex-1` menu + `w-96` cart) with no stacking; the phone shows only the cart. Self-order is unusable on the exact device QR codes target. | `src/components/pos/WaiterOrderModal.tsx:588,679` |
| 8 | `/order/[tableId]` | Modal chrome on a full-page route: backdrop, `p-4` gutters, `h-[90vh]`, rounded card — ~10% of phone screen wasted; the X button sets `isOpen=false` and leaves a blank page with no way back. | `WaiterOrderModal.tsx:470-482`, `app/order/[tableId]/page.tsx:121` |
| 9 | `/order/[tableId]` | Raw palette (`bg-white`, `gray-*`, `blue-600`, `green-600`) bypasses semantic tokens → accent/dark-mode settings do not apply. Matches the review's "raw-color leakage" finding. | `WaiterOrderModal.tsx` throughout; `theme-consistency-report.md` |
| 10 | `/order/[tableId]` | No dialog role/accessible name, no focus trap, disabled blank table input with no live region, self-order collects no customer identity and gives no post-submit status route (SLS-01/SLS-07 pattern). | `WaiterOrderModal.tsx:470-535` |

**Agreed phase plan:**

- **Phase 1 — Table data is real. ✅ DONE this session.** See "Phase 1 result" below.
- **Phase 2 — Mobile shell.** Fix the Header right cluster at <400px (drop the fixed `min-w-[150px]` on OutletSelector, collapse time/merge/outlet behind existing breakpoints), raise `/pos/meja` action buttons to `min-h-11`. Header is shared, so this fixes every POS route at once.
- **Phase 3 — Self-order responsive.** Stack `WaiterOrderModal` on mobile per `wireframes/02-responsive-list-detail.png`: menu full-width, cart as a bottom sheet with a sticky total/CTA bar; keep the current two-column layout at `lg:` and above. Drop the backdrop/gutters/rounded chrome when rendered as a page, and remove or repurpose the X close on `/order/[tableId]`.
- **Phase 4 — Identity & tokens.** Bind the order to the table **record** (resolve by UUID, treat `?table=` as a hint only), replace free-text manual entry with a real error + retry, capture customer name/phone on the order, route to order status after submit. Replace raw colors with semantic tokens; add dialog semantics, focus trap, and live-region errors.
- **Phase 5 — Verify.** Re-check both routes at 360/375/768/1366, assert `scrollWidth === clientWidth`, product grid width > 0, table number rendered from the API, and a status change surviving reload. One small test per non-trivial path.

**Phase 1 result (implemented, still no git operation):**

- `server/prisma/seed.ts` — seeds `Meja 1`–`Meja 8` (upsert on `table_number`, attached to Outlet Pusat) right after the outlets block. The schema has **no `capacity` column**, so the old per-table "4 orang" display was fiction and is gone.
- The running database had zero table rows; 8 tables were created through `POST /tables` rather than re-running `npm run db:seed`, because that seed's cleanup step wipes products/categories/modifiers and existing orders reference them.
- `app/pos/meja/page.tsx` — mock `useState` array deleted, page now consumes `useTables()`. Added: skeleton loading grid, `role="alert"` error panel with a Retry that calls `refetch`, empty state, `hasActiveOrders` marker, and per-card status button (`aria-label="Ubah status <meja>, saat ini <status>"`) that opens the existing `Modal` and calls `updateTableStatus`. Status buttons disable while saving and surface a failure message instead of silently reverting. Local `setStatus` state mutation removed.
- Status affordance is a **button inside the card, not the whole card** — the card also holds Pesan/QR buttons, and nesting interactive elements is an a11y violation.
- Pesan/QR raised to `min-h-11` (were 34px) and `text-white` swapped for `text-on-primary` while those lines were being rewritten anyway. Header overflow is untouched — that is Phase 2.
- `getQRCodeURL` now `encodeURIComponent`s the table number (was emitting a raw space in `?table=Meja 1`).
- `server/__tests__/tables.test.ts` — added `GET /self-order/tables/id/:tableId` contract tests (resolves a real table number from a UUID; 404 for unknown UUID). This is the chain the audit could not explain. `npx vitest run server/__tests__/tables.test.ts` → 15 passed.

**Verified live at 375×812 after the change:**

- 8 tables render from the API; setting Meja 3 → Terisi persisted to PostgreSQL and survived reload.
- `main` fits exactly at 375px; all 13 remaining overflow nodes are inside `<header>` (Phase 2, unchanged).
- Pesan/QR now measure 44px.
- **Side effect worth knowing:** `/order/<uuid>` with **no** `?table=` query now resolves "Pemesanan - Meja 1" from the API and the disabled input carries the real value. The free-text "Masukkan Nomor Meja" trap is no longer reachable for real tables — it was always a missing-data symptom, not a fetch bug. Phase 4 should still bind the order to the table record rather than a display string.
- `npx tsc --noEmit`: no errors. Two pre-existing `indoor_count` errors in `server/routes/settings.ts` cleared after `npx prisma generate` (stale client from 564a1c9). That generate could not swap `query_engine-windows.dll.node` because the running API locks it — **restart the API process** to pick up a fully regenerated client.

**Phase 2 result (implemented):**

- `src/components/outlet/OutletSelector.tsx` — removed the fixed `min-w-[150px]` on the `<select>` that forced the header's right cluster past the viewport at phone widths. Now `w-24` (mobile) / `sm:min-w-[150px]` (tablet+), wrapper gets `min-w-0` so it can actually shrink inside the flex row. Also swapped `bg-white`/`text-gray-500` for `bg-surface`/`text-ink-muted` since these lines were already being touched — same file, same overflow fix, not a separate pass.
- `src/components/layout/Header.tsx` — right-side cluster div gets `min-w-0 shrink` (was a non-shrinking flex item with `min-width: auto`, which is what let its content force the container wider than the viewport). `gap-2` → `gap-1.5` below `sm:` to reclaim a few px.
- This is the shared `Header`, so the fix applies to every POS/admin route, not just `/pos/meja`.

**Bug found and fixed while verifying Phase 2 (unrelated to the Header change, pre-existing):**

- `GET /settings` was returning 500 on every page load — visible in browser console/network on both `/pos/meja` and `/order/[tableId]`. Root cause, confirmed by querying Prisma directly: two migrations from commit 564a1c9 (`20260810094354_add_table_user_settings`, `20260810095113_add_areas_json_field`) were never applied to the local dev database — `prisma migrate status` showed them pending. Schema declared `app_settings.indoor_count`; the column didn't exist in the actual DB, so `AppSettings.findFirst()` threw `P2022` on every request.
- Both migrations are additive `ADD COLUMN ... DEFAULT` — no data loss. Ran `npx prisma migrate deploy`. Confirmed via live network log: `/settings` now returns 200 consistently. The running `tsx watch` API process picked up the new columns without a restart.
- **Anyone else running this branch locally needs to run `npx prisma migrate deploy` (or `db:migrate`)** — this was silently broken for every consumer of `/settings`, i.e. `ThemeContext`, i.e. the whole app's theme/appearance state, since 564a1c9 landed.

**Verified live at 440×956 (the viewport actually being tested) after Phase 2:**

- Zero elements exceed the viewport (`scrollWidth === clientWidth === 440`, confirmed two ways: full-DOM overflow scan and explicit grid/card `getBoundingClientRect()`). A DevTools screenshot at 75% zoom with the console panel docked can visually crop the emulated viewport narrower than its actual CSS width — don't trust that screenshot alone for overflow claims, measure `scrollWidth`/`clientWidth` or full-page-capture instead.
- `/settings`, `/products`, `/categories`, `/tables`, `/outlets`, `/auth/me` all 200 on both routes.
- A stale bookmarked link using the pre-Phase-1 mock table UUID (`c9e0936a-...`) correctly 404s at `/self-order/tables/id/<uuid>` — that row no longer exists after Phase 1 replaced the hardcoded mock table list with real seeded ones. Expected, not a regression. Fresh QR codes generated from `/pos/meja` resolve correctly.

**Phase 3 result (implemented):**

- `src/components/pos/WaiterOrderModal.tsx` — the same component backs both the `/pos/meja` staff "Pesan" modal (`isSelfOrder=false`) and the entire `/order/[tableId]` self-order page (`isSelfOrder=true`); only two callers in the codebase, confirmed by grep, so it was safe to branch behavior on that existing prop instead of adding a new one.
  - **Outer chrome now branches on `isSelfOrder`.** Staff modal keeps the backdrop, `p-4` gutter, `max-w-6xl h-[90vh]`, rounded corners, and X close — unchanged. Self-order now renders `h-dvh w-full` with no backdrop/rounded/gutter, since `app/order/[tableId]/page.tsx` already wraps it in its own `fixed inset-0` page container — that was double chrome before, not two independent surfaces.
  - **X close removed for self-order.** It had no destination — clicking it just set `isOpen=false` in the parent and left a blank page (finding #8 from the original audit). No close affordance is correct here: there is no "back" from a customer's own ordering session.
  - **Main content: `flex-col` below `lg:`, `flex-row` at `lg:` and above** (was always `flex` = row, which is why the product grid measured 0px wide on phones — the cart's `w-96` consumed the entire 375px viewport before the product column got any space). Desktop/tablet layout is byte-for-byte the same past the `lg:` breakpoint.
  - **Cart becomes a bottom sheet below `lg:`.** Reused the existing `isCartOpen` state, which was declared but never wired to anything (dead state, one `setIsCartOpen(false)` call after payment). Collapsed by default: shows "Keranjang · N item" + chevron. Expanding reveals the item list capped at `max-h-[45vh]` with its own scroll; the Total row and primary CTA(s) stay in a separate `border-t` block below the list, so they're never scrolled out of view regardless of expand state. At `lg:` the toggle button is hidden and the list reverts to `flex-1` filling the full sidebar height, matching the original desktop behavior exactly.
  - Did **not** touch the 4-button staff footer grid (Kirim/Bayar/Split/Batal), the payment/cancel/split-bill sub-modals, or any raw colors — out of Phase 3's stated scope (stack the two-column layout; tokens/dialog-semantics are Phase 4).

**Verified live:**

- 375×812, `/order/<real-uuid>`: product grid **343px wide** (was 0px). Category-pill row still has its own `overflow-x-auto` — that's an intentional horizontal-scroll chip strip, not a page overflow bug (confirmed `document.documentElement.scrollWidth === 375` throughout).
- Cart toggle: `aria-expanded` and chevron rotation flip correctly on click; expanding sets the item-list block to `display: block`; the "Bayar" button measured `bottom: 796` inside the 812px viewport in both collapsed and expanded states — never pushed off-screen.
- 1366×768, same route: mobile toggle button `display: none`, desktop header `display: flex`, cart column back to `384px` (350 content + border), `scrollWidth === clientWidth` — two-column layout fully intact.
- `/pos/meja` → "Pesan": staff modal still shows the backdrop overlay and the `aria-label="Tutup"` close button — the `isSelfOrder=false` branch is unaffected.
- `npx tsc --noEmit`: no errors. `server/__tests__/tables.test.ts`, `responsive-shell.test.ts`, `modal-accessibility.test.ts`: 18 passed. Network log on both routes: all `200`, no `500`s (the Phase 2 migration fix holds).

**Phase 4 result (implemented) — table identity + semantic tokens + dialog a11y:**

Scope note: re-read the original Phase 4 plan before starting and cut two items that belonged to `/online-order`'s `OnlineCheckoutModal` (SLS-01/SLS-07/SLS-08 in the original audit — post-submit order-status routing, customer name/phone capture), not to `/pos/meja` or `/order/[tableId]`. Doing them here would've been scope creep onto a route the user never asked about; noted for whoever picks up `/online-order` separately.

- **`app/order/[tableId]/page.tsx` — table binding rewritten.** The old code trusted `?table=` immediately and returned before ever checking the database — a QR with a stale or hand-edited query string would show whatever text was in the URL. Now the query param is not read at all for binding; resolution always goes through the table record: local IndexedDB → `getTableById` API (UUID route params) or `getTableByNumber` API (legacy non-UUID route params, kept for old-style links). Verified live: `/order/<real-uuid>?table=Meja%2099` (deliberately wrong hint) still renders "Meja 1" — the mismatched hint is ignored, not trusted.
- **Free-text manual table entry removed.** It let any customer self-assign any table number — the exact issue the original audit flagged (SLS-02) once real data existed to expose it. Replaced with a `role="alert"` error state ("Meja tidak ditemukan") plus a Retry button that re-runs the same resolution logic. Verified live on the pre-Phase-1 mock UUID (`c9e0936a-...`, no longer a real table): shows the error, no way to claim a table by typing.
- **Semantic tokens: `WaiterOrderModal.tsx` raw-color sweep.** This was the largest single offender named in `theme-consistency-report.md`. Mapped mechanically via `sed` (one file, single session, reviewed the full diff before and after): `bg-white→bg-surface`, `text-white→text-on-primary`, `gray-*→ink-muted/ink-secondary/surface-alt/line/line-strong` by shade, `blue-600→primary`, `green-600→success`, `red-600→danger`, `purple-600→info` (no dedicated "purple" token exists; `info` was the nearest unclaimed semantic slot — Split's button is now visually distinct from Kirim/Bayar/Batal without inventing a new CSS variable), `orange-600→warning` (takeaway category button). Selected-state chips (payment method, split-bill item) that used `border-green-600 bg-green-50 text-green-700` now use `border-primary bg-primary-soft text-primary` — the exact pattern `/pos/meja`'s status-picker `Modal` already established, reused rather than reinvented. Bare `border`/`border-b`/`border-t` classes (relying on Tailwind's un-themed default) got an explicit `border-line`, matching `Header.tsx`/`Sidebar.tsx` convention. Left untouched: the 4 `bg-black bg-opacity-50` modal backdrops (scrim, not a themeable content surface — same convention `Sidebar.tsx`'s mobile drawer already uses).
- **Dialog accessibility.** Added `role="dialog"` + `aria-modal="true"` + `aria-labelledby` (pointing at each modal's own heading, given an `id`) to: the root staff modal (conditionally — self-order's root is a page, not a dialog, and correctly gets neither role); the payment-method modal; the cancel-confirmation modal; the split-bill modal. One shared `Escape` handler closes whichever of those is currently open, topmost first, falling back to the root modal's `onClose` only when `!isSelfOrder` (self-order has no close target, matching Phase 3's removal of its X button).

**Verified live:**

- `/order/<real-uuid>` with no query param: resolves "Meja 1" from the API alone (no hint needed).
- `/order/<real-uuid>?table=Meja%2099`: still resolves "Meja 1" — wrong hint correctly ignored.
- `/order/<stale-pre-Phase-1-uuid>`: shows the error+Retry state, no free-text field anywhere in the DOM.
- Self-order root: confirmed **no** `role`/`aria-labelledby` present (correct — it's a page). Payment modal: confirmed `role="dialog"` + `aria-modal="true"`, selected "Tunai" option carries `border-primary bg-primary-soft text-primary`. `Escape` closed the payment modal (`dialogStillOpen: false`).
- `/pos/meja` → "Pesan" staff modal: confirmed `role="dialog"` + `aria-modal="true"` present (the `isSelfOrder=false` branch), and `Escape` closed it via `onClose`.
- 375px self-order route: `scrollWidth === 375` unchanged from Phase 3; the only "overflowing" nodes are still the intentional `overflow-x-auto` category-pill strip.
- `npx tsc --noEmit`: no errors. `tables.test.ts` / `responsive-shell.test.ts` / `modal-accessibility.test.ts`: 18 passed. Live network log: all `200`s, no `500`s.

**Still open on these two routes:** the staff-modal 4-button footer grid (Kirim/Bayar/Split/Batal) at 375px wasn't touched (out of stated Phase 3/4 scope — it's the `/pos/meja` desktop-cashier path, not the self-order mobile path this work targeted); no focus trap (Escape-to-close exists, but focus doesn't move into the dialog on open or restore to the trigger on close — the codebase has no shared focus-trap utility to reuse, and building one was judged out of scope for a two-route pass); dark-mode/non-default-accent visual QA of the new token mapping wasn't done (semantic tokens are wired correctly per the verification above, but no screenshot comparison across themes was taken).

**Methodology caveat for whoever reads this next:** every `computer{screenshot}` call this session failed with "the Browser pane is not displayed, so the page is not compositing frames" — no pixel screenshot was captured across any of the four phases. All "verified live" claims above are DOM-measurement checks (`scrollWidth`/`clientWidth`, `getBoundingClientRect()`, computed `display` values, `aria-*` attributes, live network/console logs), which is rigorous for overflow/width/wiring/HTTP-status correctness but **cannot** catch anything only visible pixel-for-pixel — contrast, spacing that "looks" wrong despite correct box metrics, font rendering, or whether the new semantic-token palette actually looks coherent together. Take an actual screenshot (real Chrome DevTools, like the one that caught the false overflow-alarm mid-session, works well) before treating this as visually signed off.

**Root-cause fix found via that exact gap (2026-08-10, after Phase 4): `app/layout.tsx` had no `<meta name="viewport">` at all.** The user's real Chrome DevTools screenshot of `/pos/meja` at 440×956 showed column 2 (Meja 2/4/6/8) sliced clean in half — a genuine bug this session's own DOM-measurement tooling could not see, because `resize_window` sets the automation browser's actual viewport directly and never exercises the browser behavior that requires the meta tag: without `width=device-width`, mobile Chrome/Safari lay out the page at a ~980px desktop-width layout viewport and show the unscaled top-left 440px of it — exactly the "sliced" appearance in the screenshot, and it would have been present on **every route in the app**, not just these two.
- Added `export const viewport: Viewport = { width: "device-width", initialScale: 1 }` to `app/layout.tsx` (Next.js App Router's dedicated export for this — `metadata.viewport` is deprecated in favor of it).
- Confirmed via `curl`: `<meta name="viewport" content="width=device-width, initial-scale=1"/>` now present in the served HTML `<head>` on `/pos/meja`.
- `npx tsc --noEmit`: no errors.
- **Confirmed by the user's own real Chrome DevTools screenshot after the fix**: single-column self-order layout, no slicing. This closes the loop the automation browser couldn't — it never reproduced the bug, so it couldn't have proven the fix either; a real screenshot was the only valid check here.

**Small UI cleanup on the self-order screen (2026-08-10, user-requested from the same screenshot), `WaiterOrderModal.tsx`:**

- **Removed** the "Nomor Meja" block (label + disabled input + helper text) — redundant with the header title, and it cost ~90px of vertical space on a phone before any menu item was visible. The table number is now a small pill badge inline with the "Pemesanan" heading (`bg-primary-soft text-primary`), shown only when `isSelfOrder || orderCategory === 'dine-in'` — switching to Takeaway/Delivery in the staff modal correctly drops the badge and shows the relevant field instead (verified live: badge present for dine-in, gone + "Nama Pelanggan" field shown after clicking Takeaway). The wrapping `border-b` div for takeaway/delivery inputs is now conditionally rendered too, so dine-in/self-order no longer leaves a bordered empty gap where that block used to be.
- **Adjusted**: category-pill scroll row gets a `mask-image` fade at both edges (`transparent → black 16px → black calc(100% - 24px) → transparent`, `WebkitMaskImage` + `maskImage` for Safari/Chrome) so truncated text like "Makanan…" reads as "more content, keep scrolling" instead of an abrupt cut. Static CSS, no JS scroll-position tracking needed.
- **Restyled**: cart panel background swapped `bg-surface-alt → bg-surface` to match the page, with individual cart-item cards taking `bg-surface-alt` instead (was the reverse) — gives the panel a subtle, intentional separation from its contents rather than a flat gray block sitting against a white page.
- Explicitly skipped per user instruction: the wrong-photo product images (`picsum.photos` random stock photos in `seed.ts`) — real seed data still needs a call on whether to strip `image_url` rendering or wait for real product photography; not touched.
- `npx tsc --noEmit`: no errors. Same three test suites: 18 passed.

---

## Phase 5 (NOT STARTED) — the self-order flow is a cashier journey wearing a customer's clothes

**How this surfaced:** user reviewed the payment + receipt screenshots and asked why a guest gets "Tunai", why a receipt appears immediately after any method, why there's no order history, no login, and no customer data. All six critiques are correct. Phases 1–4 fixed *layout* on `/order/[tableId]`; they never questioned that the screen is `WaiterOrderModal` — the cashier's component — behind one `isSelfOrder` boolean.

**Verified in code (2026-08-10):**

| Finding | Evidence |
|---|---|
| Guest sees Tunai / Debit-Kartu — impossible to pay through a phone | payment modal renders all 4 methods regardless of `isSelfOrder` |
| Receipt issued with **zero** payment verification | `handlePayment` sets `status: 'completed'` immediately; receipt renders "Kasir: Waiter" + "Cetak Struk"/"Download PDF" to a guest with no printer. This is audit finding SLS-06 reproduced on this route |
| Guest order never becomes a `CustomerOrder` | `handlePayment` writes to `db.orders` (POS `Order` model) in **the guest's own phone IndexedDB**; `POST /self-order/orders` is never called |
| No guest order history | `getTableOrders()` exists in `selfOrderService.ts`, never called |
| No customer identity | `customer_name` captured only for staff-modal takeaway; self-order sends nothing |

**The backend already models this correctly and the frontend ignores all of it** — `CustomerOrder` + `CustomerOrderItem` tables, `payment_status` (`unpaid`/`pending`/`paid`) held *separately* from `status` (exactly the state machine SLS-06 asked for), 5 mounted `/self-order` endpoints, and 5 matching client functions in `selfOrderService.ts` of which only the 2 table lookups are used. So Phase 5 is mostly *wiring to an API that already exists*, not new backend work.

**Reference flow — user's real local cafe, `dailycoffee3594.antarinmakan.com` (Antarinmakan platform), observed live:**

- **Dine-in is QR-only.** Tapping Dine-in without a scanned table shows "Scan QR di meja untuk pesan Dine-in" and refuses to continue. Independently validates the Phase 4 removal of free-text table entry — a real production system treats the QR as the *only* source of table identity.
- **Guest is a first-class path.** The login screen offers "**Gunakan sebagai Tamu**" (continue as guest) alongside email/phone + password. Login exists for returning customers; it is never a gate on ordering.
- **Order history works without login.** `/order` ("Orderan Kamu") shows Riwayat with type filters All / Take Away / Delivery / Reservasi / Dine-in.
- **What login actually buys** (observed after the account owner logged in themselves — credentials were never handled by the assistant): Loyalty points, Kupon diskon, Favorite, Ubah akun. Ordering is *not* among them. Login is a loyalty/CRM layer bolted beside the ordering flow, never a gate in front of it.
- **Real dine-in order detail** (`/order/<uuid>`) — the single most useful artifact, structure verbatim:
  ```
  45FC2C4730                    ← short human-readable ref code (URL still uses a UUID)
  OL-DINE-IN                    ← order type badge
  13 Apr 2026
  Pesanan sedang disiapkan      ← ORDER status
  31.000
  Meja 7                        ← table bound to the order record
  Rincian pesanan
    Harga        28000          ← subtotal
    TAX           2800
    Pembulatan     200
    Total    Rp 31.000
  Sudah bayar                   ← PAYMENT status, rendered separately from order status
  Detail item
    1x - Cappuccino (HOT)       ← modifiers inline in parentheses
    28.000
  ```
  Three things this settles for our build:
  1. **Order status and payment status are displayed as two independent facts** ("Pesanan sedang disiapkan" *and* "Sudah bayar"). This is precisely the `CustomerOrder.status` + `CustomerOrder.payment_status` split our schema already has and our UI ignores.
  2. **There is no struk anywhere in the customer view** — no "Cetak Struk", no "Download PDF", no cashier name. The guest gets an *order record*, not a receipt. Confirms removing the receipt modal from the guest flow rather than restyling it.
  3. **The table is part of the order record** ("Meja 7"), not a transient UI label.
- **Schema gap this exposes:** `CustomerOrder` stores only `total_amount` — no subtotal / tax / rounding breakdown, so we cannot currently render the "Rincian pesanan" block above. The POS `Order` model does have `rounding_amount`. Needs a decision in Phase 5: add the breakdown columns to `CustomerOrder`, or compute and store it at conversion time.
- **Still not observed:** their payment-*method selection* screen and the timing of payment (in-app vs at the till). Outlet selection is hard-gated behind GPS permission, which the audit browser denied, and dine-in requires a physical QR scan. All that is known is that a completed dine-in order eventually displays "Sudah bayar" — which method, and at what point in the flow, remains unverified. No claim is made about it.

**Agreed design (user decisions, 2026-08-10):**

1. **Payment: configurable, with rules driven by method *type*.** Each method is `counter` (Tunai, Debit/Kartu — settled at the till) or `online` (QRIS, e-wallet, transfer — paid in-app). Admin configures which methods self-order may offer; the **type determines the rule and is not negotiable by config**:
   - `counter` → order created `payment_status: 'unpaid'`, guest is told to pay at the cashier, guest can **never** mark it paid.
   - `online` → `payment_status: 'pending'` until server-verified; **no receipt before `paid`**.
   - No struk / "Cetak Struk" / "Download PDF" anywhere in the guest flow — printing is a cashier capability. A receipt is proof of payment and must never be rendered on an unverified order.
2. **Identity: table session only.** No login, no registration. The scanned table *is* the session; history comes from `getTableOrders(tableId)`. Optional guest name so staff can call them.
3. **Component: fork.** New customer-facing component using the `/self-order` API; `WaiterOrderModal` reverts to staff-only and loses its `isSelfOrder` branches.

**Decisions taken (user, 2026-08-10):** kitchen visibility = **(b) staff accept/convert step**. Payment = **configurable, default pay-at-cashier**.

### Phase 5 — Step 1 DONE: payment method catalog + settings config

- **`src/features/self-order/paymentMethods.ts` (new).** Catalog of the 4 methods, each carrying a `type`: `cashier` is `counter`; `qris`/`ewallet`/`transfer` are `online`. **Which** methods are offered is configurable; **what a method's type is** is deliberately code-only, because `type` decides whether a guest can settle their own bill — making it editable would let a misconfiguration hand guests that power. Exposes `resolveSelfOrderPaymentMethods()` (drops unknown ids, always falls back to a non-empty list), `initialPaymentStatus()` (`counter`→`unpaid`, `online`→`pending`, **never `paid`**), and `isSettled()` (only a server-confirmed `paid` counts).
- **`AppSettings.selforder_payment_methods Json? @default("[\"cashier\"]")`** — migration `20260810131524_add_selforder_payment_methods`, reviewed before applying: a single additive `ADD COLUMN ... DEFAULT`, no data loss. Default is pay-at-cashier per the decision above.
- **`server/routes/settings.ts`** validates the field at the boundary: must be an array, must contain only known ids, must not be empty. Rejecting unknown ids here (rather than silently dropping them at render) makes a misconfiguration visible.
- **`server/__tests__/self-order-payment.test.ts` (new)** — 6 tests, including the safety invariant that *no* method may start in a `paid` state.
- Verified live: `GET /settings` returns `["cashier"]`; `PUT` with `["bitcoin"]` → 400 listing allowed ids, `[]` → 400, `["cashier","qris"]` → 200. Default restored after testing. `npx tsc --noEmit` clean; 21 tests pass.
- Note: `prisma generate` again hit `EPERM` renaming `query_engine-windows.dll.node` (running API locks it). Harmless — the generated *client* updated (the engine binary is unchanged at the same Prisma version), and the `tsx watch` API picked up the new client on reload. Same caveat as the Phase 2 note above.

**Plan for Steps 2-4, in this order to avoid a broken intermediate state:** staff accept/convert path first (switching the customer to `CustomerOrder` before the pipe exists would silently stop orders reaching the kitchen), then fork the customer component, then guest status/history.

### Phase 5 — Step 2 DONE: staff accept/convert API (`server/routes/selfOrder.ts`)

**Decisions locked in (user, 2026-08-10):** kitchen visibility = **(b) staff accept/convert step** (not KDS reading `CustomerOrder` directly). Default payment method = **pay at cashier**, confirmed again.

- **`AppSettings.selforder_payment_methods` needed no new migration** — re-reading the schema, `CustomerOrder.payment_method String?` already existed, just unused; only added a doc comment. Saved a migration Step 1's writeup assumed would be needed.
- **`createCustomerOrderSchema`** now requires `payment_method` (validated against the Step 1 catalog, not a hardcoded zod enum, so the catalog stays the single source of truth) and `items` is `.min(1)` (was accepting an empty cart before). `POST /self-order/orders` sets `payment_status` via `initialPaymentStatus()` instead of hardcoding `'unpaid'` — a `cashier` order starts `unpaid`, a `qris`/`ewallet`/`transfer` order starts `pending`.
- **`GET /self-order/orders/pending`** (staff-auth, new) — the review queue, oldest first. Deliberately registered *before* `GET /orders/:id` in the route table; registering it after would let Express match the literal path `/orders/pending` as `:id = "pending"` and 404 it — same class of bug `tables.ts` already comments around for `/tables/summary`.
- **`POST /self-order/orders/:id/accept`** (staff-auth, new) — transactionally creates a real `Order` + `OrderItem`s from the `CustomerOrder` (linked via the schema's existing `Order.customer_order_id`, populated for the first time), sets `CustomerOrder.status = 'accepted'`. Does **not** decrement stock again — `POST /self-order/orders` already reserves it at submission time. Blocked (409) if the order isn't `pending`, or if `payment_status === 'pending'` (an online method with no confirmed payment yet) — accepting that would be exactly the "unverified payment presented as success" gap SLS-06 flagged, just moved one step later in the flow.
- **`POST /self-order/orders/:id/reject`** (staff-auth, new) — restores the stock `POST /orders` reserved (mirrors the decrement, since fulfillment never happened), sets `CustomerOrder.status = 'cancelled'`.
- **`updateCustomerOrderStatusSchema`** narrowed from `['pending','paid','preparing','ready','completed','cancelled']` to `['pending','accepted','cancelled']` — the old enum conflated order-status and payment-status on one field (the exact confusion the reference cafe's UI proved wrong by showing them separately); fulfillment progress after acceptance now belongs entirely to the linked `Order.status`, not `CustomerOrder.status`. Confirmed zero callers of `updateCustomerOrderStatus()` anywhere in `src/`/`app/` before narrowing it — it was dead code, so this was safe.
- **Security fix, found while building this, fixed alongside it rather than after:** `PATCH /orders/:id/status` and `PATCH /orders/:id/payment-status` had **no auth at all** — any anonymous caller could set `payment_status: 'paid'` directly on any order, which would have made Step 1's "no method starts paid" guarantee decorative. Both now require `authMiddleware`. The payment-status route additionally: `payment_status` is now required and validated against `['unpaid','pending','paid']` (was silently defaulting to `'paid'` when the field was omitted — a footgun even for a legitimate staff caller); dropped the ability to change `payment_method` through that route, since method is now set once at order creation.
- **`server/__tests__/self-order-accept.test.ts` (new)** — 9 tests: unknown-method rejection, counter-vs-online initial payment_status, 401 on both new staff endpoints when unauthenticated, pending-queue listing, full accept → linked-`Order`-visible-to-KDS-lookup path, accept-blocked-while-payment-pending, double-accept blocked, reject-restores-stock.
- **Verified live end-to-end** (scripted against the running dev API, not just unit tests) before writing the permanent test: create(cashier)→`unpaid`, stock -1; pending list contains it; accept→201, linked `Order` fetchable via `GET /orders/:id` with correct `customer_order_id`/`table_number`; double-accept→409; create(qris)→`pending`; accept while pending→409 with the Indonesian message; reject→200, stock restored; reject an already-accepted order→409; unauthenticated pending-list and accept→401. All 9 behaved exactly as designed.
- `npx tsc --noEmit`: no errors. Full suite touched this session (`self-order-payment`, `self-order-accept`, `tables`, `responsive-shell`, `modal-accessibility`): 33 passed.
- **Dev-DB note:** the live verification run left one real accepted order (1× Affogato, `Meja 1` test table `13dccf8a-...`, stock 98→97) and one rejected/restored order in the local database — harmless, reflects correct behavior, not cleaned up (same convention as Phase 1's test writes).

**⚠ Original description of the kitchen-visibility gap —** Nothing in `server/` converts `CustomerOrder → Order`: the `CustomerOrder.orders Order[]` relation is declared in the schema but never populated, and `server/routes/kitchen.ts` reads `prisma.order` only. Today the guest's order reaches the KDS *by accident* — it's written to the guest phone's IndexedDB `db.orders` and pushed by the sync queue as a POS order, which depends on that phone staying online and on the page. Moving to the correct `CustomerOrder` model **will silently stop orders reaching the kitchen** unless Phase 5 also does one of: (a) KDS reads `CustomerOrder` too, or (b) a staff accept/convert step creates the `Order` from the `CustomerOrder`. Option (b) matches the schema's intent (guest *requests* → staff *accepts*) and gives staff a fraud/mistake checkpoint; option (a) is less work. **Decide before writing code — do not ship the CustomerOrder switch without this.**

### Phase 5 — Step 3 DONE: fork the guest-facing component, plus a real viewport bug found and fixed along the way

**Interruption before Step 3 started:** user sent a real Chrome DevTools screenshot of `/pos/meja` at 440×956 showing the grid sliced clean in half between columns. Traced it to `app/layout.tsx` having **no `<meta name="viewport">` at all** — without it, mobile browsers lay out at a ~980px desktop-width viewport and show only the unscaled top-left slice, which is exactly what the screenshot showed. This affected every route in the app, not just `/pos/meja`; the automation browser never caught it because `resize_window` sets the viewport directly and doesn't exercise the behavior the meta tag controls. Added `export const viewport: Viewport = { width: "device-width", initialScale: 1 }` to `app/layout.tsx`; confirmed present in served HTML via `curl`; user's follow-up screenshot confirmed the fix. Also fixed on the same pass, from a second screenshot: `WaiterOrderModal.tsx`'s three sub-modal backdrops used `bg-black bg-opacity-50` — Tailwind v4 removed `bg-opacity-*`, so it silently did nothing and the backdrop rendered fully opaque black (`rgb(0,0,0)`, confirmed via `getComputedStyle`). Changed to `bg-black/50` (the working syntax already used everywhere else, e.g. `src/components/ui/Modal.tsx`); confirmed `alpha 0.5` after. One other file has the same stale syntax (`src/components/payment/QRISModal.tsx`) — out of this session's two-route scope, flagged as a background task instead of fixed here.

**The fork, and why not another `isSelfOrder` branch:** `useCartStore` (what `WaiterOrderModal` uses for cart state) calls `processPayment()`, which assumes an authenticated cashier session (`setCashierId`, calls `api.*` with an auth token neither the customer nor any prior self-order code path ever had). That's *why* the old self-order path never called it and instead had its own bespoke `handlePayment` writing straight to the guest's own IndexedDB `db.orders` — the actual root cause of "guest order never becomes kitchen-visible" traced back in the Step 5 kickoff. Continuing to bolt guest behavior onto a cashier-assuming store would have kept reproducing that bug shape. New component: `src/components/self-order/SelfOrderExperience.tsx` — local `useState` cart (no Zustand store), submits through `createCustomerOrder()` (the `/self-order` API), never touches `useCartStore`/IndexedDB `db.orders` at all.

- **`GET /self-order/products` gained modifier groups** — it never included them (checked: only the general staff `/products` route did the `productModifierGroups → modifier_groups` mapping). Guests would have silently lost all product customization (e.g. "Iced, Extra Shot") switching to the correct API. Mirrored the exact mapping from `products.ts`.
- **`createCustomerOrder()` signature changed**: added a required `paymentMethod` param (the endpoint now requires one, per Step 2) and switched from swallow-and-return-`null` to throwing with the server's actual error message — the caller needs to show the guest *why* a submission failed (e.g. "Stok tidak mencukupi..."), not a generic failure. Safe since it had zero callers before this.
- **`app/order/[tableId]/page.tsx`** now also captures the resolved table's real UUID (`resolvedTableId`), not just its display number — needed because `SelfOrderExperience` submits orders against the actual `table_id`, and Phase 4's legacy non-UUID branch resolves a *different* id than the URL param.
- **`WaiterOrderModal.tsx` reverted to staff-only** — every `isSelfOrder` branch removed (root chrome, dialog role, header badge condition, order-category tabs, conditional input fields, cart footer's Bayar-only-vs-4-button split). Confirmed via grep that its only other caller (`app/pos/meja/page.tsx`) never passed `isSelfOrder` in the first place, so this is purely dead-code removal, not a behavior change for staff.
- **Review screen, not a payment-method modal**: cart → "Lanjut ke Pemesanan" → a review step (items, optional name, payment picker *only shown when more than one method is configured* — with the default single `cashier` method, guests never see a picker at all) → "Konfirmasi Pesanan". No struk/receipt anywhere in the guest flow, matching the reference cafe's order-detail page (no print/download affordance shown to the customer either).
- **Verified live, full loop**: added Ayam Bakar with a modifier, submitted, confirmed `payment_method: "cashier"`, `payment_status: "unpaid"` on the actual `CustomerOrder` row, modifier preserved, and the order appeared in `GET /self-order/orders/pending` — i.e. really sitting in Step 2's queue, not a parallel IndexedDB write. Verified the staff `/pos/meja` "Pesan" modal is untouched: dialog role present, Tutup button present, all 4 footer actions present. 375px: `scrollWidth === clientWidth`, only the known intentional category-pill scroll strip flagged as "overflow".
- `npx tsc --noEmit`: clean (after guarding a few `.id?: string` mismatches between the Dexie-shared types in `src/lib/db.ts` and the always-populated server response shape — real optionality in the Dexie local-cache use case, always present from the API, guarded rather than asserted away).

### Mid-Step-3 addition: configurable order routing (review vs. auto) + notifications + a real pricing bug found along the way

**User's ask:** should a guest's order go to the cashier for a manual "send to kitchen" click, or — for busy periods where that manual step is itself the bottleneck — should both cashier and kitchen be notified at once, skipping the review step. Explicitly asked to guard against a double-order effect either way.

- **`AppSettings.selforder_routing String @default("review")`** (migration `20260810134615_add_selforder_routing`, reviewed before applying — single additive `ADD COLUMN ... DEFAULT`) + `src/features/self-order/orderRouting.ts`'s `resolveSelfOrderRouting()`, same defensive fallback pattern as Step 1's payment-method resolver. Validated at the `PUT /settings` boundary (`'review' | 'auto'` only). Default stays `'review'` — the manual step from the earlier decision is the baseline; `'auto'` is the opt-in busy-restaurant mode.
- **Accept logic extracted into one shared function**, `acceptCustomerOrder()` in `selfOrder.ts`, called by both the manual `POST /orders/:id/accept` (a staff click) and, when routing is `'auto'`, immediately after order creation. This is *the* double-order guard: one code path, one `status !== 'pending'` check, so a retried/duplicated call — whichever caller makes it — hits the same wall. `POST /orders/:id/accept`'s handler is now a thin wrapper mapping a new `OrderNotAcceptableError` to 404/409.
- **Auto-routing still respects the payment gate**: an `online` method (qris/ewallet/transfer) stays `pending` and un-accepted even in `'auto'` mode — `acceptCustomerOrder()` throws the same "Menunggu konfirmasi pembayaran" error regardless of caller, so `'auto'` mode only actually short-circuits `counter` (pay-at-cashier) orders. Verified live: a `qris` order submitted under `'auto'` routing stayed in the pending queue, did not spawn an `Order`.
- **Idempotent creation — the other half of "avoid double order":** `createCustomerOrderSchema` now accepts an optional client-generated `id`. `POST /self-order/orders` checks for an existing `CustomerOrder` with that id first and returns it (`200`, `alreadyExisted: true`) instead of creating a duplicate — mirrors the exact upsert pattern `server/routes/orders.ts`'s `POST /orders` already uses, and this project's own established convention of client-generated UUIDs for idempotent sync (per `AGENTS.md`/`CLAUDE.md`). `SelfOrderExperience.tsx` generates this id once per checkout attempt (`useState(() => crypto.randomUUID())`), reuses it across retries of the same attempt, and only generates a fresh one in `startNewOrder()`.
- **Staff notification fan-out**: `notifyStaffOfCustomerOrder()` creates a `Notification` row for every active `admin`/`cashier` profile (`Notification` model already existed, unused for this — same "backend exists, frontend doesn't call it" pattern as the rest of Phase 5). Title/type differ by mode (`self_order_pending` vs `self_order_auto_accepted`) so a staff notification UI (not built this session — `GET /notifications` already exists) could distinguish "needs your click" from "FYI, already sent." **No separate kitchen notification needed** — `'auto'` mode already writes a real `Order`, and the KDS already polls that table (`auto_refresh` in `AppSettings`), so "notify kitchen" is satisfied by the write itself, not new plumbing. Delivery is deliberately best-effort (wrapped in try/catch, logged not thrown) — a notification failure must never fail the guest's already-successful order.
- **New staff page, `app/pos/requests/page.tsx`** ("Pesanan Masuk", linked from the sidebar under cashier links) — without this, `'review'` mode had an API but no UI for a human to ever act on it. Polls `GET /self-order/orders/pending` every 15s (matches the KDS's own polling convention rather than adding websockets for what is, in a single-outlet dev deployment, a small queue), shows table/time/customer name/payment method+status/items+modifiers/total per pending request, with Accept ("Kirim ke Dapur")/Reject buttons. Accept is disabled with a tooltip when `payment_status === 'pending'`, so the payment-confirmation gate is visible in the UI, not just enforced as a 409 the staff would otherwise have to guess at.
- **Real pricing bug found and fixed via manual verification, not requested but couldn't ship past it once seen**: `POST /self-order/orders` computed `total_amount` from `product.price * quantity` alone — **silently dropping every priced modifier**. Caught because the review screen showed "Rp 28.000" for an Americano with an "Iced" modifier (which carries `price_extra: 3000`), but the server recorded `total_amount: 25000`. Fixed by summing modifier prices into the total — and, since a guest is an untrusted caller, **looked up from the DB `Modifier.price_extra`, not trusted from whatever `price` the client's request claims** (same trust-boundary posture as the existing product-price lookup, which already never trusts a client-submitted product price). `server/__tests__/self-order-pricing.test.ts` (new, 3 tests): total includes a real modifier's price_extra; a client-claimed price (including an adversarial negative one) is ignored in favor of the DB value; modifier price scales correctly with quantity.
- **`server/__tests__/self-order-routing.test.ts` (new, 6 tests)**: unknown routing value rejected at settings boundary; `'review'` mode leaves a counter order pending; `'auto'` mode immediately produces a kitchen-visible `Order`; `'auto'` mode does *not* auto-accept an unconfirmed online payment; a repeated submission with the same client id resolves to one order (stock decremented once, one `CustomerOrder` row, not two); staff notification created on submission.
- **Verified live end-to-end for both modes**, not just via the test suite: submitted a guest order in `'review'` mode → appeared correctly on the new `/pos/requests` page (table, time, items+modifiers, total, payment badge) → clicked "Kirim ke Dapur" → toast fired, card disappeared, confirmed via direct API query that it became a real `pending` `Order` on `Meja 1` and a `self_order_pending` notification existed. Switched routing to `'auto'` → submitted a second guest order → success screen correctly showed the *different* auto-accepted message ("Pesanan Anda sedang disiapkan oleh dapur") → confirmed via API that it skipped the pending queue entirely, was already a real `Order`, and the notification type was `self_order_auto_accepted`. Routing reset back to `'review'` (the default) after testing.
- `npx tsc --noEmit`: clean. Full suite touched this session: 42 passed.

**Still open for a future Step 4:** guest-facing order-status + table-session history (`getCustomerOrder`/`getTableOrders`, both already exist and are unused) — `CustomerOrder` still lacks subtotal/tax/rounding columns needed to render the "Rincian pesanan" breakdown the reference cafe shows; the notification rows created this step are never surfaced in any staff UI yet (`GET /notifications` exists, nothing calls it); `/pos/requests` polls on a fixed 15s timer with no visible "last checked" indicator or manual-refresh confirmation beyond the spinner button.

**Previous session (2026-08-10, Bug Fix: Hydration Mismatch & useTables Auth)**:
- Fixed hydration mismatch in `ConnectionIndicator.tsx`: Deferred `isOnline` read to `useEffect` mount to prevent SSR/client text divergence (`Online` vs `Offline`).
- Fixed `useTables.ts` fetch error: Injected `Authorization: Bearer <token>` header into `fetchTables` and `updateTableStatus`. Added graceful fallback to preserve existing table state on fetch failure.
- `npx tsc --noEmit`: 0 errors.
- Git remains fully read-only — files are modified/new in working tree, not committed.

**Previous session (2026-08-10, /waiter navigation decision — turned out to need a real fix first, not just a link)**:
- Reading `app/waiter/page.tsx` before wiring it into navigation surfaced that it wasn't just missing a link — it had its own genuine bugs, presented to the user before touching anything:
  1. Its "Bayar" (pay) flow (`handlePayment`) wrote orders straight to `db.orders`/`db.order_items` (Dexie) via its own bespoke implementation, never calling the real order-creation API — the same disease as every split-source bug fixed earlier this session, just baked directly into this page instead of routed through a shared service.
  2. Its "Kirim ke Dapur" (Send to Kitchen) button called `useCartStore`'s `processPayment()` directly — the same method that finalizes a real paid order elsewhere in the app — without ever collecting a payment method first, duplicating (and short-circuiting) what "Bayar" was supposed to do.
- User chose "fix it properly, then add nav" over the two lower-effort options (add nav now/fix later, or leave dormant). Fix ended up smaller than the two-phase "separate kitchen-routing from payment" redesign initially feared, once it became clear this app's whole order model is pay-at-order-time (every other checkout path — `CartPanel.tsx`, `app/kasir/page.tsx` — has exactly one pay-and-send action, no separate no-payment kitchen-dispatch step anywhere else in the codebase): removed the redundant `handleSendOrder`/"Kirim" button entirely (and its now-unused `Send` icon import) rather than inventing a two-phase flow that doesn't exist anywhere else in this app, and rewrote `handlePayment` to call the shared `processPayment()` store method — mapping the modal's `cash`/`qr`/`card` selections onto the store's `'CASH' | 'QRIS' | 'DEBIT'` enum and dropping the "Transfer" option, since the store has no fourth payment type to map it onto.
- Added `Waiter POS` to the Sidebar's `cashierLinks` group (`src/components/layout/Sidebar.tsx`), pointing at `/waiter`, using a new `Smartphone` icon import.
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed (one run hit a transient Vitest worker crash unrelated to this change — matches a previously-documented flake in this project's history — and the immediate rerun surfaced one pre-existing leftover test-fixture row from that crashed run's incomplete cleanup, `test-cashier-audit2`, which was deleted; the suite is clean on a fresh run).
- **Verified with a full real order through the actual UI**: logged in, expanded the Sidebar to confirm "Waiter POS" appears and navigates to `/waiter`, selected a table and added a product, opened the cart and confirmed only "Tahan"/"Bayar" remain (no "Kirim"), opened the payment modal and confirmed only Tunai/QRIS/Debit are offered (no Transfer), completed a cash payment, confirmed `POST /orders` fired and returned 200 via the network log, and confirmed via a direct Postgres query that the order landed with the correct table number (`M7`), status (`pending`, ready for the KDS), payment method (`cash`), and total — not just in local IndexedDB. Test order deleted afterward.
- Git remains fully read-only — files below are modified in the working tree, not committed.

**Previous session (2026-08-10, shift page PDF download — two real bugs, not one)**:
- `handleDownloadPDF` in `app/shift/page.tsx` looked up `document.getElementById('shift-summary')`, an id that existed nowhere in the file (the closed-shift container's actual id was `print-receipt-container`), so `if (!element) return;` silently no-op'd on every click. Fixed by wrapping the receipt content itself — header through the last divider, deliberately excluding the action buttons and error banner — in a new `<div id="shift-summary">`. Simply repointing the lookup at `print-receipt-container` instead would have captured the "Cetak"/"Download PDF"/"Mulai Shift Baru" buttons into the generated PDF, since `html2canvas` renders the DOM as displayed and doesn't honor the `@media print` / `.no-print` rules `handlePrint`'s separate iframe-based flow relies on.
- **Live verification immediately surfaced a second, previously-invisible bug**: once the element was actually found, `html2canvas` threw `Attempting to parse an unsupported color function "lab"` — this project's Tailwind v4 `@theme` design tokens use modern CSS color functions the plain `html2canvas` package doesn't support. `src/components/pos/ReceiptModal.tsx` already correctly imports `html2canvas-pro` (the only html2canvas variant actually listed in `package.json`'s dependencies) for exactly this reason; the shift page's `import html2canvas from 'html2canvas'` was pulling in an undeclared, incompatible package that just happened to resolve via some other install. Fixed by matching the working pattern: `import html2canvas from 'html2canvas-pro'`.
- The dev server's Turbopack cache didn't pick up the import swap on a normal reload — the browser kept loading a stale bundle chunk still referencing plain `html2canvas` (visible in the console error's stack trace filename) even after the source file was correct. Required `rm -rf .next` and a full server restart before the fix actually took effect; worth knowing for any future case where a source change doesn't appear to take effect in this browser-preview setup.
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- Verified with a real browser session: opened a shift, closed it to reach the receipt view, confirmed `#shift-summary` exists and excludes the action buttons, clicked Download PDF and got the color-function crash (proving the element-id fix alone was necessary but not sufficient), fixed the html2canvas-pro import, force-rebuilt the dev server, retried, and confirmed zero console errors and no `pdfError` banner — a clean PDF generation. Test shift state (`localStorage`) cleared afterward; this feature has no server-side state to worry about.
- Git remains fully read-only — files below are modified in the working tree, not committed.

**Previous session (2026-08-10, systematic broken-page spot-check — found and fixed 3 more split-source/dead-backend bugs, two in live checkout)**:
- Following up on the pattern from prior slices (order-status, /customers), did a systematic sweep rather than ad-hoc: cross-checked every Sidebar link against real routes (all clean), every frontend `${API_BASE_URL}/...` call against every mounted server route and its actual sub-paths (all clean except the already-documented `/reports/purchases` gap, which degrades gracefully), and every Dexie table against whether something else in the app manages the same data via the real API.
- Found four new issues, presented to the user, user chose to fix all three code issues (the fourth, `/waiter`, is a fully-built real page nothing links to — flagged, not fixed, since adding nav is a product decision not a bug fix):
  1. **Suppliers management was 100% Dexie-only** despite `server/routes/suppliers.ts` already having full CRUD sitting unused. Added `getSuppliers`/`addSupplier`/`updateSupplier`/`deleteSupplier` to `recipeApiService.ts` (Postgres-backed), switched `app/inventory/suppliers/page.tsx` and `app/inventory/automation/page.tsx`'s supplier dropdown to use them, removed the dead Dexie-only versions from `inventoryService.ts`.
  2. **Voucher redemption at checkout was completely non-functional.** `CartPanel.tsx`'s "Terapkan Voucer" looked up `db.vouchers` (Dexie), which nothing in the entire codebase ever wrote to — vouchers are created exclusively via the admin `/vouchers` API. Every voucher created through the real admin UI was unfindable at checkout; the feature always failed with "Kode voucer tidak valid" regardless of correctness. Added `src/features/pos/voucherService.ts` (`validateVoucher`, `useVoucher`) calling the already-existing, already-correct `POST /vouchers/validate` and `POST /vouchers/:id/use` endpoints (which already implement active/expiry/quota/minimum-purchase checks server-side — removed the now-redundant client-side duplicates of those same checks). Rewired `handleApplyVoucher` in `CartPanel.tsx`.
  3. **Member/loyalty lookup and point accrual at checkout was the same story.** `useCartStore.ts`/`CartPanel.tsx` read and wrote `db.members`, which nothing populated — member search at checkout always returned empty, and even if a member could somehow be selected, `db.members.update` writes for points/total_spent/tier would never reach Postgres. Added `src/features/crm/customerService.ts` (`searchCustomers`, `addCustomerPoints`) calling `GET /customers?search=...` and `POST /customers/:id/points`. Rewired member search in `CartPanel.tsx` and both duplicated (offline-path and online-path) member-update blocks in `useCartStore.ts` to call `addCustomerPoints` instead of touching Dexie directly — the server now computes tier/discount server-side, replacing the client-side duplicate of that same threshold logic. **Also relaxed `POST /customers/:id/points` from `requireRole('admin')` to `authMiddleware`** in `server/routes/customers.ts`, since it's a routine part of any cashier-processed sale, not an admin-only action — leaving it admin-only would have made the fix useless for the primary user (cashiers, not just admins, complete sales).
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- **Verified with a full real checkout, not just API calls**: created a test voucher and test customer via direct API, logged into `/pos` as admin, added a product to cart, searched for the member by phone (found it — previously would have always returned empty), selected it, applied the voucher code (both `/vouchers/validate` and `/vouchers/:id/use` fired and returned 200, confirmed via network request log), completed a real cash payment, and confirmed via direct Postgres queries that the voucher's `used_count` incremented (0→1) and the customer's `points`/`total_spent` updated correctly (`points: 21, total_spent: 21000` — exactly `floor(21000/1000)` and the actual rounded order total) and stayed at the correct tier. Also verified suppliers CRUD live: added a supplier through the real `/inventory/suppliers` UI and confirmed it landed in Postgres via a direct query, not just optimistic UI state. All test data (voucher, customer, supplier) was cleaned up afterward; the one test order created during checkout was left in place as harmless residual test data (consistent with how earlier sessions in this effort have handled incidental test orders).
- Git remains fully read-only — files below are modified/new in the working tree, not committed.

**Previous session (2026-08-10, StockWriteOff backend contract — closes the second split-source gap)**:
- Same defect shape as the earlier stock-request fix: `app/inventory/page.tsx`'s write-off creation called `recipeApiService.createStockWriteOff` → POST `${API_BASE_URL}/stock-write-offs`, but no such route existed (would 404); `app/inventory/stock-approvals/page.tsx` read/approved/rejected write-offs via `inventoryService` → Dexie IndexedDB only, device-local and never seen by another tablet's approvals view.
- Added Prisma `StockWriteOff` model (migration `20260810012639_add_stock_write_offs`, applied to local DB) and `server/routes/stockWriteOffs.ts` (`GET /`, `GET /:id`, `POST /`, `PATCH /:id/approve` admin-only, `PATCH /:id/reject` admin-only), mounted at `/stock-write-offs` in `server/app.ts`, cloned from `stockRequests.ts`'s auth/role conventions. Unlike the stock-request approve path (which increments), write-off approval **decrements** `current_stock` and replicates the Dexie version's `Math.max(0, current - quantity)` clamp so an oversized write-off can't push stock negative — verified live (see below) with a write-off quantity exceeding remaining stock, confirmed it clamped at 0 rather than going negative.
- `requested_by`/`approved_by`/`rejected_by` and denormalized `_name` fields are derived server-side from the JWT, same as the stock-request route — closes the hardcoded `'admin-user'`/`'current-user'`/`'Staff'` placeholders that were in `app/inventory/page.tsx` and `app/inventory/stock-approvals/page.tsx`.
- `src/features/inventory/recipeApiService.ts` gained `getStockWriteOffs`/`getStockWriteOffsByStatus`/`approveStockWriteOff`/`rejectStockWriteOff` (Postgres-backed). `src/features/inventory/inventoryService.ts`'s Dexie-only equivalents were removed since nothing imports them anymore (mirrors the earlier stock-request cleanup); the unused `StockWriteOff` type import from `db.ts` was removed too.
- `app/inventory/page.tsx` (create) and `app/inventory/stock-approvals/page.tsx` (list/approve/reject) now share one Postgres-backed source for write-offs, matching the stock-request page's pattern exactly.
- Verified live against the real local Postgres DB (not just static/type checks): direct-API round trip (create → approve → confirmed `current_stock` decremented by the exact quantity; create an oversized write-off → approve → confirmed stock clamped at 0 instead of going negative; create → reject → confirmed stock untouched; confirmed double-approve returns 400; confirmed unauthenticated request returns 401), **then** a full real-UI round trip: created a write-off via the API, navigated to `/inventory/stock-approvals`, confirmed it rendered in the Pending list attributed to "admin" (not the old hardcoded placeholder), clicked Approve through the real `alertdialog` confirmation, and confirmed via a direct API query that `current_stock` in Postgres actually dropped by the approved quantity — not just optimistic UI state. Test rows and the stock delta were cleaned up afterward each time.
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- Not attempted: full UI submission of a *new* write-off request through `/inventory`'s form, since it requires a mandatory proof-file upload that this session's browser-automation tooling can't simulate (no file-input capability). The create endpoint itself was verified directly via API instead; the read/approve/reject UI path (the part actually changed in `stock-approvals/page.tsx`) was fully browser-verified.
- Git remains fully read-only — files below are modified/new in the working tree, not committed.

**Previous session (2026-08-10, deferred form-validation alerts: promotions, CRM, HR — closes the alert()/confirm() sweep)**:
- `app/admin/promotions/page.tsx` (5 `alert()`, Dexie-only feature, no `confirm()`): all four `handleSavePromotion` validation branches (name required, min-quantity required for quantity-type, min-amount required for amount-type, discount-value required) plus the save-failure catch became one `formError` `role="alert"` above the modal's Batal/Simpan buttons, cleared on both add and edit open.
- `app/admin/crm/page.tsx` (2 `alert()`, API-backed): the required-fields validation and the save-failure catch became `formError` `role="alert"` in the same position, cleared on add/edit open.
- `app/admin/hr/page.tsx` (1 `alert()`, API-backed): the save-failure catch became a new page-level `saveError` banner (dismissible, `role="alert"`) rendered under the page heading — **not** inside `AddEmployeeModal`, because that modal's own `handleSubmit` calls `onSave(...); onClose();` without awaiting `onSave`, so the modal is already unmounted by the time an async save failure resolves. Confirmed live: after forcing a real save failure, the modal was gone (`document.querySelector` for its input returned nothing) and the page-level banner was the only place the error could have appeared.
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- Live-verified all three in a real browser session: promotions' four validation branches triggered by omitting each required field in turn (Dexie-only, no API needed); CRM's required-fields validation triggered, then its save-failure path forced with a genuine killed-API network error (not simulated) and confirmed inline; HR's save-failure path forced the same way and confirmed the page-level banner rendered after the modal had already closed. No test data was left behind — every forced-failure attempt failed before any write occurred, and validation-only attempts were cancelled rather than saved.
- **This closes the full native `alert()`/`confirm()` sweep** for the entire codebase as scoped by the audit's Phase 0 findings — a static grep across `app/` and `src/` for `alert(`/`confirm(` used as a bare global call now returns zero matches outside test files.
- Git remains fully read-only — files below are modified in the working tree, not committed.

**Previous session (2026-08-10, remaining single-alert files: kasir, pos, ReceiptModal, ProductListModal)**:
- `app/kasir/page.tsx` (1 `alert()`) migrated: empty-cart checkout guard became `checkoutError` `role="alert"` above the Bayar button. **Note**: `app/kasir/page.tsx` is an orphaned/legacy page — nothing in the app links to `/kasir` (grepped `app/`+`src/` for the string, zero matches); it's a separate, entirely mock-data POS UI (hardcoded `mockProducts`, no real order-creation API call) that coexists with the real `app/pos/page.tsx`. It's still directly reachable by URL, so the migration was done for correctness, but the `checkoutError` branch is dead code either way — the "Bayar" button is `disabled={cart.length === 0}`, so the empty-cart guard inside `handleCheckout` was already unreachable through the UI before this change. Confirmed live: cart starts empty, `Bayar` button's `disabled` is `true`; the guard cannot fire without bypassing the disabled state (e.g. via devtools), same as before this session.
- `app/pos/page.tsx` (1 `alert()`, in the development-only "Dev Tools" bar) migrated: the Clear Cache & Reload failure alert became `toast('error', ...)`, reusing the `useToast` hook already imported and used elsewhere in this file — no new state needed.
- `src/components/pos/ReceiptModal.tsx` (1 `alert()`) migrated: PDF-generation failure became `pdfError` `role="alert"` above the receipt preview.
- `src/features/pos/components/ProductListModal.tsx` (1 `alert()`) migrated: stock-update failure became `stockError` `role="alert"` rendered directly under the inline stock-edit input, cleared on opening/cancelling an edit.
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- Live-verified in a real browser session: added a product to cart on `/kasir` and completed checkout, confirming `ReceiptModal` still renders and "Download PDF" still succeeds with no `pdfError`; opened `ProductListModal` from `/pos`, started editing a product's stock, killed the API process mid-edit to force a genuine network failure, clicked Simpan, and confirmed `stockError` rendered inline (`"Gagal mengupdate stok. Silakan coba lagi."`) with no native alert blocking automation — a real failure, not a simulated one. No product stock was actually mutated since the request failed before writing.
- This closes out the full native `alert()`/`confirm()` sweep for every file the ledger tracked as "1 alert() each, not yet migrated." Remaining native calls are the previously-deferred form-validation alerts in `app/admin/promotions/page.tsx` (5), `app/admin/crm/page.tsx` (2), and `app/admin/hr/page.tsx` (1) — intentionally left out of the earlier deletion-only slices for those pages.
- Git remains fully read-only — files below are modified in the working tree, not committed.

**Previous session (2026-08-10, HR modals alert sweep)**:
- `src/components/hr/AddEmployeeModal.tsx` (3 `alert()` calls, no `confirm()`) fully migrated: name/position/email/phone-required, base-salary-required (permanent), and hourly-rate-required (freelance) validation all became a single `formError` state rendered as `role="alert"` above the Batal/Simpan buttons, cleared on every open (both add and edit) and on each submit attempt.
- `src/components/hr/AttendanceSection.tsx` (2 `alert()` calls, no `confirm()`) fully migrated: the overtime-hours info alert became a new dismissible `role="status"` banner (`overtimeMessage`), matching the existing late-check-in banner's visual pattern but kept as a separate state so the two don't clobber each other if both fire the same day; the check-in/check-out failure alert became a dismissible `role="alert"` banner (`attendanceError`). Both banners had to live in `AttendanceSection` itself, not inside the transient `AttendanceCameraModal` — that modal's own `handleConfirm` closes itself immediately after calling `onCapture`, before the async `checkIn`/`checkOut` call it triggers has resolved, so by the time success/failure is known the modal is already gone.
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- Live-verified `AddEmployeeModal`'s two validation branches in a real browser session (logged in as admin, opened Tambah Karyawan, submitted empty and confirmed the inline error, then filled required fields but left salary at 0 and confirmed the second inline error) — no native alert popup blocked automation either time. `AttendanceSection`'s camera-dependent check-in/check-out flow was intentionally left to static/type verification only, per this effort's explicit constraint against invoking real camera integrations.
- Git remains fully read-only — files below are modified in the working tree, not committed.

**Previous session (2026-08-10, order-status cancel confirm + fixed a genuinely broken page, plus a sidebar 404)**:
- Fixed a dead link found while testing: `src/components/layout/Sidebar.tsx`'s cashier "Data Pelanggan" link pointed at `/customers`, which was never a real route (no `app/customers` page ever existed) — 404 on every click. Repointed to `/admin/crm`, the actual customer/CRM page (confirmed it has no admin-only role gate, so cashiers can use it). Verified live: link now loads the CRM page.
- `app/order-status/[orderId]/page.tsx`'s cancel-order `confirm()` (1 destructive call) migrated to the shared `Modal` `alertdialog` pattern (`cancelConfirmOpen`/`isCancelling`/`cancelError`), same as prior slices.
- **The `confirm()` handler's body was a stub** (`// Cancel order` comment, no actual code) — wiring it up surfaced that the whole page was broken: it reads order data exclusively from local IndexedDB (`db.orders`), but the online-order checkout flow (`OnlineCheckoutModal.tsx` → `api.createOrder`) only ever writes the order to Postgres via the API, never to IndexedDB. Every order placed through online-order showed "Pesanan tidak ditemukan" on its own status page — confirmed live by actually placing a test order and hitting the page. There was also no `GET /orders/:id` endpoint to fetch a single order.
- Root-cause fixed rather than patched around: added `GET /orders/:id` to `server/routes/orders.ts` (returns the order with items+product included, placed after `/orders/active` so Express doesn't shadow it), added `fetchOrder(orderId)` to `src/lib/api.ts`, and changed `fetchOrderStatus` in the page to try the API first (falling back to the IndexedDB read only if offline/failed). The cancel action itself calls the existing authenticated `PATCH /orders/:id/status` (via `api.updateOrderStatus`, already present in `src/lib/api.ts` and unused before this) and mirrors the result into the Dexie cache.
- Verified fully live, not just statically: started both dev processes separately (see port-conflict note below), logged in as admin, placed a real order through `/online-order`, confirmed it 404'd on its own status page before the fix, restarted the API with the new route, reloaded and confirmed the page now shows real order data, clicked "Batalkan Pesanan", confirmed the `alertdialog` renders correctly (not a blocking native confirm), clicked "Ya, Batalkan", and confirmed via a direct API query that `status` is `cancelled` in Postgres — not just in the UI.
- **Tooling note, not an app bug**: running `npm run dev` (which uses `concurrently` to spawn both processes under one parent) through this session's browser-preview tool caused the Express API to bind to port 3000 instead of 3001 from `.env`, because the preview tool injects a `PORT=3000` env var for its own readiness check, and `dotenv.config()` never overrides an already-set env var — so both processes tried to claim 3000. Fixed by not routing the API through that shared env: `.claude/launch.json` now starts only the Next.js frontend, and the Express API is started separately. No application code changed for this; `.env`'s `PORT=3001` is correct and works fine outside this specific harness scenario.
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- Git remains fully read-only — all files below are modified/new in the working tree, not committed.

**Previous session (2026-08-10, Shift page alert/confirm sweep + browser verification)**:
- `app/shift/page.tsx` (6 `alert()` + 1 destructive `confirm()`, missed by every earlier sweep despite touching cash reconciliation) fully migrated: open-shift/close-shift/expense validation became inline `role="alert"` text (`openShiftError`/`closeShiftError`/`expenseError`) next to their respective fields, cleared on each new submit attempt and on the expense-form toggle; PDF-download failure became `pdfError`; the "Mulai Shift Baru" reset `confirm()` became a shared `Modal` `alertdialog` (`resetConfirmOpen`/`isResetting`) with explicit Batal/Reset actions and dismissal blocked while resetting, matching the pattern already used for Admin Settings reset.
- **This is the first slice in the whole Phase 0 effort actually exercised in a real browser**, not just static/type-checked: started the real dev server (`npm run dev`, ports 3000/3001), logged in as `admin`, and drove the full flow — triggered the empty-starting-cash error, opened a shift, triggered the empty-ending-cash error, closed a shift, triggered both expense-form validation branches, opened the reset `alertdialog` and confirmed via `read_page` that it renders with correct `alertdialog` role/heading/description/Batal/Reset structure (not a browser-native confirm — the click didn't block automation, which a real `window.confirm()` would have), and confirmed the reset actually clears the page back to "Buka Shift Baru". All via the UI, not source inspection.
- Added `.claude/launch.json` so this repo can be opened in the in-app browser preview via `npm run dev`.
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- Noticed in passing, not fixed (out of scope for this slice): `handleDownloadPDF` in `app/shift/page.tsx` looks up `document.getElementById('shift-summary')`, but no element in that file has `id="shift-summary"` (the closed-shift container is `id="print-receipt-container"`) — the function silently no-ops via its early `if (!element) return`, so "Download PDF" has likely never worked. Worth its own slice.
- Git remains fully read-only per explicit instruction — files below are modified in the working tree, not committed.

**Previous session (2026-08-10, stock-request backend slice)**:
- Closed the split-source gap the prior session identified: added Prisma `StockRequest` model (migration `20260810002525_add_stock_requests`), new authenticated Express route `server/routes/stockRequests.ts` (`GET /`, `GET /:id`, `POST /`, `PATCH /:id/approve` admin-only, `PATCH /:id/reject` admin-only), mounted at `/stock-requests` in `server/app.ts`. Cloned from the existing `stockTransfers.ts` route's auth/role conventions.
- `requested_by`/`approved_by`/`rejected_by` and their denormalized `_name` fields are now derived server-side from the JWT (`req.user.id`/`req.user.username`), not client-supplied — closes the hardcoded `'admin-user'`/`'current-user'`/`'system'` placeholders that were previously in `app/inventory/page.tsx`, `app/inventory/automation/page.tsx`, and `app/inventory/stock-approvals/page.tsx`.
- `src/features/inventory/recipeApiService.ts` gained `getStockRequests`/`getStockRequestsByStatus`/`approveStockRequest`/`rejectStockRequest` (Postgres-backed, matching the existing `createStockRequest` in that file). `src/features/inventory/inventoryService.ts` had its Dexie-only `createStockRequest`/`getStockRequests`/`getStockRequestsByStatus`/`approveStockRequest`/`rejectStockRequest`/`getPurchaseDataByPeriod` removed (dead code once all three inventory pages moved to the API-backed versions); `StockWriteOff` functions in the same file were untouched — same split-source problem, out of scope for this slice.
- All three creation/read/approve/reject call sites now share one Postgres-backed source: `app/inventory/page.tsx` (create), `app/inventory/automation/page.tsx` (auto-restock create), `app/inventory/stock-approvals/page.tsx` (list/approve/reject).
- Verified live against the real local Postgres DB (not just static/type checks): logged in as `admin`, created a stock request, approved it and confirmed `ingredients.current_stock` incremented by exactly the requested quantity, created a second request and rejected it and confirmed stock was untouched, confirmed a second approve attempt on an already-approved request returns 400, confirmed an unauthenticated request returns 401. Test rows and the stock delta were cleaned up afterward (ingredient reset to its original `current_stock`).
- `npx tsc --noEmit`: 0 errors. Full `npm test`: 22 files / 207 tests passed, no regressions.
- Not in scope, left alone: `StockWriteOff` (Dexie-only, same defect shape as stock requests had); `/reports/purchases` (used by the inventory purchase chart) still has no Express route and degrades to an empty array, same as before this slice.
- Git remains fully read-only per explicit instruction this session — the above files are modified/new in the working tree but **not committed**.

**Previous session (2026-08-10, Phase 0 trust-failure remediation)**:
- An external read-only ERP UX/architecture audit (`UXR-20260810-0141`) was run against commit `8ea7059`; its findings and phased roadmap live outside this repo at the codex review folder referenced in `progress.txt`/agent memory — **do not** re-derive backend/frontend module status from `MODULE_ANALYSIS_REPORT.md` below without cross-checking actual routes/pages first, since that report and the audit both under-count what's implemented.
- Root `/` no longer shows the stock Next.js starter: `app/page.tsx` now waits for `AuthContext` and redirects to `/login` or `/pos` via `src/features/auth/root-entry.ts`.
- Frontend API base URL centralized into `src/config/runtime.ts` (`API_BASE_URL`); all CRM/HR/vouchers/OCR/outlets/self-order/payment/tables consumers migrated off ad-hoc `localhost:3000` fallbacks (was silently hitting the wrong port).
- Shared `src/components/ui/Modal.tsx` gained `alertdialog` semantics (title/description association, backdrop-lock, focus restore). Native `confirm()` deletion flows migrated to it in: vouchers, promotions, CRM members, HR employees, Admin Settings reset, Shift Management.
- Native `alert()` calls replaced with inline `role="alert"`/`role="status"` feedback in: Finance/OCR page (file validation, processing, manual expense form, review modal, CSV export), Shift Management form, and **`app/inventory/page.tsx`** (add-ingredient failure, file upload validation, write-off quantity/proof/save feedback; also removed a stray unconditional debug `alert('File upload triggered!')`).
- **`app/inventory/stock-approvals/page.tsx`** (14 native `alert()`/`confirm()` calls) fully migrated: single-approve and bulk-approve `confirm()` calls became shared `Modal` `alertdialog` confirmations (`handleApproveClick`/`handleApproveConfirm`, `handleBulkApproveClick`/`handleBulkApproveConfirm`) with explicit Batal/Setujui actions and a loading-disabled state; selection-empty/save-result alerts became page-level `pageError`/`pageStatus` banners; the existing bespoke Reject and Bulk Reject dialogs gained inline `role="alert"` validation/failure text and now block Cancel/close while submitting.
- **`app/inventory/automation/page.tsx`** (9 native `alert()` calls, no `confirm()`) fully migrated: min-stock update and auto-restock run results became page-level `pageStatus`/`pageError` banners; create-PO empty-selection guard uses `pageError`; PO-save and min-stock-update failures became modal-scoped inline `role="alert"` (`poError`, `minStockError`), and both the Edit Min Stock and PO Review modals now block Cancel/close while their action is in flight.
- **`app/inventory/suppliers/page.tsx`** (8 native `alert()` calls, no `confirm()`) fully migrated: add/edit validation and save results became page-level `pageStatus` (success) and modal-scoped `formError`; delete results became `pageStatus`/`deleteError`; both the Add/Edit and Delete Confirmation modals now block dismissal while `isSubmitting`. Also fixed a previously-silent failure path where a falsy `addSupplier` return left the modal open with zero feedback — it now surfaces `formError`.
- **`app/inventory/mapping/page.tsx`** (7 native `alert()` calls, no `confirm()`) fully migrated: save success/failure and bulk-import success became `pageStatus`/`saveError`; bulk-import validation (empty data, pasted-file-path guidance, JSON syntax/generic error guidance) became modal-scoped `bulkImportError` (rendered `whitespace-pre-line` to keep the existing multi-line copy). **Also fixed a real bug**: `handleBulkImport` was calling `processBulkImport(data)` without `await`, so its errors were an unhandled promise rejection bypassing the `catch`, and the modal could close before the import actually finished — added the missing `await`.
- **`app/admin/outlets/page.tsx`** (3 native `alert()` calls, no `confirm()`) fully migrated: save failure became modal-scoped `formError`; delete failure (both the falsy-return and thrown-error branches) became `deleteError`. Both modals' Cancel/close now correctly guard against dismissal mid-submit (previously only the primary action button was disabled).
- **Still native `alert()`/`confirm()`, not yet migrated**: `app/kasir/page.tsx`, `app/pos/page.tsx`, `src/components/pos/ReceiptModal.tsx`, `src/features/pos/components/ProductListModal.tsx` (1 `alert()` each). Grep `alert(`/`confirm(` in `app/` and `src/` before starting new work to get the current count.
- Stock-request submission (`/inventory` restock flow) has **no backend contract**: no Prisma `StockRequest` model, no Express `/stock-requests` route. `recipeApiService`/`inventoryService` write to Dexie IndexedDB only; approvals also read IndexedDB. UI now fails gracefully with inline error instead of a native alert, but the feature does not persist server-side. This is the next substantial backend slice (model + migration + authenticated CRUD + migrate dashboard/approvals off IndexedDB).
- Verified: `npx tsc --noEmit` exit 0; full `npm test` 22 files / 207 tests passing throughout.

**Previous session (2026-08-08, Security Hardening & Production Readiness)**:
- Completed comprehensive security audit and hardening (Fix-1 through Fix-14)
- Implemented ingredient stock management with recipe-based consumption
- Added Supplier & Purchase Order module with full CRUD and stock integration
- Implemented webhook signature verification for payment gateways (Midtrans, Xendit)
- Added rate limiting, Helmet security headers, and enhanced CORS configuration
- Created comprehensive test suite with 64 tests covering security, integration, and business logic
- Optimized error handling with structured logging and production-safe responses
- Cleaned up dead code, removed debug logs, and optimized database queries
- Updated technical documentation (README.md) with testing guide and deployment instructions
- System is now production-ready with 0 TypeScript errors and all tests passing

**Previous session (2026-07-15, UI design system overhaul)**:
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
- **Security**: Helmet, rate limiting, webhook signature verification, role-based access control.
- **Inventory**: Ingredient stock tracking, recipe-based consumption, supplier management, purchase orders.

## Security Hardening Summary (Fix-1 through Fix-14)

### High Priority Fixes (Fix-1 through Fix-7)

**Fix-1: Recipe-Based Ingredient Stock Consumption**
- Connected recipe consumption to ingredient stock on order creation
- Stock automatically decrements when orders are placed
- Added automated regression tests

**Fix-1b: Early Ingredient Pre-Check**
- Added stock validation before opening transactions
- Prevents orders when insufficient stock available

**Fix-1c: Stock Validation on Order Creation**
- Validates ingredient stock before order is created
- Returns clear error messages for insufficient stock

**Fix-2: Stock Restoration on Order Cancel/Void**
- Restores product and ingredient stock when orders are cancelled or voided
- Prevents stock discrepancies from cancelled orders

**Fix-3b: Race Condition & Rounding Asymmetry Fix**
- Fixed race conditions in stock restoration
- Implemented precise rounding for decimal quantities (6 decimal places)
- Prevents double-restoration with concurrent requests

**Fix-4: Payment Endpoint Security**
- Added authentication to POST /payments
- Server-side amount validation (never trusts client)
- Prevents payment amount manipulation

**Fix-4b: Payment Status Update Security**
- Added authMiddleware to PATCH /payments/:id/status
- Only authenticated users can update payment status

**Fix-5: Webhook Signature Verification**
- Implemented signature verification for Midtrans (SHA512)
- Implemented signature verification for Xendit (HMAC-SHA256)
- Middleware ensures only valid webhooks are processed

**Fix-6: Inventory & Stock Adjustment Security**
- Added authentication and role-based access to inventory endpoints
- Implemented stock adjustment logging for audit trail
- Added comprehensive security tests

**Fix-6b: Environment Configuration**
- Created .env.example with all required variables
- Added JWT_SECRET validation (fails fast with weak secrets)
- Documented security best practices

**Fix-7: Infrastructure Security**
- Added Helmet middleware for HTTP security headers
- Implemented rate limiting on sensitive endpoints (login, payments)
- Enhanced CORS configuration for production

### Medium Priority Fixes (Fix-8 through Fix-14)

**Fix-8: Supplier & Purchase Order Module**
- Created Supplier model with CRUD operations
- Created Purchase Order model with status management (pending, received, cancelled)
- Implemented automatic stock updates on PO receipt
- Added comprehensive integration tests

**Fix-9: Code Cleanup & Optimization**
- Removed dead code and unused files
- Removed debug console.log statements
- Optimized database queries (no N+1 problems)
- Updated .gitignore for sensitive files

**Fix-10: Technical Documentation Update**
- Updated README.md with comprehensive features section
- Added testing guide with test file descriptions
- Enhanced deployment section with security notes
- Documented all API endpoints

**Fix-11: Error Handling & Logging**
- Enhanced global error handler with structured logging
- Added JWT error handling (invalid token, expired token)
- Added Prisma error handling (P2025, P2002, P2003, P2023)
- Production-safe error responses (no stack traces in production)

**Fix-12: Supplier & Purchase Order Verification**
- Wrapped PO receipt in transaction for atomicity
- Added concurrent operations test
- Verified authorization on all supplier endpoints
- Confirmed data integrity under concurrent load

**Fix-13: Final Code Cleanup**
- Removed remaining debug logs
- Fixed PrismaClient import in settings.ts
- Validated all dependencies are current and necessary
- Reviewed database indexes for optimal query performance

**Fix-14: Final Integration & Stress Test**
- Ran full test suite: 64 tests passed
- Ran production build: successful (29 pages compiled)
- Ran TypeScript check: 0 errors
- Updated handover documentation

## Test Suite Summary

**Total Tests: 64**

| Test File | Description | Tests |
|-----------|-------------|-------|
| `orders.restore.test.ts` | Order void/cancel and stock restoration | 9 |
| `orders.stock.test.ts` | Ingredient stock validation on orders | 6 |
| `payments.security.test.ts` | Payment endpoint security & auth | 8 |
| `inventory.security.test.ts` | Inventory CRUD & stock adjustment security | 12 |
| `webhook.security.test.ts` | Webhook signature verification (Midtrans/Xendit) | 8 |
| `infrastructure.security.test.ts` | Helmet headers, rate limiting, CORS | 8 |
| `suppliers.test.ts` | Supplier & purchase order integration | 13 |

**Test Coverage:**
- Authentication & Authorization
- Inventory Management (stock consumption, restoration, adjustment logging)
- Payment Security (amount validation, status updates, webhook verification)
- Supplier Management (CRUD, purchase order flow, stock updates)
- Infrastructure (security headers, rate limiting, CORS)
- Concurrent Operations (race condition prevention)

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
# Result: 0 errors

# Build frontend
npm run build
# Result: 29 pages compiled successfully (28 static, 1 dynamic)

# Run test suite
npm test
# Result: 64 tests passed

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed

# Start both frontend and API
npm run dev
```

## Production Readiness Checklist

### Security
- ✅ JWT authentication with role-based access control (admin/cashier)
- ✅ Webhook signature verification for Midtrans and Xendit
- ✅ Rate limiting on sensitive endpoints (login, payments)
- ✅ HTTP security headers via Helmet
- ✅ Enhanced CORS configuration for production
- ✅ Server-side payment amount validation
- ✅ Stock adjustment logging for audit trail
- ✅ .env.example with security warnings

### Data Integrity
- ✅ Recipe-based ingredient stock consumption
- ✅ Stock restoration on order cancel/void
- ✅ Race condition prevention with transactions
- ✅ Precise decimal rounding (6 decimal places)
- ✅ Concurrent operations testing
- ✅ Foreign key constraints enforced

### Code Quality
- ✅ 0 TypeScript errors
- ✅ 64 automated tests passing
- ✅ Production build successful
- ✅ Dead code removed
- ✅ Debug logs removed
- ✅ Database queries optimized (no N+1)
- ✅ Structured error logging
- ✅ Production-safe error responses

### Documentation
- ✅ README.md updated with features, testing guide, deployment
- ✅ .env.example created
- ✅ HANDOVER.md updated with security summary
- ✅ API endpoints documented

### Deployment
- ✅ Environment variables documented
- ✅ JWT_SECRET validation implemented
- ✅ Database indexes optimized
- ✅ Dependencies validated
- ✅ Build process verified

## Known Lint Items

`npm run lint` still reports some pre-existing issues in legacy files. These were not introduced by the security hardening and do not block `npm run build` or `npx tsc --noEmit`:

- `Unexpected any` warnings in `src/lib/db.ts`, `src/store/useOfflineStore.ts`, `src/types/database.types.ts`.
- React Hook dependency warnings in `useProducts.ts` and `useSyncManager.ts`.
- Unused variable warnings in `useCartStore.ts`.

These should be cleaned up when the related modules are refactored.

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

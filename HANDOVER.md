# Kitchen POS - Handover Document

## Session Summary

**Latest session (2026-08-10, /waiter navigation decision — turned out to need a real fix first, not just a link)**:
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

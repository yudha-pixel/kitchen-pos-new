# Business Routes and Capability RBAC Migration Handover

**Date:** 2026-08-12 (Asia/Jakarta)  
**Workspace:** `D:\Project\MyProject\kitchen-pos-new`  
**Branch / HEAD observed read-only at start:** `self_order` / `6c5ea0dc9401aeeada3cf81a622af2cd70707418`

## Objective and Immutable Rules

Replace role-owned `/admin/...` pages with business-owned routes and make database capabilities—not role labels—the authorization authority.

- Git was read-only throughout: no branch, checkout, stage, commit, push, merge, reset, clean, restore, or discard.
- Existing unrelated working-tree changes were preserved, including the pre-existing staged deletion of `lib/odooApi.ts` and UI/settings work.
- API prefixes were not changed.
- No browser automation or Playwright was run.
- No production database was modified.
- Any final runtime/browser UX and production deployment remain unverified.

## Completion State

- Phase 1: capability catalog, default matrix, shared seed/synchronizer, dry-run and local backfill complete.
- Phase 2: current-profile database authorization and operation-specific backend guards complete.
- Phase 3: permission-aware session, `can()`, launcher/sidebar filtering, direct-route boundary, and protected actions complete.
- Phase 4: eleven pages moved, permanent redirects added, canonical navigation/seed paths applied, preference normalization/deduplication complete.
- Phase 5: knowledge and handover packages complete.
- Phase 6: see `verification-log.md` for exact evidence and final gates.

## Database Action

Target was confirmed from `.env` as local PostgreSQL `localhost:5432`, database `kitchen_pos`. No credentials are recorded here.

1. `npm run db:permissions -- --dry-run` reported the required catalog/system-role changes.
2. `npm run db:permissions` applied only catalog and system-role reconciliation.
3. A second `npm run db:permissions -- --dry-run` returned empty `permissionsToCreate`, `assignmentsToCreate`, and `assignmentsToDelete` arrays.

Custom-role assignments were outside the synchronizer mutation plan. Production was not touched.

## Changed-File Scope

Migration-owned changes are grouped below; files that already had unrelated user edits were edited narrowly and preserved.

- Contracts: `src/config/permissions.ts`, `src/config/routes.ts`, `src/config/navigation.ts`, `src/types/auth.ts`.
- Authentication/client: `server/middleware/auth.ts`, `server/middleware/permissions.ts`, `server/routes/auth.ts`, `src/context/AuthContext.tsx`, `src/lib/api.ts`, `server/lib/validation.ts`, `server/types/express/index.d.ts`.
- Database synchronization: `server/lib/permissionBackfill.ts`, `server/prisma/ensure-permissions.ts`, `server/prisma/seed.ts`, `package.json`.
- Backend guards: applicable files under `server/routes/`, including users, roles, products, orders, payments, inventory, purchasing, CRM, promotions, attendance, HR/payroll, finance OCR, settings, outlets, modules-related settings, kitchen, tables, backup, audit, printing, and approvals.
- Frontend enforcement: `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`, `app/apps/page.tsx`, POS/kasir/online-order action checks, and `ProductListModal.tsx`.
- Canonical pages: `app/attendance`, `app/crm`, `app/hr`, `app/products`, `app/promotions`, `app/reports`, and `app/settings`; legacy `app/admin` page sources were removed.
- Redirect/preferences: `next.config.ts`, `server/routes/userPreferences.ts`.
- Tests: permission catalog/backfill, authorization source guard, route aliases, apps registry, preferences, real permission middleware, and migrated route/security suites under `server/__tests__`; browser specs had path references updated but were not run.
- Documentation: this package and `../../knowledge/route-rbac-migration`.

Exact migration-owned paths (some contain preserved pre-existing edits in the same file):

```text
HANDOVER.md
next.config.ts
package.json
app/apps/page.tsx
app/attendance/page.tsx
app/crm/page.tsx
app/finance/ocr/page.tsx
app/hr/page.tsx
app/kitchen/page.tsx
app/products/page.tsx
app/promotions/page.tsx
app/promotions/vouchers/page.tsx
app/reports/page.tsx
app/reports/discounts/page.tsx
app/settings/page.tsx
app/settings/modules/page.tsx
app/settings/outlets/page.tsx
app/kasir/page.tsx
app/online-order/page.tsx
app/pos/page.tsx
server/lib/permissionBackfill.ts
server/lib/validation.ts
server/middleware/auth.ts
server/middleware/permissions.ts
server/prisma/ensure-permissions.ts
server/prisma/seed.ts
server/routes/approvalWorkflows.ts
server/routes/attendance.ts
server/routes/audit.ts
server/routes/auth.ts
server/routes/backup.ts
server/routes/customers.ts
server/routes/goodsReceivedNotes.ts
server/routes/hr.ts
server/routes/ingredients.ts
server/routes/invoices.ts
server/routes/kitchen.ts
server/routes/ocr.ts
server/routes/orders.ts
server/routes/outlets.ts
server/routes/payments.ts
server/routes/print.ts
server/routes/products.ts
server/routes/purchaseOrders.ts
server/routes/quotationRequests.ts
server/routes/quotations.ts
server/routes/recipes.ts
server/routes/roles.ts
server/routes/selfOrder.ts
server/routes/settings.ts
server/routes/splitBill.ts
server/routes/stockRequests.ts
server/routes/stockTransfers.ts
server/routes/stockWriteOffs.ts
server/routes/supplierPayments.ts
server/routes/suppliers.ts
server/routes/tables.ts
server/routes/userPreferences.ts
server/routes/users.ts
server/routes/vouchers.ts
server/routes/warehouses.ts
server/types/express/index.d.ts
src/components/layout/AppShell.tsx
src/components/layout/Sidebar.tsx
src/config/navigation.ts
src/config/permissions.ts
src/config/routes.ts
src/context/AuthContext.tsx
src/features/pos/components/AddProductModal.tsx
src/features/pos/components/CartPanel.tsx
src/features/pos/components/EditProductModal.tsx
src/features/pos/components/ProductListModal.tsx
src/lib/api.ts
src/types/auth.ts
server/__tests__/access-control.test.ts
server/__tests__/apps-registry.test.ts
server/__tests__/authorization-source-guard.test.ts
server/__tests__/customers.test.ts
server/__tests__/inventory.security.test.ts
server/__tests__/orders.restore.test.ts
server/__tests__/orders.stock.test.ts
server/__tests__/payments.security.test.ts
server/__tests__/permission-catalog.test.ts
server/__tests__/permissions.test.ts
server/__tests__/route-aliases.test.ts
server/__tests__/self-order-accept.test.ts
server/__tests__/settings-native-dialogs.test.ts
server/__tests__/tables.test.ts
server/__tests__/userPreferences.test.ts
tests/access-control.spec.ts
tests/route-navigation.spec.ts
docs/handover/route-rbac-migration/HANDOVER.md
docs/handover/route-rbac-migration/verification-log.md
docs/handover/route-rbac-migration/remaining-risks.md
knowledge/route-rbac-migration/README.md
knowledge/route-rbac-migration/route-map.md
knowledge/route-rbac-migration/permission-catalog.md
knowledge/route-rbac-migration/default-role-matrix.md
knowledge/route-rbac-migration/authorization-flow.md
```

Legacy source paths removed by the physical moves are the eleven `app/admin/*/page.tsx` files listed in the route map plus `app/admin/page.tsx`.

## Legacy Reference Result

Active application/navigation sources no longer emit `/admin/...`. Remaining occurrences are intentional compatibility aliases/tests or immutable historical documentation. Historical handovers were not rewritten.

## Process State

No API or Next.js server was started for this migration. Vitest, TypeScript, permission synchronization, and build commands are finite processes. Final listener checks are recorded in `verification-log.md`.

## Continuation Prompt

```text
Continue the Business Routes and Capability RBAC migration from docs/handover/route-rbac-migration/HANDOVER.md. Keep Git strictly read-only, preserve unrelated working-tree changes, do not run browser automation/Playwright, and do not apply database backfills to production. Read knowledge/route-rbac-migration first, then inspect verification-log.md and remaining-risks.md. Re-run only the failed or missing verification gate, stop any server you start, and update this handover with exact evidence.
```

## Top Navigation Profile, Brand, and Live Clock Slice

**Completed:** 2026-08-12 19:44 +07:00
**Read-only Git identity:** `self_order` / `7abc1df45cd7eab98c998f01b8379b5b45f1dc68`

The persistent authenticated header now centers the static `Kitchen POS` brand, exposes the authenticated profile through an accessible Base UI menu, removes the outlet selector from the header only, and displays a device-local Indonesian clock with seconds on desktop. Mobile keeps the brand, profile, and existing page action in the first row; POS search moves to a full-width second row, and the clock stays hidden below `lg`.

The public login and `/auth/me` user shape now add `full_name`. Both routes use one serializer and continue to return `id`, `username`, `full_name`, `role_id`, `role`, and `permissions`. Authentication remains under `/auth/...`; business and health route prefixes were not changed.

Changed files for this slice:

```text
package.json
package-lock.json
server/lib/authenticatedUser.ts
server/routes/auth.ts
server/__tests__/authenticated-user.test.ts
server/__tests__/header-components.test.ts
src/types/auth.ts
src/components/layout/Header.tsx
src/components/layout/LiveClock.tsx
src/components/layout/UserProfileMenu.tsx
docs/handover/route-rbac-migration/HANDOVER.md
docs/handover/route-rbac-migration/verification-log.md
```

`@base-ui/react` `^1.6.0` was added and resolved to `1.6.0`. The install audit reported 14 existing findings (1 moderate, 13 high); no audit fix was run. No database query, migration, seed, permission synchronization, backfill, or other database write was performed. No browser automation, Playwright, API server, or Next development server was run. The unrelated untracked `server/__tests__/inventory-logging.test.ts` was preserved untouched.

Automated verification is complete and recorded in `verification-log.md`. Runtime visual acceptance remains intentionally user-run: desktop alignment/live ticking/profile keyboard behavior, mobile header/search layout, and logout navigation were not promoted to verified browser claims.

## Single-Company Configuration and Unified Navigation Slice

**Completed:** 2026-08-12 (Asia/Jakarta)
**Read-only Git identity:** `self_order` / `7abc1df` (`yudha-pixel`, `sukmayudha48@gmail.com`)

The authenticated shell and `/apps` now share the same balanced top-navigation foundation. The single configured company name/logo replaces the hardcoded authenticated brand, `/apps` uses the shared live clock and Base UI profile menu, module search moves below the primary row below `lg`, and no header renders an outlet selector. The launcher grid, permission filtering, favorites, recent items, and outlet infrastructure remain intact.

The new `/settings/company` screen owns company identity, managed logo upload/removal, timezone, currency, tax, and service-charge defaults. `AppSettings` retains its legacy database columns for one compatibility cycle but the settings API no longer exposes, updates, resets, or reads those company-owned fields. `web_base_url` moved to the Self-Order settings surface. Split-bill and client configuration hydration now use Company defaults.

New business routes are `/api/company/identity`, `/api/company/config`, `/api/company`, and `/api/company/logo`; `/auth/...`, other `/api/...`, and `/health` contracts are unchanged. Existing `settings.view`/`settings.edit` permissions are reused, so no permission catalog or backfill action was performed.

The prepared `20260812190000_add_single_company` migration creates the single Company from the oldest `AppSettings` row or safe defaults, adds required `Outlet.company_id`, and backfills every outlet. It was applied only to disposable `kitchen_pos_company_verify_20260812`, where all 32 migrations succeeded, `company_count=1`, and `unlinked_outlets=0`; the database was dropped and confirmed absent. The `kitchen_pos` database was not migrated, seeded, synchronized, queried, or otherwise changed. Runtime use of the company feature against `kitchen_pos` therefore remains pending separate migration authorization.

Files added or changed specifically for this slice include the Company schema/migration, company API/validation/tests, company settings route, company context/brand/top-navigation components, launcher/root layout/navigation integration, outlet creation/seed/sync ownership, legacy settings separation, split-bill defaults, and these handover records. The earlier auth/header edits and unrelated `server/__tests__/inventory-logging.test.ts` were preserved.

No dependency was added for this slice; existing Multer and Base UI packages were reused. No Playwright or browser automation was run. No verification server was started. Pre-existing project dev listeners remained running on ports 3000 (PID 22600, Next) and 3001 (PID 4580, API watcher); they were inspected but not stopped because they were not started by this implementation.

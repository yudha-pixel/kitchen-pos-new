# Kitchen POS Next-Session Handover

**Updated:** 2026-08-12 (Asia/Jakarta)  
**Purpose:** Continue release-readiness reconciliation without losing the completed integration-test URL-contract repair.  
**Full plan:** `docs/superpowers/plans/2026-08-11-release-readiness-reconciliation.md`

## Read This First: Non-Negotiable Rules

1. **Git operation is read-only:** no branch/worktree creation, checkout, restore, reset, clean, merge, staging, commit, or push.
2. Do not discard or overwrite the current 24 modified integration-test files.
3. Keep working server routes. Business endpoints remain `/api/...`; authentication remains `/auth/...`; health remains `/health`. Never revert server routes to satisfy stale tests.
4. Use targeted reproduction and the smallest fix. Do not overengineer or expand scope.
5. Before editing Next.js code, read the applicable guide in `node_modules/next/dist/docs/`.
6. Do not use native `alert`, `confirm`, or `prompt`; use accessible application modals/alert dialogs.
7. Do not invoke real payment, OCR, camera, email, or other production integrations.
8. Do not run Playwright or terminal browser automation. Use the in-app browser only after explicit authorization for final smoke testing.
9. If a dev server or background test process is started, shut it down before stopping and verify its listener/process is gone.
10. Store screenshots, reports, JSON results, SQL backups, and database dumps outside the repository.
11. Update this file after every completed slice and immediately before the session ends.
12. Report verification scope precisely; targeted tests, full suite, build, runtime, and browser smoke are separate claims.

## Exact Current State

- Workspace: `D:\Project\MyProject\kitchen-pos-new`
- Branch observed: `master`
- HEAD observed: `e6f787e3222ef914ded78e9b50f60bfd6ed8d55f`
- Git has not been modified through branch/stage/commit/push operations.
- Existing work: the preserved URL-contract repair, deterministic test-fixture corrections, supplier-route compatibility correction, approved configurable payment-safe self-order implementation, pulled-recipe TypeScript corrections, accessible native-dialog replacements, and reconciled documentation completed through Task 9.
- This handover and the plan document are documentation additions; they are not staged or committed.
- No development server was started for creation of these documents.

## Current Execution Progress

### Task 0 complete: URL-contract slice reconfirmed

- **Timestamp:** 2026-08-11 21:37:03 +07:00
- **Task completed:** Protected and reconfirmed the existing integration-test URL-contract repair.
- **Files changed by this checkpoint:** `NEXT_SESSION_HANDOVER.md` only; the existing 24 integration-test edits were preserved unchanged.
- **Commands run:** `git status --short`; read-only Git directory/branch/HEAD inspection; `git diff --check`; expected-file comparison over `git diff --name-only -- server/__tests__`; scoped server diff inspection; the negative Supertest request-path `rg` scan from Task 0; and the six-file representative Vitest command from the plan.
- **Exact result:** Exactly 24 modified integration-test files matched the expected list, with no missing or unexpected server test diffs. `git diff --check` exited 0. The negative request-path scan printed no matches and exited 1 as expected. The representative gate passed **6/6 files and 107/107 tests** in 21.09 seconds.
- **Remaining failures/blocker:** None for Task 0. The next unresolved cluster is the JWT fixture drift in attendance, customers, HR, and vouchers.
- **External artifact path:** None created for this targeted gate.
- **Server/process state:** No development server was started. No listeners were observed on ports 3000 or 3001 after the test command completed.
- **Git read-only confirmation:** Branch remained `master` at `7e99bb21d4cf36c98e8356025b2d59e08cc97441`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push operation was performed.
- **Next exact action:** Run the four JWT-affected files separately, capture each unexpected 401 response, confirm the production token contract in `server/middleware/auth.ts` and token-issuing code, then make the smallest test-fixture repair.

### Task 1 complete: JWT fixtures normalized

- **Timestamp:** 2026-08-11 21:40:47 +07:00
- **Task completed:** Normalized attendance, customers, HR, and vouchers authentication fixtures to the current production JWT contract.
- **Files changed:** `server/__tests__/attendance.test.ts`, `server/__tests__/customers.test.ts`, `server/__tests__/hr.test.ts`, `server/__tests__/vouchers.test.ts`, and this handover.
- **Root cause evidence:** Production login signs `{ id, username, role, role_id }`; `TokenPayload` requires `id` and supports `admin`, `cashier`, `management`, or `owner`; middleware queries `profile.id = decoded.id`. The stale fixtures signed `{ userId, role }`, producing `findUnique({ id: undefined })` and 401 responses. Their 403 checks also used the unsupported `user` role with nonexistent UUIDs, so they never reached valid role authorization.
- **Commands run and RED results:** Each file was run separately before editing. Attendance failed 12/14, customers failed 10/12, HR failed 10/12, and vouchers failed 11/13; protected requests returned 401 and Prisma reported the undefined unique ID.
- **Fixture repair:** Each suite now creates unique, database-backed admin and cashier profiles; signs production-shaped tokens with `id`, `username`, and a valid role; uses the cashier token for the expected 403 branch; and deletes both profiles during teardown. Production middleware and auth routes were not changed.
- **Exact GREEN result:** Independently: attendance **14/14**, customers **12/12**, HR **12/12**, vouchers **13/13**. Together: **4/4 files and 51/51 tests passed** in 3.18 seconds. `npx tsc --noEmit` exited 0. `git diff --check` exited 0. A scoped scan found no remaining `userId` or `role: 'user'` fixtures in these four files.
- **Remaining failures/blocker:** None for Task 1. Full-suite status has not been rerun and remains bounded by the earlier 73-failure evidence. The next planned slice is access-control assertion tightening.
- **External artifact path:** None created for these targeted runs.
- **Server/process state:** No development server was started. No listeners were observed on ports 3000 or 3001 after verification.
- **Git read-only confirmation:** Branch remained `master` at `7e99bb21d4cf36c98e8356025b2d59e08cc97441`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push operation was performed.
- **Next exact action:** Run `server/__tests__/access-control.test.ts` alone, capture exact status/body pairs, compare assertions to the mounted authentication and business-route contracts, then remove stale 404 tolerance without changing production routes.

### Task 2 complete: access-control assertions tightened

- **Timestamp:** 2026-08-11 23:08:17 +07:00
- **Task completed:** Reconciled `server/__tests__/access-control.test.ts` with the mounted authentication, business-route, role, and permission contracts.
- **Files changed:** `server/__tests__/access-control.test.ts` and this handover.
- **RED/root-cause evidence:** The initial focused run passed 15/16 tests and failed the admin-registration case because the fixed `newuser` fixture already existed, producing 409. Temporary scoped response logging captured every status/body pair and showed that the tolerant 401/403/404 arrays and comments about unmounted routes were stale. `/auth/login` returned 200; unauthenticated protected routes returned 401; valid admin/owner user-list requests returned 200; cashier/manager user-list requests returned 403; and `/api/hr` returned a genuine 404 because the registered child route is `/api/hr/employees`.
- **Implementation:** Removed all permissive status arrays and stale route comments; asserted one exact status and relevant response shape/error per case; renamed the settings test to reflect that it is protected; changed the management-access request to the real `/api/hr/employees` route; and made the admin-created username unique and cleanup-tracked. Authentication endpoints remain under `/auth/...`; business endpoints remain under `/api/...`. Production routes and middleware were not changed.
- **Exact GREEN result:** `npm test -- server/__tests__/access-control.test.ts` passed **1/1 file and 16/16 tests** in 1.77 seconds. `npx tsc --noEmit` exited 0. `git diff --check` exited 0. The scoped stale-comment/tolerant-assertion scan printed no matches. The authentication-path scan found only `/auth/...` paths. A post-test database query found **0** profiles with the `access_control_newuser_` prefix.
- **Remaining failures/blocker:** None for Task 2. Full-suite status was not rerun. Task 3 (audit/backup unique and cleanup-safe fixtures) is next.
- **External artifact path:** None created; temporary diagnostics were removed from the final test file.
- **Server/process state:** No development server was started. No listeners were observed on ports 3000 or 3001 after verification.
- **Git read-only confirmation:** Branch remained `master` at `7e99bb21d4cf36c98e8356025b2d59e08cc97441`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push operation was performed.
- **Next exact action:** Run `server/__tests__/audit.test.ts` and `server/__tests__/backup.test.ts` separately and together, identify fixed-username or cleanup failures, then make only their fixture naming and teardown deterministic.

### Task 3 complete: audit and backup fixtures isolated

- **Timestamp:** 2026-08-12 00:11:10 +07:00
- **Task completed:** Made the audit and backup authentication fixtures unique, database-backed, partial-setup-safe, and cleanup-scoped.
- **Files changed:** `server/__tests__/audit.test.ts`, `server/__tests__/backup.test.ts`, and this handover.
- **RED/root-cause evidence:** Audit alone failed 2/10, backup alone failed 2/12, and the pair failed 4/22. Every failure was Prisma P2002 on fixed usernames (`test-cashier-audit`, `test-cashier-audit2`, `test-cashier-backup`, or `test-cashier-backup2`). The suites also depended on the shared `admin` profile, created cashier profiles inside test bodies, and used broad teardown filters that could delete unrelated `TEST` audit logs or every `kitchen-pos-backup-*` database row.
- **Implementation:** Each suite now creates one unique `UXR-<timestamp>-<module>-<suffix>-admin` profile and one matching cashier profile, stores IDs immediately, obtains real login tokens once, and reuses the cashier token for both 403 checks. `afterAll` tolerates partial setup, deletes audit/backup records tied only to the captured IDs, then deletes only those profiles. Broad description/filename cleanup and inline profile mutations were removed. Production audit/backup routes were not changed.
- **Exact GREEN result:** Audit alone passed **10/10**. Backup alone passed **12/12**. The pair passed twice consecutively at **2/2 files and 22/22 tests** on both runs. `npx tsc --noEmit` exited 0. `git diff --check` exited 0. A static scan found no fixed cashier usernames or broad cleanup patterns in the two files. Post-run database checks found **0** Task 3 UXR profiles and **0** database-backup rows.
- **Generated backup evidence:** Five SQL files produced during RED/GREEN verification were moved immediately and individually out of the repository to `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-3-backup-evidence`: `kitchen-pos-backup-2026-08-11T17-07-37-046Z.sql`, `kitchen-pos-backup-2026-08-11T17-07-44-808Z.sql`, `kitchen-pos-backup-2026-08-11T17-10-29-999Z.sql`, `kitchen-pos-backup-2026-08-11T17-10-44-795Z.sql`, and `kitchen-pos-backup-2026-08-11T17-10-48-884Z.sql`. No Task 3-generated SQL file remains under the repository `backups` directory.
- **Pre-existing residue intentionally preserved:** The four legacy profiles listed in the RED failure still exist with creation times from 2026-08-11 21:01 Asia/Jakarta. They predate this task and were not deleted because cleanup authority is limited to fixtures created by the current run. They no longer collide with the unique fixtures.
- **Remaining failures/blocker:** None for Task 3. Full-suite status was not rerun. Task 4 (supplier and purchase-order fixture isolation) is next.
- **Server/process state:** No development server was started. No listeners were observed on ports 3000 or 3001 after verification.
- **Git read-only confirmation:** Branch remained `master` at `7e99bb21d4cf36c98e8356025b2d59e08cc97441`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push operation was performed.
- **Next exact action:** Run `server/__tests__/suppliers.test.ts` alone, capture the exact FK/teardown failure, split supplier CRUD and purchase-order fixtures, and verify the file twice consecutively.

### Task 4 complete: supplier and purchase-order fixtures isolated

- **Timestamp:** 2026-08-12 00:23:08 +07:00
- **Task completed:** Isolated supplier CRUD and purchase-order fixtures, made teardown dependency-safe and partial-setup-safe, and repaired the mounted legacy supplier purchase-order route after the focused test demonstrated genuine Prisma-schema drift.
- **Files changed:** `server/__tests__/suppliers.test.ts`, `server/routes/suppliers.ts`, and this handover.
- **RED/root-cause evidence:** The initial focused run failed **6/13** tests. Teardown raised PostgreSQL 23001 because purchase orders were deleted before their restricted purchase-order items; the fixed `supplier_cashier_test` username raised Prisma P2002; PO assertions expected removed flat fields; and the mounted receive route still queried removed `PurchaseOrder.ingredient`, `ingredient_id`, `quantity`, and `received_date` fields. After fixture-only repair, setup and teardown were clean and the result improved to **9/13**, but four route-contract failures remained: create returned `draft`, and receive paths still crashed on the removed relation. This proved a production compatibility defect rather than further fixture drift.
- **Fixture implementation:** The suite now uses one unique `UXR-<timestamp>-suppliers-<suffix>` namespace; database-backed admin and cashier tokens; separate PO, update, and delete suppliers; independent pending and already-received POs; unique PO numbers; immediate ID tracking; item-backed assertions; and guarded teardown in the order PO items, POs, stock logs, suppliers, ingredient, audit logs, then profiles.
- **Production compatibility correction:** The nested supplier PO create route now validates and reads the ingredient, writes canonical PO items with the ingredient name/unit, and creates `pending` orders. The receive route scopes by supplier, reads `items`, atomically claims a pending PO, increments each ingredient, records each stock adjustment, and returns the canonical item-backed PO. Removed flat/legacy fields were not reintroduced. This route edit was outside the task's expected test-only file list but was required by the reproduced mounted-route defect.
- **Exact GREEN result:** After the route correction the file passed twice, then after the final TypeScript narrowing edit it passed twice again. The fresh final gate was **1/1 file and 13/13 tests** on both consecutive runs (1.11 seconds and 1.05 seconds). `npx tsc --noEmit` exited 0. `git diff --check` exited 0, with only existing LF-to-CRLF working-copy warnings. Static scans found **0** obsolete supplier-route schema references and **0** fixed supplier fixtures. Post-run database counts were **0** for Task 4 UXR profiles, ingredients, suppliers, and POs.
- **RED-residue cleanup:** Exact records created by the aborted RED setup were removed in dependency order: 4 PO items, 4 POs, 1 supplier, 1 ingredient, and 1 profile; no matching stock logs or audit logs existed. Follow-up counts for profile `9c797f9a-669a-4330-b1ae-557ecfead6ed`, ingredient `48e5b912-17f4-4a14-ae5a-8aace47fe4d3`, and supplier `705ca5da-406b-49f5-b406-9b05382bde6a` were all 0.
- **Remaining failures/blocker:** None for Task 4. The full suite was not rerun. Task 5 must isolate the remaining table-delete and rate-limiter failures from exact evidence before any edits.
- **External artifact path:** None created for Task 4.
- **Server/process state:** No development server was started. No listeners were present on ports 3000 or 3001 at the final 2026-08-12 00:23:08 +07:00 check.
- **Git read-only confirmation:** Branch remained `master` at `7e99bb21d4cf36c98e8356025b2d59e08cc97441`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push operation was performed.
- **Next exact action:** Extract the exact table and rate-limiter failures from the latest external JSON, run `server/__tests__/tables.test.ts` alone, then run `server/__tests__/infrastructure.security.test.ts` alone and after a request-heavy suite to prove or disprove shared limiter-state leakage.

### Task 5 complete: table authentication and rate-limit assertions isolated

- **Timestamp:** 2026-08-12 00:39:37 +07:00
- **Task completed:** Reproduced and resolved the remaining table-delete and infrastructure rate-limit failures without weakening production authorization, relations, or limiter settings.
- **Files changed:** `server/__tests__/tables.test.ts`, `server/__tests__/infrastructure.security.test.ts`, and this handover. No production file was changed for Task 5.
- **Saved-suite evidence:** The external post-URL-contract JSON identified exactly two table failures (`should delete a table` expected 200 but received 401; `should return 404 for deleted table` expected 404 but received 401) and one infrastructure failure (`applies general rate limiting to API routes` found no `ratelimit-limit` header).
- **Focused RED evidence:** Tables alone reproduced at **13/15**, with only the two unauthenticated delete requests failing at 401. Infrastructure alone reproduced at **7/8**, with the payment collection request returning no limiter headers. The failures therefore did not depend on full-suite shared state.
- **Root cause:** `DELETE /api/tables/:id` correctly requires a database-backed admin token, but the test sent no authorization header. The fixture table had no `CustomerOrder` relation, so FK deletion was not the failure. The infrastructure test called unregistered `GET /api/payments`; payment limiting is intentionally route-scoped and therefore never executes for that unmatched collection URL. A direct diagnostic request to registered `GET /api/payments/:id` returned 401 after the limiter and included `ratelimit-policy`, `ratelimit-limit`, `ratelimit-remaining`, and `ratelimit-reset`.
- **Implementation:** The table suite now creates one unique database-backed admin, signs the production JWT shape, authenticates both delete requests, uses an identifiable table number within the 30-character contract, and cleans only the captured table/profile IDs. The old broad `TEST-` deletion and suite-level Prisma disconnect were removed. The infrastructure assertion now targets registered `GET /api/payments/00000000-0000-0000-0000-000000000000`, asserts the expected 401 authorization boundary, and verifies the limiter headers. No limiter reset helper was necessary.
- **Fixture correction during GREEN:** The first edited table rerun used an over-30-character unique table number, so creation returned 400 and seven dependent checks failed. The identifier was shortened within the existing validation contract; no production validation was changed.
- **Exact GREEN result:** Tables alone passed **15/15**; infrastructure alone passed **8/8**; together they passed **2/2 files and 23/23 tests**. The representative request-heavy gate passed **6/6 files and 107/107 tests**. The final expanded gate passed **8/8 files and 130/130 tests** after the final fixture edit. `npx tsc --noEmit` exited 0. `git diff --check` exited 0 with only existing LF-to-CRLF warnings. Static checks found no broad table cleanup or unmatched payment collection path. Database checks found **0** Task 5 UXR profiles and **0** `UXR-T-` tables.
- **Remaining failures/blocker at Task 5 completion:** None. The full suite was not rerun. The then-pending Task 6 owner gate was subsequently decided and completed; see the Task 6 section below.
- **External artifact path:** Existing evidence only: `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\post-url-contract-test-results-20260811.json`. No new artifact was created.
- **Server/process state:** No development server was started. No listeners were present on ports 3000 or 3001 at the final check.
- **Git read-only confirmation:** Branch remained `master` at `7e99bb21d4cf36c98e8356025b2d59e08cc97441`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push operation was performed.
- **Next exact action at Task 5 completion:** Obtain the Task 6 owner decision. This was subsequently completed; the approved contract and implementation evidence follow.

### Task 6 complete: configurable, payment-safe self-order

- **Timestamp:** 2026-08-12 01:24:27 +07:00
- **Approved owner contract:** Restaurant-wide methods are `cashier`, `qris`, and `transfer`; debit/card is a cashier tender. Fresh/default configuration is cashier only. Cashier routing supports `review` (default) and opt-in `auto`. QRIS/transfer always require a submitted reference and manual staff verification. Verification, paid status, kitchen-order creation, acceptance, and audit logging are one transaction. No gateway, webhook, OCR, upload, or provider integration was added.
- **Files changed:** `prisma/schema.prisma`; `prisma/migrations/20260812012000_configurable_payment_safe_self_order/migration.sql`; `server/routes/selfOrder.ts`; `server/routes/settings.ts`; `src/features/self-order/paymentMethods.ts`; `src/features/self-order/selfOrderService.ts`; `src/components/self-order/SelfOrderExperience.tsx`; `src/lib/db.ts`; `app/admin/settings/page.tsx`; `app/pos/requests/page.tsx`; `app/order-status/[orderId]/page.tsx`; all four `server/__tests__/self-order-*.test.ts` files; and this handover.
- **Migration:** Added restaurant payment instructions, customer payment reference, verification timestamp, and verifying staff ID. Existing settings migrate to cashier-only because historic digital methods had no trustworthy instructions; existing `review`/`auto` routing and all existing customer orders are preserved. Local `prisma migrate deploy` succeeded and `prisma migrate status` reports all 31 migrations applied.
- **Server behavior:** Public `GET /api/self-order/config` returns only the sanitized method/routing DTO. New orders must use a usable enabled method; manual digital methods require a trimmed 1-120 character reference and start pending. Cashier starts unpaid; only cashier may auto-route while remaining unpaid. Authenticated `POST /api/self-order/orders/:id/verify-payment-and-accept` requires `orders.create`, atomically claims a pending QRIS/transfer request, records verifier/time, marks paid and accepted, creates one kitchen order, and writes one audit record. Repeats/races return 409. The former PATCH payment-status path now fails closed (401 without auth, 404 with auth).
- **User journeys:** Admin settings gained an accessible Self-Order tab with method checkboxes, conditional required instructions, HTTPS QRIS image validation, routing radios, and an immediate-unpaid-routing warning. Guest checkout now reads the public DTO, never shows a decorative QR or hard-coded account, asks no reference for cashier, requires a digital reference, never mutates paid status, and redirects to self-order status showing payment verification state. The staff queue shows method/status/reference, warns on legacy missing references, keeps the cashier accept action, and presents one digital verify-and-send action.
- **TDD evidence:** Focused RED was 4 failures in `self-order-payment.test.ts` for the missing cashier catalog/default and old online/debit semantics. After implementation, the final gate ran all four self-order suites together with `settings-resolver.test.ts` and `permissions.test.ts` twice: **6/6 files and 51/51 tests passed on each consecutive run**. Coverage includes disabled/unknown methods, sanitized config, missing instructions/reference, HTTPS validation, review/auto routing, unauthenticated and insufficient-permission denial, atomic success, repeated and concurrent 409 protection, transaction rollback, and legacy reference-free verification.
- **Static/database/process evidence:** `npx tsc --noEmit` exited 0. `git diff --check` exited 0 (LF-to-CRLF warnings only). Static scan found no guest debit option, fake QR component, hard-coded test bank account, old guest payment mutation, or `Bayar Sekarang` in the self-order surface; debit remains only as a cashier-tender description. Database residue counts were 0 for Task 6 tables, customer orders, temporary roles, and notifications. One orphan verification audit from an earlier pre-cleanup run was deleted; final test fixtures clean their own audit/notification rows. Settings ended at the safe default: cashier only, empty instructions, review routing. Ports 3000/3001 had no listeners. No dev server or browser automation was started.
- **Verification boundary:** This is targeted API/unit/static/TypeScript/migration evidence. The full suite, production build, and browser smoke were not run in Task 6 and remain later plan gates.
- **Git read-only confirmation:** Branch remained `master` at `7e99bb21d4cf36c98e8356025b2d59e08cc97441`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push operation was performed.
- **Next exact action:** Stop for the owner report. After approval, begin Task 7 by running the plan's targeted clusters and refreshed full suite twice; do not begin Task 8 native-dialog work until Task 7 is reported.

### Post-Task-6 remote synchronization complete

- **Timestamp:** 2026-08-12 (Asia/Jakarta)
- **Action:** With explicit owner authorization, ran `git pull --ff-only origin master` while preserving the unstaged Task 0-6 work.
- **Result:** Fast-forwarded `master` from `7e99bb21d4cf36c98e8356025b2d59e08cc97441` to `e6f787e3222ef914ded78e9b50f60bfd6ed8d55f` (recipe-management commit). The incoming commit changed 11 recipe/inventory/POS files and did not overlap the locally modified Task 0-6 files.
- **Conflict checks:** `git diff --name-only --diff-filter=U` returned no files; `git status --branch --short` shows `master...origin/master` with no ahead/behind marker; `git diff --check` exited 0 with line-ending warnings only. No stash, merge commit, rebase, checkout, reset, stage, commit, or push was performed.

### Task 7 complete: entire integration suite converged

- **Timestamp:** 2026-08-12 09:50:08 +07:00
- **Post-pull TypeScript defect:** The newly pulled recipe-management commit reproduced **32 TypeScript errors**. Root causes were omitted `AlertCircle`, `Ingredient`, and `Recipe` imports; a nonexistent `formatCurrency` export; flat `ingredient_name` reads that contradicted the nested recipe response; untyped ingredient JSON maps inferred as `{}`; inventory reads of nonexistent Prisma `Ingredient.sku/category`; and one impossible missing-ingredient unit fallback. Minimal contract/import corrections were made in `app/admin/products/page.tsx`, `app/inventory/mapping/page.tsx`, `app/inventory/page.tsx`, `app/pos/page.tsx`, and `src/features/inventory/recipeApiService.ts`. `npx tsc --noEmit` then exited 0.
- **Repaired-cluster gate:** JWT cluster **4 files/51 tests**; access control **1/16**; audit/backup **2/22**; supplier **1/13**; tables/rate limiter **2/23**; self-order/settings/permissions **6/51**. Every cluster passed before the full suite.
- **First full-suite diagnostic:** **351 passed, 1 failed, 0 pending tests**. The sole failure was `kitchen.test.ts` creating fixed username `test-cashier`, which collided with existing residue. Focused reproduction was **12 passed/1 failed** with Prisma P2002. The test now uses a unique `UXR-<timestamp>-kitchen-cashier` username and deletes it in `finally`; focused GREEN was **13/13**.
- **Required consecutive full-suite gate:** Run 1 passed **174/174 suites and 364/364 tests**, with **0 failed and 0 pending**. Run 2 immediately afterward passed the same **174/174 suites and 364/364 tests**, with **0 failed and 0 pending**.
- **Machine-readable evidence:** `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\release-readiness-test-results-20260812-run1.json`, `release-readiness-test-results-20260812-green1.json`, and `release-readiness-test-results-20260812-green2.json`.
- **Generated backup evidence:** Four SQL files produced by Task 7 test runs were moved individually out of the repository to `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-7-suite-evidence`: `kitchen-pos-backup-2026-08-12T02-45-37-314Z.sql`, `kitchen-pos-backup-2026-08-12T02-46-11-759Z.sql`, `kitchen-pos-backup-2026-08-12T02-48-20-324Z.sql`, and `kitchen-pos-backup-2026-08-12T02-48-50-631Z.sql`. None remains in the repository.
- **Final static/state checks:** Fresh `npx tsc --noEmit` exited 0. `git diff --check` exited 0 after removing one trailing space (line-ending warnings only). Database counts were 0 for Task 7 kitchen profiles, Task 6 tables/roles, Task 5 tables, and database-backup rows. Ports 3000/3001 had no listeners. No browser automation or development server was started.
- **Verification boundary:** Integration suite and TypeScript are freshly green. The production build and browser smoke are later gates and were not run in Task 7.
- **Git read-only confirmation:** Branch remains `master`, synchronized with `origin/master`, at `e6f787e3222ef914ded78e9b50f60bfd6ed8d55f`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push was performed during Task 7.
- **Next exact action:** Stop for the owner report. After approval, begin Task 8 by replacing the remaining native area-delete confirmation with an accessible application alert dialog and its focused tests.

### Task 8 complete: native confirmations replaced with accessible application dialogs

- **Timestamp:** 2026-08-12 10:02:25 +07:00
- **Task completed:** Replaced native destructive confirmations with application-owned alert dialogs while preserving deferred deletion, error visibility, keyboard behavior, and focus management.
- **Files changed:** `app/admin/settings/page.tsx`; `app/inventory/mapping/page.tsx`; new `src/features/settings/areaDeletion.ts`; new `server/__tests__/settings-native-dialogs.test.ts`; and this handover. The shared `Modal` and `ConfirmDialog` primitives required no changes because the existing modal already provides labelled dialog semantics, Escape handling, focus trap, initial focus on the first footer button, and focus restoration.
- **TDD evidence:** The focused RED run failed **3/3 tests**: the area-deletion workflow helper did not exist and the settings source still contained native `confirm(...)`. The final focused gate passed **2/2 files and 4/4 tests** in 530 ms, covering deferred area deletion, exact confirmed deletion, the covered-source native-dialog guard, and shared alert-dialog semantics.
- **Implementation:** Area deletion now opens a labelled `role="alertdialog"` with Cancel first, a destructive confirm action, disabled duplicate submission, pending state, inline asserted error output, no backdrop dismissal, and an area-specific invoking-button accessible name. The area remains unchanged until confirmation; the change is staged in settings and takes effect when the owner saves settings. The full source scan found one additional native recipe-delete workflow introduced by the pulled recipe commit, so it was brought under the same acceptance rule: the dialog captures the selected product, keeps the dialog open during the API request, shows API failures inline, prevents repeat submission, and does not delete the product itself.
- **Exact verification result:** `npx tsc --noEmit` exited 0. `rg -n "\b(alert|confirm|prompt)\s*\(" app src --glob "*.ts" --glob "*.tsx"` returned no matches (`NO_NATIVE_DIALOG_CALLS`). `git diff --check` exited 0 with line-ending warnings only. Ports 3000 and 3001 were clean. No browser automation, development server, or production build was run.
- **Verification boundary:** Focused source/helper/accessibility tests, TypeScript, static source scan, diff hygiene, and listener state are green. Task 7's two full-suite passes predate the Task 8 UI/test additions; the production build and current full-suite reruns remain Task 11 gates. Browser smoke remains unauthorized until the explicit Task 10 gate.
- **Git read-only confirmation:** Branch remains `master`, synchronized with `origin/master`, at `e6f787e3222ef914ded78e9b50f60bfd6ed8d55f`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push was performed during Task 8.
- **Next exact action:** Stop for the owner report. After approval, begin Task 9 by archiving the accumulated historical handover and reconciling `HANDOVER.md`, this handover, and the external Phase 0 handover into one consistent current-state documentation set. Do not begin Task 10 browser smoke without explicit authorization.

### Task 9 complete: canonical documentation reconciled

- **Timestamp:** 2026-08-12 10:10 +07:00
- **Task completed:** Replaced the accumulated root handover journal with a concise current-state snapshot, preserved the complete historical journal, marked the external Phase 0 ledger historical/superseded, and aligned all three documents on the current release-readiness truth.
- **Files changed:** `HANDOVER.md`; new `docs/archive/HANDOVER-history-2026-08-12.md`; this handover; and external `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\PHASE0_HANDOVER.md`.
- **Historical preservation:** The old root journal remains 1,157 lines and is content-identical to the prior tracked `HANDOVER.md` Git blob: both hash to `5c61668bb4a9d63945f2092040155d8756334d4f` with `git hash-object` / `git rev-parse HEAD:HANDOVER.md`. The new canonical root handover links to that archive rather than carrying forward its stale journal format.
- **Reconciliation:** The canonical snapshot and external appendix now agree that `/apps` exists, authenticated root routing targets it, Sidebar navigation is module-scoped with a deterministic App Launcher link, stock requests are Prisma/API-backed under `/api/stock-requests`, Tasks 0-9 are complete, Task 7 passed two consecutive 364/364 full-suite runs, Task 8 focused/TypeScript/static gates passed, the production build is stale and must be rerun in Task 11, browser smoke is not current, and Task 10 requires explicit authorization.
- **Working-tree manifest:** All current documents record `master` at `e6f787e3222ef914ded78e9b50f60bfd6ed8d55f`, synchronized with `origin/master`, with 42 modified tracked files and 6 untracked paths. The canonical root `HANDOVER.md` contains the exact path manifest. Git remains unstaged and uncommitted.
- **Exact validation result:** A combined current-artifact/working-tree check validated **58/58 paths**, including every changed/untracked manifest entry, all canonical documents, both Task 7 green JSON files, the external Phase 0 ledger, and the external Task 7 SQL-evidence directory. No path was missing. The archive blob matched the original tracked handover blob exactly. Agreement scans found the same HEAD, 42/6 tree counts, Tasks 0-9 status, stale-build boundary, unauthorized-browser boundary, and Task 10 next action in all current-state documents. `git diff --check` exited 0 with line-ending warnings only; no unmerged files were present; ports 3000 and 3001 were clean.
- **Verification boundary:** Documentation/source/path/diff/process checks only. No tests, build, browser automation, API server, or frontend server were started for Task 9. Task 7's full-suite evidence and Task 8's focused evidence are reported as inherited evidence with their exact timing boundary, not rerun evidence.
- **Next exact action:** Stop for the owner report. Task 10 may start only if the owner explicitly authorizes the Codex in-app-browser smoke test. If authorized, start API/frontend separately, ledger all review records, use only the in-app browser, and stop both servers before reporting. Do not begin Task 11 before the Task 10 report or an explicit owner decision to skip/defer it.

### Task 10 executed with findings: authorized in-app-browser smoke

- **Timestamp:** 2026-08-12 15:35 +07:00
- **Authorization and scope:** The owner's `continue` after the Task 9 report was treated as explicit authorization for Task 10. Only the Codex in-app browser was used for UI interaction; no terminal Playwright, Chrome extension, external browser, real provider, OCR, camera, or payment integration was invoked.
- **Provider preflight:** Active `.env`, `.env.local`, and local source contained no active provider key/flag usage. Provider keys exist only in example environment files; OCR calls `simulateOCR`; payment routes are documented placeholders; application TypeScript does not import the installed Midtrans/Xendit SDKs.
- **Passed journeys:** API `/health` returned `ok`; `/login` returned 200; admin login reached `/apps`; POS and Kitchen Display loaded; the POS launcher control returned to `/apps`; POS and Kitchen Display rails contained only their module child links plus App Launcher. A QRIS guest order showed `Menunggu verifikasi pembayaran`; staff saw its pending status and exact reference, verified it once, and the resulting order appeared in Kitchen Display. A labeled stock request progressed through Supervisor, Manager, and Finance approval to `Disetujui`. Dark theme saved and survived reload through the root `dark` class, then Light was restored and the class disappeared.
- **Runtime blocker found:** The Stock Approvals page's `Buat Test Request` action failed. It forwards `ingredient.supplier_id`, which was `null`; `createStockRequestSchema` accepts an optional UUID but not null. The API returned 400 with `supplier_id: Invalid input: expected string, received null`, and the UI showed `Failed to create stock request`. To isolate the approval UI, one labeled request was created via the authenticated local API with `supplier_id` omitted, then approved entirely through the browser. Task 10 is therefore executed with findings, **not fully green**.
- **Additional runtime finding:** The first authenticated launcher load logged `Settings endpoint returned non-OK status: 401` from `ThemeContext`. Subsequent authenticated settings reads and theme saves succeeded. No hydration error was observed.
- **Responsive/accessibility matrix:** `/apps` and `/pos` had no horizontal document overflow at 360x800, 768x1024, or 1366x768. At mobile/tablet widths the POS navigation rendered as a labelled dialog, showed only POS links plus App Launcher, and closed with Escape. Static DOM checks found one unlabeled launcher select at 360/768 widths; POS had two unlabeled controls and no level-one heading at all three widths. No unnamed buttons were found.
- **Review ledger:** Customer order `f397a353-1a7a-4f84-9d7d-e7ee2d8ffc6f`; linked kitchen order `cc1d8b49-a503-491f-909a-8344e8fc922b`; stock request `2418c8e0-7f32-443c-b84e-261e54335735`; quotation request `2bb0170b-286c-4265-b39f-bba2669c5895`.
- **Cleanup:** All exact review records, linked items/order, audit, notifications, stock request, and quotation request were deleted. Es Teh Manis stock was restored from 69 to 70. Final counts were zero for every recorded ID and Task 10 label. Theme returned to `light`; self-order returned to methods `[cashier]`, routing `review`, instructions `{}`; the public DTO returned cashier/review only.
- **Evidence:** `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-10-browser-smoke-20260812\TASK10_REPORT.md`, 11 PNG screenshots, responsive/accessibility JSON, final observations JSON, and API/frontend stdout/stderr logs in the same directory.
- **Server/process state:** API and frontend were started separately. The exact task process trees were identified by PID/command line and stopped. Ports 3000 and 3001 were clean, and none of the identified task processes remained.
- **Git read-only confirmation:** Branch remains `master` at `e6f787e3222ef914ded78e9b50f60bfd6ed8d55f`, synchronized with `origin/master`. No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push was performed.
- **Next exact action:** Stop for the owner report. Recommended: repair the null-versus-omitted stock-request client contract and rerun that browser creation/approval slice before Task 11. If the owner instead requests Task 11 immediately, carry the Task 10 finding as a known release blocker and do not claim release readiness.

### Task 10 blocker repaired: supplier-less stock-request creation rerun

- **Timestamp:** 2026-08-12 15:48 +07:00
- **Root cause:** Ingredients without a preferred supplier return `supplier_id: null`. The Stock Approvals test-request action forwarded that raw value, and `createStockRequest` serialized it unchanged. The server correctly accepts a UUID or omission and rejected null with 400.
- **Implementation:** Added `server/__tests__/stock-request-client-contract.test.ts`. `createStockRequest` now normalizes only a nullish supplier ID to omission before JSON serialization. The server schema was not weakened.
- **TDD evidence:** RED failed 1/1 because the captured payload contained `supplier_id: null`. GREEN passed 1/1 after the boundary fix. A fresh focused rerun passed 1/1; `npx tsc --noEmit` exited 0.
- **Affected browser rerun:** Using only the Codex in-app browser, `Buat Test Request` created the supplier-less request through the UI. The same record advanced through Supervisor, Manager, and Finance to `Disetujui`; no API-created bypass fixture was needed.
- **Review ledger and cleanup:** Stock request `354097a6-b50e-434e-95a6-52f785973c77`; quotation request `dece331b-9eb8-44d5-ab66-0e06fe2dd6d4`. Deleted exactly one quotation request, one stock request, and three related notifications. Final exact residue was zero for stock requests, quotation requests, quotations, and notifications.
- **Static/process evidence:** API/frontend stderr logs were empty. `git diff --check` exited 0 with line-ending warnings only; no unmerged files were present. Ports 3000/3001 were clean and no recorded task process remained.
- **Evidence:** `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-10-stock-request-fix-20260812\TASK10_STOCK_REQUEST_FIX_REPORT.md`; API/frontend stdout/stderr logs are in the same directory.
- **Verification boundary:** The focused regression test, TypeScript, affected real browser journey, exact cleanup, diff, and listener gates passed. The full suite and production build were not run and remain Task 11.
- **Git read-only confirmation:** No branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push was performed.
- **Next exact action:** Stop for the owner report. After approval, begin Task 11.

### Task 11 complete: final local release gate

- **Timestamp:** 2026-08-12 15:56 +07:00
- **TypeScript:** `npx tsc --noEmit` exited 0.
- **Full suite run 1:** **178/178 suites and 368/368 tests passed**, with 0 failed and 0 pending. JSON: `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-11-final-gate-20260812\full-suite-run1.json`.
- **Full suite run 2:** **178/178 suites and 368/368 tests passed**, with 0 failed and 0 pending. JSON: `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-11-final-gate-20260812\full-suite-run2.json`.
- **Exact-tree completion verification:** After final handover reconciliation, an additional full-suite run passed **178/178 suites and 368/368 tests**, with 0 failed and 0 pending. JSON: `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-11-final-gate-20260812\full-suite-completion-verification.json`.
- **Production build:** `npm run build` exited 0. Next.js 16.2.10 compiled successfully, completed its TypeScript phase, and generated **39/39 pages**.
- **Generated artifacts:** The suite runs produced `kitchen-pos-backup-2026-08-12T08-52-49-795Z.sql`, `kitchen-pos-backup-2026-08-12T08-53-44-321Z.sql`, and `kitchen-pos-backup-2026-08-12T08-58-55-363Z.sql`. Each was verified and moved individually to the external Task 11 evidence directory. No Task 11 backup remains under repository `backups`.
- **Database/configuration gate:** Every public table with a `created_at`, `requested_at`, or `sent_at` column had zero rows at or after the Task 11 cutoff `2026-08-12T08:49:00Z`. UXR tables and suppliers were 0. Two UXR backup profiles and one UXR inventory ingredient predate Task 11 and were preserved. Theme remained `light`; self-order remained `[cashier]`, instructions `{}`, routing `review`.
- **Diff/process gate:** Final `git diff --check` exited 0 with line-ending warnings only; no unmerged files. Ports 3000 and 3001 were clean. Task 11 started no development server.
- **Git state:** Branch/HEAD remained `master` / `e6f787e3222ef914ded78e9b50f60bfd6ed8d55f`. Preflight found seven already-staged additions, 42 unstaged tracked paths, and zero untracked paths; the external index state was preserved. Task 11 performed no branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push.
- **Evidence:** `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-11-final-gate-20260812\TASK11_FINAL_GATE_REPORT.md` plus three JSON reports and three generated SQL files in the same directory.
- **Release boundary:** Local source/test/build/browser/diff/database/listener gates are green. Production deployment, real payment/provider integrations, uploads, and outlet overrides were not tested. The transient initial settings 401 and recorded accessibility observations remain known follow-up items.
- **Next exact action:** Stop for the owner report. Any Git integration/review or deployment preparation requires a new explicit owner instruction.

## Completed: Integration-Test URL Contract

The stale Supertest URLs were repaired to match working server mounts. Production server routes were not reverted.

- All business request paths now use `/api/...`.
- Authentication paths remain `/auth/...`.
- Health remains `/health`.
- Static scan found zero non-contract Supertest paths.
- `git diff --check` passed after the URL repair.
- `npx tsc --noEmit` passed after the URL repair.
- Representative gate passed: 6 files, 107 tests.
- Full suite before repair: 354 total; 164 passed, 167 failed, 23 pending; 122/174 suites failed.
- Full suite after repair: 354 total; 281 passed, 73 failed, 0 pending; 68/174 suites failed.

### Modified Integration-Test Files to Preserve

```text
server/__tests__/access-control.test.ts
server/__tests__/attendance.test.ts
server/__tests__/audit.test.ts
server/__tests__/backup.test.ts
server/__tests__/customers.test.ts
server/__tests__/hr.test.ts
server/__tests__/infrastructure.security.test.ts
server/__tests__/inventory.security.test.ts
server/__tests__/kitchen.test.ts
server/__tests__/ocr.test.ts
server/__tests__/orders.restore.test.ts
server/__tests__/orders.stock.test.ts
server/__tests__/payments.security.test.ts
server/__tests__/permissions.test.ts
server/__tests__/self-order-accept.test.ts
server/__tests__/self-order-pricing.test.ts
server/__tests__/self-order-routing.test.ts
server/__tests__/stockTransfers.test.ts
server/__tests__/suppliers.test.ts
server/__tests__/tables.test.ts
server/__tests__/users.test.ts
server/__tests__/vouchers.test.ts
server/__tests__/warehouses.test.ts
server/__tests__/webhook.security.test.ts
```

## External Evidence

- After URL repair: `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\post-url-contract-test-results-20260811.json`
- Before URL repair: `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\current-test-results-20260811.json`
- Generated backup moved out of the repo: `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\url-contract-review-generated-kitchen-pos-backup-2026-08-11T14-13-20-718Z.sql`
- Earlier Phase 0 history: `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\PHASE0_HANDOVER.md`
- Task 10 browser-smoke report, screenshots, responsive/accessibility matrix, and server logs: `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-10-browser-smoke-20260812\TASK10_REPORT.md`
- Task 10 stock-request blocker repair report and logs: `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-10-stock-request-fix-20260812\TASK10_STOCK_REQUEST_FIX_REPORT.md`
- Task 11 final gate report, JSON, and SQL evidence: `C:\Users\sukma\.codex\visualizations\2026\08\11\019ff13c-48c7-79c3-b79e-47ce923c968f\task-11-final-gate-20260812\TASK11_FINAL_GATE_REPORT.md`

## Recommended Next Order

1. Obtain an owner decision for Git integration/review or deployment preparation. Git remains strictly read-only until explicitly changed.

## Exact First Action for the Next Session

Tasks 0-11 are complete and the local engineering release gates passed. Establish the read-only state, review the Task 11 evidence above, and do not perform Git integration or deployment work without a new explicit owner instruction.

```powershell
Set-Location -LiteralPath 'D:\Project\MyProject\kitchen-pos-new'
git status --short
git diff --check
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
Get-Content -Raw docs/superpowers/plans/2026-08-11-release-readiness-reconciliation.md
rg -n "Task 10|Task 11|in-app-browser" docs/superpowers/plans/2026-08-11-release-readiness-reconciliation.md
```

Recommended next slice: owner-directed Git integration/review or deployment preparation. Preserve the seven pre-existing staged additions and do not alter the index unless explicitly authorized.

## Known Failure Clusters and Risks

### Self-order verification boundary

- The owner contract is implemented and targeted tests pass twice; do not reintroduce debit as a guest method or allow digital auto-routing.
- Real gateway/provider verification, uploads, and outlet overrides remain out of scope. Task 10 browser smoke is current; the stock-request blocker is resolved, while the transient settings 401 and accessibility observations remain documented for final judgment.

### Task 10 runtime and accessibility findings

- The earlier Stock Approvals null-supplier defect is resolved and its affected browser slice passed. Preserve the client-boundary regression test and do not weaken the server UUID validation.
- The first authenticated launcher load logged a transient settings 401; later settings and theme operations succeeded.
- Responsive checks found no horizontal overflow. `/apps` has one unlabeled select at narrow widths; `/pos` has two unlabeled controls and no level-one heading at the tested widths.

### Documentation state

- The accumulated root journal is preserved at `docs/archive/HANDOVER-history-2026-08-12.md`; root `HANDOVER.md` is now the concise canonical snapshot.
- External `PHASE0_HANDOVER.md` is explicitly historical and contains a current-state correction appendix. Do not treat time-specific test/build counts inside its preserved ledger as current gates.

## Verification Boundaries

- The fresh Task 11 production build passed and generated 39/39 pages.
- The historical 73-failure result is superseded by Task 7's two consecutive **364/364** passes.
- Task 10 browser smoke is current for the post-reconciliation tree. Its stock-request blocker is resolved; the transient settings 401 and recorded accessibility findings remain documented observations for final release judgment.
- No production deployment or real-provider verification has been performed.

## Required Handover Update Template

Append or replace the current-state sections after each slice with:

```text
Timestamp:
Task completed:
Files changed:
Command(s) run:
Exact result:
Remaining failures/blocker:
External artifact path:
Server/process state:
Git read-only confirmation:
Next exact action:
```

## Copyable Continuation Prompt

```text
Continue Kitchen POS release-readiness reconciliation from:
D:\Project\MyProject\kitchen-pos-new\NEXT_SESSION_HANDOVER.md

Read the full plan:
D:\Project\MyProject\kitchen-pos-new\docs\superpowers\plans\2026-08-11-release-readiness-reconciliation.md

Follow every rule in the handover. Git is strictly read-only: no branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push. Preserve the existing 24 URL-contract test edits. Working server routes are authoritative: /api for business routes, /auth for authentication, /health for health. Do not use native alerts/confirms, real external providers, Playwright, or terminal browser automation. Shut down any server you start.

Tasks 0-11 are complete. Task 10's supplier-less Stock Approvals blocker was repaired and its affected browser slice passed. Task 11 then passed fresh TypeScript, two consecutive full suites at 178/178 suites and 368/368 tests with zero failed/pending, and a production build generating 39/39 pages. Diff, current-run database residue, generated-artifact, and listener gates also passed. Production deployment and real-provider integrations remain outside the verified scope. Stop for owner direction; Git remains strictly read-only and its seven pre-existing staged additions must be preserved unless explicitly authorized otherwise.
```

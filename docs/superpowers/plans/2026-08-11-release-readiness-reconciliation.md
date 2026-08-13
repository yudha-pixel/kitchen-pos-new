# Kitchen POS Release-Readiness Reconciliation Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to execute this plan task by task. Use `superpowers:test-driven-development` for behavior changes, `superpowers:systematic-debugging` for unexpected failures, and `superpowers:verification-before-completion` before reporting success.

**Goal:** Restore reliable engineering truth across the Kitchen POS integration tests, runtime contracts, UI behavior, and handover documentation without reverting working `/api/...` server routes.

**Architecture:** Treat the Express route mounts as the authoritative HTTP contract. Repair stale test URLs and fixtures, isolate database state, settle the self-order payment policy explicitly, and only then perform UI cleanup and an authorized browser smoke test. Keep changes narrow and preserve the current module architecture.

**Tech Stack:** Next.js 16.2.10, React, TypeScript, Express, Prisma, PostgreSQL, Vitest, Supertest, Tailwind CSS.

## Global Constraints and Rules

1. **Git is read-only.** Do not create or switch branches, create worktrees, stage, commit, push, merge, reset, checkout, clean, restore, or discard changes.
2. Do not use the commit steps normally suggested by Superpowers skills. At each checkpoint, record the current status in `NEXT_SESSION_HANDOVER.md`; perform no Git write.
3. Preserve the existing 24 integration-test edits. Never reset, restore, or overwrite them wholesale.
4. The working server route contract is authoritative: business routes remain under `/api/...`; authentication remains under `/auth/...`; health remains `/health`. Do not revert server mounts to satisfy stale tests.
5. Use targeted reproduction before each fix, make the smallest change, and rerun the exact affected test before expanding verification.
6. Before changing Next.js code, read the relevant guide under `node_modules/next/dist/docs/`; this repository uses a version with breaking API and convention changes.
7. Application workflows must not use native `alert()`, `confirm()`, or `prompt()`. Use accessible application-owned modal or alert-dialog components with focus management, keyboard support, pending state, and visible errors.
8. Do not invoke real payment, OCR, camera, email, or other production integrations. Use mocks or documented sandbox behavior only.
9. Do not run Playwright or terminal browser automation. A final UI smoke check may use the Codex in-app browser only when the user explicitly authorizes it.
10. If any development server or background test process is started, stop it before ending the session and verify that its listener/process is gone.
11. Keep generated reports, JSON test results, SQL dumps, screenshots, and backup exports outside the repository. Use unique `UXR-<timestamp>-<module>-<sequence>` fixtures and clean up only those exact fixtures.
12. Update `NEXT_SESSION_HANDOVER.md` after every completed slice and immediately before stopping, including exact commands, results, files changed, blockers, and running-process state.
13. Keep scope narrow: no plugin framework, broad refactor, new design system, or unrelated cleanup during this reconciliation.
14. Do not claim the suite, build, runtime, or browser flow passes unless it was freshly verified at that scope.

## Verified Starting Point

- Branch: `master` (read-only observation).
- HEAD: `7e99bb21d4cf36c98e8356025b2d59e08cc97441`.
- The URL-contract repair modified 24 files under `server/__tests__/`; production routes were not changed.
- Static Supertest-path scan found no remaining non-contract paths.
- Representative verification passed: 6 files, 107 tests.
- Full-suite movement after URL repair: 354 total; 281 passed, 73 failed, 0 pending; 68 of 174 suites failed.
- TypeScript and `git diff --check` passed after the URL repair.
- The most recent production build passed before the URL-test edits; it has not yet been rerun after subsequent reconciliation work.

## Completion Criteria

- All integration tests pass twice consecutively with no pending tests.
- TypeScript, production build, and `git diff --check` pass from the final working tree.
- Test fixtures are deterministic, uniquely named, and cleaned in dependency-safe order.
- The self-order payment/routing contract is explicitly documented and enforced without accepting unpaid online orders.
- No scoped application flow uses a native browser alert or confirmation.
- The canonical handover and historical Phase 0 record no longer contradict the verified implementation.
- If authorized, the in-app-browser smoke workflows pass and all started servers are stopped afterward.

## Task 0: Protect and Reconfirm the Completed URL-Contract Slice

**Files:**

- Preserve: the 24 modified files listed in `NEXT_SESSION_HANDOVER.md`
- Reference: `server/index.ts` and route mount modules
- Evidence: external `post-url-contract-test-results-20260811.json`

- [ ] Run `git status --short` and confirm the expected 24 modified integration-test files are present before any new edit.
- [ ] Run `git diff --check` and require exit code 0.
- [ ] Inspect the test diff with `git diff -- server/__tests__` and confirm production server routes are untouched.
- [ ] Run this static scan over Supertest request calls and require no output:

```powershell
rg --pcre2 -n '\.(get|post|put|patch|delete)\(\s*["'']/(?!api(?:/|["''])|auth(?:/|["''])|health["''])' server/__tests__
```

Exit code 1 with no matches means the negative scan passed; any printed match must be classified and corrected before continuing.
- [ ] Rerun the representative URL-contract gate:

```powershell
npm test -- server/__tests__/route-smoke.test.ts server/__tests__/inventory.security.test.ts server/__tests__/ocr.test.ts server/__tests__/stockTransfers.test.ts server/__tests__/warehouses.test.ts server/__tests__/webhook.security.test.ts
```

Expected: 6 files and 107 tests pass. If counts differ because tests were intentionally added later, require zero failures and explain the count change in the handover.

- [ ] Update `NEXT_SESSION_HANDOVER.md` with the fresh result. Do not stage or commit.

## Task 1: Normalize JWT Test Fixtures to the Current Authentication Contract

**Modify:**

- `server/__tests__/attendance.test.ts`
- `server/__tests__/customers.test.ts`
- `server/__tests__/hr.test.ts`
- `server/__tests__/vouchers.test.ts`

**Read-only references:**

- `server/middleware/auth.ts`
- authentication route/service code that issues production tokens

- [ ] Run each affected file separately and record the current status and response body for every unexpected 401.
- [ ] Confirm from `server/middleware/auth.ts` that `TokenPayload` uses `id`, not `userId`, and that middleware loads the user by `decoded.id`.
- [ ] Replace stale positive fixtures with the production payload shape:

```ts
const token = jwt.sign(
  { id: adminUser.id, username: adminUser.username, role: 'admin' },
  JWT_SECRET,
);
```

- [ ] Replace negative-role tokens with a valid non-admin role and a real fixture user:

```ts
const cashierToken = jwt.sign(
  { id: cashierUser.id, username: cashierUser.username, role: 'cashier' },
  JWT_SECRET,
);
```

- [ ] Do not weaken middleware, skip database lookup, or mint a token for a nonexistent user merely to obtain a 403.
- [ ] Rerun each file separately; require zero unexpected 401 responses and exact expected authorization statuses.
- [ ] Run the four files together to detect shared-state leakage.
- [ ] Update the handover with per-file counts and remaining failures. Do not stage or commit.

## Task 2: Tighten Access-Control Assertions After the URL Repair

**Modify:** `server/__tests__/access-control.test.ts`

**Read-only references:** server route mounts and permission middleware

- [ ] Run the file alone and capture actual status/body pairs.
- [ ] Remove stale comments that describe business routes as unmounted or omit `/api`.
- [ ] Replace tolerant assertions such as accepting both expected status and 404 with one contractually correct status.
- [ ] Keep authentication endpoints under `/auth/...`; do not rewrite them to `/api/auth/...`.
- [ ] Add or retain one explicit assertion that an unauthenticated business request is rejected and one that a role-restricted request returns 403 for a valid authenticated user.
- [ ] Run `npm test -- server/__tests__/access-control.test.ts` and require zero failures.
- [ ] Update the handover. Do not stage or commit.

## Task 3: Make Audit and Backup Fixtures Unique and Cleanup-Safe

**Modify:**

- `server/__tests__/audit.test.ts`
- `server/__tests__/backup.test.ts`

**Read-only references:** Prisma schema relations for users, profiles, audit logs, and backup behavior

- [ ] Reproduce each file independently, then together, and confirm whether fixed usernames cause unique-constraint failures.
- [ ] Generate a per-run suffix and use it in every created username instead of fixed names such as `test-cashier-audit` or `test-cashier-backup`.
- [ ] Store created IDs immediately after creation.
- [ ] Wrap mutation sequences in `try/finally` or use an `afterAll` that tolerates partial setup.
- [ ] Delete dependent profile/test records before deleting the fixture user; never delete broad production-like rows.
- [ ] Verify each file alone, the pair together, and the pair twice consecutively.
- [ ] Update the handover with fixture naming and cleanup evidence. Do not stage or commit.

## Task 4: Repair Supplier and Purchase-Order Fixture Isolation

**Modify:** `server/__tests__/suppliers.test.ts`

**Read-only references:**

- `prisma/schema.prisma`
- supplier and purchase-order route/service code

- [ ] Reproduce the file alone and identify the exact FK constraint and failed cleanup statement.
- [ ] Create a dedicated supplier for purchase-order tests in `beforeAll`; do not depend on a supplier ID created by an earlier CRUD test.
- [ ] Use a separate supplier fixture for create/update/delete assertions.
- [ ] Make supplier names and purchase-order numbers unique per run.
- [ ] Change teardown to delete in dependency order: purchase-order items, purchase orders, then fixture suppliers.
- [ ] Make teardown safe after partial setup by guarding optional IDs.
- [ ] Run the file twice consecutively and require both runs to pass.
- [ ] Update the handover. Do not stage or commit.

## Task 5: Isolate Remaining Table and Rate-Limiter Failures

**Modify only after root cause is demonstrated:**

- `server/__tests__/tables.test.ts`
- `server/__tests__/infrastructure.security.test.ts`
- the smallest test-only helper required for deterministic limiter state

**Read-only references:** table relations and rate-limiter configuration/middleware

- [ ] Extract the exact remaining failures from the latest external JSON result instead of inferring from summary counts.
- [ ] Run `tables.test.ts` alone and inspect relation-dependent delete failures; fix fixture teardown/order without weakening production constraints.
- [ ] Run `infrastructure.security.test.ts` alone, then after a request-heavy suite, to prove or disprove shared limiter-state leakage.
- [ ] If limiter state leaks, construct a fresh test app/limiter instance or expose a test-only reset through an existing test helper. Do not increase production limits or skip the assertion.
- [ ] Run both files alone, together, and after the representative 107-test gate.
- [ ] Update the handover with the demonstrated root cause and exact verification. Do not stage or commit.

## Task 6: Resolve the Self-Order Payment and Routing Product Contract

**Decision gate:** Do not implement this task until the owner confirms whether “Bayar di Kasir” remains a supported customer payment method. The current source is digital-only, while routing/acceptance tests assume a counter method. Never auto-accept an unpaid online order.

**Potentially modify after the decision:**

- `src/features/self-order/paymentMethods.ts`
- `server/__tests__/self-order-payment.test.ts`
- `server/__tests__/self-order-pricing.test.ts`
- `server/__tests__/self-order-accept.test.ts`
- `server/__tests__/self-order-routing.test.ts`
- self-order service/routes only if the accepted business rule requires a production behavior correction

- [ ] Present the two concrete contracts to the owner and record the selected contract in the handover.
- [ ] Recommended safe default until confirmation: retain digital-only methods and keep online orders pending until staff confirms payment.
- [ ] If pay-at-cashier is approved, restore an explicit catalog entry:

```ts
{
  id: 'cashier',
  label: 'Bayar di Kasir',
  description: 'Bayar langsung kepada kasir',
  type: 'counter',
}
```

- [ ] Under the pay-at-cashier contract, include it only in the configured/default choices authorized by the product decision; verify counter orders can follow the approved auto/manual routing behavior while online orders cannot bypass confirmation.
- [ ] Under the digital-only contract, update tests to choose `qris` or another configured online method, confirm payment through the staff endpoint before acceptance, and remove expectations that `auto` routing can accept an unconfirmed online order.
- [ ] If digital-only makes the exposed `selforder_routing = auto` option ineffective, document that behavior and obtain approval before removing or relabeling the option.
- [ ] Run all four self-order suites together twice. Require explicit tests proving online-unpaid orders remain pending and cannot be accepted through the unsafe path.
- [ ] Update the handover with the chosen business contract and evidence. Do not stage or commit.

## Task 7: Converge the Entire Integration Suite

**Modify:** only tests or production code with a reproduced, documented defect

- [ ] Run each repaired cluster before the full suite.
- [ ] Run `npx tsc --noEmit` and require exit code 0.
- [ ] Run the full integration suite and save machine-readable output outside the repository:

```powershell
npm test -- --reporter=json --outputFile="C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\release-readiness-test-results-20260811.json"
```

- [ ] Move any generated SQL backup/export out of the repository immediately after the test, preserving its filename in the handover.
- [ ] Investigate every remaining failure with targeted reproduction. Do not convert assertions to permissive arrays or skip tests.
- [ ] Run the full suite twice consecutively. Require zero failed and zero pending tests both times.
- [ ] Run `git diff --check` and update the handover with both suite summaries. Do not stage or commit.

## Task 8: Replace the Remaining Native Confirmation

**Modify:**

- `app/admin/settings/page.tsx`
- `src/components/ui/ConfirmDialog.tsx` only if its existing API cannot express pending/error state cleanly
- `src/components/ui/Modal.tsx` only if an accessibility defect is reproduced in the shared primitive
- `server/__tests__/modal-accessibility.test.ts` for shared alert-dialog semantics
- Create `server/__tests__/settings-native-dialogs.test.ts` to guard the settings source against native dialogs and exercise the extracted deletion-confirmation state transition with a pure handler/helper if extraction is necessary

**Read first:** relevant Next.js 16 documentation in `node_modules/next/dist/docs/`, `baseline-ui`, and `fixing-accessibility` guidance

- [ ] Add a focused component test that opens the area-delete action and proves no deletion occurs until the application dialog is confirmed.
- [ ] Replace `confirm(...)` around the settings-area deletion near the current line 880 with an application-owned `role="alertdialog"` flow.
- [ ] Give the dialog an accessible title and description, Cancel and destructive Confirm buttons, initial focus on Cancel, Escape-to-cancel, focus trap, and focus restoration to the invoking control.
- [ ] Keep the dialog open during deletion, show a pending state, prevent duplicate submission, and render API errors inside the dialog.
- [ ] Ensure the invoking icon button has an accessible name.
- [ ] Run the focused component test, TypeScript, and the applicable UI test suite.
- [ ] Search scoped source for `alert(`, `confirm(`, and `prompt(`; require no remaining application workflow usage or document every non-workflow match.
- [ ] Update the handover. Do not stage or commit.

## Task 9: Reconcile Canonical Documentation

**Modify after Tasks 1–8 are verified:**

- `HANDOVER.md`
- `NEXT_SESSION_HANDOVER.md`
- external `PHASE0_HANDOVER.md`
- optionally add `docs/archive/HANDOVER-history-2026-08-11.md` to preserve the old journal before replacing it

- [ ] Preserve the current historical `HANDOVER.md` content in the dated archive before shortening the canonical file.
- [ ] Rewrite `HANDOVER.md` as a current-state snapshot, not an accumulated journal.
- [ ] Mark the external Phase 0 document as historical/superseded while retaining its evidence; correct stale statements about `/apps`, sidebar architecture, stock requests, and phase status.
- [ ] Ensure all three documents agree on HEAD, changed files, test/build status, unresolved risks, server state, and the next action.
- [ ] Remove contradictory test counts and phase labels; retain timestamps for historical evidence.
- [ ] Run a link/path existence check for every referenced local artifact.
- [ ] Run `git diff --check` and update `NEXT_SESSION_HANDOVER.md`. Do not stage or commit.

## Task 10: Run the Final Authorized In-App-Browser Smoke Test

**Precondition:** Tasks 1–9 are green and the user explicitly authorizes browser testing.

- [ ] Verify payment/OCR/camera/provider flags remain non-production or disabled.
- [ ] Start API and frontend separately, never with the conflicting combined development command:

```powershell
npm run api:dev
npm exec -- next dev --hostname 0.0.0.0 -p 3000
```

- [ ] Verify API health at `http://localhost:3001/health` and login at `http://localhost:3000/login`.
- [ ] Using only the Codex in-app browser, smoke: login → `/apps`; POS → Kitchen Display; digital self-order → staff payment confirmation → acceptance; stock request → approval; theme save → reload.
- [ ] Confirm `/pos` Back returns deterministically to `/apps` and module pages expose only module-scoped child menus.
- [ ] Record console, hydration, network, accessibility, and responsive errors at 360×800, 768×1024, and 1366×768.
- [ ] Use only labeled review records; ledger every ID and delete or explicitly retain each one.
- [ ] Stop both servers and verify ports 3000 and 3001 no longer have the processes started by this task.
- [ ] Save screenshots and evidence outside the repository and update the handover. Do not stage or commit.

## Task 11: Final Release Gate and Handover

- [ ] Run `npx tsc --noEmit`.
- [ ] Run the full integration suite twice with zero failures and zero pending tests.
- [ ] Run `npm run build` and require a successful production build.
- [ ] Run `git diff --check`.
- [ ] Record `git status --short`, current branch, and HEAD without modifying Git.
- [ ] Confirm no test/dev server started during the work remains running.
- [ ] Update `HANDOVER.md` and `NEXT_SESSION_HANDOVER.md` with exact command output, evidence paths, known limits, and the next authorized action.
- [ ] Report completion without staging, committing, pushing, or creating a branch.

## Plan Self-Review

- The order follows dependencies: preserve the URL repair, fix authentication, eliminate fixture leakage, settle the business contract, converge tests, then touch UI/docs/browser validation.
- Production route mounts are never changed to accommodate stale tests.
- The self-order decision is explicit because either branch changes business behavior and payment safety.
- Every implementation slice has a targeted reproduction, narrow change, verification command, handover checkpoint, and no Git-write boundary.
- Completion claims require fresh evidence at integration-suite, TypeScript, build, and—only if authorized—browser levels.

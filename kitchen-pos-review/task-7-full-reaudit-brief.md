# Task 7: Full re-audit and document refresh (2026-08-12+)

## Why this run exists

The last full audit (`UXR-20260810-0141`) is stale. Since it ran, the working tree has moved through
several commits (route-rbac migration, self-order payment rework, recipe management, `/admin` prefix
removal to a dynamic shell) and currently carries **uncommitted** changes on branch `self_order` for a
single-company model and a `TopNavigation`/`CompanyBrand`/`UserProfileMenu` header refactor. Route count
has grown from **29 to 37** `app/**/page.tsx` pages and the `/admin/*` prefix is gone — most prior routes
moved to top-level paths (e.g. `/admin/products` → `/products`, `/admin/hr` → `/hr`). Re-run the audit
against **current HEAD + uncommitted working tree**, not the 2026-08-10 baseline.

## Non-negotiable operating rules

1. Git remains read-only: no branch/worktree, checkout, restore, reset, clean, merge, stage, commit, or push.
2. Business routes stay under `/api/...`, auth under `/auth/...`, health at `/health` — do not change prefixes.
3. Browser automation is authorized for this task only, via an in-app browser pane (not Playwright, not
   headless CLI scripts). Do not install or invoke `@playwright/test` even though it's in `devDependencies`.
4. Do not invoke real payment, OCR, camera, email, printer, or other production providers.
5. Do not use native `alert`, `confirm`, or `prompt` — that's a thing to *find*, not to use for your own flow.
6. Stop every server or background process started for verification; confirm the listener is gone
   (`netstat -ano | findstr :3000` / `:3001`) before finishing.
7. Keep screenshots, JSON reports, SQL backups, and database dumps **outside** the repository.
8. Preserve all current working-tree changes (the uncommitted diff listed above) — do not revert or stage them.
9. Local login `admin` / `admin` is authorized for this audit. No external submissions or third-party services.

## Environment

- Repo: `D:\Project\MyProject\kitchen-pos-new`
- Start both processes: `npm run dev` (concurrently runs `tsx watch server/index.ts` on `:3001` and
  `next dev --hostname 0.0.0.0 -p 3000`). Requires local PostgreSQL `kitchen_pos` per `.env`.
- If routes 404 or resolve stale, restart the dev server — new App Router routes sometimes need it.

## Current route inventory (37 pages — verify this list against the live app first)

```
/                              /pos                            /inventory
/login                         /pos/meja                       /inventory/automation
/apps                          /pos/requests                   /inventory/mapping
/settings                      /pos/settings                   /inventory/stock-approvals
/settings/company              /kasir                          /inventory/goods-received-notes
/settings/modules               /waiter                        /inventory/invoices
/settings/outlets               /shift                          /inventory/purchase-orders
/products                      /kitchen                        /inventory/quotation-requests
/promotions                    /online-order                   /inventory/quotations
/promotions/vouchers           /order/[tableId]                 /inventory/supplier-payments
/crm                           /order-status/[orderId]          /inventory-suppliers
/reports                       /finance/ocr                     /attendance
/reports/discounts             /hr
```

The old 29-route matrix in `coverage-matrix.md` is keyed to `/admin/*` paths that no longer exist. Do not
edit that file in place — see "Deliverables" below for how to fold this into the new document set.

## What changed since the last audit (context for judging findings)

Run `git log --oneline e6f787e3222ef914ded78e9b50f60bfd6ed8d55f..HEAD` and `git diff --stat` for the exact
list; as of this brief:

- `/admin` prefix removed; navigation is now a dynamic shell-based registry (`src/config/navigation.ts`),
  replacing the old `APPS_REGISTRY`.
- Self-order payment flow rewritten (`getSelfOrderConfig`, QRIS/bank-transfer manual verification, cashier
  `auto`/`review` routing) — re-verify the prior "receipt total Rp 0" and payment-truth findings here.
- Recipe management (standard recipes, sample generation, product assignment) added under
  `/inventory/mapping` — re-verify the prior "100× profitability" finding here.
- Uncommitted: single-company model (`prisma/migrations/20260812190000_add_single_company/`,
  `server/lib/company.ts`, `server/routes/company.ts`, `app/settings/company/`), new header components
  (`TopNavigation.tsx`, `CompanyBrand.tsx`, `UserProfileMenu.tsx`, `LiveClock.tsx`), and a
  `CompanyContext.tsx`. Test these paths even though they're pre-commit.
- `docs/handover/route-rbac-migration/HANDOVER.md` and `verification-log.md` already describe the RBAC
  migration architecture — read both before auditing auth/role/navigation to avoid re-discovering what's
  already documented as intentional.

## Prior P1/architecture findings to explicitly re-check (not a full re-derivation — confirm fixed / still open / changed)

From `prioritized-findings-backlog.md` and `final-consolidated-review.md`:

1. Protected staff UI can render before completed login (auth/state race).
2. Role, permission, navigation, and API enforcement do not share one capability model
   (`role-navigation-authorization-mismatch.md`) — likely affected by the RBAC migration; check whether
   this is now resolved or partially resolved.
3. Fixed desktop shell breaks phone operation across modules (no responsive drawer).
4. Primary write/read paths disagree across API and IndexedDB (offline sync, `src/lib/db.ts`).
5. Completed receipt showing `TOTAL Rp 0`.
6. Profitability off by 100× in recipe/mapping views.
7. Voucher dates and report filters reporting misleading success/state.
8. Camera UI claiming a photo without a ready stream (`/attendance`).
9. Configuration scope/precedence absent (org default → outlet override → user preference) —
   `hardcoded-configuration-ownership-register.md`; check whether `/settings/company` changes this.
10. Native/non-semantic blocking interactions (`alert`/`confirm`) — prior handover claims these were
    replaced with accessible AlertDialogs in settings/recipe-delete; verify.
11. Theme save failing, reload restoring stale values (`theme-consistency-report.md`).
12. `/inventory/stock-approvals` supplier null-vs-omitted contract — prior handover claims this was fixed;
    verify via UI create + approve, not just source reading.

## Scope and method

Reuse the six-task module split and standards from the original briefs (`task-1-access-shell-brief.md`
through `task-6-configuration-brief.md` in this folder) as a template for viewport/state coverage
expectations, but:

- Update route lists per module to the current 37-route inventory (paths above), not the old `/admin/*` ones.
- Add a seventh sub-scope for the uncommitted single-company/header work: `/settings/company`, header
  `CompanyBrand`/`TopNavigation`/`UserProfileMenu`/`LiveClock` across all six viewports.
- Required viewports: `360x800`, `768x1024`, `1024x768`, `1366x768`, `1440x900`, `1920x1080`.
- Apply the screenshot-first Product Design audit workflow, UI/UX Pro Max review criteria, Baseline UI
  rules, and fixing-accessibility rules. Check console errors, overflow, contained scrolling, reachable
  controls, 44×44 touch targets, keyboard/focus, labels/ARIA, contrast risk, and clear
  loading/error/permission states. Do not claim full WCAG compliance.
- For each of the 12 prior findings above, capture direct before/after evidence (screenshot + brief note)
  rather than re-writing the finding from scratch if it's unchanged.

## Deliverables (this is the part that answers "update kitchen-pos-review and the other document")

1. **New file** `kitchen-pos-review/reaudit-2026-08-12.md` — the primary output. Structure:
   - Run ID, date, HEAD commit + uncommitted-diff note (carry forward the exact `git status --porcelain`
     snapshot at start and end of the run, to prove read-only compliance).
   - Route inventory reconciliation (29 old → 37 new, mapped old path → new path where renamed).
   - Status of each of the 12 prior findings: `FIXED` / `STILL OPEN` / `CHANGED` / `NOT RE-VERIFIED` with
     evidence link.
   - New findings from the routes/features that didn't exist in the prior audit (self-order payment
     rewrite, recipe management, single-company settings, new header components, new inventory sub-routes:
     GRN, invoices, purchase orders, quotations, quotation-requests, supplier-payments).
   - Updated coverage matrix for the current 37 routes (replace, don't patch, the old 29-row table format).
   - Updated severity-ranked findings backlog delta (what to add/remove from
     `prioritized-findings-backlog.md`).
2. **Update in place**: `kitchen-pos-review/final-consolidated-review.md` — add a dated addendum section
   near the top ("Update — 2026-08-12 re-audit") that supersedes stale claims and links to
   `reaudit-2026-08-12.md`. Do not silently rewrite the original 2026-08-10 findings; mark superseded ones
   explicitly so the audit trail stays intact.
3. **Update in place**: `D:\Project\MyProject\kitchen-pos-new\HANDOVER.md` (repo root) — this is "the other
   document." Update:
   - `Current as of` timestamp and `Branch / HEAD` (note uncommitted changes separately, they're not a HEAD
     move).
   - "Current Product and Architecture State" section: route count (37, not 38 — recount and correct),
     `/admin` prefix removal, single-company model, new header components.
   - "Current Verification Truth" table: add a row for this re-audit's browser-smoke result.
   - "Remaining Risks and Next Gates": fold in the findings-status delta from item 1.
   - Add an "External Evidence" line pointing at wherever this run's screenshots land (pick a path under
     `C:\Users\sukma\.codex\visualizations\...` following the existing naming convention, e.g.
     `kitchen-pos-review-20260812-<time>`, and use it consistently for screenshots + JSON reports).

## Report contract

Return status `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`. The final message must list:
exact files created/modified (repo-relative paths for the two in-repo docs, absolute path for the new
`reaudit-2026-08-12.md`, absolute path for the external screenshot/evidence root), confirmation that
`git status --porcelain` shows no changes beyond the three documents plus the pre-existing untracked/
modified files listed at the top of this brief, confirmation dev-server ports are closed, and a one-line
verdict per the 12 re-checked findings.

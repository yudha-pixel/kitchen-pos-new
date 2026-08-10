# Consolidated evidence index

Run: `UXR-20260810-0141`  
Audit date: 2026-08-10 (Asia/Jakarta)  
Capture surface: Codex in-app Browser at `http://localhost:3000`

## Screenshot accounting

Filesystem recount and the six approved review gates agree on **338 PNG screenshots**.

| Task | Scope | Baseline accounting | Deep/retest accounting | PNG count | Evidence folder | Approved report and gate |
|---|---|---:|---:|---:|---|---|
| 1 | Access and shell | Canonical `/`, `/login`, `/admin` plus six-view `/customers` legacy probe and repeated login/shell states | Exact-locator login/disclosure retests `14-27` | **70** | [screenshots/task-1](./screenshots/task-1/) | [report](./module-reports/task-1-access-shell.md), [gate](./reviews/task-1-review.md) |
| 2 | Sales operations | 9 routes × 6 = **54** (`m01-m54`) | **11** (`000-005`, `d01-d05`) | **65** | [screenshots/task-2](./screenshots/task-2/) | [report](./module-reports/task-2-sales.md), [gate](./reviews/task-2-review.md) |
| 3 | Inventory and procurement | 6 routes × 6 = **36** | **15** (`07-12`, `19-21`, `28`, `35`, `43-44`, `51-52`) | **51** | [screenshots/task-3](./screenshots/task-3/) | [report](./module-reports/task-3-inventory.md), [gate](./reviews/task-3-review.md) |
| 4 | CRM and marketing | 4 routes × 6 = **24** | **21**, including create/error/auth/persisted voucher states through `45` | **45** | [screenshots/task-4](./screenshots/task-4/) | [report](./module-reports/task-4-crm-marketing.md), [gate](./reviews/task-4-review.md) |
| 5 | Workforce, finance, reports | 4 routes × 6 = **24** | **28**; numbering skips `38` because the file-chooser wait produced no screenshot | **52** | [screenshots/task-5](./screenshots/task-5/) | [report](./module-reports/task-5-workforce-finance-reports.md), [gate](./reviews/task-5-review.md) |
| 6 | Organization and configuration | 3 routes × 6 = **18** | **37**, including all eight settings sections at 360/768/1366 and theme/outlet/back states | **55** | [screenshots/task-6](./screenshots/task-6/) | [report](./module-reports/task-6-configuration.md), [gate](./reviews/task-6-review.md) |
|  | **Total** |  |  | **338** | [all screenshots](./screenshots/) | [coverage matrix](./coverage-matrix.md) |

The reports state that accepted images were opened and visually inspected. A stable screenshot proves the visible state at capture time; it does not prove the underlying API, permission, persistence, keyboard, or assistive-technology path.

## Key visual references

| Area | Evidence | What it supports |
|---|---|---|
| Public entry | [Task 1 `01-root-1440x900`](./screenshots/task-1/01-root-1440x900.png) | Root route is the stock Next.js starter, not a Kitchen POS entry point. |
| Direct shell exposure | [Task 1 `03-admin-1366x768`](./screenshots/task-1/03-admin-1366x768.png) | Management shell/UI renders from a direct unauthenticated route. It does not prove protected API data access. |
| Mobile shell failure | [Task 1 `07-admin-expanded-360x800`](./screenshots/task-1/07-admin-expanded-360x800.png) | Fixed expanded shell crushes the phone content column. |
| Invalid-login recovery | [Task 1 `21-retest-invalid-login-stable-retry-1366x768`](./screenshots/task-1/21-retest-invalid-login-stable-retry-1366x768.png) | Error persists but the enabled retry button becomes visually blank. |
| Online order continuity | [Task 2 `005-order-status-created-order-not-found-1366x768`](./screenshots/task-2/005-order-status-created-order-not-found-1366x768.png) | Newly created order immediately reports “not found.” |
| Self-order table identity | [Task 2 `m35-order-table-valid-1366x768`](./screenshots/task-2/m35-order-table-valid-1366x768.png) | Valid seeded table route renders a blank table identity. |
| Receipt integrity | [Task 2 `d02-pos-cart-ready-1366x768`](./screenshots/task-2/d02-pos-cart-ready-1366x768.png), [Task 2 `d05-pos-payment-dialog-1366x768`](./screenshots/task-2/d05-pos-payment-dialog-1366x768.png) | Non-zero cart precedes a completed receipt showing `TOTAL Rp 0`. |
| Profitability calculation | [Task 3 `19-mapping-affogato-selected-1366x768`](./screenshots/task-3/19-mapping-affogato-selected-1366x768.png) | 10% tax on Rp38,000 is displayed as Rp380,000 and gross profit as Rp418,000. |
| Restock failure | [Task 3 `12-inventory-restock-submitted-1366x768`](./screenshots/task-3/12-inventory-restock-submitted-1366x768.png) | Valid stock-request submission fails and remains in the modal. |
| Promotion persistence | [Task 4 `42-promotion-create-failed-1366x768`](./screenshots/task-4/42-promotion-create-failed-1366x768.png) | Filled valid promotion remains in the modal after `DexieError`; no record persisted. |
| Voucher lifecycle | [Task 4 `43-voucher-active-limited-created-1366x768`](./screenshots/task-4/43-voucher-active-limited-created-1366x768.png), [Task 4 `44-voucher-inactive-limited-1366x768`](./screenshots/task-4/44-voucher-inactive-limited-1366x768.png), [Task 4 `45-voucher-expiry-update-not-persisted-1366x768`](./screenshots/task-4/45-voucher-expiry-update-not-persisted-1366x768.png) | Creation and inactive toggle persisted; edited expiry dates did not, despite success feedback. |
| Workforce identity split | [Task 5 `28-hr-shift-save-result-1366x768`](./screenshots/task-5/28-hr-shift-save-result-1366x768.png) | Saved shift resolves its selected employee as `Unknown`. |
| Camera false proof | [Task 5 `32-attendance-camera-request-state-1366x768`](./screenshots/task-5/32-attendance-camera-request-state-1366x768.png) | UI exposes a captured-photo/confirm state without a ready or authorized camera stream. |
| Expense persistence | [Task 5 `37-expense-save-result-1366x768`](./screenshots/task-5/37-expense-save-result-1366x768.png) | Valid manual expense save fails; dialog instrumentation observed a native alert. |
| Report range truth | [Task 5 `40-reports-invalid-custom-range-1366x768`](./screenshots/task-5/40-reports-invalid-custom-range-1366x768.png), [Task 5 `41-reports-export-invalid-range-result-1366x768`](./screenshots/task-5/41-reports-export-invalid-range-result-1366x768.png) | Inverted range is accepted and export provides no observed result. |
| Outlet save failure | [Task 6 `22-outlet-create-save-result-1366x768`](./screenshots/task-6/22-outlet-create-save-result-1366x768.png) | Create form closes with no new row or actionable app error. |
| Theme preview/restoration | [Task 6 `25-pos-settings-alternate-preview-dark-fullpage-1366x768`](./screenshots/task-6/25-pos-settings-alternate-preview-dark-fullpage-1366x768.png), [Task 6 `27-pos-settings-reload-restored-original-1366x768`](./screenshots/task-6/27-pos-settings-reload-restored-original-1366x768.png) | Alternate state previews locally; failed save and reload restore originals. |
| POS Back behavior | [Task 6 `30-pos-back-destination-1366x768`](./screenshots/task-6/30-pos-back-destination-1366x768.png) | POS Back returns to browser-history destination `/pos/settings`, not `/apps`. |
| Mobile settings | [Task 6 `03-admin-settings-360x800`](./screenshots/task-6/03-admin-settings-360x800.png) | Expanded settings shell is unusable at phone width. |

## Console, runtime, and server-log provenance

The raw logs are audit-run artifacts, not a HAR, production telemetry stream, or complete request/response record.

| Artifact | Provenance and useful evidence | Boundary |
|---|---|---|
| [api.stdout.log](./api.stdout.log) | API dev process startup; records `Kitchen POS API running at http://0.0.0.0:3001`. | Startup evidence only; it does not prove each endpoint or response body. |
| [api.stderr.log](./api.stderr.log) | Empty at consolidation time. | Absence of stderr is not an API health certification. |
| [web.stdout.log](./web.stdout.log) | Next.js 16.2.10 dev stdout and route access lines. It records frontend `http://localhost:3000`, `/admin` returning 200, `/customers` returning 404 (`12`, later `190-191`), and the dynamic table/status routes returning page responses (`84`, `92-138`). | Page-response lines do not establish downstream API success or correct page state. |
| [web.stderr.log](./web.stderr.log) | Mixed Next.js stderr and browser-console forwarding marked `[browser]`. Key ranges: repeated missing purchase/ingredient/member observations `1-175`; stock-request failure `724-739`; 401 voucher/member and promotion `DataError` `744-798`; expense `DataError` `870`; employee/payroll 401/429 fallbacks `881-1150`; outlet/theme failures `1151-1179`; repeated POS Offline/Online hydration mismatches `1180-1215`, `1231-1264`, `1282-1315`. | Not a network waterfall; no request bodies, complete headers, or response bodies. Some Task 1 console observations predate its correction rounds and are explicitly labelled uncorroborated in that report. |

Per-task provenance notes:

- Task 1's initial ingredient/member/purchase messages are preserved as original-session browser-console observations. The login retests expose DOM/state and route outcomes, not HTTP protocol details.
- Task 2 observed no blocking page exception in accepted captures. The report notes extensive ProductCard debug noise, but no production-build or HAR verification was performed.
- Task 3's stock-request console failure is current-run evidence; `api.stdout.log` corroborates port 3001. Supplier submission has no accepted post-submit screenshot or supplier-specific log.
- Task 4's 401/member/voucher and promotion `DexieError` observations are current-run browser-console evidence. Read-only database checks supply the final CRM/voucher truth recorded in the fixture ledger.
- Task 5's expense `DexieError` is in the shared stderr log. Native alert detection and the file-chooser timeout were observed by browser instrumentation; no OCR or camera media was submitted.
- Task 6's two outlet failures, theme failure, and three cited POS hydration ranges are directly retained in `web.stderr.log`.

## Other evidence artifacts

- [baseline-kitchen_pos.dump](./baseline-kitchen_pos.dump) — baseline database dump captured before review fixtures; not a post-audit rollback image.
- [progress.md](./progress.md) — run ledger, owner decisions, fixture summary, and pre-existing Git state.
- [coverage-matrix.md](./coverage-matrix.md) — 29 canonical routes × six viewport cells plus legacy `/customers` probe.
- [wireframes/README.md](./wireframes/README.md) — status and rationale for the four recommendation wireframes.
- The six [review gates](./reviews/) approve report/evidence integrity. They do not approve the product for release.

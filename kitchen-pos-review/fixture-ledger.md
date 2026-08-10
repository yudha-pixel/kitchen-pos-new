# Consolidated fixture and mutation ledger

Run: `UXR-20260810-0141`

This ledger consolidates every business-record and configuration write attempt reported by the six approved module audits. “Final state” is the last state established by UI evidence and, where stated, authorized read-only database reconciliation. No cleanup or new mutation was performed during consolidation.

## Business records

| Task / fixture | Attempted or completed action | Exact values and identifier | Outcome | Final state | Cleanup / retention |
|---|---|---|---|---|---|
| Task 2 — `UXR-20260810-0141-sales-001` | Create online pickup order through local API | Order UUID `9d9a12ac-5118-4aaa-bd23-a228922faaeb`; entered phone `081234567890`; Affogato ×1, Iced, Less Sugar, Extra Espresso Shot; Transfer; Rp46,000 | **Created** as pending and appeared in KDS. The entered customer label/contact was not included in the order payload; the status page immediately reported the order not found. | **Retained, pending** according to the audit evidence; exact later fulfillment state was not mutated or reconciled. | Not deleted; retained for owner/reviewer evidence. No external provider call occurred. |
| Task 2 — `UXR-20260810-0141-sales-002` | Complete POS cash order | Order UUID `62a818f5-42ca-4cad-b720-601d25993ec7`; receipt `ORD-62A8`; table/note carry the fixture label; Affogato ×1, Hot, Normal Sugar; cash Rp50,000; expected rounded total Rp42,000 | **Created and completed**. Rendered receipt incorrectly showed `TOTAL Rp 0`. Persisted amount was not independently reconciled. | **Retained, completed**; no void/refund/delete/reprint mutation. | Retained because deleting or voiding would be another destructive business mutation and the record supports receipt review. |
| Task 3 — `UXR-20260810-0141-inventory-001` | Create inventory ingredient | 2 kg current; 5 kg minimum; unit price Rp12,500 | **Created**; visible in the inventory list and KPIs. UI, URL, and row markup exposed no record ID. | **Retained**; exact ID unavailable by the approved evidence path. | Retained as the sole inventory fixture; no write-off/edit/delete. |
| Task 3 — `UXR-20260810-0141-inventory-002` | Submit restock request for `inventory-001` | Quantity 3; note is the fixture label | **Failed** with `Failed to create stock request`; native alert; no request record created. | **No record**; no ID. | No cleanup required. |
| Task 3 — `UXR-20260810-0141-inventory-003` | Create supplier | Phone `0000000000`; optional fields blank | **No record visible after fresh route load**. Only the pre-submit screenshot exists; no supplier-specific post-submit screenshot/log, so the save mechanism and exact cause are unverified. | **Not retained / no record found**; no ID. | No cleanup required. Supplier edit/delete and PO submission remained unavailable. |
| Task 4 — `UXR-20260810-0141-crm-001` | Create CRM member; later probe deletion confirmation | Phone `081000000401`; email `uxr-20260810-0141-crm-001@example.test`; Bronze; active; 0 points; Rp0 spend | **Created**, then later confirmed absent by an authorized read-only `customer` query. The UI never exposed the UUID; current customer/audit data cannot recover it. The native delete confirmation opened, but the Browser timeout means acceptance of that destructive action was not observed. | **Confirmed absent**. Exact historical UUID and precise deletion mechanism are unavailable. | No seeded record was targeted. Nothing remains to clean up, but do not describe the delete interaction itself as observed. |
| Task 4 — `UXR-20260810-0141-crm-002 Active Qty` | Create active quantity promotion | Description `UXR audit active quantity promotion`; minimum 2 items; nominal discount Rp5,000; active; validity 2026-08-09 through 2026-09-08 | **Failed** with IndexedDB `DataError`/reported `DexieError`; modal remained; no record/card or ID. | **No record**. | No cleanup required. |
| Task 4 — `UXR-20260810-0141-crm-003 Active Limited` → `… Expired Limited` | Create voucher; toggle inactive; rename; attempt expiry-date edit | UUID `33107313-5eb4-455e-ac36-47e3de0b8363`; code `UXR0810A003`; nominal Rp10,000; minimum purchase Rp50,000; maximum discount Rp0; quota 2; used 0. Original dates 2026-08-09 to 2026-09-08; attempted dates 2026-08-01 to 2026-08-08 | **Created** active; active→inactive and rename persisted. UI reported update success, but the attempted expiry dates did **not** persist. | **Retained, inactive, not expired by stored dates**. Read-only DB truth: `valid_from=2026-08-09T00:00:00.000Z`, `valid_until=2026-09-08T00:00:00.000Z`, quota 2/used 0. | Retained for review. No redemption/exhaustion or seeded mutation. |
| Task 5 — `UXR-20260810-0141-workforce-001` | Create employee | UUID `ab31635e-f7d5-4588-b644-044c55b1bba8`; UX Auditor; `uxr-workforce-001@example.invalid`; `080000000001`; permanent; base salary Rp3,500,000; join date 2026-08-09; active | **Created** and initially visible. Later UI loaded zero employees during auth/load failures; no audit-side delete occurred. UUID confirmed by read-only PostgreSQL reconciliation. | **Retained, active** in server data at reconciliation time. | Retained for owner review. Later empty UI must not be interpreted as deletion. |
| Task 5 — `UXR-20260810-0141-workforce-002` | Create shift assigned to `workforce-001` | 09:00–17:00; note `UX research shift`; client generated UUID via `crypto.randomUUID()` | **Created** in client IndexedDB and remained visible at 768, but assignee rendered `Unknown`. The UI did not expose the UUID and hidden storage was not inspected. | **Retained in client IndexedDB**; exact UUID unavailable. | Retained because the unresolved assignee is evidence. No shift delete. |
| Task 5 — `UXR-20260810-0141-workforce-003` | Create manual operational expense | Rp125,000; transfer; 2026-08-09; description `UX review stationery` | **Failed** with IndexedDB `DataError`/reported `DexieError`; native alert; no expense created. | **No record**; no ID. | No cleanup required. |
| Task 6 — `UXR-20260810-0141-config-001` | Outlet create attempt 1 | Code/name `UXR-20260810-0141-config-001`; address `… address`; phone `081234567890`; delivery fee 17,000; active | **Failed**; modal closed, no row/error recovery, no ID. First error is retained in `web.stderr.log:1151-1160`. | **No record**. | No cleanup required. |
| Task 6 — `UXR-CFG-001` | Outlet create attempt 2 | Short code `UXR-CFG-001`; exact-prefixed name/address; same phone/fee/active | **Failed**; no row and no ID. Second independent error is retained in `web.stderr.log:1161-1170`. | **No record**. | No cleanup required; because nothing persisted, no stored record violated the audit-prefix rule. |

## Configuration and seeded-record probes

| Item | Original state | Attempt | Persistence result | Final state / cleanup |
|---|---|---|---|---|
| Seeded outlet `OUT-003` edit | Existing Outlet Cabang BSD values | Opened edit form only | Not submitted | Cancelled; seeded values unchanged. |
| Seeded outlet `OUT-003` delete | Existing seeded row | Opened in-app confirmation only | Not confirmed | Cancelled; seeded row unchanged. |
| Primary accent | Blue | Violet preview | Theme Save failed | Reload confirmed **Blue**. |
| Theme mode | Light | Dark preview | Theme Save failed | Reload confirmed **Light**. |
| Card style | Rounded | Sharp preview | Theme Save failed | Reload confirmed **Rounded**. |
| Density | Spacious | Compact preview | Theme Save failed | Reload confirmed **Spacious**. |
| Menu/card layout | Grid | List preview | Theme Save failed | Reload confirmed **Grid**. |
| Cart position | Right Sidebar | Floating Drawer preview | Theme Save failed | Reload confirmed **Right Sidebar**. |
| Outlet selector | Semua Outlet | Outlet Pusat; survived reload as local user/device context | Local selector preference persisted | Explicitly restored and final DOM confirmed **Semua Outlet**. This did not change settings ownership. |
| Admin settings values | Values visible in Store, Receipt, Shift, Tables, Users, Kitchen, Inventory, Security | Inspected each section | No Save, Reset, Backup, or Restore invoked | Unchanged. |
| Sidebar state | Expanded | Collapsed for 360px section captures | UI-only | Final settings DOM expanded at reset viewport. |

## Explicitly non-mutated flows

- No seeded business record was edited, deleted, approved, rejected, written off, voided, refunded, or assigned to a purchase order.
- POS void and split surfaces were inspected; void was not confirmed. No held-order, KDS status, table-status, shift open/expense/close, refund, QR download, or receipt-reprint mutation was performed.
- No external payment, OCR, camera-media, printer, email, or other provider call was invoked.
- No permission role or lower-privilege fixture was fabricated.
- The baseline dump [baseline-kitchen_pos.dump](./baseline-kitchen_pos.dump) predates audit fixtures. It was not restored after the audit, so retained records above remain intentionally available for review.

## Evidence sources

- Per-record screenshots and source/runtime boundaries: [Task 2](./module-reports/task-2-sales.md), [Task 3](./module-reports/task-3-inventory.md), [Task 4](./module-reports/task-4-crm-marketing.md), [Task 5](./module-reports/task-5-workforce-finance-reports.md), [Task 6](./module-reports/task-6-configuration.md).
- Consolidated run ledger: [progress.md](./progress.md).
- Screenshot and console provenance: [evidence-index.md](./evidence-index.md).

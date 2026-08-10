# Task 3 — Inventory and Procurement UX Audit

Audit run: 2026-08-10 (Asia/Jakarta)  
Surface: Kitchen POS at `http://localhost:3000`  
Routes: `/inventory`, `/inventory/mapping`, `/inventory/automation`, `/inventory/suppliers`, `/inventory/stock-approvals`, `/admin/products`  
Method: Codex in-app Browser only; screenshot-first combined UX/accessibility audit; source and Git read-only  
Evidence folder: `screenshots/task-3/`

## Overall verdict

Desktop information hierarchy is generally clear, the tables use real header semantics, status treatments usually pair color with text/icon, and the product edit dialog is substantially more accessible than the other overlays. However, this module is not ready for operational use without fixes to one high-severity profitability calculation, mobile/tablet reflow, cross-surface inventory consistency, and stock-request submission. The current 360 px experience exposes only a narrow strip of content because a 256 px sidebar remains permanently open. The recipe profitability card also reports a 10% tax on Rp 38.000 as Rp 380.000 and gross profit as Rp 418.000.

## Audit scope and user goal

The target user is a restaurant inventory/procurement operator who needs to:

1. Understand stock health and restock cost.
2. Add and maintain ingredients.
3. Map ingredients to menu recipes and understand product profitability.
4. Configure reorder thresholds and create purchase orders.
5. Maintain suppliers.
6. review and action stock requests.
7. Search and edit products.

Accessibility target: keyboard-operable, labeled forms and dialogs, visible focus, responsive reflow without loss of information/action, and state communication that does not depend on color alone. This is not a WCAG conformance claim.

## Required viewport matrix

| Route | 360×800 | 768×1024 | 1024×768 | 1366×768 | 1440×900 | 1920×1080 |
|---|---|---|---|---|---|---|
| `/inventory` | `01` | `02` | `03` | `04` | `05` | `06` |
| `/inventory/mapping` | `13` | `14` | `15` | `16` | `17` | `18` |
| `/inventory/automation` | `22` | `23` | `24` | `25` | `26` | `27` |
| `/inventory/suppliers` | `29` | `30` | `31` | `32` | `33` | `34` |
| `/inventory/stock-approvals` | `37` | `38` | `39` | `40` | `41` | `42` |
| `/admin/products` | `45` | `46` | `47` | `48` | `49` | `50` |

The accepted evidence set contains **51 screenshots total: 36 route/viewport matrix captures + 15 deep-state captures**. The deep-state files are `07–12`, `19–21`, `28`, `35`, `43–44`, and `51–52`. All listed images were captured from the browser, saved locally, and visually inspected. Initial loading captures for mapping at 360/768 were rejected and overwritten with stable captures. Supplier evidence consists only of the pre-submit dialog capture `35-supplier-add-dialog-1366x768.png`; there is no accepted supplier post-submit screenshot or supplier-specific console/network log.

## Numbered evidence and step health

1. `01–06` — Inventory dashboard baseline and responsive behavior. **Desktop healthy; mobile blocked; tablet constrained.**
2. `07` — Add-ingredient dialog. **Visually clear but accessibility-deficient.**
3. `08` — Required-name validation. **Works, but uses English browser-native text in an Indonesian workflow.**
4. `09` — Created labeled inventory fixture and KPI/list refresh. **Successful; ID is not exposed by UI.**
5. `10–12` — Restock request dialog, validation, and submission result. **Blocked by backend failure and native alert.**
6. `13–18` — Recipe/BOM list and empty selection state. **Desktop usable; mobile/tablet reflow fails.**
7. `19` — Affogato recipe and profitability view. **High-severity calculation error.**
8. `20–21` — Selected recipe at 768/360. **Core values and controls clipped/unusable.**
9. `22–27` — Automation threshold table. **Desktop usable; mobile/tablet columns/actions lost.**
10. `28` — Review Draft Purchase Order. **Readable at desktop; supplier selection has no available supplier.**
11. `29–34` — Supplier empty state. **Desktop clear; mobile clipped.**
12. `35` — Supplier create dialog. **Clear visually; same modal semantics/focus defects as inventory.**
13. `37–42` — Stock-approval pending state. **Desktop clear; mobile blocked.**
14. `43–44` — Approved and Rejected tabs. **Keyboard focus visible; lifecycle could not be exercised because all tabs were empty.**
15. `45–50` — Product list, search/filter, and responsive behavior. **Desktop usable; mobile/tablet hide key columns and Edit.**
16. `51` — Affogato search result. **Search is immediate and clear.**
17. `52` — Affogato edit modal. **Good dialog semantics/focus; modifier controls still include unnamed buttons.**

## Strengths

- Desktop pages have consistent headings, descriptive subtitles, and predictable placement of primary actions.
- Inventory, automation, and product tables expose real table/row/column-header semantics in the browser accessibility tree.
- Stock warnings use text and icons in addition to color.
- Search and filters use native textboxes/comboboxes with accessible names.
- Empty approval states clearly distinguish Pending, Approved, and Rejected outcomes.
- Approval tabs show a strong visible keyboard focus outline (`43`, `44`).
- The product editor uses an actual named dialog, moves initial focus to `Tutup`, labels its primary fields, and provides descriptive delete-button names for modifier options (`52`).
- The PO review summarizes total items, estimated cost, draft state, requester, and line-level calculation before submission (`28`).

## Findings

### P0 — No confirmed findings

No demonstrated data loss, security-boundary failure, persisted financial corruption, or system-wide outage was observed in this browser-only audit.

### INV-P1-05 — Profitability tax and gross-profit calculations are off by a factor of 100

- **Severity:** P1
- **Status:** Confirmed
- **Route/state:** `/inventory/mapping`, Affogato selected
- **Viewports:** Confirmed at 1366×768; the same values remain present but clipped at 768×1024
- **Evidence:** `19-mapping-affogato-selected-1366x768.png`, `20-mapping-selected-768x1024.png`
- **Observed:** Harga Jual is Rp 38.000, HPP is Rp 0, and the UI labels Pajak as 10%, but displays Pajak Rp 380.000 and Laba Kotor Rp 418.000. Laba Bersih separately displays Rp 38.000 and Margin Bersih 100.0%.
- **Source-backed cause:** `app/inventory/mapping/page.tsx` passes whole-number configuration values such as `10` into `calculateProductProfitability`. `src/features/inventory/recipeApiService.ts` calculates `productPrice * taxRate`, so that helper expects a decimal rate such as `0.10`; passing `10` directly produces Rp 380.000 tax on Rp 38.000 and, in turn, Rp 418.000 gross profit. This is distinct from the percentage convention used by `inventoryService`; the two conventions must not be conflated.
- **Expected:** A 10% tax on Rp 38.000 is Rp 3.800. All derived profit values should use a single, documented sign convention and reconcile arithmetically.
- **User/business impact:** Procurement and pricing decisions can be made from materially false margin data; the card contradicts itself.
- **Reproduction:** Open Mapping Resep → select Affogato → read Analisis Profitabilitas.
- **Recommendation:** Normalize the mapping-page configuration to decimal rates before calling the decimal-expecting helper, or change the helper contract and all callers consistently; add unit-tested examples for 0%, 10%, fractional prices, and nonzero HPP; display a calculation breakdown.
- **Confidence:** High.

### INV-P1-01 — Persistent desktop sidebar makes every scoped route unusable at 360 px

- **Severity:** P1
- **Status:** Confirmed across all routes
- **Routes:** All six scoped routes
- **Viewports:** 360×800; related clipping persists at 768×1024
- **Evidence:** `01`, `13`, `21`, `22`, `29`, `37`, `45` and tablet examples `02`, `14`, `20`, `23`, `30`, `38`, `46`
- **Observed:** The sidebar remains about 256 px wide and occupies most of a 360 px viewport. Main content is reduced to a narrow strip, headings wrap by syllable, dialogs/data panels sit off-screen, and a page-level horizontal scrollbar is required. At 768 px, the remaining content column is still too narrow for primary workflows.
- **Expected:** At mobile widths, the sidebar should collapse into an overlay/drawer and the main region should use the full viewport. Content must reflow without two-dimensional page scrolling.
- **User impact:** Mobile users cannot read KPIs, inspect recipes, review requests, or reach actions reliably.
- **Reproduction:** Open any scoped route at 360×800 with default sidebar state.
- **Recommendation:** Switch to an off-canvas drawer below the desktop breakpoint; reserve no layout width while closed; prevent body-level horizontal overflow; validate keyboard focus/escape/return-focus for the drawer.
- **Confidence:** High.

### INV-P1-02 — Restock request submission fails and leaves the user in the modal

- **Severity:** P1
- **Status:** Confirmed
- **Route/state:** `/inventory`, `+ Restock` for the labeled ingredient
- **Viewports:** 1366×768
- **Evidence:** `10`, `11`, `12`; console error captured in current run
- **Observed:** A valid quantity of 3 and note `UXR-20260810-0141-inventory-002` trigger a JavaScript alert. Console reports `Failed to create stock request: Error: Failed to create stock request`. The form remains open with entered values and no inline recovery path.
- **Source-backed failure chain:** The inventory dashboard imports `createStockRequest` from `recipeApiService`. That helper falls back to `http://localhost:3000/stock-requests`; the captured API log states that the Express API ran on port `3001`, and `server/app.ts` mounts no `/stock-requests` route. The request therefore targets the frontend origin/port and a route that is not mounted by the API.
- **Expected:** The request should be created once, the user should see accessible success feedback, and the new request should appear under Pending. On failure, the dialog should show an inline cause/retry path without blocking native alerts.
- **User impact:** The central inventory-to-approval workflow cannot complete.
- **Reproduction:** Inventory → Restock → enter 3 and a note → Kirim Pengajuan.
- **Recommendation:** Point the helper at the configured API origin on port `3001` and mount/implement the required `/stock-requests` route (or use the intended existing route); replace `alert()` with an inline `role=alert` message; preserve idempotency and prevent duplicate retries.
- **Confidence:** High.

### INV-P1-03 — Inventory surfaces disagree on what inventory exists

- **Severity:** P1
- **Status:** Confirmed visual/data inconsistency
- **Routes:** `/inventory`, `/inventory/automation`, `/inventory/mapping`
- **Viewports:** Desktop
- **Evidence:** `06` (inventory empty before fixture), `09` (only one labeled item), `25–27` (dozens of seeded ingredients), `16–19` (many menu products)
- **Observed:** The inventory dashboard initially reports 0 ingredients and an empty list. After one fixture is added, it reports exactly 1. The automation route simultaneously lists dozens of ingredients with current stock/minimum values, including duplicates, while all screens show `Semua Outlet`.
- **Source-backed cause:** `/inventory` and `/inventory/mapping` use `recipeApiService` and its API ingredient population. `/inventory/automation`, `/inventory/suppliers`, and `/inventory/stock-approvals` use `inventoryService`, which is backed by browser IndexedDB. The UI therefore presents two different stores under the same outlet label. Why each store contains its particular seeded population remains unverified.
- **Expected:** A clearly documented scope/data source or a reconciled ingredient population across inventory, automation, mapping, and outlet selection.
- **User impact:** Operators cannot trust KPI counts, restock totals, or whether automation covers the same stock they manage.
- **Reproduction:** Compare Total Bahan Baku and Daftar Bahan Baku with Aturan Minimum Stok under the same outlet selector.
- **Recommendation:** Define one ingredient identity/source of truth; show outlet/scope on each row and KPI; add reconciliation checks and explicit “global vs outlet” labels.
- **Confidence:** High; the split API-versus-IndexedDB service usage is confirmed, while the origin of each store's specific seeded records is not.

### INV-P1-04 — Critical dialogs lack dialog semantics and correct focus management

- **Severity:** P1
- **Status:** Confirmed
- **Routes/states:** Inventory add, inventory restock, supplier add
- **Evidence:** `07`, `10`, `35`; DOM/focus observations in current run
- **Observed:** These overlays expose headings and form controls but no named `dialog`. When inventory add opens, focus remains on the background `Tambah Bahan` trigger. Close buttons are unnamed. Several numeric controls expose no accessible name. Background navigation remains present in the accessibility snapshot.
- **Expected:** Named modal dialog semantics, inert background, initial focus inside, trapped Tab sequence, Escape close, trigger-focus restoration, and explicit labels for every control.
- **User impact:** Keyboard and screen-reader users can leave the modal context or cannot understand controls.
- **Reproduction:** Open each dialog and inspect active element/accessibility tree.
- **Recommendation:** Use the project’s accessible Dialog primitive consistently (the product edit modal is a good internal reference); connect visible labels with `for`/`id`; name icon-only close buttons.
- **WCAG relevance:** 1.3.1, 2.1.1, 2.4.3, 4.1.2.
- **Confidence:** High.

### INV-P2-01 — Tablet tables clip status and action columns without an obvious recovery affordance

- **Severity:** P2
- **Status:** Confirmed
- **Routes:** `/inventory/automation`, `/admin/products`; similar pressure on `/inventory`
- **Viewports:** 768×1024 and 1024×768
- **Evidence:** `23`, `24`, `46`, `47`, `02`
- **Observed:** Automation at 768 shows only ingredient/current/minimum columns. At 1024, Supplier/Aksi are cut at the right edge. Products at 768/1024 cut Status and/or Edit. Any horizontal affordance is outside the visible working area or only discoverable at the page bottom.
- **Expected:** Preserve primary actions using responsive cards/rows, sticky first/action columns, or an explicit local table scroller with visible cue.
- **User impact:** Tablet users can read a row but cannot act on it.
- **Recommendation:** Prioritize name, status, and action; move secondary fields into expandable details; keep scrolling local to the table, not the whole page.
- **Confidence:** High.

### INV-P2-02 — Recipe and automation lists contain visible duplicate business records

- **Severity:** P2
- **Status:** Confirmed
- **Routes:** `/inventory/mapping`, `/inventory/automation`, `/admin/products`
- **Evidence:** DOM and screenshots `16–18`, `25–27`, `48–50`
- **Observed:** Mapping lists duplicate names such as Croissant Almond, Croissant Butter, and Iced Espresso Tonic. Automation repeats ingredients such as Jeruk, Gas Nitrogen, Sayuran, and others. Products can show the same name under different categories without an ID/outlet differentiator.
- **Expected:** Duplicate prevention or clear identity markers (SKU, variant, category, outlet) so same-name records can be distinguished.
- **User impact:** Users can map/edit/order the wrong record and cannot tell whether duplicates are legitimate variants.
- **Recommendation:** Display stable identifiers and outlet/category context; add duplicate detection/merge review where appropriate.
- **Confidence:** High for visible duplication; legitimacy of each duplicate was not established.

### INV-P2-03 — Approval navigation is visually tab-like but lacks tab state semantics

- **Severity:** P2
- **Status:** Confirmed
- **Route:** `/inventory/stock-approvals`
- **Evidence:** `40`, `43`, `44`; accessibility snapshot
- **Observed:** Pending/Approved/Rejected are buttons inside navigation. The active view is visually underlined but the accessibility tree exposes no `tablist`, `tab`, `aria-selected`, or controlled tabpanel relationship.
- **Expected:** Use accessible tab semantics or make them links with current-page indication.
- **User impact:** Screen-reader users do not receive the selected lifecycle state.
- **Recommendation:** Implement the project’s tab primitive with `aria-selected` and panel association; preserve the strong visible focus style.
- **WCAG relevance:** 1.3.1, 4.1.2.
- **Confidence:** High.

### INV-P2-04 — Inventory chart lacks decision-ready and assistive context

- **Severity:** P2
- **Status:** Confirmed
- **Route:** `/inventory`
- **Evidence:** `02–06`, DOM accessibility snapshot
- **Observed:** The chart often contains one date and two points, scales to 60,000 without labeled units, and exposes an `application` with tick labels but no text summary or accessible data table. Before the fixture it briefly showed “Tidak ada data”; after data load it presents an almost-empty trend.
- **Expected:** Labeled axes/units, meaningful empty/insufficient-data state, and a text/table equivalent describing the values and date range.
- **User impact:** The chart consumes high-priority space without communicating a reliable trend; screen-reader users cannot interpret the series.
- **Recommendation:** Require at least two periods for trend visualization, summarize the key comparison in text, and provide an accessible table.
- **Confidence:** High.

### INV-P2-05 — Supplier and PO workflows are a dead end when no supplier exists

- **Severity:** P2
- **Status:** Confirmed
- **Routes:** `/inventory/suppliers`, `/inventory/automation`
- **Evidence:** `28–35`; the only supplier deep-state file is the pre-submit `35-supplier-add-dialog-1366x768.png`. No supplier post-submit screenshot or supplier-specific console/network log exists.
- **Observed:** Supplier list is empty. The PO review requires `Pilih Supplier` but offers no supplier options and does not link users to create one. After the labeled `UXR-20260810-0141-inventory-003` submission attempt, no supplier record was visible on a fresh route load.
- **Evidence boundary:** The non-persistence observation is factual, but the failed-save mechanism is unverified. The available source indicates `inventoryService` would normally persist suppliers to browser IndexedDB, so this report does not infer an endpoint failure or a specific supplier-save cause.
- **Expected:** Explain that a supplier is required, offer a direct Create Supplier path, and return to the draft with the new supplier selected.
- **User impact:** Users can review a PO but cannot complete it.
- **Recommendation:** Add a contextual create-supplier action and reliable inline save/error feedback; disable PO submission with an explanation until allocation is complete.
- **Confidence:** High.

### INV-P2-06 — Product edit image is unrelated to the product and undermines data trust

- **Severity:** P2
- **Status:** Confirmed
- **Route/state:** `/admin/products`, Edit Affogato
- **Evidence:** `52-admin-product-edit-affogato-1366x768.png`
- **Observed:** Foto Produk for Affogato displays a nighttime street scene from a random `picsum.photos` URL.
- **Expected:** A product-relevant image or an explicit neutral “no image” placeholder.
- **User impact:** Operators may publish incorrect catalog imagery and lose confidence in product data.
- **Recommendation:** Validate/migrate seeded image URLs; use deterministic product assets and a labeled missing-image state.
- **Confidence:** High.

### INV-P3-01 — Browser-native validation and terminology break localization consistency

- **Severity:** P3
- **Status:** Confirmed
- **Routes/states:** Inventory add/restock; product/approval statuses
- **Evidence:** `08`, `11`, `43–50`
- **Observed:** Indonesian forms surface English native messages (“Please fill out this field”, “Value must be greater than or equal to 0.01”). Lifecycle tabs and product status also use English (`Pending`, `Approved`, `Rejected`, `Low Stock`) inside otherwise Indonesian UI.
- **Expected:** Consistent Indonesian product language and accessible inline validation near the field.
- **User impact:** Adds cognitive friction and makes error recovery feel inconsistent.
- **Recommendation:** Localize labels/statuses and render custom inline validation while retaining native constraints.
- **Confidence:** High.

### INV-P3-02 — Mapping header uses three competing accent colors and dense actions

- **Severity:** P3
- **Status:** Confirmed
- **Route:** `/inventory/mapping`
- **Evidence:** `15–19`
- **Observed:** Tambah Menu, Export JSON, and Bulk Import are all high-emphasis filled buttons in purple, green, and magenta. At 768 they crowd the title and wrap heavily.
- **Expected:** One primary CTA; export/import grouped as secondary or overflow actions, especially below desktop widths.
- **User impact:** Weakens action hierarchy and contributes to tablet overflow.
- **Recommendation:** Keep Tambah Menu primary, convert import/export to secondary/overflow controls, and stack them below the heading at narrower widths.
- **Confidence:** High.

## Fixture and write ledger

| Label | Intended type/action | Submitted values | Outcome | Record ID | Cleanup |
|---|---|---|---|---|---|
| `UXR-20260810-0141-inventory-001` | Inventory ingredient create | current 2 kg; minimum 5 kg; unit price Rp 12.500 | **Created**; visible in inventory table and KPIs | Not exposed by UI/URL/row markup | Retained as required audit fixture; seeded data untouched |
| `UXR-20260810-0141-inventory-002` | Stock request note | quantity 3; ingredient `...-001` | **Failed; no record created**; console error and native alert | N/A | None required |
| `UXR-20260810-0141-inventory-003` | Supplier create attempt | phone `0000000000`; optional fields blank | **No record visible after fresh load**; save mechanism unverified; only `35-supplier-add-dialog-1366x768.png` documents the pre-submit state, with no post-action screenshot/log | N/A | None required |

No seeded business record was edited, deleted, approved, rejected, written off, or assigned to a PO. No PO was submitted. No product or recipe was saved.

## Workflow coverage and limits/skips

- Inventory list, KPI/status filter surface, add dialog, validation, created state, restock dialog, and failed submission were exercised.
- Inventory search and ingredient edit were not reachable because the route exposes neither control in the tested state.
- **Material skipped coverage:** the write-off dialog was not opened, so its fields, validation, focus behavior, and confirmation state were not exercised despite the deep-workflow brief. Write-off submission was correctly avoided to preserve the sole created fixture, but the dialog-level coverage remains unverified.
- Recipe list/search/sort surface, selected product/BOM state, profitability, component tabs, catalog/add-line affordances, export/import entry points were inspected. No seeded recipe/product was changed.
- Automation threshold table and PO review/allocation were inspected. PO submission was skipped because there was no available supplier and submitting would create an unlabeled procurement record.
- Supplier create/validation was attempted. No record was visible after fresh load, but the save mechanism is unverified. Supplier edit and delete-confirmation behavior remain unverified because no supplier record was available.
- Approval Pending/Approved/Rejected tabs, search/date/supplier filters, and empty states were exercised. Approval detail, bulk approval/rejection, and permission behavior remain unverified because all tabs were empty after the stock-request failure.
- Product list/search/category surface and seeded-product edit modal were exercised without saving. Add-product creation was not performed because the audit already had one successful write and the priority shifted to preserving the evidence/report after critical defects were confirmed.
- Loading states were observed on mapping and suppliers. Error state was observed through stock-request failure. A distinct permission-denied state was not reachable with the provided admin session.
- Network request bodies/status codes were not exposed by the in-app Browser API; console evidence and visible outcomes are reported instead.
- Contrast ratios, screen-reader announcements, reduced motion, zoom to 200%, and browser/OS combinations beyond the requested viewport matrix were not instrumented; findings are visible/semantic risks, not a complete WCAG conformance result.
- Product Design saved-context preflight could not run because Python was unavailable; the explicit task brief provided sufficient audit grounding.

## Source and Git confirmation

- Repository/source modifications by this audit: **none**.
- Git writes: **none** — no branch, checkout, staging, commit, merge, reset, clean, or push.
- Final read-only `git status --short` showed only `?? .env.local.example`. The audit did not create or modify that file.
- All created evidence and this report are outside the repository under the supplied review root.

## Prioritized recommendations

1. Stop using the profitability output until the percentage and profit formulas are corrected and covered by tests.
2. Repair stock-request creation and replace native alerts with accessible inline feedback.
3. Implement a true mobile/tablet navigation and data-table strategy; re-test the three deep workflows at 360/768/1366.
4. Reconcile ingredient identity/population across Inventory, Automation, Mapping, and outlet scope.
5. Standardize all overlays on the accessible dialog implementation already used by Product Edit.
6. Add reliable supplier creation and a contextual supplier-create path from PO review.
7. Add stable IDs/variant/outlet context to duplicate-prone product and ingredient lists.

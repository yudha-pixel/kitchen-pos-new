# Task 4: CRM and marketing audit

Status: `BLOCKED`

Run ID: `UXR-20260810-0141`  
Audit date: 2026-08-10 (Asia/Jakarta)  
Role exercised: authenticated local `admin`  
Theme: default light theme only  
Capture surface: Codex in-app Browser only  
Repository: `D:\Project\MyProject\kitchen-pos-new`  
Evidence: `screenshots/task-4`

## Audit scope

Combined UX and accessibility audit of `/admin/crm`, `/admin/promotions`, `/admin/vouchers`, and `/admin/discount-reports`. The audit covered all six required viewports and exercised empty/list, search/filter, create, validation, conditional form, report-tab, edit, runtime error, and destructive-confirmation entry states where safely reachable. Round 1 source review and authorized read-only database queries resolved the CRM fixture lifecycle, verified the new voucher UUID, and broadened cross-route findings. Root-task in-app Browser assistance produced one persisted active/limited voucher and one failed active quantity-promotion save capture; remaining persisted type/status/expiry/quota variants are blocked because this child task could not acquire the Codex in-app Browser, and no other browser surface was substituted.

The primary user goal is for an administrator to manage members, promotions, and vouchers and to audit discount activity without losing context, mistaking failed data for empty data, or needing precision scrolling to reach essential controls. Accessibility observations target visible keyboard focus, accessible names, labels/errors, responsive reflow, and safe destructive interaction. This is not a full WCAG conformance claim.

## Route and viewport matrix

| Route | 360x800 | 768x1024 | 1024x768 | 1366x768 | 1440x900 | 1920x1080 |
|---|---|---|---|---|---|---|
| `/admin/crm` | Captured: `01`, `02` | Captured: `16`, `22` | Captured: `23` | Captured: `27`, `41` | Captured: `33` | Captured: `37` |
| `/admin/promotions` | Captured: `05`-`08` | Captured: `17` | Captured: `24` | Captured: `28`, create failure `42` | Captured: `34` | Captured: `38` |
| `/admin/vouchers` | Captured: `09`-`11` | Captured: `18` | Captured: `25`, error `31` | Captured: `29`, error `32`, active/limited `43`, inactive `44`, expiry update mismatch `45` | Captured: `35` | Captured: `39` |
| `/admin/discount-reports` | Captured: `12`-`15` | Captured: `19`, `20` | Captured: `26` | Captured: `30` | Captured: `36` | Captured: `40` |

All 24 required route/viewport cells have an accepted current-run screenshot. The initial loading capture for CRM at 1024x768 was rejected and replaced with stable evidence `23`.

Round 1 screenshot delta: **4**, bringing the accepted evidence set to **45 screenshots**. The six-viewport route matrix is complete. Round 1 added a failed active quantity-promotion save state plus active/limited, inactive/limited, and attempted-expiry voucher states at 1366x768. The voucher expiry update reported success but did not persist the dates. Retained promotion type/status variants and an actually expired/exhausted voucher at the requested deep viewports remain blocked as documented below; create-dialog captures are not presented as substitutes for those missing persisted states.

## Numbered evidence and step health

1. `01-crm-list-360x800.png` — CRM empty list with expanded sidebar; **poor**, page is almost entirely obscured.
2. `02-crm-list-collapsed-360x800.png` — CRM after sidebar collapse; **poor**, horizontal page overflow remains.
3. `03-crm-create-modal-360x800.png` — CRM create form; **fair**, form is reachable and labeled.
4. `04-crm-validation-360x800.png` — empty CRM submit; **poor**, no visible field error or recovery text.
5. `05-promotions-list-360x800.png` — promotion empty list; **poor**, same shell overflow.
6. `06-promotions-create-modal-360x800.png` — quantity promotion form; **fair**, content is reachable through internal scrolling.
7. `07-promotions-amount-form-360x800.png` — amount-based conditional form; **fair**, correct threshold field appears.
8. `08-promotions-buy-x-get-y-360x800.png` — Buy X Get Y condition; **fair**, X/Y fields appear but context is cropped.
9. `09-vouchers-list-360x800.png` — voucher empty list; **poor**, page content is reduced to a narrow strip.
10. `10-vouchers-create-modal-360x800.png` — voucher create form; **fair**, form fits but two-column fields are cramped.
11. `11-vouchers-validation-360x800.png` — voucher validation toast; **poor**, error is detached from fields and submit label becomes visually absent.
12. `12-discount-reports-tabs-360x800.png` — report shell with expanded sidebar; **poor**, report is largely unreadable.
13. `13-discount-reports-collapsed-360x800.png` — global-discount tab after collapse; **fair**, core cards/tabs become reachable.
14. `14-discount-reports-voucher-tab-360x800.png` — voucher report tab; **fair**, state is visually distinct.
15. `15-discount-reports-free-item-tab-360x800.png` — free-item report tab; **fair**, state is visually distinct.
16. `16-crm-list-768x1024.png` — CRM empty baseline at tablet width; **good** for page layout.
17. `17-promotions-list-768x1024.png` — promotions empty baseline; **good** for page layout.
18. `18-vouchers-list-768x1024.png` — voucher empty baseline; **good**, helpful empty-state instruction.
19. `19-discount-reports-768x1024.png` — global-discount report; **fair**, filters are dense.
20. `20-discount-reports-filtered-768x1024.png` — search/type/date filters applied; **poor**, values are visibly truncated.
21. `21-crm-create-filled-768x1024.png` — labeled fixture before submit; **good**, complete form state is legible.
22. `22-crm-created-list-768x1024.png` — created CRM row; **poor**, table requires horizontal scrolling for most fields/actions.
23. `23-crm-1024x768.png` — CRM list at 1024; **fair**, record loads but table overflows internally.
24. `24-promotions-1024x768.png` — promotions baseline; **good**.
25. `25-vouchers-1024x768.png` — voucher baseline after re-authentication; **good**.
26. `26-discount-reports-1024x768.png` — report baseline; **fair**, search placeholder is clipped.
27. `27-crm-1366x768.png` — CRM list at desktop width; **fair**, status/actions remain offscreen.
28. `28-promotions-1366x768.png` — promotions baseline; **good**.
29. `29-vouchers-1366x768.png` — voucher baseline after re-authentication; **good**.
30. `30-discount-reports-1366x768.png` — report baseline; **good**.
31. `31-vouchers-auth-error-1024x768.png` — voucher 401/error state; **poor**, shell looks authenticated while data fails.
32. `32-vouchers-auth-error-1366x768.png` — repeated voucher 401/error state; **poor**.
33. `33-crm-1440x900.png` — CRM list; **fair**, table still scrolls horizontally.
34. `34-promotions-1440x900.png` — promotions baseline; **good**.
35. `35-vouchers-1440x900.png` — voucher baseline; **good**.
36. `36-discount-reports-1440x900.png` — report baseline; **good**.
37. `37-crm-1920x1080.png` — CRM list at maximum viewport; **fair**, status/actions are still not visible without horizontal scrolling.
38. `38-promotions-1920x1080.png` — promotions baseline; **good**.
39. `39-vouchers-1920x1080.png` — voucher baseline; **good**.
40. `40-discount-reports-1920x1080.png` — report baseline; **good**.
41. `41-crm-edit-dialog-1366x768.png` — edit dialog and scrolled action area; **fair**, form is usable but action buttons are unnamed.
42. `42-promotion-create-failed-1366x768.png` — filled active quantity-promotion form immediately after the save attempt failed; **poor**, no persisted status/type card was produced.
43. `43-voucher-active-limited-created-1366x768.png` — persisted active nominal voucher with a quota of two and zero uses; **good** for the requested active/limited card state, while its icon actions remain unnamed.
44. `44-voucher-inactive-limited-1366x768.png` — the same labeled voucher after a successful active-to-inactive toggle; **poor**, the icon changes from check to X but the card provides no explicit text status.
45. `45-voucher-expiry-update-not-persisted-1366x768.png` — the renamed inactive voucher after an attempted expired-date update; **poor**, success was reported while the displayed dates remained unchanged and non-expired.

## Strengths

- The four metric tiles create a consistent, scannable overview across CRM, promotions, and reports.
- Form controls have visible text labels and required markers; the mobile CRM and voucher forms remain operable despite shell overflow.
- Promotion conditional logic behaves coherently: amount selection changes the threshold label, and Buy X Get Y reveals X/Y inputs only for quantity promotions (`06`-`08`).
- Report tabs are text-labeled and provide distinct focus/active indicators; voucher and free-item tabs update metric labels and empty-state copy (`13`-`15`).
- The voucher empty state includes a clear next action and repeats the create affordance (`18`, `25`, `29`).
- Visible keyboard/focus outlines were observed on buttons, tabs, text inputs, and date inputs (`04`, `11`, `14`, `15`, `20`).
- No whole-document horizontal overflow was measured at 1024px and above; overflow is contained inside the CRM data table.

## Findings

### F-01 — Mobile shell prevents responsive reflow

- Severity: **P1**
- Route/section: all four routes, authenticated shell
- Role: admin
- Viewport: 360x800
- Theme: light
- Reproduction: open any scoped route at 360x800; observe the expanded sidebar, then press the sidebar collapse control.
- Expected: sidebar behaves as an overlay/drawer or collapses out of the content flow; main content fits 360px with no page-level horizontal scrolling.
- Observed: the expanded sidebar consumes roughly 255px, leaving a narrow content strip. After collapse, the icon rail remains and the main page still exposes a horizontal scrollbar and clipped controls/content.
- Business impact: phone users cannot reliably review metrics, find records, or reach create/report controls without two-axis precision scrolling.
- Root-cause confidence: **medium**; the visual pattern strongly indicates fixed shell/content widths and missing `min-width: 0`/mobile drawer behavior, but source was intentionally not inspected.
- Recommendation: switch the sidebar to an overlay drawer below the tablet breakpoint, remove it from layout flow when closed, add `min-w-0` to main/flex children, and stack cards/filters/forms to one column at 360px.
- Evidence: `01`, `02`, `05`, `09`, `12`, `13`.

### F-02 — A 401 authorization failure is shown as data failure or false-empty state

- Severity: **P1**
- Route/section: CRM and vouchers, data loading
- Role: admin-looking shell
- Viewport: reproduced at 1024x768 and 1366x768
- Theme: light
- Reproduction: in the captured admin-looking shell, open `/admin/vouchers` or `/admin/crm` while their API requests return 401.
- Expected: refresh authorization transparently, or route to a clear sign-in/permission state before rendering business data.
- Observed: the shell continued to show the admin identity while voucher requests failed with a visible `Gagal memuat voucher` toast. Console evidence recorded `API Error: 401 Object`, `Failed to load vouchers: ... 401`, and `Failed to load members`. CRM could render zero totals/empty content rather than an explicit authorization failure. The evidence establishes an authorization failure, but does not establish whether its cause was expiry, revocation, a missing token, or another server-side authorization condition.
- Business impact: administrators may interpret an authorization failure as “no vouchers” or “no members,” creating audit, promotion, and customer-service risk.
- Root-cause confidence: **high** for the 401/data-state mismatch; **low** for the underlying authorization cause because no request/response token diagnosis was performed.
- Recommendation: centralize 401 handling, refresh or invalidate the session atomically, prevent stale authenticated chrome from surrounding failed data, and provide a persistent retry/sign-in action rather than falling back to an empty state.
- Evidence: `31`, `32`; console log entries captured during the same run.

### F-03 — Icon-only record actions are unnamed across CRM, promotions, and vouchers

- Severity: **P1**
- Route/section: `/admin/crm`, `/admin/promotions`, and `/admin/vouchers`, record actions
- Role: admin
- Viewport: rendered CRM evidence at 1366x768; source-confirmed cross-route implementation
- Theme: light
- Reproduction: load a record and inspect its icon-only edit/delete controls; vouchers also expose an icon-only active-state toggle.
- Expected: every icon-only control has a contextual programmatic name, visible focus state, and at least a 44x44px target.
- Observed: CRM edit/delete buttons rendered with empty text, `aria-label=null`, and `title=null`, while their SVGs were hidden from the accessibility tree. Source review confirms the same unlabeled icon-button pattern in promotions (`page.tsx:382-391`) and vouchers (`page.tsx:255-273`), including the voucher active-state toggle. The controls use small icon-sized padding rather than a 44x44px target.
- Business impact: screen-reader users cannot distinguish edit, delete, and voucher status controls; unnamed destructive controls raise accidental-action risk across three core administration routes.
- Root-cause confidence: **high**, confirmed by rendered CRM DOM and direct source inspection across all three routes.
- Recommendation: give every icon action a record-specific accessible name, for example `aria-label="Edit member {name}"`, `aria-label="Delete promotion {name}"`, and `aria-label="Deactivate voucher {code}"`; keep SVGs decorative, add visible tooltips, preserve strong focus styling, and enforce a minimum 44x44px target.
- Evidence: `41`; `app/admin/crm/page.tsx:416-425`; `app/admin/promotions/page.tsx:382-391`; `app/admin/vouchers/page.tsx:255-273`.

### F-04 — Native alerts/confirmations and non-semantic app modals break the accessible dialog contract

- Severity: **P1**
- Route/section: `/admin/crm`, `/admin/promotions`, and `/admin/vouchers`, validation/destructive confirmation/create-edit dialogs
- Role: admin
- Viewport: all; native confirmation reached in CRM at 1366x768
- Theme: light
- Reproduction: submit invalid CRM/promotion data or invoke delete on a CRM, promotion, or voucher; open any create/edit modal.
- Expected: validation is attached to fields or announced by an app-owned error surface. Destructive confirmation uses an accessible application `AlertDialog` with an accessible title and description, explicit cancel/destructive actions, safe initial focus, trapped focus, Escape/cancel support, and focus returned to the invoking control. Create/edit surfaces expose `role="dialog"`, `aria-modal="true"`, and an accessible name.
- Observed: source confirms native `alert()`/`confirm()` in CRM (`155`, `173`, `179`, `205`), promotions (`136`, `144`, `150`, `155`, `160`, `165`, `193`), and voucher deletion (`147`). CRM delete visibly opened the browser-native confirmation. Source also confirms all three create/edit overlays are plain `<div>` wrappers (`crm:443-445`, `promotions:408-410`, `vouchers:332-334`) with no dialog role, `aria-modal`, or labelled dialog relationship.
- Business impact: ERP operators receive inconsistent, browser-owned blocking interactions; keyboard and assistive-technology users lack a dependable app-dialog contract for validation, record editing, and destructive actions.
- Root-cause confidence: **high** for native APIs and missing dialog semantics, confirmed in source; focus trapping, initial focus, Escape behavior, and focus restoration remain unverified runtime behaviors.
- Recommendation: replace native confirmation with the application's accessible `AlertDialog` primitive and native validation alerts with field-level errors plus an announced error summary. Implement create/edit dialogs with a tested modal primitive providing `role="dialog"`/`aria-modal`, `aria-labelledby`/`aria-describedby`, focus trap, safe initial focus, Escape and explicit cancel, and focus return.
- Evidence: `04`, `11`, `41`; source lines listed above.

### F-05 — Promotion creation fails after a fully valid active quantity setup

- Severity: **P1**
- Route/section: `/admin/promotions`, create/save workflow
- Role: admin
- Viewport: 1366x768
- Theme: light
- Reproduction: create `UXR-20260810-0141-crm-002 Active Qty` as a quantity promotion with minimum 2 items, nominal Rp 5,000 discount, active status, and 2026-08-09 through 2026-09-08 validity; press `Simpan` and dismiss the native alert.
- Expected: the promotion persists, the dialog closes, and the list shows an active quantity-promotion card/row with a stable ID.
- Observed: save invoked a native failure alert; after dismissal, the console recorded exactly `Failed to save promotion: DexieError`. The filled modal remained and no promotion record/card was created, so no persistent ID was assigned or recoverable.
- Business impact: administrators cannot create the audited promotion type, blocking campaign setup and making promotion status/type management untestable through the product.
- Root-cause confidence: **high** for the failed save and non-persistence; **low** for the underlying Dexie cause because only the generic error class was exposed and no database mutation or schema diagnosis was authorized.
- Recommendation: log the complete Dexie error name/message/stack in development, inspect the IndexedDB schema version/table contract and migration readiness, present a recoverable app error that preserves form data, and add an integration test for valid quantity and amount promotion saves.
- Evidence: `42`; current-run console entry quoted above.

### F-06 — Voucher validity update reports success while silently retaining the old dates

- Severity: **P1**
- Route/section: `/admin/vouchers`, edit/save and expiry status
- Role: admin
- Viewport: 1366x768
- Theme: light
- Reproduction: edit voucher UUID `33107313-5eb4-455e-ac36-47e3de0b8363`, rename it to `UXR-20260810-0141-crm-003 Expired Limited`, set validity to 2026-08-01 through 2026-08-08, leave it inactive, and save.
- Expected: the stored validity dates become 2026-08-01/2026-08-08, the card shows those dates and an explicit expired state, or the product rejects the update with an actionable error.
- Observed: the UI reported `Voucer berhasil diperbarui` and persisted the new name, but the card still showed 9/8/2026–8/9/2026. A read-only Prisma query confirmed `valid_from=2026-08-09T00:00:00.000Z`, `valid_until=2026-09-08T00:00:00.000Z`, and `is_active=false`: both old dates were retained. Source inspection shows the form serializes the full `formData` and the checked-in PUT route conditionally maps both date fields, so the divergence occurs beyond the obvious checked-in mapping; the exact runtime cause is not established.
- Business impact: administrators can believe a voucher campaign has expired when it remains date-valid in stored data, creating promotion leakage, audit inaccuracies, and control/compliance risk.
- Root-cause confidence: **high** for the silent persistence mismatch, confirmed by UI plus database truth; **low** for the runtime cause because the checked-in client/server mapping appears to accept both fields and no network payload/backend-version diagnosis was performed.
- Recommendation: make update responses authoritative in the UI, compare returned critical fields with the submitted values before showing success, reject or surface mismatches, and add API/integration tests that edit both validity dates and then read the voucher back. Capture request payload and served backend version in follow-up diagnosis.
- Evidence: `45`; read-only database verification; `app/admin/vouchers/page.tsx:100-116`; `server/routes/vouchers.ts:151-186`.

### F-07 — CRM table hides essential data and actions even on wide desktops

- Severity: **P2**
- Route/section: `/admin/crm`, member table
- Role: admin
- Viewport: 768x1024, 1024x768, 1366x768, 1440x900, 1920x1080
- Theme: light
- Reproduction: load a member and view the first row at each listed width.
- Expected: identity, tier/status, and primary row actions are visible at common desktop sizes; any overflow is limited to secondary columns and clearly signposted.
- Observed: the table exposes a horizontal scrollbar at every tested width. At 768px only name/phone are visible; at 1366px status/actions are still offscreen; at 1920px the rightmost status/action columns remain clipped.
- Business impact: routine edits, status changes, and deletes require hidden horizontal navigation and are easy to miss.
- Root-cause confidence: **high** for the behavior; **medium** for source cause.
- Recommendation: prioritize columns by breakpoint, make the action column sticky, wrap/truncate email with a reveal affordance, combine low-priority metrics into a detail drawer, and provide a card layout below desktop width.
- Evidence: `22`, `23`, `27`, `33`, `37`, `41`.

### F-08 — Required-field errors are not attached to the fields

- Severity: **P2**
- Route/section: CRM and voucher create dialogs
- Role: admin
- Viewport: 360x800
- Theme: light
- Reproduction: open each create dialog and submit with required name/code/phone fields empty.
- Expected: persistent inline messages beside each invalid field, `aria-invalid`, `aria-describedby`, and focus on the first invalid field; submit text remains visible.
- Observed: CRM showed no visible error or recovery text after submit. Voucher showed only a generic bottom toast (`Kode dan nama voucer wajib diisi`) detached from both fields, and the focused submit button appeared visually blank. The captured accessibility DOM did not expose field-associated error semantics.
- Business impact: users must infer which fields failed and may repeatedly submit; screen-reader users may miss the reason entirely.
- Root-cause confidence: **high** for the visible/DOM behavior.
- Recommendation: render field-specific messages, add `aria-invalid`/`aria-describedby`, use an `aria-live` error summary when multiple fields fail, focus the first invalid field, and keep button label/loading states visually stable.
- Evidence: `04`, `11`.

### F-09 — Promotion mobile dialog loses context during conditional editing

- Severity: **P2**
- Route/section: `/admin/promotions`, create dialog
- Role: admin
- Viewport: 360x800
- Theme: light
- Reproduction: open create, switch quantity/amount types, enable Buy X Get Y, and move through lower fields.
- Expected: a single predictable vertical scroll region with stable heading/action context and fields reflowed for mobile.
- Observed: the dialog requires internal vertical scrolling while the underlying page still exposes horizontal scrolling. Switching conditions and focusing lower controls moves the viewport so the title and/or footer are out of view; Buy/Get/date controls compete for width.
- Business impact: operators can lose which promotion mode they are editing and miss save/cancel controls, raising configuration mistakes.
- Root-cause confidence: **medium**; based on accepted screenshots and interaction behavior, with no source inspection.
- Recommendation: use a full-height mobile sheet with one scroll container, sticky title/footer, single-column mobile fields, and preserved scroll position when conditional sections mount.
- Evidence: `06`, `07`, `08`.

### F-10 — Tablet report filters obscure applied audit criteria

- Severity: **P2**
- Route/section: `/admin/discount-reports`, filter panel
- Role: admin
- Viewport: 768x1024
- Theme: light
- Reproduction: enter `UXR-NOMATCH`, select `Persentase`, and set 2026-08-01 through 2026-08-10.
- Expected: applied search, type, and full date values remain readable so an operator can verify the report scope before export.
- Observed: the search box displays only `UXI...`; selects collapse to fragments such as `Sem`/`Pers`; date fields show clipped year fragments. The empty result provides no applied-filter summary.
- Business impact: an exported or reviewed audit report can be scoped incorrectly without the operator noticing.
- Root-cause confidence: **high** for the visible truncation; **medium** for layout cause.
- Recommendation: reflow filters to two or one columns at tablet widths, set meaningful minimum widths, surface applied filters as removable chips/summary text, and keep full dates visible.
- Evidence: `19`, `20`, `26`.

### F-11 — Voucher terminology is inconsistent with the route and audit vocabulary

- Severity: **P3**
- Route/section: `/admin/vouchers`, page/dialog/report copy
- Role: admin
- Viewport: all
- Theme: light
- Reproduction: open voucher management, create dialog, and voucher report tab.
- Expected: one approved term is used consistently across navigation, headings, actions, validation, reports, and technical route naming.
- Observed: UI repeatedly uses `Voucer`, while the route and audit vocabulary use `vouchers`/voucher. This inconsistency also appears in button and validation copy.
- Business impact: lowers perceived quality and complicates search/help terminology.
- Root-cause confidence: **high**.
- Recommendation: choose the product-approved Indonesian term and apply it consistently through a shared message catalog.
- Evidence: `09`-`11`, `18`, `25`, `29`, `35`, `39`.

## Fixture ledger

| Label | Action | Data | UI/DB ID | Final observed state |
|---|---|---|---|---|
| `UXR-20260810-0141-crm-001` | Created through CRM dialog | phone `081000000401`; email `uxr-20260810-0141-crm-001@example.test`; Bronze; active; 0 points; Rp 0 spend | Exact historical UUID is **unavailable**: the UI never exposed it, the current `customers` query returns no matching row, and current `audit_logs` contain no matching fixture/customer event. | **Confirmed absent/deleted** by an authorized read-only Prisma query against `customer` (`name startsWith UXR-20260810-0141-crm-`) returning `[]`. The delete-confirmation probe had opened a native `confirm()` and the Browser click timed out, so the accepting interaction was not observed; database truth nevertheless confirms the record is not retained. No seeded record was targeted. |
| `UXR-20260810-0141-crm-002 Active Qty` | Create attempted through promotion dialog | description `UXR audit active quantity promotion`; quantity type; minimum 2 items; nominal discount Rp 5,000; active; valid 2026-08-09 through 2026-09-08 | **None assigned/persisted.** The save failed with `DexieError`, the modal remained, and the Browser list contained no matching record after dismissal. | **Not retained.** This is a failed labeled attempt, not an existing fixture. No delete or seeded mutation occurred. |
| `UXR-20260810-0141-crm-003 Active Limited` → `UXR-20260810-0141-crm-003 Expired Limited` | Created through voucher dialog; own fixture toggled inactive; own fixture renamed and expiry dates edited | code `UXR0810A003`; description `UXR audit active limited voucher`; nominal discount Rp 10,000; minimum purchase Rp 50,000; maximum discount Rp 0; quota 2; used 0. Creation dates 2026-08-09 through 2026-09-08. Attempted edit dates 2026-08-01 through 2026-08-08. | `33107313-5eb4-455e-ac36-47e3de0b8363`, verified by read-only Prisma queries | **Retained, inactive, not expired by stored dates.** The name and inactive toggle persisted; the attempted expired dates did not. Final DB truth: `is_active=false`, `valid_from=2026-08-09T00:00:00.000Z`, `valid_until=2026-09-08T00:00:00.000Z`, quota 2, used 0. No seeded record was targeted or changed. |

One Round 1 promotion fixture save was attempted through the root task's Codex in-app Browser but did not persist; the exact attempted values and failure boundary are ledgered above. This child task could not acquire the in-app Browser after an exact reconnect and troubleshooting pass. Chrome was visible but was not used because the in-app Browser was an explicit constraint. No seeded record was edited or deleted.

## Console and runtime errors

- `API Error: 401 Object`
- `Failed to load vouchers: Error: Failed to fetch vouchers: 401`
- `Failed to load members: Error: Failed to fetch members`
- `Failed to save promotion: DexieError`
- The Next.js development issue badge appeared with one or two issues during the 401 states.
- No production build, network panel, or server-log analysis was performed. The Browser surface exposed console messages but not a request/response waterfall for this run.

## Accessibility evidence and limits

- Confirmed from screenshots/current DOM: visible focus rings; text labels on fields; required markers; unnamed icon-only CRM actions; no field-associated validation messages; responsive overflow; text-labeled report tabs.
- Confirmed from source: unnamed icon-only record actions across CRM, promotions, and vouchers; browser-native `alert()`/`confirm()` use across those routes; and plain `<div>` create/edit modal wrappers without `role="dialog"`, `aria-modal`, or a labelled dialog relationship.
- Not verified: screen-reader announcements, actual focus trapping/restoration, safe initial focus, Escape behavior, focus return, reduced-motion behavior, high-contrast mode, zoom at 200%/400%, color ratios from computed styles, or touch behavior on physical hardware.
- Touch target dimensions were assessed visually/through rendered classes only; no physical-device measurement was performed.

## Skipped or constrained states

- Permission-denied states were not exercised because only the authorized admin account was available; no lower-privilege credentials were supplied.
- A valid active quantity-promotion save was attempted and failed with `DexieError` (`42`), so edit/detail/status cards and amount/inactive persisted variants could not be exercised. Conditional promotion types were otherwise covered only in create dialogs (`06`-`08`).
- One active, limited voucher was persisted and verified (`43`), then the same owned fixture was toggled inactive (`44`). Its expiry edit was exercised but failed to persist dates despite a success message (`45`). An actually expired card, exhausted-quota state, and additional edit/detail variants remain unexercised. Creating those variants required additional in-app Browser access that was unavailable to this child task. Using Chrome or direct database creation would have violated the requested workflow.
- Voucher quota and validity controls were inspected in the create form, but actual exhausted/expired application behavior requires orders/redemptions outside this module's safe scope.
- CSV export was not triggered because it creates a download artifact and the dataset was empty; filter state and button reachability were verified.
- The native CRM delete confirmation could not be screenshotted while active. The accepting interaction was not observed, but the subsequent authorized read-only database query confirms the labeled CRM record is absent. Native confirmation use across CRM/promotions/vouchers is independently confirmed in source.
- Dark theme was not available from these pages, so only the default light theme was assessed.

## Prioritized recommendations

1. Fix the 360px shell/sidebar reflow and CRM table responsiveness before expanding feature depth.
2. Repair promotion persistence (`DexieError`) and add valid quantity/amount integration coverage.
3. Fix voucher validity updates so stored dates match submitted dates before success is reported.
4. Replace native `alert()`/`confirm()` and plain-div modals with accessible app dialog/error primitives across CRM, promotions, and vouchers.
5. Resolve 401 authorization handling so failed data cannot masquerade as an empty member/voucher population.
6. Add accessible names and full-size targets to CRM, promotion, and voucher record actions.
7. Implement field-associated validation and stable submit states in all create/edit dialogs.
8. Reflow promotion dialogs and report filters at mobile/tablet widths, then retest keyboard focus, zoom, and screen readers.

## Source and Git confirmation

- Repository/source files modified: **none**.
- Git write operations: **none** — no branch, checkout, add/stage, commit, reset, clean, merge, or push.
- Current read-only `git status --short`: `?? .env.local.example` only, matching the pre-existing state recorded in the review ledger.
- Browser-created business data: one labeled CRM fixture now confirmed absent; one failed promotion attempt with no persisted ID; one retained voucher fixture with UUID `33107313-5eb4-455e-ac36-47e3de0b8363`, current name `UXR-20260810-0141-crm-003 Expired Limited`, inactive, quota 2/used 0, and unchanged stored dates 2026-08-09 through 2026-09-08; no seeded record was targeted.
- Files written by this task are limited to the external review package: `screenshots/task-4/*` and this report.

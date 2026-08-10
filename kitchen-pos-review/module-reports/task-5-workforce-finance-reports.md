# Task 5 — Workforce, Finance, and Reporting UX audit

**Status:** DONE WITH CONCERNS  
**Audit date:** 2026-08-10 (Asia/Jakarta)  
**Method:** screenshot-first audit in the Codex in-app Browser, followed by a read-only source and Git audit  
**Routes:** `/admin/hr`, `/admin/attendance`, `/finance/ocr`, `/admin/reports`  
**Roles tested:** existing signed-in administrator session only

## Executive result

The desktop layouts are visually consistent and generally readable, but the tested workflows are not ready for reliable workforce or finance operations. The highest-risk problems are the unusable 360 px shell, a split persistence model that leaves saved shifts assigned to `Unknown`, a camera flow that claims a photo was captured without a ready camera stream, failed manual-expense persistence behind a native browser alert, and report controls that accept an invalid custom range without applying it to the data or export.

No P0 blocker was found. Five P1 findings and four P2 findings are documented below. No real OCR/provider call was made, no camera permission was granted, and no seeded record was edited or deleted.

## Coverage and evidence matrix

| Route | 360×800 | 768×1024 | 1024×768 | 1366×768 | 1440×900 | 1920×1080 | Deep workflow |
|---|---|---|---|---|---|---|---|
| HR & Payroll | 01, 05–11 | 13, 50–51 | 17 | 21, 25–30 | 42 | 46 | employee create, shifts, payroll/payslip |
| Attendance | 02, 12 | 14 | 18 | 22, 31–33 | 43 | 47 | check-in, camera-not-ready, confirm without shift |
| Finance / OCR | 03 | 15, 52 | 19 | 23, 34–37 | 44 | 48 | manual expense validation/save; OCR deliberately not invoked |
| Reports | 04 | 16, 53 | 20 | 24, 39–41 | 45 | 49 | period controls, invalid custom range, export attempt |

All accepted evidence is in `screenshots/task-5/` (52 PNGs). The numbering intentionally skips 38: the file-chooser wait timed out before a screenshot was written, and no file was selected.

### Numbered screenshot sequence

1. `01-hr-employees-360x800.png` — HR employee baseline.
2. `02-attendance-360x800.png` — Attendance baseline.
3. `03-ocr-360x800.png` — Finance/OCR baseline.
4. `04-reports-360x800.png` — Reports baseline.
5. `05-hr-add-employee-dialog-360x800.png` — employee dialog.
6. `06-hr-add-employee-empty-submit-360x800.png` — empty submit state.
7. `07-hr-add-employee-filled-360x800.png` — fixture-filled employee form.
8. `08-hr-employee-save-result-360x800.png` — successful employee creation.
9. `09-hr-shifts-360x800.png` — shifts tab.
10. `10-hr-photo-attendance-360x800.png` — photo-attendance tab.
11. `11-hr-payroll-360x800.png` — payroll tab.
12. `12-hr-checkin-camera-state-360x800.png` — crushed mobile camera/check-in state.
13. `13-hr-employees-768x1024.png` — HR tablet baseline.
14. `14-attendance-768x1024.png` — Attendance tablet baseline.
15. `15-ocr-768x1024.png` — Finance tablet baseline.
16. `16-reports-768x1024.png` — Reports tablet baseline.
17. `17-hr-employees-1024x768.png` — HR landscape tablet.
18. `18-attendance-1024x768.png` — Attendance landscape tablet.
19. `19-ocr-1024x768.png` — Finance landscape tablet.
20. `20-reports-1024x768.png` — Reports landscape tablet.
21. `21-hr-employees-1366x768.png` — HR desktop baseline.
22. `22-attendance-1366x768.png` — Attendance desktop baseline.
23. `23-ocr-1366x768.png` — Finance desktop baseline.
24. `24-reports-1366x768.png` — Reports desktop baseline.
25. `25-hr-shifts-1366x768.png` — shifts desktop.
26. `26-hr-add-shift-dialog-1366x768.png` — add-shift dialog.
27. `27-hr-add-shift-filled-1366x768.png` — fixture-filled shift.
28. `28-hr-shift-save-result-1366x768.png` — saved shift assigned to `Unknown`.
29. `29-hr-payroll-1366x768.png` — payroll totals.
30. `30-hr-payslip-dialog-1366x768.png` — payslip dialog.
31. `31-attendance-checkin-result-1366x768.png` — check-in modal.
32. `32-attendance-camera-request-state-1366x768.png` — false captured-photo state without granted permission.
33. `33-attendance-confirm-no-shift-alert-1366x768.png` — silent no-shift confirmation result.
34. `34-expense-add-manual-dialog-1366x768.png` — manual-expense dialog.
35. `35-expense-empty-save-result-1366x768.png` — empty submit without inline error.
36. `36-expense-manual-filled-1366x768.png` — fixture-filled expense.
37. `37-expense-save-result-1366x768.png` — failed save; native alert observed by browser dialog instrumentation.
38. `39-reports-custom-range-1366x768.png` — custom report controls.
39. `40-reports-invalid-custom-range-1366x768.png` — inverted date range accepted.
40. `41-reports-export-invalid-range-result-1366x768.png` — export attempt with invalid range.
41. `42-hr-employees-1440x900.png` — HR wide desktop.
42. `43-attendance-1440x900.png` — Attendance wide desktop.
43. `44-ocr-1440x900.png` — Finance wide desktop.
44. `45-reports-1440x900.png` — Reports wide desktop.
45. `46-hr-employees-1920x1080.png` — HR full HD.
46. `47-attendance-1920x1080.png` — Attendance full HD.
47. `48-ocr-1920x1080.png` — Finance full HD.
48. `49-reports-1920x1080.png` — Reports full HD.
49. `50-hr-shifts-768x1024.png` — persisted shift on tablet.
50. `51-hr-payroll-768x1024.png` — payroll tablet.
51. `52-expense-manual-dialog-768x1024.png` — manual-expense tablet dialog.
52. `53-reports-custom-768x1024.png` — overflowing custom report controls.

## Findings

### P1-1 — The global shell makes all four modules effectively unusable at 360 px

**Severity/ID:** P1-1.  
**Route/section:** global authenticated shell on `/admin/hr`, `/admin/attendance`, `/finance/ocr`, and `/admin/reports`; report custom-filter action row.  
**Role:** existing signed-in administrator session.  
**Viewport/theme:** 360×800 on all four routes and 768×1024 on the report custom-filter state; light theme observed.  
**Reproduction:** open each scoped route at 360×800 with the existing sidebar visible and inspect the main content, tabs, tables, filters, and actions. At 768×1024, open Reports, change the period selector to Custom, and inspect the date inputs and Export action.  
**Observed:** the expanded sidebar consumes roughly two thirds of the 360 px viewport. Main content is reduced to a narrow strip; headings, tabs, tables, cards, filters, and actions clip or require nested horizontal scrolling. At 768 px the shell is improved, but report custom controls still run offscreen and the Export action is clipped.  
**Expected:** a mobile navigation drawer should be collapsed by default, overlay content when opened, preserve a usable content width, and keep primary actions reachable without page-level horizontal scrolling.  
**Business impact:** employees cannot reliably inspect or operate HR, attendance, expense, or reporting workflows on a phone; tablet users can miss report actions.  
**Root-cause confidence/source basis:** low for the technical cause, high for the rendered defect. The screenshots consistently confirm the constrained content width and overflow, but the responsive shell/filter implementation was not isolated in source during this audit.  
**Recommendation:** use a modal/off-canvas mobile drawer with focus trapping and Escape/close support; switch dense tables to responsive row cards or intentional table scroll regions; let filter/action bars wrap; keep the primary action visible.  
**Screenshot evidence:** 01–04, 09–12, 53.

### P1-2 — Employee and shift identity split across persistence layers

**Observed:** employee fixture `workforce-001` was initially created and shown, and shift `workforce-002` was saved with that employee checked. The saved shift then rendered its assignee as `Unknown`. Later wide/tablet captures showed zero employees while the client-side shift remained. No delete was performed.  
**Expected:** a saved assignment should resolve the selected employee consistently across refreshes and viewports, and a load failure should never be presented as a trustworthy zero-record empty state.  
**Impact:** managers cannot know who owns a shift, and an API/load problem can be mistaken for employee deletion or an empty workforce.  
**Root-cause confidence: high for `Unknown`, medium for the later empty employee list.** Employee reads use the server API (`src/features/hr/hrService.ts:71–84`), but shifts are stored in IndexedDB (`:414–440`) and assignee names are resolved from IndexedDB employees (`:494–500`). This guarantees unresolved API-only employee IDs. The exact cause of the later employee empty state was not isolated; the UI provides no error/retry boundary.  
**Recommendation:** establish one authoritative employee/shift data model, enforce referential integrity, resolve names from the same employee source, and render a distinct error state with Retry rather than converting failures into an empty list.  
**Evidence:** 08, 27–28, 42, 46, 50.

### P1-3 — Attendance can claim a captured photo without a ready camera

**Observed:** without granting camera permission or providing a media stream, selecting **Ambil Foto** changed the modal to a broken/black `Captured photo` state and exposed **Konfirmasi**. Confirming without a shift closed the flow with no visible success or validation and produced no attendance record.  
**Expected:** Capture and Confirm must remain disabled until permission is granted, the stream is live, dimensions are non-zero, a valid frame exists, and a shift is selected. Permission, capture, retention, and failure state should be explicit and announced.  
**Impact:** false proof-of-attendance and employee privacy/trust risk.  
**Root-cause confidence: high.** `capturePhoto` copies `video.videoWidth/videoHeight` and calls `toDataURL` without checking stream readiness or non-zero dimensions (`src/components/hr/AttendanceCameraModal.tsx:123–136`).  
**Recommendation:** model permission/stream/capture as explicit states; disable actions until prerequisites pass; reject zero-sized frames; provide inline `role="status"`/`aria-live` feedback and privacy/retention copy; keep the dialog open on validation failure.  
**Evidence:** 31–33.

### P1-4 — Manual expenses cannot be saved in the tested environment and failure uses native system UI

**Observed:** `workforce-003` was filled with a valid positive amount, category, date, method, and description. Save failed with `DexieError`; the browser detected a native `alert` and no expense appeared. Empty submit also supplied no persistent inline error.  
**Expected:** successful local/server persistence with a visible receipt/record, or an accessible application error that explains recovery without losing input.  
**Impact:** operational expenses can be omitted from records and therefore from financial reporting. Native browser dialogs interrupt context, are visually inconsistent, and do not provide field-level guidance.  
**Root-cause confidence: medium.** Runtime logs identify a Dexie save failure. The page catches the exception and calls `alert('Gagal menyimpan pengeluaran')` (`app/finance/ocr/page.tsx:179–201`). The same scoped page uses native alerts for validation/OCR/delete/export and native confirm for delete (`:119, :150, :168, :175, :181, :201, :215`).  
**Recommendation:** make persistence failure atomic and observable; preserve the form; show an application AlertDialog for the blocking error and inline, programmatically associated, announced validation beside each invalid field. Replace every scoped `alert()`/`confirm()` with an accessible application modal/AlertDialog.  
**Evidence:** 34–37, 52.

### P1-5 — Custom report dates do not control report data or export

**Observed:** Custom accepted an inverted range (`2026-08-10` → `2026-08-01`) with no error and unchanged chart/summary. Export then produced no browser download event or UI confirmation in the observation window. At 768 px the custom controls overflow and Export is offscreen.  
**Expected:** start/end dates should be labeled, validated, applied to every financial/HR metric and export, reflected in a visible active-filter summary, and followed by download success/failure feedback.  
**Impact:** decision-makers can export or interpret data for a different period than the one shown in the controls.  
**Root-cause confidence: high.** data loading calls period services with `chartPeriod` only (`app/admin/reports/page.tsx:45–52`); custom dates only update local input state (`:281–294`). `exportToCSV` serializes the already-loaded arrays (`:103 onward`) rather than applying the custom range.  
**Recommendation:** introduce a validated canonical date-range state, reload all report datasets from it, include it in CSV metadata/filename, disable export while invalid/loading, and provide an announced result.  
**Evidence:** 39–41, 53.

### P2-1 — Modal semantics and form labeling are incomplete across the scope

**Severity/ID:** P2-1.  
**Route/section:** employee, shift, and payslip overlays in `/admin/hr`; camera/check-in overlay in `/admin/attendance`; manual-expense overlay in `/finance/ocr`.  
**Role:** existing signed-in administrator session.  
**Viewport/theme:** 360×800 employee dialog; 768×1024 manual-expense dialog; 1366×768 shift, payslip, attendance-camera, and manual-expense dialogs; light theme observed.  
**Reproduction:** open Add Employee, Add Shift, Payslip, attendance Check-in, and Add Manual Expense. Inspect the rendered accessibility tree for dialog/title relationships, control names, and label associations; submit the empty employee form and observe the resulting validation state.  
**Observed:** the overlays did not expose reliable `dialog`/`aria-modal` semantics or a title relationship; several icon-only close buttons had no accessible name. Visible field labels were often not associated with their controls, so the accessibility tree exposed placeholders or generic date inputs instead. No evidence of initial-focus placement, focus containment, or focus restoration was found. Native required validation in the employee dialog scrolled the modal but did not leave a durable inline error.  
**Expected:** each overlay should expose an accessible dialog name and description, place and contain focus appropriately, restore focus on close, provide an accessible name for every control, associate labels/errors with inputs, and leave validation feedback visible and announced.  
**Business impact:** keyboard and screen-reader users may lose task context, encounter unnamed controls, or have difficulty discovering and correcting invalid fields; all users receive inconsistent error recovery across critical workforce and finance forms.  
**Root-cause confidence/source basis:** medium. The rendered accessibility-tree inspection supports the missing names, dialog relationships, and label associations. Initial-focus placement, focus trapping/restoration, and screen-reader announcement behavior were not fully exercised, so those remain evidence limits rather than confirmed failures.  
**Recommendation:** use a shared accessible Dialog/AlertDialog primitive with labelled title/description, focus trap/restoration and Escape behavior; give close controls explicit names; bind every label using `htmlFor`/`id`; connect hint/error text with `aria-describedby`; announce submit summaries.  
**Screenshot evidence:** 05–07, 26–27, 30–35, 52.

### P2-2 — Payroll totals communicate incompatible financial meanings

**Severity/ID:** P2-2.  
**Route/section:** HR summary, Payroll tab, and Payslip in `/admin/hr`; HR/payroll expense summary in `/admin/reports`.  
**Role:** existing signed-in administrator session.  
**Viewport/theme:** 360×800 employee-create result and 1366×768 HR/payroll/report states; light theme observed.  
**Reproduction:** create/open the permanent employee fixture with base salary Rp3,500,000, compare the HR summary KPI with the current Payroll tab and Payslip, then inspect the HR/payroll expense amount in Reports.  
**Observed:** before the employee list disappeared, the HR KPI showed **Total Pengeluaran Gaji Rp3.500.000**, while current-period payroll and the payslip showed zero working days, total earnings Rp0, and take-home Rp0. Reports also showed HR payroll expense Rp0.  
**Expected:** each amount should state its accounting basis and period, and values representing contractual salary, accrued payroll, payable payroll, and reported expense should be named and reconciled consistently.  
**Business impact:** a manager cannot tell whether Rp3.5m is contractual base salary, budget, accrued payroll, or payable expense, reducing trust in payroll and profit reporting.  
**Root-cause confidence/source basis:** medium. The incompatible labels and values are screenshot-confirmed, but the audit did not isolate one incorrect calculation: the amounts may intentionally represent different bases whose distinction is not communicated.  
**Recommendation:** rename the KPI to its true meaning (for example, monthly base-salary commitment), show the active payroll period, and reconcile/report separate budget, accrued, approved, and paid amounts with consistent definitions.  
**Screenshot evidence:** 08, 21, 24, 29–30.

### P2-3 — Dense data and chart interactions lack robust accessible alternatives

**Severity/ID:** P2-3.  
**Route/section:** revenue-versus-expense visualization and filters in `/admin/reports`; compact workforce/report controls and tables in `/admin/hr` and `/admin/attendance`.  
**Role:** existing signed-in administrator session.  
**Viewport/theme:** 360×800, 768×1024, and 1366×768; light theme observed.  
**Reproduction:** open Reports and inspect the chart’s rendered accessibility representation and available non-visual equivalent; resize to the smaller audited viewports and inspect table scrolling and action sizes. Open Attendance Check-in and inspect the compact control geometry.  
**Observed:** the report visualization is exposed as a chart/application without an equivalent data table for the revenue-versus-expense series; tooltips appeared pointer-oriented. Tables rely heavily on horizontal scrolling at smaller widths. Several operational controls are materially below a 44×44 px touch target (for example, the observed Check-in control was about 24 px high and report controls about 28 px high). Focus rings were visible on several controls, which is a positive baseline, but that does not resolve semantics or target size.  
**Expected:** quantitative content should have an equivalent readable summary/table and keyboard-reachable detail; dense tables should remain understandable under zoom/small viewports; primary operational controls should provide practical touch targets while preserving visible focus.  
**Business impact:** users who cannot use hover or comfortably target small controls may miss chart values or trigger the wrong action, while small-screen users must work through high-friction horizontal navigation.  
**Root-cause confidence/source basis:** high for the measured small targets and screenshot-observed overflow; medium for the absent chart alternative based on the rendered accessibility representation. A full keyboard-only and screen-reader pass was not performed, so tooltip keyboard behavior and announcement quality are not claimed as confirmed failures.  
**Recommendation:** add a concise accessible data table/summary and keyboard-accessible chart details, preserve visible focus, and raise touch targets to at least 44×44 CSS px where practical.  
**Screenshot evidence:** 12, 16, 24, 31, 39, 53.

### P2-4 — Current global navigation conflicts with the product-owner module model

**Severity/ID:** P2-4.  
**Route/section:** global authenticated navigation visible from `/admin/hr`, `/admin/attendance`, `/finance/ocr`, and `/admin/reports`.  
**Role:** existing signed-in administrator session.  
**Viewport/theme:** all six audited viewport sizes; light theme observed.  
**Reproduction:** open each scoped route and inspect the persistent sidebar entries, module grouping, Attendance placement, and POS label.  
**Observed:** HR & Payroll and Attendance Selfie currently appear mixed into a generic back-office sidebar, while the POS entry is ambiguously named `POS (menu)`. The current shell does not present the owner-defined separate top-level module launcher in these audited states.  
**Expected:** per the product owner’s target direction, provide a searchable Odoo/OCA-style kanban launcher at `/apps`; make Point of Sale, Kitchen Display, Menu & Products, Attendance, and HR & Payroll separate top-level modules; preserve each module’s scoped child menus; make `/pos` Back deterministic to `/apps`; rename `POS (menu)` to its unambiguous product/module name.  
**Business impact:** ambiguous module boundaries and naming increase navigation hesitation, mix attendance-camera work with generic administration, and make the return destination from POS unpredictable for staff switching tasks.  
**Root-cause confidence/source basis:** high for the current navigation presentation because it is repeated across the screenshot matrix. The `/apps` launcher and module model are an explicit product-owner target direction, not a claim that an already-implemented requirement regressed; implementation/source causality was not assessed.  
**Recommendation:** treat the launcher and module boundaries as information architecture, not merely visual restyling. Attendance selfie/camera belongs inside the Attendance module rather than the generic ERP sidebar.  
**Screenshot evidence:** 01–04, 13–16, 21–24, 42–49.

## Severity closure

- **P0:** none confirmed.
- **P3:** none recorded.

## Positive observations

- Desktop spacing, typography, iconography, Indonesian copy, and IDR formatting are generally coherent.
- HR tabs establish recognizable Employee, Shift, Attendance, and Payroll task groupings.
- Empty states are concise and include a primary action where appropriate.
- Several buttons and tab controls show visible focus styling.
- Reports separate revenue, net sales, tax, service charge, operational expense, and HR/payroll concepts, providing a useful foundation once period semantics are corrected.

## Fixture ledger

| Fixture | Attempted state | Result | Exact identifier / evidence | Cleanup |
|---|---|---|---|---|
| `UXR-20260810-0141-workforce-001` | Employee; UX Auditor; `uxr-workforce-001@example.invalid`; `080000000001`; permanent; base salary Rp3,500,000; join date `2026-08-09`; active | Created and initially visible; later UI loaded zero employees without an audit-side delete | PostgreSQL read-only reconciliation: `ab31635e-f7d5-4588-b644-044c55b1bba8` | Not deleted; retained for owner review |
| `UXR-20260810-0141-workforce-002` | Shift; 09:00–17:00; “UX research shift”; employee selected | Created in client IndexedDB; persisted at 768; assignee displayed `Unknown` | UUID is generated client-side (`crypto.randomUUID`) but is not exposed by the audited UI. Hidden storage was not inspected; exact ID is an evidence limit. | Not deleted; retained for owner review |
| `UXR-20260810-0141-workforce-003` | Manual operational expense; Rp125,000; transfer; `2026-08-09`; “UX review stationery” | Save failed with `DexieError`; no record was created | No ID exists | No cleanup needed |

No seeded mutation/delete was performed. The shift’s unresolved assignee is itself retained evidence.

## Native-dialog inventory and required replacement

Runtime confirmed a native alert on manual-expense save failure. Read-only source inspection confirms scoped native dialogs for employee save/delete, shift validation/save/delete, attendance errors/overtime, OCR validation/process/save/delete/export, and associated delete confirmations. Per the product-owner rule, every native `alert()`/`confirm()` is a confirmed system UI defect. Replace blocking decisions/errors with an accessible application AlertDialog and pair validation with persistent inline messages, focus transfer to the first error, and an announced summary. Destructive confirmations must name the record and consequence and default focus to Cancel.

## Skips, limits, and safety record

- OCR upload/review was not executed: no file was selected and no OCR/provider path was called. The hidden file-input chooser wait timed out; the browser kernel was recovered and the matrix resumed.
- Camera permission was not granted and no personal image was captured. The false captured-photo state was produced without a valid stream.
- No destructive action was taken. Employee delete, shift delete, expense delete, and seeded-record edits were not exercised.
- Permission-denied UX was not runtime-tested because only the existing administrator session was available. Source indicates role gates, but that is not equivalent to browser evidence.
- Error/empty-state coverage is limited to naturally encountered states: employee disappearance/empty list, expense save failure, invalid report dates, no active employees, and no-shift attendance confirmation.
- CSV content could not be inspected because no browser download event was observed. The source-level filter/export mismatch is independently confirmed.
- Accessibility findings are evidence-based checks, not a claim of full WCAG conformance testing. Screen-reader and full keyboard-only passes were not performed.

## Source and Git confirmation

- Repository/source audit remained read-only: no source file, Git index, branch, or commit was changed.
- Final `git status --short` remained `?? .env.local.example`, matching the pre-existing untracked file observed at audit start.
- This report and its screenshots are outside the repository under the supplied visualization artifact root.

## Recommended order of remediation

1. Unify workforce persistence and stop converting employee-load failure into an empty state.
2. Gate camera capture/confirmation on a valid stream, frame, and shift.
3. Repair expense persistence and replace scoped native dialogs with accessible application UI.
4. Make report ranges canonical, validated, and shared by data, summaries, and exports.
5. Implement responsive shell/table/filter behavior for 360 and 768 px.
6. Adopt the owner-defined `/apps` launcher and module boundaries, then complete shared dialog/form/chart accessibility work.

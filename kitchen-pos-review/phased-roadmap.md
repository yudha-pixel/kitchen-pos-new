# Phased architecture and UX roadmap

## Sequencing principle

Shared truth and safety precede module polish. Each phase is grouped into shared-system work, module work, and optional evolution. A phase exits only when its stated evidence is available; passing a narrow module test is not system-wide certification.

## Phase 0 — Contain critical trust failures

### Shared system

- Replace the stock Next.js `/` starter immediately. Route unauthenticated users to `/login` and authenticated users to the Phase 1 `/apps` launcher; add a product-identity/entry smoke check so framework starter content cannot ship. Evidence: Task 1 Finding 2 and P1-17 in the consolidated backlog.
- Protect all staff/management routes and distinguish login, 401, 403, offline, empty, and server-error states. Evidence: `module-reports/task-1-access-shell.md` Finding 1; `task-4-crm-marketing.md` F-02.
- Prohibit browser-native `alert()`/`confirm()` and non-semantic modal wrappers. Provide one accessible Dialog, AlertDialog, inline-error, and error-summary contract with focus trap/restore, Escape/cancel, safe initial focus, and announced errors.
- Fix settings/outlet write error propagation so failed saves remain open, preserve dirty values, state cause, and offer Retry. Evidence: Task 6 P1-1/P2-4.
- Establish typed API runtime configuration; remove repeated localhost fallbacks from consumers.

### Module

- Sales: repair online create-to-status continuity, self-order table identity, receipt total snapshot, `undefined` stock rendering, and mobile POS blocking layout. Evidence: Task 2 SLS-01 to SLS-05.
- Inventory: correct the 100x profitability error, stock-request failure, and contradictory inventory populations. Evidence: Task 3 INV-P1-05 and INV-P1-01 to 04.
- Workforce/finance/reports: unify employee/shift identity, gate camera capture on a valid stream/shift, repair expense persistence, and make date range canonical for view/export. Evidence: Task 5 P1-2 to P1-5.
- CRM/marketing: repair promotion persistence, voucher date persistence, and false-success behavior. Evidence: Task 4 F-05/F-06.

### Optional evolution

- None. Do not start plugin extraction, broad visual redesign, or new modules while transactional and authorization truth is unreliable.

### Exit evidence

- Targeted API/service integration tests for each repaired write/read continuity path.
- Static type/lint/build checks.
- User-authorized runtime checks at 360, 768, and 1366 widths for the repaired paths.

## Phase 1 — Shared ERP foundation

### Shared system

- Implement capability-based authorization using the existing Role/Permission model; server enforcement is authoritative and audit actors come from authenticated claims.
- Build searchable `/apps` Odoo/OCA-style kanban launcher and module shell registry. Create distinct Point of Sale, Kitchen Display, Menu & Products, Attendance, and HR & Payroll apps with module-scoped child menus.
- Make POS Back explicitly navigate to `/apps`.
- Implement responsive shells: mobile overlay drawer/rail, tablet behavior, reachable actions, and no persistent sidebar crushing content.
- Implement configuration precedence: organization default -> outlet override -> user/device display preference, with source badges, inherit/reset, revision, effective preview, and restricted display-only final layer.
- Centralize locale/currency/timezone formatting and transaction snapshots.
- Establish shared semantic theme tokens and remove raw-color leakage incrementally.

### Module

- Map every existing route/action to a module identifier and capability.
- Move KDS routing from hardcoded labels to KitchenStation/category/outlet master data.
- Move outlet delivery fee, payroll deduction, cash/stock defaults, receipt profiles, and print/payment configuration to their designated owners in the ownership register.
- Replace sample table UUIDs and hardcoded approval actors with server/master-data truth.

### Optional evolution

- Add launcher favorites, recents, and search synonyms only after permissions and module enablement are correct.

### Exit evidence

- Role/capability/outlet matrix covers launcher, child menu, direct URL, API, action, audit actor, 401/403, token expiry, and offline policy.
- Settings precedence tests cover inherit/override/reset, outlet switch, reload, clean session, cache/offline/conflict, and snapshot immutability.
- Responsive/accessibility checks cover all required viewports, keyboard/focus, reduced motion, zoom, dialogs, and no horizontal page overflow.

## Phase 2 — Module workflow rehabilitation

### Shared system

- Introduce responsive list/detail/table patterns, persistent filters, loading/empty/error/offline states, and accessible chart summaries.
- Standardize module notifications, audit history, optimistic/queued state, and recovery language.
- Finish semantic theme migration across components and charts; independently verify light, dark, and KDS.

### Module

- Point of Sale: reconcile `/pos`, `/kasir`, `/waiter`, tables, shift, online order, self-order, payment and receipt responsibilities; define supported flows and remove duplicates.
- Kitchen Display: station/category routing, order aging, status transitions, high-contrast and touch-first KDS behavior.
- Menu & Products: product/category/modifier/BOM ownership, inventory context, image trust, and edit routing.
- Inventory & Purchasing: ingredient identity, warehouse/outlet scope, restock, suppliers, PO creation/receipt, approvals, duplicate handling, and decision-ready charts.
- CRM & Promotions: field-linked validation, reliable persistence, explicit voucher status, consistent terminology, responsive record actions, and audit-safe reports.
- Attendance: independent top-level module with camera permission/readiness, shift dependency, privacy cues, and recovery.
- HR & Payroll: independent module with unified employees/shifts/payroll, consistent financial meanings, policy-driven deductions, and payslip snapshots.
- Finance & Expenses: expense persistence, OCR/manual ownership, accessible upload/review, and reconciliation states.
- Reports: canonical filter/query/export contract, valid date bounds, accessible chart/table equivalence, and locale/snapshot correctness.
- Organization & Settings: reliable outlet CRUD, scoped settings, role/capability administration, print/KDS/inventory/security sections, and effective-value previews.

### Optional evolution

- Offline-first queue observability, conflict-resolution UI, saved report views, richer analytics, and cross-module command palette.

### Exit evidence

- Each module has a purpose/journey, owned data, capability map, route map, empty/loading/error/offline coverage, responsive matrix, accessibility evidence, and targeted integration tests.
- No module uses native alert/confirm, browser-only validation as its error strategy, or unowned hardcoded business values.

## Phase 3 — Trusted internal plugin architecture

### Shared system

- Implement the exact trusted-plugin manifest contract in `trusted-plugin-readiness.md`.
- Add manifest validation, dependency resolution, enable/disable lifecycle, route/navigation registration, settings-schema registry, migration orchestration, health reporting, rollback gates, and failure quarantine.
- Keep core authentication, `/apps`, configuration resolution, audit, shared UI primitives, and recovery outside plugin failure domains.

### Module

- Extract one low-risk internal module first, then progressively register mature modules without changing their business contracts.
- Require every module to declare routes, navigation, capabilities, settings scope, migrations, health, and rollback before extraction.

### Optional evolution

- Internal module catalog, staged rollout by outlet, feature flags, and module observability dashboards.
- Public marketplace, third-party sandbox, and untrusted plugin execution are explicitly out of scope.

### Exit evidence

- Compatibility/dependency/collision failures are rejected safely.
- Enable/disable/upgrade/rollback works in a disposable environment.
- A failed plugin or migration is isolated; authentication, `/apps`, settings recovery, audit, and unrelated modules stay available.

## Phase 4 — Optional product evolution

### Shared system

- Performance budgets, route-level loading boundaries, background job observability, localization packs, disaster-recovery rehearsal, and privacy/data-retention controls.

### Module

- Advanced forecasting, replenishment automation, loyalty segmentation, workforce planning, accounting integrations, and multi-organization capabilities only from validated business demand.

### Optional evolution

- External integrations use versioned service contracts and least-privilege credentials. They do not weaken the trusted-internal-plugin boundary.

### Exit evidence

- Business KPI, risk, data ownership, authorization, migration, rollback, and operational support criteria are approved for each addition.

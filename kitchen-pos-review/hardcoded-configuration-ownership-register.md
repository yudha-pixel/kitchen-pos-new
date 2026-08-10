# Hardcoded configuration ownership register

## Decision

Every repeated or hardcoded value below has exactly one authoritative owner category. Consumers may cache or snapshot a value, but they must not become a second owner.

Effective-value precedence is:

`organization default -> outlet override -> user/device display preference`

The final layer is restricted to display preferences. It must not override business policy, accounting, security, inventory, payment, or kitchen-routing decisions.

## Owner categories

| Owner category | Meaning |
|---|---|
| Deployment environment | Secrets, network origins, service endpoints, and infrastructure settings supplied at deployment time. |
| Organization default | Tenant-wide business identity, locale, policy, and default behavior. |
| Outlet override | Operational differences belonging to one outlet. |
| User/device display preference | Non-business presentation preferences for an operator or terminal. |
| Module master data | Administered records such as payment methods, kitchen stations, printers, roles, and statuses. |
| Transaction snapshot | Immutable values copied onto a transaction or issued artifact at the time of posting. |
| Code invariant | Stable semantic identifiers, state-machine rules, validation constraints, and technical contracts. |

## Register

| Value or repeated pattern | Current evidence | Single owner | Required disposition | Status |
|---|---|---|---|---|
| API URL fallback `http://localhost:3000` | `src/lib/api.ts:1`, `src/context/ThemeContext.tsx:30`, `src/hooks/useTables.ts:36,55`, multiple feature services/pages; `src/store/useConfigStore.ts:20` | Deployment environment | Resolve through one typed runtime-config adapter. Do not store an API origin in tenant settings. | Confirmed |
| API host/port, CORS origins, database URL, JWT and provider secrets | `server/index.ts:4-5`; `server/app.ts:38-76`; `prisma/schema.prisma:5-8` | Deployment environment | Keep outside the ERP UI and validate at startup. | Confirmed |
| Application name and organization identity (`Kitchen POS`, store name/address/phone/email) | `app/layout.tsx:19-20`; `src/components/layout/Sidebar.tsx:94`; `src/components/features/ReceiptTemplate.tsx:44-46`; `prisma/schema.prisma:390-393` | Organization default | One organization profile supplies shell identity and defaults. Outlet identity may override only where the artifact belongs to an outlet. | Confirmed |
| Locale `id-ID`, currency `IDR`, and `Rp` formatting | `src/lib/format.ts:1-7`; repeated `Intl.NumberFormat` and `toLocaleString` across POS, HR, finance, reports, and inventory; `prisma/schema.prisma:395-398` | Organization default | Use one formatting service. Currency changes must not reinterpret old transactions. | Confirmed |
| Time zone `Asia/Jakarta` | `prisma/schema.prisma:395`; settings defaults | Organization default | Centralize date boundary and report-period calculations. | Confirmed |
| Tax and service-charge defaults | `prisma/schema.prisma:397-398`; `src/store/useConfigStore.ts:17-24`; reports and recipe profitability | Organization default | Store canonical percentage units and document the contract. An outlet may override through the precedence model. | Confirmed; current percentage-contract mismatch is confirmed in `module-reports/task-3-inventory.md`, INV-P1-05. |
| Outlet delivery fee `15000` | `prisma/schema.prisma:264`; `app/admin/outlets/page.tsx:19,37,47,62` | Outlet override | Persist through the outlet API/schema. Current server outlet validation omits the field, so visible configuration is not a reliable owner. | Confirmed |
| Outlet selection | `src/features/outlet/outletStore.ts:21-57`; `src/components/outlet/OutletSelector.tsx` | User/device display preference | Treat as current working context only. It must not masquerade as an outlet settings layer. | Confirmed |
| Accent, light/dark, card style, density, card view, cart position | `prisma/schema.prisma:381-387`; `src/context/ThemeContext.tsx:50-94`; `app/pos/settings/page.tsx` | User/device display preference | Organization supplies defaults; outlet may override brand/terminal defaults; user/device preference wins only for these display-safe fields. Show source, inheritance, reset, and effective value. | Confirmed current storage is a singleton global setting, not the decided precedence. |
| Receipt header/footer and logo/table/cashier visibility | `prisma/schema.prisma:400-407`; `server/routes/settings.ts` | Organization default | Allow outlet override where receipt branding differs. Copy effective values to the issued receipt snapshot. | Confirmed |
| Receipt organization/outlet identity, currency, tax/service rates, payment label, cashier/table identity | `src/components/features/ReceiptTemplate.tsx`; `src/components/pos/Receipt.tsx`; POS order flow | Transaction snapshot | Snapshot at sale/issue time so later settings edits cannot rewrite historical evidence. | Recommendation; zero-total receipt defect confirmed in `module-reports/task-2-sales.md`, SLS-03. |
| Printer type, paper width, category-to-printer assignment | `prisma/schema.prisma:406-407`, category-printer models, settings UI | Module master data | Model print profiles and assignments; organization/outlet settings reference them. | Confirmed model exists in part; consolidated ownership is a recommendation. |
| Payment methods, gateways, QR expiry, and provider verification labels | `prisma/schema.prisma:350-373`; POS/online payment components | Module master data | Capabilities and labels come from enabled provider/payment records; transaction uses a snapshot. Do not advertise verification when none occurs. | Risk confirmed in `module-reports/task-2-sales.md`, SLS-06. |
| Default cash float, reconciliation/report behavior | `prisma/schema.prisma:409-414`; settings route defaults | Organization default | Permit outlet override for local cashier operations. Snapshot opening/closing values on each shift. | Confirmed |
| Minimum stock thresholds and notification defaults | `prisma/schema.prisma:416-421`; inventory settings | Organization default | Allow outlet/warehouse override where replenishment differs. Product/ingredient-specific thresholds belong to master records. | Confirmed |
| Kitchen route labels `KDS Display 1/2`, `Bar Station` | `prisma/schema.prisma:432-434`; `app/admin/settings/page.tsx:961-992` | Module master data | Remove literal options; use `KitchenStation` records and outlet/category assignments (`prisma/schema.prisma:721-750`). | Confirmed |
| Security toggles, manager PIN, backup frequency | `prisma/schema.prisma:423-429`; settings route defaults | Organization default | Replace plaintext/default PIN ownership with credential-grade storage and permission/capability enforcement; infrastructure backup scheduling may remain deployment-owned. | Confirmed values; security storage redesign is recommendation. |
| Roles and permissions | `prisma/schema.prisma:34-73`; `server/routes/roles.ts` | Module master data | Use permission identifiers as the authorization source for routes, navigation, and actions. | Confirmed model exists; enforcement mismatch documented separately. |
| Role names and module identifiers | `AuthContext.tsx:9`; `server/middleware/auth.ts:36`; sidebar arrays | Code invariant | Keep stable identifiers in a shared contract; editable display labels may be localized. | Confirmed mismatch today. |
| Navigation/module catalog and child-menu structure | `src/components/layout/Sidebar.tsx:27-70`; owner decision in `progress.md:9` | Code invariant | A trusted module manifest owns identifiers/routes/capability requirements; `/apps` renders searchable Odoo/OCA-style kanban entries and active modules render only their child menus. | Confirmed current hardcoding; target approved. |
| POS Back destination `/apps` | `src/components/layout/Header.tsx:33`; `module-reports/task-6-configuration.md`, P1-3 | Code invariant | POS uses an explicit route to `/apps`, independent of browser history. | Confirmed defect and approved target. |
| Table UUID/sample rows in `app/pos/meja/page.tsx:67-73` | Seven dated fixed records | Module master data | Remove runtime fallback; keep examples only in named development seed fixtures. | Confirmed |
| Approval actor strings `admin-user`, `Admin` | `app/inventory/stock-approvals/page.tsx:94-309` | Transaction snapshot | Server derives actor ID/name from authenticated claims and writes them to the approval audit record. | Confirmed |
| Late deduction `50000` | `src/components/hr/PayslipModal.tsx:46` | Organization default | Move to an effective-dated payroll policy; copy calculated lines onto payroll/payslip snapshots. | Confirmed |
| Product/category/station/payment/status display labels | Multiple page-local arrays and conditionals | Module master data | Administer operational labels where changeable; localize fixed semantic labels. | Confirmed pattern; exhaustive literal inventory remains an implementation task. |
| State codes, route identifiers, audit event types, validation bounds | Prisma models, Express routes, TypeScript unions | Code invariant | Centralize typed contracts; labels/configuration do not alter state-machine meaning. | Confirmed |

## Acceptance checks

- Every configurable field exposes exactly one authoritative owner and, where applicable, inherited/effective values.
- Outlet switching changes only outlet-scoped values and data.
- User/device preferences cannot alter taxes, payment verification, payroll, stock, security, or audit policy.
- Issued orders, receipts, shifts, approvals, payroll, and exports retain their original snapshots after settings changes.
- Offline cache records source scope, revision, and last synchronization time; conflict handling never silently promotes cache into ownership.


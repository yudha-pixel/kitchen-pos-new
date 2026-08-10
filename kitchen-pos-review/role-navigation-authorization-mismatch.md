# Role, navigation, and authorization mismatch

## Outcome

The database contains a permission model, but current navigation and server authorization are mostly hardcoded role-string systems with incompatible role sets. This is a release-blocking architecture mismatch for an ERP launcher because hiding links cannot secure capabilities and server restrictions do not consistently match the UI's intended roles.

## Confirmed evidence

| Layer | Evidence | Current behavior |
|---|---|---|
| Database | `prisma/schema.prisma:34-73` | `Role`, `Permission`, and `RolePermission` support module/action capability records. |
| Client identity | `src/context/AuthContext.tsx:9` | User role union is `admin | management | cashier | owner`. |
| Server role guard | `server/middleware/auth.ts:36-44` | `requireRole` accepts only `admin | cashier`. |
| Server routes | `server/routes/settings.ts`, `products.ts`, `hr.ts`, `customers.ts`, `vouchers.ts`, `recipes.ts`, `kitchen.ts`, and others | Most administrative mutations require literal `admin`; role-permission records are not used for capability enforcement. |
| UI route checks | `app/admin/reports/page.tsx:147`; `app/admin/hr/page.tsx:40`; `app/admin/attendance/page.tsx:19`; `app/finance/ocr/page.tsx:55` | UI allows varying combinations of management/owner/admin that the typed server guard cannot represent consistently. |
| Navigation | `src/components/layout/Sidebar.tsx:27-70,78-264` | Fixed arrays render POS, KDS, inventory, finance, CRM, HR, attendance, reports, and settings without capability filtering. `user` is imported but not used for menu decisions. |
| Direct access | `module-reports/task-1-access-shell.md`, Finding 1 | Management shell was directly reachable without completed login in the audited state. |
| Auth/data failure | `module-reports/task-4-crm-marketing.md`, F-02 | A 401 can appear as a false-empty or generic data state while the shell still appears authenticated. |
| Actor trust | `app/inventory/stock-approvals/page.tsx:94-309` | Approval actions pass literal `admin-user`/`Admin` rather than using authenticated server identity. |
| Navigation semantics | `module-reports/task-1-access-shell.md`, findings 6 and 8 | Expanded shell crushes phone content; disclosure controls omit `aria-expanded`; direct `/customers` link is a legacy 404. |

## Approved information architecture

- `/apps` is a searchable Odoo/OCA-style kanban launcher.
- Point of Sale, Kitchen Display, Menu & Products, Attendance, and HR & Payroll are distinct top-level modules.
- Each active module owns its child menu. A global mixed ERP sidebar is not retained.
- POS Back always navigates explicitly to `/apps`, never to browser history.
- Launcher tiles and child-menu entries are capability-filtered, but server-side enforcement remains authoritative.

Suggested initial module families beyond the five mandatory separations: Inventory & Purchasing, CRM & Promotions, Finance & Expenses, Reports, and Organization & Settings. Final enablement remains a product decision, not a security assumption.

## Required authorization contract

1. Define stable capabilities as `module.action` identifiers, for example `pos.open`, `orders.void`, `inventory.approve`, `payroll.read`, `settings.write`.
2. Resolve a user's effective capabilities server-side from active role assignments, outlet scope, and module enablement.
3. Return a minimal session capability set to the client for launcher/menu/action affordances.
4. Enforce the same capability on every server route and service action; never authorize from a client-supplied role, actor name, menu visibility, or PIN alone.
5. Derive audit actor identity from the authenticated request. Snapshot actor ID/name and authorization context on approvals, voids, payroll, and settings changes.
6. Treat 401 as expired/invalid authentication and 403 as authenticated-but-forbidden. Neither may render as an empty business population.
7. Route guards redirect unauthenticated staff routes to login with a safe return target; forbidden routes show an application-owned permission page.

## Risks

- Exact non-admin runtime behavior was not exhaustively tested; task reports primarily used the visible admin session.
- Existing roles/permissions may be seeded inconsistently with UI role unions; migration and compatibility mapping require database inspection during implementation.
- Offline POS needs an explicit signed/expiring capability cache and a restricted offline action policy; local role strings must not become authority.

## Acceptance matrix

For every role/capability/outlet combination, verify launcher tile, child menu, direct route, action control, API response, audit actor, outlet data boundary, token expiry, offline policy, and 401/403 recovery. Include admin, owner, management, cashier, a custom least-privilege role, inactive user, disabled module, and cross-outlet access attempts.


# Route Access Control Audit Report

**Generated:** 2026-08-10T20:25:41.839Z

## Executive Summary

### Backend Routes
- **Total routes audited:** 231
- **Public routes:** 35 (15.2%)
- **Authenticated routes:** 108 (46.8%)
- **Admin-only routes:** 88 (38.1%)
- **Cashier-only routes:** 0 (0.0%)
- **Multi-role routes:** 0 (0.0%)
- **Critical issues:** 0

### Frontend Pages
- **Total pages audited:** 36
- **Public pages:** 3 (8.3%)
- **Authenticated pages:** 27 (75.0%)
- **Role-based pages:** 6 (16.7%)
- **Critical issues:** 0

### Overall
- **Total critical issues:** 0

## Backend Routes

| File | Method | Path | Auth Level | Roles | Sensitive | Status |
|------|--------|------|------------|-------|-----------|--------|
| approvalWorkflows.ts | GET | / | authenticated | N/A | No | ✅ OK |
| approvalWorkflows.ts | POST | / | admin | admin | No | ✅ OK |
| approvalWorkflows.ts | PATCH | /:id | admin | admin | No | ✅ OK |
| approvalWorkflows.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| attendance.ts | GET | / | authenticated | N/A | No | ✅ OK |
| attendance.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| attendance.ts | POST | /check-in | authenticated | N/A | No | ✅ OK |
| attendance.ts | POST | /check-out | authenticated | N/A | No | ✅ OK |
| attendance.ts | PUT | /:id | admin | admin | No | ✅ OK |
| attendance.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| attendance.ts | GET | /summary/today | admin | admin | No | ✅ OK |
| audit.ts | GET | / | admin | admin | No | ✅ OK |
| audit.ts | GET | /:id | admin | admin | No | ✅ OK |
| audit.ts | GET | /stats/summary | admin | admin | No | ✅ OK |
| auth.ts | POST | /login | public | N/A | No | ✅ OK |
| auth.ts | POST | /register | admin | admin | No | ✅ OK |
| auth.ts | GET | /me | authenticated | N/A | No | ✅ OK |
| backup.ts | POST | / | admin | admin | Yes | ✅ OK |
| backup.ts | GET | / | admin | admin | Yes | ✅ OK |
| backup.ts | GET | /:id | admin | admin | Yes | ✅ OK |
| backup.ts | POST | /:id/restore | admin | admin | Yes | ✅ OK |
| backup.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| customers.ts | GET | / | authenticated | N/A | No | ✅ OK |
| customers.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| customers.ts | POST | / | admin | admin | No | ✅ OK |
| customers.ts | PUT | /:id | admin | admin | No | ✅ OK |
| customers.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| customers.ts | PATCH | /:id/toggle-active | admin | admin | No | ✅ OK |
| customers.ts | POST | /:id/points | authenticated | N/A | No | ✅ OK |
| goodsReceivedNotes.ts | GET | / | authenticated | N/A | No | ✅ OK |
| goodsReceivedNotes.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| goodsReceivedNotes.ts | POST | / | authenticated | N/A | No | ✅ OK |
| goodsReceivedNotes.ts | PATCH | /:id/quality-check | authenticated | N/A | No | ✅ OK |
| goodsReceivedNotes.ts | PATCH | /:id/complete | authenticated | N/A | No | ✅ OK |
| goodsReceivedNotes.ts | PATCH | /:id/cancel | authenticated | N/A | No | ✅ OK |
| hr.ts | GET | /employees | authenticated | N/A | No | ✅ OK |
| hr.ts | GET | /employees/:id | authenticated | N/A | No | ✅ OK |
| hr.ts | POST | /employees | admin | admin | No | ✅ OK |
| hr.ts | PUT | /employees/:id | admin | admin | No | ✅ OK |
| hr.ts | DELETE | /employees/:id | admin | admin | Yes | ✅ OK |
| hr.ts | GET | /statistics | admin | admin | No | ✅ OK |
| hr.ts | GET | /payroll-summary | admin | admin | No | ✅ OK |
| hr.ts | POST | /payroll | admin | admin | No | ✅ OK |
| hr.ts | GET | /payroll | admin | admin | No | ✅ OK |
| hr.ts | PATCH | /payroll/:id/status | admin | admin | No | ✅ OK |
| ingredients.ts | GET | / | public | N/A | No | ✅ OK |
| ingredients.ts | GET | /:id | public | N/A | No | ✅ OK |
| ingredients.ts | POST | / | admin | admin | No | ✅ OK |
| ingredients.ts | PUT | /:id | admin | admin | No | ✅ OK |
| ingredients.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| invoices.ts | GET | / | authenticated | N/A | Yes | ✅ OK |
| invoices.ts | GET | /:id | authenticated | N/A | Yes | ✅ OK |
| invoices.ts | POST | / | authenticated | N/A | Yes | ✅ OK |
| invoices.ts | PATCH | /:id/verify | authenticated | N/A | Yes | ✅ OK |
| invoices.ts | PATCH | /:id/cancel | authenticated | N/A | Yes | ✅ OK |
| kitchen.ts | GET | /stations | authenticated | N/A | No | ✅ OK |
| kitchen.ts | POST | /stations | admin | admin | No | ✅ OK |
| kitchen.ts | PUT | /stations/:id | admin | admin | No | ✅ OK |
| kitchen.ts | DELETE | /stations/:id | admin | admin | Yes | ✅ OK |
| kitchen.ts | POST | /stations/:id/categories | admin | admin | No | ✅ OK |
| kitchen.ts | DELETE | /stations/:id/categories/:categoryId | admin | admin | Yes | ✅ OK |
| kitchen.ts | GET | /orders | authenticated | N/A | No | ✅ OK |
| notifications.ts | GET | / | authenticated | N/A | No | ✅ OK |
| notifications.ts | GET | /unread-count | authenticated | N/A | No | ✅ OK |
| notifications.ts | PATCH | /:id/mark-read | authenticated | N/A | No | ✅ OK |
| notifications.ts | PATCH | /mark-all-read | authenticated | N/A | No | ✅ OK |
| notifications.ts | DELETE | /:id | authenticated | N/A | Yes | ✅ OK |
| notifications.ts | POST | / | public | N/A | No | ✅ OK |
| ocr.ts | POST | /scan | authenticated | N/A | No | ✅ OK |
| ocr.ts | GET | /scans | authenticated | N/A | No | ✅ OK |
| ocr.ts | GET | /scans/:id | authenticated | N/A | No | ✅ OK |
| ocr.ts | DELETE | /scans/:id | authenticated | N/A | Yes | ✅ OK |
| orders.ts | GET | /orders | authenticated | N/A | No | ✅ OK |
| orders.ts | GET | /orders/active | authenticated | N/A | No | ✅ OK |
| orders.ts | GET | /orders/:id | authenticated | N/A | No | ✅ OK |
| orders.ts | GET | /orders/:id/items | authenticated | N/A | No | ✅ OK |
| orders.ts | POST | /orders | authenticated | N/A | No | ✅ OK |
| orders.ts | PATCH | /orders/:id/status | authenticated | N/A | No | ✅ OK |
| orders.ts | POST | /order-items | authenticated | N/A | No | ✅ OK |
| orders.ts | PATCH | /order-items/:id/status | authenticated | N/A | No | ✅ OK |
| orders.ts | POST | /void-logs | authenticated | N/A | Yes | ✅ OK |
| orders.ts | POST | /orders/merge-table | authenticated | N/A | No | ✅ OK |
| outlets.ts | GET | / | public | N/A | No | ✅ OK |
| outlets.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| outlets.ts | POST | / | authenticated | N/A | No | ✅ OK |
| outlets.ts | PATCH | /:id | authenticated | N/A | No | ✅ OK |
| outlets.ts | DELETE | /:id | authenticated | N/A | Yes | ✅ OK |
| payments.ts | POST | /payments | authenticated | N/A | Yes | ✅ OK |
| payments.ts | GET | /payments/:id | authenticated | N/A | Yes | ✅ OK |
| payments.ts | PATCH | /payments/:id/status | authenticated | N/A | Yes | ✅ OK |
| payments.ts | POST | /payments/:id/void | admin | admin | Yes | ✅ OK |
| payments.ts | POST | /webhooks/payment | authenticated | N/A | Yes | ✅ OK |
| print.ts | GET | /printers | public | N/A | No | ✅ OK |
| print.ts | GET | /printers/category/:categoryId | public | N/A | No | ✅ OK |
| print.ts | POST | /printers | admin | admin | No | ✅ OK |
| print.ts | PATCH | /printers/:id | admin | admin | No | ✅ OK |
| print.ts | DELETE | /printers/:id | admin | admin | Yes | ✅ OK |
| print.ts | POST | /printers/route | admin | admin | No | ✅ OK |
| print.ts | DELETE | /printers/route/:id | admin | admin | Yes | ✅ OK |
| print.ts | GET | /printers/orders/:orderId/jobs | public | N/A | No | ✅ OK |
| products.ts | GET | /categories | admin | admin | No | ✅ OK |
| products.ts | POST | /categories | admin | admin | No | ✅ OK |
| products.ts | PATCH | /categories/:id | admin | admin | No | ✅ OK |
| products.ts | DELETE | /categories/:id | admin | admin | Yes | ✅ OK |
| products.ts | GET | /modifier-groups | public | N/A | No | ✅ OK |
| products.ts | POST | /modifier-groups | admin | admin | No | ✅ OK |
| products.ts | PATCH | /modifier-groups/:id | admin | admin | No | ✅ OK |
| products.ts | DELETE | /modifier-groups/:id | admin | admin | Yes | ✅ OK |
| products.ts | GET | /modifiers | public | N/A | No | ✅ OK |
| products.ts | POST | /modifiers | admin | admin | No | ✅ OK |
| products.ts | PUT | /modifiers/:id | admin | admin | No | ✅ OK |
| products.ts | DELETE | /modifiers/:id | admin | admin | Yes | ✅ OK |
| products.ts | GET | /products | public | N/A | No | ✅ OK |
| products.ts | POST | /products | admin | admin | No | ✅ OK |
| products.ts | PATCH | /products/:id | admin | admin | No | ✅ OK |
| products.ts | DELETE | /products/:id | admin | admin | Yes | ✅ OK |
| purchaseOrders.ts | GET | / | authenticated | N/A | No | ✅ OK |
| purchaseOrders.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| purchaseOrders.ts | POST | / | authenticated | N/A | No | ✅ OK |
| purchaseOrders.ts | PATCH | /:id/review | authenticated | N/A | No | ✅ OK |
| purchaseOrders.ts | PATCH | /:id/send | authenticated | N/A | No | ✅ OK |
| purchaseOrders.ts | PATCH | /:id/acknowledge | authenticated | N/A | No | ✅ OK |
| purchaseOrders.ts | PATCH | /:id/cancel | authenticated | N/A | No | ✅ OK |
| quotationRequests.ts | GET | / | authenticated | N/A | No | ✅ OK |
| quotationRequests.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| quotationRequests.ts | POST | / | authenticated | N/A | No | ✅ OK |
| quotationRequests.ts | PATCH | /:id/close | authenticated | N/A | No | ✅ OK |
| quotationRequests.ts | DELETE | /:id | authenticated | N/A | Yes | ✅ OK |
| quotations.ts | GET | / | authenticated | N/A | No | ✅ OK |
| quotations.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| quotations.ts | GET | /compare/:requestId | authenticated | N/A | No | ✅ OK |
| quotations.ts | POST | / | authenticated | N/A | No | ✅ OK |
| quotations.ts | PATCH | /:id/select | authenticated | N/A | No | ✅ OK |
| quotations.ts | PATCH | /:id/reject | authenticated | N/A | Yes | ✅ OK |
| recipes.ts | GET | / | public | N/A | No | ✅ OK |
| recipes.ts | GET | /menu/:menuItemId | public | N/A | No | ✅ OK |
| recipes.ts | GET | /:id | public | N/A | No | ✅ OK |
| recipes.ts | POST | / | admin | admin | No | ✅ OK |
| recipes.ts | PUT | /:id | admin | admin | No | ✅ OK |
| recipes.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| recipes.ts | DELETE | /menu/:menuItemId | admin | admin | Yes | ✅ OK |
| roles.ts | GET | / | admin | admin | Yes | ✅ OK |
| roles.ts | GET | /:id | admin | admin | Yes | ✅ OK |
| roles.ts | POST | / | admin | admin | Yes | ✅ OK |
| roles.ts | PUT | /:id | admin | admin | Yes | ✅ OK |
| roles.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| roles.ts | POST | /:id/permissions | admin | admin | Yes | ✅ OK |
| roles.ts | DELETE | /:id/permissions/:permissionId | admin | admin | Yes | ✅ OK |
| selfOrder.ts | GET | /tables | public | N/A | No | ✅ OK |
| selfOrder.ts | GET | /tables/:tableNumber | public | N/A | No | ✅ OK |
| selfOrder.ts | GET | /tables/id/:tableId | public | N/A | No | ✅ OK |
| selfOrder.ts | GET | /products | public | N/A | No | ✅ OK |
| selfOrder.ts | GET | /categories | public | N/A | No | ✅ OK |
| selfOrder.ts | POST | /orders | public | N/A | No | ✅ OK |
| selfOrder.ts | GET | /orders/pending | authenticated | N/A | No | ✅ OK |
| selfOrder.ts | GET | /orders/:id | public | N/A | No | ✅ OK |
| selfOrder.ts | GET | /tables/:tableId/orders | public | N/A | No | ✅ OK |
| selfOrder.ts | PATCH | /orders/:id/status | authenticated | N/A | No | ✅ OK |
| selfOrder.ts | PATCH | /orders/:id/payment-status | authenticated | N/A | Yes | ✅ OK |
| selfOrder.ts | POST | /orders/:id/accept | authenticated | N/A | No | ✅ OK |
| selfOrder.ts | POST | /orders/:id/reject | authenticated | N/A | Yes | ✅ OK |
| settings.ts | GET | / | authenticated | N/A | Yes | ✅ OK |
| settings.ts | PUT | / | admin | admin | Yes | ✅ OK |
| settings.ts | POST | /reset | admin | admin | Yes | ✅ OK |
| splitBill.ts | GET | /:orderId | authenticated | N/A | No | ✅ OK |
| splitBill.ts | POST | /by-items | authenticated | N/A | No | ✅ OK |
| splitBill.ts | POST | /by-amount | authenticated | N/A | No | ✅ OK |
| splitBill.ts | POST | /equal | authenticated | N/A | No | ✅ OK |
| stockRequests.ts | GET | / | authenticated | N/A | No | ✅ OK |
| stockRequests.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| stockRequests.ts | POST | / | authenticated | N/A | No | ✅ OK |
| stockRequests.ts | PATCH | /:id/approve-supervisor | authenticated | N/A | Yes | ✅ OK |
| stockRequests.ts | PATCH | /:id/approve-manager | authenticated | N/A | Yes | ✅ OK |
| stockRequests.ts | PATCH | /:id/approve-finance | authenticated | N/A | Yes | ✅ OK |
| stockRequests.ts | PATCH | /:id/reject | authenticated | N/A | Yes | ✅ OK |
| stockRequests.ts | PATCH | /:id/recall | authenticated | N/A | No | ✅ OK |
| stockRequests.ts | DELETE | /:id | authenticated | N/A | Yes | ✅ OK |
| stockTransfers.ts | GET | / | authenticated | N/A | No | ✅ OK |
| stockTransfers.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| stockTransfers.ts | POST | / | authenticated | N/A | No | ✅ OK |
| stockTransfers.ts | PATCH | /:id | admin | admin | No | ✅ OK |
| stockTransfers.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| stockWriteOffs.ts | GET | / | authenticated | N/A | No | ✅ OK |
| stockWriteOffs.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| stockWriteOffs.ts | POST | / | authenticated | N/A | No | ✅ OK |
| stockWriteOffs.ts | PATCH | /:id/approve | admin | admin | Yes | ✅ OK |
| stockWriteOffs.ts | PATCH | /:id/reject | admin | admin | Yes | ✅ OK |
| supplierPayments.ts | GET | / | authenticated | N/A | Yes | ✅ OK |
| supplierPayments.ts | GET | /:id | authenticated | N/A | Yes | ✅ OK |
| supplierPayments.ts | GET | /invoice/:invoiceId | authenticated | N/A | Yes | ✅ OK |
| supplierPayments.ts | GET | /supplier/:supplierId | authenticated | N/A | Yes | ✅ OK |
| supplierPayments.ts | POST | / | authenticated | N/A | Yes | ✅ OK |
| supplierPayments.ts | PATCH | /:id/cancel | authenticated | N/A | Yes | ✅ OK |
| suppliers.ts | GET | / | public | N/A | No | ✅ OK |
| suppliers.ts | GET | /:id | public | N/A | No | ✅ OK |
| suppliers.ts | POST | / | admin | admin | No | ✅ OK |
| suppliers.ts | PUT | /:id | admin | admin | No | ✅ OK |
| suppliers.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| suppliers.ts | POST | /:id/purchase-orders | admin | admin | No | ✅ OK |
| suppliers.ts | PATCH | /:id/purchase-orders/:poId/receive | admin | admin | No | ✅ OK |
| suppliers.ts | GET | /:id/purchase-orders | public | N/A | No | ✅ OK |
| tables.ts | GET | / | public | N/A | No | ✅ OK |
| tables.ts | GET | /summary | public | N/A | No | ✅ OK |
| tables.ts | GET | /:id | public | N/A | No | ✅ OK |
| tables.ts | POST | / | public | N/A | No | ✅ OK |
| tables.ts | PUT | /:id | public | N/A | No | ✅ OK |
| tables.ts | PATCH | /:id/status | public | N/A | No | ✅ OK |
| tables.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| tables.ts | GET | /summary | public | N/A | No | ✅ OK |
| userPreferences.ts | GET | / | authenticated | N/A | Yes | ✅ OK |
| userPreferences.ts | PUT | / | authenticated | N/A | Yes | ✅ OK |
| users.ts | GET | / | admin | admin | Yes | ✅ OK |
| users.ts | GET | /:id | admin | admin | Yes | ✅ OK |
| users.ts | POST | / | admin | admin | Yes | ✅ OK |
| users.ts | PUT | /:id | admin | admin | Yes | ✅ OK |
| users.ts | PATCH | /:id/password | authenticated | N/A | Yes | ✅ OK |
| users.ts | PATCH | /:id/status | admin | admin | Yes | ✅ OK |
| users.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| vouchers.ts | GET | / | authenticated | N/A | No | ✅ OK |
| vouchers.ts | GET | /:id | authenticated | N/A | No | ✅ OK |
| vouchers.ts | POST | /validate | authenticated | N/A | No | ✅ OK |
| vouchers.ts | POST | / | admin | admin | No | ✅ OK |
| vouchers.ts | PUT | /:id | admin | admin | No | ✅ OK |
| vouchers.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |
| vouchers.ts | PATCH | /:id/toggle-active | admin | admin | No | ✅ OK |
| vouchers.ts | POST | /:id/use | authenticated | N/A | No | ✅ OK |
| warehouses.ts | GET | / | authenticated | N/A | No | ✅ OK |
| warehouses.ts | GET | /:id | public | N/A | No | ✅ OK |
| warehouses.ts | POST | / | public | N/A | No | ✅ OK |
| warehouses.ts | PUT | /:id | public | N/A | No | ✅ OK |
| warehouses.ts | DELETE | /:id | admin | admin | Yes | ✅ OK |

## Frontend Pages

| File | Route | Auth Check | Role Check | Access Level | Sensitive | Status |
|------|-------|------------|------------|--------------|-----------|--------|
| page.tsx | /admin\attendance | Yes | Yes | role-based | Yes | ✅ OK |
| page.tsx | /admin\crm | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /admin\discount-reports | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /admin\hr | Yes | Yes | role-based | Yes | ✅ OK |
| page.tsx | /admin\modules | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /admin\outlets | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /admin | No | No | authenticated | Yes | ✅ OK |
| page.tsx | /admin\products | No | No | authenticated | Yes | ✅ OK |
| page.tsx | /admin\promotions | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /admin\reports | Yes | Yes | role-based | Yes | ✅ OK |
| page.tsx | /admin\settings | Yes | Yes | role-based | Yes | ✅ OK |
| page.tsx | /admin\vouchers | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /apps | Yes | No | authenticated | No | ✅ OK |
| page.tsx | /finance\ocr | Yes | Yes | role-based | Yes | ✅ OK |
| page.tsx | /inventory\goods-received-notes | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /inventory\invoices | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /inventory | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /inventory\purchase-orders | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /inventory\quotation-requests | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /inventory\quotations | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /inventory\stock-approvals | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /inventory\supplier-payments | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /inventory-suppliers | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /kasir | Yes | No | authenticated | No | ✅ OK |
| page.tsx | /kitchen | No | No | public | No | ✅ OK |
| page.tsx | /login | Yes | No | authenticated | No | ✅ OK |
| page.tsx | /online-order | Yes | No | authenticated | No | ✅ OK |
| page.tsx | /order\[tableId] | No | No | public | No | ✅ OK |
| page.tsx | /order-status\[orderId] | No | No | authenticated | No | ✅ OK |
| page.tsx | / | Yes | No | authenticated | No | ✅ OK |
| page.tsx | /pos\meja | No | No | public | No | ✅ OK |
| page.tsx | /pos | Yes | Yes | role-based | No | ✅ OK |
| page.tsx | /pos\requests | Yes | No | authenticated | No | ✅ OK |
| page.tsx | /pos\settings | Yes | No | authenticated | Yes | ✅ OK |
| page.tsx | /shift | Yes | No | authenticated | No | ✅ OK |
| page.tsx | /waiter | Yes | No | authenticated | No | ✅ OK |

## Critical Issues

## Findings Analysis

### Role Support Analysis

**Current Role Support:**
- Backend middleware supports: `admin`, `cashier`
- Frontend AuthContext supports: `admin`, `management`, `cashier`, `owner`
- **Inconsistency:** Backend does not support `management` and `owner` roles

## Recommendations

### Critical Fixes (Immediate)

1. **Add authentication to all sensitive backend routes**
   - Add `authMiddleware` to all DELETE routes
   - Add `authMiddleware` to user management routes (GET, POST, PUT, PATCH)
   - Add `authMiddleware` to settings routes
   - Add `authMiddleware` to payment webhook routes

2. **Add authentication to all sensitive frontend pages**
   - Add auth checks to admin pages (discount-reports, outlets, promotions)
   - Add auth checks to inventory-suppliers page
   - Add auth checks to pos/settings page

3. **Fix role inconsistency between backend and frontend**
   - Update backend middleware to support `management` and `owner` roles
   - Update `TokenPayload` type in `server/middleware/auth.ts`
   - Update `requireRole` function to accept all four roles

### High Priority (This Sprint)

1. **Standardize auth patterns across all routes**
   - Ensure all admin-only routes use `requireRole('admin')`
   - Ensure all cashier routes use `requireRole('cashier')`
   - Document which routes should be accessible to which roles

2. **Add role-based UI restrictions to frontend**
   - Implement role checks in admin pages
   - Hide/show UI elements based on user role
   - Add consistent error messages for access denied

3. **Add role checks to user management routes**
   - All user routes should require admin role
   - Prevent privilege escalation

### Medium Priority (Next Sprint)

1. **Implement fine-grained permissions**
   - Use the Permission and RolePermission tables in the database
   - Create permission checking middleware
   - Move beyond simple role-based access control

2. **Add audit logging for access violations**
   - Log all 401 and 403 errors
   - Track which users attempt to access unauthorized resources
   - Create audit reports for security monitoring

3. **Create role management UI**
   - Admin interface to manage roles and permissions
   - UI to assign roles to users
   - UI to view and modify permissions

### Low Priority (Backlog)

1. **Add role-based API rate limiting**
   - Different rate limits for different roles
   - Prevent abuse from lower-privileged users

2. **Implement session-based access controls**
   - Track active sessions
   - Allow users to revoke sessions
   - Implement session timeout

3. **Add IP-based restrictions for admin operations**
   - Restrict admin access to specific IP ranges
   - Add IP whitelisting for sensitive operations

## Test Credentials

The following test users have been created in the seed data:

| Username | Password | Role | Outlet |
|----------|----------|------|--------|
| admin | admin | admin | OUT-001 (Outlet Pusat) |
| cashier1 | cashier123 | cashier | OUT-001 (Outlet Pusat) |
| manager1 | manager123 | management | OUT-002 (Outlet Cabang Senopati) |
| owner1 | owner123 | owner | OUT-003 (Outlet Cabang BSD) |
| admin2 | admin123 | admin | OUT-001 (Outlet Pusat) |

## Testing Instructions

### Multi-Device Testing

To test access control on multiple devices:

1. **Ensure the dev server is accessible on your LAN**
   - Start the dev server: `npm run dev`
   - Find your machine's IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access from other devices: `http://YOUR_IP:3000`

2. **Test with different roles on different devices**
   - Device 1: Login as `admin` - should access all pages
   - Device 2: Login as `cashier1` - should access POS, not admin pages
   - Device 3: Login as `manager1` - should access management pages
   - Device 4: Login as `owner1` - should access all pages

3. **Test specific scenarios**
   - Try accessing admin pages with cashier account (should be denied)
   - Try accessing user management with non-admin account (should be denied)
   - Try accessing settings with non-admin account (should be denied)
   - Verify that public pages (login, order/[tableId]) work without auth

### API Testing

Use the test credentials to test API endpoints:

```bash
# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Use token to access protected route
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

*This report was generated automatically by the route access control audit script.
*For questions or updates, refer to the audit scripts in the `scripts/` directory.
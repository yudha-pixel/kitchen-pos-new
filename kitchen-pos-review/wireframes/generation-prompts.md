# Wireframe generation prompt set

Mode: built-in image generation. Visual grounding: the product owner's Odoo launcher screenshot plus accepted Kitchen POS runtime screenshots. Odoo branding and assets were explicitly excluded.

## 1. App launcher and module dashboard

Create a polished 1440×900 Kitchen POS ERP app launcher using the Odoo reference only for spatial organization. Use a compact top bar, module search, outlet/user context, and a kanban grid with the exact top-level modules Point of Sale, Kitchen Display, Menu & Products, Inventory, Purchase & Suppliers, CRM, Promotions, Attendance, HR & Payroll, Finance, Reports, and Settings. Child menus stay inside modules; POS Back returns to the launcher. Neutral warm white/ink with muted violet accent; no gradients, glassmorphism, copied branding, emoji, or watermark.

## 2. Responsive list/detail workspace

Create a desktop-plus-mobile Inventory list/detail workspace. Desktop uses an Inventory-only rail with All Items, Stock Approvals, Categories, Stock Adjustments, Stock Transfers, Suppliers, and Automation; app-grid returns to the launcher. Preserve KPI row, search/filter/action bar, dense table, selected detail panel, audit timeline, and Save/Cancel. Mobile uses stacked rows and a full-screen detail sheet without page-level horizontal overflow. No cross-module sidebar.

## 3. Layered settings and theme manager

Create a 1440×900 settings workspace with Organization, Outlets, Kitchen Stations, POS Terminals, Users & Devices, Appearance, and Integrations. Show the exact precedence “Organization default → Outlet override → User / device preference”, source badges, inheritance/reset, POS/ERP previews, sticky Save/Cancel, and an application-owned confirmation modal. Neutral semantic tokens, accessible focus/contrast; no native browser alert, gradients, glassmorphism, or copied branding.

## 4. Trusted internal module manager

Create a 1440×900 trusted-internal module manager—not a marketplace. Use a System Administration-only rail with Overview, Internal Modules, Roles & Permissions, Audit Logs, System Health, and Configuration; app-grid returns to the launcher. Show compatibility, dependencies, permissions/capabilities, settings scope, migrations, health, failure isolation, rollback, and a dependency-aware Disable module AlertDialog. No cross-module sidebar, ratings, public installs, or watermark.

## Correction pass

Wireframes 2 and 4 were edited after independent review to remove mixed global ERP navigation. All other visual content was preserved while their rails became strictly module-scoped.

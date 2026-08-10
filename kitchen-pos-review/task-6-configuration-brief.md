# Task 6: Organization, settings, and theme audit

Audit `/admin/outlets`, `/pos/settings`, and every tab of `/admin/settings` at all six required viewports. Exercise outlet list/create/edit/delete confirmation; primary color, light/dark, card style, density, card/list, cart position, preview/save/reload; and Store, Receipt, Shift, Tables & Area, Users, Kitchen, Inventory, and Security settings.

Validate the intended precedence `organization default → outlet override → user/device preference` against actual behavior, including reload, new session, outlet switching, and offline/cache conditions. Create only records prefixed `UXR-20260810-0141-config-*`; record every changed setting and its original value so it can be restored.

Apply screenshot-first Product Design audit, UI/UX Pro Max, Baseline UI, and fixing-accessibility. Check console/network errors, token coverage, raw-color leakage, contrast, responsive forms/tables/previews, focus/labels/errors, destructive confirmation, and settings ownership clarity.

Do not modify source or Git state. Save screenshots under `screenshots\task-6` and report to `module-reports\task-6-configuration.md`, with matrix, numbered evidence, strengths, P0-P3 findings, setting-change ledger/restoration, limits/skips, and source/Git confirmation.

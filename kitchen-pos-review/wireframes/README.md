# Kitchen POS ERP target-state wireframes

These are architecture/design recommendations, not implemented screens. They are grounded in the current Kitchen POS audit captures and the product owner's Odoo-style launcher reference, without copying Odoo branding or assets.

Generation mode and prompt set: [generation-prompts.md](./generation-prompts.md).

1. `01-app-launcher-module-dashboard.png` — searchable `/apps` launcher. Point of Sale, Kitchen Display, Menu & Products, Attendance, and HR & Payroll are distinct top-level modules. Child menus remain inside each module.
2. `02-responsive-list-detail.png` — reusable ERP list/detail workspace. Desktop uses a scoped rail, table, and details panel; mobile uses stacked rows and a full-screen sheet without page-level horizontal overflow.
3. `03-layered-settings-theme-manager.png` — explicit configuration precedence: organization default → outlet override → user/device preference. It demonstrates inheritance, reset, preview, and an application-owned confirmation modal.
4. `04-trusted-internal-module-manager.png` — trusted internal modules only. It visualizes compatibility, dependencies, permissions, settings scope, migrations, health, failure isolation, and rollback-aware disable flow.

## Interaction decisions

- `/pos` Back is deterministic and returns to `/apps`, not browser history.
- POS and KDS retain specialized operational layouts after module launch.
- Browser-native `alert()` and `confirm()` are prohibited; use accessible application dialogs and inline/announced validation.
- The module manager is an internal administration concept, not a public marketplace.

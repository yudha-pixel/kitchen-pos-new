# Permission Catalog

`../../../src/config/permissions.ts` is the single catalog. Permission identifiers use lowercase `module.action` names. Ordinary resources use `view`, `create`, `edit` or `update`, and `delete`; sensitive workflows use explicit verbs.

| Module | Actions |
|---|---|
| `users` | `view`, `create`, `update`, `delete` |
| `roles` | `view`, `create`, `update`, `delete`, `assign` |
| `products` | `view`, `create`, `edit`, `delete`, `recipes_manage` |
| `orders` | `view`, `create`, `edit`, `delete`, `void`, `refund` |
| `inventory` | `view`, `create`, `edit`, `delete`, `adjust`, `approve`, `transfer` |
| `purchasing` | `view`, `create`, `edit`, `delete`, `receive`, `pay` |
| `crm` | `view`, `create`, `edit`, `delete` |
| `promotions` | `view`, `create`, `edit`, `delete` |
| `attendance` | `view`, `edit`, `delete` |
| `hr` | `view`, `create`, `edit`, `delete` |
| `payroll` | `view`, `create`, `edit`, `approve` |
| `finance` | `view`, `create`, `edit`, `delete`, `approve`, `export` |
| `reports` | `view`, `export` |
| `settings` | `view`, `edit`, `reset`, `security_edit` |
| `outlets` | `view`, `create`, `edit`, `delete` |
| `modules` | `view`, `manage` |
| `kitchen` | `view`, `manage` |
| `tables` | `view`, `create`, `edit`, `delete` |
| `backup` | `view`, `create`, `restore`, `delete` |
| `audit` | `view` |
| `printing` | `use`, `manage` |
| `approvals` | `view`, `create`, `edit`, `delete`, `approve` |

Add a capability only through the catalog. Use the exported `PermissionName` type in navigation and middleware. Do not introduce role-name bypasses or ad-hoc permission strings.


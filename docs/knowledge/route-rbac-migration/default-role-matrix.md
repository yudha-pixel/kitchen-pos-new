# Default System-Role Matrix

The synchronizer changes only the four system roles below. Custom roles are never auto-granted or stripped.

| Role | Default capabilities |
|---|---|
| `admin` | every catalog capability |
| `owner` | every catalog capability |
| `management` | every normal operational capability except the exclusions below |
| `cashier` | `products.view`, `orders.view`, `orders.create`, `orders.edit`, `tables.view`, `tables.edit`, `printing.use`, `reports.view` |

Management exclusions:

- every `roles.*` capability
- `users.delete`
- `modules.manage`
- `settings.security_edit`
- `orders.void`
- `orders.refund`
- every capability ending in `.approve`
- `backup.restore`
- `backup.delete`

The matrix is generated from `DEFAULT_ROLE_PERMISSIONS`; it is not duplicated in seed logic. A role label never implies these rights at request time—the database assignments do.


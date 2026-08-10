# Permission System

The Kitchen POS backend uses a role-based access control (RBAC) layer with permissions stored in the database. This replaces the previous hardcoded `requireRole('admin')` checks while still allowing `requireRole` to be used as a convenience wrapper.

## Permission Naming

Use the `{module}.{action}` format:

- `users.view`
- `users.create`
- `users.update`
- `users.delete`
- `settings.view`
- `settings.edit`
- `products.view`
- `orders.create`

## Middleware API

Import from `server/middleware/permissions`:

```typescript
import { requirePermission, requireAnyPermission, requireAllPermissions } from '../middleware/permissions';

router.get('/users', authMiddleware, requirePermission('users.view'), handler);
router.delete('/users/:id', authMiddleware, requirePermission('users.delete'), handler);
router.post('/settings', authMiddleware, requireAnyPermission('settings.edit', 'settings.approve'), handler);
```

## How It Works

- `authMiddleware` decodes the JWT, fetches the user's role, and attaches `req.userPermissions`.
- `requirePermission` checks that the permission is in `req.userPermissions`.
- `requireAnyPermission` and `requireAllPermissions` support multiple permission checks.
- Missing permissions are denied with `403 Forbidden` and logged as structured `permission_denial` warnings.

## Caching

Role permissions are cached in memory using an `lru-cache` with a 60-second TTL. The cache is keyed by `role_permissions:${roleId}`. Use `clearRolePermissionsCache(roleId?)` to invalidate after role/permission changes.

## Migrated Routes

- `server/routes/users.ts` now uses `users.view`, `users.create`, `users.update`, and `users.delete`.
- `server/routes/settings.ts` now uses `settings.view` and `settings.edit`.
- `server/routes/roles.ts` invalidates the cache on permission assignment/removal.

## Enabling for Existing Databases

If the `users.*` permissions are missing in an existing database, run the idempotent helper script:

```bash
npx tsx server/prisma/ensure-permissions.ts
```

The `POST /auth/login` response now includes `role_id` and `permissions`, and `GET /auth/permissions` returns the current user's permissions.

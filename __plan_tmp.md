# Permission-Based Middleware Implementation Plan

This plan implements a production-grade permission-based authorization system that replaces hardcoded role checks with dynamic database-driven permissions, following industry best practices for RBAC + ABAC combination patterns.

## Research-Based Recommendations

Based on industry research (2026 best practices), the following approach is recommended:

**Caching Strategy:**
- Use in-memory LRU cache with 60-second TTL for permission sets
- Cache role-to-permission mappings (changes rarely)
- Add Redis layer only if multiple processes need consistency
- Short TTL ensures security while providing performance benefits

**Architecture Pattern:**
- RBAC as coarse filter (fast, in-memory, cached)
- ABAC as fine-grained check (dynamic, contextual) - optional future enhancement
- Composable middleware that can be applied to any route
- Fail-closed by default (deny if no permissions defined)

**Migration Strategy:**
- Gradual migration with backward compatibility
- Keep existing `requireRole()` as convenience wrapper
- New `requirePermission()` middleware for fine-grained control
- Support both patterns during transition period

## Implementation Scope

**In Scope:**
- Permission-based middleware using database permissions
- In-memory LRU caching for performance
- Migration of critical routes to permission-based checks
- API endpoint to expose user permissions to frontend
- Updated audit scripts to detect permission-based middleware
- Comprehensive testing

**Out of Scope:**
- ABAC policies (resource-level ownership checks)
- Admin UI for permission management
- Redis distributed caching (unless needed for multi-process)
- Frontend permission-based UI controls (separate task)

## Implementation Steps

### Phase 1: Permission Middleware Core

**File: `server/middleware/permissions.ts`**

1. Create permission caching layer:
   - Use `lru-cache` library for in-memory caching
   - Cache key: `role_permissions:${roleId}`
   - TTL: 60 seconds
   - Max size: 1000 entries

2. Implement permission lookup:
   - Query database for role-permission mappings
   - Cache results to avoid repeated DB calls
   - Handle cache misses gracefully

3. Create middleware functions:
   - `requirePermission(permission)` - requires single permission
   - `requireAnyPermission(...permissions)` - requires at least one
   - `requireAllPermissions(...permissions)` - requires all permissions
   - Each checks user's role against cached permissions

4. Add Express type augmentation:
   - Extend Request interface with `userPermissions` array
   - Populate during authentication middleware

### Phase 2: Authentication Middleware Update

**File: `server/middleware/auth.ts`**

1. Update `authMiddleware` to:
   - Fetch user's role from database
   - Load role permissions using permission cache
   - Attach `userPermissions` to request object
   - Cache permissions per session

2. Add permission cache invalidation:
   - Provide function to clear cache on role/permission changes
   - Call from admin routes that modify permissions

### Phase 3: Route Migration

**Migration Priority:**

1. **Critical routes (immediate):**
   - User management routes (`users.ts`)
   - Settings routes (`settings.ts`)
   - DELETE routes for sensitive operations

2. **High-priority routes:**
   - Products management
   - Orders management
   - Inventory management

3. **Medium-priority routes:**
   - Reports and analytics
   - Configuration endpoints

**Migration Pattern:**
```typescript
// Before
router.get('/users', authMiddleware, requireRole('admin'), handler)

// After
router.get('/users', authMiddleware, requirePermission('users.view'), handler)
```

### Phase 4: Frontend Integration

**File: `server/routes/auth.ts`**

1. Add endpoint: `GET /api/auth/permissions`
   - Returns current user's permissions array
   - Requires authentication
   - Cache at frontend level

2. Update login response:
   - Include permissions in login response
   - Store in frontend auth context

### Phase 5: Testing

**File: `server/__tests__/permissions.test.ts`**

1. Test permission middleware:
   - Test `requirePermission` with valid/invalid permissions
   - Test `requireAnyPermission` with multiple options
   - Test `requireAllPermissions` with partial/complete sets
   - Test cache behavior (hit/miss/invalidation)

2. Test permission-based routes:
   - Test access with different roles
   - Test permission changes take effect
   - Test fallback behavior for undefined permissions

3. Integration tests:
   - Test full request flow with permissions
   - Test concurrent requests with cache
   - Test cache invalidation

### Phase 6: Documentation & Audit

**Files to Update:**

1. Update audit scripts:
   - `scripts/audit-routes.ts` - detect `requirePermission` usage
   - Update to recognize permission-based middleware

2. Update comprehensive report:
   - Add permission-based access section
   - Document migration progress

3. Create documentation:
   - `docs/PERMISSIONS.md` - permission system guide
   - Include migration guide for developers
   - Document permission naming conventions

## Technical Specifications

### Permission Naming Convention

Format: `{module}.{action}`

Examples:
- `users.view` - View user list
- `users.create` - Create new user
- `users.update` - Update user details
- `users.delete` - Delete user
- `products.view` - View products
- `products.create` - Create product
- `orders.view` - View orders
- `orders.create` - Create order
- `settings.update` - Update settings

### Cache Configuration

```typescript
import LRU from 'lru-cache';

const permissionCache = new LRU<string, string[]>({
  max: 1000,              // Maximum 1000 role permission sets
  ttl: 60 * 1000,         // 60 seconds TTL
  allowStale: false,      // Don't serve stale data
  updateAgeOnGet: true,   // Refresh TTL on access
});
```

### Middleware API

```typescript
// Require single permission
router.get('/users', requirePermission('users.view'), handler)

// Require any of multiple permissions
router.delete('/users/:id', requireAnyPermission('users.delete', 'users.manage'), handler)

// Require all permissions
router.post('/settings', requireAllPermissions('settings.update', 'settings.approve'), handler)
```

### Fallback Behavior

- If user has no permissions defined: **Deny access** (secure by default)
- If permission cache fails: **Fallback to database query** (degraded mode)
- If database query fails: **Deny access** (fail-closed)

## Performance Considerations

**Expected Performance Impact:**
- Cache hit: < 1ms (in-memory lookup)
- Cache miss: ~5-10ms (database query + cache fill)
- Overall impact: Negligible for most routes

**Cache Statistics to Monitor:**
- Hit rate (target: >80%)
- Cache size
- Cache invalidation frequency
- Database query count for permissions

## Security Considerations

**Fail-Closed Policy:**
- All permission checks default to deny
- No permissions = no access
- Cache failures = deny access

**Audit Logging:**
- Log all permission denials with context
- Include: userId, permission, resource, timestamp
- Use structured logging for analysis

**Permission Changes:**
- Cache invalidation on role/permission updates
- Short TTL (60s) limits window of stale permissions
- Consider event-driven invalidation for critical systems

## Rollback Plan

If issues arise:
1. Revert route migrations to use `requireRole()`
2. Disable permission middleware
3. Keep database schema (no breaking changes)
4. Document rollback procedure

## Success Criteria

1. All critical routes use permission-based checks
2. Permission cache hit rate >80%
3. No performance degradation (>5ms overhead)
4. All tests pass (unit + integration)
5. Audit scripts detect permission-based middleware
6. Documentation complete and accurate

## Estimated Timeline

- Phase 1: 2-3 hours
- Phase 2: 1-2 hours
- Phase 3: 4-6 hours (gradual migration)
- Phase 4: 1-2 hours
- Phase 5: 2-3 hours
- Phase 6: 1-2 hours

**Total: 11-18 hours**

## Dependencies

- `lru-cache` - In-memory caching (already in dependencies)
- Existing Prisma schema (no changes needed)
- Existing role/permission tables (already seeded)

## Risks & Mitigations

**Risk:** Cache stampede on cold start
**Mitigation:** Warm cache on server startup with common roles

**Risk:** Stale permissions after role changes
**Mitigation:** Short TTL (60s) + explicit invalidation on changes

**Risk:** Performance regression
**Mitigation:** Monitor cache hit rate, adjust TTL if needed

**Risk:** Breaking existing functionality
**Mitigation:** Gradual migration, keep role-based middleware as fallback

# Authentication and Authorization Flow

1. `POST /auth/login` validates the active profile and password.
2. The response contains a JWT plus `user = { id, username, role_id, role, permissions }`.
3. `GET /auth/me` returns the same user shape.
4. For every protected request, `authMiddleware` verifies the JWT, then reloads the current active profile, current role assignment, and that role's permissions from PostgreSQL.
5. JWT `role` and `role_id` fields are compatibility claims only. They do not authorize the request.
6. `requirePermission(...)` makes the server decision and logs denials. Missing/invalid/inactive authentication returns 401; an authenticated profile lacking the capability returns 403.
7. Role-permission assignment and removal clear the affected role cache. The cache is keyed by database role ID and has a bounded lifetime.
8. `AuthContext` refreshes through `/auth/me`, exposes `can(permission)`, filters launcher/sidebar entries, and renders loading, unauthenticated, or forbidden route states.

Client visibility is not security. A stale or incorrect client may display an action, but the server still denies it. Conversely, a custom role with the required database capability is allowed regardless of its name, and an `admin`-named role without that capability is denied.

The permission synchronizer supports report-only `--dry-run` and idempotent apply modes. It reconciles catalog permissions and system-role defaults while preserving custom-role assignments. Never run apply mode against production without separate authorization.


# Business Routes and Capability RBAC

This package is the durable architecture reference for the 2026-08-12 migration. It supersedes historical descriptions that treat `/admin` as a role boundary.

The central rules are:

- UI routes are organized by business ownership, not by role name.
- Role names are unrestricted database labels used for display and grouping only.
- Authorization is based on database assignments of `module.action` capabilities.
- The server is authoritative. Client guards improve navigation and forbidden-page UX but do not grant access.
- Business APIs remain under `/api/...`; authentication remains under `/auth/...`; health remains `/health`.

References:

- [Route map](route-map.md)
- [Permission catalog](permission-catalog.md)
- [Default role matrix](default-role-matrix.md)
- [Authorization flow](authorization-flow.md)
- Execution record: `../../handover/route-rbac-migration/HANDOVER.md`


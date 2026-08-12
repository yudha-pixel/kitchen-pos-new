# Remaining Risks

1. Browser runtime UX was not verified because browser automation and Playwright were explicitly excluded.
2. Production deployment, production database backfill, external bookmarks in real clients, and reverse-proxy redirect behavior remain unverified.
3. The permission synchronization was applied only to local `localhost:5432/kitchen_pos`; every other environment requires an authorized dry run and review before apply.
4. Custom roles are intentionally not auto-granted. Operators must assign new capabilities deliberately or those users will receive 403 responses.
5. Permission cache invalidation is implemented for role-permission mutation routes. Direct out-of-band database edits can remain cached until the bounded cache lifetime expires or the process cache is cleared.
6. Historical documentation contains `/admin/...`, `allowedRoles`, and old role-based explanations. Those files are evidence archives, not active contracts; use `../../knowledge/route-rbac-migration` as current architecture.
7. The Vite config emits a non-failing warning about ESM syntax loaded as CommonJS.
8. The repository already contained unrelated modified and staged files before this migration. Review must separate migration changes from those pre-existing edits; Git state was not altered.


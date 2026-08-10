# Trusted internal plugin readiness

## Recommendation

Adopt a trusted internal module/plugin contract after shared configuration, authorization, navigation, migration, and failure-handling foundations exist. The current repository has feature folders and route groups, but it is not yet a safe plugin platform. This recommendation does not claim a public marketplace, third-party sandbox, or untrusted-code execution model.

## Current readiness

| Area | Evidence | Assessment |
|---|---|---|
| Module organization | `src/features/*`, `server/routes/*`, and App Router pages | Partial: useful feature grouping, but pages, menus, settings, roles, and routes are registered manually. |
| Navigation | `src/components/layout/Sidebar.tsx` | Not ready: fixed global arrays, duplicate destinations, missing capability filtering, and no `/apps` catalog. |
| Authorization | `prisma/schema.prisma:34-73`; `server/middleware/auth.ts:36-44` | Not ready: permission model exists, but runtime enforcement is primarily literal roles. |
| Settings | `AppSettings` at `prisma/schema.prisma:376-439`; `server/routes/settings.ts` | Not ready: singleton mixed-domain record; no module schema registry or decided ownership precedence. |
| API extension | `server/app.ts` route mounting; `src/lib/api.ts` and repeated service-local API bases | Partial: clear Express routes, but no registered extension points or typed service boundary. |
| Migrations | `prisma/migrations/*` | Partial: migration mechanism exists, but plugin enable/disable and rollback contracts do not. |
| Failure isolation | Shared process, shared Prisma client, global providers | Not ready: a module can break startup, navigation, or shared settings; no health/degraded-mode contract. |
| UI primitives | `src/components/ui/*`; module reports 3-6 | Partial: primitives exist, but raw `alert()`/`confirm()`, browser validation bubbles, and non-semantic overlays remain. |

## Exact trusted-plugin contract

Every trusted internal plugin manifest and implementation review must cover exactly these fields:

| Contract field | Required meaning |
|---|---|
| module identifier | Stable, unique, immutable machine identifier used by capabilities, settings, navigation, migrations, and audit events. |
| module version | SemVer-compatible installed version with upgrade ordering. |
| application compatibility | Explicit supported host application/version range. |
| dependencies | Required and optional module identifiers with compatible version ranges; cycles rejected. |
| enable/disable lifecycle | Idempotent hooks, preconditions, retained-data policy, and behavior while disabled. |
| routes | Declared client and server routes, collision detection, authentication class, and module ownership. |
| navigation entries | Launcher tile and module-scoped child-menu declarations with labels, icons, search terms, order, and required capability. |
| modern-rail placement | Optional placement metadata for the approved active-module modern rail; never a second global navigation registry. |
| permissions | Stable capability identifiers, labels, risk level, and intended role templates. |
| server-side capability enforcement | Route/service enforcement mapping proving every privileged operation checks the declared capability and scope. |
| settings schemas | Versioned typed schema, validation, defaults, secret classification, and UI metadata. |
| settings ownership scope | Allowed scope per field: organization default, outlet override, or user/device display preference; business fields cannot be user/device overrides. |
| API/service extension points | Named, typed, versioned hooks/services with timeouts and error contracts; no direct imports into another module's internals. |
| database migrations | Ordered forward migrations, data backfill, compatibility window, and ownership of tables/columns/indexes. |
| rollback requirements | Code/data rollback boundary, irreversible-step declaration, backup prerequisite, and recovery runbook. |
| health checks | Module readiness, dependency, migration, provider, and degraded-state signals exposed to operators. |
| failure isolation | Startup quarantine, route-level error boundaries, background-job isolation, timeout/circuit-break behavior, and safe disable path. |

## Architecture rules

- Core loads only manifests that pass schema, compatibility, dependency, route-collision, permission, and migration checks.
- `/apps` is generated from enabled manifests and effective capabilities. Module child menus are generated only inside the active module shell.
- The server owns module enablement and capabilities. Client manifest data is presentation metadata, not authority.
- Plugins consume shared auth, configuration resolution, audit, modal, notification, formatting, and error primitives; they do not create parallel foundations.
- Native `alert()` and `confirm()` are prohibited. Destructive actions use the shared accessible `AlertDialog`; editable workflows use the shared Dialog/form-error contract.
- A disabled or unhealthy module cannot prevent authentication, `/apps`, settings recovery, audit access, or unrelated modules from operating.
- Database ownership is additive and explicit. Cross-module reads use typed services or approved reporting projections rather than undocumented table coupling.

## Readiness gates

1. Capability-based server enforcement and role migration are complete.
2. `/apps`, module shells, and the navigation registry are live.
3. Scoped settings resolver implements organization -> outlet -> user/device display precedence.
4. Shared accessible Dialog/AlertDialog, errors, formatting, audit, and offline-state primitives are adopted.
5. Module manifest validation, migration orchestration, health registry, and failure quarantine have automated tests.
6. At least one low-risk internal module is extracted and disabled/enabled/rolled back in a disposable environment without affecting core.

## Validation scenarios

- Reject incompatible version, missing dependency, dependency cycle, duplicate route, duplicate capability, and invalid settings scope.
- Enable/disable is idempotent; disabled routes return a controlled unavailable state and disappear from `/apps`.
- A plugin exception is contained by its route/job boundary; `/apps` and unrelated modules remain usable.
- Failed migration blocks only the plugin and exposes health/recovery details; rollback requirements are followed.
- Permission checks agree across launcher, child menu, direct URL, API, service, and audit log.
- Organization/outlet/user-device settings resolve deterministically online, after reload, and under defined offline-cache rules.


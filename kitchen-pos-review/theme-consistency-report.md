# Theme consistency report

## Outcome

The project has a useful semantic-token foundation, but theme application is partial and unreliable. The current implementation is not ready to promise organization/outlet/device precedence, consistent dark mode, or module-wide accent propagation.

## Confirmed foundation

- `app/globals.css` defines semantic surface, border, text, state, primary, and KDS tokens and exposes them through Tailwind v4 `@theme` mappings.
- The global stylesheet provides visible `:focus-visible`, reduced-motion handling, touch manipulation, and tabular-number support.
- `src/context/ThemeContext.tsx:50-94` applies light/dark mode, named accent RGB, card radius, density, card view, and cart position.
- `/pos/settings` previews accent, theme, card shape, density, layout, and cart placement immediately. Browser evidence is recorded in `module-reports/task-6-configuration.md`, screenshots 25-27.
- KDS has a deliberate dark token scope through `[data-theme="kds"]`.

## Confirmed inconsistencies

| Area | Evidence | Finding |
|---|---|---|
| Persistence | `module-reports/task-6-configuration.md`, P1-1 and screenshots 25-27 | Theme preview changed locally, Save failed, and reload restored Blue/Light/Rounded/Spacious/Grid/Right Sidebar. |
| Ownership | `prisma/schema.prisma:376-439`; `server/routes/settings.ts`; `src/features/outlet/outletStore.ts:21-57` | One global `AppSettings` row is fetched with `findFirst`; outlet selection stores only local context. The approved precedence is absent. |
| Raw-color leakage | `app/globals.css` overrides selected blue utility classes with `!important`; many pages still use `gray-*`, `green-*`, `indigo-*`, `orange-*`, raw chart hex, and inline colors | Accent/theme changes cannot consistently propagate and dark mode is vulnerable to unreadable fixed light surfaces. |
| Component leakage | `src/components/outlet/OutletSelector.tsx` | `bg-white`, gray text, and local shadow bypass semantic tokens. |
| Selection semantics | `module-reports/task-6-configuration.md`, P2-2 | Theme choices communicate selection by border/check only; no `aria-pressed`, radio group, or selected state is exposed. |
| Focus vs accent | Same P2-2 evidence | Accent-selection chrome remains blue even when Violet is previewed, conflating brand accent, selection, and focus. |
| Motion | `app/globals.css` | `.sheet-up` is 250 ms while the supplied Baseline UI contract limits interaction feedback to 200 ms; sidebar uses `transition-all`. |
| Responsive settings | Task 6 screenshots 03, 06, 09, 12, 15, 18 and 40-55 | Desktop is coherent; mobile/tablet forms, tables, and fixed sidebar do not reliably reflow. |
| Theme scope feedback | Task 6 P2-4 | Save errors do not state cause, ownership scope, effective value, retry path, or preserved dirty state. |

## Risks requiring runtime verification

- Complete contrast coverage for every raw-color component in light, dark, and KDS scopes was not certified.
- Theme behavior in a clean second session, offline cache, synchronization conflicts, and non-admin roles was not fully exercised.
- `!important` blue remapping may create component-specific hover, pressed, disabled, and dark-mode regressions that static inspection cannot enumerate exhaustively.

## Recommended target

1. Define one semantic token contract for surfaces, content, borders, focus, selection, statuses, charts, typography, spacing, radius, elevation, and motion.
2. Apply the approved precedence: organization default, optional outlet override, then user/device preference for display-safe fields only.
3. Return a typed effective-theme payload containing value, source scope, source ID, revision, and allowed overrides.
4. Replace raw utility colors and inline hex values module by module. Status and chart palettes remain semantic and contrast-tested rather than inheriting the brand accent blindly.
5. Remove global utility-class `!important` remapping after consumers use semantic classes.
6. Use radio-group or `aria-pressed` semantics for single-choice theme options; keep focus and selection visually distinct in every accent.
7. Persist dirty state on failure and show action-local cause, Retry, ownership scope, and saved/effective confirmation.
8. Keep KDS a distinct high-contrast operational theme while sharing the same semantic token vocabulary.

## Test dimensions

- Viewports: 360x800, 768x1024, 1024x768, 1366x768, 1440x900, 1920x1080.
- Modes: light, dark, KDS; every supported accent; compact/spacious; rounded/sharp; grid/list/minimalist; right sidebar/floating drawer.
- States: default, hover, active, focus-visible, selected, disabled, loading, success, warning, danger, offline, and save failure.
- Scope: organization-only; outlet inherit/override/reset; user/device preference; outlet switch; reload; clean session; cache/offline/conflict.
- Accessibility: 4.5:1 body contrast, 3:1 non-text/focus indicators where applicable, keyboard order, selected-state announcements, reduced motion, 200% zoom, and no color-only meaning.


# Task 1: Access and shell audit

Audit `http://localhost:3000` using the Codex in-app browser. Source repository is `D:\Project\MyProject\kitchen-pos-new`.

## Routes and states

- `/`: landing behavior and relationship to the ERP product.
- `/login`: default, validation/error, password visibility, loading, keyboard order.
- `/admin`: redirect behavior and any shell flash.
- Authenticated shell: header, outlet selector, sidebar expanded/collapsed, POS/Dashboard/Finance groups, logout affordance, active states, back navigation.
- `/customers`: follow the advertised sidebar destination and record the result.
- Direct URL access before and after login.

## Required viewports

Capture every route/state at `360x800`, `768x1024`, `1024x768`, `1366x768`, `1440x900`, and `1920x1080`. Deep interaction checks are required at `360x800`, `768x1024`, and `1366x768`.

## Standards

Apply the screenshot-first Product Design audit workflow, UI/UX Pro Max review criteria, Baseline UI rules, and fixing-accessibility rules. Inspect every accepted screenshot. Check console errors, page overflow, contained scrolling, reachable controls, 44x44 touch targets, keyboard/focus, labels/ARIA, contrast risks, reduced motion, and clear loading/error/permission states. Do not claim full WCAG compliance.

## Constraints

- Do not modify repository/source files or perform any Git write.
- Do not create branches, commits, or staging changes.
- Save screenshots only under `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\screenshots\task-1`.
- Write the complete report to `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\module-reports\task-1-access-shell.md`.
- Local login `admin` / `admin` is authorized for this audit.
- No external submissions or integrations.

## Report contract

Return status `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`. The report must contain: route/state/viewport matrix; numbered screenshot steps; strengths; findings with route/section, role, viewport, theme, reproduction, expected, observed, business impact, P0-P3 severity, root-cause confidence, recommendation, and screenshot path; accessibility evidence limits; console/network errors; skipped states with reasons; and source/Git status confirmation.

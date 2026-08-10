# Task 1 — Access and shell audit

**Status:** DONE_WITH_CONCERNS  
**Audit date:** 2026-08-10 (Asia/Jakarta)  
**Surface:** `http://localhost:3000` in the Codex in-app browser  
**Scope:** landing, login, direct access, `/admin` shell, sidebar navigation, `/customers`, and responsive/accessibility evidence. This is a screenshot-led UI audit, not a security penetration test or full WCAG conformance assessment.

## Executive result

The access and shell experience has release-blocking concerns. The public root is a stock Next.js starter rather than Kitchen POS, and a direct, unauthenticated `/admin` URL visibly renders the management shell and Inventory UI. On mobile the expanded shell creates a horizontally-scrollable, severely compressed main area. `/customers` is a direct-URL 404, while the actual primary Customer/CRM sidebar destination is `/admin/crm`. Rounds 1–2 verify login, password visibility, all required disclosure viewports, and a 1366px authenticated shell on the current served target; Round 2 also confirms an invisible retry action after invalid login.

## Route/state/viewport matrix

`✓` means the state was captured and visually inspected. `—` means the state could not be reached as intended.

| Route or state | 360×800 | 768×1024 | 1024×768 | 1366×768 | 1440×900 | 1920×1080 | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| `/` landing | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Stock Next.js starter, not ERP entry |
| `/login` default | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Form renders |
| `/login` invalid submit/error/retry | ✓ historical | ✓ historical | ✓ historical | ✓ re-verified | ✓ historical | ✓ historical | Values and alert persist, but 2s retry button is visually blank/invisible |
| `/login` password visibility activation | ✓ historical | ✓ historical | ✓ historical | ✓ re-verified | ✓ historical | ✓ historical | Fresh retest retained value, switched to `type=text`, and renamed control |
| `/admin` direct initial shell/redirect flash | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Shell exposed before authentication |
| `/admin` sidebar collapsed | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Collapses; mobile content remains horizontally clipped |
| `/admin` POS/Dashboard/Finance deep interactions | ✓ re-verified | ✓ re-verified | — | ✓ re-verified | — | — | All three expand and show child links at required deep-interaction viewports; missing disclosure ARIA remains |
| `/customers` direct | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Next.js 404 |
| Sidebar `Pelanggan & CRM` destination | — | — | — | ✓ | — | — | `/admin/crm` works, but without auth |
| Authenticated shell after authorized login | unresolved | unresolved | unresolved | ✓ re-verified | unresolved | unresolved | `admin`/`admin` navigated to `/pos`; authenticated header shows `admin` |

All captured layouts had `scrollWidth == clientWidth` at the document level. This does **not** clear the 360px shell: the visible content column itself was compressed and showed a contained horizontal scroll region (screenshots 07/08), which is still a user-facing reflow failure.

## Numbered screenshot steps

1. `01-root-{viewport}.png` — visited `/`; accepted at all six required viewports.
2. `02-login-{viewport}.png` — visited `/login`; accepted at all six required viewports.
3. `03-admin-{viewport}.png` — opened `/admin` directly, before login; accepted at all six required viewports.
4. `04-customers-{viewport}.png` — opened `/customers` directly; accepted at all six required viewports.
5. `05-login-error-{viewport}.png` — entered invalid credentials and submitted; accepted at all six required viewports.
6. `06-login-password-visible-{viewport}.png` — original password-label attempt at all six viewports. These captures are superseded/invalid for behavior conclusions because the ambiguous Password locator could target both the input and eye button; they must not be read as evidence that the toggle failed or cleared values. See exact-locator before/after evidence in `14-retest-login-filled-before-toggle-1366x768.png` and `15-retest-password-toggle-after-1366x768.png`.
7. `07-admin-expanded-{360x800,768x1024,1366x768}.png` — observed the direct-access management shell at deep-interaction viewports.
8. `08-admin-collapsed-{viewport}.png` — activated the sidebar toggle; accepted at all six required viewports.
9. `09-admin-pos-expanded-{360x800,768x1024,1366x768}.png` — activated POS group control.
10. `10-admin-dashboard-expanded-{360x800,768x1024,1366x768}.png` — activated Dashboard group control.
11. `11-admin-finance-expanded-{360x800,768x1024,1366x768}.png` — activated Finance group control.
12. `12-sidebar-crm-destination-1366x768.png` — followed the advertised `Pelanggan & CRM` sidebar destination; it loaded `/admin/crm`.
13. `13-back-target-1366x768.png` — activated `Kembali`; browser-history behavior returned to the previous CRM page, so it is history-dependent rather than an explicit app destination.
14. `14-retest-login-filled-before-toggle-1366x768.png` — fresh exact-locator login state before password-toggle activation: `admin`, masked password, `type=password`, `Tampilkan password`.
15. `15-retest-password-toggle-after-1366x768.png` — fresh exact-locator password-toggle state: value retained, `type=text`, `Sembunyikan password`.
16. `16-retest-valid-login-pos-1366x768.png` — fresh valid `admin`/`admin` submit: successful `/pos` navigation and authenticated header user `admin`.
17. `17-retest-invalid-login-error-1366x768.png` — fresh invalid submit: entered values retained and visible `Invalid username or password` alert.
18. `18-retest-pos-group-expanded-1366x768.png` — POS group after activation, showing child links; `aria-expanded` is absent.
19. `19-retest-dashboard-group-expanded-1366x768.png` — Dashboard group after activation, showing child links; `aria-expanded` is absent.
20. `20-retest-finance-group-expanded-1366x768.png` — Finance group after activation, showing child links; `aria-expanded` is absent.
21. `21-retest-invalid-login-stable-retry-1366x768.png` — invalid-login error remained after two seconds; DOM retained an enabled 384×48 Login submit button, but its transparent background and white text made the retry action visually blank/invisible.
22. `22-retest-pos-group-expanded-360x800.png` — POS group after activation at the required phone viewport, showing child links.
23. `23-retest-dashboard-group-expanded-360x800.png` — Dashboard group after activation at the required phone viewport, showing child links.
24. `24-retest-finance-group-expanded-360x800.png` — Finance group after activation at the required phone viewport, showing child links.
25. `25-retest-pos-group-expanded-768x1024.png` — POS group after activation at the required tablet viewport, showing child links.
26. `26-retest-dashboard-group-expanded-768x1024.png` — Dashboard group after activation at the required tablet viewport, showing child links.
27. `27-retest-finance-group-expanded-768x1024.png` — Finance group after activation at the required tablet viewport, showing child links.

All 70 PNGs are under `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\screenshots\task-1` and were opened/inspected before acceptance.

## Strengths

- The login form uses visible labels for Username and Password; its 48px submit button and the 44px header/sidebar icon buttons meet the 44px touch-target baseline.
- Shell navigation is exposed as native links/buttons and carries a named `navigation` landmark. The collapse control has an accessible name and `aria-expanded`.
- `/admin/crm` visibly marks the current `Pelanggan & CRM` navigation item and presents a clear empty state.
- The direct CRM page has a coherent desktop information hierarchy: page title, metrics, search/filter/action row, then empty state.

## Findings

### 1. P1 — Management UI is directly reachable without a completed login

- **Route/section:** `/admin`, direct URL before login
- **Role:** unauthenticated user
- **Viewport/theme:** all six viewports, light theme
- **Reproduction:** open `http://localhost:3000/admin` in a fresh unauthenticated session.
- **Expected:** redirect to `/login` (or show a permission-denied state) before the management shell or inventory content renders.
- **Observed:** navigation, outlet selector, logout affordance, and then Inventory content render. The initial main area says `Redirecting to Inventory...`, but the URL remains `/admin` and the Inventory UI subsequently appears. The sidebar CRM route also renders directly.
- **Business impact:** confirms unauthenticated rendering of the back-office shell and client UI. This audit did not demonstrate an unauthorised protected-data read or mutation, so server/API authorisation impact is unverified.
- **Root-cause confidence:** high for the observed client UI exposure; server/API authorisation cause and impact untested.
- **Recommendation:** make authorization a server/route boundary for all protected routes; render no protected shell before the decision resolves; add direct-URL auth regression coverage.
- **Evidence:** `03-admin-360x800.png`, `03-admin-1366x768.png`, `07-admin-expanded-768x1024.png`, `12-sidebar-crm-destination-1366x768.png`.

### 2. P1 — The public landing route is the Next.js starter, not Kitchen POS

- **Route/section:** `/`
- **Role:** first-time visitor
- **Viewport/theme:** all six viewports, dark system presentation
- **Reproduction:** open `http://localhost:3000/`.
- **Expected:** a Kitchen POS entry point or a deliberate redirect to login.
- **Observed:** the page says “To get started, edit the page.tsx file” and links to Next.js/Vercel templates and documentation.
- **Business impact:** breaks the first customer journey and exposes unfinished implementation material.
- **Root-cause confidence:** high for behavior and root component cause; the independent review read `app/page.tsx` and confirmed the same stock starter.
- **Recommendation:** replace or redirect `/` before release; add a smoke test that asserts the product name and intended entry action.
- **Evidence:** `01-root-360x800.png`, `01-root-1440x900.png`.

### Round 1 verified outcome — Login and invalid-feedback flow (not a finding)

At 1366×768 on the mandated in-app browser, a filled `admin`/`admin` login navigated to `/pos` and showed the authenticated header user `admin` (`16-retest-valid-login-pos-1366x768.png`). The invalid case retained `bad-user` and its masked password and showed the populated inline alert `Invalid username or password` (`17-retest-invalid-login-error-1366x768.png`). These outcomes supersede the original unproven P0 claim. The controller captured current DOM/state evidence: valid login completed successfully; invalid login retained values and populated the alert. Network response status/body was not independently exposed by the browser tooling, so this verifies served UI state and route outcome, not API protocol details.

### Round 1 verified outcome — Password visibility (not a finding)

Before activation, the filled login form showed `username=admin`, a masked password with `type=password`, and the accessible control name `Tampilkan password` (`14-retest-login-filled-before-toggle-1366x768.png`). After activation, the password value remained `admin`, the input was `type=text`, and the control name changed to `Sembunyikan password` (`15-retest-password-toggle-after-1366x768.png`). The original P1 password-toggle claim is removed. The earlier false conclusion came from a non-unique `getByLabel('Password')` locator that matched both the input and the eye button; exact control locators are required for this form.

### 5. P2 — Invalid-login retry action becomes visually invisible after the error is shown

- **Route/section:** `/login`, invalid-credential feedback/retry control
- **Role:** user recovering from rejected credentials
- **Viewport/theme:** 1366×768, light theme; inspected two seconds after the error appeared
- **Reproduction:** submit invalid credentials, wait two seconds, then inspect the visible retry affordance and its rendered button state.
- **Expected:** a clearly visible enabled Login/retry action remains available near the error so the user can correct and resubmit credentials.
- **Observed:** the `Invalid username or password` alert and field values remain visible, and the DOM retains an enabled Login button (`text=Login`, `disabled=false`, 384×48). Its computed background is `rgba(0,0,0,0)` with white text, rendering the 48px retry action as a visually blank white panel.
- **Business impact:** a user who has corrected their credentials loses the visible primary retry affordance and may abandon or be unable to discover how to continue. The control remains present in DOM, so this is an important error-recovery/accessibility failure rather than P1 total login loss.
- **Root-cause confidence:** high for the rendered state; medium for the styling/state mechanism because this round did not inspect source or computed class ownership.
- **Recommendation:** apply a persistent, contrast-compliant primary/secondary button style in the invalid-error state; verify pointer, keyboard focus, and contrast after a delayed error state.
- **Evidence:** `C:\Users\sukma\.codex\visualizations\2026\08\09\019fe7bd-a4a2-7782-9853-6b0c134bff04\kitchen-pos-review-20260810-0141\screenshots\task-1\21-retest-invalid-login-stable-retry-1366x768.png`.

### 6. P1 — Mobile expanded shell crushes the outlet content and exposes horizontal contained scrolling

- **Route/section:** `/admin` shell, sidebar expanded and collapsed
- **Role:** manager/cashier on phone
- **Viewport/theme:** 360×800, light theme
- **Reproduction:** open `/admin` directly at 360×800; compare expanded then collapsed sidebar.
- **Expected:** a mobile drawer/overlay or a layout that preserves a readable main column and has no hidden horizontal content.
- **Observed:** expanded sidebar leaves a narrow sliver of content; Inventory headings and cards wrap aggressively and the main area exposes a horizontal scrollbar. Collapsing improves width but the horizontal contained scroller remains visible.
- **Business impact:** core inventory content and actions become hard to read, discover, and operate on a phone.
- **Root-cause confidence:** high for layout behavior; medium for responsive layout mechanism.
- **Recommendation:** use an overlay drawer or mobile-specific nav below the desktop breakpoint; inspect the layout chain (including whether a `min-width: 0` constraint is appropriate), remove nested horizontal scrolling, and re-test 360px with sidebar open/closed.
- **Evidence:** `07-admin-expanded-360x800.png`, `08-admin-collapsed-360x800.png`.

### 7. P2 — `/customers` is a direct-URL/legacy-route 404

- **Route/section:** `/customers` and sidebar Customer/CRM navigation
- **Role:** user opening a direct URL, legacy link, or bookmark
- **Viewport/theme:** `/customers` all six viewports; sidebar destination checked at 1366×768, light theme
- **Reproduction:** open `/customers`; then use `Pelanggan & CRM` from the shell.
- **Expected:** a supported direct URL/legacy link resolves to the canonical customer page or redirects there.
- **Observed:** `/customers` returns a bare Next.js 404. The primary sidebar route observed in this audit is instead `/admin/crm`, which loads a CRM page.
- **Business impact:** stale links/bookmarks and user expectations fail; the 404 lacks recovery/navigation.
- **Root-cause confidence:** high for route mismatch; high for the 404 behavior.
- **Recommendation:** decide whether `/customers` is supported. If it is a legacy route, redirect it to the canonical destination; otherwise provide a branded recovery path.
- **Evidence:** `04-customers-360x800.png`, `04-customers-1920x1080.png`, `12-sidebar-crm-destination-1366x768.png`.

### 8. P2 — Small visible controls and incomplete disclosure semantics reduce operability

- **Route/section:** admin header, Inventory toolbar, and sidebar group controls
- **Role:** touch and keyboard user
- **Viewport/theme:** 1366×768 measurement; mobile visual check at 360×800, light theme
- **Reproduction:** inspect controls and activate POS/Dashboard/Finance group buttons from exact named controls.
- **Expected:** touchable controls meet 44×44px minimum or provide equivalent padded hit areas; a disclosure implementation exposes `aria-expanded` and `aria-controls`.
- **Observed:** `getBoundingClientRect()` on the rendered interactive elements measured Outlet `select` 174×20, `Tampilkan Analisis` 166×32, and `Tambah Bahan` 169×40; this is element geometry only and does not prove an unmeasured parent hit area. Header icon buttons measured 44×44. Fresh 1366px before/after retests show POS, Dashboard, and Finance each expand and reveal child links, while their `aria-expanded` remains `null`.
- **Business impact:** smaller targets increase mobile mis-taps; assistive-technology users receive no reliable disclosure state.
- **Root-cause confidence:** high for measured geometry/attributes; medium for intended interaction model.
- **Recommendation:** increase/select hit areas to at least 44×44px, use native/select components with adequate padding, and either make groups real disclosures with correct ARIA or render them as headings rather than inert buttons.
- **Evidence:** `07-admin-expanded-360x800.png`, `08-admin-collapsed-1024x768.png`, `18-retest-pos-group-expanded-1366x768.png`, `19-retest-dashboard-group-expanded-1366x768.png`, `20-retest-finance-group-expanded-1366x768.png`.

## Accessibility evidence and limits

Confirmed from rendered DOM/screenshots: visible login labels, named native form controls, named sidebar/header icon controls, navigation landmark, 44px sidebar/header icon controls, current-page visual state on `/admin/crm`, and an empty-state message.

Likely issues: disclosure controls lack `aria-expanded`/`aria-controls`; several rendered controls measure below the 44px baseline; the invalid-login retry control becomes visually invisible after two seconds; and mobile reflow/contained horizontal scrolling occurs. Login success, invalid alert/value retention, and password-toggle behavior were re-verified; a distinct loading state was not observed. Contrast was reviewed visually only: no numerical contrast measurements were run, so no WCAG contrast pass/fail claim is made. `prefers-reduced-motion`, zoom/text scaling, screen-reader announcement behavior, and full keyboard traversal were not fully verifiable with this browser run; do not treat this as full WCAG compliance testing.

## Console/network evidence

The following are **uncorroborated browser-console observations from the original audit session**, captured on 2026-08-10 while visiting the direct unauthenticated `/admin`/Inventory and `/admin/crm` paths. They are not a fresh Round 1 network trace and no response status/body was captured:

- Repeated console error: `Failed to get ingredients: Error: Failed to fetch ingredients`.
- Repeated console error: `Failed to load members: Error: Failed to fetch members`.
- Repeated console warning: `Purchase data endpoint not available, returning empty array`.
- Visible result in that original session: Inventory and CRM showed zero/empty states. The relationship to API health and user-facing retry/error handling remains unverified.

## Skipped or constrained states

- A 1366×768 authenticated shell is now verified after valid `admin`/`admin` login; the other required viewports remain unverified.
- A distinct login loading state was not observed in the successful flow; the invalid delayed state instead exposed the visually invisible retry defect.
- Logout was identified as a named, 44px affordance but was not activated in the authenticated Round 1 session.
- Full keyboard traversal and focus-ring audit was attempted, but the in-app browser’s keyboard bridge did not return stable focused-control identification; no claim of keyboard correctness is made.
- Reduced-motion, screen-reader, high-zoom, and automated contrast verification require dedicated assistive-technology/browser configuration and were not run.

## Source and Git status confirmation

- No repository/source files were modified. No Git write, staging, branch, commit, checkout, reset, clean, or push operation was performed.
- Read-only Git status at audit close showed one untracked repository file: `?? .env.local.example`. Its origin was not established by this audit and it was left untouched.
- All audit artifacts were written only to the required visualization/report directory, not to the repository.

## Fix Round 1 — reviewer dispositions and retest results

**Round status:** DONE  
**Fresh evidence:** seven newly captured, visually inspected IAB screenshots (`14`–`20`) at 1366×768. Exact input/control locators were used. The earlier false login/toggle conclusions were caused by non-unique `getByLabel('Password')` selection matching both the password input and eye button.

### Exact Round 1 browser checks/results

1. **Login pre-toggle:** username `admin`, masked password `admin`, `input.type=password`, control name `Tampilkan password` — `14-retest-login-filled-before-toggle-1366x768.png`.
2. **Password toggle:** value remained `admin`, `input.type=text`, control name changed to `Sembunyikan password` — `15-retest-password-toggle-after-1366x768.png`.
3. **Valid submit:** `admin`/`admin` navigated to `/pos`; the header rendered authenticated user `admin` — `16-retest-valid-login-pos-1366x768.png`.
4. **Invalid submit:** entered values remained present and the visible inline alert read `Invalid username or password` — `17-retest-invalid-login-error-1366x768.png`.
5. **POS disclosure:** before/after retest showed the submenu child links after activation; `aria-expanded` was `null` — `18-retest-pos-group-expanded-1366x768.png`.
6. **Dashboard disclosure:** before/after retest showed the submenu child links after activation; `aria-expanded` was `null` — `19-retest-dashboard-group-expanded-1366x768.png`.
7. **Finance disclosure:** before/after retest showed the submenu child links after activation; `aria-expanded` was `null` — `20-retest-finance-group-expanded-1366x768.png`.

The browser session exposed DOM/state and route outcome evidence. It did not expose a response status/body capture, so login results are framed as served-UI/state verification rather than a network-protocol assertion.

### Reviewer Finding 1 — login P0 reproducibility

- **Disposition:** Resolved; prior P0 removed.
- **Revision applied:** report now records verified `/pos` navigation/authenticated header for valid login, value retention plus visible alert for invalid login, and does not prescribe already-working auth wiring.

### Reviewer Finding 2 — password-toggle reproducibility

- **Disposition:** Resolved; prior P1 removed.
- **Revision applied:** report now records retained value, `password`→`text`, and `Tampilkan password`→`Sembunyikan password` transition; the locator root cause is documented.

### Reviewer Finding 3 — P0–P3 severity calibration/root route

- **Disposition:** Resolved.
- **Revision applied:** severity convention is P0 = demonstrated unauthorised data/action or complete critical-flow loss with no safe route; P1 = release-blocking primary journey, exposed protected client UI, or serious responsive-operability loss; P2 = important direct-link/accessibility failure with workaround; P3 = bounded polish. Root starter is P1.

### Reviewer Finding 4 — direct-shell impact scope

- **Disposition:** Resolved in wording/severity.
- **Revision applied:** direct shell is P1 for unauthenticated client-UI exposure only. This audit did not demonstrate protected-data read/mutation or server/API authorisation failure.

### Reviewer Finding 5 — POS/Dashboard/Finance disclosure conclusion

- **Disposition:** Resolved at all required deep-interaction viewports (360×800, 768×1024, 1366×768).
- **Revision applied:** the false no-change/subitems claim is removed. Fresh screenshots prove all three groups reveal child links at 1366×768 (`18`–`20`), 360×800 (`22`–`24`), and 768×1024 (`25`–`27`); missing `aria-expanded` remains the P2 issue.

### Reviewer Finding 6 — `/customers` framing/severity

- **Disposition:** Resolved.
- **Revision applied:** P2 direct-URL/legacy-route 404 framing; `/admin/crm` is the primary sidebar destination observed.

### Reviewer Finding 7 — mobile layout causal language

- **Disposition:** Resolved.
- **Revision applied:** P1 reflow finding remains screenshot-supported; `min-width: 0` is a candidate remediation, not asserted cause.

### Reviewer Finding 8 — touch-target measurement method

- **Disposition:** Resolved.
- **Revision applied:** the report identifies `getBoundingClientRect()` on each rendered interactive element and distinguishes this geometry from any unmeasured parent hit area.

### Required revision checklist disposition

1. Login/invalid/toggle fresh rerun: **RESOLVED** at 1366×768 with DOM/state/route evidence; response status/body not exposed.
2. Disclosure before/after rerun: **RESOLVED** at all required deep-interaction viewports: 1366×768 (`18`–`20`), 360×800 (`22`–`24`), and 768×1024 (`25`–`27`).
3. Severity calibration: **RESOLVED**.
4. `/customers` direct-route framing: **RESOLVED**.
5. Authenticated-shell and keyboard coverage: authenticated shell **PARTIALLY RESOLVED** at 1366×768; keyboard order remains **UNRESOLVED**.
6. Console provenance: **RESOLVED IN WORDING** — original console entries remain dated browser observations, not Round 1 network proof.

## Fix Round 2 — delayed invalid-login and required disclosure viewport results

**Round status:** DONE  
**Evidence source:** supplied, visually inspected in-app-browser captures `21`–`27`; no new browser session, repository write, source edit, or Git operation was performed for this report-only revision.

### Exact results

1. **Delayed invalid-login state at 1366×768:** after two seconds, DOM showed `Login`, `disabled=false`, 384×48; computed background was `rgba(0,0,0,0)` and text was white. The screenshot shows the resulting blank/invisible retry action below the visible error. This is now confirmed Finding 5 (P2).
2. **POS disclosure:** expanded and exposed child links at 360×800 and 768×1024 (`22`, `25`), matching the earlier 1366×768 retest. `aria-expanded` remains absent.
3. **Dashboard disclosure:** expanded and exposed child links at 360×800 and 768×1024 (`23`, `26`), matching the earlier 1366×768 retest. `aria-expanded` remains absent.
4. **Finance disclosure:** expanded and exposed child links at 360×800 and 768×1024 (`24`, `27`), matching the earlier 1366×768 retest. `aria-expanded` remains absent.

### Dispositions

- Earlier `05`/`06` Password-label attempts are superseded as ambiguous historical evidence: valid login and password toggle work; invalid credentials retain values and show an alert.
- All required deep interaction viewports (360×800, 768×1024, 1366×768) now confirm functional expansion for POS, Dashboard, and Finance. The remaining defect is semantic disclosure state, not functionality.
- Authenticated shell is verified at 1366×768. Keyboard order, logout activation, authenticated-shell behavior at the other specified viewports, and a distinct loading visual state remain unresolved coverage—not confirmed failures.
- Screenshot inventory updated from 63 to 70 PNGs; route/state matrix and screenshot index updated accordingly.

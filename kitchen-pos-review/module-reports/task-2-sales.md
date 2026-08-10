# Task 2 — Sales Operations audit

**Status:** DONE_WITH_CONCERNS  
**Audit date:** 2026-08-10 (Asia/Jakarta)  
**Surface:** `http://localhost:3000`, authenticated as seeded `admin` in the Codex in-app Browser  
**Scope:** `/pos`, `/kasir`, `/waiter`, `/kitchen`, `/pos/meja`, `/shift`, `/online-order`, `/order/[tableId]`, and `/order-status/[orderId]`. Screenshot-led UI/UX audit plus read-only source corroboration; not a penetration test, accounting reconciliation, payment-provider certification, or full WCAG conformance test.

## Executive result

The sales surfaces render across all 54 required route/viewport combinations, but the audit found five release-blocking defects in primary sales journeys. A successfully created online order is immediately reported as “Pesanan tidak ditemukan”; a valid self-order table link cannot resolve its table; the completed POS receipt prints `TOTAL Rp 0` for a Rp 42.000 sale; `/pos` and `/pos/meja` are functionally crushed by the desktop navigation at 360px; and multiple POS views display `Stok: undefined`. The online checkout also presents Transfer/QRIS/E-Wallet as payment methods while the implementation creates a pending order without provider verification and omits customer identity from the created order payload.

The strongest parts are the consistent visual language, clear product/category hierarchy, readable KDS cards, and generally usable `/waiter`, `/kitchen`, `/shift`, and `/online-order` layouts across the matrix. These strengths do not offset the financial and order-continuity failures.

## Evidence package

- **65 accepted and visually inspected PNGs:** 54 route/viewport matrix captures and 11 deep-state captures.
- **Evidence directory:** `screenshots/task-2` under this review package.
- **Dynamic table used:** seeded table `c9e0936a-9599-4ec4-aa14-3f5023e1be6b` (`Meja 1`).
- **Dynamic online order used:** audit-created order `9d9a12ac-5118-4aaa-bd23-a228922faaeb`.
- Matrix filename sequence for every viewport: POS, Kasir, Waiter, Kitchen, POS Meja, Shift, Online Order, valid self-order table, created-order status.

Severity convention: P0 = demonstrated catastrophic/irreversible loss or security compromise; P1 = release-blocking primary journey, financial-integrity, or serious operability failure; P2 = important failure with a bounded workaround; P3 = polish/consistency recommendation. No P0 is claimed because the audit did not prove persisted financial corruption, unauthorized access, or irreversible loss.

## Route/state/viewport matrix

`✓` means captured and visually inspected. “Deep” denotes exercised interaction evidence beyond the default state.

| Route/state | 360×800 | 768×1024 | 1024×768 | 1366×768 | 1440×900 | 1920×1080 | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| `/pos` | ✓ | ✓ | ✓ | ✓ Deep | ✓ | ✓ | Severe mobile reflow failure; stock becomes undefined; payment/receipt defect |
| `/kasir` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Renders; emoji product imagery is visually inconsistent |
| `/waiter` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Default responsive state renders |
| `/kitchen` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Audit-created online order appears in KDS |
| `/pos/meja` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Severe mobile reflow failure |
| `/shift` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Empty/open-shift entry state renders |
| `/online-order` | ✓ | ✓ | ✓ | ✓ Deep | ✓ | ✓ | Modifier, validation, payment selection, and creation exercised |
| `/order/c9e…` | ✓ Deep | ✓ Deep | ✓ | ✓ Deep | ✓ | ✓ | Valid seeded dynamic table route; modal opens but table label/number are blank |
| `/order-status/9d9a…` | ✓ Deep | ✓ Deep | ✓ | ✓ Deep | ✓ | ✓ | Audit-created dynamic order route; order immediately reported not found |

Matrix screenshots are `m01`–`m54`. The viewport groups are `m01`–`m09` (360×800), `m10`–`m18` (768×1024), `m19`–`m27` (1024×768), `m28`–`m36` (1366×768), `m37`–`m45` (1440×900), and `m46`–`m54` (1920×1080). `m37-pos-1440x900.png` was initially caught during a transient skeleton and was rejected/overwritten only after the loaded state was visible.

## Deep-state screenshot index

1. `000-initial-pos-1366x768.png` — initial authenticated POS.
2. `001-online-order-entry-1366x768.png` — online product/category entry.
3. `002-online-modifier-selected-1366x768.png` — configured Affogato modifier state.
4. `003-online-checkout-validation-1366x768.png` — empty-name submission and toast-only validation.
5. `004-online-checkout-transfer-selected-1366x768.png` — Transfer Bank selected.
6. `005-order-status-created-order-not-found-1366x768.png` — newly created order reported missing.
7. `d01-pos-search-category-1366x768.png` — POS search/category result.
8. `d02-pos-cart-ready-1366x768.png` — configured POS cart before payment.
9. `d03-pos-split-bill-dialog-1366x768.png` — split bill surface.
10. `d04-pos-void-dialog-1366x768.png` — void confirmation surface; not confirmed.
11. `d05-pos-payment-dialog-1366x768.png` — completed receipt (filename retained from capture plan); visibly shows `TOTAL Rp 0`.

## Strengths

- The sales surfaces share a coherent green/blue visual language, readable section titles, and consistent rounded components.
- `/waiter` and `/online-order` keep product browsing understandable at phone and desktop widths; horizontal category patterns remain discoverable.
- The KDS presents item, modifier, channel, timestamp, and action information in a compact order card; the audit-created online order surfaced there immediately.
- Product modifier choices are grouped and the configured selections remain visible in the cart before payment.
- The void flow uses a confirmation surface and was safely inspectable without performing the destructive action.

## Findings

### SLS-01 — P1 confirmed defect: created online order cannot be tracked

- **Classification:** Confirmed defect.
- **Route/section:** `/online-order` → `/order-status/[orderId]`.
- **Role:** online customer.
- **Viewport/theme:** reproduced at all six required viewports; deep capture at 1366×768, light theme.
- **Reproduction:** configure an item, provide the required customer details, select Transfer Bank, activate `Bayar Sekarang`, and follow the automatic status route.
- **Expected:** the status page loads the order just created and shows pending/progress information.
- **Observed:** API creation succeeds and the KDS later shows the order, but the destination immediately renders `Pesanan tidak ditemukan`.
- **Business/user impact:** the customer receives a false failure after committing an order, cannot verify progress, and may duplicate the purchase or contact staff. This is a primary conversion and trust failure.
- **Root-cause/source evidence:** high confidence. `OnlineCheckoutModal.tsx:87-95` creates through the API then routes to the status URL; `app/order-status/[orderId]/page.tsx:82` queries only local IndexedDB (`db.orders`) and does not fetch the API-created order.
- **Recommendation:** make the status page resolve from the same authoritative API used at checkout, with a bounded local-cache fallback and explicit loading/retry/error states; add an E2E contract asserting create→status continuity.
- **Accessibility/WCAG note:** the visible error is understandable, but it is incorrect and offers only a restart action; this is primarily a functional defect, not a WCAG claim.
- **Evidence:** `005-order-status-created-order-not-found-1366x768.png`, `m09-order-status-created-360x800.png`, `m18-order-status-created-768x1024.png`, `m27-order-status-created-1024x768.png`, `m36-order-status-created-1366x768.png`, `m45-order-status-created-1440x900.png`, `m54-order-status-created-1920x1080.png`.

### SLS-02 — P1 confirmed defect: valid self-order link loses table identity

- **Classification:** Confirmed defect.
- **Route/section:** `/order/c9e0936a-9599-4ec4-aa14-3f5023e1be6b`.
- **Role:** dine-in customer scanning/opening a table link.
- **Viewport/theme:** all six required viewports, light theme.
- **Reproduction:** open the route using seeded `Meja 1` ID.
- **Expected:** the self-order modal identifies `Meja 1`, locks that table, and enables a table-bound order journey.
- **Observed:** the modal title is `Pemesanan -` and the disabled `Nomor Meja` field is blank at every viewport.
- **Business/user impact:** orders cannot be reliably attributed to the scanned table, blocking the intended table self-order journey or risking misrouting.
- **Root-cause/source evidence:** high confidence for the rendered defect; low/unknown confidence for the request/response mechanism. The audit environment declares `NEXT_PUBLIC_API_URL` on port 3001, so the `http://localhost:3000` fallback in `src/features/self-order/selfOrderService.ts:3` does not explain this run. The page calls `getTableById` (`selfOrderService.ts:33`), receives no usable table for the UI, and leaves `tableNumber` blank; the precise request/response cause is unproven because no response status or body was captured.
- **Recommendation:** instrument and inspect the `getTableById` response path, fail visibly with retry/support guidance when no usable table returns, and add a seeded-table route contract test that asserts the rendered table number.
- **Accessibility/WCAG note:** a disabled blank input communicates neither state nor recovery to assistive-technology users; expose the loading/error message in a live region.
- **Evidence:** `m08-order-table-valid-360x800.png`, `m17-order-table-valid-768x1024.png`, `m26-order-table-valid-1024x768.png`, `m35-order-table-valid-1366x768.png`, `m44-order-table-valid-1440x900.png`, `m53-order-table-valid-1920x1080.png`.

### SLS-03 — P1 confirmed defect: completed POS receipt prints a zero total

- **Classification:** Confirmed defect.
- **Route/section:** `/pos`, cash completion receipt.
- **Role:** cashier/customer.
- **Viewport/theme:** 1366×768, light theme.
- **Reproduction:** add Affogato with Hot/Normal Sugar, use table `UXR-20260810-0141-sales-002`, process Rp 50.000 cash, and inspect the completed receipt.
- **Expected:** receipt total equals the confirmed cart/payment total (Rp 42.000 after rounding) and change is auditable.
- **Observed:** receipt lists Affogato Rp 38.000 but prints `TOTAL Rp 0`; pre-payment cart showed the non-zero rounded total.
- **Business/user impact:** produces materially incorrect customer/accounting evidence and undermines cash reconciliation. The persisted order amount was not independently reconciled, so the confirmed scope is the rendered receipt.
- **Root-cause/source evidence:** high confidence for both the rendered defect and source mechanism. `src/store/useCartStore.ts:679-721` builds `result.receiptData` from the pre-clear store state, clears the store, and then returns that immutable snapshot. `src/features/pos/components/CartPanel.tsx:418-445` destructures the returned `receiptData` but ignores it, instead rebuilding the receipt with live getters after `processPayment` has cleared the store; those recomputed values produce the zero total.
- **Recommendation:** construct an immutable receipt snapshot from the successful `processPayment` result, never from mutable post-payment cart state; unit-test the snapshot and E2E-test cash amount, rounding, total, and change.
- **Accessibility/WCAG note:** not primarily an accessibility defect; the incorrect number is clearly visible.
- **Evidence:** `d02-pos-cart-ready-1366x768.png`, `d05-pos-payment-dialog-1366x768.png`.

### SLS-04 — P1 confirmed defect: POS and table management are unusable at phone width

- **Classification:** Confirmed defect.
- **Route/section:** `/pos` and `/pos/meja`.
- **Role:** cashier/waiter on a 360px device.
- **Viewport/theme:** 360×800, light theme; tablet comparison at 768×1024.
- **Reproduction:** open either route at 360×800 with the primary navigation expanded.
- **Expected:** navigation becomes an overlay/drawer or collapses, leaving a readable, operable sales canvas without horizontal clipping.
- **Observed:** the fixed desktop navigation consumes about two-thirds of the viewport; the sales/table content is reduced to a narrow clipped strip with horizontal scrolling and partially visible controls.
- **Business/user impact:** product selection, table assignment, and transaction controls are not reliably operable on phones.
- **Root-cause/source evidence:** high for rendered behavior, medium for layout mechanism.
- **Recommendation:** introduce a mobile overlay drawer/collapsed rail below the tablet breakpoint, enforce `min-width:0` on the content chain, remove nested horizontal overflow, and regression-test the full cart/table journey at 360px.
- **Accessibility/WCAG note:** likely WCAG 1.4.10 Reflow failure; full conformance was not measured at 400% zoom, so the claim is limited to the observed 360px layout.
- **Evidence:** `m01-pos-360x800.png`, `m05-pos-meja-360x800.png`, with `m10`/`m14` as tablet comparison.

### SLS-05 — P1 confirmed defect: product inventory renders as `Stok: undefined`

- **Classification:** Confirmed defect.
- **Route/section:** `/pos` product grid.
- **Role:** cashier.
- **Viewport/theme:** confirmed in stable loaded captures at 768×1024, 1366×768, 1440×900, and 1920×1080, light theme.
- **Reproduction:** load `/pos` after the current data/cache path resolves and inspect product metadata.
- **Expected:** a numeric stock count, an explicit unavailable state, or no stock label when the value is unknown.
- **Observed:** multiple cards literally render `Stok: undefined`.
- **Business/user impact:** cashiers cannot trust availability information and may sell unavailable items or unnecessarily block sales.
- **Root-cause/source evidence:** high for UI, medium for data-contract cause; the audit did not mutate inventory or reconcile API/cache schemas.
- **Recommendation:** normalize the product contract at the data boundary, distinguish `0` from missing, and render a safe `Stok tidak tersedia` error state with telemetry rather than interpolating `undefined`.
- **Accessibility/WCAG note:** text is exposed but semantically false; primarily a data-integrity/UX defect.
- **Evidence:** `m10-pos-768x1024.png`, `m28-pos-1366x768.png`, `m37-pos-1440x900.png`, `m46-pos-1920x1080.png`.

### SLS-06 — P1 risk: payment options imply provider verification that does not occur

- **Classification:** Risk (source-corroborated; no real provider was invoked).
- **Route/section:** `/online-order`, payment selection and submission.
- **Role:** online customer and fulfillment staff.
- **Viewport/theme:** deep-tested at 1366×768, light theme.
- **Reproduction:** choose Transfer Bank and activate `Bayar Sekarang`.
- **Expected:** either explicit pay-later/manual-confirmation language, or verified provider initiation/confirmation before communicating payment completion.
- **Observed:** the UI offers QRIS, Transfer Bank, and E-Wallet and uses `Bayar Sekarang`. Transfer selection directly creates a pending order and shows success; no provider interaction or payment proof occurred.
- **Business/user impact:** customers and staff may interpret an unverified payment selection as paid, creating fulfillment, fraud, and reconciliation exposure.
- **Root-cause/source evidence:** high. `OnlineCheckoutModal.tsx:17-21` defines the provider-like labels; `:52-95` generates an order, calls the local API, clears the cart, and redirects without provider confirmation. The order payload stores only the lowercase selected label.
- **Recommendation:** make the state machine explicit (`unpaid`, `awaiting_payment`, `payment_pending`, `paid`, `failed`); label manual transfer as awaiting verification; integrate providers only behind server-verified callbacks; do not display success as payment success before confirmation.
- **Accessibility/WCAG note:** status wording must be programmatically announced, but the primary issue is truthful transaction semantics.
- **Evidence:** `004-online-checkout-transfer-selected-1366x768.png`, `005-order-status-created-order-not-found-1366x768.png`.

### SLS-07 — P2 confirmed defect: online customer identity is collected but not persisted

- **Classification:** Confirmed defect (source and runtime workflow).
- **Route/section:** `/online-order` checkout.
- **Role:** online customer and staff.
- **Viewport/theme:** 1366×768, light theme.
- **Reproduction:** submit a named/phone order and inspect the created-order behavior/payload construction.
- **Expected:** customer name and contact required by the form are attached to the order or a referenced customer record.
- **Observed:** the form requires and displays name/phone, but the order payload contains neither; `customer_order_id` is set to `null`.
- **Business/user impact:** staff cannot associate or contact the pickup customer from the created order, and the required-data promise is misleading.
- **Root-cause/source evidence:** high. `OnlineCheckoutModal.tsx:29-31` reads customer fields for display, while `:59-71` builds `orderData` without them and explicitly sets `customer_order_id: null`.
- **Recommendation:** persist a minimal, privacy-reviewed order contact snapshot or a customer reference; validate server-side and define retention/masking rules.
- **Accessibility/WCAG note:** not primarily an accessibility issue.
- **Evidence:** `003-online-checkout-validation-1366x768.png`, `004-online-checkout-transfer-selected-1366x768.png`, fixture ledger below.

### SLS-08 — P2 confirmed defect: required-name validation is toast-only

- **Classification:** Confirmed defect.
- **Route/section:** `/online-order`, customer information validation.
- **Role:** online customer.
- **Viewport/theme:** 1366×768, light theme.
- **Reproduction:** attempt checkout with the required name blank.
- **Expected:** focus moves to the invalid field; the field exposes `aria-invalid` and a persistent, associated error message.
- **Observed:** only a bottom toast says `Nama pemesan wajib diisi`; no persistent inline error or invalid-field treatment was visible.
- **Business/user impact:** error recovery is harder, especially in a long/scrolling modal and for keyboard or screen-reader users.
- **Root-cause/source evidence:** high for rendered behavior; source-level form semantics were not exhaustively traced.
- **Recommendation:** add inline field errors with `aria-describedby`, `aria-invalid`, first-error focus, and an error summary/live announcement; retain the toast only as supplementary feedback.
- **Accessibility/WCAG note:** likely WCAG 3.3.1 Error Identification and 3.3.3 Error Suggestion concern; screen-reader announcement was not directly tested.
- **Evidence:** `003-online-checkout-validation-1366x768.png`.

### SLS-09 — P2 risk: split-bill surface lacks clear dialog semantics

- **Classification:** Risk.
- **Route/section:** `/pos`, split bill.
- **Role:** cashier, including keyboard/screen-reader user.
- **Viewport/theme:** 1366×768, light theme.
- **Reproduction:** configure a cart and activate Split Bill; inspect the modal controls/DOM.
- **Expected:** a labelled modal dialog, named close control, contained focus, and a deterministic return target.
- **Observed:** the screenshot retains visual exposure of the underlying cart trigger behind the modal overlay, but it does not prove that trigger is concurrently actionable. The rendered modal maps to `src/components/pos/SplitBillModal.tsx`; its inspected container does not expose a dialog role/name and its close icon lacks an accessible name.
- **Business/user impact:** risks focus loss or an inaccessible blocking surface during a payment flow.
- **Root-cause/source evidence:** high for the inspected DOM/source semantics; keyboard focus containment and restoration remain untested because stable focus traversal was not available.
- **Recommendation:** use the shared accessible Dialog primitive, name the close control, trap/restore focus, prevent background interaction, and expose selection totals in a live region.
- **Accessibility/WCAG note:** likely WCAG 4.1.2 Name, Role, Value and 2.4.3 Focus Order risk; not a full keyboard conformance result.
- **Evidence:** `d03-pos-split-bill-dialog-1366x768.png`.

### SLS-10 — P3 recommendation: replace emoji product imagery with consistent assets

- **Classification:** Recommendation.
- **Route/section:** `/kasir` product grid.
- **Role:** cashier.
- **Viewport/theme:** all six viewports, light theme.
- **Reproduction:** open `/kasir` and inspect product cards.
- **Expected:** consistent branded product imagery or neutral, labelled placeholders.
- **Observed:** emoji (cups, pastries, etc.) act as structural product images; rendering varies by OS/font and does not reliably represent the item.
- **Business/user impact:** lowers scan consistency and visual credibility; bounded workaround is reading the product name.
- **Root-cause/source evidence:** high for visual result.
- **Recommendation:** use a consistent product-thumbnail system with neutral fallbacks; decorative thumbnails should use empty alt text, while meaningful imagery needs product-specific alternatives.
- **Accessibility/WCAG note:** ensure emoji are not redundantly announced with the visible product name.
- **Evidence:** `m02-kasir-360x800.png`, `m11-kasir-768x1024.png`, `m20-kasir-1024x768.png`, `m29-kasir-1366x768.png`, `m38-kasir-1440x900.png`, `m47-kasir-1920x1080.png`.

## Exact fixture/write ledger

Only the two audit-prefixed workflows below created business data. No table status, shift, expense, KDS item status, void, refund, held-order, OCR, payment-provider, or gateway mutation was performed.

| # | Timestamp context | Write | Exact values | Result/recovery |
|---|---|---|---|---|
| 1 | 2026-08-10 audit session | Online order via local API | Customer label entered: `UXR-20260810-0141-sales-001`; phone `081234567890`; order ID `9d9a12ac-5118-4aaa-bd23-a228922faaeb`; Affogato ×1; Iced, Less Sugar, Extra Espresso Shot; Transfer; total Rp 46.000 | Created as pending and visible in KDS; status route falsely says not found. The current payload did **not** persist the entered customer label, a limitation documented in SLS-07. Not deleted because deletion was outside this audit’s authorized workflow. |
| 2 | 2026-08-10 02:21 displayed receipt time | POS completed cash order via local API/IndexedDB sync | Table `UXR-20260810-0141-sales-002`; note `UXR-20260810-0141-sales-002 audit cart only`; order ID `62a818f5-42ca-4cad-b720-601d25993ec7`; receipt `ORD-62A8`; Affogato ×1; Hot, Normal Sugar; cash received Rp 50.000; expected rounded total Rp 42.000 | Completed order persisted; rendered receipt total is Rp 0. Not voided/deleted because that would be a second destructive business mutation and independent reviewers may need the evidence. |

The POS write occurred when the audit action labelled “payment dialog” completed payment immediately rather than opening an additional confirmation step. The action was on the clearly labelled audit fixture and is fully ledgered here.

## Coverage limits and deliberately skipped states

- **Success:** POS order creation completed and online API creation succeeded; the resulting failures are documented. KDS visibility of the online order was visually verified.
- **Empty:** shift entry/open-shift state and default route states were captured. No data was deleted to manufacture empty KDS/POS states.
- **Loading:** a transient POS skeleton was observed during matrix capture. It was not accepted as the route’s stable matrix screenshot; the loaded replacement was inspected. Timing was too brief for a separate reliable loading-state claim.
- **Validation:** online required-name validation was exercised; payment shortage and other validation paths were not mutated after the completed audit order.
- **API/fetch failure:** the created-order status UI failure and valid-table rendering failure are confirmed. Network response bodies/statuses were not exposed by the in-app Browser, so the table request/response cause and all protocol statuses remain unverified.
- **Offline:** no safe in-app Browser network-offline control was available. Source indicates offline/cache machinery, but offline checkout/reconnect conflict handling remains unverified.
- **Permission:** only the seeded admin credential was provided. No second role was fabricated and logout/session destruction was avoided; cashier/waiter permission boundaries remain unverified.
- **Shift:** open/expense/close actions were not performed because they create operational state and were not necessary to support a concrete finding. The default screen is matrix-covered only.
- **KDS filters and mutations:** the filter controls and audit order card were observed, but accepted evidence shows only `Semua` selected; `Dapur` and `Bar` selection was not independently evidenced. No pending→preparing/completed item or order transition was invoked because it would change fulfillment state.
- **Table management/QR:** default table cards are matrix-covered. QR download, status changes, and table-linked ordering were not mutated; the valid dynamic order link itself was tested.
- **Held orders/refunds/void:** split and void surfaces were inspected; void was not confirmed. Held-order, refund, and receipt reprint mutations were not completed.
- **Payment/OCR/providers:** no real payment, QRIS, bank, e-wallet, OCR, printer, or external provider integration was invoked. “Transfer” only selected the app’s local placeholder path documented in source.
- **Accessibility:** screenshots and rendered DOM supported the stated findings. Full keyboard traversal, screen-reader output, numeric contrast, reduced motion, zoom, and high-contrast mode were not fully testable; this is not a WCAG certification.

## Console/network observations

No blocking page exception was observed during the accepted captures. The development console emitted extensive ProductCard debug logging while browsing POS, which is a bounded production-readiness concern (noise/performance and possible data exposure) but was not promoted to a numbered defect without a production-build verification. The Browser did not expose a full network HAR or response bodies, so source/runtime continuity is reported without inferred HTTP status codes.

## Source and Git status confirmation

- No repository/source files were modified.
- No Git write, staging, branch creation, checkout, reset, clean, commit, merge, or push was performed.
- Read-only close check: branch `master`, HEAD `8ea705989979b589fc6747bdba46a20478efeaff`.
- `git status --short` remained `?? .env.local.example`, an untracked pre-existing file left untouched.
- All audit artifacts were written only under the required external review root.
- The in-app Browser viewport was reset and the audit tabs were finalized after capture.

## Recommended release order

1. Fix and contract-test online create→status continuity and self-order table resolution.
2. Correct receipt snapshot integrity and reconcile the persisted order amount for the recorded POS fixture.
3. Block mobile POS release until 360px reflow is operable.
4. Normalize stock data contracts and remove literal `undefined` rendering.
5. Redesign online payment semantics/state verification and persist customer identity.
6. Address validation/dialog accessibility, then replace emoji placeholders.

# Task 2: Sales operations audit

Audit `/pos`, `/kasir`, `/waiter`, `/kitchen`, `/pos/meja`, `/shift`, `/online-order`, `/order/[tableId]`, and `/order-status/[orderId]` at `http://localhost:3000`.

Exercise category/search/product/modifier/cart flows; dine-in/takeaway/delivery; mobile cart; held orders; table selection/status/QR; shift open/expense/close; payment, split-bill, receipt and void dialogs without contacting external gateways; KDS kitchen/bar/all filters and item/order states; online checkout; valid table and order dynamic routes. Create only records prefixed `UXR-20260810-0141-sales-*`, record every ID, and avoid irreversible non-review data changes.

Capture every route at `360x800`, `768x1024`, `1024x768`, `1366x768`, `1440x900`, and `1920x1080`; deep interactions at 360, 768, and 1366 widths. Apply screenshot-first Product Design audit, UI/UX Pro Max, Baseline UI, and fixing-accessibility. Inspect accepted screenshots; check console/network errors, overflow, touch targets, keyboard/focus, semantics, feedback, offline/error states, and business-flow clarity.

Do not modify source or Git state. Save screenshots under `screenshots\task-2` and report to `module-reports\task-2-sales.md` inside the review root. Report must include route/state/viewport matrix, numbered screenshots, strengths, complete P0-P3 finding records, created record IDs, evidence limits, skipped states, and source/Git confirmation.

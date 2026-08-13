# Inventory Shell Design QA

- Source visual truth: `C:/Users/sukma/.codex/visualizations/2026/08/09/019fe7bd-a4a2-7782-9853-6b0c134bff04/kitchen-pos-review-20260810-0141/wireframes/02-responsive-list-detail.png`
- Implementation screenshot: `C:/Users/sukma/.codex/visualizations/2026/08/12/019ff543-8f46-7e70-8f76-764468aa93d/inventory-shell-qa/implementation-final-1200x1000.png`
- Combined comparison: `C:/Users/sukma/.codex/visualizations/2026/08/12/019ff543-8f46-7e70-8f76-764468aa93d/inventory-shell-qa/comparison-final-source-left-implementation-right.png`
- Viewport: 1200 x 1000 CSS px, desktop inventory route, light theme, expanded sidebar.
- Density normalization: source is 1600 x 1024 px; its 1200 x 1000 desktop region was compared against a 1200 x 1000 implementation capture at device scale 1.
- Scope: the requested shared shell surfaces only: desktop sidebar, header navigation, and inventory menu completeness. Existing inventory content and data were intentionally preserved.

## Full-view comparison

The source and implementation are shown together in the combined comparison. The implementation now uses the same full-height branded left rail, a separate compact breadcrumb header, a 224 px expanded rail, a 64 px collapsed rail, and the seven-entry inventory information architecture from the source.

## Focused shell review

- Fonts and typography: Geist remains the application font and closely matches the source's neutral sans-serif hierarchy. The small optical difference is P3 and does not change navigation hierarchy.
- Spacing and layout rhythm: the persistent sidebar now sits beside the header/content column. Header and navigation rows follow the source's compact 44-64 px rhythm. The implementation rail is about 8 px wider than the source estimate, a P3 difference retained for the existing Tailwind width scale and touch targets.
- Colors and tokens: the rail and header use the saved semantic primary/surface/text tokens. Active state, module badge, and mobile header consistently follow the selected organization accent.
- Image and icon fidelity: the shell contains no raster imagery. Existing Lucide vector icons are used consistently; the launcher grid glyph differs slightly from the source's filled nine-dot mark, classified as P3.
- Copy and content: `Kitchen POS`, `Inventory`, `All Items`, `Stock Approvals`, `Categories`, `Stock Adjustments`, `Stock Transfers`, `Suppliers`, and `Automation` match the source.
- Accessibility: navigation uses native links/buttons, active pages expose `aria-current`, icon-only controls have names, the drawer closes with Escape, and touch targets are at least 44 px.

## Interaction and responsive evidence

- Desktop collapse: 224 px -> 64 px -> 224 px.
- Mobile viewport: 375 x 812, no document-level horizontal overflow; desktop rail hidden.
- Mobile header: organization accent background with menu, centered `All Items`, and functional add-item action.
- Mobile drawer: all seven entries visible and close control available.
- Browser console errors: 0.

## Comparison history

1. Initial implementation: global header spanned above the rail; sidebar lacked brand/module hierarchy, icons, and four wireframe entries.
2. Final implementation: sidebar owns the full viewport height, header starts after the rail, all seven entries are present, and the responsive mobile header/drawer follow the reference structure.

## Follow-up polish

- P3: replace the generic launcher grid with a dedicated brand asset if an approved Kitchen POS logo becomes available.
- Inventory KPI/action/table/detail differences visible in the comparison were outside this shell/navigation correction and remain unchanged.

final result: passed

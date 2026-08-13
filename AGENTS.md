<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Process & Server Lifecycle Rule
- **Server Shutdown After Testing**: Whenever dev servers or background test processes (e.g. Next.js server, Express API server) are started for testing or verification, ensure they are properly shut down / killed after testing is completed.

# Theme & Styling Invariance Rule
- **Semantic Theme Tokens Mandatory**: Never use hardcoded palette color classes (`slate-*`, `gray-*`, `zinc-*`, `violet-*`, `blue-*`, `bg-white`) for general container backgrounds, surface cards, text, borders, or focus rings on application pages. Always use semantic design tokens (`bg-background`, `bg-surface`, `bg-surface-alt`, `text-ink`, `text-ink-secondary`, `text-ink-muted`, `border-line`, `border-line-strong`, `bg-primary`, `focus:ring-primary`) so that components dynamically adapt to user theme and dark mode settings.

# Procurement vs. Finance Segregation of Duties Rule
- **Purchase Scope**: The Purchase module (`/purchase/*`) strictly contains 5 submenus: Permintaan Dapur (PR), Penawaran Harga (Quotations), Pesanan Pembelian (PO), Penerimaan Barang (GRN), and Faktur Supplier (Vendor Invoices).
- **Supplier Payments in Finance**: Supplier payments and cash outflows must never reside inside the Purchase module. They belong exclusively to the Finance module (`/finance/supplier-payments` or `/finance`).

# Odoo 19 List View UI Standard Rule
- **No Action Column & Row-Click Detail**: Omit `AKSI` columns from list view tables. Make table rows clickable (`cursor-pointer hover:bg-surface-alt`) to open a slide-over right detail drawer or navigate to full form view page.
- **Contextual Action Bar**: Use checkbox multi-selection per row with a sticky header contextual action bar (`Terpilih (x)` ➔ Print, Duplicate, Export, Delete, Status Change).
- **KPI Summary Cards & Soft Badges**: Display 3-4 KPI metric summary tiles above every table (`<TableKpiCards>`) and enforce standardized Bahasa Indonesia soft pastel badges (`Draf`, `Menunggu`, `Disetujui`, `Dikonversi`, `Ditolak`, `Dibatalkan`, `Selesai`, `Dibayar`).

# Global Layout Navigation & Compact Form Action Bar Rule
- **No Duplicate Back Buttons**: Never add `← Kembali` or back chevron buttons inside form content. Use the back button in the Global Top Header (`app/layout.tsx`) and sync breadcrumbs dynamically (`Pembelian` ➔ `Permintaan Dapur` ➔ `#PR-001`).
- **Compact Form Action Bar (`...` Dropdown)**: Render only 1-2 primary workflow actions directly. Wrap all secondary actions (`Cetak PDF`, `Duplikat`, `Tolak`, `Batalkan`, `Hapus`) into a single overflow dropdown menu (`Lucide MoreHorizontal` / `...` icon).

# Persistent Line Items & Audit Trail Rule
- **Persistent Line Items**: Line item tables must always remain visible across all document lifecycle states (`Draf`, `Menunggu`, `Disetujui`, `Dikonversi`, `Ditolak`). Never collapse or hide line item tables post-conversion.
- **Odoo 19 Smart Buttons**: Render top-right linked document shortcut buttons with document counts (`[ 🛒 1 Purchase Order ➔ ]`).
- **Global Engine Decoupling**: Centralize state transitions in `src/config/stateMachine.ts`, approval thresholds in `src/services/approval/`, and chatter timeline in `src/components/global/DocumentChatter.tsx`.





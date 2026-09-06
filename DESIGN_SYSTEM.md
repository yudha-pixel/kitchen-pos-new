```python
import os

# Let's inspect the environment and write the design system file
print("Working directory:", os.getcwd())


```

```python
content = """# Kitchen POS & ERP Ecosystem — Unified Design System Specification
"""
with open("design-system.md", "w", encoding="utf-8") as f:
    f.write(content)
print("File written successfully:", os.path.exists("design-system.md"))


```

```python
print("Hello world")

```

```python
with open("test.txt", "w") as f:
    f.write("test")


```

```python
1+1

```

Berikut adalah dokumen **Design System lengkap, komprehensif, dan terstandarisasi** dalam format Markdown (`.md`).

Dokumen ini dirancang khusus agar dapat langsung kamu simpan sebagai file `DESIGN_SYSTEM.md` di root repositori proyekmu, lalu dijadikan referensi utama (atau *system prompt / context file*) bagi **Anti-Gravity** saat membangun dan merefaktor setiap modul satu per satu.

---

```markdown
# 🏛️ Kitchen POS & ERP Ecosystem — Unified Design System Specification

> **Version**: 2.0.0 (Enterprise F&B Edition)  
> **Status**: Living Document  
> **Target Platforms**: Next.js App Router (Web ERP/POS), Android/iOS (Native Mobile & Tablets), KDS (Touch Terminal)  
> **Target Agent**: Anti-Gravity / Cursor / Windsurf  

---

## 1. DESIGN PRINCIPLES & PHILOSOPHY

1. **Speed of Service First (Zero Friction)**:
   - Setiap interaksi kasir (*Front of House*) dan staf dapur (*Back of House*) harus dapat diselesaikan dalam hitungan detik.
   - Tidak ada *page-scrolling* penuh pada layar kasir (wajib *fixed 100vh*). Semua aksi kritikal harus *always visible*.

2. **Odoo 19 Enterprise Data Density & Clarity**:
   - Menghapus kolom aksi statis (`AKSI`) pada tabel daftar untuk menghemat *horizontal real-estate*.
   - Menggunakan interaksi *row-click* untuk navigasi ke *Form View* dan *Contextual Action Bar* saat baris dicentang.
   - Struktur dokumen menggunakan pola *Paper Sheet Card* yang dilengkapi `<Notebook>` dan `<Page>` untuk memisahkan rincian item, data operasional, dan audit trail.

3. **Audit-Proof & Persistent Data**:
   - Rincian item barang/bahan tidak boleh hilang ketika status dokumen berubah (misalnya dari PR ke PO).
   - Setiap perubahan status, approval, dan konversi wajib meninggalkan jejak waktu, aktor, dan ID referensi pada komponen `<DocumentChatter>`.

4. **Multi-App Domain Separation**:
   - **Back-Office / ERP Web**: Manajemen rantai pasok (*Purchase*), gudang (*Inventory*), keuangan (*Finance*), dan master data.
   - **Cashier POS**: Antarmuka layar sentuh kasir tablet/desktop 100vh untuk transaksi cepat, denah meja, dan cetak struk.
   - **Kitchen Display System (KDS)**: Layar pemantauan pesanan dapur *real-time* berbasis kartu tiket antrean.
   - **Waiter Mobile Terminal**: Aplikasi genggam pramusaji untuk pencatatan pesanan di meja (*order taking*).
   - **Customer Loyalty App**: Aplikasi pelanggan mandiri untuk pemesanan online, reservasi, dan pengumpulan poin loyalti.

5. **Clean Labeling & Zero-Truncation**:
   - Label navigasi visual maksimal 2–3 kata bahasa Indonesia tanpa tanda kurung akronim.
   - Semua akronim industri (`POS`, `PO`, `GRN`, `BOM`, `KDS`, `CRM`, `OCR`) dialihkan ke properti pencarian `keywords` agar pencarian global (`Ctrl+K`) tetap 100% responsif.

---

## 2. DESIGN TOKENS (TAILWIND SYSTEM)

### 2.1. Color Palette (Dark Mode SaaS Core)

Sistem ERP menggunakan palet dasar Slate/Zinc gelap yang elegan, dengan kontras tinggi untuk teks finansial dan badge status pastel.

```css
/* Core Dark Palette */
--bg-canvas:        #020617; /* bg-slate-950 (Global Page Canvas) */
--bg-surface:       #0f172a; /* bg-slate-900 (Card & Sheet Container) */
--bg-surface-hover: #1e293b; /* bg-slate-800 (Row Hover & Active Pills) */
--bg-surface-elev:  #334155; /* bg-slate-700 (Dropdowns & Modals) */

/* Borders & Dividers */
--border-subtle:    rgba(51, 65, 85, 0.4);  /* border-slate-800/40 */
--border-default:   rgba(51, 65, 85, 0.8);  /* border-slate-800 */
--border-strong:    #475569;                /* border-slate-600 */

/* Typography Colors */
--text-primary:     #f8fafc; /* text-slate-50 (Headings, Main Labels) */
--text-secondary:   #94a3b8; /* text-slate-400 (Descriptions, Timestamps) */
--text-muted:       #64748b; /* text-slate-500 (Placeholders, Column Headers) */
--text-currency:    #f1f5f9; /* text-slate-100 (Bold Numbers / Monospace) */

/* Brand & Accent */
--accent-primary:   #6366f1; /* bg-indigo-500 (Primary Workflow Buttons) */
--accent-primary-h: #4f46e5; /* bg-indigo-600 (Hover) */
--accent-pos:       #10b981; /* bg-emerald-500 (Bayar, Kasir POS Checkout) */
--accent-danger:    #f43f5e; /* bg-rose-500 (Void, Reject, Cancel) */
--accent-warning:   #f59e0b; /* bg-amber-500 (Pending, Attention) */

```

### 2.2. Standardized Status Badge Tokens

Badge status menggunakan format **Soft Pastel Pill** (latar transparan 10%, teks warna solid, border transparan 20–50%). Semua label menggunakan **100% Bahasa Indonesia**:

| Status Sistem | Label Visual | CSS Utility Classes (Tailwind) | Arti Bisnis |
| --- | --- | --- | --- |
| `DRAFT` | **Draf** | `bg-slate-500/10 text-slate-400 border border-slate-700/50` | Dokumen baru dibuat, belum diajukan |
| `PENDING` | **Menunggu** | `bg-amber-500/10 text-amber-400 border border-amber-500/20` | Menunggu verifikasi / approval atasan |
| `APPROVED` | **Disetujui** | `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20` | Disetujui, siap dieksekusi / dipesan |
| `CONVERTED` | **Dikonversi** | `bg-indigo-500/10 text-indigo-400 border border-indigo-500/20` | Telah diteruskan ke dokumen lanjutan (cth: PR ➔ PO) |
| `COMPLETED` | **Selesai** | `bg-cyan-500/10 text-cyan-400 border border-cyan-500/20` | Transaksi tuntas secara operasional |
| `PAID` | **Dibayar** | `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20` | Tagihan telah diselesaikan oleh tim Finance |
| `REJECTED` | **Ditolak** | `bg-rose-500/10 text-rose-400 border border-rose-500/20` | Ditolak saat alur approval |
| `CANCELLED` | **Dibatalkan** | `bg-rose-500/10 text-rose-400 border border-rose-500/20` | Dibatalkan oleh pembuat dokumen |

### 2.3. Operational Badges (Front of House / Back of House)

* **Kasir Utama / Front of House**:
  `bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium`
* **Live Dapur (KDS Pulse Dot)**:
  `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5`
  *(Mengandung animasi pulsing ping: `animate-ping h-2 w-2 rounded-full bg-emerald-400`)*

### 2.4. Typography & Monospace Rules

* **UI Sans-Serif**: `Inter`, `system-ui`, `-apple-system`, `sans-serif`. Digunakan untuk semua label, menu, tombol, dan teks deskripsi.
* **Data Monospace**: `JetBrains Mono`, `Fira Code`, `ui-monospace`.
* **Wajib digunakan pada**:
1. Nomor Kode Dokumen (`#PR-001`, `#PO-202608-9508`).
2. Kode Barang / Bahan Mentah (`ING-001`, `PKG-012`).
3. Nominal Uang & Jumlah Finansial (`Rp 766.000`, `14.50 kg`).





---

## 3. LAYOUT SPECIFICATIONS

### 3.1. Global Shell & Navigation Integration (`app/layout.tsx`)

Aplikasi menggunakan arsitektur **Global Wrapper**:

* **Sidebar Kiri**: Tetap statis (`w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800`). Dapat menciut otomatis (*collapsed*) saat masuk ke mode kasir POS.
* **Header Topbar**: Tetap statis (`h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between`).
* Menampilkan **Breadcrumb Navigasi Dinamis**: `Pembelian / Permintaan Dapur / #PR-001`.
* Mengandung tombol navigasi kembali global (`ChevronLeft`). **Dilarang menambah chevron back-button ganda di dalam body konten**.
* Mengandung indikator koneksi (`● Online`), tombol sinkronisasi ringkas (*dropdown*), dan profil pengguna.


* **Area Konten (`flex-1 overflow-y-auto`)**: Bagian yang di-render ulang saat perpindahan rute.

---

### 3.2. List View Architecture (Odoo 19 Standard)

Tampilan tabel daftar dokumen pada modul *Purchase* dan *Inventory*:

```
+-----------------------------------------------------------------------------------+
|  [KPI STAT CARDS: Total PR | Menunggu | Disetujui | Ditolak]                     |
+-----------------------------------------------------------------------------------+
|  [QUICK STATUS PILLS: Semua (12) | Menunggu (4) | Disetujui (6) | Ditolak (2)]    |
+-----------------------------------------------------------------------------------+
|  [SEARCH BAR: Cari Dokumen...]  [Rentang Tanggal ▼]         [+ Buat Dokumen Baru] |
+-----------------------------------------------------------------------------------+
|  [✓ Contextual Action Bar: Terpilih (2) -> [Cetak] [Duplikat] [Export] [Hapus]]   |
+-----------------------------------------------------------------------------------+
|  [☐] | KODE       | PEMOHON / SUPPLIER | TANGGAL     | NOMINAL      | STATUS      |
|  [☐] | #PR-001    | admin              | 11 Agu 2026 | Rp 766.000   | [Dikonversi]|
|  [☐] | #PR-002    | dapur_central      | 12 Agu 2026 | Rp 1.450.000 | [Menunggu]  |
+-----------------------------------------------------------------------------------+
|  Menampilkan 1 - 10 dari 52 data                          [ < ] Hal 1 dari 6 [ > ]|
+-----------------------------------------------------------------------------------+

```

#### Aturan Ketat List View:

1. **Dilarang menambahkan kolom `AKSI**` di setiap baris tabel.
2. Seluruh baris bersifat interaktif (`cursor-pointer hover:bg-slate-800/80 transition-colors`). Mengklik baris langsung membuka *Form View* (`/purchase/requisitions/[id]`).
3. Disediakan checkbox pada kolom paling kiri. Ketika 1 atau lebih baris dicentang, **Contextual Action Bar** otomatis muncul di header atas atau floating bar bawah.

---

### 3.3. Form View Sheet Architecture (`app/purchase/.../[id]/page.tsx`)

Struktur halaman formulir dokumen penuh mengikuti standar formulir ERP Odoo 19:

```
+-------------------------------------------------------------------------------------------------+
|  #PR-001                          [ 🛒 1 Purchase Order ➔ ]  |  Draf ➔ [ Menunggu ] ➔ Disetujui |
|  ────────────────────────────────────────────────────────────────────────────────────────────── |
|  [ ✓ Setujui ]  [ ✕ Tolak ]  [ ... ▼ ]                                                         |
|                                                                                                 |
|  Pemohon    : [👤 admin]                             Tanggal Pengajuan : 11 Agu 2026, 21:34     |
|  Cabang     : [🏢 Kitchen POS - Utama]               Total Estimasi    : Rp 766.000             |
|  Catatan    : Restok bahan baku mingguan             Status Approval   : Menunggu Manager       |
|  ────────────────────────────────────────────────────────────────────────────────────────────── |
|                                                                                                 |
|  [ RINCIAN ITEM (2) ]          [ INFORMASI LAINNYA ]          [ RIWAYAT & AUDIT (4) ]           |
|  ────────────────────────────────────────────────────────────────────────────────────────────── |
|  [ Cari Item di Sini... ]                                         Menampilkan 1-2 dari 2 item   |
|  | # | Kode   | Nama Bahan     | Qty   | Satuan | Est. Harga | Subtotal   | Catatan           | |
|  |---|--------|----------------|-------|--------|------------|------------|-------------------| |
|  | 1 | ING-01 | Daging Sapi    | 10.0  | kg     | Rp 65.000  | Rp 650.000 | Lemak max 10%     | |
|  | 2 | ING-08 | Bawang Merah   |  4.0  | kg     | Rp 29.000  | Rp 116.000 | Kupas bersih      | |
|  ────────────────────────────────────────────────────────────────────────────────────────────── |
|  Total Item: 2 | Total Qty: 14.0 kg                            TOTAL ESTIMASI: Rp 766.000       |
+-------------------------------------------------------------------------------------------------+

```

#### Aturan Ketat Form View:

1. **Lebar Penuh (`w-full`)**: Menghilangkan batasan sempit `max-w-2xl` / `max-w-4xl` agar tabel rincian bahan tidak terpotong.
2. **Compact Action Bar & Overflow Menu (`...`)**:
* Hanya tampilkan 1–2 tombol alur kerja utama secara langsung (`[ Setujui ]`, `[ Konversi ke PO ]`).
* Sembunyikan aksi sekunder (Cetak PDF, Duplikat, Batal, Hapus) di dalam dropdown menu titik tiga (`...`).


3. **Smart Button Shortcuts**:
* Jika dokumen telah dikonversi (misal PR ➔ PO), tampilkan tombol pintas di kanan atas: `[ 🛒 1 Purchase Order ➔ ]`.
* Di dokumen PO tujuan, tampilkan tombol kembali: `[ 📋 Sumber PR: #PR-001 ➔ ]`.


4. **Line Items Persistent**: Tabel item **tidak boleh hilang atau disembunyikan** setelah status dokumen berubah menjadi *Dikonversi*.
5. **Relasi Master Data Interaktif**: Pemohon, Outlet, Kode Bahan, dan Nomor Dokumen harus berupa tautan/chip interaktif, bukan teks statis mati.

---

### 3.4. POS Screen Layout (Fixed 100vh & 2-Step Checkout)

Layar transaksi kasir F&B wajib mematuhi ketentuan berikut:

* **Viewport**: `h-screen overflow-hidden flex flex-col bg-slate-950`.
* **Kolom Kiri (70% Lebar Layar)**:
* *Search bar* produk di atas deretan chip kategori (`Semua`, `Makanan`, `Minuman`, `Paket`).
* Grid produk dengan rasio foto **1:1 (Square)** atau **16:9 (Landscape)** berukuran ringkas (`h-28` atau `h-32`), sehingga 3–4 baris menu terlihat sekaligus tanpa scroll berat.


* **Kolom Kanan (30% Lebar Layar - Keranjang)**:
* **Zona 1 (Fixed Top)**: Toggle tipe pesanan (*Dine-in*, *Takeaway*, *Delivery*), dropdown pemilih meja ringkas (`[ Pilih Meja ▼ ]`), serta chip ringkas (`[+ Member]`, `[+ Catatan]`).
* **Zona 2 (Middle Scrollable)**: Daftar item pesanan, kuantitas (`+` / `-`), modifiers, dan tombol hapus item.
* **Zona 3 (Sticky Bottom Footer)**:
* Ringkasan: Subtotal, Pajak PBJT 10%, Service Charge 5%, Grand Total.
* Tombol Aksi: `[ KIRIM KE DAPUR ]` (Secondary Outline) dan `[ BAYAR (F1) ]` (Primary Emerald Solid).




* **Step 2 (Payment Modal)**:
* Tombol `BAYAR` atau tombol `F1` memunculkan **Payment Settlement Modal**.
* Form pembayaran, pilihan metode (Tunai, QRIS, Kartu), kalkulator uang pas / pecahan cepat (Rp 50.000, Rp 100.000), serta hitungan kembalian berada di dalam modal ini.



---

## 4. CORE COMPONENT SPECIFICATIONS

### 4.1. `<StatusBadge>`

Komponen visual badge status universal.

```typescript
interface StatusBadgeProps {
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'CONVERTED' | 'COMPLETED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  customLabel?: string;
  size?: 'sm' | 'md';
}

```

* **Prinsip**: Memetakan status backend ke label bahasa Indonesia dan kelas Tailwind yang sesuai dengan *Design Tokens* Bagian 2.2.

---

### 4.2. `<TableKpiCards>`

Baris metrik ringkasan di atas tabel daftar data.

```typescript
interface KpiCardItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'neutral' | 'warning' | 'success' | 'danger';
  icon: React.ComponentType<{ className?: string }>;
}

interface TableKpiCardsProps {
  items: KpiCardItem[];
}

```

---

### 4.3. `<FormStatusBar>`

Bilah status alur kerja (workflow pipeline) di header lembar dokumen.

```typescript
interface WorkflowStep {
  id: string;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface FormStatusBarProps {
  steps: WorkflowStep[];
  currentStatusId: string;
}

```

* **Perilaku**: Jika langkah alur kerja lebih dari 4 tahap, otomatis gunakan format *collapsed breadcrumb step bar* untuk mencegah header kepenuhan.

---

### 4.4. `<Notebook>` & `<Page>`

Abstraksi tab sheet lembar kerja ala Odoo 19.

```tsx
// src/components/ui/form/Notebook.tsx
export function Notebook({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) { ... }

// src/components/ui/form/Page.tsx
export function Page({ id, label, count, children }: { id: string; label: string; count?: number; children: React.ReactNode }) { ... }

```

**Contoh Penggunaan:**

```tsx
<Notebook defaultTab="items">
  <Page count="{record.items.length}" id="items" label="Rincian Item">
    <LineItemsTable items="{record.items}"/>
  </Page>
  <Page id="info" label="Informasi Lainnya">
    <OtherInfoGrid record="{record}"/>
  </Page>
  <Page id="audit" label="Riwayat & Audit">
    <DocumentChatter entityId="{record.id}" entityType="purchase_requisition"/>
  </Page>
</Notebook>

```

---

### 4.5. `<DocumentChatter>`

Mesin pencatat audit trail dan percakapan internal staf.

```typescript
interface AuditLogEvent {
  id: string;
  timestamp: string; // ISO format
  actorName: string;
  actorRole: string;
  actionType: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'CONVERTED' | 'REJECTED' | 'NOTE_ADDED';
  description: string;
}

interface DocumentChatterProps {
  entityType: 'purchase_requisition' | 'purchase_order' | 'vendor_invoice';
  entityId: string;
}

```

* Menampilkan *vertical timeline* berstempel waktu yang tidak dapat dimanipulasi secara manual oleh pengguna (*read-only system audit*), dilengkapi kotak input untuk catatan internal staf.

---

### 4.6. `<SmartButton>`

Pintas penelusuran dokumen relasi di pojok kanan atas lembar dokumen.

```typescript
interface SmartButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  label: string;
  targetHref: string;
  disabled?: boolean;
}

```

* Renders: `[ 🛒 1 Purchase Order ➔ ]` dengan efek highlight hover kontras tinggi.

---

## 5. RESTRUCTURED NAVIGATION & URL ARCHITECTURE

Berikut adalah konfigurasi rute kanonikal untuk modul **Pembelian (Purchase)** dan **Inventaris (Inventory)** yang telah terbebas dari redundansi:

```typescript
// src/config/navigation.ts
export const NAVIGATION_CONFIG = [
  {
    id: 'purchase',
    title: 'Pembelian',
    path: '/purchase',
    subLinks: [
      {
        label: 'Permintaan Dapur',
        path: '/purchase/requisitions',
        keywords: ['pr', 'purchase requisition', 'permintaan', 'dapur', 'stok']
      },
      {
        label: 'Penawaran Harga',
        path: '/purchase/quotations',
        keywords: ['rfq', 'quotation', 'penawaran', 'supplier', 'vendor', 'harga']
      },
      {
        label: 'Pesanan Pembelian',
        path: '/purchase/orders',
        keywords: ['po', 'purchase order', 'pesanan', 'pembelian']
      },
      {
        label: 'Penerimaan Barang',
        path: '/purchase/goods-received',
        keywords: ['grn', 'goods received note', 'penerimaan', 'terima barang']
      },
      {
        label: 'Faktur Supplier',
        path: '/purchase/invoices',
        keywords: ['invoice', 'faktur', 'tagihan', 'supplier', 'vendor bill']
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventaris',
    path: '/inventory',
    subLinks: [
      {
        label: 'Data Barang & Bahan',
        path: '/inventory/items',
        keywords: ['all items', 'bahan baku', 'packaging', 'stok', 'inventory']
      },
      {
        label: 'Kategori Barang',
        path: '/inventory/categories',
        keywords: ['categories', 'kategori', 'bahan', 'kemasan']
      },
      {
        label: 'Penyesuaian Stok',
        path: '/inventory/adjustments',
        keywords: ['stock adjustment', 'opname', 'koreksi stok']
      },
      {
        label: 'Transfer Stok',
        path: '/inventory/transfers',
        keywords: ['stock transfer', 'mutasi', 'pindah gudang']
      },
      {
        label: 'Persetujuan Stok',
        path: '/inventory/approvals',
        keywords: ['stock approvals', 'verifikasi']
      }
    ]
  }
];

```

---

## 6. MULTI-APP SEPARATION ROADMAP

Ketika kamu membangun versi aplikasi mobile atau tablet satu per satu, pisahkan arsitekturnya menjadi **3 pilar terisolasi**:

```
                  ┌─────────────────────────────────────┐
                  │          Central Cloud API          │
                  │   PostgreSQL / Supabase + NestJS    │
                  └──────────────────┬──────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│     App 1: POS       │  │     App 2: KDS       │  │  App 3: Customer App │
│ (Outlet Terminal)    │  │ (Kitchen Display)    │  │  (Mobile Smartphone) │
│ • Android Tablet     │  │ • Android/Smart TV   │  │ • iOS (Swift) /      │
│ • Kotlin / Compose   │  │ • Real-time WebSock  │  │   Android (Kotlin)   │
│ • Local Printer LAN  │  │ • Touch Ticket Card  │  │ • QRIS / E-Wallet    │
│ • Offline Sync SQLite│  │ • Audio Alerts       │  │ • Poin & Menu Promo  │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘

```

1. **POS Cashier App (Dedicated Tablet Application)**:
* **Platform Rekomendasi**: Android Native (Kotlin + Jetpack Compose) karena 90% hardware mesin kasir dan terminal EDC berbasis Android.
* **Spesialisasi**: Integrasi printer thermal (ESC/POS via Bluetooth/LAN/USB), laci kas (*cash drawer* RJ11), barcode scanner hardware, dan penyimpanan offline lokal (*Room DB / SQLite*).


2. **Customer Ordering & Loyalty App**:
* **Platform Rekomendasi**: Mobile App publik (iOS via Swift & Android via Kotlin, atau lintas platform Flutter) yang didistribusikan lewat App Store / Google Play Store.
* **Spesialisasi**: Katalog foto makanan menggugah selera, penukaran voucher, saldo membership, notifikasi status pesanan, dan Payment Gateway QRIS.


3. **Pemisahan Hak Akses**:
* Endpoint autentikasi POS kasir wajib menggunakan validasi PIN staf outlet dan lisensi perangkat (*device token*), sedangkan Customer App menggunakan nomor ponsel OTP atau OAuth Google/Apple.



---

## 7. ATURAN IMPLEMENTASI UNTUK ANTI-GRAVITY

Saat memberikan tugas perombakan atau pembuatan modul ke **Anti-Gravity**, sertakan aturan teknis berikut di baris pertama prompt:

```text
[ANTI-GRAVITY STRICT DIRECTIVES]
1. Ikuti sepenuhnya token dan struktur di DESIGN_SYSTEM.md.
2. Jangan pernah menambahkan inline styles CSS; gunakan kelas utilitas Tailwind yang sudah disepakati.
3. Pertahankan layout 100% viewport height (h-screen overflow-hidden) pada layar POS.
4. Jangan membuat chevron/tombol back baru di dalam kontainer konten jika sudah tersedia di Global Header Wrapper.
5. Gunakan font monospace (font-mono font-semibold) untuk nomor kode (#PR-..., #PO-..., ING-...) dan nilai nominal mata uang.
6. Pastikan seluruh badge status menggunakan label Bahasa Indonesia baku dengan style soft-pastel pill.
7. Jalankan 'npx tsc --noEmit' setelah modifikasi untuk memastikan nol error tipe TypeScript.

```

```

---

### 💡 Panduan Langkah Pengerjaan Satu per Satu dengan Anti-Gravity:

Karena kamu ingin menyelesaikan aplikasinya secara bertahap, berikut urutan eksekusi modul yang paling aman dan terstruktur:

1. **Simpan Dokumen Ini**:
   Buat file bernama `DESIGN_SYSTEM.md` di folder utama (root) proyekmu, lalu *paste* seluruh isi di atas.
2. **Fase 1 — Web Purchase & Inventory (Selesaikan Modul Web Dulu)**:
   Minta Anti-Gravity menyelesaikan perbaikan rute `/purchase/*`, tabel ala Odoo 19 tanpa kolom AKSI, dan *Full Form View* dengan referensi file `DESIGN_SYSTEM.md` di atas.
3. **Fase 2 — Web POS Cashier (Refactor Screen 100vh & 2-Step Checkout)**:
   Minta Anti-Gravity menyederhanakan kolom kanan keranjang kasir menjadi *order building* dan memindahkan pembayaran ke *Modal Checkout*.
4. **Fase 3 — Setup Mobile Native Project (POS Kasir Android Tablet)**:
   Buat proyek Android Studio baru (Kotlin + Jetpack Compose) khusus kasir, memanfaatkan endpoint API backend yang sudah stabil dari Fase 1 dan 2.

```
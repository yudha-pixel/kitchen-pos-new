import { PERMISSIONS, type PermissionName } from './permissions';
import type { Tone as BadgeTone } from '@/src/components/ui/Badge';

export interface AppModuleBadge {
  label: string;
  // 'primary' = core/most-used module; 'info' = new/updated; 'success' = live/technical
  // capability (real-time, offline-ready); 'neutral' = operational area (FOH/BOH).
  tone: BadgeTone;
}

export interface AppChildLink {
  label: string;
  href: string;
  iconName?: string;
  requiredPermission: PermissionName;
}

export interface AppDefinition {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'operations' | 'inventory' | 'people' | 'finance' | 'admin';
  categoryLabel: string;
  iconName: string;
  route: string;
  subLinks: AppChildLink[];
  badge?: AppModuleBadge;
  requiredPermission: PermissionName;
  keywords: string[];
}

export const APPS_REGISTRY: AppDefinition[] = [
  {
    id: 'pos',
    title: 'Point of Sale',
    description: 'Kelola transaksi kasir, pesanan, dan pembayaran pelanggan.',
    category: 'sales',
    categoryLabel: 'Penjualan',
    iconName: 'ShoppingCart',
    route: '/pos',
    requiredPermission: PERMISSIONS.orders.create,
    // Offline-first: this module keeps taking orders on IndexedDB + a sync queue when the LAN/API drops.
    badge: { label: 'Offline-Ready', tone: 'success' },
    keywords: ['pos', 'kasir', 'waiter', 'order', 'table', 'meja', 'sesi', 'shift', 'penjualan', 'checkout'],
    subLinks: [
      { label: 'Kasir Utama', href: '/pos', iconName: 'Store', requiredPermission: PERMISSIONS.orders.create },
      { label: 'Pesanan Waiter', href: '/waiter', iconName: 'ConciergeBell', requiredPermission: PERMISSIONS.orders.create },
      { label: 'Denah Meja', href: '/pos/meja', iconName: 'Armchair', requiredPermission: PERMISSIONS.tables.view },
      { label: 'Sesi Kasir', href: '/shift', iconName: 'Clock', requiredPermission: PERMISSIONS.orders.create },
      { label: 'Permintaan Dapur/Gudang', href: '/kasir/stock-request', iconName: 'Package', requiredPermission: PERMISSIONS.inventory.adjust },
    ],
  },
  {
    id: 'kitchen',
    title: 'Kitchen Display',
    description: 'Tampilkan dan kelola pesanan dapur secara real-time.',
    category: 'operations',
    categoryLabel: 'Operasional',
    iconName: 'Monitor',
    route: '/kitchen',
    requiredPermission: PERMISSIONS.kitchen.view,
    badge: { label: 'Live', tone: 'success' },
    keywords: ['kds', 'dapur', 'kitchen', 'layar dapur', 'pesanan', 'masak', 'chef', 'antrean', 'kitchen display'],
    subLinks: [
      { label: 'Layar Dapur', href: '/kitchen', iconName: 'ChefHat', requiredPermission: PERMISSIONS.kitchen.view },
    ],
  },
  {
    id: 'menu-products',
    title: 'Menu & Products',
    description: 'Kelola menu, paket, modifier, dan harga produk.',
    category: 'inventory',
    categoryLabel: 'Produk & Inventori',
    iconName: 'UtensilsCrossed',
    route: '/products',
    requiredPermission: PERMISSIONS.products.view,
    keywords: ['produk', 'menu', 'daftar menu', 'kategori', 'modifier', 'resep', 'mapping resep', 'harga', 'bom', 'bill of materials', 'product', 'catalog'],
    subLinks: [
      { label: 'Daftar Menu', href: '/products', iconName: 'Utensils', requiredPermission: PERMISSIONS.products.view },
      { label: 'Mapping Resep', href: '/inventory/mapping', iconName: 'Layers', requiredPermission: PERMISSIONS.products.recipesManage },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Pantau stok bahan baku dan pergerakan inventori.',
    category: 'inventory',
    categoryLabel: 'Produk & Inventori',
    iconName: 'Box',
    route: '/inventory',
    requiredPermission: PERMISSIONS.inventory.view,
    badge: { label: 'BOH', tone: 'neutral' },
    keywords: ['inventori', 'stok', 'barang', 'bahan', 'persetujuan', 'penyesuaian', 'transfer', 'otomatisasi', 'kategori barang', 'items', 'approval', 'adjustment', 'automation'],
    subLinks: [
      { label: 'Data Barang & Bahan', href: '/inventory', iconName: 'PackageOpen', requiredPermission: PERMISSIONS.inventory.view },
      { label: 'Persetujuan Stok', href: '/inventory/stock-approvals', iconName: 'ClipboardCheck', requiredPermission: PERMISSIONS.inventory.approve },
      { label: 'Persetujuan Stok Cepat', href: '/inventory/quick-stock-requests', iconName: 'ClipboardCheck', requiredPermission: PERMISSIONS.inventory.approve },
      { label: 'Kategori Barang', href: '/inventory/categories', iconName: 'Tags', requiredPermission: PERMISSIONS.inventory.view },
      { label: 'Penyesuaian Stok', href: '/inventory/stock-adjustments', iconName: 'SlidersHorizontal', requiredPermission: PERMISSIONS.inventory.adjust },
      { label: 'Transfer Stok', href: '/inventory/stock-transfers', iconName: 'ArrowLeftRight', requiredPermission: PERMISSIONS.inventory.transfer },
      { label: 'Otomatisasi Stok', href: '/inventory/automation', iconName: 'Workflow', requiredPermission: PERMISSIONS.inventory.edit },
    ],
  },
  {
    id: 'purchase-suppliers',
    title: 'Purchase & Suppliers',
    description: 'Kelola pembelian, supplier, dan pembayaran.',
    category: 'inventory',
    categoryLabel: 'Produk & Inventori',
    iconName: 'ShoppingBag',
    route: '/inventory-suppliers',
    requiredPermission: PERMISSIONS.purchasing.view,
    badge: { label: 'BOH', tone: 'neutral' },
    keywords: ['pembelian', 'supplier', 'pemasok', 'pesanan pembelian', 'penerimaan barang', 'faktur', 'pembayaran', 'quotation', 'po', 'grn', 'invoice', 'purchase order', 'goods received note', 'purchase requisition', 'pr'],
    subLinks: [
      { label: 'Data Supplier', href: '/inventory-suppliers', iconName: 'Truck', requiredPermission: PERMISSIONS.purchasing.view },
      { label: 'Purchase Requisition', href: '/inventory/purchase-requisitions', iconName: 'FileStack', requiredPermission: PERMISSIONS.purchasing.view },
      { label: 'Permintaan Penawaran', href: '/inventory/quotation-requests', iconName: 'FileSearch', requiredPermission: PERMISSIONS.purchasing.create },
      { label: 'Penawaran Supplier', href: '/inventory/quotations', iconName: 'FileText', requiredPermission: PERMISSIONS.purchasing.edit },
      { label: 'Pesanan Pembelian', href: '/inventory/purchase-orders', iconName: 'ClipboardList', requiredPermission: PERMISSIONS.purchasing.create },
      { label: 'Penerimaan Barang', href: '/inventory/goods-received-notes', iconName: 'PackageCheck', requiredPermission: PERMISSIONS.purchasing.receive },
      { label: 'Faktur Supplier', href: '/inventory/invoices', iconName: 'Receipt', requiredPermission: PERMISSIONS.purchasing.view },
      { label: 'Pembayaran Supplier', href: '/inventory/supplier-payments', iconName: 'CreditCard', requiredPermission: PERMISSIONS.purchasing.pay },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    description: 'Kelola pelanggan, leads, dan aktivitas penjualan.',
    category: 'sales',
    categoryLabel: 'Penjualan',
    iconName: 'Users',
    route: '/crm',
    requiredPermission: PERMISSIONS.crm.view,
    badge: { label: 'FOH', tone: 'neutral' },
    keywords: ['crm', 'pelanggan', 'data pelanggan', 'leads', 'loyalty', 'poin', 'customer', 'customer relationship management'],
    subLinks: [
      { label: 'Data Pelanggan', href: '/crm', iconName: 'UserCircle', requiredPermission: PERMISSIONS.crm.view },
    ],
  },
  {
    id: 'promotions',
    title: 'Promotions',
    description: 'Buat dan kelola promo, diskon, dan voucher pelanggan.',
    category: 'sales',
    categoryLabel: 'Penjualan',
    iconName: 'Tag',
    route: '/promotions',
    requiredPermission: PERMISSIONS.promotions.view,
    badge: { label: 'FOH', tone: 'neutral' },
    keywords: ['promotions', 'promo', 'diskon', 'voucher', 'potongan'],
    subLinks: [
      { label: 'Promosi Otomatis', href: '/promotions', iconName: 'Sparkles', requiredPermission: PERMISSIONS.promotions.view },
      { label: 'Voucher Belanja', href: '/promotions/vouchers', iconName: 'Ticket', requiredPermission: PERMISSIONS.promotions.view },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Kelola kehadiran dan jadwal karyawan.',
    category: 'people',
    categoryLabel: 'SDM & Pegawai',
    iconName: 'CalendarCheck',
    route: '/attendance',
    requiredPermission: PERMISSIONS.attendance.view,
    keywords: ['attendance', 'absensi', 'kehadiran', 'shift', 'jadwal', 'selfie'],
    subLinks: [
      { label: 'Absensi Selfie', href: '/attendance', iconName: 'Camera', requiredPermission: PERMISSIONS.attendance.view },
    ],
  },
  {
    id: 'hr-payroll',
    title: 'HR & Payroll',
    description: 'Kelola data karyawan, payroll, dan kompensasi.',
    category: 'people',
    categoryLabel: 'SDM & Pegawai',
    iconName: 'IdCard',
    route: '/hr',
    requiredPermission: PERMISSIONS.hr.view,
    keywords: ['hr', 'payroll', 'karyawan', 'gaji', 'kompensasi', 'pegawai'],
    subLinks: [
      { label: 'Data Karyawan', href: '/hr', iconName: 'Contact', requiredPermission: PERMISSIONS.hr.view },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    description: 'Kelola kas, bank, biaya, dan jurnal akuntansi.',
    category: 'finance',
    categoryLabel: 'Keuangan',
    iconName: 'Wallet',
    route: '/finance/ocr',
    requiredPermission: PERMISSIONS.finance.view,
    keywords: ['finance', 'keuangan', 'kas', 'bank', 'biaya', 'jurnal', 'pemindaian faktur', 'ocr', 'faktur', 'invoice', 'optical character recognition', 'petty cash', 'kas kecil'],
    subLinks: [
      { label: 'Pemindaian Faktur', href: '/finance/ocr', iconName: 'ScanLine', requiredPermission: PERMISSIONS.finance.view },
      { label: 'Riwayat Petty Cash', href: '/finance/petty-cash', iconName: 'Wallet', requiredPermission: PERMISSIONS.finance.view },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Lihat laporan penjualan, operasional, dan keuangan.',
    category: 'finance',
    categoryLabel: 'Keuangan',
    iconName: 'BarChart3',
    route: '/reports',
    requiredPermission: PERMISSIONS.reports.view,
    keywords: ['reports', 'laporan', 'ringkasan laporan', 'penjualan', 'operasional', 'keuangan', 'analisis'],
    subLinks: [
      { label: 'Ringkasan Laporan', href: '/reports', iconName: 'LineChart', requiredPermission: PERMISSIONS.reports.view },
      { label: 'Laporan Diskon', href: '/reports/discounts', iconName: 'Percent', requiredPermission: PERMISSIONS.reports.view },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Atur konfigurasi sistem, peran, dan preferensi.',
    category: 'admin',
    categoryLabel: 'Pengaturan',
    iconName: 'Settings',
    route: '/settings',
    requiredPermission: PERMISSIONS.settings.view,
    keywords: ['settings', 'pengaturan', 'konfigurasi', 'sistem', 'peran', 'preferensi', 'data perusahaan', 'data outlet', 'outlet'],
    subLinks: [
      { label: 'Data Perusahaan', href: '/settings/company', iconName: 'Building2', requiredPermission: PERMISSIONS.settings.view },
      { label: 'Pengaturan Sistem', href: '/settings', iconName: 'Settings2', requiredPermission: PERMISSIONS.settings.view },
      { label: 'Data Outlet', href: '/settings/outlets', iconName: 'MapPin', requiredPermission: PERMISSIONS.outlets.view },
      { label: 'Pengaturan Tampilan POS', href: '/pos/settings', iconName: 'Palette', requiredPermission: PERMISSIONS.settings.view },
      { label: 'Modul Internal', href: '/settings/modules', iconName: 'Puzzle', requiredPermission: PERMISSIONS.modules.view },
    ],
  },
];

export function getAppsRegistry(): AppDefinition[] {
  return APPS_REGISTRY;
}

// Resolves which module owns a given pathname, so the shared Header/Sidebar
// can render a module-scoped breadcrumb and rail instead of one global menu.
export function findModuleForPath(pathname: string): AppDefinition | null {
  const exact = APPS_REGISTRY.find(
    (app) => app.route === pathname || app.subLinks.some((sub) => sub.href === pathname)
  );
  if (exact) return exact;
  const prefixed = APPS_REGISTRY.find(
    (app) =>
      pathname.startsWith(`${app.route}/`) ||
      app.subLinks.some((sub) => pathname.startsWith(`${sub.href}/`))
  );
  return prefixed || null;
}

export function findRequiredPermissionForPath(pathname: string): PermissionName | null {
  const app = findModuleForPath(pathname);
  if (!app) return null;
  const matchingChild = app.subLinks.find((sub) => {
    const childPath = sub.href.split('?')[0];
    return pathname === childPath || pathname.startsWith(`${childPath}/`);
  });
  return matchingChild?.requiredPermission ?? app.requiredPermission;
}

export function filterApps(
  apps: AppDefinition[],
  query: string,
  permissions?: readonly PermissionName[],
): AppDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();

  return apps.filter((app) => {
    if (permissions && !permissions.includes(app.requiredPermission)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    // Match title, description, category, or keywords
    const matchesTitle = app.title.toLowerCase().includes(normalizedQuery);
    const matchesDescription = app.description.toLowerCase().includes(normalizedQuery);
    const matchesCategory = app.categoryLabel.toLowerCase().includes(normalizedQuery);
    const matchesKeywords = app.keywords.some((k) => k.toLowerCase().includes(normalizedQuery));
    const matchesSubLink = app.subLinks.some((sub) => sub.label.toLowerCase().includes(normalizedQuery));

    return matchesTitle || matchesDescription || matchesCategory || matchesKeywords || matchesSubLink;
  });
}

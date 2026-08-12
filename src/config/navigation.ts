import { PERMISSIONS, type PermissionName } from './permissions';

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
  badge?: string;
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
    badge: 'Utama',
    keywords: ['pos', 'kasir', 'waiter', 'meja', 'shift', 'penjualan', 'checkout'],
    subLinks: [
      { label: 'POS Utama', href: '/pos', requiredPermission: PERMISSIONS.orders.create },
      { label: 'Waiter POS', href: '/waiter', requiredPermission: PERMISSIONS.orders.create },
      { label: 'Manajemen Meja', href: '/pos/meja', requiredPermission: PERMISSIONS.tables.view },
      { label: 'Buka/Tutup Shift', href: '/shift', requiredPermission: PERMISSIONS.orders.create },
      { label: 'Kasir Klasik', href: '/kasir', requiredPermission: PERMISSIONS.orders.create },
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
    badge: 'Real-time',
    keywords: ['kds', 'dapur', 'kitchen', 'pesanan', 'masak', 'chef', 'antrean'],
    subLinks: [
      { label: 'KDS Dapur', href: '/kitchen', requiredPermission: PERMISSIONS.kitchen.view },
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
    keywords: ['produk', 'menu', 'kategori', 'modifier', 'resep', 'mapping', 'harga'],
    subLinks: [
      { label: 'Manajemen Produk', href: '/products', requiredPermission: PERMISSIONS.products.view },
      { label: 'Mapping Resep (BOM)', href: '/inventory/mapping', requiredPermission: PERMISSIONS.products.recipesManage },
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
    keywords: ['inventori', 'stok', 'bahan baku', 'supplier', 'approval', 'write-off', 'automation'],
    subLinks: [
      { label: 'All Items', href: '/inventory', iconName: 'PackageOpen', requiredPermission: PERMISSIONS.inventory.view },
      { label: 'Stock Approvals', href: '/inventory/stock-approvals', iconName: 'ClipboardCheck', requiredPermission: PERMISSIONS.inventory.approve },
      { label: 'Categories', href: '/products', iconName: 'Tags', requiredPermission: PERMISSIONS.products.view },
      { label: 'Stock Adjustments', href: '/inventory?view=adjustments', iconName: 'SlidersHorizontal', requiredPermission: PERMISSIONS.inventory.adjust },
      { label: 'Stock Transfers', href: '/inventory/stock-approvals?view=transfers', iconName: 'ArrowLeftRight', requiredPermission: PERMISSIONS.inventory.transfer },
      { label: 'Suppliers', href: '/inventory-suppliers', iconName: 'Truck', requiredPermission: PERMISSIONS.purchasing.view },
      { label: 'Automation', href: '/inventory/automation', iconName: 'Workflow', requiredPermission: PERMISSIONS.inventory.edit },
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
    keywords: ['pembelian', 'supplier', 'pemasok', 'order', 'po', 'pembayaran', 'quotation', 'invoice', 'grn'],
    subLinks: [
      { label: 'Manajemen Supplier', href: '/inventory-suppliers', requiredPermission: PERMISSIONS.purchasing.view },
      { label: 'Permintaan Penawaran', href: '/inventory/quotation-requests', requiredPermission: PERMISSIONS.purchasing.create },
      { label: 'Penawaran Supplier', href: '/inventory/quotations', requiredPermission: PERMISSIONS.purchasing.edit },
      { label: 'Purchase Order', href: '/inventory/purchase-orders', requiredPermission: PERMISSIONS.purchasing.create },
      { label: 'Goods Received Note', href: '/inventory/goods-received-notes', requiredPermission: PERMISSIONS.purchasing.receive },
      { label: 'Invoice Supplier', href: '/inventory/invoices', requiredPermission: PERMISSIONS.purchasing.view },
      { label: 'Pembayaran Supplier', href: '/inventory/supplier-payments', requiredPermission: PERMISSIONS.purchasing.pay },
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
    keywords: ['crm', 'pelanggan', 'leads', 'loyalty', 'poin', 'pelanggan'],
    subLinks: [
      { label: 'Data Pelanggan (CRM)', href: '/crm', requiredPermission: PERMISSIONS.crm.view },
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
    keywords: ['promotions', 'promo', 'diskon', 'voucher', 'potongan'],
    subLinks: [
      { label: 'Promosi Otomatis', href: '/promotions', requiredPermission: PERMISSIONS.promotions.view },
      { label: 'Voucher Belanja', href: '/promotions/vouchers', requiredPermission: PERMISSIONS.promotions.view },
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
      { label: 'Absensi Selfie', href: '/attendance', requiredPermission: PERMISSIONS.attendance.view },
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
      { label: 'Data Karyawan', href: '/hr', requiredPermission: PERMISSIONS.hr.view },
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
    keywords: ['finance', 'keuangan', 'kas', 'bank', 'biaya', 'jurnal', 'ocr', 'faktur'],
    subLinks: [
      { label: 'Pemindaian Faktur (OCR)', href: '/finance/ocr', requiredPermission: PERMISSIONS.finance.view },
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
    keywords: ['reports', 'laporan', 'penjualan', 'operasional', 'keuangan', 'analisis'],
    subLinks: [
      { label: 'Laporan Keseluruhan', href: '/reports', requiredPermission: PERMISSIONS.reports.view },
      { label: 'Laporan Diskon', href: '/reports/discounts', requiredPermission: PERMISSIONS.reports.view },
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
    keywords: ['settings', 'pengaturan', 'konfigurasi', 'sistem', 'peran', 'preferensi', 'outlet'],
    subLinks: [
      { label: 'Pengaturan Sistem', href: '/settings', requiredPermission: PERMISSIONS.settings.view },
      { label: 'Manajemen Outlet', href: '/settings/outlets', requiredPermission: PERMISSIONS.outlets.view },
      { label: 'Pengaturan Tampilan POS', href: '/pos/settings', requiredPermission: PERMISSIONS.settings.view },
      { label: 'Modul Internal', href: '/settings/modules', requiredPermission: PERMISSIONS.modules.view },
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

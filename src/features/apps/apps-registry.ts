export interface AppChildLink {
  label: string;
  href: string;
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
  allowedRoles?: string[];
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
    badge: 'Utama',
    keywords: ['pos', 'kasir', 'waiter', 'meja', 'shift', 'penjualan', 'checkout'],
    subLinks: [
      { label: 'POS Utama', href: '/pos' },
      { label: 'Waiter POS', href: '/waiter' },
      { label: 'Manajemen Meja', href: '/pos/meja' },
      { label: 'Buka/Tutup Shift', href: '/shift' },
      { label: 'Kasir Klasik', href: '/kasir' },
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
    badge: 'Real-time',
    keywords: ['kds', 'dapur', 'kitchen', 'pesanan', 'masak', 'chef', 'antrean'],
    subLinks: [
      { label: 'KDS Dapur', href: '/kitchen' },
      { label: 'Self Order Status', href: '/order-status' },
    ],
  },
  {
    id: 'menu-products',
    title: 'Menu & Products',
    description: 'Kelola menu, paket, modifier, dan harga produk.',
    category: 'inventory',
    categoryLabel: 'Produk & Inventori',
    iconName: 'UtensilsCrossed',
    route: '/admin/products',
    keywords: ['produk', 'menu', 'kategori', 'modifier', 'resep', 'mapping', 'harga'],
    subLinks: [
      { label: 'Manajemen Produk', href: '/admin/products' },
      { label: 'Mapping Resep (BOM)', href: '/inventory/mapping' },
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
    keywords: ['inventori', 'stok', 'bahan baku', 'supplier', 'approval', 'write-off', 'automation'],
    subLinks: [
      { label: 'Ringkasan Stok', href: '/inventory' },
      { label: 'Approval Stok', href: '/inventory/stock-approvals' },
      { label: 'Otomatisasi Restok', href: '/inventory/automation' },
    ],
  },
  {
    id: 'purchase-suppliers',
    title: 'Purchase & Suppliers',
    description: 'Kelola pembelian, supplier, dan pembayaran.',
    category: 'inventory',
    categoryLabel: 'Produk & Inventori',
    iconName: 'ShoppingBag',
    route: '/inventory/suppliers',
    keywords: ['pembelian', 'supplier', 'pemasok', 'order', 'po', 'pembayaran'],
    subLinks: [
      { label: 'Manajemen Supplier', href: '/inventory/suppliers' },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    description: 'Kelola pelanggan, leads, dan aktivitas penjualan.',
    category: 'sales',
    categoryLabel: 'Penjualan',
    iconName: 'Users',
    route: '/admin/crm',
    keywords: ['crm', 'pelanggan', 'leads', 'loyalty', 'poin', 'pelanggan'],
    subLinks: [
      { label: 'Data Pelanggan (CRM)', href: '/admin/crm' },
    ],
  },
  {
    id: 'promotions',
    title: 'Promotions',
    description: 'Buat dan kelola promo, diskon, dan voucher pelanggan.',
    category: 'sales',
    categoryLabel: 'Penjualan',
    iconName: 'Tag',
    route: '/admin/vouchers',
    keywords: ['promotions', 'promo', 'diskon', 'voucher', 'potongan'],
    subLinks: [
      { label: 'Voucer Belanja', href: '/admin/vouchers' },
      { label: 'Promosi Otomatis', href: '/admin/promotions' },
    ],
  },
  {
    id: 'attendance',
    title: 'Attendance',
    description: 'Kelola kehadiran dan jadwal karyawan.',
    category: 'people',
    categoryLabel: 'SDM & Pegawai',
    iconName: 'CalendarCheck',
    route: '/admin/attendance',
    keywords: ['attendance', 'absensi', 'kehadiran', 'shift', 'jadwal', 'selfie'],
    subLinks: [
      { label: 'Absensi Selfie', href: '/admin/attendance' },
    ],
  },
  {
    id: 'hr-payroll',
    title: 'HR & Payroll',
    description: 'Kelola data karyawan, payroll, dan kompensasi.',
    category: 'people',
    categoryLabel: 'SDM & Pegawai',
    iconName: 'IdCard',
    route: '/admin/hr',
    keywords: ['hr', 'payroll', 'karyawan', 'gaji', 'kompensasi', 'pegawai'],
    subLinks: [
      { label: 'Data Karyawan', href: '/admin/hr' },
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
    keywords: ['finance', 'keuangan', 'kas', 'bank', 'biaya', 'jurnal', 'ocr', 'faktur'],
    subLinks: [
      { label: 'Pemindaian Faktur (OCR)', href: '/finance/ocr' },
    ],
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Lihat laporan penjualan, operasional, dan keuangan.',
    category: 'finance',
    categoryLabel: 'Keuangan',
    iconName: 'BarChart3',
    route: '/admin/reports',
    keywords: ['reports', 'laporan', 'penjualan', 'operasional', 'keuangan', 'analisis'],
    subLinks: [
      { label: 'Laporan Keseluruhan', href: '/admin/reports' },
      { label: 'Laporan Diskon', href: '/admin/discount-reports' },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Atur konfigurasi sistem, peran, dan preferensi.',
    category: 'admin',
    categoryLabel: 'Pengaturan',
    iconName: 'Settings',
    route: '/admin/settings',
    keywords: ['settings', 'pengaturan', 'konfigurasi', 'sistem', 'peran', 'preferensi', 'outlet'],
    subLinks: [
      { label: 'Pengaturan Sistem', href: '/admin/settings' },
      { label: 'Manajemen Outlet', href: '/admin/outlets' },
      { label: 'Pengaturan Tampilan POS', href: '/pos/settings' },
    ],
  },
];

export function getAppsRegistry(): AppDefinition[] {
  return APPS_REGISTRY;
}

export function filterApps(
  apps: AppDefinition[],
  query: string,
  role?: string
): AppDefinition[] {
  const normalizedQuery = query.trim().toLowerCase();

  return apps.filter((app) => {
    // Check role restriction if specified
    if (role && app.allowedRoles && !app.allowedRoles.includes(role)) {
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

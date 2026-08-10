'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import {
  ShoppingCart,
  ChefHat,
  Settings,
  Table,
  Users,
  Clock,
  ChevronLeft,
  ChevronDown,
  LayoutGrid,
  BarChart3,
  HeartHandshake,
  IdCard,
  Package,
  ClipboardList,
  Boxes,
  Percent,
  Wallet,
  Tag,
  UserPlus,
  TrendingUp,
  Check,
  Building2,
  Utensils,
  FileText,
  Smartphone,
} from 'lucide-react';

interface SidebarProps {
  // Category filter props removed
}

const cashierLinks = [
  { href: '/waiter', label: 'Waiter POS', icon: Smartphone },
  { href: '/pos/meja', label: 'Manajemen Meja', icon: Table },
  { href: '/pos/settings', label: 'Pengaturan Tampilan', icon: Settings },
  { href: '/admin/crm', label: 'Data Pelanggan', icon: Users },
  { href: '/shift', label: 'Buka/Tutup Shift', icon: Clock },
];


const adminLinks = [
  { href: '/admin/outlets', label: 'Manajemen Outlet', icon: Building2 },
  { href: '/admin/crm', label: 'Pelanggan & CRM', icon: HeartHandshake },
  { href: '/admin/hr', label: 'HR & Payroll', icon: IdCard },
  { href: '/admin/attendance', label: 'Absensi (Selfie)', icon: Clock },
  { href: '/admin/reports', label: 'Laporan Keseluruhan', icon: FileText },
  { href: '/admin/settings', label: 'Pengaturan Sistem', icon: Settings },
];

const dashboardSubLinks = [
  { href: '/admin/products', label: 'Manajemen Produk', icon: Package },
  { href: '/inventory', label: 'Inventori', icon: Boxes },
  { href: '/inventory/mapping', label: 'Mapping Resep', icon: ClipboardList },
  { href: '/inventory/automation', label: 'Otomatisasi Pengadaan', icon: Boxes },
  { href: '/inventory/suppliers', label: 'Manajemen Supplier', icon: Building2 },
  { href: '/inventory/stock-approvals', label: 'Persetujuan Stok', icon: Check },
  { href: '/admin/discount-reports', label: 'Laporan Diskon', icon: Percent },
  { href: '/admin/vouchers', label: 'Manajemen Voucer', icon: Tag },
  { href: '/admin/crm', label: 'Pelanggan & CRM', icon: UserPlus },
  { href: '/admin/promotions', label: 'Promosi Otomatis', icon: TrendingUp },
];

const financeSubLinks = [
  { href: '/finance/ocr', label: 'Pemindaian Faktur (OCR)', icon: Wallet },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [posOpen, setPosOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith('/admin') || pathname?.startsWith('/inventory');
  const { user } = useAuth();

  const navLinkClass = (active: boolean) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-primary text-on-primary' : 'text-ink-secondary hover:bg-surface-alt'
    }`;


  return (
    <nav
      aria-label="Navigasi utama"
      className={`${isOpen ? 'w-64' : 'w-16'} flex flex-col border-r border-line bg-surface transition-all duration-200`}
    >
      {/* Header + toggle */}
      <div className="flex items-center justify-between border-b border-line p-3">
        {isOpen && <span className="px-1 text-base font-bold text-ink">Kitchen POS</span>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Tutup sidebar' : 'Buka sidebar'}
          aria-expanded={isOpen}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt"
        >
          <ChevronLeft className={`h-5 w-5 transition-transform duration-200 ${isOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* MODUL APLIKASI */}
      {isOpen && (
        <h3 className="mb-1 px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          MODUL APLIKASI
        </h3>
      )}
      <div className="flex-1 overflow-y-auto p-2">
        {/* POS (Kasir) - Expandable */}
        <div>
          <button
            onClick={() => setPosOpen(!posOpen)}
            className={`${navLinkClass(false)} ${isOpen ? '' : 'justify-center px-0'} w-full`}
            title={isOpen ? undefined : 'POS (Kasir)'}
          >
            <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden="true" />
            {isOpen && (
              <>
                <span>POS (Kasir)</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${posOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {posOpen && isOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {cashierLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`${navLinkClass(!!active)} pl-3`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* POS (menu) */}
        <Link
          href="/pos"
          aria-current={pathname === '/pos' ? 'page' : undefined}
          title={isOpen ? undefined : 'POS (menu)'}
          className={`${navLinkClass(pathname === '/pos')} ${isOpen ? '' : 'justify-center px-0'}`}
        >
          <Utensils className="h-5 w-5 shrink-0" aria-hidden="true" />
          {isOpen && 'POS (menu)'}
        </Link>

        {/* KDS (Dapur) */}
        <Link
          href="/kitchen"
          aria-current={pathname === '/kitchen' ? 'page' : undefined}
          title={isOpen ? undefined : 'KDS (Dapur)'}
          className={`${navLinkClass(pathname === '/kitchen')} ${isOpen ? '' : 'justify-center px-0'}`}
        >
          <ChefHat className="h-5 w-5 shrink-0" aria-hidden="true" />
          {isOpen && 'KDS (Dapur)'}
        </Link>

        {/* BACK OFFICE/MANAJEMEN ERP */}
        {isOpen && (
          <h3 className="mb-1 px-3 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            BACK OFFICE/MANAJEMEN ERP
          </h3>
        )}
        
        {/* Dashboard & Laporan - Expandable */}
        <div>
          <button
            onClick={() => setDashboardOpen(!dashboardOpen)}
            className={`${navLinkClass(false)} ${isOpen ? '' : 'justify-center px-0'} w-full`}
            title={isOpen ? undefined : 'Dashboard & Laporan'}
          >
            <BarChart3 className="h-5 w-5 shrink-0" aria-hidden="true" />
            {isOpen && (
              <>
                <span>Dashboard & Laporan</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${dashboardOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {dashboardOpen && isOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {dashboardSubLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`${navLinkClass(!!active)} pl-3`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Finance & Expense - Expandable */}
        <div>
          <button
            onClick={() => setFinanceOpen(!financeOpen)}
            className={`${navLinkClass(false)} ${isOpen ? '' : 'justify-center px-0'} w-full`}
            title={isOpen ? undefined : 'Finance & Expense'}
          >
            <Wallet className="h-5 w-5 shrink-0" aria-hidden="true" />
            {isOpen && (
              <>
                <span>Finance & Expense</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${financeOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {financeOpen && isOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {financeSubLinks.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={`${navLinkClass(!!active)} pl-3`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Remaining admin links */}
        {adminLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              title={isOpen ? undefined : label}
              className={`${navLinkClass(!!active)} ${isOpen ? '' : 'justify-center px-0'}`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {isOpen && label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

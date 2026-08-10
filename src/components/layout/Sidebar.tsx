'use client';

import { useState, useEffect, useCallback } from 'react';
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
  X,
  Bell,
  Star,
  Send,
  CheckSquare,
  DollarSign,
  CreditCard,
} from 'lucide-react';

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const cashierLinks = [
  { href: '/waiter', label: 'Waiter POS', icon: Smartphone },
  { href: '/pos/meja', label: 'Manajemen Meja', icon: Table },
  { href: '/pos/requests', label: 'Pesanan Masuk', icon: Bell },
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
  { href: '/inventory-suppliers', label: 'Manajemen Supplier', icon: Building2 },
  { href: '/admin/discount-reports', label: 'Laporan Diskon', icon: Percent },
  { href: '/admin/vouchers', label: 'Manajemen Voucer', icon: Tag },
  { href: '/admin/crm', label: 'Pelanggan & CRM', icon: UserPlus },
  { href: '/admin/promotions', label: 'Promosi Otomatis', icon: TrendingUp },
];

const financeSubLinks = [
  { href: '/finance/ocr', label: 'Pemindaian Faktur (OCR)', icon: Wallet },
];

export const Sidebar = ({ isMobileOpen: propIsMobileOpen, onMobileClose }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const isMobileDrawerActive = propIsMobileOpen !== undefined ? propIsMobileOpen : internalMobileOpen;

  const handleCloseMobile = useCallback(() => {
    setInternalMobileOpen(false);
    if (onMobileClose) {
      onMobileClose();
    }
  }, [onMobileClose]);

  // Listen for custom event from Header hamburger toggle
  useEffect(() => {
    const handleToggleEvent = () => {
      setInternalMobileOpen((prev) => !prev);
    };
    window.addEventListener('toggle-mobile-sidebar', handleToggleEvent);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggleEvent);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    handleCloseMobile();
  }, [pathname, handleCloseMobile]);

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileDrawerActive) {
        handleCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerActive, handleCloseMobile]);

  const navLinkClass = (active: boolean) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-primary text-on-primary' : 'text-ink-secondary hover:bg-surface-alt'
    }`;

  const renderNavContent = (expanded: boolean) => (
    <>
      {/* Header + toggle */}
      <div className="flex items-center justify-between border-b border-line p-3">
        {expanded ? (
          <Link href="/apps" className="flex items-center gap-2 px-1 text-base font-bold text-ink hover:text-primary transition-colors">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span>Kitchen POS</span>
          </Link>
        ) : (
          <Link
            href="/apps"
            title="App Launcher (/apps)"
            aria-label="App Launcher (/apps)"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-primary transition-colors hover:bg-surface-alt"
          >
            <LayoutGrid className="h-5 w-5" />
          </Link>
        )}
        
        {/* On desktop: collapse button; On mobile: close drawer button */}
        <button
          onClick={() => {
            if (isMobileDrawerActive) {
              handleCloseMobile();
            } else {
              setIsOpen(!isOpen);
            }
          }}
          aria-label={expanded ? 'Tutup sidebar' : 'Buka sidebar'}
          aria-expanded={expanded}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt"
        >
          {isMobileDrawerActive ? (
            <X className="h-5 w-5" />
          ) : (
            <ChevronLeft className={`h-5 w-5 transition-transform duration-200 ${expanded ? '' : 'rotate-180'}`} />
          )}
        </button>
      </div>

      {/* MODUL APLIKASI */}
      {expanded && (
        <h3 className="mb-1 px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          MODUL APLIKASI
        </h3>
      )}
      <div className="flex-1 overflow-y-auto p-2">
        {/* App Launcher Item */}
        <Link
          href="/apps"
          className={`${navLinkClass(pathname === '/apps')} ${expanded ? '' : 'justify-center px-0'} mb-1`}
          title={expanded ? undefined : 'App Launcher'}
        >
          <LayoutGrid className="h-5 w-5 shrink-0" />
          {expanded && <span>App Launcher</span>}
        </Link>

        {/* POS (Kasir) - Expandable */}
        <div>
          <button
            onClick={() => setPosOpen(!posOpen)}
            className={`${navLinkClass(false)} ${expanded ? '' : 'justify-center px-0'} w-full`}
            title={expanded ? undefined : 'POS (Kasir)'}
          >
            <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden="true" />
            {expanded && (
              <>
                <span>POS (Kasir)</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${posOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {posOpen && expanded && (
            <div className="ml-4 mt-1 space-y-1">
              <Link
                href="/pos"
                className={`${navLinkClass(pathname === '/pos')} pl-3`}
              >
                <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" />
                POS Utama
              </Link>
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

        {/* Kitchen Display System (KDS) */}
        <Link
          href="/kitchen"
          aria-current={pathname === '/kitchen' ? 'page' : undefined}
          title={expanded ? undefined : 'Dapur (KDS)'}
          className={`${navLinkClass(pathname === '/kitchen')} ${expanded ? '' : 'justify-center px-0'}`}
        >
          <ChefHat className="h-5 w-5 shrink-0" aria-hidden="true" />
          {expanded && <span>Dapur (KDS)</span>}
        </Link>

        {/* Dashboard & Admin - Expandable */}
        <div>
          <button
            onClick={() => setDashboardOpen(!dashboardOpen)}
            className={`${navLinkClass(false)} ${expanded ? '' : 'justify-center px-0'} w-full`}
            title={expanded ? undefined : 'Dashboard & Admin'}
          >
            <BarChart3 className="h-5 w-5 shrink-0" aria-hidden="true" />
            {expanded && (
              <>
                <span>Dashboard & Admin</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${dashboardOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {dashboardOpen && expanded && (
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
            className={`${navLinkClass(false)} ${expanded ? '' : 'justify-center px-0'} w-full`}
            title={expanded ? undefined : 'Finance & Expense'}
          >
            <Wallet className="h-5 w-5 shrink-0" aria-hidden="true" />
            {expanded && (
              <>
                <span>Finance & Expense</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${financeOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {financeOpen && expanded && (
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
              title={expanded ? undefined : label}
              className={`${navLinkClass(!!active)} ${expanded ? '' : 'justify-center px-0'}`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {expanded && label}
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sticky/Collapsible Sidebar */}
      <nav
        aria-label="Navigasi utama desktop"
        className={`hidden lg:flex ${isOpen ? 'w-64' : 'w-16'} flex-col border-r border-line bg-surface transition-all duration-200 shrink-0`}
      >
        {renderNavContent(isOpen)}
      </nav>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileDrawerActive && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi seluler">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={handleCloseMobile}
            aria-hidden="true"
          />
          {/* Slide-out Panel */}
          <nav
            aria-label="Navigasi utama seluler"
            className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-surface shadow-2xl border-r border-line z-10 animate-in slide-in-from-left duration-200"
          >
            {renderNavContent(true)}
          </nav>
        </div>
      )}
    </>
  );
};

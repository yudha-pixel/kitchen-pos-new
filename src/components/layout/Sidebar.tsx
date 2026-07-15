'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingCart,
  ChefHat,
  Settings,
  Table,
  Users,
  Clock,
  ChevronLeft,
  LayoutGrid,
  BarChart3,
  Boxes,
  Wallet,
  HeartHandshake,
  IdCard,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color?: string | null;
}

interface SidebarProps {
  categories?: Category[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

const moduleLinks = [
  { href: '/pos', label: 'POS (Kasir)', icon: ShoppingCart },
  { href: '/kitchen', label: 'KDS (Dapur)', icon: ChefHat },
  { href: '/admin', label: 'Back-Office Admin', icon: Settings },
];

const cashierLinks = [
  { href: '/pos/meja', label: 'Manajemen Meja', icon: Table },
  { href: '/customers', label: 'Data Pelanggan', icon: Users },
  { href: '/shift', label: 'Buka/Tutup Shift', icon: Clock },
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard & Laporan', icon: BarChart3 },
  { href: '/admin/inventory', label: 'Inventory & Pengadaan', icon: Boxes },
  { href: '/admin/finance', label: 'Finance & Expense', icon: Wallet },
  { href: '/admin/crm', label: 'Pelanggan & CRM', icon: HeartHandshake },
  { href: '/admin/hr', label: 'HR & Payroll', icon: IdCard },
  { href: '/admin/settings', label: 'Pengaturan Sistem', icon: Settings },
];

export const Sidebar = ({ categories = [], selectedCategory = 'Semua', onCategorySelect }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith('/admin');

  const navLinkClass = (active: boolean) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-primary text-on-primary' : 'text-ink-secondary hover:bg-surface-alt'
    }`;

  const categoryButtonClass = (active: boolean) =>
    `flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
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

      {/* Module switcher */}
      <div className="border-b border-line p-2">
        {isOpen && (
          <h3 className="mb-1 px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Modul Aplikasi
          </h3>
        )}
        <div className="space-y-1">
          {moduleLinks.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? isAdminArea : pathname === href;
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
      </div>

      {/* Contextual menu */}
      <div className="flex-1 overflow-y-auto p-2">
        {!isAdminArea ? (
          <>
            {onCategorySelect && (
              <div className="space-y-1">
                {isOpen && (
                  <h3 className="mb-1 px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    Kategori Menu
                  </h3>
                )}
                <button
                  onClick={() => onCategorySelect('Semua')}
                  aria-pressed={selectedCategory === 'Semua'}
                  title={isOpen ? undefined : 'Semua'}
                  className={`${categoryButtonClass(selectedCategory === 'Semua')} ${isOpen ? '' : 'justify-center px-0'}`}
                >
                  <LayoutGrid className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {isOpen && 'Semua'}
                </button>
                {categories.map((category) => {
                  const active = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => onCategorySelect(category.id)}
                      aria-pressed={active}
                      title={isOpen ? undefined : category.name}
                      className={`${categoryButtonClass(active)} ${isOpen ? '' : 'justify-center px-0'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-3 w-3 shrink-0 rounded-full ${active ? 'ring-2 ring-white/60' : ''}`}
                        style={{ backgroundColor: category.color || '#94a3b8' }}
                      />
                      {isOpen && <span className="truncate">{category.name}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 space-y-1">
              {isOpen && (
                <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Operasional Kasir
                </h3>
              )}
              {cashierLinks.map(({ href, label, icon: Icon }) => {
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
          </>
        ) : (
          <div className="space-y-1">
            {isOpen && (
              <h3 className="mb-1 px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Manajemen ERP
              </h3>
            )}
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
        )}
      </div>
    </nav>
  );
};

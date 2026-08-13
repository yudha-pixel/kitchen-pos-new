'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, ChevronRight, Menu, Plus, Search, MoreVertical } from 'lucide-react';
import { LiveClock } from './LiveClock';
import { UserProfileMenu } from './UserProfileMenu';
import { CompanyBrand } from './CompanyBrand';
import { TopNavigation } from './TopNavigation';
import { ConnectionIndicator } from '@/src/components/ui/ConnectionIndicator';
import { useAuth } from '@/src/context/AuthContext';
import { useCompany } from '@/src/context/CompanyContext';
import { findModuleForPath } from '@/src/config/navigation';
import { usePageHeaderContext } from '@/src/context/PageHeaderContext';
import { Menu as BaseMenu } from '@base-ui/react/menu';

interface HeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
  onToggleMobileSidebar?: () => void;
}

export const Header = ({ title, onSearch, onToggleMobileSidebar }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const { config } = usePageHeaderContext();
  const currentModule = findModuleForPath(pathname);
  // Falls back to the matching sub-link's own label (e.g. "Manajemen Produk")
  // before the module title, so pages that don't pass an explicit title don't
  // show a redundant "Module › Module" breadcrumb.
  const matchedSubLink = currentModule?.subLinks.find((sub) => sub.href === pathname);
  const pageTitle = matchedSubLink?.label || title || currentModule?.title || 'Kitchen POS';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isPosModule = currentModule?.id === 'pos';

  const handleToggleSidebar = () => {
    if (onToggleMobileSidebar) {
      onToggleMobileSidebar();
    } else {
      window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
    }
  };

  const handleMobilePrimaryAction = () => {
    if (pathname === '/inventory') {
      window.dispatchEvent(new CustomEvent('inventory-add-item'));
    }
  };

  return (
    <>
      <TopNavigation
        brand={<CompanyBrand name={company.name} logoUrl={company.logo_url} />}
        left={<>
          <button
            type="button"
            onClick={handleToggleSidebar}
            aria-label="Buka menu navigasi"
            title="Buka Menu"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-on-primary outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Kembali ke halaman sebelumnya"
            className="hidden size-11 shrink-0 items-center justify-center rounded-lg text-ink-secondary outline-none hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:flex"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          {!onSearch && <div className="hidden min-w-0 items-center gap-2 text-xs lg:flex">
            {currentModule && (
              <>
                <span className="text-ink-muted">{currentModule.title}</span>
                <ChevronRight className="size-3 shrink-0 text-ink-muted" aria-hidden="true" />
              </>
            )}
            <span className="truncate text-sm font-semibold text-ink">{pageTitle}</span>
          </div>}

          {onSearch && (
            <div className="relative hidden min-w-0 max-w-sm flex-1 lg:block">
              <input
                type="search"
                placeholder="Cari produk..."
                aria-label="Cari produk"
                value={searchQuery}
                onChange={handleSearch}
                className="min-h-11 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-4 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            </div>
          )}
        </>}
        right={<>
          <ConnectionIndicator />
          {config.actions && (
            <BaseMenu.Root>
              <BaseMenu.Trigger
                aria-label="Sync & Options"
                className="flex size-11 items-center justify-center rounded-lg text-ink-secondary outline-none hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <MoreVertical className="size-5" aria-hidden="true" />
              </BaseMenu.Trigger>
              <BaseMenu.Portal>
                <BaseMenu.Positioner sideOffset={8} align="end" className="z-50">
                  <BaseMenu.Popup
                    aria-label="Sync & Options"
                    className="w-56 rounded-xl border border-line bg-surface p-2 text-ink shadow-lg outline-none"
                  >
                    {config.actions}
                  </BaseMenu.Popup>
                </BaseMenu.Positioner>
              </BaseMenu.Portal>
            </BaseMenu.Root>
          )}
          <LiveClock />

          {pathname === '/inventory' && (
            <button
              type="button"
              onClick={handleMobilePrimaryAction}
              aria-label="Tambah item"
              className="flex size-11 items-center justify-center rounded-lg text-on-primary outline-none hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-on-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary lg:hidden"
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          )}

          {user && <UserProfileMenu user={user} onLogout={handleLogout} />}
        </>}
        mobileRow={onSearch ? (
        <div className="relative mb-2 w-full lg:hidden">
          <input
            type="search"
            placeholder="Cari produk..."
            aria-label="Cari produk"
            value={searchQuery}
            onChange={handleSearch}
            className="min-h-11 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-4 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-on-primary"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        </div>
        ) : undefined}
      />
    </>
  );
};

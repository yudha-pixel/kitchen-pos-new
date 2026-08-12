'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, ChevronRight, LogOut, Menu, Plus, Search, UserRound, Users } from 'lucide-react';
import { TableMergeModal } from './TableMergeModal';
import { OutletSelector } from '@/src/components/outlet/OutletSelector';
import { useAuth } from '@/src/context/AuthContext';
import { findModuleForPath } from '@/src/config/navigation';

interface HeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
  onToggleMobileSidebar?: () => void;
}

export const Header = ({ title, onSearch, onToggleMobileSidebar }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showTableMergeModal, setShowTableMergeModal] = useState(false);
  const { user, logout } = useAuth();
  const currentModule = findModuleForPath(pathname);
  // Falls back to the matching sub-link's own label (e.g. "Manajemen Produk")
  // before the module title, so pages that don't pass an explicit title don't
  // show a redundant "Module › Module" breadcrumb.
  const matchedSubLink = currentModule?.subLinks.find((sub) => sub.href === pathname);
  const pageTitle = matchedSubLink?.label || title || currentModule?.title || 'Kitchen POS';

  // Set on mount + update every minute (avoids SSR/client clock mismatch)
  useEffect(() => {
    const update = () => setCurrentTime(new Date());
    const initial = setTimeout(update, 0);
    const timer = setInterval(update, 60000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
    <header className="app-shell-header relative z-40 flex items-center border-b border-primary bg-primary px-3 text-on-primary sm:px-6 lg:border-line lg:bg-surface lg:text-ink">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left: Hamburger, Back Button, Breadcrumb and Search */}
        <div className="flex flex-1 items-center gap-2 sm:gap-3">
          <button
            onClick={handleToggleSidebar}
            aria-label="Buka menu navigasi"
            title="Buka Menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-primary transition-colors hover:bg-primary-hover lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Kembali ke halaman sebelumnya"
            className="hidden size-11 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt lg:flex"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="hidden min-w-0 items-center gap-2 text-xs lg:flex">
            {currentModule && (
              <>
                <span className="text-ink-muted">{currentModule.title}</span>
                <ChevronRight className="h-3 w-3 shrink-0 text-ink-muted" aria-hidden="true" />
              </>
            )}
            <span className="truncate text-sm font-semibold text-ink">{pageTitle}</span>
          </div>

          <span className="pointer-events-none absolute left-1/2 max-w-[12rem] -translate-x-1/2 truncate text-sm font-semibold text-on-primary lg:hidden">
            {pageTitle}
          </span>

          {onSearch && (
            <div className="relative max-w-md flex-1">
              <input
                type="search"
                placeholder="Cari produk..."
                aria-label="Cari produk"
                value={searchQuery}
                onChange={handleSearch}
                className="min-h-11 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-4 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
              />
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
            </div>
          )}
        </div>

        {/* Right: Time and User Actions */}
        <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-4">
          {/* Current Time */}
          {currentTime && (
            <div className="hidden text-right lg:block">
              <p className="tnum text-sm font-semibold text-ink">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-ink-muted">
                {currentTime.toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          )}

          {/* User Actions */}
          {currentModule?.id === 'pos' && (
            <button
              onClick={() => setShowTableMergeModal(true)}
              aria-label="Gabung meja"
              title="Gabung Meja"
              className="hidden min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt lg:flex"
            >
              <Users className="size-5" aria-hidden="true" />
            </button>
          )}

          <div className="hidden lg:block">
            <OutletSelector />
          </div>

          <div className="hidden items-center gap-1 border-l border-line pl-2 sm:pl-3 lg:flex">
            <span className="flex min-h-11 items-center gap-2 px-1 text-sm font-medium text-ink-secondary">
              <UserRound className="size-5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{user?.username}</span>
            </span>
            <button
              onClick={handleLogout}
              aria-label="Keluar"
              title="Logout"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          {pathname === '/inventory' && (
            <button
              type="button"
              onClick={handleMobilePrimaryAction}
              aria-label="Tambah item"
              className="flex size-11 items-center justify-center rounded-lg text-on-primary transition-colors hover:bg-primary-hover lg:hidden"
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <TableMergeModal isOpen={showTableMergeModal} onClose={() => setShowTableMergeModal(false)} />
    </header>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, LogOut, Users, LayoutGrid, Menu, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { TableMergeModal } from './TableMergeModal';
import { OutletSelector } from '@/src/components/outlet/OutletSelector';
import { useAuth } from '@/src/context/AuthContext';
import { findModuleForPath } from '@/src/config/navigation';
import { MODULE_ICON_MAP } from './moduleIcons';

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
  const pageTitle = title || matchedSubLink?.label || currentModule?.title || 'Kitchen POS';
  const initial = user?.username?.charAt(0).toUpperCase() || 'U';
  // App-launcher icon reflects the current module so it doubles as a quick module glance,
  // falling back to the generic grid icon outside any module (e.g. /apps itself).
  const AppIcon = (currentModule && MODULE_ICON_MAP[currentModule.iconName]) || LayoutGrid;

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

  return (
    <header className="relative z-40 flex h-16 items-center border-b border-line bg-surface px-4 shadow-xs sm:px-6">
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left: Hamburger, Back Button, Breadcrumb and Search */}
        <div className="flex flex-1 items-center gap-2 sm:gap-3">
          <button
            onClick={handleToggleSidebar}
            aria-label="Buka menu navigasi"
            title="Buka Menu"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/apps"
            aria-label="Kembali ke Launcher Aplikasi"
            title="Launcher Aplikasi (/apps)"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-xs transition-colors hover:bg-primary-hover"
          >
            <AppIcon className="h-5 w-5" />
          </Link>
          <div className="hidden min-w-0 items-center gap-2 text-xs sm:flex">
            {currentModule && (
              <>
                <span className="text-ink-muted">{currentModule.title}</span>
                <ChevronRight className="h-3 w-3 shrink-0 text-ink-muted" aria-hidden="true" />
              </>
            )}
            <span className="truncate text-sm font-semibold text-ink">{pageTitle}</span>
          </div>

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
            <div className="hidden text-right md:block">
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
          <button
            onClick={() => setShowTableMergeModal(true)}
            aria-label="Gabung meja"
            title="Gabung Meja"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt"
          >
            <Users className="h-5 w-5" />
          </button>

          {/* Outlet Selector */}
          <OutletSelector />

          <div className="flex items-center gap-1 border-l border-line pl-2 sm:pl-3">
            <span className="flex items-center gap-2 px-1 text-sm font-medium text-ink-secondary">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary"
                aria-hidden="true"
              >
                {initial}
              </span>
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
        </div>
      </div>

      <TableMergeModal isOpen={showTableMergeModal} onClose={() => setShowTableMergeModal(false)} />
    </header>
  );
};

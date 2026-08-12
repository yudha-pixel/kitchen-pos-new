'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { usePageHeaderContext } from '@/src/context/PageHeaderContext';
import { useAuth } from '@/src/context/AuthContext';
import { findRequiredPermissionForPath } from '@/src/config/navigation';

// Routes that intentionally render with no shared chrome at all: the login
// screen, the root redirect, customer-facing self-order pages, and /apps
// (which has its own complete bespoke launcher header and no sidebar,
// matching the wireframe).
const NO_SHELL_EXACT = new Set(['/', '/login', '/apps']);
const NO_SHELL_PREFIXES = ['/online-order', '/order-status', '/order/'];

function shouldShowShell(pathname: string): boolean {
  if (NO_SHELL_EXACT.has(pathname)) return false;
  return !NO_SHELL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { config } = usePageHeaderContext();
  const { user, isLoading, can } = useAuth();
  const showShell = shouldShowShell(pathname);
  const requiredPermission = showShell ? findRequiredPermissionForPath(pathname) : null;
  // Memoized: Sidebar's "close drawer on route change" effect depends on
  // this callback's identity via handleCloseMobile — an inline arrow here
  // would change identity every render and re-fire that effect immediately,
  // closing the drawer right after it opens. (Bit us twice already.)
  const toggleMobileSidebar = useCallback(() => setIsMobileOpen((prev) => !prev), []);
  const closeMobileSidebar = useCallback(() => setIsMobileOpen(false), []);

  useEffect(() => {
    if (showShell && !isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, pathname, router, showShell, user]);

  if (!showShell) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return <div className="flex min-h-dvh items-center justify-center bg-surface-alt text-sm text-ink-secondary">Memeriksa akses...</div>;
  }

  if (requiredPermission && !can(requiredPermission)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-alt p-6">
        <div role="alert" className="max-w-md rounded-xl border border-danger/30 bg-surface p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-3 size-10 text-danger" aria-hidden="true" />
          <h1 className="text-balance text-xl font-semibold text-ink">Akses ditolak</h1>
          <p className="mt-2 text-pretty text-sm text-ink-secondary">
            Akun Anda tidak memiliki izin <code>{requiredPermission}</code> untuk membuka halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-surface text-ink">
      {/* Header and Sidebar are mounted once here, in the root layout's shell,
          and reused across every module — navigating between pages only
          swaps `children` below, so the outlet selector, clock, and sidebar
          state never remount/refetch mid-session. */}
      <Sidebar isMobileOpen={isMobileOpen} onMobileClose={closeMobileSidebar} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          title={config.title}
          onSearch={config.onSearch}
          onToggleMobileSidebar={toggleMobileSidebar}
        />
        <main
          key={pathname}
          className="app-shell-main flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-surface-alt animate-in fade-in duration-200"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

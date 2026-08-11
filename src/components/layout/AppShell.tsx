'use client';

import { useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { usePageHeaderContext } from '@/src/context/PageHeaderContext';

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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { config } = usePageHeaderContext();
  // Memoized: Sidebar's "close drawer on route change" effect depends on
  // this callback's identity via handleCloseMobile — an inline arrow here
  // would change identity every render and re-fire that effect immediately,
  // closing the drawer right after it opens. (Bit us twice already.)
  const toggleMobileSidebar = useCallback(() => setIsMobileOpen((prev) => !prev), []);
  const closeMobileSidebar = useCallback(() => setIsMobileOpen(false), []);

  if (!shouldShowShell(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full flex-col bg-surface text-ink overflow-hidden">
      {/* Header and Sidebar are mounted once here, in the root layout's shell,
          and reused across every module — navigating between pages only
          swaps `children` below, so the outlet selector, clock, and sidebar
          state never remount/refetch mid-session. */}
      <Header
        title={config.title}
        onSearch={config.onSearch}
        onToggleMobileSidebar={toggleMobileSidebar}
      />
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <Sidebar isMobileOpen={isMobileOpen} onMobileClose={closeMobileSidebar} />
        <main
          key={pathname}
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 bg-surface-alt animate-in fade-in duration-200"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

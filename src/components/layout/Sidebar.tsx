'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Circle, LayoutGrid, X } from 'lucide-react';

import { findModuleForPath } from '@/src/config/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { MODULE_ICON_MAP, NAVIGATION_ICON_MAP } from './moduleIcons';

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({ isMobileOpen: propIsMobileOpen, onMobileClose }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const pathname = usePathname();
  const { can } = useAuth();

  const currentModule = findModuleForPath(pathname);
  const moduleLinks = currentModule?.subLinks.filter((sub) => can(sub.requiredPermission)) ?? [];

  const isMobileDrawerActive = propIsMobileOpen !== undefined ? propIsMobileOpen : internalMobileOpen;

  const handleCloseMobile = useCallback(() => {
    setInternalMobileOpen(false);
    onMobileClose?.();
  }, [onMobileClose]);

  useEffect(() => {
    const handleToggleEvent = () => setInternalMobileOpen((current) => !current);
    window.addEventListener('toggle-mobile-sidebar', handleToggleEvent);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggleEvent);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileDrawerActive) handleCloseMobile();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerActive, handleCloseMobile]);

  const navLinkClass = (active: boolean) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-primary-soft font-semibold text-primary' : 'text-ink-secondary hover:bg-surface-alt'
    }`;

  const ModuleIcon = currentModule ? MODULE_ICON_MAP[currentModule.iconName] : LayoutGrid;

  const renderNavContent = (expanded: boolean, mobile = false) => (
    <>
      <div className={`flex min-h-16 items-center border-b border-line px-4 ${expanded ? 'gap-3' : 'justify-center px-2'}`}>
        <Link
          href="/apps"
          onClick={mobile ? handleCloseMobile : undefined}
          aria-label="Buka App Launcher"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors hover:bg-primary-soft/70"
        >
          <LayoutGrid className="size-5" aria-hidden="true" />
        </Link>
        {expanded && <span className="truncate text-sm font-semibold text-ink">Kitchen POS</span>}
        {mobile && (
          <button
            type="button"
            onClick={handleCloseMobile}
            aria-label="Tutup menu navigasi"
            className="ml-auto flex size-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {currentModule && (
        <div className={`flex items-center px-4 pb-2 pt-4 ${expanded ? 'gap-3' : 'justify-center px-2'}`}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary shadow-xs">
            <ModuleIcon className="size-5" aria-hidden="true" />
          </span>
          {expanded && <span className="truncate text-sm font-semibold text-primary">{currentModule.title}</span>}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-1">
        {moduleLinks.length > 0 ? (
          moduleLinks.map((sub) => {
            const active = pathname === sub.href;
            const NavigationIcon = sub.iconName ? NAVIGATION_ICON_MAP[sub.iconName] : Circle;
            return (
              <Link
                key={`${sub.label}-${sub.href}`}
                href={sub.href}
                onClick={mobile ? handleCloseMobile : undefined}
                aria-current={active ? 'page' : undefined}
                title={expanded ? undefined : sub.label}
                className={`${navLinkClass(active)} ${expanded ? '' : 'justify-center px-0'}`}
              >
                <NavigationIcon className="size-5 shrink-0" aria-hidden="true" />
                {expanded && <span className="truncate">{sub.label}</span>}
                {!expanded && <span className="sr-only">{sub.label}</span>}
              </Link>
            );
          })
        ) : (
          expanded && (
            <p className="px-3 py-2 text-sm text-ink-muted">
              Pilih modul dari App Launcher untuk melihat menu.
            </p>
          )
        )}
      </div>

      <div className="mb-12 border-t border-line p-2">
        <button
          type="button"
          onClick={() => mobile ? handleCloseMobile() : setIsOpen((current) => !current)}
          aria-label={mobile ? 'Tutup sidebar' : expanded ? 'Ciutkan sidebar' : 'Perluas sidebar'}
          aria-expanded={mobile ? true : expanded}
          className={`flex min-h-11 w-full items-center rounded-lg border border-line px-3 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-alt ${expanded ? 'gap-3' : 'justify-center px-0'}`}
        >
          <ChevronLeft className={`size-5 shrink-0 transition-transform duration-200 ${!expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          {expanded && <span>{mobile ? 'Close' : 'Collapse'}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <nav
        aria-label="Navigasi utama desktop"
        className={`hidden lg:flex ${isOpen ? 'w-56' : 'w-16'} shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200`}
      >
        {renderNavContent(isOpen)}
      </nav>

      {isMobileDrawerActive && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi seluler">
          <div
            className="fixed inset-0 bg-slate-950/70"
            onClick={handleCloseMobile}
            aria-hidden="true"
          />
          <nav
            aria-label="Navigasi utama seluler"
            className="relative z-10 flex w-4/5 max-w-xs flex-1 flex-col border-r border-line bg-surface shadow-2xl"
          >
            {renderNavContent(true, true)}
          </nav>
        </div>
      )}
    </>
  );
};

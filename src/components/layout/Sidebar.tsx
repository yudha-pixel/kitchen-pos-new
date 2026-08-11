'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { findModuleForPath } from '@/src/config/navigation';
import { ChevronLeft, LayoutGrid, X } from 'lucide-react';

export interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar = ({ isMobileOpen: propIsMobileOpen, onMobileClose }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const currentModule = useMemo(() => findModuleForPath(pathname), [pathname]);

  const moduleLinks = useMemo(() => {
    if (!currentModule) return [];
    if (currentModule.allowedRoles && !(user?.role && currentModule.allowedRoles.includes(user.role))) {
      return [];
    }
    return currentModule.subLinks;
  }, [currentModule, user?.role]);

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
      active ? 'bg-primary-soft text-primary font-semibold' : 'text-ink-secondary hover:bg-surface-alt'
    }`;

  const renderNavContent = (expanded: boolean) => (
    <>
      {/* Collapse/close toggle — the module identity now lives only in the Header's breadcrumb, not repeated here */}
      <div className={`flex items-center border-b border-line px-3 py-3 ${expanded ? 'justify-end' : 'justify-center'}`}>
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
          className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt"
        >
          {isMobileDrawerActive ? (
            <X className="h-5 w-5" />
          ) : (
            <ChevronLeft className={`h-5 w-5 transition-transform duration-200 ${expanded ? '' : 'rotate-180'}`} />
          )}
        </button>
      </div>

      {/* Module-scoped links (the audit's approved IA: each module owns its own child menu — no cross-module rail) */}
      <div className="flex-1 overflow-y-auto p-2">
        {moduleLinks.length > 0 ? (
          moduleLinks.map((sub) => {
            const active = pathname === sub.href;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                aria-current={active ? 'page' : undefined}
                title={expanded ? undefined : sub.label}
                className={`${navLinkClass(active)} ${expanded ? '' : 'justify-center px-0'}`}
              >
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

      {/* Back to launcher, pinned at the bottom like the wireframe's rail */}
      <div className="border-t border-line p-2">
        <Link
          href="/apps"
          title={expanded ? undefined : 'App Launcher'}
          className={`${navLinkClass(pathname === '/apps')} ${expanded ? '' : 'justify-center px-0'}`}
        >
          <LayoutGrid className="h-5 w-5 shrink-0" />
          {expanded && <span>App Launcher</span>}
        </Link>
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

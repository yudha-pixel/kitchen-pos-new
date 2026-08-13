'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const { config } = usePageHeaderContext();
  const currentModule = findModuleForPath(pathname);
  const matchedSubLink = currentModule?.subLinks.find(
    (sub) => sub.href === pathname || (sub.href !== '/' && pathname.startsWith(sub.href + '/'))
  );

  const isDetailRoute = Boolean(matchedSubLink && pathname !== matchedSubLink.href);
  const pageRawTitle = title || config.title || matchedSubLink?.label || currentModule?.title || 'Kitchen POS';

  let activeBreadcrumb = pageRawTitle;
  if (isDetailRoute && matchedSubLink) {
    const regex = new RegExp(`^${matchedSubLink.label}[:\\s]*`, 'i');
    activeBreadcrumb = pageRawTitle.replace(regex, '').trim();
    if (!activeBreadcrumb) activeBreadcrumb = pageRawTitle;
  } else if (matchedSubLink) {
    activeBreadcrumb = matchedSubLink.label;
  }

  // Read origin context search params for dynamic cross-document breadcrumbs
  const fromLabel = searchParams?.get('fromLabel');
  const fromHref = searchParams?.get('fromHref');
  const fromParentLabel = searchParams?.get('fromParentLabel');
  const fromParentHref = searchParams?.get('fromParentHref');

  // Build dynamic clickable breadcrumb segments
  const breadcrumbSegments: { label: string; href?: string }[] = [];

  if (fromLabel && fromHref) {
    // Document-to-document navigation context (e.g., PR → PO)
    if (fromParentLabel && fromParentHref) {
      breadcrumbSegments.push({ label: fromParentLabel, href: fromParentHref });
    }
    breadcrumbSegments.push({ label: fromLabel, href: fromHref });
    breadcrumbSegments.push({ label: activeBreadcrumb });
  } else if (isDetailRoute && matchedSubLink) {
    // Standard detail route within module
    breadcrumbSegments.push({ label: matchedSubLink.label, href: matchedSubLink.href });
    breadcrumbSegments.push({ label: activeBreadcrumb });
  } else if (matchedSubLink) {
    // Module list page
    if (currentModule?.title && currentModule.title !== matchedSubLink.label) {
      breadcrumbSegments.push({ label: currentModule.title, href: currentModule.subLinks[0]?.href });
    }
    breadcrumbSegments.push({ label: matchedSubLink.label });
  } else {
    // Fallback for pages without clear module context
    breadcrumbSegments.push({ label: pageRawTitle });
  }

  // Handle edge case: if fromHref is invalid/missing, remove it from breadcrumbs
  if (fromLabel && !fromHref) {
    // Remove the fromLabel segment if href is missing
    const fromLabelIndex = breadcrumbSegments.findIndex(seg => seg.label === fromLabel);
    if (fromLabelIndex !== -1) {
      breadcrumbSegments.splice(fromLabelIndex, 1);
    }
  }

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
          {!onSearch && (
            <div className="hidden min-w-0 items-center gap-1.5 text-xs lg:flex">
              {breadcrumbSegments.map((item, idx) => {
                const isLast = idx === breadcrumbSegments.length - 1;
                return (
                  <div key={idx} className="flex items-center gap-1.5 min-w-0" title={item.label}>
                    {!isLast && item.href ? (
                      <Link
                        href={item.href}
                        className="text-ink-muted hover:text-primary hover:underline font-medium transition-colors truncate"
                      >
                        {item.label}
                      </Link>
                    ) : !isLast ? (
                      <span className="text-ink-muted font-medium truncate">{item.label}</span>
                    ) : (
                      <span className="truncate text-sm font-bold text-ink" title={item.label}>{item.label}</span>
                    )}
                    {!isLast && <ChevronRight className="size-3 shrink-0 text-ink-muted" aria-hidden="true" />}
                  </div>
                );
              })}
            </div>
          )}

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

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Monitor,
  UtensilsCrossed,
  Box,
  ShoppingBag,
  Users,
  Tag,
  CalendarCheck,
  IdCard,
  Wallet,
  BarChart3,
  Settings,
  Clock,
  Star,
  RotateCw,
  X,
  TrendingUp,
  Armchair,
  AlertTriangle,
} from 'lucide-react';

import { APPS_REGISTRY, filterApps, type AppDefinition } from '@/src/config/navigation';
import { API_BASE_URL } from '@/src/config/runtime';
import { useAuth } from '@/src/context/AuthContext';
import { useCompany } from '@/src/context/CompanyContext';
import { useTheme } from '@/src/context/ThemeContext';
import { CompanyBrand } from '@/src/components/layout/CompanyBrand';
import { LiveClock } from '@/src/components/layout/LiveClock';
import { TopNavigation } from '@/src/components/layout/TopNavigation';
import { UserProfileMenu } from '@/src/components/layout/UserProfileMenu';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { formatRupiah } from '@/src/lib/format';
import { getIngredientsBelowMinStock } from '@/src/features/inventory/inventoryService';
import { useUserPreferences } from '@/src/hooks/useUserPreferences';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Monitor,
  UtensilsCrossed,
  Box,
  ShoppingBag,
  Users,
  Tag,
  CalendarCheck,
  IdCard,
  Wallet,
  BarChart3,
  Settings,
};

// SortableFavoriteItem component for drag-and-drop
function SortableFavoriteItem({ item, isEditing, onRemove }: { item: AppDefinition; isEditing: boolean; onRemove: (route: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.route });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const IconComponent = ICON_MAP[item.iconName] || Box;
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link
        href={item.route}
        className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 text-slate-700 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary group-hover:bg-primary/20 transition-colors">
            <IconComponent className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-slate-800 group-hover:text-primary transition-colors">
            {item.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
          {isEditing && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemove(item.route);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function AppsPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { company } = useCompany();
  const { settings } = useTheme();
  const backgroundUrl = settings.launcher_background_url ?? null;
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingFavorites, setIsEditingFavorites] = useState(false);
  
  const {
    preferences,
    removeFavorite,
    reorderFavorites,
    clearRecent,
    addRecent,
    refresh
  } = useUserPreferences();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/apps');
    }
  }, [authLoading, user, router]);

  const filteredApps = useMemo(
    () => filterApps(APPS_REGISTRY, searchQuery, user?.permissions ?? []),
    [searchQuery, user?.permissions]
  );

  const permittedApps = useMemo(
    () => filterApps(APPS_REGISTRY, '', user?.permissions ?? []),
    [user?.permissions]
  );

  const [opsStats, setOpsStats] = useState({
    todayRevenue: 0,
    todayOrderCount: 0,
    dineInCount: 0,
    takeawayCount: 0,
    tablesOccupied: 0,
    tablesTotal: 0,
    tablesReserved: 0,
    lowStockCount: 0,
    lowStockNames: [] as string[],
  });

  // Operational summary tiles: today's orders/revenue from local Dexie cache (per-device,
  // same limitation as the Reports page), table occupancy from the server, low stock from Dexie.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { db } = await import('@/src/lib/db');
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [todaysOrders, lowStock, tablesRes] = await Promise.all([
        db.orders
          .where('status')
          .anyOf(['completed', 'paid'])
          .toArray()
          .then((orders) => orders.filter((o) => new Date(o.created_at) >= startOfToday)),
        getIngredientsBelowMinStock(),
        (async () => {
          const token = getToken();
          const res = await fetch(`${API_BASE_URL}/api/tables/summary`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (!res.ok) return null;
          return res.json() as Promise<{ total: number; occupied: number; reserved: number }>;
        })().catch(() => null),
      ]);

      if (cancelled) return;

      setOpsStats({
        todayRevenue: todaysOrders.reduce((sum, o) => sum + o.total_amount, 0),
        todayOrderCount: todaysOrders.length,
        dineInCount: todaysOrders.filter((o) => o.order_category !== 'takeaway').length,
        takeawayCount: todaysOrders.filter((o) => o.order_category === 'takeaway').length,
        tablesOccupied: tablesRes?.occupied ?? 0,
        tablesTotal: tablesRes?.total ?? 0,
        tablesReserved: tablesRes?.reserved ?? 0,
        lowStockCount: lowStock.length,
        lowStockNames: lowStock.slice(0, 3).map((ing) => ing.name),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.full_name?.trim() || user?.username || 'User';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = preferences.favorites.indexOf(String(active.id));
      const newIndex = preferences.favorites.indexOf(String(over.id));
      const newFavorites = arrayMove(preferences.favorites, oldIndex, newIndex);
      reorderFavorites(newFavorites);
    }
  };

  const handleAppClick = (route: string, title: string) => {
    addRecent(route, title);
    router.push(route);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-surface-alt font-sans text-ink animate-in fade-in slide-in-from-bottom-2 duration-200 ease-out">
      <TopNavigation
        brand={<CompanyBrand name={company.name} logoUrl={company.logo_url} />}
        left={<div className="relative hidden min-w-0 max-w-md flex-1 lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Cari modul"
            placeholder="Cari modul..."
            className="min-h-11 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-4 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>}
        right={<><LiveClock />{user && <UserProfileMenu user={user} onLogout={handleLogout} />}</>}
        mobileRow={<div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Cari modul"
            placeholder="Cari modul..."
            className="min-h-11 w-full rounded-lg border border-line-strong bg-surface pl-10 pr-4 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-on-primary"
          />
        </div>}
      />

      {/* Main Body Area: 3-Column Apps Grid + Right Recent/Favorites Sidebar */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Primary Content: App Kanban Cards */}
        <main className="relative flex-1 overflow-y-auto p-8">
          {backgroundUrl && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundUrl})` }}
            />
          )}
          <div aria-hidden="true" className={`absolute inset-0 ${backgroundUrl ? 'bg-slate-50/20' : 'bg-slate-50/70'}`} />
          <div className="relative mx-auto flex min-h-full w-full max-w-5xl flex-col">
            {/* Header Summary Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {displayName}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Refresh"
                  loading={isRefreshing}
                  onClick={handleRefresh}
                  className="shrink-0"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>

              {/* Summary tiles: static grid from sm up, horizontally slidable below sm */}
              <div className="mt-4 -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0">
                {[
                  {
                    label: 'Penjualan Hari Ini',
                    value: formatRupiah(opsStats.todayRevenue),
                    badge: `${opsStats.todayOrderCount} Transaksi`,
                    icon: TrendingUp,
                    iconClass: 'text-emerald-500',
                  },
                  {
                    label: 'Total Pesanan',
                    value: `${opsStats.todayOrderCount} Transaksi`,
                    badge: `${opsStats.dineInCount} Dine-In | ${opsStats.takeawayCount} Takeaway`,
                    icon: ShoppingBag,
                    iconClass: 'text-violet-500',
                  },
                  {
                    label: 'Okupansi Meja',
                    value: `${opsStats.tablesOccupied} / ${opsStats.tablesTotal} Meja`,
                    badge: `${opsStats.tablesReserved} Meja Reservasi`,
                    icon: Armchair,
                    iconClass: 'text-blue-500',
                  },
                  {
                    label: 'Bahan Kritis',
                    value: `${opsStats.lowStockCount} Item`,
                    badge: opsStats.lowStockNames.join(', ') || 'Stok aman',
                    icon: AlertTriangle,
                    iconClass: opsStats.lowStockCount > 0 ? 'text-red-500' : 'text-slate-400',
                  },
                ].map(({ label, value, badge, icon: StatIcon, iconClass }) => (
                  <div
                    key={label}
                    className="min-w-[9.5rem] shrink-0 snap-start rounded-lg border border-slate-200 bg-white p-4 shadow-2xs sm:min-w-0"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">{label}</p>
                      <StatIcon className={`h-4 w-4 ${iconClass}`} />
                    </div>
                    <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">{badge}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Module Grid */}
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredApps.map((app) => {
                  const IconComponent = ICON_MAP[app.iconName] || Box;
                  return (
                    <button
                      key={app.id}
                      onClick={() => handleAppClick(app.route, app.title)}
                      className="group relative flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                    >
                      {app.badge && (
                        <Badge tone={app.badge.tone} className="absolute right-2 top-2">
                          {app.badge.label}
                        </Badge>
                      )}
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-200">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                        {app.title}
                      </h3>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-white">
                <Search className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-900">Modul tidak ditemukan</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Tidak ada modul yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-auto flex items-center justify-center pt-10 text-xs text-slate-400">
              <span>Powered by Kitchen POS</span>
            </div>
          </div>
        </main>

        {/* Right Sidebar Panel: Recent & Favorites (as seen in wireframe 01) */}
        <aside className="w-80 shrink-0 border-l border-slate-200 bg-white p-6 overflow-y-auto hidden xl:flex xl:flex-col xl:gap-8">
          {/* Recent Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>Recent</span>
              </div>
              <button
                type="button"
                onClick={clearRecent}
                className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1.5">
              {preferences.recent.length > 0 ? (
                preferences.recent.map((item) => {
                  const app = APPS_REGISTRY.find(a => a.route === item.route);
                  if (!app) return null;
                  const IconComponent = ICON_MAP[app.iconName] || Box;
                  return (
                    <Link
                      key={item.route}
                      href={item.route}
                      onClick={() => addRecent(item.route, item.title)}
                      className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 text-slate-700 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-slate-800 group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatTimeAgo(item.timestamp)}</span>
                    </Link>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">No recent items</div>
              )}
            </div>
          </div>

          {/* Favorites Section */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>Favorites</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingFavorites(!isEditingFavorites)}
                className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
              >
                {isEditingFavorites ? 'Done' : 'Edit'}
              </button>
            </div>
            <div className="space-y-1.5">
              {preferences.favorites.length > 0 ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={preferences.favorites} strategy={verticalListSortingStrategy}>
                    {preferences.favorites.map((route) => {
                      const app = APPS_REGISTRY.find(a => a.route === route);
                      if (!app) return null;
                      return (
                        <SortableFavoriteItem
                          key={route}
                          item={{ ...app, route }}
                          isEditing={isEditingFavorites}
                          onRemove={removeFavorite}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">No favorites yet</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
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
  ChevronRight,
  Clock,
  Star,
  Info,
  LogOut,
  User as UserIcon,
  Building2,
} from 'lucide-react';

import { APPS_REGISTRY, filterApps, AppDefinition } from '@/src/features/apps/apps-registry';
import { OutletSelector } from '@/src/components/outlet/OutletSelector';
import { useAuth } from '@/src/context/AuthContext';

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

const RECENT_ITEMS = [
  { title: 'Point of Sale', route: '/pos', icon: ShoppingCart, timeAgo: '2m ago' },
  { title: 'Kitchen Display', route: '/kitchen', icon: Monitor, timeAgo: '8m ago' },
  { title: 'Inventory', route: '/inventory', icon: Box, timeAgo: '1h ago' },
  { title: 'Reports', route: '/admin/reports', icon: BarChart3, timeAgo: '3h ago' },
  { title: 'Finance', route: '/finance/ocr', icon: Wallet, timeAgo: '1d ago' },
];

const FAVORITE_ITEMS = [
  { title: 'Point of Sale', route: '/pos', icon: ShoppingCart },
  { title: 'Kitchen Display', route: '/kitchen', icon: Monitor },
  { title: 'Reports', route: '/admin/reports', icon: BarChart3 },
];

export default function AppsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(
    () => filterApps(APPS_REGISTRY, searchQuery, user?.role),
    [searchQuery, user?.role]
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-2 shadow-xs shrink-0 z-20">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Kitchen POS</span>
        </div>

        {/* Center: Search Modules Input Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-12 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-violet-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500/20"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-2xs">
            ⌘ K
          </kbd>
        </div>

        {/* Right: Outlet & User Profile Context */}
        <div className="flex items-center gap-4">
          <OutletSelector />

          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-700 text-xs font-bold text-white uppercase">
              {user?.username?.charAt(0) || 'A'}
            </div>
            <div className="hidden text-left sm:block">
              <span className="block text-xs font-semibold text-slate-800">{user?.username || 'admin'}</span>
              <span className="block text-[10px] capitalize text-slate-500">{user?.role || 'administrator'}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar / Logout"
              aria-label="Keluar"
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Area: 3-Column Apps Grid + Right Recent/Favorites Sidebar */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Left Primary Content: App Kanban Cards */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/70">
          <div className="mx-auto max-w-5xl">
            {/* Header Title Section */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Modules</h1>
              <p className="mt-1 text-sm text-slate-500">
                Akses semua modul untuk mengelola operasional restoran Anda.
              </p>
            </div>

            {/* 3-Column Grid of 12 App Cards */}
            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredApps.map((app) => {
                  const IconComponent = ICON_MAP[app.iconName] || Box;
                  return (
                    <Link
                      key={app.id}
                      href={app.route}
                      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-200">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                          {app.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
                          {app.description}
                        </p>
                      </div>
                    </Link>
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

            {/* Footer Hint */}
            <div className="mt-10 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <Info className="h-3.5 w-3.5" />
              <span>Klik pada modul untuk mulai bekerja.</span>
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
                className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1.5">
              {RECENT_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.route}
                    className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 text-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 group-hover:text-violet-600 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.timeAgo}</span>
                  </Link>
                );
              })}
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
                className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
              >
                Edit
              </button>
            </div>
            <div className="space-y-1.5">
              {FAVORITE_ITEMS.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.route}
                    className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 text-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100 transition-colors">
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 group-hover:text-violet-600 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <Star className="h-3.5 w-3.5 text-violet-500 fill-violet-500" />
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

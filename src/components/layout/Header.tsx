'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, LogOut, ArrowLeft, Users, User } from 'lucide-react';
import { TableMergeModal } from './TableMergeModal';
import { useAuth } from '@/src/context/AuthContext';

interface HeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
}

export const Header = ({ title = 'Kitchen POS', onSearch }: HeaderProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [showTableMergeModal, setShowTableMergeModal] = useState(false);
  const { user, logout } = useAuth();

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

  return (
    <header className="relative z-50 border-b border-line bg-surface px-4 py-2 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Back Button, Title and Search */}
        <div className="flex flex-1 items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Kembali"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-alt"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="hidden text-xl font-bold text-ink sm:block">{title}</h1>

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
        <div className="flex items-center gap-2 sm:gap-4">
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
          <div className="flex items-center gap-1 border-l border-line pl-2 sm:pl-3">
            <span className="flex items-center gap-2 px-1 text-sm font-medium text-ink-secondary">
              <User className="h-4 w-4" aria-hidden="true" />
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

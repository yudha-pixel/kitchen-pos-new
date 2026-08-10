'use client';

import { useEffect } from 'react';
import { useOutletStore } from '@/src/features/outlet/outletStore';
import { Store } from 'lucide-react';

export function OutletSelector() {
  const { outlets, selectedOutletId, loading, loadOutlets, setSelectedOutletId } = useOutletStore();

  useEffect(() => {
    loadOutlets();
  }, []);

  if (outlets.length === 0) {
    return null;
  }

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-surface px-3 py-2 shadow-sm">
      <Store className="h-4 w-4 shrink-0 text-ink-muted" />
      <select
        value={selectedOutletId || ''}
        onChange={(e) => setSelectedOutletId(e.target.value || null)}
        className="min-w-0 w-24 outline-none text-sm bg-transparent sm:w-auto sm:min-w-[150px]"
        disabled={loading}
      >
        <option value="">Semua Outlet</option>
        {outlets.map((outlet) => (
          <option key={outlet.id} value={outlet.id || ''}>
            {outlet.name}
          </option>
        ))}
      </select>
    </div>
  );
}

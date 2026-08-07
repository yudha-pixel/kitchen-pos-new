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
    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
      <Store className="h-4 w-4 text-gray-500" />
      <select
        value={selectedOutletId || ''}
        onChange={(e) => setSelectedOutletId(e.target.value || null)}
        className="outline-none text-sm bg-transparent min-w-[150px]"
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

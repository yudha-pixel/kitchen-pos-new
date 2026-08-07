'use client';

import { useEffect } from 'react';
import { useOutletStore } from '@/src/features/outlet/outletStore';
import { Filter } from 'lucide-react';

interface OutletFilterProps {
  onFilterChange?: (outletId: string | null) => void;
}

export function OutletFilter({ onFilterChange }: OutletFilterProps) {
  const { outlets, selectedOutletId, loading, loadOutlets, setSelectedOutletId } = useOutletStore();

  useEffect(() => {
    loadOutlets();
  }, []);

  const handleChange = (outletId: string) => {
    const newOutletId = outletId || null;
    setSelectedOutletId(newOutletId);
    onFilterChange?.(newOutletId);
  };

  if (outlets.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-500" />
      <select
        value={selectedOutletId || ''}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        <option value="">Semua Outlet</option>
        {outlets.map((outlet) => (
          <option key={outlet.id} value={outlet.id || ''}>
            {outlet.name} ({outlet.code})
          </option>
        ))}
      </select>
    </div>
  );
}

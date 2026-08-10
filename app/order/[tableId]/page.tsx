'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import WaiterOrderModal from '@/src/components/pos/WaiterOrderModal';

export default function SelfOrderPage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = use(params);
  const tableIdParam = resolvedParams.tableId;
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);
  const [tableNumber, setTableNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      setIsLoading(true);
      try {
        // First, check if table number is provided in query parameter (?table=...)
        const tableQuery = searchParams.get('table');
        if (tableQuery) {
          setTableNumber(tableQuery);
          setIsLoading(false);
          return;
        }

        // Try to get table info from local IndexedDB first
        try {
          const { db } = await import('@/src/lib/db');
          const table = await db.restaurant_tables.get(tableIdParam);
          console.log('Local DB table lookup result:', table);
          if (table && table.table_number) {
            setTableNumber(table.table_number);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.log('Local DB table lookup failed:', err);
        }

        // Try to get table info from service to extract actual table_number
        try {
          const { getTableById } = await import('@/src/features/self-order/selfOrderService');
          const table = await getTableById(tableIdParam);
          console.log('API table lookup result:', table);
          if (table && table.table_number) {
            setTableNumber(table.table_number);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.log('Table service not available:', err);
        }

        // Fallback: Only use tableIdParam if it looks like a numeric table number (not a UUID)
        // UUIDs are typically 36 characters with hyphens
        if (tableIdParam && !tableIdParam.includes('-') && !tableIdParam.includes('.')) {
          setTableNumber(tableIdParam);
        } else {
          // If it's a UUID and we couldn't get table_number, show manual input
          console.log('Table not found in database, showing manual input');
          setShowManualInput(true);
        }
      } catch (err) {
        console.error('Failed to load table info:', err);
        setShowManualInput(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [tableIdParam, searchParams]);

  const handleManualTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
    if (input && input.value.trim()) {
      setTableNumber(input.value.trim());
      setShowManualInput(false);
    }
  };

  // Render WaiterOrderModal as full-page component
  return (
    <div className="fixed inset-0 z-50 bg-gray-100">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      ) : showManualInput ? (
        <div className="flex items-center justify-center h-full p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Masukkan Nomor Meja</h2>
            <p className="text-gray-600 text-sm mb-4 text-center">
              Meja tidak ditemukan di database. Silakan masukkan nomor meja Anda secara manual.
            </p>
            <form onSubmit={handleManualTableSubmit}>
              <input
                type="text"
                placeholder="Contoh: 1, 2, A1, B2"
                className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none mb-4"
                autoFocus
              />
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Lanjut
              </button>
            </form>
          </div>
        </div>
      ) : (
        <WaiterOrderModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          tableNumber={tableNumber}
          isSelfOrder={true}
        />
      )}
    </div>
  );
}

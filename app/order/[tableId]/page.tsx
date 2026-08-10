'use client';

import { useCallback, useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import SelfOrderExperience from '@/src/components/self-order/SelfOrderExperience';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SelfOrderPage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = use(params);
  const tableIdParam = resolvedParams.tableId;
  const searchParams = useSearchParams();
  const [resolvedTableId, setResolvedTableId] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [lookupFailed, setLookupFailed] = useState(false);

  // The QR's ?table= is a display hint only — the table record (by ID, or by
  // number for older non-UUID links) is the source of truth for what gets
  // bound to the order. A hint that doesn't match a real table is a failure,
  // not a name to trust. The resolved *id* (not just the display number) is
  // what SelfOrderExperience actually submits orders against.
  const resolveTable = useCallback(async () => {
    setIsLoading(true);
    setLookupFailed(false);
    try {
      const isUuid = UUID_RE.test(tableIdParam);

      if (isUuid) {
        try {
          const { db } = await import('@/src/lib/db');
          const table = await db.restaurant_tables.get(tableIdParam);
          if (table && table.table_number) {
            setResolvedTableId(tableIdParam);
            setTableNumber(table.table_number);
            return;
          }
        } catch (err) {
          console.log('Local DB table lookup failed:', err);
        }

        const { getTableById } = await import('@/src/features/self-order/selfOrderService');
        const table = await getTableById(tableIdParam);
        if (table && table.table_number) {
          setResolvedTableId(tableIdParam);
          setTableNumber(table.table_number);
          return;
        }
      } else {
        // Older-style link using the table number directly in the URL segment.
        const { getTableByNumber } = await import('@/src/features/self-order/selfOrderService');
        const table = await getTableByNumber(tableIdParam);
        if (table?.id && table.table_number) {
          setResolvedTableId(table.id);
          setTableNumber(table.table_number);
          return;
        }
      }

      setLookupFailed(true);
    } catch (err) {
      console.error('Failed to load table info:', err);
      setLookupFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, [tableIdParam]);

  useEffect(() => {
    resolveTable();
  }, [resolveTable]);

  // Render the guest ordering experience as a full-page component
  return (
    <div className="fixed inset-0 z-50 bg-surface-alt">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-ink-secondary">Memuat meja{searchParams.get('table') ? ` ${searchParams.get('table')}` : ''}...</p>
          </div>
        </div>
      ) : lookupFailed ? (
        <div className="flex items-center justify-center h-full p-4">
          <div role="alert" className="bg-surface rounded-2xl shadow-xl p-6 w-full max-w-md text-center">
            <AlertCircle className="h-10 w-10 text-danger mx-auto mb-3" aria-hidden="true" />
            <h2 className="text-xl font-bold mb-2">Meja tidak ditemukan</h2>
            <p className="text-ink-secondary text-sm mb-4">
              Tautan QR ini tidak cocok dengan meja manapun yang terdaftar. Coba pindai ulang QR di meja Anda, atau minta bantuan staf.
            </p>
            <button
              onClick={resolveTable}
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-hover flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Coba Lagi
            </button>
          </div>
        </div>
      ) : (
        <SelfOrderExperience tableId={resolvedTableId} tableNumber={tableNumber} />
      )}
    </div>
  );
}

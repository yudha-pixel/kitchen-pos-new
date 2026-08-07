'use client';

import { useEffect, useState, use } from 'react';
import WaiterOrderModal from '@/src/components/pos/WaiterOrderModal';

export default function SelfOrderPage({ params }: { params: Promise<{ tableId: string }> }) {
  const resolvedParams = use(params);
  const tableIdParam = resolvedParams.tableId;
  const [isOpen, setIsOpen] = useState(true);
  const [tableNumber, setTableNumber] = useState<string>('');

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Get table info to extract table_number
        const { getTableById } = await import('@/src/features/self-order/selfOrderService');
        const table = await getTableById(tableIdParam);
        if (table) {
          setTableNumber(table.table_number);
        }
      } catch (err) {
        console.error('Failed to load table info:', err);
      }
    };

    initializePage();
  }, [tableIdParam]);

  // Render WaiterOrderModal as full-page component
  return (
    <div className="fixed inset-0 z-50 bg-gray-100">
      <WaiterOrderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tableNumber={tableNumber}
        isSelfOrder={true}
      />
    </div>
  );
}

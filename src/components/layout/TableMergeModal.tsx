'use client';

import { useState } from 'react';
import { useCartStore } from '@/src/store/useCartStore';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';

interface TableMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableMergeModal = ({ isOpen, onClose }: TableMergeModalProps) => {
  const { mergeTable } = useCartStore();
  const [sourceTable, setSourceTable] = useState('');
  const [targetTable, setTargetTable] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const tables = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleMerge = async () => {
    if (!sourceTable || !targetTable) {
      toast('warning', 'Pilih meja asal dan tujuan');
      return;
    }

    setIsProcessing(true);
    const result = await mergeTable(targetTable, sourceTable);
    setIsProcessing(false);

    if (result.success) {
      toast('success', result.message);
      setSourceTable('');
      setTargetTable('');
      onClose();
    } else {
      toast('error', result.message);
    }
  };

  const selectClass =
    'min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink focus:border-primary focus:outline-none';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gabung Meja"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            loading={isProcessing}
            disabled={!sourceTable || !targetTable}
            onClick={handleMerge}
          >
            Gabung Meja
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-ink-secondary">Pindahkan pesanan dari satu meja ke meja lain.</p>

        <div>
          <label htmlFor="merge-source" className="mb-1.5 block text-sm font-medium text-ink">
            Meja Asal
          </label>
          <select id="merge-source" value={sourceTable} onChange={(e) => setSourceTable(e.target.value)} className={selectClass}>
            <option value="">Pilih meja asal</option>
            {tables.map((table) => (
              <option key={table} value={table.toString()}>
                Meja {table}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="merge-target" className="mb-1.5 block text-sm font-medium text-ink">
            Meja Tujuan
          </label>
          <select id="merge-target" value={targetTable} onChange={(e) => setTargetTable(e.target.value)} className={selectClass}>
            <option value="">Pilih meja tujuan</option>
            {tables.map((table) => (
              <option key={table} value={table.toString()}>
                Meja {table}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-info/30 bg-info-soft p-4">
          <p className="text-sm text-info">
            <strong>Catatan:</strong> Semua pesanan aktif di meja asal akan dipindahkan ke meja tujuan. Meja asal akan
            kosong setelah penggabungan.
          </p>
        </div>
      </div>
    </Modal>
  );
};

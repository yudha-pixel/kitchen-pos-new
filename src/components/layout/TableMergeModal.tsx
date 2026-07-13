'use client';

import { useState } from 'react';
import { useCartStore } from '@/src/store/useCartStore';
import { X } from 'lucide-react';

interface TableMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableMergeModal = ({ isOpen, onClose }: TableMergeModalProps) => {
  const { mergeTable } = useCartStore();
  const [sourceTable, setSourceTable] = useState('');
  const [targetTable, setTargetTable] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const tables = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleMerge = async () => {
    if (!sourceTable || !targetTable) {
      alert('Pilih meja asal dan tujuan');
      return;
    }

    setIsProcessing(true);
    const result = await mergeTable(targetTable, sourceTable);
    setIsProcessing(false);

    if (result.success) {
      alert(result.message);
      setSourceTable('');
      setTargetTable('');
      onClose();
    } else {
      alert(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-black">Gabung Meja</h2>
            <p className="text-black mt-1">Pindahkan pesanan dari satu meja ke meja lain</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Source Table */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Meja Asal
            </label>
            <select
              value={sourceTable}
              onChange={(e) => setSourceTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih meja asal</option>
              {tables.map((table) => (
                <option key={table} value={table.toString()}>
                  Meja {table}
                </option>
              ))}
            </select>
          </div>

          {/* Target Table */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Meja Tujuan
            </label>
            <select
              value={targetTable}
              onChange={(e) => setTargetTable(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih meja tujuan</option>
              {tables.map((table) => (
                <option key={table} value={table.toString()}>
                  Meja {table}
                </option>
              ))}
            </select>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-black">
              <strong>Catatan:</strong> Semua pesanan aktif di meja asal akan dipindahkan ke meja tujuan. Meja asal akan kosong setelah penggabungan.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleMerge}
              disabled={isProcessing || !sourceTable || !targetTable}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Memproses...' : 'Gabung Meja'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

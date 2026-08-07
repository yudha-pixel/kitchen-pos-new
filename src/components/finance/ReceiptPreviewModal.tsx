'use client';

import { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';
import { Expense } from '@/src/features/finance/expenseService';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export function ReceiptPreviewModal({ isOpen, onClose, expense }: ReceiptPreviewModalProps) {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    if (!expense?.proof_file) return;

    const link = document.createElement('a');
    link.href = expense.proof_file;
    link.download = expense.proof_file_name || 'receipt.jpg';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  if (!isOpen || !expense?.proof_file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Preview Bukti Pengeluaran</h3>
            <p className="text-sm text-gray-600">{expense.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Reset Zoom"
            >
              <Maximize2 className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Download"
            >
              <Download className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Tutup"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Image Preview */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center">
          <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
            <img
              src={expense.proof_file}
              alt="Receipt Preview"
              className="max-w-full max-h-[70vh] object-contain rounded shadow-lg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Supplier:</span> {expense.supplier_name || '-'}
            </div>
            <div>
              <span className="font-medium">Tanggal:</span> {new Date(expense.date).toLocaleDateString('id-ID')}
            </div>
            <div>
              <span className="font-medium">Jumlah:</span> Rp{expense.amount.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

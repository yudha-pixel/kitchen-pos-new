'use client';

import { Printer as PrinterIcon } from 'lucide-react';

interface KitchenReceiptItem {
  name: string;
  quantity: number;
  modifiers: string[];
}

interface KitchenReceiptProps {
  orderId: string;
  tableNumber: string;
  items: KitchenReceiptItem[];
  printerType: 'kitchen' | 'bar';
  cashierName?: string;
  notes?: string;
  onClose?: () => void;
  onPrint?: () => void;
}

export const KitchenReceipt = ({
  orderId,
  tableNumber,
  items,
  printerType,
  cashierName = 'Kasir',
  notes,
  onClose,
  onPrint,
}: KitchenReceiptProps) => {
  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const formatOrderId = () => {
    return `ORD-${orderId.slice(0, 8).toUpperCase()}`;
  };

  const getPrinterTitle = () => {
    return printerType === 'kitchen' ? 'KITCHEN ORDER' : 'BAR ORDER';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Kitchen Receipt Container - Thermal Printer Width (58mm/80mm) */}
      <div
        id="kitchen-receipt-container"
        className="bg-white p-4 w-full max-w-[300px] kitchen-receipt-container"
        style={{
          fontFamily: "'Courier New', Courier, monospace !important",
          color: '#000000',
          backgroundColor: '#ffffff',
          lineHeight: '1.2',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {/* Header */}
        <div className="text-center mb-4 pb-2">
          <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
            {getPrinterTitle()}
          </h1>
        </div>

        {/* ASCII Separator */}
        <div className="text-center text-gray-800 mb-3">
          {'='.repeat(32)}
        </div>

        {/* Order Info */}
        <div className="text-xs text-gray-700 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>Order:</span>
            <span className="font-bold text-right">{formatOrderId()}</span>
          </div>
          <div className="flex justify-between">
            <span>Meja:</span>
            <span className="font-bold text-right">{tableNumber || 'Take Away'}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu:</span>
            <span className="font-bold text-right">{formatDate()}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span className="font-bold text-right">{cashierName}</span>
          </div>
        </div>

        {/* ASCII Separator */}
        <div className="text-center text-gray-800 mb-3">
          {'-'.repeat(32)}
        </div>

        {/* Items */}
        <div className="mb-3">
          {items.map((item, index) => (
            <div key={index} className="mb-2 py-1 border-b border-dashed border-gray-300">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-900 text-left flex-1">
                  {item.quantity}x {item.name}
                </span>
              </div>
              {item.modifiers.length > 0 && (
                <div className="text-xs mt-1 ml-4" style={{ color: '#333333' }}>
                  {item.modifiers.map((mod, modIndex) => (
                    <span key={modIndex} className="block italic">
                      - {mod}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        {notes && (
          <>
            <div className="text-center text-gray-800 mb-2 mt-3">
              {'-'.repeat(32)}
            </div>
            <div className="mb-2">
              <p className="text-xs text-gray-700 mb-1 font-bold">Catatan:</p>
              <p className="text-xs text-gray-900">{notes}</p>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-gray-800 mt-3 pt-2">
          {'='.repeat(32)}
        </div>
        <div className="text-center text-xs text-gray-700 mt-2 font-bold">
          *** END OF ORDER ***
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="flex gap-2 mt-4 print-hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PrinterIcon className="w-4 h-4" />
            Cetak
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

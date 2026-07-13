'use client';

import { Receipt as ReceiptIcon } from 'lucide-react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  modifiers: string[];
}

interface ReceiptProps {
  orderId: string;
  tableNumber: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  roundingAmount: number;
  total: number;
  paymentMethod: string;
  cashierName?: string;
  notes?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  onClose?: () => void;
}

export const Receipt = ({
  orderId,
  tableNumber,
  items,
  subtotal,
  tax,
  discount,
  roundingAmount,
  total,
  paymentMethod,
  cashierName = 'Kasir',
  notes,
  storeName = process.env.NEXT_PUBLIC_STORE_NAME || 'Kitchen POS',
  storeAddress = process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Jl. Contoh No. 123',
  storePhone = process.env.NEXT_PUBLIC_STORE_PHONE || '(021) 123-4567',
  onClose,
}: ReceiptProps) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatOrderId = () => {
    // Format: ORD-XXXX (4 karakter pertama dari UUID)
    return `ORD-${orderId.slice(0, 4).toUpperCase()}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Receipt Container - Thermal Printer Width (58mm/80mm) */}
      <div
        id="receipt-container"
        className="bg-white p-4 w-full max-w-[300px] receipt-container"
        style={{
          fontFamily: "'Courier New', Courier, monospace !important",
          color: '#000000',
          backgroundColor: '#ffffff',
          lineHeight: '1.2',
          boxShadow: 'none',
          filter: 'none',
          WebkitFontSmoothing: 'none',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        {/* Header */}
        <div className="text-center mb-4 pb-4">
          <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wider">{storeName}</h1>
          <p className="text-xs text-gray-700 mt-1">{storeAddress}</p>
          <p className="text-xs text-gray-700">{storePhone}</p>
        </div>

        {/* ASCII Separator */}
        <div className="text-center text-gray-800 mb-4">
          {'-'.repeat(32)}
        </div>

        {/* Order Info */}
        <div className="text-xs text-gray-700 mb-4 space-y-1">
          <div className="flex justify-between">
            <span>No. Order:</span>
            <span className="font-bold text-right">{formatOrderId()}</span>
          </div>
          <div className="flex justify-between">
            <span>Meja:</span>
            <span className="font-bold text-right">{tableNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span className="font-bold text-right">{formatDate()}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span className="font-bold text-right">{cashierName}</span>
          </div>
        </div>

        {/* ASCII Separator */}
        <div className="text-center text-gray-800 mb-4">
          {'-'.repeat(32)}
        </div>

        {/* Items */}
        <div className="mb-4">
          {items.map((item, index) => (
            <div key={index} className="mb-3 py-1">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-gray-900 text-left flex-1">
                  {item.name}
                </span>
                <span className="font-bold text-gray-900 text-right">
                  {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-700">
                <span className="text-left">{item.quantity} x {item.price.toLocaleString()}</span>
              </div>
              {item.modifiers.length > 0 && (
                <div className="text-xs italic mt-1 ml-4" style={{ color: '#333333', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>
                  {item.modifiers.map((mod, modIndex) => (
                    <span key={modIndex} className="block">+ {mod}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ASCII Separator */}
        <div className="text-center text-gray-800 mb-4">
          {'-'.repeat(32)}
        </div>

        {/* Summary */}
        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between text-gray-700">
            <span className="text-left">Subtotal</span>
            <span className="text-right">Rp {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span className="text-left">Pajak (10%)</span>
            <span className="text-right">Rp {tax.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span className="text-left">Diskon</span>
              <span className="text-right">-Rp {discount.toLocaleString()}</span>
            </div>
          )}
          {roundingAmount !== 0 && (
            <div className="flex justify-between text-gray-700">
              <span className="text-left">Pembulatan</span>
              <span className="text-right">Rp {roundingAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 mt-2">
            <span className="text-left">TOTAL</span>
            <span className="text-right">Rp {total.toLocaleString()}</span>
          </div>
        </div>

        {/* ASCII Separator */}
        <div className="text-center text-gray-800 mb-4">
          {'='.repeat(32)}
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-700">
            <span className="text-left">Metode Pembayaran</span>
            <span className="font-bold uppercase text-right">{paymentMethod}</span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mb-4">
            <p className="text-xs text-gray-700 mb-1 font-bold">Catatan:</p>
            <p className="text-xs text-gray-900">{notes}</p>
          </div>
        )}

        {/* QRIS Placeholder */}
        <div className="text-center mb-4">
          <div className="inline-block border-2 border-gray-800 p-2 mb-2">
            <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">QRIS</span>
            </div>
          </div>
          <p className="text-sm font-bold text-gray-900">TERIMA KASIH</p>
        </div>

        {/* ASCII Separator */}
        <div className="text-center text-gray-800 mb-4">
          {'-'.repeat(32)}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-700 mb-4">
          <p className="font-bold">Simpan struk ini sebagai bukti pembayaran yang sah</p>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="flex gap-2 print-hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ReceiptIcon className="w-4 h-4" />
            Cetak Struk
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

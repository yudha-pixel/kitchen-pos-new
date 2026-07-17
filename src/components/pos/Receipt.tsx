'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  const handlePrint = () => {
    // 1. Cari elemen pembungkus struk belanja di Receipt.tsx
    const receiptElement = document.getElementById('receipt-container') || document.querySelector('.receipt-container-class') || document.getElementById('temporary-print-root');

    if (!receiptElement) {
      console.error("Elemen struk tidak ditemukan di Receipt.tsx!");
      return;
    }

    // 2. Hapus iframe cetak lama jika masih tertinggal
    const oldIframe = document.getElementById('receipt-print-iframe');
    if (oldIframe) document.body.removeChild(oldIframe);

    // 3. Buat iframe baru yang tersembunyi
    const iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // 4. Ambil semua style aktif halaman utama agar Tailwind CSS tetap terbawa sempurna
    let stylesHtml = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    // 5. Tulis konten struk secara MURNI ke dalam iframe (Dashboard otomatis terisolasi/hilang!)
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;

    const iframeDoc = iframeWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          ${stylesHtml}
          <style>
            @page {
              margin: 0 !important;
              size: auto !important;
            }
            html, body {
              margin: 0 !important;
              padding: 10px !important;
              height: auto !important;
              overflow: hidden !important;
              background-color: #ffffff !important;
            }
            body {
              font-family: sans-serif;
              display: flex;
              justify-content: center;
            }
            button, .btn, [class*="CetakStruk"], button[onClick*="Print"] {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 400px; margin: 0 auto;">
            ${receiptElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // 6. Eksekusi cetak langsung dari dalam iframe
    setTimeout(() => {
      iframeWindow.focus();
      iframeWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
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
        <div className="mt-4 flex flex-col gap-2 w-full max-w-[400px] mx-auto print-hidden">
          <button
            onClick={handlePrint}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Cetak Struk
          </button>
          <button
            onClick={() => {
              if (onClose) onClose();
              router.push('/pos');
            }}
            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition print:hidden"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

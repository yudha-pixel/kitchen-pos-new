'use client';

import { forwardRef } from 'react';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  modifiers: string[];
}

interface ReceiptTemplateProps {
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
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(
  (
    {
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
    },
    ref
  ) => {
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
      return `ORD-${orderId.slice(0, 4).toUpperCase()}`;
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <div
        ref={ref}
        className="receipt-template"
        style={{
          width: '80mm',
          minHeight: '100mm',
          padding: '5mm',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#000000',
          backgroundColor: '#ffffff',
          margin: 0,
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px dashed #000' }}>
          <h1 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px 0' }}>
            {storeName}
          </h1>
          <p style={{ fontSize: '10px', margin: '2px 0' }}>{storeAddress}</p>
          <p style={{ fontSize: '10px', margin: '2px 0' }}>{storePhone}</p>
        </div>

        {/* Order Info */}
        <div style={{ fontSize: '10px', marginBottom: '10px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>No. Order:</span>
            <span style={{ fontWeight: 'bold' }}>{formatOrderId()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Meja:</span>
            <span style={{ fontWeight: 'bold' }}>{tableNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tanggal:</span>
            <span style={{ fontWeight: 'bold' }}>{formatDate()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Kasir:</span>
            <span style={{ fontWeight: 'bold' }}>{cashierName}</span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '10px' }}>
          {'-'.repeat(32)}
        </div>

        {/* Items */}
        <div style={{ marginBottom: '10px' }}>
          {items.map((item, index) => (
            <div key={index} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dotted #ccc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' }}>
                <span style={{ flex: 1 }}>{item.name}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
              <div style={{ fontSize: '10px', color: '#333' }}>
                {item.quantity} x {formatCurrency(item.price)}
              </div>
              {item.modifiers.length > 0 && (
                <div style={{ fontSize: '9px', fontStyle: 'italic', marginTop: '4px', marginLeft: '10px', color: '#333' }}>
                  {item.modifiers.map((mod, modIndex) => (
                    <div key={modIndex}>+ {mod}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Separator */}
        <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '10px' }}>
          {'-'.repeat(32)}
        </div>

        {/* Summary */}
        <div style={{ fontSize: '11px', marginBottom: '10px', lineHeight: '1.8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Pajak (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Diskon</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          {roundingAmount !== 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pembulatan</span>
              <span>{formatCurrency(roundingAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', paddingTop: '5px', marginTop: '5px', borderTop: '1px solid #000' }}>
            <span>TOTAL</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Separator */}
        <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '10px' }}>
          {'='.repeat(32)}
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span>Metode Pembayaran</span>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{paymentMethod}</span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Catatan:</p>
            <p style={{ fontSize: '10px', margin: 0 }}>{notes}</p>
          </div>
        )}

        {/* QRIS Placeholder */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'inline-block', border: '2px solid #000', padding: '5px', marginBottom: '5px' }}>
            <div style={{ width: '60px', height: '60px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '8px', color: '#666' }}>QRIS</span>
            </div>
          </div>
          <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '5px 0' }}>TERIMA KASIH</p>
        </div>

        {/* Separator */}
        <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '10px' }}>
          {'-'.repeat(32)}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '9px', marginBottom: '10px' }}>
          <p style={{ fontWeight: 'bold', margin: 0 }}>Simpan struk ini sebagai bukti pembayaran yang sah</p>
        </div>
      </div>
    );
  }
);

ReceiptTemplate.displayName = 'ReceiptTemplate';

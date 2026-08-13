'use client';

import { useEffect, useRef } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { formatRupiah } from '@/src/lib/format';
import { Banknote, QrCode, CreditCard } from 'lucide-react';

type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT';

interface CartPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  orderCategory: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  itemCount: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  cashReceived: string;
  onCashReceivedChange: (value: string) => void;
  paying: boolean;
  onConfirm: () => void;
}

const methods: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'CASH', label: 'Tunai', icon: Banknote },
  { value: 'QRIS', label: 'QRIS', icon: QrCode },
  { value: 'DEBIT', label: 'Debit / Kredit', icon: CreditCard },
];

const orderCategoryLabel: Record<CartPaymentModalProps['orderCategory'], string> = {
  'dine-in': 'Dine-in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

export const CartPaymentModal = ({
  isOpen,
  onClose,
  total,
  orderCategory,
  tableNumber,
  itemCount,
  paymentMethod,
  onPaymentMethodChange,
  cashReceived,
  onCashReceivedChange,
  paying,
  onConfirm,
}: CartPaymentModalProps) => {
  const cashAmount = Number(cashReceived) || 0;
  const change = cashAmount - total;
  const isCashValid = paymentMethod !== 'CASH' || (cashReceived !== '' && cashAmount >= total);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && paymentMethod === 'CASH') inputRef.current?.focus();
  }, [isOpen, paymentMethod]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isCashValid && !paying) {
      e.preventDefault();
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pembayaran"
      size="md"
      footer={
        <div className="flex w-full gap-3">
          <Button variant="ghost" size="lg" className="flex-1" onClick={onClose} disabled={paying}>
            Batal
          </Button>
          <Button
            variant="success"
            size="lg"
            className="flex-[2] font-bold"
            disabled={!isCashValid}
            loading={paying}
            onClick={onConfirm}
          >
            Selesaikan & Cetak Struk
          </Button>
        </div>
      }
    >
      <div onKeyDown={handleKeyDown} className="space-y-4">
        {/* Summary */}
        <div className="rounded-lg bg-surface-alt p-4 text-center">
          <p className="text-sm text-ink-secondary">
            {orderCategoryLabel[orderCategory]}
            {tableNumber ? ` | ${tableNumber}` : ''} | {itemCount} Item
          </p>
          <p className="tnum mt-1 text-3xl font-bold text-ink">{formatRupiah(total)}</p>
        </div>

        {/* Method tabs */}
        <div className="grid grid-cols-3 gap-2">
          {methods.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => onPaymentMethodChange(value)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors ${
                paymentMethod === value ? 'border-primary bg-primary-soft text-primary' : 'border-line text-ink-secondary hover:border-line-strong'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>

        {paymentMethod === 'CASH' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onCashReceivedChange(String(total))}
                className="rounded-lg border border-line-strong px-2 py-2 text-xs font-medium hover:bg-surface-alt"
              >
                Uang Pas
              </button>
              <button
                type="button"
                onClick={() => onCashReceivedChange('50000')}
                className="rounded-lg border border-line-strong px-2 py-2 text-xs font-medium hover:bg-surface-alt"
              >
                Rp 50.000
              </button>
              <button
                type="button"
                onClick={() => onCashReceivedChange('100000')}
                className="rounded-lg border border-line-strong px-2 py-2 text-xs font-medium hover:bg-surface-alt"
              >
                Rp 100.000
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="rounded-lg border border-line-strong px-2 py-2 text-xs font-medium hover:bg-surface-alt"
              >
                Custom
              </button>
            </div>

            <div>
              <label htmlFor="payment-cash-input" className="mb-1 block text-sm font-medium text-ink">
                Uang Diterima
              </label>
              <input
                id="payment-cash-input"
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={cashReceived}
                onChange={(e) => onCashReceivedChange(e.target.value)}
                placeholder="Masukkan jumlah uang tunai"
                className="tnum min-h-12 w-full rounded-lg border border-line-strong bg-surface px-3 text-lg font-medium text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
              />
            </div>

            {cashReceived !== '' && (
              <div className={`rounded-lg border p-3 text-center ${change >= 0 ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft'}`}>
                <p className={`text-sm font-medium ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {change >= 0 ? 'Kembalian' : 'Kurang'}
                </p>
                <p className={`tnum text-xl font-bold ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatRupiah(Math.abs(change))}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line-strong p-6 text-center text-sm text-ink-secondary">
            {paymentMethod === 'QRIS'
              ? 'Kode QR akan ditampilkan setelah pesanan diproses.'
              : 'Ikuti instruksi pada mesin EDC setelah pesanan diproses.'}
          </div>
        )}
      </div>
    </Modal>
  );
};

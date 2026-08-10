'use client';

import { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah } from '@/src/lib/format';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onPaymentComplete: () => void;
}

export const CardPaymentModal = ({ isOpen, onClose, order, onPaymentComplete }: CardPaymentModalProps) => {
  const [status, setStatus] = useState<'input' | 'processing' | 'success' | 'failed'>('input');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [approvalCode, setApprovalCode] = useState('');
  const [cardType, setCardType] = useState<'debit' | 'credit'>('debit');
  const { toast } = useToast();

  const calculateTotal = () => {
    return order.items?.reduce((sum: number, item: any) => {
      const price = Number(item.price_at_time) || 0;
      return sum + (price * item.quantity);
    }, 0) || 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 2) {
      setExpiryDate(value.slice(0, 2) + '/' + value.slice(2));
    } else {
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(value);
  };

  const handleSubmit = () => {
    if (!cardNumber || !expiryDate || !cvv) {
      toast('warning', 'Mohon lengkapi semua data kartu');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast('warning', 'Nomor kartu tidak valid');
      return;
    }

    if (cvv.length < 3) {
      toast('warning', 'CVV tidak valid');
      return;
    }

    setStatus('processing');

    // Simulate payment processing
    setTimeout(() => {
      setStatus('success');
      // Generate a mock approval code
      setApprovalCode(Math.random().toString(36).substring(2, 10).toUpperCase());
    }, 2000);
  };

  const handleComplete = () => {
    onPaymentComplete();
    onClose();
    // Reset form
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setApprovalCode('');
    setCardType('debit');
    setStatus('input');
  };

  const handleClose = () => {
    // Always allow closing the modal regardless of status
    onClose();
    // Reset form
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setApprovalCode('');
    setCardType('debit');
    setStatus('input');
  };

  const handleRetry = () => {
    setStatus('input');
  };

  const total = calculateTotal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pembayaran Debit/Kartu"
      size="md"
      footer={
        <div className="w-full flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={handleClose}
          >
            {status === 'input' ? 'Batal' : 'Tutup'}
          </Button>
          {status === 'input' && (
            <Button
              size="lg"
              className="flex-1"
              onClick={handleSubmit}
            >
              Proses Pembayaran
            </Button>
          )}
          {status === 'success' && (
            <Button
              size="lg"
              className="flex-1"
              onClick={handleComplete}
            >
              Selesai
            </Button>
          )}
          {status === 'failed' && (
            <Button
              size="lg"
              className="flex-1"
              onClick={handleRetry}
            >
              Coba Lagi
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Meja</span>
            <span className="font-medium">{order.table_number || 'Direct'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-xl font-bold">{formatRupiah(total)}</span>
          </div>
        </div>

        {/* Card Input Form */}
        {status === 'input' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-gray-600" />
              <h3 className="font-medium text-gray-700">Detail Kartu</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kartu</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="debit"
                    checked={cardType === 'debit'}
                    onChange={(e) => setCardType(e.target.value as 'debit' | 'credit')}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm">Debit</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="credit"
                    checked={cardType === 'credit'}
                    onChange={(e) => setCardType(e.target.value as 'debit' | 'credit')}
                    className="accent-[var(--primary)]"
                  />
                  <span className="text-sm">Kredit</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Kartu</label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Masa Berlaku (MM/YY)</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  placeholder="MM/YY"
                  className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="password"
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none"
                  maxLength={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === 'processing' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-2">Memproses Pembayaran</p>
              <p className="text-sm text-gray-600">Mohon tunggu sebentar...</p>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</p>
              <p className="text-sm text-gray-600 mb-2">Pembayaran kartu telah diterima</p>
              {approvalCode && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-xs text-gray-500 mb-1">Kode Persetujuan</p>
                  <p className="font-mono font-bold text-lg">{approvalCode}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-600 mb-2">Pembayaran Gagal</p>
              <p className="text-sm text-gray-600 mb-4">Terjadi kesalahan saat memproses pembayaran</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

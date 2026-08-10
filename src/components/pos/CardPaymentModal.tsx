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
  const [referenceNumber, setReferenceNumber] = useState('');
  const { toast } = useToast();

  const calculateTotal = () => {
    return order.items?.reduce((sum: number, item: any) => {
      const price = Number(item.price_at_time) || 0;
      return sum + (price * item.quantity);
    }, 0) || 0;
  };

  const handleSubmit = () => {
    if (!referenceNumber.trim()) {
      toast('warning', 'Masukkan nomor referensi dari mesin EDC');
      return;
    }

    setStatus('processing');

    // Simulate payment processing
    setTimeout(() => {
      setStatus('success');
      toast('success', 'Pembayaran kartu berhasil diverifikasi');
      setTimeout(() => {
        onPaymentComplete();
      }, 1000);
    }, 1500);
  };

  const handleClose = () => {
    onClose();
    setReferenceNumber('');
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
              onClick={handleClose}
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
              <h3 className="font-medium text-gray-700">Konfirmasi Pembayaran Kartu</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Referensi EDC
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Masukkan nomor referensi dari mesin EDC"
                className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan nomor referensi yang muncul pada mesin EDC setelah kartu diproses
              </p>
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
              <p className="text-sm text-gray-600">Pembayaran kartu telah diverifikasi</p>
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

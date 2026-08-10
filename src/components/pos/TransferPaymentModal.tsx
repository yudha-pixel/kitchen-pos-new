'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah } from '@/src/lib/format';
import { CreditCard, CheckCircle, XCircle, Building2 } from 'lucide-react';

interface TransferPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onPaymentComplete: () => void;
}

export const TransferPaymentModal = ({ isOpen, onClose, order, onPaymentComplete }: TransferPaymentModalProps) => {
  const [status, setStatus] = useState<'input' | 'processing' | 'success' | 'failed'>('input');
  const [referenceNumber, setReferenceNumber] = useState('');
  const { toast } = useToast();

  const calculateTotal = () => {
    if (!order || !order.items) return 0;
    return order.items.reduce((sum: number, item: any) => {
      const price = Number(item.price_at_time) || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleSubmit = () => {
    if (!referenceNumber.trim()) {
      toast('warning', 'Masukkan nomor referensi transfer');
      return;
    }

    setStatus('processing');

    // Simulate processing
    setTimeout(() => {
      setStatus('success');
      toast('success', 'Transfer berhasil diverifikasi');
      setTimeout(() => {
        onPaymentComplete();
      }, 1000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Transfer Bank</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            disabled={status === 'processing'}
          >
            <XCircle className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {status === 'input' && (
          <div className="space-y-4">
            {/* Bank Account Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Rekening Tujuan</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">BCA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No. Rekening:</span>
                  <span className="font-medium">123-456-7890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Atas Nama:</span>
                  <span className="font-medium">Restaurant Kitchen POS</span>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Transfer:</span>
                <span className="text-xl font-bold text-blue-600">{formatRupiah(calculateTotal())}</span>
              </div>
            </div>

            {/* Reference Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Referensi Transfer
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="Masukkan nomor referensi dari bukti transfer"
                className="w-full p-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan nomor referensi yang tertera pada bukti transfer Anda
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!referenceNumber.trim()}
            >
              Konfirmasi Transfer
            </Button>
          </div>
        )}

        {status === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memverifikasi transfer...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-green-700 mb-2">Transfer Berhasil</h4>
            <p className="text-gray-600">Pembayaran telah diverifikasi</p>
          </div>
        )}
      </div>
    </div>
  );
};

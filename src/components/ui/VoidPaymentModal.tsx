'use client';

import { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

interface VoidPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  paymentAmount: number;
  onVoided: () => void;
}

export const VoidPaymentModal = ({ 
  isOpen, 
  onClose, 
  paymentId, 
  paymentAmount,
  onVoided 
}: VoidPaymentModalProps) => {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoidPayment = async () => {
    if (!reason.trim()) {
      toast('error', 'Alasan void pembayaran wajib diisi');
      return;
    }

    setIsProcessing(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal void pembayaran');
      }

      toast('success', 'Pembayaran berhasil di-void');
      onVoided();
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error voiding payment:', error);
      toast('error', error instanceof Error ? error.message : 'Gagal void pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Void Pembayaran"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Peringatan:</strong> Tindakan ini akan membatalkan pembayaran dan mengembalikan status pesanan ke pending.
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Nominal Pembayaran:</span>
            <span className="font-medium">Rp {paymentAmount.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Alasan Void *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Masukkan alasan void pembayaran"
            rows={3}
            className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">{reason.length}/500 karakter</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Void pembayaran memerlukan otorisasi admin dan akan dicatat dalam audit trail.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={onClose}
          disabled={isProcessing}
        >
          Batal
        </Button>
        <Button
          size="lg"
          className="flex-1 bg-red-600 hover:bg-red-700"
          onClick={handleVoidPayment}
          disabled={isProcessing}
        >
          {isProcessing ? 'Memproses...' : 'Void Pembayaran'}
        </Button>
      </div>
    </Modal>
  );
};

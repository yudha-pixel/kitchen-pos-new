'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah } from '@/src/lib/format';
import { QrCode, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface QRISPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onPaymentComplete: () => void;
}

export const QRISPaymentModal = ({ isOpen, onClose, order, onPaymentComplete }: QRISPaymentModalProps) => {
  const [status, setStatus] = useState<'scanning' | 'success' | 'failed'>('scanning');
  const [countdown, setCountdown] = useState(60);
  const { toast } = useToast();

  const calculateTotal = () => {
    return order.items?.reduce((sum: number, item: any) => {
      const price = Number(item.price_at_time) || 0;
      return sum + (price * item.quantity);
    }, 0) || 0;
  };

  useEffect(() => {
    if (!isOpen) {
      setStatus('scanning');
      setCountdown(60);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleRefresh = () => {
    setStatus('scanning');
    setCountdown(60);
  };

  const handleComplete = () => {
    onPaymentComplete();
    onClose();
  };

  const handleClose = () => {
    // Always allow closing the modal regardless of status
    onClose();
  };

  const total = calculateTotal();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pembayaran QRIS"
      size="md"
      footer={
        <div className="w-full flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={handleClose}
          >
            {status === 'scanning' ? 'Batal' : 'Tutup'}
          </Button>
          {status === 'scanning' && (
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
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

        {/* QR Code Display */}
        <div className="flex flex-col items-center space-y-4">
          {status === 'scanning' && (
            <>
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="flex items-center justify-center w-48 h-48 bg-gray-100 rounded-lg">
                  <QrCode className="w-32 h-32 text-gray-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Scan QR Code untuk pembayaran</p>
                <p className="text-lg font-semibold text-primary">Kadaluarsa dalam {countdown} detik</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600 mb-2">Pembayaran Berhasil!</p>
                <p className="text-sm text-gray-600">Pembayaran QRIS telah diterima</p>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600 mb-2">Waktu Habis</p>
                <p className="text-sm text-gray-600 mb-4">QR Code telah kadaluarsa</p>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate QR Baru
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

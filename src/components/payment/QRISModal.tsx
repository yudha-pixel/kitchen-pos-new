'use client';

import { useEffect, useState } from 'react';
import { usePaymentStore } from '@/src/features/payment/paymentStore';
import { pollPaymentStatus } from '@/src/features/payment/paymentService';
import { X, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface QRISModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onFailed: () => void;
}

export function QRISModal({ onClose, onSuccess, onFailed }: QRISModalProps) {
  const { currentPayment, loading, clearPayment } = usePaymentStore();
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!currentPayment) return;

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll payment status
    const pollStatus = async () => {
      setPolling(true);
      const result = await pollPaymentStatus(currentPayment.id || '');
      setPolling(false);

      if (result) {
        if (result.status === 'paid') {
          onSuccess();
          onClose();
        } else if (result.status === 'failed' || result.status === 'expired') {
          onFailed();
          onClose();
        }
      }
    };

    pollStatus();

    return () => {
      clearInterval(timer);
    };
  }, [currentPayment]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    // In production, this would regenerate the QR code
    setTimeLeft(900);
  };

  if (!currentPayment) {
    return null;
  }

  const isExpired = timeLeft <= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Pembayaran QRIS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="bg-gray-100 rounded-lg p-6 mb-4">
            {currentPayment.qr_code ? (
              <img
                src={`data:image/png;base64,${currentPayment.qr_code}`}
                alt="QRIS Code"
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 mx-auto flex items-center justify-center bg-gray-200">
                <span className="text-gray-500">Loading QR Code...</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
            <Clock className="h-4 w-4" />
            <span>
              {isExpired ? 'QR Code Expired' : `Berlaku: ${formatTime(timeLeft)}`}
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Scan QR code dengan aplikasi e-wallet atau mobile banking Anda
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Pembayaran</span>
            <span className="text-xl font-bold text-blue-600">
              Rp {currentPayment.amount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || polling}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${polling ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
        </div>

        {polling && (
          <div className="mt-4 text-center text-sm text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
            Menunggu pembayaran...
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useOnlineCartStore } from '@/src/store/useOnlineCartStore';
import { useToast } from '@/src/components/ui/Toast';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const CustomerFormModal = ({ isOpen, onClose, onContinue }: CustomerFormModalProps) => {
  const { toast } = useToast();
  const {
    fulfillmentType,
    customerName,
    customerPhone,
    customerAddress,
    setCustomerName,
    setCustomerPhone,
    setCustomerAddress,
  } = useOnlineCartStore();

  const handleContinue = () => {
    // Validation
    if (!customerName.trim()) {
      toast('error', 'Nama pemesan wajib diisi');
      return;
    }
    if (!customerPhone.trim()) {
      toast('error', 'Nomor WhatsApp/Telepon wajib diisi');
      return;
    }
    if (fulfillmentType === 'delivery' && !customerAddress.trim()) {
      toast('error', 'Alamat pengiriman wajib diisi untuk pesanan antar');
      return;
    }

    onContinue();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Informasi Pelanggan"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nama Pemesan *
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nomor WhatsApp/Telepon *
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Contoh: 08123456789"
            className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>

        {fulfillmentType === 'delivery' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Alamat Pengiriman *
            </label>
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Masukkan alamat lengkap pengiriman"
              rows={3}
              className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none resize-none"
            />
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Data pelanggan diperlukan untuk pengiriman dan notifikasi status pesanan.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          variant="ghost"
          size="lg"
          className="flex-1"
          onClick={onClose}
        >
          Batal
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleContinue}
        >
          Lanjut ke Pembayaran
        </Button>
      </div>
    </Modal>
  );
};

'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/src/store/useCartStore';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onCloseModal?: () => void;
  isModalOpen?: boolean;
  label?: string;
  className?: string;
}

export const BackButton = ({ 
  onCloseModal, 
  isModalOpen = false,
  label = 'Kembali',
  className = '',
}: BackButtonProps) => {
  const router = useRouter();
  const { items } = useCartStore();

  const handleBack = () => {
    // If modal is open, close it instead of navigating back
    if (isModalOpen && onCloseModal) {
      onCloseModal();
      return;
    }

    // Safety guard: Check if cart has items
    if (items.length > 0) {
      const confirmed = window.confirm(
        'Pesanan di keranjang belum tersimpan. Yakin ingin kembali?'
      );
      if (!confirmed) {
        return;
      }
    }

    // Navigate back
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

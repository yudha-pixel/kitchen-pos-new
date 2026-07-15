'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/src/store/useCartStore';
import { ArrowLeft } from 'lucide-react';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';

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
  const [confirmLeave, setConfirmLeave] = useState(false);

  const handleBack = () => {
    // If modal is open, close it instead of navigating back
    if (isModalOpen && onCloseModal) {
      onCloseModal();
      return;
    }

    // Safety guard: Check if cart has items
    if (items.length > 0) {
      setConfirmLeave(true);
      return;
    }

    router.back();
  };

  return (
    <>
      <button
        onClick={handleBack}
        className={`flex min-h-11 items-center gap-2 rounded-lg border border-line-strong px-4 py-2 text-ink-secondary transition-colors hover:bg-surface-alt ${className}`}
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{label}</span>
      </button>

      <ConfirmDialog
        isOpen={confirmLeave}
        title="Tinggalkan halaman?"
        message="Pesanan di keranjang belum tersimpan. Yakin ingin kembali?"
        confirmLabel="Ya, kembali"
        danger
        onConfirm={() => {
          setConfirmLeave(false);
          router.back();
        }}
        onCancel={() => setConfirmLeave(false)}
      />
    </>
  );
};

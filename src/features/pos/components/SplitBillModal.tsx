'use client';

import { useState } from 'react';
import { useCartStore } from '@/src/store/useCartStore';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah } from '@/src/lib/format';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSplitComplete: (splitCart: any[]) => void;
}

export const SplitBillModal = ({ isOpen, onClose, onSplitComplete }: SplitBillModalProps) => {
  const { items, splitBill } = useCartStore();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const { toast } = useToast();

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItemIds.length === items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(items.map(item => item.id));
    }
  };

  const handleConfirmSplit = () => {
    if (selectedItemIds.length === 0) {
      toast('warning', 'Pilih minimal satu item untuk split bill');
      return;
    }

    const result = splitBill(selectedItemIds);

    if (result.success && result.splitCart) {
      onSplitComplete(result.splitCart);
      setSelectedItemIds([]);
      onClose();
    } else {
      toast('error', result.message);
    }
  };

  const calculateItemTotal = (item: any) => {
    const modifierTotal = item.modifiers.reduce((sum: number, m: any) => sum + m.price, 0);
    return (item.price + modifierTotal) * item.quantity;
  };

  const calculateSelectedTotal = () => {
    return items
      .filter(item => selectedItemIds.includes(item.id))
      .reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Split Bill"
      size="lg"
      footer={
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-bold text-ink">Total yang Dipilih:</span>
            <span className="tnum text-2xl font-bold text-ink">{formatRupiah(calculateSelectedTotal())}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="lg" className="flex-1 text-danger hover:bg-danger-soft" onClick={onClose}>
              Batal
            </Button>
            <Button size="lg" className="flex-1" disabled={selectedItemIds.length === 0} onClick={handleConfirmSplit}>
              Konfirmasi Split
            </Button>
          </div>
        </div>
      }
    >
      {items.length === 0 ? (
        <p className="py-8 text-center text-ink-muted">Tidak ada item di keranjang</p>
      ) : (
        <div className="space-y-3">
          <label className="mb-4 flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={selectedItemIds.length === items.length}
              onChange={handleSelectAll}
              className="h-5 w-5 rounded accent-[var(--primary)]"
            />
            <span className="font-medium text-ink">Pilih Semua</span>
          </label>

          {items.map((item) => {
            const itemTotal = calculateItemTotal(item);
            const isSelected = selectedItemIds.includes(item.id);

            return (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  isSelected ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleItem(item.id)}
                  className="h-5 w-5 rounded accent-[var(--primary)]"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-ink">{item.name}</h4>
                      <p className="tnum text-sm text-ink-secondary">
                        {item.quantity} x {formatRupiah(item.price)}
                      </p>
                      {item.modifiers.length > 0 && (
                        <div className="mt-1 text-xs text-ink-muted">
                          {item.modifiers.map((mod: any) => (
                            <span key={mod.id} className="mr-2">+ {mod.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="tnum font-bold text-ink">{formatRupiah(itemTotal)}</span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

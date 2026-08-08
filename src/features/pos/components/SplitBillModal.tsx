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
  order?: any;
  onSplitComplete: (selectedItems: any[], paymentMethod: string) => void;
}

export const SplitBillModal = ({ isOpen, onClose, order, onSplitComplete }: SplitBillModalProps) => {
  const { items: cartItems, splitBill } = useCartStore();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const paymentMethods = [
    { value: 'CASH', label: 'Tunai' },
    { value: 'QRIS', label: 'QRIS' },
    { value: 'DEBIT', label: 'Debit/Kartu' },
  ];

  // Use order items if provided, otherwise use cart items
  const items = order?.items || cartItems;

  const handleToggleItem = (itemId: string) => {
    if (isProcessing) return;
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (isProcessing) return;
    const allItemIds = items.map((item: any) => item.id) || [];
    if (selectedItemIds.length === allItemIds.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(allItemIds);
    }
  };

  const handleConfirmSplit = async () => {
    if (isProcessing) return;
    
    if (selectedItemIds.length === 0) {
      toast('warning', 'Pilih minimal satu item untuk split bill');
      return;
    }
    if (!selectedPaymentMethod) {
      toast('warning', 'Pilih metode pembayaran terlebih dahulu');
      return;
    }

    setIsProcessing(true);

    try {
      const selectedItems = items.filter((item: any) => selectedItemIds.includes(item.id)) || [];
      
      // Add small delay to prevent double-click
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onSplitComplete(selectedItems, selectedPaymentMethod);
      setSelectedItemIds([]);
      setSelectedPaymentMethod('');
      onClose();
    } catch (error) {
      console.error('Split bill error:', error);
      toast('error', 'Gagal memproses split bill');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) {
      toast('warning', 'Pembayaran sedang diproses');
      return;
    }
    onClose();
  };

  const calculateItemTotal = (item: any) => {
    // Handle both order items and cart items
    const price = Number(item.price_at_time || item.price) || 0;
    const modifiers = item.modifiers_applied || item.modifiers || [];
    const modifierTotal = modifiers.reduce((sum: number, m: any) => sum + (m.price_extra || m.price || 0), 0) || 0;
    return (price + modifierTotal) * item.quantity;
  };

  const calculateSelectedTotal = () => {
    return items
      ?.filter((item: any) => selectedItemIds.includes(item.id))
      .reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0) || 0;
  };

  const getItemName = (item: any) => {
    return item.product?.name || item.name || 'Unknown';
  };

  const getItemPrice = (item: any) => {
    return Number(item.price_at_time || item.price) || 0;
  };

  const getItemModifiers = (item: any) => {
    return item.modifiers_applied || item.modifiers || [];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Split Bill"
      size="lg"
      footer={
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-bold text-ink">Total yang Dipilih:</span>
            <span className="tnum text-2xl font-bold text-ink">{formatRupiah(calculateSelectedTotal())}</span>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="lg" 
              className="flex-1 text-danger hover:bg-danger-soft" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              Batal
            </Button>
            <Button 
              size="lg" 
              className="flex-1" 
              disabled={selectedItemIds.length === 0 || !selectedPaymentMethod || isProcessing} 
              onClick={handleConfirmSplit}
            >
              {isProcessing ? 'Memproses...' : 'Bayar Split'}
            </Button>
          </div>
        </div>
      }
    >
      {!items || items.length === 0 ? (
        <p className="py-8 text-center text-ink-muted">Tidak ada item dalam pesanan</p>
      ) : (
        <div className="space-y-4">
          <label className="mb-4 flex min-h-11 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={selectedItemIds.length === items.length}
              onChange={handleSelectAll}
              disabled={isProcessing}
              className="h-5 w-5 rounded accent-[var(--primary)]"
            />
            <span className="font-medium text-ink">Pilih Semua</span>
          </label>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((item: any) => {
              const itemTotal = calculateItemTotal(item);
              const isSelected = selectedItemIds.includes(item.id);
              const modifiers = getItemModifiers(item);

              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                    isSelected ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleItem(item.id)}
                    disabled={isProcessing}
                    className="h-5 w-5 rounded accent-[var(--primary)]"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-ink">{getItemName(item)}</h4>
                        <p className="tnum text-sm text-ink-secondary">
                          {item.quantity} x {formatRupiah(getItemPrice(item))}
                        </p>
                        {modifiers && modifiers.length > 0 && (
                          <div className="mt-1 text-xs text-ink-muted">
                            {modifiers.map((mod: any) => (
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

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Metode Pembayaran</p>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => !isProcessing && setSelectedPaymentMethod(method.value)}
                  disabled={isProcessing}
                  className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                    selectedPaymentMethod === method.value
                      ? 'border-primary bg-primary-soft'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

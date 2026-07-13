'use client';

import { useState } from 'react';
import { useCartStore } from '@/src/store/useCartStore';
import { X } from 'lucide-react';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSplitComplete: (splitCart: any[]) => void;
}

export const SplitBillModal = ({ isOpen, onClose, onSplitComplete }: SplitBillModalProps) => {
  const { items, splitBill } = useCartStore();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

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
      alert('Pilih minimal satu item untuk split bill');
      return;
    }

    const result = splitBill(selectedItemIds);

    if (result.success && result.splitCart) {
      onSplitComplete(result.splitCart);
      setSelectedItemIds([]);
      onClose();
    } else {
      alert(result.message);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-black">Split Bill</h2>
            <p className="text-black mt-1">Pilih item yang ingin dipisah</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-black text-center py-8">Tidak ada item di keranjang</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={selectedItemIds.length === items.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium text-black">Pilih Semua</span>
              </div>

              {items.map((item) => {
                const itemTotal = calculateItemTotal(item);
                const isSelected = selectedItemIds.includes(item.id);

                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleItem(item.id)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-black">{item.name}</h4>
                          <p className="text-sm text-black">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                          {item.modifiers.length > 0 && (
                            <div className="text-xs text-black mt-1">
                              {item.modifiers.map((mod: any) => (
                                <span key={mod.id} className="mr-2">+ {mod.name}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-black">Rp {itemTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-black">Total yang Dipilih:</span>
            <span className="text-2xl font-bold text-black">
              Rp {calculateSelectedTotal().toLocaleString()}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmSplit}
              disabled={selectedItemIds.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Konfirmasi Split
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

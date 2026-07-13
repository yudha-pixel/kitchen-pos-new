'use client';

import { useState, useEffect } from 'react';
import { getModifiersByCategory, convertToUIModifiers } from '@/src/data/modifiers';

export interface ModifierOption {
  id: string; // UUID
  name: string;
  price: number;
  selected: boolean;
}

export interface ModifierGroup {
  id: string; // UUID
  name: string;
  options: ModifierOption[];
  required: boolean;
  multiSelect: boolean;
}

// Alias for compatibility with new schema
export type UIModifierGroup = ModifierGroup;

interface ModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  modifiers?: ModifierGroup[];
  onConfirm: (selectedModifiers: ModifierOption[]) => void;
  productName?: string;
  basePrice?: number;
  category?: string;
}

export const ModifierModal = ({
  isOpen,
  onClose,
  modifiers,
  onConfirm,
  productName = 'Produk',
  basePrice = 0,
  category
}: ModifierModalProps) => {
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOption[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Get modifiers based on category or use provided modifiers
  const effectiveModifiers = category
    ? convertToUIModifiers(getModifiersByCategory(category))
    : modifiers || [];

  // Escape key shortcut
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, hasChanges]);

  const toggleModifier = (group: ModifierGroup, option: ModifierOption) => {
    setHasChanges(true);
    if (!group.multiSelect) {
      // Single select - replace current selection in this group
      setSelectedModifiers(prev => {
        const otherGroups = prev.filter(m =>
          !group.options.some(o => o.id === m.id)
        );
        const isSelected = selectedModifiers.some(m => m.id === option.id);
        return isSelected ? otherGroups : [...otherGroups, { ...option, selected: true }];
      });
    } else {
      // Multi select - toggle individual option
      setSelectedModifiers(prev => {
        const isSelected = prev.some(m => m.id === option.id);
        if (isSelected) {
          return prev.filter(m => m.id !== option.id);
        } else {
          return [...prev, { ...option, selected: true }];
        }
      });
    }
  };

  const calculateTotal = () => {
    const modifierTotal = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
    return basePrice + modifierTotal;
  };

  const handleConfirm = () => {
    // Check if all required groups have selections
    const requiredGroups = effectiveModifiers.filter(g => g.required);
    const missingRequired = requiredGroups.filter(group => {
      const hasSelection = selectedModifiers.some(m =>
        group.options.some((o: ModifierOption) => o.id === m.id)
      );
      return !hasSelection;
    });

    if (missingRequired.length > 0) {
      alert(`Mohon pilih modifier wajib: ${missingRequired.map(g => g.name).join(', ')}`);
      return;
    }

    onConfirm(selectedModifiers);
    setSelectedModifiers([]);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmed = window.confirm('Batalkan perubahan modifier?');
      if (!confirmed) {
        return;
      }
    }
    setSelectedModifiers([]);
    setHasChanges(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-black">{productName}</h2>
          <p className="text-black mt-1">Pilih modifier tambahan</p>
        </div>

        {/* Modifier Groups */}
        <div className="flex-1 overflow-y-auto p-6">
          {effectiveModifiers.length === 0 ? (
            <p className="text-black text-center py-8">Tidak ada modifier tersedia</p>
          ) : (
            <div className="space-y-6">
              {effectiveModifiers.map(group => (
                <div key={group.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-black">
                      {group.name}
                      {group.required && <span className="text-red-500 ml-2">*</span>}
                    </h3>
                    <span className="text-xs text-black">
                      {group.multiSelect ? 'Pilih banyak' : 'Pilih satu'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {group.options.map((option: ModifierOption) => {
                      const isSelected = selectedModifiers.some(m => m.id === option.id);
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type={group.multiSelect ? 'checkbox' : 'radio'}
                              name={`group-${group.id}`}
                              checked={isSelected}
                              onChange={() => toggleModifier(group, option)}
                              className="w-5 h-5 text-blue-600"
                            />
                            <span className="font-medium text-black">{option.name}</span>
                          </div>
                          <span className="text-black">
                            {option.price > 0 ? `+Rp ${option.price.toLocaleString()}` : 'Gratis'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-black">Harga dasar: Rp {basePrice.toLocaleString()}</p>
              <p className="text-sm text-black">
                Modifier: Rp {selectedModifiers.reduce((sum, m) => sum + m.price, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-black">Total</p>
              <p className="text-2xl font-bold text-black">
                Rp {calculateTotal().toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

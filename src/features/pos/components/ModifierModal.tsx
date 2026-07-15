'use client';

import { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah } from '@/src/lib/format';

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
}

export const ModifierModal = ({
  isOpen,
  onClose,
  modifiers,
  onConfirm,
  productName = 'Produk',
  basePrice = 0,
}: ModifierModalProps) => {
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierOption[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { toast } = useToast();

  // Modifier groups arrive fully transformed via props (from the products payload);
  // no extra fetch is needed here
  const effectiveModifiers = modifiers ?? [];

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

  const modifierTotal = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);

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
      toast('warning', `Mohon pilih modifier wajib: ${missingRequired.map(g => g.name).join(', ')}`);
      return;
    }

    onConfirm(selectedModifiers);
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedModifiers([]);
    setHasChanges(false);
    setConfirmDiscard(false);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      setConfirmDiscard(true);
      return;
    }
    resetAndClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={productName}
        size="lg"
        footer={
          <div className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-ink-secondary">
                <p className="tnum">Harga dasar: {formatRupiah(basePrice)}</p>
                <p className="tnum">Modifier: {formatRupiah(modifierTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-ink-muted">Total</p>
                <p className="tnum text-2xl font-bold text-ink">{formatRupiah(basePrice + modifierTotal)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="lg" className="flex-1 text-danger hover:bg-danger-soft" onClick={handleCancel}>
                Batal
              </Button>
              <Button size="lg" className="flex-1" onClick={handleConfirm}>
                Konfirmasi
              </Button>
            </div>
          </div>
        }
      >
        {effectiveModifiers.length === 0 ? (
          <p className="py-8 text-center text-ink-muted">Tidak ada modifier tersedia</p>
        ) : (
          <div className="space-y-6">
            {effectiveModifiers.map(group => (
              <fieldset key={group.id} className="rounded-lg border border-line p-4">
                <div className="mb-3 flex items-center justify-between">
                  <legend className="float-left font-semibold text-ink">
                    {group.name}
                    {group.required && (
                      <span aria-label="wajib" className="ml-2 text-danger">
                        *
                      </span>
                    )}
                  </legend>
                  <span className="text-xs text-ink-muted">{group.multiSelect ? 'Pilih banyak' : 'Pilih satu'}</span>
                </div>

                <div className="space-y-2">
                  {group.options.map((option: ModifierOption) => {
                    const isSelected = selectedModifiers.some(m => m.id === option.id);
                    return (
                      <label
                        key={option.id}
                        className={`flex min-h-12 cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                          isSelected ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={group.multiSelect ? 'checkbox' : 'radio'}
                            name={`group-${group.id}`}
                            checked={isSelected}
                            onChange={() => toggleModifier(group, option)}
                            className="h-5 w-5 accent-[var(--primary)]"
                          />
                          <span className="font-medium text-ink">{option.name}</span>
                        </div>
                        <span className="tnum text-ink-secondary">
                          {option.price > 0 ? `+${formatRupiah(option.price)}` : 'Gratis'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmDiscard}
        title="Batalkan perubahan?"
        message="Modifier yang sudah dipilih akan dibuang."
        confirmLabel="Ya, batalkan"
        danger
        onConfirm={resetAndClose}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );
};

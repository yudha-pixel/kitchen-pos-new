'use client';

import { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Product } from '@/src/types/database.types';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah } from '@/src/lib/format';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (updatedProduct: Partial<Product>) => Promise<void>;
  userRole?: 'admin' | 'management' | 'cashier';
}

interface ModifierOption {
  id: string;
  name: string;
  price: number;
}

interface ModifierGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  options: ModifierOption[];
  isExpanded: boolean;
}

const inputClass =
  'min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none';

export const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  userRole = 'cashier'
}: EditProductModalProps) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price,
    image_url: product.image_url || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'single' | 'multiple'>('single');
  const { toast } = useToast();

  // Load existing modifier groups when modal opens
  useEffect(() => {
    if (isOpen && product.modifier_groups && product.modifier_groups.length > 0) {
      const loadedGroups: ModifierGroup[] = product.modifier_groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        type: (group.max_selections > 1 ? 'multiple' : 'single') as 'single' | 'multiple',
        options: group.modifiers.map((mod: any) => ({
          id: mod.id,
          name: mod.name,
          price: mod.price_extra || 0
        })),
        isExpanded: true
      }));
      setModifierGroups(loadedGroups);
    } else if (isOpen) {
      setModifierGroups([]);
    }
  }, [isOpen, product]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  const handleAddModifierGroup = () => {
    if (newGroupName) {
      setModifierGroups(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newGroupName,
          type: newGroupType,
          options: [],
          isExpanded: true
        }
      ]);
      setNewGroupName('');
      setNewGroupType('single');
    }
  };

  const handleRemoveModifierGroup = (groupId: string) => {
    setModifierGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const handleToggleGroupExpand = (groupId: string) => {
    setModifierGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, isExpanded: !group.isExpanded } : group
    ));
  };

  const handleAddOption = (groupId: string, optionName: string, optionPrice: number) => {
    if (optionName) {
      setModifierGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { 
              ...group, 
              options: [...group.options, { id: crypto.randomUUID(), name: optionName, price: optionPrice }]
            } 
          : group
      ));
    }
  };

  const handleRemoveOption = (groupId: string, optionId: string) => {
    setModifierGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, options: group.options.filter(opt => opt.id !== optionId) }
        : group
    ));
  };

  const handleUpdateGroupType = (groupId: string, type: 'single' | 'multiple') => {
    setModifierGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, type } : group
    ));
  };

  const handleUpdateGroupName = (groupId: string, name: string) => {
    setModifierGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, name } : group
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert UI modifier groups to database format
      const dbModifierGroups = modifierGroups.map(group => ({
        id: group.id,
        name: group.name,
        is_required: false, // Default to not required for now
        max_selections: group.type === 'multiple' ? 99 : 1,
        modifiers: group.options.map(option => ({
          id: option.id,
          modifier_group_id: group.id,
          name: option.name,
          price_extra: option.price
        }))
      }));

      await onSave({
        ...formData,
        price: Number(formData.price),
        modifier_groups: dbModifierGroups,
      });
      onClose();
    } catch (error) {
      toast('error', 'Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (userRole !== 'admin' && userRole !== 'management') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Akses Ditolak" size="sm">
        <p className="text-sm text-ink-secondary">Hanya admin dan management yang dapat mengedit produk.</p>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Produk — ${product.name}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button loading={isSaving} onClick={handleSave}>
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <label htmlFor="edit-name" className="mb-1.5 block text-sm font-medium text-ink">
            Nama Menu
          </label>
          <input
            id="edit-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="edit-desc" className="mb-1.5 block text-sm font-medium text-ink">
            Deskripsi
          </label>
          <textarea
            id="edit-desc"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`${inputClass} py-2`}
            placeholder="Deskripsi produk..."
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="edit-price" className="mb-1.5 block text-sm font-medium text-ink">
            Harga (Rp)
          </label>
          <input
            id="edit-price"
            type="number"
            inputMode="numeric"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            className={`${inputClass} tnum`}
          />
        </div>

        {/* Image Upload */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Foto Produk</span>
          <div className="space-y-3">
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt={`Pratinjau ${formData.name}`}
                className="h-32 w-32 rounded-lg object-cover"
              />
            )}
            <div className="flex items-center gap-3">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary-soft px-4 text-primary transition-colors hover:opacity-80">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">Upload Foto</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <input
                type="text"
                aria-label="URL gambar"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="Atau masukkan URL gambar"
                className={`${inputClass} flex-1 text-sm`}
              />
            </div>
          </div>
        </div>

        {/* Modifier Manager */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Modifier Manager</span>
          <div className="space-y-4">
            {/* Add New Modifier Group */}
            <div className="rounded-lg border border-line-strong bg-surface p-4">
              <div className="mb-3 space-y-3">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Nama Grup Modifier (contoh: Tingkat Kematangan, Topping)"
                  className={inputClass}
                />
                <div className="flex gap-2">
                  <select
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value as 'single' | 'multiple')}
                    className={`${inputClass} flex-1`}
                  >
                    <option value="single">Single Choice (Radio)</option>
                    <option value="multiple">Multiple Choice (Checkbox)</option>
                  </select>
                  <Button variant="success" onClick={handleAddModifierGroup}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Grup
                  </Button>
                </div>
              </div>
            </div>

            {/* List of Modifier Groups */}
            {modifierGroups.length > 0 ? (
              <div className="space-y-3">
                {modifierGroups.map((group) => (
                  <div key={group.id} className="rounded-lg border border-line-strong bg-surface">
                    {/* Group Header */}
                    <div className="flex items-center justify-between border-b border-line-strong p-3">
                      <div className="flex flex-1 items-center gap-3">
                        <button
                          onClick={() => handleToggleGroupExpand(group.id)}
                          className="text-ink-muted transition-colors hover:text-ink"
                        >
                          {group.isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={group.name}
                          onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                          className="flex-1 bg-transparent text-sm font-medium text-ink focus:outline-none"
                        />
                        <select
                          value={group.type}
                          onChange={(e) => handleUpdateGroupType(group.id, e.target.value as 'single' | 'multiple')}
                          className="rounded border border-line-strong bg-surface-alt px-2 py-1 text-xs text-ink focus:outline-none"
                        >
                          <option value="single">Single</option>
                          <option value="multiple">Multiple</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleRemoveModifierGroup(group.id)}
                        className="ml-3 flex min-h-8 min-w-8 items-center justify-center rounded text-danger transition-colors hover:bg-danger-soft"
                        aria-label="Hapus grup"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Group Options */}
                    {group.isExpanded && (
                      <div className="p-3 space-y-3">
                        {/* Add Option */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Nama Opsi (contoh: Medium, Keju)"
                            className={`${inputClass} flex-1 text-sm`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const priceInput = input.nextElementSibling as HTMLInputElement;
                                handleAddOption(group.id, input.value, Number(priceInput?.value || 0));
                                input.value = '';
                                if (priceInput) priceInput.value = '0';
                              }
                            }}
                          />
                          <input
                            type="number"
                            inputMode="numeric"
                            placeholder="Harga"
                            className={`${inputClass} tnum w-24 text-sm`}
                            defaultValue={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                const nameInput = input.previousElementSibling as HTMLInputElement;
                                handleAddOption(group.id, nameInput?.value || '', Number(input.value));
                                if (nameInput) nameInput.value = '';
                                input.value = '0';
                              }
                            }}
                          />
                          <Button
                            variant="success"
                            size="icon"
                            onClick={(e) => {
                              const inputs = e.currentTarget.parentElement?.querySelectorAll('input');
                              if (inputs && inputs[0] && inputs[1]) {
                                handleAddOption(group.id, inputs[0].value, Number(inputs[1].value));
                                inputs[0].value = '';
                                inputs[1].value = '0';
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Options List */}
                        {group.options.length > 0 ? (
                          <div className="space-y-2">
                            {group.options.map((option) => (
                              <div
                                key={option.id}
                                className="flex items-center justify-between rounded-lg bg-surface-alt p-2"
                              >
                                <div className="flex flex-1 items-center gap-2">
                                  <span className="text-sm text-ink">{option.name}</span>
                                  {option.price > 0 && (
                                    <span className="tnum text-xs text-ink-muted">
                                      (+{formatRupiah(option.price)})
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveOption(group.id, option.id)}
                                  className="flex min-h-8 min-w-8 items-center justify-center rounded text-danger transition-colors hover:bg-danger-soft"
                                  aria-label={`Hapus opsi ${option.name}`}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-ink-muted">Belum ada opsi ditambahkan</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Belum ada grup modifier ditambahkan</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

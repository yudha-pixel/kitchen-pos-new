'use client';

import { useState } from 'react';
import { Upload, Plus, Trash2 } from 'lucide-react';
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
  userRole?: 'admin' | 'cashier';
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
  const [newModifier, setNewModifier] = useState({ name: '', price: 0 });
  const [modifiers, setModifiers] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload to a storage service
      // For now, we'll use a placeholder URL
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  const handleAddModifier = () => {
    if (newModifier.name) {
      setModifiers(prev => [
        ...prev,
        { id: crypto.randomUUID(), name: newModifier.name, price: newModifier.price }
      ]);
      setNewModifier({ name: '', price: 0 });
    }
  };

  const handleRemoveModifier = (id: string) => {
    setModifiers(prev => prev.filter(mod => mod.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        price: Number(formData.price),
      });
      onClose();
    } catch (error) {
      toast('error', 'Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (userRole !== 'admin') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Akses Ditolak" size="sm">
        <p className="text-sm text-ink-secondary">Hanya admin yang dapat mengedit produk.</p>
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
            Nama Produk
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
          <div className="space-y-3">
            {/* Add New Modifier */}
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="Nama modifier"
                value={newModifier.name}
                onChange={(e) => setNewModifier(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama modifier"
                className={`${inputClass} flex-1`}
              />
              <input
                type="number"
                inputMode="numeric"
                aria-label="Harga tambahan"
                value={newModifier.price}
                onChange={(e) => setNewModifier(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="Harga tambahan"
                className={`${inputClass} tnum w-32`}
              />
              <Button variant="success" size="icon" aria-label="Tambah modifier" onClick={handleAddModifier}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List of Modifiers */}
            {modifiers.length > 0 ? (
              <div className="space-y-2">
                {modifiers.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between rounded-lg bg-surface-alt p-3">
                    <div>
                      <span className="font-medium text-ink">{mod.name}</span>
                      {mod.price > 0 && (
                        <span className="tnum ml-2 text-sm text-ink-secondary">(+{formatRupiah(mod.price)})</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveModifier(mod.id)}
                      aria-label={`Hapus modifier ${mod.name}`}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger-soft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Belum ada modifier ditambahkan</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

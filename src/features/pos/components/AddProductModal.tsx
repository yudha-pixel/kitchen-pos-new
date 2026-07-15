'use client';

import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import * as api from '@/src/lib/api';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  userRole?: 'admin' | 'cashier';
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

const inputClass =
  'min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock_quantity: '0',
  image_url: '',
  category_id: '',
};

export const AddProductModal = ({
  isOpen,
  onClose,
  onProductAdded,
  userRole = 'cashier'
}: AddProductModalProps) => {
  const [formData, setFormData] = useState(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetchCategories();
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Gagal memuat kategori');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nama produk harus diisi');
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError('Harga harus lebih dari 0');
      return false;
    }
    if (!formData.category_id) {
      setError('Kategori harus dipilih');
      return false;
    }
    if (Number(formData.stock_quantity) < 0) {
      setError('Stok tidak boleh negatif');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setError('');
    try {
      await api.addProduct({
        name: formData.name,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        image_url: formData.image_url || undefined,
        category_id: formData.category_id,
      });
      toast('success', 'Produk berhasil ditambahkan');
      onProductAdded();
      onClose();
      setFormData(emptyForm);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menambahkan produk');
    } finally {
      setIsSaving(false);
    }
  };

  if (userRole !== 'admin') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Akses Ditolak" size="sm">
        <p className="text-sm text-ink-secondary">Hanya admin yang dapat menambahkan produk.</p>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Produk Baru"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button loading={isSaving} disabled={isLoading} onClick={handleSave}>
            Tambah Produk
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {error && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Product Name */}
        <div>
          <label htmlFor="add-name" className="mb-1.5 block text-sm font-medium text-ink">
            Nama Produk <span aria-hidden="true" className="text-danger">*</span>
          </label>
          <input
            id="add-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={inputClass}
            placeholder="Contoh: Nasi Goreng Spesial"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="add-desc" className="mb-1.5 block text-sm font-medium text-ink">
            Deskripsi
          </label>
          <textarea
            id="add-desc"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`${inputClass} py-2`}
            placeholder="Deskripsi produk..."
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="add-price" className="mb-1.5 block text-sm font-medium text-ink">
            Harga (Rp) <span aria-hidden="true" className="text-danger">*</span>
          </label>
          <input
            id="add-price"
            type="number"
            inputMode="numeric"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            className={`${inputClass} tnum`}
            placeholder="0"
            min="0"
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <label htmlFor="add-stock" className="mb-1.5 block text-sm font-medium text-ink">
            Stok
          </label>
          <input
            id="add-stock"
            type="number"
            inputMode="numeric"
            value={formData.stock_quantity}
            onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
            className={`${inputClass} tnum`}
            placeholder="0"
            min="0"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="add-category" className="mb-1.5 block text-sm font-medium text-ink">
            Kategori <span aria-hidden="true" className="text-danger">*</span>
          </label>
          {isLoading ? (
            <div className="text-sm text-ink-muted">Memuat kategori...</div>
          ) : (
            <select
              id="add-category"
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className={inputClass}
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink">Foto Produk</span>
          <div className="space-y-3">
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Pratinjau produk"
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
      </div>
    </Modal>
  );
};

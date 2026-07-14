'use client';

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import * as api from '@/src/lib/api';

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

export const AddProductModal = ({
  isOpen,
  onClose,
  onProductAdded,
  userRole = 'cashier'
}: AddProductModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '0',
    image_url: '',
    category_id: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
      alert('Produk berhasil ditambahkan');
      onProductAdded();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '0',
        image_url: '',
        category_id: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menambahkan produk');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (userRole !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <p className="text-lg font-bold text-black mb-2">Akses Ditolak</p>
            <p className="text-black">Hanya admin yang dapat menambahkan produk.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-black">Tambah Produk Baru</h2>
            <p className="text-black mt-1">Isi detail produk di bawah ini</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Nama Produk *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Nasi Goreng Spesial"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deskripsi produk..."
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Harga (Rp) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Stok
            </label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Kategori *
            </label>
            {isLoading ? (
              <div className="text-gray-500 text-sm">Memuat kategori...</div>
            ) : (
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-bold text-black mb-2">
              Foto Produk
            </label>
            <div className="space-y-3">
              {formData.image_url && (
                <div className="relative w-32 h-32">
                  <img
                    src={formData.image_url}
                    alt="Product preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Upload Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => handleInputChange('image_url', e.target.value)}
                  placeholder="Atau masukkan URL gambar"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Menyimpan...' : 'Tambah Produk'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

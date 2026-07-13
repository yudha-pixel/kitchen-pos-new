'use client';

import { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { Product } from '@/src/types/database.types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (updatedProduct: Partial<Product>) => Promise<void>;
  userRole?: 'admin' | 'cashier';
}

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
      alert('Gagal menyimpan perubahan');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Check if user is admin
  if (userRole !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <p className="text-lg font-bold text-black mb-2">Akses Ditolak</p>
            <p className="text-black">Hanya admin yang dapat mengedit produk.</p>
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
            <h2 className="text-2xl font-bold text-black">Edit Produk</h2>
            <p className="text-black mt-1">{product.name}</p>
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
          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Nama Produk
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              Harga (Rp)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

          {/* Modifier Manager */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Modifier Manager
            </label>
            <div className="space-y-3">
              {/* Add New Modifier */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newModifier.name}
                  onChange={(e) => setNewModifier(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nama modifier"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={newModifier.price}
                  onChange={(e) => setNewModifier(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="Harga tambahan"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddModifier}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* List of Modifiers */}
              {modifiers.length > 0 && (
                <div className="space-y-2">
                  {modifiers.map((mod) => (
                    <div
                      key={mod.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-black">{mod.name}</span>
                        {mod.price > 0 && (
                          <span className="text-sm text-black ml-2">
                            (+Rp {mod.price.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveModifier(mod.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {modifiers.length === 0 && (
                <p className="text-sm text-black">Belum ada modifier ditambahkan</p>
              )}
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
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

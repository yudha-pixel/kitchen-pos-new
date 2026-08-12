'use client';

import { useState, useEffect } from 'react';
import { Upload, Plus, X, Calculator } from 'lucide-react';
import * as api from '@/src/lib/api';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
  userRole?: 'admin' | 'management' | 'cashier' | 'owner';
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  unit_price: number;
  current_stock: number;
}

interface RecipeItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity_required: number;
  unit: string;
  unit_price: number;
  total_cost: number;
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
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // Recipe form state
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [recipeQuantity, setRecipeQuantity] = useState('');

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

  const fetchIngredients = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchIngredients();
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

  // Calculate HPP (COGS) from recipe items
  const calculateHPP = () => {
    return recipeItems.reduce((sum, item) => sum + item.total_cost, 0);
  };

  // Add recipe item
  const handleAddRecipeItem = () => {
    if (!selectedIngredient || !recipeQuantity) {
      setError('Pilih ingredient dan quantity');
      return;
    }

    const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
    if (!ingredient) return;

    const quantity = parseFloat(recipeQuantity);
    const totalCost = ingredient.unit_price * quantity;

    const newItem: RecipeItem = {
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity_required: quantity,
      unit: ingredient.unit,
      unit_price: ingredient.unit_price,
      total_cost: totalCost
    };

    setRecipeItems([...recipeItems, newItem]);
    setSelectedIngredient('');
    setRecipeQuantity('');
  };

  // Remove recipe item
  const handleRemoveRecipeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
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
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      const payload = {
        name: formData.name,
        price: Number(formData.price),
        stock_quantity: Number(formData.stock_quantity),
        image_url: formData.image_url || undefined,
        category_id: formData.category_id,
        description: formData.description || undefined,
        recipes: recipeItems.length > 0 ? recipeItems.map(item => ({
          ingredient_id: item.ingredient_id,
          quantity_required: item.quantity_required,
          unit: item.unit
        })) : undefined
      };

      const response = await fetch(`${API_BASE_URL}/api/products/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast('success', 'Produk berhasil ditambahkan');
        onProductAdded();
        onClose();
        setFormData(emptyForm);
        setRecipeItems([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Gagal menambahkan produk');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal menambahkan produk');
    } finally {
      setIsSaving(false);
    }
  };

  if (userRole !== 'admin' && userRole !== 'management') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Akses Ditolak" size="sm">
        <p className="text-sm text-ink-secondary">Hanya admin dan management yang dapat menambahkan produk.</p>
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

        {/* Recipe Linker Section */}
        <div className="border-t border-line pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-medium text-ink">Resep & Perhitungan HPP</h3>
          </div>

          {/* Add Recipe Item Form */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Bahan Baku</label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className={`${inputClass} text-sm`}
                >
                  <option value="">-- Pilih Bahan --</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-secondary">Jumlah</label>
                <input
                  type="number"
                  value={recipeQuantity}
                  onChange={(e) => setRecipeQuantity(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`${inputClass} text-sm`}
                />
              </div>
            </div>
            <Button
              onClick={handleAddRecipeItem}
              disabled={!selectedIngredient || !recipeQuantity}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah ke Resep
            </Button>
          </div>

          {/* Recipe Items List */}
          {recipeItems.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-line overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-ink-secondary">Bahan</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-ink-secondary">Jumlah</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-ink-secondary">Biaya</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {recipeItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-ink">{item.ingredient_name}</td>
                        <td className="px-3 py-2 text-ink-secondary">
                          {item.quantity_required} {item.unit}
                        </td>
                        <td className="px-3 py-2 text-right text-ink">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(item.total_cost)}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => handleRemoveRecipeItem(index)}
                            className="p-1 text-danger hover:bg-danger-soft rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* HPP Summary */}
              <div className="bg-primary-soft rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-primary">Total HPP (COGS):</span>
                  <span className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(calculateHPP())}
                  </span>
                </div>
                {formData.price && (
                  <div className="flex justify-between items-center mt-2 text-xs text-ink-secondary">
                    <span>Margin:</span>
                    <span>
                      {((Number(formData.price) - calculateHPP()) / Number(formData.price) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

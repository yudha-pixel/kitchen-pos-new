'use client';

import { useState, useEffect } from 'react';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { Package, ArrowLeft, Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  [key: string]: any;
}

export default function StockRequestPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requesterName, setRequesterName] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [requestType, setRequestType] = useState<'Stock In' | 'Stock Out'>('Stock In');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  
  // Image upload state
  const [evidenceImage, setEvidenceImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Fetch ingredients from API
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoadingIngredients(true);
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
        toast('error', 'Gagal memuat daftar bahan baku');
      } finally {
        setLoadingIngredients(false);
      }
    };

    fetchIngredients();
  }, [toast]);

  // Auto-set requester name from user if available
  useEffect(() => {
    if (user?.username) {
      setRequesterName(user.username);
    }
  }, [user]);

  // Handle item selection
  const handleItemChange = (value: string) => {
    setSelectedItem(value);
    const ingredient = ingredients.find(ing => ing.id === value);
    setSelectedIngredient(ingredient || null);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
      setImageError('Hanya file JPEG/PNG yang diperbolehkan');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Ukuran file maksimal 5MB');
      return;
    }

    setImageError(null);

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEvidenceImage(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Handle image removal
  const handleImageRemove = () => {
    setEvidenceImage(null);
    setImagePreview(null);
    setImageError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!requesterName.trim()) {
      toast('error', 'Nama requester wajib diisi');
      return;
    }
    
    if (!selectedItem) {
      toast('error', 'Pilih item terlebih dahulu');
      return;
    }
    
    if (!quantity || parseFloat(quantity) <= 0) {
      toast('error', 'Quantity harus lebih dari 0');
      return;
    }
    
    if (!notes.trim()) {
      toast('error', 'Alasan/Notes wajib diisi');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/stock-approval-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: requestType,
          requester_name: requesterName,
          item_name: selectedIngredient?.name,
          quantity: parseFloat(quantity),
          unit: selectedIngredient?.unit,
          evidence_image: evidenceImage
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit request');
      }
      
      // Success
      toast('success', 'Permintaan stok berhasil dikirim');
      
      // Clear form
      setRequesterName(user?.username || '');
      setSelectedItem('');
      setSelectedIngredient(null);
      setQuantity('');
      setNotes('');
      setRequestType('Stock In');
      setEvidenceImage(null);
      setImagePreview(null);
      setImageError(null);
      
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast('error', 'Gagal mengirim permintaan stok');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveShell title="Kitchen/Warehouse Request">
      <div className="min-h-full bg-slate-50 -m-4 sm:-m-6">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <a
                href="/kasir"
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Kitchen/Warehouse Request</h1>
                <p className="text-sm text-slate-500">Formulir permintaan stok untuk dapur/gudang</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Requester Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Requester
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Contoh: Chef Juna, Siti Gudang"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Item Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pilih Item
                </label>
                {loadingIngredients ? (
                  <div className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-500">
                    Memuat daftar bahan baku...
                  </div>
                ) : (
                  <select
                    value={selectedItem}
                    onChange={(e) => handleItemChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Pilih Bahan Baku --</option>
                    {ingredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} ({ingredient.unit})
                      </option>
                    ))}
                  </select>
                )}
                {/* Current Stock Helper */}
                {selectedIngredient && (
                  <p className="mt-2 text-sm text-slate-600">
                    Stok saat ini: {new Intl.NumberFormat('id-ID').format(selectedIngredient.current_stock)} {selectedIngredient.unit}
                  </p>
                )}
              </div>

              {/* Type Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipe Request
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRequestType('Stock In')}
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      requestType === 'Stock In'
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Stock In
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType('Stock Out')}
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      requestType === 'Stock Out'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Stock Out
                  </button>
                </div>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                  <div className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-600 min-w-[80px] text-center">
                    {selectedIngredient?.unit || selectedIngredient?.package_unit || '-'}
                  </div>
                </div>
              </div>

              {/* Notes/Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Alasan / Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Kulkas mati, daging rusak"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bukti Foto (Opsional)
                </label>
                <div className="space-y-3">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-violet-500 transition-colors">
                      <input
                        type="file"
                        id="evidence-image"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="evidence-image"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Paperclip className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          Klik untuk upload atau drag & drop
                        </span>
                        <span className="text-xs text-slate-400">
                          JPEG/PNG, maksimal 5MB
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Evidence preview"
                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {imageError && (
                    <p className="text-sm text-red-600">{imageError}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Mengirim...' : 'Kirim Request'}
                </Button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Informasi</p>
                <p>
                  Permintaan stok akan dikirim ke manager untuk approval. 
                  Status request dapat dipantau di menu Inventory &gt; Approval Stok.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveShell>
  );
}

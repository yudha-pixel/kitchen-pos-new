'use client';

import { useState } from 'react';
import { X, Search, Package, AlertCircle, CheckCircle, Edit2, Save, X as XIcon } from 'lucide-react';
import { formatRupiah } from '@/src/lib/format';

interface Product {
  id: string;
  name: string;
  price: number;
  category_id?: string | null;
  category?: {
    id: string;
    name: string;
    color?: string | null;
  };
  stock_quantity?: number;
  is_active?: boolean;
}

interface ProductListModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  productStocks: Map<string, number | null>;
  onStockUpdate?: () => void;
  userRole?: 'admin' | 'management' | 'cashier' | 'owner';
  categories?: Array<{ id: string; name: string }>;
}

export const ProductListModal = ({ 
  isOpen, 
  onClose, 
  products, 
  productStocks,
  onStockUpdate,
  userRole,
  categories = []
}: ProductListModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [editingStock, setEditingStock] = useState<{ productId: string; value: string } | null>(null);

  if (!isOpen) return null;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || 
      categories.find(c => c.name === selectedCategory)?.id === product.category_id;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (productId: string) => {
    const stock = productStocks.get(productId);
    if (stock === null || stock === undefined) return { status: 'unlimited', label: 'Tersedia', color: 'text-green-600', bg: 'bg-green-100' };
    if (stock === 0) return { status: 'out', label: 'Habis', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= 10) return { status: 'low', label: `Stok: ${stock}`, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'ok', label: `Stok: ${stock}`, color: 'text-green-600', bg: 'bg-green-100' };
  };

  const canEditStock = userRole === 'admin' || userRole === 'management';

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const { updateProductStock } = await import('@/src/lib/api');
      await updateProductStock(productId, newStock);
      if (onStockUpdate) {
        onStockUpdate();
      }
      setEditingStock(null);
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('Gagal mengupdate stok. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[80vh] flex flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Daftar Produk</h2>
              <p className="text-sm text-gray-500">Total: {filteredProducts.length} produk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex-shrink-0 border-b border-gray-200 p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('Semua')}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === 'Semua'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle className="h-12 w-12 mb-3" />
              <p>Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => {
                const stockInfo = getStockStatus(product.id);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        {!product.is_active && (
                          <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                            Non-aktif
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                        {product.category && (
                          <span className="rounded bg-gray-100 px-2 py-0.5">
                            {product.category.name}
                          </span>
                        )}
                        <span>{formatRupiah(product.price)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {editingStock?.productId === product.id && canEditStock ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editingStock.value}
                            onChange={(e) => setEditingStock({ productId: product.id, value: e.target.value })}
                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              const newStock = parseInt(editingStock.value, 10);
                              if (!isNaN(newStock) && newStock >= 0) {
                                handleStockUpdate(product.id, newStock);
                              }
                            }}
                            className="rounded bg-green-600 p-1 text-white hover:bg-green-700"
                            title="Simpan"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingStock(null)}
                            className="rounded bg-gray-400 p-1 text-white hover:bg-gray-500"
                            title="Batal"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${stockInfo.bg} ${stockInfo.color}`}
                          >
                            {stockInfo.status === 'unlimited' && <CheckCircle className="h-3 w-3" />}
                            {stockInfo.status === 'out' && <AlertCircle className="h-3 w-3" />}
                            {stockInfo.label}
                          </span>
                          {canEditStock && (
                            <button
                              onClick={() => {
                                const currentStock = productStocks.get(product.id);
                                setEditingStock({
                                  productId: product.id,
                                  value: currentStock !== null && currentStock !== undefined ? currentStock.toString() : '0'
                                });
                              }}
                              className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              title="Edit stok"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Tersedia</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Stok Rendah</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Habis</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

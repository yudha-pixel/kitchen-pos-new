'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { calculateMenuStocks } from '@/src/features/inventory/inventoryService';
import { EditProductModal } from '@/src/features/pos/components/EditProductModal';
import { Search, Filter, Edit, Plus, AlertCircle, Package } from 'lucide-react';
import { formatRupiah } from '@/src/lib/format';
import { Product } from '@/src/types/database.types';
import { useToast } from '@/src/components/ui/Toast';

export default function ProductManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { products, loading, refetch } = useProducts();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [productStocks, setProductStocks] = useState<Map<string, number | null>>(new Map());
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load stocks when products change
  useEffect(() => {
    if (products && products.length > 0) {
      const productIds = products.map(p => p.id);
      calculateMenuStocks(productIds).then(stockMap => {
        setProductStocks(stockMap);
      }).catch(error => {
        console.error('Failed to calculate product stocks:', error);
      });
    }
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Stock status function (same as POS)
  const getStockStatus = (productId: string) => {
    const stock = productStocks.get(productId);
    if (stock === null || stock === undefined) return { status: 'unlimited', label: 'Tersedia', color: 'text-green-600', bg: 'bg-green-100' };
    if (stock === 0) return { status: 'out', label: 'Habis', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= 10) return { status: 'low', label: `Stok: ${stock}`, color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'ok', label: `Stok: ${stock}`, color: 'text-green-600', bg: 'bg-green-100' };
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    router.push('/inventory/mapping');
  };

  const handleProductUpdated = async (updatedProduct: Partial<Product>) => {
    try {
      const { updateProduct } = await import('@/src/lib/api');
      await updateProduct(editingProduct!.id!, updatedProduct);
      toast('success', 'Produk berhasil diperbarui');
      refetch();
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
      toast('error', 'Gagal memperbarui produk');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="text-center text-gray-500">
              <p>Memuat data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
              <p className="text-sm text-gray-500">Kelola daftar produk dan informasi stok</p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 hover:text-white transition-colors"
            >
              <Plus className="h-5 w-5" />
              Tambah Produk Baru
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => {
                  const stockInfo = getStockStatus(product.id);
                  const category = categories.find(c => c.id === product.category_id);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatRupiah(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockInfo.bg} ${stockInfo.color}`}>
                          {stockInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stockInfo.status === 'low' && (
                          <div className="flex items-center text-yellow-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Low Stock</span>
                          </div>
                        )}
                        {stockInfo.status === 'out' && (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">Habis</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada produk ditemukan</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSave={handleProductUpdated}
          userRole="admin"
        />
      )}
    </div>
  );
}

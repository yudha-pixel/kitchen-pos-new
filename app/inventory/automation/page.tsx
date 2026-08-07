'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { getIngredientsWithStatus, updateIngredientMinStock, getIngredientsBelowMinStock, createStockRequest, getSuppliers } from '@/src/features/inventory/inventoryService';
import { AlertTriangle, Package, CheckCircle, Edit, Play, ShoppingCart, Settings, X, DollarSign } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';

export default function AutomationPage() {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [newMinStock, setNewMinStock] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [autoRestockItems, setAutoRestockItems] = useState<any[]>([]);
  const [isRunningAutoRestock, setIsRunningAutoRestock] = useState(false);
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  
  const [poReviewModalOpen, setPoReviewModalOpen] = useState(false);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [supplierAllocations, setSupplierAllocations] = useState<Map<string, string>>(new Map());
  const [isSavingPO, setIsSavingPO] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    loadIngredients();
    loadSuppliers();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await getIngredientsWithStatus();
      setIngredients(data);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const handleEditMinStock = (ingredient: any) => {
    setSelectedIngredient(ingredient);
    setNewMinStock(ingredient.min_stock);
    setEditModalOpen(true);
  };

  const handleUpdateMinStock = async () => {
    if (!selectedIngredient) return;
    
    setIsUpdating(true);
    try {
      const result = await updateIngredientMinStock(selectedIngredient.id, newMinStock);
      if (result.success) {
        alert('Batas minimum stok berhasil diperbarui');
        setEditModalOpen(false);
        await loadIngredients();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to update min stock:', error);
      alert('Gagal memperbarui batas minimum stok');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRunAutoRestock = async () => {
    setIsRunningAutoRestock(true);
    try {
      const items = await getIngredientsBelowMinStock();
      setAutoRestockItems(items);
      
      if (items.length === 0) {
        alert('Tidak ada bahan baku yang di bawah batas minimum stok');
      } else {
        alert(`Ditemukan ${items.length} bahan baku yang perlu restock`);
      }
    } catch (error) {
      console.error('Failed to run auto-restock:', error);
      alert('Gagal menjalankan auto-restock');
    } finally {
      setIsRunningAutoRestock(false);
    }
  };

  const handleCreatePO = async () => {
    if (autoRestockItems.length === 0) {
      alert('Tidak ada item untuk dibuat PO');
      return;
    }
    
    // Buka modal review alih-alih langsung membuat PO
    setPoItems(autoRestockItems);
    setPoReviewModalOpen(true);
  };

  const handleCreateSinglePO = (ingredient: any) => {
    const shortage = ingredient.min_stock - ingredient.current_stock;
    const poItem = {
      ...ingredient,
      shortage,
    };
    
    setPoItems([poItem]);
    
    // Pre-allocate supplier if available
    if (ingredient.supplier_id) {
      setSupplierAllocations(new Map([[ingredient.id, ingredient.supplier_id]]));
    } else {
      setSupplierAllocations(new Map());
    }
    
    setPoReviewModalOpen(true);
  };

  const handleSupplierChange = (ingredientId: string, supplierId: string) => {
    setSupplierAllocations(prev => {
      const newMap = new Map(prev);
      newMap.set(ingredientId, supplierId);
      return newMap;
    });
  };

  const calculateEstimatedCost = () => {
    return poItems.reduce((total, item) => {
      const price = item.unit_price || 0;
      const quantity = item.shortage;
      return total + (price * quantity);
    }, 0);
  };

  const handleSavePO = async () => {
    setIsSavingPO(true);
    try {
      let successCount = 0;
      
      for (const item of poItems) {
        const supplierId = supplierAllocations.get(item.id) || '';
        const supplier = suppliers.find((s: any) => s.id === supplierId);
        const supplierName = supplier?.name || '';
        
        const result = await createStockRequest({
          ingredient_id: item.id,
          ingredient_name: item.name,
          quantity_requested: item.shortage,
          unit: item.unit,
          notes: `Auto-restock: Stok saat ini ${item.current_stock} ${item.unit}, batas minimum ${item.min_stock} ${item.unit}`,
          supplier_name: supplierName,
          requested_by: 'system',
          requested_by_name: 'System Automation',
        });
        
        if (result) {
          successCount++;
        }
      }
      
      alert(`Berhasil membuat ${successCount} dari ${poItems.length} stock request`);
      setPoReviewModalOpen(false);
      setAutoRestockItems([]);
      setSupplierAllocations(new Map());
    } catch (error) {
      console.error('Failed to save PO:', error);
      alert('Gagal menyimpan Purchase Order');
    } finally {
      setIsSavingPO(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Kritis
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Perlu Restock
          </span>
        );
      case 'ok':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aman
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Otomatisasi Pengadaan</h1>
              <p className="text-gray-600 mt-1">Kelola aturan minimum stok dan otomatisasi pengadaan bahan baku</p>
            </div>

            {/* Minimum Stock Rules Section */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Aturan Minimum Stok
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Atur batas minimum stok untuk setiap bahan baku. Sistem akan memberi peringatan ketika stok di bawah batas ini.
                </p>
              </div>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Memuat data...</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Bahan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stok Saat Ini
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batas Minimum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier Utama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ingredients.map((ingredient) => (
                        <tr key={ingredient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Package className="h-5 w-5 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ingredient.current_stock} {ingredient.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ingredient.min_stock} {ingredient.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(ingredient.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ingredient.supplier_name || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {ingredient.status !== 'ok' && (
                                <button
                                  onClick={() => handleCreateSinglePO(ingredient)}
                                  className="text-green-600 hover:text-green-900 text-sm font-medium flex items-center"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Buat PO
                                </button>
                              )}
                              {user && (user.role === 'admin' || user.role === 'management') && (
                                <button
                                  onClick={() => handleEditMinStock(ingredient)}
                                  className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Auto-Restock Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Otomatisasi Pemesanan (Auto-Restock)
                  </h2>
                  <button
                    onClick={handleRunAutoRestock}
                    disabled={isRunningAutoRestock}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunningAutoRestock ? 'Memproses...' : 'Jalankan Auto-Restock'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Deteksi bahan baku di bawah batas minimum dan buat Purchase Order secara otomatis.
                </p>
              </div>
              
              {autoRestockItems.length > 0 && (
                <div className="p-6 border-b bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Ditemukan {autoRestockItems.length} bahan baku yang perlu restock
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Tinjau daftar di bawah dan buat Purchase Order
                      </p>
                    </div>
                    <button
                      onClick={handleCreatePO}
                      disabled={isCreatingPO}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isCreatingPO ? 'Membuat PO...' : 'Buat Purchase Order'}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                {autoRestockItems.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Belum ada hasil auto-restock. Klik "Jalankan Auto-Restock" untuk memulai.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Bahan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stok Saat Ini
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batas Minimum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kekurangan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Satuan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Harga Satuan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estimasi Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pengaju
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {autoRestockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Package className="h-5 w-5 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.current_stock}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.min_stock}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-red-600">
                              {item.shortage}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.unit}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Rp {(item.unit_price || 0).toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              Rp {((item.shortage || 0) * (item.unit_price || 0)).toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              -
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              System Automation
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Min Stock Modal */}
      {editModalOpen && selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Edit Batas Minimum Stok
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bahan Baku</label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedIngredient.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Saat Ini</label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedIngredient.current_stock} {selectedIngredient.unit}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Minimum Baru *</label>
                <input
                  type="number"
                  value={newMinStock}
                  onChange={(e) => setNewMinStock(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan batas minimum baru"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Satuan: {selectedIngredient.unit}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateMinStock}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PO Review Modal */}
      {poReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                Review Draft Purchase Order
              </h2>
              <button onClick={() => setPoReviewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Total Item</p>
                    <p className="text-2xl font-bold text-blue-900">{poItems.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Estimasi Biaya</p>
                    <p className="text-2xl font-bold text-blue-900">
                      Rp {calculateEstimatedCost().toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Status</p>
                    <p className="text-2xl font-bold text-blue-900">Draft</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Pengaju</p>
                    <p className="text-2xl font-bold text-blue-900">System Automation</p>
                  </div>
                </div>
              </div>

              {/* PO Items Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Bahan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kekurangan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Satuan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimasi Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {poItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.shortage}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          Rp {(item.unit_price || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          Rp {((item.unit_price || 0) * item.shortage).toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={supplierAllocations.get(item.id) || ''}
                            onChange={(e) => handleSupplierChange(item.id, e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Pilih Supplier</option>
                            {suppliers.map((supplier: any) => (
                              <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setPoReviewModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSavePO}
                  disabled={isSavingPO}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSavingPO ? 'Menyimpan...' : 'Kirim/Simpan PO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

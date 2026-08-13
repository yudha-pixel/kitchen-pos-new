'use client';

import { useState, useEffect } from 'react';
import { Settings, Package, Save, AlertCircle, Search, CheckSquare2, Square, X } from 'lucide-react';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

interface Ingredient {
  id: string;
  name: string;
  category?: { id: string; name: string; color: string | null } | null;
  current_stock: number;
  min_stock: number;
  restock_quantity: number;
  unit: string;
  supplier_id: string | null;
  ad_hoc_supplier?: string | null;
  ad_hoc_price?: number | null;
  use_petty_cash?: boolean;
  supplier?: {
    id: string;
    name: string;
  };
}

interface Supplier {
  id: string;
  name: string;
}

export default function AutomationPage() {
  const [autoRestockEnabled, setAutoRestockEnabled] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Bulk action states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSupplierId, setBulkSupplierId] = useState('');
  const [bulkRestockQuantity, setBulkRestockQuantity] = useState('');
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = getToken();

      // Fetch ingredients with suppliers
      const ingredientsResponse = await fetch(`${API_BASE_URL}/api/ingredients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch suppliers
      const suppliersResponse = await fetch(`${API_BASE_URL}/api/suppliers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch app settings for auto_restock_enabled
      const settingsResponse = await fetch(`${API_BASE_URL}/api/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (ingredientsResponse.ok) {
        const ingredientsData = await ingredientsResponse.json();
        setIngredients(ingredientsData);
      }

      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData);
      }

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.length > 0) {
          setAutoRestockEnabled(settingsData[0].auto_restock_enabled || false);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: any) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === id) {
        // If switching to ad-hoc supplier, clear regular supplier_id
        if (field === 'supplier_id' && value === 'ad-hoc') {
          return { ...ing, supplier_id: null, ad_hoc_supplier: '', ad_hoc_price: null, use_petty_cash: false };
        }
        // If switching to regular supplier, clear ad-hoc fields
        if (field === 'supplier_id' && value !== 'ad-hoc') {
          return { ...ing, supplier_id: value, ad_hoc_supplier: null, ad_hoc_price: null, use_petty_cash: false };
        }
        return { ...ing, [field]: value };
      }
      return ing;
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const token = getToken();

      // Update app settings
      const settingsResponse = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ auto_restock_enabled: autoRestockEnabled }),
      });

      // Update each ingredient and create petty cash expenses if needed
      for (const ingredient of ingredients) {
        await fetch(`${API_BASE_URL}/api/ingredients/${ingredient.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            min_stock: ingredient.min_stock,
            restock_quantity: ingredient.restock_quantity,
            supplier_id: ingredient.supplier_id,
            ad_hoc_supplier: ingredient.ad_hoc_supplier,
            ad_hoc_price: ingredient.ad_hoc_price,
          }),
        });

        // Create petty cash expense if ad-hoc purchase with petty cash is enabled
        if (ingredient.use_petty_cash && ingredient.ad_hoc_supplier && ingredient.ad_hoc_price) {
          await fetch(`${API_BASE_URL}/api/petty-cash`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: ingredient.ad_hoc_price,
              description: `Pembelian ad-hoc: ${ingredient.name} dari ${ingredient.ad_hoc_supplier}`,
              category: 'ad_hoc_purchase',
              ingredient_id: ingredient.id,
            }),
          });
        }
      }

      if (settingsResponse.ok) {
        // Reset all values after successful save
        setIngredients(prev => prev.map(ing => ({
          ...ing,
          restock_quantity: 0,
          supplier_id: null,
          ad_hoc_supplier: null,
          ad_hoc_price: null,
          use_petty_cash: false,
        })));
        
        // Clear all selected checkboxes
        setSelectedIds(new Set());
        
        // Clear bulk action fields
        setBulkSupplierId('');
        setBulkRestockQuantity('');
        setShowBulkActions(false);
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Filter ingredients based on search and category
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || ingredient.category?.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(ingredients.map(ing => ing.category?.name).filter(Boolean)));

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredIngredients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIngredients.map(ing => ing.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk action handlers
  const handleBulkApply = () => {
    const newIngredients = ingredients.map(ing => {
      if (selectedIds.has(ing.id)) {
        return {
          ...ing,
          supplier_id: bulkSupplierId || ing.supplier_id,
          restock_quantity: bulkRestockQuantity ? parseFloat(bulkRestockQuantity) : ing.restock_quantity,
        };
      }
      return ing;
    });
    setIngredients(newIngredients);
    setSelectedIds(new Set());
    setShowBulkActions(false);
    setBulkSupplierId('');
    setBulkRestockQuantity('');
  };

  const isLowStock = (ingredient: Ingredient) => {
    return ingredient.current_stock <= ingredient.min_stock;
  };

  if (loading) {
    return (
      <ResponsiveShell title="Otomatisasi Restok">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      </ResponsiveShell>
    );
  }

  return (
    <ResponsiveShell title="Otomatisasi Restok">
      <div className="space-y-6">
        {/* Global Automation Toggle */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-violet-600" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Otomatisasi Restok Global</h3>
                <p className="text-xs text-gray-500">
                  {autoRestockEnabled 
                    ? 'Sistem akan otomatis membuat PR saat stok di bawah batas minimum' 
                    : 'Otomatisasi restok dinonaktifkan'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setAutoRestockEnabled(!autoRestockEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoRestockEnabled ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoRestockEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reorder Configuration Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-violet-600" />
                <h3 className="text-sm font-semibold text-gray-900">Konfigurasi Reorder</h3>
              </div>
              
              {/* Search and Filter */}
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari bahan baku..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
                  />
                </div>
                
                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Bulk Actions Panel */}
          {selectedIds.size > 0 && (
            <div className="bg-violet-50 border-b border-violet-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-violet-900">
                    {selectedIds.size} bahan baku dipilih
                  </span>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="text-violet-600 hover:text-violet-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={bulkSupplierId}
                    onChange={(e) => setBulkSupplierId(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="">Set Supplier...</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Set Jumlah Restock"
                    value={bulkRestockQuantity}
                    onChange={(e) => setBulkRestockQuantity(e.target.value)}
                    className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    onClick={handleBulkApply}
                    className="px-3 py-1.5 text-sm bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <button onClick={handleSelectAll} className="hover:text-violet-600">
                      {selectedIds.size === filteredIngredients.length && filteredIngredients.length > 0 ? (
                        <CheckSquare2 className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Bahan Baku
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Saat Ini
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Stock / Reorder Point
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah Restock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectRow(ingredient.id)}
                        className="hover:text-violet-600"
                      >
                        {selectedIds.has(ingredient.id) ? (
                          <CheckSquare2 className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                      {ingredient.category && (
                        <div className="text-xs text-gray-500">{ingredient.category?.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        isLowStock(ingredient) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {ingredient.current_stock.toFixed(2)} {ingredient.unit}
                      </div>
                      {isLowStock(ingredient) && (
                        <div className="text-xs text-red-500">⚠️ Stok Kritis</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={ingredient.min_stock}
                        onChange={(e) => handleIngredientChange(ingredient.id, 'min_stock', parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ingredient.restock_quantity}
                          onChange={(e) => handleIngredientChange(ingredient.id, 'restock_quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <span className="text-xs text-gray-500">{ingredient.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <select
                          value={ingredient.supplier_id || (ingredient.ad_hoc_supplier ? 'ad-hoc' : '')}
                          onChange={(e) => handleIngredientChange(ingredient.id, 'supplier_id', e.target.value)}
                          className="w-40 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          <option value="">Pilih Supplier</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </option>
                          ))}
                          <option value="ad-hoc">Lainnya / Pembelian Manual</option>
                        </select>
                        {ingredient.supplier_id === null && ingredient.ad_hoc_supplier !== undefined && (
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              placeholder="Nama Toko / Pasar"
                              value={ingredient.ad_hoc_supplier || ''}
                              onChange={(e) => handleIngredientChange(ingredient.id, 'ad_hoc_supplier', e.target.value)}
                              className="w-40 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Harga Beli Aktual"
                              value={ingredient.ad_hoc_price || ''}
                              onChange={(e) => handleIngredientChange(ingredient.id, 'ad_hoc_price', parseFloat(e.target.value) || null)}
                              className="w-40 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                            <label className="flex items-center gap-2 text-xs text-slate-600">
                              <input
                                type="checkbox"
                                checked={ingredient.use_petty_cash || false}
                                onChange={(e) => handleIngredientChange(ingredient.id, 'use_petty_cash', e.target.checked)}
                                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                              />
                              Gunakan Dana Petty Cash
                            </label>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Pengaturan berhasil disimpan</span>
            </div>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>
    </ResponsiveShell>
  );
}

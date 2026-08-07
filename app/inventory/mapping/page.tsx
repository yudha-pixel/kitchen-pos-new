'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { getIngredientsWithStatus, upsertRecipe, getRecipesForMenuItem, calculateRecipeCost, calculateProductProfitability } from '@/src/features/inventory/inventoryService';
import { AddProductModal } from '@/src/features/pos/components/AddProductModal';
import { EditProductModal } from '@/src/features/pos/components/EditProductModal';
import { db } from '@/src/lib/db';
import { Product } from '@/src/types/database.types';
import { useAuth } from '@/src/context/AuthContext';
import { useConfigStore } from '@/src/store/useConfigStore';
import { Package, Plus, Trash2, Save, Upload, Download, Edit, ChevronLeft, ChevronRight, ArrowLeft, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface Ingredient {
  id?: string;
  name: string;
  current_stock: number;
  unit: string;
  min_stock: number;
  unit_price: number;
}

interface RecipeMapping {
  ingredient_id: string;
  quantity_required: number;
  unit: string;
}

interface KitComponentMapping {
  component_product_id: string;
  quantity_required: number;
}

interface SubcontractingInfo {
  vendor_name: string;
  vendor_contact: string;
  lead_time_days: number;
  unit_cost: number;
  notes?: string;
}

// Standard unit options for recipe mapping
const STANDARD_UNITS = [
  { value: 'kg', label: 'kg' },
  { value: 'gram', label: 'gram' },
  { value: 'liter', label: 'liter' },
  { value: 'ml', label: 'ml' },
  { value: 'pcs', label: 'pcs' },
  { value: 'porsi', label: 'porsi' },
  { value: 'sachet', label: 'sachet' },
  { value: 'sendok', label: 'sendok' },
  { value: 'sdm', label: 'sdm' },
  { value: 'sdt', label: 'sdt' },
  { value: 'cup', label: 'cup' },
  { value: 'buah', label: 'buah' },
];

export default function RecipeMappingPage() {
  const { user } = useAuth();
  const taxRate = useConfigStore((state) => state.taxRate);
  const serviceChargeRate = useConfigStore((state) => state.serviceChargeRate);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [recipeMappings, setRecipeMappings] = useState<RecipeMapping[]>([]);
  const [existingRecipes, setExistingRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportData, setBulkImportData] = useState('');
  const [activeTab, setActiveTab] = useState('components');
  const [bomType, setBomType] = useState('manufacture');
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatalogItems, setSelectedCatalogItems] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [listPaneCollapsed, setListPaneCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [profitability, setProfitability] = useState<any>(null);
  const [kitComponents, setKitComponents] = useState<KitComponentMapping[]>([]);
  const [subcontractingInfo, setSubcontractingInfo] = useState<SubcontractingInfo>({
    vendor_name: '',
    vendor_contact: '',
    lead_time_days: 0,
    unit_cost: 0,
    notes: '',
  });

  useEffect(() => {
    loadData();
    
    // Expose db to window for console access (for debugging/scripts)
    if (typeof window !== 'undefined') {
      (window as any).db = db;
    }
  }, []);

  const loadData = async () => {
    try {
      const [productsData, ingredientsData] = await Promise.all([
        db.products.toArray(),
        getIngredientsWithStatus(),
      ]);
      setProducts(productsData as Product[]);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      loadExistingRecipes();
      loadKitComponents();
      loadProfitability();
    }
  }, [selectedProduct]);

  useEffect(() => {
    // Load appropriate data when bomType changes
    if (selectedProduct) {
      if (bomType === 'manufacture') {
        loadExistingRecipes();
      } else if (bomType === 'kit') {
        loadKitComponents();
      } else if (bomType === 'subcontracting') {
        loadSubcontractingInfo();
      }
    }
  }, [bomType]);

  // Real-time HPP calculation when recipe mappings change
  useEffect(() => {
    if (selectedProduct && bomType === 'manufacture' && recipeMappings.length > 0) {
      loadProfitability();
    }
  }, [recipeMappings]);

  // Real-time HPP calculation when kit components change
  useEffect(() => {
    if (selectedProduct && bomType === 'kit' && kitComponents.length > 0) {
      loadProfitability();
    }
  }, [kitComponents]);

  const loadSubcontractingInfo = async () => {
    if (!selectedProduct) return;
    
    try {
      const product = await db.products.get(selectedProduct);
      if (product && (product as any).subcontracting_info) {
        setSubcontractingInfo((product as any).subcontracting_info);
      } else {
        // Reset to default
        setSubcontractingInfo({
          vendor_name: '',
          vendor_contact: '',
          lead_time_days: 0,
          unit_cost: 0,
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to load subcontracting info:', error);
    }
  };

  const loadProfitability = async () => {
    if (!selectedProduct) return;
    
    try {
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;
      
      const profitData = await calculateProductProfitability(
        selectedProduct,
        product.price,
        taxRate,
        serviceChargeRate
      );
      setProfitability(profitData);
    } catch (error) {
      console.error('Failed to load profitability:', error);
    }
  };

  const loadExistingRecipes = async () => {
    try {
      const recipes = await getRecipesForMenuItem(selectedProduct);
      setExistingRecipes(recipes);
      
      // Initialize recipe mappings with existing data
      const mappings: RecipeMapping[] = recipes.map(recipe => ({
        ingredient_id: recipe.ingredient_id,
        quantity_required: recipe.quantity_required,
        unit: recipe.unit || 'pcs', // Default to pcs if not specified
      }));
      setRecipeMappings(mappings);
    } catch (error) {
      console.error('Failed to load existing recipes:', error);
    }
  };

  const loadKitComponents = async () => {
    if (!selectedProduct) return;
    
    try {
      const components = await db.kit_components
        .where('menu_item_id')
        .equals(selectedProduct)
        .toArray();
      
      const mappings: KitComponentMapping[] = components.map(comp => ({
        component_product_id: comp.component_product_id,
        quantity_required: comp.quantity_required,
      }));
      setKitComponents(mappings);
    } catch (error) {
      console.error('Failed to load kit components:', error);
    }
  };

  const handleIngredientToggle = (ingredientId: string) => {
    const existing = recipeMappings.find(m => m.ingredient_id === ingredientId);
    if (existing) {
      setRecipeMappings(recipeMappings.filter(m => m.ingredient_id !== ingredientId));
    } else {
      // Get the ingredient's default unit
      const ingredient = ingredients.find(i => i.id === ingredientId);
      const defaultUnit = ingredient?.unit || 'pcs';
      setRecipeMappings([...recipeMappings, { ingredient_id: ingredientId, quantity_required: 0, unit: defaultUnit }]);
    }
  };

  const handleQuantityChange = (ingredientId: string, quantity: number) => {
    setRecipeMappings(
      recipeMappings.map(m =>
        m.ingredient_id === ingredientId ? { ...m, quantity_required: quantity } : m
      )
    );
  };

  const handleUnitChange = (ingredientId: string, unit: string) => {
    setRecipeMappings(
      recipeMappings.map(m =>
        m.ingredient_id === ingredientId ? { ...m, unit } : m
      )
    );
  };

  // Helper functions for list-detail UI
  const hasRecipe = (productId: string): boolean => {
    return existingRecipes.some(recipe => recipe.menu_item_id === productId);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'price':
        return sortOrder === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      case 'status':
        const aHasRecipe = hasRecipe(a.id || '');
        const bHasRecipe = hasRecipe(b.id || '');
        return sortOrder === 'asc'
          ? (aHasRecipe === bHasRecipe ? 0 : aHasRecipe ? -1 : 1)
          : (aHasRecipe === bHasRecipe ? 0 : aHasRecipe ? 1 : -1);
      default:
        return 0;
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(index + 1, sortedProducts.length - 1);
        setFocusedIndex(nextIndex);
        setSelectedProduct(sortedProducts[nextIndex].id || '');
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(index - 1, 0);
        setFocusedIndex(prevIndex);
        setSelectedProduct(sortedProducts[prevIndex].id || '');
        break;
      case 'Enter':
        e.preventDefault();
        setSelectedProduct(sortedProducts[index].id || '');
        break;
    }
  };

  const handleSave = async () => {
    if (!selectedProduct) return;

    setSaving(true);
    try {
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;

      // Handle different BoM types
      if (bomType === 'manufacture') {
        // Delete existing recipes for this product
        await db.recipes
          .where('menu_item_id')
          .equals(selectedProduct)
          .delete();

        // Add new recipes
        for (const mapping of recipeMappings) {
          if (mapping.ingredient_id && mapping.quantity_required > 0) {
            await upsertRecipe({
              menu_item_id: selectedProduct,
              ingredient_id: mapping.ingredient_id,
              quantity_required: mapping.quantity_required,
              unit: mapping.unit,
            });
          }
        }
      } else if (bomType === 'kit') {
        // Delete existing kit components
        await db.kit_components
          .where('menu_item_id')
          .equals(selectedProduct)
          .delete();

        // Add new kit components
        for (const component of kitComponents) {
          if (component.component_product_id && component.quantity_required > 0) {
            await db.kit_components.add({
              id: crypto.randomUUID(),
              menu_item_id: selectedProduct,
              component_product_id: component.component_product_id,
              quantity_required: component.quantity_required,
              created_at: new Date().toISOString(),
            });
          }
        }
      } else if (bomType === 'subcontracting') {
        // Update subcontracting info
        await db.products.update(selectedProduct, {
          subcontracting_info: subcontractingInfo,
        });
      }

      // Update bom_type
      await db.products.update(selectedProduct, { bom_type });

      // Reload data
      await loadExistingRecipes();
      await loadKitComponents();
      await loadSubcontractingInfo();
      await loadProfitability();

      alert('Resep berhasil disimpan');
    } catch (error) {
      console.error('Failed to save recipes:', error);
      alert('Gagal menyimpan resep');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = () => {
    try {
      // Check if data is empty
      if (!bulkImportData.trim()) {
        alert('Data kosong. Silakan isi data JSON.');
        return;
      }

      // Check if user pasted a file path instead of JSON data
      if (bulkImportData.trim().startsWith('/') || bulkImportData.trim().startsWith('C:') || bulkImportData.trim().startsWith('D:')) {
        alert('❌ ANDA MEMASUKKAN FILE PATH, BUKAN DATA JSON!\n\n' +
              'Anda tidak bisa memasukkan file path seperti "/home/taufik/..." ke dalam textarea.\n\n' +
              'CARA YANG BENAR:\n' +
              '1. Buka file JSON di text editor (VS Code, Notepad, dll)\n' +
              '2. Copy semua isi file (data JSON-nya)\n' +
              '3. Paste data JSON tersebut ke dalam textarea ini\n\n' +
              'Contoh data JSON yang benar:\n' +
              '[\n' +
              '  {\n' +
              '    "menu_name": "Nasi Goreng Spesial",\n' +
              '    "ingredients": [\n' +
              '      { "ingredient_name": "Beras", "quantity": 0.2, "unit": "kg" }\n' +
              '    ]\n' +
              '  }\n' +
              ']');
        return;
      }

      // Trim and clean data
      const cleanedData = bulkImportData.trim();
      
      // Try to parse JSON
      const data = JSON.parse(cleanedData);
      
      if (!Array.isArray(data)) {
        throw new Error('Data harus berupa array');
      }

      // Validate structure
      const requiredFields = ['menu_name', 'ingredients'];
      for (const item of data) {
        for (const field of requiredFields) {
          if (!(field in item)) {
            throw new Error(`Field ${field} tidak ditemukan dalam item`);
          }
        }
      }

      // Process bulk import
      processBulkImport(data);
      setBulkImportOpen(false);
      setBulkImportData('');
    } catch (error) {
      console.error('Bulk import error:', error);
      
      if (error instanceof SyntaxError) {
        const errorMessage = error.message;
        let userMessage = 'Format JSON tidak valid.\n\n';
        
        if (errorMessage.includes('position')) {
          userMessage += `Error: ${errorMessage}\n\n`;
          userMessage += 'Kemungkinan penyebab:\n';
          userMessage += '- Ada karakter tambahan setelah JSON (seperti koma trailing, komentar, atau teks lain)\n';
          userMessage += '- Format JSON tidak lengkap (kurung kurawal tidak tertutup)\n';
          userMessage += '- Ada karakter ilegal dalam JSON\n\n';
        }
        
        userMessage += 'Contoh format yang benar:\n';
        userMessage += '[\n';
        userMessage += '  {\n';
        userMessage += '    "menu_name": "Nasi Goreng Spesial",\n';
        userMessage += '    "ingredients": [\n';
        userMessage += '      { "ingredient_name": "Beras", "quantity": 0.2, "unit": "kg" }\n';
        userMessage += '    ]\n';
        userMessage += '  }\n';
        userMessage += ']\n\n';
        userMessage += 'Tips:\n';
        userMessage += '- Pastikan tidak ada koma setelah item terakhir\n';
        userMessage += '- Pastikan tidak ada komentar dalam JSON\n';
        userMessage += '- Pastikan semua string menggunakan tanda kutip ganda (")\n';
        userMessage += '- Pastikan tidak ada karakter spesial atau emoji';
        
        alert(userMessage);
      } else {
        alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const processBulkImport = async (data: any[]) => {
    try {
      for (const item of data) {
        // Find product by name
        const product = await db.products.where('name').equals(item.menu_name).first();
        if (!product || !product.id) {
          console.warn(`Menu ${item.menu_name} tidak ditemukan, dilewati`);
          continue;
        }

        // Delete existing recipes for this product
        const existing = await db.recipes.where('menu_item_id').equals(product.id).toArray();
        await db.recipes.bulkDelete(existing.map(r => r.id!));

        // Add new recipes
        for (const ingredient of item.ingredients) {
          const ingredientName = ingredient.ingredient_name || ingredient.name;
          if (!ingredientName) {
            console.warn(`Bahan tanpa nama, dilewati`);
            continue;
          }
          
          let ingredientRecord = await db.ingredients.where('name').equals(ingredientName).first();
          
          // Auto-create ingredient if it doesn't exist
          if (!ingredientRecord || !ingredientRecord.id) {
            console.log(`Creating new ingredient: ${ingredientName}`);
            const ingredientId = crypto.randomUUID();
            const now = new Date().toISOString();
            
            await db.ingredients.add({
              id: ingredientId,
              name: ingredientName,
              current_stock: 0,
              unit: ingredient.unit || 'pcs',
              min_stock: 10,
              unit_price: 0,
              created_at: now,
              updated_at: now,
            });
            
            ingredientRecord = await db.ingredients.get(ingredientId);
          }

          if (!ingredientRecord || !ingredientRecord.id) {
            console.warn(`Failed to create or retrieve ingredient ${ingredientName}, dilewati`);
            continue;
          }

          await upsertRecipe({
            menu_item_id: product.id,
            ingredient_id: ingredientRecord.id,
            quantity_required: ingredient.quantity,
          });
        }
      }

      alert('Bulk import berhasil');
      if (selectedProduct) {
        await loadExistingRecipes();
      }
    } catch (error) {
      console.error('Failed to process bulk import:', error);
      throw error;
    }
  };

  const handleExport = () => {
    const exportData = products.map(product => ({
      menu_name: product.name,
      ingredients: existingRecipes
        .filter(r => r.menu_item_id === product.id)
        .map(r => ({
          name: r.ingredientName,
          quantity: r.quantity_required,
        })),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe-mapping.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getIngredientName = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    return ingredient?.name || 'Unknown';
  };

  const getIngredientUnit = (ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    return ingredient?.unit || '';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="text-center text-gray-500">Memuat data...</div>
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mapping Resep (BOM)</h1>
                <p className="text-gray-600 mt-1">Kelola komposisi bahan baku untuk setiap menu</p>
              </div>
              <div className="flex gap-2">
                {(user?.role === 'admin' || user?.role === 'management') && (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Tambah Menu</span>
                  </button>
                )}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  <span>Export JSON</span>
                </button>
                <button
                  onClick={() => setBulkImportOpen(true)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  <span>Bulk Import</span>
                </button>
              </div>
            </div>

            <div className="flex gap-6 h-[calc(100vh-200px)]">
              {/* List Pane - Desktop */}
              <div className={`${listPaneCollapsed ? 'w-0' : 'w-1/3'} hidden lg:flex transition-all duration-300 flex-col bg-white rounded-lg shadow overflow-hidden`}>
                {/* List Pane Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold">Daftar Menu</h2>
                    <button
                      onClick={() => setListPaneCollapsed(!listPaneCollapsed)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title={listPaneCollapsed ? 'Expand' : 'Collapse'}
                    >
                      {listPaneCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari menu..."
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sort Options */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Nama (A-Z)</option>
                    <option value="price">Harga (Low-High)</option>
                    <option value="status">Status Resep</option>
                  </select>
                </div>

                {/* Menu List */}
                <div className="flex-1 overflow-y-auto">
                  {sortedProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`p-3 border-b cursor-pointer transition-colors ${
                        selectedProduct === product.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                      } ${focusedIndex === index ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
                      onClick={() => setSelectedProduct(product.id || '')}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">Rp {product.price.toLocaleString('id-ID')}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasRecipe(product.id || '') ? (
                            <span className="text-green-500 font-bold" title="Resep lengkap">✓</span>
                          ) : (
                            <span className="text-red-500 font-bold" title="Belum ada resep">✗</span>
                          )}
                          {(user?.role === 'admin' || user?.role === 'management') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProduct(product);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit Menu"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Menu Button */}
                {(user?.role === 'admin' || user?.role === 'management') && (
                  <div className="p-4 border-t">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Menu
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile View */}
              <div className="lg:hidden w-full">
                {!selectedProduct ? (
                  /* Mobile List View */
                  <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="font-semibold mb-4">Daftar Menu</h2>
                    
                    {/* Search */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari menu..."
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Sort Options */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    >
                      <option value="name">Nama (A-Z)</option>
                      <option value="price">Harga (Low-High)</option>
                      <option value="status">Status Resep</option>
                    </select>

                    {/* Menu List */}
                    <div className="space-y-2">
                      {sortedProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedProduct === product.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedProduct(product.id || '')}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">Rp {product.price.toLocaleString('id-ID')}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {hasRecipe(product.id || '') ? (
                                <span className="text-green-500 font-bold">✓</span>
                              ) : (
                                <span className="text-red-500 font-bold">✗</span>
                              )}
                              <ArrowLeft className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Menu Button */}
                    {(user?.role === 'admin' || user?.role === 'management') && (
                      <div className="mt-4">
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Tambah Menu
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Mobile Detail View - handled in detail pane */
                  <></>
                )}
              </div>

              {/* Detail Pane */}
              <div className={`${listPaneCollapsed ? 'w-full' : 'w-2/3'} transition-all duration-300 flex flex-col bg-white rounded-lg shadow overflow-hidden`}>
                {/* Mobile Back Button */}
                <div className="lg:hidden p-4 border-b flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProduct('')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <span className="font-medium">Kembali ke Daftar</span>
                </div>

                {/* Empty State */}
                {!selectedProduct ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center text-gray-500">
                      <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Pilih menu dari daftar sebelah kiri</p>
                      <p className="text-sm mt-2">untuk melihat dan mengedit resep</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-6">
                    {/* Header Information */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 w-24">Product:</span>
                        <span className="text-sm text-gray-900">{products.find(p => p.id === selectedProduct)?.name || ''}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 w-24">Quantity:</span>
                        <span className="text-sm text-gray-900">1.00 Units</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 w-24">BoM Type:</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              value="manufacture"
                              checked={bomType === 'manufacture'}
                              onChange={(e) => setBomType(e.target.value)}
                              className="text-blue-600"
                            />
                            Manufacture
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              value="kit"
                              checked={bomType === 'kit'}
                              onChange={(e) => setBomType(e.target.value)}
                              className="text-blue-600"
                            />
                            Kit
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="radio"
                              value="subcontracting"
                              checked={bomType === 'subcontracting'}
                              onChange={(e) => setBomType(e.target.value)}
                              className="text-blue-600"
                            />
                            Subcontracting
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Profitability Analysis */}
                    {profitability && (
                      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">Analisis Profitabilitas</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Harga Jual</p>
                            <p className="text-sm font-bold text-gray-900">
                              Rp {products.find(p => p.id === selectedProduct)?.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">HPP (Biaya Bahan)</p>
                            <p className="text-sm font-bold text-orange-600">
                              Rp {profitability.hpp.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Penjualan Bersih</p>
                            <p className="text-sm font-bold text-gray-900">
                              Rp {Math.round(profitability.netSales).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Pajak ({taxRate}%)</p>
                            <p className="text-sm font-bold text-red-600">
                              Rp {Math.round(profitability.taxAmount).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Service Charge ({serviceChargeRate}%)</p>
                            <p className="text-sm font-bold text-purple-600">
                              Rp {Math.round(profitability.serviceChargeAmount).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Laba Kotor</p>
                            <p className="text-sm font-bold text-green-600">
                              Rp {Math.round(profitability.grossProfit).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Laba Bersih</p>
                            <p className={`text-sm font-bold ${profitability.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Rp {Math.round(profitability.netProfit).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <p className="text-xs text-gray-600 mb-1">Margin Bersih</p>
                            <p className={`text-sm font-bold ${profitability.netMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {profitability.netMargin.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab System */}
                    <div className="border-b mb-4">
                      <div className="flex gap-6">
                        {bomType === 'manufacture' ? (
                          <>
                            <button
                              onClick={() => setActiveTab('components')}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'components'
                                  ? 'border-blue-600 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Components
                            </button>
                            <button
                              onClick={() => setActiveTab('operations')}
                              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'operations'
                                  ? 'border-blue-600 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              Operations
                            </button>
                          </>
                        ) : bomType === 'kit' ? (
                          <button
                            onClick={() => setActiveTab('components')}
                            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                              activeTab === 'components'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Kit Components
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveTab('components')}
                            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                              activeTab === 'components'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Vendor Info
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab('miscellaneous')}
                          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'miscellaneous'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Miscellaneous
                        </button>
                      </div>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'components' && (
                      <div>
                        {bomType === 'manufacture' ? (
                          // Manufacture mode - show ingredients table
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="w-8 py-2 px-2"></th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Component</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Quantity</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Unit</th>
                                <th className="w-10 py-2 px-3"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {recipeMappings.map((mapping, index) => {
                                const ingredient = ingredients.find(i => i.id === mapping.ingredient_id);
                                return (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-2 text-gray-400 cursor-move">
                                      <span className="text-lg">⋮⋮</span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <select
                                        value={mapping.ingredient_id}
                                        onChange={(e) => {
                                          const newMappings = [...recipeMappings];
                                          newMappings[index] = { ...newMappings[index], ingredient_id: e.target.value };
                                          setRecipeMappings(newMappings);
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:ring-0 focus:bg-white"
                                      >
                                        <option value="">Select ingredient</option>
                                        {ingredients.map((ing) => (
                                          <option key={ing.id} value={ing.id}>
                                            {ing.name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="number"
                                        value={mapping.quantity_required}
                                        onChange={(e) => {
                                          const newMappings = [...recipeMappings];
                                          newMappings[index] = { ...newMappings[index], quantity_required: parseFloat(e.target.value) || 0 };
                                          setRecipeMappings(newMappings);
                                        }}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:ring-0 focus:bg-white"
                                        placeholder="0"
                                      />
                                    </td>
                                    <td className="py-2 px-3">
                                      <select
                                        value={mapping.unit}
                                        onChange={(e) => {
                                          const newMappings = [...recipeMappings];
                                          newMappings[index] = { ...newMappings[index], unit: e.target.value };
                                          setRecipeMappings(newMappings);
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:ring-0 focus:bg-white text-sm"
                                      >
                                        {STANDARD_UNITS.map((unit) => (
                                          <option key={unit.value} value={unit.value}>
                                            {unit.label}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <button
                                        onClick={() => {
                                          setRecipeMappings(recipeMappings.filter((_, i) => i !== index));
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : bomType === 'kit' ? (
                          // Kit mode - show products table
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="w-8 py-2 px-2"></th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Product Component</th>
                                <th className="text-left py-2 px-3 font-medium text-gray-700">Quantity</th>
                                <th className="w-10 py-2 px-3"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {kitComponents.map((component, index) => {
                                const product = products.find(p => p.id === component.component_product_id);
                                return (
                                  <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-2 text-gray-400 cursor-move">
                                      <span className="text-lg">⋮⋮</span>
                                    </td>
                                    <td className="py-2 px-3">
                                      <select
                                        value={component.component_product_id}
                                        onChange={(e) => {
                                          const newComponents = [...kitComponents];
                                          newComponents[index] = { ...newComponents[index], component_product_id: e.target.value };
                                          setKitComponents(newComponents);
                                        }}
                                        className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:ring-0 focus:bg-white"
                                      >
                                        <option value="">Select product</option>
                                        {products
                                          .filter(p => p.id !== selectedProduct) // Exclude self
                                          .map((prod) => (
                                            <option key={prod.id} value={prod.id}>
                                              {prod.name}
                                            </option>
                                          ))}
                                      </select>
                                    </td>
                                    <td className="py-2 px-3">
                                      <input
                                        type="number"
                                        value={component.quantity_required}
                                        onChange={(e) => {
                                          const newComponents = [...kitComponents];
                                          newComponents[index] = { ...newComponents[index], quantity_required: parseFloat(e.target.value) || 0 };
                                          setKitComponents(newComponents);
                                        }}
                                        min="0"
                                        step="1"
                                        className="w-full px-2 py-1 border-0 bg-transparent focus:outline-none focus:ring-0 focus:bg-white"
                                        placeholder="0"
                                      />
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                      <button
                                        onClick={() => {
                                          setKitComponents(kitComponents.filter((_, i) => i !== index));
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        ) : (
                          // Subcontracting mode - show vendor info form
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                                <input
                                  type="text"
                                  value={subcontractingInfo.vendor_name}
                                  onChange={(e) => setSubcontractingInfo({ ...subcontractingInfo, vendor_name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Enter vendor name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Contact</label>
                                <input
                                  type="text"
                                  value={subcontractingInfo.vendor_contact}
                                  onChange={(e) => setSubcontractingInfo({ ...subcontractingInfo, vendor_contact: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Phone or email"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (Days)</label>
                                <input
                                  type="number"
                                  value={subcontractingInfo.lead_time_days}
                                  onChange={(e) => setSubcontractingInfo({ ...subcontractingInfo, lead_time_days: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0"
                                  min="0"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost</label>
                                <input
                                  type="number"
                                  value={subcontractingInfo.unit_cost}
                                  onChange={(e) => setSubcontractingInfo({ ...subcontractingInfo, unit_cost: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                              <textarea
                                value={subcontractingInfo.notes}
                                onChange={(e) => setSubcontractingInfo({ ...subcontractingInfo, notes: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Additional notes about this vendor or product"
                                rows={3}
                              />
                            </div>
                          </div>
                        )}

                        {/* Table Footer - only show for manufacture and kit modes */}
                        {bomType !== 'subcontracting' && (
                          <div className="mt-4 flex items-center gap-4">
                            <button
                              onClick={() => {
                                if (bomType === 'manufacture') {
                                  setRecipeMappings([...recipeMappings, { ingredient_id: '', quantity_required: 0, unit: 'pcs' }]);
                                } else if (bomType === 'kit') {
                                  setKitComponents([...kitComponents, { component_product_id: '', quantity_required: 0 }]);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Add a line
                            </button>
                            <button 
                              onClick={() => setCatalogOpen(true)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Catalog
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'operations' && bomType === 'manufacture' && (
                      <div className="py-8 text-center text-gray-500 text-sm">
                        Operations tab - Coming soon
                      </div>
                    )}

                    {activeTab === 'miscellaneous' && (
                      <div className="py-8 text-center text-gray-500 text-sm">
                        Miscellaneous tab - Coming soon
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-5 w-5" />
                        <span>{saving ? 'Menyimpan...' : 'Simpan Resep'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Import Modal */}
            {bulkImportOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Bulk Import Resep</h2>
                    <button
                      onClick={() => setBulkImportOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Format JSON: Array dengan struktur {`{ menu_name: string, ingredients: [{ name: string, quantity: number }] }`}
                    </p>
                    <textarea
                      value={bulkImportData}
                      onChange={(e) => setBulkImportData(e.target.value)}
                      className="w-full h-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      placeholder={`[
  {
    "menu_name": "Nasi Goreng Spesial",
    "ingredients": [
      { "name": "Beras", "quantity": 0.2 },
      { "name": "Daging Ayam", "quantity": 0.1 }
    ]
  }
]`}
                    />
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setBulkImportOpen(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleBulkImport}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Import
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Catalog Modal */}
            {catalogOpen && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Catalog Bahan Baku</h2>
                    <button
                      onClick={() => {
                        setCatalogOpen(false);
                        setSelectedCatalogItems(new Set());
                        setCatalogSearch('');
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    {/* Search Bar */}
                    <div className="mb-4">
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Cari bahan baku..."
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Ingredients Table */}
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="w-10 py-2 px-3">
                              <input
                                type="checkbox"
                                checked={selectedCatalogItems.size === ingredients.length && ingredients.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCatalogItems(new Set(ingredients.filter(i => i.id).map(i => i.id!)));
                                  } else {
                                    setSelectedCatalogItems(new Set());
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 rounded"
                              />
                            </th>
                            <th className="text-left py-2 px-3 font-medium text-gray-700">Nama Bahan</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-700">Unit</th>
                            <th className="text-left py-2 px-3 font-medium text-gray-700">Stok Saat Ini</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ingredients
                            .filter(ingredient => 
                              ingredient.name.toLowerCase().includes(catalogSearch.toLowerCase())
                            )
                            .map((ingredient) => (
                              <tr key={ingredient.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedCatalogItems.has(ingredient.id || '')}
                                    onChange={(e) => {
                                      const newSelected = new Set(selectedCatalogItems);
                                      if (e.target.checked && ingredient.id) {
                                        newSelected.add(ingredient.id);
                                      } else if (ingredient.id) {
                                        newSelected.delete(ingredient.id);
                                      }
                                      setSelectedCatalogItems(newSelected);
                                    }}
                                    className="h-4 w-4 text-blue-600 rounded"
                                  />
                                </td>
                                <td className="py-2 px-3 text-gray-900">{ingredient.name}</td>
                                <td className="py-2 px-3 text-gray-600">{ingredient.unit}</td>
                                <td className="py-2 px-3 text-gray-600">{ingredient.current_stock}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          setCatalogOpen(false);
                          setSelectedCatalogItems(new Set());
                          setCatalogSearch('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => {
                          const newMappings = [...recipeMappings];
                          selectedCatalogItems.forEach(ingredientId => {
                            if (!recipeMappings.find(m => m.ingredient_id === ingredientId)) {
                              const ingredient = ingredients.find(i => i.id === ingredientId);
                              const defaultUnit = ingredient?.unit || 'pcs';
                              newMappings.push({ ingredient_id: ingredientId, quantity_required: 0, unit: defaultUnit });
                            }
                          });
                          setRecipeMappings(newMappings);
                          setCatalogOpen(false);
                          setSelectedCatalogItems(new Set());
                          setCatalogSearch('');
                        }}
                        disabled={selectedCatalogItems.size === 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Tambah Bahan ({selectedCatalogItems.size})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Product Modal */}
            <AddProductModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onProductAdded={loadData}
              userRole={user?.role}
            />

            {/* Edit Product Modal */}
            {editingProduct && (
              <EditProductModal
                isOpen={!!editingProduct}
                onClose={() => setEditingProduct(null)}
                product={editingProduct}
                onSave={async (updatedData) => {
                  // Update product in local state
                  setProducts(products.map(p => 
                    p.id === editingProduct.id 
                      ? { ...p, ...updatedData } 
                      : p
                  ));
                  setEditingProduct(null);
                  await loadData();
                }}
                userRole={user?.role}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

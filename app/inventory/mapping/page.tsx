'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { getIngredientsWithStatus, upsertRecipe, getRecipesForMenuItem } from '@/src/features/inventory/inventoryService';
import { db } from '@/src/lib/db';
import { Package, Plus, Trash2, Save, Upload, Download } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  price: number;
}

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
}

export default function RecipeMappingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [recipeMappings, setRecipeMappings] = useState<RecipeMapping[]>([]);
  const [existingRecipes, setExistingRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkImportData, setBulkImportData] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, ingredientsData] = await Promise.all([
        db.products.toArray(),
        getIngredientsWithStatus(),
      ]);
      setProducts(productsData);
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
    }
  }, [selectedProduct]);

  const loadExistingRecipes = async () => {
    try {
      const recipes = await getRecipesForMenuItem(selectedProduct);
      setExistingRecipes(recipes);
      
      // Initialize recipe mappings with existing data
      const mappings: RecipeMapping[] = recipes.map(recipe => ({
        ingredient_id: recipe.ingredient_id,
        quantity_required: recipe.quantity_required,
      }));
      setRecipeMappings(mappings);
    } catch (error) {
      console.error('Failed to load existing recipes:', error);
    }
  };

  const handleIngredientToggle = (ingredientId: string) => {
    const existing = recipeMappings.find(m => m.ingredient_id === ingredientId);
    if (existing) {
      setRecipeMappings(recipeMappings.filter(m => m.ingredient_id !== ingredientId));
    } else {
      setRecipeMappings([...recipeMappings, { ingredient_id: ingredientId, quantity_required: 0 }]);
    }
  };

  const handleQuantityChange = (ingredientId: string, quantity: number) => {
    setRecipeMappings(
      recipeMappings.map(m =>
        m.ingredient_id === ingredientId ? { ...m, quantity_required: quantity } : m
      )
    );
  };

  const handleSave = async () => {
    if (!selectedProduct) {
      alert('Pilih menu terlebih dahulu');
      return;
    }

    setSaving(true);
    try {
      // Delete existing recipes for this product
      const existing = await db.recipes.where('menu_item_id').equals(selectedProduct).toArray();
      await db.recipes.bulkDelete(existing.map(r => r.id!));

      // Add new recipes
      for (const mapping of recipeMappings) {
        await upsertRecipe({
          menu_item_id: selectedProduct,
          ingredient_id: mapping.ingredient_id,
          quantity_required: mapping.quantity_required,
        });
      }

      alert('Resep berhasil disimpan');
      await loadExistingRecipes();
    } catch (error) {
      console.error('Failed to save recipes:', error);
      alert('Gagal menyimpan resep');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = () => {
    try {
      const data = JSON.parse(bulkImportData);
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
      alert('Format data tidak valid. Pastikan format JSON benar.');
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
          const ingredientRecord = await db.ingredients.where('name').equals(ingredient.name).first();
          if (!ingredientRecord || !ingredientRecord.id) {
            console.warn(`Bahan ${ingredient.name} tidak ditemukan, dilewati`);
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Menu Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Pilih Menu</h2>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Menu --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - Rp {product.price.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>

                {selectedProduct && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Resep Saat Ini:</h3>
                    {existingRecipes.length === 0 ? (
                      <p className="text-sm text-gray-500">Belum ada resep untuk menu ini</p>
                    ) : (
                      <ul className="space-y-2">
                        {existingRecipes.map((recipe) => (
                          <li key={recipe.id} className="text-sm text-gray-700 flex justify-between">
                            <span>{recipe.ingredientName}</span>
                            <span>{recipe.quantity_required} {getIngredientUnit(recipe.ingredient_id)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Ingredient Mapping */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Mapping Bahan Baku</h2>
                {!selectedProduct ? (
                  <p className="text-sm text-gray-500">Pilih menu terlebih dahulu</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {ingredients.map((ingredient) => {
                      if (!ingredient.id) return null;
                      const mapping = recipeMappings.find(m => m.ingredient_id === ingredient.id);
                      const isChecked = !!mapping;
                      return (
                        <div key={ingredient.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleIngredientToggle(ingredient.id!)}
                            className="h-5 w-5 text-blue-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{ingredient.name}</div>
                            <div className="text-sm text-gray-500">{ingredient.unit}</div>
                          </div>
                          {isChecked && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={mapping?.quantity_required || 0}
                                onChange={(e) => handleQuantityChange(ingredient.id!, parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                              />
                              <span className="text-sm text-gray-500">{ingredient.unit}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            {selectedProduct && (
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
            )}

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
          </div>
        </main>
      </div>
    </div>
  );
}

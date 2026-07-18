'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { getIngredientsWithStatus } from '@/src/features/inventory/inventoryService';
import { AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIngredients();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <TrendingDown className="h-4 w-4" />;
      case 'ok':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Kritis';
      case 'warning':
        return 'Peringatan';
      case 'ok':
        return 'Aman';
      default:
        return 'Unknown';
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
              <h1 className="text-3xl font-bold text-gray-900">Inventaris Bahan Baku</h1>
              <p className="text-gray-600 mt-1">Kelola dan pantau stok bahan baku restoran</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bahan Baku</p>
                    <p className="text-2xl font-bold text-gray-900">{ingredients.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stok Kritis</p>
                    <p className="text-2xl font-bold text-red-600">
                      {ingredients.filter((i) => i.status === 'critical').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Perlu Restock</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {ingredients.filter((i) => i.status === 'warning').length}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Daftar Bahan Baku</h2>
              </div>
              
              {loading ? (
                <div className="p-6 text-center text-gray-500">Memuat data...</div>
              ) : ingredients.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Belum ada data bahan baku. Tambahkan bahan baku untuk memulai.
                </div>
              ) : (
                <div className="overflow-x-auto">
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
                          Satuan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Min. Stok
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Harga Satuan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ingredients.map((ingredient) => (
                        <tr key={ingredient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ingredient.current_stock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ingredient.unit}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ingredient.min_stock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Rp {ingredient.unit_price.toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                ingredient.status
                              )}`}
                            >
                              {getStatusIcon(ingredient.status)}
                              <span className="ml-1">{getStatusLabel(ingredient.status)}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Keterangan Status</h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-300">
                    <TrendingUp className="h-4 w-4" />
                    <span className="ml-1">Aman</span>
                  </span>
                  <span className="text-sm text-gray-600">Stok di atas minimum</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-300">
                    <TrendingDown className="h-4 w-4" />
                    <span className="ml-1">Peringatan</span>
                  </span>
                  <span className="text-sm text-gray-600">Stok mendekati minimum</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="ml-1">Kritis</span>
                  </span>
                  <span className="text-sm text-gray-600">Stok di bawah minimum</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { formatRupiah } from '@/src/lib/format';
import { Search, Tag, Edit, Trash2, Plus, Calendar, Percent, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';

interface Promotion {
  id?: string;
  name: string;
  description?: string;
  type: 'quantity' | 'amount';
  min_quantity?: number;
  min_amount?: number;
  discount_type: 'nominal' | 'percentage';
  discount_value: number;
  max_discount?: number;
  buy_x_get_y?: boolean;
  buy_quantity?: number;
  get_quantity?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PromotionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'quantity' as 'quantity' | 'amount',
    min_quantity: 0,
    min_amount: 0,
    discount_type: 'nominal' as 'nominal' | 'percentage',
    discount_value: 0,
    max_discount: 0,
    buy_x_get_y: false,
    buy_quantity: 0,
    get_quantity: 0,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [promotions, searchTerm, filterType]);

  const loadPromotions = async () => {
    try {
      const { db } = await import('@/src/lib/db');
      const allPromotions = await db.promotions.toArray();
      setPromotions(allPromotions);
      setFilteredPromotions(allPromotions);
    } catch (error) {
      console.error('Failed to load promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...promotions];

    if (searchTerm) {
      filtered = filtered.filter(promotion =>
        promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (promotion.description && promotion.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType) {
      filtered = filtered.filter(promotion => promotion.type === filterType);
    }

    setFilteredPromotions(filtered);
  };

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setFormError('');
    setFormData({
      name: '',
      description: '',
      type: 'quantity',
      min_quantity: 0,
      min_amount: 0,
      discount_type: 'nominal',
      discount_value: 0,
      max_discount: 0,
      buy_x_get_y: false,
      buy_quantity: 0,
      get_quantity: 0,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormError('');
    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      type: promotion.type,
      min_quantity: promotion.min_quantity || 0,
      min_amount: promotion.min_amount || 0,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      max_discount: promotion.max_discount || 0,
      buy_x_get_y: promotion.buy_x_get_y || false,
      buy_quantity: promotion.buy_quantity || 0,
      get_quantity: promotion.get_quantity || 0,
      valid_from: promotion.valid_from.split('T')[0],
      valid_until: promotion.valid_until.split('T')[0],
      is_active: promotion.is_active,
    });
    setShowModal(true);
  };

  const handleDeletePromotion = async (id: string) => {
    setDeleting(true);
    setDeleteError('');
    try {
      const { db } = await import('@/src/lib/db');
      await db.promotions.delete(id);
      await loadPromotions();
      setPromotionToDelete(null);
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      setDeleteError('Gagal menghapus promosi. Silakan coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setPromotionToDelete(null);
    setDeleteError('');
  };

  const handleSavePromotion = async () => {
    setFormError('');

    if (!formData.name) {
      setFormError('Nama promosi wajib diisi');
      return;
    }

    if (formData.type === 'quantity' && formData.min_quantity === 0) {
      setFormError('Minimum kuantitas wajib diisi untuk promosi berdasarkan jumlah');
      return;
    }

    if (formData.type === 'amount' && formData.min_amount === 0) {
      setFormError('Minimum nominal wajib diisi untuk promosi berdasarkan nominal');
      return;
    }

    if (formData.discount_value === 0) {
      setFormError('Nilai diskon wajib diisi');
      return;
    }

    try {
      const { db } = await import('@/src/lib/db');
      const now = new Date().toISOString();

      const promotionData = {
        ...formData,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        updated_at: now,
      };

      if (editingPromotion) {
        await db.promotions.update(editingPromotion.id!, promotionData);
      } else {
        await db.promotions.add({
          ...promotionData,
          created_at: now,
        });
      }

      await loadPromotions();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save promotion:', error);
      setFormError('Gagal menyimpan promosi');
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      const { db } = await import('@/src/lib/db');
      await db.promotions.update(promotion.id!, {
        is_active: !promotion.is_active,
        updated_at: new Date().toISOString(),
      });
      await loadPromotions();
    } catch (error) {
      console.error('Failed to toggle promotion status:', error);
    }
  };

  const isActive = (promotion: Promotion) => {
    const now = new Date();
    const validFrom = new Date(promotion.valid_from);
    const validUntil = new Date(promotion.valid_until);
    return promotion.is_active && now >= validFrom && now <= validUntil;
  };

  // Calculate statistics
  const totalPromotions = filteredPromotions.length;
  const activePromotions = filteredPromotions.filter(p => isActive(p)).length;
  const quantityPromotions = filteredPromotions.filter(p => p.type === 'quantity').length;
  const amountPromotions = filteredPromotions.filter(p => p.type === 'amount').length;

  return (
    <div className="flex h-dvh bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Promosi Otomatis</h1>
              <p className="text-gray-600 mt-1">Kelola promosi berdasarkan jumlah atau nominal belanja</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Promosi</div>
                <div className="text-2xl font-bold text-gray-900">{totalPromotions}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Promosi Aktif</div>
                <div className="text-2xl font-bold text-green-600">{activePromotions}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Promosi Jumlah</div>
                <div className="text-2xl font-bold text-blue-600">{quantityPromotions}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Promosi Nominal</div>
                <div className="text-2xl font-bold text-purple-600">{amountPromotions}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau deskripsi promosi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="quantity">Berdasarkan Jumlah</option>
                    <option value="amount">Berdasarkan Nominal</option>
                  </select>
                </div>
                <button
                  onClick={handleAddPromotion}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 hover:text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Promosi
                </button>
              </div>
            </div>

            {/* Promotions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Memuat data...</div>
              ) : filteredPromotions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Tidak ada data promosi
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Syarat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPromotions.map((promotion) => (
                        <tr key={promotion.id || Math.random()} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Tag className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                                <div className="text-sm text-gray-500">{promotion.description || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              promotion.type === 'quantity' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {promotion.type === 'quantity' ? (
                                <><Package className="h-3 w-3" /> Jumlah</>
                              ) : (
                                <><DollarSign className="h-3 w-3" /> Nominal</>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {promotion.type === 'quantity' ? (
                              <div>Min. {promotion.min_quantity} item</div>
                            ) : (
                              <div>Min. {formatRupiah(promotion.min_amount || 0)}</div>
                            )}
                            {promotion.buy_x_get_y && (
                              <div className="text-xs text-green-600 mt-1">
                                Buy {promotion.buy_quantity} Get {promotion.get_quantity}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {promotion.discount_type === 'percentage' 
                              ? `${promotion.discount_value}%${promotion.max_discount ? ` (Max ${formatRupiah(promotion.max_discount)})` : ''}`
                              : formatRupiah(promotion.discount_value)
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <div>{new Date(promotion.valid_from).toLocaleDateString('id-ID')}</div>
                                <div className="text-xs">s/d {new Date(promotion.valid_until).toLocaleDateString('id-ID')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(promotion)}
                              className={`min-h-11 rounded-full px-3 py-1 text-xs font-medium ${
                                isActive(promotion)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isActive(promotion) ? 'Aktif' : 'Nonaktif'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditPromotion(promotion)}
                                aria-label={`Edit promosi ${promotion.name}`}
                                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                              >
                                <Edit className="size-4" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError('');
                                  setPromotionToDelete(promotion);
                                }}
                                aria-label={`Hapus promosi ${promotion.name}`}
                                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-900"
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Promotion Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              {editingPromotion ? 'Edit Promosi' : 'Tambah Promosi Baru'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Promosi *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Diskon Belanja 3 Item"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi promosi..."
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Promosi *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="quantity">Berdasarkan Jumlah Item</option>
                  <option value="amount">Berdasarkan Nominal Belanja</option>
                </select>
              </div>
              
              {formData.type === 'quantity' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Jumlah Item *</label>
                  <input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    placeholder="Contoh: 3"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Nominal Belanja *</label>
                  <input
                    type="number"
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    placeholder="Contoh: 100000"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon *</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="nominal">Nominal (Rp)</option>
                  <option value="percentage">Persentase (%)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Diskon *</label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  placeholder={formData.discount_type === 'percentage' ? 'Contoh: 10' : 'Contoh: 10000'}
                />
              </div>
              
              {formData.discount_type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maksimum Diskon (Opsional)</label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    placeholder="Contoh: 50000"
                  />
                </div>
              )}
              
              {formData.type === 'quantity' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="buyXGetY"
                    checked={formData.buy_x_get_y}
                    onChange={(e) => setFormData({ ...formData, buy_x_get_y: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="buyXGetY" className="ml-2 text-sm text-gray-700">Buy X Get Y</label>
                </div>
              )}
              
              {formData.buy_x_get_y && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buy (X)</label>
                    <input
                      type="number"
                      value={formData.buy_quantity}
                      onChange={(e) => setFormData({ ...formData, buy_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Get (Y)</label>
                    <input
                      type="number"
                      value={formData.get_quantity}
                      onChange={(e) => setFormData({ ...formData, get_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      placeholder="1"
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai *</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Promosi Aktif</label>
              </div>
            </div>
            
            {formError && (
              <p role="alert" className="mt-4 text-sm text-red-600">{formError}</p>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-gray-900"
              >
                Batal
              </button>
              <button
                onClick={handleSavePromotion}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 hover:text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(promotionToDelete)}
        onClose={closeDeleteDialog}
        title="Hapus promosi?"
        role="alertdialog"
        descriptionId="delete-promotion-description"
        closeOnBackdrop={false}
        showCloseButton={false}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeDeleteDialog} disabled={deleting}>
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={() => promotionToDelete?.id && handleDeletePromotion(promotionToDelete.id)}
            >
              Hapus promosi
            </Button>
          </>
        }
      >
        <p id="delete-promotion-description" className="text-pretty text-sm text-ink-secondary">
          Promosi <strong className="text-ink">{promotionToDelete?.name}</strong> akan dihapus permanen.
          Tindakan ini tidak dapat dibatalkan.
        </p>
        {deleteError && (
          <p role="alert" className="mt-3 text-sm font-medium text-danger">
            {deleteError}
          </p>
        )}
      </Modal>
    </div>
  );
}

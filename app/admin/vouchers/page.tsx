'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { formatRupiah } from '@/src/lib/format';
import { getToken } from '@/src/lib/api';
import { Plus, Edit, Trash2, Calendar, Tag, Percent, DollarSign, Check, X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';

interface Voucher {
  id?: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'nominal' | 'percentage';
  discount_value: number;
  minimum_purchase: number;
  max_discount?: number;
  quota: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'nominal' as 'nominal' | 'percentage',
    discount_value: 0,
    minimum_purchase: 0,
    max_discount: 0,
    quota: 100,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_active: true,
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/vouchers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`Failed to fetch vouchers: ${response.status}`);
      }

      const allVouchers = await response.json();
      setVouchers(allVouchers);
    } catch (error) {
      console.error('Failed to load vouchers:', error);
      toast('error', 'Gagal memuat voucer');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.code || !formData.name) {
        toast('error', 'Kode dan nama voucer wajib diisi');
        return;
      }

      if (formData.discount_value <= 0) {
        toast('error', 'Nilai diskon harus lebih dari 0');
        return;
      }

      if (formData.quota <= 0) {
        toast('error', 'Kuota harus lebih dari 0');
        return;
      }

      const token = getToken();
      const url = editingVoucher ? `${API_BASE}/vouchers/${editingVoucher.id}` : `${API_BASE}/vouchers`;
      const method = editingVoucher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save voucher');
      }

      toast('success', editingVoucher ? 'Voucer berhasil diperbarui' : 'Voucer berhasil ditambahkan');
      setShowModal(false);
      setEditingVoucher(null);
      resetForm();
      loadVouchers();
    } catch (error) {
      console.error('Failed to save voucher:', error);
      toast('error', 'Gagal menyimpan voucer');
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      minimum_purchase: voucher.minimum_purchase,
      max_discount: voucher.max_discount || 0,
      quota: voucher.quota,
      valid_from: voucher.valid_from.split('T')[0],
      valid_until: voucher.valid_until.split('T')[0],
      is_active: voucher.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucer ini?')) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/vouchers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete voucher');
      }

      toast('success', 'Voucer berhasil dihapus');
      loadVouchers();
    } catch (error) {
      console.error('Failed to delete voucher:', error);
      toast('error', 'Gagal menghapus voucer');
    }
  };

  const handleToggleActive = async (voucher: Voucher) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/vouchers/${voucher.id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle voucher status');
      }

      toast('success', `Voucer ${voucher.is_active ? 'dinonaktifkan' : 'diaktifkan'}`);
      loadVouchers();
    } catch (error) {
      console.error('Failed to toggle voucher status:', error);
      toast('error', 'Gagal mengubah status voucer');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'nominal',
      discount_value: 0,
      minimum_purchase: 0,
      max_discount: 0,
      quota: 100,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const getUsagePercentage = (used: number, quota: number) => {
    return Math.round((used / quota) * 100);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Voucer</h1>
                <p className="text-gray-600 mt-1">Kelola voucer promo dan diskon untuk pelanggan</p>
              </div>
              <Button onClick={() => { resetForm(); setEditingVoucher(null); setShowModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Voucer
              </Button>
            </div>

            {/* Vouchers Grid */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">Memuat voucer...</div>
            ) : vouchers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Belum ada voucer. Klik "Tambah Voucer" untuk membuat voucer baru.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vouchers.map((voucher) => (
                  <div key={voucher.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{voucher.name}</h3>
                        <p className="text-sm text-gray-500 font-mono mt-1">{voucher.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(voucher)}
                          className={`p-2 rounded-lg transition-colors ${
                            voucher.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {voucher.is_active ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(voucher)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(voucher.id!)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {voucher.description && (
                      <p className="text-sm text-gray-600 mb-4">{voucher.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Diskon</span>
                        <span className="font-medium text-gray-900">
                          {voucher.discount_type === 'percentage' ? (
                            `${voucher.discount_value}%`
                          ) : (
                            formatRupiah(voucher.discount_value)
                          )}
                          {voucher.discount_type === 'percentage' && voucher.max_discount && voucher.max_discount > 0 && (
                            <span className="text-xs text-gray-500 ml-1">(max {formatRupiah(voucher.max_discount)})</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Min. Belanja</span>
                        <span className="font-medium text-gray-900">{formatRupiah(voucher.minimum_purchase)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Kuota</span>
                        <span className="font-medium text-gray-900">
                          {voucher.used_count} / {voucher.quota}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${getUsagePercentage(voucher.used_count, voucher.quota)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(voucher.valid_from).toLocaleDateString('id-ID')} - {new Date(voucher.valid_until).toLocaleDateString('id-ID')}</span>
                      </div>
                      {isExpired(voucher.valid_until) && (
                        <span className="text-red-500 font-medium">Kedaluwarsa</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-lg bg-white p-6 shadow-lg overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingVoucher ? 'Edit Voucer' : 'Tambah Voucer Baru'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Voucer *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: PROMO2024"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Voucer *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Diskon Akhir Tahun"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi voucer untuk pelanggan"
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'nominal' | 'percentage' })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    placeholder={formData.discount_type === 'percentage' ? '0 - 100' : '0'}
                    min="0"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {formData.discount_type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maksimal Diskon (Rp)</label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                    placeholder="0 untuk tanpa batas"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Belanja</label>
                  <input
                    type="number"
                    value={formData.minimum_purchase}
                    onChange={(e) => setFormData({ ...formData, minimum_purchase: Number(e.target.value) })}
                    placeholder="0 untuk tanpa minimum"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kuota Penggunaan</label>
                  <input
                    type="number"
                    value={formData.quota}
                    onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                    placeholder="Jumlah penggunaan maksimal"
                    min="1"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Berlaku Dari</label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Berlaku Sampai</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Voucer Aktif</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => { setShowModal(false); setEditingVoucher(null); resetForm(); }}
              >
                Batal
              </Button>
              <Button onClick={handleSave}>
                {editingVoucher ? 'Simpan Perubahan' : 'Buat Voucer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

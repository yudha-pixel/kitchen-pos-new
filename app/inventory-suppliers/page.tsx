'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/src/features/inventory/recipeApiService';
import { Building2, Plus, Edit, Trash2, X, Phone, Mail, MapPin, Search, User, Tag, CheckCircle, XCircle, Package, Clock } from 'lucide-react';

export default function SuppliersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageStatus, setPageStatus] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    pic_name: '',
    pic_mobile: '',
    category: '',
    moq_amount: '',
    moq_unit: '',
    payment_terms: 'net 30',
    performance_notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadSuppliers();
    }
  }, [user]);

  const loadSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedSupplier(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      pic_name: '',
      pic_mobile: '',
      category: '',
      moq_amount: '',
      moq_unit: '',
      payment_terms: 'net 30',
      performance_notes: '',
      is_active: true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      pic_name: supplier.pic_name || '',
      pic_mobile: supplier.pic_mobile || '',
      category: supplier.category || '',
      moq_amount: supplier.moq_amount ? String(supplier.moq_amount) : '',
      moq_unit: supplier.moq_unit || '',
      payment_terms: supplier.payment_terms || 'net 30',
      performance_notes: supplier.performance_notes || '',
      is_active: supplier.is_active !== undefined ? supplier.is_active : true,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeFormModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setFormError('');
  };

  const handleDelete = (supplier: any) => {
    setSelectedSupplier(supplier);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isSubmitting) return;
    setDeleteModalOpen(false);
    setDeleteError('');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      setFormError('Nama dan Kontak wajib diisi');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      if (selectedSupplier) {
        const result = await updateSupplier(selectedSupplier.id, formData);
        if (result.success) {
          setPageStatus('Supplier berhasil diperbarui');
          setModalOpen(false);
          await loadSuppliers();
        } else {
          setFormError(result.message);
        }
      } else {
        const id = await addSupplier(formData);
        if (id) {
          setPageStatus('Supplier berhasil ditambahkan');
          setModalOpen(false);
          await loadSuppliers();
        } else {
          setFormError('Gagal menyimpan supplier');
        }
      }
    } catch (error) {
      console.error('Failed to save supplier:', error);
      setFormError('Gagal menyimpan supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;

    setDeleteError('');
    setIsSubmitting(true);
    try {
      const result = await deleteSupplier(selectedSupplier.id);
      if (result.success) {
        setPageStatus('Supplier berhasil dihapus');
        setDeleteModalOpen(false);
        await loadSuppliers();
      } else {
        setDeleteError(result.message);
      }
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      setDeleteError('Gagal menghapus supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Supplier</h1>
                <p className="text-gray-600 mt-1">Kelola data supplier untuk pengadaan bahan baku</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Supplier
                </button>
              </div>
            </div>
            {pageStatus && (
              <p role="status" className="mb-4 text-sm font-medium text-green-700">
                {pageStatus}
              </p>
            )}

            {/* Suppliers Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 text-center text-gray-500">Memuat data...</div>
                ) : suppliers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Belum ada data supplier. Klik "Tambah Supplier" untuk menambahkan.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kontak Kantor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kontak PIC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori Suplai
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MOQ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Termin Pembayaran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                              <button
                                onClick={() => router.push(`/inventory-suppliers/${supplier.id}`)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline"
                              >
                                {supplier.name}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {supplier.is_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                Non-Aktif
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 text-gray-400 mr-1" />
                              {supplier.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {supplier.pic_name ? (
                                <div>
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-gray-400 mr-1" />
                                    <span className="font-medium">{supplier.pic_name}</span>
                                  </div>
                                  {supplier.pic_mobile && (
                                    <div className="text-xs text-gray-500 ml-5">{supplier.pic_mobile}</div>
                                  )}
                                </div>
                              ) : (
                                '-'
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {supplier.category ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Tag className="h-3 w-3 mr-1" />
                                {supplier.category}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {supplier.moq_amount ? (
                              <div className="flex items-center text-sm text-gray-900">
                                <Package className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="font-medium">{supplier.moq_amount}</span>
                                {supplier.moq_unit && <span className="text-gray-500 ml-1">{supplier.moq_unit}</span>}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {supplier.payment_terms ? (
                              <div className="flex items-center text-sm text-gray-900">
                                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="capitalize">{supplier.payment_terms}</span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(supplier)}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(supplier)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Hapus
                              </button>
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                {selectedSupplier ? 'Edit Supplier' : 'Tambah Supplier'}
              </h2>
              <button
                onClick={closeFormModal}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 rounded-lg disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Supplier *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama supplier"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak/Telepon *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan email (opsional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan alamat (opsional)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama PIC</label>
                  <input
                    type="text"
                    value={formData.pic_name}
                    onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama staf sales/PIC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. HP PIC</label>
                  <input
                    type="text"
                    value={formData.pic_mobile}
                    onChange={(e) => setFormData({ ...formData, pic_mobile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="WhatsApp/HP pribadi"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Suplai</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih kategori...</option>
                  <option value="Dairy & Cheese">Dairy & Cheese</option>
                  <option value="Meat">Meat</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Dry Goods">Dry Goods</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MOQ (Minimal Pembelian)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.moq_amount}
                    onChange={(e) => setFormData({ ...formData, moq_amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nominal minimum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Satuan MOQ</label>
                  <select
                    value={formData.moq_unit}
                    onChange={(e) => setFormData({ ...formData, moq_unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih satuan...</option>
                    <option value="Rp">Rp (Rupiah)</option>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="liter">liter</option>
                    <option value="box">box</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Termin Pembayaran</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cod">COD (Cash on Delivery)</option>
                  <option value="net 7">Tempo 7 Hari</option>
                  <option value="net 14">Tempo 14 Hari</option>
                  <option value="net 30">Tempo 30 Hari</option>
                  <option value="net 45">Tempo 45 Hari</option>
                  <option value="net 60">Tempo 60 Hari</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Status Vendor Aktif</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Non-aktif jika vendor tidak lagi bekerja sama</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Kinerja Vendor</label>
                <textarea
                  value={formData.performance_notes}
                  onChange={(e) => setFormData({ ...formData, performance_notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Catatan mengenai ketepatan waktu pengiriman, kualitas barang, dll."
                />
                <p className="text-xs text-gray-500 mt-1">Opsional: untuk evaluasi kerja sama ke depannya</p>
              </div>
              {formError && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {formError}
                </p>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeFormModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-red-600">Hapus Supplier</h2>
              <button
                onClick={closeDeleteModal}
                disabled={isSubmitting}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 rounded-lg disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-700">
                Apakah Anda yakin ingin menghapus supplier <strong>{selectedSupplier.name}</strong>?
              </p>
              <p className="text-xs text-gray-500">
                Tindakan ini tidak dapat dibatalkan.
              </p>
              {deleteError && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {deleteError}
                </p>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeDeleteModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

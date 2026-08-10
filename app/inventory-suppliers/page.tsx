'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/src/features/inventory/recipeApiService';
import { Building2, Plus, Edit, Trash2, X, Phone, Mail, MapPin } from 'lucide-react';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageStatus, setPageStatus] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

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

  const handleAdd = () => {
    setSelectedSupplier(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
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
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manajemen Supplier</h1>
                <p className="text-gray-600 mt-1">Kelola data supplier untuk pengadaan bahan baku</p>
              </div>
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Supplier
              </button>
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
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Alamat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {suppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 text-gray-400 mr-1" />
                              {supplier.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 text-gray-400 mr-1" />
                              {supplier.email || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start text-sm text-gray-900">
                              <MapPin className="h-4 w-4 text-gray-400 mr-1 mt-0.5" />
                              <div className="truncate max-w-xs">{supplier.address || '-'}</div>
                            </div>
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/src/features/inventory/recipeApiService';
import { Building2, Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { Button } from '@/src/components/ui/Button';

const fieldClass = 'w-full min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';

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

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
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
    <div className="flex h-screen bg-surface-alt">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-ink">Manajemen Supplier</h1>
                <p className="text-ink-secondary mt-1">Kelola data supplier untuk pengadaan bahan baku</p>
              </div>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Tambah Supplier
              </Button>
            </div>
            {pageStatus && (
              <p role="status" className="mb-4 text-sm font-medium text-success">
                {pageStatus}
              </p>
            )}

            {/* Suppliers Table */}
            <div className="bg-surface rounded-lg shadow border border-line">
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-6 text-center text-ink-secondary">Memuat data...</div>
                ) : suppliers.length === 0 ? (
                  <div className="p-6 text-center text-ink-secondary">
                    Belum ada data supplier. Klik "Tambah Supplier" untuk menambahkan.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-line">
                    <thead className="bg-surface-alt">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Nama Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Alamat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-line">
                      {suppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-surface-alt">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building2 className="h-5 w-5 text-ink-muted mr-2" />
                              <div className="text-sm font-medium text-ink">{supplier.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-ink">
                              <Phone className="h-4 w-4 text-ink-muted mr-1" />
                              {supplier.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-ink">
                              <Mail className="h-4 w-4 text-ink-muted mr-1" />
                              {supplier.email || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start text-sm text-ink">
                              <MapPin className="h-4 w-4 text-ink-muted mr-1 mt-0.5" />
                              <div className="truncate max-w-xs">{supplier.address || '-'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(supplier)}
                                className="text-primary hover:text-primary-hover text-sm font-medium flex items-center"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(supplier)}
                                className="text-danger hover:text-red-700 text-sm font-medium flex items-center"
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

      <Modal
        isOpen={modalOpen}
        onClose={closeFormModal}
        title={selectedSupplier ? 'Edit Supplier' : 'Tambah Supplier'}
        footer={
          <>
            <Button variant="secondary" onClick={closeFormModal} disabled={isSubmitting} className="flex-1">
              Batal
            </Button>
            <Button onClick={handleSubmit} loading={isSubmitting} className="flex-1">
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama Supplier *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={fieldClass}
              placeholder="Masukkan nama supplier"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Kontak/Telepon *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={fieldClass}
              placeholder="Masukkan nomor telepon"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={fieldClass}
              placeholder="Masukkan email (opsional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className={`${fieldClass} py-2`}
              placeholder="Masukkan alamat (opsional)"
            />
          </div>
          {formError && (
            <p role="alert" className="text-sm font-medium text-danger">
              {formError}
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Hapus Supplier"
        message={
          selectedSupplier
            ? `Apakah Anda yakin ingin menghapus supplier "${selectedSupplier.name}"? Tindakan ini tidak dapat dibatalkan.${deleteError ? ` ${deleteError}` : ''}`
            : ''
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        danger
        loading={isSubmitting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
}

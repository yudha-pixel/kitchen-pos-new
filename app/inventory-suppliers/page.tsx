'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '@/src/features/inventory/recipeApiService';
import { Building2, Plus, Edit, Trash2, Phone, Mail, Search, User, Tag, CheckCircle, XCircle } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';

const fieldClass = 'w-full min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';

const paymentTermsOptions = [
  { value: 'cod', label: 'COD (Cash on Delivery)' },
  { value: 'net 7', label: 'Tempo 7 Hari' },
  { value: 'net 14', label: 'Tempo 14 Hari' },
  { value: 'net 30', label: 'Tempo 30 Hari' },
  { value: 'net 45', label: 'Tempo 45 Hari' },
  { value: 'net 60', label: 'Tempo 60 Hari' },
];

const emptyForm = {
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
};

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

  const [formData, setFormData] = useState(emptyForm);

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

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const q = searchQuery.toLowerCase();
    return suppliers.filter((s) =>
      s.name?.toLowerCase().includes(q) ||
      s.pic_name?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
    );
  }, [suppliers, searchQuery]);

  const handleAdd = () => {
    setSelectedSupplier(null);
    setFormData(emptyForm);
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
      moq_amount: supplier.moq_amount != null ? String(supplier.moq_amount) : '',
      moq_unit: supplier.moq_unit || '',
      payment_terms: supplier.payment_terms || 'net 30',
      performance_notes: supplier.performance_notes || '',
      is_active: supplier.is_active !== false,
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

  const buildPayload = () => ({
    name: formData.name,
    phone: formData.phone,
    email: formData.email || undefined,
    address: formData.address || undefined,
    pic_name: formData.pic_name || null,
    pic_mobile: formData.pic_mobile || null,
    category: formData.category || null,
    moq_amount: formData.moq_amount ? Number(formData.moq_amount) : null,
    moq_unit: formData.moq_unit || null,
    payment_terms: formData.payment_terms || 'net 30',
    performance_notes: formData.performance_notes || null,
    is_active: formData.is_active,
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      setFormError('Nama dan Kontak wajib diisi');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      if (selectedSupplier) {
        const result = await updateSupplier(selectedSupplier.id, buildPayload());
        if (result.success) {
          setPageStatus('Supplier berhasil diperbarui');
          setModalOpen(false);
          await loadSuppliers();
        } else {
          setFormError(result.message);
        }
      } else {
        const id = await addSupplier(buildPayload());
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
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold text-ink">Manajemen Supplier</h1>
                <p className="text-ink-secondary mt-1">Kelola data supplier untuk pengadaan bahan baku</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Cari supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${fieldClass} w-64 pl-10`}
                  />
                </div>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4" />
                  Tambah Supplier
                </Button>
              </div>
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
                ) : filteredSuppliers.length === 0 ? (
                  <div className="p-6 text-center text-ink-secondary">
                    {suppliers.length === 0
                      ? 'Belum ada data supplier. Klik "Tambah Supplier" untuk menambahkan.'
                      : 'Tidak ada supplier yang cocok dengan pencarian.'}
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-line">
                    <thead className="bg-surface-alt">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Nama Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          PIC
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Termin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface divide-y divide-line">
                      {filteredSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-surface-alt">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building2 className="h-5 w-5 text-ink-muted mr-2 shrink-0" />
                              <button
                                onClick={() => router.push(`/inventory-suppliers/${supplier.id}`)}
                                className="text-sm font-medium text-primary hover:underline text-left"
                              >
                                {supplier.name}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {supplier.is_active !== false ? (
                              <Badge tone="success">
                                <CheckCircle className="h-3 w-3" /> Aktif
                              </Badge>
                            ) : (
                              <Badge tone="danger">
                                <XCircle className="h-3 w-3" /> Non-Aktif
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-ink">
                              <Phone className="h-4 w-4 text-ink-muted mr-1" />
                              {supplier.phone}
                            </div>
                            {supplier.email && (
                              <div className="mt-0.5 flex items-center text-xs text-ink-muted">
                                <Mail className="h-3.5 w-3.5 mr-1" />
                                {supplier.email}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                            {supplier.pic_name ? (
                              <div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-ink-muted mr-1" />
                                  {supplier.pic_name}
                                </div>
                                {supplier.pic_mobile && (
                                  <div className="text-xs text-ink-muted ml-5">{supplier.pic_mobile}</div>
                                )}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {supplier.category ? (
                              <Badge tone="info">
                                <Tag className="h-3 w-3" /> {supplier.category}
                              </Badge>
                            ) : (
                              <span className="text-sm text-ink-muted">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                            {paymentTermsOptions.find((o) => o.value === supplier.payment_terms)?.label || supplier.payment_terms || '-'}
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
        size="lg"
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
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-ink mb-1">Telepon Kantor *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={fieldClass}
                placeholder="Masukkan nomor telepon"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-ink mb-1">Kategori Suplai</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={fieldClass}
                placeholder="Contoh: Dairy & Cheese, Meat, dll."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className={`${fieldClass} py-2`}
              placeholder="Masukkan alamat (opsional)"
            />
          </div>

          <div className="border-t border-line pt-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Kontak PIC</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Nama PIC</label>
                <input
                  type="text"
                  value={formData.pic_name}
                  onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                  className={fieldClass}
                  placeholder="Nama contact person"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">No. HP/WhatsApp PIC</label>
                <input
                  type="text"
                  value={formData.pic_mobile}
                  onChange={(e) => setFormData({ ...formData, pic_mobile: e.target.value })}
                  className={fieldClass}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Syarat Suplai</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">MOQ</label>
                <input
                  type="number"
                  value={formData.moq_amount}
                  onChange={(e) => setFormData({ ...formData, moq_amount: e.target.value })}
                  className={fieldClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Satuan MOQ</label>
                <input
                  type="text"
                  value={formData.moq_unit}
                  onChange={(e) => setFormData({ ...formData, moq_unit: e.target.value })}
                  className={fieldClass}
                  placeholder="Rp, kg, pcs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Termin Pembayaran</label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className={fieldClass}
                >
                  {paymentTermsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Catatan Kinerja</label>
            <textarea
              value={formData.performance_notes}
              onChange={(e) => setFormData({ ...formData, performance_notes: e.target.value })}
              rows={2}
              className={`${fieldClass} py-2`}
              placeholder="Catatan kualitas, ketepatan waktu pengiriman, dll."
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded accent-[var(--primary)]"
            />
            Supplier aktif
          </label>

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

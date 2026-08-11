'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { Plus, Wallet, Download, Printer, AlertCircle } from 'lucide-react';
import { OCRUploadDropzone } from '@/src/components/finance/OCRUploadDropzone';
import { OCRReviewModal } from '@/src/components/finance/OCRReviewModal';
import { ExpenseTable } from '@/src/components/finance/ExpenseTable';
import { ReceiptPreviewModal } from '@/src/components/finance/ReceiptPreviewModal';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import {
  getAllExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  calculateTotalExpenses,
  getDefaultCategories,
  simulateOCR,
  exportExpensesToCSV,
  fileToBase64,
  Expense,
  OCRResult,
} from '@/src/features/finance/expenseService';

export default function FinancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProcessingError, setOcrProcessingError] = useState('');
  const [exportError, setExportError] = useState('');
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expenseFormError, setExpenseFormError] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [previewExpense, setPreviewExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    category: 'operasional',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash' as 'cash' | 'transfer' | 'card',
    supplier_name: '',
  });

  const categories = getDefaultCategories().map(cat => ({
    value: cat.name.toLowerCase().replace(/\s+/g, '_'),
    label: cat.name,
  }));

  // RBAC Protection
  if (user && user.role !== 'admin' && user.role !== 'management' && user.role !== 'owner') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">Halaman ini hanya dapat diakses oleh Owner, Management, dan Admin.</p>
          <button
            onClick={() => router.push('/inventory')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:text-white transition-colors"
          >
            Kembali ke Inventori
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = () => {
    setExpenseFormError('');
    setEditingExpense(null);
    setFormData({
      category: 'operasional',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      payment_method: 'cash',
      supplier_name: '',
    });
    setShowEditModal(true);
  };

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setIsProcessingOCR(true);
    setOcrProcessingError('');

    try {
      const result = await simulateOCR(file);
      setOcrResult(result);
      setShowOCRModal(true);
    } catch (error) {
      console.error('OCR processing failed:', error);
      setOcrProcessingError('Gagal memproses OCR. Periksa file lalu coba lagi.');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleOCRSave = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      let proofFile: string | undefined;
      let proofFileName: string | undefined;

      if (uploadedFile) {
        proofFile = await fileToBase64(uploadedFile);
        proofFileName = uploadedFile.name;
      }

      await addExpense(
        {
          ...expense,
          proof_file: proofFile,
          proof_file_name: proofFileName,
        },
        user?.id,
        (user as any)?.name
      );

      await loadExpenses();
      setUploadedFile(null);
      setOcrResult(null);
    } catch (error) {
      console.error('Failed to save expense:', error);
      throw error;
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseFormError('');
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date.split('T')[0],
      payment_method: expense.payment_method,
      supplier_name: expense.supplier_name || '',
    });
    setShowEditModal(true);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete?.id) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteExpense(expenseToDelete.id);
      await loadExpenses();
      setExpenseToDelete(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      setDeleteError('Gagal menghapus pengeluaran. Silakan coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setExpenseToDelete(null);
    setDeleteError('');
  };

  const handleSaveExpense = async () => {
    if (!formData.description || formData.amount <= 0) {
      setExpenseFormError('Deskripsi wajib diisi dan jumlah harus lebih dari nol.');
      return;
    }

    setExpenseFormError('');
    try {
      const expenseData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id!, expenseData);
      } else {
        await addExpense(expenseData, user?.id, (user as any)?.name);
      }

      await loadExpenses();
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save expense:', error);
      setExpenseFormError('Gagal menyimpan pengeluaran. Silakan coba lagi.');
    }
  };

  const handlePreview = (expense: Expense) => {
    setPreviewExpense(expense);
    setShowPreviewModal(true);
  };

  const handleExportCSV = async () => {
    setExportError('');
    try {
      await exportExpensesToCSV(expenses);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      setExportError('Gagal mengekspor CSV. Silakan coba lagi.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Finance & Expense</h1>
                <p className="text-gray-600 mt-1">Kelola pengeluaran operasional restoran</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddExpense}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 hover:text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Manual
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 hover:text-white transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:text-white transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  Cetak
                </button>
              </div>
            </div>
            {exportError && (
              <p role="alert" className="mb-4 text-sm font-medium text-red-600">
                {exportError}
              </p>
            )}

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Pengeluaran</p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatRupiah(totalExpenses)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {expenses.length} transaksi
                </div>
              </div>
            </div>

            {/* OCR Upload Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Faktur/Struk (OCR)</h2>
              <OCRUploadDropzone onFileSelect={handleFileSelect} isProcessing={isProcessingOCR} />
              {ocrProcessingError && (
                <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                  {ocrProcessingError}
                </p>
              )}
            </div>

            {/* Expenses Table */}
            <ExpenseTable
              expenses={expenses}
              categories={categories}
              onEdit={handleEditExpense}
              onDelete={(expense) => {
                setExpenseToDelete(expense);
                setDeleteError('');
              }}
              onPreview={handlePreview}
              loading={loading}
            />
          </div>
        </main>
      </div>

      {/* OCR Review Modal */}
      <OCRReviewModal
        isOpen={showOCRModal}
        onClose={() => {
          setShowOCRModal(false);
          setOcrResult(null);
          setUploadedFile(null);
        }}
        ocrResult={ocrResult}
        onSave={handleOCRSave}
        categories={categories}
      />

      {/* Edit Expense Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              {editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran Baru'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Supplier</label>
                <input
                  type="text"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama supplier (opsional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi pengeluaran"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Tunai</option>
                  <option value="transfer">Transfer</option>
                  <option value="card">Kartu</option>
                </select>
              </div>
            </div>
            {expenseFormError && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                {expenseFormError}
              </p>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setExpenseFormError('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-gray-900"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveExpense}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 hover:text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewExpense(null);
        }}
        expense={previewExpense}
      />

      <Modal
        isOpen={Boolean(expenseToDelete)}
        onClose={closeDeleteDialog}
        title="Hapus pengeluaran?"
        role="alertdialog"
        descriptionId="delete-expense-description"
        closeOnBackdrop={false}
        showCloseButton={false}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeDeleteDialog} disabled={deleting}>Batal</Button>
            <Button type="button" variant="danger" loading={deleting} onClick={handleDeleteExpense}>Hapus pengeluaran</Button>
          </>
        }
      >
        <p id="delete-expense-description" className="text-pretty text-sm text-ink-secondary">
          Pengeluaran <strong className="text-ink">{expenseToDelete?.description}</strong> akan dihapus permanen.
          Tindakan ini tidak dapat dibatalkan.
        </p>
        {deleteError && <p role="alert" className="mt-3 text-sm font-medium text-danger">{deleteError}</p>}
      </Modal>
    </div>
  );
}

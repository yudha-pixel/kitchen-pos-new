'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  X,
  Eye,
  DollarSign,
  Calendar,
  Building2,
  CreditCard,
  Plus
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { 
  SupplierPayment,
  getSupplierPayments,
  getSupplierPaymentsByStatus,
  createSupplierPayment,
  processSupplierPayment,
  cancelSupplierPayment,
  getInvoicesByStatus
} from '@/src/features/inventory/recipeApiService';

type PaymentStatus = 'all' | 'pending' | 'completed' | 'cancelled';

export default function SupplierPaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [payments, setPayments] = useState<SupplierPayment[]>([]);
  const [verifiedInvoices, setVerifiedInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<SupplierPayment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'check' | 'other'>('transfer');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      let data: SupplierPayment[];
      if (statusFilter === 'all') {
        data = await getSupplierPayments();
      } else {
        data = await getSupplierPaymentsByStatus(statusFilter as 'pending' | 'completed' | 'cancelled');
      }
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch supplier payments:', error);
      toast('error', 'Gagal memuat data pembayaran supplier');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchVerifiedInvoices = useCallback(async () => {
    try {
      const data = await getInvoicesByStatus('verified');
      setVerifiedInvoices(data);
    } catch (error) {
      console.error('Failed to fetch verified invoices:', error);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchVerifiedInvoices();
  }, [fetchVerifiedInvoices]);

  const handleViewDetails = (payment: SupplierPayment) => {
    setSelectedPayment(payment);
    setModalOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedPayment) return;
    
    setProcessing(true);
    try {
      const result = await processSupplierPayment(selectedPayment.id);
      if (result.success) {
        toast('success', 'Pembayaran supplier diproses');
        setModalOpen(false);
        setSelectedPayment(null);
        fetchPayments();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to process payment:', error);
      toast('error', 'Gagal memproses pembayaran supplier');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedPayment) return;
    
    setProcessing(true);
    try {
      const result = await cancelSupplierPayment(selectedPayment.id);
      if (result.success) {
        toast('success', 'Pembayaran supplier dibatalkan');
        setModalOpen(false);
        setSelectedPayment(null);
        fetchPayments();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      toast('error', 'Gagal membatalkan pembayaran supplier');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedInvoice) {
      toast('error', 'Pilih invoice terlebih dahulu');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast('error', 'Masukkan jumlah pembayaran yang valid');
      return;
    }

    setProcessing(true);
    try {
      const paymentId = await createSupplierPayment(
        selectedInvoice.id,
        paymentMethod,
        parseFloat(amount),
        referenceNumber || undefined,
        notes
      );
      toast('success', 'Pembayaran supplier berhasil dibuat');
      setCreateModalOpen(false);
      setSelectedInvoice(null);
      setPaymentMethod('transfer');
      setAmount('');
      setReferenceNumber('');
      setNotes('');
      fetchPayments();
    } catch (error) {
      console.error('Failed to create payment:', error);
      toast('error', 'Gagal membuat pembayaran supplier');
    } finally {
      setProcessing(false);
    }
  };

  // Filter payments based on search query
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.payment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoice?.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoice?.grn?.purchase_order?.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.reference_number && payment.reference_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (payment.notes && payment.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Selesai' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Dibatalkan' },
    };
    const { bg, text, icon: Icon, label } = config[status as keyof typeof config] || config.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const config = {
      cash: { bg: 'bg-green-100', text: 'text-green-700', label: 'Tunai' },
      transfer: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Transfer' },
      check: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Cek' },
      other: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Lainnya' },
    };
    const { bg, text, label } = config[method as keyof typeof config] || config.other;
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/inventory"
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Pembayaran Supplier</h1>
                <p className="text-sm text-slate-500">Kelola pembayaran ke supplier</p>
              </div>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Pembayaran
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nomor pembayaran, invoice, supplier, atau referensi..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <CreditCard className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Tidak ada data</p>
              <p className="text-sm">Belum ada pembayaran supplier yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nomor Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nomor Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{payment.payment_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {payment.invoice?.invoice_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{payment.invoice?.grn?.purchase_order?.supplier?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{formatCurrency(payment.amount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentMethodBadge(payment.payment_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {modalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Detail Pembayaran Supplier</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor Pembayaran</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedPayment.payment_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor Invoice</label>
                  <p className="mt-1 text-sm text-slate-600">{selectedPayment.invoice?.invoice_number || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier</label>
                  <p className="mt-1 text-sm text-slate-600">{selectedPayment.invoice?.grn?.purchase_order?.supplier?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Metode Pembayaran</label>
                  <div className="mt-1">{getPaymentMethodBadge(selectedPayment.payment_method)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Pembayaran</label>
                  <p className="mt-1 text-sm text-slate-600">{formatDate(selectedPayment.payment_date)}</p>
                </div>
                {selectedPayment.reference_number && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor Referensi</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedPayment.reference_number}</p>
                  </div>
                )}
                {selectedPayment.processed_at && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Diproses Oleh</label>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedPayment.processed_by_name} - {formatDate(selectedPayment.processed_at)}
                    </p>
                  </div>
                )}
                {selectedPayment.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              {selectedPayment.status === 'pending' ? (
                <>
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Batalkan'}
                  </button>
                  <button
                    onClick={handleProcess}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Proses Pembayaran'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Buat Pembayaran Supplier</h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Pilih Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedInvoice?.id || ''}
                  onChange={(e) => {
                    const invoice = verifiedInvoices.find(i => i.id === e.target.value);
                    setSelectedInvoice(invoice || null);
                    if (invoice) {
                      setAmount(invoice.total.toString());
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">Pilih invoice...</option>
                  {verifiedInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - {inv.grn?.purchase_order?.supplier?.name} - {formatCurrency(inv.total)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Metode Pembayaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'transfer' | 'check' | 'other')}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="transfer">Transfer Bank</option>
                  <option value="cash">Tunai</option>
                  <option value="check">Cek</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Masukkan jumlah pembayaran..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nomor Referensi (opsional)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Masukkan nomor referensi..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masukkan catatan untuk pembayaran..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setCreateModalOpen(false)}
                disabled={processing}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={processing || !selectedInvoice || !amount}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Memproses...' : 'Buat Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

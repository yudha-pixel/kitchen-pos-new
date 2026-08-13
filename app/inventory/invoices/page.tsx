'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
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
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import {
  Invoice,
  getInvoices,
  getInvoicesByStatus,
  createInvoice,
  verifyInvoice,
  cancelInvoice,
  getGoodsReceivedNotesByStatus
} from '@/src/features/inventory/recipeApiService';

type InvoiceStatus = 'all' | 'pending' | 'verified' | 'paid' | 'cancelled';

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [completedGRNs, setCompletedGRNs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<any>(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      let data: Invoice[];
      if (statusFilter === 'all') {
        data = await getInvoices();
      } else {
        data = await getInvoicesByStatus(statusFilter as 'pending' | 'verified' | 'paid' | 'cancelled');
      }
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast('error', 'Gagal memuat data invoice');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchCompletedGRNs = useCallback(async () => {
    try {
      const data = await getGoodsReceivedNotesByStatus('completed');
      setCompletedGRNs(data);
    } catch (error) {
      console.error('Failed to fetch completed GRNs:', error);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchCompletedGRNs();
  }, [fetchCompletedGRNs]);

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalOpen(true);
  };

  const handleVerify = async () => {
    if (!selectedInvoice) return;
    
    setProcessing(true);
    try {
      const result = await verifyInvoice(selectedInvoice.id);
      if (result.success) {
        toast('success', 'Invoice diverifikasi');
        setModalOpen(false);
        setSelectedInvoice(null);
        fetchInvoices();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to verify invoice:', error);
      toast('error', 'Gagal memverifikasi invoice');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedInvoice) return;
    
    setProcessing(true);
    try {
      const result = await cancelInvoice(selectedInvoice.id);
      if (result.success) {
        toast('success', 'Invoice dibatalkan');
        setModalOpen(false);
        setSelectedInvoice(null);
        fetchInvoices();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to cancel invoice:', error);
      toast('error', 'Gagal membatalkan invoice');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedGRN) {
      toast('error', 'Pilih goods received note terlebih dahulu');
      return;
    }

    setProcessing(true);
    try {
      const invoiceId = await createInvoice(selectedGRN.id, dueDate || undefined, notes);
      toast('success', 'Invoice berhasil dibuat');
      setCreateModalOpen(false);
      setSelectedGRN(null);
      setDueDate('');
      setNotes('');
      fetchInvoices();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast('error', 'Gagal membuat invoice');
    } finally {
      setProcessing(false);
    }
  };

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(invoice => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (invoice.invoice_number || '').toLowerCase().includes(q) ||
      (invoice.grn?.grn_number || '').toLowerCase().includes(q) ||
      (invoice.grn?.purchase_order?.supplier?.name || '').toLowerCase().includes(q) ||
      (invoice.notes || '').toLowerCase().includes(q);
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      verified: { bg: 'bg-blue-100', text: 'text-blue-700', icon: ShieldCheck, label: 'Diverifikasi' },
      paid: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Dibayar' },
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
    <ResponsiveShell title="Invoices">
    <div className="min-h-full bg-background -m-4 sm:-m-6">
      {/* Header */}
      <div className="bg-surface border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-ink">Invoice Supplier</h1>
              <p className="text-sm text-ink-muted">Kelola invoice dari supplier</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-surface rounded-lg shadow-sm border border-line p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nomor invoice, GRN, supplier, atau catatan..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus)}
              className="px-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Diverifikasi</option>
              <option value="paid">Dibayar</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 rounded-lg border border-line text-sm text-ink-secondary hover:bg-surface-alt transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-surface rounded-lg shadow-sm border border-line overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-ink-muted">
              <FileText className="h-12 w-12 mb-4 text-ink-muted opacity-50" />
              <p className="text-lg font-medium text-ink">Tidak ada data</p>
              <p className="text-sm text-ink-muted">Belum ada invoice yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-alt border-b border-line">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Nomor Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Nomor GRN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-surface-alt transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-ink-muted" />
                          <span className="text-sm font-medium text-ink">{invoice.invoice_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-secondary">
                        {invoice.grn?.grn_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-ink-muted" />
                          <span className="text-sm text-ink-secondary">{invoice.grn?.purchase_order?.supplier?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-ink-muted" />
                          <span className="text-sm font-medium text-ink">{formatCurrency(invoice.total)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-secondary">
                        {formatDate(invoice.invoice_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary-soft transition-colors"
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
      {modalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-line">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-lg font-bold text-ink">Detail Invoice</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
              >
                <X className="h-5 w-5 text-ink-muted" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Nomor Invoice</label>
                  <p className="mt-1 text-sm font-medium text-ink">{selectedInvoice.invoice_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Nomor GRN</label>
                  <p className="mt-1 text-sm text-ink-secondary">{selectedInvoice.grn?.grn_number || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Supplier</label>
                  <p className="mt-1 text-sm text-ink-secondary">{selectedInvoice.grn?.purchase_order?.supplier?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Tanggal Invoice</label>
                  <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedInvoice.invoice_date)}</p>
                </div>
                {selectedInvoice.due_date && (
                  <div>
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Jatuh Tempo</label>
                    <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedInvoice.due_date)}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Subtotal</label>
                  <p className="mt-1 text-sm text-ink-secondary">{formatCurrency(selectedInvoice.subtotal)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Pajak</label>
                  <p className="mt-1 text-sm text-ink-secondary">{formatCurrency(selectedInvoice.tax)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Total</label>
                  <p className="mt-1 text-lg font-bold text-ink">{formatCurrency(selectedInvoice.total)}</p>
                </div>
                {selectedInvoice.verified_at && (
                  <div>
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Diverifikasi Oleh</label>
                    <p className="mt-1 text-sm text-ink-secondary">
                      {selectedInvoice.verified_by_name} - {formatDate(selectedInvoice.verified_at)}
                    </p>
                  </div>
                )}
                {selectedInvoice.paid_at && (
                  <div>
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Dibayar</label>
                    <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedInvoice.paid_at)}</p>
                  </div>
                )}
                {selectedInvoice.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-ink-secondary">{selectedInvoice.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-line">
              {selectedInvoice.status === 'pending' ? (
                <>
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg border border-line text-sm font-medium text-ink-secondary hover:bg-surface-alt transition-colors disabled:opacity-50"
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
                    onClick={handleVerify}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Verifikasi'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-hover transition-colors"
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
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-line">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-lg font-bold text-ink">Buat Invoice</h2>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
              >
                <X className="h-5 w-5 text-ink-muted" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Pilih Goods Received Note <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedGRN?.id || ''}
                  onChange={(e) => {
                    const grn = completedGRNs.find(g => g.id === e.target.value);
                    setSelectedGRN(grn || null);
                  }}
                  className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Pilih goods received note...</option>
                  {completedGRNs.map((grn) => (
                    <option key={grn.id} value={grn.id}>
                      {grn.grn_number} - {grn.purchase_order?.supplier?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Tanggal Jatuh Tempo (opsional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masukkan catatan untuk invoice..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-line">
              <button
                onClick={() => setCreateModalOpen(false)}
                disabled={processing}
                className="px-4 py-2 rounded-lg border border-line text-sm font-medium text-ink-secondary hover:bg-surface-alt transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={processing || !selectedGRN}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Memproses...' : 'Buat Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ResponsiveShell>
  );
}

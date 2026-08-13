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
  Send,
  FileCheck,
  Plus
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import {
  PurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrdersByStatus,
  createPurchaseOrder,
  reviewPurchaseOrder,
  sendPurchaseOrder,
  cancelPurchaseOrder,
  getAllQuotations
} from '@/src/features/inventory/recipeApiService';

type POStatus = 'all' | 'draft' | 'reviewed' | 'sent' | 'acknowledged' | 'cancelled';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [selectedQuotations, setSelectedQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [notes, setNotes] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<POStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      let data: PurchaseOrder[];
      if (statusFilter === 'all') {
        data = await getPurchaseOrders();
      } else {
        data = await getPurchaseOrdersByStatus(statusFilter as 'draft' | 'reviewed' | 'sent' | 'acknowledged' | 'cancelled');
      }
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
      toast('error', 'Gagal memuat data purchase order');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchSelectedQuotations = useCallback(async () => {
    try {
      const allQuotations = await getAllQuotations();
      const selected = allQuotations.filter(q => q.status === 'selected');
      setSelectedQuotations(selected);
    } catch (error) {
      console.error('Failed to fetch selected quotations:', error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchSelectedQuotations();
  }, [fetchSelectedQuotations]);

  const handleViewDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleReview = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      const result = await reviewPurchaseOrder(selectedOrder.id, notes);
      if (result.success) {
        toast('success', 'Purchase order direview');
        setModalOpen(false);
        setSelectedOrder(null);
        setNotes('');
        fetchOrders();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to review order:', error);
      toast('error', 'Gagal mereview purchase order');
    } finally {
      setProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      const result = await sendPurchaseOrder(selectedOrder.id);
      if (result.success) {
        toast('success', 'Purchase order dikirim ke supplier');
        setModalOpen(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to send order:', error);
      toast('error', 'Gagal mengirim purchase order');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      const result = await cancelPurchaseOrder(selectedOrder.id);
      if (result.success) {
        toast('success', 'Purchase order dibatalkan');
        setModalOpen(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast('error', 'Gagal membatalkan purchase order');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedQuotation) {
      toast('error', 'Pilih penawaran terlebih dahulu');
      return;
    }

    setProcessing(true);
    try {
      const orderId = await createPurchaseOrder(selectedQuotation.id, notes);
      toast('success', 'Purchase order berhasil dibuat');
      setCreateModalOpen(false);
      setSelectedQuotation(null);
      setNotes('');
      fetchOrders();
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      toast('error', 'Gagal membuat purchase order');
    } finally {
      setProcessing(false);
    }
  };

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (order.po_number || '').toLowerCase().includes(q) ||
      (order.supplier?.name || '').toLowerCase().includes(q) ||
      (order.notes || '').toLowerCase().includes(q);
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText, label: 'Draft' },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FileCheck, label: 'Direview' },
      sent: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Send, label: 'Terkirim' },
      acknowledged: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Diakui' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Dibatalkan' },
    };
    const { bg, text, icon: Icon, label } = config[status as keyof typeof config] || config.draft;
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
    <ResponsiveShell title="Purchase Order">
    <div className="min-h-full bg-background -m-4 sm:-m-6">
      {/* Header */}
      <div className="bg-surface border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-ink">Purchase Order</h1>
              <p className="text-sm text-ink-muted">Kelola purchase order ke supplier</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat PO
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
                placeholder="Cari berdasarkan nomor PO, supplier, atau catatan..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as POStatus)}
              className="px-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="reviewed">Direview</option>
              <option value="sent">Terkirim</option>
              <option value="acknowledged">Diakui</option>
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

        {/* Orders Table */}
        <div className="bg-surface rounded-lg shadow-sm border border-line overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-ink-muted">
              <FileText className="h-12 w-12 mb-4 text-ink-muted opacity-50" />
              <p className="text-lg font-medium text-ink">Tidak ada data</p>
              <p className="text-sm text-ink-muted">Belum ada purchase order yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-alt border-b border-line">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Nomor PO
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
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-alt transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-ink-muted" />
                          <span className="text-sm font-medium text-ink">{order.po_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-ink-muted" />
                          <span className="text-sm text-ink-secondary">{order.supplier?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-ink-muted" />
                          <span className="text-sm font-medium text-ink">{formatCurrency(order.total)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-secondary">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(order)}
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
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-line">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-lg font-bold text-ink">Detail Purchase Order</h2>
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
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Nomor PO</label>
                  <p className="mt-1 text-sm font-medium text-ink">{selectedOrder.po_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Supplier</label>
                  <p className="mt-1 text-sm font-medium text-ink">{selectedOrder.supplier?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Tanggal</label>
                  <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Subtotal</label>
                  <p className="mt-1 text-sm text-ink-secondary">{formatCurrency(selectedOrder.subtotal)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Pajak</label>
                  <p className="mt-1 text-sm text-ink-secondary">{formatCurrency(selectedOrder.tax)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Total</label>
                  <p className="mt-1 text-lg font-bold text-ink">{formatCurrency(selectedOrder.total)}</p>
                </div>
                {selectedOrder.reviewed_at && (
                  <div>
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Direview Oleh</label>
                    <p className="mt-1 text-sm text-ink-secondary">
                      {selectedOrder.reviewed_by_name} - {formatDate(selectedOrder.reviewed_at)}
                    </p>
                  </div>
                )}
                {selectedOrder.sent_at && (
                  <div>
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Terkirim</label>
                    <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedOrder.sent_at)}</p>
                  </div>
                )}
                {selectedOrder.acknowledged_at && (
                  <div>
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Diakui</label>
                    <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedOrder.acknowledged_at)}</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-ink-secondary">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Items</label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm border-b border-line pb-2">
                        <span className="text-ink-secondary">{item.ingredient_name}</span>
                        <span className="text-ink">
                          {item.quantity} {item.unit} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-line">
              {selectedOrder.status === 'draft' ? (
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
                    onClick={handleReview}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Review'}
                  </button>
                </>
              ) : selectedOrder.status === 'reviewed' ? (
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
                    onClick={handleSend}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Kirim ke Supplier'}
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
              <h2 className="text-lg font-bold text-ink">Buat Purchase Order</h2>
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
                  Pilih Penawaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedQuotation?.id || ''}
                  onChange={(e) => {
                    const quotation = selectedQuotations.find(q => q.id === e.target.value);
                    setSelectedQuotation(quotation || null);
                  }}
                  className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Pilih penawaran...</option>
                  {selectedQuotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.supplier?.name} - {formatCurrency(q.quoted_price)}/{q.quoted_unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masukkan catatan untuk purchase order..."
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
                disabled={processing || !selectedQuotation}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Memproses...' : 'Buat PO'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ResponsiveShell>
  );
}

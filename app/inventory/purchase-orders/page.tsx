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
    const matchesSearch = 
      order.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.notes && order.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
    <div className="min-h-full bg-slate-50 -m-4 sm:-m-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Purchase Order</h1>
              <p className="text-sm text-slate-500">Kelola purchase order ke supplier</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nomor PO, supplier, atau catatan..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as POStatus)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <FileText className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Tidak ada data</p>
              <p className="text-sm">Belum ada purchase order yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nomor PO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Total
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
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{order.po_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{order.supplier?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{formatCurrency(order.total)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(order)}
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
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Detail Purchase Order</h2>
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
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor PO</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedOrder.po_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedOrder.supplier?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</label>
                  <p className="mt-1 text-sm text-slate-600">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Subtotal</label>
                  <p className="mt-1 text-sm text-slate-600">{formatCurrency(selectedOrder.subtotal)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pajak</label>
                  <p className="mt-1 text-sm text-slate-600">{formatCurrency(selectedOrder.tax)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</label>
                  <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(selectedOrder.total)}</p>
                </div>
                {selectedOrder.reviewed_at && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Direview Oleh</label>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedOrder.reviewed_by_name} - {formatDate(selectedOrder.reviewed_at)}
                    </p>
                  </div>
                )}
                {selectedOrder.sent_at && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Terkirim</label>
                    <p className="mt-1 text-sm text-slate-600">{formatDate(selectedOrder.sent_at)}</p>
                  </div>
                )}
                {selectedOrder.acknowledged_at && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Diakui</label>
                    <p className="mt-1 text-sm text-slate-600">{formatDate(selectedOrder.acknowledged_at)}</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Items</label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                        <span className="text-slate-600">{item.ingredient_name}</span>
                        <span className="text-slate-900">
                          {item.quantity} {item.unit} × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              {selectedOrder.status === 'draft' ? (
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
              <h2 className="text-lg font-bold text-slate-900">Buat Purchase Order</h2>
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
                  Pilih Penawaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedQuotation?.id || ''}
                  onChange={(e) => {
                    const quotation = selectedQuotations.find(q => q.id === e.target.value);
                    setSelectedQuotation(quotation || null);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masukkan catatan untuk purchase order..."
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
                disabled={processing || !selectedQuotation}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  X,
  Eye,
  Plus,
  Send
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import {
  QuotationRequest,
  getQuotationRequests,
  getQuotationRequestsByStatus,
  createQuotationRequest,
  closeQuotationRequest,
  cancelQuotationRequest,
  getStockRequestsByStatus
} from '@/src/features/inventory/recipeApiService';

type RequestStatus = 'all' | 'open' | 'closed' | 'cancelled';

export default function QuotationRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [approvedStockRequests, setApprovedStockRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<QuotationRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedStockRequest, setSelectedStockRequest] = useState<any>(null);
  const [notes, setNotes] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<RequestStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      let data: QuotationRequest[];
      if (statusFilter === 'all') {
        data = await getQuotationRequests();
      } else {
        data = await getQuotationRequestsByStatus(statusFilter as 'open' | 'closed' | 'cancelled');
      }
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch quotation requests:', error);
      toast('error', 'Gagal memuat data permintaan penawaran');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchApprovedStockRequests = useCallback(async () => {
    try {
      const data = await getStockRequestsByStatus('approved');
      setApprovedStockRequests(data);
    } catch (error) {
      console.error('Failed to fetch approved stock requests:', error);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchApprovedStockRequests();
  }, [fetchApprovedStockRequests]);

  const handleViewDetails = (request: QuotationRequest) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const handleClose = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const result = await closeQuotationRequest(selectedRequest.id);
      if (result.success) {
        toast('success', 'Permintaan penawaran ditutup');
        setModalOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to close request:', error);
      toast('error', 'Gagal menutup permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const result = await cancelQuotationRequest(selectedRequest.id);
      if (result.success) {
        toast('success', 'Permintaan penawaran dibatalkan');
        setModalOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to cancel request:', error);
      toast('error', 'Gagal membatalkan permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedStockRequest) {
      toast('error', 'Pilih permintaan stok terlebih dahulu');
      return;
    }

    setProcessing(true);
    try {
      const requestId = await createQuotationRequest(selectedStockRequest.id, notes);
      toast('success', 'Permintaan penawaran berhasil dibuat');
      setCreateModalOpen(false);
      setSelectedStockRequest(null);
      setNotes('');
      fetchRequests();
    } catch (error) {
      console.error('Failed to create quotation request:', error);
      toast('error', 'Gagal membuat permintaan penawaran');
    } finally {
      setProcessing(false);
    }
  };

  // Filter requests based on search query
  const filteredRequests = requests.filter(request => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (request.stock_request?.ingredient_name || '').toLowerCase().includes(q) ||
      (request.notes || '').toLowerCase().includes(q);
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      open: { bg: 'bg-green-100', text: 'text-green-700', icon: Clock, label: 'Terbuka' },
      closed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle, label: 'Ditutup' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Dibatalkan' },
    };
    const { bg, text, icon: Icon, label } = config[status as keyof typeof config] || config.open;
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

  return (
    <ResponsiveShell title="Quotation Requests">
    <div className="min-h-full bg-background -m-4 sm:-m-6">
      {/* Header */}
      <div className="bg-surface border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-ink">Permintaan Penawaran</h1>
              <p className="text-sm text-ink-muted">Kelola permintaan penawaran ke supplier</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Permintaan
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
                placeholder="Cari berdasarkan nama item atau catatan..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus)}
              className="px-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="all">Semua Status</option>
              <option value="open">Terbuka</option>
              <option value="closed">Ditutup</option>
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

        {/* Requests Table */}
        <div className="bg-surface rounded-lg shadow-sm border border-line overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-ink-muted">
              <FileText className="h-12 w-12 mb-4 text-ink-muted opacity-50" />
              <p className="text-lg font-medium text-ink">Tidak ada data</p>
              <p className="text-sm text-ink-muted">Belum ada permintaan penawaran yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-alt border-b border-line">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                      Catatan
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
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-surface-alt transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-secondary">
                        {formatDate(request.sent_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-ink-muted" />
                          <span className="text-sm font-medium text-ink">
                            {request.stock_request?.ingredient_name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-secondary">
                        {request.stock_request ? (
                          <span className="font-medium text-ink">{request.stock_request.quantity_requested}</span> + ' ' + request.stock_request.unit
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-secondary">
                        {request.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(request)}
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
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto border border-line">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-line">
              <h2 className="text-lg font-bold text-ink">Detail Permintaan Penawaran</h2>
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
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Item</label>
                  <p className="mt-1 text-sm font-medium text-ink">{selectedRequest.stock_request?.ingredient_name || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Jumlah</label>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {selectedRequest.stock_request?.quantity_requested || 0} {selectedRequest.stock_request?.unit || ''}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Tanggal Kirim</label>
                  <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedRequest.sent_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                {selectedRequest.closed_at && (
                  <div>
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Tanggal Tutup</label>
                    <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedRequest.closed_at)}</p>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-ink-secondary">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>

              {/* Quotations Count */}
              <div className="col-span-2">
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Jumlah Penawaran Diterima</label>
                <p className="mt-1 text-sm font-medium text-ink">
                  {selectedRequest.quotations?.length || 0} penawaran
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-line">
              {selectedRequest.status === 'open' ? (
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
                    onClick={handleClose}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Tutup'}
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
              <h2 className="text-lg font-bold text-ink">Buat Permintaan Penawaran</h2>
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
                  Pilih Permintaan Stok <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStockRequest?.id || ''}
                  onChange={(e) => {
                    const request = approvedStockRequests.find(r => r.id === e.target.value);
                    setSelectedStockRequest(request || null);
                  }}
                  className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Pilih permintaan stok...</option>
                  {approvedStockRequests.map((sr) => (
                    <option key={sr.id} value={sr.id}>
                      {sr.ingredient_name} - {sr.quantity_requested} {sr.unit}
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
                  placeholder="Masukkan catatan untuk supplier..."
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
                disabled={processing || !selectedStockRequest}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Memproses...' : 'Buat Permintaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ResponsiveShell>
  );
}

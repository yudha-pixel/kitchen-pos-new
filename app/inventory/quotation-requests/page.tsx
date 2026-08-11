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
    const matchesSearch = 
      request.stock_request?.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.notes && request.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
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
    <div className="min-h-full bg-slate-50 -m-4 sm:-m-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Permintaan Penawaran</h1>
              <p className="text-sm text-slate-500">Kelola permintaan penawaran ke supplier</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama item atau catatan..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RequestStatus)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <FileText className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Tidak ada data</p>
              <p className="text-sm">Belum ada permintaan penawaran yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Catatan
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
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(request.sent_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">
                            {request.stock_request?.ingredient_name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {request.stock_request ? (
                          <span className="font-medium">{request.stock_request.quantity_requested}</span> + ' ' + request.stock_request.unit
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {request.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(request)}
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
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Detail Permintaan Penawaran</h2>
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
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Item</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedRequest.stock_request?.ingredient_name || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedRequest.stock_request?.quantity_requested || 0} {selectedRequest.stock_request?.unit || ''}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Kirim</label>
                  <p className="mt-1 text-sm text-slate-600">{formatDate(selectedRequest.sent_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                {selectedRequest.closed_at && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Tutup</label>
                    <p className="mt-1 text-sm text-slate-600">{formatDate(selectedRequest.closed_at)}</p>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>

              {/* Quotations Count */}
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah Penawaran Diterima</label>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {selectedRequest.quotations?.length || 0} penawaran
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              {selectedRequest.status === 'open' ? (
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
              <h2 className="text-lg font-bold text-slate-900">Buat Permintaan Penawaran</h2>
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
                  Pilih Permintaan Stok <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStockRequest?.id || ''}
                  onChange={(e) => {
                    const request = approvedStockRequests.find(r => r.id === e.target.value);
                    setSelectedStockRequest(request || null);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masukkan catatan untuk supplier..."
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
                disabled={processing || !selectedStockRequest}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

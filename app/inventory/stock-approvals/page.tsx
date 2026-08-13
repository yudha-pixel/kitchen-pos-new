'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package,
  FileText,
  X,
  Eye,
  Plus
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import {
  StockRequest,
  getStockRequests, 
  getStockRequestsByStatus,
  approveStockRequestSupervisor,
  approveStockRequestManager,
  approveStockRequestFinance,
  rejectStockRequest,
  recallStockRequest,
  cancelStockRequest,
  createStockRequest 
} from '@/src/features/inventory/recipeApiService';

type ApprovalStatus = 'all' | 'pending_supervisor' | 'pending_manager' | 'pending_finance' | 'approved' | 'rejected' | 'cancelled';

export default function StockApprovalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [showCreateTest, setShowCreateTest] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      let data: StockRequest[];
      if (statusFilter === 'all') {
        data = await getStockRequests();
      } else {
        data = await getStockRequestsByStatus(statusFilter as 'pending_supervisor' | 'pending_manager' | 'pending_finance' | 'approved' | 'rejected' | 'cancelled');
      }
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch stock requests:', error);
      toast('error', 'Gagal memuat data persetujuan stok');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleViewDetails = (request: StockRequest) => {
    setSelectedRequest(request);
    setModalOpen(true);
    setRejectionReason('');
    setApprovalNotes('');
  };

  const handleApprove = async (level: 'supervisor' | 'manager' | 'finance') => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      let result;
      if (level === 'supervisor') {
        result = await approveStockRequestSupervisor(selectedRequest.id, approvalNotes);
      } else if (level === 'manager') {
        result = await approveStockRequestManager(selectedRequest.id, approvalNotes);
      } else {
        result = await approveStockRequestFinance(selectedRequest.id, approvalNotes);
      }
      
      if (result.success) {
        toast('success', result.message);
        setModalOpen(false);
        setSelectedRequest(null);
        setApprovalNotes('');
        fetchRequests();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast('error', 'Gagal menyetujui permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    if (!rejectionReason.trim()) {
      toast('error', 'Mohon isi alasan penolakan');
      return;
    }
    
    setProcessing(true);
    try {
      const result = await rejectStockRequest(selectedRequest.id, rejectionReason);
      if (result.success) {
        toast('success', 'Permintaan stok ditolak');
        setModalOpen(false);
        setSelectedRequest(null);
        setRejectionReason('');
        fetchRequests();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast('error', 'Gagal menolak permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const handleRecall = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const result = await recallStockRequest(selectedRequest.id);
      if (result.success) {
        toast('success', 'Permintaan stok ditarik kembali');
        setModalOpen(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to recall request:', error);
      toast('error', 'Gagal menarik kembali permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const result = await cancelStockRequest(selectedRequest.id);
      if (result.success) {
        toast('success', 'Permintaan stok dibatalkan');
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

  const handleCreateTestRequest = async () => {
    if (!user?.id) {
      toast('error', 'Anda harus login untuk membuat permintaan');
      return;
    }

    setProcessing(true);
    try {
      // Fetch ingredients from the API to get valid PostgreSQL IDs
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients from API');
      }
      
      const ingredients = await response.json();
      
      if (!ingredients || ingredients.length === 0) {
        toast('error', 'Tidak ada ingredient di database. Silakan tambahkan ingredient terlebih dahulu.');
        return;
      }
      
      // Use the first available ingredient from PostgreSQL
      const ingredient = ingredients[0];
      
      // Create a test stock request with valid ingredient ID
      const requestId = await createStockRequest({
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        quantity_requested: 10,
        unit: ingredient.unit,
        notes: 'Permintaan stok test untuk persediaan',
        supplier_id: ingredient.supplier_id,
      });
      toast('success', 'Permintaan stok test berhasil dibuat');
      fetchRequests();
    } catch (error) {
      console.error('Failed to create test request:', error);
      toast('error', 'Gagal membuat permintaan test: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  // Filter requests based on search query and date range
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.requested_by_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.supplier_name && request.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDateFrom = !dateFrom || new Date(request.requested_at) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(request.requested_at) <= new Date(dateTo);
    
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending_supervisor: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Pending Supervisor' },
      pending_manager: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Clock, label: 'Pending Manager' },
      pending_finance: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock, label: 'Pending Finance' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Ditolak' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Dibatalkan' },
    };
    const { bg, text, icon: Icon, label } = config[status as keyof typeof config] || config.pending_supervisor;
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
    <ResponsiveShell title="Stock Approvals">
    <div className="min-h-full bg-slate-50 -m-4 sm:-m-6">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Persetujuan Stok</h1>
              <p className="text-sm text-slate-500">Kelola permintaan dan transfer stok</p>
            </div>
            <button
              onClick={handleCreateTestRequest}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {processing ? 'Memproses...' : 'Buat Test Request'}
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
                placeholder="Cari berdasarkan nama item, staf, atau supplier..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApprovalStatus)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending_supervisor">Pending Supervisor</option>
              <option value="pending_manager">Pending Manager</option>
              <option value="pending_finance">Pending Finance</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
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
              <Package className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Tidak ada data</p>
              <p className="text-sm">Belum ada permintaan stok yang ditemukan</p>
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
                      Pemohon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Supplier
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
                        {formatDate(request.requested_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">
                            {request.ingredient_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className="font-medium">{request.quantity_requested}</span> {request.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{request.requested_by_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {request.supplier_name || '-'}
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
              <h2 className="text-lg font-bold text-slate-900">Detail Permintaan Stok</h2>
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
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedRequest.ingredient_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedRequest.quantity_requested} {selectedRequest.unit}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pemohon</label>
                  <p className="mt-1 text-sm text-slate-600">{selectedRequest.requested_by_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal</label>
                  <p className="mt-1 text-sm text-slate-600">{formatDate(selectedRequest.requested_at)}</p>
                </div>
                {selectedRequest.supplier_name && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedRequest.supplier_name}</p>
                  </div>
                )}
                {selectedRequest.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedRequest.notes}</p>
                  </div>
                )}
                {selectedRequest.proof_file_name && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bukti Dokumen</label>
                    <div className="mt-1 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">{selectedRequest.proof_file_name}</span>
                    </div>
                  </div>
                )}
                {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Alasan Penolakan</label>
                    <p className="mt-1 text-sm text-red-600">{selectedRequest.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Approval History */}
              {(selectedRequest.supervisor_approved_at || selectedRequest.manager_approved_at || selectedRequest.finance_approved_at) && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Riwayat Persetujuan</label>
                  <div className="mt-2 space-y-2">
                    {selectedRequest.supervisor_approved_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-slate-600">
                          Supervisor: {selectedRequest.supervisor_name} - {formatDate(selectedRequest.supervisor_approved_at)}
                        </span>
                      </div>
                    )}
                    {selectedRequest.manager_approved_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-slate-600">
                          Manager: {selectedRequest.manager_name} - {formatDate(selectedRequest.manager_approved_at)}
                        </span>
                      </div>
                    )}
                    {selectedRequest.finance_approved_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-slate-600">
                          Finance Director: {selectedRequest.finance_name} - {formatDate(selectedRequest.finance_approved_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Approval Notes Input (for pending statuses) */}
              {(selectedRequest.status === 'pending_supervisor' || selectedRequest.status === 'pending_manager' || selectedRequest.status === 'pending_finance') && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Catatan Persetujuan (opsional)
                  </label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Masukkan catatan persetujuan..."
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Rejection Reason Input (for pending statuses) */}
              {(selectedRequest.status === 'pending_supervisor' || selectedRequest.status === 'pending_manager' || selectedRequest.status === 'pending_finance') && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan..."
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              {selectedRequest.status === 'pending_supervisor' ? (
                <>
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Tolak'}
                  </button>
                  <button
                    onClick={() => handleApprove('supervisor')}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Setujui (Supervisor)'}
                  </button>
                </>
              ) : selectedRequest.status === 'pending_manager' ? (
                <>
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Tolak'}
                  </button>
                  <button
                    onClick={() => handleApprove('manager')}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Setujui (Manager)'}
                  </button>
                </>
              ) : selectedRequest.status === 'pending_finance' ? (
                <>
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Tolak'}
                  </button>
                  <button
                    onClick={() => handleApprove('finance')}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Setujui (Finance)'}
                  </button>
                </>
              ) : selectedRequest.status === 'approved' || selectedRequest.status === 'rejected' || selectedRequest.status === 'cancelled' ? (
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                >
                  Tutup
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  {selectedRequest.requested_by === user?.id && (
                    <>
                      <button
                        onClick={handleRecall}
                        disabled={processing}
                        className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
                      >
                        {processing ? 'Memproses...' : 'Tarik Kembali'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={processing}
                        className="px-4 py-2 rounded-lg bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        {processing ? 'Memproses...' : 'Batalkan'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </ResponsiveShell>
  );
}

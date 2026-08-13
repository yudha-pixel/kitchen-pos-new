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
import { getToken } from '@/src/lib/api';
import {
  StockRequest,
  approveStockRequestSupervisor,
  approveStockRequestManager,
  approveStockRequestFinance,
  rejectStockRequest,
  recallStockRequest,
  cancelStockRequest,
  createStockRequest
} from '@/src/features/inventory/recipeApiService';

type ApprovalStatus = 'all' | 'pending_supervisor' | 'pending_finance' | 'approved' | 'rejected' | 'cancelled';

export default function StockApprovalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  
  // Bulk selection state
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Finance modal states
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [financeAccountCategory, setFinanceAccountCategory] = useState('Bahan Baku');
  const [financeNotes, setFinanceNotes] = useState('');
  
  // Create form states
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requestType, setRequestType] = useState('restock');
  const [destinationLocation, setDestinationLocation] = useState('');
  const [requesterRole, setRequesterRole] = useState('Kitchen Staff');
  const [notes, setNotes] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRequester, setFilterRequester] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }
      
      const url = `${API_BASE_URL}/api/stock-requests${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorBody);
        throw new Error(errorBody.error || `Failed to fetch stock requests (${response.status})`);
      }
      
      const data: StockRequest[] = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch stock requests:', error);
      toast('error', 'Gagal memuat data persetujuan stok');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFrom, dateTo, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fetch ingredients and outlets for create modal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        // Fetch ingredients
        const ingredientsResponse = await fetch(`${API_BASE_URL}/api/ingredients`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (ingredientsResponse.ok) {
          const data = await ingredientsResponse.json();
          setIngredients(data);
        }

        // Fetch outlets
        const outletsResponse = await fetch(`${API_BASE_URL}/api/outlets`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (outletsResponse.ok) {
          const data = await outletsResponse.json();
          setOutlets(data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

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

  const handleSendToFinance = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      // Approve as supervisor and directly send to finance (skip manager)
      const result = await approveStockRequestSupervisor(selectedRequest.id, approvalNotes);
      
      if (result.success) {
        // Update status to pending_finance and notes with finance information
        const token = getToken();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const updatedNotes = selectedRequest.notes 
          ? `${selectedRequest.notes}\n\nKategori Akun: ${financeAccountCategory}\nCatatan Finance: ${financeNotes}`
          : `Kategori Akun: ${financeAccountCategory}\nCatatan Finance: ${financeNotes}`;
        
        await fetch(`${API_BASE_URL}/api/stock-requests/${selectedRequest.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: 'pending_finance',
            approval_level: 3,
            notes: updatedNotes,
          }),
        });
        
        toast('success', 'Permintaan berhasil disetujui dan dikirim ke Finance');
        setFinanceModalOpen(false);
        setSelectedRequest(null);
        setApprovalNotes('');
        setFinanceAccountCategory('Bahan Baku');
        setFinanceNotes('');
        fetchRequests();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to send to finance:', error);
      toast('error', 'Gagal mengirim ke Finance');
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const pendingRequests = filteredRequests.filter(r => 
        r.status === 'pending_supervisor' || r.status === 'pending_finance'
      );
      setSelectedRequestIds(new Set(pendingRequests.map(r => r.id)));
    } else {
      setSelectedRequestIds(new Set());
    }
  };

  const handleSelectRequest = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRequestIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRequestIds(newSelected);
    setSelectAll(newSelected.size === filteredRequests.filter(r => 
      r.status === 'pending_supervisor' || r.status === 'pending_finance'
    ).length);
  };

  const handleBulkApprove = async () => {
    if (selectedRequestIds.size === 0) {
      toast('error', 'Pilih minimal satu permintaan');
      return;
    }
    
    setProcessing(true);
    try {
      const results = await Promise.all(
        Array.from(selectedRequestIds).map(id => approveStockRequestSupervisor(id, ''))
      );
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        toast('success', `${successCount} permintaan berhasil disetujui`);
      }
      if (failCount > 0) {
        toast('error', `${failCount} permintaan gagal disetujui`);
      }
      
      setSelectedRequestIds(new Set());
      setSelectAll(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to bulk approve:', error);
      toast('error', 'Gagal menyetujui permintaan massal');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequestIds.size === 0) {
      toast('error', 'Pilih minimal satu permintaan');
      return;
    }
    
    const reason = prompt('Masukkan alasan penolakan untuk semua permintaan terpilih:');
    if (!reason || !reason.trim()) {
      toast('error', 'Mohon isi alasan penolakan');
      return;
    }
    
    setProcessing(true);
    try {
      const results = await Promise.all(
        Array.from(selectedRequestIds).map(id => rejectStockRequest(id, reason))
      );
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        toast('success', `${successCount} permintaan berhasil ditolak`);
      }
      if (failCount > 0) {
        toast('error', `${failCount} permintaan gagal ditolak`);
      }
      
      setSelectedRequestIds(new Set());
      setSelectAll(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to bulk reject:', error);
      toast('error', 'Gagal menolak permintaan massal');
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

  const handleCreateRequest = async () => {
    if (!selectedIngredient || !quantity) {
      toast('error', 'Mohon pilih item dan isi jumlah');
      return;
    }

    const ingredient = ingredients.find((ing: any) => ing.id === selectedIngredient);
    if (!ingredient) {
      toast('error', 'Item tidak valid');
      return;
    }

    // Build notes with additional information
    let combinedNotes = notes || '';
    if (requestType || destinationLocation || requesterRole) {
      const additionalInfo = [];
      if (requestType) {
        const typeLabels = {
          restock: 'Restock',
          transfer: 'Transfer Antar Gudang',
          production: 'Keperluan Produksi',
        };
        additionalInfo.push(`Tipe: ${typeLabels[requestType as keyof typeof typeLabels] || requestType}`);
      }
      if (destinationLocation) {
        const outlet = outlets.find((o: any) => o.id === destinationLocation);
        additionalInfo.push(`Tujuan: ${outlet?.name || destinationLocation}`);
      }
      if (requesterRole) {
        additionalInfo.push(`Pengaju: ${requesterRole}`);
      }
      if (additionalInfo.length > 0) {
        combinedNotes = combinedNotes ? `${combinedNotes}\n\n${additionalInfo.join(' | ')}` : additionalInfo.join(' | ');
      }
    }

    setProcessing(true);
    try {
      const requestId = await createStockRequest({
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        quantity_requested: parseFloat(quantity),
        unit: ingredient.unit,
        notes: combinedNotes || undefined,
        supplier_id: ingredient.supplier_id || undefined,
      });
      toast('success', 'Permintaan stok berhasil dibuat');
      setCreateModalOpen(false);
      setSelectedIngredient('');
      setQuantity('');
      setRequestType('restock');
      setDestinationLocation('');
      setRequesterRole('Kitchen Staff');
      setNotes('');
      fetchRequests();
    } catch (error) {
      console.error('Failed to create request:', error);
      toast('error', 'Gagal membuat permintaan stok');
    } finally {
      setProcessing(false);
    }
  };

  // Filter requests based on search query and advanced filters (date filtering is done on server)
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.requested_by_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.supplier_name && request.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !filterCategory || request.ingredient_name.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesRequester = !filterRequester || request.requested_by_name.toLowerCase().includes(filterRequester.toLowerCase());
    const matchesSupplier = !filterSupplier || (request.supplier_name && request.supplier_name.toLowerCase().includes(filterSupplier.toLowerCase()));
    
    return matchesSearch && matchesCategory && matchesRequester && matchesSupplier;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending_supervisor: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Pending Persetujuan' },
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
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat Permintaan Stok
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
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
              <option value="pending_supervisor">Pending Persetujuan</option>
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
                setFilterCategory('');
                setFilterRequester('');
                setFilterSupplier('');
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>

            {/* Advanced Filter Button */}
            <button
              onClick={() => setAdvancedFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filter Lanjutan
            </button>
                </div>

                {/* Bulk Action Buttons */}
                {selectedRequestIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkApprove}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Setujui Terpilih ({selectedRequestIds.size})
                    </button>
                    <button
                      onClick={handleBulkReject}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Tolak Terpilih ({selectedRequestIds.size})
                    </button>
                  </div>
                )}
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
                    <th className="px-6 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </th>
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
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Estimasi Biaya
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(request.status === 'pending_supervisor' || request.status === 'pending_finance') && (
                          <input
                            type="checkbox"
                            checked={selectedRequestIds.has(request.id)}
                            onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                            className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                        )}
                      </td>
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
                        {request.supplier_name || (request.ingredient && (request.ingredient as any).supplier?.name) || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-700">
                        {request.ingredient && (request.ingredient as any).unit_price 
                          ? `Rp ${((request.ingredient as any).unit_price * request.quantity_requested).toLocaleString('id-ID')}`
                          : '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick Action Buttons for pending requests */}
                          {(request.status === 'pending_supervisor' || request.status === 'pending_finance') && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalNotes('');
                                  setRejectionReason('');
                                  handleApprove(request.status === 'pending_supervisor' ? 'supervisor' : 'finance');
                                }}
                                disabled={processing}
                                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
                                title="Setujui"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalNotes('');
                                  setRejectionReason('');
                                  setModalOpen(true);
                                }}
                                disabled={processing}
                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Tolak"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            Detail
                          </button>
                        </div>
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
                  <p className="mt-1 text-sm text-slate-600">
                    {(() => {
                      // Extract role from notes if available
                      const roleMatch = selectedRequest.notes?.match(/Pengaju:\s*(.+)/);
                      const role = roleMatch ? roleMatch[1] : null;
                      return role ? `${selectedRequest.requested_by_name} - ${role}` : selectedRequest.requested_by_name;
                    })()}
                  </p>
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
                {/* Estimated Cost - calculated from ingredient unit price */}
                {selectedRequest.ingredient && (selectedRequest.ingredient as any).unit_price && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estimasi Biaya</label>
                    <p className="mt-1 text-sm font-bold text-green-700">
                      Rp {((selectedRequest.ingredient as any).unit_price * selectedRequest.quantity_requested).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-slate-500">
                      Harga Satuan: Rp {((selectedRequest.ingredient as any).unit_price).toLocaleString('id-ID')} / {selectedRequest.unit}
                    </p>
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

              {/* Audit Trail - Riwayat Aksi */}
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Riwayat Aksi (Audit Trail)</label>
                <div className="mt-2 bg-slate-50 rounded-lg p-4 space-y-3">
                  {/* Request Created */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">Permintaan Dibuat</p>
                      <p className="text-xs text-slate-600">Oleh: {selectedRequest.requested_by_name}</p>
                      <p className="text-xs text-slate-500">{formatDate(selectedRequest.requested_at)}</p>
                    </div>
                  </div>

                  {/* Supervisor Approval */}
                  {selectedRequest.supervisor_approved_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Disetujui Supervisor</p>
                        <p className="text-xs text-slate-600">Oleh: {selectedRequest.supervisor_name}</p>
                        <p className="text-xs text-slate-500">{formatDate(selectedRequest.supervisor_approved_at)}</p>
                        {selectedRequest.supervisor_notes && (
                          <p className="text-xs text-slate-600 italic mt-1">Catatan: {selectedRequest.supervisor_notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Manager Approval */}
                  {selectedRequest.manager_approved_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Disetujui Manager</p>
                        <p className="text-xs text-slate-600">Oleh: {selectedRequest.manager_name}</p>
                        <p className="text-xs text-slate-500">{formatDate(selectedRequest.manager_approved_at)}</p>
                        {selectedRequest.manager_notes && (
                          <p className="text-xs text-slate-600 italic mt-1">Catatan: {selectedRequest.manager_notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Finance Approval */}
                  {selectedRequest.finance_approved_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Disetujui Finance Director</p>
                        <p className="text-xs text-slate-600">Oleh: {selectedRequest.finance_name}</p>
                        <p className="text-xs text-slate-500">{formatDate(selectedRequest.finance_approved_at)}</p>
                        {selectedRequest.finance_notes && (
                          <p className="text-xs text-slate-600 italic mt-1">Catatan: {selectedRequest.finance_notes}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rejection */}
                  {selectedRequest.status === 'rejected' && selectedRequest.rejected_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Ditolak</p>
                        <p className="text-xs text-slate-600">Oleh: {selectedRequest.rejected_by_name}</p>
                        <p className="text-xs text-slate-500">{formatDate(selectedRequest.rejected_at)}</p>
                        {selectedRequest.rejection_reason && (
                          <p className="text-xs text-red-600 italic mt-1">Alasan: {selectedRequest.rejection_reason}</p>
                        )}
                        {selectedRequest.rejection_level && (
                          <p className="text-xs text-slate-500 mt-1">Level: {selectedRequest.rejection_level}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cancelled */}
                  {selectedRequest.status === 'cancelled' && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Dibatalkan</p>
                        <p className="text-xs text-slate-600">Oleh: {selectedRequest.requested_by_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Notes Input (for pending statuses) */}
              {(selectedRequest.status === 'pending_supervisor' || selectedRequest.status === 'pending_finance') && (
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
              {(selectedRequest.status === 'pending_supervisor' || selectedRequest.status === 'pending_finance') && (
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
                    onClick={() => {
                      setModalOpen(false);
                      setFinanceModalOpen(true);
                    }}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Setujui & Kirim ke Finance'}
                  </button>
                  <button
                    onClick={() => handleApprove('supervisor')}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Setujui'}
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

      {/* Advanced Filter Modal */}
      {advancedFilterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Filter Lanjutan</h2>
              <button
                onClick={() => setAdvancedFilterOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori / Nama Item
                </label>
                <input
                  type="text"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  placeholder="Cari berdasarkan nama item..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Staf Pemohon
                </label>
                <input
                  type="text"
                  value={filterRequester}
                  onChange={(e) => setFilterRequester(e.target.value)}
                  placeholder="Cari berdasarkan nama staf..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                  placeholder="Cari berdasarkan nama supplier..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500">
                  Filter ini akan bekerja bersama dengan filter status dan tanggal yang sudah ada.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => {
                  setFilterCategory('');
                  setFilterRequester('');
                  setFilterSupplier('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Reset Filter
              </button>
              <button
                onClick={() => setAdvancedFilterOpen(false)}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send to Finance Modal */}
      {financeModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Kirim ke Finance</h2>
                <p className="text-xs text-slate-500 mt-1">Teruskan permintaan untuk persetujuan anggaran</p>
              </div>
              <button
                onClick={() => setFinanceModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-800">Ringkasan Permintaan</p>
                <div className="mt-2 space-y-1 text-sm text-orange-700">
                  <p>Item: {selectedRequest.ingredient_name}</p>
                  <p>Jumlah: {selectedRequest.quantity_requested} {selectedRequest.unit}</p>
                  <p>Pemohon: {selectedRequest.requested_by_name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori Akun
                </label>
                <select
                  value={financeAccountCategory}
                  onChange={(e) => setFinanceAccountCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Inventaris">Inventaris</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catatan untuk Finance
                </label>
                <textarea
                  value={financeNotes}
                  onChange={(e) => setFinanceNotes(e.target.value)}
                  placeholder="Masukkan instruksi tambahan untuk tim Finance..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600">
                  Setelah dikirim, status akan berubah menjadi "Pending Finance" dan permintaan akan masuk ke antrian persetujuan Finance Director.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setFinanceModalOpen(false)}
                disabled={processing}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleSendToFinance}
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Memproses...' : 'Kirim ke Finance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Stock Request Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Buat Permintaan Stok</h2>
                <p className="text-xs text-slate-500 mt-1">Permintaan Pembelian/Restock ke Manajemen & Supplier</p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                    Purchase Request
                  </span>
                  <span className="text-xs text-blue-600">Permintaan Pembelian Baru (Bukan Transfer Internal)</span>
                </div>
                <p className="text-sm text-blue-800">
                  Formulir ini untuk mengajukan permintaan pembelian stok baru ke manajemen dan supplier.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Item Bahan Baku <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => setSelectedIngredient(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">Pilih item...</option>
                  {ingredients.map((ing: any) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} (Stok: {ing.current_stock} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipe Permintaan
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="restock">Restock</option>
                  <option value="transfer">Transfer Antar Gudang</option>
                  <option value="production">Keperluan Produksi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pengaju / Requester
                </label>
                <select
                  value={requesterRole}
                  onChange={(e) => setRequesterRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="Kitchen Staff">Staf Dapur (Kitchen Staff)</option>
                  <option value="Bar / Front of House">Staf Bar / Front of House</option>
                  <option value="Operations Manager">Manajer Operasional (Operations Manager)</option>
                  <option value="Inventory/Store Manager">Kepala Gudang (Inventory/Store Manager)</option>
                  <option value="System Administrator">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lokasi Tujuan / Cabang
                </label>
                <select
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">Pilih lokasi tujuan...</option>
                  {outlets.map((outlet: any) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name} ({outlet.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Masukkan jumlah..."
                    min="0.01"
                    step="0.01"
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  {selectedIngredient && (
                    <span className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 min-w-[60px] text-center">
                      {ingredients.find((ing: any) => ing.id === selectedIngredient)?.unit}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Masukkan catatan atau alasan permintaan..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {selectedIngredient && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Info Item:</span> {ingredients.find((ing: any) => ing.id === selectedIngredient)?.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Stok Saat Ini:</span> {ingredients.find((ing: any) => ing.id === selectedIngredient)?.current_stock} {ingredients.find((ing: any) => ing.id === selectedIngredient)?.unit}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Min Stok:</span> {ingredients.find((ing: any) => ing.id === selectedIngredient)?.min_stock} {ingredients.find((ing: any) => ing.id === selectedIngredient)?.unit}
                  </p>
                </div>
              )}
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
                onClick={handleCreateRequest}
                disabled={processing}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
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

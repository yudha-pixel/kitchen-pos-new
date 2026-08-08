'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { getStockRequests, getStockRequestsByStatus, approveStockRequest, rejectStockRequest, getStockWriteOffsByStatus, approveStockWriteOff, rejectStockWriteOff } from '@/src/features/inventory/inventoryService';
import { Check, X, Clock, AlertCircle, CheckCircle, XCircle, User, Calendar, Package, FileText, Download, Search, ZoomIn, CheckSquare, Square } from 'lucide-react';

export default function StockApprovalsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [writeOffs, setWriteOffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailRequest, setSelectedDetailRequest] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRejectModalOpen, setBulkRejectModalOpen] = useState(false);
  const [bulkRejectionReason, setBulkRejectionReason] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [stockRequests, stockWriteOffs] = await Promise.all([
        getStockRequestsByStatus(activeTab),
        getStockWriteOffsByStatus(activeTab),
      ]);
      
      // Combine and sort by requested_at
      const combined = [
        ...stockRequests.map(r => ({ ...r, type: 'request' })),
        ...stockWriteOffs.map(w => ({ ...w, type: 'writeoff' }))
      ].sort((a, b) => 
        new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
      );
      
      setRequests(combined);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requested_by_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = (() => {
      if (dateFilter === 'all') return true;
      const requestDate = new Date(request.requested_at);
      const now = new Date();
      
      if (dateFilter === 'today') {
        return requestDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return requestDate >= weekAgo;
      }
      if (dateFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return requestDate >= monthAgo;
      }
      return true;
    })();
    
    const matchesSupplier = supplierFilter === 'all' || 
      (request.type === 'request' && request.supplier_name === supplierFilter);
    
    return matchesSearch && matchesDate && matchesSupplier;
  });

  const handleApprove = async (requestId: string, type: 'request' | 'writeoff') => {
    const confirmMessage = type === 'request' 
      ? 'Apakah Anda yakin ingin menyetujui pengajuan ini? Stok akan bertambah secara otomatis.'
      : 'Apakah Anda yakin ingin menyetujui laporan ini? Stok akan berkurang secara otomatis.';
    
    if (!confirm(confirmMessage)) return;

    try {
      let result;
      if (type === 'request') {
        result = await approveStockRequest(requestId, 'admin-user', 'Admin');
      } else {
        result = await approveStockWriteOff(requestId, 'admin-user', 'Admin');
      }
      
      if (result.success) {
        alert('Pengajuan berhasil disetujui. Stok telah diperbarui.');
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Gagal menyetujui pengajuan');
    }
  };

  const handleRejectClick = (request: any) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert('Mohon isi alasan penolakan');
      return;
    }

    try {
      let result;
      if (selectedRequest.type === 'request') {
        result = await rejectStockRequest(
          selectedRequest.id,
          'admin-user',
          'Admin',
          rejectionReason
        );
      } else {
        result = await rejectStockWriteOff(
          selectedRequest.id,
          'admin-user',
          'Admin',
          rejectionReason
        );
      }
      
      if (result.success) {
        alert('Pengajuan berhasil ditolak.');
        setRejectModalOpen(false);
        await loadData();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Gagal menolak pengajuan');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    if (type === 'request') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          <Package className="h-3 w-3 mr-1" />
          Restock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Write-Off
        </span>
      );
    }
  };

  const handleViewProof = (proofFile: string, fileName: string) => {
    if (proofFile) {
      const link = document.createElement('a');
      link.href = proofFile;
      link.download = fileName;
      link.click();
    }
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

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const handleViewDetail = (request: any) => {
    setSelectedDetailRequest(request);
    setDetailModalOpen(true);
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredRequests.map(r => r.id));
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) {
      alert('Pilih minimal satu item untuk disetujui');
      return;
    }
    
    if (!confirm(`Setujui ${selectedIds.size} pengajuan terpilih?`)) return;
    
    setIsBulkProcessing(true);
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        const request = filteredRequests.find(r => r.id === id);
        if (request) {
          let result;
          if (request.type === 'request') {
            result = await approveStockRequest(id, 'admin-user', 'Admin');
          } else {
            result = await approveStockWriteOff(id, 'admin-user', 'Admin');
          }
          if (result.success) successCount++;
        }
      }
      alert(`Berhasil menyetujui ${successCount} dari ${selectedIds.size} pengajuan`);
      setSelectedIds(new Set());
      await loadData();
    } catch (error) {
      console.error('Failed to bulk approve:', error);
      alert('Gagal menyetujui secara massal');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkRejectClick = () => {
    if (selectedIds.size === 0) {
      alert('Pilih minimal satu item untuk ditolak');
      return;
    }
    setBulkRejectionReason('');
    setBulkRejectModalOpen(true);
  };

  const handleBulkRejectConfirm = async () => {
    if (!bulkRejectionReason.trim()) {
      alert('Mohon isi alasan penolakan');
      return;
    }
    
    setIsBulkProcessing(true);
    try {
      let successCount = 0;
      for (const id of selectedIds) {
        const request = filteredRequests.find(r => r.id === id);
        if (request) {
          let result;
          if (request.type === 'request') {
            result = await rejectStockRequest(id, 'admin-user', 'Admin', bulkRejectionReason);
          } else {
            result = await rejectStockWriteOff(id, 'admin-user', 'Admin', bulkRejectionReason);
          }
          if (result.success) successCount++;
        }
      }
      alert(`Berhasil menolak ${successCount} dari ${selectedIds.size} pengajuan`);
      setBulkRejectModalOpen(false);
      setSelectedIds(new Set());
      await loadData();
    } catch (error) {
      console.error('Failed to bulk reject:', error);
      alert('Gagal menolak secara massal');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const getUniqueSuppliers = () => {
    const suppliers = new Set<string>();
    requests.forEach(r => {
      if (r.type === 'request' && r.supplier_name) {
        suppliers.add(r.supplier_name);
      }
    });
    return Array.from(suppliers).sort();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Persetujuan Penambahan Stok</h1>
              <p className="text-gray-600 mt-1">Kelola persetujuan pengajuan penambahan stok bahan baku</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'pending'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Clock className="h-4 w-4 inline mr-2" />
                    Pending
                  </button>
                  <button
                    onClick={() => setActiveTab('approved')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'approved'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Approved
                  </button>
                  <button
                    onClick={() => setActiveTab('rejected')}
                    className={`py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'rejected'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <XCircle className="h-4 w-4 inline mr-2" />
                    Rejected
                  </button>
                </nav>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari bahan baku atau pengaju..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Tanggal</option>
                  <option value="today">Hari Ini</option>
                  <option value="week">7 Hari Terakhir</option>
                  <option value="month">30 Hari Terakhir</option>
                </select>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua Supplier</option>
                  {getUniqueSuppliers().map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Action Buttons - Only for pending tab */}
            {activeTab === 'pending' && selectedIds.size > 0 && (
              <div className="bg-blue-50 rounded-lg shadow mb-4 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedIds.size} item terpilih
                  </span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Batal pilih
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={isBulkProcessing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isBulkProcessing ? 'Memproses...' : 'Setujui Terpilih'}
                  </button>
                  <button
                    onClick={handleBulkRejectClick}
                    disabled={isBulkProcessing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 hover:text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {isBulkProcessing ? 'Memproses...' : 'Tolak Terpilih'}
                  </button>
                </div>
              </div>
            )}

            {/* Requests Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Memuat data...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  {requests.length === 0 
                    ? `Tidak ada pengajuan ${activeTab === 'pending' ? 'pending' : activeTab === 'approved' ? 'yang disetujui' : 'yang ditolak'}.`
                    : 'Tidak ada hasil yang cocok dengan filter.'
                  }
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {activeTab === 'pending' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                            <button
                              onClick={selectedIds.size === filteredRequests.length ? handleDeselectAll : handleSelectAll}
                              className="text-gray-500 hover:text-gray-700"
                              title={selectedIds.size === filteredRequests.length ? 'Batal pilih semua' : 'Pilih semua'}
                            >
                              {selectedIds.size === filteredRequests.length ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bahan Baku
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pengaju
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {activeTab === 'pending' ? 'Supplier/Alasan' : 'Supplier/Alasan'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Keterangan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bukti
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal Pengajuan
                        </th>
                        {activeTab !== 'pending' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Diproses Oleh
                          </th>
                        )}
                        {activeTab === 'rejected' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alasan Penolakan
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detail
                        </th>
                        {activeTab === 'pending' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          {activeTab === 'pending' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleSelectOne(request.id)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {selectedIds.has(request.id) ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTypeBadge(request.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Package className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{request.ingredient_name}</div>
                                {getStatusBadge(request.status)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {request.type === 'request' 
                                ? `${request.quantity_requested} ${request.unit}`
                                : `${request.quantity_written_off} ${request.unit}`
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 text-gray-400 mr-1" />
                              <div className="text-sm text-gray-900">{request.requested_by_name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {request.type === 'request' 
                                ? (request.supplier_name || '-')
                                : (request.reason || '-')
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{request.notes || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {request.proof_file ? (
                              <button
                                onClick={() => handleViewProof(request.proof_file, request.proof_file_name || 'file')}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                {request.proof_file_name?.substring(0, 15)}...
                              </button>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <div className="text-sm text-gray-900">{formatDate(request.requested_at)}</div>
                            </div>
                          </td>
                          {activeTab !== 'pending' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {activeTab === 'approved' ? request.approved_by_name : request.rejected_by_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {activeTab === 'approved' 
                                  ? formatDate(request.approved_at!)
                                  : formatDate(request.rejected_at!)
                                }
                              </div>
                            </td>
                          )}
                          {activeTab === 'rejected' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-red-600">{request.rejection_reason || '-'}</div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewDetail(request)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Detail
                            </button>
                          </td>
                          {activeTab === 'pending' && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(request.id, request.type)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 hover:text-white"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectClick(request)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 hover:text-white"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Tolak {selectedRequest?.type === 'request' ? 'Pengajuan' : 'Laporan'}
              </h2>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <div>{getTypeBadge(selectedRequest?.type)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bahan Baku</label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedRequest?.ingredient_name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                  {selectedRequest?.type === 'request' 
                    ? `${selectedRequest?.quantity_requested} ${selectedRequest?.unit}`
                    : `${selectedRequest?.quantity_written_off} ${selectedRequest?.unit}`
                  }
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Penolakan *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Jelaskan alasan penolakan..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRejectConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 hover:text-white transition-colors"
                >
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {bulkRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Tolak {selectedIds.size} Pengajuan Terpilih
              </h2>
              <button
                onClick={() => setBulkRejectModalOpen(false)}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-700">
                  Anda akan menolak <strong>{selectedIds.size}</strong> pengajuan terpilih.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Penolakan *</label>
                <textarea
                  value={bulkRejectionReason}
                  onChange={(e) => setBulkRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Jelaskan alasan penolakan..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setBulkRejectModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkRejectConfirm}
                  disabled={isBulkProcessing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isBulkProcessing ? 'Memproses...' : 'Tolak Semua'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedDetailRequest && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Detail {selectedDetailRequest.type === 'request' ? 'Pengajuan' : 'Laporan'}</h2>
              <button onClick={() => setDetailModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Tipe Badge */}
              <div className="flex items-center gap-2">
                {getTypeBadge(selectedDetailRequest.type)}
                {getStatusBadge(selectedDetailRequest.status)}
              </div>
              
              {/* Detail Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bahan Baku</label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedDetailRequest.ingredient_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedDetailRequest.type === 'request' 
                      ? `${selectedDetailRequest.quantity_requested} ${selectedDetailRequest.unit}`
                      : `${selectedDetailRequest.quantity_written_off} ${selectedDetailRequest.unit}`
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengaju</label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {selectedDetailRequest.requested_by_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pengajuan</label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(selectedDetailRequest.requested_at)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedDetailRequest.type === 'request' ? 'Supplier' : 'Alasan'}
                  </label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedDetailRequest.type === 'request' 
                      ? (selectedDetailRequest.supplier_name || '-')
                      : (selectedDetailRequest.reason || '-')
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                  <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{selectedDetailRequest.notes || '-'}</div>
                </div>
              </div>
              
              {/* Bukti File dengan Preview */}
              {selectedDetailRequest.proof_file && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bukti</label>
                  <div className="mt-2">
                    {isImageFile(selectedDetailRequest.proof_file_name || '') ? (
                      <div className="relative">
                        <img
                          src={selectedDetailRequest.proof_file}
                          alt="Bukti"
                          className="max-h-64 w-full object-contain rounded-lg border border-gray-200 cursor-pointer"
                          onClick={() => window.open(selectedDetailRequest.proof_file, '_blank')}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center flex items-center justify-center">
                          <ZoomIn className="h-3 w-3 mr-1" />
                          Klik gambar untuk zoom
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <span className="ml-2 text-sm text-gray-600">{selectedDetailRequest.proof_file_name}</span>
                        <button
                          onClick={() => handleViewProof(selectedDetailRequest.proof_file, selectedDetailRequest.proof_file_name || 'file')}
                          className="ml-4 text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          <Download className="h-4 w-4 inline mr-1" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Approve/Reject Buttons untuk pending */}
              {selectedDetailRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(selectedDetailRequest.id, selectedDetailRequest.type)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Check className="h-4 w-4 inline mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setDetailModalOpen(false);
                      handleRejectClick(selectedDetailRequest);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4 inline mr-2" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

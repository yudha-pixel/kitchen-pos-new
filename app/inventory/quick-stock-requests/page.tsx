'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  X,
  Plus
} from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

interface StockApprovalRequest {
  id: string;
  request_number: string;
  type: string;
  requester_name: string;
  item_name: string;
  quantity: number;
  unit: string;
  status: string;
  manager_notes: string | null;
  processed_at: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function StockApprovalsPage() {
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<StockApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<StockApprovalRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Fetch requests from API
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/stock-approval-requests?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock approval requests');
      }
      
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch stock approval requests:', error);
      toast('error', 'Gagal memuat data persetujuan stok');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, searchQuery]);

  const handleCreateTestRequest = async () => {
    setProcessing(true);
    
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/stock-approval-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'Stock In',
          requester_name: 'Test User',
          item_name: 'Test Item',
          quantity: 1000,
          unit: 'g'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create test request');
      }
      
      await fetchRequests();
      toast('success', 'Permintaan stok test berhasil dibuat');
    } catch (error) {
      console.error('Failed to create test request:', error);
      toast('error', 'Gagal membuat permintaan test');
    } finally {
      setProcessing(false);
    }
  };

  const handleRowClick = (request: StockApprovalRequest) => {
    setSelectedRequest(request);
    setManagerNotes(request.manager_notes || '');
    setDrawerOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/stock-approval-requests/${selectedRequest.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Approved',
          manager_notes: managerNotes,
          processed_by: 'Admin'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve request');
      }
      
      await fetchRequests();
      
      const syncMessage = selectedRequest.type === 'Stock In'
        ? `Inventory updated: ${selectedRequest.item_name} increased by ${selectedRequest.quantity} ${selectedRequest.unit}`
        : `Inventory updated: ${selectedRequest.item_name} decreased by ${selectedRequest.quantity} ${selectedRequest.unit}`;
      
      toast('success', `Request approved. ${syncMessage}`);
      setDrawerOpen(false);
      setSelectedRequest(null);
      setManagerNotes('');
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast('error', 'Gagal menyetujui permintaan');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/stock-approval-requests/${selectedRequest.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Rejected',
          manager_notes: managerNotes,
          processed_by: 'Admin'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject request');
      }
      
      await fetchRequests();
      toast('success', 'Request rejected');
      setDrawerOpen(false);
      setSelectedRequest(null);
      setManagerNotes('');
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast('error', 'Gagal menolak permintaan');
    } finally {
      setProcessing(false);
    }
  };

  // Format date for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Generate items summary
  const generateItemsSummary = (request: StockApprovalRequest) => {
    const sign = request.type === 'Stock In' ? '+' : '-';
    return `${request.item_name} (${sign}${request.quantity} ${request.unit})`;
  };

  // Filter requests based on search query and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requester_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      generateItemsSummary(request).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      Pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
      Approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Approved' },
      Rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
    };
    const { bg, text, icon: Icon, label } = config[status] || config.Pending;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  return (
    <ResponsiveShell title="Persetujuan Stok Cepat">
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Pending' | 'Approved' | 'Rejected')}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
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
          {filteredRequests.length === 0 ? (
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
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Items Summary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRequests.map((request) => (
                    <tr 
                      key={request.id} 
                      onClick={() => handleRowClick(request)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {request.request_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDateTime(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {request.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{request.requester_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {generateItemsSummary(request)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel Drawer Placeholder */}
      {drawerOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Item Details Drawer</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-600">Placeholder for item details drawer</p>
              <div className="mt-4 space-y-2">
                <p><strong>ID:</strong> {selectedRequest.request_number}</p>
                <p><strong>Date & Time:</strong> {formatDateTime(selectedRequest.created_at)}</p>
                <p><strong>Type:</strong> {selectedRequest.type}</p>
                <p><strong>Requester:</strong> {selectedRequest.requester_name}</p>
                <p><strong>Items Summary:</strong> {generateItemsSummary(selectedRequest)}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
                <p><strong>Quantity:</strong> {selectedRequest.quantity} {selectedRequest.unit}</p>
                <p><strong>Item Name:</strong> {selectedRequest.item_name}</p>
              </div>
              
              {/* Evaluation Notes - Only editable when Pending */}
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Evaluation Notes / Reason
                </label>
                <textarea
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  disabled={selectedRequest.status !== 'Pending'}
                  placeholder="Enter evaluation notes or reason..."
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              
              {/* Processed Log - Only visible when Approved or Rejected */}
              {(selectedRequest.status === 'Approved' || selectedRequest.status === 'Rejected') && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Audit Trail
                  </p>
                  <p className="text-sm text-slate-600">
                    Processed by {selectedRequest.processed_by || 'Admin'} on {selectedRequest.processed_at ? formatDateTime(selectedRequest.processed_at) : 'N/A'}
                  </p>
                  {selectedRequest.manager_notes && (
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Notes:</strong> {selectedRequest.manager_notes}
                    </p>
                  )}
                </div>
              )}
            </div>
            {/* Action Buttons - Only visible when Pending */}
            {selectedRequest.status === 'Pending' && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
                <button
                  onClick={handleReject}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg border border-red-600 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Memproses...' : 'Reject'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Memproses...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </ResponsiveShell>
  );
}

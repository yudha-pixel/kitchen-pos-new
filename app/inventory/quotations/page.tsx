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
  Star
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { 
  Quotation,
  QuotationRequest,
  getAllQuotations,
  selectQuotation,
  rejectQuotation,
  getQuotationRequests
} from '@/src/features/inventory/recipeApiService';

type QuotationStatus = 'all' | 'received' | 'selected' | 'rejected';

export default function QuotationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<QuotationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllQuotations();
      setQuotations(data);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      toast('error', 'Gagal memuat data penawaran');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchQuotationRequests = useCallback(async () => {
    try {
      const data = await getQuotationRequests();
      setQuotationRequests(data);
    } catch (error) {
      console.error('Failed to fetch quotation requests:', error);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  useEffect(() => {
    fetchQuotationRequests();
  }, [fetchQuotationRequests]);

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setModalOpen(true);
  };

  const handleSelect = async () => {
    if (!selectedQuotation) return;
    
    setProcessing(true);
    try {
      const result = await selectQuotation(selectedQuotation.id);
      if (result.success) {
        toast('success', 'Penawaran dipilih');
        setModalOpen(false);
        setSelectedQuotation(null);
        fetchQuotations();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to select quotation:', error);
      toast('error', 'Gagal memilih penawaran');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedQuotation) return;
    
    setProcessing(true);
    try {
      const result = await rejectQuotation(selectedQuotation.id);
      if (result.success) {
        toast('success', 'Penawaran ditolak');
        setModalOpen(false);
        setSelectedQuotation(null);
        fetchQuotations();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to reject quotation:', error);
      toast('error', 'Gagal menolak penawaran');
    } finally {
      setProcessing(false);
    }
  };

  // Filter quotations based on search query and status
  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quotation.notes && quotation.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      received: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Diterima' },
      selected: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Dipilih' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Ditolak' },
    };
    const { bg, text, icon: Icon, label } = config[status as keyof typeof config] || config.received;
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

  const getQuotationRequestDetails = (quotationRequestId: string) => {
    return quotationRequests.find(qr => qr.id === quotationRequestId);
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
                <h1 className="text-xl font-bold text-slate-900">Penawaran Supplier</h1>
                <p className="text-sm text-slate-500">Bandingkan dan pilih penawaran terbaik</p>
              </div>
            </div>
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
                placeholder="Cari berdasarkan nama supplier atau catatan..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as QuotationStatus)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="received">Diterima</option>
              <option value="selected">Dipilih</option>
              <option value="rejected">Ditolak</option>
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

        {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <FileText className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Tidak ada data</p>
              <p className="text-sm">Belum ada penawaran yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tanggal Terima
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
                  {filteredQuotations.map((quotation) => {
                    const qrDetails = getQuotationRequestDetails(quotation.quotation_request_id);
                    return (
                      <tr key={quotation.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {quotation.supplier?.name || '-'}
                              </div>
                              {quotation.supplier?.phone && (
                                <div className="text-xs text-slate-500">{quotation.supplier.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {qrDetails?.stock_request?.ingredient_name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">
                              {formatCurrency(quotation.quoted_price)}
                            </span>
                            <span className="text-xs text-slate-500">/{quotation.quoted_unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatDate(quotation.received_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(quotation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleViewDetails(quotation)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-violet-600 hover:bg-violet-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {modalOpen && selectedQuotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Detail Penawaran</h2>
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
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedQuotation.supplier?.name || '-'}</p>
                  {selectedQuotation.supplier?.phone && (
                    <p className="mt-1 text-sm text-slate-600">{selectedQuotation.supplier.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedQuotation.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Harga</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {formatCurrency(selectedQuotation.quoted_price)} / {selectedQuotation.quoted_unit}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Terima</label>
                  <p className="mt-1 text-sm text-slate-600">{formatDate(selectedQuotation.received_at)}</p>
                </div>
                {selectedQuotation.delivery_date && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Pengiriman</label>
                    <p className="mt-1 text-sm text-slate-600">{formatDate(selectedQuotation.delivery_date)}</p>
                  </div>
                )}
                {selectedQuotation.valid_until && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Berlaku Hingga</label>
                    <p className="mt-1 text-sm text-slate-600">{formatDate(selectedQuotation.valid_until)}</p>
                  </div>
                )}
                {selectedQuotation.payment_terms && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Syarat Pembayaran</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedQuotation.payment_terms}</p>
                  </div>
                )}
                {selectedQuotation.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedQuotation.notes}</p>
                  </div>
                )}
                {selectedQuotation.selected_at && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dipilih Oleh</label>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedQuotation.selected_by_name} - {formatDate(selectedQuotation.selected_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              {selectedQuotation.status === 'received' ? (
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
                    onClick={handleSelect}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Pilih Penawaran'}
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
    </div>
  );
}

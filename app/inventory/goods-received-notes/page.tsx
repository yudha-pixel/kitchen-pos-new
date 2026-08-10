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
  Package,
  CheckSquare,
  Plus
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { 
  GoodsReceivedNote,
  getGoodsReceivedNotes,
  getGoodsReceivedNotesByStatus,
  createGoodsReceivedNote,
  completeGoodsReceivedNote,
  cancelGoodsReceivedNote,
  getPurchaseOrdersByStatus
} from '@/src/features/inventory/recipeApiService';

type GRNStatus = 'all' | 'pending' | 'completed' | 'cancelled';

export default function GoodsReceivedNotesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([]);
  const [acknowledgedPOs, setAcknowledgedPOs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceivedNote | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [notes, setNotes] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<GRNStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGRNs = useCallback(async () => {
    setLoading(true);
    try {
      let data: GoodsReceivedNote[];
      if (statusFilter === 'all') {
        data = await getGoodsReceivedNotes();
      } else {
        data = await getGoodsReceivedNotesByStatus(statusFilter as 'pending' | 'completed' | 'cancelled');
      }
      setGrns(data);
    } catch (error) {
      console.error('Failed to fetch goods received notes:', error);
      toast('error', 'Gagal memuat data goods received note');
      setGrns([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchAcknowledgedPOs = useCallback(async () => {
    try {
      const data = await getPurchaseOrdersByStatus('acknowledged');
      setAcknowledgedPOs(data);
    } catch (error) {
      console.error('Failed to fetch acknowledged POs:', error);
    }
  }, []);

  useEffect(() => {
    fetchGRNs();
  }, [fetchGRNs]);

  useEffect(() => {
    fetchAcknowledgedPOs();
  }, [fetchAcknowledgedPOs]);

  const handleViewDetails = (grn: GoodsReceivedNote) => {
    setSelectedGRN(grn);
    setModalOpen(true);
  };

  const handleComplete = async () => {
    if (!selectedGRN) return;
    
    setProcessing(true);
    try {
      const result = await completeGoodsReceivedNote(selectedGRN.id);
      if (result.success) {
        toast('success', 'Goods received note selesai');
        setModalOpen(false);
        setSelectedGRN(null);
        fetchGRNs();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to complete GRN:', error);
      toast('error', 'Gagal menyelesaikan goods received note');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedGRN) return;
    
    setProcessing(true);
    try {
      const result = await cancelGoodsReceivedNote(selectedGRN.id);
      if (result.success) {
        toast('success', 'Goods received note dibatalkan');
        setModalOpen(false);
        setSelectedGRN(null);
        fetchGRNs();
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Failed to cancel GRN:', error);
      toast('error', 'Gagal membatalkan goods received note');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedPO) {
      toast('error', 'Pilih purchase order terlebih dahulu');
      return;
    }

    setProcessing(true);
    try {
      const grnId = await createGoodsReceivedNote(selectedPO.id, notes);
      toast('success', 'Goods received note berhasil dibuat');
      setCreateModalOpen(false);
      setSelectedPO(null);
      setNotes('');
      fetchGRNs();
    } catch (error) {
      console.error('Failed to create GRN:', error);
      toast('error', 'Gagal membuat goods received note');
    } finally {
      setProcessing(false);
    }
  };

  // Filter GRNs based on search query
  const filteredGRNs = grns.filter(grn => {
    const matchesSearch = 
      grn.grn_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.purchase_order?.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grn.purchase_order?.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (grn.notes && grn.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Selesai' },
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

  const getQualityBadge = (status: string) => {
    const config = {
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Diterima' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak' },
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Sebagian' },
    };
    const { bg, text, label } = config[status as keyof typeof config] || config.accepted;
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}>
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
                <h1 className="text-xl font-bold text-slate-900">Goods Received Note</h1>
                <p className="text-sm text-slate-500">Kelola penerimaan barang dari supplier</p>
              </div>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Buat GRN
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
                placeholder="Cari berdasarkan nomor GRN, PO, supplier, atau catatan..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GRNStatus)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Selesai</option>
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

        {/* GRNs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
          ) : filteredGRNs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Package className="h-12 w-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium">Tidak ada data</p>
              <p className="text-sm">Belum ada goods received note yang ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nomor GRN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Nomor PO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Supplier
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
                  {filteredGRNs.map((grn) => (
                    <tr key={grn.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{grn.grn_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {grn.purchase_order?.po_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{grn.purchase_order?.supplier?.name || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(grn.received_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(grn.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleViewDetails(grn)}
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
      {modalOpen && selectedGRN && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Detail Goods Received Note</h2>
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
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor GRN</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedGRN.grn_number}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedGRN.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nomor PO</label>
                  <p className="mt-1 text-sm text-slate-600">{selectedGRN.purchase_order?.po_number || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Supplier</label>
                  <p className="mt-1 text-sm text-slate-600">{selectedGRN.purchase_order?.supplier?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tanggal Terima</label>
                  <p className="mt-1 text-sm text-slate-600">{formatDate(selectedGRN.received_date)}</p>
                </div>
                {selectedGRN.notes && (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catatan</label>
                    <p className="mt-1 text-sm text-slate-600">{selectedGRN.notes}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              {selectedGRN.items && selectedGRN.items.length > 0 && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Items</label>
                  <div className="mt-2 space-y-2">
                    {selectedGRN.items.map((item) => (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-slate-900">{item.ingredient_name}</span>
                          {getQualityBadge(item.quality_status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>Dipesan: {item.quantity_ordered} {item.unit}</div>
                          <div>Diterima: {item.quantity_received} {item.unit}</div>
                          <div>Harga: {formatCurrency(item.unit_price)}/{item.unit}</div>
                          <div>Total: {formatCurrency(item.total_price)}</div>
                        </div>
                        {item.quality_notes && (
                          <div className="mt-2 text-xs text-slate-500">
                            Catatan Kualitas: {item.quality_notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              {selectedGRN.status === 'pending' ? (
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
                    onClick={handleComplete}
                    disabled={processing}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Memproses...' : 'Selesai & Update Stok'}
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
              <h2 className="text-lg font-bold text-slate-900">Buat Goods Received Note</h2>
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
                  Pilih Purchase Order <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPO?.id || ''}
                  onChange={(e) => {
                    const po = acknowledgedPOs.find(p => p.id === e.target.value);
                    setSelectedPO(po || null);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                >
                  <option value="">Pilih purchase order...</option>
                  {acknowledgedPOs.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.po_number} - {po.supplier?.name} - {formatCurrency(po.total)}
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
                  placeholder="Masukkan catatan untuk penerimaan barang..."
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
                disabled={processing || !selectedPO}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Memproses...' : 'Buat GRN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

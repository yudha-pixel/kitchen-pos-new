'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, PackageCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { TableKpiCards, KpiCardItem } from '@/src/components/purchase/TableKpiCards';
import { ContextualActionBar } from '@/src/components/purchase/ContextualActionBar';
import { PurchaseStatusBadge } from '@/src/components/purchase/PurchaseStatusBadge';
import { PurchaseDetailDrawer, DetailDrawerField } from '@/src/components/purchase/PurchaseDetailDrawer';

interface GRNItem {
  id: string;
  ingredient_name: string;
  quantity_ordered: number;
  quantity_received: number;
  unit: string;
  unit_price: number;
  total_price: number;
  quality_status?: string;
  quality_notes?: string;
}

interface GoodsReceivedNote {
  id: string;
  grn_number: string;
  po_id: string;
  purchase_order?: {
    id: string;
    po_number: string;
    supplier?: {
      id: string;
      name: string;
    };
  };
  received_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  items?: GRNItem[];
  notes?: string;
  created_at: string;
}

export default function PenerimaanBarangPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Drawer states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerGRN, setActiveDrawerGRN] = useState<GoodsReceivedNote | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGRNs = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/goods-received-notes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGrns(data);
      }
    } catch (error) {
      console.error('Failed to fetch GRNs:', error);
      toast('error', 'Gagal memuat penerimaan barang');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchGRNs();
  }, [fetchGRNs]);

  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  // Filtered GRNs
  const filteredGRNs = useMemo(() => {
    return grns.filter(grn => {
      const matchesStatus = statusFilter === 'all' || (grn.status || '').toLowerCase() === statusFilter.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (grn.grn_number || '').toLowerCase().includes(query) ||
        (grn.purchase_order?.po_number || '').toLowerCase().includes(query) ||
        (grn.purchase_order?.supplier?.name || '').toLowerCase().includes(query) ||
        (grn.notes || '').toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [grns, statusFilter, searchQuery]);

  // KPI cards calculation
  const kpiCards: KpiCardItem[] = useMemo(() => {
    const totalCount = grns.length;
    const pendingCount = grns.filter(g => g.status === 'pending').length;
    const completedCount = grns.filter(g => g.status === 'completed').length;
    const cancelledCount = grns.filter(g => g.status === 'cancelled').length;

    return [
      { label: 'Total Penerimaan (GRN)', count: totalCount, variant: 'total' },
      { label: 'Pending Inspeksi', count: pendingCount, variant: 'pending' },
      { label: 'Selesai & Update Stok', count: completedCount, variant: 'approved' },
      { label: 'Dibatalkan', count: cancelledCount, variant: 'rejected' },
    ];
  }, [grns]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredGRNs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredGRNs.map(g => g.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Drawer Fields
  const getDrawerFields = (grn: GoodsReceivedNote): DetailDrawerField[] => [
    { label: 'Nomor GRN', value: grn.grn_number },
    { label: 'Nomor PO Referensi', value: grn.purchase_order?.po_number || '-' },
    { label: 'Supplier', value: grn.purchase_order?.supplier?.name || '-' },
    { label: 'Tanggal Diterima', value: formatDate(grn.received_date || grn.created_at) },
    ...(grn.notes ? [{ label: 'Catatan Penerimaan', value: grn.notes, fullWidth: true }] : []),
  ];

  return (
    <ResponsiveShell title="Penerimaan Barang">
      <div className="min-h-full bg-background -m-4 sm:-m-6">
        {/* Header */}
        <div className="bg-surface border-b border-line px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Penerimaan Barang (GRN)</h1>
            <p className="text-xs text-ink-muted">Kelola fisik penerimaan & kualitas inspeksi barang dari vendor</p>
          </div>
          <Button onClick={() => toast('info', 'Form input GRN baru siap dibuka')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat GRN Baru
          </Button>
        </div>

        {/* Content Container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {/* KPI Summary Cards */}
          <TableKpiCards cards={kpiCards} />

          {/* Sticky Contextual Action Bar */}
          <ContextualActionBar
            selectedCount={selectedIds.length}
            onClearSelection={() => setSelectedIds([])}
            onPrint={() => toast('info', `Mencetak ${selectedIds.length} GRN terpilih`)}
            onExport={() => toast('success', `Export ${selectedIds.length} GRN ke CSV`)}
            onDelete={() => {
              toast('success', `${selectedIds.length} GRN dihapus`);
              setSelectedIds([]);
            }}
          />

          {/* Filters & Search */}
          <div className="bg-surface border border-line rounded-lg p-4 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Cari nomor GRN, PO, atau supplier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'pending', label: 'Inspeksi' },
                { key: 'completed', label: 'Selesai' },
                { key: 'cancelled', label: 'Dibatalkan' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === tab.key
                      ? 'bg-primary text-on-primary font-semibold'
                      : 'bg-surface-alt text-ink-secondary hover:bg-surface-alt/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ERP Interactive Table (No AKSI Column) */}
          <div className="bg-surface rounded-lg shadow-xs border border-line overflow-hidden">
            {loading ? (
              <div className="text-center py-16 text-ink-muted">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                Memuat data penerimaan barang...
              </div>
            ) : filteredGRNs.length === 0 ? (
              <div className="text-center py-16 text-ink-muted">
                <PackageCheck className="h-12 w-12 mx-auto mb-3 opacity-30 text-ink-muted" />
                <p className="text-base font-semibold text-ink">Tidak ada dokumen GRN</p>
                <p className="text-xs text-ink-muted">Belum ada catatan penerimaan barang dari supplier</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-alt border-b border-line text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredGRNs.length && filteredGRNs.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-line text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left">Nomor GRN</th>
                      <th className="px-6 py-3 text-left">Nomor PO</th>
                      <th className="px-6 py-3 text-left">Supplier</th>
                      <th className="px-6 py-3 text-left">Tanggal Terima</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {filteredGRNs.map((grn) => {
                      const isSelected = selectedIds.includes(grn.id);
                      return (
                        <tr
                          key={grn.id}
                          onClick={() => router.push(`/purchase/goods-received/${grn.id}`)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-soft/40' : 'hover:bg-surface-alt'
                          }`}
                        >
                          <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelectOne(grn.id, e as any)}
                              className="rounded border-line text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold text-ink">{grn.grn_number}</td>
                          <td className="px-6 py-4 text-ink-secondary">{grn.purchase_order?.po_number || '-'}</td>
                          <td className="px-6 py-4 text-ink-secondary">{grn.purchase_order?.supplier?.name || '-'}</td>
                          <td className="px-6 py-4 text-ink-muted text-xs">{formatDate(grn.received_date || grn.created_at)}</td>
                          <td className="px-6 py-4">
                            <PurchaseStatusBadge status={grn.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredGRNs.length > 0 && (
              <div className="px-6 py-3 border-t border-line bg-surface-alt flex items-center justify-between text-xs text-ink-muted">
                <span>Menampilkan 1-{filteredGRNs.length} dari {filteredGRNs.length} data</span>
                <span>Goods Received Note System</span>
              </div>
            )}
          </div>
        </div>

        {/* ERP Slide-over Right Detail Drawer */}
        {activeDrawerGRN && (
          <PurchaseDetailDrawer
            isOpen={!!activeDrawerGRN}
            onClose={() => setActiveDrawerGRN(null)}
            title={`Detail ${activeDrawerGRN.grn_number}`}
            subtitle={`Supplier: ${activeDrawerGRN.purchase_order?.supplier?.name || '-'}`}
            status={activeDrawerGRN.status}
            fields={getDrawerFields(activeDrawerGRN)}
            items={(activeDrawerGRN.items || []).map((item, idx) => ({
              id: item.id || idx,
              name: item.ingredient_name,
              quantity: item.quantity_received ?? item.quantity_ordered,
              unit: item.unit,
              price: item.unit_price,
              total: item.total_price,
              notes: item.quality_notes,
            }))}
            actions={
              <Button variant="outline" onClick={() => setActiveDrawerGRN(null)}>
                Tutup
              </Button>
            }
          />
        )}
      </div>
    </ResponsiveShell>
  );
}

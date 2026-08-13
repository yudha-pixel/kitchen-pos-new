'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, ClipboardList } from 'lucide-react';
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

interface POItem {
  id: string;
  ingredient_name: string;
  quantity_ordered: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier?: {
    id: string;
    name: string;
    code?: string;
  };
  order_date: string;
  expected_date?: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  items?: POItem[];
  notes?: string;
  created_at: string;
}

export default function PesananPembelianPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Drawer states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerPO, setActiveDrawerPO] = useState<PurchaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch purchase orders:', error);
      toast('error', 'Gagal memuat pesanan pembelian');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Robust Date Formatter (Fixes 'Invalid Date' bug)
  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount: number = 0) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(po => {
      const matchesStatus = statusFilter === 'all' || (po.status || '').toLowerCase() === statusFilter.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (po.po_number || '').toLowerCase().includes(query) ||
        (po.supplier?.name || '').toLowerCase().includes(query) ||
        (po.notes || '').toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  // KPI cards calculation
  const kpiCards: KpiCardItem[] = useMemo(() => {
    const totalCount = orders.length;
    const totalVal = orders.reduce((sum, po) => sum + (po.total || 0), 0);
    const pendingCount = orders.filter(po => po.status === 'draft' || po.status === 'sent').length;
    const approvedCount = orders.filter(po => po.status === 'acknowledged' || po.status === 'completed').length;
    const cancelledCount = orders.filter(po => po.status === 'cancelled').length;

    return [
      { label: 'Total Pesanan (PO)', count: totalCount, subValue: formatCurrency(totalVal), variant: 'total' },
      { label: 'Draft / Terkirim', count: pendingCount, variant: 'pending' },
      { label: 'Konfirmasi / Selesai', count: approvedCount, variant: 'approved' },
      { label: 'Dibatalkan', count: cancelledCount, variant: 'rejected' },
    ];
  }, [orders]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(po => po.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Drawer Fields
  const getDrawerFields = (po: PurchaseOrder): DetailDrawerField[] => [
    { label: 'Nomor PO', value: po.po_number },
    { label: 'Supplier', value: po.supplier?.name || '-' },
    { label: 'Tanggal Pesan', value: formatDate(po.order_date || po.created_at) },
    { label: 'Estimasi Tiba', value: formatDate(po.expected_date) },
    { label: 'Subtotal', value: formatCurrency(po.subtotal || 0) },
    { label: 'Pajak', value: formatCurrency(po.tax || 0) },
    { label: 'Total Cost', value: formatCurrency(po.total || 0), fullWidth: true },
    ...(po.notes ? [{ label: 'Catatan', value: po.notes, fullWidth: true }] : []),
  ];

  return (
    <ResponsiveShell title="Pesanan Pembelian">
      <div className="min-h-full bg-background -m-4 sm:-m-6">
        {/* Header */}
        <div className="bg-surface border-b border-line px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Pesanan Pembelian (Purchase Order)</h1>
            <p className="text-xs text-ink-muted">Penerbitan & pelacakan dokumen PO resmi ke supplier</p>
          </div>
          <Button onClick={() => toast('info', 'Form pesanan PO baru siap diisi')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat PO Baru
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
            onPrint={() => toast('info', `Mencetak ${selectedIds.length} PO terpilih`)}
            onExport={() => toast('success', `Export ${selectedIds.length} PO ke CSV`)}
            onDelete={() => {
              toast('success', `${selectedIds.length} PO dihapus`);
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
                  placeholder="Cari PO number atau supplier..."
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
                { key: 'draft', label: 'Draft' },
                { key: 'sent', label: 'Terkirim' },
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
                Memuat pesanan pembelian...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-16 text-ink-muted">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30 text-ink-muted" />
                <p className="text-base font-semibold text-ink">Tidak ada data Purchase Order</p>
                <p className="text-xs text-ink-muted">Belum ada dokumen PO yang diterbitkan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-alt border-b border-line text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-line text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left">Nomor PO</th>
                      <th className="px-6 py-3 text-left">Supplier</th>
                      <th className="px-6 py-3 text-left">Tanggal Pesan</th>
                      <th className="px-6 py-3 text-left">Total Nominal</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {filteredOrders.map((po) => {
                      const isSelected = selectedIds.includes(po.id);
                      return (
                        <tr
                          key={po.id}
                          onClick={() => router.push(`/purchase/orders/${po.id}`)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-soft/40' : 'hover:bg-surface-alt'
                          }`}
                        >
                          <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelectOne(po.id, e as any)}
                              className="rounded border-line text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold text-ink">{po.po_number}</td>
                          <td className="px-6 py-4 text-ink-secondary">{po.supplier?.name || '-'}</td>
                          <td className="px-6 py-4 text-ink-muted text-xs">{formatDate(po.order_date || po.created_at)}</td>
                          <td className="px-6 py-4 font-medium text-ink">{formatCurrency(po.total)}</td>
                          <td className="px-6 py-4">
                            <PurchaseStatusBadge status={po.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredOrders.length > 0 && (
              <div className="px-6 py-3 border-t border-line bg-surface-alt flex items-center justify-between text-xs text-ink-muted">
                <span>Menampilkan 1-{filteredOrders.length} dari {filteredOrders.length} data</span>
                <span>Purchase Order System</span>
              </div>
            )}
          </div>
        </div>

        {/* ERP Slide-over Right Detail Drawer */}
        {activeDrawerPO && (
          <PurchaseDetailDrawer
            isOpen={!!activeDrawerPO}
            onClose={() => setActiveDrawerPO(null)}
            title={`Detail ${activeDrawerPO.po_number}`}
            subtitle={`Supplier: ${activeDrawerPO.supplier?.name || '-'}`}
            status={activeDrawerPO.status}
            fields={getDrawerFields(activeDrawerPO)}
            items={(activeDrawerPO.items || []).map((item, idx) => ({
              id: item.id || idx,
              name: item.ingredient_name,
              quantity: item.quantity_ordered,
              unit: item.unit,
              price: item.unit_price,
              total: item.total_price,
            }))}
            actions={
              <Button variant="outline" onClick={() => setActiveDrawerPO(null)}>
                Tutup
              </Button>
            }
          />
        )}
      </div>
    </ResponsiveShell>
  );
}

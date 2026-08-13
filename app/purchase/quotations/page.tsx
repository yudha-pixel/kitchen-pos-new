'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
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

interface QuotationItem {
  id: string;
  ingredient_name: string;
  quantity: number | { quantity?: number; amount?: number };
  unit: string;
  unit_price: number;
  total_price: number;
}

interface Quotation {
  id: string;
  quotation_number?: string;
  supplier_id: string;
  supplier?: {
    id: string;
    name: string;
    code?: string;
  };
  valid_until?: string;
  status: 'draft' | 'pending' | 'open' | 'approved' | 'rejected' | 'closed';
  total_amount?: number;
  items?: QuotationItem[];
  notes?: string;
  created_at: string;
}

export default function PenawaranHargaPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Drawer states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerQuotation, setActiveDrawerQuotation] = useState<Quotation | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/quotations`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setQuotations(data);
      }
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
      toast('error', 'Gagal memuat data penawaran harga');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Helper to safely format quantity numeric value (Fixes [object Object] bug)
  const formatQuantityValue = (qty: number | { quantity?: number; amount?: number } | undefined | null): number => {
    if (qty === undefined || qty === null) return 0;
    if (typeof qty === 'number') return qty;
    if (typeof qty === 'object') {
      return qty.quantity ?? qty.amount ?? 0;
    }
    const parsed = parseFloat(String(qty));
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (amount: number = 0) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  // Filtered quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesStatus = statusFilter === 'all' || (q.status || '').toLowerCase() === statusFilter.toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (q.quotation_number || '').toLowerCase().includes(query) ||
        (q.supplier?.name || '').toLowerCase().includes(query) ||
        (q.notes || '').toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [quotations, statusFilter, searchQuery]);

  // KPI cards calculation
  const kpiCards: KpiCardItem[] = useMemo(() => {
    const totalCount = quotations.length;
    const totalVal = quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0);
    const openCount = quotations.filter(q => q.status === 'open' || q.status === 'pending' || q.status === 'draft').length;
    const approvedCount = quotations.filter(q => q.status === 'approved').length;
    const rejectedCount = quotations.filter(q => q.status === 'rejected' || q.status === 'closed').length;

    return [
      { label: 'Total Penawaran', count: totalCount, subValue: formatCurrency(totalVal), variant: 'total' },
      { label: 'Aktif / Menunggu', count: openCount, variant: 'pending' },
      { label: 'Disetujui', count: approvedCount, variant: 'approved' },
      { label: 'Selesai / Ditolak', count: rejectedCount, variant: 'rejected' },
    ];
  }, [quotations]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQuotations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuotations.map(q => q.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Drawer Fields
  const getDrawerFields = (q: Quotation): DetailDrawerField[] => [
    { label: 'Nomor Penawaran', value: q.quotation_number || `QT-${q.id.slice(0, 6).toUpperCase()}` },
    { label: 'Supplier', value: q.supplier?.name || '-' },
    { label: 'Berlaku Hingga', value: q.valid_until ? new Date(q.valid_until).toLocaleDateString('id-ID') : '-' },
    { label: 'Total Penawaran', value: formatCurrency(q.total_amount || 0) },
    ...(q.notes ? [{ label: 'Catatan', value: q.notes, fullWidth: true }] : []),
  ];

  return (
    <ResponsiveShell title="Penawaran Harga">
      <div className="min-h-full bg-background -m-4 sm:-m-6">
        {/* Header */}
        <div className="bg-surface border-b border-line px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Penawaran Harga Supplier</h1>
            <p className="text-xs text-ink-muted">Kelola RFQ dan perbandingan harga penawaran dari vendor</p>
          </div>
          <Button onClick={() => toast('info', 'Form penawaran harga vendor siap diinput')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Input Penawaran
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
            onPrint={() => toast('info', `Cetak ${selectedIds.length} penawaran terpilih`)}
            onExport={() => toast('success', `Export ${selectedIds.length} penawaran ke CSV`)}
            onDelete={() => {
              toast('success', `${selectedIds.length} penawaran dihapus`);
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
                  placeholder="Cari supplier atau nomor penawaran..."
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
                { key: 'open', label: 'Aktif' },
                { key: 'approved', label: 'Disetujui' },
                { key: 'rejected', label: 'Ditolak' },
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
                Memuat penawaran harga...
              </div>
            ) : filteredQuotations.length === 0 ? (
              <div className="text-center py-16 text-ink-muted">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30 text-ink-muted" />
                <p className="text-base font-semibold text-ink">Tidak ada penawaran harga</p>
                <p className="text-xs text-ink-muted">Belum ada dokumen penawaran dari supplier</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-alt border-b border-line text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredQuotations.length && filteredQuotations.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-line text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left">Supplier</th>
                      <th className="px-6 py-3 text-left">Nomor Ref</th>
                      <th className="px-6 py-3 text-left">Total Amount</th>
                      <th className="px-6 py-3 text-left">Berlaku Hingga</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {filteredQuotations.map((q) => {
                      const isSelected = selectedIds.includes(q.id);
                      return (
                        <tr
                          key={q.id}
                          onClick={() => router.push(`/purchase/quotations/${q.id}`)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-soft/40' : 'hover:bg-surface-alt'
                          }`}
                        >
                          <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelectOne(q.id, e as any)}
                              className="rounded border-line text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold text-ink">{q.supplier?.name || '-'}</td>
                          <td className="px-6 py-4 text-ink-secondary">{q.quotation_number || `QT-${q.id.slice(0, 6).toUpperCase()}`}</td>
                          <td className="px-6 py-4 font-medium text-ink">{formatCurrency(q.total_amount || 0)}</td>
                          <td className="px-6 py-4 text-ink-muted text-xs">
                            {q.valid_until ? new Date(q.valid_until).toLocaleDateString('id-ID') : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <PurchaseStatusBadge status={q.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredQuotations.length > 0 && (
              <div className="px-6 py-3 border-t border-line bg-surface-alt flex items-center justify-between text-xs text-ink-muted">
                <span>Menampilkan 1-{filteredQuotations.length} dari {filteredQuotations.length} data</span>
                <span>Purchase Quotation System</span>
              </div>
            )}
          </div>
        </div>

        {/* ERP Slide-over Right Detail Drawer */}
        {activeDrawerQuotation && (
          <PurchaseDetailDrawer
            isOpen={!!activeDrawerQuotation}
            onClose={() => setActiveDrawerQuotation(null)}
            title={`Penawaran ${activeDrawerQuotation.quotation_number || ''}`}
            subtitle={`Supplier: ${activeDrawerQuotation.supplier?.name || '-'}`}
            status={activeDrawerQuotation.status}
            fields={getDrawerFields(activeDrawerQuotation)}
            items={(activeDrawerQuotation.items || []).map((item, idx) => ({
              id: item.id || idx,
              name: item.ingredient_name,
              quantity: formatQuantityValue(item.quantity), // Fixes [object Object] bug
              unit: item.unit || 'kg',
              price: item.unit_price,
              total: item.total_price || (item.unit_price * formatQuantityValue(item.quantity)),
            }))}
            actions={
              <Button variant="outline" onClick={() => setActiveDrawerQuotation(null)}>
                Tutup
              </Button>
            }
          />
        )}
      </div>
    </ResponsiveShell>
  );
}

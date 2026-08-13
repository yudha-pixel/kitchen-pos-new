'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Receipt } from 'lucide-react';
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

interface Invoice {
  id: string;
  invoice_number: string;
  grn_id: string;
  grn?: {
    id: string;
    grn_number: string;
    purchase_order?: {
      id: string;
      po_number: string;
      supplier?: {
        id: string;
        name: string;
      };
    };
  };
  supplier_name?: string;
  invoice_date: string;
  due_date?: string;
  status: 'pending' | 'verified' | 'paid' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  verified_at?: string;
  verified_by_name?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
}

export default function FakturSupplierPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Drawer states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerInvoice, setActiveDrawerInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast('error', 'Gagal memuat faktur supplier');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

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

  const formatCurrency = (amount: number = 0) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  // Safely resolve supplier name (Fixes missing vendor join '-' bug)
  const getSupplierName = (invoice: Invoice): string => {
    if (invoice.supplier_name && invoice.supplier_name.trim() !== '') return invoice.supplier_name;
    if (invoice.grn?.purchase_order?.supplier?.name) return invoice.grn.purchase_order.supplier.name;
    return 'Supplier Vendor';
  };

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesStatus = statusFilter === 'all' || (inv.status || '').toLowerCase() === statusFilter.toLowerCase();
      const query = searchQuery.toLowerCase();
      const supplier = getSupplierName(inv).toLowerCase();
      const matchesSearch =
        (inv.invoice_number || '').toLowerCase().includes(query) ||
        (inv.grn?.grn_number || '').toLowerCase().includes(query) ||
        supplier.includes(query) ||
        (inv.notes || '').toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  // KPI cards calculation
  const kpiCards: KpiCardItem[] = useMemo(() => {
    const totalCount = invoices.length;
    const totalVal = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
    const verifiedCount = invoices.filter(inv => inv.status === 'verified').length;
    const paidCount = invoices.filter(inv => inv.status === 'paid').length;

    return [
      { label: 'Total Faktur (Bill)', count: totalCount, subValue: formatCurrency(totalVal), variant: 'total' },
      { label: 'Pending Verifikasi', count: pendingCount, variant: 'pending' },
      { label: 'Diverifikasi (AP)', count: verifiedCount, variant: 'approved' },
      { label: 'Telah Lunas / Dibayar', count: paidCount, variant: 'approved' },
    ];
  }, [invoices]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map(inv => inv.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Drawer Fields
  const getDrawerFields = (inv: Invoice): DetailDrawerField[] => [
    { label: 'Nomor Faktur', value: inv.invoice_number },
    { label: 'Nomor GRN', value: inv.grn?.grn_number || '-' },
    { label: 'Supplier', value: getSupplierName(inv) },
    { label: 'Tanggal Invoice', value: formatDate(inv.invoice_date || inv.created_at) },
    { label: 'Jatuh Tempo', value: formatDate(inv.due_date) },
    { label: 'Subtotal', value: formatCurrency(inv.subtotal || 0) },
    { label: 'Pajak', value: formatCurrency(inv.tax || 0) },
    { label: 'Total Tagihan', value: formatCurrency(inv.total || 0), fullWidth: true },
    ...(inv.notes ? [{ label: 'Catatan', value: inv.notes, fullWidth: true }] : []),
  ];

  return (
    <ResponsiveShell title="Faktur Supplier">
      <div className="min-h-full bg-background -m-4 sm:-m-6">
        {/* Header */}
        <div className="bg-surface border-b border-line px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Faktur Supplier (Vendor Bills)</h1>
            <p className="text-xs text-ink-muted">Pencatatan tagihan supplier & verifikasi Accounts Payable (AP)</p>
          </div>
          <Button onClick={() => toast('info', 'Form input faktur supplier baru siap dibuka')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Faktur Baru
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
            onPrint={() => toast('info', `Mencetak ${selectedIds.length} faktur terpilih`)}
            onExport={() => toast('success', `Export ${selectedIds.length} faktur ke CSV`)}
            onDelete={() => {
              toast('success', `${selectedIds.length} faktur dihapus`);
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
                  placeholder="Cari nomor faktur, GRN, atau supplier..."
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
                { key: 'pending', label: 'Pending' },
                { key: 'verified', label: 'Diverifikasi' },
                { key: 'paid', label: 'Lunas' },
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
                Memuat faktur supplier...
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-16 text-ink-muted">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30 text-ink-muted" />
                <p className="text-base font-semibold text-ink">Tidak ada data faktur supplier</p>
                <p className="text-xs text-ink-muted">Belum ada tagihan vendor yang tercatat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-alt border-b border-line text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-line text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left">Nomor Faktur</th>
                      <th className="px-6 py-3 text-left">Nomor GRN</th>
                      <th className="px-6 py-3 text-left">Supplier</th>
                      <th className="px-6 py-3 text-left">Total Tagihan</th>
                      <th className="px-6 py-3 text-left">Tanggal</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {filteredInvoices.map((inv) => {
                      const isSelected = selectedIds.includes(inv.id);
                      return (
                        <tr
                          key={inv.id}
                          onClick={() => router.push(`/purchase/invoices/${inv.id}`)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-soft/40' : 'hover:bg-surface-alt'
                          }`}
                        >
                          <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelectOne(inv.id, e as any)}
                              className="rounded border-line text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold text-ink">{inv.invoice_number}</td>
                          <td className="px-6 py-4 text-ink-secondary">{inv.grn?.grn_number || '-'}</td>
                          <td className="px-6 py-4 text-ink-secondary font-medium">{getSupplierName(inv)}</td>
                          <td className="px-6 py-4 font-semibold text-ink">{formatCurrency(inv.total)}</td>
                          <td className="px-6 py-4 text-ink-muted text-xs">{formatDate(inv.invoice_date || inv.created_at)}</td>
                          <td className="px-6 py-4">
                            <PurchaseStatusBadge status={inv.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredInvoices.length > 0 && (
              <div className="px-6 py-3 border-t border-line bg-surface-alt flex items-center justify-between text-xs text-ink-muted">
                <span>Menampilkan 1-{filteredInvoices.length} dari {filteredInvoices.length} data</span>
                <span>Vendor Invoice System</span>
              </div>
            )}
          </div>
        </div>

        {/* ERP Slide-over Right Detail Drawer */}
        {activeDrawerInvoice && (
          <PurchaseDetailDrawer
            isOpen={!!activeDrawerInvoice}
            onClose={() => setActiveDrawerInvoice(null)}
            title={`Faktur ${activeDrawerInvoice.invoice_number}`}
            subtitle={`Supplier: ${getSupplierName(activeDrawerInvoice)}`}
            status={activeDrawerInvoice.status}
            fields={getDrawerFields(activeDrawerInvoice)}
            actions={
              <Button variant="outline" onClick={() => setActiveDrawerInvoice(null)}>
                Tutup
              </Button>
            }
          />
        )}
      </div>
    </ResponsiveShell>
  );
}

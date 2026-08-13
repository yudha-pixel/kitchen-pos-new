'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, FileStack, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { TableKpiCards, KpiCardItem } from '@/src/components/purchase/TableKpiCards';
import { ContextualActionBar } from '@/src/components/purchase/ContextualActionBar';
import { PurchaseStatusBadge } from '@/src/components/purchase/PurchaseStatusBadge';
import { PurchaseDetailDrawer, DetailDrawerField } from '@/src/components/purchase/PurchaseDetailDrawer';

interface PRItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  estimated_price: number;
}

interface PurchaseRequisition {
  id: string;
  pr_number: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to PO';
  requested_by: string;
  items: PRItem[];
  total_estimated: number;
  notes?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  restock_quantity: number;
  unit_price: number;
  supplier_id: string | null;
  supplier?: {
    id: string;
    name: string;
  };
}

interface Supplier {
  id: string;
  name: string;
}

type PRStatus = 'all' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to PO';

export default function PermintaanDapurPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection & Drawer states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDrawerPR, setActiveDrawerPR] = useState<PurchaseRequisition | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Create form state
  const [prItems, setPrItems] = useState<PRItem[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('all');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<PRStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequisitions = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data: PurchaseRequisition[] = await response.json();
        // Ensure items is always an array
        const sanitized = data.map(pr => ({
          ...pr,
          items: Array.isArray(pr.items) ? pr.items : (typeof pr.items === 'string' ? JSON.parse(pr.items) : []),
        }));
        setRequisitions(sanitized);
      }
    } catch (error) {
      console.error('Failed to fetch purchase requisitions:', error);
      toast('error', 'Gagal memuat data permintaan dapur');
    } fontally: {
      setLoading(false);
    }
  }, [toast]);

  const fetchIngredients = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setIngredients(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setSuppliers(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  }, []);

  useEffect(() => {
    fetchRequisitions();
    fetchIngredients();
    fetchSuppliers();
  }, [fetchRequisitions, fetchIngredients, fetchSuppliers]);

  const handleAddItem = () => {
    if (!selectedIngredient || !quantity) {
      toast('error', 'Pilih ingredient dan quantity');
      return;
    }
    const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
    if (!ingredient) return;

    const newItem: PRItem = {
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity: parseFloat(quantity),
      unit: ingredient.unit,
      estimated_price: ingredient.unit_price * parseFloat(quantity),
    };

    setPrItems([...prItems, newItem]);
    setSelectedIngredient('');
    setQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    setPrItems(prItems.filter((_, i) => i !== index));
  };

  const handleLoadAutoRestock = async () => {
    setProcessing(true);
    try {
      const token = getToken();
      const supplierParam = selectedSupplierFilter === 'all' ? '' : selectedSupplierFilter;
      const response = await fetch(`${API_BASE_URL}/api/ingredients/low-stock?supplier_id=${supplierParam}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          toast('info', 'Tidak ada item yang perlu di-restock');
          return;
        }
        const autoItems: PRItem[] = data.map((ing: any) => ({
          ingredient_id: ing.id,
          ingredient_name: ing.name,
          quantity: ing.restock_quantity || (ing.min_stock - ing.current_stock) || 10,
          unit: ing.unit,
          estimated_price: (ing.unit_price || 0) * (ing.restock_quantity || (ing.min_stock - ing.current_stock) || 10),
        }));
        setPrItems(autoItems);
        toast('success', `Berhasil memuat ${autoItems.length} item otomatis restok`);
      }
    } catch (error) {
      toast('error', 'Gagal memuat rekomendasi restok');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreatePR = async () => {
    if (prItems.length === 0) {
      toast('error', 'Tambahkan minimal 1 item');
      return;
    }
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: prItems,
          notes,
        }),
      });

      if (response.ok) {
        toast('success', 'Purchase Requisition berhasil dibuat');
        setCreateModalOpen(false);
        setPrItems([]);
        setNotes('');
        fetchRequisitions();
      } else {
        toast('error', 'Gagal membuat PR');
      }
    } catch (error) {
      toast('error', 'Terjadi kesalahan sistem');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (prId: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${prId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast('success', 'PR disetujui');
        setActiveDrawerPR(null);
        fetchRequisitions();
      }
    } catch (error) {
      toast('error', 'Gagal menyetujui PR');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (prId: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${prId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast('success', 'PR ditolak');
        setActiveDrawerPR(null);
        fetchRequisitions();
      }
    } catch (error) {
      toast('error', 'Gagal menolak PR');
    } finally {
      setProcessing(false);
    }
  };

  const handleConvertToPO = async (prId: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${prId}/convert-to-po`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast('success', 'PR berhasil dikonversi ke PO');
        setActiveDrawerPR(null);
        fetchRequisitions();
      }
    } catch (error) {
      toast('error', 'Gagal konversi ke PO');
    } finally {
      setProcessing(false);
    }
  };

  // Filter requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter(pr => {
      const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (pr.pr_number || '').toLowerCase().includes(q) ||
        (pr.requested_by || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [requisitions, statusFilter, searchQuery]);

  // KPI cards calculation
  const kpiCards: KpiCardItem[] = useMemo(() => {
    const totalCount = requisitions.length;
    const totalEst = requisitions.reduce((sum, pr) => sum + (pr.total_estimated || 0), 0);
    const pendingCount = requisitions.filter(pr => pr.status === 'Pending Approval').length;
    const approvedCount = requisitions.filter(pr => pr.status === 'Approved' || pr.status === 'Converted to PO').length;
    const rejectedCount = requisitions.filter(pr => pr.status === 'Rejected').length;

    const formatShortIDR = (num: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return [
      { label: 'Total Permintaan', count: totalCount, subValue: formatShortIDR(totalEst), variant: 'total' },
      { label: 'Menunggu Approval', count: pendingCount, variant: 'pending' },
      { label: 'Disetujui / PO', count: approvedCount, variant: 'approved' },
      { label: 'Ditolak', count: rejectedCount, variant: 'rejected' },
    ];
  }, [requisitions]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequisitions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequisitions.map(r => r.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Helper for drawer fields
  const getDrawerFields = (pr: PurchaseRequisition): DetailDrawerField[] => [
    { label: 'Nomor PR', value: pr.pr_number },
    { label: 'Requester', value: pr.requested_by },
    { label: 'Tanggal Buat', value: new Date(pr.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { label: 'Total Estimasi', value: formatCurrency(pr.total_estimated) },
    ...(pr.notes ? [{ label: 'Catatan', value: pr.notes, fullWidth: true }] : []),
    ...(pr.approved_by ? [{ label: 'Disetujui Oleh', value: `${pr.approved_by} (${pr.approved_at ? new Date(pr.approved_at).toLocaleDateString('id-ID') : ''})`, fullWidth: true }] : []),
  ];

  return (
    <ResponsiveShell title="Permintaan Dapur">
      <div className="min-h-full bg-background -m-4 sm:-m-6">
        {/* Header */}
        <div className="bg-surface border-b border-line px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Permintaan Dapur (PR)</h1>
            <p className="text-xs text-ink-muted">Kelola permintaan pembelian stok dari dapur & bar</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat PR Baru
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
            onPrint={() => toast('info', `Mencetak ${selectedIds.length} PR terpilih`)}
            onExport={() => toast('success', `Exporting ${selectedIds.length} items to CSV`)}
            onDelete={() => {
              toast('success', `${selectedIds.length} PR dihapus`);
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
                  placeholder="Cari nomor PR atau requester..."
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
                { key: 'Pending Approval', label: 'Menunggu' },
                { key: 'Approved', label: 'Disetujui' },
                { key: 'Converted to PO', label: 'Dikonversi' },
                { key: 'Rejected', label: 'Ditolak' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key as PRStatus)}
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
                Memuat data permintaan dapur...
              </div>
            ) : filteredRequisitions.length === 0 ? (
              <div className="text-center py-16 text-ink-muted">
                <FileStack className="h-12 w-12 mx-auto mb-3 opacity-30 text-ink-muted" />
                <p className="text-base font-semibold text-ink">Tidak ada data PR ditemukan</p>
                <p className="text-xs text-ink-muted">Coba ubah kata kunci pencarian atau filter status</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-alt border-b border-line text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredRequisitions.length && filteredRequisitions.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-line text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-6 py-3 text-left">Nomor PR</th>
                      <th className="px-6 py-3 text-left">Requester</th>
                      <th className="px-6 py-3 text-left">Jumlah Items</th>
                      <th className="px-6 py-3 text-left">Total Estimasi</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {filteredRequisitions.map((pr) => {
                      const itemCount = (pr.items && pr.items.length > 0) ? pr.items.length : (pr.total_estimated > 0 ? 1 : 0);
                      const isSelected = selectedIds.includes(pr.id);
                      return (
                        <tr
                          key={pr.id}
                          onClick={() => router.push(`/purchase/requisitions/${pr.id}`)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary-soft/40' : 'hover:bg-surface-alt'
                          }`}
                        >
                          <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelectOne(pr.id, e as any)}
                              className="rounded border-line text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-6 py-4 font-semibold text-ink">{pr.pr_number}</td>
                          <td className="px-6 py-4 text-ink-secondary">{pr.requested_by}</td>
                          <td className="px-6 py-4 text-ink-secondary">{itemCount} item(s)</td>
                          <td className="px-6 py-4 font-medium text-ink">{formatCurrency(pr.total_estimated)}</td>
                          <td className="px-6 py-4">
                            <PurchaseStatusBadge status={pr.status} />
                          </td>
                          <td className="px-6 py-4 text-ink-muted text-xs">
                            {new Date(pr.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Table Footer / Pagination */}
            {!loading && filteredRequisitions.length > 0 && (
              <div className="px-6 py-3 border-t border-line bg-surface-alt flex items-center justify-between text-xs text-ink-muted">
                <span>Menampilkan 1-{filteredRequisitions.length} dari {filteredRequisitions.length} data</span>
                <span>Purchase PR System</span>
              </div>
            )}
          </div>
        </div>

        {/* ERP Slide-over Right Detail Drawer */}
        {activeDrawerPR && (
          <PurchaseDetailDrawer
            isOpen={!!activeDrawerPR}
            onClose={() => setActiveDrawerPR(null)}
            title={`Detail ${activeDrawerPR.pr_number}`}
            subtitle={`Diminta oleh ${activeDrawerPR.requested_by}`}
            status={activeDrawerPR.status}
            fields={getDrawerFields(activeDrawerPR)}
            items={(activeDrawerPR.items || []).map((item, idx) => ({
              id: item.ingredient_id || idx,
              name: item.ingredient_name,
              quantity: item.quantity,
              unit: item.unit,
              price: item.estimated_price / (item.quantity || 1),
              total: item.estimated_price,
            }))}
            actions={
              activeDrawerPR.status === 'Pending Approval' && user?.role === 'admin' ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleReject(activeDrawerPR.id)}
                    disabled={processing}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Tolak PR
                  </Button>
                  <Button
                    onClick={() => handleApprove(activeDrawerPR.id)}
                    disabled={processing}
                  >
                    Setujui PR
                  </Button>
                </>
              ) : activeDrawerPR.status === 'Approved' ? (
                <Button
                  onClick={() => handleConvertToPO(activeDrawerPR.id)}
                  disabled={processing}
                >
                  Konversi ke PO
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setActiveDrawerPR(null)}>
                  Tutup
                </Button>
              )
            }
          />
        )}

        {/* Create PR Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-line">
              <div className="flex items-center justify-between p-6 border-b border-line">
                <h2 className="text-lg font-bold text-ink">Buat Purchase Requisition Baru</h2>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
                >
                  <X className="h-5 w-5 text-ink-muted" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Auto Restock Recommendation Box */}
                <div className="bg-primary-soft/50 border border-primary/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink">Otomatisasi Restok Stock</h3>
                      <p className="text-xs text-ink-muted">Muat bahan baku yang di bawah stok minimum</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleLoadAutoRestock}
                      disabled={processing}
                    >
                      Muat Rekomendasi Restok
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-ink-muted">Filter Supplier:</label>
                    <select
                      value={selectedSupplierFilter}
                      onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                      className="px-3 py-1 rounded-md border border-line bg-surface text-ink text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">Semua Supplier</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Add Item Form */}
                <div className="space-y-3 border-t border-line pt-4">
                  <h3 className="text-sm font-bold text-ink">Tambah Item Manual</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="text-xs font-medium text-ink-muted">Pilih Ingredient</label>
                      <select
                        value={selectedIngredient}
                        onChange={(e) => setSelectedIngredient(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Pilih bahan...</option>
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-muted">Jumlah (Quantity)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddItem} className="w-full">
                        + Tambah Item
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Added Items List */}
                {prItems.length > 0 && (
                  <div className="space-y-2 border-t border-line pt-4">
                    <h3 className="text-sm font-bold text-ink">Item Terdaftar ({prItems.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {prItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-line rounded-lg bg-surface-alt"
                        >
                          <div>
                            <p className="text-sm font-semibold text-ink">{item.ingredient_name}</p>
                            <p className="text-xs text-ink-muted">
                              {item.quantity} {item.unit} &bull; Est. {formatCurrency(item.estimated_price)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="border-t border-line pt-4">
                  <label className="text-xs font-medium text-ink-muted">Catatan Tambahan (opsional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Permintaan mendesak stok weekend..."
                    className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-line bg-surface">
                <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleCreatePR} disabled={processing || prItems.length === 0}>
                  {processing ? 'Memproses...' : 'Kirim PR'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveShell>
  );
}

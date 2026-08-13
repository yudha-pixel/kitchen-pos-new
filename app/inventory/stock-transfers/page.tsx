'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';

import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Modal } from '@/src/components/ui/Modal';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { Button } from '@/src/components/ui/Button';
import { PERMISSIONS } from '@/src/config/permissions';
import {
  createStockTransfer,
  getStockTransfers,
  getTransferableIngredients,
  getWarehouses,
  updateStockTransferStatus,
  type StockTransfer,
  type StockTransferStatus,
  type TransferIngredient,
  type TransferWarehouse,
} from '@/src/features/inventory/stockTransferService';

type StatusFilter = 'all' | StockTransferStatus;

interface DraftItem {
  ingredient_id: string;
  quantity: string;
}

const STATUS_CONFIG: Record<StockTransferStatus, { bg: string; text: string; icon: typeof Clock; label: string }> = {
  pending: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'Menunggu' },
  approved: { bg: 'bg-purple-100', text: 'text-purple-700', icon: CheckCircle, label: 'Disetujui' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Selesai' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Ditolak' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Dibatalkan' },
};

function StatusBadge({ status }: { status: StockTransferStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function StockTransfersPage() {
  const { toast } = useToast();
  const { can } = useAuth();
  const canTransfer = can(PERMISSIONS.inventory.transfer);

  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<TransferWarehouse[]>([]);
  const [ingredients, setIngredients] = useState<TransferIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [draftItems, setDraftItems] = useState<DraftItem[]>([{ ingredient_id: '', quantity: '' }]);

  const loadTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStockTransfers(statusFilter === 'all' ? undefined : { status: statusFilter });
      setTransfers(data);
    } catch (error) {
      console.error('Failed to load stock transfers:', error);
      toast('error', 'Gagal memuat data transfer stok');
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  useEffect(() => {
    (async () => {
      try {
        const [warehouseList, ingredientList] = await Promise.all([
          getWarehouses(),
          getTransferableIngredients(),
        ]);
        setWarehouses(warehouseList);
        setIngredients(ingredientList);
      } catch (error) {
        console.error('Failed to load warehouses/ingredients:', error);
      }
    })();
  }, []);

  const filteredTransfers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return transfers;
    return transfers.filter((t) =>
      t.transfer_number.toLowerCase().includes(q) ||
      (t.from_warehouse?.name.toLowerCase().includes(q) ?? false) ||
      (t.to_warehouse?.name.toLowerCase().includes(q) ?? false)
    );
  }, [transfers, searchQuery]);

  const ingredientsInSourceWarehouse = useMemo(
    () => ingredients.filter((ing) => ing.warehouse_id === fromWarehouseId),
    [ingredients, fromWarehouseId]
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const openDetail = (transfer: StockTransfer) => {
    setSelectedTransfer(transfer);
    setRejectionReason('');
    setDetailOpen(true);
  };

  const resetCreateForm = () => {
    setFromWarehouseId('');
    setToWarehouseId('');
    setTransferNotes('');
    setDraftItems([{ ingredient_id: '', quantity: '' }]);
  };

  const openCreate = () => {
    resetCreateForm();
    setCreateOpen(true);
  };

  const addDraftItem = () => setDraftItems((items) => [...items, { ingredient_id: '', quantity: '' }]);

  const updateDraftItem = (index: number, patch: Partial<DraftItem>) => {
    setDraftItems((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeDraftItem = (index: number) => {
    setDraftItems((items) => (items.length > 1 ? items.filter((_, i) => i !== index) : items));
  };

  const handleCreateTransfer = async () => {
    if (!fromWarehouseId || !toWarehouseId) {
      toast('error', 'Pilih gudang asal dan tujuan');
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      toast('error', 'Gudang asal dan tujuan tidak boleh sama');
      return;
    }
    const items = draftItems
      .filter((item) => item.ingredient_id && item.quantity)
      .map((item) => {
        const ingredient = ingredients.find((ing) => ing.id === item.ingredient_id);
        return {
          ingredient_id: item.ingredient_id,
          quantity: parseFloat(item.quantity),
          unit: ingredient?.unit ?? '',
        };
      });
    if (items.length === 0) {
      toast('error', 'Tambahkan minimal satu bahan baku untuk ditransfer');
      return;
    }
    if (items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      toast('error', 'Jumlah transfer harus lebih besar dari 0');
      return;
    }

    setProcessing(true);
    try {
      await createStockTransfer({
        from_warehouse_id: fromWarehouseId,
        to_warehouse_id: toWarehouseId,
        notes: transferNotes || undefined,
        items,
      });
      toast('success', 'Permintaan transfer stok berhasil dibuat');
      setCreateOpen(false);
      resetCreateForm();
      await loadTransfers();
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal membuat transfer stok');
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (status: StockTransferStatus, notes?: string) => {
    if (!selectedTransfer) return;
    setProcessing(true);
    try {
      await updateStockTransferStatus(selectedTransfer.id, { status, notes });
      toast('success', 'Status transfer berhasil diperbarui');
      setDetailOpen(false);
      setSelectedTransfer(null);
      setConfirmCancelOpen(false);
      await loadTransfers();
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal memperbarui status transfer');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ResponsiveShell title="Transfer Stok">
      <div className="min-h-full bg-slate-50 -m-4 sm:-m-6">
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Transfer Stok</h1>
                <p className="text-sm text-slate-500">Pindahkan bahan baku antar gudang/outlet</p>
              </div>
              {canTransfer && (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Buat Transfer
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nomor transfer atau gudang..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="completed">Selesai</option>
                <option value="rejected">Ditolak</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
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

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <ArrowLeftRight className="h-12 w-12 mb-4 text-slate-300" />
                <p className="text-lg font-medium">Tidak ada data</p>
                <p className="text-sm">Belum ada transfer stok yang ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">No. Transfer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Dari</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ke</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTransfers.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{transfer.transfer_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(transfer.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{transfer.from_warehouse?.name ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{transfer.to_warehouse?.name ?? '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{transfer.items.length} item</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={transfer.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => openDetail(transfer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary hover:bg-primary-soft transition-colors"
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
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedTransfer ? `Detail Transfer ${selectedTransfer.transfer_number}` : 'Detail Transfer'}
        size="lg"
      >
        {selectedTransfer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Dari Gudang</label>
                <p className="mt-1 text-sm font-medium text-ink">{selectedTransfer.from_warehouse?.name ?? '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Ke Gudang</label>
                <p className="mt-1 text-sm font-medium text-ink">{selectedTransfer.to_warehouse?.name ?? '-'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Status</label>
                <p className="mt-1"><StatusBadge status={selectedTransfer.status} /></p>
              </div>
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Tanggal</label>
                <p className="mt-1 text-sm text-ink-secondary">{formatDate(selectedTransfer.created_at)}</p>
              </div>
            </div>

            {selectedTransfer.notes && (
              <div>
                <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Catatan</label>
                <p className="mt-1 text-sm text-ink-secondary">{selectedTransfer.notes}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">Item Transfer</label>
              <div className="mt-2 overflow-x-auto rounded-lg border border-line">
                <table className="min-w-full divide-y divide-line">
                  <thead className="bg-surface-alt">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-ink-secondary">Bahan</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-ink-secondary">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {selectedTransfer.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-sm text-ink">{item.ingredient?.name ?? item.ingredient_id}</td>
                        <td className="px-3 py-2 text-sm text-ink-secondary">{item.quantity} {item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {canTransfer && selectedTransfer.status === 'pending' && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Alasan penolakan (jika menolak)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                  placeholder="Opsional, wajib diisi jika menolak"
                />
              </div>
            )}

            {canTransfer && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                {selectedTransfer.status === 'pending' && (
                  <>
                    <Button
                      variant="danger"
                      loading={processing}
                      onClick={() => {
                        if (!rejectionReason.trim()) {
                          toast('error', 'Mohon isi alasan penolakan');
                          return;
                        }
                        handleStatusChange('rejected', rejectionReason);
                      }}
                    >
                      Tolak
                    </Button>
                    <Button
                      variant="secondary"
                      loading={processing}
                      onClick={() => setConfirmCancelOpen(true)}
                    >
                      Batalkan
                    </Button>
                    <Button loading={processing} onClick={() => handleStatusChange('approved')}>
                      Setujui
                    </Button>
                  </>
                )}
                {selectedTransfer.status === 'approved' && (
                  <>
                    <Button
                      variant="secondary"
                      loading={processing}
                      onClick={() => setConfirmCancelOpen(true)}
                    >
                      Batalkan
                    </Button>
                    <Button loading={processing} onClick={() => handleStatusChange('completed')}>
                      Selesaikan
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={confirmCancelOpen}
        title="Batalkan Transfer"
        message={selectedTransfer ? `Batalkan transfer "${selectedTransfer.transfer_number}"? Stok yang telah dicadangkan akan dikembalikan ke gudang asal.` : ''}
        confirmLabel="Batalkan"
        cancelLabel="Tutup"
        danger
        loading={processing}
        onConfirm={() => handleStatusChange('cancelled')}
        onCancel={() => setConfirmCancelOpen(false)}
      />

      {/* Create Transfer Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => !processing && setCreateOpen(false)}
        title="Buat Transfer Stok"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={processing} className="flex-1">
              Batal
            </Button>
            <Button onClick={handleCreateTransfer} loading={processing} className="flex-1">
              Buat Transfer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Dari Gudang *</label>
              <select
                value={fromWarehouseId}
                onChange={(e) => setFromWarehouseId(e.target.value)}
                className="w-full min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none"
              >
                <option value="">Pilih gudang</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Ke Gudang *</label>
              <select
                value={toWarehouseId}
                onChange={(e) => setToWarehouseId(e.target.value)}
                className="w-full min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none"
              >
                <option value="">Pilih gudang</option>
                {warehouses.filter((wh) => wh.id !== fromWarehouseId).map((wh) => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-ink">Item Transfer *</label>
              <button
                type="button"
                onClick={addDraftItem}
                className="text-xs font-medium text-primary hover:text-primary-hover"
              >
                + Tambah Item
              </button>
            </div>
            <div className="space-y-2">
              {draftItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={item.ingredient_id}
                    onChange={(e) => updateDraftItem(index, { ingredient_id: e.target.value })}
                    disabled={!fromWarehouseId}
                    className="flex-1 min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none disabled:opacity-50"
                  >
                    <option value="">{fromWarehouseId ? 'Pilih bahan baku' : 'Pilih gudang asal dahulu'}</option>
                    {ingredientsInSourceWarehouse.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.current_stock} {ing.unit} tersedia)
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => updateDraftItem(index, { quantity: e.target.value })}
                    placeholder="Jumlah"
                    className="w-28 min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeDraftItem(index)}
                    aria-label="Hapus item"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-danger hover:bg-danger-soft"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Catatan</label>
            <textarea
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
              placeholder="Opsional"
            />
          </div>
        </div>
      </Modal>
    </ResponsiveShell>
  );
}

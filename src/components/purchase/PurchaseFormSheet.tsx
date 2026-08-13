'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Printer,
  Copy,
  Edit,
  Trash2,
  XCircle,
  ExternalLink,
  UserCheck,
  Building,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  History,
  ShoppingCart,
  Layers
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Notebook } from '@/src/components/ui/form/Notebook';
import { Page } from '@/src/components/ui/form/Page';
import { FormStatusBar } from '@/src/components/ui/form/FormStatusBar';
import { DocumentChatter, AuditLogItem } from '@/src/components/global/DocumentChatter';

export interface FormSheetLineItem {
  id: string | number;
  code?: string;
  name: string;
  category?: string;
  quantity: number | string;
  unit: string;
  unit_price?: number;
  total_price?: number;
  notes?: string;
}

export interface PurchaseFormSheetProps {
  documentTitle: string;
  documentNumber: string;
  status: string;
  pipelineSteps?: { key: string; label: string }[];
  activeStepKey?: string;

  // Metadata Grid
  requesterOrSupplierLabel?: string;
  requesterOrSupplierValue: string;
  requesterOrSupplierHref?: string;
  outletName?: string;
  outletHref?: string;
  notes?: string;
  submittedDate: string;
  approvedByDate?: string;
  totalAmount: number;

  // Actions & Odoo Smart Buttons
  primaryActions?: React.ReactNode;
  smartButtons?: { label: string; count?: number; href: string; icon?: 'po' | 'pr' | 'inv' | 'grn' }[];
  onPrint?: () => void;
  onDuplicate?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
  onDelete?: () => void;

  // Items & Chatter
  items: FormSheetLineItem[];
  itemsTitle?: string;
  auditLogs?: AuditLogItem[];
  entityType?: 'purchase_requisition' | 'purchase_order' | 'quotation' | 'goods_received' | 'invoice';
  entityId?: string;
}

export function PurchaseFormSheet({
  documentTitle,
  documentNumber,
  status,
  pipelineSteps = [
    { key: 'draft', label: 'Draf' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'converted', label: 'Dikonversi' },
  ],
  activeStepKey = 'pending',
  requesterOrSupplierLabel = 'Pemohon (Requester)',
  requesterOrSupplierValue,
  requesterOrSupplierHref = '/settings',
  outletName = 'Kitchen POS - Outlet Utama',
  outletHref = '/settings',
  notes,
  submittedDate,
  approvedByDate,
  totalAmount,
  primaryActions,
  smartButtons = [],
  onPrint,
  onDuplicate,
  onEdit,
  onReject,
  onDelete,
  items = [],
  auditLogs = [],
  entityType = 'purchase_requisition',
  entityId = 'doc-1',
}: PurchaseFormSheetProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  // Filter line items by mini search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // Paginate filtered items
  const totalItemsCount = filteredItems.length;
  const totalPages = Math.ceil(totalItemsCount / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const totalVolume = items.reduce((sum, item) => {
    const qty = typeof item.quantity === 'number' ? item.quantity : parseFloat(String(item.quantity)) || 0;
    return sum + qty;
  }, 0);

  const isConverted = status.toLowerCase().includes('converted') || status.toLowerCase().includes('dikonversi') || smartButtons.length > 0;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* LEFT MAIN SHEET (75% width / lg:col-span-3) */}
      <div className="lg:col-span-3 bg-surface border border-line rounded-xl p-6 shadow-xl text-ink space-y-6">
        {/* 1. Odoo 19 Clean Form Header (#PR-001 Title + Smart Buttons + FormStatusBar) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-line">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black tracking-tight font-mono text-ink">
                {documentNumber}
              </h1>
            </div>

            {/* Odoo 19 Smart Buttons Bar */}
            {smartButtons.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-2">
                {smartButtons.map((btn, idx) => (
                  <Link
                    key={idx}
                    href={btn.href}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary-soft text-primary font-bold text-xs border border-primary/20 hover:bg-primary hover:text-on-primary shadow-xs transition-colors group"
                  >
                    {btn.icon === 'po' ? (
                      <ShoppingCart className="h-3.5 w-3.5" />
                    ) : (
                      <FileText className="h-3.5 w-3.5" />
                    )}
                    <span>{btn.count ? `${btn.count} ` : ''}{btn.label}</span>
                    <span className="text-primary group-hover:text-on-primary font-mono">&rarr;</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Compact Workflow Status Bar */}
          <FormStatusBar steps={pipelineSteps} activeKey={activeStepKey || status} />
        </div>

        {/* 2. Compact Form Action Bar (Primary Actions + Triple Dots Overflow) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-alt/60 p-3 rounded-lg border border-line">
          <div className="flex items-center flex-wrap gap-2">
            {!isConverted && primaryActions}
          </div>

          {/* Triple Dots Overflow Menu (...) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-surface border border-line hover:bg-surface-alt transition-colors text-ink-secondary"
              title="Aksi Lainnya"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-surface border border-line rounded-lg shadow-xl z-30 py-1 text-xs font-medium text-ink animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setMenuOpen(false)}
              >
                {onPrint && (
                  <button
                    onClick={onPrint}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-surface-alt transition-colors"
                  >
                    <Printer className="h-4 w-4 text-ink-muted" />
                    Cetak PDF / Print
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={onDuplicate}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-surface-alt transition-colors"
                  >
                    <Copy className="h-4 w-4 text-ink-muted" />
                    Duplikat Dokumen
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-surface-alt transition-colors"
                  >
                    <Edit className="h-4 w-4 text-ink-muted" />
                    Edit Draf
                  </button>
                )}
                {onReject && (
                  <button
                    onClick={onReject}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-surface-alt text-rose-600 transition-colors border-t border-line"
                  >
                    <XCircle className="h-4 w-4 text-rose-500" />
                    Tolak / Batalkan
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                    Hapus Dokumen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Clickable Master Data Metadata Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-surface-alt/40 border border-line text-xs">
          <div>
            <span className="font-semibold text-ink-muted uppercase tracking-wider block">{requesterOrSupplierLabel}</span>
            <Link
              href={requesterOrSupplierHref}
              className="mt-1 inline-flex items-center gap-1.5 font-bold text-ink hover:text-primary transition-colors"
            >
              <span>{requesterOrSupplierValue}</span>
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </Link>
          </div>

          <div>
            <span className="font-semibold text-ink-muted uppercase tracking-wider block">Cabang / Outlet</span>
            <Link
              href={outletHref}
              className="mt-1 inline-flex items-center gap-1.5 font-semibold text-ink hover:text-primary transition-colors"
            >
              <span>{outletName}</span>
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </Link>
          </div>

          <div>
            <span className="font-semibold text-ink-muted uppercase tracking-wider block">Tanggal Pengajuan</span>
            <span className="mt-1 block font-medium text-ink">{submittedDate}</span>
          </div>

          <div>
            <span className="font-semibold text-ink-muted uppercase tracking-wider block">Total Estimasi</span>
            <span className="mt-0.5 block text-lg font-black text-primary font-mono">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* 4. Odoo 19 `<Notebook>` Component Architecture */}
        <Notebook defaultTab="items">
          {/* TAB 1: Rincian Item */}
          <Page id="items" label="Rincian Item" icon={FileText}>
            <div className="space-y-4 pt-2">
              {/* Mini Search Bar & Quick Filter */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-alt/30 p-2.5 rounded-lg border border-line">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Cari nama item / kode di dokumen ini..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md border border-line bg-surface text-ink text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Pagination Controls Header Info */}
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span>
                    Menampilkan <strong>{totalItemsCount > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> - <strong>{Math.min(currentPage * pageSize, totalItemsCount)}</strong> dari <strong>{totalItemsCount}</strong> item
                  </span>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded bg-surface border border-line disabled:opacity-40 hover:bg-surface-alt transition-colors"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-ink">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded bg-surface border border-line disabled:opacity-40 hover:bg-surface-alt transition-colors"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-line rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-surface-alt border-b border-line font-semibold text-ink-muted uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2.5 text-center w-8">#</th>
                      <th className="px-4 py-2.5 text-left">Kode Item</th>
                      <th className="px-4 py-2.5 text-left">Nama Bahan / Barang</th>
                      <th className="px-4 py-2.5 text-left">Kategori</th>
                      <th className="px-4 py-2.5 text-right">Jumlah (Qty)</th>
                      <th className="px-4 py-2.5 text-left">Satuan</th>
                      <th className="px-4 py-2.5 text-right">Est. Harga Satuan</th>
                      <th className="px-4 py-2.5 text-right">Subtotal</th>
                      <th className="px-4 py-2.5 text-left">Catatan Item</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-ink-muted">
                          Tidak ada item ditemukan.
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((item, idx) => {
                        const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                        return (
                          <tr key={item.id || idx} className="hover:bg-surface-alt/50 transition-colors">
                            <td className="px-3 py-3 text-center text-ink-muted">{globalIdx}</td>
                            <td className="px-4 py-3 font-mono text-xs">
                              <Link
                                href="/inventory"
                                className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                                title="Buka master barang di inventori"
                              >
                                <span>{item.code || `ING-${String(globalIdx).padStart(3, '0')}`}</span>
                                <ExternalLink className="h-2.5 w-2.5 text-primary opacity-60" />
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-bold text-ink">{item.name}</td>
                            <td className="px-4 py-3 text-ink-secondary">{item.category || 'Bahan Baku'}</td>
                            <td className="px-4 py-3 text-right font-semibold text-ink">{item.quantity}</td>
                            <td className="px-4 py-3 text-ink-muted">{item.unit}</td>
                            <td className="px-4 py-3 text-right text-ink-secondary">
                              {item.unit_price ? formatCurrency(item.unit_price) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-ink">
                              {item.total_price ? formatCurrency(item.total_price) : '-'}
                            </td>
                            <td className="px-4 py-3 text-ink-muted italic">{item.notes || '-'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sticky Line Items Summary Footer Bar */}
              <div className="bg-surface-alt border border-line rounded-lg p-3 flex flex-wrap items-center justify-between text-xs text-ink font-semibold">
                <span>Total Item: <strong>{items.length} Item(s)</strong></span>
                <span>Total Volume: <strong>{totalVolume.toFixed(2)} unit(s)</strong></span>
                <span className="text-sm font-black text-primary font-mono">
                  TOTAL ESTIMASI: {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </Page>

          {/* TAB 2: Informasi Lainnya */}
          <Page id="other-info" label="Informasi Lainnya" icon={Layers}>
            <div className="p-4 bg-surface-alt/30 border border-line rounded-lg space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-ink-muted uppercase block">Catatan & Justifikasi Pengadaan</span>
                  <p className="mt-1 text-ink-secondary italic bg-surface p-3 rounded border border-line">
                    "{notes || 'Tidak ada catatan tambahan.'}"
                  </p>
                </div>
                <div>
                  <span className="font-bold text-ink-muted uppercase block">Informasi Otorisasi & Disetujui</span>
                  <p className="mt-1 text-ink">{approvedByDate || 'Belum disetujui / Menunggu pengesahan.'}</p>
                </div>
              </div>
            </div>
          </Page>
        </Notebook>
      </div>

      {/* RIGHT CHATTER PANEL (25% width / lg:col-span-1) */}
      <div className="lg:col-span-1">
        <DocumentChatter entityType={entityType} entityId={entityId} initialLogs={auditLogs} />
      </div>
    </div>
  );
}

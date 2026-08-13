'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Hash, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { TableKpiCards, KpiCardItem } from '@/src/components/purchase/TableKpiCards';
import { ContextualActionBar } from '@/src/components/purchase/ContextualActionBar';
import { SequenceRecord } from './SequenceFormView';

interface SequenceListViewProps {
  sequences: SequenceRecord[];
  onSelectSequence: (seq: SequenceRecord) => void;
  onCreateNew: () => void;
  loading?: boolean;
}

export function SequenceListView({ sequences, onSelectSequence, onCreateNew, loading }: SequenceListViewProps) {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getLivePreview = (rule: SequenceRecord) => {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const yy = yyyy.slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const prefix = (rule.prefix || '')
      .replace(/\{YYYY\}/g, yyyy)
      .replace(/\{YY\}/g, yy)
      .replace(/\{MM\}/g, mm)
      .replace(/\{DD\}/g, dd);

    const suffix = (rule.suffix || '')
      .replace(/\{YYYY\}/g, yyyy)
      .replace(/\{YY\}/g, yy)
      .replace(/\{MM\}/g, mm)
      .replace(/\{DD\}/g, dd);

    const paddedNum = String(rule.next_number || 1).padStart(rule.padding || 3, '0');
    return `${prefix}${paddedNum}${suffix}`;
  };

  // Filter sequences
  const filteredSequences = useMemo(() => {
    return sequences.filter(seq => {
      const matchesCategory = categoryFilter === 'all' || seq.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        seq.name.toLowerCase().includes(q) ||
        seq.code.toLowerCase().includes(q) ||
        seq.prefix.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [sequences, categoryFilter, searchQuery]);

  // KPI cards calculation
  const kpiCards: KpiCardItem[] = useMemo(() => {
    const total = sequences.length;
    const active = sequences.filter(s => s.active !== false).length;
    const resetRules = sequences.filter(s => s.reset_frequency !== 'never').length;
    const nextSample = sequences.length > 0 ? getLivePreview(sequences[0]) : '-';

    return [
      { label: 'Total Document Sequences', count: total, variant: 'total' },
      { label: 'Sequence Aktif', count: active, variant: 'approved' },
      { label: 'Auto-Reset Rules', count: resetRules, variant: 'pending' },
      { label: 'Sample Output Utama', count: total, subValue: nextSample, variant: 'total' },
    ];
  }, [sequences]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSequences.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSequences.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface border border-line rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            Urutan Dokumen (Sequence Rules)
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            ERP Sequence Management (`ir.sequence`)
          </p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Sequence Baru
        </Button>
      </div>

      {/* KPI Cards */}
      <TableKpiCards cards={kpiCards} />

      {/* Sticky Contextual Action Bar */}
      <ContextualActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onPrint={() => toast('info', `Mencetak ${selectedIds.length} aturan sequence`)}
        onExport={() => toast('success', `Exporting ${selectedIds.length} sequence ke CSV`)}
        onDelete={() => {
          toast('success', `${selectedIds.length} sequence dihapus`);
          setSelectedIds([]);
        }}
      />

      {/* Toolbar Filters & Search */}
      <div className="bg-surface border border-line rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Cari nama, kode referensi (e.g. purchase.requisition), atau prefix..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {[
            { key: 'all', label: 'Semua Domain' },
            { key: 'purchasing', label: 'Pembelian' },
            { key: 'inventory', label: 'Inventori' },
            { key: 'sales', label: 'Penjualan / POS' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setCategoryFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                categoryFilter === tab.key
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-alt text-ink-secondary hover:bg-surface-alt/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ERP List View Table (No AKSI Column, Row Click Opens Form View) */}
      <div className="bg-surface rounded-xl shadow-xs border border-line overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-ink-muted">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
            Memuat daftar sequence dokumen...
          </div>
        ) : filteredSequences.length === 0 ? (
          <div className="text-center py-16 text-ink-muted">
            <Hash className="h-12 w-12 mx-auto mb-3 opacity-30 text-ink-muted" />
            <p className="text-base font-semibold text-ink">Tidak ada sequence ditemukan</p>
            <p className="text-xs text-ink-muted">Coba ubah kata kunci pencarian atau filter kategori</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-alt border-b border-line text-xs font-semibold text-ink-muted uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredSequences.length && filteredSequences.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-line text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left">Nama Urutan</th>
                  <th className="px-6 py-3 text-left">Kode Referensi</th>
                  <th className="px-6 py-3 text-left">Format (Prefix / Suffix)</th>
                  <th className="px-6 py-3 text-left">Sample Next Output</th>
                  <th className="px-6 py-3 text-left">Counter</th>
                  <th className="px-6 py-3 text-left">Reset Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm">
                {filteredSequences.map((seq) => {
                  const isSelected = selectedIds.includes(seq.id);
                  const sampleOutput = getLivePreview(seq);

                  return (
                    <tr
                      key={seq.id}
                      onClick={() => onSelectSequence(seq)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-soft/40' : 'hover:bg-surface-alt'
                      }`}
                    >
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectOne(seq.id, e as any)}
                          className="rounded border-line text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-ink">
                        <div className="flex items-center gap-2">
                          <span>{seq.name}</span>
                          {seq.active !== false && (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" title="Sequence Aktif" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-ink-secondary font-mono text-xs">
                        {seq.code}
                      </td>
                      <td className="px-6 py-4 text-ink font-mono text-xs">
                        <span className="text-primary font-semibold">{seq.prefix}</span>
                        <span className="text-ink-muted">[{'0'.repeat(seq.padding)}]</span>
                        <span className="text-primary font-semibold">{seq.suffix}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-primary-soft text-primary border border-primary/20">
                          {sampleOutput}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-ink">
                        {seq.next_number}
                      </td>
                      <td className="px-6 py-4 text-ink-muted text-xs capitalize">
                        {seq.reset_frequency === 'yearly' ? 'Tahunan (1 Jan)' : seq.reset_frequency === 'monthly' ? 'Bulanan' : 'Tidak Pernah'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && filteredSequences.length > 0 && (
          <div className="px-6 py-3 border-t border-line bg-surface-alt flex items-center justify-between text-xs text-ink-muted">
            <span>Menampilkan 1-{filteredSequences.length} dari {filteredSequences.length} sequence</span>
            <span>ERP ir.sequence Engine</span>
          </div>
        )}
      </div>
    </div>
  );
}

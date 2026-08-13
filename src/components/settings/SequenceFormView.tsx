'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { Save, RefreshCw, X, Zap, Hash, HelpCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { DocumentSequenceRule } from '@/server/lib/sequence';

export interface SequenceRecord extends DocumentSequenceRule {
  id: string;
  name: string;
  code: string;
  category: 'purchasing' | 'inventory' | 'sales' | 'finance';
  implementation_type?: 'standard' | 'no_gap';
  step_size?: number;
  active?: boolean;
}

interface SequenceFormViewProps {
  sequence: SequenceRecord;
  onSave: (updated: SequenceRecord) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
}

export function SequenceFormView({ sequence: initialSeq, onSave, onClose, saving }: SequenceFormViewProps) {
  const { toast } = useToast();
  const [seq, setSeq] = useState<SequenceRecord>({
    ...initialSeq,
    step_size: initialSeq.step_size || 1,
    implementation_type: initialSeq.implementation_type || 'standard',
    active: initialSeq.active !== undefined ? initialSeq.active : true,
  });

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

  const livePreview = getLivePreview(seq);

  const handleInsertToken = (token: string, field: 'prefix' | 'suffix') => {
    setSeq(prev => ({
      ...prev,
      [field]: (prev[field] || '') + token,
    }));
  };

  const handleTestGenerate = () => {
    toast('success', `⚡ Hasil Uji Sequence: ${livePreview}`);
  };

  const handleResetCounter = () => {
    setSeq(prev => ({ ...prev, next_number: 1 }));
    toast('info', 'Counter urutan telah diset ulang ke 1 (Klik simpan untuk menerapkan)');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(seq);
  };

  return (
    <div className="bg-surface text-ink border border-line rounded-xl shadow-lg overflow-hidden transition-all duration-200">
      {/* ERP Form Action Bar / Breadcrumb Header */}
      <div className="px-6 py-4 border-b border-line bg-surface-alt flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors text-ink-secondary hover:text-ink"
            title="Kembali ke List View"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Form View &bull; {seq.category}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle className="h-3 w-3 mr-1" /> Aktif
              </span>
            </div>
            <h2 className="text-xl font-bold text-ink">{seq.name}</h2>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestGenerate}
            className="flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Uji Generate
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetCounter}
            className="flex items-center gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset ke 1
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface transition-colors ml-2"
          >
            <X className="h-5 w-5 text-ink-muted" />
          </button>
        </div>
      </div>

      {/* Form Content Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Live Sample Preview Banner */}
        <div className="p-4 rounded-xl bg-primary-soft/40 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Live Output Sequence Preview
            </span>
            <p className="text-xs text-ink-secondary">Hasil penomoran otomatis untuk dokumen berikutnya</p>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-black text-primary bg-surface px-4 py-2 rounded-lg border border-primary/30 shadow-xs">
            {livePreview}
          </div>
        </div>

        {/* Section 1: General Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider border-b border-line pb-2">
            1. Informasi Umut & Kode Referensi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-muted">Nama Urutan (Sequence Name)</label>
              <input
                type="text"
                value={seq.name}
                onChange={(e) => setSeq({ ...seq, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted">Kode Referensi ERP (Sequence Code)</label>
              <input
                type="text"
                value={seq.code}
                onChange={(e) => setSeq({ ...seq, code: e.target.value })}
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted">Domain / Kategori</label>
              <select
                value={seq.category}
                onChange={(e) => setSeq({ ...seq, category: e.target.value as any })}
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="purchasing">Pembelian (Purchasing)</option>
                <option value="inventory">Inventori (Inventory)</option>
                <option value="sales">Penjualan & POS (Sales)</option>
                <option value="finance">Keuangan (Finance)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted">Tipe Implementasi</label>
              <select
                value={seq.implementation_type}
                onChange={(e) => setSeq({ ...seq, implementation_type: e.target.value as any })}
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="standard">Standard Auto-Increment</option>
                <option value="no_gap">No Gap (Strict Sequential Audit)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Sequence Pattern & Formatting */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-ink-muted uppercase tracking-wider border-b border-line pb-2">
            2. Format Penomoran & Counter
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-muted">Prefix (Awalan)</label>
              <input
                type="text"
                value={seq.prefix}
                onChange={(e) => setSeq({ ...seq, prefix: e.target.value })}
                placeholder="Contoh: PR/{YYYY}/"
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted">Suffix (Akhiran)</label>
              <input
                type="text"
                value={seq.suffix}
                onChange={(e) => setSeq({ ...seq, suffix: e.target.value })}
                placeholder="Contoh: -BOH"
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted">Panjang Digits (Padding)</label>
              <select
                value={seq.padding}
                onChange={(e) => setSeq({ ...seq, padding: parseInt(e.target.value) || 3 })}
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={3}>3 Digits (e.g. 001)</option>
                <option value={4}>4 Digits (e.g. 0001)</option>
                <option value={5}>5 Digits (e.g. 00001)</option>
                <option value={6}>6 Digits (e.g. 000001)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted">Nomor Berikutnya (Next Counter)</label>
              <input
                type="number"
                min="1"
                value={seq.next_number}
                onChange={(e) => setSeq({ ...seq, next_number: parseInt(e.target.value) || 1 })}
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted">Step / Inkremen</label>
              <input
                type="number"
                min="1"
                value={seq.step_size}
                onChange={(e) => setSeq({ ...seq, step_size: parseInt(e.target.value) || 1 })}
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-muted">Aturan Reset Counter</label>
              <select
                value={seq.reset_frequency}
                onChange={(e) => setSeq({ ...seq, reset_frequency: e.target.value as any })}
                className="mt-1 w-full rounded-lg border border-line bg-surface text-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="never">Tidak Pernah (Auto-increment)</option>
                <option value="yearly">Tahunan (Reset setiap 1 Jan)</option>
                <option value="monthly">Bulanan (Reset setiap awal bulan)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date Token Legend Helper Box */}
        <div className="p-4 rounded-lg bg-surface-alt border border-line space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>Variabel Tanggal Dinamis (Klik untuk menyisipkan):</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { token: '{YYYY}', label: 'Tahun 4 Digit (2026)' },
              { token: '{YY}', label: 'Tahun 2 Digit (26)' },
              { token: '{MM}', label: 'Bulan 2 Digit (08)' },
              { token: '{DD}', label: 'Tanggal 2 Digit (13)' },
            ].map(t => (
              <button
                key={t.token}
                type="button"
                onClick={() => handleInsertToken(t.token, 'prefix')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface border border-line hover:border-primary text-ink text-xs font-mono transition-colors"
                title={`Sisipkan ke Prefix: ${t.label}`}
              >
                <span className="text-primary font-bold">{t.token}</span>
                <span className="text-ink-muted text-[10px]">({t.label})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-line flex items-center justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={saving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Sequence'}
          </Button>
        </div>
      </form>
    </div>
  );
}

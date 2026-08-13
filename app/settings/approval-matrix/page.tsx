'use client';

import { useState } from 'react';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { ShieldCheck, Plus, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { DEFAULT_APPROVAL_MATRIX, ApprovalRule } from '@/src/services/approval/approvalEngine';

export default function ApprovalMatrixPage() {
  const { toast } = useToast();
  const [matrix, setMatrix] = useState<ApprovalRule[]>(DEFAULT_APPROVAL_MATRIX);
  const [saving, setSaving] = useState(false);

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleAddRule = () => {
    const newRule: ApprovalRule = {
      id: `rule_${Date.now()}`,
      module: 'pr',
      min_amount: 0,
      max_amount: 5000000,
      required_role: 'kitchen_manager',
      auto_approve: false,
    };
    setMatrix([...matrix, newRule]);
    toast('info', 'Aturan matriks approval baru ditambahkan');
  };

  const handleDeleteRule = (id: string) => {
    setMatrix(matrix.filter(r => r.id !== id));
    toast('success', 'Aturan berhasil dihapus');
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast('success', 'Matriks Approval Pengadaan berhasil disimpan');
    }, 600);
  };

  return (
    <ResponsiveShell title="Pengaturan Matriks Approval">
      <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header Card */}
          <div className="bg-surface border border-line rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Matriks Approval Pengadaan (Approval Matrix)
              </h1>
              <p className="text-xs text-ink-muted mt-0.5">
                Konfigurasi batas nominal pengadaan & role pengesah dokumen ERP (Segregation of Duties)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleAddRule} className="flex items-center gap-1.5 text-xs">
                <Plus className="h-4 w-4" />
                Tambah Aturan
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-xs">
                <Save className="h-4 w-4" />
                {saving ? 'Menyimpan...' : 'Simpan Matriks'}
              </Button>
            </div>
          </div>

          {/* Rules Table */}
          <div className="bg-surface border border-line rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-surface-alt border-b border-line font-semibold text-ink-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Modul Dokumen</th>
                    <th className="px-4 py-3 text-right">Min Nominal (Rp)</th>
                    <th className="px-4 py-3 text-right">Max Nominal (Rp)</th>
                    <th className="px-4 py-3 text-left">Required Role Pengesah</th>
                    <th className="px-4 py-3 text-center">Auto Approve</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {matrix.map((rule) => (
                    <tr key={rule.id} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-ink uppercase">
                        <select
                          value={rule.module}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setMatrix(matrix.map(r => r.id === rule.id ? { ...r, module: val } : r));
                          }}
                          className="bg-surface border border-line rounded px-2 py-1 text-xs text-ink font-semibold"
                        >
                          <option value="pr">Permintaan Dapur (PR)</option>
                          <option value="po">Pesanan Pembelian (PO)</option>
                          <option value="invoice">Faktur Supplier (INV)</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-ink">
                        <input
                          type="number"
                          value={rule.min_amount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setMatrix(matrix.map(r => r.id === rule.id ? { ...r, min_amount: val } : r));
                          }}
                          className="w-28 text-right bg-surface border border-line rounded px-2 py-1 font-mono text-xs text-ink"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-ink">
                        <input
                          type="number"
                          value={rule.max_amount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setMatrix(matrix.map(r => r.id === rule.id ? { ...r, max_amount: val } : r));
                          }}
                          className="w-32 text-right bg-surface border border-line rounded px-2 py-1 font-mono text-xs text-ink"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={rule.required_role}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setMatrix(matrix.map(r => r.id === rule.id ? { ...r, required_role: val } : r));
                          }}
                          className="bg-surface border border-line rounded px-2 py-1 text-xs text-ink font-semibold"
                        >
                          <option value="supervisor">Supervisor Area</option>
                          <option value="kitchen_manager">Kitchen Manager</option>
                          <option value="general_manager">General Manager</option>
                          <option value="admin">System Administrator</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={rule.auto_approve}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setMatrix(matrix.map(r => r.id === rule.id ? { ...r, auto_approve: val } : r));
                          }}
                          className="rounded border-line text-primary focus:ring-primary h-4 w-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus aturan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-surface-alt border-t border-line text-xs text-ink-muted flex items-center justify-between">
              <span>Menampilkan {matrix.length} aturan matriks approval aktif</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Matriks Siap Evaluasi
              </span>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveShell>
  );
}

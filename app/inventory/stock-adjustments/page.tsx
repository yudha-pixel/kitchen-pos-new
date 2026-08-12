'use client';

import { useState, useEffect } from 'react';
import { History } from 'lucide-react';

import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { useToast } from '@/src/components/ui/Toast';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

interface StockAdjustmentLogEntry {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  unit: string;
  previous_stock: number;
  new_stock: number;
  delta: number;
  adjustment_type: string;
  reason: string | null;
  user_name: string | null;
  created_at: string;
}

export default function StockAdjustmentsPage() {
  const { toast } = useToast();
  const [adjustmentLog, setAdjustmentLog] = useState<StockAdjustmentLogEntry[]>([]);
  const [adjustmentLogLoading, setAdjustmentLogLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setAdjustmentLogLoading(true);
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/api/ingredients/adjustments?limit=100`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to load stock adjustments: ${res.status}`);
        const data: StockAdjustmentLogEntry[] = await res.json();
        if (!cancelled) setAdjustmentLog(data);
      } catch (error) {
        console.error('Failed to load stock adjustments:', error);
        if (!cancelled) toast('error', 'Gagal memuat riwayat penyesuaian stok');
      } finally {
        if (!cancelled) setAdjustmentLogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <ResponsiveShell title="Riwayat Penyesuaian Stok">
      <main className="flex-1 flex flex-col overflow-hidden bg-surface-alt">
        <div className="border-b border-line bg-surface px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-ink-secondary" aria-hidden="true" />
            <h1 className="text-lg font-semibold text-ink">Riwayat Penyesuaian Stok</h1>
          </div>
          <p className="mt-1 text-sm text-ink-secondary">
            Setiap perubahan stok manual dan penerimaan barang dari supplier, di semua bahan baku.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {adjustmentLogLoading ? (
            <div className="p-6 text-center text-ink-secondary">Memuat riwayat...</div>
          ) : adjustmentLog.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center">
              <History className="mx-auto h-8 w-8 text-ink-muted" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-semibold text-ink">Belum ada riwayat penyesuaian</h3>
              <p className="mt-1 text-xs text-ink-secondary">
                Penyesuaian stok manual dan penerimaan barang akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-line bg-surface shadow-xs">
              <table className="min-w-full divide-y divide-line">
                <thead className="bg-surface-alt">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">Bahan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">Perubahan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">Tipe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">Alasan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">Oleh</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-ink-secondary uppercase tracking-wider">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {adjustmentLog.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-alt">
                      <td className="px-4 py-3 text-sm font-medium text-ink whitespace-nowrap">{log.ingredient_name}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap tabular-nums">
                        <span className="text-ink-secondary">{log.previous_stock} {log.unit}</span>
                        <span className="mx-1 text-ink-muted">&rarr;</span>
                        <span className="text-ink">{log.new_stock} {log.unit}</span>
                        <span className={`ml-2 font-medium ${log.delta > 0 ? 'text-success' : log.delta < 0 ? 'text-danger' : 'text-ink-muted'}`}>
                          ({log.delta > 0 ? '+' : ''}{log.delta} {log.unit})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-secondary whitespace-nowrap capitalize">{log.adjustment_type}</td>
                      <td className="px-4 py-3 text-sm text-ink-secondary max-w-xs truncate">{log.reason || '-'}</td>
                      <td className="px-4 py-3 text-sm text-ink-secondary whitespace-nowrap">{log.user_name || 'Sistem'}</td>
                      <td className="px-4 py-3 text-sm text-ink-muted whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </ResponsiveShell>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePageHeader } from '@/src/context/PageHeaderContext';
import { Badge } from '@/src/components/ui/Badge';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah, formatTime } from '@/src/lib/format';
import { API_BASE_URL } from '@/src/config/runtime';
import { getToken } from '@/src/lib/api';
import { AlertCircle, Check, X, RefreshCw, Inbox } from 'lucide-react';

interface PendingOrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  modifiers_applied: { name: string }[] | null;
  product: { name: string } | null;
}

interface PendingOrder {
  id: string;
  customer_name: string | null;
  total_amount: number;
  payment_method: string | null;
  payment_status: string;
  payment_reference: string | null;
  created_at: string;
  table: { table_number: string };
  items: PendingOrderItem[];
}

const POLL_INTERVAL_MS = 15000;

// The staff side of the manual accept/reject flow built in Phase 5 Step 2 — without
// this page, a guest's request has no way to reach a human. Polls rather than
// pushes: matches the KDS's own auto_refresh convention rather than adding
// websockets for what is, in a single-outlet dev deployment, a small queue.
export default function SelfOrderRequestsPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  const fetchPending = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/self-order/orders/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Gagal memuat pesanan masuk (${res.status})`);
      setOrders(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat pesanan masuk');
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending(true);
    const interval = setInterval(() => fetchPending(false), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const act = async (orderId: string, action: 'accept' | 'reject' | 'verify-payment-and-accept') => {
    setActingOnId(orderId);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/self-order/orders/${orderId}/${action}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || 'Gagal memproses pesanan');

      toast('success', action === 'reject' ? 'Pesanan ditolak' : 'Pesanan dikirim ke dapur');
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setActingOnId(null);
    }
  };

  usePageHeader({ title: 'Pesanan Masuk' });

  return (
    <div className="flex h-dvh flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink sm:text-3xl">Pesanan Masuk</h1>
              <p className="mt-1 text-ink-muted">Permintaan pesanan dari QR meja yang menunggu konfirmasi</p>
            </div>
            <button
              onClick={() => fetchPending(true)}
              aria-label="Muat ulang"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line hover:bg-surface-alt"
            >
              <RefreshCw className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Memuat pesanan masuk">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl border border-line bg-surface-alt" />
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-danger">{error}</h3>
                  <button
                    onClick={() => fetchPending(true)}
                    className="mt-3 flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary hover:bg-primary/90"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Coba lagi
                  </button>
                </div>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-line bg-surface-alt p-10 text-center">
              <Inbox className="h-8 w-8 text-ink-muted" aria-hidden="true" />
              <p className="font-medium text-ink">Tidak ada pesanan menunggu</p>
              <p className="text-sm text-ink-muted">Permintaan baru dari QR meja akan muncul di sini secara otomatis.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-sm font-semibold text-primary">
                        {order.table.table_number}
                      </span>
                      {order.customer_name && <span className="text-sm text-ink-secondary">{order.customer_name}</span>}
                      <span className="text-xs text-ink-muted">{formatTime(order.created_at)}</span>
                    </div>
                    <Badge tone={order.payment_status === 'pending' ? 'warning' : 'info'}>
                      {order.payment_method ?? '—'} · {order.payment_status}
                    </Badge>
                  </div>

                  <div className="mb-3 space-y-1">
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm">
                        <span className="font-medium">{item.quantity}x {item.product?.name ?? 'Produk dihapus'}</span>
                        {item.modifiers_applied && item.modifiers_applied.length > 0 && (
                          <span className="text-ink-muted"> — {item.modifiers_applied.map((m) => m.name).join(', ')}</span>
                        )}
                      </p>
                    ))}
                  </div>

                  {['qris', 'transfer'].includes(order.payment_method ?? '') && (
                    <div className={`mb-3 rounded-lg border p-3 text-sm ${order.payment_reference ? 'border-line bg-surface-alt' : 'border-warning/40 bg-warning-soft'}`}>
                      <p className="font-medium text-ink">Referensi pembayaran</p>
                      <p className="mt-1 break-all text-ink-secondary">
                        {order.payment_reference ?? 'Pesanan lama: tidak ada referensi. Verifikasi bukti secara manual sebelum melanjutkan.'}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-line pt-3">
                    <span className="font-bold text-primary">{formatRupiah(order.total_amount)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => act(order.id, 'reject')}
                        disabled={actingOnId === order.id}
                        className="flex min-h-11 items-center gap-2 rounded-lg bg-danger px-4 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                        Tolak
                      </button>
                      <button
                        onClick={() => act(
                          order.id,
                          ['qris', 'transfer'].includes(order.payment_method ?? '')
                            ? 'verify-payment-and-accept'
                            : 'accept'
                        )}
                        disabled={actingOnId === order.id}
                        className="flex min-h-11 items-center gap-2 rounded-lg bg-success px-4 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {['qris', 'transfer'].includes(order.payment_method ?? '')
                          ? 'Verifikasi Pembayaran & Kirim ke Dapur'
                          : 'Kirim ke Dapur'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

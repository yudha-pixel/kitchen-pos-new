'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, AlertCircle, ChefHat, Wine, ArrowLeft, RefreshCw, Flame } from 'lucide-react';
import * as api from '@/src/lib/api';
import { useToast } from '@/src/components/ui/Toast';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Spinner } from '@/src/components/ui/Spinner';
import { formatTime, formatElapsed, elapsedMinutes } from '@/src/lib/format';

interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  price_at_time: number;
  modifiers_applied: any;
  product?: {
    name: string;
    category?: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  table_number: string | null;
  created_at: string;
  status: string;
  notes: string | null;
  items: OrderItem[];
}

// Urgency thresholds in minutes (knowledge/02: color-coded urgency timers)
const URGENCY_WARN_MIN = 10;
const URGENCY_LATE_MIN = 20;

type Urgency = 'ok' | 'warn' | 'late';

const getUrgency = (createdAt: string): Urgency => {
  const mins = elapsedMinutes(createdAt);
  if (mins >= URGENCY_LATE_MIN) return 'late';
  if (mins >= URGENCY_WARN_MIN) return 'warn';
  return 'ok';
};

const urgencyStyles: Record<Urgency, { border: string; chip: string; label: string }> = {
  ok: { border: 'border-l-green-500', chip: 'bg-green-500/15 text-green-400', label: 'Baru' },
  warn: { border: 'border-l-amber-500', chip: 'bg-amber-500/15 text-amber-400', label: 'Perhatian' },
  late: { border: 'border-l-red-500', chip: 'bg-red-500/15 text-red-400', label: 'Terlambat' },
};

export default function KitchenDisplayPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'kitchen' | 'bar'>('all');
  // Ticks every 30s so elapsed times and urgency colors stay current
  const [, setTick] = useState(0);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      // /orders/active returns pending + preparing orders with items,
      // product, and category joined in a single call
      const data = await api.fetchActiveOrders();
      setOrders(data as Order[]);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast('error', 'Gagal memuat order. Coba refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    const initial = setTimeout(() => fetchOrders(true), 0);
    const refresh = setInterval(() => fetchOrders(true), 30000);
    const timerTick = setInterval(() => setTick((t) => t + 1), 30000);
    return () => {
      clearTimeout(initial);
      clearInterval(refresh);
      clearInterval(timerTick);
    };
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      toast('success', status === 'preparing' ? 'Order diproses' : 'Order selesai');
      await fetchOrders(true);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast('error', 'Gagal mengubah status order. Coba lagi.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;

    const hasKitchenItems = order.items.some(item =>
      item.product?.category?.name?.toLowerCase().includes('makanan') ||
      item.product?.category?.name?.toLowerCase().includes('food')
    );

    const hasBarItems = order.items.some(item =>
      item.product?.category?.name?.toLowerCase().includes('minuman') ||
      item.product?.category?.name?.toLowerCase().includes('drink')
    );

    if (filter === 'kitchen') return hasKitchenItems;
    if (filter === 'bar') return hasBarItems;

    return true;
  });

  const filterButtons = [
    { key: 'all' as const, label: 'Semua', Icon: null },
    { key: 'kitchen' as const, label: 'Dapur', Icon: ChefHat },
    { key: 'bar' as const, label: 'Bar', Icon: Wine },
  ];

  return (
    <div data-theme="kds" className="min-h-dvh bg-kds-bg text-kds-text">
      {/* Header */}
      <div className="border-b border-kds-border bg-kds-surface p-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Kembali"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-kds-text-secondary transition-colors hover:bg-kds-surface-alt"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <ChefHat className="h-8 w-8 text-orange-500" aria-hidden="true" />
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
          </div>

          <div className="flex items-center gap-2" role="group" aria-label="Filter station">
            {filterButtons.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`flex min-h-11 items-center gap-2 rounded-lg px-4 font-medium transition-colors ${
                  filter === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-kds-surface-alt text-kds-text-secondary hover:bg-slate-600'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="tnum hidden text-xs text-kds-text-secondary sm:inline">
                Diperbarui {formatTime(lastRefreshed)}
              </span>
            )}
            <button
              onClick={() => fetchOrders()}
              disabled={refreshing}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-sky-700 px-4 font-medium text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-orange-500">
            <Spinner size="lg" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyState icon={AlertCircle} title="Tidak ada order pending" message="Order baru akan muncul di sini" />
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOrders.map((order) => {
              const urgency = getUrgency(order.created_at);
              const { border, chip, label } = urgencyStyles[urgency];
              const busy = updatingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className={`overflow-hidden rounded-lg border border-kds-border border-l-4 bg-kds-surface ${border}`}
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between bg-kds-surface-alt p-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-bold">{order.table_number || 'Take Away'}</span>
                        <span className="rounded bg-orange-500 px-2 py-1 text-xs font-medium text-white">
                          #{order.id.slice(0, 6)}
                        </span>
                        {order.status === 'preparing' && (
                          <span className="flex items-center gap-1 rounded bg-yellow-600 px-2 py-1 text-xs font-medium text-white">
                            <Flame className="h-3 w-3" aria-hidden="true" /> Diproses
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-kds-text-secondary">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        <span className="tnum">{formatTime(order.created_at)}</span>
                        <span aria-hidden="true">•</span>
                        <span className={`tnum flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold ${chip}`}>
                          {formatElapsed(order.created_at)} — {label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items — large type for distance reading */}
                  <div className="space-y-3 p-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="border-l-4 border-orange-500 pl-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="tnum text-xl font-bold">{item.quantity}x</span>
                          <span className="flex-1 text-right text-lg font-medium">
                            {item.product?.name || 'Unknown'}
                          </span>
                        </div>
                        {item.modifiers_applied && Array.isArray(item.modifiers_applied) && item.modifiers_applied.length > 0 && (
                          <div className="mt-1 text-sm text-kds-text-secondary">
                            {item.modifiers_applied.map((mod: any, idx: number) => (
                              <span key={idx} className="block">+ {mod.name || mod}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="px-4 pb-3">
                      <div className="rounded border border-yellow-700 bg-yellow-900/30 p-2 text-sm text-yellow-200">
                        <span className="font-bold">Catatan:</span> {order.notes}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-kds-border p-4">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        disabled={busy}
                        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-600 font-medium text-white transition-colors hover:bg-yellow-700 active:scale-[0.98] disabled:opacity-50"
                      >
                        {busy ? <Spinner size="sm" /> : <Flame className="h-4 w-4" aria-hidden="true" />}
                        Proses
                      </button>
                    )}
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      disabled={busy}
                      className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 font-medium text-white transition-colors hover:bg-green-700 active:scale-[0.98] disabled:opacity-50"
                    >
                      {busy ? <Spinner size="sm" /> : <CheckCircle className="h-4 w-4" aria-hidden="true" />}
                      Selesai
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

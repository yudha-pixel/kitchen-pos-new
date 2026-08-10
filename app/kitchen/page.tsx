'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, AlertCircle, ChefHat, Wine, ArrowLeft, RefreshCw, Flame, Bell } from 'lucide-react';
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
  status: string;
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
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const previousOrderCountRef = useRef(0);
  // Ticks every 30s so elapsed times and urgency colors stay current
  const [, setTick] = useState(0);

  const playNotificationSound = () => {
    // Create audio context for notification sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      
      // Play a second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 1000;
        osc2.type = 'sine';
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.2);
      }, 250);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      // /orders/active returns pending + preparing orders with items,
      // product, and category joined in a single call
      const data = await api.fetchActiveOrders();
      const newOrders = data as Order[];
      
      // Check for new orders (compare with previous count)
      const currentOrderCount = newOrders.length;
      const previousCount = previousOrderCountRef.current;
      
      if (currentOrderCount > previousCount && previousCount > 0) {
        const newOrdersCount = currentOrderCount - previousCount;
        setNewOrderCount(newOrdersCount);
        setShowNotification(true);
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
        
        // Play notification sound
        playNotificationSound();
      }
      
      setOrders(newOrders);
      setLastRefreshed(new Date());
      previousOrderCountRef.current = currentOrderCount;
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

    // Listen for orderCreated events to refresh orders in real-time
    const handleOrderCreated = () => {
      console.log('📡 Received orderCreated event, refreshing kitchen orders...');
      fetchOrders(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orderCreated', handleOrderCreated);
      console.log('🔍 [Kitchen Page] Listening for orderCreated events');
    }

    return () => {
      clearTimeout(initial);
      clearInterval(refresh);
      clearInterval(timerTick);
      if (typeof window !== 'undefined') {
        window.removeEventListener('orderCreated', handleOrderCreated);
        console.log('🔍 [Kitchen Page] Stopped listening for orderCreated events');
      }
    };
  }, [fetchOrders]);

  const updateItemStatus = async (itemId: string, status: string) => {
    setUpdatingOrderId(itemId);
    try {
      await api.updateOrderItemStatus(itemId, status);

      // Also update status in IndexedDB for local order history
      try {
        const { db } = await import('@/src/lib/db');
        await db.order_items.where('id').equals(itemId).modify({ status });
        console.log(`✅ Updated item ${itemId} status to ${status} in IndexedDB`);
      } catch (dbError) {
        console.error('Failed to update item status in IndexedDB:', dbError);
        // Don't fail the operation if IndexedDB update fails
      }

      // Remove completed items from local state for instant feedback
      if (status === 'completed') {
        setOrders(prevOrders => {
          return prevOrders.map(order => ({
            ...order,
            items: order.items.filter(item => item.id !== itemId),
          })).filter(order => order.items.length > 0);
        });

        // Check if all items in the order are completed and update order status
        try {
          const { db } = await import('@/src/lib/db');
          const item = await db.order_items.get(itemId);
          if (item) {
            const allItems = await db.order_items.where('order_id').equals(item.order_id).toArray();
            const allCompleted = allItems.every(i => i.status === 'completed');
            
            if (allCompleted) {
              await db.orders.where('id').equals(item.order_id).modify((order) => {
                order.status = 'done';
              });
              console.log(`✅ Updated order ${item.order_id} status to 'done'`);
              
              // Dispatch event to notify Cashier page that order is ready
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('orderReady', { 
                  detail: { orderId: item.order_id } 
                }));
                console.log('📡 Dispatched orderReady event');
              }
            }
          }
        } catch (dbError) {
          console.error('Failed to check/update order status:', dbError);
        }

        // Dispatch event to notify Cashier page
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('orderItemCompleted', { 
            detail: { itemId } 
          }));
          console.log('📡 Dispatched orderItemCompleted event');
        }
      }

      toast('success', status === 'preparing' ? 'Item diproses' : 'Item selesai');
      await fetchOrders(true);
    } catch (error) {
      console.error('Failed to update item status:', error);
      toast('error', 'Gagal mengubah status item. Coba lagi.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Flatten orders into individual items with order context
  const filteredItems = orders.flatMap(order => {
    if (filter === 'all') {
      return order.items.map(item => ({ ...item, order }));
    }

    const isKitchenItem = (item: OrderItem) => {
      const categoryName = item.product?.category?.name?.toLowerCase() || '';
      // Kitchen items: Makanan Utama, Bakery, Dessert
      const kitchenCategories = ['makanan utama', 'bakery', 'dessert', 'makanan', 'food', 'main', 'utama'];
      return kitchenCategories.some(cat => categoryName.includes(cat));
    };

    const isBarItem = (item: OrderItem) => {
      const categoryName = item.product?.category?.name?.toLowerCase() || '';
      // Bar items: Minuman, Kopi, Teh
      const barCategories = ['minuman', 'kopi', 'teh', 'drink', 'beverage', 'coffee', 'tea'];
      return barCategories.some(cat => categoryName.includes(cat));
    };

    if (filter === 'kitchen') {
      return order.items.filter(isKitchenItem).map(item => ({ ...item, order }));
    }
    if (filter === 'bar') {
      return order.items.filter(isBarItem).map(item => ({ ...item, order }));
    }

    return order.items.map(item => ({ ...item, order }));
  }).sort((a, b) => {
    // Sort chronologically by order creation time (oldest first for queue management)
    const timeA = new Date(a.order.created_at).getTime();
    const timeB = new Date(b.order.created_at).getTime();
    return timeA - timeB;
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
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-kds-text-secondary transition-colors hover:bg-kds-surface-alt hover:text-kds-text"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <ChefHat className="h-8 w-8 text-orange-500" aria-hidden="true" />
                {showNotification && newOrderCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-bounce">
                    {newOrderCount}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">Kitchen Display</h1>
              {showNotification && (
                <div className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white animate-pulse">
                  <Bell className="h-4 w-4" />
                  {newOrderCount} order baru
                </div>
              )}
            </div>
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
                    : 'bg-kds-surface-alt text-kds-text-secondary hover:bg-slate-600 hover:text-white'
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
              className="flex min-h-11 items-center gap-2 rounded-lg bg-sky-700 px-4 font-medium text-white transition-colors hover:bg-sky-600 hover:text-white disabled:opacity-50"
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
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={AlertCircle} title="Tidak ada order pending" message="Order baru akan muncul di sini" />
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item: any) => {
              const order = item.order;
              const urgency = getUrgency(order.created_at);
              const { border, chip, label } = urgencyStyles[urgency];
              const busy = updatingOrderId === order.id;

              return (
                <div
                  key={`${order.id}-${item.id}`}
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

                  {/* Item Card */}
                  <div className="p-4">
                    <div className="border-l-4 border-orange-500 pl-3">
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
                    {item.status === 'pending' && (
                      <button
                        onClick={() => updateItemStatus(item.id, 'preparing')}
                        disabled={busy}
                        className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-600 font-medium text-white transition-colors hover:bg-yellow-700 hover:text-white active:scale-[0.98] disabled:opacity-50"
                      >
                        {busy ? <Spinner size="sm" /> : <Flame className="h-4 w-4" aria-hidden="true" />}
                        Proses
                      </button>
                    )}
                    <button
                      onClick={() => updateItemStatus(item.id, 'completed')}
                      disabled={busy}
                      className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 font-medium text-white transition-colors hover:bg-emerald-700 hover:text-white active:scale-[0.98] disabled:opacity-50"
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

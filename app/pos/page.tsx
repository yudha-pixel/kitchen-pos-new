'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { ProductCard } from '@/src/features/pos/components/ProductCard';
import { CartPanel } from '@/src/features/pos/components/CartPanel';
import { useCartStore } from '@/src/store/useCartStore';
import { ModifierOption, UIModifierGroup } from '@/src/features/pos/components/ModifierModal';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { useSyncManager } from '@/src/hooks/useSyncManager';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/src/components/ui/Skeleton';
import { ConnectionIndicator } from '@/src/components/ui/ConnectionIndicator';
import { ShoppingCart, Search, RefreshCw, AlertCircle, Plus, X, Utensils, History, Printer, Trash2 } from 'lucide-react';
import { ReceiptModal } from '@/src/components/pos/ReceiptModal';

export default function POSPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [showTableOrders, setShowTableOrders] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);
  const [deleteHistoryConfirmOpen, setDeleteHistoryConfirmOpen] = useState(false);
  const [orderCategory, setOrderCategory] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [courierName, setCourierName] = useState('');
  const [courierType, setCourierType] = useState<'internal' | 'external'>('internal');

  // Keep the cart store aware of the logged-in cashier
  useEffect(() => {
    if (user) {
      useCartStore.getState().setCashierId(user.id);
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  const userRole = user?.role ?? 'cashier';
  const cartItemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  // Fetch data from the local API with offline support
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts, isFromCache: productsFromCache } = useProducts();
  const { categories } = useCategories();

  // Sync manager for offline-first functionality
  const {
    isOnline,
    pendingTransactions,
    syncInProgress,
    syncError,
    lastSyncTime,
    triggerManualSync,
  } = useSyncManager();

  // Surface sync errors as a toast instead of a persistent second banner
  useEffect(() => {
    if (syncError) toast('error', syncError);
  }, [syncError, toast]);

  // Fetch table orders with status 'done' when tab is opened
  useEffect(() => {
    if (showTableOrders) {
      const fetchTableOrders = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .equals('done')
            .reverse()
            .limit(50)
            .toArray();

          // Fetch items for each order from order_items table
          const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
              if (!order.id) {
                return {
                  ...order,
                  items: [],
                };
              }
              const items = await db.order_items
                .where('order_id')
                .equals(order.id)
                .toArray();

              // Fetch product details for each item
              const itemsWithProducts = await Promise.all(
                items.map(async (item) => {
                  if (!item.product_id) {
                    return {
                      ...item,
                      product: null,
                    };
                  }
                  const product = await db.products.get(item.product_id);
                  return {
                    ...item,
                    product: product ? { name: product.name } : null,
                  };
                })
              );

              return {
                ...order,
                items: itemsWithProducts,
              };
            })
          );

          console.log('Table orders fetched:', ordersWithItems);
          setTableOrders(ordersWithItems);
        } catch (error) {
          console.error('Failed to load table orders:', error);
          setTableOrders([]);
        }
      };
      fetchTableOrders();
    }
  }, [showTableOrders]);

  // Load transaction history from IndexedDB when tab is active
  useEffect(() => {
    if (showTransactionHistory) {
      const fetchTransactionHistory = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .anyOf(['completed', 'pending'])
            .reverse()
            .limit(50)
            .toArray();

          // Fetch items for each order from order_items table
          const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
              if (!order.id) {
                return {
                  ...order,
                  items: [],
                };
              }
              const items = await db.order_items
                .where('order_id')
                .equals(order.id)
                .toArray();

              // Fetch product details for each item
              const itemsWithProducts = await Promise.all(
                items.map(async (item) => {
                  if (!item.product_id) {
                    return {
                      ...item,
                      product: null,
                    };
                  }
                  const product = await db.products.get(item.product_id);
                  return {
                    ...item,
                    product: product ? { name: product.name } : null,
                  };
                })
              );

              return {
                ...order,
                items: itemsWithProducts,
              };
            })
          );

          console.log('Transaction history fetched:', ordersWithItems);
          setTransactionHistory(ordersWithItems);
        } catch (error) {
          console.error('Failed to load transaction history:', error);
          setTransactionHistory([]);
        }
      };
      fetchTransactionHistory();
    }
  }, [showTransactionHistory]);

  // Handle delete transaction history
  const handleDeleteHistory = async () => {
    try {
      const { db } = await import('@/src/lib/db');
      
      // Clear orders table
      await db.orders.clear();
      console.log('✅ Orders table cleared');
      
      // Clear order_items table
      await db.order_items.clear();
      console.log('✅ Order items table cleared');
      
      // Update state
      setTransactionHistory([]);
      setDeleteHistoryConfirmOpen(false);
      toast('success', 'Riwayat transaksi berhasil dihapus');
    } catch (error) {
      console.error('Failed to delete history:', error);
      toast('error', 'Gagal menghapus riwayat transaksi');
    }
  };

  // Generate receipt number based on category
  const generateReceiptNumber = async (category: 'dine-in' | 'takeaway' | 'delivery'): Promise<string> => {
    try {
      const { db } = await import('@/src/lib/db');
      
      const prefix = category === 'dine-in' ? 'DI-' : category === 'takeaway' ? 'TA-' : 'DL-';
      
      // Get the last order for this category
      const lastOrder = await db.orders
        .where('order_category')
        .equals(category)
        .reverse()
        .limit(1)
        .first();
      
      let sequenceNumber = 1;
      if (lastOrder && lastOrder.receipt_number) {
        // Extract sequence number from last receipt number
        const lastSequence = parseInt(lastOrder.receipt_number.replace(prefix, ''));
        if (!isNaN(lastSequence)) {
          sequenceNumber = lastSequence + 1;
        }
      }
      
      // Format: DI-0001, TA-0001, DL-0001
      return `${prefix}${String(sequenceNumber).padStart(4, '0')}`;
    } catch (error) {
      console.error('Failed to generate receipt number:', error);
      // Fallback to timestamp-based number
      const prefix = category === 'dine-in' ? 'DI-' : category === 'takeaway' ? 'TA-' : 'DL-';
      return `${prefix}${Date.now().toString().slice(-4)}`;
    }
  };

  // Transform API modifier groups to UI format
  const getProductModifiers = (product: any): UIModifierGroup[] => {
    if (!product.modifier_groups || product.modifier_groups.length === 0) {
      return [];
    }

    return product.modifier_groups.map((group: any) => ({
      id: group.id,
      name: group.name,
      required: group.is_required,
      multiSelect: group.max_selections > 1,
      options: group.modifiers.map((mod: any) => ({
        id: mod.id,
        name: mod.name,
        price: mod.price_extra,
        selected: false,
      })),
    }));
  };

  const handleAddToCart = (productId: string, name: string, price: number, modifiers: ModifierOption[]) => {
    useCartStore.getState().addToCart({
      productId,
      name,
      price,
      quantity: 1,
      modifiers,
    });
  };

  const handleLoadTableOrder = async (order: any) => {
    try {
      // Clear current cart
      useCartStore.getState().clearCart();

      // Set table number
      useCartStore.getState().setTableNumber(order.table_number || '');

      // Add items to cart
      order.items.forEach((item: any) => {
        const price = Number(item.price_at_time) || 0;
        const name = item.product?.name || 'Unknown';
        const modifiers = item.modifiers_applied && Array.isArray(item.modifiers_applied)
          ? item.modifiers_applied.map((m: any) => ({ id: m.id, name: m.name, price: m.price_extra || 0, selected: true }))
          : [];

        useCartStore.getState().addToCart({
          productId: item.product_id,
          name,
          price,
          quantity: item.quantity,
          modifiers,
        });
      });

      // Set notes
      useCartStore.getState().setNotes(order.notes || '');

      console.log('Table order loaded to cart:', order);
      toast('success', `Pesanan meja ${order.table_number} dimuat ke keranjang`);
      setShowTableOrders(false);
    } catch (error) {
      console.error('Failed to load table order:', error);
      toast('error', 'Gagal memuat pesanan');
    }
  };

  const handleClearCache = async () => {
    try {
      const { db } = await import('@/src/lib/db');
      await db.products.clear();
      await db.categories.clear();
      await db.modifiers.clear();
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  // Filter products based on category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Semua' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedCategoryName =
    selectedCategory === 'Semua'
      ? 'Semua'
      : categories.find((c) => c.id === selectedCategory)?.name ?? 'Kategori';

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      <Header title="Kitchen POS" onSearch={setSearchQuery} />

      {/* Sync Status Strip */}
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-1.5 text-sm">
        <div className="flex items-center gap-2">
          <ConnectionIndicator />
          {productsFromCache && <Badge tone="info">Data dari cache</Badge>}
        </div>

        <div className="flex items-center gap-3">
          {lastSyncTime && (
            <span className="tnum hidden text-xs opacity-75 sm:inline">
              Terakhir sync: {new Date(lastSyncTime).toLocaleTimeString('id-ID')}
            </span>
          )}
          <button
            onClick={triggerManualSync}
            disabled={syncInProgress || !isOnline}
            aria-label="Sinkronkan data"
            className="flex min-h-9 items-center gap-1 rounded-lg bg-surface px-3 text-ink-secondary transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Dev Tools (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex items-center gap-4 border-b border-line bg-surface-alt px-6 py-1.5">
          <span className="text-xs font-medium text-ink-muted">Dev Tools:</span>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1 rounded bg-warning-soft px-2 py-1 text-xs font-medium text-warning hover:opacity-80"
          >
            <RefreshCw className="h-3 w-3" />
            Clear Cache & Reload
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Categories */}
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Product Grid */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Tab Toggle */}
          <div className="mb-6 flex items-center gap-2 border-b border-line">
            <button
              onClick={() => {
                setShowTableOrders(false);
                setShowTransactionHistory(false);
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                !showTableOrders && !showTransactionHistory
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Produk
            </button>
            <button
              onClick={() => {
                setShowTableOrders(true);
                setShowTransactionHistory(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                showTableOrders && !showTransactionHistory
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Utensils className="h-4 w-4" />
              Pesanan Meja
            </button>
            <button
              onClick={() => {
                setShowTableOrders(false);
                setShowTransactionHistory(true);
              }}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                showTransactionHistory
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <History className="h-4 w-4" />
              Riwayat Transaksi
            </button>
          </div>

          {showTableOrders ? (
            /* Table Orders View */
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-ink">Pesanan Meja</h2>
                <p className="text-sm text-ink-muted">Menampilkan {tableOrders.length} pesanan siap bayar</p>
              </div>

              {tableOrders.length === 0 ? (
                <EmptyState
                  icon={Utensils}
                  title="Tidak ada pesanan meja"
                  message="Pesanan yang sudah selesai dimasak akan muncul di sini"
                />
              ) : (
                <div className="space-y-3">
                  {tableOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-line bg-surface p-4 hover:bg-surface-alt transition-colors"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg">Meja {order.table_number || '-'}</h3>
                          <p className="text-sm text-ink-muted">
                            {new Date(order.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Badge tone="success">Done</Badge>
                      </div>

                      <div className="mb-3 space-y-1 text-sm">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any, i: number) => {
                            const price = Number(item.price_at_time) || 0;
                            const name = item.product?.name || 'Unknown';
                            const modifiers = item.modifiers_applied && Array.isArray(item.modifiers_applied)
                              ? item.modifiers_applied.map((m: any) => m.name || m).join(', ')
                              : '';

                            return (
                              <div key={i} className="flex justify-between">
                                <span>
                                  {item.quantity}x {name}
                                  {modifiers && <span className="text-xs text-ink-muted ml-1">({modifiers})</span>}
                                </span>
                                <span>Rp {(price * item.quantity).toLocaleString()}</span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-ink-muted">No items</p>
                        )}
                      </div>

                      <div className="mb-3 flex justify-between font-medium">
                        <span>Total</span>
                        <span className="text-primary">
                          {(() => {
                            const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
                              const price = Number(item.price_at_time) || 0;
                              return sum + (price * item.quantity);
                            }, 0) || 0;
                            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculatedTotal);
                          })()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : showTransactionHistory ? (
            /* Transaction History View */
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-ink">Riwayat Transaksi</h2>
                  <p className="text-sm text-ink-muted">Menampilkan {transactionHistory.length} transaksi terakhir</p>
                </div>
                {transactionHistory.length > 0 && (
                  <button
                    onClick={() => setDeleteHistoryConfirmOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus Riwayat
                  </button>
                )}
              </div>

              {transactionHistory.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="Tidak ada riwayat transaksi"
                  message="Transaksi yang sudah selesai akan muncul di sini"
                />
              ) : (
                <div className="space-y-3">
                  {transactionHistory.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-line bg-surface p-4 hover:bg-surface-alt transition-colors"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg">Meja {order.table_number || 'Direct'}</h3>
                          <p className="text-sm text-ink-muted">
                            {new Date(order.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Badge tone={order.status === 'completed' ? 'success' : 'warning'}>
                          {order.status === 'completed' ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>

                      <div className="mb-3 space-y-1 text-sm">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any, i: number) => {
                            const price = Number(item.price_at_time) || 0;
                            const name = item.product?.name || 'Unknown';
                            const modifiers = item.modifiers_applied && Array.isArray(item.modifiers_applied)
                              ? item.modifiers_applied.map((m: any) => m.name || m).join(', ')
                              : '';

                            return (
                              <div key={i} className="flex justify-between">
                                <span>
                                  {item.quantity}x {name}
                                  {modifiers && <span className="text-xs text-ink-muted ml-1">({modifiers})</span>}
                                </span>
                                <span>Rp {(price * item.quantity).toLocaleString()}</span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-ink-muted">No items</p>
                        )}
                      </div>

                      <div className="mb-3 flex justify-between font-medium">
                        <span>Total</span>
                        <span className="text-primary">
                          {(() => {
                            const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
                              const price = Number(item.price_at_time) || 0;
                              return sum + (price * item.quantity);
                            }, 0) || 0;
                            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculatedTotal);
                          })()}
                        </span>
                      </div>

                      {order.payment_method && (
                        <div className="mb-3 text-sm text-gray-500">
                          Metode Pembayaran: {order.payment_method}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            const receiptData = {
                              orderId: order.id,
                              tableNumber: order.table_number || 'Direct',
                              items: order.items?.map((item: any) => ({
                                name: item.product?.name || 'Unknown',
                                quantity: item.quantity,
                                price: Number(item.price_at_time) || 0,
                                modifiers: item.modifiers_applied?.map((m: any) => m.name) || [],
                              })) || [],
                              subtotal: order.total_amount || 0,
                              tax: 0,
                              discount: 0,
                              roundingAmount: 0,
                              total: order.total_amount || 0,
                              paymentMethod: order.payment_method || 'cash',
                              cashierName: (user as any)?.name || 'Kasir',
                              notes: '',
                            };
                            setSelectedOrderForReceipt(receiptData);
                            setReceiptModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                          Cetak Struk
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Products View */
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-ink">{selectedCategoryName}</h2>
                  <p className="text-sm text-ink-muted">Menampilkan {filteredProducts.length} produk</p>
                </div>
              </div>

              {/* Order Category Selection */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderCategory('dine-in')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      orderCategory === 'dine-in'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dine-in
                  </button>
                  <button
                    onClick={() => setOrderCategory('takeaway')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      orderCategory === 'takeaway'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Takeaway
                  </button>
                  <button
                    onClick={() => setOrderCategory('delivery')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      orderCategory === 'delivery'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {/* Conditional Input Fields */}
              <div className="mb-6">
                {orderCategory === 'dine-in' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Meja</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Masukkan nomor meja"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {orderCategory === 'takeaway' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pelanggan</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama pelanggan"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}
                {orderCategory === 'delivery' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Pengiriman</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Masukkan alamat pengiriman"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kurir</label>
                      <input
                        type="text"
                        value={courierName}
                        onChange={(e) => setCourierName(e.target.value)}
                        placeholder="Masukkan nama kurir"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Kurir</label>
                      <select
                        value={courierType}
                        onChange={(e) => setCourierType(e.target.value as 'internal' | 'external')}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {authLoading || productsLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : productsError ? (
                <EmptyState
                  icon={AlertCircle}
                  title="Gagal memuat produk"
                  message={productsError}
                  action={
                    <Button variant="secondary" onClick={refetchProducts}>
                      <RefreshCw className="h-4 w-4" /> Coba lagi
                    </Button>
                  }
                />
              ) : filteredProducts.length === 0 ? (
                <EmptyState icon={Search} title="Tidak ada produk ditemukan" message="Coba kata kunci atau kategori lain" />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      modifiers={getProductModifiers(product)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Cart Panel (desktop) */}
        <aside className="hidden w-96 lg:block" aria-label="Keranjang">
          <CartPanel
            orderCategory={orderCategory}
            tableNumber={tableNumber}
            customerName={customerName}
            deliveryAddress={deliveryAddress}
            courierName={courierName}
            courierType={courierType}
            receiptNumber={undefined}
          />
        </aside>
      </div>

      {/* Mobile Cart Button */}
      <div className="fixed bottom-4 right-4 z-40 lg:hidden">
        <button
          onClick={() => setMobileCartOpen(true)}
          aria-label={`Buka keranjang, ${cartItemCount} item`}
          className="relative flex min-h-14 min-w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform active:scale-95"
        >
          <ShoppingCart className="h-6 w-6" />
          {cartItemCount > 0 && (
            <span className="tnum absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold text-white">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Cart Bottom Sheet */}
      {mobileCartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50 lg:hidden"
          onClick={() => setMobileCartOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Keranjang"
            onClick={(e) => e.stopPropagation()}
            className="sheet-up relative h-[90dvh] w-full overflow-hidden rounded-t-2xl bg-surface"
          >
            <button
              onClick={() => setMobileCartOpen(false)}
              aria-label="Tutup keranjang"
              className="absolute right-3 top-3 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-surface-alt text-ink-secondary"
            >
              <X className="h-5 w-5" />
            </button>
            <CartPanel
              orderCategory={orderCategory}
              tableNumber={tableNumber}
              customerName={customerName}
              deliveryAddress={deliveryAddress}
              courierName={courierName}
              courierType={courierType}
              receiptNumber={undefined}
            />
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedOrderForReceipt && (
        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          orderId={selectedOrderForReceipt.orderId}
          tableNumber={selectedOrderForReceipt.tableNumber}
          items={selectedOrderForReceipt.items}
          subtotal={selectedOrderForReceipt.subtotal}
          tax={selectedOrderForReceipt.tax}
          discount={selectedOrderForReceipt.discount}
          roundingAmount={selectedOrderForReceipt.roundingAmount}
          total={selectedOrderForReceipt.total}
          paymentMethod={selectedOrderForReceipt.paymentMethod}
          cashierName={selectedOrderForReceipt.cashierName}
          notes={selectedOrderForReceipt.notes}
        />
      )}

      {/* Delete History Confirmation Modal */}
      {deleteHistoryConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Hapus Riwayat Transaksi</h3>
              <button
                onClick={() => setDeleteHistoryConfirmOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus seluruh riwayat transaksi? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteHistoryConfirmOpen(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteHistory}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

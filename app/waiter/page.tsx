'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { useSyncManager } from '@/src/hooks/useSyncManager';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ShoppingCart, Search, RefreshCw, AlertCircle, Plus, Minus, History, Printer, UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { ModifierOption, UIModifierGroup, ModifierModal } from '@/src/features/pos/components/ModifierModal';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import type { Product } from '@/src/types/database.types';
import type { PosOrder } from '@/src/types/pos-order';


const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export default function WaiterPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<PosOrder[]>([]);
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [selectedProductForModifier, setSelectedProductForModifier] = useState<Product | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/waiter');
    }
  }, [authLoading, user, router]);

  // Keep the cart store aware of the logged-in waiter
  useEffect(() => {
    if (user) {
      useCartStore.getState().setCashierId(user.id);
    }
  }, [user]);

  // Fetch data from the local API with offline support
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { categories } = useCategories();

  // Sync manager for offline-first functionality
  const {
    syncInProgress,
    syncError,
  } = useSyncManager();

  // Surface sync errors as a toast
  useEffect(() => {
    if (syncError) toast('error', syncError);
  }, [syncError, toast]);

  // Load order history from IndexedDB when modal opens
  useEffect(() => {
    if (isHistoryOpen) {
      const fetchOrderHistory = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .anyOf(['pending', 'done', 'paid', 'synced', 'completed', 'cancelled'])
            .reverse()
            .toArray();

          // Fetch items for each order from order_items table
          const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
              const items = await db.order_items
                .where('order_id')
                .equals(order.id!)
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

          // Debug: Log orders with items
          console.log('Orders with items:', ordersWithItems.map(o => ({
            id: o.id,
            table_number: o.table_number,
            status: o.status,
            items_count: o.items?.length || 0,
            items: o.items
          })));

          // Debug: Log if no orders found
          if (ordersWithItems.length === 0) {
            console.log('No orders found with status pending/done/paid/synced. Checking all orders...');
            const allOrders = await db.orders.toArray();
            console.log('All orders in database:', allOrders.map(o => ({ id: o.id, status: o.status, sync_status: o.sync_status })));
          }

          setOrderHistory(ordersWithItems);
        } catch (error) {
          console.error('Failed to load order history:', error);
          setOrderHistory([]);
        }
      };
      fetchOrderHistory();
    }
  }, [isHistoryOpen]);

  // Cart state from store
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  useCartStore((state) => state.processPayment);

  // Transform API modifier groups to UI format
  const getProductModifiers = (product: Product): UIModifierGroup[] => {
    if (!product.modifier_groups || product.modifier_groups.length === 0) {
      return [];
    }

    return product.modifier_groups.map((group) => ({
      id: group.id,
      name: group.name,
      required: group.is_required,
      multiSelect: group.max_selections > 1,
      options: group.modifiers.map((mod) => ({
        id: mod.id,
        name: mod.name,
        price: mod.price_extra,
        selected: false,
      })),
    }));
  };

  const handleAddToCart = (productId: string, name: string, price: number, modifiers: ModifierOption[] = []) => {
    if (!selectedTable) {
      toast('error', 'Silakan pilih nomor meja terlebih dahulu');
      return;
    }
    addToCart({
      productId,
      name,
      price,
      quantity: 1,
      modifiers,
    });
    toast('success', `${name} ditambahkan ke keranjang`);
  };

  const handleProductClick = (product: Product) => {
    if (!selectedTable) {
      toast('error', 'Silakan pilih nomor meja terlebih dahulu');
      return;
    }

    // Check if product has modifiers
    const productModifiers = getProductModifiers(product);
    if (productModifiers && productModifiers.length > 0) {
      setSelectedProductForModifier(product);
      setModifierModalOpen(true);
    } else {
      handleAddToCart(product.id, product.name, product.price, []);
    }
  };

  const handleModifierConfirm = (selectedModifiers: ModifierOption[]) => {
    if (selectedProductForModifier) {
      handleAddToCart(
        selectedProductForModifier.id,
        selectedProductForModifier.name,
        selectedProductForModifier.price,
        selectedModifiers
      );
    }
    setModifierModalOpen(false);
    setSelectedProductForModifier(null);
  };



  const cartTotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const modifiersTotal = item.modifiers.reduce((modSum, mod) => modSum + mod.price, 0);
    return sum + itemTotal + (modifiersTotal * item.quantity);
  }, 0);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Semua' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-surface-alt">
        <div className="text-ink-secondary">Memuat...</div>
      </div>
    );
  }

  return (
    <ResponsiveShell title="Pesanan Waiter">
    <div className="flex h-full min-h-0 flex-col bg-background text-ink">
      {/* Toolbar */}
      <header className="shrink-0 border-b border-line bg-surface">
        <div className="px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-balance text-lg sm:text-xl font-bold text-ink">Pesanan Waiter</h1>
            </div>
            <Button variant="secondary" onClick={() => setIsHistoryOpen(true)}><History className="size-4" aria-hidden="true" /> Riwayat</Button>
          </div>

          {/* Table Selection */}
          <div className="flex flex-wrap items-end gap-3 mb-3">
            <div className="w-48 max-w-full flex-auto sm:flex-none">
              <label htmlFor="waiter-table" className="block text-xs font-medium text-ink-secondary mb-1">Nomor Meja</label>
              <select
                id="waiter-table"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 text-lg border border-line-strong bg-surface text-ink rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Pilih Meja</option>
                {[...Array(20)].map((_, i) => (
                  <option key={i + 1} value={`M${i + 1}`}>
                    Meja {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label htmlFor="waiter-guests" className="block text-xs font-medium text-ink-secondary mb-1">Tamu</label>
              <input
                id="waiter-guests"
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-lg border border-line-strong bg-surface text-ink rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink-muted" />
            <input
              type="search"
              aria-label="Cari menu"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-line-strong bg-surface text-ink rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

      {/* Category Tabs */}
      <div className="bg-surface overflow-x-auto">
        <div className="flex px-4 py-2 gap-2">
          <button
            aria-pressed={selectedCategory === 'Semua'}
            onClick={() => setSelectedCategory('Semua')}
            className={cn("min-h-11 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-primary",
              selectedCategory === 'Semua'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-alt text-ink-secondary hover:bg-surface-alt hover:text-ink'
            )}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              aria-pressed={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn("min-h-11 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-primary",
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-alt text-ink-secondary hover:bg-surface-alt hover:text-ink'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      </header>

      {/* Product Grid */}
      <section aria-label="Katalog menu" className="min-h-0 flex-1 overflow-y-auto p-4">
        {productsLoading ? (
          <div className="text-center py-8 text-ink-secondary">Memuat menu...</div>
        ) : productsError ? (
          <EmptyState
            icon={AlertCircle}
            title="Gagal memuat menu"
            message={productsError}
            action={
              <Button variant="secondary" onClick={refetchProducts}>
                <RefreshCw className="h-4 w-4" /> Coba lagi
              </Button>
            }
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Tidak ada menu ditemukan"
            message="Coba kata kunci atau kategori lain"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-surface rounded-xl border border-line p-3 shadow-sm hover:border-primary focus-visible:outline-2 focus-visible:outline-primary text-left"
              >
                <div className="relative h-28 sm:h-36 bg-surface-alt rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="size-8 text-ink-muted" aria-hidden="true" />
                  )}
                </div>
                <h2 className="text-balance font-semibold text-ink text-sm mb-1 line-clamp-2">{product.name}</h2>
                <p className="text-primary font-bold text-sm">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0 tabular-nums">
          <p className="text-sm text-ink-secondary">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} item dalam pesanan</p>
          <p className="font-bold text-primary">Rp {cartTotal.toLocaleString('id-ID')}</p>
        </div>
        <Button onClick={() => setIsCartOpen(true)}><ShoppingCart className="size-5" aria-hidden="true" /> Lihat Pesanan</Button>
      </div>

      {/* Cart Modal */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Pesanan Meja">
            {selectedTable && <p className="mb-3 text-sm text-ink-secondary">Meja: <span className="font-semibold">{selectedTable}</span> · {guestCount} tamu</p>}
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-ink-muted">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-ink-muted" />
                  <p>Keranjang kosong</p>
                  <Button variant="secondary" className="mt-3" onClick={() => setIsCartOpen(false)}>Pilih Menu</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-surface-alt rounded-lg p-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <p className="text-xs text-ink-muted">Rp {item.price.toLocaleString('id-ID')}</p>
                        {item.modifiers.length > 0 && (
                          <p className="text-xs text-ink-muted mt-1">
                            {item.modifiers.map(m => m.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`Kurangi ${item.name}`}
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="size-11 rounded-full bg-surface-alt flex items-center justify-center hover:bg-surface-alt hover:text-ink"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium tabular-nums">{item.quantity}</span>
                        <button
                          aria-label={`Tambah ${item.name}`}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="size-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-hover hover:text-on-primary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-line bg-surface-alt">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-primary">
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      useCartStore.getState().setTableNumber(selectedTable);
                      useCartStore.getState().setNotes(`Guest count: ${guestCount}`);
                      const result = await useCartStore.getState().sendToKitchen();
                      if (result.success) {
                        toast('success', result.message);
                        clearCart();
                        setSelectedTable('');
                        setGuestCount(1);
                      } else {
                        toast('error', result.message);
                      }
                    }}
                    disabled={syncInProgress || cartItems.length === 0}
                    className="flex-1 py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-hover hover:text-on-primary disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Printer className="h-5 w-5" />
                    Kirim
                  </button>
                </div>
              </div>
            )}
      </Modal>

      {/* Order History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Riwayat Pesanan" size="lg">
            <div className="flex-1 overflow-y-auto p-4">
              {orderHistory.length === 0 ? (
                <div className="text-center py-8 text-ink-muted">
                  <History className="h-12 w-12 mx-auto mb-2 text-ink-muted" />
                  <p>Tidak ada riwayat pesanan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="bg-surface-alt rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-ink">Meja {order.table_number || '-'}</h3>
                          {order.customer_name && (
                            <p className="text-sm font-medium text-ink-secondary">{order.customer_name}</p>
                          )}
                          <p className="text-xs text-ink-muted">
                            {order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : '—'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Kitchen Status Badge */}
                          <Badge
                            tone={
                              order.status === 'done' || order.status === 'ready' || order.status === 'served' ? 'success' :
                              order.status === 'preparing' ? 'warning' :
                              'neutral'
                            }
                          >
                            {order.status === 'done' || order.status === 'ready' || order.status === 'served' ? 'Selesai Masak' :
                             order.status === 'preparing' ? 'Sedang Masak' :
                             order.status === 'pending' ? 'Menunggu' :
                             order.status === 'completed' ? 'Selesai' :
                             order.status === 'cancelled' ? 'Dibatalkan' :
                             order.status === 'paid' ? 'Dibayar' :
                             order.status === 'synced' ? 'Tersinkron' :
                             'Status belum tersedia'}
                          </Badge>
                          {/* Payment Status Badge */}
                          <Badge
                            tone={
                              order.payment_method ? 'success' : 'warning'
                            }
                          >
                            {order.payment_method ? 'Lunas' : 'Belum Bayar'}
                          </Badge>
                        </div>
                      </div>
                      {/* Notes Section */}
                      {order.notes && (
                        <div className="mb-2 p-2 bg-warning-soft border border-warning/30 rounded-lg">
                          <p className="text-xs text-warning font-medium">Catatan:</p>
                          <p className="text-sm text-warning">{order.notes}</p>
                        </div>
                      )}
                      <div className="text-sm text-ink-secondary">
                        {order.items && order.items.length > 0 ? (
                          <>
                            {console.log('Order Item Data:', order.items)}
                            {order.items.map((item, i: number) => {
                              const price = Number(item.price_at_time) || 0;
                              const name = item.product?.name || 'Unknown';
                              const modifiers = item.modifiers_applied && Array.isArray(item.modifiers_applied)
                                ? item.modifiers_applied.map((m) => m.name || m).join(', ')
                                : '';

                              return (
                                <div key={i} className="flex justify-between py-1">
                                  <span>
                                    {item.quantity}x {name}
                                    {modifiers && <span className="text-xs text-ink-muted ml-1">({modifiers})</span>}
                                  </span>
                                  <span>Rp {(price * item.quantity).toLocaleString('id-ID')}</span>
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <p className="text-ink-muted">No items</p>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-line flex justify-between font-medium">
                        <span>Total</span>
                        <span className="text-primary">
                          {(() => {
                            const calculatedTotal = order.items?.reduce((sum: number, item) => {
                              const price = Number(item.price_at_time) || 0;
                              return sum + (price * item.quantity);
                            }, 0) || 0;
                            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(calculatedTotal);
                          })()}
                        </span>
                      </div>
                      {order.payment_method && (
                        <div className="mt-1 text-sm text-ink-muted">
                          Metode Pembayaran: {order.payment_method}
                        </div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <Badge tone={
                          order.status === 'completed' ? 'success' :
                          order.status === 'cancelled' ? 'danger' :
                          'warning'
                        }>
                          {order.status === 'completed' ? 'Lunas' :
                           order.status === 'cancelled' ? 'Batal' :
                           'Belum Bayar'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
      </Modal>

      {/* Modifier Modal */}
      {selectedProductForModifier && (
        <ModifierModal
          isOpen={modifierModalOpen}
          onClose={() => {
            setModifierModalOpen(false);
            setSelectedProductForModifier(null);
          }}
          modifiers={getProductModifiers(selectedProductForModifier)}
          onConfirm={handleModifierConfirm}
          productName={selectedProductForModifier.name}
          basePrice={selectedProductForModifier.price}
        />
      )}
    </div>
    </ResponsiveShell>
  );
}

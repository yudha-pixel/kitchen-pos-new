'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { useSyncManager } from '@/src/hooks/useSyncManager';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ConnectionIndicator } from '@/src/components/ui/ConnectionIndicator';
import { ShoppingCart, Search, RefreshCw, AlertCircle, Plus, Minus, Clock, Send, X, List, History, Printer } from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { ModifierOption, UIModifierGroup, ModifierModal } from '@/src/features/pos/components/ModifierModal';
import { ReceiptModal } from '@/src/components/pos/ReceiptModal';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: ModifierOption[];
}

export default function WaiterPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHeldOrdersOpen, setIsHeldOrdersOpen] = useState(false);
  const [heldOrders, setHeldOrders] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [selectedProductForModifier, setSelectedProductForModifier] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user, router]);

  // Keep the cart store aware of the logged-in waiter
  useEffect(() => {
    if (user) {
      useCartStore.getState().setCashierId(user.id);
    }
  }, [user]);

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

  // Surface sync errors as a toast
  useEffect(() => {
    if (syncError) toast('error', syncError);
  }, [syncError, toast]);

  // Load held orders from localStorage when modal opens
  useEffect(() => {
    if (isHeldOrdersOpen) {
      try {
        const orders = JSON.parse(localStorage.getItem('heldOrders') || '[]');
        setHeldOrders(orders);
      } catch (error) {
        console.error('Failed to load held orders:', error);
        setHeldOrders([]);
      }
    }
  }, [isHeldOrdersOpen]);

  // Load order history from IndexedDB when modal opens
  useEffect(() => {
    if (isHistoryOpen) {
      const fetchOrderHistory = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .anyOf(['pending', 'done', 'paid', 'synced'])
            .reverse()
            .limit(50)
            .toArray();

          // Fetch items for each order from order_items table
          const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
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
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const processPayment = useCartStore((state) => state.processPayment);

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

  const handleProductClick = (product: any) => {
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

  const handleHoldOrder = async () => {
    if (cartItems.length === 0) {
      toast('error', 'Keranjang kosong');
      return;
    }
    if (!selectedTable) {
      toast('error', 'Silakan pilih nomor meja');
      return;
    }

    try {
      // Store the held order in local storage or IndexedDB for later retrieval
      const heldOrder = {
        table: selectedTable,
        guestCount,
        items: cartItems,
        timestamp: new Date().toISOString(),
      };

      const heldOrders = JSON.parse(localStorage.getItem('heldOrders') || '[]');
      heldOrders.push(heldOrder);
      localStorage.setItem('heldOrders', JSON.stringify(heldOrders));

      clearCart();
      toast('success', `Pesanan untuk meja ${selectedTable} ditahan`);
      setSelectedTable('');
      setGuestCount(1);
    } catch (error) {
      toast('error', 'Gagal menahan pesanan');
    }
  };

  const handleSendOrder = async () => {
    if (cartItems.length === 0) {
      toast('error', 'Keranjang kosong');
      return;
    }
    if (!selectedTable) {
      toast('error', 'Silakan pilih nomor meja');
      return;
    }

    try {
      // Set table number in cart store (guest count stored in notes for now)
      useCartStore.getState().setTableNumber(selectedTable);
      useCartStore.getState().setNotes(`Guest count: ${guestCount}`);

      // Process payment (this will sync to server if online, or queue if offline)
      await processPayment();

      toast('success', 'Pesanan dikirim ke dapur');
      clearCart();
      setSelectedTable('');
      setGuestCount(1);
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal mengirim pesanan');
    }
  };

  const handleLoadHeldOrder = (index: number) => {
    try {
      const order = heldOrders[index];
      
      // Clear current cart
      clearCart();
      
      // Set table and guest count
      setSelectedTable(order.table);
      setGuestCount(order.guestCount);
      
      // Add items to cart
      order.items.forEach((item: any) => {
        addToCart({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifiers: item.modifiers || [],
        });
      });
      
      // Remove from localStorage
      const updatedHeldOrders = heldOrders.filter((_, i) => i !== index);
      localStorage.setItem('heldOrders', JSON.stringify(updatedHeldOrders));
      setHeldOrders(updatedHeldOrders);
      
      toast('success', `Pesanan meja ${order.table} dimuat kembali`);
      setIsHeldOrdersOpen(false);
    } catch (error) {
      toast('error', 'Gagal memuat pesanan');
    }
  };

  const handleDeleteHeldOrder = (index: number) => {
    try {
      const updatedHeldOrders = heldOrders.filter((_, i) => i !== index);
      localStorage.setItem('heldOrders', JSON.stringify(updatedHeldOrders));
      setHeldOrders(updatedHeldOrders);
      toast('success', 'Pesanan dihapus');
    } catch (error) {
      toast('error', 'Gagal menghapus pesanan');
    }
  };

  const handlePrintReceipt = (order: any) => {
    const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
      const price = Number(item.price_at_time) || 0;
      return sum + (price * item.quantity);
    }, 0) || 0;

    setSelectedOrderForReceipt({
      orderId: order.id,
      tableNumber: order.table_number || '-',
      items: order.items?.map((item: any) => ({
        name: item.product?.name || 'Unknown',
        quantity: item.quantity,
        price: Number(item.price_at_time) || 0,
        modifiers: item.modifiers_applied && Array.isArray(item.modifiers_applied)
          ? item.modifiers_applied.map((m: any) => m.name || m)
          : [],
      })) || [],
      subtotal: calculatedTotal,
      tax: 0,
      discount: 0,
      roundingAmount: 0,
      total: calculatedTotal,
      paymentMethod: 'cash',
      cashierName: (user as any)?.name || 'Waiter',
      notes: order.notes,
    });
    setReceiptModalOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast('error', 'Pilih metode pembayaran terlebih dahulu');
      return;
    }

    try {
      const { db } = await import('@/src/lib/db');
      const orderId = crypto.randomUUID();

      // Calculate total
      const calculatedTotal = cartItems.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const modifiersTotal = item.modifiers.reduce((modSum, mod) => modSum + mod.price, 0);
        return sum + itemTotal + (modifiersTotal * item.quantity);
      }, 0);

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: item.price,
        modifiers_applied: item.modifiers,
        discount_item: 0,
        split_group_id: null,
        created_at: new Date().toISOString(),
      }));

      // Save order to db.orders
      const order = {
        id: orderId,
        table_number: selectedTable,
        status: 'completed' as const,
        total_amount: calculatedTotal,
        payment_method: selectedPaymentMethod as 'cash' | 'card' | 'qr' | 'transfer',
        notes: '',
        created_at: new Date().toISOString(),
        sync_status: 'pending' as const,
        cashier_id: null, // Set to null to avoid UUID validation issues
        discount_amount: 0,
        rounding_amount: 0,
      };

      console.log('Saving order to IndexedDB:', order);
      console.log('Saving order items to IndexedDB:', orderItems);

      await db.orders.add(order);
      console.log(`✅ Order ${orderId} saved to IndexedDB with status 'paid'`);

      // Save order items
      await db.order_items.bulkAdd(orderItems);
      console.log(`✅ Order items saved to IndexedDB`);

      // Prepare receipt data
      const receiptData = {
        orderId,
        tableNumber: selectedTable,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifiers: item.modifiers.map(m => m.name),
        })),
        subtotal: calculatedTotal,
        tax: 0,
        discount: 0,
        roundingAmount: 0,
        total: calculatedTotal,
        paymentMethod: selectedPaymentMethod,
        cashierName: (user as any)?.name || 'Waiter',
        notes: '',
      };

      setSelectedOrderForReceipt(receiptData);
      setPaymentModalOpen(false);
      setReceiptModalOpen(true);

      // Clear cart
      clearCart();
      setIsCartOpen(false);
      toast('success', 'Pembayaran berhasil');

    } catch (error) {
      console.error('Payment failed:', error);
      toast('error', 'Gagal memproses pembayaran');
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const modifiersTotal = item.modifiers.reduce((modSum, mod) => modSum + mod.price, 0);
    return sum + itemTotal + (modifiersTotal * item.quantity);
  }, 0);

  const filteredProducts = products.filter((product: any) => {
    const matchesCategory = selectedCategory === 'Semua' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Waiter POS</h1>
            <ConnectionIndicator />
          </div>

          {/* Table Selection */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nomor Meja</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Tamu</label>
              <input
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="bg-white border-b sticky top-[140px] z-20 overflow-x-auto">
        <div className="flex px-4 py-2 gap-2">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === 'Semua'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <main className="p-4">
        {productsLoading ? (
          <div className="text-center py-8 text-gray-600">Memuat menu...</div>
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
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product: any) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow text-left active:scale-95"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-2xl">🍽️</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-blue-600 font-bold text-sm">
                  Rp {product.price.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-blue-600 text-white rounded-full p-4 shadow-lg flex items-center gap-2"
      >
        <ShoppingCart className="h-6 w-6" />
        {cartItems.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Held Orders Button */}
      <button
        onClick={() => setIsHeldOrdersOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-orange-500 text-white rounded-full p-4 shadow-lg"
      >
        <List className="h-6 w-6" />
      </button>

      {/* History Button */}
      <button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed bottom-20 left-4 z-40 bg-gray-600 text-white rounded-full p-4 shadow-lg"
      >
        <History className="h-6 w-6" />
      </button>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Keranjang</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">Rp {item.price.toLocaleString()}</p>
                        {item.modifiers.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {item.modifiers.map(m => m.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
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
              <div className="p-4 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    Rp {cartTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleHoldOrder}
                    disabled={syncInProgress}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Clock className="h-5 w-5" />
                    Tahan
                  </button>
                  <button
                    onClick={handleSendOrder}
                    disabled={syncInProgress}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="h-5 w-5" />
                    Kirim
                  </button>
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    disabled={syncInProgress || cartItems.length === 0}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Printer className="h-5 w-5" />
                    Bayar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Held Orders Modal */}
      {isHeldOrdersOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Pesanan Ditahan</h2>
              <button
                onClick={() => setIsHeldOrdersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {heldOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada pesanan ditahan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {heldOrders.map((order, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">Meja {order.table}</h4>
                          <p className="text-xs text-gray-500">{order.guestCount} tamu</p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.timestamp).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteHeldOrder(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {order.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleLoadHeldOrder(index)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                      >
                        Muat Pesanan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Riwayat Pesanan</h2>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {orderHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Tidak ada riwayat pesanan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">Meja {order.table_number || '-'}</h4>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <Badge
                          tone={
                            order.status === 'paid'
                              ? 'success'
                              : order.status === 'done'
                              ? 'success'
                              : order.status === 'cooking'
                              ? 'warning'
                              : order.status === 'confirmed'
                              ? 'info'
                              : 'neutral'
                          }
                        >
                          {order.status === 'paid' ? 'Lunas' : order.status === 'done' ? 'Done' : order.status === 'preparing' ? 'Diproses' : order.status || 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items && order.items.length > 0 ? (
                          <>
                            {console.log('Order Item Data:', order.items)}
                            {order.items.map((item: any, i: number) => {
                              const price = Number(item.price_at_time) || 0;
                              const name = item.product?.name || 'Unknown';
                              const modifiers = item.modifiers_applied && Array.isArray(item.modifiers_applied)
                                ? item.modifiers_applied.map((m: any) => m.name || m).join(', ')
                                : '';

                              return (
                                <div key={i} className="flex justify-between py-1">
                                  <span>
                                    {item.quantity}x {name}
                                    {modifiers && <span className="text-xs text-gray-400 ml-1">({modifiers})</span>}
                                  </span>
                                  <span>Rp {(price * item.quantity).toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <p className="text-gray-400">No items</p>
                        )}
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-medium">
                        <span>Total</span>
                        <span className="text-blue-600">
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
                        <div className="mt-1 text-sm text-gray-500">
                          Metode Pembayaran: {order.payment_method}
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handlePrintReceipt(order)}
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
            </div>
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

      {/* Payment Method Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Pilih Metode Pembayaran</h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedPaymentMethod('cash')}
                className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-colors ${
                  selectedPaymentMethod === 'cash'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Tunai
              </button>
              <button
                onClick={() => setSelectedPaymentMethod('qr')}
                className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-colors ${
                  selectedPaymentMethod === 'qr'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                QRIS
              </button>
              <button
                onClick={() => setSelectedPaymentMethod('card')}
                className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-colors ${
                  selectedPaymentMethod === 'card'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Debit/Kartu
              </button>
              <button
                onClick={() => setSelectedPaymentMethod('transfer')}
                className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-colors ${
                  selectedPaymentMethod === 'transfer'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Transfer
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Proses Bayar
              </button>
            </div>
          </div>
        </div>
      )}

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
  );
}

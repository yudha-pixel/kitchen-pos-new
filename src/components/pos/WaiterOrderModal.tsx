'use client';

import { useState, useEffect } from 'react';
import { generateUUID } from '@/src/lib/utils';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { useSyncManager } from '@/src/hooks/useSyncManager';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Search, Plus, Minus, Clock, Send, X, Printer, Trash2, Scissors, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { ModifierOption, UIModifierGroup, ModifierModal } from '@/src/features/pos/components/ModifierModal';
import { PaymentModal } from '@/src/components/pos/PaymentModal';

interface WaiterOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
}

// Staff-only: opened from /pos/meja's "Pesan" action by a logged-in cashier/waiter.
// The QR self-order guest flow at /order/[tableId] is SelfOrderExperience, a
// deliberate fork — a guest has no auth session and none of this component's
// payment/split-bill/cancel/receipt actions are guest-appropriate.
export default function WaiterOrderModal({ isOpen, onClose, tableNumber }: WaiterOrderModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [selectedProductForModifier, setSelectedProductForModifier] = useState<any>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [selectedItemsForSplit, setSelectedItemsForSplit] = useState<Set<string>>(new Set());
  const [orderCategory, setOrderCategory] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [courierName, setCourierName] = useState('');
  const [courierType, setCourierType] = useState<'internal' | 'external'>('internal');
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  // Keep the cart store aware of the logged-in waiter
  useEffect(() => {
    if (user) {
      useCartStore.getState().setCashierId(user.id);
    }
  }, [user]);

  // Escape closes the topmost open dialog first, then the root modal itself.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (splitBillOpen) {
        setSplitBillOpen(false);
        setSelectedItemsForSplit(new Set());
      } else if (cancelConfirmOpen) {
        setCancelConfirmOpen(false);
      } else if (paymentModalOpen) {
        setPaymentModalOpen(false);
      } else if (isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [splitBillOpen, cancelConfirmOpen, paymentModalOpen, isOpen, onClose]);

  // Fetch data from the local API with offline support
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { categories } = useCategories();

  // Sync manager for offline-first functionality
  const { isOnline, syncInProgress } = useSyncManager();

  // Cart store
  const cartItems = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
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
        price: mod.price_extra || 0,
        selected: false,
      })),
    }));
  };

  const handleAddToCart = (productId: string, name: string, price: number, modifiers: ModifierOption[] = []) => {
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

  const handleSendOrder = async () => {
    if (cartItems.length === 0) {
      toast('error', 'Keranjang kosong');
      return;
    }

    try {
      // Set table number in cart store
      useCartStore.getState().setTableNumber(tableNumber);
      useCartStore.getState().setNotes(`Guest count: ${guestCount}`);

      // Process payment (this will sync to server if online, or queue if offline)
      await processPayment();

      // Dispatch event to notify KDS of new order
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderCreated'));
        console.log('📡 Dispatched orderCreated event from WaiterOrderModal');
      }

      toast('success', 'Pesanan dikirim ke dapur');
      clearCart();
      onClose();
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal mengirim pesanan');
    }
  };

  const handlePaymentComplete = async (paymentMethod: string, amount?: number) => {
    // Validate required fields based on category
    if (orderCategory === 'takeaway' && !customerName) {
      toast('error', 'Mohon isi nama pelanggan terlebih dahulu');
      return;
    }
    if (orderCategory === 'delivery' && (!deliveryAddress || !courierName)) {
      toast('error', 'Mohon isi alamat pengiriman dan nama kurir terlebih dahulu');
      return;
    }

    try {
      const { db } = await import('@/src/lib/db');
      const orderId = generateUUID();

      // Generate receipt number
      const generatedReceiptNumber = await generateReceiptNumber(orderCategory);
      setReceiptNumber(generatedReceiptNumber);

      // Calculate total
      const calculatedTotal = cartItems.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const modifiersTotal = item.modifiers.reduce((modSum, mod) => modSum + mod.price, 0);
        return sum + itemTotal + (modifiersTotal * item.quantity);
      }, 0);

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        id: generateUUID(),
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: item.price,
        modifiers_applied: item.modifiers,
        discount_item: 0,
        split_group_id: null,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      }));

      // Save order to db.orders
      const order = {
        id: orderId,
        table_number: orderCategory === 'dine-in' ? tableNumber : null,
        status: 'pending' as const,
        total_amount: calculatedTotal,
        payment_method: paymentMethod.toLowerCase() as 'cash' | 'card' | 'qr' | 'transfer',
        notes: '',
        created_at: new Date().toISOString(),
        sync_status: 'pending' as const,
        cashier_id: null,
        discount_amount: 0,
        rounding_amount: 0,
        order_category: orderCategory,
        receipt_number: generatedReceiptNumber,
        customer_name: orderCategory === 'takeaway' ? customerName : null,
        delivery_address: orderCategory === 'delivery' ? deliveryAddress : null,
        courier_name: orderCategory === 'delivery' ? courierName : null,
        courier_type: orderCategory === 'delivery' ? courierType : null,
      };

      await db.orders.add(order);
      console.log(`✅ Order ${orderId} saved to IndexedDB`);

      // Save order items
      await db.order_items.bulkAdd(orderItems);
      console.log(`✅ Order items saved to IndexedDB`);

      // Reduce stock for ingredients based on order items
      try {
        const { reduceStockForOrder } = await import('@/src/features/inventory/inventoryService');
        const orderItemsForStock = cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
        }));
        const stockResult = await reduceStockForOrder(orderItemsForStock);
        if (stockResult.success) {
          console.log(`✅ Stock reduced: ${stockResult.message}`);
          if (stockResult.details) {
            stockResult.details.forEach(detail => {
              console.log(`  - ${detail.ingredientName}: ${detail.previousStock} → ${detail.newStock} (${detail.quantityUsed} used)`);
            });
          }
        } else {
          console.warn(`⚠️ Stock reduction warning: ${stockResult.message}`);
        }
      } catch (error) {
        console.error('❌ Failed to reduce stock:', error);
        // Don't block payment if stock reduction fails
      }

      setPaymentModalOpen(false);

      // Clear cart
      clearCart();
      setIsCartOpen(false);
      toast('success', 'Pembayaran berhasil');

    } catch (error) {
      console.error('Payment failed:', error);
      toast('error', 'Gagal memproses pembayaran');
    }
  };

  const handleCancelOrder = async () => {
    if (cartItems.length === 0) {
      toast('error', 'Keranjang kosong');
      return;
    }

    try {
      // Restore stock for items in cart (since stock was reduced when items were added)
      try {
        const { restoreStockForOrder } = await import('@/src/features/inventory/inventoryService');
        const orderItemsForStock = cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
        }));
        const stockResult = await restoreStockForOrder(orderItemsForStock);
        if (stockResult.success) {
          console.log(`✅ Stock restored: ${stockResult.message}`);
        } else {
          console.warn(`⚠️ Stock restoration warning: ${stockResult.message}`);
        }
      } catch (error) {
        console.error('❌ Failed to restore stock:', error);
        // Don't block cancellation if stock restoration fails
      }

      // Clear cart
      clearCart();
      setCancelConfirmOpen(false);
      toast('success', 'Pesanan dibatalkan');
      onClose();
    } catch (error) {
      toast('error', 'Gagal membatalkan pesanan');
    }
  };

  const handleSplitBill = () => {
    if (cartItems.length === 0) {
      toast('error', 'Keranjang kosong');
      return;
    }
    setSplitBillOpen(true);
  };

  const handleSplitBillComplete = async (selectedItems: any[], paymentMethod: string) => {
    // Split bill not implemented for waiter flow
    toast('info', 'Split bill tidak tersedia di modul waiter');
  };

  const toggleItemForSplit = (itemId: string) => {
    setSelectedItemsForSplit(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleProcessSplitBill = async () => {
    if (selectedItemsForSplit.size === 0) {
      toast('error', 'Pilih minimal satu item untuk split bill');
      return;
    }

    try {
      const { db } = await import('@/src/lib/db');
      const orderId = generateUUID();

      // Filter selected items
      const splitItems = cartItems.filter(item => selectedItemsForSplit.has(item.id));

      // Calculate total for split items
      const calculatedTotal = splitItems.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const modifiersTotal = item.modifiers.reduce((modSum, mod) => modSum + mod.price, 0);
        return sum + itemTotal + (modifiersTotal * item.quantity);
      }, 0);

      // Prepare order items
      const orderItems = splitItems.map(item => ({
        id: generateUUID(),
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: item.price,
        modifiers_applied: item.modifiers,
        discount_item: 0,
        split_group_id: null,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      }));

      // Save order to db.orders
      const order = {
        id: orderId,
        table_number: tableNumber,
        status: 'completed' as const,
        total_amount: calculatedTotal,
        payment_method: 'cash' as const,
        notes: 'Split bill',
        created_at: new Date().toISOString(),
        sync_status: 'pending' as const,
        cashier_id: null,
        discount_amount: 0,
        rounding_amount: 0,
      };

      await db.orders.add(order);
      await db.order_items.bulkAdd(orderItems);

      // Reduce stock for ingredients based on split items
      try {
        const { reduceStockForOrder } = await import('@/src/features/inventory/inventoryService');
        const orderItemsForStock = splitItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
        }));
        const stockResult = await reduceStockForOrder(orderItemsForStock);
        if (stockResult.success) {
          console.log(`✅ Stock reduced for split bill: ${stockResult.message}`);
        } else {
          console.warn(`⚠️ Stock reduction warning for split bill: ${stockResult.message}`);
        }
      } catch (error) {
        console.error('❌ Failed to reduce stock for split bill:', error);
        // Don't block split bill if stock reduction fails
      }

      // Remove split items from cart
      splitItems.forEach(item => removeFromCart(item.id));

      setSplitBillOpen(false);
      setSelectedItemsForSplit(new Set());
      toast('success', 'Split bill berhasil diproses');
    } catch (error) {
      console.error('Split bill failed:', error);
      toast('error', 'Gagal memproses split bill');
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

  // Filter products
  const filteredProducts = products.filter((product: any) => {
    const matchesCategory = selectedCategory === 'Semua' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate cart total
  const cartTotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.price * item.quantity;
    const modifiersTotal = item.modifiers.reduce((modSum, mod) => modSum + mod.price, 0);
    return sum + itemTotal + (modifiersTotal * item.quantity);
  }, 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waiter-order-title"
    >
      <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div>
            <h2 id="waiter-order-title" className="flex items-center gap-2 text-xl font-bold">
              Pemesanan
              {orderCategory === 'dine-in' && (
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-sm font-semibold text-primary">
                  {tableNumber}
                </span>
              )}
            </h2>
            <p className="text-sm text-ink-muted">Jumlah Tamu: {guestCount}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 hover:bg-surface-alt rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Order Category Selection */}
        <div className="p-4 border-b border-line">
            <div className="flex gap-2">
              <button
                onClick={() => setOrderCategory('dine-in')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  orderCategory === 'dine-in'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-alt text-ink-secondary hover:bg-line'
                }`}
              >
                Dine-in
              </button>
              <button
                onClick={() => setOrderCategory('takeaway')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  orderCategory === 'takeaway'
                    ? 'bg-warning text-on-primary'
                    : 'bg-surface-alt text-ink-secondary hover:bg-line'
                }`}
              >
                Takeaway
              </button>
              <button
                onClick={() => setOrderCategory('delivery')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  orderCategory === 'delivery'
                    ? 'bg-success text-on-primary'
                    : 'bg-surface-alt text-ink-secondary hover:bg-line'
                }`}
              >
                Delivery
              </button>
            </div>
        </div>

        {/* Conditional Input Fields — dine-in's table binding is shown as the header badge above */}
        {(orderCategory === 'takeaway' || orderCategory === 'delivery') && (
        <div className="p-4 border-b border-line">
          {orderCategory === 'takeaway' && (
            <div>
              <label className="block text-sm font-medium text-ink-secondary mb-2">Nama Pelanggan</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama pelanggan"
                className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-warning"
              />
            </div>
          )}
          {orderCategory === 'delivery' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-2">Alamat Pengiriman</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Masukkan alamat pengiriman"
                  className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-2">Nama Kurir</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="Masukkan nama kurir"
                  className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-2">Tipe Kurir</label>
                <select
                  value={courierType}
                  onChange={(e) => setCourierType(e.target.value as 'internal' | 'external')}
                  className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
                >
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Products Section */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Search and Category */}
            <div className="p-4 border-b border-line space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div
                className="flex gap-2 overflow-x-auto pb-2"
                style={{
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 24px), transparent)',
                  maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 24px), transparent)',
                }}
              >
                <button
                  onClick={() => setSelectedCategory('Semua')}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === 'Semua'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-alt text-ink-secondary hover:bg-line'
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
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-alt text-ink-secondary hover:bg-line'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {productsLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-surface-alt rounded-xl p-3 animate-pulse" />
                  ))}
                </div>
              ) : productsError ? (
                <EmptyState
                  icon={Search}
                  title="Gagal memuat menu"
                  message={productsError}
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
                      className="bg-surface rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow text-left active:scale-95"
                    >
                      <div className="aspect-square bg-surface-alt rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-ink-muted text-2xl">🍽️</span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <p className="text-xs text-ink-muted">Rp {product.price.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section: bottom sheet below lg, sidebar at lg and above */}
          <div className="w-full border-t border-line bg-surface flex flex-col shrink-0 lg:w-96 lg:border-t-0 lg:border-l lg:shrink lg:overflow-hidden">
            {/* Mobile: tap to expand/collapse the item list */}
            <button
              onClick={() => setIsCartOpen((open) => !open)}
              aria-expanded={isCartOpen}
              className="flex items-center justify-between p-4 border-b border-line w-full text-left lg:hidden"
            >
              <span className="font-bold">Keranjang</span>
              <span className="flex items-center gap-2">
                <Badge tone="info">{cartItems.length} item</Badge>
                <ChevronDown className={`h-4 w-4 transition-transform ${isCartOpen ? 'rotate-180' : ''}`} />
              </span>
            </button>
            <div className="hidden p-4 border-b border-line items-center justify-between lg:flex">
              <h3 className="font-bold">Keranjang</h3>
              <Badge tone="info">{cartItems.length} item</Badge>
            </div>

            <div
              className={`overflow-y-auto p-4 max-h-[45vh] lg:max-h-none lg:flex-1 ${
                isCartOpen ? 'block' : 'hidden'
              } lg:block`}
            >
              {cartItems.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Keranjang kosong"
                  message="Tambahkan menu untuk memulai"
                />
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-surface-alt rounded-lg p-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-ink-muted">Rp {item.price.toLocaleString()}</p>
                        {item.modifiers.length > 0 && (
                          <p className="text-xs text-ink-muted mt-1">
                            {item.modifiers.map(m => m.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 rounded-full bg-line flex items-center justify-center hover:bg-line-strong"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-hover"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-line bg-surface">
              <div className="flex justify-between mb-3">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">Rp {cartTotal.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={handleSendOrder}
                  disabled={syncInProgress || cartItems.length === 0}
                  className="col-span-1 py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Kirim
                </button>
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  disabled={syncInProgress || cartItems.length === 0}
                  className="col-span-1 py-3 bg-success text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Printer className="h-5 w-5" />
                  Bayar
                </button>
                <button
                  onClick={handleSplitBill}
                  disabled={syncInProgress || cartItems.length === 0}
                  className="col-span-1 py-3 bg-info text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Scissors className="h-5 w-5" />
                  Split
                </button>
                <button
                  onClick={() => setCancelConfirmOpen(true)}
                  disabled={syncInProgress || cartItems.length === 0}
                  className="col-span-1 py-3 bg-danger text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          order={{
            items: cartItems.map(item => ({
              id: item.productId,
              product_id: item.productId,
              name: item.name,
              price_at_time: item.price,
              quantity: item.quantity,
              modifiers_applied: item.modifiers,
            })),
            total_amount: cartTotal,
          }}
          onPaymentComplete={handlePaymentComplete}
          onSplitBillComplete={handleSplitBillComplete}
        />

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

        {/* Cancel Confirmation Modal */}
        {cancelConfirmOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-modal-title"
          >
            <div className="bg-surface rounded-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 id="cancel-modal-title" className="text-xl font-bold">Batalkan Pesanan</h3>
                <button
                  onClick={() => setCancelConfirmOpen(false)}
                  className="p-2 hover:bg-surface-alt rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-ink-secondary mb-6">
                Apakah Anda yakin ingin membatalkan pesanan ini? Semua item di keranjang akan dihapus.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirmOpen(false)}
                  className="flex-1 py-3 bg-line text-ink-secondary rounded-lg font-medium hover:bg-line-strong"
                >
                  Batal
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 py-3 bg-danger text-on-primary rounded-lg font-medium hover:opacity-90"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Split Bill Modal */}
        {splitBillOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="split-modal-title"
          >
            <div className="bg-surface rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 id="split-modal-title" className="text-xl font-bold">Split Bill</h3>
                <button
                  onClick={() => {
                    setSplitBillOpen(false);
                    setSelectedItemsForSplit(new Set());
                  }}
                  className="p-2 hover:bg-surface-alt rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-ink-secondary mb-4">
                Pilih item yang ingin dipisah pembayarannya:
              </p>
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItemForSplit(item.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedItemsForSplit.has(item.id)
                        ? 'border-primary bg-primary-soft'
                        : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-ink-muted ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-medium">Rp {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSplitBillOpen(false);
                    setSelectedItemsForSplit(new Set());
                  }}
                  className="flex-1 py-3 bg-line text-ink-secondary rounded-lg font-medium hover:bg-line-strong"
                >
                  Batal
                </button>
                <button
                  onClick={handleProcessSplitBill}
                  disabled={selectedItemsForSplit.size === 0}
                  className="flex-1 py-3 bg-info text-on-primary rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Proses Split
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { useSyncManager } from '@/src/hooks/useSyncManager';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Search, Plus, Minus, Clock, Send, X, Printer, Trash2, Scissors } from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { ModifierOption, UIModifierGroup, ModifierModal } from '@/src/features/pos/components/ModifierModal';
import { ReceiptModal } from '@/src/components/pos/ReceiptModal';

interface WaiterOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
}

export default function WaiterOrderModal({ isOpen, onClose, tableNumber }: WaiterOrderModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [selectedProductForModifier, setSelectedProductForModifier] = useState<any>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [selectedItemsForSplit, setSelectedItemsForSplit] = useState<Set<string>>(new Set());

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

      toast('success', 'Pesanan dikirim ke dapur');
      clearCart();
      onClose();
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal mengirim pesanan');
    }
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
        table_number: tableNumber,
        status: 'completed' as const,
        total_amount: calculatedTotal,
        payment_method: selectedPaymentMethod as 'cash' | 'card' | 'qr' | 'transfer',
        notes: '',
        created_at: new Date().toISOString(),
        sync_status: 'pending' as const,
        cashier_id: null,
        discount_amount: 0,
        rounding_amount: 0,
      };

      await db.orders.add(order);
      console.log(`✅ Order ${orderId} saved to IndexedDB`);

      // Save order items
      await db.order_items.bulkAdd(orderItems);
      console.log(`✅ Order items saved to IndexedDB`);

      // Prepare receipt data
      const receiptData = {
        orderId,
        tableNumber,
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

  const handlePrintReceipt = (order: any) => {
    setSelectedOrderForReceipt(order);
    setReceiptModalOpen(true);
  };

  const handleCancelOrder = async () => {
    if (cartItems.length === 0) {
      toast('error', 'Keranjang kosong');
      return;
    }

    try {
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
      const orderId = crypto.randomUUID();

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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">Pemesanan - {tableNumber}</h2>
            <p className="text-sm text-gray-500">Jumlah Tamu: {guestCount}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Products Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and Category */}
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
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

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {productsLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-3 animate-pulse" />
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
                          <span className="text-gray-400 text-2xl">🍽️</span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500">Rp {product.price.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="w-96 border-l flex flex-col bg-gray-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-bold">Keranjang</h3>
              <Badge tone="info">{cartItems.length} item</Badge>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Keranjang kosong"
                  message="Tambahkan menu untuk memulai"
                />
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
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

            <div className="p-4 border-t bg-white">
              <div className="flex justify-between mb-3">
                <span className="font-medium">Total</span>
                <span className="font-bold text-blue-600">Rp {cartTotal.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={handleSendOrder}
                  disabled={syncInProgress || cartItems.length === 0}
                  className="col-span-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Kirim
                </button>
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  disabled={syncInProgress || cartItems.length === 0}
                  className="col-span-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Printer className="h-5 w-5" />
                  Bayar
                </button>
                <button
                  onClick={handleSplitBill}
                  disabled={syncInProgress || cartItems.length === 0}
                  className="col-span-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Scissors className="h-5 w-5" />
                  Split
                </button>
                <button
                  onClick={() => setCancelConfirmOpen(true)}
                  disabled={syncInProgress || cartItems.length === 0}
                  className="col-span-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-5 w-5" />
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
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

        {/* Cancel Confirmation Modal */}
        {cancelConfirmOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Batalkan Pesanan</h3>
                <button
                  onClick={() => setCancelConfirmOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin membatalkan pesanan ini? Semua item di keranjang akan dihapus.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelConfirmOpen(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Split Bill Modal */}
        {splitBillOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Split Bill</h3>
                <button
                  onClick={() => {
                    setSplitBillOpen(false);
                    setSelectedItemsForSplit(new Set());
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Pilih item yang ingin dipisah pembayarannya:
              </p>
              <div className="space-y-2 mb-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItemForSplit(item.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedItemsForSplit.has(item.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
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
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handleProcessSplitBill}
                  disabled={selectedItemsForSplit.size === 0}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
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

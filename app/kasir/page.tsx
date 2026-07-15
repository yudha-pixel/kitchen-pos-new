'use client';

import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { ShoppingCart, Plus, Minus, Trash2, Coffee, Cake, Utensils, GlassWater } from 'lucide-react';
import { ReceiptModal } from '@/src/components/pos/ReceiptModal';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  // Bakery
  { id: '1', name: 'Croissant Butter', price: 15000, category: 'Bakery', image: '🥐' },
  { id: '2', name: 'Chocolate Muffin', price: 18000, category: 'Bakery', image: '🧁' },
  { id: '3', name: 'Danish Pastry', price: 20000, category: 'Bakery', image: '🥨' },
  { id: '4', name: 'Bagel Cream Cheese', price: 22000, category: 'Bakery', image: '🥯' },
  
  // Coffee
  { id: '5', name: 'Espresso', price: 18000, category: 'Coffee', image: '☕' },
  { id: '6', name: 'Cappuccino', price: 25000, category: 'Coffee', image: '☕' },
  { id: '7', name: 'Latte', price: 28000, category: 'Coffee', image: '☕' },
  { id: '8', name: 'Americano', price: 22000, category: 'Coffee', image: '☕' },
  
  // Food
  { id: '9', name: 'Nasi Goreng', price: 35000, category: 'Food', image: '🍛' },
  { id: '10', name: 'Mie Goreng', price: 30000, category: 'Food', image: '🍜' },
  { id: '11', name: 'Sandwich Club', price: 38000, category: 'Food', image: '🥪' },
  { id: '12', name: 'Salad Caesar', price: 32000, category: 'Food', image: '🥗' },
  
  // Non-Coffee
  { id: '13', name: 'Matcha Latte', price: 30000, category: 'Non-Coffee', image: '🍵' },
  { id: '14', name: 'Chocolate Milk', price: 25000, category: 'Non-Coffee', image: '🥛' },
  { id: '15', name: 'Fresh Orange Juice', price: 28000, category: 'Non-Coffee', image: '🍊' },
  { id: '16', name: 'Iced Lemon Tea', price: 22000, category: 'Non-Coffee', image: '🍋' },
];

const categories = ['Semua', 'Bakery', 'Coffee', 'Food', 'Non-Coffee'];

const categoryIcons: Record<string, any> = {
  Bakery: Cake,
  Coffee: Coffee,
  Food: Utensils,
  'Non-Coffee': GlassWater,
};

export default function KasirPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    tableNumber: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      modifiers: string[];
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    roundingAmount: number;
    total: number;
    paymentMethod: string;
  } | null>(null);

  const filteredProducts = selectedCategory === 'Semua' 
    ? mockProducts 
    : mockProducts.filter(p => p.category === selectedCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong');
      return;
    }

    // Generate order ID
    const orderId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

    // Calculate totals
    const subtotal = calculateTotal();
    const tax = Math.round(subtotal * 0.1);
    const totalWithTax = subtotal + tax;
    const roundingAmount = -((totalWithTax % 1000) - 1000) % 1000;
    const total = totalWithTax + roundingAmount;

    // Prepare order data
    setOrderData({
      orderId,
      tableNumber: 'Take Away',
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: [],
      })),
      subtotal,
      tax,
      discount: 0,
      roundingAmount,
      total,
      paymentMethod: 'QRIS',
    });

    // Open receipt modal
    setIsReceiptModalOpen(true);
  };

  const handleReceiptClose = () => {
    setIsReceiptModalOpen(false);
    setOrderData(null);
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b-2 border-line bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-ink">POS Kasir</h1>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-line bg-surface px-6 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => {
            const Icon = categoryIcons[category];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-alt text-ink-secondary hover:bg-surface'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left: Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="group relative overflow-hidden rounded-lg border-2 border-line bg-surface p-4 text-left transition-all hover:border-primary hover:shadow-md"
              >
                <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-surface-alt text-5xl">
                  {product.image}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-ink line-clamp-2">{product.name}</h3>
                <p className="text-sm font-bold text-primary">{formatCurrency(product.price)}</p>
                <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <Plus className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div id="receipt-container" className="hidden w-96 border-l-2 border-line bg-surface lg:block">
          <div className="flex h-full flex-col">
            {/* Cart Header */}
            <div className="border-b-2 border-line px-6 py-4">
              <h2 className="text-lg font-semibold text-ink">Ringkasan Order</h2>
              <p className="text-sm text-ink-muted">{calculateTotalItems()} item</p>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="flex h-full items-center justify-center text-ink-muted">
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border-2 border-line bg-surface-alt p-3"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-2xl">
                        {item.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{item.name}</p>
                        <p className="text-xs text-ink-muted">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-ink-secondary hover:bg-surface-alt"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-ink">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-ink-secondary hover:bg-surface-alt"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-danger hover:bg-danger-soft"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            <div className="border-t-2 border-line px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-ink-muted">Total</span>
                <span className="text-xl font-bold text-ink">{formatCurrency(calculateTotal())}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full"
              >
                <ShoppingCart className="h-4 w-4" />
                Bayar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {orderData && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={handleReceiptClose}
          orderId={orderData.orderId}
          tableNumber={orderData.tableNumber}
          items={orderData.items}
          subtotal={orderData.subtotal}
          tax={orderData.tax}
          discount={orderData.discount}
          roundingAmount={orderData.roundingAmount}
          total={orderData.total}
          paymentMethod={orderData.paymentMethod}
          cashierName="Kasir"
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { ProductCard } from '@/src/features/pos/components/ProductCard';
import { OnlineCartPanel } from '@/src/features/online-order/components/OnlineCartPanel';
import { OnlineCheckoutModal } from '@/src/features/online-order/components/OnlineCheckoutModal';
import { VoidPaymentModal } from '@/src/components/ui/VoidPaymentModal';
import { useOnlineCartStore } from '@/src/store/useOnlineCartStore';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Loader2, Home, ShoppingCart, User, Menu, X } from 'lucide-react';
import { ModifierOption, UIModifierGroup } from '@/src/features/pos/components/ModifierModal';
import { useRouter } from 'next/navigation';

export default function OnlineOrderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [voidPaymentModalOpen, setVoidPaymentModalOpen] = useState(false);
  const [selectedPaymentForVoid, setSelectedPaymentForVoid] = useState<{ id: string; amount: number } | null>(null);
  const [outletName, setOutletName] = useState<string>('');
  const [showMobileCart, setShowMobileCart] = useState(false);

  const cartItemCount = useOnlineCartStore((state: any) => state.items.reduce((sum: number, item: any) => sum + item.quantity, 0));
  const setDeliveryFee = useOnlineCartStore((state: any) => state.setDeliveryFee);

  const handleVoidPayment = (paymentId: string, amount: number) => {
    // Check if user has admin role
    if (user?.role !== 'admin') {
      toast('error', 'Hanya admin yang dapat void pembayaran');
      return;
    }
    setSelectedPaymentForVoid({ id: paymentId, amount });
    setVoidPaymentModalOpen(true);
  };

  const handleVoidPaymentComplete = () => {
    setVoidPaymentModalOpen(false);
    setSelectedPaymentForVoid(null);
    toast('success', 'Pembayaran berhasil di-void');
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

  useEffect(() => {
    // Get outlet name and delivery fee from environment or API
    const outletName = process.env.NEXT_PUBLIC_OUTLET_NAME || 'Restoran';
    setOutletName(outletName);

    // Fetch outlet delivery fee
    const fetchOutletDeliveryFee = async () => {
      try {
        const { db } = await import('@/src/lib/db');
        const outlets = await db.outlets.toArray();
        if (outlets.length > 0 && outlets[0].delivery_fee) {
          setDeliveryFee(outlets[0].delivery_fee);
        }
      } catch (error) {
        console.error('Error fetching outlet delivery fee:', error);
      }
    };
    fetchOutletDeliveryFee();
  }, [setDeliveryFee]);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading products</p>
          <p className="text-sm text-gray-600">{productsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-ink">Pemesanan Online - {outletName}</h1>
              <p className="text-xs md:text-sm text-ink-secondary">Pesan dari rumah, kami antar atau siapkan untuk diambil</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {/* Navigation Shortcuts */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push('/')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Beranda"
                >
                  <Home className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Login Admin"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Cart Badge - Desktop */}
              <div className="hidden md:flex items-center gap-2 border-l pl-3">
                <span className="text-sm font-medium text-ink-secondary">Keranjang:</span>
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                  {cartItemCount}
                </span>
              </div>

              {/* Mobile Cart Button */}
              <button
                onClick={() => setShowMobileCart(true)}
                className="md:hidden relative p-2 rounded-lg bg-primary text-white"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  stockCount={product.stock_quantity ?? null}
                  modifiers={getProductModifiers(product)}
                  onAddToCart={(productId, name, price, modifiers) => {
                    useOnlineCartStore.getState().addItem({
                      productId,
                      name,
                      price,
                      quantity: 1,
                      modifiers,
                    });
                  }}
                />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Tidak ada produk di kategori ini</p>
              </div>
            )}
          </div>

          {/* Cart Panel - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <OnlineCartPanel
              onCheckout={() => setIsCheckoutModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Keranjang</h2>
              <button onClick={() => setShowMobileCart(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <OnlineCartPanel
                onCheckout={() => {
                  setShowMobileCart(false);
                  setIsCheckoutModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <OnlineCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        outletName={outletName}
      />

      {/* Void Payment Modal */}
      {selectedPaymentForVoid && (
        <VoidPaymentModal
          isOpen={voidPaymentModalOpen}
          onClose={() => {
            setVoidPaymentModalOpen(false);
            setSelectedPaymentForVoid(null);
          }}
          paymentId={selectedPaymentForVoid.id}
          paymentAmount={selectedPaymentForVoid.amount}
          onVoided={handleVoidPaymentComplete}
        />
      )}
    </div>
  );
}

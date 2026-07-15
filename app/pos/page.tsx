'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { ProductCard } from '@/src/features/pos/components/ProductCard';
import { CartPanel } from '@/src/features/pos/components/CartPanel';
import { AddProductModal } from '@/src/features/pos/components/AddProductModal';
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
import { ShoppingCart, Search, Wifi, WifiOff, RefreshCw, AlertCircle, Plus, X } from 'lucide-react';

export default function POSPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

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
      <div
        className={`flex items-center justify-between gap-2 border-b border-line px-4 py-1.5 text-sm ${
          isOnline ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-4 w-4" aria-hidden="true" /> : <WifiOff className="h-4 w-4" aria-hidden="true" />}
          <span className="font-medium">{isOnline ? 'Online' : 'Offline Mode'}</span>
          {productsFromCache && <Badge tone="info">Data dari cache</Badge>}
          {pendingTransactions > 0 && (
            <Badge tone="warning">
              <AlertCircle className="h-3 w-3" /> {pendingTransactions} transaksi pending
            </Badge>
          )}
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
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-ink">{selectedCategoryName}</h2>
              <p className="text-sm text-ink-muted">Menampilkan {filteredProducts.length} produk</p>
            </div>
            {userRole === 'admin' && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Produk</span>
              </Button>
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
                  userRole={userRole}
                  onProductUpdate={refetchProducts}
                />
              ))}
            </div>
          )}
        </main>

        {/* Cart Panel (desktop) */}
        <aside className="hidden w-96 lg:block" aria-label="Keranjang">
          <CartPanel />
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
            <CartPanel />
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={refetchProducts}
        userRole={userRole}
      />
    </div>
  );
}

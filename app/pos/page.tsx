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
import { seedDummyData, clearDummyData } from '@/src/lib/seedData';
import { ShoppingCart, Search, Wifi, WifiOff, RefreshCw, AlertCircle, Database } from 'lucide-react';

export default function POSPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Fetch data from the local API with offline support
  const { products, loading: productsLoading, error: productsError, isFromCache: productsFromCache } = useProducts();
  const { categories, loading: categoriesLoading, isFromCache: categoriesFromCache } = useCategories();
  
  // Sync manager for offline-first functionality
  const { 
    isOnline, 
    pendingTransactions, 
    syncInProgress, 
    syncError, 
    lastSyncTime,
    triggerManualSync 
  } = useSyncManager();
  
  // Mock modifier data - replace with useModifiers when productId is available
  const modifiers: UIModifierGroup[] = [
    {
      id: crypto.randomUUID(),
      name: 'Level Pedas',
      required: false,
      multiSelect: false,
      options: [
        { id: crypto.randomUUID(), name: 'Tidak Pedas', price: 0, selected: false },
        { id: crypto.randomUUID(), name: 'Sedang', price: 0, selected: false },
        { id: crypto.randomUUID(), name: 'Pedas', price: 2000, selected: false },
        { id: crypto.randomUUID(), name: 'Sangat Pedas', price: 3000, selected: false },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: 'Tambahan',
      required: false,
      multiSelect: true,
      options: [
        { id: crypto.randomUUID(), name: 'Extra Keju', price: 5000, selected: false },
        { id: crypto.randomUUID(), name: 'Extra Telur', price: 3000, selected: false },
        { id: crypto.randomUUID(), name: 'Extra Nasi', price: 5000, selected: false },
      ],
    },
  ];

  const handleAddToCart = (productId: string, name: string, price: number, modifiers: ModifierOption[]) => {
    console.log('🛒 Adding to cart:', { productId, name, price, modifiers });
    useCartStore.getState().addToCart({
      productId,
      name,
      price,
      quantity: 1,
      modifiers,
    });
    console.log('✅ Item added to cart');
  };

  const handleProductUpdate = () => {
    // Refetch products after update
    window.location.reload();
  };

  const handleSeedData = async () => {
    console.log('🌱 Starting seed data process...');
    await seedDummyData();
    // Force refetch products after seeding
    window.location.reload();
  };

  // Filter products based on category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Semua' || 
      product.category_id === selectedCategory ||
      (selectedCategory === 'Makanan' && ['Nasi Goreng Spesial', 'Mie Goreng Jawa', 'Ayam Bakar Madu', 'Sate Ayam', 'Bakso Urat'].includes(product.name)) ||
      (selectedCategory === 'Minuman' && ['Kopi Susu Gula Aren', 'Es Teh Manis', 'Es Jeruk'].includes(product.name)) ||
      (selectedCategory === 'Snack' && !['Nasi Goreng Spesial', 'Mie Goreng Jawa', 'Ayam Bakar Madu', 'Sate Ayam', 'Bakso Urat', 'Kopi Susu Gula Aren', 'Es Teh Manis', 'Es Jeruk'].includes(product.name));
    
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Loading state
  if (authLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (productsError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <Search className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Gagal memuat produk</p>
          <p className="text-gray-600 text-sm">{productsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <Header
        title="Kitchen POS"
        onSearch={setSearchQuery}
      />

      {/* Sync Status Bar */}
      <div className={`flex items-center justify-between px-4 py-2 text-sm ${
        isOnline ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
      }`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="font-medium">
            {isOnline ? 'Online' : 'Offline Mode'}
          </span>
          {productsFromCache && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              Data dari cache
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {pendingTransactions > 0 && (
            <div className="flex items-center gap-1 text-yellow-700">
              <AlertCircle className="w-4 h-4" />
              <span>{pendingTransactions} transaksi pending</span>
            </div>
          )}
          
          {lastSyncTime && (
            <span className="text-xs opacity-75">
              Terakhir sync: {new Date(lastSyncTime).toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={triggerManualSync}
            disabled={syncInProgress || !isOnline}
            className={`flex items-center gap-1 px-3 py-1 rounded ${
              syncInProgress 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${syncInProgress ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Sync Error Alert */}
      {syncError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{syncError}</span>
          </div>
        </div>
      )}

      {/* Dev Tools - Seed Data */}
      <div className="bg-gray-100 border-b px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">Dev Tools:</span>
          <button
            onClick={handleSeedData}
            className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            <Database className="w-4 h-4" />
            Seed Dummy Data
          </button>
          <button
            onClick={() => clearDummyData()}
            className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            <Database className="w-4 h-4" />
            Clear Data
          </button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm font-medium text-gray-600">User:</span>
            <span className="text-sm text-gray-800">{user?.username} ({userRole})</span>
            <button
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="px-3 py-1 text-sm rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Logout
            </button>
          </div>
        </div>
        <span className="text-xs text-gray-500">Check console for detailed logs</span>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Categories */}
        <Sidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Product Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{selectedCategory}</h2>
            <p className="text-gray-600">Menampilkan {filteredProducts.length} produk</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                modifiers={modifiers}
                userRole={userRole}
                onProductUpdate={handleProductUpdate}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Search className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Tidak ada produk ditemukan</p>
              <p className="text-sm">Coba kata kunci atau kategori lain</p>
            </div>
          )}
        </div>

        {/* Cart Panel */}
        <div className="w-96 hidden lg:block">
          <CartPanel />
        </div>
      </div>

      {/* Mobile Cart Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button className="bg-blue-600 text-white p-4 rounded-full shadow-lg">
          <ShoppingCart className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

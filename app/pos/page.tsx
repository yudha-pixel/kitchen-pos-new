'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { useTables, TableStatus } from '@/src/hooks/useTables';
import { useToast } from '@/src/components/ui/Toast';
import { useOutletStore } from '@/src/features/outlet/outletStore';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/src/components/ui/Skeleton';
import { ConnectionIndicator } from '@/src/components/ui/ConnectionIndicator';
import { ShoppingCart, Search, RefreshCw, AlertCircle, Plus, X, Utensils, History, Printer, Trash2, Loader2, CreditCard } from 'lucide-react';
import { ReceiptModal } from '@/src/components/pos/ReceiptModal';
import { ProductListModal } from '@/src/features/pos/components/ProductListModal';
import { PaymentModal } from '@/src/components/pos/PaymentModal';
import { VoidPaymentModal } from '@/src/components/ui/VoidPaymentModal';
import { calculateMenuStocks, seedSampleInventoryData, debugStockDatabase, forceReseedInventoryData, getAllProductNames, canOrderProduct } from '@/src/features/inventory/inventoryService';
import { useTheme } from '@/src/context/ThemeContext';

export default function POSPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { selectedOutletId } = useOutletStore();
  const { settings } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [showTableOrders, setShowTableOrders] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any>(null);
  const [openingReceiptForOrderId, setOpeningReceiptForOrderId] = useState<string | null>(null);
  const [deleteHistoryConfirmOpen, setDeleteHistoryConfirmOpen] = useState(false);
  const [deleteOrderConfirmOpen, setDeleteOrderConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [orderCategory, setOrderCategory] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [courierName, setCourierName] = useState('');
  const [courierType, setCourierType] = useState<'internal' | 'external'>('internal');
  const [productStocks, setProductStocks] = useState<Map<string, number | null>>(new Map());
  const [productListModalOpen, setProductListModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<any>(null);
  const [voidPaymentModalOpen, setVoidPaymentModalOpen] = useState(false);
  const [selectedPaymentForVoid, setSelectedPaymentForVoid] = useState<{ id: string; amount: number } | null>(null);

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
  const { tables, loading: tablesLoading, updateTableStatus, refetch: refetchTables } = useTables();

  // Listen for order creation to update table status to occupied
  useEffect(() => {
    const handleOrderCreated = (event: Event) => {
      const customEvent = event as CustomEvent<{ orderId: string }>;
      console.log('📡 Order created event received, updating table status...');
      
      // Refetch tables to get updated hasActiveOrders status
      refetchTables();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orderCreated', handleOrderCreated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orderCreated', handleOrderCreated);
      }
    };
  }, [refetchTables]);

  // Listen for order completion to update table status back to available
  useEffect(() => {
    const handleOrderCompleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ orderId: string }>;
      console.log('📡 Order completed event received, updating table status...');
      
      // Refetch tables to get updated hasActiveOrders status
      refetchTables();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orderCompleted', handleOrderCompleted);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orderCompleted', handleOrderCompleted);
      }
    };
  }, [refetchTables]);

  // Extract unique categories from products for ProductListModal
  const productCategories = useMemo(() => {
    const uniqueCategories = new Map();
    products.forEach(product => {
      if (product.category_id) {
        const category = categories.find(c => c.id === product.category_id);
        if (category) {
          uniqueCategories.set(category.id, { id: category.id, name: category.name });
        }
      }
    });
    return Array.from(uniqueCategories.values());
  }, [products, categories]);

  // Calculate stock for all products when products are loaded
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('🔍 [POS Page] Products loaded:', products.length, 'products');
      console.log('🔍 [POS Page] Product IDs:', products.map(p => ({ id: p.id, name: p.name })));

      // Seed sample inventory data if needed
      seedSampleInventoryData().then(() => {
        console.log('🔍 [POS Page] Inventory data check completed');
      }).catch(error => {
        console.error('❌ Failed to seed inventory data:', error);
      });

      const productIds = products.map(p => p.id);
      console.log('🔍 [POS Page] Calculating stocks for:', productIds.length, 'products');
      calculateMenuStocks(productIds).then(stockMap => {
        console.log('🔍 [POS Page] Stock calculation result:', Array.from(stockMap.entries()));
        console.log('🔍 [POS Page] Setting productStocks state...');
        setProductStocks(stockMap);
        console.log('🔍 [POS Page] productStocks state set');
      }).catch(error => {
        console.error('❌ Failed to calculate product stocks:', error);
      });
    }
  }, [products]);

  // Debug log to check productStocks state changes
  useEffect(() => {
    console.log('🔍 [POS Page] productStocks state changed:', Array.from(productStocks.entries()));
  }, [productStocks]);

  // Listen for inventory stock changes and recalculate menu stock automatically
  useEffect(() => {
    const handleInventoryStockChanged = () => {
      console.log('📡 Received inventoryStockChanged event, recalculating menu stock...');
      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        calculateMenuStocks(productIds).then(stockMap => {
          console.log('🔍 [POS Page] Stock recalculated after inventory change:', Array.from(stockMap.entries()));
          setProductStocks(stockMap);
        }).catch(error => {
          console.error('❌ Failed to recalculate stock after inventory change:', error);
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('inventoryStockChanged', handleInventoryStockChanged);
      console.log('🔍 [POS Page] Listening for inventoryStockChanged events');
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('inventoryStockChanged', handleInventoryStockChanged);
        console.log('🔍 [POS Page] Stopped listening for inventoryStockChanged events');
      }
    };
  }, [products]);

  // Recalculate stock when outlet changes to ensure real-time data
  useEffect(() => {
    if (selectedOutletId && products && products.length > 0) {
      console.log('🔍 [POS Page] Outlet changed to:', selectedOutletId, '- recalculating stock...');
      const productIds = products.map(p => p.id);
      calculateMenuStocks(productIds).then(stockMap => {
        console.log('🔍 [POS Page] Stock recalculated after outlet change:', Array.from(stockMap.entries()));
        setProductStocks(stockMap);
        toast('success', 'Stok diperbarui sesuai outlet yang dipilih');
      }).catch(error => {
        console.error('❌ Failed to recalculate stock after outlet change:', error);
      });
    }
  }, [selectedOutletId, products]);

  // Listen for order completion and refresh transaction history
  useEffect(() => {
    const handleOrderCompleted = () => {
      console.log('📡 Received orderCompleted event, refreshing transaction history...');
      const fetchTransactionHistory = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .anyOf(['completed', 'pending', 'done', 'paid', 'cancelled'])
            .reverse()
            .toArray();

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
                return {
                  ...order,
                  items,
                };
              })
            );

            setTransactionHistory(ordersWithItems);
          } catch (error) {
            console.error('Failed to refresh transaction history:', error);
          }
        };
        fetchTransactionHistory();
    };

    // Also listen for orderCreated events (for "Kirim ke Dapur" orders)
    const handleOrderCreated = () => {
      console.log('📡 Received orderCreated event, refreshing transaction history...');
      const fetchTransactionHistory = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .anyOf(['completed', 'pending', 'done', 'paid', 'cancelled'])
            .reverse()
            .toArray();

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
                return {
                  ...order,
                  items,
                };
              })
            );

            setTransactionHistory(ordersWithItems);
          } catch (error) {
            console.error('Failed to refresh transaction history:', error);
          }
        };
        fetchTransactionHistory();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orderCompleted', handleOrderCompleted);
      window.addEventListener('orderCreated', handleOrderCreated);
      console.log('🔍 [POS Page] Listening for orderCompleted and orderCreated events');
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orderCompleted', handleOrderCompleted);
        window.removeEventListener('orderCreated', handleOrderCreated);
        console.log('🔍 [POS Page] Stopped listening for order events');
      }
    };
  }, []);

  // Handler for force re-seeding inventory data
  const handleForceReseed = async () => {
    try {
      console.log('🔄 Force re-seeding inventory data...');
      await forceReseedInventoryData();
      toast('success', 'Data inventori berhasil di-reset ulang');
      
      // Recalculate stocks after re-seeding
      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        const stockMap = await calculateMenuStocks(productIds);
        setProductStocks(stockMap);
      }
    } catch (error) {
      console.error('❌ Failed to force re-seed:', error);
      toast('error', 'Gagal me-reset data inventori');
    }
  };

  const handleGetAllProductNames = async () => {
    try {
      const productNames = await getAllProductNames();
      console.log('Product names retrieved:', productNames);
      toast('success', `Ditemukan ${productNames.length} produk (lihat console)`);
    } catch (error) {
      console.error('Failed to get product names:', error);
      toast('error', 'Gagal mengambil daftar produk');
    }
  };

  const handleOpenProductListModal = () => {
    setProductListModalOpen(true);
  };

  // Handler to recalculate menu stock (sync with inventory)
  const handleRecalculateStock = async () => {
    try {
      console.log('🔄 Recalculating menu stock from inventory...');
      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        const stockMap = await calculateMenuStocks(productIds);
        setProductStocks(stockMap);
        console.log('✅ Menu stock recalculated successfully');
        toast('success', 'Stok menu disinkronkan dengan inventori');
      }
    } catch (error) {
      console.error('❌ Failed to recalculate stock:', error);
      toast('error', 'Gagal menyinkronkan stok');
    }
  };

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

  // Listen for order completion events from KDS and orderCreated events
  useEffect(() => {
    const handleOrderReady = (event: CustomEvent) => {
      console.log('📡 Received orderReady event:', event.detail);
      if (showTableOrders) {
        // Refresh table orders to show updated status
        const fetchTableOrders = async () => {
          try {
            const { db } = await import('@/src/lib/db');
            const orders = await db.orders
              .where('status')
              .anyOf(['pending', 'done'])
              .reverse()
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

            setTableOrders(ordersWithItems);
          } catch (error) {
            console.error('Failed to fetch table orders:', error);
          }
        };
        fetchTableOrders();
      }
    };

    const handleOrderCreated = () => {
      console.log('📡 Received orderCreated event, refreshing table orders...');
      if (showTableOrders) {
        // Refresh table orders to show new pending orders
        const fetchTableOrders = async () => {
          try {
            const { db } = await import('@/src/lib/db');
            const orders = await db.orders
              .where('status')
              .anyOf(['pending', 'done'])
              .reverse()
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

            setTableOrders(ordersWithItems);
          } catch (error) {
            console.error('Failed to fetch table orders:', error);
          }
        };
        fetchTableOrders();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('orderReady', handleOrderReady as EventListener);
      window.addEventListener('orderCreated', handleOrderCreated);
      console.log('🔍 [POS Page] Listening for orderReady and orderCreated events');
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orderReady', handleOrderReady as EventListener);
        window.removeEventListener('orderCreated', handleOrderCreated);
        console.log('🔍 [POS Page] Stopped listening for order events');
      }
    };
  }, [showTableOrders]);

  // Fetch table orders with status 'pending' or 'done' when tab is opened
  useEffect(() => {
    if (showTableOrders) {
      const fetchTableOrders = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .anyOf(['pending', 'done'])
            .reverse()
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
            .anyOf(['completed', 'pending', 'done', 'paid', 'cancelled'])
            .reverse()
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

  // Handle delete individual order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      const { db } = await import('@/src/lib/db');
      
      // Delete order items first
      await db.order_items.where('order_id').equals(orderToDelete.id).delete();
      console.log(`✅ Order items for order ${orderToDelete.id} deleted`);
      
      // Delete order
      await db.orders.where('id').equals(orderToDelete.id).delete();
      console.log(`✅ Order ${orderToDelete.id} deleted`);
      
      // Update state
      setTableOrders(prev => prev.filter(order => order.id !== orderToDelete.id));
      setDeleteOrderConfirmOpen(false);
      setOrderToDelete(null);
      toast('success', 'Pesanan berhasil dihapus');
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast('error', 'Gagal menghapus pesanan');
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

  const handleAddToCart = async (productId: string, name: string, price: number, modifiers: ModifierOption[]) => {
    // Check stock availability before adding to cart
    const stockCheck = await canOrderProduct(productId, 1);
    if (!stockCheck.canOrder) {
      toast('error', `Stok tidak mencukupi untuk ${name}. ${stockCheck.message}`);
      return;
    }

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

  const handleDirectPayment = (order: any) => {
    // Open payment modal directly with order data
    setSelectedOrderForPayment(order);
    setPaymentModalOpen(true);
  };

  const handleSplitBillComplete = async (selectedItems: any[], paymentMethod: string) => {
    try {
      const order = selectedOrderForPayment;
      if (!order) return;

      // Prevent duplicate payment: check if order is already paid
      if (order.status === 'completed' || order.status === 'paid') {
        toast('warning', 'Pesanan ini sudah dibayar sebelumnya');
        setPaymentModalOpen(false);
        setSelectedOrderForPayment(null);
        return;
      }

      // Calculate total for selected items
      const calculatedTotal = selectedItems.reduce((sum: number, item: any) => {
        const price = Number(item.price_at_time) || 0;
        return sum + (price * item.quantity);
      }, 0);

      // Convert payment method to database format
      const paymentMethodMap: Record<string, 'cash' | 'card' | 'qr' | 'transfer'> = {
        'CASH': 'cash',
        'QRIS': 'qr',
        'DEBIT': 'card',
      };
      const dbPaymentMethod = paymentMethodMap[paymentMethod] || 'cash';

      // Update order status to 'completed' with payment details
      const { db } = await import('@/src/lib/db');
      await db.orders.where('id').equals(order.id).modify({
        status: 'completed',
        payment_method: dbPaymentMethod,
        total_amount: calculatedTotal,
        sync_status: 'pending',
      });

      console.log(`✅ Order ${order.id} split payment processed with ${paymentMethod}`);

      // Dispatch event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderCompleted', { detail: { orderId: order.id } }));
      }

      toast('success', `Pembayaran split Rp${calculatedTotal.toLocaleString('id-ID')} berhasil diproses`);

      // Clear cart after successful payment from Transaction History
      useCartStore.getState().clearCart();

      // Close payment modal
      setPaymentModalOpen(false);
      setSelectedOrderForPayment(null);

      // Refresh table orders to remove the paid order
      if (showTableOrders) {
        const fetchTableOrders = async () => {
          try {
            const { db } = await import('@/src/lib/db');
            const orders = await db.orders
              .where('status')
              .anyOf(['pending', 'done'])
              .reverse()
              .toArray();

            const ordersWithItems = await Promise.all(
              orders.map(async (order) => {
                if (!order.id) {
                  return { ...order, items: [] };
                }
                const items = await db.order_items
                  .where('order_id')
                  .equals(order.id)
                  .toArray();
                const itemsWithProducts = await Promise.all(
                  items.map(async (item) => {
                    const product = await db.products.get(item.product_id);
                    return { ...item, product };
                  })
                );
                return {
                  ...order,
                  items: itemsWithProducts,
                };
              })
            );

            setTableOrders(ordersWithItems);

            // Update table status to available if this was a dine-in order and no more pending orders
            if (order.table_number && order.order_category === 'dine-in') {
              const remainingOrders = await db.orders
                .where('table_number')
                .equals(order.table_number)
                .and(order => ['pending', 'done'].includes(order.status))
                .count();

              if (remainingOrders === 0) {
                try {
                  await updateTableStatus(order.table_number, 'available');
                  console.log(`✅ Table ${order.table_number} status updated to available after split payment`);
                } catch (tableError) {
                  console.error('Failed to update table status:', tableError);
                }
              }
            }
          } catch (error) {
            console.error('Failed to refresh table orders:', error);
          }
        };
        fetchTableOrders();
      }

      // Refresh transaction history
      const fetchTransactionHistory = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .anyOf(['completed', 'pending', 'done', 'paid', 'cancelled'])
            .reverse()
            .toArray();

          const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
              if (!order.id) {
                return { ...order, items: [] };
              }
              const items = await db.order_items
                .where('order_id')
                .equals(order.id)
                .toArray();
              return { ...order, items };
            })
          );

          setTransactionHistory(ordersWithItems);
        } catch (error) {
          console.error('Failed to refresh transaction history:', error);
        }
      };
      fetchTransactionHistory();

    } catch (error) {
      console.error('Failed to process split payment:', error);
      toast('error', 'Gagal memproses pembayaran split');
    }
  };

  const handlePaymentComplete = async (paymentMethod: string, amount?: number) => {
    try {
      const order = selectedOrderForPayment;
      if (!order) return;

      // Prevent duplicate payment: check if order is already paid
      if (order.status === 'completed' || order.status === 'paid') {
        toast('warning', 'Pesanan ini sudah dibayar sebelumnya');
        setPaymentModalOpen(false);
        setSelectedOrderForPayment(null);
        return;
      }

      // Calculate total from order items
      const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
        const price = Number(item.price_at_time) || 0;
        return sum + (price * item.quantity);
      }, 0) || 0;

      // Convert payment method to database format
      const paymentMethodMap: Record<string, 'cash' | 'card' | 'qr' | 'transfer'> = {
        'CASH': 'cash',
        'QRIS': 'qr',
        'DEBIT': 'card',
      };
      const dbPaymentMethod = paymentMethodMap[paymentMethod] || 'cash';

      // Update order status to 'completed' with payment details
      const { db } = await import('@/src/lib/db');
      await db.orders.where('id').equals(order.id).modify({
        status: 'completed',
        payment_method: dbPaymentMethod,
        total_amount: calculatedTotal,
        sync_status: 'pending',
      });

      console.log(`✅ Order ${order.id} marked as paid with ${paymentMethod}${amount ? ` (amount: Rp${amount.toLocaleString('id-ID')})` : ''}`);

      // Dispatch event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('orderCompleted', { detail: { orderId: order.id } }));
      }

      const change = amount ? amount - calculatedTotal : 0;
      let message = `Pembayaran Rp${calculatedTotal.toLocaleString('id-ID')} berhasil diproses`;
      if (paymentMethod === 'CASH' && change > 0) {
        message += `. Kembalian: Rp${change.toLocaleString('id-ID')}`;
      }
      toast('success', message);

      // Clear cart after successful payment from Transaction History
      useCartStore.getState().clearCart();

      // Close payment modal
      setPaymentModalOpen(false);
      setSelectedOrderForPayment(null);

      // Refresh table orders to remove the paid order
      if (showTableOrders) {
        const fetchTableOrders = async () => {
          try {
            const { db } = await import('@/src/lib/db');
            const orders = await db.orders
              .where('status')
              .anyOf(['pending', 'done'])
              .reverse()
              .toArray();

            const ordersWithItems = await Promise.all(
              orders.map(async (order) => {
                if (!order.id) {
                  return { ...order, items: [] };
                }
                const items = await db.order_items
                  .where('order_id')
                  .equals(order.id)
                  .toArray();
                const itemsWithProducts = await Promise.all(
                  items.map(async (item) => {
                    const product = await db.products.get(item.product_id);
                    return { ...item, product };
                  })
                );
                return {
                  ...order,
                  items: itemsWithProducts,
                };
              })
            );

            setTableOrders(ordersWithItems);

            // Update table status to available if this was a dine-in order and no more pending orders
            if (order.table_number && order.order_category === 'dine-in') {
              const remainingOrders = await db.orders
                .where('table_number')
                .equals(order.table_number)
                .and(order => ['pending', 'done'].includes(order.status))
                .count();

              if (remainingOrders === 0) {
                try {
                  await updateTableStatus(order.table_number, 'available');
                  console.log(`✅ Table ${order.table_number} status updated to available`);
                } catch (tableError) {
                  console.error('Failed to update table status:', tableError);
                }
              }
            }
          } catch (error) {
            console.error('Failed to refresh table orders:', error);
          }
        };
        fetchTableOrders();
      }

      // Refresh transaction history
      const fetchTransactionHistory = async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const orders = await db.orders
            .where('status')
            .anyOf(['completed', 'pending', 'done', 'paid', 'cancelled'])
            .reverse()
            .toArray();

          const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
              if (!order.id) {
                return { ...order, items: [] };
              }
              const items = await db.order_items
                .where('order_id')
                .equals(order.id)
                .toArray();
              return { ...order, items };
            })
          );

          setTransactionHistory(ordersWithItems);
        } catch (error) {
          console.error('Failed to refresh transaction history:', error);
        }
      };
      fetchTransactionHistory();

    } catch (error) {
      console.error('Failed to process payment:', error);
      toast('error', 'Gagal memproses pembayaran');
    }
  };

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
    // Refresh transaction history after void
    const fetchTransactionHistory = async () => {
      try {
        const { db } = await import('@/src/lib/db');
        const orders = await db.orders
          .where('status')
          .anyOf(['completed', 'pending', 'done', 'paid', 'cancelled'])
          .reverse()
          .toArray();

        const ordersWithItems = await Promise.all(
          orders.map(async (order) => {
            if (!order.id) {
              return { ...order, items: [] };
            }
            const items = await db.order_items
              .where('order_id')
              .equals(order.id)
              .toArray();
            return { ...order, items };
          })
        );

        setTransactionHistory(ordersWithItems);
      } catch (error) {
        console.error('Failed to refresh transaction history:', error);
      }
    };
    fetchTransactionHistory();
  };

  const handleClearCache = async () => {
    try {
      console.log('🔄 Starting cache clear and re-seed...');
      const { db } = await import('@/src/lib/db');
      
      console.log('🗑️ Clearing database tables...');
      await db.products.clear();
      await db.categories.clear();
      await db.modifiers.clear();
      await db.ingredients.clear();
      await db.recipes.clear();
      await db.shifts.clear();
      await db.employees.clear();
      await db.attendance.clear();
      console.log('✅ Database cleared');
      
      // Re-seed with new category data (force re-seeding)
      console.log('🌱 Starting re-seeding with force=true...');
      const { seedDummyData } = await import('@/src/lib/seedData');
      await seedDummyData(true);
      console.log('✅ Re-seeding completed');
      
      console.log('🔄 Reloading page...');
      window.location.reload();
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      toast('error', 'Gagal membersihkan cache. Cek console untuk detail error.');
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sort products
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      }
      return 0;
    });

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, sortOrder]);

  return (
    <div 
      className="flex min-h-screen w-full flex-col bg-background overflow-x-hidden"
      data-card-view={settings?.card_view || 'grid'}
      data-cart-position={settings?.cart_position || 'right-sidebar'}
    >
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
            onClick={handleRecalculateStock}
            className="inline-flex rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 sm:inline-flex items-center gap-2"
            title="Sinkronkan stok menu dengan inventori"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sync Stok</span>
          </button>
          <button
            onClick={handleOpenProductListModal}
            className="inline-flex rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 sm:inline-flex items-center gap-2"
            title="Lihat daftar produk dan stok"
          >
            <RefreshCw className="h-4 w-4" />
            <span>List Produk</span>
          </button>
          <button
            onClick={triggerManualSync}
            disabled={syncInProgress || !isOnline}
            aria-label="Sinkronkan data"
            className="flex min-h-9 items-center gap-1 rounded-lg bg-surface px-3 text-ink-secondary transition-colors hover:bg-surface-alt hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Dev Tools */}
      <div className="flex items-center gap-4 border-b border-line bg-surface-alt px-6 py-1.5">
        <span className="text-xs font-medium text-ink-muted">Tools:</span>
        <button
          onClick={handleClearCache}
          className="flex items-center gap-1 rounded bg-warning-soft px-2 py-1 text-xs font-medium text-warning hover:opacity-80"
        >
          <RefreshCw className="h-3 w-3" />
          Clear Cache & Reload
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

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
                          {order.customer_name && (
                            <p className="text-sm font-medium text-ink">{order.customer_name}</p>
                          )}
                          <p className="text-xs text-ink-muted">
                            {new Date(order.created_at).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Kitchen Status Badge */}
                          <Badge tone={
                            order.status === 'done' || order.status === 'ready' || order.status === 'served' ? 'success' :
                            order.status === 'preparing' ? 'warning' :
                            'neutral'
                          }>
                            {order.status === 'done' || order.status === 'ready' || order.status === 'served' ? 'Selesai Masak' :
                             order.status === 'preparing' ? 'Sedang Masak' :
                             order.status === 'pending' ? 'Menunggu' :
                             order.status || '-'}
                          </Badge>
                          {/* Payment Status Badge */}
                          <Badge tone={
                            order.payment_method ? 'success' : 'warning'
                          }>
                            {order.payment_method ? 'Lunas' : 'Belum Bayar'}
                          </Badge>
                          <button
                            onClick={() => {
                              setOrderToDelete(order);
                              setDeleteOrderConfirmOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                            title="Hapus pesanan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Notes Section */}
                      {order.notes && (
                        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800 font-medium">Catatan:</p>
                          <p className="text-sm text-amber-900">{order.notes}</p>
                        </div>
                      )}

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
                        <Badge tone={
                          order.status === 'completed' || order.status === 'paid' ? 'success' :
                          order.status === 'cancelled' ? 'danger' :
                          'warning'
                        }>
                          {order.status === 'completed' || order.status === 'paid' ? 'Lunas' :
                           order.status === 'cancelled' ? 'Batal' :
                           'Belum Bayar'}
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
                        {/* Bayar button - only show for pending orders */}
                        {(order.status === 'pending' || order.status === 'done') && (
                          <button
                            onClick={() => handleDirectPayment(order)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                            Bayar
                          </button>
                        )}
                        {/* Void Payment button - only show for completed/paid orders and admin users */}
                        {(order.status === 'completed' || order.status === 'paid') && user?.role === 'admin' && order.payment_method && (
                          <button
                            onClick={() => {
                              const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
                                const price = Number(item.price_at_time) || 0;
                                return sum + (price * item.quantity);
                              }, 0) || 0;
                              // Use order ID as payment ID for now - in production this should be the actual payment transaction ID
                              handleVoidPayment(order.id, calculatedTotal);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Void Pembayaran
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setOpeningReceiptForOrderId(order.id);
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
                            setOpeningReceiptForOrderId(null);
                          }}
                          disabled={openingReceiptForOrderId === order.id}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                            openingReceiptForOrderId === order.id
                              ? 'bg-slate-800 text-white cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {openingReceiptForOrderId === order.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Membuka...
                            </>
                          ) : (
                            <>
                              <Printer className="w-4 h-4" />
                              Cetak Struk
                            </>
                          )}
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
              {/* Search and Sort Controls */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="name">Nama</option>
                    <option value="price">Harga</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    title={sortOrder === 'asc' ? 'Urutkan Naik' : 'Urutkan Turun'}
                  >
                    {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                  </button>
                </div>
              </div>

              {/* Category Chips */}
              <div className="mb-6 overflow-x-auto pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-600 text-white active:bg-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300'
                    }`}
                  >
                    Semua
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-indigo-600 text-white active:bg-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Category Selection */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderCategory('dine-in')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      orderCategory === 'dine-in'
                        ? 'bg-indigo-600 text-white active:bg-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300'
                    }`}
                  >
                    Dine-in
                  </button>
                  <button
                    onClick={() => setOrderCategory('takeaway')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      orderCategory === 'takeaway'
                        ? 'bg-orange-600 text-white active:bg-orange-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300'
                    }`}
                  >
                    Takeaway
                  </button>
                  <button
                    onClick={() => setOrderCategory('delivery')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      orderCategory === 'delivery'
                        ? 'bg-emerald-600 text-white active:bg-emerald-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300'
                    }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {/* Table Selection for Dine-in */}
              {orderCategory === 'dine-in' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Meja</label>
                  {tablesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memuat meja...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {tables.map((table) => {
                        // Determine effective status based on active orders
                        // If table has active orders, show as occupied regardless of backend status
                        const effectiveStatus = table.hasActiveOrders ? 'occupied' : table.status;
                        
                        const statusConfig = {
                          available: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700', label: 'Available' },
                          occupied: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700', label: 'Terisi' },
                          dirty: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', label: 'Kotor' },
                          reserved: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', label: 'Reservasi' },
                        };
                        const config = statusConfig[effectiveStatus];
                        const isSelected = tableNumber === table.table_number;
                        
                        return (
                          <button
                            key={table.id}
                            onClick={() => {
                              setTableNumber(table.table_number);
                              useCartStore.getState().setTableNumber(table.table_number);
                            }}
                            className={`
                              relative p-3 rounded-lg border-2 transition-all
                              ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                              ${config.bg} ${config.border} ${config.text}
                              hover:opacity-80 active:scale-95
                            `}
                            title={`${table.table_number} - ${config.label}`}
                          >
                            <div className="text-sm font-bold">{table.table_number}</div>
                            <div className="text-xs mt-1">{config.label}</div>
                            {table.hasActiveOrders && effectiveStatus !== 'occupied' && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" title="Has active orders" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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
                <div 
                  className={`product-grid ${settings?.card_view === 'list' ? 'flex flex-col' : settings?.card_view === 'minimalist' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}
                  style={{ gap: `var(--layout-spacing)` }}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      modifiers={getProductModifiers(product)}
                      stockCount={productStocks.get(product.id)}
                      cardView={(settings?.card_view as 'grid' | 'list' | 'minimalist') || 'grid'}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Cart Panel (desktop) */}
        <aside 
          className={`cart-container ${settings?.cart_position === 'floating-drawer' ? 'fixed bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] border-t border-line bg-surface z-50 rounded-t-lg max-h-[50vh] overflow-y-auto' : 'hidden w-96 lg:block'}`}
          aria-label="Keranjang"
        >
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

      {/* Product List Modal */}
      <ProductListModal
        isOpen={productListModalOpen}
        onClose={() => setProductListModalOpen(false)}
        products={products}
        productStocks={productStocks}
        onStockUpdate={handleRecalculateStock}
        userRole={userRole}
        categories={productCategories}
      />

      {/* Payment Modal */}
      {selectedOrderForPayment && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedOrderForPayment(null);
          }}
          order={selectedOrderForPayment}
          onPaymentComplete={handlePaymentComplete}
          onSplitBillComplete={handleSplitBillComplete}
        />
      )}

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

      {/* Delete History Confirmation Modal */}
      {deleteHistoryConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Hapus Riwayat Transaksi</h3>
              <button
                onClick={() => setDeleteHistoryConfirmOpen(false)}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 rounded-lg border border-gray-200"
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
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 hover:text-gray-900 active:bg-gray-400 border border-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteHistory}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 hover:text-white"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {deleteOrderConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Hapus Pesanan</h3>
              <button
                onClick={() => setDeleteOrderConfirmOpen(false)}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 rounded-lg border border-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus pesanan meja {orderToDelete?.table_number || '-'}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteOrderConfirmOpen(false);
                  setOrderToDelete(null);
                }}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 hover:text-gray-900 active:bg-gray-400 border border-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteOrder}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 hover:text-white"
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

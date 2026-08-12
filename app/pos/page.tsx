'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePageHeader } from '@/src/context/PageHeaderContext';
import { ProductCard } from '@/src/features/pos/components/ProductCard';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { useCartStore } from '@/src/store/useCartStore';
import { useOutletStore } from '@/src/features/outlet/outletStore';
import { PaymentModal } from '@/src/components/pos/PaymentModal';
import { VoidPaymentModal } from '@/src/components/ui/VoidPaymentModal';
import { checkStockAvailability, deductStockForSale } from '@/src/features/inventory/recipeApiService';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { useTables } from '@/src/hooks/useTables';
import { useSyncManager } from '@/src/hooks/useSyncManager';
import { ModifierOption, UIModifierGroup } from '@/src/features/pos/components/ModifierModal';
import { ProductListModal } from '@/src/features/pos/components/ProductListModal';
import { CartPanel } from '@/src/features/pos/components/CartPanel';
import { TableMergeModal } from '@/src/components/layout/TableMergeModal';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/src/components/ui/Skeleton';
import { useGlobalHotkey } from '@/src/hooks/useGlobalHotkey';
import { useMnemonic } from '@/src/hooks/useMnemonic';
import { Menu } from '@base-ui/react/menu';
import { ShoppingCart, Search, RefreshCw, AlertCircle, X, Utensils, History, Printer, Trash2, Loader2, CreditCard, Users, DollarSign } from 'lucide-react';
import { ReceiptModal } from '@/src/components/pos/ReceiptModal';
import { calculateMenuStocks, seedSampleInventoryData, forceReseedInventoryData, canOrderProduct } from '@/src/features/inventory/inventoryService';
import { useTheme } from '@/src/context/ThemeContext';
import { PERMISSIONS } from '@/src/config/permissions';

export default function POSPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, can } = useAuth();
  const { toast } = useToast();
  const { selectedOutletId } = useOutletStore();
  const { settings } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [showTableMergeModal, setShowTableMergeModal] = useState(false);
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
  const [pettyCashModalOpen, setPettyCashModalOpen] = useState(false);
  const [pettyCashAmount, setPettyCashAmount] = useState('');
  const [pettyCashReason, setPettyCashReason] = useState('');
  const [pettyCashError, setPettyCashError] = useState('');
  const [orderCategory, setOrderCategory] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
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
      router.replace('/login?redirect=/pos');
    }
  }, [authLoading, user, router]);

  const cartItemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  // Fetch data from the local API with offline support
  const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { categories } = useCategories();
  const { updateTableStatus, refetch: refetchTables } = useTables();

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
      // Seed sample inventory data if needed
      seedSampleInventoryData().catch(error => {
        console.error('❌ Failed to seed inventory data:', error);
      });

      const productIds = products.map(p => p.id);
      calculateMenuStocks(productIds).then(stockMap => {
        setProductStocks(stockMap);
      }).catch(error => {
        console.error('❌ Failed to calculate product stocks:', error);
      });
    }
  }, [products]);

  // Listen for inventory stock changes and recalculate menu stock automatically
  useEffect(() => {
    const handleInventoryStockChanged = () => {
      console.log('📡 Received inventoryStockChanged event, recalculating menu stock...');
      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        calculateMenuStocks(productIds).then(stockMap => {
          setProductStocks(stockMap);
        }).catch(error => {
          console.error('❌ Failed to recalculate stock after inventory change:', error);
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('inventoryStockChanged', handleInventoryStockChanged);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('inventoryStockChanged', handleInventoryStockChanged);
      }
    };
  }, [products]);

  // Recalculate stock when outlet changes to ensure real-time data
  useEffect(() => {
    if (selectedOutletId && products && products.length > 0) {
      const productIds = products.map(p => p.id);
      calculateMenuStocks(productIds).then(stockMap => {
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
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orderCompleted', handleOrderCompleted);
        window.removeEventListener('orderCreated', handleOrderCreated);
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

  const handleOpenProductListModal = () => {
    setProductListModalOpen(true);
  };

  // Standalone global hotkey (independent of the Alt-mnemonic system): F9 is a
  // common "quick lookup" key in POS hardware/software, doesn't need Alt held.
  useGlobalHotkey('F9', handleOpenProductListModal);

  // Alt+G hotkey for table merge (only when table orders view is shown)
  useMnemonic('G', () => setShowTableMergeModal(true), !showTableOrders);

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
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('orderReady', handleOrderReady as EventListener);
        window.removeEventListener('orderCreated', handleOrderCreated);
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

  const handlePettyCashSubmit = async () => {
    setPettyCashError('');
    const amount = parseFloat(pettyCashAmount);
    if (isNaN(amount) || amount <= 0) {
      setPettyCashError('Masukkan jumlah yang valid');
      return;
    }
    if (!pettyCashReason.trim()) {
      setPettyCashError('Masukkan keterangan pengeluaran');
      return;
    }

    try {
      const { getToken } = await import('@/src/lib/api');
      const { API_BASE_URL } = await import('@/src/config/runtime');
      const token = getToken();

      await fetch(`${API_BASE_URL}/api/petty-cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amount,
          description: pettyCashReason,
          category: 'operational',
        }),
      });

      toast('success', 'Pengeluaran petty cash berhasil dicatat');
      setPettyCashAmount('');
      setPettyCashReason('');
      setPettyCashModalOpen(false);
    } catch (error) {
      console.error('Failed to create petty cash expense:', error);
      toast('error', 'Gagal mencatat pengeluaran petty cash');
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

      // Check stock availability for all items in the order
      const stockChecks = await Promise.all(
        order.items?.map(async (item: any) => {
          const check = await checkStockAvailability(item.product_id, item.quantity);
          return {
            productName: item.product?.name || 'Unknown',
            ...check,
          };
        }) || []
      );

      const insufficientStockItems = stockChecks.filter(check => !check.available);
      
      if (insufficientStockItems.length > 0) {
        const errorMessages = insufficientStockItems.map(item => {
          const ingredients = item.insufficientIngredients.map((ing: { name: string; required: number; available: number; unit: string }) =>
            `${ing.name} (butuh: ${ing.required}, tersedia: ${ing.available} ${ing.unit})`
          ).join(', ');
          return `${item.productName}: ${ingredients}`;
        }).join('\n');
        
        toast('error', 'Stok tidak mencukupi:\n' + errorMessages);
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

      // Deduct stock for each item in the order
      const stockDeductions = await Promise.all(
        order.items?.map(async (item: any) => {
          const result = await deductStockForSale(item.product_id, item.quantity);
          return {
            productName: item.product?.name || 'Unknown',
            ...result,
          };
        }) || []
      );

      const failedDeductions = stockDeductions.filter(d => !d.success);
      if (failedDeductions.length > 0) {
        console.error('Some stock deductions failed:', failedDeductions);
        toast('warning', 'Pembayaran berhasil, tapi beberapa stok gagal dikurangi');
      } else {
        console.log('All stock deductions successful');
      }

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
    if (!can(PERMISSIONS.orders.void)) {
      toast('error', 'Anda tidak memiliki izin untuk void pembayaran');
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
      toast('error', 'Gagal membersihkan cache');
    }
  };

  // Sync menu actions for header
  const syncMenuActions = (
    <>
      {lastSyncTime && (
        <div className="px-3 py-2 text-xs text-ink-muted">
          Terakhir sync: {new Date(lastSyncTime).toLocaleTimeString('id-ID')}
        </div>
      )}
      <Menu.Item
        onClick={triggerManualSync}
        disabled={syncInProgress || !isOnline}
        className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none hover:bg-surface-alt focus:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw className={`size-4 ${syncInProgress ? 'animate-spin' : ''}`} aria-hidden="true" />
        Sinkronkan Sekarang
      </Menu.Item>
      <Menu.Item
        onClick={handleRecalculateStock}
        className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none hover:bg-surface-alt focus:bg-surface-alt"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Sync Stok
      </Menu.Item>
      <Menu.Item
        onClick={handleOpenProductListModal}
        className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium outline-none hover:bg-surface-alt focus:bg-surface-alt"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Sync Product List
      </Menu.Item>
      <Menu.Separator className="my-1 h-px bg-line" />
      <Menu.Item
        onClick={handleClearCache}
        className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium text-warning outline-none hover:bg-warning-soft focus:bg-warning-soft"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Clear Cache & Reload
      </Menu.Item>
    </>
  );

  usePageHeader({ title: 'POS Utama', actions: syncMenuActions });

  // Filter products (sorted alphabetically by name for a stable, predictable order)
  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, selectedCategory, searchQuery]);

  return (
    <div 
      className="flex h-full w-full flex-col overflow-hidden bg-background"
      data-card-view={settings?.card_view || 'grid'}
      data-cart-position={settings?.cart_position || 'right-sidebar'}
    >
      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Product Grid */}
        <main className="flex min-h-0 w-full flex-col overflow-hidden p-4 sm:p-6 lg:w-[70%]">
          {/* Tab Toggle */}
          <div className="mb-6 flex shrink-0 items-center gap-2 border-b border-line">
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
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-ink">Pesanan Meja</h2>
                  <p className="text-sm text-ink-muted">Menampilkan {tableOrders.length} pesanan siap bayar</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTableMergeModal(true)}
                  aria-label="Gabung meja"
                  aria-keyshortcuts="Alt+G"
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  <Users className="size-4" aria-hidden="true" />
                  <span>Gabung Meja</span>
                  <kbd className="ml-auto rounded border border-line bg-surface-alt px-1.5 py-0.5 text-xs text-ink-muted">Alt+G</kbd>
                </button>
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
            </div>
          ) : showTransactionHistory ? (
            /* Transaction History View */
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-ink">Riwayat Transaksi</h2>
                  <p className="text-sm text-ink-muted">Menampilkan {transactionHistory.length} transaksi terakhir</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPettyCashModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 font-medium text-ink-muted hover:text-ink transition-colors"
                  >
                    <DollarSign className="h-4 w-4" />
                    Kas Keluar
                  </button>
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
                        {(order.status === 'completed' || order.status === 'paid') && can(PERMISSIONS.orders.void) && order.payment_method && (
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
            </div>
          ) : (
            /* Products View */
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {/* Search */}
              <div className="mb-4 shrink-0">
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

              {/* Category Chips */}
              <div className="mb-4 shrink-0 overflow-x-auto pb-2">
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

              {/* Product Grid (scrolls internally; header controls above stay fixed) */}
              <div className="min-h-0 flex-1 overflow-y-auto">
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
              </div>
            </div>
          )}
        </main>

        {/* Cart Panel (desktop) */}
        <aside 
          className={`cart-container min-h-0 ${settings?.cart_position === 'floating-drawer' ? 'fixed bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] border-t border-line bg-surface z-50 rounded-t-lg max-h-[50vh] overflow-y-auto' : 'hidden lg:flex lg:w-[30%]'}`}
          aria-label="Keranjang"
        >
          <CartPanel
            orderCategory={orderCategory}
            onOrderCategoryChange={setOrderCategory}
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
              onOrderCategoryChange={setOrderCategory}
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
        canEditStock={can(PERMISSIONS.inventory.edit)}
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

      {/* Petty Cash Modal */}
      {pettyCashModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Kas Keluar / Petty Cash
              </h3>
              <button
                onClick={() => {
                  setPettyCashModalOpen(false);
                  setPettyCashAmount('');
                  setPettyCashReason('');
                  setPettyCashError('');
                }}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 rounded-lg border border-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="pettyCashAmount" className="mb-2 block text-sm font-medium text-gray-700">
                  Jumlah (Rp)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="pettyCashAmount"
                    type="number"
                    value={pettyCashAmount}
                    onChange={(e) => setPettyCashAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 pl-10 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="pettyCashReason" className="mb-2 block text-sm font-medium text-gray-700">
                  Keterangan Pengeluaran
                </label>
                <input
                  id="pettyCashReason"
                  type="text"
                  value={pettyCashReason}
                  onChange={(e) => setPettyCashReason(e.target.value)}
                  placeholder="Contoh: Beli plastik, Uang kembalian, dll."
                  className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none"
                />
              </div>
              {pettyCashError && (
                <p role="alert" className="text-sm text-red-600">{pettyCashError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setPettyCashModalOpen(false);
                    setPettyCashAmount('');
                    setPettyCashReason('');
                    setPettyCashError('');
                  }}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 hover:text-gray-900 active:bg-gray-400 border border-gray-300"
                >
                  Batal
                </button>
                <button
                  onClick={handlePettyCashSubmit}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 active:bg-green-800 border border-green-700"
                >
                  Catat Pengeluaran
                </button>
              </div>
            </div>
          </div>
        </div>
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

      {/* Table Merge Modal */}
      <TableMergeModal isOpen={showTableMergeModal} onClose={() => setShowTableMergeModal(false)} />
    </div>
  );
}

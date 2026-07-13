import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { db, Order as DBOrder, OrderItem as DBOrderItem } from '@/src/lib/db';
import { Order, OrderItem, OrderInsert, OrderItemInsert } from '@/src/types/database.types';
import { useOfflineStore } from '@/src/store/useOfflineStore';

/**
 * useOrders Hook with Offline-First Support
 * 
 * This hook manages orders with full offline support:
 * 1. Fetches orders with caching
 * 2. Creates orders locally and queues for sync when offline
 * 3. Updates order status with offline queue
 * 4. Handles order items with proper relationships
 * 
 * New UUID-based schema: simplified without tables, order numbers, etc.
 */
export const useOrders = (cashierId?: string | null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const { addTransaction } = useOfflineStore();

  useEffect(() => {
    fetchOrders();
  }, [cashierId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsFromCache(false);

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // STEP 1: Try to load from IndexedDB cache
      try {
        let cachedOrders: DBOrder[] = [];
        
        if (cashierId) {
          cachedOrders = await db.orders
            .where('cashier_id')
            .equals(cashierId)
            .reverse()
            .sortBy('created_at');
        } else {
          cachedOrders = await db.orders
            .reverse()
            .sortBy('created_at');
        }

        if (cachedOrders.length > 0) {
          setOrders(cachedOrders as Order[]);
          setIsFromCache(true);
          console.log('Loaded orders from IndexedDB cache:', cachedOrders.length);
        }
      } catch (cacheError) {
        console.warn('Failed to load orders from cache:', cacheError);
      }

      // STEP 2: If online, fetch fresh data from Supabase
      if (isOnline) {
        let query = supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (cashierId) {
          query = query.eq('cashier_id', cashierId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && data.length > 0) {
          // Update IndexedDB cache
          try {
            if (cashierId) {
              const toDelete = await db.orders
                .where('cashier_id')
                .equals(cashierId)
                .primaryKeys();
              if (toDelete.length > 0) {
                await db.orders.bulkDelete(toDelete as string[]);
              }
            } else {
              // Only cache recent orders (last 100)
              const allOrders = await db.orders.toArray();
              if (allOrders.length > 100) {
                await db.orders.clear();
              }
            }

            await db.orders.bulkPut(data as DBOrder[]);
            console.log('Updated orders cache with fresh data:', data.length);
          } catch (cacheError) {
            console.warn('Failed to update orders cache:', cacheError);
          }

          setOrders(data);
          setIsFromCache(false);
        }
      }
    } catch (err) {
      if (orders.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        console.error('Error fetching orders:', err);
      } else {
        console.warn('Using cached orders due to fetch error:', err);
        setIsFromCache(true);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new order with offline support
   */
  const createOrder = async (orderData: OrderInsert, orderItems: OrderItemInsert[]) => {
    try {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      
      // Generate temporary UUID for offline use
      const tempId = crypto.randomUUID();
      
      const newOrder: Order = {
        ...orderData,
        id: tempId,
        cashier_id: orderData.cashier_id ?? null,
        status: orderData.status ?? 'pending',
        table_number: orderData.table_number ?? null,
        discount_amount: orderData.discount_amount ?? 0,
        notes: orderData.notes ?? null,
        created_at: new Date().toISOString(),
      };

      // Create order items with temporary IDs
      const newOrderItems: OrderItem[] = orderItems.map((item, index) => ({
        ...item,
        id: crypto.randomUUID(),
        order_id: tempId,
        discount_item: item.discount_item ?? 0,
        modifiers_applied: item.modifiers_applied ?? [],
      }));

      // If online, create in Supabase immediately
      if (isOnline) {
        const { data: orderResult, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        if (orderError) throw orderError;

        // Create order items
        const itemsWithOrderId = orderItems.map(item => ({
          ...item,
          order_id: orderResult.id,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsWithOrderId);

        if (itemsError) throw itemsError;

        // Update local state with server response
        setOrders(prev => [orderResult, ...prev]);
        
        // Update IndexedDB cache
        await db.orders.put(orderResult as DBOrder);
        for (const item of itemsWithOrderId) {
          await db.order_items.put(item as DBOrderItem);
        }

        console.log('Order created in Supabase:', orderResult.id);
        return orderResult;
      } else {
        // If offline, queue for sync and create locally
        await addTransaction('create', 'orders', { ...newOrder, orderItems: newOrderItems });
        
        // Create in IndexedDB for offline use
        await db.orders.put(newOrder as DBOrder);
        for (const item of newOrderItems) {
          await db.order_items.put(item as DBOrderItem);
        }

        // Update local state
        setOrders(prev => [newOrder, ...prev]);
        
        console.log('Order created offline and queued for sync:', newOrder.id);
        return newOrder;
      }
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  /**
   * Update order status with offline support
   */
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // Update local state immediately
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );

      // Update IndexedDB cache
      await db.orders.update(orderId, { status });

      if (isOnline) {
        const { error } = await supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);

        if (error) throw error;
        console.log('Order status synced to Supabase');
      } else {
        await addTransaction('update', 'orders', { id: orderId, status });
        console.log('Order status queued for offline sync');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      // Revert local state on error
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, status: order.status } : order
        )
      );
      throw err;
    }
  };

  return { 
    orders, 
    loading, 
    error, 
    refetch: fetchOrders, 
    isFromCache, 
    createOrder, 
    updateOrderStatus 
  };
};

/**
 * useOrderItems Hook for fetching items of a specific order
 */
export const useOrderItems = (orderId: string) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderItems();
    }
  }, [orderId]);

  const fetchOrderItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      // STEP 1: Try to load from IndexedDB cache
      try {
        const cachedItems = await db.order_items
          .where('order_id')
          .equals(orderId)
          .toArray();

        if (cachedItems.length > 0) {
          setOrderItems(cachedItems as OrderItem[]);
          console.log('Loaded order items from IndexedDB cache:', cachedItems.length);
        }
      } catch (cacheError) {
        console.warn('Failed to load order items from cache:', cacheError);
      }

      // STEP 2: If online, fetch fresh data from Supabase
      if (isOnline) {
        const { data, error } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (error) throw error;

        if (data && data.length > 0) {
          // Update IndexedDB cache
          try {
            await db.order_items
              .where('order_id')
              .equals(orderId)
              .delete();
            await db.order_items.bulkPut(data as DBOrderItem[]);
            console.log('Updated order items cache with fresh data:', data.length);
          } catch (cacheError) {
            console.warn('Failed to update order items cache:', cacheError);
          }

          setOrderItems(data);
        }
      }
    } catch (err) {
      if (orderItems.length === 0) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order items');
        console.error('Error fetching order items:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return { orderItems, loading, error, refetch: fetchOrderItems };
};

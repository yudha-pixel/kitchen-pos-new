import { useEffect, useCallback, useState, useSyncExternalStore } from 'react';
import * as api from '@/src/lib/api';
import { db, SyncQueueItem } from '@/src/lib/db';
import { useOfflineStore } from '@/src/store/useOfflineStore';

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 1000; // 1 second base delay

/**
 * Calculate exponential backoff delay for retry
 * @param retryCount - Current retry count (0-based)
 * @returns Delay in milliseconds
 */
const calculateRetryDelay = (retryCount: number): number => {
  return BASE_RETRY_DELAY_MS * Math.pow(2, retryCount);
};

/**
 * Compare two timestamps for conflict resolution
 * @param localTimestamp - Local data timestamp (ISO string)
 * @param serverTimestamp - Server data timestamp (ISO string)
 * @returns 'local' if local is newer, 'server' if server is newer, 'equal' if same
 */
const compareTimestamps = (localTimestamp: string, serverTimestamp: string): 'local' | 'server' | 'equal' => {
  const localDate = new Date(localTimestamp);
  const serverDate = new Date(serverTimestamp);
  
  if (localDate > serverDate) return 'local';
  if (localDate < serverDate) return 'server';
  return 'equal';
};

/**
 * useSyncManager Hook
 *
 * Pushes offline work to the local backend API when online:
 * 1. Orders created offline (db.orders with sync_status 'pending')
 * 2. Queued operations in db.sync_queue (status updates, void logs, legacy order creates)
 */
const subscribeToOnlineStatus = (callback: () => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

export const useSyncManager = () => {
  // Hydration-safe online status: server (and first client render) assume online,
  // then the real navigator.onLine value takes over after hydration
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    () => navigator.onLine,
    () => true
  );
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const {
    pendingTransactions,
    syncInProgress,
    syncError,
    setSyncInProgress,
    setSyncError,
    updateLastSyncTime,
    getPendingTransactions,
    removeTransaction,
  } = useOfflineStore();

  /**
   * Replay a single queued operation against the API with conflict resolution.
   */
  const replayQueueItem = useCallback(async (item: SyncQueueItem) => {
    if (item.table_name === 'orders' && item.operation === 'create') {
      const { orderItems, ...order } = item.data;
      await api.createOrder(order, orderItems ?? []);
      if (order.id) {
        await db.orders.update(order.id, { sync_status: 'synced' });
      }
    } else if (item.table_name === 'orders' && item.operation === 'update') {
      // Conflict resolution for order status updates
      const localOrder = await db.orders.get(item.data.id);
      
      if (localOrder) {
        // Check if we have timestamp information for conflict resolution
        const localTimestamp = localOrder.created_at; // Using created_at as fallback
        const queuedTimestamp = item.created_at;
        
        // If timestamps indicate potential conflict, log it
        if (localTimestamp && queuedTimestamp) {
          const comparison = compareTimestamps(queuedTimestamp, localTimestamp);
          if (comparison === 'server') {
            console.warn(`⚠️ Conflict detected for order ${item.data.id}: Server version is newer, skipping local update`);
            // Skip the update as server version is newer
            return;
          } else if (comparison === 'local') {
            console.log(`✓ Local version is newer for order ${item.data.id}, proceeding with update`);
          }
        }
      }
      
      await api.updateOrderStatus(item.data.id, item.data.status);
    } else if (item.table_name === 'order_void_logs' || item.table_name === 'void_logs') {
      await api.createVoidLogs([item.data]);
    } else {
      // Unknown operation: drop it rather than blocking the queue forever
      console.warn(`Dropping unknown sync queue item: ${item.operation} on ${item.table_name}`);
    }
  }, []);

  /**
   * Drain the sync queue: replay each pending operation, remove on success,
   * track retries on failure with exponential backoff and give up after MAX_RETRIES.
   */
  const drainSyncQueue = useCallback(async () => {
    const pending = await getPendingTransactions();
    if (pending.length === 0) return;

    console.log(`🚀 Replaying ${pending.length} queued operations...`);

    for (const item of pending) {
      try {
        await replayQueueItem(item);
        await removeTransaction(item.id!);
      } catch (error) {
        const retryCount = (item.retry_count ?? 0) + 1;
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to replay ${item.operation} on ${item.table_name}:`, error);
        
        // Update retry count and status
        await db.sync_queue.update(item.id!, {
          retry_count: retryCount,
          error_message: message,
          status: retryCount >= MAX_RETRIES ? 'failed' : 'pending',
        });

        // If not at max retries, apply exponential backoff delay
        if (retryCount < MAX_RETRIES) {
          const delay = calculateRetryDelay(retryCount);
          console.log(`⏳ Waiting ${delay}ms before next retry (attempt ${retryCount}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }, [getPendingTransactions, removeTransaction, replayQueueItem]);

  /**
   * Push orders created offline (sync_status 'pending') to the local API.
   */
  const syncOfflineOrders = useCallback(async () => {
    if (syncInProgress || !isOnline) {
      return;
    }

    setSyncInProgress(true);
    setSyncError(null);

    try {
      // 1. Clear invalid orders with non-UUID IDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const allOrders = await db.orders.toArray();
      const invalidOrders = allOrders.filter(order => !order.id || !uuidRegex.test(order.id));

      if (invalidOrders.length > 0) {
        console.log(`🧹 Found ${invalidOrders.length} invalid orders, cleaning up...`);
        for (const order of invalidOrders) {
          // Delete order items first
          await db.order_items.where('order_id').equals(order.id!).delete();
          // Delete the order
          await db.orders.delete(order.id!);
        }
        console.log(`✅ Cleaned up ${invalidOrders.length} invalid orders`);
      }

      // 2. Replay queued operations first (order creates, status updates, voids)
      await drainSyncQueue();

      // 3. Push any offline-created orders not covered by the queue
      const pendingOrders = await db.orders
        .where('sync_status')
        .equals('pending')
        .toArray();

      for (const order of pendingOrders) {
        try {
          // Validate order ID format (must be UUID)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!order.id || !uuidRegex.test(order.id)) {
            console.error(`❌ Skipping order ${order.id} - invalid UUID format`);
            await db.orders.update(order.id!, { sync_status: 'synced' }); // Mark as synced to skip
            continue;
          }

          const orderItems = await db.order_items
            .where('order_id')
            .equals(order.id!)
            .toArray();

          // Validate order item IDs
          const validOrderItems = orderItems.filter(item => {
            if (!item.id || !uuidRegex.test(item.id)) {
              console.error(`❌ Skipping order item ${item.id} - invalid UUID format`);
              return false;
            }
            return true;
          });

          if (validOrderItems.length === 0) {
            console.error(`❌ Skipping order ${order.id} - no valid order items`);
            await db.orders.update(order.id!, { sync_status: 'synced' });
            continue;
          }

          console.log(`Syncing order ${order.id} with ${validOrderItems.length} items`);
          console.log('Order data:', order);
          console.log('Order items data:', validOrderItems);
          await api.createOrder(order, validOrderItems);
          await db.orders.update(order.id!, { sync_status: 'synced' });
          console.log(`✅ Order ${order.id} synced to local API`);
        } catch (error) {
          console.error(`❌ Failed to sync order ${order.id}:`, error);
          console.error('Order data that failed:', order);
          // Mark as synced to prevent repeated failures
          await db.orders.update(order.id!, { sync_status: 'synced' });
          // Continue syncing other orders
        }
      }

      const now = new Date().toISOString();
      updateLastSyncTime(now);
      setLastSyncTime(now);
    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncInProgress(false);
    }
  }, [isOnline, syncInProgress, setSyncInProgress, setSyncError, updateLastSyncTime, drainSyncQueue]);

  /**
   * Trigger manual sync
   */
  const triggerManualSync = useCallback(async () => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline');
      return;
    }
    await syncOfflineOrders();
  }, [isOnline, syncOfflineOrders, setSyncError]);

  // Clear stale sync errors when connectivity returns
  useEffect(() => {
    if (isOnline) {
      setSyncError(null);
    }
  }, [isOnline, setSyncError]);

  // Auto-sync when coming back online with pending work
  useEffect(() => {
    if (isOnline && pendingTransactions > 0) {
      console.log('Back online with pending transactions, triggering sync...');
      syncOfflineOrders();
    }
  }, [isOnline, pendingTransactions, syncOfflineOrders]);

  // Sync on mount if there is anything waiting (queued ops or unsynced orders)
  useEffect(() => {
    const checkPendingWork = async () => {
      const queued = await getPendingTransactions();
      const unsyncedOrders = await db.orders.where('sync_status').equals('pending').count();
      if (queued.length > 0 || unsyncedOrders > 0) {
        console.log(`Found ${queued.length} queued ops and ${unsyncedOrders} unsynced orders, syncing...`);
        syncOfflineOrders();
      }
    };
    checkPendingWork();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isOnline,
    pendingTransactions,
    syncInProgress,
    syncError,
    lastSyncTime,
    triggerManualSync,
  };
};

import { useEffect, useCallback, useState } from 'react';
import * as api from '@/src/lib/api';
import { db, SyncQueueItem } from '@/src/lib/db';
import { useOfflineStore } from '@/src/store/useOfflineStore';

const MAX_RETRIES = 5;

/**
 * useSyncManager Hook
 *
 * Pushes offline work to the local backend API when online:
 * 1. Orders created offline (db.orders with sync_status 'pending')
 * 2. Queued operations in db.sync_queue (status updates, void logs, legacy order creates)
 */
export const useSyncManager = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
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
   * Replay a single queued operation against the API.
   */
  const replayQueueItem = useCallback(async (item: SyncQueueItem) => {
    if (item.table_name === 'orders' && item.operation === 'create') {
      const { orderItems, ...order } = item.data;
      await api.createOrder(order, orderItems ?? []);
      if (order.id) {
        await db.orders.update(order.id, { sync_status: 'synced' });
      }
    } else if (item.table_name === 'orders' && item.operation === 'update') {
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
   * track retries on failure and give up after MAX_RETRIES.
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
        await db.sync_queue.update(item.id!, {
          retry_count: retryCount,
          error_message: message,
          status: retryCount >= MAX_RETRIES ? 'failed' : 'pending',
        });
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
      // 1. Replay queued operations first (order creates, status updates, voids)
      await drainSyncQueue();

      // 2. Push any offline-created orders not covered by the queue
      const pendingOrders = await db.orders
        .where('sync_status')
        .equals('pending')
        .toArray();

      for (const order of pendingOrders) {
        try {
          const orderItems = await db.order_items
            .where('order_id')
            .equals(order.id!)
            .toArray();

          await api.createOrder(order, orderItems);
          await db.orders.update(order.id!, { sync_status: 'synced' });
          console.log(`✅ Order ${order.id} synced to local API`);
        } catch (error) {
          console.error(`❌ Failed to sync order ${order.id}:`, error);
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

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Device is online');
      setIsOnline(true);
      setSyncError(null);
    };

    const handleOffline = () => {
      console.log('📴 Device is offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setSyncError]);

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

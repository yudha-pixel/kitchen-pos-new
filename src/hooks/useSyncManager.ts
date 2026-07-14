import { useEffect, useCallback, useState } from 'react';
import * as api from '@/src/lib/api';
import { db } from '@/src/lib/db';
import { useOfflineStore } from '@/src/store/useOfflineStore';

/**
 * useSyncManager Hook
 * 
 * Syncs pending orders from IndexedDB to the local backend API when online.
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
  } = useOfflineStore();

  /**
   * Sync pending orders from IndexedDB to the local API
   */
  const syncOfflineOrders = useCallback(async () => {
    if (syncInProgress || !isOnline) {
      return;
    }

    setSyncInProgress(true);
    setSyncError(null);

    try {
      // 1. Get pending orders from IndexedDB
      const pendingOrders = await db.orders
        .where('status')
        .equals('pending')
        .toArray();

      if (pendingOrders.length === 0) {
        console.log('No pending orders to sync');
        setSyncInProgress(false);
        return;
      }

      console.log(`🚀 Syncing ${pendingOrders.length} pending orders to local API...`);

      for (const order of pendingOrders) {
        try {
          console.log(`📦 Processing order ${order.id}...`);

          // 2. Get order items from IndexedDB
          const orderItems = await db.order_items
            .where('order_id')
            .equals(order.id!)
            .toArray();

          // 3. Send to local API
          console.log(`📤 Inserting order ${order.id} to local API...`);
          await api.createOrder(order, orderItems);
          console.log(`✅ Order ${order.id} inserted successfully to local API`);
          
          // 4. Update status in IndexedDB
          await db.orders.update(order.id!, { status: 'synced' });
          console.log(`✅ Updated order ${order.id} status to 'synced' in IndexedDB`);
        } catch (error) {
          console.error(`❌ Failed to sync order ${order.id}:`, error);
          // Continue syncing other orders
        }
      }

      // Update last sync time
      const now = new Date().toISOString();
      updateLastSyncTime(now);
      setLastSyncTime(now);
      console.log('🎉 Sync completed at', now);
    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncInProgress(false);
    }
  }, [isOnline, syncInProgress, setSyncInProgress, setSyncError, updateLastSyncTime]);

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

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingTransactions > 0) {
      console.log('Back online with pending transactions, triggering sync...');
      syncOfflineOrders();
    }
  }, [isOnline, pendingTransactions, syncOfflineOrders]);

  // Sync pending transactions from sync_queue if any (legacy fallback)
  useEffect(() => {
    const checkLegacyQueue = async () => {
      const pending = await getPendingTransactions();
      if (pending.length > 0) {
        console.log(`Found ${pending.length} legacy sync queue items, will attempt sync`);
        syncOfflineOrders();
      }
    };
    checkLegacyQueue();
  }, [getPendingTransactions, syncOfflineOrders]);

  return {
    isOnline,
    pendingTransactions,
    syncInProgress,
    syncError,
    lastSyncTime,
    triggerManualSync,
  };
};

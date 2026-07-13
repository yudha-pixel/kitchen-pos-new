import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/src/lib/supabaseClient';
import { db } from '@/src/lib/db';

/**
 * Sync Manager Hook
 * 
 * This hook manages offline-first synchronization:
 * 1. Detects online/offline status changes
 * 2. Automatically syncs pending orders when online
 * 3. Provides sync status to the UI
 */
export const useSyncManager = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  /**
   * Sync pending orders from IndexedDB to Supabase
   */
  const syncOfflineOrders = useCallback(async () => {
    if (syncInProgress || !isOnline) {
      console.log('⏸️ Sync skipped: in progress or offline');
      return;
    }

    console.log('🔄 Starting sync process...');
    setSyncInProgress(true);
    setSyncError(null);

    try {
      // 1. Cek apakah ada data di IndexedDB (Dexie) dengan status 'pending'
      console.log('📥 Fetching pending orders from IndexedDB...');
      const pendingOrders = await db.orders.where('status').equals('pending').toArray();
      console.log(`📊 Found ${pendingOrders.length} pending orders in IndexedDB`);

      if (pendingOrders.length === 0) {
        console.log('✅ No pending orders to sync');
        setLastSyncTime(new Date().toISOString());
        return;
      }

      console.log(`🚀 Syncing ${pendingOrders.length} pending orders to Supabase...`);

      for (const order of pendingOrders) {
        try {
          console.log(`📦 Processing order ${order.id}...`);
          
          // 2. Cek apakah order sudah ada di Supabase (idempotency check)
          console.log(`🔍 Checking if order ${order.id} exists in Supabase...`);
          const { data: existingOrder, error: checkError } = await supabase
            .from('orders')
            .select('id')
            .eq('id', order.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 = not found, which is expected for new orders
            console.log(`❌ Error checking order existence: ${checkError.message}`);
            throw checkError;
          }

          if (existingOrder) {
            // Order sudah ada, skip insert tapi update status di IndexedDB
            console.log(`⚠️ Order ${order.id} already exists in Supabase, skipping insert`);
            await db.orders.update(order.id!, { status: 'synced' });
            console.log(`✅ Updated order ${order.id} status to 'synced' in IndexedDB`);
            continue;
          }

          console.log(`✨ Order ${order.id} not found in Supabase, proceeding with insert...`);
          
          // 3. Kirim ke Supabase (hanya jika belum ada)
          console.log(`📤 Inserting order ${order.id} to Supabase...`);
          const { error: insertError } = await supabase.from('orders').insert({
            id: order.id,
            cashier_id: order.cashier_id,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            status: order.status,
            table_number: order.table_number,
            discount_amount: order.discount_amount,
            rounding_amount: order.rounding_amount,
            notes: order.notes,
            created_at: order.created_at,
          });
          
          if (!insertError) {
            console.log(`✅ Order ${order.id} inserted successfully to Supabase`);
            
            // 4. Sync order items dengan idempotency check
            console.log(`📥 Fetching order items for order ${order.id} from IndexedDB...`);
            const orderItems = await db.order_items.where('order_id').equals(order.id!).toArray();
            console.log(`📊 Found ${orderItems.length} order items to sync`);
            
            for (const item of orderItems) {
              console.log(`📦 Processing order item ${item.id}...`);
              const { data: existingItem, error: itemCheckError } = await supabase
                .from('order_items')
                .select('id')
                .eq('id', item.id)
                .single();

              if (itemCheckError && itemCheckError.code !== 'PGRST116') {
                console.log(`❌ Error checking item existence: ${itemCheckError.message}`);
                throw itemCheckError;
              }

              if (!existingItem) {
                // Item belum ada, insert ke Supabase
                console.log(`📤 Inserting order item ${item.id} to Supabase...`);
                const { error: itemInsertError } = await supabase.from('order_items').insert({
                  id: item.id,
                  order_id: item.order_id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                  price_at_time: item.price_at_time,
                  discount_item: item.discount_item,
                  modifiers_applied: item.modifiers_applied,
                  split_group_id: item.split_group_id,
                });

                if (itemInsertError) {
                  console.log(`❌ Error inserting item: ${itemInsertError.message}`);
                  throw itemInsertError;
                }
                console.log(`✅ Order item ${item.id} inserted successfully`);
              } else {
                console.log(`⚠️ Order item ${item.id} already exists, skipping`);
              }
            }

            // 5. Sync void logs dengan idempotency check
            console.log(`📥 Fetching void logs for order ${order.id} from IndexedDB...`);
            const voidLogs = await db.order_void_logs.where('order_id').equals(order.id!).toArray();
            console.log(`📊 Found ${voidLogs.length} void logs to sync`);
            
            for (const voidLog of voidLogs) {
              console.log(`📦 Processing void log ${voidLog.id}...`);
              const { data: existingVoidLog, error: voidCheckError } = await supabase
                .from('order_void_logs')
                .select('id')
                .eq('id', voidLog.id)
                .single();

              if (voidCheckError && voidCheckError.code !== 'PGRST116') {
                console.log(`❌ Error checking void log existence: ${voidCheckError.message}`);
                throw voidCheckError;
              }

              if (!existingVoidLog) {
                // Void log belum ada, insert ke Supabase
                console.log(`📤 Inserting void log ${voidLog.id} to Supabase...`);
                const { error: voidInsertError } = await supabase.from('order_void_logs').insert({
                  id: voidLog.id,
                  order_id: voidLog.order_id,
                  product_id: voidLog.product_id,
                  quantity: voidLog.quantity,
                  reason: voidLog.reason,
                  cashier_id: voidLog.cashier_id,
                  created_at: voidLog.created_at,
                });

                if (voidInsertError) {
                  console.log(`❌ Error inserting void log: ${voidInsertError.message}`);
                  throw voidInsertError;
                }
                console.log(`✅ Void log ${voidLog.id} inserted successfully`);
              } else {
                console.log(`⚠️ Void log ${voidLog.id} already exists, skipping`);
              }
            }

            // 6. Jika sukses, ubah status jadi 'synced' di IndexedDB
            console.log(`🔄 Updating order ${order.id} status to 'synced' in IndexedDB...`);
            await db.orders.update(order.id!, { status: 'synced' });
            console.log(`✅ Order ${order.id} successfully synced to Supabase`);
          } else {
            console.log(`❌ Error inserting order: ${insertError.message}`);
            throw insertError;
          }
        } catch (err) {
          console.error(`❌ Failed to sync order ${order.id}:`, err);
          setSyncError(`Gagal sync order ${order.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      setLastSyncTime(new Date().toISOString());
      console.log('🎉 Sync completed successfully');

    } catch (error) {
      console.error('Sync process failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncInProgress(false);
    }
  }, [syncInProgress, isOnline]);

  /**
   * Update pending transactions count
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await db.orders.where('status').equals('pending').count();
      setPendingTransactions(count);
    } catch (error) {
      console.error('Failed to get pending count:', error);
    }
  }, []);

  /**
   * Manual sync trigger
   */
  const triggerManualSync = useCallback(() => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline');
      return;
    }
    syncOfflineOrders();
  }, [isOnline, syncOfflineOrders]);

  /**
   * Auto-sync saat internet kembali (Event Listener)
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('Device came online');
      setIsOnline(true);
      // Trigger sync after a short delay to ensure network is stable
      setTimeout(() => {
        syncOfflineOrders();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('Device went offline');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    setIsOnline(navigator.onLine);
    updatePendingCount();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncOfflineOrders, updatePendingCount]);

  // Update pending count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updatePendingCount();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  return {
    isOnline,
    pendingTransactions,
    syncInProgress,
    syncError,
    lastSyncTime,
    triggerManualSync,
    syncOfflineOrders,
  };
};

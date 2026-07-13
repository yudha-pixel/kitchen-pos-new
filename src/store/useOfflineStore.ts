import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, SyncQueueItem } from '@/src/lib/db';

interface OfflineState {
  isOnline: boolean;
  pendingTransactions: number;
  lastSyncTime: string | null;
  syncInProgress: boolean;
  syncError: string | null;
  
  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  addTransaction: (operation: 'create' | 'update' | 'delete', tableName: string, data: any) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  clearTransactions: () => Promise<void>;
  setSyncInProgress: (inProgress: boolean) => void;
  setSyncError: (error: string | null) => void;
  updateLastSyncTime: (time: string) => void;
  getPendingTransactions: () => Promise<SyncQueueItem[]>;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingTransactions: 0,
      lastSyncTime: null,
      syncInProgress: false,
      syncError: null,

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
        
        // When coming back online, trigger sync if there are pending transactions
        if (isOnline && get().pendingTransactions > 0) {
          console.log('Back online, triggering sync...');
          // This will be handled by the sync manager hook
        }
      },

      // Add a transaction to the offline queue
      addTransaction: async (operation: 'create' | 'update' | 'delete', tableName: string, data: any) => {
        try {
          const queueItem: SyncQueueItem = {
            id: crypto.randomUUID(),
            operation,
            table_name: tableName,
            data,
            status: 'pending',
            error_message: null,
            retry_count: 0,
            created_at: new Date().toISOString(),
            synced_at: null,
          };

          await db.sync_queue.add(queueItem);
          
          // Update pending count
          const pendingCount = await db.sync_queue.where('status').equals('pending').count();
          set({ pendingTransactions: pendingCount });
          
          console.log(`Added ${operation} transaction for ${tableName} to queue`);
        } catch (error) {
          console.error('Failed to add transaction to queue:', error);
          throw error;
        }
      },

      // Remove a transaction from the queue (after successful sync)
      removeTransaction: async (id: string) => {
        try {
          await db.sync_queue.delete(id);
          
          // Update pending count
          const pendingCount = await db.sync_queue.where('status').equals('pending').count();
          set({ pendingTransactions: pendingCount });
          
          console.log(`Removed transaction ${id} from queue`);
        } catch (error) {
          console.error('Failed to remove transaction from queue:', error);
          throw error;
        }
      },

      // Clear all transactions (useful for testing or cleanup)
      clearTransactions: async () => {
        try {
          await db.sync_queue.clear();
          set({ pendingTransactions: 0, syncError: null });
          console.log('Cleared all transactions from queue');
        } catch (error) {
          console.error('Failed to clear transactions:', error);
          throw error;
        }
      },

      // Set sync progress state
      setSyncInProgress: (inProgress: boolean) => {
        set({ syncInProgress: inProgress, syncError: inProgress ? null : get().syncError });
      },

      // Set sync error
      setSyncError: (error: string | null) => {
        set({ syncError: error });
      },

      // Update last sync time
      updateLastSyncTime: (time: string) => {
        set({ lastSyncTime: time });
      },

      // Get all pending transactions from IndexedDB
      getPendingTransactions: async () => {
        try {
          const pending = await db.sync_queue
            .where('status')
            .equals('pending')
            .sortBy('created_at');
          
          return pending;
        } catch (error) {
          console.error('Failed to get pending transactions:', error);
          return [];
        }
      },
    }),
    {
      name: 'kitchen-pos-offline-storage',
      partialize: (state) => ({
        isOnline: state.isOnline,
        lastSyncTime: state.lastSyncTime,
        syncError: state.syncError,
      }),
    }
  )
);

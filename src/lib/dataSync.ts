import { db, type SyncStatus } from './db';
import * as api from './api';

export interface SyncProgress {
  currentStep: string;
  totalSteps: number;
  currentStepIndex: number;
  percentage: number;
}

export interface SyncResult {
  success: boolean;
  progress: SyncProgress;
  error?: string;
  completedSteps: string[];
}

export interface DataSyncStatus {
  lastSyncTime: string | null;
  initialSyncCompleted: boolean;
  dataTypes: {
    products: { lastSync: string | null; count: number };
    categories: { lastSync: string | null; count: number };
    modifiers: { lastSync: string | null; count: number };
    tables: { lastSync: string | null; count: number };
    outlets: { lastSync: string | null; count: number };
    ingredients: { lastSync: string | null; count: number };
  };
}

const SYNC_STEPS = [
  'categories',
  'products',
  'modifiers',
  'ingredients',
  'tables',
  'outlets',
] as const;

/**
 * Comprehensive data sync manager for offline-first POS
 * Ensures all required data is cached for offline operations
 */
export class DataSyncManager {
  private progressCallback?: (progress: SyncProgress) => void;

  constructor(progressCallback?: (progress: SyncProgress) => void) {
    this.progressCallback = progressCallback;
  }

  /**
   * Perform comprehensive initial data sync
   */
  async performInitialSync(): Promise<SyncResult> {
    const completedSteps: string[] = [];
    const totalSteps = SYNC_STEPS.length;

    try {
      for (let i = 0; i < SYNC_STEPS.length; i++) {
        const step = SYNC_STEPS[i];
        const progress: SyncProgress = {
          currentStep: step,
          totalSteps,
          currentStepIndex: i,
          percentage: Math.round((i / totalSteps) * 100),
        };

        this.progressCallback?.(progress);
        console.log(`Syncing ${step}... (${i + 1}/${totalSteps})`);

        try {
          await this.syncDataType(step);
          completedSteps.push(step);
        } catch (error) {
          console.error(`Failed to sync ${step}:`, error);
          throw new Error(`Failed to sync ${step}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Mark initial sync as completed
      await this.markInitialSyncCompleted();

      const finalProgress: SyncProgress = {
        currentStep: 'completed',
        totalSteps,
        currentStepIndex: totalSteps,
        percentage: 100,
      };

      this.progressCallback?.(finalProgress);

      return {
        success: true,
        progress: finalProgress,
        completedSteps,
      };
    } catch (error) {
      const progress: SyncProgress = {
        currentStep: 'error',
        totalSteps,
        currentStepIndex: completedSteps.length,
        percentage: Math.round((completedSteps.length / totalSteps) * 100),
      };

      this.progressCallback?.(progress);

      return {
        success: false,
        progress,
        error: error instanceof Error ? error.message : 'Sync failed',
        completedSteps,
      };
    }
  }

  /**
   * Sync a specific data type
   */
  private async syncDataType(dataType: typeof SYNC_STEPS[number]): Promise<void> {
    switch (dataType) {
      case 'categories':
        await this.syncCategories();
        break;
      case 'products':
        await this.syncProducts();
        break;
      case 'modifiers':
        await this.syncModifiers();
        break;
      case 'ingredients':
        await this.syncIngredients();
        break;
      case 'tables':
        await this.syncTables();
        break;
      case 'outlets':
        await this.syncOutlets();
        break;
    }
  }

  /**
   * Sync categories
   */
  private async syncCategories(): Promise<void> {
    const data = await api.fetchCategories();
    if (Array.isArray(data) && data.length > 0) {
      await db.categories.clear();
      await db.categories.bulkPut(data);
      console.log(`Synced ${data.length} categories`);
    }
  }

  /**
   * Sync products
   */
  private async syncProducts(): Promise<void> {
    const data = await api.fetchProducts();
    if (Array.isArray(data) && data.length > 0) {
      await db.products.clear();
      await db.products.bulkPut(data);
      console.log(`Synced ${data.length} products`);
    }
  }

  /**
   * Sync modifiers
   */
  private async syncModifiers(): Promise<void> {
    // Fetch all modifiers (no product filter)
    const data = await api.fetchModifiers();
    if (Array.isArray(data) && data.length > 0) {
      await db.modifiers.clear();
      await db.modifiers.bulkPut(data);
      console.log(`Synced ${data.length} modifiers`);
    }
  }

  /**
   * Sync ingredients
   */
  private async syncIngredients(): Promise<void> {
    const data = await api.fetchIngredients();
    if (Array.isArray(data) && data.length > 0) {
      await db.ingredients.clear();
      await db.ingredients.bulkPut(data);
      console.log(`Synced ${data.length} ingredients`);
    }
  }

  /**
   * Sync tables
   */
  private async syncTables(): Promise<void> {
    try {
      // Try the public self-order tables endpoint first (no auth required)
      const data = await api.fetchTables();
      if (Array.isArray(data) && data.length > 0) {
        await db.restaurant_tables.clear();
        await db.restaurant_tables.bulkPut(data);
        console.log(`Synced ${data.length} tables`);
      }
    } catch (error) {
      console.warn('Tables sync failed:', error);
    }
  }

  /**
   * Sync outlets
   */
  private async syncOutlets(): Promise<void> {
    try {
      const data = await api.fetchOutlets();
      if (Array.isArray(data) && data.length > 0) {
        await db.outlets.clear();
        await db.outlets.bulkPut(data);
        console.log(`Synced ${data.length} outlets`);
      }
    } catch (error) {
      console.warn('Outlets sync failed:', error);
    }
  }

  /**
   * Mark initial sync as completed
   */
  private async markInitialSyncCompleted(): Promise<void> {
    const syncStatus: SyncStatus = {
      id: 'global-sync-status',
      lastSyncTime: new Date().toISOString(),
      initialSyncCompleted: true,
    };
    
    // Store in IndexedDB
    try {
      await db.sync_status.put(syncStatus);
    } catch (error) {
      console.warn('Failed to store sync status:', error);
    }
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<DataSyncStatus> {
    try {
      const globalStatus: SyncStatus | undefined = await db.sync_status.get('global-sync-status');
      
      return {
        lastSyncTime: globalStatus?.lastSyncTime || null,
        initialSyncCompleted: globalStatus?.initialSyncCompleted || false,
        dataTypes: {
          products: {
            lastSync: globalStatus?.lastSyncTime || null,
            count: await db.products.count(),
          },
          categories: {
            lastSync: globalStatus?.lastSyncTime || null,
            count: await db.categories.count(),
          },
          modifiers: {
            lastSync: globalStatus?.lastSyncTime || null,
            count: await db.modifiers.count(),
          },
          tables: {
            lastSync: globalStatus?.lastSyncTime || null,
            count: await db.restaurant_tables.count(),
          },
          outlets: {
            lastSync: globalStatus?.lastSyncTime || null,
            count: await db.outlets.count(),
          },
          ingredients: {
            lastSync: globalStatus?.lastSyncTime || null,
            count: await db.ingredients.count(),
          },
        },
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        lastSyncTime: null,
        initialSyncCompleted: false,
        dataTypes: {
          products: { lastSync: null, count: 0 },
          categories: { lastSync: null, count: 0 },
          modifiers: { lastSync: null, count: 0 },
          tables: { lastSync: null, count: 0 },
          outlets: { lastSync: null, count: 0 },
          ingredients: { lastSync: null, count: 0 },
        },
      };
    }
  }

  /**
   * Check if initial sync is needed
   */
  async isInitialSyncNeeded(): Promise<boolean> {
    const status = await this.getSyncStatus();
    return !status.initialSyncCompleted;
  }

  /**
   * Perform incremental sync (sync only changed data)
   */
  async performIncrementalSync(): Promise<SyncResult> {
    // For now, this will just perform a full sync
    // In the future, this could use timestamps to sync only changed data
    return this.performInitialSync();
  }
}

/**
 * Convenience function to perform sync with progress callback
 */
export async function performDataSync(
  progressCallback?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  const manager = new DataSyncManager(progressCallback);
  return manager.performInitialSync();
}

/**
 * Get current sync status
 */
export async function getDataSyncStatus(): Promise<DataSyncStatus> {
  const manager = new DataSyncManager();
  return manager.getSyncStatus();
}

/**
 * Check if initial sync is needed
 */
export async function checkInitialSyncNeeded(): Promise<boolean> {
  const manager = new DataSyncManager();
  return manager.isInitialSyncNeeded();
}
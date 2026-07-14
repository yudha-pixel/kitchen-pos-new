import Dexie, { Table as DexieTable } from 'dexie';

// Database interfaces matching the local PostgreSQL schema
export interface Product {
  id?: string; // UUID
  category_id: string | null; // UUID
  name: string;
  sku: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
}

export interface Category {
  id?: string; // UUID
  name: string;
}

export interface Modifier {
  id?: string; // UUID
  product_id: string; // UUID
  name: string;
  price_extra: number;
}

export interface Order {
  id?: string; // UUID
  cashier_id: string | null; // UUID
  total_amount: number;
  payment_method: 'cash' | 'card' | 'qr' | 'transfer';
  status: 'pending' | 'completed' | 'cancelled' | 'synced';
  table_number: string | null;
  discount_amount: number;
  rounding_amount: number;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id?: string; // UUID
  order_id: string; // UUID
  product_id: string; // UUID
  quantity: number;
  price_at_time: number;
  discount_item: number;
  modifiers_applied: any[];
  split_group_id: string | null;
}

export interface OrderVoidLog {
  id?: string; // UUID
  order_id: string; // UUID
  product_id: string; // UUID
  quantity: number;
  reason: string;
  cashier_id: string | null; // UUID
  created_at: string;
}

export interface SyncQueueItem {
  id?: string; // UUID
  operation: 'create' | 'update' | 'delete';
  table_name: string;
  data: any;
  status: 'pending' | 'synced' | 'failed';
  error_message: string | null;
  retry_count: number;
  created_at: string;
  synced_at: string | null;
}

// Dexie database class for IndexedDB
export class KitchenPOSDB extends Dexie {
  // Define tables with their types and key paths
  products!: DexieTable<Product>;
  categories!: DexieTable<Category>;
  modifiers!: DexieTable<Modifier>;
  orders!: DexieTable<Order>;
  order_items!: DexieTable<OrderItem>;
  order_void_logs!: DexieTable<OrderVoidLog>;
  sync_queue!: DexieTable<SyncQueueItem>;

  constructor() {
    super('KitchenPOSDB');
    
    // Define database schema with UUID-based keys
    this.version(1).stores({
      products: 'id, name, category_id, price',
      categories: 'id, name',
      modifiers: 'id, name, product_id',
      orders: 'id, cashier_id, status, created_at',
      order_items: 'id, order_id, product_id, split_group_id',
      order_void_logs: 'id, order_id, cashier_id, created_at',
      sync_queue: 'id, status, table_name, created_at',
    });
  }
}

// Export singleton instance
export const db = new KitchenPOSDB();

// Helper functions for database operations
export const dbHelpers = {
  // Clear all data (useful for testing or logout)
  async clearAll(): Promise<void> {
    // Clear tables sequentially to avoid transaction complexity
    await db.products.clear();
    await db.categories.clear();
    await db.modifiers.clear();
    await db.orders.clear();
    await db.order_items.clear();
    await db.order_void_logs.clear();
    await db.sync_queue.clear();
  },

  // Get database size in bytes
  async getDbSize(): Promise<number> {
    const tableList = [
      db.products,
      db.categories,
      db.modifiers,
      db.orders,
      db.order_items,
      db.order_void_logs,
      db.sync_queue,
    ];

    let totalSize = 0;
    for (const table of tableList) {
      const count = await table.count();
      totalSize += count * 1000; // Rough estimate: 1KB per record
    }
    return totalSize;
  },

  // Check if database is empty
  async isEmpty(): Promise<boolean> {
    const productCount = await db.products.count();
    return productCount === 0;
  },

  // Get last sync timestamp
  async getLastSyncTime(): Promise<string | null> {
    const lastOrder = await db.orders.orderBy('created_at').last();
    return lastOrder?.created_at || null;
  },
};

/**
 * Database Types
 *
 * TypeScript interfaces that match the local PostgreSQL database schema.
 * These types are used throughout the application to ensure type safety.
 *
 * Schema Reference: prisma/schema.prisma
 * UUID-based schema for improved scalability and offline-first support
 */

// ============================================================================
// Profile Types (User/Kasir)
// ============================================================================

export interface Profile {
  id: string; // UUID
  username: string;
  role: 'admin' | 'cashier';
}

export interface ProfileInsert {
  id?: string;
  username: string;
  role?: 'admin' | 'cashier';
}

export interface ProfileUpdate {
  id?: string;
  username?: string;
  role?: 'admin' | 'cashier';
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  id: string; // UUID
  name: string;
  color?: string | null;
}

export interface CategoryInsert {
  id?: string;
  name: string;
}

export interface CategoryUpdate {
  id?: string;
  name?: string;
}

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
  id: string; // UUID
  category_id: string | null; // UUID
  category_name?: string; // Category name for easier access
  category_color?: string | null; // Category color
  name: string;
  description?: string; // Product description
  sku: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  modifier_groups?: ModifierGroup[];
}

export interface ProductInsert {
  id?: string;
  category_id?: string | null;
  name: string;
  sku?: string | null;
  price: number;
  stock_quantity?: number;
  image_url?: string | null;
}

export interface ProductUpdate {
  id?: string;
  category_id?: string | null;
  name?: string;
  sku?: string | null;
  price?: number;
  stock_quantity?: number;
  image_url?: string | null;
}

// ============================================================================
// Modifier Types
// ============================================================================

export interface ModifierGroup {
  id: string; // UUID
  name: string;
  is_required: boolean;
  max_selections: number;
  modifiers: Modifier[];
}

export interface Modifier {
  id: string; // UUID
  modifier_group_id: string; // UUID
  name: string;
  price_extra: number;
}

export interface ModifierInsert {
  id?: string;
  product_id: string;
  name: string;
  price_extra?: number;
}

export interface ModifierUpdate {
  id?: string;
  product_id?: string;
  name?: string;
  price_extra?: number;
}

// ============================================================================
// Order Types
// ============================================================================

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'qr' | 'transfer';

export interface Order {
  id: string; // UUID
  cashier_id: string | null; // UUID
  total_amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  table_number: string | null;
  discount_amount: number;
  rounding_amount: number;
  notes: string | null;
  created_at: string;
}

export interface OrderInsert {
  id?: string;
  cashier_id?: string | null;
  total_amount: number;
  payment_method: PaymentMethod;
  status?: OrderStatus;
  table_number?: string | null;
  discount_amount?: number;
  rounding_amount?: number;
  notes?: string | null;
  created_at?: string;
}

export interface OrderUpdate {
  id?: string;
  cashier_id?: string | null;
  total_amount?: number;
  payment_method?: PaymentMethod;
  status?: OrderStatus;
  table_number?: string | null;
  discount_amount?: number;
  rounding_amount?: number;
  notes?: string | null;
  created_at?: string;
}

// ============================================================================
// Order Item Types
// ============================================================================

export interface OrderItem {
  id: string; // UUID
  order_id: string; // UUID
  product_id: string; // UUID
  quantity: number;
  price_at_time: number;
  discount_item: number;
  modifiers_applied: any[]; // JSONB array of modifier objects
  split_group_id: string | null;
}

export interface OrderItemInsert {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  discount_item?: number;
  modifiers_applied?: any[];
  split_group_id?: string | null;
}

export interface OrderItemUpdate {
  id?: string;
  order_id?: string;
  product_id?: string;
  quantity?: number;
  price_at_time?: number;
  discount_item?: number;
  modifiers_applied?: any[];
  split_group_id?: string | null;
}

// ============================================================================
// Order Void Log Types
// ============================================================================

export interface OrderVoidLog {
  id: string; // UUID
  order_id: string; // UUID
  product_id: string; // UUID
  quantity: number;
  reason: string;
  cashier_id: string | null; // UUID
  created_at: string;
}

export interface OrderVoidLogInsert {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  reason: string;
  cashier_id?: string | null;
  created_at?: string;
}

export interface OrderVoidLogUpdate {
  id?: string;
  order_id?: string;
  product_id?: string;
  quantity?: number;
  reason?: string;
  cashier_id?: string | null;
  created_at?: string;
}

// ============================================================================
// Sync Queue Types (Offline-First Support)
// ============================================================================

export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string; // UUID
  operation: SyncOperation;
  table_name: string;
  data: any; // JSONB data for the operation
  status: SyncStatus;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  synced_at: string | null;
}

export interface SyncQueueItemInsert {
  id?: string;
  operation: SyncOperation;
  table_name: string;
  data: any;
  status?: SyncStatus;
  error_message?: string | null;
  retry_count?: number;
  created_at?: string;
  synced_at?: string | null;
}

export interface SyncQueueItemUpdate {
  id?: string;
  operation?: SyncOperation;
  table_name?: string;
  data?: any;
  status?: SyncStatus;
  error_message?: string | null;
  retry_count?: number;
  created_at?: string;
  synced_at?: string | null;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type for API responses with data
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Type for paginated responses
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Type for cart items (used in Zustand store)
 */
export interface CartItem {
  id: string; // UUID
  productId: string; // UUID
  name: string;
  price: number;
  quantity: number;
  modifiers: Array<{
    id: string; // UUID
    name: string;
    price: number;
    selected: boolean;
  }>;
}

/**
 * Type for modifier options in UI
 */
export interface ModifierOption {
  id: string; // UUID
  name: string;
  price: number;
  selected: boolean;
}

/**
 * Type for modifier groups in UI (simplified - direct product modifiers)
 */
export interface UIModifierGroup {
  id: string; // UUID
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: ModifierOption[];
}

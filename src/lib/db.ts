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
  bom_type?: 'manufacture' | 'kit' | 'subcontracting'; // Bill of Materials type
  subcontracting_info?: {
    vendor_name: string;
    vendor_contact: string;
    lead_time_days: number;
    unit_cost: number;
    notes?: string;
  };
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
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled' | 'done';
  // Local-only flag: 'pending' = created offline, not yet pushed to the API.
  // Kept separate from `status`, which is the order lifecycle shared with the server.
  sync_status?: 'pending' | 'synced';
  table_number: string | null;
  discount_amount: number;
  rounding_amount: number;
  notes: string | null;
  created_at: string;
  order_category?: 'dine-in' | 'takeaway' | 'delivery';
  receipt_number?: string;
  customer_name?: string | null;
  delivery_address?: string | null;
  courier_name?: string | null;
  courier_type?: 'internal' | 'external' | null;
  // Global discount fields
  global_discount_amount?: number;
  global_discount_type?: 'nominal' | 'percentage';
  global_discount_authorized_by?: string | null;
  global_discount_reason?: string;
  // Voucher fields
  voucher_code?: string | null;
  voucher_id?: string | null;
  voucher_discount_type?: 'nominal' | 'percentage' | null;
  voucher_discount_value?: number;
  voucher_discount_amount?: number;
  // Member fields
  member_id?: string | null;
  member_name?: string | null;
  member_phone?: string | null;
  member_tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  member_discount_percentage?: number;
  member_discount_amount?: number;
  member_points_earned?: number;
  // Promotion fields
  promotion_id?: string | null;
  promotion_name?: string | null;
  promotion_type?: 'quantity' | 'amount' | null;
  promotion_discount_amount?: number;
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
  status: string; // pending, preparing, ready, served, cancelled
  is_free?: boolean; // Flag for free/complimentary items
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

export interface Ingredient {
  id?: string; // UUID
  name: string;
  current_stock: number;
  unit: string; // e.g., kg, gram, ml, pcs
  min_stock: number; // buffer stock threshold
  unit_price: number;
  supplier_id?: string; // Preferred supplier UUID
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id?: string; // UUID
  menu_item_id: string; // UUID - connects to products table
  ingredient_id: string; // UUID - connects to ingredients table
  quantity_required: number;
  unit?: string; // Unit of measurement for the quantity
  created_at: string;
}

export interface KitComponent {
  id?: string; // UUID
  menu_item_id: string; // UUID - parent product (the kit)
  component_product_id: string; // UUID - child product (component in the kit)
  quantity_required: number;
  created_at: string;
}

export interface RecipeHistory {
  id?: string; // UUID
  menu_item_id: string; // UUID - connects to products table
  menu_item_name: string; // Denormalized for easier display
  bom_type: 'manufacture' | 'kit' | 'subcontracting';
  recipes: Recipe[]; // Array of recipe components
  kit_components: KitComponent[]; // Array of kit components
  subcontracting_info?: {
    vendor_name: string;
    vendor_contact: string;
    lead_time_days: number;
    unit_cost: number;
    notes?: string;
  };
  changed_by: string; // User ID who made the change
  changed_by_name: string; // Denormalized for easier display
  change_reason?: string; // Optional reason for the change
  created_at: string;
}

export interface Outlet {
  id?: string; // UUID
  name: string;
  code: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableEntity {
  id?: string; // UUID
  table_number: string;
  qr_code?: string;
  is_active: boolean;
  outlet_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id?: string; // UUID
  table_id: string; // UUID
  customer_name?: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_method?: string;
  payment_status: 'unpaid' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface CustomerOrderItem {
  id?: string; // UUID
  order_id: string; // UUID
  product_id: string; // UUID
  quantity: number;
  price_at_time: number;
  modifiers_applied?: any[];
  created_at: string;
}

export interface PaymentTransaction {
  id?: string; // UUID
  order_id: string; // UUID
  gateway: string; // 'midtrans', 'xendit'
  gateway_tx_id?: string;
  amount: number;
  payment_method: string; // 'qris', 'va', 'ewallet'
  status: 'pending' | 'paid' | 'failed' | 'expired';
  qr_code?: string;
  qr_expiry?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StockRequest {
  id?: string; // UUID
  ingredient_id: string; // UUID - connects to ingredients table
  ingredient_name: string; // Denormalized for easier display
  quantity_requested: number;
  unit: string; // e.g., kg, gram, ml, pcs
  notes?: string; // Invoice number or notes
  supplier_name?: string; // Optional supplier name
  proof_file?: string; // Base64 encoded file or file path
  proof_file_name?: string; // Original file name
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string; // User ID who requested
  requested_by_name: string; // Denormalized for easier display
  approved_by?: string; // User ID who approved
  approved_by_name?: string; // Denormalized for easier display
  rejected_by?: string; // User ID who rejected
  rejected_by_name?: string; // Denormalized for easier display
  rejection_reason?: string; // Reason for rejection
  requested_at: string;
  approved_at?: string;
  rejected_at?: string;
}

export interface StockWriteOff {
  id?: string; // UUID
  ingredient_id: string; // UUID - connects to ingredients table
  ingredient_name: string; // Denormalized for easier display
  quantity_written_off: number;
  unit: string; // e.g., kg, gram, ml, pcs
  reason: string; // Reason for write-off (damaged, lost, expired, etc.)
  notes?: string; // Additional notes
  proof_file: string; // Base64 encoded file (mandatory)
  proof_file_name: string; // Original file name
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string; // User ID who requested
  requested_by_name: string; // Denormalized for easier display
  approved_by?: string; // User ID who approved
  approved_by_name?: string; // Denormalized for easier display
  rejected_by?: string; // User ID who rejected
  rejected_by_name?: string; // Denormalized for easier display
  rejection_reason?: string; // Reason for rejection
  requested_at: string;
  approved_at?: string;
  rejected_at?: string;
}

export interface Voucher {
  id?: string; // UUID
  code: string; // Unique voucher code
  name: string; // Voucher name for display
  description?: string; // Description
  discount_type: 'nominal' | 'percentage'; // Discount type
  discount_value: number; // Discount amount or percentage
  minimum_purchase: number; // Minimum purchase amount to use voucher
  max_discount?: number; // Maximum discount amount (for percentage discounts)
  quota: number; // Total usage quota
  used_count: number; // Number of times used
  valid_from: string; // Start date (ISO string)
  valid_until: string; // End date (ISO string)
  is_active: boolean; // Active status
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id?: string; // UUID
  category: string; // Category: 'gaji', 'sewa', 'utilitas', 'operasional', 'lainnya'
  amount: number; // Expense amount
  description: string; // Description of expense
  date: string; // Date of expense (ISO string)
  payment_method: 'cash' | 'transfer' | 'card'; // Payment method
  proof_file?: string; // Base64 encoded file (optional)
  proof_file_name?: string; // Original file name (optional)
  created_by: string; // User ID who created
  created_by_name: string; // Denormalized for easier display
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id?: string; // UUID
  name: string; // Employee name
  position: string; // Job position
  email: string; // Email address
  phone: string; // Phone number
  base_salary: number; // Monthly base salary (for permanent employees)
  employment_type: 'permanent' | 'freelance'; // Employment type
  hourly_rate?: number; // Hourly rate (for freelance employees)
  join_date: string; // Join date (ISO string)
  status: 'active' | 'inactive'; // Employment status
  created_at?: string; // Creation timestamp
  updated_at?: string; // Last update timestamp
}

export interface Attendance {
  id?: string; // UUID
  employee_id: string; // Reference to employee
  date: string; // Attendance date (ISO string)
  check_in_time?: string; // Check-in time (HH:MM:SS)
  check_out_time?: string; // Check-out time (HH:MM:SS)
  check_in_photo?: string; // Base64 encoded photo
  check_out_photo?: string; // Base64 encoded photo
  status: 'present' | 'late' | 'absent'; // Attendance status
  shift_id?: string; // Reference to shift
  overtime_hours?: number; // Overtime duration in hours
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id?: string; // UUID
  name: string; // Shift name (e.g., "Pagi", "Siang", "Malam")
  start_time: string; // Start time (HH:MM)
  end_time: string; // End time (HH:MM)
  description?: string; // Shift description
  assigned_employees?: string[]; // Array of employee IDs assigned to this shift
  created_at: string;
  updated_at: string;
}

export interface Member {
  id?: string; // UUID
  name: string; // Member name
  phone: string; // Phone number (unique identifier)
  email?: string; // Email address
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'; // Member tier
  points: number; // Loyalty points
  total_spent: number; // Total amount spent
  discount_percentage: number; // Automatic discount percentage based on tier
  created_at: string;
  updated_at: string;
  is_active: boolean; // Active status
}

export interface Promotion {
  id?: string; // UUID
  name: string; // Promotion name
  description?: string; // Description
  type: 'quantity' | 'amount'; // Quantity-based or amount-based
  min_quantity?: number; // Minimum quantity required (for quantity type)
  min_amount?: number; // Minimum purchase amount required (for amount type)
  discount_type: 'nominal' | 'percentage'; // Discount type
  discount_value: number; // Discount amount or percentage
  max_discount?: number; // Maximum discount amount (for percentage discounts)
  buy_x_get_y?: boolean; // Buy X Get Y promotion
  buy_quantity?: number; // Buy X quantity
  get_quantity?: number; // Get Y quantity
  valid_from: string; // Start date (ISO string)
  valid_until: string; // End date (ISO string)
  is_active: boolean; // Active status
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id?: string; // UUID
  name: string; // Nama supplier
  phone: string; // Kontak/Telepon
  email?: string; // Email
  address?: string; // Alamat
  created_at: string;
  updated_at: string;
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
  ingredients!: DexieTable<Ingredient>;
  recipes!: DexieTable<Recipe>;
  kit_components!: DexieTable<KitComponent>;
  recipe_history!: DexieTable<RecipeHistory>;
  vouchers!: DexieTable<Voucher>;
  members!: DexieTable<Member>;
  promotions!: DexieTable<Promotion>;
  stock_requests!: DexieTable<StockRequest>;
  stock_write_offs!: DexieTable<StockWriteOff>;
  suppliers!: DexieTable<Supplier>;
  expenses!: DexieTable<Expense>;
  employees!: DexieTable<Employee>;
  attendance!: DexieTable<Attendance>;
  shifts!: DexieTable<Shift>;
  outlets!: DexieTable<Outlet>;
  restaurant_tables!: DexieTable<TableEntity>;
  customer_orders!: DexieTable<CustomerOrder>;
  customer_order_items!: DexieTable<CustomerOrderItem>;
  payment_transactions!: DexieTable<PaymentTransaction>;

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
      ingredients: 'id, name',
      recipes: 'id, menu_item_id, ingredient_id',
      vouchers: 'id, code, is_active, valid_from, valid_until',
      members: 'id, phone, tier, is_active',
      promotions: 'id, type, is_active, valid_from, valid_until',
      stock_requests: 'id, ingredient_id, status, requested_at',
      stock_write_offs: 'id, ingredient_id, status, requested_at',
      suppliers: 'id, name, phone',
    });

    // v2: sync state moves out of `status` into a dedicated `sync_status` field,
    // so the order lifecycle (pending/preparing/...) no longer collides with
    // "needs to be pushed to the API".
    this.version(2)
      .stores({
        orders: 'id, cashier_id, status, sync_status, created_at',
      })
      .upgrade(async (tx) => {
        await tx
          .table('orders')
          .toCollection()
          .modify((order) => {
            if (order.status === 'synced') {
              // v1 marker for "pushed to server"; the real status was completed.
              order.status = 'completed';
              order.sync_status = 'synced';
            } else if (order.status === 'pending' && !order.sync_status) {
              // v1 offline orders awaiting sync.
              order.sync_status = 'pending';
            } else if (!order.sync_status) {
              order.sync_status = 'synced';
            }
          });
      });

    // v3: Add order_category, receipt_number, and related fields for order flow
    this.version(3)
      .stores({
        orders: 'id, cashier_id, status, sync_status, order_category, receipt_number, created_at',
      })
      .upgrade(async (tx) => {
        await tx
          .table('orders')
          .toCollection()
          .modify((order) => {
            // Set default values for existing orders
            if (!order.order_category) {
              order.order_category = 'dine-in';
            }
            if (!order.receipt_number) {
              order.receipt_number = `DI-${Date.now().toString().slice(-4)}`;
            }
          });
      });

    // v4: Add global discount fields to orders table for discount reports
    this.version(4)
      .stores({
        orders: 'id, cashier_id, status, sync_status, order_category, receipt_number, global_discount_amount, created_at',
      })
      .upgrade(async (tx) => {
        await tx
          .table('orders')
          .toCollection()
          .modify((order) => {
            // Set default values for existing orders
            if (order.global_discount_amount === undefined) {
              order.global_discount_amount = 0;
            }
            if (order.global_discount_type === undefined) {
              order.global_discount_type = 'nominal';
            }
          });
      });

    // v5: Add vouchers table and voucher fields to orders
    this.version(5)
      .stores({
        orders: 'id, cashier_id, status, sync_status, order_category, receipt_number, global_discount_amount, voucher_discount_amount, created_at',
        vouchers: 'id, code, is_active, valid_from, valid_until',
      })
      .upgrade(async (tx) => {
        await tx
          .table('orders')
          .toCollection()
          .modify((order) => {
            // Set default values for existing orders
            if (order.voucher_code === undefined) {
              order.voucher_code = null;
            }
            if (order.voucher_id === undefined) {
              order.voucher_id = null;
            }
            if (order.voucher_discount_type === undefined) {
              order.voucher_discount_type = null;
            }
            if (order.voucher_discount_value === undefined) {
              order.voucher_discount_value = 0;
            }
            if (order.voucher_discount_amount === undefined) {
              order.voucher_discount_amount = 0;
            }
          });
      });

    // v6: Add members table and member fields to orders
    this.version(6)
      .stores({
        orders: 'id, cashier_id, status, sync_status, order_category, receipt_number, global_discount_amount, voucher_discount_amount, member_id, member_discount_amount, created_at',
        members: 'id, phone, tier, is_active',
      })
      .upgrade(async (tx) => {
        await tx
          .table('orders')
          .toCollection()
          .modify((order) => {
            // Set default values for existing orders
            if (order.member_id === undefined) {
              order.member_id = null;
            }
            if (order.member_name === undefined) {
              order.member_name = null;
            }
            if (order.member_phone === undefined) {
              order.member_phone = null;
            }
            if (order.member_tier === undefined) {
              order.member_tier = null;
            }
            if (order.member_discount_percentage === undefined) {
              order.member_discount_percentage = 0;
            }
            if (order.member_discount_amount === undefined) {
              order.member_discount_amount = 0;
            }
            if (order.member_points_earned === undefined) {
              order.member_points_earned = 0;
            }
          });
      });

    // v7: Add promotions table and promotion fields to orders
    this.version(7)
      .stores({
        orders: 'id, cashier_id, status, sync_status, order_category, receipt_number, global_discount_amount, voucher_discount_amount, member_id, member_discount_amount, promotion_id, promotion_discount_amount, created_at',
        promotions: 'id, type, is_active, valid_from, valid_until',
      })
      .upgrade(async (tx) => {
        await tx
          .table('orders')
          .toCollection()
          .modify((order) => {
            // Set default values for existing orders
            if (order.promotion_id === undefined) {
              order.promotion_id = null;
            }
            if (order.promotion_name === undefined) {
              order.promotion_name = null;
            }
            if (order.promotion_type === undefined) {
              order.promotion_type = null;
            }
            if (order.promotion_discount_amount === undefined) {
              order.promotion_discount_amount = 0;
            }
          });
      });

    // v8: Add suppliers table
    this.version(8)
      .stores({
        suppliers: 'id, name, phone',
      });

    // v9: Add supplier_id to ingredients
    this.version(9)
      .stores({
        ingredients: 'id, name, supplier_id',
      });

    // v10: Add expenses table for tracking operational expenses
    this.version(10)
      .stores({
        expenses: 'id, category, date, created_at',
      });

    // v11: Add employees and attendance tables for HR & Payroll
    this.version(11)
      .stores({
        employees: 'id, name, position, status, created_at',
        attendance: 'id, employee_id, date, status, created_at',
      });

    // v12: Add shifts table for shift management
    this.version(12)
      .stores({
        shifts: 'id, name, start_time, end_time, created_at',
        attendance: 'id, employee_id, date, status, shift_id, created_at',
      });

    // v13: Add assigned_employees field to shifts
    this.version(13)
      .stores({
        shifts: 'id, name, start_time, end_time, created_at',
      });

    // v14: Add overtime_hours field to attendance
    this.version(14)
      .stores({
        attendance: 'id, employee_id, date, status, shift_id, created_at',
      });

    // v15: Add employment_type and hourly_rate to employees
    this.version(15)
      .stores({
        employees: 'id, name, position, status, employment_type, created_at',
      });

    // v16: Add bom_type to products and kit_components table
    this.version(16)
      .stores({
        products: 'id, name, category_id, price, bom_type',
        kit_components: 'id, menu_item_id, component_product_id',
      })
      .upgrade(async (tx) => {
        await tx
          .table('products')
          .toCollection()
          .modify((product) => {
            // Set default bom_type for existing products
            if (product.bom_type === undefined) {
              product.bom_type = 'manufacture';
            }
          });
      });

    // v17: Add recipe_history table for audit trail and rollback functionality
    this.version(17)
      .stores({
        recipe_history: 'id, menu_item_id, created_at',
      });

    // v18: Add multi-outlet, self-order, and payment gateway tables
    this.version(18)
      .stores({
        outlets: 'id, code, name, is_active',
        restaurant_tables: 'id, table_number, outlet_id, is_active',
        customer_orders: 'id, table_id, status, payment_status, created_at',
        customer_order_items: 'id, order_id, product_id',
        payment_transactions: 'id, order_id, gateway, status, created_at',
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
    await db.ingredients.clear();
    await db.recipes.clear();
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

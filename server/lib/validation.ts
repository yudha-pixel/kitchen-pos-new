import { z } from 'zod';

export const ORDER_STATUSES = [
  'pending',
  'preparing',
  'ready',
  'served',
  'completed',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Rank of each status in the forward-only lifecycle. 'cancelled' is handled
// separately: any open order may be cancelled.
export const STATUS_RANK: Record<string, number> = {
  pending: 0,
  preparing: 1,
  ready: 2,
  served: 3,
  completed: 4,
};

export const OPEN_STATUSES: OrderStatus[] = ['pending', 'preparing', 'ready', 'served'];

const uuid = z.string().uuid();

export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(500).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

// Auth
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(4).max(100),
  role: z.enum(['admin', 'cashier']).optional(),
});

// Catalog
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().max(30).nullish(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createModifierGroupSchema = z.object({
  name: z.string().min(1).max(100),
  is_required: z.boolean().optional(),
  max_selections: z.number().int().positive().optional(),
});

export const updateModifierGroupSchema = createModifierGroupSchema.partial();

export const createModifierSchema = z.object({
  name: z.string().min(1).max(100),
  price_extra: z.number().nonnegative().optional(),
  modifier_group_id: uuid,
});

export const updateModifierSchema = createModifierSchema.partial();

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  category_id: uuid,
  stock_quantity: z.number().int().nonnegative().optional(),
  image_url: z.string().max(2000).nullish(),
  sku: z.string().max(100).nullish(),
  description: z.string().max(2000).nullish(),
  modifier_group_ids: z.array(uuid).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  is_active: z.boolean().optional(),
});

// Orders
const orderSchema = z.object({
  id: uuid.optional(),
  cashier_id: uuid.nullish(),
  total_amount: z.number().nonnegative(),
  payment_method: z.string().min(1).max(30),
  status: z.enum(ORDER_STATUSES).optional(),
  table_number: z.string().max(30).nullish(),
  discount_amount: z.number().nonnegative().optional(),
  rounding_amount: z.number().optional(),
  notes: z.string().max(1000).nullish(),
  created_at: z.string().optional(),
});

const orderItemSchema = z.object({
  id: uuid.optional(),
  order_id: uuid.optional(),
  product_id: uuid.nullish(),
  quantity: z.number().int().positive(),
  price_at_time: z.number().nonnegative(),
  modifiers_applied: z.array(z.any()).optional(),
  discount_item: z.number().nonnegative().optional(),
  split_group_id: z.string().max(100).nullish(),
  created_at: z.string().optional(),
});

export const createOrderSchema = z.object({
  order: orderSchema,
  items: z.array(orderItemSchema),
});

export const createOrderItemsSchema = z.object({
  items: z.array(orderItemSchema.extend({ order_id: uuid })),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const createVoidLogsSchema = z.object({
  voidLogs: z.array(
    z.object({
      id: uuid.optional(),
      order_id: uuid,
      product_id: uuid.nullish(),
      quantity: z.number().int().positive(),
      reason: z.string().min(1).max(500),
      cashier_id: uuid.nullish(),
      created_at: z.string().optional(),
    })
  ),
});

export const mergeTableSchema = z.object({
  sourceTable: z.string().min(1).max(30),
  targetTable: z.string().min(1).max(30),
});

// Printers
export const createPrinterSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['kitchen', 'bar', 'receipt']),
  ip_address: z.string().max(100).nullish(),
  port: z.number().int().positive().max(65535).nullish(),
});

export const updatePrinterSchema = createPrinterSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const printerRouteSchema = z.object({
  category_id: uuid,
  printer_id: uuid,
});

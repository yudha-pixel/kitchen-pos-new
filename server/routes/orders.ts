import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { auditLogger } from './audit';
import {
  createOrderSchema,
  createOrderItemsSchema,
  createVoidLogsSchema,
  updateOrderStatusSchema,
  mergeTableSchema,
  paginationSchema,
  OPEN_STATUSES,
  STATUS_RANK,
} from '../lib/validation';

const router = Router();

// Thrown when a stock decrement (product or ingredient) cannot be satisfied.
// Thrown from inside prisma.$transaction so Prisma rolls back automatically;
// caught in the route handler to return a 409 instead of a generic 500.
class InsufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientStockError';
  }
}

// Thrown when an order's status was changed by a concurrent request between
// our initial read and the atomic conditional update inside the transaction
// (e.g. two duplicate "cancel" taps, or a status change racing a cancel).
// Whichever request's conditional update actually matched is the one
// responsible for any stock side effects, so the loser aborts here WITHOUT
// touching stock at all - this is what prevents double-restoration.
class OrderStatusConflictError extends Error {
  constructor(fromStatus: string, toStatus: string) {
    super(`Order status was changed concurrently (tried '${fromStatus}' -> '${toStatus}'); please refresh and try again.`);
    this.name = 'OrderStatusConflictError';
  }
}

// Floating-point numbers (JS numbers, Postgres `double precision`) cannot
// represent most decimal fractions exactly, and summing several
// `quantity_required * item.quantity` products (e.g. 0.1 + 0.2) can drift by
// a few units in the last decimal place. Recipe quantities in this system
// are entered with at most 3-4 decimal places (kg/liter/gram), so rounding
// to 6 decimals removes JS/float noise while never discarding real precision.
const STOCK_DECIMALS = 6;
const roundQty = (value: number): number =>
  Math.round(value * 10 ** STOCK_DECIMALS) / 10 ** STOCK_DECIMALS;

// Below this magnitude, a negative stock value is float noise from repeated
// decrements (representation error), not a real shortage - it gets clamped
// back to 0 instead of showing a confusing "-0.000000000004" to the user.
const STOCK_DUST_EPSILON = 1e-6;

// Increments a product's stock_quantity by `quantity` (no-op if <= 0).
async function restoreProductStock(
  tx: Prisma.TransactionClient,
  productId: string,
  quantity: number
): Promise<void> {
  if (quantity <= 0) return;
  await tx.product.update({
    where: { id: productId },
    data: { stock_quantity: { increment: quantity } },
  });
}

// Accumulates the ingredient restoration owed for restoring `quantity` units
// of `productId` into `restoreMap` (ingredient_id -> total qty owed) WITHOUT
// writing to the DB yet. Call `applyIngredientRestoration` once after every
// product touched by a single cancel/void operation has been accumulated -
// this mirrors exactly how POST /orders aggregates `ingredientNeeds` across
// products BEFORE rounding and decrementing once per ingredient. Without
// this aggregation, an ingredient shared by two products would be restored
// via two independently-rounded partial increments instead of one combined
// rounded sum, which can leave a few 1e-6-scale dust after a full
// decrement-then-restore round trip.
async function accumulateIngredientRestoration(
  tx: Prisma.TransactionClient,
  restoreMap: Map<string, number>,
  productId: string,
  quantity: number
): Promise<void> {
  if (quantity <= 0) return;
  const recipes = await tx.recipe.findMany({ where: { menu_item_id: productId } });
  for (const recipe of recipes) {
    const partial = roundQty(recipe.quantity_required * quantity);
    restoreMap.set(
      recipe.ingredient_id,
      roundQty((restoreMap.get(recipe.ingredient_id) ?? 0) + partial)
    );
  }
}

async function applyIngredientRestoration(
  tx: Prisma.TransactionClient,
  restoreMap: Map<string, number>
): Promise<void> {
  for (const [ingredientId, qty] of restoreMap) {
    if (qty <= 0) continue;
    await tx.ingredient.update({
      where: { id: ingredientId },
      data: { current_stock: { increment: qty } },
    });
  }
}

router.get('/orders', authMiddleware, async (req: Request, res: Response) => {
  const { cashierId, status } = req.query;
  const { limit, offset } = paginationSchema.parse(req.query);

  const where: Record<string, string> = {};
  if (cashierId) where.cashier_id = cashierId as string;
  if (status) where.status = status as string;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: limit ?? 100,
    skip: offset ?? 0,
  });

  res.json(orders);
});

// Active orders for the Kitchen Display: one call returns orders still being
// worked on, with items joined to product + category for station filtering.
// Filter orders that have at least one item not completed/cancelled
router.get('/orders/active', authMiddleware, async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          status: { in: ['pending', 'preparing', 'ready', 'served'] },
        },
      },
    },
    include: {
      items: {
        where: {
          status: { in: ['pending', 'preparing', 'ready', 'served'] },
        },
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: { created_at: 'asc' },
  });

  res.json(orders);
});

router.get('/orders/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  res.json(order);
});

router.get('/orders/:id/items', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const items = await prisma.orderItem.findMany({
    where: { order_id: id },
    include: {
      product: {
        include: { category: true },
      },
    },
  });

  res.json(items);
});

router.post('/orders', authMiddleware, async (req: Request, res: Response) => {
  const { order, items } = createOrderSchema.parse(req.body);
  const orderId = order.id ?? randomUUID();

  // Validate stock availability before creating order (early UX check only;
  // the authoritative, race-safe check happens inside the transaction below).
  // Note: Backend uses product.stock_quantity for basic stock validation
  const productIds = items.map(item => item.product_id).filter((id): id is string => id !== null);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  // Check stock availability using product.stock_quantity
  for (const item of items) {
    if (!item.product_id) continue;

    const product = productMap.get(item.product_id);
    if (!product) {
      res.status(404).json({ error: `Product ${item.product_id} not found` });
      return;
    }

    if (product.stock_quantity < item.quantity) {
      res.status(400).json({
        error: `Stok tidak mencukupi untuk ${product.name}. Tersedia: ${product.stock_quantity}, Dibutuhkan: ${item.quantity}`
      });
      return;
    }
  }

  // Recipes (BOM) for every product in this order, used to compute ingredient
  // consumption. Fetched outside the transaction for the early ingredient
  // pre-check; re-verified atomically inside the transaction.
  const recipes = await prisma.recipe.findMany({
    where: { menu_item_id: { in: productIds } },
    include: { ingredient: true },
  });

  const recipesByProduct = new Map<string, typeof recipes>();
  // Ingredient current_stock is already embedded via `include: { ingredient }`
  // above - reused here for the early pre-check so we don't need a second
  // round trip to the ingredients table.
  const ingredientStockMap = new Map<string, number>();
  for (const recipe of recipes) {
    const list = recipesByProduct.get(recipe.menu_item_id) ?? [];
    list.push(recipe);
    recipesByProduct.set(recipe.menu_item_id, list);
    ingredientStockMap.set(recipe.ingredient_id, recipe.ingredient.current_stock);
  }

  // Aggregate total ingredient consumption across all items in this order
  // (multiple items/products can share the same ingredient). Each partial
  // product and the running sum are rounded to neutralize floating-point
  // drift (see roundQty above) before ever being compared/persisted.
  const ingredientNeeds = new Map<string, { quantity: number; name: string; unit: string }>();
  for (const item of items) {
    if (!item.product_id) continue;
    const productRecipes = recipesByProduct.get(item.product_id) ?? [];
    for (const recipe of productRecipes) {
      const required = roundQty(recipe.quantity_required * item.quantity);
      const existing = ingredientNeeds.get(recipe.ingredient_id);
      ingredientNeeds.set(recipe.ingredient_id, {
        quantity: roundQty((existing?.quantity ?? 0) + required),
        name: recipe.ingredient.name,
        unit: recipe.ingredient.unit,
      });
    }
  }

  // Early ingredient stock pre-check (UX only, same spirit as the product
  // pre-check above): lets the cashier see "bahan habis" immediately without
  // waiting for a transaction to open and roll back. Not authoritative - the
  // conditional updateMany inside the transaction below is what actually
  // guarantees correctness under concurrent orders.
  for (const [ingredientId, need] of ingredientNeeds) {
    const available = ingredientStockMap.get(ingredientId) ?? 0;
    if (available < need.quantity) {
      res.status(400).json({
        error: `Stok bahan baku tidak mencukupi untuk ${need.name}. Tersedia: ${roundQty(available)} ${need.unit}, Dibutuhkan: ${need.quantity} ${need.unit}`
      });
      return;
    }
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.upsert({
        where: { id: orderId },
        // Re-sync of an offline order must be able to correct amounts/details,
        // but must not clobber status progress already made by the kitchen.
        update: {
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          table_number: order.table_number ?? null,
          discount_amount: order.discount_amount ?? 0,
          rounding_amount: order.rounding_amount ?? 0,
          notes: order.notes ?? null,
        },
        create: {
          id: orderId,
          cashier_id: req.user?.id ?? order.cashier_id ?? null,
          total_amount: order.total_amount,
          payment_method: order.payment_method,
          status: order.status ?? 'pending',
          table_number: order.table_number ?? null,
          discount_amount: order.discount_amount ?? 0,
          rounding_amount: order.rounding_amount ?? 0,
          notes: order.notes ?? null,
          created_at: order.created_at ? new Date(order.created_at) : new Date(),
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => ({
          id: item.id ?? randomUUID(),
          order_id: newOrder.id,
          product_id: item.product_id ?? null,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
          modifiers_applied: item.modifiers_applied ?? [],
          discount_item: item.discount_item ?? 0,
          split_group_id: item.split_group_id ?? null,
          status: item.status ?? 'pending',
          created_at: item.created_at ? new Date(item.created_at) : new Date(),
        })),
        skipDuplicates: true,
      });

      // Reduce stock for each product. Uses a conditional updateMany
      // (decrement only if stock_quantity >= requested quantity) so
      // concurrent orders can't both pass a stale pre-check and oversell the
      // same product; if the row doesn't match, count is 0 and we abort the
      // whole transaction (Prisma rolls back automatically on throw).
      for (const item of items) {
        if (!item.product_id) continue;

        const product = productMap.get(item.product_id);
        if (!product) continue;

        const result = await tx.product.updateMany({
          where: {
            id: item.product_id,
            stock_quantity: { gte: item.quantity },
          },
          data: {
            stock_quantity: { decrement: item.quantity },
          },
        });

        if (result.count === 0) {
          // Row didn't match `gte` (another concurrent order won the race, or
          // the pre-check above is now stale) - re-read to report the actual
          // current figure instead of a vague message.
          const current = await tx.product.findUnique({
            where: { id: item.product_id },
            select: { stock_quantity: true },
          });
          throw new InsufficientStockError(
            `Stok tidak mencukupi untuk ${product.name}. Tersedia: ${current?.stock_quantity ?? 0}, Dibutuhkan: ${item.quantity}`
          );
        }
      }

      // Reduce ingredient stock (BOM/Recipe) using the same atomic,
      // conditional-update pattern so ingredient stock can never go negative
      // even under concurrent orders.
      for (const [ingredientId, need] of ingredientNeeds) {
        const result = await tx.ingredient.updateMany({
          where: {
            id: ingredientId,
            current_stock: { gte: need.quantity },
          },
          data: {
            current_stock: { decrement: need.quantity },
          },
        });

        if (result.count === 0) {
          const current = await tx.ingredient.findUnique({
            where: { id: ingredientId },
            select: { current_stock: true },
          });
          throw new InsufficientStockError(
            `Stok bahan baku tidak mencukupi untuk ${need.name}. ` +
            `Tersedia: ${roundQty(current?.current_stock ?? 0)} ${need.unit}, Dibutuhkan: ${need.quantity} ${need.unit}`
          );
        }

        // Defensive cleanup: repeated float decrements accumulate binary
        // floating-point representation error across many orders (verified:
        // 10 sequential decrements of 0.1 from 1.0 land on 1.3877e-16, not
        // exactly 0 - Postgres double precision arithmetic, same IEEE754
        // issue as JS, drifts in *either* direction). Since this dust is far
        // smaller than any real recipe/ingredient unit in use (min 0.001),
        // clamp it to exactly 0 so reports/UI never show a stray
        // "0.0000000000001" or "-0.0000000000001".
        const updated = await tx.ingredient.findUnique({
          where: { id: ingredientId },
          select: { current_stock: true },
        });
        if (updated && updated.current_stock !== 0 && Math.abs(updated.current_stock) < STOCK_DUST_EPSILON) {
          await tx.ingredient.update({
            where: { id: ingredientId },
            data: { current_stock: 0 },
          });
        }
      }

      return newOrder;
    });

    res.json(created);
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
});

router.patch('/orders/:id/status', authMiddleware, auditLogger('update', 'order'), async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = updateOrderStatusSchema.parse(req.body);

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (existing.status === status) {
    res.json(existing);
    return;
  }

  const isOpen = (OPEN_STATUSES as string[]).includes(existing.status);
  const movesForward =
    STATUS_RANK[status] !== undefined &&
    STATUS_RANK[existing.status] !== undefined &&
    STATUS_RANK[status] > STATUS_RANK[existing.status];

  // Open orders may move forward in the lifecycle or be cancelled; closed
  // orders (completed/cancelled) are terminal.
  if (!isOpen || (status !== 'cancelled' && !movesForward)) {
    res.status(409).json({
      error: `Cannot change order status from '${existing.status}' to '${status}'`,
    });
    return;
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // Atomic conditional update: guards against a concurrent request
      // (e.g. two duplicate cancel taps racing each other, or any other
      // status change racing this one) having already moved the order to a
      // different status between our read above and this transaction. Under
      // Postgres READ COMMITTED, an UPDATE re-checks its WHERE clause against
      // the current committed row once it acquires the row lock, so if two
      // concurrent transactions target the same row, only the one whose
      // WHERE still matches at that point succeeds - exactly the same
      // conditional-updateMany pattern used for stock decrements in
      // POST /orders, applied here to the order row itself. The loser gets
      // count === 0 and aborts WITHOUT touching stock, which is what
      // prevents double-restoration on a cancel race.
      const result = await tx.order.updateMany({
        where: { id, status: existing.status },
        data: { status },
      });

      if (result.count === 0) {
        throw new OrderStatusConflictError(existing.status, status);
      }

      const order = await tx.order.findUniqueOrThrow({ where: { id } });

      if (status === 'cancelled') {
        const items = await tx.orderItem.findMany({ where: { order_id: id } });
        const voidLogs = await tx.orderVoidLog.findMany({ where: { order_id: id } });

        // Some items may have already been individually voided (partial
        // cancellation, e.g. a spilled drink) before the whole order is
        // cancelled. Those quantities already had their stock restored by
        // POST /void-logs - restoring them again here would over-credit
        // stock. Only the quantity NOT already voided per product gets
        // restored on full order cancellation.
        const orderedByProduct = new Map<string, number>();
        for (const item of items) {
          if (!item.product_id) continue;
          orderedByProduct.set(
            item.product_id,
            (orderedByProduct.get(item.product_id) ?? 0) + item.quantity
          );
        }

        const voidedByProduct = new Map<string, number>();
        for (const log of voidLogs) {
          if (!log.product_id) continue;
          voidedByProduct.set(
            log.product_id,
            (voidedByProduct.get(log.product_id) ?? 0) + log.quantity
          );
        }

        // Ingredient restoration is aggregated across every product in the
        // order (see accumulateIngredientRestoration) so an ingredient
        // shared by multiple products is restored as one combined rounded
        // sum - the exact numeric inverse of how POST /orders aggregates
        // ingredientNeeds before decrementing.
        const restoreMap = new Map<string, number>();
        for (const [productId, orderedQty] of orderedByProduct) {
          const alreadyVoided = voidedByProduct.get(productId) ?? 0;
          const remaining = Math.max(0, orderedQty - alreadyVoided);
          await restoreProductStock(tx, productId, remaining);
          await accumulateIngredientRestoration(tx, restoreMap, productId, remaining);
        }
        await applyIngredientRestoration(tx, restoreMap);
      }

      return order;
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof OrderStatusConflictError) {
      res.status(409).json({ error: error.message });
      return;
    }
    throw error;
  }
});

router.post('/order-items', authMiddleware, async (req: Request, res: Response) => {
  const { items } = createOrderItemsSchema.parse(req.body);

  await prisma.orderItem.createMany({
    data: items.map((item) => ({
      id: item.id ?? randomUUID(),
      order_id: item.order_id,
      product_id: item.product_id ?? null,
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      modifiers_applied: item.modifiers_applied ?? [],
      discount_item: item.discount_item ?? 0,
      split_group_id: item.split_group_id ?? null,
      status: item.status ?? 'pending',
      created_at: item.created_at ? new Date(item.created_at) : new Date(),
    })),
    skipDuplicates: true,
  });

  res.json({ success: true });
});

router.patch('/order-items/:id/status', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = updateOrderStatusSchema.parse(req.body);

  const existing = await prisma.orderItem.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Order item not found' });
    return;
  }

  if (existing.status === status) {
    res.json(existing);
    return;
  }

  const updated = await prisma.orderItem.update({
    where: { id },
    data: { status },
  });

  res.json(updated);
});

router.post('/void-logs', authMiddleware, auditLogger('void', 'order'), async (req: Request, res: Response) => {
  const { voidLogs } = createVoidLogsSchema.parse(req.body);

  await prisma.$transaction(async (tx) => {
    // Aggregated across the whole batch (see accumulateIngredientRestoration)
    // so an ingredient shared by two different voided products in the same
    // request is restored as one combined rounded sum, not two independently
    // rounded partials.
    const restoreMap = new Map<string, number>();

    for (const log of voidLogs) {
      const logId = log.id ?? randomUUID();

      // Idempotency guard: useSyncManager replays queued void logs with
      // retry/backoff on failure, and offline orders can be re-synced more
      // than once. Two truly concurrent requests submitting the SAME void
      // log id could also both pass a plain `findUnique` pre-check before
      // either commits (each sees "not found" under READ COMMITTED snapshot
      // isolation) - a naive create() would then throw P2002 on the loser.
      // Worse, catching that P2002 in JS does NOT recover the underlying
      // Postgres transaction: once any statement inside a transaction block
      // hits a constraint violation, Postgres marks the WHOLE transaction
      // aborted (25P02 "current transaction is aborted") and every
      // subsequent statement fails too, even if the JS exception was caught
      // (verified empirically - see audit notes). createMany with
      // skipDuplicates compiles to `ON CONFLICT DO NOTHING`, which never
      // raises an error at all, so this is safe under real concurrency.
      const insertResult = await tx.orderVoidLog.createMany({
        data: [{
          id: logId,
          order_id: log.order_id,
          product_id: log.product_id ?? null,
          quantity: log.quantity,
          reason: log.reason,
          cashier_id: req.user?.id ?? log.cashier_id ?? null,
          created_at: log.created_at ? new Date(log.created_at) : new Date(),
        }],
        skipDuplicates: true,
      });
      if (insertResult.count === 0) continue; // already recorded - restore already happened

      if (!log.product_id) continue;

      // If the parent order was already fully cancelled, PATCH
      // /orders/:id/status already restored every unit for this product
      // (see the ordered-minus-voided calculation there). Restoring again
      // here for a void log logged after the fact would over-credit stock.
      // Void logs against a 'completed' order (e.g. post-sale spoilage/
      // return) are a different, legitimate case and still restore normally.
      const order = await tx.order.findUnique({
        where: { id: log.order_id },
        select: { status: true },
      });
      if (order?.status === 'cancelled') continue;

      await restoreProductStock(tx, log.product_id, log.quantity);
      await accumulateIngredientRestoration(tx, restoreMap, log.product_id, log.quantity);
    }

    await applyIngredientRestoration(tx, restoreMap);
  });

  res.json({ success: true });
});

router.post('/orders/merge-table', authMiddleware, async (req: Request, res: Response) => {
  const { sourceTable, targetTable } = mergeTableSchema.parse(req.body);

  const result = await prisma.order.updateMany({
    where: {
      table_number: sourceTable,
      status: { in: OPEN_STATUSES },
    },
    data: { table_number: targetTable },
  });

  res.json({ success: true, mergedOrders: result.count });
});

export default router;

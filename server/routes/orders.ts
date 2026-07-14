import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
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
router.get('/orders/active', authMiddleware, async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { status: { in: ['pending', 'preparing'] } },
    include: {
      items: {
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
        created_at: item.created_at ? new Date(item.created_at) : new Date(),
      })),
      skipDuplicates: true,
    });

    return newOrder;
  });

  res.json(created);
});

router.patch('/orders/:id/status', authMiddleware, async (req: Request, res: Response) => {
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

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
  });

  res.json(updated);
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
      created_at: item.created_at ? new Date(item.created_at) : new Date(),
    })),
    skipDuplicates: true,
  });

  res.json({ success: true });
});

router.post('/void-logs', authMiddleware, async (req: Request, res: Response) => {
  const { voidLogs } = createVoidLogsSchema.parse(req.body);

  await prisma.orderVoidLog.createMany({
    data: voidLogs.map((log) => ({
      id: log.id ?? randomUUID(),
      order_id: log.order_id,
      product_id: log.product_id ?? null,
      quantity: log.quantity,
      reason: log.reason,
      cashier_id: req.user?.id ?? log.cashier_id ?? null,
      created_at: log.created_at ? new Date(log.created_at) : new Date(),
    })),
    skipDuplicates: true,
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

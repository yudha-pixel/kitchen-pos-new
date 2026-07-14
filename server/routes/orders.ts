import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/orders', async (req: Request, res: Response) => {
  const { cashierId, status } = req.query;
  const where: any = {};
  if (cashierId) where.cashier_id = cashierId as string;
  if (status) where.status = status as string;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });

  res.json(orders);
});

router.get('/orders/:id/items', async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const items = await prisma.orderItem.findMany({
    where: { order_id: id },
  });

  res.json(items);
});

router.post('/orders', authMiddleware, async (req: Request, res: Response) => {
  const { order, items } = req.body as {
    order: any;
    items: any[];
  };

  if (!order || !Array.isArray(items)) {
    res.status(400).json({ error: 'Order and items are required' });
    return;
  }

  const created = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.upsert({
      where: { id: order.id },
      update: {},
      create: {
        id: order.id,
        cashier_id: req.user?.id ?? order.cashier_id ?? null,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        status: order.status || 'completed',
        table_number: order.table_number ?? null,
        discount_amount: order.discount_amount ?? 0,
        rounding_amount: order.rounding_amount ?? 0,
        notes: order.notes ?? null,
        created_at: order.created_at ? new Date(order.created_at) : new Date(),
      },
    });

    await tx.orderItem.createMany({
      data: items.map((item) => ({
        id: item.id,
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
  const { status } = req.body;

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
  });

  res.json(updated);
});

router.post('/order-items', authMiddleware, async (req: Request, res: Response) => {
  const { items } = req.body as { items: any[] };
  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Items array is required' });
    return;
  }

  await prisma.orderItem.createMany({
    data: items.map((item) => ({
      id: item.id,
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
  const { voidLogs } = req.body as { voidLogs: any[] };
  if (!Array.isArray(voidLogs)) {
    res.status(400).json({ error: 'voidLogs array is required' });
    return;
  }

  await prisma.orderVoidLog.createMany({
    data: voidLogs.map((log) => ({
      id: log.id,
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
  const { sourceTable, targetTable } = req.body;
  if (!sourceTable || !targetTable) {
    res.status(400).json({ error: 'sourceTable and targetTable are required' });
    return;
  }

  await prisma.order.updateMany({
    where: {
      table_number: sourceTable,
      status: 'pending',
    },
    data: { table_number: targetTable },
  });

  res.json({ success: true });
});

export default router;

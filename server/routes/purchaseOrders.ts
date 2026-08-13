import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

const createPurchaseOrderSchema = z.object({
  quotation_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid(),
  expected_delivery: z.string().datetime().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    ingredient_id: z.string().uuid(),
    ingredient_name: z.string(),
    quantity: z.number().positive(),
    unit: z.string(),
    unit_price: z.number().positive(),
  })),
});

// GET /purchase-orders - List with filters
router.get('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const { status, supplier_id } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (supplier_id) where.supplier_id = supplier_id as string;

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        quotation: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { order_date: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const isUUID = (str: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

const resolvePOId = async (id: string): Promise<string | null> => {
  if (isUUID(id)) return id;
  const found = await prisma.purchaseOrder.findFirst({ where: { po_number: id }, select: { id: true } });
  return found?.id || null;
};

// GET /purchase-orders/:id - Get details with items
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = isUUID(rawId)
      ? await prisma.purchaseOrder.findUnique({
          where: { id: rawId },
          include: {
            supplier: true,
            quotation: true,
            items: {
              include: {
                ingredient: true,
              },
            },
            goodsReceivedNotes: true,
          },
        })
      : await prisma.purchaseOrder.findFirst({
          where: { po_number: rawId },
          include: {
            supplier: true,
            quotation: true,
            items: {
              include: {
                ingredient: true,
              },
            },
            goodsReceivedNotes: true,
          },
        });

    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /purchase-orders - Create from quotation
router.post('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.create), async (req: Request, res: Response) => {
  try {
    const data = createPurchaseOrderSchema.parse(req.body);

    // Calculate totals
    let subtotal = 0;
    const items = data.items.map(item => {
      const total = item.quantity * item.unit_price;
      subtotal += total;
      return {
        ...item,
        total_price: total,
      };
    });

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const { generateNextSequenceNumber } = await import('../lib/sequence');
    const po_number = await generateNextSequenceNumber('po');

    const order = await prisma.purchaseOrder.create({
      data: {
        po_number,
        quotation_id: data.quotation_id,
        supplier_id: data.supplier_id,
        expected_delivery: data.expected_delivery ? new Date(data.expected_delivery) : null,
        payment_terms: data.payment_terms,
        subtotal,
        tax,
        total,
        notes: data.notes,
        status: 'draft',
        items: {
          create: items,
        },
      },
      include: {
        supplier: true,
        quotation: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /purchase-orders/:id/review - Manager review
router.patch('/:id/review', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    const order = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    if (order.status !== 'draft') {
      return res.status(400).json({ error: 'Purchase order is not in draft status' });
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        reviewed_by: userId,
        reviewed_at: new Date(),
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error reviewing purchase order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /purchase-orders/:id/send - Send to supplier
router.patch('/:id/send', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const order = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    if (order.status !== 'draft') {
      return res.status(400).json({ error: 'Purchase order must be in draft status' });
    }

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'sent',
        sent_at: new Date(),
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error sending purchase order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /purchase-orders/:id/acknowledge - Supplier acknowledgement
router.patch('/:id/acknowledge', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'acknowledged',
        acknowledged_at: new Date(),
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    res.json(order);
  } catch (error) {
    console.error('Error acknowledging purchase order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /purchase-orders/:id/cancel - Cancel PO
router.patch('/:id/cancel', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        supplier: true,
      },
    });

    res.json(order);
  } catch (error) {
    console.error('Error cancelling purchase order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

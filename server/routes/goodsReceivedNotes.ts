import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

const createGRNSchema = z.object({
  purchase_order_id: z.string().uuid(),
  delivery_note: z.string().optional(),
  items: z.array(z.object({
    ingredient_id: z.string().uuid(),
    ingredient_name: z.string(),
    ordered_qty: z.number().positive(),
    received_qty: z.number().positive(),
    unit: z.string(),
    batch_number: z.string().optional(),
    expiry_date: z.string().datetime().optional(),
  })),
});

// Generate GRN number
const generateGRNNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `GRN-${year}${month}-${random}`;
};

// GET /goods-received-notes - List with filters
router.get('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const { status, purchase_order_id, supplier_id } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (purchase_order_id) where.purchase_order_id = purchase_order_id as string;
    if (supplier_id) where.supplier_id = supplier_id as string;

    const grns = await prisma.goodsReceivedNote.findMany({
      where,
      include: {
        purchase_order: {
          include: {
            supplier: true,
          },
        },
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { received_date: 'desc' },
    });

    res.json(grns);
  } catch (error) {
    console.error('Error fetching goods received notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /goods-received-notes/:id - Get details with items
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const grn = await prisma.goodsReceivedNote.findUnique({
      where: { id },
      include: {
        purchase_order: {
          include: {
            supplier: true,
            items: true,
          },
        },
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
        invoices: true,
      },
    });

    if (!grn) {
      return res.status(404).json({ error: 'Goods received note not found' });
    }

    res.json(grn);
  } catch (error) {
    console.error('Error fetching goods received note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /goods-received-notes - Create from PO
router.post('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.receive), async (req: Request, res: Response) => {
  try {
    const data = createGRNSchema.parse(req.body);
    const userId = req.user?.id;
    const username = req.user?.username;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: data.purchase_order_id },
      include: { supplier: true },
    });
    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    if (purchaseOrder.status !== 'sent' && purchaseOrder.status !== 'acknowledged') {
      return res.status(400).json({ error: 'Purchase order must be sent or acknowledged' });
    }

    const grn = await prisma.goodsReceivedNote.create({
      data: {
        grn_number: generateGRNNumber(),
        purchase_order_id: data.purchase_order_id,
        supplier_id: purchaseOrder.supplier_id,
        received_by: userId || '',
        received_by_name: username ?? 'Unknown',
        delivery_note: data.delivery_note,
        status: 'pending',
        items: {
          create: data.items.map(item => ({
            ...item,
            quality_status: 'pending',
            expiry_date: item.expiry_date ? new Date(item.expiry_date) : null,
          })),
        },
      },
      include: {
        purchase_order: {
          include: {
            supplier: true,
          },
        },
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    res.status(201).json(grn);
  } catch (error) {
    console.error('Error creating goods received note:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /goods-received-notes/:id/quality-check - Perform quality check
router.patch('/:id/quality-check', authMiddleware, requirePermission(PERMISSIONS.purchasing.receive), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;
    const { items, notes } = req.body;

    const grn = await prisma.goodsReceivedNote.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!grn) {
      return res.status(404).json({ error: 'Goods received note not found' });
    }
    if (grn.status !== 'pending') {
      return res.status(400).json({ error: 'GRN is not pending quality check' });
    }

    // Update items with quality status
    for (const item of items) {
      await prisma.goodsReceivedNoteItem.update({
        where: { id: item.id },
        data: {
          quality_status: item.quality_status,
          rejection_reason: item.rejection_reason,
          batch_number: item.batch_number,
          expiry_date: item.expiry_date ? new Date(item.expiry_date) : null,
        },
      });

      // Update stock for approved items
      if (item.quality_status === 'approved' && !item.stock_updated) {
        await prisma.ingredient.update({
          where: { id: item.ingredient_id },
          data: { current_stock: { increment: item.received_qty } },
        });

        await prisma.goodsReceivedNoteItem.update({
          where: { id: item.id },
          data: { stock_updated: true },
        });
      }
    }

    const updatedGRN = await prisma.goodsReceivedNote.update({
      where: { id },
      data: {
        status: 'quality_check',
        quality_checked_by: userId,
        quality_checked_at: new Date(),
        quality_notes: notes,
      },
      include: {
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    res.json(updatedGRN);
  } catch (error) {
    console.error('Error performing quality check:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /goods-received-notes/:id/complete - Complete GRN
router.patch('/:id/complete', authMiddleware, requirePermission(PERMISSIONS.purchasing.receive), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const grn = await prisma.goodsReceivedNote.update({
      where: { id },
      data: { status: 'completed' },
      include: {
        purchase_order: true,
        supplier: true,
        items: true,
      },
    });

    // Update PO status
    await prisma.purchaseOrder.update({
      where: { id: grn.purchase_order_id },
      data: { status: 'received' },
    });

    res.json(grn);
  } catch (error) {
    console.error('Error completing goods received note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /goods-received-notes/:id/cancel - Cancel GRN
router.patch('/:id/cancel', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const grn = await prisma.goodsReceivedNote.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        supplier: true,
      },
    });

    res.json(grn);
  } catch (error) {
    console.error('Error cancelling goods received note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

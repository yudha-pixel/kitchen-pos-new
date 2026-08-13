import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// GET /api/event-stock-transfers - List all event stock transfers
router.get('/', authMiddleware, requirePermission(PERMISSIONS.events.manageStock), async (req: Request, res: Response) => {
  try {
    const { event_id, status } = req.query;
    
    const where: any = {};
    if (event_id) where.event_id = event_id;
    if (status && status !== 'all') where.status = status;

    const transfers = await prisma.eventStockTransfer.findMany({
      where,
      include: {
        event: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(transfers);
  } catch (error) {
    console.error('Error fetching event stock transfers:', error);
    res.status(500).json({ error: 'Failed to fetch event stock transfers' });
  }
});

// GET /api/event-stock-transfers/:id - Get single transfer
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.events.manageStock), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const transfer = await prisma.eventStockTransfer.findUnique({
      where: { id },
      include: {
        event: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({ error: 'Failed to fetch transfer' });
  }
});

// POST /api/event-stock-transfers - Create new stock transfer
router.post('/', authMiddleware, requirePermission(PERMISSIONS.events.manageStock), async (req: Request, res: Response) => {
  try {
    const { event_id, from_warehouse_id, items, notes } = req.body;
    const userId = (req as any).user?.id;

    // Validate required fields
    if (!event_id || !from_warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: event_id, from_warehouse_id, items' 
      });
    }

    // Check if event exists and is not closed
    const event = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status === 'closed') {
      return res.status(400).json({ error: 'Cannot transfer stock to closed event' });
    }

    // Generate transfer number
    const lastTransfer = await prisma.eventStockTransfer.findFirst({
      orderBy: { created_at: 'desc' },
      select: { transfer_number: true },
    });

    let nextNumber = 1;
    if (lastTransfer && lastTransfer.transfer_number) {
      const lastNum = parseInt(lastTransfer.transfer_number.replace('TRANSFER-EVENT-', ''));
      nextNumber = lastNum + 1;
    }

    const transfer_number = `TRANSFER-EVENT-${String(nextNumber).padStart(3, '0')}`;

    // Create transfer with items
    const transfer = await prisma.eventStockTransfer.create({
      data: {
        event_id,
        from_warehouse_id,
        transfer_number,
        requested_by: userId,
        notes,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
      },
      include: {
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ error: 'Failed to create transfer' });
  }
});

// POST /api/event-stock-transfers/:id/approve - Approve transfer
router.post('/:id/approve', authMiddleware, requirePermission(PERMISSIONS.events.manageStock), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const transfer = await prisma.eventStockTransfer.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending transfers can be approved' });
    }

    // Update transfer status
    const updatedTransfer = await prisma.eventStockTransfer.update({
      where: { id },
      data: {
        status: 'approved',
        approved_by: userId,
        approved_at: new Date(),
      },
    });

    // Create/update event stock entries
    for (const item of transfer.items) {
      const existingEventStock = await prisma.eventStock.findUnique({
        where: {
          event_id_ingredient_id: {
            event_id: transfer.event_id,
            ingredient_id: item.ingredient_id,
          },
        },
      });

      if (existingEventStock) {
        await prisma.eventStock.update({
          where: { id: existingEventStock.id },
          data: {
            quantity_allocated: {
              increment: item.quantity,
            },
          },
        });
      } else {
        await prisma.eventStock.create({
          data: {
            event_id: transfer.event_id,
            ingredient_id: item.ingredient_id,
            quantity_allocated: item.quantity,
            unit: item.unit,
          },
        });
      }
    }

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Error approving transfer:', error);
    res.status(500).json({ error: 'Failed to approve transfer' });
  }
});

// POST /api/event-stock-transfers/:id/complete - Mark transfer as completed
router.post('/:id/complete', authMiddleware, requirePermission(PERMISSIONS.events.manageStock), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.eventStockTransfer.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    if (transfer.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved transfers can be completed' });
    }

    // Deduct from main warehouse stock
    for (const item of transfer.items) {
      await prisma.ingredient.update({
        where: { id: item.ingredient_id },
        data: {
          current_stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Update transfer status
    const updatedTransfer = await prisma.eventStockTransfer.update({
      where: { id },
      data: { status: 'completed' },
    });

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Error completing transfer:', error);
    res.status(500).json({ error: 'Failed to complete transfer' });
  }
});

// POST /api/event-stock-transfers/:id/cancel - Cancel transfer
router.post('/:id/cancel', authMiddleware, requirePermission(PERMISSIONS.events.manageStock), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const transfer = await prisma.eventStockTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    if (transfer.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed transfer' });
    }

    const updatedTransfer = await prisma.eventStockTransfer.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Error cancelling transfer:', error);
    res.status(500).json({ error: 'Failed to cancel transfer' });
  }
});

export default router;

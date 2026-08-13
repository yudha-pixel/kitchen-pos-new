import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// PATCH /api/event-stocks/:id - Update event stock (e.g., quantity_used)
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity_used, quantity_returned, quantity_damaged } = req.body;

    const eventStock = await prisma.eventStock.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!eventStock) {
      return res.status(404).json({ error: 'Event stock not found' });
    }

    if (eventStock.event.status === 'closed') {
      return res.status(400).json({ error: 'Cannot update stock for closed event' });
    }

    const updateData: any = {};
    if (quantity_used !== undefined) updateData.quantity_used = quantity_used;
    if (quantity_returned !== undefined) updateData.quantity_returned = quantity_returned;
    if (quantity_damaged !== undefined) updateData.quantity_damaged = quantity_damaged;

    const updated = await prisma.eventStock.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating event stock:', error);
    res.status(500).json({ error: 'Failed to update event stock' });
  }
});

export default router;

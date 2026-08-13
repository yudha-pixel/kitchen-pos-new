import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// GET /api/event-operational-costs - List all operational costs
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { event_id, category } = req.query;
    
    const where: any = {};
    if (event_id) where.event_id = event_id;
    if (category && category !== 'all') where.category = category;

    const costs = await prisma.eventOperationalCost.findMany({
      where,
      include: {
        event: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(costs);
  } catch (error) {
    console.error('Error fetching operational costs:', error);
    res.status(500).json({ error: 'Failed to fetch operational costs' });
  }
});

// POST /api/event-operational-costs - Create new operational cost
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { event_id, category, description, amount, receipt_url } = req.body;
    const userId = (req as any).user?.id;

    // Validate required fields
    if (!event_id || !category || !description || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: event_id, category, description, amount' 
      });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: event_id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status === 'closed') {
      return res.status(400).json({ error: 'Cannot add costs to closed event' });
    }

    const cost = await prisma.eventOperationalCost.create({
      data: {
        event_id,
        category,
        description,
        amount,
        receipt_url,
        created_by: userId,
      },
    });

    res.status(201).json(cost);
  } catch (error) {
    console.error('Error creating operational cost:', error);
    res.status(500).json({ error: 'Failed to create operational cost' });
  }
});

// DELETE /api/event-operational-costs/:id - Delete operational cost
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cost = await prisma.eventOperationalCost.findUnique({
      where: { id },
      include: { event: true },
    });

    if (!cost) {
      return res.status(404).json({ error: 'Cost not found' });
    }

    if (cost.event.status === 'closed') {
      return res.status(400).json({ error: 'Cannot delete costs from closed event' });
    }

    await prisma.eventOperationalCost.delete({
      where: { id },
    });

    res.json({ message: 'Operational cost deleted successfully' });
  } catch (error) {
    console.error('Error deleting operational cost:', error);
    res.status(500).json({ error: 'Failed to delete operational cost' });
  }
});

export default router;

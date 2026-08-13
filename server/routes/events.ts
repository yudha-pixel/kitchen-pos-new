import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// GET /api/events - List all events
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
        { event_code: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        eventStock: {
          include: {
            ingredient: true,
          },
        },
        eventCosts: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/active - Get active events for POS (cashier accessible)
router.get('/active', authMiddleware, async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        event_code: true,
        start_date: true,
        end_date: true,
        location: true,
      },
      orderBy: { start_date: 'asc' },
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching active events:', error);
    res.status(500).json({ error: 'Failed to fetch active events' });
  }
});

// GET /api/events/:id - Get single event
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventStock: {
          include: {
            ingredient: true,
          },
        },
        eventCosts: true,
        stockTransfers: {
          include: {
            items: {
              include: {
                ingredient: true,
              },
            },
          },
        },
        orders: {
          take: 10,
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events - Create new event
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, location, start_date, end_date, description, total_budget } = req.body;
    const userId = (req as any).user?.id;

    // Validate required fields
    if (!name || !location || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, location, start_date, end_date' 
      });
    }

    // Validate dates
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ 
        error: 'Start date must be before end date' 
      });
    }

    // Generate event code
    const lastEvent = await prisma.event.findFirst({
      orderBy: { created_at: 'desc' },
      select: { event_code: true },
    });

    let nextNumber = 1;
    if (lastEvent && lastEvent.event_code) {
      const lastNum = parseInt(lastEvent.event_code.replace('EVENT-', ''));
      nextNumber = lastNum + 1;
    }

    const event_code = `EVENT-${String(nextNumber).padStart(3, '0')}`;

    const event = await prisma.event.create({
      data: {
        event_code,
        name,
        location,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        description,
        total_budget,
        created_by: userId,
        status: 'planned',
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PATCH /api/events/:id - Update event
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, start_date, end_date, description, total_budget, status } = req.body;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Prevent editing closed events
    if (existingEvent.status === 'closed') {
      return res.status(400).json({ error: 'Cannot edit closed event' });
    }

    // Validate dates if provided
    if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ 
        error: 'Start date must be before end date' 
      });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(location && { location }),
        ...(start_date && { start_date: new Date(start_date) }),
        ...(end_date && { end_date: new Date(end_date) }),
        ...(description !== undefined && { description }),
        ...(total_budget !== undefined && { total_budget }),
        ...(status && { status }),
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Prevent deleting active or closed events
    if (existingEvent.status === 'active' || existingEvent.status === 'closed') {
      return res.status(400).json({ 
        error: 'Cannot delete active or closed event' 
      });
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/:id/activate - Activate event
router.post('/:id/activate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.update({
      where: { id },
      data: { status: 'active' },
    });

    res.json(event);
  } catch (error) {
    console.error('Error activating event:', error);
    res.status(500).json({ error: 'Failed to activate event' });
  }
});

// POST /api/events/:id/close - Close event
router.post('/:id/close', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock_returns, stock_damaged } = req.body;
    const userId = (req as any).user?.id;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        eventStock: true,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.status !== 'active') {
      return res.status(400).json({ error: 'Only active events can be closed' });
    }

    // Calculate actual revenue from orders
    const orders = await prisma.order.findMany({
      where: { event_id: id, status: 'completed' },
    });

    const actual_revenue = orders.reduce((sum: number, order: any) => sum + order.total_amount, 0);

    // Calculate actual cost from operational costs
    const costs = await prisma.eventOperationalCost.findMany({
      where: { event_id: id },
    });

    const actual_cost = costs.reduce((sum: number, cost: any) => sum + cost.amount, 0);

    // Process stock returns and damage records if provided
    if (stock_returns && Array.isArray(stock_returns)) {
      for (const returnItem of stock_returns) {
        const { event_stock_id, quantity_returned } = returnItem;
        
        // Update event stock with returned quantity
        await prisma.eventStock.update({
          where: { id: event_stock_id },
          data: { quantity_returned: { increment: quantity_returned } },
        });

        // Get the event stock to find ingredient and main warehouse
        const eventStock = await prisma.eventStock.findUnique({
          where: { id: event_stock_id },
          include: { ingredient: true },
        });

        if (eventStock && eventStock.ingredient) {
          // Return stock to main warehouse
          await prisma.ingredient.update({
            where: { id: eventStock.ingredient_id },
            data: { current_stock: { increment: quantity_returned } },
          });
        }
      }
    }

    if (stock_damaged && Array.isArray(stock_damaged)) {
      for (const damageItem of stock_damaged) {
        const { event_stock_id, quantity_damaged, reason } = damageItem;
        
        // Update event stock with damaged quantity
        await prisma.eventStock.update({
          where: { id: event_stock_id },
          data: { quantity_damaged: { increment: quantity_damaged } },
        });
      }
    }

    // Close the event
    const event = await prisma.event.update({
      where: { id },
      data: {
        status: 'closed',
        actual_revenue,
        actual_cost,
        closed_at: new Date(),
        closed_by: userId,
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Error closing event:', error);
    res.status(500).json({ error: 'Failed to close event' });
  }
});

// GET /api/events/:id/stock - Get event stock
router.get('/:id/stock', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const eventStock = await prisma.eventStock.findMany({
      where: { event_id: id },
      include: {
        ingredient: true,
      },
    });

    res.json(eventStock);
  } catch (error) {
    console.error('Error fetching event stock:', error);
    res.status(500).json({ error: 'Failed to fetch event stock' });
  }
});

export default router;

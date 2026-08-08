import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = express.Router();

// GET /kitchen/stations - Get all kitchen stations
router.get('/stations', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { outlet_id, is_active } = req.query;

    const where: any = {};
    if (outlet_id) where.outlet_id = outlet_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const stations = await prisma.kitchenStation.findMany({
      where,
      include: {
        outlet: true,
        menuCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(stations);
  } catch (error) {
    console.error('Error fetching kitchen stations:', error);
    res.status(500).json({ error: 'Failed to fetch kitchen stations' });
  }
});

// POST /kitchen/stations - Create kitchen station (admin only)
router.post('/stations', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { name, code, description, outlet_id, is_active } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const station = await prisma.kitchenStation.create({
      data: {
        name,
        code,
        description,
        outlet_id,
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    res.status(201).json(station);
  } catch (error) {
    console.error('Error creating kitchen station:', error);
    res.status(500).json({ error: 'Failed to create kitchen station' });
  }
});

// PUT /kitchen/stations/:id - Update kitchen station (admin only)
router.put('/stations/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, description, outlet_id, is_active } = req.body;

    const station = await prisma.kitchenStation.update({
      where: { id: id as string },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(description !== undefined && { description }),
        ...(outlet_id && { outlet_id }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    res.json(station);
  } catch (error) {
    console.error('Error updating kitchen station:', error);
    res.status(500).json({ error: 'Failed to update kitchen station' });
  }
});

// DELETE /kitchen/stations/:id - Delete kitchen station (admin only)
router.delete('/stations/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.kitchenStation.delete({
      where: { id: id as string },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting kitchen station:', error);
    res.status(500).json({ error: 'Failed to delete kitchen station' });
  }
});

// POST /kitchen/stations/:id/categories - Assign category to station (admin only)
router.post('/stations/:id/categories', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id } = req.body;

    if (!category_id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    const stationCategory = await prisma.kitchenStationCategory.create({
      data: {
        kitchen_station_id: id as string,
        category_id,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json(stationCategory);
  } catch (error) {
    console.error('Error assigning category to station:', error);
    res.status(500).json({ error: 'Failed to assign category to station' });
  }
});

// DELETE /kitchen/stations/:id/categories/:categoryId - Remove category from station (admin only)
router.delete('/stations/:id/categories/:categoryId', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id, categoryId } = req.params;

    await prisma.kitchenStationCategory.deleteMany({
      where: {
        kitchen_station_id: id as string,
        category_id: categoryId as string,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing category from station:', error);
    res.status(500).json({ error: 'Failed to remove category from station' });
  }
});

// GET /kitchen/orders - Get orders routed to specific station
router.get('/orders', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { station_id, status } = req.query;

    if (!station_id) {
      return res.status(400).json({ error: 'Station ID is required' });
    }

    // Get categories assigned to this station
    const stationCategories = await prisma.kitchenStationCategory.findMany({
      where: { kitchen_station_id: station_id as string },
      select: { category_id: true },
    });

    const categoryIds = stationCategories.map((sc: { category_id: string }) => sc.category_id);

    // Get orders with items in these categories
    const orders = await prisma.order.findMany({
      where: {
        status: status ? status as string : 'pending',
        items: {
          some: {
            product: {
              category_id: { in: categoryIds },
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching kitchen orders:', error);
    res.status(500).json({ error: 'Failed to fetch kitchen orders' });
  }
});

export default router;

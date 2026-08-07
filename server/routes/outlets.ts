import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { ZodError } from 'zod';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Validation schemas
const createOutletSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
});

const updateOutletSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
});

// Get all outlets (public - no auth required)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const outlets = await prisma.outlet.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            profiles: true,
            products: true,
            tables: true,
            orders: true,
          },
        },
      },
    });

    res.json(outlets);
  } catch (error) {
    console.error('Error fetching outlets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get outlet by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const outlet = await prisma.outlet.findUnique({
      where: { id },
      include: {
        profiles: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
        products: {
          where: { is_active: true },
          include: {
            category: true,
          },
        },
        tables: {
          where: { is_active: true },
        },
      },
    });

    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }

    res.json(outlet);
  } catch (error) {
    console.error('Error fetching outlet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create outlet
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createOutletSchema.parse(req.body);
    const outletId = randomUUID();

    const outlet = await prisma.outlet.create({
      data: {
        id: outletId,
        ...data,
      },
    });

    res.status(201).json(outlet);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
    }

    console.error('Error creating outlet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update outlet
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const data = updateOutletSchema.parse(req.body);

    const outlet = await prisma.outlet.update({
      where: { id },
      data,
    });

    res.json(outlet);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
    }

    console.error('Error updating outlet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete outlet
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    // Check if outlet has any associated data
    const profilesCount = await prisma.profile.count({ where: { outlet_id: id } });
    const productsCount = await prisma.product.count({ where: { outlet_id: id } });
    const tablesCount = await prisma.table.count({ where: { outlet_id: id } });
    const ordersCount = await prisma.order.count({ where: { outlet_id: id } });

    const totalCount = profilesCount + productsCount + tablesCount + ordersCount;
    if (totalCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete outlet with associated data',
        details: {
          profiles: profilesCount,
          products: productsCount,
          tables: tablesCount,
          orders: ordersCount,
        },
      });
    }

    await prisma.outlet.delete({
      where: { id },
    });

    res.json({ message: 'Outlet deleted successfully' });
  } catch (error) {
    console.error('Error deleting outlet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

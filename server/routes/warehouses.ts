import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// Validation schemas
const createWarehouseSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  outlet_id: z.string().uuid(),
  address: z.string().optional(),
});

const updateWarehouseSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  is_active: z.boolean().optional(),
});

// GET /warehouses - List all warehouses
router.get('/', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        outlet: true,
        _count: {
          select: {
            ingredients: true,
            transfersFrom: true,
            transfersTo: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /warehouses/:id - Get specific warehouse
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: idStr },
      include: {
        outlet: true,
        ingredients: {
          include: {
            supplier: true,
          },
        },
        transfersFrom: {
          include: {
            to_warehouse: true,
            items: true,
          },
          orderBy: { created_at: 'desc' },
        },
        transfersTo: {
          include: {
            from_warehouse: true,
            items: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.json(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /warehouses - Create new warehouse (admin/manager only)
router.post('/', authMiddleware, requirePermission(PERMISSIONS.inventory.create), async (req: Request, res: Response) => {
  try {
    const data = createWarehouseSchema.parse(req.body);

    // Check if warehouse code already exists
    const existing = await prisma.warehouse.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return res.status(400).json({ error: 'Warehouse code already exists' });
    }

    // Check if outlet exists
    const outlet = await prisma.outlet.findUnique({
      where: { id: data.outlet_id },
    });

    if (!outlet) {
      return res.status(400).json({ error: 'Outlet not found' });
    }

    const warehouse = await prisma.warehouse.create({
      data,
      include: {
        outlet: true,
      },
    });

    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /warehouses/:id - Update warehouse (admin/manager only)
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const data = updateWarehouseSchema.parse(req.body);

    // Check if warehouse exists
    const existing = await prisma.warehouse.findUnique({
      where: { id: idStr },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    const warehouse = await prisma.warehouse.update({
      where: { id: idStr },
      data,
      include: {
        outlet: true,
      },
    });

    res.json(warehouse);
  } catch (error) {
    console.error('Error updating warehouse:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /warehouses/:id - Delete warehouse (admin only)
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.delete), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    // Check if warehouse exists
    const existing = await prisma.warehouse.findUnique({
      where: { id: idStr },
      include: {
        _count: {
          select: {
            ingredients: true,
            transfersFrom: true,
            transfersTo: true,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    // Prevent deleting warehouses with ingredients
    if (existing._count.ingredients > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete warehouse with assigned ingredients',
        ingredientCount: existing._count.ingredients 
      });
    }

    // Prevent deleting warehouses with active transfers
    if (existing._count.transfersFrom > 0 || existing._count.transfersTo > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete warehouse with active transfers',
        transferCount: existing._count.transfersFrom + existing._count.transfersTo 
      });
    }

    await prisma.warehouse.delete({
      where: { id: idStr },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { requireRole } from '../middleware/auth';

const router = Router();

// Validation schemas
const createTableSchema = z.object({
  table_number: z.string().min(1).max(30),
  qr_code: z.string().optional(),
  outlet_id: z.string().uuid().optional(),
});

const updateTableSchema = z.object({
  table_number: z.string().min(1).max(30).optional(),
  qr_code: z.string().optional(),
  is_active: z.boolean().optional(),
  status: z.enum(['available', 'occupied', 'dirty', 'reserved']).optional(),
  outlet_id: z.string().uuid().optional(),
});

// GET /tables - Get all tables with status
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, outlet_id } = req.query;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (outlet_id && typeof outlet_id === 'string') {
      where.outlet_id = outlet_id;
    }

    const tables = await prisma.table.findMany({
      where,
      orderBy: { table_number: 'asc' },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            customerOrders: {
              where: {
                status: {
                  in: ['pending', 'paid', 'preparing', 'ready'],
                },
              },
            },
          },
        },
      },
    });

    // Enrich with derived status based on active orders
    const enrichedTables = tables.map((table: any) => ({
      ...table,
      hasActiveOrders: table._count.customerOrders > 0,
    }));

    res.json(enrichedTables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tables/summary - Get table status summary (must be before /:id to avoid route conflict)
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      where: { is_active: true },
      select: {
        status: true,
      },
    });

    const summary = {
      total: tables.length,
      available: tables.filter((t: any) => t.status === 'available').length,
      occupied: tables.filter((t: any) => t.status === 'occupied').length,
      dirty: tables.filter((t: any) => t.status === 'dirty').length,
      reserved: tables.filter((t: any) => t.status === 'reserved').length,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching table summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tables/:id - Get table by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const table = await prisma.table.findUnique({
      where: { id: idStr },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        customerOrders: {
          where: {
            status: {
              in: ['pending', 'paid', 'preparing', 'ready'],
            },
          },
          include: {
            orders: true,
          },
        },
      },
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /tables - Create new table
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createTableSchema.parse(req.body);

    // Check if table number already exists
    const existing = await prisma.table.findUnique({
      where: { table_number: data.table_number },
    });

    if (existing) {
      return res.status(400).json({ error: 'Table number already exists' });
    }

    const table = await prisma.table.create({
      data: {
        table_number: data.table_number,
        qr_code: data.qr_code,
        outlet_id: data.outlet_id,
        status: 'available',
      },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    res.status(201).json(table);
  } catch (error) {
    console.error('Error creating table:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /tables/:id - Update table
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const data = updateTableSchema.parse(req.body);

    // Check if table exists
    const existing = await prisma.table.findUnique({
      where: { id: idStr },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // If updating table_number, check for conflicts
    if (data.table_number && data.table_number !== existing.table_number) {
      const conflict = await prisma.table.findUnique({
        where: { table_number: data.table_number },
      });

      if (conflict) {
        return res.status(400).json({ error: 'Table number already exists' });
      }
    }

    const table = await prisma.table.update({
      where: { id: idStr },
      data,
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    res.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /tables/:id/status - Update table status (admin/cashier)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { status } = req.body;

    if (!status || !['available', 'occupied', 'dirty', 'reserved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: available, occupied, dirty, or reserved' });
    }

    const table = await prisma.table.update({
      where: { id: idStr },
      data: { status },
    });

    res.json(table);
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /tables/:id - Delete table
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    // Check if table exists
    const existing = await prisma.table.findUnique({
      where: { id: idStr },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Check if table has active orders
    const activeOrders = await prisma.customerOrder.count({
      where: {
        table_id: idStr,
        status: {
          in: ['pending', 'paid', 'preparing', 'ready'],
        },
      },
    });

    if (activeOrders > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete table with active orders',
        activeOrders 
      });
    }

    await prisma.table.delete({
      where: { id: idStr },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tables/summary - Get table status summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      where: { is_active: true },
      select: {
        status: true,
      },
    });

    const summary = {
      total: tables.length,
      available: tables.filter((t: any) => t.status === 'available').length,
      occupied: tables.filter((t: any) => t.status === 'occupied').length,
      dirty: tables.filter((t: any) => t.status === 'dirty').length,
      reserved: tables.filter((t: any) => t.status === 'reserved').length,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching table summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

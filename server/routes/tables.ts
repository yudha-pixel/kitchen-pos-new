import { Prisma } from '@prisma/client';
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import { canAccessOutlet, resolveOutletFilter } from '../lib/outletAccess';

const router = Router();

// Validation schemas
const createTableSchema = z.object({
  table_number: z.string().min(1).max(30),
  qr_code: z.string().optional(),
  // Lantai/zona meja, mis. "Lantai 1", "Indoor", "VIP".
  area: z.string().max(50).nullish(),
  outlet_id: z.string().uuid().optional(),
});

const updateTableSchema = z.object({
  table_number: z.string().min(1).max(30).optional(),
  qr_code: z.string().optional(),
  is_active: z.boolean().optional(),
  status: z.enum(['available', 'occupied', 'dirty', 'reserved']).optional(),
  area: z.string().max(50).nullish(),
  outlet_id: z.string().uuid().optional(),
});

// GET /tables - Get all tables with status
router.get('/', authMiddleware, requirePermission(PERMISSIONS.tables.view), async (req: Request, res: Response) => {
  try {
    const { status, outlet_id, table_number, area } = req.query;

    const where: Prisma.TableWhereInput = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const outletFilter = resolveOutletFilter(req, outlet_id);
    if (outletFilter === 'denied') {
      return res.status(403).json({ error: 'Tidak punya akses ke outlet ini' });
    }
    if (outletFilter) {
      where.outlet_id = outletFilter;
    }

    if (area && typeof area === 'string') {
      where.area = area;
    }
    if (table_number && typeof table_number === 'string') {
      // Handle URL encoding and trim whitespace for robust matching
      const decodedTableNumber = decodeURIComponent(table_number).trim();
      where.table_number = decodedTableNumber;
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
    const enrichedTables = tables.map((table) => ({
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
router.get('/summary', authMiddleware, requirePermission(PERMISSIONS.tables.view), async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      where: { is_active: true },
      select: {
        status: true,
      },
    });

    const summary = {
      total: tables.length,
      available: tables.filter((t) => t.status === 'available').length,
      occupied: tables.filter((t) => t.status === 'occupied').length,
      dirty: tables.filter((t) => t.status === 'dirty').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching table summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /tables/:id - Get table by ID
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.tables.view), async (req: Request, res: Response) => {
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
router.post('/', authMiddleware, requirePermission(PERMISSIONS.tables.create), async (req: Request, res: Response) => {
  try {
    const data = createTableSchema.parse(req.body);

    if (!canAccessOutlet(req, data.outlet_id)) {
      return res.status(403).json({ error: 'Tidak punya akses ke outlet ini' });
    }

    // Nomor meja unik per outlet, bukan global - cabang lain boleh punya
    // "Meja 1" sendiri. findFirst dipakai karena Postgres memperlakukan NULL
    // sebagai berbeda, jadi meja tanpa outlet lolos dari constraint.
    const existing = await prisma.table.findFirst({
      where: {
        table_number: data.table_number,
        outlet_id: data.outlet_id ?? null,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Table number already exists in this outlet' });
    }

    // Generate QR code URL with table number parameter
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.WEB_BASE_URL || 'http://localhost:3000';
    const qrCodeUrl = `${baseUrl}/order/${data.table_number}?table=${data.table_number}`;

    const table = await prisma.table.create({
      data: {
        table_number: data.table_number,
        qr_code: qrCodeUrl,
        area: data.area ?? null,
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
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.tables.edit), async (req: Request, res: Response) => {
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

    if (!canAccessOutlet(req, existing.outlet_id) || !canAccessOutlet(req, data.outlet_id)) {
      return res.status(403).json({ error: 'Tidak punya akses ke outlet ini' });
    }

    // Konflik dinilai terhadap outlet tujuan: memindahkan meja ke outlet lain
    // bisa bertabrakan walau nomornya tidak berubah.
    const targetOutletId = data.outlet_id ?? existing.outlet_id ?? null;
    const targetNumber = data.table_number ?? existing.table_number;
    if (targetNumber !== existing.table_number || targetOutletId !== existing.outlet_id) {
      const conflict = await prisma.table.findFirst({
        where: {
          table_number: targetNumber,
          outlet_id: targetOutletId,
          id: { not: existing.id },
        },
      });

      if (conflict) {
        return res.status(400).json({ error: 'Table number already exists in this outlet' });
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
router.patch('/:id/status', authMiddleware, requirePermission(PERMISSIONS.tables.edit), async (req: Request, res: Response) => {
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
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.tables.delete), async (req: Request, res: Response) => {
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
router.get('/summary', authMiddleware, requirePermission(PERMISSIONS.tables.view), async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      where: { is_active: true },
      select: {
        status: true,
      },
    });

    const summary = {
      total: tables.length,
      available: tables.filter((t) => t.status === 'available').length,
      occupied: tables.filter((t) => t.status === 'occupied').length,
      dirty: tables.filter((t) => t.status === 'dirty').length,
      reserved: tables.filter((t) => t.status === 'reserved').length,
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching table summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

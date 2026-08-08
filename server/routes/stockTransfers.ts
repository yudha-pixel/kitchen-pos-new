import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Validation schemas
const createTransferSchema = z.object({
  from_warehouse_id: z.string().uuid(),
  to_warehouse_id: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(z.object({
    ingredient_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit: z.string(),
  })).min(1),
});

const updateTransferSchema = z.object({
  status: z.enum(['approved', 'rejected', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

// GET /stock-transfers - List all transfers
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, from_warehouse, to_warehouse } = req.query;

    const where: any = {};
    if (status) where.status = status as string;
    if (from_warehouse) where.from_warehouse_id = from_warehouse as string;
    if (to_warehouse) where.to_warehouse_id = to_warehouse as string;

    const transfers = await prisma.stockTransfer.findMany({
      where,
      include: {
        from_warehouse: {
          include: {
            outlet: true,
          },
        },
        to_warehouse: {
          include: {
            outlet: true,
          },
        },
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
    console.error('Error fetching stock transfers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /stock-transfers/:id - Get specific transfer
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: idStr },
      include: {
        from_warehouse: {
          include: {
            outlet: true,
          },
        },
        to_warehouse: {
          include: {
            outlet: true,
          },
        },
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Stock transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Error fetching stock transfer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /stock-transfers - Create new transfer request
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createTransferSchema.parse(req.body);
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if warehouses exist
    const fromWarehouse = await prisma.warehouse.findUnique({
      where: { id: data.from_warehouse_id },
    });

    const toWarehouse = await prisma.warehouse.findUnique({
      where: { id: data.to_warehouse_id },
    });

    if (!fromWarehouse || !toWarehouse) {
      return res.status(400).json({ error: 'Invalid warehouse IDs' });
    }

    // Prevent transfer to same warehouse
    if (data.from_warehouse_id === data.to_warehouse_id) {
      return res.status(400).json({ error: 'Cannot transfer to same warehouse' });
    }

    // Check stock availability for all items
    for (const item of data.items) {
      const ingredient = await prisma.ingredient.findUnique({
        where: { id: item.ingredient_id },
      });

      if (!ingredient) {
        return res.status(400).json({ error: `Ingredient ${item.ingredient_id} not found` });
      }

      if (ingredient.warehouse_id !== data.from_warehouse_id) {
        return res.status(400).json({ 
          error: `Ingredient ${ingredient.name} is not in the source warehouse` 
        });
      }

      if (ingredient.current_stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${ingredient.name}. Available: ${ingredient.current_stock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Generate transfer number
    const transfer_number = `TRF-${Date.now()}`;

    // Create transfer with items
    const transfer = await prisma.stockTransfer.create({
      data: {
        transfer_number,
        from_warehouse_id: data.from_warehouse_id,
        to_warehouse_id: data.to_warehouse_id,
        requested_by: userId,
        notes: data.notes,
        items: {
          create: data.items,
        },
      },
      include: {
        from_warehouse: true,
        to_warehouse: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    res.status(201).json(transfer);
  } catch (error) {
    console.error('Error creating stock transfer:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-transfers/:id - Update transfer status (approve/reject/complete/cancel)
router.patch('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const data = updateTransferSchema.parse(req.body);
    const userId = (req as any).user?.id;

    // Check if transfer exists
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: idStr },
      include: {
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Stock transfer not found' });
    }

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        pending: ['approved', 'rejected', 'cancelled'],
        approved: ['completed', 'cancelled'],
        rejected: [],
        completed: [],
        cancelled: [],
      };

      if (!validTransitions[transfer.status].includes(data.status)) {
        return res.status(400).json({ 
          error: `Cannot transition from ${transfer.status} to ${data.status}` 
        });
      }
    }

    // Handle approval
    const updateData: any = { ...data };
    if (data.status === 'approved') {
      // Reserve stock from source warehouse
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

      updateData.approved_by = userId;
      updateData.approved_at = new Date();
    }

    // Handle completion
    if (data.status === 'completed') {
      // Add stock to destination warehouse
      for (const item of transfer.items) {
        // Check if ingredient exists in destination warehouse
        const existingIngredient = await prisma.ingredient.findFirst({
          where: {
            name: item.ingredient.name,
            warehouse_id: transfer.to_warehouse_id,
          },
        });

        if (existingIngredient) {
          await prisma.ingredient.update({
            where: { id: existingIngredient.id },
            data: {
              current_stock: {
                increment: item.quantity,
              },
            },
          });
        } else {
          // Create new ingredient in destination warehouse
          await prisma.ingredient.create({
            data: {
              name: item.ingredient.name,
              current_stock: item.quantity,
              unit: item.unit,
              min_stock: item.ingredient.min_stock,
              unit_price: item.ingredient.unit_price,
              warehouse_id: transfer.to_warehouse_id,
            },
          });
        }
      }
    }

    // Handle rejection or cancellation
    if (data.status === 'rejected' || data.status === 'cancelled') {
      // Restore stock to source warehouse if was approved
      if (transfer.status === 'approved') {
        for (const item of transfer.items) {
          await prisma.ingredient.update({
            where: { id: item.ingredient_id },
            data: {
              current_stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }

    const updatedTransfer = await prisma.stockTransfer.update({
      where: { id: idStr },
      data: updateData,
      include: {
        from_warehouse: true,
        to_warehouse: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Error updating stock transfer:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /stock-transfers/:id - Delete transfer (admin only, only if pending)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    // Check if transfer exists
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: idStr },
    });

    if (!transfer) {
      return res.status(404).json({ error: 'Stock transfer not found' });
    }

    // Only allow deletion of pending transfers
    if (transfer.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Can only delete pending transfers',
        currentStatus: transfer.status 
      });
    }

    await prisma.stockTransfer.delete({
      where: { id: idStr },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting stock transfer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

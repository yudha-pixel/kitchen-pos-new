import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

const createStockWriteOffSchema = z.object({
  ingredient_id: z.string().uuid(),
  ingredient_name: z.string(),
  quantity_written_off: z.number().positive(),
  unit: z.string(),
  reason: z.string(),
  notes: z.string().optional(),
  proof_file: z.string(),
  proof_file_name: z.string(),
});

const rejectStockWriteOffSchema = z.object({
  rejection_reason: z.string().optional(),
});

// GET /stock-write-offs - List all write-offs, optionally filtered by status
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const writeOffs = await prisma.stockWriteOff.findMany({
      where,
      orderBy: { requested_at: 'desc' },
    });

    res.json(writeOffs);
  } catch (error) {
    console.error('Error fetching stock write-offs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /stock-write-offs/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const writeOff = await prisma.stockWriteOff.findUnique({ where: { id } });

    if (!writeOff) {
      return res.status(404).json({ error: 'Stock write-off not found' });
    }

    res.json(writeOff);
  } catch (error) {
    console.error('Error fetching stock write-off:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /stock-write-offs - Create a new pending write-off
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createStockWriteOffSchema.parse(req.body);
    const userId = req.user?.id;
    const username = req.user?.username;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: data.ingredient_id },
    });
    if (!ingredient) {
      return res.status(400).json({ error: 'Ingredient not found' });
    }

    const writeOff = await prisma.stockWriteOff.create({
      data: {
        ...data,
        requested_by: userId,
        requested_by_name: username ?? 'Unknown',
      },
    });

    res.status(201).json(writeOff);
  } catch (error) {
    console.error('Error creating stock write-off:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-write-offs/:id/approve - Approve and remove stock from the ingredient
router.patch('/:id/approve', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;
    const username = req.user?.username;

    const writeOff = await prisma.stockWriteOff.findUnique({ where: { id } });
    if (!writeOff) {
      return res.status(404).json({ error: 'Stock write-off not found' });
    }
    if (writeOff.status !== 'pending') {
      return res.status(400).json({ error: 'Stock write-off is not pending' });
    }

    const ingredient = await prisma.ingredient.findUnique({ where: { id: writeOff.ingredient_id } });
    const newStock = Math.max(0, (ingredient?.current_stock ?? 0) - writeOff.quantity_written_off);

    const [updatedWriteOff] = await prisma.$transaction([
      prisma.stockWriteOff.update({
        where: { id },
        data: {
          status: 'approved',
          approved_by: userId,
          approved_by_name: username ?? 'Unknown',
          approved_at: new Date(),
        },
      }),
      prisma.ingredient.update({
        where: { id: writeOff.ingredient_id },
        data: { current_stock: newStock },
      }),
    ]);

    res.json(updatedWriteOff);
  } catch (error) {
    console.error('Error approving stock write-off:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-write-offs/:id/reject
router.patch('/:id/reject', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = rejectStockWriteOffSchema.parse(req.body);
    const userId = req.user?.id;
    const username = req.user?.username;

    const writeOff = await prisma.stockWriteOff.findUnique({ where: { id } });
    if (!writeOff) {
      return res.status(404).json({ error: 'Stock write-off not found' });
    }
    if (writeOff.status !== 'pending') {
      return res.status(400).json({ error: 'Stock write-off is not pending' });
    }

    const updatedWriteOff = await prisma.stockWriteOff.update({
      where: { id },
      data: {
        status: 'rejected',
        rejected_by: userId,
        rejected_by_name: username ?? 'Unknown',
        rejected_at: new Date(),
        rejection_reason: data.rejection_reason,
      },
    });

    res.json(updatedWriteOff);
  } catch (error) {
    console.error('Error rejecting stock write-off:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

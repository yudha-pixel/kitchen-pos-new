import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

const createStockRequestSchema = z.object({
  ingredient_id: z.string().uuid(),
  ingredient_name: z.string(),
  quantity_requested: z.number().positive(),
  unit: z.string(),
  notes: z.string().optional(),
  supplier_name: z.string().optional(),
  proof_file: z.string().optional(),
  proof_file_name: z.string().optional(),
});

const rejectStockRequestSchema = z.object({
  rejection_reason: z.string().optional(),
});

// GET /stock-requests - List all requests, optionally filtered by status
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const requests = await prisma.stockRequest.findMany({
      where,
      orderBy: { requested_at: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching stock requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /stock-requests/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const request = await prisma.stockRequest.findUnique({ where: { id } });

    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching stock request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /stock-requests - Create a new pending stock request
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createStockRequestSchema.parse(req.body);
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

    const request = await prisma.stockRequest.create({
      data: {
        ...data,
        requested_by: userId,
        requested_by_name: username ?? 'Unknown',
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating stock request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-requests/:id/approve - Approve and add stock to the ingredient
router.patch('/:id/approve', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;
    const username = req.user?.username;

    const request = await prisma.stockRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Stock request is not pending' });
    }

    const [updatedRequest] = await prisma.$transaction([
      prisma.stockRequest.update({
        where: { id },
        data: {
          status: 'approved',
          approved_by: userId,
          approved_by_name: username ?? 'Unknown',
          approved_at: new Date(),
        },
      }),
      prisma.ingredient.update({
        where: { id: request.ingredient_id },
        data: { current_stock: { increment: request.quantity_requested } },
      }),
    ]);

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error approving stock request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-requests/:id/reject
router.patch('/:id/reject', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = rejectStockRequestSchema.parse(req.body);
    const userId = req.user?.id;
    const username = req.user?.username;

    const request = await prisma.stockRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Stock request is not pending' });
    }

    const updatedRequest = await prisma.stockRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejected_by: userId,
        rejected_by_name: username ?? 'Unknown',
        rejected_at: new Date(),
        rejection_reason: data.rejection_reason,
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error rejecting stock request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

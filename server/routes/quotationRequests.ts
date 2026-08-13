import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

const createQuotationRequestSchema = z.object({
  stock_request_id: z.string().uuid(),
  notes: z.string().optional(),
});

// GET /quotation-requests - List all quotation requests
router.get('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const { status, stock_request_id } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (stock_request_id) where.stock_request_id = stock_request_id as string;

    const requests = await prisma.quotationRequest.findMany({
      where,
      include: {
        stock_request: {
          include: {
            ingredient: true,
            supplier: true,
          },
        },
        quotations: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: { sent_at: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching quotation requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /quotation-requests/:id - Get details
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const request = await prisma.quotationRequest.findUnique({
      where: { id },
      include: {
        stock_request: {
          include: {
            ingredient: true,
            supplier: true,
          },
        },
        quotations: {
          include: {
            supplier: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Quotation request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching quotation request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /quotation-requests - Create from approved stock request
router.post('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.create), async (req: Request, res: Response) => {
  try {
    const data = createQuotationRequestSchema.parse(req.body);

    const stockRequest = await prisma.stockRequest.findUnique({
      where: { id: data.stock_request_id },
    });
    if (!stockRequest) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (stockRequest.status !== 'approved') {
      return res.status(400).json({ error: 'Stock request must be approved first' });
    }

    const request = await prisma.quotationRequest.create({
      data: {
        ...data,
        status: 'open',
      },
      include: {
        stock_request: {
          include: {
            ingredient: true,
            supplier: true,
          },
        },
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating quotation request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /quotation-requests/:id/close - Close request
router.patch('/:id/close', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const request = await prisma.quotationRequest.update({
      where: { id },
      data: {
        status: 'closed',
        closed_at: new Date(),
      },
      include: {
        stock_request: true,
        quotations: true,
      },
    });

    res.json(request);
  } catch (error) {
    console.error('Error closing quotation request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /quotation-requests/:id - Cancel request
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.delete), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await prisma.quotationRequest.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error cancelling quotation request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

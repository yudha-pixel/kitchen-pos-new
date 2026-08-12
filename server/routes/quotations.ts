import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

const createQuotationSchema = z.object({
  quotation_request_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  quoted_price: z.number().positive(),
  quoted_unit: z.string(),
  delivery_date: z.string().datetime().optional(),
  payment_terms: z.string().optional(),
  valid_until: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// GET /quotations - List with filters
router.get('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const { status, quotation_request_id, supplier_id } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (quotation_request_id) where.quotation_request_id = quotation_request_id as string;
    if (supplier_id) where.supplier_id = supplier_id as string;

    const quotations = await prisma.quotation.findMany({
      where,
      include: {
        supplier: true,
        quotation_request: {
          include: {
            stock_request: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
      orderBy: { received_at: 'desc' },
    });

    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /quotations/:id - Get details
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        supplier: true,
        quotation_request: {
          include: {
            stock_request: {
              include: {
                ingredient: true,
                supplier: true,
              },
            },
          },
        },
      },
    });

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /quotations/compare/:requestId - Compare quotations side-by-side
router.get('/compare/:requestId', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;

    const quotations = await prisma.quotation.findMany({
      where: {
        quotation_request_id: requestId,
        status: 'received',
      },
      include: {
        supplier: true,
      },
      orderBy: { quoted_price: 'asc' },
    });

    res.json(quotations);
  } catch (error) {
    console.error('Error comparing quotations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /quotations - Record supplier quotation
router.post('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.create), async (req: Request, res: Response) => {
  try {
    const data = createQuotationSchema.parse(req.body);
    const userId = req.user?.id;
    const username = req.user?.username;

    const quotationRequest = await prisma.quotationRequest.findUnique({
      where: { id: data.quotation_request_id },
    });
    if (!quotationRequest) {
      return res.status(404).json({ error: 'Quotation request not found' });
    }
    if (quotationRequest.status !== 'open') {
      return res.status(400).json({ error: 'Quotation request is not open' });
    }

    const quotation = await prisma.quotation.create({
      data: {
        ...data,
        status: 'received',
      },
      include: {
        supplier: true,
        quotation_request: true,
      },
    });

    res.status(201).json(quotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /quotations/:id/select - Select quotation for PO
router.patch('/:id/select', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;
    const username = req.user?.username;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        quotation_request: true,
      },
    });
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    if (quotation.status !== 'received') {
      return res.status(400).json({ error: 'Quotation is not in received status' });
    }

    // Reject other quotations for this request
    await prisma.quotation.updateMany({
      where: {
        quotation_request_id: quotation.quotation_request_id,
        id: { not: id },
      },
      data: { status: 'rejected' },
    });

    // Select this quotation
    const updatedQuotation = await prisma.quotation.update({
      where: { id },
      data: {
        status: 'selected',
        selected_at: new Date(),
        selected_by: userId,
        selected_by_name: username ?? 'Unknown',
      },
      include: {
        supplier: true,
        quotation_request: {
          include: {
            stock_request: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    // Close the quotation request
    await prisma.quotationRequest.update({
      where: { id: quotation.quotation_request_id },
      data: {
        status: 'closed',
        closed_at: new Date(),
      },
    });

    res.json(updatedQuotation);
  } catch (error) {
    console.error('Error selecting quotation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /quotations/:id/reject - Reject quotation
router.patch('/:id/reject', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status: 'rejected' },
      include: {
        supplier: true,
      },
    });

    res.json(quotation);
  } catch (error) {
    console.error('Error rejecting quotation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

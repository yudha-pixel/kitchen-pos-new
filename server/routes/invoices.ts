import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const createInvoiceSchema = z.object({
  grn_id: z.string().uuid(),
  invoice_number: z.string(),
  invoice_date: z.string().datetime(),
  due_date: z.string().datetime(),
  subtotal: z.number().positive(),
  tax: z.number().default(0),
  total: z.number().positive(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
});

// GET /invoices - List with filters
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, supplier_id } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (supplier_id) where.supplier_id = supplier_id as string;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        grn: {
          include: {
            purchase_order: true,
          },
        },
        supplier: true,
        payments: true,
      },
      orderBy: { invoice_date: 'desc' },
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /invoices/:id - Get details
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        grn: {
          include: {
            purchase_order: {
              include: {
                supplier: true,
              },
            },
            items: true,
          },
        },
        supplier: true,
        payments: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /invoices - Create from GRN
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createInvoiceSchema.parse(req.body);

    const grn = await prisma.goodsReceivedNote.findUnique({
      where: { id: data.grn_id },
      include: { supplier: true },
    });
    if (!grn) {
      return res.status(404).json({ error: 'Goods received note not found' });
    }
    if (grn.status !== 'completed') {
      return res.status(400).json({ error: 'GRN must be completed first' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        invoice_date: new Date(data.invoice_date),
        due_date: new Date(data.due_date),
        supplier_id: grn.supplier_id,
        status: 'pending',
      },
      include: {
        grn: true,
        supplier: true,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /invoices/:id/verify - Verify invoice
router.patch('/:id/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    if (invoice.status !== 'pending') {
      return res.status(400).json({ error: 'Invoice is not pending' });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: 'verified',
        verified_by: userId,
        verified_at: new Date(),
      },
      include: {
        supplier: true,
        payments: true,
      },
    });

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error verifying invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /invoices/:id/cancel - Cancel invoice
router.patch('/:id/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        supplier: true,
      },
    });

    res.json(invoice);
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

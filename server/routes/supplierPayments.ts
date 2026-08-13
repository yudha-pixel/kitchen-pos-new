import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

const createPaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  payment_date: z.string().datetime(),
  amount: z.number().positive(),
  payment_method: z.enum(['transfer', 'cash', 'check']),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

// GET /supplier-payments - List with filters
router.get('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const { status, invoice_id, supplier_id } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (invoice_id) where.invoice_id = invoice_id as string;
    if (supplier_id) where.supplier_id = supplier_id as string;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            supplier: true,
          },
        },
      },
      orderBy: { payment_date: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching supplier payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /supplier-payments/:id - Get details
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            supplier: true,
            grn: true,
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /supplier-payments/invoice/:invoiceId - Get payments for invoice
router.get('/invoice/:invoiceId', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;

    const payments = await prisma.payment.findMany({
      where: { invoice_id: invoiceId },
      include: {
        invoice: true,
      },
      orderBy: { payment_date: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching invoice payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /supplier-payments/supplier/:supplierId - Get payment history
router.get('/supplier/:supplierId', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const supplierId = Array.isArray(req.params.supplierId) ? req.params.supplierId[0] : req.params.supplierId;

    const payments = await prisma.payment.findMany({
      where: { supplier_id: supplierId },
      include: {
        invoice: true,
      },
      orderBy: { payment_date: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error('Error fetching supplier payment history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /supplier-payments - Record payment
router.post('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.pay), async (req: Request, res: Response) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const userId = req.user?.id;

    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoice_id },
      include: { supplier: true },
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    if (invoice.status !== 'verified' && invoice.status !== 'partially_paid') {
      return res.status(400).json({ error: 'Invoice must be verified first' });
    }

    const payment = await prisma.payment.create({
      data: {
        ...data,
        supplier_id: invoice.supplier_id,
        payment_date: new Date(data.payment_date),
        status: 'pending',
      },
      include: {
        invoice: true,
      },
    });

    // Calculate total paid
    const allPayments = await prisma.payment.findMany({
      where: { invoice_id: data.invoice_id, status: 'completed' },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0) + data.amount;

    // Update invoice status
    let newInvoiceStatus = 'partially_paid';
    if (totalPaid >= invoice.total) {
      newInvoiceStatus = 'paid';
    }

    await prisma.invoice.update({
      where: { id: data.invoice_id },
      data: { status: newInvoiceStatus },
    });

    // Mark payment as completed
    const completedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        processed_by: userId,
        processed_at: new Date(),
      },
      include: {
        invoice: true,
      },
    });

    res.status(201).json(completedPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /supplier-payments/:id/cancel - Cancel payment
router.patch('/:id/cancel', authMiddleware, requirePermission(PERMISSIONS.purchasing.pay), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const payment = await prisma.payment.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        invoice: true,
      },
    });

    // Recalculate invoice status
    const allPayments = await prisma.payment.findMany({
      where: { invoice_id: payment.invoice_id, status: 'completed' },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    let newInvoiceStatus = 'verified';
    if (totalPaid > 0 && totalPaid < payment.invoice.total) {
      newInvoiceStatus = 'partially_paid';
    } else if (totalPaid >= payment.invoice.total) {
      newInvoiceStatus = 'paid';
    }

    await prisma.invoice.update({
      where: { id: payment.invoice_id },
      data: { status: newInvoiceStatus },
    });

    res.json(payment);
  } catch (error) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

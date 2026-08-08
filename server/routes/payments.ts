import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { ZodError } from 'zod';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { webhookSignatureMiddleware } from '../middleware/webhookSignature';

const router = Router();

// Validation schemas
// Note: `amount` is deliberately NOT part of this schema. It used to be
// taken directly from the client request body, which let anyone with
// network access (or a modified client) create a payment transaction for
// any arbitrary amount, completely decoupled from what the order actually
// totals to - a direct payment-amount manipulation vulnerability. The
// authoritative amount is now always looked up server-side from
// `order.total_amount` (see POST /payments below).
const createPaymentSchema = z.object({
  order_id: z.string().uuid(),
  gateway: z.enum(['midtrans', 'xendit']),
  payment_method: z.enum(['qris', 'va', 'ewallet']),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'expired']),
  gateway_tx_id: z.string().optional(),
  paid_at: z.string().optional(),
});

// Create payment transaction
router.post('/payments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const paymentId = randomUUID();

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: data.order_id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found', order_id: data.order_id });
    }

    // Check if payment already exists for this order
    const existingPayment = await prisma.paymentTransaction.findUnique({
      where: { order_id: data.order_id },
    });

    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already exists for this order' });
    }

    // Authoritative amount: always the order's own total_amount from the DB.
    // Never trust an `amount` from the client payload here - this is the
    // fix for a payment-amount manipulation vulnerability (see schema
    // comment above).
    const amount = order.total_amount;

    // Create payment transaction
    const payment = await prisma.paymentTransaction.create({
      data: {
        id: paymentId,
        order_id: data.order_id,
        gateway: data.gateway,
        amount,
        payment_method: data.payment_method,
        status: 'pending',
      },
    });

    // Generate QR code if payment method is QRIS
    if (data.payment_method === 'qris') {
      // In production, this would call the actual payment gateway API
      // For now, we'll generate a placeholder QR code
      const qrCode = generatePlaceholderQRCode(amount, paymentId);
      const qrExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

      await prisma.paymentTransaction.update({
        where: { id: paymentId },
        data: {
          qr_code: qrCode,
          qr_expiry: qrExpiry,
        },
      });

      payment.qr_code = qrCode;
      payment.qr_expiry = qrExpiry;
    }

    // Link payment to order
    await prisma.order.update({
      where: { id: data.order_id },
      data: { payment_transaction_id: paymentId },
    });

    res.status(201).json(payment);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
    }

    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get payment by ID
router.get('/payments/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const payment = await prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        order: true,
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

// Manual payment status update by an authenticated staff member (e.g. a
// cashier confirming cash was received offline, or an admin correcting a
// stuck payment). This is NOT used by the actual payment gateway webhook -
// that flow is entirely separate (see POST /webhooks/payment below), since
// gateways authenticate via their own signature scheme, not our JWTs. Both
// `admin` and `cashier` roles are allowed here (authMiddleware alone, no
// further requireRole restriction), matching who is already trusted to
// operate the POS day-to-day.
router.patch('/payments/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const data = updatePaymentStatusSchema.parse(req.body);

    const payment = await prisma.paymentTransaction.update({
      where: { id },
      data: {
        status: data.status,
        gateway_tx_id: data.gateway_tx_id,
        paid_at: data.paid_at ? new Date(data.paid_at) : null,
      },
      include: {
        order: true,
      },
    });

    // If payment is paid, update order status
    if (data.status === 'paid') {
      await prisma.order.update({
        where: { id: payment.order_id },
        data: { status: 'completed' },
      });
    }

    res.json(payment);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
    }

    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for payment gateway notifications
// This endpoint is protected by signature verification middleware
// Payment gateways (Midtrans/Xendit) authenticate via their own signature scheme, not our JWTs
router.post('/webhooks/payment', webhookSignatureMiddleware, async (req: Request, res: Response) => {
  try {
    const { gateway, gateway_tx_id, status, amount } = req.body;

    // Find payment by gateway transaction ID
    const payment = await prisma.paymentTransaction.findFirst({
      where: { gateway_tx_id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment status
    const updatedPayment = await prisma.paymentTransaction.update({
      where: { id: payment.id },
      data: {
        status: status === 'success' ? 'paid' : 'failed',
        paid_at: status === 'success' ? new Date() : null,
      },
      include: {
        order: true,
      },
    });

    // If payment is successful, update order status
    if (status === 'success') {
      await prisma.order.update({
        where: { id: payment.order_id },
        data: { status: 'completed' },
      });

      // Trigger receipt printing (in production)
      // await printReceipt(updatedPayment.order);
    }

    res.json({ message: 'Webhook processed successfully', payment: updatedPayment });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Placeholder function for QR code generation
// In production, this would call the actual payment gateway API
function generatePlaceholderQRCode(amount: number, paymentId: string): string {
  // This is a placeholder - in production, call Midtrans/Xendit API
  // to generate actual dynamic QR code
  const data = JSON.stringify({
    amount,
    paymentId,
    timestamp: new Date().toISOString(),
  });
  return Buffer.from(data).toString('base64');
}

export default router;

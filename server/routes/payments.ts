import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { ZodError } from 'zod';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Validation schemas
const createPaymentSchema = z.object({
  order_id: z.string().uuid(),
  gateway: z.enum(['midtrans', 'xendit']),
  payment_method: z.enum(['qris', 'va', 'ewallet']),
  amount: z.number().positive(),
});

const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'expired']),
  gateway_tx_id: z.string().optional(),
  paid_at: z.string().optional(),
});

// Create payment transaction
router.post('/payments', async (req: Request, res: Response) => {
  try {
    const data = createPaymentSchema.parse(req.body);
    const paymentId = randomUUID();

    console.log('Creating payment for order:', data.order_id);

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: data.order_id },
    });

    if (!order) {
      console.log('Order not found:', data.order_id);
      return res.status(404).json({ error: 'Order not found', order_id: data.order_id });
    }

    console.log('Order found:', order.id);

    // Check if payment already exists for this order
    const existingPayment = await prisma.paymentTransaction.findUnique({
      where: { order_id: data.order_id },
    });

    if (existingPayment) {
      console.log('Payment already exists for order:', data.order_id);
      return res.status(400).json({ error: 'Payment already exists for this order' });
    }

    // Create payment transaction
    const payment = await prisma.paymentTransaction.create({
      data: {
        id: paymentId,
        order_id: data.order_id,
        gateway: data.gateway,
        amount: data.amount,
        payment_method: data.payment_method,
        status: 'pending',
      },
    });

    console.log('Payment created:', payment.id);

    // Generate QR code if payment method is QRIS
    if (data.payment_method === 'qris') {
      // In production, this would call the actual payment gateway API
      // For now, we'll generate a placeholder QR code
      const qrCode = generatePlaceholderQRCode(data.amount, paymentId);
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

    console.log('Payment linked to order');
    res.status(201).json(payment);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log('Validation error:', error.issues);
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

// Update payment status (for webhook or manual update)
router.patch('/payments/:id/status', async (req: Request, res: Response) => {
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
router.post('/webhooks/payment', async (req: Request, res: Response) => {
  try {
    const { gateway, gateway_tx_id, status, amount } = req.body;

    // Verify webhook signature (in production)
    // const signature = req.headers['x-signature'];
    // if (!verifyWebhookSignature(signature, req.body)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

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

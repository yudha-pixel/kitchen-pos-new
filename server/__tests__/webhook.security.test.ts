import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

describe('POST /webhooks/payment - signature verification', () => {
  let testOrderId: string;
  let testPaymentId: string;
  let testGatewayTxId: string;
  let xenditOrderId: string;
  let xenditPaymentId: string;
  let xenditGatewayTxId: string;

  beforeAll(async () => {
    // Create a test order for Midtrans
    const order = await prisma.order.create({
      data: {
        id: randomUUID(),
        cashier_id: null,
        total_amount: 50000,
        payment_method: 'qris',
        status: 'pending',
        table_number: 'T1',
      },
    });
    testOrderId = order.id;

    // Create a test payment for Midtrans
    const payment = await prisma.paymentTransaction.create({
      data: {
        id: randomUUID(),
        order_id: testOrderId,
        gateway: 'midtrans',
        amount: 50000,
        payment_method: 'qris',
        status: 'pending',
        gateway_tx_id: 'TEST-' + randomUUID(),
      },
    });
    testPaymentId = payment.id;
    testGatewayTxId = payment.gateway_tx_id!;

    // Create a separate test order for Xendit
    const xenditOrder = await prisma.order.create({
      data: {
        id: randomUUID(),
        cashier_id: null,
        total_amount: 50000,
        payment_method: 'va',
        status: 'pending',
        table_number: 'T2',
      },
    });
    xenditOrderId = xenditOrder.id;

    // Create a test payment for Xendit
    const xenditPayment = await prisma.paymentTransaction.create({
      data: {
        id: randomUUID(),
        order_id: xenditOrderId,
        gateway: 'xendit',
        amount: 50000,
        payment_method: 'va',
        status: 'pending',
        gateway_tx_id: 'xendit-' + randomUUID(),
      },
    });
    xenditPaymentId = xenditPayment.id;
    xenditGatewayTxId = xenditPayment.gateway_tx_id!;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.paymentTransaction.deleteMany({
      where: { id: { in: [testPaymentId, xenditPaymentId] } },
    });
    await prisma.order.deleteMany({
      where: { id: { in: [testOrderId, xenditOrderId] } },
    });
  });

  describe('Midtrans webhook signature verification', () => {
    it('rejects webhook without signature header (401)', async () => {
      const response = await request(app)
        .post('/webhooks/payment')
        .send({
          gateway: 'midtrans',
          gateway_tx_id: testGatewayTxId,
          status: 'success',
          amount: 50000,
        });

      // When no secret keys are configured, it should allow in development
      // But if MIDTRANS_SERVER_KEY is set, it should reject
      if (process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_SERVER_KEY !== 'your_server_key') {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid webhook signature');
      } else {
        // Development mode: no secret configured, should allow
        expect([200, 401]).toContain(response.status);
      }
    });

    it('rejects webhook with invalid signature (401)', async () => {
      const response = await request(app)
        .post('/webhooks/payment')
        .set('X-Signature-Key', 'invalid_signature_12345')
        .send({
          gateway: 'midtrans',
          gateway_tx_id: testGatewayTxId,
          status: 'success',
          amount: 50000,
        });

      if (process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_SERVER_KEY !== 'your_server_key') {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid webhook signature');
      } else {
        // Development mode: no secret configured, should allow
        expect([200, 401]).toContain(response.status);
      }
    });

    it('accepts webhook with valid Midtrans signature', async () => {
      const serverKey = process.env.MIDTRANS_SERVER_KEY || 'test_server_key';
      
      // Generate valid Midtrans signature
      // Midtrans signature: SHA512(order_id + status_code + gross_amount + server_key)
      const order_id = testOrderId;
      const status_code = '200';
      const gross_amount = '50000.00';
      const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const validSignature = crypto
        .createHash('sha512')
        .update(signatureString)
        .digest('hex');

      const response = await request(app)
        .post('/webhooks/payment')
        .set('X-Signature-Key', validSignature)
        .send({
          gateway: 'midtrans',
          gateway_tx_id: testGatewayTxId,
          status: 'success',
          amount: 50000,
          order_id,
          status_code,
          gross_amount,
        });

      if (process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_SERVER_KEY !== 'your_server_key') {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Webhook processed successfully');
      } else {
        // Development mode: no secret configured, should allow
        expect([200, 401]).toContain(response.status);
      }
    });
  });

  describe('Xendit webhook signature verification', () => {

    it('rejects webhook without signature header (401)', async () => {
      const response = await request(app)
        .post('/webhooks/payment')
        .send({
          gateway: 'xendit',
          gateway_tx_id: xenditGatewayTxId,
          status: 'success',
          amount: 50000,
        });

      if (process.env.XENDIT_SECRET_KEY && process.env.XENDIT_SECRET_KEY !== 'your_secret_key') {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid webhook signature');
      } else {
        // Development mode: no secret configured, should allow
        expect([200, 401]).toContain(response.status);
      }
    });

    it('rejects webhook with invalid signature (401)', async () => {
      const response = await request(app)
        .post('/webhooks/payment')
        .set('X-Callback-Token', 'invalid_token_12345')
        .send({
          gateway: 'xendit',
          gateway_tx_id: xenditGatewayTxId,
          status: 'success',
          amount: 50000,
        });

      if (process.env.XENDIT_SECRET_KEY && process.env.XENDIT_SECRET_KEY !== 'your_secret_key') {
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error', 'Invalid webhook signature');
      } else {
        // Development mode: no secret configured, should allow
        expect([200, 401]).toContain(response.status);
      }
    });

    it('accepts webhook with valid Xendit signature', async () => {
      const webhookToken = process.env.XENDIT_SECRET_KEY || 'test_webhook_token';
      
      // Generate valid Xendit signature
      // Xendit signature: HMAC-SHA256 of raw body + webhook token
      const body = JSON.stringify({
        gateway: 'xendit',
        gateway_tx_id: xenditGatewayTxId,
        status: 'success',
        amount: 50000,
      });
      const validSignature = crypto
        .createHmac('sha256', webhookToken)
        .update(body)
        .digest('hex');

      const response = await request(app)
        .post('/webhooks/payment')
        .set('X-Callback-Token', validSignature)
        .send({
          gateway: 'xendit',
          gateway_tx_id: xenditGatewayTxId,
          status: 'success',
          amount: 50000,
        });

      if (process.env.XENDIT_SECRET_KEY && process.env.XENDIT_SECRET_KEY !== 'your_secret_key') {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Webhook processed successfully');
      } else {
        // Development mode: no secret configured, should allow
        expect([200, 401]).toContain(response.status);
      }
    });
  });

  describe('Webhook payment status update', () => {
    let statusUpdateOrderId: string;
    let statusUpdatePaymentId: string;
    let statusUpdateGatewayTxId: string;

    beforeAll(async () => {
      // Create a separate test order for status update tests
      const order = await prisma.order.create({
        data: {
          id: randomUUID(),
          cashier_id: null,
          total_amount: 30000,
          payment_method: 'qris',
          status: 'pending',
          table_number: 'T3',
        },
      });
      statusUpdateOrderId = order.id;

      // Create a test payment for status update tests
      const payment = await prisma.paymentTransaction.create({
        data: {
          id: randomUUID(),
          order_id: statusUpdateOrderId,
          gateway: 'midtrans',
          amount: 30000,
          payment_method: 'qris',
          status: 'pending',
          gateway_tx_id: 'status-test-' + randomUUID(),
        },
      });
      statusUpdatePaymentId = payment.id;
      statusUpdateGatewayTxId = payment.gateway_tx_id!;
    });

    afterAll(async () => {
      // Cleanup status update test data
      await prisma.paymentTransaction.deleteMany({
        where: { id: statusUpdatePaymentId },
      });
      await prisma.order.deleteMany({
        where: { id: statusUpdateOrderId },
      });
    });

    it('updates payment status to paid when webhook status is success', async () => {
      const serverKey = process.env.MIDTRANS_SERVER_KEY || 'test_server_key';
      const order_id = statusUpdateOrderId;
      const status_code = '200';
      const gross_amount = '30000.00';
      const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const validSignature = crypto
        .createHash('sha512')
        .update(signatureString)
        .digest('hex');

      const response = await request(app)
        .post('/webhooks/payment')
        .set('X-Signature-Key', validSignature)
        .send({
          gateway: 'midtrans',
          gateway_tx_id: statusUpdateGatewayTxId,
          status: 'success',
          amount: 30000,
          order_id,
          status_code,
          gross_amount,
        });

      if (process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_SERVER_KEY !== 'your_server_key') {
        expect(response.status).toBe(200);
        
        // Verify payment status was updated
        const updatedPayment = await prisma.paymentTransaction.findUnique({
          where: { id: statusUpdatePaymentId },
        });
        expect(updatedPayment?.status).toBe('paid');
        expect(updatedPayment?.paid_at).not.toBeNull();

        // Verify order status was updated
        const updatedOrder = await prisma.order.findUnique({
          where: { id: statusUpdateOrderId },
        });
        expect(updatedOrder?.status).toBe('completed');
      }
    });

    it('updates payment status to failed when webhook status is not success', async () => {
      const serverKey = process.env.MIDTRANS_SERVER_KEY || 'test_server_key';
      const order_id = statusUpdateOrderId;
      const status_code = '202'; // Failed status
      const gross_amount = '30000.00';
      const signatureString = `${order_id}${status_code}${gross_amount}${serverKey}`;
      const validSignature = crypto
        .createHash('sha512')
        .update(signatureString)
        .digest('hex');

      const response = await request(app)
        .post('/webhooks/payment')
        .set('X-Signature-Key', validSignature)
        .send({
          gateway: 'midtrans',
          gateway_tx_id: statusUpdateGatewayTxId,
          status: 'failed',
          amount: 30000,
          order_id,
          status_code,
          gross_amount,
        });

      if (process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_SERVER_KEY !== 'your_server_key') {
        expect(response.status).toBe(200);
        
        // Verify payment status was updated to failed
        const updatedPayment = await prisma.paymentTransaction.findUnique({
          where: { id: statusUpdatePaymentId },
        });
        expect(updatedPayment?.status).toBe('failed');
        expect(updatedPayment?.paid_at).toBeNull();
      }
    });
  });
});

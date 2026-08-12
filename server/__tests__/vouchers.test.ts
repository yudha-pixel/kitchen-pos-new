import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

describe('Vouchers API', () => {
  let authToken: string;
  let voucherId: string;
  let adminUserId: string;
  let cashierUserId: string;
  let cashierToken: string;

  beforeAll(async () => {
    // Get admin and cashier roles
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
    const fixtureSuffix = `${Date.now()}_${randomUUID().slice(0, 8)}`;
    
    // Create admin user for testing
    const adminUser = await prisma.profile.create({
      data: {
        username: `voucher_admin_test_${fixtureSuffix}`,
        full_name: 'Voucher Admin Test',
        password_hash: 'hash',
        role_id: adminRole!.id,
      },
    });
    adminUserId = adminUser.id;

    const cashierUser = await prisma.profile.create({
      data: {
        username: `voucher_cashier_test_${fixtureSuffix}`,
        full_name: 'Voucher Cashier Test',
        password_hash: 'hash',
        role_id: cashierRole!.id,
      },
    });
    cashierUserId = cashierUser.id;

    // Generate production-shaped auth tokens backed by real users
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { id: adminUserId, username: adminUser.username, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    cashierToken = jwt.sign(
      { id: cashierUserId, username: cashierUser.username, role: 'cashier' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Clean up test data
    await prisma.voucher.deleteMany({
      where: { code: { startsWith: 'TEST_' } }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.voucher.deleteMany({
      where: { code: { startsWith: 'TEST_' } }
    });
    await prisma.profile.deleteMany({
      where: { id: { in: [adminUserId, cashierUserId] } }
    });
  });

  describe('POST /vouchers', () => {
    it('should create a new voucher', async () => {
      const validFrom = new Date();
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const response = await request(app)
        .post('/api/vouchers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TEST_PROMO20',
          name: 'Test Promo',
          description: 'Test voucher description',
          discount_type: 'percentage',
          discount_value: 20,
          minimum_purchase: 100000,
          max_discount: 50000,
          quota: 100,
          valid_from: validFrom.toISOString(),
          valid_until: validUntil.toISOString(),
          is_active: true
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.code).toBe('TEST_PROMO20');
      voucherId = response.body.id;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/vouchers')
        .send({
          code: 'TEST_PROMO10',
          name: 'Test Promo'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /vouchers', () => {
    it('should get all vouchers', async () => {
      const response = await request(app)
        .get('/api/vouchers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/vouchers');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /vouchers/:id', () => {
    it('should get a voucher by ID', async () => {
      const response = await request(app)
        .get(`/api/vouchers/${voucherId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(voucherId);
    });

    it('should return 404 for non-existent voucher', async () => {
      const response = await request(app)
        .get(`/api/vouchers/${randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /vouchers/validate', () => {
    it('should validate a valid voucher code', async () => {
      const response = await request(app)
        .post('/api/vouchers/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'TEST_PROMO20',
          purchaseAmount: 200000
        });

      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
    });

    it('should reject invalid voucher code', async () => {
      const response = await request(app)
        .post('/api/vouchers/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: 'INVALID_CODE',
          purchaseAmount: 200000
        });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /vouchers/:id', () => {
    it('should update a voucher', async () => {
      const response = await request(app)
        .put(`/api/vouchers/${voucherId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test Promo',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Test Promo');
    });

    it('should require admin role', async () => {
      const response = await request(app)
        .put(`/api/vouchers/${voucherId}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          name: 'Updated Test Promo'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /vouchers/:id/toggle-active', () => {
    it('should toggle voucher active status', async () => {
      const response = await request(app)
        .patch(`/api/vouchers/${voucherId}/toggle-active`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.is_active).toBe(false);
    });
  });

  describe('DELETE /vouchers/:id', () => {
    it('should delete a voucher', async () => {
      const response = await request(app)
        .delete(`/api/vouchers/${voucherId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for deleted voucher', async () => {
      const response = await request(app)
        .get(`/api/vouchers/${voucherId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

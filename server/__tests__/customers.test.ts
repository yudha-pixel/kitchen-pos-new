import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

describe('Customers API', () => {
  let authToken: string;
  let customerId: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Get admin role
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    
    // Create admin user for testing
    const adminUser = await prisma.profile.create({
      data: {
        username: `customer_admin_test_${Date.now()}`,
        full_name: 'Customer Admin Test',
        password_hash: 'hash',
        role_id: adminRole!.id,
      },
    });
    adminUserId = adminUser.id;

    // Generate auth token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { userId: adminUserId, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Clean up test data
    await prisma.customer.deleteMany({
      where: { phone: { startsWith: 'TEST_' } }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.customer.deleteMany({
      where: { phone: { startsWith: 'TEST_' } }
    });
  });

  describe('POST /customers', () => {
    it('should create a new customer', async () => {
      const response = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Customer',
          phone: 'TEST_08123456789',
          email: 'test@example.com',
          tier: 'bronze',
          points: 0,
          total_spent: 0,
          is_active: true
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Customer');
      expect(response.body.phone).toBe('TEST_08123456789');
      customerId = response.body.id;
    });

    it('should require name and phone', async () => {
      const response = await request(app)
        .post('/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/customers')
        .send({
          name: 'Test Customer',
          phone: 'TEST_08123456789'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /customers', () => {
    it('should get all customers', async () => {
      const response = await request(app)
        .get('/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/customers');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /customers/:id', () => {
    it('should get a customer by ID', async () => {
      const response = await request(app)
        .get(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(customerId);
    });

    it('should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get(`/customers/${randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /customers/:id', () => {
    it('should update a customer', async () => {
      const response = await request(app)
        .put(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Customer',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Customer');
      expect(response.body.email).toBe('updated@example.com');
    });

    it('should require admin role', async () => {
      const jwt = require('jsonwebtoken');
      const userToken = jwt.sign(
        { userId: randomUUID(), role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      const response = await request(app)
        .put(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Customer'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /customers/:id/toggle-active', () => {
    it('should toggle customer active status', async () => {
      const response = await request(app)
        .patch(`/customers/${customerId}/toggle-active`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.is_active).toBe(false);
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should delete a customer', async () => {
      const response = await request(app)
        .delete(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for deleted customer', async () => {
      const response = await request(app)
        .get(`/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

describe('Table Management API', () => {
  let testTableId: string | undefined;
  let adminUserId: string | undefined;
  let adminToken: string;
  const fixturePrefix = `UXR-${Date.now()}-tables-${randomUUID().slice(0, 8)}`;
  const fixtureTableNumber = `UXR-T-${Date.now().toString(36)}-${randomUUID().slice(0, 4)}`;

  beforeAll(async () => {
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    if (!adminRole) {
      throw new Error('Table tests require the seeded admin role');
    }

    const adminUser = await prisma.profile.create({
      data: {
        username: `${fixturePrefix}-admin`,
        full_name: 'Table Admin Fixture',
        password_hash: 'hash',
        role_id: adminRole.id,
      },
    });
    adminUserId = adminUser.id;

    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: adminUser.id, username: adminUser.username, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    if (testTableId) {
      await prisma.table.deleteMany({ where: { id: testTableId } });
    }
    if (adminUserId) {
      await prisma.auditLog.deleteMany({ where: { user_id: adminUserId } });
      await prisma.profile.deleteMany({ where: { id: adminUserId } });
    }
  });

  describe('GET /tables', () => {
    it('should return all tables', async () => {
      const res = await request(app)
        .get('/api/tables');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter tables by status', async () => {
      const res = await request(app)
        .get('/api/tables?status=available');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0].status).toBe('available');
      }
    });
  });

  describe('GET /tables/summary', () => {
    it('should return table status summary', async () => {
      const res = await request(app)
        .get('/api/tables/summary');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('available');
      expect(res.body).toHaveProperty('occupied');
      expect(res.body).toHaveProperty('dirty');
      expect(res.body).toHaveProperty('reserved');
    });
  });

  describe('POST /tables', () => {
    it('should create a new table', async () => {
      const res = await request(app)
        .post('/api/tables')
        .send({
          table_number: fixtureTableNumber,
          qr_code: `${fixturePrefix}-qr`,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.table_number).toBe(fixtureTableNumber);
      expect(res.body.status).toBe('available');
      testTableId = res.body.id;
    });

    it('should reject duplicate table number', async () => {
      const res = await request(app)
        .post('/api/tables')
        .send({
          table_number: fixtureTableNumber,
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid table number', async () => {
      const res = await request(app)
        .post('/api/tables')
        .send({
          table_number: '', // Empty string
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /tables/:id', () => {
    it('should return a specific table', async () => {
      const res = await request(app)
        .get(`/api/tables/${testTableId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testTableId);
    });

    it('should return 404 for non-existent table', async () => {
      const res = await request(app)
        .get('/api/tables/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tables/:id/status', () => {
    it('should update table status', async () => {
      const res = await request(app)
        .patch(`/api/tables/${testTableId}/status`)
        .send({ status: 'occupied' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('occupied');
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .patch(`/api/tables/${testTableId}/status`)
        .send({ status: 'invalid-status' });

      expect(res.status).toBe(400);
    });
  });

  // Guards the QR self-order chain: /pos/meja encodes the table UUID into the QR,
  // and /order/[tableId] resolves the table number from it. Broken when no table row exists.
  describe('GET /self-order/tables/id/:tableId', () => {
    it('should resolve a real table number from its UUID', async () => {
      const res = await request(app)
        .get(`/api/self-order/tables/id/${testTableId}`);

      expect(res.status).toBe(200);
      expect(res.body.table_number).toBe(fixtureTableNumber);
    });

    it('should return 404 for an unknown table UUID', async () => {
      const res = await request(app)
        .get('/api/self-order/tables/id/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /tables/:id', () => {
    it('should update table details', async () => {
      const res = await request(app)
        .put(`/api/tables/${testTableId}`)
        .send({
          table_number: `${fixtureTableNumber}-updated`,
          status: 'available',
        });

      expect(res.status).toBe(200);
      expect(res.body.table_number).toBe(`${fixtureTableNumber}-updated`);
    });
  });

  describe('DELETE /tables/:id', () => {
    it('should delete a table', async () => {
      // Reset status to available first
      await request(app)
        .patch(`/api/tables/${testTableId}/status`)
        .send({ status: 'available' });

      const res = await request(app)
        .delete(`/api/tables/${testTableId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for deleted table', async () => {
      const res = await request(app)
        .delete(`/api/tables/${testTableId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});

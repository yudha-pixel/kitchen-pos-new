import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

describe('Table Management API', () => {
  let testTableId: string;

  beforeAll(async () => {
    // Clean up any existing test tables
    await prisma.table.deleteMany({
      where: { table_number: { startsWith: 'TEST-' } },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.table.deleteMany({
      where: { table_number: { startsWith: 'TEST-' } },
    });
    await prisma.$disconnect();
  });

  describe('GET /tables', () => {
    it('should return all tables', async () => {
      const res = await request(app)
        .get('/tables');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter tables by status', async () => {
      const res = await request(app)
        .get('/tables?status=available');

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
        .get('/tables/summary');

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
        .post('/tables')
        .send({
          table_number: 'TEST-001',
          qr_code: 'QR-TEST-001',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.table_number).toBe('TEST-001');
      expect(res.body.status).toBe('available');
      testTableId = res.body.id;
    });

    it('should reject duplicate table number', async () => {
      const res = await request(app)
        .post('/tables')
        .send({
          table_number: 'TEST-001',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid table number', async () => {
      const res = await request(app)
        .post('/tables')
        .send({
          table_number: '', // Empty string
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /tables/:id', () => {
    it('should return a specific table', async () => {
      const res = await request(app)
        .get(`/tables/${testTableId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testTableId);
    });

    it('should return 404 for non-existent table', async () => {
      const res = await request(app)
        .get('/tables/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tables/:id/status', () => {
    it('should update table status', async () => {
      const res = await request(app)
        .patch(`/tables/${testTableId}/status`)
        .send({ status: 'occupied' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('occupied');
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .patch(`/tables/${testTableId}/status`)
        .send({ status: 'invalid-status' });

      expect(res.status).toBe(400);
    });
  });

  // Guards the QR self-order chain: /pos/meja encodes the table UUID into the QR,
  // and /order/[tableId] resolves the table number from it. Broken when no table row exists.
  describe('GET /self-order/tables/id/:tableId', () => {
    it('should resolve a real table number from its UUID', async () => {
      const res = await request(app)
        .get(`/self-order/tables/id/${testTableId}`);

      expect(res.status).toBe(200);
      expect(res.body.table_number).toBe('TEST-001');
    });

    it('should return 404 for an unknown table UUID', async () => {
      const res = await request(app)
        .get('/self-order/tables/id/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /tables/:id', () => {
    it('should update table details', async () => {
      const res = await request(app)
        .put(`/tables/${testTableId}`)
        .send({
          table_number: 'TEST-001-UPDATED',
          status: 'available',
        });

      expect(res.status).toBe(200);
      expect(res.body.table_number).toBe('TEST-001-UPDATED');
    });
  });

  describe('DELETE /tables/:id', () => {
    it('should delete a table', async () => {
      // Reset status to available first
      await request(app)
        .patch(`/tables/${testTableId}/status`)
        .send({ status: 'available' });

      const res = await request(app)
        .delete(`/tables/${testTableId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for deleted table', async () => {
      const res = await request(app)
        .delete(`/tables/${testTableId}`);

      expect(res.status).toBe(404);
    });
  });
});

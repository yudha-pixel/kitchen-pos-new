import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

describe('Audit Trail API', () => {
  let authToken: string;
  let cashierToken: string;
  let adminUserId: string | undefined;
  let cashierUserId: string | undefined;

  beforeAll(async () => {
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
    if (!adminRole || !cashierRole) {
      throw new Error('Audit tests require seeded admin and cashier roles');
    }

    const fixturePrefix = `UXR-${Date.now()}-audit-${randomUUID().slice(0, 8)}`;
    const passwordHash = await bcrypt.hash('test123', 10);

    const adminUser = await prisma.profile.create({
      data: {
        username: `${fixturePrefix}-admin`,
        full_name: 'Audit Admin Fixture',
        password_hash: passwordHash,
        role_id: adminRole.id,
      },
    });
    adminUserId = adminUser.id;

    const cashierUser = await prisma.profile.create({
      data: {
        username: `${fixturePrefix}-cashier`,
        full_name: 'Audit Cashier Fixture',
        password_hash: passwordHash,
        role_id: cashierRole.id,
      },
    });
    cashierUserId = cashierUser.id;

    const adminLoginResponse = await request(app)
      .post('/auth/login')
      .send({ username: adminUser.username, password: 'test123' });
    authToken = adminLoginResponse.body.token;

    const cashierLoginResponse = await request(app)
      .post('/auth/login')
      .send({ username: cashierUser.username, password: 'test123' });
    cashierToken = cashierLoginResponse.body.token;
  });

  afterAll(async () => {
    const profileIds = [adminUserId, cashierUserId].filter(
      (id): id is string => Boolean(id),
    );
    if (profileIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { user_id: { in: profileIds } } });
      await prisma.profile.deleteMany({ where: { id: { in: profileIds } } });
    }
  });

  describe('GET /audit', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/audit');

      expect(response.status).toBe(401);
    });

    it('should reject without admin role', async () => {
      const response = await request(app)
        .get('/api/audit')
        .set('Authorization', `Bearer ${cashierToken}`);

      expect(response.status).toBe(403);
    });

    it('should get audit logs with admin role', async () => {
      const response = await request(app)
        .get('/api/audit')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it('should filter by action', async () => {
      const response = await request(app)
        .get('/api/audit?action=create')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
    });

    it('should filter by entity_type', async () => {
      const response = await request(app)
        .get('/api/audit?entity_type=order')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
    });
  });

  describe('GET /audit/:id', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/audit/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent log', async () => {
      const response = await request(app)
        .get('/api/audit/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /audit/stats/summary', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/api/audit/stats/summary');

      expect(response.status).toBe(401);
    });

    it('should reject without admin role', async () => {
      const response = await request(app)
        .get('/api/audit/stats/summary')
        .set('Authorization', `Bearer ${cashierToken}`);

      expect(response.status).toBe(403);
    });

    it('should get audit statistics with admin role', async () => {
      const response = await request(app)
        .get('/api/audit/stats/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalLogs');
      expect(response.body).toHaveProperty('logsByAction');
      expect(response.body).toHaveProperty('logsByEntityType');
    });
  });
});

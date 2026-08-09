import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

describe('OCR API', () => {
  let authToken: string;
  let testScanId: string;

  beforeAll(async () => {
    // Create admin user for testing
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const adminUser = await prisma.profile.findUnique({ where: { username: 'admin' } });
    
    if (!adminUser && adminRole) {
      const passwordHash = await bcrypt.hash('admin', 10);
      await prisma.profile.create({
        data: {
          username: 'admin',
          full_name: 'Admin User',
          password_hash: passwordHash,
          role_id: adminRole.id,
        },
      });
    }

    // Get auth token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });
    
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test OCR scans
    await prisma.ocrScan.deleteMany({
      where: { scan_type: { startsWith: 'TEST-' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /ocr/scan', () => {
    it('should reject upload without authentication', async () => {
      const response = await request(app)
        .post('/ocr/scan')
        .attach('image', Buffer.from('test'), 'test.jpg');

      expect(response.status).toBe(401);
    });

    it('should reject upload without file', async () => {
      const response = await request(app)
        .post('/ocr/scan')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No file uploaded');
    });
  });

  describe('GET /ocr/scans', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/ocr/scans');

      expect(response.status).toBe(401);
    });

    it('should get user scans with authentication', async () => {
      const response = await request(app)
        .get('/ocr/scans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('scans');
      expect(Array.isArray(response.body.scans)).toBe(true);
    });
  });

  describe('GET /ocr/scans/:id', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/ocr/scans/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent scan', async () => {
      const response = await request(app)
        .get('/ocr/scans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /ocr/scans/:id', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .delete('/ocr/scans/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent scan', async () => {
      const response = await request(app)
        .delete('/ocr/scans/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});

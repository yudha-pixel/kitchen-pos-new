import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '../lib/prisma';
import { app } from '../app';
import bcrypt from 'bcrypt';

describe('User Preferences API', () => {
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create test user
    const password_hash = await bcrypt.hash('testpass123', 10);
    const user = await prisma.profile.create({
      data: {
        username: 'prefstest',
        full_name: 'Preferences Test User',
        password_hash,
        role_id: (await prisma.role.findFirst({ where: { name: 'admin' } }))!.id,
      },
    });
    userId = user.id;

    // Login to get token
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ username: 'prefstest', password: 'testpass123' });
    
    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.profile.delete({ where: { id: userId } });
  });

  describe('GET /api/user/preferences', () => {
    it('returns empty preferences for new user', async () => {
      const response = await request(app)
        .get('/api/user/preferences')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        favorites: [],
        recent: []
      });
    });

    it('rejects unauthenticated requests (401)', async () => {
      const response = await request(app)
        .get('/api/user/preferences');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/user/preferences', () => {
    it('allows updating favorites', async () => {
      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          favorites: ['/pos', '/kitchen', '/inventory'],
          recent: []
        });

      expect(response.status).toBe(200);
      expect(response.body.favorites).toEqual(['/pos', '/kitchen', '/inventory']);
    });

    it('allows updating recent items', async () => {
      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          favorites: ['/pos', '/kitchen'],
          recent: [
            { route: '/pos', title: 'Point of Sale', timestamp: new Date().toISOString() },
            { route: '/kitchen', title: 'Kitchen Display', timestamp: new Date().toISOString() }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.recent).toHaveLength(2);
      expect(response.body.recent[0].route).toBe('/pos');
    });

    it('enforces maximum 6 favorites', async () => {
      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          favorites: ['/pos', '/kitchen', '/inventory', '/admin', '/finance', '/hr', '/settings'],
          recent: []
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Maximum 6 favorites allowed');
    });

    it('enforces maximum 10 recent items', async () => {
      const recent = Array.from({ length: 11 }, (_, i) => ({
        route: `/route${i}`,
        title: `Route ${i}`,
        timestamp: new Date().toISOString()
      }));

      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          favorites: [],
          recent
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Maximum 10 recent items allowed');
    });

    it('rejects unauthenticated requests (401)', async () => {
      const response = await request(app)
        .put('/api/user/preferences')
        .send({ favorites: ['/pos'], recent: [] });

      expect(response.status).toBe(401);
    });

    it('persists preferences across requests', async () => {
      // Set preferences
      await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          favorites: ['/pos', '/kitchen'],
          recent: []
        });

      // Fetch preferences
      const response = await request(app)
        .get('/api/user/preferences')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.favorites).toEqual(['/pos', '/kitchen']);
    });
  });
});

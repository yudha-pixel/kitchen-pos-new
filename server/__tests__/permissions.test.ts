import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import {
  loadRolePermissions,
  clearRolePermissionsCache,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
} from '../middleware/permissions';

async function login(username: string, password: string) {
  const res = await request(app)
    .post('/auth/login')
    .send({ username, password });
  return res.body;
}

describe('Permission-based middleware', () => {
  let adminToken: string;
  let adminRoleId: string;
  let cashierToken: string;
  let ownerToken: string;

  beforeAll(async () => {
    // Ensure critical permissions exist for the migrated routes under test
    const modules = [
      { module: 'users', actions: ['view', 'create', 'update', 'delete'] },
      { module: 'settings', actions: ['view', 'edit'] },
    ];
    for (const mod of modules) {
      for (const action of mod.actions) {
        const name = `${mod.module}.${action}`;
        const permission = await prisma.permission.upsert({
          where: { module_action: { module: mod.module, action } },
          update: {},
          create: { name, description: `${action} ${mod.module}`, module: mod.module, action },
        });
        for (const roleName of ['admin', 'owner']) {
          const role = await prisma.role.findUnique({ where: { name: roleName } });
          if (role) {
            await prisma.rolePermission.upsert({
              where: {
                role_id_permission_id: { role_id: role.id, permission_id: permission.id },
              },
              update: {},
              create: { role_id: role.id, permission_id: permission.id },
            });
          }
        }
      }
    }

    const admin = await login('admin', 'admin');
    adminToken = admin.token;
    adminRoleId = admin.user.role_id;

    const cashier = await login('cashier1', 'cashier123');
    cashierToken = cashier.token;

    const owner = await login('owner1', 'owner123');
    ownerToken = owner.token;
  });

  afterAll(async () => {
    clearRolePermissionsCache();
    await prisma.$disconnect();
  });

  describe('Login and permissions endpoint', () => {
    it('login returns user role_id and permissions', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin' });
      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('role_id');
      expect(res.body).toHaveProperty('permissions');
      expect(Array.isArray(res.body.permissions)).toBe(true);
      expect(res.body.permissions).toContain('users.view');
    });

    it('returns the same permission-aware user shape from login and /auth/me', async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({ username: 'admin', password: 'admin' });
      const meResponse = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(meResponse.status).toBe(200);
      expect(loginResponse.body.user).toEqual(meResponse.body);
      expect(meResponse.body).toMatchObject({
        id: expect.any(String),
        username: 'admin',
        role_id: expect.any(String),
        role: expect.any(String),
        permissions: expect.any(Array),
      });
    });

    it('rejects an inactive profile even when its token is still valid', async () => {
      const cashier = await prisma.profile.findUniqueOrThrow({ where: { username: 'cashier1' } });
      await prisma.profile.update({ where: { id: cashier.id }, data: { is_active: false } });
      try {
        const res = await request(app)
          .get('/auth/me')
          .set('Authorization', `Bearer ${cashierToken}`);
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid or inactive user');
      } finally {
        await prisma.profile.update({ where: { id: cashier.id }, data: { is_active: true } });
      }
    });

    it('GET /auth/permissions returns the current permissions', async () => {
      const res = await request(app)
        .get('/auth/permissions')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toContain('settings.view');
    });
  });

  describe('Permission middleware on real routes', () => {
    it('exposes only safe organization appearance fields without authentication', async () => {
      const res = await request(app).get('/api/settings/appearance');

      expect(res.status).toBe(200);
      expect(Object.keys(res.body).sort()).toEqual([
        'card_style',
        'card_view',
        'cart_position',
        'layout_density',
        'primary_color',
        'theme_mode',
      ]);
      expect(res.body).not.toHaveProperty('manager_pin');
      expect(res.body).not.toHaveProperty('store_email');
    });

    it('exposes only the safe login redirect without authentication', async () => {
      const res = await request(app).get('/api/settings/login-config');

      expect(res.status).toBe(200);
      expect(Object.keys(res.body)).toEqual(['default_login_redirect']);
      expect(res.body.default_login_redirect).toMatch(/^\/(?!\/)/);
      expect(res.body).not.toHaveProperty('manager_pin');
    });

    it('lets a cashier read organization appearance without settings.view', async () => {
      const res = await request(app)
        .get('/api/settings/appearance')
        .set('Authorization', `Bearer ${cashierToken}`);

      expect(res.status).toBe(200);
    });

    it('allows admin to view users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    it('denies cashier to view users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${cashierToken}`);
      expect(res.status).toBe(403);
    });

    it('allows a custom role by capability and invalidates permission cache mutations', async () => {
      const suffix = Date.now().toString(36);
      const role = await prisma.role.create({
        data: { name: `capability_test_${suffix}`, description: 'Temporary capability test role' },
      });
      const adminProfile = await prisma.profile.findUniqueOrThrow({ where: { username: 'admin' } });
      const profile = await prisma.profile.create({
        data: {
          username: `capability_user_${suffix}`,
          full_name: 'Capability Test User',
          password_hash: adminProfile.password_hash,
          role_id: role.id,
        },
      });
      const permission = await prisma.permission.findUniqueOrThrow({ where: { name: 'users.view' } });

      try {
        const customLogin = await login(profile.username, 'admin');
        const deniedBeforeAssignment = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${customLogin.token}`);
        expect(deniedBeforeAssignment.status).toBe(403);

        const assignment = await request(app)
          .post(`/api/roles/${role.id}/permissions`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ permission_id: permission.id });
        expect(assignment.status).toBe(201);

        const allowedAfterAssignment = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${customLogin.token}`);
        expect(allowedAfterAssignment.status).toBe(200);

        const removal = await request(app)
          .delete(`/api/roles/${role.id}/permissions/${permission.id}`)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(removal.status).toBe(200);

        const deniedAfterRemoval = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${customLogin.token}`);
        expect(deniedAfterRemoval.status).toBe(403);
      } finally {
        clearRolePermissionsCache(role.id);
        await prisma.profile.deleteMany({ where: { id: profile.id } });
        await prisma.role.deleteMany({ where: { id: role.id } });
      }
    });

    it('denies an admin label when the required capability is absent', async () => {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { name: 'users.view' } });
      const existing = await prisma.rolePermission.findUniqueOrThrow({
        where: {
          role_id_permission_id: {
            role_id: adminRoleId,
            permission_id: permission.id,
          },
        },
      });

      await prisma.rolePermission.delete({ where: { id: existing.id } });
      clearRolePermissionsCache(adminRoleId);
      try {
        const res = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(403);
      } finally {
        await prisma.rolePermission.create({
          data: { role_id: adminRoleId, permission_id: permission.id },
        });
        clearRolePermissionsCache(adminRoleId);
      }
    });

    it('allows admin to update settings', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ store_name: 'Updated Test Store' });
      expect(res.status).toBe(200);
    });

    it('denies cashier to update settings', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({ store_name: 'Hacked' });
      expect(res.status).toBe(403);
    });

    it('rejects invalid appearance values for authorized settings edits', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ theme_mode: 'system' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('theme_mode must be one of: light, dark');
    });
  });

  describe('requirePermission helpers', () => {
    it('requirePermission calls next when permission is present', () => {
      const req: any = { user: { id: '1' }, userPermissions: ['users.view'], originalUrl: '/test', method: 'GET' };
      const res: any = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();
      requirePermission('users.view')(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('requirePermission returns 403 when permission is missing', () => {
      const req: any = { user: { id: '1' }, userPermissions: ['users.view'], originalUrl: '/test', method: 'GET' };
      const res: any = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();
      requirePermission('users.delete')(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('requireAnyPermission allows any matching permission', () => {
      const req: any = { user: { id: '1' }, userPermissions: ['users.view'], originalUrl: '/test', method: 'GET' };
      const res: any = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();
      requireAnyPermission('users.delete', 'users.view')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('requireAnyPermission denies when no permission matches', () => {
      const req: any = { user: { id: '1' }, userPermissions: ['users.view'], originalUrl: '/test', method: 'GET' };
      const res: any = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();
      requireAnyPermission('users.delete', 'settings.edit')(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('requireAllPermissions requires every permission', () => {
      const req: any = { user: { id: '1' }, userPermissions: ['users.view', 'users.create'], originalUrl: '/test', method: 'GET' };
      const res: any = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();
      requireAllPermissions('users.view', 'users.create')(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('requireAllPermissions denies when one permission is missing', () => {
      const req: any = { user: { id: '1' }, userPermissions: ['users.view'], originalUrl: '/test', method: 'GET' };
      const res: any = { status: vi.fn(() => res), json: vi.fn() };
      const next = vi.fn();
      requireAllPermissions('users.view', 'users.create')(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Permission cache', () => {
    it('caches role permissions across calls', async () => {
      clearRolePermissionsCache();
      const spy = vi.spyOn(prisma.role, 'findUnique');

      const first = await loadRolePermissions(adminRoleId);
      const second = await loadRolePermissions(adminRoleId);

      expect(first).toBe(second);
      expect(spy).toHaveBeenCalledTimes(1);

      clearRolePermissionsCache();
      const third = await loadRolePermissions(adminRoleId);
      expect(third).toEqual(first);
      expect(spy).toHaveBeenCalledTimes(2);

      spy.mockRestore();
    });
  });
});

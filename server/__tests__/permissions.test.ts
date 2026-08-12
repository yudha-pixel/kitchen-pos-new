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

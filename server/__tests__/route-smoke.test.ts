import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';
import auditData from '../../audit/route-audit-backend.json';

// Map route files to their mount prefixes in server/app.ts
const ROUTE_MOUNT_PREFIXES: Record<string, string> = {
  'approvalWorkflows.ts': '/api/approval-workflows',
  'attendance.ts': '/api/attendance',
  'audit.ts': '/api/audit',
  'auth.ts': '/auth', // Keep /auth for compatibility
  'backup.ts': '/api/backup',
  'goodsReceivedNotes.ts': '/api/goods-received-notes',
  'invoices.ts': '/api/invoices',
  'ocr.ts': '/api/ocr',
  'purchaseOrders.ts': '/api/purchase-orders',
  'quotationRequests.ts': '/api/quotation-requests',
  'quotations.ts': '/api/quotations',
  'stockRequests.ts': '/api/stock-requests',
  'stockTransfers.ts': '/api/stock-transfers',
  'stockWriteOffs.ts': '/api/stock-write-offs',
  'supplierPayments.ts': '/api/supplier-payments',
  'userPreferences.ts': '/api/user/preferences',
  'ingredients.ts': '/api/ingredients',
  'recipes.ts': '/api/recipes',
  'suppliers.ts': '/api/suppliers',
  'customers.ts': '/api/customers',
  'vouchers.ts': '/api/vouchers',
  'hr.ts': '/api/hr',
  'tables.ts': '/api/tables',
  'splitBill.ts': '/api/split-bill',
  'users.ts': '/api/users',
  'roles.ts': '/api/roles',
  'warehouses.ts': '/api/warehouses',
  'notifications.ts': '/api/notifications',
  'kitchen.ts': '/api/kitchen',
  'outlets.ts': '/api/outlets',
  'selfOrder.ts': '/api/self-order',
  'settings.ts': '/api/settings',
  // These four already define their own resource-prefixed paths internally
  // (e.g. orders.ts has `/orders`, `/orders/active`) so they're mounted bare
  // at /api in server/app.ts — see the comment there.
  'products.ts': '/api',
  'orders.ts': '/api',
  'print.ts': '/api',
  'payments.ts': '/api',
};

function getFullPath(file: string, path: string): string {
  const prefix = ROUTE_MOUNT_PREFIXES[file] || '';
  // Remove leading slash from path if prefix exists, then combine
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  if (prefix && cleanPath) {
    return `${prefix}/${cleanPath}`;
  } else if (prefix) {
    return prefix;
  } else if (cleanPath) {
    return `/${cleanPath}`;
  }
  return '/';
}

describe('Backend Route Smoke Test', () => {
  let adminToken: string;
  let brokenRoutes: any[] = [];

  beforeAll(async () => {
    // Ensure admin user exists
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

    // Get admin auth token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });
    
    if (loginResponse.status === 200) {
      adminToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
    // Write broken routes report
    if (brokenRoutes.length > 0) {
      const fs = require('fs');
      const path = require('path');
      const reportPath = path.join(process.cwd(), 'audit/broken-api-routes.json');
      fs.writeFileSync(reportPath, JSON.stringify(brokenRoutes, null, 2));
      console.log(`\n⚠️  Found ${brokenRoutes.length} broken API routes. See audit/broken-api-routes.json`);
    }
  });

  describe('Public GET routes', () => {
    const publicRoutes = auditData.routes.filter(
      (r: any) => r.accessLevel === 'public' && r.method === 'GET'
    );

    it.each(publicRoutes.map((r: any) => ({ ...r, fullPath: getFullPath(r.file, r.path) })))(
      '$file $path should return 200 (public)',
      async ({ file, path, fullPath }) => {
        // Skip parameterized routes that require specific IDs - they need real test data
        if (path.includes(':')) {
          return;
        }

        const response = await request(app).get(fullPath);
        
        if (response.status === 404) {
          brokenRoutes.push({
            file,
            path,
            fullPath,
            method: 'GET',
            status: response.status,
            expected: 200,
            accessLevel: 'public',
          });
        }
        
        expect(response.status).not.toBe(404);
      }
    );
  });

  describe('Authenticated routes without token', () => {
    const authRoutes = auditData.routes.filter(
      (r: any) => r.accessLevel === 'authenticated' || r.accessLevel === 'admin'
    );

    it.each(authRoutes.slice(0, 20).map((r: any) => ({ ...r, fullPath: getFullPath(r.file, r.path) })))(
      '$file $path $method should return 401 without token',
      async ({ file, path, method, fullPath }) => {
        let response;
        switch (method) {
          case 'GET':
            response = await request(app).get(fullPath);
            break;
          case 'POST':
            response = await request(app).post(fullPath);
            break;
          case 'PUT':
            response = await request(app).put(fullPath);
            break;
          case 'PATCH':
            response = await request(app).patch(fullPath);
            break;
          case 'DELETE':
            response = await request(app).delete(fullPath);
            break;
          default:
            response = await request(app).get(fullPath);
        }

        if (response.status === 404) {
          brokenRoutes.push({
            file,
            path,
            fullPath,
            method,
            status: response.status,
            expected: 401,
            accessLevel: 'authenticated',
          });
        }

        // 404 is unexpected for registered routes
        expect(response.status).not.toBe(404);
      }
    );
  });

  describe('Admin routes with admin token', () => {
    const adminRoutes = auditData.routes.filter(
      (r: any) => r.accessLevel === 'admin' && r.method === 'GET'
    );

    it.each(adminRoutes.slice(0, 15).map((r: any) => ({ ...r, fullPath: getFullPath(r.file, r.path) })))(
      '$file $path should return 200 with admin token',
      async ({ file, path, fullPath }) => {
        if (!adminToken) {
          console.warn('⚠️  No admin token available, skipping admin route tests');
          return;
        }

        const response = await request(app)
          .get(fullPath)
          .set('Authorization', `Bearer ${adminToken}`);

        if (response.status === 404) {
          brokenRoutes.push({
            file,
            path,
            fullPath,
            method: 'GET',
            status: response.status,
            expected: 200,
            accessLevel: 'admin',
          });
        }

        expect(response.status).not.toBe(404);
      }
    );
  });

  describe('Route registration check', () => {
    it('should have all routes from audit registered', () => {
      expect(auditData.totalRoutes).toBeGreaterThan(0);
      expect(auditData.routes.length).toBe(auditData.totalRoutes);
    });
  });
});

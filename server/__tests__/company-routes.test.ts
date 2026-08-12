import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const company = {
  id: 'eec7cf48-7705-4bd1-82cd-a74402e30ab0',
  name: 'PT Dapur Nusantara',
  logo_path: null,
  logo_mime_type: null,
  phone: null,
  email: null,
  website: null,
  address: null,
  tax_id: null,
  company_registry: null,
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  tax_rate: 11,
  service_charge: 5,
  created_at: new Date('2026-08-12T00:00:00.000Z'),
  updated_at: new Date('2026-08-12T01:00:00.000Z'),
};

const findFirst = vi.fn();
const update = vi.fn();
let uploadDirectory: string;

vi.mock('../lib/prisma', () => ({
  prisma: { company: { findFirst, update } },
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    const mode = req.headers.authorization;
    if (!mode) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: 'user-1', username: 'tester' };
    req.userPermissions = mode === 'Bearer admin' ? ['settings.view', 'settings.edit'] : [];
    next();
  },
}));

describe('company routes', () => {
  beforeAll(async () => {
    uploadDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'kitchen-pos-company-'));
    process.env.LOCAL_UPLOAD_DIR = uploadDirectory;
  });

  afterAll(async () => {
    delete process.env.LOCAL_UPLOAD_DIR;
    await fs.rm(uploadDirectory, { recursive: true, force: true });
  });

  beforeEach(() => {
    findFirst.mockReset().mockResolvedValue(company);
    update.mockReset().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ ...company, ...data }));
  });

  async function createApp() {
    const { default: companyRoutes } = await import('../routes/company');
    const app = express();
    app.use(express.json());
    app.use('/api/company', companyRoutes);
    return app;
  }

  it('lets any authenticated user read safe company identity', async () => {
    const response = await request(await createApp())
      .get('/api/company/identity')
      .set('Authorization', 'Bearer cashier');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ name: 'PT Dapur Nusantara', logo_url: null });
  });

  it('lets any authenticated user hydrate safe company operational defaults', async () => {
    const response = await request(await createApp())
      .get('/api/company/config')
      .set('Authorization', 'Bearer cashier');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      tax_rate: 11,
      service_charge: 5,
    });
  });

  it('requires settings.view for the full record', async () => {
    const denied = await request(await createApp())
      .get('/api/company')
      .set('Authorization', 'Bearer cashier');
    const allowed = await request(await createApp())
      .get('/api/company')
      .set('Authorization', 'Bearer admin');

    expect(denied.status).toBe(403);
    expect(allowed.status).toBe(200);
    expect(allowed.body.tax_rate).toBe(11);
  });

  it('normalizes authorized updates and rejects invalid rates', async () => {
    const app = await createApp();
    const invalid = await request(app)
      .put('/api/company')
      .set('Authorization', 'Bearer admin')
      .send({ tax_rate: -1 });
    const valid = await request(app)
      .put('/api/company')
      .set('Authorization', 'Bearer admin')
      .send({ name: '  Dapur Baru  ', currency: 'idr' });

    expect(invalid.status).toBe(400);
    expect(valid.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      where: { id: company.id },
      data: { name: 'Dapur Baru', currency: 'IDR' },
    });
  });

  it('accepts a signature-matched PNG and stores it only in managed temporary storage', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    const response = await request(await createApp())
      .post('/api/company/logo')
      .set('Authorization', 'Bearer admin')
      .attach('logo', png, { filename: 'company.png', contentType: 'image/png' });

    expect(response.status).toBe(200);
    const files = await fs.readdir(path.join(uploadDirectory, 'company'));
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/\.png$/);
  });

  it('rejects a declared image whose bytes do not match and rejects files above 2 MB', async () => {
    const app = await createApp();
    const mismatch = await request(app)
      .post('/api/company/logo')
      .set('Authorization', 'Bearer admin')
      .attach('logo', Buffer.from('<svg></svg>'), { filename: 'fake.png', contentType: 'image/png' });
    const oversized = await request(app)
      .post('/api/company/logo')
      .set('Authorization', 'Bearer admin')
      .attach('logo', Buffer.alloc(2 * 1024 * 1024 + 1), { filename: 'large.png', contentType: 'image/png' });

    expect(mismatch.status).toBe(400);
    expect(oversized.status).toBe(400);
    expect(oversized.body.error).toBe('Ukuran logo maksimum 2 MB.');
  });
});

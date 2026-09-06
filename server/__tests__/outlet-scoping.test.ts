import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { app } from '../app';
import { prisma } from '../lib/prisma';

/**
 * Regression safety net for phase-0 multi-branch groundwork.
 *
 * `tables.table_number` used to be globally unique, which meant a second
 * branch could never have its own "Meja 1" - a hard blocker for multi-outlet.
 * It is now unique per outlet, tables carry an `area` (floor/zone), and list
 * endpoints are scoped so a user cannot read another branch's data unless
 * their role grants `outlets.view`.
 *
 * Fixture roles (see server/prisma/seed.ts):
 *  - `admin`   -> has outlets.view, so it may read across outlets.
 *  - `cashier` -> has tables.view but NOT outlets.view, so it is pinned to
 *                 its own outlet. This is the denial path.
 *
 * Runs against the local dev Postgres, same as the other suites.
 */

let adminToken: string;
let cashierToken: string;
let outletA: string;
let outletB: string;

const createdTableIds: string[] = [];

async function login(username: string, password: string) {
  const res = await request(app).post('/auth/login').send({ username, password });
  expect(res.status).toBe(200);
  return res.body.token as string;
}

function createTable(token: string, body: Record<string, unknown>) {
  return request(app)
    .post('/api/tables')
    .set('Authorization', `Bearer ${token}`)
    .send(body);
}

beforeAll(async () => {
  adminToken = await login('admin', 'admin');
  cashierToken = await login('cashier', 'cashier123');

  const outlets = await prisma.outlet.findMany({ orderBy: { code: 'asc' }, select: { id: true } });
  expect(outlets.length).toBeGreaterThanOrEqual(2);
  outletA = outlets[0].id;
  outletB = outlets[1].id;
});

afterAll(async () => {
  await prisma.table.deleteMany({ where: { id: { in: createdTableIds } } });
  await prisma.$disconnect();
});

describe('tables - per-outlet uniqueness', () => {
  it('lets two different outlets each have the same table number', async () => {
    const shared = `Meja ${randomUUID().slice(0, 8)}`;

    const first = await createTable(adminToken, { table_number: shared, outlet_id: outletA });
    expect(first.status).toBe(201);
    createdTableIds.push(first.body.id);

    // This is the whole point of the migration: before it, this returned 400.
    const second = await createTable(adminToken, { table_number: shared, outlet_id: outletB });
    expect(second.status).toBe(201);
    createdTableIds.push(second.body.id);

    expect(second.body.outlet_id).toBe(outletB);
  });

  it('still rejects a duplicate table number inside the same outlet', async () => {
    const number = `Meja ${randomUUID().slice(0, 8)}`;

    const first = await createTable(adminToken, { table_number: number, outlet_id: outletA });
    expect(first.status).toBe(201);
    createdTableIds.push(first.body.id);

    const duplicate = await createTable(adminToken, { table_number: number, outlet_id: outletA });
    expect(duplicate.status).toBe(400);
  });
});

describe('tables - area (floor/zone)', () => {
  it('stores the area and returns it', async () => {
    const res = await createTable(adminToken, {
      table_number: `Meja ${randomUUID().slice(0, 8)}`,
      outlet_id: outletA,
      area: 'Lantai 2',
    });
    expect(res.status).toBe(201);
    createdTableIds.push(res.body.id);

    expect(res.body.area).toBe('Lantai 2');
  });

  it('filters the table list by area', async () => {
    const area = `Zona-${randomUUID().slice(0, 8)}`;
    const created = await createTable(adminToken, {
      table_number: `Meja ${randomUUID().slice(0, 8)}`,
      outlet_id: outletA,
      area,
    });
    expect(created.status).toBe(201);
    createdTableIds.push(created.body.id);

    const listed = await request(app)
      .get(`/api/tables?area=${encodeURIComponent(area)}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listed.status).toBe(200);
    expect(listed.body).toHaveLength(1);
    expect(listed.body[0].id).toBe(created.body.id);
  });
});

describe('outlet access control', () => {
  it('refuses a user without outlets.view who asks for another outlet', async () => {
    // The cashier belongs to outlet A; asking for B must not be answered.
    const res = await request(app)
      .get(`/api/tables?outlet_id=${outletB}`)
      .set('Authorization', `Bearer ${cashierToken}`);

    expect(res.status).toBe(403);
  });

  it('allows a user with outlets.view to read another outlet', async () => {
    const res = await request(app)
      .get(`/api/tables?outlet_id=${outletB}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('pins a user without outlets.view to their own outlet by default', async () => {
    const table = await createTable(adminToken, {
      table_number: `Meja ${randomUUID().slice(0, 8)}`,
      outlet_id: outletB,
    });
    expect(table.status).toBe(201);
    createdTableIds.push(table.body.id);

    const res = await request(app)
      .get('/api/tables')
      .set('Authorization', `Bearer ${cashierToken}`);

    expect(res.status).toBe(200);
    // Nothing from outlet B may leak into an unscoped request.
    expect(res.body.some((t: { id: string }) => t.id === table.body.id)).toBe(false);
  });
});

describe('products - outlet scoping', () => {
  it('still returns shared products when scoped to an outlet', async () => {
    // Every product currently has outlet_id null, i.e. it applies to all
    // branches. Filtering must not empty the menu.
    const res = await request(app)
      .get(`/api/products?outlet_id=${outletA}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('refuses a product listing for an outlet the user cannot access', async () => {
    const res = await request(app)
      .get(`/api/products?outlet_id=${outletB}`)
      .set('Authorization', `Bearer ${cashierToken}`);

    expect(res.status).toBe(403);
  });
});

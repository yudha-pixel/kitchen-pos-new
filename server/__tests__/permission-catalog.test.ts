import { describe, expect, it } from 'vitest';

import {
  ALL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSIONS,
  isPermissionName,
} from '../../src/config/permissions';
import { buildPermissionBackfillPlan } from '../lib/permissionBackfill';

describe('shared permission catalog', () => {
  it('contains unique module.action permission names', () => {
    expect(new Set(ALL_PERMISSIONS).size).toBe(ALL_PERMISSIONS.length);
    expect(ALL_PERMISSIONS.length).toBeGreaterThan(30);
    expect(ALL_PERMISSIONS.every((permission) => /^[a-z_]+\.[a-z_]+$/.test(permission))).toBe(true);
    expect(ALL_PERMISSIONS.every(isPermissionName)).toBe(true);
  });

  it('includes the high-risk capabilities used by route enforcement', () => {
    expect(ALL_PERMISSIONS).toEqual(expect.arrayContaining([
      PERMISSIONS.roles.assign,
      PERMISSIONS.users.delete,
      PERMISSIONS.settings.securityEdit,
      PERMISSIONS.orders.void,
      PERMISSIONS.orders.refund,
      PERMISSIONS.inventory.approve,
      PERMISSIONS.backup.restore,
      PERMISSIONS.backup.delete,
    ]));
  });

  it('assigns every permission to admin and owner', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.admin).toEqual(ALL_PERMISSIONS);
    expect(DEFAULT_ROLE_PERMISSIONS.owner).toEqual(ALL_PERMISSIONS);
  });

  it('uses the approved least-privilege defaults for management and cashier', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.management).not.toContain(PERMISSIONS.roles.assign);
    expect(DEFAULT_ROLE_PERMISSIONS.management).not.toContain(PERMISSIONS.users.delete);
    expect(DEFAULT_ROLE_PERMISSIONS.management).not.toContain(PERMISSIONS.settings.securityEdit);
    expect(DEFAULT_ROLE_PERMISSIONS.management).not.toContain(PERMISSIONS.orders.void);
    expect(DEFAULT_ROLE_PERMISSIONS.management).not.toContain(PERMISSIONS.inventory.approve);
    expect(DEFAULT_ROLE_PERMISSIONS.management).not.toContain(PERMISSIONS.backup.restore);

    expect(DEFAULT_ROLE_PERMISSIONS.cashier).toEqual([
      PERMISSIONS.products.view,
      PERMISSIONS.orders.view,
      PERMISSIONS.orders.create,
      PERMISSIONS.orders.edit,
      PERMISSIONS.tables.view,
      PERMISSIONS.tables.edit,
      PERMISSIONS.printing.use,
      PERMISSIONS.reports.view,
    ]);
  });
});

describe('permission backfill planning', () => {
  it('adds missing defaults, removes denied catalog grants, and leaves custom roles untouched', () => {
    const plan = buildPermissionBackfillPlan({
      permissions: [PERMISSIONS.products.view, PERMISSIONS.orders.void, 'custom.special'],
      roles: {
        admin: [PERMISSIONS.products.view],
        owner: [],
        management: [PERMISSIONS.orders.void, 'custom.special'],
        cashier: [PERMISSIONS.products.view],
        custom_manager: [PERMISSIONS.orders.void],
      },
    });

    expect(plan.permissionsToCreate).toContain(PERMISSIONS.roles.assign);
    expect(plan.assignmentsToCreate).toContainEqual({ role: 'admin', permission: PERMISSIONS.orders.void });
    expect(plan.assignmentsToDelete).toContainEqual({ role: 'management', permission: PERMISSIONS.orders.void });
    expect(plan.assignmentsToDelete).not.toContainEqual({ role: 'management', permission: 'custom.special' });
    expect(plan.assignmentsToCreate.some((entry) => String(entry.role) === 'custom_manager')).toBe(false);
    expect(plan.assignmentsToDelete.some((entry) => String(entry.role) === 'custom_manager')).toBe(false);
  });
});

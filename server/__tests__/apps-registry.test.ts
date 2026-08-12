import { describe, expect, it } from 'vitest';

import {
  APPS_REGISTRY,
  filterApps,
  findModuleForPath,
  getAppsRegistry,
} from '../../src/config/navigation';
import { PERMISSIONS } from '../../src/config/permissions';

describe('APPS_REGISTRY', () => {
  it('returns non-empty list of valid app definitions', () => {
    const apps = getAppsRegistry();
    expect(apps.length).toBeGreaterThan(0);

    for (const app of apps) {
      expect(app.id).toBeTruthy();
      expect(app.title).toBeTruthy();
      expect(app.description).toBeTruthy();
      expect(app.route).toMatch(/^\//);
      expect(app.subLinks.length).toBeGreaterThan(0);
      for (const sub of app.subLinks) {
        expect(sub.label).toBeTruthy();
        expect(sub.href).toMatch(/^\//);
      }
    }
  });

  it('filters apps by query search string matching title, description or keywords', () => {
    const apps = getAppsRegistry();

    const kitchenApps = filterApps(apps, 'kds');
    expect(kitchenApps.length).toBeGreaterThan(0);
    expect(kitchenApps.some((a) => a.id === 'kitchen')).toBe(true);

    const stokApps = filterApps(apps, 'stok');
    expect(stokApps.length).toBeGreaterThan(0);
    expect(stokApps.some((a) => a.id === 'inventory')).toBe(true);

    const emptyFilter = filterApps(apps, 'nonexistentxyzterm123');
    expect(emptyFilter.length).toBe(0);
  });

  it('filters apps by required capabilities', () => {
    const apps = getAppsRegistry();
    const reportOnlyApps = filterApps(apps, '', [PERMISSIONS.reports.view]);
    expect(reportOnlyApps.map((app) => app.id)).toEqual(['reports']);
    expect(APPS_REGISTRY.every((app) => Boolean(app.requiredPermission))).toBe(true);
    expect(APPS_REGISTRY.every((app) => app.subLinks.every((link) => Boolean(link.requiredPermission)))).toBe(true);
  });

  it('exposes the complete inventory navigation from the approved wireframe', () => {
    const inventory = APPS_REGISTRY.find((app) => app.id === 'inventory');

    expect(inventory?.subLinks.map((link) => link.label)).toEqual([
      'All Items',
      'Stock Approvals',
      'Categories',
      'Stock Adjustments',
      'Stock Transfers',
      'Suppliers',
      'Automation',
    ]);
    expect(inventory?.subLinks.every((link) => link.iconName)).toBe(true);
    expect(findModuleForPath('/inventory-suppliers')?.id).toBe('inventory');
    expect(findModuleForPath('/products')?.id).toBe('menu-products');
  });
});

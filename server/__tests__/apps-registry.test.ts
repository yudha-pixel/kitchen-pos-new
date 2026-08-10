import { describe, expect, it } from 'vitest';

import {
  APPS_REGISTRY,
  filterApps,
  getAppsRegistry,
} from '../../src/features/apps/apps-registry';

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

  it('filters apps by allowed roles when specified', () => {
    const apps = getAppsRegistry();
    const adminApps = filterApps(apps, '', 'admin');
    expect(adminApps.length).toBe(APPS_REGISTRY.length);
  });
});

import { describe, expect, it } from 'vitest';

import {
  LEGACY_ROUTE_REDIRECTS,
  normalizePreferenceRoute,
  normalizeUserPreferences,
} from '../../src/config/routes';

describe('business route migration aliases', () => {
  it('maps every legacy admin route to its canonical business route', () => {
    expect(LEGACY_ROUTE_REDIRECTS).toEqual([
      { source: '/admin', destination: '/apps', permanent: true },
      { source: '/admin/attendance', destination: '/attendance', permanent: true },
      { source: '/admin/crm', destination: '/crm', permanent: true },
      { source: '/admin/discount-reports', destination: '/reports/discounts', permanent: true },
      { source: '/admin/hr', destination: '/hr', permanent: true },
      { source: '/admin/modules', destination: '/settings/modules', permanent: true },
      { source: '/admin/outlets', destination: '/settings/outlets', permanent: true },
      { source: '/admin/products', destination: '/products', permanent: true },
      { source: '/admin/promotions', destination: '/promotions', permanent: true },
      { source: '/admin/reports', destination: '/reports', permanent: true },
      { source: '/admin/settings', destination: '/settings', permanent: true },
      { source: '/admin/vouchers', destination: '/promotions/vouchers', permanent: true },
    ]);
  });

  it('normalizes legacy routes while preserving query strings', () => {
    expect(normalizePreferenceRoute('/admin/products')).toBe('/products');
    expect(normalizePreferenceRoute('/admin/products?category=food')).toBe('/products?category=food');
    expect(normalizePreferenceRoute('/inventory?view=adjustments')).toBe('/inventory?view=adjustments');
  });

  it('deduplicates favorites and recent items after normalization', () => {
    expect(normalizeUserPreferences({
      favorites: ['/admin/products', '/products', '/admin/settings'],
      recent: [
        { route: '/admin/crm', title: 'CRM lama', timestamp: '2026-08-12T01:00:00.000Z' },
        { route: '/crm', title: 'CRM baru', timestamp: '2026-08-12T02:00:00.000Z' },
      ],
    })).toEqual({
      favorites: ['/products', '/settings'],
      recent: [
        { route: '/crm', title: 'CRM lama', timestamp: '2026-08-12T01:00:00.000Z' },
      ],
    });
  });
});

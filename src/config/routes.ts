export const LEGACY_ROUTE_REDIRECTS = [
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
  { source: '/inventory/purchase-requisitions', destination: '/purchase/requisitions', permanent: true },
  { source: '/inventory/quotation-requests', destination: '/purchase/quotations', permanent: true },
  { source: '/inventory/quotations', destination: '/purchase/quotations', permanent: true },
  { source: '/inventory/purchase-orders', destination: '/purchase/orders', permanent: true },
  { source: '/inventory/goods-received-notes', destination: '/purchase/goods-received', permanent: true },
  { source: '/inventory/invoices', destination: '/purchase/invoices', permanent: true },
  { source: '/inventory/supplier-payments', destination: '/finance/supplier-payments', permanent: true },
] as const;

const ROUTE_ALIASES = new Map<string, string>(
  LEGACY_ROUTE_REDIRECTS.map(({ source, destination }) => [source, destination]),
);

export interface RoutePreferenceItem {
  route: string;
  title: string;
  timestamp: string;
}

export interface RoutePreferences {
  favorites?: string[];
  recent?: RoutePreferenceItem[];
}

export function normalizePreferenceRoute(route: string): string {
  const queryIndex = route.indexOf('?');
  const pathname = queryIndex >= 0 ? route.slice(0, queryIndex) : route;
  const query = queryIndex >= 0 ? route.slice(queryIndex) : '';
  return `${ROUTE_ALIASES.get(pathname) ?? pathname}${query}`;
}

export function normalizeUserPreferences(preferences: RoutePreferences) {
  const favorites = [...new Set((preferences.favorites ?? []).map(normalizePreferenceRoute))];
  const seenRecent = new Set<string>();
  const recent = (preferences.recent ?? []).flatMap((item) => {
    const route = normalizePreferenceRoute(item.route);
    if (seenRecent.has(route)) return [];
    seenRecent.add(route);
    return [{ ...item, route }];
  });

  return { favorites, recent };
}

# Route Ownership and Compatibility Map

Canonical pages live in business namespaces. Legacy routes remain compatibility inputs only and redirect permanently with HTTP 308.

| Legacy | Canonical | Owner |
|---|---|---|
| `/admin` | `/apps` | authenticated launcher |
| `/admin/attendance` | `/attendance` | attendance |
| `/admin/crm` | `/crm` | CRM |
| `/admin/discount-reports` | `/reports/discounts` | reports |
| `/admin/hr` | `/hr` | HR and payroll |
| `/admin/modules` | `/settings/modules` | internal modules |
| `/admin/outlets` | `/settings/outlets` | outlet settings |
| `/admin/products` | `/products` | products |
| `/admin/promotions` | `/promotions` | promotions |
| `/admin/reports` | `/reports` | reports |
| `/admin/settings` | `/settings` | settings |
| `/admin/vouchers` | `/promotions/vouchers` | promotions |

`../../../src/config/routes.ts` is the single route-alias contract. `../../../next.config.ts` consumes it for permanent redirects. Saved favorites and recent items pass through the same normalizer when read and when written; canonical duplicates are removed.

Application navigation, seed data, and active tests emit canonical routes only. Historical archives may retain old paths as evidence and are not active navigation sources.


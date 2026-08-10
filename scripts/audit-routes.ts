import * as fs from 'fs';
import * as path from 'path';

interface RouteInfo {
  file: string;
  path: string;
  method: string;
  hasAuthMiddleware: boolean;
  hasRequireRole: boolean;
  hasRequirePermission: boolean;
  roles: string[];
  permissions: string[];
  accessLevel: 'public' | 'authenticated' | 'admin' | 'cashier' | 'multi-role' | 'permission';
  isSensitive: boolean;
}

interface AuditResult {
  totalRoutes: number;
  publicRoutes: number;
  authenticatedRoutes: number;
  adminOnlyRoutes: number;
  cashierOnlyRoutes: number;
  multiRoleRoutes: number;
  routes: RouteInfo[];
  criticalIssues: string[];
}

const ROUTES_DIR = path.join(__dirname, '..', 'server', 'routes');
const OUTPUT_FILE = path.join(__dirname, '..', 'route-audit-backend.json');

const SENSITIVE_OPERATIONS = [
  'delete',
  'void',
  'refund',
  'payment',
  'invoice',
  'backup',
  'restore',
  'settings',
  'user',
  'role',
  'permission',
  'approve',
  'reject',
];

function parseRouteFile(filePath: string): RouteInfo[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const routes: RouteInfo[] = [];

  // Check if file uses adminOnly middleware pattern
  const hasAdminOnlyPattern = content.includes('adminOnly') && content.includes('authMiddleware') && content.includes('requireRole');

  // Match route definitions like router.get('/', ...) or router.post('/login', ...)
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = routeRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const routePath = match[2];

    // Find the middleware for this route by looking at the lines after the route definition
    const routeStart = match.index;
    const routeEnd = content.indexOf(')', routeStart);
    const routeSection = content.substring(routeStart, routeEnd + 200); // Include some context

    const hasAuthMiddleware = routeSection.includes('authMiddleware') || routeSection.includes('...adminOnly') || routeSection.includes('webhookSignatureMiddleware');
    const hasRequireRole = routeSection.includes('requireRole') || routeSection.includes('...adminOnly');
    const hasRequirePermission =
      routeSection.includes('requirePermission') ||
      routeSection.includes('requireAnyPermission') ||
      routeSection.includes('requireAllPermissions');

    // Extract roles from requireRole calls
    const roles: string[] = [];
    const roleMatch = routeSection.match(/requireRole\s*\(\s*['"`]([^'"`]+)['"`]/g);
    if (roleMatch) {
      roleMatch.forEach((rm) => {
        const role = rm.match(/['"`]([^'"`]+)['"`]/);
        if (role && role[1]) {
          roles.push(role[1]);
        }
      });
    }

    // Extract permissions from permission helpers
    const permissions: string[] = [];
    const permissionMatch = routeSection.match(/require(?:Any|All)?Permission(?:s)?\s*\(([^)]*)\)/g);
    if (permissionMatch) {
      permissionMatch.forEach((pm) => {
        const perms = pm.match(/['"`]([^'"`]+)['"`]/g);
        if (perms) {
          perms.forEach((p) => {
            const clean = p.replace(/['"`]/g, '');
            if (clean) permissions.push(clean);
          });
        }
      });
    }

    // If adminOnly pattern is used and route uses it, add admin role
    if (routeSection.includes('...adminOnly') && hasAdminOnlyPattern) {
      roles.push('admin');
    }

    // Determine access level
    let accessLevel: RouteInfo['accessLevel'] = 'public';
    if (hasRequirePermission) {
      accessLevel = 'permission';
    } else if (hasRequireRole) {
      if (roles.length === 1) {
        accessLevel = roles[0] === 'admin' ? 'admin' : 'cashier';
      } else if (roles.length > 1) {
        accessLevel = 'multi-role';
      }
    } else if (hasAuthMiddleware) {
      accessLevel = 'authenticated';
    }

    // Check if operation is sensitive
    const isSensitive = SENSITIVE_OPERATIONS.some((op) => 
      fileName.toLowerCase().includes(op) || 
      routePath.toLowerCase().includes(op) ||
      method === 'DELETE'
    );

    routes.push({
      file: fileName,
      path: routePath,
      method,
      hasAuthMiddleware,
      hasRequireRole,
      hasRequirePermission,
      roles,
      permissions,
      accessLevel,
      isSensitive,
    });
  }

  return routes;
}

function auditRoutes(): AuditResult {
  const routeFiles = fs.readdirSync(ROUTES_DIR).filter((file) => file.endsWith('.ts'));
  
  const allRoutes: RouteInfo[] = [];
  const criticalIssues: string[] = [];

  for (const file of routeFiles) {
    const filePath = path.join(ROUTES_DIR, file);
    const routes = parseRouteFile(filePath);
    allRoutes.push(...routes);

    // Check for critical issues
    routes.forEach((route) => {
      if (route.isSensitive && !route.hasAuthMiddleware) {
        criticalIssues.push(
          `CRITICAL: ${route.file} ${route.method} ${route.path} - Sensitive operation without auth`
        );
      }
      if (route.isSensitive && route.accessLevel === 'public') {
        criticalIssues.push(
          `CRITICAL: ${route.file} ${route.method} ${route.path} - Sensitive operation is public`
        );
      }
    });
  }

  const result: AuditResult = {
    totalRoutes: allRoutes.length,
    publicRoutes: allRoutes.filter((r) => r.accessLevel === 'public').length,
    authenticatedRoutes: allRoutes.filter((r) => r.accessLevel === 'authenticated').length,
    adminOnlyRoutes: allRoutes.filter((r) => r.accessLevel === 'admin').length,
    cashierOnlyRoutes: allRoutes.filter((r) => r.accessLevel === 'cashier').length,
    multiRoleRoutes: allRoutes.filter((r) => r.accessLevel === 'multi-role').length,
    routes: allRoutes,
    criticalIssues,
  };

  return result;
}

function main() {
  console.log('🔍 Auditing backend routes...');
  
  const result = auditRoutes();

  console.log(`\n📊 Audit Results:`);
  console.log(`   Total routes: ${result.totalRoutes}`);
  console.log(`   Public: ${result.publicRoutes}`);
  console.log(`   Authenticated: ${result.authenticatedRoutes}`);
  console.log(`   Admin only: ${result.adminOnlyRoutes}`);
  console.log(`   Cashier only: ${result.cashierOnlyRoutes}`);
  console.log(`   Multi-role: ${result.multiRoleRoutes}`);
  console.log(`   Critical issues: ${result.criticalIssues.length}`);

  if (result.criticalIssues.length > 0) {
    console.log('\n⚠️  Critical Issues:');
    result.criticalIssues.forEach((issue) => console.log(`   - ${issue}`));
  }

  // Write output to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(`\n✅ Audit results saved to ${OUTPUT_FILE}`);
}

main();

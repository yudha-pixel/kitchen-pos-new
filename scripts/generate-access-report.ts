import * as fs from 'fs';
import * as path from 'path';

interface BackendRoute {
  file: string;
  path: string;
  method: string;
  hasAuthMiddleware: boolean;
  hasRequireRole: boolean;
  roles: string[];
  accessLevel: 'public' | 'authenticated' | 'admin' | 'cashier' | 'multi-role';
  isSensitive: boolean;
}

interface FrontendPage {
  file: string;
  route: string;
  hasAuthCheck: boolean;
  hasRoleCheck: boolean;
  roles: string[];
  hasRedirect: boolean;
  redirectTarget: string | null;
  accessLevel: 'public' | 'authenticated' | 'role-based';
  isSensitive: boolean;
}

interface BackendAudit {
  totalRoutes: number;
  publicRoutes: number;
  authenticatedRoutes: number;
  adminOnlyRoutes: number;
  cashierOnlyRoutes: number;
  multiRoleRoutes: number;
  routes: BackendRoute[];
  criticalIssues: string[];
}

interface FrontendAudit {
  totalPages: number;
  publicPages: number;
  authenticatedPages: number;
  roleBasedPages: number;
  pages: FrontendPage[];
  criticalIssues: string[];
}

const BACKEND_AUDIT_FILE = path.join(__dirname, '..', 'audit', 'route-audit-backend.json');
const FRONTEND_AUDIT_FILE = path.join(__dirname, '..', 'audit', 'route-audit-frontend.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'audit', 'route-access-control-report.md');

function generateReport(backendAudit: BackendAudit, frontendAudit: FrontendAudit): string {
  const lines: string[] = [];

  lines.push('# Route Access Control Audit Report');
  lines.push('');
  lines.push('**Generated:** ' + new Date().toISOString());
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push('### Backend Routes');
  lines.push(`- **Total routes audited:** ${backendAudit.totalRoutes}`);
  lines.push(`- **Public routes:** ${backendAudit.publicRoutes} (${((backendAudit.publicRoutes / backendAudit.totalRoutes) * 100).toFixed(1)}%)`);
  lines.push(`- **Authenticated routes:** ${backendAudit.authenticatedRoutes} (${((backendAudit.authenticatedRoutes / backendAudit.totalRoutes) * 100).toFixed(1)}%)`);
  lines.push(`- **Admin-only routes:** ${backendAudit.adminOnlyRoutes} (${((backendAudit.adminOnlyRoutes / backendAudit.totalRoutes) * 100).toFixed(1)}%)`);
  lines.push(`- **Cashier-only routes:** ${backendAudit.cashierOnlyRoutes} (${((backendAudit.cashierOnlyRoutes / backendAudit.totalRoutes) * 100).toFixed(1)}%)`);
  lines.push(`- **Multi-role routes:** ${backendAudit.multiRoleRoutes} (${((backendAudit.multiRoleRoutes / backendAudit.totalRoutes) * 100).toFixed(1)}%)`);
  lines.push(`- **Critical issues:** ${backendAudit.criticalIssues.length}`);
  lines.push('');

  lines.push('### Frontend Pages');
  lines.push(`- **Total pages audited:** ${frontendAudit.totalPages}`);
  lines.push(`- **Public pages:** ${frontendAudit.publicPages} (${((frontendAudit.publicPages / frontendAudit.totalPages) * 100).toFixed(1)}%)`);
  lines.push(`- **Authenticated pages:** ${frontendAudit.authenticatedPages} (${((frontendAudit.authenticatedPages / frontendAudit.totalPages) * 100).toFixed(1)}%)`);
  lines.push(`- **Role-based pages:** ${frontendAudit.roleBasedPages} (${((frontendAudit.roleBasedPages / frontendAudit.totalPages) * 100).toFixed(1)}%)`);
  lines.push(`- **Critical issues:** ${frontendAudit.criticalIssues.length}`);
  lines.push('');

  lines.push('### Overall');
  lines.push(`- **Total critical issues:** ${backendAudit.criticalIssues.length + frontendAudit.criticalIssues.length}`);
  lines.push('');

  // Backend Routes Table
  lines.push('## Backend Routes');
  lines.push('');
  lines.push('| File | Method | Path | Auth Level | Roles | Sensitive | Status |');
  lines.push('|------|--------|------|------------|-------|-----------|--------|');
  
  backendAudit.routes.forEach((route) => {
    const status = route.isSensitive && !route.hasAuthMiddleware ? '⚠️ ISSUE' : '✅ OK';
    lines.push(`| ${route.file} | ${route.method} | ${route.path} | ${route.accessLevel} | ${route.roles.join(', ') || 'N/A'} | ${route.isSensitive ? 'Yes' : 'No'} | ${status} |`);
  });
  lines.push('');

  // Frontend Pages Table
  lines.push('## Frontend Pages');
  lines.push('');
  lines.push('| File | Route | Auth Check | Role Check | Access Level | Sensitive | Status |');
  lines.push('|------|-------|------------|------------|--------------|-----------|--------|');
  
  frontendAudit.pages.forEach((page) => {
    const status = page.isSensitive && !page.hasAuthCheck && !page.hasRedirect ? '⚠️ ISSUE' : '✅ OK';
    lines.push(`| ${page.file} | ${page.route} | ${page.hasAuthCheck ? 'Yes' : 'No'} | ${page.hasRoleCheck ? 'Yes' : 'No'} | ${page.accessLevel} | ${page.isSensitive ? 'Yes' : 'No'} | ${status} |`);
  });
  lines.push('');

  // Critical Issues
  lines.push('## Critical Issues');
  lines.push('');
  
  if (backendAudit.criticalIssues.length > 0) {
    lines.push('### Backend Critical Issues');
    lines.push('');
    backendAudit.criticalIssues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue}`);
    });
    lines.push('');
  }

  if (frontendAudit.criticalIssues.length > 0) {
    lines.push('### Frontend Critical Issues');
    lines.push('');
    frontendAudit.criticalIssues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue}`);
    });
    lines.push('');
  }

  // Findings Analysis
  lines.push('## Findings Analysis');
  lines.push('');
  
  // Backend sensitive routes without auth
  const backendSensitiveNoAuth = backendAudit.routes.filter(
    (r) => r.isSensitive && !r.hasAuthMiddleware
  );
  if (backendSensitiveNoAuth.length > 0) {
    lines.push('### Backend: Sensitive Routes Without Authentication');
    lines.push('');
    lines.push('The following routes handle sensitive operations but lack authentication:');
    lines.push('');
    backendSensitiveNoAuth.forEach((route) => {
      lines.push(`- **${route.file}** ${route.method} ${route.path}`);
    });
    lines.push('');
  }

  // Frontend sensitive pages without auth
  const frontendSensitiveNoAuth = frontendAudit.pages.filter(
    (p) => p.isSensitive && !p.hasAuthCheck && !p.hasRedirect
  );
  if (frontendSensitiveNoAuth.length > 0) {
    lines.push('### Frontend: Sensitive Pages Without Authentication');
    lines.push('');
    lines.push('The following pages handle sensitive operations but lack authentication checks:');
    lines.push('');
    frontendSensitiveNoAuth.forEach((page) => {
      lines.push(`- **${page.file}** (${page.route})`);
    });
    lines.push('');
  }

  // Role inconsistency analysis
  lines.push('### Role Support Analysis');
  lines.push('');
  lines.push('**Current Role Support:**');
  lines.push('- Backend middleware supports: `admin`, `cashier`');
  lines.push('- Frontend AuthContext supports: `admin`, `management`, `cashier`, `owner`');
  lines.push('- **Inconsistency:** Backend does not support `management` and `owner` roles');
  lines.push('');

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');

  lines.push('### Critical Fixes (Immediate)');
  lines.push('');
  lines.push('1. **Add authentication to all sensitive backend routes**');
  lines.push('   - Add `authMiddleware` to all DELETE routes');
  lines.push('   - Add `authMiddleware` to user management routes (GET, POST, PUT, PATCH)');
  lines.push('   - Add `authMiddleware` to settings routes');
  lines.push('   - Add `authMiddleware` to payment webhook routes');
  lines.push('');
  
  lines.push('2. **Add authentication to all sensitive frontend pages**');
  lines.push('   - Add auth checks to admin pages (discount-reports, outlets, promotions)');
  lines.push('   - Add auth checks to inventory-suppliers page');
  lines.push('   - Add auth checks to pos/settings page');
  lines.push('');

  lines.push('3. **Fix role inconsistency between backend and frontend**');
  lines.push('   - Update backend middleware to support `management` and `owner` roles');
  lines.push('   - Update `TokenPayload` type in `server/middleware/auth.ts`');
  lines.push('   - Update `requireRole` function to accept all four roles');
  lines.push('');

  lines.push('### High Priority (This Sprint)');
  lines.push('');
  lines.push('1. **Standardize auth patterns across all routes**');
  lines.push('   - Ensure all admin-only routes use `requireRole(\'admin\')`');
  lines.push('   - Ensure all cashier routes use `requireRole(\'cashier\')`');
  lines.push('   - Document which routes should be accessible to which roles');
  lines.push('');
  
  lines.push('2. **Add role-based UI restrictions to frontend**');
  lines.push('   - Implement role checks in admin pages');
  lines.push('   - Hide/show UI elements based on user role');
  lines.push('   - Add consistent error messages for access denied');
  lines.push('');

  lines.push('3. **Add role checks to user management routes**');
  lines.push('   - All user routes should require admin role');
  lines.push('   - Prevent privilege escalation');
  lines.push('');

  lines.push('### Medium Priority (Next Sprint)');
  lines.push('');
  lines.push('1. **Implement fine-grained permissions**');
  lines.push('   - Use the Permission and RolePermission tables in the database');
  lines.push('   - Create permission checking middleware');
  lines.push('   - Move beyond simple role-based access control');
  lines.push('');
  
  lines.push('2. **Add audit logging for access violations**');
  lines.push('   - Log all 401 and 403 errors');
  lines.push('   - Track which users attempt to access unauthorized resources');
  lines.push('   - Create audit reports for security monitoring');
  lines.push('');

  lines.push('3. **Create role management UI**');
  lines.push('   - Admin interface to manage roles and permissions');
  lines.push('   - UI to assign roles to users');
  lines.push('   - UI to view and modify permissions');
  lines.push('');

  lines.push('### Low Priority (Backlog)');
  lines.push('');
  lines.push('1. **Add role-based API rate limiting**');
  lines.push('   - Different rate limits for different roles');
  lines.push('   - Prevent abuse from lower-privileged users');
  lines.push('');
  
  lines.push('2. **Implement session-based access controls**');
  lines.push('   - Track active sessions');
  lines.push('   - Allow users to revoke sessions');
  lines.push('   - Implement session timeout');
  lines.push('');
  
  lines.push('3. **Add IP-based restrictions for admin operations**');
  lines.push('   - Restrict admin access to specific IP ranges');
  lines.push('   - Add IP whitelisting for sensitive operations');
  lines.push('');

  // Test Credentials
  lines.push('## Test Credentials');
  lines.push('');
  lines.push('The following test users have been created in the seed data:');
  lines.push('');
  lines.push('| Username | Password | Role | Outlet |');
  lines.push('|----------|----------|------|--------|');
  lines.push('| admin | admin | admin | OUT-001 (Outlet Pusat) |');
  lines.push('| cashier1 | cashier123 | cashier | OUT-001 (Outlet Pusat) |');
  lines.push('| manager1 | manager123 | management | OUT-002 (Outlet Cabang Senopati) |');
  lines.push('| owner1 | owner123 | owner | OUT-003 (Outlet Cabang BSD) |');
  lines.push('| admin2 | admin123 | admin | OUT-001 (Outlet Pusat) |');
  lines.push('');

  // Testing Instructions
  lines.push('## Testing Instructions');
  lines.push('');
  lines.push('### Multi-Device Testing');
  lines.push('');
  lines.push('To test access control on multiple devices:');
  lines.push('');
  lines.push('1. **Ensure the dev server is accessible on your LAN**');
  lines.push('   - Start the dev server: `npm run dev`');
  lines.push('   - Find your machine\'s IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)');
  lines.push('   - Access from other devices: `http://YOUR_IP:3000`');
  lines.push('');
  lines.push('2. **Test with different roles on different devices**');
  lines.push('   - Device 1: Login as `admin` - should access all pages');
  lines.push('   - Device 2: Login as `cashier1` - should access POS, not admin pages');
  lines.push('   - Device 3: Login as `manager1` - should access management pages');
  lines.push('   - Device 4: Login as `owner1` - should access all pages');
  lines.push('');
  lines.push('3. **Test specific scenarios**');
  lines.push('   - Try accessing admin pages with cashier account (should be denied)');
  lines.push('   - Try accessing user management with non-admin account (should be denied)');
  lines.push('   - Try accessing settings with non-admin account (should be denied)');
  lines.push('   - Verify that public pages (login, order/[tableId]) work without auth');
  lines.push('');

  lines.push('### API Testing');
  lines.push('');
  lines.push('Use the test credentials to test API endpoints:');
  lines.push('');
  lines.push('```bash');
  lines.push('# Login and get token');
  lines.push('curl -X POST http://localhost:3000/api/auth/login \\');
  lines.push('  -H "Content-Type: application/json" \\');
  lines.push('  -d \'{"username":"admin","password":"admin"}\'');
  lines.push('');
  lines.push('# Use token to access protected route');
  lines.push('curl -X GET http://localhost:3000/api/users \\');
  lines.push('  -H "Authorization: Bearer YOUR_TOKEN"');
  lines.push('```');
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*This report was generated automatically by the route access control audit script.');
  lines.push('*For questions or updates, refer to the audit scripts in the `scripts/` directory.');

  return lines.join('\n');
}

function main() {
  console.log('📝 Generating comprehensive access control report...');

  // Read audit files
  if (!fs.existsSync(BACKEND_AUDIT_FILE)) {
    console.error('❌ Backend audit file not found. Run audit-routes.ts first.');
    process.exit(1);
  }

  if (!fs.existsSync(FRONTEND_AUDIT_FILE)) {
    console.error('❌ Frontend audit file not found. Run audit-pages.ts first.');
    process.exit(1);
  }

  const backendAudit: BackendAudit = JSON.parse(fs.readFileSync(BACKEND_AUDIT_FILE, 'utf-8'));
  const frontendAudit: FrontendAudit = JSON.parse(fs.readFileSync(FRONTEND_AUDIT_FILE, 'utf-8'));

  // Generate report
  const report = generateReport(backendAudit, frontendAudit);

  // Write report
  fs.writeFileSync(OUTPUT_FILE, report);
  console.log(`✅ Comprehensive report saved to ${OUTPUT_FILE}`);
  
  console.log('\n📊 Report Summary:');
  console.log(`   Backend routes: ${backendAudit.totalRoutes}`);
  console.log(`   Frontend pages: ${frontendAudit.totalPages}`);
  console.log(`   Total critical issues: ${backendAudit.criticalIssues.length + frontendAudit.criticalIssues.length}`);
}

main();

import * as fs from 'fs';
import * as path from 'path';

interface PageInfo {
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

interface AuditResult {
  totalPages: number;
  publicPages: number;
  authenticatedPages: number;
  roleBasedPages: number;
  pages: PageInfo[];
  criticalIssues: string[];
}

const APP_DIR = path.join(__dirname, '..', 'app');
const OUTPUT_FILE = path.join(__dirname, '..', 'route-audit-frontend.json');

const SENSITIVE_PATHS = [
  'admin',
  'finance',
  'hr',
  'settings',
  'inventory',
  'suppliers',
  'invoices',
  'purchase-orders',
  'stock',
  'reports',
];

function getRouteFromFilePath(filePath: string): string {
  const relativePath = path.relative(APP_DIR, filePath);
  const dirName = path.dirname(relativePath);
  const fileName = path.basename(relativePath, '.tsx');
  
  if (fileName === 'page') {
    if (dirName === '.') return '/';
    return `/${dirName}`;
  }
  return `/${dirName}/${fileName}`;
}

function parsePageFile(filePath: string): PageInfo {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const route = getRouteFromFilePath(filePath);

  // Check for auth-related imports and usage
  const hasAuthCheck = content.includes('useAuth') || 
                      content.includes('AuthContext') ||
                      content.includes('getToken');
  
  // Check for role-based checks
  const hasRoleCheck = content.includes('user.role') || 
                      content.includes('role ===') ||
                      content.includes('role ===');
  
  // Extract roles mentioned in the file
  const roles: string[] = [];
  const roleMatches = content.match(/role\s*[=!]==\s*['"`]([^'"`]+)['"`]/g);
  if (roleMatches) {
    roleMatches.forEach((match) => {
      const role = match.match(/['"`]([^'"`]+)['"`]/);
      if (role && role[1]) {
        roles.push(role[1]);
      }
    });
  }

  // Check for redirects
  const hasRedirect = content.includes('router.push') || content.includes('router.replace');
  let redirectTarget: string | null = null;
  const redirectMatch = content.match(/router\.(?:push|replace)\s*\(\s*['"`]([^'"`]+)['"`]/);
  if (redirectMatch) {
    redirectTarget = redirectMatch[1];
  }

  // Determine access level
  let accessLevel: PageInfo['accessLevel'] = 'public';
  if (hasRoleCheck) {
    accessLevel = 'role-based';
  } else if (hasAuthCheck || hasRedirect) {
    accessLevel = 'authenticated';
  }

  // Check if page is sensitive
  const isSensitive = SENSITIVE_PATHS.some((sensitivePath) => 
    route.includes(sensitivePath)
  );

  return {
    file: fileName,
    route,
    hasAuthCheck,
    hasRoleCheck,
    roles,
    hasRedirect,
    redirectTarget,
    accessLevel,
    isSensitive,
  };
}

function auditPages(): AuditResult {
  const pageFiles: string[] = [];
  
  function findPageFiles(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findPageFiles(fullPath);
      } else if (entry.name === 'page.tsx') {
        pageFiles.push(fullPath);
      }
    }
  }
  
  findPageFiles(APP_DIR);
  
  const allPages: PageInfo[] = [];
  const criticalIssues: string[] = [];

  for (const file of pageFiles) {
    const pageInfo = parsePageFile(file);
    allPages.push(pageInfo);

    // Check for critical issues
    if (pageInfo.isSensitive && !pageInfo.hasAuthCheck && !pageInfo.hasRedirect) {
      criticalIssues.push(
        `CRITICAL: ${pageInfo.file} (${pageInfo.route}) - Sensitive page without auth check or redirect`
      );
    }
    if (pageInfo.isSensitive && pageInfo.accessLevel === 'public') {
      criticalIssues.push(
        `CRITICAL: ${pageInfo.file} (${pageInfo.route}) - Sensitive page is public`
      );
    }
  }

  const result: AuditResult = {
    totalPages: allPages.length,
    publicPages: allPages.filter((p) => p.accessLevel === 'public').length,
    authenticatedPages: allPages.filter((p) => p.accessLevel === 'authenticated').length,
    roleBasedPages: allPages.filter((p) => p.accessLevel === 'role-based').length,
    pages: allPages,
    criticalIssues,
  };

  return result;
}

function main() {
  console.log('🔍 Auditing frontend pages...');
  
  const result = auditPages();

  console.log(`\n📊 Audit Results:`);
  console.log(`   Total pages: ${result.totalPages}`);
  console.log(`   Public: ${result.publicPages}`);
  console.log(`   Authenticated: ${result.authenticatedPages}`);
  console.log(`   Role-based: ${result.roleBasedPages}`);
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

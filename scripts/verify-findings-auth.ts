import { chromium, type Browser, type Page, type BrowserContext } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

interface FindingResult {
  id: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL' | 'UNVERIFIED';
  evidence: string;
}

const results: FindingResult[] = [];

async function login(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Wait for login form
    await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 5000 });
    
    // Fill in credentials (using test credentials from seed)
    const emailInput = await page.locator('input[type="email"], input[type="text"]').first();
    await emailInput.fill('admin@kitchenpos.com');
    
    const passwordInput = await page.locator('input[type="password"]').first();
    await passwordInput.fill('admin123');
    
    // Submit form
    const submitButton = await page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for redirect to apps or dashboard
    await page.waitForURL(url => url.toString().includes('/apps') || url.toString().includes('/pos'), { timeout: 5000 });
    
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

async function testP1_01_AuthStateRace(page: Page): Promise<FindingResult> {
  const result: FindingResult = {
    id: 'P1-01',
    description: 'Authentication and authorization truth inconsistency - protected UI rendering before login completion',
    status: 'PASS',
    evidence: '',
  };
  
  try {
    // Navigate to a protected route while not authenticated
    await page.goto(`${BASE_URL}/apps`, { waitUntil: 'networkidle' });
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      result.status = 'PASS';
      result.evidence = 'Protected route /apps correctly redirects to /login when unauthenticated';
    } else {
      result.status = 'FAIL';
      result.evidence = `Protected route /apps did not redirect to login. Current URL: ${currentUrl}`;
    }
  } catch (error) {
    result.status = 'UNVERIFIED';
    result.evidence = `Error during test: ${error}`;
  }
  
  return result;
}

async function testP1_13_NativeDialogs(page: Page): Promise<FindingResult> {
  const result: FindingResult = {
    id: 'P1-13',
    description: 'Native dialogs and blocking feedback - window.alert, window.confirm, window.prompt usage',
    status: 'PASS',
    evidence: '',
  };
  
  try {
    const dialogPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    
    const dialog = await dialogPromise;
    if (dialog) {
      result.status = 'FAIL';
      result.evidence = `Native dialog detected: ${dialog.type()} - ${dialog.message()}`;
    } else {
      result.status = 'PASS';
      result.evidence = 'No native dialogs detected during navigation to settings page';
    }
  } catch (error) {
    result.status = 'UNVERIFIED';
    result.evidence = `Error during test: ${error}`;
  }
  
  return result;
}

async function testP1_17_PublicRoot(page: Page): Promise<FindingResult> {
  const result: FindingResult = {
    id: 'P1-17',
    description: 'Public root as Next.js starter - should redirect to /apps or /login',
    status: 'PASS',
    evidence: '',
  };
  
  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    const currentUrl = page.url();
    if (currentUrl === `${BASE_URL}/apps` || currentUrl.includes('/login')) {
      result.status = 'PASS';
      result.evidence = `Root correctly redirects to ${currentUrl.replace(BASE_URL, '')}`;
    } else {
      result.status = 'FAIL';
      result.evidence = `Root did not redirect. Current URL: ${currentUrl}`;
    }
  } catch (error) {
    result.status = 'UNVERIFIED';
    result.evidence = `Error during test: ${error}`;
  }
  
  return result;
}

async function testResponsiveDesign(page: Page): Promise<FindingResult> {
  const result: FindingResult = {
    id: 'P1-02',
    description: 'Fixed desktop shell causing mobile reflow failure',
    status: 'PASS',
    evidence: '',
  };
  
  try {
    const viewports = [
      { width: 360, height: 800, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1366, height: 768, name: 'desktop' },
    ];
    
    const viewportResults: string[] = [];
    
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/apps`, { waitUntil: 'networkidle' });
      
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      
      if (bodyWidth > viewportWidth) {
        viewportResults.push(`${vp.name}: Horizontal overflow detected (${bodyWidth}px vs ${viewportWidth}px)`);
      } else {
        viewportResults.push(`${vp.name}: No horizontal overflow`);
      }
    }
    
    result.evidence = viewportResults.join('; ');
    
    if (viewportResults.some(r => r.includes('overflow'))) {
      result.status = 'FAIL';
    } else {
      result.status = 'PASS';
    }
  } catch (error) {
    result.status = 'UNVERIFIED';
    result.evidence = `Error during test: ${error}`;
  }
  
  return result;
}

async function testNewFeature_SingleCompany(page: Page): Promise<FindingResult> {
  const result: FindingResult = {
    id: 'NEW-01',
    description: 'Single-company model - /settings/company route',
    status: 'PASS',
    evidence: '',
  };
  
  try {
    // First test unauthenticated access (should redirect to login)
    await page.goto(`${BASE_URL}/settings/company`, { waitUntil: 'networkidle' });
    const unauthUrl = page.url();
    
    if (!unauthUrl.includes('/login')) {
      result.status = 'FAIL';
      result.evidence = `Unauthenticated access did not redirect to login. URL: ${unauthUrl}`;
      return result;
    }
    
    // Login and test authenticated access
    const loggedIn = await login(page);
    if (!loggedIn) {
      result.status = 'UNVERIFIED';
      result.evidence = 'Could not authenticate to test protected route';
      return result;
    }
    
    await page.goto(`${BASE_URL}/settings/company`, { waitUntil: 'networkidle' });
    const authUrl = page.url();
    
    if (authUrl.includes('/settings/company')) {
      result.status = 'PASS';
      result.evidence = 'Single-company settings page loads successfully after authentication; unauthenticated access correctly redirects to login';
    } else {
      result.status = 'FAIL';
      result.evidence = `Settings/company route did not load after authentication. Redirected to: ${authUrl}`;
    }
  } catch (error) {
    result.status = 'UNVERIFIED';
    result.evidence = `Error during test: ${error}`;
  }
  
  return result;
}

async function testNewFeature_InventoryRoutes(page: Page): Promise<FindingResult> {
  const result: FindingResult = {
    id: 'NEW-02',
    description: 'New inventory sub-routes (GRN, invoices, POs)',
    status: 'PASS',
    evidence: '',
  };
  
  try {
    const routes = [
      '/inventory/goods-received-notes',
      '/inventory/invoices',
      '/inventory/purchase-orders',
    ];
    
    const routeResults: string[] = [];
    
    // Login first
    const loggedIn = await login(page);
    if (!loggedIn) {
      result.status = 'UNVERIFIED';
      result.evidence = 'Could not authenticate to test protected routes';
      return result;
    }
    
    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      const currentUrl = page.url();
      
      if (currentUrl.includes(route)) {
        routeResults.push(`${route}: Loads successfully`);
      } else {
        routeResults.push(`${route}: Failed to load (redirected to ${currentUrl})`);
      }
    }
    
    result.evidence = routeResults.join('; ');
    
    if (routeResults.every(r => r.includes('successfully'))) {
      result.status = 'PASS';
    } else {
      result.status = 'PARTIAL';
    }
  } catch (error) {
    result.status = 'UNVERIFIED';
    result.evidence = `Error during test: ${error}`;
  }
  
  return result;
}

async function main() {
  console.log('Starting prior findings verification with authentication...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Test P1-01: Auth state race (unauthenticated)
  console.log('Testing P1-01: Auth state race...');
  results.push(await testP1_01_AuthStateRace(page));
  
  // Test P1-13: Native dialogs (unauthenticated)
  console.log('Testing P1-13: Native dialogs...');
  results.push(await testP1_13_NativeDialogs(page));
  
  // Test P1-17: Public root (unauthenticated)
  console.log('Testing P1-17: Public root...');
  results.push(await testP1_17_PublicRoot(page));
  
  // Test P1-02: Responsive design (unauthenticated, but apps redirects to login)
  console.log('Testing P1-02: Responsive design...');
  results.push(await testResponsiveDesign(page));
  
  // Test new features (requires authentication)
  console.log('Testing NEW-01: Single-company model...');
  results.push(await testNewFeature_SingleCompany(page));
  
  console.log('Testing NEW-02: New inventory routes...');
  results.push(await testNewFeature_InventoryRoutes(page));
  
  await browser.close();
  
  // Print results
  console.log('\n=== VERIFICATION RESULTS ===\n');
  for (const result of results) {
    console.log(`[${result.id}] ${result.status}`);
    console.log(`  Description: ${result.description}`);
    console.log(`  Evidence: ${result.evidence}\n`);
  }
  
  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  const unverified = results.filter(r => r.status === 'UNVERIFIED').length;
  
  console.log('=== SUMMARY ===');
  console.log(`Total: ${results.length}`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);
  console.log(`PARTIAL: ${partial}`);
  console.log(`UNVERIFIED: ${unverified}`);
}

main().catch(console.error);

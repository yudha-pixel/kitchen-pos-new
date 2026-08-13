import { chromium, type Browser, type Page, type BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = 'C:\\Users\\sukma\\.codex\\visualizations\\2026\\08\\12\\kitchen-pos-review-20260812\\screenshots';

// All 38 routes discovered
const ROUTES = [
  // Core
  { path: '/', name: 'root-redirect' },
  { path: '/login', name: 'login' },
  { path: '/apps', name: 'apps-launcher' },
  
  // Sales
  { path: '/pos', name: 'pos-main' },
  { path: '/pos/meja', name: 'pos-meja' },
  { path: '/pos/requests', name: 'pos-requests' },
  { path: '/pos/settings', name: 'pos-settings' },
  { path: '/waiter', name: 'waiter' },
  { path: '/kitchen', name: 'kitchen' },
  { path: '/online-order', name: 'online-order' },
  { path: '/order/1', name: 'order-table' },
  { path: '/order-status/1', name: 'order-status' },
  { path: '/shift', name: 'shift' },
  
  // Inventory
  { path: '/inventory', name: 'inventory-main' },
  { path: '/inventory/automation', name: 'inventory-automation' },
  { path: '/inventory/mapping', name: 'inventory-mapping' },
  { path: '/inventory/stock-approvals', name: 'inventory-stock-approvals' },
  { path: '/inventory/goods-received-notes', name: 'inventory-grn' },
  { path: '/inventory/invoices', name: 'inventory-invoices' },
  { path: '/inventory/purchase-orders', name: 'inventory-po' },
  { path: '/inventory/quotation-requests', name: 'inventory-quotation-requests' },
  { path: '/inventory/quotations', name: 'inventory-quotations' },
  { path: '/inventory/supplier-payments', name: 'inventory-supplier-payments' },
  { path: '/inventory-suppliers', name: 'inventory-suppliers' },
  
  // CRM & Marketing
  { path: '/crm', name: 'crm' },
  { path: '/promotions', name: 'promotions' },
  { path: '/promotions/vouchers', name: 'promotions-vouchers' },
  
  // Workforce & Finance
  { path: '/finance/ocr', name: 'finance-ocr' },
  { path: '/hr', name: 'hr' },
  { path: '/reports/discounts', name: 'reports-discounts' },
  { path: '/reports', name: 'reports' },
  
  // Settings
  { path: '/settings', name: 'settings-main' },
  { path: '/settings/company', name: 'settings-company' },
  { path: '/settings/modules', name: 'settings-modules' },
  { path: '/settings/outlets', name: 'settings-outlets' },
  
  // Products
  { path: '/products', name: 'products' },
  
  // Attendance
  { path: '/attendance', name: 'attendance' },
];

// Baseline viewports
const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'desktop', width: 1366, height: 768 },
];

// Priority routes for 6-viewport deep coverage (prior findings + new features)
const PRIORITY_ROUTES = [
  '/login',
  '/apps',
  '/pos',
  '/settings/company',
  '/inventory/goods-received-notes',
  '/inventory/invoices',
  '/inventory/purchase-orders',
];

const DEEP_VIEWPORTS = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'desktop-small', width: 1366, height: 768 },
  { name: 'desktop-large', width: 1440, height: 900 },
  { name: 'desktop-xl', width: 1920, height: 1080 },
];

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function captureScreenshot(
  page: Page,
  route: { path: string; name: string },
  viewport: { name: string; width: number; height: number },
  outputDir: string
) {
  const filename = `${route.name}-${viewport.name}.png`;
  const filepath = path.join(outputDir, filename);
  
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Wait for any animations
  
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`✓ Captured: ${filename}`);
}

async function main() {
  console.log('Starting screenshot capture...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Create output directories
  const baselineDir = path.join(OUTPUT_DIR, 'task-2', 'baseline');
  const deepDir = path.join(OUTPUT_DIR, 'task-3', 'deep-coverage');
  const newFeaturesDir = path.join(OUTPUT_DIR, 'task-4', 'new-features');
  
  ensureDir(baselineDir);
  ensureDir(deepDir);
  ensureDir(newFeaturesDir);
  
  console.log('\n=== Phase 1: Baseline screenshots (38 routes × 2 viewports) ===');
  for (const route of ROUTES) {
    for (const viewport of VIEWPORTS) {
      try {
        await captureScreenshot(page, route, viewport, baselineDir);
      } catch (error) {
        console.error(`✗ Failed: ${route.name}-${viewport.name}`, error);
      }
    }
  }
  
  console.log('\n=== Phase 2: Deep coverage for priority routes (7 routes × 6 viewports) ===');
  for (const routePath of PRIORITY_ROUTES) {
    const route = ROUTES.find(r => r.path === routePath);
    if (!route) continue;
    
    for (const viewport of DEEP_VIEWPORTS) {
      try {
        await captureScreenshot(page, route, viewport, deepDir);
      } catch (error) {
        console.error(`✗ Failed: ${route.name}-${viewport.name}`, error);
      }
    }
  }
  
  console.log('\n=== Phase 3: New features deep coverage ===');
  const newFeatureRoutes = [
    '/settings/company',
    '/inventory/goods-received-notes',
    '/inventory/invoices',
    '/inventory/purchase-orders',
  ];
  
  for (const routePath of newFeatureRoutes) {
    const route = ROUTES.find(r => r.path === routePath);
    if (!route) continue;
    
    for (const viewport of DEEP_VIEWPORTS) {
      try {
        await captureScreenshot(page, route, viewport, newFeaturesDir);
      } catch (error) {
        console.error(`✗ Failed: ${route.name}-${viewport.name}`, error);
      }
    }
  }
  
  await browser.close();
  console.log('\n✓ Screenshot capture complete!');
  console.log(`Total baseline screenshots: ${ROUTES.length * VIEWPORTS.length}`);
  console.log(`Total deep coverage screenshots: ${PRIORITY_ROUTES.length * DEEP_VIEWPORTS.length}`);
  console.log(`Total new features screenshots: ${newFeatureRoutes.length * DEEP_VIEWPORTS.length}`);
}

main().catch(console.error);

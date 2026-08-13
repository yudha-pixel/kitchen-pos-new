import { test, expect } from '@playwright/test';

test.describe('Procurement UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
  });

  test('Login and access procurement pages via apps launcher', async ({ page }) => {
    // Login with admin credentials
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL('**/apps', { timeout: 5000 });
    
    // Verify we're on the apps page
    await expect(page).toHaveURL(/\/apps/);
    await expect(page.locator('h1')).toContainText('All Modules');
    
    // Find and click on Purchase card
    const purchaseCard = page.locator('a[href="/inventory/suppliers"]').first();
    await expect(purchaseCard).toBeVisible();
    await purchaseCard.click();
    
    // Verify navigation to suppliers page
    await page.waitForURL('**/inventory-suppliers', { timeout: 5000 });
    await expect(page).toHaveURL(/\/inventory-suppliers/);
    
    // Navigate back to apps
    await page.goto('http://localhost:3000/apps');
    await page.waitForLoadState('networkidle');
    
    // Test each procurement sub-link
    const procurementLinks = [
      { label: 'Persetujuan Stok', href: '/inventory/stock-approvals' },
      { label: 'Permintaan Penawaran', href: '/inventory/quotation-requests' },
      { label: 'Penawaran Supplier', href: '/inventory/quotations' },
      { label: 'Purchase Order', href: '/inventory/purchase-orders' },
      { label: 'Goods Received Note', href: '/inventory/goods-received-notes' },
      { label: 'Invoice Supplier', href: '/inventory/invoices' },
      { label: 'Pembayaran Supplier', href: '/inventory/supplier-payments' },
    ];
    
    for (const link of procurementLinks) {
      await page.goto('http://localhost:3000/apps');
      await page.waitForLoadState('networkidle');
      
      const linkElement = page.locator(`a[href="${link.href}"]`).first();
      await expect(linkElement).toBeVisible({ timeout: 5000 });
      await linkElement.click();
      
      await page.waitForURL(`**${link.href}`, { timeout: 5000 });
      await expect(page).toHaveURL(new RegExp(link.href.replace('/', '\\/')));
      
      // Verify page title contains relevant text
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      
      console.log(`✅ ${link.label} page accessible`);
    }
  });

  test('Verify procurement pages have proper UI elements', async ({ page }) => {
    // Login
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/apps', { timeout: 5000 });
    
    // Test Stock Approvals page
    await page.goto('http://localhost:3000/inventory/stock-approvals');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Persetujuan Stok');
    await expect(page.locator('button:has-text("Buat Permintaan")')).toBeVisible();
    
    // Test Quotation Requests page
    await page.goto('http://localhost:3000/inventory/quotation-requests');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Permintaan Penawaran');
    await expect(page.locator('button:has-text("Buat Permintaan")')).toBeVisible();
    
    // Test Quotations page
    await page.goto('http://localhost:3000/inventory/quotations');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Penawaran Supplier');
    
    // Test Purchase Orders page
    await page.goto('http://localhost:3000/inventory/purchase-orders');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Purchase Order');
    await expect(page.locator('button:has-text("Buat PO")')).toBeVisible();
    
    // Test Goods Received Notes page
    await page.goto('http://localhost:3000/inventory/goods-received-notes');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Goods Received Note');
    await expect(page.locator('button:has-text("Buat GRN")')).toBeVisible();
    
    // Test Invoices page
    await page.goto('http://localhost:3000/inventory/invoices');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Invoice Supplier');
    await expect(page.locator('button:has-text("Buat Invoice")')).toBeVisible();
    
    // Test Supplier Payments page
    await page.goto('http://localhost:3000/inventory/supplier-payments');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Pembayaran Supplier');
    await expect(page.locator('button:has-text("Buat Pembayaran")')).toBeVisible();
    
    console.log('✅ All procurement pages have proper UI elements');
  });
});

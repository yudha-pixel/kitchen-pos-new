# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/procurement.spec.ts >> Procurement UI Tests >> Verify procurement pages have proper UI elements
- Location: tests/procurement.spec.ts:65:7

# Error details

```
Error: page.fill: Target page, context or browser has been closed
Call log:
  - waiting for locator('input[name="username"]')

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Procurement UI Tests', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Navigate to login page
  6   |     await page.goto('http://localhost:3000/login');
  7   |   });
  8   | 
  9   |   test('Login and access procurement pages via apps launcher', async ({ page }) => {
  10  |     // Login with admin credentials
  11  |     await page.fill('input[name="username"]', 'admin');
  12  |     await page.fill('input[name="password"]', 'admin');
  13  |     await page.click('button[type="submit"]');
  14  |     
  15  |     // Wait for navigation to complete
  16  |     await page.waitForURL('**/apps', { timeout: 5000 });
  17  |     
  18  |     // Verify we're on the apps page
  19  |     await expect(page).toHaveURL(/\/apps/);
  20  |     await expect(page.locator('h1')).toContainText('All Modules');
  21  |     
  22  |     // Find and click on Purchase & Suppliers card
  23  |     const purchaseCard = page.locator('a[href="/inventory/suppliers"]').first();
  24  |     await expect(purchaseCard).toBeVisible();
  25  |     await purchaseCard.click();
  26  |     
  27  |     // Verify navigation to suppliers page
  28  |     await page.waitForURL('**/inventory-suppliers', { timeout: 5000 });
  29  |     await expect(page).toHaveURL(/\/inventory-suppliers/);
  30  |     
  31  |     // Navigate back to apps
  32  |     await page.goto('http://localhost:3000/apps');
  33  |     await page.waitForLoadState('networkidle');
  34  |     
  35  |     // Test each procurement sub-link
  36  |     const procurementLinks = [
  37  |       { label: 'Persetujuan Stok', href: '/inventory/stock-approvals' },
  38  |       { label: 'Permintaan Penawaran', href: '/inventory/quotation-requests' },
  39  |       { label: 'Penawaran Supplier', href: '/inventory/quotations' },
  40  |       { label: 'Purchase Order', href: '/inventory/purchase-orders' },
  41  |       { label: 'Goods Received Note', href: '/inventory/goods-received-notes' },
  42  |       { label: 'Invoice Supplier', href: '/inventory/invoices' },
  43  |       { label: 'Pembayaran Supplier', href: '/inventory/supplier-payments' },
  44  |     ];
  45  |     
  46  |     for (const link of procurementLinks) {
  47  |       await page.goto('http://localhost:3000/apps');
  48  |       await page.waitForLoadState('networkidle');
  49  |       
  50  |       const linkElement = page.locator(`a[href="${link.href}"]`).first();
  51  |       await expect(linkElement).toBeVisible({ timeout: 5000 });
  52  |       await linkElement.click();
  53  |       
  54  |       await page.waitForURL(`**${link.href}`, { timeout: 5000 });
  55  |       await expect(page).toHaveURL(new RegExp(link.href.replace('/', '\\/')));
  56  |       
  57  |       // Verify page title contains relevant text
  58  |       const h1 = page.locator('h1').first();
  59  |       await expect(h1).toBeVisible();
  60  |       
  61  |       console.log(`✅ ${link.label} page accessible`);
  62  |     }
  63  |   });
  64  | 
  65  |   test('Verify procurement pages have proper UI elements', async ({ page }) => {
  66  |     // Login
> 67  |     await page.fill('input[name="username"]', 'admin');
      |                ^ Error: page.fill: Target page, context or browser has been closed
  68  |     await page.fill('input[name="password"]', 'admin');
  69  |     await page.click('button[type="submit"]');
  70  |     await page.waitForURL('**/apps', { timeout: 5000 });
  71  |     
  72  |     // Test Stock Approvals page
  73  |     await page.goto('http://localhost:3000/inventory/stock-approvals');
  74  |     await page.waitForLoadState('networkidle');
  75  |     await expect(page.locator('h1')).toContainText('Persetujuan Stok');
  76  |     await expect(page.locator('button:has-text("Buat Permintaan")')).toBeVisible();
  77  |     
  78  |     // Test Quotation Requests page
  79  |     await page.goto('http://localhost:3000/inventory/quotation-requests');
  80  |     await page.waitForLoadState('networkidle');
  81  |     await expect(page.locator('h1')).toContainText('Permintaan Penawaran');
  82  |     await expect(page.locator('button:has-text("Buat Permintaan")')).toBeVisible();
  83  |     
  84  |     // Test Quotations page
  85  |     await page.goto('http://localhost:3000/inventory/quotations');
  86  |     await page.waitForLoadState('networkidle');
  87  |     await expect(page.locator('h1')).toContainText('Penawaran Supplier');
  88  |     
  89  |     // Test Purchase Orders page
  90  |     await page.goto('http://localhost:3000/inventory/purchase-orders');
  91  |     await page.waitForLoadState('networkidle');
  92  |     await expect(page.locator('h1')).toContainText('Purchase Order');
  93  |     await expect(page.locator('button:has-text("Buat PO")')).toBeVisible();
  94  |     
  95  |     // Test Goods Received Notes page
  96  |     await page.goto('http://localhost:3000/inventory/goods-received-notes');
  97  |     await page.waitForLoadState('networkidle');
  98  |     await expect(page.locator('h1')).toContainText('Goods Received Note');
  99  |     await expect(page.locator('button:has-text("Buat GRN")')).toBeVisible();
  100 |     
  101 |     // Test Invoices page
  102 |     await page.goto('http://localhost:3000/inventory/invoices');
  103 |     await page.waitForLoadState('networkidle');
  104 |     await expect(page.locator('h1')).toContainText('Invoice Supplier');
  105 |     await expect(page.locator('button:has-text("Buat Invoice")')).toBeVisible();
  106 |     
  107 |     // Test Supplier Payments page
  108 |     await page.goto('http://localhost:3000/inventory/supplier-payments');
  109 |     await page.waitForLoadState('networkidle');
  110 |     await expect(page.locator('h1')).toContainText('Pembayaran Supplier');
  111 |     await expect(page.locator('button:has-text("Buat Pembayaran")')).toBeVisible();
  112 |     
  113 |     console.log('✅ All procurement pages have proper UI elements');
  114 |   });
  115 | });
  116 | 
```
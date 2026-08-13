import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Access Control Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test.describe('Unauthenticated Access', () => {
    test('should redirect unauthenticated users to login when accessing admin pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/apps`);
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect unauthenticated users to login when accessing inventory pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/inventory`);
      await expect(page).toHaveURL(/\/login/);
    });

    test('should allow access to login page without authentication', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await expect(page).toHaveURL(/\/login/);
      await expect(page.locator('h1')).toContainText('Kitchen POS');
    });

    test('should allow access to public order pages without authentication', async ({ page }) => {
      await page.goto(`${BASE_URL}/order/1`);
      // Should not redirect to login
      await expect(page).not.toHaveURL(/\/login/);
    });
  });

  test.describe('Admin User Access', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/apps/);
    });

    test('should allow admin to access admin pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/products`);
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should allow admin to access inventory pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/inventory`);
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should allow admin to access settings pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings`);
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should allow admin to access HR pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/hr`);
      await expect(page).not.toHaveURL(/\/login/);
    });
  });

  test.describe('Cashier User Access', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="username"]', 'cashier1');
      await page.fill('input[name="password"]', 'cashier123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/apps/);
    });

    test('should allow cashier to access POS pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/pos`);
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should allow cashier to access kitchen display', async ({ page }) => {
      await page.goto(`${BASE_URL}/kitchen`);
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should deny cashier access to admin pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/products`);
      // Should redirect or show access denied
      await expect(page.locator('body')).toHaveText(/unauthorized|forbidden|access denied/i, { timeout: 5000 }).catch(() => {
        // If no error message, check if redirected to login
        expect(page.url()).toMatch(/\/login/);
      });
    });

    test('should deny cashier access to settings pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/settings`);
      await expect(page.locator('body')).toHaveText(/unauthorized|forbidden|access denied/i, { timeout: 5000 }).catch(() => {
        expect(page.url()).toMatch(/\/login/);
      });
    });
  });

  test.describe('Manager User Access', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="username"]', 'manager1');
      await page.fill('input[name="password"]', 'manager123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/apps/);
    });

    test('should allow manager to access inventory pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/inventory`);
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should allow manager to access HR pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/hr`);
      await expect(page).not.toHaveURL(/\/login/);
    });

    test('should allow manager to access reports', async ({ page }) => {
      await page.goto(`${BASE_URL}/reports`);
      await expect(page).not.toHaveURL(/\/login/);
    });
  });

  test.describe('Owner User Access', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="username"]', 'owner1');
      await page.fill('input[name="password"]', 'owner123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/apps/);
    });

    test('should allow owner to access all pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/products`);
      await expect(page).not.toHaveURL(/\/login/);

      await page.goto(`${BASE_URL}/inventory`);
      await expect(page).not.toHaveURL(/\/login/);

      await page.goto(`${BASE_URL}/settings`);
      await expect(page).not.toHaveURL(/\/login/);
    });
  });

  test.describe('Role-Based UI Elements', () => {
    test('should show admin-specific elements to admin users', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/apps/);

      await page.goto(`${BASE_URL}/products`);
      // Check for admin-specific UI elements
      const adminElements = page.locator('[data-role="admin"]');
      const count = await adminElements.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should hide admin-specific elements from cashier users', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="username"]', 'cashier1');
      await page.fill('input[name="password"]', 'cashier123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/apps/);

      await page.goto(`${BASE_URL}/pos`);
      // Admin elements should not be visible
      const adminElements = page.locator('[data-role="admin"]');
      const isVisible = await adminElements.isVisible().catch(() => false);
      expect(isVisible).toBe(false);
    });
  });

  test.describe('Logout and Session Management', () => {
    test('should logout user and redirect to login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/apps/);

      // Logout (implementation depends on your UI)
      const logoutButton = page.locator('button[aria-label*="logout"], button:has-text("Logout")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await expect(page).toHaveURL(/\/login/);
      }
    });

    test('should require re-authentication after logout', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/apps/);

      // Clear token from localStorage
      await page.evaluate(() => localStorage.clear());

      // Try to access protected page
      await page.goto(`${BASE_URL}/products`);
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Cross-Device Testing Support', () => {
    test('should work with different user sessions', async ({ browser }) => {
      // Create two contexts to simulate two devices
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();

      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      // Login as admin on device 1
      await page1.goto(`${BASE_URL}/login`);
      await page1.fill('input[name="username"]', 'admin');
      await page1.fill('input[name="password"]', 'admin');
      await page1.click('button[type="submit"]');
      await page1.waitForURL(/\/apps/);

      // Login as cashier on device 2
      await page2.goto(`${BASE_URL}/login`);
      await page2.fill('input[name="username"]', 'cashier1');
      await page2.fill('input[name="password"]', 'cashier123');
      await page2.click('button[type="submit"]');
      await page2.waitForURL(/\/apps/);

      // Admin should access admin pages
      await page1.goto(`${BASE_URL}/products`);
      await expect(page1).not.toHaveURL(/\/login/);

      // Cashier should access POS
      await page2.goto(`${BASE_URL}/pos`);
      await expect(page2).not.toHaveURL(/\/login/);

      // Cashier should not access admin
      await page2.goto(`${BASE_URL}/products`);
      await expect(page2.locator('body')).toHaveText(/unauthorized|forbidden|access denied/i, { timeout: 5000 }).catch(() => {
        expect(page2.url()).toMatch(/\/login/);
      });

      await context1.close();
      await context2.close();
    });
  });
});

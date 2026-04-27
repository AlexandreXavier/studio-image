import { test, expect } from '@playwright/test';

test.describe('theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('xani_theme'));
    await page.reload();
  });

  test('toggles dark mode', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.waitForTimeout(300); // wait for React island hydration
    await page.locator('button[aria-label="Toggle theme"]').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('persists after reload', async ({ page }) => {
    await page.waitForTimeout(300);
    await page.locator('button[aria-label="Toggle theme"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

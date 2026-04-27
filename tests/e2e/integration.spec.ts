import { test, expect } from '@playwright/test';

async function seedImage(page: any) {
  await page.goto('/editor');
  await page.evaluate(() => {
    localStorage.setItem('xani_image', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
  });
  await page.reload();
  await page.waitForTimeout(300);
}

test.describe('integration — download', () => {
  test('download button triggers file download', async ({ page }) => {
    await seedImage(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('text=Download').click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/xani-edited\.png$/);
  });
});

test.describe('integration — close', () => {
  test('close clears storage and redirects to home', async ({ page }) => {
    await seedImage(page);

    await page.locator('text=Fechar').click();
    await page.waitForURL('**/');

    // Verify storage is cleared
    const hasImage = await page.evaluate(() => !!localStorage.getItem('xani_image'));
    expect(hasImage).toBe(false);

    // Verify landing page is shown (AI button disabled = no image)
    await expect(page.locator('[data-testid="ai-generator"]')).toBeDisabled();
  });
});

test.describe('integration — pipeline', () => {
  test('crop then resize produces history chain', async ({ page }) => {
    await seedImage(page);

    // Apply crop
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop
    await page.locator('text=Apply Crop').click();

    let history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(2);

    // Apply resize
    await toolbar.locator('button').nth(1).click(); // Resize
    await page.locator('text=Apply Resize').click();

    history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(3);
    await expect(history.nth(2)).toContainText('Resize');

    // Undo twice back to original
    await page.locator('text=Undo').click();
    await page.locator('text=Undo').click();

    // History still shows all 3, but active should be Original
    history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(3);
  });
});

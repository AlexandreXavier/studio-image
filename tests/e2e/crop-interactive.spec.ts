import { test, expect } from '@playwright/test';

async function seedImage(page: any) {
  await page.goto('/editor');
  await page.evaluate(() => {
    // 100x100 blue SVG image so crop overlay has visible dimensions
    localStorage.setItem('xani_image', 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%233b82f6%22%2F%3E%3C%2Fsvg%3E');
  });
  await page.reload();
  await page.waitForTimeout(400);
}

test.describe('interactive crop overlay', () => {
  test.beforeEach(async ({ page }) => {
    await seedImage(page);
    await page.waitForTimeout(300);
  });

  test('selecting crop tool shows visual overlay with handles', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop

    // Wait for overlay to appear on canvas area
    const overlay = page.locator('[data-testid="crop-overlay"]');
    await expect(overlay).toBeVisible();

    // Should have a draggable crop rectangle
    const rect = overlay.locator('[data-testid="crop-rect"]');
    await expect(rect).toBeVisible();

    // Should have 8 handles (4 corners + 4 edges)
    const handles = overlay.locator('[data-testid="crop-handle"]');
    await expect(handles).toHaveCount(8);
  });

  test('dragging crop rect center moves it', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop

    const overlay = page.locator('[data-testid="crop-overlay"]');
    await expect(overlay).toBeVisible();

    const rect = overlay.locator('[data-testid="crop-rect"]');
    const boxBefore = await rect.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Drag from center of crop rect 20px right and 20px down
    const startX = boxBefore!.x + boxBefore!.width / 2;
    const startY = boxBefore!.y + boxBefore!.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 20, startY + 20);
    await page.mouse.up();

    const boxAfter = await rect.boundingBox();
    expect(boxAfter).not.toBeNull();

    // Position should have shifted
    expect(boxAfter!.x).not.toBeCloseTo(boxBefore!.x, 0);
    expect(boxAfter!.y).not.toBeCloseTo(boxBefore!.y, 0);
  });

  test('dragging corner handle resizes crop rect', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop

    const overlay = page.locator('[data-testid="crop-overlay"]');
    await expect(overlay).toBeVisible();

    const rect = overlay.locator('[data-testid="crop-rect"]');
    const boxBefore = await rect.boundingBox();
    expect(boxBefore).not.toBeNull();

    // Get first handle (top-left corner)
    const handle = overlay.locator('[data-testid="crop-handle"]').nth(0);
    const hBox = await handle.boundingBox();
    expect(hBox).not.toBeNull();

    // Drag handle inward (right and down) to shrink from top-left
    await page.mouse.move(hBox!.x + hBox!.width / 2, hBox!.y + hBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(hBox!.x + hBox!.width / 2 + 15, hBox!.y + hBox!.height / 2 + 15);
    await page.mouse.up();

    const boxAfter = await rect.boundingBox();
    expect(boxAfter).not.toBeNull();

    // Crop rect should have shrunk
    expect(boxAfter!.width).toBeLessThan(boxBefore!.width);
    expect(boxAfter!.height).toBeLessThan(boxBefore!.height);
    // And shifted inward (x/y increased)
    expect(boxAfter!.x).toBeGreaterThan(boxBefore!.x);
    expect(boxAfter!.y).toBeGreaterThan(boxBefore!.y);
  });

  test('apply crop uses overlay coordinates', async ({ page }) => {
    const toolbar = page.locator('[data-testid="toolbar"]');
    await toolbar.locator('button').nth(0).click(); // Crop

    const overlay = page.locator('[data-testid="crop-overlay"]');
    await expect(overlay).toBeVisible();

    // Shrink crop from top-left corner by dragging handle inward
    const handle = overlay.locator('[data-testid="crop-handle"]').nth(0);
    const hBox = await handle.boundingBox();
    expect(hBox).not.toBeNull();
    await page.mouse.move(hBox!.x + hBox!.width / 2, hBox!.y + hBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(hBox!.x + hBox!.width / 2 + 15, hBox!.y + hBox!.height / 2 + 15);
    await page.mouse.up();

    // Panel inputs should reflect the shrunk crop (width < 100)
    const inputs = page.locator('[data-testid="tool-panel"] input[type="number"]');
    await expect(inputs.nth(2)).toHaveValue(/^[0-7]?\d$/); // Width should be < 100 (2 digits or 1)

    // Apply crop
    await page.locator('text=Apply Crop').click();

    // History should show Original + Crop
    const history = page.locator('[data-testid="history-panel"] button');
    await expect(history).toHaveCount(2);
    await expect(history.nth(1)).toContainText('Crop');
  });
});

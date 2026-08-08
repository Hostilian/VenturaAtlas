import { test, expect } from '@playwright/test';

test.describe('VentureAtlas E2E User Journeys', () => {

  test('Homepage loads correctly with navigation and metrics', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/Venture Atlas OS/);
    const header = page.locator('.site-header');
    await expect(header).toBeVisible();

    // Verify navigation links exist
    await expect(page.locator('a[href*="rankings.html"]').first()).toBeVisible();
    await expect(page.locator('a[href*="compare.html"]').first()).toBeVisible();
    await expect(page.locator('a[href*="matcher.html"]').first()).toBeVisible();
  });

  test('Idea Detail Page renders Quick Read summary and AI Validation Panel', async ({ page }) => {
    await page.goto('/docs/idea.html?id=idea-061');
    await expect(page).toHaveTitle(/FactBounty/);

    // Verify AI Validation Panel
    const aiPanel = page.locator('text=Continuous AI Validation Panel');
    await expect(aiPanel).toBeVisible();

    // Verify Action Toolbar Buttons
    await expect(page.locator('button#favDetail')).toBeVisible();
    await expect(page.locator('button#addCompareBtn')).toBeVisible();
    await expect(page.locator('button#addRoomBtn')).toBeVisible();
  });

  test('Compare Page side-by-side selection and removal', async ({ page }) => {
    await page.goto('/docs/compare.html?ids=idea-061,idea-273');
    await expect(page.locator('text=FactBounty')).toBeVisible();
    await expect(page.locator('text=PowerPlot')).toBeVisible();

    // Check Remove button
    const removeBtn = page.locator('button.remove-idea-btn').first();
    await expect(removeBtn).toBeVisible();
  });

  test('Collaboration Room Creation and Share URL', async ({ page }) => {
    await page.goto('/docs/room.html');
    await expect(page.locator('text=Create a Friend Collaboration Room')).toBeVisible();

    await page.fill('#roomNameInput', 'Test Founder Room');
    await page.fill('#roomNicknameInput', 'Tester');
    await page.click('button[type="submit"]');

    // Verify Room Created Dashboard
    await expect(page.locator('text=Test Founder Room')).toBeVisible();
    await expect(page.locator('#copyRoomLinkBtn')).toBeVisible();
    await expect(page.locator('#exportPacketBtn')).toBeVisible();
  });

});

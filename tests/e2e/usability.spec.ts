import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/index.html',
  '/docs/getting-started.html',
  '/docs/matcher.html',
  '/docs/rankings.html',
  '/docs/research-catalog.html',
  '/docs/calculator.html',
  '/docs/dossiers.html',
  '/docs/export.html',
  '/docs/compare.html?ids=idea-061,idea-273',
  '/docs/room.html',
];

test.describe('Friend-ready usability safeguards', () => {
  test('homepage fits a standard 1280px desktop viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/index.html');
    await page.locator('main#main').waitFor();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('key public journeys do not overflow a phone viewport', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Safari');

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.locator('main#main').waitFor();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  });

  test('mobile navigation is accessible and grouped', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'Mobile Safari');
    await page.goto('/index.html');

    const toggle = page.locator('#mobileNavToggle');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobileNavDrawer')).toBeVisible();
    await expect(page.locator('#mobileNavDrawer section')).toHaveCount(3);
  });

  test('fresh idea round and both taxonomy dimensions are usable', async ({ page }) => {
    await page.goto('/docs/research-catalog.html');
    await expect(page.locator('#proposalTotal')).toHaveText('555');
    await page.locator('#roundFilter').selectOption('everyday-problem-hypotheses-2026-08-21');
    await expect(page.locator('#visibleTotal')).toHaveText('48');
    await expect(page.locator('.proposal-card')).toHaveCount(48);
    expect(await page.locator('#familyFilter option').count()).toBeGreaterThan(10);
    expect(await page.locator('#patternFilter option').count()).toBeGreaterThan(10);
  });
});

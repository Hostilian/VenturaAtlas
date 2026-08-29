import { test, expect } from '@playwright/test';

test.describe('@smoke Deterministic Browser Smoke Suite', () => {
  const pagesToTest = [
    { path: '/', titleExpected: /Venture Atlas/i, name: 'Home' },
    { path: '/offline.html', titleExpected: /Offline/i, name: 'Offline Shell' },
    { path: '/docs/components.html', titleExpected: /Component/i, name: 'Component Showcase' },
  ];

  for (const pageInfo of pagesToTest) {
    test(`@smoke ${pageInfo.name} loads cleanly without console errors or secret leakage`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', (err) => {
        consoleErrors.push(err.message);
      });

      page.on('requestfailed', (req) => {
        failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
      });

      const response = await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);

      // Verify Title
      await expect(page).toHaveTitle(pageInfo.titleExpected);

      // Verify no console errors
      expect(consoleErrors).toEqual([]);

      // Verify no 404/failed asset requests
      expect(failedRequests).toEqual([]);

      // Verify no secret leak in DOM
      const pageContent = await page.content();
      expect(pageContent).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
      expect(pageContent).not.toMatch(/ghp_[a-zA-Z0-9]{20,}/);
    });
  }
});

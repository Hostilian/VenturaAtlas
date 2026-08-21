import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('VentureAtlas Rankings E2E Verification', () => {

  const rankingsPath = path.join(__dirname, '..', '..', 'data', 'rankings.json');
  const rawRankings = JSON.parse(fs.readFileSync(rankingsPath, 'utf8'));
  const views = rawRankings.rankings || [];

  test('Rankings selector contains all canonical views', async ({ page }) => {
    await page.goto('/docs/rankings.html');
    const select = page.locator('#rankingSelect');
    await expect(select).toBeVisible();

    const count = await select.locator('option').count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  for (const view of views) {
    test(`Ranking view '${view.id}' loads and links to valid idea URLs`, async ({ page }) => {
      await page.goto(`/docs/rankings.html?ranking=${view.id}`);
      await expect(page.locator('#rankingSelect')).toHaveValue(view.id);

      // Verify header title
      await expect(page.locator('.ranking-header')).toBeVisible();

      // Verify idea links resolve to docs/idea.html?id=...
      const firstLink = page.locator('a.ranking-idea-link:visible, .mobile-ranking-cards h3 a:visible').first();
      await expect(firstLink).toBeVisible();
      const href = await firstLink.getAttribute('href');
      expect(href).toContain('/docs/idea.html?id=');
    });
  }

});

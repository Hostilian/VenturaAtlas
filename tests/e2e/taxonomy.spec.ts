import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const taxonomy = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'idea-taxonomy.json'), 'utf8'));

test.describe('Normalized taxonomy and idea differentiation', () => {
  test('directory filters by market family and venture pattern', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page.locator('#family option')).toHaveCount(taxonomy.familyCount + 1);
    await expect(page.locator('#pattern option')).toHaveCount(taxonomy.patternCount + 1);

    await page.locator('#family').selectOption('commerce-marketplaces-consumer');
    await page.locator('#pattern').selectOption('evidence-verification');
    await expect(page).toHaveURL(/family=commerce-marketplaces-consumer/);
    await expect(page).toHaveURL(/pattern=evidence-verification/);
    await expect(page.locator('#cards .card').first()).toBeVisible();
    await expect(page.locator('#cards .card .eyebrow').first()).toContainText('Commerce, Marketplaces & Consumer');
  });

  test('adjudicated same-name duplicates leave one canonical result', async ({ page }) => {
    await page.goto('/index.html?q=Fit-First%20Parametric%20Repair%20Studio');
    await expect(page.locator('#cards .card')).toHaveCount(1);
    await expect(page.getByText('Potential duplicate')).toHaveCount(0);
  });

  test('detail and compare views explain how neighboring ideas differ', async ({ page }) => {
    await page.goto('/docs/idea.html?id=idea-219');
    await expect(page.getByRole('heading', { name: 'Positioning & Similarity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Closest portfolio alternatives' })).toBeVisible();
    const assignment = taxonomy.assignments.find((item: { ideaId: string }) => item.ideaId === 'idea-219');
    const closest = assignment.closestIdeas[0];
    await expect(page.getByText(closest.difference).first()).toBeVisible();

    await page.goto(`/docs/compare.html?ids=idea-219,${closest.ideaId}`);
    const desktopMatrix = page.locator('.desktop-ranking-table');
    await expect(page.locator('#comparison .desktop-ranking-table:visible, #comparison .mobile-ranking-cards:visible')).toHaveCount(1);
    if (await desktopMatrix.isVisible()) {
      await expect(desktopMatrix.getByText('Market Family', { exact: true })).toBeVisible();
      await expect(desktopMatrix.getByText('Idea Type', { exact: true })).toBeVisible();
      await expect(desktopMatrix.getByText('Core Deliverable', { exact: true })).toBeVisible();
      await expect(desktopMatrix.getByText('Closest Portfolio Alternative', { exact: true })).toBeVisible();
    } else {
      const mobileMatrix = page.locator('.mobile-ranking-cards');
      await expect(mobileMatrix.getByText(/Market Family:/).first()).toBeVisible();
      await expect(mobileMatrix.getByText(/Idea Type:/).first()).toBeVisible();
      await expect(mobileMatrix.getByText(/Core Deliverable:/).first()).toBeVisible();
      await expect(mobileMatrix.getByText(/Closest Portfolio Alternative:/).first()).toBeVisible();
    }
  });
});

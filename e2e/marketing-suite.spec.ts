import { test, expect } from '@playwright/test';

test.describe('Marketing Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/marketing/keywords', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          keywords: [
            { keyword: 'test keyword', search_volume: 1000, keyword_difficulty: 45, cpc: 2.5 },
          ],
        },
      });
    });

    await page.route('**/api/marketing/audit', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          score: 85,
          audits: [
            { id: 'meta-description', title: 'Meta Description', description: 'Has meta description', score: 1, displayValue: null, scoreDisplayMode: 'binary' },
          ],
        },
      });
    });

    await page.route('**/api/marketing/social/**', async (route) => {
      await route.fulfill({ json: { success: true, data: { id: 'ayrshare-123' } } });
    });
  });

  test('navigates to marketing suite and shows tabs', async ({ page }) => {
    await page.goto('/dashboard/business/marketing');
    await expect(page.getByText('Marketing Suite')).toBeVisible();
    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.getByText('SEO Tools')).toBeVisible();
    await expect(page.getByText('Content Planner')).toBeVisible();
    await expect(page.getByText('Campaigns')).toBeVisible();
  });

  test('switches to SEO Tools tab', async ({ page }) => {
    await page.goto('/dashboard/business/marketing');
    await page.click('text=SEO Tools');
    await expect(page.getByPlaceholder(/enter a keyword/i)).toBeVisible();
  });

  test('keyword search returns results', async ({ page }) => {
    await page.goto('/dashboard/business/marketing');
    await page.click('text=SEO Tools');
    await page.fill('input[placeholder*="keyword"]', 'test');
    await page.click('text=Analyze');
    await expect(page.getByText('test keyword')).toBeVisible();
  });

  test('switches to Content Planner tab', async ({ page }) => {
    await page.goto('/dashboard/business/marketing');
    await page.click('text=Content Planner');
    await expect(page.getByText('Content Calendar')).toBeVisible();
  });

  test('switches to Campaigns tab', async ({ page }) => {
    await page.goto('/dashboard/business/marketing');
    await page.click('text=Campaigns');
    await expect(page.getByText('New Campaign')).toBeVisible();
  });

  test('opens create campaign modal', async ({ page }) => {
    await page.goto('/dashboard/business/marketing');
    await page.click('text=Campaigns');
    await page.click('text=New Campaign');
    await expect(page.getByText('Campaign Title')).toBeVisible();
  });
});

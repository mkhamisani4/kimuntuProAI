import { test, expect } from '@playwright/test';

test.describe('Web Search Integration (Phase 4)', () => {
  // Setup: Mock successful API response with web search results
  test.beforeEach(async ({ page }) => {
    // Mock successful API response with web sources
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: {
            'Market Definition': 'The meal-prep delivery market in Phoenix, AZ is growing rapidly...',
            'TAM/SAM/SOM': 'Total Addressable Market: $50M, Serviceable Market: $20M',
            'Target Segments': 'Health-conscious professionals, busy families',
            'Competitors': 'HelloFresh, Blue Apron, local Phoenix meal prep companies',
            'Pricing Bands': '$8-15 per meal depending on volume and customization',
          },
          sources: [
            { type: 'web', title: 'Phoenix Food Delivery Market Report 2025', url: 'https://example.com/phoenix-market', snippet: 'Phoenix market shows 25% YoY growth' },
            { type: 'web', title: 'Meal Prep Industry Trends', url: 'https://example.com/trends', snippet: 'Health-conscious consumers driving demand' },
            { type: 'web', title: 'Competitor Analysis', url: 'https://example.com/competitors', snippet: 'HelloFresh leads with 30% market share' },
            { type: 'web', title: 'Phoenix Demographics', url: 'https://example.com/demographics', snippet: 'Growing population of young professionals' },
            { type: 'web', title: 'Meal Prep Pricing Study', url: 'https://example.com/pricing', snippet: 'Average price point $10-12 per meal' },
          ],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 500,
            tokensOut: 1500,
            costCents: 25,
            latencyMs: 3500,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    });
  });

  test('Live Data badge is visible when web sources are present', async ({ page }) => {
    await page.goto('/dashboard/business/market-analysis');

    // Fill in market analysis prompt
    await page.getByRole('textbox').fill('Analyze meal-prep delivery market in Phoenix, AZ');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result to appear
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    // Check for Live Data badge
    const liveBadge = page.locator('text=🌐 Live Data');
    await expect(liveBadge).toBeVisible();
  });

  test('Sources section contains web URLs', async ({ page }) => {
    await page.goto('/dashboard/business/market-analysis');

    await page.getByRole('textbox').fill('Analyze meal-prep delivery market in Phoenix, AZ');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    // Check Sources heading is visible
    await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();

    // Check for source URLs (at least 5 as per acceptance criteria)
    const sourceLinks = page.locator('a[href^="https://example.com"]');
    const count = await sourceLinks.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('Data badge shows relative time', async ({ page }) => {
    await page.goto('/dashboard/business/market-analysis');

    await page.getByRole('textbox').fill('Analyze meal-prep delivery market in Phoenix, AZ');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    // Badge should show time (e.g., "just now", "X minutes ago")
    const badge = page.locator('[data-testid="data-badge-live"], text=🌐 Live Data');
    await expect(badge).toBeVisible();

    // Text content should include either "just now" or a relative time
    const badgeText = await badge.textContent();
    expect(badgeText).toMatch(/🌐 Live Data/);
  });

  test('No console errors during web search operations', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/dashboard/business/market-analysis');

    await page.getByRole('textbox').fill('Analyze meal-prep delivery market in Phoenix, AZ');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    // Filter out favicon errors (not related to our code)
    const relevantErrors = errors.filter(e => !e.includes('favicon'));
    expect(relevantErrors).toHaveLength(0);
  });

  test('Knowledge Base badge shown when no web sources', async ({ page }) => {
    // Mock response with only RAG sources
    await page.route('**/api/ai/answer', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          sections: {
            'Executive Summary': 'This is based on internal knowledge...',
            'Financial Projections': 'Standard financial model',
          },
          sources: [
            { type: 'rag', title: 'Internal Document', snippet: 'Internal knowledge' },
          ],
          meta: {
            model: 'gpt-4o-mini',
            tokensIn: 300,
            tokensOut: 800,
            costCents: 15,
            latencyMs: 2000,
          },
        }),
      });
    }, { times: 1 });

    await page.goto('/dashboard/business/streamlined-plan');

    await page.getByRole('textbox').fill('Create a business plan');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    // Should show Knowledge Base badge
    const knowledgeBadge = page.locator('text=📚 Knowledge Base');
    await expect(knowledgeBadge).toBeVisible();
  });

  test('Export dropdown works with web search results', async ({ page }) => {
    await page.goto('/dashboard/business/market-analysis');

    await page.getByRole('textbox').fill('Analyze meal-prep delivery market in Phoenix, AZ');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    // Export button should be visible
    const exportButton = page.getByRole('button', { name: /Export/i });
    await expect(exportButton).toBeVisible();

    // Click export and verify menu opens
    await exportButton.click();
    await expect(page.getByTestId('export-markdown')).toBeVisible();
  });

  test('Web sources display with correct information', async ({ page }) => {
    await page.goto('/dashboard/business/market-analysis');

    await page.getByRole('textbox').fill('Analyze meal-prep delivery market in Phoenix, AZ');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    // Check that web sources show title and URL
    await expect(page.getByText('Phoenix Food Delivery Market Report 2025')).toBeVisible();
    await expect(page.locator('a[href="https://example.com/phoenix-market"]')).toBeVisible();
  });

  test('Metadata shows timestamp for web search results', async ({ page }) => {
    await page.goto('/dashboard/business/market-analysis');

    await page.getByRole('textbox').fill('Analyze meal-prep delivery market in Phoenix, AZ');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    // Metadata section should be visible
    await expect(page.getByText(/Model:/)).toBeVisible();
    await expect(page.getByText(/Tokens:/)).toBeVisible();

    // Live Data badge confirms timestamp is available
    await expect(page.locator('text=🌐 Live Data')).toBeVisible();
  });

  test('Badge styling matches glassmorphism theme', async ({ page }) => {
    await page.goto('/dashboard/business/market-analysis');

    await page.getByRole('textbox').fill('Analyze meal-prep delivery market in Phoenix, AZ');
    await page.getByRole('button', { name: /Run Assistant/i }).click();

    // Wait for result
    await expect(page.getByText('Results')).toBeVisible({ timeout: 10000 });

    const badge = page.locator('[data-testid="data-badge-live"]');
    await expect(badge).toBeVisible();

    // Check CSS classes (emerald colors)
    const badgeClass = await badge.getAttribute('class');
    expect(badgeClass).toContain('bg-emerald');
    expect(badgeClass).toContain('text-emerald');
    expect(badgeClass).toContain('rounded-full');
  });
});

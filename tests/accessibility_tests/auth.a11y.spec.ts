import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('authentication page has no WCAG 2A violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Registrazione e login' })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag412']).analyze();

  expect(results.violations).toEqual([]);
});
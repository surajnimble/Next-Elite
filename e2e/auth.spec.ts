import { expect, test } from '@playwright/test';

test('login page loads at the root', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
});

test('password reset page loads', async ({ page }) => {
  await page.goto('/password-reset');
  await expect(page.locator('#email')).toBeVisible();
});

test('dashboard redirects anonymous visitors to the login screen', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
});

test('health check returns ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toEqual({ status: 'ok' });
});

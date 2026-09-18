import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

async function registerUser(page: Page) {
  await page.getByPlaceholder('Mario Rossi').fill('Luca Verdi');
  await page.getByPlaceholder('mario@email.com').nth(0).fill('luca@email.com');
  await page.getByPlaceholder('••••••••').nth(0).fill('password123');
  await page.getByRole('button', { name: 'Registrami' }).click();

  await expect(page.getByText('Utente Luca Verdi registrato con successo.')).toBeVisible();
}

async function loginUser(page: Page, password = 'password123') {
  await page.getByPlaceholder('mario@email.com').nth(1).fill('luca@email.com');
  await page.getByPlaceholder('••••••••').nth(1).fill(password);
  await page.getByRole('button', { name: 'Entra' }).click();
}

test('esegue il login con credenziali corrette', async ({ page }) => {
  await registerUser(page);
  await loginUser(page);

  await expect(page.getByText('Ciao, Luca Verdi')).toBeVisible();
  await expect(page.getByText('Email: luca@email.com')).toBeVisible();
});

test('rifiuta credenziali errate', async ({ page }) => {
  await registerUser(page);
  await loginUser(page, 'password-sbagliata');

  await expect(page.getByText('Credenziali non valide.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Accedi' })).toBeVisible();
});

test('mantiene la sessione dopo un reload', async ({ page }) => {
  await registerUser(page);
  await loginUser(page);
  await expect(page.getByText('Ciao, Luca Verdi')).toBeVisible();

  await page.reload();

  await expect(page.getByText('Ciao, Luca Verdi')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});

test('esegue il logout e rimuove la sessione', async ({ page }) => {
  await registerUser(page);
  await loginUser(page);
  await expect(page.getByText('Ciao, Luca Verdi')).toBeVisible();

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByText('Sei stato disconnesso.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Accedi' })).toBeVisible();
});
import { test, expect } from '@playwright/test';
test('vulnroom loads and logs vulnerability', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('VulnRoom: demo');
  await page.locator('.title-input').fill('RCE in libx');
  await page.locator('.component-input').fill('libx');
  await page.locator('.cvss-input').fill('9.8');
  await page.locator('.cve-input').fill('CVE-2026-1234');
  await page.locator('.add-btn').click();
  await expect(page.locator('.vuln-list').locator('div').first()).toBeVisible();
});
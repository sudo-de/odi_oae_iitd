import { test, expect } from '@playwright/test';

test.describe('IITD Transport Management System', () => {
  test('should load the application', async ({ page }) => {
    // Navigate to the application root
    await page.goto('/');

    // Check if the page title is correct
    await expect(page).toHaveTitle('OAE at IIT Delhi');

    // Since root redirects to OAE website, we just verify the title
    // The actual app content is tested in other tests
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Navigate to a protected route
    await page.goto('/dashboard');

    // Should redirect to login page
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect to OAE website when not authenticated', async ({ page }) => {
    // Navigate to root path
    await page.goto('/');

    // Should redirect to OAE website (localhost:5173)
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should handle 404 routes gracefully', async ({ page }) => {
    // Navigate to non-existent route
    await page.goto('/nonexistent');

    // Should redirect to root (which goes to OAE website)
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should maintain consistent branding', async ({ page }) => {
    // Test login page branding
    await page.goto('/login');
    await expect(page.locator('img[alt="OAE at IIT Delhi"]')).toBeVisible();
    await expect(page.locator('h1').filter({ hasText: 'Log in with your email' })).toBeVisible();

    // Test root page title
    await page.goto('/');
    await expect(page).toHaveTitle('OAE at IIT Delhi');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/login');

    // Login form should still be visible and functional
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Next' })).toBeVisible();
  });
});

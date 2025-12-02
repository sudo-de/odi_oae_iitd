import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show complete login form', async ({ page }) => {
    await page.goto('/login');

    // Check for main login elements
    await expect(page.locator('h1').filter({ hasText: 'Log in with your email' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Next' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Go back' })).toBeVisible();
    await expect(page.locator('text=Forgot password?')).toBeVisible();
  });

  test('should handle empty form submission', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.locator('button').filter({ hasText: 'Next' }).click();

    // HTML5 validation should prevent submission for required fields
    // The form should still be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid email
    await page.locator('input[type="email"]').fill('invalid-email');
    await page.locator('input[type="password"]').fill('password123');

    // Try to submit
    await page.locator('button').filter({ hasText: 'Next' }).click();

    // HTML5 validation should show error for invalid email
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill form with invalid credentials
    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');

    // Submit form
    await page.locator('button').filter({ hasText: 'Next' }).click();

    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should navigate to OAE website when clicking "Go back"', async ({ page }) => {
    await page.goto('/login');

    // Click the "Go back" button
    await page.locator('button').filter({ hasText: 'Go back' }).click();

    // Should navigate to OAE website
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('.password-toggle');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle
    await toggleButton.click();

    // Password should now be visible
    await expect(page.locator('input[type="text"]')).toBeVisible();

    // Click toggle again
    await toggleButton.click();

    // Password should be hidden again
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should show forgot password form', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    await page.locator('text=Forgot password?').click();

    // Should show forgot password form
    await expect(page.locator('text=Forgot password?')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Send code' })).toBeVisible();
  });
});

test.describe('Dashboard Integration', () => {
  test('should complete full login and access dashboard', async ({ page }) => {
    // This is a placeholder for integration testing
    // In a real scenario, you would:
    // 1. Set up test user data in the database
    // 2. Login with valid credentials
    // 3. Verify dashboard access
    // 4. Test settings functionality

    // For now, just verify the login redirect works
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should handle successful navigation flow', async ({ page }) => {
    // Test navigation from login to dashboard (without actual login)
    await page.goto('/login');
    await expect(page.locator('h1').filter({ hasText: 'Log in with your email' })).toBeVisible();

    // Test that protected routes redirect properly
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});

# Playwright End-to-End Tests

This directory contains end-to-end tests for the IITD Transport Management System using Playwright.

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- Playwright browsers installed (`npx playwright install`)
- Application running on `http://localhost:5173`
- API server running on `http://localhost:3000`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report
```

## 📁 Test Structure

```
tests/
├── app.spec.ts      # Basic application tests
├── auth.spec.ts     # Authentication and settings tests
├── api.spec.ts      # API endpoint tests
└── README.md        # This file
```

## 🧪 Test Categories

### Application Tests (`app.spec.ts`)
- Application loading and basic functionality
- Page navigation and routing
- UI component visibility

### Authentication Tests (`auth.spec.ts`)
- Login form validation
- Settings page functionality
- Device management display
- System information cards

### API Tests (`api.spec.ts`)
- Health check endpoints
- Public API endpoints
- Authentication-protected routes
- Error handling

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Auto-server**: Starts dev server automatically

### Environment Setup
Make sure your `.env` file in the server directory includes:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/iitd-db
JWT_SECRET=your-secret-key
```

## 🎯 Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  // Navigate
  await page.goto('/');

  // Interact
  await page.click('button');

  // Assert
  await expect(page.locator('text=Success')).toBeVisible();
});
```

### API Testing
```typescript
test('should test API', async ({ request }) => {
  const response = await request.get('/api/endpoint');
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data).toHaveProperty('status');
});
```

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:debug
```
- Step through tests interactively
- See browser actions in real-time

### UI Mode
```bash
npm run test:ui
```
- Visual test runner
- Run individual tests
- See test results and traces

### Headed Mode
```bash
npm run test:headed
```
- Run tests with visible browser windows
- Useful for debugging visual issues

## 📊 Test Reports

After running tests, view the HTML report:
```bash
npm run test:report
```

Reports include:
- Test results and timings
- Screenshots on failure
- Trace files for debugging
- Performance metrics

## 🔄 CI/CD Integration

For CI/CD pipelines, add to your workflow:

```yaml
- name: Install Playwright Browsers
  run: npx playwright install

- name: Run Playwright tests
  run: npm test
```

## 🚨 Common Issues

### Tests Failing Due to Timing
```typescript
// Add waits for async operations
await page.waitForSelector('.loading', { state: 'hidden' });
await page.waitForTimeout(1000); // Last resort
```

### Authentication Required
```typescript
// For authenticated tests, you might need to:
// 1. Mock authentication
// 2. Use test user credentials
// 3. Set up test database state
```

### API Tests Failing
- Ensure server is running on port 3000
- Check CORS settings for test requests
- Verify environment variables are loaded

## 📈 Best Practices

1. **Use descriptive test names** that explain what they're testing
2. **Keep tests independent** - don't rely on other test state
3. **Use page objects** for complex UI interactions
4. **Mock external dependencies** when possible
5. **Clean up test data** after tests complete
6. **Use appropriate waits** instead of fixed timeouts

## 🔧 Extending Tests

### Adding New Test Files
Create new `.spec.ts` files in the `tests/` directory.

### Custom Test Fixtures
Add custom fixtures in `playwright.config.ts` for common setup.

### API Testing Helpers
Create helper functions for common API operations.

---

**Happy Testing!** 🎭✨

For more information, visit [Playwright Documentation](https://playwright.dev/docs/intro).

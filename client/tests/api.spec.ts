import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {
  const baseURL = 'http://localhost:3000';

  test('should return health status with proper structure', async ({ request }) => {
    const response = await request.get(`${baseURL}/health`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('database', 'MongoDB');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('environment');

    // Validate timestamp format
    const timestamp = new Date(body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(isNaN(timestamp.getTime())).toBe(false);
  });

  test('should return comprehensive app information', async ({ request }) => {
    const response = await request.get(`${baseURL}/app/info`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toHaveProperty('environment');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('build', '2024.01');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('uptime');

    // Validate environment is one of expected values
    expect(['development', 'production', 'test']).toContain(body.environment);

    // Validate version format
    expect(typeof body.version).toBe('string');
    expect(body.version.length).toBeGreaterThan(0);

    // Validate uptime is a number
    expect(typeof body.uptime).toBe('string');
    expect(body.uptime).toMatch(/\d+s$/);
  });

  test('should return API information with endpoints', async ({ request }) => {
    const response = await request.get(`${baseURL}/api`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    expect(body).toHaveProperty('name', 'IITD API');
    expect(body).toHaveProperty('version', '1.0.0');
    expect(body).toHaveProperty('description');
    expect(body).toHaveProperty('endpoints');

    // Validate endpoints structure
    expect(typeof body.endpoints).toBe('object');
    expect(body.endpoints).toHaveProperty('users', '/users');
    expect(body.endpoints).toHaveProperty('health', '/health');
  });

  test('should properly protect authenticated routes', async ({ request }) => {
    const endpoints = [
      { url: `${baseURL}/users`, method: 'GET' },
      { url: `${baseURL}/users/profile`, method: 'GET' },
      { url: `${baseURL}/data-management/stats`, method: 'GET' },
      { url: `${baseURL}/auth/devices`, method: 'GET' }
    ];

    for (const endpoint of endpoints) {
      const response = endpoint.method === 'GET'
        ? await request.get(endpoint.url)
        : await request.post(endpoint.url);
      expect([401, 403]).toContain(response.status());
    }
  });

  test('should handle POST requests to protected endpoints', async ({ request }) => {
    const postEndpoints = [
      `${baseURL}/data-management/backup`,
      `${baseURL}/data-management/import`,
      `${baseURL}/data-management/backup/settings`
    ];

    for (const endpoint of postEndpoints) {
      const response = await request.post(endpoint);
      expect([401, 403]).toContain(response.status());
    }
  });

  test('should return proper error responses for invalid routes', async ({ request }) => {
    const invalidEndpoints = [
      `${baseURL}/nonexistent`,
      `${baseURL}/api/invalid`
    ];

    for (const endpoint of invalidEndpoints) {
      const response = await request.get(endpoint);
      expect(response.status()).toBe(404);
    }

    // This endpoint exists but requires auth
    const authRequiredResponse = await request.get(`${baseURL}/users/invalid-action`);
    expect(authRequiredResponse.status()).toBe(401);
  });

  test('should handle CORS headers properly', async ({ request }) => {
    const response = await request.get(`${baseURL}/health`, {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });

    // Check for common CORS headers
    const headers = response.headers();
    expect(headers).toHaveProperty('access-control-allow-origin', 'http://localhost:5173');
    expect(headers).toHaveProperty('access-control-allow-credentials', 'true');
    expect(headers).toHaveProperty('vary', 'Origin');
  });
});

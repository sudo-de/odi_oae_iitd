import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { describe, it, expect } from 'vitest';
import * as path from 'path';

const { like } = MatchersV3;

describe('Health API Consumer', () => {
  const provider = new PactV3({
    consumer: 'IITD Transport System',
    provider: 'Health API',
    dir: path.resolve(process.cwd(), 'test', 'pacts'),
  });

  describe('GET /health', () => {
    it('returns health status', () => {
      provider
        .given('the application is running')
        .uponReceiving('a request for health status')
        .withRequest({
          method: 'GET',
          path: '/health',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            status: 'ok',
            database: 'MongoDB',
            timestamp: like('2025-01-01T00:00:00.000Z'),
          }),
        });

      return provider.executeTest(async (mockserver) => {
        // Here you would make actual API calls to test against the mock
        // For this example, we'll just validate the contract structure
        const response = await fetch(`${mockserver.url}/health`);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.status).toBe('ok');
        expect(body.database).toBe('MongoDB');
        expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      });
    });
  });

  describe('GET /app/info', () => {
    it('returns application information', () => {
      provider
        .given('application info is available')
        .uponReceiving('a request for app information')
        .withRequest({
          method: 'GET',
          path: '/app/info',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: like({
            environment: 'development',
            version: like('1.0.0'),
            build: like('2024.01'),
          }),
        });

      return provider.executeTest(async (mockserver) => {
        const response = await fetch(`${mockserver.url}/app/info`);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.environment).toBe('development');
        expect(body.version).toMatch(/^\d+\.\d+\.\d+$/);
        expect(body.build).toMatch(/^\d{4}\.\d{2}$/);
      });
    });
  });
});

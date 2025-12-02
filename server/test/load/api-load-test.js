import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users over 2 minutes
  ],

  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
    http_req_failed: ['rate<0.05'],    // Error rate should be below 5%
    errors: ['rate<0.05'],             // Custom error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test health endpoint
  const healthStart = new Date().getTime();
  const healthResponse = http.get(`${BASE_URL}/health`);
  const healthDuration = new Date().getTime() - healthStart;

  const healthCheck = check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!healthCheck);
  responseTime.add(healthDuration);

  // Test app info endpoint
  const infoStart = new Date().getTime();
  const infoResponse = http.get(`${BASE_URL}/app/info`);
  const infoDuration = new Date().getTime() - infoStart;

  const infoCheck = check(infoResponse, {
    'app info status is 200': (r) => r.status === 200,
    'app info has version': (r) => r.json().hasOwnProperty('version'),
  });

  errorRate.add(!infoCheck);
  responseTime.add(infoDuration);

  // Simulate user behavior - random sleep between 1-5 seconds
  sleep(Math.random() * 4 + 1);
}

// Setup function (runs before the test starts)
export function setup() {
  console.log('Starting load test for IITD Transport Management System');
  console.log(`Target URL: ${BASE_URL}`);

  // Warm-up request
  const warmup = http.get(`${BASE_URL}/health`);
  if (warmup.status !== 200) {
    console.error('Warm-up request failed!');
    return;
  }

  console.log('Warm-up successful, starting load test...');
}

// Teardown function (runs after the test completes)
export function teardown(data) {
  console.log('Load test completed');
}

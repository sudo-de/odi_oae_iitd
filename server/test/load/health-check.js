import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  vus: 10, // 10 virtual users
  duration: '30s', // Test duration

  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'], // Error rate should be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test health endpoint
  const healthResponse = http.get(`${BASE_URL}/health`);

  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response has status ok': (r) => r.json().status === 'ok',
    'health response has database field': (r) => r.json().hasOwnProperty('database'),
    'health response has timestamp': (r) => r.json().hasOwnProperty('timestamp'),
  });

  sleep(1); // Wait 1 second between iterations
}

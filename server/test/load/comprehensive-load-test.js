import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const healthResponseTime = new Trend('health_response_time');
const apiResponseTime = new Trend('api_response_time');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test - basic functionality
    smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },

    // Load test - increasing traffic
    load_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 10 },   // Warm up
        { duration: '2m', target: 50 },   // Load testing
        { duration: '1m', target: 100 },  // Peak load
        { duration: '2m', target: 100 },  // Sustained load
        { duration: '1m', target: 0 },    // Cool down
      ],
      startTime: '30s',
      tags: { test_type: 'load' },
    },

    // Stress test - maximum capacity
    stress_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 200 },
        { duration: '2m', target: 500 },
        { duration: '1m', target: 1000 },
        { duration: '2m', target: 1000 },
        { duration: '1m', target: 0 },
      ],
      startTime: '8m',
      tags: { test_type: 'stress' },
    },
  },

  thresholds: {
    // Overall thresholds
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
    http_req_failed: ['rate<0.05'],

    // Custom metrics
    errors: ['rate<0.05'],
    health_response_time: ['p(95)<500'],
    api_response_time: ['p(95)<1500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testScenarios = [
  { name: 'health_check', weight: 30 },
  { name: 'app_info', weight: 20 },
  { name: 'api_info', weight: 15 },
  { name: 'unauthorized_access', weight: 10 },
  { name: 'invalid_endpoint', weight: 5 },
  { name: 'large_payload', weight: 5 },
  { name: 'slow_endpoint', weight: 5 },
  { name: 'concurrent_requests', weight: 10 },
];

function getRandomScenario() {
  const totalWeight = testScenarios.reduce((sum, scenario) => sum + scenario.weight, 0);
  let random = Math.random() * totalWeight;

  for (const scenario of testScenarios) {
    random -= scenario.weight;
    if (random <= 0) {
      return scenario.name;
    }
  }

  return testScenarios[0].name; // fallback
}

export default function () {
  const scenario = getRandomScenario();

  switch (scenario) {
    case 'health_check':
      performHealthCheck();
      break;

    case 'app_info':
      performAppInfoCheck();
      break;

    case 'api_info':
      performApiInfoCheck();
      break;

    case 'unauthorized_access':
      performUnauthorizedAccess();
      break;

    case 'invalid_endpoint':
      performInvalidEndpoint();
      break;

    case 'large_payload':
      performLargePayload();
      break;

    case 'slow_endpoint':
      performSlowEndpoint();
      break;

    case 'concurrent_requests':
      performConcurrentRequests();
      break;
  }

  // Random sleep between 0.5-2 seconds to simulate user behavior
  sleep(Math.random() * 1.5 + 0.5);
}

function performHealthCheck() {
  const start = new Date().getTime();
  const response = http.get(`${BASE_URL}/health`);
  const duration = new Date().getTime() - start;

  const checkResult = check(response, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 1000ms': (r) => r.timings.duration < 1000,
    'health has required fields': (r) => {
      const body = r.json();
      return body.status && body.database && body.timestamp;
    },
    'health database is accessible': (r) => r.json().database === 'MongoDB',
  });

  errorRate.add(!checkResult);
  responseTime.add(duration);
  healthResponseTime.add(duration);
}

function performAppInfoCheck() {
  const start = new Date().getTime();
  const response = http.get(`${BASE_URL}/app/info`);
  const duration = new Date().getTime() - start;

  const checkResult = check(response, {
    'app info status is 200': (r) => r.status === 200,
    'app info has version': (r) => r.json().version !== undefined,
    'app info has environment': (r) => r.json().environment !== undefined,
    'app info response time < 800ms': (r) => r.timings.duration < 800,
  });

  errorRate.add(!checkResult);
  responseTime.add(duration);
  apiResponseTime.add(duration);
}

function performApiInfoCheck() {
  const start = new Date().getTime();
  const response = http.get(`${BASE_URL}/api`);
  const duration = new Date().getTime() - start;

  const checkResult = check(response, {
    'api info status is 200': (r) => r.status === 200,
    'api info has name': (r) => r.json().name !== undefined,
    'api info has endpoints': (r) => r.json().endpoints !== undefined,
  });

  errorRate.add(!checkResult);
  responseTime.add(duration);
  apiResponseTime.add(duration);
}

function performUnauthorizedAccess() {
  // Test various protected endpoints
  const endpoints = [
    '/users',
    '/data-management/stats',
    '/auth/profile',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(`${BASE_URL}${endpoint}`);

  const checkResult = check(response, {
    'unauthorized access returns 401': (r) => r.status === 401,
  });

  errorRate.add(!checkResult);
  responseTime.add(new Date().getTime() - new Date().getTime());
}

function performInvalidEndpoint() {
  const response = http.get(`${BASE_URL}/nonexistent-endpoint-${Math.random()}`);

  const checkResult = check(response, {
    'invalid endpoint returns 404': (r) => r.status === 404,
  });

  errorRate.add(!checkResult);
  responseTime.add(new Date().getTime() - new Date().getTime());
}

function performLargePayload() {
  // Simulate large request payload
  const largeData = {
    data: 'x'.repeat(10000), // 10KB of data
    metadata: {
      timestamp: new Date().toISOString(),
      source: 'load-test',
    },
  };

  const response = http.post(`${BASE_URL}/data-management/import`, JSON.stringify(largeData), {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const checkResult = check(response, {
    'large payload handled': (r) => r.status === 401, // Should fail auth, not payload size
  });

  errorRate.add(!checkResult);
  responseTime.add(new Date().getTime() - new Date().getTime());
}

function performSlowEndpoint() {
  // Simulate slow processing (if we had such endpoints)
  // For now, just test health with artificial delay
  const response = http.get(`${BASE_URL}/health`, {
    timeout: '10s', // Extended timeout for slow operations
  });

  const checkResult = check(response, {
    'slow endpoint completes': (r) => r.status === 200,
    'slow endpoint within reasonable time': (r) => r.timings.duration < 5000,
  });

  errorRate.add(!checkResult);
  responseTime.add(new Date().getTime() - new Date().getTime());
}

function performConcurrentRequests() {
  // Simulate multiple concurrent requests
  const requests = [
    { method: 'GET', url: `${BASE_URL}/health` },
    { method: 'GET', url: `${BASE_URL}/app/info` },
    { method: 'GET', url: `${BASE_URL}/api` },
    { method: 'GET', url: `${BASE_URL}/users` }, // Will fail auth
  ];

  const responses = http.batch(requests);

  const checkResult = check(responses, {
    'all concurrent requests complete': (rs) => rs.every(r => r.status !== undefined),
    'public endpoints succeed': (rs) => rs.slice(0, 3).every(r => r.status === 200),
    'protected endpoints fail auth': (rs) => rs[3].status === 401,
  });

  errorRate.add(!checkResult);

  // Record response times for all requests
  responses.forEach(response => {
    responseTime.add(response.timings.duration);
    if (response.url.includes('/health')) {
      healthResponseTime.add(response.timings.duration);
    } else {
      apiResponseTime.add(response.timings.duration);
    }
  });
}

// Setup function - runs before the test
export function setup() {
  console.log('🚀 Starting comprehensive load test for IITD Transport Management System');
  console.log(`📍 Target URL: ${BASE_URL}`);
  console.log(`📊 Test Scenarios: ${testScenarios.length}`);
  console.log(`⏱️  Estimated duration: ~11 minutes`);

  // Pre-flight check
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    console.error('❌ Pre-flight check failed - server not responding');
    return;
  }

  console.log('✅ Pre-flight check passed - server is ready');
}

// Teardown function - runs after the test
export function teardown(data) {
  console.log('🏁 Load test completed');
  console.log('📈 Results summary:');
  console.log(`   - Total requests: ${__ENV.K6_VUS * __ENV.K6_ITERATIONS || 'N/A'}`);
  console.log(`   - Test duration: ${__ENV.K6_DURATION || 'N/A'}`);
  console.log(`   - Success rate: Check k6 output for detailed metrics`);
}

// Handle summary - custom summary output
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'test-results.json': JSON.stringify(data, null, 2),
    'summary.html': htmlReport(data),
  };
}

function textSummary(data, options) {
  return `
📊 Load Test Summary
==================

Test Duration: ${data.metrics.iteration_duration.values.avg}ms avg iteration
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%

Response Times:
  - Average: ${Math.round(data.metrics.http_req_duration.values.avg)}ms
  - 95th percentile: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
  - 99th percentile: ${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms

Custom Metrics:
  - Health endpoint avg: ${Math.round(data.metrics.health_response_time?.values?.avg || 0)}ms
  - API endpoint avg: ${Math.round(data.metrics.api_response_time?.values?.avg || 0)}ms
  - Error rate: ${(data.metrics.errors?.values?.rate || 0) * 100}%

Thresholds:
  ${data.metrics.http_req_duration.thresholds['p(95)<2000'] ? '✅' : '❌'} 95% of requests < 2000ms
  ${data.metrics.http_req_duration.thresholds['p(99)<3000'] ? '✅' : '❌'} 99% of requests < 3000ms
  ${data.metrics.http_req_failed.thresholds['rate<0.05'] ? '✅' : '❌'} Error rate < 5%
  `;
}

function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Load Test Report - IITD Transport System</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .success { color: green; }
        .failure { color: red; }
        h1, h2 { color: #333; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>🚀 IITD Transport System - Load Test Report</h1>

    <div class="metric">
        <h2>📈 Performance Summary</h2>
        <p><strong>Total Requests:</strong> ${data.metrics.http_reqs.values.count}</p>
        <p><strong>Average Response Time:</strong> ${Math.round(data.metrics.http_req_duration.values.avg)}ms</p>
        <p><strong>95th Percentile:</strong> ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms</p>
        <p><strong>Error Rate:</strong> ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</p>
    </div>

    <div class="metric">
        <h2>🎯 Threshold Results</h2>
        <p class="${data.metrics.http_req_duration.thresholds['p(95)<2000'] ? 'success' : 'failure'}">
            95% of requests < 2000ms: ${data.metrics.http_req_duration.thresholds['p(95)<2000'] ? '✅ PASS' : '❌ FAIL'}
        </p>
        <p class="${data.metrics.http_req_failed.thresholds['rate<0.05'] ? 'success' : 'failure'}">
            Error rate < 5%: ${data.metrics.http_req_failed.thresholds['rate<0.05'] ? '✅ PASS' : '❌ FAIL'}
        </p>
    </div>

    <div class="metric">
        <h2>📊 Detailed Metrics</h2>
        <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>HTTP Requests</td><td>${data.metrics.http_reqs.values.count}</td></tr>
            <tr><td>Duration (avg)</td><td>${Math.round(data.metrics.http_req_duration.values.avg)}ms</td></tr>
            <tr><td>Duration (p95)</td><td>${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms</td></tr>
            <tr><td>Duration (p99)</td><td>${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms</td></tr>
            <tr><td>Failed Requests</td><td>${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%</td></tr>
        </table>
    </div>
</body>
</html>
  `;
}

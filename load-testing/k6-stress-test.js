// K6 Stress Test Configuration
// Tests system behavior under high concurrent load

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Define custom metrics
const errorRate = new Rate('errors');
const requestDuration = new Trend('request_duration');
const loginDuration = new Trend('login_duration');
const bidSubmitDuration = new Trend('bid_submit_duration');
const paymentDuration = new Trend('payment_duration');
const successCount = new Counter('successful_requests');
const failureCount = new Counter('failed_requests');
const activeConnections = new Gauge('active_connections');

// Configuration
const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 100, name: 'Ramp-up (100 users)' },
    { duration: '3m', target: 500, name: 'Ramp-up (500 users)' },
    { duration: '5m', target: 1000, name: 'Sustained (1000 users)' },
    { duration: '3m', target: 2000, name: 'Peak (2000 users)' },
    { duration: '2m', target: 500, name: 'Ramp-down (500 users)' },
    { duration: '1m', target: 0, name: 'Ramp-down (0 users)' },
  ],
  thresholds: {
    http_req_duration: ['p(99)<500', 'p(95)<300'],
    http_req_failed: ['rate<0.005'], // 0.5% error rate threshold
    'vus': ['value<2000'], // Max 2000 concurrent users
  },
  ext: {
    loadimpact: {
      projectID: 3456789,
      name: 'FairTradeWorker Stress Test',
    },
  },
};

// Test data
const contractors = [
  { email: 'contractor1@test.com', password: 'SecurePass123!@#' },
  { email: 'contractor2@test.com', password: 'SecurePass123!@#' },
  { email: 'contractor3@test.com', password: 'SecurePass123!@#' },
];

const homeowners = [
  { email: 'homeowner1@test.com', password: 'SecurePass123!@#' },
  { email: 'homeowner2@test.com', password: 'SecurePass123!@#' },
];

// Helper functions
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateJobId() {
  return 'job_' + Math.random().toString(36).substring(7);
}

function generateContractId() {
  return 'contract_' + Math.random().toString(36).substring(7);
}

function authenticate(user) {
  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(user),
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: API_TIMEOUT,
    }
  );

  const success = check(loginResponse, {
    'login successful': (r) => r.status === 200,
    'login returns token': (r) => r.json('data.tokens.accessToken'),
  });

  if (!success) {
    failureCount.add(1);
    errorRate.add(1);
  } else {
    successCount.add(1);
  }

  loginDuration.add(loginResponse.timings.duration);

  return loginResponse.json('data.tokens.accessToken');
}

function submitBid(accessToken, jobId) {
  const bidData = {
    jobId,
    amount: Math.floor(Math.random() * 50000) + 5000,
    timeline: '5 days',
    proposal: 'I can complete this project efficiently',
  };

  const bidResponse = http.post(`${BASE_URL}/api/bids`, JSON.stringify(bidData), {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    timeout: API_TIMEOUT,
  });

  const success = check(bidResponse, {
    'bid submitted': (r) => r.status === 200 || r.status === 201,
    'bid has ID': (r) => r.json('data.id'),
  });

  if (!success) {
    failureCount.add(1);
    errorRate.add(1);
  } else {
    successCount.add(1);
  }

  bidSubmitDuration.add(bidResponse.timings.duration);

  return bidResponse.json('data.id');
}

function createPaymentIntent(accessToken, contractId, amount) {
  const paymentData = {
    contractId,
    amount,
    currency: 'usd',
    type: 'DEPOSIT',
  };

  const paymentResponse = http.post(
    `${BASE_URL}/api/payments/create-intent`,
    JSON.stringify(paymentData),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: API_TIMEOUT,
    }
  );

  const success = check(paymentResponse, {
    'payment intent created': (r) => r.status === 200 || r.status === 201,
    'client secret returned': (r) => r.json('data.clientSecret'),
  });

  if (!success) {
    failureCount.add(1);
    errorRate.add(1);
  } else {
    successCount.add(1);
  }

  paymentDuration.add(paymentResponse.timings.duration);

  return paymentResponse.json('data.clientSecret');
}

function healthCheck() {
  const healthResponse = http.get(`${BASE_URL}/api/health`, {
    timeout: API_TIMEOUT,
  });

  check(healthResponse, {
    'health check passed': (r) => r.status === 200,
  });
}

// Main test scenarios
export default function () {
  activeConnections.add(__VU); // Track active virtual users

  // Health check (20% of traffic)
  if (Math.random() < 0.2) {
    group('Health Check', () => {
      healthCheck();
    });
    sleep(1);
  }

  // Contractor bidding flow (40% of traffic)
  if (Math.random() < 0.4) {
    group('Contractor Bidding Flow', () => {
      const contractor = randomElement(contractors);
      const accessToken = authenticate(contractor);

      sleep(2);

      const jobId = generateJobId();
      const bidId = submitBid(accessToken, jobId);

      if (bidId) {
        sleep(1);
        // Get bid details
        const getBidResponse = http.get(`${BASE_URL}/api/bids/${bidId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: API_TIMEOUT,
        });

        check(getBidResponse, {
          'get bid successful': (r) => r.status === 200,
        });
      }
    });
    sleep(2);
  }

  // Homeowner payment flow (25% of traffic)
  if (Math.random() < 0.25) {
    group('Homeowner Payment Flow', () => {
      const homeowner = randomElement(homeowners);
      const accessToken = authenticate(homeowner);

      sleep(2);

      const contractId = generateContractId();
      const amount = Math.floor(Math.random() * 50000) + 5000;

      const clientSecret = createPaymentIntent(accessToken, contractId, amount);

      if (clientSecret) {
        sleep(1);
        // Confirm payment
        const confirmResponse = http.post(
          `${BASE_URL}/api/payments/confirm`,
          JSON.stringify({
            paymentIntentId: clientSecret,
            contractId,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            timeout: API_TIMEOUT,
          }
        );

        check(confirmResponse, {
          'payment confirmed': (r) => r.status === 200 || r.status === 201,
        });
      }
    });
    sleep(2);
  }

  // Completion submission (20% of traffic)
  if (Math.random() < 0.2) {
    group('Job Completion Flow', () => {
      const contractor = randomElement(contractors);
      const accessToken = authenticate(contractor);

      sleep(2);

      const contractId = generateContractId();
      const completionData = {
        photos: [
          `https://example.com/photo${Math.random()}.jpg`,
          `https://example.com/photo${Math.random()}.jpg`,
        ],
        videos: [],
        notes: 'Work completed successfully',
        geolocation: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      };

      const completionResponse = http.post(
        `${BASE_URL}/api/contracts/${contractId}/submit-completion`,
        JSON.stringify(completionData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: API_TIMEOUT,
        }
      );

      check(completionResponse, {
        'completion submitted': (r) => r.status === 200 || r.status === 201,
      });

      if (!completionResponse.ok) {
        errorRate.add(1);
        failureCount.add(1);
      } else {
        successCount.add(1);
      }
    });
    sleep(2);
  }

  // Random think time between 1-3 seconds
  sleep(Math.random() * 2 + 1);
}

// Teardown - summary statistics
export function teardown(data) {
  console.log('');
  console.log('========================================');
  console.log('Load Test Summary');
  console.log('========================================');
  console.log(`Successful Requests: ${successCount.value}`);
  console.log(`Failed Requests: ${failureCount.value}`);
  console.log(`Error Rate: ${errorRate.value.toFixed(2)}%`);
  console.log('========================================');
}

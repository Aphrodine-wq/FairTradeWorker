/**
 * Jest Setup File
 * Configures test environment and mocks
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn(() => ({
    charges: {
      create: jest.fn().mockResolvedValue({
        id: 'ch_test_123',
        status: 'succeeded',
        amount: 100,
        currency: 'usd',
      }),
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 'ref_test_123',
        status: 'succeeded',
        charge: 'ch_test_123',
      }),
    },
    transfers: {
      create: jest.fn().mockResolvedValue({
        id: 'tr_test_123',
        status: 'succeeded',
        amount: 100,
      }),
    },
    customers: {
      create: jest.fn().mockResolvedValue({
        id: 'cus_test_123',
        email: 'test@example.com',
      }),
    },
  }));
});

// Mock SendGrid
jest.mock('@sendgrid/mail', () => {
  return {
    setApiKey: jest.fn(),
    send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
  };
});

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        sid: 'SM_test_123',
        status: 'sent',
        to: '+1234567890',
      }),
    },
    calls: {
      create: jest.fn().mockResolvedValue({
        sid: 'CA_test_123',
        status: 'initiated',
      }),
    },
  }));
});

// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  return {
    initializeApp: jest.fn(),
    messaging: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue('projects/test/messages/123'),
      sendMulticast: jest.fn().mockResolvedValue({
        successCount: 1,
        failureCount: 0,
      }),
    }),
  };
});

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
});

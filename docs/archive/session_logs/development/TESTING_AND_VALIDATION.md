# Testing and Validation Guide - FairTradeWorker Enhanced Services

**Document Version:** 1.0
**Last Updated:** January 4, 2026
**Status:** Ready for QA and Testing

---

## Overview

This document provides comprehensive testing procedures for all 83 API endpoints across the FairTradeWorker platform. It covers unit tests, integration tests, and end-to-end scenarios.

---

## Test Environment Setup

### Prerequisites
```bash
# Install testing dependencies
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# Install test database tools
npm install --save-dev @prisma/client @testcontainers/testcontainers
```

### Configuration
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/backend'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'backend/services/**/*.ts',
    'backend/routes/**/*.ts',
    '!**/*.d.ts',
  ],
};
```

---

## Core Endpoints Testing

### 1. Jobs Endpoints (5 endpoints)

#### Test Suite: Create Job
```typescript
describe('POST /api/jobs - Create Job', () => {
  it('should create a new job for homeowner', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        title: 'Kitchen Renovation',
        description: 'Complete kitchen remodel',
        category: 'Renovation',
        budget: 15000,
        location: 'San Francisco, CA',
        zipCode: '94103',
        estimatedDays: 30,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.title).toBe('Kitchen Renovation');
    expect(response.body.data.status).toBe('OPEN');
  });

  it('should reject non-homeowner users', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({ title: 'Test', budget: 1000 });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({ title: 'Kitchen Renovation' }); // Missing required fields

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

#### Test Suite: Get Job Details
```typescript
describe('GET /api/jobs/:jobId - Get Job Details', () => {
  let jobId: string;

  beforeEach(async () => {
    // Create a test job
    const createResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        title: 'Test Job',
        budget: 5000,
        category: 'Repair',
      });
    jobId = createResponse.body.data.id;
  });

  it('should return job details with bids count', async () => {
    const response = await request(app)
      .get(`/api/jobs/${jobId}`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id', jobId);
    expect(response.body.data).toHaveProperty('bids');
  });

  it('should return 404 for non-existent job', async () => {
    const response = await request(app)
      .get('/api/jobs/invalid-id')
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(404);
  });
});
```

#### Test Suite: List Jobs
```typescript
describe('GET /api/jobs - List Jobs', () => {
  beforeEach(async () => {
    // Create multiple test jobs
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          title: `Job ${i}`,
          budget: 5000 + i * 1000,
          category: i % 2 === 0 ? 'Renovation' : 'Repair',
        });
    }
  });

  it('should list jobs with pagination', async () => {
    const response = await request(app)
      .get('/api/jobs?page=1&limit=10')
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination).toHaveProperty('page', 1);
    expect(response.body.pagination).toHaveProperty('total');
  });

  it('should filter jobs by category', async () => {
    const response = await request(app)
      .get('/api/jobs?category=Renovation')
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    const renovationJobs = response.body.data.filter(
      (job: any) => job.category === 'Renovation'
    );
    expect(renovationJobs.length).toBeGreaterThan(0);
  });

  it('should filter jobs by budget range', async () => {
    const response = await request(app)
      .get('/api/jobs?minBudget=6000&maxBudget=8000')
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    response.body.data.forEach((job: any) => {
      expect(job.budget).toBeGreaterThanOrEqual(6000);
      expect(job.budget).toBeLessThanOrEqual(8000);
    });
  });
});
```

---

### 2. Bids Endpoints (7 endpoints)

#### Test Suite: Submit Bid
```typescript
describe('POST /api/bids - Submit Bid', () => {
  let jobId: string;

  beforeEach(async () => {
    const jobResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        title: 'Test Job',
        budget: 10000,
        category: 'Renovation',
      });
    jobId = jobResponse.body.data.id;
  });

  it('should submit bid as contractor', async () => {
    const response = await request(app)
      .post('/api/bids')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        jobId,
        amount: 9000,
        timeline: '2 weeks',
        proposal: 'I can do this work efficiently',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.status).toBe('PENDING');
  });

  it('should reject invalid bid amount', async () => {
    const response = await request(app)
      .post('/api/bids')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        jobId,
        amount: -1000, // Invalid
        timeline: '2 weeks',
        proposal: 'Test',
      });

    expect(response.status).toBe(400);
  });

  it('should reject duplicate bid from same contractor', async () => {
    // Submit first bid
    await request(app)
      .post('/api/bids')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        jobId,
        amount: 9000,
        timeline: '2 weeks',
        proposal: 'First bid',
      });

    // Try to submit another bid
    const response = await request(app)
      .post('/api/bids')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        jobId,
        amount: 8500,
        timeline: '1 week',
        proposal: 'Second bid',
      });

    expect(response.status).toBe(400);
  });
});
```

#### Test Suite: Accept Bid
```typescript
describe('POST /api/bids/:bidId/accept - Accept Bid', () => {
  let jobId: string;
  let bidId: string;

  beforeEach(async () => {
    // Create job
    const jobResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({ title: 'Test', budget: 10000, category: 'Renovation' });
    jobId = jobResponse.body.data.id;

    // Submit bid
    const bidResponse = await request(app)
      .post('/api/bids')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        jobId,
        amount: 9000,
        timeline: '2 weeks',
        proposal: 'Test',
      });
    bidId = bidResponse.body.data.id;
  });

  it('should accept bid and create contract', async () => {
    const response = await request(app)
      .post(`/api/bids/${bidId}/accept`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('contractId');
    expect(response.body.message).toBe('Bid accepted and contract created');
  });

  it('should reject if not homeowner', async () => {
    const response = await request(app)
      .post(`/api/bids/${bidId}/accept`)
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(response.status).toBe(403);
  });
});
```

---

### 3. Contracts Endpoints (8 endpoints)

#### Test Suite: Get Contract
```typescript
describe('GET /api/contracts/:contractId - Get Contract', () => {
  let contractId: string;

  beforeEach(async () => {
    // Create and accept a bid to get a contract
    contractId = await createTestContract();
  });

  it('should return contract details', async () => {
    const response = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id', contractId);
    expect(response.body.data).toHaveProperty('status', 'ACTIVE');
    expect(response.body.data).toHaveProperty('jobId');
    expect(response.body.data).toHaveProperty('value');
  });

  it('should be accessible to both homeowner and contractor', async () => {
    const homeownerResponse = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    const contractorResponse = await request(app)
      .get(`/api/contracts/${contractId}`)
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(homeownerResponse.status).toBe(200);
    expect(contractorResponse.status).toBe(200);
  });
});
```

#### Test Suite: Submit Completion
```typescript
describe('POST /api/contracts/:contractId/complete - Submit Completion', () => {
  let contractId: string;

  beforeEach(async () => {
    contractId = await createTestContract();
  });

  it('should submit work completion as contractor', async () => {
    const response = await request(app)
      .post(`/api/contracts/${contractId}/complete`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        photos: ['https://example.com/photo1.jpg'],
        videos: [],
        notes: 'Work completed as per specifications',
        geolocation: { lat: 37.7749, lng: -122.4194 },
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('status', 'PENDING_APPROVAL');
  });

  it('should require photos or videos', async () => {
    const response = await request(app)
      .post(`/api/contracts/${contractId}/complete`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        photos: [],
        videos: [],
        notes: 'No evidence provided',
      });

    expect(response.status).toBe(400);
  });
});
```

---

## Enhanced Endpoints Testing

### 1. Enhanced Job Service (7 endpoints)

#### Test Suite: Advanced Job Search
```typescript
describe('GET /api/jobs/search/advanced - Advanced Job Search', () => {
  beforeEach(async () => {
    // Create test jobs with various attributes
    await createTestJobs([
      { title: 'Kitchen Renovation', budget: 15000, location: 'San Francisco' },
      { title: 'Bathroom Repair', budget: 3000, location: 'Oakland' },
      { title: 'Roof Replacement', budget: 25000, location: 'Berkeley' },
    ]);
  });

  it('should search by multiple criteria', async () => {
    const response = await request(app)
      .get(
        '/api/jobs/search/advanced?category=Renovation&minBudget=10000&maxBudget=20000&location=San%20Francisco'
      )
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.jobs).toBeDefined();
    expect(response.body.pagination).toBeDefined();
    response.body.jobs.forEach((job: any) => {
      expect(job.category).toBe('Renovation');
      expect(job.budget).toBeGreaterThanOrEqual(10000);
      expect(job.budget).toBeLessThanOrEqual(20000);
    });
  });

  it('should filter by urgency', async () => {
    const response = await request(app)
      .get('/api/jobs/search/advanced?urgency=immediate')
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.jobs).toBeDefined();
  });

  it('should filter by minimum contractor rating', async () => {
    const response = await request(app)
      .get('/api/jobs/search/advanced?minimumContractorRating=4.5')
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(response.status).toBe(200);
  });

  it('should support pagination', async () => {
    const page1 = await request(app)
      .get('/api/jobs/search/advanced?page=1&limit=5')
      .set('Authorization', `Bearer ${contractorToken}`);

    const page2 = await request(app)
      .get('/api/jobs/search/advanced?page=2&limit=5')
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(page1.body.pagination.page).toBe(1);
    expect(page2.body.pagination.page).toBe(2);
  });
});
```

#### Test Suite: Job Recommendations
```typescript
describe('GET /api/jobs/recommendations/contractor - Job Recommendations', () => {
  let contractorId: string;

  beforeEach(async () => {
    // Create contractor with history
    contractorId = await createContractorWithHistory();

    // Create various job opportunities
    await createTestJobs([
      { category: 'Renovation', budget: 10000 }, // Matches contractor history
      { category: 'Plumbing', budget: 5000 },   // Outside expertise
      { category: 'Renovation', budget: 12000 }, // Matches contractor history
    ]);
  });

  it('should return jobs matching contractor expertise', async () => {
    const response = await request(app)
      .get('/api/jobs/recommendations/contractor?limit=10')
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);

    // All recommendations should have a matchScore
    response.body.data.forEach((rec: any) => {
      expect(rec).toHaveProperty('jobId');
      expect(rec).toHaveProperty('matchScore');
      expect(rec).toHaveProperty('matchReasons');
      expect(rec.matchScore).toBeGreaterThan(0);
    });
  });

  it('should rank jobs by match score', async () => {
    const response = await request(app)
      .get('/api/jobs/recommendations/contractor?limit=10')
      .set('Authorization', `Bearer ${contractorToken}`);

    expect(response.status).toBe(200);
    // Verify recommendations are sorted by matchScore descending
    for (let i = 0; i < response.body.data.length - 1; i++) {
      expect(response.body.data[i].matchScore).toBeGreaterThanOrEqual(
        response.body.data[i + 1].matchScore
      );
    }
  });
});
```

### 2. Enhanced Bid Service (6 endpoints)

#### Test Suite: Bid Comparison
```typescript
describe('GET /api/jobs/:jobId/bids/compare - Bid Comparison', () => {
  let jobId: string;

  beforeEach(async () => {
    // Create job
    const jobResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({ title: 'Test', budget: 10000, category: 'Renovation' });
    jobId = jobResponse.body.data.id;

    // Submit multiple bids
    const contractors = await createMultipleContractors(3);
    for (const contractor of contractors) {
      await request(app)
        .post('/api/bids')
        .set('Authorization', `Bearer ${contractor.token}`)
        .send({
          jobId,
          amount: 8000 + Math.random() * 2000,
          timeline: '2 weeks',
          proposal: 'Qualified bid',
        });
    }
  });

  it('should return all bids with comparison scores', async () => {
    const response = await request(app)
      .get(`/api/jobs/${jobId}/bids/compare`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(1);

    response.body.data.forEach((bid: any) => {
      expect(bid).toHaveProperty('bidId');
      expect(bid).toHaveProperty('contractorName');
      expect(bid).toHaveProperty('amount');
      expect(bid).toHaveProperty('contractorRating');
      expect(bid).toHaveProperty('competitivenessScore');
      expect(bid).toHaveProperty('valueForMoney');
      expect(bid).toHaveProperty('trustScore');
      expect(bid).toHaveProperty('overallScore');
    });
  });

  it('should rank bids by overall score', async () => {
    const response = await request(app)
      .get(`/api/jobs/${jobId}/bids/compare`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    // Verify bids are sorted by overallScore descending
    for (let i = 0; i < response.body.data.length - 1; i++) {
      expect(response.body.data[i].overallScore).toBeGreaterThanOrEqual(
        response.body.data[i + 1].overallScore
      );
    }
  });
});
```

#### Test Suite: Contractor Performance
```typescript
describe('GET /api/contractors/:contractorId/performance - Contractor Performance', () => {
  let contractorId: string;

  beforeEach(async () => {
    contractorId = await createContractorWithHistory();
  });

  it('should return comprehensive performance metrics', async () => {
    const response = await request(app)
      .get(`/api/contractors/${contractorId}/performance`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    const perf = response.body.data;

    expect(perf).toHaveProperty('totalBidsSubmitted');
    expect(perf).toHaveProperty('bidsAccepted');
    expect(perf).toHaveProperty('acceptanceRate');
    expect(perf).toHaveProperty('averageBidAmount');
    expect(perf).toHaveProperty('jobsCompleted');
    expect(perf).toHaveProperty('completionRate');
    expect(perf).toHaveProperty('averageRating');
    expect(perf).toHaveProperty('onTimeDeliveryRate');
    expect(perf).toHaveProperty('customerSatisfaction');
  });
});
```

### 3. Enhanced Contract Service (8 endpoints)

#### Test Suite: Milestone Management
```typescript
describe('POST /api/contracts/:contractId/milestones - Milestone Management', () => {
  let contractId: string;

  beforeEach(async () => {
    contractId = await createTestContract();
  });

  it('should create a milestone', async () => {
    const response = await request(app)
      .post(`/api/contracts/${contractId}/milestones`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        title: 'Foundation Work',
        description: 'Complete foundation inspection and repairs',
        dueDate: '2026-02-15',
        targetAmount: 3000,
        deliverables: ['Foundation report', 'Repairs completed'],
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('title', 'Foundation Work');
    expect(response.body.data).toHaveProperty('status', 'PENDING');
  });

  it('should retrieve all milestones', async () => {
    // Create multiple milestones
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post(`/api/contracts/${contractId}/milestones`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({
          title: `Milestone ${i + 1}`,
          dueDate: `2026-0${2 + i}-15`,
          targetAmount: 3000,
        });
    }

    const response = await request(app)
      .get(`/api/contracts/${contractId}/milestones`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(3);
  });

  it('should update a milestone', async () => {
    // Create milestone
    const createResponse = await request(app)
      .post(`/api/contracts/${contractId}/milestones`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        title: 'Foundation Work',
        dueDate: '2026-02-15',
        targetAmount: 3000,
      });
    const milestoneId = createResponse.body.data.id;

    // Update milestone
    const updateResponse = await request(app)
      .patch(`/api/contracts/${contractId}/milestones/${milestoneId}`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        dueDate: '2026-02-20',
        targetAmount: 3500,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.dueDate).toMatch('2026-02-20');
  });
});
```

#### Test Suite: Contract Progress
```typescript
describe('GET /api/contracts/:contractId/progress - Contract Progress', () => {
  let contractId: string;

  beforeEach(async () => {
    contractId = await createTestContractWithMilestones();
  });

  it('should return detailed progress tracking', async () => {
    const response = await request(app)
      .get(`/api/contracts/${contractId}/progress`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(response.status).toBe(200);
    const progress = response.body.data;

    expect(progress).toHaveProperty('totalMilestones');
    expect(progress).toHaveProperty('completedMilestones');
    expect(progress).toHaveProperty('overallProgress');
    expect(progress).toHaveProperty('timeline');
    expect(progress).toHaveProperty('budget');
    expect(progress).toHaveProperty('nextMilestone');
    expect(progress).toHaveProperty('riskFactors');

    // Verify percentages are valid
    expect(progress.overallProgress).toBeGreaterThanOrEqual(0);
    expect(progress.overallProgress).toBeLessThanOrEqual(100);
  });
});
```

### 4. Enhanced Payment Service (8 endpoints)

#### Test Suite: Escrow Management
```typescript
describe('POST /api/payments/escrow/create - Escrow Management', () => {
  let contractId: string;

  beforeEach(async () => {
    contractId = await createTestContract();
  });

  it('should create escrow account', async () => {
    const response = await request(app)
      .post('/api/payments/escrow/create')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        contractId,
        totalAmount: 10000,
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('totalAmount', 10000);
    expect(response.body.data).toHaveProperty('heldAmount', 10000);
    expect(response.body.data).toHaveProperty('status', 'ACTIVE');
  });

  it('should process deposit', async () => {
    // Create escrow
    const escrowResponse = await request(app)
      .post('/api/payments/escrow/create')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({ contractId, totalAmount: 10000 });
    const escrowId = escrowResponse.body.data.id;

    // Deposit funds
    const depositResponse = await request(app)
      .post(`/api/payments/escrow/${escrowId}/deposit`)
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        amount: 2500,
        paymentMethodId: 'pm_test_123',
      });

    expect(depositResponse.status).toBe(201);
    expect(depositResponse.body.data).toHaveProperty('status', 'COMPLETED');
  });

  it('should release milestone payment', async () => {
    const escrowId = await createTestEscrowAccount(contractId, 10000);
    const milestoneId = await createTestMilestone(contractId);

    const response = await request(app)
      .post(`/api/payments/escrow/${escrowId}/release/milestone`)
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({ milestoneId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Payment released for milestone');
  });
});
```

### 5. Enhanced Notification Service (6 endpoints)

#### Test Suite: Notifications
```typescript
describe('POST /api/notifications/send - Notification System', () => {
  it('should send notification via template', async () => {
    const response = await request(app)
      .post('/api/notifications/send')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        templateId: 'bidReceived',
        variables: {
          jobTitle: 'Kitchen Renovation',
          contractorName: 'John Smith',
          bidAmount: 10000,
        },
        channels: ['email', 'push'],
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.count).toBe(2); // Email + Push
  });

  it('should schedule notification', async () => {
    const scheduledTime = new Date(Date.now() + 86400000); // 24 hours from now

    const response = await request(app)
      .post('/api/notifications/schedule')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        templateId: 'milestoneReminder',
        scheduledFor: scheduledTime.toISOString(),
        variables: {
          milestoneName: 'Foundation Work',
          dueDate: '2026-02-15',
        },
        channels: ['email'],
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('status', 'SCHEDULED');
  });

  it('should get and update preferences', async () => {
    // Get current preferences
    const getResponse = await request(app)
      .get('/api/notifications/preferences')
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data).toHaveProperty('emailNotifications');
    expect(getResponse.body.data).toHaveProperty('quietHoursEnabled');

    // Update preferences
    const updateResponse = await request(app)
      .patch('/api/notifications/preferences')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        emailFrequency: 'daily',
        smsNotifications: true,
        quietHoursEnabled: false,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.emailFrequency).toBe('daily');
  });
});
```

---

## Integration Tests

### End-to-End: Job to Contract Completion
```typescript
describe('E2E: Complete Job Lifecycle', () => {
  it('should complete full workflow from job creation to payment', async () => {
    // 1. Create job as homeowner
    const jobResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        title: 'Kitchen Renovation',
        budget: 15000,
        category: 'Renovation',
      });
    const jobId = jobResponse.body.data.id;

    // 2. Submit bids as contractors
    const bidResponse = await request(app)
      .post('/api/bids')
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        jobId,
        amount: 14000,
        timeline: '3 weeks',
        proposal: 'Expert kitchen renovation',
      });
    const bidId = bidResponse.body.data.id;

    // 3. Get bid analysis
    const analysisResponse = await request(app)
      .get(`/api/jobs/${jobId}/bids/analytics`)
      .set('Authorization', `Bearer ${homeownerToken}`);
    expect(analysisResponse.status).toBe(200);

    // 4. Accept bid
    const acceptResponse = await request(app)
      .post(`/api/bids/${bidId}/accept`)
      .set('Authorization', `Bearer ${homeownerToken}`);
    const contractId = acceptResponse.body.data.contractId;

    // 5. Create milestones
    const milestoneResponse = await request(app)
      .post(`/api/contracts/${contractId}/milestones`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        title: 'Phase 1: Demolition',
        dueDate: '2026-02-01',
        targetAmount: 3000,
      });
    const milestoneId = milestoneResponse.body.data.id;

    // 6. Create escrow
    const escrowResponse = await request(app)
      .post('/api/payments/escrow/create')
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({ contractId, totalAmount: 15000 });
    const escrowId = escrowResponse.body.data.id;

    // 7. Deposit funds
    await request(app)
      .post(`/api/payments/escrow/${escrowId}/deposit`)
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({ amount: 3750, paymentMethodId: 'pm_test' });

    // 8. Submit completion
    const completionResponse = await request(app)
      .post(`/api/contracts/${contractId}/complete`)
      .set('Authorization', `Bearer ${contractorToken}`)
      .send({
        photos: ['https://example.com/photo1.jpg'],
        notes: 'Phase 1 complete',
      });

    // 9. Approve completion
    const approvalResponse = await request(app)
      .post(`/api/contracts/${contractId}/completion/approve`)
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({
        completionId: completionResponse.body.data.id,
        approved: true,
        rating: 5,
        feedback: 'Excellent work!',
      });

    expect(approvalResponse.status).toBe(200);

    // 10. Release payment for milestone
    const releaseResponse = await request(app)
      .post(`/api/payments/escrow/${escrowId}/release/milestone`)
      .set('Authorization', `Bearer ${homeownerToken}`)
      .send({ milestoneId });

    expect(releaseResponse.status).toBe(200);

    // 11. Get contract progress
    const progressResponse = await request(app)
      .get(`/api/contracts/${contractId}/progress`)
      .set('Authorization', `Bearer ${homeownerToken}`);

    expect(progressResponse.status).toBe(200);
    expect(progressResponse.body.data.completedMilestones).toBeGreaterThan(0);
  });
});
```

---

## Performance Tests

### Load Testing Configuration
```typescript
describe('Performance Tests', () => {
  it('should handle concurrent job searches', async () => {
    const promises = [];

    for (let i = 0; i < 100; i++) {
      promises.push(
        request(app)
          .get('/api/jobs/search/advanced?category=Renovation&limit=20')
          .set('Authorization', `Bearer ${contractorToken}`)
      );
    }

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
  });

  it('should handle batch notifications', async () => {
    const userIds = await createMultipleUsers(50);

    const startTime = Date.now();
    const response = await request(app)
      .post('/api/notifications/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userIds,
        templateId: 'systemAlert',
        variables: { message: 'Platform maintenance' },
      });
    const duration = Date.now() - startTime;

    expect(response.status).toBe(201);
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });
});
```

---

## Coverage Goals

| Category | Target Coverage |
|----------|-----------------|
| Core Endpoints | 95%+ |
| Enhanced Services | 90%+ |
| Business Logic | 85%+ |
| Error Handling | 90%+ |
| Integration Flows | 80%+ |

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- jobs.test.ts
npm test -- bids.test.ts
npm test -- contracts.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Run Performance Tests
```bash
npm test -- --testPathPattern="performance"
```

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

---

## Sign-Off Checklist

- [ ] All 83 endpoints tested and passing
- [ ] Core endpoints: 95%+ coverage
- [ ] Enhanced services: 90%+ coverage
- [ ] E2E workflows validated
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Security tests passed
- [ ] Load tests completed
- [ ] Documentation updated
- [ ] Ready for production deployment

---

**Status:** ✅ Testing framework ready for QA team
**Next Step:** Execute test suite and validate all endpoints


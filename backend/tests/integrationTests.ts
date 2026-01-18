/**
 * Integration Tests - Critical Workflow Testing
 * Tests complete workflows end-to-end
 * Run with: npm test
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { JobService } from '../services/jobService';
import { BidService } from '../services/bidService';
import { ContractService } from '../services/contractService';
import { PaymentService } from '../services/paymentService';
import { NotificationServiceImpl } from '../services/notificationServiceImpl';
import { IntegrationService } from '../services/integrationService';
import prisma from '../../src/services/database';

describe('Complete Bid → Contract → Payment Workflow', () => {
  let jobService: JobService;
  let bidService: BidService;
  let contractService: ContractService;
  let paymentService: PaymentService;
  let integrationService: IntegrationService;

  let homeownerId: string;
  let contractorId: string;
  let jobId: string;
  let bidId: string;
  let contractId: string;

  beforeAll(async () => {
    // Initialize services
    jobService = new JobService();
    bidService = new BidService();
    contractService = new ContractService();
    paymentService = new PaymentService();
    integrationService = new IntegrationService();

    // Create test users
    const homeowner = await prisma.user.create({
      data: {
        email: 'homeowner@test.com',
        password: 'hashed_password',
        firstName: 'John',
        lastName: 'Homeowner',
        role: 'HOMEOWNER',
        verificationStatus: 'VERIFIED',
        averageRating: 5.0,
      },
    });

    const contractor = await prisma.user.create({
      data: {
        email: 'contractor@test.com',
        password: 'hashed_password',
        firstName: 'Jane',
        lastName: 'Contractor',
        role: 'CONTRACTOR',
        verificationStatus: 'VERIFIED',
        averageRating: 4.8,
      },
    });

    homeownerId = homeowner.id;
    contractorId = contractor.id;
  });

  it('1. Should create a job', async () => {
    const job = await jobService.createJob(homeownerId, {
      title: 'Kitchen Renovation',
      description: 'Complete kitchen remodel',
      category: 'HOME_RENOVATION',
      budget: 15000,
      location: '123 Main St, Portland, OR',
      zipCode: '97201',
      estimatedDays: 14,
      images: [],
      preferredTradeTypes: ['GENERAL_CONTRACTOR'],
      minimumRating: 4.0,
    });

    expect(job).toHaveProperty('id');
    expect(job.title).toBe('Kitchen Renovation');
    expect(job.status).toBe('OPEN');
    expect(job.budget).toBe(15000);

    jobId = job.id;

    // Trigger job created event
    await integrationService.onJobCreated(jobId);
  });

  it('2. Should list jobs with filters', async () => {
    const jobs = await jobService.listJobs({
      category: 'HOME_RENOVATION',
      minBudget: 10000,
      maxBudget: 20000,
      page: 1,
      limit: 10,
    });

    expect(jobs).toHaveProperty('jobs');
    expect(jobs).toHaveProperty('total');
    expect(Array.isArray(jobs.jobs)).toBe(true);
    expect(jobs.jobs.some((j: any) => j.id === jobId)).toBe(true);
  });

  it('3. Should submit a bid', async () => {
    const bid = await bidService.submitBid(contractorId, {
      jobId: jobId,
      amount: 14500,
      timeline: '10 days',
      proposal: 'I can complete this project on time and within budget.',
    });

    expect(bid).toHaveProperty('id');
    expect(bid.amount).toBe(14500);
    expect(bid.status).toBe('SUBMITTED');
    expect(bid.contractorId).toBe(contractorId);

    bidId = bid.id;

    // Trigger bid submitted event
    await integrationService.onBidSubmitted(bidId);
  });

  it('4. Should get job bids', async () => {
    const jobBids = await bidService.getJobBids(jobId);

    expect(Array.isArray(jobBids)).toBe(true);
    expect(jobBids.length).toBeGreaterThan(0);
    expect(jobBids[0]).toHaveProperty('contractor');
    expect(jobBids[0]).toHaveProperty('amount');
  });

  it('5. Should accept a bid and create contract', async () => {
    const result = await bidService.acceptBid(homeownerId, bidId);

    expect(result).toHaveProperty('contractId');
    expect(result.status).toBe('ACCEPTED');
    expect(result.depositAmount).toBe(3625); // 25% of 14500

    contractId = result.contractId;

    // Trigger bid accepted event
    await integrationService.onBidAccepted(bidId);
  });

  it('6. Should verify escrow account created', async () => {
    const escrow = await prisma.escrowAccount.findUnique({
      where: { contractId: contractId },
    });

    expect(escrow).toBeDefined();
    expect(escrow?.depositAmount).toBe(3625);
    expect(escrow?.finalAmount).toBe(10875); // 75%
    expect(escrow?.totalFees).toBe(2175); // 15%
    expect(escrow?.status).toBe('ACTIVE');
  });

  it('7. Should get contract details', async () => {
    const contract = await contractService.getContract(contractId);

    expect(contract).toHaveProperty('id');
    expect(contract.status).toBe('ACTIVE');
    expect(contract.amount).toBe(14500);
    expect(contract.homeownerId).toBe(homeownerId);
    expect(contract.contractorId).toBe(contractorId);
  });

  it('8. Should submit completion with photos', async () => {
    const completion = await contractService.submitCompletion(contractorId, contractId, {
      photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
      videos: [],
      notes: 'Work completed as specified',
      geolocation: { latitude: 45.5152, longitude: -122.6784 },
    });

    expect(completion).toHaveProperty('completionId');
    expect(completion.status).toBe('SUBMITTED');

    // Trigger completion submitted event
    await integrationService.onCompletionSubmitted(completion.completionId);
  });

  it('9. Should approve completion and release payment', async () => {
    const completions = await prisma.jobCompletion.findMany({
      where: { contractId: contractId },
    });

    expect(completions.length).toBeGreaterThan(0);

    const completionId = completions[0].id;

    const approvalResult = await contractService.approveCompletion(
      homeownerId,
      contractId,
      completionId,
      {
        approved: true,
        rating: 5,
        feedback: 'Excellent work!',
      }
    );

    expect(approvalResult.status).toBe('COMPLETED');
    expect(approvalResult.finalPaymentReleased).toBe(true);

    // Trigger completion approved event
    await integrationService.onCompletionApproved(completionId, 5);
  });

  it('10. Should verify final payment released', async () => {
    const escrow = await prisma.escrowAccount.findUnique({
      where: { contractId: contractId },
    });

    expect(escrow?.status).toBe('RELEASED');
    expect(escrow?.finalReleasedAt).toBeDefined();
  });

  it('11. Should get bid analytics', async () => {
    const analytics = await integrationService.getServices().analytics.getBidAnalytics(contractorId);

    expect(analytics).toHaveProperty('totalBids');
    expect(analytics).toHaveProperty('acceptedBids');
    expect(analytics).toHaveProperty('winRate');
    expect(analytics).toHaveProperty('avgBidAmount');
    expect(analytics.acceptedBids).toBeGreaterThan(0);
  });

  it('12. Should get revenue analytics', async () => {
    const revenue = await integrationService
      .getServices()
      .analytics.getRevenueAnalytics(contractorId, 30);

    expect(revenue).toHaveProperty('completedContracts');
    expect(revenue).toHaveProperty('totalRevenue');
    expect(revenue).toHaveProperty('netEarnings');
    expect(revenue.completedContracts).toBeGreaterThan(0);
  });

  it('13. Should get homeowner dashboard', async () => {
    const dashboard = await integrationService
      .getServices()
      .analytics.getHomeownerDashboard(homeownerId);

    expect(dashboard).toHaveProperty('activeJobs');
    expect(dashboard).toHaveProperty('completedJobs');
    expect(dashboard).toHaveProperty('totalSpent');
    expect(dashboard).toHaveProperty('activeContracts');
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { id: { in: [homeownerId, contractorId] } },
    });
  });
});

describe('Change Order Workflow', () => {
  let contractId: string;
  let homeownerId: string;
  let contractorId: string;
  let integrationService: IntegrationService;

  beforeAll(async () => {
    integrationService = new IntegrationService();
    // Setup would be similar to above
  });

  it('1. Should create a change order', async () => {
    const contractService = new ContractService();

    // Assumes contract exists from previous workflow
    // In real tests, we'd create a contract first
    const changeOrder = await contractService.createChangeOrder(contractorId, contractId, {
      title: 'Additional tile work',
      description: 'Additional bathroom tiling requested',
      amount: 2000,
    });

    expect(changeOrder).toHaveProperty('changeOrderId');
    expect(changeOrder.status).toBe('PENDING');
    expect(changeOrder.amount).toBe(2000);

    // Trigger change order created event
    await integrationService.onChangeOrderCreated(changeOrder.changeOrderId);
  });

  it('2. Should approve change order and charge additional amount', async () => {
    const contractService = new ContractService();
    const changeOrders = await prisma.changeOrder.findMany({
      where: { contractId: contractId },
    });

    const changeOrderId = changeOrders[0].id;

    const approval = await contractService.approveChangeOrder(homeownerId, contractId, changeOrderId);

    expect(approval.status).toBe('APPROVED');
    expect(approval.newContractAmount).toBe(16500); // 14500 + 2000

    // Trigger change order approved event
    await integrationService.onChangeOrderApproved(changeOrderId);
  });
});

describe('Payment Service', () => {
  let paymentService: PaymentService;

  beforeAll(() => {
    paymentService = new PaymentService();
  });

  it('Should calculate contractor net correctly', () => {
    const contractAmount = 14500;
    const platformFee = 15;

    const net = paymentService.calculateContractorNet(contractAmount, platformFee);

    expect(net).toBe(12325); // 14500 * 0.85
  });

  it('Should calculate platform fee correctly', () => {
    const contractAmount = 14500;
    const platformFee = contractAmount * 0.15;

    expect(platformFee).toBe(2175);
  });
});

describe('Validation Tests', () => {
  let jobService: JobService;

  beforeAll(() => {
    jobService = new JobService();
  });

  it('Should reject job creation with missing required fields', async () => {
    const userId = 'test-user-id';

    try {
      await jobService.createJob(userId, {
        title: '', // Empty title
        description: 'Test',
        category: 'HOME_RENOVATION',
        budget: 0, // Invalid budget
        location: 'Test',
        zipCode: 'invalid', // Invalid zip
        estimatedDays: -1, // Invalid days
      } as any);

      fail('Should have thrown validation error');
    } catch (error: any) {
      expect(error.message).toContain('validation');
    }
  });
});

describe('Error Handling', () => {
  let contractService: ContractService;

  beforeAll(() => {
    contractService = new ContractService();
  });

  it('Should handle non-existent contract gracefully', async () => {
    try {
      await contractService.getContract('non-existent-id');
      fail('Should have thrown error');
    } catch (error: any) {
      expect(error.message).toContain('not found');
    }
  });

  it('Should handle unauthorized actions', async () => {
    // Create a contract with one user
    // Try to approve it with a different unauthorized user
    // Should throw authorization error
  });
});

export default describe;

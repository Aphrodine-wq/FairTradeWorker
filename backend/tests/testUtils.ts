/**
 * Test Utilities
 * Helper functions for testing
 */

import prisma from '../../src/services/database';
import jwt from 'jsonwebtoken';

/**
 * Create a test user
 */
export async function createTestUser(data?: Partial<any>) {
  return await prisma.user.create({
    data: {
      email: data?.email || `test_${Date.now()}@example.com`,
      password: 'hashed_password_test',
      firstName: data?.firstName || 'Test',
      lastName: data?.lastName || 'User',
      role: data?.role || 'HOMEOWNER',
      verificationStatus: data?.verificationStatus || 'VERIFIED',
      averageRating: data?.averageRating || 5.0,
      profileComplete: true,
    },
  });
}

/**
 * Create multiple test users
 */
export async function createTestUsers(count: number = 2, role: string = 'HOMEOWNER') {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      role,
      email: `test_${Date.now()}_${i}@example.com`,
    });
    users.push(user);
  }
  return users;
}

/**
 * Create a test job
 */
export async function createTestJob(homeownerId: string, data?: Partial<any>) {
  return await prisma.job.create({
    data: {
      title: data?.title || 'Test Job',
      description: data?.description || 'Test job description',
      category: data?.category || 'HOME_RENOVATION',
      budget: data?.budget || 10000,
      location: data?.location || '123 Main St',
      zipCode: data?.zipCode || '97201',
      estimatedDays: data?.estimatedDays || 7,
      status: data?.status || 'OPEN',
      postedById: homeownerId,
      images: data?.images || [],
      preferredTradeTypes: data?.preferredTradeTypes || [],
      minimumRating: data?.minimumRating || 4.0,
    },
  });
}

/**
 * Create a test bid
 */
export async function createTestBid(jobId: string, contractorId: string, data?: Partial<any>) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  return await prisma.bid.create({
    data: {
      jobId,
      contractorId,
      amount: data?.amount || job?.budget || 10000,
      timeline: data?.timeline || '7 days',
      proposal: data?.proposal || 'I can complete this job',
      status: data?.status || 'SUBMITTED',
      contractorRatingSnapshot: data?.contractorRatingSnapshot || 4.5,
    },
  });
}

/**
 * Create a test contract from a bid
 */
export async function createTestContract(bidId: string, data?: Partial<any>) {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { job: true },
  });

  if (!bid || !bid.job) throw new Error('Bid not found');

  return await prisma.bidContract.create({
    data: {
      bidId,
      jobId: bid.jobId,
      homeownerId: bid.job.postedById,
      contractorId: bid.contractorId,
      amount: data?.amount || bid.amount,
      status: data?.status || 'ACTIVE',
      platformFee: (bid.amount * 0.15),
      contractorNet: (bid.amount * 0.85),
      acceptedAt: data?.acceptedAt || new Date(),
    },
  });
}

/**
 * Create test escrow account
 */
export async function createTestEscrow(contractId: string, amount: number) {
  return await prisma.escrowAccount.create({
    data: {
      contractId,
      depositAmount: amount * 0.25,
      finalAmount: amount * 0.75,
      totalFees: amount * 0.15,
      status: 'ACTIVE',
    },
  });
}

/**
 * Generate a test JWT token
 */
export function generateTestToken(userId: string, role: string = 'HOMEOWNER', tier: string = 'FREE') {
  return jwt.sign(
    {
      id: userId,
      role,
      tier,
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '24h' }
  );
}

/**
 * Create a complete test workflow (job -> bid -> contract)
 */
export async function createCompleteWorkflow() {
  const [homeowner, contractor] = await createTestUsers(2, 'HOMEOWNER');
  const contractor2 = await createTestUser({ role: 'CONTRACTOR' });

  const job = await createTestJob(homeowner.id);
  const bid = await createTestBid(job.id, contractor2.id);
  const contract = await createTestContract(bid.id);
  const escrow = await createTestEscrow(contract.id, contract.amount);

  return {
    homeowner,
    contractor,
    contractor2,
    job,
    bid,
    contract,
    escrow,
  };
}

/**
 * Clean up test data
 */
export async function cleanupTestData(userId: string) {
  // Delete in reverse order of dependencies
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.jobCompletion.deleteMany({
    where: {
      contract: { OR: [{ homeownerId: userId }, { contractorId: userId }] },
    },
  });
  await prisma.escrowAccount.deleteMany({
    where: {
      contract: { OR: [{ homeownerId: userId }, { contractorId: userId }] },
    },
  });
  await prisma.bidContract.deleteMany({
    where: { OR: [{ homeownerId: userId }, { contractorId: userId }] },
  });
  await prisma.bid.deleteMany({ where: { contractorId: userId } });
  await prisma.job.deleteMany({ where: { postedById: userId } });
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
}

/**
 * Clean up all test workflows
 */
export async function cleanupAllTestData(userIds: string[]) {
  for (const userId of userIds) {
    await cleanupTestData(userId);
  }
}

/**
 * Assert field exists and has expected type
 */
export function assertFieldExists(obj: any, field: string, expectedType?: string) {
  expect(obj).toHaveProperty(field);
  if (expectedType) {
    expect(typeof obj[field]).toBe(expectedType);
  }
}

/**
 * Compare two timestamps (within 1 second)
 */
export function assertTimestampsClose(date1: Date, date2: Date, deltaMs: number = 1000) {
  expect(Math.abs(date1.getTime() - date2.getTime())).toBeLessThan(deltaMs);
}

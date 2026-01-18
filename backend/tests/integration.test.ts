/**
 * End-to-End Integration Tests
 * Testing complete workflows: job posting -> bidding -> acceptance -> completion -> payment
 */

import { AuthService } from '../services/authService';
import { BidService } from '../services/bidService';
import { ContractService } from '../services/contractService';
import { PaymentService } from '../services/paymentService';
import { EscrowService } from '../services/escrowService';

describe('End-to-End Workflows', () => {
  let authService: AuthService;
  let bidService: BidService;
  let contractService: ContractService;
  let paymentService: PaymentService;
  let escrowService: EscrowService;

  let homeowner: any;
  let contractor: any;
  let jobId: string;
  let bidId: string;
  let contractId: string;

  beforeEach(async () => {
    authService = new AuthService();
    bidService = new BidService();
    contractService = new ContractService();
    paymentService = new PaymentService();
    escrowService = new EscrowService();
  });

  describe('Complete Job Workflow', () => {
    it('should complete full workflow: post job -> bid -> accept -> complete -> approve -> payout', async () => {
      // STEP 1: Register homeowner
      const homeownerResult = await authService.register({
        email: 'homeowner@example.com',
        phone: '+12125551001',
        password: 'HomePassword123!@#',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'HOMEOWNER',
      });

      homeowner = homeownerResult.user;
      expect(homeowner).toBeDefined();
      expect(homeowner.role).toBe('HOMEOWNER');

      // STEP 2: Register contractor
      const contractorResult = await authService.register({
        email: 'contractor@example.com',
        phone: '+12125551002',
        password: 'ContractorPassword123!@#',
        firstName: 'John',
        lastName: 'Builder',
        role: 'CONTRACTOR',
      });

      contractor = contractorResult.user;
      expect(contractor).toBeDefined();
      expect(contractor.role).toBe('CONTRACTOR');

      // STEP 3: Homeowner posts job (simulated - normally through job service)
      jobId = `job_${Date.now()}`;

      // STEP 4: Contractor submits bid
      const bidData = {
        jobId,
        amount: 50000, // $500
        timeline: '5 days',
        proposal: 'I specialize in this type of work and can guarantee quality',
      };

      const bid = await bidService.submitBid(contractor.id, bidData);
      bidId = bid.id;

      expect(bid.status).toBe('PENDING');
      expect(bid.amount).toBe(50000);

      // STEP 5: Homeowner accepts bid
      const contract = await contractService.createContractFromBid(
        bidId,
        jobId,
        contractor.id,
        homeowner.id,
        50000
      );

      contractId = contract.id;

      expect(contract.status).toBe('ACTIVE');
      expect(contract.homeownerId).toBe(homeowner.id);
      expect(contract.contractorId).toBe(contractor.id);

      // STEP 6: Create escrow account for funds
      const escrow = await escrowService.createEscrow({
        contractId,
        amount: 50000,
        status: 'ACTIVE',
        depositAmount: 12500, // 25% deposit
      });

      expect(escrow.totalAmount).toBe(50000);
      expect(escrow.depositAmount).toBe(12500);

      // STEP 7: Homeowner makes deposit payment
      const depositIntent = await paymentService.createPaymentIntent({
        contractId,
        amount: 12500, // 25% deposit
        currency: 'usd',
        type: 'DEPOSIT',
        homeownerId: homeowner.id,
      });

      expect(depositIntent.status).toBe('PENDING');
      expect(depositIntent.amount).toBe(12500);

      // STEP 8: Payment confirmation
      const depositConfirmation = await paymentService.confirmPayment({
        paymentIntentId: depositIntent.clientSecret,
        contractId,
        homeownerId: homeowner.id,
      });

      expect(depositConfirmation.status).toBe('SUCCEEDED');

      // STEP 9: Contractor completes work and submits completion
      const completionData = {
        photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
        videos: ['https://example.com/video1.mp4'],
        notes: 'Work completed as specified. All materials are high quality.',
        geolocation: { latitude: 40.7128, longitude: -74.006 },
      };

      const completion = await contractService.submitCompletion(contractId, contractor.id, completionData);

      expect(completion.status).toBe('SUBMITTED');
      expect(completion.photos.length).toBe(2);

      // STEP 10: Homeowner approves completion and leaves rating
      const approval = await contractService.approveCompletion(
        completion.id,
        homeowner.id,
        {
          approved: true,
          rating: 5,
          feedback: 'Excellent work, very professional',
        }
      );

      expect(approval).toBeDefined();

      // STEP 11: Final payment processing
      const finalPaymentIntent = await paymentService.createPaymentIntent({
        contractId,
        amount: 37500, // 75% final payment
        currency: 'usd',
        type: 'FINAL_PAYMENT',
        homeownerId: homeowner.id,
      });

      const finalConfirmation = await paymentService.confirmPayment({
        paymentIntentId: finalPaymentIntent.clientSecret,
        contractId,
        homeownerId: homeowner.id,
      });

      expect(finalConfirmation.status).toBe('SUCCEEDED');

      // STEP 12: Release funds from escrow
      const payout = await escrowService.releaseFinalPayment({
        contractId,
        contractorId: contractor.id,
        amount: 44000, // After 12% platform fee
        platformFee: 6000,
      });

      expect(payout.status).toBe('PENDING');

      // STEP 13: Verify contract is marked COMPLETED
      const finalContract = await contractService.getContract(contractId);

      expect(finalContract.status).toBe('COMPLETED');
      expect(finalContract.completedAt).toBeDefined();
    });

    it('should handle dispute workflow: reject completion -> initiate dispute -> hold funds', async () => {
      // Setup: Create homeowner, contractor, job, bid, contract
      const homeownerResult = await authService.register({
        email: 'homeowner-dispute@example.com',
        phone: '+12125551003',
        password: 'HomePassword123!@#',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'HOMEOWNER',
      });

      const contractorResult = await authService.register({
        email: 'contractor-dispute@example.com',
        phone: '+12125551004',
        password: 'ContractorPassword123!@#',
        firstName: 'John',
        lastName: 'Builder',
        role: 'CONTRACTOR',
      });

      const jobId = `job_dispute_${Date.now()}`;

      const bid = await bidService.submitBid(contractorResult.user.id, {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'I can do this',
      });

      const contract = await contractService.createContractFromBid(
        bid.id,
        jobId,
        contractorResult.user.id,
        homeownerResult.user.id,
        50000
      );

      const escrow = await escrowService.createEscrow({
        contractId: contract.id,
        amount: 50000,
        status: 'ACTIVE',
        depositAmount: 12500,
      });

      // Contractor submits completion
      const completion = await contractService.submitCompletion(contract.id, contractorResult.user.id, {
        photos: ['https://example.com/photo1.jpg'],
        notes: 'Work completed',
      });

      // Homeowner REJECTS completion (initiating dispute)
      const rejection = await contractService.approveCompletion(
        completion.id,
        homeownerResult.user.id,
        {
          approved: false,
          feedback: 'Work does not meet specifications',
        }
      );

      // Contract should be back to ACTIVE
      expect(rejection).toBeDefined();

      // Hold funds in escrow during dispute
      const disputeHold = await escrowService.holdInDispute({
        contractId: contract.id,
        amount: 50000,
      });

      expect(disputeHold.type).toBe('HELD_IN_DISPUTE');
      expect(disputeHold.status).toBe('HELD');
    });

    it('should handle refund on full dispute resolution', async () => {
      // Setup dispute scenario
      const homeownerResult = await authService.register({
        email: 'homeowner-refund@example.com',
        phone: '+12125551005',
        password: 'HomePassword123!@#',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'HOMEOWNER',
      });

      const contractorResult = await authService.register({
        email: 'contractor-refund@example.com',
        phone: '+12125551006',
        password: 'ContractorPassword123!@#',
        firstName: 'John',
        lastName: 'Builder',
        role: 'CONTRACTOR',
      });

      const jobId = `job_refund_${Date.now()}`;

      const bid = await bidService.submitBid(contractorResult.user.id, {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'I can do this',
      });

      const contract = await contractService.createContractFromBid(
        bid.id,
        jobId,
        contractorResult.user.id,
        homeownerResult.user.id,
        50000
      );

      // Hold funds in dispute
      await escrowService.holdInDispute({
        contractId: contract.id,
        amount: 50000,
      });

      // Resolve with full refund to homeowner
      const refund = await escrowService.refundToHomeowner({
        contractId: contract.id,
        amount: 50000,
      });

      expect(refund.type).toBe('REFUND_TO_HOMEOWNER');
      expect(refund.amount).toBe(50000);
      expect(refund.status).toBe('PENDING');
    });
  });

  describe('Multiple Bids Scenario', () => {
    it('should handle multiple bids and auto-reject on acceptance', async () => {
      const homeownerResult = await authService.register({
        email: 'homeowner-multi@example.com',
        phone: '+12125551007',
        password: 'HomePassword123!@#',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'HOMEOWNER',
      });

      const contractor1Result = await authService.register({
        email: 'contractor1-multi@example.com',
        phone: '+12125551008',
        password: 'ContractorPassword123!@#',
        firstName: 'John',
        lastName: 'Builder1',
        role: 'CONTRACTOR',
      });

      const contractor2Result = await authService.register({
        email: 'contractor2-multi@example.com',
        phone: '+12125551009',
        password: 'ContractorPassword123!@#',
        firstName: 'Jane',
        lastName: 'Builder2',
        role: 'CONTRACTOR',
      });

      const jobId = `job_multi_${Date.now()}`;

      // Submit bids from two contractors
      const bid1 = await bidService.submitBid(contractor1Result.user.id, {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'Bid 1',
      });

      const bid2 = await bidService.submitBid(contractor2Result.user.id, {
        jobId,
        amount: 55000,
        timeline: '4 days',
        proposal: 'Bid 2',
      });

      // Homeowner accepts first bid
      await contractService.createContractFromBid(
        bid1.id,
        jobId,
        contractor1Result.user.id,
        homeownerResult.user.id,
        50000
      );

      // Verify second bid is rejected
      const bid2Updated = await bidService.getBid(bid2.id);
      expect(bid2Updated.status).toBe('REJECTED');
    });
  });

  describe('Blind Bidding Security', () => {
    it('contractors should not see competitors bids during bidding', async () => {
      const homeownerResult = await authService.register({
        email: 'homeowner-blind@example.com',
        phone: '+12125551010',
        password: 'HomePassword123!@#',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'HOMEOWNER',
      });

      const contractor1Result = await authService.register({
        email: 'contractor1-blind@example.com',
        phone: '+12125551011',
        password: 'ContractorPassword123!@#',
        firstName: 'John',
        lastName: 'Builder1',
        role: 'CONTRACTOR',
      });

      const contractor2Result = await authService.register({
        email: 'contractor2-blind@example.com',
        phone: '+12125551012',
        password: 'ContractorPassword123!@#',
        firstName: 'Jane',
        lastName: 'Builder2',
        role: 'CONTRACTOR',
      });

      const jobId = `job_blind_${Date.now()}`;

      // Contractor 1 submits bid
      await bidService.submitBid(contractor1Result.user.id, {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'Bid 1',
      });

      // Contractor 2 submits bid
      await bidService.submitBid(contractor2Result.user.id, {
        jobId,
        amount: 55000,
        timeline: '4 days',
        proposal: 'Bid 2',
      });

      // Contractor 1 should only see their own bid
      const contractor1Bids = await bidService.getJobBids(jobId, contractor1Result.user.id, 'CONTRACTOR');

      expect(contractor1Bids.length).toBe(1);
      expect(contractor1Bids[0].contractorId).toBe(contractor1Result.user.id);
      expect(contractor1Bids[0].amount).toBe(50000);

      // Contractor 2 should only see their own bid
      const contractor2Bids = await bidService.getJobBids(jobId, contractor2Result.user.id, 'CONTRACTOR');

      expect(contractor2Bids.length).toBe(1);
      expect(contractor2Bids[0].contractorId).toBe(contractor2Result.user.id);
      expect(contractor2Bids[0].amount).toBe(55000);

      // Homeowner should see all bids
      const homeownerBids = await bidService.getJobBids(jobId, homeownerResult.user.id, 'HOMEOWNER');

      expect(homeownerBids.length).toBe(2);
    });
  });
});

/**
 * Bid & Contract Workflow Tests
 * Testing bid submission, visibility, acceptance, and contract creation
 */

import { BidService } from '../services/bidService';
import { ContractService } from '../services/contractService';

describe('BidService & ContractService', () => {
  let bidService: BidService;
  let contractService: ContractService;

  beforeEach(() => {
    bidService = new BidService();
    contractService = new ContractService();
  });

  describe('Bid Submission', () => {
    it('should submit bid with valid data', async () => {
      const bidData = {
        jobId: 'job_123',
        amount: 50000,
        timeline: '5 days',
        proposal: 'I can complete this job efficiently',
      };

      const bid = await bidService.submitBid('contractor_123', bidData);

      expect(bid).toBeDefined();
      expect(bid.jobId).toBe('job_123');
      expect(bid.amount).toBe(50000);
      expect(bid.contractorId).toBe('contractor_123');
      expect(bid.status).toBe('PENDING');
    });

    it('should reject bid with amount less than $100', async () => {
      const bidData = {
        jobId: 'job_123',
        amount: 50, // Less than minimum
        timeline: '5 days',
        proposal: 'I can complete this job',
      };

      await expect(
        bidService.submitBid('contractor_123', bidData)
      ).rejects.toThrow('INVALID_AMOUNT');
    });

    it('should prevent duplicate bids from same contractor', async () => {
      const bidData = {
        jobId: 'job_123',
        amount: 50000,
        timeline: '5 days',
        proposal: 'First bid',
      };

      // Submit first bid
      await bidService.submitBid('contractor_123', bidData);

      // Try to submit second bid on same job
      await expect(
        bidService.submitBid('contractor_123', bidData)
      ).rejects.toThrow('already bid');
    });
  });

  describe('Bid Visibility (Blind Bidding Security)', () => {
    it('homeowner should see all bids on their job', async () => {
      const jobId = 'job_123';
      const homeownerId = 'homeowner_123';

      // Submit multiple bids
      await bidService.submitBid('contractor_1', {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'Bid 1',
      });

      await bidService.submitBid('contractor_2', {
        jobId,
        amount: 55000,
        timeline: '4 days',
        proposal: 'Bid 2',
      });

      // Homeowner should see all
      const bids = await bidService.getJobBids(jobId, homeownerId, 'HOMEOWNER');

      expect(bids.length).toBe(2);
    });

    it('contractor should only see their own bid (blind bidding)', async () => {
      const jobId = 'job_123';
      const contractorId = 'contractor_1';

      // Submit bids from different contractors
      await bidService.submitBid('contractor_1', {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'My bid',
      });

      await bidService.submitBid('contractor_2', {
        jobId,
        amount: 55000,
        timeline: '4 days',
        proposal: 'Other bid',
      });

      // Contractor_1 should only see their own bid
      const bids = await bidService.getJobBids(jobId, contractorId, 'CONTRACTOR');

      expect(bids.length).toBe(1);
      expect(bids[0].contractorId).toBe(contractorId);
    });

    it('non-bidder contractor cannot see bids (enforcement of blind bidding)', async () => {
      const jobId = 'job_123';

      // Submit bids
      await bidService.submitBid('contractor_1', {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'Bid 1',
      });

      // Contractor_2 tries to view bids without bidding
      await expect(
        bidService.getJobBids(jobId, 'contractor_2', 'CONTRACTOR')
      ).rejects.toThrow('blind bidding');
    });

    it('admin should see all bids', async () => {
      const jobId = 'job_123';

      await bidService.submitBid('contractor_1', {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'Bid 1',
      });

      await bidService.submitBid('contractor_2', {
        jobId,
        amount: 55000,
        timeline: '4 days',
        proposal: 'Bid 2',
      });

      // Admin should see all
      const bids = await bidService.getJobBids(jobId, 'admin_123', 'ADMIN');

      expect(bids.length).toBe(2);
    });
  });

  describe('Bid Acceptance & Contract Creation', () => {
    it('should create contract when homeowner accepts bid', async () => {
      const jobId = 'job_123';
      const homeownerId = 'homeowner_123';
      const contractorId = 'contractor_123';

      // Submit bid
      const bid = await bidService.submitBid(contractorId, {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'I can do this',
      });

      // Accept bid
      const contract = await contractService.createContractFromBid(
        bid.id,
        jobId,
        contractorId,
        homeownerId,
        50000
      );

      expect(contract).toBeDefined();
      expect(contract.status).toBe('ACTIVE');
      expect(contract.homeownerId).toBe(homeownerId);
      expect(contract.contractorId).toBe(contractorId);
      expect(contract.acceptedAt).toBeDefined();
    });

    it('should calculate fees correctly on contract creation', async () => {
      const jobId = 'job_123';
      const homeownerId = 'homeowner_123';
      const contractorId = 'contractor_123';
      const amount = 50000;

      const bid = await bidService.submitBid(contractorId, {
        jobId,
        amount,
        timeline: '5 days',
        proposal: 'I can do this',
      });

      const contract = await contractService.createContractFromBid(
        bid.id,
        jobId,
        contractorId,
        homeownerId,
        amount
      );

      // Verify fee calculations
      expect(contract.depositAmount).toBe(amount * 0.25); // 25% deposit
      expect(contract.finalAmount).toBe(amount * 0.75); // 75% final
      expect(contract.platformFee).toBe(contract.depositAmount * 0.12); // 12% on deposit
    });

    it('should auto-reject other bids when one is accepted', async () => {
      const jobId = 'job_123';
      const homeownerId = 'homeowner_123';

      // Submit multiple bids
      const bid1 = await bidService.submitBid('contractor_1', {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'Bid 1',
      });

      const bid2 = await bidService.submitBid('contractor_2', {
        jobId,
        amount: 55000,
        timeline: '4 days',
        proposal: 'Bid 2',
      });

      // Accept first bid
      await contractService.createContractFromBid(
        bid1.id,
        jobId,
        'contractor_1',
        homeownerId,
        50000
      );

      // Second bid should be rejected
      const bid2Updated = await bidService.getBid(bid2.id);
      expect(bid2Updated.status).toBe('REJECTED');
    });

    it('should update job status to CONTRACTED', async () => {
      const jobId = 'job_123';
      const homeownerId = 'homeowner_123';
      const contractorId = 'contractor_123';

      const bid = await bidService.submitBid(contractorId, {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'I can do this',
      });

      await contractService.createContractFromBid(
        bid.id,
        jobId,
        contractorId,
        homeownerId,
        50000
      );

      // Job status should be CONTRACTED
      // (Would check job service in real implementation)
    });

    it('should only allow homeowner to accept bid', async () => {
      const jobId = 'job_123';
      const contractorId = 'contractor_123';
      const differentUser = 'random_user_123';

      const bid = await bidService.submitBid(contractorId, {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'I can do this',
      });

      await expect(
        contractService.createContractFromBid(
          bid.id,
          jobId,
          contractorId,
          differentUser, // Not the homeowner
          50000
        )
      ).rejects.toThrow();
    });
  });

  describe('Contract Retrieval', () => {
    it('should retrieve contract by ID', async () => {
      const jobId = 'job_123';
      const homeownerId = 'homeowner_123';
      const contractorId = 'contractor_123';

      const bid = await bidService.submitBid(contractorId, {
        jobId,
        amount: 50000,
        timeline: '5 days',
        proposal: 'I can do this',
      });

      const contract = await contractService.createContractFromBid(
        bid.id,
        jobId,
        contractorId,
        homeownerId,
        50000
      );

      const retrieved = await contractService.getContract(contract.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(contract.id);
      expect(retrieved.status).toBe('ACTIVE');
    });

    it('should retrieve contracts by homeowner', async () => {
      const homeownerId = 'homeowner_123';

      // In real test, would create multiple contracts
      const contracts = await contractService.getHomeownerContracts(homeownerId);

      expect(Array.isArray(contracts)).toBe(true);
    });

    it('should retrieve contracts by contractor', async () => {
      const contractorId = 'contractor_123';

      const contracts = await contractService.getContractorContracts(contractorId);

      expect(Array.isArray(contracts)).toBe(true);
    });
  });

  describe('Bid Analytics', () => {
    it('should calculate average bid amount for job', async () => {
      const jobId = 'job_123';

      await bidService.submitBid('contractor_1', {
        jobId,
        amount: 40000,
        timeline: '5 days',
        proposal: 'Bid 1',
      });

      await bidService.submitBid('contractor_2', {
        jobId,
        amount: 60000,
        timeline: '4 days',
        proposal: 'Bid 2',
      });

      // Average should be 50000
      // (Would test with actual analytics method)
    });
  });
});

/**
 * Bid Service - PHASE 2 Core Features
 * Handles bid submission, acceptance, and management
 */

import { Database } from '../database';

const prisma = new Database();

export interface SubmitBidInput {
  jobId: string;
  amount: number;
  timeline: string;
  proposal?: string;
}

export class BidService {
  /**
   * Submit a new bid on a job
   */
  async submitBid(
    contractorId: string,
    input: SubmitBidInput
  ): Promise<any> {
    try {
      // Verify job exists and is open
      const job = await prisma.job.findUnique({
        where: { id: input.jobId },
      });

      if (!job) throw new Error('Job not found');
      if (job.status !== 'OPEN') throw new Error('Job is no longer accepting bids');

      // Check if contractor already bid
      const existingBid = await prisma.bid.findUnique({
        where: {
          jobId_contractorId: {
            jobId: input.jobId,
            contractorId,
          },
        },
      });

      if (existingBid) throw new Error('You have already submitted a bid on this job');

      // Get contractor profile for snapshot
      const contractor = await prisma.user.findUnique({
        where: { id: contractorId },
      });

      // Create bid
      const bid = await prisma.bid.create({
        data: {
          jobId: input.jobId,
          contractorId,
          amount: input.amount,
          timeline: input.timeline,
          proposal: input.proposal,
          status: 'SUBMITTED',
          contractorRating: contractor?.averageRating || 0,
          contractorReviews: contractor?.totalReviews || 0,
        },
        include: {
          contractor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              averageRating: true,
              totalReviews: true,
            },
          },
        },
      });

      console.log(`✅ Bid submitted: ${bid.id}`);
      return bid;
    } catch (error: any) {
      console.error('❌ Error submitting bid:', error);
      throw new Error(`Failed to submit bid: ${error.message}`);
    }
  }

  /**
   * Get all bids on a job with visibility rules
   *
   * SECURITY: Bid Visibility Rules
   * - Homeowner (who posted job) sees ALL bids
   * - Contractor sees ONLY their own bid (blind bidding enforced)
   * - Admin sees all bids
   * - Non-bidders see nothing (401 error)
   */
  async getJobBids(
    jobId: string,
    requestingUserId: string,
    userRole: string
  ): Promise<any[]> {
    try {
      // Get the job to check who posted it
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) throw new Error('Job not found');

      let query: any = { jobId };

      // Determine what bids this user can see based on role
      if (job.postedById === requestingUserId) {
        // Homeowner sees ALL bids on their job
        query = { jobId };
      } else if (userRole === 'ADMIN') {
        // Admin sees all bids
        query = { jobId };
      } else {
        // Regular contractor can ONLY see their own bid (blind bidding enforced)
        query = {
          jobId,
          contractorId: requestingUserId, // Filter to only this user's bid
        };
      }

      const bids = await prisma.bid.findMany({
        where: query,
        include: {
          contractor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              averageRating: true,
              totalReviews: true,
              specializations: true,
              completedJobs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // If requester is not homeowner/admin and has no bid, they see nothing
      if (
        job.postedById !== requestingUserId &&
        userRole !== 'ADMIN' &&
        bids.length === 0
      ) {
        throw new Error('No bids visible (blind bidding - you have not bid on this job)');
      }

      // Log bid visibility for audit trail
      if (job.postedById === requestingUserId || userRole === 'ADMIN') {
        console.log(`✅ Homeowner/Admin viewing ${bids.length} bids on job ${jobId}`);
      } else {
        console.log(`✅ Contractor viewing their own bid(s) on job ${jobId}`);
      }

      return bids;
    } catch (error: any) {
      console.error('❌ Error fetching bids:', error);
      throw new Error(`Failed to fetch bids: ${error.message}`);
    }
  }

  /**
   * Get bid by ID
   */
  async getBid(bidId: string): Promise<any> {
    try {
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              budget: true,
              category: true,
            },
          },
          contractor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              averageRating: true,
              specializations: true,
            },
          },
        },
      });

      if (!bid) throw new Error('Bid not found');
      return bid;
    } catch (error: any) {
      console.error('❌ Error fetching bid:', error);
      throw new Error(`Failed to fetch bid: ${error.message}`);
    }
  }

  /**
   * Get bids by contractor
   */
  async getContractorBids(
    contractorId: string,
    status?: string
  ): Promise<any[]> {
    try {
      const where: any = { contractorId };
      if (status) where.status = status;

      const bids = await prisma.bid.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              budget: true,
              category: true,
              status: true,
              postedBy: {
                select: {
                  firstName: true,
                  lastName: true,
                  averageRating: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return bids;
    } catch (error: any) {
      console.error('❌ Error fetching contractor bids:', error);
      throw new Error(`Failed to fetch bids: ${error.message}`);
    }
  }

  /**
   * Accept a bid (homeowner) → Create contract
   */
  async acceptBid(
    bidId: string,
    homeownerId: string
  ): Promise<any> {
    try {
      // Get bid
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: { job: true },
      });

      if (!bid) throw new Error('Bid not found');
      if (bid.job.postedById !== homeownerId) throw new Error('Unauthorized');
      if (bid.status !== 'SUBMITTED') throw new Error('Bid is no longer available');

      // Create contract
      const contract = await prisma.bidContract.create({
        data: {
          jobId: bid.jobId,
          homeownerId,
          contractorId: bid.contractorId,
          amount: bid.amount,
          timeline: bid.timeline,
          description: bid.proposal,
          status: 'ACCEPTED',
          depositAmount: bid.amount * 0.25, // 25% deposit
          finalAmount: bid.amount * 0.75, // 75% final payment
          platformFee: bid.amount * 0.15, // 15% platform fee
          contractorNet: bid.amount * 0.85, // Contractor gets 85% (100% - 15% fee)
          acceptedAt: new Date(),
        },
        include: {
          homeowner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          contractor: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Reject all other bids
      await prisma.bid.updateMany({
        where: {
          jobId: bid.jobId,
          status: 'SUBMITTED',
          id: { not: bidId },
        },
        data: { status: 'REJECTED' },
      });

      // Accept this bid
      await prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      });

      console.log(`✅ Bid accepted and contract created: ${contract.id}`);
      return contract;
    } catch (error: any) {
      console.error('❌ Error accepting bid:', error);
      throw new Error(`Failed to accept bid: ${error.message}`);
    }
  }

  /**
   * Reject a bid
   */
  async rejectBid(
    bidId: string,
    homeownerId: string
  ): Promise<void> {
    try {
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: { job: true },
      });

      if (!bid) throw new Error('Bid not found');
      if (bid.job.postedById !== homeownerId) throw new Error('Unauthorized');

      await prisma.bid.update({
        where: { id: bidId },
        data: { status: 'REJECTED' },
      });

      console.log(`✅ Bid rejected: ${bidId}`);
    } catch (error: any) {
      console.error('❌ Error rejecting bid:', error);
      throw new Error(`Failed to reject bid: ${error.message}`);
    }
  }

  /**
   * Withdraw bid (contractor)
   */
  async withdrawBid(
    bidId: string,
    contractorId: string
  ): Promise<void> {
    try {
      const bid = await prisma.bid.findUnique({ where: { id: bidId } });

      if (!bid) throw new Error('Bid not found');
      if (bid.contractorId !== contractorId) throw new Error('Unauthorized');
      if (bid.status !== 'SUBMITTED') throw new Error('Cannot withdraw this bid');

      await prisma.bid.update({
        where: { id: bidId },
        data: { status: 'WITHDRAWN' },
      });

      console.log(`✅ Bid withdrawn: ${bidId}`);
    } catch (error: any) {
      console.error('❌ Error withdrawing bid:', error);
      throw new Error(`Failed to withdraw bid: ${error.message}`);
    }
  }

  /**
   * Get bid statistics for contractor
   */
  async getContractorBidStats(contractorId: string): Promise<any> {
    try {
      const stats = await prisma.bid.groupBy({
        by: ['status'],
        where: { contractorId },
        _count: {
          id: true,
        },
        _avg: {
          amount: true,
        },
      });

      const total = await prisma.bid.count({
        where: { contractorId },
      });

      const accepted = await prisma.bid.count({
        where: { contractorId, status: 'ACCEPTED' },
      });

      const winRate = total > 0 ? (accepted / total) * 100 : 0;

      return {
        total,
        accepted,
        rejected: stats.find((s) => s.status === 'REJECTED')?._count.id || 0,
        pending: stats.find((s) => s.status === 'SUBMITTED')?._count.id || 0,
        averageBidAmount: stats.find((s) => s.status === 'SUBMITTED')?._avg.amount || 0,
        winRate: Math.round(winRate),
      };
    } catch (error: any) {
      console.error('❌ Error calculating bid stats:', error);
      throw new Error(`Failed to calculate stats: ${error.message}`);
    }
  }
}

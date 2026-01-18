/**
 * Contract Service - PHASE 2 Core Features
 * Handles contract lifecycle and completion
 */

import { Database } from '../database';

const prisma = new Database();

export class ContractService {
  /**
   * Create contract from accepted bid
   * Called when homeowner accepts a bid
   */
  async createContractFromBid(
    bidId: string,
    jobId: string,
    contractorId: string,
    homeownerId: string,
    amount: number
  ): Promise<any> {
    try {
      // Validate bid exists and matches
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: { job: true },
      });

      if (!bid) throw new Error('Bid not found');
      if (bid.jobId !== jobId) throw new Error('Bid does not match job');
      if (bid.contractorId !== contractorId) throw new Error('Bid contractor mismatch');
      if (bid.job.postedById !== homeownerId) throw new Error('Homeowner mismatch');

      // Calculate fees (12% platform fee from homeowner deposit)
      const depositAmount = amount * 0.25; // 25% deposit
      const platformFee = depositAmount * 0.12; // 12% fee on deposit
      const contractorDepositNet = depositAmount - platformFee;

      // Create contract
      const contract = await prisma.bidContract.create({
        data: {
          jobId,
          bidId,
          homeownerId,
          contractorId,
          amount,
          depositAmount,
          finalAmount: amount * 0.75, // Remaining 75% due at completion
          platformFee,
          contractorNet: amount - (amount * 0.12), // 12% total platform fee
          status: 'ACTIVE',
          acceptedAt: new Date(),
        },
        include: {
          job: true,
          homeowner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          contractor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Update bid status to ACCEPTED
      await prisma.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      });

      // Reject all other bids on this job
      await prisma.bid.updateMany({
        where: {
          jobId,
          id: { not: bidId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // Update job status to CONTRACTED
      await prisma.job.update({
        where: { id: jobId },
        data: { status: 'CONTRACTED' },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: homeownerId,
          action: 'ACCEPT_BID',
          entity: 'BidContract',
          entityId: contract.id,
          reason: `Accepted bid from contractor ${contractorId} for amount $${amount}`,
        },
      });

      console.log(`✅ Contract created from bid: ${contract.id}`);
      return contract;
    } catch (error: any) {
      console.error('❌ Error creating contract from bid:', error);
      throw new Error(`Failed to create contract: ${error.message}`);
    }
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId: string): Promise<any> {
    try {
      const contract = await prisma.bidContract.findUnique({
        where: { id: contractId },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              images: true,
            },
          },
          homeowner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
          contractor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
              specializations: true,
            },
          },
          escrow: true,
          completion: true,
          dispute: true,
        },
      });

      if (!contract) throw new Error('Contract not found');
      return contract;
    } catch (error: any) {
      console.error('❌ Error fetching contract:', error);
      throw new Error(`Failed to fetch contract: ${error.message}`);
    }
  }

  /**
   * Get contracts by homeowner
   */
  async getHomeownerContracts(homeownerId: string, status?: string): Promise<any[]> {
    try {
      const where: any = { homeownerId };
      if (status) where.status = status;

      const contracts = await prisma.bidContract.findMany({
        where,
        include: {
          job: true,
          contractor: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
              averageRating: true,
            },
          },
          completion: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return contracts;
    } catch (error: any) {
      console.error('❌ Error fetching contracts:', error);
      throw new Error(`Failed to fetch contracts: ${error.message}`);
    }
  }

  /**
   * Get contracts by contractor
   */
  async getContractorContracts(contractorId: string, status?: string): Promise<any[]> {
    try {
      const where: any = { contractorId };
      if (status) where.status = status;

      const contracts = await prisma.bidContract.findMany({
        where,
        include: {
          job: true,
          homeowner: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
              averageRating: true,
            },
          },
          completion: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return contracts;
    } catch (error: any) {
      console.error('❌ Error fetching contracts:', error);
      throw new Error(`Failed to fetch contracts: ${error.message}`);
    }
  }

  /**
   * Submit completion (contractor marks job as complete with evidence)
   */
  async submitCompletion(
    contractId: string,
    contractorId: string,
    input: {
      photos: string[];
      videos?: string[];
      notes?: string;
      geolocation?: { latitude: number; longitude: number };
    }
  ): Promise<any> {
    try {
      // Verify contract
      const contract = await prisma.bidContract.findUnique({
        where: { id: contractId },
      });

      if (!contract) throw new Error('Contract not found');
      if (contract.contractorId !== contractorId) throw new Error('Unauthorized');
      if (contract.status !== 'ACTIVE') throw new Error('Contract is not active');

      // Create completion record
      const completion = await prisma.jobCompletion.create({
        data: {
          contractId,
          photos: input.photos,
          videos: input.videos || [],
          notes: input.notes,
          geolocation: input.geolocation,
          status: 'SUBMITTED',
          disputeWindow: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Update contract status
      await prisma.bidContract.update({
        where: { id: contractId },
        data: { status: 'PENDING_APPROVAL' },
      });

      console.log(`✅ Completion submitted: ${completion.id}`);
      return completion;
    } catch (error: any) {
      console.error('❌ Error submitting completion:', error);
      throw new Error(`Failed to submit completion: ${error.message}`);
    }
  }

  /**
   * Approve completion (homeowner approves completed work)
   */
  async approveCompletion(
    completionId: string,
    homeownerId: string,
    input: {
      approved: boolean;
      rating?: number;
      feedback?: string;
    }
  ): Promise<any> {
    try {
      // Get completion
      const completion = await prisma.jobCompletion.findUnique({
        where: { id: completionId },
        include: { contract: true },
      });

      if (!completion) throw new Error('Completion not found');
      if (completion.contract.homeownerId !== homeownerId) throw new Error('Unauthorized');

      if (input.approved) {
        // Update completion
        await prisma.jobCompletion.update({
          where: { id: completionId },
          data: {
            status: 'APPROVED',
            rating: input.rating,
            feedback: input.feedback,
          },
        });

        // Update contract
        await prisma.bidContract.update({
          where: { id: completion.contractId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Update job status
        await prisma.job.update({
          where: { id: completion.contract.jobId },
          data: { status: 'COMPLETED' },
        });

        console.log(`✅ Completion approved: ${completionId}`);
      } else {
        // Reject completion
        await prisma.jobCompletion.update({
          where: { id: completionId },
          data: {
            status: 'REJECTED',
            feedback: input.feedback,
          },
        });

        // Revert contract to ACTIVE
        await prisma.bidContract.update({
          where: { id: completion.contractId },
          data: { status: 'ACTIVE' },
        });

        console.log(`✅ Completion rejected: ${completionId}`);
      }

      return completion;
    } catch (error: any) {
      console.error('❌ Error approving completion:', error);
      throw new Error(`Failed to approve completion: ${error.message}`);
    }
  }

  /**
   * Create change order for contract
   */
  async createChangeOrder(
    contractId: string,
    contractorId: string,
    input: {
      title: string;
      description: string;
      amount: number;
    }
  ): Promise<any> {
    try {
      const contract = await prisma.bidContract.findUnique({
        where: { id: contractId },
      });

      if (!contract) throw new Error('Contract not found');
      if (contract.contractorId !== contractorId) throw new Error('Unauthorized');

      const changeOrder = await prisma.changeOrder.create({
        data: {
          contractId,
          title: input.title,
          description: input.description,
          amount: input.amount,
          status: 'PENDING',
        },
      });

      console.log(`✅ Change order created: ${changeOrder.id}`);
      return changeOrder;
    } catch (error: any) {
      console.error('❌ Error creating change order:', error);
      throw new Error(`Failed to create change order: ${error.message}`);
    }
  }

  /**
   * Approve change order (homeowner)
   */
  async approveChangeOrder(
    changeOrderId: string,
    homeownerId: string,
    approved: boolean
  ): Promise<void> {
    try {
      const changeOrder = await prisma.changeOrder.findUnique({
        where: { id: changeOrderId },
        include: { contract: true },
      });

      if (!changeOrder) throw new Error('Change order not found');
      if (changeOrder.contract.homeownerId !== homeownerId) throw new Error('Unauthorized');

      const status = approved ? 'APPROVED' : 'REJECTED';

      await prisma.changeOrder.update({
        where: { id: changeOrderId },
        data: { status },
      });

      if (approved) {
        // Update contract amount
        await prisma.bidContract.update({
          where: { id: changeOrder.contractId },
          data: {
            amount: changeOrder.contract.amount + changeOrder.amount,
            finalAmount:
              (changeOrder.contract.amount + changeOrder.amount) * 0.75,
          },
        });
      }

      console.log(`✅ Change order ${status.toLowerCase()}: ${changeOrderId}`);
    } catch (error: any) {
      console.error('❌ Error approving change order:', error);
      throw new Error(`Failed to approve change order: ${error.message}`);
    }
  }

  /**
   * Cancel contract
   */
  async cancelContract(
    contractId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    try {
      const contract = await prisma.bidContract.findUnique({
        where: { id: contractId },
      });

      if (!contract) throw new Error('Contract not found');
      if (
        contract.homeownerId !== userId &&
        contract.contractorId !== userId
      ) {
        throw new Error('Unauthorized');
      }

      await prisma.bidContract.update({
        where: { id: contractId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'CANCEL',
          entity: 'BidContract',
          entityId: contractId,
          reason,
        },
      });

      console.log(`✅ Contract cancelled: ${contractId}`);
    } catch (error: any) {
      console.error('❌ Error cancelling contract:', error);
      throw new Error(`Failed to cancel contract: ${error.message}`);
    }
  }

  /**
   * Get contract analytics
   */
  async getContractAnalytics(contractId: string): Promise<any> {
    try {
      const contract = await prisma.bidContract.findUnique({
        where: { id: contractId },
        include: {
          _count: {
            select: {
              changeOrders: true,
            },
          },
        },
      });

      if (!contract) throw new Error('Contract not found');

      const daysActive = contract.acceptedAt
        ? Math.floor(
            (new Date().getTime() - contract.acceptedAt.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      return {
        contractId,
        status: contract.status,
        amount: contract.amount,
        platformFee: contract.platformFee,
        contractorNet: contract.contractorNet,
        daysActive,
        changeOrdersCount: contract._count.changeOrders,
        depositPaid: contract.depositPaid,
        finalPaid: contract.finalPaid,
      };
    } catch (error: any) {
      console.error('❌ Error fetching contract analytics:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }
}

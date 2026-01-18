/**
 * Integration Service - Orchestrates service interactions
 * Handles event triggers and cross-service communication
 */

import { JobService } from './jobService';
import { BidService } from './bidService';
import { ContractService } from './contractService';
import { PaymentService } from './paymentService';
import { NotificationServiceImpl } from './notificationServiceImpl';
import { AnalyticsAndCustomizationService } from './analyticsAndCustomizationService';
import { Database } from '../database';

const prisma = new Database();

export class IntegrationService {
  private jobService: JobService;
  private bidService: BidService;
  private contractService: ContractService;
  private paymentService: PaymentService;
  private notificationService: NotificationServiceImpl;
  private analyticsService: AnalyticsAndCustomizationService;

  constructor() {
    this.jobService = new JobService();
    this.bidService = new BidService();
    this.contractService = new ContractService();
    this.paymentService = new PaymentService();
    this.notificationService = new NotificationServiceImpl();
    this.analyticsService = new AnalyticsAndCustomizationService();
  }

  /**
   * ========================================================================
   * JOB LIFECYCLE EVENTS
   * ========================================================================
   */

  /**
   * Handle job creation - trigger notifications
   */
  async onJobCreated(jobId: string): Promise<void> {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { postedBy: true },
      });

      if (!job) return;

      // Send push notification to user
      await this.notificationService.sendPush({
        userId: job.postedById,
        title: 'Job Posted Successfully!',
        body: `Your job "${job.title}" is now live and contractors can see it.`,
        actionUrl: `https://fairtradeworker.com/jobs/${jobId}`,
      });

      console.log(`✅ Job creation event processed for job ${jobId}`);
    } catch (error: any) {
      console.error('Error processing job creation event:', error);
    }
  }

  /**
   * ========================================================================
   * BID LIFECYCLE EVENTS
   * ========================================================================
   */

  /**
   * Handle bid submission - notify homeowner
   */
  async onBidSubmitted(bidId: string): Promise<void> {
    try {
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: {
          job: { include: { postedBy: true } },
          contractor: true,
        },
      });

      if (!bid || !bid.job) return;

      const homeowner = bid.job.postedBy;
      const contractor = bid.contractor;

      // Notify homeowner of new bid
      await this.notificationService.notifyBidSubmitted({
        jobId: bid.jobId,
        homeownerId: homeowner.id,
        homeownerEmail: homeowner.email,
        contractorName: `${contractor.firstName} ${contractor.lastName}`,
        bidAmount: bid.amount,
      });

      console.log(`✅ Bid submission event processed for bid ${bidId}`);
    } catch (error: any) {
      console.error('Error processing bid submission event:', error);
    }
  }

  /**
   * Handle bid acceptance - create contract and process payment
   */
  async onBidAccepted(bidId: string): Promise<void> {
    try {
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: {
          job: true,
          contractor: true,
        },
      });

      if (!bid) return;

      // The contract should already be created in bidService.acceptBid()
      // Find the associated contract
      const contract = await prisma.bidContract.findFirst({
        where: { bidId: bidId },
        include: {
          homeowner: true,
          contractor: true,
        },
      });

      if (!contract) {
        throw new Error('Contract not found after bid acceptance');
      }

      // Charge deposit (25%)
      const depositResult = await this.paymentService.holdDeposit({
        contractId: contract.id,
        homeownerId: contract.homeownerId,
        contractAmount: contract.amount,
        depositPercent: 25,
      });

      console.log(`💳 Deposit charged: $${depositResult.depositAmount}`);

      // Update escrow status
      await prisma.escrowAccount.update({
        where: { id: depositResult.escrowId },
        data: { status: 'ACTIVE' },
      });

      // Send notifications
      await this.notificationService.notifyBidAccepted({
        contractId: contract.id,
        contractorId: contract.contractorId,
        contractorEmail: contract.contractor.email,
        contractorName: `${contract.contractor.firstName} ${contract.contractor.lastName}`,
        contractAmount: contract.amount,
      });

      // Also notify homeowner
      await this.notificationService.sendPush({
        userId: contract.homeownerId,
        title: 'Bid Accepted',
        body: `You accepted the bid from ${contract.contractor.firstName}. Contract is now active.`,
        actionUrl: `https://fairtradeworker.com/contracts/${contract.id}`,
      });

      // Auto-reject other bids for this job
      await this.bidService.rejectOtherBids(bid.jobId, bidId);

      console.log(`✅ Bid acceptance event processed for bid ${bidId}`);
    } catch (error: any) {
      console.error('Error processing bid acceptance event:', error);
      throw error;
    }
  }

  /**
   * Handle bid rejection - notify contractor
   */
  async onBidRejected(bidId: string): Promise<void> {
    try {
      const bid = await prisma.bid.findUnique({
        where: { id: bidId },
        include: {
          job: true,
          contractor: true,
        },
      });

      if (!bid) return;

      await this.notificationService.notifyBidRejected({
        contractorId: bid.contractorId,
        contractorEmail: bid.contractor.email,
        jobTitle: bid.job.title,
      });

      console.log(`✅ Bid rejection event processed for bid ${bidId}`);
    } catch (error: any) {
      console.error('Error processing bid rejection event:', error);
    }
  }

  /**
   * ========================================================================
   * CONTRACT LIFECYCLE EVENTS
   * ========================================================================
   */

  /**
   * Handle completion submission - notify homeowner
   */
  async onCompletionSubmitted(completionId: string): Promise<void> {
    try {
      const completion = await prisma.jobCompletion.findUnique({
        where: { id: completionId },
        include: {
          contract: {
            include: {
              homeowner: true,
              contractor: true,
            },
          },
        },
      });

      if (!completion || !completion.contract) return;

      const contract = completion.contract;

      await this.notificationService.notifyCompletionSubmitted({
        contractId: contract.id,
        homeownerId: contract.homeownerId,
        homeownerEmail: contract.homeowner.email,
        contractorName: `${contract.contractor.firstName} ${contract.contractor.lastName}`,
      });

      console.log(`✅ Completion submission event processed for completion ${completionId}`);
    } catch (error: any) {
      console.error('Error processing completion submission event:', error);
    }
  }

  /**
   * Handle completion approval - release final payment
   */
  async onCompletionApproved(completionId: string, rating?: number): Promise<void> {
    try {
      const completion = await prisma.jobCompletion.findUnique({
        where: { id: completionId },
        include: {
          contract: {
            include: {
              homeowner: true,
              contractor: true,
              escrow: true,
            },
          },
        },
      });

      if (!completion || !completion.contract) return;

      const contract = completion.contract;

      // Release final payment (75%)
      const finalPaymentResult = await this.paymentService.releaseFinalPayment({
        contractId: contract.id,
        homeownerId: contract.homeownerId,
        contractorId: contract.contractorId,
        contractAmount: contract.amount,
        platformFeePercent: 15,
      });

      console.log(`💳 Final payment released: $${finalPaymentResult.finalPaymentAmount}`);
      console.log(`💰 Contractor net: $${finalPaymentResult.contractorNet}`);

      // Update contract status
      await prisma.bidContract.update({
        where: { id: contract.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Create review if rating provided
      if (rating) {
        await prisma.review.create({
          data: {
            fromUserId: contract.homeownerId,
            toUserId: contract.contractorId,
            contractId: contract.id,
            rating: rating,
            comment: '', // Optional comment from homeowner
          },
        });

        // Update contractor average rating
        const contractorReviews = await prisma.review.findMany({
          where: { toUserId: contract.contractorId },
          select: { rating: true },
        });

        const avgRating =
          contractorReviews.length > 0
            ? contractorReviews.reduce((sum, r) => sum + r.rating, 0) / contractorReviews.length
            : 0;

        await prisma.user.update({
          where: { id: contract.contractorId },
          data: { averageRating: avgRating },
        });
      }

      // Send notifications
      await this.notificationService.notifyCompletionApproved({
        contractId: contract.id,
        contractorId: contract.contractorId,
        contractorEmail: contract.contractor.email,
        contractAmount: contract.amount,
      });

      // Notify homeowner
      await this.notificationService.sendPush({
        userId: contract.homeownerId,
        title: 'Work Completed',
        body: `Contractor has been paid. Thank you for using FairTradeWorker!`,
        actionUrl: `https://fairtradeworker.com/contracts/${contract.id}`,
      });

      console.log(`✅ Completion approval event processed for completion ${completionId}`);
    } catch (error: any) {
      console.error('Error processing completion approval event:', error);
      throw error;
    }
  }

  /**
   * Handle completion rejection - request resubmission
   */
  async onCompletionRejected(completionId: string, feedback?: string): Promise<void> {
    try {
      const completion = await prisma.jobCompletion.findUnique({
        where: { id: completionId },
        include: {
          contract: {
            include: {
              contractor: true,
            },
          },
        },
      });

      if (!completion || !completion.contract) return;

      await this.notificationService.notifyCompletionRejected({
        contractId: completion.contract.id,
        contractorId: completion.contract.contractorId,
        contractorEmail: completion.contract.contractor.email,
        feedback: feedback,
      });

      console.log(`✅ Completion rejection event processed for completion ${completionId}`);
    } catch (error: any) {
      console.error('Error processing completion rejection event:', error);
    }
  }

  /**
   * Handle change order creation - notify homeowner
   */
  async onChangeOrderCreated(changeOrderId: string): Promise<void> {
    try {
      const changeOrder = await prisma.changeOrder.findUnique({
        where: { id: changeOrderId },
        include: {
          contract: {
            include: {
              homeowner: true,
              contractor: true,
            },
          },
        },
      });

      if (!changeOrder || !changeOrder.contract) return;

      const contract = changeOrder.contract;

      await this.notificationService.notifyChangeOrderCreated({
        contractId: contract.id,
        homeownerId: contract.homeownerId,
        homeownerEmail: contract.homeowner.email,
        contractorName: `${contract.contractor.firstName} ${contract.contractor.lastName}`,
        amount: changeOrder.amount,
      });

      console.log(`✅ Change order creation event processed for CO ${changeOrderId}`);
    } catch (error: any) {
      console.error('Error processing change order creation event:', error);
    }
  }

  /**
   * Handle change order approval - charge additional amount
   */
  async onChangeOrderApproved(changeOrderId: string): Promise<void> {
    try {
      const changeOrder = await prisma.changeOrder.findUnique({
        where: { id: changeOrderId },
        include: {
          contract: {
            include: {
              homeowner: true,
              contractor: true,
            },
          },
        },
      });

      if (!changeOrder || !changeOrder.contract) return;

      const contract = changeOrder.contract;

      // Charge additional amount
      try {
        const chargeResult = await this.paymentService.chargeAdditional({
          contractId: contract.id,
          homeownerId: contract.homeownerId,
          additionalAmount: changeOrder.amount,
        });

        console.log(`💳 Change order charged: $${changeOrder.amount}`);
      } catch (paymentError: any) {
        console.error('Change order payment failed:', paymentError);
        // Mark change order as payment failed
        await prisma.changeOrder.update({
          where: { id: changeOrderId },
          data: { status: 'PAYMENT_FAILED' },
        });
        throw paymentError;
      }

      // Update contract amount
      await prisma.bidContract.update({
        where: { id: contract.id },
        data: {
          amount: contract.amount + changeOrder.amount,
        },
      });

      // Notify contractor
      await this.notificationService.notifyChangeOrderApproved({
        contractorId: contract.contractorId,
        contractorEmail: contract.contractor.email,
        amount: changeOrder.amount,
      });

      console.log(`✅ Change order approval event processed for CO ${changeOrderId}`);
    } catch (error: any) {
      console.error('Error processing change order approval event:', error);
      throw error;
    }
  }

  /**
   * Handle contract cancellation - process refund
   */
  async onContractCancelled(contractId: string, reason: string): Promise<void> {
    try {
      const contract = await prisma.bidContract.findUnique({
        where: { id: contractId },
        include: {
          homeowner: true,
          contractor: true,
          escrow: true,
        },
      });

      if (!contract) return;

      // Calculate refund
      let refundAmount = 0;
      if (contract.status === 'ACCEPTED' && contract.escrow) {
        // Full deposit refund if accepted but not started
        refundAmount = contract.escrow.depositAmount;
      } else if (contract.status === 'ACTIVE' && contract.escrow) {
        // Partial refund based on completion status
        refundAmount = contract.escrow.depositAmount * 0.5; // 50% refund if in progress
      }

      if (refundAmount > 0) {
        await this.paymentService.refundPayment({
          contractId: contractId,
          amount: refundAmount,
          reason: reason,
        });

        console.log(`✅ Refund processed: $${refundAmount}`);
      }

      // Send notifications
      await this.notificationService.notifyContractCancelled({
        contractId: contractId,
        userId: contract.homeownerId,
        email: contract.homeowner.email,
        reason: reason,
      });

      await this.notificationService.notifyContractCancelled({
        contractId: contractId,
        userId: contract.contractorId,
        email: contract.contractor.email,
        reason: reason,
      });

      console.log(`✅ Contract cancellation event processed for contract ${contractId}`);
    } catch (error: any) {
      console.error('Error processing contract cancellation event:', error);
    }
  }

  /**
   * ========================================================================
   * ANALYTICS & REPORTING
   * ========================================================================
   */

  /**
   * Generate weekly summary email for contractor
   */
  async sendWeeklySummaryToContractor(contractorId: string): Promise<void> {
    try {
      const contractor = await prisma.user.findUnique({
        where: { id: contractorId },
      });

      if (!contractor || contractor.role !== 'CONTRACTOR') return;

      // Get this week's analytics
      const analytics = await this.analyticsService.getRevenueAnalytics(contractorId, 7);
      const bidAnalytics = await this.analyticsService.getBidAnalytics(contractorId);

      const completedJobs = analytics.completedContracts;
      const earnings = analytics.netEarnings;

      await this.notificationService.sendWeeklySummary({
        userId: contractorId,
        email: contractor.email,
        name: contractor.firstName,
        jobCount: completedJobs,
        earnings: earnings,
      });

      console.log(`✅ Weekly summary sent to contractor ${contractorId}`);
    } catch (error: any) {
      console.error('Error sending weekly summary:', error);
    }
  }

  /**
   * Generate daily digest for homeowner
   */
  async sendDailyDigestToHomeowner(homeownerId: string): Promise<void> {
    try {
      const homeowner = await prisma.user.findUnique({
        where: { id: homeownerId },
      });

      if (!homeowner || homeowner.role !== 'HOMEOWNER') return;

      // Get today's activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newBids = await prisma.bid.count({
        where: {
          job: { postedById: homeownerId },
          createdAt: { gte: today },
        },
      });

      const dashboard = await this.analyticsService.getHomeownerDashboard(homeownerId);

      if (newBids > 0 || dashboard.activeContracts > 0) {
        await this.notificationService.sendPush({
          userId: homeownerId,
          title: 'Daily Activity Summary',
          body: `You have ${newBids} new bids and ${dashboard.activeContracts} active contracts.`,
          actionUrl: 'https://fairtradeworker.com/dashboard',
        });
      }

      console.log(`✅ Daily digest sent to homeowner ${homeownerId}`);
    } catch (error: any) {
      console.error('Error sending daily digest:', error);
    }
  }

  /**
   * Get all services for direct use if needed
   */
  getServices() {
    return {
      job: this.jobService,
      bid: this.bidService,
      contract: this.contractService,
      payment: this.paymentService,
      notification: this.notificationService,
      analytics: this.analyticsService,
    };
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();

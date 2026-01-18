/**
 * Enhanced Payment Service - Advanced Escrow & Payment Management
 * Sophisticated payment handling with milestone-based releases and detailed tracking
 */

import prisma from '../../src/services/database';

export interface EscrowAccount {
  id: string;
  contractId: string;
  homeownerId: string;
  contractorId: string;
  totalAmount: number;
  heldAmount: number;
  releasedAmount: number;
  status: 'ACTIVE' | 'PARTIAL_RELEASE' | 'RELEASED' | 'DISPUTE' | 'REFUNDED';
  createdAt: Date;
  releasedAt?: Date;
  releaseSchedule: ReleaseSchedule[];
}

export interface ReleaseSchedule {
  id: string;
  escrowAccountId: string;
  milestoneId?: string;
  amount: number;
  dueDate: Date;
  releaseDate?: Date;
  status: 'PENDING' | 'RELEASED' | 'HELD' | 'DISPUTED';
  reason: string;
  approvedBy?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  escrowAccountId: string;
  contractId: string;
  type: 'DEPOSIT' | 'HOLD' | 'RELEASE' | 'REFUND' | 'ADJUSTMENT';
  amount: number;
  stripeTransactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  timestamp: Date;
  description: string;
  metadata?: Record<string, any>;
}

export interface DisputeRecord {
  id: string;
  escrowAccountId: string;
  initiatedBy: string; // homeowner or contractor
  reason: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'MEDIATED' | 'RESOLVED';
  heldAmount: number;
  createdAt: Date;
  resolutionDate?: Date;
  resolution?: string;
  mediatorNotes?: string;
}

export interface PaymentAllocation {
  contractId: string;
  homeownerId: string;
  contractorId: string;
  jobAmount: number;
  platformFee: number;
  platformFeePercentage: number;
  contractorNet: number;
  allocation: {
    milestones: Array<{
      milestoneId: string;
      amount: number;
      percentage: number;
    }>;
  };
}

export class PaymentServiceEnhanced {
  /**
   * Create escrow account with milestone-based release schedule
   */
  async createEscrowAccount(
    contractId: string,
    homeownerId: string,
    contractorId: string,
    totalAmount: number,
    milestones?: any[]
  ): Promise<EscrowAccount> {
    try {
      const escrow = await prisma.escrowAccount.create({
        data: {
          contractId,
          homeownerId,
          contractorId,
          totalAmount,
          heldAmount: totalAmount,
          releasedAmount: 0,
          status: 'ACTIVE',
        },
      });

      // Create release schedule based on milestones
      if (milestones && milestones.length > 0) {
        const amountPerMilestone = totalAmount / milestones.length;

        for (const milestone of milestones) {
          await prisma.releaseSchedule.create({
            data: {
              escrowAccountId: escrow.id,
              milestoneId: milestone.id,
              amount: Math.round(amountPerMilestone),
              dueDate: milestone.dueDate,
              status: 'PENDING',
              reason: `Payment for: ${milestone.title}`,
            },
          });
        }
      } else {
        // Create default schedule (25% deposit, 75% on completion)
        const deposit = totalAmount * 0.25;
        const final = totalAmount * 0.75;

        await prisma.releaseSchedule.create({
          data: {
            escrowAccountId: escrow.id,
            amount: Math.round(deposit),
            dueDate: new Date(),
            status: 'PENDING',
            reason: 'Initial deposit (25%)',
          },
        });

        await prisma.releaseSchedule.create({
          data: {
            escrowAccountId: escrow.id,
            amount: Math.round(final),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
            reason: 'Final payment (75%) on completion',
          },
        });
      }

      console.log(`✅ Escrow account created: ${escrow.id}`);
      return escrow as EscrowAccount;
    } catch (error: any) {
      throw new Error(`Failed to create escrow account: ${error.message}`);
    }
  }

  /**
   * Process initial deposit (25% of contract)
   */
  async processDeposit(escrowAccountId: string, homeownerId: string): Promise<PaymentRecord> {
    try {
      const escrow = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccountId },
      });

      if (!escrow) {
        throw new Error('Escrow account not found');
      }

      const depositAmount = escrow.totalAmount * 0.25;

      // In production, this would call Stripe API
      const paymentRecord = await prisma.paymentRecord.create({
        data: {
          escrowAccountId,
          contractId: escrow.contractId,
          type: 'DEPOSIT',
          amount: Math.round(depositAmount),
          stripeTransactionId: `stripe_${Date.now()}`,
          status: 'COMPLETED',
          description: `Initial deposit for contract ${escrow.contractId}`,
          timestamp: new Date(),
        },
      });

      // Update escrow
      await prisma.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          heldAmount: escrow.heldAmount - Math.round(depositAmount),
        },
      });

      // Update first release schedule
      const schedules = await prisma.releaseSchedule.findMany({
        where: { escrowAccountId },
        orderBy: { dueDate: 'asc' },
      });

      if (schedules.length > 0) {
        await prisma.releaseSchedule.update({
          where: { id: schedules[0].id },
          data: { status: 'RELEASED', releaseDate: new Date() },
        });
      }

      console.log(`✅ Deposit processed: ${paymentRecord.id}`);
      return paymentRecord as PaymentRecord;
    } catch (error: any) {
      throw new Error(`Failed to process deposit: ${error.message}`);
    }
  }

  /**
   * Release payment for milestone completion
   */
  async releaseMilestonePayment(
    releaseScheduleId: string,
    approverNote?: string
  ): Promise<PaymentRecord> {
    try {
      const schedule = await prisma.releaseSchedule.findUnique({
        where: { id: releaseScheduleId },
        include: { escrowAccount: true },
      });

      if (!schedule) {
        throw new Error('Release schedule not found');
      }

      if (schedule.status !== 'PENDING') {
        throw new Error(`Cannot release payment with status: ${schedule.status}`);
      }

      const paymentRecord = await prisma.paymentRecord.create({
        data: {
          escrowAccountId: schedule.escrowAccountId,
          contractId: schedule.escrowAccount.contractId,
          type: 'RELEASE',
          amount: schedule.amount,
          stripeTransactionId: `stripe_${Date.now()}`,
          status: 'COMPLETED',
          description: schedule.reason,
          metadata: { milestone: schedule.milestoneId, approverNote },
          timestamp: new Date(),
        },
      });

      // Update schedule
      await prisma.releaseSchedule.update({
        where: { id: releaseScheduleId },
        data: {
          status: 'RELEASED',
          releaseDate: new Date(),
          approvedBy: 'platform',
          notes: approverNote,
        },
      });

      // Update escrow
      await prisma.escrowAccount.update({
        where: { id: schedule.escrowAccountId },
        data: {
          heldAmount: schedule.escrowAccount.heldAmount - schedule.amount,
          releasedAmount: schedule.escrowAccount.releasedAmount + schedule.amount,
        },
      });

      // Check if all released
      const remaining = await prisma.releaseSchedule.count({
        where: {
          escrowAccountId: schedule.escrowAccountId,
          status: 'PENDING',
        },
      });

      if (remaining === 0) {
        await prisma.escrowAccount.update({
          where: { id: schedule.escrowAccountId },
          data: { status: 'RELEASED', releasedAt: new Date() },
        });
      }

      console.log(`✅ Payment released: ${paymentRecord.id}`);
      return paymentRecord as PaymentRecord;
    } catch (error: any) {
      throw new Error(`Failed to release payment: ${error.message}`);
    }
  }

  /**
   * Hold payment due to dispute
   */
  async holdPayment(escrowAccountId: string, reason: string): Promise<EscrowAccount> {
    try {
      const escrow = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccountId },
      });

      if (!escrow) {
        throw new Error('Escrow account not found');
      }

      // Create dispute record
      await prisma.disputeRecord.create({
        data: {
          escrowAccountId,
          initiatedBy: 'system',
          reason,
          status: 'OPEN',
          heldAmount: escrow.heldAmount,
          createdAt: new Date(),
        },
      });

      // Update escrow status
      const updated = await prisma.escrowAccount.update({
        where: { id: escrowAccountId },
        data: { status: 'DISPUTE' },
      });

      console.log(`⚠️ Payment held for dispute: ${escrowAccountId}`);
      return updated as EscrowAccount;
    } catch (error: any) {
      throw new Error(`Failed to hold payment: ${error.message}`);
    }
  }

  /**
   * Release held payment (dispute resolved in contractor's favor)
   */
  async releaseHeldPayment(
    escrowAccountId: string,
    resolution: string
  ): Promise<PaymentRecord> {
    try {
      const escrow = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccountId },
      });

      if (!escrow) {
        throw new Error('Escrow account not found');
      }

      const paymentRecord = await prisma.paymentRecord.create({
        data: {
          escrowAccountId,
          contractId: escrow.contractId,
          type: 'RELEASE',
          amount: escrow.heldAmount,
          stripeTransactionId: `stripe_${Date.now()}`,
          status: 'COMPLETED',
          description: 'Held payment released - dispute resolved',
          metadata: { resolution },
          timestamp: new Date(),
        },
      });

      // Update escrow
      await prisma.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          status: 'RELEASED',
          releasedAmount: escrow.releasedAmount + escrow.heldAmount,
          heldAmount: 0,
          releasedAt: new Date(),
        },
      });

      // Resolve dispute
      const dispute = await prisma.disputeRecord.findFirst({
        where: { escrowAccountId, status: 'OPEN' },
      });

      if (dispute) {
        await prisma.disputeRecord.update({
          where: { id: dispute.id },
          data: {
            status: 'RESOLVED',
            resolution,
            resolutionDate: new Date(),
          },
        });
      }

      console.log(`✅ Held payment released: ${paymentRecord.id}`);
      return paymentRecord as PaymentRecord;
    } catch (error: any) {
      throw new Error(`Failed to release held payment: ${error.message}`);
    }
  }

  /**
   * Refund payment (contractor cancels, homeowner requests refund, etc.)
   */
  async refundPayment(
    escrowAccountId: string,
    amount: number,
    reason: string
  ): Promise<PaymentRecord> {
    try {
      const escrow = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccountId },
      });

      if (!escrow) {
        throw new Error('Escrow account not found');
      }

      if (amount > escrow.releasedAmount) {
        throw new Error('Refund amount exceeds released amount');
      }

      const paymentRecord = await prisma.paymentRecord.create({
        data: {
          escrowAccountId,
          contractId: escrow.contractId,
          type: 'REFUND',
          amount: -amount,
          stripeTransactionId: `stripe_${Date.now()}`,
          status: 'COMPLETED',
          description: `Refund: ${reason}`,
          timestamp: new Date(),
        },
      });

      // Update escrow
      await prisma.escrowAccount.update({
        where: { id: escrowAccountId },
        data: {
          releasedAmount: escrow.releasedAmount - amount,
          status: 'REFUNDED',
        },
      });

      console.log(`✅ Refund processed: ${paymentRecord.id}`);
      return paymentRecord as PaymentRecord;
    } catch (error: any) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Get escrow account details
   */
  async getEscrowAccount(escrowAccountId: string): Promise<EscrowAccount> {
    try {
      const escrow = await prisma.escrowAccount.findUnique({
        where: { id: escrowAccountId },
        include: {
          releaseSchedule: {
            orderBy: { dueDate: 'asc' },
          },
        },
      });

      if (!escrow) {
        throw new Error('Escrow account not found');
      }

      return escrow as EscrowAccount;
    } catch (error: any) {
      throw new Error(`Failed to get escrow account: ${error.message}`);
    }
  }

  /**
   * Get payment history for contract
   */
  async getPaymentHistory(contractId: string): Promise<PaymentRecord[]> {
    try {
      const records = await prisma.paymentRecord.findMany({
        where: { contractId },
        orderBy: { timestamp: 'desc' },
      });

      return records as PaymentRecord[];
    } catch (error: any) {
      throw new Error(`Failed to get payment history: ${error.message}`);
    }
  }

  /**
   * Get payment allocation breakdown
   */
  async getPaymentAllocation(contractId: string): Promise<PaymentAllocation> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      const platformFeePercentage = 12.5; // 12.5% fee to platform
      const platformFee = Math.round(contract.amount * (platformFeePercentage / 100));
      const contractorNet = contract.amount - platformFee;

      const milestones = await prisma.milestone.findMany({
        where: { contractId },
      });

      const allocation = {
        milestones: milestones.map((m) => ({
          milestoneId: m.id,
          amount: m.targetAmount,
          percentage: (m.targetAmount / contract.amount) * 100,
        })),
      };

      return {
        contractId,
        homeownerId: contract.homeownerId,
        contractorId: contract.contractorId,
        jobAmount: contract.amount,
        platformFee,
        platformFeePercentage,
        contractorNet,
        allocation,
      };
    } catch (error: any) {
      throw new Error(`Failed to get payment allocation: ${error.message}`);
    }
  }

  /**
   * Get dispute records for escrow account
   */
  async getDisputeRecords(escrowAccountId: string): Promise<DisputeRecord[]> {
    try {
      const disputes = await prisma.disputeRecord.findMany({
        where: { escrowAccountId },
        orderBy: { createdAt: 'desc' },
      });

      return disputes as DisputeRecord[];
    } catch (error: any) {
      throw new Error(`Failed to get dispute records: ${error.message}`);
    }
  }

  /**
   * Get payment summary for platform analytics
   */
  async getPaymentSummary(startDate: Date, endDate: Date): Promise<{
    totalProcessed: number;
    totalReleased: number;
    totalRefunded: number;
    totalDisputes: number;
    averageEscrowValue: number;
    transactionCount: number;
  }> {
    try {
      const records = await prisma.paymentRecord.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalProcessed = records
        .filter((r) => r.status === 'COMPLETED')
        .reduce((sum, r) => sum + r.amount, 0);

      const totalReleased = records
        .filter((r) => r.type === 'RELEASE' && r.status === 'COMPLETED')
        .reduce((sum, r) => sum + r.amount, 0);

      const totalRefunded = records
        .filter((r) => r.type === 'REFUND')
        .reduce((sum, r) => sum + Math.abs(r.amount), 0);

      const escrows = await prisma.escrowAccount.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const averageEscrowValue =
        escrows.length > 0
          ? escrows.reduce((sum, e) => sum + e.totalAmount, 0) / escrows.length
          : 0;

      const disputes = await prisma.disputeRecord.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return {
        totalProcessed,
        totalReleased,
        totalRefunded,
        totalDisputes: disputes,
        averageEscrowValue: Math.round(averageEscrowValue),
        transactionCount: records.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to get payment summary: ${error.message}`);
    }
  }
}

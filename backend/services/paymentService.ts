/**
 * Payment Service - Stripe Integration
 * Handles escrow, deposits, final payments, and refunds
 * Part of PHASE 2 Core Features
 */

import Stripe from 'stripe';
import { Database } from '../database';
import { REVENUE_MODEL } from '../config/revenue';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2025-12-15.clover', // Use standard supported version
});
const prisma = new Database();

export class PaymentService {
  /**
   * Hold deposit in escrow (25% of contract amount + 12% Platform Fee)
   * Called when bid is accepted and contract created
   */
  async holdDeposit(params: {
    contractId: string;
    homeownerId: string;
    contractAmount: number;
    depositPercent: number; // Ignored in favor of REVENUE_MODEL
  }): Promise<{ chargeId: string; escrowId: string; depositAmount: number }> {
    try {
      const depositAmount = params.contractAmount * REVENUE_MODEL.DEPOSIT_PERCENT;
      const platformFee = params.contractAmount * REVENUE_MODEL.PLATFORM_FEE_PERCENT;
      const totalCharge = depositAmount + platformFee;

      // Create Stripe charge with idempotency key
      const charge = await stripe.charges.create({
        amount: Math.round(totalCharge * 100), // Convert to cents
        currency: 'usd',
        customer: params.homeownerId,
        description: `Deposit + Platform Fee for contract ${params.contractId}`,
        metadata: {
          contractId: params.contractId,
          type: 'DEPOSIT_AND_FEE',
          deposit: depositAmount,
          fee: platformFee
        },
      }, {
        idempotencyKey: `deposit_${params.contractId}`,
      });

      if (charge.status !== 'succeeded') {
        throw new Error(`Payment failed: ${charge.failure_message}`);
      }

      // Create escrow record in database
      const escrow = await prisma.escrowAccounts.create({
        data: {
          contractId: params.contractId,
          depositAmount,
          finalAmount: params.contractAmount * REVENUE_MODEL.FINAL_PAYMENT_PERCENT,
          totalFees: platformFee, 
          status: 'ACTIVE',
          depositReleasedAt: null,
          finalReleasedAt: null,
        },
      });

      // Log transaction
      await prisma.transactions.create({
        data: {
          userId: params.homeownerId,
          amount: totalCharge,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          stripeId: charge.id,
          contractId: params.contractId,
          completedAt: new Date(),
        },
      });

      console.log(`✅ Deposit & Fee held: ${params.contractId} - $${totalCharge} ($${depositAmount} deposit + $${platformFee} fee)`);

      return {
        chargeId: charge.id,
        escrowId: escrow.id,
        depositAmount,
      };
    } catch (error: any) {
      console.error('❌ Error holding deposit:', error);
      throw new Error(`Failed to hold deposit: ${error.message}`);
    }
  }

  /**
   * Release final payment (75% of contract amount)
   * Called when homeowner approves completion
   */
  async releaseFinalPayment(params: {
    contractId: string;
    homeownerId: string;
    contractorId: string;
    contractAmount: number;
    platformFeePercent: number; // Ignored
  }): Promise<{ chargeId: string; finalPaymentAmount: number; contractorNet: number }> {
    try {
      const finalAmount = params.contractAmount * REVENUE_MODEL.FINAL_PAYMENT_PERCENT;

      // Create Stripe charge for final payment
      const charge = await stripe.charges.create({
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: 'usd',
        customer: params.homeownerId,
        description: `Final payment for contract ${params.contractId}`,
        metadata: {
          contractId: params.contractId,
          type: 'FINAL_PAYMENT',
        },
      }, {
        idempotencyKey: `final_${params.contractId}`,
      });

      if (charge.status !== 'succeeded') {
        throw new Error(`Payment failed: ${charge.failure_message}`);
      }

      // Update escrow
      await prisma.escrowAccounts.updateMany({
        where: { contractId: params.contractId },
        data: {
          finalReleasedAt: new Date(),
          status: 'RELEASED',
        },
      });

      // Log transaction
      await prisma.transactions.create({
        data: {
          userId: params.homeownerId,
          amount: finalAmount,
          type: 'FINAL_PAYMENT',
          status: 'COMPLETED',
          stripeId: charge.id,
          contractId: params.contractId,
          completedAt: new Date(),
        },
      });

      // Contractor gets 100% of the bid amount (Deposit + Final)
      const contractorNet = params.contractAmount;

      console.log(`✅ Final payment released: ${params.contractId} - $${finalAmount}`);
      console.log(`💰 Contractor Net Total: $${contractorNet}`);

      return {
        chargeId: charge.id,
        finalPaymentAmount: finalAmount,
        contractorNet,
      };
    } catch (error: any) {
      console.error('❌ Error releasing final payment:', error);
      throw new Error(`Failed to release final payment: ${error.message}`);
    }
  }

  /**
   * Charge additional amount for change order
   */
  async chargeAdditional(params: {
    contractId: string;
    homeownerId: string;
    additionalAmount: number;
  }): Promise<{ chargeId: string; additionalAmount: number }> {
    try {
      // For change orders, we charge the amount + fee immediately
      const platformFee = params.additionalAmount * REVENUE_MODEL.PLATFORM_FEE_PERCENT;
      const totalCharge = params.additionalAmount + platformFee;

      const charge = await stripe.charges.create({
        amount: Math.round(totalCharge * 100), // Convert to cents
        currency: 'usd',
        customer: params.homeownerId,
        description: `Change order for contract ${params.contractId}`,
        metadata: {
          contractId: params.contractId,
          type: 'CHANGE_ORDER',
        },
      }, {
        idempotencyKey: `change_order_${params.contractId}_${Date.now()}`,
      });

      if (charge.status !== 'succeeded') {
        throw new Error(`Payment failed: ${charge.failure_message}`);
      }

      // Update escrow to reflect new total
      const escrow = await prisma.escrowAccounts.findUnique({
        where: { contractId: params.contractId },
      });

      if (escrow) {
        await prisma.escrowAccounts.update({
          where: { contractId: params.contractId },
          data: {
            finalAmount: escrow.finalAmount + params.additionalAmount, // We assume change orders are paid out fully at end or immediately? Keeping simple.
            totalFees: escrow.totalFees + platformFee,
          },
        });
      }

      // Log transaction
      await prisma.transactions.create({
        data: {
          userId: params.homeownerId,
          amount: totalCharge,
          type: 'CHANGE_ORDER',
          status: 'COMPLETED',
          stripeId: charge.id,
          contractId: params.contractId,
          completedAt: new Date(),
        },
      });

      console.log(`✅ Change order charged: ${params.contractId} - $${totalCharge}`);

      return {
        chargeId: charge.id,
        additionalAmount: params.additionalAmount,
      };
    } catch (error: any) {
      console.error('❌ Error charging additional amount:', error);
      throw new Error(`Failed to charge additional amount: ${error.message}`);
    }
  }

  /**
   * Refund payment (full or partial)
   * Called when contract is cancelled or disputed
   */
  async refundPayment(params: {
    contractId: string;
    homeownerId: string;
    reason: string;
    fullRefund: boolean;
  }): Promise<{ refundId: string; refundAmount: number }> {
    try {
      // Find original charge
      const transactions = await prisma.transactions.findMany({
        where: {
          contractId: params.contractId,
          status: 'COMPLETED',
          type: { in: ['DEPOSIT', 'FINAL_PAYMENT'] },
        },
      });

      if (transactions.length === 0) {
        throw new Error('No payments found to refund');
      }

      let refundAmount = 0;
      let chargeToRefund = '';

      if (params.fullRefund) {
        // Full refund of all payments
        refundAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        chargeToRefund = transactions[0].stripeId || '';
      } else {
        // Partial refund (usually just the deposit)
        const depositTx = transactions.find((t) => t.type === 'DEPOSIT');
        if (depositTx) {
          refundAmount = depositTx.amount;
          chargeToRefund = depositTx.stripeId || '';
        }
      }

      if (!chargeToRefund) {
        throw new Error('No valid charge to refund');
      }

      // Create refund through Stripe
      const refund = await stripe.refunds.create({
        charge: chargeToRefund,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          contractId: params.contractId,
          reason: params.reason,
        },
      }, {
        idempotencyKey: `refund_${params.contractId}`,
      });

      if (refund.status !== 'succeeded') {
        throw new Error(`Refund failed: ${refund.failure_reason}`);
      }

      // Update escrow status
      await prisma.escrowAccounts.updateMany({
        where: { contractId: params.contractId },
        data: {
          status: 'REFUNDED',
          depositReleasedAt: new Date(),
          finalReleasedAt: new Date(),
        },
      });

      // Log refund transaction
      await prisma.transactions.create({
        data: {
          userId: params.homeownerId,
          amount: refundAmount,
          type: 'REFUND',
          status: 'COMPLETED',
          refundId: refund.id,
          contractId: params.contractId,
          completedAt: new Date(),
        },
      });

      console.log(`✅ Refund processed: ${params.contractId} - $${refundAmount}`);

      return {
        refundId: refund.id,
        refundAmount,
      };
    } catch (error: any) {
      console.error('❌ Error processing refund:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Get payment status for contract
   */
  async getPaymentStatus(contractId: string): Promise<any> {
    try {
      const escrow = await prisma.escrowAccounts.findUnique({
        where: { contractId },
      });

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      const transactions = await prisma.transactions.findMany({
        where: { contractId },
        orderBy: { createdAt: 'asc' },
      });

      return {
        contractId,
        escrowStatus: escrow.status,
        depositAmount: escrow.depositAmount,
        finalAmount: escrow.finalAmount,
        platformFee: escrow.totalFees,
        depositReleased: !!escrow.depositReleasedAt,
        finalReleased: !!escrow.finalReleasedAt,
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          status: t.status,
          date: t.createdAt,
        })),
      };
    } catch (error: any) {
      console.error('❌ Error getting payment status:', error);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Transfer earnings to contractor (payout)
   * Called at end of month or on request
   */
  async transferToContractor(params: {
    contractorId: string;
    contractorNetAmount: number;
    contractId: string;
  }): Promise<{ transferId: string; amount: number }> {
    try {
      // Create transfer in Stripe (assuming contractor has connected account)
      const transfer = await stripe.transfers.create({
        amount: Math.round(params.contractorNetAmount * 100), // cents
        currency: 'usd',
        destination: params.contractorId, // Contractor's Stripe account ID
        description: `Earnings for contract ${params.contractId}`,
        metadata: {
          contractId: params.contractId,
          type: 'CONTRACTOR_PAYOUT',
        },
      }, {
        idempotencyKey: `payout_${params.contractId}`,
      });

      // Log payout transaction
      await prisma.transactions.create({
        data: {
          userId: params.contractorId,
          amount: params.contractorNetAmount,
          type: 'PAYOUT',
          status: 'COMPLETED',
          stripeId: transfer.id,
          contractId: params.contractId,
          completedAt: new Date(),
        },
      });

      console.log(`✅ Transfer to contractor: ${params.contractorId} - $${params.contractorNetAmount}`);

      return {
        transferId: transfer.id,
        amount: params.contractorNetAmount,
      };
    } catch (error: any) {
      console.error('❌ Error transferring to contractor:', error);
      throw new Error(`Failed to transfer funds: ${error.message}`);
    }
  }

  /**
   * Get Stripe customer
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    try {
      // In production, store Stripe customer ID in database
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      });

      return customer.id;
    } catch (error: any) {
      console.error('❌ Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Calculate net amount for contractor (after platform fee)
   */
  calculateContractorNet(contractAmount: number, platformFeePercent: number = 0): number {
    // Contractor keeps 100% in our new model
    return contractAmount; 
  }

  /**
   * Get platform revenue for period
   */
  async getPlatformRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    try {
      // Revenue is now explicitly tracked in 'totalFees' of EscrowAccounts
      const where: any = { status: { in: ['RELEASED', 'ACTIVE'] } };

      if (startDate) where.createdAt = { gte: startDate };
      if (endDate) {
        if (where.createdAt) {
          where.createdAt.lte = endDate;
        } else {
          where.createdAt = { lte: endDate };
        }
      }

      const escrows = await prisma.escrowAccounts.findMany({ where });
      const totalRevenue = escrows.reduce((sum, e) => sum + e.totalFees, 0);

      return totalRevenue;
    } catch (error: any) {
      console.error('❌ Error calculating revenue:', error);
      throw new Error(`Failed to calculate revenue: ${error.message}`);
    }
  }
}

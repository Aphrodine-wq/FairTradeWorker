/**
 * Payment Routes
 * PHASE 2: Core Payment Processing
 * - Create payment intents
 * - Process payments (deposits and final payments)
 * - Handle refunds
 * - Manage payouts to contractors
 */

import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2025-01-27.acacia', // Use latest API version or valid string
});

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

/**
 * POST /api/payments/create-intent
 * Create a payment intent for a contract deposit or final payment
 * Used by homeowners to initiate payment
 */
router.post('/payments/create-intent', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const { contractId, amount, type } = req.body; // type: 'DEPOSIT' or 'FINAL_PAYMENT'

    if (!contractId || !amount || !type) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'contractId, amount, and type are required',
      });
    }

    if (amount < 1) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_AMOUNT',
        message: 'Minimum payment is $1.00',
      });
    }

    if (!['DEPOSIT', 'FINAL_PAYMENT'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TYPE',
        message: 'type must be DEPOSIT or FINAL_PAYMENT',
      });
    }

    // Generate idempotency key to prevent duplicate charges
    const idempotencyKey = `${type}_${contractId}_${req.user?.id}`;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: req.user?.id,
        metadata: {
          contractId,
          homeownerId: req.user?.id,
          type,
        },
        description: `FairTradeWorker Contract ${contractId} - ${type}`,
        // Enable 3D Secure and other authentication methods
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        idempotencyKey, // Prevents duplicate payment intents
      }
    );

    res.json({
      success: true,
      message: 'Payment intent created',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount,
        type,
        contractId,
      },
    });
  } catch (error: any) {
    console.error('❌ Error creating payment intent:', error);

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        error: 'STRIPE_ERROR',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'PAYMENT_INTENT_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/confirm
 * Confirm a payment after card has been tokenized by frontend
 * Called after Stripe Elements collects card details
 */
router.post('/payments/confirm', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId, contractId } = req.body;

    if (!paymentIntentId || !contractId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'paymentIntentId and contractId are required',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check status
    if (paymentIntent.status === 'succeeded') {
      // Payment already succeeded
      return res.json({
        success: true,
        message: 'Payment completed',
        data: {
          paymentIntentId: paymentIntent.id,
          status: 'SUCCEEDED',
          amount: paymentIntent.amount / 100,
        },
      });
    }

    if (paymentIntent.status === 'requires_action') {
      // 3D Secure or other authentication required
      return res.json({
        success: true,
        message: 'Additional authentication required',
        data: {
          status: 'REQUIRES_ACTION',
          clientSecret: paymentIntent.client_secret,
        },
      });
    }

    if (paymentIntent.status === 'processing') {
      return res.json({
        success: true,
        message: 'Payment is processing',
        data: {
          status: 'PROCESSING',
          paymentIntentId,
        },
      });
    }

    return res.json({
      success: false,
      message: `Payment status: ${paymentIntent.status}`,
      data: {
        status: paymentIntent.status,
        paymentIntentId,
      },
    });
  } catch (error: any) {
    console.error('❌ Error confirming payment:', error);

    res.status(400).json({
      success: false,
      error: 'PAYMENT_CONFIRMATION_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/refund
 * Refund a payment (used in disputes or cancellations)
 */
router.post('/payments/refund', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { chargeId, amount, reason } = req.body;

    if (!chargeId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'chargeId and amount are required',
      });
    }

    // Create refund
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason || 'requested_by_customer',
      metadata: {
        refundedBy: req.user?.id,
        reason,
      },
    });

    res.json({
      success: true,
      message: 'Refund processed',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
        chargeId,
      },
    });
  } catch (error: any) {
    console.error('❌ Error processing refund:', error);

    res.status(400).json({
      success: false,
      error: 'REFUND_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/payments/payout
 * Payout funds to contractor via Stripe Connect
 * Called when job is completed and approved
 */
router.post('/payments/payout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contractorId, stripeConnectAccountId, amount, contractId } = req.body;

    if (!contractorId || !stripeConnectAccountId || !amount || !contractId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'contractorId, stripeConnectAccountId, amount, and contractId are required',
      });
    }

    // Create transfer to contractor's Stripe account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: stripeConnectAccountId,
      description: `Payout for contract ${contractId}`,
      metadata: {
        contractId,
        contractorId,
        recipientId: stripeConnectAccountId,
      },
      transfer_group: `contract_${contractId}`, // Groups related transfers
    });

    res.json({
      success: true,
      message: 'Payout initiated',
      data: {
        transferId: transfer.id,
        amount: transfer.amount / 100,
        destination: transfer.destination,
        status: transfer.status,
      },
    });
  } catch (error: any) {
    console.error('❌ Error processing payout:', error);

    res.status(400).json({
      success: false,
      error: 'PAYOUT_FAILED',
      message: error.message,
    });
  }
});

/**
 * GET /api/payments/transaction/:transactionId
 * Get transaction details
 */
router.get('/payments/transaction/:transactionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;

    // In production, fetch from database
    // For now, return placeholder
    res.json({
      success: true,
      message: 'Transaction retrieved',
      data: {
        transactionId,
        status: 'Implemented in database layer',
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'TRANSACTION_FETCH_FAILED',
      message: error.message,
    });
  }
});

/**
 * GET /api/payments/wallet
 * Get contractor wallet/balance
 */
router.get('/payments/wallet', authenticateToken, authorizeRole('CONTRACTOR'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    // In production, calculate from completed contracts
    // For now, return placeholder
    res.json({
      success: true,
      message: 'Wallet data retrieved',
      data: {
        contractorId: req.user.id,
        balance: 0, // Calculated from completed contracts
        pendingPayouts: 0,
        totalEarned: 0,
        lastPayout: null,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'WALLET_FETCH_FAILED',
      message: error.message,
    });
  }
});

export default router;

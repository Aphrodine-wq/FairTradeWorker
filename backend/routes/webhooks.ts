/**
 * Webhook Verification Routes
 * Handles Stripe and Twilio webhook events with signature verification
 * Part of PHASE 1 Security Implementation - Issue #6: Webhook Verification
 */

import { Router, Request, Response, NextFunction } from 'express';
import { Encryption } from '../../src/utils/encryption';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Extend request for webhook handling
interface WebhookRequest extends Request {
  rawBody?: string;
}

/**
 * Middleware: Capture raw body for webhook signature verification
 * MUST be applied BEFORE express.json() for Stripe webhooks
 * Usage: app.use(rawBodyMiddleware)
 */
export const rawBodyMiddleware = (req: WebhookRequest, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && req.path.startsWith('/webhooks')) {
    let rawBody = '';

    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', () => {
      req.rawBody = rawBody;
      req.body = JSON.parse(rawBody);
      next();
    });
  } else {
    next();
  }
};

/**
 * STRIPE WEBHOOK: Handle payment events
 * Events: charge.succeeded, charge.failed, refund.created, payment_intent.succeeded
 *
 * Test locally with: stripe listen --forward-to localhost:3001/webhooks/stripe
 */
router.post('/stripe', async (req: WebhookRequest, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      console.warn('⚠️  Stripe webhook: Missing signature header');
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Verify signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not set in environment');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    const rawBody = req.rawBody || '';

    // Verify signature using HMAC
    try {
      const expectedSignature = Encryption.generateHmacSignature(rawBody, webhookSecret);
      // Extract timestamp and signature from Stripe format: t=timestamp,v1=signature
      const sigParts = sig.split(',').reduce((acc: any, part) => {
        const [key, value] = part.split('=');
        acc[key] = value;
        return acc;
      }, {});

      // Stripe uses t.v1 format
      if (!sigParts.v1 || sigParts.v1 !== expectedSignature) {
        console.warn('❌ Stripe webhook: Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (err) {
      console.error('❌ Stripe signature verification error:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Parse event
    const event = JSON.parse(rawBody);
    console.log(`✅ Verified Stripe webhook: ${event.type}`);

    // Handle events
    switch (event.type) {
      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object);
        break;

      case 'refund.created':
        await handleRefund(event.data.object);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      default:
        console.log(`ℹ️  Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('❌ Stripe webhook error:', err);
    res.status(400).json({ error: `Webhook error: ${err.message}` });
  }
});

/**
 * TWILIO WEBHOOK: Handle SMS/phone events
 * Events: SMS delivery, call status, etc.
 *
 * Set webhook URL in Twilio dashboard:
 * https://your-domain.com/webhooks/twilio
 */
router.post('/twilio', async (req: WebhookRequest, res: Response) => {
  try {
    const twilioSignature = req.headers['x-twilio-signature'] as string;
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    if (!twilioSignature) {
      console.warn('⚠️  Twilio webhook: Missing x-twilio-signature header');
      return res.status(400).json({ error: 'Missing x-twilio-signature header' });
    }

    // Verify Twilio signature
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) {
      console.error('❌ TWILIO_AUTH_TOKEN not set in environment');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Twilio signature verification
    try {
      const expectedSignature = Encryption.generateHmacSignature(
        url + new URLSearchParams(req.body).toString(),
        authToken
      );

      if (twilioSignature !== expectedSignature) {
        console.warn('❌ Twilio webhook: Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (err) {
      console.error('❌ Twilio signature verification error:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log(`✅ Verified Twilio webhook: ${req.body.MessageSid || req.body.CallSid}`);

    // Handle Twilio events
    if (req.body.MessageSid) {
      // SMS event
      await handleTwilioSMS(req.body);
    } else if (req.body.CallSid) {
      // Phone call event
      await handleTwilioCall(req.body);
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error('❌ Twilio webhook error:', err);
    res.status(400).json({ error: `Webhook error: ${err.message}` });
  }
});

/**
 * Generic webhook verification endpoint
 * Can be used for testing or other services
 */
router.post('/verify', async (req: WebhookRequest, res: Response) => {
  const { signature, body, secret } = req.body;

  try {
    const expectedSignature = Encryption.generateHmacSignature(JSON.stringify(body), secret);
    const valid = Encryption.verifyHmacSignature(JSON.stringify(body), signature, secret);

    res.json({
      valid,
      message: valid ? 'Signature verified' : 'Signature invalid',
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Health check endpoint for webhooks
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    webhooksSupported: ['stripe', 'twilio', 'custom'],
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// EVENT HANDLERS
// ============================================

/**
 * Handle Stripe charge.succeeded event
 * Called when a charge completes successfully
 */
async function handleChargeSucceeded(charge: any): Promise<void> {
  console.log(`💰 Stripe: Charge succeeded - ID: ${charge.id}, Amount: ${charge.amount}`);

  try {
    // Get database
    const { Database } = await import('../database');
    const db = new Database();

    // Update transaction record
    await db.transactions.update(
      { stripeId: charge.id },
      {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      }
    );

    // Log successful charge
    console.log(`✅ Updated transaction for Stripe charge: ${charge.id}`);
  } catch (error) {
    console.error(`❌ Error handling charge.succeeded: ${error}`);
  }
}

/**
 * Handle Stripe charge.failed event
 */
async function handleChargeFailed(charge: any): Promise<void> {
  console.log(
    `❌ Stripe: Charge failed - ID: ${charge.id}, Error: ${charge.failure_message}`
  );

  try {
    const { Database } = await import('../database');
    const db = new Database();

    // Update transaction record
    await db.transactions.update(
      { stripeId: charge.id },
      {
        status: 'FAILED',
        failureReason: charge.failure_message,
        updatedAt: new Date().toISOString(),
      }
    );

    // Log failed charge
    console.log(`❌ Updated transaction status to FAILED: ${charge.id}`);
  } catch (error) {
    console.error(`❌ Error handling charge.failed: ${error}`);
  }
}

/**
 * Handle Stripe refund.created event
 */
async function handleRefund(refund: any): Promise<void> {
  console.log(`↩️  Stripe: Refund created - ID: ${refund.id}, Amount: ${refund.amount}`);

  try {
    const { Database } = await import('../database');
    const db = new Database();

    // Create refund transaction
    await db.transactions.insert({
      id: `refund_${Date.now()}`,
      amount: refund.amount / 100, // Convert from cents
      type: 'REFUND',
      status: 'COMPLETED',
      stripeId: refund.id,
      refundId: refund.id,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Created refund record: ${refund.id}`);
  } catch (error) {
    console.error(`❌ Error handling refund.created: ${error}`);
  }
}

/**
 * Handle Stripe payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(intent: any): Promise<void> {
  console.log(`✅ Stripe: Payment intent succeeded - ID: ${intent.id}`);

  try {
    const { Database } = await import('../database');
    const db = new Database();

    // Update transaction
    await db.transactions.update(
      { stripeId: intent.id },
      {
        status: 'COMPLETED',
        paymentIntentId: intent.id,
        completedAt: new Date().toISOString(),
      }
    );

    console.log(`✅ Payment intent processed: ${intent.id}`);
  } catch (error) {
    console.error(`❌ Error handling payment_intent.succeeded: ${error}`);
  }
}

/**
 * Handle Stripe payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(intent: any): Promise<void> {
  console.log(`❌ Stripe: Payment intent failed - ID: ${intent.id}`);

  try {
    const { Database } = await import('../database');
    const db = new Database();

    // Update transaction
    await db.transactions.update(
      { stripeId: intent.id },
      {
        status: 'FAILED',
        failureReason: intent.last_payment_error?.message || 'Unknown error',
      }
    );

    console.log(`❌ Payment intent failed: ${intent.id}`);
  } catch (error) {
    console.error(`❌ Error handling payment_intent.payment_failed: ${error}`);
  }
}

/**
 * Handle Twilio SMS event
 */
async function handleTwilioSMS(smsData: any): Promise<void> {
  console.log(`📱 Twilio SMS: From=${smsData.From}, Body=${smsData.Body}`);

  // TODO: Update database
  // - Find user by phone number
  // - Log SMS received
  // - Process message (e.g., update job status via SMS)

  // Example SMS commands:
  // - "ACCEPT BID 12345" - Accept bid
  // - "COMPLETE 12345 photos URL" - Submit completion with photos
}

/**
 * Handle Twilio call event
 */
async function handleTwilioCall(callData: any): Promise<void> {
  console.log(`☎️  Twilio Call: CallSid=${callData.CallSid}, Status=${callData.CallStatus}`);

  // TODO: Update database
  // - Find call record by CallSid
  // - Update call status
  // - Log call details
}

export default router;

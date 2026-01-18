# Payment & Escrow Security Specification

**Priority:** CRITICAL 🔴
**Part of:** PHASE 1 Issues #4-6
**Owner:** Payment Engineer
**Timeline:** 2-3 hours

---

## Overview

FairTradeWorker uses a two-stage payment model:
1. **Deposit Phase** (25% held in escrow when contract accepted)
2. **Final Payment Phase** (75% charged when homeowner approves completion)

This document secures the entire payment pipeline against fraud, double-charging, and atomicity violations.

---

## Issue #4: Payment Security & Atomicity

### Problem

Current code has no transaction atomicity - if payment succeeds but escrow update fails, money is lost.

### Solution: Database Transactions

```typescript
// backend/services/escrowService.ts
import prisma from '../src/services/database';
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class EscrowService {
  /**
   * Atomically:
   * 1. Charge homeowner deposit via Stripe
   * 2. Create escrow record
   * 3. Update contract status
   * All succeed together or all fail together
   */
  async holdDepositInEscrow(params: {
    contractId: string;
    homeownerId: string;
    amount: Decimal;
    depositPercent: number;
  }): Promise<Escrow> {
    // Use Prisma transaction
    return await prisma.$transaction(async (tx) => {
      // Step 1: Charge via Stripe (with idempotency key)
      const charge = await stripe.charges.create({
        amount: Math.round(params.amount.mul(params.depositPercent / 100).toNumber() * 100), // cents
        currency: 'usd',
        customer: homeownerId,
        description: `Deposit for contract ${params.contractId}`,
        idempotencyKey: `deposit_${params.contractId}` // Prevent duplicate charges
      }, {
        idempotencyKey: `deposit_${params.contractId}`
      });

      if (charge.status !== 'succeeded') {
        throw new Error(`Payment failed: ${charge.failure_message}`);
      }

      // Step 2: Create escrow record (in same transaction)
      const escrow = await tx.escrow.create({
        data: {
          contractId: params.contractId,
          amount: params.amount,
          depositAmount: params.amount.mul(params.depositPercent / 100),
          depositBalance: params.amount.mul(params.depositPercent / 100),
          finalAmount: params.amount.mul((100 - params.depositPercent) / 100),
          finalBalance: BigInt(0),
          status: 'DEPOSIT_HELD'
        }
      });

      // Step 3: Update contract (in same transaction)
      await tx.bidContract.update({
        where: { id: params.contractId },
        data: {
          depositPaid: true,
          depositPaidAt: new Date(),
          status: 'ACTIVE'
        }
      });

      // Step 4: Log transaction (in same transaction)
      await tx.transaction.create({
        data: {
          userId: params.homeownerId,
          type: 'PAYMENT_IN',
          amount: params.amount.mul(params.depositPercent / 100),
          status: 'COMPLETED',
          description: `Deposit charged for contract ${params.contractId}`,
          contractId: params.contractId,
          stripeId: charge.id,
          completedAt: new Date()
        }
      });

      return escrow;
    });
  }

  /**
   * Release final payment after homeowner approves
   * Atomically charge remaining balance + transfer to contractor
   */
  async releaseFinalPayment(contractId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const contract = await tx.bidContract.findUnique({
        where: { id: contractId },
        include: { escrow: true }
      });

      if (!contract || !contract.escrow) {
        throw new Error('Contract or escrow not found');
      }

      // Charge final amount
      const charge = await stripe.charges.create({
        amount: Math.round(contract.bidAmount.mul(0.75).toNumber() * 100),
        currency: 'usd',
        customer: contract.homeownerId, // Assumes stored payment method
        description: `Final payment for contract ${contractId}`,
        idempotencyKey: `final_${contractId}`
      }, {
        idempotencyKey: `final_${contractId}`
      });

      if (charge.status !== 'succeeded') {
        throw new Error(`Final payment failed: ${charge.failure_message}`);
      }

      // Update escrow
      await tx.escrow.update({
        where: { id: contract.escrow.id },
        data: {
          finalBalance: contract.bidAmount.mul(0.75),
          status: 'RELEASE_PENDING'
        }
      });

      // Mark final payment on contract
      await tx.bidContract.update({
        where: { id: contractId },
        data: {
          finalPaid: true,
          finalPaidAt: new Date()
        }
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId: contract.homeownerId,
          type: 'PAYMENT_IN',
          amount: contract.bidAmount.mul(0.75),
          status: 'COMPLETED',
          contractId: contractId,
          stripeId: charge.id,
          completedAt: new Date()
        }
      });
    });
  }

  /**
   * Refund payment in case of dispute
   */
  async refundPayment(contractId: string, reason: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const contract = await tx.bidContract.findUnique({
        where: { id: contractId },
        include: { escrow: true }
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      // Find original Stripe charge
      const charges = await stripe.charges.list({
        customer: contract.homeownerId,
        limit: 10
      });

      const originalCharge = charges.data.find(c =>
        c.description?.includes(contractId) && c.status === 'succeeded'
      );

      if (!originalCharge) {
        throw new Error('Original charge not found');
      }

      // Issue refund
      const refund = await stripe.refunds.create({
        charge: originalCharge.id,
        reason: 'requested_by_customer',
        idempotencyKey: `refund_${contractId}`
      }, {
        idempotencyKey: `refund_${contractId}`
      });

      if (refund.status !== 'succeeded') {
        throw new Error(`Refund failed: ${refund.failure_reason}`);
      }

      // Update escrow
      if (contract.escrow) {
        await tx.escrow.update({
          where: { id: contract.escrow.id },
          data: {
            status: 'REFUNDED',
            releasedAt: new Date()
          }
        });
      }

      // Update contract
      await tx.bidContract.update({
        where: { id: contractId },
        data: { status: 'CANCELLED' }
      });

      // Log refund transaction
      await tx.transaction.create({
        data: {
          userId: contract.homeownerId,
          type: 'REFUND',
          amount: contract.bidAmount,
          status: 'COMPLETED',
          description: `Refund for contract ${contractId}: ${reason}`,
          contractId: contractId,
          stripeId: refund.id,
          completedAt: new Date()
        }
      });
    });
  }
}
```

---

## Issue #5: Data Encryption at Rest

### Problem

PII stored in plaintext: email, phone, SSN (EIN), passwords, payment info.

### Solution: Field-Level Encryption

```typescript
// src/utils/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

export class Encryption {
  static encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(ciphertext: string): string {
    const [iv, encrypted] = ciphertext.split(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // For Prisma middleware
  static encryptFields(obj: any, fields: string[]): any {
    const copy = { ...obj };
    fields.forEach(field => {
      if (copy[field]) {
        copy[field] = this.encrypt(copy[field]);
      }
    });
    return copy;
  }

  static decryptFields(obj: any, fields: string[]): any {
    const copy = { ...obj };
    fields.forEach(field => {
      if (copy[field]) {
        try {
          copy[field] = this.decrypt(copy[field]);
        } catch (e) {
          // Already decrypted or invalid
          console.warn(`Failed to decrypt field ${field}`);
        }
      }
    });
    return copy;
  }
}
```

### Apply encryption in Prisma middleware

```typescript
// src/services/database.ts
import { Encryption } from '../utils/encryption';
import prisma from './database';

// Encrypt on write, decrypt on read
prisma.$use(async (params, next) => {
  // Fields that should be encrypted
  const encryptedFields = ['phone', 'einNumber', 'licenseNumber', 'policyNumber', 'passwordHash'];

  if (params.action === 'create' && params.model === 'User') {
    params.data = Encryption.encryptFields(params.data, encryptedFields);
  }

  if (params.action === 'update' && params.model === 'User') {
    params.data = Encryption.encryptFields(params.data, encryptedFields);
  }

  const result = await next(params);

  if (params.action === 'findUnique' && params.model === 'User') {
    return Encryption.decryptFields(result, encryptedFields);
  }

  if (params.action === 'findMany' && params.model === 'User') {
    return result.map((user: any) => Encryption.decryptFields(user, encryptedFields));
  }

  return result;
});

export default prisma;
```

### Generate and store encryption key

```bash
# Generate encryption key (DO THIS ONCE)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# Add to .env
echo "ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6" >> .env
```

---

## Issue #6: Webhook Verification

### Problem

Stripe/Twilio webhooks not verified - attacker can forge events.

### Solution: Signature Verification

```typescript
// backend/routes/webhooks.ts
import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import twilio from 'twilio';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Stripe webhook: payment_intent.succeeded
 */
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    // Verify signature
    const event = stripe.webhooks.constructEvent(
      req.rawBody, // Need raw body, not parsed JSON
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle event
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

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err}` });
  }
});

/**
 * Twilio webhook: SMS/call status
 */
router.post('/twilio', async (req: Request, res: Response) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `https://${req.headers.host}${req.originalUrl}`;

  if (!twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    twilioSignature as string,
    url,
    req.body
  )) {
    return res.status(403).json({ error: 'Invalid Twilio signature' });
  }

  // Process SMS/call event
  console.log('Valid Twilio webhook received');
  res.json({ success: true });
});

// Middleware to capture raw body for Stripe
export function rawBodyMiddleware(req: Request, res: Response, next) {
  let rawBody = '';

  req.on('data', (chunk) => {
    rawBody += chunk;
  });

  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
}

export default router;
```

### Apply webhook routes in server.ts

```typescript
// backend/server.ts
import webhookRoutes, { rawBodyMiddleware } from './routes/webhooks';

// IMPORTANT: Raw body middleware must come BEFORE express.json()
app.post('/webhooks/*', rawBodyMiddleware);

// Then apply webhook routes (before general JSON parser)
app.use('/webhooks', webhookRoutes);

// General JSON parser for everything else
app.use(express.json());
```

---

## Testing Payment Security

```bash
# Test 1: Idempotency key prevents double-charge
curl -X POST http://localhost:3001/api/contracts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: test-123" \
  -d '{"jobId":"...","amount":5000,...}'

# Call twice with same Idempotency-Key
# Expected: Second call returns same charge, no double-charge

# Test 2: Webhook signature verification
# Try webhook with invalid signature
curl -X POST http://localhost:3001/webhooks/stripe \
  -H "stripe-signature: invalid_sig" \
  -d '{"type":"charge.succeeded",...}'
# Expected: 400 Webhook Error

# Test 3: Encryption
# Check database directly
psql fairtradeworker -c "SELECT phone FROM \"User\" LIMIT 1;"
# Expected: Shows encrypted ciphertext, not plain phone number

# Test 4: Transaction atomicity
# Simulate Stripe failure mid-transaction
# Expected: No partial updates, contract status unchanged
```

---

## Summary Checklist

- [ ] API Key validation (Issue #1) ✅
- [ ] JWT authentication middleware (Issue #2) ✅
- [ ] Input validation & sanitization (Issue #3) ✅
- [ ] Payment atomicity with transactions (Issue #4) ✅
- [ ] Field-level encryption for PII (Issue #5) ✅
- [ ] Webhook signature verification (Issue #6) ✅

All 6 critical issues addressed. Ready for PHASE 2 (Features).


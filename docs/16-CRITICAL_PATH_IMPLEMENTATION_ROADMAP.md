# FairTradeWorker: Critical Path Implementation Roadmap
## Production-Ready Delivery Plan (8-12 Weeks)

**Date Created:** January 5, 2026
**Target Launch:** March 2026
**Team Size:** 3 senior engineers
**Status:** Ready for implementation

---

## EXECUTIVE OVERVIEW

This document outlines the **critical path** to production launch, focusing on the 42-48% of remaining work that MUST be completed before revenue-generating operations can begin.

### Timeline Summary
- **PHASE 1 (Weeks 1-2):** Security & Infrastructure
- **PHASE 2 (Weeks 3-4):** Payment Processing
- **PHASE 3 (Weeks 5-6):** Bid & Contract Workflow
- **PHASE 4 (Weeks 7-8):** Job Completion & Disputes
- **PHASE 5 (Weeks 9-10):** Testing & Deployment

### Success Metrics
- Payment success rate: >98%
- Bid → Contract completion: 100% of accepted bids
- Job completion approval workflow: 100% working
- Uptime: >99.5% in production
- Load: 500+ concurrent users without degradation

---

## PHASE 1: SECURITY & INFRASTRUCTURE (Weeks 1-2)

### 1.1 User Authentication Enhancement

**Current State:**
- ✅ JWT token implementation
- ✅ Role-based access control
- ❌ Password hashing missing
- ❌ Email verification missing
- ❌ Password reset missing

**Tasks:**

#### 1.1.1 Implement Password Hashing
**File:** `backend/services/userService.ts`
**Priority:** CRITICAL
**Time:** 2 hours

```typescript
import bcrypt from 'bcrypt';

async createUser(userData: {
  email: string;
  password: string;
  // ... other fields
}) {
  // Hash password before storing
  const passwordHash = await bcrypt.hash(userData.password, 10);

  // Validate password strength (min 12 chars, mixed case, number, special)
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/.test(userData.password)) {
    throw new Error('Password does not meet security requirements');
  }

  return await db.user.create({
    ...userData,
    passwordHash,
  });
}

async loginUser(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) throw new Error('Invalid credentials');

  return this.generateJWT(user);
}
```

**Acceptance Criteria:**
- [ ] Passwords hashed with bcrypt cost factor 10+
- [ ] Password strength validation enforced
- [ ] Login endpoint validates password hash
- [ ] Old login method removed
- [ ] Tests passing: password hashing, bcrypt compare

---

#### 1.1.2 Email Verification Flow
**File:** `backend/services/authService.ts`
**Priority:** HIGH
**Time:** 4 hours

**Implementation:**
```typescript
// Generate verification token (valid for 24h)
async generateEmailVerificationToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  await db.emailVerificationToken.create({
    userId,
    hashedToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return token; // Send this to user
}

// Verify email
async verifyEmail(token: string) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const record = await db.emailVerificationToken.findFirst({
    where: {
      hashedToken,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) throw new Error('Invalid or expired token');

  await db.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  await db.emailVerificationToken.delete({ where: { id: record.id } });
}
```

**API Endpoints:**
- `POST /api/auth/register` - Sends verification email
- `POST /api/auth/verify-email?token=XXX` - Confirms email
- `POST /api/auth/resend-verification` - Resends email

**SendGrid Integration:**
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'noreply@fairtradeworker.com',
  templateId: 'd-email-verification-template-id',
  dynamicTemplateData: {
    verificationLink: `${process.env.APP_URL}/verify-email?token=${token}`,
    userName: user.firstName,
  },
});
```

**Acceptance Criteria:**
- [ ] Verification token generated on signup
- [ ] Email sent with verification link
- [ ] Token expires after 24 hours
- [ ] Account locked until verified
- [ ] Resend verification email works
- [ ] Tests passing: token generation, expiration, verification

---

#### 1.1.3 Password Reset Flow
**File:** `backend/routes/authRoutes.ts`
**Priority:** HIGH
**Time:** 3 hours

**Endpoints:**
1. `POST /api/auth/forgot-password` - Sends reset email
2. `POST /api/auth/reset-password` - Validates token & resets

**Implementation:**
```typescript
// 1. Request reset
async forgotPassword(email: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists (security)
    return { message: 'Check your email for reset link' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(token);

  await db.passwordResetToken.create({
    userId: user.id,
    hashedToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  await sendResetEmail(user.email, token);
}

// 2. Reset password
async resetPassword(token: string, newPassword: string) {
  const hashedToken = hashToken(token);

  const record = await db.passwordResetToken.findFirst({
    where: {
      hashedToken,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) throw new Error('Invalid or expired reset link');

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  await db.passwordResetToken.delete({ where: { id: record.id } });
}
```

**Acceptance Criteria:**
- [ ] Reset token sent via email
- [ ] Token valid for 1 hour only
- [ ] Token single-use (deleted after use)
- [ ] Password updated in database
- [ ] Old sessions invalidated
- [ ] Tests passing: all scenarios

---

### 1.2 Stripe Webhook Verification

**Current State:**
- ❌ No webhook signature verification
- ❌ Vulnerable to replay attacks
- ❌ Can't trust webhook source

**Task:** Add Stripe webhook signature verification
**File:** `backend/routes/webhooks.ts`
**Priority:** CRITICAL
**Time:** 2 hours

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const rawBody = req.body;

  let event: Stripe.Event;

  try {
    // Verify signature
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).json({
      success: false,
      error: 'Webhook signature verification failed',
      details: err.message,
    });
  }

  // Log webhook received
  await auditLog({
    action: 'WEBHOOK_RECEIVED',
    provider: 'stripe',
    eventType: event.type,
    eventId: event.id,
    status: 'VERIFIED',
  });

  // Handle specific events
  switch (event.type) {
    case 'charge.succeeded':
      await handleChargeSucceeded(event.data.object);
      break;

    case 'charge.failed':
      await handleChargeFailed(event.data.object);
      break;

    case 'charge.refunded':
      await handleChargeRefunded(event.data.object);
      break;

    case 'transfer.created':
      await handleTransferCreated(event.data.object);
      break;

    case 'transfer.paid':
      await handleTransferPaid(event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({success: true, received: true});
});
```

**Acceptance Criteria:**
- [ ] Stripe webhook signature verified
- [ ] All webhook events logged
- [ ] Replay attacks prevented (event ID tracking)
- [ ] Webhook handlers implemented for charge events
- [ ] Error responses return 400 for signature failures
- [ ] Tests passing: signature verification, event handling

---

### 1.3 Error Tracking & Monitoring

**Task:** Set up Sentry for error tracking
**Files:** `backend/server.ts`, `.env.example`
**Priority:** MEDIUM
**Time:** 2 hours

```typescript
import * as Sentry from "@sentry/node";

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
  ],
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Error handling
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(error, {
    contexts: {
      http: {
        method: req.method,
        url: req.url,
        status_code: res.statusCode,
      },
    },
  });

  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    sentryId: Sentry.lastEventId(),
  });
});

app.use(Sentry.Handlers.errorHandler());
```

**Acceptance Criteria:**
- [ ] Sentry initialized in production
- [ ] All errors logged with context
- [ ] Sentry dashboard accessible
- [ ] Alerts configured for critical errors
- [ ] Error response includes Sentry ID for user support

---

### 1.4 Database Backup Strategy

**Task:** Configure automated database backups
**Priority:** HIGH
**Time:** 2 hours

**Implementation (if using AWS RDS):**
```typescript
// Enable automated backups
// - Backup window: 03:00-04:00 UTC
// - Retention: 30 days
// - Multi-AZ failover: Enabled
// - Storage auto-scaling: Enabled

// Manual backup before major changes:
async function manualBackup() {
  const backupId = `backup_${Date.now()}`;
  // AWS RDS: createDBSnapshot()
  // Point-in-time recovery should be available
}

// Backup verification (weekly)
async function verifyBackup() {
  // Restore from backup to test instance
  // Run data integrity checks
  // Delete test instance
}
```

**Acceptance Criteria:**
- [ ] Automated daily backups configured
- [ ] 30-day retention policy active
- [ ] Point-in-time recovery available
- [ ] Backup restoration tested
- [ ] RTO/RPO documented (e.g., 1 hour RTO, 15 min RPO)

---

## PHASE 2: PAYMENT PROCESSING (Weeks 3-4)

### 2.1 Stripe Payment Capture

**Current State:**
- ❌ Stripe SDK imported but not integrated
- ❌ No charge creation endpoint
- ❌ No idempotency key system
- ❌ No transaction tracking

**Task:** Implement payment capture endpoint
**File:** `backend/services/paymentService.ts`
**Priority:** CRITICAL
**Time:** 8 hours

```typescript
import Stripe from 'stripe';

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Create payment intent (front-end initiates)
   * Returns clientSecret for Stripe Elements
   */
  async createPaymentIntent(data: {
    contractId: string;
    amount: number; // In cents
    homeownerId: string;
    contractorId: string;
  }) {
    // Validate amount (prevent $0 or negative)
    if (data.amount < 100) { // $1.00 minimum
      throw new Error('Minimum charge is $1.00');
    }

    // Create idempotency key (prevent duplicate charges)
    const idempotencyKey = `contract_${data.contractId}_intent`;

    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount: data.amount,
        currency: 'usd',
        metadata: {
          contractId: data.contractId,
          homeownerId: data.homeownerId,
          contractorId: data.contractorId,
          transactionType: 'DEPOSIT_PAYMENT',
        },
        // Describe what payment is for
        description: `FairTradeWorker Job Contract ${data.contractId}`,
        // For future charges (with saved card)
        setup_future_usage: 'on_session',
      },
      {
        idempotencyKey, // Prevents duplicate payment intents
      }
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Confirm payment intent (called after front-end card tokenization)
   */
  async confirmPayment(paymentIntentId: string, data: {
    contractId: string;
    homeownerId: string;
  }) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    if (paymentIntent.status === 'succeeded') {
      // Payment already succeeded
      return await this.recordSuccessfulPayment(paymentIntent);
    }

    if (paymentIntent.status === 'requires_action') {
      // 3D Secure or other authentication required
      return {
        status: 'requires_action',
        clientSecret: paymentIntent.client_secret,
        message: 'Additional authentication required',
      };
    }

    return {
      status: paymentIntent.status,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Record successful payment in database
   */
  private async recordSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
    const { contractId, homeownerId } = paymentIntent.metadata as any;

    // Create transaction record
    const transaction = await db.transaction.create({
      data: {
        amount: paymentIntent.amount / 100, // Convert back to dollars
        type: 'DEPOSIT',
        status: 'COMPLETED',
        stripeId: paymentIntent.id,
        paymentIntentId: paymentIntent.id,
        userId: homeownerId,
        contractId,
      },
    });

    // Update contract status
    await db.bidContract.update({
      where: { id: contractId },
      data: {
        status: 'PAYMENT_RECEIVED',
        updatedAt: new Date(),
      },
    });

    // Initialize escrow account
    await escrowService.createEscrow({
      contractId,
      amount: paymentIntent.amount / 100,
      status: 'HELD',
      depositAmount: paymentIntent.amount / 100,
    });

    // Send confirmation email
    const homeowner = await db.user.findUnique({ where: { id: homeownerId } });
    await notificationService.sendEmail({
      to: homeowner.email,
      subject: 'Payment Received',
      template: 'payment-confirmed',
      data: { contractId, amount: transaction.amount },
    });

    return {
      success: true,
      transactionId: transaction.id,
      message: 'Payment received and escrow created',
    };
  }

  /**
   * Handle failed payment (from webhook)
   */
  async handlePaymentFailed(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId
    );

    const { contractId, homeownerId } = paymentIntent.metadata as any;

    // Log failed payment
    await db.transaction.create({
      data: {
        amount: paymentIntent.amount / 100,
        type: 'DEPOSIT',
        status: 'FAILED',
        stripeId: paymentIntentId,
        userId: homeownerId,
        contractId,
      },
    });

    // Update contract status
    await db.bidContract.update({
      where: { id: contractId },
      data: { status: 'PAYMENT_FAILED' },
    });

    // Notify homeowner
    const homeowner = await db.user.findUnique({ where: { id: homeownerId } });
    await notificationService.sendEmail({
      to: homeowner.email,
      subject: 'Payment Failed - Please Try Again',
      template: 'payment-failed',
      data: {
        contractId,
        retryUrl: `${process.env.APP_URL}/contracts/${contractId}/payment`,
        reason: paymentIntent.last_payment_error?.message,
      },
    });
  }
}
```

**API Endpoints:**

```typescript
// POST /api/payments/create-intent
app.post('/api/payments/create-intent', authenticateToken, async (req, res) => {
  try {
    const { contractId, amount } = req.body;

    // Verify user owns this contract
    const contract = await db.bidContract.findUnique({ where: { id: contractId } });
    if (contract.homeownerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await paymentService.createPaymentIntent({
      contractId,
      amount: Math.round(amount * 100), // Convert to cents
      homeownerId: req.user.id,
      contractorId: contract.contractorId,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/payments/confirm
app.post('/api/payments/confirm', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, contractId } = req.body;

    const result = await paymentService.confirmPayment(paymentIntentId, {
      contractId,
      homeownerId: req.user.id,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

**Frontend Integration:**

```typescript
// src/services/paymentService.ts
import { loadStripe } from '@stripe/js';

export class PaymentClient {
  private stripe = await loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);
  private elements = this.stripe.elements();

  async processPayment(contractId: string, amount: number) {
    // 1. Create payment intent
    const intentRes = await apiClient.post('/payments/create-intent', {
      contractId,
      amount,
    });

    // 2. Mount card element
    const cardElement = this.elements.create('card');
    cardElement.mount('#card-element');

    // 3. Confirm payment (handles 3D Secure)
    const confirmResult = await this.stripe.confirmCardPayment(
      intentRes.clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (confirmResult.error) {
      throw new Error(confirmResult.error.message);
    }

    // 4. Confirm on backend
    const result = await apiClient.post('/payments/confirm', {
      paymentIntentId: confirmResult.paymentIntent.id,
      contractId,
    });

    return result;
  }
}
```

**Acceptance Criteria:**
- [ ] Payment intent created with idempotency key
- [ ] Client secret sent to frontend
- [ ] Payment confirmation recorded in database
- [ ] Transaction logged with Stripe payment ID
- [ ] Escrow account created on successful payment
- [ ] Failed payments logged and user notified
- [ ] Tests passing: all payment scenarios ($0.01, $1000, failures)

---

### 2.2 Escrow Integration with Stripe

**Task:** Connect EscrowService to Stripe for fund releases
**File:** `backend/services/escrowService.ts`
**Priority:** CRITICAL
**Time:** 6 hours

```typescript
export class EscrowService {
  private stripe: Stripe;

  /**
   * Release deposit to contractor (called when homeowner accepts contract)
   * Typically deposit = 50% of contract value
   */
  async releaseDepositToContractor(data: {
    contractId: string;
    contractorId: string;
    stripeAccountId: string; // Contractor's connected Stripe account
    depositAmount: number;
  }): Promise<any> {
    const escrow = await db.escrowAccount.findUnique({
      where: { contractId: data.contractId },
    });

    if (!escrow) {
      throw new Error('Escrow account not found');
    }

    // Create Stripe transfer with idempotency
    const idempotencyKey = `deposit_${data.contractId}_release`;

    try {
      const transfer = await this.stripe.transfers.create(
        {
          amount: Math.round(data.depositAmount * 100), // cents
          currency: 'usd',
          destination: data.stripeAccountId,
          description: `Deposit for contract ${data.contractId}`,
          metadata: {
            contractId: data.contractId,
            contractorId: data.contractorId,
            transferType: 'DEPOSIT_RELEASE',
          },
        },
        { idempotencyKey }
      );

      // Update transaction
      await db.transaction.create({
        data: {
          amount: data.depositAmount,
          type: 'DEPOSIT_RELEASED',
          status: 'PENDING', // Pending bank transfer
          userId: data.contractorId,
          contractId: data.contractId,
          stripeId: transfer.id,
        },
      });

      // Update escrow
      await db.escrowAccount.update({
        where: { id: escrow.id },
        data: {
          status: 'DEPOSIT_RELEASED',
          depositReleasedAt: new Date(),
        },
      });

      // Audit log
      await auditLog({
        action: 'DEPOSIT_RELEASED',
        entity: 'ESCROW',
        entityId: escrow.id,
        changes: { status: 'DEPOSIT_RELEASED' },
        userId: 'SYSTEM',
      });

      return {
        success: true,
        transferId: transfer.id,
        amount: data.depositAmount,
        status: transfer.status, // 'created', 'failed', etc.
        estimatedArrival: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1-2 business days
      };
    } catch (error: any) {
      throw new Error(`Stripe transfer failed: ${error.message}`);
    }
  }

  /**
   * Release final payment to contractor (called when job completion approved)
   * Final payment = remaining amount (100% - deposit already released)
   */
  async releaseFinalPaymentToContractor(data: {
    contractId: string;
    contractorId: string;
    stripeAccountId: string;
    finalAmount: number;
    platformFee: number;
  }) {
    const escrow = await db.escrowAccount.findUnique({
      where: { contractId: data.contractId },
    });

    if (!escrow || escrow.status !== 'DEPOSIT_RELEASED') {
      throw new Error('Invalid escrow state for final payment release');
    }

    const idempotencyKey = `final_${data.contractId}_release`;

    try {
      const transfer = await this.stripe.transfers.create(
        {
          amount: Math.round(data.finalAmount * 100), // Final payment only
          currency: 'usd',
          destination: data.stripeAccountId,
          description: `Final payment for contract ${data.contractId}`,
          metadata: {
            contractId: data.contractId,
            contractorId: data.contractorId,
            transferType: 'FINAL_PAYMENT_RELEASE',
            platformFee: data.platformFee,
          },
        },
        { idempotencyKey }
      );

      // Record transactions
      // 1. Contractor final payment
      await db.transaction.create({
        data: {
          amount: data.finalAmount,
          type: 'FINAL_PAYMENT_RELEASED',
          status: 'PENDING',
          userId: data.contractorId,
          contractId: data.contractId,
          stripeId: transfer.id,
        },
      });

      // 2. Platform fee (record as revenue)
      await db.transaction.create({
        data: {
          amount: data.platformFee,
          type: 'PLATFORM_FEE_COLLECTED',
          status: 'COMPLETED',
          userId: 'PLATFORM', // Special user for platform fees
          contractId: data.contractId,
        },
      });

      // Update escrow to RELEASED
      await db.escrowAccount.update({
        where: { id: escrow.id },
        data: {
          status: 'RELEASED',
          finalReleasedAt: new Date(),
        },
      });

      // Update contract to COMPLETED
      await db.bidContract.update({
        where: { id: data.contractId },
        data: { completedAt: new Date() },
      });

      return {
        success: true,
        contractorPayment: {
          transferId: transfer.id,
          amount: data.finalAmount,
          status: transfer.status,
        },
        platformFee: {
          amount: data.platformFee,
          status: 'RECORDED',
        },
      };
    } catch (error: any) {
      throw new Error(`Final payment transfer failed: ${error.message}`);
    }
  }

  /**
   * Handle refund (called during dispute resolution or homeowner cancellation)
   */
  async processRefund(data: {
    contractId: string;
    homeownerId: string;
    originalChargeId: string; // From Stripe payment intent
    refundAmount: number;
    reason: 'dispute_lost' | 'contractor_no_show' | 'homeowner_cancellation';
  }) {
    try {
      // Refund the charge
      const refund = await this.stripe.refunds.create({
        charge: data.originalChargeId,
        amount: Math.round(data.refundAmount * 100),
        metadata: {
          contractId: data.contractId,
          reason: data.reason,
        },
      });

      // Record refund transaction
      await db.transaction.create({
        data: {
          amount: data.refundAmount,
          type: 'REFUND',
          status: 'PENDING',
          userId: data.homeownerId,
          contractId: data.contractId,
          refundId: refund.id,
        },
      });

      // Update escrow status
      await db.escrowAccount.update({
        where: { contractId: data.contractId },
        data: { status: 'REFUNDED' },
      });

      return {
        success: true,
        refundId: refund.id,
        amount: data.refundAmount,
        status: refund.status,
      };
    } catch (error: any) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Deposit release to Stripe Connect account working
- [ ] Final payment release working
- [ ] Refunds processed correctly
- [ ] All transactions recorded in database
- [ ] Idempotency keys prevent double-transfers
- [ ] Webhook handles transfer.created events
- [ ] Tests passing: deposit, final, refund scenarios

---

## PHASE 3: BID & CONTRACT WORKFLOW (Weeks 5-6)

### 3.1 Bid Visibility Rules (SECURITY)

**Current Problem:**
- ❌ Contractors can see all bids on a job (security breach)
- ❌ Competitors can see each other's pricing
- ❌ Defeats "blind bidding" concept

**Task:** Implement bid filtering logic
**File:** `backend/services/bidService.ts`
**Priority:** CRITICAL
**Time:** 4 hours

```typescript
export class BidService {
  /**
   * Get bids for job (with visibility rules)
   *
   * Rules:
   * 1. Homeowner sees all bids (they posted the job)
   * 2. Contractor sees only their own bid
   * 3. Admin sees all bids
   * 4. Non-bidders see nothing
   */
  async getBidsForJob(jobId: string, requestingUserId: string, userRole: string) {
    const job = await db.job.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');

    let query: any = { jobId };

    // Determine what this user can see
    if (job.postedById === requestingUserId) {
      // Homeowner sees all bids
      query = { jobId };
    } else if (userRole === 'ADMIN') {
      // Admin sees all
      query = { jobId };
    } else {
      // Regular contractor sees only their own bid
      query = {
        jobId,
        contractorId: requestingUserId,
      };
    }

    const bids = await db.bid.findMany({
      where: query,
      select: {
        id: true,
        amount: true,
        timeline: true,
        proposal: true,
        status: true,
        createdAt: true,
        contractor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            averageRating: true,
            totalReviews: true,
            completedJobs: true,
          },
        },
      },
    });

    // If homeowner: hide other contractors' amounts (blind bidding)
    if (job.blindBidding && job.postedById === requestingUserId) {
      // Optionally: Show bids but anonymize contractor details
      // Keep amount visible to homeowner
      return bids;
    }

    return bids;
  }

  /**
   * Get single bid (with visibility check)
   */
  async getBid(bidId: string, requestingUserId: string, userRole: string) {
    const bid = await db.bid.findUnique({ where: { id: bidId } });
    if (!bid) throw new Error('Bid not found');

    const job = await db.job.findUnique({ where: { id: bid.jobId } });

    // Check permissions
    const isHomeowner = job.postedById === requestingUserId;
    const isBidder = bid.contractorId === requestingUserId;
    const isAdmin = userRole === 'ADMIN';

    if (!isHomeowner && !isBidder && !isAdmin) {
      throw new Error('You do not have permission to view this bid');
    }

    return bid;
  }

  /**
   * Log bid view (audit trail)
   */
  private async logBidView(bidId: string, viewedBy: string, ipAddress: string) {
    await db.auditLog.create({
      data: {
        action: 'BID_VIEWED',
        entity: 'BID',
        entityId: bidId,
        userId: viewedBy,
        ipAddress,
      },
    });
  }
}
```

**API Endpoint Update:**

```typescript
// GET /api/jobs/:jobId/bids
app.get('/api/jobs/:jobId/bids', authenticateToken, async (req, res) => {
  try {
    const bids = await bidService.getBidsForJob(
      req.params.jobId,
      req.user.id,
      req.user.role
    );

    res.json({ success: true, bids });
  } catch (error) {
    res.status(403).json({ success: false, error: error.message });
  }
});
```

**Acceptance Criteria:**
- [ ] Homeowner sees all bids
- [ ] Contractor sees only their own bid
- [ ] Blind bidding enforced
- [ ] Bid views logged to audit trail
- [ ] Non-bidders get 403 error
- [ ] Tests passing: all permission scenarios

---

### 3.2 Bid Acceptance & Contract Creation

**Task:** Implement bid acceptance workflow
**File:** `backend/services/bidService.ts` + `backend/services/contractService.ts`
**Priority:** CRITICAL
**Time:** 6 hours

```typescript
export class BidService {
  /**
   * Accept a bid and create contract
   *
   * Flow:
   * 1. Verify bid exists and is still valid
   * 2. Create BidContract record
   * 3. Initialize EscrowAccount
   * 4. Update Bid status to ACCEPTED
   * 5. Reject all other bids on this job
   * 6. Send notifications
   */
  async acceptBid(bidId: string, homeownerId: string): Promise<any> {
    // 1. Get bid and validate
    const bid = await db.bid.findUnique({
      where: { id: bidId },
      include: { job: true, contractor: true },
    });

    if (!bid) throw new Error('Bid not found');
    if (bid.job.postedById !== homeownerId) {
      throw new Error('Only job poster can accept bids');
    }
    if (bid.status !== 'SUBMITTED') {
      throw new Error(`Cannot accept bid with status: ${bid.status}`);
    }
    if (bid.job.status !== 'OPEN') {
      throw new Error('Job is no longer accepting bids');
    }

    // Transaction to ensure atomicity
    return await db.$transaction(async (tx) => {
      // 2. Create contract
      const contract = await tx.bidContract.create({
        data: {
          jobId: bid.jobId,
          homeownerId,
          contractorId: bid.contractorId,
          amount: bid.amount,
          timeline: bid.timeline,
          description: bid.proposal,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          depositAmount: bid.amount * 0.5, // 50% deposit
          finalAmount: bid.amount * 0.5,
          platformFee: bid.amount * 0.18,
          contractorNet: bid.amount * 0.82,
        },
      });

      // 3. Initialize escrow
      const escrow = await tx.escrowAccount.create({
        data: {
          contractId: contract.id,
          depositAmount: contract.depositAmount,
          finalAmount: contract.finalAmount,
          totalFees: contract.platformFee,
          status: 'ACTIVE',
        },
      });

      // 4. Update bid status
      await tx.bid.update({
        where: { id: bidId },
        data: { status: 'ACCEPTED' },
      });

      // 5. Reject other bids on this job
      await tx.bid.updateMany({
        where: {
          jobId: bid.jobId,
          id: { not: bidId },
          status: 'SUBMITTED',
        },
        data: { status: 'REJECTED' },
      });

      // 6. Close job to new bids
      await tx.job.update({
        where: { id: bid.jobId },
        data: { status: 'CONTRACT_AWARDED' },
      });

      return { contract, escrow, bidId };
    });
  }
}

// Notification flow
async handleBidAccepted(contractId: string, bidId: string) {
  const contract = await db.bidContract.findUnique({
    where: { id: contractId },
    include: { contractor: true, homeowner: true, job: true },
  });

  // Notify selected contractor
  await notificationService.sendEmail({
    to: contract.contractor.email,
    subject: '🎉 Your Bid Was Accepted!',
    template: 'bid-accepted',
    data: {
      jobTitle: contract.job.title,
      amount: contract.amount,
      depositAmount: contract.depositAmount,
      timeline: contract.timeline,
      contractUrl: `${process.env.APP_URL}/contracts/${contractId}`,
    },
  });

  // Notify homeowner
  await notificationService.sendEmail({
    to: contract.homeowner.email,
    subject: 'Contract Created - Next Steps',
    template: 'contract-created',
    data: {
      contractorName: `${contract.contractor.firstName} ${contract.contractor.lastName}`,
      contractId,
      amount: contract.amount,
      paymentUrl: `${process.env.APP_URL}/contracts/${contractId}/payment`,
    },
  });

  // Notify rejected bidders
  const rejectedBids = await db.bid.findMany({
    where: {
      jobId: contract.jobId,
      status: 'REJECTED',
    },
    include: { contractor: true },
  });

  for (const rejectedBid of rejectedBids) {
    await notificationService.sendEmail({
      to: rejectedBid.contractor.email,
      subject: 'Your Bid Was Not Selected',
      template: 'bid-rejected',
      data: {
        jobTitle: contract.job.title,
        selectedAmount: contract.amount,
        yourAmount: rejectedBid.amount,
      },
    });
  }
}
```

**API Endpoint:**

```typescript
// POST /api/bids/:bidId/accept
app.post(
  '/api/bids/:bidId/accept',
  authenticateToken,
  async (req, res) => {
    try {
      const result = await bidService.acceptBid(
        req.params.bidId,
        req.user.id // Must be homeowner
      );

      // Trigger notifications (async, don't block response)
      handleBidAccepted(result.contract.id, req.params.bidId).catch(console.error);

      res.json({
        success: true,
        contract: result.contract,
        message: 'Bid accepted and contract created',
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);
```

**Acceptance Criteria:**
- [ ] Bid validation (exists, submitted, job open)
- [ ] Contract created with correct amounts
- [ ] Escrow account initialized
- [ ] Other bids rejected automatically
- [ ] Job status updated to CONTRACT_AWARDED
- [ ] Notifications sent to contractor + homeowner + rejected bidders
- [ ] All in single database transaction
- [ ] Tests passing: all scenarios

---

## PHASE 4: JOB COMPLETION & DISPUTES (Weeks 7-8)

### 4.1 Job Completion Submission & Approval

**Task:** Implement completion workflow
**File:** `backend/services/jobCompletionService.ts`
**Priority:** CRITICAL
**Time:** 8 hours

```typescript
export class JobCompletionService {
  /**
   * Submit job completion with photos and notes
   */
  async submitCompletion(data: {
    contractId: string;
    contractorId: string;
    photos: string[]; // S3 URLs
    videos?: string[];
    notes: string;
    geolocation?: { latitude: number; longitude: number };
  }): Promise<any> {
    // 1. Validate contractor owns contract
    const contract = await db.bidContract.findUnique({
      where: { id: data.contractId },
    });

    if (contract.contractorId !== data.contractorId) {
      throw new Error('Only assigned contractor can submit completion');
    }

    if (contract.status !== 'ACCEPTED') {
      throw new Error('Contract not in active state for completion');
    }

    // 2. Validate photos
    if (!data.photos || data.photos.length === 0) {
      throw new Error('At least one completion photo required');
    }

    if (data.photos.length > 20) {
      throw new Error('Maximum 20 photos allowed');
    }

    // 3. Validate geolocation (if required)
    if (contract.requiresGeolocation && !data.geolocation) {
      throw new Error('Geolocation required for completion');
    }

    // 4. Create completion record
    const completion = await db.jobCompletion.create({
      data: {
        contractId: data.contractId,
        photos: data.photos,
        videos: data.videos || [],
        notes: data.notes,
        geolocation: data.geolocation,
        status: 'SUBMITTED',
        // 7-day dispute window
        disputeWindow: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // 5. Update contract status
    await db.bidContract.update({
      where: { id: data.contractId },
      data: { status: 'COMPLETION_SUBMITTED' },
    });

    // 6. Notify homeowner
    const homeowner = await db.user.findUnique({
      where: { id: contract.homeownerId },
    });

    await notificationService.sendEmail({
      to: homeowner.email,
      subject: 'Job Completion Submitted - Please Review',
      template: 'job-completion-submitted',
      data: {
        contractId: data.contractId,
        reviewUrl: `${process.env.APP_URL}/contracts/${data.contractId}/review`,
        photoCount: data.photos.length,
        disputeDeadline: completion.disputeWindow,
      },
    });

    return completion;
  }

  /**
   * Homeowner approves completion
   */
  async approveCompletion(
    completionId: string,
    homeownerId: string,
    rating: number,
    feedback: string
  ): Promise<any> {
    // 1. Get completion and verify ownership
    const completion = await db.jobCompletion.findUnique({
      where: { id: completionId },
      include: { contract: true },
    });

    if (completion.contract.homeownerId !== homeownerId) {
      throw new Error('Only homeowner can approve completion');
    }

    if (completion.status !== 'SUBMITTED') {
      throw new Error('Completion already resolved');
    }

    // 2. Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be 1-5');
    }

    // 3. Update completion
    const updated = await db.jobCompletion.update({
      where: { id: completionId },
      data: {
        status: 'APPROVED',
        rating,
        feedback,
        isDisputed: false,
      },
    });

    // 4. Create review
    const job = await db.job.findUnique({
      where: { id: completion.contract.jobId },
    });

    const review = await db.review.create({
      data: {
        authorId: homeownerId,
        jobId: job.id,
        rating,
        title: `${rating}-star review`,
        body: feedback,
        isVerified: true,
      },
    });

    // 5. Update contractor rating
    const allReviews = await db.review.findMany({
      where: { job: { postedBy: { contractsAsContractor: { some: {} } } } },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.user.update({
      where: { id: completion.contract.contractorId },
      data: {
        averageRating: avgRating,
        totalReviews: { increment: 1 },
      },
    });

    // 6. Update job status
    await db.job.update({
      where: { id: job.id },
      data: { status: 'COMPLETED' },
    });

    // 7. Release funds from escrow
    const escrow = await escrowService.releaseFinalPaymentToContractor({
      contractId: completion.contract.id,
      contractorId: completion.contract.contractorId,
      stripeAccountId: completion.contract.contractor.stripeAccountId,
      finalAmount: completion.contract.finalAmount,
      platformFee: completion.contract.platformFee,
    });

    // 8. Notifications
    await notificationService.sendEmail({
      to: completion.contract.contractor.email,
      subject: '✅ Job Approved - Payment Released',
      template: 'job-approved',
      data: {
        rating,
        feedback,
        paymentAmount: completion.contract.finalAmount,
      },
    });

    return { completion: updated, review, escrow };
  }

  /**
   * Homeowner disputes completion
   */
  async openDispute(
    completionId: string,
    homeownerId: string,
    reason: string,
    evidence: string[]
  ): Promise<any> {
    // 1. Validate
    const completion = await db.jobCompletion.findUnique({
      where: { id: completionId },
      include: { contract: { include: { job: true } } },
    });

    if (completion.contract.homeownerId !== homeownerId) {
      throw new Error('Only homeowner can dispute');
    }

    if (completion.status !== 'SUBMITTED') {
      throw new Error('Can only dispute new submissions');
    }

    if (new Date() > completion.disputeWindow) {
      throw new Error('Dispute window closed (7 days from submission)');
    }

    // 2. Create dispute
    const dispute = await db.dispute.create({
      data: {
        contractId: completion.contract.id,
        homeownerId,
        contractorId: completion.contract.contractorId,
        reason,
        homeownerEvidence: evidence,
        status: 'OPEN',
        mediationDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        responseDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      },
    });

    // 3. Update completion
    await db.jobCompletion.update({
      where: { id: completionId },
      data: { status: 'DISPUTED', isDisputed: true },
    });

    // 4. Hold funds in escrow (already there)
    await db.escrowAccount.update({
      where: { contractId: completion.contract.id },
      data: { status: 'DISPUTED' },
    });

    // 5. Notify contractor to respond
    await notificationService.sendEmail({
      to: completion.contract.contractor.email,
      subject: '⚠️  Job Completion Disputed - Your Response Needed',
      template: 'dispute-opened',
      data: {
        reason,
        responseDeadline: dispute.responseDeadline,
        responseUrl: `${process.env.APP_URL}/disputes/${dispute.id}/respond`,
      },
    });

    return dispute;
  }
}
```

**API Endpoints:**

```typescript
// POST /api/completions
app.post('/api/completions', authenticateToken, async (req, res) => {
  try {
    const completion = await jobCompletionService.submitCompletion({
      contractId: req.body.contractId,
      contractorId: req.user.id,
      photos: req.body.photos,
      videos: req.body.videos,
      notes: req.body.notes,
      geolocation: req.body.geolocation,
    });

    res.json({ success: true, completion });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/completions/:id/approve
app.post('/api/completions/:id/approve', authenticateToken, async (req, res) => {
  try {
    const result = await jobCompletionService.approveCompletion(
      req.params.id,
      req.user.id,
      req.body.rating,
      req.body.feedback
    );

    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/completions/:id/dispute
app.post('/api/completions/:id/dispute', authenticateToken, async (req, res) => {
  try {
    const dispute = await jobCompletionService.openDispute(
      req.params.id,
      req.user.id,
      req.body.reason,
      req.body.evidence
    );

    res.json({ success: true, dispute });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

**Acceptance Criteria:**
- [ ] Photo validation (minimum 1, max 20)
- [ ] Completion record created
- [ ] 7-day dispute window set
- [ ] Homeowner notified
- [ ] Approval updates rating + releases funds
- [ ] Dispute opens mediation process
- [ ] Escrow funds held during dispute
- [ ] Tests passing: all scenarios

---

## PHASE 5: TESTING & DEPLOYMENT (Weeks 9-10)

### 5.1 Unit & Integration Tests

**Critical Path Tests to Write:**
- [ ] Authentication (login, token validation, role enforcement)
- [ ] Payment (charge, refund, idempotency)
- [ ] Bid workflow (submit, accept, reject)
- [ ] Contract creation (from bid)
- [ ] Job completion (submit, approve, dispute)
- [ ] Escrow (deposit, final, refund)
- [ ] Notification delivery
- [ ] Database transactions (atomicity)

**Test Framework:** Jest + Supertest

```typescript
// Example test file: tests/payment.spec.ts

describe('Payment Processing', () => {
  describe('POST /api/payments/create-intent', () => {
    it('should create payment intent with valid contract', async () => {
      const contract = await createTestContract();

      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          contractId: contract.id,
          amount: 5000,
        });

      expect(res.status).toBe(200);
      expect(res.body.clientSecret).toBeDefined();
      expect(res.body.paymentIntentId).toBeDefined();
    });

    it('should reject with amount < $1.00', async () => {
      const contract = await createTestContract();

      const res = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({
          contractId: contract.id,
          amount: 0.50,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Minimum charge is $1.00');
    });

    it('should use idempotency key to prevent duplicates', async () => {
      // Same intent created twice should return same clientSecret
    });
  });

  describe('Webhook: charge.succeeded', () => {
    it('should record transaction and create escrow', async () => {
      const event = createStripeEvent('charge.succeeded', {
        id: 'ch_test123',
        amount: 500000, // $5000
        metadata: { contractId: 'contract_123' },
      });

      const res = await request(app)
        .post('/webhook/stripe')
        .set('stripe-signature', createValidSignature(event))
        .send(event);

      expect(res.status).toBe(200);

      const transaction = await db.transaction.findUnique({
        where: { stripeId: 'ch_test123' },
      });

      expect(transaction).toBeDefined();
      expect(transaction.status).toBe('COMPLETED');

      const escrow = await db.escrowAccount.findUnique({
        where: { contractId: 'contract_123' },
      });

      expect(escrow).toBeDefined();
      expect(escrow.status).toBe('HELD');
    });
  });
});
```

**Coverage Targets:**
- Payment paths: 100%
- Auth middleware: 100%
- Contract workflows: 95%+
- Error handling: 90%+
- Overall: 80%+

---

### 5.2 Load Testing

**Goal:** Verify system handles 500+ concurrent users

**Tools:** Apache JMeter or Artillery.io

```yaml
# load-test.yml
config:
  target: 'https://api.fairtradeworker.com'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 users/sec
      name: 'Warm up'
    - duration: 300
      arrivalRate: 50  # 50 users/sec
      rampTo: 100      # Ramp to 100
      name: 'Ramp up'
    - duration: 120
      arrivalRate: 100 # Sustain 100 users/sec
      name: 'Sustained'

scenarios:
  - name: 'Job Search + Bid Flow'
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: '{{ email }}'
            password: '{{ password }}'
          capture:
            json: '$.token'
            as: 'authToken'
      - get:
          url: '/api/jobs?category=plumbing&limit=50'
          headers:
            Authorization: 'Bearer {{ authToken }}'
      - post:
          url: '/api/bids'
          json:
            jobId: '{{ jobId }}'
            amount: '{{ amount }}'
```

**Expected Results:**
- Response time p95: <500ms
- Response time p99: <1s
- Error rate: <0.1%
- Database CPU: <70%
- Memory: <4GB

---

### 5.3 Security Testing

**OWASP Top 10 Checks:**
- [ ] SQL injection tests
- [ ] XSS payload testing
- [ ] CSRF token validation
- [ ] Authentication bypass attempts
- [ ] Authorization (role-based access)
- [ ] Data exposure checks
- [ ] Encryption validation

**Automated Security Scanning:**
```bash
# OWASP Dependency Check
npm audit

# SonarQube static analysis
sonar-scanner

# SAST scanning (if available)
```

---

### 5.4 CI/CD Pipeline Setup

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml

name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t fairtradeworker:${{ github.sha }} .

      - name: Push to registry
        run: |
          docker tag fairtradeworker:${{ github.sha }} fairtradeworker:latest
          docker push fairtradeworker:latest

      - name: Deploy to production
        run: |
          kubectl rollout restart deployment/fairtradeworker
          kubectl rollout status deployment/fairtradeworker

      - name: Smoke tests
        run: npm run test:smoke
```

---

## FINAL CHECKLIST BEFORE LAUNCH

```
SECURITY
☐ All passwords hashed (bcrypt)
☐ JWT tokens working with expiration
☐ RBAC middleware enforced on protected routes
☐ Email verification implemented
☐ Password reset workflow tested
☐ Stripe webhooks signature verified
☐ Input validation on all endpoints
☐ CORS properly configured
☐ HTTPS enforced in production
☐ Environment variables not in code
☐ Database backups automated
☐ Sentry error tracking working

PAYMENT & ESCROW
☐ Payment intent creation working
☐ Idempotency keys prevent double-charges
☐ Stripe Connect transfers working
☐ Escrow account created on payment
☐ Deposit release working
☐ Final payment release working
☐ Refund flow tested
☐ Transaction atomicity verified
☐ Fund release on job completion
☐ All transactions logged

MARKETPLACE
☐ Job posting creates records
☐ Bid submission with visibility rules
☐ Contractor can't see others' bids
☐ Bid acceptance creates contract
☐ Other bids auto-rejected
☐ Job status transitions working
☐ Contract creation initialized escrow
☐ Notifications sent on bid acceptance

JOB COMPLETION
☐ Photo upload validation
☐ Completion submission creates record
☐ Dispute window set (7 days)
☐ Homeowner approval releases funds
☐ Disputed completion holds funds
☐ Contractor can respond to dispute
☐ Dispute resolution distributes funds
☐ Rating updated on approval

TESTING
☐ Unit tests: 80%+ coverage
☐ Integration tests for critical paths
☐ Load test: 500 concurrent users
☐ Security tests passing
☐ End-to-end bid flow tested
☐ End-to-end payment flow tested
☐ Database backup/restore tested
☐ Rollback procedures tested

INFRASTRUCTURE
☐ Database backups automated (daily)
☐ Log aggregation working (ELK/CloudWatch)
☐ Error monitoring (Sentry) connected
☐ Performance monitoring configured
☐ Uptime monitoring active
☐ Auto-scaling configured
☐ CDN for static assets
☐ DNS configured with health checks

DOCUMENTATION
☐ API documentation (Swagger/OpenAPI)
☐ Database migration guide
☐ Deployment runbook
☐ Incident response procedures
☐ Security policies documented
☐ Architecture decision records
☐ Troubleshooting guide
☐ Developer setup guide

LAUNCH READINESS
☐ Staging environment matches production
☐ Data migration plan (if needed)
☐ Customer support playbooks written
☐ Legal/privacy policies finalized
☐ Terms of service accepted on signup
☐ GDPR compliance audit complete
☐ Insurance policies in place
☐ Communication plan for launch
☐ Rollback plan documented
☐ On-call team trained
```

---

## SUCCESS CRITERIA FOR EACH PHASE

### PHASE 1 (Weeks 1-2): Security & Infrastructure
- ✅ All passwords hashed
- ✅ Email verification working
- ✅ Password reset functional
- ✅ Stripe webhooks verified
- ✅ Sentry error tracking active
- ✅ Database backups automated
- **Launch Blocker Resolved:** YES

### PHASE 2 (Weeks 3-4): Payment Processing
- ✅ Payment intent creation (idempotent)
- ✅ Payment charge completion
- ✅ Escrow account creation
- ✅ Stripe transfers working
- ✅ Refund flow tested
- ✅ All transaction types logged
- **Payment System Ready:** YES

### PHASE 3 (Weeks 5-6): Bid & Contract
- ✅ Bid visibility rules enforced
- ✅ Bid acceptance workflow
- ✅ Contract auto-creation
- ✅ Other bids auto-rejected
- ✅ Notifications sent
- **Marketplace Core Ready:** YES

### PHASE 4 (Weeks 7-8): Job Completion
- ✅ Completion submission with photos
- ✅ Homeowner approval releases funds
- ✅ Dispute mechanism working
- ✅ Rating system updates contractor score
- **Revenue Loop Closed:** YES

### PHASE 5 (Weeks 9-10): Testing & Deploy
- ✅ Unit tests: 80%+ coverage
- ✅ Load tests: 500 users
- ✅ Security tests: OWASP checks
- ✅ CI/CD pipeline automated
- ✅ Monitoring & alerting active
- **Production Ready:** YES

---

## ESTIMATED EFFORT

| Phase | Tasks | FTE-Weeks | Developers |
|-------|-------|-----------|-----------|
| 1 | Security & Infra | 3-4 | 1-2 |
| 2 | Payment | 4-5 | 2 |
| 3 | Bid/Contract | 3-4 | 2 |
| 4 | Completion | 4-5 | 2 |
| 5 | Testing & Deploy | 2-3 | 1-2 |
| **TOTAL** | | **16-21 FTE-weeks** | **3 full-time** |

**Timeline:** 8-10 weeks with 3 senior engineers (concurrent phases)

---

**Document Status:** FINAL - Ready for Implementation
**Start Date:** January 6, 2026
**Target Launch:** March 2026
**Owner:** Engineering Lead

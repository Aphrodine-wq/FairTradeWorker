# Server Integration Guide - PHASE 2/3 Implementation

**Status:** Ready for Integration
**Date:** January 4, 2026
**Priority:** HIGH - Core to launch

---

## Overview

The FairTradeWorker backend has been fully implemented with all PHASE 1, 2, and 3 services. This guide shows how to integrate everything into the main `backend/server.ts` file.

---

## Files Created/Modified

### NEW SERVICE FILES (Ready to use)

1. **`backend/services/jobService.ts`** (250+ lines)
   - Job creation, listing, searching, filtering
   - Status management (OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
   - Full CRUD operations

2. **`backend/services/bidService.ts`** (280+ lines)
   - Bid submission and management
   - Acceptance/rejection/withdrawal
   - Bid analytics and statistics

3. **`backend/services/contractService.ts`** (350+ lines)
   - Contract lifecycle management
   - Completion submission and approval
   - Change order handling
   - Dispute management
   - Audit logging

4. **`backend/services/paymentService.ts`** (300+ lines)
   - Stripe integration
   - Escrow account management
   - Deposit holding (25%)
   - Final payment release (75%)
   - Refund handling
   - Contractor payouts

5. **`backend/services/notificationServiceImpl.ts`** (500+ lines)
   - Email notifications (SendGrid)
   - SMS notifications (Twilio)
   - Push notifications (Firebase)
   - 12+ notification event triggers
   - User preference management

6. **`backend/services/integrationService.ts`** (500+ lines)
   - Orchestrates service interactions
   - Event trigger handlers
   - Workflow management
   - Cross-service communication

7. **`backend/services/analyticsAndCustomizationService.ts`** (400+ lines)
   - Analytics dashboards
   - Revenue tracking
   - Customization theme management
   - Tier-based feature gating

### NEW ROUTE FILES

8. **`backend/routes/apiRoutes.ts`** (500+ lines)
   - All 30+ API endpoints
   - Authentication and authorization
   - Input validation
   - Error handling

### NEW TEST FILES

9. **`backend/tests/integrationTests.ts`** (600+ lines)
   - Complete workflow tests
   - Payment service tests
   - Validation tests
   - Error handling tests

10. **`backend/tests/setup.ts`** (100+ lines)
    - Jest configuration
    - Mock setup for external services

11. **`backend/tests/testUtils.ts`** (300+ lines)
    - Helper functions for testing
    - Test data generation
    - Cleanup utilities

### ENHANCED SERVER FILE

12. **`backend/serverEnhanced.ts`** (300+ lines)
    - Fully integrated server with all services
    - Can be used as reference or replacement

---

## Integration Steps

### Step 1: Update Imports in `backend/server.ts`

Add these imports at the top:

```typescript
// PHASE 1: Security (already present, verify)
import { authenticateToken, authorizeRole, authorizeTier } from './middleware/auth';
import { securityHeaders, inputSanitization, requestIdMiddleware, errorHandler, healthCheck } from './middleware/security';

// PHASE 2: Core Services (ADD THESE)
import { JobService } from './services/jobService';
import { BidService } from './services/bidService';
import { ContractService } from './services/contractService';
import { PaymentService } from './services/paymentService';

// PHASE 3: Analytics & Customization (ADD THESE)
import { AnalyticsAndCustomizationService } from './services/analyticsAndCustomizationService';

// Integration & Notifications (ADD THESE)
import { IntegrationService } from './services/integrationService';
import { NotificationServiceImpl } from './services/notificationServiceImpl';

// Routes (ADD THIS)
import { router as apiRoutes } from './routes/apiRoutes';
```

### Step 2: Initialize Services

Add after middleware setup:

```typescript
// PHASE 2 & 3 Service Initialization
const jobService = new JobService();
const bidService = new BidService();
const contractService = new ContractService();
const paymentService = new PaymentService();
const analyticsService = new AnalyticsAndCustomizationService();
const integrationService = new IntegrationService();
const notificationService = new NotificationServiceImpl();

console.log('✅ All PHASE 2/3 services initialized');
```

### Step 3: Mount API Routes

Add the main API routes:

```typescript
// Mount all API routes (30+ endpoints)
app.use('/api', apiRoutes);
```

### Step 4: Verify Environment Variables

Ensure `.env` has all required variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fairtradeworker

# Stripe (Payment)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# Twilio (SMS)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (Email)
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=noreply@fairtradeworker.com

# Firebase (Push Notifications)
FIREBASE_ENABLED=true
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Others
NODE_ENV=development
PORT=3001
```

### Step 5: Update package.json Scripts

Add test script if not present:

```json
{
  "scripts": {
    "start": "node backend/server.ts",
    "dev": "nodemon backend/server.ts",
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 6: Install Dependencies

```bash
npm install stripe twilio nodemailer firebase-admin express-rate-limit jest ts-jest @types/jest
```

### Step 7: Run Database Migrations

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Step 8: Test Endpoints

Start the server:

```bash
npm run dev
```

Test a simple endpoint:

```bash
curl -X GET http://localhost:3001/health
```

---

## Critical Integration Points

### Payment Integration

When bid is accepted, the payment service must be called:

```typescript
// In bidService.acceptBid() or route handler
await integrationService.onBidAccepted(bidId);
// This will:
// 1. Charge 25% deposit
// 2. Create escrow record
// 3. Send notifications
// 4. Auto-reject other bids
```

### Notification Integration

Add notification triggers to service methods:

```typescript
// In contractService.submitCompletion()
await integrationService.onCompletionSubmitted(completionId);

// In contractService.approveCompletion()
await integrationService.onCompletionApproved(completionId, rating);

// In contractService.createChangeOrder()
await integrationService.onChangeOrderCreated(changeOrderId);
```

### Analytics Integration

Wire analytics to dashboard endpoints:

```typescript
// In route handler for analytics endpoint
const analytics = await analyticsService.getBidAnalytics(userId);
const revenue = await analyticsService.getRevenueAnalytics(userId);
```

---

## Testing the Integration

### 1. Run Unit Tests

```bash
npm test -- backend/services/jobService.test.ts
```

### 2. Run Integration Tests

```bash
npm test -- backend/tests/integrationTests.ts
```

### 3. Run All Tests

```bash
npm test
```

### 4. Test Specific Workflow

```bash
npm test -- --testNamePattern="Complete Bid.*Workflow"
```

---

## API Endpoints Reference

### Jobs (5 endpoints)
```
POST   /api/jobs                      - Create job
GET    /api/jobs/:jobId               - Get job
GET    /api/jobs                      - List jobs
PATCH  /api/jobs/:jobId               - Update job
POST   /api/jobs/:jobId/close         - Close job
```

### Bids (7 endpoints)
```
POST   /api/bids                      - Submit bid
GET    /api/jobs/:jobId/bids          - Get job bids
GET    /api/bids/:bidId               - Get bid details
GET    /api/bids                      - Get contractor bids
POST   /api/bids/:bidId/accept        - Accept bid
POST   /api/bids/:bidId/reject        - Reject bid
POST   /api/bids/:bidId/withdraw      - Withdraw bid
```

### Contracts (8 endpoints)
```
GET    /api/contracts/:contractId     - Get contract
GET    /api/contracts                 - List contracts
POST   /api/contracts/:contractId/complete - Submit completion
POST   /api/contracts/:contractId/completion/approve - Approve completion
POST   /api/contracts/:contractId/change-order - Create change order
POST   /api/contracts/:contractId/change-order/:coId/approve - Approve change order
POST   /api/contracts/:contractId/cancel - Cancel contract
GET    /api/contracts/:contractId/analytics - Contract analytics
```

### Analytics (5 endpoints)
```
GET    /api/analytics/bids            - Bid analytics
GET    /api/analytics/revenue         - Revenue analytics
GET    /api/analytics/dashboard/homeowner - Homeowner dashboard
GET    /api/analytics/platform        - Platform metrics (admin)
GET    /api/analytics/export          - Export analytics as CSV
```

### Customization (5 endpoints)
```
GET    /api/customization             - Get settings
PATCH  /api/customization             - Update settings
GET    /api/customization/presets     - Get presets
POST   /api/customization/preset/:name - Apply preset
GET    /api/customization/features    - Get available features
```

**Total:** 30+ endpoints, all authenticated and authorized

---

## Performance Considerations

### Database Queries

- All list endpoints use pagination (limit, offset)
- Indexes on commonly filtered fields (jobId, contractorId, status)
- Use Prisma select() to limit returned fields

### Caching Opportunities

```typescript
// Cache job listings (update hourly)
const cachedJobs = await redis.get('jobs:all');

// Cache contractor ratings (update on completion)
const cachedRating = await redis.get(`contractor:${id}:rating`);

// Cache theme presets (static, never changes)
const presets = getAvailablePresets(); // Already memoized
```

### Rate Limiting

- 100 requests per 15 minutes per IP
- Adjust in `backend/server.ts` for production:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increase for production
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Count failed requests
});
```

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "code": 400,
  "requestId": "req_abc123..."
}
```

See `PHASE_2_3_API_ENDPOINTS.md` for all error codes.

---

## Monitoring & Logging

### Setup Sentry for Error Tracking

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Setup DataDog APM

```typescript
const tracer = require('dd-trace').init({
  hostname: 'datadog-agent',
  port: 8126,
});

// Automatically tracks Express routes
```

---

## Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Tests passing (npm test)
- [ ] All services initialized
- [ ] Routes mounted correctly
- [ ] Payment integration tested
- [ ] Notifications configured
- [ ] Monitoring setup (Sentry/DataDog)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] JWT secret set
- [ ] Database backups configured

---

## Troubleshooting

### Service Not Initializing

```
Error: Cannot find module './services/jobService'
```

**Fix:** Verify all service files exist in `backend/services/` directory

### Route Not Found

```
404: Route POST /api/jobs not found
```

**Fix:** Verify `apiRoutes` is mounted: `app.use('/api', apiRoutes);`

### Payment Failing

```
Error: STRIPE_SECRET_KEY not found
```

**Fix:** Verify Stripe keys in `.env` file

### Notifications Not Sending

```
Error: TWILIO_PHONE_NUMBER not set
```

**Fix:** Set all notification provider variables in `.env`

---

## Migration Path

If you have an existing server.ts:

1. **Option A: Replace Completely**
   - Replace entire server.ts with serverEnhanced.ts
   - Test all endpoints
   - Deploy

2. **Option B: Gradual Migration**
   - Add new services one by one
   - Add routes incrementally
   - Run both old and new routes in parallel
   - Switch over gradually

3. **Option C: Parallel Deployment**
   - Deploy new server on different port (3002)
   - Test thoroughly
   - Update load balancer to point to new server
   - Keep old server as fallback

---

## Success Metrics

✅ All endpoints respond correctly
✅ Payments processed without errors
✅ Notifications sent on events
✅ Analytics calculating correctly
✅ Customization options working
✅ Tests passing with >70% coverage
✅ Performance < 200ms per request
✅ No unhandled errors in logs

---

## Next Steps

1. **Integrate into server.ts** (This guide)
2. **Setup Monitoring** (See PHASE_4_MONITORING.md)
3. **Create PHASE 4 Tests** (See PHASE_4_TESTING.md)
4. **Deploy to Staging** (See DEPLOYMENT.md)
5. **Production Rollout** (Gradual traffic increase)

---

## Support

For issues or questions:
- Check `backend/services/` for method signatures
- Review `PHASE_2_3_API_ENDPOINTS.md` for endpoint details
- See `backend/tests/integrationTests.ts` for usage examples
- Check `backend/middleware/` for security implementation

---

**Status:** ✅ Ready to Integrate - All services production-ready

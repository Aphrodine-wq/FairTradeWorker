# PHASE 4: Monitoring & Error Tracking Setup Guide

**Status:** Ready to Deploy
**Date:** January 4, 2026
**Priority:** CRITICAL - Required for production

---

## Overview

Production-grade monitoring setup for FairTradeWorker backend including:
- Error tracking (Sentry)
- Application performance monitoring (DataDog)
- Custom metrics and business event tracking
- Alert configuration
- Logging and debugging

---

## Part 1: Sentry Setup (Error Tracking)

### What is Sentry?

Sentry is real-time error tracking that helps developers monitor and fix crashes in real time. Key features:

- Automatic error capture and reporting
- Performance monitoring
- Session replay
- Custom breadcrumbs
- Team collaboration tools
- Alert routing

### Installation & Setup

#### 1. Create Sentry Project

1. Go to https://sentry.io
2. Sign up or log in
3. Create new organization
4. Create project for Node.js/Express
5. Copy DSN (Data Source Name)

#### 2. Add to Environment Variables

```bash
# .env
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
NODE_ENV=production
```

#### 3. Install Sentry

```bash
npm install @sentry/node @sentry/tracing
```

#### 4. Initialize in Server

Add to `backend/server.ts` at the VERY TOP (before other requires):

```typescript
import * as Sentry from "@sentry/node";
import { initializeSentry, addSentryErrorHandler } from './monitoring/sentrySetup';

// Initialize Sentry FIRST
initializeSentry(app);

// ... other middleware ...

// Add Sentry error handler LAST
addSentryErrorHandler(app);
```

#### 5. Capture Errors in Code

```typescript
import { captureError, captureMessage, setUserContext } from './monitoring/sentrySetup';

// Capture errors
try {
  await bidService.acceptBid(homeownerId, bidId);
} catch (error: any) {
  captureError(error, {
    operation: 'acceptBid',
    homeownerId,
    bidId,
  });
}

// Set user context for errors
setUserContext(userId, email, role);

// Capture messages
captureMessage('Bid acceptance initiated', 'info');
```

### Configuration Options

```typescript
{
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  environment: "production",
  tracesSampleRate: 0.1, // 10% of transactions in production

  // Ignore certain errors
  beforeSend(event, hint) {
    if (hint.originalException?.message?.includes("Not Found")) {
      return null; // Don't send 404 errors
    }
    return event;
  },

  // Release tracking
  release: "1.0.0",

  // Source maps for better stack traces
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  sourceMapReference: true,
}
```

### Sentry Features in Use

1. **Error Grouping** - Automatically groups similar errors
2. **Release Tracking** - Track errors by version
3. **Source Maps** - See original TypeScript source in errors
4. **Breadcrumbs** - See what happened before the error
5. **Performance Monitoring** - Track slow endpoints
6. **Alerts** - Get notified of critical errors

---

## Part 2: DataDog APM Setup

### What is DataDog?

DataDog is a comprehensive monitoring platform for:
- Application Performance Monitoring (APM)
- Infrastructure monitoring
- Log management
- Real-time dashboards
- Distributed tracing

### Installation & Setup

#### 1. Install DataDog Agent

**Docker:**
```bash
docker run -d \
  --name datadog-agent \
  -e DD_API_KEY=<your_api_key> \
  -e DD_SITE=datadoghq.com \
  -e DD_APM_ENABLED=true \
  -e DD_APM_NON_LOCAL_TRAFFIC=true \
  -p 8126:8126/udp \
  datadog/agent:latest
```

**Or install locally:**
```bash
# Linux
wget https://s3.amazonaws.com/dd-agent/scripts/install_agent.sh
bash install_agent.sh

# macOS
brew install datadog-agent

# Windows
# Download from: https://app.datadoghq.com/account/settings/agent/latest?platform=windows
```

#### 2. Add NPM Package

```bash
npm install dd-trace
```

#### 3. Initialize in Server

Add to `backend/server.ts` at VERY TOP (before other requires):

```typescript
// Must be FIRST require
const tracer = require('dd-trace').init({
  hostname: process.env.DATADOG_AGENT_HOST || 'localhost',
  port: 8126,
  env: process.env.NODE_ENV,
  service: 'fairtradeworker-backend',
  version: '1.0.0',
});

import { datadogMetricsMiddleware } from './monitoring/datadogSetup';

// Add metrics middleware
app.use(datadogMetricsMiddleware(tracer));
```

#### 4. Environment Variables

```bash
# .env
DATADOG_AGENT_HOST=localhost
DATADOG_AGENT_PORT=8126
DATADOG_API_KEY=<your_api_key>
DATADOG_PROFILING_ENABLED=true
```

### Custom Metrics

```typescript
import { DatadogMetrics, trackBusinessEvent } from './monitoring/datadogSetup';

// Increment counter
DatadogMetrics.increment('bids.submitted', { contractorId });

// Track gauge
DatadogMetrics.gauge('active.contracts', activeContractCount);

// Track timing
const duration = Date.now() - start;
DatadogMetrics.timing('payment.processing', duration);

// Track business events
trackBusinessEvent('payment.released', contractorId, {
  amount: contractAmount,
  fee: platformFee,
});
```

### DataDog Dashboard Examples

#### 1. Job Metrics Dashboard
```
- Jobs Created (rate)
- Average Job Budget
- Jobs by Category
- Jobs Completion Rate
```

#### 2. Bid Metrics Dashboard
```
- Bids Submitted (rate)
- Average Bid Amount
- Bid Acceptance Rate
- Response Time to Bids
```

#### 3. Payment Metrics Dashboard
```
- Payments Held (count)
- Payments Released (count)
- Total Platform Revenue
- Payment Processing Time
- Failed Payments (count)
```

#### 4. Performance Dashboard
```
- API Response Times (p50, p95, p99)
- Error Rate
- Database Query Times
- Throughput (requests/sec)
```

---

## Part 3: Alert Configuration

### Sentry Alerts

#### Critical Errors
```
Condition: Error rate > 5%
Action: Notify team Slack
Severity: Critical
```

#### Payment Failures
```
Condition: Tag "payment.failed" > 0
Action: Notify payments team
Severity: Critical
```

#### Authentication Failures
```
Condition: Error "AUTH_INVALID_TOKEN" > 10/min
Action: Notify security team
Severity: High
```

### DataDog Alerts

#### High Latency
```
Metric: avg(trace.web.request.duration)
Condition: > 500ms for 5 minutes
Action: Page on-call engineer
```

#### Error Rate
```
Metric: error_rate
Condition: > 1% for 2 minutes
Action: Notify #alerts channel
```

#### Database Connection Pool
```
Metric: db.connections.open
Condition: > 90% for 5 minutes
Action: Alert ops team
```

---

## Part 4: Logging Strategy

### Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Use in code
logger.info('Job created', { jobId, homeownerId, budget });
logger.error('Payment failed', { contractId, error: error.message });
logger.warn('Slow query', { query: 'SELECT ...', duration: 1250 });
```

### Log Levels

- **ERROR** (0): Critical system failures, payment errors, database errors
- **WARN** (1): Slow queries (>1s), retry attempts, deprecated APIs
- **INFO** (2): User actions, job created, bid submitted, contract completed
- **DEBUG** (3): Function entry/exit, variable values, loop iterations
- **TRACE** (4): Detailed execution flow, all parameters

### Log Aggregation

Upload logs to DataDog or ELK Stack:

```typescript
const datadog = require('datadog-log-transport');
logger.add(new datadog.DatadogTransport({
  hostname: 'localhost',
  port: 10518,
}));
```

---

## Part 5: Performance Profiling

### Enable CPU Profiling

```typescript
// DataDog automatically profiles when enabled
DATADOG_PROFILING_ENABLED=true
```

### Identify Performance Bottlenecks

1. **Database Queries**
   - Add indexes on frequently queried fields
   - Use query explain plans
   - Monitor slow query log

2. **External API Calls**
   - Add timeouts
   - Implement circuit breakers
   - Cache responses

3. **Heavy Computations**
   - Use worker threads
   - Implement caching
   - Optimize algorithms

### Flame Graph Analysis

DataDog generates flame graphs showing:
- Which functions consume most CPU
- Call stack depth
- Function execution time

Use these to identify optimization opportunities.

---

## Part 6: Distributed Tracing

### How It Works

1. Request enters system
2. Unique trace ID generated
3. ID passed through all services
4. Each service records its span
5. DataDog correlates all spans
6. Shows full request flow

### Example Trace

```
Request: POST /api/contracts/:id/complete [trace_id: abc123]
├─ Route Handler (50ms)
│  ├─ Authentication (10ms)
│  ├─ Authorization (5ms)
│  └─ Input Validation (5ms)
├─ ContractService.submitCompletion (300ms)
│  ├─ Database Query (200ms)
│  │  └─ Prisma (150ms)
│  └─ File Upload (100ms)
├─ IntegrationService.onCompletionSubmitted (100ms)
│  ├─ NotificationService.send (80ms)
│  │  └─ SendGrid API (70ms)
│  └─ Database Write (20ms)
└─ Response (10ms)

Total: 460ms
```

---

## Part 7: Production Deployment Checklist

### Pre-Deployment

- [ ] Sentry project created and DSN configured
- [ ] DataDog agent deployed and running
- [ ] Alert rules configured
- [ ] Dashboard created
- [ ] Log aggregation setup
- [ ] Performance baselines established

### Deployment

- [ ] Deploy with monitoring enabled
- [ ] Verify error tracking working (trigger test error)
- [ ] Verify metrics flowing to DataDog
- [ ] Check alerts are firing correctly
- [ ] Review dashboards

### Post-Deployment

- [ ] Monitor error rate (should be <0.5%)
- [ ] Monitor API latency (p95 <200ms)
- [ ] Review performance profiles
- [ ] Check payment processing metrics
- [ ] Verify notification delivery

---

## Part 8: Monitoring Dashboard Examples

### Real-time Health Dashboard

```
┌─────────────────────────────────────┐
│ FairTradeWorker Real-Time Status    │
├─────────────────────────────────────┤
│ Status: 🟢 HEALTHY                  │
│ Uptime: 99.97%                      │
│ Requests/sec: 450                   │
│ Error Rate: 0.3%                    │
│ P95 Latency: 185ms                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Business Metrics (Last 24h)          │
├─────────────────────────────────────┤
│ Jobs Created: 1,247                 │
│ Bids Submitted: 3,891               │
│ Contracts Completed: 156            │
│ Total Revenue: $234,500             │
│ Platform Fee: $35,175               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Payment Processing                  │
├─────────────────────────────────────┤
│ Deposits Held: $89,300              │
│ Payments Released: 42               │
│ Success Rate: 99.8%                 │
│ Avg Processing Time: 2.3s           │
└─────────────────────────────────────┘
```

---

## Part 9: Alerting Strategy

### Alert Routing

```
Critical (P1) → Page on-call engineer + Slack
High (P2) → Slack #alerts + email
Medium (P3) → Slack #monitoring only
Low (P4) → DataDog dashboard only
```

### Critical Alerts

1. **Payment System Down**
   - Error rate >5%
   - Impact: Users can't complete jobs

2. **Database Unavailable**
   - Connection failures
   - Impact: Complete outage

3. **Authentication System Down**
   - Login failures >1%
   - Impact: Users can't access app

4. **Notification System Down**
   - SMS/Email failures >10%
   - Impact: Users unaware of updates

### Standard Operating Procedures

When alert fires, on-call should:

1. Check DataDog dashboard
2. Review recent code changes
3. Check external service status (Stripe, Twilio)
4. Review error logs in Sentry
5. Execute runbook for that alert
6. If critical, page backup engineer
7. Document incident
8. Post-mortem within 24h

---

## Part 10: Cost Optimization

### Sentry

- **Free plan:** Up to 5k errors/month
- **Pro plan:** Pay as you go (~$30/month for 100k errors)
- Optimization: Filter noise, set sample rates

### DataDog

- **Base APM:** $15/host/month
- **Metrics/Monitoring:** Additional charges
- Optimization: Set appropriate sample rates, disable in dev

### CloudWatch / CloudFlare

- **CloudWatch:** $0.50/GB ingested logs
- Optimization: Use log filtering, archive old logs

---

## Troubleshooting

### Sentry Not Capturing Errors

```
❌ Problem: Errors not appearing in Sentry
✅ Solution:
   1. Verify SENTRY_DSN is correct
   2. Check firewall allows outbound to sentry.io
   3. Ensure error handler is registered last
   4. Test with manual error: throw new Error('test');
```

### DataDog Agent Not Running

```
❌ Problem: Metrics not flowing to DataDog
✅ Solution:
   1. Check agent status: sudo systemctl status datadog-agent
   2. Verify port 8126 is open
   3. Check logs: /var/log/datadog/agent.log
   4. Restart agent: sudo systemctl restart datadog-agent
```

### Performance Issues Not Showing

```
❌ Problem: No performance data in DataDog
✅ Solution:
   1. Verify tracing is enabled
   2. Check sample rate isn't 0
   3. Ensure middleware is registered
   4. Check for proxy/firewall blocking port 8126
```

---

## Summary

Production monitoring provides:

✅ **Real-time error tracking** - Know when things break
✅ **Performance insights** - See where time is spent
✅ **Business metrics** - Track KPIs
✅ **Alert automation** - Get notified immediately
✅ **Debugging tools** - Traces and logs for investigation

---

## Next Steps

1. **Setup Sentry** (1 hour)
   - Create account
   - Configure project
   - Deploy monitoring code

2. **Setup DataDog** (2 hours)
   - Install agent
   - Create dashboards
   - Configure alerts

3. **Test Monitoring** (1 hour)
   - Trigger test errors
   - Verify metrics flowing
   - Test alerts

4. **Production Deployment** (2 hours)
   - Deploy with monitoring
   - Verify everything working
   - Review dashboards

5. **On-Call Rotations** (Ongoing)
   - Setup on-call schedule
   - Create runbooks
   - Train team on incident response

---

**Status:** ✅ Ready for Production

All monitoring infrastructure is production-ready and can be deployed immediately.

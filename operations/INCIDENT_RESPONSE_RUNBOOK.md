# FairTradeWorker Incident Response Runbook

**Version:** 1.0
**Last Updated:** January 5, 2026
**Status:** Production Ready

---

## 1. Overview

This runbook provides step-by-step procedures for responding to common production incidents. All team members should be familiar with these procedures before deployment.

### Quick Contact
- **On-Call Lead:** `[CONFIGURE IN ENVIRONMENT]`
- **Escalation Path:** Team Lead → Engineering Manager → VP Engineering
- **Communication Channel:** Slack #incidents

---

## 2. Critical Incidents

### 2.1 Application Down (5XX Errors > 50% of traffic)

**Severity:** CRITICAL
**Response Time:** Immediate (< 5 minutes)

**Detection:**
- CloudWatch alarm: "System Unhealthy - Composite"
- Sentry: Massive spike in error rate
- ALB shows 5XX > 10/minute

**Response Steps:**

1. **Acknowledge Incident**
   ```bash
   # Post to #incidents channel
   Incident: Application Down
   Detection Time: [timestamp]
   Severity: CRITICAL
   ```

2. **Check System Health**
   ```bash
   # SSH to bastion host (if available)
   aws ecs describe-services --cluster fairtradeworker-cluster --services fairtradeworker-api

   # Check task status
   aws ecs list-tasks --cluster fairtradeworker-cluster
   aws ecs describe-tasks --cluster fairtradeworker-cluster --tasks [task-ids]
   ```

3. **Review Recent Changes**
   - Check GitHub Actions deployments in last 30 minutes
   - Review git log for recent commits
   - Check CloudWatch logs for error messages

4. **Immediate Action: Scale Down & Restart**
   ```bash
   # Force new deployment to restart tasks
   aws ecs update-service \
     --cluster fairtradeworker-cluster \
     --service fairtradeworker-api \
     --force-new-deployment
   ```

5. **If Issue Persists: Rollback**
   ```bash
   # Retrieve previous task definition
   aws ecs describe-task-definition \
     --task-definition fairtradeworker-api:$(expr $(aws ecs describe-services \
       --cluster fairtradeworker-cluster \
       --services fairtradeworker-api \
       --query 'services[0].taskDefinition' \
       --output text) - 1)

   # Update service to previous version
   aws ecs update-service \
     --cluster fairtradeworker-cluster \
     --service fairtradeworker-api \
     --task-definition fairtradeworker-api:[PREVIOUS-VERSION]
   ```

6. **Monitor Recovery**
   - Watch CloudWatch dashboards for 10 minutes
   - Verify error rate < 1%
   - Check Sentry for new errors

7. **Post-Incident**
   - Collect logs from CloudWatch
   - Create GitHub issue for root cause analysis
   - Schedule incident review meeting

---

### 2.2 Database Connection Failures

**Severity:** CRITICAL
**Response Time:** < 5 minutes

**Detection:**
- CloudWatch alarm: "RDS Connections > 160"
- Sentry: "ECONNREFUSED" errors spiking
- Application logs: "connect ECONNREFUSED"

**Response Steps:**

1. **Check RDS Status**
   ```bash
   aws rds describe-db-instances --db-instance-identifier fairtradeworker-db

   # Expected status: "available"
   # Check AvailabilityZone for unexpected changes
   ```

2. **Check Connection Pooling**
   ```bash
   # Connect to database and check active connections
   psql -h [RDS-ENDPOINT] -U [user] -d fairtradeworker \
     -c "SELECT count(*) FROM pg_stat_activity;"

   # If > 150 connections:
   # 1. Identify long-running queries
   psql -c "SELECT pid, usename, state, query FROM pg_stat_activity WHERE state != 'idle';"

   # 2. Kill idle connections
   psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';"
   ```

3. **Scale Down Application**
   ```bash
   # Reduce ECS task count to free connections
   aws ecs update-service \
     --cluster fairtradeworker-cluster \
     --service fairtradeworker-api \
     --desired-count 1
   ```

4. **Restart RDS (if necessary)**
   ```bash
   # WARNING: This causes 1-2 minute downtime
   aws rds reboot-db-instance --db-instance-identifier fairtradeworker-db
   ```

5. **Scale Back Up**
   ```bash
   # Once RDS is healthy, scale back to normal
   aws ecs update-service \
     --cluster fairtradeworker-cluster \
     --service fairtradeworker-api \
     --desired-count 5
   ```

---

### 2.3 Payment Processing Failures

**Severity:** HIGH
**Response Time:** < 15 minutes

**Detection:**
- CloudWatch alarm: "Payment Failures > 10/5min"
- Sentry: Stripe API errors
- Customer reports: Payment rejections

**Response Steps:**

1. **Verify Stripe Status**
   ```bash
   # Check Stripe status page
   # https://status.stripe.com/

   # Check API keys in Secrets Manager
   aws secretsmanager get-secret-value \
     --secret-id /fairtradeworker/production/stripe-secret-key
   ```

2. **Review Recent Errors**
   ```bash
   # Check Sentry for error pattern
   # Filter by "Payment" or "Stripe"
   # Common issues:
   # - Webhook signature invalid
   # - API key expired
   # - Rate limiting (Stripe)
   # - Insufficient funds
   ```

3. **Verify Webhook Configuration**
   ```bash
   # Check webhook endpoint is registered in Stripe
   # curl -H "Authorization: Bearer [TEST-KEY]" https://api.stripe.com/v1/webhook_endpoints

   # Endpoint should be: https://api.fairtradeworker.com/webhooks/stripe
   ```

4. **If Webhook Issues**
   ```bash
   # Re-register webhook endpoint in Stripe dashboard
   # 1. Go to Stripe Dashboard → Developers → Webhooks
   # 2. Delete old endpoint if exists
   # 3. Add new endpoint: https://api.fairtradeworker.com/webhooks/stripe
   # 4. Copy signing secret to Secrets Manager
   ```

5. **Test Payment Flow**
   ```bash
   # Use Stripe test card: 4242 4242 4242 4242
   curl -X POST http://localhost:3000/api/payments/confirm \
     -H "Content-Type: application/json" \
     -d '{
       "jobId": "test-job-123",
       "amount": 5000,
       "paymentMethodId": "pm_test_..."
     }'
   ```

---

## 3. High-Severity Incidents

### 3.1 Memory Leak / High Memory Usage

**Severity:** HIGH
**Response Time:** < 30 minutes

**Detection:**
- CloudWatch: Memory utilization > 85% sustained
- ECS: Tasks getting OOMKilled

**Response Steps:**

1. **Identify Memory Trend**
   ```bash
   # Pull ECS logs for OOM indicators
   aws logs tail /ecs/fairtradeworker-api --follow
   ```

2. **Restart Affected Task**
   ```bash
   # Force new deployment (rolling restart)
   aws ecs update-service \
     --cluster fairtradeworker-cluster \
     --service fairtradeworker-api \
     --force-new-deployment
   ```

3. **Profile Heap (if issue persists)**
   ```bash
   # Enable heap snapshots temporarily
   NODE_OPTIONS="--expose-gc" npm start

   # Or use clinic.js
   clinic doctor -- node dist/server.js
   ```

4. **Increase Memory Allocation**
   ```bash
   # Update task definition to 3GB memory
   aws ecs register-task-definition \
     --family fairtradeworker-api \
     --memory 3072

   # Update service
   aws ecs update-service \
     --cluster fairtradeworker-cluster \
     --service fairtradeworker-api \
     --task-definition fairtradeworker-api:LATEST
   ```

---

### 3.2 High CPU Usage

**Severity:** HIGH
**Response Time:** < 30 minutes

**Detection:**
- CloudWatch: CPU > 80% sustained
- Response times degrading
- Requests queuing

**Response Steps:**

1. **Scale Up Immediately**
   ```bash
   aws ecs update-service \
     --cluster fairtradeworker-cluster \
     --service fairtradeworker-api \
     --desired-count 10  # Maximum
   ```

2. **Identify CPU Spike**
   - Check CloudWatch logs for unusual requests
   - Review Sentry for slow transactions
   - Check if load tests are running accidentally

3. **Optimize or Throttle**
   ```bash
   # Increase rate limiting if needed
   # Or disable expensive operations temporarily

   # Check for slow queries
   psql -h [RDS] -U fairtradeworker \
     -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
   ```

---

## 4. Medium-Severity Incidents

### 4.1 High Error Rate (> 5% but < 50%)

**Severity:** MEDIUM
**Response Time:** < 1 hour

**Response Steps:**

1. **Identify Error Pattern**
   ```bash
   # Check Sentry for common errors
   # Look for:
   # - Timeout errors
   # - Database errors
   # - Third-party API failures
   ```

2. **Partial Rollback**
   - If errors correlate to recent deploy, rollback
   - If errors are widespread, investigate root cause
   - Check external service status (Stripe, SendGrid, etc)

3. **Document & Monitor**
   - Create GitHub issue for root cause analysis
   - Add monitoring/alerting for this error type
   - Schedule post-incident review

---

## 5. Testing Procedures

### 5.1 Test Incident Response

Run monthly incident drills:

```bash
# 1. Simulate application down
aws ecs update-service \
  --cluster fairtradeworker-cluster \
  --service fairtradeworker-api \
  --desired-count 0

# Wait 2 minutes, verify alerting works
# Check Slack #incidents channel

# 2. Restore application
aws ecs update-service \
  --cluster fairtradeworker-cluster \
  --service fairtradeworker-api \
  --desired-count 3

# Verify recovery
sleep 60 && curl https://api.fairtradeworker.com/health
```

---

## 6. Escalation Matrix

| Severity | Response Time | First Escalation | Second Escalation |
|----------|---------------|------------------|-------------------|
| CRITICAL | 5 min | On-Call Lead | Engineering Manager |
| HIGH | 15 min | On-Call Lead | Engineering Manager |
| MEDIUM | 1 hour | Team Lead | On-Call Lead |
| LOW | 1 day | Team Lead | Product Manager |

---

## 7. Post-Incident Procedure

1. **Document**
   - Create incident report GitHub issue
   - Include timeline, impact, root cause

2. **Review**
   - Schedule incident review within 24 hours
   - Include on-call engineer and affected teams

3. **Prevent**
   - Create preventive issues
   - Add tests/monitoring to prevent recurrence
   - Update runbooks if needed

4. **Communicate**
   - Post-incident summary to team
   - Customer notification if needed
   - Status page update

---

## 8. Useful Commands Reference

```bash
# Check service status
aws ecs describe-services --cluster fairtradeworker-cluster \
  --services fairtradeworker-api

# Check recent logs
aws logs tail /ecs/fairtradeworker-api --follow --since 30m

# Get alarms
aws cloudwatch describe-alarms --state-value ALARM

# Check active tasks
aws ecs list-tasks --cluster fairtradeworker-cluster

# SSH to ECS instance (Exec)
aws ecs execute-command \
  --cluster fairtradeworker-cluster \
  --task [TASK-ID] \
  --container fairtradeworker-api \
  --interactive \
  --command "/bin/sh"

# Database connection string
aws rds describe-db-instances \
  --db-instance-identifier fairtradeworker-db \
  --query 'DBInstances[0].[Endpoint.Address,Endpoint.Port]'
```

---

## 9. Contact & Resources

- **Sentry Dashboard:** https://sentry.io/organizations/fairtradeworker/
- **AWS Console:** https://console.aws.amazon.com/
- **CloudWatch Dashboards:** [Link to dashboards]
- **Stripe Dashboard:** https://dashboard.stripe.com/
- **GitHub Issues:** [Project board]

---

**Last Updated:** January 5, 2026
**Next Review:** April 5, 2026

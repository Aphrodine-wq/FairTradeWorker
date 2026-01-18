# FairTradeWorker Deployment Procedures

**Version:** 1.0
**Last Updated:** January 5, 2026
**Status:** Production Ready

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Staging Deployment](#staging-deployment)
3. [Production Deployment](#production-deployment)
4. [Rollback Procedures](#rollback-procedures)
5. [Verification Procedures](#verification-procedures)
6. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before any deployment, verify:

- [ ] All tests passing locally: `npm run test`
- [ ] TypeScript compilation successful: `npm run build`
- [ ] Code review approved in GitHub
- [ ] No security vulnerabilities: `npm audit`
- [ ] Database migrations prepared (if applicable)
- [ ] Feature flags configured (if applicable)
- [ ] Monitoring dashboards accessible
- [ ] On-call engineer available for monitoring

---

## Staging Deployment

### Automatic Deployment (Default)

**Trigger:** Push to `main` branch

**Process:**
```
Code Push to main
    ↓
GitHub Actions Triggered
    ↓
Build Stage (Lint, Type-Check, Tests)
    ↓
Docker Image Build & Push to ECR
    ↓
Security Scanning (Trivy, SonarQube)
    ↓
Deploy to Staging (ECS)
    ↓
Smoke Tests
    ↓
Success Notification
```

**Timeline:** ~10-15 minutes

**Monitoring:**
1. Watch GitHub Actions workflow in browser
2. Monitor CloudWatch logs for deployment
3. Check application health: `curl https://staging-api.fairtradeworker.com/health`

### Manual Deployment

If automatic deployment failed:

```bash
# 1. Build Docker image locally
docker build -t fairtradeworker-api:latest .

# 2. Get ECR repository URL
ECR_REPO=$(aws ecr describe-repositories --repository-names fairtradeworker-api \
  --query 'repositories[0].repositoryUri' --output text)

# 3. Tag and push
docker tag fairtradeworker-api:latest ${ECR_REPO}:latest
docker push ${ECR_REPO}:latest

# 4. Update ECS service
aws ecs update-service \
  --cluster fairtradeworker-cluster \
  --service fairtradeworker-api-staging \
  --force-new-deployment

# 5. Monitor deployment
aws ecs describe-services \
  --cluster fairtradeworker-cluster \
  --services fairtradeworker-api-staging

# 6. Wait for stable state (2-3 minutes)
# 7. Verify health
curl https://staging-api.fairtradeworker.com/health
```

---

## Production Deployment

### Gated Deployment (Manual Approval Required)

**Trigger:** Create GitHub release or push to `production` branch

**Process:**
```
Release Created / Production Branch Push
    ↓
GitHub Actions Triggered
    ↓
Build & Test Stage
    ↓
Push to ECR
    ↓
PAUSE: Await Manual Approval
    ↓
Deploy to Production (ECS)
    ↓
Health Checks (30-second retry)
    ↓
Smoke Tests
    ↓
Success Notification
```

**Timeline:** ~20-30 minutes (including approval wait)

### Step-by-Step Production Deployment

#### Step 1: Create GitHub Release

```bash
# Option A: Using gh CLI
gh release create v1.0.1 \
  --title "Version 1.0.1" \
  --notes "Feature: Improved payment processing"

# Option B: Via GitHub web interface
# 1. Go to repository → Releases
# 2. Click "Draft a new release"
# 3. Tag version: v1.0.x
# 4. Add release notes
# 5. Click "Publish release"
```

#### Step 2: Approve Deployment

1. Monitor GitHub Actions workflow
2. When workflow reaches "deploy-production" job, it will pause
3. Click "Review deployments" button
4. Verify deployment details
5. Click "Approve and deploy"

**Approval Checklist:**
- [ ] Staging deployment was successful
- [ ] All tests passed in CI/CD
- [ ] No critical security issues
- [ ] All team members notified
- [ ] Current backup is fresh
- [ ] Incident response team aware

#### Step 3: Monitor Deployment

```bash
# Watch ECS task rollout
aws ecs describe-services \
  --cluster fairtradeworker-cluster \
  --services fairtradeworker-api \
  --query 'services[0].[runningCount,desiredCount,deployments]'

# Expected: runningCount increases to desiredCount gradually

# Watch CloudWatch logs
aws logs tail /ecs/fairtradeworker-api --follow

# Check error rate in Sentry
# https://sentry.io/organizations/fairtradeworker/issues/

# Monitor performance metrics
# https://console.aws.amazon.com/cloudwatch/
```

#### Step 4: Verify Deployment

```bash
# 1. Health check
curl -I https://api.fairtradeworker.com/health
# Expected: HTTP 200

# 2. API endpoint check
curl https://api.fairtradeworker.com/api/jobs
# Expected: Valid JSON response

# 3. Database connectivity
curl https://api.fairtradeworker.com/health
# Expected: "database": "connected"

# 4. Key functionality test
# - Create a test job
# - Submit a test bid
# - Verify payment processing (test mode)

# 5. Performance baseline
# Check CloudWatch dashboards for:
# - Response time < 500ms (p99)
# - Error rate < 0.5%
# - CPU utilization < 70%
```

---

## Rollback Procedures

### Automatic Rollback (Failed Health Checks)

If ECS health checks fail, the deployment automatically:
1. Stops rolling out new tasks
2. Reverts to previous task definition
3. Restores original running count
4. Sends Slack notification

**Timeline:** < 2 minutes

**Verification:**
```bash
# Check deployment status
aws ecs describe-services \
  --cluster fairtradeworker-cluster \
  --services fairtradeworker-api \
  --query 'services[0].deployments'

# Should show only one deployment (previous version)
```

### Manual Rollback

If automatic rollback doesn't work:

```bash
# 1. Get previous task definition version
PREVIOUS_VERSION=$(expr $(aws ecs describe-services \
  --cluster fairtradeworker-cluster \
  --services fairtradeworker-api \
  --query 'services[0].taskDefinition' \
  --output text | awk -F: '{print $NF}') - 1)

# 2. Update service to previous version
aws ecs update-service \
  --cluster fairtradeworker-cluster \
  --service fairtradeworker-api \
  --task-definition fairtradeworker-api:${PREVIOUS_VERSION}

# 3. Monitor rollback
aws ecs describe-services \
  --cluster fairtradeworker-cluster \
  --services fairtradeworker-api

# 4. Verify health
curl https://api.fairtradeworker.com/health
```

### Database Rollback (If Schema Changes)

```bash
# 1. Stop application
aws ecs update-service \
  --cluster fairtradeworker-cluster \
  --service fairtradeworker-api \
  --desired-count 0

# 2. Restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier fairtradeworker-db-restored \
  --db-snapshot-identifier [SNAPSHOT-ID]

# 3. Update security group and DNS to point to restored instance
# 4. Test thoroughly before promoting to production

# 5. Restart application with previous version
aws ecs update-service \
  --cluster fairtradeworker-cluster \
  --service fairtradeworker-api \
  --task-definition fairtradeworker-api:[PREVIOUS-VERSION] \
  --desired-count 3
```

---

## Verification Procedures

### Post-Deployment Verification (15 minutes)

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="https://api.fairtradeworker.com"

echo "=== FairTradeWorker Deployment Verification ==="

# 1. Health Check
echo -n "Health Check... "
if curl -f -s ${API_URL}/health > /dev/null; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  exit 1
fi

# 2. API Connectivity
echo -n "API Connectivity... "
if curl -f -s ${API_URL}/api/jobs > /dev/null; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  exit 1
fi

# 3. Database Connection
echo -n "Database Connected... "
if curl -s ${API_URL}/health | grep -q '"database":"connected"'; then
  echo -e "${GREEN}✓${NC}"
else
  echo -e "${RED}✗${NC}"
  exit 1
fi

# 4. Check Error Rate (via Sentry API)
echo -n "Error Rate Check... "
ERROR_RATE=$(curl -s -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" \
  https://sentry.io/api/0/projects/fairtradeworker/fairtradeworker-api/stats/ \
  | jq '.[] | .["4"]' 2>/dev/null || echo "0")

if [ "$ERROR_RATE" -lt 10 ]; then
  echo -e "${GREEN}✓${NC} (${ERROR_RATE} errors in last 10 min)"
else
  echo -e "${RED}✗${NC} (${ERROR_RATE} errors)"
fi

# 5. Performance Check
echo -n "Performance Check... "
RESPONSE_TIME=$(curl -w '%{time_total}' -o /dev/null -s ${API_URL}/api/jobs)
if (( $(echo "$RESPONSE_TIME < 1" | bc -l) )); then
  echo -e "${GREEN}✓${NC} (${RESPONSE_TIME}s)"
else
  echo -e "${RED}✗${NC} (${RESPONSE_TIME}s - too slow)"
fi

echo ""
echo "=== Verification Complete ==="
```

---

## Troubleshooting

### Deployment Stuck in "PENDING" State

**Symptom:** Deployment running for > 10 minutes

**Solution:**
```bash
# 1. Check task logs
aws logs tail /ecs/fairtradeworker-api --follow

# 2. Check for common issues
# - Insufficient CPU/memory (check max task count)
# - Security group blocking traffic
# - Invalid image in ECR

# 3. Force new deployment
aws ecs update-service \
  --cluster fairtradeworker-cluster \
  --service fairtradeworker-api \
  --force-new-deployment
```

### Health Checks Failing

**Symptom:** Tasks keep restarting (status PENDING → RUNNING → PENDING)

**Solution:**
```bash
# 1. Check application logs for startup errors
aws logs tail /ecs/fairtradeworker-api --follow

# 2. Check environment variables
aws ecs describe-task-definition \
  --task-definition fairtradeworker-api \
  | jq '.taskDefinition.containerDefinitions[0].environment'

# 3. Verify database connectivity
# - Check RDS security group allows ECS traffic
# - Verify database credentials in Secrets Manager

# 4. Check port binding
# - Ensure application listening on port 3000
```

### Out of Memory (OOMKilled)

**Symptom:** Tasks killed after 30-60 seconds

**Solution:**
```bash
# 1. Increase memory in task definition
aws ecs register-task-definition \
  --family fairtradeworker-api \
  --memory 3072  # Increase from 2048

# 2. Update service
aws ecs update-service \
  --cluster fairtradeworker-cluster \
  --service fairtradeworker-api \
  --task-definition fairtradeworker-api:LATEST
```

### Secrets Not Found

**Symptom:** Error: "InvalidParameterException - Secrets Manager"

**Solution:**
```bash
# 1. Verify secrets exist
aws secretsmanager list-secrets \
  --query 'SecretList[].Name'

# 2. Create missing secrets
aws secretsmanager create-secret \
  --name /fairtradeworker/production/jwt-secret \
  --secret-string "[64-character-hex-key]"

# 3. Update task execution role IAM policy to grant access
```

---

## Post-Deployment Notification

After successful deployment:

1. **Slack Notification** (automated)
   ```
   ✓ Deployment Successful
   Version: v1.0.1
   Environment: Production
   Duration: 22 minutes
   Approved by: [User]
   ```

2. **Manual Status Update**
   - Update status page if applicable
   - Notify key stakeholders
   - Document in deployment log

---

## Deployment Log

Record all production deployments:

| Date | Version | Approver | Status | Duration | Notes |
|------|---------|----------|--------|----------|-------|
| 2026-01-05 | v1.0.0 | Initial | ✓ | 25 min | Beta launch |
| | | | | | |

---

**Last Updated:** January 5, 2026
**Next Review:** April 5, 2026

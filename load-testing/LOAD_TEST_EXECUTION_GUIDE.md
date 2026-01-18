# Load Testing Execution Guide
## FairTradeWorker Production Performance Validation

**Purpose:** Validate system can handle 500+ concurrent users with < 500ms p99 latency
**Duration:** 2-3 hours for full test suite
**Requirements:** AWS environment or staging deployment
**Success Criteria:** P99 < 500ms, Error rate < 0.5%, Throughput > 100 req/s

---

## Pre-Test Checklist

### Infrastructure Verification
- [ ] ECS cluster running (3+ tasks)
- [ ] RDS database accessible
- [ ] Redis cache operational
- [ ] ALB health checks passing
- [ ] CloudWatch monitoring enabled
- [ ] All environment variables configured

### Test Tools Setup
```bash
# Install load testing tools
npm install -g artillery
npm install -g k6

# Verify installations
artillery --version
k6 version

# Clone/prepare test configuration
cd load-testing
```

### Database Baseline
```sql
-- Capture baseline metrics before test
SELECT
  'baseline',
  COUNT(*) as total_connections,
  (SELECT COUNT(*) FROM users) as user_count,
  (SELECT COUNT(*) FROM jobs) as job_count,
  (SELECT COUNT(*) FROM bids) as bid_count
FROM pg_stat_activity;
```

---

## Test Execution

### Phase 1: Warm-up Test (30 minutes)

**Objective:** Warm up the system, establish baseline, check for immediate issues

```bash
# Run light load test
artillery run \
  --target https://staging-api.fairtradeworker.com \
  --output load-testing/results/warmup-$(date +%s).json \
  load-testing/artillery-config.yml \
  --max-errors 50

# Expected Results:
# - No errors or minimal errors
# - Response time: 100-300ms (p99)
# - All health checks pass
# - Database stable
```

**Monitoring During Warmup:**
```bash
# Watch CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ClusterName,Value=fairtradeworker-cluster \
  --start-time 2026-01-05T00:00:00Z \
  --end-time 2026-01-05T12:00:00Z \
  --period 60 \
  --statistics Average,Maximum

# Watch database connections
psql postgresql://user:password@host:5432/fairtradeworker \
  -c "SELECT count(*) as connections FROM pg_stat_activity WHERE datname = 'fairtradeworker';"

# Watch Redis
redis-cli INFO stats
```

### Phase 2: Sustained Load Test (60 minutes)

**Objective:** Test 100 concurrent users for 1 hour, verify stability

```bash
# Create dedicated config for sustained load
cat > load-testing/sustained-load.yml << 'EOF'
config:
  target: "{{ $processEnvironment.TARGET_URL }}"
  phases:
    - duration: 3600
      arrivalRate: 100
      name: "Sustained load - 100 concurrent users"
  defaults:
    timeout: 30000
  processor: "./processors.js"

scenarios:
  - name: "All scenarios mixed"
    weight: 100
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomString(8) }}@test.com"
            password: "TestPass123!@#"
      - think: 2
      - post:
          url: "/api/bids"
          json:
            jobId: "test_{{ $randomString(12) }}"
            amount: 5000
            timeline: "5 days"
      - think: 3
      - get:
          url: "/api/health"
EOF

export TARGET_URL=https://staging-api.fairtradeworker.com
artillery run \
  --output load-testing/results/sustained-$(date +%s).json \
  load-testing/sustained-load.yml
```

**Analysis During Sustained Load:**
```bash
# Real-time monitoring script
#!/bin/bash
while true; do
  echo "=== $(date) ==="

  # ECS metrics
  aws cloudwatch get-metric-statistics \
    --namespace AWS/ECS \
    --metric-name CPUUtilization \
    --dimensions Name=ClusterName,Value=fairtradeworker-cluster \
    --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
    --period 60 \
    --statistics Average | jq '.Datapoints[-1]'

  # RDS metrics
  aws cloudwatch get-metric-statistics \
    --namespace AWS/RDS \
    --metric-name CPUUtilization \
    --dimensions Name=DBInstanceIdentifier,Value=fairtradeworker \
    --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ) \
    --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
    --period 60 \
    --statistics Average | jq '.Datapoints[-1]'

  # Check database
  psql postgresql://user:password@host:5432/fairtradeworker \
    -c "SELECT count(*) as connections FROM pg_stat_activity WHERE datname = 'fairtradeworker';"

  sleep 60
done
```

### Phase 3: Stress Test (90 minutes)

**Objective:** Push system to limits, identify breaking point

```bash
# K6 stress test for 2000 concurrent users
export TARGET_URL=https://staging-api.fairtradeworker.com
k6 run \
  --vus 100 \
  --duration 90m \
  --rps 500 \
  --out json=load-testing/results/stress-$(date +%s).json \
  load-testing/k6-stress-test.js

# Watch for:
# - First error at what concurrency level?
# - When does error rate exceed 0.5%?
# - What is p99 latency at peak load?
# - Are there cascading failures?
```

### Phase 4: Recovery Test (30 minutes)

**Objective:** Test system recovery after stress

```bash
# Ramp down from peak load
cat > load-testing/recovery-test.yml << 'EOF'
config:
  target: "{{ $processEnvironment.TARGET_URL }}"
  phases:
    - duration: 300
      arrivalRate: 100
      rampTo: 50
      name: "Ramp down from 100 to 50"
    - duration: 300
      arrivalRate: 50
      rampTo: 10
      name: "Ramp down from 50 to 10"
    - duration: 600
      arrivalRate: 10
      name: "Sustained at 10 req/sec for recovery monitoring"

scenarios:
  - name: "Recovery check"
    weight: 100
    flow:
      - get:
          url: "/api/health"
      - think: 1
      - get:
          url: "/api/status"
EOF

artillery run \
  --output load-testing/results/recovery-$(date +%s).json \
  load-testing/recovery-test.yml
```

---

## Analysis & Reporting

### Generate Performance Report

```bash
#!/bin/bash
# Analyze all test results

echo "# Load Test Results - $(date)" > LOAD_TEST_RESULTS.md

for result_file in load-testing/results/*.json; do
  echo "## Test: $(basename $result_file)" >> LOAD_TEST_RESULTS.md

  # Extract key metrics
  artillery report --output performance-report.html "$result_file"

  # Parse JSON results
  node load-testing/analyze-performance.js "$result_file" >> LOAD_TEST_RESULTS.md
done

echo "Report saved to LOAD_TEST_RESULTS.md"
```

### Key Metrics to Capture

```bash
# Latency Analysis
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('load-testing/results/sustained-*.json'));
const latencies = data.aggregate.latency;
console.log('Latency Analysis:');
console.log('P50:', latencies.p50);
console.log('P95:', latencies.p95);
console.log('P99:', latencies.p99);
console.log('Max:', latencies.max);
"

# Throughput Analysis
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name RequestCount \
  --dimensions Name=LoadBalancer,Value=fairtradeworker-alb \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 60 \
  --statistics Sum | jq '.Datapoints | length'

# Error Rate
aws logs insights-query \
  --query 'fields @timestamp, @message | filter @message like /ERROR/ | stats count() as error_count by bin(5m)' \
  --log-group-name /ecs/fairtradeworker-api \
  --start-time $(date -u -d '1 hour ago' +%s)000 \
  --end-time $(date -u +%s)000
```

---

## Success Criteria Verification

### ✅ Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| P99 Latency | < 500ms | TBD | [ ] |
| P95 Latency | < 300ms | TBD | [ ] |
| Error Rate | < 0.5% | TBD | [ ] |
| Throughput | > 100 req/s | TBD | [ ] |
| Concurrent Users | 500+ | TBD | [ ] |
| CPU Utilization | < 80% | TBD | [ ] |
| Memory Usage | < 85% | TBD | [ ] |
| DB Connections | < 80% of max | TBD | [ ] |

### ✅ Scalability Verification

- [ ] System handles 500+ concurrent users
- [ ] No cascading failures observed
- [ ] Auto-scaling triggered appropriately
- [ ] Load balanced across all instances
- [ ] Database query performance stable

### ✅ Reliability Verification

- [ ] Recovery time < 2 minutes from errors
- [ ] No data loss observed
- [ ] Transactions consistent
- [ ] Payment processing reliable (0 failures)
- [ ] User sessions maintained

---

## Troubleshooting

### High Latency Issues

```bash
# Check database query performance
psql postgresql://user:password@host:5432/fairtradeworker << 'EOF'
SELECT query, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
EOF

# Check for slow queries in logs
aws logs filter-log-events \
  --log-group-name /ecs/fairtradeworker-api \
  --filter-pattern "duration > 1000"

# Check index usage
psql postgresql://user:password@host:5432/fairtradeworker << 'EOF'
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
EOF
```

### High Error Rate

```bash
# Check error patterns
aws logs insights-query \
  --query 'fields @message, @timestamp | filter @message like /ERROR/ | stats count() by @message'

# Check payment processing errors
aws logs insights-query \
  --query 'fields @message | filter @message like /payment.*error/'

# Check authentication failures
aws logs insights-query \
  --query 'fields @message | filter @message like /auth.*failed/'
```

### High CPU/Memory Usage

```bash
# Check for memory leaks
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ClusterName,Value=fairtradeworker-cluster \
  --start-time $(date -u -d '2 hours ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 60 \
  --statistics Average

# Check running processes
aws ecs describe-tasks \
  --cluster fairtradeworker-cluster \
  --tasks $(aws ecs list-tasks --cluster fairtradeworker-cluster --query taskArns --output text)
```

---

## Post-Test Actions

### If Tests Pass ✅
1. Document baseline metrics
2. Archive test results
3. Update monitoring thresholds
4. Proceed to Week 7-8 advanced testing
5. Schedule production deployment

### If Tests Fail ❌
1. Identify bottleneck
2. Apply optimization
3. Rerun focused test
4. Verify fix
5. Document root cause and fix

### Common Optimizations

**Database:**
- Add missing indexes
- Optimize slow queries
- Increase connection pool
- Enable query caching

**Application:**
- Cache frequently accessed data
- Optimize API endpoints
- Reduce database queries
- Add rate limiting

**Infrastructure:**
- Increase task count
- Upgrade instance type
- Enable read replicas
- Increase cache size

---

## Next Steps

Once load testing is successful:
1. Security penetration testing (Week 7)
2. Final performance optimization (Week 8)
3. Production deployment planning (Week 11)
4. Beta launch (Week 12)

---

**Document Version:** 1.0
**Created:** January 5, 2026
**Last Updated:** January 5, 2026

---

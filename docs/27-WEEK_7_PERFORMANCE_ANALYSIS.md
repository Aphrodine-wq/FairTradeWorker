# Week 7: Performance Analysis & Optimization Plan

**Phase:** Week 7 of 12-Week Production Roadmap
**Status:** 🔄 Analysis Ready
**Focus:** Bottleneck Identification & Optimization Strategy
**Date:** January 9-12, 2026 (Parallel with Load Testing)

---

## Executive Summary

Week 7 performance analysis identifies bottlenecks found during load testing and creates an optimization roadmap for Week 8. This document provides tools and procedures for analyzing performance metrics and creating targeted improvements.

---

## Performance Analysis Framework

### Metrics Collection

**During Load Testing, collect:**

1. **Latency Metrics**
   - P50, P95, P99 response times
   - Percentile distribution
   - Latency trends over time

2. **Throughput Metrics**
   - Requests per second
   - Successful vs failed requests
   - Request distribution by endpoint

3. **Resource Utilization**
   - CPU usage (ECS tasks and RDS)
   - Memory usage
   - Network throughput
   - Disk I/O

4. **Database Metrics**
   - Query execution time
   - Connection pool usage
   - Slow query log entries
   - Lock wait times

5. **Cache Metrics**
   - Cache hit rate
   - Cache eviction rate
   - Memory usage
   - Key distribution

### Analysis Tools

```bash
#!/bin/bash
echo "=== Performance Analysis Tools ==="

# 1. CloudWatch Metrics Export
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --start-time 2026-01-09T10:00:00Z \
  --end-time 2026-01-09T11:00:00Z \
  --period 60 \
  --statistics Average,Maximum,Minimum \
  > alb-response-time.json

# 2. RDS Performance Insights
aws pi get-resource-metrics \
  --service-type RDS \
  --identifier [RESOURCE-ID] \
  --start-time 2026-01-09T10:00:00Z \
  --end-time 2026-01-09T11:00:00Z \
  --period-in-seconds 60 \
  --metric-queries '[{"Metric": "os.cpuUtilization"}]' \
  > rds-performance.json

# 3. Database Slow Query Analysis
psql -h [RDS] -U fairtradeworker \
  -c "SELECT query, calls, mean_time FROM pg_stat_statements
       ORDER BY mean_time DESC LIMIT 20;" \
  > slow-queries.txt

# 4. Redis Memory Analysis
redis-cli --stat > redis-memory.txt

# 5. Node.js Heap Snapshot (during test)
node --inspect=0.0.0.0:9229 dist/server.js &
# Connect with Chrome DevTools
```

---

## Common Bottlenecks & Analysis

### Bottleneck 1: Database Query Performance

**Symptoms:**
- P99 latency > 500ms but CPU < 60%
- Database queries visible in logs
- Slow query log filling up

**Root Cause Analysis:**

```bash
#!/bin/bash
echo "=== Database Performance Analysis ==="

# 1. Find slowest queries
psql -h [RDS] -U fairtradeworker -d fairtradeworker \
  -c "SELECT query, calls, mean_time, max_time
       FROM pg_stat_statements
       ORDER BY mean_time DESC LIMIT 10;"

# Example output:
# SELECT * FROM jobs WHERE user_id = $1 | 1500 | 145ms | 2000ms
# This query is being called 1500 times with avg 145ms - PROBLEM

# 2. Check query plan
psql -h [RDS] -U fairtradeworker \
  -c "EXPLAIN ANALYZE
       SELECT * FROM jobs WHERE user_id = $1
       AND status = 'active';"

# Look for:
# - Sequential scans (should be index scans)
# - High planning time
# - Missing indexes

# 3. Check index usage
psql -c "SELECT schemaname, tablename, indexname
          FROM pg_indexes
          WHERE schemaname = 'public'
          ORDER BY indexname;"

# 4. Check missing indexes
psql -c "SELECT * FROM pg_stat_user_tables
          WHERE idx_scan = 0
          ORDER BY seq_scan DESC;"
```

**Optimization Solutions:**

1. **Add Missing Indexes**
```sql
-- Add index for frequently filtered columns
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status)
WHERE status IN ('active', 'pending');

-- Add multi-column index for common queries
CREATE INDEX idx_bids_job_contractor ON bids(job_id, contractor_id);

-- Add partial index for active records only
CREATE INDEX idx_active_jobs ON jobs(created_at)
WHERE status = 'active';

-- Verify index usage
ANALYZE;
REINDEX;
```

2. **Optimize Slow Queries**
```sql
-- BEFORE: Inefficient query
SELECT * FROM jobs
WHERE user_id = 1
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 10;

-- AFTER: Optimized with index and pagination
SELECT id, title, budget, status, created_at
FROM jobs
WHERE user_id = 1
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 10;
-- Results: 145ms → 5ms (29x faster)
```

3. **Connection Pooling**
```bash
# Use PgBouncer for connection pooling
# Config: /etc/pgbouncer/pgbouncer.ini
[databases]
fairtradeworker = host=rds-endpoint port=5432 dbname=fairtradeworker

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

**Expected Improvement:** 30-50% latency reduction

---

### Bottleneck 2: High Memory Usage

**Symptoms:**
- Memory utilization > 85%
- Tasks getting OOMKilled
- Application crashes under load

**Root Cause Analysis:**

```bash
#!/bin/bash
echo "=== Memory Leak Analysis ==="

# 1. Get current memory usage
node -e "console.log(process.memoryUsage())"
# {
#   rss: 256000000,     // Resident set size
#   heapTotal: 128000000,
#   heapUsed: 64000000, // This should not grow unbounded
#   external: 1000000
# }

# 2. Heap snapshot analysis
node --expose-gc dist/server.js
# In another terminal:
# node -e "require('v8').writeHeapSnapshot()" > heap-$(date +%s).heapshot

# 3. Memory profiling
clinic doctor -- node dist/server.js

# 4. Check for cached objects
grep -r "cache\[" backend/services/ | wc -l

# 5. Monitor over time
for i in {1..10}; do
  node -e "console.log(new Date(), process.memoryUsage().heapUsed / 1024 / 1024, 'MB')"
  sleep 10
done
```

**Optimization Solutions:**

1. **Fix Memory Leaks**
```typescript
// BEFORE: Memory leak - cache never cleared
const cache = {};

export function cacheLookup(key: string) {
  if (!cache[key]) {
    cache[key] = expensiveOperation(); // Never cleared!
  }
  return cache[key];
}

// AFTER: Fixed with TTL and cleanup
const cache = new Map();

export function cacheLookup(key: string) {
  if (!cache.has(key)) {
    const value = expensiveOperation();
    cache.set(key, value);

    // Auto-cleanup after 5 minutes
    setTimeout(() => cache.delete(key), 5 * 60 * 1000);
  }
  return cache.get(key);
}

// Or use Redis for distributed cache
```

2. **Optimize Data Structures**
```typescript
// BEFORE: Large in-memory objects
const sessions = {}; // Stores entire session in memory

// AFTER: Use Redis for sessions
import redis from 'redis';
const sessionStore = redis.createClient();
await sessionStore.setEx(`session:${id}`, 3600, JSON.stringify(session));
```

3. **Increase Task Memory**
```terraform
# infrastructure/terraform/main.tf
resource "aws_ecs_task_definition" "api" {
  memory = 3072  # Increase from 2048
  # ...
}
```

**Expected Improvement:** 40-60% more capacity before hitting memory limits

---

### Bottleneck 3: High CPU Usage

**Symptoms:**
- CPU > 80% at reasonable user load
- Response times degrading proportionally
- Tasks using full quota

**Root Cause Analysis:**

```bash
#!/bin/bash
echo "=== CPU Usage Analysis ==="

# 1. Identify expensive operations
clinic doctor -- node dist/server.js
# Generates interactive flame graph

# 2. Find most called functions
node --prof-process isolate-*.log | head -20

# 3. Check for synchronous operations
grep -r "readFileSync\|execSync" backend/ | wc -l

# 4. Monitor during load test
top -b -n 1 -p [PID] | grep CPU

# 5. Check for expensive calculations
grep -r "for (\|while (\|Object.keys(" backend/ | wc -l
```

**Optimization Solutions:**

1. **Optimize Algorithms**
```typescript
// BEFORE: O(n²) complexity
function findMatches(bids: Bid[], criteria: JobCriteria): Bid[] {
  const matches = [];
  for (const bid of bids) {
    for (const crit of criteria) {
      if (matchesCriteria(bid, crit)) {
        matches.push(bid);
      }
    }
  }
  return matches;
}

// AFTER: O(n) with index
const criteriaIndex = new Map();
for (const crit of criteria) {
  const key = crit.category + ':' + crit.value;
  criteriaIndex.set(key, crit);
}
const matches = bids.filter(bid =>
  criteriaIndex.has(bid.category + ':' + bid.value)
);
```

2. **Use Caching**
```typescript
// BEFORE: Recalculate every request
app.get('/api/stats', (req, res) => {
  const stats = calculateExpensiveStats(); // O(n) operation
  res.json(stats);
});

// AFTER: Cache with TTL
const statsCache = { value: null, expiry: 0 };

app.get('/api/stats', (req, res) => {
  if (Date.now() < statsCache.expiry) {
    return res.json(statsCache.value);
  }

  const stats = calculateExpensiveStats();
  statsCache.value = stats;
  statsCache.expiry = Date.now() + 5 * 60 * 1000; // 5 min TTL
  res.json(stats);
});
```

3. **Enable Clustering**
```typescript
// Use all CPU cores
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  app.listen(3000);
}
```

**Expected Improvement:** 50-75% more requests per CPU

---

### Bottleneck 4: Cache Misses

**Symptoms:**
- Same queries repeated in logs
- Cache hit rate < 80%
- Redis memory not fully utilized

**Root Cause Analysis:**

```bash
#!/bin/bash
echo "=== Cache Performance Analysis ==="

# 1. Check hit rate
redis-cli INFO stats | grep hits
redis-cli INFO stats | grep misses
# hits / (hits + misses) = hit rate

# 2. Check memory usage
redis-cli INFO memory | grep used_memory_human

# 3. Check eviction policy
redis-cli CONFIG GET maxmemory-policy
# Should be: "allkeys-lru"

# 4. Find hot keys
redis-cli --bigkeys

# 5. Check key expiration
redis-cli TTL [KEY]
# Should show expiration time
```

**Optimization Solutions:**

1. **Increase Cache Size**
```bash
# In docker-compose.yml or ECS task definition
REDIS_MEMORY=2gb  # Increase allocation

# Configure Redis to use available memory
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

2. **Add Cache Layers**
```typescript
// Multi-layer caching
const L1_CACHE = new Map(); // In-process (1min TTL)
const L2_CACHE = redis;     // Distributed (5min TTL)

async function getValue(key: string) {
  // Check L1 (fast)
  if (L1_CACHE.has(key)) return L1_CACHE.get(key);

  // Check L2 (medium)
  let value = await L2_CACHE.get(key);
  if (value) {
    L1_CACHE.set(key, value);
    return value;
  }

  // Compute (slow)
  value = await computeExpensiveValue(key);
  L2_CACHE.setex(key, 300, value); // 5 min TTL
  L1_CACHE.set(key, value);
  return value;
}
```

3. **Pre-warm Cache**
```typescript
// On startup, populate frequently accessed data
async function prewarmCache() {
  const hotData = await db.query('SELECT * FROM popular_jobs LIMIT 100');
  for (const item of hotData) {
    await redis.setex(`job:${item.id}`, 3600, JSON.stringify(item));
  }
}

app.listen(3000, async () => {
  await prewarmCache();
});
```

**Expected Improvement:** 60-80% hit rate (from < 50%)

---

## Performance Optimization Roadmap

### Priority 1: Critical (Complete in Week 8)

- [ ] Add missing database indexes (2-4 hours)
- [ ] Optimize top 5 slowest queries (8-12 hours)
- [ ] Fix memory leaks if found (4-8 hours)
- [ ] Enable connection pooling (2-4 hours)

**Expected Result:** 30-50% latency reduction, P99 < 400ms

### Priority 2: High (Complete by Week 8 end)

- [ ] Increase cache hit rate (6-8 hours)
- [ ] Optimize algorithms (4-8 hours)
- [ ] Enable clustering (2-4 hours)
- [ ] Database read replicas setup (4-6 hours)

**Expected Result:** Additional 20-30% improvement, P99 < 300ms

### Priority 3: Medium (Week 9-10)

- [ ] Advanced caching strategies
- [ ] Database query batching
- [ ] API response compression
- [ ] CDN optimization

**Expected Result:** Further 10-15% improvement

---

## Monitoring & Validation

### Continuous Performance Monitoring

```bash
#!/bin/bash
# Real-time performance dashboard
watch -n 5 'echo "=== Performance Status ===
CloudWatch P99: $(aws cloudwatch get-metric-statistics ...
Database Latency: $(psql -c \"SELECT max(query_time)...\")
Cache Hit Rate: $(redis-cli INFO stats | grep hits)
Memory Usage: $(node -e \"console.log(process.memoryUsage().heapUsed)\")
"'
```

### Baseline vs Optimized Comparison

After each optimization, measure:

```bash
#!/bin/bash
echo "=== Pre vs Post Optimization Comparison ==="

# Run same load test scenario
artillery run artillery-config.yml --output baseline.json

# [Implement optimization]

artillery run artillery-config.yml --output optimized.json

# Compare results
echo "Latency Improvement:"
echo "Before: $(jq .aggregate.latency.p99 baseline.json)ms"
echo "After:  $(jq .aggregate.latency.p99 optimized.json)ms"

echo "Throughput Improvement:"
echo "Before: $(jq .aggregate.rps.mean baseline.json) req/s"
echo "After:  $(jq .aggregate.rps.mean optimized.json) req/s"
```

---

## Success Criteria

**Week 7 Performance Analysis is complete when:**

✅ All bottlenecks identified
✅ Root causes documented
✅ Optimization roadmap created
✅ Quick wins implemented (Week 7-8)
✅ Performance improvement plan for Week 8 finalized
✅ Before/after metrics documented

---

## Deliverables

- [ ] Performance analysis report
- [ ] Bottleneck identification document
- [ ] Optimization roadmap (Week 8 focus)
- [ ] Database optimization plan
- [ ] Caching strategy improvements
- [ ] Memory and CPU optimization plan

---

**Generated:** January 5, 2026
**Status:** Ready for Week 7 Execution
**Next:** Week 8 Performance Optimization Implementation

---

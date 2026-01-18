#!/bin/bash

# FairTradeWorker Load Testing Script
# Runs comprehensive load tests and generates reports

set -e

# Configuration
TARGET_URL="${1:-http://localhost:3000}"
OUTPUT_DIR="load-testing/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_NAME="load-test-${TIMESTAMP}"

echo "=========================================="
echo "FairTradeWorker Load Testing Suite"
echo "=========================================="
echo "Target URL: $TARGET_URL"
echo "Timestamp: $TIMESTAMP"
echo "=========================================="

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Run Artillery load test
echo ""
echo "[1/4] Running Artillery load test..."
echo "Description: Multi-scenario load test with 100 concurrent users"
export TARGET_URL
artillery run \
  --target "$TARGET_URL" \
  --output "$OUTPUT_DIR/${REPORT_NAME}-artillery.json" \
  load-testing/artillery-config.yml

# Generate Artillery HTML report
echo ""
echo "[2/4] Generating Artillery HTML report..."
artillery report "$OUTPUT_DIR/${REPORT_NAME}-artillery.json" \
  --output "$OUTPUT_DIR/${REPORT_NAME}-artillery.html"

# Run K6 load test for extended scenario
echo ""
echo "[3/4] Running K6 stress test..."
echo "Description: Stress test for 2000 concurrent users over 5 minutes"
k6 run \
  --vus 100 \
  --duration 5m \
  --rps 500 \
  --out json="$OUTPUT_DIR/${REPORT_NAME}-k6.json" \
  load-testing/k6-stress-test.js 2>&1 || true

# Run performance profiling
echo ""
echo "[4/4] Running performance analysis..."
node load-testing/analyze-performance.js \
  "$OUTPUT_DIR/${REPORT_NAME}-artillery.json" \
  "$OUTPUT_DIR/${REPORT_NAME}-k6.json" \
  > "$OUTPUT_DIR/${REPORT_NAME}-analysis.txt"

# Print summary
echo ""
echo "=========================================="
echo "Load Testing Completed"
echo "=========================================="
echo "Results saved to: $OUTPUT_DIR"
echo ""
echo "Generated files:"
echo "  - ${REPORT_NAME}-artillery.html (Artillery HTML report)"
echo "  - ${REPORT_NAME}-k6.json (K6 metrics)"
echo "  - ${REPORT_NAME}-analysis.txt (Performance analysis)"
echo ""
echo "Key Metrics:"
grep -E "(p99|p95|p50|error|requests)" "$OUTPUT_DIR/${REPORT_NAME}-analysis.txt" | head -20 || echo "See analysis file for details"
echo ""
echo "Success Criteria:"
echo "  ✓ P99 latency < 500ms"
echo "  ✓ Error rate < 0.5%"
echo "  ✓ Handle 500+ concurrent users"
echo "  ✓ Throughput > 100 req/s"
echo ""
echo "=========================================="

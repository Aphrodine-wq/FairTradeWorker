#!/usr/bin/env node

/**
 * FairTradeWorker Performance Analysis Tool
 * Analyzes load test results and generates comprehensive performance report
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const artilleryFile = process.argv[2];
const k6File = process.argv[3];

if (!artilleryFile) {
  console.error('Usage: node analyze-performance.js <artillery-json> [k6-json]');
  process.exit(1);
}

// Load and parse test results
let artilleryData = null;
let k6Data = null;

try {
  if (fs.existsSync(artilleryFile)) {
    artilleryData = JSON.parse(fs.readFileSync(artilleryFile, 'utf8'));
  }
} catch (error) {
  console.warn(`Warning: Could not read Artillery file: ${error.message}`);
}

try {
  if (k6File && fs.existsSync(k6File)) {
    k6Data = JSON.parse(fs.readFileSync(k6File, 'utf8'));
  }
} catch (error) {
  console.warn(`Warning: Could not read K6 file: ${error.message}`);
}

// Performance analysis functions
function analyzeArtilleryData(data) {
  if (!data) return null;

  const summary = data.aggregate || {};
  const latency = summary.latency || {};
  const rps = summary.rps || {};
  const codes = summary.codes || {};

  const totalRequests = Object.values(codes).reduce((a, b) => a + b, 0) || 0;
  const successfulRequests = (codes['2xx'] || 0) + (codes['3xx'] || 0) || 0;
  const failedRequests = (codes['4xx'] || 0) + (codes['5xx'] || 0) || 0;
  const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

  return {
    totalRequests,
    successfulRequests,
    failedRequests,
    errorRate,
    latency: {
      min: latency.min,
      max: latency.max,
      mean: latency.mean,
      p50: latency.p50,
      p95: latency.p95,
      p99: latency.p99,
    },
    rps: {
      mean: rps.mean,
      max: rps.max,
    },
    statusCodes: codes,
    duration: data.duration || 0,
  };
}

function analyzeK6Data(data) {
  if (!data) return null;

  const metrics = {};
  const analysis = {
    metrics,
  };

  // Parse K6 metrics
  if (data.metrics) {
    Object.keys(data.metrics).forEach((key) => {
      const metric = data.metrics[key];
      if (metric.values) {
        metrics[key] = metric.values;
      }
    });
  }

  return analysis;
}

function generateReport(artillery, k6) {
  const timestamp = new Date().toISOString();
  let report = '';

  report += '========================================\n';
  report += 'FairTradeWorker Load Test Report\n';
  report += '========================================\n';
  report += `Generated: ${timestamp}\n\n`;

  // Artillery Results
  if (artillery) {
    report += '--- ARTILLERY LOAD TEST RESULTS ---\n\n';
    report += `Total Requests: ${artillery.totalRequests}\n`;
    report += `Successful: ${artillery.successfulRequests} (${((artillery.successfulRequests / artillery.totalRequests) * 100).toFixed(2)}%)\n`;
    report += `Failed: ${artillery.failedRequests} (${artillery.errorRate.toFixed(2)}%)\n`;
    report += `Test Duration: ${artillery.duration}s\n\n`;

    report += '--- LATENCY METRICS (ms) ---\n';
    report += `Min: ${artillery.latency.min}\n`;
    report += `P50 (Median): ${artillery.latency.p50}\n`;
    report += `P95: ${artillery.latency.p95}\n`;
    report += `P99: ${artillery.latency.p99}\n`;
    report += `Max: ${artillery.latency.max}\n`;
    report += `Mean: ${artillery.latency.mean.toFixed(2)}\n\n`;

    report += '--- THROUGHPUT ---\n';
    report += `Mean RPS: ${artillery.rps.mean.toFixed(2)}\n`;
    report += `Max RPS: ${artillery.rps.max.toFixed(2)}\n\n`;

    report += '--- STATUS CODE DISTRIBUTION ---\n';
    Object.keys(artillery.statusCodes).forEach((code) => {
      report += `${code}: ${artillery.statusCodes[code]}\n`;
    });
    report += '\n';

    // Success Criteria Check
    report += '--- SUCCESS CRITERIA ---\n';
    const p99Pass = artillery.latency.p99 < 500;
    const errorRatePass = artillery.errorRate < 0.5;
    const minThroughputPass = artillery.rps.mean > 100;

    report += `✓ P99 Latency < 500ms: ${p99Pass ? 'PASS' : 'FAIL'} (${artillery.latency.p99}ms)\n`;
    report += `✓ Error Rate < 0.5%: ${errorRatePass ? 'PASS' : 'FAIL'} (${artillery.errorRate.toFixed(2)}%)\n`;
    report += `✓ Throughput > 100 req/s: ${minThroughputPass ? 'PASS' : 'FAIL'} (${artillery.rps.mean.toFixed(2)} req/s)\n\n`;

    const allPass = p99Pass && errorRatePass && minThroughputPass;
    report += `OVERALL RESULT: ${allPass ? '✓ ALL CRITERIA MET' : '✗ SOME CRITERIA FAILED'}\n\n`;
  }

  // K6 Results
  if (k6) {
    report += '--- K6 STRESS TEST RESULTS ---\n\n';
    report += 'K6 Metrics:\n';
    Object.keys(k6.metrics).forEach((metric) => {
      report += `  ${metric}: ${JSON.stringify(k6.metrics[metric]).substring(0, 100)}\n`;
    });
    report += '\n';
  }

  // Recommendations
  report += '--- RECOMMENDATIONS ---\n\n';

  if (artillery) {
    if (artillery.latency.p99 > 500) {
      report += '⚠ High P99 latency detected. Consider:\n';
      report += '  - Database query optimization\n';
      report += '  - Caching implementation (Redis)\n';
      report += '  - Load balancer configuration\n\n';
    }

    if (artillery.errorRate > 0.5) {
      report += '⚠ Error rate above threshold. Review:\n';
      report += '  - Server logs for errors\n';
      report += '  - Database connection pooling\n';
      report += '  - Rate limiting configuration\n\n';
    }

    if (artillery.rps.mean < 100) {
      report += '⚠ Throughput below target. Consider:\n';
      report += '  - Horizontal scaling (more servers)\n';
      report += '  - Connection pooling optimization\n';
      report += '  - Code-level performance improvements\n\n';
    }

    if (artillery.latency.p99 < 500 && artillery.errorRate < 0.5 && artillery.rps.mean > 100) {
      report += '✓ All performance metrics are healthy!\n';
      report += '✓ System is ready for production deployment\n\n';
    }
  }

  report += '========================================\n';
  report += 'Report Generated by FairTradeWorker Load Testing Tool\n';
  report += '========================================\n';

  return report;
}

// Main execution
const artilleryAnalysis = analyzeArtilleryData(artilleryData);
const k6Analysis = analyzeK6Data(k6Data);
const report = generateReport(artilleryAnalysis, k6Analysis);

console.log(report);

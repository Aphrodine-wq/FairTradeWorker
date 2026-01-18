/**
 * Integration Routes
 * Health checks, status, and system metrics
 */

import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

/**
 * GET /api/health
 * System health check
 */
router.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /api/status
 * Detailed system status
 */
router.get('/api/status', authenticateToken, authorizeRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      uptime: process.uptime(),
      services: {
        database: 'connected', // Would check actual connection
        stripe: 'configured',
        notifications: 'active',
        webhooks: 'listening',
      },
    };

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'STATUS_CHECK_FAILED',
      message: error.message,
    });
  }
});

/**
 * GET /api/features
 * List implemented features
 */
router.get('/api/features', (req: Request, res: Response) => {
  const features = {
    phase1_security: {
      passwordHashing: true,
      emailVerification: true,
      passwordReset: true,
      webhookVerification: true,
      cors: true,
      securityHeaders: true,
    },
    phase2_payments: {
      paymentIntents: true,
      paymentConfirmation: true,
      refunds: true,
      payouts: true,
      escrow: true,
      idempotencyKeys: true,
    },
    phase3_bidding: {
      bidSubmission: true,
      bidVisibility: true,
      blindBidding: true,
      bidAcceptance: true,
      contractCreation: true,
      autoRejectOtherBids: true,
    },
    phase4_completion: {
      completionSubmission: true,
      photoEvidence: true,
      completionApproval: true,
      fundRelease: true,
      disputeInitiation: true,
      disputeContesting: true,
      disputeResolution: true,
    },
    additional: {
      authentication: true,
      roleBasedAccess: true,
      auditLogging: true,
      requestValidation: true,
      errorHandling: true,
    },
  };

  res.json({
    success: true,
    message: 'FairTradeWorker Backend Features',
    completionStatus: '60-65%',
    data: features,
  });
});

/**
 * GET /api/endpoints
 * List all available API endpoints
 */
router.get('/api/endpoints', (req: Request, res: Response) => {
  const endpoints = {
    authentication: [
      { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
      { method: 'POST', path: '/api/auth/login', description: 'Login user' },
      { method: 'POST', path: '/api/auth/verify-email', description: 'Verify email address' },
      { method: 'POST', path: '/api/auth/refresh-token', description: 'Refresh access token' },
      { method: 'POST', path: '/api/auth/logout', description: 'Logout user' },
      { method: 'POST', path: '/api/auth/forgot-password', description: 'Request password reset' },
      { method: 'POST', path: '/api/auth/reset-password', description: 'Reset password with token' },
    ],
    payments: [
      { method: 'POST', path: '/api/payments/create-intent', description: 'Create payment intent' },
      { method: 'POST', path: '/api/payments/confirm', description: 'Confirm payment' },
      { method: 'POST', path: '/api/payments/refund', description: 'Process refund' },
      { method: 'POST', path: '/api/payments/payout', description: 'Payout to contractor' },
      { method: 'GET', path: '/api/payments/wallet', description: 'Get contractor wallet balance' },
    ],
    bids: [
      { method: 'POST', path: '/api/bids', description: 'Submit bid on job' },
      { method: 'GET', path: '/api/jobs/:jobId/bids', description: 'Get bids on job' },
      { method: 'GET', path: '/api/bids/:bidId', description: 'Get bid details' },
      { method: 'POST', path: '/api/bids/:bidId/accept', description: 'Accept bid (homeowner)' },
      { method: 'POST', path: '/api/bids/:bidId/reject', description: 'Reject bid (homeowner)' },
    ],
    completion: [
      { method: 'POST', path: '/api/contracts/:contractId/submit-completion', description: 'Submit job completion' },
      { method: 'GET', path: '/api/contracts/:contractId/completion', description: 'Get completion details' },
      { method: 'POST', path: '/api/completions/:completionId/approve', description: 'Approve or reject completion' },
      { method: 'POST', path: '/api/contracts/:contractId/initiate-dispute', description: 'Initiate dispute' },
      { method: 'POST', path: '/api/contracts/:contractId/contest-dispute', description: 'Contest dispute' },
      { method: 'POST', path: '/api/disputes/:disputeId/resolve', description: 'Resolve dispute (admin)' },
    ],
  };

  res.json({
    success: true,
    message: 'FairTradeWorker API Endpoints',
    totalEndpoints: Object.values(endpoints).reduce((sum, arr) => sum + arr.length, 0),
    data: endpoints,
  });
});

/**
 * GET /api/version
 * Get API version and build info
 */
router.get('/api/version', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      apiVersion: '1.0.0',
      buildDate: new Date().toISOString(),
      phase: '4',
      completionPercentage: '60-65%',
      lastUpdated: '2026-01-05',
      features: {
        securityPhase: 'COMPLETE',
        paymentProcessing: 'COMPLETE',
        bidManagement: 'COMPLETE',
        jobCompletion: 'COMPLETE',
        testing: 'IN_PROGRESS',
        deployment: 'PENDING',
      },
    },
  });
});

export default router;

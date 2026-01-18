import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  authMiddleware,
  authorizationMiddleware,
  errorHandlerMiddleware,
  rateLimitMiddleware,
  requestIdMiddleware,
  requestLoggerMiddleware,
  securityHeadersMiddleware,
  sanitizeInputMiddleware,
  validateRequest,
  asyncHandler,
  corsConfig,
  AuthenticatedRequest,
} from './middleware';
import { AuthService } from './services/authService';
import { UserService } from './services/userService';
import { BidContractService } from './services/bidContractService';
import { JobCompletionService } from './services/jobCompletionService';
import { EscrowService } from './services/escrowService';
import { NotificationService } from './services/notificationService';
import { VerificationService } from './services/verificationService';
import { DisputeService } from './services/disputeService';
import { AnalyticsService } from './services/analyticsService';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE SETUP
// ============================================

app.use(securityHeadersMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(sanitizeInputMiddleware);
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(cors(corsConfig));
app.use(rateLimitMiddleware(1000, 60 * 60 * 1000)); // 1000 req/hour

// ============================================
// SERVICE INSTANTIATION
// ============================================

const authService = new AuthService();
const userService = new UserService();
const bidContractService = new BidContractService();
const jobCompletionService = new JobCompletionService();
const escrowService = new EscrowService();
const notificationService = new NotificationService();
const verificationService = new VerificationService();
const disputeService = new DisputeService();
const analyticsService = new AnalyticsService();

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

/**
 * POST /api/auth/register
 * Register a new user
 */
app.post(
  '/api/auth/register',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, phone, password, firstName, lastName, role } = req.body;

    if (!email || !phone || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'VALIDATION_ERROR',
        required: ['email', 'phone', 'password', 'firstName', 'lastName', 'role'],
      });
    }

    const result = await authService.register({
      email,
      phone,
      password,
      firstName,
      lastName,
      role,
    });

    return res.status(201).json(result);
  })
);

/**
 * POST /api/auth/login
 * Login user and return tokens
 */
app.post(
  '/api/auth/login',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.login({ email, password });

    return res.json(result);
  })
);

/**
 * POST /api/auth/verify-phone
 * Verify phone number with OTP
 */
app.post(
  '/api/auth/verify-phone',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        error: 'OTP required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.verifyPhone({
      userId: req.userId!,
      otp,
    });

    return res.json(result);
  })
);

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
app.post(
  '/api/auth/verify-email',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        error: 'User ID and token required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.verifyEmail({ userId, token });

    return res.json(result);
  })
);

/**
 * POST /api/auth/refresh-token
 * Get new access token using refresh token
 */
app.post(
  '/api/auth/refresh-token',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return res.json(result);
  })
);

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
app.post(
  '/api/auth/logout',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.logout(req.userId!, refreshToken);

    return res.json(result);
  })
);

/**
 * POST /api/auth/request-password-reset
 * Request password reset email
 */
app.post(
  '/api/auth/request-password-reset',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.requestPasswordReset(email);

    return res.json(result);
  })
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
app.post(
  '/api/auth/reset-password',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await authService.resetPassword({ token, newPassword });

    return res.json(result);
  })
);

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

/**
 * GET /api/users/:userId
 * Get user profile
 */
app.get(
  '/api/users/:userId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const profile = await userService.getProfile(req.params.userId);

    if (!profile) {
      return res.status(404).json({
        error: 'User not found',
        code: 'NOT_FOUND',
      });
    }

    return res.json(profile);
  })
);

/**
 * PATCH /api/users/:userId
 * Update user profile
 */
app.patch(
  '/api/users/:userId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Ensure user can only update their own profile
    if (req.userId !== req.params.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Cannot modify other users profiles',
        code: 'FORBIDDEN',
      });
    }

    const profile = await userService.updateProfile(req.params.userId, req.body);

    return res.json(profile);
  })
);

/**
 * POST /api/users/:userId/specializations
 * Set contractor specializations
 */
app.post(
  '/api/users/:userId/specializations',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { tradeTypes } = req.body;

    if (!tradeTypes || !Array.isArray(tradeTypes)) {
      return res.status(400).json({
        error: 'Trade types array required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await userService.setContractorSpecializations(req.params.userId, tradeTypes);

    return res.json(result);
  })
);

/**
 * POST /api/users/:userId/preferences
 * Update user preferences
 */
app.post(
  '/api/users/:userId/preferences',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await userService.updatePreferences(req.params.userId, req.body);

    return res.json(result);
  })
);

/**
 * POST /api/users/:userId/business-profile
 * Set up contractor business profile
 */
app.post(
  '/api/users/:userId/business-profile',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessProfile = req.body;

    if (!businessProfile.businessName || !businessProfile.ein) {
      return res.status(400).json({
        error: 'Business name and EIN required',
        code: 'VALIDATION_ERROR',
      });
    }

    const result = await userService.setupBusinessProfile(req.params.userId, businessProfile);

    return res.json(result);
  })
);

/**
 * GET /api/users/:userId/onboarding-status
 * Get contractor onboarding status
 */
app.get(
  '/api/users/:userId/onboarding-status',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const status = await userService.getOnboardingStatus(req.params.userId);

    return res.json(status);
  })
);

/**
 * GET /api/contractors
 * List all contractors
 */
app.get(
  '/api/contractors',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { specialization, minRating, verified, offset, limit } = req.query;

    const result = await userService.listContractors({
      specialization: specialization as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      verified: verified === 'true',
      offset: offset ? parseInt(offset as string) : 0,
      limit: limit ? parseInt(limit as string) : 50,
    });

    return res.json(result);
  })
);

// ============================================
// CONTRACT ROUTES (EXISTING)
// ============================================

/**
 * POST /api/contracts
 * Create new contract from accepted bid
 */
app.post(
  '/api/contracts',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const contract = await bidContractService.createContract(req.body);

    // Create escrow
    await escrowService.createEscrow({
      contractId: contract.id,
      amount: contract.bidAmount,
    });

    // Send notifications
    await notificationService.sendContractCreatedNotification({
      contractorId: contract.contractorId,
      homeownerId: contract.homeownerId,
      contractId: contract.id,
      amount: contract.bidAmount,
    });

    return res.status(201).json(contract);
  })
);

/**
 * GET /api/contracts/:contractId
 * Get contract details
 */
app.get(
  '/api/contracts/:contractId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const contract = await bidContractService.getContract(req.params.contractId);

    if (!contract) {
      return res.status(404).json({
        error: 'Contract not found',
        code: 'NOT_FOUND',
      });
    }

    return res.json(contract);
  })
);

/**
 * GET /api/contracts/job/:jobId
 * Get all contracts for a job
 */
app.get(
  '/api/contracts/job/:jobId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const contracts = await bidContractService.getContractsByJob(req.params.jobId);

    return res.json(contracts);
  })
);

/**
 * PATCH /api/contracts/:contractId
 * Update contract status
 */
app.patch(
  '/api/contracts/:contractId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const contract = await bidContractService.updateContract(req.params.contractId, req.body);

    return res.json(contract);
  })
);

// ============================================
// COMPLETION ROUTES (EXISTING)
// ============================================

/**
 * POST /api/completions
 * Submit job completion
 */
app.post(
  '/api/completions',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const completion = await jobCompletionService.createCompletion(req.body);

    // Send notification
    await notificationService.sendCompletionSubmittedNotification({
      homeownerId: completion.jobId,
      contractId: completion.contractId,
      completionId: completion.id,
      disputeWindowExpires: new Date(completion.disputeWindowExpiresAt),
    });

    return res.status(201).json(completion);
  })
);

/**
 * GET /api/completions/:completionId
 * Get completion details
 */
app.get(
  '/api/completions/:completionId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const completion = await jobCompletionService.getCompletion(req.params.completionId);

    if (!completion) {
      return res.status(404).json({
        error: 'Completion not found',
        code: 'NOT_FOUND',
      });
    }

    return res.json(completion);
  })
);

/**
 * PATCH /api/completions/:completionId/approve
 * Approve job completion
 */
app.patch(
  '/api/completions/:completionId/approve',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const completion = await jobCompletionService.approveCompletion(
      req.params.completionId,
      req.body
    );

    // Release payment
    const contract = await bidContractService.getContract(completion.contractId);
    if (contract) {
      await escrowService.releaseFinalPayment({
        contractId: contract.id,
        amount: contract.bidAmount * 0.75,
      });

      // Send notification
      await notificationService.sendPaymentReleasedNotification({
        contractorId: contract.contractorId,
        contractId: contract.id,
        amount: contract.bidAmount * 0.75,
        estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    return res.json(completion);
  })
);

/**
 * PATCH /api/completions/:completionId/dispute
 * Initiate dispute on completion
 */
app.patch(
  '/api/completions/:completionId/dispute',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const completion = await jobCompletionService.getCompletion(req.params.completionId);
    const contract = await bidContractService.getContract(completion.contractId);

    const dispute = await disputeService.initiateDispute({
      completionId: req.params.completionId,
      contractId: completion.contractId,
      jobId: completion.jobId,
      homeownerId: contract.homeownerId,
      contractorId: contract.contractorId,
      reason: req.body.reason,
      description: req.body.description,
      evidenceUrls: req.body.evidenceUrls,
    });

    return res.status(201).json(dispute);
  })
);

// ============================================
// DISPUTE ROUTES (EXISTING)
// ============================================

/**
 * GET /api/disputes/:disputeId
 * Get dispute details
 */
app.get(
  '/api/disputes/:disputeId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const dispute = await disputeService.getDispute(req.params.disputeId);

    if (!dispute) {
      return res.status(404).json({
        error: 'Dispute not found',
        code: 'NOT_FOUND',
      });
    }

    return res.json(dispute);
  })
);

/**
 * POST /api/disputes/:disputeId/response
 * Submit contractor response to dispute
 */
app.post(
  '/api/disputes/:disputeId/response',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const dispute = await disputeService.submitDisputeResponse({
      disputeId: req.params.disputeId,
      contractorId: req.userId!,
      responseText: req.body.responseText,
      evidenceUrls: req.body.evidenceUrls,
    });

    return res.json(dispute);
  })
);

/**
 * POST /api/disputes/:disputeId/resolve
 * Resolve dispute (admin/mediator only)
 */
app.post(
  '/api/disputes/:disputeId/resolve',
  authMiddleware,
  authorizationMiddleware(['ADMIN']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const dispute = await disputeService.resolveDispute({
      disputeId: req.params.disputeId,
      resolutionPath: req.body.resolutionPath,
      partialRefundPercentage: req.body.partialRefundPercentage,
      reasoning: req.body.reasoning,
      mediatorId: req.userId,
    });

    return res.json(dispute);
  })
);

// ============================================
// VERIFICATION ROUTES (EXISTING)
// ============================================

/**
 * POST /api/verification/license
 * Verify contractor license
 */
app.post(
  '/api/verification/license',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const verification = await verificationService.verifyLicense(req.body);

    return res.status(201).json(verification);
  })
);

/**
 * POST /api/verification/background-check
 * Request background check
 */
app.post(
  '/api/verification/background-check',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const verification = await verificationService.requestBackgroundCheck(req.body);

    return res.status(201).json(verification);
  })
);

/**
 * POST /api/verification/insurance
 * Verify insurance coverage
 */
app.post(
  '/api/verification/insurance',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const verification = await verificationService.verifyInsurance(req.body);

    return res.status(201).json(verification);
  })
);

/**
 * GET /api/verification/status/:contractorId
 * Get contractor verification status
 */
app.get(
  '/api/verification/status/:contractorId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const status = await verificationService.getContractorVerificationStatus(
      req.params.contractorId
    );

    return res.json(status);
  })
);

// ============================================
// ANALYTICS ROUTES (EXISTING)
// ============================================

/**
 * GET /api/analytics/marketplace
 * Get marketplace metrics
 */
app.get(
  '/api/analytics/marketplace',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const metrics = await analyticsService.getMarketplaceMetrics({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });

    return res.json(metrics);
  })
);

/**
 * GET /api/analytics/contractor/:contractorId
 * Get contractor analytics
 */
app.get(
  '/api/analytics/contractor/:contractorId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const analytics = await analyticsService.getContractorAnalytics(req.params.contractorId);

    return res.json(analytics);
  })
);

/**
 * GET /api/analytics/job/:jobId
 * Get job analytics
 */
app.get(
  '/api/analytics/job/:jobId',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const analytics = await analyticsService.getJobAnalytics(req.params.jobId);

    return res.json(analytics);
  })
);

/**
 * GET /api/analytics/revenue
 * Get revenue metrics
 */
app.get(
  '/api/analytics/revenue',
  authMiddleware,
  authorizationMiddleware(['ADMIN']),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const metrics = await analyticsService.getRevenueMetrics({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    });

    return res.json(metrics);
  })
);

/**
 * GET /api/analytics/trending
 * Get trending metrics
 */
app.get(
  '/api/analytics/trending',
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const metrics = await analyticsService.getTrendingMetrics(
      req.query.days ? parseInt(req.query.days as string) : 30
    );

    return res.json(metrics);
  })
);

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandlerMiddleware);

// ============================================
// 404 HANDLER
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.path,
    method: req.method,
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 FairTradeWorker API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;

/**
 * Enhanced Server - Fully Integrated FairTradeWorker Backend
 * Includes all PHASE 1, 2, 3 services and routes
 *
 * Integration Guide:
 * 1. Replace the content of server.ts with this file (or gradually migrate routes)
 * 2. Import all services as shown below
 * 3. Apply middleware in correct order
 * 4. Wire notification triggers to service methods
 * 5. Test all 30+ endpoints
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import PHASE 1: Security
import { authenticateToken, authorizeRole, authorizeTier } from './middleware/auth';
import { securityHeaders, inputSanitization, requestIdMiddleware, errorHandler, healthCheck } from './middleware/security';
import { validateEnv } from '../src/config/validateEnv';

// Import PHASE 2: Core Services
import { JobService } from './services/jobService';
import { BidService } from './services/bidService';
import { ContractService } from './services/contractService';
import { PaymentService } from './services/paymentService';

// Import PHASE 3: Analytics & Customization
import { AnalyticsAndCustomizationService } from './services/analyticsAndCustomizationService';

// Import Integration & Notifications
import { IntegrationService } from './services/integrationService';
import { NotificationServiceImpl } from './services/notificationServiceImpl';

// Import API Routes
import { router as apiRoutes } from './routes/apiRoutes';

/**
 * Validate environment on startup
 */
validateEnv();

/**
 * Initialize Express app
 */
const app: Express = express();
const PORT = process.env.PORT || 3001;

/**
 * ============================================================
 * PHASE 1: SECURITY MIDDLEWARE SETUP
 * ============================================================
 */

// Security headers
app.use(securityHeaders());

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request ID middleware (for tracing)
app.use(requestIdMiddleware());

// Input sanitization
app.use(inputSanitization());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

/**
 * ============================================================
 * SERVICE INITIALIZATION
 * ============================================================
 */

const jobService = new JobService();
const bidService = new BidService();
const contractService = new ContractService();
const paymentService = new PaymentService();
const analyticsService = new AnalyticsAndCustomizationService();
const integrationService = new IntegrationService();
const notificationService = new NotificationServiceImpl();

console.log('✅ All services initialized');

/**
 * ============================================================
 * HEALTH CHECK ENDPOINT
 * ============================================================
 */

app.get('/health', healthCheck());

/**
 * ============================================================
 * AUTHENTICATION TEST ENDPOINT (for debugging)
 * ============================================================
 */

app.get('/api/test/auth', authenticateToken, (req: any, res: Response) => {
  res.json({
    success: true,
    message: 'Authentication successful',
    user: req.user,
  });
});

/**
 * ============================================================
 * PHASE 2 & 3: API ROUTES
 * ============================================================
 * All routes are defined in routes/apiRoutes.ts
 * Includes:
 * - Jobs (5 endpoints)
 * - Bids (7 endpoints)
 * - Contracts (8 endpoints)
 * - Analytics (5 endpoints)
 * - Customization (5 endpoints)
 */

app.use('/api', apiRoutes);

/**
 * ============================================================
 * SERVICE INTEGRATION EXAMPLES
 * ============================================================
 * These examples show how to wire services together
 * In production, these would be called from the route handlers
 */

/**
 * Example: When a bid is accepted, trigger payment and notifications
 * This is typically called from the route handler
 */
async function exampleBidAcceptanceFlow(bidId: string) {
  try {
    // Get bid details
    const bid = await bidService.getBid(bidId);

    // Accept bid and create contract (returns contractId)
    const acceptResult = await bidService.acceptBid(bid.job.postedById, bidId);

    // Trigger payment (via integration service)
    await integrationService.onBidAccepted(bidId);

    console.log('✅ Bid accepted, payment held, notifications sent');
  } catch (error: any) {
    console.error('Error in bid acceptance flow:', error);
    throw error;
  }
}

/**
 * Example: When completion is approved, release payment
 */
async function exampleCompletionApprovalFlow(completionId: string, rating: number) {
  try {
    // Approve completion and release payment
    await integrationService.onCompletionApproved(completionId, rating);

    console.log('✅ Completion approved, payment released');
  } catch (error: any) {
    console.error('Error in completion approval flow:', error);
    throw error;
  }
}

/**
 * ============================================================
 * ERROR HANDLING & 404 ROUTES
 * ============================================================
 */

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler (MUST BE LAST)
app.use(errorHandler());

/**
 * ============================================================
 * START SERVER
 * ============================================================
 */

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🚀 FairTradeWorker Server Started         ║
║  Port: ${PORT}                             ║
║  Env: ${process.env.NODE_ENV || 'development'}                    ║
║  Database: PostgreSQL (Prisma)             ║
║  Auth: JWT (PHASE 1)                       ║
║  Features: Jobs, Bids, Contracts (PHASE 2) ║
║  Analytics & Customization (PHASE 3)       ║
╚════════════════════════════════════════════╝
  `);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

/**
 * Unhandled promise rejection
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, send to error tracking service (Sentry)
});

/**
 * Export app for testing
 */
export default app;
export { jobService, bidService, contractService, paymentService, analyticsService, integrationService, notificationService };

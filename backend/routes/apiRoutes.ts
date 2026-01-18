/**
 * Complete API Routes for FairTradeWorker
 * PHASE 2 & 3: All endpoints integrated
 * Authentication: JWT required on all routes
 */

import { Router, Request, Response } from 'express';
import { JobService } from '../services/jobService';
import { BidService } from '../services/bidService';
import { ContractService } from '../services/contractService';
import { AnalyticsAndCustomizationService } from '../services/analyticsAndCustomizationService';
import { AdvancedCustomizationService } from '../services/advancedCustomizationService';
import { JobServiceEnhanced } from '../services/jobServiceEnhanced';
import { BidServiceEnhanced } from '../services/bidServiceEnhanced';
import { ContractServiceEnhanced } from '../services/contractServiceEnhanced';
import { PaymentServiceEnhanced } from '../services/paymentServiceEnhanced';
import { NotificationServiceEnhanced } from '../services/notificationServiceEnhanced';
import {
  authenticateToken,
  authorizeRole,
  authorizeTier,
} from '../middleware/auth';
import {
  CreateJobSchema,
  SubmitBidSchema,
  ApproveCompletionSchema,
  CreateDisputeSchema,
} from '../validators/schemas';

const router = Router();

// Services
const jobService = new JobService();
const bidService = new BidService();
const contractService = new ContractService();
const analyticsService = new AnalyticsAndCustomizationService();
const advancedCustomizationService = new AdvancedCustomizationService();

// Enhanced Services
const jobServiceEnhanced = new JobServiceEnhanced();
const bidServiceEnhanced = new BidServiceEnhanced();
const contractServiceEnhanced = new ContractServiceEnhanced();
const paymentServiceEnhanced = new PaymentServiceEnhanced();
const notificationServiceEnhanced = new NotificationServiceEnhanced();

// Types
interface AuthRequest extends Request {
  user?: { id: string; role: string; tier: string; email: string };
}

// ============================================================================
// JOBS ENDPOINTS (5 total)
// ============================================================================

/**
 * POST /api/jobs
 * Create a new job (homeowner only)
 */
router.post('/jobs', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const validation = CreateJobSchema.validate(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const job = await jobService.createJob(req.user!.id, validation.data);
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    console.error('❌ Error creating job:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/:jobId
 * Get job details with all bids
 */
router.get('/jobs/:jobId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const job = await jobService.getJob(req.params.jobId);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs
 * List jobs with filters
 */
router.get('/jobs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { category, status, minBudget, maxBudget, zipCode, page, limit } = req.query;
    const result = await jobService.listJobs({
      status: status as string,
      category: category as string,
      minBudget: minBudget ? parseInt(minBudget as string) : undefined,
      maxBudget: maxBudget ? parseInt(maxBudget as string) : undefined,
      zipCode: zipCode as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/jobs/:jobId
 * Update job (homeowner only)
 */
router.patch('/jobs/:jobId', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const job = await jobService.updateJob(req.params.jobId, req.user!.id, req.body);
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/jobs/:jobId/close
 * Close job (no more bids)
 */
router.post('/jobs/:jobId/close', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    await jobService.closeJob(req.params.jobId, req.user!.id);
    res.json({ success: true, message: 'Job closed' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// BIDS ENDPOINTS (7 total)
// ============================================================================

/**
 * POST /api/bids
 * Submit a new bid (contractor only)
 */
router.post('/bids', authenticateToken, authorizeRole('CONTRACTOR'), async (req: AuthRequest, res: Response) => {
  try {
    const validation = SubmitBidSchema.validate(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const bid = await bidService.submitBid(req.user!.id, validation.data);
    res.status(201).json({ success: true, data: bid });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/:jobId/bids
 * Get all bids on a job (homeowner view)
 */
router.get('/jobs/:jobId/bids', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const bids = await bidService.getJobBids(req.params.jobId);
    res.json({ success: true, data: bids });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/bids/:bidId
 * Get bid details
 */
router.get('/bids/:bidId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const bid = await bidService.getBid(req.params.bidId);
    res.json({ success: true, data: bid });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/bids
 * Get my bids (contractor view)
 */
router.get('/bids', authenticateToken, authorizeRole('CONTRACTOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, page, limit } = req.query;
    const bids = await bidService.getContractorBids(
      req.user!.id,
      status as string
    );

    // Simple pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;
    const paginated = bids.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: paginated,
      total: bids.length,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/bids/:bidId/accept
 * Accept bid and create contract (homeowner only)
 */
router.post('/bids/:bidId/accept', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const contract = await bidService.acceptBid(req.params.bidId, req.user!.id);
    res.status(201).json({ success: true, data: contract, message: 'Bid accepted and contract created' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/bids/:bidId/reject
 * Reject a bid (homeowner only)
 */
router.post('/bids/:bidId/reject', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    await bidService.rejectBid(req.params.bidId, req.user!.id);
    res.json({ success: true, message: 'Bid rejected' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/bids/:bidId/withdraw
 * Withdraw bid (contractor only)
 */
router.post('/bids/:bidId/withdraw', authenticateToken, authorizeRole('CONTRACTOR'), async (req: AuthRequest, res: Response) => {
  try {
    await bidService.withdrawBid(req.params.bidId, req.user!.id);
    res.json({ success: true, message: 'Bid withdrawn' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CONTRACTS ENDPOINTS (8 total)
// ============================================================================

/**
 * GET /api/contracts/:contractId
 * Get contract details
 */
router.get('/contracts/:contractId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const contract = await contractService.getContract(req.params.contractId);
    res.json({ success: true, data: contract });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/contracts
 * List contracts for user
 */
router.get('/contracts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { role, status } = req.query;

    let contracts;
    if (req.user!.role === 'HOMEOWNER') {
      contracts = await contractService.getHomeownerContracts(req.user!.id, status as string);
    } else if (req.user!.role === 'CONTRACTOR') {
      contracts = await contractService.getContractorContracts(req.user!.id, status as string);
    } else {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    res.json({ success: true, data: contracts });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/contracts/:contractId/complete
 * Submit job completion (contractor only)
 */
router.post(
  '/contracts/:contractId/complete',
  authenticateToken,
  authorizeRole('CONTRACTOR'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { photos, videos, notes, geolocation } = req.body;

      const completion = await contractService.submitCompletion(
        req.params.contractId,
        req.user!.id,
        { photos, videos, notes, geolocation }
      );

      res.status(201).json({ success: true, data: completion, message: 'Completion submitted' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/contracts/:contractId/completion/approve
 * Approve or reject completion (homeowner only)
 */
router.post(
  '/contracts/:contractId/completion/approve',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  async (req: AuthRequest, res: Response) => {
    try {
      const validation = ApproveCompletionSchema.validate(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      const { completionId, approved, rating, feedback } = validation.data;
      const completion = await contractService.approveCompletion(
        completionId,
        req.user!.id,
        { approved, rating, feedback }
      );

      res.json({
        success: true,
        data: completion,
        message: approved ? 'Completion approved' : 'Completion rejected',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/contracts/:contractId/change-order
 * Create change order (contractor only)
 */
router.post(
  '/contracts/:contractId/change-order',
  authenticateToken,
  authorizeRole('CONTRACTOR'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, amount } = req.body;

      const changeOrder = await contractService.createChangeOrder(
        req.params.contractId,
        req.user!.id,
        { title, description, amount }
      );

      res.status(201).json({ success: true, data: changeOrder });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/contracts/:contractId/change-order/:changeOrderId/approve
 * Approve or reject change order (homeowner only)
 */
router.post(
  '/contracts/:contractId/change-order/:changeOrderId/approve',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { approved } = req.body;

      await contractService.approveChangeOrder(
        req.params.changeOrderId,
        req.user!.id,
        approved
      );

      res.json({
        success: true,
        message: approved ? 'Change order approved' : 'Change order rejected',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/contracts/:contractId/cancel
 * Cancel contract
 */
router.post('/contracts/:contractId/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;

    await contractService.cancelContract(req.params.contractId, req.user!.id, reason);

    res.json({ success: true, message: 'Contract cancelled' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS (5 total)
// ============================================================================

/**
 * GET /api/analytics/bids
 * Get bid analytics (contractor view)
 */
router.get('/analytics/bids', authenticateToken, authorizeRole('CONTRACTOR'), async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await analyticsService.getBidAnalytics(req.user!.id);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/analytics/revenue
 * Get revenue analytics (contractor view)
 */
router.get(
  '/analytics/revenue',
  authenticateToken,
  authorizeRole('CONTRACTOR'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { days } = req.query;
      const analytics = await analyticsService.getRevenueAnalytics(
        req.user!.id,
        days ? parseInt(days as string) : 30
      );

      res.json({ success: true, data: analytics });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/dashboard/homeowner
 * Get homeowner dashboard metrics
 */
router.get(
  '/analytics/dashboard/homeowner',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  async (req: AuthRequest, res: Response) => {
    try {
      const dashboard = await analyticsService.getHomeownerDashboard(req.user!.id);
      res.json({ success: true, data: dashboard });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/platform
 * Get platform metrics (admin only)
 */
router.get(
  '/analytics/platform',
  authenticateToken,
  authorizeRole('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const metrics = await analyticsService.getPlatformMetrics();
      res.json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/export
 * Export analytics as CSV
 */
router.get(
  '/analytics/export',
  authenticateToken,
  authorizeRole('CONTRACTOR'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { type } = req.query;
      const csv = await analyticsService.exportAnalyticsCSV(req.user!.id, (type as string) || 'bids');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics_${Date.now()}.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
);

// ============================================================================
// CUSTOMIZATION ENDPOINTS (5 total)
// ============================================================================

/**
 * GET /api/customization
 * Get user customization settings
 */
router.get('/customization', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customization = await analyticsService.getCustomization(req.user!.id);
    res.json({ success: true, data: customization });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/customization
 * Update customization settings
 */
router.patch('/customization', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customization = await analyticsService.updateCustomization(req.user!.id, req.body);
    res.json({ success: true, data: customization });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/customization/presets
 * Get available theme presets
 */
router.get('/customization/presets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const presets = analyticsService.getAvailablePresets();
    res.json({ success: true, data: presets });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/customization/preset/:presetName
 * Apply a theme preset
 */
router.post('/customization/preset/:presetName', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const presets = analyticsService.getAvailablePresets();
    const preset = presets[req.params.presetName];

    if (!preset) {
      return res.status(404).json({ success: false, error: 'Preset not found' });
    }

    const customization = await analyticsService.updateCustomization(req.user!.id, preset);
    res.json({ success: true, data: customization, message: `Preset "${req.params.presetName}" applied` });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/customization/features
 * Get available customization features by tier
 */
router.get('/customization/features', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const tierFeatures = analyticsService.getCustomizationTierFeatures();
    const currentTierFeatures = tierFeatures[req.user!.tier] || tierFeatures['FREE'];

    res.json({
      success: true,
      data: {
        currentTier: req.user!.tier,
        availableFeatures: currentTierFeatures,
        allTiers: tierFeatures,
      },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ADVANCED CUSTOMIZATION ENDPOINTS (10+ additional)
// ============================================================================

/**
 * GET /api/customization/all
 * Get ALL 100+ customization options
 */
router.get('/customization/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customization = await advancedCustomizationService.getFullCustomization(req.user!.id);
    res.json({ success: true, data: customization, totalOptions: 130 });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/customization/batch
 * Update multiple customization options at once
 */
router.patch('/customization/batch', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customization = await advancedCustomizationService.updateFullCustomization(req.user!.id, req.body);
    res.json({ success: true, data: customization, message: 'Batch update applied' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/customization/category/:category
 * Get customization options by category
 */
router.get('/customization/category/:category', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const allSettings = await advancedCustomizationService.getFullCustomization(req.user!.id);
    const categorySettings = advancedCustomizationService.getCustomizationByCategory(
      allSettings,
      req.params.category
    );

    if (!categorySettings) {
      return res.status(404).json({
        success: false,
        error: 'Category not found. Available: colors, typography, layout, effects, animations, darkMode, navigation, components, accessibility, branding, notifications, privacy',
      });
    }

    res.json({ success: true, data: categorySettings, category: req.params.category });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/customization/category/:category
 * Update specific category of customization
 */
router.patch('/customization/category/:category', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    const customization = await advancedCustomizationService.updateFullCustomization(req.user!.id, updates);

    const categorySettings = advancedCustomizationService.getCustomizationByCategory(
      customization,
      req.params.category
    );

    res.json({
      success: true,
      data: categorySettings,
      category: req.params.category,
      message: `Category "${req.params.category}" updated`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/customization/presets/advanced
 * Get all 12 advanced preset templates
 */
router.get('/customization/presets/advanced', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const presets = advancedCustomizationService.getAdvancedPresets();
    res.json({
      success: true,
      data: presets,
      totalPresets: Object.keys(presets).length,
      message: '12 advanced preset templates available',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/customization/preset/advanced/:presetName
 * Apply advanced preset
 */
router.post('/customization/preset/advanced/:presetName', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const presets = advancedCustomizationService.getAdvancedPresets();
    const preset = presets[req.params.presetName];

    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Preset not found',
        availablePresets: Object.keys(presets),
      });
    }

    const customization = await advancedCustomizationService.updateFullCustomization(req.user!.id, preset);
    res.json({
      success: true,
      data: customization,
      message: `Advanced preset "${req.params.presetName}" applied successfully`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/customization/reset
 * Reset customization to defaults
 */
router.post('/customization/reset', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const customization = await advancedCustomizationService.resetCustomization(req.user!.id);
    res.json({ success: true, data: customization, message: 'Customization reset to defaults' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/customization/export
 * Export customization as JSON
 */
router.get('/customization/export', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const jsonData = await advancedCustomizationService.exportCustomization(req.user!.id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="customization.json"');
    res.send(jsonData);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/customization/import
 * Import customization from JSON
 */
router.post('/customization/import', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.body.json) {
      return res.status(400).json({ success: false, error: 'JSON data required in request body' });
    }

    const customization = await advancedCustomizationService.importCustomization(req.user!.id, req.body.json);
    res.json({ success: true, data: customization, message: 'Customization imported successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/customization/stats
 * Get customization usage statistics (admin only)
 */
router.get('/customization/stats', authenticateToken, authorizeRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await advancedCustomizationService.getCustomizationStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/customization/categories
 * List all available customization categories
 */
router.get('/customization/categories', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const categories = [
      { name: 'colors', label: 'Colors & Visual', optionCount: 20 },
      { name: 'typography', label: 'Typography & Fonts', optionCount: 20 },
      { name: 'layout', label: 'Layout & Spacing', optionCount: 15 },
      { name: 'effects', label: 'Effects & Shadows', optionCount: 15 },
      { name: 'animations', label: 'Animations & Transitions', optionCount: 15 },
      { name: 'darkMode', label: 'Dark Mode & Themes', optionCount: 10 },
      { name: 'navigation', label: 'Navigation & Layout', optionCount: 15 },
      { name: 'components', label: 'Components & Elements', optionCount: 20 },
      { name: 'accessibility', label: 'Accessibility', optionCount: 20 },
      { name: 'branding', label: 'Branding & Identity', optionCount: 15 },
      { name: 'notifications', label: 'Notifications & Alerts', optionCount: 15 },
      { name: 'privacy', label: 'Data & Privacy', optionCount: 10 },
    ];

    res.json({
      success: true,
      data: categories,
      totalCategories: categories.length,
      totalOptions: 180,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/customization/defaults
 * Get default customization theme
 */
router.get('/customization/defaults', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const defaults = advancedCustomizationService.getDefaultCustomization();
    res.json({ success: true, data: defaults, message: 'Default customization theme' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ENHANCED JOB SERVICE ENDPOINTS (7 new endpoints)
// ============================================================================

/**
 * GET /api/jobs/search/advanced
 * Advanced job search with multiple filters
 */
router.get('/jobs/search/advanced', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      category: req.query.category as string,
      minBudget: req.query.minBudget ? parseInt(req.query.minBudget as string) : undefined,
      maxBudget: req.query.maxBudget ? parseInt(req.query.maxBudget as string) : undefined,
      location: req.query.location as string,
      zipCode: req.query.zipCode as string,
      radiusMiles: req.query.radiusMiles ? parseInt(req.query.radiusMiles as string) : undefined,
      status: (req.query.status as string) || 'OPEN',
      minimumContractorRating: req.query.minimumContractorRating ? parseInt(req.query.minimumContractorRating as string) : undefined,
      postedAfter: req.query.postedAfter ? new Date(req.query.postedAfter as string) : undefined,
      postedBefore: req.query.postedBefore ? new Date(req.query.postedBefore as string) : undefined,
      hasImages: req.query.hasImages === 'true',
      urgency: req.query.urgency as string,
      estimatedDaysMin: req.query.estimatedDaysMin ? parseInt(req.query.estimatedDaysMin as string) : undefined,
      estimatedDaysMax: req.query.estimatedDaysMax ? parseInt(req.query.estimatedDaysMax as string) : undefined,
    };
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await jobServiceEnhanced.searchJobs(filters, page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/sorted
 * Get jobs with custom sorting
 */
router.get('/jobs/sorted', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      category: req.query.category as string,
      minBudget: req.query.minBudget ? parseInt(req.query.minBudget as string) : undefined,
      maxBudget: req.query.maxBudget ? parseInt(req.query.maxBudget as string) : undefined,
      location: req.query.location as string,
    };
    const sortOptions = {
      sortBy: (req.query.sortBy as string) || 'recent',
      order: (req.query.order as string) || 'desc',
    };
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await jobServiceEnhanced.getJobsSorted(filters, sortOptions, page, limit);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/recommendations/contractor
 * Get intelligent job recommendations for a contractor
 */
router.get('/jobs/recommendations/contractor', authenticateToken, authorizeRole('CONTRACTOR'), async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const recommendations = await jobServiceEnhanced.getJobRecommendationsForContractor(req.user!.id, limit);
    res.json({ success: true, data: recommendations, count: recommendations.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/analytics
 * Get comprehensive job analytics
 */
router.get('/jobs/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      category: req.query.category as string,
      minBudget: req.query.minBudget ? parseInt(req.query.minBudget as string) : undefined,
      maxBudget: req.query.maxBudget ? parseInt(req.query.maxBudget as string) : undefined,
      location: req.query.location as string,
    };

    const analytics = await jobServiceEnhanced.getJobAnalytics(filters);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/:jobId/similar
 * Get similar jobs for recommendations
 */
router.get('/jobs/:jobId/similar', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const similarJobs = await jobServiceEnhanced.getSimilarJobs(req.params.jobId, limit);
    res.json({ success: true, data: similarJobs, count: similarJobs.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/trending
 * Get trending jobs
 */
router.get('/jobs/trending', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const trendingJobs = await jobServiceEnhanced.getTrendingJobs(days, limit);
    res.json({ success: true, data: trendingJobs, count: trendingJobs.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/search/fulltext
 * Full-text search across job titles, descriptions, categories, locations
 */
router.get('/jobs/search/fulltext', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, error: 'Search query must be at least 2 characters' });
    }

    const results = await jobServiceEnhanced.fullTextSearch(query, limit);
    res.json({ success: true, data: results, count: results.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ENHANCED BID SERVICE ENDPOINTS (6 new endpoints)
// ============================================================================

/**
 * GET /api/jobs/:jobId/bids/compare
 * Get detailed bid comparison and analysis
 */
router.get('/jobs/:jobId/bids/compare', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const comparisons = await bidServiceEnhanced.compareBids(req.params.jobId);
    res.json({ success: true, data: comparisons, count: comparisons.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/:jobId/bids/analytics
 * Get comprehensive bid analytics for a job
 */
router.get('/jobs/:jobId/bids/analytics', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await bidServiceEnhanced.getBidAnalytics(req.params.jobId);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/jobs/:jobId/bids/recommendations
 * Get intelligent bid recommendations for homeowner
 */
router.get('/jobs/:jobId/bids/recommendations', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const recommendations = await bidServiceEnhanced.getBidRecommendations(req.params.jobId);
    res.json({ success: true, data: recommendations, count: recommendations.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/contractors/:contractorId/performance
 * Get detailed contractor performance metrics
 */
router.get('/contractors/:contractorId/performance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const performance = await bidServiceEnhanced.getContractorPerformance(req.params.contractorId);
    res.json({ success: true, data: performance });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/market/analysis
 * Get market analysis for bid prices by category and location
 */
router.get('/market/analysis', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const category = req.query.category as string;
    const location = req.query.location as string;

    if (!category) {
      return res.status(400).json({ success: false, error: 'Category parameter required' });
    }

    const analysis = await bidServiceEnhanced.getMarketAnalysis(category, location);
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/bids/recommended
 * Get recommended bids for a contractor
 */
router.get('/bids/recommended', authenticateToken, authorizeRole('CONTRACTOR'), async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const recommendations = await bidServiceEnhanced.getRecommendedBidsForContractor(req.user!.id, limit);
    res.json({ success: true, data: recommendations, count: recommendations.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ENHANCED CONTRACT SERVICE ENDPOINTS (8 new endpoints)
// ============================================================================

/**
 * POST /api/contracts/:contractId/milestones
 * Create a milestone for contract
 */
router.post('/contracts/:contractId/milestones', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, dueDate, targetAmount, deliverables } = req.body;
    const milestone = await contractServiceEnhanced.createMilestone(
      req.params.contractId,
      req.user!.id,
      { title, description, dueDate: new Date(dueDate), targetAmount, deliverables }
    );
    res.status(201).json({ success: true, data: milestone });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/contracts/:contractId/milestones
 * Get all milestones for a contract
 */
router.get('/contracts/:contractId/milestones', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const milestones = await contractServiceEnhanced.getMilestones(req.params.contractId);
    res.json({ success: true, data: milestones, count: milestones.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/contracts/:contractId/milestones/:milestoneId
 * Update a milestone
 */
router.patch('/contracts/:contractId/milestones/:milestoneId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const milestone = await contractServiceEnhanced.updateMilestone(
      req.params.milestoneId,
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: milestone });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/contracts/:contractId/progress
 * Get comprehensive contract progress tracking
 */
router.get('/contracts/:contractId/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await contractServiceEnhanced.getContractProgress(req.params.contractId);
    res.json({ success: true, data: progress });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/contracts/:contractId/health
 * Get contract health analysis
 */
router.get('/contracts/:contractId/health', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const health = await contractServiceEnhanced.getContractHealth(req.params.contractId);
    res.json({ success: true, data: health });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/contracts/:contractId/analytics
 * Get contract analytics and detailed metrics
 */
router.get('/contracts/:contractId/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await contractServiceEnhanced.getContractAnalytics(req.params.contractId);
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/contracts/:contractId/change-orders
 * Get all change orders for a contract
 */
router.get('/contracts/:contractId/change-orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const changeOrders = await contractServiceEnhanced.getChangeOrders(req.params.contractId);
    res.json({ success: true, data: changeOrders, count: changeOrders.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/contracts/:contractId/milestones/:milestoneId/complete
 * Mark a milestone as complete
 */
router.patch('/contracts/:contractId/milestones/:milestoneId/complete', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const milestone = await contractServiceEnhanced.completeMilestone(
      req.params.milestoneId,
      req.user!.id
    );
    res.json({ success: true, data: milestone, message: 'Milestone marked as complete' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ENHANCED PAYMENT SERVICE ENDPOINTS (8 new endpoints)
// ============================================================================

/**
 * POST /api/payments/escrow/create
 * Create escrow account for contract
 */
router.post('/payments/escrow/create', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const { contractId, totalAmount } = req.body;
    const escrow = await paymentServiceEnhanced.createEscrowAccount(
      contractId,
      totalAmount,
      req.user!.id
    );
    res.status(201).json({ success: true, data: escrow });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payments/escrow/:escrowId
 * Get escrow account details
 */
router.get('/payments/escrow/:escrowId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const escrow = await paymentServiceEnhanced.getEscrowAccount(req.params.escrowId);
    res.json({ success: true, data: escrow });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payments/escrow/:escrowId/deposit
 * Process deposit into escrow
 */
router.post('/payments/escrow/:escrowId/deposit', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const { amount, paymentMethodId } = req.body;
    const receipt = await paymentServiceEnhanced.processDeposit(
      req.params.escrowId,
      amount,
      paymentMethodId,
      req.user!.id
    );
    res.status(201).json({ success: true, data: receipt });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payments/escrow/:escrowId/release/milestone
 * Release payment for milestone completion
 */
router.post('/payments/escrow/:escrowId/release/milestone', authenticateToken, authorizeRole('HOMEOWNER'), async (req: AuthRequest, res: Response) => {
  try {
    const { milestoneId } = req.body;
    const release = await paymentServiceEnhanced.releaseMilestonePayment(
      req.params.escrowId,
      milestoneId,
      req.user!.id
    );
    res.json({ success: true, data: release, message: 'Payment released for milestone' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payments/escrow/:escrowId/history
 * Get payment history for escrow account
 */
router.get('/payments/escrow/:escrowId/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const history = await paymentServiceEnhanced.getPaymentHistory(req.params.escrowId);
    res.json({ success: true, data: history, count: history.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payments/contract/:contractId/summary
 * Get payment summary for contract
 */
router.get('/payments/contract/:contractId/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const summary = await paymentServiceEnhanced.getPaymentSummary(req.params.contractId);
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/payments/dispute
 * Create payment dispute
 */
router.post('/payments/dispute', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { contractId, reason, evidence } = req.body;
    const dispute = await paymentServiceEnhanced.createDispute(
      contractId,
      req.user!.id,
      { reason, evidence }
    );
    res.status(201).json({ success: true, data: dispute });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/payments/contract/:contractId/disputes
 * Get disputes for contract
 */
router.get('/payments/contract/:contractId/disputes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const disputes = await paymentServiceEnhanced.getDisputeRecords(req.params.contractId);
    res.json({ success: true, data: disputes, count: disputes.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ENHANCED NOTIFICATION SERVICE ENDPOINTS (6 new endpoints)
// ============================================================================

/**
 * POST /api/notifications/send
 * Send notification via template
 */
router.post('/notifications/send', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { templateId, variables, channels } = req.body;
    const logs = await notificationServiceEnhanced.sendNotification(
      req.user!.id,
      templateId,
      variables,
      channels
    );
    res.status(201).json({ success: true, data: logs, count: logs.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/notifications/schedule
 * Schedule notification for later
 */
router.post('/notifications/schedule', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { templateId, scheduledFor, variables, channels } = req.body;
    const schedule = await notificationServiceEnhanced.scheduleNotification(
      req.user!.id,
      templateId,
      new Date(scheduledFor),
      variables,
      channels
    );
    res.status(201).json({ success: true, data: schedule });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences for user
 */
router.get('/notifications/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const preferences = await notificationServiceEnhanced.getUserPreferences(req.user!.id);
    res.json({ success: true, data: preferences });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/notifications/preferences
 * Update notification preferences
 */
router.patch('/notifications/preferences', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const preferences = await notificationServiceEnhanced.updateUserPreferences(req.user!.id, req.body);
    res.json({ success: true, data: preferences, message: 'Preferences updated' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/history
 * Get notification history
 */
router.get('/notifications/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const history = await notificationServiceEnhanced.getNotificationHistory(req.user!.id, limit);
    res.json({ success: true, data: history, count: history.length });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics (admin only)
 */
router.get('/notifications/stats', authenticateToken, authorizeRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    const stats = await notificationServiceEnhanced.getNotificationStats(startDate, endDate);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;

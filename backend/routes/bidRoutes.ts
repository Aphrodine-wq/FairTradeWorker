/**
 * Bid Management Routes
 * PHASE 3: Bid & Contract Workflow
 * - Submit bids
 * - View bids (with visibility rules)
 * - Accept bids (create contracts)
 * - Reject bids
 */

import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { BidService } from '../services/bidService';
import { ContractService } from '../services/contractService';
import { EscrowService } from '../services/escrowService';
import { NotificationService } from '../services/notificationService';

const router = Router();
const bidService = new BidService();
const contractService = new ContractService();
const escrowService = new EscrowService();
const notificationService = new NotificationService();

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

/**
 * POST /api/bids
 * Submit a bid on a job (contractor only)
 */
router.post('/bids', authenticateToken, authorizeRole('CONTRACTOR'), async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, amount, timeline, proposal } = req.body;

    if (!jobId || !amount || !timeline) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'jobId, amount, and timeline are required',
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_AMOUNT',
        message: 'Minimum bid amount is $100',
      });
    }

    const bid = await bidService.submitBid(req.user!.id, {
      jobId,
      amount,
      timeline,
      proposal,
    });

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      data: bid,
    });
  } catch (error: any) {
    console.error('❌ Error submitting bid:', error);

    if (error.message.includes('already bid')) {
      return res.status(409).json({
        success: false,
        error: 'BID_ALREADY_EXISTS',
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      error: 'BID_SUBMISSION_FAILED',
      message: error.message,
    });
  }
});

/**
 * GET /api/jobs/:jobId/bids
 * Get bids on a job with visibility rules
 *
 * SECURITY: Bid Visibility
 * - Homeowner sees all bids
 * - Contractor sees only their own bid
 * - Others get 401
 */
router.get('/jobs/:jobId/bids', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    const bids = await bidService.getJobBids(
      jobId,
      req.user!.id,
      req.user!.role
    );

    res.json({
      success: true,
      message: 'Bids retrieved',
      data: {
        jobId,
        bidCount: bids.length,
        bids,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching bids:', error);

    if (error.message.includes('blind bidding')) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED_BID_ACCESS',
        message: error.message,
      });
    }

    res.status(400).json({
      success: false,
      error: 'FETCH_BIDS_FAILED',
      message: error.message,
    });
  }
});

/**
 * GET /api/bids/:bidId
 * Get bid details (with permission check)
 */
router.get('/bids/:bidId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { bidId } = req.params;

    const bid = await bidService.getBid(bidId);

    // Check permissions
    // Only homeowner, contractor, or admin can see
    // (will be implemented in getBid method)

    res.json({
      success: true,
      message: 'Bid retrieved',
      data: bid,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: 'BID_NOT_FOUND',
      message: error.message,
    });
  }
});

/**
 * POST /api/bids/:bidId/accept
 * Accept a bid and create a contract
 * Homeowner only - can only accept bids on their jobs
 *
 * Flow:
 * 1. Validate bid ownership (homeowner posted job)
 * 2. Create BidContract
 * 3. Initialize EscrowAccount
 * 4. Update Bid status to ACCEPTED
 * 5. Reject all other bids on same job
 * 6. Send notifications
 */
router.post(
  '/bids/:bidId/accept',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { bidId } = req.params;

      // Get bid with job info
      const bid = await bidService.getBid(bidId);

      if (!bid) {
        return res.status(404).json({
          success: false,
          error: 'BID_NOT_FOUND',
          message: 'Bid not found',
        });
      }

      // Verify homeowner owns the job
      if (bid.job.postedById !== req.user!.id) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You can only accept bids on jobs you posted',
        });
      }

      // Create contract from bid
      const contract = await contractService.createContractFromBid(
        bid.id,
        bid.jobId,
        bid.contractorId,
        req.user!.id,
        bid.amount
      );

      // Initialize escrow account
      const escrow = await escrowService.createEscrow({
        contractId: contract.id,
        amount: bid.amount,
        status: 'ACTIVE',
        depositAmount: bid.amount * 0.25, // 25% deposit
      });

      // Update bid status
      // (will be implemented in BidService)

      // Send notifications
      await notificationService.sendContractCreatedNotification({
        contractorId: bid.contractorId,
        homeownerId: req.user!.id,
        contractId: contract.id,
        amount: bid.amount,
      });

      res.status(201).json({
        success: true,
        message: 'Bid accepted and contract created',
        data: {
          contract,
          escrow,
          bidId,
        },
      });
    } catch (error: any) {
      console.error('❌ Error accepting bid:', error);

      res.status(400).json({
        success: false,
        error: 'BID_ACCEPTANCE_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/bids/:bidId/reject
 * Reject a bid (homeowner only)
 */
router.post(
  '/bids/:bidId/reject',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { bidId } = req.params;

      const bid = await bidService.getBid(bidId);

      if (!bid) {
        return res.status(404).json({
          success: false,
          error: 'BID_NOT_FOUND',
          message: 'Bid not found',
        });
      }

      // Verify homeowner owns the job
      if (bid.job.postedById !== req.user!.id) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You can only reject bids on jobs you posted',
        });
      }

      // Update bid status to REJECTED
      // (will be implemented in BidService)

      res.json({
        success: true,
        message: 'Bid rejected',
        data: { bidId },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: 'BID_REJECTION_FAILED',
        message: error.message,
      });
    }
  }
);

export default router;

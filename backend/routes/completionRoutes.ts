/**
 * Job Completion Routes
 * PHASE 4: Job Completion & Approval Workflow
 * - Submit completion with photos/evidence
 * - Approve or dispute completion
 * - Release funds on approval
 * - Initiate dispute process
 */

import { Router, Request, Response } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth';
import { ContractService } from '../services/contractService';
import { EscrowService } from '../services/escrowService';
import { NotificationService } from '../services/notificationService';
import { PaymentService } from '../services/paymentService';

const router = Router();
const contractService = new ContractService();
const escrowService = new EscrowService();
const notificationService = new NotificationService();
const paymentService = new PaymentService();

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

/**
 * POST /api/contracts/:contractId/submit-completion
 * Contractor submits job completion with photos/evidence
 *
 * Request body:
 * {
 *   photos: ["url1", "url2", ...],
 *   videos?: ["url1", ...],
 *   notes?: "Completion details",
 *   geolocation?: { latitude, longitude }
 * }
 */
router.post(
  '/contracts/:contractId/submit-completion',
  authenticateToken,
  authorizeRole('CONTRACTOR'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { contractId } = req.params;
      const { photos, videos, notes, geolocation } = req.body;

      // Validation
      if (!photos || !Array.isArray(photos) || photos.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_PHOTOS',
          message: 'At least one photo is required for completion',
        });
      }

      if (photos.length > 20) {
        return res.status(400).json({
          success: false,
          error: 'TOO_MANY_PHOTOS',
          message: 'Maximum 20 photos allowed',
        });
      }

      if (videos && !Array.isArray(videos)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_VIDEOS',
          message: 'Videos must be an array',
        });
      }

      if (videos && videos.length > 5) {
        return res.status(400).json({
          success: false,
          error: 'TOO_MANY_VIDEOS',
          message: 'Maximum 5 videos allowed',
        });
      }

      // Submit completion
      const completion = await contractService.submitCompletion(
        contractId,
        req.user!.id,
        {
          photos,
          videos,
          notes,
          geolocation,
        }
      );

      // Send notification to homeowner
      await notificationService.sendCompletionSubmittedNotification({
        contractId,
        contractorId: req.user!.id,
        homeownerId: completion.contract.homeownerId,
      });

      res.status(201).json({
        success: true,
        message: 'Completion submitted successfully',
        data: completion,
      });
    } catch (error: any) {
      console.error('❌ Error submitting completion:', error);

      if (error.message.includes('Contract not found')) {
        return res.status(404).json({
          success: false,
          error: 'CONTRACT_NOT_FOUND',
          message: 'Contract not found',
        });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You can only submit completion for your own contracts',
        });
      }

      if (error.message.includes('not active')) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_CONTRACT_STATUS',
          message: 'Contract is not active',
        });
      }

      res.status(400).json({
        success: false,
        error: 'COMPLETION_SUBMISSION_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/contracts/:contractId/completion
 * Get completion details for a contract
 */
router.get(
  '/contracts/:contractId/completion',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { contractId } = req.params;

      const contract = await contractService.getContract(contractId);

      if (!contract) {
        return res.status(404).json({
          success: false,
          error: 'CONTRACT_NOT_FOUND',
          message: 'Contract not found',
        });
      }

      // Permission check: only contractor, homeowner, or admin can view
      if (
        req.user!.role !== 'ADMIN' &&
        req.user!.id !== contract.contractorId &&
        req.user!.id !== contract.homeownerId
      ) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You do not have permission to view this completion',
        });
      }

      res.json({
        success: true,
        message: 'Completion retrieved',
        data: contract.completion,
      });
    } catch (error: any) {
      console.error('❌ Error fetching completion:', error);

      res.status(400).json({
        success: false,
        error: 'FETCH_COMPLETION_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/completions/:completionId/approve
 * Homeowner approves completion and triggers fund release
 *
 * Request body:
 * {
 *   approved: true/false,
 *   rating?: 1-5,
 *   feedback?: "review text"
 * }
 */
router.post(
  '/completions/:completionId/approve',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { completionId } = req.params;
      const { approved, rating, feedback } = req.body;

      if (typeof approved !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'MISSING_APPROVAL',
          message: 'approved field is required and must be boolean',
        });
      }

      if (approved && rating) {
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
          return res.status(400).json({
            success: false,
            error: 'INVALID_RATING',
            message: 'Rating must be an integer between 1 and 5',
          });
        }
      }

      // Approve/reject completion
      const completion = await contractService.approveCompletion(
        completionId,
        req.user!.id,
        {
          approved,
          rating,
          feedback,
        }
      );

      // If approved, release final payment
      if (approved && completion.contract) {
        const paymentAmount = completion.contract.finalAmount;
        const platformFee = completion.contract.amount * 0.12;

        // Release funds via escrow
        await escrowService.releaseFinalPayment({
          contractId: completion.contract.id,
          contractorId: completion.contract.contractorId,
          amount: paymentAmount,
          platformFee,
        });

        // Trigger payout to contractor
        await paymentService.payoutContractor({
          contractorId: completion.contract.contractorId,
          amount: paymentAmount,
          contractId: completion.contract.id,
        });

        // Send notifications
        await notificationService.sendCompletionApprovedNotification({
          contractId: completion.contract.id,
          contractorId: completion.contract.contractorId,
          homeownerId: req.user!.id,
          rating,
          feedback,
        });
      } else if (!approved) {
        // Send rejection notification
        await notificationService.sendCompletionRejectedNotification({
          contractId: completion.contract.id,
          contractorId: completion.contract.contractorId,
          homeownerId: req.user!.id,
          feedback,
        });
      }

      res.json({
        success: true,
        message: approved ? 'Completion approved' : 'Completion rejected',
        data: {
          completionId,
          status: approved ? 'APPROVED' : 'REJECTED',
          contractId: completion.contract?.id,
        },
      });
    } catch (error: any) {
      console.error('❌ Error approving completion:', error);

      if (error.message.includes('Completion not found')) {
        return res.status(404).json({
          success: false,
          error: 'COMPLETION_NOT_FOUND',
          message: 'Completion not found',
        });
      }

      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You can only approve completions for your own contracts',
        });
      }

      res.status(400).json({
        success: false,
        error: 'COMPLETION_APPROVAL_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/contracts/:contractId/initiate-dispute
 * Homeowner initiates dispute over completion
 *
 * Request body:
 * {
 *   reason: "Work not completed properly",
 *   evidence: ["photo_url1", "photo_url2"],
 *   requestedResolution: "REFUND|REDO|PARTIAL"
 * }
 */
router.post(
  '/contracts/:contractId/initiate-dispute',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { contractId } = req.params;
      const { reason, evidence, requestedResolution } = req.body;

      if (!reason || reason.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_REASON',
          message: 'Dispute reason must be at least 10 characters',
        });
      }

      if (!['REFUND', 'REDO', 'PARTIAL'].includes(requestedResolution)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_RESOLUTION',
          message: 'requestedResolution must be REFUND, REDO, or PARTIAL',
        });
      }

      const contract = await contractService.getContract(contractId);

      if (!contract) {
        return res.status(404).json({
          success: false,
          error: 'CONTRACT_NOT_FOUND',
          message: 'Contract not found',
        });
      }

      // Verify homeowner
      if (contract.homeownerId !== req.user!.id) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You can only initiate disputes for your own contracts',
        });
      }

      // Check if completion was recently submitted (within dispute window)
      if (contract.completion) {
        const submittedAt = new Date(contract.completion.createdAt);
        const now = new Date();
        const daysPassed = Math.floor(
          (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysPassed > 7) {
          return res.status(400).json({
            success: false,
            error: 'DISPUTE_WINDOW_CLOSED',
            message: 'Disputes must be initiated within 7 days of completion submission',
          });
        }
      }

      // Hold funds in escrow
      await escrowService.holdInDispute({
        contractId,
        amount: contract.amount,
      });

      // Create dispute record (in database)
      // This would call a DisputeService method
      // For now, we're focusing on the flow

      // Send notifications
      await notificationService.sendDisputeInitiatedNotification({
        contractId,
        contractorId: contract.contractorId,
        homeownerId: req.user!.id,
        reason,
        requestedResolution,
      });

      res.status(201).json({
        success: true,
        message: 'Dispute initiated successfully',
        data: {
          contractId,
          status: 'OPEN',
          reason,
          requestedResolution,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('❌ Error initiating dispute:', error);

      res.status(400).json({
        success: false,
        error: 'DISPUTE_INITIATION_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/contracts/:contractId/contest-dispute
 * Contractor responds to dispute with evidence
 *
 * Request body:
 * {
 *   response: "We completed the work as specified",
 *   evidence: ["photo_url1", "photo_url2"],
 *   requestedResolution: "REFUND|REDO|PARTIAL"
 * }
 */
router.post(
  '/contracts/:contractId/contest-dispute',
  authenticateToken,
  authorizeRole('CONTRACTOR'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { contractId } = req.params;
      const { response, evidence, requestedResolution } = req.body;

      if (!response || response.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_RESPONSE',
          message: 'Response must be at least 10 characters',
        });
      }

      const contract = await contractService.getContract(contractId);

      if (!contract) {
        return res.status(404).json({
          success: false,
          error: 'CONTRACT_NOT_FOUND',
          message: 'Contract not found',
        });
      }

      // Verify contractor
      if (contract.contractorId !== req.user!.id) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'You can only contest disputes for your own contracts',
        });
      }

      // Verify there is an active dispute
      if (!contract.dispute || contract.dispute.status !== 'OPEN') {
        return res.status(400).json({
          success: false,
          error: 'NO_ACTIVE_DISPUTE',
          message: 'There is no active dispute for this contract',
        });
      }

      // Send notification to mediator/homeowner
      await notificationService.sendDisputeContestNotification({
        contractId,
        contractorId: req.user!.id,
        homeownerId: contract.homeownerId,
        response,
        evidence,
      });

      res.json({
        success: true,
        message: 'Dispute response submitted successfully',
        data: {
          contractId,
          status: 'CONTESTED',
          response,
          submittedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('❌ Error contesting dispute:', error);

      res.status(400).json({
        success: false,
        error: 'DISPUTE_CONTEST_FAILED',
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/disputes/:disputeId/resolve
 * Admin/Mediator resolves dispute
 *
 * Request body:
 * {
 *   resolution: "REFUND|REDO|PARTIAL_REFUND",
 *   notes: "Resolution notes",
 *   contractorPayout?: 50 (if partial)
 *   homeownerRefund?: 50 (if partial)
 * }
 */
router.post(
  '/disputes/:disputeId/resolve',
  authenticateToken,
  authorizeRole('ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { disputeId } = req.params;
      const { resolution, notes, contractorPayout, homeownerRefund } = req.body;

      if (!['REFUND', 'REDO', 'PARTIAL_REFUND'].includes(resolution)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_RESOLUTION',
          message: 'resolution must be REFUND, REDO, or PARTIAL_REFUND',
        });
      }

      // Get dispute (would be from database in real implementation)
      // const dispute = await disputeService.getDispute(disputeId);

      // For now, simulating the resolution logic
      let refundTransaction;

      if (resolution === 'REFUND') {
        // Full refund to homeowner
        // refundTransaction = await escrowService.refundToHomeowner({ ... });
      } else if (resolution === 'PARTIAL_REFUND') {
        // Split resolution
        if (!contractorPayout || !homeownerRefund) {
          return res.status(400).json({
            success: false,
            error: 'MISSING_AMOUNTS',
            message: 'contractorPayout and homeownerRefund required for partial resolution',
          });
        }

        // refundTransaction = await escrowService.partialRefund({ ... });
      }
      // else REDO: contract remains active, contractor to redo work

      res.json({
        success: true,
        message: 'Dispute resolved successfully',
        data: {
          disputeId,
          resolution,
          notes,
          resolvedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('❌ Error resolving dispute:', error);

      res.status(400).json({
        success: false,
        error: 'DISPUTE_RESOLUTION_FAILED',
        message: error.message,
      });
    }
  }
);

export default router;

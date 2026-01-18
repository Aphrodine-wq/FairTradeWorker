import { JobCompletion } from '../../types';
import { Database } from '../database';

const prisma = new Database();

/**
 * JobCompletionService
 * Manages job completion workflow
 * - Submission with evidence
 * - Homeowner approval with rating
 * - Dispute initiation
 * - Payment release/refund
 */
export class JobCompletionService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  /**
   * Create completion submission from contractor
   */
  async createCompletion(data: {
    contractId: string;
    jobId: string;
    photoUrls: string[];
    videoUrl?: string;
    notes?: string;
    submittedBy: 'CONTRACTOR' | 'HOMEOWNER';
  }): Promise<JobCompletion> {
    if (data.photoUrls.length === 0) {
      throw new Error('At least one photo is required');
    }

    const completionId = `completion_${Date.now()}`;
    const contract = await this.db.contracts.findById(data.contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const completion: JobCompletion = {
      id: completionId,
      contractId: data.contractId,
      jobId: data.jobId,
      submittedBy: data.submittedBy,
      submittedAt: new Date().toISOString(),
      status: 'PENDING_APPROVAL',

      // Evidence
      photoUrls: data.photoUrls,
      videoUrl: data.videoUrl,
      locationGeohash: this.generateGeohash(), // Mock geohash
      timestampSubmitted: new Date().toISOString(),

      // Dispute window (5 days from submission)
      disputeWindowExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),

      // Payout status
      payoutStatus: 'PENDING',
    };

    await this.db.completions.insert(completion);

    // Log
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: data.contractId,
      action: 'COMPLETION_SUBMITTED',
      actor: data.submittedBy,
      timestamp: new Date().toISOString(),
      details: {
        photoCount: data.photoUrls.length,
        hasVideo: !!data.videoUrl,
      },
    });

    return completion;
  }

  /**
   * Get completion record
   */
  async getCompletion(completionId: string): Promise<JobCompletion | null> {
    return await this.db.completions.findById(completionId);
  }

  /**
   * Get all completions for contract
   */
  async getCompletionsByContract(contractId: string): Promise<JobCompletion[]> {
    return await this.db.completions.find({ contractId });
  }

  /**
   * Approve completion (homeowner accepts work)
   */
  async approveCompletion(
    completionId: string,
    data: {
      rating: number; // 1-5 stars
      approvalNotes?: string;
    }
  ): Promise<JobCompletion> {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const completion = await this.getCompletion(completionId);
    if (!completion) {
      throw new Error('Completion not found');
    }

    const updated: JobCompletion = {
      ...completion,
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      approvalNotes: data.approvalNotes,
      homeownerSatisfaction: data.rating,
      payoutStatus: 'RELEASED',
      payoutReleasedAt: new Date().toISOString(),
    };

    await this.db.completions.update(completionId, updated);

    // Record contractor satisfaction score
    const contract = await this.db.contracts.findById(completion.contractId);
    if (contract) {
      await this.recordContractorRating({
        contractorId: contract.contractorId,
        rating: data.rating,
        contractId: completion.contractId,
      });
    }

    // Log
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: completion.contractId,
      action: 'COMPLETION_APPROVED',
      actor: 'HOMEOWNER',
      timestamp: new Date().toISOString(),
      details: {
        rating: data.rating,
        completionId,
      },
    });

    return updated;
  }

  /**
   * Reject completion (homeowner wants rework)
   */
  async rejectCompletion(
    completionId: string,
    data: {
      rejectionReason: string;
      rejectionNotes?: string;
      photosRequired?: string[];
    }
  ): Promise<JobCompletion> {
    const completion = await this.getCompletion(completionId);
    if (!completion) {
      throw new Error('Completion not found');
    }

    const updated: JobCompletion = {
      ...completion,
      status: 'REJECTED',
      rejectionReason: data.rejectionReason,
      rejectionNotes: data.rejectionNotes,
      photosRequired: data.photosRequired,
      payoutStatus: 'HELD_IN_ESCROW',
    };

    await this.db.completions.update(completionId, updated);

    // Log
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: completion.contractId,
      action: 'COMPLETION_REJECTED',
      actor: 'HOMEOWNER',
      timestamp: new Date().toISOString(),
      details: {
        reason: data.rejectionReason,
        notes: data.rejectionNotes,
      },
    });

    return updated;
  }

  /**
   * Initiate dispute on completion
   */
  async initiateDispute(
    completionId: string,
    data: {
      reason: string;
      notes?: string;
    }
  ): Promise<JobCompletion> {
    const completion = await this.getCompletion(completionId);
    if (!completion) {
      throw new Error('Completion not found');
    }

    const updated: JobCompletion = {
      ...completion,
      status: 'DISPUTED',
      disputeInitiatedAt: new Date().toISOString(),
      disputeNotes: data.notes,
      payoutStatus: 'HELD_IN_ESCROW',
    };

    await this.db.completions.update(completionId, updated);

    // Log
    await this.db.auditLog.insert({
      id: `audit_${Date.now()}`,
      contractId: completion.contractId,
      action: 'DISPUTE_INITIATED',
      actor: 'HOMEOWNER',
      timestamp: new Date().toISOString(),
      details: {
        reason: data.reason,
        completionId,
      },
    });

    return updated;
  }

  /**
   * Get completion statistics for contractor
   */
  async getContractorStats(contractorId: string): Promise<{
    completionRate: number; // % of jobs completed
    averageRating: number; // 1-5 stars
    totalJobsCompleted: number;
    disputeRate: number; // % of completions that went to dispute
  }> {
    const contracts = await this.db.contracts.find({ contractorId });
    const completions = await Promise.all(
      contracts.map(c => this.getCompletionsByContract(c.id))
    );

    const flatCompletions = completions.flat();
    const approvedCount = flatCompletions.filter(c => c.status === 'APPROVED').length;
    const disputedCount = flatCompletions.filter(c => c.status === 'DISPUTED').length;

    const ratings = approvedCount > 0
      ? flatCompletions
        .filter(c => c.homeownerSatisfaction)
        .reduce((sum, c) => sum + (c.homeownerSatisfaction || 0), 0) / approvedCount
      : 0;

    return {
      completionRate: contracts.length > 0 ? (approvedCount / contracts.length) * 100 : 0,
      averageRating: ratings,
      totalJobsCompleted: approvedCount,
      disputeRate: flatCompletions.length > 0 ? (disputedCount / flatCompletions.length) * 100 : 0,
    };
  }

  /**
   * Check if dispute window is still open
   */
  async isDisputeWindowOpen(completionId: string): Promise<boolean> {
    const completion = await this.getCompletion(completionId);
    if (!completion) {
      throw new Error('Completion not found');
    }

    const expiresAt = new Date(completion.disputeWindowExpiresAt).getTime();
    const now = Date.now();

    return now < expiresAt;
  }

  /**
   * Get time remaining in dispute window (in hours)
   */
  async getDisputeWindowTimeRemaining(completionId: string): Promise<number> {
    const completion = await this.getCompletion(completionId);
    if (!completion) {
      throw new Error('Completion not found');
    }

    const expiresAt = new Date(completion.disputeWindowExpiresAt).getTime();
    const now = Date.now();
    const remainingMs = expiresAt - now;

    return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60)));
  }

  /**
   * Record contractor rating for future analytics
   */
  private async recordContractorRating(data: {
    contractorId: string;
    rating: number;
    contractId: string;
  }): Promise<void> {
    const record = {
      id: `rating_${Date.now()}`,
      contractorId: data.contractorId,
      contractId: data.contractId,
      rating: data.rating,
      recordedAt: new Date().toISOString(),
    };

    await this.db.contractorRatings.insert(record);
  }

  /**
   * Generate mock geohash for location verification
   */
  private generateGeohash(): string {
    const chars = '0123456789bcdefghjkmnpqrstuvwxyz';
    let geohash = '';
    for (let i = 0; i < 9; i++) {
      geohash += chars[Math.floor(Math.random() * chars.length)];
    }
    return geohash;
  }

  /**
   * List completions with filtering
   */
  async listCompletions(
    filter: {
      contractorId?: string;
      homeownerId?: string;
      status?: string;
    },
    pagination: { limit?: number; offset?: number } = {}
  ): Promise<{
    completions: JobCompletion[];
    total: number;
  }> {
    const limit = pagination.limit || 20;
    const offset = pagination.offset || 0;

    let query = filter as any;

    // Build query from filter
    if (filter.contractorId) {
      const contracts = await this.db.contracts.find({ contractorId: filter.contractorId });
      const contractIds = contracts.map(c => c.id);
      query.contractId = { $in: contractIds };
    }

    const completions = await this.db.completions.find(query, {
      skip: offset,
      limit,
      sort: { submittedAt: -1 },
    });

    const total = await this.db.completions.count(query);

    return { completions, total };
  }
}

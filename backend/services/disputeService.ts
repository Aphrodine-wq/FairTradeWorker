import { Database } from '../database';
import { BidContract, JobCompletion, ContractChange } from '../../types';
import { NotificationService } from './notificationService';
import { EscrowService } from './escrowService';

const prisma = new Database();

/**
 * DisputeService
 * Manages dispute lifecycle, mediation, and resolution
 * - Dispute creation from completion rejections
 * - Contractor response handling
 * - Mediation workflow (48-hour window)
 * - Resolution execution (refund, rework, partial refund, arbitration)
 */
export class DisputeService {
  private db: Database;
  private notificationService: NotificationService;
  private escrowService: EscrowService;

  constructor() {
    this.db = new Database();
    this.notificationService = new NotificationService();
    this.escrowService = new EscrowService();
  }

  /**
   * Initiate a dispute from job completion
   */
  async initiateDispute(data: {
    completionId: string;
    contractId: string;
    jobId: string;
    homeownerId: string;
    contractorId: string;
    reason: string;
    description: string;
    evidenceUrls?: string[];
  }): Promise<any> {
    try {
      const dispute = {
        id: `dispute_${Date.now()}`,
        completionId: data.completionId,
        contractId: data.contractId,
        jobId: data.jobId,
        homeownerId: data.homeownerId,
        contractorId: data.contractorId,
        reason: data.reason,
        description: data.description,
        evidenceUrls: data.evidenceUrls || [],
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        mediationDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        initiatedBy: 'HOMEOWNER',
        messages: [
          {
            id: `msg_${Date.now()}`,
            userId: data.homeownerId,
            userRole: 'HOMEOWNER',
            message: data.description,
            attachments: data.evidenceUrls || [],
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // Save dispute to database
      await this.db.disputes.insert(dispute);

      // Update contract dispute status
      const contract = await this.db.bidContracts.findById(data.contractId);
      if (contract) {
        await this.db.bidContracts.update(data.contractId, {
          ...contract,
          disputeStatus: 'PENDING',
          disputeInitiatedBy: 'HOMEOWNER',
          disputeReason: data.reason,
          disputeStartedAt: new Date().toISOString(),
        });
      }

      // Update completion status
      const completion = await this.db.jobCompletions.findById(data.completionId);
      if (completion) {
        await this.db.jobCompletions.update(data.completionId, {
          ...completion,
          status: 'DISPUTED',
          disputeInitiatedAt: new Date().toISOString(),
        });
      }

      // Hold funds in escrow pending resolution
      await this.escrowService.holdInDispute({
        contractId: data.contractId,
        reason: 'DISPUTE_INITIATED',
        notes: `Dispute initiated by homeowner: ${data.reason}`,
      });

      // Notify contractor of dispute
      await this.notificationService.sendDisputeInitiatedNotification({
        contractorId: data.contractorId,
        homeownerId: data.homeownerId,
        contractId: data.contractId,
        disputeReason: data.reason,
      });

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'DISPUTE_INITIATED',
        contractId: data.contractId,
        userId: data.homeownerId,
        details: {
          reason: data.reason,
          description: data.description,
          evidenceCount: data.evidenceUrls?.length || 0,
        },
      });

      return dispute;
    } catch (error) {
      console.error('Error initiating dispute:', error);
      throw error;
    }
  }

  /**
   * Get dispute details
   */
  async getDispute(disputeId: string): Promise<any> {
    try {
      const dispute = await this.db.disputes.findById(disputeId);
      if (!dispute) {
        throw new Error(`Dispute ${disputeId} not found`);
      }
      return dispute;
    } catch (error) {
      console.error('Error getting dispute:', error);
      throw error;
    }
  }

  /**
   * Contractor submits response to dispute
   */
  async submitDisputeResponse(data: {
    disputeId: string;
    contractorId: string;
    responseText: string;
    evidenceUrls?: string[];
  }): Promise<any> {
    try {
      const dispute = await this.db.disputes.findById(data.disputeId);
      if (!dispute) {
        throw new Error(`Dispute ${data.disputeId} not found`);
      }

      // Check mediation deadline hasn't passed
      const deadline = new Date(dispute.mediationDeadline);
      if (new Date() > deadline) {
        throw new Error('Mediation deadline has passed');
      }

      // Add contractor response to messages
      const message = {
        id: `msg_${Date.now()}`,
        userId: data.contractorId,
        userRole: 'CONTRACTOR',
        message: data.responseText,
        attachments: data.evidenceUrls || [],
        timestamp: new Date().toISOString(),
      };

      dispute.messages = dispute.messages || [];
      dispute.messages.push(message);
      dispute.contractorResponseAt = new Date().toISOString();
      dispute.status = 'MEDIATION';

      // Update dispute
      await this.db.disputes.update(data.disputeId, dispute);

      // Update contract dispute status
      const contract = await this.db.bidContracts.findById(dispute.contractId);
      if (contract) {
        await this.db.bidContracts.update(dispute.contractId, {
          ...contract,
          disputeStatus: 'MEDIATION',
        });
      }

      // Notify homeowner
      await this.notificationService.sendDisputeResponseReceivedNotification({
        homeownerId: dispute.homeownerId,
        contractId: dispute.contractId,
        disputeId: data.disputeId,
      });

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'DISPUTE_RESPONSE_SUBMITTED',
        contractId: dispute.contractId,
        userId: data.contractorId,
        details: {
          disputeId: data.disputeId,
          evidenceCount: data.evidenceUrls?.length || 0,
        },
      });

      return dispute;
    } catch (error) {
      console.error('Error submitting dispute response:', error);
      throw error;
    }
  }

  /**
   * Resolve dispute with mediation outcome
   */
  async resolveDispute(data: {
    disputeId: string;
    resolutionPath: 'REFUND' | 'REWORK' | 'PARTIAL_REFUND' | 'ARBITRATION';
    partialRefundPercentage?: number; // 0-100 for PARTIAL_REFUND
    reasoning: string;
    mediatorId?: string;
  }): Promise<any> {
    try {
      const dispute = await this.db.disputes.findById(data.disputeId);
      if (!dispute) {
        throw new Error(`Dispute ${data.disputeId} not found`);
      }

      // Validate resolution path
      if (!['REFUND', 'REWORK', 'PARTIAL_REFUND', 'ARBITRATION'].includes(data.resolutionPath)) {
        throw new Error('Invalid resolution path');
      }

      if (data.resolutionPath === 'PARTIAL_REFUND' && (data.partialRefundPercentage === undefined || data.partialRefundPercentage < 0 || data.partialRefundPercentage > 100)) {
        throw new Error('Invalid partial refund percentage');
      }

      // Get contract and escrow details
      const contract = await this.db.bidContracts.findById(dispute.contractId);
      const escrow = await this.db.escrowAccounts.findByContractId(dispute.contractId);

      if (!contract || !escrow) {
        throw new Error('Contract or escrow account not found');
      }

      // Execute resolution
      let escrowUpdate: any = {
        ...escrow,
        disputeResolution: data.resolutionPath,
        resolvedAt: new Date().toISOString(),
      };

      switch (data.resolutionPath) {
        case 'REFUND':
          // Full refund to homeowner
          escrowUpdate.status = 'REFUNDED';
          await this.escrowService.refundToHomeowner({
            contractId: dispute.contractId,
            reason: `Dispute resolution: ${data.reasoning}`,
          });
          break;

        case 'PARTIAL_REFUND':
          // Split refund based on percentage
          const refundAmount = (escrow.totalAmount * (data.partialRefundPercentage || 50)) / 100;
          escrowUpdate.status = 'PARTIAL_REFUND';
          await this.escrowService.partialRefund({
            contractId: dispute.contractId,
            refundAmount,
            reason: `Dispute resolution: ${data.reasoning}`,
          });
          break;

        case 'REWORK':
          // Hold funds, require contractor to rework
          escrowUpdate.status = 'HELD_FOR_REWORK';
          escrowUpdate.reworkDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          // Notify contractor to rework within 7 days
          await this.notificationService.sendNotification({
            userId: dispute.contractorId,
            type: 'DISPUTE_REWORK_REQUIRED',
            title: 'Rework Required',
            message: `Your work has been disputed. You have 7 days to submit rework before funds are refunded.`,
            actionUrl: `/contracts/${dispute.contractId}`,
            priority: 'CRITICAL',
          });
          break;

        case 'ARBITRATION':
          // Escalate to arbitration, hold funds
          escrowUpdate.status = 'HELD_FOR_ARBITRATION';
          escrowUpdate.arbitrationStartedAt = new Date().toISOString();
          break;
      }

      // Update escrow
      await this.db.escrowAccounts.update(escrow.id, escrowUpdate);

      // Update contract
      const updatedContract = {
        ...contract,
        disputeStatus: 'RESOLVED',
        resolutionPath: data.resolutionPath,
      };
      await this.db.bidContracts.update(dispute.contractId, updatedContract);

      // Update dispute
      dispute.status = 'RESOLVED';
      dispute.resolutionPath = data.resolutionPath;
      dispute.resolutionReasoning = data.reasoning;
      dispute.resolvedAt = new Date().toISOString();
      dispute.mediatorId = data.mediatorId || 'SYSTEM';
      await this.db.disputes.update(data.disputeId, dispute);

      // Notify both parties
      await this.notificationService.sendDisputeResolvedNotification({
        contractorId: dispute.contractorId,
        homeownerId: dispute.homeownerId,
        contractId: dispute.contractId,
        resolutionPath: data.resolutionPath,
        reasoning: data.reasoning,
      });

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'DISPUTE_RESOLVED',
        contractId: dispute.contractId,
        userId: data.mediatorId || 'SYSTEM',
        details: {
          disputeId: data.disputeId,
          resolutionPath: data.resolutionPath,
          reasoning: data.reasoning,
        },
      });

      return dispute;
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  }

  /**
   * Get disputes for a user (homeowner or contractor)
   */
  async getUserDisputes(userId: string, role: 'HOMEOWNER' | 'CONTRACTOR'): Promise<any[]> {
    try {
      const query = role === 'HOMEOWNER' ? { homeownerId: userId } : { contractorId: userId };
      const disputes = await this.db.disputes.find(query, {
        sort: { createdAt: -1 },
        limit: 100,
      });
      return disputes;
    } catch (error) {
      console.error('Error getting user disputes:', error);
      throw error;
    }
  }

  /**
   * Get dispute statistics for mediation/admin dashboard
   */
  async getDisputeStats(dateRange?: { startDate: string; endDate: string }): Promise<any> {
    try {
      const query: any = {};
      if (dateRange) {
        query.createdAt = {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate,
        };
      }

      const disputes = await this.db.disputes.find(query);

      const stats = {
        totalDisputes: disputes.length,
        byStatus: {
          PENDING: disputes.filter((d: any) => d.status === 'PENDING').length,
          MEDIATION: disputes.filter((d: any) => d.status === 'MEDIATION').length,
          RESOLVED: disputes.filter((d: any) => d.status === 'RESOLVED').length,
          ESCALATED: disputes.filter((d: any) => d.status === 'ESCALATED').length,
        },
        byResolution: {
          REFUND: disputes.filter((d: any) => d.resolutionPath === 'REFUND').length,
          REWORK: disputes.filter((d: any) => d.resolutionPath === 'REWORK').length,
          PARTIAL_REFUND: disputes.filter((d: any) => d.resolutionPath === 'PARTIAL_REFUND').length,
          ARBITRATION: disputes.filter((d: any) => d.resolutionPath === 'ARBITRATION').length,
        },
        avgMediationTime: this.calculateAverageMediationTime(disputes),
        medianResolutionAmount: this.calculateMedianResolutionAmount(disputes),
      };

      return stats;
    } catch (error) {
      console.error('Error getting dispute stats:', error);
      throw error;
    }
  }

  /**
   * Check if mediation deadline has passed
   */
  async isMediationDeadlinePassed(disputeId: string): Promise<boolean> {
    try {
      const dispute = await this.db.disputes.findById(disputeId);
      if (!dispute) {
        throw new Error(`Dispute ${disputeId} not found`);
      }

      const deadline = new Date(dispute.mediationDeadline);
      return new Date() > deadline;
    } catch (error) {
      console.error('Error checking mediation deadline:', error);
      throw error;
    }
  }

  /**
   * Get time remaining in mediation window
   */
  async getMediationTimeRemaining(disputeId: string): Promise<number> {
    try {
      const dispute = await this.db.disputes.findById(disputeId);
      if (!dispute) {
        throw new Error(`Dispute ${disputeId} not found`);
      }

      const deadline = new Date(dispute.mediationDeadline);
      const now = new Date();
      const remaining = deadline.getTime() - now.getTime();
      return Math.max(0, remaining);
    } catch (error) {
      console.error('Error getting mediation time remaining:', error);
      throw error;
    }
  }

  /**
   * Private helper: Calculate average mediation time
   */
  private calculateAverageMediationTime(disputes: any[]): string {
    const resolvedDisputes = disputes.filter((d) => d.status === 'RESOLVED' && d.createdAt && d.resolvedAt);
    if (resolvedDisputes.length === 0) return '0h';

    const totalHours = resolvedDisputes.reduce((sum: number, d: any) => {
      const created = new Date(d.createdAt).getTime();
      const resolved = new Date(d.resolvedAt).getTime();
      return sum + (resolved - created) / (1000 * 60 * 60);
    }, 0);

    const avgHours = Math.round(totalHours / resolvedDisputes.length);
    return `${avgHours}h`;
  }

  /**
   * Private helper: Calculate median resolution amount
   */
  private calculateMedianResolutionAmount(disputes: any[]): number {
    const amounts = disputes
      .filter((d: any) => d.status === 'RESOLVED' && d.resolutionAmount)
      .map((d: any) => d.resolutionAmount)
      .sort((a: number, b: number) => a - b);

    if (amounts.length === 0) return 0;
    const mid = Math.floor(amounts.length / 2);
    return amounts.length % 2 === 0 ? (amounts[mid - 1] + amounts[mid]) / 2 : amounts[mid];
  }

  /**
   * Send notification to disputants
   */
  private async sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    channel?: string[];
  }): Promise<void> {
    try {
      await this.notificationService.sendNotification(data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

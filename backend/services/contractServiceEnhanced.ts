/**
 * Enhanced Contract Service - Milestone Tracking & Advanced Management
 * Comprehensive contract lifecycle with milestone-based progress tracking
 */

import prisma from '../../src/services/database';

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  dueDate: Date;
  targetAmount: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  completionDate?: Date;
  deliverables: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MilestoneUpdate {
  title?: string;
  description?: string;
  dueDate?: Date;
  targetAmount?: number;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  deliverables?: string[];
  notes?: string;
}

export interface ContractProgress {
  contractId: string;
  totalMilestones: number;
  completedMilestones: number;
  inProgressMilestones: number;
  blockedMilestones: number;
  overallProgress: number; // 0-100
  timeline: {
    plannedDuration: number;
    actualDuration?: number;
    daysRemaining: number;
    isOnTrack: boolean;
  };
  budget: {
    totalBudget: number;
    allocatedMilestones: number;
    remaining: number;
    percentageUsed: number;
  };
  nextMilestone?: Milestone;
  riskFactors: string[];
}

export interface ChangeOrder {
  id: string;
  contractId: string;
  title: string;
  description: string;
  costAdjustment: number;
  timelineAdjustment: number; // days
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  requestedDate: Date;
  approvedDate?: Date;
  notes?: string;
}

export interface ContractAnalytics {
  contractId: string;
  duration: number;
  daysRemaining: number;
  completionPercentage: number;
  onTimePercentage: number;
  budgetUtilization: number;
  milestonesOnTime: number;
  milestonesLate: number;
  changeOrders: number;
  disputes: number;
  riskScore: number; // 0-100, higher = more risk
  healthScore: number; // 0-100, higher = healthier
  recommendations: string[];
}

export class ContractServiceEnhanced {
  /**
   * Create a milestone for a contract
   */
  async createMilestone(
    contractId: string,
    milestone: Omit<Milestone, 'id' | 'contractId' | 'createdAt' | 'updatedAt'>
  ): Promise<Milestone> {
    try {
      const created = await prisma.milestone.create({
        data: {
          contractId,
          title: milestone.title,
          description: milestone.description,
          dueDate: milestone.dueDate,
          targetAmount: milestone.targetAmount,
          status: 'PENDING',
          deliverables: milestone.deliverables,
          notes: milestone.notes,
        },
      });

      console.log(`✅ Milestone created: ${created.id}`);
      return created as Milestone;
    } catch (error: any) {
      throw new Error(`Failed to create milestone: ${error.message}`);
    }
  }

  /**
   * Update a milestone
   */
  async updateMilestone(milestoneId: string, updates: MilestoneUpdate): Promise<Milestone> {
    try {
      const updated = await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          ...updates,
          ...(updates.status === 'COMPLETED' && { completionDate: new Date() }),
        },
      });

      return updated as Milestone;
    } catch (error: any) {
      throw new Error(`Failed to update milestone: ${error.message}`);
    }
  }

  /**
   * Get all milestones for a contract
   */
  async getMilestones(contractId: string): Promise<Milestone[]> {
    try {
      const milestones = await prisma.milestone.findMany({
        where: { contractId },
        orderBy: { dueDate: 'asc' },
      });

      return milestones as Milestone[];
    } catch (error: any) {
      throw new Error(`Failed to get milestones: ${error.message}`);
    }
  }

  /**
   * Get contract progress with milestone tracking
   */
  async getContractProgress(contractId: string): Promise<ContractProgress> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      const milestones = await this.getMilestones(contractId);

      const completed = milestones.filter((m) => m.status === 'COMPLETED').length;
      const inProgress = milestones.filter((m) => m.status === 'IN_PROGRESS').length;
      const blocked = milestones.filter((m) => m.status === 'BLOCKED').length;
      const overallProgress = milestones.length > 0 ? (completed / milestones.length) * 100 : 0;

      const plannedDuration = Math.ceil(
        (contract.expectedCompletionDate.getTime() - contract.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      const elapsedDays = Math.ceil(
        (new Date().getTime() - contract.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (contract.expectedCompletionDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );

      const allocatedMilestones = milestones.reduce((sum, m) => sum + m.targetAmount, 0);
      const remaining = contract.amount - allocatedMilestones;

      const nextMilestone = milestones.find((m) => m.status !== 'COMPLETED');

      const isOnTrack = overallProgress >= (elapsedDays / plannedDuration) * 100;

      const riskFactors = this.calculateRiskFactors(
        contract,
        milestones,
        overallProgress,
        isOnTrack
      );

      return {
        contractId,
        totalMilestones: milestones.length,
        completedMilestones: completed,
        inProgressMilestones: inProgress,
        blockedMilestones: blocked,
        overallProgress: Math.round(overallProgress),
        timeline: {
          plannedDuration,
          actualDuration: elapsedDays,
          daysRemaining,
          isOnTrack,
        },
        budget: {
          totalBudget: contract.amount,
          allocatedMilestones,
          remaining,
          percentageUsed: (allocatedMilestones / contract.amount) * 100,
        },
        nextMilestone,
        riskFactors,
      };
    } catch (error: any) {
      throw new Error(`Failed to get contract progress: ${error.message}`);
    }
  }

  /**
   * Create a change order
   */
  async createChangeOrder(
    contractId: string,
    changeOrder: Omit<ChangeOrder, 'id' | 'contractId' | 'requestedDate' | 'status' | 'approvedDate'>
  ): Promise<ChangeOrder> {
    try {
      const created = await prisma.changeOrder.create({
        data: {
          contractId,
          title: changeOrder.title,
          description: changeOrder.description,
          costAdjustment: changeOrder.costAdjustment,
          timelineAdjustment: changeOrder.timelineAdjustment,
          reason: changeOrder.reason,
          requestedBy: changeOrder.requestedBy,
          status: 'PENDING',
          notes: changeOrder.notes,
        },
      });

      console.log(`✅ Change order created: ${created.id}`);
      return created as ChangeOrder;
    } catch (error: any) {
      throw new Error(`Failed to create change order: ${error.message}`);
    }
  }

  /**
   * Approve a change order
   */
  async approveChangeOrder(changeOrderId: string): Promise<ChangeOrder> {
    try {
      const changeOrder = await prisma.changeOrder.findUnique({
        where: { id: changeOrderId },
        include: { contract: true },
      });

      if (!changeOrder) {
        throw new Error('Change order not found');
      }

      // Update contract with adjustments
      await prisma.contract.update({
        where: { id: changeOrder.contractId },
        data: {
          amount: { increment: changeOrder.costAdjustment },
          expectedCompletionDate: new Date(
            changeOrder.contract.expectedCompletionDate.getTime() +
              changeOrder.timelineAdjustment * 24 * 60 * 60 * 1000
          ),
        },
      });

      // Update change order status
      const updated = await prisma.changeOrder.update({
        where: { id: changeOrderId },
        data: {
          status: 'APPROVED',
          approvedDate: new Date(),
        },
      });

      return updated as ChangeOrder;
    } catch (error: any) {
      throw new Error(`Failed to approve change order: ${error.message}`);
    }
  }

  /**
   * Reject a change order
   */
  async rejectChangeOrder(changeOrderId: string, reason?: string): Promise<ChangeOrder> {
    try {
      const updated = await prisma.changeOrder.update({
        where: { id: changeOrderId },
        data: {
          status: 'REJECTED',
          notes: reason,
        },
      });

      return updated as ChangeOrder;
    } catch (error: any) {
      throw new Error(`Failed to reject change order: ${error.message}`);
    }
  }

  /**
   * Get all change orders for a contract
   */
  async getChangeOrders(contractId: string): Promise<ChangeOrder[]> {
    try {
      const changeOrders = await prisma.changeOrder.findMany({
        where: { contractId },
        orderBy: { requestedDate: 'desc' },
      });

      return changeOrders as ChangeOrder[];
    } catch (error: any) {
      throw new Error(`Failed to get change orders: ${error.message}`);
    }
  }

  /**
   * Get comprehensive contract analytics
   */
  async getContractAnalytics(contractId: string): Promise<ContractAnalytics> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
      });

      if (!contract) {
        throw new Error('Contract not found');
      }

      const milestones = await this.getMilestones(contractId);
      const changeOrders = await this.getChangeOrders(contractId);

      const completedOnTime = milestones.filter((m) => {
        if (m.status !== 'COMPLETED' || !m.completionDate) return false;
        return m.completionDate <= m.dueDate;
      }).length;

      const completedLate = milestones.filter((m) => {
        if (m.status !== 'COMPLETED' || !m.completionDate) return false;
        return m.completionDate > m.dueDate;
      }).length;

      const duration = Math.ceil(
        (contract.expectedCompletionDate.getTime() - contract.createdAt.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (contract.expectedCompletionDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );

      const completionPercentage = milestones.length > 0 ? (completedOnTime + completedLate) / milestones.length * 100 : 0;

      const budgetUtilization = (contract.amount / contract.amount) * 100; // Simplified

      const riskScore = this.calculateRiskScore(
        milestones,
        changeOrders,
        completedLate,
        daysRemaining
      );

      const healthScore = 100 - riskScore;

      const recommendations = this.generateRecommendations(
        milestones,
        changeOrders,
        riskScore,
        daysRemaining
      );

      return {
        contractId,
        duration,
        daysRemaining,
        completionPercentage: Math.round(completionPercentage),
        onTimePercentage:
          completedOnTime + completedLate > 0
            ? (completedOnTime / (completedOnTime + completedLate)) * 100
            : 0,
        budgetUtilization: Math.round(budgetUtilization),
        milestonesOnTime: completedOnTime,
        milestonesLate: completedLate,
        changeOrders: changeOrders.length,
        disputes: 0, // Would be populated from disputes table
        riskScore,
        healthScore,
        recommendations,
      };
    } catch (error: any) {
      throw new Error(`Failed to get contract analytics: ${error.message}`);
    }
  }

  /**
   * Mark milestone as in progress
   */
  async startMilestone(milestoneId: string): Promise<Milestone> {
    return this.updateMilestone(milestoneId, { status: 'IN_PROGRESS' });
  }

  /**
   * Mark milestone as completed
   */
  async completeMilestone(milestoneId: string, notes?: string): Promise<Milestone> {
    return this.updateMilestone(milestoneId, {
      status: 'COMPLETED',
      notes: notes || undefined,
    });
  }

  /**
   * Block a milestone (due to issues)
   */
  async blockMilestone(milestoneId: string, reason: string): Promise<Milestone> {
    return this.updateMilestone(milestoneId, {
      status: 'BLOCKED',
      notes: reason,
    });
  }

  /**
   * Unblock a milestone
   */
  async unblockMilestone(milestoneId: string, resolution: string): Promise<Milestone> {
    return this.updateMilestone(milestoneId, {
      status: 'PENDING',
      notes: resolution,
    });
  }

  /**
   * Get contract health status
   */
  async getContractHealth(contractId: string): Promise<{
    status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
    score: number;
    issues: string[];
  }> {
    try {
      const analytics = await this.getContractAnalytics(contractId);

      let status: 'HEALTHY' | 'AT_RISK' | 'CRITICAL' = 'HEALTHY';
      const issues: string[] = [];

      if (analytics.riskScore > 70) {
        status = 'CRITICAL';
      } else if (analytics.riskScore > 40) {
        status = 'AT_RISK';
      }

      if (analytics.onTimePercentage < 50) {
        issues.push('Multiple milestones completed late');
      }

      if (analytics.daysRemaining < 7 && analytics.completionPercentage < 80) {
        issues.push('Critical timeline - project may be incomplete');
      }

      if (analytics.changeOrders > 3) {
        issues.push('Excessive change orders - scope creep detected');
      }

      return {
        status,
        score: analytics.healthScore,
        issues,
      };
    } catch (error: any) {
      throw new Error(`Failed to get contract health: ${error.message}`);
    }
  }

  // Helper methods
  private calculateRiskFactors(
    contract: any,
    milestones: Milestone[],
    progress: number,
    isOnTrack: boolean
  ): string[] {
    const factors: string[] = [];

    if (!isOnTrack) {
      factors.push('Project behind schedule');
    }

    const blocked = milestones.filter((m) => m.status === 'BLOCKED').length;
    if (blocked > 0) {
      factors.push(`${blocked} milestone(s) blocked`);
    }

    const overdue = milestones.filter((m) => m.dueDate < new Date() && m.status !== 'COMPLETED');
    if (overdue.length > 0) {
      factors.push(`${overdue.length} overdue milestone(s)`);
    }

    return factors;
  }

  private calculateRiskScore(
    milestones: Milestone[],
    changeOrders: ChangeOrder[],
    lateCompletions: number,
    daysRemaining: number
  ): number {
    let score = 0;

    // Milestone performance (40 points)
    const blocked = milestones.filter((m) => m.status === 'BLOCKED').length;
    score += (blocked / Math.max(milestones.length, 1)) * 40;

    // Late completions (30 points)
    score += (lateCompletions / Math.max(milestones.length, 1)) * 30;

    // Change orders (20 points)
    score += Math.min(20, changeOrders.length * 5);

    // Timeline pressure (10 points)
    if (daysRemaining < 7) score += 10;
    else if (daysRemaining < 14) score += 5;

    return Math.min(100, Math.round(score));
  }

  private generateRecommendations(
    milestones: Milestone[],
    changeOrders: ChangeOrder[],
    riskScore: number,
    daysRemaining: number
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore > 70) {
      recommendations.push('Schedule immediate meeting with contractor to address issues');
    }

    const blocked = milestones.filter((m) => m.status === 'BLOCKED');
    if (blocked.length > 0) {
      recommendations.push('Resolve blocked milestones immediately to get back on track');
    }

    if (changeOrders.length > 3) {
      recommendations.push('Consider scope freeze to prevent further changes');
    }

    if (daysRemaining < 7 && milestones.some((m) => m.status !== 'COMPLETED')) {
      recommendations.push('Verify completion of remaining milestones before deadline');
    }

    return recommendations;
  }
}

import { Database } from '../database';
import { BidContract, Job, JobCompletion } from '../../types';

const prisma = new Database();

/**
 * AnalyticsService
 * Aggregates marketplace metrics and contractor performance data
 * - Marketplace health metrics (bid counts, response times, completion rates)
 * - Contractor performance analytics (win rate, satisfaction, dispute rate)
 * - Job analytics (bid distribution, completion metrics)
 * - Revenue and fee tracking
 */
export class AnalyticsService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  /**
   * Get marketplace overview metrics
   */
  async getMarketplaceMetrics(dateRange?: { startDate: string; endDate: string }): Promise<any> {
    try {
      const query: any = {};
      if (dateRange) {
        query.createdAt = {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate,
        };
      }

      // Get all contracts in date range
      const contracts = await this.db.bidContracts.find(query);
      const completions = await this.db.jobCompletions.find(query);
      const disputes = await this.db.disputes.find(query);
      const jobs = await this.db.jobs.find(query);

      // Calculate metrics
      const totalJobsPosted = jobs.length;
      const totalContractsCreated = contracts.length;
      const totalCompletions = completions.length;
      const totalDisputes = disputes.length;

      const completionRate =
        totalContractsCreated > 0
          ? ((totalCompletions / totalContractsCreated) * 100).toFixed(2)
          : 0;

      const disputeRate =
        totalCompletions > 0 ? ((totalDisputes / totalCompletions) * 100).toFixed(2) : 0;

      // Calculate average contract value
      const totalContractValue = contracts.reduce(
        (sum: number, c: any) => sum + (c.bidAmount || 0),
        0
      );
      const avgContractValue =
        totalContractsCreated > 0
          ? (totalContractValue / totalContractsCreated).toFixed(2)
          : 0;

      // Calculate total platform fees (18% of all completed contracts)
      const completedContracts = contracts.filter(
        (c: any) => c.status === 'COMPLETED' || c.status === 'PAID'
      );
      const totalFeesCollected = completedContracts.reduce(
        (sum: number, c: any) => sum + (c.bidAmount * 0.18 || 0),
        0
      );

      // Bid response time analysis
      const avgBidResponseTime = this.calculateAverageBidResponseTime(contracts);

      return {
        period: dateRange || { startDate: 'all_time', endDate: 'present' },
        jobs: {
          totalPosted: totalJobsPosted,
          totalWithBids: contracts.length,
          totalCompleted: completions.length,
          conversionRate: totalJobsPosted > 0
            ? ((completions.length / totalJobsPosted) * 100).toFixed(2)
            : 0,
        },
        contracts: {
          total: totalContractsCreated,
          byStatus: this.groupContractsByStatus(contracts),
          totalValue: totalContractValue.toFixed(2),
          averageValue: avgContractValue,
        },
        completions: {
          total: totalCompletions,
          rate: completionRate,
          byStatus: this.groupCompletionsByStatus(completions),
        },
        disputes: {
          total: totalDisputes,
          rate: disputeRate,
          byStatus: this.groupDisputesByStatus(disputes),
          byResolution: this.groupDisputesByResolution(disputes),
        },
        performance: {
          avgBidResponseTime,
          platformFees: totalFeesCollected.toFixed(2),
          avgContractorSatisfaction: this.calculateAverageSatisfaction(completions),
        },
      };
    } catch (error) {
      console.error('Error getting marketplace metrics:', error);
      throw error;
    }
  }

  /**
   * Get contractor performance analytics
   */
  async getContractorAnalytics(contractorId: string): Promise<any> {
    try {
      // Get all contractor contracts, completions, and disputes
      const contracts = await this.db.bidContracts.find({ contractorId });
      const completions = await this.db.jobCompletions.find({
        contractId: { $in: contracts.map((c: any) => c.id) },
      });
      const disputes = await this.db.disputes.find({ contractorId });

      // Calculate metrics
      const totalBids = contracts.filter((c: any) => c.status !== 'DRAFT').length;
      const acceptedContracts = contracts.filter(
        (c: any) => c.status !== 'DRAFT' && c.status !== 'CANCELLED'
      ).length;
      const winRate =
        totalBids > 0 ? ((acceptedContracts / totalBids) * 100).toFixed(2) : 0;

      const completedJobs = completions.filter((c: any) => c.status === 'APPROVED').length;
      const completionRate =
        acceptedContracts > 0
          ? ((completedJobs / acceptedContracts) * 100).toFixed(2)
          : 0;

      const totalRevenue = acceptedContracts > 0
        ? contracts
            .filter((c: any) => c.status === 'COMPLETED' || c.status === 'PAID')
            .reduce((sum: number, c: any) => sum + (c.bidAmount * 0.82 || 0), 0) // 82% net
        : 0;

      const avgContractValue =
        acceptedContracts > 0
          ? contracts.reduce((sum: number, c: any) => sum + (c.bidAmount || 0), 0) /
            acceptedContracts
          : 0;

      const avgRating = this.calculateAverageSatisfactionForContractor(completions);
      const disputeRate =
        completedJobs > 0
          ? ((disputes.filter((d: any) => d.status !== 'RESOLVED').length / completedJobs) * 100)
              .toFixed(2)
          : 0;

      // Response time to bids
      const avgResponseTime = this.calculateContractorAvgResponseTime(contracts);

      // Get last 10 completions for recent performance
      const recentCompletions = completions.sort(
        (a: any, b: any) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      const recent10 = recentCompletions.slice(0, 10);
      const recent10ApprovalRate =
        recent10.length > 0
          ? ((recent10.filter((c: any) => c.status === 'APPROVED').length / recent10.length) * 100)
              .toFixed(2)
          : 0;

      return {
        contractorId,
        portfolio: {
          totalBids: totalBids,
          acceptedContracts: acceptedContracts,
          completedJobs: completedJobs,
          winRate: winRate,
          completionRate: completionRate,
        },
        financials: {
          totalRevenue: totalRevenue.toFixed(2),
          averageContractValue: avgContractValue.toFixed(2),
          totalPlatformFeesPaid: (
            contracts.reduce(
              (sum: number, c: any) =>
                c.status === 'COMPLETED' || c.status === 'PAID'
                  ? sum + (c.bidAmount * 0.18 || 0)
                  : sum,
              0
            )
          ).toFixed(2),
        },
        quality: {
          averageRating: avgRating,
          disputeRate: disputeRate,
          recentPerformance: {
            last10Completions: recent10.length,
            last10ApprovalRate: recent10ApprovalRate,
          },
        },
        responsiveness: {
          averageResponseTime: avgResponseTime,
        },
      };
    } catch (error) {
      console.error('Error getting contractor analytics:', error);
      throw error;
    }
  }

  /**
   * Get job analytics
   */
  async getJobAnalytics(jobId: string): Promise<any> {
    try {
      const job = await this.db.jobs.findById(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      // Get all contracts for this job
      const contracts = await this.db.bidContracts.find({ jobId });

      // Get completions for this job
      const completions = await this.db.jobCompletions.find({
        jobId,
      });

      // Get disputes for this job
      const disputes = await this.db.disputes.find({ jobId });

      // Calculate metrics
      const bidCount = contracts.length;
      const avgBidAmount =
        bidCount > 0
          ? (contracts.reduce((sum: number, c: any) => sum + (c.bidAmount || 0), 0) / bidCount)
              .toFixed(2)
          : 0;

      const bidRange =
        bidCount > 0
          ? {
              min: Math.min(...contracts.map((c: any) => c.bidAmount || 0)).toFixed(2),
              max: Math.max(...contracts.map((c: any) => c.bidAmount || 0)).toFixed(2),
            }
          : { min: 0, max: 0 };

      const winningContract = contracts.find(
        (c: any) => c.status === 'ACCEPTED' || c.status === 'ACTIVE' || c.status === 'COMPLETED'
      );

      const completionCount = completions.length;
      const completionRate =
        contracts.length > 0
          ? ((completionCount / Math.max(contracts.filter((c: any) => c.status !== 'DRAFT').length, 1)) *
              100)
              .toFixed(2)
          : 0;

      // Time to completion from posting
      const timeToCompletion =
        completions.length > 0
          ? this.calculateAverageTimeToCompletion(job.postedDate, completions)
          : 'N/A';

      return {
        jobId,
        jobDetails: {
          title: job.title,
          category: job.category,
          location: job.location,
          budgetRange: job.budgetRange,
          postedDate: job.postedDate,
          status: job.status,
        },
        bidding: {
          totalBids: bidCount,
          averageBidAmount: avgBidAmount,
          bidRange,
          bidsPerContractor: bidCount > 0 ? (bidCount / this.countUniqueBidders(contracts)).toFixed(2) : 0,
          bidSpreadPercentage: this.calculateBidSpread(contracts),
        },
        completion: {
          completedCount: completionCount,
          completionRate: completionRate,
          winningContractor: winningContract
            ? {
                contractorId: winningContract.contractorId,
                bidAmount: winningContract.bidAmount,
                acceptedAt: winningContract.acceptedAt,
              }
            : null,
          timeToCompletion: timeToCompletion,
        },
        disputes: {
          totalDisputes: disputes.length,
          disputeRate:
            completionCount > 0
              ? ((disputes.length / completionCount) * 100).toFixed(2)
              : 0,
        },
      };
    } catch (error) {
      console.error('Error getting job analytics:', error);
      throw error;
    }
  }

  /**
   * Get revenue metrics
   */
  async getRevenueMetrics(dateRange?: {
    startDate: string;
    endDate: string;
  }): Promise<any> {
    try {
      const query: any = {};
      if (dateRange) {
        query.completedAt = {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate,
        };
      }

      // Get all completed contracts
      const completedContracts = await this.db.bidContracts.find({
        ...query,
        status: { $in: ['COMPLETED', 'PAID'] },
      });

      const totalContractValue = completedContracts.reduce(
        (sum: number, c: any) => sum + (c.bidAmount || 0),
        0
      );

      const platformFees = totalContractValue * 0.18;
      const contractorPayouts = totalContractValue * 0.82;

      // Get all refunds/disputes
      const disputes = await this.db.disputes.find({
        ...query,
        status: 'RESOLVED',
      });

      const refundedAmount = disputes.reduce((sum: number, d: any) => {
        if (d.resolutionPath === 'REFUND' || d.resolutionPath === 'PARTIAL_REFUND') {
          return sum + (d.resolutionAmount || 0);
        }
        return sum;
      }, 0);

      const netRevenue = platformFees - refundedAmount;

      return {
        period: dateRange || { startDate: 'all_time', endDate: 'present' },
        contractValue: {
          totalValue: totalContractValue.toFixed(2),
          completedContracts: completedContracts.length,
          averageValue: (totalContractValue / Math.max(completedContracts.length, 1)).toFixed(2),
        },
        platformFees: {
          feeRate: '18%',
          totalCollected: platformFees.toFixed(2),
          byContractor: this.calculateFeesByContractor(completedContracts),
        },
        contractorPayouts: {
          totalPaid: contractorPayouts.toFixed(2),
          byContractor: this.calculatePayoutsByContractor(completedContracts),
        },
        refunds: {
          totalRefunded: refundedAmount.toFixed(2),
          refundCount: disputes.filter(
            (d: any) =>
              d.resolutionPath === 'REFUND' || d.resolutionPath === 'PARTIAL_REFUND'
          ).length,
          refundRate:
            totalContractValue > 0
              ? ((refundedAmount / totalContractValue) * 100).toFixed(2)
              : 0,
        },
        netRevenue: {
          total: netRevenue.toFixed(2),
          margin: totalContractValue > 0 ? ((netRevenue / totalContractValue) * 100).toFixed(2) : 0,
        },
      };
    } catch (error) {
      console.error('Error getting revenue metrics:', error);
      throw error;
    }
  }

  /**
   * Get trending analytics (what's hot in the marketplace)
   */
  async getTrendingMetrics(days: number = 30): Promise<any> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const query = { createdAt: { $gte: cutoffDate } };

      const jobs = await this.db.jobs.find(query);
      const contracts = await this.db.bidContracts.find(query);

      // Top categories
      const categoryCounts: any = {};
      jobs.forEach((job: any) => {
        const category = job.category || 'Other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, jobCount: count }))
        .sort((a: any, b: any) => b.jobCount - a.jobCount)
        .slice(0, 10);

      // Top locations
      const locationCounts: any = {};
      jobs.forEach((job: any) => {
        const location = job.location || 'Unknown';
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });

      const topLocations = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, jobCount: count }))
        .sort((a: any, b: any) => b.jobCount - a.jobCount)
        .slice(0, 10);

      // Average bid analysis by category
      const avgBidByCategory: any = {};
      contracts.forEach((contract: any) => {
        const job = jobs.find((j: any) => j.id === contract.jobId);
        if (job) {
          const category = job.category || 'Other';
          if (!avgBidByCategory[category]) {
            avgBidByCategory[category] = { total: 0, count: 0 };
          }
          avgBidByCategory[category].total += contract.bidAmount || 0;
          avgBidByCategory[category].count += 1;
        }
      });

      const categoryBidTrends = Object.entries(avgBidByCategory)
        .map(([category, data]: any) => ({
          category,
          avgBid: (data.total / data.count).toFixed(2),
          bidCount: data.count,
        }))
        .sort((a: any, b: any) => b.bidCount - a.bidCount);

      return {
        period: `Last ${days} days`,
        jobsPosted: jobs.length,
        bidSubmitted: contracts.length,
        topCategories,
        topLocations,
        categoryBidTrends,
      };
    } catch (error) {
      console.error('Error getting trending metrics:', error);
      throw error;
    }
  }

  /**
   * Private helper: Group contracts by status
   */
  private groupContractsByStatus(contracts: any[]): any {
    const statuses: any = {
      DRAFT: 0,
      PENDING_ACCEPTANCE: 0,
      ACCEPTED: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      DISPUTED: 0,
      CANCELLED: 0,
    };

    contracts.forEach((c: any) => {
      if (statuses.hasOwnProperty(c.status)) {
        statuses[c.status]++;
      }
    });

    return statuses;
  }

  /**
   * Private helper: Group completions by status
   */
  private groupCompletionsByStatus(completions: any[]): any {
    const statuses: any = {
      PENDING_APPROVAL: 0,
      APPROVED: 0,
      REJECTED: 0,
      DISPUTED: 0,
    };

    completions.forEach((c: any) => {
      if (statuses.hasOwnProperty(c.status)) {
        statuses[c.status]++;
      }
    });

    return statuses;
  }

  /**
   * Private helper: Group disputes by status
   */
  private groupDisputesByStatus(disputes: any[]): any {
    const statuses: any = {
      PENDING: 0,
      MEDIATION: 0,
      RESOLVED: 0,
      ESCALATED: 0,
    };

    disputes.forEach((d: any) => {
      if (statuses.hasOwnProperty(d.status)) {
        statuses[d.status]++;
      }
    });

    return statuses;
  }

  /**
   * Private helper: Group disputes by resolution
   */
  private groupDisputesByResolution(disputes: any[]): any {
    const resolutions: any = {
      REFUND: 0,
      REWORK: 0,
      PARTIAL_REFUND: 0,
      ARBITRATION: 0,
    };

    disputes.forEach((d: any) => {
      if (d.resolutionPath && resolutions.hasOwnProperty(d.resolutionPath)) {
        resolutions[d.resolutionPath]++;
      }
    });

    return resolutions;
  }

  /**
   * Private helper: Calculate average bid response time
   */
  private calculateAverageBidResponseTime(contracts: any[]): string {
    const times: number[] = [];
    contracts.forEach((c: any) => {
      if (c.createdAt && c.acceptedAt) {
        const created = new Date(c.createdAt).getTime();
        const accepted = new Date(c.acceptedAt).getTime();
        times.push((accepted - created) / (1000 * 60 * 60)); // Convert to hours
      }
    });

    if (times.length === 0) return 'N/A';
    const avg = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    return `${avg.toFixed(1)}h`;
  }

  /**
   * Private helper: Calculate average satisfaction rating
   */
  private calculateAverageSatisfaction(completions: any[]): number {
    const approved = completions.filter((c: any) => c.status === 'APPROVED');
    if (approved.length === 0) return 0;

    const avgRating =
      approved.reduce((sum: number, c: any) => sum + (c.homeownerSatisfaction || 0), 0) /
      approved.length;
    return parseFloat(avgRating.toFixed(2));
  }

  /**
   * Private helper: Calculate average satisfaction for contractor
   */
  private calculateAverageSatisfactionForContractor(completions: any[]): number {
    const approved = completions.filter((c: any) => c.status === 'APPROVED');
    if (approved.length === 0) return 0;

    const avgRating =
      approved.reduce((sum: number, c: any) => sum + (c.homeownerSatisfaction || 3), 0) /
      approved.length;
    return parseFloat(avgRating.toFixed(2));
  }

  /**
   * Private helper: Calculate contractor average response time
   */
  private calculateContractorAvgResponseTime(contracts: any[]): string {
    const times: number[] = [];
    contracts.forEach((c: any) => {
      if (c.createdAt && c.acceptedAt) {
        const created = new Date(c.createdAt).getTime();
        const accepted = new Date(c.acceptedAt).getTime();
        if (accepted > created) {
          times.push((accepted - created) / (1000 * 60)); // Convert to minutes
        }
      }
    });

    if (times.length === 0) return 'N/A';
    const avg = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    return `${Math.round(avg)}m`;
  }

  /**
   * Private helper: Calculate average time to completion
   */
  private calculateAverageTimeToCompletion(
    postedDate: string,
    completions: any[]
  ): string {
    const times: number[] = [];
    completions.forEach((c: any) => {
      if (c.approvedAt) {
        const posted = new Date(postedDate).getTime();
        const approved = new Date(c.approvedAt).getTime();
        times.push((approved - posted) / (1000 * 60 * 60 * 24)); // Convert to days
      }
    });

    if (times.length === 0) return 'N/A';
    const avg = times.reduce((a: number, b: number) => a + b, 0) / times.length;
    return `${avg.toFixed(1)} days`;
  }

  /**
   * Private helper: Count unique bidders
   */
  private countUniqueBidders(contracts: any[]): number {
    const bidders = new Set(contracts.map((c: any) => c.contractorId));
    return bidders.size;
  }

  /**
   * Private helper: Calculate bid spread
   */
  private calculateBidSpread(contracts: any[]): string {
    if (contracts.length === 0) return '0%';

    const amounts = contracts.map((c: any) => c.bidAmount || 0);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);

    if (min === 0) return '0%';
    const spread = ((max - min) / min) * 100;
    return `${spread.toFixed(1)}%`;
  }

  /**
   * Private helper: Calculate fees by contractor
   */
  private calculateFeesByContractor(contracts: any[]): any {
    const feesByContractor: any = {};

    contracts.forEach((c: any) => {
      const contractorId = c.contractorId;
      const fee = c.bidAmount * 0.18;

      if (!feesByContractor[contractorId]) {
        feesByContractor[contractorId] = 0;
      }
      feesByContractor[contractorId] += fee;
    });

    return Object.entries(feesByContractor)
      .map(([contractorId, total]: any) => ({ contractorId, totalFees: total.toFixed(2) }))
      .sort((a: any, b: any) => parseFloat(b.totalFees) - parseFloat(a.totalFees))
      .slice(0, 20);
  }

  /**
   * Private helper: Calculate payouts by contractor
   */
  private calculatePayoutsByContractor(contracts: any[]): any {
    const payoutsByContractor: any = {};

    contracts.forEach((c: any) => {
      const contractorId = c.contractorId;
      const payout = c.bidAmount * 0.82;

      if (!payoutsByContractor[contractorId]) {
        payoutsByContractor[contractorId] = 0;
      }
      payoutsByContractor[contractorId] += payout;
    });

    return Object.entries(payoutsByContractor)
      .map(([contractorId, total]: any) => ({
        contractorId,
        totalPayout: total.toFixed(2),
      }))
      .sort((a: any, b: any) => parseFloat(b.totalPayout) - parseFloat(a.totalPayout))
      .slice(0, 20);
  }
}

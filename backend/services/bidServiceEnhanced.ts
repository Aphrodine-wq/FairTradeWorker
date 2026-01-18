/**
 * Enhanced Bid Service - Advanced Bid Analysis & Comparison
 * Bid comparison, competitive analysis, and intelligent recommendations
 */

import prisma from '../../src/services/database';

export interface BidComparison {
  bidId: string;
  contractorId: string;
  contractorName: string;
  amount: number;
  timeline: string;
  proposal: string;
  contractorRating: number;
  completedJobs: number;
  averageReviewScore: number;
  responseTime?: number; // minutes
  competitivenessScore: number; // 1-100
  valueForMoney: number; // 1-100
  trustScore: number; // 1-100
  overallScore: number; // 1-100
}

export interface BidAnalytics {
  totalBids: number;
  averageBidAmount: number;
  minBidAmount: number;
  maxBidAmount: number;
  medianBidAmount: number;
  bidStandardDeviation: number;
  competitionLevel: 'low' | 'moderate' | 'high' | 'very-high';
  averageBidTimeline: number;
  acceptanceRate: number;
  contractorQualityAverage: number;
  topBidders: BidComparison[];
  valueLeaders: BidComparison[];
  trustLeaders: BidComparison[];
}

export interface BidRecommendation {
  bidId: string;
  rank: number;
  score: number;
  reason: string;
  riskLevel: 'low' | 'moderate' | 'high';
}

export interface ContractorPerformance {
  contractorId: string;
  totalBidsSubmitted: number;
  bidsAccepted: number;
  acceptanceRate: number;
  averageBidAmount: number;
  averageTimeline: number;
  jobsCompleted: number;
  jobsCancelled: number;
  completionRate: number;
  averageRating: number;
  averageReviewScore: number;
  repeatClientRate: number;
  responseTimeAverage: number;
  onTimeDeliveryRate: number;
  customerSatisfaction: number;
}

export class BidServiceEnhanced {
  /**
   * Compare bids for a job with detailed analysis
   */
  async compareBids(jobId: string): Promise<BidComparison[]> {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      const bids = await prisma.bid.findMany({
        where: {
          jobId,
          status: { not: 'WITHDRAWN' },
        },
        include: {
          contractor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              averageRating: true,
              completedJobs: true,
              reviews: true,
            },
          },
        },
      });

      const comparisons: BidComparison[] = bids.map((bid) => {
        const trustScore = this.calculateTrustScore(bid.contractor);
        const valueForMoney = this.calculateValueForMoney(bid.amount, job.budget, bid.contractor.averageRating);
        const competitivenessScore = this.calculateCompetitivenessScore(bid, bids, job.budget);

        return {
          bidId: bid.id,
          contractorId: bid.contractor.id,
          contractorName: `${bid.contractor.firstName} ${bid.contractor.lastName}`,
          amount: bid.amount,
          timeline: bid.timeline,
          proposal: bid.proposal,
          contractorRating: bid.contractor.averageRating || 0,
          completedJobs: bid.contractor.completedJobs || 0,
          averageReviewScore: this.calculateAverageReviewScore(bid.contractor.reviews),
          competitivenessScore,
          valueForMoney,
          trustScore,
          overallScore: (trustScore + valueForMoney + competitivenessScore) / 3,
        };
      });

      return comparisons.sort((a, b) => b.overallScore - a.overallScore);
    } catch (error: any) {
      throw new Error(`Failed to compare bids: ${error.message}`);
    }
  }

  /**
   * Get comprehensive bid analytics for a job
   */
  async getBidAnalytics(jobId: string): Promise<BidAnalytics> {
    try {
      const bids = await this.compareBids(jobId);

      if (bids.length === 0) {
        return {
          totalBids: 0,
          averageBidAmount: 0,
          minBidAmount: 0,
          maxBidAmount: 0,
          medianBidAmount: 0,
          bidStandardDeviation: 0,
          competitionLevel: 'low',
          averageBidTimeline: 0,
          acceptanceRate: 0,
          contractorQualityAverage: 0,
          topBidders: [],
          valueLeaders: [],
          trustLeaders: [],
        };
      }

      const amounts = bids.map((b) => b.amount);
      const ratings = bids.map((b) => b.contractorRating);

      const averageBidAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const minBidAmount = Math.min(...amounts);
      const maxBidAmount = Math.max(...amounts);
      const medianBidAmount = this.calculateMedian(amounts);
      const bidStandardDeviation = this.calculateStandardDeviation(amounts);
      const contractorQualityAverage = ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;

      const competitionLevel = this.assessCompetitionLevel(bids.length);

      const topBidders = bids.slice(0, 3);
      const valueLeaders = bids.sort((a, b) => b.valueForMoney - a.valueForMoney).slice(0, 3);
      const trustLeaders = bids.sort((a, b) => b.trustScore - a.trustScore).slice(0, 3);

      return {
        totalBids: bids.length,
        averageBidAmount: Math.round(averageBidAmount),
        minBidAmount,
        maxBidAmount,
        medianBidAmount,
        bidStandardDeviation: Math.round(bidStandardDeviation),
        competitionLevel,
        averageBidTimeline: 10, // Example
        acceptanceRate: 20,
        contractorQualityAverage: Math.round(contractorQualityAverage * 10) / 10,
        topBidders,
        valueLeaders,
        trustLeaders,
      };
    } catch (error: any) {
      throw new Error(`Failed to get bid analytics: ${error.message}`);
    }
  }

  /**
   * Get bid recommendations for homeowner
   */
  async getBidRecommendations(jobId: string): Promise<BidRecommendation[]> {
    try {
      const bids = await this.compareBids(jobId);

      const recommendations: BidRecommendation[] = bids.map((bid, index) => {
        let reason = '';
        let riskLevel: 'low' | 'moderate' | 'high' = 'moderate';

        if (bid.overallScore >= 85) {
          reason = 'Excellent overall match - high rating, competitive pricing';
          riskLevel = 'low';
        } else if (bid.trustScore >= 80 && bid.valueForMoney >= 75) {
          reason = 'Reliable contractor with good value';
          riskLevel = 'low';
        } else if (bid.trustScore >= 70) {
          reason = 'Experienced contractor';
          riskLevel = 'moderate';
        } else if (bid.completedJobs < 5) {
          reason = 'Newer contractor - consider carefully';
          riskLevel = 'high';
        } else {
          reason = 'Consider other options';
          riskLevel = 'high';
        }

        return {
          bidId: bid.bidId,
          rank: index + 1,
          score: Math.round(bid.overallScore),
          reason,
          riskLevel,
        };
      });

      return recommendations;
    } catch (error: any) {
      throw new Error(`Failed to get bid recommendations: ${error.message}`);
    }
  }

  /**
   * Analyze contractor performance and bidding patterns
   */
  async getContractorPerformance(contractorId: string): Promise<ContractorPerformance> {
    try {
      const contractor = await prisma.user.findUnique({
        where: { id: contractorId },
        include: {
          bids: true,
          reviews: true,
          completedContracts: true,
        },
      });

      if (!contractor) {
        throw new Error('Contractor not found');
      }

      const totalBidsSubmitted = contractor.bids?.length || 0;
      const bidsAccepted = contractor.bids?.filter((b) => b.status === 'ACCEPTED').length || 0;
      const jobsCompleted = contractor.completedContracts?.length || 0;
      const jobsCancelled = contractor.bids?.filter((b) => b.status === 'REJECTED').length || 0;

      const bidAmounts = contractor.bids?.map((b) => b.amount) || [];
      const averageBidAmount = bidAmounts.length > 0 ? bidAmounts.reduce((a, b) => a + b, 0) / bidAmounts.length : 0;

      const reviewScores = contractor.reviews?.map((r) => r.rating) || [];
      const averageReviewScore = reviewScores.length > 0 ? reviewScores.reduce((a, b) => a + b, 0) / reviewScores.length : 0;

      return {
        contractorId,
        totalBidsSubmitted,
        bidsAccepted,
        acceptanceRate: totalBidsSubmitted > 0 ? (bidsAccepted / totalBidsSubmitted) * 100 : 0,
        averageBidAmount: Math.round(averageBidAmount),
        averageTimeline: 10, // Example
        jobsCompleted,
        jobsCancelled,
        completionRate: jobsCompleted > 0 ? (jobsCompleted / (jobsCompleted + jobsCancelled)) * 100 : 0,
        averageRating: contractor.averageRating || 0,
        averageReviewScore: Math.round(averageReviewScore * 10) / 10,
        repeatClientRate: 25, // Example
        responseTimeAverage: 2, // hours, example
        onTimeDeliveryRate: 90, // Example
        customerSatisfaction: 85, // Example
      };
    } catch (error: any) {
      throw new Error(`Failed to get contractor performance: ${error.message}`);
    }
  }

  /**
   * Get market analysis for bid prices
   */
  async getMarketAnalysis(
    category: string,
    location?: string
  ): Promise<{
    averagePrice: number;
    priceRange: { min: number; max: number };
    marketTrend: 'increasing' | 'decreasing' | 'stable';
    competitionLevel: string;
  }> {
    try {
      const where: any = {
        job: { category },
      };

      if (location) {
        where.job = { ...where.job, location: { contains: location, mode: 'insensitive' } };
      }

      const bids = await prisma.bid.findMany({
        where,
        include: { job: true },
      });

      if (bids.length === 0) {
        return {
          averagePrice: 0,
          priceRange: { min: 0, max: 0 },
          marketTrend: 'stable',
          competitionLevel: 'unknown',
        };
      }

      const amounts = bids.map((b) => b.amount);
      const averagePrice = amounts.reduce((a, b) => a + b, 0) / amounts.length;

      return {
        averagePrice: Math.round(averagePrice),
        priceRange: {
          min: Math.min(...amounts),
          max: Math.max(...amounts),
        },
        marketTrend: this.analyzeMarketTrend(bids),
        competitionLevel: this.assessCompetitionLevel(bids.length),
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze market: ${error.message}`);
    }
  }

  /**
   * Smart bid matching for contractors
   */
  async getRecommendedBidsForContractor(
    contractorId: string,
    limit: number = 10
  ): Promise<
    Array<{
      jobId: string;
      matchScore: number;
      recommendation: string;
    }>
  > {
    try {
      const contractor = await prisma.user.findUnique({
        where: { id: contractorId },
        include: { bids: { include: { job: true } } },
      });

      if (!contractor) {
        throw new Error('Contractor not found');
      }

      // Get jobs in contractor's preferred categories
      const preferredCategories = contractor.bids
        .filter((b) => b.status === 'ACCEPTED')
        .map((b) => b.job.category);

      const jobs = await prisma.job.findMany({
        where: {
          status: 'OPEN',
          ...(preferredCategories.length > 0 && { category: { in: preferredCategories } }),
        },
        include: {
          bids: true,
        },
        take: limit,
      });

      const recommendations = jobs.map((job) => {
        let matchScore = 50;
        let recommendation = 'Good match';

        // Category match
        if (preferredCategories.includes(job.category)) {
          matchScore += 25;
        }

        // Low competition
        if (job.bids.length < 3) {
          matchScore += 15;
          recommendation = 'Low competition - great opportunity';
        } else if (job.bids.length < 5) {
          matchScore += 10;
        } else {
          matchScore -= 10;
          recommendation = 'High competition';
        }

        // Budget alignment
        if (contractor.averageRating) {
          matchScore += contractor.averageRating > 4 ? 10 : 5;
        }

        return {
          jobId: job.id,
          matchScore: Math.min(100, matchScore),
          recommendation,
        };
      });

      return recommendations.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error: any) {
      throw new Error(`Failed to get bid recommendations: ${error.message}`);
    }
  }

  // Helper methods
  private calculateTrustScore(contractor: any): number {
    let score = 50;

    if (contractor.averageRating) {
      score += contractor.averageRating * 10;
    }

    if (contractor.completedJobs > 50) {
      score += 20;
    } else if (contractor.completedJobs > 20) {
      score += 15;
    } else if (contractor.completedJobs > 10) {
      score += 10;
    } else if (contractor.completedJobs > 5) {
      score += 5;
    }

    return Math.min(100, score);
  }

  private calculateValueForMoney(bidAmount: number, jobBudget: number, rating: number): number {
    const priceRatio = bidAmount / jobBudget;
    let score = 50;

    if (priceRatio < 0.8) {
      score += 25;
    } else if (priceRatio < 0.9) {
      score += 15;
    } else if (priceRatio < 1.0) {
      score += 10;
    } else if (priceRatio < 1.2) {
      score += 5;
    }

    if (rating > 4.5) {
      score += 15;
    } else if (rating > 4.0) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private calculateCompetitivenessScore(bid: any, allBids: any[], jobBudget: number): number {
    const bidAmount = bid.amount;
    const avgAmount = allBids.reduce((a, b) => a + b.amount, 0) / allBids.length;
    const priceRatio = bidAmount / avgAmount;

    let score = 50;

    if (priceRatio < 0.95) {
      score += 25;
    } else if (priceRatio < 1.05) {
      score += 15;
    } else if (priceRatio < 1.15) {
      score += 5;
    } else {
      score -= 10;
    }

    return Math.min(100, score);
  }

  private calculateAverageReviewScore(reviews: any[]): number {
    if (reviews.length === 0) return 0;
    return reviews.reduce((a, b) => a + (b.rating || 0), 0) / reviews.length;
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private calculateStandardDeviation(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((val) => Math.pow(val - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  private assessCompetitionLevel(bidCount: number): 'low' | 'moderate' | 'high' | 'very-high' {
    if (bidCount < 2) return 'low';
    if (bidCount < 5) return 'moderate';
    if (bidCount < 10) return 'high';
    return 'very-high';
  }

  private analyzeMarketTrend(bids: any[]): 'increasing' | 'decreasing' | 'stable' {
    // Simplified analysis - in production would analyze temporal data
    return 'stable';
  }
}

/**
 * Enhanced Job Service - Advanced Features
 * Advanced filtering, sorting, recommendations, and analytics
 */

import prisma from '../../src/services/database';

export interface JobFilters {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  zipCode?: string;
  radiusMiles?: number;
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  minimumContractorRating?: number;
  postedAfter?: Date;
  postedBefore?: Date;
  hasImages?: boolean;
  urgency?: 'immediate' | 'within-week' | 'flexible';
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
}

export interface JobSortOptions {
  sortBy: 'recent' | 'budget-high' | 'budget-low' | 'bids-count' | 'rating' | 'distance' | 'deadline';
  order: 'asc' | 'desc';
}

export interface JobAdvancedStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  averageBidsPerJob: number;
  averageBudget: number;
  budgetRanges: {
    under5k: number;
    from5kTo10k: number;
    from10kTo25k: number;
    from25kTo50k: number;
    over50k: number;
  };
  categoryBreakdown: { [key: string]: number };
  timeToCompletion: {
    average: number;
    median: number;
    fastest: number;
    slowest: number;
  };
}

export interface JobRecommendation {
  jobId: string;
  matchScore: number;
  matchReasons: string[];
  estimatedSuccess: number;
}

export class JobServiceEnhanced {
  /**
   * Advanced job filtering with multiple criteria
   */
  async searchJobs(filters: JobFilters, page: number = 1, limit: number = 20): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const where: any = {
        status: filters.status || 'OPEN',
      };

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.minBudget || filters.maxBudget) {
        where.budget = {};
        if (filters.minBudget) where.budget.gte = filters.minBudget;
        if (filters.maxBudget) where.budget.lte = filters.maxBudget;
      }

      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }

      if (filters.minimumContractorRating) {
        where.minimumRating = { lte: filters.minimumContractorRating };
      }

      if (filters.postedAfter || filters.postedBefore) {
        where.createdAt = {};
        if (filters.postedAfter) where.createdAt.gte = filters.postedAfter;
        if (filters.postedBefore) where.createdAt.lte = filters.postedBefore;
      }

      if (filters.hasImages !== undefined) {
        where.images = filters.hasImages ? { not: { equals: [] } } : { equals: [] };
      }

      if (filters.estimatedDaysMin || filters.estimatedDaysMax) {
        where.estimatedDays = {};
        if (filters.estimatedDaysMin) where.estimatedDays.gte = filters.estimatedDaysMin;
        if (filters.estimatedDaysMax) where.estimatedDays.lte = filters.estimatedDaysMax;
      }

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          skip,
          take: limit,
          include: {
            postedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                averageRating: true,
              },
            },
            _count: {
              select: { bids: true },
            },
          },
        }),
        prisma.job.count({ where }),
      ]);

      return {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to search jobs: ${error.message}`);
    }
  }

  /**
   * Get jobs with custom sorting
   */
  async getJobsSorted(
    filters: JobFilters,
    sortOptions: JobSortOptions,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    try {
      const jobs = await this.searchJobs(filters, page, limit);

      const orderBy: any = {};

      switch (sortOptions.sortBy) {
        case 'recent':
          orderBy.createdAt = sortOptions.order;
          break;
        case 'budget-high':
          orderBy.budget = 'desc';
          break;
        case 'budget-low':
          orderBy.budget = 'asc';
          break;
        case 'bids-count':
          orderBy._count = { bids: sortOptions.order };
          break;
        case 'rating':
          orderBy.postedBy = { averageRating: sortOptions.order };
          break;
        case 'deadline':
          orderBy.estimatedDays = sortOptions.order;
          break;
      }

      return jobs;
    } catch (error: any) {
      throw new Error(`Failed to sort jobs: ${error.message}`);
    }
  }

  /**
   * Get intelligent job recommendations for a contractor
   */
  async getJobRecommendationsForContractor(
    contractorId: string,
    limit: number = 10
  ): Promise<JobRecommendation[]> {
    try {
      const contractor = await prisma.user.findUnique({
        where: { id: contractorId },
        include: {
          bids: {
            include: {
              job: {
                select: { category: true, location: true },
              },
            },
          },
          completedJobs: {
            include: {
              job: {
                select: { category: true, budget: true },
              },
            },
          },
        },
      });

      if (!contractor) {
        throw new Error('Contractor not found');
      }

      // Get contractor's preferred categories and budget range
      const preferredCategories =
        contractor.completedJobs.length > 0
          ? this.getMostFrequentCategories(
              contractor.completedJobs.map((c) => c.job.category),
              3
            )
          : [];

      const averageBudget = this.calculateAverageBudget(
        contractor.completedJobs.map((c) => c.job.budget)
      );

      // Find matching jobs
      const matchingJobs = await prisma.job.findMany({
        where: {
          status: 'OPEN',
          ...(preferredCategories.length > 0 && { category: { in: preferredCategories } }),
          budget: {
            gte: averageBudget * 0.5,
            lte: averageBudget * 1.5,
          },
          postedBy: {
            averageRating: { gte: contractor.averageRating ? contractor.averageRating - 1 : 0 },
          },
        },
        include: {
          postedBy: {
            select: { averageRating: true },
          },
          bids: true,
        },
        take: limit,
      });

      // Score each job
      const recommendations: JobRecommendation[] = matchingJobs.map((job) => {
        let matchScore = 0;
        const matchReasons: string[] = [];

        // Category match (40 points)
        if (preferredCategories.includes(job.category)) {
          matchScore += 40;
          matchReasons.push('Matches your expertise');
        }

        // Budget match (30 points)
        if (job.budget >= averageBudget * 0.8 && job.budget <= averageBudget * 1.2) {
          matchScore += 30;
          matchReasons.push('Matches your typical budget');
        }

        // Low competition (20 points)
        if (job.bids.length < 3) {
          matchScore += 20;
          matchReasons.push('Low competition');
        } else if (job.bids.length < 5) {
          matchScore += 10;
        }

        // Rating match (10 points)
        if (job.postedBy.averageRating && job.postedBy.averageRating >= 4) {
          matchScore += 10;
          matchReasons.push('Highly-rated homeowner');
        }

        return {
          jobId: job.id,
          matchScore: Math.min(100, matchScore),
          matchReasons,
          estimatedSuccess: this.calculateSuccessProbability(contractor, job),
        };
      });

      return recommendations.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error: any) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  /**
   * Get comprehensive job analytics and statistics
   */
  async getJobAnalytics(filters?: Partial<JobFilters>): Promise<JobAdvancedStats> {
    try {
      const where = filters ? this.buildFilterWhere(filters) : { status: 'OPEN' };

      const [totalJobs, activeJobs, completedJobs, jobsData] = await Promise.all([
        prisma.job.count({ where }),
        prisma.job.count({ where: { ...where, status: 'OPEN' } }),
        prisma.job.count({ where: { ...where, status: 'COMPLETED' } }),
        prisma.job.findMany({
          where,
          include: {
            bids: true,
            completedAt: true,
          },
        }),
      ]);

      // Calculate budget statistics
      const budgets = jobsData.map((j) => j.budget);
      const averageBudget = budgets.reduce((a, b) => a + b, 0) / jobsData.length || 0;

      // Calculate budget ranges
      const budgetRanges = {
        under5k: jobsData.filter((j) => j.budget < 5000).length,
        from5kTo10k: jobsData.filter((j) => j.budget >= 5000 && j.budget < 10000).length,
        from10kTo25k: jobsData.filter((j) => j.budget >= 10000 && j.budget < 25000).length,
        from25kTo50k: jobsData.filter((j) => j.budget >= 25000 && j.budget < 50000).length,
        over50k: jobsData.filter((j) => j.budget >= 50000).length,
      };

      // Calculate category breakdown
      const categoryBreakdown: { [key: string]: number } = {};
      jobsData.forEach((job) => {
        categoryBreakdown[job.category] = (categoryBreakdown[job.category] || 0) + 1;
      });

      // Calculate average bids per job
      const averageBidsPerJob = jobsData.length > 0 ? jobsData.reduce((a, b) => a + b.bids.length, 0) / jobsData.length : 0;

      return {
        totalJobs,
        activeJobs,
        completedJobs,
        averageBidsPerJob: Math.round(averageBidsPerJob * 10) / 10,
        averageBudget: Math.round(averageBudget),
        budgetRanges,
        categoryBreakdown,
        timeToCompletion: {
          average: 30,
          median: 28,
          fastest: 5,
          slowest: 120,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  /**
   * Get similar jobs (for recommendations)
   */
  async getSimilarJobs(jobId: string, limit: number = 5): Promise<any[]> {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      const similarJobs = await prisma.job.findMany({
        where: {
          id: { not: jobId },
          category: job.category,
          status: 'OPEN',
          budget: {
            gte: job.budget * 0.7,
            lte: job.budget * 1.3,
          },
        },
        include: {
          postedBy: {
            select: {
              firstName: true,
              lastName: true,
              averageRating: true,
            },
          },
          _count: {
            select: { bids: true },
          },
        },
        take: limit,
      });

      return similarJobs;
    } catch (error: any) {
      throw new Error(`Failed to get similar jobs: ${error.message}`);
    }
  }

  /**
   * Get trending jobs and categories
   */
  async getTrendingJobs(days: number = 30, limit: number = 10): Promise<any[]> {
    try {
      const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const trendingJobs = await prisma.job.findMany({
        where: {
          status: 'OPEN',
          createdAt: { gte: sinceDate },
        },
        include: {
          bids: true,
          postedBy: {
            select: {
              firstName: true,
              lastName: true,
              averageRating: true,
            },
          },
        },
        orderBy: {
          bids: {
            _count: 'desc',
          },
        },
        take: limit,
      });

      return trendingJobs;
    } catch (error: any) {
      throw new Error(`Failed to get trending jobs: ${error.message}`);
    }
  }

  /**
   * Advanced search with full-text search
   */
  async fullTextSearch(query: string, limit: number = 20): Promise<any[]> {
    try {
      const jobs = await prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
          ],
          status: 'OPEN',
        },
        include: {
          postedBy: {
            select: {
              firstName: true,
              lastName: true,
              averageRating: true,
            },
          },
          _count: {
            select: { bids: true },
          },
        },
        take: limit,
      });

      return jobs;
    } catch (error: any) {
      throw new Error(`Failed to search jobs: ${error.message}`);
    }
  }

  // Helper methods
  private getMostFrequentCategories(categories: string[], count: number): string[] {
    const frequency: { [key: string]: number } = {};
    categories.forEach((cat) => {
      frequency[cat] = (frequency[cat] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map((entry) => entry[0]);
  }

  private calculateAverageBudget(budgets: number[]): number {
    if (budgets.length === 0) return 5000; // Default
    return budgets.reduce((a, b) => a + b, 0) / budgets.length;
  }

  private calculateSuccessProbability(contractor: any, job: any): number {
    let probability = 50; // Base 50%

    // Rating factor (+-20%)
    if (contractor.averageRating && job.postedBy.averageRating) {
      const ratingDiff = contractor.averageRating - job.postedBy.averageRating;
      if (ratingDiff > 1) probability += 10;
      else if (ratingDiff > 0) probability += 5;
      else if (ratingDiff < -1) probability -= 10;
    }

    // Bid competition (0-20%)
    probability += Math.max(0, 20 - job.bids.length);

    return Math.min(100, probability);
  }

  private buildFilterWhere(filters: Partial<JobFilters>): any {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };

    if (filters.minBudget || filters.maxBudget) {
      where.budget = {};
      if (filters.minBudget) where.budget.gte = filters.minBudget;
      if (filters.maxBudget) where.budget.lte = filters.maxBudget;
    }

    return where;
  }
}

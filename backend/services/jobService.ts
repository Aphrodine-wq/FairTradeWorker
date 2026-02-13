/**
 * Job Service - PHASE 2 Core Features
 * Handles job creation, retrieval, and management
 */

import { Database } from '../database';
import { Encryption } from '../../src/utils/encryption';

// Mock prisma for now to use the file-based Database class
const prisma = new Database();

export interface CreateJobInput {
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  zipCode?: string;
  estimatedDays?: number;
  images?: string[];
  preferredTradeTypes?: string[];
  minimumRating?: number;
}

export interface UpdateJobInput {
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  budget?: number;
}

export class JobService {
  /**
   * Create a new job posting
   */
  async createJob(
    homeownerId: string,
    input: CreateJobInput
  ): Promise<any> {
    try {
      const job = await prisma.jobs.create({
        data: {
          title: input.title,
          description: input.description,
          category: input.category,
          budget: input.budget,
          location: input.location,
          zipCode: input.zipCode,
          estimatedDays: input.estimatedDays,
          images: input.images || [],
          preferredTradeTypes: input.preferredTradeTypes || [],
          minimumRating: input.minimumRating || 0,
          status: 'OPEN',
          postedById: homeownerId,
        },
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
        },
      });

      console.log(`✅ Job created: ${job.id}`);
      return job;
    } catch (error: any) {
      console.error('❌ Error creating job:', error);
      throw new Error(`Failed to create job: ${error.message}`);
    }
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<any> {
    try {
      const job = await prisma.jobs.findUnique({
        where: { id: jobId },
        include: {
          postedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              averageRating: true,
              totalReviews: true,
              completedJobs: true,
            },
          },
          bids: {
            where: { status: { not: 'WITHDRAWN' } },
            select: {
              id: true,
              amount: true,
              timeline: true,
              status: true,
              contractor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  averageRating: true,
                },
              },
            },
          },
          contract: {
            select: {
              id: true,
              status: true,
              amount: true,
              acceptedAt: true,
            },
          },
        },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      return job;
    } catch (error: any) {
      console.error('❌ Error fetching job:', error);
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
  }

  /**
   * List jobs with filters and pagination
   */
  async listJobs(filters: {
    status?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    zipCode?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: any[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 20, 100);
      const skip = (page - 1) * limit;

      const where: any = { status: 'OPEN' };

      if (filters.status) where.status = filters.status;
      if (filters.category) where.category = filters.category;
      if (filters.minBudget) where.budget = { gte: filters.minBudget };
      if (filters.maxBudget) {
        where.budget = where.budget || {};
        where.budget.lte = filters.maxBudget;
      }
      if (filters.zipCode) where.zipCode = filters.zipCode;

      const [jobs, total] = await Promise.all([
        prisma.jobs.findMany({
          where,
          include: {
            postedBy: {
              select: {
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
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.jobs.count(where),
      ]);

      return {
        jobs: jobs.map((job: any) => ({
          ...job,
          bidCount: job._count.bids,
          _count: undefined,
        })),
        total,
      };
    } catch (error: any) {
      console.error('❌ Error listing jobs:', error);
      throw new Error(`Failed to list jobs: ${error.message}`);
    }
  }

  /**
   * Get jobs by homeowner
   */
  async getHomeownerJobs(homeownerId: string, status?: string): Promise<any[]> {
    try {
      const where: any = { postedById: homeownerId };
      if (status) where.status = status;

      const jobs = await prisma.jobs.findMany({
        where,
        include: {
          _count: { select: { bids: true } },
          contract: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return jobs.map((job: any) => ({
        ...job,
        bidCount: job._count.bids,
      }));
    } catch (error: any) {
      console.error('❌ Error fetching homeowner jobs:', error);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  }

  /**
   * Update job
   */
  async updateJob(
    jobId: string,
    homeownerId: string,
    input: UpdateJobInput
  ): Promise<any> {
    try {
      const job = await prisma.jobs.findUnique({ where: { id: jobId } });

      if (!job) throw new Error('Job not found');
      if (job.postedById !== homeownerId) throw new Error('Unauthorized');

      const updated = await prisma.jobs.update({
        where: { id: jobId },
        data: input,
      });

      return updated;
    } catch (error: any) {
      console.error('❌ Error updating job:', error);
      throw new Error(`Failed to update job: ${error.message}`);
    }
  }

  /**
   * Close job (no more bids)
   */
  async closeJob(jobId: string, homeownerId: string): Promise<void> {
    try {
      const job = await prisma.jobs.findUnique({ where: { id: jobId } });

      if (!job) throw new Error('Job not found');
      if (job.postedById !== homeownerId) throw new Error('Unauthorized');

      await prisma.jobs.update({
        where: { id: jobId },
        data: { status: 'CLOSED', closedAt: new Date() },
      });

      console.log(`✅ Job closed: ${jobId}`);
    } catch (error: any) {
      console.error('❌ Error closing job:', error);
      throw new Error(`Failed to close job: ${error.message}`);
    }
  }

  /**
   * Delete job (only if no contract)
   */
  async deleteJob(jobId: string, homeownerId: string): Promise<void> {
    try {
      const job = await prisma.jobs.findUnique({
        where: { id: jobId },
        include: { contract: true },
      });

      if (!job) throw new Error('Job not found');
      if (job.postedById !== homeownerId) throw new Error('Unauthorized');
      if (job.contract) throw new Error('Cannot delete job with active contract');

      await prisma.jobs.delete(jobId);

      console.log(`✅ Job deleted: ${jobId}`);
    } catch (error: any) {
      console.error('❌ Error deleting job:', error);
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  }

  /**
   * Search jobs by keyword
   */
  async searchJobs(keyword: string, limit: number = 10): Promise<any[]> {
    try {
      const jobs = await prisma.jobs.findMany({
        where: {
          status: 'OPEN',
          OR: [
            { title: { contains: keyword } },
            { description: { contains: keyword } },
            { category: { contains: keyword } },
          ],
        },
        take: limit,
      });

      return jobs;
    } catch (error: any) {
      console.error('❌ Error searching jobs:', error);
      throw new Error(`Failed to search jobs: ${error.message}`);
    }
  }
}

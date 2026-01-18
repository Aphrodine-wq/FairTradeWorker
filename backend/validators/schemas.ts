/**
 * Input Validation Schemas using Zod
 * Part of PHASE 1 Security Implementation - Issue #3: Input Validation & Sanitization
 */

/**
 * NOTE: This file requires Zod dependency
 * Install with: npm install zod
 *
 * If Zod is not available, use TypeScript interfaces for now
 * and migration to Zod can be done incrementally
 */

// Simple schema validator (fallback if Zod not available)
export interface ValidationSchema {
  validate(data: any): { success: boolean; data?: any; error?: string };
}

/**
 * Create a simple validator function
 */
export function createValidator<T>(schema: { [key: string]: any }): ValidationSchema {
  return {
    validate(data: any): { success: boolean; data?: any; error?: string } {
      const errors: string[] = [];

      for (const [key, rules] of Object.entries(schema)) {
        const value = data[key];

        // Check required
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`${key} is required`);
          continue;
        }

        // Skip validation if not required and not provided
        if (!rules.required && (value === undefined || value === null)) {
          continue;
        }

        // Check type
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${key} must be of type ${rules.type}`);
        }

        // Check minimum length
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters`);
        }

        // Check maximum length
        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
          errors.push(`${key} must be at most ${rules.maxLength} characters`);
        }

        // Check pattern (regex)
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} format is invalid`);
        }

        // Check email
        if (rules.email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${key} must be a valid email`);
          }
        }

        // Check minimum value
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`);
        }

        // Check maximum value
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${key} must be at most ${rules.max}`);
        }

        // Check one of allowed values
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
        }
      }

      if (errors.length > 0) {
        return { success: false, error: errors.join('; ') };
      }

      return { success: true, data };
    },
  };
}

// ============================================
// REQUEST SCHEMAS
// ============================================

/**
 * Authentication & User Management
 */

export const RegisterSchema = createValidator({
  email: { required: true, type: 'string', email: true },
  password: { required: true, type: 'string', minLength: 8, maxLength: 128 },
  firstName: { required: true, type: 'string', minLength: 1, maxLength: 100 },
  lastName: { required: true, type: 'string', minLength: 1, maxLength: 100 },
  role: { required: true, type: 'string', enum: ['HOMEOWNER', 'CONTRACTOR'] },
});

export const LoginSchema = createValidator({
  email: { required: true, type: 'string', email: true },
  password: { required: true, type: 'string' },
});

export const UpdateProfileSchema = createValidator({
  firstName: { required: false, type: 'string', minLength: 1, maxLength: 100 },
  lastName: { required: false, type: 'string', minLength: 1, maxLength: 100 },
  phone: { required: false, type: 'string', minLength: 10, maxLength: 15 },
  bio: { required: false, type: 'string', maxLength: 500 },
  avatar: { required: false, type: 'string', maxLength: 2000 },
});

/**
 * Job Management
 */

export const CreateJobSchema = createValidator({
  title: { required: true, type: 'string', minLength: 5, maxLength: 200 },
  description: { required: true, type: 'string', minLength: 20, maxLength: 5000 },
  category: { required: true, type: 'string', minLength: 3, maxLength: 50 },
  estimatedBudget: { required: true, type: 'number', min: 50, max: 999999 },
  location: { required: true, type: 'string', minLength: 5, maxLength: 200 },
  urgency: { required: false, type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
  scopeOfWork: { required: false, type: 'string', maxLength: 2000 },
});

export const UpdateJobSchema = createValidator({
  title: { required: false, type: 'string', minLength: 5, maxLength: 200 },
  description: { required: false, type: 'string', minLength: 20, maxLength: 5000 },
  status: {
    required: false,
    type: 'string',
    enum: ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  },
  estimatedBudget: { required: false, type: 'number', min: 50, max: 999999 },
});

/**
 * Bid Management
 */

export const SubmitBidSchema = createValidator({
  jobId: { required: true, type: 'string', minLength: 1 },
  amount: { required: true, type: 'number', min: 50, max: 999999 },
  timeline: { required: true, type: 'string', minLength: 5, maxLength: 200 },
  coverLetter: { required: false, type: 'string', maxLength: 1000 },
});

export const UpdateBidSchema = createValidator({
  amount: { required: false, type: 'number', min: 50, max: 999999 },
  timeline: { required: false, type: 'string', minLength: 5, maxLength: 200 },
  coverLetter: { required: false, type: 'string', maxLength: 1000 },
  status: { required: false, type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] },
});

/**
 * Contract Management
 */

export const CreateContractSchema = createValidator({
  jobId: { required: true, type: 'string', minLength: 1 },
  contractorId: { required: true, type: 'string', minLength: 1 },
  bidAmount: { required: true, type: 'number', min: 50, max: 999999 },
  scopeOfWork: { required: false, type: 'string', maxLength: 2000 },
  startDate: { required: false, type: 'string' },
  endDate: { required: false, type: 'string' },
});

export const UpdateContractSchema = createValidator({
  status: {
    required: false,
    type: 'string',
    enum: ['DRAFT', 'ACCEPTED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
  },
  scopeOfWork: { required: false, type: 'string', maxLength: 2000 },
  endDate: { required: false, type: 'string' },
});

/**
 * Payment & Escrow
 */

export const InitiatePaymentSchema = createValidator({
  contractId: { required: true, type: 'string', minLength: 1 },
  amount: { required: true, type: 'number', min: 1, max: 999999 },
  paymentMethod: { required: true, type: 'string', enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'WALLET'] },
});

export const ApproveCompletionSchema = createValidator({
  completionId: { required: true, type: 'string', minLength: 1 },
  approved: { required: true, type: 'boolean' },
  feedback: { required: false, type: 'string', maxLength: 500 },
});

/**
 * Dispute Management
 */

export const CreateDisputeSchema = createValidator({
  contractId: { required: true, type: 'string', minLength: 1 },
  reason: { required: true, type: 'string', minLength: 10, maxLength: 1000 },
  evidence: { required: false, type: 'string', maxLength: 2000 },
});

export const UpdateDisputeSchema = createValidator({
  status: { required: false, type: 'string', enum: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'] },
  resolution: { required: false, type: 'string', maxLength: 1000 },
});

/**
 * Completion & Evidence
 */

export const SubmitCompletionSchema = createValidator({
  contractId: { required: true, type: 'string', minLength: 1 },
  description: { required: true, type: 'string', minLength: 10, maxLength: 2000 },
  evidenceUrls: { required: false, type: 'string', maxLength: 5000 },
  completionDate: { required: true, type: 'string' },
});

/**
 * Territory Management
 */

export const LeaseTerritoriesSchema = createValidator({
  territories: { required: true, type: 'string', minLength: 1 },
  duration: { required: true, type: 'number', min: 1, max: 60 },
  paymentMethod: { required: true, type: 'string', enum: ['CREDIT_CARD', 'BANK_TRANSFER'] },
});

/**
 * Webhook Schemas (for external services)
 */

export const StripeWebhookSchema = createValidator({
  type: { required: true, type: 'string' },
  data: { required: true, type: 'object' },
});

export const TwilioWebhookSchema = createValidator({
  MessageSid: { required: true, type: 'string' },
  Body: { required: true, type: 'string', maxLength: 1000 },
  From: { required: true, type: 'string' },
});

/**
 * Pagination Schemas
 */

export const PaginationSchema = createValidator({
  page: { required: false, type: 'number', min: 1 },
  limit: { required: false, type: 'number', min: 1, max: 100 },
  sort: { required: false, type: 'string', maxLength: 50 },
});

/**
 * Search/Filter Schemas
 */

export const SearchJobsSchema = createValidator({
  keyword: { required: false, type: 'string', maxLength: 200 },
  category: { required: false, type: 'string', maxLength: 50 },
  minBudget: { required: false, type: 'number', min: 0 },
  maxBudget: { required: false, type: 'number', max: 999999 },
  location: { required: false, type: 'string', maxLength: 200 },
  status: { required: false, type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'] },
});

export const SearchContractorsSchema = createValidator({
  keyword: { required: false, type: 'string', maxLength: 200 },
  minRating: { required: false, type: 'number', min: 0, max: 5 },
  category: { required: false, type: 'string', maxLength: 50 },
  minBidsAccepted: { required: false, type: 'number', min: 0 },
});

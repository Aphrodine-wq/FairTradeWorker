import { Database } from '../database';
import { UserProfile, UserRole } from '../../types';

const prisma = new Database();

/**
 * UserService
 * Manages user profiles, preferences, and account information
 * - Profile retrieval and updates
 * - Contractor specialization management
 * - User preferences management
 * - Business profile setup (for contractors)
 * - Account tier management
 * - Profile completeness tracking
 */
export class UserService {
  private db: Database;

  constructor() {
    this.db = new Database();
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await this.db.users.findById(userId);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        preferences: user.preferences,
        tradeTypes: user.tradeTypes,
        avgResponseTime: user.avgResponseTime,
        reputationScore: user.reputationScore,
        businessProfile: user.businessProfile,
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const user = await this.db.users.findById(userId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const updated = {
        ...user,
        ...updates,
        id: user.id, // Prevent ID modification
        email: user.email, // Prevent email modification
        role: user.role, // Prevent role modification
        updatedAt: new Date().toISOString(),
      };

      await this.db.users.update(userId, updated);

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'PROFILE_UPDATED',
        userId,
        details: { updatedFields: Object.keys(updates) },
      });

      return this.getProfile(userId) as Promise<UserProfile>;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Set contractor specializations (trade types)
   */
  async setContractorSpecializations(
    contractorId: string,
    tradeTypes: string[]
  ): Promise<{ success: boolean }> {
    try {
      const user = await this.db.users.findById(contractorId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.role !== 'CONTRACTOR' && user.role !== 'SUBCONTRACTOR') {
        throw new Error('INVALID_ROLE');
      }

      // Validate trade types
      const validTrades = [
        'Plumbing',
        'Electrical',
        'Carpentry',
        'HVAC',
        'Painting',
        'Appliances',
        'Roofing',
        'Other',
      ];

      const validatedTrades = tradeTypes.filter((t) => validTrades.includes(t));

      if (validatedTrades.length === 0) {
        throw new Error('INVALID_TRADE_TYPES');
      }

      await this.db.users.update(contractorId, {
        ...user,
        tradeTypes: validatedTrades,
        updatedAt: new Date().toISOString(),
      });

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'SPECIALIZATIONS_UPDATED',
        userId: contractorId,
        details: { tradeTypes: validatedTrades },
      });

      return { success: true };
    } catch (error) {
      console.error('Error setting specializations:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: {
      aiPersonality?: 'PROFESSIONAL' | 'FRIENDLY' | 'MINIMAL';
      verbosity?: 'CONCISE' | 'DETAILED';
      theme?: 'SYSTEM' | 'DARK' | 'LIGHT';
    }
  ): Promise<{ success: boolean }> {
    try {
      const user = await this.db.users.findById(userId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const updated = {
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences,
        },
        updatedAt: new Date().toISOString(),
      };

      await this.db.users.update(userId, updated);

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'PREFERENCES_UPDATED',
        userId,
        details: { preferences },
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Set up business profile (for contractors)
   */
  async setupBusinessProfile(
    contractorId: string,
    businessProfile: {
      businessName: string;
      ein: string;
      licenseNumber: string;
      licenseState: string;
      insuranceProvider: string;
      policyNumber: string;
      policyExpiration: string;
    }
  ): Promise<{ success: boolean }> {
    try {
      const user = await this.db.users.findById(contractorId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.role !== 'CONTRACTOR' && user.role !== 'FRANCHISE_OWNER') {
        throw new Error('INVALID_ROLE');
      }

      const updated = {
        ...user,
        businessProfile: {
          ...businessProfile,
          isVerified: false, // Will be verified after admin review
        },
        updatedAt: new Date().toISOString(),
      };

      await this.db.users.update(contractorId, updated);

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'BUSINESS_PROFILE_SETUP',
        userId: contractorId,
        details: { businessName: businessProfile.businessName },
      });

      return { success: true };
    } catch (error) {
      console.error('Error setting up business profile:', error);
      throw error;
    }
  }

  /**
   * Get user's reputation score
   */
  async getReputationScore(contractorId: string): Promise<number> {
    try {
      const user = await this.db.users.findById(contractorId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      // Calculate from completions
      const completions = await this.db.jobCompletions.find({
        contractId: { $in: (await this.getContractorContracts(contractorId)).map((c: any) => c.id) },
        status: 'APPROVED',
      });

      if (completions.length === 0) {
        return 0;
      }

      const avgRating =
        completions.reduce((sum: number, c: any) => sum + (c.homeownerSatisfaction || 0), 0) /
        completions.length;

      // Score is 1-5 based on average rating
      return Math.round(avgRating * 10) / 10;
    } catch (error) {
      console.error('Error getting reputation score:', error);
      return 0;
    }
  }

  /**
   * Get contractor's contracts (helper)
   */
  private async getContractorContracts(contractorId: string): Promise<any[]> {
    return await this.db.bidContracts.find({ contractorId });
  }

  /**
   * Update reputation score (called after completion approval)
   */
  async updateReputationScore(contractorId: string): Promise<void> {
    try {
      const score = await this.getReputationScore(contractorId);
      const user = await this.db.users.findById(contractorId);

      if (user) {
        await this.db.users.update(contractorId, {
          ...user,
          reputationScore: score,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating reputation score:', error);
    }
  }

  /**
   * Get onboarding status for contractor
   */
  async getOnboardingStatus(contractorId: string): Promise<{
    step: number;
    status: 'INCOMPLETE' | 'IN_PROGRESS' | 'COMPLETE';
    completed: string[];
    pending: string[];
  }> {
    try {
      const user = await this.db.users.findById(contractorId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      const completed: string[] = [];
      const pending: string[] = [];

      // Check profile completion
      if (user.name && user.email) {
        completed.push('PROFILE_INFO');
      } else {
        pending.push('PROFILE_INFO');
      }

      // Check phone verification
      if (user.phoneVerified) {
        completed.push('PHONE_VERIFICATION');
      } else {
        pending.push('PHONE_VERIFICATION');
      }

      // Check business profile
      if (user.businessProfile) {
        completed.push('BUSINESS_PROFILE');
      } else {
        pending.push('BUSINESS_PROFILE');
      }

      // Check license verification
      const licenseVerification = await this.db.verifications.findOne({
        contractorId,
        type: 'LICENSE',
        status: 'VERIFIED',
      });

      if (licenseVerification) {
        completed.push('LICENSE_VERIFICATION');
      } else {
        pending.push('LICENSE_VERIFICATION');
      }

      // Check background check
      const bgCheck = await this.db.verifications.findOne({
        contractorId,
        type: 'BACKGROUND_CHECK',
        status: 'VERIFIED',
      });

      if (bgCheck) {
        completed.push('BACKGROUND_CHECK');
      } else {
        pending.push('BACKGROUND_CHECK');
      }

      // Check insurance
      const insurance = await this.db.verifications.findOne({
        contractorId,
        type: { $regex: 'INSURANCE' },
        status: 'VERIFIED',
      });

      if (insurance) {
        completed.push('INSURANCE_VERIFICATION');
      } else {
        pending.push('INSURANCE_VERIFICATION');
      }

      // Check specializations
      if (user.tradeTypes && user.tradeTypes.length > 0) {
        completed.push('SPECIALIZATIONS');
      } else {
        pending.push('SPECIALIZATIONS');
      }

      // Check payout info
      if (user.bankAccount) {
        completed.push('PAYOUT_INFO');
      } else {
        pending.push('PAYOUT_INFO');
      }

      const step = completed.length;
      const status = pending.length === 0 ? 'COMPLETE' : pending.length < 3 ? 'IN_PROGRESS' : 'INCOMPLETE';

      return { step, status, completed, pending };
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      throw error;
    }
  }

  /**
   * Get list of contractors (for admin/marketplace)
   */
  async listContractors(filters?: {
    specialization?: string;
    minRating?: number;
    verified?: boolean;
    offset?: number;
    limit?: number;
  }): Promise<{ contractors: UserProfile[]; total: number }> {
    try {
      const query: any = {
        role: { $in: ['CONTRACTOR', 'SUBCONTRACTOR'] },
      };

      if (filters?.specialization) {
        query.tradeTypes = filters.specialization;
      }

      if (filters?.minRating) {
        query.reputationScore = { $gte: filters.minRating };
      }

      if (filters?.verified !== undefined) {
        query['businessProfile.isVerified'] = filters.verified;
      }

      const contractors = await this.db.users.find(query, {
        offset: filters?.offset || 0,
        limit: filters?.limit || 50,
        sort: { reputationScore: -1 },
      });

      const total = await this.db.users.count(query);

      return { contractors, total };
    } catch (error) {
      console.error('Error listing contractors:', error);
      throw error;
    }
  }

  /**
   * Get user's response time (average hours to respond to bids)
   */
  async calculateAverageResponseTime(contractorId: string): Promise<string> {
    try {
      const contracts = await this.db.bidContracts.find({
        contractorId,
        acceptedAt: { $exists: true },
        createdAt: { $exists: true },
      });

      if (contracts.length === 0) {
        return 'N/A';
      }

      const responseTimes = contracts.map((c: any) => {
        const created = new Date(c.createdAt).getTime();
        const accepted = new Date(c.acceptedAt).getTime();
        return (accepted - created) / (1000 * 60 * 60); // Convert to hours
      });

      const average = responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length;

      return `${Math.round(average)}h`;
    } catch (error) {
      console.error('Error calculating response time:', error);
      return 'N/A';
    }
  }

  /**
   * Update response time (periodic calculation)
   */
  async updateResponseTime(contractorId: string): Promise<void> {
    try {
      const avgResponseTime = await this.calculateAverageResponseTime(contractorId);
      const user = await this.db.users.findById(contractorId);

      if (user) {
        await this.db.users.update(contractorId, {
          ...user,
          avgResponseTime,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error updating response time:', error);
    }
  }

  /**
   * Search users by name or email (admin search)
   */
  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const regex = new RegExp(query, 'i');
      const users = await this.db.users.find({
        $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }],
      });

      return users.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        preferences: user.preferences,
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}

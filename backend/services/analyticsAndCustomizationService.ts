/**
 * Analytics & Customization Service - PHASE 2/3
 * Provides analytics dashboards and advanced UI customization
 */

import { Database } from '../database';

const prisma = new Database();

/**
 * ============================================================================
 * PHASE 3: ADVANCED CUSTOMIZATION OPTIONS
 * ============================================================================
 */

export interface CustomizationTheme {
  // Visual Customization
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;

  // Typography
  fontFamily?: string;
  headingSize?: 'small' | 'medium' | 'large';
  bodySize?: 'small' | 'medium' | 'large';
  lineHeight?: number;

  // Layout
  spacing?: 'compact' | 'normal' | 'spacious';
  borderRadius?: 'sharp' | 'slight' | 'rounded' | 'very-rounded';
  glassMorphism?: boolean;
  darkMode?: boolean;

  // Accessibility
  colorBlindnessMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  dyslexiaFont?: boolean;
  largeText?: boolean;
  highContrast?: boolean;

  // Navigation
  sidebarPosition?: 'left' | 'right';
  sidebarCollapsed?: boolean;
  showBreadcrumbs?: boolean;
  showNavigation?: boolean;

  // Advanced
  customLogo?: string;
  customFavicon?: string;
  customBrandName?: string;
  emailTemplateCustomization?: boolean;
  whiteLabel?: boolean;
}

export class AnalyticsAndCustomizationService {
  /**
   * ========================================================================
   * ANALYTICS FEATURES (PHASE 2)
   * ========================================================================
   */

  /**
   * Get bid analytics for contractor
   */
  async getBidAnalytics(contractorId: string): Promise<any> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Get bid metrics
      const totalBids = await prisma.bid.count({
        where: { contractorId },
      });

      const acceptedBids = await prisma.bid.count({
        where: { contractorId, status: 'ACCEPTED' },
      });

      const recentBids = await prisma.bid.count({
        where: {
          contractorId,
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      const bidsData = await prisma.bid.findMany({
        where: { contractorId },
        select: { amount: true, createdAt: true },
      });

      const avgBidAmount =
        bidsData.length > 0
          ? bidsData.reduce((sum, b) => sum + b.amount, 0) / bidsData.length
          : 0;

      const winRate = totalBids > 0 ? (acceptedBids / totalBids) * 100 : 0;

      // Get response time
      const responseTime =
        bidsData.length > 0
          ? bidsData.reduce((sum, b) => {
              const jobCreatedAt = new Date(b.createdAt);
              const responseMs =
                new Date().getTime() - jobCreatedAt.getTime();
              return sum + responseMs / (1000 * 60 * 60); // hours
            }, 0) / bidsData.length
          : 0;

      return {
        totalBids,
        acceptedBids,
        recentBids,
        avgBidAmount: Math.round(avgBidAmount * 100) / 100,
        winRate: Math.round(winRate * 10) / 10,
        responseTimeHours: Math.round(responseTime * 10) / 10,
      };
    } catch (error: any) {
      console.error('❌ Error fetching bid analytics:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(contractorId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const contracts = await prisma.bidContract.findMany({
        where: {
          contractorId,
          status: 'COMPLETED',
          completedAt: { gte: startDate },
        },
        select: {
          amount: true,
          platformFee: true,
          contractorNet: true,
          completedAt: true,
        },
      });

      const totalRevenue = contracts.reduce((sum, c) => sum + c.amount, 0);
      const totalFees = contracts.reduce((sum, c) => sum + c.platformFee, 0);
      const netEarnings = contracts.reduce((sum, c) => sum + c.contractorNet, 0);

      // Group by week
      const weeklyData: any = {};
      contracts.forEach((c) => {
        const week = Math.floor(
          (new Date().getTime() - c.completedAt!.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        const weekKey = `week_${week}`;
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { revenue: 0, count: 0 };
        }
        weeklyData[weekKey].revenue += c.contractorNet;
        weeklyData[weekKey].count++;
      });

      return {
        period: `Last ${days} days`,
        completedContracts: contracts.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalFeesPaid: Math.round(totalFees * 100) / 100,
        netEarnings: Math.round(netEarnings * 100) / 100,
        avgContractValue: contracts.length > 0
          ? Math.round((totalRevenue / contracts.length) * 100) / 100
          : 0,
        weeklyData,
      };
    } catch (error: any) {
      console.error('❌ Error fetching revenue analytics:', error);
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }

  /**
   * Get dashboard metrics for homeowner
   */
  async getHomeownerDashboard(homeownerId: string): Promise<any> {
    try {
      const [
        activeJobs,
        completedJobs,
        totalSpent,
        activeContracts,
      ] = await Promise.all([
        prisma.job.count({ where: { postedById: homeownerId, status: 'OPEN' } }),
        prisma.job.count({
          where: { postedById: homeownerId, status: 'COMPLETED' },
        }),
        prisma.bidContract.aggregate({
          where: { homeownerId, status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.bidContract.count({
          where: { homeownerId, status: { in: ['ACTIVE', 'PENDING_APPROVAL'] } },
        }),
      ]);

      return {
        activeJobs,
        completedJobs,
        totalSpent: Math.round((totalSpent._sum.amount || 0) * 100) / 100,
        activeContracts,
      };
    } catch (error: any) {
      console.error('❌ Error fetching homeowner dashboard:', error);
      throw new Error(`Failed to fetch dashboard: ${error.message}`);
    }
  }

  /**
   * Get platform metrics (admin)
   */
  async getPlatformMetrics(): Promise<any> {
    try {
      const [
        totalUsers,
        totalJobs,
        totalContracts,
        totalRevenue,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.job.count(),
        prisma.bidContract.count({ where: { status: 'COMPLETED' } }),
        prisma.bidContract.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { platformFee: true },
        }),
      ]);

      const contractors = await prisma.user.count({
        where: { role: 'CONTRACTOR' },
      });

      const homeowners = await prisma.user.count({
        where: { role: 'HOMEOWNER' },
      });

      return {
        totalUsers,
        contractors,
        homeowners,
        totalJobs,
        completedJobs: totalContracts,
        totalPlatformRevenue: Math.round((totalRevenue._sum.platformFee || 0) * 100) / 100,
      };
    } catch (error: any) {
      console.error('❌ Error fetching platform metrics:', error);
      throw new Error(`Failed to fetch metrics: ${error.message}`);
    }
  }

  /**
   * ========================================================================
   * CUSTOMIZATION FEATURES (PHASE 3)
   * ========================================================================
   */

  /**
   * Get user customization settings
   */
  async getCustomization(userId: string): Promise<CustomizationTheme> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      if (!user) throw new Error('User not found');

      const preferences = user.preferences as any;
      return preferences.theme || this.getDefaultTheme();
    } catch (error: any) {
      console.error('❌ Error fetching customization:', error);
      throw new Error(`Failed to fetch customization: ${error.message}`);
    }
  }

  /**
   * Update user customization
   */
  async updateCustomization(
    userId: string,
    theme: Partial<CustomizationTheme>
  ): Promise<CustomizationTheme> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      if (!user) throw new Error('User not found');

      const currentPrefs = (user.preferences as any) || {};
      const updatedPrefs = {
        ...currentPrefs,
        theme: {
          ...(currentPrefs.theme || this.getDefaultTheme()),
          ...theme,
        },
      };

      await prisma.user.update({
        where: { id: userId },
        data: { preferences: updatedPrefs },
      });

      console.log(`✅ Customization updated for user: ${userId}`);
      return updatedPrefs.theme;
    } catch (error: any) {
      console.error('❌ Error updating customization:', error);
      throw new Error(`Failed to update customization: ${error.message}`);
    }
  }

  /**
   * Get available customization presets
   */
  getAvailablePresets(): { [key: string]: CustomizationTheme } {
    return {
      light: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        darkMode: false,
        fontFamily: 'Inter, sans-serif',
        spacing: 'normal',
        borderRadius: 'rounded',
      },
      dark: {
        primaryColor: '#60A5FA',
        secondaryColor: '#34D399',
        backgroundColor: '#1F2937',
        textColor: '#F3F4F6',
        darkMode: true,
        fontFamily: 'Inter, sans-serif',
        spacing: 'normal',
        borderRadius: 'rounded',
      },
      professional: {
        primaryColor: '#1E40AF',
        secondaryColor: '#0369A1',
        backgroundColor: '#F8FAFC',
        textColor: '#0F172A',
        darkMode: false,
        fontFamily: 'Georgia, serif',
        spacing: 'spacious',
        borderRadius: 'slight',
      },
      compact: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        spacing: 'compact',
        borderRadius: 'sharp',
        headingSize: 'small',
        bodySize: 'small',
      },
      accessible: {
        highContrast: true,
        largeText: true,
        primaryColor: '#000000',
        secondaryColor: '#FFD700',
        dyslexiaFont: true,
      },
    };
  }

  /**
   * Get customization tier limits by subscription
   */
  getCustomizationTierFeatures(): { [tier: string]: string[] } {
    return {
      FREE: [
        'theme_selection',
        'dark_mode',
        'accessibility_basic',
      ],
      STARTER: [
        'theme_selection',
        'dark_mode',
        'color_picker',
        'accessibility_full',
        'font_customization',
      ],
      PRO: [
        'theme_selection',
        'dark_mode',
        'color_picker',
        'accessibility_full',
        'font_customization',
        'logo_upload',
        'navigation_customization',
      ],
      ELITE: [
        'theme_selection',
        'dark_mode',
        'color_picker',
        'accessibility_full',
        'font_customization',
        'logo_upload',
        'navigation_customization',
        'brand_customization',
        'email_templates',
        'glassmorphism',
      ],
      ENTERPRISE: [
        '*', // All features
        'white_label',
        'advanced_analytics',
        'custom_domain',
        'sso_integration',
      ],
    };
  }

  /**
   * Get default theme
   */
  private getDefaultTheme(): CustomizationTheme {
    return {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter, sans-serif',
      headingSize: 'medium',
      bodySize: 'medium',
      spacing: 'normal',
      borderRadius: 'rounded',
      glassMorphism: false,
      darkMode: false,
      colorBlindnessMode: 'none',
      dyslexiaFont: false,
      largeText: false,
      highContrast: false,
      sidebarPosition: 'left',
      sidebarCollapsed: false,
      showBreadcrumbs: true,
      showNavigation: true,
      whiteLabel: false,
    };
  }

  /**
   * Export analytics as CSV
   */
  async exportAnalyticsCSV(contractorId: string, type: string): Promise<string> {
    try {
      let data: any[];
      let headers: string[] = [];

      if (type === 'bids') {
        const bids = await prisma.bid.findMany({
          where: { contractorId },
          select: {
            id: true,
            amount: true,
            timeline: true,
            status: true,
            createdAt: true,
            job: { select: { title: true } },
          },
        });

        headers = ['BID_ID', 'JOB_TITLE', 'AMOUNT', 'TIMELINE', 'STATUS', 'DATE'];
        data = bids.map((b) => [
          b.id,
          (b.job as any)?.title || 'N/A',
          b.amount,
          b.timeline,
          b.status,
          b.createdAt.toISOString(),
        ]);
      } else if (type === 'revenue') {
        const contracts = await prisma.bidContract.findMany({
          where: { contractorId, status: 'COMPLETED' },
          select: {
            id: true,
            amount: true,
            platformFee: true,
            contractorNet: true,
            completedAt: true,
            job: { select: { title: true } },
          },
        });

        headers = [
          'CONTRACT_ID',
          'JOB_TITLE',
          'TOTAL_AMOUNT',
          'PLATFORM_FEE',
          'NET_EARNINGS',
          'COMPLETED_DATE',
        ];
        data = contracts.map((c) => [
          c.id,
          (c.job as any)?.title || 'N/A',
          c.amount,
          c.platformFee,
          c.contractorNet,
          c.completedAt?.toISOString() || 'N/A',
        ]);
      }

      // Build CSV
      let csv = headers.join(',') + '\n';
      data.forEach((row: any) => {
        csv += row.map((cell: any) => `"${cell}"`).join(',') + '\n';
      });

      return csv;
    } catch (error: any) {
      console.error('❌ Error exporting analytics:', error);
      throw new Error(`Failed to export analytics: ${error.message}`);
    }
  }
}

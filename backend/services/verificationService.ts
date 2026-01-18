import { Database } from '../database';
import { NotificationService } from './notificationService';

/**
 * VerificationService
 * Manages contractor verification and compliance
 * - License verification against state databases
 * - Background check processing
 * - Insurance coverage validation
 * - Verification result caching and expiration
 */
export class VerificationService {
  private db: Database;
  private notificationService: NotificationService;

  // Integration stubs for third-party providers
  private licenseVerificationProviders: any = {
    // Example: Construct or other state license verification APIs
  };

  private backgroundCheckProvider: any = {
    // Example: Checkr or Clear or other background check API
  };

  private insuranceProvider: any = {
    // Example: Insurance company API or aggregator
  };

  constructor() {
    this.db = new Database();
    this.notificationService = new NotificationService();
  }

  /**
   * Verify contractor license
   */
  async verifyLicense(data: {
    contractorId: string;
    licenseNumber: string;
    licenseState: string;
    licenseType?: string; // General Contractor, Plumber, Electrician, etc.
  }): Promise<any> {
    try {
      // Check if verification is cached and still valid
      const cached = await this.getCachedVerification(data.contractorId, 'LICENSE');
      if (cached && this.isVerificationValid(cached)) {
        return cached;
      }

      // Call state license verification API
      const result = await this.callLicenseVerificationAPI({
        licenseNumber: data.licenseNumber,
        state: data.licenseState,
        licenseType: data.licenseType,
      });

      const verification = {
        id: `verify_${Date.now()}`,
        contractorId: data.contractorId,
        type: 'LICENSE',
        licenseNumber: data.licenseNumber,
        licenseState: data.licenseState,
        licenseType: data.licenseType || 'General Contractor',
        status: result.isValid ? 'VERIFIED' : 'FAILED',
        isValid: result.isValid,
        expirationDate: result.expirationDate,
        licenseStatus: result.licenseStatus, // ACTIVE, INACTIVE, SUSPENDED, REVOKED
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Cache for 1 year
        details: {
          name: result.contractorName,
          address: result.address,
          email: result.email,
          phone: result.phone,
        },
      };

      // Save verification
      await this.db.verifications.insert(verification);

      // Update contractor profile
      await this.updateContractorVerificationStatus(data.contractorId);

      // Notify contractor
      if (verification.status === 'VERIFIED') {
        await this.notificationService.sendNotification({
          userId: data.contractorId,
          type: 'LICENSE_VERIFIED',
          title: 'License Verified',
          message: `Your ${data.licenseType} license has been verified and is active.`,
          actionUrl: '/settings/verification',
          priority: 'MEDIUM',
        });
      } else {
        await this.notificationService.sendNotification({
          userId: data.contractorId,
          type: 'LICENSE_VERIFICATION_FAILED',
          title: 'License Verification Failed',
          message: `Unable to verify your license. Status: ${result.licenseStatus}. Please update your information.`,
          actionUrl: '/settings/verification',
          priority: 'HIGH',
        });
      }

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'LICENSE_VERIFICATION_ATTEMPT',
        userId: data.contractorId,
        details: {
          licenseNumber: data.licenseNumber,
          state: data.licenseState,
          result: verification.status,
        },
      });

      return verification;
    } catch (error) {
      console.error('Error verifying license:', error);
      throw error;
    }
  }

  /**
   * Request background check
   */
  async requestBackgroundCheck(data: {
    contractorId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn?: string; // Last 4 digits only
    email: string;
    phone: string;
  }): Promise<any> {
    try {
      // Check if recent background check exists
      const cached = await this.getCachedVerification(data.contractorId, 'BACKGROUND_CHECK');
      if (cached && this.isVerificationValid(cached)) {
        return cached;
      }

      // Initiate background check request
      const bgCheckRequest = {
        id: `bgcheck_${Date.now()}`,
        contractorId: data.contractorId,
        type: 'BACKGROUND_CHECK',
        status: 'PENDING',
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        phone: data.phone,
        createdAt: new Date().toISOString(),
        externalRequestId: null,
      };

      // Call background check provider
      try {
        const response = await this.callBackgroundCheckAPI({
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          email: data.email,
          phone: data.phone,
        });

        bgCheckRequest.externalRequestId = response.requestId;

        // Save request
        await this.db.verifications.insert(bgCheckRequest);

        // Notify contractor
        await this.notificationService.sendNotification({
          userId: data.contractorId,
          type: 'BACKGROUND_CHECK_INITIATED',
          title: 'Background Check in Progress',
          message: 'We have initiated your background check. This typically completes within 24-48 hours.',
          actionUrl: '/settings/verification',
          priority: 'MEDIUM',
        });

        return bgCheckRequest;
      } catch (apiError) {
        console.error('Background check API error:', apiError);
        bgCheckRequest.status = 'FAILED';
        await this.db.verifications.insert(bgCheckRequest);
        throw apiError;
      }
    } catch (error) {
      console.error('Error requesting background check:', error);
      throw error;
    }
  }

  /**
   * Get background check results (called via webhook from provider)
   */
  async getBackgroundCheckResults(data: {
    externalRequestId: string;
    contractorId: string;
    clearanceStatus: 'CLEAR' | 'CONCERN' | 'FAILED';
    details: {
      criminalRecord?: boolean;
      sexOffenderRegistry?: boolean;
      terroristWatchlist?: boolean;
      concerns?: string[];
    };
  }): Promise<any> {
    try {
      const bgCheck = await this.db.verifications.findOne({
        externalRequestId: data.externalRequestId,
        type: 'BACKGROUND_CHECK',
      });

      if (!bgCheck) {
        throw new Error('Background check request not found');
      }

      const verification = {
        ...bgCheck,
        status: data.clearanceStatus === 'CLEAR' ? 'VERIFIED' : 'FAILED',
        isValid: data.clearanceStatus === 'CLEAR',
        clearanceStatus: data.clearanceStatus,
        details: data.details,
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Cache for 1 year
      };

      // Update verification
      await this.db.verifications.update(bgCheck.id, verification);

      // Update contractor profile
      await this.updateContractorVerificationStatus(data.contractorId);

      // Notify contractor
      if (data.clearanceStatus === 'CLEAR') {
        await this.notificationService.sendNotification({
          userId: data.contractorId,
          type: 'BACKGROUND_CHECK_CLEAR',
          title: 'Background Check Passed',
          message: 'Your background check has been completed and you are cleared to work on the platform.',
          actionUrl: '/settings/verification',
          priority: 'MEDIUM',
        });
      } else {
        await this.notificationService.sendNotification({
          userId: data.contractorId,
          type: 'BACKGROUND_CHECK_CONCERN',
          title: 'Background Check Review Required',
          message: 'Your background check requires manual review. Our team will contact you within 48 hours.',
          actionUrl: '/settings/verification',
          priority: 'HIGH',
        });
      }

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'BACKGROUND_CHECK_COMPLETED',
        userId: data.contractorId,
        details: {
          clearanceStatus: data.clearanceStatus,
          concerns: data.details.concerns,
        },
      });

      return verification;
    } catch (error) {
      console.error('Error processing background check results:', error);
      throw error;
    }
  }

  /**
   * Verify insurance coverage
   */
  async verifyInsurance(data: {
    contractorId: string;
    insuranceProvider: string;
    policyNumber: string;
    coverageType: 'GENERAL_LIABILITY' | 'WORKERS_COMP' | 'TOOLS_EQUIPMENT';
    coverageAmount: number;
    expirationDate: string;
    policyDocument?: string; // Base64 encoded PDF
  }): Promise<any> {
    try {
      // Check if verification is cached and still valid
      const cached = await this.getCachedVerification(data.contractorId, `INSURANCE_${data.coverageType}`);
      if (cached && this.isVerificationValid(cached)) {
        return cached;
      }

      // Verify insurance with provider
      const result = await this.callInsuranceVerificationAPI({
        insuranceProvider: data.insuranceProvider,
        policyNumber: data.policyNumber,
        coverageType: data.coverageType,
      });

      const verification = {
        id: `verify_${Date.now()}`,
        contractorId: data.contractorId,
        type: `INSURANCE_${data.coverageType}`,
        insuranceProvider: data.insuranceProvider,
        policyNumber: data.policyNumber,
        coverageType: data.coverageType,
        coverageAmount: data.coverageAmount,
        expirationDate: data.expirationDate,
        status: result.isValid ? 'VERIFIED' : 'FAILED',
        isValid: result.isValid,
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Cache for 1 year
        details: {
          policyStatus: result.policyStatus,
          activeInsured: result.activeInsured,
          limits: result.limits,
        },
      };

      // Save verification
      await this.db.verifications.insert(verification);

      // Update contractor profile
      await this.updateContractorVerificationStatus(data.contractorId);

      // Notify contractor
      if (verification.status === 'VERIFIED') {
        await this.notificationService.sendNotification({
          userId: data.contractorId,
          type: 'INSURANCE_VERIFIED',
          title: `${data.coverageType} Insurance Verified`,
          message: `Your ${data.coverageType} insurance coverage has been verified.`,
          actionUrl: '/settings/verification',
          priority: 'MEDIUM',
        });
      }

      return verification;
    } catch (error) {
      console.error('Error verifying insurance:', error);
      throw error;
    }
  }

  /**
   * Get contractor verification status summary
   */
  async getContractorVerificationStatus(contractorId: string): Promise<any> {
    try {
      const verifications = await this.db.verifications.find({
        contractorId,
      });

      const licenseVerifications = verifications.filter((v: any) => v.type === 'LICENSE');
      const backgroundCheck = verifications.find((v: any) => v.type === 'BACKGROUND_CHECK');
      const insuranceVerifications = verifications.filter((v: any) => v.type.startsWith('INSURANCE_'));

      const status = {
        contractorId,
        licenseVerified: licenseVerifications.some((v: any) => v.status === 'VERIFIED'),
        backgroundCheckPassed: backgroundCheck?.status === 'VERIFIED',
        insuranceVerified: insuranceVerifications.some((v: any) => v.status === 'VERIFIED'),
        licenses: licenseVerifications.map((v: any) => ({
          licenseNumber: v.licenseNumber,
          state: v.licenseState,
          type: v.licenseType,
          status: v.status,
          expirationDate: v.expirationDate,
          verifiedAt: v.verifiedAt,
        })),
        insurance: insuranceVerifications.map((v: any) => ({
          type: v.coverageType,
          provider: v.insuranceProvider,
          status: v.status,
          expirationDate: v.expirationDate,
          amount: v.coverageAmount,
        })),
        backgroundCheck: backgroundCheck ? {
          status: backgroundCheck.status,
          clearanceStatus: backgroundCheck.clearanceStatus,
          verifiedAt: backgroundCheck.verifiedAt,
        } : null,
        overallCompliance: licenseVerifications.some((v: any) => v.status === 'VERIFIED') &&
                          backgroundCheck?.status === 'VERIFIED' &&
                          insuranceVerifications.some((v: any) => v.status === 'VERIFIED'),
      };

      return status;
    } catch (error) {
      console.error('Error getting contractor verification status:', error);
      throw error;
    }
  }

  /**
   * Check if contractor can bid based on verification status
   */
  async canBid(contractorId: string): Promise<{ canBid: boolean; reasons: string[] }> {
    try {
      const status = await this.getContractorVerificationStatus(contractorId);

      const reasons: string[] = [];
      if (!status.licenseVerified) {
        reasons.push('License not verified');
      }
      if (!status.backgroundCheckPassed) {
        reasons.push('Background check not passed');
      }
      if (!status.insuranceVerified) {
        reasons.push('Insurance not verified');
      }

      return {
        canBid: reasons.length === 0,
        reasons,
      };
    } catch (error) {
      console.error('Error checking bid eligibility:', error);
      throw error;
    }
  }

  /**
   * Private helper: Get cached verification
   */
  private async getCachedVerification(contractorId: string, type: string): Promise<any> {
    try {
      return await this.db.verifications.findOne({
        contractorId,
        type,
        status: 'VERIFIED',
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Private helper: Check if verification is still valid
   */
  private isVerificationValid(verification: any): boolean {
    if (!verification.expiresAt) return false;
    return new Date(verification.expiresAt) > new Date();
  }

  /**
   * Private helper: Update contractor verification status in profile
   */
  private async updateContractorVerificationStatus(contractorId: string): Promise<void> {
    try {
      const status = await this.getContractorVerificationStatus(contractorId);
      const user = await this.db.users.findById(contractorId);

      if (user) {
        await this.db.users.update(contractorId, {
          ...user,
          businessProfile: {
            ...user.businessProfile,
            isVerified: status.overallCompliance,
            verificationDate: status.overallCompliance ? new Date().toISOString() : undefined,
          },
        });
      }
    } catch (error) {
      console.error('Error updating contractor verification status:', error);
    }
  }

  /**
   * Private helper: Call state license verification API
   */
  private async callLicenseVerificationAPI(data: any): Promise<any> {
    // This is a stub that should be replaced with actual API integration
    // Example integrations:
    // - Construct.io for state license lookups
    // - Individual state contractor board APIs
    // - LexisNexis or similar aggregators

    console.log('Calling license verification API:', data);

    // Mock response for development
    return {
      isValid: true,
      contractorName: 'Sample Contractor',
      address: '123 Main St',
      email: 'contractor@example.com',
      phone: '555-0000',
      licenseStatus: 'ACTIVE',
      expirationDate: '2026-12-31',
    };
  }

  /**
   * Private helper: Call background check API
   */
  private async callBackgroundCheckAPI(data: any): Promise<any> {
    // This is a stub that should be replaced with actual API integration
    // Example integrations:
    // - Checkr (checkr.com)
    // - Clear (clearco.com)
    // - Accurate Background (accuratebackground.com)

    console.log('Calling background check API:', data);

    // Mock response for development
    return {
      requestId: `bg_${Date.now()}`,
      status: 'PENDING',
    };
  }

  /**
   * Private helper: Call insurance verification API
   */
  private async callInsuranceVerificationAPI(data: any): Promise<any> {
    // This is a stub that should be replaced with actual API integration
    // Example integrations:
    // - Insurance company direct APIs
    // - LexisNexis Insurance Services
    // - Verisk or similar aggregators

    console.log('Calling insurance verification API:', data);

    // Mock response for development
    return {
      isValid: true,
      policyStatus: 'ACTIVE',
      activeInsured: true,
      limits: {
        general: 1000000,
        products: 1000000,
        combined: 2000000,
      },
    };
  }
}

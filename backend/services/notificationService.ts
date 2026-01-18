import { Database } from '../database';

/**
 * NotificationService
 * Handles all user notifications
 * - Email notifications
 * - In-app notifications
 * - Push notifications
 * - SMS for critical alerts
 */
export class NotificationService {
  private db: Database;
  private emailProvider: any; // Placeholder for email service (SendGrid, AWS SES, etc.)
  private smsProvider: any; // Placeholder for SMS service (Twilio, etc.)

  constructor() {
    this.db = new Database();
    // Initialize providers in real implementation
    // this.emailProvider = new SendGridProvider();
    // this.smsProvider = new TwilioProvider();
  }

  /**
   * Send contract created notification
   */
  async sendContractCreatedNotification(data: {
    contractorId: string;
    homeownerId: string;
    contractId: string;
    amount: number;
  }): Promise<void> {
    // Notify contractor
    await this.sendNotification({
      userId: data.contractorId,
      type: 'CONTRACT_CREATED',
      title: 'New Contract Awaiting Acceptance',
      message: `A homeowner has accepted your bid of $${data.amount.toFixed(2)}. Review and accept the contract to begin work.`,
      actionUrl: `/contracts/${data.contractId}`,
      priority: 'HIGH',
    });

    // Notify homeowner
    await this.sendNotification({
      userId: data.homeownerId,
      type: 'BID_ACCEPTED',
      title: 'Bid Accepted - Contract Created',
      message: `Contract for $${data.amount.toFixed(2)} has been created and is awaiting contractor acceptance.`,
      actionUrl: `/contracts/${data.contractId}`,
      priority: 'MEDIUM',
    });
  }

  /**
   * Send contract accepted notification
   */
  async sendContractAcceptedNotification(data: {
    contractorId: string;
    homeownerId: string;
    contractId: string;
  }): Promise<void> {
    // Notify contractor
    await this.sendNotification({
      userId: data.contractorId,
      type: 'CONTRACT_ACCEPTED',
      title: 'Contract Accepted - Work Authorized',
      message: 'The homeowner has accepted your contract. You can now begin work.',
      actionUrl: `/contracts/${data.contractId}`,
      priority: 'HIGH',
    });

    // Notify homeowner
    await this.sendNotification({
      userId: data.homeownerId,
      type: 'CONTRACT_ACCEPTED',
      title: 'Contractor Accepted - Work Begins',
      message: 'The contractor has accepted your contract. Work will begin soon.',
      actionUrl: `/contracts/${data.contractId}`,
      priority: 'MEDIUM',
    });
  }

  /**
   * Send completion submitted notification
   */
  async sendCompletionSubmittedNotification(data: {
    homeownerId: string;
    contractId: string;
    completionId: string;
    disputeWindowExpires: Date;
  }): Promise<void> {
    await this.sendNotification({
      userId: data.homeownerId,
      type: 'COMPLETION_SUBMITTED',
      title: 'Work Submitted for Review',
      message: 'The contractor has submitted their work for your review. Please approve or dispute within 5 days.',
      actionUrl: `/completions/${data.completionId}`,
      priority: 'HIGH',
    });

    // Also create in-app notification for easy access
    await this.db.inAppNotifications.insert({
      id: `notif_${Date.now()}`,
      userId: data.homeownerId,
      type: 'COMPLETION_REVIEW_PENDING',
      title: 'Work Ready for Review',
      message: 'Contractor submission is ready for approval',
      actionUrl: `/completions/${data.completionId}`,
      expiresAt: data.disputeWindowExpires.toISOString(),
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Send payment released notification
   */
  async sendPaymentReleasedNotification(data: {
    contractorId: string;
    contractId: string;
    amount: number;
    estimatedArrival: Date;
  }): Promise<void> {
    await this.sendNotification({
      userId: data.contractorId,
      type: 'PAYMENT_RELEASED',
      title: 'Payment Released!',
      message: `$${data.amount.toFixed(2)} has been released to your account. Expected arrival: ${data.estimatedArrival.toLocaleDateString()}`,
      actionUrl: `/payments/${data.contractId}`,
      priority: 'HIGH',
    });
  }

  /**
   * Send dispute initiated notification
   */
  async sendDisputeInitiatedNotification(data: {
    contractorId: string;
    homeownerId: string;
    contractId: string;
    disputeReason: string;
  }): Promise<void> {
    // Notify contractor
    await this.sendNotification({
      userId: data.contractorId,
      type: 'DISPUTE_INITIATED',
      title: 'Work Dispute Initiated',
      message: `The homeowner has disputed your work. Reason: ${data.disputeReason}. You have 48 hours to respond.`,
      actionUrl: `/disputes/${data.contractId}`,
      priority: 'CRITICAL',
      channel: ['EMAIL', 'PUSH', 'SMS'], // Send via all channels for critical
    });

    // Notify homeowner
    await this.sendNotification({
      userId: data.homeownerId,
      type: 'DISPUTE_CONFIRMED',
      title: 'Dispute Received',
      message: 'Your dispute has been received. Our mediation team will review within 48 hours.',
      actionUrl: `/disputes/${data.contractId}`,
      priority: 'HIGH',
    });
  }

  /**
   * Send dispute response received notification
   */
  async sendDisputeResponseReceivedNotification(data: {
    homeownerId: string;
    contractId: string;
    disputeId: string;
  }): Promise<void> {
    await this.sendNotification({
      userId: data.homeownerId,
      type: 'DISPUTE_RESPONSE',
      title: 'Contractor Response Received',
      message: 'The contractor has responded to your dispute. Review their response in the dispute details.',
      actionUrl: `/disputes/${data.disputeId}`,
      priority: 'HIGH',
    });
  }

  /**
   * Send dispute resolved notification
   */
  async sendDisputeResolvedNotification(data: {
    contractorId: string;
    homeownerId: string;
    contractId: string;
    resolutionPath: string;
    reasoning: string;
  }): Promise<void> {
    const resolutionText = {
      REFUND: 'Full refund issued to homeowner',
      PARTIAL_REFUND: 'Partial refund processed',
      REWORK: 'Work requires rework',
      ARBITRATION: 'Case escalated to arbitration',
    }[data.resolutionPath] || 'Dispute resolved';

    // Notify contractor
    await this.sendNotification({
      userId: data.contractorId,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute Resolution Complete',
      message: `Resolution: ${resolutionText}. Details: ${data.reasoning}`,
      actionUrl: `/contracts/${data.contractId}`,
      priority: 'HIGH',
    });

    // Notify homeowner
    await this.sendNotification({
      userId: data.homeownerId,
      type: 'DISPUTE_RESOLVED',
      title: 'Dispute Resolved',
      message: `Resolution: ${resolutionText}`,
      actionUrl: `/contracts/${data.contractId}`,
      priority: 'HIGH',
    });
  }

  /**
   * Send contract change proposed notification
   */
  async sendContractChangeProposedNotification(data: {
    userId: string;
    contractId: string;
    changeDescription: string;
  }): Promise<void> {
    await this.sendNotification({
      userId: data.userId,
      type: 'CONTRACT_CHANGE_PROPOSED',
      title: 'Contract Change Proposed',
      message: `A contract change has been proposed: ${data.changeDescription}. Please review and respond.`,
      actionUrl: `/contracts/${data.contractId}`,
      priority: 'MEDIUM',
    });
  }

  /**
   * Internal notification sending method
   */
  private async sendNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    channel?: string[]; // EMAIL, PUSH, SMS, IN_APP
  }): Promise<void> {
    // Default channels based on priority
    const channels = data.channel || {
      LOW: ['IN_APP'],
      MEDIUM: ['IN_APP', 'EMAIL'],
      HIGH: ['IN_APP', 'EMAIL', 'PUSH'],
      CRITICAL: ['IN_APP', 'EMAIL', 'PUSH', 'SMS'],
    }[data.priority];

    const notification = {
      id: `notif_${Date.now()}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      priority: data.priority,
      channels,
      read: false,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };

    // Save notification to database
    await this.db.notifications.insert(notification);

    // Send via each channel
    for (const channel of channels) {
      if (channel === 'EMAIL') {
        await this.sendEmail(data.userId, data.title, data.message);
      } else if (channel === 'PUSH') {
        await this.sendPushNotification(data.userId, data.title, data.message);
      } else if (channel === 'SMS') {
        await this.sendSMS(data.userId, data.message);
      }
      // IN_APP notifications are already saved to DB
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(userId: string, subject: string, message: string): Promise<void> {
    try {
      // Get user email
      const user = await this.db.users.findById(userId);
      if (!user || !user.email) {
        console.warn(`User ${userId} has no email address`);
        return;
      }

      // In real implementation, use email provider
      // await this.emailProvider.send({
      //   to: user.email,
      //   subject,
      //   html: message,
      // });

      console.log(`[EMAIL] Sent to ${user.email}: ${subject}`);
    } catch (error) {
      console.error(`Failed to send email to ${userId}:`, error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    try {
      // Get user devices
      const devices = await this.db.userDevices.find({ userId });

      for (const device of devices) {
        // In real implementation, use push provider
        // await this.pushProvider.send(device.pushToken, {
        //   title,
        //   message,
        // });

        console.log(`[PUSH] Sent to ${device.deviceId}: ${title}`);
      }
    } catch (error) {
      console.error(`Failed to send push notification to ${userId}:`, error);
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(userId: string, message: string): Promise<void> {
    try {
      // Get user phone number
      const user = await this.db.users.findById(userId);
      if (!user || !user.phone) {
        console.warn(`User ${userId} has no phone number`);
        return;
      }

      // In real implementation, use SMS provider
      // await this.smsProvider.send(user.phone, message);

      console.log(`[SMS] Sent to ${user.phone}: ${message}`);
    } catch (error) {
      console.error(`Failed to send SMS to ${userId}:`, error);
    }
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(userId: string, options: { unreadOnly?: boolean } = {}): Promise<any[]> {
    const query: any = { userId };
    if (options.unreadOnly) {
      query.read = false;
    }

    return await this.db.notifications.find(query, {
      sort: { createdAt: -1 },
      limit: 50,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const notification = await this.db.notifications.findById(notificationId);
    if (notification) {
      await this.db.notifications.update(notificationId, {
        ...notification,
        read: true,
      });
    }
  }
}

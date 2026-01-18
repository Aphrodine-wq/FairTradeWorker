/**
 * Enhanced Notification Service - Templates, Smart Delivery, Scheduling
 * Comprehensive notification system with templates, scheduling, and multi-channel delivery
 */

import prisma from '../../src/services/database';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  emailTemplate: string;
  smsTemplate: string;
  pushTemplate: string;
  variables: string[]; // e.g., ['userName', 'jobTitle', 'budget']
  category: 'job' | 'bid' | 'contract' | 'payment' | 'system' | 'marketing';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSchedule {
  id: string;
  userId: string;
  templateId: string;
  scheduledFor: Date;
  status: 'SCHEDULED' | 'SENT' | 'FAILED' | 'CANCELLED';
  channels: ('email' | 'sms' | 'push')[];
  templateVariables: Record<string, any>;
  sendAttempts: number;
  lastAttemptAt?: Date;
  sentAt?: Date;
  failureReason?: string;
}

export interface UserNotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  emailFrequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  smsNotifications: boolean;
  smsOnlyUrgent: boolean;
  pushNotifications: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string;
  doNotDisturbEnabled: boolean;
  preferredChannels: ('email' | 'sms' | 'push')[];
  notificationCategories: {
    jobUpdates: boolean;
    bidUpdates: boolean;
    contractUpdates: boolean;
    paymentUpdates: boolean;
    systemAlerts: boolean;
    marketing: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationLog {
  id: string;
  userId: string;
  templateId: string;
  channel: 'email' | 'sms' | 'push';
  recipient: string;
  status: 'SENT' | 'FAILED' | 'BOUNCED' | 'UNSUBSCRIBED';
  sentAt: Date;
  externalId?: string; // Stripe/SendGrid/Twilio ID
  metadata?: Record<string, any>;
}

export class NotificationServiceEnhanced {
  // Default notification templates
  private templates: Record<string, NotificationTemplate> = {
    bidReceived: {
      id: '1',
      name: 'New Bid Received',
      subject: 'New bid on "{jobTitle}"',
      emailTemplate: `
        <h2>New Bid Received</h2>
        <p>You received a bid from {contractorName} on your job "{jobTitle}"</p>
        <p><strong>Bid Amount:</strong> ${'{bidAmount}'}</p>
        <p><strong>Timeline:</strong> {timeline}</p>
        <p>{proposal}</p>
        <button>Review Bid</button>
      `,
      smsTemplate: 'New bid: {contractorName} bid ${bidAmount} on "{jobTitle}"',
      pushTemplate: 'New bid on {jobTitle} from {contractorName}',
      variables: ['jobTitle', 'contractorName', 'bidAmount', 'timeline', 'proposal'],
      category: 'bid',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    bidAccepted: {
      id: '2',
      name: 'Bid Accepted',
      subject: 'Your bid was accepted for "{jobTitle}"',
      emailTemplate: `
        <h2>Bid Accepted!</h2>
        <p>Congratulations! Your bid was accepted for "{jobTitle}"</p>
        <p><strong>Contract Value:</strong> ${'{contractValue}'}</p>
        <p>Contract details and next steps have been sent separately.</p>
      `,
      smsTemplate: 'Your bid on "{jobTitle}" was accepted! Contract value: ${contractValue}',
      pushTemplate: 'Bid accepted on {jobTitle}',
      variables: ['jobTitle', 'contractValue'],
      category: 'bid',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    milestoneReminder: {
      id: '3',
      name: 'Milestone Reminder',
      subject: 'Milestone due: {milestoneName}',
      emailTemplate: `
        <h2>Upcoming Milestone</h2>
        <p>Reminder: Milestone "{milestoneName}" is due on {dueDate}</p>
        <p><strong>Amount:</strong> ${'{milestoneAmount}'}</p>
      `,
      smsTemplate: 'Milestone "{milestoneName}" due {dueDate}',
      pushTemplate: 'Milestone reminder: {milestoneName}',
      variables: ['milestoneName', 'dueDate', 'milestoneAmount'],
      category: 'contract',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    paymentReleased: {
      id: '4',
      name: 'Payment Released',
      subject: 'Payment released: ${'{amount}'}',
      emailTemplate: `
        <h2>Payment Released</h2>
        <p>Payment of ${'{amount}'} has been released to your account</p>
        <p><strong>For:</strong> {jobTitle}</p>
        <p>Expected arrival: {expectedDate}</p>
      `,
      smsTemplate: 'Payment ${amount} released for {jobTitle}',
      pushTemplate: 'Payment released: ${amount}',
      variables: ['amount', 'jobTitle', 'expectedDate'],
      category: 'payment',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  /**
   * Get notification template
   */
  getTemplate(templateId: string): NotificationTemplate | null {
    return this.templates[templateId] || null;
  }

  /**
   * Send notification with template
   */
  async sendNotification(
    userId: string,
    templateId: string,
    variables: Record<string, any>,
    channels?: ('email' | 'sms' | 'push')[]
  ): Promise<NotificationLog[]> {
    try {
      const template = this.getTemplate(templateId);
      if (!template || !template.enabled) {
        throw new Error('Template not found or disabled');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const preferences = await this.getUserPreferences(userId);
      const finalChannels = channels || preferences.preferredChannels;

      // Check if notifications are allowed (quiet hours, DND, etc.)
      if (!this.isNotificationAllowed(preferences)) {
        return [];
      }

      const logs: NotificationLog[] = [];

      // Send via each channel
      if (finalChannels.includes('email') && preferences.emailNotifications) {
        const log = await this.sendEmail(user, template, variables);
        if (log) logs.push(log);
      }

      if (finalChannels.includes('sms') && preferences.smsNotifications) {
        if (!preferences.smsOnlyUrgent || variables['urgent']) {
          const log = await this.sendSMS(user, template, variables);
          if (log) logs.push(log);
        }
      }

      if (finalChannels.includes('push') && preferences.pushNotifications) {
        const log = await this.sendPush(user, template, variables);
        if (log) logs.push(log);
      }

      console.log(`✅ Notifications sent: ${logs.length}`);
      return logs;
    } catch (error: any) {
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Schedule notification for later
   */
  async scheduleNotification(
    userId: string,
    templateId: string,
    scheduledFor: Date,
    variables: Record<string, any>,
    channels?: ('email' | 'sms' | 'push')[]
  ): Promise<NotificationSchedule> {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const schedule = await prisma.notificationSchedule.create({
        data: {
          userId,
          templateId,
          scheduledFor,
          status: 'SCHEDULED',
          channels: channels || ['email'],
          templateVariables: variables,
          sendAttempts: 0,
        },
      });

      console.log(`✅ Notification scheduled: ${schedule.id}`);
      return schedule as NotificationSchedule;
    } catch (error: any) {
      throw new Error(`Failed to schedule notification: ${error.message}`);
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    try {
      const prefs = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      if (!prefs) {
        // Return default preferences
        return {
          userId,
          emailNotifications: true,
          emailFrequency: 'instant',
          smsNotifications: false,
          smsOnlyUrgent: true,
          pushNotifications: true,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          doNotDisturbEnabled: false,
          preferredChannels: ['email', 'push'],
          notificationCategories: {
            jobUpdates: true,
            bidUpdates: true,
            contractUpdates: true,
            paymentUpdates: true,
            systemAlerts: true,
            marketing: false,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      return prefs as UserNotificationPreferences;
    } catch (error: any) {
      throw new Error(`Failed to get preferences: ${error.message}`);
    }
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<UserNotificationPreferences>
  ): Promise<UserNotificationPreferences> {
    try {
      const prefs = await prisma.notificationPreferences.upsert({
        where: { userId },
        update: {
          ...updates,
          updatedAt: new Date(),
        },
        create: {
          userId,
          ...updates,
        },
      });

      return prefs as UserNotificationPreferences;
    } catch (error: any) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(userId: string, limit: number = 50): Promise<NotificationLog[]> {
    try {
      const logs = await prisma.notificationLog.findMany({
        where: { userId },
        orderBy: { sentAt: 'desc' },
        take: limit,
      });

      return logs as NotificationLog[];
    } catch (error: any) {
      throw new Error(`Failed to get notification history: ${error.message}`);
    }
  }

  /**
   * Send batch notifications (for campaigns, broadcasts)
   */
  async sendBatchNotification(
    userIds: string[],
    templateId: string,
    variablesList: Record<string, any>[],
    channels?: ('email' | 'sms' | 'push')[]
  ): Promise<NotificationLog[][]> {
    try {
      const results: NotificationLog[][] = [];

      for (let i = 0; i < userIds.length; i++) {
        const logs = await this.sendNotification(
          userIds[i],
          templateId,
          variablesList[i],
          channels
        );
        results.push(logs);
      }

      console.log(`✅ Batch notifications sent to ${userIds.length} users`);
      return results;
    } catch (error: any) {
      throw new Error(`Failed to send batch notifications: ${error.message}`);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(startDate: Date, endDate: Date): Promise<{
    totalSent: number;
    byChannel: Record<string, number>;
    byStatus: Record<string, number>;
    successRate: number;
    averageDeliveryTime: number;
  }> {
    try {
      const logs = await prisma.notificationLog.findMany({
        where: {
          sentAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const byChannel = { email: 0, sms: 0, push: 0 };
      const byStatus = { SENT: 0, FAILED: 0, BOUNCED: 0, UNSUBSCRIBED: 0 };

      logs.forEach((log) => {
        byChannel[log.channel]++;
        byStatus[log.status]++;
      });

      const successRate = logs.length > 0 ? (byStatus.SENT / logs.length) * 100 : 0;

      return {
        totalSent: logs.length,
        byChannel,
        byStatus,
        successRate: Math.round(successRate),
        averageDeliveryTime: 0, // Would calculate from actual data
      };
    } catch (error: any) {
      throw new Error(`Failed to get notification stats: ${error.message}`);
    }
  }

  /**
   * Process scheduled notifications (call periodically)
   */
  async processScheduledNotifications(): Promise<number> {
    try {
      const now = new Date();
      const pending = await prisma.notificationSchedule.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledFor: { lte: now },
        },
        take: 100, // Process 100 at a time
      });

      let processed = 0;

      for (const schedule of pending) {
        try {
          const logs = await this.sendNotification(
            schedule.userId,
            schedule.templateId,
            schedule.templateVariables,
            schedule.channels
          );

          await prisma.notificationSchedule.update({
            where: { id: schedule.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          });

          processed++;
        } catch (error: any) {
          await prisma.notificationSchedule.update({
            where: { id: schedule.id },
            data: {
              status: 'FAILED',
              failureReason: error.message,
              sendAttempts: schedule.sendAttempts + 1,
            },
          });
        }
      }

      console.log(`✅ Processed ${processed} scheduled notifications`);
      return processed;
    } catch (error: any) {
      throw new Error(`Failed to process scheduled notifications: ${error.message}`);
    }
  }

  // Helper methods
  private isNotificationAllowed(preferences: UserNotificationPreferences): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    if (preferences.doNotDisturbEnabled) {
      return false;
    }

    if (preferences.quietHoursEnabled) {
      const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
      const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);
      const currentTime = hour * 100 + minute;
      const startTime = startHour * 100 + startMin;
      const endTime = endHour * 100 + endMin;

      if (startTime < endTime) {
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      }
    }

    return true;
  }

  private async sendEmail(
    user: any,
    template: NotificationTemplate,
    variables: Record<string, any>
  ): Promise<NotificationLog | null> {
    try {
      const subject = this.interpolateTemplate(template.subject, variables);
      const body = this.interpolateTemplate(template.emailTemplate, variables);

      // In production, call SendGrid API
      const log = await prisma.notificationLog.create({
        data: {
          userId: user.id,
          templateId: template.id,
          channel: 'email',
          recipient: user.email,
          status: 'SENT',
          sentAt: new Date(),
          externalId: `email_${Date.now()}`,
        },
      });

      return log as NotificationLog;
    } catch (error) {
      console.error('Failed to send email:', error);
      return null;
    }
  }

  private async sendSMS(
    user: any,
    template: NotificationTemplate,
    variables: Record<string, any>
  ): Promise<NotificationLog | null> {
    try {
      const message = this.interpolateTemplate(template.smsTemplate, variables);

      // In production, call Twilio API
      const log = await prisma.notificationLog.create({
        data: {
          userId: user.id,
          templateId: template.id,
          channel: 'sms',
          recipient: user.phoneNumber || 'unknown',
          status: 'SENT',
          sentAt: new Date(),
          externalId: `sms_${Date.now()}`,
        },
      });

      return log as NotificationLog;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return null;
    }
  }

  private async sendPush(
    user: any,
    template: NotificationTemplate,
    variables: Record<string, any>
  ): Promise<NotificationLog | null> {
    try {
      const title = this.interpolateTemplate(template.subject, variables);
      const body = this.interpolateTemplate(template.pushTemplate, variables);

      // In production, call Firebase API
      const log = await prisma.notificationLog.create({
        data: {
          userId: user.id,
          templateId: template.id,
          channel: 'push',
          recipient: user.id,
          status: 'SENT',
          sentAt: new Date(),
          externalId: `push_${Date.now()}`,
        },
      });

      return log as NotificationLog;
    } catch (error) {
      console.error('Failed to send push:', error);
      return null;
    }
  }

  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }
    return result;
  }
}

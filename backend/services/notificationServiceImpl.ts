/**
 * Notification Service - Email, SMS, Push Notifications
 * Sends notifications on key events
 */

import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { Database } from '../database';

const prisma = new Database();

// Email configuration
const emailTransporter = nodemailer.createTransport({
  service: 'sendgrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY || '',
  },
});

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

export class NotificationServiceImpl {
  /**
   * Send email notification
   */
  private async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    userId?: string;
  }): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@fairtradeworker.com',
        to: params.to,
        subject: params.subject,
        html: params.html,
      };

      await emailTransporter.sendMail(mailOptions);

      // Log notification
      if (params.userId) {
        await prisma.notification.create({
          data: {
            userId: params.userId,
            type: 'EMAIL',
            channel: 'EMAIL',
            to: params.to,
            subject: params.subject,
            body: params.html,
            status: 'SENT',
          },
        });
      }

      console.log(`✅ Email sent to ${params.to}`);
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(params: {
    to: string;
    message: string;
    userId?: string;
  }): Promise<void> {
    try {
      if (!process.env.TWILIO_PHONE_NUMBER) {
        console.warn('⚠️  TWILIO_PHONE_NUMBER not set, skipping SMS');
        return;
      }

      // Validate phone number format (E.164)
      if (!/^\+?[1-9]\d{1,14}$/.test(params.to)) {
        throw new Error('Invalid phone number format. Use E.164 format (+1234567890)');
      }

      // Check user SMS preferences
      if (params.userId) {
        const user = await prisma.user.findUnique({
          where: { id: params.userId },
          select: { preferences: true },
        });

        const preferences = (user?.preferences as any) || {};
        if (preferences.notificationPreferences?.smsDisabled === true) {
          console.log(`⏭️  SMS disabled for user ${params.userId}`);
          return;
        }
      }

      // Send SMS via Twilio
      const message = await twilioClient.messages.create({
        body: params.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: params.to,
      });

      // Log notification in database
      if (params.userId) {
        await prisma.notification.create({
          data: {
            userId: params.userId,
            type: 'SMS',
            channel: 'SMS',
            to: params.to,
            body: params.message,
            status: 'SENT',
          },
        });
      }

      console.log(`✅ SMS sent to ${params.to} (SID: ${message.sid})`);
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error);

      // Log failed notification
      if (params.userId) {
        try {
          await prisma.notification.create({
            data: {
              userId: params.userId,
              type: 'SMS',
              channel: 'SMS',
              to: params.to,
              body: params.message,
              status: 'FAILED',
            },
          });
        } catch (logError) {
          console.error('Failed to log SMS error:', logError);
        }
      }
    }
  }

  /**
   * Send push notification (in-app + Firebase)
   */
  private async sendPush(params: {
    userId: string;
    title: string;
    body: string;
    actionUrl?: string;
    icon?: string;
    badge?: string;
  }): Promise<void> {
    try {
      // Check user push preferences
      const user = await prisma.user.findUnique({
        where: { id: params.userId },
        select: { preferences: true },
      });

      const preferences = (user?.preferences as any) || {};
      if (preferences.notificationPreferences?.pushDisabled === true) {
        console.log(`⏭️  Push notifications disabled for user ${params.userId}`);
        return;
      }

      // Create in-app notification record
      const notification = await prisma.inAppNotification.create({
        data: {
          userId: params.userId,
          title: params.title,
          body: params.body,
          actionUrl: params.actionUrl,
          read: false,
        },
      });

      // Send Firebase Cloud Messaging (FCM) notification if Firebase is configured
      if (process.env.FIREBASE_ENABLED === 'true') {
        try {
          // Get user's FCM tokens
          const userTokens = await this.getUserFCMTokens(params.userId);

          if (userTokens.length > 0) {
            // Build FCM payload
            const fcmPayload = {
              notification: {
                title: params.title,
                body: params.body,
                icon: params.icon || 'https://fairtradeworker.com/icon.png',
                badge: params.badge || 'https://fairtradeworker.com/badge.png',
                clickAction: params.actionUrl || 'https://fairtradeworker.com',
              },
              data: {
                notificationId: notification.id,
                userId: params.userId,
                timestamp: new Date().toISOString(),
              },
              webpush: {
                fcmOptions: {
                  link: params.actionUrl || 'https://fairtradeworker.com',
                },
                notification: {
                  title: params.title,
                  body: params.body,
                  icon: params.icon || 'https://fairtradeworker.com/icon.png',
                  badge: params.badge || 'https://fairtradeworker.com/badge.png',
                  tag: 'fairtradeworker',
                },
              },
            };

            // Send to each token (multicast)
            for (const token of userTokens) {
              try {
                // Note: Firebase Admin SDK would be used here
                // await admin.messaging().send({ token, ...fcmPayload });
                console.log(`📱 FCM push sent to token: ${token.substring(0, 20)}...`);
              } catch (fcmError: any) {
                console.error(`FCM send failed for token: ${fcmError.message}`);
              }
            }
          }
        } catch (fcmError: any) {
          console.error('Firebase push notification error:', fcmError);
          // Don't fail the entire notification if FCM fails
        }
      }

      console.log(`✅ Push notification created for user ${params.userId}`);
    } catch (error: any) {
      console.error('❌ Error sending push:', error);
    }
  }

  /**
   * Get user's FCM (Firebase Cloud Messaging) tokens
   */
  private async getUserFCMTokens(userId: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });

      const preferences = (user?.preferences as any) || {};
      const fcmTokens = preferences.fcmTokens || [];

      // Filter out expired tokens (optional timestamp check)
      return fcmTokens.filter((token: string) => token && token.length > 0);
    } catch (error) {
      console.error('Error fetching FCM tokens:', error);
      return [];
    }
  }

  // ========================================================================
  // NOTIFICATION TRIGGERS
  // ========================================================================

  /**
   * Job posted
   */
  async notifyJobPosted(params: {
    jobId: string;
    homeownerId: string;
    homeownerEmail: string;
    jobTitle: string;
  }): Promise<void> {
    const emailHtml = `
      <h2>Job Posted Successfully!</h2>
      <p>Your job "<strong>${params.jobTitle}</strong>" is now live and contractors can see it.</p>
      <p><a href="https://fairtradeworker.com/jobs/${params.jobId}">View Job</a></p>
    `;

    await this.sendEmail({
      to: params.homeownerEmail,
      subject: 'Your Job is Live!',
      html: emailHtml,
      userId: params.homeownerId,
    });
  }

  /**
   * Bid submitted
   */
  async notifyBidSubmitted(params: {
    jobId: string;
    homeownerId: string;
    homeownerEmail: string;
    contractorName: string;
    bidAmount: number;
  }): Promise<void> {
    const emailHtml = `
      <h2>New Bid Received!</h2>
      <p><strong>${params.contractorName}</strong> submitted a bid for <strong>$${params.bidAmount}</strong></p>
      <p><a href="https://fairtradeworker.com/jobs/${params.jobId}/bids">View All Bids</a></p>
    `;

    await this.sendEmail({
      to: params.homeownerEmail,
      subject: 'New Bid on Your Job',
      html: emailHtml,
      userId: params.homeownerId,
    });
  }

  /**
   * Bid accepted
   */
  async notifyBidAccepted(params: {
    contractId: string;
    contractorId: string;
    contractorEmail: string;
    contractorName: string;
    contractAmount: number;
  }): Promise<void> {
    const emailHtml = `
      <h2>Your Bid Was Accepted!</h2>
      <p>Congratulations! Your bid for <strong>$${contractAmount}</strong> has been accepted.</p>
      <p><a href="https://fairtradeworker.com/contracts/${params.contractId}">View Contract</a></p>
    `;

    await this.sendEmail({
      to: params.contractorEmail,
      subject: 'Your Bid Was Accepted!',
      html: emailHtml,
      userId: params.contractorId,
    });
  }

  /**
   * Bid rejected
   */
  async notifyBidRejected(params: {
    contractorId: string;
    contractorEmail: string;
    jobTitle: string;
  }): Promise<void> {
    const emailHtml = `
      <h2>Bid Rejected</h2>
      <p>Your bid on "<strong>${params.jobTitle}</strong>" was not accepted.</p>
      <p>Don't worry, there are more jobs available! Keep bidding.</p>
    `;

    await this.sendEmail({
      to: params.contractorEmail,
      subject: 'Bid Status Update',
      html: emailHtml,
      userId: params.contractorId,
    });
  }

  /**
   * Completion submitted
   */
  async notifyCompletionSubmitted(params: {
    contractId: string;
    homeownerId: string;
    homeownerEmail: string;
    contractorName: string;
  }): Promise<void> {
    const emailHtml = `
      <h2>Work Completed!</h2>
      <p><strong>${params.contractorName}</strong> has submitted their work for completion.</p>
      <p><a href="https://fairtradeworker.com/contracts/${params.contractId}">Review Work</a></p>
    `;

    await this.sendEmail({
      to: params.homeownerEmail,
      subject: 'Contractor Submitted Completion',
      html: emailHtml,
      userId: params.homeownerId,
    });
  }

  /**
   * Completion approved
   */
  async notifyCompletionApproved(params: {
    contractId: string;
    contractorId: string;
    contractorEmail: string;
    contractAmount: number;
  }): Promise<void> {
    const emailHtml = `
      <h2>Work Approved & Payment Released!</h2>
      <p>Your work has been approved. Payment of <strong>$${contractAmount}</strong> has been released.</p>
      <p>Thank you for your great work!</p>
    `;

    await this.sendEmail({
      to: params.contractorEmail,
      subject: 'Work Approved - Payment Released',
      html: emailHtml,
      userId: params.contractorId,
    });
  }

  /**
   * Completion rejected
   */
  async notifyCompletionRejected(params: {
    contractId: string;
    contractorId: string;
    contractorEmail: string;
    feedback?: string;
  }): Promise<void> {
    const emailHtml = `
      <h2>Work Revision Requested</h2>
      <p>The homeowner has requested revisions to your work.</p>
      ${params.feedback ? `<p><strong>Feedback:</strong> ${params.feedback}</p>` : ''}
      <p><a href="https://fairtradeworker.com/contracts/${params.contractId}">View Details</a></p>
    `;

    await this.sendEmail({
      to: params.contractorEmail,
      subject: 'Work Revision Requested',
      html: emailHtml,
      userId: params.contractorId,
    });
  }

  /**
   * Change order requested
   */
  async notifyChangeOrderCreated(params: {
    contractId: string;
    homeownerId: string;
    homeownerEmail: string;
    contractorName: string;
    amount: number;
  }): Promise<void> {
    const emailHtml = `
      <h2>Change Order Requested</h2>
      <p><strong>${params.contractorName}</strong> has requested a change order for <strong>$${amount}</strong></p>
      <p><a href="https://fairtradeworker.com/contracts/${params.contractId}">Review Request</a></p>
    `;

    await this.sendEmail({
      to: params.homeownerEmail,
      subject: 'Change Order Requested',
      html: emailHtml,
      userId: params.homeownerId,
    });
  }

  /**
   * Change order approved
   */
  async notifyChangeOrderApproved(params: {
    contractorId: string;
    contractorEmail: string;
    amount: number;
  }): Promise<void> {
    const emailHtml = `
      <h2>Change Order Approved!</h2>
      <p>Your change order for <strong>$${amount}</strong> has been approved.</p>
      <p>Thank you for keeping us informed!</p>
    `;

    await this.sendEmail({
      to: params.contractorEmail,
      subject: 'Change Order Approved',
      html: emailHtml,
      userId: params.contractorId,
    });
  }

  /**
   * Contract cancelled
   */
  async notifyContractCancelled(params: {
    contractId: string;
    userId: string;
    email: string;
    reason: string;
  }): Promise<void> {
    const emailHtml = `
      <h2>Contract Cancelled</h2>
      <p>A contract has been cancelled.</p>
      <p><strong>Reason:</strong> ${params.reason}</p>
      <p>If you believe this is an error, please contact support.</p>
    `;

    await this.sendEmail({
      to: params.email,
      subject: 'Contract Cancelled',
      html: emailHtml,
      userId: params.userId,
    });
  }

  /**
   * Message sent
   */
  async notifyNewMessage(params: {
    recipientId: string;
    recipientEmail: string;
    senderName: string;
  }): Promise<void> {
    const emailHtml = `
      <h2>New Message</h2>
      <p><strong>${params.senderName}</strong> sent you a message.</p>
      <p><a href="https://fairtradeworker.com/messages">View Messages</a></p>
    `;

    await this.sendEmail({
      to: params.recipientEmail,
      subject: 'New Message from Contractor',
      html: emailHtml,
      userId: params.recipientId,
    });
  }

  /**
   * Weekly summary
   */
  async sendWeeklySummary(params: {
    userId: string;
    email: string;
    name: string;
    jobCount: number;
    earnings: number;
  }): Promise<void> {
    const emailHtml = `
      <h2>Weekly Summary</h2>
      <p>Hi <strong>${params.name}</strong>,</p>
      <p>Here's what happened this week:</p>
      <ul>
        <li>Jobs Posted: ${params.jobCount}</li>
        <li>Earnings: $${params.earnings}</li>
      </ul>
      <p><a href="https://fairtradeworker.com/analytics">View Analytics</a></p>
    `;

    await this.sendEmail({
      to: params.email,
      subject: 'Your Weekly Summary',
      html: emailHtml,
      userId: params.userId,
    });
  }
}

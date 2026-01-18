/**
 * Email Service
 * Handles all email communications via SendGrid
 */

import sgMail from '@sendgrid/mail';
import { prisma } from '../prisma';

interface EmailTemplate {
  templateId: string;
  subject: string;
  variables: Record<string, string>;
}

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

class EmailService {
  private from: string;
  private replyTo: string;
  private enabled: boolean;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.from = process.env.EMAIL_FROM || 'noreply@fairtradeworker.com';
    this.replyTo = process.env.EMAIL_REPLY_TO || 'support@fairtradeworker.com';
    this.enabled = !!apiKey;

    if (this.enabled) {
      sgMail.setApiKey(apiKey!);
      console.log('SendGrid email service initialized');
    } else {
      console.warn('SendGrid not configured - emails will not be sent');
    }
  }

  /**
   * Send a transactional email
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.enabled) {
        console.log('[EMAIL MOCK]', { to: options.to, subject: options.subject });
        return { success: true, messageId: 'mock-' + Math.random().toString(36).substring(7) };
      }

      const msg: any = {
        to: options.to,
        from: options.from || this.from,
        replyTo: options.replyTo || this.replyTo,
        subject: options.subject,
      };

      if (options.templateId) {
        msg.templateId = options.templateId;
        msg.dynamicTemplateData = options.templateData || {};
      } else {
        msg.html = options.html || '';
        msg.text = options.text || '';
      }

      if (options.cc) msg.cc = options.cc;
      if (options.bcc) msg.bcc = options.bcc;

      const response = await sgMail.send(msg);

      // Log email send
      await this.logEmailSend({
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        status: 'SENT',
        messageId: response[0].headers['x-message-id'],
      });

      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
      };
    } catch (error: any) {
      console.error('Email send failed:', error);

      // Log email failure
      await this.logEmailSend({
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        status: 'FAILED',
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<{ success: boolean; error?: string }> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
      <h1>Welcome to FairTradeWorker, ${firstName}!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>Or paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your FairTradeWorker Account',
      html,
      templateId: process.env.SENDGRID_VERIFICATION_TEMPLATE_ID,
      templateData: {
        firstName,
        verificationUrl,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<{ success: boolean; error?: string }> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <h1>Reset Your FairTradeWorker Password</h1>
      <p>Hi ${firstName},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>Or paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this email, you can ignore it.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your FairTradeWorker Password',
      html,
      templateId: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID,
      templateData: {
        firstName,
        resetUrl,
      },
    });
  }

  /**
   * Send bid confirmation email
   */
  async sendBidConfirmationEmail(
    contractorEmail: string,
    contractorName: string,
    jobTitle: string,
    bidAmount: number
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <h1>Bid Submitted Successfully</h1>
      <p>Hi ${contractorName},</p>
      <p>Your bid has been submitted for the job: <strong>${jobTitle}</strong></p>
      <p><strong>Bid Amount:</strong> $${(bidAmount / 100).toFixed(2)}</p>
      <p>You'll receive an email notification when the homeowner responds to your bid.</p>
      <p>Good luck!</p>
    `;

    return this.sendEmail({
      to: contractorEmail,
      subject: `Bid Confirmation: ${jobTitle}`,
      html,
      templateId: process.env.SENDGRID_BID_CONFIRMATION_TEMPLATE_ID,
      templateData: {
        contractorName,
        jobTitle,
        bidAmount: (bidAmount / 100).toFixed(2),
      },
    });
  }

  /**
   * Send bid acceptance email to contractor
   */
  async sendBidAcceptanceEmail(
    contractorEmail: string,
    contractorName: string,
    jobTitle: string,
    contractAmount: number,
    depositAmount: number
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <h1>Your Bid Has Been Accepted!</h1>
      <p>Congratulations ${contractorName}!</p>
      <p>Your bid for <strong>${jobTitle}</strong> has been accepted.</p>
      <p><strong>Contract Amount:</strong> $${(contractAmount / 100).toFixed(2)}</p>
      <p><strong>Required Deposit:</strong> $${(depositAmount / 100).toFixed(2)}</p>
      <p>The homeowner will now send the initial deposit. Once received, you can begin the work.</p>
      <p>Check your dashboard for more details.</p>
    `;

    return this.sendEmail({
      to: contractorEmail,
      subject: `Congratulations! Your Bid Accepted: ${jobTitle}`,
      html,
      templateId: process.env.SENDGRID_BID_ACCEPTED_TEMPLATE_ID,
      templateData: {
        contractorName,
        jobTitle,
        contractAmount: (contractAmount / 100).toFixed(2),
        depositAmount: (depositAmount / 100).toFixed(2),
      },
    });
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceiptEmail(
    email: string,
    name: string,
    amount: number,
    type: string,
    transactionId: string,
    jobTitle: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <h1>Payment Receipt</h1>
      <p>Hi ${name},</p>
      <p><strong>Payment Type:</strong> ${type}</p>
      <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
      <p><strong>Job:</strong> ${jobTitle}</p>
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      <p>Your payment has been processed successfully.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: `Payment Receipt: ${jobTitle}`,
      html,
      templateId: process.env.SENDGRID_PAYMENT_RECEIPT_TEMPLATE_ID,
      templateData: {
        name,
        amount: (amount / 100).toFixed(2),
        type,
        transactionId,
        jobTitle,
      },
    });
  }

  /**
   * Send completion notification email
   */
  async sendCompletionNotificationEmail(
    homeownerEmail: string,
    homeownerName: string,
    contractorName: string,
    jobTitle: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <h1>Work Completed</h1>
      <p>Hi ${homeownerName},</p>
      <p>${contractorName} has submitted the completion of <strong>${jobTitle}</strong>.</p>
      <p>Please log in to FairTradeWorker to review the work and approve or dispute the completion.</p>
      <p>You have 7 days to dispute the work if needed.</p>
    `;

    return this.sendEmail({
      to: homeownerEmail,
      subject: `Work Completed: ${jobTitle}`,
      html,
      templateId: process.env.SENDGRID_COMPLETION_TEMPLATE_ID,
      templateData: {
        homeownerName,
        contractorName,
        jobTitle,
      },
    });
  }

  /**
   * Send dispute notification email
   */
  async sendDisputeNotificationEmail(
    recipientEmail: string,
    recipientName: string,
    jobTitle: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <h1>Dispute Initiated</h1>
      <p>Hi ${recipientName},</p>
      <p>A dispute has been initiated for the job: <strong>${jobTitle}</strong></p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>You can respond to this dispute in your FairTradeWorker dashboard.</p>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Dispute Initiated: ${jobTitle}`,
      html,
      templateId: process.env.SENDGRID_DISPUTE_TEMPLATE_ID,
      templateData: {
        recipientName,
        jobTitle,
        reason,
      },
    });
  }

  /**
   * Send payout notification email
   */
  async sendPayoutNotificationEmail(
    contractorEmail: string,
    contractorName: string,
    amount: number,
    jobTitle: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <h1>Payment Received</h1>
      <p>Hi ${contractorName},</p>
      <p>Your payment for <strong>${jobTitle}</strong> has been processed.</p>
      <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
      <p>The funds will be transferred to your connected bank account within 1-2 business days.</p>
    `;

    return this.sendEmail({
      to: contractorEmail,
      subject: `Payment Received: ${jobTitle}`,
      html,
      templateId: process.env.SENDGRID_PAYOUT_TEMPLATE_ID,
      templateData: {
        contractorName,
        amount: (amount / 100).toFixed(2),
        jobTitle,
      },
    });
  }

  /**
   * Log email send for audit trail
   */
  private async logEmailSend(data: {
    to: string;
    subject: string;
    status: 'SENT' | 'FAILED' | 'BOUNCED';
    messageId?: string;
    error?: string;
  }): Promise<void> {
    try {
      // await prisma.emailLog.create({
      //   data: {
      //     to: data.to,
      //     subject: data.subject,
      //     status: data.status,
      //     messageId: data.messageId,
      //     error: data.error,
      //     sentAt: new Date(),
      //   },
      // });
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

export default emailService;

/**
 * SendGrid Email Service
 *
 * Handles all email notifications through SendGrid
 * - Transactional emails
 * - Templated emails
 * - Batch sending
 * - Error tracking
 *
 * Configuration required in .env:
 * REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key (store securely in backend)
 * REACT_APP_SENDGRID_FROM_EMAIL=noreply@fairtradeworker.com
 *
 * Note: API key should be handled server-side only. This service is for frontend
 * to trigger email sends via backend endpoints.
 *
 * Usage:
 * await sendgridService.sendWelcomeEmail(user)
 * await sendgridService.sendPasswordReset(email, resetToken)
 */

import { apiClient } from './apiClient'

export interface SendGridEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  templateId?: string
  templateData?: Record<string, unknown>
  replyTo?: string
  cc?: string[]
  bcc?: string[]
}

export interface EmailLog {
  id: string
  to: string
  subject: string
  template: string
  status: 'sent' | 'failed' | 'bounced'
  sentAt: Date
  error?: string
}

class SendGridService {
  private fromEmail = process.env.REACT_APP_SENDGRID_FROM_EMAIL || 'noreply@fairtradeworker.com'
  private apiKey = process.env.REACT_APP_SENDGRID_API_KEY

  constructor() {
    if (!this.apiKey) {
      console.warn(
        'SendGrid API key not configured. Email functionality will be limited. Set REACT_APP_SENDGRID_API_KEY in environment.'
      )
    }
  }

  /**
   * Send raw email
   */
  async sendEmail(options: SendGridEmailOptions): Promise<{ messageId: string }> {
    // Call backend endpoint to send email (backend has API key)
    const response = await apiClient.client.post('/api/email/send', {
      to: options.to,
      from: this.fromEmail,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    })
    return response.data.data
  }

  /**
   * Send templated email via SendGrid
   */
  async sendTemplatedEmail(
    to: string,
    templateId: string,
    templateData: Record<string, unknown>
  ): Promise<{ messageId: string }> {
    const response = await apiClient.client.post('/api/email/send-template', {
      to,
      templateId,
      templateData,
    })
    return response.data.data
  }

  /**
   * Welcome email for new users
   */
  async sendWelcomeEmail(user: {
    firstName: string
    lastName: string
    email: string
  }): Promise<{ messageId: string }> {
    const html = `
      <h2>Welcome to FairTradeWorker, ${user.firstName}!</h2>
      <p>We're excited to have you join our marketplace.</p>
      <p>Complete your profile and start earning as a contractor or post jobs and find qualified professionals.</p>
      <p>
        <a href="${process.env.REACT_APP_FRONTEND_URL}/dashboard" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Go to Dashboard
        </a>
      </p>
      <p>Questions? Visit our help center or reply to this email.</p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: user.email,
      subject: `Welcome to FairTradeWorker, ${user.firstName}!`,
      html,
    })
  }

  /**
   * Email verification link
   */
  async sendEmailVerification(
    user: { firstName: string; email: string },
    verificationToken: string
  ): Promise<{ messageId: string }> {
    const verificationUrl = `${process.env.REACT_APP_FRONTEND_URL}/verify-email?token=${verificationToken}`

    const html = `
      <h2>Verify Your Email Address</h2>
      <p>Hi ${user.firstName},</p>
      <p>Click the link below to verify your email address:</p>
      <p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </p>
      <p>Link expires in 24 hours.</p>
      <p>If you didn't sign up for FairTradeWorker, you can ignore this email.</p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html,
    })
  }

  /**
   * Password reset email
   */
  async sendPasswordResetEmail(
    user: { firstName: string; email: string },
    resetToken: string
  ): Promise<{ messageId: string }> {
    const resetUrl = `${process.env.REACT_APP_FRONTEND_URL}/reset-password?token=${resetToken}`

    const html = `
      <h2>Reset Your Password</h2>
      <p>Hi ${user.firstName},</p>
      <p>We received a request to reset your password. Click the link below:</p>
      <p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px;">
          Reset Password
        </a>
      </p>
      <p>Link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html,
    })
  }

  /**
   * Job posted notification for contractors
   */
  async sendNewJobNotification(
    contractor: { firstName: string; email: string },
    job: { title: string; budget: number; category: string }
  ): Promise<{ messageId: string }> {
    const html = `
      <h3>New Job Opportunity: ${job.title}</h3>
      <p>Hi ${contractor.firstName},</p>
      <p>A new ${job.category} job matching your skills has been posted!</p>
      <p><strong>Budget:</strong> $${job.budget}</p>
      <p>
        <a href="${process.env.REACT_APP_FRONTEND_URL}/jobs/${job.title.toLowerCase().replace(/ /g, '-')}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          View Job Details
        </a>
      </p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: contractor.email,
      subject: `New Opportunity: ${job.title}`,
      html,
    })
  }

  /**
   * Bid received notification
   */
  async sendBidReceivedNotification(
    homeowner: { firstName: string; email: string },
    contractor: { firstName: string },
    job: { title: string }
  ): Promise<{ messageId: string }> {
    const html = `
      <h3>New Bid Received</h3>
      <p>Hi ${homeowner.firstName},</p>
      <p>${contractor.firstName} has submitted a bid for your job: <strong>${job.title}</strong></p>
      <p>
        <a href="${process.env.REACT_APP_FRONTEND_URL}/dashboard/jobs" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Review Bid
        </a>
      </p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: homeowner.email,
      subject: `New Bid: ${job.title}`,
      html,
    })
  }

  /**
   * Contract awarded notification
   */
  async sendContractAwardedNotification(
    contractor: { firstName: string; email: string },
    job: { title: string }
  ): Promise<{ messageId: string }> {
    const html = `
      <h3>Contract Awarded!</h3>
      <p>Congratulations, ${contractor.firstName}!</p>
      <p>Your bid for <strong>${job.title}</strong> has been accepted!</p>
      <p>The homeowner has placed a 25% deposit in escrow. You can begin work immediately.</p>
      <p>
        <a href="${process.env.REACT_APP_FRONTEND_URL}/dashboard/contracts" style="padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
          View Contract Details
        </a>
      </p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: contractor.email,
      subject: `Contract Awarded: ${job.title}`,
      html,
    })
  }

  /**
   * Completion submitted notification
   */
  async sendCompletionSubmittedNotification(
    homeowner: { firstName: string; email: string },
    contractor: { firstName: string },
    job: { title: string }
  ): Promise<{ messageId: string }> {
    const html = `
      <h3>Work Completed</h3>
      <p>Hi ${homeowner.firstName},</p>
      <p>${contractor.firstName} has submitted the completed work for <strong>${job.title}</strong></p>
      <p>Please review and approve if satisfied with the work.</p>
      <p>
        <a href="${process.env.REACT_APP_FRONTEND_URL}/dashboard/completions" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Review Work
        </a>
      </p>
      <p>You have 5 days to approve or dispute the work.</p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: homeowner.email,
      subject: `Work Completed: ${job.title}`,
      html,
    })
  }

  /**
   * Completion approved notification
   */
  async sendCompletionApprovedNotification(
    contractor: { firstName: string; email: string },
    homeowner: { firstName: string },
    job: { title: string; budget: number }
  ): Promise<{ messageId: string }> {
    const netAmount = Math.round(job.budget * 0.82 * 100) / 100

    const html = `
      <h3>Payment Released!</h3>
      <p>Congratulations, ${contractor.firstName}!</p>
      <p>${homeowner.firstName} has approved your work for <strong>${job.title}</strong></p>
      <p><strong>Payment Received:</strong> $${netAmount} (after 18% platform fee)</p>
      <p>Funds have been transferred to your account within 24 hours.</p>
      <p>
        <a href="${process.env.REACT_APP_FRONTEND_URL}/dashboard/earnings" style="padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
          View Earnings
        </a>
      </p>
      <p>Thank you for working with FairTradeWorker!</p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: contractor.email,
      subject: `Payment Received: $${netAmount}`,
      html,
    })
  }

  /**
   * Dispute notification
   */
  async sendDisputeNotification(
    user: { firstName: string; email: string },
    job: { title: string },
    reason: string
  ): Promise<{ messageId: string }> {
    const html = `
      <h3>Dispute Initiated</h3>
      <p>Hi ${user.firstName},</p>
      <p>A dispute has been initiated for <strong>${job.title}</strong></p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Our team will review both parties' evidence and make a determination within 48 hours.</p>
      <p>
        <a href="${process.env.REACT_APP_FRONTEND_URL}/dashboard/disputes" style="padding: 10px 20px; background-color: #ffc107; color: black; text-decoration: none; border-radius: 4px;">
          View Dispute
        </a>
      </p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: user.email,
      subject: `Dispute: ${job.title}`,
      html,
    })
  }

  /**
   * Weekly summary email
   */
  async sendWeeklySummary(
    contractor: { firstName: string; email: string },
    stats: {
      completedJobs: number
      earnedAmount: number
      averageRating: number
      activeContracts: number
    }
  ): Promise<{ messageId: string }> {
    const html = `
      <h2>Your Weekly Summary</h2>
      <p>Hi ${contractor.firstName},</p>
      <p>Here's how you performed this week:</p>
      <ul>
        <li><strong>Completed Jobs:</strong> ${stats.completedJobs}</li>
        <li><strong>Amount Earned:</strong> $${stats.earnedAmount}</li>
        <li><strong>Average Rating:</strong> ${stats.averageRating}/5</li>
        <li><strong>Active Contracts:</strong> ${stats.activeContracts}</li>
      </ul>
      <p>Keep up the great work!</p>
      <p>
        <a href="${process.env.REACT_APP_FRONTEND_URL}/dashboard" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          View Dashboard
        </a>
      </p>
      <p>Best regards,<br/>FairTradeWorker Team</p>
    `

    return this.sendEmail({
      to: contractor.email,
      subject: 'Your Weekly Summary',
      html,
    })
  }

  /**
   * Batch send emails
   */
  async sendBatch(emails: SendGridEmailOptions[]): Promise<{ messageIds: string[] }> {
    const results = await Promise.all(emails.map((email) => this.sendEmail(email)))
    return {
      messageIds: results.map((r) => r.messageId),
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const sendgridService = new SendGridService()

export { SendGridService }

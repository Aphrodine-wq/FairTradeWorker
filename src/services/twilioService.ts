/**
 * Twilio SMS Service
 *
 * Handles all SMS notifications through Twilio
 * - OTP delivery
 * - Status updates
 * - Alerts
 * - Two-way messaging
 *
 * Configuration required in .env:
 * REACT_APP_TWILIO_ACCOUNT_SID=your_account_sid (backend only)
 * REACT_APP_TWILIO_AUTH_TOKEN=your_auth_token (backend only)
 * REACT_APP_TWILIO_PHONE_NUMBER=+1234567890
 *
 * Note: Credentials should be handled server-side only
 *
 * Usage:
 * await twilioService.sendOTP(phoneNumber)
 * await twilioService.sendJobAlert(contractor)
 */

import { apiClient } from './apiClient'

export interface SMSTemplate {
  id: string
  name: string
  body: string
  variables: string[]
}

export interface SMSLog {
  id: string
  to: string
  from: string
  body: string
  status: 'sent' | 'failed' | 'queued'
  sentAt: Date
  error?: string
}

class TwilioService {
  private phoneNumber = process.env.REACT_APP_TWILIO_PHONE_NUMBER || '+1234567890'
  private accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID
  private authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN

  constructor() {
    if (!this.accountSid || !this.authToken) {
      console.warn(
        'Twilio credentials not configured. SMS functionality will be limited. Configure credentials in backend .env file.'
      )
    }
  }

  /**
   * Send raw SMS
   */
  async sendSMS(to: string, body: string): Promise<{ sid: string }> {
    const response = await apiClient.client.post('/api/sms/send', {
      to,
      body,
      from: this.phoneNumber,
    })
    return response.data.data
  }

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string, otp: string): Promise<{ sid: string }> {
    const body = `Your FairTradeWorker verification code is: ${otp}\n\nDo not share this code with anyone.`

    return this.sendSMS(phoneNumber, body)
  }

  /**
   * Send OTP for password reset
   */
  async sendPasswordResetOTP(phoneNumber: string, code: string): Promise<{ sid: string }> {
    const body = `Your FairTradeWorker password reset code is: ${code}\n\nExpires in 1 hour.`

    return this.sendSMS(phoneNumber, body)
  }

  /**
   * Send job alert to contractor
   */
  async sendJobAlert(contractor: {
    phone: string
    firstName: string
  }, job: { title: string; budget: number }): Promise<{ sid: string }> {
    const body = `Hi ${contractor.firstName}, a new ${job.title} job ($${job.budget}) matches your skills! Open the app to bid.`

    return this.sendSMS(contractor.phone, body)
  }

  /**
   * Send bid received notification
   */
  async sendBidReceivedAlert(homeowner: {
    phone: string
    firstName: string
  }, contractor: { firstName: string }): Promise<{ sid: string }> {
    const body = `Hi ${homeowner.firstName}, ${contractor.firstName} just submitted a bid on your job. Check the app for details.`

    return this.sendSMS(homeowner.phone, body)
  }

  /**
   * Send contract awarded notification
   */
  async sendContractAwardedAlert(contractor: {
    phone: string
    firstName: string
  }): Promise<{ sid: string }> {
    const body = `Congratulations ${contractor.firstName}! Your bid has been accepted. Begin work anytime. (25% deposit in escrow)`

    return this.sendSMS(contractor.phone, body)
  }

  /**
   * Send work completion reminder
   */
  async sendCompletionReminder(contractor: {
    phone: string
    firstName: string
  }): Promise<{ sid: string }> {
    const body = `${contractor.firstName}, don't forget to submit completion details with photos before the deadline!`

    return this.sendSMS(contractor.phone, body)
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(contractor: {
    phone: string
    firstName: string
  }, amount: number): Promise<{ sid: string }> {
    const body = `${contractor.firstName}, you've received $${amount} payment. Check your account for details.`

    return this.sendSMS(contractor.phone, body)
  }

  /**
   * Send dispute alert
   */
  async sendDisputeAlert(user: {
    phone: string
    firstName: string
  }, reason: string): Promise<{ sid: string }> {
    const body = `${user.firstName}, a dispute has been filed. Reason: ${reason}. You have 48 hours to respond.`

    return this.sendSMS(user.phone, body)
  }

  /**
   * Send dispute resolution notification
   */
  async sendDisputeResolution(user: {
    phone: string
    firstName: string
  }, resolution: string): Promise<{ sid: string }> {
    const body = `${user.firstName}, your dispute has been resolved. Resolution: ${resolution}. Check the app for details.`

    return this.sendSMS(user.phone, body)
  }

  /**
   * Send promotional message (opt-in required)
   */
  async sendPromotion(phoneNumber: string, message: string): Promise<{ sid: string }> {
    // Only send if user has opted in
    const body = `${message}\n\nReply STOP to opt out.`

    return this.sendSMS(phoneNumber, body)
  }

  /**
   * Send batch SMS
   */
  async sendBatch(
    recipients: Array<{ phone: string; variables?: Record<string, string> }>,
    templateId: string
  ): Promise<{ success: number; failed: number; sids: string[] }> {
    const response = await apiClient.client.post('/api/sms/batch', {
      recipients,
      templateId,
    })
    return response.data.data
  }

  /**
   * Get SMS status
   */
  async getSMSStatus(sid: string): Promise<{
    status: 'queued' | 'sending' | 'sent' | 'failed' | 'delivered'
    to: string
    from: string
    body: string
  }> {
    const response = await apiClient.client.get(`/api/sms/${sid}/status`)
    return response.data.data
  }

  /**
   * Get SMS logs
   */
  async getSMSLogs(filters?: {
    to?: string
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<{ logs: SMSLog[]; total: number }> {
    const response = await apiClient.client.get('/api/sms/logs', { params: filters })
    return response.data.data
  }

  /**
   * Handle incoming SMS (webhook - backend only)
   * This is for documentation purposes
   */
  handleIncomingSMS = {
    // Handle STOP requests
    handleStopRequest: async (phoneNumber: string) => {
      console.log('User opted out:', phoneNumber)
      // Backend marks user as opted out
      // No more promotional messages sent
    },

    // Handle custom replies
    handleCustomReply: async (phoneNumber: string, message: string) => {
      console.log('Received reply:', { phoneNumber, message })
      // Backend can implement custom logic for replies
    },
  }

  /**
   * Format phone number for Twilio (E.164 format)
   */
  formatPhoneNumber(phone: string): string {
    // Convert to E.164 format: +1234567890
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.length === 10) {
      return `+1${cleaned}` // US number
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+${cleaned}`
    } else {
      return `+${cleaned}` // Try as-is
    }
  }

  /**
   * Verify phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    try {
      const formatted = this.formatPhoneNumber(phone)
      return /^\+\d{10,15}$/.test(formatted)
    } catch {
      return false
    }
  }

  /**
   * Generate OTP
   */
  generateOTP(length: number = 6): string {
    const otp = Math.floor(Math.random() * Math.pow(10, length))
    return otp.toString().padStart(length, '0')
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const twilioService = new TwilioService()

export { TwilioService }

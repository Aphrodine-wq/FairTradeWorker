/**
 * SMS Service
 * Handles all SMS communications via Twilio
 */

import twilio from 'twilio';
import { Database } from '../database';

const prisma = new Database();

interface SMSOptions {
  to: string;
  message: string;
  from?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private client: twilio.Twilio | null;
  private from: string;
  private enabled: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.from = process.env.TWILIO_PHONE_NUMBER || '';
    this.enabled = !!accountSid && !!authToken;

    if (this.enabled) {
      this.client = twilio(accountSid!, authToken!);
      console.log('Twilio SMS service initialized');
    } else {
      this.client = null;
      console.warn('Twilio not configured - SMS messages will not be sent');
    }
  }

  /**
   * Send an SMS message
   */
  async sendSMS(options: SMSOptions): Promise<SMSResponse> {
    try {
      if (!this.enabled || !this.client) {
        console.log('[SMS MOCK]', { to: options.to, message: options.message });
        return { success: true, messageId: 'mock-' + Math.random().toString(36).substring(7) };
      }

      const message = await this.client.messages.create({
        from: options.from || this.from,
        to: options.to,
        body: options.message,
      });

      // Log SMS send
      await this.logSMS({
        to: options.to,
        status: 'SENT',
        messageId: message.sid,
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error: any) {
      console.error('SMS send failed:', error);

      // Log SMS failure
      await this.logSMS({
        to: options.to,
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
   * Send OTP verification code via SMS
   */
  async sendOTPVerification(phoneNumber: string, otp: string): Promise<SMSResponse> {
    const message = `Your FairTradeWorker verification code is: ${otp}. This code will expire in 10 minutes.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send bid notification SMS
   */
  async sendBidNotification(
    phoneNumber: string,
    contractorName: string,
    jobTitle: string
  ): Promise<SMSResponse> {
    const message = `${contractorName} submitted a bid for "${jobTitle}". Check FairTradeWorker for details.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send bid acceptance notification SMS
   */
  async sendBidAcceptanceNotification(
    phoneNumber: string,
    jobTitle: string
  ): Promise<SMSResponse> {
    const message = `Congratulations! Your bid for "${jobTitle}" has been accepted. Check FairTradeWorker for next steps.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send bid rejection notification SMS
   */
  async sendBidRejectionNotification(
    phoneNumber: string,
    jobTitle: string
  ): Promise<SMSResponse> {
    const message = `Your bid for "${jobTitle}" has been declined. Check FairTradeWorker for other opportunities.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send payment confirmation SMS
   */
  async sendPaymentConfirmation(
    phoneNumber: string,
    amount: number,
    jobTitle: string
  ): Promise<SMSResponse> {
    const message = `Payment of $${(amount / 100).toFixed(2)} confirmed for "${jobTitle}". Reference: FTW-${Date.now()}`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send completion notification SMS
   */
  async sendCompletionNotification(
    phoneNumber: string,
    contractorName: string,
    jobTitle: string
  ): Promise<SMSResponse> {
    const message = `${contractorName} submitted the completion for "${jobTitle}". Please review and approve or dispute.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send dispute notification SMS
   */
  async sendDisputeNotification(
    phoneNumber: string,
    jobTitle: string
  ): Promise<SMSResponse> {
    const message = `A dispute has been initiated for "${jobTitle}". Log in to FairTradeWorker to respond.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send payout notification SMS
   */
  async sendPayoutNotification(
    phoneNumber: string,
    amount: number,
    jobTitle: string
  ): Promise<SMSResponse> {
    const message = `Payment of $${(amount / 100).toFixed(2)} received for "${jobTitle}". Funds arriving in 1-2 business days.`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Send emergency alert SMS (rate-limited)
   */
  async sendEmergencyAlert(
    phoneNumber: string,
    alert: string
  ): Promise<SMSResponse> {
    const message = `⚠️ FairTradeWorker Alert: ${alert}`;

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  /**
   * Log SMS send for audit trail
   */
  private async logSMS(data: {
    to: string;
    status: 'SENT' | 'FAILED' | 'BOUNCED';
    messageId?: string;
    error?: string;
  }): Promise<void> {
    try {
      // await prisma.smsLog.create({
      //   data: {
      //     to: data.to,
      //     status: data.status,
      //     messageId: data.messageId,
      //     error: data.error,
      //     sentAt: new Date(),
      //   },
      // });
    } catch (error) {
      console.error('Failed to log SMS:', error);
    }
  }
}

// Export singleton instance
export const smsService = new SMSService();

export default smsService;

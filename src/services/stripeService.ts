/**
 * Stripe Payment Service
 *
 * Handles all payment processing through Stripe
 * - Payment intents
 * - Token management
 * - Webhook handling (via backend)
 * - Escrow account management
 * - Refund processing
 *
 * Configuration required in .env:
 * REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
 *
 * Note: Secret key and webhook handling must be in backend
 *
 * Usage:
 * await stripeService.createPaymentIntent(amount, jobId)
 * const { token } = await stripeService.createToken(cardElement)
 */

import { apiClient } from './apiClient'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'succeeded'
  clientSecret: string
}

export interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

export interface Transaction {
  id: string
  contractId: string
  amount: number
  type: 'DEPOSIT' | 'FINAL_PAYMENT' | 'REFUND'
  status: 'pending' | 'succeeded' | 'failed'
  createdAt: Date
}

export interface EscrowAccount {
  id: string
  contractId: string
  depositAmount: number
  finalPaymentAmount: number
  totalFees: number
  status: 'active' | 'released' | 'refunded'
  createdAt: Date
  depositReleasedAt?: Date
  finalReleasedAt?: Date
}

class StripeService {
  private publishableKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY
  private stripe: any = null

  constructor() {
    if (!this.publishableKey) {
      console.warn(
        'Stripe publishable key not configured. Payment functionality will be limited. Set REACT_APP_STRIPE_PUBLIC_KEY in environment.'
      )
    } else {
      this.initializeStripe()
    }
  }

  /**
   * Initialize Stripe instance
   */
  private initializeStripe() {
    if (typeof window !== 'undefined' && !this.stripe) {
      // Load Stripe.js
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.async = true
      script.onload = () => {
        this.stripe = (window as any).Stripe(this.publishableKey)
      }
      document.head.appendChild(script)
    }
  }

  /**
   * Get Stripe instance
   */
  getStripe() {
    if (!this.stripe) {
      this.initializeStripe()
    }
    return this.stripe
  }

  /**
   * Create a payment intent for a contract
   */
  async createPaymentIntent(
    amount: number,
    contractId: string,
    type: 'DEPOSIT' | 'FINAL_PAYMENT'
  ): Promise<PaymentIntent> {
    const response = await apiClient.client.post('/api/payments/create-intent', {
      amount,
      contractId,
      type,
    })
    return response.data.data
  }

  /**
   * Confirm payment with card details
   */
  async confirmPayment(
    clientSecret: string,
    cardElement: any
  ): Promise<{ success: boolean; error?: string }> {
    const stripe = this.getStripe()
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {},
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: paymentIntent.status === 'succeeded',
    }
  }

  /**
   * Create a payment method from card element
   */
  async createPaymentMethod(cardElement: any): Promise<PaymentMethod> {
    const stripe = this.getStripe()
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    })

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: paymentMethod.id,
      brand: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
    }
  }

  /**
   * Process a deposit payment (25% of contract value)
   */
  async processDeposit(
    contractId: string,
    contractAmount: number,
    cardElement: any
  ): Promise<{ success: boolean; transactionId: string; error?: string }> {
    const depositAmount = Math.round(contractAmount * 0.25)

    try {
      // Create payment intent
      const intent = await this.createPaymentIntent(depositAmount, contractId, 'DEPOSIT')

      // Confirm payment
      const result = await this.confirmPayment(intent.clientSecret, cardElement)

      if (!result.success) {
        return { success: false, transactionId: '', error: result.error }
      }

      return { success: true, transactionId: intent.id }
    } catch (err: any) {
      return { success: false, transactionId: '', error: err.message }
    }
  }

  /**
   * Process final payment (75% of contract value)
   */
  async processFinalPayment(
    contractId: string,
    contractAmount: number,
    cardElement: any
  ): Promise<{ success: boolean; transactionId: string; error?: string }> {
    const finalAmount = Math.round(contractAmount * 0.75)

    try {
      // Create payment intent
      const intent = await this.createPaymentIntent(finalAmount, contractId, 'FINAL_PAYMENT')

      // Confirm payment
      const result = await this.confirmPayment(intent.clientSecret, cardElement)

      if (!result.success) {
        return { success: false, transactionId: '', error: result.error }
      }

      return { success: true, transactionId: intent.id }
    } catch (err: any) {
      return { success: false, transactionId: '', error: err.message }
    }
  }

  /**
   * Get escrow account details
   */
  async getEscrowAccount(contractId: string): Promise<EscrowAccount> {
    const response = await apiClient.client.get(`/api/payments/escrow/${contractId}`)
    return response.data.data
  }

  /**
   * Request refund for a transaction
   */
  async requestRefund(
    transactionId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; refundId: string }> {
    const response = await apiClient.client.post('/api/payments/refund', {
      transactionId,
      amount,
      reason,
    })
    return response.data.data
  }

  /**
   * Get payment method for homeowner
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.client.get('/api/payments/methods')
    return response.data.data
  }

  /**
   * Save payment method
   */
  async savePaymentMethod(cardElement: any): Promise<PaymentMethod> {
    const paymentMethod = await this.createPaymentMethod(cardElement)

    // Save to backend
    const response = await apiClient.client.post('/api/payments/methods', {
      paymentMethodId: paymentMethod.id,
      brand: paymentMethod.brand,
      last4: paymentMethod.last4,
      expMonth: paymentMethod.expMonth,
      expYear: paymentMethod.expYear,
    })

    return response.data.data
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(filters?: {
    startDate?: string
    endDate?: string
    status?: string
    limit?: number
  }): Promise<{ transactions: Transaction[]; total: number }> {
    const response = await apiClient.client.get('/api/payments/history', { params: filters })
    return response.data.data
  }

  /**
   * Handle Stripe webhook (called from backend only)
   * This is documented for backend integration reference
   */
  handleWebhook = {
    // payment_intent.succeeded - Payment succeeded
    handlePaymentIntentSucceeded: async (paymentIntent: any) => {
      console.log('Payment succeeded:', paymentIntent.id)
      // Backend updates transaction status to 'succeeded'
      // Updates escrow account if applicable
    },

    // payment_intent.payment_failed - Payment failed
    handlePaymentIntentFailed: async (paymentIntent: any) => {
      console.log('Payment failed:', paymentIntent.id)
      // Backend updates transaction status to 'failed'
      // Notifies user of failure
    },

    // charge.refunded - Refund processed
    handleChargeRefunded: async (charge: any) => {
      console.log('Charge refunded:', charge.id)
      // Backend creates refund transaction
      // Updates escrow if applicable
    },
  }

  /**
   * Format amount for Stripe (cents)
   */
  formatAmountForStripe(amount: number, currency: string = 'usd'): number {
    // Most currencies use 2 decimal places
    return Math.round(amount * 100)
  }

  /**
   * Calculate payment breakdown
   */
  calculatePaymentBreakdown(contractAmount: number): {
    deposit: number
    depositFee: number
    finalPayment: number
    finalPaymentFee: number
    totalFees: number
    totalToHomeowner: number
  } {
    const deposit = Math.round(contractAmount * 0.25 * 100) / 100
    const depositFee = Math.round(deposit * 0.029 * 100) / 100 // 2.9% + $0.30
    const finalPayment = Math.round(contractAmount * 0.75 * 100) / 100
    const finalPaymentFee = Math.round(finalPayment * 0.029 * 100) / 100
    const totalFees = Math.round((depositFee + finalPaymentFee) * 100) / 100

    return {
      deposit,
      depositFee,
      finalPayment,
      finalPaymentFee,
      totalFees,
      totalToHomeowner: Math.round((contractAmount + totalFees) * 100) / 100,
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<{
    status: 'pending' | 'succeeded' | 'failed'
    amount: number
  }> {
    const response = await apiClient.client.get(`/api/payments/${transactionId}/status`)
    return response.data.data
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const stripeService = new StripeService()

export { StripeService }

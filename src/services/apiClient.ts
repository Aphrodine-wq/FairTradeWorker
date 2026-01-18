/**
 * FairTradeWorker API Client
 *
 * Complete HTTP client for communicating with the backend API
 * - JWT token management (access + refresh)
 * - Automatic token refresh on 401
 * - Error handling with retry logic
 * - Request/response interceptors
 * - Full TypeScript type safety
 *
 * Usage:
 * import { apiClient } from '@/services/apiClient'
 * const response = await apiClient.auth.login({ email, password })
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class APIError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(code)
    this.name = 'APIError'
  }
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

class TokenManager {
  private readonly ACCESS_TOKEN_KEY = 'fairtrade_access_token'
  private readonly REFRESH_TOKEN_KEY = 'fairtrade_refresh_token'
  private readonly EXPIRES_IN_KEY = 'fairtrade_expires_in'

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  setTokens(accessToken: string, refreshToken: string, expiresIn: number) {
    if (typeof window === 'undefined') return
    const expirationTime = Date.now() + expiresIn * 1000
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(this.EXPIRES_IN_KEY, expirationTime.toString())
  }

  clearTokens() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.EXPIRES_IN_KEY)
  }

  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true
    const expiresIn = localStorage.getItem(this.EXPIRES_IN_KEY)
    if (!expiresIn) return true
    return Date.now() > parseInt(expiresIn)
  }
}

// ============================================================================
// API CLIENT FACTORY
// ============================================================================

class FairTradeAPIClient {
  private client: AxiosInstance
  private tokenManager: TokenManager
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor() {
    this.tokenManager = new TokenManager()

    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor: Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.tokenManager.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor: Handle 401 with token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(this.client(originalRequest))
              })
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = this.tokenManager.getRefreshToken()
            if (!refreshToken) {
              this.tokenManager.clearTokens()
              window.location.href = '/login'
              return Promise.reject(error)
            }

            const response = await this.client.post('/api/auth/refresh-token', { refreshToken })
            const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data

            this.tokenManager.setTokens(accessToken, newRefreshToken, expiresIn)
            originalRequest.headers.Authorization = `Bearer ${accessToken}`

            this.refreshSubscribers.forEach((callback) => callback(accessToken))
            this.refreshSubscribers = []

            return this.client(originalRequest)
          } catch (refreshError) {
            this.tokenManager.clearTokens()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: AxiosError<any>) {
    if (error.response?.data) {
      const { code, message, details, statusCode } = error.response.data
      return new APIError(code || message, statusCode || error.response.status, details)
    }
    return new APIError('NETWORK_ERROR', 0)
  }

  // =========================================================================
  // AUTHENTICATION ENDPOINTS
  // =========================================================================

  auth = {
    register: async (data: {
      email: string
      phone: string
      password: string
      firstName: string
      lastName: string
      role: 'HOMEOWNER' | 'CONTRACTOR'
    }) => {
      const response = await this.client.post('/api/auth/register', data)
      const tokens = response.data.data.tokens
      this.tokenManager.setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)
      return response.data.data
    },

    login: async (data: { email: string; password: string }) => {
      const response = await this.client.post('/api/auth/login', data)
      const tokens = response.data.data.tokens
      this.tokenManager.setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)
      return response.data.data
    },

    logout: async (userId: string) => {
      const refreshToken = this.tokenManager.getRefreshToken()
      await this.client.post('/api/auth/logout', { userId, refreshToken })
      this.tokenManager.clearTokens()
    },

    verifyPhone: async (userId: string, otp: string) => {
      const response = await this.client.post('/api/auth/verify-phone', { userId, otp })
      return response.data.data
    },

    verifyEmail: async (userId: string, token: string) => {
      const response = await this.client.post('/api/auth/verify-email', { userId, token })
      return response.data.data
    },

    requestPasswordReset: async (email: string) => {
      const response = await this.client.post('/api/auth/request-password-reset', { email })
      return response.data.data
    },

    resetPassword: async (token: string, newPassword: string) => {
      const response = await this.client.post('/api/auth/reset-password', { token, newPassword })
      return response.data.data
    },

    refreshToken: async () => {
      const refreshToken = this.tokenManager.getRefreshToken()
      const response = await this.client.post('/api/auth/refresh-token', { refreshToken })
      const tokens = response.data.data
      this.tokenManager.setTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)
      return tokens
    },
  }

  // =========================================================================
  // USER ENDPOINTS
  // =========================================================================

  users = {
    getProfile: async (userId: string) => {
      const response = await this.client.get(`/api/users/${userId}`)
      return response.data.data
    },

    updateProfile: async (userId: string, data: Record<string, unknown>) => {
      const response = await this.client.patch(`/api/users/${userId}`, data)
      return response.data.data
    },

    setSpecializations: async (
      contractorId: string,
      tradeTypes: string[]
    ) => {
      const response = await this.client.post(`/api/users/${contractorId}/specializations`, {
        tradeTypes,
      })
      return response.data.data
    },

    updatePreferences: async (userId: string, preferences: Record<string, unknown>) => {
      const response = await this.client.post(`/api/users/${userId}/preferences`, {
        preferences,
      })
      return response.data.data
    },

    setupBusinessProfile: async (contractorId: string, businessProfile: Record<string, unknown>) => {
      const response = await this.client.post(`/api/users/${contractorId}/business-profile`, {
        businessProfile,
      })
      return response.data.data
    },

    getOnboardingStatus: async (contractorId: string) => {
      const response = await this.client.get(`/api/users/${contractorId}/onboarding-status`)
      return response.data.data
    },

    listContractors: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/contractors', { params: filters })
      return response.data.data
    },
  }

  // =========================================================================
  // JOB ENDPOINTS
  // =========================================================================

  jobs = {
    create: async (data: Record<string, unknown>) => {
      const response = await this.client.post('/api/jobs', data)
      return response.data.data
    },

    get: async (jobId: string) => {
      const response = await this.client.get(`/api/jobs/${jobId}`)
      return response.data.data
    },

    list: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/jobs', { params: filters })
      return response.data.data
    },

    update: async (jobId: string, data: Record<string, unknown>) => {
      const response = await this.client.patch(`/api/jobs/${jobId}`, data)
      return response.data.data
    },

    close: async (jobId: string) => {
      const response = await this.client.post(`/api/jobs/${jobId}/close`, {})
      return response.data.data
    },
  }

  // =========================================================================
  // BID ENDPOINTS
  // =========================================================================

  bids = {
    create: async (jobId: string, amount: number, timeline: string) => {
      const response = await this.client.post('/api/bids', { jobId, amount, timeline })
      return response.data.data
    },

    get: async (bidId: string) => {
      const response = await this.client.get(`/api/bids/${bidId}`)
      return response.data.data
    },

    listByJob: async (jobId: string) => {
      const response = await this.client.get(`/api/bids/job/${jobId}`)
      return response.data.data
    },

    listByContractor: async (contractorId: string) => {
      const response = await this.client.get(`/api/bids/contractor/${contractorId}`)
      return response.data.data
    },
  }

  // =========================================================================
  // CONTRACT ENDPOINTS
  // =========================================================================

  contracts = {
    create: async (data: {
      jobId: string
      contractorId: string
      bidAmount: number
      timeline: string
    }) => {
      const response = await this.client.post('/api/contracts', data)
      return response.data.data
    },

    get: async (contractId: string) => {
      const response = await this.client.get(`/api/contracts/${contractId}`)
      return response.data.data
    },

    listByJob: async (jobId: string) => {
      const response = await this.client.get(`/api/contracts/job/${jobId}`)
      return response.data.data
    },

    update: async (contractId: string, data: Record<string, unknown>) => {
      const response = await this.client.patch(`/api/contracts/${contractId}`, data)
      return response.data.data
    },

    acceptBid: async (contractId: string) => {
      const response = await this.client.post(`/api/contracts/${contractId}/accept`, {})
      return response.data.data
    },

    rejectBid: async (contractId: string, reason: string) => {
      const response = await this.client.post(`/api/contracts/${contractId}/reject`, { reason })
      return response.data.data
    },
  }

  // =========================================================================
  // COMPLETION ENDPOINTS
  // =========================================================================

  completions = {
    submit: async (data: {
      contractId: string
      photos: string[]
      video?: string
      notes?: string
      geolocation?: { latitude: number; longitude: number }
    }) => {
      const response = await this.client.post('/api/completions', data)
      return response.data.data
    },

    get: async (completionId: string) => {
      const response = await this.client.get(`/api/completions/${completionId}`)
      return response.data.data
    },

    approve: async (completionId: string, rating: number, feedback: string) => {
      const response = await this.client.patch(`/api/completions/${completionId}/approve`, {
        rating,
        feedback,
      })
      return response.data.data
    },

    dispute: async (completionId: string, reason: string, evidence?: string[]) => {
      const response = await this.client.patch(`/api/completions/${completionId}/dispute`, {
        reason,
        evidence,
      })
      return response.data.data
    },
  }

  // =========================================================================
  // DISPUTE ENDPOINTS
  // =========================================================================

  disputes = {
    get: async (disputeId: string) => {
      const response = await this.client.get(`/api/disputes/${disputeId}`)
      return response.data.data
    },

    submitResponse: async (disputeId: string, response: string, evidence?: string[]) => {
      const res = await this.client.post(`/api/disputes/${disputeId}/response`, {
        response,
        evidence,
      })
      return res.data.data
    },

    resolve: async (
      disputeId: string,
      resolution: 'REFUND' | 'PARTIAL_REFUND' | 'REWORK' | 'ARBITRATION',
      amount?: number
    ) => {
      const response = await this.client.post(`/api/disputes/${disputeId}/resolve`, {
        resolution,
        amount,
      })
      return response.data.data
    },
  }

  // =========================================================================
  // VERIFICATION ENDPOINTS
  // =========================================================================

  verification = {
    verifyLicense: async (contractorId: string, licenseNumber: string, state: string) => {
      const response = await this.client.post('/api/verification/license', {
        contractorId,
        licenseNumber,
        state,
      })
      return response.data.data
    },

    verifyBackgroundCheck: async (contractorId: string, ssn: string) => {
      const response = await this.client.post('/api/verification/background-check', {
        contractorId,
        ssn,
      })
      return response.data.data
    },

    verifyInsurance: async (contractorId: string, policyNumber: string, carrier: string) => {
      const response = await this.client.post('/api/verification/insurance', {
        contractorId,
        policyNumber,
        carrier,
      })
      return response.data.data
    },

    getStatus: async (contractorId: string) => {
      const response = await this.client.get(`/api/verification/status/${contractorId}`)
      return response.data.data
    },
  }

  // =========================================================================
  // ANALYTICS ENDPOINTS
  // =========================================================================

  analytics = {
    getMarketplaceMetrics: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/analytics/marketplace', { params: filters })
      return response.data.data
    },

    getContractorMetrics: async (contractorId: string) => {
      const response = await this.client.get(`/api/analytics/contractor/${contractorId}`)
      return response.data.data
    },

    getJobMetrics: async (jobId: string) => {
      const response = await this.client.get(`/api/analytics/job/${jobId}`)
      return response.data.data
    },

    getRevenueMetrics: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/analytics/revenue', { params: filters })
      return response.data.data
    },

    getTrendingData: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/analytics/trending', { params: filters })
      return response.data.data
    },
  }

  // =========================================================================
  // PAYMENT ENDPOINTS
  // =========================================================================

  payments = {
    getEscrowAccount: async (contractId: string) => {
      const response = await this.client.get(`/api/payments/escrow/${contractId}`)
      return response.data.data
    },

    processPayment: async (contractId: string, amount: number, paymentMethodId: string) => {
      const response = await this.client.post('/api/payments/process', {
        contractId,
        amount,
        paymentMethodId,
      })
      return response.data.data
    },

    getTransactionHistory: async (userId: string, filters?: Record<string, unknown>) => {
      const response = await this.client.get(`/api/payments/history/${userId}`, { params: filters })
      return response.data.data
    },
  }

  // =========================================================================
  // NOTIFICATION ENDPOINTS
  // =========================================================================

  notifications = {
    getNotifications: async (userId: string, filters?: Record<string, unknown>) => {
      const response = await this.client.get(`/api/notifications/${userId}`, { params: filters })
      return response.data.data
    },

    markAsRead: async (notificationId: string) => {
      const response = await this.client.patch(`/api/notifications/${notificationId}/read`, {})
      return response.data.data
    },

    markAllAsRead: async (userId: string) => {
      const response = await this.client.patch(`/api/notifications/${userId}/read-all`, {})
      return response.data.data
    },

    deleteNotification: async (notificationId: string) => {
      const response = await this.client.delete(`/api/notifications/${notificationId}`)
      return response.data.data
    },
  }

  // =========================================================================
  // ADMIN ENDPOINTS
  // =========================================================================

  admin = {
    getContractorApprovalQueue: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/admin/contractors/approval-queue', {
        params: filters,
      })
      return response.data.data
    },

    approveContractor: async (contractorId: string) => {
      const response = await this.client.post(`/api/admin/contractors/${contractorId}/approve`, {})
      return response.data.data
    },

    rejectContractor: async (contractorId: string, reason: string) => {
      const response = await this.client.post(`/api/admin/contractors/${contractorId}/reject`, {
        reason,
      })
      return response.data.data
    },

    getDisputeMediation: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/admin/disputes/mediation', { params: filters })
      return response.data.data
    },

    getUserManagement: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/admin/users', { params: filters })
      return response.data.data
    },

    suspendUser: async (userId: string, reason: string) => {
      const response = await this.client.post(`/api/admin/users/${userId}/suspend`, { reason })
      return response.data.data
    },

    getAuditLog: async (filters?: Record<string, unknown>) => {
      const response = await this.client.get('/api/admin/audit-log', { params: filters })
      return response.data.data
    },
  }

  // =========================================================================
  // UTILITY METHODS
  // =========================================================================

  isAuthenticated(): boolean {
    return !!this.tokenManager.getAccessToken()
  }

  getCurrentUser(): string | null {
    const token = this.tokenManager.getAccessToken()
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.userId
    } catch {
      return null
    }
  }

  clearAuth() {
    this.tokenManager.clearTokens()
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new FairTradeAPIClient()

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type { InternalAxiosRequestConfig }
export { TokenManager, FairTradeAPIClient }

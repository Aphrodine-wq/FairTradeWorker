/**
 * Environment Configuration
 *
 * Centralized configuration management for all environments
 * - Development
 * - Staging
 * - Production
 */

const ENV = process.env.NODE_ENV || 'development'
const IS_DEV = ENV === 'development'
const IS_PROD = ENV === 'production'
const IS_STAGING = ENV === 'staging'

// ============================================================================
// API CONFIGURATION
// ============================================================================

const getApiUrl = (): string => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL
  }

  if (IS_PROD) {
    return 'https://api.fairtradeworker.com'
  }
  if (IS_STAGING) {
    return 'https://staging-api.fairtradeworker.com'
  }
  return 'http://localhost:3001'
}

const getWebsocketUrl = (): string => {
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL
  }

  if (IS_PROD) {
    return 'wss://api.fairtradeworker.com'
  }
  if (IS_STAGING) {
    return 'wss://staging-api.fairtradeworker.com'
  }
  return 'ws://localhost:3001'
}

// ============================================================================
// THIRD-PARTY SERVICES
// ============================================================================

export const STRIPE_CONFIG = {
  PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY || '',
  ENABLED: !!process.env.REACT_APP_STRIPE_PUBLIC_KEY,
}

export const SENDGRID_CONFIG = {
  API_KEY: process.env.REACT_APP_SENDGRID_API_KEY || '',
  FROM_EMAIL: process.env.REACT_APP_SENDGRID_FROM_EMAIL || 'noreply@fairtradeworker.com',
  ENABLED: !!process.env.REACT_APP_SENDGRID_API_KEY,
}

export const TWILIO_CONFIG = {
  PHONE_NUMBER: process.env.REACT_APP_TWILIO_PHONE_NUMBER || '',
  ENABLED: !!process.env.REACT_APP_TWILIO_PHONE_NUMBER,
}

export const FIREBASE_CONFIG = {
  API_KEY: process.env.REACT_APP_FIREBASE_API_KEY || '',
  PROJECT_ID: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  MESSAGING_SENDER_ID: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  APP_ID: process.env.REACT_APP_FIREBASE_APP_ID || '',
  ENABLED: !!process.env.REACT_APP_FIREBASE_API_KEY,
}

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '',
  UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || '',
  ENABLED: !!process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
}

export const GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
  ENABLED: !!process.env.REACT_APP_GOOGLE_CLIENT_ID,
}

export const APPLE_OAUTH_CONFIG = {
  TEAM_ID: process.env.REACT_APP_APPLE_TEAM_ID || '',
  KEY_ID: process.env.REACT_APP_APPLE_KEY_ID || '',
  SERVICE_ID: process.env.REACT_APP_APPLE_SERVICE_ID || '',
  ENABLED: !!process.env.REACT_APP_APPLE_TEAM_ID,
}

// ============================================================================
// ANALYTICS & MONITORING
// ============================================================================

export const SENTRY_CONFIG = {
  DSN: process.env.REACT_APP_SENTRY_DSN || '',
  ENVIRONMENT: ENV,
  ENABLED: !!process.env.REACT_APP_SENTRY_DSN && IS_PROD,
}

export const ANALYTICS_CONFIG = {
  GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GA_ID || '',
  MIXPANEL_TOKEN: process.env.REACT_APP_MIXPANEL_TOKEN || '',
  ENABLED: !!process.env.REACT_APP_GA_ID || !!process.env.REACT_APP_MIXPANEL_TOKEN,
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_SOCIAL_LOGIN: process.env.REACT_APP_ENABLE_SOCIAL_LOGIN === 'true' || IS_DEV,
  ENABLE_TWO_FACTOR: process.env.REACT_APP_ENABLE_2FA === 'true' || IS_DEV,
  ENABLE_REAL_TIME: process.env.REACT_APP_ENABLE_REALTIME === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true' || IS_DEV,
  ENABLE_BETA_FEATURES: process.env.REACT_APP_ENABLE_BETA === 'true' || IS_DEV,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_COMMENTS: true,
  ENABLE_MESSAGING: false, // Not yet
  ENABLE_VIDEO_CALLS: false, // Not yet
}

// ============================================================================
// DEBUG & DEVELOPMENT
// ============================================================================

export const DEBUG_CONFIG = {
  ENABLED: IS_DEV,
  LOG_LEVEL: IS_PROD ? 'error' : 'debug',
  LOG_API_REQUESTS: IS_DEV,
  LOG_API_RESPONSES: IS_DEV,
  MOCK_API: IS_DEV && process.env.REACT_APP_MOCK_API === 'true',
  VERBOSE_ERRORS: IS_DEV,
}

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================

export const PERFORMANCE_CONFIG = {
  CACHE_ENABLED: !IS_DEV,
  CACHE_TTL: IS_DEV ? 5 * 60 * 1000 : 30 * 60 * 1000, // 5min dev, 30min prod
  COMPRESSION_ENABLED: IS_PROD,
  LAZY_LOAD_ENABLED: !IS_DEV,
  REQUEST_TIMEOUT: IS_DEV ? 60000 : 30000,
}

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export const SECURITY_CONFIG = {
  HTTPS_REQUIRED: IS_PROD,
  CSRF_PROTECTION: true,
  XSS_PROTECTION: true,
  RATE_LIMITING_ENABLED: !IS_DEV,
  API_KEY_VALIDATION: true,
}

// ============================================================================
// MAIN ENVIRONMENT CONFIG EXPORT
// ============================================================================

export const environment = {
  // Basic
  isDevelopment: IS_DEV,
  isProduction: IS_PROD,
  isStaging: IS_STAGING,
  environment: ENV,

  // API
  apiUrl: getApiUrl(),
  websocketUrl: getWebsocketUrl(),
  apiTimeout: 30000,

  // Services
  stripe: STRIPE_CONFIG,
  sendgrid: SENDGRID_CONFIG,
  twilio: TWILIO_CONFIG,
  firebase: FIREBASE_CONFIG,
  cloudinary: CLOUDINARY_CONFIG,
  googleOAuth: GOOGLE_OAUTH_CONFIG,
  appleOAuth: APPLE_OAUTH_CONFIG,

  // Monitoring
  sentry: SENTRY_CONFIG,
  analytics: ANALYTICS_CONFIG,

  // Features
  features: FEATURE_FLAGS,

  // Debug
  debug: DEBUG_CONFIG,

  // Performance
  performance: PERFORMANCE_CONFIG,

  // Security
  security: SECURITY_CONFIG,

  // Utility
  isFeatureEnabled: (feature: keyof typeof FEATURE_FLAGS): boolean => {
    return FEATURE_FLAGS[feature]
  },

  isServiceEnabled: (service: 'stripe' | 'sendgrid' | 'twilio' | 'firebase' | 'cloudinary'): boolean => {
    const serviceConfig = {
      stripe: STRIPE_CONFIG,
      sendgrid: SENDGRID_CONFIG,
      twilio: TWILIO_CONFIG,
      firebase: FIREBASE_CONFIG,
      cloudinary: CLOUDINARY_CONFIG,
    }
    return serviceConfig[service].ENABLED
  },

  // Get service config safely
  getServiceConfig: (service: string) => {
    const configs: Record<string, any> = {
      stripe: STRIPE_CONFIG,
      sendgrid: SENDGRID_CONFIG,
      twilio: TWILIO_CONFIG,
      firebase: FIREBASE_CONFIG,
      cloudinary: CLOUDINARY_CONFIG,
    }
    return configs[service.toLowerCase()] || null
  },
}

export default environment

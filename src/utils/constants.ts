/**
 * Application Constants
 *
 * Centralized configuration values for the entire app
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
}

// ============================================================================
// AUTH CONFIGURATION
// ============================================================================

export const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: 'fairtrade_access_token',
  REFRESH_TOKEN_KEY: 'fairtrade_refresh_token',
  USER_KEY: 'fairtrade_user',
  ACCESS_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// ============================================================================
// USER ROLES & PERMISSIONS
// ============================================================================

export const USER_ROLES = {
  HOMEOWNER: 'HOMEOWNER',
  CONTRACTOR: 'CONTRACTOR',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SUPPORT: 'SUPPORT',
  VIEWER: 'VIEWER',
} as const

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  HOMEOWNER: [
    'post_job',
    'view_bids',
    'hire_contractor',
    'approve_work',
    'dispute_work',
    'view_analytics',
    'manage_profile',
  ],
  CONTRACTOR: [
    'view_jobs',
    'submit_bid',
    'view_contracts',
    'submit_completion',
    'view_payments',
    'manage_profile',
    'view_ratings',
  ],
  ADMIN: [
    '*', // All permissions
  ],
  MANAGER: [
    'view_analytics',
    'manage_disputes',
    'manage_users',
    'view_payments',
  ],
  SUPPORT: [
    'manage_disputes',
    'view_users',
    'manage_tickets',
  ],
  VIEWER: [
    'view_analytics_public',
    'view_marketplace',
  ],
}

// ============================================================================
// JOB CATEGORIES
// ============================================================================

export const JOB_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'Carpentry',
  'Painting',
  'Flooring',
  'Landscaping',
  'Masonry',
  'Drywall',
  'Tile',
  'Concrete',
  'Windows & Doors',
  'Insulation',
  'Siding',
  'Decking',
  'Gutters',
  'Exterior',
  'Interior',
  'General Repair',
  'Other',
] as const

// ============================================================================
// CONTRACT STATES
// ============================================================================

export const CONTRACT_STATES = {
  DRAFT: 'DRAFT',
  PENDING_ACCEPTANCE: 'PENDING_ACCEPTANCE',
  ACCEPTED: 'ACCEPTED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export const CONTRACT_STATE_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_ACCEPTANCE: 'Awaiting Decision',
  ACCEPTED: 'Accepted',
  ACTIVE: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

// ============================================================================
// DISPUTE RESOLUTION
// ============================================================================

export const DISPUTE_PATHS = {
  REFUND: 'REFUND',
  PARTIAL_REFUND: 'PARTIAL_REFUND',
  REWORK: 'REWORK',
  ARBITRATION: 'ARBITRATION',
} as const

export const DISPUTE_PATH_LABELS: Record<string, string> = {
  REFUND: 'Full Refund',
  PARTIAL_REFUND: 'Partial Refund',
  REWORK: 'Rework Required',
  ARBITRATION: 'Third Party Arbitration',
}

export const DISPUTE_PATH_DESCRIPTIONS: Record<string, string> = {
  REFUND: 'Homeowner gets 100% refund, contractor gets nothing',
  PARTIAL_REFUND: 'Amount is negotiated and split between parties',
  REWORK: 'Contractor has 7 days to fix the work',
  ARBITRATION: 'Third party decides outcome (cost split equally)',
}

// ============================================================================
// PAYMENT CONFIGURATION
// ============================================================================

export const PAYMENT_CONFIG = {
  DEPOSIT_PERCENT: 0.25, // 25% of Bid
  FINAL_PAYMENT_PERCENT: 0.75, // 75% of Bid
  PLATFORM_FEE_PERCENT: 0.12, // 12% Added to Homeowner Total
  CONTRACTOR_KEEP_PERCENT: 1.00, // 100% of Bid
  DEPOSIT_RELEASE_HOURS: 0,
  FINAL_RELEASE_HOURS: 24,
  MIN_AMOUNT: 50,
  MAX_AMOUNT: 1000000,
}

// ============================================================================
// VERIFICATION TYPES
// ============================================================================

export const VERIFICATION_TYPES = {
  LICENSE: 'LICENSE',
  BACKGROUND_CHECK: 'BACKGROUND_CHECK',
  INSURANCE: 'INSURANCE',
} as const

export const VERIFICATION_CACHE_DAYS = 365 // Cache for 1 year

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export const NOTIFICATION_TYPES = {
  WELCOME: 'WELCOME',
  JOB_POSTED: 'JOB_POSTED',
  BID_RECEIVED: 'BID_RECEIVED',
  BID_ACCEPTED: 'BID_ACCEPTED',
  CONTRACT_CREATED: 'CONTRACT_CREATED',
  WORK_SUBMITTED: 'WORK_SUBMITTED',
  WORK_APPROVED: 'WORK_APPROVED',
  DISPUTE_INITIATED: 'DISPUTE_INITIATED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  PAYMENT_RELEASED: 'PAYMENT_RELEASED',
  VERIFICATION_NEEDED: 'VERIFICATION_NEEDED',
  VERIFICATION_COMPLETED: 'VERIFICATION_COMPLETED',
} as const

export const NOTIFICATION_PRIORITY = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export const NOTIFICATION_CHANNELS = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  IN_APP: 'IN_APP',
} as const

// ============================================================================
// RATING CONFIGURATION
// ============================================================================

export const RATING_CONFIG = {
  MIN: 1,
  MAX: 5,
  MIN_REVIEWS_FOR_TRENDING: 10,
  RATING_WEIGHT: 0.6,
  RECENCY_WEIGHT: 0.2,
  VOLUME_WEIGHT: 0.2,
}

export const RATING_LABELS: Record<number, string> = {
  5: 'Excellent',
  4: 'Very Good',
  3: 'Good',
  2: 'Fair',
  1: 'Poor',
}

// ============================================================================
// DISPUTE CONFIGURATION
// ============================================================================

export const DISPUTE_CONFIG = {
  DISPUTE_WINDOW_DAYS: 5,
  MEDIATION_WINDOW_HOURS: 48,
  RESPONSE_DEADLINE_HOURS: 48,
  RESOLUTION_TIMEOUT_HOURS: 7 * 24, // 7 days
}

// ============================================================================
// ONBOARDING STEPS
// ============================================================================

export const ONBOARDING_STEPS = {
  PROFILE: 1,
  VERIFICATION: 2,
  SPECIALIZATION: 3,
  PORTFOLIO: 4,
  PAYMENT: 5,
  INSURANCE: 6,
  AVAILABILITY: 7,
  REVIEW: 8,
} as const

export const ONBOARDING_STEP_LABELS: Record<number, string> = {
  1: 'Complete Profile',
  2: 'Verify Identity',
  3: 'Select Specializations',
  4: 'Upload Portfolio',
  5: 'Add Payment Method',
  6: 'Verify Insurance',
  7: 'Set Availability',
  8: 'Review & Submit',
}

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
}

export const COLOR_SCHEMES = {
  BRAND_PRIMARY: '#2563eb', // Blue
  BRAND_SECONDARY: '#7c3aed', // Purple
  SUCCESS: '#10b981', // Green
  WARNING: '#f59e0b', // Amber
  ERROR: '#ef4444', // Red
  INFO: '#0ea5e9', // Cyan
}

// ============================================================================
// UI DENSITY
// ============================================================================

export const UI_DENSITY = {
  COMPACT: 'compact',
  NORMAL: 'normal',
  SPACIOUS: 'spacious',
}

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

export const ANIMATION_DURATION = {
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 254,
  PHONE_LENGTH: 10,
  ZIP_CODE_LENGTH: 5,
  OTP_LENGTH: 6,
  CVV_LENGTH: 3,
  CARD_NUMBER_LENGTH: 16,
  BIO_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 5000,
}

// ============================================================================
// FILE CONFIGURATION
// ============================================================================

export const FILE_CONFIG = {
  IMAGE_MAX_SIZE_MB: 10,
  VIDEO_MAX_SIZE_MB: 100,
  DOCUMENT_MAX_SIZE_MB: 25,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
}

// ============================================================================
// API RATE LIMITING
// ============================================================================

export const RATE_LIMIT_CONFIG = {
  REQUESTS_PER_HOUR: 1000,
  REQUESTS_PER_MINUTE: 60,
  SEARCH_PER_MINUTE: 30,
  BID_PER_HOUR: 50,
}

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const CACHE_CONFIG = {
  JOB_LIST_TTL: 5 * 60 * 1000, // 5 minutes
  USER_PROFILE_TTL: 10 * 60 * 1000, // 10 minutes
  ANALYTICS_TTL: 30 * 60 * 1000, // 30 minutes
  CONTRACTOR_LIST_TTL: 15 * 60 * 1000, // 15 minutes
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  ENABLE_SOCIAL_LOGIN: process.env.REACT_APP_ENABLE_SOCIAL_LOGIN === 'true',
  ENABLE_TWO_FACTOR: process.env.REACT_APP_ENABLE_2FA === 'true',
  ENABLE_REAL_TIME: process.env.REACT_APP_ENABLE_REALTIME === 'true',
  ENABLE_ANALYTICS: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  ENABLE_BETA_FEATURES: process.env.REACT_APP_ENABLE_BETA === 'true',
}

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Auth errors
  AUTH_001: 'Invalid credentials',
  AUTH_002: 'Email already registered',
  AUTH_003: 'Phone already registered',
  AUTH_004: 'Account suspended',
  AUTH_005: 'Email not verified',
  AUTH_006: 'Invalid OTP',

  // Validation errors
  VAL_001: 'Invalid email format',
  VAL_002: 'Invalid phone format',
  VAL_003: 'Password too weak',
  VAL_004: 'Missing required fields',

  // Permissions errors
  PERM_001: 'Insufficient permissions',
  PERM_002: 'Resource not found',
  PERM_003: 'Access denied',

  // Business logic errors
  BIZ_001: 'Insufficient funds',
  BIZ_002: 'Bid already submitted',
  BIZ_003: 'Cannot bid on own job',
  BIZ_004: 'Contract already exists',
  BIZ_005: 'Dispute window closed',

  // Server errors
  SRV_001: 'Internal server error',
  SRV_002: 'Service unavailable',
  SRV_003: 'Request timeout',
}

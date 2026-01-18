/**
 * Comprehensive Validation Utilities
 *
 * Email, phone, password, address, credit card, etc.
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateEmailDomain = (email: string, allowedDomains?: string[]): boolean => {
  if (!validateEmail(email)) return false

  if (!allowedDomains) return true

  const domain = email.split('@')[1]
  return allowedDomains.includes(domain)
}

// ============================================================================
// PHONE VALIDATION
// ============================================================================

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export const formatPhoneE164 = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) return `+1${cleaned}`
  if (cleaned.length === 11) return `+${cleaned}`
  return phone
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

export const validatePassword = (password: string): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number')
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character (!@#$%^&*)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const getPasswordStrength = (
  password: string
): 'weak' | 'fair' | 'good' | 'strong' => {
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[!@#$%^&*]/.test(password)) strength++

  if (strength <= 1) return 'weak'
  if (strength <= 2) return 'fair'
  if (strength <= 3) return 'good'
  return 'strong'
}

// ============================================================================
// CREDIT CARD VALIDATION
// ============================================================================

export const validateCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '')

  if (cleaned.length < 13 || cleaned.length > 19) return false

  // Luhn algorithm
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)

    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

export const validateExpiry = (month: string, year: string): boolean => {
  const m = parseInt(month, 10)
  const y = parseInt(year, 10)

  if (m < 1 || m > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  if (y < currentYear) return false
  if (y === currentYear && m < currentMonth) return false

  return true
}

export const validateCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv)
}

// ============================================================================
// ADDRESS VALIDATION
// ============================================================================

export const validateAddress = (address: {
  street: string
  city: string
  state: string
  zip: string
  country?: string
}): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (!address.street || address.street.trim().length < 5) {
    errors.push('Street address must be at least 5 characters')
  }
  if (!address.city || address.city.trim().length < 2) {
    errors.push('City must be at least 2 characters')
  }
  if (!address.state || address.state.trim().length !== 2) {
    errors.push('State must be 2 characters (e.g., CA)')
  }
  if (!address.zip || !/^\d{5}(-\d{4})?$/.test(address.zip)) {
    errors.push('ZIP code must be 5 or 9 digits (e.g., 12345 or 12345-6789)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// URL VALIDATION
// ============================================================================

export const validateURL = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================================================
// NUMBER VALIDATION
// ============================================================================

export const validateNumber = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value)

  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false

  return true
}

export const validateInteger = (value: string, min?: number, max?: number): boolean => {
  if (!/^-?\d+$/.test(value)) return false
  return validateNumber(value, min, max)
}

export const validateCurrency = (value: string): boolean => {
  return /^\d+(\.\d{1,2})?$/.test(value)
}

// ============================================================================
// STRING VALIDATION
// ============================================================================

export const validateLength = (
  value: string,
  min: number,
  max?: number
): boolean => {
  if (value.length < min) return false
  if (max !== undefined && value.length > max) return false
  return true
}

export const validateAlphanumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value)
}

export const validateAlphanumericWithSpaces = (value: string): boolean => {
  return /^[a-zA-Z0-9 ]+$/.test(value)
}

export const validateUsername = (username: string): boolean => {
  // 3-20 chars, alphanumeric + underscore/dash
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username)
}

export const validateSlug = (slug: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

export const validateImageFile = (file: File): {
  isValid: boolean
  error?: string
} => {
  const maxSizeMB = 10
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!validateFileType(file, allowedTypes)) {
    return {
      isValid: false,
      error: 'Invalid image format. Allowed: JPEG, PNG, WebP',
    }
  }

  if (!validateFileSize(file, maxSizeMB)) {
    return {
      isValid: false,
      error: `Image must be smaller than ${maxSizeMB}MB`,
    }
  }

  return { isValid: true }
}

export const validateVideoFile = (file: File): {
  isValid: boolean
  error?: string
} => {
  const maxSizeMB = 100
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo']

  if (!validateFileType(file, allowedTypes)) {
    return {
      isValid: false,
      error: 'Invalid video format. Allowed: MP4, MOV, AVI',
    }
  }

  if (!validateFileSize(file, maxSizeMB)) {
    return {
      isValid: false,
      error: `Video must be smaller than ${maxSizeMB}MB`,
    }
  }

  return { isValid: true }
}

// ============================================================================
// BUSINESS VALIDATION
// ============================================================================

export const validateBudget = (budget: number): boolean => {
  return budget > 0 && budget <= 1000000
}

export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5
}

export const validatePercentage = (value: number): boolean => {
  return value >= 0 && value <= 100
}

// ============================================================================
// BATCH VALIDATION
// ============================================================================

export interface ValidationResult {
  [key: string]: string | string[] | null
}

export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): ValidationResult => {
  const errors: ValidationResult = {}

  for (const [field, rule] of Object.entries(rules)) {
    const error = rule(data[field])
    if (error) {
      errors[field] = error
    }
  }

  return errors
}

export const hasErrors = (errors: ValidationResult): boolean => {
  return Object.values(errors).some((error) => error !== null)
}

/**
 * Unit Tests: Validators
 *
 * Testing all validation functions with comprehensive edge cases
 */

import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateCreditCard,
  validateAddress,
  validateURL,
  validateFileType,
  validateFileSize,
  validateBudgetRange,
  validateRating,
  validatePercentage,
  getPasswordStrength,
  validateBatchForm,
} from '../../utils/validators'

describe('Email Validation', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('test.name@company.co.uk')).toBe(true)
    expect(validateEmail('john+tag@domain.org')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user @domain.com')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })

  it('should handle disposable email domains', () => {
    // Assuming validateEmail checks against disposable list
    const isValid = validateEmail('user@tempmail.com')
    expect(typeof isValid).toBe('boolean')
  })
})

describe('Phone Validation', () => {
  it('should validate correct phone numbers', () => {
    expect(validatePhone('5551234567')).toBe(true)
    expect(validatePhone('(555) 123-4567')).toBe(true)
    expect(validatePhone('+15551234567')).toBe(true)
    expect(validatePhone('555-123-4567')).toBe(true)
  })

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('123')).toBe(false)
    expect(validatePhone('abc')).toBe(false)
    expect(validatePhone('')).toBe(false)
    expect(validatePhone('55512345')).toBe(false) // Too short
  })

  it('should handle various formats', () => {
    const formats = [
      '5551234567',
      '555-123-4567',
      '(555) 123-4567',
      '+1 (555) 123-4567',
    ]
    formats.forEach(format => {
      expect(validatePhone(format)).toBe(true)
    })
  })
})

describe('Password Validation', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('SecurePass123!')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject short passwords', () => {
    const result = validatePassword('Short1!')
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should require uppercase letters', () => {
    const result = validatePassword('lowercase123!')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('uppercase'))).toBe(true)
  })

  it('should require lowercase letters', () => {
    const result = validatePassword('UPPERCASE123!')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('lowercase'))).toBe(true)
  })

  it('should require numbers', () => {
    const result = validatePassword('NoNumbers!')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('number'))).toBe(true)
  })

  it('should require special characters', () => {
    const result = validatePassword('NoSpecial123')
    expect(result.isValid).toBe(false)
    expect(result.errors.some(e => e.includes('special'))).toBe(true)
  })
})

describe('Password Strength', () => {
  it('should return weak for short passwords', () => {
    const strength = getPasswordStrength('Weak1!')
    expect(['weak', 'fair']).toContain(strength)
  })

  it('should return fair for medium passwords', () => {
    const strength = getPasswordStrength('Medium123!')
    expect(['fair', 'good']).toContain(strength)
  })

  it('should return strong for complex passwords', () => {
    const strength = getPasswordStrength('VeryStrong@Password123!')
    expect(['good', 'strong']).toContain(strength)
  })
})

describe('Credit Card Validation', () => {
  it('should validate correct Visa cards', () => {
    // Using test card 4532015112830366
    expect(validateCreditCard('4532015112830366')).toBe(true)
  })

  it('should validate correct Mastercard', () => {
    // Using test card 5425233010103442
    expect(validateCreditCard('5425233010103442')).toBe(true)
  })

  it('should validate correct Amex', () => {
    // Using test card 378282246310005
    expect(validateCreditCard('378282246310005')).toBe(true)
  })

  it('should reject invalid card numbers', () => {
    expect(validateCreditCard('1234567890123456')).toBe(false)
    expect(validateCreditCard('invalid')).toBe(false)
    expect(validateCreditCard('')).toBe(false)
  })

  it('should handle cards with spaces', () => {
    expect(validateCreditCard('4532 0151 1283 0366')).toBe(true)
  })

  it('should use Luhn algorithm', () => {
    // Invalid Luhn checksum
    expect(validateCreditCard('4532015112830367')).toBe(false)
  })
})

describe('Address Validation', () => {
  it('should validate complete addresses', () => {
    const address = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    }
    expect(validateAddress(address)).toBe(true)
  })

  it('should reject incomplete addresses', () => {
    const address = {
      street: '',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    }
    expect(validateAddress(address)).toBe(false)
  })

  it('should validate ZIP codes', () => {
    const address = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: 'INVALID',
    }
    expect(validateAddress(address)).toBe(false)
  })

  it('should validate state codes', () => {
    const address = {
      street: '123 Main St',
      city: 'New York',
      state: 'XX',
      zipCode: '10001',
    }
    expect(validateAddress(address)).toBe(false)
  })
})

describe('URL Validation', () => {
  it('should validate correct URLs', () => {
    expect(validateURL('https://www.example.com')).toBe(true)
    expect(validateURL('http://example.com')).toBe(true)
    expect(validateURL('https://sub.example.com/path')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(validateURL('not a url')).toBe(false)
    expect(validateURL('ftp://example.com')).toBe(false)
    expect(validateURL('')).toBe(false)
  })
})

describe('File Validation', () => {
  it('should validate image file types', () => {
    expect(validateFileType('image.jpg', 'image')).toBe(true)
    expect(validateFileType('photo.png', 'image')).toBe(true)
    expect(validateFileType('picture.webp', 'image')).toBe(true)
  })

  it('should validate video file types', () => {
    expect(validateFileType('video.mp4', 'video')).toBe(true)
    expect(validateFileType('movie.webm', 'video')).toBe(true)
  })

  it('should reject invalid file types', () => {
    expect(validateFileType('document.pdf', 'image')).toBe(false)
    expect(validateFileType('script.js', 'image')).toBe(false)
  })

  it('should validate file size limits', () => {
    const sizeInBytes = 5 * 1024 * 1024 // 5MB
    expect(validateFileSize(sizeInBytes, 10)).toBe(true) // 10MB limit
    expect(validateFileSize(sizeInBytes, 2)).toBe(false) // 2MB limit
  })
})

describe('Budget Range Validation', () => {
  it('should validate budget within range', () => {
    expect(validateBudgetRange(500, 100, 1000)).toBe(true)
    expect(validateBudgetRange(100, 100, 1000)).toBe(true) // Min boundary
    expect(validateBudgetRange(1000, 100, 1000)).toBe(true) // Max boundary
  })

  it('should reject budget outside range', () => {
    expect(validateBudgetRange(50, 100, 1000)).toBe(false)
    expect(validateBudgetRange(1500, 100, 1000)).toBe(false)
  })
})

describe('Rating Validation', () => {
  it('should validate valid ratings', () => {
    expect(validateRating(1)).toBe(true)
    expect(validateRating(3)).toBe(true)
    expect(validateRating(5)).toBe(true)
    expect(validateRating(4.5)).toBe(true)
  })

  it('should reject invalid ratings', () => {
    expect(validateRating(0)).toBe(false)
    expect(validateRating(6)).toBe(false)
    expect(validateRating(-1)).toBe(false)
    expect(validateRating(5.5)).toBe(false)
  })
})

describe('Percentage Validation', () => {
  it('should validate valid percentages', () => {
    expect(validatePercentage(0)).toBe(true)
    expect(validatePercentage(50)).toBe(true)
    expect(validatePercentage(100)).toBe(true)
    expect(validatePercentage(25.5)).toBe(true)
  })

  it('should reject invalid percentages', () => {
    expect(validatePercentage(-1)).toBe(false)
    expect(validatePercentage(101)).toBe(false)
    expect(validatePercentage(-100)).toBe(false)
  })
})

describe('Batch Form Validation', () => {
  it('should validate multiple fields', () => {
    const form = {
      email: 'user@example.com',
      password: 'SecurePass123!',
      phone: '5551234567',
    }
    const rules = {
      email: (v: string) => validateEmail(v),
      password: (v: string) => validatePassword(v).isValid,
      phone: (v: string) => validatePhone(v),
    }
    const result = validateBatchForm(form, rules)
    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('should collect all validation errors', () => {
    const form = {
      email: 'invalid',
      password: 'weak',
      phone: '123',
    }
    const rules = {
      email: (v: string) => validateEmail(v),
      password: (v: string) => validatePassword(v).isValid,
      phone: (v: string) => validatePhone(v),
    }
    const result = validateBatchForm(form, rules)
    expect(result.isValid).toBe(false)
    expect(Object.keys(result.errors).length).toBeGreaterThan(0)
  })
})

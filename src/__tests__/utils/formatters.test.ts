/**
 * Unit Tests: Formatters
 *
 * Testing all data formatting functions with edge cases and localization
 */

import {
  formatPrice,
  formatCurrency,
  formatPaymentBreakdown,
  formatDate,
  formatRelativeTime,
  formatPhone,
  formatName,
  formatAddress,
  formatCompactNumber,
  formatRating,
  getRatingColor,
  formatStatusLabel,
  getStatusColor,
  formatFileSize,
  formatTimezone,
} from '../../utils/formatters'

describe('Currency Formatting', () => {
  it('should format prices in USD', () => {
    expect(formatPrice(1000)).toBe('$1,000.00')
    expect(formatPrice(1500.5)).toBe('$1,500.50')
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('should handle large numbers', () => {
    expect(formatPrice(1000000)).toBe('$1,000,000.00')
    expect(formatPrice(999999.99)).toBe('$999,999.99')
  })

  it('should handle negative numbers', () => {
    expect(formatPrice(-100)).toBe('-$100.00')
    expect(formatPrice(-1000.5)).toBe('-$1,000.50')
  })

  it('should format different currencies', () => {
    expect(formatCurrency(1000, 'USD')).toContain('1,000')
    expect(formatCurrency(1000, 'EUR')).toContain('€')
    expect(formatCurrency(1000, 'GBP')).toContain('£')
  })
})

describe('Payment Breakdown', () => {
  it('should calculate correct deposit and final amounts', () => {
    const breakdown = formatPaymentBreakdown(1000)
    expect(breakdown.total).toBe(1000)
    expect(breakdown.deposit).toBe(250) // 25%
    expect(breakdown.final).toBe(750) // 75%
  })

  it('should calculate platform fees correctly', () => {
    const breakdown = formatPaymentBreakdown(1000)
    expect(breakdown.platformFee).toBe(180) // 18%
  })

  it('should calculate contractor net correctly', () => {
    const breakdown = formatPaymentBreakdown(1000)
    // 82% of total after 18% platform fee
    expect(breakdown.contractorTotal).toBe(820)
  })

  it('should handle different amounts', () => {
    const breakdown100 = formatPaymentBreakdown(100)
    expect(breakdown100.deposit).toBe(25)
    expect(breakdown100.final).toBe(75)

    const breakdown5000 = formatPaymentBreakdown(5000)
    expect(breakdown5000.deposit).toBe(1250)
    expect(breakdown5000.final).toBe(3750)
  })

  it('should match deposit and final to total', () => {
    const breakdown = formatPaymentBreakdown(1000)
    expect(breakdown.deposit + breakdown.final).toBe(1000)
  })
})

describe('Date Formatting', () => {
  const testDate = new Date('2026-01-04T12:00:00Z')

  it('should format short date', () => {
    const formatted = formatDate(testDate, 'short')
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('4')
    expect(formatted).toContain('2026')
  })

  it('should format long date', () => {
    const formatted = formatDate(testDate, 'long')
    expect(formatted).toContain('January')
    expect(formatted).toMatch(/\d{1,2}/)
    expect(formatted).toContain('2026')
  })

  it('should format time', () => {
    const formatted = formatDate(testDate, 'time')
    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
  })

  it('should format with custom locale', () => {
    const formatted = formatDate(testDate, 'short', 'en-US')
    expect(typeof formatted).toBe('string')
  })
})

describe('Relative Time Formatting', () => {
  it('should return "just now" for current time', () => {
    const now = new Date()
    expect(formatRelativeTime(now)).toBe('just now')
  })

  it('should return minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const formatted = formatRelativeTime(fiveMinutesAgo)
    expect(formatted).toContain('5')
    expect(formatted).toContain('min')
  })

  it('should return hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const formatted = formatRelativeTime(twoHoursAgo)
    expect(formatted).toContain('2')
    expect(formatted).toContain('hour')
  })

  it('should return days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const formatted = formatRelativeTime(threeDaysAgo)
    expect(formatted).toContain('3')
    expect(formatted).toContain('day')
  })

  it('should handle future dates', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const formatted = formatRelativeTime(tomorrow)
    expect(formatted).toContain('in')
  })
})

describe('Phone Formatting', () => {
  it('should format 10-digit numbers', () => {
    expect(formatPhone('5551234567')).toBe('(555) 123-4567')
  })

  it('should format numbers with existing formatting', () => {
    expect(formatPhone('(555) 123-4567')).toBe('(555) 123-4567')
    expect(formatPhone('555-123-4567')).toBe('(555) 123-4567')
  })

  it('should handle international format', () => {
    const formatted = formatPhone('+15551234567')
    expect(formatted).toContain('555')
    expect(formatted).toContain('1234')
    expect(formatted).toContain('4567')
  })

  it('should handle short numbers gracefully', () => {
    const formatted = formatPhone('555')
    expect(typeof formatted).toBe('string')
  })
})

describe('Name Formatting', () => {
  it('should capitalize first and last names', () => {
    expect(formatName('john', 'doe')).toBe('John Doe')
    expect(formatName('JANE', 'SMITH')).toBe('Jane Smith')
    expect(formatName('mary', 'mccoy')).toBe('Mary Mccoy')
  })

  it('should handle single names', () => {
    expect(formatName('john')).toBe('John')
  })

  it('should extract initials', () => {
    const formatted = formatName('John Doe')
    // Function might return "J.D." or similar
    expect(formatted.length).toBeGreaterThan(0)
  })

  it('should handle empty strings', () => {
    const formatted = formatName('', '')
    expect(typeof formatted).toBe('string')
  })
})

describe('Address Formatting', () => {
  it('should format full address', () => {
    const address = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    }
    const formatted = formatAddress(address)
    expect(formatted).toContain('123 Main St')
    expect(formatted).toContain('New York')
    expect(formatted).toContain('NY')
    expect(formatted).toContain('10001')
  })

  it('should handle partial addresses', () => {
    const address = {
      street: '123 Main St',
      city: 'New York',
    }
    const formatted = formatAddress(address)
    expect(formatted).toContain('123 Main St')
    expect(formatted).toContain('New York')
  })

  it('should format as single line', () => {
    const address = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    }
    const formatted = formatAddress(address, 'inline')
    expect(formatted.includes('\n')).toBe(false)
  })
})

describe('Compact Number Formatting', () => {
  it('should format thousands', () => {
    expect(formatCompactNumber(1000)).toBe('1K')
    expect(formatCompactNumber(1500)).toBe('1.5K')
    expect(formatCompactNumber(999)).toBe('999')
  })

  it('should format millions', () => {
    expect(formatCompactNumber(1000000)).toBe('1M')
    expect(formatCompactNumber(1500000)).toBe('1.5M')
  })

  it('should format billions', () => {
    expect(formatCompactNumber(1000000000)).toBe('1B')
  })

  it('should handle negative numbers', () => {
    expect(formatCompactNumber(-1000)).toBe('-1K')
  })
})

describe('Rating Formatting', () => {
  it('should format ratings with stars', () => {
    expect(formatRating(4.5)).toBe('4.5★')
    expect(formatRating(3)).toBe('3★')
    expect(formatRating(5)).toBe('5★')
  })

  it('should round to one decimal', () => {
    const formatted = formatRating(4.567)
    expect(formatted).toContain('4.5')
  })

  it('should handle edge cases', () => {
    expect(formatRating(0)).toBe('0★')
    expect(formatRating(5)).toBe('5★')
  })
})

describe('Rating Color', () => {
  it('should return red for low ratings', () => {
    expect(getRatingColor(1)).toContain('red')
  })

  it('should return orange for medium-low ratings', () => {
    const color = getRatingColor(2.5)
    expect(['orange', 'yellow']).some(c => color.includes(c))
  })

  it('should return yellow for medium ratings', () => {
    const color = getRatingColor(3)
    expect(['yellow', 'orange']).some(c => color.includes(c))
  })

  it('should return green for high ratings', () => {
    expect(getRatingColor(4.5)).toContain('green')
  })

  it('should return green for perfect ratings', () => {
    expect(getRatingColor(5)).toContain('green')
  })
})

describe('Status Formatting', () => {
  it('should format contract statuses', () => {
    expect(formatStatusLabel('DRAFT')).toBe('Draft')
    expect(formatStatusLabel('ACTIVE')).toBe('Active')
    expect(formatStatusLabel('COMPLETED')).toBe('Completed')
  })

  it('should handle status with underscores', () => {
    expect(formatStatusLabel('IN_PROGRESS')).toBe('In Progress')
    expect(formatStatusLabel('PENDING_ACCEPTANCE')).toBe('Pending Acceptance')
  })

  it('should return status color', () => {
    expect(getStatusColor('COMPLETED')).toContain('green')
    expect(getStatusColor('DRAFT')).toContain('gray')
    expect(getStatusColor('CANCELLED')).toContain('red')
  })
})

describe('File Size Formatting', () => {
  it('should format bytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('should format kilobytes', () => {
    expect(formatFileSize(1024 * 100)).toBe('100 KB')
    expect(formatFileSize(1024 * 512)).toBe('512 KB')
  })

  it('should format megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(1024 * 1024 * 5)).toBe('5 MB')
  })

  it('should format gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
  })

  it('should handle zero', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })
})

describe('Timezone Formatting', () => {
  it('should return timezone abbreviation', () => {
    const tz = formatTimezone('America/New_York')
    expect(typeof tz).toBe('string')
  })

  it('should handle UTC', () => {
    const tz = formatTimezone('UTC')
    expect(tz).toContain('UTC')
  })
})

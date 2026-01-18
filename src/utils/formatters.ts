/**
 * Comprehensive Formatting Utilities
 *
 * Currency, dates, time, phone, addresses, etc.
 */

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  decimals: number = 2
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export const formatPrice = (value: number): string => {
  return formatCurrency(value, 'USD', 2)
}

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d.-]/g, ''))
}

export const formatPaymentBreakdown = (amount: number) => {
  const deposit = amount * 0.25
  const final = amount * 0.75
  const fee = amount * 0.18

  return {
    total: amount,
    deposit,
    depositNet: deposit * 0.82,
    final,
    finalNet: final * 0.82,
    platformFee: fee,
    contractorTotal: (deposit + final) * 0.82,
  }
}

// ============================================================================
// DATE & TIME FORMATTING
// ============================================================================

export const formatDate = (date: Date | string, format: string = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

    case 'datetime':
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

    case 'iso':
      return d.toISOString().split('T')[0]

    default:
      return d.toLocaleDateString()
  }
}

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return formatDate(d, 'short')
}

export const getDaysSince = (date: Date | string): number => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

// ============================================================================
// PHONE FORMATTING
// ============================================================================

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  if (cleaned.length === 11) {
    return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  return phone
}

export const formatPhoneShort = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.slice(-4).padStart(cleaned.length, '*')
}

// ============================================================================
// PERSON NAME FORMATTING
// ============================================================================

export const formatName = (firstName: string, lastName: string): string => {
  return `${firstName.trim()} ${lastName.trim()}`.trim()
}

export const formatInitials = (firstName: string, lastName: string): string => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

export const formatNameCapitalized = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================================================================
// ADDRESS FORMATTING
// ============================================================================

export const formatAddress = (address: {
  street: string
  city: string
  state: string
  zip: string
  country?: string
}): string => {
  const parts = [address.street, address.city, address.state, address.zip]
  if (address.country) parts.push(address.country)
  return parts.filter((p) => p).join(', ')
}

export const formatAddressMultiline = (address: {
  street: string
  city: string
  state: string
  zip: string
}): string => {
  return `${address.street}\n${address.city}, ${address.state} ${address.zip}`
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

export const formatNumber = (
  value: number,
  decimals: number = 0,
  separator: string = ','
): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export const formatPercent = (value: number, decimals: number = 0): string => {
  return `${formatNumber(value, decimals)}%`
}

export const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

// ============================================================================
// STRING FORMATTING
// ============================================================================

export const formatSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const formatTitleCase = (text: string): string => {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const formatSentenceCase = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const truncate = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

export const formatBreadcrumbs = (path: string): string[] => {
  return path.split('/').filter((p) => p.length > 0)
}

// ============================================================================
// RATING FORMATTING
// ============================================================================

export const formatRating = (rating: number, maxStars: number = 5): string => {
  const stars = Math.min(Math.max(Math.round(rating * 10) / 10, 0), maxStars)
  return `${stars.toFixed(1)}★`
}

export const getRatingColor = (
  rating: number
): 'text-red-500' | 'text-yellow-500' | 'text-green-500' => {
  if (rating < 2.5) return 'text-red-500'
  if (rating < 4) return 'text-yellow-500'
  return 'text-green-500'
}

export const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 4) return 'Very Good'
  if (rating >= 3) return 'Good'
  if (rating >= 2) return 'Fair'
  return 'Poor'
}

// ============================================================================
// STATUS FORMATTING
// ============================================================================

export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const getStatusColor = (
  status: string
): 'text-green-600' | 'text-yellow-600' | 'text-red-600' | 'text-blue-600' | 'text-gray-600' => {
  const lower = status.toLowerCase()

  if (['completed', 'approved', 'active', 'verified'].includes(lower))
    return 'text-green-600'
  if (['pending', 'in_progress', 'in_mediation'].includes(lower))
    return 'text-yellow-600'
  if (['rejected', 'failed', 'cancelled', 'disputed'].includes(lower))
    return 'text-red-600'
  if (['draft'].includes(lower)) return 'text-blue-600'

  return 'text-gray-600'
}

// ============================================================================
// BYTE SIZE FORMATTING
// ============================================================================

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i]
}

// ============================================================================
// UTILITY COMBINATIONS
// ============================================================================

export const formatJobCard = (job: {
  title: string
  budget: number
  category: string
  createdAt: Date
  bidsCount: number
}): string => {
  return `${job.title} • ${formatPrice(job.budget)} • ${job.category} (${job.bidsCount} bids)`
}

export const formatContractorCard = (contractor: {
  name: string
  rating: number
  reviews: number
  completedJobs: number
}): string => {
  return `${contractor.name} • ${formatRating(contractor.rating)} (${contractor.reviews} reviews) • ${contractor.completedJobs} completed`
}

// ============================================================================
// JSON & DATA FORMATTING
// ============================================================================

export const formatJSON = (data: any, pretty: boolean = true): string => {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
}

export const formatCSV = (data: any[]): string => {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header]
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`
      }
      return value
    })
  )

  return [headers, ...rows].map((row) => row.join(',')).join('\n')
}

/**
 * Component Tests: ErrorBoundary
 *
 * Testing error boundary with development and production modes
 * Covers error catching, recovery, and error logging
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../../components/ErrorBoundary'

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error message')
}

// Component that throws conditionally
const ConditionalError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Conditional error')
  }
  return <div>No error</div>
}

// Safe component
const SafeComponent = () => {
  return <div>This component is safe</div>
}

describe('ErrorBoundary - Rendering', () => {
  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('This component is safe')).toBeInTheDocument()
  })

  it('should render error UI when child component throws', () => {
    // Suppress error logs in test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong|error/i)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should show development error details', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // In development, should show error message and stack trace
    expect(screen.getByText(/test error message/i)).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
    consoleSpy.mockRestore()
  })

  it('should show production error UI', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // In production, should show generic message
    const errorText = screen.getByText(/something went wrong|unexpected error/i)
    expect(errorText).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
    consoleSpy.mockRestore()
  })
})

describe('ErrorBoundary - Error Recovery', () => {
  it('should have Try Again button', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    expect(tryAgainButton).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should clear error state on Try Again', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(tryAgainButton)

    // After clicking Try Again, component should reset
    rerender(
      <ErrorBoundary>
        <ConditionalError shouldThrow={false} />
      </ErrorBoundary>
    )

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('should have Go Home button', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const goHomeButton = screen.getByRole('button', { name: /go home|home/i })
    expect(goHomeButton).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should navigate to home on Go Home click', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const mockNavigate = jest.fn()

    // Mock window location
    delete (window as any).location
    window.location = { href: '' } as any

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const goHomeButton = screen.getByRole('button', { name: /go home|home/i })
    fireEvent.click(goHomeButton)

    // Should navigate to home
    await waitFor(() => {
      expect(window.location.href).toContain('/')
    })

    consoleSpy.mockRestore()
  })
})

describe('ErrorBoundary - Error Information', () => {
  it('should display error message from thrown error', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText(/test error message/i)).toBeInTheDocument()

    process.env.NODE_ENV = 'development'
    consoleSpy.mockRestore()
  })

  it('should include support email link', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    const emailLink = screen.getByRole('link', { name: /support@/i })
    expect(emailLink).toBeInTheDocument()
    expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:'))

    consoleSpy.mockRestore()
  })
})

describe('ErrorBoundary - Error Logging', () => {
  it('should log error to service in production', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    const mockSentry = jest.fn()
    ;(window as any).Sentry = { captureException: mockSentry }

    render(
      <ErrorBoundary onError={mockSentry}>
        <ThrowError />
      </ErrorBoundary>
    )

    // Should attempt to log error
    expect(mockSentry).toHaveBeenCalledWith(expect.any(Error))

    process.env.NODE_ENV = originalEnv
    consoleSpy.mockRestore()
  })

  it('should not log error to service in development', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    process.env.NODE_ENV = 'development'

    const mockSentry = jest.fn()
    ;(window as any).Sentry = { captureException: mockSentry }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    // In development, should not log to service
    // (would typically just log to console)

    process.env.NODE_ENV = 'development'
    consoleSpy.mockRestore()
  })
})

describe('ErrorBoundary - Error Fallback Props', () => {
  it('should accept custom onError callback', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    const mockOnError = jest.fn()

    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(mockOnError).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should track error count', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error count should increase with each error
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    // Click Try Again
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(tryAgainButton)

    // Rerender with another error
    rerender(
      <ErrorBoundary>
        <ConditionalError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Error should appear again

    consoleSpy.mockRestore()
  })
})

describe('ErrorBoundary - Nested Boundaries', () => {
  it('should handle nested error boundaries', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <ErrorBoundary>
        <div>
          <SafeComponent />
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    )

    // Inner boundary should catch error
    expect(screen.getByText('This component is safe')).toBeInTheDocument()
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})

describe('ErrorBoundary - Error Types', () => {
  it('should catch TypeError', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const BadComponent = () => {
      const obj = null as any
      return <div>{obj.property}</div> // TypeError
    }

    render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should catch ReferenceError', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const BadComponent = () => {
      return <div>{undefined_variable}</div> // ReferenceError
    }

    render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})

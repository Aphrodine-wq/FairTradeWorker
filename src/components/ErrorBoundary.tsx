/**
 * Error Boundary Component
 *
 * Catches React errors and displays fallback UI
 * - Development error display
 * - Production error tracking
 * - Graceful error recovery
 */

import React, { ReactNode, useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorCount: number
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 0,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState((prevState) => ({
      ...prevState,
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }))

    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo)
    } else {
      // Log to console in development
      console.error('Error Boundary caught:', error, errorInfo)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Send to error tracking service like Sentry, LogRocket, etc.
    try {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
      const errorData = {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      // In real app, send to logging service
      console.error('Error logged:', errorData)
    } catch (err) {
      console.error('Failed to log error:', err)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          isDevelopment={process.env.NODE_ENV === 'development'}
        />
      )
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  errorInfo?: React.ErrorInfo
  onReset: () => void
  isDevelopment: boolean
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  onReset,
  isDevelopment,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/50 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Something Went Wrong
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              We've encountered an unexpected error
            </p>
          </div>
        </div>

        {/* Error Message */}
        {isDevelopment && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6 space-y-3">
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                Error Message:
              </h3>
              <code className="block bg-red-100 dark:bg-red-900/50 p-3 rounded text-sm text-red-800 dark:text-red-100 overflow-x-auto font-mono">
                {error.message}
              </code>
            </div>

            {error.stack && (
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                  Stack Trace:
                </h3>
                <code className="block bg-red-100 dark:bg-red-900/50 p-3 rounded text-xs text-red-800 dark:text-red-100 overflow-x-auto font-mono max-h-48 overflow-y-auto">
                  {error.stack}
                </code>
              </div>
            )}

            {errorInfo?.componentStack && (
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                  Component Stack:
                </h3>
                <code className="block bg-red-100 dark:bg-red-900/50 p-3 rounded text-xs text-red-800 dark:text-red-100 overflow-x-auto font-mono max-h-48 overflow-y-auto">
                  {errorInfo.componentStack}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Production Message */}
        {!isDevelopment && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-6">
            <p className="text-blue-900 dark:text-blue-200 text-sm">
              Our team has been notified of this error and is working to resolve it. We apologize
              for the inconvenience.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            If this problem persists, please contact our support team at{' '}
            <a href="mailto:support@fairtradeworker.com" className="text-blue-600 hover:underline">
              support@fairtradeworker.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary

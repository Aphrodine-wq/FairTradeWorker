/**
 * Sentry Error Tracking Setup
 * Production error monitoring and reporting
 */

import * as Sentry from '@sentry/node';
import { Express, Request, Response, NextFunction } from 'express';

/**
 * Initialize Sentry for error tracking
 */
export function initializeSentry(app: Express) {
  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({
        app: true,
        request: true,
        serverName: true,
        transaction: true,
        user: ['id', 'email', 'role'],
        tags: ['http.client_ip'],
        clearCookie: true,
      }),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    maxBreadcrumbs: 100,
    attachStacktrace: true,
    beforeSend(event, hint) {
      // Suppress certain errors in development
      if (process.env.NODE_ENV === 'development') {
        if (hint.originalException instanceof Error) {
          if (hint.originalException.message.includes('Cannot find module')) {
            return null;
          }
        }
      }
      return event;
    },
  });

  // Request handler middleware
  app.use(Sentry.Handlers.requestHandler());

  // Performance monitoring
  app.use(Sentry.Handlers.tracingHandler());

  console.log('✅ Sentry initialized for error tracking');
}

/**
 * Add error handler to app (must be last)
 */
export function addSentryErrorHandler(app: Express) {
  app.use(Sentry.Handlers.errorHandler());
}

/**
 * Capture error with context
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      application: context,
    },
  });
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email: string, role: string) {
  Sentry.setUser({
    id: userId,
    email,
    username: role,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string = 'info', level: 'info' | 'debug' | 'warning' | 'error' = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Create transaction for performance monitoring
 */
export function startTransaction(name: string, op: string = 'http.request') {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Middleware for error handling with Sentry
 */
export function errorHandlingMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || 'unknown';

  // Log error
  console.error(`[${requestId}] Error:`, err);

  // Set Sentry context
  Sentry.captureException(err, {
    contexts: {
      request: {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: req.headers,
      },
      response: {
        statusCode: res.statusCode,
      },
    },
    tags: {
      requestId: String(requestId),
      route: req.route?.path || 'unknown',
    },
  });

  // Send error response
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    requestId,
    sentryEventId: Sentry.lastEventId(),
  });
}

export default {
  initializeSentry,
  addSentryErrorHandler,
  captureError,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  startTransaction,
  errorHandlingMiddleware,
};

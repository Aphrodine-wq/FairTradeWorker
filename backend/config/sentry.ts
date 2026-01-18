/**
 * Sentry Error Tracking Configuration
 * Centralizes error tracking, performance monitoring, and incident alerting
 */

import * as Sentry from '@sentry/node';
import { Express } from 'express';

interface SentryConfig {
  enabled: boolean;
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  maxBreadcrumbs: number;
  attachStacktrace: boolean;
  integrations: any[];
}

/**
 * Initialize Sentry for error tracking and performance monitoring
 */
export function initializeSentry(app: Express, config: SentryConfig): void {
  if (!config.enabled) {
    console.log('Sentry is disabled');
    return;
  }

  if (!config.dsn) {
    console.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  console.log(`Initializing Sentry with DSN: ${config.dsn.substring(0, 20)}...`);

  // Initialize Sentry
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: config.tracesSampleRate,
    maxBreadcrumbs: config.maxBreadcrumbs,
    attachStacktrace: config.attachStacktrace,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ request: true, serverName: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection({ mode: 'strict' }),
      new Sentry.Integrations.ContextLines({ in_app_include: ['/app/'] }),
      new Sentry.Integrations.RequestData({
        include: {
          cookies: true,
          data: true,
          headers: true,
          query_string: true,
          url: true,
        },
      }),
    ],
  });

  // Attach Sentry request handler
  app.use(Sentry.Handlers.requestHandler());

  // Attach Sentry tracing handler
  app.use(Sentry.Handlers.tracingHandler());

  // Set user context from request
  app.use((req: any, res: any, next: any) => {
    if (req.user) {
      Sentry.setUser({
        id: req.user.id,
        email: req.user.email,
        username: req.user.firstName,
        role: req.user.role,
      });
    }
    next();
  });

  // Capture all unhandled exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    Sentry.captureException(error, {
      tags: { type: 'uncaught_exception' },
      level: 'fatal',
    });
  });

  // Capture all unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    Sentry.captureException(reason, {
      tags: { type: 'unhandled_rejection' },
      level: 'fatal',
    });
  });

  console.log('Sentry initialized successfully');
}

/**
 * Attach Sentry error handler to Express app
 * Must be called after all other middleware and routes
 */
export function attachSentryErrorHandler(app: Express): void {
  // Error handler
  app.use(Sentry.Handlers.errorHandler());

  // Custom error handler for response capture
  app.use((error: any, req: any, res: any, next: any) => {
    // Capture the error with Sentry
    Sentry.captureException(error, {
      contexts: {
        express: {
          method: req.method,
          url: req.originalUrl,
          headers: req.headers,
          query: req.query,
          body: req.body,
        },
      },
      tags: {
        error_type: error.name || 'UnknownError',
        http_status: error.status || 500,
        path: req.path,
      },
      level: error.status >= 500 ? 'error' : 'warning',
    });

    // Send error response
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';

    res.status(status).json({
      success: false,
      error: error.code || 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  });
}

/**
 * Create Sentry configuration object from environment variables
 */
export function createSentryConfig(): SentryConfig {
  return {
    enabled: process.env.SENTRY_ENABLED === 'true',
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    maxBreadcrumbs: parseInt(process.env.SENTRY_MAX_BREADCRUMBS || '100'),
    attachStacktrace: process.env.SENTRY_ATTACH_STACKTRACE !== 'false',
    integrations: [],
  };
}

/**
 * Capture a custom error event
 */
export function captureError(
  error: Error | string,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
    userId?: string;
  }
): string {
  if (typeof error === 'string') {
    return Sentry.captureMessage(error, context?.level || 'error');
  }

  return Sentry.captureException(error, {
    tags: context?.tags || {},
    extra: context?.extra || {},
    level: context?.level || 'error',
  });
}

/**
 * Capture a user action
 */
export function captureUserAction(
  action: string,
  data?: Record<string, any>
): void {
  Sentry.captureMessage(action, {
    level: 'info',
    extra: data || {},
  });
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  category?: string
): void {
  Sentry.addBreadcrumb({
    message,
    data,
    category: category || 'user-action',
    level: 'info',
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, userEmail: string, userRole?: string): void {
  Sentry.setUser({
    id: userId,
    email: userEmail,
    username: userEmail,
    role: userRole,
  });
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Create a transaction for performance monitoring
 */
export function startTransaction(
  name: string,
  op: string
): Sentry.Transaction | undefined {
  if (!Sentry.hasHubInstances()) {
    return undefined;
  }

  const transaction = Sentry.startTransaction({
    name,
    op,
    sampled: Math.random() < 0.1, // Sample 10% of transactions
  });

  return transaction;
}

export default {
  initializeSentry,
  attachSentryErrorHandler,
  createSentryConfig,
  captureError,
  captureUserAction,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  startTransaction,
};

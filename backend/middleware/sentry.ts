/**
 * Sentry Middleware
 * Integrates Sentry error tracking into Express middleware chain
 */

import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { captureError, addBreadcrumb, setUserContext } from '../config/sentry';

/**
 * Middleware to capture API errors with context
 */
export function sentryErrorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Skip if already handled
  if (res.headersSent) {
    return next(error);
  }

  // Extract relevant error information
  const errorInfo = {
    name: error.name || 'UnknownError',
    message: error.message || 'An unknown error occurred',
    code: error.code || 'INTERNAL_ERROR',
    status: error.status || 500,
    stack: error.stack,
  };

  // Add breadcrumb for this error
  addBreadcrumb(
    `Error: ${errorInfo.message}`,
    {
      errorCode: errorInfo.code,
      httpStatus: errorInfo.status,
      path: req.path,
    },
    'error'
  );

  // Capture the error
  const eventId = captureError(error, {
    tags: {
      error_type: errorInfo.name,
      http_method: req.method,
      http_path: req.path,
      http_status: String(errorInfo.status),
    },
    extra: {
      requestId: req.id,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      url: req.originalUrl,
    },
    level: errorInfo.status >= 500 ? 'error' : 'warning',
  });

  // Send error response with Sentry event ID
  res.status(errorInfo.status).json({
    success: false,
    error: errorInfo.code,
    message: errorInfo.message,
    eventId, // Include for user support reference
  });
}

/**
 * Middleware to capture request performance
 */
export function sentryPerformanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Store request ID for tracking
  (req as any).id = requestId;

  // Add breadcrumb for request start
  addBreadcrumb(
    `${req.method} ${req.path}`,
    {
      requestId,
      method: req.method,
      path: req.path,
    },
    'http'
  );

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log slow requests
    if (duration > 1000) {
      addBreadcrumb(
        `Slow request: ${req.method} ${req.path}`,
        {
          duration: `${duration}ms`,
          statusCode,
          requestId,
        },
        'performance'
      );
    }

    // Log errors
    if (statusCode >= 400) {
      addBreadcrumb(
        `Request failed: ${req.method} ${req.path}`,
        {
          statusCode,
          duration: `${duration}ms`,
          requestId,
        },
        'http.error'
      );
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware to set user context from request
 */
export function sentryUserContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if ((req as any).user) {
    setUserContext(
      (req as any).user.id,
      (req as any).user.email,
      (req as any).user.role
    );
  }

  next();
}

/**
 * Middleware to add transaction tracking
 */
export function sentryTransactionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const transaction = Sentry.startTransaction({
    name: `${req.method} ${req.path}`,
    op: 'http.server',
    sampled: Math.random() < 0.1, // Sample 10% of requests
  });

  // End transaction on response
  const originalSend = res.send;
  res.send = function (data: any) {
    transaction?.setHttpStatus(res.statusCode);
    transaction?.finish();
    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware to capture authentication events
 */
export function sentryAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log successful authentication
  if ((req as any).user && req.path.includes('/auth/')) {
    addBreadcrumb(
      `Authentication: ${req.path}`,
      {
        userId: (req as any).user.id,
        email: (req as any).user.email,
        path: req.path,
      },
      'auth'
    );
  }

  next();
}

/**
 * Middleware to capture payment events
 */
export function sentryPaymentMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.path.includes('/payments/')) {
    // Add breadcrumb for payment attempts
    addBreadcrumb(
      `Payment operation: ${req.method} ${req.path}`,
      {
        method: req.method,
        path: req.path,
        user: (req as any).user?.id,
      },
      'payment'
    );
  }

  next();
}

/**
 * Middleware to capture database operations
 */
export function sentryDatabaseMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // This would be used for database query monitoring
  // Could integrate with Prisma hooks or SQLAlchemy
  next();
}

export default {
  sentryErrorMiddleware,
  sentryPerformanceMiddleware,
  sentryUserContextMiddleware,
  sentryTransactionMiddleware,
  sentryAuthMiddleware,
  sentryPaymentMiddleware,
  sentryDatabaseMiddleware,
};

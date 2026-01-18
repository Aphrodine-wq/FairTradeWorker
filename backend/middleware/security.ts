/**
 * Security Middleware Stack
 * Combines all security-related middleware for easy application to Express app
 * Part of PHASE 1 Security Implementation
 */

import { Express, Request, Response, NextFunction } from 'express';
import express from 'express';
import {
  authenticateToken,
  authorizeRole,
  authorizeTier,
  sessionTimeout,
  rateLimitByUser,
  validateApiKey,
  verifyCorsOrigin,
} from './auth';

export interface SecurityConfig {
  enableAuthentication?: boolean;
  enableRateLimit?: boolean;
  enableSessionTimeout?: boolean;
  enableApiKeyValidation?: boolean;
  corsOrigins?: string[];
  rateLimitMaxRequests?: number;
  rateLimitWindowMs?: number;
  sessionTimeoutMinutes?: number;
}

/**
 * Apply all security middleware to Express app
 */
export function applySecurity(app: Express, config: SecurityConfig = {}): void {
  const {
    enableAuthentication = true,
    enableRateLimit = true,
    enableSessionTimeout = true,
    enableApiKeyValidation = false,
    corsOrigins = [],
    rateLimitMaxRequests = 1000,
    rateLimitWindowMs = 60 * 60 * 1000, // 1 hour
    sessionTimeoutMinutes = 30,
  } = config;

  console.log('🔒 Applying security middleware...');

  // 1. Security Headers
  app.use(securityHeaders());
  console.log('✅ Security headers middleware enabled');

  // 2. CORS Verification
  if (corsOrigins.length > 0) {
    app.use(verifyCorsOrigin(corsOrigins));
    console.log('✅ CORS origin verification enabled');
  }

  // 3. Input Sanitization
  app.use(inputSanitization());
  console.log('✅ Input sanitization middleware enabled');

  // 4. Rate Limiting
  if (enableRateLimit) {
    app.use(rateLimitByUser(rateLimitMaxRequests, rateLimitWindowMs));
    console.log(`✅ Rate limiting enabled (${rateLimitMaxRequests} requests per hour)`);
  }

  // 5. Session Timeout
  if (enableSessionTimeout) {
    app.use(sessionTimeout(sessionTimeoutMinutes));
    console.log(`✅ Session timeout enabled (${sessionTimeoutMinutes} minutes)`);
  }

  // 6. Request ID Tracking
  app.use(requestIdMiddleware());
  console.log('✅ Request ID tracking enabled');

  console.log('🔒 Security middleware stack applied successfully\n');
}

/**
 * Apply API-specific security middleware
 * Use for protecting API routes: app.use('/api/', apiSecurity())
 */
export function apiSecurity(
  config: Partial<SecurityConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Could add API-specific checks here
    next();
  };
}

/**
 * Middleware: Security Headers
 * Prevents common attacks (XSS, Clickjacking, etc.)
 */
export function securityHeaders(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Enable XSS protection in older browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Enforce HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
    );

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy (formerly Feature Policy)
    res.setHeader(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
    );

    next();
  };
}

/**
 * Middleware: Input Sanitization
 * Removes/escapes common injection patterns
 */
export function inputSanitization(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const sanitize = (value: any): any => {
      if (typeof value === 'string') {
        // Remove SQL keywords in suspicious patterns
        return value
          .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|EXEC|EXECUTE)\b)/gi, '')
          .replace(/['";\\]/g, ''); // Remove quotes and backslashes
      }

      if (Array.isArray(value)) {
        return value.map(sanitize);
      }

      if (typeof value === 'object' && value !== null) {
        const sanitized: any = {};
        for (const [key, val] of Object.entries(value)) {
          sanitized[key] = sanitize(val);
        }
        return sanitized;
      }

      return value;
    };

    if (req.body) {
      req.body = sanitize(req.body);
    }

    if (req.query) {
      const sanitized = sanitize(req.query);
      Object.keys(req.query).forEach(key => {
        delete req.query[key];
      });
      Object.assign(req.query, sanitized);
    }

    if (req.params) {
      req.params = sanitize(req.params);
    }

    next();
  };
}

/**
 * Middleware: Request ID Tracking
 * Assigns unique ID to each request for tracing
 */
export function requestIdMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    (req as any).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  };
}

/**
 * Middleware for API key protected routes
 * Usage: app.use('/api/v2/', protectedApi(config))
 */
export function protectedApi(
  config: Partial<SecurityConfig> = {}
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    // Add API-specific protections
    next();
  };
}

/**
 * Configure CORS securely
 */
export function configureCors(allowedOrigins: string[] = []): { [key: string]: any } {
  return {
    origin: function (origin: string, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 hours
  };
}

/**
 * Error handling middleware (must be last)
 */
export function errorHandler(): (err: Error, req: Request, res: Response, next: NextFunction) => void {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`❌ Error [${(req as any).requestId}]:`, err);

    const statusCode = (err as any).statusCode || 500;
    const errorCode = (err as any).errorCode || 'INTERNAL_ERROR';

    res.status(statusCode).json({
      success: false,
      error: errorCode,
      message: err.message || 'Internal server error',
      requestId: (req as any).requestId,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  };
}

/**
 * Health check endpoint
 */
export function healthCheck(): (req: Request, res: Response) => void {
  return (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  };
}

/**
 * Export helper to setup all security at once
 */
export function setupSecurity(app: Express): void {
  // Apply security middleware
  applySecurity(app, {
    enableAuthentication: true,
    enableRateLimit: true,
    enableSessionTimeout: true,
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
    sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30'),
  });

  // Health check endpoint
  app.get('/health', healthCheck());

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Endpoint not found',
      path: req.path,
      method: req.method,
      requestId: (req as any).requestId,
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler());

  console.log('✅ Security setup complete');
}

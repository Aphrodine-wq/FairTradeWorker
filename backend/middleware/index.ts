import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

/**
 * Express Middleware Suite
 * Handles authentication, validation, error handling, and security
 */

// Extend Express Request to include user data
export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: any;
  requestId?: string;
}

// Error interface
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

/**
 * Request ID middleware - Adds unique ID to each request for tracing
 */
export const requestIdMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

/**
 * Request logging middleware
 */
export const requestLoggerMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${req.requestId}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

/**
 * Authentication middleware - Verifies JWT token and extracts user
 */
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new APIError(401, 'NO_AUTH_TOKEN', 'Authorization token required');
    }

    const token = authHeader.substring(7);
    const authService = new AuthService();
    const decoded = authService.verifyAccessToken(token);

    if (!decoded) {
      throw new APIError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }

    // Get user details
    const user = await authService.getUserById(decoded.sub);

    if (!user) {
      throw new APIError(401, 'USER_NOT_FOUND', 'User not found');
    }

    req.userId = decoded.sub;
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        error: error.message,
        code: error.errorCode,
        requestId: req.requestId,
      });
    }

    return res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
      requestId: req.requestId,
    });
  }
};

/**
 * Authorization middleware - Checks user role
 */
export const authorizationMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED',
        requestId: req.requestId,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        details: { required: allowedRoles, current: req.user.role },
        requestId: req.requestId,
      });
    }

    next();
  };
};

/**
 * Request validation middleware - Validates request body/params
 */
export const validateRequest = (schema: any) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Simple validation example (in production, use Joi or Yup)
      if (schema.required && schema.required.length > 0) {
        const missing = schema.required.filter((field: string) => !req.body[field]);

        if (missing.length > 0) {
          throw new APIError(
            400,
            'VALIDATION_ERROR',
            'Missing required fields',
            { missing }
          );
        }
      }

      next();
    } catch (error) {
      if (error instanceof APIError) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.errorCode,
          details: error.details,
          requestId: req.requestId,
        });
      }

      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        requestId: req.requestId,
      });
    }
  };
};

/**
 * Rate limiting middleware
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = req.userId || req.ip;
    const now = Date.now();

    let data = requestCounts.get(key);

    if (!data || now > data.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    data.count++;

    if (data.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((data.resetTime - now) / 1000),
        requestId: req.requestId,
      });
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - data.count);
    res.setHeader('X-RateLimit-Reset', data.resetTime);

    next();
  };
};

/**
 * Error handling middleware - Catches and normalizes errors
 */
export const errorHandlerMiddleware = (
  error: any,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.error(`[${req.requestId}] Error:`, error);

  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.errorCode,
      details: error.details,
      requestId: req.requestId,
    });
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error.details,
      requestId: req.requestId,
    });
  }

  if (error.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND',
      requestId: req.requestId,
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
      requestId: req.requestId,
    });
  }

  // Generic error response
  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal server error',
    code: error.code || 'INTERNAL_ERROR',
    requestId: req.requestId,
  });
};

/**
 * Security headers middleware
 */
export const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Prevent XSS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Strict-Transport-Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );

  next();
};

/**
 * Async error wrapper - Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Health check middleware
 */
export const healthCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }

  next();
};

/**
 * Input sanitization middleware - Prevents common injection attacks
 */
export const sanitizeInputMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Simple sanitization - remove SQL-like patterns
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove SQL keywords in suspicious patterns
      return obj
        .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/gi, '')
        .trim();
    }

    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((key) => {
        obj[key] = sanitize(obj[key]);
      });
    }

    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query);
  }

  next();
};

/**
 * Compression middleware (in production, use compression package)
 */
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set compression-friendly headers
  if (req.headers['accept-encoding']?.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
  }

  next();
};

/**
 * CORS configuration helper
 */
export const corsConfig = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

/**
 * Request body size limit middleware
 */
export const bodyLimitMiddleware = (size: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // This is typically handled by express.json() but can be customized
    next();
  };
};

/**
 * Pagination middleware - Validates and applies pagination
 */
export const paginationMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 items
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

  req.query.limit = limit.toString();
  req.query.offset = offset.toString();

  next();
};

/**
 * Webhook signature verification middleware
 */
export const verifyWebhookSignature = (webhookSecret: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const signature = req.headers['x-webhook-signature'] as string;

    if (!signature) {
      throw new APIError(401, 'NO_SIGNATURE', 'Webhook signature required');
    }

    // Verify signature (simplified - use crypto in production)
    // In production: crypto.createHmac('sha256', webhookSecret).update(body).digest('hex')
    const expectedSignature = Buffer.from(webhookSecret).toString('base64');

    if (signature !== expectedSignature) {
      throw new APIError(401, 'INVALID_SIGNATURE', 'Invalid webhook signature');
    }

    next();
  };
};

/**
 * Mount all middleware to Express app
 */
export const mountMiddleware = (app: any) => {
  // Security and parsing
  app.use(securityHeadersMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitizeInputMiddleware);

  // Request tracking
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(healthCheckMiddleware);

  // Rate limiting (global)
  app.use(rateLimitMiddleware(1000, 60 * 60 * 1000)); // 1000 requests per hour

  // Error handling (must be last)
  app.use(errorHandlerMiddleware);
};

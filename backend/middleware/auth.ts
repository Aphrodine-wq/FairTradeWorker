/**
 * Enhanced Authentication & Authorization Middleware
 * Part of PHASE 1 Security Implementation - Issue #2: JWT Authentication
 */

import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

// Extend Express Request for authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tier: string;
    iat?: number;
  };
  requestId?: string;
  rawBody?: string;
}

/**
 * Simple JWT implementation for demonstration
 * In production, use 'jsonwebtoken' package: npm install jsonwebtoken
 * Then replace this with: import jwt from 'jsonwebtoken'
 */
export class JWTHandler {
  static SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
  static EXPIRATION = 24 * 60 * 60; // 24 hours in seconds

  /**
   * Encode JWT token (simplified version)
   * In production, use: jwt.sign(payload, secret, { expiresIn: '24h' })
   */
  static encode(payload: any): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + this.EXPIRATION,
    };
    const body = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
    const signature = crypto
      .createHmac('sha256', this.SECRET)
      .update(`${header}.${body}`)
      .digest('base64');

    return `${header}.${body}.${signature}`;
  }

  /**
   * Decode JWT token (simplified version)
   * In production, use: jwt.verify(token, secret)
   */
  static decode(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [header, body, signature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', this.SECRET)
      .update(`${header}.${body}`)
      .digest('base64');

    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(body, 'base64').toString('utf-8'));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    return payload;
  }
}

/**
 * Middleware: Authenticate JWT token
 * Usage: app.use('/api/protected', authenticateToken)
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'AUTH_MISSING_TOKEN',
      message: 'No authentication token provided',
      code: 'AUTH_001',
      requestId: req.requestId,
    });
  }

  try {
    const decoded = JWTHandler.decode(token);
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'USER',
      tier: decoded.tier || 'FREE',
      iat: decoded.iat,
    };
    next();
  } catch (error: any) {
    let errorCode = 'AUTH_INVALID_TOKEN';
    let statusCode = 403;

    if (error.message === 'Token expired') {
      errorCode = 'AUTH_TOKEN_EXPIRED';
      statusCode = 401;
    } else if (error.message === 'Invalid token signature') {
      errorCode = 'AUTH_INVALID_SIGNATURE';
    } else if (error.message === 'Invalid token format') {
      errorCode = 'AUTH_MALFORMED_TOKEN';
    }

    return res.status(statusCode).json({
      success: false,
      error: errorCode,
      message: error.message,
      code: `AUTH_${statusCode}`,
      requestId: req.requestId,
    });
  }
};

/**
 * Middleware: Authorize by role(s)
 * Usage: app.post('/api/admin', authenticateToken, authorizeRole('ADMIN', 'FRANCHISE_OWNER'))
 */
export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_NOT_AUTHENTICATED',
        message: 'User not authenticated',
        code: 'AUTH_001',
        requestId: req.requestId,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'AUTH_INSUFFICIENT_PERMISSIONS',
        message: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
        code: 'AUTH_403',
        currentRole: req.user.role,
        requiredRoles: allowedRoles,
        requestId: req.requestId,
      });
    }

    next();
  };
};

/**
 * Middleware: Authorize by subscription tier
 * Usage: app.post('/api/premium', authenticateToken, authorizeTier('PRO', 'ELITE', 'ENTERPRISE'))
 */
export const authorizeTier = (...allowedTiers: string[]) => {
  // Tier hierarchy: FREE < STARTER < PRO < ELITE < ENTERPRISE
  const tierHierarchy: { [key: string]: number } = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
    ELITE: 3,
    ENTERPRISE: 4,
  };

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_NOT_AUTHENTICATED',
        message: 'User not authenticated',
        code: 'AUTH_001',
        requestId: req.requestId,
      });
    }

    const userTierLevel = tierHierarchy[req.user.tier] ?? -1;
    const requiredTierLevel = Math.min(
      ...allowedTiers.map((t) => tierHierarchy[t] ?? -1)
    );

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        success: false,
        error: 'AUTH_INSUFFICIENT_TIER',
        message: `This feature requires ${allowedTiers[0]} tier or higher`,
        code: 'AUTH_403',
        currentTier: req.user.tier,
        requiredTiers: allowedTiers,
        requestId: req.requestId,
      });
    }

    next();
  };
};

/**
 * Middleware: Session timeout
 * Expires user session after X minutes of inactivity
 * Usage: app.use(sessionTimeout(30))  // 30 minute timeout
 */
export const sessionTimeout = (timeoutMinutes: number = 30) => {
  const sessions = new Map<string, { lastActivity: number; user: any }>();

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.id;
    const now = Date.now();
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const session = sessions.get(userId);

    if (session) {
      const timeSinceLastActivity = now - session.lastActivity;

      if (timeSinceLastActivity > timeoutMs) {
        sessions.delete(userId);
        return res.status(401).json({
          success: false,
          error: 'SESSION_EXPIRED',
          message: `Session expired due to inactivity (${timeoutMinutes} minute timeout)`,
          code: 'AUTH_401',
          requestId: req.requestId,
        });
      }

      // Update last activity
      session.lastActivity = now;
    } else {
      // Create new session
      sessions.set(userId, {
        lastActivity: now,
        user: req.user,
      });
    }

    next();
  };
};

/**
 * Middleware: Rate limiting with user-based keys
 * Usage: app.use(rateLimitByUser(100, 60 * 60 * 1000))  // 100 requests per hour
 */
export const rateLimitByUser = (maxRequests: number = 100, windowMs: number = 60 * 60 * 1000) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = req.user?.id || req.ip || 'unknown';
    const now = Date.now();

    let data = requestCounts.get(key);

    if (!data || now > data.resetTime) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    data.count++;

    if (data.count > maxRequests) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());

      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000 / 60} minutes`,
        code: 'RATE_LIMIT_429',
        retryAfter,
        requestId: req.requestId,
      });
    }

    res.set('X-RateLimit-Limit', maxRequests.toString());
    res.set('X-RateLimit-Remaining', (maxRequests - data.count).toString());
    res.set('X-RateLimit-Reset', data.resetTime.toString());

    next();
  };
};

/**
 * Middleware: API Key validation
 * Part of PHASE 1 Security - Issue #1: API Key Exposure
 * Usage: app.use('/api/external', validateApiKey())
 */
export const validateApiKey = (headerName: string = 'x-api-key') => {
  const validKeys = new Map<string, { name: string; tier: string; active: boolean }>();

  // Load valid API keys from environment
  const apiKeysJson = process.env.API_KEYS || '{}';
  try {
    const keys = JSON.parse(apiKeysJson);
    for (const [key, value] of Object.entries(keys)) {
      validKeys.set(key, value as any);
    }
  } catch (err) {
    console.warn('⚠️  Failed to load API keys from environment');
  }

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers[headerName.toLowerCase()] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API_KEY_MISSING',
        message: `Missing API key in header: ${headerName}`,
        code: 'API_001',
        requestId: req.requestId,
      });
    }

    const keyData = validKeys.get(apiKey);

    if (!keyData || !keyData.active) {
      return res.status(401).json({
        success: false,
        error: 'API_KEY_INVALID',
        message: 'Invalid or inactive API key',
        code: 'API_002',
        requestId: req.requestId,
      });
    }

    // Attach API key data to request
    (req as any).apiKey = keyData;
    next();
  };
};

/**
 * Middleware: Verify CORS origin
 */
export const verifyCorsOrigin = (allowedOrigins: string[] = []) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const origin = req.headers['origin'];

    if (allowedOrigins.length === 0) {
      // Allow all if not configured
      next();
      return;
    }

    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({
        success: false,
        error: 'CORS_ORIGIN_NOT_ALLOWED',
        message: `Origin ${origin} is not allowed`,
        code: 'CORS_403',
        requestId: req.requestId,
      });
    }

    next();
  };
};

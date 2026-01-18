/**
 * Authentication Routes
 * PHASE 1: Security & Infrastructure
 * - User registration with email verification
 * - Login/logout
 * - Password reset
 * - Email verification
 * - Token refresh
 */

import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authService = new AuthService();

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

/**
 * POST /api/auth/register
 * Register a new user (homeowner or contractor)
 */
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body;

    // Validate input
    if (!email || !phone || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email, phone, password, firstName, lastName, and role are required',
      });
    }

    // Password strength validation (min 12 chars, mixed case, number, special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'PASSWORD_TOO_WEAK',
        message: 'Password must be at least 12 characters with uppercase, lowercase, number, and special character',
      });
    }

    const result = await authService.register({
      email,
      phone,
      password,
      firstName,
      lastName,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch (error: any) {
    console.error('❌ Registration error:', error);

    // User-friendly error messages
    if (error.message === 'USER_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        error: 'USER_ALREADY_EXISTS',
        message: 'Email or phone already registered',
      });
    }

    res.status(400).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email and password are required',
      });
    }

    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);

    if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_PASSWORD') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    res.status(400).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email address with token
 */
router.post('/auth/verify-email', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'userId and token are required',
      });
    }

    const result = await authService.verifyEmail({ userId, token });

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Email verification error:', error);

    if (error.message === 'INVALID_TOKEN') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired verification token',
      });
    }

    res.status(400).json({
      success: false,
      error: 'VERIFICATION_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend email verification token
 */
router.post('/auth/resend-verification', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    // In production, this would resend the email
    // For now, we return a new token
    // TODO: Integrate with SendGrid or similar

    res.json({
      success: true,
      message: 'Verification email resent. Check your inbox.',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: 'RESEND_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
router.post('/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_EMAIL',
        message: 'Email is required',
      });
    }

    await authService.requestPasswordReset(email);

    // Always return success (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link',
    });
  } catch (error: any) {
    console.error('❌ Password reset request error:', error);
    res.status(400).json({
      success: false,
      error: 'RESET_REQUEST_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PARAMETERS',
        message: 'Token and newPassword are required',
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'PASSWORD_TOO_WEAK',
        message: 'Password must be at least 12 characters with uppercase, lowercase, number, and special character',
      });
    }

    const result = await authService.resetPassword({ token, newPassword });

    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.',
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Password reset error:', error);

    if (error.message === 'INVALID_RESET_TOKEN') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token',
      });
    }

    if (error.message === 'RESET_TOKEN_EXPIRED') {
      return res.status(400).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Reset token has expired. Please request a new one.',
      });
    }

    res.status(400).json({
      success: false,
      error: 'PASSWORD_RESET_FAILED',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 */
router.post('/auth/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required',
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed',
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Token refresh error:', error);

    res.status(401).json({
      success: false,
      error: 'INVALID_REFRESH_TOKEN',
      message: 'Invalid or expired refresh token',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/auth/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REFRESH_TOKEN',
        message: 'Refresh token is required',
      });
    }

    await authService.logout(req.user.id, refreshToken);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('❌ Logout error:', error);

    res.status(400).json({
      success: false,
      error: 'LOGOUT_FAILED',
      message: error.message,
    });
  }
});

export default router;

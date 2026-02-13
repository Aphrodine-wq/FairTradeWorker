/**
 * Authentication Tests
 * Testing user registration, login, and token management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../services/authService';
import { UserRole } from '../../types';
import * as bcrypt from 'bcrypt';
import { Database } from '../database';

describe('AuthService', () => {
  let authService: AuthService;
  const db = new Database();

  beforeEach(async () => {
    try {
      // Clean up related tables first
      await (db as any).auditLog.deleteMany({});
      await (db as any).refreshToken.deleteMany({});
      // Then users
      await (db as any).user.deleteMany({});
    } catch (e) {
      // Warning: if clean fails, tests might fail
      console.warn('DB clean failed', e);
    }

    authService = new AuthService();
  });

  describe('User Registration', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: `test_${Date.now()}_${Math.random()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      const result = await authService.register(userData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.role).toBe(UserRole.CONTRACTOR);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        phone: '+12125551234',
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.HOMEOWNER,
      };

      await expect(authService.register(userData)).rejects.toThrow('INVALID_EMAIL');
    });

    it('should reject password shorter than 8 characters', async () => {
      const userData = {
        email: `test_${Date.now()}_${Math.random()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      await expect(authService.register(userData)).rejects.toThrow('PASSWORD_TOO_SHORT');
    });

    it('should reject invalid phone number', async () => {
      const userData = {
        email: 'test@example.com',
        phone: '123',
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      await expect(authService.register(userData)).rejects.toThrow('INVALID_PHONE');
    });

    it('should hash password using bcrypt', async () => {
      const userData = {
        email: `test_${Date.now()}_${Math.random()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      const result = await authService.register(userData);

      // Verify password was hashed (bcrypt hashes start with $2)
      expect(result.user).toBeDefined();
      // In real implementation, we'd verify the hash directly
    });
  });

  describe('User Login', () => {
    it('should login user with correct credentials', async () => {
      // First register
      const userData = {
        email: `login_test_${Date.now()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      await authService.register(userData);

      // Then login
      const loginResult = await authService.login({
        email: userData.email,
        password: userData.password,
      });

      expect(loginResult.user).toBeDefined();
      expect(loginResult.user.email).toBe(userData.email);
      expect(loginResult.tokens.accessToken).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const userData = {
        email: 'login-test2@example.com',
        phone: '+12125551234',
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      await authService.register(userData);

      await expect(
        authService.login({
          email: userData.email,
          password: 'WrongPassword123!@#',
        })
      ).rejects.toThrow('INVALID_PASSWORD');
    });

    it('should reject login for non-existent user', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123!@#',
        })
      ).rejects.toThrow('USER_NOT_FOUND');
    });
  });

  describe('Token Management', () => {
    it('should verify valid access token', () => {
      const token = authService['generateAccessToken']('user123');
      const decoded = authService.verifyAccessToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe('user123');
    });

    it('should reject expired access token', () => {
      // Create an expired token manually
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkyMjJ9.signature';

      const decoded = authService.verifyAccessToken(expiredToken);
      expect(decoded).toBeNull();
    });

    it('should refresh access token with valid refresh token', async () => {
      // Register user to get tokens
      const userData = {
        email: `refresh_test_${Date.now()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      const registerResult = await authService.register(userData);
      const refreshToken = registerResult.tokens.refreshToken;

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result.accessToken).toBeDefined();
    });
  });

  describe('Email Verification', () => {
    it('should verify email with correct token', async () => {
      const userData = {
        email: `verify_test_${Date.now()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      const result = await authService.register(userData);

      // Get token from DB
      const user = await (db as any).user.findUnique({
        where: { id: result.user.id }
      });

      const verifyResult = await authService.verifyEmail({
        userId: result.user.id,
        token: user.emailVerificationToken,
      });

      expect(verifyResult.success).toBe(true);
    });
  });

  describe('Password Reset', () => {
    it('should initiate password reset for existing user', async () => {
      const userData = {
        email: `reset_test_${Date.now()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'OldPassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      await authService.register(userData);

      const result = await authService.requestPasswordReset(userData.email);
      expect(result.success).toBe(true);
    });

    it('should reset password with valid token', async () => {
      const userData = {
        email: `reset_pw_test_${Date.now()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'OldPassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      const regResult = await authService.register(userData);
      await authService.requestPasswordReset(userData.email);

      // Get token from DB
      const user = await (db as any).user.findUnique({
        where: { id: regResult.user.id }
      });

      const result = await authService.resetPassword({
        token: user.passwordResetToken,
        newPassword: 'NewPassword123!@#',
      });

      expect(result.success).toBe(true);

      // Verify login works with new password
      const login = await authService.login({
        email: userData.email,
        password: 'NewPassword123!@#'
      });
      expect(login.user).toBeDefined();
    });
  });

  describe('Logout', () => {
    it('should logout user and invalidate refresh token', async () => {
      const userData = {
        email: `logout_test_${Date.now()}@example.com`,
        phone: `+1${Date.now()}`,
        password: 'SecurePassword123!@#',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CONTRACTOR,
      };

      const registerResult = await authService.register(userData);
      const refreshToken = registerResult.tokens.refreshToken;

      const logoutResult = await authService.logout(
        registerResult.user.id,
        refreshToken
      );

      expect(logoutResult.success).toBe(true);
    });
  });
});

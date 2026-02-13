import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Database } from '../database';
import { UserRole, UserProfile } from '../../types';

/**
 * AuthService
 * Handles user authentication, registration, and session management
 * - User registration (email/phone)
 * - Login/password verification
 * - JWT token generation and validation
 * - Phone number verification (OTP)
 * - Email verification
 * - Token refresh mechanism
 * - Password reset flow
 */
export class AuthService {
  private db: Database;
  private jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_for_production';
  private jwtExpiry = '24h';
  private refreshTokenExpiry = '7d';

  constructor() {
    this.db = new Database();
  }

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }): Promise<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }> {
    try {
      // Validate input
      if (!this.isValidEmail(data.email)) {
        throw new Error('INVALID_EMAIL');
      }
      if (!this.isValidPhone(data.phone)) {
        throw new Error('INVALID_PHONE');
      }
      if (data.password.length < 8) {
        throw new Error('PASSWORD_TOO_SHORT');
      }

      // Check if user already exists
      const existingUser = await this.db.users.findOne({
        $or: [{ email: data.email }, { phone: data.phone }],
      });

      if (existingUser) {
        throw new Error('USER_ALREADY_EXISTS');
      }

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Create user
      const user: UserProfile = {
        id: `user_${Date.now()}`,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        role: data.role,
        tier: 'FREE',
        preferences: {
          aiPersonality: 'PROFESSIONAL',
          verbosity: 'CONCISE',
          theme: 'SYSTEM',
        },
      };

      const userRecord = {
        // ...user, // Don't spread user as it contains 'name' which is not in schema
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
        preferences: user.preferences,
        passwordHash,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerified: false,
        phoneVerified: false,
        emailVerificationToken: crypto.randomBytes(32).toString('hex'),
        phoneVerificationCode: this.generateOTP(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await this.db.users.insert(userRecord);

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token
      await this.storeRefreshToken(user.id, refreshToken);

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        createdAt: new Date().toISOString(),
        action: 'USER_REGISTERED',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        changes: { email: data.email, role: data.role },
      });

      return {
        user,
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: { email: string; password: string }): Promise<{
    user: UserProfile;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    try {
      // Find user
      const userRecord = await this.db.users.findOne({ email: data.email });

      if (!userRecord) {
        throw new Error('USER_NOT_FOUND');
      }

      // Verify password
      const passwordValid = await this.verifyPassword(data.password, userRecord.passwordHash);
      if (!passwordValid) {
        throw new Error('INVALID_PASSWORD');
      }

      // Create user profile object
      const user: UserProfile = {
        id: userRecord.id,
        name: userRecord.firstName ? `${userRecord.firstName} ${userRecord.lastName}` : (userRecord as any).name,
        email: userRecord.email,
        role: userRecord.role,
        tier: userRecord.tier,
        preferences: userRecord.preferences,
      };

      // Generate tokens
      const accessToken = this.generateAccessToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token
      await this.storeRefreshToken(user.id, refreshToken);

      // Update last login
      await this.db.users.update(userRecord.id, {
        ...userRecord,
        lastLogin: new Date().toISOString(),
      });

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        createdAt: new Date().toISOString(),
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        changes: { email: data.email },
      });

      return {
        user,
        tokens: { accessToken, refreshToken },
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  }

  /**
   * Verify phone number with OTP
   */
  async verifyPhone(data: {
    userId: string;
    otp: string;
  }): Promise<{ success: boolean }> {
    try {
      const user = await this.db.users.findById(data.userId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.phoneVerificationCode !== data.otp) {
        throw new Error('INVALID_OTP');
      }

      // Mark as verified
      await this.db.users.update(data.userId, {
        ...user,
        phoneVerified: true,
        phoneVerificationCode: null,
      });

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        createdAt: new Date().toISOString(),
        action: 'PHONE_VERIFIED',
        entity: 'User',
        entityId: data.userId,
        userId: data.userId,
        changes: {},
      });

      return { success: true };
    } catch (error) {
      console.error('Error verifying phone:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: { userId: string; token: string }): Promise<{ success: boolean }> {
    try {
      const user = await this.db.users.findById(data.userId);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (user.emailVerificationToken !== data.token) {
        throw new Error('INVALID_TOKEN');
      }

      // Mark as verified
      await this.db.users.update(data.userId, {
        ...user,
        emailVerified: true,
        emailVerificationToken: null,
      });

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        createdAt: new Date().toISOString(),
        action: 'EMAIL_VERIFIED',
        entity: 'User',
        entityId: data.userId,
        userId: data.userId,
        changes: {},
      });

      return { success: true };
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      if (!decoded) {
        throw new Error('INVALID_REFRESH_TOKEN');
      }

      // Check if token is stored and valid
      const storedToken = await this.db.refreshTokens.findOne({
        userId: decoded.sub,
        token: refreshToken,
      });

      if (!storedToken) {
        throw new Error('REFRESH_TOKEN_NOT_FOUND');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(decoded.sub);

      return { accessToken };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string, refreshToken: string): Promise<{ success: boolean }> {
    try {
      // Delete refresh token
      const token = await this.db.refreshTokens.findOne({
        userId,
        token: refreshToken,
      });

      if (token) {
        await this.db.refreshTokens.delete(token.id);
      }

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        createdAt: new Date().toISOString(),
        action: 'USER_LOGOUT',
        entity: 'User',
        entityId: userId,
        userId,
        changes: {},
      });

      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    try {
      const user = await this.db.users.findOne({ email });

      if (!user) {
        // Don't reveal if email exists for security
        return { success: true };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await this.db.users.update(user.id, {
        ...user,
        passwordResetToken: resetToken,
        passwordResetTokenExpiry: resetTokenExpiry.toISOString(),
      });

      // In production, send email with reset link
      // await emailService.sendPasswordResetEmail(email, resetToken);

      console.log(`[EMAIL] Password reset link: /reset-password/${resetToken}`);

      return { success: true };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: { token: string; newPassword: string }): Promise<{ success: boolean }> {
    try {
      if (data.newPassword.length < 8) {
        throw new Error('PASSWORD_TOO_SHORT');
      }

      const user = await this.db.users.findOne({ passwordResetToken: data.token });

      if (!user) {
        throw new Error('INVALID_RESET_TOKEN');
      }

      // Check token expiry
      if (new Date(user.passwordResetTokenExpiry) < new Date()) {
        throw new Error('RESET_TOKEN_EXPIRED');
      }

      // Hash new password
      const passwordHash = await this.hashPassword(data.newPassword);

      // Update user
      await this.db.users.update(user.id, {
        ...user,
        passwordHash,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      });

      // Create audit log
      await this.db.auditLogs.insert({
        id: `log_${Date.now()}`,
        createdAt: new Date().toISOString(),
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        changes: {},
      });

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): { sub: string; iat: number } | null {
    try {
      // Simple JWT-like verification (in production, use jsonwebtoken library)
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp < now) {
        return null; // Token expired
      }

      return { sub: decoded.sub, iat: decoded.iat };
    } catch (error) {
      console.error('Error verifying access token:', error);
      return null;
    }
  }

  /**
   * Get user by ID (for authorization middleware)
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      const user = await this.db.users.findById(userId);
      if (!user) return null;

      return {
        id: user.id,
        name: user.firstName ? `${user.firstName} ${user.lastName}` : (user as any).name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        preferences: user.preferences,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // ===== PRIVATE HELPERS =====

  private generateAccessToken(userId: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(
      JSON.stringify({
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      })
    ).toString('base64');

    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64');

    return `${header}.${payload}.${signature}`;
  }

  private generateRefreshToken(userId: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(
      JSON.stringify({
        sub: userId,
        jti: crypto.randomUUID(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        type: 'refresh',
      })
    ).toString('base64');

    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64');

    return `${header}.${payload}.${signature}`;
  }

  private verifyRefreshToken(token: string): { sub: string; iat: number } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      const now = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp < now) {
        return null;
      }

      if (decoded.type !== 'refresh') {
        return null;
      }

      return { sub: decoded.sub, iat: decoded.iat };
    } catch (error) {
      return null;
    }
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.db.refreshTokens.insert({
      id: `token_${Date.now()}`,
      userId,
      token,
      expiresAt: expiryDate.toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  async hashPassword(password: string): Promise<string> {
    // Use bcrypt with cost factor 10 (OWASP recommended)
    return await bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Secure password comparison using bcrypt
    return await bcrypt.compare(password, hash);
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Accept 10+ digit phone numbers
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
  }

  private generateOTP(): string {
    // 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

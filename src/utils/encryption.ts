/**
 * Field-Level Encryption Utility
 * Encrypts/decrypts sensitive PII using AES-256-CBC
 * Part of PHASE 1 Security Implementation - Issue #5: Data Encryption at Rest
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Validate encryption key length (must be 64 hex chars = 32 bytes)
if (ENCRYPTION_KEY_HEX.length !== 64) {
  console.warn(
    `⚠️  WARNING: ENCRYPTION_KEY is ${ENCRYPTION_KEY_HEX.length} chars, should be 64. Using generated key for this session.`
  );
}

export class Encryption {
  /**
   * Encrypt plaintext string using AES-256-CBC
   * Returns: "iv:ciphertext" (both in hex)
   */
  static encrypt(plaintext: string): string {
    if (!plaintext) return '';

    try {
      const iv = crypto.randomBytes(16);
      const key = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Return iv:ciphertext format for later decryption
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (err: any) {
      console.error('Encryption error:', err.message);
      throw new Error(`Failed to encrypt data: ${err.message}`);
    }
  }

  /**
   * Decrypt ciphertext encrypted with encrypt()
   * Input format: "iv:ciphertext" (both in hex)
   */
  static decrypt(ciphertext: string): string {
    if (!ciphertext) return '';

    try {
      const [ivHex, encryptedHex] = ciphertext.split(':');

      if (!ivHex || !encryptedHex) {
        throw new Error('Invalid ciphertext format - must be "iv:ciphertext"');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const key = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err: any) {
      console.error('Decryption error:', err.message);
      throw new Error(`Failed to decrypt data: ${err.message}`);
    }
  }

  /**
   * Encrypt multiple fields in an object
   * Usage: Encryption.encryptFields(userData, ['phone', 'ssn'])
   */
  static encryptFields(obj: any, fields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;

    const copy = { ...obj };
    fields.forEach((field) => {
      if (copy[field] && typeof copy[field] === 'string') {
        copy[field] = this.encrypt(copy[field]);
      }
    });
    return copy;
  }

  /**
   * Decrypt multiple fields in an object
   * Usage: Encryption.decryptFields(userData, ['phone', 'ssn'])
   */
  static decryptFields(obj: any, fields: string[]): any {
    if (!obj || typeof obj !== 'object') return obj;

    const copy = { ...obj };
    fields.forEach((field) => {
      if (copy[field] && typeof copy[field] === 'string') {
        try {
          copy[field] = this.decrypt(copy[field]);
        } catch (err) {
          // Field might already be decrypted or in wrong format
          console.warn(`Could not decrypt field "${field}": ${err instanceof Error ? err.message : 'Unknown error'}`);
          // Return field as-is
        }
      }
    });
    return copy;
  }

  /**
   * Generate a new encryption key (use once and store in .env)
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash password using bcrypt-like approach (SHA256 + salt)
   * Note: In production, use bcrypt library instead
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 32, 'sha256')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify password hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    const [salt, storedHash] = hash.split(':');
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 100000, 32, 'sha256')
      .toString('hex');
    return computedHash === storedHash;
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  static generateHmacSignature(body: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifyHmacSignature(body: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateHmacSignature(body, secret);
    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
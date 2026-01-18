/**
 * Environment Validation System
 * Ensures all required environment variables are present and valid
 * Part of PHASE 1 Security Implementation - Issue #1: API Key Exposure
 */

export class EnvironmentValidator {
  /**
   * Validate production environment variables on startup
   * Throws error if any critical variable is missing
   */
  static validateProductionEnv(): void {
    const requiredVars = {
      PORT: { type: 'number', default: 3001 },
      NODE_ENV: { type: 'string', values: ['development', 'staging', 'production'] },
      JWT_SECRET: { type: 'string', minLength: 32 },
      DATABASE_URL: { type: 'string', startsWith: 'postgresql://' },
      CORS_ORIGIN: { type: 'string' },
      GEMINI_API_KEY: { type: 'string', startsWith: 'AIzaSy' },
      STRIPE_SECRET_KEY: { type: 'string', startsWith: 'sk_' },
      STRIPE_WEBHOOK_SECRET: { type: 'string', startsWith: 'whsec_' },
      TWILIO_ACCOUNT_SID: { type: 'string' },
      TWILIO_AUTH_TOKEN: { type: 'string', minLength: 32 },
      ENCRYPTION_KEY: { type: 'string', minLength: 64 }, // 32 bytes = 64 hex chars
    };

    const missing: string[] = [];
    const invalid: { var: string; reason: string }[] = [];

    for (const [varName, config] of Object.entries(requiredVars)) {
      const value = process.env[varName];

      // Check if variable exists
      if (!value) {
        // Skip optional fields with defaults in non-production
        if (config.default && process.env.NODE_ENV !== 'production') {
          continue;
        }
        missing.push(varName);
        continue;
      }

      // Validate minimum length
      if (config.minLength && value.length < config.minLength) {
        invalid.push({
          var: varName,
          reason: `must be at least ${config.minLength} characters (got ${value.length})`,
        });
      }

      // Validate prefix
      if (config.startsWith && !value.startsWith(config.startsWith)) {
        invalid.push({
          var: varName,
          reason: `must start with '${config.startsWith}'`,
        });
      }

      // Validate allowed values
      if (config.values && !config.values.includes(value)) {
        invalid.push({
          var: varName,
          reason: `must be one of: ${config.values.join(', ')} (got '${value}')`,
        });
      }
    }

    // Report all issues
    const allIssues: string[] = [];

    if (missing.length > 0) {
      allIssues.push(`Missing required environment variables:\n  - ${missing.join('\n  - ')}`);
    }

    if (invalid.length > 0) {
      allIssues.push(
        `Invalid environment variables:\n  ${invalid
          .map((i) => `- ${i.var}: ${i.reason}`)
          .join('\n  ')}`
      );
    }

    if (allIssues.length > 0) {
      const isProduction = process.env.NODE_ENV === 'production';
      const errorMessage = `\n❌ CRITICAL: Environment validation failed:\n\n${allIssues.join('\n\n')}\n\nPlease check your .env file and set all required variables.`;

      console.error(errorMessage);

      if (isProduction) {
        throw new Error(`Environment validation failed: ${missing.length} missing, ${invalid.length} invalid`);
      } else {
        console.warn('⚠️  WARNING: Running with incomplete environment configuration (dev mode)');
      }
    } else {
      console.log('✅ Environment validation passed - all required variables present and valid');
    }
  }

  /**
   * Validate development environment variables
   * Less strict than production validation
   */
  static validateDevEnv(): void {
    const recommendedVars = [
      'JWT_SECRET',
      'GEMINI_API_KEY',
      'DATABASE_URL',
      'STRIPE_SECRET_KEY',
      'ENCRYPTION_KEY',
    ];

    const missing = recommendedVars.filter((v) => !process.env[v]);

    if (missing.length > 0) {
      console.warn(`⚠️  Development mode: Missing recommended variables: ${missing.join(', ')}`);
      console.warn('   Using mock/default values for these. Do not use in production!');
    }
  }

  /**
   * Get validated environment variable with fallback
   */
  static getEnv(varName: string, fallback?: string): string {
    const value = process.env[varName];
    if (!value && !fallback) {
      throw new Error(`Environment variable ${varName} not found and no fallback provided`);
    }
    return value || fallback || '';
  }

  /**
   * Get environment variable as number
   */
  static getEnvNumber(varName: string, fallback?: number): number {
    const value = process.env[varName];
    if (!value && fallback === undefined) {
      throw new Error(`Environment variable ${varName} not found and no fallback provided`);
    }
    return value ? parseInt(value, 10) : fallback || 0;
  }

  /**
   * Get environment variable as boolean
   */
  static getEnvBoolean(varName: string, fallback?: boolean): boolean {
    const value = process.env[varName];
    if (!value && fallback === undefined) {
      throw new Error(`Environment variable ${varName} not found and no fallback provided`);
    }
    return value ? value.toLowerCase() === 'true' : fallback || false;
  }
}

/**
 * Initialize validation on module load
 */
export function initializeEnvironment(): void {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production' || env === 'staging') {
    EnvironmentValidator.validateProductionEnv();
  } else {
    EnvironmentValidator.validateDevEnv();
  }

  console.log(`✅ Running in ${env} mode`);
}

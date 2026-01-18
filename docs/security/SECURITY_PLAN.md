# PHASE 1: Security Hardening & Foundation (1-2 Weeks)

**Priority:** CRITICAL 🔴
**Timeline:** 7-10 working days
**Owner:** Engineering Lead
**Goal:** Fix all 6 critical security vulnerabilities and establish secure foundation

---

## Executive Summary

PHASE 1 is the blocking issue. Nothing goes to production until these 6 critical vulnerabilities are fixed. This document provides step-by-step remediation for each issue.

**6 Critical Issues to Fix:**
1. API Key Exposure & Fallback
2. Authentication & JWT Validation
3. Input Validation & Sanitization
4. Payment Security & Atomicity
5. Data Encryption at Rest
6. Third-Party Webhook Verification

---

## Issue #1: API Key Exposure Risk ⚠️

**File:** `services/geminiService.ts:5-9`
**Severity:** CRITICAL
**Impact:** API key exposed in logs, error messages, or bundle

### Current Vulnerable Code
```typescript
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const IS_MOCK_MODE = !API_KEY || API_KEY === 'mock_key_for_development' || API_KEY === 'undefined';
const ai = new GoogleGenAI({ apiKey: API_KEY || 'mock_key' });
```

### Problems
- Fallback to `'mock_key'` is a security antipattern
- No validation that key exists before use
- No error logging (could expose key)
- Production code accepts test keys

### Remediation Steps

**Step 1.1: Create environment validator**
```typescript
// src/config/validateEnv.ts
export class EnvironmentValidator {
  static validateProductionEnv() {
    const requiredVars = [
      'GEMINI_API_KEY',
      'JWT_SECRET',
      'DATABASE_URL',
      'STRIPE_SECRET_KEY'
    ];

    const missing = requiredVars.filter(v => !process.env[v]);

    if (missing.length > 0) {
      throw new Error(
        `❌ CRITICAL: Missing required environment variables in ${process.env.NODE_ENV}:\n` +
        missing.map(v => `  - ${v}`).join('\n') +
        '\n\nAborting startup. Cannot proceed without these variables.'
      );
    }

    // Validate format
    if (!process.env.GEMINI_API_KEY?.startsWith('AIzaSy')) {
      throw new Error('❌ GEMINI_API_KEY has invalid format (should start with AIzaSy)');
    }

    if (process.env.JWT_SECRET?.length < 32) {
      throw new Error('❌ JWT_SECRET must be at least 32 characters');
    }
  }

  static isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }
}
```

**Step 1.2: Update geminiService.ts**
```typescript
// services/geminiService.ts
import { EnvironmentValidator } from '../src/config/validateEnv';

// Validate on module load (before creating client)
if (EnvironmentValidator.isProduction()) {
  EnvironmentValidator.validateProductionEnv();
}

const API_KEY = process.env.GEMINI_API_KEY;

// Explicit error if no key
if (!API_KEY) {
  if (EnvironmentValidator.isProduction()) {
    throw new Error('❌ GEMINI_API_KEY required in production');
  }
  console.warn('⚠️ GEMINI_API_KEY not set, running in mock mode');
}

// Create client (fails hard if no key in production)
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Export helper
export const isUsingMockMode = !API_KEY;

// All functions check this
export async function analyzeJobMultimodal(data: any) {
  if (!ai) {
    if (EnvironmentValidator.isProduction()) {
      throw new Error('AI service unavailable - API key missing');
    }
    return MOCK_DATA.jobAnalysis;
  }
  // ... real implementation
}
```

**Step 1.3: Update .env.example**
```bash
# .env.example
# REQUIRED in production
GEMINI_API_KEY=AIzaSy... (get from Google Cloud Console)
JWT_SECRET=your_secret_at_least_32_chars_long (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
DATABASE_URL=postgresql://user:pass@localhost:5432/fairtradeworker

# STRIPE (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_test_... or whsec_live_...

# OPTIONAL
NODE_ENV=development (or production)
PORT=3001
FRONTEND_URL=http://localhost:3000
```

**Step 1.4: Startup script validation**
```typescript
// backend/startup.ts - call this in server.ts before starting
import { EnvironmentValidator } from '../src/config/validateEnv';

export async function validateStartup() {
  console.log('🔒 Validating security configuration...');

  try {
    if (EnvironmentValidator.isProduction()) {
      EnvironmentValidator.validateProductionEnv();
      console.log('✅ All required environment variables present');
    } else {
      console.log('ℹ️ Development mode - using mock data where needed');
    }
  } catch (err) {
    console.error('❌ STARTUP FAILED:', err.message);
    process.exit(1);
  }
}
```

**Step 1.5: Update server.ts**
```typescript
// backend/server.ts (top of file)
import { validateStartup } from './startup';

// Run before anything else
(async () => {
  await validateStartup();

  const app = express();
  // ... rest of server setup

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
})();
```

**Testing this fix:**
```bash
# Test 1: Missing API key in production
NODE_ENV=production npm start
# Expected: ❌ CRITICAL: Missing required environment variables

# Test 2: Invalid key format
GEMINI_API_KEY=wrong_format NODE_ENV=production npm start
# Expected: ❌ GEMINI_API_KEY has invalid format

# Test 3: Valid key in development
GEMINI_API_KEY=AIzaSy... NODE_ENV=development npm start
# Expected: ✅ Server running on port 3001
```

---

## Issue #2: Authentication & JWT Validation ⚠️

**Files:**
- `backend/server.ts` (no middleware)
- `src/hooks/useAuth.tsx` (client-side only)

**Severity:** CRITICAL
**Impact:** Any user can access protected endpoints (no authorization)

### Current Vulnerable Code
```typescript
// backend/server.ts
app.post('/api/contracts', async (req: Request, res: Response) => {
  // NO AUTHENTICATION CHECK! Anyone can create contracts
  const { jobId, contractorId, bidAmount, homeownerId } = req.body;
  const contract = await bidContractService.createContract({...});
});
```

### Problems
- No JWT validation on protected routes
- No role-based access control (RBAC)
- Client can impersonate any user
- Contractors can access other contractors' data

### Remediation Steps

**Step 2.1: Create authentication middleware**
```typescript
// backend/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    tier: string;
  };
  token?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'AUTH_MISSING_TOKEN',
      message: 'Authorization token required',
      code: 'AUTH_001'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tier: decoded.tier
    };
    req.token = token;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'AUTH_TOKEN_EXPIRED',
        message: 'Token has expired',
        code: 'AUTH_002'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'AUTH_INVALID_TOKEN',
      message: 'Invalid or malformed token',
      code: 'AUTH_003'
    });
  }
}

export function authorizeRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_MISSING_USER',
        message: 'User not authenticated',
        code: 'AUTH_004'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'AUTH_INSUFFICIENT_PERMISSION',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}`,
        code: 'AUTH_005',
        details: { userRole: req.user.role, requiredRoles: allowedRoles }
      });
    }

    next();
  };
}

export function authorizeTier(...allowedTiers: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_MISSING_USER',
        message: 'User not authenticated',
        code: 'AUTH_004'
      });
    }

    if (!allowedTiers.includes(req.user.tier)) {
      return res.status(402).json({
        success: false,
        error: 'AUTH_INSUFFICIENT_TIER',
        message: `This feature requires a higher tier: ${allowedTiers.join(', ')}`,
        code: 'AUTH_006',
        details: { currentTier: req.user.tier, requiredTiers: allowedTiers }
      });
    }

    next();
  };
}
```

**Step 2.2: Protect routes in server.ts**
```typescript
// backend/server.ts
import { authenticateToken, authorizeRole, authorizeTier, AuthRequest } from './middleware/auth';

// Apply auth to all protected routes
app.use('/api/contracts', authenticateToken);
app.use('/api/jobs', authenticateToken);
app.use('/api/bids', authenticateToken);
app.use('/api/wallet', authenticateToken);
app.use('/api/profile', authenticateToken);

// ========== PROTECTED ROUTES ==========

// Create contract - only contractors & admins
app.post('/api/contracts',
  authenticateToken,
  authorizeRole('CONTRACTOR', 'ADMIN'),
  async (req: AuthRequest, res: Response) => {
    const { jobId, contractorId, bidAmount, homeownerId, scopeOfWork, materialsList, paymentTerms } = req.body;

    // Verify contractor owns the bid they're creating contract from
    if (req.user!.role === 'CONTRACTOR' && req.user!.id !== contractorId) {
      return res.status(403).json({
        success: false,
        error: 'PERMISSION_DENIED',
        message: 'You can only create contracts for your own bids',
        code: 'AUTH_007'
      });
    }

    try {
      const contract = await bidContractService.createContract({
        jobId,
        contractorId,
        bidAmount,
        homeownerId,
        scopeOfWork: scopeOfWork || [],
        materialsList: materialsList || [],
        paymentTerms: paymentTerms || { ... }
      });

      res.json({ success: true, data: contract });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// Get user's contracts
app.get('/api/contracts',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      // Only return contracts user is involved in
      const contracts = await bidContractService.getContractsByUser(req.user!.id, req.user!.role);
      res.json({ success: true, data: contracts });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// Post a job - only homeowners
app.post('/api/jobs',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  async (req: AuthRequest, res: Response) => {
    const { title, description, category, location, budgetRange, images, videos } = req.body;

    try {
      const job = await jobService.createJob({
        title,
        description,
        category,
        location,
        budgetRange,
        images,
        videos,
        homeownerId: req.user!.id, // Force homeowner ID from token
        postedDate: new Date().toISOString()
      });

      res.json({ success: true, data: job });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

// Premium features - tier gating
app.get('/api/analytics/advanced',
  authenticateToken,
  authorizeTier('PRO', 'ELITE', 'ENTERPRISE'),
  async (req: AuthRequest, res: Response) => {
    // Only PRO/ELITE/ENTERPRISE see advanced analytics
    const analytics = await analyticsService.getAdvanced(req.user!.id);
    res.json({ success: true, data: analytics });
  }
);
```

**Step 2.3: Session timeout middleware**
```typescript
// backend/middleware/sessionTimeout.ts
export function sessionTimeout(idleTimeoutMinutes = 30) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    // Check token expiration in payload
    const tokenCreatedAt = req.user.iat; // From JWT
    const now = Math.floor(Date.now() / 1000);
    const sessionAge = now - tokenCreatedAt;
    const sessionTimeoutSeconds = idleTimeoutMinutes * 60;

    if (sessionAge > sessionTimeoutSeconds) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_SESSION_EXPIRED',
        message: 'Your session has expired due to inactivity',
        code: 'AUTH_008'
      });
    }

    next();
  };
}

// Apply to all protected routes
app.use('/api/', authenticateToken, sessionTimeout(30));
```

**Testing this fix:**
```bash
# Test 1: Call without token
curl http://localhost:3001/api/contracts
# Expected: 401 "Authorization token required"

# Test 2: Call with invalid token
curl -H "Authorization: Bearer invalid_token" http://localhost:3001/api/contracts
# Expected: 403 "Invalid or malformed token"

# Test 3: Call with valid token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login -d '{"email":"test@example.com","password":"Test123"}' | jq -r '.data.accessToken')
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/contracts
# Expected: 200 with contracts list

# Test 4: Contractor can't access admin route
curl -H "Authorization: Bearer $CONTRACTOR_TOKEN" http://localhost:3001/api/admin/users
# Expected: 403 "Insufficient permissions"
```

---

## Issue #3: Input Validation & Sanitization ⚠️

**Files:** `backend/server.ts` (all POST/PUT endpoints)
**Severity:** HIGH
**Impact:** SQL injection, XSS, DoS attacks

### Current Vulnerable Code
```typescript
app.post('/api/contracts', async (req: Request, res: Response) => {
  const { jobId, contractorId, bidAmount, homeownerId } = req.body;
  if (!jobId || !contractorId || !bidAmount || !homeownerId) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  // NO VALIDATION! What if bidAmount is negative? What if jobId is SQL?
  await bidContractService.createContract({...});
});
```

### Remediation Steps

**Step 3.1: Install validation library**
```bash
npm install zod joi express-validator sanitize-html
npm install --save-dev @types/sanitize-html
```

**Step 3.2: Create validation schemas**
```typescript
// backend/validators/schemas.ts
import { z } from 'zod';
import { UserRole, UserTier } from '../../types';

// ===== SHARED SCHEMAS =====
const UUIDSchema = z.string().uuid('Invalid ID format');
const MoneySchema = z.number().positive('Amount must be positive').max(999999, 'Amount too large');
const EmailSchema = z.string().email('Invalid email format');

// ===== CONTRACT SCHEMAS =====
export const CreateContractSchema = z.object({
  jobId: UUIDSchema,
  contractorId: UUIDSchema,
  bidAmount: MoneySchema,
  homeownerId: UUIDSchema,
  scopeOfWork: z.array(z.string().max(500)).optional(),
  materialsList: z.array(z.string().max(200)).optional(),
  paymentTerms: z.object({
    totalAmount: MoneySchema,
    deposit: MoneySchema,
    depositPercentage: z.number().min(0).max(100),
    finalPayment: MoneySchema,
    finalPaymentPercentage: z.number().min(0).max(100)
  }).optional()
});

// ===== JOB SCHEMAS =====
export const CreateJobSchema = z.object({
  title: z.string().min(5, 'Title too short').max(200, 'Title too long'),
  description: z.string().min(20, 'Description too short').max(5000, 'Description too long'),
  category: z.enum(['Plumbing', 'Electrical', 'Carpentry', 'HVAC', 'Painting', 'Appliances', 'Roofing', 'Other']),
  location: z.string().min(5, 'Location required').max(200),
  budgetRange: z.string().regex(/^\$[\d,]+\s*-\s*\$[\d,]+$/, 'Invalid budget format'),
  images: z.array(z.string().url()).max(10, 'Max 10 images'),
  videos: z.array(z.string().url()).max(3, 'Max 3 videos').optional(),
  propertyType: z.enum(['House', 'Condo', 'Apartment', 'Commercial']).optional(),
  timing: z.enum(['Immediately', 'Flexible', 'Future']).optional()
});

// ===== BID SCHEMAS =====
export const SubmitBidSchema = z.object({
  jobId: UUIDSchema,
  amount: MoneySchema,
  timeline: z.string().min(5).max(200),
  coverLetter: z.string().max(1000).optional()
});

// ===== AUTH SCHEMAS =====
export const RegisterSchema = z.object({
  email: EmailSchema,
  password: z.string()
    .min(8, 'Password at least 8 characters')
    .regex(/[A-Z]/, 'Must include uppercase')
    .regex(/[a-z]/, 'Must include lowercase')
    .regex(/[0-9]/, 'Must include number')
    .regex(/[!@#$%]/, 'Must include special char'),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  role: z.enum(Object.values(UserRole))
});

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password required')
});
```

**Step 3.3: Create validation middleware**
```typescript
// backend/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import sanitizeHtml from 'sanitize-html';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate
      const validated = schema.parse(req.body);

      // Sanitize string fields
      const sanitized = sanitizeStringFields(validated);

      req.body = sanitized;
      next();
    } catch (error: any) {
      const issues = error.errors?.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message
      })) || [];

      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        code: 'VAL_001',
        details: issues
      });
    }
  };
}

function sanitizeStringFields(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {}
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeStringFields);
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce((acc, [key, val]) => {
      acc[key] = sanitizeStringFields(val);
      return acc;
    }, {} as any);
  }
  return obj;
}
```

**Step 3.4: Apply validation to routes**
```typescript
// backend/server.ts
import { validate } from './middleware/validate';
import { CreateContractSchema, CreateJobSchema, SubmitBidSchema } from './validators/schemas';

// POST /api/contracts
app.post('/api/contracts',
  authenticateToken,
  validate(CreateContractSchema),
  async (req: AuthRequest, res: Response) => {
    // req.body is now validated and sanitized
    const contract = await bidContractService.createContract(req.body);
    res.json({ success: true, data: contract });
  }
);

// POST /api/jobs
app.post('/api/jobs',
  authenticateToken,
  authorizeRole('HOMEOWNER'),
  validate(CreateJobSchema),
  async (req: AuthRequest, res: Response) => {
    const job = await jobService.createJob({
      ...req.body,
      homeownerId: req.user!.id,
      postedDate: new Date().toISOString()
    });
    res.json({ success: true, data: job });
  }
);

// POST /api/bids
app.post('/api/bids',
  authenticateToken,
  authorizeRole('CONTRACTOR'),
  validate(SubmitBidSchema),
  async (req: AuthRequest, res: Response) => {
    const bid = await bidService.submitBid({
      ...req.body,
      contractorId: req.user!.id
    });
    res.json({ success: true, data: bid });
  }
);
```

**Testing this fix:**
```bash
# Test 1: Invalid email
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"Test123!","firstName":"John","lastName":"Doe","role":"CONTRACTOR"}'
# Expected: 400 "Invalid email format"

# Test 2: Negative amount
curl -X POST http://localhost:3001/api/contracts \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"jobId":"...","contractorId":"...","bidAmount":-100,...}'
# Expected: 400 "Amount must be positive"

# Test 3: HTML injection attempt
curl -X POST http://localhost:3001/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"<script>alert(1)</script>Job","description":"...","category":"Plumbing","location":"NYC","budgetRange":"$100-$500"}'
# Expected: 400 (invalid title format) or sanitized

# Test 4: Valid data
curl -X POST http://localhost:3001/api/contracts \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"jobId":"123e4567-e89b-12d3-a456-426614174000","contractorId":"...","bidAmount":5000,...}'
# Expected: 200 with contract created
```

---

## Next Steps After Core Security

Once these 3 issues are resolved:
- Issue #4: Payment Security (escrow, atomicity, idempotency)
- Issue #5: Data Encryption (fields: email, phone, SSN, passwords)
- Issue #6: Webhook Verification (Stripe, Twilio, SendGrid)

Then move to **PHASE 2: Database & Core Features**

---

**PHASE 1 Timeline Estimate:**
- API Key validation: 1 hour
- JWT middleware: 2 hours
- Input validation: 2 hours
- Testing all 3: 1.5 hours
- **Total: ~6.5 hours (1 day for thorough implementation)**

---


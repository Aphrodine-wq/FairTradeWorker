# Quick Reference Card

**FairTradeWorker Developer Quick Reference**
**Keep this handy while developing!**

---

## 🚀 Getting Started

```bash
# Install & Start Backend
npm install
npx ts-node backend/server-updated.ts
# Server on: http://localhost:3001

# Start Frontend
npm run dev
# App on: http://localhost:3000

# Health Check
curl http://localhost:3001/health
```

---

## 📚 Documentation Index

| Document | Purpose | Link |
|----------|---------|------|
| **Start Here** | Entry point | `docs/README.md` |
| **API Reference** | All endpoints | `docs/01-DOCUMENTATION_LIBRARY.md` |
| **System Guide** | How it works | `docs/02-SYSTEM_GUIDE.md` |
| **Quick Start** | Common tasks | `docs/03-QUICK_START.md` |
| **Database** | Schema & setup | `docs/DATABASE_MIGRATION_GUIDE.md` |
| **Deployment** | Launch guide | `docs/DEPLOYMENT_GUIDE.md` |

---

## 🔐 Authentication

### Login
```typescript
import { useAuth } from '@/hooks/useAuth'

const { login } = useAuth()
await login('user@example.com', 'password')
```

### Register
```typescript
const { register } = useAuth()
await register({
  email: 'user@example.com',
  phone: '5551234567',
  password: 'Password123!',
  firstName: 'John',
  lastName: 'Doe',
  role: 'CONTRACTOR'
})
```

### Check Auth Status
```typescript
const { user, isAuthenticated } = useAuth()
if (isAuthenticated) { /* user is logged in */ }
```

---

## 🛠️ Using the API Client

### Import
```typescript
import { apiClient } from '@/services/apiClient'
```

### Examples
```typescript
// Authentication
await apiClient.auth.login({ email, password })
await apiClient.auth.register({ ...data })
await apiClient.auth.logout(userId)

// Jobs
await apiClient.jobs.create({ title, description, budget })
await apiClient.jobs.list({ category, location })
await apiClient.jobs.get(jobId)

// Bids
await apiClient.bids.create(jobId, amount, timeline)
await apiClient.bids.listByJob(jobId)

// Contracts
await apiClient.contracts.create({ jobId, contractorId, amount })
await apiClient.contracts.acceptBid(contractId)
await apiClient.contracts.get(contractId)

// Completions
await apiClient.completions.submit({ contractId, photos, video })
await apiClient.completions.approve(completionId, rating, feedback)
await apiClient.completions.dispute(completionId, reason)

// Payments
await apiClient.payments.processPayment(contractId, amount, methodId)
await apiClient.payments.getTransactionHistory(userId)

// Notifications
await apiClient.notifications.getNotifications(userId)
await apiClient.notifications.markAsRead(notificationId)
```

---

## ⚙️ Using Custom Hooks

### useAuth
```typescript
const {
  user,
  isLoading,
  error,
  login,
  logout,
  register,
  clearError
} = useAuth()
```

### useJobs
```typescript
const {
  jobs,
  selectedJob,
  isLoading,
  createJob,
  listJobs,
  submitBid,
  selectJob
} = useJobs()
```

### useContracts
```typescript
const {
  contracts,
  completions,
  disputes,
  createContract,
  submitCompletion,
  disputeCompletion,
  resolveDispute
} = useContracts()
```

### useProfile
```typescript
const {
  profile,
  contractors,
  updateProfile,
  setSpecializations,
  setupBusinessProfile,
  listContractors
} = useProfile(userId)
```

### useFileUpload
```typescript
const {
  uploadImage,
  uploadVideo,
  uploadMultipleImages,
  progress,
  error
} = useFileUpload()
```

---

## ✅ Form Validation

### Built-in Validators
```typescript
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateCreditCard,
  validateAddress
} from '@/utils/validators'

validateEmail('user@example.com') // true/false
validatePhone('5551234567') // true/false
validatePassword('MyPass123!') // {isValid, errors}
```

### Password Strength
```typescript
import { getPasswordStrength } from '@/utils/validators'

getPasswordStrength('Password123!') // 'weak'|'fair'|'good'|'strong'
```

---

## 🎨 Formatting Data

### Currency
```typescript
import { formatCurrency, formatPrice, formatPaymentBreakdown } from '@/utils/formatters'

formatPrice(1500) // "$1,500.00"
formatCurrency(1500, 'EUR', 2) // "€1,500.00"

const breakdown = formatPaymentBreakdown(1000)
// { total: 1000, deposit: 250, final: 750, platformFee: 180, ... }
```

### Dates
```typescript
import { formatDate, formatRelativeTime } from '@/utils/formatters'

formatDate(new Date(), 'short') // "Jan 4, 2026"
formatDate(new Date(), 'long') // "Thursday, January 4, 2026"
formatRelativeTime(new Date()) // "just now" or "2h ago"
```

### Phone
```typescript
import { formatPhone } from '@/utils/formatters'

formatPhone('5551234567') // "(555) 123-4567"
```

### Rating
```typescript
import { formatRating, getRatingColor } from '@/utils/formatters'

formatRating(4.5) // "4.5★"
getRatingColor(4.5) // 'text-green-500'
```

---

## 📊 Constants & Configuration

### User Roles
```typescript
import { USER_ROLES } from '@/utils/constants'

USER_ROLES.HOMEOWNER // 'HOMEOWNER'
USER_ROLES.CONTRACTOR // 'CONTRACTOR'
USER_ROLES.ADMIN // 'ADMIN'
```

### Job Categories
```typescript
import { JOB_CATEGORIES } from '@/utils/constants'

// ['Plumbing', 'Electrical', 'HVAC', 'Roofing', ...]
```

### Payment Config
```typescript
import { PAYMENT_CONFIG } from '@/utils/constants'

PAYMENT_CONFIG.DEPOSIT_PERCENT // 0.25 (25%)
PAYMENT_CONFIG.FINAL_PAYMENT_PERCENT // 0.75 (75%)
PAYMENT_CONFIG.PLATFORM_FEE_PERCENT // 0.18 (18%)
```

### Dispute Paths
```typescript
import { DISPUTE_PATHS, DISPUTE_PATH_LABELS } from '@/utils/constants'

DISPUTE_PATHS.REFUND // 'REFUND'
DISPUTE_PATH_LABELS.REFUND // 'Full Refund'
```

---

## 🌍 Environment Configuration

### Access Config
```typescript
import { environment } from '@/config/environment'

environment.apiUrl // Backend URL
environment.isDevelopment // true/false
environment.isProduction // true/false
environment.features.ENABLE_SOCIAL_LOGIN // true/false
environment.stripe.ENABLED // Check if Stripe available
```

### Check Service Status
```typescript
environment.isServiceEnabled('stripe') // true/false
environment.isFeatureEnabled('ENABLE_DARK_MODE') // true/false
environment.getServiceConfig('stripe') // {PUBLIC_KEY, ENABLED}
```

---

## 🛡️ Error Handling

### Try/Catch Pattern
```typescript
try {
  await apiClient.jobs.create(jobData)
} catch (error) {
  console.error(error.code) // Error code
  console.error(error.message) // Human readable
  console.error(error.details) // Extra info
}
```

### Using Error Boundary
```typescript
import ErrorBoundary from '@/components/ErrorBoundary'

<ErrorBoundary onError={(error, info) => console.log(error)}>
  <YourComponent />
</ErrorBoundary>
```

### Error Codes
```typescript
import { ERROR_CODES } from '@/utils/constants'

ERROR_CODES.AUTH_001 // 'Invalid credentials'
ERROR_CODES.BIZ_002 // 'Bid already submitted'
ERROR_CODES.PERM_001 // 'Insufficient permissions'
```

---

## 📁 File Locations

| Item | Location |
|------|----------|
| **Components** | `src/components/` |
| **Hooks** | `src/hooks/` |
| **Services** | `src/services/` |
| **Utilities** | `src/utils/` |
| **Config** | `src/config/` |
| **Types** | `src/types.ts` |
| **Backend** | `backend/` |
| **Database** | `prisma/schema.prisma` |
| **Docs** | `docs/` |

---

## 🔄 Common Workflows

### User Registration Flow
```typescript
const { register } = useAuth()

// 1. Register
await register({
  email, phone, password, firstName, lastName, role
})

// 2. User navigates to verification
// 3. Email/phone verification happens automatically
// 4. User logged in & redirected to onboarding
```

### Job Posting Flow
```typescript
const { createJob, listJobs } = useJobs()

// 1. Create job
const job = await createJob({ title, description, budget, category })

// 2. Job is live, contractors can see it
const jobs = await listJobs({ category, location })

// 3. Contractor submits bid
const bid = await submitBid(job.id, amount, timeline)
```

### Contract & Payment Flow
```typescript
const { createContract, submitCompletion } = useContracts()

// 1. Homeowner accepts bid
const contract = await createContract({ jobId, contractorId, bidAmount })

// 2. Payment taken (25% deposit via Stripe)
// 3. Contractor works & submits completion
await submitCompletion({ contractId, photos, video })

// 4. Homeowner approves
await approve(completionId, rating, feedback)

// 5. Final payment released (75%)
```

### Dispute Flow
```typescript
// 1. Homeowner disputes completion
const dispute = await disputeCompletion(completionId, reason, evidence)

// 2. 48-hour mediation window opens
// 3. Contractor responds with evidence
// 4. Admin resolves via dispute path:
//    - REFUND: Give all money to homeowner
//    - PARTIAL_REFUND: Split negotiated
//    - REWORK: 7-day deadline to fix
//    - ARBITRATION: Third party decides
```

---

## 🚀 Deployment Checklist

```bash
# Before deploying
npm run lint           # Check code style
npm run test           # Run tests
npm run build          # Build for production
npm run check-env      # Verify all env vars

# Environment variables
cp .env.example .env.production
# Edit .env.production with real values

# Database
npx prisma migrate deploy
npx prisma db seed

# Deploy
# Follow docs/DEPLOYMENT_GUIDE.md
```

---

## 📞 Support

- **API Reference:** `docs/01-DOCUMENTATION_LIBRARY.md`
- **Errors:** Search error code in docs
- **Deployment:** `docs/DEPLOYMENT_GUIDE.md`
- **Database:** `docs/DATABASE_MIGRATION_GUIDE.md`

---

## 📋 Key Numbers

| Item | Value |
|------|-------|
| **Platform Fee** | 18% |
| **Contractor Keep** | 82% |
| **Deposit** | 25% of contract |
| **Final Payment** | 75% of contract |
| **Dispute Window** | 5 days |
| **Mediation Window** | 48 hours |
| **API Timeout** | 30 seconds |
| **Rate Limit** | 1000 req/hour |

---

## 🎯 Useful Commands

```bash
# Start development
npm run dev

# Format code
npm run format

# Check types
npm run type-check

# Build production
npm run build

# Test
npm run test

# Lint
npm run lint

# Database
npx prisma studio      # Visual DB editor
npx prisma migrate dev # Create migration

# Backend
npx ts-node backend/server-updated.ts

# Git
git add .
git commit -m "message"
git push
```

---

**Keep this handy! Bookmark docs/INDEX.md for full documentation navigation.**

Last Updated: January 4, 2026

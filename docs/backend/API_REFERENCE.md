# FairTradeWorker - Comprehensive Documentation Library
**Complete & Easy-to-Follow Guide**
**Last Updated:** January 4, 2026

---

## 📚 Documentation Index

### Getting Started (Read These First)
1. [Architecture Overview](#architecture-overview)
2. [Setup & Installation](#setup--installation)
3. [Running the System](#running-the-system)

### Authentication & Users
4. [Authentication System](#authentication-system)
5. [User Management](#user-management)
6. [Contractor Onboarding](#contractor-onboarding)

### Marketplace Features
7. [Job Management](#job-management)
8. [Bidding System](#bidding-system)
9. [Contract Lifecycle](#contract-lifecycle)

### Critical Workflows
10. [Payment & Escrow](#payment--escrow)
11. [Job Completion](#job-completion)
12. [Dispute Resolution](#dispute-resolution)
13. [Contractor Verification](#contractor-verification)

### Notifications & Analytics
14. [Notification System](#notification-system)
15. [Analytics & Reporting](#analytics--reporting)

### Admin & Operations
16. [Admin Dashboard](#admin-dashboard)
17. [API Endpoints Reference](#api-endpoints-reference)

### Development
18. [Database Schema](#database-schema)
19. [Middleware Reference](#middleware-reference)
20. [Error Codes](#error-codes)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - JobMarketplace.tsx                   │
│  - BidManagement.tsx                    │
│  - JobCompletion.tsx                    │
│  - Settings.tsx                         │
└────────────────┬────────────────────────┘
                 │
         HTTP/REST API (Port 3001)
                 │
┌────────────────▼────────────────────────┐
│   Express.js Backend (Node.js)          │
├─────────────────────────────────────────┤
│ Authentication Layer                    │
│ - JWT Token Management                  │
│ - Session Handling                      │
└─────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Service Layer (7 Core Services)       │
├─────────────────────────────────────────┤
│ 1. AuthService         - User auth      │
│ 2. UserService         - Profiles       │
│ 3. BidContractService  - Contracts      │
│ 4. JobCompletionService- Work approval  │
│ 5. EscrowService       - Payments       │
│ 6. DisputeService      - Mediation      │
│ 7. VerificationService - Compliance     │
│ + NotificationService  - Alerts         │
│ + AnalyticsService     - Metrics        │
└─────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Database Layer                        │
├─────────────────────────────────────────┤
│ In-Memory (MVP) or MongoDB/PostgreSQL   │
│ 11 Collections                          │
│ Full Audit Trail                        │
└─────────────────────────────────────────┘
```

### Key Design Principles

1. **Service-Oriented Architecture**
   - Each service handles one domain
   - Services are independent and testable
   - Easy to replace implementations

2. **JWT-Based Authentication**
   - Stateless token authentication
   - Refresh tokens for security
   - Role-based access control

3. **Transactional Integrity**
   - All critical operations are logged
   - Payment flows are atomic
   - Escrow holds funds securely

4. **Real-Time Notifications**
   - Multi-channel: email, SMS, push, in-app
   - Priority-based routing
   - Complete notification history

---

## Setup & Installation

### Prerequisites

```
✓ Node.js 18+ (from nodejs.org)
✓ npm 8+ (comes with Node.js)
✓ Git (for version control)
```

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd fairtradeworker

# Install all dependencies
npm install express cors dotenv ts-node typescript

# Install types for TypeScript
npm install --save-dev @types/express @types/node
```

### Step 2: Environment Setup

Create `.env` file in project root:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your_secret_key_change_for_production_please
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d

# Database (when ready)
DATABASE_URL=mongodb://localhost:27017/fairtradeworker

# Frontend
FRONTEND_URL=http://localhost:3000

# Email Service (SendGrid - add when ready)
SENDGRID_API_KEY=your_sendgrid_key

# SMS Service (Twilio - add when ready)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

# Payment Processing (Stripe - add when ready)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### Step 3: File Structure Verification

Verify all backend files are in place:

```
backend/
├── server-updated.ts           ✓ Main API server
├── database.ts                 ✓ Database abstraction
├── middleware/
│   └── index.ts               ✓ Middleware suite
└── services/
    ├── authService.ts         ✓ Authentication
    ├── userService.ts         ✓ User management
    ├── bidContractService.ts  ✓ Contracts
    ├── escrowService.ts       ✓ Payments
    ├── jobCompletionService.ts ✓ Completions
    ├── disputeService.ts      ✓ Disputes
    ├── notificationService.ts ✓ Notifications
    ├── verificationService.ts ✓ Verification
    └── analyticsService.ts    ✓ Analytics
```

---

## Running the System

### Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Copy and update environment
cp .env.example .env  # (create .env with values above)

# 3. Start the server
npx ts-node backend/server-updated.ts

# Output should show:
# 🚀 FairTradeWorker API Server running on port 3001
```

### Testing the Server

```bash
# Check server health
curl http://localhost:3001/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2026-01-04T10:30:45.123Z",
#   "uptime": 23.456
# }
```

### Running with Frontend

**Terminal 1 - Backend:**
```bash
npx ts-node backend/server-updated.ts
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm start
# Runs on http://localhost:3000
```

---

## Authentication System

### Overview

The authentication system uses JWT (JSON Web Tokens) with refresh tokens for secure, stateless authentication.

### Architecture

```
User Registration → JWT Generation → Token Storage
                      ↓
User Login → Token Verification → Request Authorization
                      ↓
Token Refresh → New Access Token (when expired)
                      ↓
User Logout → Token Invalidation
```

### API Endpoints

#### Register New User

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "contractor@example.com",
  "phone": "555-1234",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Smith",
  "role": "CONTRACTOR"
}

Response (201 Created):
{
  "user": {
    "id": "user_1234567890",
    "name": "John Smith",
    "email": "contractor@example.com",
    "role": "CONTRACTOR",
    "tier": "FREE",
    "preferences": { ... }
  },
  "tokens": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### Login User

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "contractor@example.com",
  "password": "SecurePassword123!"
}

Response (200 OK):
{
  "user": { ... },
  "tokens": { ... }
}
```

#### Verify Phone Number

```
POST /api/auth/verify-phone
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "otp": "123456"
}

Response (200 OK):
{
  "success": true
}
```

#### Verify Email Address

```
POST /api/auth/verify-email
Content-Type: application/json

{
  "userId": "user_1234567890",
  "token": "email_verification_token"
}

Response (200 OK):
{
  "success": true
}
```

#### Refresh Access Token

```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response (200 OK):
{
  "accessToken": "eyJhbGc..."
}
```

#### Logout User

```
POST /api/auth/logout
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response (200 OK):
{
  "success": true
}
```

### Token Format

Access tokens expire in 24 hours.
Refresh tokens expire in 7 days.

```typescript
// Token Structure
{
  "sub": "user_1234567890",           // User ID
  "iat": 1672790400,                  // Issued at
  "exp": 1672876800,                  // Expires at
  "type": "access"                    // Token type
}
```

### Using Tokens in Requests

All authenticated requests require the Authorization header:

```bash
curl -X GET http://localhost:3001/api/users/user_123 \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## User Management

### User Profile

Every user has a profile with the following structure:

```typescript
{
  id: "user_1234567890",
  name: "John Smith",
  email: "john@example.com",
  role: "CONTRACTOR",  // HOMEOWNER, CONTRACTOR, ADMIN, etc.
  tier: "FREE",        // FREE, STARTER, PRO, ELITE, ENTERPRISE
  preferences: {
    aiPersonality: "PROFESSIONAL",
    verbosity: "CONCISE",
    theme: "SYSTEM"
  },
  tradeTypes: ["Plumbing", "HVAC"],  // For contractors
  avgResponseTime: "2.3h",            // For contractors
  reputationScore: 4.8,               // 1-5 stars
  businessProfile: { ... }            // For contractors
}
```

### Get User Profile

```
GET /api/users/:userId
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "id": "user_1234567890",
  "name": "John Smith",
  "email": "john@example.com",
  ...
}
```

### Update Profile

```
PATCH /api/users/:userId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "John Smith Jr.",
  "preferences": {
    "theme": "DARK"
  }
}

Response (200 OK):
{ ... updated profile ... }
```

### Set Contractor Specializations

```
POST /api/users/:userId/specializations
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "tradeTypes": ["Plumbing", "HVAC", "Painting"]
}

Response (200 OK):
{
  "success": true
}
```

### Valid Trade Types

- Plumbing
- Electrical
- Carpentry
- HVAC
- Painting
- Appliances
- Roofing
- Other

### User Roles

```
HOMEOWNER       - Posts jobs, pays contractors
CONTRACTOR      - Submits bids, completes work
SUBCONTRACTOR   - Works under main contractor
CREW_MEMBER     - Crew staff
FRANCHISE_OWNER - Franchise operations
ADMIN           - Platform administration
```

---

## Contractor Onboarding

### Onboarding Flow

Contractors must complete these steps before bidding:

1. **Account Created** ✓ (automatic on signup)
2. **Phone Verification** - Verify phone number with OTP
3. **Business Profile** - Enter business info
4. **License Verification** - Submit and verify contractor license
5. **Background Check** - Pass criminal background check
6. **Insurance Verification** - Verify coverage is active
7. **Specializations** - Select trades
8. **Payout Information** - Bank account for payments

### Check Onboarding Status

```
GET /api/users/:userId/onboarding-status
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "step": 4,
  "status": "IN_PROGRESS",
  "completed": [
    "PROFILE_INFO",
    "PHONE_VERIFICATION",
    "BUSINESS_PROFILE",
    "SPECIALIZATIONS"
  ],
  "pending": [
    "LICENSE_VERIFICATION",
    "BACKGROUND_CHECK",
    "INSURANCE_VERIFICATION",
    "PAYOUT_INFO"
  ]
}
```

### Set Up Business Profile

```
POST /api/users/:userId/business-profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "businessName": "Smith Plumbing LLC",
  "ein": "12-3456789",
  "licenseNumber": "CA12345678",
  "licenseState": "CA",
  "insuranceProvider": "State Farm",
  "policyNumber": "POL-123456",
  "policyExpiration": "2027-12-31"
}

Response (200 OK):
{
  "success": true
}
```

---

## Job Management

### Create Job Posting

```
POST /api/jobs
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Bathroom Plumbing Repair",
  "category": "Plumbing",
  "description": "Fix leaking toilet and shower",
  "location": "123 Main St, San Francisco, CA",
  "budgetRange": "$500-$1500",
  "images": ["base64_encoded_image_1", "base64_encoded_image_2"],
  "timing": "Immediately",
  "propertyType": "House",
  "scopeOfWork": ["Fix toilet", "Repair shower head"]
}

Response (201 Created):
{
  "id": "job_1234567890",
  "title": "Bathroom Plumbing Repair",
  "status": "OPEN",
  "stage": "POSTED",
  ...
}
```

### Get Job Details

```
GET /api/jobs/:jobId
Authorization: Bearer {accessToken}

Response (200 OK):
{ ... job details ... }
```

### List Jobs

```
GET /api/jobs?category=Plumbing&location=San%20Francisco
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "jobs": [ ... ],
  "total": 42,
  "page": 1
}
```

### Job Statuses

- **DRAFT** - Being created
- **OPEN** - Accepting bids
- **IN_PROGRESS** - Work in progress
- **COMPLETED** - Work done, awaiting approval
- **PAID** - Payment released to contractor
- **DISPUTED** - Payment disputed

---

## Bidding System

### Submit Bid

```
POST /api/bids
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "jobId": "job_1234567890",
  "bidAmount": 750,
  "description": "I can fix both issues in 1 day",
  "estimatedDuration": "1 day",
  "startDate": "2026-02-01"
}

Response (201 Created):
{
  "id": "bid_1234567890",
  "jobId": "job_1234567890",
  "contractorId": "contractor_123",
  "bidAmount": 750,
  "status": "SUBMITTED",
  ...
}
```

### Get All Bids for Job

```
GET /api/bids/job/:jobId
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "bids": [
    {
      "id": "bid_1234567890",
      "contractorId": "contractor_123",
      "bidAmount": 750,  // Hidden until awarded
      ...
    }
  ],
  "competitorBidCount": 5  // Shown instead of amounts
}
```

### Get My Bids

```
GET /api/bids/contractor/:contractorId
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "bids": [ ... ],
  "total": 23,
  "stats": {
    "submitted": 23,
    "accepted": 15,
    "winRate": "65%"
  }
}
```

### Blind Bidding

When bidding is open:
- Bid amounts are HIDDEN from competitors
- Only contractor count is shown: "5 contractors bid"
- Average bid is NOT shown
- When homeowner awards contract:
  - Only that contractor's amount is revealed

---

## Contract Lifecycle

### Create Contract from Accepted Bid

```
POST /api/contracts
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "jobId": "job_1234567890",
  "contractorId": "contractor_123",
  "bidAmount": 750,
  "homeownerId": "homeowner_456",
  "scopeOfWork": ["Fix toilet", "Repair shower"],
  "materialsList": [
    { "description": "New toilet", "quantity": 1, "unitPrice": 200 }
  ],
  "startDate": "2026-02-01",
  "estimatedDuration": "1 day"
}

Response (201 Created):
{
  "id": "contract_1234567890",
  "status": "PENDING_ACCEPTANCE",
  "bidAmount": 750,
  "paymentTerms": {
    "deposit": 187.50,      // 25%
    "depositPercentage": 25,
    "finalPayment": 562.50, // 75%
    "finalPaymentPercentage": 75
  },
  ...
}
```

### Contract States

```
DRAFT
  ↓
PENDING_ACCEPTANCE (waiting for contractor acceptance)
  ↓
ACCEPTED (contract signed, awaiting work)
  ↓
ACTIVE (work in progress)
  ├→ COMPLETED (work submitted)
  │  ├→ APPROVED (homeowner approves)
  │  └→ REJECTED (needs rework)
  │
  └→ DISPUTED (payment disputed)
     ├→ MEDIATION (48h review window)
     └→ RESOLVED (mediation complete)
```

### Get Contract Details

```
GET /api/contracts/:contractId
Authorization: Bearer {accessToken}

Response (200 OK):
{ ... full contract details ... }
```

### Update Contract Status

```
PATCH /api/contracts/:contractId
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "ACTIVE"
}

Response (200 OK):
{ ... updated contract ... }
```

---

## Payment & Escrow

### Payment Flow

```
Timeline: Contractor Gets Paid

Day 0: Homeowner awards contract ($750)
  ├─ Escrow account created
  ├─ 25% deposit ($187.50) charged
  └─ Status: PENDING

Day 0: After 1 hour
  ├─ Deposit released to contractor
  ├─ Contractor nets: $187.50 - 18% fee
  └─ Contractor receives: $153.75

Day 1-5: Work completes
  └─ Status: ACTIVE

Day 5: Contractor submits completion
  ├─ Photos/video uploaded
  ├─ Status: PENDING_APPROVAL
  ├─ 5-day dispute window opens
  └─ Final $562.50 held in escrow

Day 5-6: Homeowner reviews
  ├─ Option A: Approves work
  │  ├─ Final payment released
  │  ├─ Contractor nets: $562.50 - 18% fee
  │  ├─ Contractor receives: $461.05
  │  └─ Total earned: $153.75 + $461.05 = $614.80 (82%)
  │
  └─ Option B: Disputes work
     ├─ Funds held in escrow
     ├─ 48h mediation window
     └─ Resolved with refund/rework/partial

Total Contractor Earnings: $614.80 (82% of $750)
Total Platform Fees: $135.20 (18% of $750)
```

### Financial Breakdown (All Transactions)

```
$750 Contract Value

Platform Fee:    $135.20 (18%)
 Contractor Pay: $614.80 (82%)

Deposit Phase:
  Charged: $187.50 (25%)
  Fee: $33.75
  Contractor Gets: $153.75

Final Phase:
  Charged: $562.50 (75%)
  Fee: $101.25
  Contractor Gets: $461.25

Total Contractor: $153.75 + $461.25 = $614.80 ✓
Total Platform: $33.75 + $101.25 = $135 ✓
```

### Escrow Statuses

- **PENDING** - Awaiting charge/release
- **RELEASED** - Transferred to contractor
- **HELD_IN_DISPUTE** - Frozen during dispute
- **HELD_FOR_REWORK** - Contractor has 7 days to fix
- **HELD_FOR_ARBITRATION** - Third party deciding
- **REFUNDED** - Returned to homeowner
- **PARTIAL_REFUND** - Split between parties

### Get Payment Status

```
GET /api/payments/status/:contractId
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "contractId": "contract_123",
  "totalAmount": 750,
  "status": "RELEASED",
  "transactions": [
    {
      "id": "txn_123",
      "type": "DEPOSIT",
      "amount": 187.50,
      "status": "COMPLETED",
      "timestamp": "2026-01-04T10:30:00Z"
    },
    {
      "id": "txn_124",
      "type": "FINAL_PAYMENT",
      "amount": 562.50,
      "status": "COMPLETED",
      "timestamp": "2026-01-05T15:45:00Z"
    }
  ],
  "platformFee": 135.20,
  "contractorNet": 614.80
}
```

---

## Job Completion

### Submit Completion

```
POST /api/completions
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "contractId": "contract_1234567890",
  "jobId": "job_1234567890",
  "photoUrls": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ],
  "videoUrl": "data:video/mp4;base64,AAAAIGZ0eXBpc...",
  "locationGeohash": "9q8yy",
  "timestampSubmitted": "2026-01-05T14:30:00Z"
}

Response (201 Created):
{
  "id": "completion_1234567890",
  "contractId": "contract_1234567890",
  "status": "PENDING_APPROVAL",
  "photoCount": 3,
  "videoPresent": true,
  "disputeWindowExpiresAt": "2026-01-10T14:30:00Z",
  ...
}
```

### Requirements

- **Minimum Photos**: 3 (before, during, after)
- **Optional Video**: 5-30 minute walkthrough
- **Location**: GPS coordinates + geohash
- **Timestamp**: ISO 8601 format
- **Optional Signature**: Homeowner approval signature

### Approve Completion

```
PATCH /api/completions/:completionId/approve
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "approvalNotes": "Great work! Everything looks perfect",
  "homeownerSatisfaction": 5
}

Response (200 OK):
{
  "id": "completion_1234567890",
  "status": "APPROVED",
  "approvedAt": "2026-01-05T15:00:00Z",
  "payoutStatus": "RELEASED",
  ...
}
```

### Satisfaction Rating

Rate contractor 1-5 stars:
- 5 stars: Excellent work
- 4 stars: Good work
- 3 stars: Acceptable
- 2 stars: Below expectations
- 1 star: Poor quality

### Dispute Window

- Opens when completion submitted
- Lasts 5 days
- Can be closed early if homeowner approves
- After 5 days, automatically approved

---

## Dispute Resolution

### Initiate Dispute

```
PATCH /api/completions/:completionId/dispute
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "reason": "Quality issues",
  "description": "Shower head is still leaking after work",
  "evidenceUrls": ["photo1.jpg", "photo2.jpg"]
}

Response (200 OK):
{
  "id": "dispute_1234567890",
  "status": "PENDING",
  "mediationDeadline": "2026-01-07T14:30:00Z",
  "initiatedBy": "HOMEOWNER",
  ...
}
```

### Dispute Reasons

1. **Quality issues** - Work doesn't meet standards
2. **Scope not met** - Not all work completed
3. **Materials subpar** - Cheap/wrong materials used
4. **Contractor no-show** - Didn't show up
5. **Timeline issues** - Took too long
6. **Other** - Custom reason

### Submit Contractor Response

```
POST /api/disputes/:disputeId/response
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "responseText": "I can fix this in 2 days. Here's my plan...",
  "evidenceUrls": ["fix_plan.jpg", "replacement_parts.jpg"]
}

Response (200 OK):
{
  "id": "dispute_1234567890",
  "status": "MEDIATION",
  "contractorResponseAt": "2026-01-07T09:00:00Z",
  ...
}
```

### Dispute Timeline

```
T0:  Dispute initiated by homeowner
     - Contractor notified immediately
     - Funds frozen in escrow
     - 48-hour mediation window opens

T24: Contractor responds with evidence
     - Status changes to MEDIATION
     - Admin reviews both sides

T48: Mediation deadline
     - Auto-escalate if no response
     - Admin decides resolution

T72: Resolution executed
     - Funds released per resolution
     - Both parties notified
```

### Resolution Paths

#### 1. REFUND (Full Refund)

```
POST /api/disputes/:disputeId/resolve
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "resolutionPath": "REFUND",
  "reasoning": "Work quality did not meet specifications"
}

Result:
- Homeowner: Gets $750 back
- Contractor: Gets $0
- Platform: Keeps $0 (refunded to homeowner)
```

#### 2. PARTIAL_REFUND (Split)

```
{
  "resolutionPath": "PARTIAL_REFUND",
  "partialRefundPercentage": 50,
  "reasoning": "Half refund, contractor reworks other half"
}

Result:
- Homeowner: Gets $375 back
- Contractor: Keeps $375 - $67.50 fee = $307.50
- Platform: Keeps $67.50
```

#### 3. REWORK (Contractor Fixes)

```
{
  "resolutionPath": "REWORK",
  "reasoning": "Contractor can fix within 7 days"
}

Result:
- Funds held for 7 days
- Contractor submits new completion
- If approved: Full payment released
- If not re-approved: Refund issued
```

#### 4. ARBITRATION (Third Party)

```
{
  "resolutionPath": "ARBITRATION",
  "reasoning": "Complex issue, requires expert review"
}

Result:
- Funds held pending arbitration
- Third-party expert reviews
- Expert decides on resolution
```

---

## Contractor Verification

### License Verification

```
POST /api/verification/license
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "contractorId": "contractor_123",
  "licenseNumber": "CA12345678",
  "licenseState": "CA",
  "licenseType": "General Contractor"
}

Response (201 Created):
{
  "id": "verify_1234567890",
  "type": "LICENSE",
  "status": "VERIFIED",
  "licenseStatus": "ACTIVE",
  "expirationDate": "2027-12-31",
  "verifiedAt": "2026-01-04T10:30:00Z",
  ...
}
```

### Background Check

```
POST /api/verification/background-check
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "contractorId": "contractor_123",
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "1985-05-15",
  "email": "john@example.com",
  "phone": "555-1234"
}

Response (201 Created):
{
  "id": "verify_1234567890",
  "type": "BACKGROUND_CHECK",
  "status": "PENDING",
  "externalRequestId": "bg_check_123",
  ...
}

// Results arrive via webhook in 24-48 hours
```

### Insurance Verification

```
POST /api/verification/insurance
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "contractorId": "contractor_123",
  "insuranceProvider": "State Farm",
  "policyNumber": "POL-123456",
  "coverageType": "GENERAL_LIABILITY",
  "coverageAmount": 1000000,
  "expirationDate": "2027-12-31"
}

Response (201 Created):
{
  "id": "verify_1234567890",
  "type": "INSURANCE_GENERAL_LIABILITY",
  "status": "VERIFIED",
  "policyStatus": "ACTIVE",
  "verifiedAt": "2026-01-04T10:30:00Z",
  ...
}
```

### Get Verification Status

```
GET /api/verification/status/:contractorId
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "contractorId": "contractor_123",
  "licenseVerified": true,
  "backgroundCheckPassed": true,
  "insuranceVerified": true,
  "overallCompliance": true,
  "licenses": [
    {
      "licenseNumber": "CA12345678",
      "state": "CA",
      "type": "General Contractor",
      "status": "VERIFIED",
      "expirationDate": "2027-12-31",
      "verifiedAt": "2026-01-04T10:30:00Z"
    }
  ],
  "insurance": [
    {
      "type": "GENERAL_LIABILITY",
      "provider": "State Farm",
      "status": "VERIFIED",
      "expirationDate": "2027-12-31",
      "amount": 1000000
    }
  ],
  "backgroundCheck": {
    "status": "VERIFIED",
    "clearanceStatus": "CLEAR",
    "verifiedAt": "2026-01-04T10:30:00Z"
  }
}
```

### Bid Eligibility

Can only bid if:
- ✓ License verified
- ✓ Background check clear
- ✓ Insurance coverage active

```
GET /api/verification/can-bid/:contractorId
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "canBid": true,
  "reasons": []
}

// Or if not eligible:
{
  "canBid": false,
  "reasons": [
    "License not verified",
    "Background check not passed",
    "Insurance not verified"
  ]
}
```

---

## Notification System

### Notification Types

#### Contract Events

- **CONTRACT_CREATED** → Contractor: "New contract awaiting acceptance"
- **CONTRACT_ACCEPTED** → Both: "Contract accepted, work authorized"
- **CONTRACT_CHANGE_PROPOSED** → Both: "Change order requested"

#### Completion Events

- **COMPLETION_SUBMITTED** → Homeowner: "Work submitted for review"
- **COMPLETION_APPROVED** → Contractor: "Work approved! Payment released"
- **COMPLETION_REJECTED** → Contractor: "Rework requested"

#### Payment Events

- **PAYMENT_RELEASED** → Contractor: "Payment released to your account"
- **PAYMENT_FAILED** → Homeowner: "Payment processing failed"
- **PAYOUT_PROCESSED** → Contractor: "Payout deposited in bank"

#### Dispute Events

- **DISPUTE_INITIATED** → Contractor: "Work dispute initiated" (CRITICAL)
- **DISPUTE_RESPONSE** → Homeowner: "Contractor responded to dispute"
- **DISPUTE_RESOLVED** → Both: "Dispute resolved - [outcome]"

#### Verification Events

- **LICENSE_VERIFIED** → Contractor: "License verified successfully"
- **LICENSE_VERIFICATION_FAILED** → Contractor: "License verification failed"
- **BACKGROUND_CHECK_INITIATED** → Contractor: "Background check in progress"
- **BACKGROUND_CHECK_CLEAR** → Contractor: "Background check passed"
- **BACKGROUND_CHECK_CONCERN** → Contractor: "Background check requires review"
- **INSURANCE_VERIFIED** → Contractor: "Insurance coverage verified"

### Channels

```
Priority → Channels Sent

LOW      → IN_APP
MEDIUM   → IN_APP, EMAIL
HIGH     → IN_APP, EMAIL, PUSH
CRITICAL → IN_APP, EMAIL, PUSH, SMS
```

### Get User Notifications

```
GET /api/notifications?unread=true
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "notifications": [
    {
      "id": "notif_123",
      "userId": "user_456",
      "type": "COMPLETION_SUBMITTED",
      "title": "Work Submitted for Review",
      "message": "Contractor has submitted work for approval",
      "actionUrl": "/completions/completion_789",
      "priority": "HIGH",
      "read": false,
      "createdAt": "2026-01-04T10:30:00Z"
    }
  ],
  "unreadCount": 5
}
```

### Mark as Read

```
POST /api/notifications/:notificationId/read
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "success": true
}
```

---

## Analytics & Reporting

### Marketplace Metrics

```
GET /api/analytics/marketplace?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "period": { "startDate": "2026-01-01", "endDate": "2026-01-31" },
  "jobs": {
    "totalPosted": 1250,
    "totalWithBids": 985,
    "totalCompleted": 847,
    "conversionRate": "67.8%"
  },
  "contracts": {
    "total": 985,
    "totalValue": "$2,456,300",
    "averageValue": "$2,491",
    "byStatus": {
      "DRAFT": 12,
      "PENDING_ACCEPTANCE": 45,
      "ACCEPTED": 89,
      "ACTIVE": 234,
      "COMPLETED": 600,
      "DISPUTED": 5
    }
  },
  "completions": {
    "total": 847,
    "rate": "85.9%",
    "byStatus": {
      "PENDING_APPROVAL": 12,
      "APPROVED": 820,
      "REJECTED": 15,
      "DISPUTED": 0
    }
  },
  "disputes": {
    "total": 18,
    "rate": "2.1%",
    "byStatus": {
      "PENDING": 2,
      "MEDIATION": 1,
      "RESOLVED": 15
    },
    "byResolution": {
      "REFUND": 8,
      "REWORK": 4,
      "PARTIAL_REFUND": 3,
      "ARBITRATION": 0
    }
  },
  "performance": {
    "avgBidResponseTime": "2.3h",
    "platformFees": "$441,134",
    "avgContractorSatisfaction": 4.6
  }
}
```

### Contractor Analytics

```
GET /api/analytics/contractor/:contractorId
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "contractorId": "contractor_123",
  "portfolio": {
    "totalBids": 127,
    "acceptedContracts": 85,
    "completedJobs": 78,
    "winRate": "67%",
    "completionRate": "92%"
  },
  "financials": {
    "totalRevenue": "$89,450",
    "averageContractValue": "$1,150",
    "totalFeesPaid": "$16,101"
  },
  "quality": {
    "averageRating": 4.8,
    "disputeRate": "1.3%",
    "recentPerformance": {
      "last10Completions": 10,
      "last10ApprovalRate": "98%"
    }
  },
  "responsiveness": {
    "averageResponseTime": "2.3h"
  }
}
```

### Revenue Metrics (Admin Only)

```
GET /api/analytics/revenue?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer {adminToken}

Response (200 OK):
{
  "contractValue": {
    "totalValue": "$2,456,300",
    "completedContracts": 847,
    "averageValue": "$2,897"
  },
  "platformFees": {
    "feeRate": "18%",
    "totalCollected": "$441,134",
    "byContractor": [ ... top 20 ... ]
  },
  "contractorPayouts": {
    "totalPaid": "$2,015,166",
    "byContractor": [ ... top 20 ... ]
  },
  "refunds": {
    "totalRefunded": "$12,450",
    "refundCount": 8,
    "refundRate": "0.5%"
  },
  "netRevenue": {
    "total": "$428,684",
    "margin": "17.5%"
  }
}
```

---

## Admin Dashboard

### Admin Endpoints

#### Get Dashboard Summary

```
GET /api/admin/dashboard
Authorization: Bearer {adminToken}

Response (200 OK):
{
  "stats": {
    "totalUsers": 5234,
    "activeContractors": 1250,
    "activHomeowners": 2100,
    "totalJobs": 8945,
    "totalContracts": 7230,
    "platformRevenue": "$1,234,567",
    "pendingDisputes": 12,
    "pendingVerifications": 45
  },
  "recentActivity": [
    { "type": "USER_REGISTERED", "timestamp": "..." },
    { "type": "DISPUTE_CREATED", "timestamp": "..." },
    { "type": "CONTRACT_COMPLETED", "timestamp": "..." }
  ]
}
```

#### List Contractors for Approval

```
GET /api/admin/contractors?status=PENDING_VERIFICATION
Authorization: Bearer {adminToken}

Response (200 OK):
{
  "contractors": [
    {
      "id": "contractor_123",
      "name": "Smith Plumbing",
      "businessProfile": { ... },
      "verifications": {
        "license": "PENDING",
        "background": "PENDING",
        "insurance": "VERIFIED"
      },
      "createdAt": "2026-01-01T10:30:00Z"
    }
  ],
  "total": 23
}
```

#### Approve Contractor

```
PATCH /api/admin/contractors/:contractorId/approve
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "notes": "All documentation verified"
}

Response (200 OK):
{
  "success": true,
  "contractor": { ... approved contractor ... }
}
```

#### Get Pending Disputes

```
GET /api/admin/disputes?status=PENDING
Authorization: Bearer {adminToken}

Response (200 OK):
{
  "disputes": [
    {
      "id": "dispute_123",
      "contractId": "contract_456",
      "homeowner": { ... },
      "contractor": { ... },
      "reason": "Quality issues",
      "description": "...",
      "mediationDeadline": "2026-01-07T14:30:00Z",
      "evidence": { ... }
    }
  ],
  "total": 12
}
```

---

## API Endpoints Reference

### Authentication (7 endpoints)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-phone
POST   /api/auth/verify-email
POST   /api/auth/refresh-token
POST   /api/auth/logout
POST   /api/auth/request-password-reset
POST   /api/auth/reset-password
```

### Users (6 endpoints)
```
GET    /api/users/:userId
PATCH  /api/users/:userId
POST   /api/users/:userId/specializations
POST   /api/users/:userId/preferences
POST   /api/users/:userId/business-profile
GET    /api/users/:userId/onboarding-status
GET    /api/contractors
```

### Contracts (4 endpoints)
```
POST   /api/contracts
GET    /api/contracts/:contractId
GET    /api/contracts/job/:jobId
PATCH  /api/contracts/:contractId
```

### Completions (4 endpoints)
```
POST   /api/completions
GET    /api/completions/:completionId
PATCH  /api/completions/:completionId/approve
PATCH  /api/completions/:completionId/dispute
```

### Disputes (3 endpoints)
```
GET    /api/disputes/:disputeId
POST   /api/disputes/:disputeId/response
POST   /api/disputes/:disputeId/resolve
```

### Verification (4 endpoints)
```
POST   /api/verification/license
POST   /api/verification/background-check
POST   /api/verification/insurance
GET    /api/verification/status/:contractorId
```

### Analytics (5 endpoints)
```
GET    /api/analytics/marketplace
GET    /api/analytics/contractor/:contractorId
GET    /api/analytics/job/:jobId
GET    /api/analytics/revenue
GET    /api/analytics/trending
```

---

## Database Schema

### Collections Overview

```
users
├─ id (PK)
├─ email (unique)
├─ phone (unique)
├─ name
├─ role (HOMEOWNER, CONTRACTOR, ADMIN, etc.)
├─ passwordHash
├─ tier (FREE, STARTER, PRO, ELITE, ENTERPRISE)
├─ preferences
├─ businessProfile (for contractors)
├─ tradeTypes (for contractors)
├─ createdAt
└─ updatedAt

jobs
├─ id (PK)
├─ homeownerId (FK)
├─ title
├─ category
├─ description
├─ location
├─ budgetRange
├─ status
├─ images
├─ postedDate
└─ bidCount

bidContracts
├─ id (PK)
├─ jobId (FK)
├─ contractorId (FK)
├─ homeownerId (FK)
├─ bidAmount
├─ scopeOfWork
├─ status
├─ paymentTerms
├─ disputeStatus
├─ createdAt
└─ acceptedAt

jobCompletions
├─ id (PK)
├─ contractId (FK)
├─ jobId (FK)
├─ photoUrls
├─ videoUrl
├─ status
├─ homeownerSatisfaction
├─ disputeWindowExpiresAt
└─ submittedAt

disputes
├─ id (PK)
├─ contractId (FK)
├─ homeownerId (FK)
├─ contractorId (FK)
├─ reason
├─ status
├─ messages
├─ resolutionPath
├─ mediationDeadline
└─ createdAt

escrowAccounts
├─ id (PK)
├─ contractId (FK)
├─ totalAmount
├─ status
├─ transactions []
└─ createdAt

notifications
├─ id (PK)
├─ userId (FK)
├─ type
├─ message
├─ channels
├─ read
└─ createdAt

verifications
├─ id (PK)
├─ contractorId (FK)
├─ type (LICENSE, BACKGROUND_CHECK, INSURANCE_*)
├─ status
├─ expiresAt
└─ verifiedAt

auditLogs
├─ id (PK)
├─ timestamp
├─ action
├─ userId (FK)
├─ contractId (FK)
└─ details

transactions
├─ id (PK)
├─ type (PAYMENT, REFUND, FEE, PAYOUT)
├─ amount
├─ status
├─ date
└─ description
```

---

## Middleware Reference

### Available Middleware

```typescript
// Authentication
authMiddleware              // Verify JWT token
authorizationMiddleware     // Check user role

// Validation
validateRequest            // Validate request body

// Security
securityHeadersMiddleware   // Set security headers
sanitizeInputMiddleware     // Prevent injection attacks
rateLimitMiddleware        // Prevent abuse

// Logging & Monitoring
requestIdMiddleware        // Add request ID
requestLoggerMiddleware    // Log all requests
errorHandlerMiddleware     // Centralized error handling
```

### Using Middleware

```typescript
// On all routes
app.use(authMiddleware);

// On specific route
app.post('/api/contracts', authMiddleware, asyncHandler(async (req, res) => {
  // ...
}));

// With authorization
app.post('/api/admin/something',
  authMiddleware,
  authorizationMiddleware(['ADMIN']),
  asyncHandler(handler)
);

// With validation
app.post('/api/auth/register',
  validateRequest({ required: ['email', 'password'] }),
  asyncHandler(handler)
);
```

---

## Error Codes

### Error Format

All errors return consistent format:

```json
{
  "error": "User-friendly message",
  "code": "ERROR_CODE",
  "details": { "field": "value" },
  "requestId": "req_123456"
}
```

### Common Error Codes

```
VALIDATION_ERROR
- Missing required fields
- Invalid format
- Invalid value

AUTHENTICATION_ERROR
- NO_AUTH_TOKEN - Missing Authorization header
- INVALID_TOKEN - Token expired or invalid
- USER_NOT_FOUND - User doesn't exist

AUTHORIZATION_ERROR
- FORBIDDEN - User lacks permission
- INVALID_ROLE - Role not allowed

NOT_FOUND
- Resource doesn't exist
- User/contract/job not found

DUPLICATE_ERROR
- USER_ALREADY_EXISTS
- JOB_ALREADY_POSTED

BUSINESS_LOGIC_ERROR
- CANNOT_BID - User not verified
- CANNOT_COMPLETE - Job not in progress
- DISPUTE_WINDOW_CLOSED - Can't dispute after 5 days
- INVALID_AMOUNT - Amount doesn't match
- INVALID_STATUS - Status transition not allowed

RATE_LIMIT_EXCEEDED
- Too many requests

INTERNAL_ERROR
- Server error
```

---

## Quick Reference Cheat Sheet

### Typical User Journey

**Contractor:**
```
1. Sign up
2. Verify phone
3. Set up business profile
4. Upload license
5. Pass background check
6. Verify insurance
7. Set specializations
8. Browse jobs
9. Submit bid
10. Await selection
11. Complete work
12. Get paid
```

**Homeowner:**
```
1. Sign up
2. Verify phone
3. Post job
4. Receive bids
5. Award contract
6. Contractor works
7. Receive completion
8. Approve or dispute
9. Get invoiced
```

### Key Timeframes

```
Bid Response: 0-72 hours (contractor can bid)
Bidding Window: 3-7 days (homeowner can select)
Work Duration: Varies by job
Dispute Window: 5 days after submission
Mediation: 48 hours after dispute
Payment Release: 24 hours after approval
Refresh Token: 7 days
Access Token: 24 hours
Verification Cache: 1 year
```

### Payment Calculation

```
Contract: $X
Deposit (25%): $X × 0.25
Final (75%): $X × 0.75
Platform Fee (18%): $X × 0.18
Contractor Net (82%): $X × 0.82
```

---

## Support & Troubleshooting

### Server Won't Start

```bash
Error: Cannot find module 'express'
Solution: npm install express cors dotenv ts-node typescript
```

### Authorization Failed

```
Error: Authorization token required
Solution: Add header: Authorization: Bearer {accessToken}
```

### Database Connection

```
Error: Cannot connect to database
Solution:
1. Ensure MongoDB/PostgreSQL running
2. Check DATABASE_URL in .env
3. Verify connection credentials
```

### Rate Limit Exceeded

```
Error: Too many requests (429)
Solution: Wait before sending more requests
Current limits:
- Global: 1000 requests/hour
- Per endpoint: Varies
```

---

**This documentation is your complete reference for the FairTradeWorker system.**

For implementation details, see:
- BACKEND_IMPLEMENTATION_GUIDE.md
- BACKEND_FILES_MANIFEST.md
- QUICK_START.md

Good luck! 🚀

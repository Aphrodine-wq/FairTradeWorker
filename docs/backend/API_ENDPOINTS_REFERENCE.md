# FairTradeWorker API Endpoints Reference
## Complete Implementation (January 5, 2026)

---

## Authentication Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+12125551234",
  "password": "SecurePass123!@#",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CONTRACTOR|HOMEOWNER"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "CONTRACTOR"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!@#"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

### Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "token": "verification_token_from_email"
}

Response:
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123!@#"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJ..."
  }
}
```

### Logout
```
POST /api/auth/logout
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "refreshToken": "eyJ..."
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Payment Endpoints

### Create Payment Intent
```
POST /api/payments/create-intent
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "contractId": "contract_123",
  "amount": 50000,
  "currency": "usd",
  "type": "DEPOSIT|FINAL_PAYMENT"
}

Response:
{
  "success": true,
  "data": {
    "clientSecret": "pi_test_secret",
    "amount": 50000,
    "idempotencyKey": "DEPOSIT_contract_123_user_123",
    "status": "PENDING"
  }
}
```

### Confirm Payment
```
POST /api/payments/confirm
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "paymentIntentId": "pi_test_secret",
  "contractId": "contract_123"
}

Response:
{
  "success": true,
  "data": {
    "chargeId": "ch_123",
    "amount": 50000,
    "status": "SUCCEEDED",
    "receiptUrl": "https://..."
  }
}
```

### Process Refund
```
POST /api/payments/refund
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "chargeId": "ch_123",
  "amount": 50000,
  "reason": "DISPUTE_RESOLUTION|CONTRACT_CANCELLED",
  "contractId": "contract_123"
}

Response:
{
  "success": true,
  "data": {
    "refundId": "re_123",
    "amount": 50000,
    "status": "SUCCEEDED"
  }
}
```

### Payout to Contractor
```
POST /api/payments/payout
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "contractorId": "contractor_123",
  "amount": 44000,
  "contractId": "contract_123"
}

Response:
{
  "success": true,
  "data": {
    "payoutId": "payout_123",
    "amount": 44000,
    "status": "PENDING"
  }
}
```

### Get Contractor Wallet
```
GET /api/payments/wallet
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "available": 125000,
    "pending": 50000,
    "total": 175000
  }
}
```

---

## Bid Endpoints

### Submit Bid
```
POST /api/bids
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "jobId": "job_123",
  "amount": 50000,
  "timeline": "5 days",
  "proposal": "I can complete this efficiently"
}

Response:
{
  "success": true,
  "message": "Bid submitted successfully",
  "data": {
    "id": "bid_123",
    "jobId": "job_123",
    "amount": 50000,
    "status": "PENDING",
    "createdAt": "2026-01-05T12:00:00Z"
  }
}
```

### Get Job Bids (with blind bidding enforcement)
```
GET /api/jobs/{jobId}/bids
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "jobId": "job_123",
    "bidCount": 3,
    "bids": [
      {
        "id": "bid_123",
        "amount": 50000,
        "timeline": "5 days",
        "contractor": { ... }
      }
    ]
  }
}

Notes:
- Homeowner sees all bids
- Contractor sees only their own bid
- Non-bidders cannot access (401)
```

### Get Bid Details
```
GET /api/bids/{bidId}
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "id": "bid_123",
    "jobId": "job_123",
    "amount": 50000,
    "proposal": "...",
    "status": "PENDING"
  }
}
```

### Accept Bid (Creates Contract)
```
POST /api/bids/{bidId}/accept
Content-Type: application/json
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Bid accepted and contract created",
  "data": {
    "contract": {
      "id": "contract_123",
      "status": "ACTIVE",
      "amount": 50000,
      "acceptedAt": "2026-01-05T12:05:00Z"
    },
    "escrow": {
      "id": "escrow_123",
      "depositAmount": 12500
    }
  }
}

Notes:
- Automatically rejects all other bids
- Creates contract
- Initializes escrow
- Updates job status to CONTRACTED
```

### Reject Bid
```
POST /api/bids/{bidId}/reject
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "Bid rejected",
  "data": {
    "bidId": "bid_123"
  }
}
```

---

## Job Completion Endpoints

### Submit Completion (Contractor)
```
POST /api/contracts/{contractId}/submit-completion
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "photos": ["https://...", "https://..."],
  "videos": ["https://..."],
  "notes": "Work completed as specified",
  "geolocation": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}

Response:
{
  "success": true,
  "message": "Completion submitted successfully",
  "data": {
    "id": "completion_123",
    "contractId": "contract_123",
    "status": "SUBMITTED",
    "photos": 2,
    "submittedAt": "2026-01-05T15:00:00Z"
  }
}

Notes:
- 1-20 photos required
- Up to 5 videos allowed
- Sets 7-day dispute window
```

### Get Completion Details
```
GET /api/contracts/{contractId}/completion
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "id": "completion_123",
    "photos": [...],
    "videos": [...],
    "notes": "...",
    "status": "SUBMITTED|APPROVED|REJECTED",
    "rating": 5,
    "feedback": "Great work!"
  }
}
```

### Approve/Reject Completion (Homeowner)
```
POST /api/completions/{completionId}/approve
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "approved": true,
  "rating": 5,
  "feedback": "Excellent work, very professional"
}

Response:
{
  "success": true,
  "message": "Completion approved",
  "data": {
    "completionId": "completion_123",
    "status": "APPROVED",
    "contractId": "contract_123"
  }
}

Notes:
- If approved: Triggers final payment release
- If rejected: Keeps contract ACTIVE for redo
- Auto-creates payout on approval
```

---

## Dispute Endpoints

### Initiate Dispute (Homeowner)
```
POST /api/contracts/{contractId}/initiate-dispute
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "reason": "Work does not meet specifications",
  "evidence": ["https://photo1.jpg", "https://photo2.jpg"],
  "requestedResolution": "REFUND|REDO|PARTIAL"
}

Response:
{
  "success": true,
  "message": "Dispute initiated successfully",
  "data": {
    "contractId": "contract_123",
    "status": "OPEN",
    "createdAt": "2026-01-05T16:00:00Z"
  }
}

Notes:
- Only within 7 days of completion submission
- Funds held in escrow immediately
```

### Contest Dispute (Contractor)
```
POST /api/contracts/{contractId}/contest-dispute
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "response": "We completed the work as specified",
  "evidence": ["https://proof1.jpg"],
  "requestedResolution": "REFUND|REDO|PARTIAL"
}

Response:
{
  "success": true,
  "message": "Dispute response submitted successfully",
  "data": {
    "contractId": "contract_123",
    "status": "CONTESTED"
  }
}
```

### Resolve Dispute (Admin)
```
POST /api/disputes/{disputeId}/resolve
Content-Type: application/json
Authorization: Bearer {accessToken}

{
  "resolution": "REFUND|REDO|PARTIAL_REFUND",
  "notes": "Resolution notes",
  "contractorPayout": 25000,
  "homeownerRefund": 25000
}

Response:
{
  "success": true,
  "message": "Dispute resolved successfully",
  "data": {
    "disputeId": "dispute_123",
    "resolution": "REFUND",
    "resolvedAt": "2026-01-05T17:00:00Z"
  }
}

Notes:
- REFUND: Full refund to homeowner
- REDO: Contractor redo work
- PARTIAL_REFUND: Split funds
```

---

## System Endpoints

### Health Check
```
GET /api/health

Response:
{
  "status": "OK",
  "timestamp": "2026-01-05T12:00:00Z",
  "uptime": 3600
}
```

### System Status (Admin)
```
GET /api/status
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "memory": {
      "used": 245,
      "total": 512
    },
    "uptime": 3600,
    "services": {
      "database": "connected",
      "stripe": "configured",
      "notifications": "active"
    }
  }
}
```

### Features List
```
GET /api/features

Response:
{
  "success": true,
  "completionStatus": "70%",
  "data": {
    "phase1_security": { ... },
    "phase2_payments": { ... },
    "phase3_bidding": { ... },
    "phase4_completion": { ... }
  }
}
```

### Endpoints Documentation
```
GET /api/endpoints

Response:
{
  "success": true,
  "totalEndpoints": 35,
  "data": {
    "authentication": [...],
    "payments": [...],
    "bids": [...],
    "completion": [...]
  }
}
```

---

## Error Responses

### Standard Error Format
```
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Common Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid auth
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate/conflict
- `500 Server Error` - Internal error

### Common Error Codes
- `INVALID_EMAIL` - Email format invalid
- `PASSWORD_TOO_SHORT` - Password < 8 chars
- `INVALID_AMOUNT` - Amount < $1
- `BID_ALREADY_EXISTS` - Contractor already bid
- `UNAUTHORIZED` - User not allowed
- `CONTRACT_NOT_FOUND` - Contract missing
- `COMPLETION_NOT_FOUND` - Completion missing
- `DISPUTE_WINDOW_CLOSED` - Dispute > 7 days old

---

## Authentication

### Bearer Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Access Token: 24 hours
- Refresh Token: 7 days

### Token Refresh
```
POST /api/auth/refresh-token
{
  "refreshToken": "eyJ..."
}
```

---

## Rate Limiting

Currently implemented with configurable limits:
- `/api/auth/login` - 10 requests per 15 minutes
- `/api/payments/*` - 30 requests per minute
- `/api/bids/*` - 50 requests per minute
- Default - 100 requests per minute

---

## API Versioning

- Current version: `1.0.0`
- Version header: `X-API-Version: 1.0.0`
- Deprecation: 90 days notice before removal

---

## Webhook Events

### Stripe Payment Events
- `charge.succeeded` - Payment successful
- `charge.failed` - Payment failed
- `refund.created` - Refund initiated
- `payment_intent.succeeded` - Payment intent confirmed
- `payment_intent.payment_failed` - Payment intent failed

### FairTradeWorker Events
- `bid.submitted` - New bid received
- `bid.accepted` - Bid accepted
- `completion.submitted` - Work marked complete
- `dispute.initiated` - Dispute started
- `dispute.resolved` - Dispute resolved

---

**API Documentation Updated:** January 5, 2026
**Total Endpoints:** 35+
**Status:** PRODUCTION READY

---

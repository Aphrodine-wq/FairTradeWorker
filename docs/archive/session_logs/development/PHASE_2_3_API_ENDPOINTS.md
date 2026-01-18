# PHASE 2 & 3: Core Features & Customization - API Endpoints

**Status:** Implementation Ready
**PHASE 2:** Core Features (Bids, Contracts, Completion)
**PHASE 3:** Analytics & Advanced Customization

---

## Authentication

All `/api/*` endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer <JWT_TOKEN>
```

---

## PHASE 2: CORE FEATURES API

### Jobs Management

#### Create Job (Homeowner)
```http
POST /api/jobs
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "Kitchen Renovation",
  "description": "Complete kitchen remodel including cabinets, countertops, and appliances",
  "category": "HOME_RENOVATION",
  "budget": 15000,
  "location": "123 Main St, Portland, OR 97201",
  "zipCode": "97201",
  "estimatedDays": 14,
  "images": ["https://example.com/image1.jpg"],
  "preferredTradeTypes": ["GENERAL_CONTRACTOR", "CARPENTER"],
  "minimumRating": 4.5
}

Response:
{
  "success": true,
  "data": {
    "id": "job_abc123",
    "title": "Kitchen Renovation",
    "status": "OPEN",
    "budget": 15000,
    "postedAt": "2026-01-04T10:00:00Z",
    "postedBy": { ... }
  }
}
```

#### Get Job
```http
GET /api/jobs/:jobId
Authorization: Bearer <TOKEN>

Response:
{
  "id": "job_abc123",
  "title": "Kitchen Renovation",
  "description": "...",
  "status": "OPEN",
  "budget": 15000,
  "bids": [
    {
      "id": "bid_123",
      "amount": 14500,
      "timeline": "10 days",
      "contractor": { ... }
    }
  ],
  "contract": null
}
```

#### List Jobs (with filters)
```http
GET /api/jobs?category=HOME_RENOVATION&minBudget=10000&maxBudget=20000&page=1&limit=20
Authorization: Bearer <TOKEN>

Response:
{
  "jobs": [ ... ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

#### Update Job (Homeowner)
```http
PATCH /api/jobs/:jobId
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "Kitchen Renovation (Updated)",
  "budget": 16000,
  "status": "OPEN"
}
```

#### Close Job (no more bids)
```http
POST /api/jobs/:jobId/close
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "message": "Job closed"
}
```

---

### Bids Management

#### Submit Bid (Contractor)
```http
POST /api/bids
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "jobId": "job_abc123",
  "amount": 14500,
  "timeline": "10 days",
  "proposal": "I can complete this kitchen renovation on time and within budget..."
}

Response:
{
  "success": true,
  "data": {
    "id": "bid_123",
    "jobId": "job_abc123",
    "amount": 14500,
    "timeline": "10 days",
    "status": "SUBMITTED",
    "contractor": { ... }
  }
}
```

#### Get Job Bids (Homeowner views all bids)
```http
GET /api/jobs/:jobId/bids
Authorization: Bearer <TOKEN>

Response:
{
  "bids": [
    {
      "id": "bid_123",
      "amount": 14500,
      "timeline": "10 days",
      "status": "SUBMITTED",
      "contractor": {
        "firstName": "John",
        "lastName": "Smith",
        "averageRating": 4.8,
        "totalReviews": 24,
        "completedJobs": 18
      }
    },
    { ... }
  ]
}
```

#### Get Contractor Bids
```http
GET /api/bids?status=SUBMITTED&page=1&limit=20
Authorization: Bearer <TOKEN>

Response:
{
  "bids": [ ... ],
  "stats": {
    "total": 45,
    "submitted": 12,
    "accepted": 3,
    "rejected": 30,
    "winRate": 6.7
  }
}
```

#### Get Bid Details
```http
GET /api/bids/:bidId
Authorization: Bearer <TOKEN>

Response:
{
  "id": "bid_123",
  "jobId": "job_abc123",
  "amount": 14500,
  "timeline": "10 days",
  "proposal": "...",
  "status": "SUBMITTED",
  "contractor": { ... },
  "job": { ... }
}
```

#### Accept Bid (Homeowner) → Creates Contract
```http
POST /api/bids/:bidId/accept
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "data": {
    "contractId": "contract_xyz789",
    "status": "ACCEPTED",
    "amount": 14500,
    "depositAmount": 3625,           // 25%
    "finalAmount": 10875,            // 75%
    "platformFee": 2175,             // 15%
    "contractorNet": 12325,          // 85%
    "acceptedAt": "2026-01-04T10:30:00Z"
  }
}
```

#### Reject Bid (Homeowner)
```http
POST /api/bids/:bidId/reject
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "message": "Bid rejected"
}
```

#### Withdraw Bid (Contractor)
```http
POST /api/bids/:bidId/withdraw
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "message": "Bid withdrawn"
}
```

---

### Contracts Management

#### Get Contract
```http
GET /api/contracts/:contractId
Authorization: Bearer <TOKEN>

Response:
{
  "id": "contract_xyz789",
  "status": "ACTIVE",
  "amount": 14500,
  "depositAmount": 3625,
  "finalAmount": 10875,
  "platformFee": 2175,
  "contractorNet": 12325,
  "job": { ... },
  "homeowner": { ... },
  "contractor": { ... },
  "escrow": { ... },
  "completion": null,
  "acceptedAt": "2026-01-04T10:30:00Z"
}
```

#### List Homeowner Contracts
```http
GET /api/contracts?role=homeowner&status=ACTIVE&page=1&limit=20
Authorization: Bearer <TOKEN>

Response:
{
  "contracts": [ ... ],
  "total": 5
}
```

#### List Contractor Contracts
```http
GET /api/contracts?role=contractor&status=ACTIVE&page=1&limit=20
Authorization: Bearer <TOKEN>

Response:
{
  "contracts": [ ... ],
  "total": 3
}
```

#### Submit Job Completion (Contractor)
```http
POST /api/contracts/:contractId/complete
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "photos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg"
  ],
  "videos": [
    "https://example.com/video1.mp4"
  ],
  "notes": "Work completed as per specification. All materials high quality.",
  "geolocation": {
    "latitude": 45.5152,
    "longitude": -122.6784
  }
}

Response:
{
  "success": true,
  "data": {
    "completionId": "completion_123",
    "contractId": "contract_xyz789",
    "status": "SUBMITTED",
    "submittedAt": "2026-01-04T15:00:00Z",
    "disputeWindow": "2026-01-11T15:00:00Z"
  }
}
```

#### Approve/Reject Completion (Homeowner)
```http
POST /api/contracts/:contractId/completion/approve
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "completionId": "completion_123",
  "approved": true,
  "rating": 5,
  "feedback": "Excellent work! Very satisfied with the results."
}

Response (if approved):
{
  "success": true,
  "data": {
    "contractId": "contract_xyz789",
    "status": "COMPLETED",
    "completedAt": "2026-01-04T16:00:00Z",
    "finalPaymentReleased": true
  }
}

Response (if rejected):
{
  "success": true,
  "data": {
    "contractId": "contract_xyz789",
    "status": "RESUBMISSION_REQUIRED",
    "feedback": "The countertops need adjustment"
  }
}
```

#### Create Change Order
```http
POST /api/contracts/:contractId/change-order
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "Additional bathroom tile",
  "description": "Homeowner requested additional tile work in master bathroom",
  "amount": 2000
}

Response:
{
  "success": true,
  "data": {
    "changeOrderId": "co_123",
    "contractId": "contract_xyz789",
    "amount": 2000,
    "status": "PENDING",
    "createdAt": "2026-01-04T10:00:00Z"
  }
}
```

#### Approve Change Order (Homeowner)
```http
POST /api/contracts/:contractId/change-order/:changeOrderId/approve
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "approved": true
}

Response:
{
  "success": true,
  "data": {
    "changeOrderId": "co_123",
    "status": "APPROVED",
    "newContractAmount": 16500
  }
}
```

#### Cancel Contract
```http
POST /api/contracts/:contractId/cancel
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "reason": "Contractor not responding to messages"
}

Response:
{
  "success": true,
  "message": "Contract cancelled"
}
```

---

## PHASE 3: ANALYTICS & CUSTOMIZATION API

### Analytics Endpoints

#### Get Bid Analytics (Contractor)
```http
GET /api/analytics/bids
Authorization: Bearer <TOKEN>

Response:
{
  "totalBids": 45,
  "acceptedBids": 3,
  "recentBids": 12,
  "avgBidAmount": 12500,
  "winRate": 6.7,
  "responseTimeHours": 2.3
}
```

#### Get Revenue Analytics (Contractor)
```http
GET /api/analytics/revenue?days=30
Authorization: Bearer <TOKEN>

Response:
{
  "period": "Last 30 days",
  "completedContracts": 3,
  "totalRevenue": 42000,
  "totalFeesPaid": 6300,
  "netEarnings": 35700,
  "avgContractValue": 14000,
  "weeklyData": {
    "week_0": { "revenue": 12325, "count": 1 },
    "week_1": { "revenue": 10875, "count": 1 }
  }
}
```

#### Get Homeowner Dashboard
```http
GET /api/analytics/dashboard/homeowner
Authorization: Bearer <TOKEN>

Response:
{
  "activeJobs": 3,
  "completedJobs": 12,
  "totalSpent": 125000,
  "activeContracts": 2
}
```

#### Get Platform Metrics (Admin)
```http
GET /api/analytics/platform
Authorization: Bearer <ADMIN_TOKEN>

Response:
{
  "totalUsers": 5230,
  "contractors": 3100,
  "homeowners": 2130,
  "totalJobs": 15420,
  "completedJobs": 8530,
  "totalPlatformRevenue": 1275000
}
```

#### Export Analytics as CSV
```http
GET /api/analytics/export?type=bids&format=csv
Authorization: Bearer <TOKEN>

Response: CSV file download
```

---

### Customization Endpoints (PHASE 3)

#### Get User Customization Settings
```http
GET /api/customization
Authorization: Bearer <TOKEN>

Response:
{
  "primaryColor": "#3B82F6",
  "secondaryColor": "#10B981",
  "backgroundColor": "#FFFFFF",
  "textColor": "#1F2937",
  "fontFamily": "Inter, sans-serif",
  "headingSize": "medium",
  "bodySize": "medium",
  "spacing": "normal",
  "borderRadius": "rounded",
  "glassMorphism": false,
  "darkMode": false,
  "colorBlindnessMode": "none",
  "dyslexiaFont": false,
  "largeText": false,
  "highContrast": false,
  "sidebarPosition": "left",
  "sidebarCollapsed": false,
  "showBreadcrumbs": true,
  "showNavigation": true,
  "whiteLabel": false
}
```

#### Update Customization Settings
```http
PATCH /api/customization
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "darkMode": true,
  "primaryColor": "#60A5FA",
  "headingSize": "large",
  "spacing": "spacious"
}

Response:
{
  "success": true,
  "data": { ... updated theme ... }
}
```

#### Get Available Presets
```http
GET /api/customization/presets
Authorization: Bearer <TOKEN>

Response:
{
  "presets": {
    "light": { ... },
    "dark": { ... },
    "professional": { ... },
    "compact": { ... },
    "accessible": { ... }
  }
}
```

#### Apply Preset
```http
POST /api/customization/preset/:presetName
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "data": { ... applied theme ... }
}
```

#### Get Customization Features by Tier
```http
GET /api/customization/features
Authorization: Bearer <TOKEN>

Response:
{
  "currentTier": "PRO",
  "availableFeatures": [
    "theme_selection",
    "dark_mode",
    "color_picker",
    "accessibility_full",
    "font_customization",
    "logo_upload",
    "navigation_customization"
  ],
  "upgradeTo": "ELITE",
  "upgradeFeatures": [
    "brand_customization",
    "email_templates",
    "glassmorphism",
    "white_label"
  ]
}
```

---

## Response Format

All successful responses:
```json
{
  "success": true,
  "data": { ... },
  "requestId": "req_1234567890"
}
```

All error responses:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "code": "HTTP_CODE",
  "requestId": "req_1234567890"
}
```

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `AUTH_MISSING_TOKEN` | 401 | No authentication token provided |
| `AUTH_INVALID_TOKEN` | 403 | Token invalid or expired |
| `AUTH_INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `UNAUTHORIZED_ACTION` | 403 | User cannot perform this action |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate bid) |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Workflow Examples

### Complete Bid Workflow

1. **Homeowner Posts Job**
   ```
   POST /api/jobs
   ```

2. **Contractors Submit Bids**
   ```
   POST /api/bids (multiple contractors)
   ```

3. **Homeowner Reviews Bids**
   ```
   GET /api/jobs/:jobId/bids
   ```

4. **Homeowner Accepts Best Bid**
   ```
   POST /api/bids/:bidId/accept  → Creates contract
   ```

5. **Contract Active**
   ```
   GET /api/contracts/:contractId
   ```

6. **Contractor Completes Work**
   ```
   POST /api/contracts/:contractId/complete
   ```

7. **Homeowner Approves Completion**
   ```
   POST /api/contracts/:contractId/completion/approve
   ```

8. **Payment Released**
   ```
   Contract marked COMPLETED
   Final payment transferred to contractor
   ```

---

## Implementation Status

| Feature | Status | File |
|---------|--------|------|
| Job Management | ✅ Ready | `jobService.ts` |
| Bid Management | ✅ Ready | `bidService.ts` |
| Contract Management | ✅ Ready | `contractService.ts` |
| Bid Analytics | ✅ Ready | `analyticsAndCustomizationService.ts` |
| Revenue Analytics | ✅ Ready | `analyticsAndCustomizationService.ts` |
| Customization | ✅ Ready | `analyticsAndCustomizationService.ts` |
| Tier-based Features | ✅ Ready | `analyticsAndCustomizationService.ts` |

---

## Next Steps

1. Integrate services into `backend/server.ts`
2. Create route handlers for all endpoints
3. Add comprehensive error handling
4. Implement payment integration (escrow)
5. Add notification triggers for each step
6. Run end-to-end testing
7. Deploy to staging environment

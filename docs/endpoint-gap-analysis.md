# Endpoint Gap Analysis

Date: 2026-05-01

Scope: Frontend endpoint expectations audited against `src/shared/lib/realtime.ts`, `src/shared/lib/data.ts`, and explicit gap stubs in `src/shared/lib/ftw-svc-gaps.ts`.  
Exclusion: Demo profile content (Homeowner/Contractor identity fixtures) is excluded.

## Needs-Implementing Endpoints (Explicit ftw-svc Gaps)

These are explicitly marked as not implemented via `FtwSvcGapError` helpers in `src/shared/lib/ftw-svc-gaps.ts`.


| Method | Endpoint                                  | Frontend usage                                                 |
| ------ | ----------------------------------------- | -------------------------------------------------------------- |
| POST   | `/api/auth/forgot-password`               | `requestPasswordReset()` on forgot-password screen             |
| POST   | `/api/auth/reset-password`                | `resetPassword()` on reset-password screen                     |
| POST   | `/api/auth/change-password`               | `changePassword()` in settings/password flows                  |
| POST   | `/api/contact`                            | `submitContactForm()` from contact page                        |
| POST   | `/api/homeowner/property`                 | `saveHomeownerProperty()` during homeowner property onboarding |
| POST   | `/api/jobs/{jobId}/ai-estimate`           | `generateJobEstimate()` for job-linked AI estimates            |
| GET    | `/api/estimates/{id}/pdf`                 | `getEstimatePdf()` from estimates PDF action                   |
| GET    | `/api/integrations/quickbooks/status`     | `getQuickBooksStatus()` in contractor settings                 |
| GET    | `/api/integrations/quickbooks/connect`    | `startQuickBooksConnect()` in contractor settings              |
| POST   | `/api/integrations/quickbooks/disconnect` | `disconnectQuickBooks()` in contractor settings                |
| GET    | `/api/auth/quickbooks`                    | `startQuickBooksSignIn()` from login QuickBooks SSO button     |


## Missing / Underspecified Endpoints (Inferred from Hardcoded Data Dependence)

These are not explicitly listed in `ftw-svc-gaps.ts`, but frontend pages still rely on hardcoded/mock data or incomplete contracts and need backend coverage.


| Method   | Endpoint                                    | Why needed                                                                                   |
| -------- | ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| GET      | `/api/contractor/dashboard`                 | Replace contractor KPI fixtures (`contractorDashboardStats`) and static dashboard aggregates |
| GET      | `/api/homeowner/dashboard`                  | Replace homeowner dashboard stats and summary strips (`homeownerDashboardStats`)             |
| GET/POST | `/api/projects/{id}/change-orders`          | Contractor projects page currently uses local change-order fixtures                          |
| GET/POST | `/api/projects/{id}/punch-items`            | Contractor projects page uses local punch-list fixtures                                      |
| GET/POST | `/api/projects/{id}/expenses`               | Contractor projects page uses local expense/cost fixtures                                    |
| GET/POST | `/api/projects/{id}/documents`              | Contractor projects page uses local document registry fixtures                               |
| GET      | `/api/projects/{id}/invoiceable-milestones` | Contractor invoices page uses local milestone-invoicing fixture map                          |
| GET      | `/api/estimate-templates`                   | Contractor work page uses local estimate template fixtures                                   |
| GET      | `/api/subcontractors/{id}/earnings-summary` | Subcontractor payments page uses static earnings stats                                       |
| GET      | `/api/subcontractors/{id}/payouts`          | Subcontractor payments view needs payout history data                                        |
| GET      | `/api/public/stats`                         | Marketing stats bar currently uses hardcoded platform stats                                  |
| GET      | `/api/taxonomies/job-categories`            | Move static job category/filter definitions to backend taxonomy                              |
| GET      | `/api/taxonomies/trades`                    | Move subcontractor skill/category filters to backend taxonomy                                |


## Expected GET Response Contracts (for ftw-svc Implementation)

Use these as the canonical response targets for GET endpoints listed in the two sections above.

### 1) Explicit ftw-svc gap GET endpoints

#### GET `/api/estimates/{id}/pdf`

- Purpose: Download contractor estimate PDF
- Success response:
  - HTTP `200`
  - `Content-Type: application/pdf`
  - Binary PDF stream body
  - Suggested header: `Content-Disposition: attachment; filename="estimate-{id}.pdf"`
- Error response:
  - HTTP `404`: `{ "error": "Estimate not found" }`
  - HTTP `403`: `{ "error": "Unauthorized" }`

#### GET `/api/integrations/quickbooks/status`

- Purpose: Integration status for contractor settings
- Success response (`200`):

```json
{
  "connected": true,
  "realmId": "1231458477",
  "companyName": "Acme Contracting LLC",
  "lastSyncAt": "2026-05-01T14:10:00.000Z",
  "tokenExpiresAt": "2026-05-01T15:10:00.000Z",
  "features": {
    "invoiceSync": true,
    "payouts": true,
    "receipts": true,
    "webhooks": true
  }
}
```

#### GET `/api/integrations/quickbooks/connect`

- Purpose: Start OAuth connect flow
- Success response (`200`):

```json
{
  "authUrl": "https://appcenter.intuit.com/connect/oauth2?...",
  "state": "csrf-state-token",
  "expiresInSeconds": 600
}
```

#### GET `/api/auth/quickbooks`

- Purpose: Login page QuickBooks SSO
- Success response (`200`):

```json
{
  "authUrl": "https://appcenter.intuit.com/connect/oauth2?...",
  "state": "sso-state-token",
  "expiresInSeconds": 600
}
```

### 2) Inferred missing GET endpoints

#### GET `/api/contractor/dashboard`

```json
{
  "jobMarketplace": {
    "count": 2,
    "items": [
      {
        "id": "j2",
        "title": "Bathroom remodel",
        "thumbnail": "https://cdn.example.com/jobs/j2.jpg",
        "location": "Tupelo, MS",
        "description": "Remodel bathroom to include new tile, fixtures, and vanity",
        "category": "Remodeling",
        "budget": {
          "min": 50,
          "max": 100
        },
        "bidsCount": 1,
        "estimatedDuration": "4-6 weeks",
        "status": "open"
      }
    ]
  },
  "milestones": {
    "inProgressCount": 4,
    "items": [
      {
        "projectId": "j1",
        "project": "Kitchen Remodel",
        "client": "Michael Brown",
        "label": "Countertops",
        "milestoneIndex": 3,
        "status": "in_progress"
      },
      {
        "projectId": "j1",
        "project": "Kitchen Remodel",
        "client": "Michael Brown",
        "label": "Cabinet install",
        "milestoneIndex": 2,
        "status": "done"
      }
    ]
  },
  "estimateHistory": {
    "count": 8,
    "items": [
      {
        "id": "e1",
        "clientName": "Michael Brown",
        "amount": 385,
        "status": "sent",
        "createdAt": "2026-05-01T13:00:00.000Z"
      },
      {
        "id": "e2",
        "clientName": "Robert Davis",
        "amount": 220,
        "status": "viewed",
        "createdAt": "2026-05-01T11:00:00.000Z"
      }
    ]
  },
  "scorecard": {
    "revenue": {
      "amount": 485,
      "changePct": 12.5
    },
    "rating": {
      "value": 4.9,
      "reviewsCount": 5
    },
    "winRatePct": 78,
    "pendingAmount": 1836,
    "responseTime": "2.4 hrs",
    "source": {
      "activeJobs": 8,
      "estimatesSent": 14,
      "estimatesAccepted": 11
    }
  }
}
```

#### GET `/api/homeowner/dashboard`

```json
{
  "stats": {
    "activeProjects": 2,
    "pendingBids": 5,
    "totalSpentToDate": 22400,
    "savedVsLocalAverage": 3100
  },
  "projects": [
    {
      "id": "proj_44",
      "title": "Bathroom Remodel",
      "status": "in_progress",
      "progressPct": 62,
      "budget": 18000,
      "spent": 11200,
      "contractor": {
        "id": "ctr_9",
        "name": "Acme Contracting"
      }
    }
  ],
  "nextMilestone": {
    "id": "ms_44_3",
    "projectId": "proj_44",
    "label": "Tile install complete",
    "dueDate": "2026-05-06",
    "amountDue": 2400
  }
}
```

#### GET `/api/projects/{id}/change-orders`

```json
{
  "projectId": "proj_44",
  "changeOrders": [
    {
      "id": "co_1",
      "title": "Upgrade shower fixtures",
      "status": "approved",
      "requestedBy": "homeowner",
      "costDelta": 950,
      "daysDelta": 1,
      "createdAt": "2026-04-28T16:15:00.000Z"
    }
  ]
}
```

#### GET `/api/projects/{id}/punch-items`

```json
{
  "projectId": "proj_44",
  "items": [
    {
      "id": "pi_1",
      "title": "Touch up paint near vanity",
      "status": "open",
      "priority": "medium",
      "assignee": "crew_member_3",
      "dueDate": "2026-05-05"
    }
  ]
}
```

#### GET `/api/projects/{id}/expenses`

```json
{
  "projectId": "proj_44",
  "totals": {
    "budget": 18000,
    "spent": 11200,
    "remaining": 6800
  },
  "expenses": [
    {
      "id": "exp_1",
      "category": "materials",
      "vendor": "Home Depot",
      "amount": 1245.67,
      "incurredAt": "2026-04-30",
      "receiptUrl": "https://files.example.com/receipts/exp_1.pdf"
    }
  ]
}
```

#### GET `/api/projects/{id}/documents`

```json
{
  "projectId": "proj_44",
  "documents": [
    {
      "id": "doc_1",
      "name": "Permit Approval.pdf",
      "type": "permit",
      "uploadedBy": "contractor",
      "uploadedAt": "2026-04-20T13:00:00.000Z",
      "url": "https://files.example.com/projects/proj_44/permit-approval.pdf"
    }
  ]
}
```

#### GET `/api/projects/{id}/invoiceable-milestones`

```json
{
  "projectId": "proj_44",
  "milestones": [
    {
      "id": "ms_44_2",
      "label": "Demo complete",
      "status": "completed",
      "completedAt": "2026-04-29T18:00:00.000Z",
      "amount": 3200,
      "alreadyInvoiced": false
    }
  ]
}
```

#### GET `/api/estimate-templates`

```json
{
  "templates": [
    {
      "id": "tpl_bathroom_mid",
      "name": "Bathroom Remodel (Mid-range)",
      "projectType": "bathroom-remodel",
      "quality": "mid-range",
      "lineItems": [
        { "name": "Demolition", "unit": "lot", "qty": 1, "unitPrice": 1200 },
        { "name": "Tile Installation", "unit": "sqft", "qty": 120, "unitPrice": 14.5 }
      ],
      "defaultMarkupPct": 18
    }
  ]
}
```

#### GET `/api/subcontractors/{id}/earnings-summary`

```json
{
  "subcontractorId": "sub_21",
  "period": "month_to_date",
  "totalEarned": 12450,
  "pendingPayout": 2800,
  "completedJobs": 6,
  "avgDaysToPayout": 7
}
```

#### GET `/api/subcontractors/{id}/payouts`

```json
{
  "subcontractorId": "sub_21",
  "payouts": [
    {
      "id": "pay_91",
      "projectId": "proj_44",
      "subJobId": "subjob_8",
      "amount": 1850,
      "status": "paid",
      "initiatedAt": "2026-04-21T16:00:00.000Z",
      "paidAt": "2026-04-24T10:30:00.000Z",
      "reference": "QB-BILLPAY-33881"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

#### GET `/api/public/stats`

```json
{
  "activeContractors": 1240,
  "projectsCompleted": 9875,
  "avgHomeownerSavingsPct": 12.7,
  "avgPaymentReleaseDays": 2.1,
  "updatedAt": "2026-05-01T14:00:00.000Z"
}
```

#### GET `/api/taxonomies/job-categories`

```json
{
  "categories": [
    {
      "id": "kitchen-remodel",
      "label": "Kitchen Remodel",
      "active": true,
      "sortOrder": 10
    },
    {
      "id": "roofing",
      "label": "Roofing",
      "active": true,
      "sortOrder": 20
    }
  ]
}
```

#### GET `/api/taxonomies/trades`

```json
{
  "trades": [
    {
      "id": "electrical",
      "label": "Electrical",
      "active": true,
      "sortOrder": 10
    },
    {
      "id": "plumbing",
      "label": "Plumbing",
      "active": true,
      "sortOrder": 20
    }
  ]
}
```

## Covered Contracts (Not Missing, Wiring/Adoption Work Remaining)

These already exist as frontend API contracts in `realtime.ts` and `data.ts`:

- Jobs and bids: `listJobs`, `getJob`, `placeBid`, `acceptBid`
- Estimates: `listEstimates`, `getEstimate`, `createEstimate`, `updateEstimate`, `deleteEstimate`
- Invoices: `listInvoices`, `getInvoice`, `createInvoice`, `updateInvoice`
- Projects (base CRUD): `listProjects`, `getProject`, `createProject`, `updateProject`
- Clients (base CRUD): `listClients`, `getClient`, `createClient`, `updateClient`, `deleteClient`
- Notifications: `listNotifications`, read/mark actions
- Conversations/messages: `listConversations`, `listMessages`, `sendMessage`
- Fair records: `listFairRecords`, `getPublicRecord`, `getProjectRecord`
- Settings/verification: `getSettings`, `updateSettings`, `getVerificationStatus`, `submitVerificationStep`
- Subcontractor marketplace: `listSubJobs`, `getSubJob`, `createSubJob`, `placeSubBid`, `acceptSubBid`, `getSubContractorStats`

## Priority

### P0

- All endpoints in **Needs-Implementing Endpoints (Explicit ftw-svc Gaps)**.
- `GET /api/contractor/dashboard`
- `GET /api/homeowner/dashboard`

### P1

- Project operations subresources:
  - `/api/projects/{id}/change-orders`
  - `/api/projects/{id}/punch-items`
  - `/api/projects/{id}/expenses`
  - `/api/projects/{id}/documents`
- `GET /api/projects/{id}/invoiceable-milestones`
- Subcontractor payments:
  - `/api/subcontractors/{id}/earnings-summary`
  - `/api/subcontractors/{id}/payouts`

### P2

- `GET /api/estimate-templates`
- `GET /api/public/stats`
- Taxonomy endpoints:
  - `/api/taxonomies/job-categories`
  - `/api/taxonomies/trades`


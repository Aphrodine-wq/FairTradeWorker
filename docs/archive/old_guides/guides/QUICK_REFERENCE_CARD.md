# FairTradeWorker API - Quick Reference Card

**Last Updated:** January 4, 2026
**Total Endpoints:** 83

---

## 🎯 Find Endpoints by Use Case

### Job Discovery
```
GET /api/jobs/search/advanced          # Advanced filtering
GET /api/jobs/sorted                   # Custom sorting
GET /api/jobs/trending                 # Popular jobs
GET /api/jobs/search/fulltext          # Text search
GET /api/jobs/recommendations/contractor # Recommended for you
```

### Bidding
```
GET /api/jobs/:jobId/bids/compare      # Compare all bids
GET /api/jobs/:jobId/bids/analytics    # Bid statistics
GET /api/jobs/:jobId/bids/recommendations # Recommended bids
GET /api/bids/recommended              # Jobs you'd win
GET /api/contractors/:id/performance   # Contractor stats
GET /api/market/analysis               # Market data
```

### Contract Management
```
POST /api/contracts/:id/milestones     # Add project phase
GET /api/contracts/:id/milestones      # View all phases
GET /api/contracts/:id/progress        # Overall progress
GET /api/contracts/:id/health          # Health score
GET /api/contracts/:id/analytics       # Financial report
PATCH /api/contracts/:id/milestones/:id/complete # Mark done
```

### Payments & Escrow
```
POST /api/payments/escrow/create       # Create escrow
POST /api/payments/escrow/:id/deposit  # Deposit funds
POST /api/payments/escrow/:id/release/milestone # Release payment
GET /api/payments/contract/:id/summary # Payment overview
POST /api/payments/dispute             # Create dispute
```

### Notifications
```
POST /api/notifications/send           # Send immediately
POST /api/notifications/schedule       # Schedule later
GET /api/notifications/preferences     # View settings
PATCH /api/notifications/preferences   # Update settings
GET /api/notifications/history         # View history
```

### Customization
```
GET /api/customization/all             # All 200+ options
PATCH /api/customization/batch         # Update multiple
GET /api/customization/category/:cat   # By category
GET /api/customization/presets/advanced # Available themes
POST /api/customization/preset/advanced/:name # Apply theme
```

---

## 🔑 Common Query Parameters

### Search & Filter
```
?category=Renovation        # Filter by category
?minBudget=5000            # Minimum budget
?maxBudget=50000           # Maximum budget
?location=San%20Francisco  # By location
?radiusMiles=10            # Radius search
?status=OPEN               # Contract status
```

### Pagination
```
?page=1                    # Page number
?limit=20                  # Results per page
```

### Sorting
```
?sortBy=recent             # Options: recent, budget-high, budget-low, rating, distance
?order=desc                # asc or desc
```

### Date Range
```
?startDate=2026-01-01      # Start date
?endDate=2026-01-31        # End date
?days=30                   # Last N days
```

---

## 📊 Response Format

All endpoints return:
```json
{
  "success": true,
  "data": { },
  "message": "Optional",
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

## 🔐 Authentication

All endpoints require:
```
Authorization: Bearer {jwt_token}
```

---

## 🚀 Most Common Endpoints

**For Homeowners:**
1. POST /api/jobs - Create job
2. GET /api/jobs/:id/bids/compare - Compare bids
3. GET /api/jobs/:id/bids/recommendations - Get recommendations
4. POST /api/bids/:id/accept - Accept a bid
5. POST /api/contracts/:id/milestones - Track progress

**For Contractors:**
1. GET /api/jobs/search/advanced - Find opportunities
2. GET /api/jobs/recommendations/contractor - Get matched jobs
3. POST /api/bids - Submit a bid
4. GET /api/contractors/:id/performance - View your stats
5. GET /api/bids/recommended - See best opportunities

---

## 📝 Example Request Bodies

### Create Job
```json
{
  "title": "Kitchen Renovation",
  "budget": 15000,
  "category": "Renovation",
  "location": "San Francisco",
  "estimatedDays": 30
}
```

### Send Notification
```json
{
  "templateId": "bidReceived",
  "variables": {
    "jobTitle": "Kitchen",
    "contractorName": "John"
  },
  "channels": ["email", "push"]
}
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| API_ENDPOINTS_COMPLETE.md | All 83 endpoints |
| TESTING_AND_VALIDATION.md | Test procedures |
| FINAL_INTEGRATION_GUIDE.md | Deployment guide |
| QUICK_START.md | Getting started |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check token and "Bearer " prefix |
| 404 Not Found | Verify endpoint path and HTTP method |
| 400 Bad Request | Check required fields and data types |
| 429 Rate Limited | Wait before retrying |

---

**Status:** Production Ready ✅
Last Updated: January 4, 2026

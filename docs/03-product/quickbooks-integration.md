# QuickBooks Integration & Market Position

## Why QB-Native Is the Right Call

QuickBooks has **62.23% market share** in small business accounting. Construction is the **#1 industry** for QB adoption at **17.22%** of all QB users. 62% of QB users are SMBs, 31% mid-market. QB offers contractor-specific payroll (1099 contractor version). Most Oxford contractors already use QuickBooks — FTW integrating with it means zero learning curve on the financial side.

Every competitor (Angi, Thumbtack, Buildertrend) forces contractors to use a separate payment system. FTW pushes estimates and invoices directly into the contractor's existing QuickBooks. This is:

1. **Zero friction** — no new financial system to learn
2. **Trust** — money goes to their books, not a platform escrow
3. **Lock-in** — once financial data flows through FTW to QB, switching cost is high
4. **Revenue share** — Intuit pays FTW 20% of payment processing fees for 3 years per contractor

## Intuit App Partner Program Details

- **Launched:** May 15, 2025 (live July 28, 2025)
- **Requirements:** App assessment questionnaire, updated TOS, active App Marketplace listing
- **Marketplace listing deadline:** May 1, 2026
- **API pricing:** Write (create/update) calls are FREE at every tier. Read calls are usage-based by tier.
- **Revenue share (ProAdvisor):** 20% of payment processing fees for 3 years per client signup
- **Eligibility:** Client must not have previously used QB Payments, must be US-based, must remain in good standing

## Complete OAuth2 Flow

FTW uses Intuit's OAuth 2.0 authorization code flow. Here is the step-by-step process:

### Step 1: Redirect to Intuit Authorization

When a contractor clicks "Connect QuickBooks" in FTW Settings > Integrations, redirect them to:

```
https://appcenter.intuit.com/connect/oauth2
  ?client_id=<FTW_CLIENT_ID>
  &redirect_uri=https://fairtradeworker.com/api/auth/quickbooks/callback
  &response_type=code
  &scope=com.intuit.quickbooks.accounting com.intuit.quickbooks.payment
  &state=<CSRF_TOKEN>
```

- `scope` must include `com.intuit.quickbooks.accounting` (read/write estimates, invoices, customers) and `com.intuit.quickbooks.payment` (process payments, required for rev share)
- `state` is a CSRF token stored in the user's session — must be validated on callback
- `redirect_uri` must exactly match what is registered in the Intuit Developer Portal

### Step 2: User Authorizes

Intuit shows the contractor a consent screen listing what FTW will access. The contractor selects which QB company to connect (they may have multiple). On approval, Intuit redirects to the callback URL with an authorization code.

### Step 3: Token Exchange

FTW's callback endpoint exchanges the authorization code for tokens:

```
POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

grant_type=authorization_code
&code=<AUTHORIZATION_CODE>
&redirect_uri=https://fairtradeworker.com/api/auth/quickbooks/callback
```

Response includes:
- `access_token` — expires in 60 minutes
- `refresh_token` — expires in 100 days
- `realm_id` — the QB company ID (store this permanently per contractor)
- `expires_in` — seconds until access token expires
- `x_refresh_token_expires_in` — seconds until refresh token expires

### Step 4: Store Tokens Securely

Store in Supabase (encrypted at rest):
- `access_token` — encrypted, overwritten on each refresh
- `refresh_token` — encrypted, overwritten on each refresh
- `realm_id` — plain text, this is the QB company identifier
- `token_expires_at` — timestamp for proactive refresh
- `refresh_token_expires_at` — timestamp to alert contractor if re-auth needed

### Step 5: Token Refresh Cycle

Access tokens expire every 60 minutes. FTW must proactively refresh:

```
POST https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(client_id:client_secret)

grant_type=refresh_token
&refresh_token=<REFRESH_TOKEN>
```

- Refresh tokens expire after 100 days. If a contractor does not use FTW for 100 days, they must re-authorize.
- Best practice: refresh the access token 5-10 minutes before expiration, not on-demand. This prevents API call failures.
- On each refresh, both `access_token` and `refresh_token` are replaced. Always save both.

### Step 6: Disconnect Flow

When a contractor clicks "Disconnect QuickBooks":
1. Call Intuit's revoke endpoint to invalidate tokens
2. Delete stored tokens from Supabase
3. Mark the contractor's QB integration as inactive
4. Retain historical data (estimates/invoices already synced) but stop syncing new data

## API Endpoints FTW Needs

### Core Endpoints (Launch)

| QB Object | FTW Use Case | HTTP Method | Endpoint | API Cost |
|-----------|-------------|-------------|----------|----------|
| **Estimate** | Push ConstructionAI estimates to QB | POST | `/v3/company/{realmId}/estimate` | FREE (write) |
| **Invoice** | Create invoices when jobs are accepted | POST | `/v3/company/{realmId}/invoice` | FREE (write) |
| **Payment** | Record payments received | POST | `/v3/company/{realmId}/payment` | FREE (write) |
| **Customer** | Sync homeowner info to QB | POST | `/v3/company/{realmId}/customer` | FREE (write) |
| **Customer** | Look up existing customers (avoid duplicates) | GET | `/v3/company/{realmId}/query?query=SELECT * FROM Customer WHERE ...` | Usage-based (read) |
| **Company** | Get contractor's company info | GET | `/v3/company/{realmId}/companyinfo/{realmId}` | Usage-based (read) |
| **Account** | Verify chart of accounts for proper categorization | GET | `/v3/company/{realmId}/query?query=SELECT * FROM Account` | Usage-based (read) |

### Future Endpoints (Year 2+)

| QB Object | FTW Use Case | Endpoint |
|-----------|-------------|----------|
| **Bill** | Track contractor expenses per job | `/v3/company/{realmId}/bill` |
| **Vendor** | Sync materials suppliers | `/v3/company/{realmId}/vendor` |
| **Item** | Sync pricebook items | `/v3/company/{realmId}/item` |
| **ProfitAndLoss** | Job profitability reporting | `/v3/company/{realmId}/reports/ProfitAndLoss` |
| **TimeActivity** | Track labor hours per job | `/v3/company/{realmId}/timeactivity` |

## Data Mapping: FTW Objects to QB Objects

### FTW Estimate to QB Estimate

```
FTW Estimate                    QB Estimate
-----------                     -----------
estimate.id                -->  Estimate.DocNumber (custom prefix: "FTW-")
estimate.homeowner          -->  Estimate.CustomerRef (create Customer if not exists)
estimate.line_items[]       -->  Estimate.Line[] (SalesItemLineDetail)
  line_item.description     -->  Line.Description
  line_item.quantity        -->  Line.SalesItemLineDetail.Qty
  line_item.unit_price      -->  Line.SalesItemLineDetail.UnitPrice
  line_item.amount          -->  Line.Amount
estimate.total              -->  Estimate.TotalAmt
estimate.notes              -->  Estimate.PrivateNote
estimate.created_at         -->  Estimate.TxnDate
estimate.expiration_date    -->  Estimate.ExpirationDate
```

### FTW Invoice to QB Invoice

```
FTW Invoice                     QB Invoice
-----------                     ----------
invoice.id                  -->  Invoice.DocNumber (custom prefix: "FTW-")
invoice.estimate_id         -->  (linked via CustomField)
invoice.homeowner           -->  Invoice.CustomerRef
invoice.line_items[]        -->  Invoice.Line[] (SalesItemLineDetail)
invoice.total               -->  Invoice.TotalAmt
invoice.due_date            -->  Invoice.DueDate
invoice.status              -->  Invoice.EmailStatus + Balance check
```

### FTW Homeowner to QB Customer

```
FTW Homeowner                   QB Customer
-------------                   -----------
homeowner.name              -->  Customer.DisplayName
homeowner.email             -->  Customer.PrimaryEmailAddr
homeowner.phone             -->  Customer.PrimaryPhone
homeowner.address           -->  Customer.BillAddr (Line1, City, CountrySubDivisionCode, PostalCode)
homeowner.ftw_id            -->  Customer.Notes (for reverse lookup)
```

### Duplicate Prevention Strategy

Before creating a QB Customer, always query first:
```sql
SELECT * FROM Customer WHERE PrimaryEmailAddr = 'homeowner@email.com'
```
If found, use existing `Customer.Id`. If not found, create new. Store the `Customer.Id` mapping in Supabase to avoid repeated lookups.

## Webhook Setup for Payment Notifications

Intuit supports webhooks for real-time event notifications. FTW needs these to know when:
- A payment is received against an FTW invoice
- An estimate is accepted/rejected in QB directly
- A customer record is updated

### Webhook Configuration

1. Register webhook endpoint in Intuit Developer Portal: `https://fairtradeworker.com/api/webhooks/quickbooks`
2. Intuit sends a POST with a `intuit-signature` header (HMAC-SHA256 of payload with verifier token)
3. FTW must respond with HTTP 200 within 10 seconds or Intuit retries
4. Webhook payload contains `eventNotifications[]` with `realmId`, `dataChangeEvent.entities[]`

### Events to Subscribe To

| Event | Entity | Use Case |
|-------|--------|----------|
| `Create` | `Payment` | Homeowner paid an invoice — update FTW job status to "Paid" |
| `Update` | `Estimate` | Contractor modified estimate in QB — sync changes back to FTW |
| `Update` | `Invoice` | Invoice status changed — update FTW |
| `Delete` | `Estimate` | Estimate deleted in QB — flag in FTW |

### Webhook Verification

```javascript
const crypto = require('crypto');
const signature = req.headers['intuit-signature'];
const hash = crypto.createHmac('sha256', WEBHOOK_VERIFIER_TOKEN)
  .update(JSON.stringify(req.body))
  .digest('base64');
if (signature !== hash) return res.status(401).send('Invalid signature');
```

## API Rate Limits

- 500 requests per minute per company
- 10 concurrent request limit
- Batch operations: 40 requests per minute
- Resource-intensive endpoints: 200 requests per minute
- OAuth tokens expire after 60 minutes — always save both access and refresh tokens

### Rate Limit Handling Strategy

- Implement exponential backoff with jitter on 429 responses
- Queue non-urgent writes (batch estimates/invoices) and process at 80% of rate limit capacity
- Cache Company and Account reads (they change rarely) — refresh once per day
- Customer lookups: cache the FTW-to-QB Customer ID mapping in Supabase to minimize read calls

## Error Handling Strategy

### QB API Down (500/503 Errors)

1. Queue the failed operation in Supabase (`qb_sync_queue` table)
2. Show contractor a yellow banner: "QuickBooks sync pending — your estimate is saved and will sync automatically"
3. Retry with exponential backoff: 1min, 5min, 15min, 1hr, 4hr
4. After 24 hours of failure, send email notification to contractor
5. After 72 hours, escalate to FTW support dashboard

### Token Expiration (401 Errors)

1. Catch 401, attempt token refresh immediately
2. If refresh succeeds, retry the original request transparently
3. If refresh fails (refresh token expired — 100+ days inactive), mark integration as "disconnected"
4. Show contractor a red banner: "QuickBooks disconnected — click to reconnect"
5. Send email notification with direct re-authorization link

### Rate Limit Hit (429 Errors)

1. Read `Retry-After` header from response
2. Queue the request and retry after the specified delay
3. If consistently hitting limits, batch operations and reduce frequency
4. Log rate limit events for monitoring

### Validation Errors (400 Errors)

1. Parse Intuit's error response (includes `Fault.Error[].Message` and `Detail`)
2. Map common errors to user-friendly messages:
   - "Duplicate name" → "A customer with this name already exists in QuickBooks"
   - "Business validation error" → Show specific field that failed
3. Log full error for debugging
4. Allow contractor to retry or skip the sync for that item

### Data Conflicts

When the same record is modified in both FTW and QB:
- FTW is the source of truth for estimates and job data
- QB is the source of truth for payment status and account balances
- On conflict: show contractor both versions, let them choose which to keep
- Never silently overwrite QB data — contractors trust their books

## Sandbox vs Production Environment

### Sandbox (Development + Testing)

- Base URL: `https://sandbox-quickbooks.api.intuit.com`
- OAuth URL: Same as production (`https://appcenter.intuit.com/connect/oauth2`)
- Use sandbox `client_id` and `client_secret` from Intuit Developer Portal
- Sandbox companies come pre-populated with sample data (customers, invoices, etc.)
- No rate limits enforced in sandbox
- No real money moves — safe to test payment flows
- Create multiple sandbox companies to test different contractor scenarios

### Production

- Base URL: `https://quickbooks.api.intuit.com`
- Use production `client_id` and `client_secret`
- Full rate limits enforced
- Real money moves — QB Payments are live
- Requires passing Intuit's app assessment before going live

### Environment Switching

Use environment variable `QB_ENVIRONMENT=sandbox|production` to toggle. The FTW codebase should have a single QB service module that reads this variable and sets the correct base URL. Never hardcode URLs.

## Intuit App Marketplace Listing Requirements

FTW must be listed on the Intuit App Marketplace by May 1, 2026 to maintain Partner status and revenue share eligibility.

### App Assessment Checklist

1. **Functional review** — Intuit staff will test the integration end-to-end
   - OAuth flow works correctly (connect, disconnect, reconnect)
   - Data syncs accurately (estimates, invoices, payments, customers)
   - Error handling is graceful (no crashes, no data loss)
   - UI clearly shows sync status to the user

2. **Security review** — Intuit audits how FTW handles tokens and data
   - Tokens stored encrypted at rest
   - Tokens never logged or exposed in client-side code
   - HTTPS everywhere
   - Webhook signatures validated
   - CSRF protection on OAuth flow (state parameter)

3. **Branding compliance** — Must follow Intuit's brand guidelines
   - Use official "Connect to QuickBooks" button (provided by Intuit SDK)
   - Do not use Intuit's logo in ways that imply endorsement
   - App name cannot include "QuickBooks" or "Intuit"

4. **Listing content** — What FTW needs to provide
   - App description (250-500 words)
   - Screenshots (3-5, showing the integration in action)
   - Support URL and email
   - Privacy policy URL
   - Terms of service URL
   - Pricing information (FTW's pricing, not QB's)
   - Category selection (Construction / Field Service)

5. **Support requirements** — Must have active support channel
   - Respond to Intuit-escalated support tickets within 48 hours
   - Provide documentation for contractors on how to connect QB
   - Have a status page or way to communicate outages

### Timeline for Marketplace Listing

| Task | Target Date | Duration |
|------|------------|----------|
| Build QB integration (sandbox) | Month 3-4 | 4-6 weeks |
| Internal QA on sandbox | Month 4-5 | 2 weeks |
| Submit app assessment to Intuit | Month 5 | 1 week |
| Intuit review process | Month 5-6 | 2-4 weeks |
| Fix any issues from review | Month 6 | 1-2 weeks |
| Listing goes live | Month 6-7 | — |
| Deadline for May 1, 2026 | — | Must submit by March 2026 |

## Revenue Share Mechanics

### How QB Revenue Share Works

1. **Contractor connects QB through FTW** — FTW is credited as the "referring app"
2. **Contractor enables QB Payments** — If the contractor was NOT already using QB Payments before connecting through FTW, FTW earns rev share
3. **Revenue share rate:** 20% of payment processing fees (typically 2.9% + $0.25 per transaction)
4. **Duration:** 3 years from the date the contractor activates QB Payments through FTW
5. **Example math:**
   - Contractor processes $500K/year in payments through QB
   - QB processing fee: $500K x 2.9% + ($0.25 x ~200 transactions) = $14,500 + $50 = $14,550
   - FTW's 20% share: $2,910/year per contractor
   - Over 3 years: $8,730 per contractor

### Tracking and Reporting

- Intuit tracks referrals automatically through the OAuth connection
- FTW receives monthly reports showing:
  - Which contractors are generating rev share
  - Total payment volume per contractor
  - FTW's share amount
  - Payment status
- Dashboard available in the Intuit Developer Portal

### Payout Schedule

- Intuit pays rev share monthly, 30 days in arrears
- Minimum payout threshold: $25 (if under $25, rolls to next month)
- Payment via ACH to FTW's business bank account
- Tax reporting: Intuit issues 1099 to FTW annually

### Revenue Share Projections

| Year | Eligible Contractors | Avg Payment Volume/Contractor | FTW Rev Share/Contractor | Total QB Rev Share |
|------|---------------------|-------------------------------|--------------------------|-------------------|
| Year 1 | 10 | $200K | $1,160 | $11,600 |
| Year 2 | 75 | $300K | $1,740 | $130,500 |
| Year 3 | 250 | $350K | $2,030 | $507,500 |
| Year 4 | 500 | $400K | $2,320 | $1,160,000 |
| Year 5 | 1,000 | $400K | $2,320 | $2,320,000 |

Note: These are optimistic projections assuming all contractors enable QB Payments through FTW. Realistic conversion to QB Payments is likely 30-50% of connected contractors. Adjust accordingly.

### Eligibility Requirements

- Contractor must NOT have been using QB Payments before connecting through FTW
- Contractor must be US-based
- Contractor must remain in good standing with QB (no fraud, no chargebacks above threshold)
- FTW must maintain active App Marketplace listing
- FTW must maintain Partner Program compliance (updated TOS, active support)

## Implementation Timeline

### Sprint 1 (Week 1-2): OAuth Foundation
- Set up Intuit Developer account and sandbox app
- Build OAuth flow (redirect, callback, token exchange, storage)
- Build token refresh service (background job)
- Build disconnect flow
- Test with sandbox company

### Sprint 2 (Week 3-4): Core Data Sync
- Build Customer sync (FTW homeowner to QB Customer, with duplicate detection)
- Build Estimate push (FTW estimate to QB Estimate)
- Build Invoice creation (FTW invoice to QB Invoice)
- Map FTW data models to QB API schemas
- Error handling for all write operations

### Sprint 3 (Week 5-6): Payment Tracking + Webhooks
- Set up webhook endpoint and signature verification
- Handle Payment events (update FTW job status when payment received)
- Handle Estimate update events (sync changes back to FTW)
- Build sync status UI (show contractors what is synced, what is pending)
- Build sync queue for failed operations

### Sprint 4 (Week 7-8): Polish + Marketplace Prep
- Build "Connect QuickBooks" button in contractor Settings (using Intuit's official component)
- Build QB connection status dashboard
- Write contractor-facing documentation
- Prepare marketplace listing content (screenshots, description, etc.)
- Internal QA on sandbox

### Sprint 5 (Week 9-10): App Assessment + Launch
- Submit to Intuit for app assessment
- Address review feedback
- Switch to production credentials
- Beta test with 3-5 real contractors (Josh at MHP first)
- Launch

**Total estimated time: 10 weeks (2.5 months)**

## Code Architecture

### Where QB Integration Lives in the FTW Codebase

```
src/
  app/
    api/
      auth/
        quickbooks/
          callback/route.ts       # OAuth callback — exchanges code for tokens
      webhooks/
        quickbooks/route.ts       # Webhook receiver — payment notifications, estimate updates
      quickbooks/
        estimate/route.ts         # Push estimate to QB
        invoice/route.ts          # Create invoice in QB
        customer/route.ts         # Sync customer to QB
        status/route.ts           # Check sync status
        disconnect/route.ts       # Revoke tokens, disconnect

  domains/
    contractor/
      components/
        QuickBooksConnect.tsx      # "Connect to QuickBooks" button (uses Intuit's official UI)
        QuickBooksSyncStatus.tsx   # Shows sync state per estimate/invoice
        QuickBooksSettings.tsx     # Connection management in Settings > Integrations

  shared/
    lib/
      quickbooks/
        client.ts                 # QB API client (handles auth headers, base URL, retries)
        token-manager.ts          # Token storage, refresh, expiration checks
        data-mapper.ts            # FTW objects <-> QB objects mapping
        sync-queue.ts             # Queue for failed operations, retry logic
        webhook-handler.ts        # Webhook signature verification, event routing
        types.ts                  # TypeScript types for QB API objects

backend/
  supabase/
    migrations/
      xxx_qb_tokens.sql           # Table: qb_connections (realm_id, encrypted tokens, status)
      xxx_qb_sync_queue.sql       # Table: qb_sync_queue (operation, payload, status, retry_count)
      xxx_qb_customer_map.sql     # Table: qb_customer_map (ftw_homeowner_id, qb_customer_id)
    functions/
      qb-token-refresh/           # Scheduled function — refreshes tokens before expiration
      qb-sync-retry/              # Scheduled function — retries failed syncs from queue
```

### Key Design Decisions

1. **Token refresh is a background job, not on-demand.** A Supabase Edge Function runs every 45 minutes and refreshes any tokens expiring in the next 15 minutes. This prevents API call failures.

2. **Sync queue is durable.** Every QB write operation first goes into `qb_sync_queue` with status "pending", then attempts the API call. On success, status changes to "completed". On failure, status changes to "retry" with an incremented retry count. This ensures zero data loss even if QB is down.

3. **Customer mapping is cached.** The `qb_customer_map` table stores the relationship between FTW homeowner IDs and QB Customer IDs. This eliminates redundant Customer lookups and prevents duplicate creation.

4. **Webhook handler is idempotent.** Intuit may send the same webhook multiple times. The handler uses the event ID to deduplicate and only processes each event once.

5. **Environment-aware client.** The QB client reads `QB_ENVIRONMENT` and sets the correct base URL. In development, it uses sandbox. In production, it uses the live API. No code changes needed to switch.

# 💰 Revenue Model & Monetary Valuation

**Status:** Implemented in Codebase (v2.5)
**Key Principle:** Contractor keeps 100% of the bid; Homeowner pays the Platform Fee.

---

## 1. The Core Philosophy: "Zero-Friction for Contractors"

To solve the "Chicken and Egg" problem of marketplace adoption, we have removed all fees for Contractors.
*   **Contractors** are the scarce resource. We treat them as VIPs.
*   **Homeowners** pay for the security, AI estimation, and escrow protection.

---

## 2. Dollar-by-Dollar Flow (Example)

Let's trace a **$1,000 Kitchen Repair Job** through the system.

### Step 1: The Bid
*   **Contractor Bid:** `$1,000`
*   **Platform Fee (12%):** `$120` (Added on top)
*   **Total Homeowner Price:** `$1,120`

### Step 2: The Deposit (Upfront)
When the Homeowner accepts the bid, they pay the **Deposit (25%)** + **Full Platform Fee**.
*   **Math:** (25% of $1,000) + $120
*   **Homeowner Pays:** `$250 + $120 = $370`
*   **Where it goes:**
    *   `$250` -> Held in Secure Escrow (Contractor's Deposit)
    *   `$120` -> Transferred to **FairTrade Revenue Account** (Immediate Cash Flow)

### Step 3: Work Begins
*   Contractor sees the funds are secured.
*   Contractor starts work.
*   The `$250` deposit is released to the Contractor immediately (or after 1 hour).

### Step 4: Completion (Final Payment)
*   Contractor marks job as "Complete".
*   Homeowner approves.
*   **Math:** Remaining 75% of $1,000.
*   **Homeowner Pays:** `$750`
*   **Where it goes:**
    *   `$750` -> Transferred directly to Contractor.

### 🏁 Final Tally
| Party | Money Out | Money In | Net Result |
| :--- | :--- | :--- | :--- |
| **Homeowner** | `$1,120` | `$0` | Paid for Job + Security |
| **Contractor** | `$0` | `$1,000` | **100% of Bid Earned** |
| **FairTrade** | `$0` | `$120` | **12% Revenue Realized** |

---

## 3. Revenue Streams

### Primary Stream: Transaction Fee (12%)
*   **Source:** Homeowner
*   **Trigger:** Contract Initiation
*   **Realization:** Immediate (Upfront). We do not wait for the job to finish to get paid.

### Secondary Stream: Enterprise SaaS (Future)
*   **Target:** Large Property Management Firms.
*   **Model:** Monthly Subscription ($299/mo).
*   **Features:** API Access, Bulk Job Posting, Dedicated Account Manager.

### Tertiary Stream: Lead Priority (Future)
*   **Target:** Contractors who want to see jobs first.
*   **Model:** Small monthly fee ($49/mo) to see "Urgent" jobs 1 hour before others.

---

## 4. Valuation Projections

Based on the 12% Take Rate model:

| Metric | Year 1 (Pilot) | Year 2 (Growth) | Year 3 (Scale) |
| :--- | :--- | :--- | :--- |
| **Jobs Processed** | 1,000 | 10,000 | 50,000 |
| **Avg Job Value** | $800 | $1,200 | $1,500 |
| **Gross Merchandise Value (GMV)** | $800,000 | $12M | $75M |
| **Net Revenue (12%)** | **$96,000** | **$1.44M** | **$9.0M** |

---

## 5. Implementation in Codebase

This model is strictly enforced in:
*   **Config:** `backend/config/revenue.ts` (The Source of Truth)
*   **Frontend:** `src/utils/constants.ts` (Display Logic)
*   **Logic:** `backend/services/paymentService.ts` (Stripe Charges)

We use `idempotency keys` in Stripe to ensure we never double-charge the fee, even if the network fails.

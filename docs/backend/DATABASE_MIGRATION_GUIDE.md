# Database Migration Guide

**From In-Memory to Production Database**
**Status:** Complete Setup Guide
**Last Updated:** January 4, 2026

---

## Overview

Currently, FairTradeWorker uses **in-memory storage** with JSON file persistence for development. To move to production, you need to migrate to a **real database**.

**Two Options:**
1. **PostgreSQL** (Recommended) - Better for financial/transactional data
2. **MongoDB** - Better for flexible schemas, easier scaling

---

## Why PostgreSQL?

✅ **ACID Transactions** - Critical for escrow/payment integrity
✅ **Type Safety** - Catches data errors at DB level
✅ **JSON Support** - Native JSONB columns for flexible fields
✅ **Better Indexing** - Faster queries on contracts/jobs
✅ **Compliance** - Better audit trails for financial data
✅ **Cost** - Free (open source), cheap hosting

❌ MongoDB lacks transactions (until v4.0+) and is less suitable for financial systems

---

## Database Schema

### 11 Core Collections/Tables

```
┌─ users (1,000s-100,000s rows)
│  └─ contractors, homeowners, admins
│
├─ jobs (10,000s-100,000s rows)
│  └─ active, completed, closed
│
├─ bids (50,000s+ rows)
│  └─ submitted, accepted, rejected
│
├─ bid_contracts (10,000s-100,000s rows)
│  └─ core business entity
│
├─ escrow_accounts (10,000s+ rows)
│  └─ financial: deposits, payments, refunds
│
├─ job_completions (10,000s-100,000s rows)
│  └─ photo/video evidence
│
├─ disputes (1,000s-10,000s rows)
│  └─ high-value entities
│
├─ notifications (100,000s+ rows)
│  └─ high-volume logging
│
├─ in_app_notifications (100,000s+ rows)
│  └─ temporary, can be archived
│
├─ verifications (10,000s+ rows)
│  └─ license, background, insurance
│
├─ audit_logs (100,000s+ rows)
│  └─ compliance, immutable
│
└─ transactions (10,000s+ rows)
   └─ payment history
```

---

## PostgreSQL Setup (Recommended)

### Option A: Local Development

#### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
- Download: https://www.postgresql.org/download/windows/
- Run installer, set password for `postgres` user
- Verify: `psql --version`

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

#### Step 2: Create Database

```bash
# Login as postgres user
psql -U postgres

# Create database
CREATE DATABASE fairtradeworker;

# Create user
CREATE USER fairtrade WITH PASSWORD 'your_secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fairtradeworker TO fairtrade;

# Verify
\l
```

#### Step 3: Configure Environment

Create `.env` file:
```env
DATABASE_URL=postgresql://fairtrade:your_secure_password_here@localhost:5432/fairtradeworker
NODE_ENV=development
JWT_SECRET=dev_secret_key_change_in_production
PORT=3001
```

### Option B: Cloud Database (Production)

**Popular Options:**
1. **Heroku Postgres** - Easy, integrated
2. **AWS RDS** - Scalable, reliable
3. **DigitalOcean Managed Postgres** - Affordable
4. **Railway** - Modern, simple
5. **Neon** - Serverless Postgres

**Heroku Postgres Example:**
```bash
# Create app and add Postgres
heroku create fairtradeworker
heroku addons:create heroku-postgresql:standard-0

# Get connection string
heroku config:get DATABASE_URL

# Update .env
DATABASE_URL=postgres://... (from Heroku)
```

---

## Implementation

### Step 1: Install Dependencies

```bash
npm install pg prisma @prisma/client dotenv
npm install -D @types/pg
```

### Step 2: Create Prisma Schema

Create `prisma/schema.prisma`:

```prisma
// This file defines your database schema
// Full schema in DATABASE_SCHEMA.prisma file below

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// See full schema below
```

### Step 3: Run Migrations

```bash
# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Apply to database
npx prisma db push

# Verify
npx prisma studio  # Open GUI
```

### Step 4: Update Database Module

Modify `backend/database.ts` to use Prisma:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class Database {
  async connect() {
    try {
      await prisma.$connect()
      console.log('✅ Database connected')
    } catch (err) {
      console.error('❌ Database connection failed:', err)
      process.exit(1)
    }
  }

  // Users
  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  async createUser(data: any) {
    return prisma.user.create({ data })
  }

  // ... other methods
}

export const db = new Database()
```

### Step 5: Migrate Data

If migrating from in-memory:

```typescript
import { readFileSync } from 'fs'

async function migrateFromJSON() {
  const data = JSON.parse(readFileSync('database.json', 'utf-8'))

  // Migrate users
  for (const user of data.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        // ... other fields
      },
    })
  }

  // Migrate jobs, contracts, etc.
  console.log('✅ Migration complete')
}

await migrateFromJSON()
```

---

## Complete Prisma Schema

### Full `prisma/schema.prisma`

```prisma
// Full schema file - copy this exactly

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                  String   @id @default(cuid())
  email               String   @unique
  phone               String   @unique
  passwordHash        String
  firstName           String
  lastName            String
  role                String   @default("HOMEOWNER") // HOMEOWNER, CONTRACTOR, ADMIN
  avatar              String?
  verified            Boolean  @default(false)
  emailVerified       Boolean  @default(false)
  phoneVerified       Boolean  @default(false)

  // Contractor fields
  specializations     String[]
  licenseNumber       String?
  licenseState        String?
  businessName        String?
  businessPhone       String?
  averageRating       Float    @default(0)
  totalReviews        Int      @default(0)
  responseTime        Int?     // hours
  completedJobs       Int      @default(0)
  activeContracts     Int      @default(0)

  // Preferences
  preferences         Json     @default("{}")
  notificationSettings Json    @default("{}")

  // Status
  isActive            Boolean  @default(true)
  isSuspended         Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  lastLogin           DateTime?

  // Relations
  postedJobs          Job[]
  bids                Bid[]
  contracts           BidContract[]
  completions         JobCompletion[]
  receivedDisputes    Dispute[] @relation("homeowner")
  submittedDisputes   Dispute[] @relation("contractor")
  notifications       Notification[]
  verifications       Verification[]
  transactions        Transaction[]
  auditLogs           AuditLog[]

  @@index([email])
  @@index([phone])
  @@index([role])
}

model Job {
  id              String   @id @default(cuid())
  title           String
  description     String
  category        String   // PLUMBING, ELECTRICAL, ROOFING, etc.
  location        String
  zipCode         String?
  latitude        Float?
  longitude       Float?
  budget          Float
  images          String[]
  status          String   @default("OPEN") // OPEN, IN_PROGRESS, COMPLETED, CLOSED
  visibility      String   @default("PUBLIC") // PUBLIC, PRIVATE

  // Timeline
  deadline        DateTime?
  scheduledDate   DateTime?

  // Contractor selection
  preferredTradeTypes  String[]
  minimumRating   Float    @default(0)
  maximumBids     Int      @default(50)
  blindBidding    Boolean  @default(true)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  postedBy        User     @relation(fields: [postedById], references: [id])
  postedById      String
  bids            Bid[]
  contract        BidContract?
  completion      JobCompletion?

  @@index([postedById])
  @@index([category])
  @@index([status])
  @@index([createdAt])
}

model Bid {
  id            String   @id @default(cuid())
  amount        Float
  timeline      String   // "3 days", "1 week", etc.
  proposal      String?
  status        String   @default("SUBMITTED") // SUBMITTED, ACCEPTED, REJECTED

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  job           Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  jobId         String
  contractor    User     @relation(fields: [contractorId], references: [id])
  contractorId  String

  @@unique([jobId, contractorId])
  @@index([jobId])
  @@index([contractorId])
  @@index([status])
}

model BidContract {
  id              String   @id @default(cuid())
  status          String   @default("DRAFT") // DRAFT, PENDING_ACCEPTANCE, ACCEPTED, ACTIVE, COMPLETED, CANCELLED
  amount          Float
  timeline        String
  description     String?

  // Payment
  depositAmount   Float    @default(0)
  finalAmount     Float    @default(0)
  platformFee     Float    @default(0)

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  acceptedAt      DateTime?
  completedAt     DateTime?

  // Relations
  job             Job      @relation(fields: [jobId], references: [id])
  jobId           String   @unique
  homeowner       User     @relation(fields: [homeownerId], references: [id])
  homeownerId     String
  contractor      User     @relation(fields: [contractorId], references: [id])
  contractorId    String
  escrow          EscrowAccount?
  completion      JobCompletion?
  dispute         Dispute?

  @@index([jobId])
  @@index([homeownerId])
  @@index([contractorId])
  @@index([status])
}

model EscrowAccount {
  id              String   @id @default(cuid())
  depositAmount   Float    @default(0)
  finalAmount     Float    @default(0)
  totalFees       Float    @default(0)
  status          String   @default("ACTIVE") // ACTIVE, DEPOSIT_RELEASED, FINAL_RELEASED, REFUNDED

  depositReleasedAt DateTime?
  finalReleasedAt   DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  contract        BidContract @relation(fields: [contractId], references: [id])
  contractId      String  @unique

  @@index([contractId])
  @@index([status])
}

model JobCompletion {
  id              String   @id @default(cuid())
  photos          String[] // URLs from Cloudinary
  videos          String[]
  notes           String?
  geolocation     Json?    // {latitude, longitude}
  status          String   @default("SUBMITTED") // SUBMITTED, APPROVED, REJECTED, DISPUTED

  rating          Int?     // 1-5 stars
  feedback        String?

  disputeWindow   DateTime? // 5 days from submission

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  contract        BidContract @relation(fields: [contractId], references: [id])
  contractId      String  @unique

  @@index([contractId])
  @@index([status])
}

model Dispute {
  id              String   @id @default(cuid())
  reason          String
  homeownerEvidence String[]
  contractorResponse String?
  contractorEvidence String[]

  status          String   @default("OPEN") // OPEN, IN_MEDIATION, RESOLVED
  resolution      String?  // REFUND, PARTIAL_REFUND, REWORK, ARBITRATION
  resolutionAmount Float?

  mediationDeadline DateTime
  responseDeadline  DateTime

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  resolvedAt      DateTime?

  // Relations
  contract        BidContract @relation(fields: [contractId], references: [id])
  contractId      String  @unique
  homeowner       User     @relation("homeowner", fields: [homeownerId], references: [id])
  homeownerId     String
  contractor      User     @relation("contractor", fields: [contractorId], references: [id])
  contractorId    String

  @@index([contractId])
  @@index([status])
  @@index([homeownerId])
  @@index([contractorId])
}

model Verification {
  id              String   @id @default(cuid())
  type            String   // LICENSE, BACKGROUND_CHECK, INSURANCE
  status          String   @default("PENDING") // PENDING, VERIFIED, FAILED, EXPIRED

  licenseNumber   String?
  licenseState    String?

  backgroundCheck Json?
  insurancePolicy String?

  verifiedAt      DateTime?
  expiresAt       DateTime?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  contractor      User     @relation(fields: [contractorId], references: [id])
  contractorId    String

  @@unique([type, contractorId])
  @@index([contractorId])
  @@index([status])
}

model Notification {
  id              String   @id @default(cuid())
  type            String   // EMAIL, SMS, PUSH, IN_APP
  to              String   // email, phone, or userToken
  subject         String?
  body            String
  data            Json?
  status          String   @default("SENT") // SENT, FAILED, BOUNCED

  createdAt       DateTime @default(now())

  // Relations
  user            User     @relation(fields: [userId], references: [id])
  userId          String

  @@index([userId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}

model InAppNotification {
  id              String   @id @default(cuid())
  title           String
  body            String
  actionUrl       String?
  read            Boolean  @default(false)
  priority        String   @default("NORMAL") // LOW, NORMAL, HIGH, CRITICAL

  createdAt       DateTime @default(now())
  readAt          DateTime?

  // Relations
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          String

  @@index([userId])
  @@index([read])
  @@index([createdAt])
}

model Transaction {
  id              String   @id @default(cuid())
  amount          Float
  type            String   // DEPOSIT, FINAL_PAYMENT, REFUND, PAYOUT
  status          String   @default("PENDING") // PENDING, COMPLETED, FAILED

  stripeId        String?  // Stripe payment ID
  refundId        String?

  createdAt       DateTime @default(now())
  completedAt     DateTime?

  // Relations
  user            User     @relation(fields: [userId], references: [id])
  userId          String
  contract        BidContract? @relation(fields: [contractId], references: [id])
  contractId      String?

  @@index([userId])
  @@index([type])
  @@index([status])
  @@index([createdAt])
}

model AuditLog {
  id              String   @id @default(cuid())
  action          String   // CREATED, UPDATED, DELETED, APPROVED, etc.
  entity          String   // USER, JOB, CONTRACT, PAYMENT, DISPUTE
  entityId        String
  changes         Json?    // What changed
  reason          String?  // Why
  ipAddress       String?
  userAgent       String?

  createdAt       DateTime @default(now())

  // Relations
  user            User     @relation(fields: [userId], references: [id])
  userId          String

  @@index([userId])
  @@index([entity])
  @@index([action])
  @@index([createdAt])
}
```

---

## Key Indexes for Performance

```sql
-- Essential indexes for query performance

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_phone ON users(phone);
CREATE INDEX idx_job_category_status ON jobs(category, status);
CREATE INDEX idx_job_created ON jobs(created_at DESC);
CREATE INDEX idx_contract_status_user ON bid_contracts(status, homeowner_id);
CREATE INDEX idx_contract_status_contractor ON bid_contracts(status, contractor_id);
CREATE INDEX idx_completion_status ON job_completions(status);
CREATE INDEX idx_dispute_status ON disputes(status);
CREATE INDEX idx_notification_user_read ON notifications(user_id, read);
CREATE INDEX idx_transaction_user_type ON transactions(user_id, type);
CREATE INDEX idx_audit_log_entity ON audit_logs(entity, entity_id);
```

---

## Migration Steps

### Step 1: Backup Current Data
```bash
cp backend/database.json backend/database.backup.json
```

### Step 2: Install & Configure Postgres
```bash
# Follow PostgreSQL setup section above
```

### Step 3: Create Prisma Configuration
```bash
npx prisma init
# Fill in DATABASE_URL in .env
```

### Step 4: Run Migrations
```bash
npx prisma migrate dev --name init
```

### Step 5: Import Existing Data
```bash
# Run migration script
node scripts/migrate-from-json.ts
```

### Step 6: Update Database Module
```typescript
// backend/database.ts uses Prisma instead of JSON
```

### Step 7: Test
```bash
# Start backend
npm run dev

# Test endpoints
curl http://localhost:3001/health
```

---

## MongoDB Alternative (Less Recommended)

If you prefer MongoDB:

```bash
# Install
npm install mongoose

# Connect
const mongoose = require('mongoose')
await mongoose.connect(process.env.MONGODB_URI)
```

**Providers:**
- MongoDB Atlas (free tier available)
- AWS DocumentDB
- DigitalOcean Managed Mongo

**Pros:**
- Flexible schemas
- Easy scaling
- Good for startups

**Cons:**
- No ACID transactions (pre-v4.0)
- Harder to enforce data integrity
- Not recommended for financial apps

---

## Performance Considerations

### Connection Pooling
```typescript
// Use PgBouncer or similar for production
// Manage connections with Prisma
const prisma = new PrismaClient({
  log: ['error', 'warn'],
})
```

### Query Optimization
```sql
-- Use EXPLAIN to analyze queries
EXPLAIN ANALYZE
SELECT * FROM bid_contracts
WHERE status = 'ACTIVE'
AND contractor_id = 'xyz'
```

### Caching
```typescript
// Use Redis for frequently accessed data
import Redis from 'ioredis'
const redis = new Redis()

// Cache contractor profile
await redis.setex(`contractor:${id}`, 3600, JSON.stringify(profile))
```

### Archiving Old Data
```sql
-- Archive notifications older than 90 days
INSERT INTO notifications_archive SELECT * FROM notifications WHERE created_at < NOW() - INTERVAL '90 days'
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days'
```

---

## Backup & Disaster Recovery

### Daily Backups
```bash
# PostgreSQL backup
pg_dump -U fairtrade fairtradeworker > backup_$(date +%Y%m%d).sql

# Restore
psql -U fairtrade fairtradeworker < backup_20260104.sql
```

### Automated Backups
```bash
# Use cron for daily backups
0 2 * * * pg_dump -U fairtrade fairtradeworker | gzip > /backups/db_$(date +%Y%m%d).sql.gz
```

### Cloud Backups
- Heroku: Automatic daily
- AWS RDS: Automated, point-in-time recovery
- DigitalOcean: Managed backups included

---

## Timeline

| Phase | Task | Effort | Prerequisites |
|-------|------|--------|---------------|
| Week 1 | Set up PostgreSQL locally | 2-4h | None |
| Week 1 | Create Prisma schema | 2-3h | PostgreSQL setup |
| Week 1 | Run migrations | 1-2h | Prisma schema |
| Week 1 | Update database module | 2-3h | Migrations complete |
| Week 1 | Migrate existing data | 1-2h | Database module updated |
| Week 2 | Test all endpoints | 4-6h | Data migration |
| Week 2 | Set up production DB | 2-4h | Everything tested |
| Week 2 | Deploy with prod DB | 2-3h | Production setup |
| **Total** | | **16-27 hours** | |

---

## Checklist

### Pre-Migration
- [ ] Backup current database.json
- [ ] Document current schema
- [ ] Choose database (PostgreSQL recommended)
- [ ] Set up database locally
- [ ] Configure .env
- [ ] Install Prisma
- [ ] Create schema.prisma

### Migration
- [ ] Run initial migration
- [ ] Create migration script
- [ ] Import existing data
- [ ] Verify data integrity
- [ ] Test all endpoints
- [ ] Fix any schema issues

### Post-Migration
- [ ] Set up production database
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Document connection string
- [ ] Update deployment docs
- [ ] Test disaster recovery

---

## Support

### Common Issues

**"Cannot connect to database"**
- Verify DATABASE_URL
- Check PostgreSQL is running
- Verify credentials
- Check firewall

**"Migration failed"**
- Review migration errors
- Check Prisma schema syntax
- Rollback: `npx prisma migrate resolve --rolled-back <name>`

**"Data integrity issues"**
- Check import script logic
- Verify data types match schema
- Run validation queries
- Check for duplicates

---

## Next Steps

1. Choose PostgreSQL (recommended)
2. Set up database locally
3. Run migrations
4. Update database.ts to use Prisma
5. Test endpoints thoroughly
6. Deploy to production

**Estimated Time:** 2-4 weeks depending on testing rigor

---

**Good luck with your migration!** 🚀

For detailed Prisma docs: https://www.prisma.io/docs
For PostgreSQL docs: https://www.postgresql.org/docs


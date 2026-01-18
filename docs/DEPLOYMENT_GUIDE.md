# Production Deployment Guide

**FairTradeWorker B2B SaaS Marketplace**
**Comprehensive Deployment & Scaling Strategy**
**Status:** Ready for Production
**Last Updated:** January 4, 2026

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Migration](#database-migration)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Third-Party Integration](#third-party-integration)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Logging](#monitoring--logging)
9. [Scaling Strategy](#scaling-strategy)
10. [Disaster Recovery](#disaster-recovery)
11. [Performance Optimization](#performance-optimization)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful (`tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build successful (`npm run build`)

### Security
- [ ] No hardcoded secrets in code
- [ ] All dependencies up-to-date (`npm audit`)
- [ ] HTTPS enabled and enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection enabled

### Frontend
- [ ] All components tested
- [ ] Mobile responsive verified
- [ ] Dark mode working
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] Offline capability (if needed)
- [ ] Analytics integrated

### Backend
- [ ] All API endpoints tested
- [ ] Database migrations tested
- [ ] Error handling comprehensive
- [ ] Logging configured
- [ ] Health check endpoint working
- [ ] Rate limiting tested
- [ ] Database backups configured

### Documentation
- [ ] API documentation complete
- [ ] Database schema documented
- [ ] Deployment procedure documented
- [ ] Runbooks created
- [ ] Environment variables documented

### Third-Party Services
- [ ] Stripe account configured
- [ ] SendGrid credentials ready
- [ ] Twilio credentials ready
- [ ] Firebase configured
- [ ] Cloudinary setup
- [ ] OAuth providers configured

---

## Environment Setup

### Step 1: Create .env Files

```bash
# Development
cp .env.example .env.development

# Staging
cp .env.example .env.staging

# Production
cp .env.example .env.production
```

### Step 2: Configure Production Environment

```env
# .env.production

NODE_ENV=production
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.fairtradeworker.com
REACT_APP_DEBUG=false

# Database
DATABASE_URL=postgresql://user:password@prod-db.amazonaws.com/fairtradeworker

# Stripe (Live Keys)
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx

# JWT
JWT_SECRET=<generate-strong-random-key-32-chars-minimum>

# Session
SESSION_SECRET=<generate-strong-random-key>
```

### Step 3: Verify Configuration

```bash
# Check all required variables are set
npm run check-env

# Validate configuration
npm run validate-config
```

---

## Database Migration

### Step 1: Set Up Production Database

#### Option A: AWS RDS

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier fairtradeworker-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --allocated-storage 100 \
  --master-username postgres \
  --master-user-password <strong-password>

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier fairtradeworker-prod \
  --query 'DBInstances[0].Endpoint.Address'
```

#### Option B: Heroku Postgres

```bash
# Create Heroku app
heroku create fairtradeworker

# Add Postgres
heroku addons:create heroku-postgresql:standard-0

# Get connection string
heroku config:get DATABASE_URL
```

### Step 2: Run Migrations

```bash
# Install dependencies
npm install @prisma/client prisma

# Initialize Prisma (if not done)
npx prisma init

# Run migrations
npx prisma migrate deploy

# Verify with Prisma Studio
npx prisma studio
```

### Step 3: Seed Initial Data (Optional)

```bash
# Create seed file
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@fairtradeworker.com',
      phone: '5551234567',
      passwordHash: 'hashed_password_here',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      verified: true,
      emailVerified: true,
    },
  })
  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
EOF

# Run seed
npx prisma db seed
```

---

## Frontend Deployment

### Option A: Vercel (Recommended for React)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables
vercel env add REACT_APP_API_URL https://api.fairtradeworker.com
vercel env add REACT_APP_STRIPE_PUBLIC_KEY pk_live_xxx
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configure in netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[env.production]
  REACT_APP_API_URL = "https://api.fairtradeworker.com"
```

### Option C: AWS S3 + CloudFront

```bash
# Build
npm run build

# Deploy to S3
aws s3 sync build/ s3://fairtradeworker-frontend/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id E123ABCDEF \
  --paths "/*"
```

### Option D: Docker + Heroku

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./public
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
EOF

# Deploy
heroku container:push web -a fairtradeworker
heroku container:release web -a fairtradeworker
```

---

## Backend Deployment

### Option A: Heroku

```bash
# Create app
heroku create fairtradeworker-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=<strong-key>

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option B: AWS EC2

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name my-key

# SSH into instance
ssh -i my-key.pem ec2-user@<public-ip>

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo and start
git clone <repo>
cd fairtradeworker
npm install
npm run build
npm start
```

### Option C: Railway

```bash
# Connect GitHub
# Railway auto-detects Node.js app
# Set environment variables in dashboard
# Railway auto-deploys on git push
```

### Option D: Docker + AWS ECS

```bash
# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
EOF

# Build image
docker build -t fairtradeworker-api:latest .

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag fairtradeworker-api:latest <account>.dkr.ecr.us-east-1.amazonaws.com/fairtradeworker-api:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/fairtradeworker-api:latest

# Create ECS task definition and service
aws ecs create-service --cluster fairtradeworker --service-name api --task-definition fairtradeworker-api
```

---

## Third-Party Integration

### Stripe Setup

```bash
# Get API keys from dashboard
# https://dashboard.stripe.com/apikeys

# Add to environment
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Test webhook
stripe listen --forward-to localhost:3001/webhook/stripe

# In production, configure webhook endpoint in Stripe dashboard
# https://dashboard.stripe.com/webhooks
```

### SendGrid Setup

```bash
# Create API key
# https://app.sendgrid.com/settings/api_keys

# Add to environment
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@fairtradeworker.com

# Verify sender identity
# https://app.sendgrid.com/settings/sender_auth
```

### Twilio Setup

```bash
# Get credentials
# https://www.twilio.com/console

# Add to environment
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Verify phone numbers for development
# Production allows any number
```

### Firebase Setup

```bash
# Get config from Firebase Console
# https://console.firebase.google.com

# Add to environment
FIREBASE_API_KEY=xxx
FIREBASE_PROJECT_ID=xxx
FIREBASE_MESSAGING_SENDER_ID=xxx
FIREBASE_APP_ID=xxx
FIREBASE_VAPID_KEY=xxx
```

---

## Security Hardening

### HTTPS & SSL

```bash
# Generate SSL certificate (Let's Encrypt)
sudo certbot certonly --standalone -d fairtradeworker.com

# Configure in server
const https = require('https')
const fs = require('fs')

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/fairtradeworker.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/fairtradeworker.com/fullchain.pem')
}

https.createServer(options, app).listen(443)
```

### CORS Configuration

```typescript
// backend/server.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://fairtradeworker.com',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
```

### Security Headers

```typescript
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Content-Security-Policy', "default-src 'self'")
  next()
})
```

---

## Monitoring & Logging

### Sentry (Error Tracking)

```bash
# Install
npm install @sentry/react @sentry/tracing

# Configure
import * as Sentry from "@sentry/react"
Sentry.init({ dsn: process.env.SENTRY_DSN })
```

### New Relic (Performance Monitoring)

```bash
# Install
npm install newrelic

# Add to startup
require('newrelic')
```

### Datadog (Full Observability)

```bash
# Install agent
npm install dd-trace

# Configure
require('dd-trace').init()
```

---

## Scaling Strategy

### Horizontal Scaling

```bash
# Docker Swarm or Kubernetes
docker swarm init
docker service create --replicas 3 fairtradeworker-api

# or Kubernetes
kubectl scale deployment fairtradeworker-api --replicas=3
```

### Database Scaling

```bash
# Read replicas
aws rds create-db-instance-read-replica \
  --db-instance-identifier fairtradeworker-prod-read-1 \
  --source-db-instance-identifier fairtradeworker-prod

# Connection pooling
npm install pg-pool
```

### Caching

```bash
# Redis for sessions and caching
npm install redis ioredis
```

---

## Disaster Recovery

### Automated Backups

```bash
# AWS RDS automatic backups
aws rds modify-db-instance \
  --db-instance-identifier fairtradeworker-prod \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"

# S3 backup of static files
aws s3 sync s3://fairtradeworker-frontend/ s3://fairtradeworker-backups/
```

### Recovery Procedure

```bash
# Restore from backup
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier fairtradeworker-recovered \
  --db-snapshot-identifier <snapshot-id>

# Update DNS to new instance
aws route53 change-resource-record-sets --hosted-zone-id <zone-id> ...
```

---

## Performance Optimization

### Frontend

```javascript
// code-splitting
const Dashboard = React.lazy(() => import('./Dashboard'))

// compression
npm install compression
app.use(compression())

// caching
Cache-Control: max-age=31536000

// image optimization
npm install next-image-optimization
```

### Backend

```typescript
// database indexes (already configured in prisma/schema.prisma)
// connection pooling
const pool = new Pool(databaseConfig)

// redis caching
const redis = new Redis()
redis.set('user:123', userData, 'EX', 3600)

// CDN for static assets
npm install aws-sdk
s3.putObject({ ... })
```

---

## Post-Deployment

### Smoke Tests

```bash
# Test health endpoint
curl https://api.fairtradeworker.com/health

# Test authentication
curl -X POST https://api.fairtradeworker.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"xxx"}'

# Test database
curl https://api.fairtradeworker.com/api/jobs
```

### Monitoring Setup

- [ ] Set up dashboards in monitoring tool
- [ ] Configure alerts for errors, uptime, performance
- [ ] Set up log aggregation
- [ ] Configure budget alerts (cloud costs)

### Maintenance Plan

- [ ] Daily: Monitor error rates and performance
- [ ] Weekly: Review security logs and updates
- [ ] Monthly: Database optimization and backups review
- [ ] Quarterly: Security audit and penetration testing

---

## Deployment Checklist

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Database migrated and verified
- [ ] Environment variables configured
- [ ] Third-party services integrated
- [ ] SSL/HTTPS enabled
- [ ] Security headers configured
- [ ] Monitoring and logging setup
- [ ] Backups configured
- [ ] Health checks verified
- [ ] Performance baseline established
- [ ] Runbooks created
- [ ] Team trained on deployment process
- [ ] Rollback procedure documented
- [ ] Post-deployment validation complete

---

## Support

For deployment issues:
1. Check logs: `heroku logs --tail` or cloud provider logs
2. Review monitoring dashboard
3. Check third-party service status pages
4. Contact cloud provider support if infrastructure issue

---

**Estimated Timeline:** 1-2 weeks from code ready to production live
**Maintenance Window:** 30 minutes (plan during low-traffic time)
**Rollback Time:** <5 minutes

Good luck with your deployment! 🚀


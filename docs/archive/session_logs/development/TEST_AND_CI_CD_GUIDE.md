# Testing & CI/CD Guide

**FairTradeWorker** has comprehensive testing and continuous integration/continuous deployment (CI/CD) infrastructure.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Testing Setup](#testing-setup)
3. [Unit Tests](#unit-tests)
4. [Component Tests](#component-tests)
5. [E2E Tests](#e2e-tests)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Coverage Reports](#coverage-reports)
8. [Local Testing](#local-testing)
9. [Debugging Tests](#debugging-tests)
10. [Best Practices](#best-practices)

---

## Quick Start

### Install Testing Tools

```bash
# Jest (unit & component testing)
npm install --save-dev jest @types/jest ts-jest

# React Testing Library (component testing)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Playwright (E2E testing)
npm install --save-dev @playwright/test

# Add scripts to package.json
```

### NPM Scripts

Add these to your `package.json` scripts section:

```json
{
  "scripts": {
    "test": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:coverage": "jest --coverage",
    "test:unit": "jest src/__tests__/utils src/__tests__/services",
    "test:component": "jest src/__tests__/components",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:ci && npm run test:e2e",
    "lint": "eslint src backend --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\" \"backend/**/*.{ts,tsx,json}\"",
    "check-env": "node scripts/check-env.js",
    "validate-config": "node scripts/validate-config.js"
  }
}
```

---

## Testing Setup

### Jest Configuration

File: `jest.config.js` (already created)

Features:
- TypeScript support via `ts-jest`
- jsdom test environment for React
- Module name mapping for `@/` imports
- Setup files for global configuration
- Coverage thresholds (70% minimum)
- Test file patterns

### Test Setup File

File: `src/__tests__/setup.ts` (already created)

Configures:
- `localStorage` mock
- `sessionStorage` mock
- `window.matchMedia` mock
- `IntersectionObserver` mock
- Console error suppression (optional)
- Auto-cleanup after each test

---

## Unit Tests

### Files Created

#### 1. `src/__tests__/utils/validators.test.ts`

Tests for validation utilities with 100+ assertions:

```bash
# Run validator tests only
npm run test -- validators.test.ts

# Run with coverage
npm run test:coverage -- validators.test.ts
```

**Tests Include:**
- Email validation (valid, invalid, disposable)
- Phone validation (various formats, international)
- Password validation (strength, requirements)
- Credit card validation (Luhn algorithm, card types)
- Address validation (complete, partial, ZIP, state)
- URL validation
- File validation (type, size)
- Budget range validation
- Rating validation (1-5 scale)
- Percentage validation (0-100)
- Batch form validation

**Example Test:**
```typescript
describe('Email Validation', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false)
  })
})
```

#### 2. `src/__tests__/utils/formatters.test.ts`

Tests for formatting utilities with 80+ assertions:

```bash
# Run formatter tests only
npm run test -- formatters.test.ts
```

**Tests Include:**
- Currency formatting (USD, EUR, GBP)
- Payment breakdown calculations
- Date formatting (short, long, custom)
- Relative time ("2 hours ago")
- Phone number formatting
- Name capitalization and initials
- Address formatting (multi-line, inline)
- Compact number formatting (1K, 1M, 1B)
- Rating formatting with colors
- Status label formatting
- File size formatting (B, KB, MB, GB)
- Timezone formatting

**Example Test:**
```typescript
describe('Currency Formatting', () => {
  it('should format prices in USD', () => {
    expect(formatPrice(1000)).toBe('$1,000.00')
  })
})
```

---

## Component Tests

### React Testing Library Setup

File: `src/__tests__/components/` (created)

**What We Test:**
- Rendering with correct content
- User interactions (clicks, typing, submitting)
- Form validation and error display
- Loading states
- Disabled states
- Dark mode support

### 1. `src/__tests__/components/AuthModalConnected.test.tsx`

Tests for authentication modal component:

```bash
# Run auth modal tests
npm run test -- AuthModalConnected.test.tsx
```

**Test Suites:**
- Rendering (login, register, reset modes)
- Login flow (form input, submission, errors)
- Registration (all fields, validation, role selection)
- Password reset (email submission, code entry)
- Modal controls (close, mode switching)
- Dark mode support
- API integration with mocked `useAuth` hook

**Example Test:**
```typescript
it('should call login function on form submit', async () => {
  const mockLogin = jest.fn()
  mockUseAuth.mockReturnValue({
    login: mockLogin,
    // ... other mock values
  })

  render(<AuthModalConnected isOpen={true} mode="login" />)

  const emailInput = screen.getByPlaceholderText(/email/i)
  const passwordInput = screen.getByPlaceholderText(/password/i)

  await userEvent.type(emailInput, 'user@example.com')
  await userEvent.type(passwordInput, 'Password123!')
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

  expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'Password123!')
})
```

**Key Features:**
- Mock `useAuth` hook with `jest.mock()`
- User event simulation with `@testing-library/user-event`
- Async test support with `waitFor`
- Accessibility testing with semantic queries
- Role-based button selection

### 2. `src/__tests__/components/ErrorBoundary.test.tsx`

Tests for error boundary component:

```bash
# Run error boundary tests
npm run test -- ErrorBoundary.test.tsx
```

**Test Suites:**
- Rendering (safe children, error UI)
- Error recovery (Try Again button, state clearing)
- Error information (message display, support link)
- Error logging (Sentry integration, dev vs prod)
- Error fallback props (onError callback, error count)
- Nested error boundaries
- Error types (TypeError, ReferenceError)

**Example Test:**
```typescript
it('should clear error state on Try Again', async () => {
  const { rerender } = render(
    <ErrorBoundary>
      <ConditionalError shouldThrow={true} />
    </ErrorBoundary>
  )

  // Error appears
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()

  // Click Try Again
  fireEvent.click(screen.getByRole('button', { name: /try again/i }))

  // Rerender with fixed component
  rerender(
    <ErrorBoundary>
      <ConditionalError shouldThrow={false} />
    </ErrorBoundary>
  )

  // Error cleared
  expect(screen.getByText('No error')).toBeInTheDocument()
})
```

---

## E2E Tests

### Playwright Configuration

File: `playwright.config.ts` (already created)

**Features:**
- Multiple browsers (Chromium, Firefox, WebKit)
- Mobile device testing (iOS, Android)
- Screenshots/videos on failure
- HTML reports
- Parallel execution

### E2E Test Files

#### 1. `src/__tests__/e2e/auth.spec.ts`

End-to-end authentication tests:

```bash
# Run auth E2E tests
npm run test:e2e -- auth.spec.ts

# Run with UI
npm run test:e2e:ui -- auth.spec.ts

# Debug mode
npm run test:e2e:debug -- auth.spec.ts
```

**Test Scenarios:**
- User registration flow (email, password, role)
- Registration validation (email format, password strength)
- User login (valid credentials)
- Login errors (invalid credentials)
- Password reset workflow
- Logout functionality
- Token refresh handling

**Example Test:**
```typescript
test('should register a new user with email', async ({ page }) => {
  await page.goto('/')
  await page.click('button:has-text("Register")')

  const email = `user-${Date.now()}@example.com`
  await page.fill('[placeholder="First Name"]', 'John')
  await page.fill('[placeholder*="mail"]', email)
  await page.fill('[placeholder*="assword"]', 'SecurePass123!')

  await page.click('button:has-text("Create Account")')

  // Verify redirect
  await page.waitForURL(/verify|onboarding|dashboard/, { timeout: 10000 })
  expect(page.url()).toMatch(/verify|onboarding|dashboard/)
})
```

**Key Features:**
- Automatic web server startup
- User event simulation (clicks, typing)
- URL waiting and navigation
- Visibility checks
- Network interception (if needed)

#### 2. `src/__tests__/e2e/job-workflow.spec.ts`

End-to-end job lifecycle tests:

```bash
# Run job workflow tests
npm run test:e2e -- job-workflow.spec.ts
```

**Test Scenarios:**
- Job creation (post job with details)
- Job search and filtering
- Job details viewing
- Job closing
- Bid submission
- Bid management
- Contract creation
- Payment processing

**Example Test:**
```typescript
test('should create a new job post', async ({ page }) => {
  await page.click('button:has-text("Post a Job")')

  await page.fill('[name="title"]', 'Kitchen Renovation')
  await page.fill('[name="description"]', 'Renovate kitchen...')
  await page.selectOption('[name="category"]', 'Renovation')
  await page.fill('[name="budget"]', '5000')

  await page.click('button:has-text("Post Job")')

  await page.waitForURL(/job\/|jobs\//)
  expect(page.url()).toMatch(/job\/|jobs\//)
})
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

File: `.github/workflows/ci-cd.yml` (already created)

**Pipeline Stages:**

#### 1. Lint & Type Check (ubuntu-latest)
```yaml
- ESLint code style check
- TypeScript compilation (--noEmit)
- Prettier formatting check
```

#### 2. Unit Tests (depends on lint)
```yaml
- Run Jest with coverage
- Upload coverage to Codecov
- Comment coverage on PRs
```

#### 3. Build (depends on lint)
```yaml
- Frontend build (npm run build)
- Upload build artifacts
```

#### 4. E2E Tests (depends on build)
```yaml
- Install Playwright browsers
- Start backend server
- Run Playwright tests
- Upload test results
```

#### 5. Security Scan
```yaml
- Snyk security scan (--severity-threshold=high)
- NPM audit (--audit-level=moderate)
```

#### 6. Deploy to Staging (on develop branch)
```yaml
- Build with staging environment variables
- Deploy frontend to Vercel (staging)
- Deploy backend to Heroku (staging)
- Run smoke tests
```

#### 7. Deploy to Production (on main branch)
```yaml
- Build for production
- Deploy frontend to Vercel
- Deploy backend to Heroku
- Run database migrations
- Run smoke tests
- Notify Slack on success/failure
```

#### 8. Performance Tests (on pull requests)
```yaml
- Lighthouse CI for performance metrics
- Upload Lighthouse artifacts
```

#### 9. Code Quality
```yaml
- SonarCloud code quality scan
- Integration with GitHub quality gates
```

#### 10. Notifications
```yaml
- Slack notifications on success/failure
- Include repo, message, commit info
```

### GitHub Secrets Required

Add these to your GitHub repository settings:

```
API_URL                      # Backend API URL
STRIPE_PUBLIC_KEY           # Stripe test key
STRIPE_SECRET_KEY           # Stripe test secret
SENDGRID_API_KEY            # SendGrid API key
TWILIO_AUTH_TOKEN           # Twilio auth token
FIREBASE_CONFIG             # Firebase configuration

# Staging Environment
STAGING_API_URL             # Staging backend URL
STAGING_STRIPE_PUBLIC_KEY   # Staging Stripe key

# Production Environment
PRODUCTION_API_URL          # Production backend URL
PRODUCTION_STRIPE_PUBLIC_KEY # Production Stripe key

# Deployment
VERCEL_TOKEN                # Vercel deployment token
VERCEL_ORG_ID              # Vercel organization ID
VERCEL_PROJECT_ID          # Vercel project ID (production)
VERCEL_PROJECT_ID_STAGING  # Vercel project ID (staging)

HEROKU_API_KEY             # Heroku API key
HEROKU_EMAIL               # Heroku email

# Monitoring
SENTRY_DSN                 # Sentry error tracking DSN
SNYK_TOKEN                 # Snyk security token
SONARCLOUD_TOKEN           # SonarCloud token

# Notifications
SLACK_WEBHOOK              # Slack webhook URL

# Testing
TEST_DATABASE_URL          # Test database connection string
```

### Setting Up GitHub Secrets

```bash
# Using GitHub CLI
gh secret set API_URL --body "https://api.fairtradeworker.com"
gh secret set STRIPE_PUBLIC_KEY --body "pk_test_xxx"
gh secret set HEROKU_API_KEY --body "xxxxx"
# ... repeat for all secrets
```

---

## Coverage Reports

### Generate Local Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

### Coverage Thresholds

Set in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,      // 70% of branches covered
    functions: 70,     // 70% of functions covered
    lines: 70,         // 70% of lines covered
    statements: 70,    // 70% of statements covered
  },
}
```

### Coverage Reports Generated

1. **Text Summary** - Console output
2. **HTML Report** - `coverage/index.html` (interactive)
3. **LCOV Report** - `coverage/lcov.info` (for Codecov)
4. **JSON Report** - `coverage/coverage.json` (for tooling)

### Codecov Integration

Coverage is automatically uploaded to Codecov on CI:

1. Visit https://codecov.io
2. Connect your GitHub repository
3. Access coverage reports at codecov.io dashboard
4. Set status checks for coverage changes

---

## Local Testing

### Run All Tests Locally

```bash
# Watch mode (re-run on file changes)
npm test

# Single run with coverage
npm run test:ci

# Specific test file
npm test -- validators.test.ts

# Match pattern
npm test -- --testNamePattern="Email Validation"

# Coverage for specific file
npm test -- --coverage src/utils/validators.ts
```

### Component Testing

```bash
# Run component tests only
npm run test:component

# Watch mode
npm test -- src/__tests__/components

# Debug component test
node --inspect-brk node_modules/.bin/jest --runInBand src/__tests__/components/AuthModalConnected.test.tsx
```

### E2E Testing Locally

```bash
# Headed mode (see browser)
npm run test:e2e -- --headed

# Headed with UI
npm run test:e2e:ui

# Headed with step-by-step debugging
npm run test:e2e:debug

# Single test
npm run test:e2e -- auth.spec.ts

# Single test, headed
npm run test:e2e -- --headed auth.spec.ts

# Specific browser
npm run test:e2e -- --project=firefox

# With tracing
npm run test:e2e -- --trace on
```

### View Test Reports

```bash
# After running E2E tests
npx playwright show-report

# Coverage HTML report
open coverage/index.html
```

---

## Debugging Tests

### Jest Debugging

```bash
# Debug a specific test
node --inspect-brk node_modules/.bin/jest --runInBand validators.test.ts

# Then open chrome://inspect in Chrome
```

### Component Test Debugging

```bash
# Use debug() from testing-library
import { render, screen, debug } from '@testing-library/react'

test('example', () => {
  render(<MyComponent />)
  debug() // Prints DOM
  debug(screen.getByRole('button')) // Prints specific element
})
```

### E2E Test Debugging

```bash
# Step through test interactively
npm run test:e2e:debug

# Add breakpoints in VSCode
# Run with: node --inspect-brk node_modules/.bin/playwright test
```

### Add console.log in Tests

```typescript
test('example', () => {
  console.log('Debug message here')
  // ...
})

// View in test output
npm test -- --verbose
```

---

## Best Practices

### Unit Testing

```typescript
// ✅ Good: Clear test names
test('should validate email with valid address', () => {})

// ❌ Bad: Vague test names
test('email validation', () => {})

// ✅ Good: Arrange-Act-Assert pattern
test('example', () => {
  // Arrange
  const input = 'user@example.com'

  // Act
  const result = validateEmail(input)

  // Assert
  expect(result).toBe(true)
})

// ✅ Good: Test edge cases
test('should handle empty strings', () => {})
test('should handle null values', () => {})
test('should handle special characters', () => {})
```

### Component Testing

```typescript
// ✅ Good: Test user interactions
test('should call onSubmit when form submitted', async () => {
  const mockSubmit = jest.fn()
  render(<Form onSubmit={mockSubmit} />)

  await userEvent.click(screen.getByRole('button', { name: /submit/i }))

  expect(mockSubmit).toHaveBeenCalled()
})

// ✅ Good: Use semantic queries
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email Address')
screen.getByPlaceholderText('Enter email')

// ❌ Bad: Use test IDs for everything
screen.getByTestId('submit-button')
```

### E2E Testing

```typescript
// ✅ Good: Wait for elements
await page.waitForSelector('[data-testid="form"]')
await page.waitForURL(/dashboard/)

// ❌ Bad: Use arbitrary timeouts
await page.waitForTimeout(1000)

// ✅ Good: Check visibility before interaction
await expect(button).toBeVisible()
await button.click()

// ✅ Good: Use data-testid for stability
await page.click('[data-testid="submit-button"]')
```

### Test Organization

```typescript
// Group related tests
describe('User Registration', () => {
  describe('with valid data', () => {
    test('should create account', () => {})
  })

  describe('with invalid email', () => {
    test('should show error', () => {})
  })
})
```

### Mock Management

```typescript
// ✅ Good: Mock at module level
jest.mock('../../hooks/useAuth')

beforeEach(() => {
  jest.clearAllMocks()
})

// ✅ Good: Mock returns specific values
mockUseAuth.mockReturnValue({
  user: { id: '123', email: 'user@example.com' },
  isLoading: false,
  error: null,
})
```

---

## Continuous Integration Best Practices

### For Pull Requests

1. **Checks Required:**
   - All tests pass
   - Coverage threshold met
   - Linting passes
   - Type checking passes
   - No security issues (Snyk)

2. **Code Review:**
   - Require 1 approval before merge
   - Dismiss stale reviews on push
   - Require status checks to pass

3. **Automatic Actions:**
   - Run tests on every push
   - Comment coverage changes
   - Generate Lighthouse reports

### For Releases

1. **Staging (develop branch):**
   - Deploy after tests pass
   - Manual testing window
   - Rollback if issues found

2. **Production (main branch):**
   - Manual trigger or auto-deploy
   - Database migrations applied
   - Health checks verified
   - Slack notifications sent

### Monitoring & Alerts

```bash
# Add to CI/CD:
- Error rate monitoring (Sentry)
- Performance tracking (New Relic)
- Uptime monitoring (UptimeRobot)
- Security scanning (Snyk, SonarCloud)
```

---

## Troubleshooting

### Tests Failing Locally but Passing in CI

```bash
# Clear cache and retry
npm test -- --clearCache

# Run in CI mode (single run, no watch)
npm run test:ci

# Ensure environment variables match CI
env
```

### Playwright Tests Timing Out

```bash
# Increase timeout in playwright.config.ts
use: {
  navigationTimeout: 30000,
  actionTimeout: 10000,
}

# Or per test
test.setTimeout(60000)
```

### Coverage Threshold Failures

```bash
# Check which files are below threshold
npm run test:coverage

# Open HTML report
open coverage/index.html

# Add missing tests for those files
```

### GitHub Actions Failing

1. Check action logs on GitHub
2. Run locally with `act` (GitHub Actions locally)
3. Review environment variable setup
4. Check branch protection rules

---

## Summary

**FairTradeWorker** now has:

✅ Jest unit testing with 100+ test cases
✅ React component testing with user event simulation
✅ E2E testing with Playwright and multiple browsers
✅ GitHub Actions CI/CD pipeline with 10 jobs
✅ Automated testing, building, and deployment
✅ Coverage reporting with Codecov integration
✅ Security scanning with Snyk
✅ Code quality with SonarCloud
✅ Performance testing with Lighthouse CI
✅ Slack notifications for deployment status

**Next Steps:**
1. Configure GitHub repository secrets
2. Set branch protection rules
3. Run tests locally: `npm test`
4. View test reports: `npm run test:coverage`
5. Deploy: Push to main branch (GitHub Actions will deploy)

---

Last Updated: January 4, 2026

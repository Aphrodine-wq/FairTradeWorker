/**
 * E2E Tests: Job Workflow
 *
 * Testing complete job lifecycle:
 * - Job posting
 * - Bidding
 * - Contract creation
 * - Payment processing
 * - Completion
 */

import { test, expect } from '@playwright/test'

test.describe('Job Posting Workflow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Login as homeowner
    await page.goto('/')

    // Check if already logged in by looking for dashboard
    const dashboardExists = await page.locator('[data-testid="dashboard"]').isVisible()

    if (!dashboardExists) {
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      await page.fill('[placeholder*="mail"]', 'homeowner@example.com')
      await page.fill('[placeholder*="assword"]', 'SecurePass123!')
      await page.click('button:has-text("Sign In")')

      await page.waitForURL(/dashboard|home/)
    }
  })

  test('should create a new job post', async ({ page }) => {
    // Navigate to job creation
    await page.click('button:has-text("Post a Job")')

    await page.waitForSelector('[data-testid="job-form"]')

    // Fill job details
    await page.fill('[placeholder*="title"], input[name="title"]', 'Kitchen Renovation')
    await page.fill('[placeholder*="description"], textarea[name="description"]', 'Need to renovate kitchen with new cabinets and countertops')

    // Select category
    await page.selectOption('select[name="category"]', 'Renovation')

    // Enter location
    await page.fill('[placeholder*="location"], input[name="location"]', 'New York, NY')

    // Enter budget
    await page.fill('[placeholder*="budget"], input[name="budget"]', '5000')

    // Set estimated days
    await page.fill('[placeholder*="estimated"], input[name="estimatedDays"]', '14')

    // Upload image (if file input exists)
    const fileInput = page.locator('input[type="file"]')
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'kitchen.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image data'),
      })
    }

    // Submit form
    await page.click('button:has-text("Post Job")')

    // Should redirect to job details
    await page.waitForURL(/job\/|jobs\//, { timeout: 10000 })

    // Verify job was created
    const jobTitle = page.locator('text=Kitchen Renovation')
    await expect(jobTitle).toBeVisible()
  })

  test('should filter and search jobs', async ({ page }) => {
    // Navigate to jobs listing
    await page.click('a:has-text("Browse Jobs")')

    await page.waitForSelector('[data-testid="jobs-list"]')

    // Filter by category
    await page.click('[data-testid="filter-button"]')
    await page.selectOption('select[name="category"]', 'Plumbing')

    // Should update job list
    const jobsList = page.locator('[data-testid="job-card"]')
    await expect(jobsList.first()).toBeVisible()

    // Search for specific job
    await page.fill('input[placeholder*="Search"]', 'renovation')

    // Results should be filtered
    await page.waitForTimeout(500) // Debounce delay
    const results = await jobsList.count()
    expect(results).toBeGreaterThan(0)
  })

  test('should view job details', async ({ page }) => {
    // Navigate to jobs listing
    await page.click('a:has-text("Browse Jobs")')

    await page.waitForSelector('[data-testid="job-card"]')

    // Click first job
    await page.click('[data-testid="job-card"]:first-child')

    // Should show job details
    await page.waitForSelector('[data-testid="job-details"]')

    // Verify details are visible
    const jobTitle = page.locator('[data-testid="job-title"]')
    const jobDescription = page.locator('[data-testid="job-description"]')
    const jobBudget = page.locator('[data-testid="job-budget"]')

    await expect(jobTitle).toBeVisible()
    await expect(jobDescription).toBeVisible()
    await expect(jobBudget).toBeVisible()

    // Should show bid button
    const bidButton = page.locator('button:has-text("Submit Bid")')
    await expect(bidButton).toBeVisible()
  })

  test('should close a job', async ({ page }) => {
    // Navigate to my jobs
    await page.click('a:has-text("My Jobs")')

    await page.waitForSelector('[data-testid="job-card"]')

    // Find active job and open it
    const activeJob = page.locator('[data-testid="job-card"]:has-text("OPEN")')
    await activeJob.click()

    // Open job menu
    await page.click('[data-testid="job-menu"]')

    // Click close job
    await page.click('button:has-text("Close Job")')

    // Confirm action
    await page.click('button:has-text("Confirm")')

    // Status should update
    const statusBadge = page.locator('[data-testid="job-status"]')
    await expect(statusBadge).toContainText(/closed|completed/i)
  })
})

test.describe('Bidding Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as contractor
    await page.goto('/')

    const dashboardExists = await page.locator('[data-testid="dashboard"]').isVisible()

    if (!dashboardExists) {
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      await page.fill('[placeholder*="mail"]', 'contractor@example.com')
      await page.fill('[placeholder*="assword"]', 'SecurePass123!')
      await page.click('button:has-text("Sign In")')

      await page.waitForURL(/dashboard|home/)
    }
  })

  test('should submit a bid on a job', async ({ page }) => {
    // Navigate to jobs
    await page.click('a:has-text("Browse Jobs")')

    await page.waitForSelector('[data-testid="job-card"]')

    // Click a job
    await page.click('[data-testid="job-card"]:first-child')

    await page.waitForSelector('[data-testid="job-details"]')

    // Click submit bid
    await page.click('button:has-text("Submit Bid")')

    // Wait for bid form
    await page.waitForSelector('[data-testid="bid-form"]')

    // Fill bid details
    await page.fill('[placeholder*="amount"], input[name="amount"]', '4500')
    await page.fill('[placeholder*="timeline"], input[name="timeline"]', '10 days')
    await page.fill('[placeholder*="proposal"], textarea[name="proposal"]', 'I can complete this project in 10 days with quality work.')

    // Submit bid
    await page.click('button:has-text("Submit Bid")')

    // Should show success message
    const successMessage = page.locator('text=/bid submitted|success/i')
    await expect(successMessage).toBeVisible()
  })

  test('should show error when bidding amount is too low', async ({ page }) => {
    await page.click('a:has-text("Browse Jobs")')

    await page.waitForSelector('[data-testid="job-card"]')

    await page.click('[data-testid="job-card"]:first-child')

    await page.waitForSelector('[data-testid="job-details"]')

    // Check minimum bid requirement
    const minBid = await page.locator('[data-testid="min-bid"]').textContent()

    await page.click('button:has-text("Submit Bid")')

    await page.waitForSelector('[data-testid="bid-form"]')

    // Submit bid lower than minimum
    await page.fill('[placeholder*="amount"]', '100')
    await page.fill('[placeholder*="timeline"]', '30 days')
    await page.click('button:has-text("Submit Bid")')

    // Should show validation error
    const errorText = page.locator('text=/amount.*too low|minimum bid/i')
    await expect(errorText).toBeVisible()
  })

  test('should view submitted bids', async ({ page }) => {
    // Navigate to my bids
    await page.click('a:has-text("My Bids")')

    await page.waitForSelector('[data-testid="bids-list"]')

    // Should show list of bids
    const bidCards = page.locator('[data-testid="bid-card"]')
    expect(await bidCards.count()).toBeGreaterThan(0)

    // Click a bid to see details
    await bidCards.first().click()

    // Should show bid details
    const bidDetails = page.locator('[data-testid="bid-details"]')
    await expect(bidDetails).toBeVisible()
  })

  test('should withdraw a bid', async ({ page }) => {
    await page.click('a:has-text("My Bids")')

    await page.waitForSelector('[data-testid="bid-card"]')

    // Open bid menu
    await page.locator('[data-testid="bid-menu"]').first().click()

    // Click withdraw
    await page.click('button:has-text("Withdraw")')

    // Confirm action
    await page.click('button:has-text("Confirm")')

    // Bid status should update
    const bidStatus = page.locator('[data-testid="bid-status"]').first()
    await expect(bidStatus).toContainText(/withdrawn|cancelled/i)
  })
})

test.describe('Contract & Payment Workflow', () => {
  test('should accept a bid and create contract', async ({ page }) => {
    // Login as homeowner
    await page.goto('/')

    // ... login code ...

    // Navigate to job with bids
    await page.click('a:has-text("My Jobs")')

    await page.waitForSelector('[data-testid="job-card"]')

    await page.click('[data-testid="job-card"]:first-child')

    // View bids on job
    await page.click('button:has-text("View Bids")')

    await page.waitForSelector('[data-testid="bid-list"]')

    // Accept first bid
    await page.click('[data-testid="accept-bid"]')

    // Should show payment confirmation
    await page.waitForSelector('[data-testid="payment-form"]')

    // Payment form should show 25% deposit
    const depositAmount = page.locator('[data-testid="deposit-amount"]')
    await expect(depositAmount).toContainText('25%')

    // Fill payment details
    await page.fill('[placeholder*="name"], input[name="cardName"]', 'John Doe')
    await page.fill('[placeholder*="card"], input[name="cardNumber"]', '4532015112830366')
    await page.fill('[placeholder*="expiry"], input[name="expiryDate"]', '12/26')
    await page.fill('[placeholder*="cvc"], input[name="cvc"]', '123')

    // Submit payment
    await page.click('button:has-text("Pay Deposit")')

    // Should redirect to contract
    await page.waitForURL(/contract/, { timeout: 10000 })

    // Verify contract details
    const contractStatus = page.locator('[data-testid="contract-status"]')
    await expect(contractStatus).toContainText(/active|accepted/i)
  })
})

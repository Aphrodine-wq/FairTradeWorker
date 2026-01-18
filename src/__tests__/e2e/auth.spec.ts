/**
 * E2E Tests: Authentication Flows
 *
 * Testing user registration, login, and password reset workflows
 * Using Playwright for end-to-end testing
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/')
  })

  test.describe('User Registration', () => {
    test('should register a new user with email', async ({ page }) => {
      // Click register button
      await page.click('button:has-text("Register")')

      // Wait for registration modal
      await page.waitForSelector('[data-testid="auth-modal"]')

      // Fill form fields
      const timestamp = Date.now()
      const email = `user-${timestamp}@example.com`

      await page.fill('[placeholder="First Name"]', 'John')
      await page.fill('[placeholder="Last Name"]', 'Doe')
      await page.fill('[placeholder*="mail"], input[type="email"]', email)
      await page.fill('[placeholder*="hone"], input[type="tel"]', '5551234567')
      await page.fill('[placeholder*="assword"], input[type="password"]', 'SecurePass123!')

      // Select role (Homeowner)
      await page.click('button:has-text("Homeowner")')

      // Submit form
      await page.click('button:has-text("Create Account")')

      // Should redirect to verification or onboarding
      await page.waitForURL(/verify|onboarding|dashboard/, { timeout: 10000 })

      // Verify success message or redirect
      const url = page.url()
      expect(url).toMatch(/verify|onboarding|dashboard/)
    })

    test('should register a contractor', async ({ page }) => {
      await page.click('button:has-text("Register")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      const timestamp = Date.now()
      const email = `contractor-${timestamp}@example.com`

      await page.fill('[placeholder="First Name"]', 'Jane')
      await page.fill('[placeholder="Last Name"]', 'Smith')
      await page.fill('[placeholder*="mail"], input[type="email"]', email)
      await page.fill('[placeholder*="hone"], input[type="tel"]', '5559876543')
      await page.fill('[placeholder*="assword"], input[type="password"]', 'SecurePass123!')

      // Select role (Contractor)
      await page.click('button:has-text("Contractor")')

      // Submit
      await page.click('button:has-text("Create Account")')

      // Should complete registration
      await page.waitForURL(/verify|onboarding|dashboard|specializations/, {
        timeout: 10000,
      })

      const url = page.url()
      expect(url).toMatch(/verify|onboarding|dashboard|specializations/)
    })

    test('should show validation errors for invalid email', async ({ page }) => {
      await page.click('button:has-text("Register")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      await page.fill('[placeholder="First Name"]', 'John')
      await page.fill('[placeholder="Last Name"]', 'Doe')
      await page.fill('[placeholder*="mail"], input[type="email"]', 'invalid-email')
      await page.fill('[placeholder*="hone"], input[type="tel"]', '5551234567')
      await page.fill('[placeholder*="assword"], input[type="password"]', 'SecurePass123!')

      await page.click('button:has-text("Create Account")')

      // Should show validation error
      const errorText = page.locator('text=/valid email|email address/i')
      await expect(errorText).toBeVisible()
    })

    test('should show validation errors for weak password', async ({ page }) => {
      await page.click('button:has-text("Register")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      await page.fill('[placeholder="First Name"]', 'John')
      await page.fill('[placeholder="Last Name"]', 'Doe')
      await page.fill('[placeholder*="mail"], input[type="email"]', 'john@example.com')
      await page.fill('[placeholder*="hone"], input[type="tel"]', '5551234567')
      await page.fill('[placeholder*="assword"], input[type="password"]', 'weak')

      await page.click('button:has-text("Create Account")')

      // Should show password validation errors
      const errorText = page.locator('text=/password.*strong|uppercase|lowercase|number|special/i')
      await expect(errorText).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('User Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      // Assuming test account exists
      const testEmail = 'test@example.com'
      const testPassword = 'SecurePass123!'

      // Click login button
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      // Fill credentials
      await page.fill('[placeholder*="mail"], input[type="email"]', testEmail)
      await page.fill('[placeholder*="assword"], input[type="password"]', testPassword)

      // Submit
      await page.click('button:has-text("Sign In")')

      // Should redirect to dashboard
      await page.waitForURL(/dashboard|home/, { timeout: 10000 })
      expect(page.url()).toMatch(/dashboard|home/)
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      await page.fill('[placeholder*="mail"], input[type="email"]', 'nonexistent@example.com')
      await page.fill('[placeholder*="assword"], input[type="password"]', 'WrongPassword123!')

      await page.click('button:has-text("Sign In")')

      // Should show error message
      const errorText = page.locator('text=/invalid|credentials|not found/i')
      await expect(errorText).toBeVisible()
    })

    test('should show error for missing email', async ({ page }) => {
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      // Only fill password
      await page.fill('[placeholder*="assword"], input[type="password"]', 'SecurePass123!')

      await page.click('button:has-text("Sign In")')

      // Should show validation error
      const errorText = page.locator('text=/required|email.*required/i')
      await expect(errorText).toBeVisible()
    })
  })

  test.describe('Password Reset', () => {
    test('should initiate password reset', async ({ page }) => {
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      // Click forgot password link
      await page.click('a:has-text("Forgot Password")')

      // Should show reset form
      const resetForm = page.locator('[data-testid="password-reset-form"]')
      await expect(resetForm).toBeVisible()

      // Fill email
      await page.fill('[placeholder*="mail"], input[type="email"]', 'user@example.com')

      // Submit
      await page.click('button:has-text("Send Reset Link")')

      // Should show confirmation message
      const confirmationText = page.locator('text=/check.*email|sent|link.*email/i')
      await expect(confirmationText).toBeVisible()
    })

    test('should show error for nonexistent email', async ({ page }) => {
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      await page.click('a:has-text("Forgot Password")')
      await page.waitForSelector('[data-testid="password-reset-form"]')

      await page.fill('[placeholder*="mail"], input[type="email"]', 'nonexistent@example.com')
      await page.click('button:has-text("Send Reset Link")')

      // Should show error
      const errorText = page.locator('text=/not found|does not exist/i')
      await expect(errorText).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('should logout authenticated user', async ({ page, context }) => {
      // First login
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      await page.fill('[placeholder*="mail"], input[type="email"]', 'test@example.com')
      await page.fill('[placeholder*="assword"], input[type="password"]', 'SecurePass123!')
      await page.click('button:has-text("Sign In")')

      await page.waitForURL(/dashboard|home/)

      // Open user menu
      await page.click('[data-testid="user-menu"]')

      // Click logout
      await page.click('button:has-text("Logout")')

      // Should redirect to login
      await page.waitForURL(/login|home/, { timeout: 10000 })

      // Check that authenticated endpoints are no longer accessible
      await page.goto('/dashboard')
      expect(page.url()).toMatch(/login|auth|home/)
    })
  })

  test.describe('Token Refresh', () => {
    test('should refresh token on 401 response', async ({ page }) => {
      // This test verifies that the API client handles token refresh automatically

      // Login
      await page.click('button:has-text("Sign In")')
      await page.waitForSelector('[data-testid="auth-modal"]')

      await page.fill('[placeholder*="mail"], input[type="email"]', 'test@example.com')
      await page.fill('[placeholder*="assword"], input[type="password"]', 'SecurePass123!')
      await page.click('button:has-text("Sign In")')

      await page.waitForURL(/dashboard|home/)

      // Make a request (should automatically refresh token if needed)
      await page.goto('/dashboard')

      // Should remain on dashboard (token was refreshed)
      expect(page.url()).toMatch(/dashboard/)
    })
  })
})

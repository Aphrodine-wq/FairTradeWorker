/**
 * Centralized Revenue Configuration
 * Defines the "Dollar by Dollar" flow of funds.
 */
export const REVENUE_MODEL = {
  // -----------------------------------------
  // 1. FEE STRUCTURE (Homeowner Pays)
  // -----------------------------------------
  // The platform fee is added ON TOP of the bid.
  // Example: Bid $100 + 12% Fee = $112 Total to Homeowner.
  PLATFORM_FEE_PERCENT: 0.12, // 12%
  
  // -----------------------------------------
  // 2. CONTRACTOR EARNINGS (No Deductions)
  // -----------------------------------------
  // Contractor receives 100% of their ask.
  // We do not take a cut from the labor/materials.
  CONTRACTOR_KEEP_PERCENT: 1.00, 
  
  // -----------------------------------------
  // 3. PAYMENT SCHEDULE
  // -----------------------------------------
  DEPOSIT_PERCENT: 0.25,      // 25% upfront to start work
  FINAL_PAYMENT_PERCENT: 0.75,// 75% upon completion
  
  // -----------------------------------------
  // 4. ESCROW RULES
  // -----------------------------------------
  DEPOSIT_RELEASE_HOURS: 0,   // Instant release upon project start
  FINAL_RELEASE_HOURS: 24,    // 24h dispute window before auto-release
  
  // -----------------------------------------
  // 5. LIMITS
  // -----------------------------------------
  MIN_TRANSACTION_USD: 50,
  MAX_TRANSACTION_USD: 1000000,
};

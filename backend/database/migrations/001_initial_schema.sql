/**
 * Database Migration: 001_initial_schema
 * Initial schema creation for FairTradeWorker
 * Created: 2026-01-05
 *
 * This migration creates the core tables required for the application
 */

-- ============================
-- User Management Tables
-- ============================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  profile_picture_url TEXT,
  role VARCHAR(50) NOT NULL CHECK (role IN ('HOMEOWNER', 'CONTRACTOR', 'ADMIN')),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============================
-- User Verification Tables
-- ============================

CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);

-- ============================
-- User Profile Tables
-- ============================

CREATE TABLE IF NOT EXISTS contractor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100),
  license_state VARCHAR(50),
  license_verified BOOLEAN DEFAULT FALSE,
  ssn_last_four VARCHAR(4),
  ssn_verified BOOLEAN DEFAULT FALSE,
  bank_account_last_four VARCHAR(4),
  stripe_connect_id VARCHAR(255),
  stripe_connect_verified BOOLEAN DEFAULT FALSE,
  bio TEXT,
  hourly_rate DECIMAL(10, 2),
  years_experience INTEGER,
  specializations TEXT[], -- Array of specializations
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_completed_jobs INTEGER DEFAULT 0,
  total_earned DECIMAL(12, 2) DEFAULT 0.00,
  response_time_hours INTEGER,
  availability_status VARCHAR(50) DEFAULT 'AVAILABLE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contractor_profiles_user_id ON contractor_profiles(user_id);
CREATE INDEX idx_contractor_profiles_stripe_connect_id ON contractor_profiles(stripe_connect_id);
CREATE INDEX idx_contractor_profiles_average_rating ON contractor_profiles(average_rating DESC);

CREATE TABLE IF NOT EXISTS homeowner_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  address_verified BOOLEAN DEFAULT FALSE,
  payment_method_default VARCHAR(255),
  total_jobs_posted INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0.00,
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  preferences_communication VARCHAR(50),
  preferences_budget_range VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_homeowner_profiles_user_id ON homeowner_profiles(user_id);
CREATE INDEX idx_homeowner_profiles_address_verified ON homeowner_profiles(address_verified);

-- ============================
-- Job Tables
-- ============================

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  budget_amount DECIMAL(12, 2) NOT NULL,
  budget_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  location_address VARCHAR(255),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  timeline_expected_days INTEGER,
  timeline_start_date DATE,
  timeline_deadline DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CONTRACTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  visibility VARCHAR(50) NOT NULL DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
  estimated_duration_hours INTEGER,
  required_experience_level VARCHAR(50),
  required_skills TEXT[],
  allowed_bid_count INTEGER,
  attachment_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_jobs_posted_by_id ON jobs(posted_by_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_budget_amount ON jobs(budget_amount);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_location ON jobs USING GIST (ll_to_earth(location_latitude, location_longitude));

-- ============================
-- Bid Tables
-- ============================

CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  timeline_days INTEGER,
  proposal TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
  visibility_overrides TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(job_id, contractor_id)
);

CREATE INDEX idx_bids_job_id ON bids(job_id);
CREATE INDEX idx_bids_contractor_id ON bids(contractor_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_created_at ON bids(created_at DESC);

-- ============================
-- Contract Tables
-- ============================

CREATE TABLE IF NOT EXISTS bid_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL UNIQUE REFERENCES bids(id) ON DELETE CASCADE,
  homeowner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  deposit_amount DECIMAL(12, 2) NOT NULL,
  final_amount DECIMAL(12, 2) NOT NULL,
  platform_fee DECIMAL(12, 2) NOT NULL,
  contractor_net DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'DISPUTED')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'DEPOSIT_PAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED')),
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bid_contracts_job_id ON bid_contracts(job_id);
CREATE INDEX idx_bid_contracts_bid_id ON bid_contracts(bid_id);
CREATE INDEX idx_bid_contracts_homeowner_id ON bid_contracts(homeowner_id);
CREATE INDEX idx_bid_contracts_contractor_id ON bid_contracts(contractor_id);
CREATE INDEX idx_bid_contracts_status ON bid_contracts(status);
CREATE INDEX idx_bid_contracts_payment_status ON bid_contracts(payment_status);

-- ============================
-- Escrow Tables
-- ============================

CREATE TABLE IF NOT EXISTS escrow_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL UNIQUE REFERENCES bid_contracts(id) ON DELETE CASCADE,
  homeowner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deposit_amount DECIMAL(12, 2) NOT NULL,
  held_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  released_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  refunded_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'INITIALIZED' CHECK (status IN ('INITIALIZED', 'FUNDED', 'HELD', 'RELEASED', 'REFUNDED')),
  funded_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escrow_accounts_contract_id ON escrow_accounts(contract_id);
CREATE INDEX idx_escrow_accounts_homeowner_id ON escrow_accounts(homeowner_id);
CREATE INDEX idx_escrow_accounts_contractor_id ON escrow_accounts(contractor_id);
CREATE INDEX idx_escrow_accounts_status ON escrow_accounts(status);

-- ============================
-- Payment Tables
-- ============================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES bid_contracts(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('DEPOSIT', 'FINAL_PAYMENT', 'REFUND', 'PAYOUT')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('STRIPE', 'ACH', 'WIRE', 'CHECK')),
  stripe_charge_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  idempotency_key VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  fee_amount DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2),
  error_message TEXT,
  processing_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_contract_id ON transactions(contract_id);
CREATE INDEX idx_transactions_payer_id ON transactions(payer_id);
CREATE INDEX idx_transactions_payee_id ON transactions(payee_id);
CREATE INDEX idx_transactions_stripe_charge_id ON transactions(stripe_charge_id);
CREATE INDEX idx_transactions_stripe_payment_intent_id ON transactions(stripe_payment_intent_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================
-- Job Completion Tables
-- ============================

CREATE TABLE IF NOT EXISTS job_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL UNIQUE REFERENCES bid_contracts(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  homeowner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_urls TEXT[] NOT NULL,
  video_urls TEXT[],
  notes TEXT,
  geolocation_latitude DECIMAL(10, 8),
  geolocation_longitude DECIMAL(11, 8),
  status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'APPROVED', 'REJECTED')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_completions_contract_id ON job_completions(contract_id);
CREATE INDEX idx_job_completions_contractor_id ON job_completions(contractor_id);
CREATE INDEX idx_job_completions_homeowner_id ON job_completions(homeowner_id);
CREATE INDEX idx_job_completions_status ON job_completions(status);

-- ============================
-- Dispute Tables
-- ============================

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES bid_contracts(id) ON DELETE CASCADE,
  job_completion_id UUID REFERENCES job_completions(id) ON DELETE SET NULL,
  initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  respondent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  initial_evidence TEXT[],
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CONTESTED', 'ESCALATED', 'RESOLVED', 'CLOSED')),
  requested_resolution VARCHAR(50),
  resolution_type VARCHAR(50) CHECK (resolution_type IN ('REFUND', 'REDO', 'PARTIAL_REFUND')),
  homeowner_refund DECIMAL(12, 2),
  contractor_payout DECIMAL(12, 2),
  resolution_notes TEXT,
  dispute_window_expires_at TIMESTAMP WITH TIME ZONE,
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disputes_contract_id ON disputes(contract_id);
CREATE INDEX idx_disputes_job_completion_id ON disputes(job_completion_id);
CREATE INDEX idx_disputes_initiator_id ON disputes(initiator_id);
CREATE INDEX idx_disputes_respondent_id ON disputes(respondent_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_initiated_at ON disputes(initiated_at DESC);

CREATE TABLE IF NOT EXISTS dispute_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  respondent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  evidence TEXT[],
  requested_resolution VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dispute_responses_dispute_id ON dispute_responses(dispute_id);
CREATE INDEX idx_dispute_responses_respondent_id ON dispute_responses(respondent_id);

-- ============================
-- Review and Rating Tables
-- ============================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES bid_contracts(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  reviewer_role VARCHAR(50) NOT NULL CHECK (reviewer_role IN ('HOMEOWNER', 'CONTRACTOR')),
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FLAGGED', 'REMOVED')),
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_contract_id ON reviews(contract_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================
-- Audit Log Table
-- ============================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILURE')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================
-- Notification Tables
-- ============================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  related_id UUID,
  related_type VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  delivery_status VARCHAR(50) DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING', 'SENT', 'FAILED')),
  delivery_method VARCHAR(50) CHECK (delivery_method IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================
-- Post-Migration Verification
-- ============================

-- Create view for active jobs
CREATE OR REPLACE VIEW active_jobs AS
SELECT * FROM jobs WHERE status IN ('OPEN', 'CONTRACTED', 'IN_PROGRESS');

-- Create view for pending transactions
CREATE OR REPLACE VIEW pending_transactions AS
SELECT * FROM transactions WHERE status IN ('PENDING', 'PROCESSING');

-- Create view for open disputes
CREATE OR REPLACE VIEW open_disputes AS
SELECT * FROM disputes WHERE status IN ('OPEN', 'CONTESTED');

-- Migration metadata
INSERT INTO schema_migrations (version, name, executed_at)
VALUES ('001', 'initial_schema', NOW())
ON CONFLICT DO NOTHING;

COMMIT;

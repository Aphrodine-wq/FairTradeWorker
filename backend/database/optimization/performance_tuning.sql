/**
 * Database Performance Tuning Script
 * Optimizes PostgreSQL configuration for production workload
 * Run this after initial schema creation
 */

-- ============================
-- Connection Pool Configuration
-- ============================

-- Recommended for RDS: db.r6i.xlarge (4 vCPU, 32 GB RAM)
-- Set max_connections based on workload
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET superuser_reserved_connections = 10;
ALTER SYSTEM SET reserved_connections = 5;

-- ============================
-- Memory Configuration
-- ============================

-- Set shared_buffers to 25% of available RAM (8GB for 32GB instance)
ALTER SYSTEM SET shared_buffers = '8GB';

-- Set effective_cache_size to 75% of available RAM (24GB for 32GB instance)
ALTER SYSTEM SET effective_cache_size = '24GB';

-- Set work_mem based on max_connections
-- Formula: (RAM - shared_buffers - OS) / (max_connections * 2)
-- (32GB - 8GB - 2GB) / (200 * 2) = ~60MB
ALTER SYSTEM SET work_mem = '60MB';

-- Set maintenance_work_mem to 1GB
ALTER SYSTEM SET maintenance_work_mem = '1GB';

-- ============================
-- WAL (Write-Ahead Logging) Configuration
-- ============================

-- Enable archiving for PITR (Point-In-Time Recovery)
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET max_wal_senders = 5;
ALTER SYSTEM SET wal_keep_size = '5GB';

-- Optimize checkpoints
ALTER SYSTEM SET checkpoint_timeout = '15min';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET max_wal_size = '4GB';
ALTER SYSTEM SET min_wal_size = '1GB';

-- ============================
-- Query Planning Configuration
-- ============================

-- Enable parallel query execution
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;
ALTER SYSTEM SET max_parallel_maintenance_workers = 4;

-- Parallel query threshold (minimum query cost for parallelization)
ALTER SYSTEM SET parallel_tuple_cost = 0.01;
ALTER SYSTEM SET parallel_setup_cost = 250;

-- ============================
-- Autovacuum Configuration
-- ============================

-- Enable autovacuum (should be enabled by default)
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 4;
ALTER SYSTEM SET autovacuum_naptime = '10s';

-- Autovacuum thresholds
-- Vacuum when table_size * 0.1 + 50,000 rows are modified
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50000;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;

-- Analyze thresholds (same as vacuum)
ALTER SYSTEM SET autovacuum_analyze_threshold = 50000;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;

-- ============================
-- Logging Configuration
-- ============================

-- Log slow queries (>1000ms)
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_duration = off;
ALTER SYSTEM SET log_statement = 'mod'; -- Only log DDL and DML
ALTER SYSTEM SET log_line_prefix = '[%t] [%p] [%u@%d] ';

-- Log connection details
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_duration = off;

-- ============================
-- Cleanup Old Logs
-- ============================

-- Keep 7 days of logs (adjust based on RDS settings)
ALTER SYSTEM SET log_rotation_age = '1d';
ALTER SYSTEM SET log_rotation_size = '100MB';

-- ============================
-- Random Page Access Configuration
-- ============================

-- Adjust for SSD storage (lower values mean more index scans)
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET seq_page_cost = 1.0;

-- ============================
-- Extension Management
-- ============================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgvector;    -- Vector similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- Trigram for text search
CREATE EXTENSION IF NOT EXISTS uuid-ossp;   -- UUID generation
CREATE EXTENSION IF NOT EXISTS earthdistance; -- Geographic distance
CREATE EXTENSION IF NOT EXISTS cube;        -- Multidimensional data type (required for earthdistance)
CREATE EXTENSION IF NOT EXISTS citext;      -- Case-insensitive text
CREATE EXTENSION IF NOT EXISTS hstore;      -- Key-value storage
CREATE EXTENSION IF NOT EXISTS ltree;       -- Tree structure
CREATE EXTENSION IF NOT EXISTS json;        -- JSON processing

-- ============================
-- Table Compression
-- ============================

-- Enable compression for large tables
ALTER TABLE audit_logs SET (fillfactor = 70);
ALTER TABLE notifications SET (fillfactor = 70);

-- ============================
-- Index Optimization
-- ============================

-- Create index on status columns with partial indexes for common states
CREATE INDEX CONCURRENTLY idx_bids_pending ON bids(job_id) WHERE status = 'PENDING';
CREATE INDEX CONCURRENTLY idx_contracts_active ON bid_contracts(status) WHERE status IN ('ACTIVE', 'DISPUTED');
CREATE INDEX CONCURRENTLY idx_transactions_pending ON transactions(status) WHERE status IN ('PENDING', 'PROCESSING');
CREATE INDEX CONCURRENTLY idx_disputes_open ON disputes(status) WHERE status IN ('OPEN', 'CONTESTED');
CREATE INDEX CONCURRENTLY idx_completions_pending ON job_completions(status) WHERE status = 'SUBMITTED';

-- Multi-column indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_bids_job_contractor ON bids(job_id, contractor_id);
CREATE INDEX CONCURRENTLY idx_contracts_homeowner_status ON bid_contracts(homeowner_id, status);
CREATE INDEX CONCURRENTLY idx_contracts_contractor_status ON bid_contracts(contractor_id, status);
CREATE INDEX CONCURRENTLY idx_transactions_contract_type ON transactions(contract_id, type);
CREATE INDEX CONCURRENTLY idx_reviews_reviewee_rating ON reviews(reviewee_id, rating DESC);

-- ============================
-- Statistics Configuration
-- ============================

-- Increase statistics target for better query planning
ALTER TABLE jobs ALTER COLUMN budget_amount SET STATISTICS 200;
ALTER TABLE bid_contracts ALTER COLUMN status SET STATISTICS 200;
ALTER TABLE transactions ALTER COLUMN status SET STATISTICS 200;

-- ============================
-- Table Partitioning (Optional for very large tables)
-- ============================

-- Partition transactions by year for archival strategy
-- Uncomment when transactions table exceeds 10M rows

/*
CREATE TABLE IF NOT EXISTS transactions_y2026 PARTITION OF transactions
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE IF NOT EXISTS transactions_y2027 PARTITION OF transactions
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
*/

-- ============================
-- Function for Updated Timestamps
-- ============================

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bids_updated_at BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_contracts_updated_at BEFORE UPDATE ON bid_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_disputes_updated_at BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================
-- Full Text Search Configuration
-- ============================

-- Create GIN index for full-text search on job descriptions
CREATE INDEX idx_jobs_description_fts ON jobs
  USING gin(to_tsvector('english', description));

-- Create GIN index for full-text search on reviews
CREATE INDEX idx_reviews_comment_fts ON reviews
  USING gin(to_tsvector('english', comment));

-- ============================
-- Materialized Views for Analytics (Optional)
-- ============================

-- Cache contractor ratings and stats
CREATE MATERIALIZED VIEW contractor_stats AS
SELECT
  c.user_id,
  COUNT(DISTINCT bc.id) as total_completed_jobs,
  AVG(r.rating) as average_rating,
  COUNT(DISTINCT r.id) as total_reviews,
  SUM(bc.contractor_net) as total_earned,
  MAX(r.created_at) as last_review_date
FROM contractor_profiles c
LEFT JOIN bid_contracts bc ON c.user_id = bc.contractor_id AND bc.status = 'COMPLETED'
LEFT JOIN reviews r ON bc.id = r.contract_id AND r.reviewee_id = c.user_id
GROUP BY c.user_id;

CREATE UNIQUE INDEX idx_contractor_stats_user_id ON contractor_stats(user_id);

-- Cache job market statistics
CREATE MATERIALIZED VIEW job_market_stats AS
SELECT
  category,
  COUNT(*) as total_jobs,
  AVG(budget_amount) as avg_budget,
  MAX(budget_amount) as max_budget,
  MIN(budget_amount) as min_budget,
  COUNT(CASE WHEN status IN ('OPEN', 'CONTRACTED') THEN 1 END) as active_jobs,
  COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_jobs
FROM jobs
GROUP BY category;

CREATE INDEX idx_job_market_stats_category ON job_market_stats(category);

-- ============================
-- Replication Configuration (for RDS Multi-AZ)
-- ============================

-- These are automatically configured by RDS, but documented for reference
-- RDS handles: Primary and Standby instance, synchronous replication, automatic failover

-- ============================
-- Backup and PITR Configuration
-- ============================

-- RDS handles backup retention automatically
-- Recommended: 30-day retention for production
-- Set via AWS Management Console or CLI

-- ============================
-- Performance Baselines
-- ============================

-- Create a table to store performance metrics
CREATE TABLE IF NOT EXISTS performance_baselines (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  baseline_value NUMERIC,
  measurement_date TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Insert initial baselines (after collecting data)
-- These will be populated during the first week of production monitoring

-- ============================
-- Apply Configuration Changes
-- ============================

-- PostgreSQL requires reload for some parameters
-- For RDS, use Parameter Groups to make these changes persistent
-- SELECT pg_reload_conf();

-- ============================
-- Post-Optimization Verification
-- ============================

-- Run VACUUM ANALYZE to gather statistics
VACUUM ANALYZE;

-- Check configuration
SELECT name, setting FROM pg_settings
  WHERE name LIKE '%buffer%' OR name LIKE '%connection%' OR name LIKE '%work_mem%';

-- Verify extensions
SELECT * FROM pg_extension;

-- Check index sizes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

COMMIT;

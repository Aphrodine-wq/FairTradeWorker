/**
 * Terraform Variables for FairTradeWorker Production Infrastructure
 * Defines all configurable parameters for AWS deployment
 */

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "fairtradeworker"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "fairtradeworker-api"
}

# ============================
# VPC Configuration
# ============================

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for deployment"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
}

# ============================
# RDS Database Configuration
# ============================

variable "db_engine" {
  description = "Database engine"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "14.7"
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.r6i.xlarge"
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for autoscaling"
  type        = number
  default     = 500
}

variable "db_multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "db_backup_retention_days" {
  description = "Database backup retention in days"
  type        = number
  default     = 30
}

variable "db_backup_window" {
  description = "Preferred backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "Preferred maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# ============================
# ElastiCache Configuration
# ============================

variable "redis_engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0"
}

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.r6g.xlarge"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 3
}

variable "redis_automatic_failover" {
  description = "Enable automatic failover"
  type        = bool
  default     = true
}

variable "redis_multi_az" {
  description = "Enable Multi-AZ"
  type        = bool
  default     = true
}

variable "redis_snapshot_retention_limit" {
  description = "Snapshot retention limit in days"
  type        = number
  default     = 7
}

variable "redis_snapshot_window" {
  description = "Preferred snapshot window"
  type        = string
  default     = "03:00-05:00"
}

# ============================
# ECS Configuration
# ============================

variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
  default     = "fairtradeworker-cluster"
}

variable "ecs_task_cpu" {
  description = "Task CPU units"
  type        = string
  default     = "1024"
}

variable "ecs_task_memory" {
  description = "Task memory in MB"
  type        = string
  default     = "2048"
}

variable "ecs_desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 3
}

variable "ecs_min_capacity" {
  description = "Minimum task count for scaling"
  type        = number
  default     = 3
}

variable "ecs_max_capacity" {
  description = "Maximum task count for scaling"
  type        = number
  default     = 10
}

variable "ecs_container_port" {
  description = "Container port"
  type        = number
  default     = 3000
}

# ============================
# ALB Configuration
# ============================

variable "alb_name" {
  description = "Application Load Balancer name"
  type        = string
  default     = "fairtradeworker-alb"
}

variable "alb_enable_deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "alb_enable_http2" {
  description = "Enable HTTP/2"
  type        = bool
  default     = true
}

variable "alb_enable_cross_zone_load_balancing" {
  description = "Enable cross-zone load balancing"
  type        = bool
  default     = true
}

variable "health_check_path" {
  description = "Health check endpoint"
  type        = string
  default     = "/api/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

variable "health_check_healthy_threshold" {
  description = "Healthy threshold"
  type        = number
  default     = 2
}

variable "health_check_unhealthy_threshold" {
  description = "Unhealthy threshold"
  type        = number
  default     = 3
}

# ============================
# CloudFront Configuration
# ============================

variable "cloudfront_enabled" {
  description = "Enable CloudFront CDN"
  type        = bool
  default     = true
}

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "cloudfront_default_ttl" {
  description = "Default TTL in seconds"
  type        = number
  default     = 3600
}

variable "cloudfront_max_ttl" {
  description = "Maximum TTL in seconds"
  type        = number
  default     = 86400
}

# ============================
# WAF Configuration
# ============================

variable "waf_enabled" {
  description = "Enable WAF"
  type        = bool
  default     = true
}

variable "waf_rate_limit" {
  description = "WAF rate limit per IP"
  type        = number
  default     = 2000
}

# ============================
# SSL/TLS Configuration
# ============================

variable "domain_name" {
  description = "Domain name for SSL certificate"
  type        = string
  sensitive   = true
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
  sensitive   = true
}

# ============================
# Monitoring Configuration
# ============================

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "alert_email" {
  description = "Email for CloudWatch alerts"
  type        = string
  sensitive   = true
}

variable "alarm_cpu_threshold" {
  description = "CPU threshold for alarms"
  type        = number
  default     = 80
}

variable "alarm_memory_threshold" {
  description = "Memory threshold for alarms"
  type        = number
  default     = 85
}

variable "alarm_database_connections" {
  description = "Database connection threshold"
  type        = number
  default     = 80
}

# ============================
# S3 Configuration
# ============================

variable "s3_bucket_name" {
  description = "S3 bucket for file uploads"
  type        = string
}

variable "s3_enable_versioning" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "s3_enable_encryption" {
  description = "Enable S3 encryption"
  type        = bool
  default     = true
}

# ============================
# Backup Configuration
# ============================

variable "backup_vault_name" {
  description = "AWS Backup vault name"
  type        = string
  default     = "fairtradeworker-backups"
}

variable "backup_retention_days" {
  description = "Backup retention in days"
  type        = number
  default     = 30
}

variable "backup_schedule" {
  description = "Backup schedule (cron)"
  type        = string
  default     = "cron(0 2 * * ? *)"
}

# ============================
# Tags
# ============================

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "FairTradeWorker"
    ManagedBy   = "Terraform"
    CreatedAt   = "2026-01-05"
  }
}

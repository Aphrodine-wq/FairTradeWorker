/**
 * Terraform Outputs for FairTradeWorker Infrastructure
 * Exports critical infrastructure details for application configuration
 */

# ============================
# VPC Outputs
# ============================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "database_subnet_ids" {
  description = "Database subnet IDs"
  value       = module.vpc.database_subnet_ids
}

# ============================
# RDS Database Outputs
# ============================

output "rds_endpoint" {
  description = "RDS database endpoint"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "rds_host" {
  description = "RDS database host"
  value       = split(":", module.rds.db_instance_endpoint)[0]
  sensitive   = true
}

output "rds_port" {
  description = "RDS database port"
  value       = 5432
}

output "rds_database_name" {
  description = "RDS database name"
  value       = "fairtradeworker"
}

output "rds_username" {
  description = "RDS database master username"
  value       = var.db_username
  sensitive   = true
}

output "rds_instance_id" {
  description = "RDS instance identifier"
  value       = module.rds.db_instance_id
}

output "rds_arn" {
  description = "RDS instance ARN"
  value       = module.rds.db_instance_arn
}

output "database_url" {
  description = "Complete database connection URL"
  value       = "postgresql://${var.db_username}:PASSWORD@${split(":", module.rds.db_instance_endpoint)[0]}:5432/fairtradeworker"
  sensitive   = true
}

# ============================
# ElastiCache Redis Outputs
# ============================

output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = module.redis.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "Redis port"
  value       = 6379
}

output "redis_cluster_id" {
  description = "Redis cluster ID"
  value       = module.redis.cluster_id
}

output "redis_url" {
  description = "Redis connection URL"
  value       = "redis://${module.redis.primary_endpoint_address}:6379"
  sensitive   = true
}

# ============================
# ECS Cluster Outputs
# ============================

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = module.ecs.cluster_arn
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

output "ecs_task_definition_arn" {
  description = "ECS task definition ARN"
  value       = module.ecs.task_definition_arn
}

# ============================
# Load Balancer Outputs
# ============================

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

output "alb_zone_id" {
  description = "Load Balancer Zone ID"
  value       = aws_lb.main.zone_id
}

output "target_group_arn" {
  description = "Target group ARN"
  value       = aws_lb_target_group.app.arn
}

# ============================
# CloudFront Outputs
# ============================

output "cloudfront_domain_name" {
  description = "CloudFront domain name"
  value       = var.cloudfront_enabled ? module.cloudfront[0].domain_name : null
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.cloudfront_enabled ? module.cloudfront[0].distribution_id : null
}

# ============================
# ECR Repository Outputs
# ============================

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_registry_id" {
  description = "ECR registry ID"
  value       = aws_ecr_repository.app.registry_id
}

# ============================
# S3 Bucket Outputs
# ============================

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = module.s3.bucket_name
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = module.s3.bucket_arn
}

output "s3_bucket_domain" {
  description = "S3 bucket domain"
  value       = module.s3.bucket_domain_name
}

# ============================
# IAM Roles Outputs
# ============================

output "ecs_task_execution_role_arn" {
  description = "ECS task execution role ARN"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_execution_role_name" {
  description = "ECS task execution role name"
  value       = aws_iam_role.ecs_task_execution_role.name
}

# ============================
# Security Groups Outputs
# ============================

output "alb_security_group_id" {
  description = "ALB security group ID"
  value       = aws_security_group.alb.id
}

output "ecs_tasks_security_group_id" {
  description = "ECS tasks security group ID"
  value       = aws_security_group.ecs_tasks.id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

# ============================
# CloudWatch Outputs
# ============================

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "cloudwatch_log_group_arn" {
  description = "CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.ecs.arn
}

# ============================
# Environment Variables for Application
# ============================

output "application_environment_variables" {
  description = "Environment variables for application deployment"
  value = {
    DATABASE_URL = "postgresql://${var.db_username}:PASSWORD@${split(":", module.rds.db_instance_endpoint)[0]}:5432/fairtradeworker"
    REDIS_URL    = "redis://${module.redis.primary_endpoint_address}:6379"
    AWS_REGION   = var.aws_region
    S3_BUCKET    = module.s3.bucket_name
    ECR_REPO_URL = aws_ecr_repository.app.repository_url
  }
  sensitive = true
}

# ============================
# Deployment Information
# ============================

output "deployment_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    environment              = var.environment
    region                   = var.aws_region
    vpc_id                   = module.vpc.vpc_id
    rds_endpoint             = split(":", module.rds.db_instance_endpoint)[0]
    redis_endpoint           = module.redis.primary_endpoint_address
    alb_dns_name             = aws_lb.main.dns_name
    ecs_cluster_name         = module.ecs.cluster_name
    ecr_repository           = aws_ecr_repository.app.repository_url
    cloudwatch_log_group     = aws_cloudwatch_log_group.ecs.name
  }
  sensitive = true
}

# ============================
# Quick Start Guide
# ============================

output "quick_start" {
  description = "Quick start guide for deployment"
  value = <<-EOT

    ========================================
    FairTradeWorker Infrastructure Deployed
    ========================================

    Environment: ${var.environment}
    Region: ${var.aws_region}

    Important Endpoints:
    - ALB: ${aws_lb.main.dns_name}
    - ECR: ${aws_ecr_repository.app.repository_url}
    - Database: ${split(":", module.rds.db_instance_endpoint)[0]}:5432
    - Redis: ${module.redis.primary_endpoint_address}:6379

    Next Steps:
    1. Set database password in Parameter Store
    2. Build and push Docker image to ECR
    3. Update ECS task definition with image URI
    4. Deploy application to ECS
    5. Configure DNS to point to ALB

    View more details with:
    terraform output <output_name>

    Full output: terraform output application_environment_variables

  EOT
}

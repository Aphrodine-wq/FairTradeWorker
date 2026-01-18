/**
 * Terraform Main Configuration for FairTradeWorker Production Infrastructure
 * Provisions complete AWS infrastructure for production deployment
 */

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "fairtradeworker-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge(var.common_tags, {
      Environment = var.environment
      ManagedBy   = "Terraform"
      Timestamp   = timestamp()
    })
  }
}

# ============================
# VPC Setup
# ============================

module "vpc" {
  source = "./modules/vpc"

  environment              = var.environment
  project_name             = var.project_name
  vpc_cidr                 = var.vpc_cidr
  availability_zones       = var.availability_zones
  public_subnet_cidrs      = var.public_subnet_cidrs
  private_subnet_cidrs     = var.private_subnet_cidrs
  database_subnet_cidrs    = var.database_subnet_cidrs
  enable_nat_gateway       = true
  enable_vpn_gateway       = false
  enable_flow_logs         = true
}

# ============================
# RDS Database
# ============================

module "rds" {
  source = "./modules/rds"

  environment                = var.environment
  project_name               = var.project_name
  db_engine                  = var.db_engine
  db_engine_version          = var.db_engine_version
  db_instance_class          = var.db_instance_class
  db_allocated_storage       = var.db_allocated_storage
  db_max_allocated_storage   = var.db_max_allocated_storage
  db_multi_az                = var.db_multi_az
  db_backup_retention_days   = var.db_backup_retention_days
  db_backup_window           = var.db_backup_window
  db_maintenance_window      = var.db_maintenance_window
  db_username                = var.db_username
  db_password                = var.db_password
  db_name                    = "fairtradeworker"
  vpc_security_group_ids     = [aws_security_group.rds.id]
  db_subnet_group_name       = aws_db_subnet_group.db.name
  enable_cloudwatch_logs     = true
  enable_enhanced_monitoring = true
  monitoring_interval        = 60

  depends_on = [
    module.vpc,
    aws_db_subnet_group.db
  ]
}

# ============================
# ElastiCache Redis
# ============================

module "redis" {
  source = "./modules/redis"

  environment                  = var.environment
  project_name                 = var.project_name
  redis_engine_version         = var.redis_engine_version
  redis_node_type              = var.redis_node_type
  redis_num_cache_nodes        = var.redis_num_cache_nodes
  redis_automatic_failover     = var.redis_automatic_failover
  redis_multi_az               = var.redis_multi_az
  redis_snapshot_retention     = var.redis_snapshot_retention_limit
  redis_snapshot_window        = var.redis_snapshot_window
  redis_security_group_ids     = [aws_security_group.redis.id]
  redis_subnet_group_name      = aws_elasticache_subnet_group.redis.name
  enable_automatic_backups     = true
  enable_cloudwatch_logs       = true

  depends_on = [
    module.vpc,
    aws_elasticache_subnet_group.redis
  ]
}

# ============================
# ECS Cluster
# ============================

module "ecs" {
  source = "./modules/ecs"

  environment              = var.environment
  project_name             = var.project_name
  ecs_cluster_name         = var.ecs_cluster_name
  app_name                 = var.app_name
  ecs_task_cpu             = var.ecs_task_cpu
  ecs_task_memory          = var.ecs_task_memory
  ecs_desired_count        = var.ecs_desired_count
  ecs_min_capacity         = var.ecs_min_capacity
  ecs_max_capacity         = var.ecs_max_capacity
  ecs_container_port       = var.ecs_container_port
  container_image          = aws_ecr_repository.app.repository_url
  cloudwatch_log_group     = aws_cloudwatch_log_group.ecs.name
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  alb_target_group_arn     = aws_lb_target_group.app.arn
  security_group_ids       = [aws_security_group.ecs_tasks.id]

  depends_on = [
    module.vpc,
    aws_ecr_repository.app,
    aws_cloudwatch_log_group.ecs,
    aws_lb_target_group.app
  ]
}

# ============================
# Application Load Balancer
# ============================

module "alb" {
  source = "./modules/alb"

  environment                          = var.environment
  project_name                         = var.project_name
  alb_name                             = var.alb_name
  vpc_id                               = module.vpc.vpc_id
  public_subnet_ids                    = module.vpc.public_subnet_ids
  security_group_ids                   = [aws_security_group.alb.id]
  enable_deletion_protection           = var.alb_enable_deletion_protection
  enable_http2                         = var.alb_enable_http2
  enable_cross_zone_load_balancing     = var.alb_enable_cross_zone_load_balancing
  health_check_path                    = var.health_check_path
  health_check_interval_seconds        = var.health_check_interval
  health_check_timeout_seconds         = var.health_check_timeout
  health_check_healthy_threshold       = var.health_check_healthy_threshold
  health_check_unhealthy_threshold     = var.health_check_unhealthy_threshold
  container_port                       = var.ecs_container_port
  certificate_arn                      = var.certificate_arn

  depends_on = [
    module.vpc
  ]
}

# ============================
# CloudFront CDN
# ============================

module "cloudfront" {
  source = "./modules/cloudfront"

  count = var.cloudfront_enabled ? 1 : 0

  environment              = var.environment
  project_name             = var.project_name
  alb_domain_name          = aws_lb.main.dns_name
  domain_name              = var.domain_name
  certificate_arn          = var.certificate_arn
  cloudfront_price_class   = var.cloudfront_price_class
  cloudfront_default_ttl   = var.cloudfront_default_ttl
  cloudfront_max_ttl       = var.cloudfront_max_ttl
  enable_compression       = true
  enable_ipv6              = true

  depends_on = [
    aws_lb.main
  ]
}

# ============================
# WAF Configuration
# ============================

module "waf" {
  source = "./modules/waf"

  count = var.waf_enabled ? 1 : 0

  environment       = var.environment
  project_name      = var.project_name
  alb_arn           = aws_lb.main.arn
  rate_limit        = var.waf_rate_limit
  enable_geo_block  = false
  enable_ip_rep     = true

  depends_on = [
    aws_lb.main
  ]
}

# ============================
# S3 Bucket
# ============================

module "s3" {
  source = "./modules/s3"

  environment              = var.environment
  bucket_name              = var.s3_bucket_name
  enable_versioning        = var.s3_enable_versioning
  enable_encryption        = var.s3_enable_encryption
  enable_public_access_block = true
  enable_lifecycle_rules   = true
  cors_allowed_origins     = ["https://${var.domain_name}"]

  depends_on = []
}

# ============================
# Backup Vault
# ============================

module "backup" {
  source = "./modules/backup"

  environment            = var.environment
  backup_vault_name      = var.backup_vault_name
  backup_retention_days  = var.backup_retention_days
  backup_schedule        = var.backup_schedule
  rds_instance_arn       = module.rds.db_instance_arn
  enable_cross_region    = true

  depends_on = [
    module.rds
  ]
}

# ============================
# CloudWatch Monitoring
# ============================

module "monitoring" {
  source = "./modules/monitoring"

  environment                  = var.environment
  project_name                 = var.project_name
  cloudwatch_log_retention_days = var.cloudwatch_log_retention_days
  alert_email                  = var.alert_email
  alarm_cpu_threshold          = var.alarm_cpu_threshold
  alarm_memory_threshold       = var.alarm_memory_threshold
  alarm_db_connections         = var.alarm_database_connections

  # Resource metrics
  ecs_cluster_name             = module.ecs.cluster_name
  ecs_service_name             = module.ecs.service_name
  rds_instance_id              = module.rds.db_instance_id
  redis_cluster_id             = module.redis.cluster_id
  alb_name                     = aws_lb.main.name

  depends_on = [
    module.ecs,
    module.rds,
    module.redis,
    aws_lb.main
  ]
}

# ============================
# Security Groups
# ============================

resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

resource "aws_security_group" "ecs_tasks" {
  name_prefix = "${var.project_name}-ecs-tasks-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = var.ecs_container_port
    to_port         = var.ecs_container_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-tasks-sg"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-redis-sg"
  }
}

# ============================
# Database Subnet Group
# ============================

resource "aws_db_subnet_group" "db" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = module.vpc.database_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# ============================
# ElastiCache Subnet Group
# ============================

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = module.vpc.database_subnet_ids
}

# ============================
# ECR Repository
# ============================

resource "aws_ecr_repository" "app" {
  name                 = "${var.project_name}-${var.app_name}"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
  }

  tags = {
    Name = "${var.project_name}-${var.app_name}-ecr"
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus     = "any"
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# ============================
# CloudWatch Log Group
# ============================

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.app_name}"
  retention_in_days = var.cloudwatch_log_retention_days

  tags = {
    Name = "${var.app_name}-ecs-logs"
  }
}

# ============================
# Load Balancer
# ============================

resource "aws_lb" "main" {
  name               = var.alb_name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnet_ids

  enable_deletion_protection = var.alb_enable_deletion_protection
  enable_http2               = var.alb_enable_http2
  enable_cross_zone_load_balancing = var.alb_enable_cross_zone_load_balancing

  tags = {
    Name = var.alb_name
  }
}

resource "aws_lb_target_group" "app" {
  name        = "${var.project_name}-tg"
  port        = var.ecs_container_port
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip"

  health_check {
    healthy_threshold   = var.health_check_healthy_threshold
    unhealthy_threshold = var.health_check_unhealthy_threshold
    timeout             = var.health_check_timeout
    interval            = var.health_check_interval
    path                = var.health_check_path
    matcher             = "200-299"
  }

  tags = {
    Name = "${var.project_name}-tg"
  }
}

resource "aws_lb_listener" "app" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# Redirect HTTP to HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ============================
# IAM Roles and Policies
# ============================

resource "aws_iam_role" "ecs_task_execution_role" {
  name_prefix = "ecs-task-execution-role-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_task_execution_custom" {
  name_prefix = "ecs-task-execution-custom-"
  role        = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.project_name}/*"
      }
    ]
  })
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Security Group for Database
resource "aws_security_group" "database" {
  name        = "${var.db_identifier}-sg"
  description = "Security group for ${var.db_identifier}"
  vpc_id      = var.vpc_id

  ingress {
    description     = "MongoDB/MySQL from allowed security groups"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  ingress {
    description     = "MySQL from allowed security groups"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.db_identifier}-sg"
    Environment = var.environment
  }
}

# RDS Subnet Group (for MySQL/PostgreSQL)
resource "aws_db_subnet_group" "main" {
  name       = "${var.db_identifier}-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name        = "${var.db_identifier}-subnet-group"
    Environment = var.environment
  }
}

# RDS Instance (MySQL/PostgreSQL)
resource "aws_db_instance" "main" {
  identifier     = var.db_identifier
  engine         = "mysql"
  engine_version = var.db_engine_version
  instance_class = var.db_instance_class

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_allocated_storage * 2
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_master_username
  password = var.db_master_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  skip_final_snapshot       = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.db_identifier}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = ["error", "general", "slowquery"]

  performance_insights_enabled          = var.environment == "prod"
  performance_insights_retention_period = var.environment == "prod" ? 7 : null

  tags = {
    Name        = var.db_identifier
    Environment = var.environment
  }
}

# Note: For MongoDB, consider using DocumentDB or MongoDB Atlas
# This module currently supports RDS (MySQL/PostgreSQL)
# For MongoDB, you would need to use:
# - AWS DocumentDB (MongoDB-compatible)
# - MongoDB Atlas (managed MongoDB service)
# - Self-hosted MongoDB on EC2


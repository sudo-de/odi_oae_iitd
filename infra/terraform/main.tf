terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure for remote state management
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "iitd/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "IITD"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  vpc_name           = "${var.project_name}-vpc"
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = var.environment
  enable_nat_gateway = var.enable_nat_gateway
  enable_vpn_gateway = var.enable_vpn_gateway
  single_nat_gateway = var.single_nat_gateway
}

# EKS Module
module "eks" {
  source = "./modules/eks"

  cluster_name = "${var.project_name}-eks"
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnet_ids
  environment  = var.environment

  node_group_instance_types = var.eks_node_instance_types
  node_group_desired_size   = var.eks_node_desired_size
  node_group_min_size       = var.eks_node_min_size
  node_group_max_size       = var.eks_node_max_size
}

# Database Module
module "database" {
  source = "./modules/database"

  db_name       = var.database_name
  db_identifier = "${var.project_name}-${var.environment}"
  vpc_id        = module.vpc.vpc_id
  subnet_ids    = module.vpc.database_subnet_ids
  environment   = var.environment

  db_instance_class    = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_engine_version    = var.db_engine_version
  db_master_username   = var.db_master_username
  db_master_password   = var.db_master_password

  allowed_security_group_ids = [module.eks.cluster_security_group_id]
}


variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_identifier" {
  description = "Identifier for the database instance"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for database"
  type        = list(string)
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS (GB)"
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "Database engine version"
  type        = string
  default     = "8.0"
}

variable "db_master_username" {
  description = "Master username for database"
  type        = string
  sensitive   = true
}

variable "db_master_password" {
  description = "Master password for database"
  type        = string
  sensitive   = true
}

variable "allowed_security_group_ids" {
  description = "List of security group IDs allowed to access the database"
  type        = list(string)
  default     = []
}


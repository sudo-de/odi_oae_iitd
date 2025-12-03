variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for EKS cluster"
  type        = list(string)
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "node_group_instance_types" {
  description = "Instance types for EKS node groups"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_group_desired_size" {
  description = "Desired number of nodes in EKS cluster"
  type        = number
  default     = 2
}

variable "node_group_min_size" {
  description = "Minimum number of nodes in EKS cluster"
  type        = number
  default     = 1
}

variable "node_group_max_size" {
  description = "Maximum number of nodes in EKS cluster"
  type        = number
  default     = 4
}


# Terraform Variables

variable "kubeconfig_path" {
  description = "Path to kubeconfig file"
  type        = string
  default     = "~/.kube/config"
}

variable "k8s_context" {
  description = "Kubernetes context to use"
  type        = string
  default     = ""
}

variable "namespace" {
  description = "Namespace for IITD application"
  type        = string
  default     = "iitd"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  default     = "staging"
  
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "domain" {
  description = "Domain name for the application"
  type        = string
  default     = "iitd.example.com"
}

variable "mongodb_storage_class" {
  description = "Storage class for MongoDB persistent volume"
  type        = string
  default     = "standard"
}

variable "mongodb_storage_size" {
  description = "Storage size for MongoDB"
  type        = string
  default     = "20Gi"
}

variable "git_repo_url" {
  description = "Git repository URL for ArgoCD"
  type        = string
  default     = "https://github.com/your-username/iitd.git"
}

variable "git_branch" {
  description = "Git branch for ArgoCD to sync"
  type        = string
  default     = "main"
}

variable "image_registry" {
  description = "Container image registry"
  type        = string
  default     = "ghcr.io"
}

variable "image_repository" {
  description = "Container image repository"
  type        = string
  default     = "your-username/iitd"
}

variable "image_tag" {
  description = "Container image tag"
  type        = string
  default     = "latest"
}


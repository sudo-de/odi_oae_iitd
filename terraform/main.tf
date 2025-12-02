# Terraform configuration for IITD Infrastructure
# This is a template that can be adapted for various cloud providers

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    # Kubernetes provider for cluster management
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    
    # Helm provider for ArgoCD installation
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
  
  # Uncomment and configure backend for state management
  # backend "s3" {
  #   bucket = "iitd-terraform-state"
  #   key    = "terraform.tfstate"
  #   region = "us-east-1"
  # }
  
  # Or use local backend for development
  backend "local" {
    path = "terraform.tfstate"
  }
}

# Kubernetes provider configuration
# Configure based on your cluster setup
provider "kubernetes" {
  # Option 1: Use kubeconfig file
  config_path = var.kubeconfig_path
  
  # Option 2: Use in-cluster config (when running inside Kubernetes)
  # config_context = var.k8s_context
  
  # Option 3: Direct connection (for cloud providers)
  # host                   = var.k8s_host
  # cluster_ca_certificate = base64decode(var.k8s_cluster_ca_certificate)
  # token                  = var.k8s_token
}

# Helm provider for ArgoCD
provider "helm" {
  kubernetes {
    config_path = var.kubeconfig_path
  }
}

# Variables
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

# Namespace
resource "kubernetes_namespace" "iitd" {
  metadata {
    name = var.namespace
    labels = {
      app     = "iitd"
      env     = var.environment
      managed = "terraform"
    }
  }
}

# Outputs
output "namespace" {
  value = kubernetes_namespace.iitd.metadata[0].name
}

output "environment" {
  value = var.environment
}


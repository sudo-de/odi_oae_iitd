# Terraform Outputs

output "namespace" {
  description = "Kubernetes namespace name"
  value       = kubernetes_namespace.iitd.metadata[0].name
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "argocd_namespace" {
  description = "ArgoCD namespace"
  value       = kubernetes_namespace.argocd.metadata[0].name
}

output "argocd_server_url" {
  description = "ArgoCD server URL"
  value       = "https://argocd.${var.domain}"
}

output "application_url" {
  description = "Application URL"
  value       = "https://${var.domain}"
}


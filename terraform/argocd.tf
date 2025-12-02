# ArgoCD Installation and Configuration

# ArgoCD Namespace
resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
    labels = {
      app     = "argocd"
      managed = "terraform"
    }
  }
}

# ArgoCD Helm Chart
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "7.2.0"
  namespace  = kubernetes_namespace.argocd.metadata[0].name

  values = [
    file("${path.module}/argocd-values.yaml")
  ]

  depends_on = [kubernetes_namespace.argocd]
}

# ArgoCD Application for IITD
resource "kubernetes_manifest" "argocd_app" {
  manifest = {
    apiVersion = "argoproj.io/v1alpha1"
    kind       = "Application"
    metadata = {
      name      = "iitd-${var.environment}"
      namespace = "argocd"
      labels = {
        app = "iitd"
        env = var.environment
      }
    }
    spec = {
      project = "default"
      source = {
        repoURL        = var.git_repo_url
        targetRevision = var.git_branch
        path           = "k8s/overlays/${var.environment}"
      }
      destination = {
        server    = "https://kubernetes.default.svc"
        namespace = var.namespace
      }
      syncPolicy = {
        automated = {
          prune    = true
          selfHeal = true
        }
        syncOptions = [
          "CreateNamespace=true",
          "PrunePropagationPolicy=foreground",
          "PruneLast=true"
        ]
      }
    }
  }

  depends_on = [helm_release.argocd]
}

# Variables for ArgoCD
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


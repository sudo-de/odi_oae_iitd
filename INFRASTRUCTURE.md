# Infrastructure Overview

This document provides an overview of the complete infrastructure setup for the IITD project, including Docker, Kubernetes, Terraform, and GitOps.

## 🏗️ Architecture Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Layer                        │
│  - Docker Compose (Local Development)                       │
│  - Docker Images (CI/CD)                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
│  - Terraform (Infrastructure as Code)                       │
│  - Kubernetes Cluster                                        │
│  - ArgoCD (GitOps)                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  - Client (React)                                           │
│  - Server (NestJS)                                           │
│  - MongoDB (Database)                                        │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Components

### 1. Docker & Docker Compose

**Purpose**: Local development and containerization

**Files**:
- `docker-compose.yml` - Service orchestration
- `client/Dockerfile` - Client container
- `server/Dockerfile` - Server container

**Usage**:
```bash
docker-compose up -d
```

**Documentation**: [DOCKER.md](./DOCKER.md)

### 2. Kubernetes

**Purpose**: Container orchestration and production deployment

**Structure**:
```
k8s/
├── base/              # Base manifests
│   ├── namespace.yaml
│   ├── mongodb.yaml
│   ├── server.yaml
│   ├── client.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
└── overlays/          # Environment-specific
    ├── staging/
    └── production/
```

**Usage**:
```bash
kubectl apply -k k8s/overlays/staging
```

**Documentation**: [KUBERNETES.md](./KUBERNETES.md)

### 3. Terraform

**Purpose**: Infrastructure as Code (IaC)

**Structure**:
```
terraform/
├── main.tf              # Main configuration
├── variables.tf        # Variables
├── outputs.tf          # Outputs
├── argocd.tf           # ArgoCD resources
└── terraform.tfvars.example
```

**Usage**:
```bash
cd terraform
terraform init
terraform apply
```

**Documentation**: [TERRAFORM.md](./TERRAFORM.md)

### 4. GitOps (ArgoCD)

**Purpose**: Continuous deployment from Git

**Structure**:
```
gitops/
└── argocd/
    └── application.yaml  # ArgoCD applications
```

**Usage**:
```bash
kubectl apply -f gitops/argocd/application.yaml
```

**Documentation**: [GITOPS.md](./GITOPS.md)

### 5. CI/CD (GitHub Actions)

**Purpose**: Automated testing, building, and deployment

**Workflows**:
- `.github/workflows/ci.yml` - Continuous Integration
- `.github/workflows/cd.yml` - Continuous Deployment
- `.github/workflows/k8s-deploy.yml` - Kubernetes Deployment
- `.github/workflows/docker-compose-deploy.yml` - Docker Compose Deployment

**Documentation**: [.github/workflows/README.md](.github/workflows/README.md)

## 🚀 Deployment Paths

### Path 1: Docker Compose (Simple)

**Best for**: Single server, small deployments

```bash
# Build and deploy
docker-compose up -d
```

### Path 2: Kubernetes (Manual)

**Best for**: Production, multiple environments

```bash
# Deploy to Kubernetes
kubectl apply -k k8s/overlays/staging
```

### Path 3: Kubernetes (GitOps)

**Best for**: Production, automated deployments

1. Push changes to Git
2. ArgoCD automatically syncs
3. Application deployed

### Path 4: Terraform + Kubernetes

**Best for**: Complete infrastructure automation

```bash
# Provision infrastructure
cd terraform
terraform apply

# ArgoCD automatically deploys application
```

## 🔄 Workflow Comparison

| Feature | Docker Compose | Kubernetes (Manual) | Kubernetes (GitOps) |
|---------|---------------|---------------------|---------------------|
| **Complexity** | Low | Medium | High |
| **Scalability** | Limited | High | High |
| **Automation** | Manual | Manual | Automated |
| **Multi-Environment** | Separate files | Overlays | Overlays + GitOps |
| **Rollback** | Manual | `kubectl rollout undo` | ArgoCD rollback |
| **Best For** | Development | Small teams | Production |

## 📊 Environment Strategy

### Development
- **Tool**: Docker Compose
- **Location**: Local machine
- **Purpose**: Fast iteration

### Staging
- **Tool**: Kubernetes + ArgoCD
- **Location**: Kubernetes cluster
- **Purpose**: Pre-production testing
- **Sync**: Automated

### Production
- **Tool**: Kubernetes + ArgoCD
- **Location**: Kubernetes cluster
- **Purpose**: Live application
- **Sync**: Manual approval

## 🔧 Configuration Management

### Environment Variables

**Docker Compose**:
```yaml
# docker-compose.yml
environment:
  NODE_ENV: production
```

**Kubernetes**:
```yaml
# k8s/base/configmap.yaml
data:
  NODE_ENV: "production"
```

**Terraform**:
```hcl
# terraform/variables.tf
variable "environment" {
  default = "production"
}
```

### Secrets Management

**Docker Compose**:
- `.env` file (not committed)

**Kubernetes**:
- Kubernetes Secrets
- Sealed Secrets (optional)

**Terraform**:
- Terraform variables
- External secret management (Vault, etc.)

## 🎯 Choosing the Right Path

### Use Docker Compose if:
- ✅ Single server deployment
- ✅ Simple setup needed
- ✅ Development/testing
- ✅ Small team

### Use Kubernetes (Manual) if:
- ✅ Multiple environments
- ✅ Need scaling
- ✅ Production deployment
- ✅ Team familiar with K8s

### Use Kubernetes (GitOps) if:
- ✅ Production at scale
- ✅ Multiple environments
- ✅ Need audit trail
- ✅ Automated deployments
- ✅ Team collaboration

### Use Terraform if:
- ✅ Infrastructure automation
- ✅ Multiple clusters
- ✅ Reproducible infrastructure
- ✅ Infrastructure versioning

## 📚 Quick Reference

### Docker Compose
```bash
docker-compose up -d          # Start
docker-compose down            # Stop
docker-compose logs -f         # Logs
```

### Kubernetes
```bash
kubectl apply -k k8s/overlays/staging    # Deploy
kubectl get pods -n iitd                 # Status
kubectl logs -f deployment/server -n iitd # Logs
```

### Terraform
```bash
terraform init                # Initialize
terraform plan               # Plan
terraform apply               # Apply
terraform destroy             # Destroy
```

### ArgoCD
```bash
argocd app list              # List apps
argocd app sync iitd-staging # Sync
argocd app get iitd-staging  # Status
```

## 🔒 Security Considerations

1. **Secrets**: Never commit secrets to Git
2. **RBAC**: Use proper Kubernetes RBAC
3. **Network Policies**: Restrict pod communication
4. **Image Security**: Scan images for vulnerabilities
5. **TLS**: Always use TLS in production
6. **State Management**: Secure Terraform state backend

## 📖 Documentation Index

- [DOCKER.md](./DOCKER.md) - Docker setup and usage
- [KUBERNETES.md](./KUBERNETES.md) - Kubernetes deployment
- [TERRAFORM.md](./TERRAFORM.md) - Infrastructure as Code
- [GITOPS.md](./GITOPS.md) - GitOps with ArgoCD
- [CI_CD_SETUP.md](./CI_CD_SETUP.md) - CI/CD overview
- [.github/ENVIRONMENTS.md](.github/ENVIRONMENTS.md) - GitHub Environments

## 🎯 Next Steps

1. ✅ Choose deployment path
2. ✅ Set up infrastructure
3. ✅ Configure secrets
4. ✅ Deploy to staging
5. ✅ Test thoroughly
6. ✅ Deploy to production
7. ✅ Set up monitoring

---

**Complete Infrastructure Stack Ready!** 🎉


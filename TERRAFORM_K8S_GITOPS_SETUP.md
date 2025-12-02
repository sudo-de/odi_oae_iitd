# Terraform, Kubernetes & GitOps Setup Summary

Complete setup for Infrastructure as Code, Kubernetes orchestration, and GitOps deployment.

## ✅ What's Been Created

### 1. Terraform Infrastructure (IaC)

**Location**: `terraform/`

**Files**:
- `main.tf` - Main Terraform configuration
- `variables.tf` - Variable definitions
- `outputs.tf` - Output values
- `argocd.tf` - ArgoCD installation and configuration
- `argocd-values.yaml` - ArgoCD Helm chart values
- `terraform.tfvars.example` - Example configuration
- `.gitignore` - Ignore Terraform state files

**Features**:
- ✅ Kubernetes namespace management
- ✅ ArgoCD installation via Helm
- ✅ ArgoCD Application resources
- ✅ Configurable for multiple environments
- ✅ Remote state backend support

### 2. Kubernetes Manifests

**Location**: `k8s/`

**Structure**:
```
k8s/
├── base/                    # Base Kubernetes resources
│   ├── namespace.yaml       # Namespace definition
│   ├── mongodb.yaml         # MongoDB StatefulSet
│   ├── server.yaml           # Server Deployment
│   ├── client.yaml           # Client Deployment
│   ├── configmap.yaml        # Configuration
│   ├── secrets.yaml          # Secrets template
│   ├── ingress.yaml          # Ingress configuration
│   ├── rbac.yaml             # RBAC configuration
│   └── kustomization.yaml    # Kustomize base
└── overlays/                 # Environment overlays
    ├── staging/
    │   ├── kustomization.yaml
    │   ├── configmap-patch.yaml
    │   ├── deployment-patch.yaml
    │   └── ingress-patch.yaml
    └── production/
        ├── kustomization.yaml
        ├── configmap-patch.yaml
        ├── deployment-patch.yaml
        └── ingress-patch.yaml
```

**Features**:
- ✅ Kustomize-based configuration
- ✅ Environment-specific overlays
- ✅ Health checks and probes
- ✅ Resource limits and requests
- ✅ Persistent volumes for MongoDB
- ✅ Ingress configuration
- ✅ RBAC setup

### 3. GitOps with ArgoCD

**Location**: `gitops/argocd/`

**Files**:
- `application.yaml` - ArgoCD Application definitions

**Features**:
- ✅ Staging application (automated sync)
- ✅ Production application (manual sync)
- ✅ Self-healing enabled
- ✅ Pruning enabled
- ✅ Health checks configured

### 4. GitHub Actions Workflow

**Location**: `.github/workflows/k8s-deploy.yml`

**Features**:
- ✅ Builds and pushes Docker images
- ✅ Deploys to Kubernetes (staging/production)
- ✅ Uses Kustomize for manifest management
- ✅ Health checks after deployment
- ✅ Environment-based secrets

### 5. Documentation

**Created**:
- `KUBERNETES.md` - Complete Kubernetes guide
- `TERRAFORM.md` - Terraform infrastructure guide
- `GITOPS.md` - GitOps with ArgoCD guide
- `INFRASTRUCTURE.md` - Infrastructure overview
- Updated `README.md` with new sections

## 🚀 Quick Start

### Option 1: Terraform + ArgoCD (Recommended)

```bash
# 1. Configure Terraform
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 2. Initialize and apply
terraform init
terraform plan
terraform apply

# 3. ArgoCD will automatically deploy the application
```

### Option 2: Kubernetes Manual Deployment

```bash
# 1. Create secrets
kubectl create namespace iitd
kubectl create secret generic server-secrets \
  --from-literal=JWT_SECRET='your-secret' \
  --from-literal=SMTP_USER='email@gmail.com' \
  --from-literal=SMTP_PASS='password' \
  -n iitd

# 2. Deploy
kubectl apply -k k8s/overlays/staging
```

### Option 3: ArgoCD Manual Setup

```bash
# 1. Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 2. Create applications
kubectl apply -f gitops/argocd/application.yaml
```

## 📋 Prerequisites

### For Terraform
- Terraform >= 1.0
- Kubernetes cluster access
- `kubectl` configured
- Helm 3.x (for ArgoCD)

### For Kubernetes
- Kubernetes cluster (v1.24+)
- `kubectl` configured
- `kustomize` (v5.0+)
- Ingress controller (NGINX)
- Storage class

### For GitOps
- ArgoCD installed
- Git repository access
- Kubernetes cluster

## 🔧 Configuration

### Update Image References

Edit these files to use your container registry:

1. **Kubernetes Manifests**:
   - `k8s/base/server.yaml`
   - `k8s/base/client.yaml`

2. **Terraform Variables**:
   - `terraform/terraform.tfvars`

3. **ArgoCD Applications**:
   - `gitops/argocd/application.yaml`

### Configure Secrets

**Kubernetes**:
```bash
kubectl create secret generic server-secrets \
  --from-literal=JWT_SECRET='secret' \
  --from-literal=SMTP_USER='user' \
  --from-literal=SMTP_PASS='pass' \
  -n iitd
```

**Terraform**:
Use environment variables or secret management:
```bash
export TF_VAR_jwt_secret="your-secret"
```

### Update Domain

Edit ingress configurations:
- `k8s/base/ingress.yaml`
- `k8s/overlays/staging/ingress-patch.yaml`
- `k8s/overlays/production/ingress-patch.yaml`

## 🔄 Workflow

### Development → Production

1. **Develop**: Make code changes
2. **CI**: GitHub Actions builds and tests
3. **Build**: Docker images pushed to registry
4. **Update**: Update image tags in Kubernetes manifests
5. **Commit**: Push to Git repository
6. **GitOps**: ArgoCD syncs and deploys
7. **Verify**: Health checks confirm deployment

### Manual Deployment

```bash
# Update image tags
cd k8s/overlays/staging
kustomize edit set image ghcr.io/your-username/iitd-server:v1.2.3

# Apply
kubectl apply -k k8s/overlays/staging
```

## 📊 Environment Differences

| Feature | Staging | Production |
|---------|---------|------------|
| **Replicas** | 1 | 3 |
| **Sync Policy** | Automated | Manual |
| **Domain** | staging.iitd.example.com | iitd.example.com |
| **TLS** | Optional | Required |
| **Database** | iitd-db-staging | iitd-db |

## 🔒 Security

1. **Secrets**: Never commit to Git
2. **RBAC**: Proper Kubernetes permissions
3. **Network Policies**: Restrict pod communication
4. **TLS**: Always use in production
5. **State**: Secure Terraform state backend

## 🛠️ Troubleshooting

### Terraform Issues

```bash
# Reinitialize
terraform init -upgrade

# Validate
terraform validate

# Check state
terraform state list
```

### Kubernetes Issues

```bash
# Check pods
kubectl get pods -n iitd

# Describe pod
kubectl describe pod <pod-name> -n iitd

# View logs
kubectl logs -f deployment/server -n iitd
```

### ArgoCD Issues

```bash
# Check sync status
argocd app get iitd-staging

# Force sync
argocd app sync iitd-staging --force

# View logs
argocd app logs iitd-staging
```

## 📚 Documentation

- [KUBERNETES.md](./KUBERNETES.md) - Kubernetes deployment
- [TERRAFORM.md](./TERRAFORM.md) - Terraform infrastructure
- [GITOPS.md](./GITOPS.md) - GitOps with ArgoCD
- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) - Infrastructure overview

## 🎯 Next Steps

1. ✅ Configure Terraform variables
2. ✅ Set up Kubernetes cluster
3. ✅ Create secrets
4. ✅ Deploy to staging
5. ✅ Install ArgoCD
6. ✅ Configure GitOps
7. ✅ Test automated deployment
8. ✅ Set up production

## ✨ Features

- ✅ **Infrastructure as Code** - Terraform for reproducible infrastructure
- ✅ **Container Orchestration** - Kubernetes for scalable deployments
- ✅ **GitOps** - ArgoCD for automated deployments
- ✅ **Multi-Environment** - Staging and production overlays
- ✅ **Health Checks** - Automatic health monitoring
- ✅ **Rolling Updates** - Zero-downtime deployments
- ✅ **Rollback Support** - Easy rollback capabilities
- ✅ **CI/CD Integration** - GitHub Actions workflows
- ✅ **Documentation** - Comprehensive guides

---

**Complete Infrastructure Stack Ready!** 🎉

Your project now has:
- ✅ Docker containerization
- ✅ Kubernetes orchestration
- ✅ Terraform infrastructure
- ✅ GitOps automation
- ✅ CI/CD pipelines

All configured and ready to deploy!


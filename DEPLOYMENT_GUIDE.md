# Deployment Guide - Which Method to Use?

This guide helps you choose the right deployment method for your needs.****

## 🎯 Quick Decision Tree

```
Do you have a Kubernetes cluster?
│
├─ NO → Use Docker Compose (deploy.sh or docker-compose.yml)
│
└─ YES → Do you want automated GitOps?
         │
         ├─ YES → Use ArgoCD (GitOps)
         │
         └─ NO → Use Kubernetes Manual (kubectl)
```

## 📋 Deployment Methods Comparison

| Method | File/Command | Best For | Complexity | Automation |
|--------|-------------|----------|------------|------------|
| **Docker Compose** | `./deploy.sh` or `docker-compose up` | Local dev, single server | ⭐ Low | Manual |
| **Kubernetes Manual** | `kubectl apply -k k8s/overlays/staging` | Production, scaling | ⭐⭐ Medium | Manual |
| **Kubernetes CI/CD** | `.github/workflows/k8s-deploy.yml` | Automated K8s deployment | ⭐⭐⭐ High | Automated |
| **GitOps (ArgoCD)** | `gitops/argocd/application.yaml` | Production, Git-based | ⭐⭐⭐ High | Automated |
| **Terraform** | `terraform apply` | Infrastructure setup | ⭐⭐⭐ High | Manual/CI |

## 🚀 Deployment Options Explained

### 1. Docker Compose Deployment ⭐ (Simplest)

**Files**:
- `deploy.sh` - Deployment script
- `docker-compose.yml` - Service configuration

**When to use**:
- ✅ Local development
- ✅ Single server deployment
- ✅ Quick testing
- ✅ No Kubernetes cluster

**How to deploy**:
```bash
# Option 1: Use deployment script
./deploy.sh staging

# Option 2: Direct docker-compose
docker-compose up -d
```

**Pros**:
- Simple and fast
- No cluster needed
- Good for development

**Cons**:
- Limited scalability
- Single server only
- Manual updates

---

### 2. Kubernetes Manual Deployment ⭐⭐

**Files**:
- `k8s/base/` - Base Kubernetes manifests
- `k8s/overlays/staging/` - Staging configuration
- `k8s/overlays/production/` - Production configuration

**When to use**:
- ✅ Production deployment
- ✅ Need scaling
- ✅ Multiple environments
- ✅ Have Kubernetes cluster

**How to deploy**:
```bash
# Staging
kubectl apply -k k8s/overlays/staging

# Production
kubectl apply -k k8s/overlays/production
```

**Pros**:
- Production-ready
- Scalable
- Multi-environment
- Health checks

**Cons**:
- Requires Kubernetes knowledge
- Manual deployment
- Need to manage secrets

---

### 3. Kubernetes CI/CD (GitHub Actions) ⭐⭐⭐

**Files**:
- `.github/workflows/k8s-deploy.yml` - Automated workflow

**When to use**:
- ✅ Automated deployments
- ✅ CI/CD pipeline
- ✅ Team collaboration
- ✅ Have Kubernetes cluster

**How to deploy**:
```bash
# Push to main branch (auto-deploys staging)
git push origin main

# Or trigger manually in GitHub Actions
```

**Setup required**:
1. Configure GitHub secrets:
   - `KUBE_CONFIG_STAGING` (base64 encoded kubeconfig)
   - `KUBE_CONFIG_PRODUCTION` (base64 encoded kubeconfig)

**Pros**:
- Fully automated
- Integrated with CI/CD
- Version controlled
- Team-friendly

**Cons**:
- Requires GitHub Actions setup
- Need to configure secrets
- More complex

---

### 4. GitOps with ArgoCD ⭐⭐⭐ (Recommended for Production)

**Files**:
- `gitops/argocd/application.yaml` - ArgoCD applications
- `k8s/overlays/` - Kubernetes manifests

**When to use**:
- ✅ Production at scale
- ✅ Git-based deployments
- ✅ Audit trail needed
- ✅ Multiple environments
- ✅ Team collaboration

**How to deploy**:
```bash
# 1. Install ArgoCD (one-time)
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# 2. Create ArgoCD applications
kubectl apply -f gitops/argocd/application.yaml

# 3. Push changes to Git (auto-deploys)
git push origin main
```

**Pros**:
- Git as source of truth
- Automatic sync
- Self-healing
- Audit trail
- Rollback support

**Cons**:
- Requires ArgoCD setup
- More complex
- Learning curve

---

### 5. Terraform Infrastructure ⭐⭐⭐

**Files**:
- `terraform/` - All Terraform files

**When to use**:
- ✅ Infrastructure provisioning
- ✅ ArgoCD installation
- ✅ Reproducible infrastructure
- ✅ Multiple clusters

**How to deploy**:
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

**Pros**:
- Infrastructure as Code
- Reproducible
- Version controlled
- Can manage ArgoCD

**Cons**:
- Infrastructure only (not app deployment)
- Requires Terraform knowledge

---

## 🎯 Recommended Paths

### For Development
```bash
# Use Docker Compose
./deploy.sh staging
# or
docker-compose up -d
```

### For Staging
```bash
# Option 1: Manual Kubernetes
kubectl apply -k k8s/overlays/staging

# Option 2: GitHub Actions (automated)
git push origin main  # Auto-deploys via CI/CD

# Option 3: GitOps (automated)
# Set up ArgoCD once, then just push to Git
```

### For Production
```bash
# Recommended: GitOps with ArgoCD
# 1. Set up ArgoCD (one-time)
# 2. Configure applications
# 3. Push to Git → Auto-deploys

# Alternative: Kubernetes CI/CD
# Push to main → GitHub Actions deploys
```

## 📝 Step-by-Step Recommendations

### Scenario 1: Just Getting Started
1. Use **Docker Compose**: `./deploy.sh staging`
2. Test locally
3. Move to Kubernetes when ready

### Scenario 2: Production Deployment
1. Set up Kubernetes cluster
2. Install ArgoCD: `terraform apply` or manual
3. Create ArgoCD applications: `kubectl apply -f gitops/argocd/application.yaml`
4. Push to Git → Auto-deploys

### Scenario 3: Team with CI/CD
1. Set up GitHub Actions secrets
2. Use `.github/workflows/k8s-deploy.yml`
3. Push to main → Auto-deploys

### Scenario 4: Infrastructure Automation
1. Use Terraform: `terraform apply`
2. Terraform installs ArgoCD
3. ArgoCD deploys application
4. Fully automated

## 🔧 Setup Requirements

### Docker Compose
- ✅ Docker installed
- ✅ docker-compose installed
- ✅ No additional setup

### Kubernetes Manual
- ✅ Kubernetes cluster
- ✅ kubectl configured
- ✅ kustomize installed
- ✅ Secrets created

### Kubernetes CI/CD
- ✅ Kubernetes cluster
- ✅ GitHub repository
- ✅ GitHub secrets configured
- ✅ kubeconfig in secrets

### GitOps (ArgoCD)
- ✅ Kubernetes cluster
- ✅ ArgoCD installed
- ✅ Git repository access
- ✅ ArgoCD applications created

### Terraform
- ✅ Terraform installed
- ✅ Kubernetes cluster access
- ✅ Helm installed (for ArgoCD)

## 🚦 Quick Start Commands

### Docker Compose (Easiest)
```bash
./deploy.sh staging
```

### Kubernetes Manual
```bash
kubectl apply -k k8s/overlays/staging
```

### Kubernetes CI/CD
```bash
# Just push to Git
git push origin main
```

### GitOps (ArgoCD)
```bash
# One-time setup
kubectl apply -f gitops/argocd/application.yaml

# Then just push to Git
git push origin main
```

## ❓ Which Should I Use?

**Choose Docker Compose if**:
- You're developing locally
- You don't have Kubernetes
- You want the simplest setup

**Choose Kubernetes Manual if**:
- You have a Kubernetes cluster
- You want production features
- You prefer manual control

**Choose Kubernetes CI/CD if**:
- You want automated deployments
- You use GitHub Actions
- You want CI/CD integration

**Choose GitOps (ArgoCD) if**:
- You want Git-based deployments
- You need audit trails
- You want self-healing
- Production at scale

**Choose Terraform if**:
- You need infrastructure automation
- You want to install ArgoCD
- You manage multiple clusters

## 📚 Documentation

- [DOCKER.md](./DOCKER.md) - Docker Compose details
- [KUBERNETES.md](./KUBERNETES.md) - Kubernetes deployment
- [GITOPS.md](./GITOPS.md) - ArgoCD GitOps
- [TERRAFORM.md](./TERRAFORM.md) - Infrastructure setup
- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) - Complete overview

---

**TL;DR**: Start with `./deploy.sh` for development, use Kubernetes + ArgoCD for production! 🚀


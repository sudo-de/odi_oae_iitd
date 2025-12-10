# GitOps Configuration Repository

This repository contains all GitOps configurations for deploying the IITD Transport System to Kubernetes.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Repository                            │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Application     │         │  GitOps Config   │          │
│  │  Source Code     │         │  (This Repo)     │          │
│  └────────┬─────────┘         └────────┬────────┘          │
│           │                              │                   │
│           │ Push                         │ Push              │
│           ▼                              ▼                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         GitHub Actions CI/CD Pipeline                │   │
│  │  • Build Docker Image                                │   │
│  │  • Push to Container Registry                        │   │
│  │  • Run Tests                                         │   │
│  └────────────────────┬──────────────────────────────────┘   │
│                       │                                       │
│                       ▼                                       │
│            ┌──────────────────┐                               │
│            │ Container        │                               │
│            │ Registry         │                               │
│            │ (GHCR/DockerHub) │                               │
│            └────────┬─────────┘                               │
│                     │                                         │
│                     │ Image Tag Update                        │
│                     ▼                                         │
│            ┌──────────────────┐                               │
│            │  GitOps Config   │                               │
│            │  Repository      │                               │
│            │  (Kustomize)     │                               │
│            └────────┬─────────┘                               │
│                     │                                         │
│                     │ Sync                                     │
│                     ▼                                         │
│            ┌──────────────────┐                               │
│            │    ArgoCD        │                               │
│            │  (GitOps Engine) │                               │
│            └────────┬─────────┘                               │
│                     │                                         │
│                     │ Apply                                    │
│                     ▼                                         │
│            ┌──────────────────┐                               │
│            │   Kubernetes     │                               │
│            │     Cluster      │                               │
│            └──────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Repository Structure

```
infra/
├── k8s/                          # Kubernetes manifests
│   ├── base/                     # Base configuration
│   │   ├── deployment.yaml      # Deployment manifest
│   │   ├── service.yaml         # Service manifest
│   │   ├── pvc.yaml              # PersistentVolumeClaim manifests
│   │   └── kustomization.yaml   # Kustomize base config
│   └── overlays/                 # Environment-specific overlays
│       ├── staging/
│       │   ├── kustomization.yaml
│       │   └── deployment-patch.yaml
│       └── production/
│           ├── kustomization.yaml
│           └── deployment-patch.yaml
├── argocd/                       # ArgoCD Application manifests
│   └── applications/
│       ├── staging-app.yaml
│       └── production-app.yaml
├── secrets/                      # Secret management docs
│   └── README.md
├── README.md                     # Main documentation
├── SETUP.md                      # Setup guide
└── GITOPS.md                     # This file
```

## 🔄 GitOps Workflow

### 1. Developer Workflow

```bash
# 1. Make code changes
git checkout -b feature/new-feature
# ... make changes ...

# 2. Commit and push
git commit -m "Add new feature"
git push origin feature/new-feature

# 3. Create Pull Request
# GitHub Actions runs CI/CD pipeline
# - Linting
# - Testing
# - Building Docker image
# - Security scanning

# 4. Merge to develop (staging) or main (production)
# ArgoCD automatically syncs and deploys
```

### 2. Deployment Flow

1. **Code Push** → GitHub Actions triggers
2. **CI Pipeline** → Builds and tests code
3. **Docker Build** → Creates container image
4. **Image Push** → Pushes to registry (GHCR/Docker Hub)
5. **GitOps Sync** → ArgoCD detects changes
6. **Kubernetes Update** → Rolling update deployment

### 3. Environment Promotion

```
Feature Branch → Develop (Staging) → Main (Production)
     ↓                ↓                    ↓
   CI/CD           Deploy              Deploy
   Tests           Staging             Production
```

## 🔐 Secret Management

Secrets are managed through **GitHub Environment Secrets**:

### Required Secrets

| Secret Name | Description | Required |
|------------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `JWT_SECRET` | JWT signing secret | ✅ Yes |
| `SMTP_USER` | SMTP username | ❌ Optional |
| `SMTP_PASS` | SMTP password | ❌ Optional |
| `KUBECONFIG` | Kubernetes config (base64) | ✅ Yes (for kubectl) |
| `ARGOCD_SERVER` | ArgoCD server URL | ❌ Optional |
| `ARGOCD_USERNAME` | ArgoCD username | ❌ Optional |
| `ARGOCD_PASSWORD` | ArgoCD password | ❌ Optional |

### Setting Up Secrets

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Create environments: `staging` and `production`
3. Add secrets to each environment
4. Secrets are automatically synced to Kubernetes during deployment

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster access
- kubectl configured
- GitHub repository with secrets configured

### Deploy to Staging

```bash
# Using kubectl
kubectl apply -k infra/k8s/overlays/staging

# Using ArgoCD
kubectl apply -f infra/argocd/applications/staging-app.yaml
```

### Deploy to Production

```bash
# Using kubectl
kubectl apply -k infra/k8s/overlays/production

# Using ArgoCD
kubectl apply -f infra/argocd/applications/production-app.yaml
```

## 📊 Monitoring

### Check Deployment Status

```bash
# Pods
kubectl get pods -n iitd-production

# Services
kubectl get svc -n iitd-production

# Deployments
kubectl get deployments -n iitd-production

# ArgoCD Applications
argocd app list
argocd app get iitd-server-production
```

### View Logs

```bash
# Application logs
kubectl logs -f deployment/prod-iitd-server -n iitd-production

# All pods in namespace
kubectl logs -f -l app=iitd-server -n iitd-production
```

## 🔧 Customization

### Update Image Tag

Edit `infra/k8s/overlays/{environment}/kustomization.yaml`:

```yaml
images:
  - name: ghcr.io/your-org/iitd/server
    newTag: v1.2.3  # Update this
```

### Scale Replicas

Edit `infra/k8s/overlays/{environment}/kustomization.yaml`:

```yaml
replicas:
  - name: iitd-server
    count: 5  # Update this
```

### Resource Limits

Edit `infra/k8s/overlays/{environment}/deployment-patch.yaml`:

```yaml
spec:
  template:
    spec:
      containers:
      - name: server
        resources:
          requests:
            memory: "1Gi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
```

## 🛠️ Troubleshooting

### Common Issues

1. **Pods not starting**
   - Check secrets: `kubectl get secrets -n iitd-production`
   - Check logs: `kubectl logs -f deployment/prod-iitd-server -n iitd-production`

2. **Image pull errors**
   - Verify image exists: `docker pull ghcr.io/your-org/iitd/server:main`
   - Check image pull secrets

3. **ArgoCD sync issues**
   - Check app status: `argocd app get iitd-server-production`
   - Force sync: `argocd app sync iitd-server-production --force`

4. **MongoDB connection errors**
   - Verify `MONGODB_URI` secret is correct
   - Check network policies and firewall rules

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Principles](https://www.gitops.tech/)

## 🤝 Contributing

When making changes to GitOps configurations:

1. Test changes in staging first
2. Update documentation if needed
3. Create a pull request with clear description
4. Get approval before merging to production

## 📝 Notes

- **Never commit secrets** to Git
- **Always use Kustomize** for environment-specific configs
- **Test in staging** before deploying to production
- **Monitor deployments** after changes
- **Keep manifests versioned** in Git


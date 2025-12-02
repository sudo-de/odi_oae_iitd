# GitOps with ArgoCD Guide

This guide explains how to use GitOps methodology with ArgoCD for continuous deployment of the IITD application.

## 🎯 What is GitOps?

GitOps is a methodology where Git is the single source of truth for declarative infrastructure and applications. ArgoCD continuously monitors your Git repository and automatically syncs the Kubernetes cluster to match the desired state.

## 📋 Prerequisites

- Kubernetes cluster
- ArgoCD installed
- Git repository with Kubernetes manifests
- `kubectl` configured
- `argocd` CLI (optional)

## 🏗️ GitOps Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Git Repository                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  k8s/overlays/staging/                           │   │
│  │  k8s/overlays/production/                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                    │
                    │ (monitors)
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    ArgoCD                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Application: iitd-staging                       │   │
│  │  Application: iitd-production                    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                    │
                    │ (applies)
                    ▼
┌─────────────────────────────────────────────────────────┐
│              Kubernetes Cluster                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Namespace: iitd                                 │   │
│  │  - Deployments                                   │   │
│  │  - Services                                      │   │
│  │  - ConfigMaps                                    │   │
│  │  - Secrets                                       │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Setup

### 1. Install ArgoCD

#### Using Terraform

```bash
cd terraform
terraform apply -target=helm_release.argocd
```

#### Using Helm

```bash
kubectl create namespace argocd
helm repo add argo https://argoproj.github.io/argo-helm
helm install argocd argo/argo-cd -n argocd
```

#### Using kubectl

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 2. Access ArgoCD

#### Port Forward

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Access: https://localhost:8080

#### Get Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Default username: `admin`

### 3. Install ArgoCD CLI (Optional)

```bash
# macOS
brew install argocd

# Linux
curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x /usr/local/bin/argocd
```

### 4. Login to ArgoCD

```bash
argocd login localhost:8080
```

## 📝 Create ArgoCD Applications

### Method 1: Using kubectl

Apply the application manifest:

```bash
kubectl apply -f gitops/argocd/application.yaml
```

### Method 2: Using ArgoCD CLI

#### Staging Application

```bash
argocd app create iitd-staging \
  --repo https://github.com/your-username/iitd.git \
  --path k8s/overlays/staging \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace iitd \
  --sync-policy automated \
  --self-heal \
  --auto-prune
```

#### Production Application

```bash
argocd app create iitd-production \
  --repo https://github.com/your-username/iitd.git \
  --path k8s/overlays/production \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace iitd \
  --sync-policy automated \
  --self-heal
```

### Method 3: Using ArgoCD UI

1. Go to ArgoCD UI
2. Click "New App"
3. Fill in application details:
   - **Application Name**: `iitd-staging`
   - **Project Name**: `default`
   - **Repository URL**: `https://github.com/your-username/iitd.git`
   - **Revision**: `main`
   - **Path**: `k8s/overlays/staging`
   - **Cluster URL**: `https://kubernetes.default.svc`
   - **Namespace**: `iitd`
4. Enable "AUTO-SYNC" for staging
5. Click "Create"

## 🔄 Sync Policies

### Automated Sync (Staging)

```yaml
syncPolicy:
  automated:
    prune: true      # Delete resources removed from Git
    selfHeal: true   # Automatically sync when cluster drifts
    allowEmpty: false
```

### Manual Sync (Production)

```yaml
syncPolicy:
  automated:
    prune: false
    selfHeal: true
```

Production requires manual approval for safety.

## 🔍 Monitoring Applications

### View Applications

```bash
# List applications
argocd app list

# Get application details
argocd app get iitd-staging

# View application tree
argocd app tree iitd-staging
```

### Check Sync Status

```bash
# Check sync status
argocd app get iitd-staging

# View sync history
argocd app history iitd-staging
```

### View Logs

```bash
# Application logs
argocd app logs iitd-staging

# Follow logs
argocd app logs iitd-staging --follow
```

## 🔄 Manual Operations

### Sync Application

```bash
# Sync application
argocd app sync iitd-staging

# Sync with specific revision
argocd app sync iitd-staging --revision main

# Sync with prune (delete removed resources)
argocd app sync iitd-staging --prune
```

### Rollback

```bash
# View history
argocd app history iitd-staging

# Rollback to previous version
argocd app rollback iitd-staging <revision>
```

### Delete Application

```bash
# Delete application (keeps resources)
argocd app delete iitd-staging

# Delete application and resources
argocd app delete iitd-staging --cascade
```

## 🎯 Workflow

### Typical GitOps Workflow

1. **Develop**: Make changes to code
2. **Build**: CI builds and pushes Docker images
3. **Update Manifests**: Update image tags in Kubernetes manifests
4. **Commit**: Push changes to Git repository
5. **ArgoCD Syncs**: ArgoCD detects changes and syncs cluster
6. **Deploy**: Application is deployed automatically

### Example Workflow

```bash
# 1. Build and push new image
docker build -t ghcr.io/your-username/iitd-server:v1.2.3 ./server
docker push ghcr.io/your-username/iitd-server:v1.2.3

# 2. Update kustomization
cd k8s/overlays/staging
kustomize edit set image ghcr.io/your-username/iitd-server:v1.2.3

# 3. Commit and push
git add k8s/overlays/staging/kustomization.yaml
git commit -m "Update server image to v1.2.3"
git push origin main

# 4. ArgoCD automatically syncs (if automated)
# Or manually sync:
argocd app sync iitd-staging
```

## 🔒 Security

### RBAC Configuration

Configure ArgoCD RBAC in `argocd-rbac-cm` ConfigMap:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.csv: |
    p, role:admin, applications, *, */*, allow
    p, role:developer, applications, get, */*, allow
    p, role:developer, applications, sync, staging/*, allow
```

### Repository Access

For private repositories, configure credentials:

```bash
argocd repo add https://github.com/your-username/iitd.git \
  --username <username> \
  --password <token>
```

Or use SSH:

```bash
argocd repo add git@github.com:your-username/iitd.git \
  --ssh-private-key-path ~/.ssh/id_rsa
```

## 🛠️ Troubleshooting

### Application Out of Sync

```bash
# Check diff
argocd app diff iitd-staging

# Force sync
argocd app sync iitd-staging --force
```

### Sync Failures

```bash
# View application events
argocd app get iitd-staging --show-operation

# Check application logs
argocd app logs iitd-staging
```

### Repository Access Issues

```bash
# Test repository connection
argocd repo get https://github.com/your-username/iitd.git

# Refresh repository
argocd repo refresh https://github.com/your-username/iitd.git
```

## 📊 Best Practices

1. **Separate Environments**: Use different overlays for staging/production
2. **Automated Staging**: Enable auto-sync for staging
3. **Manual Production**: Require approval for production
4. **Self-Healing**: Enable self-heal to maintain desired state
5. **Pruning**: Enable prune to remove deleted resources
6. **Health Checks**: Configure health checks in applications
7. **Notifications**: Set up notifications for sync events

## 📚 Additional Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Principles](https://www.gitops.tech/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)

## 🎯 Next Steps

1. ✅ Install ArgoCD
2. ✅ Create applications
3. ✅ Configure sync policies
4. ✅ Set up repository access
5. ✅ Test automated sync
6. ✅ Configure notifications
7. ✅ Set up monitoring


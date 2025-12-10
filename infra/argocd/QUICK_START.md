# ArgoCD Quick Start Guide

Quick reference for getting ArgoCD up and running with the IITD Transport System.

## 🚀 Quick Installation

```bash
# Run the installation script
./infra/argocd/install.sh

# Or install manually
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## 📝 Initial Setup

### 1. Get Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
```

### 2. Access ArgoCD UI

```bash
# Port forward (in a separate terminal)
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access at: https://localhost:8080
# Username: admin
# Password: <from step 1>
```

### 3. Update Repository URL

Before applying applications, update the repository URL:

```bash
# Edit the application files
# Change: repoURL: https://github.com/your-org/iitd.git
# To: repoURL: https://github.com/YOUR_USERNAME/iitd.git

# Or use sed
sed -i '' 's|your-org|YOUR_USERNAME|g' infra/argocd/applications/*.yaml
```

### 4. Register Git Repository

```bash
# Install ArgoCD CLI (if not already installed)
# macOS: brew install argocd
# Linux: See ARGOCD_SETUP.md

# Login to ArgoCD
argocd login localhost:8080 --insecure

# Add repository (for public repo)
argocd repo add https://github.com/YOUR_USERNAME/iitd.git

# For private repo, use credentials:
argocd repo add https://github.com/YOUR_USERNAME/iitd.git \
  --username YOUR_USERNAME \
  --password YOUR_GITHUB_TOKEN
```

### 5. Apply Applications

```bash
# Apply staging application
kubectl apply -f infra/argocd/applications/staging-app.yaml

# Apply production application
kubectl apply -f infra/argocd/applications/production-app.yaml

# Verify
kubectl get applications -n argocd
argocd app list
```

## ✅ Verify Everything Works

```bash
# Check application status
argocd app get iitd-server-staging
argocd app get iitd-server-production

# Watch sync status
argocd app get iitd-server-staging --watch
```

## 🔧 Common Commands

```bash
# List applications
argocd app list

# Sync application
argocd app sync iitd-server-staging

# Get application details
argocd app get iitd-server-staging

# View application logs
argocd app logs iitd-server-staging --tail=100

# Refresh application (re-read from Git)
argocd app get iitd-server-staging --refresh
```

## 🐛 Troubleshooting

### Application Not Syncing

```bash
# Check sync status
argocd app get iitd-server-staging

# Manually trigger sync
argocd app sync iitd-server-staging

# Check for errors
kubectl describe application iitd-server-staging -n argocd
```

### Repository Connection Issues

```bash
# Test repository connection
argocd repo get https://github.com/YOUR_USERNAME/iitd.git

# Re-add if needed
argocd repo remove https://github.com/YOUR_USERNAME/iitd.git
argocd repo add https://github.com/YOUR_USERNAME/iitd.git --username USERNAME --password TOKEN
```

### View Logs

```bash
# ArgoCD controller logs
kubectl logs -f deployment/argocd-application-controller -n argocd

# Application resource logs
argocd app logs iitd-server-staging --tail=100
```

## 📚 More Information

- Full setup guide: `infra/ARGOCD_SETUP.md`
- GitOps overview: `infra/GITOPS.md`
- General setup: `infra/SETUP.md`


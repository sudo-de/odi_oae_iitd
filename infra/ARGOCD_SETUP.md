# ArgoCD Setup and Configuration Guide

Complete guide for setting up and using ArgoCD for GitOps deployment of the IITD Transport System.

## Table of Contents

1. [What is ArgoCD?](#what-is-argocd)
2. [Installation](#installation)
3. [Initial Setup](#initial-setup)
4. [Configuring Applications](#configuring-applications)
5. [Using ArgoCD](#using-argocd)
6. [Troubleshooting](#troubleshooting)

## What is ArgoCD?

ArgoCD is a declarative, GitOps continuous delivery tool for Kubernetes. It:

- **Monitors Git repositories** for changes to Kubernetes manifests
- **Automatically syncs** changes to your cluster
- **Provides a web UI** for visualizing applications and their status
- **Supports multiple sources**: Git, Helm, Kustomize, etc.
- **Enables self-healing**: Automatically corrects manual changes

## Installation

### Option 1: Standard Installation (Recommended)

```bash
# Create ArgoCD namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for all pods to be ready
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
kubectl wait --for=condition=available --timeout=300s deployment/argocd-repo-server -n argocd
kubectl wait --for=condition=available --timeout=300s deployment/argocd-applicationset-controller -n argocd
```

### Option 2: Using ArgoCD CLI (Local Development)

```bash
# macOS
brew install argocd

# Linux
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64

# Verify installation
argocd version --client
```

### Option 3: Helm Installation

```bash
# Add ArgoCD Helm repository
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

# Install ArgoCD
helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --set server.service.type=LoadBalancer
```

## Initial Setup

### 1. Get Admin Password

```bash
# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo

# Or using ArgoCD CLI
argocd admin initial-password -n argocd
```

**Default username:** `admin`

### 2. Access ArgoCD UI

#### Option A: Port Forwarding (Local Access)

```bash
# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access at: https://localhost:8080
# Username: admin
# Password: <from step 1>
```

**Note:** Accept the self-signed certificate warning in your browser.

#### Option B: LoadBalancer/Ingress (Production)

```bash
# Change service type to LoadBalancer
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'

# Get external IP
kubectl get svc argocd-server -n argocd

# Access at: https://<EXTERNAL-IP>
```

#### Option C: Ingress (Recommended for Production)

Create an ingress resource:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: argocd-server-ingress
  namespace: argocd
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-passthrough: "true"
spec:
  rules:
  - host: argocd.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: argocd-server
            port:
              number: 443
  tls:
  - hosts:
    - argocd.yourdomain.com
    secretName: argocd-secret
```

### 3. Login via CLI

```bash
# Set server address (replace with your ArgoCD server URL)
argocd login localhost:8080 --insecure

# Or if using LoadBalancer
argocd login <EXTERNAL-IP> --insecure

# Change admin password (recommended)
argocd account update-password
```

## Configuring Applications

### 1. Update Repository URL

Before applying ArgoCD applications, update the repository URL in the application manifests:

```bash
# Edit staging application
# Change: repoURL: https://github.com/your-org/iitd.git
# To: repoURL: https://github.com/YOUR_USERNAME/iitd.git

# Edit production application similarly
```

### 2. Register Git Repository in ArgoCD

ArgoCD needs access to your Git repository. You can configure this via UI or CLI:

#### Via CLI:

```bash
# For public repository (no credentials needed)
argocd repo add https://github.com/YOUR_USERNAME/iitd.git

# For private repository (using HTTPS with username/password)
argocd repo add https://github.com/YOUR_USERNAME/iitd.git \
  --username YOUR_USERNAME \
  --password YOUR_PERSONAL_ACCESS_TOKEN

# For private repository (using SSH)
argocd repo add git@github.com:YOUR_USERNAME/iitd.git \
  --ssh-private-key-path ~/.ssh/id_rsa
```

#### Via UI:

1. Go to **Settings** → **Repositories**
2. Click **Connect Repo**
3. Choose connection method:
   - **HTTPS**: Enter URL, username, and password/token
   - **SSH**: Enter SSH URL and private key

### 3. Apply ArgoCD Applications

```bash
# Apply staging application
kubectl apply -f infra/argocd/applications/staging-app.yaml

# Apply production application
kubectl apply -f infra/argocd/applications/production-app.yaml

# Verify applications are created
kubectl get applications -n argocd
```

### 4. Verify Application Status

```bash
# List all applications
argocd app list

# Get detailed status
argocd app get iitd-server-staging
argocd app get iitd-server-production

# Watch application sync
argocd app get iitd-server-staging --watch
```

## Using ArgoCD

### Web UI Features

1. **Application Overview**: See all applications and their sync status
2. **Resource Tree**: Visualize Kubernetes resources
3. **Application Details**: View manifests, events, logs
4. **Sync Operations**: Manual sync, rollback, refresh
5. **Resource Diff**: Compare desired vs. actual state

### Common CLI Commands

```bash
# List all applications
argocd app list

# Get application details
argocd app get <app-name>

# Sync application (if not automated)
argocd app sync <app-name>

# Sync and wait for completion
argocd app sync <app-name> --wait

# Force sync (ignore conflicts)
argocd app sync <app-name> --force

# Refresh application (re-read from Git)
argocd app get <app-name> --refresh

# View application logs
argocd app logs <app-name> --tail=100

# Rollback to previous version
argocd app rollback <app-name> <revision>

# Delete application
argocd app delete <app-name>

# Watch application status
argocd app get <app-name> --watch
```

### Application Configuration Explained

Let's break down the ArgoCD Application manifest:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: iitd-server-staging
  namespace: argocd
spec:
  project: default                    # ArgoCD project (for RBAC)
  source:
    repoURL: https://github.com/...  # Git repository URL
    targetRevision: develop          # Branch/tag to watch
    path: infra/k8s/overlays/staging # Path to Kustomize overlay
  destination:
    server: https://kubernetes.default.svc  # Target cluster
    namespace: iitd-staging          # Target namespace
  syncPolicy:
    automated:                        # Automatic sync
      prune: true                    # Delete resources not in Git
      selfHeal: true                 # Auto-correct manual changes
      allowEmpty: false              # Don't allow empty syncs
    syncOptions:
      - CreateNamespace=true         # Create namespace if missing
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:                           # Retry on failure
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Sync Policies

#### Automated Sync (Current Configuration)

- **Automatic sync**: Changes in Git are automatically applied
- **Prune**: Resources deleted from Git are removed from cluster
- **Self-heal**: Manual changes are automatically reverted

#### Manual Sync (More Control)

To change to manual sync, update the application:

```yaml
syncPolicy:
  syncOptions:
    - CreateNamespace=true
  retry:
    limit: 5
```

Then sync manually:
```bash
argocd app sync iitd-server-staging
```

## Troubleshooting

### Application Stuck in "Unknown" or "Syncing" State

```bash
# Refresh the application
argocd app get <app-name> --refresh

# Check application events
kubectl describe application <app-name> -n argocd

# Check ArgoCD controller logs
kubectl logs -f deployment/argocd-application-controller -n argocd
```

### Sync Failures

```bash
# Get sync operation details
argocd app get <app-name> --refresh

# Check for errors in UI or CLI output

# Common issues:
# 1. Repository access denied → Check repository credentials
# 2. Invalid manifests → Check Kustomize output
# 3. Resource conflicts → Check existing resources
```

### Repository Connection Issues

```bash
# Test repository connection
argocd repo get https://github.com/YOUR_USERNAME/iitd.git

# Re-add repository if needed
argocd repo remove https://github.com/YOUR_USERNAME/iitd.git
argocd repo add https://github.com/YOUR_USERNAME/iitd.git --username USERNAME --password TOKEN
```

### Application Not Syncing

```bash
# Check if automated sync is enabled
argocd app get <app-name> | grep -A 5 "Sync Policy"

# Manually trigger sync
argocd app sync <app-name>

# Check for sync hooks or health checks blocking sync
argocd app get <app-name> --show-operation
```

### Resource Health Issues

```bash
# Check resource health
argocd app get <app-name> --show-resources

# Common health issues:
# - Pods not ready → Check pod logs
# - Service endpoints → Check service selectors
# - PVC pending → Check storage class
```

### Viewing Logs

```bash
# ArgoCD application controller logs
kubectl logs -f deployment/argocd-application-controller -n argocd

# ArgoCD repo server logs
kubectl logs -f deployment/argocd-repo-server -n argocd

# ArgoCD server logs
kubectl logs -f deployment/argocd-server -n argocd

# Application resource logs
argocd app logs <app-name> --tail=100
```

## Advanced Configuration

### RBAC (Role-Based Access Control)

Create custom projects and roles:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: iitd-project
  namespace: argocd
spec:
  description: IITD Transport System Project
  sourceRepos:
    - 'https://github.com/YOUR_USERNAME/iitd.git'
  destinations:
    - namespace: 'iitd-*'
      server: https://kubernetes.default.svc
  roles:
    - name: developer
      policies:
        - p, proj:iitd-project:developer, applications, get, iitd-project/*, allow
        - p, proj:iitd-project:developer, applications, sync, iitd-project/*, allow
      groups:
        - developers
```

### Webhooks (Automatic Sync on Push)

Configure GitHub webhook to trigger ArgoCD sync:

1. Go to GitHub repository → Settings → Webhooks
2. Add webhook:
   - **Payload URL**: `https://your-argocd-server/api/webhooks`
   - **Content type**: `application/json`
   - **Events**: Push events

### Image Updater (Automatic Image Tag Updates)

Install ArgoCD Image Updater to automatically update image tags:

```bash
# Install Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Annotate application for auto-update
kubectl annotate application iitd-server-staging \
  argocd-image-updater.argoproj.io/image-list=server=ghcr.io/YOUR_USERNAME/iitd/server \
  argocd-image-updater.argoproj.io/write-back-method=git \
  argocd-image-updater.argoproj.io/git-branch=develop
```

## Best Practices

1. **Use Projects**: Organize applications into projects with RBAC
2. **Enable Self-Heal**: Automatically correct manual changes
3. **Use Sync Windows**: Control when syncs can occur
4. **Monitor Health**: Set up alerts for application health issues
5. **Version Control**: Always commit changes to Git, never edit directly in cluster
6. **Use Labels**: Tag applications with environment labels
7. **Review Before Sync**: Use manual sync for production, automated for staging

## Additional Resources

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
- [ArgoCD CLI Reference](https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd/)
- [ArgoCD Image Updater](https://argocd-image-updater.readthedocs.io/)


# ArgoCD GitOps Configuration

This directory contains ArgoCD Application manifests for GitOps-based continuous deployment of the IITD application stack.

## Prerequisites

- ArgoCD installed in your Kubernetes cluster
- `argocd` CLI installed and configured
- Access to the Git repository
- Kubernetes cluster access configured

## Kubernetes Cluster Setup

### Option 1: Use Existing Cluster

If you have a Kubernetes cluster (EKS, GKE, AKS, etc.):

```bash
# Configure kubectl to use your cluster
kubectl config use-context <your-context-name>

# Verify connection
kubectl cluster-info
```

### Option 2: Local Development with minikube

```bash
# Install minikube
brew install minikube  # macOS
# or download from https://minikube.sigs.k8s.io/docs/start/

# Start minikube
minikube start

# Configure kubectl
kubectl config use-context minikube
```

### Option 3: Local Development with kind

```bash
# Install kind
brew install kind  # macOS

# Create cluster
kind create cluster --name iitd

# Verify
kubectl cluster-info
```

### Option 4: Skip Validation (Not Recommended)

If you just want to create the manifests without validation:

```bash
kubectl apply -f infra/argocd/app-of-apps.yaml --validate=false
```

## ArgoCD Installation

If ArgoCD is not installed:

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Access ArgoCD UI at: `https://localhost:8080` (admin / <password>)

## Deployment Methods

### Method 1: App-of-Apps Pattern (Recommended)

Deploy all applications using the App-of-Apps pattern:

```bash
# Ensure kubectl is configured
kubectl config current-context

# Deploy App-of-Apps
kubectl apply -f app-of-apps.yaml
```

This will automatically create and manage:
- `iitd-server` application
- `iitd-client` application
- `iitd-monitoring` application

### Method 2: Individual Applications

Deploy applications individually:

```bash
# Deploy server
kubectl apply -f application-server.yaml

# Deploy client
kubectl apply -f application-client.yaml

# Deploy monitoring
kubectl apply -f application-monitoring.yaml
```

## Configuration

### Update Repository URL

Before deploying, update the `repoURL` in each application manifest:

```yaml
source:
  repoURL: https://github.com/YOUR_USERNAME/YOUR_REPO.git
  targetRevision: main  # or your branch name
```

### Sync Policies

Each application is configured with:

- **Automated Sync**: Automatically syncs when Git changes are detected
- **Self-Heal**: Automatically corrects drift from Git state
- **Prune**: Removes resources deleted from Git
- **Retry**: Automatic retry on sync failures

### Ignore Differences

The server application ignores:
- Deployment replica count (managed by HPA)
- HPA min/max replicas (can be adjusted manually)

## ArgoCD CLI Usage

### Login

```bash
argocd login localhost:8080
```

### Sync Applications

```bash
# Sync all applications
argocd app sync iitd-server
argocd app sync iitd-client
argocd app sync iitd-monitoring

# Sync with specific revision
argocd app sync iitd-server --revision <commit-hash>
```

### Check Application Status

```bash
# List all applications
argocd app list

# Get application details
argocd app get iitd-server

# Watch application sync
argocd app get iitd-server --watch
```

### Manual Operations

```bash
# Refresh application (check for changes)
argocd app get iitd-server --refresh

# Hard refresh (bypass cache)
argocd app get iitd-server --hard-refresh

# Delete application
argocd app delete iitd-server
```

## GitOps Workflow

1. **Make Changes**: Update Kubernetes manifests in `infra/k8s/`
2. **Commit & Push**: Push changes to Git repository
3. **ArgoCD Detects**: ArgoCD detects changes (polling interval: 3 minutes)
4. **Auto Sync**: Applications automatically sync (if enabled)
5. **Deployment**: Changes are deployed to Kubernetes cluster

## Sync Windows

To restrict sync to specific times, add sync windows:

```yaml
syncPolicy:
  syncOptions:
    - RespectIgnoreDifferences=true
  syncWindows:
    - kind: allow
      schedule: '10 0 * * *'  # Allow sync at 00:10 UTC
      duration: 1h
      applications:
        - '*'
    - kind: deny
      schedule: '* * * * *'   # Deny all other times
      duration: 24h
```

## Health Checks

ArgoCD monitors application health:

- **Healthy**: All resources are synced and healthy
- **Degraded**: Some resources are unhealthy
- **Progressing**: Sync is in progress
- **Suspended**: Application sync is paused
- **Unknown**: Health status cannot be determined

## Troubleshooting

### kubectl Not Configured

```bash
# Check current context
kubectl config current-context

# List available contexts
kubectl config get-contexts

# Set context
kubectl config use-context <context-name>

# If no contexts exist, set up a cluster first
```

### Application Stuck in Syncing

```bash
# Check application status
argocd app get iitd-server

# Check resource events
kubectl get events -n default --sort-by='.lastTimestamp'

# View application logs
argocd app logs iitd-server
```

### Sync Failures

```bash
# Get sync operation details
argocd app get iitd-server --show-operation

# Retry sync
argocd app sync iitd-server --retry-limit 5
```

### Permission Issues

Ensure ArgoCD has proper RBAC permissions:

```bash
# Check ArgoCD service account
kubectl get sa argocd-application-controller -n argocd

# Check cluster role bindings
kubectl get clusterrolebinding | grep argocd
```

## Best Practices

1. **Use App-of-Apps**: Centralized management of all applications
2. **Enable Self-Heal**: Automatically correct configuration drift
3. **Set Resource Limits**: Prevent resource exhaustion
4. **Use Sync Windows**: Control when deployments happen
5. **Monitor Health**: Set up alerts for unhealthy applications
6. **Version Control**: Tag releases for rollback capability
7. **Review Changes**: Use ArgoCD UI to review before auto-sync

## Rollback

To rollback to a previous version:

```bash
# List application history
argocd app history iitd-server

# Rollback to specific revision
argocd app rollback iitd-server <revision-id>
```

## Integration with CI/CD

ArgoCD works well with CI/CD pipelines:

1. **CI Pipeline**: Builds and pushes Docker images
2. **Update Manifests**: Updates image tags in Kubernetes manifests
3. **Git Push**: Commits and pushes changes
4. **ArgoCD**: Automatically syncs and deploys

Example GitHub Actions workflow can trigger ArgoCD refresh:

```yaml
- name: Refresh ArgoCD
  run: |
    argocd app get iitd-server --refresh
```

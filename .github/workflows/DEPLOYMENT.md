# Deployment Workflows Documentation

This document describes the CI/CD workflows for deploying the IITD application.

## Overview

The repository uses GitHub Actions for CI/CD with the following workflows:

1. **CI Workflows** (`ci-client.yml`, `ci-server.yml`): Run tests and build on every push/PR
2. **Deploy Workflows** (`deploy-client.yml`, `deploy-server.yml`): Build Docker images, push to registry, and deploy to Kubernetes
3. **ArgoCD Sync** (`argocd-sync.yml`): Optional workflow to sync ArgoCD applications

## Workflow Details

### CI Workflows

#### CI Client (`ci-client.yml`)
- **Triggers**: Push/PR to `main`/`master` when `client/**` changes
- **Jobs**:
  - `test`: Runs client tests (non-blocking)
  - `build`: Builds the client application

#### CI Server (`ci-server.yml`)
- **Triggers**: Push/PR to `main`/`master` when `server/**` changes
- **Jobs**:
  - `test`: Runs linter and unit tests (excludes e2e tests requiring MongoDB)
  - `build`: Builds the server application

### Deploy Workflows

#### Deploy Server (`deploy-server.yml`)
- **Triggers**: 
  - Push to `main`/`master` when `server/**` or `server/Dockerfile` changes
  - Manual dispatch
- **Jobs**:
  1. **build-and-push**:
     - Builds Docker image using `server/Dockerfile`
     - Pushes to GitHub Container Registry (`ghcr.io`)
     - Tags images with: branch name, SHA, semver (if tags present), and `latest` (on main/master)
     - Uses Docker layer caching via GitHub Actions cache
  2. **deploy**:
     - Updates Kubernetes deployment manifest with new image tag
     - Applies changes using `kubectl`
     - Waits for rollout to complete
     - Optionally triggers ArgoCD sync

#### Deploy Client (`deploy-client.yml`)
- **Triggers**: 
  - Push to `main`/`master` when `client/**` or `client/Dockerfile` changes
  - Manual dispatch
- **Jobs**:
  1. **build-and-push**:
     - Builds Docker image using `client/Dockerfile` (nginx-based)
     - Pushes to GitHub Container Registry (`ghcr.io`)
     - Tags images with: branch name, SHA, semver (if tags present), and `latest` (on main/master)
     - Uses Docker layer caching via GitHub Actions cache
  2. **deploy**:
     - Updates Kubernetes deployment manifest with new image tag
     - Applies changes using `kubectl`
     - Waits for rollout to complete
     - Optionally triggers ArgoCD sync

### ArgoCD Sync (`argocd-sync.yml`)
- **Triggers**: 
  - After `Deploy Server` or `Deploy Client` workflows complete
  - Manual dispatch (with app selection)
- **Jobs**:
  - `sync`: Syncs ArgoCD applications (iitd-server, iitd-client, or all)

## Prerequisites

### Required Secrets

1. **KUBE_CONFIG**: Kubernetes cluster kubeconfig file
   ```bash
   # Get kubeconfig from your cluster
   kubectl config view --flatten > kubeconfig.yaml
   # Add as secret: KUBE_CONFIG
   ```

2. **GITHUB_TOKEN**: Automatically provided by GitHub Actions (for pushing to ghcr.io)

### Optional Secrets (for ArgoCD)

1. **ARGOCD_SERVER_URL**: ArgoCD server URL (e.g., `https://argocd.example.com`)
2. **ARGOCD_USERNAME**: ArgoCD username
3. **ARGOCD_PASSWORD**: ArgoCD password

### Required Variables

1. **VITE_API_BASE_URL**: API base URL for client build (optional, can use secrets)

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions:

1. Add `KUBE_CONFIG` secret with your Kubernetes cluster configuration
2. (Optional) Add ArgoCD secrets if using ArgoCD sync

### 2. Configure GitHub Variables

Go to your repository → Settings → Secrets and variables → Actions → Variables:

1. Add `VITE_API_BASE_URL` if needed for client builds

### 3. Create Image Pull Secret in Kubernetes

To pull images from GitHub Container Registry, create a secret:

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_GITHUB_USERNAME \
  --docker-password=YOUR_GITHUB_TOKEN \
  --namespace=default
```

Or use a GitHub Personal Access Token with `read:packages` permission.

### 4. Verify Workflows

1. Push changes to trigger CI workflows
2. Merge to `main`/`master` to trigger deployment
3. Check workflow runs in Actions tab
4. Verify images in GitHub Packages (repository → Packages)
5. Check Kubernetes deployments:
   ```bash
   kubectl get deployments -n default
   kubectl get pods -n default
   ```

## Image Tags

Images are tagged with:
- `latest`: Latest build on main/master branch
- `main-<sha>`: SHA-based tag for main branch
- `master-<sha>`: SHA-based tag for master branch
- Semver tags: If git tags are present (e.g., `v1.0.0`)

## Troubleshooting

### Docker Build Fails
- Check Dockerfile syntax
- Verify build context paths
- Check GitHub Actions logs for detailed errors

### Kubernetes Deployment Fails
- Verify `KUBE_CONFIG` secret is correct
- Check cluster connectivity: `kubectl cluster-info`
- Verify image pull secret exists: `kubectl get secret ghcr-secret`
- Check pod logs: `kubectl logs -l app=iitd-server`

### ArgoCD Sync Fails
- Verify ArgoCD secrets are configured
- Check ArgoCD server URL is accessible
- Verify ArgoCD CLI can authenticate

### Image Pull Errors
- Ensure `ghcr-secret` exists in the namespace
- Verify GitHub token has `read:packages` permission
- Check image exists: `docker pull ghcr.io/sudo-de/odi_oae_iitd/server:latest`

## Manual Deployment

### Deploy Server Manually
```bash
# Build and push image
docker build -t ghcr.io/sudo-de/odi_oae_iitd/server:latest ./server
docker push ghcr.io/sudo-de/odi_oae_iitd/server:latest

# Update and apply Kubernetes manifest
kubectl set image deployment/iitd-server server=ghcr.io/sudo-de/odi_oae_iitd/server:latest -n default
kubectl rollout status deployment/iitd-server -n default
```

### Deploy Client Manually
```bash
# Build and push image
docker build -t ghcr.io/sudo-de/odi_oae_iitd/client:latest ./client
docker push ghcr.io/sudo-de/odi_oae_iitd/client:latest

# Update and apply Kubernetes manifest
kubectl set image deployment/iitd-client client=ghcr.io/sudo-de/odi_oae_iitd/client:latest -n default
kubectl rollout status deployment/iitd-client -n default
```

## Best Practices

1. **Always test locally** before pushing
2. **Use feature branches** for development
3. **Review CI results** before merging
4. **Monitor deployments** after merging to main
5. **Use semantic versioning** for production releases
6. **Keep secrets secure** - never commit them
7. **Monitor image sizes** - optimize Dockerfiles
8. **Use image tags** instead of `latest` for production


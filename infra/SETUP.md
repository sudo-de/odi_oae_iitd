# GitOps Setup Guide

This guide will help you set up GitOps deployment for the IITD Transport System.

## Prerequisites

1. **Kubernetes Cluster**: You need access to a Kubernetes cluster
   - Local: Minikube, Kind, or Docker Desktop Kubernetes
   - Cloud: GKE, EKS, AKS, or any managed Kubernetes service
   - Self-hosted: Your own Kubernetes cluster

2. **GitHub Secrets**: Configure the following secrets in your GitHub repository:
   - Go to: Settings → Secrets and variables → Actions → Environment secrets
   - Create environments: `staging` and `production`
   - Add secrets to each environment:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: JWT signing secret
     - `SMTP_USER`: SMTP username (optional)
     - `SMTP_PASS`: SMTP password (optional)
     - `KUBECONFIG`: Base64-encoded kubeconfig file (for kubectl deployment)
     - `ARGOCD_SERVER`: ArgoCD server URL (if using ArgoCD)
     - `ARGOCD_USERNAME`: ArgoCD username (if using ArgoCD)
     - `ARGOCD_PASSWORD`: ArgoCD password (if using ArgoCD)

3. **Container Registry**: Docker images should be pushed to:
   - GitHub Container Registry (GHCR) - automatic
   - Docker Hub - if `DOCKER_USERNAME` and `DOCKER_PASSWORD` are set

## Quick Start

### Option 1: Using ArgoCD (Recommended for Production)

1. **Install ArgoCD** (if not already installed):
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```

2. **Get ArgoCD Admin Password**:
   ```bash
   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
   ```

3. **Port-forward ArgoCD UI**:
   ```bash
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   ```
   Access at: https://localhost:8080 (username: `admin`)

4. **Apply ArgoCD Applications**:
   ```bash
   # For staging
   kubectl apply -f infra/argocd/applications/staging-app.yaml
   
   # For production
   kubectl apply -f infra/argocd/applications/production-app.yaml
   ```

5. **Update Image References**:
   Edit `infra/k8s/overlays/staging/kustomization.yaml` and `infra/k8s/overlays/production/kustomization.yaml`:
   ```yaml
   images:
     - name: ghcr.io/YOUR_USERNAME/iitd/server
       newTag: develop  # or main for production
   ```

6. **ArgoCD will automatically sync** changes from your Git repository.

### Option 2: Using kubectl Directly (Simple Setup)

1. **Configure kubectl**:
   ```bash
   # For local cluster (Docker Desktop)
   kubectl config use-context docker-desktop
   
   # For cloud clusters, use your provider's authentication method
   ```

2. **Create Namespaces**:
   ```bash
   kubectl create namespace iitd-staging
   kubectl create namespace iitd-production
   ```

3. **Create Secrets**:
   ```bash
   # Staging
   kubectl create secret generic iitd-secrets \
     --from-literal=mongodb-uri="YOUR_MONGODB_URI" \
     --from-literal=jwt-secret="YOUR_JWT_SECRET" \
     -n iitd-staging
   
   # Production
   kubectl create secret generic iitd-secrets \
     --from-literal=mongodb-uri="YOUR_MONGODB_URI" \
     --from-literal=jwt-secret="YOUR_JWT_SECRET" \
     -n iitd-production
   ```

4. **Deploy**:
   ```bash
   # Staging
   kubectl apply -k infra/k8s/overlays/staging
   
   # Production
   kubectl apply -k infra/k8s/overlays/production
   ```

5. **Check Status**:
   ```bash
   kubectl get pods -n iitd-staging
   kubectl get pods -n iitd-production
   ```

## GitHub Actions Workflow

The GitOps deployment workflow (`gitops-deploy.yml`) will:

1. **Sync Secrets**: Automatically sync secrets from GitHub Environment secrets to Kubernetes
2. **Deploy**: Use ArgoCD or kubectl to deploy based on your configuration

### Workflow Triggers

- **Automatic**: On push to `main` (production) or `develop` (staging)
- **Manual**: Use "Run workflow" button in GitHub Actions

### Required GitHub Secrets

#### Repository Secrets (for all environments):
- `DOCKER_USERNAME`: Docker Hub username (optional, uses GHCR if not set)
- `DOCKER_PASSWORD`: Docker Hub password (optional)

#### Environment Secrets (per environment):

**Staging Environment:**
- `MONGODB_URI`
- `JWT_SECRET`
- `SMTP_USER` (optional)
- `SMTP_PASS` (optional)
- `KUBECONFIG` (base64 encoded)
- `ARGOCD_SERVER` (if using ArgoCD)
- `ARGOCD_USERNAME` (if using ArgoCD)
- `ARGOCD_PASSWORD` (if using ArgoCD)

**Production Environment:**
- Same as staging, but with production values

## Updating Deployments

### Automatic (GitOps with ArgoCD)

1. Push code changes to `main` or `develop`
2. CI/CD pipeline builds and pushes Docker image
3. ArgoCD detects changes and syncs automatically
4. Deployment updates with zero downtime (rolling update)

### Manual Update

```bash
# Update image tag in kustomization.yaml
# Then:
kubectl apply -k infra/k8s/overlays/production

# Or using ArgoCD:
argocd app sync iitd-server-production
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n iitd-production

# Check pod logs
kubectl logs -f deployment/prod-iitd-server -n iitd-production

# Describe pod for events
kubectl describe pod <pod-name> -n iitd-production
```

### Secrets not found

```bash
# Check if secrets exist
kubectl get secrets -n iitd-production

# Verify secret values (be careful with sensitive data)
kubectl get secret iitd-secrets -n iitd-production -o yaml
```

### ArgoCD sync issues

```bash
# Check ArgoCD application status
argocd app get iitd-server-production

# Force sync
argocd app sync iitd-server-production --force

# Check ArgoCD logs
kubectl logs -f deployment/argocd-application-controller -n argocd
```

### Image pull errors

```bash
# Check if image exists
docker pull ghcr.io/your-org/iitd/server:main

# Verify image pull secrets (if using private registry)
kubectl get secrets -n iitd-production
```

## Next Steps

1. **Monitoring**: Set up monitoring with Prometheus and Grafana
2. **Logging**: Configure centralized logging (ELK, Loki, etc.)
3. **Ingress**: Set up ingress controller for external access
4. **SSL/TLS**: Configure certificates with cert-manager
5. **Backup**: Set up automated backups for MongoDB and PVCs

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [GitOps Principles](https://www.gitops.tech/)


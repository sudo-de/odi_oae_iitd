# GitOps Configuration Repository

This directory contains all infrastructure and deployment configurations for the IITD Transport System using GitOps principles.

## Structure

```
infra/
├── k8s/                    # Kubernetes manifests
│   ├── base/              # Base Kustomize configuration
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── pvc.yaml
│   │   └── kustomization.yaml
│   └── overlays/          # Environment-specific overlays
│       ├── staging/
│       │   ├── kustomization.yaml
│       │   └── deployment-patch.yaml
│       └── production/
│           ├── kustomization.yaml
│           └── deployment-patch.yaml
├── argocd/                # ArgoCD Application manifests
│   └── applications/
│       ├── staging-app.yaml
│       └── production-app.yaml
└── secrets/               # Secret management documentation
    └── README.md
```

## GitOps Workflow

### 1. Application Code Repository (This Repo)
- Contains application source code
- CI/CD pipeline builds Docker images
- Images pushed to container registry (GHCR or Docker Hub)
- On merge to `main` or `develop`, triggers deployment

### 2. GitOps Config Repository (This Repo)
- Contains Kubernetes manifests
- Uses Kustomize for environment-specific configurations
- ArgoCD watches this repository and syncs changes to clusters

### 3. Deployment Flow

```
Developer Push → GitHub Actions CI/CD → Build Image → Push to Registry
                                                          ↓
ArgoCD Detects Change → Syncs Kubernetes Manifests → Updates Deployment
```

## Setup Instructions

### Prerequisites

1. **Kubernetes Cluster**: Access to a Kubernetes cluster (local, cloud, or managed)
2. **ArgoCD**: ArgoCD installed in your cluster
3. **Container Registry**: Docker images pushed to GHCR or Docker Hub
4. **GitHub Secrets**: Environment secrets configured in GitHub

### Step 1: Update Image References

Edit the following files to match your container registry:

- `infra/k8s/base/kustomization.yaml`
- `infra/k8s/overlays/staging/kustomization.yaml`
- `infra/k8s/overlays/production/kustomization.yaml`

Replace `ghcr.io/your-org/iitd/server` with your actual image path.

### Step 2: Create Kubernetes Secrets

Secrets are managed through GitHub Environment secrets and synced via GitHub Actions workflow.

Required secrets:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `SMTP_USER`: SMTP username (optional)
- `SMTP_PASS`: SMTP password (optional)

### Step 3: Deploy ArgoCD Applications

Apply ArgoCD Application manifests:

```bash
# For staging
kubectl apply -f infra/argocd/applications/staging-app.yaml

# For production
kubectl apply -f infra/argocd/applications/production-app.yaml
```

### Step 4: Verify Deployment

Check ArgoCD UI or CLI:

```bash
# List applications
argocd app list

# Get application status
argocd app get iitd-server-staging
argocd app get iitd-server-production
```

## Environment-Specific Configurations

### Staging
- Namespace: `iitd-staging`
- Replicas: 1
- Image Tag: `develop`
- Resource Limits: Lower (for cost savings)

### Production
- Namespace: `iitd-production`
- Replicas: 3 (high availability)
- Image Tag: `main`
- Resource Limits: Higher (for performance)

## Manual Deployment (Without ArgoCD)

If you're not using ArgoCD, you can deploy manually:

```bash
# Build and apply staging
kubectl apply -k infra/k8s/overlays/staging

# Build and apply production
kubectl apply -k infra/k8s/overlays/production
```

## Updating Deployments

### Automatic (GitOps)
1. Update Kubernetes manifests in this repository
2. Commit and push changes
3. ArgoCD automatically syncs changes to cluster

### Manual
```bash
# Update image tag
kubectl set image deployment/prod-iitd-server \
  server=ghcr.io/your-org/iitd/server:v1.2.3 \
  -n iitd-production

# Or update entire deployment
kubectl apply -k infra/k8s/overlays/production
```

## Monitoring and Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n iitd-production
kubectl describe pod <pod-name> -n iitd-production
```

### Check Logs
```bash
kubectl logs -f deployment/prod-iitd-server -n iitd-production
```

### Check ArgoCD Sync Status
```bash
argocd app sync iitd-server-production
argocd app wait iitd-server-production
```

## Best Practices

1. **Never commit secrets**: Use GitHub Environment secrets or external secret management
2. **Use Kustomize**: Leverage overlays for environment-specific configs
3. **Version control**: All infrastructure changes should be in Git
4. **Automated sync**: Use ArgoCD for automated deployments
5. **Resource limits**: Always set appropriate resource requests and limits
6. **Health checks**: Configure liveness and readiness probes
7. **Rolling updates**: Use deployment strategies for zero-downtime updates

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)


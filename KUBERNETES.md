# Kubernetes Deployment Guide

This guide explains how to deploy the IITD application to Kubernetes using GitOps with ArgoCD.

## 📋 Prerequisites

- Kubernetes cluster (v1.24+)
- `kubectl` configured to access your cluster
- `kustomize` (v5.0+) installed
- ArgoCD installed (optional, for GitOps)
- Ingress controller (e.g., NGINX Ingress)
- Storage class for persistent volumes

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │   Ingress     │───►│   Client     │                  │
│  │  (NGINX)      │    │  (React)     │                  │
│  └──────────────┘     └──────────────┘                  │
│         │                    │                          │
│         │                    ▼                          │
│         │            ┌──────────────┐                   │
│         └───────────►│   Server     │                   │
│                      │  (NestJS)    │                   │
│                      └──────────────┘                   │
│                             │                           │
│                             ▼                           │
│                      ┌──────────────┐                   │
│                      │   MongoDB    │                   │
│                      │ (StatefulSet)│                   │
│                      └──────────────┘                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
k8s/
├── base/                    # Base Kubernetes manifests
│   ├── namespace.yaml
│   ├── mongodb.yaml
│   ├── server.yaml
│   ├── client.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── ingress.yaml
│   ├── rbac.yaml
│   └── kustomization.yaml
└── overlays/                # Environment-specific overlays
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

## 🚀 Quick Start

### 1. Prepare Secrets

Create Kubernetes secrets for sensitive data:

```bash
# Create namespace
kubectl create namespace iitd

# Create secrets
kubectl create secret generic server-secrets \
  --from-literal=JWT_SECRET='your-jwt-secret' \
  --from-literal=SMTP_USER='your-email@gmail.com' \
  --from-literal=SMTP_PASS='your-app-password' \
  -n iitd
```

### 2. Update Image References

Edit `k8s/base/server.yaml` and `k8s/base/client.yaml` to use your container registry:

```yaml
image: ghcr.io/your-username/iitd-server:latest
image: ghcr.io/your-username/iitd-client:latest
```

### 3. Deploy to Staging

```bash
# Build and apply kustomize manifests
cd k8s/overlays/staging
kustomize build . | kubectl apply -f -

# Or use kubectl with kustomize
kubectl apply -k k8s/overlays/staging
```

### 4. Deploy to Production

```bash
kubectl apply -k k8s/overlays/production
```

### 5. Verify Deployment

```bash
# Check pods
kubectl get pods -n iitd

# Check services
kubectl get svc -n iitd

# Check ingress
kubectl get ingress -n iitd

# View logs
kubectl logs -f deployment/server -n iitd
```

## 🔧 Configuration

### Environment Variables

Update `k8s/base/configmap.yaml` for non-sensitive configuration:

```yaml
data:
  NODE_ENV: "production"
  PORT: "3000"
  MONGODB_URI: "mongodb://mongodb:27017/iitd-db"
  SMTP_HOST: "smtp.gmail.com"
  SMTP_PORT: "587"
  SMTP_SECURE: "false"
```

### Storage

MongoDB uses a StatefulSet with persistent volumes. Configure storage class:

```yaml
# In mongodb.yaml
storageClassName: standard  # Change to your storage class
```

### Resource Limits

Adjust resource requests and limits in deployment files:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Replicas

- **Staging**: 1 replica (default)
- **Production**: 3 replicas (default)

Modify in overlay files:
- `k8s/overlays/staging/deployment-patch.yaml`
- `k8s/overlays/production/deployment-patch.yaml`

## 🌐 Ingress Configuration

### Update Domain

Edit `k8s/base/ingress.yaml`:

```yaml
spec:
  rules:
  - host: iitd.example.com  # Change to your domain
```

### TLS/SSL

For production, configure TLS:

```yaml
spec:
  tls:
  - hosts:
    - iitd.example.com
    secretName: iitd-tls
```

Create TLS secret:

```bash
kubectl create secret tls iitd-tls \
  --cert=path/to/cert.pem \
  --key=path/to/key.pem \
  -n iitd
```

Or use cert-manager for automatic certificate management.

## 🔄 GitOps with ArgoCD

### Install ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### Access ArgoCD UI

```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

Access: https://localhost:8080 (username: `admin`)

### Create ArgoCD Application

Apply the ArgoCD application manifest:

```bash
kubectl apply -f gitops/argocd/application.yaml
```

Or create via ArgoCD CLI:

```bash
argocd app create iitd-staging \
  --repo https://github.com/your-username/iitd.git \
  --path k8s/overlays/staging \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace iitd \
  --sync-policy automated \
  --self-heal
```

### Sync Policy

- **Staging**: Automated sync with self-heal
- **Production**: Manual sync (requires approval)

## 📊 Monitoring

### Check Pod Status

```bash
kubectl get pods -n iitd -w
```

### View Logs

```bash
# Server logs
kubectl logs -f deployment/server -n iitd

# Client logs
kubectl logs -f deployment/client -n iitd

# MongoDB logs
kubectl logs -f statefulset/mongodb -n iitd
```

### Health Checks

```bash
# Check server health
kubectl exec -n iitd deployment/server -- wget -q -O- http://localhost:3000/health

# Check client health
kubectl exec -n iitd deployment/client -- wget -q -O- http://localhost:80/health
```

### Resource Usage

```bash
kubectl top pods -n iitd
kubectl top nodes
```

## 🔄 Rolling Updates

### Update Application

1. Build and push new Docker images
2. Update image tag in kustomization:

```bash
cd k8s/overlays/staging
kustomize edit set image ghcr.io/your-username/iitd-server:v1.2.3
```

3. Apply changes:

```bash
kubectl apply -k k8s/overlays/staging
```

### Rollback

```bash
# View rollout history
kubectl rollout history deployment/server -n iitd

# Rollback to previous version
kubectl rollout undo deployment/server -n iitd
```

## 🛠️ Troubleshooting

### Pods Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n iitd

# Check events
kubectl get events -n iitd --sort-by='.lastTimestamp'
```

### Image Pull Errors

```bash
# Check image pull secrets
kubectl get secrets -n iitd

# Create image pull secret for private registry
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=<username> \
  --docker-password=<token> \
  -n iitd
```

### MongoDB Connection Issues

```bash
# Check MongoDB service
kubectl get svc mongodb -n iitd

# Test connection from server pod
kubectl exec -n iitd deployment/server -- ping mongodb
```

### Ingress Not Working

```bash
# Check ingress
kubectl describe ingress iitd-ingress -n iitd

# Check ingress controller
kubectl get pods -n ingress-nginx
```

## 🔒 Security Best Practices

1. **Use Secrets**: Never commit secrets to Git
2. **RBAC**: Use service accounts with minimal permissions
3. **Network Policies**: Restrict pod-to-pod communication
4. **Image Security**: Scan images for vulnerabilities
5. **TLS**: Always use TLS in production
6. **Resource Limits**: Set appropriate resource limits

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

## 🎯 Next Steps

1. ✅ Set up Kubernetes cluster
2. ✅ Configure secrets and configmaps
3. ✅ Deploy to staging
4. ✅ Set up ArgoCD for GitOps
5. ✅ Configure production with proper security
6. ✅ Set up monitoring and alerting
7. ✅ Configure backup strategy for MongoDB


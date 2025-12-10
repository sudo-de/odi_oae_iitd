# Local Kubernetes Setup Guide

If you want to test the GitOps configuration locally, you need a Kubernetes cluster. Here are several options:

## Option 1: Docker Desktop (Easiest for macOS/Windows)

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop

2. **Enable Kubernetes**:
   - Open Docker Desktop
   - Go to Settings → Kubernetes
   - Check "Enable Kubernetes"
   - Click "Apply & Restart"

3. **Verify**:
   ```bash
   kubectl config get-contexts
   kubectl cluster-info
   ```

4. **Deploy**:
   ```bash
   kubectl apply -k infra/k8s/overlays/staging
   ```

## Option 2: Minikube (Cross-platform)

1. **Install Minikube**:
   ```bash
   # macOS
   brew install minikube
   
   # Linux
   curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   sudo install minikube-linux-amd64 /usr/local/bin/minikube
   ```

2. **Start Minikube**:
   ```bash
   minikube start
   ```

3. **Verify**:
   ```bash
   kubectl config get-contexts
   kubectl cluster-info
   ```

4. **Deploy**:
   ```bash
   kubectl apply -k infra/k8s/overlays/staging
   ```

## Option 3: Kind (Kubernetes in Docker)

1. **Install Kind**:
   ```bash
   # macOS
   brew install kind
   
   # Linux
   curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
   chmod +x ./kind
   sudo mv ./kind /usr/local/bin/kind
   ```

2. **Create Cluster**:
   ```bash
   kind create cluster --name iitd
   ```

3. **Verify**:
   ```bash
   kubectl config get-contexts
   kubectl cluster-info
   ```

4. **Deploy**:
   ```bash
   kubectl apply -k infra/k8s/overlays/staging
   ```

## Option 4: Generate Manifests Only (No Cluster Needed)

If you just want to verify the configuration without deploying:

```bash
# Generate and view staging manifests
kubectl kustomize infra/k8s/overlays/staging

# Generate and view production manifests
kubectl kustomize infra/k8s/overlays/production

# Save to file
kubectl kustomize infra/k8s/overlays/staging > staging-manifests.yaml
kubectl kustomize infra/k8s/overlays/production > production-manifests.yaml
```

## Option 5: Skip Validation (Preview Only)

If you want to see what would be applied without validation:

```bash
kubectl apply -k infra/k8s/overlays/staging --validate=false --dry-run=client
```

## Setting Up Secrets

Before deploying, create the required secrets:

```bash
# Create namespace
kubectl create namespace iitd-staging

# Create secrets
kubectl create secret generic iitd-secrets \
  --from-literal=mongodb-uri="your-mongodb-connection-string" \
  --from-literal=jwt-secret="your-jwt-secret" \
  --from-literal=smtp-user="your-smtp-user" \
  --from-literal=smtp-pass="your-smtp-password" \
  -n iitd-staging
```

## Verify Deployment

After deploying:

```bash
# Check pods
kubectl get pods -n iitd-staging

# Check services
kubectl get svc -n iitd-staging

# Check deployments
kubectl get deployments -n iitd-staging

# View logs
kubectl logs -f deployment/staging-iitd-server -n iitd-staging
```

## Cleanup

To remove the deployment:

```bash
kubectl delete -k infra/k8s/overlays/staging
```

To remove the cluster (if using Minikube/Kind):

```bash
# Minikube
minikube delete

# Kind
kind delete cluster --name iitd
```


# Quick Start Guide

## Problem: kubectl Not Configured

If you see this error:
```
error validating data: failed to download openapi: Get "http://localhost:8080/openapi/v2?timeout=32s": dial tcp [::1]:8080: connect: connection refused
```

It means kubectl is not configured with a valid Kubernetes cluster.

## Solutions

### Solution 1: Skip Validation (Quick Fix)

If you just want to create the manifests without deploying:

```bash
kubectl apply -f infra/argocd/app-of-apps.yaml --validate=false
```

**Note**: This will fail if you don't have a cluster, but the files will be validated.

### Solution 2: Set Up Local Cluster

#### Install minikube (Recommended)

```bash
# macOS
brew install minikube

# Start cluster
minikube start

# Verify
kubectl config use-context minikube
kubectl cluster-info
```

#### Install kind

```bash
# macOS
brew install kind

# Create cluster
kind create cluster --name iitd

# Verify
kubectl config use-context kind-iitd
kubectl cluster-info
```

#### Use Setup Script

```bash
# Run the setup script
./infra/argocd/setup-local-cluster.sh
```

### Solution 3: Connect to Existing Cluster

If you have a remote cluster (EKS, GKE, AKS):

```bash
# Configure kubectl (example for AWS EKS)
aws eks update-kubeconfig --name <cluster-name> --region <region>

# Verify
kubectl config current-context
kubectl cluster-info
```

## After Cluster is Ready

Once kubectl is configured:

1. **Install ArgoCD** (if not already installed):
   ```bash
   kubectl create namespace argocd
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```

2. **Deploy Applications**:
   ```bash
   kubectl apply -f infra/argocd/app-of-apps.yaml
   ```

3. **Access ArgoCD UI**:
   ```bash
   kubectl port-forward svc/argocd-server -n argocd 8080:443
   # Visit https://localhost:8080
   ```

## Verify Setup

```bash
# Check cluster connection
kubectl cluster-info

# Check ArgoCD pods
kubectl get pods -n argocd

# Check applications
kubectl get applications -n argocd
```


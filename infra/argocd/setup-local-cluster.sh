#!/bin/bash

# Setup script for local Kubernetes cluster with ArgoCD

set -e

echo "🚀 Setting up local Kubernetes cluster for IITD project..."

# Check if minikube is installed
if command -v minikube &> /dev/null; then
    echo "✅ Found minikube"
    CLUSTER_TYPE="minikube"
elif command -v kind &> /dev/null; then
    echo "✅ Found kind"
    CLUSTER_TYPE="kind"
else
    echo "❌ Neither minikube nor kind found"
    echo "Please install one of them:"
    echo "  macOS: brew install minikube"
    echo "  macOS: brew install kind"
    exit 1
fi

# Start cluster
if [ "$CLUSTER_TYPE" == "minikube" ]; then
    echo "📦 Starting minikube cluster..."
    minikube start --driver=docker --memory=4096 --cpus=2
    
    echo "🔧 Configuring kubectl..."
    kubectl config use-context minikube
    
elif [ "$CLUSTER_TYPE" == "kind" ]; then
    echo "📦 Creating kind cluster..."
    kind create cluster --name iitd --config - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 30080
    hostPort: 30080
  - containerPort: 30443
    hostPort: 30443
EOF
    
    echo "🔧 Configuring kubectl..."
    kubectl config use-context kind-iitd
fi

# Verify cluster
echo "✅ Verifying cluster connection..."
kubectl cluster-info

# Install ArgoCD
echo "📦 Installing ArgoCD..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

echo "⏳ Waiting for ArgoCD to be ready (this may take a few minutes)..."
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=argocd-server -n argocd --timeout=300s || echo "⚠️  ArgoCD may still be starting..."

# Get ArgoCD admin password
echo ""
echo "🔐 ArgoCD Admin Password:"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
echo ""

# Port forward instructions
echo "🌐 To access ArgoCD UI, run in a separate terminal:"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo ""
echo "   Then visit: https://localhost:8080"
echo "   Username: admin"
echo "   Password: (shown above)"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Wait for ArgoCD to be fully ready (check with: kubectl get pods -n argocd)"
echo "2. Port forward ArgoCD server (command above)"
echo "3. Deploy applications: kubectl apply -f infra/argocd/app-of-apps.yaml"


#!/bin/bash
# ArgoCD Installation Script for IITD Transport System

set -e

echo "Installing ArgoCD..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please configure kubectl."
    exit 1
fi

# Create namespace
echo "📦 Creating argocd namespace..."
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# Install ArgoCD
echo "⬇️  Installing ArgoCD manifests..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
echo "⏳ Waiting for ArgoCD to be ready (this may take a few minutes)..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd || true
kubectl wait --for=condition=available --timeout=300s deployment/argocd-repo-server -n argocd || true
kubectl wait --for=condition=available --timeout=300s deployment/argocd-applicationset-controller -n argocd || true

# Get admin password
echo ""
echo "✅ ArgoCD installed successfully!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Get admin password:"
echo "   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d && echo"
echo ""
echo "2. Port forward ArgoCD server:"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo ""
echo "3. Access ArgoCD UI:"
echo "   https://localhost:8080"
echo "   Username: admin"
echo "   Password: <from step 1>"
echo ""
echo "4. Apply ArgoCD applications:"
echo "   kubectl apply -f infra/argocd/applications/staging-app.yaml"
echo "   kubectl apply -f infra/argocd/applications/production-app.yaml"
echo ""


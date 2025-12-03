#!/bin/bash

# Fix kubectl configuration script

echo "🔧 Fixing kubectl configuration..."

# Check if kubeconfig exists
if [ ! -f ~/.kube/config ]; then
    echo "⚠️  No kubeconfig found at ~/.kube/config"
    echo ""
    echo "Please set up a Kubernetes cluster first:"
    echo ""
    echo "Option 1: Install minikube"
    echo "  brew install minikube"
    echo "  minikube start"
    echo ""
    echo "Option 2: Install kind"
    echo "  brew install kind"
    echo "  kind create cluster --name iitd"
    echo ""
    echo "Option 3: Connect to existing cluster"
    echo "  kubectl config set-cluster <cluster-name> --server=<api-server-url>"
    exit 1
fi

# Check for localhost:8080 issue
if grep -q "localhost:8080" ~/.kube/config 2>/dev/null; then
    echo "⚠️  Found localhost:8080 in kubeconfig"
    echo "This is likely a misconfiguration."
    echo ""
    echo "To fix:"
    echo "1. Remove or backup current config: mv ~/.kube/config ~/.kube/config.backup"
    echo "2. Set up a cluster (minikube/kind) or connect to existing cluster"
    echo ""
    read -p "Do you want to backup current config and set up minikube? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv ~/.kube/config ~/.kube/config.backup 2>/dev/null || true
        echo "✅ Backed up config to ~/.kube/config.backup"
        
        if command -v minikube &> /dev/null; then
            echo "🚀 Starting minikube..."
            minikube start
            kubectl config use-context minikube
            echo "✅ kubectl configured for minikube"
        elif command -v kind &> /dev/null; then
            echo "🚀 Creating kind cluster..."
            kind create cluster --name iitd
            kubectl config use-context kind-iitd
            echo "✅ kubectl configured for kind"
        else
            echo "❌ Neither minikube nor kind found"
            echo "Please install one: brew install minikube"
            exit 1
        fi
    fi
else
    echo "✅ kubeconfig looks okay"
    kubectl config current-context || echo "⚠️  No context set"
fi

echo ""
echo "Current kubectl configuration:"
kubectl config view --minify 2>&1 | head -10 || echo "⚠️  Cannot read config"


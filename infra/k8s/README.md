# Kubernetes Deployment Configuration

This directory contains Kubernetes manifests for deploying the IITD application stack.

## Structure

```
k8s/
├── client/              # Frontend (React) deployment
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── configmap.yaml
├── server/             # Backend (NestJS) deployment
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml.example
│   ├── pvc.yaml
│   └── hpa.yaml
└── monitoring/         # Monitoring stack (Prometheus + Grafana)
    ├── namespace.yaml
    ├── prometheus-*.yaml
    ├── grafana-*.yaml
    └── ingress.yaml
```

## Prerequisites

- Kubernetes cluster (EKS, GKE, AKS, or local with minikube/kind)
- `kubectl` configured to access your cluster
- Ingress controller installed (nginx-ingress recommended)
- cert-manager installed (for TLS certificates)

## Quick Start

### 1. Create Monitoring Namespace

```bash
kubectl apply -f monitoring/namespace.yaml
```

### 2. Deploy Monitoring Stack

```bash
# Create Grafana secrets
kubectl create secret generic grafana-secrets \
  --from-literal=admin-user='admin' \
  --from-literal=admin-password='your-secure-password' \
  -n monitoring

# Deploy Prometheus
kubectl apply -f monitoring/prometheus-configmap.yaml
kubectl apply -f monitoring/prometheus-pvc.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/prometheus-service.yaml

# Deploy Grafana
kubectl apply -f monitoring/grafana-datasources.yaml
kubectl apply -f monitoring/grafana-pvc.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
kubectl apply -f monitoring/grafana-service.yaml

# Deploy Ingress (update hostnames)
kubectl apply -f monitoring/ingress.yaml
```

### 3. Deploy Server

```bash
# Create server secrets
kubectl create secret generic server-secrets \
  --from-literal=mongodb-uri='mongodb://mongodb-service:27017/iitd-db' \
  --from-literal=jwt-secret='your-secret-key' \
  --from-literal=smtp-user='your-email@gmail.com' \
  --from-literal=smtp-pass='your-app-password'

# Deploy server
kubectl apply -f server/configmap.yaml
kubectl apply -f server/pvc.yaml
kubectl apply -f server/deployment.yaml
kubectl apply -f server/service.yaml
kubectl apply -f server/hpa.yaml
```

### 4. Deploy Client

```bash
# Update ConfigMap with your API URL
kubectl apply -f client/configmap.yaml

# Deploy client
kubectl apply -f client/deployment.yaml
kubectl apply -f client/service.yaml
kubectl apply -f client/ingress.yaml
```

## Configuration

### Environment Variables

Update the following before deployment:

1. **Server Secrets** (`server/secret.yaml.example`):
   - MongoDB connection string
   - JWT secret
   - SMTP credentials

2. **Client ConfigMap** (`client/configmap.yaml`):
   - API base URL

3. **Ingress Hosts**:
   - Update hostnames in `client/ingress.yaml` and `monitoring/ingress.yaml`

### Storage

Persistent volumes are configured for:
- Server uploads (10Gi)
- Server backups (20Gi)
- Prometheus data (50Gi)
- Grafana data (10Gi)

Ensure your cluster has a default StorageClass configured.

## Scaling

### Horizontal Pod Autoscaler

The server deployment includes HPA configuration:
- Min replicas: 2
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

To scale manually:
```bash
kubectl scale deployment iitd-server --replicas=5
```

## Monitoring

### Access Dashboards

- **Prometheus**: `http://monitoring.example.com/prometheus`
- **Grafana**: `http://monitoring.example.com/grafana`
  - Default credentials: admin / admin123 (change in secret)

### Metrics

Prometheus automatically scrapes:
- Kubernetes API server
- Kubernetes nodes
- Pods with `prometheus.io/scrape: "true"` annotation
- IITD server pods

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -A
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check Services

```bash
kubectl get svc
kubectl describe svc <service-name>
```

### Check Ingress

```bash
kubectl get ingress
kubectl describe ingress <ingress-name>
```

### Port Forward for Local Access

```bash
# Server
kubectl port-forward svc/iitd-server-service 3000:3000

# Prometheus
kubectl port-forward svc/prometheus-service 9090:9090 -n monitoring

# Grafana
kubectl port-forward svc/grafana-service 3000:3000 -n monitoring
```

## Production Considerations

1. **Secrets Management**: Use external secret management (AWS Secrets Manager, HashiCorp Vault)
2. **TLS**: Configure cert-manager for automatic certificate management
3. **Resource Limits**: Adjust based on your workload
4. **Backup**: Configure backups for persistent volumes
5. **Network Policies**: Implement network policies for security
6. **Pod Security**: Use Pod Security Standards
7. **Monitoring**: Set up alerting rules in Prometheus
8. **Logging**: Consider adding a logging stack (ELK, Loki)

## Cleanup

To remove all resources:

```bash
kubectl delete -f client/
kubectl delete -f server/
kubectl delete -f monitoring/
```


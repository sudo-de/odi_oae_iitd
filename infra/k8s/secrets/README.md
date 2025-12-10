# Kubernetes Secrets Management

This directory contains templates and documentation for managing secrets in Kubernetes.

## Secret Creation

Secrets should be created using GitHub Environment secrets and synced to Kubernetes using one of the following methods:

### Method 1: Using GitHub Actions (Recommended)

The GitHub Actions workflow will automatically create/update secrets in Kubernetes using the `MONGODB_URI` and other secrets from GitHub Environment secrets.

### Method 2: Manual Creation

Create secrets manually using kubectl:

```bash
kubectl create secret generic iitd-secrets \
  --from-literal=mongodb-uri='your-mongodb-connection-string' \
  --from-literal=jwt-secret='your-jwt-secret' \
  --from-literal=smtp-user='your-smtp-user' \
  --from-literal=smtp-pass='your-smtp-password' \
  -n iitd-production
```

### Method 3: Using Sealed Secrets or External Secrets Operator

For production environments, consider using:
- **Sealed Secrets**: Encrypt secrets that can be committed to Git
- **External Secrets Operator**: Sync secrets from external secret management systems (AWS Secrets Manager, HashiCorp Vault, etc.)

## Required Secrets

- `mongodb-uri`: MongoDB connection string
- `jwt-secret`: JWT signing secret
- `smtp-user`: SMTP username (optional)
- `smtp-pass`: SMTP password (optional)

## Secret Namespaces

- **Staging**: `iitd-staging`
- **Production**: `iitd-production`


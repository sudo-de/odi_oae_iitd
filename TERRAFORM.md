# Terraform Infrastructure as Code Guide

This guide explains how to use Terraform to provision and manage infrastructure for the IITD application.

## 📋 Prerequisites

- Terraform >= 1.0 installed
- Kubernetes cluster access configured
- `kubectl` configured
- Helm 3.x (for ArgoCD installation)

## 🏗️ Architecture

Terraform manages:
- Kubernetes namespace
- ArgoCD installation (optional)
- ArgoCD Application resources
- Infrastructure configuration

## 📁 Directory Structure

```
terraform/
├── main.tf              # Main Terraform configuration
├── variables.tf         # Variable definitions
├── outputs.tf           # Output values
├── argocd.tf            # ArgoCD resources
├── argocd-values.yaml   # ArgoCD Helm chart values
├── terraform.tfvars.example  # Example variables
└── .gitignore          # Ignore Terraform state files
```

## 🚀 Quick Start

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Configure Variables

Copy the example variables file and update with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
kubeconfig_path = "~/.kube/config"
namespace       = "iitd"
environment     = "staging"
domain          = "iitd.example.com"

git_repo_url = "https://github.com/your-username/iitd.git"
git_branch   = "main"

image_registry   = "ghcr.io"
image_repository = "your-username/iitd"
image_tag        = "latest"
```

### 3. Plan Changes

```bash
terraform plan
```

### 4. Apply Configuration

```bash
terraform apply
```

Type `yes` to confirm.

### 5. Verify

```bash
# Check namespace
kubectl get namespace iitd

# Check ArgoCD (if installed)
kubectl get pods -n argocd
```

## 🔧 Configuration

### Variables

Key variables in `variables.tf`:

| Variable | Description | Default |
|----------|-------------|---------|
| `kubeconfig_path` | Path to kubeconfig | `~/.kube/config` |
| `namespace` | Kubernetes namespace | `iitd` |
| `environment` | Environment name | `staging` |
| `domain` | Application domain | `iitd.example.com` |
| `git_repo_url` | Git repository URL | - |
| `git_branch` | Git branch for ArgoCD | `main` |

### Backend Configuration

For production, use remote state backend:

```hcl
# In main.tf
terraform {
  backend "s3" {
    bucket = "iitd-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}
```

Or use other backends:
- **Azure Storage**: `backend "azurerm"`
- **Google Cloud Storage**: `backend "gcs"`
- **Terraform Cloud**: `backend "remote"`

### Provider Configuration

#### Kubernetes Provider

Multiple configuration options:

**Option 1: Kubeconfig file**
```hcl
provider "kubernetes" {
  config_path = "~/.kube/config"
}
```

**Option 2: In-cluster config**
```hcl
provider "kubernetes" {
  config_context = "my-context"
}
```

**Option 3: Direct connection**
```hcl
provider "kubernetes" {
  host                   = "https://k8s.example.com"
  cluster_ca_certificate = base64decode(var.cluster_ca_cert)
  token                  = var.k8s_token
}
```

## 🔄 ArgoCD Installation

Terraform can install ArgoCD using Helm:

```bash
terraform apply -target=helm_release.argocd
```

### ArgoCD Configuration

Edit `argocd-values.yaml` to customize ArgoCD:

```yaml
server:
  service:
    type: LoadBalancer
  ingress:
    enabled: true
    hosts:
      - argocd.example.com
```

### Access ArgoCD

After installation:

```bash
# Get ArgoCD server URL
kubectl get svc argocd-server -n argocd

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

## 📊 Outputs

View Terraform outputs:

```bash
terraform output
```

Available outputs:
- `namespace`: Kubernetes namespace name
- `environment`: Environment name
- `argocd_namespace`: ArgoCD namespace
- `argocd_server_url`: ArgoCD server URL
- `application_url`: Application URL

## 🔄 State Management

### View State

```bash
terraform show
terraform state list
```

### Import Existing Resources

```bash
terraform import kubernetes_namespace.iitd iitd
```

### Remove Resources

```bash
terraform destroy
```

### State Locking

For team collaboration, use state locking:

```hcl
backend "s3" {
  bucket         = "iitd-terraform-state"
  key            = "terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "terraform-state-lock"
  encrypt        = true
}
```

## 🛠️ Advanced Usage

### Workspaces

Use workspaces for multiple environments:

```bash
# Create workspace
terraform workspace new staging
terraform workspace new production

# Switch workspace
terraform workspace select staging

# Use in configuration
resource "kubernetes_namespace" "iitd" {
  metadata {
    name = "iitd-${terraform.workspace}"
  }
}
```

### Modules

Create reusable modules:

```hcl
module "iitd_app" {
  source = "./modules/iitd-app"
  
  namespace   = var.namespace
  environment = var.environment
  domain      = var.domain
}
```

### Data Sources

Use data sources to fetch existing resources:

```hcl
data "kubernetes_secret" "existing_secret" {
  metadata {
    name      = "server-secrets"
    namespace = "iitd"
  }
}
```

## 🔒 Security

### Secrets Management

Never commit secrets to Terraform files. Use:

1. **Environment Variables**:
```bash
export TF_VAR_jwt_secret="your-secret"
```

2. **Secret Management Systems**:
   - HashiCorp Vault
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager

3. **Terraform Cloud Variables**:
   - Set as sensitive variables in Terraform Cloud

### Remote State Security

- Enable encryption at rest
- Use IAM/access controls
- Enable versioning
- Use state locking

## 🧪 Testing

### Validate Configuration

```bash
terraform validate
terraform fmt -check
```

### Plan Before Apply

Always review plan:

```bash
terraform plan -out=tfplan
terraform show tfplan
terraform apply tfplan
```

## 📚 Best Practices

1. **Version Control**: Commit Terraform files to Git
2. **State Management**: Use remote backend for production
3. **Modularity**: Break down into modules
4. **Documentation**: Document variables and outputs
5. **Testing**: Test in staging before production
6. **Backup**: Regularly backup Terraform state
7. **Review**: Code review Terraform changes

## 🐛 Troubleshooting

### Provider Errors

```bash
# Reinitialize providers
terraform init -upgrade
```

### State Lock Issues

```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

### Resource Conflicts

```bash
# Refresh state
terraform refresh

# Import existing resources
terraform import <resource> <id>
```

## 📖 Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [Kubernetes Provider](https://registry.terraform.io/providers/hashicorp/kubernetes)
- [Helm Provider](https://registry.terraform.io/providers/hashicorp/helm)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

## 🎯 Next Steps

1. ✅ Configure Terraform variables
2. ✅ Set up remote state backend
3. ✅ Initialize and plan
4. ✅ Apply infrastructure
5. ✅ Verify resources
6. ✅ Set up CI/CD integration


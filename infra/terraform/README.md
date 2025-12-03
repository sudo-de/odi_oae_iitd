# Terraform Infrastructure as Code

This directory contains Terraform configurations for provisioning AWS infrastructure for the IITD project.

## Structure

```
terraform/
├── main.tf              # Main Terraform configuration
├── variables.tf          # Variable definitions
├── outputs.tf           # Output values
├── modules/             # Reusable modules
│   ├── vpc/             # VPC module
│   ├── eks/             # EKS cluster module
│   └── database/        # Database module
└── README.md            # This file
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **Terraform** >= 1.0 installed
3. **kubectl** (for EKS cluster management)
4. **AWS IAM permissions** for creating VPC, EKS, RDS resources

## Setup

1. **Configure AWS credentials:**
   ```bash
   aws configure
   ```

2. **Create terraform.tfvars file:**
   ```hcl
   aws_region = "us-east-1"
   environment = "dev"
   project_name = "iitd"
   
   db_master_username = "admin"
   db_master_password = "your-secure-password"
   ```

3. **Initialize Terraform:**
   ```bash
   terraform init
   ```

4. **Plan the infrastructure:**
   ```bash
   terraform plan
   ```

5. **Apply the configuration:**
   ```bash
   terraform apply
   ```

## Modules

### VPC Module
Creates a VPC with:
- Public subnets (for load balancers, NAT gateways)
- Private subnets (for EKS nodes)
- Database subnets (for RDS instances)
- Internet Gateway and NAT Gateways
- Route tables and associations

### EKS Module
Creates an EKS cluster with:
- Managed Kubernetes control plane
- Node groups with auto-scaling
- IAM roles and policies
- CloudWatch logging

### Database Module
Creates RDS instance with:
- MySQL/PostgreSQL database
- Security groups
- Automated backups
- Performance insights (production)

## Variables

Key variables can be set in `terraform.tfvars`:

- `aws_region`: AWS region (default: us-east-1)
- `environment`: Environment name (dev/staging/prod)
- `vpc_cidr`: VPC CIDR block (default: 10.0.0.0/16)
- `eks_node_instance_types`: EKS node instance types
- `db_instance_class`: RDS instance class
- `db_master_password`: Database master password (sensitive)

## Outputs

After applying, Terraform outputs:
- VPC and subnet IDs
- EKS cluster endpoint and credentials
- Database endpoint and connection details

## State Management

Configure remote state backend in `main.tf`:

```hcl
backend "s3" {
  bucket = "your-terraform-state-bucket"
  key    = "iitd/terraform.tfstate"
  region = "us-east-1"
}
```

## Notes

- **Database**: Currently configured for MySQL/PostgreSQL via RDS. For MongoDB, consider:
  - AWS DocumentDB (MongoDB-compatible)
  - MongoDB Atlas (managed service)
  - Self-hosted MongoDB on EC2

- **Cost Optimization**: 
  - Use `single_nat_gateway = true` for dev environments
  - Use smaller instance types for non-production
  - Enable auto-scaling for EKS nodes

- **Security**:
  - Never commit `terraform.tfvars` with sensitive data
  - Use AWS Secrets Manager for database passwords
  - Enable encryption at rest for RDS

## Destroying Infrastructure

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all infrastructure including databases. Ensure backups are taken before destroying.


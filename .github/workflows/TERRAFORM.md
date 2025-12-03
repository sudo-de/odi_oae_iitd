# Terraform CI/CD Workflows

This document describes the Terraform workflows for infrastructure provisioning.

## Overview

The repository includes two Terraform workflows:

1. **Terraform Plan** (`terraform-plan.yml`): Validates and plans infrastructure changes
2. **Terraform Apply** (`terraform-apply.yml`): Applies infrastructure changes

## Workflow Details

### Terraform Plan (`terraform-plan.yml`)

**Triggers:**
- Pull requests to `main`/`master` when `infra/terraform/**` changes
- Pushes to `main`/`master` when `infra/terraform/**` changes
- Manual dispatch with environment selection

**Jobs:**
- **terraform-plan**: 
  - Runs `terraform fmt -check` for code formatting
  - Runs `terraform init` to initialize backend
  - Runs `terraform validate` to validate configuration
  - Runs `terraform plan` to show planned changes
  - Comments on PRs with plan output
  - Uploads plan artifacts for use in apply workflow

**Matrix Strategy:**
- Runs for `dev` and `staging` environments by default
- Can be customized via workflow dispatch

### Terraform Apply (`terraform-apply.yml`)

**Triggers:**
- After successful `Terraform Plan` workflow on `main`/`master`
- Manual dispatch with environment selection and auto-approve option

**Jobs:**
- **terraform-apply**:
  - Downloads plan artifacts from plan workflow
  - Runs `terraform init` to initialize backend
  - Runs `terraform apply` with the saved plan
  - Exports outputs as JSON artifacts
  - Updates Kubernetes config if EKS cluster is created

**Safety Features:**
- Auto-approve only for `dev` environment or when explicitly enabled
- Requires manual approval for `staging` and `prod` environments
- Uses saved plan files to ensure apply matches plan

## Prerequisites

### Required Secrets

1. **AWS_ROLE_TO_ASSUME** (Recommended): IAM role ARN for OIDC authentication
   ```bash
   # Example: arn:aws:iam::123456789012:role/github-actions-terraform
   ```

2. **AWS_ACCESS_KEY_ID** & **AWS_SECRET_ACCESS_KEY** (Alternative):
   - AWS access key ID
   - AWS secret access key
   - Less secure than OIDC, use only if OIDC is not available

3. **TF_STATE_BUCKET**: S3 bucket name for Terraform state
   ```bash
   # Example: my-terraform-state-bucket
   ```

4. **DB_MASTER_USERNAME**: Database master username
   ```bash
   # Example: admin
   ```

5. **DB_MASTER_PASSWORD**: Database master password (sensitive)
   ```bash
   # Use a strong, unique password
   ```

### Required IAM Permissions

The AWS role/user needs permissions for:
- VPC creation and management
- EKS cluster creation and management
- RDS/DocumentDB creation and management
- S3 bucket access (for state backend)
- EC2, IAM, Security Groups, etc.

Example IAM policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "eks:*",
        "rds:*",
        "iam:*",
        "s3:*",
        "logs:*",
        "cloudwatch:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Setup Steps

1. **Create S3 Bucket for Terraform State:**
   ```bash
   aws s3 mb s3://your-terraform-state-bucket --region us-east-1
   aws s3api put-bucket-versioning \
     --bucket your-terraform-state-bucket \
     --versioning-configuration Status=Enabled
   ```

2. **Configure GitHub Secrets:**
   - Go to repository → Settings → Secrets and variables → Actions
   - Add all required secrets listed above

3. **Set up OIDC Provider (Recommended):**
   ```bash
   # Create OIDC provider for GitHub Actions
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   
   # Create IAM role with trust policy for GitHub Actions
   # See AWS documentation for detailed steps
   ```

4. **Create terraform.tfvars (Local Development):**
   ```bash
   cd infra/terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   ```

## Usage

### Running Plan Manually

1. Go to Actions → Terraform Plan → Run workflow
2. Select environment (dev, staging, prod)
3. Click "Run workflow"

### Running Apply Manually

1. Go to Actions → Terraform Apply → Run workflow
2. Select environment
3. Choose auto-approve (only for dev, use with caution)
4. Click "Run workflow"

### Local Development

```bash
cd infra/terraform

# Initialize Terraform
terraform init

# Plan changes
terraform plan -var="environment=dev"

# Apply changes (with confirmation)
terraform apply -var="environment=dev"

# Destroy infrastructure
terraform destroy -var="environment=dev"
```

## Workflow Behavior

### Plan Workflow

- **On PR**: Comments on PR with plan output
- **On Push**: Runs plan but doesn't apply
- **Manual**: Runs plan for selected environment

### Apply Workflow

- **After Plan**: Only runs if plan succeeded
- **Dev Environment**: Auto-approves by default
- **Staging/Prod**: Requires manual approval or `auto_approve=true`
- **Manual**: Can select environment and auto-approve option

## State Management

### Backend Configuration

The workflows support both:
1. **S3 Backend** (Recommended for production):
   - Configured via `TF_STATE_BUCKET` secret
   - State stored in: `s3://bucket/iitd/{environment}/terraform.tfstate`

2. **Local Backend** (Fallback):
   - Used if S3 backend is not configured
   - State stored locally (not recommended for team use)

### State Locking

For S3 backend, enable DynamoDB for state locking:
```bash
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

Then update `main.tf` backend configuration:
```hcl
backend "s3" {
  bucket         = "your-terraform-state-bucket"
  key            = "iitd/terraform.tfstate"
  region         = "us-east-1"
  dynamodb_table = "terraform-state-lock"
  encrypt        = true
}
```

## Security Best Practices

1. **Never commit `terraform.tfvars`** - Contains sensitive data
2. **Use OIDC** instead of access keys when possible
3. **Enable state encryption** in S3 backend
4. **Use separate state files** per environment
5. **Limit IAM permissions** to minimum required
6. **Use secrets manager** for sensitive values in production
7. **Enable MFA** for production applies
8. **Review plans** before applying to production

## Troubleshooting

### Plan Fails with "Backend configuration changed"
- Ensure `TF_STATE_BUCKET` secret is set correctly
- Check S3 bucket exists and is accessible
- Verify IAM permissions for S3 access

### Apply Fails with "State locked"
- Another apply is running
- Check for stale locks in DynamoDB (if using)
- Wait for previous workflow to complete

### AWS Credentials Error
- Verify `AWS_ROLE_TO_ASSUME` or access keys are correct
- Check IAM role trust policy (for OIDC)
- Verify region matches your resources

### Plan Shows Unexpected Changes
- Check if state file is out of sync
- Run `terraform refresh` locally to sync state
- Review recent manual changes to infrastructure

### Database Password Issues
- Ensure `DB_MASTER_PASSWORD` secret is set
- Password must meet RDS requirements (8+ chars, mixed case, numbers)
- Check if password contains special characters that need escaping

## Outputs

After successful apply, outputs are available:
- In workflow artifacts (JSON format)
- Via `terraform output` command locally
- In Terraform Cloud/Enterprise UI (if using)

Key outputs include:
- VPC and subnet IDs
- EKS cluster endpoint and credentials
- Database endpoint and connection details

## Cost Optimization

1. **Use `single_nat_gateway = true`** for dev environments
2. **Use smaller instance types** for non-production
3. **Enable auto-scaling** for EKS nodes
4. **Use spot instances** for EKS nodes (dev only)
5. **Schedule resources** to stop during off-hours (dev)

## Next Steps

1. Set up S3 backend for state management
2. Configure OIDC provider for secure AWS access
3. Create separate environments (dev, staging, prod)
4. Set up monitoring and alerting for infrastructure
5. Document infrastructure architecture and decisions


# GitHub Actions Workflows

This directory contains CI/CD workflows for automated testing, building, and deployment.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Client CI:** Lint, build, and test React client
- **Server CI:** Lint, build, and test NestJS server
- **Docker Build Test:** Test Docker image builds

**Artifacts:**
- Client test results
- Playwright reports
- Test coverage reports

### 2. CD Workflow (`cd.yml`)

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**
- **Build and Push:** Builds and pushes Docker images to GitHub Container Registry
- **Deploy Staging:** Deploys to staging environment
- **Deploy Production:** Deploys to production environment (requires approval)
- **Health Check:** Verifies deployments are healthy

**Environments:**
- `staging`: Auto-deploys on push to main
- `production`: Requires manual approval

### 3. Docker Compose Deploy (`docker-compose-deploy.yml`)

**Triggers:**
- Manual workflow dispatch only

**Purpose:**
- Deploys using Docker Compose via SSH
- Suitable for self-hosted servers

**Requirements:**
- SSH access to server
- Docker and Docker Compose installed on server
- Environment secrets configured

## Usage

### Run CI on Pull Request

CI automatically runs on every pull request. No action needed.

### Deploy to Staging

Staging automatically deploys when code is pushed to `main` branch.

### Deploy to Production

**Option 1: Automatic (after approval)**
- Push to `main` branch
- Wait for approval (if protection rules enabled)
- Deployment proceeds automatically

**Option 2: Manual**
1. Go to **Actions** → **CD**
2. Click **Run workflow**
3. Select environment: `production`
4. Click **Run workflow**

**Option 3: Docker Compose Deploy**
1. Go to **Actions** → **Docker Compose Deploy**
2. Click **Run workflow**
3. Select environment: `staging` or `production`
4. Click **Run workflow**

## Environment Setup

See [ENVIRONMENTS.md](../ENVIRONMENTS.md) for detailed environment configuration.

## Secrets Required

### For All Environments
- `GITHUB_TOKEN` (automatically provided)

### For SSH Deployment
- `SSH_PRIVATE_KEY`: SSH private key for server access
- `SSH_HOST`: Server IP or domain
- `SSH_USER`: SSH username

## Container Registry

Images are pushed to GitHub Container Registry:
- `ghcr.io/YOUR_USERNAME/YOUR_REPO-client:latest`
- `ghcr.io/YOUR_USERNAME/YOUR_REPO-server:latest`

To pull images:
```bash
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO-client:latest
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO-server:latest
```

## Workflow Status Badges

Add to your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
![CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CD/badge.svg)
```

## Troubleshooting

### Workflow Fails

1. Check workflow logs in **Actions** tab
2. Verify all required secrets are set
3. Check environment configuration
4. Verify Docker images build successfully

### Deployment Fails

1. Check SSH connection
2. Verify server has Docker installed
3. Check server disk space
4. Review deployment logs

### Tests Fail

1. Check test output in workflow logs
2. Verify test environment variables
3. Check MongoDB connection in integration tests
4. Review test artifacts

## Customization

### Add More Environments

1. Create new environment in GitHub Settings
2. Add deployment job in `cd.yml`
3. Configure environment-specific variables

### Change Build Commands

Edit the workflow files:
- `ci.yml`: Modify build/test steps
- `cd.yml`: Modify build/push steps

### Add Notifications

Add notification steps to workflows:
```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment failed!'
```

## Best Practices

1. **Always test in staging first**
2. **Use environment protection rules for production**
3. **Review workflow logs after each deployment**
4. **Keep secrets secure and rotate regularly**
5. **Monitor deployment health checks**
6. **Use semantic versioning for releases**


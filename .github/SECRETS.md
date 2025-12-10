# GitHub Actions Secrets and Variables

This document describes the required and optional secrets and variables for GitHub Actions workflows.

## Required Secrets

### Docker Registry Authentication

The workflows support two Docker registries:

#### Option 1: Docker Hub (Recommended for public images)
- **`DOCKER_USERNAME`**: Your Docker Hub username
- **`DOCKER_PASSWORD`**: Your Docker Hub password or access token

**To set up:**
1. Go to repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add `DOCKER_USERNAME` with your Docker Hub username
4. Add `DOCKER_PASSWORD` with your Docker Hub password/token

**Note:** If these secrets are set, workflows will push to Docker Hub. Otherwise, they will use GitHub Container Registry (ghcr.io).

#### Option 2: GitHub Container Registry (Default)
- Uses `GITHUB_TOKEN` automatically (no setup needed)
- Images will be pushed to `ghcr.io/${{ github.repository }}/server`

## Optional Secrets

### Deployment Secrets

These are only needed if you configure deployment steps:

- **`DEPLOYMENT_URL`**: Production deployment URL (e.g., `https://api.iitd.example.com`)
- **`KUBECONFIG`**: Kubernetes configuration for deployments
- **`SSH_PRIVATE_KEY`**: SSH key for server deployments
- **`SERVER_HOST`**: Deployment server hostname/IP
- **`SERVER_USER`**: SSH username for deployment

### Email Configuration (for server)

These can be set as secrets or environment variables:

- **`SMTP_HOST`**: SMTP server hostname (default: `smtp.gmail.com`)
- **`SMTP_PORT`**: SMTP server port (default: `587`)
- **`SMTP_USER`**: SMTP username/email
- **`SMTP_PASS`**: SMTP password/app password
- **`SMTP_FROM`**: From email address

### Application Secrets

- **`JWT_SECRET`**: Secret key for JWT token signing (should be strong and random)
- **`MONGODB_URI`**: MongoDB connection string
  - **For CI/CD tests**: Uses MongoDB service container by default (`mongodb://localhost:27017/iitd-db-test`)
  - **For Docker deployments**: Can be set as secret/environment variable to use external MongoDB
  - **Default in docker-compose**: `mongodb://mongodb:27017/iitd-db` (uses local MongoDB service)
  - **Format examples**:
    - Docker Compose: `mongodb://mongodb:27017/iitd-db`
    - External MongoDB: `mongodb://username:password@host:port/database`
    - MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database`

## Repository Variables

Variables are plain text and can be used for non-sensitive configuration:

### Docker Configuration
- **`DOCKER_REGISTRY`**: Override default registry (default: `docker.io` or `ghcr.io`)
- **`DOCKER_IMAGE_NAME`**: Override default image name

### Build Configuration
- **`NODE_VERSION`**: Node.js version (default: `20`)
- **`BUILD_PLATFORMS`**: Docker build platforms (default: `linux/amd64,linux/arm64`)

## Environment-Specific Secrets

You can configure secrets per environment (e.g., `production`, `staging`):

1. Go to Settings > Environments
2. Create or select an environment
3. Add environment-specific secrets

**Example environments:**
- `production`: Production deployment secrets
- `staging`: Staging deployment secrets
- `development`: Development environment secrets

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use environment secrets** for environment-specific values
3. **Rotate secrets regularly**, especially after team member changes
4. **Use least privilege**: Only grant necessary permissions
5. **Use access tokens** instead of passwords when possible
6. **Review secret usage** regularly in Actions logs

## Setting Up Secrets

### Via GitHub Web Interface

1. Navigate to your repository
2. Go to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

### Via GitHub CLI

```bash
# Set a secret
gh secret set DOCKER_USERNAME --body "your-username"

# List secrets
gh secret list

# Delete a secret
gh secret delete DOCKER_USERNAME
```

## Workflow Behavior

### With Docker Hub Secrets
- Images pushed to: `docker.io/$DOCKER_USERNAME/iitd-server`
- Tags: `latest`, `main`, `develop`, `sha-{commit}`, etc.

### Without Docker Hub Secrets (Default)
- Images pushed to: `ghcr.io/${{ github.repository }}/server`
- Uses GitHub Container Registry
- Requires no additional setup

## Testing Secrets

To verify secrets are configured correctly:

1. Create a test workflow that echoes secret names (not values)
2. Check workflow logs to ensure secrets are accessible
3. Verify Docker login succeeds in workflow logs

## Troubleshooting

### Docker Login Fails
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` are set correctly
- Check if Docker Hub account has 2FA enabled (use access token instead)
- Ensure secrets are repository secrets, not environment secrets (unless using environment)

### Images Not Pushing
- Check workflow permissions (needs `packages: write` for ghcr.io)
- Verify registry URL is correct
- Check Docker Buildx setup

### Secrets Not Available
- Secrets are not available in PRs from forks (security feature)
- Ensure secrets are set at repository level, not organization level
- Check if workflow has correct permissions

## Example Configuration

### Minimal Setup (GitHub Container Registry)
No secrets needed! Works out of the box.

### Docker Hub Setup
1. Add `DOCKER_USERNAME` secret: `your-dockerhub-username`
2. Add `DOCKER_PASSWORD` secret: `your-dockerhub-token`
3. Workflows will automatically use Docker Hub

### Full Production Setup
1. Docker Hub secrets (as above)
2. `JWT_SECRET`: Strong random string
3. `SMTP_USER` and `SMTP_PASS`: Email credentials
4. `DEPLOYMENT_URL`: Production API URL
5. Environment secrets for production deployment


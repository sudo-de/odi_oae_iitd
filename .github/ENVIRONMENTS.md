# GitHub Environments Setup Guide

This guide explains how to configure GitHub Environments for your CI/CD pipeline without using cloud services.

## ⚠️ Important: Use GitHub Environments, Not .env Files

**DO NOT commit `.env` or `.env.example` files to Git!**

- ✅ **Use GitHub Environments** for all secrets and environment variables
- ✅ **Use `.env` files locally** for development only (already in `.gitignore`)
- ❌ **Never commit** `.env` files to the repository
- ❌ **Never create** `.env.example` files (use this documentation instead)

All environment variables should be stored in GitHub Environments, not in files.

## Overview

GitHub Environments allow you to:
- Configure environment-specific secrets and variables securely
- Set deployment protection rules
- Track deployment history
- Control who can deploy to which environment
- Keep secrets out of your codebase

## Setting Up Environments

### 1. Create Environments in GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Environments**
3. Click **New environment**
4. Create the following environments:
   - `staging`
   - `production`

### 2. Configure Staging Environment

**Environment Name:** `staging`

**Environment Variables:**
- `NODE_ENV`: `staging`
- `PORT`: `3000`
- `MONGODB_URI`: `mongodb://your-mongodb-host:27017/iitd-db-staging`
- `JWT_SECRET`: `your-staging-jwt-secret`
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_SECURE`: `false`
- `SMTP_USER`: `your-staging-email@example.com`
- `SMTP_PASS`: `your-staging-email-password`

**Secrets:**
- `SSH_PRIVATE_KEY`: Your SSH private key for server access
- `SSH_HOST`: Your server IP or domain
- `SSH_USER`: SSH username (e.g., `ubuntu`, `root`)

**Deployment Branches:**
- Allow deployments from: `develop` branch

**Protection Rules (Optional):**
- Required reviewers: Add team members who must approve staging deployments
- Wait timer: 0 minutes (or set as needed)

### 3. Configure Production Environment

**Environment Name:** `production`

**Environment Variables:**
- `NODE_ENV`: `production`
- `PORT`: `3000`
- `MONGODB_URI`: `mongodb://your-mongodb-host:27017/iitd-db`
- `JWT_SECRET`: `your-production-jwt-secret` (use a strong, unique secret)
- `SMTP_HOST`: `smtp.gmail.com`
- `SMTP_PORT`: `587`
- `SMTP_SECURE`: `false`
- `SMTP_USER`: `your-production-email@example.com`
- `SMTP_PASS`: `your-production-email-password`

**Secrets:**
- `SSH_PRIVATE_KEY`: Your SSH private key for production server access
- `SSH_HOST`: Your production server IP or domain
- `SSH_USER`: SSH username

**Deployment Branches:**
- Allow deployments from: `main` branch only

**Protection Rules (Recommended):**
- Required reviewers: Add team members who must approve production deployments
- Wait timer: 5 minutes (gives time to cancel if needed)

## Deployment Options

### Option 1: Self-Hosted Runner (Recommended)

If you have a server, you can use a self-hosted GitHub Actions runner:

1. **Install Runner on Your Server:**
   ```bash
   # Download and install runner
   mkdir actions-runner && cd actions-runner
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   
   # Configure runner
   ./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN
   
   # Install as service
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

2. **Update Workflows:**
   Change `runs-on: ubuntu-latest` to `runs-on: self-hosted` in your workflow files.

### Option 2: SSH Deployment

Use the `docker-compose-deploy.yml` workflow which uses SSH to deploy:

1. **Generate SSH Key Pair:**
   ```bash
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
   ```

2. **Add Public Key to Server:**
   ```bash
   ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server
   ```

3. **Add Private Key to GitHub Secrets:**
   - Copy the private key content
   - Add it as `SSH_PRIVATE_KEY` secret in your environment

### Option 3: Manual Deployment

You can manually trigger deployments using the workflow dispatch:

1. Go to **Actions** → **Docker Compose Deploy**
2. Click **Run workflow**
3. Select the environment
4. Click **Run workflow**

## Environment Variables Reference

### Server Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production`, `staging`, `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/iitd-db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_SECURE` | Use TLS/SSL | `false` or `true` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password | `your-app-password` |

## Testing Environments

### Test Staging Deployment

```bash
# Trigger staging deployment
gh workflow run docker-compose-deploy.yml -f environment=staging
```

### Test Production Deployment

```bash
# Trigger production deployment (requires approval)
gh workflow run docker-compose-deploy.yml -f environment=production
```

## Monitoring Deployments

1. Go to **Environments** in your repository
2. Click on an environment to see:
   - Deployment history
   - Current deployment status
   - Environment variables (names only, not values)

## Troubleshooting

### Deployment Fails

1. Check workflow logs in **Actions** tab
2. Verify SSH connection: `ssh -i ~/.ssh/github_actions user@server`
3. Check Docker on server: `docker ps`
4. Verify environment variables are set correctly

### Cannot Connect to Server

1. Verify `SSH_HOST` and `SSH_USER` are correct
2. Check SSH key permissions: `chmod 600 ~/.ssh/github_actions`
3. Test SSH connection manually
4. Check firewall rules on server

### Docker Images Not Found

1. Ensure images are pushed to GitHub Container Registry
2. Check registry permissions
3. Verify image tags in workflow

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Use strong JWT secrets** (generate with: `openssl rand -base64 32`)
3. **Rotate secrets regularly**
4. **Use different secrets** for staging and production
5. **Limit environment access** to authorized team members
6. **Enable deployment protection rules** for production
7. **Review deployment logs** regularly

## Next Steps

1. Set up your environments in GitHub
2. Configure environment variables and secrets
3. Test staging deployment
4. Set up production with protection rules
5. Monitor first few deployments closely


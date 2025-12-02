# Environment Variables Setup Guide

## ⚠️ Security Best Practice

**DO NOT commit `.env` or `.env.example` files to Git!**

All environment variables should be managed through:
- ✅ **GitHub Environments** (for CI/CD and production)
- ✅ **Local `.env` files** (for development only, already in `.gitignore`)

## 📋 Environment Variable Management

### For Local Development

Create a `.env` file locally (this file is already in `.gitignore`):

**Location**: `/server/.env` or root `.env`

```env
# Server Configuration
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/iitd-db

# JWT Authentication
JWT_SECRET=your-local-development-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Important**: 
- This file is for **local development only**
- It's already in `.gitignore` and will **never** be committed
- Use different values for each developer

### For CI/CD and Production

**Use GitHub Environments** - See [.github/ENVIRONMENTS.md](.github/ENVIRONMENTS.md)

1. Go to your repository → **Settings** → **Environments**
2. Create `staging` and `production` environments
3. Add all environment variables and secrets there
4. GitHub Actions will automatically use these during deployment

### For Kubernetes

**Use Kubernetes Secrets and ConfigMaps** - See [KUBERNETES.md](KUBERNETES.md)

```bash
# Create secrets
kubectl create secret generic server-secrets \
  --from-literal=JWT_SECRET='your-secret' \
  --from-literal=SMTP_USER='email@gmail.com' \
  --from-literal=SMTP_PASS='password' \
  -n iitd
```

## 🔒 Security Checklist

- ✅ `.env` files are in `.gitignore`
- ✅ No `.env.example` files in repository
- ✅ Production secrets in GitHub Environments
- ✅ Kubernetes secrets for K8s deployments
- ✅ Never commit secrets to Git
- ✅ Use different secrets for each environment

## 📚 Required Environment Variables

### Server Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment | `production`, `staging`, `development` | Yes |
| `PORT` | Server port | `3000` | Yes |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/iitd-db` | Yes |
| `JWT_SECRET` | JWT token secret | `your-secret-key` | Yes |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` | Yes |
| `SMTP_PORT` | SMTP port | `587` | Yes |
| `SMTP_SECURE` | Use TLS | `false` or `true` | Yes |
| `SMTP_USER` | SMTP username | `email@gmail.com` | Yes |
| `SMTP_PASS` | SMTP password | `app-password` | Yes |

## 🚀 Quick Setup

### Local Development
```bash
# Create .env file (already in .gitignore)
cat > server/.env << EOF
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/iitd-db
JWT_SECRET=local-dev-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF
```

### GitHub Environments
1. Go to repository → Settings → Environments
2. Add variables for `staging` and `production`
3. See [.github/ENVIRONMENTS.md](.github/ENVIRONMENTS.md) for details

### Kubernetes
```bash
kubectl create secret generic server-secrets \
  --from-literal=JWT_SECRET='secret' \
  --from-literal=SMTP_USER='user' \
  --from-literal=SMTP_PASS='pass' \
  -n iitd
```

## ❓ FAQ

**Q: Should I create `.env.example`?**  
A: No! Use GitHub Environments for production. For local dev, create your own `.env` file (it's in `.gitignore`).

**Q: Where do I put production secrets?**  
A: GitHub Environments (Settings → Environments → production)

**Q: Can I commit `.env` files?**  
A: No! They're in `.gitignore` for security reasons.

**Q: How do I share env vars with my team?**  
A: Use GitHub Environments or document them in a secure password manager.

## 📖 Related Documentation

- [.github/ENVIRONMENTS.md](.github/ENVIRONMENTS.md) - GitHub Environments setup
- [KUBERNETES.md](KUBERNETES.md) - Kubernetes secrets
- [DOCKER.md](DOCKER.md) - Docker environment variables


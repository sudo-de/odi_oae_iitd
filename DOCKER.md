# Docker Setup Guide

This guide explains how to use Docker and Docker Compose for local development and deployment.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Local Development

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes:**
   ```bash
   docker-compose down -v
   ```

## Services

### MongoDB
- **Port:** 27017
- **Database:** iitd-db
- **Data:** Persisted in `mongodb_data` volume

### Server (NestJS)
- **Port:** 3000
- **Health Check:** http://localhost:3000/health
- **API:** http://localhost:3000/api

### Client (React)
- **Port:** 80
- **URL:** http://localhost
- **Health Check:** http://localhost/health

## Environment Variables

### For Local Development

Create a `.env` file in the root directory (for local development only):

```env
# Server Configuration
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/iitd-db
JWT_SECRET=your-secret-key-change-in-production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**⚠️ Important**: 
- `.env` files are in `.gitignore` and should **NEVER** be committed
- For production/staging, use **GitHub Environments** (see [.github/ENVIRONMENTS.md](.github/ENVIRONMENTS.md))
- Never create `.env.example` files - use GitHub Environments instead

## Building Images

### Build Client Image
```bash
cd client
docker build -t iitd-client:latest .
```

### Build Server Image
```bash
cd server
docker build -t iitd-server:latest .
```

### Build All Images
```bash
docker-compose build
```

### Build Without Cache
```bash
docker-compose build --no-cache
```

## Running Individual Services

### Run Only MongoDB
```bash
docker-compose up mongodb
```

### Run Server Only
```bash
docker-compose up server
```

### Run Client Only
```bash
docker-compose up client
```

## Development Mode

For development with hot-reload, you can mount your source code:

```yaml
# In docker-compose.yml, the server service already has:
volumes:
  - ./server:/app
  - /app/node_modules
```

Then run:
```bash
docker-compose up server
```

## Production Build

### Build Production Images
```bash
docker-compose -f docker-compose.yml build
```

### Run Production
```bash
docker-compose up -d
```

## Health Checks

All services include health checks:

```bash
# Check all services
docker-compose ps

# Check server health
curl http://localhost:3000/health

# Check client health
curl http://localhost/health
```

## Database Management

### Access MongoDB Shell
```bash
docker-compose exec mongodb mongosh iitd-db
```

### Backup Database
```bash
docker-compose exec mongodb mongodump --out /data/backup
docker-compose cp mongodb:/data/backup ./backups/
```

### Restore Database
```bash
docker-compose cp ./backups/backup mongodb:/data/backup
docker-compose exec mongodb mongorestore /data/backup
```

## Logs

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb
```

### View Last 100 Lines
```bash
docker-compose logs --tail=100
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :80
lsof -i :27017

# Kill process
kill -9 <PID>
```

### Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Restart service
docker-compose restart <service-name>
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Clear Everything and Start Fresh
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Dockerfile Details

### Client Dockerfile
- **Base:** `node:20-alpine` (builder), `nginx:alpine` (production)
- **Build:** Multi-stage build for optimized image size
- **Output:** Static files served by Nginx

### Server Dockerfile
- **Base:** `node:20-alpine`
- **Build:** Multi-stage build (deps → builder → runner)
- **User:** Runs as non-root user (`nestjs`)
- **Health Check:** Built-in HTTP health check

## Image Sizes

After building:
- Client: ~50MB (nginx + static files)
- Server: ~150MB (node + dependencies)

## Security

1. **Non-root user:** Server runs as `nestjs` user
2. **Minimal base images:** Using Alpine Linux
3. **Health checks:** All services have health checks
4. **Secrets:** Use environment variables, never hardcode

## Performance Tips

1. **Use BuildKit:**
   ```bash
   DOCKER_BUILDKIT=1 docker-compose build
   ```

2. **Layer Caching:** Dependencies are cached separately from code

3. **Multi-stage Builds:** Only production dependencies in final image

## CI/CD Integration

Docker images are automatically built and pushed in CI/CD:
- **CI:** Builds and tests images
- **CD:** Pushes to GitHub Container Registry
- **Deploy:** Pulls and runs images on server

See `.github/workflows/` for workflow definitions.


# Docker Compose Setup

This directory contains Docker Compose configuration for running the IITD application stack locally.

## Services

- **server**: NestJS backend API server
- **mongodb**: MongoDB database (version 7)
- **mongo-express**: MongoDB web UI (optional, use `--profile tools` to enable)

## Prerequisites

- **Docker Desktop** installed and running
- Docker and Docker Compose installed
- Environment variables configured (see `.env.example`)

### Starting Docker Desktop

**macOS:**
```bash
# Open Docker Desktop application
open -a Docker

# Or check if Docker is running
docker ps
```

**Linux:**
```bash
# Start Docker daemon
sudo systemctl start docker
sudo systemctl enable docker
```

**Windows:**
- Open Docker Desktop from Start Menu
- Ensure Docker Desktop is running (check system tray)

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** with your configuration:
   - MongoDB credentials
   - JWT secret
   - SMTP credentials (for email functionality)

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f server
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

## Usage

### Start Services

```bash
# Start all services
docker-compose up -d

# Start with MongoDB Express (web UI)
docker-compose --profile tools up -d
```

### Access Services

- **API Server**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **MongoDB Express**: http://localhost:8081 (if enabled with `--profile tools`)

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secret-jwt-key

# SMTP (Gmail)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### Volumes

Data is persisted in Docker volumes:
- `mongodb_data`: MongoDB database files
- `server_uploads`: Server uploads directory
- `server_backups`: Server backups directory

### Commands

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (⚠️ deletes data)
docker-compose down -v

# Restart a service
docker-compose restart server

# Execute command in container
docker-compose exec server sh
docker-compose exec mongodb mongosh
```

### Health Checks

Both services have health checks configured:
- **Server**: Checks `/health` endpoint
- **MongoDB**: Checks database connectivity

### Troubleshooting

1. **Docker daemon not running:**
   ```bash
   # Error: Cannot connect to the Docker daemon
   # Solution: Start Docker Desktop
   
   # macOS
   open -a Docker
   
   # Linux
   sudo systemctl start docker
   
   # Verify Docker is running
   docker ps
   ```

2. **Port already in use:**
   - Change ports in `docker-compose.yaml` if 3000 or 27017 are in use
   - Check what's using the port: `lsof -i :3000` or `lsof -i :27017`

3. **MongoDB connection issues:**
   - Ensure MongoDB is healthy: `docker-compose ps`
   - Check MongoDB logs: `docker-compose logs mongodb`
   - Verify MongoDB connection string includes credentials

4. **Server not starting:**
   - Check server logs: `docker-compose logs server`
   - Verify environment variables are set correctly
   - Ensure MongoDB is running and healthy
   - Check if build context is correct (should be `../../server`)

5. **Build context errors:**
   - Ensure you're running commands from `infra/docker` directory
   - Verify `server/Dockerfile` exists relative to the build context

6. **Reset everything:**
   ```bash
   docker-compose down -v
   docker-compose up -d --build
   ```

## Production Considerations

For production deployment:
- Use secrets management (Docker secrets, AWS Secrets Manager, etc.)
- Enable MongoDB authentication properly
- Use external MongoDB service (MongoDB Atlas, DocumentDB)
- Configure proper backup strategies
- Set up monitoring and logging
- Use reverse proxy (nginx, Traefik) for SSL/TLS
- Configure resource limits


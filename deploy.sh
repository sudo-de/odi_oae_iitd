#!/bin/bash

# Deployment script for IITD project
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Deploying to $ENVIRONMENT environment..."

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install Docker Compose."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env.$ENVIRONMENT" ]; then
    echo "⚠️  Warning: .env.$ENVIRONMENT not found. Using default .env"
    if [ ! -f ".env" ]; then
        echo "❌ No .env file found. Please create one."
        exit 1
    fi
fi

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f $COMPOSE_FILE pull

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down

# Start containers
echo "▶️  Starting containers..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Health checks
echo "🏥 Running health checks..."

# Check server
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Server is healthy"
else
    echo "❌ Server health check failed"
    docker-compose -f $COMPOSE_FILE logs server
    exit 1
fi

# Check client
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Client is healthy"
else
    echo "❌ Client health check failed"
    docker-compose -f $COMPOSE_FILE logs client
    exit 1
fi

# Show status
echo ""
echo "📊 Container status:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "✅ Deployment to $ENVIRONMENT completed successfully!"
echo "🌐 Server: http://localhost:3000"
echo "🌐 Client: http://localhost"

